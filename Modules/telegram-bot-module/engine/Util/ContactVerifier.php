<?php

namespace Webino_Dashboard_Bots_Telegram\Util;

/**
 * Ensures a shared contact belongs to the message sender (Telegram/Bale bots).
 */
class ContactVerifier {

	/**
	 * @param array<string, mixed> $contact
	 * @param array<string, mixed> $from
	 */
	public static function is_own_contact( array $contact, array $from ): bool {
		$from_id = isset( $from['id'] ) ? (string) $from['id'] : '';
		if ( $from_id === '' || ! isset( $contact['user_id'] ) ) {
			return false;
		}
		return hash_equals( (string) $contact['user_id'], $from_id );
	}
}
