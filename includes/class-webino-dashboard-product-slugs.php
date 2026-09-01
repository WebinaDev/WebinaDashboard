<?php
/**
 * English product slugs + Rank Math 301 redirects.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Derive ASCII slug from iShop english_name and keep old URLs working via Rank Math.
 */
final class Webino_Dashboard_Product_Slugs {

	const HEAL_OPTION = 'webino_dashboard_product_redirects_healed';

	/**
	 * Wire runtime guards and one-shot heal after version bumps.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'maybe_heal_on_version_bump' ), 20 );
		add_filter( 'rank_math/redirection/pre_search', array( __CLASS__, 'pre_search_skip_live_product' ), 5, 3 );
		add_filter( 'wp_redirect', array( __CLASS__, 'abort_redirect_away_from_live_product' ), 0, 1 );
	}

	/**
	 * Build kebab slug from English product name (ASCII only).
	 *
	 * @param string $english English name.
	 * @return string
	 */
	public static function slug_from_english_name( $english ) {
		$english = trim( (string) $english );
		if ( '' === $english ) {
			return '';
		}
		// Drop non-Latin letters so Persian never leaks into slug.
		$ascii = preg_replace( '/[^\x20-\x7E]+/u', ' ', $english );
		$ascii = is_string( $ascii ) ? $ascii : $english;
		$slug  = sanitize_title( $ascii );
		$slug  = preg_replace( '/-+/', '-', (string) $slug );
		return trim( (string) $slug, '-' );
	}

	/**
	 * Normalize a path for comparisons (leading slash, no trailing slash).
	 *
	 * @param string $path Path or URI fragment.
	 * @return string
	 */
	public static function normalize_path( $path ) {
		$path = rawurldecode( (string) $path );
		$path = trim( $path );
		if ( '' === $path || '/' === $path ) {
			return '';
		}
		// Strip query/fragment if present.
		$parsed = wp_parse_url( $path, PHP_URL_PATH );
		if ( is_string( $parsed ) && '' !== $parsed ) {
			$path = $parsed;
		}
		$path = untrailingslashit( '/' . ltrim( $path, '/' ) );
		return $path;
	}

	/**
	 * Permalink path (no domain) for Rank Math source matching.
	 *
	 * @param int $product_id Product.
	 * @return string
	 */
	public static function permalink_path( $product_id ) {
		$url = get_permalink( (int) $product_id );
		if ( ! is_string( $url ) || '' === $url ) {
			return '';
		}
		$path = wp_parse_url( $url, PHP_URL_PATH );
		return is_string( $path ) ? self::normalize_path( $path ) : '';
	}

	/**
	 * True when path is the live permalink of a published product.
	 *
	 * @param string $path Absolute or site-relative path.
	 * @return bool
	 */
	public static function path_is_published_product( $path ) {
		$path = self::normalize_path( $path );
		if ( '' === $path ) {
			return false;
		}

		$url     = home_url( $path . '/' );
		$post_id = url_to_postid( $url );
		if ( ! $post_id ) {
			$post_id = url_to_postid( home_url( $path ) );
		}
		if ( ! $post_id ) {
			$slug = basename( $path );
			if ( '' !== $slug ) {
				$found = get_posts(
					array(
						'name'           => $slug,
						'post_type'      => 'product',
						'post_status'    => 'publish',
						'posts_per_page' => 1,
						'fields'         => 'ids',
						'no_found_rows'  => true,
					)
				);
				if ( ! empty( $found[0] ) ) {
					$live = self::permalink_path( (int) $found[0] );
					if ( $live === $path ) {
						return true;
					}
				}
			}
			return false;
		}
		if ( 'product' !== get_post_type( $post_id ) ) {
			return false;
		}
		return 'publish' === get_post_status( $post_id );
	}

	/**
	 * Rank Math URI form (no leading slash) → site path.
	 *
	 * @param string $uri Rank Math URI.
	 * @return string
	 */
	private static function uri_to_path( $uri ) {
		$uri = trim( (string) $uri );
		$uri = explode( '?', $uri, 2 )[0];
		return self::normalize_path( $uri );
	}

