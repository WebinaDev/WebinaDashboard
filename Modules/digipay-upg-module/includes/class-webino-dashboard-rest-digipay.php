<?php
/**
 * Dashboard REST endpoints for DigiPay settings and logs.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_Dashboard_REST_Digipay {

	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		if ( did_action( 'rest_api_init' ) ) {
			self::register_routes();
		}
	}

	/**
	 * @return bool
	 */
	public static function can_manage() {
		return Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/digipay/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'settings_get' ),
					'permission_callback' => array( __CLASS__, 'can_manage' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'settings_post' ),
					'permission_callback' => array( __CLASS__, 'can_manage' ),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/digipay/test-connection',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'test_connection' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digipay/transactions',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'transactions_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digipay/refund-inquiry',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'refund_inquiry' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digipay/reverse',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'reverse' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		return new WP_REST_Response( array( 'settings' => Digipay_OAuth::settings_public() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_post( WP_REST_Request $request ) {
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'digipay_invalid_body', __( 'Invalid request body.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'settings' => Digipay_OAuth::save( $data ) ) );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function test_connection() {
		$token = Digipay_OAuth::get_access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function transactions_get() {
		$logs = get_option( Digipay_Lifecycle::LOG_OPTION, array() );
		if ( ! is_array( $logs ) ) {
			$logs = array();
		}
		return new WP_REST_Response( array( 'items' => array_values( $logs ) ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function refund_inquiry( WP_REST_Request $request ) {
		$id = sanitize_text_field( (string) $request->get_param( 'inquiry_id' ) );
		if ( '' === $id ) {
			return new WP_Error( 'digipay_missing_inquiry', __( 'inquiry_id is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$res = Digipay_Api_Client::refund_inquiry( $id );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array( 'result' => $res ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function reverse( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			return new WP_Error( 'digipay_invalid_body', __( 'Invalid request body.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$order_id = isset( $body['order_id'] ) ? absint( $body['order_id'] ) : 0;
		$order    = $order_id ? wc_get_order( $order_id ) : false;
		if ( ! $order instanceof WC_Order ) {
			return new WP_Error( 'digipay_order_not_found', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$tracking = (string) $order->get_meta( '_digipay_tracking_code' );
		$provider = (string) $order->get_meta( '_digipay_provider_id' );
		$type     = (int) $order->get_meta( '_digipay_type' );
		$amount   = isset( $body['amount'] )
			? (int) $body['amount']
			: Digipay_Order_Service::amount_in_rial( $order );
		$res      = Digipay_Api_Client::reverse_purchase(
			$type,
			array(
				'trackingCode' => $tracking,
				'providerId'   => $provider,
				'amount'       => $amount,
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		Digipay_Lifecycle::log_event( $order_id, 'reverse', true, 'Manual reverse via dashboard' );
		return new WP_REST_Response( array( 'ok' => true, 'result' => $res ) );
	}
}
