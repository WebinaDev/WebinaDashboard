<?php
/**
 * Dashboard REST for accounting module.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Routes under webino-dashboard/v1/accounting/*.
 */
final class Webino_Dashboard_REST_Accounting {
	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * @return bool
	 */
	public static function can_manage() {
		return Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' ) || Webino_Dashboard_Rest_Base::can_view_accounting();
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		$routes = array(
			array( 'GET', '/accounting/overview', 'overview' ),
			array( 'GET|POST', '/accounting/settings', 'settings' ),
			array( 'POST', '/accounting/test-connection', 'test_connection' ),
			array( 'GET', '/accounting/chart', 'chart_list' ),
			array( 'POST', '/accounting/chart', 'chart_create' ),
			array( 'GET', '/accounting/fiscal-years', 'fiscal_list' ),
			array( 'POST', '/accounting/fiscal-years', 'fiscal_create' ),
			array( 'POST', '/accounting/fiscal-years/(?P<id>\d+)/close', 'fiscal_close' ),
			array( 'GET', '/accounting/journals', 'journals_list' ),
			array( 'GET', '/accounting/journals/(?P<id>\d+)', 'journals_get' ),
			array( 'POST', '/accounting/journals', 'journals_create' ),
			array( 'POST', '/accounting/journals/(?P<id>\d+)/post', 'journals_post' ),
			array( 'GET', '/accounting/persons', 'persons_list' ),
			array( 'POST', '/accounting/persons', 'persons_create' ),
			array( 'PATCH', '/accounting/persons/(?P<id>\d+)', 'persons_update' ),
			array( 'GET', '/accounting/products', 'products_list' ),
			array( 'POST', '/accounting/products', 'products_create' ),
			array( 'PATCH', '/accounting/products/(?P<id>\d+)', 'products_update' ),
			array( 'POST', '/accounting/products/bulk-tax', 'products_bulk_tax' ),
			array( 'GET', '/accounting/invoices', 'invoices_list' ),
			array( 'GET', '/accounting/invoices/(?P<id>\d+)', 'invoices_get' ),
			array( 'POST', '/accounting/invoices', 'invoices_create' ),
			array( 'POST', '/accounting/invoices/(?P<id>\d+)/post', 'invoices_post' ),
			array( 'POST', '/accounting/invoices/(?P<id>\d+)/moadian-send', 'invoices_moadian_send' ),
			array( 'POST', '/accounting/invoices/(?P<id>\d+)/moadian-inquiry', 'invoices_moadian_inquiry' ),
			array( 'GET', '/accounting/expenses', 'expenses_list' ),
			array( 'POST', '/accounting/expenses', 'expenses_create' ),
			array( 'POST', '/accounting/expenses/(?P<id>\d+)/post', 'expenses_post' ),
			array( 'GET', '/accounting/cash-accounts', 'cash_list' ),
			array( 'POST', '/accounting/cash-accounts', 'cash_create' ),
			array( 'GET', '/accounting/vouchers', 'vouchers_list' ),
			array( 'POST', '/accounting/vouchers', 'vouchers_create' ),
			array( 'POST', '/accounting/vouchers/(?P<id>\d+)/post', 'vouchers_post' ),
			array( 'GET', '/accounting/checks', 'checks_list' ),
			array( 'POST', '/accounting/checks', 'checks_create' ),
			array( 'POST', '/accounting/checks/(?P<id>\d+)/status', 'checks_status' ),
			array( 'GET', '/accounting/warehouses', 'warehouses_list' ),
			array( 'POST', '/accounting/warehouses', 'warehouses_create' ),
			array( 'GET', '/accounting/warehouse-stock', 'warehouse_stock' ),
			array( 'GET', '/accounting/warehouse-documents', 'warehouse_docs' ),
			array( 'POST', '/accounting/warehouse-documents', 'warehouse_doc_create' ),
			array( 'GET', '/accounting/moadian/jobs', 'moadian_jobs' ),
			array( 'POST', '/accounting/moadian/process', 'moadian_process' ),
			array( 'GET', '/accounting/projects', 'projects_list' ),
			array( 'POST', '/accounting/projects', 'projects_create' ),
			array( 'GET', '/accounting/projects/(?P<id>\d+)/profit', 'projects_profit' ),
			array( 'GET', '/accounting/cost-centers', 'cc_list' ),
			array( 'POST', '/accounting/cost-centers', 'cc_create' ),
			array( 'GET', '/accounting/employees', 'employees_list' ),
			array( 'POST', '/accounting/employees', 'employees_create' ),
			array( 'PATCH', '/accounting/employees/(?P<id>\d+)', 'employees_update' ),
			array( 'GET|POST', '/accounting/workshops', 'workshops' ),
			array( 'PATCH', '/accounting/workshops/(?P<id>\d+)', 'workshops_update' ),
			array( 'POST', '/accounting/payroll/attendance', 'payroll_attendance' ),
			array( 'GET', '/accounting/payroll', 'payroll_list' ),
			array( 'POST', '/accounting/payroll', 'payroll_create' ),
			array( 'GET', '/accounting/payroll/(?P<id>\d+)', 'payroll_get' ),
			array( 'POST', '/accounting/payroll/(?P<id>\d+)/recalc', 'payroll_recalc' ),
			array( 'POST', '/accounting/payroll/(?P<id>\d+)/post', 'payroll_post' ),
			array( 'GET', '/accounting/payroll/(?P<id>\d+)/export', 'payroll_export' ),
			array( 'GET|POST', '/accounting/payroll/(?P<id>\d+)/tamin-dsk', 'payroll_tamin_dsk' ),
			array( 'PATCH', '/accounting/payslips/(?P<id>\d+)', 'payslip_update' ),
			array( 'GET', '/accounting/payroll/(?P<id>\d+)/tamin-preview', 'payroll_tamin_preview' ),
			array( 'GET', '/accounting/payroll/attendance', 'payroll_attendance_list' ),
			array( 'GET', '/accounting/tamin-jobs', 'tamin_jobs_search' ),
			array( 'GET|POST', '/accounting/decrees', 'decrees' ),
			array( 'GET', '/accounting/decrees/(?P<id>\d+)', 'decree_get' ),
			array( 'PATCH', '/accounting/decrees/(?P<id>\d+)', 'decree_update' ),
			array( 'POST', '/accounting/decrees/(?P<id>\d+)/issue', 'decree_issue' ),
			array( 'GET', '/accounting/payslips/(?P<id>\d+)/print', 'payslip_print' ),
			array( 'GET', '/accounting/decrees/(?P<id>\d+)/print', 'decree_print' ),
			array( 'GET', '/accounting/my/payslips', 'my_payslips' ),
			array( 'GET', '/accounting/my/decrees', 'my_decrees' ),
			array( 'GET', '/accounting/reports/trial-balance', 'report_tb' ),
			array( 'GET', '/accounting/reports/pnl', 'report_pnl' ),
			array( 'GET', '/accounting/reports/balance-sheet', 'report_bs' ),
			array( 'GET', '/accounting/reports/vat', 'report_vat' ),
			array( 'GET', '/accounting/reports/aging', 'report_aging' ),
			array( 'GET', '/accounting/reports/margin', 'report_margin' ),
			array( 'GET', '/accounting/reports/tax-split', 'report_tax_split' ),
			array( 'GET', '/accounting/reports/cash-flow', 'report_cash_flow' ),
			array( 'GET', '/accounting/reports/kardex', 'report_kardex' ),
			array( 'GET|POST', '/accounting/installments', 'installments' ),
			array( 'POST', '/accounting/installments/schedule', 'installments_schedule' ),
			array( 'GET', '/accounting/installments/ras/(?P<person_id>\d+)', 'installments_ras' ),
			array( 'GET|POST', '/accounting/production', 'production' ),
			array( 'POST', '/accounting/production/(?P<id>\d+)/post', 'production_post' ),
			array( 'POST', '/accounting/invoices/(?P<id>\d+)/share', 'invoice_share' ),
			array( 'GET|POST', '/accounting/rules', 'rules' ),
			array( 'POST', '/accounting/calculator', 'calculator' ),
			array( 'POST', '/accounting/backup', 'backup' ),
			array( 'POST', '/accounting/opening-balances', 'opening_balances' ),
			array( 'GET', '/accounting/export/csv', 'export_csv' ),
			array( 'POST', '/accounting/sync/backfill', 'sync_backfill' ),
			array( 'POST', '/accounting/sync/order/(?P<id>\d+)', 'sync_order' ),
			array( 'POST', '/accounting/hesabfa/test', 'hesabfa_test' ),
			array( 'POST', '/accounting/hesabfa/register-hook', 'hesabfa_register_hook' ),
			array( 'POST', '/accounting/hesabfa/migrate', 'hesabfa_migrate' ),
			array( 'POST', '/accounting/hesabfa/sync-now', 'hesabfa_sync_now' ),
			array( 'POST', '/accounting/hesabfa/process', 'hesabfa_process' ),
			array( 'GET', '/accounting/hesabfa/jobs', 'hesabfa_jobs' ),
			array( 'GET', '/accounting/hesabfa/log', 'hesabfa_log' ),
			array( 'GET', '/accounting/hesabfa/map', 'hesabfa_map' ),
			array( 'POST', '/accounting/hesabfa/push/(?P<entity>[a-z_]+)/(?P<id>\d+)', 'hesabfa_push' ),
			array( 'POST', '/accounting/hesabfa/inquiry', 'hesabfa_inquiry' ),
			array( 'POST', '/accounting/hesabfa/reports', 'hesabfa_reports' ),
			array( 'GET', '/accounting/hesabfa/meta', 'hesabfa_meta' ),
		);

		foreach ( $routes as $r ) {
			register_rest_route(
				self::NS,
				$r[1],
				array(
					'methods'             => $r[0],
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => array( __CLASS__, $r[2] ),
				)
			);
		}
	}

