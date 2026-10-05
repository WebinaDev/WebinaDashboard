<?php
/**
 * Zarinpal gateway module bootstrap.
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
			'class-zarinpal-config.php',
			'api/class-zarinpal-client.php',
			'class-zarinpal-gateway-service.php',
			'class-zarinpal-jobs.php',
			'class-zarinpal-endpoint-registry.php',
			'class-webino-dashboard-rest-zarinpal.php',
		),
		'zarinpal-gateway-module'
	) ) {
	return;
}

Webino_Dashboard_REST_Zarinpal::init();

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
	|| ! Webino_Dashboard_Module_Registry::require_module_files(
		$dir,
		array(
			'woocommerce/class-wc-gateway-zarinpal.php',
			'class-zarinpal-module.php',
		),
		'zarinpal-gateway-module'
	) ) {
	return;
}

Webino_Zarinpal_Module::init();
