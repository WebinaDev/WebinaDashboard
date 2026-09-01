<?php
/**
 * Projects and cost centers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Projects.
 */
final class Accounting_Projects {

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_projects( array $args = array() ) {
		$args['search_cols'] = array( 'code', 'name' );
		return Accounting_Db::list_rows( 'projects', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_project( array $data ) {
		$name = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		if ( '' === $name ) {
			return new WP_Error( 'acc_project_name', __( 'Project name is required.', 'webino-dashboard' ) );
		}
		return Accounting_Db::insert(
			'projects',
			array(
				'code'      => sanitize_text_field( (string) ( $data['code'] ?? '' ) ),
				'name'      => $name,
				'status'    => sanitize_key( (string) ( $data['status'] ?? 'open' ) ),
				'budget'    => (float) ( $data['budget'] ?? 0 ),
				'person_id' => ! empty( $data['person_id'] ) ? absint( $data['person_id'] ) : null,
				'starts_on' => sanitize_text_field( (string) ( $data['starts_on'] ?? '' ) ) ?: null,
				'ends_on'   => sanitize_text_field( (string) ( $data['ends_on'] ?? '' ) ) ?: null,
			)
		);
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_cost_centers( array $args = array() ) {
		$args['search_cols'] = array( 'code', 'name' );
		return Accounting_Db::list_rows( 'cost_centers', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_cost_center( array $data ) {
		$name = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		if ( '' === $name ) {
			return new WP_Error( 'acc_cc_name', __( 'Cost center name is required.', 'webino-dashboard' ) );
		}
		return Accounting_Db::insert(
			'cost_centers',
			array(
				'code'      => sanitize_text_field( (string) ( $data['code'] ?? '' ) ),
				'name'      => $name,
				'is_active' => 1,
			)
		);
	}

	/**
	 * Simple P&L for a project from journal lines.
	 *
	 * @param int $project_id Project.
	 * @return array<string,float>
	 */
	public static function profit_summary( $project_id ) {
		global $wpdb;
		$lt = Accounting_Db::table( 'journal_lines' );
		$at = Accounting_Db::table( 'chart_accounts' );
		$jt = Accounting_Db::table( 'journal_entries' );
		$sql = "SELECT a.type, SUM(l.debit) AS debit, SUM(l.credit) AS credit
			FROM {$lt} l
			INNER JOIN {$jt} j ON j.id = l.journal_entry_id AND j.status = 'posted'
			INNER JOIN {$at} a ON a.id = l.account_id
			WHERE l.project_id = %d
			GROUP BY a.type";
		$rows = $wpdb->get_results( $wpdb->prepare( $sql, absint( $project_id ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$income = 0.0;
		$expense = 0.0;
		foreach ( (array) $rows as $row ) {
			if ( 'income' === $row['type'] ) {
				$income += (float) $row['credit'] - (float) $row['debit'];
			}
			if ( 'expense' === $row['type'] ) {
				$expense += (float) $row['debit'] - (float) $row['credit'];
			}
		}
		return array(
			'income'  => $income,
			'expense' => $expense,
			'profit'  => $income - $expense,
		);
	}
}
