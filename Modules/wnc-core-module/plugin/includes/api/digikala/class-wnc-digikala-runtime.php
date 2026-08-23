<?php
/**
 * Digikala runtime ownership.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * When Dashboard Digikala engine is loaded, Connector yields jobs.
 */
class WNC_Digikala_Runtime {

	/**
	 * @return bool
	 */
	public static function owns_runtime() {
		if ( class_exists( '\\WebinoDigikala\\Auth', false ) || function_exists( 'webinoDigikalaBooted' ) ) {
			return (bool) apply_filters( 'wnc_digikala_owns_runtime', false );
		}
		return (bool) apply_filters( 'wnc_digikala_owns_runtime', true );
	}
}
