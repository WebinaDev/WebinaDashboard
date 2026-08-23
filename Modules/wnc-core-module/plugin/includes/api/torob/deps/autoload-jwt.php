<?php
/**
 * Autoload Firebase JWT (TorobDeps prefix) for Torob auth.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

spl_autoload_register(
	static function ( $class ) {
		$prefix = 'TorobDeps\\Firebase\\JWT\\';
		if ( 0 !== strpos( $class, $prefix ) ) {
			return;
		}
		$relative = substr( $class, strlen( $prefix ) );
		$file     = __DIR__ . '/firebase/php-jwt/src/' . str_replace( '\\', '/', $relative ) . '.php';
		if ( is_readable( $file ) ) {
			require_once $file;
		}
	}
);
