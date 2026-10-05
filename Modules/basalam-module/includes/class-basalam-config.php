<?php
/**
 * Basalam settings/config management.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Basalam_Config {
	const OPTION_KEY = 'webino_basalam_settings';

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'base_url'                => 'https://developers.basalam.com',
			'api_base_url'            => 'https://api.basalam.com',
			'pay_api_base'            => 'https://openapi.basalam.com',
			'client_id'               => '',
			'client_secret'           => '',
			'access_token'            => '',
			'refresh_token'           => '',
			'token_expires_at'        => 0,
			'webhook_secret'          => '',
			'gateway_secret'          => '',
			'gateway_sandbox'         => false,
			'gateway_sandbox_token'   => 'demo-team-1',
			'gateway_enabled'         => false,
			'wallet_sync_enabled'     => true,
			'subscriptions_enabled'   => true,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		$stored = get_option( self::OPTION_KEY, array() );
		return wp_parse_args( is_array( $stored ) ? $stored : array(), self::defaults() );
	}

	/**
	 * @param array<string,mixed> $data Settings.
	 * @return array<string,mixed>
	 */
	public static function save( array $data ) {
		$old = self::get();
		$new = array(
			'base_url'              => esc_url_raw( (string) ( $data['base_url'] ?? $old['base_url'] ) ),
			'api_base_url'          => esc_url_raw( (string) ( $data['api_base_url'] ?? $old['api_base_url'] ) ),
			'pay_api_base'          => esc_url_raw( (string) ( $data['pay_api_base'] ?? $old['pay_api_base'] ) ),
			'client_id'             => sanitize_text_field( (string) ( $data['client_id'] ?? $old['client_id'] ) ),
			'client_secret'         => sanitize_text_field( (string) ( $data['client_secret'] ?? $old['client_secret'] ) ),
			'access_token'          => sanitize_text_field( (string) ( $data['access_token'] ?? $old['access_token'] ) ),
			'refresh_token'         => sanitize_text_field( (string) ( $data['refresh_token'] ?? $old['refresh_token'] ) ),
			'token_expires_at'      => (int) ( $data['token_expires_at'] ?? $old['token_expires_at'] ),
			'webhook_secret'        => sanitize_text_field( (string) ( $data['webhook_secret'] ?? $old['webhook_secret'] ) ),
			'gateway_secret'        => sanitize_text_field( (string) ( $data['gateway_secret'] ?? $old['gateway_secret'] ) ),
			'gateway_sandbox'       => ! empty( $data['gateway_sandbox'] ),
			'gateway_sandbox_token' => sanitize_text_field( (string) ( $data['gateway_sandbox_token'] ?? $old['gateway_sandbox_token'] ) ),
			'gateway_enabled'       => ! empty( $data['gateway_enabled'] ),
			'wallet_sync_enabled'   => ! empty( $data['wallet_sync_enabled'] ),
			'subscriptions_enabled' => ! empty( $data['subscriptions_enabled'] ),
		);
		update_option( self::OPTION_KEY, $new, false );
		return $new;
	}
}
