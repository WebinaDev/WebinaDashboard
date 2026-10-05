<?php
/**
 * SMS panel module bootstrap.
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
			'class-webino-dashboard-sms-settings.php',
			'class-webino-dashboard-sms.php',
			'class-webino-dashboard-sms-order-map.php',
			'class-webino-dashboard-sms-order-hooks.php',
			'class-webino-dashboard-sms-recovery.php',
			'class-webino-dashboard-sms-warehouse-stock.php',
			'class-webino-dashboard-sms-ads-segments.php',
			'class-webino-dashboard-sms-ads.php',
			'class-webino-dashboard-rest-modirpayamak.php',
		),
		'sms-panel-module'
	) ) {
	return;
}

Webino_Dashboard_REST_ModirPayamak::init();
Webino_Dashboard_Sms_Order_Hooks::init();
Webino_Dashboard_Sms_Recovery::init();
Webino_Dashboard_Sms_Ads::init();
add_action( 'woocommerce_add_to_cart', array( 'Webino_Dashboard_Sms_Recovery', 'touch_cart' ), 20 );
add_action( 'woocommerce_cart_item_removed', array( 'Webino_Dashboard_Sms_Recovery', 'touch_cart' ), 20 );
add_action( 'woocommerce_after_cart_item_quantity_update', array( 'Webino_Dashboard_Sms_Recovery', 'touch_cart' ), 20 );
