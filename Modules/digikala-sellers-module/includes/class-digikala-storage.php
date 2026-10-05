<?php
/**
 * Storage schema for Digikala module.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Storage {

	const DB_VERSION = '1.0.0';

	/**
	 * @return void
	 */
	public static function ensure_schema() {
		$current = (string) get_option( 'webino_digikala_db_version', '' );
		if ( self::DB_VERSION === $current ) {
			return;
		}
		global $wpdb;
		$charset = $wpdb->get_charset_collate();
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$jobs_table = $wpdb->prefix . 'webino_dk_jobs';
		$logs_table = $wpdb->prefix . 'webino_dk_logs';
		$conn_table = $wpdb->prefix . 'webino_dk_connections';
		$prod_table = $wpdb->prefix . 'webino_dk_product_map';
		$order_table = $wpdb->prefix . 'webino_dk_order_map';
		$wh_table   = $wpdb->prefix . 'webino_dk_warehouse_map';

		dbDelta( "CREATE TABLE {$conn_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			client_code varchar(191) NOT NULL DEFAULT '',
			client_secret text NULL,
			access_token longtext NULL,
			refresh_token longtext NULL,
			access_expires_at datetime NULL,
			refresh_expires_at datetime NULL,
			scopes longtext NULL,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id)
		) {$charset};" );

		dbDelta( "CREATE TABLE {$prod_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			wc_product_id bigint(20) unsigned NOT NULL,
			wc_variation_id bigint(20) unsigned NULL,
			dk_product_id varchar(100) NOT NULL DEFAULT '',
			dk_variant_id varchar(100) NOT NULL DEFAULT '',
			last_sync_at datetime NULL,
			PRIMARY KEY (id),
			UNIQUE KEY wc_variant (wc_product_id,wc_variation_id),
			KEY dk_product (dk_product_id,dk_variant_id)
		) {$charset};" );

		dbDelta( "CREATE TABLE {$order_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			wc_order_id bigint(20) unsigned NOT NULL,
			dk_order_id varchar(100) NOT NULL DEFAULT '',
			dk_shipment_id varchar(100) NOT NULL DEFAULT '',
			last_sync_at datetime NULL,
			PRIMARY KEY (id),
			UNIQUE KEY wc_order (wc_order_id),
			KEY dk_order (dk_order_id)
		) {$charset};" );

		dbDelta( "CREATE TABLE {$wh_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			internal_warehouse_id bigint(20) unsigned NOT NULL,
			dk_warehouse_id varchar(100) NOT NULL DEFAULT '',
			last_sync_at datetime NULL,
			PRIMARY KEY (id),
			UNIQUE KEY internal_wh (internal_warehouse_id),
			KEY dk_wh (dk_warehouse_id)
		) {$charset};" );

		dbDelta( "CREATE TABLE {$jobs_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			job_type varchar(100) NOT NULL,
			payload longtext NULL,
			status varchar(30) NOT NULL DEFAULT 'pending',
			retries int(11) NOT NULL DEFAULT 0,
			max_retries int(11) NOT NULL DEFAULT 5,
			run_after datetime NOT NULL,
			locked_at datetime NULL,
			last_error text NULL,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY status_run_after (status, run_after)
		) {$charset};" );

		dbDelta( "CREATE TABLE {$logs_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			level varchar(20) NOT NULL DEFAULT 'info',
			context varchar(50) NOT NULL DEFAULT 'general',
			message text NOT NULL,
			meta longtext NULL,
			created_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY level_created (level, created_at),
			KEY context_created (context, created_at)
		) {$charset};" );

		update_option( 'webino_digikala_db_version', self::DB_VERSION, false );
	}
}
