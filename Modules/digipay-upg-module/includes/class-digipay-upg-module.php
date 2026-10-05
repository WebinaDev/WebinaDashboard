<?php
/**
 * DigiPay UPG module runtime hooks.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_Digipay_UPG_Module {

	/**
	 * @return void
	 */
	public static function init() {
		// Modules load on init (after plugins_loaded) — register the filter immediately.
		if ( class_exists( 'WC_Payment_Gateway', false ) ) {
			add_filter( 'woocommerce_payment_gateways', array( __CLASS__, 'payment_gateways' ) );
		}
		add_action( 'woocommerce_api_webino_digipay_upg', array( 'Digipay_Callback_Handler', 'handle' ) );
		add_action( 'woocommerce_order_status_completed', array( 'Digipay_Lifecycle', 'maybe_deliver_order' ), 20 );
		add_action( 'woocommerce_refund_created', array( 'Digipay_Lifecycle', 'on_refund_created' ), 20, 2 );
	}

	/**
	 * @param array<int,string> $gateways Gateways.
	 * @return array<int,string>
	 */
	public static function payment_gateways( $gateways ) {
		if ( Digipay_OAuth::official_plugin_active() ) {
			return $gateways;
		}
		foreach ( array( 'WC_Gateway_Digipay_BPG', 'WC_Gateway_Digipay_CPG', 'WC_Gateway_Digipay_Wallet', 'WC_Gateway_Digipay_IPG' ) as $class ) {
			if ( class_exists( $class, false ) ) {
				$gateways[] = $class;
			}
		}
		return $gateways;
	}
}
