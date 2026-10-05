<?php
/**
 * TorobPay gateway module bootstrap (first-party, no vendor plugin).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$dir = dirname( __FILE__ ) . '/includes/';

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
			'class-torobpay-config.php',
			'api/class-torobpay-api-client.php',
			'class-torobpay-refund.php',
			'class-webino-dashboard-rest-torobpay.php',
		),
		'torobpay-gateway-module'
	) ) {
	return;
}

Webino_Dashboard_REST_TorobPay::init();

if ( class_exists( 'WC_Payment_Gateway', false ) ) {
	if ( Webino_TorobPay_Config::should_register_gateway() ) {
		$gw = $dir . 'woocommerce/class-wc-gateway-torobpay.php';
		if ( is_readable( $gw ) ) {
			require_once $gw;
		}
	}
	$mod = $dir . 'class-torobpay-module.php';
	if ( is_readable( $mod ) ) {
		require_once $mod;
		Webino_TorobPay_Module::init();
	}
}
