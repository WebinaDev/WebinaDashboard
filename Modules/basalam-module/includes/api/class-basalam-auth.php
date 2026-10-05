<?php
/**
 * Legacy Basalam OAuth client (quarantined).
 *
 * Live vendor OAuth uses WebinoBasalam\Admin\Settings\OAuthManager via WebinaCRM
 * (webina.dev). Payment gateway auth uses X-Gateway-Secret via Basalam_Gateway_Service.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Basalam_Auth {
	/**
	 * @return string|WP_Error
	 */
	public static function access_token() {
		if ( function_exists( 'webinoBasalamSettings' ) && webinoBasalamSettings()->hasToken() ) {
			$token = webinoBasalamSettings()->getSettings( 'token' );
			if ( is_string( $token ) && '' !== $token ) {
				return $token;
			}
		}

		return new WP_Error(
			'basalam_legacy_auth',
			__( 'Legacy Basalam_Auth is quarantined. Connect via Basalam OAuth in the dashboard (Webina SSO).', 'webino-dashboard' ),
			array( 'status' => 400 )
		);
	}

	/**
	 * Prefer engine refresh via WebinaCRM.
	 *
	 * @return string|WP_Error
	 */
	public static function refresh_access_token() {
		if ( class_exists( '\\WebinoBasalam\\Admin\\Settings\\OAuthManager', false ) ) {
			$result = \WebinoBasalam\Admin\Settings\OAuthManager::refreshAccessToken();
			if ( ! is_wp_error( $result ) ) {
				return self::access_token();
			}
			return $result;
		}
		return self::access_token();
	}
}
