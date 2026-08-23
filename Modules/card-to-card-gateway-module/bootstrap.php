<?php
/**
 * Card-to-card gateway module bootstrap.
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
			'class-c2c-config.php',
			'class-c2c-receipts.php',
			'class-webino-dashboard-rest-c2c.php',
		),
		'card-to-card-gateway-module'
	) ) {
	return;
}

Webino_Dashboard_REST_C2C::init();

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
	|| ! Webino_Dashboard_Module_Registry::require_module_files(
		$dir,
		array(
			'woocommerce/class-wc-gateway-c2c.php',
			'class-c2c-module.php',
		),
		'card-to-card-gateway-module'
	) ) {
	return;
}

Webino_C2C_Module::init();
