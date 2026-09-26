<?php
/**
 * Resolve Moadian transport from settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Factory.
 */
final class Accounting_Moadian_Transport_Factory {

	/**
	 * @return Accounting_Moadian_Transport
	 */
	public static function make() {
		$tr = (string) ( Accounting_Config::get()['moadian_transport'] ?? 'direct' );
		if ( 'tsp' === $tr ) {
			return new Accounting_Moadian_Transport_Tsp();
		}
		return new Accounting_Moadian_Transport_Direct();
	}
}
