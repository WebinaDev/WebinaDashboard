<?php
/**
 * Enhance HTTP for form-urlencoded OAuth bodies.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Shared HTTP client for marketplace APIs.
 */
class WNC_HTTP {

	/**
	 * @param string              $method Method.
	 * @param string              $url URL.
	 * @param array<string,mixed> $args Args (headers, body, query, timeout, form).
	 * @return array|WP_Error Parsed JSON body with _status, or WP_Error.
	 */
	public static function request( $method, $url, array $args = array() ) {
		$query = isset( $args['query'] ) && is_array( $args['query'] ) ? $args['query'] : null;
		if ( $query ) {
			$url = add_query_arg( $query, $url );
		}

		$headers = isset( $args['headers'] ) && is_array( $args['headers'] ) ? $args['headers'] : array();
		$is_form = ! empty( $args['form'] );

		if ( $is_form ) {
			$headers['Content-Type'] = 'application/x-www-form-urlencoded';
		} elseif ( ! isset( $headers['Content-Type'] ) ) {
			$headers['Content-Type'] = 'application/json';
		}

		$request = array(
			'method'  => strtoupper( $method ),
			'timeout' => isset( $args['timeout'] ) ? (int) $args['timeout'] : 35,
			'headers' => $headers,
		);

		if ( array_key_exists( 'body', $args ) && null !== $args['body'] ) {
			if ( $is_form && is_array( $args['body'] ) ) {
				$request['body'] = http_build_query( $args['body'] );
			} else {
				$request['body'] = is_string( $args['body'] ) ? $args['body'] : wp_json_encode( $args['body'] );
			}
		}

		$res = wp_remote_request( $url, $request );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$code = (int) wp_remote_retrieve_response_code( $res );
		$raw  = (string) wp_remote_retrieve_body( $res );
		$body = json_decode( $raw, true );
		if ( ! is_array( $body ) ) {
			$body = array( 'raw' => $raw );
		}
		$body['_status'] = $code;

		if ( $code < 200 || $code >= 300 ) {
			$msg = isset( $body['message'] ) ? (string) $body['message'] : __( 'API error', 'webinaconnector' );
			if ( empty( $body['message'] ) && ! empty( $body['error_description'] ) ) {
				$msg = (string) $body['error_description'];
			}
			$path = wp_parse_url( $url, PHP_URL_PATH );
			return new WP_Error(
				'wnc_http_error',
				sprintf( '%s [%s %s]', $msg, $code, $path ? $path : $url ),
				array(
					'status'      => $code,
					'path'        => $path,
					'response'    => $body,
					'retry_after' => (int) wp_remote_retrieve_header( $res, 'retry-after' ),
				)
			);
		}

		return $body;
	}
}
