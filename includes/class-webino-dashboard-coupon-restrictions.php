<?php
/**
 * Extra WooCommerce coupon restrictions (users, location, payment, shipping, channel, brands).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validates Webina coupon meta against cart / checkout context.
 */
class Webino_Dashboard_Coupon_Restrictions {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_coupon_is_valid', array( __CLASS__, 'validate_coupon' ), 20, 3 );
		add_filter( 'woocommerce_coupon_is_valid_for_product', array( __CLASS__, 'validate_product_brands' ), 20, 4 );
		add_action( 'woocommerce_after_checkout_validation', array( __CLASS__, 'validate_checkout' ), 20, 2 );
	}

	/**
	 * @param bool         $valid   Current validity.
	 * @param WC_Coupon    $coupon  Coupon.
	 * @param WC_Discounts $discount Discounts helper (unused).
	 * @return bool
	 * @throws Exception When invalid.
	 */
	public static function validate_coupon( $valid, $coupon, $discount = null ) {
		unset( $discount );
		if ( ! $valid || ! ( $coupon instanceof WC_Coupon ) ) {
			return $valid;
		}
		$error = self::check_restrictions( $coupon, self::build_context_from_cart() );
		if ( $error ) {
			throw new Exception( $error );
		}
		return true;
	}

	/**
	 * Brand include/exclude (stored as product_brands meta).
	 *
	 * @param bool       $valid   Valid.
	 * @param WC_Product $product Product.
	 * @param WC_Coupon  $coupon  Coupon.
	 * @param array      $values  Cart item values.
	 * @return bool
	 */
	public static function validate_product_brands( $valid, $product, $coupon, $values = array() ) {
		unset( $values );
		if ( ! $valid || ! ( $coupon instanceof WC_Coupon ) || ! ( $product instanceof WC_Product ) ) {
			return $valid;
		}
		$include = Webino_Dashboard_Coupons::get_brand_ids( $coupon->get_id() );
		$exclude = Webino_Dashboard_Coupons::get_excluded_brand_ids( $coupon->get_id() );
		if ( array() === $include && array() === $exclude ) {
			return $valid;
		}
		$product_id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();
		$brands     = array();
		if ( taxonomy_exists( 'product_brand' ) ) {
			$terms = wp_get_post_terms( $product_id, 'product_brand', array( 'fields' => 'ids' ) );
			if ( is_array( $terms ) ) {
				$brands = array_map( 'intval', $terms );
			}
		}
		if ( $include ) {
			$ok = false;
			foreach ( $include as $bid ) {
				if ( in_array( (int) $bid, $brands, true ) ) {
					$ok = true;
					break;
				}
			}
			if ( ! $ok ) {
				return false;
			}
		}
		foreach ( $exclude as $bid ) {
			if ( in_array( (int) $bid, $brands, true ) ) {
				return false;
			}
		}
		return $valid;
	}

	/**
	 * Re-check payment / shipping / address after customer chooses them.
	 *
	 * @param array    $data   Posted data.
	 * @param WP_Error $errors Errors bag.
	 * @return void
	 */
	public static function validate_checkout( $data, $errors ) {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return;
		}
		$ctx = self::build_context_from_checkout( is_array( $data ) ? $data : array() );
		foreach ( WC()->cart->get_applied_coupons() as $code ) {
			$coupon = new WC_Coupon( $code );
			if ( ! $coupon->get_id() ) {
				continue;
			}
			$error = self::check_restrictions( $coupon, $ctx );
			if ( $error && $errors instanceof WP_Error ) {
				$errors->add( 'webino_coupon_' . $coupon->get_id(), $error );
			}
		}
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function build_context_from_cart() {
		$customer_id = get_current_user_id();
		$state       = '';
		$city        = '';
		$payment     = '';
		$shipping    = array();
		$purchase    = 'cash';

		if ( function_exists( 'WC' ) && WC()->customer ) {
			$state = (string) WC()->customer->get_shipping_state();
			$city  = (string) WC()->customer->get_shipping_city();
			if ( '' === $state && '' === $city ) {
				$state = (string) WC()->customer->get_billing_state();
				$city  = (string) WC()->customer->get_billing_city();
			}
		}
		if ( function_exists( 'WC' ) && WC()->session ) {
			$payment = (string) WC()->session->get( 'chosen_payment_method' );
			$chosen  = WC()->session->get( 'chosen_shipping_methods' );
			if ( is_array( $chosen ) ) {
				$shipping = array_values( array_filter( array_map( 'strval', $chosen ) ) );
			}
		}
		if ( function_exists( 'WC' ) && WC()->cart ) {
			foreach ( WC()->cart->get_cart() as $item ) {
				if ( ! empty( $item['wfcp_purchase_type'] ) ) {
					$purchase = sanitize_key( (string) $item['wfcp_purchase_type'] );
					break;
				}
			}
		}

		return array(
			'user_id'         => (int) $customer_id,
			'state'           => $state,
			'city'            => $city,
			'payment_method'  => $payment,
			'shipping'        => $shipping,
			'purchase_type'   => $purchase,
			'channel'         => self::detect_channel(),
		);
	}

	/**
	 * @param array<string, mixed> $data Checkout posted data.
	 * @return array<string, mixed>
	 */
	private static function build_context_from_checkout( array $data ) {
		$ctx = self::build_context_from_cart();

		$ship_state = isset( $data['shipping_state'] ) ? (string) $data['shipping_state'] : '';
		$ship_city  = isset( $data['shipping_city'] ) ? (string) $data['shipping_city'] : '';
		$bill_state = isset( $data['billing_state'] ) ? (string) $data['billing_state'] : '';
		$bill_city  = isset( $data['billing_city'] ) ? (string) $data['billing_city'] : '';

		if ( '' !== $ship_state || '' !== $ship_city ) {
			$ctx['state'] = $ship_state;
			$ctx['city']  = $ship_city;
		} elseif ( '' !== $bill_state || '' !== $bill_city ) {
			$ctx['state'] = $bill_state;
			$ctx['city']  = $bill_city;
		}

		if ( ! empty( $data['payment_method'] ) ) {
			$ctx['payment_method'] = sanitize_key( (string) $data['payment_method'] );
		}
		if ( ! empty( $data['shipping_method'] ) && is_array( $data['shipping_method'] ) ) {
			$ctx['shipping'] = array_values( array_filter( array_map( 'strval', $data['shipping_method'] ) ) );
		}

		return $ctx;
	}

	/**
	 * @return string site|bale|telegram
	 */
	public static function detect_channel() {
		if ( defined( 'WEBINO_BOT_CHANNEL' ) && is_string( WEBINO_BOT_CHANNEL ) ) {
			$ch = sanitize_key( WEBINO_BOT_CHANNEL );
			if ( in_array( $ch, array( 'bale', 'telegram' ), true ) ) {
				return $ch;
			}
		}
		if ( class_exists( 'Webino_Dashboard_Bots_Rest_Context', false ) ) {
			// Bot cart contexts set provider via request meta when available.
		}
		$provider = '';
		if ( function_exists( 'WC' ) && WC()->session ) {
			$provider = (string) WC()->session->get( '_woobale_provider' );
		}
		if ( in_array( $provider, array( 'bale', 'telegram' ), true ) ) {
			return $provider;
		}
		// Detect by calling class namespace from bot modules.
		$bt = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 12 );
		foreach ( $bt as $frame ) {
			$file = isset( $frame['file'] ) ? (string) $frame['file'] : '';
			if ( false !== strpos( $file, 'bale-bot-module' ) ) {
				return 'bale';
			}
			if ( false !== strpos( $file, 'telegram-bot-module' ) ) {
				return 'telegram';
			}
		}
		return 'site';
	}

	/**
	 * @param WC_Coupon            $coupon Coupon.
	 * @param array<string, mixed> $ctx    Context.
	 * @return string Empty if ok, else error message.
	 */
	public static function check_restrictions( $coupon, array $ctx ) {
		$cid = (int) $coupon->get_id();
		$r   = Webino_Dashboard_Coupons::get_restriction_fields( $cid );

		$user_ids = $r['allowed_user_ids'];
		if ( $user_ids ) {
			$uid = (int) ( $ctx['user_id'] ?? 0 );
			if ( $uid < 1 || ! in_array( $uid, $user_ids, true ) ) {
				return __( 'این کد تخفیف فقط برای کاربران مشخص‌شده قابل استفاده است.', 'webino-dashboard' );
			}
		}

		$channels = $r['allowed_channels'];
		if ( $channels ) {
			$ch = (string) ( $ctx['channel'] ?? 'site' );
			if ( ! in_array( $ch, $channels, true ) ) {
				return __( 'این کد تخفیف برای این کانال فروش معتبر نیست.', 'webino-dashboard' );
			}
		}

		$states = $r['allowed_states'];
		if ( $states ) {
			$state = (string) ( $ctx['state'] ?? '' );
			if ( '' === $state || ! self::state_matches( $state, $states ) ) {
				// Soft-skip when address not chosen yet (cart apply before address).
				if ( '' !== $state ) {
					return __( 'این کد تخفیف برای استان انتخاب‌شده معتبر نیست.', 'webino-dashboard' );
				}
			}
		}

		$cities = $r['allowed_cities'];
		if ( $cities ) {
			$city = (string) ( $ctx['city'] ?? '' );
			if ( '' === $city || ! self::city_matches( $city, $cities ) ) {
				if ( '' !== $city ) {
					return __( 'این کد تخفیف برای شهر انتخاب‌شده معتبر نیست.', 'webino-dashboard' );
				}
			}
		}

		$payments = $r['allowed_payment_methods'];
		if ( $payments ) {
			$pm = (string) ( $ctx['payment_method'] ?? '' );
			if ( '' !== $pm && ! in_array( $pm, $payments, true ) ) {
				return __( 'این کد تخفیف برای روش پرداخت انتخاب‌شده معتبر نیست.', 'webino-dashboard' );
			}
		}

		$purchase_types = $r['allowed_purchase_types'];
		if ( $purchase_types ) {
			$pt = sanitize_key( (string) ( $ctx['purchase_type'] ?? 'cash' ) );
			if ( ! in_array( $pt, $purchase_types, true ) ) {
				return __( 'این کد تخفیف برای نوع خرید انتخاب‌شده معتبر نیست.', 'webino-dashboard' );
			}
		}

		$shipping_allowed = $r['allowed_shipping_methods'];
		if ( $shipping_allowed ) {
			$chosen = (array) ( $ctx['shipping'] ?? array() );
			if ( $chosen && ! self::shipping_matches( $chosen, $shipping_allowed ) ) {
				return __( 'این کد تخفیف برای روش ارسال انتخاب‌شده معتبر نیست.', 'webino-dashboard' );
			}
		}

		return '';
	}

	/**
	 * @param string        $state   Cart/order state value.
	 * @param array<string> $allowed Allowed ids/codes/labels.
	 * @return bool
	 */
	private static function state_matches( $state, array $allowed ) {
		$state = trim( (string) $state );
		$norm  = array_map( 'strtolower', $allowed );
		if ( in_array( strtolower( $state ), $norm, true ) ) {
			return true;
		}
		if ( taxonomy_exists( 'state_city' ) ) {
			if ( ctype_digit( $state ) ) {
				$term = get_term( (int) $state, 'state_city' );
				if ( $term instanceof WP_Term ) {
					$code = (string) get_term_meta( $term->term_id, 'state_code', true );
					if ( in_array( (string) $term->term_id, $allowed, true ) ) {
						return true;
					}
					if ( '' !== $code && in_array( $code, $allowed, true ) ) {
						return true;
					}
					if ( in_array( $term->name, $allowed, true ) ) {
						return true;
					}
				}
			}
			foreach ( $allowed as $a ) {
				if ( ctype_digit( (string) $a ) ) {
					$term = get_term( (int) $a, 'state_city' );
					if ( $term instanceof WP_Term ) {
						$code = (string) get_term_meta( $term->term_id, 'state_code', true );
						if ( strcasecmp( $state, $code ) === 0 || strcasecmp( $state, $term->name ) === 0 || (string) $term->term_id === $state ) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	/**
	 * @param string        $city    City value.
	 * @param array<string> $allowed Allowed city term ids or names.
	 * @return bool
	 */
	private static function city_matches( $city, array $allowed ) {
		$city = trim( (string) $city );
		if ( in_array( $city, $allowed, true ) ) {
			return true;
		}
		if ( taxonomy_exists( 'state_city' ) ) {
			if ( ctype_digit( $city ) && in_array( $city, $allowed, true ) ) {
				return true;
			}
			foreach ( $allowed as $a ) {
				if ( ! ctype_digit( (string) $a ) ) {
					if ( strcasecmp( $city, (string) $a ) === 0 ) {
						return true;
					}
					continue;
				}
				$term = get_term( (int) $a, 'state_city' );
				if ( $term instanceof WP_Term && ( strcasecmp( $city, $term->name ) === 0 || (string) $term->term_id === $city ) ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * @param array<string> $chosen  Chosen method instance ids (e.g. flat_rate:3).
	 * @param array<string> $allowed Allowed method ids or titles.
	 * @return bool
	 */
	private static function shipping_matches( array $chosen, array $allowed ) {
		foreach ( $chosen as $method ) {
			$method = (string) $method;
			$id     = $method;
			if ( false !== strpos( $method, ':' ) ) {
				$id = strtok( $method, ':' );
			}
			foreach ( $allowed as $a ) {
				$a = (string) $a;
				if ( $method === $a || $id === $a || false !== stripos( $method, $a ) ) {
					return true;
				}
			}
		}
		return false;
	}
}
