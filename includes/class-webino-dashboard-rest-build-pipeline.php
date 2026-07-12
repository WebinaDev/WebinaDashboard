<?php
/**
 * REST: dashboard release build pipeline.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers webino-dashboard/v1/build-pipeline/* routes.
 */
final class Webino_Dashboard_REST_Build_Pipeline {

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
			'/build-pipeline/status',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'status' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/build-pipeline/start',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'start' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/build-pipeline/cancel',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'cancel' ),
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
	 * @return WP_REST_Response
	 */
	public static function status() {
		return new WP_REST_Response( self::format_status( Webino_Dashboard_Build_Pipeline::get_status() ), 200 );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function start() {
		$result = Webino_Dashboard_Build_Pipeline::start();
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( self::format_status( $result ), 200 );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function cancel() {
		$state = Webino_Dashboard_Build_Pipeline::cancel();
		return new WP_REST_Response( self::format_status( $state ), 200 );
	}

	/**
	 * @param string $log Full build log.
	 * @return string
	 */
	private static function redact_log_tail( $log ) {
		$log = (string) $log;
		if ( '' === $log ) {
			return '';
		}
		$max_bytes = 8192;
		if ( strlen( $log ) > $max_bytes ) {
			$log = substr( $log, -$max_bytes );
		}
		$lines = preg_split( "/\r\n|\n|\r/", $log );
		if ( ! is_array( $lines ) ) {
			$lines = array( $log );
		}
		$tail = array_slice( $lines, -80 );
		$out  = array();
		foreach ( $tail as $line ) {
			$line = preg_replace( '#(/[a-zA-Z0-9._\-/]+)+#', '[path]', (string) $line );
			$out[] = is_string( $line ) ? $line : (string) $line;
		}
		return implode( "\n", $out );
	}

	/**
	 * @param array<string,mixed> $state State.
	 * @return array<string,mixed>
	 */
	private static function format_status( array $state ) {
		$steps = array();
		foreach ( Webino_Dashboard_Build_Pipeline::steps() as $step ) {
			$steps[] = array(
				'id'    => $step['id'],
				'label' => $step['label'],
				'done'  => in_array( $step['id'], (array) ( $state['steps_done'] ?? array() ), true ),
			);
		}
		return array(
			'status'       => (string) ( $state['status'] ?? 'idle' ),
			'current_step' => (string) ( $state['current_step'] ?? '' ),
			'started_at'   => $state['started_at'] ?? null,
			'finished_at'  => $state['finished_at'] ?? null,
			'exit_code'    => $state['exit_code'] ?? null,
			'error'        => (string) ( $state['error'] ?? '' ),
			'log_tail'     => self::redact_log_tail( (string) ( $state['log'] ?? '' ) ),
			'steps'        => $steps,
			'locked'       => (bool) get_transient( Webino_Dashboard_Build_Pipeline::LOCK_KEY ),
			'dev_allowed'  => Webino_Dashboard_Build_Pipeline::is_dev_environment(),
		);
	}
}
