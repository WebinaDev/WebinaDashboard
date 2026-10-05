<?php
/**
 * Digikala auth — RSA-4096 via WebinoDigikala engine (no plaintext authorization_code).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Auth {

	const SETTINGS_KEY = 'webino_digikala_settings';

	/**
	 * @return array<string,mixed>
	 */
	public static function settings() {
		if ( class_exists( '\\WebinoDigikala\\Settings' ) ) {
			return \WebinoDigikala\Settings::all();
		}
		$defaults = array(
			'base_url'                   => 'https://seller.digikala.com',
			'client_code'                => '',
			'private_key'                => '',
			'public_key'                 => '',
			'encrypted_code'             => '',
			'credit_increase_percentage' => 0,
			'webhook_secret'             => '',
			'auto_sync'                  => false,
			'webhook_events'             => array(),
		);
		$raw = get_option( self::SETTINGS_KEY, array() );
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		// Drop legacy plaintext auth from defaults merge.
		unset( $raw['authorization_code'], $raw['client_secret'] );
		$merged = wp_parse_args( $raw, $defaults );
		if ( class_exists( 'Digikala_Phase3_Sync' ) ) {
			$merged['webhook_events'] = Digikala_Phase3_Sync::normalize_webhook_events( $merged['webhook_events'] ?? null );
		}
		return $merged;
	}

	/**
	 * @param array<string,mixed> $patch Patch.
	 * @return array<string,mixed>
	 */
	public static function save_settings( array $patch ) {
		unset( $patch['authorization_code'], $patch['client_secret'] );
		if ( isset( $patch['webhook_events'] ) && class_exists( 'Digikala_Phase3_Sync' ) ) {
			$patch['webhook_events'] = Digikala_Phase3_Sync::normalize_webhook_events( $patch['webhook_events'] );
		}
		if ( class_exists( '\\WebinoDigikala\\Settings' ) ) {
			return \WebinoDigikala\Settings::update( $patch );
		}
		$current = self::settings();
		$merged  = array_merge( $current, $patch );
		update_option( self::SETTINGS_KEY, $merged, false );
		return $merged;
	}

	/**
	 * @return array{public_key:string}|WP_Error
	 */
	public static function generate_rsa_keypair() {
		if ( ! class_exists( '\\WebinoDigikala\\Auth' ) ) {
			return new WP_Error(
				'dk_engine',
				__( 'Digikala engine autoload is not registered.', 'webino-dashboard' ),
				array( 'status' => 503 )
			);
		}
		return \WebinoDigikala\Auth::generate_rsa_keypair();
	}

	/**
	 * Issue token from Digikala encrypted code (RSA decrypt).
	 *
	 * @param string|null $encrypted_code Optional one-shot code.
	 * @return true|WP_Error
	 */
	public static function issue_token_from_code( $encrypted_code = null ) {
		if ( ! class_exists( '\\WebinoDigikala\\Auth' ) ) {
			return new WP_Error(
				'dk_engine',
				__( 'Digikala engine autoload is not registered.', 'webino-dashboard' ),
				array( 'status' => 503 )
			);
		}
		return \WebinoDigikala\Auth::issue_from_encrypted_code( $encrypted_code );
	}

	/**
	 * @return string|WP_Error
	 */
	public static function access_token() {
		if ( ! class_exists( '\\WebinoDigikala\\Auth' ) ) {
			return new WP_Error(
				'dk_engine',
				__( 'Digikala engine autoload is not registered.', 'webino-dashboard' ),
				array( 'status' => 503 )
			);
		}
		return \WebinoDigikala\Auth::access_token();
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function token_status() {
		if ( ! class_exists( '\\WebinoDigikala\\Auth' ) ) {
			return array( 'connected' => false );
		}
		$t = \WebinoDigikala\Auth::tokens();
		return array(
			'connected'          => \WebinoDigikala\Auth::is_connected(),
			'access_expires_at'  => $t['access_expires_at'] ?? null,
			'refresh_expires_at' => $t['refresh_expires_at'] ?? null,
			'has_refresh'        => ! empty( $t['refresh_token'] ),
		);
	}
}
