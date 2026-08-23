<?php
/**
 * REST for card-to-card settings and receipts.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dashboard REST.
 */
final class Webino_Dashboard_REST_C2C {

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
			'/c2c/settings',
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
			'/c2c/receipts',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'receipts_get' ),
			)
		);
		register_rest_route(
			self::NS,
			'/c2c/receipts/(?P<id>\d+)',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'receipts_decide' ),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function can_manage() {
		return class_exists( 'Webino_Dashboard_Rest_Base', false )
			&& Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		return new WP_REST_Response( array( 'settings' => Webino_C2C_Config::for_rest() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function settings_post( $request ) {
		$data  = $request->get_json_params();
		$saved = Webino_C2C_Config::save( is_array( $data ) ? $data : array() );
		return new WP_REST_Response( array( 'settings' => $saved ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function receipts_get( $request ) {
		$status = sanitize_key( (string) $request->get_param( 'status' ) );
		if ( '' === $status ) {
			$status = Webino_C2C_Receipts::STATUS_PENDING;
		}
		return new WP_REST_Response(
			array(
				'items' => Webino_C2C_Receipts::list_receipts( $status ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function receipts_decide( $request ) {
		$oid   = (int) $request['id'];
		$body  = $request->get_json_params();
		$act   = is_array( $body ) && isset( $body['action'] ) ? sanitize_key( (string) $body['action'] ) : '';
		$order = $oid > 0 && function_exists( 'wc_get_order' ) ? wc_get_order( $oid ) : false;
		if ( ! $order || ! Webino_C2C_Receipts::is_c2c_order( $order ) ) {
			return new WP_Error( 'c2c_order', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$res = Webino_C2C_Receipts::decide( $order, $act, Webino_C2C_Receipts::label_from_wp_user() );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$fresh = function_exists( 'wc_get_order' ) ? wc_get_order( $oid ) : $order;
		return new WP_REST_Response(
			array(
				'item' => Webino_C2C_Receipts::serialize( $fresh ? $fresh : $order ),
			)
		);
	}
}
