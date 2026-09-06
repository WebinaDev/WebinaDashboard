<?php
/**
 * Threat intelligence feed sync.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Feed adapters and cron sync.
 */
final class Webino_Shield_Feeds {

	const CRON_HOOK = 'webino_shield_feeds_sync';

	/** Max IPs/CIDRs to import per FireHOL run to keep DB manageable. */
	const FIREHOL_MAX_RECORDS = 50000;

	/**
	 * @return void
	 */
	public static function init() {
		add_action( self::CRON_HOOK, array( __CLASS__, 'sync_all' ) );
		add_action( 'init', array( __CLASS__, 'schedule' ), 20 );
	}

	/**
	 * @return void
	 */
	public static function schedule() {
		$s     = Webino_Dashboard_Security_Settings::get();
		$hours = max( 1, min( 168, (int) ( $s['feeds']['sync_hours'] ?? 6 ) ) );
		$hook  = self::CRON_HOOK;

		$stored = (int) get_option( 'webino_shield_feeds_sync_hours', 0 );
		if ( $stored !== $hours ) {
			wp_clear_scheduled_hook( $hook );
			update_option( 'webino_shield_feeds_sync_hours', $hours, false );
		}

		if ( ! wp_next_scheduled( $hook ) ) {
			wp_schedule_single_event( time() + ( $hours * HOUR_IN_SECONDS ), $hook );
		}
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function sync_all() {
		$results  = array();
		$adapters = array(
			'wp_core_checksums' => array( __CLASS__, 'sync_wp_core_checksums' ),
			'wpvulnerability'   => array( __CLASS__, 'sync_wpvulnerability' ),
			'cisa_kev'          => array( __CLASS__, 'sync_cisa_kev' ),
			'firehol_l1'        => array( __CLASS__, 'sync_firehol_l1' ),
			'spamhaus_drop'     => array( __CLASS__, 'sync_spamhaus_drop' ),
			'malwarebazaar'     => array( __CLASS__, 'sync_malwarebazaar' ),
		);

		foreach ( $adapters as $id => $cb ) {
			try {
				$results[ $id ] = call_user_func( $cb );
			} catch ( Exception $e ) {
				$results[ $id ] = array( 'error' => $e->getMessage() );
				self::mark_feed_error( $id, $e->getMessage() );
			}
		}

		self::rebuild_bloom_from_intel();

		// Re-arm next sync using configured sync_hours (not hardcoded twicedaily).
		wp_clear_scheduled_hook( self::CRON_HOOK );
		$s     = Webino_Dashboard_Security_Settings::get();
		$hours = max( 1, min( 168, (int) ( $s['feeds']['sync_hours'] ?? 6 ) ) );
		update_option( 'webino_shield_feeds_sync_hours', $hours, false );
		wp_schedule_single_event( time() + ( $hours * HOUR_IN_SECONDS ), self::CRON_HOOK );

		return $results;
	}

	/**
	 * Rebuild bloom filter from intel_ip table for fast negative lookups.
	 *
	 * @return void
	 */
	private static function rebuild_bloom_from_intel() {
		if ( ! class_exists( 'Webino_Shield_Bloom', false ) ) {
			return;
		}
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'intel_ip' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$ips = $wpdb->get_col( "SELECT value_text FROM {$table} ORDER BY id DESC LIMIT 20000" );
		Webino_Shield_Bloom::rebuild( is_array( $ips ) ? $ips : array() );
	}

	// -------------------------------------------------------------------------
	// Individual adapters
	// -------------------------------------------------------------------------

	/**
	 * @return array<string,mixed>
	 */
	public static function sync_wp_core_checksums() {
		$version = get_bloginfo( 'version' );
		$url     = "https://api.wordpress.org/core/checksums/1.0/?version={$version}&locale=" . get_locale();
		$resp    = self::fetch( $url );
		if ( is_wp_error( $resp ) ) {
			self::mark_feed_error( 'wp_core_checksums', $resp->get_error_message() );
			return array( 'error' => $resp->get_error_message() );
		}
		$body  = json_decode( wp_remote_retrieve_body( $resp ), true );
		$count = is_array( $body['checksums'] ?? null ) ? count( $body['checksums'] ) : 0;
		self::mark_feed_ok( 'wp_core_checksums', (string) $version, $count );
		set_transient( 'webino_shield_wp_checksums', $body, DAY_IN_SECONDS );
		return array( 'ok' => true, 'count' => $count );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function sync_wpvulnerability() {
		$url  = 'https://www.wpvulnerability.net/core/' . get_bloginfo( 'version' ) . '/';
		$resp = self::fetch( $url );
		if ( is_wp_error( $resp ) ) {
			return array( 'error' => $resp->get_error_message() );
		}
		$body  = json_decode( wp_remote_retrieve_body( $resp ), true );
		$count = self::import_cve_records( 'wpvulnerability', $body );
		self::mark_feed_ok( 'wpvulnerability', '', $count );
		return array( 'ok' => true, 'count' => $count );
	}

	/**
	 * Sync CISA Known Exploited Vulnerabilities catalog and generate virtual patches.
	 *
	 * @return array<string,mixed>
	 */
	public static function sync_cisa_kev() {
		$url  = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
		$resp = self::fetch( $url );
		if ( is_wp_error( $resp ) ) {
			return array( 'error' => $resp->get_error_message() );
		}
		$body  = json_decode( wp_remote_retrieve_body( $resp ), true );
		$count = 0;
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'intel_cve' );
		foreach ( (array) ( $body['vulnerabilities'] ?? array() ) as $v ) {
			$cve = sanitize_text_field( (string) ( $v['cveID'] ?? '' ) );
			if ( ! $cve ) {
				continue;
			}
			$wpdb->replace(
				$table,
				array(
					'cve_id'           => $cve,
					'slug'             => sanitize_text_field( (string) ( $v['product'] ?? '' ) ),
					'affected_version' => '',
					'severity'         => 'high',
					'kev'              => 1,
					'feed_id'          => 'cisa_kev',
					'meta'             => wp_json_encode( $v ),
				)
			);
			$count++;
		}
		self::mark_feed_ok( 'cisa_kev', '', $count );

		// Generate virtual-patch WAF rules for KEV CVEs matching installed plugins.
		self::generate_virtual_patches();

		return array( 'ok' => true, 'count' => $count );
	}

	/**
	 * Fetch and import the FireHOL Level-1 IP blocklist into intel_ip.
	 * Fails independently — never kills the WAF.
	 *
	 * @return array<string,mixed>
	 */
	public static function sync_firehol_l1() {
		$s = Webino_Dashboard_Security_Settings::get();

		// Independent enable/disable via settings feeds.firehol_l1.enabled (default on).
		if ( isset( $s['feeds']['firehol_l1']['enabled'] ) && ! $s['feeds']['firehol_l1']['enabled'] ) {
			return array( 'ok' => true, 'skipped' => true );
		}

		$url  = 'https://raw.githubusercontent.com/firehol/blocklist-ipsets/master/firehol_level1.netset';
		$resp = self::fetch( $url );
		if ( is_wp_error( $resp ) ) {
			self::mark_feed_error( 'firehol_l1', $resp->get_error_message() );
			return array( 'error' => $resp->get_error_message() );
		}

		$raw_body = wp_remote_retrieve_body( $resp );
		if ( '' === $raw_body ) {
			self::mark_feed_error( 'firehol_l1', 'Empty response' );
			return array( 'error' => 'Empty response' );
		}

		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'intel_ip' );

		// Remove existing firehol_l1 entries before re-import.
		$wpdb->delete( $table, array( 'feed_id' => 'firehol_l1' ), array( '%s' ) );

		$lines  = explode( "\n", $raw_body );
		$count  = 0;
		$errors = 0;

		foreach ( $lines as $line ) {
			if ( $count >= self::FIREHOL_MAX_RECORDS ) {
				break;
			}

			$line = trim( $line );

			// Skip comments and empty lines.
			if ( '' === $line || '#' === $line[0] ) {
				continue;
			}

			// Validate — must be a CIDR or a plain IP (v4 or v6).
			if ( ! self::is_valid_cidr_or_ip( $line ) ) {
				$errors++;
				continue;
			}

			$hash = hash( 'sha256', $line );
			$wpdb->insert(
				$table,
				array(
					'value_text' => $line,
					'value_hash' => $hash,
					'feed_id'    => 'firehol_l1',
					'label'      => 'blocklist',
				)
			);
			$count++;
		}

		self::mark_feed_ok( 'firehol_l1', '', $count );
		return array( 'ok' => true, 'count' => $count, 'parse_errors' => $errors );
	}

