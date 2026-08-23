<?php
/**
 * Global helpers for WncBasalam engine (mirrors sync-basalam entrypoints).
 *
 * @package WNC
 */

use WncBasalam\Plugin;
use WncBasalam\Admin\Settings\SettingsContainer;
use WncBasalam\Infrastructure\Container\AppServiceProvider;
use WncBasalam\Infrastructure\Container\Container;
use WncBasalam\JobsRunner;
use WncBasalam\Registrar\AdminRegistrar;
use WncBasalam\Registrar\ListenerRegistrar;
use WncBasalam\Registrar\OrderRegistrar;
use WncBasalam\Registrar\ProductRegistrar;
use WncBasalam\Registrar\QueueRegistrar;

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'wncBasalamContainer' ) ) {
	/**
	 * DI container.
	 *
	 * @return Container
	 */
	function wncBasalamContainer() {
		static $container = null;
		if ( null === $container ) {
			$container = new Container();
			$container->provider( new AppServiceProvider() );
		}
		return $container;
	}
}

if ( ! function_exists( 'wncBasalamPlugin' ) ) {
	/**
	 * Plugin singleton.
	 *
	 * @return Plugin
	 */
	function wncBasalamPlugin() {
		return wncBasalamContainer()->get( Plugin::class );
	}
}

if ( ! function_exists( 'wncBasalamSettings' ) ) {
	/**
	 * Settings singleton.
	 *
	 * @return SettingsContainer
	 */
	function wncBasalamSettings() {
		return wncBasalamContainer()->get( SettingsContainer::class );
	}
}

/**
 * Patch Plugin registrars for ownership (jobs/webhooks).
 */
add_action(
	'plugins_loaded',
	static function () {
		if ( ! class_exists( '\\WncBasalam\\Plugin', false ) ) {
			return;
		}
		// Replace Plugin::registrars behaviour via filter on OrderRegistrar if not owner.
	},
	1
);
