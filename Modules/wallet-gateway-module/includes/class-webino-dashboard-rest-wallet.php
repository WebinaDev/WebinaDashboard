<?php
/**
 * REST for store wallet settings and staff adjust.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dashboard REST.
 */
final class Webino_Dashboard_REST_Wallet {

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
			'/wallet/settings',
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
			'/wallet/users/(?P<id>\d+)/adjust',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'adjust_post' ),
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
		return new WP_REST_Response( array( 'settings' => Webino_Wallet_Config::get() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function settings_post( $request ) {
		$data  = $request->get_json_params();
		$saved = Webino_Wallet_Config::save( is_array( $data ) ? $data : array() );
		return new WP_REST_Response( array( 'settings' => $saved ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function adjust_post( $request ) {
		$uid  = (int) $request['id'];
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		if ( ! get_userdata( $uid ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( ! class_exists( 'Webino_Dashboard_Wallet', false ) ) {
			return new WP_Error( 'wallet', __( 'Wallet is unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$amount    = isset( $body['amount'] ) ? (float) $body['amount'] : 0;
		$direction = isset( $body['direction'] ) && 'debit' === $body['direction'] ? 'debit' : 'credit';
		$note      = isset( $body['note'] ) ? (string) $body['note'] : '';
		$res       = Webino_Dashboard_Wallet::adjust( $uid, $amount, $direction, 'admin_adjust', 'user', $uid, $note );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response(
			array(
				'balance' => (float) $res,
			)
		);
	}
}
