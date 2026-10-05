<?php
/**
 * SnappPay gateway module bootstrap (first-party, no vendor plugin).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$dir = dirname( __FILE__ ) . '/includes/';

// Ensure shared payment helpers (parent module may load later).
$payment_includes = dirname( dirname( __FILE__ ) ) . '/payment-module/includes/';
foreach ( array( 'class-webino-payment-gateway-bridge.php', 'class-webino-payment-money.php' ) as $helper ) {
	$path = $payment_includes . $helper;
	if ( is_readable( $path ) ) {
		require_once $path;
	}
}

if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
	|| ! Webino_Dashboard_Module_Registry::require_module_files(
		$dir,
		array(
			'class-snapppay-config.php',
			'api/class-snapppay-api-client.php',
			'class-webino-dashboard-rest-snapppay.php',
		),
		'snapppay-gateway-module'
	) ) {
	return;
}

Webino_Dashboard_REST_SnappPay::init();

if ( class_exists( 'WC_Payment_Gateway', false ) ) {
	if ( Webino_SnappPay_Config::should_register_gateway() ) {
		$gw = $dir . 'woocommerce/class-wc-gateway-snapppay.php';
		if ( is_readable( $gw ) ) {
			require_once $gw;
		}
	}
	$mod = $dir . 'class-snapppay-module.php';
	if ( is_readable( $mod ) ) {
		require_once $mod;
		Webino_SnappPay_Module::init();
	}
}
