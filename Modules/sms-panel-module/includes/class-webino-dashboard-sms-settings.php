<?php
/**
 * SMS panel settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Site-level SMS provider settings.
 */
class Webino_Dashboard_Sms_Settings {

	const OPTION = 'webino_dashboard_sms';

	/**
	 * @return array<string, mixed>
	 */
	public static function defaults() {
		return array(
			'provider'         => 'modirpayamak',
			'api_key'          => '',
			'sender_line'      => '',
			'custom_endpoint'  => '',
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function get() {
		$stored = get_option( self::OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return array_merge( self::defaults(), $stored );
	}

	/**
	 * @param array<string, mixed> $input Raw input.
	 * @return array<string, mixed>
	 */
	public static function sanitize( $input ) {
		if ( ! is_array( $input ) ) {
			return self::defaults();
		}
		$defaults = self::defaults();
		$out      = array();
		if ( isset( $input['provider'] ) ) {
			$p = sanitize_key( (string) $input['provider'] );
			$out['provider'] = in_array( $p, array( 'kavenegar', 'melipayamak', 'custom', 'modirpayamak' ), true ) ? $p : $defaults['provider'];
		}
		foreach ( array( 'api_key', 'sender_line', 'custom_endpoint' ) as $key ) {
			if ( array_key_exists( $key, $input ) ) {
				$out[ $key ] = sanitize_text_field( (string) $input[ $key ] );
			}
		}
		return array_merge( $defaults, $out );
	}

	/**
	 * @param array<string, mixed> $input Raw input.
	 * @return array<string, mixed>
	 */
	public static function save( $input ) {
		$sanitized = self::sanitize( $input );
		update_option( self::OPTION, $sanitized );
		return $sanitized;
	}
}
