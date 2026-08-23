<?php
/**
 * Coffee profile module bootstrap.
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
			'class-webino-dashboard-coffee-profile.php',
			'class-webino-dashboard-coffee-origins.php',
			'class-webino-dashboard-coffee-blend.php',
			'class-webino-dashboard-coffee-search.php',
			'class-webino-dashboard-rest-coffee-profile.php',
			'class-webino-dashboard-rest-coffee-blend.php',
			'class-webino-dashboard-coffee-storefront.php',
		),
		'coffee-profile-module'
	) ) {
	return;
}

Webino_Dashboard_Coffee_Profile::init();
Webino_Dashboard_Coffee_Origins::init();
Webino_Dashboard_Coffee_Blend::init();
Webino_Dashboard_Coffee_Search::init();
Webino_Dashboard_REST_Coffee_Profile::init();
Webino_Dashboard_REST_Coffee_Blend::init();
Webino_Dashboard_Coffee_Storefront::init();
