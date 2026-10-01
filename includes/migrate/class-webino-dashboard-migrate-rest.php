<?php
/**
 * REST API for the dashboard migration screen.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Routes under webino-dashboard/v1/migrate/*.
 */
final class Webino_Dashboard_Migrate_REST {

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
		$routes = array(
			array( '/migrate/settings', 'GET', 'settings_get' ),
			array( '/migrate/settings', 'POST', 'settings_post' ),
			array( '/migrate/test', 'POST', 'test_connection' ),
			array( '/migrate/start', 'POST', 'start' ),
			array( '/migrate/tick', 'POST', 'tick' ),
			array( '/migrate/pause', 'POST', 'pause' ),
			array( '/migrate/reset', 'POST', 'reset' ),
			array( '/migrate/status', 'GET', 'status' ),
		);
		foreach ( $routes as $route ) {
			register_rest_route(
				self::NS,
				$route[0],
				array(
					'methods'             => $route[1],
					'callback'            => array( __CLASS__, $route[2] ),
					'permission_callback' => array( __CLASS__, 'can_migrate' ),
				)
			);
		}
	}

	/**
	 * @return bool
	 */
	public static function can_migrate() {
		return Webino_Dashboard_Migrate::current_user_can();
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		return rest_ensure_response(
			array(
				'settings'  => Webino_Dashboard_Migrate_Settings::public_view(),
				'job'       => Webino_Dashboard_Migrate_Job::public_state(),
				'estimates' => self::estimates(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_post( WP_REST_Request $request ) {
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = $request->get_params();
		}
		$saved = Webino_Dashboard_Migrate_Settings::update( $params );
		if ( is_wp_error( $saved ) ) {
			$saved->add_data( array( 'status' => 400 ) );
			return $saved;
		}
		return rest_ensure_response(
			array(
				'settings' => $saved,
				'job'      => Webino_Dashboard_Migrate_Job::public_state(),
			)
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function test_connection() {
		$result = Webino_Dashboard_Migrate_Client::ping();
		if ( is_wp_error( $result ) ) {
			$result->add_data( array( 'status' => 400 ) );
			return $result;
		}
		return rest_ensure_response( $result );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function start( WP_REST_Request $request ) {
		$resume = rest_sanitize_boolean( $request->get_param( 'resume' ) );
		$result = Webino_Dashboard_Migrate_Job::start( $resume );
		if ( is_wp_error( $result ) ) {
			$status = 'already_running' === $result->get_error_code() ? 409 : 400;
			$result->add_data( array( 'status' => $status ) );
			return $result;
		}
		return rest_ensure_response( array( 'job' => $result ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function tick() {
		return rest_ensure_response( array( 'job' => Webino_Dashboard_Migrate_Job::tick() ) );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function pause() {
		$result = Webino_Dashboard_Migrate_Job::pause();
		if ( is_wp_error( $result ) ) {
			$result->add_data( array( 'status' => 400 ) );
			return $result;
		}
		return rest_ensure_response( array( 'job' => $result ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function reset() {
		return rest_ensure_response( array( 'job' => Webino_Dashboard_Migrate_Job::reset() ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function status() {
		return rest_ensure_response(
			array(
				'job'       => Webino_Dashboard_Migrate_Job::public_state(),
				'estimates' => self::estimates(),
			)
		);
	}

	/**
	 * @return array<string,int>
	 */
	private static function estimates() {
		$out = array();
		foreach ( Webino_Dashboard_Migrate_Schema::entity_order() as $entity ) {
			$out[ $entity ] = Webino_Dashboard_Migrate_Exporters::count( $entity );
		}
		return $out;
	}
}
