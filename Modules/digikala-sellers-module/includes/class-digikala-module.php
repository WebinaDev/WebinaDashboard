<?php
/**
 * Digikala module lifecycle hooks.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_Digikala_Module {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'cron_schedules', array( __CLASS__, 'cron_schedules' ) );
		add_action( 'init', array( 'Digikala_Storage', 'ensure_schema' ) );
		add_action( 'init', array( 'Digikala_Webhook_Handler', 'register_rewrite' ) );
		add_action( 'template_redirect', array( 'Digikala_Webhook_Handler', 'handle_request' ) );
		add_action( 'webino_digikala_process_jobs', array( 'Digikala_Jobs', 'run_due_jobs' ) );
		add_action( 'woocommerce_update_product', array( 'Digikala_Inventory_Sync', 'on_product_updated' ), 20, 1 );
		add_action( 'woocommerce_update_product_variation', array( 'Digikala_Inventory_Sync', 'on_product_updated' ), 20, 1 );
		add_action( 'woocommerce_save_product_variation', array( 'Digikala_Inventory_Sync', 'on_product_updated' ), 20, 1 );
		add_action( 'woocommerce_product_set_stock', array( __CLASS__, 'on_stock_object' ), 20, 1 );
		add_action( 'woocommerce_variation_set_stock', array( __CLASS__, 'on_stock_object' ), 20, 1 );
		add_action( 'woocommerce_order_status_changed', array( 'Digikala_Order_Sync', 'on_order_status_changed' ), 20, 4 );
		add_action( 'webino_digikala_orders_pull', array( __CLASS__, 'cron_orders_pull' ) );
		if ( ! wp_next_scheduled( 'webino_digikala_process_jobs' ) ) {
			wp_schedule_event( time() + 60, 'minute', 'webino_digikala_process_jobs' );
		}
		if ( ! wp_next_scheduled( 'webino_digikala_orders_pull' ) ) {
			wp_schedule_event( time() + 180, 'fifteen_minutes', 'webino_digikala_orders_pull' );
		}
	}

	/**
	 * @param array<string,array<string,mixed>> $schedules Schedules.
	 * @return array<string,array<string,mixed>>
	 */
	public static function cron_schedules( $schedules ) {
		if ( ! isset( $schedules['minute'] ) ) {
			$schedules['minute'] = array(
				'interval' => 60,
				'display'  => __( 'Every Minute', 'webino-dashboard' ),
			);
		}
		if ( ! isset( $schedules['fifteen_minutes'] ) ) {
			$schedules['fifteen_minutes'] = array(
				'interval' => 15 * MINUTE_IN_SECONDS,
				'display'  => __( 'Every 15 Minutes', 'webino-dashboard' ),
			);
		}
		return $schedules;
	}

	/**
	 * @param WC_Product $product Product.
	 * @return void
	 */
	public static function on_stock_object( $product ) {
		if ( $product instanceof WC_Product ) {
			Digikala_Inventory_Sync::on_product_updated( $product->get_id() );
		}
	}

	/**
	 * @return void
	 */
	public static function cron_orders_pull() {
		Digikala_Jobs::enqueue( 'orders_pull', array( 'source' => 'cron', 'max_pages' => 8 ), 0 );
	}
}
