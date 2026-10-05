<?php
/**
 * Global helpers for WebinoBasalam engine.
 *
 * @package WebinoDashboard
 */

use WebinoBasalam\Plugin;
use WebinoBasalam\Admin\Settings\SettingsContainer;
use WebinoBasalam\Infrastructure\Container\AppServiceProvider;
use WebinoBasalam\Infrastructure\Container\Container;

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'webinoBasalamContainer' ) ) {
	/**
	 * DI container.
	 *
	 * @return Container
	 */
	function webinoBasalamContainer() {
		static $container = null;
		if ( null === $container ) {
			$container = new Container();
			$container->provider( new AppServiceProvider() );
		}
		return $container;
	}
}

if ( ! function_exists( 'webinoBasalamPlugin' ) ) {
	/**
	 * @return Plugin
	 */
	function webinoBasalamPlugin() {
		return webinoBasalamContainer()->get( Plugin::class );
	}
}

/**
 * Legacy WooSalam / sync-basalam helper name still referenced in engine leftovers.
 *
 * @return Plugin
 */
if ( ! function_exists( 'syncbasalamplugin' ) ) {
	function syncbasalamplugin() {
		return webinoBasalamPlugin();
	}
}

if ( ! function_exists( 'webinoBasalamSettings' ) ) {
	/**
	 * @return SettingsContainer
	 */
	function webinoBasalamSettings() {
		return webinoBasalamContainer()->get( SettingsContainer::class );
	}
}
