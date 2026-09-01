<?php
/**
 * Production, shares, rules, backup, calculator, kardex, opening balances.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extra accounting operations (Hesabam parity helpers).
 */
final class Accounting_Extras {

	/**
	 * Kardex from warehouse documents + stock.
	 *
	 * @param int $product_id Product.
	 * @param int $warehouse_id Warehouse optional.
	 * @return array<int,array<string,mixed>>
	 */
	public static function kardex( $product_id, $warehouse_id = 0 ) {
		global $wpdb;
		$docs = Accounting_Db::table( 'warehouse_documents' );
		$sql  = "SELECT id, document_no, document_date, type, warehouse_id, lines_json, notes FROM {$docs} WHERE 1=1";
		$args = array();
		if ( $warehouse_id > 0 ) {
			$sql   .= ' AND warehouse_id = %d';
			$args[] = absint( $warehouse_id );
		}
		$sql .= ' ORDER BY document_date ASC, id ASC LIMIT 500';
		$rows = $args ? $wpdb->get_results( $wpdb->prepare( $sql, $args ), ARRAY_A ) : $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$out  = array();
		$bal  = 0.0;
		foreach ( (array) $rows as $doc ) {
			$lines = json_decode( (string) ( $doc['lines_json'] ?? '' ), true );
			if ( ! is_array( $lines ) ) {
				continue;
			}
			foreach ( $lines as $line ) {
				if ( (int) ( $line['product_id'] ?? 0 ) !== (int) $product_id ) {
					continue;
				}
				$qty = (float) ( $line['qty'] ?? 0 );
				$in  = in_array( (string) $doc['type'], array( 'in', 'transfer_in', 'opening' ), true );
				$delta = $in ? $qty : -1 * $qty;
				$bal  += $delta;
				$out[] = array(
					'document_id'   => (int) $doc['id'],
					'document_no'   => $doc['document_no'],
					'document_date' => $doc['document_date'],
					'type'          => $doc['type'],
					'qty_in'        => $in ? $qty : 0,
					'qty_out'       => $in ? 0 : $qty,
					'balance'       => $bal,
					'notes'         => $doc['notes'],
				);
			}
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_production( array $data ) {
		$output_id = absint( $data['output_product_id'] ?? 0 );
		$qty       = (float) ( $data['output_qty'] ?? 0 );
		$lines     = isset( $data['lines'] ) && is_array( $data['lines'] ) ? $data['lines'] : array();
		if ( ! $output_id || $qty <= 0 || ! $lines ) {
			return new WP_Error( 'acc_prod_invalid', __( 'Output product, qty and raw material lines are required.', 'webino-dashboard' ) );
		}
		$id = Accounting_Db::insert(
			'production',
			array(
				'document_no'       => sanitize_text_field( (string) ( $data['document_no'] ?? '' ) ),
				'document_date'     => sanitize_text_field( (string) ( $data['document_date'] ?? gmdate( 'Y-m-d' ) ) ),
				'warehouse_id'      => ! empty( $data['warehouse_id'] ) ? absint( $data['warehouse_id'] ) : null,
				'output_product_id' => $output_id,
				'output_qty'        => $qty,
				'status'            => 'draft',
				'notes'             => sanitize_textarea_field( (string) ( $data['notes'] ?? '' ) ),
			)
		);
		if ( is_wp_error( $id ) ) {
			return $id;
		}
		foreach ( $lines as $line ) {
			Accounting_Db::insert(
				'production_lines',
				array(
					'production_id' => $id,
					'product_id'    => absint( $line['product_id'] ?? 0 ),
					'qty'           => (float) ( $line['qty'] ?? 0 ),
				)
			);
		}
		return $id;
	}

	/**
	 * Post production: consume materials, add finished goods stock.
	 *
	 * @param int $id Production ID.
	 * @return true|WP_Error
	 */
	public static function post_production( $id ) {
		$row = Accounting_Db::get_row( 'production', absint( $id ) );
		if ( ! $row ) {
			return new WP_Error( 'not_found', __( 'Production document not found.', 'webino-dashboard' ) );
		}
		if ( 'posted' === $row['status'] ) {
			return true;
		}
		$wh = (int) ( $row['warehouse_id'] ?: Accounting_Config::get()['default_warehouse_id'] );
		global $wpdb;
		$lt = Accounting_Db::table( 'production_lines' );
		$lines = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$lt} WHERE production_id = %d", absint( $id ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$consume = array();
		foreach ( (array) $lines as $line ) {
			$consume[] = array(
				'product_id' => (int) $line['product_id'],
				'qty'        => (float) $line['qty'],
			);
		}
		if ( class_exists( 'Accounting_Warehouses' ) ) {
			Accounting_Warehouses::create_document(
				array(
					'type'          => 'out',
					'warehouse_id'  => $wh,
					'document_date' => $row['document_date'],
					'notes'         => 'production#' . $id,
				),
				$consume
			);
			Accounting_Warehouses::create_document(
				array(
					'type'          => 'in',
					'warehouse_id'  => $wh,
					'document_date' => $row['document_date'],
					'notes'         => 'production#' . $id,
				),
				array(
					array(
						'product_id' => (int) $row['output_product_id'],
						'qty'        => (float) $row['output_qty'],
					),
				)
			);
		}
		Accounting_Db::update( 'production', absint( $id ), array( 'status' => 'posted' ) );
		return true;
	}

	/**
	 * Secure share link for accounting invoice.
	 *
	 * @param int $invoice_id Invoice.
	 * @return array{token:string,url:string}|WP_Error
	 */
	public static function create_share( $invoice_id ) {
		$inv = Accounting_Invoices::get( $invoice_id );
		if ( is_wp_error( $inv ) ) {
			return $inv;
		}
		$token = wp_generate_password( 32, false, false );
		Accounting_Db::insert(
			'invoice_shares',
			array(
				'invoice_id' => absint( $invoice_id ),
				'token'      => $token,
				'expires_at' => gmdate( 'Y-m-d H:i:s', time() + MONTH_IN_SECONDS ),
			)
		);
		$url = add_query_arg(
			array(
				'webino_acc_invoice' => $token,
			),
			home_url( '/' )
		);
		return array( 'token' => $token, 'url' => $url );
	}

	/**
	 * @param array<string,mixed> $data Rule.
	 * @return int|WP_Error
	 */
	public static function create_rule( array $data ) {
		$name = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		$event = sanitize_key( (string) ( $data['event_key'] ?? '' ) );
		if ( '' === $name || '' === $event ) {
			return new WP_Error( 'acc_rule', __( 'Rule name and event are required.', 'webino-dashboard' ) );
		}
		return Accounting_Db::insert(
			'rules',
			array(
				'name'      => $name,
				'event_key' => $event,
				'is_active' => empty( $data['is_active'] ) ? 0 : 1,
				'config'    => wp_json_encode( isset( $data['config'] ) && is_array( $data['config'] ) ? $data['config'] : array() ),
			)
		);
	}

	/**
	 * Financial calculator.
	 *
	 * @param array<string,mixed> $data Input.
	 * @return array<string,mixed>
	 */
	public static function calculator( array $data ) {
		$op = sanitize_key( (string) ( $data['op'] ?? 'percent' ) );
		$a  = (float) ( $data['a'] ?? 0 );
		$b  = (float) ( $data['b'] ?? 0 );
		switch ( $op ) {
			case 'percent':
				return array( 'result' => $a * $b / 100 );
			case 'interest':
				$months = max( 1, (int) ( $data['months'] ?? 1 ) );
				return array( 'result' => $a * ( $b / 100 ) * ( $months / 12 ) );
			case 'ras':
				return self::calculator_ras( isset( $data['rows'] ) && is_array( $data['rows'] ) ? $data['rows'] : array() );
			default:
				return array( 'result' => $a + $b );
		}
	}

	/**
	 * @param array<int,array<string,mixed>> $rows Rows with amount+due_on.
	 * @return array<string,mixed>
	 */
	private static function calculator_ras( array $rows ) {
		$total = 0.0;
		$wsum  = 0.0;
		$today = strtotime( gmdate( 'Y-m-d' ) );
		foreach ( $rows as $r ) {
			$amt = (float) ( $r['amount'] ?? 0 );
			$due = strtotime( (string) ( $r['due_on'] ?? '' ) ) ?: $today;
			$total += $amt;
			$wsum  += $amt * ( ( $due - $today ) / DAY_IN_SECONDS );
		}
		$avg = $total > 0 ? $wsum / $total : 0;
		return array(
			'result'   => $avg,
			'ras_date' => gmdate( 'Y-m-d', $today + (int) round( $avg * DAY_IN_SECONDS ) ),
			'total'    => $total,
		);
	}

	/**
	 * ZIP backup of webino_acc_* tables (no private keys).
	 *
	 * @return array{file:string,url:string}|WP_Error
	 */
	public static function backup() {
		global $wpdb;
		$tables = $wpdb->get_col( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $wpdb->prefix . 'webino_acc_' ) . '%' ) );
		if ( ! $tables ) {
			return new WP_Error( 'acc_backup_empty', __( 'No accounting tables found.', 'webino-dashboard' ) );
		}
		$dir = wp_upload_dir();
		if ( ! empty( $dir['error'] ) ) {
			return new WP_Error( 'acc_backup_dir', (string) $dir['error'] );
		}
		$base = trailingslashit( $dir['basedir'] ) . 'webino-accounting-backups';
		wp_mkdir_p( $base );
		$stamp = gmdate( 'Ymd-His' );
		$json_path = $base . '/acc-' . $stamp . '.json';
		$dump = array();
		foreach ( $tables as $table ) {
			$dump[ $table ] = $wpdb->get_results( "SELECT * FROM {$table}", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}
		file_put_contents( $json_path, wp_json_encode( $dump ) );
		$zip_path = $base . '/acc-' . $stamp . '.zip';
		if ( class_exists( 'ZipArchive' ) ) {
			$zip = new ZipArchive();
			if ( true === $zip->open( $zip_path, ZipArchive::CREATE ) ) {
				$zip->addFile( $json_path, basename( $json_path ) );
				$zip->close();
				@unlink( $json_path );
			}
		} else {
			$zip_path = $json_path;
		}
		$url = trailingslashit( $dir['baseurl'] ) . 'webino-accounting-backups/' . basename( $zip_path );
		return array( 'file' => $zip_path, 'url' => $url );
	}

