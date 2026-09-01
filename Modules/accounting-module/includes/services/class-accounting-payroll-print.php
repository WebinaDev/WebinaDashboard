<?php
/**
 * Printable Iranian payslip and employment decree (HTML A4 RTL).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Payroll print documents.
 */
final class Accounting_Payroll_Print {

	/**
	 * Render payslip HTML and exit (or return string if $return).
	 *
	 * @param int  $slip_id Slip.
	 * @param bool $return  Return instead of echo/exit.
	 * @return string|WP_Error|void
	 */
	public static function payslip( $slip_id, $return = false ) {
		if ( ! Accounting_Payroll::can_view_payslip( $slip_id ) ) {
			return new WP_Error( 'acc_forbidden', __( 'Forbidden.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		$slip = Accounting_Db::get_row( 'payslips', $slip_id );
		if ( ! $slip ) {
			return new WP_Error( 'acc_not_found', __( 'Payslip not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$emp  = Accounting_Db::get_row( 'employees', (int) $slip['employee_id'] );
		$run  = Accounting_Db::get_row( 'payroll_runs', (int) $slip['run_id'] );
		$cfg  = Accounting_Config::get();
		$wh   = null;
		if ( ! empty( $run['workshop_id'] ) ) {
			$wh = Accounting_Db::get_row( 'workshops', (int) $run['workshop_id'] );
		} elseif ( ! empty( $emp['workshop_id'] ) ) {
			$wh = Accounting_Db::get_row( 'workshops', (int) $emp['workshop_id'] );
		}
		$decree = null;
		if ( ! empty( $slip['decree_id'] ) ) {
			$decree = Accounting_Db::get_row( 'employment_decrees', (int) $slip['decree_id'] );
		}
		$items = json_decode( (string) ( $slip['items_json'] ?? '' ), true );
		$meta  = json_decode( (string) ( $slip['meta'] ?? '' ), true );
		if ( ! is_array( $items ) ) {
			$items = array();
		}
		if ( ! is_array( $meta ) ) {
			$meta = array();
		}
		ob_start();
		$company = $cfg;
		include dirname( dirname( __DIR__ ) ) . '/templates/payslip-print.php';
		$html = ob_get_clean();
		if ( $return ) {
			return $html;
		}
		self::send_html( $html );
	}

	/**
	 * @param int  $decree_id Decree.
	 * @param bool $return Return.
	 * @return string|WP_Error|void
	 */
	public static function decree( $decree_id, $return = false ) {
		if ( ! Accounting_Payroll::can_view_decree( $decree_id ) ) {
			return new WP_Error( 'acc_forbidden', __( 'Forbidden.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		$decree = Accounting_Db::get_row( 'employment_decrees', $decree_id );
		if ( ! $decree ) {
			return new WP_Error( 'acc_not_found', __( 'Decree not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$emp = Accounting_Db::get_row( 'employees', (int) $decree['employee_id'] );
		$cfg = Accounting_Config::get();
		$wh  = ! empty( $decree['workshop_id'] ) ? Accounting_Db::get_row( 'workshops', (int) $decree['workshop_id'] ) : null;
		ob_start();
		$company = $cfg;
		include dirname( dirname( __DIR__ ) ) . '/templates/decree-print.php';
		$html = ob_get_clean();
		if ( $return ) {
			return $html;
		}
		self::send_html( $html );
	}

	/**
	 * @param string $html HTML.
	 * @return void
	 */
	private static function send_html( $html ) {
		nocache_headers();
		header( 'Content-Type: text/html; charset=utf-8' );
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		exit;
	}

	/**
	 * Format money for print.
	 *
	 * @param float|int|string $n Number.
	 * @return string
	 */
	public static function money( $n ) {
		return number_format( (float) $n, 0, '.', ',' );
	}
}
