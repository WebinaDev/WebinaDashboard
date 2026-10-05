<?php
/**
 * Basalam wallet and settlement service.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Basalam_Wallet_Service {
	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function wallet_overview() {
		return Basalam_Client::request( 'GET', '/wallet/overview' );
	}

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function settlements() {
		return Basalam_Client::request( 'GET', '/wallet/settlements' );
	}
}
