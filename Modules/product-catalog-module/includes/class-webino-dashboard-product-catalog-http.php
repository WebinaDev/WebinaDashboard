<?php
/**
 * Shared HTTP helper for product catalog providers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Polite wp_remote_get with User-Agent and optional cache.
 */
final class Webino_Dashboard_Product_Catalog_Http {

	/**
	 * @param string               $url URL.
	 * @param array<string,mixed>  $args Extra wp_remote_get args.
	 * @param int                  $cache_ttl Cache seconds (0 = no cache).
	 * @return array<string,mixed>|WP_Error Decoded JSON or error.
	 */
	public static function get_json( $url, array $args = array(), $cache_ttl = 0 ) {
		$url = esc_url_raw( (string) $url );
		if ( '' === $url ) {
			return new WP_Error( 'invalid_url', __( 'Invalid URL.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$cache_ttl = max( 0, (int) $cache_ttl );
		$cache_key = '';
		if ( $cache_ttl > 0 ) {
			$cache_key = 'wd_pc_' . md5( $url . wp_json_encode( $args ) );
			$cached    = get_transient( $cache_key );
			if ( is_array( $cached ) ) {
				return $cached;
			}
		}

		$ver = defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '1.0';
		$defaults = array(
			'timeout' => 18,
			'headers' => array(
				'Accept'     => 'application/json',
				'User-Agent' => 'WebinaDashboard/' . $ver . ' (product-catalog; https://webina.dev)',
			),
		);
		if ( ! empty( $args['headers'] ) && is_array( $args['headers'] ) ) {
			$defaults['headers'] = array_merge( $defaults['headers'], $args['headers'] );
			unset( $args['headers'] );
		}
		$req = array_merge( $defaults, $args );

		$res = wp_remote_get( $url, $req );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		$body = (string) wp_remote_retrieve_body( $res );
		if ( 429 === $code ) {
			return new WP_Error( 'rate_limited', __( 'Provider rate limit reached. Try again later.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}
		if ( $code < 200 || $code >= 300 ) {
			return new WP_Error(
				'http_error',
				sprintf(
					/* translators: %d: HTTP status */
					__( 'Catalog provider returned HTTP %d.', 'webino-dashboard' ),
					$code
				),
				array( 'status' => $code )
			);
		}
		$data = json_decode( $body, true );
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'invalid_json', __( 'Invalid provider response.', 'webino-dashboard' ), array( 'status' => 502 ) );
		}
		if ( $cache_ttl > 0 && $cache_key ) {
			set_transient( $cache_key, $data, $cache_ttl );
		}
		return $data;
	}

	/**
	 * Detect GTIN/EAN/UPC barcode digits.
	 *
	 * @param string $raw Raw input.
	 * @return string Digits only or empty.
	 */
	public static function normalize_barcode( $raw ) {
		$digits = preg_replace( '/\D+/', '', (string) $raw );
		if ( ! is_string( $digits ) ) {
			return '';
		}
		$len = strlen( $digits );
		if ( $len >= 8 && $len <= 14 ) {
			return $digits;
		}
		return '';
	}
}
