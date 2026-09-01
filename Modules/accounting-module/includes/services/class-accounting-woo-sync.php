<?php
/**
 * WooCommerce + WFCP sync into accounting.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Order → invoice + journal; COGS snapshot.
 */
final class Accounting_Woo_Sync {

	/**
	 * Snapshot COGS on line item at checkout.
	 *
	 * @param WC_Order_Item_Product $item          Item.
	 * @param string                $cart_item_key Key.
	 * @param array                 $values        Cart values.
	 * @param WC_Order              $order         Order.
	 * @return void
	 */
	public static function snapshot_cogs_on_line( $item, $cart_item_key, $values, $order ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter
		if ( ! Accounting_Config::get()['snapshot_cogs'] ) {
			return;
		}
		$product = $item->get_product();
		if ( ! $product ) {
			return;
		}
		$cogs = (float) $product->get_meta( '_wfcp_purchase_price' );
		$item->add_meta_data( '_wfcp_cogs', $cogs, true );
		$item->add_meta_data( '_webino_acc_sstid', (string) (
			$product->get_meta( '_webino_moadian_sstid' )
			?: $product->get_meta( '_webino_acc_sstid' )
		), true );
	}

	/**
	 * Sync order when status changes.
	 *
	 * @param int      $order_id Order ID.
	 * @param string   $from     From.
	 * @param string   $to       To.
	 * @param WC_Order $order    Order.
	 * @return void
	 */
	public static function on_status_changed( $order_id, $from, $to, $order ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter
		if ( ! $order instanceof WC_Order ) {
			$order = wc_get_order( $order_id );
		}
		if ( ! $order ) {
			return;
		}
		$statuses = Accounting_Config::get()['sync_order_statuses'];
		$to_key   = str_replace( 'wc-', '', $to );
		if ( in_array( $to_key, array_map( 'strval', $statuses ), true ) ) {
			self::sync_order( $order );
		}
		if ( 'refunded' === $to_key ) {
			self::sync_refund( $order );
		}
	}

	/**
	 * Create/update sale invoice from WC order.
	 *
	 * @param WC_Order $order Order.
	 * @return int|WP_Error Invoice ID.
	 */
	public static function sync_order( WC_Order $order ) {
		global $wpdb;
		$table = Accounting_Db::table( 'invoices' );
		$existing = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE wc_order_id = %d LIMIT 1", $order->get_id() ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $existing > 0 ) {
			$inv = Accounting_Invoices::get( $existing );
			if ( ! is_wp_error( $inv ) && 'posted' === $inv['status'] ) {
				return $existing;
			}
		}

