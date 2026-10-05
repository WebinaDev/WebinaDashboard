<?php

namespace Webino_Dashboard_Bots_Telegram\Api;

use Webino_Dashboard_Bots_Telegram\Core\Plugin;

/**
 * GET /woobale/v1/health?token=... — monitor uptime (token auto-generated, stored in DB).
 */
class HealthController {

	private static $instance = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function init(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes(): void {
		register_rest_route(
			'webino-dashboard/v1',
			'/bots/telegram/health',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'handle_health' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function handle_health( $request ) {
		$token    = (string) $request->get_param( 'token' );
		$expected = Plugin::get_health_check_token();
		if ( $expected === '' || ! hash_equals( $expected, $token ) ) {
			return new \WP_REST_Response( array( 'ok' => false ), 403 );
		}
		return new \WP_REST_Response(
			array(
				'ok'      => true,
				'version' => defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '',
			),
			200
		);
	}
}
