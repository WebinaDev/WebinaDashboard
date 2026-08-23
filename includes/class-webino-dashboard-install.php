<?php
/**
 * Database tables: accounting parity + core licenses.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Creates custom tables on activation.
 */
class Webino_Dashboard_Install {

	/**
	 * Create outbound license table if missing (e.g. plugin updated without re-activation).
	 *
	 * @return void
	 */
	public static function ensure_dashboard_license_table() {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();
		$p               = $wpdb->prefix;
		dbDelta( self::sql_dashboard_license( $p, $charset_collate ) );
	}

	/**
	 * Runs dbDelta for all plugin tables on activation.
	 *
	 * @return void
	 */
	public static function activate() {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();
		$p               = $wpdb->prefix;

		$tables = array(
			self::sql_fiscal_years( $p, $charset_collate ),
			self::sql_chart_accounts( $p, $charset_collate ),
			self::sql_journal_entries( $p, $charset_collate ),
			self::sql_journal_lines( $p, $charset_collate ),
			self::sql_persons( $p, $charset_collate ),
			self::sql_products( $p, $charset_collate ),
			self::sql_invoices( $p, $charset_collate ),
			self::sql_cash_accounts( $p, $charset_collate ),
			self::sql_receipt_vouchers( $p, $charset_collate ),
			self::sql_checks( $p, $charset_collate ),
			self::sql_warehouses( $p, $charset_collate ),
			self::sql_warehouse_documents( $p, $charset_collate ),
			self::sql_warehouse_stock( $p, $charset_collate ),
			self::sql_person_categories( $p, $charset_collate ),
			self::sql_product_categories( $p, $charset_collate ),
			self::sql_units( $p, $charset_collate ),
			self::sql_price_lists( $p, $charset_collate ),
			self::sql_price_list_items( $p, $charset_collate ),
			self::sql_user_defaults( $p, $charset_collate ),
			self::sql_core_licenses( $p, $charset_collate ),
			self::sql_dashboard_license( $p, $charset_collate ),
			self::sql_dashboard_bot_sessions( $p, $charset_collate ),
			self::sql_notifications( $p, $charset_collate ),
			self::sql_wallet_ledger( $p, $charset_collate ),
			self::sql_wallet_withdrawals( $p, $charset_collate ),
		);

		foreach ( $tables as $sql ) {
			dbDelta( $sql );
		}

		self::ensure_analytics_tables();

		update_option( 'webino_dashboard_db_version', WEBINO_DASHBOARD_VERSION );
		if ( class_exists( 'Webino_Dashboard_Assets', false ) && method_exists( 'Webino_Dashboard_Assets', 'purge_stale_build_assets' ) ) {
			Webino_Dashboard_Assets::purge_stale_build_assets();
		}
	}

	private static function sql_dashboard_bot_sessions( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_dashboard_bot_sessions (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			provider varchar(20) NOT NULL DEFAULT 'bale',
			chat_id varchar(64) NOT NULL,
			wp_user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			current_state varchar(64) NULL,
			temp_data longtext NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY provider_chat (provider, chat_id),
			KEY wp_user_id (wp_user_id)
		) $charset_collate;";
	}

