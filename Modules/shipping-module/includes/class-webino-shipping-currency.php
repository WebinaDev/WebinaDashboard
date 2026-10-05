<?php
/**
 * Iranian currency helpers for shipping rates and Tapin payloads.
 *
 * Canonical factors (shared with payments via Webino_Dashboard_Currency):
 * IRR×1, IRT×10, IRHR×1000 (هزار ریال), IRHT×10000 (هزار تومان).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webino_Shipping_Currency {

	/**
	 * Factor to convert store amount → rial (IRR).
	 *
	 * @param string|null $currency Currency code.
	 * @return float
	 */
	public static function to_rial_factor( $currency = null ) {
		if ( class_exists( 'Webino_Dashboard_Currency', false ) ) {
			return Webino_Dashboard_Currency::to_rial_factor( $currency );
		}
		$code = strtoupper( (string) ( $currency ?: ( function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRR' ) ) );
		$map  = array(
			'IRR'  => 1.0,
			'IRT'  => 10.0,
			'IRHR' => 1000.0,
			'IRHT' => 10000.0,
		);
		return isset( $map[ $code ] ) ? (float) $map[ $code ] : 1.0;
	}

	/**
	 * Factor to convert rial (IRR) → store currency.
	 *
	 * @param string|null $currency Currency.
	 * @return float
	 */
	public static function from_rial_factor( $currency = null ) {
		$f = self::to_rial_factor( $currency );
		return $f > 0 ? ( 1.0 / $f ) : 1.0;
	}

	/**
	 * Convert amount in store currency to IRR (rial).
	 *
	 * @param float       $amount Amount.
	 * @param string|null $currency Currency.
	 * @return float
	 */
	public static function to_rial( $amount, $currency = null ) {
		if ( class_exists( 'Webino_Dashboard_Currency', false ) ) {
			return Webino_Dashboard_Currency::to_rial( $amount, $currency );
		}
		return (float) $amount * self::to_rial_factor( $currency );
	}

	/**
	 * Convert IRR amount to store currency.
	 *
	 * @param float       $rial Amount in rial.
	 * @param string|null $currency Currency.
	 * @return float
	 */
	public static function from_rial( $rial, $currency = null ) {
		if ( class_exists( 'Webino_Dashboard_Currency', false ) ) {
			return Webino_Dashboard_Currency::from_rial( $rial, $currency );
		}
		return (float) $rial * self::from_rial_factor( $currency );
	}

	/**
	 * Round shipping cost for Iranian currencies (nearest 1000 rial equivalent).
	 *
	 * @param float       $amount Store currency amount.
	 * @param string|null $currency Currency.
	 * @return float
	 */
	public static function round_shipping( $amount, $currency = null ) {
		$rial = self::to_rial( $amount, $currency );
		$rial = round( $rial / 1000 ) * 1000;
		return self::from_rial( $rial, $currency );
	}
}
