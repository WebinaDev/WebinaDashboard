<?php
/**
 * Security module settings schema and profiles.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Nested settings for Webino Shield.
 */
final class Webino_Dashboard_Security_Settings {

	const SCHEMA_VERSION = '1.0.0';

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		$rate_classes = array( 'login', 'xmlrpc', 'rest_auth', 'rest_public', 'checkout', 'search', 'comment', 'admin_ajax', 'upload', 'shield_public' );
		$rate         = array();
		foreach ( $rate_classes as $class ) {
			$rate[ $class ] = self::default_rate_class( $class );
		}

		$feed_ids = array(
			'wp_core_checksums', 'wpvulnerability', 'cisa_kev', 'malwarebazaar',
			'firehol_l1', 'spamhaus_drop',
		);
		$feeds = array(
			'crm_mirror'         => true,
			'direct_fallback'    => true,
			'require_signature'  => true,
			'sync_hours'         => 6,
			'stale_warn_hours'   => 72,
			'disk_quota_mb'      => 256,
			'crm_mirror_url'     => '',
			'network_shared'     => false,
		);
		foreach ( $feed_ids as $fid ) {
			$feeds[ $fid ] = array(
				'enabled'       => true,
				'api_key'       => '',
				'priority'      => 10,
				'max_age_hours' => 72,
			);
		}

