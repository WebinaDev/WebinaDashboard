<?php
/**
 * Cash accounts, receipts/payments, checks.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Treasury.
 */
final class Accounting_Treasury {

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_cash_accounts( array $args = array() ) {
		$args['search_cols'] = array( 'name', 'account_number', 'sheba' );
		return Accounting_Db::list_rows( 'cash_accounts', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_cash_account( array $data ) {
		$name = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		if ( '' === $name ) {
			return new WP_Error( 'acc_cash_name', __( 'Cash account name is required.', 'webino-dashboard' ) );
		}
		return Accounting_Db::insert(
			'cash_accounts',
			array(
				'name'             => $name,
				'type'             => sanitize_key( (string) ( $data['type'] ?? 'bank' ) ),
				'bank_name'        => sanitize_text_field( (string) ( $data['bank_name'] ?? '' ) ),
				'account_number'   => sanitize_text_field( (string) ( $data['account_number'] ?? '' ) ),
				'sheba'            => sanitize_text_field( (string) ( $data['sheba'] ?? '' ) ),
				'card_number'      => sanitize_text_field( (string) ( $data['card_number'] ?? '' ) ),
				'chart_account_id' => ! empty( $data['chart_account_id'] ) ? absint( $data['chart_account_id'] ) : null,
				'is_active'        => 1,
				'is_default'       => (int) ! empty( $data['is_default'] ),
			)
		);
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_vouchers( array $args = array() ) {
		$args['search_cols'] = array( 'number', 'description' );
		return Accounting_Db::list_rows( 'receipt_vouchers', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_voucher( array $data ) {
		$amount = (float) ( $data['amount'] ?? 0 );
		if ( $amount <= 0 ) {
			return new WP_Error( 'acc_voucher_amount', __( 'Amount must be positive.', 'webino-dashboard' ) );
		}
		$date = sanitize_text_field( (string) ( $data['document_date'] ?? gmdate( 'Y-m-d' ) ) );
		$type = sanitize_key( (string) ( $data['type'] ?? 'receipt' ) );
		$id   = Accounting_Db::insert(
			'receipt_vouchers',
			array(
				'type'             => $type,
				'number'           => sanitize_text_field( (string) ( $data['number'] ?? ( 'RV-' . time() ) ) ),
				'fiscal_year_id'   => Accounting_Fiscal::active_id( $date ) ?: null,
				'cash_account_id'  => ! empty( $data['cash_account_id'] ) ? absint( $data['cash_account_id'] ) : null,
				'person_id'        => ! empty( $data['person_id'] ) ? absint( $data['person_id'] ) : null,
				'amount'           => $amount,
				'document_date'    => $date,
				'status'           => 'draft',
				'description'      => sanitize_textarea_field( (string) ( $data['description'] ?? '' ) ),
				'project_id'       => ! empty( $data['project_id'] ) ? absint( $data['project_id'] ) : null,
				'created_by'       => get_current_user_id() ?: null,
			)
		);
		if ( ! is_wp_error( $id ) ) {
			do_action( 'webino_acc_voucher_saved', (int) $id );
		}
		return $id;
	}

	/**
	 * Post receipt/payment voucher.
	 *
	 * @param int $id Voucher ID.
	 * @return int|WP_Error
	 */
	public static function post_voucher( $id ) {
		$v = Accounting_Db::get_row( 'receipt_vouchers', $id );
		if ( ! $v ) {
			return new WP_Error( 'acc_not_found', __( 'Voucher not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( 'posted' === $v['status'] ) {
			return new WP_Error( 'acc_already_posted', __( 'Voucher already posted.', 'webino-dashboard' ) );
		}
		$cash_row = $v['cash_account_id'] ? Accounting_Db::get_row( 'cash_accounts', (int) $v['cash_account_id'] ) : null;
		$cash_acc = $cash_row && ! empty( $cash_row['chart_account_id'] )
			? (int) $cash_row['chart_account_id']
			: ( Accounting_Chart::mapped_id( 'bank' ) ?: Accounting_Chart::mapped_id( 'cash' ) );
		$party = Accounting_Chart::mapped_id( 'receivables' );
		if ( 'payment' === $v['type'] ) {
			$party = Accounting_Chart::mapped_id( 'payables' );
		}
		if ( ! $cash_acc || ! $party ) {
			return new WP_Error( 'acc_map', __( 'Cash/party accounts not mapped.', 'webino-dashboard' ) );
		}
		$amount = (float) $v['amount'];
		if ( 'receipt' === $v['type'] ) {
			$jl = array(
				array( 'account_id' => $cash_acc, 'debit' => $amount, 'credit' => 0 ),
				array( 'account_id' => $party, 'debit' => 0, 'credit' => $amount, 'person_id' => $v['person_id'], 'project_id' => $v['project_id'] ),
			);
		} else {
			$jl = array(
				array( 'account_id' => $party, 'debit' => $amount, 'credit' => 0, 'person_id' => $v['person_id'], 'project_id' => $v['project_id'] ),
				array( 'account_id' => $cash_acc, 'debit' => 0, 'credit' => $amount ),
			);
		}
		$jid = Accounting_Journal::create(
			array(
				'document_date' => (string) $v['document_date'],
				'description'   => sprintf( '%s %s', $v['type'], $v['number'] ),
				'source'        => 'receipt',
				'source_id'     => $id,
			),
			$jl,
			true
		);
		if ( is_wp_error( $jid ) ) {
			return $jid;
		}
		Accounting_Db::update( 'receipt_vouchers', $id, array( 'status' => 'posted' ) );
		return $jid;
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_checks( array $args = array() ) {
		$args['search_cols'] = array( 'number', 'bank' );
		return Accounting_Db::list_rows( 'checks', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_check( array $data ) {
		$amount = (float) ( $data['amount'] ?? 0 );
		if ( $amount <= 0 ) {
			return new WP_Error( 'acc_check_amount', __( 'Check amount must be positive.', 'webino-dashboard' ) );
		}
		return Accounting_Db::insert(
			'checks',
			array(
				'type'            => sanitize_key( (string) ( $data['type'] ?? 'receivable' ) ),
				'number'          => sanitize_text_field( (string) ( $data['number'] ?? '' ) ),
				'bank'            => sanitize_text_field( (string) ( $data['bank'] ?? '' ) ),
				'amount'          => $amount,
				'due_date'        => sanitize_text_field( (string) ( $data['due_date'] ?? '' ) ) ?: null,
				'status'          => sanitize_key( (string) ( $data['status'] ?? 'pending' ) ),
				'cash_account_id' => ! empty( $data['cash_account_id'] ) ? absint( $data['cash_account_id'] ) : null,
				'person_id'       => ! empty( $data['person_id'] ) ? absint( $data['person_id'] ) : null,
			)
		);
	}

	/**
	 * Update check status (cleared / bounced).
	 *
	 * @param int    $id     ID.
	 * @param string $status Status.
	 * @return true|WP_Error
	 */
	public static function set_check_status( $id, $status ) {
		$status = sanitize_key( $status );
		if ( ! in_array( $status, array( 'pending', 'cleared', 'bounced' ), true ) ) {
			return new WP_Error( 'acc_check_status', __( 'Invalid check status.', 'webino-dashboard' ) );
		}
		return Accounting_Db::update( 'checks', $id, array( 'status' => $status ) );
	}
}
