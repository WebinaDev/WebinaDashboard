<?php
/**
 * District field on checkout from webino_state_city taxonomy.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webino_Shipping_Checkout_District {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_checkout_fields', array( __CLASS__, 'fields' ), 40 );
		add_action( 'woocommerce_checkout_update_order_meta', array( __CLASS__, 'save' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'assets' ) );
	}

	/**
	 * @return void
	 */
	public static function assets() {
		// Checkout no longer shows the neighborhood field.
	}

	/**
	 * District/neighborhood is not a standard Iran checkout field — do not inject it.
	 *
	 * @param array $fields Fields.
	 * @return array
	 */
	public static function fields( $fields ) {
		if ( isset( $fields['billing']['billing_district'] ) ) {
			unset( $fields['billing']['billing_district'] );
		}
		if ( isset( $fields['shipping']['shipping_district'] ) ) {
			unset( $fields['shipping']['shipping_district'] );
		}
		return $fields;
	}

	/**
	 * @param int $order_id Order.
	 * @return void
	 */
	public static function save( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		foreach ( array( 'billing', 'shipping' ) as $type ) {
			$key = $type . '_district';
			if ( ! isset( $_POST[ $key ] ) ) {
				continue;
			}
			$id = (int) wp_unslash( $_POST[ $key ] );
			$order->update_meta_data( '_' . $type . '_district_id', $id );
			if ( $id && class_exists( 'Webino_Shipping_Cities', false ) ) {
				$term = get_term( $id, Webino_Shipping_Cities::TAXONOMY );
				if ( $term && ! is_wp_error( $term ) ) {
					$order->update_meta_data( '_' . $type . '_district', $term->name );
				}
			}
		}
		$order->save();
	}
}
