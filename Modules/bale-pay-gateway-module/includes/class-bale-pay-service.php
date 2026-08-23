<?php
/**
 * Resolve Bale chat and send a one-shot invoice.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Storefront Bale Pay helpers.
 */
final class Webino_Bale_Pay_Service {

	const META_SENT = '_webino_bale_invoice_sent';

	/**
	 * @param mixed $order Order.
	 * @return string Chat id or empty.
	 */
	public static function resolve_chat_id( $order ) {
		if ( ! $order || ! is_object( $order ) ) {
			return '';
		}
		$uid = (int) $order->get_user_id();
		if ( $uid > 0 ) {
			$chat = trim( (string) get_user_meta( $uid, 'woobale_chat_id', true ) );
			if ( '' !== $chat ) {
				return $chat;
			}
		}
		$phone = self::normalize_phone( (string) $order->get_billing_phone() );
		if ( '' === $phone ) {
			return '';
		}
		$users = get_users(
			array(
				'meta_key'     => 'woobale_chat_id',
				'meta_compare' => 'EXISTS',
				'number'       => 80,
				'fields'       => array( 'ID' ),
			)
		);
		foreach ( $users as $u ) {
			$id = is_object( $u ) ? (int) $u->ID : (int) $u;
			if ( $id < 1 ) {
				continue;
			}
			$chat = trim( (string) get_user_meta( $id, 'woobale_chat_id', true ) );
			if ( '' === $chat ) {
				continue;
			}
			$cands = array(
				(string) get_user_meta( $id, 'billing_phone', true ),
				(string) get_user_meta( $id, 'woobale_phone', true ),
			);
			$user = get_userdata( $id );
			if ( $user && ! empty( $user->user_login ) && preg_match( '/^\d+$/', (string) $user->user_login ) ) {
				$cands[] = (string) $user->user_login;
			}
			foreach ( $cands as $cand ) {
				if ( self::normalize_phone( $cand ) === $phone ) {
					return $chat;
				}
			}
		}
		return '';
	}

	/**
	 * @param string $phone Raw phone.
	 * @return string
	 */
	public static function normalize_phone( $phone ) {
		$d = preg_replace( '/\D+/', '', (string) $phone );
		if ( ! is_string( $d ) || '' === $d ) {
			return '';
		}
		if ( 0 === strpos( $d, '0098' ) ) {
			$d = substr( $d, 4 );
		} elseif ( 0 === strpos( $d, '98' ) && strlen( $d ) > 10 ) {
			$d = substr( $d, 2 );
		}
		if ( 10 === strlen( $d ) && '9' === $d[0] ) {
			$d = '0' . $d;
		}
		return $d;
	}

	/**
	 * @param mixed $order Order.
	 * @return array{ok:bool,sent:bool,error?:string}
	 */
	public static function send_invoice_for_order( $order ) {
		if ( ! $order || ! is_object( $order ) ) {
			return array( 'ok' => false, 'sent' => false, 'error' => 'no_order' );
		}
		if ( '1' === (string) $order->get_meta( self::META_SENT ) ) {
			return array( 'ok' => true, 'sent' => true );
		}
		if ( ! class_exists( '\Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger', false ) ) {
			return array( 'ok' => false, 'sent' => false, 'error' => 'no_bot' );
		}
		$chat = self::resolve_chat_id( $order );
		if ( '' === $chat ) {
			return array( 'ok' => false, 'sent' => false, 'error' => 'no_chat' );
		}
		$res = \Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger::send_invoice( (int) $order->get_id(), (int) $chat );
		if ( ! empty( $res['ok'] ) ) {
			$order->update_meta_data( self::META_SENT, '1' );
			$order->save();
			return array( 'ok' => true, 'sent' => true );
		}
		return array( 'ok' => false, 'sent' => false, 'error' => isset( $res['error'] ) ? (string) $res['error'] : 'send_failed' );
	}

	/**
	 * @return string Bot username without @.
	 */
	public static function bot_username() {
		$cached = get_transient( 'webino_bale_pay_bot_username' );
		if ( is_string( $cached ) && '' !== $cached ) {
			return $cached;
		}
		if ( ! class_exists( '\Webino_Dashboard_Bots_Bale\Bale\Client', false ) ) {
			return '';
		}
		if ( class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			Webino_Dashboard_Bots_Loader::register_autoloaders();
		}
		$client = new \Webino_Dashboard_Bots_Bale\Bale\Client();
		$me     = $client->get_me();
		$user   = '';
		if ( is_array( $me ) && ! empty( $me['ok'] ) && isset( $me['result']['username'] ) ) {
			$user = ltrim( (string) $me['result']['username'], '@' );
		}
		if ( '' !== $user ) {
			set_transient( 'webino_bale_pay_bot_username', $user, 12 * HOUR_IN_SECONDS );
		}
		return $user;
	}

	/**
	 * @param int $order_id Order ID.
	 * @return string
	 */
	public static function start_url( $order_id ) {
		$user = self::bot_username();
		if ( '' === $user ) {
			return '';
		}
		return 'https://ble.ir/' . rawurlencode( $user ) . '?start=pay_' . (int) $order_id;
	}

	/**
	 * Handle /start pay_{order_id}.
	 *
	 * @param string $chat_id Chat.
	 * @param string $payload Start payload.
	 * @return bool True if this was a pay deep-link (invoice attempted).
	 */
	public static function handle_start_payload( $chat_id, $payload ) {
		$payload = trim( (string) $payload );
		if ( ! preg_match( '/^pay_(\d+)$/', $payload, $m ) ) {
			return false;
		}
		$order_id = (int) $m[1];
		$order    = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : false;
		if ( ! $order ) {
			return true;
		}
		$uid = (int) $order->get_user_id();
		if ( $uid > 0 && class_exists( '\Webino_Dashboard_Bots_Bale\Util\ChatUser', false ) ) {
			\Webino_Dashboard_Bots_Bale\Util\ChatUser::link_chat_to_user( (string) $chat_id, $uid );
		}
		if ( ! $order->needs_payment() ) {
			return true;
		}
		if ( class_exists( '\Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger', false ) ) {
			$res = \Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger::send_invoice( $order_id, (int) $chat_id );
			if ( ! empty( $res['ok'] ) ) {
				$order->update_meta_data( self::META_SENT, '1' );
				$order->save();
			}
		}
		return true;
	}

	/**
	 * Status for dashboard.
	 *
	 * @return array<string,mixed>
	 */
	public static function status() {
		$bot_on = class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& Webino_Dashboard_Module_Registry::is_active( 'bale-bot-module' );
		$token  = '';
		if ( class_exists( '\Webino_Dashboard_Bots_Bale\Core\Plugin', false ) ) {
			$token = \Webino_Dashboard_Bots_Bale\Core\Plugin::get_provider_token();
		}
		return array(
			'bot_active'         => $bot_on,
			'has_provider_token' => '' !== trim( (string) $token ),
			'bot_username'       => self::bot_username(),
		);
	}
}
