<?php
/**
 * Inventory synchronization between WooCommerce, internal warehouses and Digikala.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Inventory_Sync {

	/**
	 * @param int $product_id Product id.
	 * @return void
	 */
	public static function on_product_updated( $product_id ) {
		$settings = Digikala_Auth::settings();
		if ( empty( $settings['auto_sync'] ) ) {
			return;
		}
		$product_id = (int) $product_id;
		$parent     = $product_id;
		$variation  = 0;
		$product    = wc_get_product( $product_id );
		if ( $product && $product->is_type( 'variation' ) ) {
			$parent    = (int) $product->get_parent_id();
			$variation = $product_id;
		}
		if ( class_exists( 'Digikala_Product_Map' ) ) {
			$map = Digikala_Product_Map::get( $parent, $variation );
			if ( '' === ( $map['dk_variant_id'] ?? '' ) ) {
				return;
			}
		}
		Digikala_Jobs::enqueue(
			'inventory_sync',
			array(
				'product_ids' => array( $parent > 0 ? $parent : $product_id ),
				'source'      => 'woocommerce_update_product',
			),
			5
		);
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function sync_inventory( array $payload = array(), $job_id = 0 ) {
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
		$processed = 0;
		foreach ( $product_ids as $pid ) {
			$product = wc_get_product( $pid );
			if ( ! $product ) {
				continue;
			}
			$pairs = array();
			if ( $product->is_type( 'variation' ) ) {
				$pairs[] = array( (int) $product->get_parent_id(), (int) $pid );
			} else {
				$pairs[] = array( (int) $pid, 0 );
				if ( $product->is_type( 'variable' ) ) {
					foreach ( $product->get_children() as $vid ) {
						$pairs[] = array( (int) $pid, (int) $vid );
					}
				}
			}
			foreach ( $pairs as $pair ) {
				if ( ! class_exists( 'Digikala_Product_Map' ) ) {
					continue;
				}
				$map = Digikala_Product_Map::get( $pair[0], $pair[1] );
				if ( '' === ( $map['dk_variant_id'] ?? '' ) ) {
					continue;
				}
				$res = Digikala_Product_Map::sync_price_stock( $pair[0], $pair[1] );
				if ( is_wp_error( $res ) ) {
					Digikala_Jobs::log(
						'error',
						'inventory',
						'Price/stock push failed.',
						array(
							'job_id'     => $job_id,
							'product_id' => $pair[0],
							'variation'  => $pair[1],
							'error'      => $res->get_error_message(),
						)
					);
					continue;
				}
				$target = $pair[1] > 0 ? $pair[1] : $pair[0];
				$p      = wc_get_product( $target );
				self::sync_to_internal_warehouse( $target, $p ? max( 0, (int) $p->get_stock_quantity() ) : 0 );
				$processed++;
			}
		}
		Digikala_Jobs::log( 'info', 'inventory', 'Inventory sync completed.', array( 'job_id' => $job_id, 'processed' => $processed ) );
		return true;
	}

	/**
	 * @param int $product_id Product id.
	 * @return array{dk_product_id:string,dk_variant_id:string}
	 */
	private static function resolve_dk_variant( $product_id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dk_product_map';
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT dk_product_id, dk_variant_id FROM {$table} WHERE wc_product_id=%d ORDER BY id DESC LIMIT 1", $product_id ), ARRAY_A );
		if ( ! is_array( $row ) ) {
			return array( 'dk_product_id' => '', 'dk_variant_id' => '' );
		}
		return array(
			'dk_product_id' => (string) ( $row['dk_product_id'] ?? '' ),
			'dk_variant_id' => (string) ( $row['dk_variant_id'] ?? '' ),
		);
	}

	/**
	 * @param int $product_id Product id.
	 * @param int $quantity Quantity.
	 * @return void
	 */
	private static function sync_to_internal_warehouse( $product_id, $quantity ) {
		global $wpdb;
		$stock_table = $wpdb->prefix . 'webino_acc_warehouse_stock';
		$warehouse_table = $wpdb->prefix . 'webino_acc_warehouses';
		$default_wh = (int) $wpdb->get_var( "SELECT id FROM {$warehouse_table} ORDER BY id ASC LIMIT 1" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		if ( $default_wh <= 0 ) {
			return;
		}
		$exists = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT id FROM {$stock_table} WHERE warehouse_id=%d AND product_id=%d LIMIT 1",
				$default_wh,
				$product_id
			)
		);
		if ( $exists ) {
			$wpdb->update(
				$stock_table,
				array(
					'quantity'   => $quantity,
					'updated_at' => gmdate( 'Y-m-d H:i:s' ),
				),
				array( 'id' => (int) $exists )
			);
			return;
		}
		$wpdb->insert(
			$stock_table,
			array(
				'warehouse_id' => $default_wh,
				'product_id'   => $product_id,
				'quantity'     => $quantity,
				'reserved'     => 0,
				'updated_at'   => gmdate( 'Y-m-d H:i:s' ),
			)
		);
	}
}
