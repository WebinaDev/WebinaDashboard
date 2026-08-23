<?php
/**
 * SEO / quality gate for AI-generated content.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validates generated payloads against Rank Math–style and Google helpful-content heuristics.
 */
final class Webino_Dashboard_AI_Seo_Gate {

	/**
	 * @param array<string,mixed> $data Generated payload.
	 * @param string              $type product|blog|term.
	 * @param array<string,mixed> $ctx Context (site_name, focus_keyword, min_words…).
	 * @return true|WP_Error
	 */
	public static function validate( $data, $type, $ctx = array() ) {
		$settings  = Webino_Dashboard_AI_Content_Settings::get();
		$site_name = (string) ( $ctx['site_name'] ?? Webino_Dashboard_AI_Content_Settings::resolved_site_name( $settings ) );
		$focus     = mb_strtolower( trim( (string) ( $ctx['focus_keyword'] ?? ( $data['focus_keyword'] ?? '' ) ) ) );
		$title     = (string) ( $data['title'] ?? $data['name'] ?? '' );
		$slug      = (string) ( $data['slug'] ?? '' );
		$content   = (string) ( $data['content'] ?? $data['description'] ?? '' );
		$short     = (string) ( $data['short_description'] ?? $data['excerpt'] ?? '' );
		$seo_title = (string) ( $data['seo_title'] ?? ( $data['seo']['title'] ?? '' ) );
		$seo_desc  = (string) ( $data['seo_description'] ?? ( $data['seo']['description'] ?? '' ) );

		$entity = 'product' === $type ? 'product' : ( 'blog' === $type ? 'blog' : Webino_Dashboard_AI_Content_Settings::entity_for_type( (string) ( $ctx['exclude_type'] ?? 'product_cat' ) ) );
		$main_on = 'blog' === $type
			? Webino_Dashboard_AI_Content_Settings::field_enabled( 'blog', 'content' )
			: ( 'product' === $type
				? Webino_Dashboard_AI_Content_Settings::field_enabled( 'product', 'description' )
				: Webino_Dashboard_AI_Content_Settings::field_enabled( $entity, 'description' ) );
		$seo_on  = Webino_Dashboard_AI_Content_Settings::field_enabled( $entity, 'seo' );

		$text_plain = self::strip( $title . ' ' . $short . ' ' . $content );
		$words      = self::word_count( $text_plain );

		$min = (int) ( $ctx['min_words'] ?? 0 );
		if ( $min <= 0 ) {
			if ( 'blog' === $type ) {
				$min = (int) $settings['min_blog_words'];
			} elseif ( 'product' === $type ) {
				$min = (int) $settings['min_product_words'];
			} else {
				$min = (int) $settings['min_term_words'];
			}
		}

		if ( $main_on && $words < max( 50, (int) ( $min * 0.7 ) ) ) {
			return new WP_Error( 'ai_thin', sprintf( /* translators: %d: word count */ __( 'Content too thin (%d words).', 'webino-dashboard' ), $words ) );
		}

		if ( $main_on && ! empty( $settings['require_site_name'] ) && '' !== $site_name ) {
			if ( false === mb_stripos( $text_plain, $site_name ) ) {
				return new WP_Error( 'ai_site_name', __( 'Site name missing from content.', 'webino-dashboard' ) );
			}
		}

		if ( $seo_on && '' === $focus ) {
			return new WP_Error( 'ai_focus', __( 'Focus keyword required.', 'webino-dashboard' ) );
		}

		if ( ! $seo_on ) {
			return true;
		}

		$resolved_title = $seo_title !== '' ? $seo_title : $title;
		$resolved_title = str_replace(
			array( '%title%', '%sitename%', '%sep%' ),
			array( $title, $site_name, (string) $settings['seo_sep'] ),
			$resolved_title
		);

		$checks = array(
			'title_kw'   => false !== mb_stripos( $resolved_title, $focus ) || false !== mb_stripos( $title, $focus ),
			'slug_kw'    => '' === $slug || false !== mb_stripos( $slug, self::slugify_kw( $focus ) ),
		);
		if ( $main_on ) {
			$checks['content_kw'] = false !== mb_stripos( $text_plain, $focus );
		}

		if ( $seo_desc !== '' ) {
			$checks['desc_kw'] = false !== mb_stripos( $seo_desc, $focus );
		}

		$title_len = mb_strlen( self::strip( $resolved_title ) );
		$desc_len  = mb_strlen( self::strip( $seo_desc !== '' ? $seo_desc : $short ) );
		$checks['title_len'] = $title_len >= 10 && $title_len <= 70;
		$checks['desc_len']  = $desc_len >= 50 && $desc_len <= 180;

		$failed = array();
		foreach ( $checks as $id => $ok ) {
			if ( ! $ok ) {
				$failed[] = $id;
			}
		}

		// Allow at most one soft fail among length checks.
		$hard = array_diff( $failed, array( 'title_len', 'desc_len', 'slug_kw' ) );
		if ( count( $hard ) > 0 ) {
			return new WP_Error( 'ai_seo', __( 'SEO checks failed: ', 'webino-dashboard' ) . implode( ', ', $hard ) );
		}

		$dup = self::check_duplicate_focus( $focus, (string) ( $ctx['exclude_type'] ?? '' ), (int) ( $ctx['exclude_id'] ?? 0 ) );
		if ( is_wp_error( $dup ) ) {
			return $dup;
		}

		return true;
	}

