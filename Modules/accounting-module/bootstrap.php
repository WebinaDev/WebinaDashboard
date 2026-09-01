<?php
/**
 * Accounting module bootstrap.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$dir = dirname( __FILE__ ) . '/includes/';

if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
	|| ! Webino_Dashboard_Module_Registry::require_module_files(
		$dir,
		array(
			'class-accounting-config.php',
			'class-accounting-schema.php',
			'class-accounting-seed.php',
			'class-accounting-db.php',
			'services/class-accounting-journal.php',
			'services/class-accounting-chart.php',
			'services/class-accounting-fiscal.php',
			'services/class-accounting-persons.php',
			'services/class-accounting-products.php',
			'services/class-accounting-invoices.php',
			'services/class-accounting-expenses.php',
			'services/class-accounting-treasury.php',
			'services/class-accounting-warehouses.php',
			'services/class-accounting-woo-sync.php',
			'services/class-accounting-projects.php',
			'services/class-accounting-payroll.php',
			'services/class-accounting-payroll-print.php',
			'services/class-accounting-reports.php',
			'services/class-accounting-installments.php',
			'services/class-accounting-extras.php',
			'moadian/class-accounting-moadian-client.php',
			'moadian/class-accounting-moadian.php',
			'hesabfa/class-accounting-hesabfa-client.php',
			'hesabfa/class-accounting-hesabfa-sync.php',
			'hesabfa/class-accounting-hesabfa-migrate.php',
			'hesabfa/class-accounting-hesabfa-webhook.php',
			'hesabfa/class-accounting-hesabfa.php',
			'tamin/class-accounting-tamin-dbf.php',
			'tamin/class-accounting-tamin-list.php',
			'tamin/class-accounting-tamin-jobs.php',
			'class-accounting-module.php',
			'class-webino-dashboard-rest-accounting.php',
		),
		'accounting-module'
	) ) {
	return;
}

Webino_Accounting_Module::init();
Webino_Dashboard_REST_Accounting::init();
Accounting_Hesabfa::init();
Accounting_Seed::ensure_payroll_accounts();
Accounting_Tamin_Jobs::maybe_seed();
