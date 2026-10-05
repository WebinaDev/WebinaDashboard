<?php

namespace Webino_Dashboard_Bots_Telegram\Woo;

use Webino_Dashboard_Bots_Telegram\Bale\Client;
use Webino_Dashboard_Bots_Telegram\Core\Plugin;

/**
 * Remind Telegram users with non-empty carts after configurable multi-stage delays.
 */
class AbandonedCartService {

	public const PROVIDER      = 'telegram';
	public const META_TOUCHED  = '_woobale_cart_touched_at_telegram';
	/** @deprecated Timestamp meta; kept for backward compat → stage 1. */
	public const META_REMINDED = '_woobale_abandon_reminded_at_telegram';
	public const META_STAGE    = '_woobale_abandon_stage_telegram';
	public const CRON_HOOK     = 'webino_dashboard_tg_abandoned_cart_cron';

	public static function init(): void {
		add_action( self::CRON_HOOK, array( __CLASS__, 'run_cron' ) );
		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( time() + 320, 'hourly', self::CRON_HOOK );
		}
		add_action(
			'woocommerce_checkout_order_processed',
			static function ( $order_id ) {
				$order = wc_get_order( $order_id );
				if ( ! $order ) {
					return;
				}
				$uid = (int) $order->get_user_id();
				if ( $uid < 1 ) {
					return;
				}
				self::clear_stage_meta( $uid );
			},
			21,
			1
		);
	}

	public static function touch_user_cart( int $user_id ): void {
		if ( $user_id < 1 ) {
			return;
		}
		$chat = get_user_meta( $user_id, 'webino_dashboard_telegram_chat_id', true );
		if ( ! $chat ) {
			return;
		}
		update_user_meta( $user_id, self::META_TOUCHED, time() );
	}

	public static function clear_abandon_flags_if_empty_cart( int $user_id ): void {
		$cart     = new UserCartContext();
		$contents = $cart->get_cart_contents( $user_id );
		if ( empty( $contents ) ) {
			self::clear_stage_meta( $user_id );
		}
	}

	private static function clear_stage_meta( int $user_id ): void {
		delete_user_meta( $user_id, self::META_TOUCHED );
		delete_user_meta( $user_id, self::META_REMINDED );
		delete_user_meta( $user_id, self::META_STAGE );
	}

	/**
	 * Current abandon stage 0–3. Old META_REMINDED timestamp ⇒ stage 1.
	 */
	private static function get_stage( int $user_id ): int {
		$raw = get_user_meta( $user_id, self::META_STAGE, true );
		if ( $raw !== '' && $raw !== false && $raw !== null ) {
			return max( 0, min( 3, (int) $raw ) );
		}
		$legacy = (int) get_user_meta( $user_id, self::META_REMINDED, true );
		if ( $legacy > 0 ) {
			return 1;
		}
		return 0;
	}

	/**
	 * @return list<array{delay_hours:int,message:string,coupon_amount:float}>
	 */
	private static function stages_config( array $s ): array {
		$msg1 = isset( $s['abandon_cart_message'] ) ? (string) $s['abandon_cart_message'] : '';
		if ( trim( $msg1 ) === '' ) {
			$msg1 = __( 'سبد خرید شما هنوز منتظر است. برای ادامهٔ تسویه روی دکمه زیر بزنید.', 'webino-dashboard' );
		}
		$msg2 = isset( $s['abandon_cart_message_2'] ) ? (string) $s['abandon_cart_message_2'] : '';
		if ( trim( $msg2 ) === '' ) {
			$msg2 = __( 'هنوز سبدتان را رها کرده‌اید! با یک کد تخفیف برگردید.', 'webino-dashboard' );
		}
		$msg3 = isset( $s['abandon_cart_message_3'] ) ? (string) $s['abandon_cart_message_3'] : '';
		if ( trim( $msg3 ) === '' ) {
			$msg3 = __( 'آخرین فرصت: سبد خریدتان در انتظار است.', 'webino-dashboard' );
		}

		return array(
			array(
				'delay_hours'   => isset( $s['abandon_cart_delay_hours'] ) ? max( 1, (int) $s['abandon_cart_delay_hours'] ) : 24,
				'message'       => $msg1,
				'coupon_amount' => 0.0,
			),
			array(
				'delay_hours'   => isset( $s['abandon_cart_delay_hours_2'] ) ? max( 1, (int) $s['abandon_cart_delay_hours_2'] ) : 48,
				'message'       => $msg2,
				'coupon_amount' => isset( $s['abandon_cart_coupon_2'] ) ? max( 0, (float) $s['abandon_cart_coupon_2'] ) : 0.0,
			),
			array(
				'delay_hours'   => isset( $s['abandon_cart_delay_hours_3'] ) ? max( 1, (int) $s['abandon_cart_delay_hours_3'] ) : 72,
				'message'       => $msg3,
				'coupon_amount' => isset( $s['abandon_cart_coupon_3'] ) ? max( 0, (float) $s['abandon_cart_coupon_3'] ) : 0.0,
			),
		);
	}

	/**
	 * Create a unique fixed-cart coupon; returns code or empty string.
	 */
	private static function create_unique_coupon( float $amount ): string {
		if ( $amount <= 0 || ! class_exists( 'WC_Coupon', false ) ) {
			return '';
		}
		$code = 'ABND-' . strtoupper( wp_generate_password( 8, false, false ) );
		$c    = new \WC_Coupon();
		$c->set_code( $code );
		$c->set_discount_type( 'fixed_cart' );
		$c->set_amount( (string) $amount );
		$c->set_individual_use( true );
		$c->set_usage_limit( 1 );
		$c->set_date_expires( strtotime( '+7 days', current_time( 'timestamp' ) ) );
		$c->save();
		return $code !== '' ? $code : '';
	}

	public static function run_cron(): void {
		$s = Plugin::get_settings();
		if ( empty( $s['abandon_cart_enabled'] ) || (string) $s['abandon_cart_enabled'] === '0' ) {
			return;
		}
		$stages = self::stages_config( $s );
		$now    = time();

		$user_ids = get_users(
			array(
				'fields'     => 'ID',
				'number'     => 80,
				'meta_query' => array(
					'relation' => 'AND',
					array(
						'key'     => 'webino_dashboard_telegram_chat_id',
						'compare' => '!=',
						'value'   => '',
					),
					array(
						'key'     => self::META_TOUCHED,
						'compare' => 'EXISTS',
					),
				),
			)
		);
		if ( ! is_array( $user_ids ) ) {
			return;
		}

		$cart   = new UserCartContext();
		$client = new Client();

		foreach ( $user_ids as $uid ) {
			$uid = (int) $uid;
			if ( $uid < 1 ) {
				continue;
			}
			$touched = (int) get_user_meta( $uid, self::META_TOUCHED, true );
			if ( $touched < 1 ) {
				continue;
			}
			$age   = $now - $touched;
			$stage = self::get_stage( $uid );

			$contents = $cart->get_cart_contents( $uid );
			if ( empty( $contents ) ) {
				self::clear_stage_meta( $uid );
				continue;
			}

			$chat = get_user_meta( $uid, 'webino_dashboard_telegram_chat_id', true );
			if ( ! $chat ) {
				continue;
			}

			for ( $i = 0; $i < 3; $i++ ) {
				$target = $i + 1;
				if ( $stage >= $target ) {
					continue;
				}
				$delay_s = (int) $stages[ $i ]['delay_hours'] * HOUR_IN_SECONDS;
				if ( $age < $delay_s ) {
					break;
				}

				$text = (string) $stages[ $i ]['message'];
				$amt  = (float) $stages[ $i ]['coupon_amount'];
				if ( $amt > 0 ) {
					$code = self::create_unique_coupon( $amt );
					if ( $code !== '' ) {
						$text .= "\n\n" . sprintf(
							/* translators: %s: coupon code */
							__( 'کد تخفیف شما: %s', 'webino-dashboard' ),
							$code
						);
					}
				}

				$kbd = wp_json_encode(
					array(
						'inline_keyboard' => array(
							array(
								array(
									'text'          => __( '💳 ادامهٔ تسویه حساب', 'webino-dashboard' ),
									'callback_data' => 'ch',
								),
							),
						),
					)
				);
				$payload = array(
					'chat_id'      => (string) $chat,
					'text'         => $text,
					'reply_markup' => $kbd,
				);
				$res = $client->send_message( $payload );
				if ( ! is_array( $res ) || empty( $res['ok'] ) ) {
					if ( class_exists( 'Webino_Dashboard_Bots_Outbound_Queue', false ) ) {
						\Webino_Dashboard_Bots_Outbound_Queue::enqueue_message( self::PROVIDER, (string) $chat, $payload );
					}
				}
				update_user_meta( $uid, self::META_STAGE, $target );
				update_user_meta( $uid, self::META_REMINDED, $now );
				break;
			}
		}
	}
}
