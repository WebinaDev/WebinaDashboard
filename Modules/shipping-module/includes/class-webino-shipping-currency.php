<?php
/**
 * Iranian currency helpers for shipping rates and Tapin payloads.
 *
 * Supports IRR, IRT (toman), IRHR (rial/10), IRHT (toman/10).
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
		$code = strtoupper( (string) ( $currency ?: get_woocommerce_currency() ) );
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
