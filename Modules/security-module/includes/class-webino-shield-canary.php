<?php
/**
 * Canary paths and honeypot triggers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Decoy paths that create incidents on access.
 */
final class Webino_Shield_Canary {

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'watch_request' ), 1 );
	}

	/**
	 * @return void
	 */
	public static function watch_request() {
		$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
		if ( '' === $uri ) {
			return;
		}

		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'canaries' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$canaries = $wpdb->get_results( "SELECT * FROM {$table}", ARRAY_A );
		foreach ( $canaries ?: array() as $canary ) {
			$path = (string) ( $canary['path'] ?? '' );
			if ( '' !== $path && false !== strpos( $uri, $path ) ) {
				self::trigger( $canary );
			}
		}
	}

	/**
	 * @param array<string,mixed> $canary Canary row.
	 * @return void
	 */
	private static function trigger( $canary ) {
		global $wpdb;
		$wpdb->update(
			Webino_Dashboard_Security_Db::table( 'canaries' ),
			array(
				'hits'     => (int) $canary['hits'] + 1,
				'last_hit' => current_time( 'mysql', true ),
			),
			array( 'id' => (int) $canary['id'] )
		);

		Webino_Shield_Forensics::create_incident( array(
			'title'    => 'Canary triggered: ' . ( $canary['path'] ?? '' ),
			'severity' => 'high',
			'event_ids'=> array(),
		) );

		Webino_Shield_Notify::dispatch( 'canary', array( 'path' => $canary['path'] ?? '' ) );
		Webino_Shield_Blocklist::auto_block( Webino_Dashboard_Security::get_client_ip(), 'canary', 60 );
	}

	/**
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function create( $params ) {
		$path  = sanitize_text_field( (string) ( $params['path'] ?? '/wp-admin-canary-' . wp_generate_password( 6, false, false ) ) );
		$token = bin2hex( random_bytes( 16 ) );
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'canaries' ),
			array(
				'canary_type' => sanitize_key( (string) ( $params['type'] ?? 'path' ) ),
				'token'       => $token,
				'path'        => $path,
				'created_at'  => current_time( 'mysql', true ),
			)
		);
		Webino_Shield_Audit::write( 'canary_create', 'canary', $token, array( 'path' => $path ) );
		return array( 'id' => (int) $wpdb->insert_id, 'path' => $path, 'token' => $token );
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_all() {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'canaries' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results( "SELECT id, canary_type, path, hits, last_hit, created_at FROM {$table} ORDER BY id DESC", ARRAY_A ) ?: array();
	}
}
