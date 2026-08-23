<?php
/**
 * Core bootstrap for shared dashboard bot services (REST + Bale engine hooks).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads bot includes from core and wires init hooks when bot modules are installed.
 */
final class Webino_Dashboard_Bots_Core {

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;

		self::require_includes();

		add_action( 'init', array( __CLASS__, 'boot_when_needed' ), 20 );
	}

	/**
	 * @return void
	 */
	private static function require_includes() {
		$dir = WEBINO_DASHBOARD_DIR . 'includes/bots/';
		$files = array(
			'class-webino-dashboard-bots-loader.php',
			'class-webino-dashboard-bots-rest-context.php',
			'class-webino-dashboard-rest-bots.php',
			'class-webino-dashboard-bots-campaign-migrate.php',
			'class-webino-dashboard-bots-wfcp.php',
			'class-webino-dashboard-bots-loyalty.php',
			'class-webino-dashboard-bots-addons.php',
			'class-webino-dashboard-bots-segments.php',
			'class-webino-dashboard-bots-outbound-queue.php',
			'class-webino-dashboard-bots-templates.php',
			'class-webino-dashboard-bots-client-facade.php',
			'class-webino-dashboard-bots-admin-ops.php',
			'class-webino-dashboard-bots-notify-cascade.php',
			'class-webino-dashboard-bots-order-notify.php',
			'class-webino-dashboard-bots-c2c-gateway.php',
			'class-webino-dashboard-bots-faq.php',
			'class-webino-dashboard-bots-tickets.php',
			'class-webino-dashboard-bots-channel-publisher.php',
			'class-webino-dashboard-bots-club.php',
			'class-webino-dashboard-bots-site-widgets.php',
		);
		foreach ( $files as $file ) {
			$path = $dir . $file;
			if ( is_readable( $path ) ) {
				require_once $path;
			}
		}
	}

	/**
	 * @return bool
	 */
	private static function bale_module_active() {
		return class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& Webino_Dashboard_Module_Registry::is_active( 'bale-bot-module' );
	}

	/**
	 * @return bool
	 */
	private static function telegram_module_active() {
		return class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& Webino_Dashboard_Module_Registry::is_active( 'telegram-bot-module' );
	}

	/**
	 * @return bool
	 */
	private static function any_bot_module_active() {
		return self::bale_module_active() || self::telegram_module_active();
	}

	/**
	 * @return void
	 */
	public static function boot_when_needed() {
		if ( ! self::any_bot_module_active() ) {
			return;
		}

		if ( class_exists( 'Webino_Dashboard_REST_Bots', false ) ) {
			Webino_Dashboard_REST_Bots::init();
		}

		if ( ! class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			return;
		}

		if ( self::bale_module_active() ) {
			Webino_Dashboard_Bots_Loader::boot_bale();
		}
		if ( self::telegram_module_active() ) {
			Webino_Dashboard_Bots_Loader::boot_telegram();
		}

		if ( class_exists( 'WooCommerce', false ) && class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			add_action( 'woocommerce_order_status_completed', array( 'Webino_Dashboard_Bots_Loyalty', 'maybe_award_order_id' ), 30 );
			add_action( 'woocommerce_payment_complete', array( 'Webino_Dashboard_Bots_Loyalty', 'maybe_award_order_id' ), 30 );
			add_action( 'webino_dashboard_bots_birthday_cron', array( 'Webino_Dashboard_Bots_Loyalty', 'run_birthday_cron' ) );
			add_action( 'webino_dashboard_bots_inactive_nudge_cron', array( 'Webino_Dashboard_Bots_Loyalty', 'run_inactive_nudge_cron' ) );
			if ( ! wp_next_scheduled( 'webino_dashboard_bots_birthday_cron' ) ) {
				wp_schedule_event( time() + 600, 'daily', 'webino_dashboard_bots_birthday_cron' );
			}
			if ( ! wp_next_scheduled( 'webino_dashboard_bots_inactive_nudge_cron' ) ) {
				wp_schedule_event( time() + 900, 'daily', 'webino_dashboard_bots_inactive_nudge_cron' );
			}
		}

		if ( class_exists( 'Webino_Dashboard_Bots_Outbound_Queue', false ) ) {
			Webino_Dashboard_Bots_Outbound_Queue::init();
		}
		if ( self::module_enabled( 'admin_ops' ) && class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false ) ) {
			Webino_Dashboard_Bots_Admin_Ops::init();
		}
		if ( class_exists( 'Webino_Dashboard_Bots_Order_Notify', false ) ) {
			Webino_Dashboard_Bots_Order_Notify::init();
		}
		if ( self::module_enabled( 'notify_cascade' ) && class_exists( 'Webino_Dashboard_Bots_Notify_Cascade', false ) ) {
			Webino_Dashboard_Bots_Notify_Cascade::init();
		}
		if ( self::module_enabled( 'c2c' ) && class_exists( 'Webino_Dashboard_Bots_C2C_Gateway', false ) ) {
			Webino_Dashboard_Bots_C2C_Gateway::init();
		}
		if ( self::module_enabled( 'faq' ) && class_exists( 'Webino_Dashboard_Bots_FAQ', false ) ) {
			Webino_Dashboard_Bots_FAQ::init();
		}
		if ( self::module_enabled( 'tickets' ) && class_exists( 'Webino_Dashboard_Bots_Tickets', false ) ) {
			Webino_Dashboard_Bots_Tickets::init();
		}
		if ( self::module_enabled( 'channel_publisher' ) && class_exists( 'Webino_Dashboard_Bots_Channel_Publisher', false ) ) {
			Webino_Dashboard_Bots_Channel_Publisher::init();
		}
		if ( self::module_enabled( 'club' ) && class_exists( 'Webino_Dashboard_Bots_Club', false ) ) {
			Webino_Dashboard_Bots_Club::init();
		}
		if ( self::module_enabled( 'site_widgets' ) && class_exists( 'Webino_Dashboard_Bots_Site_Widgets', false ) ) {
			Webino_Dashboard_Bots_Site_Widgets::init();
		}
	}

	/**
	 * Parity feature clusters (default on unless explicitly disabled).
	 *
	 * @param string $key Module key.
	 * @return bool
	 */
	public static function module_enabled( $key ) {
		$key = sanitize_key( (string) $key );
		if ( $key === '' ) {
			return true;
		}
		$raw = get_option( 'webino_dashboard_bots_modules', array() );
		if ( ! is_array( $raw ) || ! array_key_exists( $key, $raw ) ) {
			return true;
		}
		return ! empty( $raw[ $key ] ) && '0' !== (string) $raw[ $key ];
	}
}
