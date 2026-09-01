<?php
/**
 * Accounting schema ensure (extends webino_acc_* tables).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * dbDelta for accounting tables + module extras.
 */
final class Accounting_Schema {
	const SCHEMA_OPTION = 'webino_accounting_schema_version';
	const SCHEMA_VERSION = '1.4.0';

	/**
	 * @return void
	 */
	public static function ensure() {
		$current = (string) get_option( self::SCHEMA_OPTION, '' );
		if ( self::SCHEMA_VERSION === $current ) {
			return;
		}
		self::install();
		update_option( self::SCHEMA_OPTION, self::SCHEMA_VERSION, false );
	}

	/**
	 * @return void
	 */
	public static function install() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset = $wpdb->get_charset_collate();
		$p       = $wpdb->prefix;

		$tables = array(
			self::sql_fiscal_years( $p, $charset ),
			self::sql_chart_accounts( $p, $charset ),
			self::sql_journal_entries( $p, $charset ),
			self::sql_journal_lines( $p, $charset ),
			self::sql_persons( $p, $charset ),
			self::sql_products( $p, $charset ),
			self::sql_invoices( $p, $charset ),
			self::sql_invoice_lines( $p, $charset ),
			self::sql_cash_accounts( $p, $charset ),
			self::sql_receipt_vouchers( $p, $charset ),
			self::sql_checks( $p, $charset ),
			self::sql_warehouses( $p, $charset ),
			self::sql_warehouse_documents( $p, $charset ),
			self::sql_warehouse_stock( $p, $charset ),
			self::sql_person_categories( $p, $charset ),
			self::sql_product_categories( $p, $charset ),
			self::sql_units( $p, $charset ),
			self::sql_price_lists( $p, $charset ),
			self::sql_price_list_items( $p, $charset ),
			self::sql_user_defaults( $p, $charset ),
			self::sql_expenses( $p, $charset ),
			self::sql_expense_lines( $p, $charset ),
			self::sql_projects( $p, $charset ),
			self::sql_cost_centers( $p, $charset ),
			self::sql_employees( $p, $charset ),
			self::sql_payroll_runs( $p, $charset ),
			self::sql_payslips( $p, $charset ),
			self::sql_moadian_jobs( $p, $charset ),
			self::sql_moadian_log( $p, $charset ),
			self::sql_stock_lots( $p, $charset ),
			self::sql_installments( $p, $charset ),
			self::sql_opening_balances( $p, $charset ),
			self::sql_invoice_shares( $p, $charset ),
			self::sql_production( $p, $charset ),
			self::sql_production_lines( $p, $charset ),
			self::sql_rules( $p, $charset ),
			self::sql_hesabfa_map( $p, $charset ),
			self::sql_hesabfa_jobs( $p, $charset ),
			self::sql_hesabfa_log( $p, $charset ),
			self::sql_bank_transfers( $p, $charset ),
			self::sql_workshops( $p, $charset ),
			self::sql_payroll_attendance( $p, $charset ),
			self::sql_tamin_jobs( $p, $charset ),
			self::sql_employment_decrees( $p, $charset ),
		);

