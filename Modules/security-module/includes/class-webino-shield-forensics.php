<?php
/**
 * Incident forensics timeline.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Group events into incidents.
 */
final class Webino_Shield_Forensics {

	/**
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function create_incident( $params ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();

		$event_ids = isset( $params['event_ids'] ) ? (array) $params['event_ids'] : array();
		$timeline  = self::build_timeline( $event_ids );

		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'incidents' ),
			array(
				'title'     => sanitize_text_field( (string) ( $params['title'] ?? 'Security incident' ) ),
				'status'    => sanitize_key( (string) ( $params['status'] ?? 'open' ) ),
				'severity'  => sanitize_key( (string) ( $params['severity'] ?? 'medium' ) ),
				'event_ids' => wp_json_encode( $event_ids ),
				'timeline'  => wp_json_encode( $timeline ),
				'created_at'=> current_time( 'mysql', true ),
				'updated_at'=> current_time( 'mysql', true ),
			)
		);

		return array(
			'id'       => (int) $wpdb->insert_id,
			'timeline' => $timeline,
		);
	}

	/**
	 * @param array<int|string> $event_ids Event IDs.
	 * @return array<int,array<string,mixed>>
	 */
	public static function build_timeline( $event_ids ) {
		global $wpdb;
		if ( empty( $event_ids ) ) {
			$table = Webino_Dashboard_Security_Db::table( 'events' );
			$rows  = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT 20", ARRAY_A );
			return $rows ?: array();
		}

		$ids   = array_map( 'intval', $event_ids );
		$place = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
		$table = Webino_Dashboard_Security_Db::table( 'events' );
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table} WHERE id IN ($place) ORDER BY created_at ASC", $ids ), ARRAY_A ) ?: array();
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_incidents( $args = array() ) {
		global $wpdb;
		$limit = min( 50, max( 1, (int) ( $args['limit'] ?? 20 ) ) );
		$table = Webino_Dashboard_Security_Db::table( 'incidents' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( "SELECT id, title, status, severity, created_at, updated_at FROM {$table} ORDER BY id DESC LIMIT {$limit}", ARRAY_A );
		return $rows ?: array();
	}

	/**
	 * @param int $id Incident ID.
	 * @return array<string,mixed>|null
	 */
	public static function get( $id ) {
		global $wpdb;
		$row = $wpdb->get_row(
			$wpdb->prepare( 'SELECT * FROM ' . Webino_Dashboard_Security_Db::table( 'incidents' ) . ' WHERE id = %d', (int) $id ),
			ARRAY_A
		);
		if ( $row ) {
			$row['timeline'] = json_decode( (string) ( $row['timeline'] ?? '[]' ), true );
			$row['event_ids'] = json_decode( (string) ( $row['event_ids'] ?? '[]' ), true );
		}
		return $row ?: null;
	}
}
