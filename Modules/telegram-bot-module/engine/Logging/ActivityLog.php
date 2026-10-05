<?php

namespace Webino_Dashboard_Bots_Telegram\Logging;

/**
 * Ring buffer of recent events for the admin «WooBale logs» screen (API, webhook, outbound).
 */
class ActivityLog {

	public const OPTION_KEY = 'webino_dashboard_telegram_activity_log';
	private const MAX_ENTRIES = 400;

	/**
	 * @param 'error'|'warning'|'info' $level
	 * @param 'api'|'webhook'|'outbound'|'bot' $channel
	 * @param array<string, mixed>       $context
	 */
	public static function add( string $level, string $channel, string $message, array $context = array() ): void {
		$level   = in_array( $level, array( 'error', 'warning', 'info' ), true ) ? $level : 'info';
		$channel = sanitize_key( $channel );
		if ( $channel === '' ) {
			$channel = 'bot';
		}
		$entry = array(
			'ts'      => time(),
			'level'   => $level,
			'channel' => $channel,
			'msg'     => wp_strip_all_tags( $message ),
			'ctx'     => self::trim_context( $context ),
		);
		$log = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $log ) ) {
			$log = array();
		}
		$log[] = $entry;
		if ( count( $log ) > self::MAX_ENTRIES ) {
			$log = array_slice( $log, -self::MAX_ENTRIES );
		}
		update_option( self::OPTION_KEY, $log, false );
	}

	/**
	 * @param array<string, mixed> $context
	 * @return array<string, mixed>
	 */
	private static function trim_context( array $context ): array {
		$out = array();
		foreach ( $context as $k => $v ) {
			$key = is_string( $k ) ? sanitize_key( $k ) : (string) $k;
			if ( is_scalar( $v ) || $v === null ) {
				$out[ $key ] = $v;
			} elseif ( is_array( $v ) ) {
				$json = wp_json_encode( $v );
				$out[ $key ] = $json !== false && strlen( $json ) > 500 ? substr( $json, 0, 500 ) . '…' : $v;
			} else {
				$out[ $key ] = '[object]';
			}
		}
		return $out;
	}

	/**
	 * @return list<array{ts:int,level:string,channel:string,msg:string,ctx:array}>
	 */
	public static function get_entries( ?int $from_ts = null, ?int $to_ts = null, ?string $channel = null ): array {
		$log = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $log ) ) {
			return array();
		}
		$out = array();
		foreach ( $log as $row ) {
			if ( ! is_array( $row ) || ! isset( $row['ts'] ) ) {
				continue;
			}
			$ts = (int) $row['ts'];
			if ( $from_ts !== null && $ts < $from_ts ) {
				continue;
			}
			if ( $to_ts !== null && $ts > $to_ts ) {
				continue;
			}
			$ch = isset( $row['channel'] ) ? (string) $row['channel'] : '';
			if ( $channel !== null && $channel !== '' && $ch !== $channel ) {
				continue;
			}
			$out[] = array(
				'ts'      => $ts,
				'level'   => isset( $row['level'] ) ? (string) $row['level'] : 'info',
				'channel' => $ch,
				'msg'     => isset( $row['msg'] ) ? (string) $row['msg'] : '',
				'ctx'     => isset( $row['ctx'] ) && is_array( $row['ctx'] ) ? $row['ctx'] : array(),
			);
		}
		return $out;
	}
}
