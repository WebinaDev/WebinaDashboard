<?php
/**
 * Digikala sellers module bootstrap.
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
			'class-digikala-engine-bootstrap.php',
			'class-digikala-storage.php',
			'class-digikala-jobs.php',
			'class-digikala-endpoint-registry.php',
			'api/class-digikala-auth.php',
			'api/class-digikala-client.php',
			'sync/class-digikala-product-sync.php',
			'sync/class-digikala-product-map.php',
			'sync/class-digikala-inventory-sync.php',
			'sync/class-digikala-order-sync.php',
			'sync/class-digikala-phase2-sync.php',
			'sync/class-digikala-phase3-sync.php',
			'webhooks/class-digikala-webhook-handler.php',
			'class-webino-dashboard-rest-digikala.php',
			'class-digikala-module.php',
			'class-digikala-wnc-bridge.php',
		),
		'digikala-sellers-module'
	) ) {
	return;
}

Webino_Digikala_Engine_Bootstrap::init();
Webino_Digikala_Module::init();
Webino_Dashboard_REST_Digikala::init();
Webino_Dashboard_Digikala_Wnc_Bridge::init();
