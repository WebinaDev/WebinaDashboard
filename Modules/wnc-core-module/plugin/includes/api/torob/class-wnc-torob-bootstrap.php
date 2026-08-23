<?php
/**
 * Bootstrap Torob services (feed, orders, webhooks, lifecycle).
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Torob subsystem init.
 */
class WNC_Torob_Bootstrap {

	/** @var WNC_Torob_Feed|null */
	private static $feed;

	/** @var WNC_Torob_Order_Status|null */
	private static $order_status;

	/** @var WNC_Torob_Order_Tracking|null */
	private static $order_tracking;

	/** @var WNC_Torob_Webhook_Handler|null */
	private static $webhook;

	/** @var WNC_Torob_Token|null */
	private static $token;

	/** @var WNC_Torob_Lifecycle|null */
	private static $lifecycle;

	/**
	 * Load JWT autoload and register hooks.
	 */
	public static function init() {
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/deps/autoload-jwt.php';

		self::$feed           = new WNC_Torob_Feed();
		self::$order_status   = new WNC_Torob_Order_Status();
		self::$order_tracking = new WNC_Torob_Order_Tracking();
		self::$webhook        = new WNC_Torob_Webhook_Handler();
		self::$token          = new WNC_Torob_Token();
		self::$lifecycle      = new WNC_Torob_Lifecycle();

		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ), 20 );

		if ( is_admin() || wp_doing_cron() ) {
			WNC_Torob_Schema::migrateIfNeeded();
		}

		if ( is_admin() ) {
			self::$order_status->register_meta_box_hooks();
		}

		self::$order_tracking->register_hooks();
		self::$webhook->register_hooks();
		self::$lifecycle->register_hooks();

		self::sync_feature_flags_from_settings();
	}

	/**
	 * Register all Torob REST routes (override official if present).
	 */
	public static function register_routes() {
		self::$feed->register_products_route( self::$token );
		self::$order_status->register_order_status_route( self::$token );
		self::$order_tracking->register_orders_route( self::$token );
		self::$webhook->register_routes( self::$token );
	}

	/**
	 * Mirror Connector platform credentials into Torob option flags.
	 */
	public static function sync_feature_flags_from_settings() {
		$p = WNC_Settings::get_platform( 'torob' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		$platform_on = ! empty( $p['enabled'] );

		// When Torob is enabled in Connector, expose official-style GET APIs by default.
		$order_status_on = array_key_exists( 'order_status_enabled', $c )
			? ! empty( $c['order_status_enabled'] )
			: $platform_on;
		$orders_list_on = array_key_exists( 'orders_list_api_enabled', $c )
			? ! empty( $c['orders_list_api_enabled'] )
			: $platform_on;
		$webhook_on = array_key_exists( 'product_page_webhook_enabled', $c )
			? ! empty( $c['product_page_webhook_enabled'] )
			: $platform_on;

		WNC_Torob_Options::setOrderStatusEnabled( $order_status_on );
		WNC_Torob_Options::setOrdersListApiEnabled( $orders_list_on );

		if ( self::$webhook ) {
			self::$webhook->set_webhook_enabled( $webhook_on );
		} else {
			WNC_Torob_Options::setProductPageWebhookEnabled( $webhook_on );
		}
	}

	/**
	 * Feed instance (for preview).
	 *
	 * @return WNC_Torob_Feed
	 */
	public static function feed() {
		return self::$feed;
	}

	/**
	 * Webhook handler.
	 *
	 * @return WNC_Torob_Webhook_Handler
	 */
	public static function webhook() {
		return self::$webhook;
	}

	/**
	 * On plugin activate.
	 */
	public static function activate() {
		WNC_Torob_Schema::migrateIfNeeded();
		WNC_Torob_Lifecycle::record_activation();
	}

	/**
	 * On plugin deactivate.
	 */
	public static function deactivate() {
		if ( self::$webhook ) {
			self::$webhook->plugin_deactivated();
		}
		WNC_Torob_Lifecycle::record_deactivation();
	}
}
