<?php
/**
 * REST endpoints for Torob extractor module (quarantined stub).
 *
 * Real Torob sync settings live under WNC Torob Connector
 * (`/settings/shop/torob` → `wnc/torob/settings`).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Torob products extractor dashboard REST API — redirects to WNC Torob settings.
 */
final class Webino_Dashboard_REST_Torob_Extractor {

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
			'/torob-extractor/settings',
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
			'/torob-extractor/status',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'callback'            => array( __CLASS__, 'status' ),
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
	 * Alias: point callers at WNC Torob platform settings (single source of truth).
	 *
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		$settings = class_exists( 'WNC_Settings', false )
			? WNC_Settings::get_platform( 'torob' )
			: array();
		return new WP_REST_Response(
			array(
				'redirect'      => '/settings/shop/torob',
				'wnc_endpoint'  => rest_url( 'webino-dashboard/v1/wnc/torob/settings' ),
				'settings'      => $settings,
				'deprecated'    => true,
				'message'       => __( 'Torob extractor settings are deprecated. Use Torob Connector (WNC).', 'webino-dashboard' ),
			)
		);
	}

	/**
	 * Reject writes — configure via WNC Torob Connector only.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_Error
	 */
	public static function settings_post( WP_REST_Request $request ) {
		unset( $request );
		return new WP_Error(
			'torob_extractor_deprecated',
			__( 'Use POST /webino-dashboard/v1/wnc/torob/settings instead.', 'webino-dashboard' ),
			array(
				'status'   => 410,
				'redirect' => '/settings/shop/torob',
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function status() {
		return new WP_REST_Response(
			array(
				'ok'            => true,
				'module'        => 'torob-products-extractor-module',
				'deprecated'    => true,
				'redirect'      => '/settings/shop/torob',
				'wnc_endpoint'  => rest_url( 'webino-dashboard/v1/wnc/torob/settings' ),
				'checked_at'    => gmdate( 'c' ),
			)
		);
	}
}