		$person_id = Accounting_Persons::upsert_from_order( $order );
		$lines     = array();
		$purchase_type = (string) $order->get_meta( '_wfcp_purchase_type' );

		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof WC_Order_Item_Product ) {
				continue;
			}
			$pid   = (int) $item->get_product_id();
			$vid   = (int) $item->get_variation_id();
			$wc_id = $vid ?: $pid;
			$acc_id = Accounting_Products::upsert_from_wc( $wc_id );
			if ( is_wp_error( $acc_id ) ) {
				$acc_id = 0;
			}
			$cogs = (float) $item->get_meta( '_wfcp_cogs' );
			if ( $cogs <= 0 && $item->get_product() ) {
				$cogs = (float) $item->get_product()->get_meta( '_wfcp_purchase_price' );
			}
			$sstid = (string) $item->get_meta( '_webino_acc_sstid' );
			$acc_prod = $acc_id ? Accounting_Db::get_row( 'products', $acc_id ) : null;
			if ( '' === $sstid && $acc_prod ) {
				$sstid = (string) ( $acc_prod['sstid'] ?? '' );
			}
			$qty   = (float) $item->get_quantity();
			$total = (float) $item->get_total();
			$unit  = $qty > 0 ? $total / $qty : $total;
			$vat_r = $acc_prod ? (float) $acc_prod['vat_rate'] : (float) Accounting_Config::get()['default_vat_rate'];
			// WC totals may already include tax depending on settings; use line tax when present.
			$line_tax = (float) $item->get_total_tax();
			if ( $line_tax > 0 && $total > 0 ) {
				$vat_r = round( ( $line_tax / $total ) * 100, 2 );
			}
			$itype = (string) $item->get_meta( 'wfcp_purchase_type' );
			if ( $itype && ! $purchase_type ) {
				$purchase_type = $itype;
			}
			$inst_total = (float) $item->get_meta( 'wfcp_installment_total' );
			if ( $inst_total > 0 ) {
				$total = $inst_total;
				$unit  = $qty > 0 ? $total / $qty : $total;
			}

			$lines[] = array(
				'product_id'    => $acc_id ?: null,
				'wc_product_id' => $wc_id,
				'description'   => $item->get_name(),
				'sstid'         => $sstid,
				'qty'           => $qty,
				'unit_price'    => $unit,
				'discount'      => 0,
				'vat_rate'      => $vat_r,
				'cogs'          => $cogs,
			);
		}

		if ( empty( $lines ) ) {
			return new WP_Error( 'acc_empty_order', __( 'Order has no product lines.', 'webino-dashboard' ) );
		}

		if ( $existing > 0 ) {
			// Replace draft invoice.
			Accounting_Db::delete( 'invoices', $existing );
			global $wpdb2;
			$lt = Accounting_Db::table( 'invoice_lines' );
			$wpdb->query( $wpdb->prepare( "DELETE FROM {$lt} WHERE invoice_id = %d", $existing ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}

		$buyer = array(
			'name'          => $order->get_formatted_billing_full_name(),
			'company'       => $order->get_billing_company(),
			'national_id'   => (string) $order->get_meta( '_billing_national_id' ),
			'economic_code' => (string) $order->get_meta( '_billing_economic_code' ),
			'postal_code'    => $order->get_billing_postcode(),
			'address'       => $order->get_billing_address_1(),
			'phone'         => $order->get_billing_phone(),
		);

		$id = Accounting_Invoices::create(
			array(
				'type'          => 'sale',
				'person_id'     => $person_id,
				'document_date' => $order->get_date_created() ? $order->get_date_created()->date( 'Y-m-d' ) : gmdate( 'Y-m-d' ),
				'status'        => 'draft',
				'wc_order_id'   => $order->get_id(),
				'inty'          => (int) Accounting_Config::get()['default_invoice_type'],
				'buyer_json'    => $buyer,
				'purchase_type' => $purchase_type,
				'number'        => 'WC-' . $order->get_order_number(),
			),
			$lines
		);
		if ( is_wp_error( $id ) ) {
			return $id;
		}

		$posted = Accounting_Invoices::post_to_gl( $id );
		if ( is_wp_error( $posted ) ) {
			$order->add_order_note( 'Accounting GL: ' . $posted->get_error_message() );
		} else {
			$order->add_order_note( sprintf( 'Accounting invoice #%d posted (journal #%d).', $id, $posted ) );
			// Stock out.
			$wh = (int) Accounting_Config::get()['default_warehouse_id'];
			if ( $wh ) {
				$stock_items = array();
				foreach ( $lines as $line ) {
					if ( ! empty( $line['product_id'] ) ) {
						$stock_items[] = array( 'product_id' => $line['product_id'], 'qty' => $line['qty'] );
					}
				}
				if ( $stock_items ) {
					Accounting_Warehouses::create_document(
						array(
							'type'          => 'out',
							'warehouse_id'  => $wh,
							'reference'     => 'WC-' . $order->get_id(),
							'document_date' => gmdate( 'Y-m-d' ),
						),
						$stock_items
					);
				}
			}
		}

		if ( ! empty( Accounting_Config::get()['auto_send_moadian'] ) ) {
			Accounting_Moadian::enqueue_send( $id );
		}

		if ( class_exists( 'Accounting_Hesabfa', false ) ) {
			Accounting_Hesabfa::enqueue_invoice( (int) $id );
		}

		return $id;
	}

	/**
	 * Reverse accounting for refunded order.
	 *
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function sync_refund( WC_Order $order ) {
		global $wpdb;
		$table = Accounting_Db::table( 'invoices' );
		$inv_id = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE wc_order_id = %d LIMIT 1", $order->get_id() ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( ! $inv_id ) {
			return;
		}
		$jt = Accounting_Db::table( 'journal_entries' );
		$jid = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$jt} WHERE source = 'invoice' AND source_id = %d AND status = 'posted' LIMIT 1", $inv_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $jid ) {
			Accounting_Journal::reverse( $jid );
		}
		Accounting_Db::update( 'invoices', $inv_id, array( 'status' => 'refunded', 'moadian_status' => 'cancel_pending' ) );
		Accounting_Moadian::enqueue_send( $inv_id, 'cancel' );
		if ( class_exists( 'Accounting_Hesabfa_Sync', false ) && Accounting_Hesabfa_Sync::enabled() ) {
			// Create local sale_return then push, or enqueue return against mapped invoice.
			$map = Accounting_Hesabfa_Sync::get_map( 'invoice', $inv_id );
			if ( $map ) {
				$orig = Accounting_Invoices::get( $inv_id );
				if ( ! is_wp_error( $orig ) ) {
					$ret = Accounting_Invoices::create(
						array(
							'type'          => 'sale_return',
							'person_id'     => $orig['person_id'] ?? null,
							'document_date' => gmdate( 'Y-m-d' ),
							'status'        => 'draft',
							'number'        => 'RET-' . ( $orig['number'] ?? $inv_id ),
						),
						(array) ( $orig['lines'] ?? array() )
					);
					if ( ! is_wp_error( $ret ) ) {
						Accounting_Hesabfa_Sync::enqueue( 'push', 'invoice', (int) $ret );
					}
				}
			}
		}
	}

	/**
	 * Backfill recent orders.
	 *
	 * @param int $limit Limit.
	 * @return array{synced:int,errors:array<int,string>}
	 */
	public static function backfill( $limit = 50 ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return array( 'synced' => 0, 'errors' => array( 'WooCommerce missing' ) );
		}
		$statuses = Accounting_Config::get()['sync_order_statuses'];
		$orders   = wc_get_orders(
			array(
				'limit'  => max( 1, min( 200, (int) $limit ) ),
				'status' => $statuses,
				'orderby'=> 'date',
				'order'  => 'DESC',
			)
		);
		$synced = 0;
		$errors = array();
		foreach ( $orders as $order ) {
			$res = self::sync_order( $order );
			if ( is_wp_error( $res ) ) {
				$errors[] = '#' . $order->get_id() . ': ' . $res->get_error_message();
			} else {
				++$synced;
			}
		}
		return array( 'synced' => $synced, 'errors' => $errors );
	}
}
