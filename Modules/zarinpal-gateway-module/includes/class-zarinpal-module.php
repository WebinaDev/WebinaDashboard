<?php
/**
 * ZarinPal module bootstrap hooks (WC registration, callback, HPOS, currencies).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Module lifecycle.
 */
final class Webino_Zarinpal_Module {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_payment_gateways', array( __CLASS__, 'register_gateway' ) );
		add_action( 'woocommerce_api_webino_zarinpal_gateway', array( __CLASS__, 'callback' ) );
		add_action( 'webino_zarinpal_process_jobs', array( 'Zarinpal_Jobs', 'process_due' ) );
		add_filter( 'cron_schedules', array( __CLASS__, 'schedules' ) );
		add_filter( 'woocommerce_currencies', array( __CLASS__, 'currencies' ) );
		add_filter( 'woocommerce_currency_symbol', array( __CLASS__, 'currency_symbol' ), 10, 2 );
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_hpos' ) );
		add_action( 'woocommerce_checkout_create_order', array( __CLASS__, 'persist_fee_meta_on_order' ), 20, 2 );

		if ( ! wp_next_scheduled( 'webino_zarinpal_process_jobs' ) ) {
			wp_schedule_event( time() + 60, 'zarinpal_minute', 'webino_zarinpal_process_jobs' );
		}
	}

	/**
	 * @return void
	 */
	public static function declare_hpos() {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
			$file = dirname( dirname( __FILE__ ) ) . '/bootstrap.php';
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', $file, true );
		}
	}

	/**
	 * @param string[] $methods Gateways.
	 * @return string[]
	 */
	public static function register_gateway( $methods ) {
		if ( class_exists( 'WC_Gateway_Zarinpal', false ) ) {
			$methods[] = 'WC_Gateway_Zarinpal';
		}
		return $methods;
	}

	/**
	 * Persist session fee data onto the order at checkout.
	 *
	 * @param WC_Order $order Order.
	 * @param array    $data  Checkout data.
	 * @return void
	 */
	public static function persist_fee_meta_on_order( $order, $data ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter
		if ( ! $order || ! function_exists( 'WC' ) || ! WC()->session ) {
			return;
		}
		$method = isset( $data['payment_method'] ) ? (string) $data['payment_method'] : '';
		if ( Zarinpal_Config::GATEWAY_ID !== $method ) {
			return;
		}
		$fee = WC()->session->get( 'webino_zarinpal_fee_data' );
		if ( is_array( $fee ) && ! empty( $fee['suggested_amount'] ) ) {
			$order->update_meta_data( '_zarinpal_fee_data', $fee );
		}
	}

	/**
	 * Payment return callback.
	 *
	 * @return void
	 */
	public static function callback() {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- ZarinPal redirect callback; authenticity via stored Authority.
		$order_id  = isset( $_GET['order_id'] ) ? absint( wp_unslash( $_GET['order_id'] ) ) : 0;
		$authority = isset( $_GET['Authority'] ) ? sanitize_text_field( wp_unslash( $_GET['Authority'] ) ) : '';
		$status    = isset( $_GET['Status'] ) ? sanitize_text_field( wp_unslash( $_GET['Status'] ) ) : '';
		// phpcs:enable

		$cfg     = Zarinpal_Config::get();
		$failed  = (string) $cfg['failed_message'];
		$success = (string) $cfg['success_message'];

		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			wc_add_notice( __( 'Order not found.', 'webino-dashboard' ), 'error' );
			wp_safe_redirect( function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : home_url( '/' ) );
			exit;
		}

		if ( $order->is_paid() ) {
			wp_safe_redirect( $order->get_checkout_order_received_url() );
			exit;
		}

		$gateway = null;
		if ( function_exists( 'WC' ) && WC()->payment_gateways() ) {
			$gateways = WC()->payment_gateways()->payment_gateways();
			$gateway  = $gateways[ Zarinpal_Config::GATEWAY_ID ] ?? null;
		}

		if ( 'OK' !== strtoupper( $status ) ) {
			$cancel_fault = (string) ( $cfg['cancelled_message'] ?? '' );
			if ( '' === $cancel_fault ) {
				$cancel_fault = (string) Zarinpal_Config::defaults()['cancelled_message'];
			}
			$msg = str_replace( '{fault}', $cancel_fault, $failed );
			$order->update_status( 'failed', $msg );
			wc_add_notice( $msg, 'error' );
			wp_safe_redirect( function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : $order->get_checkout_order_received_url() );
			exit;
		}

		$stored  = (string) $order->get_meta( '_zarinpal_authority' );
		$history = $order->get_meta( '_zarinpal_authority_history' );
		$valid   = ( '' !== $authority && $authority === $stored );
		if ( ! $valid && is_array( $history ) && in_array( $authority, $history, true ) ) {
			$valid = true;
		}
		if ( ! $valid ) {
			$order->add_order_note( __( 'Zarinpal callback authority mismatch.', 'webino-dashboard' ) );
			$token_fault = (string) ( $cfg['invalid_token_message'] ?? '' );
			if ( '' === $token_fault ) {
				$token_fault = (string) Zarinpal_Config::defaults()['invalid_token_message'];
			}
			$msg = str_replace( '{fault}', $token_fault, $failed );
			wc_add_notice( $msg, 'error' );
			wp_safe_redirect( function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : home_url( '/' ) );
			exit;
		}

		$res = Zarinpal_Gateway_Service::verify_payment( $order, $authority );
		if ( is_wp_error( $res ) ) {
			$msg = str_replace( '{fault}', $res->get_error_message(), $failed );
			$order->update_status( 'failed', $msg );
			wc_add_notice( $msg, 'error' );
			wp_safe_redirect( function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : home_url( '/' ) );
			exit;
		}

		$ref = (string) ( $res['ref_id'] ?? $order->get_meta( '_zarinpal_ref_id' ) );
		wc_add_notice( str_replace( '{transaction_id}', $ref, $success ), 'success' );
		if ( function_exists( 'WC' ) && WC()->cart ) {
			WC()->cart->empty_cart();
		}

		$return = ( $gateway instanceof WC_Payment_Gateway ) ? $gateway->get_return_url( $order ) : $order->get_checkout_order_received_url();
		wp_safe_redirect( $return );
		exit;
	}

	/**
	 * @param array<string,array<string,mixed>> $schedules Schedules.
	 * @return array<string,array<string,mixed>>
	 */
	public static function schedules( $schedules ) {
		$schedules['zarinpal_minute'] = array(
			'interval' => 60,
			'display'  => __( 'Zarinpal every minute', 'webino-dashboard' ),
		);
		return $schedules;
	}

	/**
	 * @param array<string,string> $currencies Currencies.
	 * @return array<string,string>
	 */
	public static function currencies( $currencies ) {
		$currencies['IRR']  = __( 'Iranian Rial', 'webino-dashboard' );
		$currencies['IRT']  = __( 'Iranian Toman', 'webino-dashboard' );
		$currencies['IRHR'] = __( 'Iranian Hezar Rial', 'webino-dashboard' );
		$currencies['IRHT'] = __( 'Iranian Hezar Toman', 'webino-dashboard' );
		return $currencies;
	}

	/**
	 * @param string $symbol   Symbol.
	 * @param string $currency Currency.
	 * @return string
	 */
	public static function currency_symbol( $symbol, $currency ) {
		switch ( strtoupper( (string) $currency ) ) {
			case 'IRR':
				return 'ریال';
			case 'IRT':
			case 'TOMAN':
				return 'تومان';
			case 'IRHR':
				return 'هزار ریال';
			case 'IRHT':
				return 'هزار تومان';
		}
		return $symbol;
	}
}
