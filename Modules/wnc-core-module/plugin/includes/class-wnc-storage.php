<?php
/**
 * Database schema.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Storage / schema helper.
 */
class WNC_Storage {

	const DB_VERSION = '1.1.0';

	/**
	 * Create or upgrade tables.
	 */
	public static function ensure_schema() {
		$current = (string) get_option( 'wnc_db_version', '' );
		if ( self::DB_VERSION === $current ) {
			return;
		}

		global $wpdb;
		$charset = $wpdb->get_charset_collate();
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$map_table   = $wpdb->prefix . 'wnc_product_map';
		$order_table = $wpdb->prefix . 'wnc_order_map';
		$jobs_table  = $wpdb->prefix . 'wnc_jobs';
		$logs_table  = $wpdb->prefix . 'wnc_logs';

		dbDelta(
			"CREATE TABLE {$map_table} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				wc_product_id bigint(20) unsigned NOT NULL,
				wc_variation_id bigint(20) unsigned NOT NULL DEFAULT 0,
				platform varchar(40) NOT NULL,
				remote_product_id varchar(100) NOT NULL DEFAULT '',
				remote_variant_id varchar(100) NOT NULL DEFAULT '',
				remote_url text NULL,
				sync_enabled tinyint(1) NOT NULL DEFAULT 1,
				last_sync_at datetime NULL,
				last_error text NULL,
				remote_price bigint(20) NULL,
				remote_stock int(11) NULL,
				created_at datetime NOT NULL,
				updated_at datetime NOT NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY wc_platform (wc_product_id, wc_variation_id, platform),
				KEY platform_remote (platform, remote_product_id, remote_variant_id)
			) {$charset};"
		);

		dbDelta(
			"CREATE TABLE {$order_table} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				wc_order_id bigint(20) unsigned NOT NULL,
				platform varchar(40) NOT NULL,
				remote_order_id varchar(100) NOT NULL DEFAULT '',
				status varchar(50) NOT NULL DEFAULT '',
				last_sync_at datetime NULL,
				created_at datetime NOT NULL,
				updated_at datetime NOT NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY platform_remote (platform, remote_order_id),
				KEY wc_order (wc_order_id)
			) {$charset};"
		);

		dbDelta(
			"CREATE TABLE {$jobs_table} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				job_type varchar(100) NOT NULL,
				platform varchar(40) NOT NULL DEFAULT '',
				payload longtext NULL,
				status varchar(30) NOT NULL DEFAULT 'pending',
				retries int(11) NOT NULL DEFAULT 0,
				max_retries int(11) NOT NULL DEFAULT 5,
				run_after datetime NOT NULL,
				locked_at datetime NULL,
				last_error text NULL,
				created_at datetime NOT NULL,
				updated_at datetime NOT NULL,
				PRIMARY KEY  (id),
				KEY status_run (status, run_after)
			) {$charset};"
		);

		dbDelta(
			"CREATE TABLE {$logs_table} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				level varchar(20) NOT NULL DEFAULT 'info',
				platform varchar(40) NOT NULL DEFAULT '',
				context varchar(50) NOT NULL DEFAULT 'general',
				message text NOT NULL,
				meta longtext NULL,
				created_at datetime NOT NULL,
				PRIMARY KEY  (id),
				KEY level_created (level, created_at),
				KEY platform_created (platform, created_at)
			) {$charset};"
		);

		update_option( 'wnc_db_version', self::DB_VERSION, false );
	}

	/**
	 * Product map table name.
	 *
	 * @return string
	 */
	public static function product_map_table() {
		global $wpdb;
		return $wpdb->prefix . 'wnc_product_map';
	}

	/**
	 * Order map table name.
	 *
	 * @return string
	 */
	public static function order_map_table() {
		global $wpdb;
		return $wpdb->prefix . 'wnc_order_map';
	}

	/**
	 * Jobs table name.
	 *
	 * @return string
	 */
	public static function jobs_table() {
		global $wpdb;
		return $wpdb->prefix . 'wnc_jobs';
	}

	/**
	 * Logs table name.
	 *
	 * @return string
	 */
	public static function logs_table() {
		global $wpdb;
		return $wpdb->prefix . 'wnc_logs';
	}
}
