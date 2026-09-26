<?php
/**
 * Tax calculation engine (VAT + income tax estimates).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Period tax summary for the cockpit.
 */
final class Accounting_Tax_Engine {

	/**
	 * Resolve VAT rate for a product/line.
	 *
	 * @param array<string,mixed> $ctx Context: tax_exempt, special_key, vat_rate override.
	 * @param string|null         $as_of Date.
	 * @return float
	 */
	public static function resolve_vat_rate( array $ctx, $as_of = null ) {
		$cfg = Accounting_Config::get();
		if ( ! empty( $ctx['tax_exempt'] ) || 'exempt' === ( $cfg['vat_regime'] ?? '' ) || empty( $cfg['inta_vat_liable'] ) ) {
			return 0.0;
		}
		$rates = Accounting_Tax_Rates::active( $as_of );
		$general = $rates ? (float) $rates['vat_general'] : (float) ( $cfg['default_vat_rate'] ?? 10 );
		$special_key = (string) ( $ctx['special_key'] ?? '' );
		if ( $rates && $special_key && isset( $rates['special_rates'][ $special_key ] ) ) {
			return (float) $rates['special_rates'][ $special_key ];
		}
		if ( isset( $ctx['vat_rate'] ) && '' !== $ctx['vat_rate'] && null !== $ctx['vat_rate'] ) {
			return (float) $ctx['vat_rate'];
		}
		return $general;
	}

	/**
	 * Progressive art.131 style brackets on taxable base (rial).
	 *
	 * @param float                    $base     Taxable profit.
	 * @param array<int,array{up_to:float,rate:float}> $brackets Brackets.
	 * @return float
	 */
	public static function apply_brackets( $base, array $brackets ) {
		$base = max( 0.0, (float) $base );
		if ( $base <= 0 || ! $brackets ) {
			return 0.0;
		}
		$tax      = 0.0;
		$prev_cap = 0.0;
		foreach ( $brackets as $b ) {
			$rate  = (float) ( $b['rate'] ?? 0 ) / 100.0;
			$up_to = (float) ( $b['up_to'] ?? 0 );
			if ( $up_to <= 0 ) {
				$tax += ( $base - $prev_cap ) * $rate;
				break;
			}
			$slice = min( $base, $up_to ) - $prev_cap;
			if ( $slice > 0 ) {
				$tax += $slice * $rate;
			}
			$prev_cap = $up_to;
			if ( $base <= $up_to ) {
				break;
			}
		}
		return round( $tax, 0 );
	}

