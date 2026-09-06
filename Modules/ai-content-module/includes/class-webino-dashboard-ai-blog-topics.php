<?php
/**
 * AI blog topic suggestions store and approve helpers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pending blog topic suggestions (option-backed).
 */
final class Webino_Dashboard_AI_Blog_Topics {

	const OPTION = 'webino_ai_blog_topics';

	/**
	 * @return list<array<string,mixed>>
	 */
	public static function all() {
		$raw = get_option( self::OPTION, array() );
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out = array();
		foreach ( $raw as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$item = self::normalize( $row );
			if ( $item ) {
				$out[] = $item;
			}
		}
		return $out;
	}

	/**
	 * @param string $status Filter status; empty or "all" = everything.
	 * @return array{items:list<array<string,mixed>>,total:int}
	 */
	public static function list_topics( $status = 'pending' ) {
		$status = sanitize_key( (string) $status );
		$items  = array();
		foreach ( self::all() as $row ) {
			if ( '' !== $status && 'all' !== $status && (string) $row['status'] !== $status ) {
				continue;
			}
			$items[] = $row;
		}
		return array(
			'items' => $items,
			'total' => count( $items ),
		);
	}

	/**
	 * @param string $id Topic id.
	 * @return array<string,mixed>|null
	 */
	public static function get( $id ) {
		$id = sanitize_text_field( (string) $id );
		foreach ( self::all() as $row ) {
			if ( (string) $row['id'] === $id ) {
				return $row;
			}
		}
		return null;
	}

	/**
	 * Replace pending items with new AI suggestions. Keeps queued/done/skipped.
	 *
	 * @param list<array<string,mixed>> $suggestions Raw AI rows.
	 * @return list<array<string,mixed>> New pending items.
	 */
	public static function replace_pending( $suggestions ) {
		$keep = array();
		foreach ( self::all() as $row ) {
			if ( in_array( (string) $row['status'], array( 'queued', 'done', 'skipped' ), true ) ) {
				$keep[] = $row;
			}
		}

		$new = array();
		foreach ( (array) $suggestions as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$topic = sanitize_text_field( (string) ( $row['topic'] ?? '' ) );
			if ( '' === $topic ) {
				continue;
			}
			$cat_name = sanitize_text_field( (string) ( $row['category_name'] ?? '' ) );
			$new[]    = self::normalize(
				array(
					'id'             => self::new_id(),
					'topic'          => $topic,
					'focus_keyword'  => sanitize_text_field( (string) ( $row['focus_keyword'] ?? $topic ) ),
					'angle'          => sanitize_textarea_field( (string) ( $row['angle'] ?? '' ) ),
					'category_name'  => $cat_name,
					'category_id'    => self::resolve_category_id( $cat_name ),
					'status'         => 'pending',
					'job_id'         => 0,
					'post_id'        => 0,
					'created_at'     => current_time( 'mysql', true ),
					'updated_at'     => current_time( 'mysql', true ),
				)
			);
		}

		self::save( array_merge( $keep, $new ) );
		return $new;
	}

