<?php

namespace Webino_Dashboard_Bots_Telegram\Bot;

use Webino_Dashboard_Bots_Telegram\Bale\Client;
use Webino_Dashboard_Bots_Telegram\Util\OrderPayload;
use Webino_Dashboard_Bots_Telegram\Woo\CheckoutService;
use Webino_Dashboard_Bots_Telegram\Woo\OrderInvoiceMeta;
use Webino_Dashboard_Bots_Telegram\Woo\UserCartContext;

/**
 * pre_checkout_query and successful_payment from Bale.
 */
class PaymentHandler {

	/**
	 * @param array<string, mixed> $query
	 */
	public static function handle_pre_checkout( array $query ): void {
		$id       = isset( $query['id'] ) ? (string) $query['id'] : '';
		$payload  = isset( $query['invoice_payload'] ) ? (string) $query['invoice_payload'] : '';
		$order_id = OrderPayload::verify( $payload );
		$client   = new Client();

		if ( ! $order_id ) {
			$client->answer_pre_checkout_query(
				array(
					'pre_checkout_query_id' => $id,
					'ok'                      => false,
					'error_message'           => __( 'سفارش نامعتبر است.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$order = wc_get_order( $order_id );
		if ( ! $order || ! $order->needs_payment() ) {
			$client->answer_pre_checkout_query(
				array(
					'pre_checkout_query_id' => $id,
					'ok'                      => false,
					'error_message'           => __( 'سفارش قابل پرداخت نیست.', 'webino-dashboard' ),
				)
			);
			return;
		}

		if ( ! isset( $query['total_amount'] ) ) {
			$client->answer_pre_checkout_query(
				array(
					'pre_checkout_query_id' => $id,
					'ok'                      => false,
					'error_message'           => __( 'مبلغ فاکتور ارسال نشده است.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$expected = ( new CheckoutService() )->get_invoice_amount( $order );
		if ( (int) $query['total_amount'] !== $expected ) {
			$client->answer_pre_checkout_query(
				array(
					'pre_checkout_query_id' => $id,
					'ok'                      => false,
					'error_message'           => __( 'مبلغ با سفارش هم‌خوان نیست.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$client->answer_pre_checkout_query(
			array(
				'pre_checkout_query_id' => $id,
				'ok'                      => true,
			)
		);
	}

	/**
	 * @param array<string, mixed> $message
	 */
	public static function handle_successful_payment( array $message ): void {
		$pay = isset( $message['successful_payment'] ) ? $message['successful_payment'] : array();
		if ( empty( $pay['invoice_payload'] ) ) {
			return;
		}
		$order_id = OrderPayload::verify( (string) $pay['invoice_payload'] );
		if ( ! $order_id ) {
			return;
		}

		$order = wc_get_order( $order_id );
		if ( ! $order || ! $order->needs_payment() ) {
			return;
		}

		if ( ! isset( $pay['total_amount'] ) ) {
			return;
		}
		$expected_amt = ( new CheckoutService() )->get_invoice_amount( $order );
		if ( (int) $pay['total_amount'] !== $expected_amt ) {
			return;
		}

		$from_id = isset( $message['from']['id'] ) ? (string) $message['from']['id'] : '';
		$user_id = (int) $order->get_user_id();

		$bound_chat = (string) $order->get_meta( OrderInvoiceMeta::TARGET_CHAT_ID );
		if ( $bound_chat !== '' ) {
			if ( $from_id === '' || ! hash_equals( $bound_chat, $from_id ) ) {
				return;
			}
		} elseif ( $user_id > 0 && $from_id !== '' ) {
			$expected_chat = (string) get_user_meta( $user_id, 'webino_dashboard_telegram_chat_id', true );
			if ( $expected_chat !== '' && ! hash_equals( $expected_chat, $from_id ) ) {
				return;
			}
		}

		$txn = isset( $pay['telegram_payment_charge_id'] ) ? (string) $pay['telegram_payment_charge_id'] : '';
		if ( $txn === '' && isset( $pay['provider_payment_charge_id'] ) ) {
			$txn = (string) $pay['provider_payment_charge_id'];
		}

		$order->payment_complete( $txn );
		$order->update_meta_data( '_woobale_payment_method', 'wallet' );
		$order->update_meta_data( '_woobale_provider', 'telegram' );
		if ( method_exists( $order, 'set_payment_method' ) ) {
			$order->set_payment_method( 'bale_wallet' );
		}
		if ( method_exists( $order, 'set_payment_method_title' ) ) {
			$order->set_payment_method_title( __( 'کیف پول تلگرام', 'webino-dashboard' ) );
		}
		$order->save();
		if ( $user_id > 0 ) {
			( new UserCartContext() )->empty_cart( $user_id );
		}
		$order->add_order_note( __( 'پرداخت از طریق کیف پول تلگرام تکمیل شد.', 'webino-dashboard' ) );
	}
}
