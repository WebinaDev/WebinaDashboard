<?php
/**
 * Boot WebinoBasalam sync engine (independent Basalam port).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dashboard Basalam engine bootstrap.
 */
class Webino_Basalam_Engine_Bootstrap {

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
		require_once $engine . 'bootstrap-functions.php';

		self::ensure_schema();

		webinoBasalamContainer()->get( \WebinoBasalam\JobsRunner::class );

		// Modules load on init:10 — use ≥20 so Plugin + JobsRunner actually run this request.
		add_action(
			'init',
			static function () {
				webinoBasalamContainer()->get( \WebinoBasalam\Plugin::class );
			},
			20
		);

		add_action(
			'rest_api_init',
			static function () {
				register_rest_route(
					'sync-basalam',
					'/v1/order-manager',
					array(
						'methods'             => 'POST',
						'callback'            => array( \WebinoBasalam\Services\Orders\OrderManager::class, 'orderManger' ),
						'permission_callback' => array( \WebinoBasalam\Endpoints\OrderEndpoint::class, 'checkPermissions' ),
					)
				);
			},
			20
		);
	}

	/**
	 * Tables + defaults.
	 */
	public static function ensure_schema() {
		if ( ! class_exists( '\\WebinoBasalam\\Activator' ) ) {
			return;
		}
		\WebinoBasalam\Activator::activateDb();
		if ( ! get_option( 'webino_basalam_engine_version' ) ) {
			update_option( 'webino_basalam_engine_version', \WebinoBasalam\Plugin::VERSION );
		}
		if ( null === get_option( 'webino_basalam_sync_settings', null ) ) {
			update_option(
				'webino_basalam_sync_settings',
				\WebinoBasalam\Admin\Settings\SettingsConfig::getDefaultSettings()
			);
		}

		self::maybe_import_legacy_woosalam_token();
	}

	/**
	 * One-shot import of WooSalam option tokens into webino_basalam_sync_settings.
	 *
	 * @return void
	 */
	private static function maybe_import_legacy_woosalam_token() {
		if ( ! function_exists( 'webinoBasalamSettings' ) ) {
			return;
		}
		if ( webinoBasalamSettings()->hasToken() ) {
			return;
		}
		if ( get_option( 'webino_basalam_imported_sync_basalam', false ) ) {
			return;
		}

		$legacy = get_option( 'sync_basalam_settings', null );
		if ( ! is_array( $legacy ) || empty( $legacy['token'] ) ) {
			update_option( 'webino_basalam_imported_sync_basalam', 1, false );
			return;
		}

		$cfg = \WebinoBasalam\Admin\Settings\SettingsConfig::class;
		\WebinoBasalam\Admin\Settings\SettingsManager::updateSettings(
			array(
				$cfg::TOKEN                => sanitize_text_field( (string) $legacy['token'] ),
				$cfg::REFRESH_TOKEN        => isset( $legacy['refresh_token'] ) ? sanitize_text_field( (string) $legacy['refresh_token'] ) : null,
				$cfg::HAMSALAM_TOKEN       => isset( $legacy['hamsalam_token'] ) ? sanitize_text_field( (string) $legacy['hamsalam_token'] ) : null,
				$cfg::HAMSALAM_BUSINESS_ID => isset( $legacy['hamsalam_business_id'] ) ? sanitize_text_field( (string) $legacy['hamsalam_business_id'] ) : null,
				$cfg::VENDOR_ID            => isset( $legacy['vendor_id'] ) ? (string) absint( $legacy['vendor_id'] ) : null,
				$cfg::IS_VENDOR            => $legacy['is_vendor'] ?? true,
				$cfg::EXPIRE_TOKEN_TIME    => isset( $legacy['expire_token_time'] ) ? absint( $legacy['expire_token_time'] ) : null,
			)
		);
		update_option( 'webino_basalam_imported_sync_basalam', 1, false );
		webinoBasalamSettings()->forget();
	}
}
