<?php
/**
 * WFCP module bootstrap.
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
			'class-webino-dashboard-wfcp-loader.php',
			'class-webino-dashboard-rest-wfcp.php',
		),
		'wfcp-module'
	) ) {
	return;
}

Webino_Dashboard_WFCP_Loader::init();
Webino_Dashboard_REST_WFCP::init();
