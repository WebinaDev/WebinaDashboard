<?php
/**
 * Bale Pay gateway module bootstrap.
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
			'class-bale-pay-config.php',
			'class-bale-pay-service.php',
			'class-webino-dashboard-rest-bale-pay.php',
		),
		'bale-pay-gateway-module'
	) ) {
	return;
}

Webino_Dashboard_REST_Bale_Pay::init();

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
	|| ! Webino_Dashboard_Module_Registry::require_module_files(
		$dir,
		array(
			'woocommerce/class-wc-gateway-bale-pay.php',
			'class-bale-pay-module.php',
		),
		'bale-pay-gateway-module'
	) ) {
	return;
}

Webino_Bale_Pay_Module::init();
