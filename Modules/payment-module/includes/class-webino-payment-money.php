<?php
/**
 * Shared Iranian currency + phone helpers for payment gateways.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Money / mobile utilities shared by SnappPay, TorobPay, DigiPay.
 */
final class Webino_Payment_Money {

	/**
	 * Convert an amount in store currency to integer Iranian Rial.
	 *
	 * Uses the shared Webino_Dashboard_Currency factors when available
	 * (IRR×1, IRT×10, IRHR×1000, IRHT×10000 — Persian WooCommerce / gateway practice).
	 * Falls back to the same map when the core helper is not loaded yet.
	 *
	 * @param float       $amount   Amount.
	 * @param string|null $currency ISO currency (defaults to WC currency).
	 * @return int
	 */
	public static function to_rial( $amount, $currency = null ) {
		$amount   = (float) $amount;
		$currency = (string) ( $currency ?: ( function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRT' ) );

		/**
		 * Filter amount before Iranian rial conversion.
		 *
		 * @param float  $amount   Amount.
		 * @param string $currency Currency.
		 */
		$amount = (float) apply_filters( 'woocommerce_order_amount_total_iranian_gateways_before_check_currency', $amount, $currency );

		if ( class_exists( 'Webino_Dashboard_Currency', false ) ) {
			$rial = Webino_Dashboard_Currency::to_rial_int( $amount, $currency );
		} elseif ( class_exists( 'Webino_Shipping_Currency', false ) ) {
			$rial = (int) round( Webino_Shipping_Currency::to_rial( $amount, $currency ) );
		} else {
			// Inline fallback — keep in sync with Webino_Dashboard_Currency::rial_factors().
			$code = strtoupper( $currency );
			$map  = array(
				'IRR'   => 1.0,
				'IRT'   => 10.0,
				'TOMAN' => 10.0,
				'IRHR'  => 1000.0,
				'IRHT'  => 10000.0,
			);
			$factor = isset( $map[ $code ] ) ? (float) $map[ $code ] : 10.0; // assume toman-like.
			$rial  = (int) round( $amount * $factor );
		}

		/**
		 * Filter amount after Iranian rial conversion.
		 *
		 * @param int    $rial     Amount in rial.
		 * @param string $currency Currency.
		 */
		return (int) apply_filters( 'woocommerce_order_amount_total_iranian_gateways_irr', $rial, $currency );
	}

	/**
	 * Order total in Iranian Rial.
	 *
	 * @param WC_Order $order Order.
	 * @return int
	 */
	public static function order_total_rial( $order ) {
		if ( ! $order instanceof WC_Order ) {
			return 0;
		}
		$rial = self::to_rial( (float) $order->get_total(), $order->get_currency() );
		/**
		 * Per-gateway amount filter (SnappPay-compatible name).
		 *
		 * @param int      $rial  Amount.
		 * @param WC_Order $order Order.
		 */
		return (int) apply_filters( 'woocommerce_order_amount_total_snapppay_gateway', $rial, $order );
	}

	/**
	 * Normalize Iranian mobile to +98xxxxxxxxxx.
	 *
	 * @param string $phone Raw phone.
	 * @return string Empty when invalid.
	 */
	public static function normalize_mobile( $phone ) {
		$phone = trim( (string) $phone );
		if ( '' === $phone ) {
			return '';
		}
		// Persian/Arabic digits → Latin.
		$phone = strtr(
			$phone,
			array(
				'۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
				'۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
				'٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
				'٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
			)
		);
		$phone = preg_replace( '/[^\d+]/', '', $phone );
		$phone = (string) $phone;
		if ( 0 === strpos( $phone, '0098' ) ) {
			$phone = '+' . substr( $phone, 2 );
		}
		if ( 0 === strpos( $phone, '098' ) ) {
			$phone = '+98' . substr( $phone, 3 );
		}
		if ( 0 === strpos( $phone, '98' ) && 0 !== strpos( $phone, '+' ) ) {
			$phone = '+' . $phone;
		}
		if ( 0 === strpos( $phone, '0' ) ) {
			$phone = '+98' . substr( $phone, 1 );
		}
		if ( ! preg_match( '/^\+98\d{10}$/', $phone ) ) {
			return '';
		}
		return $phone;
	}

	/**
	 * Append an event to a capped option log.
	 *
	 * @param string               $option_key Option.
	 * @param array<string,mixed>  $row        Row.
	 * @param int                  $max        Max rows.
	 * @return void
	 */
	public static function push_log( $option_key, array $row, $max = 200 ) {
		$logs = get_option( (string) $option_key, array() );
		if ( ! is_array( $logs ) ) {
			$logs = array();
		}
		$row['ts'] = isset( $row['ts'] ) ? (string) $row['ts'] : gmdate( 'c' );
		array_unshift( $logs, $row );
		$logs = array_slice( $logs, 0, max( 1, (int) $max ) );
		update_option( (string) $option_key, $logs, false );
	}
}