	/**
	 * Sync MalwareBazaar hashes via CRM mirror.
	 *
	 * @return array<string,mixed>
	 */
	public static function sync_malwarebazaar() {
		$s = Webino_Dashboard_Security_Settings::get();

		// Prefer CRM mirror package.
		$url = (string) ( $s['feeds']['crm_mirror_url'] ?? '' );
		if ( $url ) {
			$resp = self::fetch( trailingslashit( $url ) . 'malwarebazaar' );
			if ( ! is_wp_error( $resp ) ) {
				$body = json_decode( wp_remote_retrieve_body( $resp ), true );
				if ( self::verify_signature( $resp ) ) {
					$count = self::import_hashes( 'malwarebazaar', is_array( $body ) ? $body : array() );
					self::mark_feed_ok( 'malwarebazaar', 'crm', $count );
					return array( 'ok' => true, 'count' => $count, 'source' => 'crm' );
				}
				if ( ! empty( $s['feeds']['require_signature'] ) ) {
					self::mark_feed_error( 'malwarebazaar', 'Signature verification failed' );
					return array( 'error' => 'Signature verification failed' );
				}
			}
		}

		// Direct abuse.ch recent CSV (no API key) when direct_fallback allowed.
		if ( ! empty( $s['feeds']['direct_fallback'] ) ) {
			$resp = self::fetch( 'https://bazaar.abuse.ch/export/csv/recent/' );
			if ( ! is_wp_error( $resp ) ) {
				$body  = wp_remote_retrieve_body( $resp );
				$count = self::import_malwarebazaar_csv( $body );
				if ( $count > 0 ) {
					self::mark_feed_ok( 'malwarebazaar', 'abuse.ch', $count );
					return array( 'ok' => true, 'count' => $count, 'source' => 'abuse.ch' );
				}
			} else {
				self::mark_feed_error( 'malwarebazaar', $resp->get_error_message() );
				return array( 'error' => $resp->get_error_message() );
			}
		}

		self::mark_feed_error( 'malwarebazaar', 'No CRM mirror and direct fallback disabled or empty' );
		return array( 'error' => 'unavailable', 'ok' => false );
	}

