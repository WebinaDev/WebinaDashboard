<?php

namespace Webino_Dashboard_Bots_Bale\Messaging;

use Webino_Dashboard_Bots_Bale\Logging\ActivityLog;

/**
 * Transient queue for failed sendMessage / sendInvoice with exponential backoff retries.
 */
class MessageRetryQueue {

	public const OPTION = 'webino_dashboard_bale_message_retry_queue';
	public const HOOK   = 'webino_dashboard_bale_message_retry_tick';

	private const MAX_ATTEMPTS = 10;
	private const MAX_PER_TICK = 25;

	public static function init(): void {
		add_action( self::HOOK, array( __CLASS__, 'process_tick' ) );
	}

	/**
	 * @param array<string, mixed> $payload OutboundMessenger payload shape.
	 */
	public static function enqueue_payload( string $chat_id, array $payload ): void {
		$q   = self::get_queue();
		$q[] = array(
			'kind'     => 'payload',
			'chat_id'  => $chat_id,
			'payload'  => $payload,
			'attempts' => 0,
			'next_run' => time() + 45,
		);
		self::save_queue( $q );
		self::schedule_tick();
	}

	public static function enqueue_invoice( int $order_id, int $chat_id_int ): void {
		$q   = self::get_queue();
		$q[] = array(
			'kind'        => 'invoice',
			'order_id'    => $order_id,
			'chat_id_int' => $chat_id_int,
			'attempts'    => 0,
			'next_run'    => time() + 45,
		);
		self::save_queue( $q );
		self::schedule_tick();
	}

	/**
	 * @return list<array<string, mixed>>
	 */
	private static function get_queue(): array {
		$q = get_option( self::OPTION, array() );
		return is_array( $q ) ? $q : array();
	}

	/**
	 * @param list<array<string, mixed>> $q
	 */
	private static function save_queue( array $q ): void {
		if ( count( $q ) > 500 ) {
			$q = array_slice( $q, -500 );
		}
		update_option( self::OPTION, $q, false );
	}

	public static function schedule_tick(): void {
		if ( ! wp_next_scheduled( self::HOOK ) ) {
			wp_schedule_single_event( time() + 50, self::HOOK );
		}
		if ( function_exists( 'spawn_cron' ) ) {
			spawn_cron();
		}
	}

	public static function process_tick(): void {
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
			$kind = isset( $item['kind'] ) ? (string) $item['kind'] : '';
			$ok   = false;
			if ( $kind === 'payload' && isset( $item['chat_id'], $item['payload'] ) && is_array( $item['payload'] ) ) {
				$res = OutboundMessenger::send_payload_to_chat( (string) $item['chat_id'], $item['payload'], true );
				$ok  = ! empty( $res['ok'] );
			} elseif ( $kind === 'invoice' && isset( $item['order_id'], $item['chat_id_int'] ) ) {
				$res = OutboundMessenger::send_invoice( (int) $item['order_id'], (int) $item['chat_id_int'], true );
				$ok  = ! empty( $res['ok'] );
			}

			if ( $ok ) {
				continue;
			}

			$attempts = isset( $item['attempts'] ) ? (int) $item['attempts'] : 0;
			++$attempts;
			if ( $attempts >= self::MAX_ATTEMPTS ) {
				ActivityLog::add(
					'error',
					'outbound',
					'message_retry_gave_up',
					array(
						'kind' => $kind,
					)
				);
				continue;
			}
			$item['attempts'] = $attempts;
			$backoff          = min( 900, 30 * ( 2 ** min( 8, $attempts ) ) );
			$item['next_run'] = $now + $backoff;
			$out[]            = $item;
		}

		self::save_queue( $out );
		wp_clear_scheduled_hook( self::HOOK );
		if ( ! empty( $out ) ) {
			self::schedule_tick();
		}
	}
}
