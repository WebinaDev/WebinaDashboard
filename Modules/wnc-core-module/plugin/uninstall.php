<?php
/**
 * Fired when the WebinaConnector / WNC plugin is uninstalled from wp-admin.
 *
 * @package WNC
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$lifecycle = dirname( __FILE__ ) . '/includes/api/torob/class-wnc-torob-lifecycle.php';
$http      = dirname( __FILE__ ) . '/includes/api/torob/class-wnc-torob-http.php';
$options   = dirname( __FILE__ ) . '/includes/api/torob/class-wnc-torob-options.php';
$site      = dirname( __FILE__ ) . '/includes/api/torob/class-wnc-torob-site-data.php';

if ( is_readable( $options ) ) {
	require_once $options;
}
if ( is_readable( $site ) ) {
	require_once $site;
}
if ( is_readable( $http ) ) {
	require_once $http;
}
if ( is_readable( $lifecycle ) ) {
	require_once $lifecycle;
	if ( class_exists( 'WNC_Torob_Lifecycle', false ) ) {
		WNC_Torob_Lifecycle::record_uninstall();
	}
}
