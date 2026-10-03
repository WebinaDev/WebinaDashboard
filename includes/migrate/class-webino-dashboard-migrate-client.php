<?php
/**
 * HTTP client for Webino wordpress import endpoints.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pushes one JSON batch. Tokens stay in the Authorization header and out of logs.
 */
final class Webino_Dashboard_Migrate_Client {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'http_api_debug', array( __CLASS__, 'redact_http_debug' ), 0, 5 );
	}

	/**
	 * Best-effort: rewrite Authorization before other debug listeners run.
	 *
	 * The filter cannot change arguments already copied by an earlier hook.
	 * Migration logs never include the header. See docs/WEBINO_MIGRATE.md.
	 *
	 * @param mixed  $response Response.
	 * @param string $context  Context.
	 * @param string $class    Transport class.
	 * @param array  $args     Request args.
	 * @param string $url      URL.
	 * @return mixed
	 */
	public static function redact_http_debug( $response, $context, $class, $args, $url ) {
		unset( $context, $class, $url );
		if ( is_array( $args ) && isset( $args['headers'] ) && is_array( $args['headers'] ) && isset( $args['headers']['Authorization'] ) ) {
			$args['headers']['Authorization'] = 'Bearer [redacted]';
		}
		return $response;
	}

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function ping() {
		$url = Webino_Dashboard_Migrate_Settings::site_url();
		if ( '' === $url ) {
			return new WP_Error( 'empty_url', __( 'Save the Webino site URL first.', 'webino-dashboard' ) );
		}
		$token = Webino_Dashboard_Migrate_Settings::token();
		if ( Webino_Dashboard_Migrate_Settings::dry_run() && '' === $token ) {
			return array(
				'ok'          => true,
				'http_status' => 0,
				'message'     => __( 'Dry run is on, so no request was sent. Save a token and turn dry run off to test the live connection.', 'webino-dashboard' ),
			);
		}
		if ( '' === $token ) {
			return new WP_Error( 'missing_token', __( 'Save an API token first.', 'webino-dashboard' ) );
		}
		$body = array(
			'schema'         => Webino_Dashboard_Migrate_Schema::NAME,
			'schema_version' => Webino_Dashboard_Migrate_Schema::VERSION,
			'source'         => Webino_Dashboard_Migrate_Schema::source_site(),
		);
		$result = self::post( 'ping', $body, 'ping:' . gmdate( 'YmdHis' ) );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		if ( empty( $result['ok'] ) ) {
			return new WP_Error(
				'ping_failed',
				sprintf(
					/* translators: 1: HTTP status, 2: redacted error */
					__( 'Connection failed (HTTP %1$d): %2$s', 'webino-dashboard' ),
					(int) $result['http_status'],
					(string) $result['error']
				)
			);
		}
		$resources = array();
		if ( isset( $result['body']['resources'] ) && is_array( $result['body']['resources'] ) ) {
			$resources = array_values( $result['body']['resources'] );
		} elseif ( isset( $result['body']['data']['resources'] ) && is_array( $result['body']['data']['resources'] ) ) {
			$resources = array_values( $result['body']['data']['resources'] );
		}
		return array(
			'ok'          => true,
			'http_status' => (int) $result['http_status'],
			'message'     => __( 'Connection succeeded.', 'webino-dashboard' ),
			'resources'   => $resources,
		);
	}

	/**
	 * @param int    $remote_id   Webino job id.
	 * @param int    $limit       Records to apply (1–100).
	 * @param string $idempotency Idempotency key.
	 * @return array{ok:bool,http_status:int,retry_after:int,error:string,body:array}|WP_Error
	 */
	public static function run_job( $remote_id, $limit, $idempotency ) {
		$path = Webino_Dashboard_Migrate_Schema::run_path(
			Webino_Dashboard_Migrate_Settings::endpoint( 'run' ),
			(int) $remote_id
		);
		$limit = max( 1, min( 100, (int) $limit ) );
		return self::post_path( $path, array( 'limit' => $limit ), $idempotency, 'run' );
	}

	/**
	 * @param string              $endpoint_key Endpoint key.
	 * @param array<string,mixed> $body         JSON body.
	 * @param string              $idempotency  Idempotency key.
	 * @return array{ok:bool,http_status:int,retry_after:int,error:string,body:array}|WP_Error
	 */
	public static function post( $endpoint_key, array $body, $idempotency ) {
		$path = Webino_Dashboard_Migrate_Settings::endpoint( $endpoint_key );
		return self::post_path( $path, $body, $idempotency, $endpoint_key );
	}

	/**
	 * @param string              $path         Absolute path on the tenant.
	 * @param array<string,mixed> $body         JSON body.
	 * @param string              $idempotency  Idempotency key.
	 * @param string              $endpoint_key Logical key (dry-run skip).
	 * @return array{ok:bool,http_status:int,retry_after:int,error:string,body:array}|WP_Error
	 */
	public static function post_path( $path, array $body, $idempotency, $endpoint_key = '' ) {
		if ( Webino_Dashboard_Migrate_Settings::dry_run() && 'ping' !== $endpoint_key ) {
			return array(
				'ok'          => true,
				'http_status' => 200,
				'retry_after' => 0,
				'error'       => '',
				'body'        => array(),
			);
		}

		$origin = Webino_Dashboard_Migrate_Settings::site_url();
		$path   = (string) $path;
		if ( '' === $origin || '' === $path ) {
			return new WP_Error( 'bad_endpoint', __( 'The destination URL or endpoint path is missing.', 'webino-dashboard' ) );
		}
		$url = Webino_Dashboard_Migrate_Schema::join_url( $origin, $path );
		$json = wp_json_encode( $body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
		if ( ! is_string( $json ) ) {
			return new WP_Error( 'json_encode', __( 'Could not encode the migration batch.', 'webino-dashboard' ) );
		}

		$token   = Webino_Dashboard_Migrate_Settings::token();
		$headers = array(
			'Accept'                  => 'application/json',
			'Content-Type'            => 'application/json; charset=utf-8',
			'X-Webino-Import-Schema'  => Webino_Dashboard_Migrate_Schema::NAME,
			'X-Webino-Idempotency-Key' => $idempotency,
			'User-Agent'              => 'WebinoDashboard-Migrate/' . ( defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '0' ),
		);
		if ( '' !== $token ) {
			$headers['Authorization'] = 'Bearer ' . $token;
		}

		$args = array(
			'timeout'     => Webino_Dashboard_Migrate_Settings::timeout(),
			'redirection' => 2,
			'headers'     => $headers,
			'body'        => $json,
			'data_format' => 'body',
		);

		$response = function_exists( 'wp_safe_remote_post' )
			? wp_safe_remote_post( $url, $args )
			: wp_remote_post( $url, $args );

		return self::parse_response( $response, $token );
	}

	/**
	 * @param array|WP_Error $response HTTP API result.
	 * @param string         $token    Token to strip from errors.
	 * @return array{ok:bool,http_status:int,retry_after:int,error:string,body:array}
	 */
	public static function parse_response( $response, $token = '' ) {
		if ( is_wp_error( $response ) ) {
			return array(
				'ok'          => false,
				'http_status' => 0,
				'retry_after' => 0,
				'error'       => Webino_Dashboard_Migrate_Schema::redact( $response->get_error_message(), $token ),
				'body'        => array(),
			);
		}
		$code = (int) wp_remote_retrieve_response_code( $response );
		$raw  = (string) wp_remote_retrieve_body( $response );
		$retry = self::retry_after_seconds( wp_remote_retrieve_header( $response, 'retry-after' ) );
		$decoded = json_decode( $raw, true );
		$message = '';
		if ( is_array( $decoded ) ) {
			if ( isset( $decoded['message'] ) && is_string( $decoded['message'] ) ) {
				$message = $decoded['message'];
			} elseif ( isset( $decoded['error'] ) && is_string( $decoded['error'] ) ) {
				$message = $decoded['error'];
			}
			if ( isset( $decoded['errors'] ) && is_array( $decoded['errors'] ) ) {
				$flat = array();
				array_walk_recursive(
					$decoded['errors'],
					static function ( $value ) use ( &$flat ) {
						if ( is_string( $value ) && '' !== $value ) {
							$flat[] = $value;
						}
					}
				);
				if ( $flat ) {
					$message = trim( $message . ' ' . implode( ' ', $flat ) );
				}
			}
			if ( isset( $decoded['ok'] ) && false === $decoded['ok'] && $code >= 200 && $code < 300 ) {
				$code = 422;
			}
		}
		if ( '' === $message && $code >= 400 ) {
			$message = '' !== trim( $raw ) ? $raw : 'HTTP ' . $code;
		}
		$ok = $code >= 200 && $code < 300;
		// Idempotent replay: the batch was already accepted.
		if ( 409 === $code ) {
			$ok = true;
		}
		return array(
			'ok'          => $ok,
			'http_status' => $code,
			'retry_after' => $retry,
			'error'       => $ok ? '' : Webino_Dashboard_Migrate_Schema::redact( $message, $token ),
			'body'        => is_array( $decoded ) ? $decoded : array(),
		);
	}

	/**
	 * @param array<string,mixed> $body Parsed JSON.
	 * @return int
	 */
	public static function remote_job_id( array $body ) {
		$data = isset( $body['data'] ) && is_array( $body['data'] ) ? $body['data'] : $body;
		if ( isset( $data['job'] ) && is_array( $data['job'] ) && isset( $data['job']['id'] ) ) {
			return (int) $data['job']['id'];
		}
		if ( isset( $data['id'] ) && ( isset( $data['status'] ) || isset( $data['source_url'] ) ) ) {
			return (int) $data['id'];
		}
		return 0;
	}

	/**
	 * @param mixed $header Retry-After header.
	 * @return int Seconds, 0 when absent.
	 */
	public static function retry_after_seconds( $header ) {
		$header = trim( (string) $header );
		if ( '' === $header ) {
			return 0;
		}
		if ( ctype_digit( $header ) ) {
			return (int) $header;
		}
		$stamp = strtotime( $header );
		if ( false === $stamp ) {
			return 0;
		}
		return max( 0, $stamp - time() );
	}
}
