<?php
/**
 * Warehouses and stock documents.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Warehouse ops (compatible with Digikala stock writers).
 */
final class Accounting_Warehouses {

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_warehouses( array $args = array() ) {
		$args['search_cols'] = array( 'name' );
		return Accounting_Db::list_rows( 'warehouses', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_warehouse( array $data ) {
		$name = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		if ( '' === $name ) {
			return new WP_Error( 'acc_wh_name', __( 'Warehouse name is required.', 'webino-dashboard' ) );
		}
		return Accounting_Db::insert(
			'warehouses',
			array(
				'name'       => $name,
				'address'    => sanitize_textarea_field( (string) ( $data['address'] ?? '' ) ),
				'is_default' => (int) ! empty( $data['is_default'] ),
				'is_active'  => 1,
			)
		);
	}

	/**
	 * Adjust stock quantity for acc product.
	 *
	 * @param int   $warehouse_id Warehouse.
	 * @param int   $product_id   Acc product ID.
	 * @param float $delta        Signed qty.
	 * @return true|WP_Error
	 */
	public static function adjust_stock( $warehouse_id, $product_id, $delta ) {
		global $wpdb;
		$table = Accounting_Db::table( 'warehouse_stock' );
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE warehouse_id = %d AND product_id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				absint( $warehouse_id ),
				absint( $product_id )
			),
			ARRAY_A
		);
		$qty = (float) ( $row['quantity'] ?? 0 ) + (float) $delta;
		if ( $row ) {
			return Accounting_Db::update( 'warehouse_stock', (int) $row['id'], array( 'quantity' => $qty ) );
		}
		$ins = Accounting_Db::insert(
			'warehouse_stock',
			array(
				'warehouse_id' => absint( $warehouse_id ),
				'product_id'   => absint( $product_id ),
				'quantity'     => $qty,
			)
		);
		return is_wp_error( $ins ) ? $ins : true;
	}

	/**
	 * Issue stock document (in/out/transfer).
	 *
	 * @param array<string,mixed>            $header Header.
	 * @param array<int,array<string,mixed>> $items  Items product_id, qty.
	 * @return int|WP_Error
	 */
	public static function create_document( array $header, array $items ) {
		$type = sanitize_key( (string) ( $header['type'] ?? 'out' ) );
		$wh   = absint( $header['warehouse_id'] ?? Accounting_Config::get()['default_warehouse_id'] );
		if ( ! $wh ) {
			return new WP_Error( 'acc_wh_missing', __( 'Warehouse is required.', 'webino-dashboard' ) );
		}
		$id = Accounting_Db::insert(
			'warehouse_documents',
			array(
				'type'          => $type,
				'warehouse_id'  => $wh,
				'number'        => sanitize_text_field( (string) ( $header['number'] ?? ( 'WH-' . time() ) ) ),
				'document_date' => sanitize_text_field( (string) ( $header['document_date'] ?? gmdate( 'Y-m-d' ) ) ),
				'status'        => 'posted',
				'reference'     => sanitize_text_field( (string) ( $header['reference'] ?? '' ) ),
				'items'         => wp_json_encode( $items ),
				'notes'         => sanitize_textarea_field( (string) ( $header['notes'] ?? '' ) ),
				'created_by'    => get_current_user_id() ?: null,
			)
		);
		if ( is_wp_error( $id ) ) {
			return $id;
		}
		foreach ( $items as $item ) {
			$pid = absint( $item['product_id'] ?? 0 );
			$qty = (float) ( $item['qty'] ?? 0 );
			if ( ! $pid || $qty == 0.0 ) { // phpcs:ignore Universal.Operators.StrictComparisons.LooseEqual
				continue;
			}
			$delta = ( 'in' === $type ) ? abs( $qty ) : -abs( $qty );
			self::adjust_stock( $wh, $pid, $delta );
		}
		if ( class_exists( 'Webino_Dashboard_SMS_Warehouse_Stock', false ) ) {
			do_action( 'webino_acc_warehouse_stock_changed', $wh );
		}
		do_action( 'webino_acc_warehouse_doc_saved', (int) $id );
		return $id;
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_stock( array $args = array() ) {
		return Accounting_Db::list_rows( 'warehouse_stock', $args );
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_documents( array $args = array() ) {
		$args['search_cols'] = array( 'number', 'reference' );
		return Accounting_Db::list_rows( 'warehouse_documents', $args );
	}
}
