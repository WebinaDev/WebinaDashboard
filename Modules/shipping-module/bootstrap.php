<?php
/**
 * Transport / shipping module bootstrap.
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
			'class-webino-shipping-packaging-settings.php',
			'class-webino-shipping-tools.php',
			'class-webino-shipping-currency.php',
			'class-webino-shipping-weight.php',
			'class-webino-shipping-packer.php',
			'class-webino-shipping-method-packaging.php',
			'class-webino-shipping-method-flat-city.php',
			'class-webino-shipping-order-statuses.php',
			'class-webino-shipping-cities.php',
			'class-webino-shipping-checkout-district.php',
			'class-webino-shipping-account-cities.php',
			'class-webino-shipping-map.php',
			'class-webino-shipping-rules.php',
			'class-webino-shipping-dokan.php',
			'class-webino-dashboard-rest-shipping.php',
		),
		'shipping-module'
	) ) {
	return;
}

Webino_Shipping_Packaging_Settings::init();
Webino_Shipping_Tools::init();
Webino_Shipping_Order_Statuses::init();
Webino_Shipping_Cities::init();
Webino_Shipping_Checkout_District::init();
Webino_Shipping_Account_Cities::init();
Webino_Shipping_Map::init();
Webino_Shipping_Rules::init();
Webino_Shipping_Dokan::init();
Webino_Shipping_Packer::init();
Webino_Shipping_Method_Packaging::register();
Webino_Shipping_Method_Flat_City::register();
Webino_Dashboard_REST_Shipping::init();
