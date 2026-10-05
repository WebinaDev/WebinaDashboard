<?php
/**
 * Referrer categorization.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Parses referrer URL into category + source.
 */
class Webino_Dashboard_Analytics_Referrer {

	/**
	 * @param string $referrer Referrer URL or empty.
	 * @return array{category: string, source: string}
	 */
	public static function categorize( $referrer ) {
		$referrer = trim( (string) $referrer );
		if ( '' === $referrer ) {
			return array(
				'category' => 'direct',
				'source'   => '',
			);
		}

		$host = wp_parse_url( $referrer, PHP_URL_HOST );
		if ( ! is_string( $host ) || '' === $host ) {
			return array(
				'category' => 'referral',
				'source'   => substr( $referrer, 0, 191 ),
			);
		}

		$host = strtolower( $host );
		$site = strtolower( (string) wp_parse_url( home_url(), PHP_URL_HOST ) );
		if ( $host === $site || ( '' !== $site && substr( $host, -strlen( $site ) ) === $site ) ) {
			return array(
				'category' => 'direct',
				'source'   => '',
			);
		}

		$search = array( 'google.', 'bing.', 'yahoo.', 'duckduckgo.', 'yandex.', 'baidu.' );
		foreach ( $search as $s ) {
			if ( false !== strpos( $host, $s ) ) {
				return array(
					'category' => 'search',
					'source'   => $host,
				);
			}
		}

		$social = array( 'facebook.', 'twitter.', 't.co', 'instagram.', 'linkedin.', 'telegram.', 'whatsapp.' );
		foreach ( $social as $s ) {
			if ( false !== strpos( $host, $s ) ) {
				return array(
					'category' => 'social',
					'source'   => $host,
				);
			}
		}

		return array(
			'category' => 'referral',
			'source'   => $host,
		);
	}
}
