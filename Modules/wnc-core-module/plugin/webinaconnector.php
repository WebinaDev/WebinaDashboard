<?php
/**
 * Plugin Name: WebinaConnector
 * Plugin URI: https://webina.dev
 * Description: اتصال ووکامرس به بازارگاه‌ها و موتورهای مقایسه قیمت (دیجیکالا، باسلام، تکنولایف، اسنپ‌شاپ، تپسی‌شاپ، ذره‌بین، ایمالز، ترب)
 * Version: 1.7.2
 * Author: توسعه و طراحی وبینا
 * Author URI: https://webina.dev
 * Text Domain: webinaconnector
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 11.0
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'WNC_VERSION', '1.7.2' );
define( 'WNC_PLUGIN_NAME', 'webinaconnector' );
define( 'WNC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WNC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WNC_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * WooCommerce missing notice.
 */
function wnc_woocommerce_missing_notice() {
	echo '<div class="notice notice-error"><p>';
	esc_html_e( 'WebinaConnector نیازمند ووکامرس فعال است.', 'webinaconnector' );
	echo '</p></div>';
}

/**
 * Check WooCommerce is active.
 *
 * @return bool
 */
function wnc_check_woocommerce() {
	if ( ! in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins', array() ) ), true ) ) {
		if ( is_multisite() ) {
			$active = get_site_option( 'active_sitewide_plugins', array() );
			if ( ! isset( $active['woocommerce/woocommerce.php'] ) ) {
				add_action( 'admin_notices', 'wnc_woocommerce_missing_notice' );
				return false;
			}
		} else {
			add_action( 'admin_notices', 'wnc_woocommerce_missing_notice' );
			return false;
		}
	}
	if ( ! class_exists( 'WooCommerce' ) ) {
		add_action( 'admin_notices', 'wnc_woocommerce_missing_notice' );
		return false;
	}
	return true;
}

/**
 * Activation.
 */
function activate_wnc() {
	require_once WNC_PLUGIN_DIR . 'includes/class-wnc-activator.php';
	WNC_Activator::activate();
	// Torob schema + lifecycle (classes loaded lazily if available after main bootstrap on later runs).
	$torob_files = array(
		'includes/api/torob/class-wnc-torob-options.php',
		'includes/api/torob/class-wnc-torob-schema.php',
		'includes/api/torob/class-wnc-torob-site-data.php',
		'includes/api/torob/class-wnc-torob-http.php',
		'includes/api/torob/class-wnc-torob-connectivity-result.php',
		'includes/api/torob/class-wnc-torob-webhook-item.php',
		'includes/api/torob/class-wnc-torob-webhook-send-result.php',
		'includes/api/torob/class-wnc-torob-webhook-queue-repo.php',
		'includes/api/torob/class-wnc-torob-lifecycle.php',
	);
	foreach ( $torob_files as $rel ) {
		$file = WNC_PLUGIN_DIR . $rel;
		if ( is_readable( $file ) ) {
			require_once $file;
		}
	}
	if ( class_exists( 'WNC_Torob_Schema' ) ) {
		WNC_Torob_Schema::migrateIfNeeded();
	}
	if ( class_exists( 'WNC_Torob_Lifecycle' ) ) {
		WNC_Torob_Lifecycle::record_activation();
	}
}

/**
 * Deactivation.
 */
function deactivate_wnc() {
	require_once WNC_PLUGIN_DIR . 'includes/class-wnc-activator.php';
	WNC_Activator::deactivate();
	if ( class_exists( 'WNC_Torob_Webhook_Handler' ) ) {
		$handler = new WNC_Torob_Webhook_Handler();
		$handler->plugin_deactivated();
	} elseif ( class_exists( 'WNC_Torob_Webhook_Queue_Runner' ) ) {
		WNC_Torob_Webhook_Queue_Runner::clear_state();
		if ( class_exists( 'WNC_Torob_Webhook_Queue_Services' ) ) {
			WNC_Torob_Webhook_Queue_Services::clear_pending_queue();
		}
	}
	if ( class_exists( 'WNC_Torob_Lifecycle' ) ) {
		WNC_Torob_Lifecycle::record_deactivation();
	}
}

register_activation_hook( __FILE__, 'activate_wnc' );
register_deactivation_hook( __FILE__, 'deactivate_wnc' );

add_action(
	'before_woocommerce_init',
	static function () {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', __FILE__, true );
		}
	}
);

/**
 * Bootstrap after plugins_loaded.
 */
function run_wnc() {
	add_action( 'plugins_loaded', 'wnc_init', 25 );
}

/**
 * Initialize plugin.
 */
function wnc_init() {
	if ( ! wnc_check_woocommerce() ) {
		return;
	}

	require_once WNC_PLUGIN_DIR . 'includes/class-wnc-loader.php';
	require_once WNC_PLUGIN_DIR . 'includes/class-wnc-main.php';

	$loader = new WNC_Loader();
	$plugin = new WNC_Main( $loader );
	$plugin->run();
}

run_wnc();
