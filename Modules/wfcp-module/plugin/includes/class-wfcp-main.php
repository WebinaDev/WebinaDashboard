<?php
/**
 * The core plugin class.
 *
 * @package    WFCP
 * @subpackage WFCP/includes
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The core plugin class.
 */
class WFCP_Main {

	/**
	 * The loader that's responsible for maintaining and registering all hooks.
	 *
	 * @var WFCP_Loader
	 */
	protected $loader;

	/**
	 * Define the core functionality of the plugin.
	 */
	public function __construct( $loader ) {
		$this->loader = $loader;
		$this->load_dependencies();
		$this->define_admin_hooks();
		$this->define_public_hooks();
		$this->init_bulk_price_change();
	}

	/**
	 * Load the required dependencies for this plugin.
	 */
	private function load_dependencies() {
		require_once WFCP_PLUGIN_DIR . 'includes/class-wfcp-i18n.php';
		require_once WFCP_PLUGIN_DIR . 'admin/class-wfcp-admin.php';
		require_once WFCP_PLUGIN_DIR . 'public/class-wfcp-public.php';
		require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-exchange-api.php';
		require_once WFCP_PLUGIN_DIR . 'includes/class-wfcp-storefront-price.php';
		require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-gateway-manager.php';

		// Reference price sync submodule.
		if ( is_readable( WFCP_PLUGIN_DIR . 'includes/services/reference/class-wfcp-reference-sync.php' ) ) {
			require_once WFCP_PLUGIN_DIR . 'includes/services/reference/class-wfcp-reference-sync.php';
			if ( class_exists( 'WFCP_Reference_Sync', false ) && method_exists( 'WFCP_Reference_Sync', 'load_dependencies' ) ) {
				WFCP_Reference_Sync::load_dependencies();
			}
		}

		// Dashboard / ishop extras (optional when files exist).
		if ( is_readable( WFCP_PLUGIN_DIR . 'includes/integrations/class-wfcp-ishop-theme-compat.php' ) ) {
			require_once WFCP_PLUGIN_DIR . 'includes/integrations/class-wfcp-ishop-theme-compat.php';
		}
		if ( is_readable( WFCP_PLUGIN_DIR . 'includes/integrations/class-wfcp-ishop-script-compat.php' ) ) {
			require_once WFCP_PLUGIN_DIR . 'includes/integrations/class-wfcp-ishop-script-compat.php';
		}
		if ( is_readable( WFCP_PLUGIN_DIR . 'includes/utilities/class-wfcp-diagnostics.php' ) ) {
			require_once WFCP_PLUGIN_DIR . 'includes/utilities/class-wfcp-diagnostics.php';
		}
		if ( is_readable( WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-multi-cart.php' ) ) {
			require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-multi-cart.php';
		}
		require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-wholesale-partner.php';
		require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-wholesale-rules.php';
		require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-wholesale-cart.php';
	}

	/**
	 * Register all of the hooks related to the admin area functionality.
	 */
	private function define_admin_hooks() {
		$plugin_admin = new WFCP_Admin();

		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );
		$this->loader->add_action( 'admin_menu', $plugin_admin, 'add_admin_menu' );
		$this->loader->add_action( 'wp_ajax_wfcp_save_settings', $plugin_admin, 'ajax_save_settings' );
		$this->loader->add_action( 'wp_ajax_wfcp_update_product_price', $plugin_admin, 'ajax_update_product_price' );
		$this->loader->add_action( 'wp_ajax_wfcp_recalculate_all', $plugin_admin, 'ajax_recalculate_all' );
		$this->loader->add_action( 'wp_ajax_wfcp_delete_transients', $plugin_admin, 'ajax_delete_transients' );
		$this->loader->add_action( 'wp_ajax_wfcp_export_settings', $plugin_admin, 'ajax_export_settings' );
		$this->loader->add_action( 'wp_ajax_wfcp_import_settings', $plugin_admin, 'ajax_import_settings' );
		$this->loader->add_action( 'wp_ajax_wfcp_update_lock_price', $plugin_admin, 'ajax_update_lock_price' );
		$this->loader->add_action( 'wp_ajax_wfcp_test_api', $plugin_admin, 'ajax_test_api' );
		$this->loader->add_action( 'wp_ajax_wfcp_update_exchange_rate', $plugin_admin, 'ajax_update_exchange_rate' );
		$this->loader->add_action( 'wp_ajax_wfcp_update_all_prices', $plugin_admin, 'ajax_update_all_prices' );
		$this->loader->add_action( 'wp_ajax_wfcp_quick_add_product', $plugin_admin, 'ajax_quick_add_product' );

		$this->loader->add_action( 'wp_ajax_wfcp_pm_get_products', $plugin_admin, 'ajax_pm_get_products' );
		$this->loader->add_action( 'wp_ajax_wfcp_pm_update_price', $plugin_admin, 'ajax_pm_update_price' );
		$this->loader->add_action( 'wp_ajax_wfcp_pm_update_stock', $plugin_admin, 'ajax_pm_update_stock' );
		$this->loader->add_action( 'wp_ajax_wfcp_pm_update_brand', $plugin_admin, 'ajax_pm_update_brand' );

		$this->loader->add_action( 'woocommerce_product_options_pricing', $plugin_admin, 'add_wfcp_pricing_fields' );
		$this->loader->add_action( 'woocommerce_admin_process_product_object', $plugin_admin, 'save_wfcp_pricing_fields' );
		$this->loader->add_action( 'woocommerce_product_after_variable_attributes', $plugin_admin, 'add_wfcp_variation_fields', 10, 3 );
		$this->loader->add_action( 'woocommerce_save_product_variation', $plugin_admin, 'save_wfcp_variation_fields', 10, 2 );
		$this->loader->add_filter( 'manage_edit-product_columns', $plugin_admin, 'add_wfcp_product_columns' );
		$this->loader->add_action( 'manage_product_posts_custom_column', $plugin_admin, 'render_wfcp_product_column', 10, 2 );
		$this->loader->add_action( 'quick_edit_custom_box', $plugin_admin, 'add_wfcp_quick_edit', 10, 2 );
		$this->loader->add_action( 'admin_footer', $plugin_admin, 'add_wfcp_quick_edit_js' );
		$this->loader->add_action( 'save_post_product', $plugin_admin, 'save_wfcp_quick_edit' );

		$this->loader->add_action( 'wfcp_auto_update_exchange_rate', 'WFCP_Exchange_API', 'update_exchange_rate' );
		add_action( 'init', array( $this, 'schedule_auto_update' ), 20 );

		if ( class_exists( 'WFCP_Reference_Sync', false ) ) {
			WFCP_Reference_Sync::init();
		}
	}

