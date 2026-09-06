<?php
/**
 * GeoIP resolution and geo-based access control.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * CF, Arvan, optional MaxMind, plus country/ASN/TOR blocking from settings.
 */
final class Webino_Shield_Geo {

	/**
	 * Detect the visitor's two-letter country code from CDN/proxy headers,
	 * then optionally from a MaxMind GeoIP database file.
	 *
	 * @return string Two-letter country code or empty string.
	 */
	public static function country_code() {
		// Cloudflare.
		if ( ! empty( $_SERVER['HTTP_CF_IPCOUNTRY'] ) ) {
			$cc = strtoupper( sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_CF_IPCOUNTRY'] ) ) );
			if ( preg_match( '/^[A-Z]{2}$/', $cc ) ) {
				return $cc;
			}
		}

		// Arvan Cloud and generic X-Country-Code.
		foreach ( array( 'HTTP_AR_COUNTRY', 'HTTP_X_COUNTRY_CODE' ) as $header ) {
			if ( ! empty( $_SERVER[ $header ] ) ) {
				$cc = strtoupper( sanitize_text_field( wp_unslash( (string) $_SERVER[ $header ] ) ) );
				if ( preg_match( '/^[A-Z]{2}$/', $cc ) ) {
					return $cc;
				}
			}
		}

		// Legacy geoip PHP extension, if MaxMind .dat file is present.
		$path = self::maxmind_path();
		if ( $path && is_readable( $path ) && function_exists( 'geoip_open' ) ) {
			$ip = Webino_Dashboard_Security::get_client_ip();
			// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			$gi = @geoip_open( $path, GEOIP_STANDARD );
			if ( $gi ) {
				$cc = geoip_country_code_by_addr( $gi, $ip );
				geoip_close( $gi );
				return $cc ? strtoupper( $cc ) : '';
			}
		}

		return '';
	}

	/**
	 * Return the configured MaxMind database path if readable.
	 *
	 * @return string File path or empty string.
	 */
	public static function maxmind_path() {
		$s      = Webino_Dashboard_Security_Settings::get();
		$custom = isset( $s['compat']['maxmind_path'] ) ? (string) $s['compat']['maxmind_path'] : '';
		if ( $custom && is_readable( $custom ) ) {
			return $custom;
		}
		$upload  = Webino_Dashboard_Security::uploads_dir();
		$default = trailingslashit( $upload ) . 'GeoLite2-Country.mmdb';
		return is_readable( $default ) ? $default : '';
	}

	/**
	 * Basic geo lookup for an IP address.
	 *
	 * @param string $ip IP address.
	 * @return array<string,mixed>
	 */
	public static function lookup( $ip ) {
		return array(
			'ip'      => $ip,
			'country' => self::country_code(),
			'asn'     => self::asn_for_ip( $ip ),
			'source'  => 'headers',
		);
	}

	/**
	 * Resolve ASN from CDN headers (CF-Connecting-ASN / Arvan) or empty when blind.
	 *
	 * @param string $ip IP (unused when headers present).
	 * @return string e.g. AS13335 or empty.
	 */
	public static function asn_for_ip( $ip = '' ) {
		unset( $ip );
		foreach ( array( 'HTTP_CF_ASN', 'HTTP_X_ASN', 'HTTP_AR_ASN', 'HTTP_CF_CONNECTING_ASN' ) as $header ) {
			if ( empty( $_SERVER[ $header ] ) ) {
				continue;
			}
			$raw = strtoupper( sanitize_text_field( wp_unslash( (string) $_SERVER[ $header ] ) ) );
			$raw = preg_replace( '/^AS/', '', $raw );
			if ( preg_match( '/^\d+$/', $raw ) ) {
				return 'AS' . $raw;
			}
			if ( preg_match( '/^AS\d+$/', $raw ) ) {
				return $raw;
			}
		}
		return '';
	}

	// -------------------------------------------------------------------------
	// Access control
	// -------------------------------------------------------------------------

	/**
	 * Evaluate geo-level blocking rules from settings against a request array.
	 * Checks geo.block_countries, geo.block_asn, geo.block_tor.
	 * Returns a WAF result array when blocked, or null when allowed.
	 *
	 * @param array<string,mixed> $request WAF request context.
	 * @return array<string,mixed>|null
	 */
	public static function evaluate_block( $request ) {
		$s = Webino_Dashboard_Security_Settings::get();

		// --- Country blocking ---
		$country = strtoupper( (string) ( $request['country'] ?? '' ) );
		if ( '' !== $country ) {
			$geo_countries  = array_map( 'strtoupper', (array) ( $s['geo']['block_countries'] ?? array() ) );
			$acc_countries  = array_map( 'strtoupper', (array) ( $s['access']['block_countries'] ?? array() ) );
			$block_countries = array_unique( array_merge( $geo_countries, $acc_countries ) );

			if ( in_array( $country, $block_countries, true ) ) {
				return array(
					'action'     => 'block',
					'rule_id'    => 'geo_country',
					'reason'     => 'Country blocked',
					'auto_block' => false,
				);
			}
		}

		// --- TOR blocking ---
		$tor_from_geo    = ! empty( $s['geo']['block_tor'] );
		$tor_from_access = ! empty( $s['access']['block_tor'] );
		if ( ( $tor_from_geo || $tor_from_access ) && 'T1' === $country ) {
			return array(
				'action'     => 'block',
				'rule_id'    => 'geo_tor',
				'reason'     => 'TOR exit blocked',
				'auto_block' => false,
			);
		}

		// --- ASN blocking ---
		$asn = strtoupper( (string) ( $request['asn'] ?? '' ) );
		$asn = preg_replace( '/^AS/', '', $asn );
		if ( '' !== $asn ) {
			$asn = 'AS' . $asn;
			$geo_asns  = array_map(
				static function ( $a ) {
					$a = strtoupper( (string) $a );
					$a = preg_replace( '/^AS/', '', $a );
					return 'AS' . $a;
				},
				array_merge( (array) ( $s['geo']['block_asn'] ?? array() ), (array) ( $s['access']['block_asns'] ?? array() ) )
			);
			$block_asns = array_unique( $geo_asns );

			if ( in_array( $asn, $block_asns, true ) ) {
				return array(
					'action'     => 'block',
					'rule_id'    => 'geo_asn',
					'reason'     => 'ASN blocked',
					'auto_block' => false,
				);
			}
		}

		return null;
	}

	/**
	 * Convenience: check whether a specific country code is blocked per settings.
	 *
	 * @param string $country_code Two-letter country code.
	 * @return bool
	 */
	public static function is_country_blocked( $country_code ) {
		$s              = Webino_Dashboard_Security_Settings::get();
		$geo_countries  = array_map( 'strtoupper', (array) ( $s['geo']['block_countries'] ?? array() ) );
		$acc_countries  = array_map( 'strtoupper', (array) ( $s['access']['block_countries'] ?? array() ) );
		$blocked        = array_unique( array_merge( $geo_countries, $acc_countries ) );
		return in_array( strtoupper( $country_code ), $blocked, true );
	}

	/**
	 * Convenience: check whether a specific ASN is blocked per settings.
	 * ASN format: "AS12345" or just "12345".
	 *
	 * @param string $asn ASN string.
	 * @return bool
	 */
	public static function is_asn_blocked( $asn ) {
		$s        = Webino_Dashboard_Security_Settings::get();
		$geo_asns = array_map( 'strtoupper', (array) ( $s['geo']['block_asn'] ?? array() ) );
		$acc_asns = array_map( 'strtoupper', (array) ( $s['access']['block_asns'] ?? array() ) );
		$blocked  = array_unique( array_merge( $geo_asns, $acc_asns ) );
		return in_array( strtoupper( $asn ), $blocked, true );
	}
}
