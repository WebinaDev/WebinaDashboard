<?php
/**
 * REST for Bale Pay settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dashboard REST.
 */
final class Webino_Dashboard_REST_Bale_Pay {

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
			'/bale-pay/settings',
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
		return new WP_REST_Response(
			array(
				'settings' => Webino_Bale_Pay_Config::get(),
				'status'   => Webino_Bale_Pay_Service::status(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function settings_post( $request ) {
		$data  = $request->get_json_params();
		$saved = Webino_Bale_Pay_Config::save( is_array( $data ) ? $data : array() );
		return new WP_REST_Response(
			array(
				'settings' => $saved,
				'status'   => Webino_Bale_Pay_Service::status(),
			)
		);
	}
}
