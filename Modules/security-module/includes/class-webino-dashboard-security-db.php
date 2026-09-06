<?php
/**
 * Security module database tables.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Creates and migrates Shield tables.
 */
final class Webino_Dashboard_Security_Db {

	const OPTION_VERSION = 'webino_dashboard_security_db_version';
	const SCHEMA_VERSION = '1.0.1';

	/**
	 * @param string $suffix Table suffix without prefix.
	 * @return string
	 */
	public static function table( $suffix ) {
		global $wpdb;
		return $wpdb->prefix . 'webino_shield_' . $suffix;
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
		$p       = $wpdb->prefix . 'webino_shield_';

		$tables = array(
			self::sql_events( $p, $charset ),
			self::sql_event_payloads( $p, $charset ),
			self::sql_blocks( $p, $charset ),
			self::sql_allow( $p, $charset ),
			self::sql_rate( $p, $charset ),
			self::sql_reputation( $p, $charset ),
			self::sql_rules( $p, $charset ),
			self::sql_rule_hits( $p, $charset ),
			self::sql_scans( $p, $charset ),
			self::sql_findings( $p, $charset ),
			self::sql_file_index( $p, $charset ),
			self::sql_quarantine( $p, $charset ),
			self::sql_snapshots( $p, $charset ),
			self::sql_feeds( $p, $charset ),
			self::sql_intel_ip( $p, $charset ),
			self::sql_intel_hash( $p, $charset ),
			self::sql_intel_cve( $p, $charset ),
			self::sql_audit( $p, $charset ),
			self::sql_reports( $p, $charset ),
			self::sql_incidents( $p, $charset ),
			self::sql_canaries( $p, $charset ),
			self::sql_2fa( $p, $charset ),
			self::sql_sessions( $p, $charset ),
		);

		foreach ( $tables as $sql ) {
			dbDelta( $sql );
		}

		update_option( self::OPTION_VERSION, self::SCHEMA_VERSION, false );
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_events( $p, $charset ) {
		return "CREATE TABLE {$p}events (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			created_at datetime NOT NULL,
			action varchar(32) NOT NULL DEFAULT 'log',
			ip varchar(45) NOT NULL DEFAULT '',
			ip_hash char(64) NOT NULL DEFAULT '',
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			method varchar(10) NOT NULL DEFAULT '',
			path varchar(512) NOT NULL DEFAULT '',
			rule_id varchar(64) NOT NULL DEFAULT '',
			country char(2) NOT NULL DEFAULT '',
			ua_hash char(64) NOT NULL DEFAULT '',
			score int(11) NOT NULL DEFAULT 0,
			meta longtext NULL,
			PRIMARY KEY  (id),
			KEY created_action (created_at, action, ip_hash)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_event_payloads( $p, $charset ) {
		return "CREATE TABLE {$p}event_payloads (
			event_id bigint(20) unsigned NOT NULL,
			headers longtext NULL,
			body longtext NULL,
			matches longtext NULL,
			PRIMARY KEY  (event_id)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_blocks( $p, $charset ) {
		return "CREATE TABLE {$p}blocks (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			type varchar(16) NOT NULL DEFAULT 'ip',
			value_hash char(64) NOT NULL DEFAULT '',
			value_text varchar(512) NOT NULL DEFAULT '',
			reason varchar(255) NOT NULL DEFAULT '',
			source varchar(32) NOT NULL DEFAULT 'manual',
			created_at datetime NOT NULL,
			expires_at datetime NULL,
			PRIMARY KEY  (id),
			KEY type_value (type, value_hash, expires_at)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_allow( $p, $charset ) {
		return "CREATE TABLE {$p}allow (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			type varchar(16) NOT NULL DEFAULT 'ip',
			value_hash char(64) NOT NULL DEFAULT '',
			value_text varchar(512) NOT NULL DEFAULT '',
			note varchar(255) NOT NULL DEFAULT '',
			created_at datetime NOT NULL,
			expires_at datetime NULL,
			PRIMARY KEY  (id),
			KEY type_value (type, value_hash)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_rate( $p, $charset ) {
		return "CREATE TABLE {$p}rate (
			bucket_key varchar(191) NOT NULL,
			hits int(10) unsigned NOT NULL DEFAULT 0,
			window_start int(10) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (bucket_key)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_reputation( $p, $charset ) {
		return "CREATE TABLE {$p}reputation (
			entity_hash char(64) NOT NULL,
			entity_type varchar(16) NOT NULL DEFAULT 'ip',
			score int(11) NOT NULL DEFAULT 0,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (entity_hash, entity_type)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_rules( $p, $charset ) {
		return "CREATE TABLE {$p}rules (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			rule_id varchar(64) NOT NULL DEFAULT '',
			name varchar(191) NOT NULL DEFAULT '',
			enabled tinyint(1) NOT NULL DEFAULT 1,
			priority int(11) NOT NULL DEFAULT 100,
			conditions longtext NOT NULL,
			action varchar(32) NOT NULL DEFAULT 'block',
			learning tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY rule_id (rule_id)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_rule_hits( $p, $charset ) {
		return "CREATE TABLE {$p}rule_hits (
			rule_id varchar(64) NOT NULL,
			day date NOT NULL,
			hits int(10) unsigned NOT NULL DEFAULT 0,
			false_positives int(10) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (rule_id, day)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_scans( $p, $charset ) {
		return "CREATE TABLE {$p}scans (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			profile varchar(32) NOT NULL DEFAULT 'standard',
			status varchar(16) NOT NULL DEFAULT 'queued',
			progress_pct tinyint(3) unsigned NOT NULL DEFAULT 0,
			current_path varchar(512) NOT NULL DEFAULT '',
			findings_count int(10) unsigned NOT NULL DEFAULT 0,
			started_at datetime NULL,
			finished_at datetime NULL,
			created_at datetime NOT NULL,
			meta longtext NULL,
			PRIMARY KEY  (id),
			KEY status (status, created_at)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_findings( $p, $charset ) {
		return "CREATE TABLE {$p}findings (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			scan_id bigint(20) unsigned NOT NULL DEFAULT 0,
			severity varchar(16) NOT NULL DEFAULT 'info',
			status varchar(16) NOT NULL DEFAULT 'open',
			category varchar(32) NOT NULL DEFAULT '',
			title varchar(255) NOT NULL DEFAULT '',
			path_or_object varchar(512) NOT NULL DEFAULT '',
			evidence longtext NULL,
			remediation longtext NULL,
			auto_heal_available tinyint(1) NOT NULL DEFAULT 0,
			cve_ids longtext NULL,
			feed_ids longtext NULL,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY scan_severity (scan_id, severity, status)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_file_index( $p, $charset ) {
		return "CREATE TABLE {$p}file_index (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			scan_id bigint(20) unsigned NOT NULL DEFAULT 0,
			path varchar(512) NOT NULL DEFAULT '',
			file_hash char(64) NOT NULL DEFAULT '',
			size bigint(20) unsigned NOT NULL DEFAULT 0,
			mtime int(10) unsigned NOT NULL DEFAULT 0,
			origin varchar(32) NOT NULL DEFAULT '',
			PRIMARY KEY  (id),
			KEY scan_path (scan_id, path(191))
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_quarantine( $p, $charset ) {
		return "CREATE TABLE {$p}quarantine (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			original_path varchar(512) NOT NULL DEFAULT '',
			stored_path varchar(512) NOT NULL DEFAULT '',
			file_hash char(64) NOT NULL DEFAULT '',
			reason varchar(255) NOT NULL DEFAULT '',
			created_at datetime NOT NULL,
			restored_at datetime NULL,
			PRIMARY KEY  (id)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_snapshots( $p, $charset ) {
		return "CREATE TABLE {$p}snapshots (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			action varchar(64) NOT NULL DEFAULT '',
			target varchar(512) NOT NULL DEFAULT '',
			payload longtext NULL,
			created_at datetime NOT NULL,
			expires_at datetime NULL,
			rolled_back_at datetime NULL,
			PRIMARY KEY  (id),
			KEY expires (expires_at)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_feeds( $p, $charset ) {
		return "CREATE TABLE {$p}feeds (
			feed_id varchar(64) NOT NULL,
			version varchar(32) NOT NULL DEFAULT '',
			etag varchar(128) NOT NULL DEFAULT '',
			last_ok datetime NULL,
			last_error varchar(255) NOT NULL DEFAULT '',
			record_count int(10) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (feed_id)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_intel_ip( $p, $charset ) {
		return "CREATE TABLE {$p}intel_ip (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			value_text varchar(64) NOT NULL DEFAULT '',
			value_hash char(64) NOT NULL DEFAULT '',
			ip_start varbinary(16) DEFAULT NULL,
			ip_end varbinary(16) DEFAULT NULL,
			feed_id varchar(64) NOT NULL DEFAULT '',
			label varchar(128) NOT NULL DEFAULT '',
			PRIMARY KEY  (id),
			KEY feed (feed_id),
			KEY value_hash (value_hash)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_intel_hash( $p, $charset ) {
		return "CREATE TABLE {$p}intel_hash (
			hash_sha256 char(64) NOT NULL,
			feed_id varchar(64) NOT NULL DEFAULT '',
			label varchar(128) NOT NULL DEFAULT '',
			PRIMARY KEY  (hash_sha256),
			KEY feed (feed_id)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_intel_cve( $p, $charset ) {
		return "CREATE TABLE {$p}intel_cve (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			cve_id varchar(32) NOT NULL DEFAULT '',
			slug varchar(191) NOT NULL DEFAULT '',
			affected_version varchar(64) NOT NULL DEFAULT '',
			severity varchar(16) NOT NULL DEFAULT '',
			kev tinyint(1) NOT NULL DEFAULT 0,
			feed_id varchar(64) NOT NULL DEFAULT '',
			meta longtext NULL,
			PRIMARY KEY  (id),
			KEY slug_version (slug(100), affected_version),
			KEY cve (cve_id)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_audit( $p, $charset ) {
		return "CREATE TABLE {$p}audit (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			created_at datetime NOT NULL,
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			action varchar(64) NOT NULL DEFAULT '',
			object_type varchar(32) NOT NULL DEFAULT '',
			object_id varchar(64) NOT NULL DEFAULT '',
			details longtext NULL,
			ip varchar(45) NOT NULL DEFAULT '',
			PRIMARY KEY  (id),
			KEY created (created_at)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_reports( $p, $charset ) {
		return "CREATE TABLE {$p}reports (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			report_type varchar(32) NOT NULL DEFAULT '',
			title varchar(191) NOT NULL DEFAULT '',
			payload longtext NULL,
			score tinyint(3) unsigned NOT NULL DEFAULT 0,
			created_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY type_created (report_type, created_at)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_incidents( $p, $charset ) {
		return "CREATE TABLE {$p}incidents (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			title varchar(191) NOT NULL DEFAULT '',
			status varchar(16) NOT NULL DEFAULT 'open',
			severity varchar(16) NOT NULL DEFAULT 'medium',
			event_ids longtext NULL,
			timeline longtext NULL,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY status (status, created_at)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_canaries( $p, $charset ) {
		return "CREATE TABLE {$p}canaries (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			canary_type varchar(16) NOT NULL DEFAULT 'path',
			token varchar(64) NOT NULL DEFAULT '',
			path varchar(512) NOT NULL DEFAULT '',
			hits int(10) unsigned NOT NULL DEFAULT 0,
			last_hit datetime NULL,
			created_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY token (token)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_2fa( $p, $charset ) {
		return "CREATE TABLE {$p}2fa (
			user_id bigint(20) unsigned NOT NULL,
			secret varchar(128) NOT NULL DEFAULT '',
			backup_codes longtext NULL,
			webauthn longtext NULL,
			enabled tinyint(1) NOT NULL DEFAULT 0,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (user_id)
		) $charset;";
	}

	/**
	 * @param string $p     Prefix.
	 * @param string $charset Charset.
	 * @return string
	 */
	private static function sql_sessions( $p, $charset ) {
		return "CREATE TABLE {$p}sessions (
			session_token char(64) NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			created_at datetime NOT NULL,
			last_seen datetime NOT NULL,
			invalidated tinyint(1) NOT NULL DEFAULT 0,
			PRIMARY KEY  (session_token),
			KEY user_id (user_id)
		) $charset;";
	}
}