	/**
	 * When the request URI is a published product, stop Rank Math from matching.
	 *
	 * Rank Math only short-circuits pre_search when an array is returned; returning
	 * a self-target with no sources is unsafe. We return null and rely on
	 * abort_redirect_away_from_live_product() + heal to protect the URL.
	 * Returning false is treated as "no match" by some Rank Math builds.
	 *
	 * @param mixed  $pre      Previous filter value.
	 * @param string $uri      Path without query.
	 * @param string $full_uri Path with query.
	 * @return mixed
	 */
	public static function pre_search_skip_live_product( $pre, $uri = '', $full_uri = '' ) {
		unset( $full_uri );
		if ( null !== $pre && false !== $pre && is_array( $pre ) ) {
			return $pre;
		}
		$path = self::uri_to_path( $uri );
		if ( '' !== $path && self::path_is_published_product( $path ) ) {
			// Sentinel: non-array, non-null values are ignored by current Rank Math
			// (search continues). Mark request so wp_redirect can abort steals.
			$GLOBALS['webino_dashboard_live_product_uri'] = $path;
			return false;
		}
		return $pre;
	}

	/**
	 * Never redirect away from a published product permalink (kills Rank Math steals).
	 *
	 * @param string|false $location Target URL.
	 * @return string|false
	 */
	public static function abort_redirect_away_from_live_product( $location ) {
		if ( false === $location || ! is_string( $location ) || '' === $location ) {
			return $location;
		}
		if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return $location;
		}
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			return $location;
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$req = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
		$req_path = self::normalize_path( (string) wp_parse_url( 'http://local.invalid' . $req, PHP_URL_PATH ) );
		if ( '' === $req_path ) {
			return $location;
		}

		$marked = isset( $GLOBALS['webino_dashboard_live_product_uri'] )
			? self::normalize_path( (string) $GLOBALS['webino_dashboard_live_product_uri'] )
			: '';
		$is_live = ( $marked && $marked === $req_path ) || self::path_is_published_product( $req_path );
		if ( ! $is_live ) {
			return $location;
		}

		$loc_path = wp_parse_url( $location, PHP_URL_PATH );
		$loc_path = is_string( $loc_path ) ? self::normalize_path( $loc_path ) : '';
		if ( '' !== $loc_path && $loc_path === $req_path ) {
			// Slash-only / scheme-only — allow.
			return $location;
		}

