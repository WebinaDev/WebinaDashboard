<?php
/**
 * Backward-compatible stub — implementation lives in WebinoDashboard core.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$core = WEBINO_DASHBOARD_DIR . 'includes/bots/class-webino-dashboard-bots-rest-context.php';
if ( ! class_exists( 'Webino_Dashboard_Bots_REST_Context', false ) && is_readable( $core ) ) {
	require_once $core;
}