		return array(
			'schema_version' => self::SCHEMA_VERSION,
			// Geo-level access control settings (independent from per-IP access section).
			// IMPORTANT: block_countries MUST remain empty by default — never auto-block any country.
			'geo'            => array(
				'block_countries' => array(), // Never default any country code here.
				'block_asn'       => array(),
				'block_tor'       => false,
			),
			'general'        => array(
				'enabled'                => true,
				'profile'                => 'recommended',
				'learning_mode'          => true,
				'learning_days'          => 7,
				'timezone_window'        => 'site',
				'data_region'            => 'local',
				'language_alerts'        => 'dashboard',
				'self_guard'             => true,
				'panic_unlock_enabled'   => true,
				'panic_unlock_ttl_hours' => 2,
				'uninstall_wipe'         => false,
				'shop_manager_view'      => false,
				'wizard_completed'       => false,
			),
			'privacy' => array(
				'anonymize_ip'             => true,
				'store_request_body'       => false,
				'body_max_bytes'           => 4096,
				'mask_query_secrets'       => true,
				'retention_events_days'    => 30,
				'retention_payloads_days'  => 7,
				'retention_findings_days'  => 365,
				'retention_audit_days'     => 365,
				'retention_snapshots_days' => 14,
				'hash_usernames_in_export' => false,
			),
			'waf' => array(
				'enabled'                  => true,
				'layer0_prepend'           => false,
				'layer1_dropin'            => true,
				'layer2_mu'                => true,
				'layer3_hooks'             => true,
				'mode'                     => 'learning',
				'fail_open'                => true,
				'circuit_breaker_errors'   => 20,
				'max_request_inspect_bytes'=> 131072,
				'inspect_uploads'          => true,
				'inspect_json'             => true,
				'inspect_xml'              => true,
				'skip_media_ext'           => 'jpg,jpeg,png,webp,woff2,mp4',
				'skip_paths'               => '/dashboard,/wp-cron.php',
				'skip_rest_namespaces'     => 'webino-dashboard/v1',
				'challenge_provider'       => 'none',
				'block_http_code'          => 403,
				'tarpit_seconds'           => 0,
				'page_branding'            => true,
			),
			'rules' => array(
				'crs_enabled'              => true,
				'crs_paranoia'             => 1,
				'crs_anomaly_in'           => 5,
				'crs_anomaly_out'          => 4,
				'wp_ruleset'               => true,
				'woo_ruleset'              => 'auto',
				'virtual_patch'            => true,
				'virtual_patch_min_severity'=> 'high',
				'custom_enabled'           => true,
				'regex_timeout_ms'         => 20,
				'max_rules_per_req'        => 500,
				'log_only_ids'             => array(),
				'disabled_ids'             => array(),
			),
			'access' => array(
				'allow_ips'                   => array(),
				'allow_cidrs'                 => array(),
				'allow_asns'                  => array(),
				'allow_countries'             => array(),
				'block_ips'                   => array(),
				'block_cidrs'                 => array(),
				'block_asns'                  => array(),
				'block_countries'             => array(),
				'block_continents'            => array(),
				'block_ua'                    => array(),
				'block_referrers'             => array(),
				'block_tor'                   => false,
				'block_vpn'                   => false,
				'block_datacenter_on_login'   => false,
				'auto_block_enabled'          => true,
				'auto_block_threshold'        => 8,
				'auto_block_window_min'       => 10,
				'auto_block_duration_min'     => 30,
				'auto_block_max_duration_min' => 1440,
				'auto_block_escalate'         => true,
				'never_block_private_ip'      => true,
				'never_block_allowlisted_role'=> 'administrator',
			),
			'rate'  => $rate,
			'bots'  => array(
				'verified_allow'       => true,
				'verify_ip_ranges'     => true,
				'block_empty_ua'       => true,
				'block_ai_crawlers'    => false,
				'challenge_unknown'    => false,
				'score_404_threshold'  => 30,
				'score_404_window_min' => 5,
			),
			'login' => array(
				'protect'               => true,
				'max_fail'              => 5,
				'window_min'            => 10,
				'lock_min'              => 30,
				'same_response_time_ms' => 250,
				'hide_errors'           => true,
				'disable_xmlrpc'        => true,
				'xmlrpc_pingback_only'  => false,
				'disable_app_passwords' => false,
				'disable_rest_users'    => true,
				'disable_author_enum'   => true,
				'captcha'               => false,
				'honeypot'              => true,
				'2fa_optional'          => true,
				'2fa_required_roles'    => array( 'administrator' ),
				'idle_timeout_min'      => 0,
				'single_session'        => false,
				'limit_username'        => array(),
			),
			'headers' => array(
				'enabled'            => true,
				'hsts'               => false,
				'hsts_max_age'       => 15552000,
				'hsts_subdomains'    => false,
				'hsts_preload'       => false,
				'xcto'               => true,
				'referrer'           => 'strict-origin-when-cross-origin',
				'frame'              => 'sameorigin',
				'csp_mode'           => 'off',
				'csp'                => array(),
				'permissions_policy' => 'camera=(), microphone=(), geolocation=()',
				'coop'               => 'off',
				'remove_powered_by'  => true,
				'remove_wp_version'  => true,
			),
			'scan' => array(
				'default_profile'  => 'standard',
				'schedule'         => 'daily',
				'schedule_hour'    => 3,
				'low_traffic_only' => true,
				'include_uploads'  => true,
				'include_db'       => true,
				'include_vuln'     => true,
				'include_secrets'  => true,
				'include_dns'      => true,
				'follow_symlinks'  => false,
				'exclude_globs'    => 'node_modules,.git,cache,backup*',
				'max_file_mb'      => 8,
				'chunk_files'      => 200,
				'yara_enabled'     => true,
				'clam_enabled'     => false,
				'abandoned_days'   => 365,
				'auto_heal_safe'   => false,
				'notify_on'        => array( 'critical', 'high' ),
			),
			'heal' => array(
				'require_reconfirm'  => true,
				'allow_delete'       => false,
				'allow_salt_rotate'  => true,
				'allow_user_disable' => true,
				'snapshot_always'    => true,
				'max_batch'          => 50,
				'forbid_paths'       => array(),
			),
			'feeds'   => $feeds,
			'notify'  => array(
				'email'                  => true,
				'site'                   => true,
				'sms'                    => false,
				'telegram'               => false,
				'bale'                   => false,
				'digest'                 => 'daily',
				'events'                 => array(
					'block_auto'   => true,
					'malware'      => true,
					'kev'          => true,
					'admin_login'  => true,
					'heal'         => true,
					'feed_fail'    => true,
					'canary'       => true,
				),
				'throttle_min'         => 15,
			),
			'perf' => array(
				'budget_ms_l0'        => 8,
				'budget_ms_l3'        => 20,
				'sample_log_rate'     => 0.1,
				'use_object_cache'    => true,
				'use_bloom'           => true,
				'disable_on_wp_cli'   => true,
				'disable_on_cron'     => false,
			),
			'compat' => array(
				'detect_other_waf'       => true,
				'auto_downgrade_if_cf_waf'=> false,
				'trust_cf_connecting_ip' => true,
				'trust_arvan'            => true,
				'trust_x_forwarded_for'  => false,
			),
		);
	}

	/**
	 * @param string $class Rate class.
	 * @return array<string,mixed>
	 */
	private static function default_rate_class( $class ) {
		$map = array(
			'login'        => array( 'limit' => 5, 'window_sec' => 600, 'action' => 'challenge', 'block_min' => 30 ),
			'xmlrpc'       => array( 'limit' => 10, 'window_sec' => 300, 'action' => 'block', 'block_min' => 30 ),
			'rest_auth'    => array( 'limit' => 20, 'window_sec' => 600, 'action' => 'block', 'block_min' => 15 ),
			'rest_public'  => array( 'limit' => 120, 'window_sec' => 60, 'action' => 'block', 'block_min' => 10 ),
			'checkout'     => array( 'limit' => 10, 'window_sec' => 600, 'action' => 'block', 'block_min' => 30 ),
			'search'       => array( 'limit' => 30, 'window_sec' => 60, 'action' => 'block', 'block_min' => 10 ),
			'comment'      => array( 'limit' => 5, 'window_sec' => 600, 'action' => 'block', 'block_min' => 30 ),
			'admin_ajax'   => array( 'limit' => 60, 'window_sec' => 60, 'action' => 'block', 'block_min' => 10 ),
			'upload'       => array( 'limit' => 20, 'window_sec' => 600, 'action' => 'block', 'block_min' => 15 ),
			'shield_public'=> array( 'limit' => 30, 'window_sec' => 60, 'action' => 'block', 'block_min' => 15 ),
		);
		return isset( $map[ $class ] ) ? $map[ $class ] : array(
			'limit'      => 60,
			'window_sec' => 60,
			'action'     => 'block',
			'block_min'  => 10,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		$defaults = self::defaults();
		$stored   = get_option( Webino_Dashboard_Security::OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return self::array_merge_deep( $defaults, $stored );
	}

	/**
	 * @param array<string,mixed> $partial Partial settings.
	 * @return array<string,mixed>
	 */
	public static function update( $partial ) {
		$current = self::get();
		$merged  = self::array_merge_deep( $current, is_array( $partial ) ? $partial : array() );
		update_option( Webino_Dashboard_Security::OPTION, $merged, false );
		if ( ! empty( $merged['general']['wizard_completed'] )
			&& class_exists( 'Webino_Dashboard_Security_Install', false ) ) {
			Webino_Dashboard_Security_Install::mark_wizard_completed();
		}
		if ( class_exists( 'Webino_Shield_Rules', false ) ) {
			Webino_Shield_Rules::compile_runtime();
		}

		// Record when learning mode was first enabled so the auto-exit cron can act on it.
		if ( ! empty( $merged['general']['learning_mode'] )
			&& ! get_option( 'webino_shield_learning_started_at' ) ) {
			update_option( 'webino_shield_learning_started_at', time(), false );
		}

		return self::mask_secrets( $merged );
	}

	/**
	 * @param string $name Profile name.
	 * @return array<string,mixed>
	 */
	public static function apply_profile( $name ) {
		$name = sanitize_key( $name );
		$base = self::defaults();
		$base['general']['profile'] = $name;

		switch ( $name ) {
			case 'beginner':
				$base['waf']['mode']           = 'learning';
				$base['rules']['crs_paranoia'] = 1;
				$base['login']['2fa_required_roles'] = array();
				break;
			case 'store':
				$base['waf']['mode']                 = 'enforce';
				$base['login']['2fa_required_roles'] = array( 'administrator' );
				$base['headers']['hsts']             = is_ssl();
				break;
			case 'paranoid':
				$base['waf']['mode']                 = 'learning';
				$base['rules']['crs_paranoia']       = 3;
				$base['login']['2fa_required_roles'] = array( 'administrator' );
				$base['login']['idle_timeout_min']   = 30;
				$base['headers']['csp_mode']         = 'report-only';
				$base['access']['block_datacenter_on_login'] = true;
				break;
			default:
				// recommended — defaults already set.
				break;
		}

		update_option( Webino_Dashboard_Security::OPTION, $base, false );
		if ( class_exists( 'Webino_Shield_Rules', false ) ) {
			Webino_Shield_Rules::compile_runtime();
		}
		return self::mask_secrets( $base );
	}

	/**
	 * UI schema metadata.
	 *
	 * @return array<string,mixed>
	 */
	public static function schema() {
		return array(
			'version'  => self::SCHEMA_VERSION,
			'profiles' => array( 'beginner', 'recommended', 'store', 'paranoid' ),
			'sections' => array(
				'general', 'privacy', 'waf', 'rules', 'geo', 'access', 'rate', 'bots',
				'login', 'headers', 'scan', 'heal', 'feeds', 'notify', 'perf', 'compat',
			),
		);
	}

	/**
	 * @param array<string,mixed> $settings Settings.
	 * @return array<string,mixed>
	 */
	public static function mask_secrets( $settings ) {
		$out = $settings;
		if ( isset( $out['feeds'] ) && is_array( $out['feeds'] ) ) {
			foreach ( $out['feeds'] as $key => $val ) {
				if ( is_array( $val ) && isset( $val['api_key'] ) && '' !== (string) $val['api_key'] ) {
					$out['feeds'][ $key ]['api_key'] = '••••••••';
				}
			}
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $base Base array.
	 * @param array<string,mixed> $over Overlay.
	 * @return array<string,mixed>
	 */
	private static function array_merge_deep( $base, $over ) {
		foreach ( $over as $key => $value ) {
			if ( is_array( $value ) && isset( $base[ $key ] ) && is_array( $base[ $key ] ) && self::is_assoc( $value ) ) {
				$base[ $key ] = self::array_merge_deep( $base[ $key ], $value );
			} else {
				$base[ $key ] = $value;
			}
		}
		return $base;
	}

	/**
	 * @param array<mixed> $arr Array.
	 * @return bool
	 */
	private static function is_assoc( $arr ) {
		if ( array() === $arr ) {
			return true;
		}
		return array_keys( $arr ) !== range( 0, count( $arr ) - 1 );
	}
}