	/**
	 * @param string $focus Focus keyword.
	 * @param string $exclude_type Target type to ignore.
	 * @param int    $exclude_id Target id to ignore.
	 * @return true|WP_Error
	 */
	public static function check_duplicate_focus( $focus, $exclude_type = '', $exclude_id = 0 ) {
		global $wpdb;
		$table = Webino_Dashboard_AI_Content_Db::table( 'runs' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT id, target_type, target_id FROM {$table} WHERE focus_keyword = %s ORDER BY id DESC LIMIT 1",
				mb_strtolower( trim( $focus ) )
			),
			ARRAY_A
		);
		if ( ! $row ) {
			return true;
		}
		if ( $exclude_type && (string) $row['target_type'] === $exclude_type && (int) $row['target_id'] === (int) $exclude_id ) {
			return true;
		}
		return new WP_Error( 'ai_cannibal', __( 'Focus keyword already used recently. Choose another angle.', 'webino-dashboard' ) );
	}

	/**
	 * Record a successful generation for cannibalization checks.
	 *
	 * @param string $target_type Type.
	 * @param int    $target_id ID.
	 * @param string $focus Focus keyword.
	 * @param string $title Title.
	 * @param string $content Content.
	 * @return void
	 */
	public static function record_run( $target_type, $target_id, $focus, $title, $content ) {
		global $wpdb;
		$table = Webino_Dashboard_AI_Content_Db::table( 'runs' );
		$wpdb->insert(
			$table,
			array(
				'target_type'         => sanitize_key( $target_type ),
				'target_id'           => (int) $target_id,
				'focus_keyword'       => mb_strtolower( trim( (string) $focus ) ),
				'title_hash'          => hash( 'sha256', mb_strtolower( trim( self::strip( $title ) ) ) ),
				'content_fingerprint' => hash( 'sha256', mb_substr( self::strip( $content ), 0, 2000 ) ),
				'created_at'          => current_time( 'mysql', true ),
			),
			array( '%s', '%d', '%s', '%s', '%s', '%s' )
		);
	}

	/**
	 * @param string $html HTML.
	 * @return string
	 */
	public static function strip( $html ) {
		return trim( preg_replace( '/\s+/u', ' ', wp_strip_all_tags( (string) $html ) ) );
	}

	/**
	 * @param string $text Text.
	 * @return int
	 */
	public static function word_count( $text ) {
		$text = trim( (string) $text );
		if ( '' === $text ) {
			return 0;
		}
		$parts = preg_split( '/\s+/u', $text );
		return is_array( $parts ) ? count( array_filter( $parts ) ) : 0;
	}

	/**
	 * @param string $kw Keyword.
	 * @return string
	 */
	private static function slugify_kw( $kw ) {
		$kw = mb_strtolower( trim( $kw ) );
		$kw = preg_replace( '/\s+/u', '-', $kw );
		return (string) $kw;
	}
}
