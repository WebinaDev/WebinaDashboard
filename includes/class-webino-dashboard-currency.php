<?php
/**
 * Currency display helpers (IRT / Toman SVG icon).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared currency formatting for dashboard HTML output.
 */
class Webino_Dashboard_Currency {

	/**
	 * @param string|null $code_or_label Currency code or label.
	 * @param string|null $symbol Optional currency symbol.
	 * @return bool
	 */
	public static function is_toman_currency( $code_or_label, $symbol = null ) {
		$code = trim( (string) $code_or_label );
		$sym  = trim( (string) $symbol );
		if ( '' === $code && '' === $sym ) {
			return false;
		}
		$upper = strtoupper( $code );
		if ( in_array( $upper, array( 'IRT', 'TOMAN' ), true ) ) {
			return true;
		}
		if ( preg_match( '/تومان|toman|irt/iu', $code ) || preg_match( '/تومان|toman|irt/iu', $sym ) ) {
			return true;
		}
		return false;
	}

	/**
	 * @return string
	 */
	public static function irt_icon_url() {
		return WEBINO_DASHBOARD_URL . 'assets/irt.svg';
	}

	/**
	 * @param array<string, string> $attrs Extra HTML attributes.
	 * @return string
	 */
	public static function irt_icon_html( $attrs = array() ) {
		$defaults = array(
			'src'   => self::irt_icon_url(),
			'alt'   => '',
			'class' => 'webino-irt-icon',
		);
		$attrs    = array_merge( $defaults, $attrs );
		$html     = '<img';
		foreach ( $attrs as $key => $value ) {
			$html .= ' ' . esc_attr( $key ) . '="' . esc_attr( (string) $value ) . '"';
		}
		$html .= ' />';
		return $html;
	}

	/**
	 * Inline CSS for IRT icon alignment.
	 *
	 * @return string
	 */
	public static function icon_styles() {
		return '.webino-irt-icon{display:inline-block;vertical-align:-0.12em;height:0.85em;width:auto;}';
	}

	/**
	 * @param float       $amount Amount.
	 * @param string|null $currency Currency code.
	 * @param string|null $symbol Currency symbol override.
	 * @return string
	 */
	public static function format_amount_with_currency( $amount, $currency = null, $symbol = null ) {
		$currency = null !== $currency ? (string) $currency : ( function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '' );
		if ( null === $symbol && function_exists( 'get_woocommerce_currency_symbol' ) ) {
			$symbol = get_woocommerce_currency_symbol( $currency );
		}
		$formatted = Webino_Dashboard_Locale::format_number(
			(float) $amount,
			function_exists( 'wc_get_price_decimals' ) ? wc_get_price_decimals() : 0
		);
		if ( self::is_toman_currency( $currency, $symbol ) ) {
			return $formatted . ' ' . self::irt_icon_html();
		}
		$sym = $symbol ? (string) $symbol : $currency;
		return $formatted . ( $sym ? ' ' . esc_html( $sym ) : '' );
	}

	/**
	 * Format WC order price with IRT icon when applicable.
	 *
	 * @param float    $amount Amount.
	 * @param WC_Order $order Order.
	 * @return string
	 */
	public static function format_order_amount( $amount, $order ) {
		return self::format_amount_with_currency( $amount, $order->get_currency(), function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol( $order->get_currency() ) : '' );
	}
}