	/**
	 * @param string               $id Topic id.
	 * @param array<string,mixed>  $fields Editable fields.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function approve( $id, $fields = array() ) {
		$row = self::get( $id );
		if ( ! $row ) {
			return new WP_Error( 'ai_blog_topic', __( 'Topic not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( 'pending' !== (string) $row['status'] ) {
			return new WP_Error( 'ai_blog_topic', __( 'Topic is not pending.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$ready = Webino_Dashboard_AI_Content_Settings::assert_entity( 'blog' );
		if ( is_wp_error( $ready ) ) {
			return $ready;
		}

		if ( isset( $fields['topic'] ) ) {
			$row['topic'] = sanitize_text_field( (string) $fields['topic'] );
		}
		if ( isset( $fields['focus_keyword'] ) ) {
			$row['focus_keyword'] = sanitize_text_field( (string) $fields['focus_keyword'] );
		}
		if ( isset( $fields['angle'] ) ) {
			$row['angle'] = sanitize_textarea_field( (string) $fields['angle'] );
		}
		if ( isset( $fields['category_id'] ) ) {
			$row['category_id'] = max( 0, (int) $fields['category_id'] );
		}
		if ( isset( $fields['category_name'] ) ) {
			$row['category_name'] = sanitize_text_field( (string) $fields['category_name'] );
			if ( empty( $row['category_id'] ) && '' !== $row['category_name'] ) {
				$row['category_id'] = self::resolve_category_id( $row['category_name'] );
			}
		}

		if ( '' === trim( (string) $row['topic'] ) ) {
			return new WP_Error( 'ai_blog_topic', __( 'Topic is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( '' === trim( (string) $row['focus_keyword'] ) ) {
			$row['focus_keyword'] = $row['topic'];
		}

		$payload = array(
			'topic'         => (string) $row['topic'],
			'focus_keyword' => (string) $row['focus_keyword'],
			'category_id'   => (int) $row['category_id'],
			'category'      => (string) $row['category_name'],
			'topic_id'      => (string) $row['id'],
		);
		if ( '' !== (string) $row['angle'] ) {
			$payload['regenerate_hint'] = 'Angle: ' . (string) $row['angle'];
		}

		$job_id = Webino_Dashboard_AI_Queue::enqueue( 'blog_write', 'blog_topic', 0, $payload );
		if ( is_wp_error( $job_id ) ) {
			return $job_id;
		}

		$row['status']     = 'queued';
		$row['job_id']     = (int) $job_id;
		$row['updated_at'] = current_time( 'mysql', true );
		self::upsert( $row );

		return $row;
	}

	/**
	 * @param list<string>         $ids Topic ids.
	 * @param array<string,mixed>  $edits Map id => fields.
	 * @return array{ok:bool,approved:int,failed:int,items:list<array>}
	 */
	public static function approve_many( $ids, $edits = array() ) {
		$approved = 0;
		$failed   = 0;
		$items    = array();
		foreach ( (array) $ids as $id ) {
			$fields = isset( $edits[ $id ] ) && is_array( $edits[ $id ] ) ? $edits[ $id ] : array();
			$res    = self::approve( (string) $id, $fields );
			if ( is_wp_error( $res ) ) {
				++$failed;
				continue;
			}
			++$approved;
			$items[] = $res;
		}
		return array(
			'ok'       => true,
			'approved' => $approved,
			'failed'   => $failed,
			'items'    => $items,
		);
	}

	/**
	 * @param string $id Topic id.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function skip( $id ) {
		$row = self::get( $id );
		if ( ! $row ) {
			return new WP_Error( 'ai_blog_topic', __( 'Topic not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( 'pending' !== (string) $row['status'] ) {
			return new WP_Error( 'ai_blog_topic', __( 'Only pending topics can be skipped.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$row['status']     = 'skipped';
		$row['updated_at'] = current_time( 'mysql', true );
		self::upsert( $row );
		return $row;
	}

	/**
	 * Mark topic done after blog_write finishes.
	 *
	 * @param string $topic_id Topic id.
	 * @param int    $post_id Post id.
	 * @param int    $job_id Job id.
	 * @return void
	 */
	public static function mark_done( $topic_id, $post_id, $job_id = 0 ) {
		$row = self::get( $topic_id );
		if ( ! $row ) {
			return;
		}
		$row['status']     = 'done';
		$row['post_id']    = (int) $post_id;
		if ( $job_id > 0 ) {
			$row['job_id'] = (int) $job_id;
		}
		$row['updated_at'] = current_time( 'mysql', true );
		self::upsert( $row );
	}

