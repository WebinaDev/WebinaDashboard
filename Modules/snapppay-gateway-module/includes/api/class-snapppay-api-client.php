<?php
/**
 * SnappPay Online Merchant API client.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * First-party SnappPay HTTP client (OAuth + installment payment APIs).
 */
final class Webino_SnappPay_Api_Client {

	/**
	 * @return string|WP_Error
	 */
	public static function get_access_token() {
		$cached = get_transient( Webino_SnappPay_Config::TOKEN_KEY );
		if ( is_string( $cached ) && '' !== $cached ) {
			return $cached;
		}
		// Compat with official plugin transient.
		$legacy = get_transient( 'snapppay_bearer_token' );
		if ( is_string( $legacy ) && '' !== $legacy ) {
			return $legacy;
		}

		$s = Webino_SnappPay_Config::get();
		foreach ( array( 'client_id', 'client_secret', 'client_username', 'client_password', 'base_url' ) as $k ) {
			if ( empty( $s[ $k ] ) ) {
				return new WP_Error( 'snapppay_missing_credentials', __( 'SnappPay credentials are incomplete.', 'webino-dashboard' ) );
			}
		}

		$secret   = str_replace( 'amp;', '', (string) $s['client_secret'] );
		$password = str_replace( 'amp;', '', (string) $s['client_password'] );
		$url      = trailingslashit( (string) $s['base_url'] ) . 'api/online/v1/oauth/token';

		$res = wp_remote_post(
			$url,
			array(
				'timeout' => 30,
				'headers' => array(
					'Authorization' => 'Basic ' . base64_encode( $s['client_id'] . ':' . $secret ),
					'Content-Type'  => 'application/x-www-form-urlencoded',
					'User-Agent'    => 'WebinoSnappPay, ' . $s['client_id'],
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
			return new WP_Error( 'snapppay_oauth_failed', __( 'SnappPay OAuth failed.', 'webino-dashboard' ), array( 'status' => $code, 'body' => $body ) );
		}
		$token = (string) $body['access_token'];
		$ttl   = isset( $body['expires_in'] ) ? max( 60, (int) $body['expires_in'] - 30 ) : 300;
		set_transient( Webino_SnappPay_Config::TOKEN_KEY, $token, $ttl );
		set_transient( 'snapppay_bearer_token', $token, $ttl );
		return $token;
	}

	/**
	 * @param string               $method   GET|POST.
	 * @param string               $path     Relative path.
	 * @param array<string,mixed>  $args     Query or JSON body.
	 * @param bool                 $retried  Internal.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function request( $method, $path, array $args = array(), $retried = false ) {
		$token = self::get_access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}
		$s   = Webino_SnappPay_Config::get();
		$url = trailingslashit( (string) $s['base_url'] ) . ltrim( $path, '/' );
		$req = array(
			'method'  => strtoupper( (string) $method ),
			'timeout' => 30,
			'headers' => array(
				'Authorization' => 'Bearer ' . $token,
				'Content-Type'  => 'application/json',
				'User-Agent'    => 'WebinoSnappPay, ' . $s['client_id'],
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
			delete_transient( Webino_SnappPay_Config::TOKEN_KEY );
			delete_transient( 'snapppay_bearer_token' );
			return self::request( $method, $path, $args, true );
		}
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$raw  = (string) wp_remote_retrieve_body( $res );
		$body = json_decode( $raw, true );
		if ( ! is_array( $body ) ) {
			return new WP_Error( 'snapppay_bad_json', __( 'Invalid SnappPay response.', 'webino-dashboard' ), array( 'status' => $code, 'body' => $raw ) );
		}
		if ( $code < 200 || $code >= 300 ) {
			$msg = isset( $body['message'] ) ? (string) $body['message'] : __( 'SnappPay API error.', 'webino-dashboard' );
			return new WP_Error( 'snapppay_api_error', $msg, array( 'status' => $code, 'body' => $body ) );
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
	public static function revert( $payment_token ) {
		return self::request( 'POST', 'api/online/payment/v1/revert', array( 'paymentToken' => (string) $payment_token ) );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function status( $payment_token ) {
		return self::request( 'GET', 'api/online/payment/v1/status', array( 'paymentToken' => (string) $payment_token ) );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function update_payment( array $payload ) {
		return self::request( 'POST', 'api/online/payment/v1/update', $payload );
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,mixed>
	 */
	public static function build_cart_list( WC_Order $order ) {
		$s        = Webino_SnappPay_Config::get();
		$currency = $order->get_currency();
		$items    = array();
		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof WC_Order_Item_Product ) {
				continue;
			}
			$product = $item->get_product();
			$pid     = $product ? $product->get_id() : (int) $item->get_product_id();
			list( $commission, $category ) = self::product_category_meta( $pid );
			$row = array(
				'name'     => $item->get_name(),
				'count'    => max( 1, (int) $item->get_quantity() ),
				'amount'   => class_exists( 'Webino_Payment_Money', false )
					? Webino_Payment_Money::to_rial( $product ? (float) $product->get_price( 'edit' ) : (float) $item->get_total(), $currency )
					: (int) round( (float) $item->get_total() * 10 ),
				'id'       => $pid,
				'category' => $category,
			);
			if ( ! empty( $s['has_comission'] ) ) {
				$row['commissionType'] = $commission;
			}
			$items[] = $row;
		}
		$total = class_exists( 'Webino_Payment_Money', false )
			? Webino_Payment_Money::order_total_rial( $order )
			: (int) round( (float) $order->get_total() * 10 );
		$data  = $order->get_data();
		return array(
			'cartId'             => (string) $order->get_id(),
			'totalAmount'        => $total,
			'cartItems'          => $items,
			'taxAmount'          => ! empty( $data['total_tax'] ) ? Webino_Payment_Money::to_rial( (float) $data['total_tax'], $currency ) : 0,
			'shippingAmount'     => ! empty( $data['shipping_total'] ) ? Webino_Payment_Money::to_rial( (float) $data['shipping_total'], $currency ) : 0,
			'isShipmentIncluded' => ! empty( $data['shipping_total'] ) && (float) $data['shipping_total'] > 0,
			'isTaxIncluded'      => ! empty( $data['total_tax'] ) && (float) $data['total_tax'] > 0,
		);
	}

