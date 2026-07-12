<?php
/**
 * REST: dashboard core update from CRM/Gitea.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers webino-dashboard/v1/core/* routes.
 */
final class Webino_Dashboard_REST_Core_Update {

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
			'/core/update-status',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'update_status' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
				'args'                => array(
					'refresh' => array(
						'type'              => 'boolean',
						'sanitize_callback' => 'rest_sanitize_boolean',
					),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/core/update',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'run_update' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function perm_manage() {
		if ( ! Webino_Dashboard_Rest_Base::can( 'manage_options' ) ) {
			return false;
		}
		return Webino_Dashboard_License::instance()->is_license_active( false );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_status( WP_REST_Request $request ) {
		$refresh = (bool) $request->get_param( 'refresh' );
		$status  = Webino_Dashboard_Core_Updater::get_update_status( $refresh );
		if ( is_wp_error( $status ) ) {
			return $status;
		}
		return new WP_REST_Response( $status, 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function run_update( WP_REST_Request $request ) {
		$body    = $request->get_json_params();
		$version = is_array( $body ) ? sanitize_text_field( (string) ( $body['version'] ?? '' ) ) : '';
		$result  = Webino_Dashboard_Core_Updater::run_update( $version );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( $result, 200 );
	}
}
