<?php
/**
 * Telegram bot module bootstrap.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$dir  = dirname( __FILE__ ) . '/includes/';
$file = $dir . 'class-webino-dashboard-telegram-bot-loader.php';

if ( ! is_readable( $file ) ) {
	// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
	error_log( '[Webino Dashboard] Telegram bot bootstrap skipped: missing ' . $file );
	return;
}

require_once $file;

Webino_Dashboard_Telegram_Bot_Loader::init();
