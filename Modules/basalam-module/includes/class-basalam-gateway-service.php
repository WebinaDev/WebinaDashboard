<?php
/**
 * Basalam App Store payment gateway (official OpenAPI pay endpoints).
 *
 * @package WebinoDashboard
 * @see https://developers.basalam.com/docs/payment/quick-start
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Basalam_Gateway_Service {
	/**
	 * Amount in Rial for Basalam pay API (WC totals are typically Toman for IRR shops).
	 *
	 * @param WC_Order $order Order.
	 * @return int
	 */
	public static function order_amount_rial( $order ) {
		$total = (float) $order->get_total();
		$currency = strtoupper( (string) $order->get_currency() );
		// Iranian stores usually store Toman in WooCommerce; Basalam expects Rial.
		if ( in_array( $currency, array( 'IRT', 'TMN', 'TOMAN' ), true ) || apply_filters( 'webino_basalam_gateway_total_is_toman', true, $order ) ) {
			$rial = (int) round( $total * 10 );
		} else {
			$rial = (int) round( $total );
		}
		return max( 10000, $rial );
	}

	/**
	 * @param string              $method HTTP method.
	 * @param string              $path Path under pay API base (e.g. /v1/pay/...).
	 * @param array<string,mixed> $body Body.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function pay_request( $method, $path, array $body = array() ) {
		$cfg  = Basalam_Config::get();
		$base = rtrim( (string) ( $cfg['pay_api_base'] ?? 'https://openapi.basalam.com' ), '/' );
		$url  = $base . '/' . ltrim( $path, '/' );

		$headers = array(
			'Content-Type' => 'application/json',
			'Accept'       => 'application/json',
		);

		if ( ! empty( $cfg['gateway_sandbox'] ) ) {
			$headers['x-sandbox'] = (string) ( $cfg['gateway_sandbox_token'] ?: 'demo-team-1' );
		} else {
			$secret = (string) ( $cfg['gateway_secret'] ?? '' );
			if ( '' === $secret ) {
				return new WP_Error( 'basalam_gateway_secret', __( 'Basalam gateway secret is not configured.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			$headers['X-Gateway-Secret'] = $secret;
		}

		$args = array(
			'method'  => strtoupper( $method ),
			'timeout' => 30,
			'headers' => $headers,
		);
		if ( ! empty( $body ) ) {
			$args['body'] = wp_json_encode( $body );
		}

		$res = wp_remote_request( $url, $args );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$code = (int) wp_remote_retrieve_response_code( $res );
		$raw  = (string) wp_remote_retrieve_body( $res );
		$data = json_decode( $raw, true );
		if ( ! is_array( $data ) ) {
			$data = array( 'raw' => $raw );
		}
		if ( $code < 200 || $code >= 300 ) {
			$message = isset( $data['message'] ) ? (string) $data['message'] : __( 'Basalam payment API request failed.', 'webino-dashboard' );
			return new WP_Error(
				'basalam_pay_api_error',
				$message,
				array(
					'status' => 502,
					'code'   => $code,
					'data'   => $data,
				)
			);
		}
		return $data;
	}

	/**
	 * Create pre-transaction and return pay_url.
	 *
	 * @param WC_Order $order Order.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function create_payment( $order ) {
		$existing = (string) $order->get_meta( '_basalam_pay_hash_id' );
		$existing_url = (string) $order->get_meta( '_basalam_pay_url' );
		if ( '' !== $existing && '' !== $existing_url ) {
			return array(
				'hash_id'       => $existing,
				'pay_url'       => $existing_url,
				'redirect_url'  => $existing_url,
				'idempotent'    => true,
			);
		}

		$reference = 'WD-WC-' . $order->get_id() . '-' . time();
		$callback  = add_query_arg(
			array(
				'wc-api'   => 'webino_basalam_gateway',
				'order_id' => $order->get_id(),
				'key'      => $order->get_order_key(),
			),
			home_url( '/' )
		);

		$payload = array(
			'reference_id' => $reference,
			'amount'       => self::order_amount_rial( $order ),
			'callback_url' => $callback,
			'description'  => sprintf(
				/* translators: %d: order id */
				__( 'WooCommerce order #%d', 'webino-dashboard' ),
				$order->get_id()
			),
		);

		$res = self::pay_request( 'POST', '/v1/pay/pre-transactions', $payload );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$hash = sanitize_text_field( (string) ( $res['hash_id'] ?? '' ) );
		$pay  = esc_url_raw( (string) ( $res['pay_url'] ?? '' ) );
		if ( '' === $hash || '' === $pay ) {
			return new WP_Error( 'basalam_pay_invalid', __( 'Basalam did not return a payment URL.', 'webino-dashboard' ) );
		}

		$order->update_meta_data( '_basalam_pay_hash_id', $hash );
		$order->update_meta_data( '_basalam_pay_url', $pay );
		$order->update_meta_data( '_basalam_pay_reference_id', $reference );
		$order->save();

		$res['redirect_url'] = $pay;
		return $res;
	}

	/**
	 * Inquire then verify payment for an order hash_id.
	 *
	 * @param int    $order_id Order ID.
	 * @param string $hash_id Hash ID from Basalam.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function verify_payment( $order_id, $hash_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order ) {
			return new WP_Error( 'basalam_order', __( 'Order not found.', 'webino-dashboard' ) );
		}

		$hash_id = sanitize_text_field( $hash_id );
		if ( '' === $hash_id ) {
			$hash_id = (string) $order->get_meta( '_basalam_pay_hash_id' );
		}
		if ( '' === $hash_id ) {
			return new WP_Error( 'basalam_hash', __( 'Missing Basalam payment hash.', 'webino-dashboard' ) );
		}

		$inquiry = self::pay_request( 'GET', '/v1/pay/transactions/' . rawurlencode( $hash_id ) . '/inquiry' );
		if ( is_wp_error( $inquiry ) ) {
			return $inquiry;
		}

		$slug = strtolower( (string) ( $inquiry['status']['slug'] ?? '' ) );
		if ( 'unverified' === $slug ) {
			$verify = self::pay_request( 'POST', '/v1/pay/transactions/' . rawurlencode( $hash_id ) . '/verify' );
			if ( is_wp_error( $verify ) ) {
				return $verify;
			}
			$inquiry = $verify;
			$slug    = strtolower( (string) ( $inquiry['status']['slug'] ?? '' ) );
		}

		if ( 'success' === $slug ) {
			if ( ! $order->is_paid() ) {
				$order->payment_complete( $hash_id );
				$order->add_order_note( __( 'Basalam payment verified.', 'webino-dashboard' ) );
				$order->update_meta_data( '_basalam_pay_status', 'success' );
				$order->save();
			}
			return $inquiry;
		}

		if ( in_array( $slug, array( 'failed', 'refunded' ), true ) ) {
			$order->update_meta_data( '_basalam_pay_status', $slug );
			$order->save();
			return new WP_Error( 'basalam_pay_failed', __( 'Basalam payment was not successful.', 'webino-dashboard' ), array( 'data' => $inquiry ) );
		}

		// pending / processing — leave unpaid.
		$order->update_meta_data( '_basalam_pay_status', $slug ?: 'pending' );
		$order->save();
		return $inquiry;
	}
}
