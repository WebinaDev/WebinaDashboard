<?php
/**
 * Security HTTP headers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Send security headers from settings.
 */
final class Webino_Shield_Headers {

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'send_headers', array( __CLASS__, 'send' ), 99 );
		add_filter( 'the_generator', array( __CLASS__, 'remove_generator' ) );
	}

	/**
	 * @return void
	 */
	public static function send() {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['headers']['enabled'] ) ) {
			return;
		}
		if ( is_admin() ) {
			return;
		}

		if ( ! empty( $s['headers']['xcto'] ) ) {
			header( 'X-Content-Type-Options: nosniff' );
		}

		if ( ! empty( $s['headers']['referrer'] ) ) {
			header( 'Referrer-Policy: ' . sanitize_text_field( (string) $s['headers']['referrer'] ) );
		}

		$frame = (string) ( $s['headers']['frame'] ?? 'sameorigin' );
		if ( 'sameorigin' === $frame ) {
			header( 'X-Frame-Options: SAMEORIGIN' );
		} elseif ( 'deny' === $frame ) {
			header( 'X-Frame-Options: DENY' );
		}

		if ( ! empty( $s['headers']['hsts'] ) && is_ssl() ) {
			$max = (int) ( $s['headers']['hsts_max_age'] ?? 15552000 );
			$hsts = 'max-age=' . $max;
			if ( ! empty( $s['headers']['hsts_subdomains'] ) ) {
				$hsts .= '; includeSubDomains';
			}
			if ( ! empty( $s['headers']['hsts_preload'] ) ) {
				$hsts .= '; preload';
			}
			header( 'Strict-Transport-Security: ' . $hsts );
		}

		if ( ! empty( $s['headers']['permissions_policy'] ) ) {
			header( 'Permissions-Policy: ' . sanitize_text_field( (string) $s['headers']['permissions_policy'] ) );
		}

		$csp_mode = (string) ( $s['headers']['csp_mode'] ?? 'off' );
		if ( 'off' !== $csp_mode ) {
			$csp = self::build_csp( $s['headers']['csp'] ?? array() );
			if ( $csp ) {
				$header = 'report-only' === $csp_mode ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
				header( $header . ': ' . $csp );
			}
		}

		if ( ! empty( $s['headers']['remove_powered_by'] ) ) {
			header_remove( 'X-Powered-By' );
		}
	}

	/**
	 * @param array<string,mixed>|string $csp CSP config.
	 * @return string
	 */
	private static function build_csp( $csp ) {
		if ( is_string( $csp ) && '' !== $csp ) {
			return sanitize_text_field( $csp );
		}
		if ( ! is_array( $csp ) || empty( $csp ) ) {
			return "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
		}
		$parts = array();
		foreach ( $csp as $directive => $sources ) {
			if ( is_array( $sources ) ) {
				$parts[] = sanitize_key( $directive ) . ' ' . implode( ' ', array_map( 'sanitize_text_field', $sources ) );
			}
		}
		return implode( '; ', $parts );
	}

	/**
	 * @param string $gen Generator string.
	 * @return string
	 */
	public static function remove_generator( $gen ) {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( ! empty( $s['headers']['remove_wp_version'] ) ) {
			return '';
		}
		return $gen;
	}

	/**
	 * Test headers against front URL.
	 *
	 * @return array<string,mixed>
	 */
	public static function test_front() {
		$url  = home_url( '/' );
		$resp = wp_remote_get( $url, array( 'timeout' => 10, 'sslverify' => false ) );
		if ( is_wp_error( $resp ) ) {
			return array( 'error' => $resp->get_error_message() );
		}
		return array(
			'url'     => $url,
			'code'    => wp_remote_retrieve_response_code( $resp ),
			'headers' => wp_remote_retrieve_headers( $resp )->getAll(),
		);
	}
}
