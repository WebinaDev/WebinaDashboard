<?php
/**
 * Store wallet gateway module bootstrap.
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
			'class-wallet-config.php',
			'class-webino-dashboard-rest-wallet.php',
		),
		'wallet-gateway-module'
	) ) {
	return;
}

Webino_Dashboard_REST_Wallet::init();

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
	|| ! Webino_Dashboard_Module_Registry::require_module_files(
		$dir,
		array(
			'class-wallet-module.php',
		),
		'wallet-gateway-module'
	) ) {
	return;
}

Webino_Wallet_Module::init();
