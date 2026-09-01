<?php
/**
 * Sales / purchase / proforma invoices.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Invoices + lines + GL posting.
 */
final class Accounting_Invoices {

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_all( array $args = array() ) {
		$args['search_cols'] = array( 'number', 'taxid' );
		return Accounting_Db::list_rows( 'invoices', $args );
	}

	/**
	 * @param int $id Invoice ID.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function get( $id ) {
		$inv = Accounting_Db::get_row( 'invoices', $id );
		if ( ! $inv ) {
			return new WP_Error( 'acc_not_found', __( 'Invoice not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		global $wpdb;
		$lt = Accounting_Db::table( 'invoice_lines' );
		$lines = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$lt} WHERE invoice_id = %d ORDER BY id ASC", absint( $id ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$inv['lines'] = is_array( $lines ) ? $lines : array();
		return $inv;
	}

	/**
	 * Create invoice with lines.
	 *
	 * @param array<string,mixed>            $header Header.
	 * @param array<int,array<string,mixed>> $lines  Lines.
	 * @return int|WP_Error
	 */
	public static function create( array $header, array $lines = array() ) {
		$type = sanitize_key( (string) ( $header['type'] ?? 'sale' ) );
		$date = sanitize_text_field( (string) ( $header['document_date'] ?? gmdate( 'Y-m-d' ) ) );
		$sub  = 0.0;
		$tax  = 0.0;
		$norm = array();
		foreach ( $lines as $line ) {
			$qty   = max( 0, (float) ( $line['qty'] ?? 1 ) );
			$price = (float) ( $line['unit_price'] ?? 0 );
			$disc  = (float) ( $line['discount'] ?? 0 );
			$rate  = (float) ( $line['vat_rate'] ?? Accounting_Config::get()['default_vat_rate'] );
			$base  = max( 0, ( $qty * $price ) - $disc );
			$vat   = round( $base * $rate / 100, 2 );
			$sub  += $base;
			$tax  += $vat;
			$norm[] = array(
				'product_id'    => ! empty( $line['product_id'] ) ? absint( $line['product_id'] ) : null,
				'wc_product_id' => ! empty( $line['wc_product_id'] ) ? absint( $line['wc_product_id'] ) : null,
				'description'   => sanitize_text_field( (string) ( $line['description'] ?? '' ) ),
				'sstid'         => sanitize_text_field( (string) ( $line['sstid'] ?? '' ) ),
				'qty'           => $qty,
				'unit_price'    => $price,
				'discount'      => $disc,
				'vat_rate'      => $rate,
				'vat_amount'    => $vat,
				'line_total'    => $base + $vat,
				'cogs'          => (float) ( $line['cogs'] ?? 0 ),
			);
		}

		$id = Accounting_Db::insert(
			'invoices',
			array(
				'type'             => $type,
				'number'           => sanitize_text_field( (string) ( $header['number'] ?? self::next_number( $type ) ) ),
				'fiscal_year_id'   => Accounting_Fiscal::active_id( $date ) ?: null,
				'person_id'        => ! empty( $header['person_id'] ) ? absint( $header['person_id'] ) : null,
				'document_date'    => $date,
				'status'           => sanitize_key( (string) ( $header['status'] ?? 'draft' ) ),
				'items'            => wp_json_encode( $norm ),
				'subtotal'         => $sub,
				'tax'              => $tax,
				'total'            => $sub + $tax,
				'wc_order_id'      => ! empty( $header['wc_order_id'] ) ? absint( $header['wc_order_id'] ) : null,
				'inty'             => absint( $header['inty'] ?? Accounting_Config::get()['default_invoice_type'] ),
				'inp'              => absint( $header['inp'] ?? 1 ),
				'ins'              => absint( $header['ins'] ?? 1 ),
				'moadian_status'   => sanitize_key( (string) ( $header['moadian_status'] ?? 'none' ) ),
				'buyer_json'       => isset( $header['buyer_json'] ) ? wp_json_encode( $header['buyer_json'] ) : null,
				'correction_of_id' => ! empty( $header['correction_of_id'] ) ? absint( $header['correction_of_id'] ) : null,
				'purchase_type'    => sanitize_key( (string) ( $header['purchase_type'] ?? '' ) ),
				'project_id'       => ! empty( $header['project_id'] ) ? absint( $header['project_id'] ) : null,
				'created_by'       => get_current_user_id() ?: null,
			)
		);
		if ( is_wp_error( $id ) ) {
			return $id;
		}
		foreach ( $norm as $line ) {
			$line['invoice_id'] = $id;
			Accounting_Db::insert( 'invoice_lines', $line );
		}
		do_action( 'webino_acc_invoice_saved', (int) $id );
		return $id;
	}

