<?php
/**
 * Empty public root file for eNamad domain verification.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Serves /{code}.txt with an empty body and keeps a real empty file in the site root.
 */
final class Webino_Dashboard_Enamad_File {

	const OPTION = 'webino_enamad_file';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'maybe_serve' ), 0 );
	}

	/**
	 * Digits only. Accepts a bare code or a filename ending in .txt.
	 *
	 * @param mixed $raw Raw setting.
	 * @return string
	 */
	public static function normalize( $raw ) {
		$value = strtolower( trim( (string) $raw ) );
		if ( strlen( $value ) > 4 && substr( $value, -4 ) === '.txt' ) {
			$value = substr( $value, 0, -4 );
		}

		return preg_match( '/^[0-9]{1,64}$/', $value ) ? $value : '';
	}

	/**
	 * @return string
	 */
	public static function code() {
		return self::normalize( get_option( self::OPTION, '' ) );
	}

	/**
	 * @param mixed $raw Raw setting.
	 * @return string Saved code.
	 */
	public static function save( $raw ) {
		$next = self::normalize( $raw );
		$prev = self::code();
		if ( $prev !== '' && $prev !== $next ) {
			self::delete_disk( $prev );
		}
		if ( $next === '' ) {
			delete_option( self::OPTION );
			return '';
		}
		update_option( self::OPTION, $next, false );
		self::write_disk( $next );

		return $next;
	}

	/**
	 * @return void
	 */
	public static function maybe_serve() {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return;
		}
		$code = self::code();
		if ( $code === '' ) {
			return;
		}
		$uri  = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
		$path = (string) wp_parse_url( $uri, PHP_URL_PATH );
		$path = rawurldecode( $path );
		$path = '/' . ltrim( $path, '/' );
		$home = (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH );
		$home = '/' . trim( $home, '/' );
		$expected = ( '/' === $home ? '' : untrailingslashit( $home ) ) . '/' . $code . '.txt';
		if ( $path !== $expected ) {
			return;
		}

		status_header( 200 );
		header( 'Content-Type: text/plain; charset=UTF-8' );
		header( 'Content-Length: 0' );
		header( 'Cache-Control: public, max-age=60' );
		exit;
	}

	/**
	 * @param string $code Digits.
	 * @return string
	 */
	private static function disk_path( $code ) {
		return trailingslashit( ABSPATH ) . $code . '.txt';
	}

	/**
	 * @param string $code Digits.
	 * @return void
	 */
	private static function write_disk( $code ) {
		$path = self::disk_path( $code );
		if ( ! self::path_is_root_file( $path, $code ) ) {
			return;
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		@file_put_contents( $path, '' );
	}

	/**
	 * @param string $code Digits.
	 * @return void
	 */
	private static function delete_disk( $code ) {
		$path = self::disk_path( $code );
		if ( ! self::path_is_root_file( $path, $code ) || ! is_file( $path ) ) {
			return;
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.unlink_unlink
		@unlink( $path );
	}

	/**
	 * @param string $path Absolute path.
	 * @param string $code Digits.
	 * @return bool
	 */
	private static function path_is_root_file( $path, $code ) {
		$root = wp_normalize_path( trailingslashit( ABSPATH ) );
		$file = wp_normalize_path( $path );

		return $file === $root . $code . '.txt';
	}
}
