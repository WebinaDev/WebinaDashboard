<?php
/**
 * Card-to-card WooCommerce payment gateway + bot approve/reject.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers WC gateway and bot moderation callbacks.
 */
final class Webino_Dashboard_Bots_C2C_Gateway {

	const GATEWAY_ID = 'webino_bots_c2c';
	const OPTION     = 'webino_dashboard_bots_c2c';

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		add_filter( 'woocommerce_payment_gateways', array( __CLASS__, 'register_gateway' ) );
		add_action( 'woocommerce_order_status_on-hold', array( __CLASS__, 'notify_admins_receipt_pending' ), 20, 1 );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function settings() {
		$defaults = array(
			'enabled'      => '0',
			'title'        => __( 'کارت به کارت', 'webino-dashboard' ),
			'instructions' => __( 'مبلغ را به یکی از کارت‌های زیر واریز و رسید را آپلود کنید.', 'webino-dashboard' ),
			'cards'        => array(),
			'iban'         => '',
			'deadline_h'   => 2,
		);
		$raw = get_option( self::OPTION, array() );
		return is_array( $raw ) ? array_merge( $defaults, $raw ) : $defaults;
	}

	/**
	 * @param array<string,mixed> $input Input.
	 * @return array<string,mixed>
	 */
	public static function save_settings( $input ) {
		$cur = self::settings();
		if ( ! is_array( $input ) ) {
			return $cur;
		}
		if ( isset( $input['enabled'] ) ) {
			$cur['enabled'] = ! empty( $input['enabled'] ) && '0' !== (string) $input['enabled'] ? '1' : '0';
		}
		foreach ( array( 'title', 'instructions', 'iban' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = sanitize_textarea_field( (string) $input[ $f ] );
			}
		}
		if ( isset( $input['deadline_h'] ) ) {
			$cur['deadline_h'] = max( 1, min( 72, (int) $input['deadline_h'] ) );
		}
		if ( isset( $input['cards'] ) && is_array( $input['cards'] ) ) {
			$cards = array();
			foreach ( $input['cards'] as $card ) {
				if ( is_string( $card ) && trim( $card ) !== '' ) {
					$cards[] = sanitize_text_field( $card );
				} elseif ( is_array( $card ) && ! empty( $card['number'] ) ) {
					$cards[] = array(
						'number' => sanitize_text_field( (string) $card['number'] ),
						'name'   => isset( $card['name'] ) ? sanitize_text_field( (string) $card['name'] ) : '',
						'bank'   => isset( $card['bank'] ) ? sanitize_text_field( (string) $card['bank'] ) : '',
					);
				}
			}
			$cur['cards'] = $cards;
		}
		update_option( self::OPTION, $cur, false );
		return $cur;
	}

	/**
	 * @param list<string> $gateways Gateways.
	 * @return list<string>
	 */
	public static function register_gateway( $gateways ) {
		if ( class_exists( 'WC_Gateway_C2C', false ) ) {
			return $gateways;
		}
		if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
			return $gateways;
		}
		require_once dirname( __FILE__ ) . '/class-webino-dashboard-bots-wc-gateway-c2c.php';
		$gateways[] = 'Webino_Dashboard_Bots_WC_Gateway_C2C';
		return $gateways;
	}

	/**
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public static function notify_admins_receipt_pending( $order_id ) {
		if ( class_exists( 'Webino_C2C_Receipts', false ) ) {
			return;
		}
		$order = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : false;
		if ( ! $order || self::GATEWAY_ID !== $order->get_payment_method() ) {
			return;
		}
		if ( ! class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false ) ) {
			return;
		}
		$text = sprintf( __( 'رسید کارت‌به‌کارت برای سفارش #%s در انتظار تأیید است.', 'webino-dashboard' ), $order->get_order_number() );
		$kbd  = array(
			'inline_keyboard' => array(
				array(
					array( 'text' => __( 'تأیید پرداخت', 'webino-dashboard' ), 'callback_data' => 'c2c:' . $order->get_id() . ':approve' ),
					array( 'text' => __( 'رد', 'webino-dashboard' ), 'callback_data' => 'c2c:' . $order->get_id() . ':reject' ),
				),
			),
		);
		Webino_Dashboard_Bots_Admin_Ops::broadcast_admins( $text, $kbd );
	}

	/**
	 * @param string $data Callback.
	 * @param string $chat Chat.
	 * @param string $provider Provider.
	 * @return bool
	 */
	public static function handle_callback( $data, $chat, $provider, $from = array() ) {
		if ( class_exists( 'Webino_C2C_Receipts', false ) ) {
			return Webino_C2C_Receipts::handle_callback( $data, $chat, $provider, is_array( $from ) ? $from : array() );
		}
		if ( strpos( $data, 'c2c:' ) !== 0 ) {
			return false;
		}
		$parts = explode( ':', $data );
		$oid   = isset( $parts[1] ) ? (int) $parts[1] : 0;
		$act   = isset( $parts[2] ) ? sanitize_key( $parts[2] ) : '';
		$order = $oid > 0 && function_exists( 'wc_get_order' ) ? wc_get_order( $oid ) : false;
		if ( ! $order ) {
			return true;
		}
		$undo_key = 'webino_c2c_undo_' . $oid;
		if ( 'undo' === $act ) {
			$prev = get_transient( $undo_key );
			if ( is_array( $prev ) && ! empty( $prev['status'] ) ) {
				$order->update_status( (string) $prev['status'], __( 'لغو تصمیم کارت‌به‌کارت', 'webino-dashboard' ) );
				delete_transient( $undo_key );
			}
			self::reply( $provider, $chat, __( 'تصمیم لغو شد.', 'webino-dashboard' ) );
			return true;
		}
		set_transient(
			$undo_key,
			array( 'status' => $order->get_status() ),
			30
		);
		if ( 'approve' === $act ) {
			$order->payment_complete();
			$order->add_order_note( __( 'پرداخت کارت‌به‌کارت از ربات تأیید شد.', 'webino-dashboard' ) );
			$msg = __( 'پرداخت تأیید شد. تا ۳۰ ثانیه می‌توانید لغو کنید.', 'webino-dashboard' );
		} else {
			$order->update_status( 'failed', __( 'رسید کارت‌به‌کارت رد شد.', 'webino-dashboard' ) );
			$msg = __( 'پرداخت رد شد. تا ۳۰ ثانیه می‌توانید لغو کنید.', 'webino-dashboard' );
		}
		$client = Webino_Dashboard_Bots_Client_Facade::make( $provider );
		if ( $client ) {
			$client->send_message(
				array(
					'chat_id'      => $chat,
					'text'         => $msg,
					'reply_markup' => wp_json_encode(
						array(
							'inline_keyboard' => array(
								array(
									array( 'text' => __( 'Undo ۳۰ث', 'webino-dashboard' ), 'callback_data' => 'c2c:' . $oid . ':undo' ),
								),
							),
						)
					),
				)
			);
		}
		return true;
	}

	/**
	 * @param string $provider Provider.
	 * @param string $chat Chat.
	 * @param string $text Text.
	 * @return void
	 */
	private static function reply( $provider, $chat, $text ) {
		$client = Webino_Dashboard_Bots_Client_Facade::make( $provider );
		if ( $client ) {
			$client->send_message( array( 'chat_id' => $chat, 'text' => $text ) );
		}
	}
}
