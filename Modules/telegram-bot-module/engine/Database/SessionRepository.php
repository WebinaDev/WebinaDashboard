<?php

namespace Webino_Dashboard_Bots_Telegram\Database;

/**
 * CRUD for wp_webino_dashboard_bot_sessions (provider = telegram).
 */
class SessionRepository {

	public const PROVIDER = 'telegram';

	/**
	 * @return array<string, mixed>|null
	 */
	public function get_by_chat_id( string $chat_id ): ?array {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dashboard_bot_sessions';
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE provider = %s AND chat_id = %s",
				self::PROVIDER,
				$chat_id
			),
			ARRAY_A
		);
		return $row ?: null;
	}

	/**
	 * @param array<string, mixed> $temp_data
	 * @param bool                 $clear_state If true, force current_state to NULL (e.g. after /start).
	 */
	public function upsert(
		string $chat_id,
		?int $wp_user_id,
		?string $current_state,
		array $temp_data = array(),
		bool $clear_state = false
	): void {
		global $wpdb;
		$table    = $wpdb->prefix . 'webino_dashboard_bot_sessions';
		$existing = $this->get_by_chat_id( $chat_id );
		$json     = wp_json_encode( $temp_data );
		$now      = current_time( 'mysql' );

		if ( $existing ) {
			$merged = array();
			if ( ! empty( $existing['temp_data'] ) ) {
				$decoded = json_decode( (string) $existing['temp_data'], true );
				$merged  = is_array( $decoded ) ? $decoded : array();
			}
			$merged = array_merge( $merged, $temp_data );
			$json   = wp_json_encode( $merged );

			$new_uid = null !== $wp_user_id ? $wp_user_id : (int) $existing['wp_user_id'];
			if ( $clear_state ) {
				$new_st = null;
			} elseif ( null !== $current_state ) {
				$new_st = $current_state;
			} else {
				$new_st = $existing['current_state'];
			}

			$wpdb->update(
				$table,
				array(
					'wp_user_id'    => $new_uid,
					'current_state' => $new_st,
					'temp_data'     => $json,
					'updated_at'    => $now,
				),
				array(
					'provider' => self::PROVIDER,
					'chat_id'  => $chat_id,
				),
				array( '%d', '%s', '%s', '%s' ),
				array( '%s', '%s' )
			);
		} else {
			$insert_state = $clear_state ? null : $current_state;
			$wpdb->insert(
				$table,
				array(
					'provider'      => self::PROVIDER,
					'chat_id'       => $chat_id,
					'wp_user_id'    => null !== $wp_user_id ? $wp_user_id : 0,
					'current_state' => $insert_state,
					'temp_data'     => $json,
					'updated_at'    => $now,
				),
				array( '%s', '%s', '%d', '%s', '%s', '%s' )
			);
		}
	}

	public function set_state( string $chat_id, ?string $state ): void {
		$row = $this->get_by_chat_id( $chat_id );
		if ( ! $row ) {
			$this->upsert( $chat_id, 0, $state, array() );
			return;
		}
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dashboard_bot_sessions';
		$wpdb->update(
			$table,
			array(
				'current_state' => $state,
				'updated_at'    => current_time( 'mysql' ),
			),
			array(
				'provider' => self::PROVIDER,
				'chat_id'  => $chat_id,
			),
			array( '%s', '%s' ),
			array( '%s', '%s' )
		);
	}

	/**
	 * @param array<string, mixed> $temp_data
	 */
	public function merge_temp_data( string $chat_id, array $temp_data ): void {
		$row = $this->get_by_chat_id( $chat_id );
		$uid = $row && isset( $row['wp_user_id'] ) ? (int) $row['wp_user_id'] : null;
		$st  = $row ? ( $row['current_state'] ?? null ) : null;
		$this->upsert( $chat_id, $uid, $st, $temp_data, false );
	}

	public function clear_state( string $chat_id ): void {
		$this->set_state( $chat_id, null );
	}

	public function set_wp_user_id( string $chat_id, int $user_id ): void {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dashboard_bot_sessions';
		$wpdb->update(
			$table,
			array(
				'wp_user_id' => $user_id,
				'updated_at' => current_time( 'mysql' ),
			),
			array(
				'provider' => self::PROVIDER,
				'chat_id'  => $chat_id,
			),
			array( '%d', '%s' ),
			array( '%s', '%s' )
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public function get_temp_data( string $chat_id ): array {
		$row = $this->get_by_chat_id( $chat_id );
		if ( ! $row || empty( $row['temp_data'] ) ) {
			return array();
		}
		$d = json_decode( (string) $row['temp_data'], true );
		return is_array( $d ) ? $d : array();
	}

	public function delete_by_chat_id( string $chat_id ): void {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dashboard_bot_sessions';
		$wpdb->delete(
			$table,
			array(
				'provider' => self::PROVIDER,
				'chat_id'  => $chat_id,
			),
			array( '%s', '%s' )
		);
	}

	public function delete_by_wp_user_id( int $user_id ): void {
		if ( $user_id < 1 ) {
			return;
		}
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dashboard_bot_sessions';
		$wpdb->delete(
			$table,
			array(
				'provider'   => self::PROVIDER,
				'wp_user_id' => $user_id,
			),
			array( '%s', '%d' )
		);
	}
}
