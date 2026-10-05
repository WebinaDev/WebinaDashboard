<?php
/**
 * Product import/export between WooCommerce and Digikala.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Product_Sync {

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function import_products( array $payload = array(), $job_id = 0 ) {
		$keyword = isset( $payload['keyword'] ) ? sanitize_text_field( (string) $payload['keyword'] ) : '';
		if ( '' === $keyword ) {
			$keyword = ' ';
		}
		$res = Digikala_Client::request(
			'GET',
			'open-api/v1/product-creation/search/v2',
			null,
			array(
				'search[keyword]' => $keyword,
			)
		);
		if ( is_wp_error( $res ) ) {
			Digikala_Jobs::log( 'error', 'product', 'Product import API failed.', array( 'job_id' => $job_id, 'error' => $res->get_error_message() ) );
			return false;
		}
		$items = (array) ( $res['data']['items'] ?? array() );
		$created = 0;
		foreach ( array_slice( $items, 0, 50 ) as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$title = sanitize_text_field( (string) ( $item['title'] ?? '' ) );
			if ( '' === $title ) {
				continue;
			}
			$product = new WC_Product_Simple();
			$product->set_name( $title );
			$product->set_status( 'draft' );
			$product->set_regular_price( (string) max( 0, (int) ( $item['market_price'] ?? 0 ) ) );
			$product->set_sku( 'dk-' . sanitize_title( (string) ( $item['id'] ?? uniqid() ) ) );
			$pid = $product->save();
			if ( $pid <= 0 ) {
				continue;
			}
			self::upsert_map( $pid, 0, (string) ( $item['id'] ?? '' ), '' );
			$created++;
		}
		Digikala_Jobs::log( 'info', 'product', 'Product import completed.', array( 'job_id' => $job_id, 'created' => $created ) );
		return true;
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function export_products( array $payload = array(), $job_id = 0 ) {
		$product_ids = array();
		if ( ! empty( $payload['product_ids'] ) && is_array( $payload['product_ids'] ) ) {
			$product_ids = array_map( 'intval', $payload['product_ids'] );
		} else {
			$product_ids = function_exists( 'wc_get_products' )
				? wc_get_products(
					array(
						'status' => array( 'publish', 'draft' ),
						'limit'  => 50,
						'return' => 'ids',
					)
				)
				: get_posts(
					array(
						'post_type'      => 'product',
						'post_status'    => array( 'publish', 'draft' ),
						'posts_per_page' => 50,
						'fields'         => 'ids',
					)
				);
		}
		$ok = 0;
		foreach ( $product_ids as $pid ) {
			$p = wc_get_product( $pid );
			if ( ! $p ) {
				continue;
			}
			$pairs = array( array( (int) $pid, 0 ) );
			if ( $p->is_type( 'variable' ) ) {
				foreach ( $p->get_children() as $vid ) {
					$pairs[] = array( (int) $pid, (int) $vid );
				}
			}
			foreach ( $pairs as $pair ) {
				if ( class_exists( 'Digikala_Product_Map' ) ) {
					$r = Digikala_Product_Map::sync_price_stock( $pair[0], $pair[1] );
					if ( ! is_wp_error( $r ) ) {
						$ok++;
					}
					continue;
				}
			}
		}
		Digikala_Jobs::log( 'info', 'product', 'Product export completed.', array( 'job_id' => $job_id, 'exported' => $ok ) );
		return true;
	}

	/**
	 * @param int    $wc_product_id Product id.
	 * @param int    $wc_variation_id Variation id.
	 * @param string $dk_product_id DK product.
	 * @param string $dk_variant_id DK variant.
	 * @return void
	 */
	private static function upsert_map( $wc_product_id, $wc_variation_id, $dk_product_id, $dk_variant_id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dk_product_map';
		$now = gmdate( 'Y-m-d H:i:s' );
		$id = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE wc_product_id=%d AND wc_variation_id=%d LIMIT 1", $wc_product_id, $wc_variation_id ) );
		if ( $id ) {
			$wpdb->update(
				$table,
				array(
					'dk_product_id' => $dk_product_id,
					'dk_variant_id' => $dk_variant_id,
					'last_sync_at'  => $now,
				),
				array( 'id' => (int) $id )
			);
			return;
		}
		$wpdb->insert(
			$table,
			array(
				'wc_product_id'   => $wc_product_id,
				'wc_variation_id' => $wc_variation_id,
				'dk_product_id'   => $dk_product_id,
				'dk_variant_id'   => $dk_variant_id,
				'last_sync_at'    => $now,
			)
		);
	}
}
