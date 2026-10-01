<?php
/**
 * HTTP client for Webino wordpress import ingest API.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pushes ingest batches and runs jobs. Tokens stay out of logs.
 */
final class Webino_Dashboard_Migrate_Client {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'http_api_debug', array( __CLASS__, 'redact_http_debug' ), 0, 5 );
	}

	/**
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
		$result = self::request( 'ping', $body, 'ping:' . gmdate( 'YmdHis' ), array() );
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
		return array(
			'ok'          => true,
			'http_status' => (int) $result['http_status'],
			'message'     => __( 'Connection succeeded.', 'webino-dashboard' ),
		);
	}

	/**
	 * Push one resource batch through POST /import/wordpress/ingest.
	 *
	 * @param string                    $resource Canonical Webino resource.
	 * @param list<array<string,mixed>> $items    Already adapted items.
	 * @param string                    $idempotency Idempotency key.
	 * @param array<string,mixed>       $extra    Extra ingest fields.
	 * @return array{ok:bool,http_status:int,retry_after:int,error:string,job_id:int,body:array}|WP_Error
	 */
	public static function ingest( $resource, array $items, $idempotency, array $extra = array() ) {
		$source = Webino_Dashboard_Migrate_Schema::source_site();
		$body   = array_merge(
			array(
				'source_url'     => isset( $source['site_url'] ) ? (string) $source['site_url'] : '',
				'resource'       => (string) $resource,
				'items'          => array_values( $items ),
				'download_media' => true,
				'dry_run'        => Webino_Dashboard_Migrate_Settings::dry_run(),
			),
			$extra
		);
		if ( '' === $body['source_url'] ) {
			return new WP_Error( 'empty_source', __( 'Could not resolve this site URL for the ingest payload.', 'webino-dashboard' ) );
		}
		return self::request( 'ingest', $body, $idempotency, array() );
	}

	/**
	 * Apply pending rows on the Webino job.
	 *
	 * @param int    $job_id      Webino job id.
	 * @param string $idempotency Idempotency key.
	 * @param int    $limit       Run limit.
	 * @return array{ok:bool,http_status:int,retry_after:int,error:string,job_id:int,body:array}|WP_Error
	 */
	public static function run( $job_id, $idempotency, $limit = 50 ) {
		$job_id = (int) $job_id;
		if ( $job_id <= 0 ) {
			return new WP_Error( 'missing_job', __( 'Webino job id is missing.', 'webino-dashboard' ) );
		}
		$path = Webino_Dashboard_Migrate_Settings::endpoint( 'run' );
		$path = str_replace( array( '{id}', '{job}', '{jobId}' ), (string) $job_id, $path );
		return self::request_path(
			$path,
			array( 'limit' => max( 1, min( 100, (int) $limit ) ) ),
			$idempotency,
			array( 'job_id' => $job_id )
		);
	}

	/**
	 * Legacy helper used by older job code paths / tests.
	 *
	 * @param string              $endpoint_key Endpoint key.
	 * @param array<string,mixed> $body         JSON body.
	 * @param string              $idempotency  Idempotency key.
	 * @return array{ok:bool,http_status:int,retry_after:int,error:string,job_id:int,body:array}|WP_Error
	 */
	public static function post( $endpoint_key, array $body, $idempotency ) {
		return self::request( $endpoint_key, $body, $idempotency, array() );
	}

	/**
	 * @param string              $endpoint_key Endpoint key.
	 * @param array<string,mixed> $body         JSON body.
	 * @param string              $idempotency  Idempotency key.
	 * @param array<string,mixed> $meta         Extra meta for dry-run.
	 * @return array{ok:bool,http_status:int,retry_after:int,error:string,job_id:int,body:array}|WP_Error
	 */
	public static function request( $endpoint_key, array $body, $idempotency, array $meta ) {
		if ( Webino_Dashboard_Migrate_Settings::dry_run() && 'ping' !== $endpoint_key ) {
			return array(
				'ok'          => true,
				'http_status' => 200,
				'retry_after' => 0,
				'error'       => '',
				'job_id'      => isset( $meta['job_id'] ) ? (int) $meta['job_id'] : 0,
				'body'        => array(),
			);
		}

		$path = Webino_Dashboard_Migrate_Settings::endpoint( $endpoint_key );
		if ( '' === $path ) {
			return new WP_Error( 'bad_endpoint', __( 'The destination URL or endpoint path is missing.', 'webino-dashboard' ) );
		}
		return self::request_path( $path, $body, $idempotency, $meta );
	}

	/**
	 * @param string              $path        Absolute path (may still contain {id}).
	 * @param array<string,mixed> $body        JSON body.
	 * @param string              $idempotency Idempotency key.
	 * @param array<string,mixed> $meta        Meta.
	 * @return array{ok:bool,http_status:int,retry_after:int,error:string,job_id:int,body:array}|WP_Error
	 */
	public static function request_path( $path, array $body, $idempotency, array $meta = array() ) {
		if ( Webino_Dashboard_Migrate_Settings::dry_run() && false === strpos( (string) $path, '/ping' ) ) {
			return array(
				'ok'          => true,
				'http_status' => 200,
				'retry_after' => 0,
				'error'       => '',
				'job_id'      => isset( $meta['job_id'] ) ? (int) $meta['job_id'] : 0,
				'body'        => array(),
			);
		}

		$origin = Webino_Dashboard_Migrate_Settings::site_url();
		if ( '' === $origin || '' === $path ) {
			return new WP_Error( 'bad_endpoint', __( 'The destination URL or endpoint path is missing.', 'webino-dashboard' ) );
		}
		if ( false !== strpos( $path, '{id}' ) || false !== strpos( $path, '{job}' ) ) {
			return new WP_Error( 'bad_endpoint', __( 'The Webino job id placeholder was not replaced.', 'webino-dashboard' ) );
		}
		$url  = Webino_Dashboard_Migrate_Schema::join_url( $origin, $path );
		$json = wp_json_encode( $body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
		if ( ! is_string( $json ) ) {
			return new WP_Error( 'json_encode', __( 'Could not encode the migration batch.', 'webino-dashboard' ) );
		}

		$token   = Webino_Dashboard_Migrate_Settings::token();
		$headers = array(
			'Accept'                   => 'application/json',
			'Content-Type'             => 'application/json; charset=utf-8',
			'X-Webino-Import-Schema'   => Webino_Dashboard_Migrate_Schema::NAME,
			'X-Webino-Idempotency-Key' => $idempotency,
			'User-Agent'               => 'WebinoDashboard-Migrate/' . ( defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '0' ),
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
	 * @return array{ok:bool,http_status:int,retry_after:int,error:string,job_id:int,body:array}
	 */
	public static function parse_response( $response, $token = '' ) {
		if ( is_wp_error( $response ) ) {
			return array(
				'ok'          => false,
				'http_status' => 0,
				'retry_after' => 0,
				'error'       => Webino_Dashboard_Migrate_Schema::redact( $response->get_error_message(), $token ),
				'job_id'      => 0,
				'body'        => array(),
			);
		}
		$code    = (int) wp_remote_retrieve_response_code( $response );
		$raw     = (string) wp_remote_retrieve_body( $response );
		$retry   = self::retry_after_seconds( wp_remote_retrieve_header( $response, 'retry-after' ) );
		$decoded = json_decode( $raw, true );
		$body    = is_array( $decoded ) ? $decoded : array();
		$message = '';
		if ( is_array( $decoded ) ) {
			if ( isset( $decoded['message'] ) && is_string( $decoded['message'] ) ) {
				$message = $decoded['message'];
			} elseif ( isset( $decoded['error'] ) && is_string( $decoded['error'] ) ) {
				$message = $decoded['error'];
			}
			if ( isset( $decoded['ok'] ) && false === $decoded['ok'] && $code >= 200 && $code < 300 ) {
				$code = 422;
			}
			if ( isset( $decoded['success'] ) && false === $decoded['success'] && $code >= 200 && $code < 300 ) {
				$code = 422;
			}
		}
		if ( '' === $message && $code >= 400 ) {
			$message = '' !== trim( $raw ) ? $raw : 'HTTP ' . $code;
		}
		$ok = $code >= 200 && $code < 300;
		if ( 409 === $code ) {
			$ok = true;
		}
		$job_id = 0;
		if ( isset( $body['data']['job']['id'] ) ) {
			$job_id = (int) $body['data']['job']['id'];
		} elseif ( isset( $body['data']['id'] ) ) {
			$job_id = (int) $body['data']['id'];
		} elseif ( isset( $body['job']['id'] ) ) {
			$job_id = (int) $body['job']['id'];
		}
		return array(
			'ok'          => $ok,
			'http_status' => $code,
			'retry_after' => $retry,
			'error'       => $ok ? '' : Webino_Dashboard_Migrate_Schema::redact( $message, $token ),
			'job_id'      => $job_id,
			'body'        => $body,
		);
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
