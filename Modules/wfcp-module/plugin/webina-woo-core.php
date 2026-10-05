<?php
/**
 * Plugin Name: Webina Woo Core
 * Plugin URI: https://webina.dev
 * Description: سیستم پیشرفته مدیریت قیمت‌گذاری چند لایه برای ووکامرس (تکی، اعتباری، اقساطی، عمده) و قیمت کانال‌های بازارگاه
 * Version: 2.0.4
 * Author: توسعه و طراحی وبینا
 * Author URI: https://webina.dev
 * Text Domain: webina-woo-core
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 11.0
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

// When bundled via WebinaDashboard, constants are defined by the dashboard loader.
if ( ! defined( 'WFCP_VERSION' ) ) {
	define( 'WFCP_VERSION', '2.0.4' );
}
if ( ! defined( 'WFCP_PLUGIN_NAME' ) ) {
	define( 'WFCP_PLUGIN_NAME', 'webina-woo-core' );
}
if ( ! defined( 'WFCP_PLUGIN_DIR' ) ) {
	define( 'WFCP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}
if ( ! defined( 'WFCP_PLUGIN_URL' ) ) {
	define( 'WFCP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}
if ( ! defined( 'WFCP_PLUGIN_BASENAME' ) ) {
	define( 'WFCP_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
}
