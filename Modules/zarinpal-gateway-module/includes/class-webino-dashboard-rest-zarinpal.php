<?php
/**
 * Dashboard REST for ZarinPal module.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST routes under webino-dashboard/v1/zarinpal/*.
 */
final class Webino_Dashboard_REST_Zarinpal {
	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/zarinpal/settings',
			array(
				array(
					'methods'             => 'GET',
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => array( __CLASS__, 'settings_get' ),
				),
				array(
					'methods'             => 'POST',
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => array( __CLASS__, 'settings_post' ),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/zarinpal/status',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'status_get' ),
			)
		);
		register_rest_route(
			self::NS,
			'/zarinpal/coverage/endpoints',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'coverage_get' ),
			)
		);
		register_rest_route(
			self::NS,
			'/zarinpal/reconcile',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'reconcile_post' ),
			)
		);
		register_rest_route(
			self::NS,
			'/zarinpal/test-connection',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'test_connection' ),
			)
		);
		register_rest_route(
			self::NS,
			'/zarinpal/lookup',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'lookup_post' ),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function can_manage() {
		return Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		return new WP_REST_Response( array( 'settings' => Zarinpal_Config::get_public() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function settings_post( WP_REST_Request $request ) {
		$data  = $request->get_json_params();
		$saved = Zarinpal_Config::save( is_array( $data ) ? $data : array() );
		do_action(
			'webino_zarinpal_audit',
			'settings_updated',
			array( 'merchant_id_masked' => self::mask( (string) ( Zarinpal_Config::get()['merchant_id'] ?? '' ) ) )
		);
		return new WP_REST_Response( array( 'settings' => $saved ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function status_get() {
		return new WP_REST_Response(
			array(
				'jobs'           => Zarinpal_Jobs::all(),
				'last_reconcile' => Zarinpal_Jobs::last_reconcile(),
				'checked_at'     => gmdate( 'c' ),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function coverage_get() {
		return new WP_REST_Response( Zarinpal_Endpoint_Registry::report() );
	}

	/**
	 * Run reconcile immediately (and keep queue path for cron).
	 *
	 * @return WP_REST_Response
	 */
	public static function reconcile_post() {
		$result = Zarinpal_Jobs::run_reconcile();
		do_action( 'webino_zarinpal_audit', 'manual_reconcile', array( 'user_id' => get_current_user_id(), 'result' => $result ) );
		return new WP_REST_Response( array( 'ok' => true, 'result' => $result ) );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function test_connection() {
		$res = Zarinpal_Gateway_Service::test_connection();
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * Lookup by authority or order id.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function lookup_post( WP_REST_Request $request ) {
		$body      = $request->get_json_params();
		$body      = is_array( $body ) ? $body : array();
		$authority = sanitize_text_field( (string) ( $body['authority'] ?? '' ) );
		$order_id  = absint( $body['order_id'] ?? 0 );

		if ( '' === $authority && $order_id > 0 ) {
			$order = wc_get_order( $order_id );
			if ( ! $order ) {
				return new WP_Error( 'zarinpal_order_missing', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
			}
			$authority = (string) $order->get_meta( '_zarinpal_authority' );
		}

		if ( '' === $authority ) {
			return new WP_Error( 'zarinpal_authority_missing', __( 'Provide authority or order_id.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$lookup = Zarinpal_Gateway_Service::lookup( $authority );
		if ( is_wp_error( $lookup ) ) {
			return $lookup;
		}

		return new WP_REST_Response(
			array(
				'authority' => $authority,
				'order_id'  => $order_id,
				'lookup'    => $lookup,
			)
		);
	}

	/**
	 * @param string $value Value.
	 * @return string
	 */
	private static function mask( $value ) {
		$len = strlen( $value );
		if ( $len <= 6 ) {
			return str_repeat( '*', $len );
		}
		return substr( $value, 0, 3 ) . str_repeat( '*', max( 0, $len - 6 ) ) . substr( $value, -3 );
	}
}
