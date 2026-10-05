<?php
/**
 * Dashboard-side Torob extractor settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Torob products extractor module configuration.
 */
final class Webino_Torob_Extractor_Config {

	const OPTION = 'webino_torob_extractor_module_settings';

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		$stored = get_option( self::OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		$defaults = array(
			'enabled'     => false,
			'feed_token'  => '',
			'public_key'  => '',
			'auto_sync'   => false,
			'sync_interval_hours' => 24,
		);
		return array_merge( $defaults, $stored );
	}

	/**
	 * @param array<string,mixed> $data Settings payload.
	 * @return array<string,mixed>
	 */
	public static function save( array $data ) {
		$current = self::get();
		$allowed = array( 'enabled', 'feed_token', 'public_key', 'auto_sync', 'sync_interval_hours' );
		$next    = $current;
		foreach ( $allowed as $key ) {
			if ( array_key_exists( $key, $data ) ) {
				$next[ $key ] = $data[ $key ];
			}
		}
		$next['enabled'] = ! empty( $next['enabled'] );
		$next['auto_sync'] = ! empty( $next['auto_sync'] );
		$next['sync_interval_hours'] = max( 1, (int) ( $next['sync_interval_hours'] ?? 24 ) );
		foreach ( array( 'feed_token', 'public_key' ) as $text_key ) {
			$next[ $text_key ] = sanitize_text_field( (string) ( $next[ $text_key ] ?? '' ) );
		}
		update_option( self::OPTION, $next, false );
		return self::get();
	}
}
