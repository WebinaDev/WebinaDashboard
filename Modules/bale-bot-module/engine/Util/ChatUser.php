<?php

namespace Webino_Dashboard_Bots_Bale\Util;

/**
 * Map Bale chat_id ↔ WordPress user.
 */
class ChatUser {

	public static function get_wp_user_id_by_chat( string $chat_id ): int {
		$users = get_users(
			array(
				'meta_key'   => 'woobale_chat_id',
				'meta_value' => $chat_id,
				'number'     => 1,
				'fields'     => 'ID',
			)
		);
		return ! empty( $users ) ? (int) $users[0] : 0;
	}

	public static function link_chat_to_user( string $chat_id, int $user_id ): void {
		global $wpdb;
		$wpdb->delete(
			$wpdb->usermeta,
			array(
				'meta_key'   => 'woobale_chat_id',
				'meta_value' => $chat_id,
			)
		);
		update_user_meta( $user_id, 'woobale_chat_id', $chat_id );
	}
}