	/**
	 * Build context for AI suggest job.
	 *
	 * @param int $count How many topics.
	 * @return array<string,mixed>
	 */
	public static function suggest_context( $count = 8 ) {
		$count = min( 20, max( 1, (int) $count ) );
		$settings = Webino_Dashboard_AI_Content_Settings::get();

		$blog_cats = array();
		$terms     = get_terms( array( 'taxonomy' => 'category', 'hide_empty' => false, 'number' => 50 ) );
		if ( ! is_wp_error( $terms ) ) {
			foreach ( $terms as $t ) {
				$blog_cats[] = $t->name;
			}
		}

		$product_cats = array();
		if ( taxonomy_exists( 'product_cat' ) ) {
			$pcterms = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => false, 'number' => 40 ) );
			if ( ! is_wp_error( $pcterms ) ) {
				foreach ( $pcterms as $t ) {
					$product_cats[] = $t->name;
				}
			}
		}

		$recent_posts = array();
		$q            = new WP_Query(
			array(
				'post_type'      => 'post',
				'post_status'    => array( 'publish', 'draft', 'pending' ),
				'posts_per_page' => 20,
				'fields'         => 'ids',
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);
		foreach ( $q->posts as $pid ) {
			$recent_posts[] = get_the_title( (int) $pid );
		}

		$product_samples = array();
		if ( function_exists( 'wc_get_products' ) ) {
			$ids = wc_get_products( array( 'limit' => 12, 'status' => 'publish', 'return' => 'ids' ) );
			foreach ( (array) $ids as $id ) {
				$p = wc_get_product( (int) $id );
				if ( $p ) {
					$product_samples[] = $p->get_name();
				}
			}
		}

		return array(
			'count'           => $count,
			'site_topic'      => (string) ( $settings['site_topic'] ?? '' ),
			'site_name'       => Webino_Dashboard_AI_Content_Settings::resolved_site_name( $settings ),
			'blog_categories' => $blog_cats,
			'product_categories' => $product_cats,
			'recent_posts'    => $recent_posts,
			'product_samples' => $product_samples,
		);
	}

	/**
	 * @param string $name Category name.
	 * @return int
	 */
	public static function resolve_category_id( $name ) {
		$name = trim( (string) $name );
		if ( '' === $name ) {
			return 0;
		}
		$term = get_term_by( 'name', $name, 'category' );
		if ( $term && ! is_wp_error( $term ) ) {
			return (int) $term->term_id;
		}
		return 0;
	}

	/**
	 * @return string
	 */
	private static function new_id() {
		return 'bt_' . wp_generate_password( 12, false, false );
	}

	/**
	 * @param array<string,mixed> $row Row.
	 * @return array<string,mixed>|null
	 */
	private static function normalize( $row ) {
		$id = sanitize_text_field( (string) ( $row['id'] ?? '' ) );
		if ( '' === $id ) {
			return null;
		}
		$status = sanitize_key( (string) ( $row['status'] ?? 'pending' ) );
		if ( ! in_array( $status, array( 'pending', 'queued', 'done', 'skipped' ), true ) ) {
			$status = 'pending';
		}
		return array(
			'id'            => $id,
			'topic'         => sanitize_text_field( (string) ( $row['topic'] ?? '' ) ),
			'focus_keyword' => sanitize_text_field( (string) ( $row['focus_keyword'] ?? '' ) ),
			'angle'         => sanitize_textarea_field( (string) ( $row['angle'] ?? '' ) ),
			'category_name' => sanitize_text_field( (string) ( $row['category_name'] ?? '' ) ),
			'category_id'   => max( 0, (int) ( $row['category_id'] ?? 0 ) ),
			'status'        => $status,
			'job_id'        => max( 0, (int) ( $row['job_id'] ?? 0 ) ),
			'post_id'       => max( 0, (int) ( $row['post_id'] ?? 0 ) ),
			'created_at'    => (string) ( $row['created_at'] ?? '' ),
			'updated_at'    => (string) ( $row['updated_at'] ?? '' ),
			'edit_url'      => ! empty( $row['post_id'] ) ? (string) get_edit_post_link( (int) $row['post_id'], 'raw' ) : '',
			'view_url'      => ! empty( $row['post_id'] ) ? (string) get_permalink( (int) $row['post_id'] ) : '',
		);
	}

	/**
	 * @param array<string,mixed> $row Row.
	 * @return void
	 */
	private static function upsert( $row ) {
		$all = self::all();
		$found = false;
		foreach ( $all as $i => $existing ) {
			if ( (string) $existing['id'] === (string) $row['id'] ) {
				$all[ $i ] = self::normalize( $row );
				$found      = true;
				break;
			}
		}
		if ( ! $found ) {
			$all[] = self::normalize( $row );
		}
		self::save( $all );
	}

	/**
	 * @param list<array<string,mixed>> $rows Rows.
	 * @return void
	 */
	private static function save( $rows ) {
		$clean = array();
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$n = self::normalize( $row );
			if ( $n ) {
				// Persist without computed URLs.
				unset( $n['edit_url'], $n['view_url'] );
				$clean[] = $n;
			}
		}
		update_option( self::OPTION, $clean, false );
	}
}
