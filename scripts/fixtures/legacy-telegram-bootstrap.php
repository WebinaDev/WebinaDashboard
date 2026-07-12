<?php
/**
 * Fixture: pre-hardening telegram bootstrap (must be blocked by bootstrap_file_is_safe).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once dirname( __DIR__, 3 ) . '/Modules/bale-bot/includes/class-webino-dashboard-bots-loader.php';
