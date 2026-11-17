<?php
/**
 * Transport / shipping module bootstrap.
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
			'class-webino-shipping-packaging-settings.php',
			'class-webino-shipping-professional-packaging.php',
			'class-webino-shipping-tools.php',
			'class-webino-shipping-currency.php',
			'class-webino-shipping-weight.php',
			'class-webino-shipping-packer.php',
			'class-webino-shipping-method-packaging.php',
			'class-webino-shipping-method-flat-city.php',
			'class-webino-shipping-order-statuses.php',
			'class-webino-shipping-cities.php',
			'class-webino-shipping-checkout-district.php',
			'class-webino-shipping-account-cities.php',
			'class-webino-shipping-map.php',
			'class-webino-shipping-rules.php',
			'class-webino-shipping-item-cost.php',
			'class-webino-shipping-dokan.php',
			'class-webino-dashboard-rest-shipping.php',
		),
		'shipping-module'
	) ) {
	/**
	 * One-time safe defaults migration for 0.9.89+: ensure shipping sections default OFF
	 * on upgraded stores without losing existing credentials, boxes, rules or prices.
	 *
	 * @return void
	 */
	function webino_shipping_ensure_safe_defaults_v0989() {
		$flag = 'webino_shipping_defaults_off_v0989';
		if ( '1' === (string) get_option( $flag, '' ) ) {
			return;
		}
		update_option( $flag, '1', false );

		$pack = get_option( Webino_Shipping_Packaging_Settings::OPTION, null );
		if ( is_array( $pack ) ) {
			$pack['enabled']                        = false;
			$pack['add_packaging_cost_to_checkout'] = false;
			update_option( Webino_Shipping_Packaging_Settings::OPTION, $pack, false );
		}

		$tools = get_option( Webino_Shipping_Tools::OPTION, null );
		if ( is_array( $tools ) ) {
			$tools['enabled'] = false;
			update_option( Webino_Shipping_Tools::OPTION, $tools, false );
		}

		$map = get_option( Webino_Shipping_Map::OPTION, null );
		if ( is_array( $map ) ) {
			$map['enabled'] = false;
			update_option( Webino_Shipping_Map::OPTION, $map, false );
		}

		if ( null === get_option( Webino_Shipping_Cities::SETTINGS_OPTION, null ) ) {
			update_option( Webino_Shipping_Cities::SETTINGS_OPTION, array( 'enabled' => false ), false );
		}

		if ( null === get_option( Webino_Shipping_Rules::ENABLED_OPTION, null ) ) {
			update_option( Webino_Shipping_Rules::ENABLED_OPTION, '0', false );
		}

		$tapin = get_option( 'webino_tapin_settings', null );
		if ( is_array( $tapin ) ) {
			$token   = trim( (string) ( $tapin['token'] ?? '' ) );
			$shop_id = trim( (string) ( $tapin['shop_id'] ?? '' ) );
			if ( '' === $token || '' === $shop_id ) {
				$tapin['enabled'] = false;
				update_option( 'webino_tapin_settings', $tapin, false );
			}
		}
	}
}

webino_shipping_ensure_safe_defaults_v0989();

Webino_Shipping_Packaging_Settings::init();
Webino_Shipping_Professional_Packaging::init();
Webino_Shipping_Tools::init();
Webino_Shipping_Order_Statuses::init();
Webino_Shipping_Cities::init();
Webino_Shipping_Checkout_District::init();
Webino_Shipping_Account_Cities::init();
Webino_Shipping_Map::init();
Webino_Shipping_Rules::init();
Webino_Shipping_Item_Cost::init();
Webino_Shipping_Dokan::init();
Webino_Shipping_Packer::init();
Webino_Shipping_Method_Packaging::register();
Webino_Shipping_Method_Flat_City::register();
Webino_Dashboard_REST_Shipping::init();
