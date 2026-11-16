<?php
/**
 * Item shipping cost — per-product / sets / category / brand / gateway costs,
 * aggregated per order (sum, flat-once or max).
 *
 * Master switch is OFF by default; when off this class does nothing and the
 * store behaves exactly as before.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cart-fee based item shipping cost engine for WooCommerce.
 *
 * Priority per cart line (first match wins):
 *   1. product_costs (exact product or variation id, then parent product)
 *   2. set_costs (ordered multi-product sets)
 *   3. category_costs (optionally including child categories; highest match wins)
 *   4. brand_costs (product_brand / pa_brand; highest match wins)
 *   5. default_cost (fallback for unmatched lines)
 *
 * Aggregation over contributing lines (mode setting):
 *   each — sum of line costs, multiplied by quantity when multiply_by_qty
 *   once — a single flat fee (default_cost, falling back to the max line cost)
 *   max  — the highest line cost in the cart
 *
 * Gateway rules can override the computed fee or add on top of it when the
 * matching payment gateway is selected at checkout.
 */
final class Webino_Shipping_Item_Cost {

	const OPTION       = 'webino_shipping_item_cost';
	const DEFAULT_LABEL = 'هزینه ارسال';

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_cart_calculate_fees', array( __CLASS__, 'calculate' ), 30, 1 );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'enabled'             => false,
			'mode'                => 'max',
			'fee_label'           => self::DEFAULT_LABEL,
			'multiply_by_qty'     => true,
			'virtual_skip'        => true,
			'category_children'   => true,
			'skip_with_free_coupon' => false,
			'default_cost'        => '',
			'min_free_amount'     => '',
			'product_costs'       => array(),
			'set_costs'           => array(),
			'category_costs'      => array(),
			'brand_costs'         => array(),
			'gateway_costs'       => array(),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		return self::sanitize( get_option( self::OPTION, array() ) );
	}

	/**
	 * @param mixed $input Raw input from REST.
	 * @return array<string,mixed>
	 */
	public static function update( $input ) {
		$clean = self::sanitize( $input );
		update_option( self::OPTION, $clean, false );
		return $clean;
	}

	/**
	 * @param mixed $raw Raw value.
	 * @return array<string,mixed>
	 */
	public static function sanitize( $raw ) {
		$d   = self::defaults();
		$raw = is_array( $raw ) ? $raw : array();

		$out = $d;

		$out['enabled']             = ! empty( $raw['enabled'] );
		$mode                       = isset( $raw['mode'] ) ? sanitize_key( (string) $raw['mode'] ) : 'max';
		$out['mode']                = in_array( $mode, array( 'each', 'once', 'max' ), true ) ? $mode : 'max';

		$label = isset( $raw['fee_label'] ) ? sanitize_text_field( (string) $raw['fee_label'] ) : '';
		$label = trim( function_exists( 'mb_substr' ) ? mb_substr( $label, 0, 80 ) : substr( $label, 0, 80 ) );
		$out['fee_label'] = '' !== $label ? $label : self::DEFAULT_LABEL;

		foreach ( array( 'multiply_by_qty', 'virtual_skip', 'category_children', 'skip_with_free_coupon' ) as $flag ) {
			$out[ $flag ] = isset( $raw[ $flag ] ) ? (bool) $raw[ $flag ] : $d[ $flag ];
		}

		foreach ( array( 'default_cost', 'min_free_amount' ) as $amount_key ) {
			$value = isset( $raw[ $amount_key ] ) ? trim( (string) $raw[ $amount_key ] ) : '';
			if ( '' === $value ) {
				$out[ $amount_key ] = '';
				continue;
			}
			$num = self::money( $value );
			$out[ $amount_key ] = null !== $num ? $num : '';
		}

		$out['product_costs']  = self::sanitize_cost_map( $raw['product_costs'] ?? array(), 500 );
		$out['category_costs'] = self::sanitize_cost_map( $raw['category_costs'] ?? array(), 300 );
		$out['brand_costs']    = self::sanitize_cost_map( $raw['brand_costs'] ?? array(), 300 );
		$out['set_costs']      = self::sanitize_sets( $raw['set_costs'] ?? array() );
		$out['gateway_costs']  = self::sanitize_gateways( $raw['gateway_costs'] ?? array() );

		return $out;
	}

	/**
	 * @param mixed $value Raw money value (accepts Persian/Arabic digits and thousands separators).
	 * @return float|null Null when not parseable; values are >= 0.
	 */
	private static function money( $value ) {
		$value = strtr(
			(string) $value,
			array(
				'۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
				'٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
				'٬' => '', '٫' => '.', ',' => '', ' ' => '',
			)
		);
		$value = trim( $value );
		if ( '' === $value || ! is_numeric( $value ) ) {
			return null;
		}
		$num = (float) $value;
		if ( ! is_finite( $num ) || $num < 0 ) {
			return null;
		}
		return round( $num, 2 );
	}

	/**
	 * @param mixed $map Raw map of id => cost.
	 * @param int   $limit Max entries.
	 * @return array<string,float>
	 */
	private static function sanitize_cost_map( $map, $limit ) {
		$out = array();
		if ( ! is_array( $map ) ) {
			return $out;
		}
		foreach ( $map as $key => $value ) {
			$id = absint( $key );
			if ( $id < 1 ) {
				continue;
			}
			$cost = self::money( $value );
			if ( null === $cost ) {
				continue;
			}
			$out[ (string) $id ] = $cost;
			if ( count( $out ) >= $limit ) {
				break;
			}
		}
		return $out;
	}

	/**
	 * @param mixed $sets Raw sets list.
	 * @return list<array{id:string,name:string,product_ids:list<int>,cost:float}>
	 */
	private static function sanitize_sets( $sets ) {
		$out = array();
		if ( ! is_array( $sets ) ) {
			return $out;
		}
		foreach ( $sets as $set ) {
			if ( ! is_array( $set ) ) {
				continue;
			}
			$id = sanitize_key( (string) ( $set['id'] ?? '' ) );
			if ( '' === $id ) {
				$id = 'set_' . substr( md5( wp_generate_uuid4() ), 0, 8 );
			}
			$name = sanitize_text_field( (string) ( $set['name'] ?? '' ) );
			$name = trim( function_exists( 'mb_substr' ) ? mb_substr( $name, 0, 80 ) : substr( $name, 0, 80 ) );
			$cost = self::money( $set['cost'] ?? '' );
			$cost = null !== $cost ? $cost : 0.0;

			$ids_raw   = isset( $set['product_ids'] ) && is_array( $set['product_ids'] ) ? $set['product_ids'] : array();
			$product_ids = array();
			foreach ( $ids_raw as $pid ) {
				$pid = absint( $pid );
				if ( $pid > 0 && ! in_array( $pid, $product_ids, true ) ) {
					$product_ids[] = $pid;
				}
				if ( count( $product_ids ) >= 200 ) {
					break;
				}
			}
			$out[] = array(
				'id'          => $id,
				'name'        => $name,
				'product_ids' => $product_ids,
				'cost'        => $cost,
			);
			if ( count( $out ) >= 50 ) {
				break;
			}
		}
		return $out;
	}

	/**
	 * @param mixed $rules Raw gateway rules.
	 * @return list<array{gateway:string,type:string,amount:float}>
	 */
	private static function sanitize_gateways( $rules ) {
		$out = array();
		if ( ! is_array( $rules ) ) {
			return $out;
		}
		$seen = array();
		foreach ( $rules as $rule ) {
			if ( ! is_array( $rule ) ) {
				continue;
			}
			$gateway = sanitize_key( (string) ( $rule['gateway'] ?? '' ) );
			if ( '' === $gateway || isset( $seen[ $gateway ] ) ) {
				continue;
			}
			$amount = self::money( $rule['amount'] ?? '' );
			$amount = null !== $amount ? $amount : 0.0;
			$type   = sanitize_key( (string) ( $rule['type'] ?? 'override' ) );
			$type   = in_array( $type, array( 'override', 'add' ), true ) ? $type : 'override';
			$out[]  = array(
				'gateway' => $gateway,
				'type'    => $type,
				'amount'  => $amount,
			);
			$seen[ $gateway ] = true;
			if ( count( $out ) >= 50 ) {
				break;
			}
		}
		return $out;
	}

	/**
	 * Brand taxonomy to use: product_brand first, then pa_brand (filterable).
	 *
	 * @return string
	 */
	private static function brand_taxonomy() {
		static $tax = null;
		if ( null !== $tax ) {
			return $tax;
		}
		$tax = '';
		foreach ( array( 'product_brand', 'pa_brand' ) as $candidate ) {
			if ( taxonomy_exists( $candidate ) ) {
				$tax = $candidate;
				break;
			}
		}
		/**
		 * Filter the taxonomy used for brand shipping-cost rules.
		 *
		 * @param string $tax Taxonomy name ('' when none).
		 */
		$tax = (string) apply_filters( 'webino_shipping_item_cost_brand_taxonomy', $tax );
		return $tax;
	}

	/**
	 * Configured category term ids expanded with descendants when enabled.
	 * Directly configured categories always win over inherited ones.
	 *
	 * @param array<string,mixed> $s Settings.
	 * @return array<int,float> term_id => cost
	 */
	private static function category_index( $s ) {
		$direct = array();
		foreach ( (array) $s['category_costs'] as $tid => $cost ) {
			$direct[ (int) $tid ] = (float) $cost;
		}
		$index = $direct;
		if ( ! empty( $s['category_children'] ) && $direct ) {
			foreach ( $direct as $tid => $cost ) {
				$children = get_term_children( (int) $tid, 'product_cat' );
				if ( is_wp_error( $children ) || ! is_array( $children ) ) {
					continue;
				}
				foreach ( $children as $child_id ) {
					$child_id = (int) $child_id;
					if ( isset( $direct[ $child_id ] ) ) {
						continue; // directly configured — do not override.
					}
					$index[ $child_id ] = isset( $index[ $child_id ] ) ? max( (float) $index[ $child_id ], $cost ) : $cost;
				}
			}
		}
		return $index;
	}

	/**
	 * Resolve the shipping cost for one cart line (product id is the variation when present).
	 *
	 * @param int                  $product_id Product/variation id.
	 * @param int                  $parent_id  Parent product id (variations).
	 * @param WC_Product           $product    Product object.
	 * @param array<string,mixed>  $s          Settings.
	 * @param array<int,float>     $cat_index  Category term => cost map (with children).
	 * @return float|null Null when no rule matches.
	 */
	private static function resolve_line_cost( $product_id, $parent_id, $product, $s, $cat_index ) {
		foreach ( array( $product_id, $parent_id ) as $id ) {
			$id = (int) $id;
			if ( $id > 0 && isset( $s['product_costs'][ (string) $id ] ) ) {
				return (float) $s['product_costs'][ (string) $id ];
			}
		}
		foreach ( (array) $s['set_costs'] as $set ) {
			$ids = isset( $set['product_ids'] ) ? (array) $set['product_ids'] : array();
			if ( in_array( $product_id, $ids, true ) || ( $parent_id > 0 && in_array( $parent_id, $ids, true ) ) ) {
				return (float) $set['cost'];
			}
		}
		$cat_terms = wc_get_product_term_ids( $product_id, 'product_cat' );
		if ( $parent_id > 0 ) {
			$cat_terms = array_unique( array_merge( $cat_terms, wc_get_product_term_ids( $parent_id, 'product_cat' ) ) );
		}
		$best = null;
		foreach ( (array) $cat_terms as $tid ) {
			$tid = (int) $tid;
			if ( isset( $cat_index[ $tid ] ) ) {
				$best = null === $best ? (float) $cat_index[ $tid ] : max( $best, (float) $cat_index[ $tid ] );
			}
		}
		if ( null !== $best ) {
			return $best;
		}
		$brand_tax = self::brand_taxonomy();
		if ( '' !== $brand_tax ) {
			$brand_terms = wc_get_product_term_ids( $product_id, $brand_tax );
			if ( $parent_id > 0 ) {
				$brand_terms = array_unique( array_merge( $brand_terms, wc_get_product_term_ids( $parent_id, $brand_tax ) ) );
			}
			foreach ( (array) $brand_terms as $tid ) {
				$tid = (int) $tid;
				if ( isset( $s['brand_costs'][ (string) $tid ] ) ) {
					$cost = (float) $s['brand_costs'][ (string) $tid ];
					$best = null === $best ? $cost : max( $best, $cost );
				}
			}
			if ( null !== $best ) {
				return $best;
			}
		}
		return null;
	}

	/**
	 * Whether the cart currently has a free-shipping coupon applied.
	 *
	 * @param WC_Cart $cart Cart.
	 * @return bool
	 */
	private static function has_free_shipping_coupon( $cart ) {
		$codes = array();
		if ( method_exists( $cart, 'get_applied_coupons' ) ) {
			$codes = (array) $cart->get_applied_coupons();
		}
		if ( ! $codes || ! function_exists( 'wc_get_coupon_id_by_code' ) || ! class_exists( 'WC_Coupon' ) ) {
			return false;
		}
		foreach ( $codes as $code ) {
			$coupon = new WC_Coupon( (string) $code );
			if ( $coupon && $coupon->get_id() && $coupon->get_free_shipping() ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Cart fee entry point. Never fatals: any failure silently skips the fee.
	 *
	 * @param WC_Cart $cart Cart.
	 * @return void
	 */
	public static function calculate( $cart ) {
		try {
			if ( ! $cart instanceof WC_Cart ) {
				return;
			}
			if ( function_exists( 'get_query_var' ) && get_query_var( 'webino_dashboard' ) ) {
				return; // Never run inside the /dashboard SPA.
			}
			$s = self::get();
			if ( empty( $s['enabled'] ) ) {
				return;
			}

			$default = '' !== $s['default_cost'] ? (float) $s['default_cost'] : null;

			$cat_index = self::category_index( $s );

			// Paid subtotal (before this fee, before shipping cost is irrelevant here).
			$paid_subtotal = 0.0;
			$lines         = array();
			foreach ( (array) $cart->get_cart() as $item ) {
				$product = isset( $item['data'] ) ? $item['data'] : null;
				if ( ! $product instanceof WC_Product ) {
					continue;
				}
				$line_total     = isset( $item['line_total'] ) ? (float) $item['line_total'] : 0.0; // after discounts, before this fee
				$paid_subtotal += $line_total;

				if ( ! empty( $s['virtual_skip'] ) && ( $product->is_virtual() || $product->is_downloadable() ) ) {
					continue;
				}
				$product_id = (int) $product->get_id();
				$parent_id  = (int) $product->get_parent_id();
				$qty        = max( 1, (int) ( $item['quantity'] ?? 1 ) );
				$cost       = self::resolve_line_cost( $product_id, $parent_id, $product, $s, $cat_index );
				if ( null === $cost ) {
					$cost = $default; // unmatched line falls back to the default (may stay null).
				}
				if ( null === $cost ) {
					continue;
				}
				$lines[] = array(
					'cost' => (float) $cost,
					'qty'  => $qty,
				);
			}

			// Free shipping above a paid-subtotal threshold.
			if ( '' !== $s['min_free_amount'] && (float) $s['min_free_amount'] > 0 && $paid_subtotal >= (float) $s['min_free_amount'] ) {
				return;
			}
			// Respect free-shipping coupons when the toggle is on.
			if ( ! empty( $s['skip_with_free_coupon'] ) && self::has_free_shipping_coupon( $cart ) ) {
				return;
			}

			$fee = 0.0;
			if ( $lines ) {
				switch ( $s['mode'] ) {
					case 'each':
						foreach ( $lines as $line ) {
							$fee += $line['cost'] * ( ! empty( $s['multiply_by_qty'] ) ? $line['qty'] : 1 );
						}
						break;
					case 'once':
						if ( null !== $default ) {
							$fee = $default;
						} else {
							$fee = 0.0;
							foreach ( $lines as $line ) {
								$fee = max( $fee, $line['cost'] );
							}
						}
						break;
					case 'max':
					default:
						$fee = 0.0;
						foreach ( $lines as $line ) {
							$fee = max( $fee, $line['cost'] );
						}
						break;
				}
			} elseif ( null !== $default ) {
				// Cart has lines but none matched and no default was baked in above — flat default for the order.
				$fee = $default;
			}

			// Payment-gateway rules (selected gateway at checkout).
			$method = '';
			if ( function_exists( 'WC' ) && WC()->session ) {
				$method = (string) WC()->session->get( 'chosen_payment_method', '' );
			}
			if ( '' !== $method ) {
				foreach ( (array) $s['gateway_costs'] as $rule ) {
					if ( (string) ( $rule['gateway'] ?? '' ) !== $method ) {
						continue;
					}
					$amount = (float) $rule['amount'];
					if ( 'override' === $rule['type'] ) {
						$fee = $amount;
					} else { // add
						$fee += $amount;
					}
					break;
				}
			}

			if ( $fee <= 0 ) {
				return;
			}
			$cart->add_fee( wp_strip_all_tags( (string) $s['fee_label'] ), round( $fee, 2 ), false );
		} catch ( \Throwable $e ) {
			// Never break cart/checkout because of this feature.
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG && function_exists( 'error_log' ) ) {
				error_log( '[webino-shipping-item-cost] ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return;
		}
	}

	/**
	 * Bulk term names for the admin UI.
	 *
	 * @param array<int,int> $ids Term ids.
	 * @param string         $taxonomy Taxonomy.
	 * @return array<string,string> id => name
	 */
	private static function term_names( $ids, $taxonomy ) {
		$out = array();
		$ids = array_filter( array_map( 'absint', (array) $ids ) );
		if ( ! $ids || ! taxonomy_exists( $taxonomy ) ) {
			return $out;
		}
		$terms = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'include'    => $ids,
				'hide_empty' => false,
			)
		);
		if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
			return $out;
		}
		foreach ( $terms as $term ) {
			$out[ (string) $term->term_id ] = (string) $term->name;
		}
		return $out;
	}

	/**
	 * REST: resolve display names for saved ids (products, categories, brands).
	 *
	 * @param WP_REST_Request $request Request with query params products/categories/brands (csv ids).
	 * @return WP_REST_Response
	 */
	public static function rest_names( $request ) {
		$parse = static function ( $csv ) {
			$parts = preg_split( '/[^0-9]+/', (string) $csv );
			$ids   = array();
			foreach ( (array) $parts as $part ) {
				if ( '' === $part ) {
					continue;
				}
				$ids[] = absint( $part );
				if ( count( $ids ) >= 500 ) {
					break;
				}
			}
			return array_values( array_unique( $ids ) );
		};
		$product_ids  = $parse( $request->get_param( 'products' ) );
		$category_ids = $parse( $request->get_param( 'categories' ) );
		$brand_ids    = $parse( $request->get_param( 'brands' ) );

		$products = array();
		if ( $product_ids && function_exists( 'wc_get_products' ) ) {
			foreach ( wc_get_products(
				array(
					'include' => $product_ids,
					'limit'   => count( $product_ids ),
					'status'  => array( 'publish', 'private', 'draft' ),
					'return'  => 'objects',
				)
			) as $product ) {
				$products[ (string) $product->get_id() ] = $product->get_name();
			}
		}

		$brand_tax = self::brand_taxonomy();

		return rest_ensure_response(
			array(
				'products'   => $products,
				'categories' => self::term_names( $category_ids, 'product_cat' ),
				'brands'     => '' !== $brand_tax ? self::term_names( $brand_ids, $brand_tax ) : array(),
				'brand_taxonomy' => $brand_tax,
			)
		);
	}
}
