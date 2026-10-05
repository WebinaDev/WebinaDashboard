<?php
/**
 * GeoIP lookup for analytics.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolves country/city from IP (Cloudflare header, optional GeoLite2, or unknown).
 */
class Webino_Dashboard_Analytics_Geo {

	/**
	 * @param string $ip IP address.
	 * @return array{country: string, city: string}
	 */
	public static function lookup( $ip ) {
		if ( ! empty( $_SERVER['HTTP_CF_IPCOUNTRY'] ) ) {
			$c = strtoupper( sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_CF_IPCOUNTRY'] ) ) );
			if ( preg_match( '/^[A-Z]{2}$/', $c ) && 'XX' !== $c ) {
				return array(
					'country' => $c,
					'city'    => '',
				);
			}
		}

		$settings = Webino_Dashboard_Analytics::get_settings();
		$path     = isset( $settings['geoip_path'] ) ? (string) $settings['geoip_path'] : '';
		if ( '' !== $path && is_readable( $path ) ) {
			$geo = self::lookup_geolite2( $ip, $path );
			if ( null !== $geo ) {
				return $geo;
			}
		}

		return array(
			'country' => '',
			'city'    => '',
		);
	}

	/**
	 * Minimal GeoLite2 Country MMDB via binary search (requires ext-maxminddb when available).
	 *
	 * @param string $ip   IP.
	 * @param string $path DB path.
	 * @return array{country: string, city: string}|null
	 */
	private static function lookup_geolite2( $ip, $path ) {
		if ( function_exists( 'geoip_country_code_by_name' ) ) {
			$code = geoip_country_code_by_name( $ip );
			if ( is_string( $code ) && '' !== $code ) {
				return array(
					'country' => strtoupper( $code ),
					'city'    => '',
				);
			}
		}

		if ( class_exists( 'MaxMind\\Db\\Reader' ) && is_readable( $path ) ) {
			try {
				$reader = new MaxMind\Db\Reader( $path );
				$rec    = $reader->get( $ip );
				$reader->close();
				if ( is_array( $rec ) ) {
					$country = '';
					if ( ! empty( $rec['country']['iso_code'] ) ) {
						$country = strtoupper( (string) $rec['country']['iso_code'] );
					}
					$city = '';
					if ( ! empty( $rec['city']['names']['en'] ) ) {
						$city = (string) $rec['city']['names']['en'];
					}
					return array(
						'country' => $country,
						'city'    => sanitize_text_field( $city ),
					);
				}
			} catch ( Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
				return null;
			}
		}

		return null;
	}
}
