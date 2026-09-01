<?php
/**
 * Financial reports from GL.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Trial balance, P&L, BS, VAT, aging.
 */
final class Accounting_Reports {

	/**
	 * Trial balance between dates.
	 *
	 * @param string $from From.
	 * @param string $to   To.
	 * @return array<int,array<string,mixed>>
	 */
	public static function trial_balance( $from, $to ) {
		global $wpdb;
		$lt = Accounting_Db::table( 'journal_lines' );
		$jt = Accounting_Db::table( 'journal_entries' );
		$at = Accounting_Db::table( 'chart_accounts' );
		$sql = "SELECT a.id, a.code, a.name, a.type,
			SUM(l.debit) AS debit, SUM(l.credit) AS credit
			FROM {$lt} l
			INNER JOIN {$jt} j ON j.id = l.journal_entry_id AND j.status = 'posted'
			INNER JOIN {$at} a ON a.id = l.account_id
			WHERE j.document_date BETWEEN %s AND %s
			GROUP BY a.id, a.code, a.name, a.type
			ORDER BY a.code ASC";
		$rows = $wpdb->get_results( $wpdb->prepare( $sql, $from, $to ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$out  = array();
		foreach ( (array) $rows as $r ) {
			$d = (float) $r['debit'];
			$c = (float) $r['credit'];
			$out[] = array(
				'account_id' => (int) $r['id'],
				'code'       => $r['code'],
				'name'       => $r['name'],
				'type'       => $r['type'],
				'debit'      => $d,
				'credit'     => $c,
				'balance'    => $d - $c,
			);
		}
		return $out;
	}

	/**
	 * @param string $from From.
	 * @param string $to   To.
	 * @return array{income:float,expense:float,profit:float,rows:array<int,array<string,mixed>>}
	 */
	public static function profit_and_loss( $from, $to ) {
		$tb = self::trial_balance( $from, $to );
		$income = 0.0;
		$expense = 0.0;
		$rows = array();
		foreach ( $tb as $r ) {
			if ( 'income' === $r['type'] ) {
				$amt = $r['credit'] - $r['debit'];
				$income += $amt;
				$rows[] = $r + array( 'amount' => $amt );
			}
			if ( 'expense' === $r['type'] ) {
				$amt = $r['debit'] - $r['credit'];
				$expense += $amt;
				$rows[] = $r + array( 'amount' => $amt );
			}
		}
		return array(
			'income'  => $income,
			'expense' => $expense,
			'profit'  => $income - $expense,
			'rows'    => $rows,
		);
	}

	/**
	 * @param string $as_of Date.
	 * @return array{assets:float,liabilities:float,equity:float,rows:array<int,array<string,mixed>>}
	 */
	public static function balance_sheet( $as_of ) {
		$tb = self::trial_balance( '1970-01-01', $as_of );
		$assets = 0.0;
		$liab   = 0.0;
		$equity = 0.0;
		$rows   = array();
		foreach ( $tb as $r ) {
			if ( 'asset' === $r['type'] ) {
				$assets += $r['balance'];
				$rows[]  = $r;
			}
			if ( 'liability' === $r['type'] ) {
				$liab += -$r['balance'];
				$rows[] = $r;
			}
			if ( 'equity' === $r['type'] ) {
				$equity += -$r['balance'];
				$rows[]  = $r;
			}
		}
		// Retain current P&L into equity.
		$pl = self::profit_and_loss( '1970-01-01', $as_of );
		$equity += $pl['profit'];
		return array(
			'assets'      => $assets,
			'liabilities' => $liab,
			'equity'      => $equity,
			'rows'        => $rows,
			'profit'      => $pl['profit'],
		);
	}

	/**
	 * VAT summary from sale/purchase invoices.
	 *
	 * @param string $from From.
	 * @param string $to   To.
	 * @return array<string,float>
	 */
	public static function vat_summary( $from, $to ) {
		global $wpdb;
		$it = Accounting_Db::table( 'invoices' );
		$out = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT SUM(tax) AS tax, SUM(subtotal) AS base FROM {$it} WHERE type IN ('sale','sales') AND status IN ('posted','sent') AND document_date BETWEEN %s AND %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$from,
				$to
			),
			ARRAY_A
		);
		$in = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT SUM(tax) AS tax, SUM(subtotal) AS base FROM {$it} WHERE type = 'purchase' AND status = 'posted' AND document_date BETWEEN %s AND %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$from,
				$to
			),
			ARRAY_A
		);
		$output = (float) ( $out['tax'] ?? 0 );
		$input  = (float) ( $in['tax'] ?? 0 );
		return array(
			'output_vat'  => $output,
			'input_vat'   => $input,
			'net_vat'     => $output - $input,
			'sales_base'  => (float) ( $out['base'] ?? 0 ),
			'purchase_base' => (float) ( $in['base'] ?? 0 ),
		);
	}

	/**
	 * Taxable vs exempt income split from invoice lines.
	 *
	 * @param string $from From.
	 * @param string $to   To.
	 * @return array<string,float>
	 */
	public static function tax_split( $from, $to ) {
		global $wpdb;
		$it = Accounting_Db::table( 'invoices' );
		$lt = Accounting_Db::table( 'invoice_lines' );
		$sql = "SELECT
			SUM(CASE WHEN l.vat_rate > 0 THEN l.line_total - l.vat_amount ELSE 0 END) AS taxable,
			SUM(CASE WHEN l.vat_rate <= 0 THEN l.line_total ELSE 0 END) AS exempt,
			SUM(l.vat_amount) AS vat
			FROM {$lt} l
			INNER JOIN {$it} i ON i.id = l.invoice_id
			WHERE i.type IN ('sale','sales') AND i.document_date BETWEEN %s AND %s";
		$row = $wpdb->get_row( $wpdb->prepare( $sql, $from, $to ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		return array(
			'taxable' => (float) ( $row['taxable'] ?? 0 ),
			'exempt'  => (float) ( $row['exempt'] ?? 0 ),
			'vat'     => (float) ( $row['vat'] ?? 0 ),
		);
	}

	/**
	 * Cash-flow heuristic from cash vouchers.
	 *
	 * @param string $from From.
	 * @param string $to   To.
	 * @return array<string,float>
	 */
	public static function cash_flow( $from, $to ) {
		global $wpdb;
		$vt = Accounting_Db::table( 'receipt_vouchers' );
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT
					SUM(CASE WHEN type IN ('receipt','in') THEN amount ELSE 0 END) AS inflow,
					SUM(CASE WHEN type IN ('payment','out') THEN amount ELSE 0 END) AS outflow
				 FROM {$vt} WHERE status = 'posted' AND document_date BETWEEN %s AND %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$from,
				$to
			),
			ARRAY_A
		);
		$in  = (float) ( $row['inflow'] ?? 0 );
		$out = (float) ( $row['outflow'] ?? 0 );
		return array(
			'inflow'  => $in,
			'outflow' => $out,
			'net'     => $in - $out,
		);
	}

	/**
	 * Receivables / payables aging by person (open invoices heuristic).
	 *
	 * @return array{receivable:array<int,array<string,mixed>>,payable:array<int,array<string,mixed>>}
	 */
	public static function aging() {
		global $wpdb;
		$it = Accounting_Db::table( 'invoices' );
		$pt = Accounting_Db::table( 'persons' );
		$recv = $wpdb->get_results(
			"SELECT p.id, p.name, SUM(i.total) AS amount FROM {$it} i LEFT JOIN {$pt} p ON p.id = i.person_id WHERE i.type IN ('sale','sales') AND i.status = 'posted' GROUP BY p.id, p.name ORDER BY amount DESC LIMIT 100", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			ARRAY_A
		);
		$pay = $wpdb->get_results(
			"SELECT p.id, p.name, SUM(i.total) AS amount FROM {$it} i LEFT JOIN {$pt} p ON p.id = i.person_id WHERE i.type = 'purchase' AND i.status = 'posted' GROUP BY p.id, p.name ORDER BY amount DESC LIMIT 100", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			ARRAY_A
		);
		return array(
			'receivable' => is_array( $recv ) ? $recv : array(),
			'payable'    => is_array( $pay ) ? $pay : array(),
		);
	}

	/**
	 * Sales margin using invoice line COGS.
	 *
	 * @param string $from From.
	 * @param string $to   To.
	 * @return array{revenue:float,cogs:float,margin:float}
	 */
	public static function sales_margin( $from, $to ) {
		global $wpdb;
		$it = Accounting_Db::table( 'invoices' );
		$lt = Accounting_Db::table( 'invoice_lines' );
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT SUM(i.subtotal) AS revenue, SUM(l.cogs * l.qty) AS cogs
				FROM {$it} i
				INNER JOIN {$lt} l ON l.invoice_id = i.id
				WHERE i.type IN ('sale','sales') AND i.status IN ('posted','sent','refunded') AND i.document_date BETWEEN %s AND %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$from,
				$to
			),
			ARRAY_A
		);
		$rev  = (float) ( $row['revenue'] ?? 0 );
		$cogs = (float) ( $row['cogs'] ?? 0 );
		return array(
			'revenue' => $rev,
			'cogs'    => $cogs,
			'margin'  => $rev - $cogs,
		);
	}

	/**
	 * Dashboard summary cards.
	 *
	 * @return array<string,mixed>
	 */
	public static function overview() {
		$from = gmdate( 'Y-m-01' );
		$to   = gmdate( 'Y-m-d' );
		$pl   = self::profit_and_loss( $from, $to );
		$vat  = self::vat_summary( $from, $to );
		$m    = self::sales_margin( $from, $to );
		global $wpdb;
		$jobs = Accounting_Db::table( 'moadian_jobs' );
		$pending = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$jobs} WHERE status IN ('pending','retry')" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return array(
			'period'           => array( 'from' => $from, 'to' => $to ),
			'profit'           => $pl,
			'vat'              => $vat,
			'margin'           => $m,
			'moadian_pending'  => $pending,
			'fiscal_year'      => Accounting_Fiscal::active(),
		);
	}
}
