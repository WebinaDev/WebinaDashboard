<?php

namespace Webino_Dashboard_Bots_Telegram\Bot;

use Webino_Dashboard_Bots_Telegram\Core\Plugin;

/**
 * Bot-side admin allowlist (chat_id from woobale_settings[bot_admin_chat_ids]).
 */
class AdminGate {

	/**
	 * @return list<string>
	 */
	public static function get_admin_chat_ids(): array {
		$s   = Plugin::get_settings();
		$raw = isset( $s['bot_admin_chat_ids'] ) ? trim( (string) $s['bot_admin_chat_ids'] ) : '';
		if ( $raw === '' ) {
			return array();
		}
		$parts = preg_split( '/[\s,،]+/u', $raw, -1, PREG_SPLIT_NO_EMPTY );
		if ( ! is_array( $parts ) ) {
			return array();
		}
		$out = array();
		foreach ( $parts as $p ) {
			$p = trim( (string) $p );
			if ( $p !== '' ) {
				$out[] = $p;
			}
		}
		return array_values( array_unique( $out ) );
	}

	public static function is_admin_chat( string $chat_id ): bool {
		$chat_id = trim( $chat_id );
		if ( $chat_id === '' ) {
			return false;
		}
		return in_array( $chat_id, self::get_admin_chat_ids(), true );
	}
}
