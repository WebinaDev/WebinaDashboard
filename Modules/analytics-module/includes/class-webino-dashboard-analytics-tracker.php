<?php
/**
 * Record analytics hits.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-webino-dashboard-analytics-referrer.php';

/**
 * Tracks page views on the public site.
 */
class Webino_Dashboard_Analytics_Tracker {

	/**
	 * @param array<string,mixed> $payload Hit payload.
	 * @return true|WP_Error
	 */
	public static function record( $payload ) {
		if ( ! Webino_Dashboard_Analytics::tracking_enabled() ) {
			return new WP_Error( 'disabled', __( 'Tracking is disabled.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		// When WP Statistics is the source of truth, ignore native hits.
		if ( class_exists( 'Webino_Dashboard_Analytics_Wp_Statistics', false )
			&& Webino_Dashboard_Analytics_Wp_Statistics::is_active() ) {
			return true;
		}

		Webino_Dashboard_Analytics_Db::ensure_tables();

		$type = sanitize_key( (string) ( $payload['type'] ?? 'pageview' ) );
		if ( 'session' === $type ) {
			return self::record_session_beacon( $payload );
		}

		if ( ! Webino_Dashboard_Rest_Base::rate_limit_ok( 'analytics_hit', 120, 60 ) ) {
			return new WP_Error( 'rate_limit', __( 'Too many requests.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}

		$skip = self::should_skip();
		if ( is_wp_error( $skip ) ) {
			return $skip;
		}

		$uri = isset( $payload['uri'] ) ? esc_url_raw( (string) $payload['uri'] ) : '';
		if ( '' === $uri ) {
			$uri = '/';
		}
		if ( self::uri_excluded( $uri ) ) {
			return true;
		}

		$referrer = isset( $payload['referrer'] ) ? esc_url_raw( (string) $payload['referrer'] ) : '';
		$ref      = Webino_Dashboard_Analytics_Referrer::categorize( $referrer );

		$ua   = isset( $_SERVER['HTTP_USER_AGENT'] ) ? (string) wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) : '';
		if ( Webino_Dashboard_Analytics_User_Agent::is_bot( $ua ) ) {
			return true;
		}

		$ip    = Webino_Dashboard_Analytics::get_client_ip();
		$hash  = Webino_Dashboard_Analytics::visitor_hash( $ip, $ua );
		$parsed = Webino_Dashboard_Analytics_User_Agent::parse( $ua );
		$geo   = Webino_Dashboard_Analytics_Geo::lookup( $ip );

		$post_id = 0;
		if ( ! empty( $payload['post_id'] ) ) {
			$post_id = (int) $payload['post_id'];
		} else {
			$post_id = url_to_postid( home_url( $uri ) );
		}

		$session_id = substr( sanitize_text_field( (string) ( $payload['session_id'] ?? '' ) ), 0, 64 );

		$now = current_time( 'mysql', true );

		global $wpdb;
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );
		$visitors = Webino_Dashboard_Analytics_Db::table( 'visitors' );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->insert(
			$events,
			array(
				'created_at'   => $now,
				'visitor_hash' => $hash,
				'uri'          => substr( $uri, 0, 512 ),
				'post_id'      => $post_id,
				'referrer'     => substr( $referrer, 0, 512 ),
				'ref_category' => $ref['category'],
				'ref_source'   => substr( $ref['source'], 0, 191 ),
				'country'      => substr( $geo['country'], 0, 2 ),
				'city'         => substr( $geo['city'], 0, 100 ),
				'browser'      => substr( $parsed['browser'], 0, 64 ),
				'os'           => substr( $parsed['os'], 0, 64 ),
				'device'       => substr( $parsed['device'], 0, 32 ),
				'utm_source'   => substr( sanitize_text_field( (string) ( $payload['utm_source'] ?? '' ) ), 0, 100 ),
				'utm_medium'   => substr( sanitize_text_field( (string) ( $payload['utm_medium'] ?? '' ) ), 0, 100 ),
				'utm_campaign' => substr( sanitize_text_field( (string) ( $payload['utm_campaign'] ?? '' ) ), 0, 100 ),
				'session_id'   => $session_id,
				'duration_ms'  => 0,
				'is_exit'      => 0,
				'is_bounce'    => 0,
			),
			array( '%s', '%s', '%s', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%d' )
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$existing = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT visitor_hash, hits FROM {$visitors} WHERE visitor_hash = %s",
				$hash
			),
			ARRAY_A
		);

		if ( $existing ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->update(
				$visitors,
				array(
					'last_seen' => $now,
					'hits'      => (int) $existing['hits'] + 1,
					'country'   => substr( $geo['country'], 0, 2 ),
				),
				array( 'visitor_hash' => $hash ),
				array( '%s', '%d', '%s' ),
				array( '%s' )
			);
		} else {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$wpdb->insert(
				$visitors,
				array(
					'visitor_hash' => $hash,
					'first_seen'   => $now,
					'last_seen'    => $now,
					'hits'         => 1,
					'country'      => substr( $geo['country'], 0, 2 ),
				),
				array( '%s', '%s', '%s', '%d', '%s' )
			);
		}

		return true;
	}

	/**
	 * Update last event in a session with dwell / bounce / exit flags.
	 *
	 * @param array<string,mixed> $payload Payload.
	 * @return true|WP_Error
	 */
	private static function record_session_beacon( $payload ) {
		$session_id = substr( sanitize_text_field( (string) ( $payload['session_id'] ?? '' ) ), 0, 64 );
		if ( '' === $session_id ) {
			return true;
		}
		if ( ! Webino_Dashboard_Rest_Base::rate_limit_ok( 'analytics_session', 240, 60 ) ) {
			return new WP_Error( 'rate_limit', __( 'Too many requests.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}

		$duration_ms = max( 0, min( 86400000, (int) ( $payload['duration_ms'] ?? 0 ) ) );
		$page_count  = max( 1, min( 500, (int) ( $payload['page_count'] ?? 1 ) ) );
		$is_exit     = ! empty( $payload['is_exit'] ) ? 1 : 0;
		$is_bounce   = ( 1 === $page_count && $duration_ms < 10000 ) ? 1 : 0;

		global $wpdb;
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$id = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT id FROM {$events} WHERE session_id = %s ORDER BY id DESC LIMIT 1",
				$session_id
			)
		);
		if ( $id < 1 ) {
			return true;
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			$events,
			array(
				'duration_ms' => $duration_ms,
				'is_exit'     => $is_exit,
				'is_bounce'   => $is_bounce,
			),
			array( 'id' => $id ),
			array( '%d', '%d', '%d' ),
			array( '%d' )
		);
		return true;
	}

	/**
	 * @return true|WP_Error
	 */
	private static function should_skip() {
		$settings = Webino_Dashboard_Analytics::get_settings();

		if ( is_user_logged_in() ) {
			if ( empty( $settings['record_logged_in'] ) ) {
				return new WP_Error( 'skip', 'skip', array( 'status' => 200 ) );
			}
			$user = wp_get_current_user();
			$roles = is_array( $user->roles ) ? $user->roles : array();
			$exclude = isset( $settings['exclude_roles'] ) && is_array( $settings['exclude_roles'] ) ? $settings['exclude_roles'] : array();
			foreach ( $roles as $role ) {
				if ( in_array( $role, $exclude, true ) ) {
					return new WP_Error( 'skip', 'skip', array( 'status' => 200 ) );
				}
			}
		}

		$ip = Webino_Dashboard_Analytics::get_client_ip();
		if ( self::ip_excluded( $ip, (string) ( $settings['exclude_ips'] ?? '' ) ) ) {
			return new WP_Error( 'skip', 'skip', array( 'status' => 200 ) );
		}

		/**
		 * Allow consent plugins to block tracking.
		 *
		 * @param bool $allowed Default true.
		 */
		if ( ! apply_filters( 'webino_dashboard_analytics_track_allowed', true ) ) {
			return new WP_Error( 'skip', 'skip', array( 'status' => 200 ) );
		}

		return true;
	}

	/**
	 * @param string $ip IP.
	 * @param string $list Newline-separated IPs/patterns.
	 * @return bool
	 */
	private static function ip_excluded( $ip, $list ) {
		$lines = preg_split( '/\r\n|\r|\n/', $list );
		if ( ! is_array( $lines ) ) {
			return false;
		}
		foreach ( $lines as $line ) {
			$line = trim( $line );
			if ( '' === $line ) {
				continue;
			}
			if ( $line === $ip || ( false !== strpos( $ip, $line ) ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param string $uri Request URI path.
	 * @return bool
	 */
	private static function uri_excluded( $uri ) {
		$settings = Webino_Dashboard_Analytics::get_settings();
		$lines    = preg_split( '/\r\n|\r|\n/', (string) ( $settings['exclude_urls'] ?? '' ) );
		if ( ! is_array( $lines ) ) {
			return false;
		}
		foreach ( $lines as $line ) {
			$line = trim( $line );
			if ( '' === $line ) {
				continue;
			}
			if ( 0 === strpos( $uri, $line ) || false !== strpos( $uri, $line ) ) {
				return true;
			}
		}
		return false;
	}
}
