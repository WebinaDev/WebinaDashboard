<?php
/**
 * Offer coupon engine: templates, eligibility, auto-apply, storefront API.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Basalam-inspired offer coupons on top of WC shop_coupon.
 */
final class Webino_Dashboard_Offer_Engine {

	const META_CONDITION_TYPE  = '_webino_offer_condition_type';
	const META_CONDITION_VALUE = '_webino_offer_condition_value';
	const META_AUTO_APPLY      = '_webino_offer_auto_apply';
	const META_VISIBLE         = '_webino_offer_visible';
	const META_PUBLIC          = '_webino_offer_public';
	const META_MAX_DISCOUNT    = '_webino_offer_max_discount';
	const META_TEMPLATE_ID     = '_webino_offer_template_id';
	const META_GIFT_COPY       = '_webino_offer_gift_copy';
	const META_SHIPPING_PCT    = '_webino_offer_shipping_percent';
	const META_IS_OFFER        = '_webino_offer_builder';

	const NEAR_RATIO = 0.8;

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		add_action( 'woocommerce_after_calculate_totals', array( __CLASS__, 'maybe_auto_apply' ), 20 );
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'filter_shipping_rates' ), 100, 2 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_storefront' ), 30 );
	}

	/**
	 * Suggested coupon templates (amounts in store minor units / decimal as WC expects).
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function templates() {
		return array(
			array(
				'id'              => 'min_50k_1m',
				'title'           => '۵۰,۰۰۰ تومان تخفیف',
				'condition_label' => 'با خرید ۱,۰۰۰,۰۰۰ تومان از فروشگاه',
				'icon'            => 'coins',
				'type'            => 'fixed_cart',
				'amount'          => '50000',
				'condition_type'  => 'min_amount',
				'condition_value' => '1000000',
				'free_shipping'   => false,
				'shipping_percent'=> null,
				'max_discount'    => null,
			),
			array(
				'id'              => 'min_100k_1_5m',
				'title'           => '۱۰۰,۰۰۰ تومان تخفیف',
				'condition_label' => 'با خرید ۱,۵۰۰,۰۰۰ تومان از فروشگاه',
				'icon'            => 'coins',
				'type'            => 'fixed_cart',
				'amount'          => '100000',
				'condition_type'  => 'min_amount',
				'condition_value' => '1500000',
				'free_shipping'   => false,
				'shipping_percent'=> null,
				'max_discount'    => null,
			),
			array(
				'id'              => 'min_150k_2m',
				'title'           => '۱۵۰,۰۰۰ تومان تخفیف',
				'condition_label' => 'با خرید ۲,۰۰۰,۰۰۰ تومان از فروشگاه',
				'icon'            => 'coins',
				'type'            => 'fixed_cart',
				'amount'          => '150000',
				'condition_type'  => 'min_amount',
				'condition_value' => '2000000',
				'free_shipping'   => false,
				'shipping_percent'=> null,
				'max_discount'    => null,
			),
			array(
				'id'              => 'pct5_2items',
				'title'           => '۵٪ تخفیف',
				'condition_label' => 'با خرید ۲ محصول از فروشگاه',
				'icon'            => 'percent',
				'type'            => 'percent',
				'amount'          => '5',
				'condition_type'  => 'min_items',
				'condition_value' => '2',
				'free_shipping'   => false,
				'shipping_percent'=> null,
				'max_discount'    => '1000000',
			),
			array(
				'id'              => 'pct10_3items',
				'title'           => '۱۰٪ تخفیف',
				'condition_label' => 'با خرید ۳ محصول از فروشگاه',
				'icon'            => 'percent',
				'type'            => 'percent',
				'amount'          => '10',
				'condition_type'  => 'min_items',
				'condition_value' => '3',
				'free_shipping'   => false,
				'shipping_percent'=> null,
				'max_discount'    => '1000000',
			),
			array(
				'id'              => 'ship50_800k',
				'title'           => '۵۰٪ تخفیف ارسال',
				'condition_label' => 'با خرید ۸۰۰,۰۰۰ تومان از فروشگاه',
				'icon'            => 'truck',
				'type'            => 'fixed_cart',
				'amount'          => '0',
				'condition_type'  => 'min_amount',
				'condition_value' => '800000',
				'free_shipping'   => false,
				'shipping_percent'=> 50,
				'max_discount'    => null,
			),
			array(
				'id'              => 'freeship_order1',
				'title'           => 'ارسال رایگان',
				'condition_label' => 'برای سفارش اول از فروشگاه',
				'icon'            => 'truck',
				'type'            => 'fixed_cart',
				'amount'          => '0',
				'condition_type'  => 'order_nth',
				'condition_value' => '1',
				'free_shipping'   => true,
				'shipping_percent'=> null,
				'max_discount'    => null,
			),
			array(
				'id'              => 'pct15_order2',
				'title'           => '۱۵٪ تخفیف',
				'condition_label' => 'برای سفارش دوم از فروشگاه',
				'icon'            => 'percent',
				'type'            => 'percent',
				'amount'          => '15',
				'condition_type'  => 'order_nth',
				'condition_value' => '2',
				'free_shipping'   => false,
				'shipping_percent'=> null,
				'max_discount'    => '1000000',
			),
			array(
				'id'              => 'pct10_order3',
				'title'           => '۱۰٪ تخفیف',
				'condition_label' => 'برای سفارش سوم از فروشگاه',
				'icon'            => 'percent',
				'type'            => 'percent',
				'amount'          => '10',
				'condition_type'  => 'order_nth',
				'condition_value' => '3',
				'free_shipping'   => false,
				'shipping_percent'=> null,
				'max_discount'    => '1000000',
			),
		);
	}

	/**
	 * @param int $coupon_id Coupon ID.
	 * @return array<string, mixed>
	 */
	public static function get_offer_fields( $coupon_id ) {
		$coupon_id = (int) $coupon_id;
		$ctype     = (string) get_post_meta( $coupon_id, self::META_CONDITION_TYPE, true );
		$ship_pct  = get_post_meta( $coupon_id, self::META_SHIPPING_PCT, true );
		return array(
			'is_offer'           => (bool) get_post_meta( $coupon_id, self::META_IS_OFFER, true ),
			'condition_type'     => in_array( $ctype, array( 'order_nth', 'min_amount', 'min_items' ), true ) ? $ctype : '',
			'condition_value'    => (string) get_post_meta( $coupon_id, self::META_CONDITION_VALUE, true ),
			'auto_apply'         => (bool) get_post_meta( $coupon_id, self::META_AUTO_APPLY, true ),
			'offer_visible'      => (bool) get_post_meta( $coupon_id, self::META_VISIBLE, true ),
			'offer_public'       => (bool) get_post_meta( $coupon_id, self::META_PUBLIC, true ),
			'max_discount'       => (string) get_post_meta( $coupon_id, self::META_MAX_DISCOUNT, true ),
			'template_id'        => (string) get_post_meta( $coupon_id, self::META_TEMPLATE_ID, true ),
			'gift_copy'          => (string) get_post_meta( $coupon_id, self::META_GIFT_COPY, true ),
			'shipping_percent'   => '' !== (string) $ship_pct && null !== $ship_pct ? (float) $ship_pct : null,
		);
	}

	/**
	 * @param int             $coupon_id Coupon ID.
	 * @param WP_REST_Request $request   Request.
	 * @return void
	 */
	public static function apply_offer_fields( $coupon_id, $request ) {
		$coupon_id = (int) $coupon_id;
		if ( null !== $request->get_param( 'is_offer' ) || null !== $request->get_param( 'condition_type' ) ) {
			update_post_meta( $coupon_id, self::META_IS_OFFER, 1 );
		}
		if ( null !== $request->get_param( 'condition_type' ) ) {
			$t = sanitize_key( (string) $request->get_param( 'condition_type' ) );
			if ( in_array( $t, array( 'order_nth', 'min_amount', 'min_items', '' ), true ) ) {
				update_post_meta( $coupon_id, self::META_CONDITION_TYPE, $t );
			}
		}
		if ( null !== $request->get_param( 'condition_value' ) ) {
			update_post_meta( $coupon_id, self::META_CONDITION_VALUE, wc_format_decimal( (string) $request->get_param( 'condition_value' ) ) );
		}
		foreach ( array(
			'auto_apply'    => self::META_AUTO_APPLY,
			'offer_visible' => self::META_VISIBLE,
			'offer_public'  => self::META_PUBLIC,
		) as $param => $meta ) {
			if ( null !== $request->get_param( $param ) ) {
				update_post_meta( $coupon_id, $meta, $request->get_param( $param ) ? 1 : 0 );
			}
		}
		if ( null !== $request->get_param( 'max_discount' ) ) {
			update_post_meta( $coupon_id, self::META_MAX_DISCOUNT, wc_format_decimal( (string) $request->get_param( 'max_discount' ) ) );
		}
		if ( null !== $request->get_param( 'template_id' ) ) {
			update_post_meta( $coupon_id, self::META_TEMPLATE_ID, sanitize_key( (string) $request->get_param( 'template_id' ) ) );
		}
		if ( null !== $request->get_param( 'gift_copy' ) ) {
			update_post_meta( $coupon_id, self::META_GIFT_COPY, sanitize_textarea_field( (string) $request->get_param( 'gift_copy' ) ) );
		}
		if ( null !== $request->get_param( 'shipping_percent' ) ) {
			$p = $request->get_param( 'shipping_percent' );
			if ( null === $p || '' === $p ) {
				delete_post_meta( $coupon_id, self::META_SHIPPING_PCT );
			} else {
				update_post_meta( $coupon_id, self::META_SHIPPING_PCT, max( 0, min( 100, (float) $p ) ) );
			}
		}

		$ctype = (string) get_post_meta( $coupon_id, self::META_CONDITION_TYPE, true );
		$cval  = (string) get_post_meta( $coupon_id, self::META_CONDITION_VALUE, true );
		if ( 'min_amount' === $ctype && '' !== $cval && class_exists( 'WC_Coupon' ) ) {
			$c = new WC_Coupon( $coupon_id );
			if ( $c->get_id() ) {
				$c->set_minimum_amount( $cval );
				$c->set_individual_use( true );
				$c->save();
			}
		}
		if ( get_post_meta( $coupon_id, self::META_IS_OFFER, true ) && class_exists( 'WC_Coupon' ) ) {
			$c = new WC_Coupon( $coupon_id );
			if ( $c->get_id() && ! $c->get_individual_use() ) {
				$c->set_individual_use( true );
				$c->save();
			}
		}
	}

	/**
	 * @param string $template_id Template id.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_from_template( $template_id ) {
		if ( ! class_exists( 'WC_Coupon' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$template_id = sanitize_key( (string) $template_id );
		$tpl         = null;
		foreach ( self::templates() as $t ) {
			if ( $t['id'] === $template_id ) {
				$tpl = $t;
				break;
			}
		}
		if ( ! $tpl ) {
			return new WP_Error( 'not_found', __( 'Template not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$existing = self::find_by_template( $template_id );
		if ( $existing ) {
			return new WP_REST_Response(
				array(
					'already' => true,
					'coupon'  => Webino_Dashboard_Coupons::map_detail( new WC_Coupon( $existing ) ),
				),
				200
			);
		}

		$code = strtoupper( wp_generate_password( 8, false, false ) );
		$c    = new WC_Coupon();
		$c->set_code( $code );
		$c->set_discount_type( $tpl['type'] );
		$c->set_amount( (string) $tpl['amount'] );
		$c->set_description( $tpl['title'] . ' — ' . $tpl['condition_label'] );
		$c->set_individual_use( true );
		$c->set_free_shipping( ! empty( $tpl['free_shipping'] ) );
		if ( 'min_amount' === $tpl['condition_type'] ) {
			$c->set_minimum_amount( (string) $tpl['condition_value'] );
		}
		$c->save();
		$id = $c->get_id();

		update_post_meta( $id, self::META_IS_OFFER, 1 );
		update_post_meta( $id, self::META_CONDITION_TYPE, $tpl['condition_type'] );
		update_post_meta( $id, self::META_CONDITION_VALUE, (string) $tpl['condition_value'] );
		update_post_meta( $id, self::META_AUTO_APPLY, 1 );
		update_post_meta( $id, self::META_VISIBLE, 1 );
		update_post_meta( $id, self::META_PUBLIC, 1 );
		update_post_meta( $id, self::META_TEMPLATE_ID, $template_id );
		if ( ! empty( $tpl['max_discount'] ) ) {
			update_post_meta( $id, self::META_MAX_DISCOUNT, (string) $tpl['max_discount'] );
			$c2 = new WC_Coupon( $id );
			$c2->set_maximum_amount( (string) $tpl['max_discount'] );
			$c2->save();
		}
		if ( null !== $tpl['shipping_percent'] ) {
			update_post_meta( $id, self::META_SHIPPING_PCT, (float) $tpl['shipping_percent'] );
		}

		return new WP_REST_Response(
			array(
				'already' => false,
				'coupon'  => Webino_Dashboard_Coupons::map_detail( new WC_Coupon( $id ) ),
			),
			201
		);
	}

	/**
	 * @param string $template_id Template.
	 * @return int 0 if none.
	 */
	public static function find_by_template( $template_id ) {
		$q = new WP_Query(
			array(
				'post_type'      => 'shop_coupon',
				'post_status'    => array( 'publish', 'draft', 'private' ),
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_query'     => array(
					array(
						'key'   => self::META_TEMPLATE_ID,
						'value' => sanitize_key( $template_id ),
					),
				),
			)
		);
		return ! empty( $q->posts[0] ) ? (int) $q->posts[0] : 0;
	}

	/**
	 * @return array<int, WC_Coupon>
	 */
	public static function list_offer_coupons() {
		$q = new WP_Query(
			array(
				'post_type'      => 'shop_coupon',
				'post_status'    => array( 'publish' ),
				'posts_per_page' => 100,
				'meta_query'     => array(
					array(
						'key'   => self::META_IS_OFFER,
						'value' => '1',
					),
				),
			)
		);
		$out = array();
		foreach ( $q->posts as $p ) {
			$c = new WC_Coupon( $p->ID );
			if ( $c->get_id() ) {
				$out[] = $c;
			}
		}
		return $out;
	}

	/**
	 * Customer completed order count (for Nth-order offers).
	 *
	 * @return int Next order index (1-based).
	 */
	public static function next_order_index() {
		$user_id = get_current_user_id();
		if ( ! $user_id || ! function_exists( 'wc_get_customer_order_count' ) ) {
			return 1;
		}
		return (int) wc_get_customer_order_count( $user_id ) + 1;
	}

	/**
	 * @param WC_Coupon $c Coupon.
	 * @return array{eligible:bool,progress:array<string,mixed>|null,title:string,condition_label:string}
	 */
	public static function evaluate_coupon( $c ) {
		$id     = $c->get_id();
		$fields = self::get_offer_fields( $id );
		$title  = $c->get_description() ? $c->get_description() : $c->get_code();
		$parts  = explode( ' — ', $title, 2 );
		$headline = $parts[0];
		$cond_lbl = isset( $parts[1] ) ? $parts[1] : '';

		$cart_total = 0.0;
		$cart_qty   = 0;
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$cart_total = (float) WC()->cart->get_subtotal();
			$cart_qty   = (int) WC()->cart->get_cart_contents_count();
		}

		$ctype = $fields['condition_type'];
		$cval  = (float) $fields['condition_value'];
		$progress = null;
		$eligible = false;

		if ( 'min_amount' === $ctype ) {
			$target = max( 0.01, $cval );
			$ratio  = min( 1, $cart_total / $target );
			$progress = array(
				'kind'      => 'amount',
				'current'   => $cart_total,
				'target'    => $target,
				'remaining' => max( 0, $target - $cart_total ),
				'ratio'     => round( $ratio, 4 ),
			);
			$eligible = $cart_total >= $target;
		} elseif ( 'min_items' === $ctype ) {
			$target = max( 1, (int) $cval );
			$ratio  = min( 1, $cart_qty / $target );
			$progress = array(
				'kind'      => 'items',
				'current'   => $cart_qty,
				'target'    => $target,
				'remaining' => max( 0, $target - $cart_qty ),
				'ratio'     => round( $ratio, 4 ),
			);
			$eligible = $cart_qty >= $target;
		} elseif ( 'order_nth' === $ctype ) {
			$nth  = max( 1, (int) $cval );
			$next = self::next_order_index();
			$progress = array(
				'kind'      => 'order_nth',
				'current'   => $next,
				'target'    => $nth,
				'remaining' => max( 0, $nth - $next ),
				'ratio'     => $next === $nth ? 1 : ( $next > $nth ? 0 : round( $next / $nth, 4 ) ),
			);
			$eligible = ( $next === $nth );
		} else {
			// No offer condition — treat as classic coupon; not auto-offer.
			$eligible = false;
		}

		return array(
			'eligible'         => $eligible,
			'progress'         => $progress,
			'title'            => $headline,
			'condition_label'  => $cond_lbl,
			'fields'           => $fields,
		);
	}

	/**
	 * Estimate discount value for ranking (higher is better).
	 *
	 * @param WC_Coupon $c Coupon.
	 * @return float
	 */
	public static function estimate_saving( $c ) {
		$fields = self::get_offer_fields( $c->get_id() );
		$cart   = function_exists( 'WC' ) && WC()->cart ? (float) WC()->cart->get_subtotal() : 0;
		if ( ! empty( $fields['shipping_percent'] ) ) {
			return 50000 * ( (float) $fields['shipping_percent'] / 100 );
		}
		if ( $c->get_free_shipping() ) {
			return 75000;
		}
		$type = $c->get_discount_type();
		$amt  = (float) $c->get_amount();
		if ( 'percent' === $type ) {
			$save = $cart * ( $amt / 100 );
			$max  = (float) $fields['max_discount'];
			if ( $max > 0 ) {
				$save = min( $save, $max );
			}
			return $save;
		}
		return $amt;
	}

	/**
	 * Public payload for storefront.
	 *
	 * @return array<string,mixed>
	 */
	public static function eligible_payload() {
		$offers   = array();
		$near     = null;
		$gift     = null;
		$best_el  = null;
		$best_save = -1;

		foreach ( self::list_offer_coupons() as $c ) {
			$fields = self::get_offer_fields( $c->get_id() );
			if ( empty( $fields['offer_visible'] ) && empty( $fields['offer_public'] ) ) {
				continue;
			}
			$ev = self::evaluate_coupon( $c );
			$row = array(
				'id'               => $c->get_id(),
				'code'             => $c->get_code(),
				'type'             => $c->get_discount_type(),
				'amount'           => $c->get_amount(),
				'free_shipping'    => $c->get_free_shipping(),
				'title'            => $ev['title'],
				'condition_label'  => $ev['condition_label'],
				'eligible'         => $ev['eligible'],
				'progress'         => $ev['progress'],
				'auto_apply'       => ! empty( $fields['auto_apply'] ),
				'shipping_percent' => $fields['shipping_percent'],
				'max_discount'     => $fields['max_discount'],
				'condition_type'   => $fields['condition_type'],
				'condition_value'  => $fields['condition_value'],
				'gift_copy'        => $fields['gift_copy'],
			);
			$offers[] = $row;

			if ( $ev['eligible'] && ! empty( $fields['auto_apply'] ) ) {
				$save = self::estimate_saving( $c );
				if ( $save > $best_save ) {
					$best_save = $save;
					$best_el   = $row;
				}
			}

			if ( ! $ev['eligible'] && $ev['progress'] && (float) $ev['progress']['ratio'] >= self::NEAR_RATIO ) {
				if ( ! $near || (float) $ev['progress']['ratio'] > (float) $near['progress']['ratio'] ) {
					$near = $row;
				}
			}

			// Gift popup: prefer best upcoming min_amount offer.
			if ( 'min_amount' === $fields['condition_type'] && $ev['progress'] ) {
				if ( ! $gift || (float) $c->get_amount() > (float) ( $gift['amount'] ?? 0 ) ) {
					$gift = $row;
				}
			}
		}

		return array(
			'currency'       => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRT',
			'currency_symbol'=> function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol() : 'تومان',
			'offers'         => $offers,
			'best_eligible'  => $best_el,
			'near'           => $near,
			'gift'           => $gift,
			'shop_url'       => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ),
		);
	}

	/**
	 * Auto-apply best eligible offer coupon.
	 *
	 * @return void
	 */
	public static function maybe_auto_apply() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart || ( is_admin() && ! defined( 'DOING_AJAX' ) ) ) {
			return;
		}
		if ( did_action( 'woocommerce_applied_coupon' ) > 2 ) {
			// Avoid loops.
		}
		static $running = false;
		if ( $running ) {
			return;
		}
		$running = true;

		$payload = self::eligible_payload();
		$best    = $payload['best_eligible'];
		if ( ! $best || empty( $best['code'] ) || empty( $best['auto_apply'] ) ) {
			$running = false;
			return;
		}

		$applied = WC()->cart->get_applied_coupons();
		$code    = wc_format_coupon_code( $best['code'] );
		if ( in_array( $code, array_map( 'wc_format_coupon_code', $applied ), true ) ) {
			$running = false;
			return;
		}

		// Respect individual_use: remove other coupons if needed.
		foreach ( $applied as $existing ) {
			WC()->cart->remove_coupon( $existing );
		}
		WC()->cart->apply_coupon( $code );
		$running = false;
	}

	/**
	 * Apply shipping percent when offer coupon with shipping_percent is applied.
	 *
	 * @param array $rates   Rates.
	 * @param array $package Package.
	 * @return array
	 */
	public static function filter_shipping_rates( $rates, $package ) {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return $rates;
		}
		$pct = 0.0;
		foreach ( WC()->cart->get_applied_coupons() as $code ) {
			$c = new WC_Coupon( $code );
			$f = self::get_offer_fields( $c->get_id() );
			if ( ! empty( $f['shipping_percent'] ) ) {
				$pct = max( $pct, (float) $f['shipping_percent'] );
			}
		}
		if ( $pct <= 0 || $pct > 100 ) {
			return $rates;
		}
		foreach ( $rates as $rate_id => $rate ) {
			if ( ! is_object( $rate ) || ! method_exists( $rate, 'get_cost' ) ) {
				continue;
			}
			$cost = (float) $rate->get_cost();
			$new  = max( 0, $cost * ( 1 - ( $pct / 100 ) ) );
			$rate->set_cost( $new );
			$taxes = $rate->get_taxes();
			if ( is_array( $taxes ) ) {
				$scaled = array();
				foreach ( $taxes as $k => $tax ) {
					$scaled[ $k ] = (float) $tax * ( 1 - ( $pct / 100 ) );
				}
				$rate->set_taxes( $scaled );
			}
			$rates[ $rate_id ] = $rate;
		}
		return $rates;
	}

	/**
	 * @return void
	 */
	public static function enqueue_storefront() {
		if ( is_admin() || ! function_exists( 'is_woocommerce' ) ) {
			return;
		}
		if ( ! ( is_woocommerce() || is_cart() || is_checkout() || is_front_page() || is_shop() || is_product() ) ) {
			return;
		}
		$base = defined( 'WEBINO_DASHBOARD_URL' ) ? WEBINO_DASHBOARD_URL : plugins_url( '', WEBINO_DASHBOARD_FILE );
		$ver  = defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '1';
		wp_enqueue_style(
			'webino-offers',
			$base . 'assets/offers/webino-offers.css',
			array(),
			$ver
		);
		wp_enqueue_script(
			'webino-offers',
			$base . 'assets/offers/webino-offers.js',
			array(),
			$ver,
			true
		);
		$rest = esc_url_raw( rest_url( 'webino-dashboard/v1/marketing/offers/eligible' ) );
		wp_localize_script(
			'webino-offers',
			'webinoOffers',
			array(
				'restUrl'   => $rest,
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'isRtl'     => is_rtl(),
				'i18n'      => array(
					'copy'       => 'کپی کد',
					'copied'     => 'کپی شد',
					'giftTitle'  => 'برای خریدت هدیه داری',
					'giftHint'   => 'فقط کافیه سبدت به مبلغ هدف برسه',
					'cta'        => 'پرفروش‌ترین‌ها',
					'close'      => 'بستن',
					'remaining'  => 'تا فعال شدن کوپن',
				),
			)
		);
	}

	/**
	 * REST: templates list for admin.
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_templates() {
		$owned = array();
		foreach ( self::templates() as $t ) {
			$owned[ $t['id'] ] = (bool) self::find_by_template( $t['id'] );
		}
		return new WP_REST_Response(
			array(
				'items' => self::templates(),
				'owned' => $owned,
			)
		);
	}

	/**
	 * REST: owned offer coupons for builder grid.
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_owned_offers() {
		$items = array();
		foreach ( self::list_offer_coupons() as $c ) {
			$row = Webino_Dashboard_Coupons::map_detail( $c );
			$ev  = self::evaluate_coupon( $c );
			$row['title']           = $ev['title'];
			$row['condition_label'] = $ev['condition_label'];
			$items[]                = $row;
		}
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	/**
	 * Public eligible offers.
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_eligible() {
		return new WP_REST_Response( self::eligible_payload() );
	}
}
