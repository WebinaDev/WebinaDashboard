<?php
/**
 * Digikala Open API client.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Client {

	/**
	 * @var int
	 */
	private static $rate_limited_until = 0;

	/**
	 * @param string                    $method HTTP method.
	 * @param string                    $path API path.
	 * @param array<string,mixed>|null  $body Body.
	 * @param array<string,mixed>|null  $query Query.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function request( $method, $path, $body = null, $query = null ) {
		if ( class_exists( '\\WebinoDigikala\\Client', false ) ) {
			return \WebinoDigikala\Client::request( $method, $path, $body, is_array( $query ) ? $query : null );
		}
		if ( self::$rate_limited_until > time() ) {
			$wait = self::$rate_limited_until - time();
			return new WP_Error( 'dk_rate_limited', __( 'Digikala API is temporarily rate limited.', 'webino-dashboard' ), array( 'status' => 429, 'retry_after' => $wait ) );
		}
		$token = Digikala_Auth::access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}
		$s = Digikala_Auth::settings();
		$url = trailingslashit( (string) $s['base_url'] ) . ltrim( $path, '/' );
		if ( is_array( $query ) && ! empty( $query ) ) {
			$url = add_query_arg( $query, $url );
		}
		$args = array(
			'method'  => strtoupper( $method ),
			'timeout' => 35,
			'headers' => array(
				'Authorization' => 'Bearer ' . $token,
				'Content-Type'  => 'application/json',
			),
		);
		if ( null !== $body ) {
			$args['body'] = wp_json_encode( $body );
		}
		$res = wp_remote_request( $url, $args );
		if ( is_wp_error( $res ) ) {
			Digikala_Jobs::log( 'error', 'api', $res->get_error_message(), array( 'path' => $path ) );
			return $res;
		}
		$code = wp_remote_retrieve_response_code( $res );
		$parsed = json_decode( wp_remote_retrieve_body( $res ), true );
		if ( ! is_array( $parsed ) ) {
			$parsed = array();
		}
		if ( $code < 200 || $code >= 300 ) {
			$retry_after = (int) wp_remote_retrieve_header( $res, 'retry-after' );
			if ( 429 === $code && $retry_after > 0 ) {
				self::$rate_limited_until = time() + $retry_after;
			}
			Digikala_Jobs::log( 'error', 'api', 'Digikala API error', array( 'path' => $path, 'status' => $code, 'response' => $parsed ) );
			return new WP_Error( 'dk_api_error', __( 'Digikala API returned an error.', 'webino-dashboard' ), array( 'status' => $code, 'response' => $parsed, 'retry_after' => $retry_after ) );
		}
		return $parsed;
	}
}
