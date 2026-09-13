<?php
/**
 * Dokan bridge for transport/Tapin (activates only when Dokan is present).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webino_Shipping_Dokan {

	/**
	 * @return void
	 */
	public static function init() {
		if ( ! self::active() ) {
			return;
		}
		add_filter( 'webino_tapin_skip_vendor_order_ui', array( __CLASS__, 'skip_vendor_ui' ), 10, 2 );
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'maybe_filter_vendor_package' ), 85, 2 );
		add_action( 'dokan_order_detail_after_order_items', array( __CLASS__, 'vendor_order_notice' ), 20 );
		add_filter( 'webino_tapin_can_register_order', array( __CLASS__, 'can_register' ), 10, 2 );
	}

	/**
	 * @return bool
	 */
	public static function active() {
		return function_exists( 'dokan' ) || class_exists( 'WeDevs_Dokan', false );
	}

	/**
	 * Skip host Tapin UI on vendor dashboard orders — vendor uses Dokan UI.
	 *
	 * @param bool     $skip Skip.
	 * @param WC_Order $order Order.
	 * @return bool
	 */
	public static function skip_vendor_ui( $skip, $order ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return true;
		}
		if ( function_exists( 'dokan_get_seller_id_by_order' ) ) {
			$seller = (int) dokan_get_seller_id_by_order( $order->get_id() );
			if ( $seller > 0 && get_current_user_id() === $seller ) {
				return true;
			}
		}
		return $skip;
	}

	/**
	 * Keep only rates that belong to current vendor package when seller_id present.
	 *
	 * @param array $rates Rates.
	 * @param array $package Package.
	 * @return array
	 */
	public static function maybe_filter_vendor_package( $rates, $package ) {
		if ( ! is_array( $package ) || empty( $package['seller_id'] ) || ! is_array( $rates ) ) {
			return $rates;
		}
		$seller_id = (int) $package['seller_id'];
		// Drop rates that declare a different vendor via meta (future-proof); keep Webino/Tapin rates.
		foreach ( $rates as $rate_id => $rate ) {
			if ( ! is_a( $rate, 'WC_Shipping_Rate' ) ) {
				continue;
			}
			$meta = $rate->get_meta_data();
			if ( is_array( $meta ) && isset( $meta['seller_id'] ) && (int) $meta['seller_id'] !== $seller_id ) {
				unset( $rates[ $rate_id ] );
			}
		}
		return $rates;
	}

	/**
	 * Vendor-side notice under order items.
	 *
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function vendor_order_notice( $order ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}
		$barcode = $order->get_meta( '_webino_tapin_barcode' );
		if ( ! $barcode ) {
			$barcode = $order->get_meta( '_post_barcode' );
		}
		echo '<div class="dokan-panel dokan-panel-default" style="margin-top:12px;"><div class="dokan-panel-heading">' . esc_html__( 'ارسال وبینو / تاپین', 'webino-dashboard' ) . '</div><div class="dokan-panel-body">';
		if ( $barcode ) {
			echo '<p>' . esc_html__( 'بارکد پستی:', 'webino-dashboard' ) . ' <code dir="ltr">' . esc_html( (string) $barcode ) . '</code></p>';
		} else {
			echo '<p>' . esc_html__( 'ثبت مرسوله توسط مدیر فروشگاه از داشبورد وبینو انجام می‌شود.', 'webino-dashboard' ) . '</p>';
		}
		echo '</div></div>';
	}

	/**
	 * Prevent auto-register for split vendor suborders unless seller owns shipping.
	 *
	 * @param bool     $allowed Allowed.
	 * @param WC_Order $order Order.
	 * @return bool
	 */
	public static function can_register( $allowed, $order ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return false;
		}
		// Parent marketplace order with multiple sellers: skip auto register.
		if ( function_exists( 'dokan_get_sellers_by_order' ) ) {
			$sellers = dokan_get_sellers_by_order( $order );
			if ( is_array( $sellers ) && count( $sellers ) > 1 ) {
				return false;
			}
		}
		return $allowed;
	}
}
