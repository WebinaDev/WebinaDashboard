<?php
/**
 * Tapin shipping module bootstrap.
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
			'class-webino-tapin-settings.php',
			'class-webino-tapin-client.php',
			'class-webino-tapin-catalog.php',
			'class-webino-tapin-formula.php',
			'class-webino-tapin-locations.php',
			'class-webino-tapin-rates.php',
			'class-webino-tapin-shipments.php',
			'class-webino-tapin-shipping-methods.php',
			'class-webino-tapin-checkout.php',
			'class-webino-dashboard-rest-tapin.php',
		),
		'tapin-module'
	) ) {
	return;
}

Webino_Tapin_Settings::init();
Webino_Tapin_Locations::init();
Webino_Tapin_Shipments::init();
Webino_Tapin_Shipping_Methods::register();
Webino_Tapin_Checkout::init();
Webino_Dashboard_REST_Tapin::init();