	/**
	 * @param int $product_id Product id.
	 * @return array{0:string,1:string}
	 */
	private static function product_category_meta( $product_id ) {
		$terms = get_the_terms( $product_id, 'product_cat' );
		if ( ( ! $terms || is_wp_error( $terms ) ) && function_exists( 'wc_get_product' ) ) {
			$p = wc_get_product( $product_id );
			if ( $p && $p->get_parent_id() ) {
				$terms = get_the_terms( $p->get_parent_id(), 'product_cat' );
			}
		}
		if ( ! $terms || is_wp_error( $terms ) ) {
			return array( '', '' );
		}
		$commission = '';
		$name       = '';
		$main       = null;
		foreach ( $terms as $term ) {
			$name = $term->name;
			$c    = (string) get_term_meta( $term->term_id, 'snp_commission_type', true );
			if ( '' !== $c ) {
				$commission = $c;
			}
			if ( 0 === (int) $term->parent ) {
				$main = $term;
			}
		}
		if ( '' === $commission && $main ) {
			$commission = (string) get_term_meta( $main->term_id, 'snp_commission_type', true );
			$name       = $main->name;
		}
		return array( $commission, $name );
	}

	/**
	 * @param WC_Order $order Order.
	 * @param string   $transaction_id Transaction id.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function payment_token_for_order( WC_Order $order, $transaction_id ) {
		$amount = Webino_Payment_Money::order_total_rial( $order );
		$return = add_query_arg( 'wc_order', $order->get_id(), Webino_SnappPay_Config::callback_url() );
		$data   = array(
			'amount'               => $amount,
			'paymentMethodTypeDto' => 'INSTALLMENT',
			'returnURL'            => $return,
			'transactionId'        => (string) $transaction_id,
			'cartList'             => array( self::build_cart_list( $order ) ),
			'discountAmount'       => Webino_Payment_Money::to_rial( (float) $order->get_discount_total(), $order->get_currency() ),
		);
		$mobile = Webino_Payment_Money::normalize_mobile( $order->get_billing_phone() );
		if ( '' !== $mobile ) {
			$data['mobile'] = $mobile;
		}
		return self::create_token( $data );
	}

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function test_connection() {
		$token = self::get_access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}
		$eligible = self::eligible( 1000000 );
		if ( is_wp_error( $eligible ) ) {
			return $eligible;
		}
		return array(
			'ok'       => true,
			'eligible' => $eligible,
		);
	}
}
