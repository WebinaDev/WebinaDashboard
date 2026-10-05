<?php
/**
 * ZarinPal PG v4 REST + GraphQL client.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * HTTP client for payment and refund APIs.
 */
final class Zarinpal_Client {

	/**
	 * POST to PG v4 endpoint (request/verify/inquiry/…).
	 *
	 * @param string               $endpoint Endpoint file, e.g. request.json.
	 * @param array<string,mixed>  $body     JSON body.
	 * @param array<int>           $ok_codes Accepted data.code values (default 100).
	 * @return array<string,mixed>|WP_Error
	 */
	public static function payment( $endpoint, array $body = array(), array $ok_codes = array( 100 ) ) {
		$url  = rtrim( Zarinpal_Config::api_base(), '/' ) . '/' . ltrim( (string) $endpoint, '/' );
		$args = array(
			'method'  => 'POST',
			'timeout' => 30,
			'headers' => array(
				'Content-Type' => 'application/json',
				'User-Agent'   => self::user_agent(),
			),
			'body'    => wp_json_encode( self::filter_empty( $body ) ),
		);

		$res = wp_remote_request( $url, $args );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$code = (int) wp_remote_retrieve_response_code( $res );
		$data = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		if ( ! is_array( $data ) ) {
			$data = array();
		}

		if ( $code < 200 || $code >= 300 ) {
			return new WP_Error(
				'zarinpal_api_error',
				self::error_message( $data, __( 'Zarinpal API request failed.', 'webino-dashboard' ) ),
				array( 'status' => 502, 'http' => $code, 'data' => $data )
			);
		}

		$api_code = isset( $data['data']['code'] ) ? (int) $data['data']['code'] : 0;
		if ( ! in_array( $api_code, array_map( 'intval', $ok_codes ), true ) ) {
			return new WP_Error(
				'zarinpal_api_code',
				self::error_message( $data, __( 'Zarinpal rejected the request.', 'webino-dashboard' ) ),
				array( 'status' => 400, 'code' => $api_code, 'data' => $data )
			);
		}

		return $data;
	}

	/**
	 * GraphQL request (refund / Session lookup).
	 *
	 * @param array<string,mixed> $payload Query + variables.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function graphql( array $payload ) {
		$auth = Zarinpal_Config::bearer_token();
		if ( '' === $auth ) {
			return new WP_Error(
				'zarinpal_no_access_token',
				__( 'Zarinpal access token is required for this operation. Add it in Connection settings.', 'webino-dashboard' ),
				array( 'status' => 400 )
			);
		}

		$args = array(
			'method'  => 'POST',
			'timeout' => 30,
			'headers' => array(
				'Content-Type'  => 'application/json',
				'User-Agent'    => self::user_agent(),
				'Authorization' => $auth,
			),
			'body'    => wp_json_encode( $payload ),
		);

		$res = wp_remote_request( Zarinpal_Config::graphql_url(), $args );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$data = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		if ( ! is_array( $data ) ) {
			$data = array();
		}

		if ( ! empty( $data['errors'] ) && is_array( $data['errors'] ) ) {
			$msg = (string) ( $data['errors'][0]['message'] ?? __( 'Zarinpal GraphQL error.', 'webino-dashboard' ) );
			return new WP_Error( 'zarinpal_graphql_error', $msg, array( 'status' => 400, 'data' => $data ) );
		}

		return $data;
	}

	/**
	 * @return string
	 */
	public static function user_agent() {
		$wc_ver = defined( 'WC_VERSION' ) ? WC_VERSION : 'n/a';
		$mod    = '1.1.0';
		return sprintf(
			'ZarinPalSdk/v1 WebinoDashboard-Zarinpal/%s (WooCommerce %s; WordPress %s; PHP %s)',
			$mod,
			$wc_ver,
			get_bloginfo( 'version' ),
			PHP_VERSION
		);
	}

	/**
	 * @param array<string,mixed> $data Response.
	 * @param string              $fallback Fallback message.
	 * @return string
	 */
	private static function error_message( array $data, $fallback ) {
		if ( isset( $data['errors']['message'] ) && '' !== (string) $data['errors']['message'] ) {
			return (string) $data['errors']['message'];
		}
		if ( isset( $data['errors'][0]['message'] ) && '' !== (string) $data['errors'][0]['message'] ) {
			return (string) $data['errors'][0]['message'];
		}
		return (string) $fallback;
	}

	/**
	 * @param array<string,mixed> $array Input.
	 * @return array<string,mixed>
	 */
	private static function filter_empty( array $array ) {
		foreach ( $array as $key => $value ) {
			if ( is_array( $value ) ) {
				$array[ $key ] = self::filter_empty( $value );
				if ( array() === $array[ $key ] ) {
					unset( $array[ $key ] );
				}
			} elseif ( null === $value || '' === $value ) {
				unset( $array[ $key ] );
			}
		}
		return $array;
	}
}
