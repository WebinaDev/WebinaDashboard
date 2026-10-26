<?php
/**
 * Pricing bridge to WFCP.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Resolve platform prices from webina-woo-core or WC fallback.
 */
class WNC_Pricing {

	const PLATFORMS = array( 'digikala', 'basalam', 'technolife', 'snappshop', 'tapsishop', 'zarehbin', 'emalls', 'snapppay-search', 'torob' );

	/**
	 * Whether WFCP is available.
	 *
	 * @return bool
	 */
	public static function wfcp_available() {
		if ( ! class_exists( 'WFCP_Calculator' ) || ! class_exists( 'WFCP_Helper' ) ) {
			return false;
		}
		// Installed but switched off (dashboard module toggle / module master switch) = not available.
		if ( class_exists( 'Webino_Dashboard_Pricing', false ) ) {
			return Webino_Dashboard_Pricing::wfcp_on();
		}
		return true;
	}

	/**
	 * Get calculated platform price for a product/variation.
	 *
	 * @param int    $product_id Product or variation ID.
	 * @param string $platform Platform slug.
	 * @return float
	 */
	public static function get_price( $product_id, $platform ) {
		$product_id = (int) $product_id;
		$platform   = sanitize_key( $platform );

		if ( ! in_array( $platform, self::PLATFORMS, true ) ) {
			return 0.0;
		}

		// Pricing module off: marketplaces get the single WooCommerce price (sale when valid).
		if ( ! self::wfcp_available() ) {
			return self::wc_active_price( $product_id );
		}

		// Manual lock override.
		$locked = get_post_meta( $product_id, '_wfcp_' . $platform . '_lock', true );
		if ( '1' === (string) $locked ) {
			$manual = get_post_meta( $product_id, '_wfcp_' . $platform . '_price', true );
			if ( '' !== $manual && null !== $manual ) {
				return floatval( $manual );
			}
		}

		if ( self::wfcp_available() ) {
			$purchase = WFCP_Helper::get_product_purchase_price( $product_id );
			if ( null === $purchase || '' === $purchase || floatval( $purchase ) <= 0 ) {
				$product = wc_get_product( $product_id );
				return $product ? floatval( $product->get_regular_price() ) : 0.0;
			}
			return floatval( WFCP_Calculator::calculate_price( floatval( $purchase ), $platform, $product_id ) );
		}

		return self::wc_active_price( $product_id );
	}

	/**
	 * WooCommerce active price (sale if set, else regular).
	 *
	 * @param int $product_id Product/variation id.
	 * @return float
	 */
	public static function wc_active_price( $product_id ) {
		if ( class_exists( 'Webino_Dashboard_Pricing', false ) ) {
			return (float) Webino_Dashboard_Pricing::active_price( (int) $product_id );
		}
		$product = function_exists( 'wc_get_product' ) ? wc_get_product( (int) $product_id ) : null;
		if ( ! $product ) {
			return 0.0;
		}
		$p = (float) $product->get_price();
		return $p > 0 ? $p : (float) $product->get_regular_price();
	}

	/**
	 * Convert price to remote unit (toman/rial) based on WFCP platform settings.
	 *
	 * @param float  $price Price in display currency (toman typically).
	 * @param string $platform Platform.
	 * @return int Integer price for API.
	 */
	public static function to_remote_unit( $price, $platform ) {
		$unit = self::price_unit( $platform );
		$value = floatval( $price );
		if ( 'rial' === $unit ) {
			$value = $value * 10;
		}
		return (int) round( $value );
	}

	/**
	 * Convert remote API price back to shop display unit (typically toman).
	 *
	 * @param float  $price Remote price.
	 * @param string $platform Platform.
	 * @return float
	 */
	public static function from_remote_unit( $price, $platform ) {
		$unit  = self::price_unit( $platform );
		$value = floatval( $price );
		if ( 'rial' === $unit && $value > 0 ) {
			$value = $value / 10;
		}
		return $value;
	}

	/**
	 * WFCP price unit for platform (default digikala=rial, others=toman).
	 *
	 * @param string $platform Platform.
	 * @return string
	 */
	public static function price_unit( $platform ) {
		$unit = ( 'digikala' === $platform ) ? 'rial' : 'toman';
		if ( self::wfcp_available() ) {
			$settings = WFCP_Helper::get_settings( $platform );
			if ( is_array( $settings ) && ! empty( $settings['price_unit'] ) ) {
				$unit = $settings['price_unit'];
			}
		}
		return $unit;
	}

	/**
	 * Stock quantity for push.
	 *
	 * @param int $product_id Product ID.
	 * @return int
	 */
	public static function get_stock_qty( $product_id ) {
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return 0;
		}
		if ( ! $product->managing_stock() ) {
			// WooCommerce convention when stock is not managed: in stock = available (1), else 0.
			return 'instock' === $product->get_stock_status() ? 1 : 0;
		}
		$qty = $product->get_stock_quantity();
		return null === $qty ? 0 : max( 0, (int) $qty );
	}
}
