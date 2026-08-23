<?php
/**
 * Support tickets for Bale/Telegram shop bots.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Simple ticket store in usermeta + option index.
 */
final class Webino_Dashboard_Bots_Tickets {

	const OPTION = 'webino_dashboard_bots_tickets';
	const META   = '_webino_bot_open_ticket';

	/**
	 * @return void
	 */
	public static function init() {
	}

	/**
	 * @return list<array<string,mixed>>
	 */
	public static function all() {
		$raw = get_option( self::OPTION, array() );
		return is_array( $raw ) ? $raw : array();
	}

	/**
	 * @param list<array<string,mixed>> $items Items.
	 * @return void
	 */
	private static function save( array $items ) {
		if ( count( $items ) > 500 ) {
			$items = array_slice( $items, -500 );
		}
		update_option( self::OPTION, $items, false );
	}

	/**
	 * @param int    $user_id User.
	 * @param string $provider Provider.
	 * @param string $chat Chat.
	 * @param string $text Text.
	 * @return array<string,mixed>
	 */
	public static function open( $user_id, $provider, $chat, $text ) {
		$items   = self::all();
		$ticket  = array(
			'id'         => uniqid( 't', true ),
			'user_id'    => (int) $user_id,
			'provider'   => sanitize_key( $provider ),
			'chat_id'    => (string) $chat,
			'status'     => 'open',
			'created_at' => time(),
			'updated_at' => time(),
			'thread'     => array(
				array(
					'from' => 'user',
					'text' => sanitize_textarea_field( $text ),
					'at'   => time(),
				),
			),
		);
		$items[] = $ticket;
		self::save( $items );
		update_user_meta( (int) $user_id, self::META, $ticket['id'] );
		if ( class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false ) ) {
			Webino_Dashboard_Bots_Admin_Ops::broadcast_admins(
				sprintf( __( '🎫 تیکت جدید از کاربر #%1$d:\n%2$s', 'webino-dashboard' ), (int) $user_id, $text ),
				array(
					'inline_keyboard' => array(
						array(
							array( 'text' => __( 'پاسخ', 'webino-dashboard' ), 'callback_data' => 'tkr:' . $ticket['id'] ),
							array( 'text' => __( 'بستن', 'webino-dashboard' ), 'callback_data' => 'tkc:' . $ticket['id'] ),
						),
					),
				)
			);
		}
		return $ticket;
	}

	/**
	 * @param string $ticket_id ID.
	 * @return array<string,mixed>|null
	 */
	public static function get( $ticket_id ) {
		foreach ( self::all() as $t ) {
			if ( isset( $t['id'] ) && (string) $t['id'] === (string) $ticket_id ) {
				return $t;
			}
		}
		return null;
	}

	/**
	 * @param string $ticket_id ID.
	 * @param string $from user|admin.
	 * @param string $text Text.
	 * @return bool
	 */
	public static function append( $ticket_id, $from, $text ) {
		$items = self::all();
		foreach ( $items as &$t ) {
			if ( (string) $t['id'] !== (string) $ticket_id ) {
				continue;
			}
			$t['thread'][]  = array( 'from' => $from, 'text' => sanitize_textarea_field( $text ), 'at' => time() );
			$t['updated_at'] = time();
			if ( 'admin' === $from && 'open' === $t['status'] ) {
				$t['status'] = 'in-review';
			}
			self::save( $items );
			if ( 'admin' === $from && ! empty( $t['chat_id'] ) && ! empty( $t['provider'] ) ) {
				$client = Webino_Dashboard_Bots_Client_Facade::make( $t['provider'] );
				if ( $client ) {
					$client->send_message(
						array(
							'chat_id' => $t['chat_id'],
							'text'    => __( 'پاسخ پشتیبانی:', 'webino-dashboard' ) . "\n" . $text,
						)
					);
				}
			}
			return true;
		}
		return false;
	}

	/**
	 * @param string $ticket_id ID.
	 * @return bool
	 */
	public static function close( $ticket_id ) {
		$items = self::all();
		foreach ( $items as &$t ) {
			if ( (string) $t['id'] !== (string) $ticket_id ) {
				continue;
			}
			$t['status']     = 'closed';
			$t['updated_at'] = time();
			self::save( $items );
			if ( ! empty( $t['user_id'] ) ) {
				delete_user_meta( (int) $t['user_id'], self::META );
			}
			return true;
		}
		return false;
	}

	/**
	 * @param int $user_id User.
	 * @return string|null
	 */
	public static function open_id_for_user( $user_id ) {
		$id = get_user_meta( (int) $user_id, self::META, true );
		return is_string( $id ) && $id !== '' ? $id : null;
	}
}
