<?php
/**
 * Multi-channel publisher for Bale/Telegram (schedule, auto-post, edit/delete).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Channel content queue and hooks.
 */
final class Webino_Dashboard_Bots_Channel_Publisher {

	const OPTION  = 'webino_dashboard_bots_channel_publisher';
	const QUEUE   = 'webino_dashboard_bots_channel_queue';
	const CRON    = 'webino_dashboard_bots_channel_tick';

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		add_action( self::CRON, array( __CLASS__, 'process_queue' ) );
		if ( ! wp_next_scheduled( self::CRON ) ) {
			wp_schedule_event( time() + 120, 'hourly', self::CRON );
		}
		add_action( 'transition_post_status', array( __CLASS__, 'on_post_status' ), 20, 3 );
		add_action( 'woocommerce_update_product', array( __CLASS__, 'on_product_update' ), 40, 1 );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function settings() {
		$defaults = array(
			'enabled'           => '1',
			'auto_new_product'  => '0',
			'auto_price_change' => '0',
			'auto_new_post'     => '0',
			'sale_auto_notify'  => '0',
			'channels'          => array(),
			'utm'               => 'utm_source=bot&utm_medium=channel',
			'template_product'  => "{name}\n{price}\n{url}",
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
		foreach ( array( 'enabled', 'auto_new_product', 'auto_price_change', 'auto_new_post', 'sale_auto_notify' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = ! empty( $input[ $f ] ) && '0' !== (string) $input[ $f ] ? '1' : '0';
			}
		}
		if ( isset( $input['utm'] ) ) {
			$cur['utm'] = sanitize_text_field( (string) $input['utm'] );
		}
		if ( isset( $input['template_product'] ) ) {
			$cur['template_product'] = sanitize_textarea_field( (string) $input['template_product'] );
		}
		if ( isset( $input['channels'] ) && is_array( $input['channels'] ) ) {
			$chs = array();
			foreach ( $input['channels'] as $ch ) {
				if ( ! is_array( $ch ) || empty( $ch['id'] ) ) {
					continue;
				}
				$chs[] = array(
					'id'       => sanitize_text_field( (string) $ch['id'] ),
					'provider' => in_array( (string) ( $ch['provider'] ?? '' ), array( 'bale', 'telegram' ), true ) ? (string) $ch['provider'] : 'bale',
					'label'    => isset( $ch['label'] ) ? sanitize_text_field( (string) $ch['label'] ) : '',
				);
			}
			$cur['channels'] = $chs;
		}
		update_option( self::OPTION, $cur, false );
		return $cur;
	}

	/**
	 * @param string               $provider Provider.
	 * @param string               $channel_id Channel.
	 * @param string               $text Text.
	 * @param int                  $at Unix ts (0 = now).
	 * @param array<string,mixed>  $extra Extra (photo, buttons, post_id).
	 * @return string Job id.
	 */
	public static function enqueue( $provider, $channel_id, $text, $at = 0, array $extra = array() ) {
		$q   = self::get_queue();
		$id  = uniqid( 'ch', true );
		$q[] = array_merge(
			array(
				'id'         => $id,
				'provider'   => sanitize_key( $provider ),
				'channel_id' => (string) $channel_id,
				'text'       => (string) $text,
				'send_at'    => $at > 0 ? (int) $at : time(),
				'status'     => 'pending',
				'message_id' => '',
			),
			$extra
		);
		update_option( self::QUEUE, $q, false );
		return $id;
	}

	/**
	 * @return list<array<string,mixed>>
	 */
	public static function get_queue() {
		$q = get_option( self::QUEUE, array() );
		return is_array( $q ) ? $q : array();
	}

	/**
	 * @return void
	 */
	public static function process_queue() {
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] ) {
			return;
		}
		$q   = self::get_queue();
		$now = time();
		$changed = false;
		foreach ( $q as &$job ) {
			if ( ! is_array( $job ) || ( $job['status'] ?? '' ) !== 'pending' ) {
				continue;
			}
			if ( (int) ( $job['send_at'] ?? 0 ) > $now ) {
				continue;
			}
			$client = Webino_Dashboard_Bots_Client_Facade::make( (string) $job['provider'] );
			if ( ! $client ) {
				$job['status'] = 'failed';
				$changed       = true;
				continue;
			}
			$payload = array(
				'chat_id' => (string) $job['channel_id'],
				'text'    => (string) $job['text'],
			);
			if ( ! empty( $job['reply_markup'] ) ) {
				$payload['reply_markup'] = is_string( $job['reply_markup'] ) ? $job['reply_markup'] : wp_json_encode( $job['reply_markup'] );
			}
			$res = $client->send_message( $payload );
			if ( is_array( $res ) && ! empty( $res['ok'] ) ) {
				$job['status']     = 'sent';
				$job['message_id'] = isset( $res['result']['message_id'] ) ? (string) $res['result']['message_id'] : '';
				$job['sent_at']    = time();
			} else {
				$job['status'] = 'failed';
				if ( class_exists( 'Webino_Dashboard_Bots_Outbound_Queue', false ) ) {
					Webino_Dashboard_Bots_Outbound_Queue::enqueue_message( (string) $job['provider'], (string) $job['channel_id'], $payload );
				}
			}
			$changed = true;
		}
		unset( $job );
		if ( $changed ) {
			update_option( self::QUEUE, $q, false );
		}
	}

	/**
	 * @param string  $new_status New.
	 * @param string  $old_status Old.
	 * @param WP_Post $post Post.
	 * @return void
	 */
	public static function on_post_status( $new_status, $old_status, $post ) {
		$s = self::settings();
		if ( empty( $s['auto_new_post'] ) || '0' === (string) $s['auto_new_post'] ) {
			return;
		}
		if ( 'publish' !== $new_status || 'publish' === $old_status || ! $post || 'post' !== $post->post_type ) {
			return;
		}
		$url = get_permalink( $post );
		if ( ! empty( $s['utm'] ) ) {
			$url = add_query_arg( wp_parse_args( $s['utm'] ), $url );
		}
		$text = $post->post_title . "\n" . $url;
		foreach ( (array) $s['channels'] as $ch ) {
			self::enqueue( $ch['provider'], $ch['id'], $text, 0, array( 'post_id' => $post->ID ) );
		}
	}

	/**
	 * @param int $product_id Product ID.
	 * @return void
	 */
	public static function on_product_update( $product_id ) {
		$s = self::settings();
		$product = function_exists( 'wc_get_product' ) ? wc_get_product( $product_id ) : false;
		if ( ! $product ) {
			return;
		}

		self::maybe_sale_auto_notify( $product );

		if ( empty( $s['auto_new_product'] ) && empty( $s['auto_price_change'] ) ) {
			return;
		}
		$prev = get_post_meta( $product_id, '_webino_bot_last_price', true );
		$cur  = (string) $product->get_price();
		$is_new = ( 'publish' === $product->get_status() && empty( $prev ) && ! empty( $s['auto_new_product'] ) && '0' !== (string) $s['auto_new_product'] );
		$price_changed = ( '' !== (string) $prev && (string) $prev !== $cur && ! empty( $s['auto_price_change'] ) && '0' !== (string) $s['auto_price_change'] );
		update_post_meta( $product_id, '_webino_bot_last_price', $cur );
		if ( ! $is_new && ! $price_changed ) {
			return;
		}
		$url = get_permalink( $product_id );
		if ( ! empty( $s['utm'] ) ) {
			$url = add_query_arg( wp_parse_args( $s['utm'] ), $url );
		}
		$text = class_exists( 'Webino_Dashboard_Bots_Templates', false )
			? Webino_Dashboard_Bots_Templates::render(
				(string) $s['template_product'],
				array(
					'name'  => $product->get_name(),
					'price' => $cur,
					'url'   => $url,
				)
			)
			: $product->get_name() . "\n" . $cur . "\n" . $url;
		$kbd = array(
			'inline_keyboard' => array(
				array(
					array(
						'text' => __( '🛒 خرید', 'webino-dashboard' ),
						'url'  => $url,
					),
				),
			),
		);
		foreach ( (array) $s['channels'] as $ch ) {
			self::enqueue( $ch['provider'], $ch['id'], $text, 0, array( 'reply_markup' => $kbd, 'product_id' => $product_id ) );
		}
	}

	/**
	 * Broadcast a short sale notice to up to 50 linked bot users when product goes on sale.
	 *
	 * @param WC_Product $product Product.
	 * @return void
	 */
	private static function maybe_sale_auto_notify( $product ) {
		$s = self::settings();
		if ( empty( $s['sale_auto_notify'] ) || '0' === (string) $s['sale_auto_notify'] ) {
			return;
		}
		if ( ! $product || ! method_exists( $product, 'is_on_sale' ) || ! $product->is_on_sale() ) {
			return;
		}
		$pid = (int) $product->get_id();
		$flag_key = '_webino_bot_sale_notified';
		if ( '1' === (string) get_post_meta( $pid, $flag_key, true ) ) {
			$prev_sale = (string) get_post_meta( $pid, '_webino_bot_last_sale_price', true );
			$cur_sale  = (string) $product->get_sale_price();
			if ( $prev_sale === $cur_sale ) {
				return;
			}
		}
		update_post_meta( $pid, $flag_key, '1' );
		update_post_meta( $pid, '_webino_bot_last_sale_price', (string) $product->get_sale_price() );

		$price = function_exists( 'wc_get_price_to_display' ) ? wc_get_price_to_display( $product ) : $product->get_price();
		$text  = sprintf(
			/* translators: 1: product name 2: price */
			__( "🔥 فروش ویژه\n%s\n%s", 'webino-dashboard' ),
			$product->get_name(),
			is_numeric( $price ) ? wc_price( $price ) : (string) $price
		);
		$text = wp_strip_all_tags( $text );

		$n = 0;
		foreach ( array( 'woobale_chat_id' => 'bale', 'webino_dashboard_telegram_chat_id' => 'telegram' ) as $meta => $prov ) {
			$users = get_users(
				array(
					'meta_key'     => $meta,
					'meta_compare' => 'EXISTS',
					'number'       => 50,
					'fields'       => 'ID',
				)
			);
			foreach ( (array) $users as $uid ) {
				if ( $n >= 50 ) {
					return;
				}
				$chat = (string) get_user_meta( (int) $uid, $meta, true );
				if ( $chat === '' ) {
					continue;
				}
				$payload = array(
					'chat_id' => $chat,
					'text'    => $text,
				);
				if ( class_exists( 'Webino_Dashboard_Bots_Outbound_Queue', false ) ) {
					Webino_Dashboard_Bots_Outbound_Queue::enqueue_message( $prov, $chat, $payload );
				}
				++$n;
			}
		}
	}
}
