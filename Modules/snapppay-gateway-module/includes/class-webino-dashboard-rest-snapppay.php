<?php
/**
 * SnappPay dashboard REST.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST: settings / status / test-connection / logs.
 */
final class Webino_Dashboard_REST_SnappPay {

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
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/snapppay/settings',
			array(
				array(
					'methods'             => 'GET',
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => array( __CLASS__, 'get_settings' ),
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
			'/snapppay/status',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'status' ),
			)
		);
		register_rest_route(
			self::NS,
			'/snapppay/test-connection',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'test_connection' ),
			)
		);
		register_rest_route(
			self::NS,
			'/snapppay/logs',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'logs' ),
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
	public static function get_settings() {
		return new WP_REST_Response( array( 'settings' => Webino_SnappPay_Config::get_public() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function save_settings( WP_REST_Request $req ) {
		$body = $req->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$data = isset( $body['settings'] ) && is_array( $body['settings'] ) ? $body['settings'] : $body;
		return new WP_REST_Response( array( 'settings' => Webino_SnappPay_Config::save( $data ) ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function status() {
		$cfg = Webino_SnappPay_Config::get_public();
		$wc  = false;
		if ( function_exists( 'WC' ) && WC()->payment_gateways() ) {
			$all = WC()->payment_gateways()->payment_gateways();
			$wc  = isset( $all[ Webino_SnappPay_Config::GATEWAY_ID ] );
		}
		return new WP_REST_Response(
			array(
				'woocommerce'            => class_exists( 'WooCommerce', false ),
				'gateway_registered'     => $wc,
				'official_plugin_active' => Webino_SnappPay_Config::official_plugin_active(),
				'gateway_source'         => $cfg['gateway_source'],
				'server_ip'              => $cfg['server_ip'],
				'credentials_ready'      => '' !== (string) Webino_SnappPay_Config::get()['client_id']
					&& ! empty( Webino_SnappPay_Config::get()['client_username'] ),
			)
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function test_connection() {
		$res = Webino_SnappPay_Api_Client::test_connection();
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( $res );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function logs() {
		$logs = get_option( Webino_SnappPay_Config::LOG_OPTION, array() );
		return new WP_REST_Response( array( 'logs' => is_array( $logs ) ? $logs : array() ) );
	}
}
