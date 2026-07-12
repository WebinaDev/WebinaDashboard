<?php
/**
 * Plugin Name:       Webino Dashboard
 * Plugin URI:        https://webina.dev
 * Description:       Standalone customer dashboard at /dashboard (SPA), separate from wp-admin.
 * Version:           0.1.8
 * Author:            Webina
 * Author URI:        https://webina.dev
 * Text Domain:       webino-dashboard
 * Domain Path:       /languages
 * Requires at least: 6.1
 * Requires PHP:      7.4
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WEBINO_DASHBOARD_VERSION', '0.1.8' );
define( 'WEBINO_DASHBOARD_FILE', __FILE__ );
define( 'WEBINO_DASHBOARD_DIR', plugin_dir_path( __FILE__ ) );
define( 'WEBINO_DASHBOARD_URL', plugin_dir_url( __FILE__ ) );
define( 'WEBINO_DASHBOARD_BASENAME', plugin_basename( __FILE__ ) );
define( 'WEBINO_MODULES_DIR', trailingslashit( dirname( WEBINO_DASHBOARD_DIR ) ) . 'Modules/' );
if ( ! defined( 'WEBINO_DASHBOARD_VENDOR_HOST' ) ) {
	define( 'WEBINO_DASHBOARD_VENDOR_HOST', 'webina.dev' );
}
if ( ! defined( 'WEBINO_DASHBOARD_VENDOR_URL' ) ) {
	define( 'WEBINO_DASHBOARD_VENDOR_URL', 'https://' . WEBINO_DASHBOARD_VENDOR_HOST );
}

require_once WEBINO_DASHBOARD_DIR . 'includes/class-webino-dashboard-bootstrap.php';

if ( ! Webino_Dashboard_Bootstrap::load() ) {
	return;
}

/**
 * Begins execution of the plugin.
 *
 * @return Webino_Dashboard_Plugin|null
 */
function webino_dashboard() {
	return Webino_Dashboard_Plugin::instance();
}

webino_dashboard();
Webino_Dashboard_Bootstrap::boot_optional_services();
