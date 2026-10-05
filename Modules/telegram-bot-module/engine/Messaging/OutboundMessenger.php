<?php

namespace Webino_Dashboard_Bots_Telegram\Messaging;

use Webino_Dashboard_Bots_Telegram\Bale\Client;
use Webino_Dashboard_Bots_Telegram\Core\Plugin;
use Webino_Dashboard_Bots_Telegram\Logging\ActivityLog;
use Webino_Dashboard_Bots_Telegram\Woo\CheckoutService;
use Webino_Dashboard_Bots_Telegram\Woo\OrderInvoiceMeta;

/**
 * Send messages to Bale from admin / automations.
 */
class OutboundMessenger {

	public const TYPE_TEXT     = 'text';
	public const TYPE_PHOTO    = 'photo';
	public const TYPE_VIDEO    = 'video';
	public const TYPE_VOICE    = 'voice';
	public const TYPE_DOCUMENT = 'document';

	/**
	 * Send plain text to chat_id or resolve from WP user id.
	 *
	 * @return array{ok:bool, error?:string}
	 */
	public static function send_text_to_user( int $wp_user_id, string $text ): array {
		$chat = get_user_meta( $wp_user_id, 'webino_dashboard_telegram_chat_id', true );
		if ( ! $chat ) {
			return array( 'ok' => false, 'error' => __( 'کاربر به بله متصل نیست.', 'webino-dashboard' ) );
		}
		return self::send_text_to_chat( (string) $chat, $text );
	}

	/**
	 * @return array{ok:bool, error?:string}
	 */
	public static function send_text_to_chat( string $chat_id, string $text ): array {
		return self::send_payload_to_chat(
			$chat_id,
			array(
				'type' => self::TYPE_TEXT,
				'text' => $text,
			)
		);
	}

	/**
	 * @param array<string, mixed> $payload
	 * @return array{ok:bool, error?:string}
	 */
	public static function send_payload_to_chat( string $chat_id, array $payload, bool $from_retry_queue = false ): array {
		if ( Plugin::get_bot_token() === '' ) {
			return array( 'ok' => false, 'error' => __( 'توکن بازو تنظیم نشده است.', 'webino-dashboard' ) );
		}
		$client = new Client();
		$type   = isset( $payload['type'] ) ? sanitize_key( (string) $payload['type'] ) : self::TYPE_TEXT;
		$text   = isset( $payload['text'] ) ? wp_kses_post( (string) $payload['text'] ) : '';
		$caption = isset( $payload['caption'] ) ? wp_kses_post( (string) $payload['caption'] ) : '';
		$media  = isset( $payload['media'] ) ? trim( (string) $payload['media'] ) : '';

		$params = array(
			'chat_id'     => $chat_id,
			'parse_mode'  => 'HTML',
		);

		switch ( $type ) {
			case self::TYPE_PHOTO:
				if ( $media === '' ) {
					return array( 'ok' => false, 'error' => __( 'آدرس یا شناسه عکس وارد نشده است.', 'webino-dashboard' ) );
				}
				$params['photo'] = $media;
				if ( $caption !== '' ) {
					$params['caption'] = $caption;
				}
				$res = $client->send_photo( $params );
				break;
			case self::TYPE_VIDEO:
				if ( $media === '' ) {
					return array( 'ok' => false, 'error' => __( 'آدرس یا شناسه ویدیو وارد نشده است.', 'webino-dashboard' ) );
				}
				$params['video'] = $media;
				if ( $caption !== '' ) {
					$params['caption'] = $caption;
				}
				$res = $client->send_video( $params );
				break;
			case self::TYPE_VOICE:
				if ( $media === '' ) {
					return array( 'ok' => false, 'error' => __( 'آدرس یا شناسه ویس وارد نشده است.', 'webino-dashboard' ) );
				}
				$params['voice'] = $media;
				if ( $caption !== '' ) {
					$params['caption'] = $caption;
				}
				$res = $client->send_voice( $params );
				break;
			case self::TYPE_DOCUMENT:
				if ( $media === '' ) {
					return array( 'ok' => false, 'error' => __( 'آدرس یا شناسه فایل وارد نشده است.', 'webino-dashboard' ) );
				}
				$params['document'] = $media;
				if ( $caption !== '' ) {
					$params['caption'] = $caption;
				}
				$res = $client->send_document( $params );
				break;
			case self::TYPE_TEXT:
			default:
				if ( $text === '' ) {
					return array( 'ok' => false, 'error' => __( 'متن پیام خالی است.', 'webino-dashboard' ) );
				}
				$params['text'] = $text;
				if ( ! empty( $payload['reply_markup'] ) ) {
					$params['reply_markup'] = (string) $payload['reply_markup'];
				}
				$res = $client->send_message( $params );
				break;
		}
		if ( $res && ! empty( $res['ok'] ) ) {
			return array( 'ok' => true );
		}
		if ( ! $from_retry_queue ) {
			MessageRetryQueue::enqueue_payload( $chat_id, $payload );
			ActivityLog::add(
				'warning',
				'outbound',
				'send_payload_failed_queued',
				array(
					'type' => $type,
				)
			);
		}
		return array( 'ok' => false, 'error' => __( 'ارسال ناموفق بود.', 'webino-dashboard' ) );
	}

