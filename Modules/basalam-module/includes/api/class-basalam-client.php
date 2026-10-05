<?php
/**
 * Basalam HTTP client wrapper.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Basalam_Client {
	/**
	 * @param string               $method HTTP method.
	 * @param string               $path API path.
	 * @param array<string,mixed>  $body Request body.
	 * @param bool                 $auth Use auth token.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function raw_request( $method, $path, array $body = array(), $auth = true ) {
		$s = Basalam_Config::get();
		$url = rtrim( (string) $s['api_base_url'], '/' ) . '/' . ltrim( $path, '/' );

		$headers = array(
			'Content-Type' => 'application/json',
		);
		if ( $auth ) {
			$token = Basalam_Auth::access_token();
			if ( is_wp_error( $token ) ) {
				return $token;
			}
			$headers['Authorization'] = 'Bearer ' . $token;
		}

		$args = array(
			'method'  => strtoupper( $method ),
			'timeout' => 30,
			'headers' => $headers,
		);
		if ( ! empty( $body ) ) {
			$args['body'] = wp_json_encode( $body );
		}
		$res = wp_remote_request( $url, $args );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$code = (int) wp_remote_retrieve_response_code( $res );
		$raw  = (string) wp_remote_retrieve_body( $res );
		$data = json_decode( $raw, true );
		if ( ! is_array( $data ) ) {
			$data = array( 'raw' => $raw );
		}
		if ( $code < 200 || $code >= 300 ) {
			return new WP_Error(
				'basalam_api_error',
				__( 'Basalam API request failed.', 'webino-dashboard' ),
				array(
					'status' => 502,
					'code'   => $code,
					'data'   => $data,
				)
			);
		}
		return $data;
	}

	/**
	 * @param string              $method Method.
	 * @param string              $path Path.
	 * @param array<string,mixed> $body Body.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function request( $method, $path, array $body = array() ) {
		return self::raw_request( $method, $path, $body, true );
	}
}