	/**
	 * Spamhaus DROP list (public).
	 *
	 * @return array<string,mixed>
	 */
	public static function sync_spamhaus_drop() {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( isset( $s['feeds']['spamhaus_drop']['enabled'] ) && ! $s['feeds']['spamhaus_drop']['enabled'] ) {
			return array( 'ok' => true, 'skipped' => true );
		}

		$url  = 'https://www.spamhaus.org/drop/drop.txt';
		$resp = self::fetch( $url );
		if ( is_wp_error( $resp ) ) {
			self::mark_feed_error( 'spamhaus_drop', $resp->get_error_message() );
			return array( 'error' => $resp->get_error_message() );
		}

		$raw = wp_remote_retrieve_body( $resp );
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'intel_ip' );
		$wpdb->delete( $table, array( 'feed_id' => 'spamhaus_drop' ), array( '%s' ) );

		$count = 0;
		foreach ( explode( "\n", $raw ) as $line ) {
			$line = trim( $line );
			if ( '' === $line || ';' === $line[0] || '#' === $line[0] ) {
				continue;
			}
			// Format: CIDR ; SBL id
			$parts = preg_split( '/\s*;\s*/', $line );
			$cidr  = trim( (string) ( $parts[0] ?? '' ) );
			if ( ! self::is_valid_cidr_or_ip( $cidr ) ) {
				continue;
			}
			$wpdb->insert(
				$table,
				array(
					'value_text' => $cidr,
					'value_hash' => hash( 'sha256', $cidr ),
					'feed_id'    => 'spamhaus_drop',
					'label'      => 'drop',
				)
			);
			$count++;
			if ( $count >= 20000 ) {
				break;
			}
		}

