<?php

namespace Webino_Dashboard_Bots_Bale\Admin;

use Webino_Dashboard_Bots_Bale\Core\Plugin;
use Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger;

/**
 * Chunked broadcast to all users with woobale_chat_id (scheduled ticks).
 */
class BroadcastQueue {

	public const OPTION = 'webino_dashboard_bale_broadcast_job';
	public const HOOK    = 'webino_dashboard_bale_broadcast_tick';

	public static function init(): void {
		add_action( self::HOOK, array( __CLASS__, 'process_tick' ) );
	}

	/**
	 * @return array<string, mixed>|null
	 */
	public static function get_job(): ?array {
		$j = get_option( self::OPTION, null );
		return is_array( $j ) ? $j : null;
	}

	public static function cancel(): void {
		wp_clear_scheduled_hook( self::HOOK );
		delete_option( self::OPTION );
	}

	/**
	 * @return array{ok:bool, error?:string}
	 */
	public static function start( array $payload, array $args = array() ): array {
		$sanitized_payload = self::sanitize_payload( $payload );
		$valid             = self::validate_payload( $sanitized_payload );
		if ( ! $valid['ok'] ) {
			return $valid;
		}
		if ( Plugin::get_bot_token() === '' ) {
			return array( 'ok' => false, 'error' => __( 'توکن بازو تنظیم نشده است.', 'webino-dashboard' ) );
		}

		self::cancel();

		$job = array(
			'active'      => true,
			'payload'     => $sanitized_payload,
			'user_ids'    => isset( $args['user_ids'] ) && is_array( $args['user_ids'] ) ? array_values( array_unique( array_map( 'absint', $args['user_ids'] ) ) ) : array(),
			'offset'      => 0,
			'sent'        => 0,
			'failed'      => 0,
			'started_at'  => time(),
			'campaign_id' => isset( $args['campaign_id'] ) ? absint( $args['campaign_id'] ) : 0,
		);
		update_option( self::OPTION, $job );

		if ( ! wp_next_scheduled( self::HOOK ) ) {
			wp_schedule_single_event( time() + 2, self::HOOK );
		}
		if ( function_exists( 'spawn_cron' ) ) {
			spawn_cron();
		}

		return array( 'ok' => true );
	}

	/**
	 * @param array<string, mixed> $payload
	 * @return array<string, mixed>
	 */
	private static function sanitize_payload( array $payload ): array {
		$type = isset( $payload['type'] ) ? sanitize_key( (string) $payload['type'] ) : OutboundMessenger::TYPE_TEXT;
		return array(
			'type'    => $type,
			'text'    => isset( $payload['text'] ) ? wp_kses_post( (string) $payload['text'] ) : '',
			'caption' => isset( $payload['caption'] ) ? wp_kses_post( (string) $payload['caption'] ) : '',
			'media'   => isset( $payload['media'] ) ? trim( (string) $payload['media'] ) : '',
		);
	}

	/**
	 * @param array<string, mixed> $payload
	 * @return array{ok:bool, error?:string}
	 */
	private static function validate_payload( array $payload ): array {
		$type = isset( $payload['type'] ) ? (string) $payload['type'] : OutboundMessenger::TYPE_TEXT;
		if ( $type === OutboundMessenger::TYPE_TEXT ) {
			return trim( (string) $payload['text'] ) !== ''
				? array( 'ok' => true )
				: array( 'ok' => false, 'error' => __( 'متن پیام خالی است.', 'webino-dashboard' ) );
		}
		if ( trim( (string) $payload['media'] ) === '' ) {
			return array( 'ok' => false, 'error' => __( 'برای ارسال رسانه، آدرس یا شناسه فایل لازم است.', 'webino-dashboard' ) );
		}
		return array( 'ok' => true );
	}

	public static function process_tick(): void {
		$job = self::get_job();
		if ( ! $job || empty( $job['active'] ) || empty( $job['payload'] ) || ! is_array( $job['payload'] ) ) {
			return;
		}

		$per_chunk = 12;
		$user_ids  = isset( $job['user_ids'] ) && is_array( $job['user_ids'] ) ? $job['user_ids'] : array();
		$chunk_len = 0;
		if ( ! empty( $user_ids ) ) {
			$chunk = array_slice( $user_ids, (int) $job['offset'], $per_chunk );
			$chunk_len = count( $chunk );
			$users = ! empty( $chunk ) ? get_users( array( 'include' => $chunk, 'orderby' => 'ID', 'order' => 'ASC' ) ) : array();
		} else {
			$users = get_users(
				array(
					'number'     => $per_chunk,
					'offset'     => (int) $job['offset'],
					'fields'     => 'all',
					'meta_query' => array(
						'relation' => 'AND',
						array(
							'key'     => 'woobale_chat_id',
							'compare' => 'EXISTS',
						),
						array(
							'key'     => 'woobale_chat_id',
							'value'   => '',
							'compare' => '!=',
						),
					),
					'orderby'    => 'ID',
					'order'      => 'ASC',
				)
			);
		}

		foreach ( $users as $user ) {
			$chat = get_user_meta( $user->ID, 'woobale_chat_id', true );
			if ( ! $chat ) {
				continue;
			}
			$res = OutboundMessenger::send_payload_to_chat( (string) $chat, $job['payload'] );
			if ( $res && ! empty( $res['ok'] ) ) {
				++$job['sent'];
			} else {
				++$job['failed'];
			}
		}

		if ( ! empty( $user_ids ) ) {
			$job['offset'] = (int) $job['offset'] + $chunk_len;
		} else {
			$job['offset'] = (int) $job['offset'] + count( $users );
		}
		update_option( self::OPTION, $job );

		$is_last_chunk = ! empty( $user_ids )
			? (int) $job['offset'] >= count( $user_ids )
			: count( $users ) < $per_chunk;
		if ( $is_last_chunk ) {
			$job['active'] = false;
			update_option( self::OPTION, $job );
			wp_clear_scheduled_hook( self::HOOK );
			if ( ! empty( $job['campaign_id'] ) ) {
				CampaignRepository::mark_finished( (int) $job['campaign_id'], (int) $job['sent'], (int) $job['failed'] );
			}
			return;
		}

		if ( ! wp_next_scheduled( self::HOOK ) ) {
			wp_schedule_single_event( time() + 3, self::HOOK );
		}
		if ( function_exists( 'spawn_cron' ) ) {
			spawn_cron();
		}
	}
}
