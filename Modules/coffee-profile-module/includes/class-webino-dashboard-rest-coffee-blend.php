<?php
/**
 * REST for coffee blend settings, catalog, and quote.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Coffee blend REST routes.
 */
class Webino_Dashboard_REST_Coffee_Blend {

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
			'/shop/coffee-blend/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'settings_get' ),
					'permission_callback' => array( 'Webino_Dashboard_REST_Coffee_Profile', 'perm_edit_products' ),
				),
				array(
					'methods'             => 'PUT',
					'callback'            => array( __CLASS__, 'settings_put' ),
					'permission_callback' => array( 'Webino_Dashboard_REST_Coffee_Profile', 'perm_edit_products' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/public/coffee-blend/catalog',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'catalog_get' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NS,
			'/public/coffee-blend/quote',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'quote_post' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		return new WP_REST_Response( array( 'settings' => Webino_Dashboard_Coffee_Blend::get_settings() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function settings_put( $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = $request->get_params();
		}
		$settings = isset( $body['settings'] ) && is_array( $body['settings'] ) ? $body['settings'] : $body;
		$saved    = Webino_Dashboard_Coffee_Blend::save_settings( is_array( $settings ) ? $settings : array() );
		return new WP_REST_Response( array( 'settings' => $saved ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function catalog_get() {
		return new WP_REST_Response( Webino_Dashboard_Coffee_Blend::public_config() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function quote_post( $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = $request->get_params();
		}
		$quote = Webino_Dashboard_Coffee_Blend::quote( is_array( $body ) ? $body : array() );
		if ( is_wp_error( $quote ) ) {
			return $quote;
		}
		return new WP_REST_Response( $quote );
	}
}
