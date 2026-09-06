<?php
/**
 * Audit log writer.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Administrative audit trail.
 */
final class Webino_Shield_Audit {

	/**
	 * @param string               $action     Action key.
	 * @param string               $object_type Object type.
	 * @param string               $object_id  Object id.
	 * @param array<string,mixed>  $details    Details.
	 * @return int|false
	 */
	public static function write( $action, $object_type, $object_id, $details = array() ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();

		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'audit' ),
			array(
				'created_at'  => current_time( 'mysql', true ),
				'user_id'     => get_current_user_id(),
				'action'      => sanitize_key( $action ),
				'object_type' => sanitize_key( $object_type ),
				'object_id'   => sanitize_text_field( (string) $object_id ),
				'details'     => wp_json_encode( $details ),
				'ip'          => Webino_Dashboard_Security::get_client_ip(),
			),
			array( '%s', '%d', '%s', '%s', '%s', '%s', '%s' )
		);

		return (int) $wpdb->insert_id;
	}

	/**
	 * @param array<string,mixed> $args Query.
	 * @return array<int,array<string,mixed>>
	 */
	public static function query( $args = array() ) {
		global $wpdb;
		$limit = min( 200, max( 1, (int) ( $args['limit'] ?? 50 ) ) );
		$table = Webino_Dashboard_Security_Db::table( 'audit' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT {$limit}", ARRAY_A ) ?: array();
	}
}