	public static function overview() {
		return new WP_REST_Response( Accounting_Reports::overview() );
	}

	public static function settings( WP_REST_Request $request ) {
		if ( 'POST' === $request->get_method() ) {
			$data = $request->get_json_params();
			return new WP_REST_Response( array( 'settings' => Accounting_Config::save( is_array( $data ) ? $data : array() ) ) );
		}
		return new WP_REST_Response( array( 'settings' => Accounting_Config::get_public() ) );
	}

	public static function test_connection() {
		$res = Accounting_Moadian::test_connection();
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function chart_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Chart::list_all( self::list_args( $request ) ) );
	}

	public static function chart_create( WP_REST_Request $request ) {
		$id = Accounting_Chart::create( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function fiscal_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Fiscal::list_all( self::list_args( $request ) ) );
	}

	public static function fiscal_create( WP_REST_Request $request ) {
		$id = Accounting_Fiscal::create( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function fiscal_close( WP_REST_Request $request ) {
		$res = Accounting_Fiscal::close( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function journals_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Journal::list_entries( self::list_args( $request ) ) );
	}

	public static function journals_get( WP_REST_Request $request ) {
		$res = Accounting_Journal::get_with_lines( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function journals_create( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		$id   = Accounting_Journal::create( (array) ( $body['header'] ?? $body ), (array) ( $body['lines'] ?? array() ), ! empty( $body['post'] ) );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function journals_post( WP_REST_Request $request ) {
		$res = Accounting_Journal::post( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function persons_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Persons::list_all( self::list_args( $request ) ) );
	}

	public static function persons_create( WP_REST_Request $request ) {
		$id = Accounting_Persons::create( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function persons_update( WP_REST_Request $request ) {
		$res = Accounting_Persons::update( (int) $request['id'], (array) $request->get_json_params() );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function products_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Products::list_all( self::list_args( $request ) ) );
	}

	public static function products_create( WP_REST_Request $request ) {
		$id = Accounting_Products::create( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function products_update( WP_REST_Request $request ) {
		$res = Accounting_Products::update( (int) $request['id'], (array) $request->get_json_params() );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function products_bulk_tax( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		$rows = isset( $body['rows'] ) && is_array( $body['rows'] ) ? $body['rows'] : array();
		return new WP_REST_Response( Accounting_Products::bulk_tax_meta( $rows ) );
	}

	public static function invoices_list( WP_REST_Request $request ) {
		$args = self::list_args( $request );
		if ( $request->get_param( 'type' ) ) {
			$args['type'] = sanitize_key( (string) $request->get_param( 'type' ) );
		}
		return new WP_REST_Response( Accounting_Invoices::list_all( $args ) );
	}

	public static function invoices_get( WP_REST_Request $request ) {
		$res = Accounting_Invoices::get( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function invoices_create( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		$id   = Accounting_Invoices::create( (array) ( $body['header'] ?? $body ), (array) ( $body['lines'] ?? array() ) );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function invoices_post( WP_REST_Request $request ) {
		$res = Accounting_Invoices::post_to_gl( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'journal_id' => $res ) );
	}

	public static function invoices_moadian_send( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		$action = sanitize_key( (string) ( $body['action'] ?? 'send' ) );
		$id = Accounting_Moadian::enqueue_send( (int) $request['id'], $action );
		if ( is_wp_error( $id ) ) {
			return $id;
		}
		Accounting_Moadian::process_jobs( 5 );
		return new WP_REST_Response( array( 'job_id' => $id ) );
	}

	public static function invoices_moadian_inquiry( WP_REST_Request $request ) {
		$res = Accounting_Moadian::inquiry( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function expenses_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Expenses::list_all( self::list_args( $request ) ) );
	}

	public static function expenses_create( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		$id   = Accounting_Expenses::create( (array) ( $body['header'] ?? $body ), (array) ( $body['lines'] ?? array() ) );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function expenses_post( WP_REST_Request $request ) {
		$res = Accounting_Expenses::post( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'journal_id' => $res ) );
	}

	public static function cash_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Treasury::list_cash_accounts( self::list_args( $request ) ) );
	}

	public static function cash_create( WP_REST_Request $request ) {
		$id = Accounting_Treasury::create_cash_account( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function vouchers_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Treasury::list_vouchers( self::list_args( $request ) ) );
	}

	public static function vouchers_create( WP_REST_Request $request ) {
		$id = Accounting_Treasury::create_voucher( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function vouchers_post( WP_REST_Request $request ) {
		$res = Accounting_Treasury::post_voucher( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'journal_id' => $res ) );
	}

	public static function checks_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Treasury::list_checks( self::list_args( $request ) ) );
	}

	public static function checks_create( WP_REST_Request $request ) {
		$id = Accounting_Treasury::create_check( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function checks_status( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		$res  = Accounting_Treasury::set_check_status( (int) $request['id'], (string) ( $body['status'] ?? '' ) );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function warehouses_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Warehouses::list_warehouses( self::list_args( $request ) ) );
	}

	public static function warehouses_create( WP_REST_Request $request ) {
		$id = Accounting_Warehouses::create_warehouse( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function warehouse_stock( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Warehouses::list_stock( self::list_args( $request ) ) );
	}

	public static function warehouse_docs( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Warehouses::list_documents( self::list_args( $request ) ) );
	}

	public static function warehouse_doc_create( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		$id   = Accounting_Warehouses::create_document( (array) ( $body['header'] ?? $body ), (array) ( $body['items'] ?? array() ) );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function moadian_jobs( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Moadian::list_jobs( self::list_args( $request ) ) );
	}

	public static function moadian_process() {
		return new WP_REST_Response( Accounting_Moadian::process_jobs( 20 ) );
	}

	public static function projects_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Projects::list_projects( self::list_args( $request ) ) );
	}

	public static function projects_create( WP_REST_Request $request ) {
		$id = Accounting_Projects::create_project( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function projects_profit( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Projects::profit_summary( (int) $request['id'] ) );
	}

	public static function cc_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Projects::list_cost_centers( self::list_args( $request ) ) );
	}

	public static function cc_create( WP_REST_Request $request ) {
		$id = Accounting_Projects::create_cost_center( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function employees_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Payroll::list_employees( self::list_args( $request ) ) );
	}

	public static function employees_create( WP_REST_Request $request ) {
		$id = Accounting_Payroll::create_employee( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function employees_update( WP_REST_Request $request ) {
		$res = Accounting_Payroll::update_employee( (int) $request['id'], (array) $request->get_json_params() );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function workshops( WP_REST_Request $request ) {
		if ( 'POST' === $request->get_method() ) {
			$id = Accounting_Payroll::create_workshop( (array) $request->get_json_params() );
			return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
		}
		return new WP_REST_Response( Accounting_Payroll::list_workshops( self::list_args( $request ) ) );
	}

	public static function workshops_update( WP_REST_Request $request ) {
		$res = Accounting_Payroll::update_workshop( (int) $request['id'], (array) $request->get_json_params() );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function payroll_attendance( WP_REST_Request $request ) {
		$id = Accounting_Payroll::upsert_attendance( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function payroll_attendance_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Payroll::list_attendance( self::list_args( $request ) ) );
	}

	public static function tamin_jobs_search( WP_REST_Request $request ) {
		$q = (string) $request->get_param( 'q' );
		return new WP_REST_Response( Accounting_Tamin_Jobs::search( $q, (int) ( $request->get_param( 'per_page' ) ?: 50 ) ) );
	}

	public static function decrees( WP_REST_Request $request ) {
		if ( 'POST' === $request->get_method() ) {
			$id = Accounting_Payroll::create_decree( (array) $request->get_json_params() );
			return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
		}
		return new WP_REST_Response( Accounting_Payroll::list_decrees( self::list_args( $request ) ) );
	}

	public static function decree_get( WP_REST_Request $request ) {
		$res = Accounting_Payroll::get_decree( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function decree_update( WP_REST_Request $request ) {
		$res = Accounting_Payroll::update_decree( (int) $request['id'], (array) $request->get_json_params() );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function decree_issue( WP_REST_Request $request ) {
		$res = Accounting_Payroll::update_decree( (int) $request['id'], array( 'status' => 'issued' ) );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function payslip_print( WP_REST_Request $request ) {
		$html = Accounting_Payroll_Print::payslip( (int) $request['id'], true );
		if ( is_wp_error( $html ) ) {
			return $html;
		}
		return new WP_REST_Response( array( 'html' => $html ) );
	}

	public static function decree_print( WP_REST_Request $request ) {
		$html = Accounting_Payroll_Print::decree( (int) $request['id'], true );
		if ( is_wp_error( $html ) ) {
			return $html;
		}
		return new WP_REST_Response( array( 'html' => $html ) );
	}

	public static function my_payslips( WP_REST_Request $request ) {
		$res = Accounting_Payroll::my_payslips( self::list_args( $request ) );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function my_decrees( WP_REST_Request $request ) {
		$res = Accounting_Payroll::my_decrees( self::list_args( $request ) );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function payroll_list( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Payroll::list_runs( self::list_args( $request ) ) );
	}

	public static function payroll_create( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		if ( ! empty( $body['jalali_year'] ) && ! empty( $body['jalali_month'] ) ) {
			$id = Accounting_Payroll::create_run( $body );
		} else {
			$id = Accounting_Payroll::create_run( (string) ( $body['year_month'] ?? gmdate( 'Y-m' ) ) );
		}
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function payroll_get( WP_REST_Request $request ) {
		$res = Accounting_Payroll::get_run( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function payroll_recalc( WP_REST_Request $request ) {
		$res = Accounting_Payroll::recalc_run( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function payroll_post( WP_REST_Request $request ) {
		$res = Accounting_Payroll::post_run( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'journal_id' => $res ) );
	}

	public static function payroll_export( WP_REST_Request $request ) {
		$csv = Accounting_Payroll::export_csv( (int) $request['id'] );
		if ( is_wp_error( $csv ) ) {
			return $csv;
		}
		return new WP_REST_Response( array( 'csv' => $csv ) );
	}

	public static function payroll_tamin_dsk( WP_REST_Request $request ) {
		$res = Accounting_Tamin_List::export_zip( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function payroll_tamin_preview( WP_REST_Request $request ) {
		$res = Accounting_Tamin_List::preview( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function payslip_update( WP_REST_Request $request ) {
		$res = Accounting_Payroll::update_payslip( (int) $request['id'], (array) $request->get_json_params() );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function report_tb( WP_REST_Request $request ) {
		list( $from, $to ) = self::range( $request );
		return new WP_REST_Response( array( 'rows' => Accounting_Reports::trial_balance( $from, $to ) ) );
	}

	public static function report_pnl( WP_REST_Request $request ) {
		list( $from, $to ) = self::range( $request );
		return new WP_REST_Response( Accounting_Reports::profit_and_loss( $from, $to ) );
	}

	public static function report_bs( WP_REST_Request $request ) {
		$to = sanitize_text_field( (string) ( $request->get_param( 'to' ) ?: gmdate( 'Y-m-d' ) ) );
		return new WP_REST_Response( Accounting_Reports::balance_sheet( $to ) );
	}

	public static function report_vat( WP_REST_Request $request ) {
		list( $from, $to ) = self::range( $request );
		return new WP_REST_Response( Accounting_Reports::vat_summary( $from, $to ) );
	}

	public static function report_aging() {
		return new WP_REST_Response( Accounting_Reports::aging() );
	}

	public static function report_margin( WP_REST_Request $request ) {
		list( $from, $to ) = self::range( $request );
		return new WP_REST_Response( Accounting_Reports::sales_margin( $from, $to ) );
	}

	public static function report_tax_split( WP_REST_Request $request ) {
		list( $from, $to ) = self::range( $request );
		return new WP_REST_Response( Accounting_Reports::tax_split( $from, $to ) );
	}

	public static function report_cash_flow( WP_REST_Request $request ) {
		list( $from, $to ) = self::range( $request );
		return new WP_REST_Response( Accounting_Reports::cash_flow( $from, $to ) );
	}

	public static function report_kardex( WP_REST_Request $request ) {
		return new WP_REST_Response(
			array(
				'items' => Accounting_Extras::kardex(
					(int) $request->get_param( 'product_id' ),
					(int) $request->get_param( 'warehouse_id' )
				),
			)
		);
	}

	public static function installments( WP_REST_Request $request ) {
		if ( 'POST' === $request->get_method() ) {
			$id = Accounting_Installments::create( (array) $request->get_json_params() );
			return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
		}
		return new WP_REST_Response( Accounting_Installments::list( self::list_args( $request ) ) );
	}

	public static function installments_schedule( WP_REST_Request $request ) {
		$ids = Accounting_Installments::schedule( (array) $request->get_json_params() );
		return is_wp_error( $ids ) ? $ids : new WP_REST_Response( array( 'ids' => $ids ), 201 );
	}

	public static function installments_ras( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Installments::ras( (int) $request['person_id'] ) );
	}

	public static function production( WP_REST_Request $request ) {
		if ( 'POST' === $request->get_method() ) {
			$id = Accounting_Extras::create_production( (array) $request->get_json_params() );
			return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
		}
		return new WP_REST_Response( Accounting_Db::paginate( 'production', self::list_args( $request ) ) );
	}

	public static function production_post( WP_REST_Request $request ) {
		$res = Accounting_Extras::post_production( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function invoice_share( WP_REST_Request $request ) {
		$res = Accounting_Extras::create_share( (int) $request['id'] );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function rules( WP_REST_Request $request ) {
		if ( 'POST' === $request->get_method() ) {
			$id = Accounting_Extras::create_rule( (array) $request->get_json_params() );
			return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
		}
		return new WP_REST_Response( Accounting_Db::paginate( 'rules', self::list_args( $request ) ) );
	}

	public static function calculator( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Extras::calculator( (array) $request->get_json_params() ) );
	}

	public static function backup() {
		$res = Accounting_Extras::backup();
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function opening_balances( WP_REST_Request $request ) {
		$id = Accounting_Extras::opening_balance( (array) $request->get_json_params() );
		return is_wp_error( $id ) ? $id : new WP_REST_Response( array( 'id' => $id ), 201 );
	}

	public static function export_csv( WP_REST_Request $request ) {
		$resource = sanitize_key( (string) $request->get_param( 'resource' ) );
		$map      = array(
			'persons'  => 'persons',
			'products' => 'products',
			'invoices' => 'invoices',
			'checks'   => 'checks',
		);
		if ( ! isset( $map[ $resource ] ) ) {
			return new WP_Error( 'acc_export', __( 'Unknown export resource.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$list = Accounting_Db::paginate( $map[ $resource ], array( 'page' => 1, 'per_page' => 5000 ) );
		$csv  = Accounting_Extras::to_csv( $list['items'] ?? array() );
		return new WP_REST_Response(
			array(
				'csv'      => $csv,
				'filename' => $resource . '-' . gmdate( 'Ymd' ) . '.csv',
			)
		);
	}

	public static function sync_backfill( WP_REST_Request $request ) {
		$body  = (array) $request->get_json_params();
		$limit = absint( $body['limit'] ?? 50 );
		return new WP_REST_Response( Accounting_Woo_Sync::backfill( $limit ) );
	}

	public static function sync_order( WP_REST_Request $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'acc_order', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$res = Accounting_Woo_Sync::sync_order( $order );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'invoice_id' => $res ) );
	}

	public static function hesabfa_test() {
		$res = Accounting_Hesabfa::test_connection();
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function hesabfa_register_hook() {
		$res = Accounting_Hesabfa_Webhook::register_hook();
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function hesabfa_migrate( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		$res  = Accounting_Hesabfa_Migrate::start( $body );
		Accounting_Hesabfa_Sync::process_jobs( 3 );
		return new WP_REST_Response( $res );
	}

	public static function hesabfa_sync_now() {
		$res = Accounting_Hesabfa_Webhook::pull_changes();
		return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
	}

	public static function hesabfa_process() {
		return new WP_REST_Response( Accounting_Hesabfa_Sync::process_jobs( 25 ) );
	}

	public static function hesabfa_jobs( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Db::paginate( 'hesabfa_jobs', self::list_args( $request ) ) );
	}

	public static function hesabfa_log( WP_REST_Request $request ) {
		return new WP_REST_Response( Accounting_Db::paginate( 'hesabfa_log', self::list_args( $request ) ) );
	}

	public static function hesabfa_map( WP_REST_Request $request ) {
		$args = self::list_args( $request );
		$entity = sanitize_key( (string) $request->get_param( 'entity' ) );
		if ( $entity ) {
			$args['where_sql']    = 'AND entity_type = %s';
			$args['where_params'] = array( $entity );
		}
		return new WP_REST_Response( Accounting_Db::paginate( 'hesabfa_map', $args ) );
	}

	public static function hesabfa_push( WP_REST_Request $request ) {
		$entity = sanitize_key( (string) $request['entity'] );
		$id     = (int) $request['id'];
		$job    = Accounting_Hesabfa_Sync::enqueue( 'push', $entity, $id );
		if ( is_wp_error( $job ) ) {
			return $job;
		}
		Accounting_Hesabfa_Sync::process_jobs( 5 );
		return new WP_REST_Response( array( 'job_id' => $job ) );
	}

	public static function hesabfa_inquiry( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		$type = sanitize_key( (string) ( $body['type'] ?? '' ) );
		$map  = array(
			'credit'           => array( 'Accounting_Hesabfa_Client', 'inquiry_credit' ),
			'national'         => array( 'Accounting_Hesabfa_Client', 'inquiry_national_identity' ),
			'mobile_national'  => array( 'Accounting_Hesabfa_Client', 'inquiry_mobile_national' ),
			'card_national'    => array( 'Accounting_Hesabfa_Client', 'inquiry_card_national' ),
			'iban_national'    => array( 'Accounting_Hesabfa_Client', 'inquiry_iban_national' ),
			'iban'             => array( 'Accounting_Hesabfa_Client', 'inquiry_iban' ),
			'card'             => array( 'Accounting_Hesabfa_Client', 'inquiry_card' ),
			'card_to_iban'     => array( 'Accounting_Hesabfa_Client', 'inquiry_card_to_iban' ),
			'account_to_iban'  => array( 'Accounting_Hesabfa_Client', 'inquiry_account_to_iban' ),
			'postal'            => array( 'Accounting_Hesabfa_Client', 'inquiry_postal_code' ),
		);
		if ( ! isset( $map[ $type ] ) ) {
			return new WP_Error( 'hesabfa_inquiry', __( 'Unknown inquiry type.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$args = array();
		switch ( $type ) {
			case 'credit':
				break;
			case 'national':
				$args = array( $body['national_code'] ?? '', $body['birth_date'] ?? '' );
				break;
			case 'mobile_national':
				$args = array( $body['national_code'] ?? '', $body['mobile'] ?? '' );
				break;
			case 'card_national':
				$args = array( $body['national_code'] ?? '', $body['card_number'] ?? '', $body['birth_date'] ?? '' );
				break;
			case 'iban_national':
				$args = array( $body['national_code'] ?? '', $body['birth_date'] ?? '', $body['iban'] ?? '' );
				break;
			case 'iban':
				$args = array( $body['iban'] ?? '' );
				break;
			case 'card':
			case 'card_to_iban':
				$args = array( $body['card_number'] ?? '' );
				break;
			case 'account_to_iban':
				$args = array( $body['account'] ?? '', $body['bank'] ?? '' );
				break;
			case 'postal':
				$args = array( $body['postal_code'] ?? '' );
				break;
		}
		$res = call_user_func_array( $map[ $type ], $args );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'result' => $res ) );
	}

	public static function hesabfa_reports( WP_REST_Request $request ) {
		$body = (array) $request->get_json_params();
		$type = sanitize_key( (string) ( $body['type'] ?? 'trial_balance' ) );
		$params = isset( $body['params'] ) && is_array( $body['params'] ) ? $body['params'] : array();
		$map = array(
			'balance_sheet'       => 'report_balance_sheet',
			'debtors_creditors'   => 'report_debtors_creditors',
			'inventory'           => 'report_inventory',
			'pnl'                 => 'report_pnl',
			'trial_balance'       => 'report_trial_balance',
			'trial_balance_items' => 'report_trial_balance_items',
			'bank'                => 'report_bank',
			'cash'                => 'report_cash',
			'petty_cash'          => 'report_petty_cash',
			'journal'             => 'report_journal',
		);
		if ( ! isset( $map[ $type ] ) ) {
			return new WP_Error( 'hesabfa_report', __( 'Unknown report type.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$res = call_user_func( array( 'Accounting_Hesabfa_Client', $map[ $type ] ), $params );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'result' => $res ) );
	}

	public static function hesabfa_meta() {
		return new WP_REST_Response(
			array(
				'hook_url' => Accounting_Hesabfa_Webhook::hook_url(),
				'steps'    => Accounting_Hesabfa_Migrate::steps(),
				'enabled'  => Accounting_Hesabfa_Sync::enabled(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return array<string,mixed>
	 */
	private static function list_args( WP_REST_Request $request ) {
		return array(
			'page'     => absint( $request->get_param( 'page' ) ?: 1 ),
			'per_page' => absint( $request->get_param( 'per_page' ) ?: 50 ),
			'search'   => sanitize_text_field( (string) $request->get_param( 'search' ) ),
			'status'   => sanitize_key( (string) $request->get_param( 'status' ) ),
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return array{0:string,1:string}
	 */
	private static function range( WP_REST_Request $request ) {
		$from = sanitize_text_field( (string) ( $request->get_param( 'from' ) ?: gmdate( 'Y-m-01' ) ) );
		$to   = sanitize_text_field( (string) ( $request->get_param( 'to' ) ?: gmdate( 'Y-m-d' ) ) );
		return array( $from, $to );
	}
}
