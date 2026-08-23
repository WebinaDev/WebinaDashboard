<?php
/**
 * Logger.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Write logs to wnc_logs.
 */
class WNC_Logger {

	/**
	 * @param string               $level Level.
	 * @param string               $message Message.
	 * @param string               $platform Platform slug.
	 * @param string               $context Context.
	 * @param array<string,mixed>  $meta Meta.
	 */
	public static function log( $level, $message, $platform = '', $context = 'general', $meta = array() ) {
		global $wpdb;
		$table = WNC_Storage::logs_table();
		$now   = current_time( 'mysql' );

		$wpdb->insert(
			$table,
			array(
				'level'      => sanitize_key( $level ),
				'platform'   => sanitize_key( $platform ),
				'context'    => sanitize_key( $context ),
				'message'    => sanitize_text_field( $message ),
				'meta'       => ! empty( $meta ) ? wp_json_encode( $meta ) : null,
				'created_at' => $now,
			),
			array( '%s', '%s', '%s', '%s', '%s', '%s' )
		);
	}

	/**
	 * @param string $message Message.
	 * @param string $platform Platform.
	 * @param string $context Context.
	 * @param array  $meta Meta.
	 */
	public static function info( $message, $platform = '', $context = 'general', $meta = array() ) {
		self::log( 'info', $message, $platform, $context, $meta );
	}

	/**
	 * @param string $message Message.
	 * @param string $platform Platform.
	 * @param string $context Context.
	 * @param array  $meta Meta.
	 */
	public static function error( $message, $platform = '', $context = 'general', $meta = array() ) {
		self::log( 'error', $message, $platform, $context, $meta );
	}

	/**
	 * Recent logs.
	 *
	 * @param int    $limit Limit.
	 * @param string $platform Platform filter.
	 * @return array
	 */
	public static function recent( $limit = 50, $platform = '' ) {
		global $wpdb;
		$table = WNC_Storage::logs_table();
		$limit = max( 1, min( 200, (int) $limit ) );

		if ( $platform ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			return $wpdb->get_results(
				$wpdb->prepare(
					"SELECT * FROM {$table} WHERE platform = %s ORDER BY id DESC LIMIT %d",
					sanitize_key( $platform ),
					$limit
				),
				ARRAY_A
			);
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results(
			$wpdb->prepare( "SELECT * FROM {$table} ORDER BY id DESC LIMIT %d", $limit ),
			ARRAY_A
		);
	}
}