	/**
	 * Post sale invoice to GL (skip proforma).
	 *
	 * @param int $id Invoice ID.
	 * @return int|WP_Error Journal ID.
	 */
	public static function post_to_gl( $id ) {
		$inv = self::get( $id );
		if ( is_wp_error( $inv ) ) {
			return $inv;
		}
		if ( 'proforma' === $inv['type'] ) {
			return new WP_Error( 'acc_proforma', __( 'Proforma invoices are not posted to GL or Moadian.', 'webino-dashboard' ) );
		}
		if ( 'posted' === $inv['status'] ) {
			return new WP_Error( 'acc_already_posted', __( 'Invoice already posted.', 'webino-dashboard' ) );
		}

		$total = (float) $inv['total'];
		$tax   = (float) $inv['tax'];
		$net   = (float) $inv['subtotal'];
		$lines = array();

		if ( 'sale' === $inv['type'] || 'sales' === $inv['type'] ) {
			$recv = Accounting_Chart::mapped_id( 'gateway' ) ?: Accounting_Chart::mapped_id( 'bank' ) ?: Accounting_Chart::mapped_id( 'receivables' );
			$sales = Accounting_Chart::mapped_id( 'sales' );
			$vat   = Accounting_Chart::mapped_id( 'vat_payable' );
			if ( ! $recv || ! $sales ) {
				return new WP_Error( 'acc_map', __( 'Sales/bank accounts are not mapped.', 'webino-dashboard' ) );
			}
			$lines[] = array( 'account_id' => $recv, 'debit' => $total, 'credit' => 0, 'person_id' => $inv['person_id'], 'project_id' => $inv['project_id'] );
			$lines[] = array( 'account_id' => $sales, 'debit' => 0, 'credit' => $net, 'project_id' => $inv['project_id'] );
			if ( $tax > 0 && $vat ) {
				$lines[] = array( 'account_id' => $vat, 'debit' => 0, 'credit' => $tax );
			}
			$cogs_total = 0.0;
			foreach ( $inv['lines'] as $il ) {
				$cogs_total += (float) ( $il['cogs'] ?? 0 ) * (float) ( $il['qty'] ?? 1 );
			}
			if ( $cogs_total > 0 ) {
				$cogs_acc = Accounting_Chart::mapped_id( 'cogs' );
				$inv_acc  = Accounting_Chart::mapped_id( 'inventory' );
				if ( $cogs_acc && $inv_acc ) {
					$lines[] = array( 'account_id' => $cogs_acc, 'debit' => $cogs_total, 'credit' => 0 );
					$lines[] = array( 'account_id' => $inv_acc, 'debit' => 0, 'credit' => $cogs_total );
				}
			}
		} elseif ( 'purchase' === $inv['type'] ) {
			$inv_acc = Accounting_Chart::mapped_id( 'inventory' );
			$pay     = Accounting_Chart::mapped_id( 'payables' );
			$vat     = Accounting_Chart::mapped_id( 'vat_payable' );
			if ( ! $inv_acc || ! $pay ) {
				return new WP_Error( 'acc_map', __( 'Inventory/payables accounts are not mapped.', 'webino-dashboard' ) );
			}
			$lines[] = array( 'account_id' => $inv_acc, 'debit' => $net, 'credit' => 0, 'project_id' => $inv['project_id'] );
			if ( $tax > 0 && $vat ) {
				$lines[] = array( 'account_id' => $vat, 'debit' => $tax, 'credit' => 0 );
			}
			$lines[] = array( 'account_id' => $pay, 'debit' => 0, 'credit' => $total, 'person_id' => $inv['person_id'] );
		} else {
			return new WP_Error( 'acc_invoice_type', __( 'Unsupported invoice type for GL.', 'webino-dashboard' ) );
		}

		$jid = Accounting_Journal::create(
			array(
				'document_date' => (string) $inv['document_date'],
				'description'   => sprintf( 'Invoice %s', $inv['number'] ),
				'source'        => 'invoice',
				'source_id'     => $id,
			),
			$lines,
			true
		);
		if ( is_wp_error( $jid ) ) {
			return $jid;
		}
		Accounting_Db::update( 'invoices', $id, array( 'status' => 'posted' ) );
		return $jid;
	}

	/**
	 * @param string $type Type.
	 * @return string
	 */
	private static function next_number( $type ) {
		global $wpdb;
		$table = Accounting_Db::table( 'invoices' );
		$max   = (int) $wpdb->get_var( "SELECT MAX(id) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$prefix = 'purchase' === $type ? 'PI-' : ( 'proforma' === $type ? 'PF-' : 'SI-' );
		return $prefix . str_pad( (string) ( $max + 1 ), 6, '0', STR_PAD_LEFT );
	}
}
