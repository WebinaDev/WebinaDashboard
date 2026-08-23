<?php
/**
 * Main plugin controller.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Core plugin class.
 */
class WNC_Main {

	/**
	 * @var WNC_Loader
	 */
	protected $loader;

	/**
	 * @param WNC_Loader $loader Loader.
	 */
	public function __construct( $loader ) {
		$this->loader = $loader;
		$this->load_dependencies();
		$this->define_hooks();
	}

	/**
	 * Load files.
	 */
	private function load_dependencies() {
		require_once WNC_PLUGIN_DIR . 'includes/class-wnc-activator.php';
		require_once WNC_PLUGIN_DIR . 'includes/class-wnc-storage.php';
		require_once WNC_PLUGIN_DIR . 'includes/class-wnc-settings.php';
		require_once WNC_PLUGIN_DIR . 'includes/class-wnc-logger.php';
		require_once WNC_PLUGIN_DIR . 'includes/class-wnc-jobs.php';
		require_once WNC_PLUGIN_DIR . 'includes/class-wnc-pricing.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/interface-wnc-platform.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/class-wnc-http.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/class-wnc-stub-adapter.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/digikala/class-wnc-digikala-auth.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/digikala/class-wnc-digikala-adapter.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/digikala/class-wnc-digikala-bootstrap.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/basalam/class-wnc-basalam-adapter.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/basalam/class-wnc-basalam-bootstrap.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/technolife/class-wnc-technolife-adapter.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/snappshop/class-wnc-snappshop-adapter.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/tapsishop/class-wnc-tapsishop-adapter.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/zarehbin/class-wnc-zarehbin-adapter.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/zarehbin/class-wnc-zarehbin-feed.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/emalls/class-wnc-emalls-adapter.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/emalls/class-wnc-emalls-feed.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/snapppay-search/class-wnc-snapppay-search-adapter.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/snapppay-search/class-wnc-snapppay-search-feed.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-site-data.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-options.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-connectivity-result.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-webhook-item.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-webhook-send-result.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-http.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-token.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-extraction-utils.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-schema.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-status-enum.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-wc-status-enum.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-feed.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-order-status.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-order-tracking.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-webhook-queue-repo.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-webhook-queue-services.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-webhook-queue-runner.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-webhook-controller.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-webhook-observer.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-webhook-handler.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-lifecycle.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-adapter.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/torob/class-wnc-torob-bootstrap.php';
		require_once WNC_PLUGIN_DIR . 'includes/api/class-wnc-platform-registry.php';
		require_once WNC_PLUGIN_DIR . 'includes/sync/class-wnc-mapper.php';
		require_once WNC_PLUGIN_DIR . 'includes/sync/class-wnc-price-sync.php';
		require_once WNC_PLUGIN_DIR . 'includes/sync/class-wnc-stock-sync.php';
		require_once WNC_PLUGIN_DIR . 'includes/sync/class-wnc-order-normalizer.php';
		require_once WNC_PLUGIN_DIR . 'includes/sync/class-wnc-order-sync.php';
		require_once WNC_PLUGIN_DIR . 'admin/class-wnc-admin.php';
		require_once WNC_PLUGIN_DIR . 'admin/class-wnc-product-ui.php';

		WNC_Storage::ensure_schema();
		WNC_Activator::maybe_upgrade();
		WNC_Platform_Registry::init();
		WNC_Zarehbin_Feed::init();
		WNC_Emalls_Feed::init();
		WNC_SnappPay_Search_Feed::init();
		WNC_Torob_Bootstrap::init();
		WNC_Basalam_Bootstrap::init();
		WNC_Digikala_Bootstrap::init();
	}

