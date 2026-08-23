<?php
/**
 * Shared outbound message queue for Bale/Telegram bots.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Provider-aware retry queue stored in a single option.
 */
final class Webino_Dashboard_Bots_Outbound_Queue {

	const OPTION = 'webino_dashboard_bots_outbound_queue';
	const HOOK   = 'webino_dashboard_bots_outbound_tick';

	const MAX_ATTEMPTS = 10;
	const MAX_PER_TICK = 40;

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		add_action( self::HOOK, array( __CLASS__, 'process_tick' ) );
	}

	/**
	 * @param string               $provider bale|telegram.
	 * @param string               $chat_id  Chat id.
	 * @param array<string,mixed>  $payload  sendMessage-compatible payload (without chat_id optional).
	 * @return void
	 */
	public static function enqueue_message( $provider, $chat_id, array $payload ) {
		$provider = sanitize_key( (string) $provider );
		$chat_id  = (string) $chat_id;
		if ( '' === $chat_id || ! in_array( $provider, array( 'bale', 'telegram' ), true ) ) {
			return;
		}
		$q   = self::get_queue();
		$q[] = array(
			'kind'       => 'message',
			'provider'   => $provider,
			'chat_id'    => $chat_id,
			'payload'    => $payload,
			'attempts'   => 0,
			'next_run'   => time() + 30,
			'status'     => 'pending',
			'created_at' => time(),
		);
		self::save_queue( $q );
		self::schedule_tick();
	}

	/**
	 * @return list<array<string,mixed>>
	 */
	public static function get_queue() {
		$q = get_option( self::OPTION, array() );
		return is_array( $q ) ? $q : array();
	}

	/**
	 * @param list<array<string,mixed>> $q Queue.
	 * @return void
	 */
	private static function save_queue( array $q ) {
		if ( count( $q ) > 800 ) {
			$q = array_slice( $q, -800 );
		}
		update_option( self::OPTION, $q, false );
	}

	/**
	 * @return void
	 */
	public static function schedule_tick() {
		if ( ! wp_next_scheduled( self::HOOK ) ) {
			wp_schedule_single_event( time() + 40, self::HOOK );
		}
		if ( function_exists( 'spawn_cron' ) ) {
			spawn_cron();
		}
	}

	/**
	 * @return void
	 */
	public static function process_tick() {
		$q = self::get_queue();
		if ( empty( $q ) ) {
			wp_clear_scheduled_hook( self::HOOK );
			return;
		}
		$now         = time();
		$out         = array();
		$processed_n = 0;
		foreach ( $q as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			if ( $processed_n >= self::MAX_PER_TICK ) {
				$out[] = $item;
				continue;
			}
			$next = isset( $item['next_run'] ) ? (int) $item['next_run'] : 0;
			if ( $next > $now ) {
				$out[] = $item;
				continue;
			}
			++$processed_n;
			$ok = self::dispatch_item( $item );
			if ( $ok ) {
				continue;
			}
			$attempts = isset( $item['attempts'] ) ? (int) $item['attempts'] : 0;
			++$attempts;
			if ( $attempts >= self::MAX_ATTEMPTS ) {
				$item['status']   = 'failed';
				$item['attempts'] = $attempts;
				$out[]            = $item;
				continue;
			}
			$item['attempts'] = $attempts;
			$item['status']   = 'pending';
			$item['next_run'] = $now + min( 3600, 30 * (int) pow( 2, min( 6, $attempts ) ) );
			$out[]            = $item;
		}
		self::save_queue( $out );
		if ( ! empty( $out ) ) {
			self::schedule_tick();
		} else {
			wp_clear_scheduled_hook( self::HOOK );
		}
	}

	/**
	 * @param array<string,mixed> $item Item.
	 * @return bool
	 */
	private static function dispatch_item( array $item ) {
		$provider = isset( $item['provider'] ) ? sanitize_key( (string) $item['provider'] ) : '';
		$chat_id  = isset( $item['chat_id'] ) ? (string) $item['chat_id'] : '';
		$payload  = isset( $item['payload'] ) && is_array( $item['payload'] ) ? $item['payload'] : array();
		if ( '' === $provider || '' === $chat_id ) {
			return false;
		}
		$payload['chat_id'] = $chat_id;
		$client             = self::client_for( $provider );
		if ( ! $client ) {
			return false;
		}
		$res = $client->send_message( $payload );
		return is_array( $res ) && ! empty( $res['ok'] );
	}

	/**
	 * @param string $provider Provider.
	 * @return object|null
	 */
	private static function client_for( $provider ) {
		if ( class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			Webino_Dashboard_Bots_Loader::register_autoloaders();
		}
		if ( 'telegram' === $provider && class_exists( '\Webino_Dashboard_Bots_Telegram\Bale\Client', false ) ) {
			$token = \Webino_Dashboard_Bots_Telegram\Core\Plugin::get_bot_token();
			return '' !== trim( $token ) ? new \Webino_Dashboard_Bots_Telegram\Bale\Client( $token ) : null;
		}
		if ( 'bale' === $provider && class_exists( '\Webino_Dashboard_Bots_Bale\Bale\Client', false ) ) {
			$token = \Webino_Dashboard_Bots_Bale\Core\Plugin::get_bot_token();
			return '' !== trim( $token ) ? new \Webino_Dashboard_Bots_Bale\Bale\Client( $token ) : null;
		}
		return null;
	}
}
