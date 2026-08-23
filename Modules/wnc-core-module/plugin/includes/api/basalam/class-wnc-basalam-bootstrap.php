<?php
/**
 * Boot full WooSalam-parity Basalam engine inside WebinaConnector.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Bootstrap WncBasalam engine.
 */
class WNC_Basalam_Bootstrap {

	/**
	 * @var bool
	 */
	private static $booted = false;

	/**
	 * Initialize engine.
	 */
	public static function init() {
		if ( self::$booted ) {
			return;
		}
		self::$booted = true;

		$engine = WNC_PLUGIN_DIR . 'includes/api/basalam/engine/';
		if ( ! file_exists( $engine . 'autoload.php' ) ) {
			return;
		}

		require_once WNC_PLUGIN_DIR . 'includes/api/basalam/class-wnc-basalam-runtime.php';
		require_once $engine . 'autoload.php';
		require_once $engine . 'bootstrap-functions.php';

		WNC_Basalam_Schema::ensure();

		// JobsRunner always registered; ownership checked inside checkAndRunJobs.
		wncBasalamContainer()->get( \WncBasalam\JobsRunner::class );

		add_action(
			'init',
			static function () {
				if ( ! function_exists( 'wncBasalamContainer' ) ) {
					return;
				}
				wncBasalamContainer()->get( \WncBasalam\Plugin::class );
			},
			5
		);

		add_action(
			'rest_api_init',
			static function () {
				if ( ! WNC_Basalam_Runtime::owns_runtime() ) {
					return;
				}
				register_rest_route(
					'sync-basalam',
					'/v1/order-manager',
					array(
						'methods'             => 'POST',
						'callback'            => array( \WncBasalam\Services\Orders\OrderManager::class, 'orderManger' ),
						'permission_callback' => array( \WncBasalam\Endpoints\OrderEndpoint::class, 'checkPermissions' ),
					)
				);
			},
			20
		);
	}
}

/**
 * Schema / activation for Basalam engine tables.
 */
class WNC_Basalam_Schema {

	/**
	 * Ensure DB tables + default settings.
	 */
	public static function ensure() {
		if ( ! class_exists( '\\WncBasalam\\Activator' ) ) {
			return;
		}
		\WncBasalam\Activator::activateDb();
		if ( ! get_option( 'wnc_basalam_engine_version' ) ) {
			update_option( 'wnc_basalam_engine_version', \WncBasalam\Plugin::VERSION );
		}
		$settings = get_option( 'wnc_basalam_settings', null );
		if ( null === $settings ) {
			$defaults = \WncBasalam\Admin\Settings\SettingsConfig::getDefaultSettings();
			update_option( 'wnc_basalam_settings', $defaults );
		}
	}
}
