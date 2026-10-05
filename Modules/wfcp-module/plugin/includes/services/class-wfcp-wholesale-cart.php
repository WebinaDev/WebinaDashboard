<?php
/**
 * Wholesale cart lock, min qty/weight/variety, quantity inputs, shipping.
 *
 * @package    WFCP
 * @subpackage WFCP/includes/services
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Enforce partner wholesale purchase rules and threshold line types.
 */
class WFCP_Wholesale_Cart {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_add_to_cart_validation', array( __CLASS__, 'validate_add_to_cart' ), 20, 5 );
		add_action( 'woocommerce_check_cart_items', array( __CLASS__, 'check_cart_items' ), 20 );
		add_filter( 'woocommerce_quantity_input_args', array( __CLASS__, 'quantity_input_args' ), 20, 2 );
		add_filter( 'woocommerce_available_variation', array( __CLASS__, 'available_variation' ), 20, 3 );
		add_action( 'woocommerce_before_calculate_totals', array( __CLASS__, 'apply_threshold_line_types' ), 4 );
		add_action( 'woocommerce_before_calculate_totals', array( __CLASS__, 'lock_partner_cart_type' ), 5 );
		add_filter( 'woocommerce_is_purchasable', array( __CLASS__, 'is_purchasable' ), 20, 2 );
		add_filter( 'woocommerce_variation_is_purchasable', array( __CLASS__, 'is_purchasable' ), 20, 2 );
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'filter_package_rates' ), 25, 2 );
	}

	/**
	 * Stamp wholesale on regular-customer lines that hit qty/weight mins.
	 *
	 * @param WC_Cart $cart Cart.
	 * @return void
	 */
	public static function apply_threshold_line_types( $cart ) {
		if ( ! $cart instanceof WC_Cart ) {
			return;
		}
		if ( ! class_exists( 'WFCP_Wholesale_Partner', false ) || ! WFCP_Wholesale_Partner::threshold_enabled() ) {
			return;
		}
		if ( WFCP_Wholesale_Partner::is_partner_shopping() ) {
			return;
		}

		foreach ( $cart->get_cart() as $key => $item ) {
			$pid   = isset( $item['product_id'] ) ? (int) $item['product_id'] : 0;
			$vid   = isset( $item['variation_id'] ) ? (int) $item['variation_id'] : 0;
			$qty   = isset( $item['quantity'] ) ? (float) $item['quantity'] : 0;
			$rules = WFCP_Wholesale_Rules::for_product( $pid, $vid );
			$type  = isset( $item['wfcp_purchase_type'] ) ? sanitize_text_field( (string) $item['wfcp_purchase_type'] ) : 'cash';
			if ( 'retail' === $type ) {
				$type = 'cash';
			}

			if ( WFCP_Wholesale_Rules::line_meets_threshold( $rules, $qty, $pid, $vid ) ) {
				if ( 'wholesale' !== $type ) {
					$cart->cart_contents[ $key ]['wfcp_retail_type'] = $type;
				}
				$cart->cart_contents[ $key ]['wfcp_purchase_type'] = 'wholesale';
				unset( $cart->cart_contents[ $key ]['wfcp_installment_months'], $cart->cart_contents[ $key ]['wfcp_installment_total'] );
				continue;
			}

			if ( 'wholesale' === $type ) {
				$restore = isset( $item['wfcp_retail_type'] ) ? sanitize_text_field( (string) $item['wfcp_retail_type'] ) : 'cash';
				if ( ! in_array( $restore, array( 'cash', 'credit', 'installment' ), true ) ) {
					$restore = 'cash';
				}
				$cart->cart_contents[ $key ]['wfcp_purchase_type'] = $restore;
			}
		}
	}

	/**
	 * Force wholesale on partner carts.
	 *
	 * @param WC_Cart $cart Cart.
	 * @return void
	 */
	public static function lock_partner_cart_type( $cart ) {
		if ( ! WFCP_Wholesale_Partner::is_partner_shopping() ) {
			return;
		}
		if ( ! $cart instanceof WC_Cart ) {
			return;
		}
		foreach ( $cart->get_cart() as $key => $item ) {
			$cart->cart_contents[ $key ]['wfcp_purchase_type'] = 'wholesale';
			unset( $cart->cart_contents[ $key ]['wfcp_installment_months'], $cart->cart_contents[ $key ]['wfcp_installment_total'] );
		}
		if ( function_exists( 'WC' ) && WC()->session ) {
			WC()->session->set( 'wfcp_purchase_type', 'wholesale' );
		}
	}

	/**
	 * @param bool  $passed        Current result.
	 * @param int   $product_id    Product ID.
	 * @param int   $quantity      Qty.
	 * @param int   $variation_id  Variation.
	 * @param array $variations    Attrs.
	 * @return bool
	 */
	public static function validate_add_to_cart( $passed, $product_id, $quantity, $variation_id = 0, $variations = array() ) {
		unset( $variations );
		if ( ! $passed || ! WFCP_Wholesale_Partner::is_partner_shopping() ) {
			return $passed;
		}

		$product_id   = (int) $product_id;
		$variation_id = (int) $variation_id;
		$quantity     = (float) $quantity;
		$rules        = WFCP_Wholesale_Rules::for_product( $product_id, $variation_id );

		if ( empty( $rules['wholesale_enabled'] ) ) {
			wc_add_notice( __( 'این محصول برای فروش عمده در دسترس نیست.', 'webina-woo-core' ), 'error' );
			return false;
		}

		if ( 'weight' === $rules['sell_by'] && WFCP_Wholesale_Rules::product_weight( $product_id, $variation_id ) <= 0 ) {
			wc_add_notice( __( 'وزن محصول برای فروش عمده ثبت نشده است.', 'webina-woo-core' ), 'error' );
			return false;
		}

		$error = self::line_error( $rules, $quantity, $product_id, $variation_id );
		if ( $error ) {
			wc_add_notice( $error, 'error' );
			return false;
		}

		return $passed;
	}

	/**
	 * Checkout / cart page validation (partners only).
	 *
	 * @return void
	 */
	public static function check_cart_items() {
		if ( ! WFCP_Wholesale_Partner::is_partner_shopping() ) {
			return;
		}
		if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
			return;
		}

		$skus = array();
		foreach ( WC()->cart->get_cart() as $item ) {
			$pid   = isset( $item['product_id'] ) ? (int) $item['product_id'] : 0;
			$vid   = isset( $item['variation_id'] ) ? (int) $item['variation_id'] : 0;
			$qty   = isset( $item['quantity'] ) ? (float) $item['quantity'] : 0;
			$rules = WFCP_Wholesale_Rules::for_product( $pid, $vid );
			$err   = self::line_error( $rules, $qty, $pid, $vid );
			if ( $err ) {
				wc_add_notice( $err, 'error' );
			}
			$skus[ $vid > 0 ? $vid : $pid ] = true;
		}

		$need = (int) WFCP_Wholesale_Rules::global_defaults()['min_distinct_skus'];
		if ( $need > 0 && count( $skus ) < $need ) {
			wc_add_notice(
				sprintf(
					/* translators: 1: current distinct SKUs, 2: required */
					__( 'سبد عمده باید حداقل %2$d قلم متفاوت داشته باشد (الان %1$d قلم).', 'webina-woo-core' ),
					count( $skus ),
					$need
				),
				'error'
			);
		}

		self::check_category_variety();
	}

	/**
	 * Per-category distinct SKU requirements.
	 *
	 * @return void
	 */
	private static function check_category_variety() {
		$rules = WFCP_Helper::get_settings( 'wholesale', 'category_variety_rules' );
		if ( ! is_array( $rules ) || empty( $rules ) ) {
			return;
		}

		$by_cat = array();
		foreach ( WC()->cart->get_cart() as $item ) {
			$pid   = isset( $item['product_id'] ) ? (int) $item['product_id'] : 0;
			$vid   = isset( $item['variation_id'] ) ? (int) $item['variation_id'] : 0;
			$sku   = $vid > 0 ? $vid : $pid;
			$terms = wp_get_post_terms( $pid, 'product_cat', array( 'fields' => 'ids' ) );
			if ( is_wp_error( $terms ) ) {
				continue;
			}
			foreach ( (array) $terms as $tid ) {
				$tid = (int) $tid;
				if ( ! isset( $by_cat[ $tid ] ) ) {
					$by_cat[ $tid ] = array();
				}
				$by_cat[ $tid ][ $sku ] = true;
			}
		}

		foreach ( $rules as $cat_id => $need ) {
			$cat_id = (int) $cat_id;
			$need   = (int) $need;
			if ( $need <= 0 || empty( $by_cat[ $cat_id ] ) ) {
				continue;
			}
			$have = count( $by_cat[ $cat_id ] );
			if ( $have >= $need ) {
				continue;
			}
			$term = get_term( $cat_id, 'product_cat' );
			$name = ( $term && ! is_wp_error( $term ) ) ? $term->name : '#' . $cat_id;
			wc_add_notice(
				sprintf(
					/* translators: 1: category name, 2: have, 3: need */
					__( 'از دسته «%1$s» حداقل %3$d قلم متفاوت لازم است (الان %2$d قلم).', 'webina-woo-core' ),
					$name,
					$have,
					$need
				),
				'error'
			);
		}
	}

	/**
	 * @param array $rules Rules.
	 * @param float $qty Qty.
	 * @param int   $product_id Product.
	 * @param int   $variation_id Variation.
	 * @return string Empty if ok.
	 */
	private static function line_error( $rules, $qty, $product_id, $variation_id ) {
		$product = wc_get_product( $variation_id > 0 ? $variation_id : $product_id );
		$name    = $product ? $product->get_name() : '#' . $product_id;

		if ( $qty <= 0 ) {
			return sprintf(
				/* translators: %s: product name */
				__( 'تعداد «%s» نامعتبر است.', 'webina-woo-core' ),
				$name
			);
		}

		$min_qty = (float) $rules['min_qty'];
		if ( $min_qty > 0 && $qty + 0.0001 < $min_qty ) {
			return sprintf(
				/* translators: 1: product name, 2: min qty */
				__( 'حداقل تعداد عمده برای «%1$s» برابر %2$s است.', 'webina-woo-core' ),
				$name,
				wc_format_decimal( $min_qty )
			);
		}

		$step = (float) $rules['qty_step'];
		if ( $step > 0 && ! WFCP_Wholesale_Rules::qty_matches_step( $qty, $step ) ) {
			return sprintf(
				/* translators: 1: product name, 2: step */
				__( 'تعداد «%1$s» باید مضرب %2$s باشد.', 'webina-woo-core' ),
				$name,
				wc_format_decimal( $step )
			);
		}

		$min_w = (float) $rules['min_weight'];
		if ( $min_w > 0 ) {
			$line_w = WFCP_Wholesale_Rules::line_weight( $rules, $qty, $product_id, $variation_id );
			if ( $line_w + 0.0001 < $min_w ) {
				$unit = function_exists( 'get_option' ) ? (string) get_option( 'woocommerce_weight_unit', 'kg' ) : 'kg';
				return sprintf(
					/* translators: 1: product name, 2: min weight, 3: unit */
					__( 'حداقل وزن عمده برای «%1$s» برابر %2$s %3$s است.', 'webina-woo-core' ),
					$name,
					wc_format_decimal( $min_w ),
					$unit
				);
			}
		}

		return '';
	}

	/**
	 * Min/step on quantity field for partners.
	 *
	 * @param array      $args    Args.
	 * @param WC_Product $product Product.
	 * @return array
	 */
	public static function quantity_input_args( $args, $product ) {
		if ( ! WFCP_Wholesale_Partner::is_partner_shopping() || ! $product instanceof WC_Product ) {
			return $args;
		}
		$parent = $product->get_parent_id() ? (int) $product->get_parent_id() : (int) $product->get_id();
		$vid    = $product->is_type( 'variation' ) ? (int) $product->get_id() : 0;
		$rules  = WFCP_Wholesale_Rules::for_product( $parent, $vid );
		$min    = (float) $rules['min_qty'];
		if ( isset( $rules['sell_by'] ) && 'weight' === $rules['sell_by'] && (float) $rules['min_weight'] > 0 ) {
			$min = max( $min, (float) $rules['min_weight'] );
		}
		$step = (float) $rules['qty_step'];
		if ( $min > 0 ) {
			$args['min_value'] = $min;
			if ( empty( $args['input_value'] ) || (float) $args['input_value'] < $min ) {
				$args['input_value'] = $min;
			}
		}
		if ( $step > 0 ) {
			$args['step'] = $step;
		}
		return $args;
	}

	/**
	 * Partners cannot buy weight-sold products without a WC weight.
	 *
	 * @param bool       $purchasable Current.
	 * @param WC_Product $product     Product.
	 * @return bool
	 */
	public static function is_purchasable( $purchasable, $product ) {
		if ( ! $purchasable || ! $product instanceof WC_Product ) {
			return $purchasable;
		}
		if ( ! WFCP_Wholesale_Partner::is_partner_shopping() ) {
			return $purchasable;
		}
		$parent = $product->get_parent_id() ? (int) $product->get_parent_id() : (int) $product->get_id();
		$vid    = $product->is_type( 'variation' ) ? (int) $product->get_id() : 0;
		$rules  = WFCP_Wholesale_Rules::for_product( $parent, $vid );
		if ( empty( $rules['wholesale_enabled'] ) ) {
			return false;
		}
		if ( 'weight' === $rules['sell_by'] && WFCP_Wholesale_Rules::product_weight( $parent, $vid ) <= 0 ) {
			return false;
		}
		return $purchasable;
	}

	/**
	 * Variation JSON for wholesale qty constraints.
	 *
	 * @param array      $data Data.
	 * @param WC_Product $product Parent.
	 * @param WC_Product $variation Variation.
	 * @return array
	 */
	public static function available_variation( $data, $product, $variation ) {
		if ( ! WFCP_Wholesale_Partner::current_sees_wholesale() || ! $variation instanceof WC_Product ) {
			return $data;
		}
		$parent = $product instanceof WC_Product ? (int) $product->get_id() : (int) $variation->get_parent_id();
		$rules  = WFCP_Wholesale_Rules::for_product( $parent, (int) $variation->get_id() );
		$data['wfcp_wholesale'] = array(
			'min_qty'    => $rules['min_qty'],
			'min_weight' => $rules['min_weight'],
			'qty_step'   => $rules['qty_step'],
			'sell_by'    => $rules['sell_by'],
		);
		return $data;
	}

	/**
	 * Limit shipping methods when the cart has wholesale lines.
	 *
	 * @param array<string,WC_Shipping_Rate> $rates    Rates.
	 * @param array<string,mixed>            $package  Package.
	 * @return array<string,WC_Shipping_Rate>
	 */
	public static function filter_package_rates( $rates, $package ) {
		unset( $package );
		if ( ! is_array( $rates ) || empty( $rates ) ) {
			return $rates;
		}
		if ( ! class_exists( 'WFCP_Cart_Manager', false ) || ! WFCP_Cart_Manager::cart_has_wholesale() ) {
			return $rates;
		}
		$allowed = WFCP_Helper::get_settings( 'wholesale', 'shipping_methods' );
		$allowed = class_exists( 'WFCP_Gateway_Manager', false )
			? WFCP_Gateway_Manager::normalize_gateway_ids( $allowed )
			: ( is_array( $allowed ) ? array_values( array_map( 'sanitize_text_field', $allowed ) ) : array() );
		if ( empty( $allowed ) ) {
			return $rates;
		}

		$filtered = array();
		foreach ( $rates as $rate_id => $rate ) {
			$candidates = array( (string) $rate_id );
			if ( is_object( $rate ) ) {
				if ( method_exists( $rate, 'get_method_id' ) ) {
					$candidates[] = (string) $rate->get_method_id();
				}
				if ( method_exists( $rate, 'get_id' ) ) {
					$candidates[] = (string) $rate->get_id();
				}
				if ( isset( $rate->method_id ) ) {
					$candidates[] = (string) $rate->method_id;
				}
			}
			$keep = false;
			foreach ( $candidates as $cand ) {
				if ( '' === $cand ) {
					continue;
				}
				if ( in_array( $cand, $allowed, true ) ) {
					$keep = true;
					break;
				}
				$base = strpos( $cand, ':' ) !== false ? strstr( $cand, ':', true ) : $cand;
				if ( $base && in_array( $base, $allowed, true ) ) {
					$keep = true;
					break;
				}
			}
			if ( $keep ) {
				$filtered[ $rate_id ] = $rate;
			}
		}

		return $filtered;
	}
}
