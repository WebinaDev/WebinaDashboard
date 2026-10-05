<?php
/**
 * Daily rollup and retention purge.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cron jobs for analytics aggregates.
 */
class Webino_Dashboard_Analytics_Cron {

	/**
	 * @return void
	 */
	public static function init() {
		add_action( self::hook(), array( __CLASS__, 'run_daily' ) );
		add_action( 'init', array( __CLASS__, 'schedule' ) );
	}

	/**
	 * @return string
	 */
	public static function hook() {
		return Webino_Dashboard_Analytics::CRON_HOOK;
	}

	/**
	 * @return void
	 */
	public static function schedule() {
		if ( ! wp_next_scheduled( self::hook() ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', self::hook() );
		}
	}

	/**
	 * @return void
	 */
	public static function run_daily() {
		$yesterday = current_time( 'Y-m-d' );
		$today     = current_time( 'Y-m-d' );
		try {
			$tz  = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );
			$dt  = new DateTimeImmutable( 'now', $tz );
			$today     = $dt->format( 'Y-m-d' );
			$yesterday = $dt->modify( '-1 day' )->format( 'Y-m-d' );
		} catch ( Exception $e ) {
			$today     = gmdate( 'Y-m-d' );
			$yesterday = gmdate( 'Y-m-d', strtotime( '-1 day' ) );
		}
		self::rollup_day( $yesterday );
		self::rollup_day( $today );
		self::purge_old_events();
	}

	/**
	 * Rebuild aggregates for a site-local calendar day from raw events.
	 *
	 * @param string $day Y-m-d site local.
	 * @return void
	 */
	public static function rollup_day( $day ) {
		global $wpdb;

		$events = Webino_Dashboard_Analytics_Db::table( 'events' );
		$totals = Webino_Dashboard_Analytics_Db::table( 'daily_totals' );
		$page_d = Webino_Dashboard_Analytics_Db::table( 'page_daily' );
		$ref_d  = Webino_Dashboard_Analytics_Db::table( 'referrer_daily' );
		$dev_d  = Webino_Dashboard_Analytics_Db::table( 'device_daily' );
		$geo_d  = Webino_Dashboard_Analytics_Db::table( 'geo_daily' );

		list( $start, $end ) = Webino_Dashboard_Analytics_Query::gmt_bounds_for_local_days( $day, $day );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$views = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$events} WHERE created_at >= %s AND created_at <= %s",
				$start,
				$end
			)
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$visitors = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(DISTINCT visitor_hash) FROM {$events} WHERE created_at >= %s AND created_at <= %s",
				$start,
				$end
			)
		);

		$sessions     = 0;
		$bounces      = 0;
		$duration_sum = 0;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$ev_cols = $wpdb->get_col( "SHOW COLUMNS FROM {$events}", 0 );
		if ( is_array( $ev_cols ) && in_array( 'session_id', $ev_cols, true ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$sessions = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(DISTINCT session_id) FROM {$events}
					WHERE created_at >= %s AND created_at <= %s AND session_id != ''",
					$start,
					$end
				)
			);
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$bounces = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(*) FROM {$events}
					WHERE created_at >= %s AND created_at <= %s AND is_bounce = 1 AND is_exit = 1",
					$start,
					$end
				)
			);
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$duration_sum = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COALESCE(SUM(duration_ms),0) FROM {$events}
					WHERE created_at >= %s AND created_at <= %s AND is_exit = 1",
					$start,
					$end
				)
			);
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->replace(
			$totals,
			array(
				'day'             => $day,
				'visitors'        => $visitors,
				'views'           => $views,
				'sessions'        => $sessions,
				'bounces'         => $bounces,
				'duration_sum_ms' => $duration_sum,
			),
			array( '%s', '%d', '%d', '%d', '%d', '%d' )
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$page_d} WHERE day = %s", $day ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$page_d} (day, post_id, uri, views)
				SELECT %s, post_id, uri, COUNT(*) FROM {$events}
				WHERE created_at >= %s AND created_at <= %s
				GROUP BY post_id, uri",
				$day,
				$start,
				$end
			)
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$ref_d} WHERE day = %s", $day ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$ref_d} (day, ref_category, ref_source, visits)
				SELECT %s, ref_category, ref_source, COUNT(*) FROM {$events}
				WHERE created_at >= %s AND created_at <= %s
				GROUP BY ref_category, ref_source",
				$day,
				$start,
				$end
			)
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$dev_d} WHERE day = %s", $day ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$dev_d} (day, dim_type, dim_value, views)
				SELECT %s, 'browser', browser, COUNT(*) FROM {$events}
				WHERE created_at >= %s AND created_at <= %s GROUP BY browser",
				$day,
				$start,
				$end
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$dev_d} (day, dim_type, dim_value, views)
				SELECT %s, 'os', os, COUNT(*) FROM {$events}
				WHERE created_at >= %s AND created_at <= %s GROUP BY os",
				$day,
				$start,
				$end
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$dev_d} (day, dim_type, dim_value, views)
				SELECT %s, 'device', device, COUNT(*) FROM {$events}
				WHERE created_at >= %s AND created_at <= %s GROUP BY device",
				$day,
				$start,
				$end
			)
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$geo_d} WHERE day = %s", $day ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$geo_d} (day, dim_type, dim_value, views)
				SELECT %s, 'country', country, COUNT(*) FROM {$events}
				WHERE created_at >= %s AND created_at <= %s AND country != '' GROUP BY country",
				$day,
				$start,
				$end
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$geo_d} (day, dim_type, dim_value, views)
				SELECT %s, 'city', city, COUNT(*) FROM {$events}
				WHERE created_at >= %s AND created_at <= %s AND city != '' GROUP BY city",
				$day,
				$start,
				$end
			)
		);
	}

	/**
	 * @return void
	 */
	public static function purge_old_events() {
		global $wpdb;
		$settings = Webino_Dashboard_Analytics::get_settings();
		$days     = max( 7, (int) ( $settings['retention_days'] ?? 90 ) );
		$cutoff   = gmdate( 'Y-m-d H:i:s', time() - $days * DAY_IN_SECONDS );
		$events   = Webino_Dashboard_Analytics_Db::table( 'events' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$events} WHERE created_at < %s", $cutoff ) );
	}

	/**
	 * Rebuild all daily aggregates from events (optimization action).
	 *
	 * @return int Days processed.
	 */
	public static function rebuild_all() {
		global $wpdb;
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );
		$day_expr = Webino_Dashboard_Analytics_Query::sql_local_day_expr( 'created_at' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$days = $wpdb->get_col( "SELECT DISTINCT {$day_expr} AS d FROM {$events} ORDER BY d ASC" );
		if ( ! is_array( $days ) ) {
			return 0;
		}
		foreach ( $days as $day ) {
			if ( ! $day || '0000-00-00' === $day ) {
				continue;
			}
			self::rollup_day( (string) $day );
		}
		return count( $days );
	}
}
