<?php
/**
 * Marketplace platform detection for orders and products.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_Dashboard_Marketplace {

	const SLUGS = array( 'digikala', 'basalam', 'snappshop', 'tapsishop', 'technolife' );

	/**
	 * @return array<string,string>
	 */
	public static function labels() {
		return array(
			'digikala'   => 'Digikala',
			'basalam'    => 'Basalam',
			'technolife' => 'Technolife',
			'tapsishop'  => 'TapsiShop',
			'snappshop'  => 'SnappShop',
			'torob'      => 'Torob',
			'emalls'     => 'Emalls',
			'snapppay-search' => 'SnappPay Search',
			'zarehbin'   => 'Zarehbin',
		);
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	public static function order_slug( $order ) {
		if ( ! $order ) {
			return '';
		}
		$platform = sanitize_key( (string) $order->get_meta( '_wnc_platform' ) );
		if ( '' !== $platform ) {
			return $platform;
		}
		if ( $order->get_meta( '_digikala_order_id' ) || $order->get_meta( '_wnc_remote_order_id' ) && 'digikala' === $order->get_created_via() ) {
			return 'digikala';
		}
		if ( $order->get_meta( '_is_sync_basalam_order' ) || $order->get_meta( '_sync_basalam_hash_id' ) ) {
			return 'basalam';
		}
		$via = (string) $order->get_created_via();
		foreach ( self::SLUGS as $slug ) {
			if ( $via === $slug || 0 === strpos( $via, 'webinaconnector-' . $slug ) ) {
				return $slug;
			}
		}
		if ( 'digikala' === $via ) {
			return 'digikala';
		}
		return '';
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	public static function order_label( $order ) {
		$slug   = self::order_slug( $order );
		$labels = self::labels();
		return $slug && isset( $labels[ $slug ] ) ? $labels[ $slug ] : '';
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	public static function remote_order_id( $order ) {
		$id = (string) $order->get_meta( '_wnc_remote_order_id' );
		if ( '' !== $id ) {
			return $id;
		}
		$id = (string) $order->get_meta( '_digikala_order_id' );
		if ( '' !== $id ) {
			return $id;
		}
		return (string) $order->get_meta( '_sync_basalam_hash_id' );
	}

	/**
	 * @param int $product_id Product ID.
	 * @return string[]
	 */
	public static function product_slugs( $product_id ) {
		$product_id = (int) $product_id;
		$found      = array();
		if ( $product_id <= 0 ) {
			return $found;
		}
		if ( class_exists( 'WNC_Mapper' ) ) {
			$rows = WNC_Mapper::get_for_product( $product_id );
			foreach ( (array) $rows as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$slug = sanitize_key( (string) ( $row['platform'] ?? '' ) );
				if ( '' === $slug ) {
					continue;
				}
				if ( '' !== (string) ( $row['remote_product_id'] ?? '' ) || '' !== (string) ( $row['remote_variant_id'] ?? '' ) ) {
					$found[ $slug ] = $slug;
				}
			}
		}
		global $wpdb;
		$dk = $wpdb->prefix . 'webino_dk_product_map';
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $dk ) ) === $dk ) { // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$has = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$dk} WHERE wc_product_id=%d AND (dk_product_id<>'' OR dk_variant_id<>'')", $product_id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery,WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			if ( $has > 0 ) {
				$found['digikala'] = 'digikala';
			}
		}
		$basalam_id = get_post_meta( $product_id, 'sync_basalam_product_id', true );
		if ( '' !== (string) $basalam_id ) {
			$found['basalam'] = 'basalam';
		}
		return array_values( $found );
	}
}
