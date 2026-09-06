<?php
/**
 * Webino Shield security module facade.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-webino-dashboard-security-settings.php';
require_once __DIR__ . '/class-webino-dashboard-security-db.php';
require_once __DIR__ . '/class-webino-dashboard-security-install.php';
require_once __DIR__ . '/class-webino-shield-engine.php';
require_once __DIR__ . '/class-webino-shield-waf.php';
require_once __DIR__ . '/class-webino-shield-login.php';
require_once __DIR__ . '/class-webino-shield-rate-limiter.php';
require_once __DIR__ . '/class-webino-shield-blocklist.php';
require_once __DIR__ . '/class-webino-shield-audit.php';
require_once __DIR__ . '/class-webino-shield-notify.php';
require_once __DIR__ . '/class-webino-shield-rules.php';
require_once __DIR__ . '/class-webino-shield-geo.php';
require_once __DIR__ . '/class-webino-shield-headers.php';
require_once __DIR__ . '/class-webino-shield-malware.php';
require_once __DIR__ . '/class-webino-shield-db-scan.php';
require_once __DIR__ . '/class-webino-shield-heal.php';
require_once __DIR__ . '/class-webino-shield-feeds.php';
require_once __DIR__ . '/class-webino-shield-scanner.php';
require_once __DIR__ . '/class-webino-shield-tools.php';
require_once __DIR__ . '/class-webino-shield-reports.php';
require_once __DIR__ . '/class-webino-shield-2fa.php';
require_once __DIR__ . '/class-webino-shield-canary.php';
require_once __DIR__ . '/class-webino-shield-forensics.php';
require_once __DIR__ . '/class-webino-shield-self-guard.php';
require_once __DIR__ . '/class-webino-shield-bloom.php';
require_once __DIR__ . '/class-webino-shield-cli.php';

/**
 * Facade for Webino Shield security module.
 */
final class Webino_Dashboard_Security {

