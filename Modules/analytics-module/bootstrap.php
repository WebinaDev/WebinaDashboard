<?php
/**
 * Analytics module bootstrap.
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
			'class-webino-dashboard-analytics.php',
			'class-webino-dashboard-rest-analytics.php',
		),
		'analytics-module'
	) ) {
	return;
}

Webino_Dashboard_Analytics::init();
Webino_Dashboard_REST_Analytics::init();
