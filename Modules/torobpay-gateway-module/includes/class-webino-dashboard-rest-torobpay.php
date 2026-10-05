<?php
/**
 * TorobPay dashboard REST.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_Dashboard_REST_TorobPay {

	const NS = 'webino-dashboard/v1';

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		if ( did_action( 'rest_api_init' ) ) {
			self::register_routes();
		}
	}

	public static function can_manage() {
		return class_exists( 'Webino_Dashboard_Rest_Base', false )
			&& Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
	}

	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/torobpay/settings',
			array(
				array(
					'methods'             => 'GET',
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => static function () {
						return new WP_REST_Response( array( 'settings' => Webino_TorobPay_Config::get_public() ) );
					},
				),
				array(
					'methods'             => 'POST',
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => array( __CLASS__, 'save_settings' ),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/torobpay/status',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'status' ),
			)
		);
		register_rest_route(
			self::NS,
			'/torobpay/test-connection',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => static function () {
					$res = Webino_TorobPay_Api_Client::test_connection();
					return is_wp_error( $res ) ? $res : new WP_REST_Response( $res );
				},
			)
		);
		register_rest_route(
			self::NS,
			'/torobpay/fetch-credentials',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'fetch_credentials' ),
			)
		);
		register_rest_route(
			self::NS,
			'/torobpay/logs',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => static function () {
					$logs = get_option( Webino_TorobPay_Config::LOG_OPTION, array() );
					return new WP_REST_Response( array( 'logs' => is_array( $logs ) ? $logs : array() ) );
				},
			)
		);
		register_rest_route(
			self::NS,
			'/torobpay/orders',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'orders' ),
			)
		);
		register_rest_route(
			self::NS,
			'/torobpay/orders/(?P<id>\d+)/probe',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'probe' ),
			)
		);
		register_rest_route(
			self::NS,
			'/torobpay/orders/(?P<id>\d+)/refund',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'refund' ),
			)
		);
		register_rest_route(
			self::NS,
			'/torobpay/orders/(?P<id>\d+)/fail',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'fail_order' ),
			)
		);
		register_rest_route(
			self::NS,
			'/torobpay/campaign',
			array(
				array(
					'methods'             => 'GET',
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => array( __CLASS__, 'campaign_get' ),
				),
				array(
					'methods'             => 'POST',
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => array( __CLASS__, 'campaign_post' ),
				),
			)
		);
	}

	public static function save_settings( WP_REST_Request $req ) {
		$body = $req->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$data = isset( $body['settings'] ) && is_array( $body['settings'] ) ? $body['settings'] : $body;
		return new WP_REST_Response( array( 'settings' => Webino_TorobPay_Config::save( $data ) ) );
	}

	public static function status() {
		$cfg = Webino_TorobPay_Config::get_public();
		$wc  = false;
		if ( function_exists( 'WC' ) && WC()->payment_gateways() ) {
			$all = WC()->payment_gateways()->payment_gateways();
			$wc  = isset( $all[ Webino_TorobPay_Config::GATEWAY_ID ] );
		}
		return new WP_REST_Response(
			array(
				'woocommerce'            => class_exists( 'WooCommerce', false ),
				'gateway_registered'     => $wc,
				'official_plugin_active' => Webino_TorobPay_Config::official_plugin_active(),
				'gateway_source'         => $cfg['gateway_source'],
				'credentials_ready'      => '' !== (string) Webino_TorobPay_Config::get()['client_id'],
			)
		);
	}

	public static function fetch_credentials() {
		$res = Webino_TorobPay_Api_Client::fetch_credentials();
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$data = Webino_TorobPay_Config::get();
		if ( ! empty( $res['client_id'] ) ) {
			$data['client_id'] = sanitize_text_field( (string) $res['client_id'] );
		}
		if ( ! empty( $res['client_secret'] ) ) {
			$data['client_secret'] = sanitize_text_field( (string) $res['client_secret'] );
		}
		if ( ! empty( $res['username'] ) ) {
			$data['client_username'] = sanitize_text_field( (string) $res['username'] );
		}
		if ( ! empty( $res['password'] ) ) {
			$data['client_password'] = sanitize_text_field( (string) $res['password'] );
		}
		return new WP_REST_Response( array( 'settings' => Webino_TorobPay_Config::save( $data ), 'raw' => $res ) );
	}

	public static function orders( WP_REST_Request $req ) {
		$page = max( 1, (int) $req->get_param( 'page' ) );
		$per  = min( 50, max( 5, (int) ( $req->get_param( 'per_page' ) ?: 20 ) ) );
		$q    = array(
			'payment_method' => Webino_TorobPay_Config::GATEWAY_ID,
			'limit'          => $per,
			'page'           => $page,
			'paginate'       => true,
			'orderby'        => 'date',
			'order'          => 'DESC',
		);
		$status = sanitize_key( (string) $req->get_param( 'status' ) );
		if ( $status ) {
			$q['status'] = $status;
		}
		$result = wc_get_orders( $q );
		$items  = array();
		$orders = is_object( $result ) && isset( $result->orders ) ? $result->orders : (array) $result;
		foreach ( $orders as $order ) {
			if ( ! $order instanceof WC_Order ) {
				continue;
			}
			$items[] = array(
				'id'            => $order->get_id(),
				'number'        => $order->get_order_number(),
				'status'        => $order->get_status(),
				'total'         => $order->get_total(),
				'currency'      => $order->get_currency(),
				'date'          => $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : '',
				'torob_status'  => (string) $order->get_meta( '_torobpay_cached_status' ),
				'token'         => (string) $order->get_meta( '_order_torobpay_token' ) ? 'yes' : 'no',
				'billing_phone' => $order->get_billing_phone(),
			);
		}
		return new WP_REST_Response(
			array(
				'items' => $items,
				'total' => is_object( $result ) && isset( $result->total ) ? (int) $result->total : count( $items ),
				'page'  => $page,
			)
		);
	}

	public static function probe( WP_REST_Request $req ) {
		$order = wc_get_order( (int) $req['id'] );
		if ( ! $order instanceof WC_Order ) {
			return new WP_Error( 'torobpay_order_missing', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$token = (string) $order->get_meta( '_order_torobpay_token' );
		if ( '' === $token ) {
			return new WP_Error( 'torobpay_no_token', __( 'Missing token.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$res = Webino_TorobPay_Api_Client::status( $token );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$remote = isset( $res['response']['status'] ) ? (string) $res['response']['status'] : (string) ( $res['status'] ?? '' );
		if ( $remote ) {
			$order->update_meta_data( '_torobpay_cached_status', $remote );
			$order->update_meta_data( '_torobpay_cached_status_time', time() );
			$order->save();
		}
		return new WP_REST_Response( array( 'status' => $remote, 'raw' => $res ) );
	}

	public static function refund( WP_REST_Request $req ) {
		$body   = $req->get_json_params();
		$amount = is_array( $body ) && isset( $body['amount'] ) ? (float) $body['amount'] : 0;
		$reason = is_array( $body ) && isset( $body['reason'] ) ? sanitize_text_field( (string) $body['reason'] ) : '';
		$res    = Webino_TorobPay_Refund::refund_order( (int) $req['id'], $amount, $reason );
		return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function fail_order( WP_REST_Request $req ) {
		$order = wc_get_order( (int) $req['id'] );
		if ( ! $order instanceof WC_Order ) {
			return new WP_Error( 'torobpay_order_missing', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$order->update_status( 'failed', 'Marked failed via TorobPay dashboard.' );
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function campaign_get() {
		$s   = Webino_TorobPay_Config::get();
		$url = trailingslashit( (string) $s['base_url'] ) . 'merchant/campaign-data-result/';
		$token = Webino_TorobPay_Api_Client::get_access_token();
		if ( is_wp_error( $token ) ) {
			return new WP_REST_Response( array( 'items' => array(), 'error' => $token->get_error_message() ) );
		}
		$res = wp_remote_get(
			$url,
			array(
				'timeout' => 25,
				'headers' => array( 'Authorization' => 'Bearer ' . $token ),
			)
		);
		if ( is_wp_error( $res ) ) {
			return new WP_REST_Response( array( 'items' => array(), 'error' => $res->get_error_message() ) );
		}
		$body = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		return new WP_REST_Response( array( 'items' => is_array( $body ) ? $body : array(), 'raw' => $body ) );
	}

	public static function campaign_post( WP_REST_Request $req ) {
		$files = $req->get_file_params();
		if ( empty( $files['file']['tmp_name'] ) ) {
			return new WP_Error( 'torobpay_no_file', __( 'CSV file required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$token = Webino_TorobPay_Api_Client::get_access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}
		$s    = Webino_TorobPay_Config::get();
		$url  = trailingslashit( (string) $s['base_url'] ) . 'merchant/upload-campaign-data/';
		$body = array(
			'file' => class_exists( 'CURLFile' )
				? new CURLFile( $files['file']['tmp_name'], 'text/csv', $files['file']['name'] )
				: '@' . $files['file']['tmp_name'],
		);
		$res = wp_remote_post(
			$url,
			array(
				'timeout' => 60,
				'headers' => array( 'Authorization' => 'Bearer ' . $token ),
				'body'    => $body,
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$parsed = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		return new WP_REST_Response( array( 'ok' => true, 'result' => $parsed ) );
	}
}
