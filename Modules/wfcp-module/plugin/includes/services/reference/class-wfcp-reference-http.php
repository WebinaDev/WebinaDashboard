<?php
/**
 * HTTP helper for reference site fetches.
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Reference HTTP client.
 */
class WFCP_Reference_HTTP {

	/**
	 * Default browser-like user agent.
	 *
	 * @var string
	 */
	const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

	/**
	 * Fetch a URL and return body string.
	 *
	 * @param string $url     URL.
	 * @param array  $args    Optional wp_remote_get args.
	 * @param int    $cache_s Transient cache seconds (0 = no cache).
	 * @return string|WP_Error
	 */
	public static function get_body( $url, $args = array(), $cache_s = 120 ) {
		$url = esc_url_raw( $url );
		if ( ! $url ) {
			return new WP_Error( 'wfcp_ref_bad_url', __( 'آدرس نامعتبر است', 'webina-woo-core' ) );
		}

		$cache_key = 'wfcp_ref_http_' . md5( $url );
		if ( $cache_s > 0 ) {
			$cached = get_transient( $cache_key );
			if ( false !== $cached && is_string( $cached ) ) {
				return $cached;
			}
		}

		$defaults = array(
			'timeout'     => 25,
			'redirection' => 5,
			'sslverify'   => true,
			'headers'     => array(
				'User-Agent'      => self::USER_AGENT,
				'Accept'          => 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
				'Accept-Language' => 'fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7',
			),
		);
		$args = wp_parse_args( $args, $defaults );
		if ( ! empty( $args['headers'] ) && is_array( $args['headers'] ) ) {
			$args['headers'] = array_merge( $defaults['headers'], $args['headers'] );
		}

		$response = wp_remote_get( $url, $args );
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );
		if ( $code < 200 || $code >= 300 || '' === $body ) {
			return new WP_Error(
				'wfcp_ref_http',
				sprintf(
					/* translators: %d: HTTP status */
					__( 'خطای دریافت صفحه (کد %d)', 'webina-woo-core' ),
					$code
				)
			);
		}

		if ( $cache_s > 0 ) {
			set_transient( $cache_key, $body, $cache_s );
		}

		return $body;
	}

	/**
	 * Fetch JSON and decode.
	 *
	 * @param string $url     URL.
	 * @param array  $args    Optional args.
	 * @param int    $cache_s Cache seconds.
	 * @return array|WP_Error
	 */
	public static function get_json( $url, $args = array(), $cache_s = 120 ) {
		$args = wp_parse_args(
			$args,
			array(
				'headers' => array(
					'Accept' => 'application/json',
				),
			)
		);
		$body = self::get_body( $url, $args, $cache_s );
		if ( is_wp_error( $body ) ) {
			return $body;
		}
		$data = json_decode( $body, true );
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'wfcp_ref_json', __( 'پاسخ JSON نامعتبر است', 'webina-woo-core' ) );
		}
		return $data;
	}
}
