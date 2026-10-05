<?php
/**
 * Analytics database tables.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Creates and migrates analytics tables.
 */
class Webino_Dashboard_Analytics_Db {

	const OPTION_VERSION = 'webino_dashboard_analytics_db_version';
	const SCHEMA_VERSION = '1.1.0';

	/**
	 * @param string $suffix Table suffix without prefix.
	 * @return string
	 */
	public static function table( $suffix ) {
		global $wpdb;
		return $wpdb->prefix . 'webino_dashboard_analytics_' . $suffix;
	}

	/**
	 * @return void
	 */
	public static function ensure_tables() {
		global $wpdb;

		$stored = (string) get_option( self::OPTION_VERSION, '' );
		if ( $stored === self::SCHEMA_VERSION ) {
			return;
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset = $wpdb->get_charset_collate();
		$p       = $wpdb->prefix;

		dbDelta( self::sql_events( $p, $charset ) );
		dbDelta( self::sql_visitors( $p, $charset ) );
		dbDelta( self::sql_daily_totals( $p, $charset ) );
		dbDelta( self::sql_page_daily( $p, $charset ) );
		dbDelta( self::sql_referrer_daily( $p, $charset ) );
		dbDelta( self::sql_device_daily( $p, $charset ) );
		dbDelta( self::sql_geo_daily( $p, $charset ) );

		self::maybe_upgrade_columns();

		update_option( self::OPTION_VERSION, self::SCHEMA_VERSION, false );
	}

	/**
	 * Add session columns if missing (dbDelta does not always alter).
	 *
	 * @return void
	 */
	private static function maybe_upgrade_columns() {
		global $wpdb;
		$events = self::table( 'events' );
		$totals = self::table( 'daily_totals' );
		self::maybe_add_column( $events, 'session_id', "varchar(64) NOT NULL DEFAULT ''" );
		self::maybe_add_column( $events, 'duration_ms', 'int(10) unsigned NOT NULL DEFAULT 0' );
		self::maybe_add_column( $events, 'is_exit', 'tinyint(1) NOT NULL DEFAULT 0' );
		self::maybe_add_column( $events, 'is_bounce', 'tinyint(1) NOT NULL DEFAULT 0' );
		self::maybe_add_column( $totals, 'sessions', 'int(10) unsigned NOT NULL DEFAULT 0' );
		self::maybe_add_column( $totals, 'bounces', 'int(10) unsigned NOT NULL DEFAULT 0' );
		self::maybe_add_column( $totals, 'duration_sum_ms', 'bigint(20) unsigned NOT NULL DEFAULT 0' );
	}

	/**
	 * @param string $table Full table name.
	 * @param string $column Column.
	 * @param string $definition SQL type definition.
	 * @return void
	 */
	private static function maybe_add_column( $table, $column, $definition ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$exists = $wpdb->get_var( $wpdb->prepare( "SHOW COLUMNS FROM {$table} LIKE %s", $column ) );
		if ( $exists ) {
			return;
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.SchemaChange
		$wpdb->query( "ALTER TABLE {$table} ADD COLUMN {$column} {$definition}" );
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_events( $p, $charset ) {
		return "CREATE TABLE {$p}webino_dashboard_analytics_events (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			created_at datetime NOT NULL,
			visitor_hash char(64) NOT NULL,
			uri varchar(512) NOT NULL DEFAULT '',
			post_id bigint(20) unsigned NOT NULL DEFAULT 0,
			referrer varchar(512) NOT NULL DEFAULT '',
			ref_category varchar(32) NOT NULL DEFAULT 'direct',
			ref_source varchar(191) NOT NULL DEFAULT '',
			country char(2) NOT NULL DEFAULT '',
			city varchar(100) NOT NULL DEFAULT '',
			browser varchar(64) NOT NULL DEFAULT '',
			os varchar(64) NOT NULL DEFAULT '',
			device varchar(32) NOT NULL DEFAULT '',
			utm_source varchar(100) NOT NULL DEFAULT '',
			utm_medium varchar(100) NOT NULL DEFAULT '',
			utm_campaign varchar(100) NOT NULL DEFAULT '',
			session_id varchar(64) NOT NULL DEFAULT '',
			duration_ms int(10) unsigned NOT NULL DEFAULT 0,
			is_exit tinyint(1) NOT NULL DEFAULT 0,
			is_bounce tinyint(1) NOT NULL DEFAULT 0,
			PRIMARY KEY  (id),
			KEY created_at (created_at),
			KEY visitor_hash (visitor_hash),
			KEY post_id (post_id),
			KEY session_id (session_id)
		) $charset;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_visitors( $p, $charset ) {
		return "CREATE TABLE {$p}webino_dashboard_analytics_visitors (
			visitor_hash char(64) NOT NULL,
			first_seen datetime NOT NULL,
			last_seen datetime NOT NULL,
			hits int(10) unsigned NOT NULL DEFAULT 0,
			country char(2) NOT NULL DEFAULT '',
			PRIMARY KEY  (visitor_hash),
			KEY last_seen (last_seen)
		) $charset;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_daily_totals( $p, $charset ) {
		return "CREATE TABLE {$p}webino_dashboard_analytics_daily_totals (
			day date NOT NULL,
			visitors int(10) unsigned NOT NULL DEFAULT 0,
			views int(10) unsigned NOT NULL DEFAULT 0,
			sessions int(10) unsigned NOT NULL DEFAULT 0,
			bounces int(10) unsigned NOT NULL DEFAULT 0,
			duration_sum_ms bigint(20) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (day)
		) $charset;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_page_daily( $p, $charset ) {
		return "CREATE TABLE {$p}webino_dashboard_analytics_page_daily (
			day date NOT NULL,
			post_id bigint(20) unsigned NOT NULL DEFAULT 0,
			uri varchar(512) NOT NULL DEFAULT '',
			views int(10) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (day, post_id, uri(191))
		) $charset;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_referrer_daily( $p, $charset ) {
		return "CREATE TABLE {$p}webino_dashboard_analytics_referrer_daily (
			day date NOT NULL,
			ref_category varchar(32) NOT NULL DEFAULT 'direct',
			ref_source varchar(191) NOT NULL DEFAULT '',
			visits int(10) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (day, ref_category, ref_source(100))
		) $charset;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_device_daily( $p, $charset ) {
		return "CREATE TABLE {$p}webino_dashboard_analytics_device_daily (
			day date NOT NULL,
			dim_type varchar(16) NOT NULL DEFAULT 'browser',
			dim_value varchar(64) NOT NULL DEFAULT '',
			views int(10) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (day, dim_type, dim_value(50))
		) $charset;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_geo_daily( $p, $charset ) {
		return "CREATE TABLE {$p}webino_dashboard_analytics_geo_daily (
			day date NOT NULL,
			dim_type varchar(16) NOT NULL DEFAULT 'country',
			dim_value varchar(100) NOT NULL DEFAULT '',
			views int(10) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (day, dim_type, dim_value(80))
		) $charset;";
	}
}