	const CAP_VIEW   = 'webino_view_security';
	const CAP_MANAGE = 'webino_manage_security';
	const CAP_HEAL   = 'webino_heal_security';
	const OPTION     = 'webino_dashboard_security';
	const SLUG       = 'security-module';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_init', array( __CLASS__, 'ensure_capabilities' ) );
	}

	/**
	 * Wire runtime engines. Called directly from bootstrap.php after module load (init@10).
	 *
	 * @return void
	 */
	public static function bootstrap() {
		static $bootstrapped = false;
		if ( $bootstrapped ) {
			return;
		}
		$bootstrapped = true;

		if ( ! self::is_module_active() ) {
			return;
		}

		Webino_Dashboard_Security_Install::maybe_install();
		Webino_Dashboard_Security_Db::ensure_tables();
		self::ensure_capabilities();

		Webino_Shield_Waf::init();
		Webino_Shield_Login::init();
		Webino_Shield_Rate_Limiter::init();
		Webino_Shield_Blocklist::init();
		Webino_Shield_Rules::init();
		Webino_Shield_Scanner::init();
		Webino_Shield_Feeds::init();
		Webino_Shield_Headers::init();
		Webino_Shield_Notify::init();
		Webino_Shield_2FA::init();
		Webino_Shield_Canary::init();
		Webino_Shield_Self_Guard::init();
		Webino_Shield_Cli::init();

		// Register learning-mode auto-exit cron (scheduled after settings are available).
		add_action( 'init', array( __CLASS__, 'schedule_learning_exit' ), 25 );
		add_action( 'webino_shield_learning_exit', array( __CLASS__, 'process_learning_exit' ) );
	}

	/**
	 * Schedule the daily learning-mode auto-exit cron event.
	 *
	 * @return void
	 */
	public static function schedule_learning_exit() {
		if ( ! wp_next_scheduled( 'webino_shield_learning_exit' ) ) {
			wp_schedule_event( time() + DAY_IN_SECONDS, 'daily', 'webino_shield_learning_exit' );
		}
	}

	/**
	 * Cron callback: exit learning mode automatically if the configured duration has elapsed.
	 *
	 * Checks general.learning_mode, then compares the stored webino_shield_learning_started_at
	 * timestamp against general.learning_days. On expiry, switches waf.mode to "enforce" and
	 * clears learning_mode. If no start timestamp is recorded (e.g. learning was enabled before
	 * this feature), records now and defers the check to the next run.
	 *
	 * @return void
	 */
	public static function process_learning_exit() {
		$s = Webino_Dashboard_Security_Settings::get();

		if ( empty( $s['general']['learning_mode'] ) ) {
			return;
		}

		$days       = max( 1, (int) ( $s['general']['learning_days'] ?? 7 ) );
		$started_at = (int) get_option( 'webino_shield_learning_started_at', 0 );

		if ( ! $started_at ) {
			// No start timestamp recorded yet — store now and let a full period elapse.
			update_option( 'webino_shield_learning_started_at', time(), false );
			return;
		}

		if ( time() < $started_at + ( $days * DAY_IN_SECONDS ) ) {
			// Period not yet expired.
			return;
		}

		// Exit learning mode: switch WAF to enforce.
		Webino_Dashboard_Security_Settings::update( array(
			'general' => array( 'learning_mode' => false ),
			'waf'     => array( 'mode' => 'enforce' ),
		) );

		delete_option( 'webino_shield_learning_started_at' );

		if ( class_exists( 'Webino_Shield_Audit', false ) ) {
			Webino_Shield_Audit::write( 'learning_exit', 'waf', 'enforce', array( 'learning_days' => $days ) );
		}
		if ( class_exists( 'Webino_Shield_Notify', false ) ) {
			Webino_Shield_Notify::dispatch( 'learning_exit', array( 'days' => $days ) );
		}
	}

	/**
	 * @return bool
	 */
	public static function is_module_active() {
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& Webino_Dashboard_Module_Registry::is_installed( self::SLUG ) ) {
			return Webino_Dashboard_Module_Registry::is_active( self::SLUG );
		}
		return Webino_Dashboard_Modules::is_module_enabled( self::SLUG );
	}

	/**
	 * @return void
	 */
	public static function ensure_capabilities() {
		$admin = get_role( 'administrator' );
		if ( $admin ) {
			foreach ( array( self::CAP_VIEW, self::CAP_MANAGE, self::CAP_HEAL ) as $cap ) {
				if ( ! $admin->has_cap( $cap ) ) {
					$admin->add_cap( $cap );
				}
			}
		}

		$settings = Webino_Dashboard_Security_Settings::get();
		if ( ! empty( $settings['general']['shop_manager_view'] ) ) {
			$shop = get_role( 'shop_manager' );
			if ( $shop && ! $shop->has_cap( self::CAP_VIEW ) ) {
				$shop->add_cap( self::CAP_VIEW );
			}
		}
	}

	/**
	 * Resolve client IP trusting CF/Arvan when configured.
	 *
	 * @return string
	 */
	public static function get_client_ip() {
		$settings = Webino_Dashboard_Security_Settings::get();
		$compat   = isset( $settings['compat'] ) && is_array( $settings['compat'] ) ? $settings['compat'] : array();

		if ( ! empty( $compat['trust_cf_connecting_ip'] ) && ! empty( $_SERVER['HTTP_CF_CONNECTING_IP'] ) ) {
			$ip = sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_CF_CONNECTING_IP'] ) );
			if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
				return $ip;
			}
		}

		if ( ! empty( $compat['trust_arvan'] ) ) {
			foreach ( array( 'HTTP_AR_REAL_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR' ) as $header ) {
				if ( empty( $_SERVER[ $header ] ) ) {
					continue;
				}
				$raw = (string) wp_unslash( $_SERVER[ $header ] );
				$ip  = trim( explode( ',', $raw )[0] );
				$ip  = sanitize_text_field( $ip );
				if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
					return $ip;
				}
			}
		}

		if ( ! empty( $compat['trust_x_forwarded_for'] ) && ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
			$raw = (string) wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] );
			$ip  = trim( explode( ',', $raw )[0] );
			$ip  = sanitize_text_field( $ip );
			if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
				return $ip;
			}
		}

		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) wp_unslash( $_SERVER['REMOTE_ADDR'] ) : '';
		return sanitize_text_field( $ip );
	}

	/**
	 * @param string $ip IP address.
	 * @return string
	 */
	public static function ip_hash( $ip ) {
		$salt = (string) get_option( 'webino_shield_ip_salt', '' );
		if ( '' === $salt ) {
			$salt = wp_generate_password( 32, false, false );
			update_option( 'webino_shield_ip_salt', $salt, false );
		}
		return hash( 'sha256', $ip . '|' . $salt );
	}

	/**
	 * @return string
	 */
	public static function module_dir() {
		return dirname( __DIR__ );
	}

	/**
	 * @return string
	 */
	public static function uploads_dir() {
		$upload = wp_upload_dir();
		$dir    = trailingslashit( $upload['basedir'] ) . 'webino-shield';
		if ( ! is_dir( $dir ) ) {
			wp_mkdir_p( $dir );
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			@file_put_contents( $dir . '/index.php', "<?php\n// Silence is golden.\n" );
		}
		return $dir;
	}

	/**
	 * @return string
	 */
	public static function runtime_waf_path() {
		return trailingslashit( self::uploads_dir() ) . 'runtime-waf.json';
	}
}
