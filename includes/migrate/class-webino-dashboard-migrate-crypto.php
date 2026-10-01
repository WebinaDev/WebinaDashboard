<?php
/**
 * Encrypt the Webino import token at rest.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AES-256-CBC token storage. Ciphertext is prefixed with `v1:`.
 */
final class Webino_Dashboard_Migrate_Crypto {

	const PREFIX = 'v1:';

	/**
	 * @return string|WP_Error Raw 32-byte key.
	 */
	private static function key_material() {
		$auth    = defined( 'AUTH_KEY' ) ? (string) AUTH_KEY : '';
		$secure  = defined( 'SECURE_AUTH_KEY' ) ? (string) SECURE_AUTH_KEY : '';
		$material = $auth . '|' . $secure;
		if ( strlen( $material ) < 16 ) {
			return new WP_Error(
				'missing_salt',
				__( 'WordPress AUTH_KEY and SECURE_AUTH_KEY must be set before a migration token can be stored.', 'webino-dashboard' )
			);
		}
		return hash( 'sha256', $material . '|webino-migrate-v1', true );
	}

	/**
	 * @param string $plain Token.
	 * @return string|WP_Error Prefixed payload, or error. Empty plain returns empty string.
	 */
	public static function encrypt( $plain ) {
		$plain = (string) $plain;
		if ( '' === $plain ) {
			return '';
		}
		if ( ! function_exists( 'openssl_encrypt' ) ) {
			return new WP_Error(
				'openssl_missing',
				__( 'The OpenSSL extension is required to store the Webino API token.', 'webino-dashboard' )
			);
		}
		$key = self::key_material();
		if ( is_wp_error( $key ) ) {
			return $key;
		}
		$iv  = random_bytes( 16 );
		$raw = openssl_encrypt( $plain, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv );
		if ( false === $raw ) {
			return new WP_Error(
				'encrypt_failed',
				__( 'Could not encrypt the Webino API token.', 'webino-dashboard' )
			);
		}
		return self::PREFIX . base64_encode( $iv . $raw ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
	}

	/**
	 * @param string $payload Stored value.
	 * @return string Plain token, or empty when missing/invalid. Never returns the ciphertext.
	 */
	public static function decrypt( $payload ) {
		$payload = (string) $payload;
		if ( '' === $payload || 0 !== strpos( $payload, self::PREFIX ) ) {
			return '';
		}
		if ( ! function_exists( 'openssl_decrypt' ) ) {
			return '';
		}
		$key = self::key_material();
		if ( is_wp_error( $key ) ) {
			return '';
		}
		$bin = base64_decode( substr( $payload, strlen( self::PREFIX ) ), true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
		if ( false === $bin || strlen( $bin ) < 17 ) {
			return '';
		}
		$iv  = substr( $bin, 0, 16 );
		$raw = substr( $bin, 16 );
		$out = openssl_decrypt( $raw, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv );
		return false === $out ? '' : $out;
	}
}
