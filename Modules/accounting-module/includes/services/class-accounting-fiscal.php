<?php
/**
 * Fiscal year service.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fiscal years.
 */
final class Accounting_Fiscal {

	/**
	 * Active (open) fiscal year covering a date.
	 *
	 * @param string|null $date Y-m-d.
	 * @return array<string,mixed>|null
	 */
	public static function active( $date = null ) {
		global $wpdb;
		$date  = $date ? sanitize_text_field( (string) $date ) : gmdate( 'Y-m-d' );
		$table = Accounting_Db::table( 'fiscal_years' );
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE is_closed = 0 AND starts_on <= %s AND ends_on >= %s ORDER BY id DESC LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$date,
				$date
			),
			ARRAY_A
		);
		return is_array( $row ) ? $row : null;
	}

	/**
	 * @param string|null $date Date.
	 * @return int
	 */
	public static function active_id( $date = null ) {
		$fy = self::active( $date );
		return $fy ? (int) $fy['id'] : 0;
	}

	/**
	 * Ensure date falls in an open fiscal year.
	 *
	 * @param string $date Date.
	 * @return true|WP_Error
	 */
	public static function assert_open( $date ) {
		$fy = self::active( $date );
		if ( ! $fy ) {
			return new WP_Error( 'acc_fy_closed', __( 'No open fiscal year for this date.', 'webino-dashboard' ) );
		}
		return true;
	}

	/**
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_all( array $args = array() ) {
		$args['order'] = 'starts_on DESC';
		return Accounting_Db::list_rows( 'fiscal_years', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create( array $data ) {
		$title = sanitize_text_field( (string) ( $data['title'] ?? '' ) );
		$start = sanitize_text_field( (string) ( $data['starts_on'] ?? '' ) );
		$end   = sanitize_text_field( (string) ( $data['ends_on'] ?? '' ) );
		if ( '' === $title || '' === $start || '' === $end ) {
			return new WP_Error( 'acc_fy_invalid', __( 'Title and dates are required.', 'webino-dashboard' ) );
		}
		return Accounting_Db::insert(
			'fiscal_years',
			array(
				'title'     => $title,
				'starts_on' => $start,
				'ends_on'   => $end,
				'is_closed' => 0,
			)
		);
	}

	/**
	 * Close fiscal year.
	 *
	 * @param int $id ID.
	 * @return true|WP_Error
	 */
	public static function close( $id ) {
		$row = Accounting_Db::get_row( 'fiscal_years', $id );
		if ( ! $row ) {
			return new WP_Error( 'acc_not_found', __( 'Fiscal year not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return Accounting_Db::update( 'fiscal_years', $id, array( 'is_closed' => 1 ) );
	}
}
