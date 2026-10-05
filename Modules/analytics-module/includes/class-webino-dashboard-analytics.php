<?php
/**
 * Analytics module bootstrap and settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-webino-dashboard-analytics-db.php';
require_once __DIR__ . '/class-webino-dashboard-analytics-user-agent.php';
require_once __DIR__ . '/class-webino-dashboard-analytics-geo.php';
require_once __DIR__ . '/class-webino-dashboard-analytics-tracker.php';
require_once __DIR__ . '/class-webino-dashboard-analytics-wp-statistics.php';
require_once __DIR__ . '/class-webino-dashboard-analytics-query.php';
require_once __DIR__ . '/class-webino-dashboard-analytics-kpis.php';
require_once __DIR__ . '/class-webino-dashboard-analytics-cron.php';

/**
 * Native site analytics (WP Statistics–style, phase 1).
 */
class Webino_Dashboard_Analytics {

	const OPTION_SETTINGS = 'webino_dashboard_analytics_settings';
	const CRON_HOOK       = 'webino_dashboard_analytics_daily';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'bootstrap' ), 5 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_tracker' ), 20 );
		Webino_Dashboard_Analytics_Cron::init();
	}

	/**
	 * @return void
	 */
	public static function bootstrap() {
		Webino_Dashboard_Analytics_Db::ensure_tables();
		self::maybe_rotate_daily_salt();
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function default_settings() {
		return array(
			'tracking_enabled'  => true,
			'anonymize_ip'      => true,
			'exclude_roles'     => array( 'administrator' ),
			'exclude_ips'       => '',
			'exclude_urls'      => "/dashboard\n/wp-admin\n/wp-login",
			'online_timeout'    => 5,
			'retention_days'    => 90,
			'record_logged_in'  => false,
			'geoip_path'        => '',
			'bypass_adblocker'  => false,
			'hit_token'         => wp_generate_password( 32, false, false ),
			'daily_salt'        => wp_generate_password( 16, false, false ),
			'daily_salt_date'   => gmdate( 'Y-m-d' ),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_settings() {
		$defaults = self::default_settings();
		$stored   = get_option( self::OPTION_SETTINGS, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		$merged = array_merge( $defaults, $stored );
		if ( empty( $merged['hit_token'] ) ) {
			$merged['hit_token'] = wp_generate_password( 32, false, false );
			update_option( self::OPTION_SETTINGS, $merged, false );
		}
		return $merged;
	}

	/**
	 * @param array<string,mixed> $input Raw settings.
	 * @return array<string,mixed>
	 */
	public static function sanitize_settings( $input ) {
		$cur  = self::get_settings();
		$out  = $cur;
		$raw  = is_array( $input ) ? $input : array();

		if ( array_key_exists( 'tracking_enabled', $raw ) ) {
			$out['tracking_enabled'] = (bool) $raw['tracking_enabled'];
		}
		if ( array_key_exists( 'anonymize_ip', $raw ) ) {
			$out['anonymize_ip'] = (bool) $raw['anonymize_ip'];
		}
		if ( array_key_exists( 'record_logged_in', $raw ) ) {
			$out['record_logged_in'] = (bool) $raw['record_logged_in'];
		}
		if ( array_key_exists( 'bypass_adblocker', $raw ) ) {
			$out['bypass_adblocker'] = (bool) $raw['bypass_adblocker'];
		}
		if ( isset( $raw['online_timeout'] ) ) {
			$out['online_timeout'] = max( 1, min( 60, (int) $raw['online_timeout'] ) );
		}
		if ( isset( $raw['retention_days'] ) ) {
			$out['retention_days'] = max( 7, min( 730, (int) $raw['retention_days'] ) );
		}
		if ( isset( $raw['exclude_ips'] ) ) {
			$out['exclude_ips'] = sanitize_textarea_field( (string) $raw['exclude_ips'] );
		}
		if ( isset( $raw['exclude_urls'] ) ) {
			$out['exclude_urls'] = sanitize_textarea_field( (string) $raw['exclude_urls'] );
		}
		if ( isset( $raw['geoip_path'] ) ) {
			$out['geoip_path'] = sanitize_text_field( (string) $raw['geoip_path'] );
		}
		if ( isset( $raw['exclude_roles'] ) && is_array( $raw['exclude_roles'] ) ) {
			$out['exclude_roles'] = array_values(
				array_filter(
					array_map( 'sanitize_key', $raw['exclude_roles'] )
				)
			);
		}

		return $out;
	}

	/**
	 * Data source for dashboard reads.
	 *
	 * @return string native|wp-statistics
	 */
	public static function data_source() {
		if ( class_exists( 'Webino_Dashboard_Analytics_Wp_Statistics', false )
			&& Webino_Dashboard_Analytics_Wp_Statistics::is_active() ) {
			return 'wp-statistics';
		}
		return 'native';
	}

	/**
	 * Ensure renamed tracker file exists for adblock bypass.
	 *
	 * @return string Relative assets filename (may fall back to analytics-tracker.js).
	 */
	public static function ensure_bypass_tracker_file() {
		$src  = WEBINO_DASHBOARD_DIR . 'assets/analytics-tracker.js';
		$name = 'wd-' . substr( md5( (string) get_option( 'siteurl' ) ), 0, 8 ) . '.js';
		$dest = WEBINO_DASHBOARD_DIR . 'assets/' . $name;
		if ( ! is_readable( $src ) ) {
			return 'analytics-tracker.js';
		}
		$needs_copy = ! is_readable( $dest );
		if ( ! $needs_copy && filemtime( $src ) > filemtime( $dest ) ) {
			$needs_copy = true;
		}
		if ( ! $needs_copy ) {
			return $name;
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_copy
		if ( @copy( $src, $dest ) ) {
			return $name;
		}
		return is_readable( $dest ) ? $name : 'analytics-tracker.js';
	}

	/**
	 * @return bool
	 */
	public static function is_module_active() {
		return Webino_Dashboard_Modules::is_module_enabled( 'analytics' );
	}

	/**
	 * @return bool
	 */
	public static function tracking_enabled() {
		if ( ! self::is_module_active() ) {
			return false;
		}
		$s = self::get_settings();
		return ! empty( $s['tracking_enabled'] );
	}

	/**
	 * @return void
	 */
	private static function maybe_rotate_daily_salt() {
		$s    = self::get_settings();
		$today = gmdate( 'Y-m-d' );
		if ( ( $s['daily_salt_date'] ?? '' ) === $today ) {
			return;
		}
		$s['daily_salt']      = wp_generate_password( 16, false, false );
		$s['daily_salt_date'] = $today;
		update_option( self::OPTION_SETTINGS, $s, false );
	}

	/**
	 * @return string
	 */
	public static function get_client_ip() {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) wp_unslash( $_SERVER['REMOTE_ADDR'] ) : '';
		return sanitize_text_field( $ip );
	}

	/**
	 * @param string $ip IP.
	 * @return string
	 */
	public static function anonymize_ip( $ip ) {
		if ( false !== strpos( $ip, ':' ) ) {
			$parts = explode( ':', $ip );
			return implode( ':', array_slice( $parts, 0, 4 ) ) . '::';
		}
		$parts = explode( '.', $ip );
		if ( count( $parts ) >= 4 ) {
			$parts[3] = '0';
			return implode( '.', $parts );
		}
		return $ip;
	}

	/**
	 * @param string $ip IP.
	 * @param string $ua User agent.
	 * @return string
	 */
	public static function visitor_hash( $ip, $ua ) {
		$s   = self::get_settings();
		$use = $ip;
		if ( ! empty( $s['anonymize_ip'] ) ) {
			$use = self::anonymize_ip( $ip );
		}
		$salt = (string) ( $s['daily_salt'] ?? '' );
		return hash( 'sha256', $use . '|' . (string) $ua . '|' . $salt );
	}

	/**
	 * Enqueue tracker on public site (not dashboard).
	 *
	 * @return void
	 */
	public static function enqueue_tracker() {
		if ( is_admin() || ! self::tracking_enabled() ) {
			return;
		}

		// WP Statistics owns front-end tracking when active — avoid double counting.
		if ( 'wp-statistics' === self::data_source() ) {
			return;
		}

		$rewrite = webino_dashboard()->rewrite;
		if ( $rewrite && $rewrite->is_dashboard_request() ) {
			return;
		}

		Webino_Dashboard_Analytics_Db::ensure_tables();

		$settings = self::get_settings();
		$handle   = 'webino-analytics-tracker';
		$file     = 'analytics-tracker.js';
		if ( ! empty( $settings['bypass_adblocker'] ) ) {
			$file = self::ensure_bypass_tracker_file();
		}

		$path = WEBINO_DASHBOARD_DIR . 'assets/' . $file;
		if ( ! is_readable( $path ) ) {
			$file = 'analytics-tracker.js';
		}

		wp_enqueue_script(
			$handle,
			WEBINO_DASHBOARD_URL . 'assets/' . $file,
			array(),
			WEBINO_DASHBOARD_VERSION,
			true
		);

		wp_localize_script(
			$handle,
			'webinoAnalytics',
			array(
				'endpoint'    => rest_url( 'webino-dashboard/v1/analytics/hit' ),
				'ajaxUrl'     => admin_url( 'admin-ajax.php' ),
				'ajaxAction'  => 'webino_dashboard_analytics_hit',
				'preferAjax'  => true,
				'token'       => (string) $settings['hit_token'],
			)
		);
	}
}
