<?php
/**
 * Backward-compatible stub — implementation lives in WebinoDashboard core.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$core = WEBINO_DASHBOARD_DIR . 'includes/bots/class-webino-dashboard-bots-loader.php';
if ( ! class_exists( 'Webino_Dashboard_Bots_Loader', false ) && is_readable( $core ) ) {
	require_once $core;
}
