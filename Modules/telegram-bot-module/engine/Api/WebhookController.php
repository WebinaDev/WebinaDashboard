<?php

namespace Webino_Dashboard_Bots_Telegram\Api;

use Webino_Dashboard_Bots_Telegram\Bot\Router;
use Webino_Dashboard_Bots_Telegram\Core\Plugin;
use Webino_Dashboard_Bots_Telegram\Logging\ActivityLog;

/**
 * REST: POST webino-dashboard/v1/bots/telegram/webhook
 */
class WebhookController {

	private static $instance = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function init(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		add_action( 'admin_post_nopriv_webino_dash_tg_webhook', array( $this, 'handle_admin_post_webhook' ) );
		add_action( 'admin_post_webino_dash_tg_webhook', array( $this, 'handle_admin_post_webhook' ) );
	}

	public static function webhook_url(): string {
		return add_query_arg( 'action', 'webino_dash_tg_webhook', admin_url( 'admin-post.php' ) );
	}

	public function register_routes(): void {
		register_rest_route(
			'webino-dashboard/v1',
			'/bots/telegram/webhook',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'handle_webhook' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * @param array<string, mixed> $context
	 */
	private function log_error( string $event, array $context = array() ): void {
		$message = '[' . $event . '] ' . wp_json_encode( $context );
		if ( function_exists( 'wc_get_logger' ) ) {
			wc_get_logger()->error( $message, array( 'source' => 'webino_dashboard_telegram' ) );
		} else {
			error_log( 'woobale ' . $message );
		}
		ActivityLog::add( 'error', 'webhook', $event, $context );
	}

	/**
	 * @param array<string, mixed> $context
	 */
	private function log_notice( string $event, array $context = array() ): void {
		$message = '[' . $event . '] ' . wp_json_encode( $context );
		if ( function_exists( 'wc_get_logger' ) ) {
			$log = wc_get_logger();
			if ( method_exists( $log, 'notice' ) ) {
				$log->notice( $message, array( 'source' => 'webino_dashboard_telegram' ) );
			} else {
				$log->info( $message, array( 'source' => 'webino_dashboard_telegram' ) );
			}
		} else {
			error_log( 'woobale ' . $message );
		}
		if ( $event === 'webhook_rate_limited' ) {
			ActivityLog::add( 'warning', 'webhook', $event, $context );
		}
	}

	/**
	 * Client IP for rate limiting (REST-aware when available).
	 */
	private function get_client_ip(): string {
		if ( function_exists( 'rest_get_client_ip' ) ) {
			$ip = rest_get_client_ip();
			if ( is_string( $ip ) && $ip !== '' ) {
				return $ip;
			}
		}
		return isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : '0';
	}

	/**
	 * @return \WP_REST_Response|null Null if OK to proceed.
	 */
	private function check_rate_limit(): ?\WP_REST_Response {
		$limit = (int) apply_filters( 'wbdb_tg_webhook_rate_limit_per_minute', 90 );
		if ( $limit < 1 ) {
			return null;
		}
		$ip  = $this->get_client_ip();
		$key = 'wbdb_tg_wh_rl_' . md5( $ip );
		$n   = (int) get_transient( $key );
		if ( $n >= $limit ) {
			$this->log_notice(
				'webhook_rate_limited',
				array(
					'ip_hash' => substr( md5( $ip ), 0, 8 ),
				)
			);
			return new \WP_REST_Response( array( 'ok' => false ), 429 );
		}
		set_transient( $key, $n + 1, MINUTE_IN_SECONDS );
		return null;
	}

	/**
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function handle_webhook( $request ) {
		$incoming = self::read_incoming_webhook_secret( $request );
		return $this->process_update_request( (string) $request->get_body(), $incoming );
	}

	/**
	 * Public fallback webhook endpoint via admin-post.php.
	 */
	public function handle_admin_post_webhook(): void {
		$raw      = file_get_contents( 'php://input' );
		$incoming = self::read_incoming_webhook_secret_from_server();
		$res      = $this->process_update_request( (string) $raw, $incoming );
		wp_send_json( $res->get_data(), (int) $res->get_status() );
	}

	/**
	 * Secret token from request (REST). Some stacks only populate $_SERVER, not WP_REST_Request headers.
	 */
	private static function read_incoming_webhook_secret( $request ): string {
		$sent = $request->get_header( 'X-Telegram-Bot-Api-Secret-Token' );
		if ( is_string( $sent ) && trim( $sent ) !== '' ) {
			return trim( $sent );
		}
		return self::read_incoming_webhook_secret_from_server();
	}

	/**
	 * Read X-Telegram-Bot-Api-Secret-Token from the current HTTP request environment.
	 */
	private static function read_incoming_webhook_secret_from_server(): string {
		$keys = array(
			'HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN',
			'REDIRECT_HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN',
		);
		foreach ( $keys as $k ) {
			if ( ! empty( $_SERVER[ $k ] ) && is_string( $_SERVER[ $k ] ) ) {
				return trim( (string) $_SERVER[ $k ] );
			}
		}
		if ( function_exists( 'getallheaders' ) ) {
			$headers = getallheaders();
			if ( is_array( $headers ) ) {
				foreach ( $headers as $name => $value ) {
					if ( is_string( $name ) && strcasecmp( $name, 'X-Telegram-Bot-Api-Secret-Token' ) === 0 && is_string( $value ) ) {
						return trim( $value );
					}
				}
			}
		}
		/**
		 * Allow reverse proxies to forward the secret under a custom header.
		 *
		 * @param string $secret Empty or trimmed token.
		 */
		return trim( (string) apply_filters( 'wbdb_tg_webhook_incoming_secret', '' ) );
	}

	private function process_update_request( string $raw, string $incoming_secret_header = '' ): \WP_REST_Response {
		$rate = $this->check_rate_limit();
		if ( $rate !== null ) {
			return $rate;
		}

		$expected = Plugin::get_webhook_secret();
		$expected = is_string( $expected ) ? trim( $expected ) : '';
		$incoming = trim( $incoming_secret_header );

		$settings        = Plugin::get_settings();
		$require_by_opt  = ! isset( $settings['webhook_require_secret'] ) || (string) $settings['webhook_require_secret'] !== '0';

		/**
		 * When false, skip secret verification (only if you know the risk; default true when secret is set and option is on).
		 *
		 * @param bool   $require Whether to require a matching secret.
		 * @param string $expected Trimmed secret from settings (may be empty).
		 */
		$require_secret = (bool) apply_filters( 'wbdb_tg_require_webhook_secret', $require_by_opt && $expected !== '', $expected );

		if ( $require_secret && $expected !== '' ) {
			if ( $incoming === '' || ! hash_equals( $expected, $incoming ) ) {
				$this->log_error(
					'webhook_secret_mismatch',
					array(
						'incoming_empty' => $incoming === '',
						'incoming_len'   => strlen( $incoming ),
						'expected_len'   => strlen( $expected ),
					)
				);
				return new \WP_REST_Response( array( 'ok' => false ), 401 );
			}
		}

		$data = json_decode( $raw, true );
		if ( ! is_array( $data ) ) {
			$this->log_error(
				'webhook_invalid_json',
				array(
					'raw_excerpt' => substr( (string) $raw, 0, 500 ),
				)
			);
			return new \WP_REST_Response( array( 'ok' => false ), 400 );
		}

		try {
			$router = new Router();
			$router->dispatch( $data );
		} catch ( \Throwable $e ) {
			$this->log_error(
				'webhook_dispatch_exception',
				array(
					'message' => $e->getMessage(),
					'file'    => $e->getFile(),
					'line'    => $e->getLine(),
				)
			);
			return new \WP_REST_Response( array( 'ok' => false ), 500 );
		}

		return new \WP_REST_Response( array( 'ok' => true ), 200 );
	}
}
