<?php
/**
 * Front-end WooCommerce price alignment with WFCP retail (unit) price.
 *
 * @package    WFCP
 * @subpackage WFCP/includes
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Overrides catalog/cart-facing prices when purchase price is set and not locked.
 */
class WFCP_Storefront_Price {

	/**
	 * When true, cart totals owns prices — do not override get_price.
	 *
	 * @var bool
	 */
	private static $suspend = false;

	/**
	 * Suspend storefront filters (used during before_calculate_totals).
	 *
	 * @param bool $on Suspend on/off.
	 */
	public static function suspend( $on = true ) {
		self::$suspend = (bool) $on;
	}

	/**
	 * Register WooCommerce price filters.
	 */
	public static function init() {
		add_filter( 'woocommerce_product_get_price', array( __CLASS__, 'filter_price' ), 99, 2 );
		add_filter( 'woocommerce_product_variation_get_price', array( __CLASS__, 'filter_price' ), 99, 2 );
		add_filter( 'woocommerce_product_get_regular_price', array( __CLASS__, 'filter_regular_price' ), 99, 2 );
		add_filter( 'woocommerce_product_variation_get_regular_price', array( __CLASS__, 'filter_regular_price' ), 99, 2 );
	}

	/**
	 * @param string     $price   Price from meta.
	 * @param WC_Product $product Product object.
	 * @return string
	 */
	public static function filter_regular_price( $price, $product ) {
		if ( ! self::should_apply( $product ) ) {
			return $price;
		}

		$display = self::get_display_price_for_product( $product );
		if ( null === $display ) {
			return $price;
		}

		return wc_format_decimal( $display );
	}

	/**
	 * @param string     $price   Price from meta.
	 * @param WC_Product $product Product object.
	 * @return string
	 */
	public static function filter_price( $price, $product ) {
		if ( ! self::should_apply( $product ) ) {
			return $price;
		}

		$display = self::get_display_price_for_product( $product );
		if ( null === $display ) {
			return $price;
		}

		if ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::hide_retail_ui() ) {
			return wc_format_decimal( $display );
		}

		$sale = $product->get_sale_price( 'edit' );
		if ( '' !== $sale && null !== $sale && is_numeric( $sale ) ) {
			$sale_f = (float) $sale;
			// Ignore zero/garbage leftover sales; only honor real discounts close to retail.
			if ( $sale_f > 0 && $sale_f < $display && $sale_f >= ( $display * 0.05 ) ) {
				return wc_format_decimal( $sale_f );
			}
		}

		return wc_format_decimal( $display );
	}

	/**
	 * @param WC_Product $product Product or variation.
	 * @return bool
	 */
	private static function should_apply( $product ) {
		if ( self::$suspend ) {
			return false;
		}

		if ( ! $product instanceof WC_Product ) {
			return false;
		}

		if ( ! WFCP_Helper::is_enabled() ) {
			return false;
		}

		if ( wp_doing_cron() ) {
			return false;
		}

		// Cart/checkout pages: line prices come from before_calculate_totals.
		if ( ( function_exists( 'is_cart' ) && is_cart() )
			|| ( function_exists( 'is_checkout' ) && is_checkout() ) ) {
			return false;
		}

		// Only skip on WC checkout AJAX endpoints that recalculate totals.
		$wc_ajax = isset( $_REQUEST['wc-ajax'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['wc-ajax'] ) ) : '';
		if ( in_array( $wc_ajax, array( 'update_order_review', 'checkout' ), true ) ) {
			return false;
		}

		if ( is_admin() ) {
			if ( ! defined( 'DOING_AJAX' ) || ! DOING_AJAX ) {
				return false;
			}
			$action = isset( $_REQUEST['action'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['action'] ) ) : '';
			// Skip WFCP admin AJAX and WC product-editor variation AJAX.
			if ( '' !== $action && 0 === strncmp( $action, 'wfcp_', 5 ) ) {
				return false;
			}
			$admin_wc_actions = array(
				'woocommerce_load_variations',
				'woocommerce_save_variations',
				'woocommerce_add_variation',
				'woocommerce_remove_variations',
				'woocommerce_link_all_variations',
				'woocommerce_bulk_edit_variations',
			);
			if ( in_array( $action, $admin_wc_actions, true ) ) {
				return false;
			}
		}

		$product_id = (int) $product->get_id();
		$parent_id  = (int) $product->get_parent_id();

		if ( self::is_locked_for_display( $product_id, $parent_id ) ) {
			return false;
		}

		$purchase = self::resolve_purchase_for_display( $product_id, $parent_id );
		if ( null === $purchase || $purchase <= 0 ) {
			return false;
		}

		$types = array( 'simple', 'external', 'variation' );
		if ( ! in_array( $product->get_type(), $types, true ) ) {
			return false;
		}

		return true;
	}

	/**
	 * @param int $product_id Product or variation ID.
	 * @param int $parent_id  Parent ID for variations.
	 * @return bool
	 */
	private static function is_locked_for_display( $product_id, $parent_id ) {
		if ( WFCP_Helper::is_product_price_locked( $product_id ) ) {
			return true;
		}
		if ( $parent_id > 0 && WFCP_Helper::is_product_price_locked( $parent_id ) ) {
			return true;
		}
		return false;
	}

	/**
	 * @param int $product_id Product or variation ID.
	 * @param int $parent_id  Parent ID for variations.
	 * @return float|null
	 */
	private static function resolve_purchase_for_display( $product_id, $parent_id ) {
		$own = WFCP_Helper::get_product_purchase_price( $product_id );
		if ( null !== $own && $own > 0 ) {
			return (float) $own;
		}
		if ( $parent_id > 0 ) {
			$parent_purchase = WFCP_Helper::get_product_purchase_price( $parent_id );
			if ( null !== $parent_purchase && $parent_purchase > 0 ) {
				return (float) $parent_purchase;
			}
		}
		return null;
	}

	/**
	 * Catalog price: wholesale for partners, otherwise retail.
	 *
	 * @param WC_Product $product Product or variation.
	 * @return float|null
	 */
	private static function get_display_price_for_product( $product ) {
		$product_id = (int) $product->get_id();
		$parent_id  = (int) $product->get_parent_id();
		$purchase   = self::resolve_purchase_for_display( $product_id, $parent_id );
		if ( null === $purchase ) {
			return null;
		}
		$calc_id = $parent_id > 0 ? $parent_id : $product_id;
		$type    = 'retail';
		if ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::is_partner_shopping() ) {
			$type = 'wholesale';
		}
		return (float) WFCP_Calculator::calculate_price( $purchase, $type, $product_id > 0 ? $product_id : $calc_id );
	}

	/**
	 * @param WC_Product $product Product or variation.
	 * @return float|null
	 */
	private static function get_retail_for_product( $product ) {
		$product_id = (int) $product->get_id();
		$parent_id  = (int) $product->get_parent_id();
		$purchase   = self::resolve_purchase_for_display( $product_id, $parent_id );
		if ( null === $purchase ) {
			return null;
		}
		$calc_id = $parent_id > 0 ? $parent_id : $product_id;
		return (float) WFCP_Calculator::calculate_price( $purchase, 'retail', $calc_id );
	}
}
