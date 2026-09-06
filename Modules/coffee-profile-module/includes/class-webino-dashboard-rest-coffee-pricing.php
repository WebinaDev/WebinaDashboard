<?php
/**
 * REST API for coffee bean pricing.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Coffee pricing REST routes.
 */
class Webino_Dashboard_REST_Coffee_Pricing {

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
			'/shop/coffee-pricing',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'get' ),
					'permission_callback' => array( __CLASS__, 'perm_edit' ),
				),
				array(
					'methods'             => 'PUT',
					'callback'            => array( __CLASS__, 'put' ),
					'permission_callback' => array( __CLASS__, 'perm_edit' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/coffee-pricing/apply-all',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'apply_all' ),
				'permission_callback' => array( __CLASS__, 'perm_edit' ),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/coffee-pricing/recalc-state',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'recalc_state' ),
				'permission_callback' => array( __CLASS__, 'perm_edit' ),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/coffee-pricing/apply',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'apply_one' ),
				'permission_callback' => array( __CLASS__, 'perm_edit' ),
			)
		);
	}

	/** @return bool */
	public static function perm_edit() {
		return current_user_can( 'edit_products' );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function get() {
		$computed = Webino_Dashboard_Coffee_Pricing::computed();
		unset( $computed['_maps'] );
		foreach ( (array) $computed['beans'] as $i => $bean ) {
			$pid = (int) ( $bean['product_id'] ?? 0 );
			$computed['beans'][ $i ]['product_name'] = $pid > 0 ? get_the_title( $pid ) : '';
			$computed['beans'][ $i ]['retail_preview'] = Webino_Dashboard_Coffee_Pricing::preview_retail(
				(float) ( $bean['after_roast'] ?? 0 ),
				$pid
			);
		}
		foreach ( (array) $computed['base_mixes'] as $i => $mix ) {
			$computed['base_mixes'][ $i ]['retail_preview'] = Webino_Dashboard_Coffee_Pricing::preview_retail(
				(float) ( $mix['after_roast'] ?? 0 ),
				0
			);
		}
		return new WP_REST_Response(
			array_merge(
				$computed,
				array(
					'recalc' => Webino_Dashboard_Coffee_Pricing::recalc_state(),
				)
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function put( $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$recalc = ! empty( $body['recalc'] );
		if ( isset( $body['settings'] ) && is_array( $body['settings'] ) ) {
			$body = $body['settings'];
		}
		Webino_Dashboard_Coffee_Pricing::save( $body );
		$response = self::get();
		$data     = $response->get_data();
		if ( ! is_array( $data ) ) {
			$data = array();
		}
		if ( $recalc ) {
			$queued           = Webino_Dashboard_Coffee_Pricing::queue_recalc_all();
			$data['queued']   = $queued;
			$data['recalc']   = Webino_Dashboard_Coffee_Pricing::recalc_state();
			$response->set_data( $data );
			$response->set_status( 202 );
		}
		return $response;
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function apply_all() {
		$result = Webino_Dashboard_Coffee_Pricing::queue_recalc_all();
		return new WP_REST_Response(
			array_merge(
				$result,
				array(
					'recalc' => Webino_Dashboard_Coffee_Pricing::recalc_state(),
				)
			),
			202
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function recalc_state() {
		return new WP_REST_Response( Webino_Dashboard_Coffee_Pricing::recalc_state() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function apply_one( $request ) {
		$id  = (int) $request['id'];
		$res = Webino_Dashboard_Coffee_Pricing::apply_to_product( $id );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( $res );
	}
}
