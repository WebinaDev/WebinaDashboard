<?php
/**
 * Operating expenses.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Expenses CRUD + GL.
 */
final class Accounting_Expenses {

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_all( array $args = array() ) {
		$args['search_cols'] = array( 'number', 'description' );
		return Accounting_Db::list_rows( 'expenses', $args );
	}

	/**
	 * @param int $id ID.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function get( $id ) {
		$row = Accounting_Db::get_row( 'expenses', $id );
		if ( ! $row ) {
			return new WP_Error( 'acc_not_found', __( 'Expense not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		global $wpdb;
		$lt = Accounting_Db::table( 'expense_lines' );
		$lines = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$lt} WHERE expense_id = %d", absint( $id ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row['lines'] = is_array( $lines ) ? $lines : array();
		return $row;
	}

	/**
	 * @param array<string,mixed>            $header Header.
	 * @param array<int,array<string,mixed>> $lines  Lines.
	 * @return int|WP_Error
	 */
	public static function create( array $header, array $lines = array() ) {
		$total = 0.0;
		$tax   = 0.0;
		$norm  = array();
		foreach ( $lines as $line ) {
			$amt = (float) ( $line['amount'] ?? 0 );
			$vat = (float) ( $line['vat_amount'] ?? 0 );
			$total += $amt;
			$tax   += $vat;
			$norm[] = array(
				'account_id'  => ! empty( $line['account_id'] )
					? absint( $line['account_id'] )
					: ( Accounting_Chart::mapped_id( 'cogs' ) ?: null ),
				'description' => sanitize_text_field( (string) ( $line['description'] ?? '' ) ),
				'amount'      => $amt,
				'vat_amount'  => $vat,
			);
		}
		$date = sanitize_text_field( (string) ( $header['document_date'] ?? gmdate( 'Y-m-d' ) ) );
		$id   = Accounting_Db::insert(
			'expenses',
			array(
				'number'         => sanitize_text_field( (string) ( $header['number'] ?? ( 'EX-' . time() ) ) ),
				'fiscal_year_id' => Accounting_Fiscal::active_id( $date ) ?: null,
				'person_id'      => ! empty( $header['person_id'] ) ? absint( $header['person_id'] ) : null,
				'document_date'  => $date,
				'status'         => 'draft',
				'total'          => $total + $tax,
				'tax'            => $tax,
				'description'    => sanitize_textarea_field( (string) ( $header['description'] ?? '' ) ),
				'project_id'     => ! empty( $header['project_id'] ) ? absint( $header['project_id'] ) : null,
				'created_by'     => get_current_user_id() ?: null,
			)
		);
		if ( is_wp_error( $id ) ) {
			return $id;
		}
		foreach ( $norm as $line ) {
			$line['expense_id'] = $id;
			Accounting_Db::insert( 'expense_lines', $line );
		}
		return $id;
	}

	/**
	 * @param int $id Expense ID.
	 * @return int|WP_Error Journal ID.
	 */
	public static function post( $id ) {
		$ex = self::get( $id );
		if ( is_wp_error( $ex ) ) {
			return $ex;
		}
		if ( 'posted' === $ex['status'] ) {
			return new WP_Error( 'acc_already_posted', __( 'Expense already posted.', 'webino-dashboard' ) );
		}
		$cash = Accounting_Chart::mapped_id( 'bank' ) ?: Accounting_Chart::mapped_id( 'cash' );
		$jl   = array();
		$sum  = 0.0;
		foreach ( $ex['lines'] as $line ) {
			$amt = (float) $line['amount'] + (float) $line['vat_amount'];
			$sum += $amt;
			$aid = absint( $line['account_id'] ) ?: Accounting_Chart::mapped_id( 'cogs' );
			if ( $aid ) {
				$jl[] = array(
					'account_id'  => $aid,
					'debit'       => $amt,
					'credit'      => 0,
					'description' => (string) $line['description'],
					'project_id'  => $ex['project_id'],
				);
			}
		}
		if ( ! $cash || $sum <= 0 ) {
			return new WP_Error( 'acc_expense_post', __( 'Cannot post expense.', 'webino-dashboard' ) );
		}
		$jl[] = array( 'account_id' => $cash, 'debit' => 0, 'credit' => $sum, 'person_id' => $ex['person_id'] );
		$jid  = Accounting_Journal::create(
			array(
				'document_date' => (string) $ex['document_date'],
				'description'   => sprintf( 'Expense %s', $ex['number'] ),
				'source'        => 'expense',
				'source_id'     => $id,
			),
			$jl,
			true
		);
		if ( is_wp_error( $jid ) ) {
			return $jid;
		}
		Accounting_Db::update( 'expenses', $id, array( 'status' => 'posted' ) );
		return $jid;
	}
}
