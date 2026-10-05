<?php
/**
 * Basalam module runtime.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_Basalam_Module {
	public static function init() {
		add_filter( 'woocommerce_payment_gateways', array( __CLASS__, 'register_gateway' ) );
		add_action( 'woocommerce_api_webino_basalam_gateway', array( __CLASS__, 'gateway_callback' ) );
		add_action( 'webino_basalam_process_jobs', array( 'Basalam_Jobs', 'process_due' ) );
		add_filter( 'cron_schedules', array( __CLASS__, 'cron_schedules' ) );
		Basalam_Webhook_Handler::init();
		if ( ! wp_next_scheduled( 'webino_basalam_process_jobs' ) ) {
			wp_schedule_event( time() + 60, 'basalam_minute', 'webino_basalam_process_jobs' );
		}
	}

	public static function register_gateway( $methods ) {
		if ( class_exists( 'WC_Gateway_Basalam', false ) ) {
			$methods[] = 'WC_Gateway_Basalam';
		}
		return $methods;
	}

	public static function gateway_callback() {
		$order_id = isset( $_GET['order_id'] ) ? absint( wp_unslash( $_GET['order_id'] ) ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$hash     = isset( $_GET['hash_id'] ) ? sanitize_text_field( wp_unslash( $_GET['hash_id'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$key      = isset( $_GET['key'] ) ? sanitize_text_field( wp_unslash( $_GET['key'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( $order_id <= 0 ) {
			wp_die( esc_html__( 'Invalid Basalam payment callback.', 'webino-dashboard' ) );
		}

		$order = wc_get_order( $order_id );
		if ( ! $order || ( $key && ! hash_equals( $order->get_order_key(), $key ) ) ) {
			wp_die( esc_html__( 'Invalid order for Basalam callback.', 'webino-dashboard' ) );
		}

		if ( '' === $hash ) {
			$hash = (string) $order->get_meta( '_basalam_pay_hash_id' );
		}

		$res = Basalam_Gateway_Service::verify_payment( $order_id, $hash );
		if ( is_wp_error( $res ) ) {
			wc_add_notice( $res->get_error_message(), 'error' );
			wp_safe_redirect( $order->get_checkout_payment_url() );
			exit;
		}

		$slug = strtolower( (string) ( $res['status']['slug'] ?? '' ) );
		if ( 'success' === $slug || $order->is_paid() ) {
			wp_safe_redirect( $order->get_checkout_order_received_url() );
			exit;
		}

		wc_add_notice( __( 'Payment is still pending. Please wait or try again.', 'webino-dashboard' ), 'notice' );
		wp_safe_redirect( $order->get_checkout_payment_url() );
		exit;
	}

	public static function cron_schedules( $schedules ) {
		$schedules['basalam_minute'] = array(
			'interval' => 60,
			'display'  => 'Basalam every minute',
		);
		return $schedules;
	}
}
