<?php
/**
 * Self-guard module file integrity.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Hash engine files against baseline.
 */
final class Webino_Shield_Self_Guard {

	const OPTION_BASELINE = 'webino_shield_self_guard_baseline';
	const CRON_HOOK       = 'webino_shield_self_guard';

	/**
	 * @return void
	 */
	public static function init() {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['general']['self_guard'] ) ) {
			return;
		}
		add_action( self::CRON_HOOK, array( __CLASS__, 'verify' ) );
		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', self::CRON_HOOK );
		}
		if ( ! get_option( self::OPTION_BASELINE ) ) {
			self::capture_baseline();
		}
	}

	/**
	 * @return void
	 */
	public static function capture_baseline() {
		update_option( self::OPTION_BASELINE, self::current_hashes(), false );
	}

	/**
	 * @return array<string,string>
	 */
	public static function current_hashes() {
		$dir   = Webino_Dashboard_Security::module_dir();
		$paths = array_merge(
			glob( $dir . '/includes/*.php' ) ?: array(),
			glob( $dir . '/engine/*.php' ) ?: array(),
			array( $dir . '/bootstrap.php' )
		);
		$hashes = array();
		foreach ( $paths as $path ) {
			if ( is_readable( $path ) ) {
				$hashes[ str_replace( $dir . '/', '', wp_normalize_path( $path ) ) ] = hash_file( 'sha256', $path );
			}
		}
		return $hashes;
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function verify() {
		$baseline = get_option( self::OPTION_BASELINE, array() );
		if ( ! is_array( $baseline ) || empty( $baseline ) ) {
			self::capture_baseline();
			return array( 'ok' => true, 'initialized' => true );
		}

		$current = self::current_hashes();
		$changed = array();
		foreach ( $baseline as $file => $hash ) {
			if ( ! isset( $current[ $file ] ) || ! hash_equals( $hash, $current[ $file ] ) ) {
				$changed[] = $file;
			}
		}

		if ( ! empty( $changed ) ) {
			Webino_Shield_Audit::write( 'self_guard_tamper', 'module', 'security-module', array( 'files' => $changed ) );
			Webino_Shield_Notify::dispatch( 'malware', array( 'path' => implode( ',', $changed ), 'type' => 'self_guard' ) );
		}

		return array( 'ok' => empty( $changed ), 'changed' => $changed );
	}
}