		return false;
	}

	/**
	 * Deactivate conflicting Rank Math rules that steal live product URLs or self-loop.
	 *
	 * @return array{deactivated:int,scanned:int}
	 */
	public static function heal_rank_math_product_redirects() {
		$scanned      = 0;
		$deactivated  = 0;
		$ids_to_kill  = array();

		$rows = self::fetch_active_rank_math_redirections();
		foreach ( $rows as $row ) {
			++$scanned;
			$id = isset( $row['id'] ) ? (int) $row['id'] : 0;
			if ( $id <= 0 ) {
				continue;
			}

			$sources = isset( $row['sources'] ) ? maybe_unserialize( $row['sources'] ) : array();
			if ( ! is_array( $sources ) ) {
				$sources = array();
			}

			$url_to  = isset( $row['url_to'] ) ? (string) $row['url_to'] : '';
			$to_path = self::normalize_path( (string) wp_parse_url( $url_to, PHP_URL_PATH ) );

			$kill = false;
			foreach ( $sources as $source ) {
				if ( ! is_array( $source ) ) {
					continue;
				}
				$pattern = isset( $source['pattern'] ) ? (string) $source['pattern'] : '';
				$from    = self::normalize_path( $pattern );
				if ( '' === $from ) {
					continue;
				}
				// Slash-only / self-loop.
				if ( '' !== $to_path && $from === $to_path ) {
					$kill = true;
					break;
				}
				// Source is a live published product permalink — never steal it.
				if ( self::path_is_published_product( $from ) ) {
					$kill = true;
					break;
				}
			}

			if ( $kill ) {
				$ids_to_kill[] = $id;
			}
		}

		if ( $ids_to_kill ) {
			$deactivated = self::deactivate_rank_math_redirections( $ids_to_kill );
		}

		return array(
			'deactivated' => (int) $deactivated,
			'scanned'     => (int) $scanned,
		);
	}

	/**
	 * Run heal once per plugin version.
	 *
	 * @return void
	 */
	public static function maybe_heal_on_version_bump() {
		$ver = defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '';
		if ( '' === $ver ) {
			return;
		}
		if ( get_option( self::HEAL_OPTION, '' ) === $ver ) {
			return;
		}
		self::heal_rank_math_product_redirects();
		update_option( self::HEAL_OPTION, $ver, false );
	}

	/**
	 * @return list<array<string,mixed>>
	 */
	private static function fetch_active_rank_math_redirections() {
		$rows = array();

		if ( class_exists( '\RankMath\Redirections\DB', false ) && method_exists( '\RankMath\Redirections\DB', 'get_redirections' ) ) {
			$page = 1;
			do {
				$result = \RankMath\Redirections\DB::get_redirections(
					array(
						'status' => 'active',
						'limit'  => 200,
						'paged'  => $page,
						'orderby' => 'id',
						'order'  => 'ASC',
					)
				);
				$batch = isset( $result['redirections'] ) && is_array( $result['redirections'] ) ? $result['redirections'] : array();
				$count = isset( $result['count'] ) ? (int) $result['count'] : count( $batch );
				foreach ( $batch as $row ) {
					if ( is_array( $row ) ) {
						$rows[] = $row;
					}
				}
				++$page;
				$got = count( $batch );
			} while ( $got > 0 && count( $rows ) < $count && $page < 50 );

			return $rows;
		}

		global $wpdb;
		$table = $wpdb->prefix . 'rank_math_redirections';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) );
		if ( $exists !== $table ) {
			return array();
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$db_rows = $wpdb->get_results( "SELECT id, sources, url_to, status FROM {$table} WHERE status = 'active'", ARRAY_A );
		return is_array( $db_rows ) ? $db_rows : array();
	}

	/**
	 * @param list<int> $ids Redirection IDs.
	 * @return int Number deactivated.
	 */
	private static function deactivate_rank_math_redirections( array $ids ) {
		$ids = array_values( array_filter( array_map( 'intval', $ids ) ) );
		if ( ! $ids ) {
			return 0;
		}

		$n = 0;
		if ( class_exists( '\RankMath\Redirections\DB', false ) && method_exists( '\RankMath\Redirections\DB', 'change_status' ) ) {
			$res = \RankMath\Redirections\DB::change_status( $ids, 'inactive' );
			$n   = is_numeric( $res ) ? (int) $res : count( $ids );
		} else {
			global $wpdb;
			$table = $wpdb->prefix . 'rank_math_redirections';
			$in    = implode( ',', $ids );
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$n = (int) $wpdb->query( "UPDATE {$table} SET status = 'inactive', updated = NOW() WHERE id IN ({$in})" );
		}

		if ( class_exists( '\RankMath\Redirections\Cache', false ) && method_exists( '\RankMath\Redirections\Cache', 'purge' ) ) {
			\RankMath\Redirections\Cache::purge( $ids );
		}

		return max( 0, $n );
	}

	/**
	 * Deactivate active rules whose source matches $from_path (or reverse dest→source).
	 *
	 * @param string $from_path Source path.
	 * @param string $to_url    Destination URL.
	 * @return void
	 */
	private static function deactivate_conflicting_rules( $from_path, $to_url ) {
		$from_path = self::normalize_path( $from_path );
		$to_path   = self::normalize_path( (string) wp_parse_url( (string) $to_url, PHP_URL_PATH ) );
		if ( '' === $from_path ) {
			return;
		}

		$ids  = array();
		$rows = self::fetch_active_rank_math_redirections();
		foreach ( $rows as $row ) {
			$id = isset( $row['id'] ) ? (int) $row['id'] : 0;
			if ( $id <= 0 ) {
				continue;
			}
			$sources = isset( $row['sources'] ) ? maybe_unserialize( $row['sources'] ) : array();
			if ( ! is_array( $sources ) ) {
				continue;
			}
			$row_to = self::normalize_path( (string) wp_parse_url( (string) ( $row['url_to'] ?? '' ), PHP_URL_PATH ) );

			foreach ( $sources as $source ) {
				if ( ! is_array( $source ) ) {
					continue;
				}
				$pat = self::normalize_path( (string) ( $source['pattern'] ?? '' ) );
				if ( '' === $pat ) {
					continue;
				}
				// Same source (duplicate).
				if ( $pat === $from_path ) {
					$ids[] = $id;
					break;
				}
				// Reverse rule (dest → source).
				if ( '' !== $to_path && $pat === $to_path && $row_to === $from_path ) {
					$ids[] = $id;
					break;
				}
			}
		}

		if ( $ids ) {
			self::deactivate_rank_math_redirections( array_values( array_unique( $ids ) ) );
		}
	}

	/**
	 * Add Rank Math 301 from old path to new absolute URL.
	 *
	 * @param string $from_path Path like /old-slug.
	 * @param string $to_url    Absolute destination.
	 * @return bool True when saved.
	 */
	public static function add_rank_math_redirect( $from_path, $to_url ) {
		$from_path = self::normalize_path( $from_path );
		$to_url    = esc_url_raw( (string) $to_url );
		if ( '' === $from_path || '' === $to_url ) {
			return false;
		}
		$to_path = self::normalize_path( (string) wp_parse_url( $to_url, PHP_URL_PATH ) );
		if ( '' !== $to_path && $from_path === $to_path ) {
			return false;
		}

		// Never steal a live published product permalink.
		if ( self::path_is_published_product( $from_path ) ) {
			return false;
		}

		self::deactivate_conflicting_rules( $from_path, $to_url );

		// Rank Math stores exact patterns without a leading slash.
		$rm_pattern = ltrim( $from_path, '/' );

		if ( class_exists( '\RankMath\Redirections\DB', false ) ) {
			$id = \RankMath\Redirections\DB::add(
				array(
					'sources'     => array(
						array(
							'pattern'    => $rm_pattern,
							'comparison' => 'exact',
						),
					),
					'url_to'      => $to_url,
					'header_code' => 301,
					'status'      => 'active',
				)
			);
			return ! empty( $id );
		}

		if ( class_exists( '\RankMath\Redirections\Redirection', false ) ) {
			$r = \RankMath\Redirections\Redirection::create();
			if ( is_object( $r ) && method_exists( $r, 'set_url_to' ) ) {
				$r->set_url_to( $to_url );
				if ( method_exists( $r, 'set_header_code' ) ) {
					$r->set_header_code( 301 );
				}
				if ( method_exists( $r, 'set_status' ) ) {
					$r->set_status( 'active' );
				}
				if ( method_exists( $r, 'add_source' ) ) {
					$r->add_source( $rm_pattern, 'exact' );
				}
				if ( method_exists( $r, 'save' ) ) {
					return (bool) $r->save();
				}
			}
		}

		return false;
	}

	/**
	 * Ensure product slug comes from english_name; optionally AI-fill english_name.
	 *
	 * @param int                 $product_id Product ID.
	 * @param array<string,mixed> $opts       allow_ai (bool).
	 * @return array{ok:bool,updated:bool,redirected:bool,skipped:bool,message?:string}|WP_Error
	 */
	public static function ensure_english_slug( $product_id, $opts = array() ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'no_wc', __( 'WooCommerce required.', 'webino-dashboard' ) );
		}
		$product_id = (int) $product_id;
		$p          = wc_get_product( $product_id );
		if ( ! $p ) {
			return new WP_Error( 'not_found', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$english = trim( (string) $p->get_meta( '_ishop_english_name', true ) );
		if ( '' === $english && ! empty( $opts['allow_ai'] ) ) {
			$filled = self::ai_fill_english_name( $p );
			if ( is_wp_error( $filled ) ) {
				return $filled;
			}
			$english = $filled;
		}
		if ( '' === $english ) {
			return array(
				'ok'         => true,
				'updated'    => false,
				'redirected' => false,
				'skipped'    => true,
				'message'    => __( 'English name missing.', 'webino-dashboard' ),
			);
		}

		$new_slug = self::slug_from_english_name( $english );
		if ( '' === $new_slug ) {
			return array(
				'ok'         => true,
				'updated'    => false,
				'redirected' => false,
				'skipped'    => true,
				'message'    => __( 'Could not build English slug.', 'webino-dashboard' ),
			);
		}

		$old_slug = (string) $p->get_slug();
		if ( $old_slug === $new_slug ) {
			// Still persist english_name if we just AI-filled it.
			if ( '' === trim( (string) $p->get_meta( '_ishop_english_name', true ) ) && $english ) {
				$p->update_meta_data( '_ishop_english_name', $english );
				$p->save();
			}
			return array(
				'ok'         => true,
				'updated'    => false,
				'redirected' => false,
				'skipped'    => true,
				'message'    => __( 'Slug already English.', 'webino-dashboard' ),
			);
		}

		$old_path = self::permalink_path( $product_id );
		$p->update_meta_data( '_ishop_english_name', sanitize_text_field( $english ) );
		$p->set_slug( $new_slug );
		$p->save();
		clean_post_cache( $product_id );

		$new_url  = get_permalink( $product_id );
		$new_url  = is_string( $new_url ) ? $new_url : '';
		$redirect = false;
		if ( $old_path && $new_url ) {
			$redirect = self::add_rank_math_redirect( $old_path, $new_url );
		}

		return array(
			'ok'         => true,
			'updated'    => true,
			'redirected' => (bool) $redirect,
			'skipped'    => false,
		);
	}

	/**
	 * Ask AI for a short English product/model name.
	 *
	 * @param WC_Product $p Product.
	 * @return string|WP_Error
	 */
	public static function ai_fill_english_name( $p ) {
		if ( ! class_exists( 'Webino_Dashboard_AI_Providers', false ) ) {
			return new WP_Error( 'ai_missing', __( 'AI Content module required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$name = (string) $p->get_name();
		$sku  = (string) $p->get_sku();
		$system = 'You invent short English ecommerce product/model names. Return JSON only.';
		$user   = "Persian product title: {$name}\nSKU: {$sku}\nReturn {\"english_name\":\"...\"} — short Latin brand/model style name, no Persian, no quotes inside.";
		$schema = array( 'english_name' => 'string' );
		$result = Webino_Dashboard_AI_Providers::complete( $system, $user, $schema, null, array( 'timeout' => 45 ) );
		if ( empty( $result['ok'] ) ) {
			return new WP_Error( 'ai_provider', (string) ( $result['error'] ?? 'AI failed' ), array( 'status' => 502 ) );
		}
		$data = isset( $result['data'] ) && is_array( $result['data'] ) ? $result['data'] : array();
		$en   = sanitize_text_field( (string) ( $data['english_name'] ?? '' ) );
		if ( '' === $en ) {
			return new WP_Error( 'ai_empty', __( 'AI returned empty english_name.', 'webino-dashboard' ), array( 'status' => 502 ) );
		}
		$p->update_meta_data( '_ishop_english_name', $en );
		$p->save();
		return $en;
	}

	/**
	 * Bulk apply English slugs.
	 *
	 * @param array<string,mixed> $args ids?, with_ai?, limit?, ai_limit?.
	 * @return array{updated:int,skipped:int,redirected:int,failed:int,ai_used:int,remaining_without_english:int,errors:list<array{id:int,message:string}>}
	 */
	public static function apply_bulk( $args = array() ) {
		$ids       = isset( $args['ids'] ) && is_array( $args['ids'] ) ? array_values( array_filter( array_map( 'intval', $args['ids'] ) ) ) : array();
		$with_ai   = ! empty( $args['with_ai'] );
		$limit     = min( 200, max( 1, (int) ( $args['limit'] ?? 100 ) ) );
		$ai_limit  = min( 50, max( 0, (int) ( $args['ai_limit'] ?? 50 ) ) );
		$ai_used   = 0;
		$updated   = 0;
		$skipped   = 0;
		$redirected = 0;
		$failed    = 0;
		$errors    = array();
		$remaining = 0;

		if ( ! $ids ) {
			$query = new WP_Query(
				array(
					'post_type'              => 'product',
					'post_status'            => array( 'publish', 'draft', 'pending', 'private' ),
					'posts_per_page'         => $limit,
					'fields'                 => 'ids',
					'orderby'                => 'ID',
					'order'                  => 'DESC',
					'no_found_rows'          => true,
					'update_post_meta_cache' => false,
					'update_post_term_cache' => false,
				)
			);
			$ids = array_map( 'intval', (array) $query->posts );
		} else {
			$ids = array_slice( $ids, 0, $limit );
		}

		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 300 );
		}

		foreach ( $ids as $id ) {
			$english = '';
			$p       = function_exists( 'wc_get_product' ) ? wc_get_product( $id ) : null;
			if ( $p ) {
				$english = trim( (string) $p->get_meta( '_ishop_english_name', true ) );
			}
			$allow_ai = false;
			if ( '' === $english && $with_ai ) {
				if ( $ai_used >= $ai_limit ) {
					++$remaining;
					++$skipped;
					continue;
				}
				$allow_ai = true;
			}

			$res = self::ensure_english_slug(
				$id,
				array(
					'allow_ai' => $allow_ai,
				)
			);
			if ( is_wp_error( $res ) ) {
				++$failed;
				$errors[] = array(
					'id'      => $id,
					'message' => $res->get_error_message(),
				);
				continue;
			}
			if ( $allow_ai ) {
				++$ai_used;
			}
			if ( ! empty( $res['updated'] ) ) {
				++$updated;
			}
			if ( ! empty( $res['skipped'] ) ) {
				++$skipped;
			}
			if ( ! empty( $res['redirected'] ) ) {
				++$redirected;
			}
		}

		return array(
			'updated'                   => $updated,
			'skipped'                   => $skipped,
			'redirected'                => $redirected,
			'failed'                    => $failed,
			'ai_used'                   => $ai_used,
			'remaining_without_english' => $remaining,
			'errors'                    => $errors,
		);
	}
}
