<?php
/**
 * Boot WebinoDigikala engine (Dashboard).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dashboard Digikala engine bootstrap.
 */
class Webino_Digikala_Engine_Bootstrap {

	/**
	 * @var bool
	 */
	private static $booted = false;

	/**
	 * Init.
	 */
	public static function init() {
		if ( self::$booted ) {
			return;
		}
		self::$booted = true;

		$engine = dirname( __DIR__ ) . '/engine/';
		if ( ! file_exists( $engine . 'autoload.php' ) ) {
			return;
		}

		require_once $engine . 'autoload.php';

		if ( ! function_exists( 'webinoDigikalaBooted' ) ) {
			/**
			 * Marker for Connector ownership guard.
			 *
			 * @return bool
			 */
			function webinoDigikalaBooted() {
				return true;
			}
		}

		\WebinoDigikala\Storage::ensure_schema();

		add_action(
			'init',
			static function () {
				if ( \WebinoDigikala\Runtime::owns_runtime() ) {
					\WebinoDigikala\Jobs::process_due( 5 );
				}
			},
			20
		);
	}
}
