<?php
/**
 * Product catalog REST API.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers catalog/* routes.
 */
final class Webino_Dashboard_Product_Catalog_REST {

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
			'/catalog/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'settings_get' ),
					'permission_callback' => array( __CLASS__, 'perm_edit' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'settings_post' ),
					'permission_callback' => array( __CLASS__, 'perm_edit' ),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/catalog/search',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'search' ),
				'permission_callback' => array( __CLASS__, 'perm_edit' ),
			)
		);
		register_rest_route(
			self::NS,
			'/catalog/import',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'import' ),
				'permission_callback' => array( __CLASS__, 'perm_edit' ),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function perm_edit() {
		return Webino_Dashboard_Rest_Base::can( 'edit_products' );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		return new WP_REST_Response(
			array(
				'ok'       => true,
				'settings' => Webino_Dashboard_Product_Catalog_Settings::public_payload(),
			),
			200
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function settings_post( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$settings = Webino_Dashboard_Product_Catalog_Settings::update( $body );
		return new WP_REST_Response(
			array(
				'ok'       => true,
				'settings' => Webino_Dashboard_Product_Catalog_Settings::public_payload(),
			),
			200
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function search( WP_REST_Request $request ) {
		$body     = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$category = (string) ( $body['category'] ?? 'food' );
		$q        = (string) ( $body['q'] ?? '' );
		$barcode  = (string) ( $body['barcode'] ?? '' );
		$page     = (int) ( $body['page'] ?? 1 );
		$res      = Webino_Dashboard_Product_Catalog_Registry::search( $category, $q, $barcode, $page );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array_merge( array( 'ok' => true ), $res ), 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function import( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$item = isset( $body['payload'] ) && is_array( $body['payload'] ) ? $body['payload'] : $body;
		$res  = Webino_Dashboard_Product_Catalog_Import::import( $item );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array_merge( array( 'ok' => true ), $res ), 201 );
	}
}
