<?php
/**
 * Runtime ownership: when Dashboard basalam-module engine is present, it owns
 * webhook + job runner to avoid double processing.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Basalam runtime ownership helper.
 */
class WNC_Basalam_Runtime {

	/**
	 * Whether Connector Basalam should run jobs/webhooks.
	 *
	 * @return bool
	 */
	public static function owns_runtime() {
		if ( function_exists( 'webinoBasalamContainer' ) && class_exists( '\\WebinoBasalam\\Plugin', false ) ) {
			return (bool) apply_filters( 'wnc_basalam_owns_runtime', false );
		}
		return (bool) apply_filters( 'wnc_basalam_owns_runtime', true );
	}
}