	/**
	 * Register all of the hooks related to the public-facing functionality.
	 */
	private function define_public_hooks() {
		WFCP_Storefront_Price::init();
		WFCP_Gateway_Manager::init();
		WFCP_Cart_Manager::init();
		if ( class_exists( 'WFCP_Wholesale_Partner', false ) ) {
			WFCP_Wholesale_Partner::init();
		}
		if ( class_exists( 'WFCP_Wholesale_Cart', false ) ) {
			WFCP_Wholesale_Cart::init();
		}

		$plugin_public = new WFCP_Public();

		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts', 999 );
		$this->loader->add_action( 'wp', $plugin_public, 'register_pricing_box_hooks' );

		if ( method_exists( $plugin_public, 'register_shortcodes' ) ) {
			$this->loader->add_action( 'init', $plugin_public, 'register_shortcodes' );
		}

		$this->loader->add_action( 'woocommerce_before_single_product', $plugin_public, 'render_product_guide_alert', 5 );
		$this->loader->add_action( 'woocommerce_before_cart', $plugin_public, 'render_cart_guide_alert', 3 );
		$this->loader->add_action( 'woocommerce_before_checkout_form', $plugin_public, 'render_checkout_guide_alert', 5 );
		$this->loader->add_action( 'woocommerce_before_cart', $plugin_public, 'add_cart_type_switcher', 5 );

		$this->loader->add_action( 'wp_ajax_wfcp_get_variation_prices', $plugin_public, 'ajax_get_variation_prices' );
		$this->loader->add_action( 'wp_ajax_nopriv_wfcp_get_variation_prices', $plugin_public, 'ajax_get_variation_prices' );
		$this->loader->add_action( 'wp_ajax_wfcp_add_to_cart', $plugin_public, 'ajax_add_to_cart' );
		$this->loader->add_action( 'wp_ajax_nopriv_wfcp_add_to_cart', $plugin_public, 'ajax_add_to_cart' );
		$this->loader->add_filter( 'woocommerce_available_variation', $plugin_public, 'available_variation_prices', 10, 3 );

		if ( class_exists( 'WFCP_Ishop_Theme_Compat', false ) ) {
			WFCP_Ishop_Theme_Compat::init( $plugin_public );
		}
		if ( class_exists( 'WFCP_Ishop_Script_Compat', false ) ) {
			WFCP_Ishop_Script_Compat::init();
		}
		if ( class_exists( 'WFCP_Diagnostics', false ) ) {
			WFCP_Diagnostics::init();
		}
		if ( class_exists( 'WFCP_Multi_Cart', false ) ) {
			WFCP_Multi_Cart::init();
		}

		$this->loader->add_action( 'wp_loaded', 'WFCP_Cart_Manager', 'promote_nested_purchase_fields', 5 );
		$this->loader->add_filter( 'woocommerce_add_to_cart_validation', 'WFCP_Cart_Manager', 'validate_add_to_cart', 10, 3 );
		$this->loader->add_filter( 'woocommerce_add_cart_item_data', 'WFCP_Cart_Manager', 'add_cart_item_data', 10, 3 );
		$this->loader->add_filter( 'woocommerce_get_item_data', 'WFCP_Cart_Manager', 'get_item_data', 10, 2 );
		$this->loader->add_action( 'woocommerce_before_calculate_totals', 'WFCP_Cart_Manager', 'before_calculate_totals', 20 );
		$this->loader->add_action( 'woocommerce_cart_emptied', 'WFCP_Cart_Manager', 'clear_purchase_type_session' );
		$this->loader->add_filter( 'woocommerce_available_payment_gateways', 'WFCP_Gateway_Manager', 'filter_available_gateways', PHP_INT_MAX );
		$this->loader->add_filter( 'woocommerce_currency_symbol', 'WFCP_Helper', 'filter_currency_symbol', 10, 2 );
		$this->loader->add_filter( 'wc_price', 'WFCP_Helper', 'filter_wc_price_html', 20, 3 );
		$this->loader->add_filter( 'woocommerce_get_cart_item_from_session', 'WFCP_Cart_Manager', 'get_cart_item_from_session', 10, 2 );
		$this->loader->add_action( 'wp_ajax_wfcp_update_cart_type', 'WFCP_Cart_Manager', 'ajax_update_cart_type' );
		$this->loader->add_action( 'wp_ajax_nopriv_wfcp_update_cart_type', 'WFCP_Cart_Manager', 'ajax_update_cart_type' );

		$plugin_i18n = new WFCP_i18n();
		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );
	}

	/**
	 * Schedule auto update cron job
	 */
	public function schedule_auto_update() {
		$general = WFCP_Helper::get_settings( 'general' );

		if ( ! is_array( $general ) || ! WFCP_Helper::to_bool( isset( $general['api_enabled'] ) ? $general['api_enabled'] : false ) ) {
			wp_clear_scheduled_hook( 'wfcp_auto_update_exchange_rate' );
			return;
		}

		if ( ! isset( $general['auto_update_enabled'] ) || ! $general['auto_update_enabled'] ) {
			wp_clear_scheduled_hook( 'wfcp_auto_update_exchange_rate' );
			return;
		}

		$hour = isset( $general['auto_update_hour'] ) ? intval( $general['auto_update_hour'] ) : 0;
		wp_clear_scheduled_hook( 'wfcp_auto_update_exchange_rate' );

		$current_time   = current_time( 'timestamp' );
		$today          = strtotime( date( 'Y-m-d', $current_time ) );
		$scheduled_time = $today + ( $hour * HOUR_IN_SECONDS );

		if ( $scheduled_time <= $current_time ) {
			$scheduled_time = $scheduled_time + DAY_IN_SECONDS;
		}

		wp_schedule_event( $scheduled_time, 'daily', 'wfcp_auto_update_exchange_rate' );
	}

	/**
	 * Initialize the Bulk Price Change service (hooks registered in its constructor).
	 */
	private function init_bulk_price_change() {
		if ( class_exists( 'WFCP_Bulk_Price_Change' ) ) {
			$GLOBALS['wfcp_bulk_price_change'] = new WFCP_Bulk_Price_Change();
		}
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 */
	public function run() {
		$this->loader->run();
	}
}
