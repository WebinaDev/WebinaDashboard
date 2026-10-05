<?php

namespace Webino_Dashboard_Bots_Telegram\Admin;

/**
 * Stores simple campaign entities in options table.
 */
class CampaignRepository {

	public const OPTION_ITEMS = 'webino_dashboard_telegram_campaign_items';
	public const OPTION_LAST_ID = 'webino_dashboard_telegram_campaign_last_id';
	public const HOOK_LAUNCH = 'webino_dashboard_telegram_campaign_launch';

	/**
	 * @return array<int, array<string, mixed>>
	 */
	public static function all(): array {
		$items = get_option( self::OPTION_ITEMS, array() );
		return is_array( $items ) ? $items : array();
	}

	/**
	 * @return array<string, mixed>|null
	 */
	public static function find( int $id ): ?array {
		foreach ( self::all() as $item ) {
			if ( isset( $item['id'] ) && (int) $item['id'] === $id ) {
				return $item;
			}
		}
		return null;
	}

	/**
	 * @param array<string, mixed> $payload
	 * @param list<int>            $user_ids
	 */
	public static function create( string $name, int $scheduled_at, array $payload, array $user_ids ): int {
		$last = (int) get_option( self::OPTION_LAST_ID, 0 ) + 1;
		update_option( self::OPTION_LAST_ID, $last );

		$items   = self::all();
		$items[] = array(
			'id'           => $last,
			'name'         => sanitize_text_field( $name ),
			'status'       => 'scheduled',
			'scheduled_at' => $scheduled_at,
			'payload'      => $payload,
			'user_ids'     => array_values( array_unique( array_map( 'absint', $user_ids ) ) ),
			'sent'         => 0,
			'failed'       => 0,
			'created_at'   => time(),
		);
		update_option( self::OPTION_ITEMS, $items );
		return $last;
	}

	public static function mark_running( int $id ): void {
		self::update_item( $id, array( 'status' => 'running' ) );
	}

	public static function mark_finished( int $id, int $sent, int $failed ): void {
		self::update_item(
			$id,
			array(
				'status' => 'finished',
				'sent'   => $sent,
				'failed' => $failed,
			)
		);
	}

	/**
	 * @param array<string, mixed> $patch
	 */
	private static function update_item( int $id, array $patch ): void {
		$items = self::all();
		foreach ( $items as $idx => $item ) {
			if ( isset( $item['id'] ) && (int) $item['id'] === $id ) {
				$items[ $idx ] = array_merge( $item, $patch );
				update_option( self::OPTION_ITEMS, $items );
				return;
			}
		}
	}
}
