<?php
/**
 * Basalam plans and subscriptions service.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Basalam_Subscriptions_Service {
	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function plans() {
		return Basalam_Client::request( 'GET', '/subscriptions/plans' );
	}

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function subscriptions() {
		return Basalam_Client::request( 'GET', '/subscriptions/items' );
	}
}
