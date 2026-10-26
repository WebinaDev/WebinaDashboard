<?php
/**
 * Pricing mode helpers: works with or without the wfcp pricing module.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single source of truth for "is the pricing module (wfcp) on?" and the plain
 * single-price WooCommerce write used when it is off.
 */
final class Webino_Dashboard_Pricing {

	/**
	 * Pricing module loaded AND toggled on.
	 *
	 * @return bool
	 */
	public static function wfcp_on() {
		if ( ! class_exists( 'WFCP_Helper', false ) ) {
			return false;
		}
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) && method_exists( 'Webino_Dashboard_Module_Registry', 'wfcp_ready' ) ) {
			if ( ! Webino_Dashboard_Module_Registry::wfcp_ready() ) {
				return false;
			}
		}
		// The module's own master switch (Settings → pricing → enabled).
		return method_exists( 'WFCP_Helper', 'is_enabled' ) ? (bool) WFCP_Helper::is_enabled() : true;
	}

	/**
	 * Normalize a raw price input ("1,200,000", Persian digits, "") to a WC decimal string or ''.
	 *
	 * @param mixed $raw Raw value.
	 * @return string
	 */
	public static function normalize_price( $raw ) {
		if ( null === $raw || is_array( $raw ) || is_object( $raw ) ) {
			return '';
		}
		$s = trim( (string) $raw );
		if ( '' === $s ) {
			return '';
		}
		$s = strtr(
			$s,
			array(
				'۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
				'٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
				'٬' => '', ',' => '', '٫' => '.', ' ' => '',
			)
		);
		if ( ! is_numeric( $s ) || (float) $s < 0 ) {
			return '';
		}
		return function_exists( 'wc_format_decimal' ) ? (string) wc_format_decimal( $s ) : (string) ( 0 + $s );
	}

	/**
	 * Resolve the active price from regular + sale (WooCommerce semantics).
	 * A sale counts only when it is > 0 and strictly below a positive regular price.
	 *
	 * @param string $regular Regular price ('' allowed).
	 * @param string $sale    Sale price ('' allowed).
	 * @return array{regular:string,sale:string,price:string}
	 */
	public static function resolve( $regular, $sale ) {
		$regular = self::normalize_price( $regular );
		$sale    = self::normalize_price( $sale );
		if ( '' !== $sale && ( (float) $sale <= 0 || ( '' !== $regular && (float) $sale >= (float) $regular ) ) ) {
			$sale = '';
		}
		if ( '' !== $sale && '' === $regular ) {
			// Sale without regular: treat as the single price.
			$regular = $sale;
			$sale    = '';
		}
		$price = '' !== $sale ? $sale : $regular;
		return array(
			'regular' => $regular,
			'sale'    => $sale,
			'price'   => $price,
		);
	}

	/**
	 * Write regular/sale/_price onto a product or variation (does not save).
	 *
	 * @param WC_Product  $product Product.
	 * @param string|null $regular New regular (null = keep current).
	 * @param string|null $sale    New sale (null = keep current).
	 * @return void
	 */
	public static function apply( $product, $regular = null, $sale = null ) {
		if ( ! $product || ! is_object( $product ) || ! method_exists( $product, 'set_regular_price' ) ) {
			return;
		}
		$reg_in  = null === $regular ? (string) $product->get_regular_price( 'edit' ) : $regular;
		$sale_in = null === $sale ? (string) $product->get_sale_price( 'edit' ) : $sale;
		$r       = self::resolve( $reg_in, $sale_in );
		$product->set_regular_price( $r['regular'] );
		$product->set_sale_price( $r['sale'] );
		$product->set_price( $r['price'] );
	}

	/**
	 * Price used for marketplaces / feeds when wfcp is off: the WooCommerce active price
	 * (sale if valid), falling back to regular.
	 *
	 * @param WC_Product|int $product Product or id.
	 * @return float
	 */
	public static function active_price( $product ) {
		if ( is_numeric( $product ) && function_exists( 'wc_get_product' ) ) {
			$product = wc_get_product( (int) $product );
		}
		if ( ! $product || ! is_object( $product ) ) {
			return 0.0;
		}
		$price = (float) $product->get_price( 'edit' );
		if ( $price <= 0 ) {
			$price = (float) $product->get_regular_price( 'edit' );
		}
		if ( $price <= 0 && method_exists( $product, 'is_type' ) && $product->is_type( 'variable' ) && method_exists( $product, 'get_variation_price' ) ) {
			$price = (float) $product->get_variation_price( 'min' );
		}
		return max( 0.0, $price );
	}
}

// Standalone/bundled wfcp: storefront output only when the dashboard module toggle is on.
if ( function_exists( 'add_filter' ) ) {
	add_filter(
		'wfcp_storefront_active',
		static function ( $on ) {
			if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) && method_exists( 'Webino_Dashboard_Module_Registry', 'is_active' ) ) {
				return $on && Webino_Dashboard_Module_Registry::is_active( 'wfcp-module' );
			}
			return $on;
		}
	);
}
