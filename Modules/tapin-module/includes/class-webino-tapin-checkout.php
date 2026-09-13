<?php
/**
 * Checkout fields for Iran province/city (Tapin codes).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WooCommerce checkout/address integration.
 */
class Webino_Tapin_Checkout {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_states', array( __CLASS__, 'filter_states' ), 20 );
		add_filter( 'woocommerce_checkout_fields', array( __CLASS__, 'checkout_fields' ), 25 );
		add_action( 'woocommerce_checkout_update_order_meta', array( __CLASS__, 'save_order_meta' ), 20, 1 );
		add_action( 'woocommerce_checkout_create_order', array( __CLASS__, 'attach_codes_on_create' ), 20, 2 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_checkout_script' ) );
	}

	/**
	 * @param array<string, array<string, string>> $states States.
	 * @return array<string, array<string, string>>
	 */
	public static function filter_states( $states ) {
		if ( ! Webino_Tapin_Locations::is_available() ) {
			return $states;
		}
		$map = Webino_Tapin_Locations::wc_states_map();
		if ( $map ) {
			$states['IR'] = $map;
		}
		return $states;
	}

	/**
	 * @param array<string, mixed> $fields Fields.
	 * @return array<string, mixed>
	 */
	public static function checkout_fields( $fields ) {
		if ( ! Webino_Tapin_Locations::is_available() ) {
			return $fields;
		}
		foreach ( array( 'billing', 'shipping' ) as $group ) {
			if ( isset( $fields[ $group ][ $group . '_city' ] ) ) {
				$fields[ $group ][ $group . '_city' ]['type'] = 'select';
				$fields[ $group ][ $group . '_city' ]['options'] = array( '' => __( 'انتخاب شهر', 'webino-dashboard' ) );
				$fields[ $group ][ $group . '_city' ]['class'][] = 'webino-tapin-city';
			}
			if ( isset( $fields[ $group ][ $group . '_state' ] ) ) {
				$fields[ $group ][ $group . '_state' ]['class'][] = 'webino-tapin-state';
			}
		}
		return $fields;
	}

	/**
	 * @return void
	 */
	public static function enqueue_checkout_script() {
		if ( ! function_exists( 'is_checkout' ) || ! is_checkout() || ! Webino_Tapin_Locations::is_available() ) {
			return;
		}
		$tree = Webino_Tapin_Locations::get_tree();
		$payload = array();
		foreach ( $tree as $p ) {
			$cities = array();
			foreach ( $p['cities'] as $c ) {
				$cities[ $c['title'] ] = $c['title'];
			}
			$payload[ $p['title'] ] = $cities;
		}
		wp_register_script( 'webino-tapin-checkout', '', array( 'jquery' ), '1.0.0', true );
		wp_enqueue_script( 'webino-tapin-checkout' );
		wp_add_inline_script(
			'webino-tapin-checkout',
			'window.webinoTapinCities=' . wp_json_encode( $payload ) . ';'
			. '(function($){function fill(group){var s=$("#"+group+"_state"),c=$("#"+group+"_city");if(!s.length||!c.length)return;var cities=(window.webinoTapinCities||{})[s.val()]||{};var cur=c.val();c.empty().append($("<option/>").val("").text("انتخاب شهر"));$.each(cities,function(k,v){c.append($("<option/>").val(k).text(v));});if(cur&&cities[cur])c.val(cur);} $(document.body).on("change","#billing_state,#shipping_state",function(){fill(this.id.indexOf("shipping")===0?"shipping":"billing");});$(function(){fill("billing");fill("shipping");});})(jQuery);'
		);
	}

	/**
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public static function save_order_meta( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		self::persist_codes( $order );
	}

	/**
	 * @param WC_Order             $order Order.
	 * @param array<string, mixed> $data Data.
	 * @return void
	 */
	public static function attach_codes_on_create( $order, $data = array() ) {
		unset( $data );
		if ( is_a( $order, 'WC_Order' ) ) {
			self::persist_codes( $order );
		}
	}

	/**
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function persist_codes( $order ) {
		$state = $order->get_shipping_state() ?: $order->get_billing_state();
		$city  = $order->get_shipping_city() ?: $order->get_billing_city();
		$p     = Webino_Tapin_Locations::province_code_by_title( (string) $state );
		$c     = $p ? Webino_Tapin_Locations::city_code_by_title( $p, (string) $city ) : null;
		if ( $p ) {
			$order->update_meta_data( Webino_Tapin_Locations::META_PROVINCE, (int) $p );
			$order->update_meta_data( '_billing_state_id', (int) $p );
			$order->update_meta_data( '_shipping_state_id', (int) $p );
		}
		if ( $c ) {
			$order->update_meta_data( Webino_Tapin_Locations::META_CITY, (int) $c );
			$order->update_meta_data( '_billing_city_id', (int) $c );
			$order->update_meta_data( '_shipping_city_id', (int) $c );
		}
		$order->save();
	}
}
