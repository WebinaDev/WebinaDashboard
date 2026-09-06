<?php
/**
 * Database malware scanner.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Scan options/posts for malware patterns.
 */
final class Webino_Shield_Db_Scan {

	/**
	 * @param int $scan_id Scan job ID.
	 * @return array<int,array<string,mixed>>
	 */
	public static function run( $scan_id = 0 ) {
		global $wpdb;
		$findings = array();

		$options = $wpdb->get_results(
			"SELECT option_name, option_value FROM {$wpdb->options} WHERE autoload != 'no' OR option_name LIKE '%cron%' LIMIT 500",
			ARRAY_A
		);

		foreach ( $options ?: array() as $row ) {
			$hits = Webino_Shield_Malware::scan_content( (string) $row['option_value'] );
			foreach ( $hits as $hit ) {
				$findings[] = array_merge( $hit, array(
					'path_or_object' => 'option:' . $row['option_name'],
					'remediation'    => 'Review and clean option value',
					'auto_heal_available' => true,
				) );
			}
		}

		$posts = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_content FROM {$wpdb->posts} WHERE post_status IN ('publish','draft') AND post_type IN ('post','page') LIMIT %d",
				200
			),
			ARRAY_A
		);

		foreach ( $posts ?: array() as $post ) {
			$hits = Webino_Shield_Malware::scan_content( (string) $post['post_content'] );
			foreach ( $hits as $hit ) {
				$findings[] = array_merge( $hit, array(
					'path_or_object' => 'post:' . $post['ID'],
					'remediation'    => 'Edit post content',
				) );
			}
		}

		if ( 'yes' === get_option( 'woocommerce_db_version' ) || class_exists( 'WooCommerce', false ) ) {
			$findings = array_merge( $findings, self::scan_woo_tables() );
		}

		foreach ( $findings as $f ) {
			self::insert_finding( $scan_id, $f );
		}

		return $findings;
	}

	/**
	 * Scan WooCommerce-specific DB surfaces for malware patterns.
	 *
	 * Scans postmeta rows whose keys match _order_* / _wc_* / woocommerce_* and all
	 * woocommerce_* options using Webino_Shield_Malware::scan_content. Row counts are
	 * capped to keep the scan bounded.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	private static function scan_woo_tables() {
		global $wpdb;
		$findings = array();

		// Secondary guard: verify WooCommerce is actually present.
		if ( ! class_exists( 'WooCommerce', false ) && ! get_option( 'woocommerce_db_version' ) ) {
			return $findings;
		}

		$order_items_table = $wpdb->prefix . 'woocommerce_order_items';
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $order_items_table ) ) !== $order_items_table ) {
			return $findings;
		}

		// --- Scan postmeta for order / woocommerce meta values ---
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$meta_rows = $wpdb->get_results(
			"SELECT meta_id, meta_key, meta_value " .
			"FROM {$wpdb->postmeta} " .
			"WHERE ( meta_key LIKE '\_order\_%' OR meta_key LIKE '\_wc\_%' OR meta_key LIKE 'woocommerce\_%' ) " .
			"AND meta_value != '' " .
			"LIMIT 500",
			ARRAY_A
		);

		foreach ( $meta_rows ?: array() as $row ) {
			$hits = Webino_Shield_Malware::scan_content( (string) $row['meta_value'] );
			foreach ( $hits as $hit ) {
				$findings[] = array_merge(
					$hit,
					array(
						'path_or_object'      => 'postmeta:' . $row['meta_key'] . ':' . $row['meta_id'],
						'remediation'         => 'Review WooCommerce order meta value',
						'auto_heal_available' => false,
					)
				);
			}
		}

		// --- Scan woocommerce_* options ---
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$woo_options = $wpdb->get_results(
			"SELECT option_name, option_value " .
			"FROM {$wpdb->options} " .
			"WHERE option_name LIKE 'woocommerce\_%' " .
			"AND option_value != '' " .
			"LIMIT 200",
			ARRAY_A
		);

		foreach ( $woo_options ?: array() as $row ) {
			$hits = Webino_Shield_Malware::scan_content( (string) $row['option_value'] );
			foreach ( $hits as $hit ) {
				$findings[] = array_merge(
					$hit,
					array(
						'path_or_object'      => 'option:' . $row['option_name'],
						'remediation'         => 'Review WooCommerce option value',
						'auto_heal_available' => true,
					)
				);
			}
		}

		return $findings;
	}

	/**
	 * @param int                  $scan_id Scan ID.
	 * @param array<string,mixed>  $finding Finding.
	 * @return void
	 */
	private static function insert_finding( $scan_id, $finding ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'findings' ),
			array(
				'scan_id'             => (int) $scan_id,
				'severity'            => sanitize_key( (string) ( $finding['severity'] ?? 'medium' ) ),
				'status'              => 'open',
				'category'            => sanitize_key( (string) ( $finding['category'] ?? 'db' ) ),
				'title'               => sanitize_text_field( (string) ( $finding['title'] ?? 'DB issue' ) ),
				'path_or_object'      => sanitize_text_field( (string) ( $finding['path_or_object'] ?? '' ) ),
				'evidence'            => wp_json_encode( $finding['evidence'] ?? '' ),
				'remediation'         => sanitize_text_field( (string) ( $finding['remediation'] ?? '' ) ),
				'auto_heal_available' => ! empty( $finding['auto_heal_available'] ) ? 1 : 0,
				'created_at'          => current_time( 'mysql', true ),
				'updated_at'          => current_time( 'mysql', true ),
			)
		);
	}
}
