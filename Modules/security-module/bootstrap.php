<?php
/**
 * Security module bootstrap.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$dir = dirname( __FILE__ ) . '/includes/';
if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
	|| ! Webino_Dashboard_Module_Registry::require_module_files(
		$dir,
		array(
			'class-webino-dashboard-security.php',
			'class-webino-dashboard-rest-security.php',
		),
		'security-module'
	) ) {
	return;
}

Webino_Dashboard_Security::init();
Webino_Dashboard_REST_Security::init();
// Module loads on init@10 — call bootstrap immediately (do not re-hook init@4).
Webino_Dashboard_Security::bootstrap();
