<?php
/**
 * Installments and ras-giri helpers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Customer / supplier installment schedules.
 */
final class Accounting_Installments {

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list( array $args = array() ) {
		return Accounting_Db::paginate( 'installments', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create( array $data ) {
		$person = absint( $data['person_id'] ?? 0 );
		$amount = (float) ( $data['amount'] ?? 0 );
		$due    = sanitize_text_field( (string) ( $data['due_on'] ?? '' ) );
		if ( ! $person || $amount <= 0 || '' === $due ) {
			return new WP_Error( 'acc_inst_invalid', __( 'Person, amount and due date are required.', 'webino-dashboard' ) );
		}
		return Accounting_Db::insert(
			'installments',
			array(
				'person_id'      => $person,
				'invoice_id'     => ! empty( $data['invoice_id'] ) ? absint( $data['invoice_id'] ) : null,
				'direction'      => sanitize_key( (string) ( $data['direction'] ?? 'receivable' ) ),
				'due_on'         => $due,
				'amount'         => $amount,
				'paid_amount'    => (float) ( $data['paid_amount'] ?? 0 ),
				'status'         => sanitize_key( (string) ( $data['status'] ?? 'open' ) ),
				'interest_rate'  => (float) ( $data['interest_rate'] ?? 0 ),
				'notes'          => sanitize_textarea_field( (string) ( $data['notes'] ?? '' ) ),
			)
		);
	}

	/**
	 * Create equal installments from total.
	 *
	 * @param array<string,mixed> $data Data.
	 * @return array<int,int>|WP_Error IDs.
	 */
	public static function schedule( array $data ) {
		$count = max( 1, (int) ( $data['count'] ?? 1 ) );
		$total = (float) ( $data['total'] ?? 0 );
		$start = sanitize_text_field( (string) ( $data['start_on'] ?? gmdate( 'Y-m-d' ) ) );
		if ( $total <= 0 ) {
			return new WP_Error( 'acc_inst_total', __( 'Installment total is required.', 'webino-dashboard' ) );
		}
		$each = round( $total / $count, 2 );
		$ids  = array();
		$ts   = strtotime( $start ) ?: time();
		for ( $i = 0; $i < $count; $i++ ) {
			$row             = $data;
			$row['amount']   = ( $i === $count - 1 ) ? ( $total - ( $each * ( $count - 1 ) ) ) : $each;
			$row['due_on']   = gmdate( 'Y-m-d', strtotime( '+' . $i . ' month', $ts ) );
			$id              = self::create( $row );
			if ( is_wp_error( $id ) ) {
				return $id;
			}
			$ids[] = $id;
		}
		return $ids;
	}

	/**
	 * Ras-giri (weighted average due date) for open installments of a person.
	 *
	 * @param int $person_id Person.
	 * @return array{ras_date:string,total:float,weighted_days:float}
	 */
	public static function ras( $person_id ) {
		global $wpdb;
		$table = Accounting_Db::table( 'installments' );
		$rows  = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT due_on, amount, paid_amount FROM {$table} WHERE person_id = %d AND status = 'open'", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				absint( $person_id )
			),
			ARRAY_A
		);
		$total = 0.0;
		$wsum  = 0.0;
		$today = strtotime( gmdate( 'Y-m-d' ) );
		foreach ( (array) $rows as $r ) {
			$remain = max( 0, (float) $r['amount'] - (float) $r['paid_amount'] );
			if ( $remain <= 0 ) {
				continue;
			}
			$due = strtotime( (string) $r['due_on'] ) ?: $today;
			$days = ( $due - $today ) / DAY_IN_SECONDS;
			$total += $remain;
			$wsum  += $remain * $days;
		}
		$avg_days = $total > 0 ? ( $wsum / $total ) : 0;
		return array(
			'ras_date'       => gmdate( 'Y-m-d', $today + (int) round( $avg_days * DAY_IN_SECONDS ) ),
			'total'          => $total,
			'weighted_days'  => $avg_days,
		);
	}
}
