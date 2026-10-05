<?php
/**
 * PSR-4 style autoload for Webino_Dashboard_Bots_Telegram\* classes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

spl_autoload_register(
	static function ( $class ) {
		$prefix = 'Webino_Dashboard_Bots_Telegram\\';
		$len    = strlen( $prefix );
		if ( strncmp( $prefix, $class, $len ) !== 0 ) {
			return;
		}
		$relative = substr( $class, $len );
		$file     = WOOBALE_PLUGIN_DIR . 'src/' . str_replace( '\\', '/', $relative ) . '.php';
		if ( is_readable( $file ) ) {
			require $file;
		}
	}
);
