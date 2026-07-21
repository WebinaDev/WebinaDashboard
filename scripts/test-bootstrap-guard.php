#!/usr/bin/env php
<?php
/**
 * CLI smoke for bootstrap_file_is_safe (no WordPress bootstrap required).
 *
 * @package WebinoDashboard
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'WEBINO_DASHBOARD_DIR', dirname( __DIR__ ) . '/' );
define( 'WEBINO_MODULES_DIR', WEBINO_DASHBOARD_DIR . 'Modules/' );

if ( ! function_exists( 'apply_filters' ) ) {
	/**
	 * @param string $tag  Filter name.
	 * @param mixed  $value Value.
	 * @return mixed
	 */
	function apply_filters( $tag, $value ) {
		unset( $tag );
		return $value;
	}
}

if ( ! function_exists( 'sanitize_key' ) ) {
	/**
	 * @param string $key Key.
	 * @return string
	 */
	function sanitize_key( $key ) {
		return strtolower( (string) preg_replace( '/[^a-z0-9_\-]/', '', (string) $key ) );
	}
}

if ( ! function_exists( 'trailingslashit' ) ) {
	/**
	 * @param string $path Path.
	 * @return string
	 */
	function trailingslashit( $path ) {
		return rtrim( (string) $path, '/\\' ) . '/';
	}
}

require dirname( __DIR__ ) . '/includes/class-webino-dashboard-module-registry.php';

$fixture = __DIR__ . '/fixtures/legacy-telegram-bootstrap.php';
$current = dirname( __DIR__ ) . '/Modules/telegram-bot-module/bootstrap.php';

if ( ! is_readable( $fixture ) ) {
	fwrite( STDERR, "FAIL: missing fixture {$fixture}\n" );
	exit( 1 );
}

if ( Webino_Dashboard_Module_Registry::bootstrap_file_is_safe( $fixture, 'telegram-bot-module' ) ) {
	fwrite( STDERR, "FAIL: legacy fixture must be blocked\n" );
	exit( 1 );
}

if ( is_readable( $current ) && ! Webino_Dashboard_Module_Registry::bootstrap_file_is_safe( $current, 'telegram-bot-module' ) ) {
	fwrite( STDERR, "FAIL: current telegram bootstrap must pass guard\n" );
	exit( 1 );
}

fwrite( STDOUT, "OK: bootstrap guard blocks legacy and allows current telegram bootstrap\n" );
exit( 0 );
