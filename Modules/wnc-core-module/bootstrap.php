<?php
/**
 * WebinaConnector core runtime module bootstrap.
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
			'class-webino-dashboard-wnc-loader.php',
			'class-webino-dashboard-rest-wnc.php',
		),
		'wnc-core-module'
	) ) {
	return;
}

Webino_Dashboard_WNC_Loader::init();
Webino_Dashboard_REST_WNC::init();