	/**
	 * @return array{ok:bool, error?:string}
	 */
	public static function send_order_summary( int $order_id ): array {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return array( 'ok' => false, 'error' => __( 'سفارش یافت نشد.', 'webino-dashboard' ) );
		}
		$uid = (int) $order->get_user_id();
		if ( ! $uid ) {
			return array( 'ok' => false, 'error' => __( 'سفارش مهمان است.', 'webino-dashboard' ) );
		}
		$lines = array();
		$lines[] = sprintf(
			/* translators: %s: order number */
			__( 'سفارش #%s', 'webino-dashboard' ),
			$order->get_order_number()
		);
		$lines[] = __( 'وضعیت: ', 'webino-dashboard' ) . wc_get_order_status_name( $order->get_status() );
		$lines[] = __( 'جمع: ', 'webino-dashboard' ) . wp_strip_all_tags( wc_price( $order->get_total() ) );
		foreach ( $order->get_items() as $item ) {
			$lines[] = '- ' . $item->get_name() . ' × ' . $item->get_quantity();
		}
		return self::send_text_to_user( $uid, implode( "\n", $lines ) );
	}

	/**
	 * @return array{ok:bool, error?:string}
	 */
	public static function send_payment_link( int $order_id ): array {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return array( 'ok' => false, 'error' => __( 'سفارش یافت نشد.', 'webino-dashboard' ) );
		}
		$uid = (int) $order->get_user_id();
		if ( ! $uid ) {
			return array( 'ok' => false, 'error' => __( 'سفارش مهمان است.', 'webino-dashboard' ) );
		}
		$url = $order->get_checkout_payment_url( true );
		$s   = Plugin::get_settings();
		$tpl = isset( $s['manual_payment_link_template'] ) ? (string) $s['manual_payment_link_template'] : __( 'لینک پرداخت سفارش {order_number}: {payment_url}', 'webino-dashboard' );
		$text = TemplateRenderer::render( $tpl, $order );
		return self::send_text_to_user( $uid, $text );
	}

	/**
	 * @return array{ok:bool, error?:string}
	 */
	public static function send_invoice( int $order_id, int $chat_id_int, bool $from_retry_queue = false ): array {
		$order = wc_get_order( $order_id );
		if ( ! $order || ! $order->needs_payment() ) {
			return array( 'ok' => false, 'error' => __( 'سفارش قابل فاکتور نیست.', 'webino-dashboard' ) );
		}
		if ( Plugin::get_provider_token() === '' ) {
			return array( 'ok' => false, 'error' => __( 'Payment Provider Token تنظیم نشده است.', 'webino-dashboard' ) );
		}
		$checkout = new CheckoutService();
		$params   = $checkout->build_send_invoice_params( $chat_id_int, $order );
		$client   = new Client();
		$res      = $client->send_invoice( $params );
		if ( $res && ! empty( $res['ok'] ) ) {
			$order->update_meta_data( OrderInvoiceMeta::TARGET_CHAT_ID, (string) $chat_id_int );
			$order->save();
			return array( 'ok' => true );
		}
		if ( ! $from_retry_queue ) {
			MessageRetryQueue::enqueue_invoice( $order_id, $chat_id_int );
			ActivityLog::add( 'warning', 'outbound', 'send_invoice_failed_queued', array( 'order_id' => $order_id ) );
		}
		return array( 'ok' => false, 'error' => __( 'ارسال فاکتور ناموفق بود.', 'webino-dashboard' ) );
	}

	/**
	 * Render template from settings for current order status.
	 *
	 * @return array{ok:bool, error?:string}
	 */
	public static function send_status_template( int $order_id, string $status ): array {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return array( 'ok' => false, 'error' => __( 'سفارش یافت نشد.', 'webino-dashboard' ) );
		}
		$s         = Plugin::get_settings();
		$templates = isset( $s['order_status_templates'] ) && is_array( $s['order_status_templates'] ) ? $s['order_status_templates'] : array();
		$tpl       = isset( $templates[ $status ] ) ? (string) $templates[ $status ] : '';
		if ( $tpl === '' ) {
			return array( 'ok' => false, 'error' => __( 'قالبی برای این وضعیت تعریف نشده است.', 'webino-dashboard' ) );
		}
		$text = TemplateRenderer::render( $tpl, $order );
		$uid  = (int) $order->get_user_id();
		if ( ! $uid ) {
			return array( 'ok' => false, 'error' => __( 'سفارش مهمان است.', 'webino-dashboard' ) );
		}
		$chat = get_user_meta( $uid, 'webino_dashboard_telegram_chat_id', true );
		if ( ! $chat ) {
			return array( 'ok' => false, 'error' => __( 'کاربر به بله متصل نیست.', 'webino-dashboard' ) );
		}
		$payload = array(
			'type' => self::TYPE_TEXT,
			'text' => $text,
		);
		$btn_on = ! empty( $s['order_question_button_enabled'] ) && (string) $s['order_question_button_enabled'] !== '0';
		if ( $btn_on ) {
			$btn_text = isset( $s['order_question_button_text'] ) && (string) $s['order_question_button_text'] !== ''
				? (string) $s['order_question_button_text']
				: __( 'سوال دربارهٔ این سفارش', 'webino-dashboard' );
			$payload['reply_markup'] = wp_json_encode(
				array(
					'inline_keyboard' => array(
						array(
							array(
								'text'          => $btn_text,
								'callback_data' => 'oq:' . (int) $order->get_id(),
							),
						),
					),
				)
			);
		}
		return self::send_payload_to_chat( (string) $chat, $payload );
	}
}
