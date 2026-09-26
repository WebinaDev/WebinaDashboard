<?php
/**
 * Tax compliance tips.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Generate and list dismissible tips.
 */
final class Accounting_Tax_Tips {

	/**
	 * Refresh tip rows from current state.
	 *
	 * @return int Upserted tips.
	 */
	public static function refresh() {
		$cfg = Accounting_Config::get();
		$n   = 0;
		$to  = gmdate( 'Y-m-d' );
		$from = gmdate( 'Y-m-d', strtotime( '-90 days' ) );
		$sum = Accounting_Tax_Engine::summary( $from, $to );

		if ( empty( $cfg['wizard_done'] ) ) {
			$n += self::upsert( 'setup_incomplete', 'warning', 'accounting.taxTip.setupIncomplete', array() );
		} else {
			self::clear_code( 'setup_incomplete' );
		}

		if ( '' === (string) ( $cfg['fiscal_id'] ?? '' ) || '' === Accounting_Config::private_key_pem() ) {
			$n += self::upsert( 'moadian_keys', 'warning', 'accounting.taxTip.moadianKeys', array() );
		} else {
			self::clear_code( 'moadian_keys' );
		}

		if ( null !== $sum['sales_threshold_pct'] && (float) $sum['sales_threshold_pct'] >= 80 ) {
			$n += self::upsert(
				'threshold_near',
				(float) $sum['sales_threshold_pct'] >= 100 ? 'critical' : 'warning',
				'accounting.taxTip.thresholdNear',
				array( 'pct' => $sum['sales_threshold_pct'] )
			);
		} else {
			self::clear_code( 'threshold_near' );
		}

		if ( (int) $sum['moadian_failed'] > 0 ) {
			$n += self::upsert( 'moadian_failed', 'critical', 'accounting.taxTip.moadianFailed', array( 'count' => (int) $sum['moadian_failed'] ) );
		} else {
			self::clear_code( 'moadian_failed' );
		}

		$missing = self::count_lines_missing_sstid();
		if ( $missing > 0 ) {
			$n += self::upsert( 'missing_sstid', 'warning', 'accounting.taxTip.missingSstid', array( 'count' => $missing ) );
		} else {
			self::clear_code( 'missing_sstid' );
		}

		// Approximate quarterly VAT deadline: end of month after quarter (Jalali approximated via calendar quarter).
		$m = (int) gmdate( 'n' );
		$quarter_end_month = (int) ( ceil( $m / 3 ) * 3 );
		$days_left = (int) ( strtotime( gmdate( 'Y' ) . '-' . str_pad( (string) min( 12, $quarter_end_month + 1 ), 2, '0', STR_PAD_LEFT ) . '-15' ) - time() ) / DAY_IN_SECONDS;
		if ( $days_left >= 0 && $days_left <= 20 ) {
			$n += self::upsert( 'vat_deadline', 'info', 'accounting.taxTip.vatDeadline', array( 'days' => (int) $days_left ) );
		} else {
			self::clear_code( 'vat_deadline' );
		}

		$rates = Accounting_Tax_Rates::active();
		if ( $rates && ! empty( $rates['updated_at'] ) && strtotime( (string) $rates['updated_at'] ) > time() - WEEK_IN_SECONDS ) {
			$n += self::upsert( 'rate_version', 'info', 'accounting.taxTip.rateVersion', array( 'label' => $rates['label'] ) );
		}

		return $n;
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_active() {
		global $wpdb;
		$table = Accounting_Db::table( 'tax_tips' );
		$rows  = $wpdb->get_results(
			"SELECT * FROM {$table} WHERE dismissed_at IS NULL ORDER BY FIELD(severity,'critical','warning','info'), id DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			ARRAY_A
		);
		$out = array();
		foreach ( (array) $rows as $r ) {
			$payload = json_decode( (string) ( $r['payload_json'] ?? '' ), true );
			$out[]   = array(
				'id'          => (int) $r['id'],
				'code'        => $r['code'],
				'severity'    => $r['severity'],
				'message_key' => $r['message_key'],
				'payload'     => is_array( $payload ) ? $payload : array(),
				'created_at'  => $r['created_at'],
			);
		}
		return $out;
	}

	/**
	 * @param int $id Tip ID.
	 * @return true|WP_Error
	 */
	public static function dismiss( $id ) {
		global $wpdb;
		$table = Accounting_Db::table( 'tax_tips' );
		$ok    = $wpdb->update(
			$table,
			array( 'dismissed_at' => gmdate( 'Y-m-d H:i:s' ) ),
			array( 'id' => absint( $id ) ),
			array( '%s' ),
			array( '%d' )
		);
		return false === $ok ? new WP_Error( 'acc_tip', __( 'Could not dismiss tip.', 'webino-dashboard' ) ) : true;
	}

	/**
	 * @param string               $code Code.
	 * @param string               $severity Severity.
	 * @param string               $message_key i18n key.
	 * @param array<string,mixed>  $payload Payload.
	 * @return int 1 if upserted.
	 */
	private static function upsert( $code, $severity, $message_key, array $payload ) {
		global $wpdb;
		$table = Accounting_Db::table( 'tax_tips' );
		$exist = $wpdb->get_row(
			$wpdb->prepare( "SELECT id, dismissed_at FROM {$table} WHERE code = %s", $code ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			ARRAY_A
		);
		$data = array(
			'code'         => sanitize_key( $code ),
			'severity'     => sanitize_key( $severity ),
			'message_key'  => sanitize_text_field( $message_key ),
			'payload_json' => wp_json_encode( $payload ),
			'dismissed_at' => null,
		);
		if ( $exist ) {
			$wpdb->update( $table, $data, array( 'id' => (int) $exist['id'] ) );
		} else {
			$wpdb->insert( $table, $data );
		}
		return 1;
	}

	/**
	 * @param string $code Code.
	 * @return void
	 */
	private static function clear_code( $code ) {
		global $wpdb;
		$table = Accounting_Db::table( 'tax_tips' );
		$wpdb->delete( $table, array( 'code' => sanitize_key( $code ) ), array( '%s' ) );
	}

	/**
	 * @return int
	 */
	private static function count_lines_missing_sstid() {
		global $wpdb;
		$it = Accounting_Db::table( 'invoices' );
		$lt = Accounting_Db::table( 'invoice_lines' );
		return (int) $wpdb->get_var(
			"SELECT COUNT(*) FROM {$lt} l
			INNER JOIN {$it} i ON i.id = l.invoice_id
			WHERE i.type IN ('sale','sales') AND i.status IN ('posted','draft')
			AND (l.sstid IS NULL OR l.sstid = '')
			AND i.document_date >= DATE_SUB(UTC_DATE(), INTERVAL 90 DAY)" // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		);
	}
}
