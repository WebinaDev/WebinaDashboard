<?php
/**
 * DigiPay API client.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digipay_Api_Client {

	/**
	 * @param string               $method HTTP method.
	 * @param string               $path API path.
	 * @param array<string,mixed>|null $body Body.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function request( $method, $path, $body = null ) {
		$token = Digipay_OAuth::get_access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}
		$s       = Digipay_OAuth::settings();
		$url     = trailingslashit( Digipay_OAuth::base_url() ) . ltrim( $path, '/' );
		$payload = null === $body ? '' : wp_json_encode( $body );

		$args = array(
			'method'  => strtoupper( $method ),
			'timeout' => 25,
			'headers' => array(
				'Authorization'    => 'Bearer ' . $token,
				'Agent'            => 'WEB',
				'Digipay-Version'  => (string) $s['digipay_version'],
				'Content-Type'     => 'application/json',
			),
		);
		if ( '' !== $payload ) {
			$args['body'] = $payload;
		}
		$response = wp_remote_request( $url, $args );
		if ( is_wp_error( $response ) ) {
			return $response;
		}
		$code   = wp_remote_retrieve_response_code( $response );
		$parsed = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $parsed ) ) {
			$parsed = array();
		}
		if ( $code < 200 || $code >= 300 ) {
			return new WP_Error( 'digipay_api_error', __( 'DigiPay API request failed.', 'webino-dashboard' ), array( 'status' => $code, 'response' => $parsed, 'path' => $path ) );
		}
		return $parsed;
	}

	/** @return array<string,mixed>|WP_Error */
	public static function create_ticket( $payload ) {
		return self::request( 'POST', 'tickets/business?type=11', $payload );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function verify_purchase( $type, $tracking_code, $provider_id ) {
		return self::request(
			'POST',
			'purchases/verify?type=' . (int) $type,
			array(
				'trackingCode' => (string) $tracking_code,
				'providerId'   => (string) $provider_id,
			)
		);
	}

	/** @return array<string,mixed>|WP_Error */
	public static function deliver_purchase( $type, $payload ) {
		return self::request( 'POST', 'purchases/deliver?type=' . (int) $type, $payload );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function refund_purchase( $type, $payload ) {
		return self::request( 'POST', 'refunds?type=' . (int) $type, $payload );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function reverse_purchase( $type, $payload ) {
		return self::request( 'POST', 'reverse?type=' . (int) $type, $payload );
	}

	/** @return array<string,mixed>|WP_Error */
	public static function refund_inquiry( $inquiry_id ) {
		return self::request( 'GET', 'refunds/' . rawurlencode( (string) $inquiry_id ) );
	}
}