	/**
	 * @param array<string,mixed> $data Opening balance row.
	 * @return int|WP_Error
	 */
	public static function opening_balance( array $data ) {
		return Accounting_Db::insert(
			'opening_balances',
			array(
				'fiscal_year_id' => absint( $data['fiscal_year_id'] ?? 0 ),
				'account_id'     => ! empty( $data['account_id'] ) ? absint( $data['account_id'] ) : null,
				'person_id'      => ! empty( $data['person_id'] ) ? absint( $data['person_id'] ) : null,
				'debit'          => (float) ( $data['debit'] ?? 0 ),
				'credit'         => (float) ( $data['credit'] ?? 0 ),
			)
		);
	}

	/**
	 * CSV export helper.
	 *
	 * @param array<int,array<string,mixed>> $rows Rows.
	 * @return string
	 */
	public static function to_csv( array $rows ) {
		if ( ! $rows ) {
			return '';
		}
		$fh = fopen( 'php://temp', 'r+' );
		fputcsv( $fh, array_keys( $rows[0] ) );
		foreach ( $rows as $row ) {
			fputcsv( $fh, array_map( 'strval', array_values( $row ) ) );
		}
		rewind( $fh );
		$csv = stream_get_contents( $fh );
		fclose( $fh );
		return (string) $csv;
	}
}
