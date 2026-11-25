<?php
/**
 * Item shipping cost — per-product / sets / category / brand / gateway costs,
 * aggregated per order (sum, flat-once or max) and added to the shipping
 * method rates shown in the cart/checkout.
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
 * Shipping-rate based item shipping cost engine for WooCommerce.
 *
 * The computed surcharge is added to EVERY applicable shipping rate
 * (woocommerce_package_rates, priority 100 — additive, runs after the
 * module's conditional shipping rules engine at priority 90). WooCommerce
 * then charges the customer with the rate they select, so the item cost is
 * part of the shipping line — no separate fee/line is added.
 *
 * Priority per cart line (first match wins):
 *   1. product_costs (exact product or variation id, then parent product)
 *   2. set_costs (ordered multi-product sets)
 *   3. category_costs (optionally including child categories; highest match wins)
 *   4. brand_costs (product_brand / pa_brand; highest match wins)
 *   5. default_cost (fallback for unmatched lines)
 *
 * Per-unit billing: a line is charged once per unit when «multiply_by_qty» is on (or when its own
 * rule_qty_modes entry says per_qty); with it off a line with qty 5 still pays one unit price.
 *
 * Aggregation over contributing lines (mode setting):
 *   each — sum of line costs
 *   once — a single flat amount (default_cost, falling back to the max line cost)
 *   max  — the highest line cost in the cart (a per-unit line counts its whole quantity, so adding
 *          another unit of the most expensive product raises the surcharge instead of being ignored)
 *
 * The selected payment gateway (session: chosen_payment_method) can override
 * the computed amount or add on top of it. WooCommerce caches shipping rates
 * per package in the session, so when at least one gateway rule is configured
 * the module forces a shipping recalculation on checkout updates
 * (woocommerce_checkout_update_order_review) to keep the gateway-dependent
 * amount fresh.
 *
 * Rates can be excluded from the surcharge (both ON by default):
 *   skip_free_methods — zero-cost (free shipping) rates are never surcharged
 *   skip_local_pickup — local pickup rates are never surcharged
 */
final class Webino_Shipping_Item_Cost {

