<?php
/**
 * Currency helpers for reference price sync.
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Normalize scraped prices into purchase-price units.
 */
class WFCP_Reference_Currency {

	/**
	 * Convert a scraped price to store purchase-price unit.
	 *
	 * Scraped amounts are expected in toman (or rial when $unit is 'rial').
	 * Then converted using purchase_currency + exchange_rate settings.
	 *
	 * @param float  $amount Scraped amount.
	 * @param string $unit   'toman' or 'rial'.
	 * @return float Purchase price value for _wfcp_purchase_price.
	 */
	public static function to_purchase_price( $amount, $unit = 'toman' ) {
		$amount = floatval( $amount );
		if ( $amount <= 0 ) {
			return 0.0;
		}

		// Normalize to toman first.
		$toman = ( 'rial' === $unit ) ? ( $amount / 10.0 ) : $amount;

		$general = WFCP_Helper::get_settings( 'general' );
		if ( ! is_array( $general ) ) {
			$general = array();
		}

		$purchase_currency = isset( $general['purchase_currency'] ) ? $general['purchase_currency'] : 'base';
		$exchange_enabled  = isset( $general['exchange_rate_enabled'] )
			? WFCP_Helper::to_bool( $general['exchange_rate_enabled'] )
			: true;
		$rate = isset( $general['exchange_rate'] ) ? floatval( $general['exchange_rate'] ) : 0;

		// Display currency purchase price: store as display units.
		// WooCommerce may use IRR (rial) or IRT/IRT-like toman — convert toman → store display.
		if ( 'display' === $purchase_currency || ! $exchange_enabled || $rate <= 0 ) {
			$wc_currency = function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRT';
			if ( in_array( strtoupper( (string) $wc_currency ), array( 'IRR', 'IR' ), true ) ) {
				return round( $toman * 10, 2 );
			}
			return round( $toman, 2 );
		}

		// Base (FX) purchase currency: divide toman by exchange rate (toman per 1 FX unit).
		return round( $toman / $rate, 4 );
	}

	/**
	 * Guess whether an amount looks like rial vs toman when both appear.
	 * Prefer explicit unit from adapters; this is a fallback heuristic.
	 *
	 * @param float $amount Amount.
	 * @return string
	 */
	public static function guess_unit( $amount ) {
		$amount = floatval( $amount );
		// Large round multiples often rial from OG meta on Iranian Woo shops.
		if ( $amount >= 100000 && 0 === ( (int) $amount % 10 ) ) {
			return 'rial';
		}
		return 'toman';
	}
}
