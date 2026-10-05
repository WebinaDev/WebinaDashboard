<?php
/**
 * Bridge Basalam module → WebinaConnector pricing when available.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Prefer WNC_Pricing for Basalam channel prices.
 */
final class Webino_Dashboard_Basalam_Wnc_Bridge {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'webino_basalam_channel_price', array( __CLASS__, 'channel_price' ), 10, 2 );
		add_action( 'webino_basalam_push_inventory', array( __CLASS__, 'push_via_wnc' ), 10, 1 );
	}

	/**
	 * @param float $price Price.
	 * @param int   $product_id Product ID.
	 * @return float
	 */
	public static function channel_price( $price, $product_id ) {
		if ( ! class_exists( 'WNC_Pricing', false ) ) {
			return (float) $price;
		}
		$calc = WNC_Pricing::get_price( (int) $product_id, 'basalam' );
		return $calc > 0 ? (float) $calc : (float) $price;
	}

	/**
	 * @param int $product_id Product ID.
	 * @return void
	 */
	public static function push_via_wnc( $product_id ) {
		if ( ! class_exists( 'WNC_Price_Sync', false ) ) {
			return;
		}
		WNC_Price_Sync::enqueue_for_product( (int) $product_id );
	}
}