	/**
	 * Full period summary.
	 *
	 * @param string $from From Y-m-d.
	 * @param string $to   To Y-m-d.
	 * @return array<string,mixed>
	 */
	public static function summary( $from, $to ) {
		$cfg     = Accounting_Config::get();
		$pnl     = Accounting_Reports::profit_and_loss( $from, $to );
		$vat     = Accounting_Reports::vat_summary( $from, $to );
		$rates   = Accounting_Tax_Rates::active( $to );
		$revenue = (float) $pnl['income'];
		$expense = (float) $pnl['expense'];
		$profit  = (float) $pnl['profit'];
		$loss    = $profit < 0 ? abs( $profit ) : 0.0;
		$cogs    = self::cogs_amount( $from, $to );

		$assumptions = array();
		$type        = (string) ( $cfg['taxpayer_type'] ?? '' );
		$income_tax  = 0.0;
		$taxable     = max( 0.0, $profit );

		if ( 'individual' === $type ) {
			$ratio = (float) ( $cfg['inta_profit_ratio'] ?? 0 );
			$assumptions[] = 'taxpayer_type=individual';
			if ( $ratio > 0 ) {
				$ratio_base = $revenue * ( $ratio / 100.0 );
				$use_higher = ! empty( $cfg['use_inta_ratio_when_higher'] );
				if ( $use_higher ) {
					$taxable = max( $taxable, $ratio_base );
					$assumptions[] = 'taxable=max(book_profit, revenue*inta_ratio)';
				} else {
					$taxable       = $ratio_base;
					$assumptions[] = 'taxable=revenue*inta_ratio';
				}
				$assumptions[] = 'inta_profit_ratio=' . $ratio;
			}
			$brackets = $rates && ! empty( $rates['art131_brackets'] )
				? $rates['art131_brackets']
				: array(
					array( 'up_to' => 2000000000, 'rate' => 15 ),
					array( 'up_to' => 4000000000, 'rate' => 20 ),
					array( 'up_to' => 0, 'rate' => 25 ),
				);
			$income_tax    = self::apply_brackets( $taxable, $brackets );
			$assumptions[] = 'income_tax=art131_brackets';
		} elseif ( 'corporate' === $type ) {
			$corp_rate = (float) ( $cfg['corporate_tax_rate'] ?? ( $rates['corporate_rate'] ?? 25 ) );
			$income_tax    = round( max( 0.0, $profit ) * ( $corp_rate / 100.0 ), 0 );
			$assumptions[] = 'taxpayer_type=corporate';
			$assumptions[] = 'corporate_tax_rate=' . $corp_rate;
		} else {
			$assumptions[] = 'taxpayer_type_unset';
		}

		$threshold = (float) ( $cfg['sales_threshold_rial'] ?? 0 );
		$threshold_pct = $threshold > 0 ? min( 100, round( ( $vat['sales_base'] / $threshold ) * 100, 1 ) ) : null;

		return array(
			'from'                 => $from,
			'to'                   => $to,
			'revenue'              => $revenue,
			'cogs'                 => $cogs,
			'expenses'             => $expense,
			'profit'               => $profit,
			'loss'                 => $loss,
			'taxable_base'         => $taxable,
			'vat_out'              => (float) $vat['output_vat'],
			'vat_in'               => (float) $vat['input_vat'],
			'vat_net'              => (float) $vat['net_vat'],
			'sales_base'           => (float) $vat['sales_base'],
			'income_tax_estimate'  => $income_tax,
			'taxpayer_type'        => $type,
			'inta_code'            => (string) ( $cfg['inta_code'] ?? '' ),
			'vat_general'          => $rates ? (float) $rates['vat_general'] : (float) ( $cfg['default_vat_rate'] ?? 10 ),
			'rate_version_label'   => $rates ? (string) $rates['label'] : '',
			'sales_threshold_rial' => $threshold,
			'sales_threshold_pct'  => $threshold_pct,
			'moadian_pending'      => self::moadian_count( array( 'pending', 'retry' ) ),
			'moadian_failed'       => self::moadian_count( array( 'failed' ) ),
			'assumptions'          => $assumptions,
			'disclaimer'           => 'estimate_only',
		);
	}

	/**
	 * @param string $from From.
	 * @param string $to   To.
	 * @return float
	 */
	private static function cogs_amount( $from, $to ) {
		global $wpdb;
		$lt = Accounting_Db::table( 'journal_lines' );
		$jt = Accounting_Db::table( 'journal_entries' );
		$at = Accounting_Db::table( 'chart_accounts' );
		$code = (string) ( Accounting_Config::get()['account_map']['cogs'] ?? '5101' );
		$amt  = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT SUM(l.debit - l.credit) FROM {$lt} l
				INNER JOIN {$jt} j ON j.id = l.journal_entry_id AND j.status = 'posted'
				INNER JOIN {$at} a ON a.id = l.account_id
				WHERE a.code = %s AND j.document_date BETWEEN %s AND %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$code,
				$from,
				$to
			)
		);
		return (float) $amt;
	}

	/**
	 * @param array<int,string> $statuses Statuses.
	 * @return int
	 */
	private static function moadian_count( array $statuses ) {
		global $wpdb;
		$table = Accounting_Db::table( 'moadian_jobs' );
		$in    = implode( "','", array_map( 'esc_sql', $statuses ) );
		return (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE status IN ('{$in}')" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	}
}
