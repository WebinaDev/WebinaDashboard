<?php
/**
 * Remote URL allowlist helpers (SSRF mitigation).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validates outbound download/fetch URLs against CRM and site hosts.
 *
 * PHP allows HTTPS only for remote hosts. Client `safeUrl.ts` allows HTTP for localhost/dev hosts only.
 */
final class Webino_Dashboard_Remote_Url {

	/**
	 * @return list<string> Lowercase hostnames without port.
	 */
	public static function allowed_hosts() {
		$hosts = array();

		$site_host = wp_parse_url( home_url(), PHP_URL_HOST );
		if ( is_string( $site_host ) && '' !== $site_host ) {
			$hosts[] = strtolower( $site_host );
		}

		if ( class_exists( 'Webino_Dashboard_License', false ) ) {
			foreach ( Webino_Dashboard_License::instance()->get_server_urls() as $base ) {
				$h = wp_parse_url( (string) $base, PHP_URL_HOST );
				if ( is_string( $h ) && '' !== $h ) {
					$hosts[] = strtolower( $h );
				}
			}
		}

		/**
		 * Extra hosts allowed for marketplace/core downloads (hostnames only).
		 *
		 * @param list<string> $hosts Hostnames.
		 */
		$extra = apply_filters(
			'webino_dashboard_allowed_download_hosts',
			array(
				'package.webina.dev',
				'git.webinaagency.ir',
				'git.webina.dev',
				'gitea.webinaagency.ir',
				'gitea.webina.dev',
				'webinaagency.ir',
				'webina.dev',
			)
		);
		foreach ( (array) $extra as $host ) {
			$host = strtolower( trim( (string) $host ) );
			if ( '' !== $host ) {
				$hosts[] = $host;
			}
		}

		return array_values( array_unique( array_filter( $hosts ) ) );
	}

	/**
	 * @param string $url Remote URL.
	 * @return bool
	 */
	public static function is_allowed_download_url( $url ) {
		$url = esc_url_raw( (string) $url );
		if ( ! $url || 0 !== strpos( $url, 'https://' ) ) {
			return false;
		}

		$host = wp_parse_url( $url, PHP_URL_HOST );
		if ( ! is_string( $host ) || '' === $host ) {
			return false;
		}

		$host = strtolower( $host );
		return in_array( $host, self::allowed_hosts(), true );
	}

	/**
	 * HTTPS git clone URL allowlist (credentials in userinfo are ignored for host check).
	 *
	 * @param string $url Clone URL from ERP module-clone-url.
	 * @return bool
	 */
	public static function is_allowed_clone_url( $url ) {
		$url = trim( (string) $url );
		if ( '' === $url || 0 !== stripos( $url, 'https://' ) ) {
			return false;
		}
		$parts = wp_parse_url( $url );
		if ( ! is_array( $parts ) ) {
			return false;
		}
		$host = isset( $parts['host'] ) ? strtolower( (string) $parts['host'] ) : '';
		if ( '' === $host ) {
			return false;
		}
		return in_array( $host, self::allowed_hosts(), true );
	}

	/**
	 * Strip userinfo from a clone URL for logs/debug.
	 *
	 * @param string $url Clone URL.
	 * @return string
	 */
	public static function redact_url( $url ) {
		$url = (string) $url;
		return (string) preg_replace( '#^(https?://)([^/@]+)@#i', '$1***@', $url );
	}
}
