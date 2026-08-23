<?php
/**
 * Settings helper.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * WNC settings accessors.
 */
class WNC_Settings {

	/**
	 * All settings.
	 *
	 * @return array
	 */
	public static function all() {
		$raw = get_option( 'wnc_settings', array() );
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		return wp_parse_args( $raw, WNC_Activator::default_settings() );
	}

	/**
	 * Platform settings.
	 *
	 * @param string $platform Platform.
	 * @return array
	 */
	public static function get_platform( $platform ) {
		$all = self::all();
		$platform = sanitize_key( $platform );
		return isset( $all[ $platform ] ) && is_array( $all[ $platform ] ) ? $all[ $platform ] : array();
	}

	/**
	 * Update platform section.
	 *
	 * @param string              $platform Platform.
	 * @param array<string,mixed> $data Data.
	 * @return bool
	 */
	public static function update_platform( $platform, array $data ) {
		$all      = self::all();
		$platform = sanitize_key( $platform );
		$current  = isset( $all[ $platform ] ) && is_array( $all[ $platform ] ) ? $all[ $platform ] : array();

		if ( isset( $data['enabled'] ) ) {
			$current['enabled'] = (bool) $data['enabled'];
		}
		if ( isset( $data['auto_sync'] ) ) {
			$current['auto_sync'] = (bool) $data['auto_sync'];
		}
		if ( isset( $data['credentials'] ) && is_array( $data['credentials'] ) ) {
			$creds = isset( $current['credentials'] ) && is_array( $current['credentials'] ) ? $current['credentials'] : array();
			foreach ( $data['credentials'] as $k => $v ) {
				$key = sanitize_key( $k );
				// Keep previous secret if empty submitted.
				if ( in_array( $key, array( 'client_secret', 'api_key', 'access_token', 'refresh_token', 'token', 'token_api', 'password', 'authorization_code', 'private_key', 'public_key', 'validation_code', 'encrypted_code' ), true ) && '' === (string) $v && ! empty( $creds[ $key ] ) ) {
					continue;
				}
				if ( in_array( $key, array( 'private_key', 'public_key' ), true ) && is_string( $v ) ) {
					// Preserve PEM newlines; do not use sanitize_text_field.
					$normalized = ( 'private_key' === $key && class_exists( 'WNC_Digikala_Auth' ) )
						? WNC_Digikala_Auth::normalize_private_key( $v )
						: ( class_exists( 'WNC_Digikala_Auth' ) ? WNC_Digikala_Auth::normalize_public_key( $v ) : str_replace( array( "\r\n", "\r" ), "\n", $v ) );
					$creds[ $key ] = $normalized;
					continue;
				}
				if ( 'encrypted_code' === $key && is_string( $v ) ) {
					$creds[ $key ] = preg_replace( '/\s+/', '', $v );
					continue;
				}
				$creds[ $key ] = is_string( $v ) ? sanitize_text_field( $v ) : $v;
			}
			$current['credentials'] = $creds;
		}

		$all[ $platform ] = $current;
		return update_option( 'wnc_settings', $all, false );
	}

	/**
	 * Bool helper.
	 *
	 * @param mixed $value Value.
	 * @return bool
	 */
	public static function to_bool( $value ) {
		if ( is_bool( $value ) ) {
			return $value;
		}
		if ( is_string( $value ) ) {
			return in_array( strtolower( $value ), array( '1', 'true', 'yes', 'on' ), true );
		}
		return (bool) $value;
	}
}
