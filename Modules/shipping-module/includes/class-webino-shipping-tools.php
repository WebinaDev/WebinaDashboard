<?php
/**
 * Shared transport tools (hide rates, default weights, Pro UX, statuses).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option-backed tools used by packaging, Tapin rates, and checkout.
 */
class Webino_Shipping_Tools {

	const OPTION = 'webino_shipping_tools';

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'filter_package_rates' ), 100, 2 );
		add_filter( 'woocommerce_cart_shipping_method_full_label', array( __CLASS__, 'method_image_label' ), 20, 2 );
		add_filter( 'woocommerce_checkout_fields', array( __CLASS__, 'checkout_fields' ), 50 );
		add_filter( 'default_checkout_billing_country', array( __CLASS__, 'maybe_force_ir' ), 20 );
		add_filter( 'default_checkout_shipping_country', array( __CLASS__, 'maybe_force_ir' ), 20 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_checkout_ux' ), 30 );
		add_filter( 'woocommerce_shipping_chosen_method', array( __CLASS__, 'maybe_disable_default_method' ), 20, 2 );
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function defaults() {
		return array(
			'hide_when_free'            => false,
			'hide_when_courier'         => false,
			'default_product_weight_g'  => 500,
			'default_package_weight_g'  => 100,
			'post_weight_limit_kg'      => 30,
			'status_enable'             => true,
			'free_shipping_title'       => '',
			'hide_country'              => true,
			'swap_state_city'           => false,
			'disable_default_method'    => false,
			'free_first_order'          => false,
			'honor_free_shipping_coupon'=> true,
			'method_images'             => array(
				'webino_tapin_pishtaz'   => '',
				'webino_tapin_vip'       => '',
				'webino_tapin_tipax'     => '',
				'webino_courier'        => '',
				'webino_tapin_tipax_api' => '',
				'webino_tapin_alonomic'  => '',
				'webino_flat_city'      => '',
				'webino_packaging'      => '',
				'webino_pishtaz_1405'   => '',
			),
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function get() {
		$raw = get_option( self::OPTION, null );
		$out = self::defaults();
		if ( ! is_array( $raw ) ) {
			return $out;
		}
		foreach ( $out as $key => $default ) {
			if ( ! array_key_exists( $key, $raw ) ) {
				continue;
			}
			if ( is_array( $default ) && is_array( $raw[ $key ] ) ) {
				$out[ $key ] = array_merge( $default, $raw[ $key ] );
			} else {
				$out[ $key ] = $raw[ $key ];
			}
		}
		$bools = array( 'hide_when_free', 'hide_when_courier', 'status_enable', 'hide_country', 'swap_state_city', 'disable_default_method', 'free_first_order', 'honor_free_shipping_coupon' );
		foreach ( $bools as $b ) {
			$out[ $b ] = (bool) $out[ $b ];
		}
		$out['default_product_weight_g'] = max( 0, (int) $out['default_product_weight_g'] );
		$out['default_package_weight_g'] = max( 0, (int) $out['default_package_weight_g'] );
		$out['post_weight_limit_kg']     = max( 0, (float) $out['post_weight_limit_kg'] );
		$out['free_shipping_title']      = sanitize_text_field( (string) $out['free_shipping_title'] );
		return $out;
	}

	/**
	 * @param array<string, mixed> $input Input.
	 * @return array<string, mixed>
	 */
	public static function update( $input ) {
		$current = self::get();
		if ( ! is_array( $input ) ) {
			return $current;
		}
		$merged = array_merge( $current, $input );
		if ( isset( $input['method_images'] ) && is_array( $input['method_images'] ) ) {
			$merged['method_images'] = array_merge( $current['method_images'], $input['method_images'] );
		}
		$clean = self::defaults();
		foreach ( $clean as $key => $default ) {
			if ( array_key_exists( $key, $merged ) ) {
				$clean[ $key ] = $merged[ $key ];
			}
		}
		update_option( self::OPTION, $clean, false );
		return self::get();
	}

	/**
	 * @param string $country Country.
	 * @return string
	 */
	public static function maybe_force_ir( $country ) {
		$tools = self::get();
		if ( ! empty( $tools['hide_country'] ) ) {
			return 'IR';
		}
		return $country;
	}

	/**
	 * @param array $fields Fields.
	 * @return array
	 */
	public static function checkout_fields( $fields ) {
		$tools = self::get();
		if ( ! empty( $tools['hide_country'] ) ) {
			foreach ( array( 'billing', 'shipping' ) as $type ) {
				if ( isset( $fields[ $type ][ $type . '_country' ] ) ) {
					$fields[ $type ][ $type . '_country' ]['type']  = 'hidden';
					$fields[ $type ][ $type . '_country' ]['default'] = 'IR';
					$fields[ $type ][ $type . '_country' ]['class'] = array( 'webino-hidden-country' );
				}
			}
		}
		if ( ! empty( $tools['swap_state_city'] ) ) {
			foreach ( array( 'billing', 'shipping' ) as $type ) {
				$state_p = isset( $fields[ $type ][ $type . '_state' ]['priority'] ) ? (int) $fields[ $type ][ $type . '_state' ]['priority'] : 80;
				$city_p  = isset( $fields[ $type ][ $type . '_city' ]['priority'] ) ? (int) $fields[ $type ][ $type . '_city' ]['priority'] : 70;
				if ( isset( $fields[ $type ][ $type . '_state' ] ) ) {
					$fields[ $type ][ $type . '_state' ]['priority'] = $city_p;
				}
				if ( isset( $fields[ $type ][ $type . '_city' ] ) ) {
					$fields[ $type ][ $type . '_city' ]['priority'] = $state_p;
				}
			}
		}
		return $fields;
	}

	/**
	 * @return void
	 */
	public static function enqueue_checkout_ux() {
		if ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
			return;
		}
		$tools = self::get();
		$css   = '';
		if ( ! empty( $tools['hide_country'] ) ) {
			$css .= '.webino-hidden-country,#billing_country_field,#shipping_country_field{display:none!important;}';
		}
		if ( $css ) {
			wp_register_style( 'webino-shipping-tools', false, array(), '1.0' );
			wp_enqueue_style( 'webino-shipping-tools' );
			wp_add_inline_style( 'webino-shipping-tools', $css );
		}
	}

	/**
	 * @param string $default Default method.
	 * @param array  $rates Rates.
	 * @return string
	 */
	public static function maybe_disable_default_method( $default, $rates ) {
		$tools = self::get();
		if ( ! empty( $tools['disable_default_method'] ) ) {
			return '';
		}
		unset( $rates );
		return $default;
	}

	/**
	 * Whether current customer has completed orders.
	 *
	 * @return bool
	 */
	public static function customer_has_orders() {
		$user_id = get_current_user_id();
		if ( $user_id < 1 ) {
			return false;
		}
		$orders = wc_get_orders(
			array(
				'customer_id' => $user_id,
				'status'      => array( 'processing', 'completed', 'on-hold' ),
				'limit'       => 1,
				'return'      => 'ids',
			)
		);
		return ! empty( $orders );
	}

	/**
	 * Cart has a free-shipping coupon.
	 *
	 * @return bool
	 */
	public static function cart_has_free_shipping_coupon() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return false;
		}
		foreach ( WC()->cart->get_coupons() as $coupon ) {
			if ( is_a( $coupon, 'WC_Coupon' ) && $coupon->get_free_shipping() ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param array<string, WC_Shipping_Rate> $rates Rates.
	 * @param array<string, mixed>            $package Package.
	 * @return array<string, WC_Shipping_Rate>
	 */
	public static function filter_package_rates( $rates, $package ) {
		unset( $package );
		if ( ! is_array( $rates ) || array() === $rates ) {
			return $rates;
		}
		$tools = self::get();

		$force_free = false;
		if ( ! empty( $tools['free_first_order'] ) && ! self::customer_has_orders() ) {
			$force_free = true;
		}
		if ( ! empty( $tools['honor_free_shipping_coupon'] ) && self::cart_has_free_shipping_coupon() ) {
			$force_free = true;
		}

		if ( $force_free ) {
			$title = $tools['free_shipping_title'] !== '' ? $tools['free_shipping_title'] : __( 'ارسال رایگان', 'webino-dashboard' );
			foreach ( $rates as $rate ) {
				if ( ! is_a( $rate, 'WC_Shipping_Rate' ) ) {
					continue;
				}
				$rate->set_cost( 0 );
				$rate->set_label( $title );
			}
			return $rates;
		}

		$has_free    = false;
		$has_courier = false;
		foreach ( $rates as $rate ) {
			if ( ! is_a( $rate, 'WC_Shipping_Rate' ) ) {
				continue;
			}
			if ( (float) $rate->get_cost() <= 0 ) {
				$has_free = true;
				if ( $tools['free_shipping_title'] !== '' ) {
					$rate->set_label( $tools['free_shipping_title'] );
				}
			}
			$method_id = (string) $rate->get_method_id();
			if ( 'webino_courier' === $method_id || false !== strpos( $method_id, 'courier' ) ) {
				$has_courier = true;
			}
		}

		if ( $tools['hide_when_free'] && $has_free ) {
			foreach ( $rates as $key => $rate ) {
				if ( is_a( $rate, 'WC_Shipping_Rate' ) && (float) $rate->get_cost() > 0 ) {
					unset( $rates[ $key ] );
				}
			}
		}

		if ( $tools['hide_when_courier'] && $has_courier ) {
			foreach ( $rates as $key => $rate ) {
				if ( ! is_a( $rate, 'WC_Shipping_Rate' ) ) {
					continue;
				}
				$method_id = (string) $rate->get_method_id();
				if ( 'webino_courier' !== $method_id && false === strpos( $method_id, 'courier' ) ) {
					unset( $rates[ $key ] );
				}
			}
		}

		return $rates;
	}

	/**
	 * @param string           $label Label.
	 * @param WC_Shipping_Rate $rate Rate.
	 * @return string
	 */
	public static function method_image_label( $label, $rate ) {
		if ( ! is_a( $rate, 'WC_Shipping_Rate' ) ) {
			return $label;
		}
		$method_id = (string) $rate->get_method_id();
		$tools     = self::get();
		$url       = '';
		if ( ! empty( $tools['method_images'][ $method_id ] ) ) {
			$url = (string) $tools['method_images'][ $method_id ];
		}
		if ( '' === $url ) {
			$instance_id = (int) $rate->get_instance_id();
			if ( $instance_id > 0 ) {
				$opts = get_option( 'woocommerce_' . $method_id . '_' . $instance_id . '_settings', array() );
				if ( is_array( $opts ) && ! empty( $opts['img_url'] ) ) {
					$url = (string) $opts['img_url'];
				}
			}
		}
		$url = esc_url( $url );
		if ( '' === $url ) {
			return $label;
		}
		$img = '<img class="webino-shipping-method-image" src="' . $url . '" alt="" style="max-width:100px;height:auto;vertical-align:middle;margin-inline-end:8px;" />';
		return $img . $label;
	}
}
