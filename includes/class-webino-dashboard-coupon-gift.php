<?php
/**
 * Gift coupon type: reach cart amount N and receive product X free.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers webino_gift discount type and manages free gift cart lines.
 */
final class Webino_Dashboard_Coupon_Gift {

	const TYPE     = 'webino_gift';
	const META     = '_webino_gift_product_id';
	const CART_KEY = 'webino_gift';

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_coupon_discount_types', array( __CLASS__, 'register_type' ) );
		add_filter( 'woocommerce_coupon_get_discount_amount', array( __CLASS__, 'zero_discount' ), 10, 5 );
		add_action( 'woocommerce_before_calculate_totals', array( __CLASS__, 'sync_gift_items' ), 20 );
		add_action( 'woocommerce_before_cart', array( __CLASS__, 'cart_notices' ), 5 );
		add_action( 'woocommerce_before_checkout_form', array( __CLASS__, 'cart_notices' ), 5 );
		add_filter( 'woocommerce_get_item_data', array( __CLASS__, 'item_data' ), 10, 2 );
		add_action( 'woocommerce_checkout_create_order_line_item', array( __CLASS__, 'order_line_meta' ), 10, 4 );
	}

	/**
	 * @param array<string,string> $types Types.
	 * @return array<string,string>
	 */
	public static function register_type( $types ) {
		$types[ self::TYPE ] = __( 'هدیه', 'webino-dashboard' );
		return $types;
	}

	/**
	 * Gift coupons do not reduce line prices; the gift product is free instead.
	 *
	 * @param float     $discount Discount.
	 * @param float     $discounting_amount Amount.
	 * @param object    $cart_item Cart item.
	 * @param bool      $single Single.
	 * @param WC_Coupon $coupon Coupon.
	 * @return float
	 */
	public static function zero_discount( $discount, $discounting_amount, $cart_item, $single, $coupon ) {
		if ( $coupon instanceof WC_Coupon && self::TYPE === $coupon->get_discount_type() ) {
			return 0.0;
		}
		return $discount;
	}

	/**
	 * @param int $coupon_id Coupon ID.
	 * @return int
	 */
	public static function get_gift_product_id( $coupon_id ) {
		return (int) get_post_meta( (int) $coupon_id, self::META, true );
	}

	/**
	 * @param int $coupon_id Coupon ID.
	 * @param int $product_id Product ID.
	 * @return void
	 */
	public static function set_gift_product_id( $coupon_id, $product_id ) {
		$product_id = (int) $product_id;
		if ( $product_id > 0 ) {
			update_post_meta( (int) $coupon_id, self::META, $product_id );
		} else {
			delete_post_meta( (int) $coupon_id, self::META );
		}
	}

	/**
	 * Active gift coupons that are applied on the cart (or auto-eligible).
	 *
	 * @return list<array{coupon:WC_Coupon,product_id:int,min:float,product_name:string}>
	 */
	public static function applied_gifts() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return array();
		}
		$out = array();
		foreach ( WC()->cart->get_applied_coupons() as $code ) {
			$coupon = new WC_Coupon( $code );
			if ( ! $coupon->get_id() || self::TYPE !== $coupon->get_discount_type() ) {
				continue;
			}
			$pid = self::get_gift_product_id( $coupon->get_id() );
			if ( $pid < 1 ) {
				continue;
			}
			$product = wc_get_product( $pid );
			$out[]   = array(
				'coupon'       => $coupon,
				'product_id'   => $pid,
				'min'          => (float) $coupon->get_minimum_amount(),
				'product_name' => $product ? $product->get_name() : ( '#' . $pid ),
			);
		}
		return $out;
	}

	/**
	 * Cart subtotal excluding gift lines (so threshold is based on paid items).
	 *
	 * @return float
	 */
	private static function paid_subtotal() {
		if ( ! WC()->cart ) {
			return 0.0;
		}
		$total = 0.0;
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( ! empty( $item[ self::CART_KEY ] ) ) {
				continue;
			}
			$qty     = isset( $item['quantity'] ) ? (float) $item['quantity'] : 1.0;
			$product = isset( $item['data'] ) ? $item['data'] : null;
			if ( $product && is_object( $product ) && method_exists( $product, 'get_price' ) ) {
				$total += (float) $product->get_price() * $qty;
				continue;
			}
			$total += isset( $item['line_subtotal'] ) ? (float) $item['line_subtotal'] : 0.0;
		}
		return $total;
	}

	/**
	 * Published gift coupons marked visible in storefront (even before apply).
	 *
	 * @return list<array{coupon:WC_Coupon,product_id:int,min:float,product_name:string}>
	 */
	public static function visible_gifts() {
		$q = new WP_Query(
			array(
				'post_type'      => 'shop_coupon',
				'post_status'    => 'publish',
				'posts_per_page' => 20,
				'fields'         => 'ids',
				'meta_query'     => array(
					array(
						'key'   => 'discount_type',
						'value' => self::TYPE,
					),
				),
			)
		);
		$out = array();
		foreach ( $q->posts as $id ) {
			$coupon = new WC_Coupon( (int) $id );
			if ( ! $coupon->get_id() || self::TYPE !== $coupon->get_discount_type() ) {
				continue;
			}
			$visible = get_post_meta( $coupon->get_id(), '_webino_offer_visible', true );
			if ( '1' !== (string) $visible && true !== $visible && 1 !== $visible ) {
				continue;
			}
			$pid = self::get_gift_product_id( $coupon->get_id() );
			if ( $pid < 1 ) {
				continue;
			}
			$product = wc_get_product( $pid );
			$out[]   = array(
				'coupon'       => $coupon,
				'product_id'   => $pid,
				'min'          => (float) $coupon->get_minimum_amount(),
				'product_name' => $product ? $product->get_name() : ( '#' . $pid ),
			);
		}
		return $out;
	}

	/**
	 * @param WC_Cart $cart Cart.
	 * @return void
	 */
	public static function sync_gift_items( $cart ) {
		if ( ( is_admin() && ! defined( 'DOING_AJAX' ) ) || ! $cart ) {
			return;
		}
		static $busy = false;
		if ( $busy ) {
			return;
		}
		$busy = true;

		$gifts    = self::applied_gifts();
		$wanted   = array();
		$subtotal = self::paid_subtotal();
		foreach ( $gifts as $gift ) {
			if ( $gift['min'] > 0 && $subtotal + 0.0001 < $gift['min'] ) {
				continue;
			}
			$wanted[ $gift['product_id'] ] = $gift;
		}

		foreach ( $cart->get_cart() as $key => $item ) {
			if ( empty( $item[ self::CART_KEY ] ) ) {
				continue;
			}
			$pid = isset( $item['product_id'] ) ? (int) $item['product_id'] : 0;
			if ( ! isset( $wanted[ $pid ] ) ) {
				$cart->remove_cart_item( $key );
			} else {
				if ( isset( $cart->cart_contents[ $key ]['data'] ) && is_object( $cart->cart_contents[ $key ]['data'] ) ) {
					$cart->cart_contents[ $key ]['data']->set_price( 0 );
				}
				unset( $wanted[ $pid ] );
			}
		}

		foreach ( $wanted as $gift ) {
			$product = wc_get_product( $gift['product_id'] );
			if ( ! $product || ! $product->is_purchasable() ) {
				continue;
			}
			$cart->add_to_cart(
				$gift['product_id'],
				1,
				0,
				array(),
				array(
					self::CART_KEY        => 1,
					'webino_gift_coupon'  => $gift['coupon']->get_code(),
					'unique_key'          => 'gift-' . $gift['coupon']->get_id() . '-' . $gift['product_id'],
				)
			);
		}

		foreach ( $cart->get_cart() as $key => $item ) {
			if ( empty( $item[ self::CART_KEY ] ) ) {
				continue;
			}
			if ( isset( $cart->cart_contents[ $key ]['data'] ) && is_object( $cart->cart_contents[ $key ]['data'] ) ) {
				$cart->cart_contents[ $key ]['data']->set_price( 0 );
			}
		}

		$busy = false;
	}

	/**
	 * @return void
	 */
	public static function cart_notices() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return;
		}
		// Never echo during AJAX (cart fragments) or REST — stray output breaks those responses.
		if ( ( function_exists( 'wp_doing_ajax' ) && wp_doing_ajax() )
			|| ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}
		static $printed = array();
		$subtotal = self::paid_subtotal();
		$shown    = array();
		$candidates = array_merge( self::applied_gifts(), self::visible_gifts() );
		foreach ( $candidates as $gift ) {
			$key = $gift['product_id'] . ':' . $gift['coupon']->get_id();
			if ( isset( $shown[ $key ] ) ) {
				continue;
			}
			$shown[ $key ] = true;
			$min  = $gift['min'];
			$name = $gift['product_name'];
			$applied = false;
			foreach ( WC()->cart->get_applied_coupons() as $code ) {
				if ( strtolower( (string) $code ) === strtolower( $gift['coupon']->get_code() ) ) {
					$applied = true;
					break;
				}
			}
			if ( $min > 0 && $subtotal + 0.0001 < $min ) {
				$remaining = max( 0, $min - $subtotal );
				$msg       = sprintf(
					/* translators: 1: remaining amount formatted, 2: product name */
					__( 'سبد خریدتون رو به مبلغ %1$s برسونید «%2$s» رو هدیه بگیرید.', 'webino-dashboard' ),
					wp_strip_all_tags( wc_price( $min ) ),
					$name
				);
				if ( $remaining > 0 && $remaining < $min ) {
					$msg .= ' ' . sprintf(
						/* translators: %s: remaining */
						__( '(حدود %s مانده)', 'webino-dashboard' ),
						wp_strip_all_tags( wc_price( $remaining ) )
					);
				}
				$hash = md5( $msg );
				if ( isset( $printed[ $hash ] ) ) {
					continue;
				}
				$printed[ $hash ] = true;
				wc_print_notice( $msg, 'notice' );
			} elseif ( $applied ) {
				$msg = sprintf(
					/* translators: %s: product name */
					__( 'محصول هدیه «%s» به سبد اضافه شد.', 'webino-dashboard' ),
					$name
				);
				$hash = md5( $msg );
				if ( isset( $printed[ $hash ] ) ) {
					continue;
				}
				$printed[ $hash ] = true;
				wc_print_notice( $msg, 'success' );
			}
		}
	}

	/**
	 * @param array $item_data Item data.
	 * @param array $cart_item Cart item.
	 * @return array
	 */
	public static function item_data( $item_data, $cart_item ) {
		if ( ! empty( $cart_item[ self::CART_KEY ] ) ) {
			$item_data[] = array(
				'key'   => __( 'هدیه', 'webino-dashboard' ),
				'value' => __( 'رایگان با کوپن هدیه', 'webino-dashboard' ),
			);
		}
		return $item_data;
	}

	/**
	 * @param WC_Order_Item_Product $item Item.
	 * @param string                $cart_item_key Key.
	 * @param array                 $values Values.
	 * @param WC_Order              $order Order.
	 * @return void
	 */
	public static function order_line_meta( $item, $cart_item_key, $values, $order ) {
		if ( ! empty( $values[ self::CART_KEY ] ) ) {
			$item->add_meta_data( __( 'هدیه', 'webino-dashboard' ), __( 'رایگان', 'webino-dashboard' ), true );
			if ( ! empty( $values['webino_gift_coupon'] ) ) {
				$item->add_meta_data( '_webino_gift_coupon', (string) $values['webino_gift_coupon'], true );
			}
		}
	}
}
