<?php

namespace Webino_Dashboard_Bots_Telegram\Util;

/**
 * Toman amounts for bot UI (Persian digits).
 */
class MoneyFormatter {

	/**
	 * @var list<string>
	 */
	private static $western_digits = array( '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' );

	/**
	 * @var list<string>
	 */
	private static $persian_digits = array( '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹' );

	public static function to_persian_digits( string $s ): string {
		return str_replace( self::$western_digits, self::$persian_digits, $s );
	}

	public static function format_toman_fa( float $amount ): string {
		$formatted = number_format( (float) $amount, 0, '.', ',' );
		return self::to_persian_digits( $formatted ) . ' ' . __( 'تومان', 'webino-dashboard' );
	}

	/**
	 * Ensure plain-text price reads «amount تومان» (not «تومان amount») after WooCommerce formatting.
	 */
	public static function normalize_amount_then_toman( string $sanitized_price_text ): string {
		$s     = trim( $sanitized_price_text );
		$toman = __( 'تومان', 'webino-dashboard' );
		if ( $s === '' ) {
			return $s;
		}
		// Already "… تومان"
		if ( preg_match( '/^(.+?)\s+' . preg_quote( $toman, '/' ) . '\s*$/u', $s, $m ) ) {
			return trim( $m[1] ) . ' ' . $toman;
		}
		// WooCommerce / theme: «تومان …» — swap to «… تومان»
		if ( preg_match( '/^' . preg_quote( $toman, '/' ) . '\s+(.+)$/u', $s, $m ) ) {
			return trim( $m[1] ) . ' ' . $toman;
		}
		// «… ریال» → same order with تومان label for bot copy
		if ( preg_match( '/^(.+?)\s+ریال\s*$/u', $s, $m ) ) {
			return trim( $m[1] ) . ' ' . $toman;
		}
		if ( stripos( $s, $toman ) === false && ! preg_match( '/ریال/u', $s ) ) {
			return $s . ' ' . $toman;
		}
		return $s;
	}

	/**
	 * Strip HTML entities and nbsp from WooCommerce price HTML for plain-text chat messages.
	 */
	public static function sanitize_price_html_string( string $formatted ): string {
		$decoded = wp_strip_all_tags( $formatted );
		$decoded = html_entity_decode( $decoded, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$decoded = str_replace( array( '&nbsp;', "\xc2\xa0" ), ' ', $decoded );
		$decoded = preg_replace( '/\s+/u', ' ', $decoded );
		return trim( (string) $decoded );
	}

	/**
	 * Format a money amount like WooCommerce storefront (currency symbol, no HTML artifacts).
	 *
	 * @param \WC_Order|null $order Optional order for currency context.
	 */
	public static function plain_price_amount( float $amount, ?\WC_Order $order = null ): string {
		if ( ! function_exists( 'wc_price' ) ) {
			return self::format_toman_fa( $amount );
		}
		$args = array();
		if ( $order instanceof \WC_Order ) {
			$args['currency'] = $order->get_currency();
		}
		$formatted = (string) wc_price( $amount, $args );
		return self::normalize_amount_then_toman( self::sanitize_price_html_string( $formatted ) );
	}

	public static function plain_formatted_order_total( \WC_Order $order ): string {
		return self::normalize_amount_then_toman( self::sanitize_price_html_string( (string) $order->get_formatted_order_total() ) );
	}
}
