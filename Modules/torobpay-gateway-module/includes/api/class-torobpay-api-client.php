<?php
/**
 * TorobPay Online Merchant API client.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * First-party TorobPay HTTP client.
 */
final class Webino_TorobPay_Api_Client {

	/**
	 * @return string|WP_Error
	 */
	public static function get_access_token() {
		$cached = get_transient( Webino_TorobPay_Config::TOKEN_KEY );
		if ( is_string( $cached ) && '' !== $cached ) {
			return $cached;
		}
		$legacy = get_transient( 'torobpay_bearer_token' );
		if ( is_string( $legacy ) && '' !== $legacy ) {
			return $legacy;
		}
		$s = Webino_TorobPay_Config::get();
		foreach ( array( 'client_id', 'client_secret', 'client_username', 'client_password', 'base_url' ) as $k ) {
			if ( empty( $s[ $k ] ) ) {
				return new WP_Error( 'torobpay_missing_credentials', __( 'TorobPay credentials are incomplete.', 'webino-dashboard' ) );
			}
		}
		$secret   = str_replace( 'amp;', '', (string) $s['client_secret'] );
		$password = str_replace( 'amp;', '', (string) $s['client_password'] );
		$url      = trailingslashit( (string) $s['base_url'] ) . 'api/online/v1/oauth/token';
		$res      = wp_remote_post(
			$url,
			array(
				'timeout' => 30,
				'headers' => array(
					'Authorization' => 'Basic ' . base64_encode( $s['client_id'] . ':' . $secret ),
					'Content-Type'  => 'application/x-www-form-urlencoded',
					'User-Agent'    => 'WebinoTorobPay, ' . $s['client_id'],
				),
				'body'    => http_build_query(
					array(
						'grant_type' => 'password',
						'scope'      => 'online-merchant',
						'username'   => $s['client_username'],
						'password'   => $password,
					)
				),
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$body = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		$code = (int) wp_remote_retrieve_response_code( $res );
		if ( $code < 200 || $code >= 300 || ! is_array( $body ) || empty( $body['access_token'] ) ) {
			return new WP_Error( 'torobpay_oauth_failed', __( 'TorobPay OAuth failed.', 'webino-dashboard' ), array( 'status' => $code, 'body' => $body ) );
		}
		$token = (string) $body['access_token'];
		$ttl   = isset( $body['expires_in'] ) ? max( 60, (int) $body['expires_in'] - 30 ) : 300;
		set_transient( Webino_TorobPay_Config::TOKEN_KEY, $token, $ttl );
		set_transient( 'torobpay_bearer_token', $token, $ttl );
		return $token;
	}

	/**
	 * @param string              $method Method.
	 * @param string              $path Path.
	 * @param array<string,mixed> $args Args.
	 * @param bool                $retried Retried.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function request( $method, $path, array $args = array(), $retried = false ) {
		$token = self::get_access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}
		$s   = Webino_TorobPay_Config::get();
		$url = trailingslashit( (string) $s['base_url'] ) . ltrim( $path, '/' );
		$req = array(
			'method'  => strtoupper( (string) $method ),
			'timeout' => 30,
			'headers' => array(
				'Authorization' => 'Bearer ' . $token,
				'Content-Type'  => 'application/json',
				'User-Agent'    => 'WebinoTorobPay, ' . $s['client_id'],
			),
		);
		if ( 'GET' === $req['method'] ) {
			if ( ! empty( $args ) ) {
				$url = add_query_arg( $args, $url );
			}
		} else {
			$req['body'] = wp_json_encode( $args );
		}
		$res  = wp_remote_request( $url, $req );
		$code = is_wp_error( $res ) ? 0 : (int) wp_remote_retrieve_response_code( $res );
		if ( 401 === $code && ! $retried ) {
			delete_transient( Webino_TorobPay_Config::TOKEN_KEY );
			delete_transient( 'torobpay_bearer_token' );
			return self::request( $method, $path, $args, true );
		}
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$raw  = (string) wp_remote_retrieve_body( $res );
		$body = json_decode( $raw, true );
		if ( ! is_array( $body ) ) {
			return new WP_Error( 'torobpay_bad_json', __( 'Invalid TorobPay response.', 'webino-dashboard' ), array( 'status' => $code, 'body' => $raw ) );
		}
		if ( $code < 200 || $code >= 300 ) {
			$msg = isset( $body['message'] ) ? (string) $body['message'] : __( 'TorobPay API error.', 'webino-dashboard' );
			return new WP_Error( 'torobpay_api_error', $msg, array( 'status' => $code, 'body' => $body ) );
		}
		return $body;
	}

	/** @return array<string,mixed>|WP_Error */
	public static function eligible( $amount_rial ) {
		return self::request( 'GET', 'api/online/offer/v1/eligible', array( 'amount' => (int) $amount_rial ) );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function create_token( array $payload ) {
		return self::request( 'POST', 'api/online/payment/v1/token', $payload );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function verify( $payment_token ) {
		return self::request( 'POST', 'api/online/payment/v1/verify', array( 'paymentToken' => (string) $payment_token ) );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function settle( $payment_token ) {
		return self::request( 'POST', 'api/online/payment/v1/settle', array( 'paymentToken' => (string) $payment_token ) );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function cancel( $payment_token ) {
		return self::request( 'POST', 'api/online/payment/v1/cancel', array( 'paymentToken' => (string) $payment_token ) );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function status( $payment_token ) {
		return self::request( 'GET', 'api/online/payment/v1/status', array( 'paymentToken' => (string) $payment_token ) );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function update_payment( array $payload ) {
		return self::request( 'POST', 'api/online/payment/v1/update', $payload );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function list_payments( array $query = array() ) {
		return self::request( 'GET', 'api/online/payment/v1/list', $query );
	}

	/**
	 * Auto-provision credentials endpoint.
	 *
	 * @return array<string,mixed>|WP_Error
	 */
	public static function fetch_credentials() {
		$s   = Webino_TorobPay_Config::get();
		$url = trailingslashit( (string) $s['base_url'] ) . 'api/online/v1/oauth/credential';
		$res = wp_remote_get( $url, array( 'timeout' => 25 ) );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$body = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		$code = (int) wp_remote_retrieve_response_code( $res );
		if ( $code < 200 || $code >= 300 || ! is_array( $body ) ) {
			return new WP_Error( 'torobpay_provision_failed', __( 'Could not fetch TorobPay credentials.', 'webino-dashboard' ), array( 'status' => $code, 'body' => $body ) );
		}
		return $body;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,mixed>
	 */
	public static function build_cart_list( WC_Order $order ) {
		$currency = $order->get_currency();
		$items    = array();
		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof WC_Order_Item_Product ) {
				continue;
			}
			$product = $item->get_product();
			$pid     = $product ? $product->get_id() : (int) $item->get_product_id();
			$terms   = get_the_terms( $pid, 'product_cat' );
			$cat     = ( $terms && ! is_wp_error( $terms ) && isset( $terms[0] ) ) ? $terms[0]->name : '';
			$commission = '';
			if ( $terms && ! is_wp_error( $terms ) ) {
				foreach ( $terms as $term ) {
					$c = (string) get_term_meta( $term->term_id, 'trb_commission_type', true );
					if ( '' !== $c ) {
						$commission = $c;
					}
				}
			}
			$row = array(
				'name'     => $item->get_name(),
				'count'    => max( 1, (int) $item->get_quantity() ),
				'amount'   => Webino_Payment_Money::to_rial( $product ? (float) $product->get_price( 'edit' ) : (float) $item->get_total(), $currency ),
				'id'       => $pid,
				'category' => $cat,
			);
			if ( '' !== $commission ) {
				$row['commissionType'] = $commission;
			}
			$items[] = $row;
		}
		$data = $order->get_data();
		return array(
			'cartId'             => (string) $order->get_id(),
			'totalAmount'        => Webino_Payment_Money::order_total_rial( $order ),
			'cartItems'          => $items,
			'taxAmount'          => ! empty( $data['total_tax'] ) ? Webino_Payment_Money::to_rial( (float) $data['total_tax'], $currency ) : 0,
			'shippingAmount'     => ! empty( $data['shipping_total'] ) ? Webino_Payment_Money::to_rial( (float) $data['shipping_total'], $currency ) : 0,
			'isShipmentIncluded' => ! empty( $data['shipping_total'] ) && (float) $data['shipping_total'] > 0,
			'isTaxIncluded'      => ! empty( $data['total_tax'] ) && (float) $data['total_tax'] > 0,
		);
	}

	/**
	 * @param WC_Order $order Order.
	 * @param string   $transaction_id Tx id.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function payment_token_for_order( WC_Order $order, $transaction_id ) {
		$return = add_query_arg(
			array(
				'wc_order'      => $order->get_id(),
				'key'           => $order->get_order_key(),
				'transactionId' => $transaction_id,
			),
			Webino_TorobPay_Config::callback_url()
		);
		$data = array(
			'amount'               => Webino_Payment_Money::order_total_rial( $order ),
			'paymentMethodTypeDto' => 'INSTALLMENT',
			'returnURL'            => $return,
			'transactionId'        => (string) $transaction_id,
			'cartList'             => array( self::build_cart_list( $order ) ),
			'discountAmount'       => Webino_Payment_Money::to_rial( (float) $order->get_discount_total(), $order->get_currency() ),
			'name'                 => trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ),
			'province'             => (string) $order->get_billing_state(),
			'city'                 => (string) $order->get_billing_city(),
			'address'              => (string) $order->get_billing_address_1(),
			'postalCode'           => (string) $order->get_billing_postcode(),
		);
		$mobile = Webino_Payment_Money::normalize_mobile( $order->get_billing_phone() );
		if ( '' !== $mobile ) {
			$data['mobile'] = $mobile;
		}
		return self::create_token( $data );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function test_connection() {
		$token = self::get_access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}
		$eligible = self::eligible( 1000000 );
		if ( is_wp_error( $eligible ) ) {
			return $eligible;
		}
		return array( 'ok' => true, 'eligible' => $eligible );
	}
}
