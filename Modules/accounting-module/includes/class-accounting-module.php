<?php
/**
 * Accounting module lifecycle hooks.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Boot hooks.
 */
final class Webino_Accounting_Module {

	/**
	 * @return void
	 */
	public static function init() {
		Accounting_Schema::ensure();
		Accounting_Seed::maybe_seed();

		add_action( 'woocommerce_checkout_create_order_line_item', array( 'Accounting_Woo_Sync', 'snapshot_cogs_on_line' ), 20, 4 );
		add_action( 'woocommerce_order_status_changed', array( 'Accounting_Woo_Sync', 'on_status_changed' ), 30, 4 );
		add_action( 'webino_accounting_process_moadian', array( __CLASS__, 'cron_moadian' ) );
		add_filter( 'cron_schedules', array( __CLASS__, 'schedules' ) );
		if ( ! wp_next_scheduled( 'webino_accounting_process_moadian' ) ) {
			wp_schedule_event( time() + 120, 'accounting_five_minutes', 'webino_accounting_process_moadian' );
		}

		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_hpos' ) );
	}

	/**
	 * @return void
	 */
	public static function declare_hpos() {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', dirname( dirname( __FILE__ ) ) . '/bootstrap.php', true );
		}
	}

	/**
	 * @return void
	 */
	public static function cron_moadian() {
		Accounting_Moadian::process_jobs( 15 );
	}

	/**
	 * @param array<string,array<string,mixed>> $schedules Schedules.
	 * @return array<string,array<string,mixed>>
	 */
	public static function schedules( $schedules ) {
		$schedules['accounting_five_minutes'] = array(
			'interval' => 300,
			'display'  => __( 'Accounting every five minutes', 'webino-dashboard' ),
		);
		return $schedules;
	}
}
