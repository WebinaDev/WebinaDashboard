<?php
/**
 * Thin facade documenting messenger API clients (Bale + Telegram).
 *
 * Telegram engine keeps namespace Webino_Dashboard_Bots_Telegram\Bale\Client
 * for historical reasons; this helper resolves the correct client by provider.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Factory for bot API clients.
 */
final class Webino_Dashboard_Bots_Client_Facade {

	/**
	 * @param string $provider bale|telegram.
	 * @return object|null Client instance with send_message / set_webhook / get_me.
	 */
	public static function make( $provider ) {
		$provider = sanitize_key( (string) $provider );
		if ( class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			Webino_Dashboard_Bots_Loader::register_autoloaders();
		}
		if ( 'telegram' === $provider ) {
			if ( ! class_exists( '\Webino_Dashboard_Bots_Telegram\Core\Plugin', false ) ) {
				return null;
			}
			$token = \Webino_Dashboard_Bots_Telegram\Core\Plugin::get_bot_token();
			if ( '' === trim( (string) $token ) ) {
				return null;
			}
			return new \Webino_Dashboard_Bots_Telegram\Bale\Client( $token );
		}
		if ( 'bale' === $provider ) {
			if ( ! class_exists( '\Webino_Dashboard_Bots_Bale\Core\Plugin', false ) ) {
				return null;
			}
			$token = \Webino_Dashboard_Bots_Bale\Core\Plugin::get_bot_token();
			if ( '' === trim( (string) $token ) ) {
				return null;
			}
			return new \Webino_Dashboard_Bots_Bale\Bale\Client( $token );
		}
		return null;
	}
}
