<?php
/**
 * Basalam module bootstrap.
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
			'class-basalam-engine-bootstrap.php',
			'class-basalam-config.php',
			'api/class-basalam-auth.php',
			'api/class-basalam-client.php',
			'class-basalam-gateway-service.php',
			'class-basalam-wallet-service.php',
			'class-basalam-subscriptions-service.php',
			'sync/class-basalam-reconciliation-service.php',
			'webhooks/class-basalam-webhook-handler.php',
			'class-basalam-jobs.php',
			'class-basalam-endpoint-registry.php',
			'class-webino-dashboard-rest-basalam.php',
			'class-basalam-wnc-bridge.php',
			'class-basalam-module.php',
		),
		'basalam-module'
	) ) {
	return;
}

// Independent WooSalam-parity engine (does not use WNC Basalam adapter).
Webino_Basalam_Engine_Bootstrap::init();
Webino_Dashboard_REST_Basalam::init();
Webino_Dashboard_Basalam_Wnc_Bridge::init();

if ( class_exists( 'WC_Payment_Gateway', false ) ) {
	if ( class_exists( 'Webino_Dashboard_Module_Registry', false )
		&& Webino_Dashboard_Module_Registry::require_module_files(
			$dir,
			array( 'woocommerce/class-wc-gateway-basalam.php' ),
			'basalam-module'
		) ) {
		// Legacy gateway kept but not primary sync surface.
	}
}

Webino_Basalam_Module::init();
