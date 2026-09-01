<?php
/**
 * Double-entry journal engine.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Journals and lines.
 */
final class Accounting_Journal {

	/**
	 * Create a balanced journal and optionally post it.
	 *
	 * @param array<string,mixed>              $header Header fields.
	 * @param array<int,array<string,mixed>>   $lines  Lines with account_id, debit, credit.
	 * @param bool                             $post   Post immediately.
	 * @return int|WP_Error Entry ID.
	 */
	public static function create( array $header, array $lines, $post = true ) {
		$date = sanitize_text_field( (string) ( $header['document_date'] ?? gmdate( 'Y-m-d' ) ) );
		$open = Accounting_Fiscal::assert_open( $date );
		if ( is_wp_error( $open ) ) {
			return $open;
		}

		$debit  = 0.0;
		$credit = 0.0;
		$clean  = array();
		foreach ( $lines as $line ) {
			$aid = absint( $line['account_id'] ?? 0 );
			$d   = round( (float) ( $line['debit'] ?? 0 ), 2 );
			$c   = round( (float) ( $line['credit'] ?? 0 ), 2 );
			if ( $aid <= 0 || ( $d <= 0 && $c <= 0 ) ) {
				continue;
			}
			if ( $d > 0 && $c > 0 ) {
				return new WP_Error( 'acc_journal_line', __( 'A line cannot have both debit and credit.', 'webino-dashboard' ) );
			}
			$debit  += $d;
			$credit += $c;
			$clean[] = array(
				'account_id'  => $aid,
				'debit'       => $d,
				'credit'      => $c,
				'description' => sanitize_text_field( (string) ( $line['description'] ?? '' ) ),
				'person_id'   => ! empty( $line['person_id'] ) ? absint( $line['person_id'] ) : null,
				'project_id'  => ! empty( $line['project_id'] ) ? absint( $line['project_id'] ) : null,
				'cost_center' => ! empty( $line['cost_center'] ) ? absint( $line['cost_center'] ) : null,
			);
		}

		if ( count( $clean ) < 2 ) {
			return new WP_Error( 'acc_journal_lines', __( 'Journal needs at least two lines.', 'webino-dashboard' ) );
		}
		if ( abs( $debit - $credit ) > 0.01 ) {
			return new WP_Error(
				'acc_journal_unbalanced',
				sprintf(
					/* translators: 1: debit 2: credit */
					__( 'Journal unbalanced: debit %1$s ≠ credit %2$s.', 'webino-dashboard' ),
					(string) $debit,
					(string) $credit
				)
			);
		}

		$fy_id = Accounting_Fiscal::active_id( $date );
		$entry_id = Accounting_Db::insert(
			'journal_entries',
			array(
				'fiscal_year_id' => $fy_id ?: null,
				'document_no'    => sanitize_text_field( (string) ( $header['document_no'] ?? self::next_number() ) ),
				'document_date'  => $date,
				'description'    => sanitize_textarea_field( (string) ( $header['description'] ?? '' ) ),
				'status'         => $post ? 'posted' : 'draft',
				'source'         => sanitize_key( (string) ( $header['source'] ?? 'manual' ) ),
				'source_id'      => ! empty( $header['source_id'] ) ? absint( $header['source_id'] ) : null,
				'created_by'     => get_current_user_id() ?: null,
			)
		);
		if ( is_wp_error( $entry_id ) ) {
			return $entry_id;
		}

		foreach ( $clean as $line ) {
			$line['journal_entry_id'] = $entry_id;
			$ins = Accounting_Db::insert( 'journal_lines', $line );
			if ( is_wp_error( $ins ) ) {
				return $ins;
			}
		}

		do_action( 'webino_acc_journal_saved', (int) $entry_id );
		return $entry_id;
	}

	/**
	 * Reverse a posted journal (for refunds).
	 *
	 * @param int    $entry_id Entry.
	 * @param string $date     Date.
	 * @return int|WP_Error New entry ID.
	 */
	public static function reverse( $entry_id, $date = null ) {
		$entry = Accounting_Db::get_row( 'journal_entries', $entry_id );
		if ( ! $entry || 'posted' !== $entry['status'] ) {
			return new WP_Error( 'acc_journal_reverse', __( 'Only posted journals can be reversed.', 'webino-dashboard' ) );
		}
		global $wpdb;
		$lt    = Accounting_Db::table( 'journal_lines' );
		$lines = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$lt} WHERE journal_entry_id = %d", absint( $entry_id ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rev   = array();
		foreach ( (array) $lines as $line ) {
			$rev[] = array(
				'account_id'  => (int) $line['account_id'],
				'debit'       => (float) $line['credit'],
				'credit'      => (float) $line['debit'],
				'description' => sprintf( 'REV #%d', $entry_id ),
				'person_id'   => $line['person_id'] ?? null,
				'project_id'  => $line['project_id'] ?? null,
			);
		}
		return self::create(
			array(
				'document_date' => $date ?: gmdate( 'Y-m-d' ),
				'description'   => sprintf( 'Reverse of journal #%d', $entry_id ),
				'source'        => 'reversal',
				'source_id'     => $entry_id,
			),
			$rev,
			true
		);
	}

	/**
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_entries( array $args = array() ) {
		$args['search_cols'] = array( 'document_no', 'description' );
		return Accounting_Db::list_rows( 'journal_entries', $args );
	}

	/**
	 * @param int $id Entry ID.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function get_with_lines( $id ) {
		$entry = Accounting_Db::get_row( 'journal_entries', $id );
		if ( ! $entry ) {
			return new WP_Error( 'acc_not_found', __( 'Journal not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		global $wpdb;
		$lt    = Accounting_Db::table( 'journal_lines' );
		$lines = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$lt} WHERE journal_entry_id = %d ORDER BY id ASC", absint( $id ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$entry['lines'] = is_array( $lines ) ? $lines : array();
		return $entry;
	}

	/**
	 * @param int $id Entry ID.
	 * @return true|WP_Error
	 */
	public static function post( $id ) {
		$entry = Accounting_Db::get_row( 'journal_entries', $id );
		if ( ! $entry ) {
			return new WP_Error( 'acc_not_found', __( 'Journal not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( 'posted' === $entry['status'] ) {
			return true;
		}
		$open = Accounting_Fiscal::assert_open( (string) $entry['document_date'] );
		if ( is_wp_error( $open ) ) {
			return $open;
		}
		$full = self::get_with_lines( $id );
		if ( is_wp_error( $full ) ) {
			return $full;
		}
		$d = 0.0;
		$c = 0.0;
		foreach ( $full['lines'] as $line ) {
			$d += (float) $line['debit'];
			$c += (float) $line['credit'];
		}
		if ( abs( $d - $c ) > 0.01 ) {
			return new WP_Error( 'acc_journal_unbalanced', __( 'Cannot post unbalanced journal.', 'webino-dashboard' ) );
		}
		return Accounting_Db::update( 'journal_entries', $id, array( 'status' => 'posted' ) );
	}

	/**
	 * @return string
	 */
	private static function next_number() {
		global $wpdb;
		$table = Accounting_Db::table( 'journal_entries' );
		$max   = (int) $wpdb->get_var( "SELECT MAX(id) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return 'JE-' . str_pad( (string) ( $max + 1 ), 6, '0', STR_PAD_LEFT );
	}
}
