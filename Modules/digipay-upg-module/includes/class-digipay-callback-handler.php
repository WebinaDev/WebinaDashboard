<?php
/**
 * DigiPay callback receiver.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digipay_Callback_Handler {

	/**
	 * @return string
	 */
	public static function callback_url() {
		return add_query_arg( 'wc-api', 'webino_digipay_upg', home_url( '/' ) );
	}

	/**
	 * Format a DigiPay customer-facing message template.
	 *
	 * @param string               $template Template with {tracking_code} / {fault}.
	 * @param array<string,string> $vars     Replacements.
	 * @return string
	 */
	private static function format_message( $template, array $vars ) {
		$out = (string) $template;
		foreach ( $vars as $key => $value ) {
			$out = str_replace( '{' . $key . '}', (string) $value, $out );
		}
		return $out;
	}

	/**
	 * @return void
	 */
	public static function handle() {
		$payload     = wp_unslash( $_POST ); // phpcs:ignore WordPress.Security.NonceVerification
		$provider_id = isset( $payload['providerId'] ) ? sanitize_text_field( (string) $payload['providerId'] ) : '';
		$tracking    = isset( $payload['trackingCode'] ) ? sanitize_text_field( (string) $payload['trackingCode'] ) : '';
		$result      = isset( $payload['result'] ) ? sanitize_text_field( (string) $payload['result'] ) : 'FAILURE';
		$type_set    = array_key_exists( 'type', $payload );
		$type        = $type_set ? (int) $payload['type'] : -1;
		$amount      = isset( $payload['amount'] ) ? (int) $payload['amount'] : 0;

		$cfg     = Digipay_OAuth::settings();
		$failed  = (string) ( $cfg['failed_message'] ?? Digipay_OAuth::defaults()['failed_message'] );
		$success = (string) ( $cfg['success_message'] ?? Digipay_OAuth::defaults()['success_message'] );
		$cancel  = (string) ( $cfg['cancelled_message'] ?? Digipay_OAuth::defaults()['cancelled_message'] );

		$order_id = self::find_order_id_by_provider( $provider_id );
		if ( $order_id <= 0 ) {
			wp_safe_redirect( wc_get_checkout_url() );
			exit;
		}
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order ) {
			wp_safe_redirect( wc_get_checkout_url() );
			exit;
		}

		if ( Digipay_Order_Service::amount_in_rial( $order ) !== $amount ) {
			$msg = self::format_message( $failed, array( 'fault' => 'عدم تطابق مبلغ' ) );
			$order->update_status( 'failed', $msg );
			Digipay_Lifecycle::log_event( $order_id, 'callback', false, 'Amount mismatch' );
			wc_add_notice( $msg, 'error' );
			wp_safe_redirect( $order->get_checkout_order_received_url() );
			exit;
		}

		if ( 'SUCCESS' !== strtoupper( $result ) ) {
			$msg = self::format_message( $failed, array( 'fault' => $cancel ) );
			$order->update_status( 'failed', $msg );
			Digipay_Lifecycle::log_event( $order_id, 'callback', false, 'Result was not SUCCESS' );
			wc_add_notice( $msg, 'error' );
			wp_safe_redirect( $order->get_cancel_order_url_raw() );
			exit;
		}

		if ( $order->is_paid() ) {
			wp_safe_redirect( $order->get_checkout_order_received_url() );
			exit;
		}

		$gateway_key = str_replace( 'digipay_', '', (string) $order->get_payment_method() );
		$verify_type = Digipay_Order_Service::resolve_verify_type( $gateway_key, $type );
		$verify      = Digipay_Api_Client::verify_purchase( $verify_type, $tracking, $provider_id );

		if ( is_wp_error( $verify ) ) {
			$msg = self::format_message( $failed, array( 'fault' => $verify->get_error_message() ) );
			$order->update_status( 'failed', $msg );
			Digipay_Lifecycle::log_event( $order_id, 'purchases/verify', false, $verify->get_error_message() );
			wc_add_notice( $msg, 'error' );
			wp_safe_redirect( $order->get_cancel_order_url_raw() );
			exit;
		}

		$order->payment_complete( $tracking );
		$order->update_meta_data( '_digipay_provider_id', $provider_id );
		$order->update_meta_data( '_digipay_tracking_code', $tracking );
		$order->update_meta_data( '_digipay_transaction_id', $tracking );
		$order->update_meta_data( '_digipay_type', (string) $verify_type );
		if ( isset( $verify['paymentGateway'] ) ) {
			$order->update_meta_data( '_digipay_payment_gateway', (string) $verify['paymentGateway'] );
		}
		$order->save();

		Digipay_Lifecycle::log_event( $order_id, 'purchases/verify', true, 'Payment verified successfully' );
		wc_add_notice( self::format_message( $success, array( 'tracking_code' => $tracking ) ), 'success' );
		if ( function_exists( 'WC' ) && WC()->cart ) {
			WC()->cart->empty_cart();
		}
		wp_safe_redirect( $order->get_checkout_order_received_url() );
		exit;
	}

	/**
	 * @param string $provider_id Provider id.
	 * @return int
	 */
	private static function find_order_id_by_provider( $provider_id ) {
		if ( '' === $provider_id ) {
			return 0;
		}
		$orders = wc_get_orders(
			array(
				'limit'      => 1,
				'return'     => 'ids',
				'meta_query' => array(
					array(
						'key'   => '_digipay_provider_id',
						'value' => $provider_id,
					),
				),
			)
		);
		return empty( $orders ) ? 0 : (int) $orders[0];
	}
}