	const OPTION = 'webino_shipping_item_cost';

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'apply_to_rates' ), 100, 2 );
		add_filter( 'woocommerce_cart_shipping_packages', array( __CLASS__, 'tag_packages_with_settings_hash' ), 10 );
		add_action( 'woocommerce_checkout_update_order_review', array( __CLASS__, 'maybe_force_recalc' ), 5 );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'enabled'               => false,
			'mode'                  => 'max',
			'multiply_by_qty'       => true,
			'default_cost_once'     => false,
			'virtual_skip'          => true,
			'category_children'     => true,
			'skip_with_free_coupon' => false,
			'skip_free_methods'     => true,
			'skip_local_pickup'     => true,
			'default_cost'          => '',
			'min_free_amount'       => '',
			'product_costs'         => array(),
			'set_costs'             => array(),
			'category_costs'        => array(),
			'brand_costs'           => array(),
			'rule_qty_modes'        => array(
				'products'   => array(),
				'sets'       => array(),
				'categories' => array(),
				'brands'     => array(),
			),
			'gateway_costs'         => array(),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		return self::sanitize( get_option( self::OPTION, array() ) );
	}

	/**
	 * Invalidate WooCommerce shipping transient/session cache so saved rules apply immediately.
	 *
	 * @return void
	 */
	public static function bust_shipping_cache() {
		if ( class_exists( 'WC_Cache_Helper' ) && method_exists( 'WC_Cache_Helper', 'get_transient_version' ) ) {
			WC_Cache_Helper::get_transient_version( 'shipping', true );
		}
	}

	/**
	 * Tag each shipping package with a hash of current item-cost settings so WooCommerce
	 * recalculates session-cached rates immediately whenever settings change.
	 *
	 * @param array<int|string, array<string,mixed>> $packages Shipping packages.
	 * @return array<int|string, array<string,mixed>>
	 */
	public static function tag_packages_with_settings_hash( $packages ) {
		if ( ! is_array( $packages ) || ! $packages ) {
			return $packages;
		}
		$s = self::get();
		if ( empty( $s['enabled'] ) ) {
			$sig = 'off';
		} else {
			$payload = array( 's' => $s );
			if ( ! empty( $s['gateway_costs'] ) ) {
				$payload['gw'] = self::chosen_payment_method();
			}
			$sig = substr( md5( (string) wp_json_encode( $payload ) ), 0, 12 );
		}
		foreach ( $packages as $idx => $pkg ) {
			if ( is_array( $pkg ) ) {
				$packages[ $idx ]['webino_item_cost_sig'] = $sig;
			}
		}
		return $packages;
	}

	/**
	 * @param mixed $input Raw input from REST.
	 * @return array<string,mixed>
	 */
	public static function update( $input ) {
		$clean = self::sanitize( $input );
		update_option( self::OPTION, $clean, false );
		self::bust_shipping_cache();
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

		$out['enabled'] = ! empty( $raw['enabled'] );
		$mode           = isset( $raw['mode'] ) ? sanitize_key( (string) $raw['mode'] ) : 'max';
		$out['mode']    = in_array( $mode, array( 'each', 'once', 'max' ), true ) ? $mode : 'max';

		foreach ( array( 'multiply_by_qty', 'default_cost_once', 'virtual_skip', 'category_children', 'skip_with_free_coupon', 'skip_free_methods', 'skip_local_pickup' ) as $flag ) {
			$out[ $flag ] = array_key_exists( $flag, $raw ) ? (bool) $raw[ $flag ] : $d[ $flag ];
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
		$out['rule_qty_modes'] = self::sanitize_qty_modes( $raw['rule_qty_modes'] ?? array(), $out );
		$out['gateway_costs']  = self::sanitize_gateways( $raw['gateway_costs'] ?? array() );

		return $out;
	}

	/**
	 * Sanitize per-rule quantity mode overrides ('per_qty' | 'once'; 'inherit' is omitted).
	 *
	 * @param mixed               $raw Raw rule_qty_modes payload.
	 * @param array<string,mixed> $out Already-sanitized rule collections.
	 * @return array<string,array<string,string>>
	 */
	private static function sanitize_qty_modes( $raw, $out ) {
		$clean = array(
			'products'   => array(),
			'sets'       => array(),
			'categories' => array(),
			'brands'     => array(),
		);
		if ( ! is_array( $raw ) ) {
			return $clean;
		}
		$set_ids = array();
		foreach ( (array) ( $out['set_costs'] ?? array() ) as $set ) {
			if ( ! empty( $set['id'] ) ) {
				$set_ids[ (string) $set['id'] ] = true;
			}
		}
		$allowed_keys = array(
			'products'   => $out['product_costs'] ?? array(),
			'categories' => $out['category_costs'] ?? array(),
			'brands'     => $out['brand_costs'] ?? array(),
			'sets'       => $set_ids,
		);
		foreach ( $allowed_keys as $bucket => $valid_map ) {
			$src = isset( $raw[ $bucket ] ) && is_array( $raw[ $bucket ] ) ? $raw[ $bucket ] : array();
			foreach ( $src as $key => $val ) {
				$k = 'sets' === $bucket ? sanitize_key( (string) $key ) : (string) absint( $key );
				if ( '' === $k || '0' === $k || ! array_key_exists( $k, $valid_map ) ) {
					continue;
				}
				$mode = sanitize_key( (string) $val );
				if ( in_array( $mode, array( 'per_qty', 'once' ), true ) ) {
					$clean[ $bucket ][ $k ] = $mode;
				}
			}
		}
		return $clean;
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

			$ids_raw     = isset( $set['product_ids'] ) && is_array( $set['product_ids'] ) ? $set['product_ids'] : array();
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
	 * @return array<int,array{cost:float,rule_id:int}> term_id => rule info
	 */
	private static function category_index( $s ) {
		$direct = array();
		foreach ( (array) $s['category_costs'] as $tid => $cost ) {
			$tid = (int) $tid;
			if ( $tid > 0 ) {
				$direct[ $tid ] = array(
					'cost'    => (float) $cost,
					'rule_id' => $tid,
				);
			}
		}
		$index = $direct;
		if ( ! empty( $s['category_children'] ) && $direct ) {
			foreach ( $direct as $tid => $entry ) {
				$cost     = $entry['cost'];
				$children = get_term_children( (int) $tid, 'product_cat' );
				if ( is_wp_error( $children ) || ! is_array( $children ) ) {
					continue;
				}
				foreach ( $children as $child_id ) {
					$child_id = (int) $child_id;
					if ( isset( $direct[ $child_id ] ) ) {
						continue; // directly configured — do not override.
					}
					if ( ! isset( $index[ $child_id ] ) || $cost > (float) $index[ $child_id ]['cost'] ) {
						$index[ $child_id ] = array(
							'cost'    => $cost,
							'rule_id' => $tid,
						);
					}
				}
			}
		}
		return $index;
	}

	/**
	 * Resolve matching shipping cost rule for one cart line (product id is the variation when present).
	 *
	 * @param int                                       $product_id Product/variation id.
	 * @param int                                       $parent_id  Parent product id (variations).
	 * @param WC_Product                                $product    Product object.
	 * @param array<string,mixed>                       $s          Settings.
	 * @param array<int,array{cost:float,rule_id:int}>  $cat_index  Category term => rule info.
	 * @return array{cost:float,group_key:string,qty_mode:string}|null Null when no rule matches.
	 */
	private static function resolve_line_rule( $product_id, $parent_id, $product, $s, $cat_index ) {
		unset( $product ); // kept for signature symmetry / future use.
		$qty_modes = isset( $s['rule_qty_modes'] ) && is_array( $s['rule_qty_modes'] ) ? $s['rule_qty_modes'] : array();

		foreach ( array( $product_id, $parent_id ) as $id ) {
			$id = (int) $id;
			if ( $id > 0 && isset( $s['product_costs'][ (string) $id ] ) ) {
				$qm = (string) ( $qty_modes['products'][ (string) $id ] ?? 'inherit' );
				return array(
					'cost'      => (float) $s['product_costs'][ (string) $id ],
					'group_key' => 'product:' . $id,
					'qty_mode'  => in_array( $qm, array( 'per_qty', 'once' ), true ) ? $qm : 'inherit',
				);
			}
		}
		foreach ( (array) $s['set_costs'] as $set ) {
			$ids = isset( $set['product_ids'] ) ? (array) $set['product_ids'] : array();
			if ( in_array( $product_id, $ids, true ) || ( $parent_id > 0 && in_array( $parent_id, $ids, true ) ) ) {
				$sid = (string) ( $set['id'] ?? '' );
				$qm  = '' !== $sid ? (string) ( $qty_modes['sets'][ $sid ] ?? 'inherit' ) : 'inherit';
				return array(
					'cost'      => (float) $set['cost'],
					'group_key' => 'set:' . ( '' !== $sid ? $sid : md5( implode( ',', $ids ) ) ),
					'qty_mode'  => in_array( $qm, array( 'per_qty', 'once' ), true ) ? $qm : 'inherit',
				);
			}
		}
		$cat_terms = wc_get_product_term_ids( $product_id, 'product_cat' );
		if ( $parent_id > 0 ) {
			$cat_terms = array_unique( array_merge( $cat_terms, wc_get_product_term_ids( $parent_id, 'product_cat' ) ) );
		}
		$best_cat = null;
		foreach ( (array) $cat_terms as $tid ) {
			$tid = (int) $tid;
			if ( isset( $cat_index[ $tid ] ) ) {
				$entry = $cat_index[ $tid ];
				if ( null === $best_cat || (float) $entry['cost'] > (float) $best_cat['cost'] ) {
					$best_cat = $entry;
				}
			}
		}
		if ( null !== $best_cat ) {
			$rule_tid = (int) $best_cat['rule_id'];
			$qm       = (string) ( $qty_modes['categories'][ (string) $rule_tid ] ?? 'inherit' );
			return array(
				'cost'      => (float) $best_cat['cost'],
				'group_key' => 'category:' . $rule_tid,
				'qty_mode'  => in_array( $qm, array( 'per_qty', 'once' ), true ) ? $qm : 'inherit',
			);
		}
		$brand_tax = self::brand_taxonomy();
		if ( '' !== $brand_tax ) {
			$brand_terms = wc_get_product_term_ids( $product_id, $brand_tax );
			if ( $parent_id > 0 ) {
				$brand_terms = array_unique( array_merge( $brand_terms, wc_get_product_term_ids( $parent_id, $brand_tax ) ) );
			}
			$best_brand = null;
			foreach ( (array) $brand_terms as $tid ) {
				$tid = (int) $tid;
				if ( isset( $s['brand_costs'][ (string) $tid ] ) ) {
					$cost = (float) $s['brand_costs'][ (string) $tid ];
					if ( null === $best_brand || $cost > (float) $best_brand['cost'] ) {
						$best_brand = array(
							'cost'    => $cost,
							'rule_id' => $tid,
						);
					}
				}
			}
			if ( null !== $best_brand ) {
				$rule_bid = (int) $best_brand['rule_id'];
				$qm       = (string) ( $qty_modes['brands'][ (string) $rule_bid ] ?? 'inherit' );
				return array(
					'cost'      => (float) $best_brand['cost'],
					'group_key' => 'brand:' . $rule_bid,
					'qty_mode'  => in_array( $qm, array( 'per_qty', 'once' ), true ) ? $qm : 'inherit',
				);
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
	 * The payment gateway currently chosen at checkout (session), if any.
	 *
	 * @return string
	 */
	private static function chosen_payment_method() {
		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return '';
		}
		$method = WC()->session->get( 'chosen_payment_method', '' );
		return is_string( $method ) ? $method : '';
	}

	/**
	 * Compute the item-cost surcharge for the current cart/package (before gateway rules)
	 * and the gateway-adjusted effective amount.
	 *
	 * @param array<string,mixed> $s       Settings.
	 * @param array<string,mixed> $package WooCommerce shipping package.
	 * @return array{base: float, effective: float}
	 */
	private static function compute_amount( $s, $package = array() ) {
		$zero = array( 'base' => 0.0, 'effective' => 0.0 );

		$cart       = ( function_exists( 'WC' ) && WC()->cart ) ? WC()->cart : null;
		$cart_items = $cart ? (array) $cart->get_cart() : array();
		$pkg_items  = ( isset( $package['contents'] ) && is_array( $package['contents'] ) && $package['contents'] )
			? $package['contents']
			: $cart_items;

		if ( ! $pkg_items ) {
			return $zero;
		}

		$default   = '' !== $s['default_cost'] ? (float) $s['default_cost'] : null;
		$cat_index = self::category_index( $s );

		// Paid subtotal from full cart (fall back to package lines when cart unavailable).
		$paid_subtotal = 0.0;
		$subtotal_src  = $cart_items ? $cart_items : $pkg_items;
		foreach ( $subtotal_src as $item ) {
			if ( ! isset( $item['data'] ) || ! $item['data'] instanceof WC_Product ) {
				continue;
			}
			$paid_subtotal += isset( $item['line_total'] ) ? (float) $item['line_total'] : 0.0;
		}

		$had_items = false;
		$lines     = array();
		foreach ( $pkg_items as $item ) {
			$product = isset( $item['data'] ) ? $item['data'] : null;
			if ( ! $product instanceof WC_Product ) {
				continue;
			}
			$had_items = true;

			if ( ! empty( $s['virtual_skip'] ) && ( $product->is_virtual() || $product->is_downloadable() ) ) {
				continue;
			}
			$product_id = (int) $product->get_id();
			$parent_id  = (int) $product->get_parent_id();
			$qty        = max( 1, (int) ( $item['quantity'] ?? 1 ) );
			$rule       = self::resolve_line_rule( $product_id, $parent_id, $product, $s, $cat_index );
			if ( null === $rule ) {
				if ( null === $default ) {
					continue;
				}
				$rule = array(
					'cost'      => $default,
					'group_key' => 'default',
					'qty_mode'  => ! empty( $s['default_cost_once'] ) ? 'once' : 'inherit',
				);
			}
			$lines[] = array(
				'cost'      => (float) $rule['cost'],
				'qty'       => $qty,
				'group_key' => (string) $rule['group_key'],
				'qty_mode'  => (string) $rule['qty_mode'],
			);
		}

		if ( ! $had_items ) {
			return $zero;
		}

		// Per-unit pricing: a line is "per unit" when the resolved rule says so (per_qty) or, when the
		// rule inherits the global mode, when the store's «multiply by quantity» switch is on. Modes
		// «once» and «max» group lines, so they MUST bill the whole quantity of the winning group
		// instead of a single flat amount — otherwise one extra unit of a product never adds anything.
		$per_unit = array();
		foreach ( $lines as $idx => $line ) {
			if ( 'once' === $line['qty_mode'] ) {
				$per_unit[ $idx ] = false;
			} elseif ( 'per_qty' === $line['qty_mode'] ) {
				$per_unit[ $idx ] = true;
			} else {
				$per_unit[ $idx ] = ! empty( $s['multiply_by_qty'] );
			}
			$lines[ $idx ]['per_unit'] = $per_unit[ $idx ];
			$lines[ $idx ]['total']    = $line['cost'] * max( 1, (int) $line['qty'] );
		}
		$total_units = 0;
		foreach ( $lines as $line ) {
			$total_units += max( 1, (int) $line['qty'] );
		}

		// Free above a paid-subtotal threshold.
		if ( '' !== $s['min_free_amount'] && (float) $s['min_free_amount'] > 0 && $paid_subtotal >= (float) $s['min_free_amount'] ) {
			return $zero;
		}
		// Respect free-shipping coupons when the toggle is on.
		if ( ! empty( $s['skip_with_free_coupon'] ) && $cart && self::has_free_shipping_coupon( $cart ) ) {
			return $zero;
		}

		$base = 0.0;
		if ( $lines ) {
			switch ( $s['mode'] ) {
				case 'each':
					$once_groups = array();
					foreach ( $lines as $line ) {
						if ( ! empty( $line['per_unit'] ) ) {
							$base += (float) $line['total'];
							continue;
						}
						// "Once per cart" rule: the group pays a single unit price.
						$gk                 = (string) $line['group_key'];
						$once_groups[ $gk ] = isset( $once_groups[ $gk ] )
							? max( (float) $once_groups[ $gk ], $line['cost'] )
							: $line['cost'];
					}
					foreach ( $once_groups as $group_cost ) {
						$base += (float) $group_cost;
					}
					break;
				case 'once':
					// One flat amount for the whole cart (the mode's own contract) — per-unit pricing is
					// handled by «max» / «each», so a store that charges per unit is never billed twice.
					if ( null !== $default ) {
						$base = $default;
					} else {
						// Highest line wins; unit-priced lines use their full quantity total.
						$base = 0.0;
						foreach ( $lines as $line ) {
							$value = ! empty( $line['per_unit'] ) ? (float) $line['total'] : (float) $line['cost'];
							$base  = max( $base, $value );
						}
					}
					break;
				case 'max':
				default:
					// Highest line wins. A unit-priced line counts its whole quantity here, so adding
					// another unit of the most expensive product raises the surcharge by one unit cost.
					$base = 0.0;
					foreach ( $lines as $line ) {
						$value = ! empty( $line['per_unit'] ) ? (float) $line['total'] : (float) $line['cost'];
						$base  = max( $base, $value );
					}
					break;
			}
		} elseif ( null !== $default ) {
			// Cart has lines but every line was skipped (e.g. all virtual/downloadable): flat default for the order.
			$base = $default;
		}
		$base = round( max( 0.0, $base ), 2 );

		// Payment-gateway rule (selected gateway at checkout).
		$effective = $base;
		$method    = self::chosen_payment_method();
		if ( '' !== $method ) {
			foreach ( (array) $s['gateway_costs'] as $rule ) {
				if ( (string) ( $rule['gateway'] ?? '' ) !== $method ) {
					continue;
				}
				$amount = (float) $rule['amount'];
				if ( 'override' === $rule['type'] ) {
					$effective = $amount; // replaces the item cost entirely.
				} else { // add
					$effective = $base + $amount;
				}
				break;
			}
		}

		return array(
			'base'      => $base,
			'effective' => round( max( 0.0, $effective ), 2 ),
		);
	}

	/**
	 * Filter every shipping rate for the package; additive surcharge baked into
	 * the cost (and pro-rated into the rate's taxes when the rate is taxed).
	 *
	 * @param array<string, WC_Shipping_Rate> $rates   Rates.
	 * @param array<string, mixed>            $package Package.
	 * @return array<string, WC_Shipping_Rate>
	 */
	public static function apply_to_rates( $rates, $package ) {
		if ( ! is_array( $rates ) || ! $rates ) {
			return $rates;
		}
		try {
			if ( isset( $GLOBALS['wp_query'] ) && $GLOBALS['wp_query'] instanceof WP_Query && function_exists( 'get_query_var' ) && get_query_var( 'webino_dashboard' ) ) {
				return $rates; // Never inside the /dashboard SPA.
			}
			$s = self::get();
			if ( empty( $s['enabled'] ) ) {
				return $rates;
			}

			$amounts = self::compute_amount( $s, is_array( $package ) ? $package : array() );
			if ( $amounts['effective'] <= 0 ) {
				return $rates;
			}
			$add = $amounts['effective'];

			foreach ( $rates as $key => $rate ) {
				if ( ! is_a( $rate, 'WC_Shipping_Rate' ) ) {
					continue;
				}
				$method_id = (string) $rate->get_method_id();
				$rate_id   = (string) $rate->get_id();
				$is_pickup = ( 'local_pickup' === $method_id ) || ( 0 === strpos( $rate_id, 'local_pickup' ) );
				if ( ! empty( $s['skip_local_pickup'] ) && $is_pickup ) {
					continue;
				}
				$base_cost = (float) $rate->get_cost();
				if ( ! empty( $s['skip_free_methods'] ) && abs( $base_cost ) < 0.0001 ) {
					continue; // zero-cost (free shipping) rate — keep free.
				}
				$new_cost = round( $base_cost + $add, 2 );

				$taxes = $rate->get_taxes();
				if ( is_array( $taxes ) && $taxes && $base_cost > 0 ) {
					$factor = $new_cost / $base_cost;
					foreach ( $taxes as $tax_key => $tax_amount ) {
						if ( is_numeric( $tax_amount ) ) {
							$taxes[ $tax_key ] = round( ( (float) $tax_amount ) * $factor, 2 );
						}
					}
					$rate->set_taxes( $taxes );
				}
				$rate->set_cost( $new_cost );
				$rates[ $key ] = $rate;
			}
			return $rates;
		} catch ( \Throwable $e ) {
			// Never break shipping calculation because of this feature.
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG && function_exists( 'error_log' ) ) {
				error_log( '[webino-shipping-item-cost] ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
			return $rates;
		}
	}

	/**
	 * WooCommerce caches shipping rates per package in the session. When at
	 * least one gateway rule is configured, force a shipping recalculation on
	 * checkout updates so a payment-gateway switch is reflected immediately
	 * (including the gateway-dependent amount). No-op otherwise.
	 */
	public static function maybe_force_recalc() {
		static $running = false;
		if ( $running ) {
			return;
		}
		try {
			$s = self::get();
			if ( empty( $s['enabled'] ) || empty( $s['gateway_costs'] ) ) {
				return;
			}
			if ( ! function_exists( 'WC' ) || ! WC()->cart || ! method_exists( WC()->cart, 'calculate_shipping' ) ) {
				return;
			}
			$running = true;
			WC()->cart->calculate_shipping();
			$running = false;
		} catch ( \Throwable $e ) {
			$running = false;
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG && function_exists( 'error_log' ) ) {
				error_log( '[webino-shipping-item-cost] ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
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
