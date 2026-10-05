<?php
/**
 * Torob products extractor module bootstrap.
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
			'class-torob-extractor-vendor-loader.php',
			'class-torob-extractor-config.php',
			'class-webino-dashboard-rest-torob-extractor.php',
		),
		'torob-products-extractor-module'
	) ) {
	return;
}

Webino_Torob_Extractor_Vendor_Loader::init();
Webino_Dashboard_REST_Torob_Extractor::init();
