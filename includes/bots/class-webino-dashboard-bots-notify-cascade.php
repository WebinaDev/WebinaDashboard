<?php
/**
 * Customer notify cascade: bot → Safir Bale → SMS.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Delivers order messages with fallback channels.
 */
final class Webino_Dashboard_Bots_Notify_Cascade {

	const OPTION = 'webino_dashboard_bots_notify_cascade';

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'on_status' ), 35, 4 );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function settings() {
		$defaults = array(
			'enabled'    => '1',
			'use_safir'  => '1',
			'use_sms'    => '1',
			'safir_hook' => 'webino_safir_send',
			'sms_hook'   => 'webino_sms_send',
		);
		$raw = get_option( self::OPTION, array() );
		return is_array( $raw ) ? array_merge( $defaults, $raw ) : $defaults;
	}

	/**
	 * @param int      $order_id Order ID.
	 * @param string   $from From.
	 * @param string   $to To.
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function on_status( $order_id, $from, $to, $order ) {
		unset( $from );
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] ) {
			return;
		}
		if ( ! $order instanceof WC_Order ) {
			return;
		}
		// Skip bot channels when structured shop notify already covers this status.
		$skip_bale = class_exists( 'Webino_Dashboard_Bots_Order_Notify', false )
			&& Webino_Dashboard_Bots_Order_Notify::handled_status( 'bale', (int) $order_id, (string) $to );
		$skip_tg   = class_exists( 'Webino_Dashboard_Bots_Order_Notify', false )
			&& Webino_Dashboard_Bots_Order_Notify::handled_status( 'telegram', (int) $order_id, (string) $to );
		$vars = class_exists( 'Webino_Dashboard_Bots_Templates', false )
			? Webino_Dashboard_Bots_Templates::order_vars( $order )
			: array();
		$tpl  = sprintf(
			__( 'سفارش #%1$s: وضعیت %2$s — مبلغ %3$s', 'webino-dashboard' ),
			$vars['order_number'] ?? $order->get_order_number(),
			$vars['order_status'] ?? wc_get_order_status_name( $to ),
			$vars['total'] ?? wp_strip_all_tags( $order->get_formatted_order_total() )
		);
		self::deliver_to_customer( $order, $tpl, $skip_bale, $skip_tg );
	}

	/**
	 * @param WC_Order $order Order.
	 * @param string   $text  Message.
	 * @param bool     $skip_bale Skip Bale bot send.
	 * @param bool     $skip_tg Skip Telegram bot send.
	 * @return bool
	 */
	public static function deliver_to_customer( $order, $text, $skip_bale = false, $skip_tg = false ) {
		$uid  = (int) $order->get_user_id();
		$s    = self::settings();
		$sent = false;
		if ( $uid > 0 ) {
			$bale = (string) get_user_meta( $uid, 'woobale_chat_id', true );
			$tg   = (string) get_user_meta( $uid, 'webino_dashboard_telegram_chat_id', true );
			if ( ! $skip_bale && $bale !== '' ) {
				$sent = self::send_provider( 'bale', $bale, $text ) || $sent;
			}
			if ( ! $skip_tg && $tg !== '' ) {
				$sent = self::send_provider( 'telegram', $tg, $text ) || $sent;
			}
		}
		if ( $sent ) {
			return true;
		}
		$phone = (string) $order->get_billing_phone();
		if ( $phone === '' && $uid > 0 ) {
			$phone = (string) get_user_meta( $uid, 'billing_phone', true );
		}
		if ( ! empty( $s['use_safir'] ) && '0' !== (string) $s['use_safir'] && $phone !== '' ) {
			$ok = (bool) apply_filters( 'webino_dashboard_bots_safir_send', false, $phone, $text, $order );
			do_action( (string) $s['safir_hook'], $phone, $text, $order );
			if ( $ok ) {
				return true;
			}
		}
		if ( ! empty( $s['use_sms'] ) && '0' !== (string) $s['use_sms'] && $phone !== '' ) {
			$ok = (bool) apply_filters( 'webino_dashboard_bots_sms_send', false, $phone, $text, $order );
			do_action( (string) $s['sms_hook'], $phone, $text, $order );
			return $ok;
		}
		return false;
	}

	/**
	 * @param string $provider Provider.
	 * @param string $chat Chat.
	 * @param string $text Text.
	 * @return bool
	 */
	private static function send_provider( $provider, $chat, $text ) {
		$client = Webino_Dashboard_Bots_Client_Facade::make( $provider );
		if ( ! $client ) {
			if ( class_exists( 'Webino_Dashboard_Bots_Outbound_Queue', false ) ) {
				Webino_Dashboard_Bots_Outbound_Queue::enqueue_message( $provider, $chat, array( 'text' => $text ) );
			}
			return false;
		}
		$res = $client->send_message( array( 'chat_id' => $chat, 'text' => $text ) );
		$ok  = is_array( $res ) && ! empty( $res['ok'] );
		if ( ! $ok && class_exists( 'Webino_Dashboard_Bots_Outbound_Queue', false ) ) {
			Webino_Dashboard_Bots_Outbound_Queue::enqueue_message( $provider, $chat, array( 'text' => $text ) );
		}
		return $ok;
	}
}
