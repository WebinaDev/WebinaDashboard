<?php
/**
 * Backward-compatible stub — implementation lives in WebinoDashboard core.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$core = WEBINO_DASHBOARD_DIR . 'includes/bots/class-webino-dashboard-rest-bots.php';
if ( ! class_exists( 'Webino_Dashboard_REST_Bots', false ) && is_readable( $core ) ) {
	require_once $core;
}