	/**
	 * Register hooks.
	 */
	private function define_hooks() {
		$admin      = new WNC_Admin();
		$product_ui = new WNC_Product_UI();

		$this->loader->add_action( 'admin_menu', $admin, 'add_menu' );
		$this->loader->add_action( 'admin_enqueue_scripts', $admin, 'enqueue_assets' );

		$this->loader->add_action( 'wp_ajax_wnc_save_settings', $admin, 'ajax_save_settings' );
		$this->loader->add_action( 'wp_ajax_wnc_test_connection', $admin, 'ajax_test_connection' );
		$this->loader->add_action( 'wp_ajax_wnc_search_remote', $admin, 'ajax_search_remote' );
		$this->loader->add_action( 'wp_ajax_wnc_save_map', $admin, 'ajax_save_map' );
		$this->loader->add_action( 'wp_ajax_wnc_delete_map', $admin, 'ajax_delete_map' );
		$this->loader->add_action( 'wp_ajax_wnc_sync_now', $admin, 'ajax_sync_now' );
		$this->loader->add_action( 'wp_ajax_wnc_pull_orders', $admin, 'ajax_pull_orders' );
		$this->loader->add_action( 'wp_ajax_wnc_issue_digikala_token', $admin, 'ajax_issue_digikala_token' );
		$this->loader->add_action( 'wp_ajax_wnc_generate_digikala_keys', $admin, 'ajax_generate_digikala_keys' );
		$this->loader->add_action( 'wp_ajax_wnc_torob_connectivity', $admin, 'ajax_torob_connectivity' );

		$this->loader->add_action( 'add_meta_boxes', $product_ui, 'add_meta_box' );
		$this->loader->add_action( 'woocommerce_process_product_meta', $product_ui, 'save_meta', 20 );
		$this->loader->add_action( 'woocommerce_product_after_variable_attributes', $product_ui, 'render_variation_fields', 20, 3 );
		$this->loader->add_action( 'woocommerce_save_product_variation', $product_ui, 'save_variation_meta', 20, 2 );
		$this->loader->add_filter( 'manage_edit-product_columns', $product_ui, 'add_column' );
		$this->loader->add_action( 'manage_product_posts_custom_column', $product_ui, 'render_column', 10, 2 );
		$this->loader->add_action( 'quick_edit_custom_box', $product_ui, 'quick_edit', 10, 2 );
		$this->loader->add_action( 'admin_footer', $product_ui, 'quick_edit_js' );
		$this->loader->add_action( 'save_post_product', $product_ui, 'save_quick_edit' );

		// Auto-sync hooks.
		$this->loader->add_action( 'woocommerce_update_product', $this, 'on_product_updated', 30 );
		$this->loader->add_action( 'woocommerce_variation_set_stock', $this, 'on_variation_stock', 20 );
		$this->loader->add_action( 'woocommerce_product_set_stock', $this, 'on_product_stock', 20 );
		$this->loader->add_action( 'wfcp_after_product_price_update', $this, 'on_wfcp_price_update', 10, 2 );

		// Cron.
		$this->loader->add_filter( 'cron_schedules', $this, 'cron_schedules' );
		$this->loader->add_action( 'wnc_process_jobs', 'WNC_Jobs', 'process' );
		$this->loader->add_action( 'wnc_pull_orders', 'WNC_Order_Sync', 'pull_all' );
		$this->loader->add_action( 'init', $this, 'ensure_cron' );
		$this->loader->add_action( 'init', 'WNC_Order_Sync', 'ensure_platform_taxonomy' );

		// WFCP notice.
		$this->loader->add_action( 'admin_notices', $admin, 'maybe_wfcp_notice' );
	}

	/**
	 * Custom cron intervals.
	 *
	 * @param array $schedules Schedules.
	 * @return array
	 */
	public function cron_schedules( $schedules ) {
		$schedules['wnc_five_minutes'] = array(
			'interval' => 300,
			'display'  => __( 'هر ۵ دقیقه (WebinaConnector)', 'webinaconnector' ),
		);
		$schedules['wnc_fifteen_minutes'] = array(
			'interval' => 900,
			'display'  => __( 'هر ۱۵ دقیقه (WebinaConnector)', 'webinaconnector' ),
		);
		return $schedules;
	}

	/**
	 * Ensure cron / Action Scheduler events exist.
	 */
	public function ensure_cron() {
		if ( function_exists( 'as_next_scheduled_action' ) && function_exists( 'as_schedule_recurring_action' ) ) {
			if ( ! as_next_scheduled_action( 'wnc_process_jobs' ) ) {
				as_schedule_recurring_action( time() + 60, 300, 'wnc_process_jobs', array(), 'webinaconnector' );
			}
			if ( ! as_next_scheduled_action( 'wnc_pull_orders' ) ) {
				as_schedule_recurring_action( time() + 120, 900, 'wnc_pull_orders', array(), 'webinaconnector' );
			}
			return;
		}

		if ( ! wp_next_scheduled( 'wnc_process_jobs' ) ) {
			wp_schedule_event( time() + 60, 'wnc_five_minutes', 'wnc_process_jobs' );
		}
		if ( ! wp_next_scheduled( 'wnc_pull_orders' ) ) {
			wp_schedule_event( time() + 120, 'wnc_fifteen_minutes', 'wnc_pull_orders' );
		}
	}

	/**
	 * After WFCP purchase price update.
	 *
	 * @param int $product_id Product ID.
	 */
	public function on_wfcp_price_update( $product_id ) {
		WNC_Price_Sync::enqueue_for_product( (int) $product_id );
	}

	/**
	 * Product updated → enqueue sync.
	 *
	 * @param int $product_id Product ID.
	 */
	public function on_product_updated( $product_id ) {
		WNC_Price_Sync::enqueue_for_product( (int) $product_id );
	}

	/**
	 * @param WC_Product $product Product.
	 */
	public function on_product_stock( $product ) {
		if ( $product instanceof WC_Product ) {
			WNC_Price_Sync::enqueue_for_product( $product->get_id() );
		}
	}

	/**
	 * @param WC_Product_Variation $variation Variation.
	 */
	public function on_variation_stock( $variation ) {
		if ( $variation instanceof WC_Product ) {
			WNC_Price_Sync::enqueue_for_product( $variation->get_id() );
		}
	}

	/**
	 * Run loader.
	 */
	public function run() {
		$this->loader->run();
	}
}