	/**
	 * @return void
	 */
	public static function ensure_dashboard_bot_sessions_table() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset_collate = $wpdb->get_charset_collate();
		dbDelta( self::sql_dashboard_bot_sessions( $wpdb->prefix, $charset_collate ) );
	}

	/**
	 * @return void
	 */
	public static function ensure_analytics_tables() {
		if ( class_exists( 'Webino_Dashboard_Analytics_Db' ) ) {
			Webino_Dashboard_Analytics_Db::ensure_tables();
		}
	}

	/**
	 * @param string $p Prefix with trailing context e.g. wp_.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_fiscal_years( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_fiscal_years (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			title varchar(100) NOT NULL,
			starts_on date NOT NULL,
			ends_on date NOT NULL,
			is_closed tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_chart_accounts( $p, $charset_collate ) {
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
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_journal_entries( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_journal_entries (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			fiscal_year_id bigint(20) unsigned NULL,
			document_no varchar(50) NULL,
			document_date date NOT NULL,
			description text NULL,
			status varchar(20) NOT NULL DEFAULT 'draft',
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY fiscal_year_id (fiscal_year_id),
			KEY created_by (created_by)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_journal_lines( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_journal_lines (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			journal_entry_id bigint(20) unsigned NOT NULL,
			account_id bigint(20) unsigned NOT NULL,
			debit decimal(18,2) NOT NULL DEFAULT 0,
			credit decimal(18,2) NOT NULL DEFAULT 0,
			description text NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY journal_entry_id (journal_entry_id),
			KEY account_id (account_id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_persons( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_persons (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(255) NOT NULL,
			type varchar(20) NOT NULL DEFAULT 'both',
			national_id varchar(20) NULL,
			economic_code varchar(50) NULL,
			mobile varchar(30) NULL,
			address text NULL,
			category varchar(100) NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_products( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_products (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(255) NOT NULL,
			unit varchar(50) NULL,
			barcode varchar(100) NULL,
			category varchar(100) NULL,
			buy_price decimal(15,2) NOT NULL DEFAULT 0,
			sell_price decimal(15,2) NOT NULL DEFAULT 0,
			inventory_controlled tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_invoices( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_invoices (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			type varchar(30) NOT NULL DEFAULT 'proforma',
			number varchar(50) NULL,
			fiscal_year_id bigint(20) unsigned NULL,
			person_id bigint(20) unsigned NULL,
			document_date date NULL,
			status varchar(30) NOT NULL DEFAULT 'draft',
			items longtext NULL,
			subtotal decimal(18,2) NOT NULL DEFAULT 0,
			tax decimal(18,2) NOT NULL DEFAULT 0,
			total decimal(18,2) NOT NULL DEFAULT 0,
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY fiscal_year_id (fiscal_year_id),
			KEY person_id (person_id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_cash_accounts( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_cash_accounts (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			type varchar(30) NOT NULL DEFAULT 'bank',
			bank_name varchar(191) NULL,
			account_number varchar(100) NULL,
			sheba varchar(30) NULL,
			card_number varchar(30) NULL,
			is_active tinyint(1) NOT NULL DEFAULT 1,
			is_default tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_receipt_vouchers( $p, $charset_collate ) {
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
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_checks( $p, $charset_collate ) {
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
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_warehouses( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_warehouses (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			address text NULL,
			is_default tinyint(1) NOT NULL DEFAULT 0,
			is_active tinyint(1) NOT NULL DEFAULT 1,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_warehouse_documents( $p, $charset_collate ) {
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
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_warehouse_stock( $p, $charset_collate ) {
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
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_person_categories( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_person_categories (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			sort_order int(10) unsigned NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_product_categories( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_product_categories (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			sort_order int(10) unsigned NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_units( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_units (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(50) NOT NULL,
			symbol varchar(20) NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_price_lists( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_acc_price_lists (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(191) NOT NULL,
			is_active tinyint(1) NOT NULL DEFAULT 1,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_price_list_items( $p, $charset_collate ) {
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
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_user_defaults( $p, $charset_collate ) {
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
		) $charset_collate;";
	}

	/**
	 * Outbound CRM license cache (single row id=1).
	 *
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_dashboard_license( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_dashboard_license (
			id tinyint unsigned NOT NULL DEFAULT 1,
			domain varchar(255) NOT NULL DEFAULT '',
			status varchar(32) NOT NULL DEFAULT 'inactive',
			message text NULL,
			expiry_date datetime NULL,
			is_demo tinyint(1) NOT NULL DEFAULT 0,
			activated_at datetime NULL,
			last_check datetime NULL,
			license_key varchar(191) NULL,
			PRIMARY KEY  (id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_core_licenses( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_core_licenses (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			license_key varchar(191) NOT NULL,
			domain varchar(255) NULL,
			status varchar(50) NOT NULL DEFAULT 'active',
			expires_at datetime NULL,
			max_users int(10) unsigned NULL,
			meta longtext NULL,
			created_by bigint(20) unsigned NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY license_key (license_key),
			KEY domain_key (domain(191), license_key(100))
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_notifications( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_notifications (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			type varchar(50) NOT NULL DEFAULT 'info',
			title varchar(255) NOT NULL DEFAULT '',
			body text NULL,
			link varchar(500) NULL,
			read_at datetime NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY read_at (read_at)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_wallet_ledger( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_wallet_ledger (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			direction varchar(10) NOT NULL DEFAULT 'credit',
			amount decimal(18,2) NOT NULL DEFAULT 0,
			balance_after decimal(18,2) NOT NULL DEFAULT 0,
			reason varchar(100) NOT NULL DEFAULT '',
			ref_type varchar(50) NULL,
			ref_id bigint(20) unsigned NULL,
			note text NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id)
		) $charset_collate;";
	}

	/**
	 * @param string $p Prefix.
	 * @param string $charset_collate Charset.
	 * @return string
	 */
	private static function sql_wallet_withdrawals( $p, $charset_collate ) {
		return "CREATE TABLE {$p}webino_wallet_withdrawals (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			amount decimal(18,2) NOT NULL DEFAULT 0,
			sheba varchar(30) NOT NULL DEFAULT '',
			status varchar(20) NOT NULL DEFAULT 'pending',
			admin_note text NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY status (status)
		) $charset_collate;";
	}
}
