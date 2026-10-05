<?php
/**
 * Bridge warehouse stock updates → SMS stock-low / stock-out actions.
 *
 * Call after persisting webino_acc_warehouse_stock (or any warehouse qty change).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Evaluates quantity vs reorder point and fires dashboard stock hooks.
 */
final class Webino_Dashboard_Sms_Warehouse_Stock {

	/**
	 * After warehouse stock row is saved, notify SMS layer if thresholds crossed.
	 *
	 * @param int        $product_id     WooCommerce product id when synced; otherwise internal acc product id.
	 * @param float $quantity       On-hand quantity.
	 * @param float|null $reorder_point Low-stock threshold (warehouse reorder_point or WC low_stock_amount).
	 * @return void
	 */
	public static function after_quantity_update( $product_id, $quantity, $reorder_point = null ) {
		$product_id = (int) $product_id;
		if ( $product_id < 1 ) {
			return;
		}

		$quantity = (float) $quantity;

		if ( null === $reorder_point && function_exists( 'wc_get_product' ) ) {
			$product = wc_get_product( $product_id );
			if ( $product instanceof WC_Product && $product->managing_stock() ) {
				$low = $product->get_low_stock_amount();
				if ( null !== $low && '' !== $low ) {
					$reorder_point = (float) $low;
				}
			}
		}

		if ( $quantity <= 0 ) {
			/**
			 * Fires when warehouse/WC stock hits zero.
			 *
			 * @param int   $product_id Product id.
			 * @param float $quantity   Current quantity (0).
			 */
			do_action( 'webino_dashboard_product_stock_out', $product_id, $quantity );
			return;
		}

		if ( null !== $reorder_point && $reorder_point > 0 && $quantity <= (float) $reorder_point ) {
			/**
			 * Fires when warehouse/WC stock is at or below reorder / low threshold.
			 *
			 * @param int   $product_id Product id.
			 * @param float $quantity   Current quantity.
			 */
			do_action( 'webino_dashboard_product_stock_low', $product_id, $quantity );
		}
	}

	/**
	 * Persist warehouse stock and run SMS threshold check.
	 *
	 * @param int        $warehouse_id Warehouse id.
	 * @param int        $product_id   Product id (WC id when linked).
	 * @param float      $quantity     New quantity.
	 * @param float|null $reorder_point Optional reorder point.
	 * @return true|WP_Error
	 */
	public static function upsert_warehouse_stock_row( $warehouse_id, $product_id, $quantity, $reorder_point = null ) {
		global $wpdb;
		$warehouse_id = (int) $warehouse_id;
		$product_id   = (int) $product_id;
		if ( $warehouse_id < 1 || $product_id < 1 ) {
			return new WP_Error( 'invalid_args', __( 'Invalid warehouse or product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$table = Webino_Dashboard_Rest_Base::accounting_table( 'warehouse_stock' );
		$existing = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT id FROM $table WHERE warehouse_id = %d AND product_id = %d LIMIT 1",
				$warehouse_id,
				$product_id
			),
			ARRAY_A
		);

		$data = array(
			'quantity'     => $quantity,
			'reorder_point' => $reorder_point,
			'updated_at'   => current_time( 'mysql' ),
		);

		if ( $existing ) {
			$wpdb->update( $table, $data, array( 'id' => (int) $existing['id'] ) );
		} else {
			$wpdb->insert(
				$table,
				array_merge(
					$data,
					array(
						'warehouse_id' => $warehouse_id,
						'product_id'   => $product_id,
						'created_at'   => current_time( 'mysql' ),
					)
				)
			);
		}

		self::after_quantity_update( $product_id, (float) $quantity, null !== $reorder_point ? (float) $reorder_point : null );

		return true;
	}
}
