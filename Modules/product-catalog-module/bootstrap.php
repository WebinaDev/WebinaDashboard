<?php
/**
 * Product catalog module bootstrap.
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
			'class-webino-dashboard-product-catalog-settings.php',
			'class-webino-dashboard-product-catalog-http.php',
			'providers/class-webino-dashboard-catalog-provider.php',
			'providers/class-webino-dashboard-catalog-off-provider.php',
			'providers/class-webino-dashboard-catalog-openlibrary-provider.php',
			'providers/class-webino-dashboard-catalog-googlebooks-provider.php',
			'providers/class-webino-dashboard-catalog-upcitemdb-provider.php',
			'providers/class-webino-dashboard-catalog-barcodenest-provider.php',
			'providers/class-webino-dashboard-catalog-gtinhub-provider.php',
			'providers/class-webino-dashboard-catalog-buycott-provider.php',
			'class-webino-dashboard-product-catalog-registry.php',
			'class-webino-dashboard-product-catalog-import.php',
			'class-webino-dashboard-product-catalog-rest.php',
		),
		'product-catalog-module'
	) ) {
	return;
}

Webino_Dashboard_Product_Catalog_REST::init();
