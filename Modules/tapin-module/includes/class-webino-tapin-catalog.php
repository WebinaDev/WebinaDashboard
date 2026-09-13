<?php
/**
 * Tapin catalog helpers: products map, customers, employees, tasks.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sync / list wrappers for Tapin catalog APIs.
 */
class Webino_Tapin_Catalog {

	const META_PRODUCT_ID = '_webino_tapin_product_id';

	/**
	 * @param int $wc_product_id WC product.
	 * @return string|null
	 */
	public static function get_mapped_product_id( $wc_product_id ) {
		$id = get_post_meta( (int) $wc_product_id, self::META_PRODUCT_ID, true );
		return $id ? (string) $id : null;
	}

	/**
	 * @param int    $wc_product_id WC product.
	 * @param string $tapin_id Tapin product id.
	 * @return void
	 */
	public static function map_product( $wc_product_id, $tapin_id ) {
		update_post_meta( (int) $wc_product_id, self::META_PRODUCT_ID, sanitize_text_field( (string) $tapin_id ) );
	}

	/**
	 * Push a WooCommerce product to Tapin (create or update).
	 *
	 * @param int $wc_product_id Product ID.
	 * @return array{ok:bool,message:string,product_id?:string}
	 */
	public static function push_wc_product( $wc_product_id ) {
		$product = wc_get_product( (int) $wc_product_id );
		if ( ! $product ) {
			return array( 'ok' => false, 'message' => __( 'محصول پیدا نشد.', 'webino-dashboard' ) );
		}
		$weight = 100;
		if ( class_exists( 'Webino_Shipping_Weight', false ) ) {
			$est    = Webino_Shipping_Weight::estimate_unit_package( $product );
			$weight = max( 1, (int) $est['product_weight_g'] );
		}
		$price = (float) $product->get_price();
		if ( class_exists( 'Webino_Shipping_Currency', false ) ) {
			$price = Webino_Shipping_Currency::to_rial( $price );
		}
		$existing = self::get_mapped_product_id( $wc_product_id );
		$payload  = array(
			'title'       => $product->get_name(),
			'price'       => (int) round( $price ),
			'weight'      => $weight,
			'description' => wp_strip_all_tags( (string) $product->get_short_description() ?: $product->get_description() ),
		);
		if ( $existing ) {
			$payload['product_id'] = $existing;
			$res                   = Webino_Tapin_Client::product_update( $payload );
		} else {
			$res = Webino_Tapin_Client::product_create( $payload );
		}
		if ( ! $res['ok'] ) {
			return array( 'ok' => false, 'message' => $res['message'] );
		}
		$tid = '';
		if ( is_array( $res['entries'] ) ) {
			$tid = (string) ( $res['entries']['product_id'] ?? $res['entries']['id'] ?? '' );
		}
		if ( $tid ) {
			self::map_product( $wc_product_id, $tid );
		}
		return array(
			'ok'         => true,
			'message'    => __( 'محصول با تاپین همگام شد.', 'webino-dashboard' ),
			'product_id' => $tid ?: (string) $existing,
		);
	}

	/**
	 * Delete Tapin product and clear WC meta.
	 *
	 * @param int $wc_product_id WC product.
	 * @return array{ok:bool,message:string}
	 */
	public static function delete_mapped_product( $wc_product_id ) {
		$tid = self::get_mapped_product_id( $wc_product_id );
		if ( ! $tid ) {
			return array( 'ok' => false, 'message' => __( 'شناسه تاپین برای این محصول نیست.', 'webino-dashboard' ) );
		}
		$res = Webino_Tapin_Client::product_delete( array( 'product_id' => $tid ) );
		if ( $res['ok'] ) {
			delete_post_meta( (int) $wc_product_id, self::META_PRODUCT_ID );
		}
		return array( 'ok' => $res['ok'], 'message' => $res['message'] );
	}

	/**
	 * Normalize list entries.
	 *
	 * @param mixed $entries Entries.
	 * @return array{list:array,count:int,page:int,total_count:int}
	 */
	public static function normalize_list( $entries ) {
		$out = array(
			'list'        => array(),
			'count'       => 0,
			'page'        => 1,
			'total_count' => 0,
		);
		if ( ! is_array( $entries ) ) {
			return $out;
		}
		$list = isset( $entries['list'] ) && is_array( $entries['list'] ) ? $entries['list'] : $entries;
		if ( ! isset( $entries['list'] ) && isset( $entries[0] ) ) {
			$list = $entries;
		} elseif ( ! isset( $entries['list'] ) && ! isset( $entries[0] ) ) {
			$list = array();
		}
		$out['list']        = array_values( array_filter( $list, 'is_array' ) );
		$out['count']       = (int) ( $entries['count'] ?? count( $out['list'] ) );
		$out['page']        = (int) ( $entries['page'] ?? 1 );
		$out['total_count'] = (int) ( $entries['total_count'] ?? count( $out['list'] ) );
		return $out;
	}
}
