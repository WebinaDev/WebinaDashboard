<?php

namespace Webino_Dashboard_Bots_Telegram\Woo;

/**
 * Maps product ID → Bale chat_ids waiting for restock (option-backed).
 */
class StockWatchRegistry {

	private const OPTION = 'webino_dashboard_telegram_stock_watch_map';

	/**
	 * @return array<int, list<string>>
	 */
	private static function get_map(): array {
		$m = get_option( self::OPTION, array() );
		return is_array( $m ) ? $m : array();
	}

	/**
	 * @param array<int, list<string>> $map
	 */
	private static function save_map( array $map ): void {
		if ( count( $map ) > 5000 ) {
			$map = array_slice( $map, -2000, null, true );
		}
		update_option( self::OPTION, $map, false );
	}

	public static function add( int $product_id, string $chat_id ): void {
		$product_id = max( 1, $product_id );
		$chat_id    = trim( $chat_id );
		if ( $chat_id === '' ) {
			return;
		}
		$m = self::get_map();
		if ( ! isset( $m[ $product_id ] ) || ! is_array( $m[ $product_id ] ) ) {
			$m[ $product_id ] = array();
		}
		if ( in_array( $chat_id, $m[ $product_id ], true ) ) {
			return;
		}
		$m[ $product_id ][] = $chat_id;
		self::save_map( $m );
	}

	/**
	 * @return list<string>
	 */
	public static function pop_chat_ids_for_product( int $product_id ): array {
		$m = self::get_map();
		if ( empty( $m[ $product_id ] ) || ! is_array( $m[ $product_id ] ) ) {
			return array();
		}
		$chats = array_values( array_unique( array_map( 'strval', $m[ $product_id ] ) ) );
		unset( $m[ $product_id ] );
		self::save_map( $m );
		return $chats;
	}

	public static function remove_chat_everywhere( string $chat_id ): void {
		$chat_id = trim( $chat_id );
		if ( $chat_id === '' ) {
			return;
		}
		$m    = self::get_map();
		$next = array();
		foreach ( $m as $pid => $list ) {
			if ( ! is_array( $list ) ) {
				continue;
			}
			$filtered = array_values(
				array_filter(
					$list,
					static function ( $c ) use ( $chat_id ) {
						return (string) $c !== $chat_id;
					}
				)
			);
			if ( ! empty( $filtered ) ) {
				$next[ (int) $pid ] = $filtered;
			}
		}
		self::save_map( $next );
	}
}
