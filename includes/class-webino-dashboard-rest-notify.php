<?php
/**
 * REST: notification system settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * /notifications/* routes.
 */
final class Webino_Dashboard_REST_Notify {

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
			'/notifications/settings',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_settings' ),
					'permission_callback' => static function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_options' );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'save_settings' ),
					'permission_callback' => static function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_options' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/notifications/test-email',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'test_email' ),
				'permission_callback' => static function () {
					return Webino_Dashboard_Rest_Base::can( 'manage_options' );
				},
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function get_settings() {
		return new WP_REST_Response( Webino_Dashboard_Notify::get_settings_for_api(), 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function save_settings( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$saved = Webino_Dashboard_Notify::save_settings( $body );
		return new WP_REST_Response( $saved, 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function test_email( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$to   = is_array( $body ) ? (string) ( $body['to'] ?? '' ) : '';
		$res  = Webino_Dashboard_Mailer::send_test( $to );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}
}
