<?php
/**
 * DigiPay UPG module bootstrap.
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
			'api/class-digipay-oauth.php',
			'api/class-digipay-api-client.php',
			'class-digipay-order-service.php',
			'class-digipay-lifecycle.php',
			'class-digipay-callback-handler.php',
			'class-webino-dashboard-rest-digipay.php',
		),
		'digipay-upg-module'
	) ) {
	return;
}

Webino_Dashboard_REST_Digipay::init();

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
	|| ! Webino_Dashboard_Module_Registry::require_module_files(
		$dir,
		array(
			'woocommerce/abstract-class-wc-gateway-digipay-upg.php',
		),
		'digipay-upg-module'
	) ) {
	return;
}

if ( ! class_exists( 'WC_Gateway_Digipay_UPG', false ) ) {
	return;
}

if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
	|| ! Webino_Dashboard_Module_Registry::require_module_files(
		$dir,
		array(
			'woocommerce/class-wc-gateway-digipay-bpg.php',
			'woocommerce/class-wc-gateway-digipay-cpg.php',
			'woocommerce/class-wc-gateway-digipay-wallet.php',
			'woocommerce/class-wc-gateway-digipay-ipg.php',
			'class-digipay-upg-module.php',
		),
		'digipay-upg-module'
	) ) {
	return;
}

Webino_Digipay_UPG_Module::init();