		foreach ( $tables as $sql ) {
			dbDelta( $sql );
		}
	}

	private static function sql_fiscal_years( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_fiscal_years (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			title varchar(100) NOT NULL,
			starts_on date NOT NULL,
			ends_on date NOT NULL,
			is_closed tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_chart_accounts( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_chart_accounts (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			code varchar(50) NOT NULL,
			name varchar(255) NOT NULL,
			parent_id bigint(20) unsigned NULL,
			type varchar(50) NOT NULL,
			is_postable tinyint(1) NOT NULL DEFAULT 1,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY code (code),
			KEY parent_id (parent_id)
		) $c;";
	}

	private static function sql_journal_entries( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_journal_entries (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			fiscal_year_id bigint(20) unsigned NULL,
			document_no varchar(50) NULL,
			document_date date NOT NULL,
			description text NULL,
			status varchar(20) NOT NULL DEFAULT 'draft',
			source varchar(40) NULL,
			source_id bigint(20) unsigned NULL,
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY fiscal_year_id (fiscal_year_id),
			KEY source_lookup (source, source_id),
			KEY created_by (created_by)
		) $c;";
	}

	private static function sql_journal_lines( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_journal_lines (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			journal_entry_id bigint(20) unsigned NOT NULL,
			account_id bigint(20) unsigned NOT NULL,
			debit decimal(18,2) NOT NULL DEFAULT 0,
			credit decimal(18,2) NOT NULL DEFAULT 0,
			description text NULL,
			person_id bigint(20) unsigned NULL,
			project_id bigint(20) unsigned NULL,
			cost_center bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY journal_entry_id (journal_entry_id),
			KEY account_id (account_id),
			KEY person_id (person_id),
			KEY project_id (project_id)
		) $c;";
	}

	private static function sql_persons( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_persons (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(255) NOT NULL,
			type varchar(20) NOT NULL DEFAULT 'both',
			person_kind varchar(20) NOT NULL DEFAULT 'natural',
			legal_type varchar(40) NULL,
			national_id varchar(20) NULL,
			economic_code varchar(50) NULL,
			postal_code varchar(20) NULL,
			mobile varchar(30) NULL,
			address text NULL,
			province varchar(100) NULL,
			city varchar(100) NULL,
			category varchar(100) NULL,
			buyer_type tinyint(1) NOT NULL DEFAULT 1,
			wp_user_id bigint(20) unsigned NULL,
			sync_source varchar(40) NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY wp_user_id (wp_user_id),
			KEY national_id (national_id)
		) $c;";
	}

	private static function sql_products( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_products (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(255) NOT NULL,
			unit varchar(50) NULL,
			barcode varchar(100) NULL,
			category varchar(100) NULL,
			buy_price decimal(15,2) NOT NULL DEFAULT 0,
			sell_price decimal(15,2) NOT NULL DEFAULT 0,
			inventory_controlled tinyint(1) NOT NULL DEFAULT 0,
			wc_product_id bigint(20) unsigned NULL,
			sstid varchar(20) NULL,
			vat_rate decimal(5,2) NOT NULL DEFAULT 10,
			tax_exempt tinyint(1) NOT NULL DEFAULT 0,
			unit_id bigint(20) unsigned NULL,
			cogs_account_id bigint(20) unsigned NULL,
			sales_account_id bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY wc_product_id (wc_product_id),
			KEY sstid (sstid)
		) $c;";
	}

	private static function sql_invoices( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_invoices (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			type varchar(30) NOT NULL DEFAULT 'sale',
			number varchar(50) NULL,
			fiscal_year_id bigint(20) unsigned NULL,
			person_id bigint(20) unsigned NULL,
			document_date date NULL,
			status varchar(30) NOT NULL DEFAULT 'draft',
			items longtext NULL,
			subtotal decimal(18,2) NOT NULL DEFAULT 0,
			tax decimal(18,2) NOT NULL DEFAULT 0,
			total decimal(18,2) NOT NULL DEFAULT 0,
			wc_order_id bigint(20) unsigned NULL,
			inty tinyint(1) NOT NULL DEFAULT 2,
			inp tinyint(1) NOT NULL DEFAULT 1,
			ins tinyint(1) NOT NULL DEFAULT 1,
			taxid varchar(32) NULL,
			reference_uid varchar(64) NULL,
			moadian_status varchar(30) NOT NULL DEFAULT 'none',
			buyer_json longtext NULL,
			correction_of_id bigint(20) unsigned NULL,
			purchase_type varchar(30) NULL,
			project_id bigint(20) unsigned NULL,
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY wc_order_id (wc_order_id),
			KEY fiscal_year_id (fiscal_year_id),
			KEY person_id (person_id),
			KEY moadian_status (moadian_status),
			KEY taxid (taxid)
		) $c;";
	}

	private static function sql_invoice_lines( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_invoice_lines (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			invoice_id bigint(20) unsigned NOT NULL,
			product_id bigint(20) unsigned NULL,
			wc_product_id bigint(20) unsigned NULL,
			description varchar(255) NULL,
			sstid varchar(20) NULL,
			qty decimal(18,4) NOT NULL DEFAULT 1,
			unit_price decimal(18,2) NOT NULL DEFAULT 0,
			discount decimal(18,2) NOT NULL DEFAULT 0,
			vat_rate decimal(5,2) NOT NULL DEFAULT 0,
			vat_amount decimal(18,2) NOT NULL DEFAULT 0,
			line_total decimal(18,2) NOT NULL DEFAULT 0,
			cogs decimal(18,2) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY invoice_id (invoice_id)
		) $c;";
	}

	private static function sql_cash_accounts( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_cash_accounts (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			type varchar(30) NOT NULL DEFAULT 'bank',
			bank_name varchar(191) NULL,
			account_number varchar(100) NULL,
			sheba varchar(30) NULL,
			card_number varchar(30) NULL,
			chart_account_id bigint(20) unsigned NULL,
			is_active tinyint(1) NOT NULL DEFAULT 1,
			is_default tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_receipt_vouchers( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_receipt_vouchers (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			type varchar(30) NOT NULL DEFAULT 'receipt',
			number varchar(50) NULL,
			fiscal_year_id bigint(20) unsigned NULL,
			cash_account_id bigint(20) unsigned NULL,
			person_id bigint(20) unsigned NULL,
			amount decimal(18,2) NOT NULL DEFAULT 0,
			document_date date NULL,
			status varchar(30) NOT NULL DEFAULT 'draft',
			description text NULL,
			project_id bigint(20) unsigned NULL,
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_checks( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_checks (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			type varchar(30) NOT NULL DEFAULT 'receivable',
			number varchar(50) NULL,
			bank varchar(191) NULL,
			amount decimal(18,2) NOT NULL DEFAULT 0,
			due_date date NULL,
			status varchar(30) NOT NULL DEFAULT 'pending',
			cash_account_id bigint(20) unsigned NULL,
			person_id bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_warehouses( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_warehouses (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			address text NULL,
			is_default tinyint(1) NOT NULL DEFAULT 0,
			is_active tinyint(1) NOT NULL DEFAULT 1,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_warehouse_documents( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_warehouse_documents (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			type varchar(30) NOT NULL,
			warehouse_id bigint(20) unsigned NOT NULL,
			number varchar(50) NULL,
			document_date date NULL,
			status varchar(30) NOT NULL DEFAULT 'draft',
			reference varchar(191) NULL,
			items longtext NULL,
			notes text NULL,
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY warehouse_id (warehouse_id)
		) $c;";
	}

	private static function sql_warehouse_stock( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_warehouse_stock (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			warehouse_id bigint(20) unsigned NOT NULL,
			product_id bigint(20) unsigned NOT NULL,
			quantity decimal(18,4) NOT NULL DEFAULT 0,
			reorder_point decimal(18,4) NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY wh_prod (warehouse_id, product_id)
		) $c;";
	}

	private static function sql_person_categories( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_person_categories (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			sort_order int(10) unsigned NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_product_categories( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_product_categories (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			sort_order int(10) unsigned NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_units( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_units (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(50) NOT NULL,
			symbol varchar(20) NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_price_lists( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_price_lists (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			is_active tinyint(1) NOT NULL DEFAULT 1,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_price_list_items( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_price_list_items (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			price_list_id bigint(20) unsigned NOT NULL,
			product_id bigint(20) unsigned NOT NULL,
			price decimal(15,2) NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY price_list_id (price_list_id),
			KEY product_id (product_id)
		) $c;";
	}

	private static function sql_user_defaults( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_user_defaults (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			fiscal_year_id bigint(20) unsigned NULL,
			cash_account_id bigint(20) unsigned NULL,
			warehouse_id bigint(20) unsigned NULL,
			price_list_id bigint(20) unsigned NULL,
			tax_rate decimal(5,2) NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY user_id (user_id)
		) $c;";
	}

	private static function sql_expenses( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_expenses (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			number varchar(50) NULL,
			fiscal_year_id bigint(20) unsigned NULL,
			person_id bigint(20) unsigned NULL,
			document_date date NULL,
			status varchar(30) NOT NULL DEFAULT 'draft',
			total decimal(18,2) NOT NULL DEFAULT 0,
			tax decimal(18,2) NOT NULL DEFAULT 0,
			description text NULL,
			project_id bigint(20) unsigned NULL,
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_expense_lines( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_expense_lines (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			expense_id bigint(20) unsigned NOT NULL,
			account_id bigint(20) unsigned NULL,
			description varchar(255) NULL,
			amount decimal(18,2) NOT NULL DEFAULT 0,
			vat_amount decimal(18,2) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY expense_id (expense_id)
		) $c;";
	}

	private static function sql_projects( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_projects (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			code varchar(50) NULL,
			name varchar(191) NOT NULL,
			status varchar(30) NOT NULL DEFAULT 'open',
			budget decimal(18,2) NOT NULL DEFAULT 0,
			person_id bigint(20) unsigned NULL,
			starts_on date NULL,
			ends_on date NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_cost_centers( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_cost_centers (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			code varchar(50) NULL,
			name varchar(191) NOT NULL,
			is_active tinyint(1) NOT NULL DEFAULT 1,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_employees( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_employees (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			wp_user_id bigint(20) unsigned NULL,
			name varchar(191) NOT NULL,
			first_name varchar(100) NULL,
			last_name varchar(100) NULL,
			father_name varchar(100) NULL,
			gender varchar(10) NULL,
			national_id varchar(20) NULL,
			insurance_no varchar(30) NULL,
			job_title varchar(191) NULL,
			job_code varchar(40) NULL,
			insurance_start date NULL,
			insurance_end date NULL,
			marital_status varchar(20) NULL,
			children_count tinyint(3) unsigned NOT NULL DEFAULT 0,
			contract_type varchar(40) NULL,
			workshop_id bigint(20) unsigned NULL,
			base_salary decimal(18,2) NOT NULL DEFAULT 0,
			daily_wage decimal(18,2) NOT NULL DEFAULT 0,
			benefits decimal(18,2) NOT NULL DEFAULT 0,
			benefit_food decimal(18,2) NOT NULL DEFAULT 0,
			benefit_housing decimal(18,2) NOT NULL DEFAULT 0,
			benefit_child decimal(18,2) NOT NULL DEFAULT 0,
			benefit_marriage decimal(18,2) NOT NULL DEFAULT 0,
			benefit_seniority decimal(18,2) NOT NULL DEFAULT 0,
			benefit_transport decimal(18,2) NOT NULL DEFAULT 0,
			benefit_other_insurable decimal(18,2) NOT NULL DEFAULT 0,
			benefit_other_non_insurable decimal(18,2) NOT NULL DEFAULT 0,
			hardship_rate decimal(8,4) NOT NULL DEFAULT 0,
			hire_date date NULL,
			birth_date date NULL,
			id_issue_place varchar(100) NULL,
			iban varchar(34) NULL,
			current_decree_id bigint(20) unsigned NULL,
			department varchar(191) NULL,
			status varchar(30) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY national_id (national_id),
			KEY insurance_no (insurance_no),
			KEY workshop_id (workshop_id),
			KEY wp_user_id (wp_user_id),
			KEY current_decree_id (current_decree_id)
		) $c;";
	}

	private static function sql_payroll_runs( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_payroll_runs (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			year_month varchar(7) NOT NULL,
			jalali_year smallint(5) unsigned NULL,
			jalali_month tinyint(3) unsigned NULL,
			workshop_id bigint(20) unsigned NULL,
			status varchar(30) NOT NULL DEFAULT 'draft',
			list_status varchar(30) NOT NULL DEFAULT 'draft',
			total_gross decimal(18,2) NOT NULL DEFAULT 0,
			total_net decimal(18,2) NOT NULL DEFAULT 0,
			total_insurable decimal(18,2) NOT NULL DEFAULT 0,
			total_emp_ins decimal(18,2) NOT NULL DEFAULT 0,
			total_er_ins decimal(18,2) NOT NULL DEFAULT 0,
			total_unemployment decimal(18,2) NOT NULL DEFAULT 0,
			total_tax decimal(18,2) NOT NULL DEFAULT 0,
			days_in_month tinyint(3) unsigned NOT NULL DEFAULT 30,
			journal_entry_id bigint(20) unsigned NULL,
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY year_month_wh (year_month, workshop_id),
			KEY jalali (jalali_year, jalali_month),
			KEY workshop_id (workshop_id)
		) $c;";
	}

	private static function sql_payslips( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_payslips (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			run_id bigint(20) unsigned NOT NULL,
			employee_id bigint(20) unsigned NOT NULL,
			decree_id bigint(20) unsigned NULL,
			days_worked decimal(8,2) NOT NULL DEFAULT 0,
			gross decimal(18,2) NOT NULL DEFAULT 0,
			insurable_wage decimal(18,2) NOT NULL DEFAULT 0,
			insurable_capped decimal(18,2) NOT NULL DEFAULT 0,
			employee_insurance decimal(18,2) NOT NULL DEFAULT 0,
			employer_insurance decimal(18,2) NOT NULL DEFAULT 0,
			unemployment_insurance decimal(18,2) NOT NULL DEFAULT 0,
			taxable_income decimal(18,2) NOT NULL DEFAULT 0,
			tax decimal(18,2) NOT NULL DEFAULT 0,
			overtime decimal(18,2) NOT NULL DEFAULT 0,
			overtime_night decimal(18,2) NOT NULL DEFAULT 0,
			overtime_holiday decimal(18,2) NOT NULL DEFAULT 0,
			volume_pay decimal(18,2) NOT NULL DEFAULT 0,
			volume_qty decimal(18,4) NOT NULL DEFAULT 0,
			other_deductions decimal(18,2) NOT NULL DEFAULT 0,
			loan_deduction decimal(18,2) NOT NULL DEFAULT 0,
			advance_deduction decimal(18,2) NOT NULL DEFAULT 0,
			net decimal(18,2) NOT NULL DEFAULT 0,
			items_json longtext NULL,
			meta longtext NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY run_id (run_id),
			KEY employee_id (employee_id),
			KEY decree_id (decree_id)
		) $c;";
	}

	private static function sql_moadian_jobs( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_moadian_jobs (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			invoice_id bigint(20) unsigned NOT NULL,
			action varchar(40) NOT NULL DEFAULT 'send',
			status varchar(30) NOT NULL DEFAULT 'pending',
			attempts int(10) unsigned NOT NULL DEFAULT 0,
			uid varchar(64) NULL,
			reference_number varchar(64) NULL,
			last_error text NULL,
			run_after datetime NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY invoice_id (invoice_id),
			KEY status (status)
		) $c;";
	}

	private static function sql_moadian_log( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_moadian_log (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			invoice_id bigint(20) unsigned NULL,
			job_id bigint(20) unsigned NULL,
			direction varchar(10) NOT NULL DEFAULT 'out',
			endpoint varchar(191) NULL,
			http_code int(11) NULL,
			payload longtext NULL,
			response longtext NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY invoice_id (invoice_id)
		) $c;";
	}

	private static function sql_stock_lots( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_stock_lots (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			product_id bigint(20) unsigned NOT NULL,
			warehouse_id bigint(20) unsigned NOT NULL,
			lot_code varchar(100) NULL,
			serial_no varchar(100) NULL,
			qty decimal(18,4) NOT NULL DEFAULT 0,
			expires_on date NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY product_wh (product_id, warehouse_id),
			KEY expires_on (expires_on)
		) $c;";
	}

	private static function sql_installments( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_installments (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			person_id bigint(20) unsigned NOT NULL,
			invoice_id bigint(20) unsigned NULL,
			direction varchar(20) NOT NULL DEFAULT 'receivable',
			due_on date NOT NULL,
			amount decimal(18,2) NOT NULL DEFAULT 0,
			paid_amount decimal(18,2) NOT NULL DEFAULT 0,
			status varchar(20) NOT NULL DEFAULT 'open',
			interest_rate decimal(8,4) NOT NULL DEFAULT 0,
			notes text NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY person_id (person_id),
			KEY due_on (due_on),
			KEY status (status)
		) $c;";
	}

	private static function sql_opening_balances( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_opening_balances (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			fiscal_year_id bigint(20) unsigned NOT NULL,
			account_id bigint(20) unsigned NULL,
			person_id bigint(20) unsigned NULL,
			debit decimal(18,2) NOT NULL DEFAULT 0,
			credit decimal(18,2) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY fiscal_year_id (fiscal_year_id)
		) $c;";
	}

	private static function sql_invoice_shares( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_invoice_shares (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			invoice_id bigint(20) unsigned NOT NULL,
			token varchar(64) NOT NULL,
			expires_at datetime NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY token (token),
			KEY invoice_id (invoice_id)
		) $c;";
	}

	private static function sql_production( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_production (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			document_no varchar(50) NULL,
			document_date date NOT NULL,
			warehouse_id bigint(20) unsigned NULL,
			output_product_id bigint(20) unsigned NOT NULL,
			output_qty decimal(18,4) NOT NULL DEFAULT 0,
			status varchar(20) NOT NULL DEFAULT 'draft',
			notes text NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $c;";
	}

	private static function sql_production_lines( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_production_lines (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			production_id bigint(20) unsigned NOT NULL,
			product_id bigint(20) unsigned NOT NULL,
			qty decimal(18,4) NOT NULL DEFAULT 0,
			PRIMARY KEY  (id),
			KEY production_id (production_id)
		) $c;";
	}

	private static function sql_rules( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_rules (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			event_key varchar(80) NOT NULL,
			is_active tinyint(1) NOT NULL DEFAULT 1,
			config longtext NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY event_key (event_key)
		) $c;";
	}

	private static function sql_hesabfa_map( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_hesabfa_map (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			entity_type varchar(40) NOT NULL,
			local_id bigint(20) unsigned NOT NULL,
			remote_id bigint(20) unsigned NULL,
			remote_code varchar(80) NULL,
			content_hash varchar(64) NULL,
			remote_updated_at datetime NULL,
			last_synced_at datetime NULL,
			last_direction varchar(10) NULL,
			meta longtext NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY entity_local (entity_type, local_id),
			UNIQUE KEY entity_remote (entity_type, remote_id),
			KEY remote_code (entity_type, remote_code)
		) $c;";
	}

	private static function sql_hesabfa_jobs( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_hesabfa_jobs (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			action varchar(40) NOT NULL DEFAULT 'push',
			entity_type varchar(40) NOT NULL DEFAULT '',
			local_id bigint(20) unsigned NULL,
			remote_id bigint(20) unsigned NULL,
			remote_code varchar(80) NULL,
			status varchar(30) NOT NULL DEFAULT 'pending',
			attempts int(10) unsigned NOT NULL DEFAULT 0,
			payload longtext NULL,
			last_error text NULL,
			run_after datetime NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY status_run (status, run_after),
			KEY entity (entity_type, local_id)
		) $c;";
	}

	private static function sql_hesabfa_log( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_hesabfa_log (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			job_id bigint(20) unsigned NULL,
			direction varchar(10) NOT NULL DEFAULT 'out',
			endpoint varchar(191) NULL,
			http_code int(11) NULL,
			payload longtext NULL,
			response longtext NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY job_id (job_id),
			KEY created_at (created_at)
		) $c;";
	}

	private static function sql_bank_transfers( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_bank_transfers (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			number varchar(50) NULL,
			document_date date NULL,
			description text NULL,
			from_cash_account_id bigint(20) unsigned NULL,
			to_cash_account_id bigint(20) unsigned NULL,
			from_amount decimal(18,2) NOT NULL DEFAULT 0,
			to_amount decimal(18,2) NOT NULL DEFAULT 0,
			from_fee decimal(18,2) NOT NULL DEFAULT 0,
			to_fee decimal(18,2) NOT NULL DEFAULT 0,
			project varchar(191) NULL,
			status varchar(30) NOT NULL DEFAULT 'posted',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY document_date (document_date)
		) $c;";
	}

	private static function sql_workshops( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_workshops (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			code varchar(40) NOT NULL,
			name varchar(191) NOT NULL,
			row_code varchar(20) NULL,
			branch_code varchar(40) NULL,
			branch_name varchar(191) NULL,
			address text NULL,
			hardship_rate decimal(8,4) NOT NULL DEFAULT 0,
			is_default tinyint(1) NOT NULL DEFAULT 0,
			is_active tinyint(1) NOT NULL DEFAULT 1,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY code (code)
		) $c;";
	}

	private static function sql_payroll_attendance( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_payroll_attendance (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			employee_id bigint(20) unsigned NOT NULL,
			jalali_year smallint(5) unsigned NOT NULL,
			jalali_month tinyint(3) unsigned NOT NULL,
			absent_days decimal(8,2) NOT NULL DEFAULT 0,
			leave_days decimal(8,2) NOT NULL DEFAULT 0,
			unpaid_leave_days decimal(8,2) NOT NULL DEFAULT 0,
			sick_leave_days decimal(8,2) NOT NULL DEFAULT 0,
			overtime_hours decimal(10,2) NOT NULL DEFAULT 0,
			night_hours decimal(10,2) NOT NULL DEFAULT 0,
			holiday_hours decimal(10,2) NOT NULL DEFAULT 0,
			volume_qty decimal(18,4) NOT NULL DEFAULT 0,
			piece_rate decimal(18,4) NOT NULL DEFAULT 0,
			loan_deduction decimal(18,2) NOT NULL DEFAULT 0,
			advance_deduction decimal(18,2) NOT NULL DEFAULT 0,
			notes text NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY emp_month (employee_id, jalali_year, jalali_month)
		) $c;";
	}

	private static function sql_tamin_jobs( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_tamin_jobs (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			job_code varchar(40) NOT NULL,
			title varchar(255) NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY job_code (job_code),
			KEY title (title(100))
		) $c;";
	}

	private static function sql_employment_decrees( $p, $c ) {
		return "CREATE TABLE {$p}webino_acc_employment_decrees (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			employee_id bigint(20) unsigned NOT NULL,
			decree_no varchar(60) NOT NULL,
			decree_type varchar(40) NOT NULL DEFAULT 'hire',
			issue_date date NULL,
			effective_from date NOT NULL,
			effective_to date NULL,
			status varchar(30) NOT NULL DEFAULT 'draft',
			workshop_id bigint(20) unsigned NULL,
			job_title varchar(191) NULL,
			job_code varchar(40) NULL,
			department varchar(191) NULL,
			contract_type varchar(40) NULL,
			daily_wage decimal(18,2) NOT NULL DEFAULT 0,
			base_salary decimal(18,2) NOT NULL DEFAULT 0,
			benefit_food decimal(18,2) NOT NULL DEFAULT 0,
			benefit_housing decimal(18,2) NOT NULL DEFAULT 0,
			benefit_child decimal(18,2) NOT NULL DEFAULT 0,
			benefit_marriage decimal(18,2) NOT NULL DEFAULT 0,
			benefit_seniority decimal(18,2) NOT NULL DEFAULT 0,
			benefit_transport decimal(18,2) NOT NULL DEFAULT 0,
			benefit_responsibility decimal(18,2) NOT NULL DEFAULT 0,
			benefit_other_insurable decimal(18,2) NOT NULL DEFAULT 0,
			benefit_other_non_insurable decimal(18,2) NOT NULL DEFAULT 0,
			hardship_rate decimal(8,4) NOT NULL DEFAULT 0,
			items_json longtext NULL,
			previous_decree_id bigint(20) unsigned NULL,
			notes text NULL,
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY employee_id (employee_id),
			KEY decree_no (decree_no),
			KEY effective_from (effective_from),
			KEY status (status)
		) $c;";
	}
}