		self::mark_feed_ok( 'spamhaus_drop', '', $count );
		return array( 'ok' => true, 'count' => $count );
	}

	/**
	 * @param string $csv CSV body from abuse.ch.
	 * @return int
	 */
	private static function import_malwarebazaar_csv( $csv ) {
		$hashes = array();
		foreach ( explode( "\n", (string) $csv ) as $line ) {
			$line = trim( $line );
			if ( '' === $line || '#' === $line[0] ) {
				continue;
			}
			// Quoted CSV — sha256 is typically column index 1.
			if ( preg_match( '/"([a-f0-9]{64})"/i', $line, $m ) ) {
				$hashes[] = strtolower( $m[1] );
			}
		}
		return self::import_hashes( 'malwarebazaar', array( 'hashes' => $hashes ) );
	}

	// -------------------------------------------------------------------------
	// Virtual patch generation
	// -------------------------------------------------------------------------

	/**
	 * Generate virtual-patch WAF rules for KEV CVEs matching installed plugins.
	 * Rules are written to option webino_shield_virtual_patch_rules.
	 * Called after CISA KEV sync. See Webino_Shield_Rules::virtual_patch_rules().
	 *
	 * @return void
	 */
	public static function generate_virtual_patches() {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['rules']['virtual_patch'] ) ) {
			return;
		}

		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$min_severity = strtolower( (string) ( $s['rules']['virtual_patch_min_severity'] ?? 'high' ) );

		// Build set of installed plugin slugs (first folder segment).
		$installed = get_plugins();
		$slugs     = array();
		foreach ( array_keys( $installed ) as $basename ) {
			$slug = strstr( (string) $basename, '/', true );
			if ( $slug && '' !== $slug ) {
				$slugs[] = sanitize_key( $slug );
			}
		}

		if ( empty( $slugs ) ) {
			return;
		}

		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'intel_cve' );

		$placeholders = implode( ',', array_fill( 0, count( $slugs ), '%s' ) );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$prepare_args = array_merge( array( "SELECT * FROM {$table} WHERE kev = 1 AND slug IN ({$placeholders})" ), $slugs );
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$rows = $wpdb->get_results( call_user_func_array( array( $wpdb, 'prepare' ), $prepare_args ), ARRAY_A );

		$severity_map = array( 'info' => 0, 'low' => 1, 'medium' => 2, 'high' => 3, 'critical' => 4 );
		$min_score    = $severity_map[ $min_severity ] ?? 3;

		$rules = array();
		foreach ( $rows ?: array() as $row ) {
			$cve      = (string) ( $row['cve_id'] ?? '' );
			$slug     = (string) ( $row['slug'] ?? '' );
			$severity = strtolower( (string) ( $row['severity'] ?? 'high' ) );

			if ( ( $severity_map[ $severity ] ?? 0 ) < $min_score ) {
				continue;
			}

			$meta       = json_decode( (string) ( $row['meta'] ?? '{}' ), true );
			$conditions = self::build_vp_conditions( $slug, $meta );

			$rule_id = 'vp_' . sanitize_key( str_replace( '-', '_', strtolower( $cve ) ) );

			$rules[] = array(
				'id'         => $rule_id,
				'name'       => 'Virtual patch: ' . $cve . ' (' . $slug . ')',
				'enabled'    => true,
				'score'      => 10,
				'action'     => 'virtual_patch_block',
				'tag'        => 'virtual_patch',
				'cve_id'     => $cve,
				'slug'       => $slug,
				'severity'   => $severity,
				'conditions' => $conditions,
			);
		}

		update_option( 'webino_shield_virtual_patch_rules', $rules, false );
	}

	/**
	 * Build WAF conditions for a virtual-patch rule from CVE meta.
	 *
	 * @param string              $slug Plugin slug.
	 * @param array<string,mixed> $meta CVE metadata.
	 * @return array<int,array<string,mixed>>
	 */
	private static function build_vp_conditions( $slug, $meta ) {
		$conditions = array();
		$notes = strtolower( (string) ( $meta['notes'] ?? '' ) );
		$vname = strtolower( (string) ( $meta['vulnerabilityName'] ?? '' ) );
		$blob  = $notes . ' ' . $vname;

		// Never match bare plugin slug in path (locks /wp-admin pages). Scope to plugin front-end path + attack signal.
		$plugin_front = '/wp-content/plugins/' . sanitize_title( $slug );

		if (
			false !== strpos( $blob, 'file upload' ) ||
			false !== strpos( $blob, 'unrestricted upload' )
		) {
			$conditions[] = array( 'field' => 'path', 'op' => 'contains', 'value' => $plugin_front );
			$conditions[] = array( 'field' => 'path', 'op' => 'contains', 'value' => 'upload' );
		} elseif (
			false !== strpos( $blob, 'rce' ) ||
			false !== strpos( $blob, 'remote code' ) ||
			false !== strpos( $blob, 'code execution' )
		) {
			$conditions[] = array( 'field' => 'path', 'op' => 'contains', 'value' => $plugin_front );
			$conditions[] = array(
				'field' => 'payload',
				'op'    => 'regex',
				'value' => '/\b(eval|assert|system|passthru|shell_exec)\s*\(/i',
			);
		} elseif (
			false !== strpos( $blob, 'sql injection' ) ||
			false !== strpos( $blob, 'sqli' )
		) {
			$conditions[] = array( 'field' => 'path', 'op' => 'contains', 'value' => $plugin_front );
			$conditions[] = array( 'field' => 'payload', 'op' => 'regex', 'value' => '/union\s+select/i' );
		} elseif (
			false !== strpos( $blob, 'xss' ) ||
			false !== strpos( $blob, 'cross-site scripting' )
		) {
			$conditions[] = array( 'field' => 'path', 'op' => 'contains', 'value' => $plugin_front );
			$conditions[] = array( 'field' => 'payload', 'op' => 'regex', 'value' => '/(<script|javascript:)/i' );
		} else {
			// Generic KEV: only block suspicious payloads hitting the plugin public path (not wp-admin).
			$conditions[] = array( 'field' => 'path', 'op' => 'contains', 'value' => $plugin_front );
			$conditions[] = array(
				'field' => 'path',
				'op'    => 'not_contains',
				'value' => '/wp-admin',
			);
			$conditions[] = array(
				'field' => 'payload',
				'op'    => 'regex',
				'value' => '/(<script|union\s+select|eval\s*\(|\.\.\/)/i',
			);
		}

		return $conditions;
	}

	// -------------------------------------------------------------------------
	// Internal helpers
	// -------------------------------------------------------------------------

	/**
	 * Route fetch through CRM mirror first, then direct fallback if allowed.
	 *
	 * @param string $url URL.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function fetch( $url ) {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( ! empty( $s['feeds']['crm_mirror'] ) && ! empty( $s['feeds']['crm_mirror_url'] ) ) {
			$mirror = trailingslashit( (string) $s['feeds']['crm_mirror_url'] ) . 'proxy?url=' . rawurlencode( $url );
			$resp   = wp_remote_get( $mirror, array( 'timeout' => 30 ) );
			if ( ! is_wp_error( $resp ) ) {
				return $resp;
			}
		}
		if ( empty( $s['feeds']['direct_fallback'] ) ) {
			return new WP_Error( 'feeds_offline', 'Direct fallback disabled' );
		}
		return wp_remote_get( $url, array( 'timeout' => 30 ) );
	}

	/**
	 * Verify Ed25519 signature on a feed response.
	 *
	 * When feeds.require_signature=true:
	 *   - ONLY accepts Ed25519 via x-webino-signature header + webino_shield_feed_pubkey option.
	 *   - REJECTS x-webino-sha256 fallback (SHA-256 alone is NOT a signature).
	 *   - Without a valid key/sig → returns false.
	 * When feeds.require_signature=false: always returns true.
	 *
	 * @param array<string,mixed>|WP_Error $resp Response.
	 * @return bool
	 */
	private static function verify_signature( $resp ) {
		if ( is_wp_error( $resp ) ) {
			return false;
		}

		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['feeds']['require_signature'] ) ) {
			return true;
		}

		// Ed25519 via libsodium — the ONLY accepted method.
		$sig = wp_remote_retrieve_header( $resp, 'x-webino-signature' );
		if ( ! $sig ) {
			return false;
		}

		if ( ! function_exists( 'sodium_crypto_sign_verify_detached' ) ) {
			// libsodium not available → cannot verify → reject.
			return false;
		}

		$key = get_option( 'webino_shield_feed_pubkey', '' );
		if ( ! is_string( $key ) || '' === $key ) {
			return false;
		}

		$decoded_sig = base64_decode( $sig, true );
		$decoded_key = base64_decode( $key, true );
		if ( false === $decoded_sig || false === $decoded_key ) {
			return false;
		}

		$body = wp_remote_retrieve_body( $resp );
		return sodium_crypto_sign_verify_detached( $decoded_sig, $body, $decoded_key );
	}

	/**
	 * Validate that $value is a valid IPv4/IPv6 address or CIDR notation.
	 *
	 * @param string $value Value to validate.
	 * @return bool
	 */
	private static function is_valid_cidr_or_ip( $value ) {
		if ( false !== strpos( $value, '/' ) ) {
			// CIDR notation.
			list( $ip, $prefix ) = explode( '/', $value, 2 );
			if ( ! filter_var( $ip, FILTER_VALIDATE_IP ) ) {
				return false;
			}
			$max_prefix = false !== strpos( $ip, ':' ) ? 128 : 32;
			$prefix      = (int) $prefix;
			return $prefix >= 0 && $prefix <= $max_prefix;
		}

		return false !== filter_var( $value, FILTER_VALIDATE_IP );
	}

	/**
	 * @param string              $feed Feed id.
	 * @param array<string,mixed> $body Body.
	 * @return int
	 */
	private static function import_cve_records( $feed, $body ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'intel_cve' );
		$count = 0;
		$items = isset( $body['data'] ) ? (array) $body['data'] : (array) $body;
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$cve = sanitize_text_field( (string) ( $item['cve'] ?? $item['id'] ?? '' ) );
			if ( ! $cve ) {
				continue;
			}
			$wpdb->insert(
				$table,
				array(
					'cve_id'           => $cve,
					'slug'             => sanitize_text_field( (string) ( $item['slug'] ?? '' ) ),
					'affected_version' => sanitize_text_field( (string) ( $item['version'] ?? '' ) ),
					'severity'         => sanitize_key( (string) ( $item['severity'] ?? 'medium' ) ),
					'kev'              => 0,
					'feed_id'          => $feed,
					'meta'             => wp_json_encode( $item ),
				)
			);
			$count++;
		}
		return $count;
	}

	/**
	 * @param string              $feed Feed.
	 * @param array<string,mixed> $body Body.
	 * @return int
	 */
	private static function import_hashes( $feed, $body ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'intel_hash' );
		$count = 0;
		foreach ( (array) ( $body['hashes'] ?? $body ) as $hash ) {
			$hash = sanitize_text_field( is_string( $hash ) ? $hash : (string) ( $hash['sha256'] ?? '' ) );
			if ( 64 !== strlen( $hash ) ) {
				continue;
			}
			$wpdb->replace(
				$table,
				array(
					'hash_sha256' => $hash,
					'feed_id'     => $feed,
					'label'       => 'malware',
				)
			);
			$count++;
		}
		return $count;
	}

	/**
	 * @param string $feed_id Feed.
	 * @param string $version Version.
	 * @param int    $count   Count.
	 * @return void
	 */
	private static function mark_feed_ok( $feed_id, $version, $count ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$wpdb->replace(
			Webino_Dashboard_Security_Db::table( 'feeds' ),
			array(
				'feed_id'      => sanitize_key( $feed_id ),
				'version'      => sanitize_text_field( $version ),
				'last_ok'      => current_time( 'mysql', true ),
				'last_error'   => '',
				'record_count' => (int) $count,
			)
		);
	}

	/**
	 * @param string $feed_id Feed.
	 * @param string $error   Error.
	 * @return void
	 */
	private static function mark_feed_error( $feed_id, $error ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$wpdb->replace(
			Webino_Dashboard_Security_Db::table( 'feeds' ),
			array(
				'feed_id'    => sanitize_key( $feed_id ),
				'last_error' => sanitize_text_field( substr( $error, 0, 255 ) ),
			)
		);
		Webino_Shield_Notify::dispatch( 'feed_fail', array( 'feed' => $feed_id, 'error' => $error ) );
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function status() {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'feeds' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY feed_id ASC", ARRAY_A ) ?: array();
	}
}
