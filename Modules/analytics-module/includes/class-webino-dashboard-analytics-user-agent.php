<?php
/**
 * User-agent parsing for analytics.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lightweight UA → browser/os/device.
 */
class Webino_Dashboard_Analytics_User_Agent {

	/**
	 * @param string $ua User agent.
	 * @return array{browser: string, os: string, device: string}
	 */
	public static function parse( $ua ) {
		$ua = (string) $ua;
		$l  = strtolower( $ua );

		$browser = 'Other';
		if ( false !== strpos( $l, 'edg/' ) || false !== strpos( $l, 'edge' ) ) {
			$browser = 'Edge';
		} elseif ( false !== strpos( $l, 'firefox' ) ) {
			$browser = 'Firefox';
		} elseif ( false !== strpos( $l, 'chrome' ) && false === strpos( $l, 'chromium' ) ) {
			$browser = 'Chrome';
		} elseif ( false !== strpos( $l, 'safari' ) && false === strpos( $l, 'chrome' ) ) {
			$browser = 'Safari';
		} elseif ( false !== strpos( $l, 'opera' ) || false !== strpos( $l, 'opr/' ) ) {
			$browser = 'Opera';
		}

		$os = 'Other';
		if ( false !== strpos( $l, 'android' ) ) {
			$os = 'Android';
		} elseif ( false !== strpos( $l, 'iphone' ) || false !== strpos( $l, 'ipad' ) ) {
			$os = 'iOS';
		} elseif ( false !== strpos( $l, 'windows' ) ) {
			$os = 'Windows';
		} elseif ( false !== strpos( $l, 'mac os' ) || false !== strpos( $l, 'macintosh' ) ) {
			$os = 'macOS';
		} elseif ( false !== strpos( $l, 'linux' ) ) {
			$os = 'Linux';
		}

		$device = 'Desktop';
		if ( false !== strpos( $l, 'mobile' ) || false !== strpos( $l, 'iphone' ) || false !== strpos( $l, 'android' ) ) {
			$device = 'Mobile';
		} elseif ( false !== strpos( $l, 'ipad' ) || false !== strpos( $l, 'tablet' ) ) {
			$device = 'Tablet';
		}

		return array(
			'browser' => $browser,
			'os'      => $os,
			'device'  => $device,
		);
	}

	/**
	 * @param string $ua User agent.
	 * @return bool
	 */
	public static function is_bot( $ua ) {
		$l = strtolower( (string) $ua );
		if ( '' === $l ) {
			return true;
		}
		$bots = array( 'bot', 'spider', 'crawl', 'slurp', 'mediapartners', 'facebookexternalhit', 'preview' );
		foreach ( $bots as $b ) {
			if ( false !== strpos( $l, $b ) ) {
				return true;
			}
		}
		return false;
	}
}
