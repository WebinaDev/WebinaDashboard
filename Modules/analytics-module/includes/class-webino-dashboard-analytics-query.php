<?php
/**
 * Analytics read queries for REST/dashboard.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Query layer for analytics reports.
 */
class Webino_Dashboard_Analytics_Query {

	/**
	 * @return bool
	 */
	private static function use_wp_statistics() {
		return class_exists( 'Webino_Dashboard_Analytics_Wp_Statistics', false )
			&& Webino_Dashboard_Analytics_Wp_Statistics::is_active();
	}

	/**
	 * @param int $from Unix timestamp.
	 * @param int $to   Unix timestamp.
	 * @return array{from: string, to: string}
	 */
	public static function date_range( $from, $to ) {
		$from = max( 0, (int) $from );
		$to   = max( $from, (int) $to );
		if ( 0 === $from ) {
			$from = $to - 30 * DAY_IN_SECONDS;
		}
		$tz = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );
		try {
			$from_dt = ( new DateTimeImmutable( '@' . $from ) )->setTimezone( $tz );
			$to_dt   = ( new DateTimeImmutable( '@' . $to ) )->setTimezone( $tz );
			return array(
				'from' => $from_dt->format( 'Y-m-d' ),
				'to'   => $to_dt->format( 'Y-m-d' ),
			);
		} catch ( Exception $e ) {
			return array(
				'from' => gmdate( 'Y-m-d', $from ),
				'to'   => gmdate( 'Y-m-d', $to ),
			);
		}
	}

	/**
	 * Convert site-local calendar days to GMT datetime bounds (hits store GMT).
	 *
	 * @param string $from_day Y-m-d site local.
	 * @param string $to_day   Y-m-d site local.
	 * @return array{0:string,1:string} GMT start/end mysql datetimes.
	 */
	public static function gmt_bounds_for_local_days( $from_day, $to_day ) {
		$tz = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );
		try {
			$start = new DateTimeImmutable( $from_day . ' 00:00:00', $tz );
			$end   = new DateTimeImmutable( $to_day . ' 23:59:59', $tz );
		} catch ( Exception $e ) {
			return array( $from_day . ' 00:00:00', $to_day . ' 23:59:59' );
		}
		$utc = new DateTimeZone( 'UTC' );
		return array(
			$start->setTimezone( $utc )->format( 'Y-m-d H:i:s' ),
			$end->setTimezone( $utc )->format( 'Y-m-d H:i:s' ),
		);
	}

	/**
	 * SQL expression that maps GMT created_at to the site-local calendar day.
	 *
	 * @param string $column Column name (safe literal).
	 * @return string
	 */
	public static function sql_local_day_expr( $column = 'created_at' ) {
		$column = preg_replace( '/[^a-z0-9_]/i', '', (string) $column );
		if ( '' === $column ) {
			$column = 'created_at';
		}
		// Prefer live offset from wp_timezone() so DST matches site calendar days.
		$seconds = (int) round( (float) get_option( 'gmt_offset' ) * HOUR_IN_SECONDS );
		if ( function_exists( 'wp_timezone' ) ) {
			try {
				$now     = new DateTimeImmutable( 'now', wp_timezone() );
				$seconds = (int) $now->getOffset();
			} catch ( Exception $e ) {
				// keep option-based offset.
			}
		}
		if ( 0 === $seconds ) {
			return "DATE({$column})";
		}
		$abs = abs( $seconds );
		if ( $seconds > 0 ) {
			return "DATE(DATE_ADD({$column}, INTERVAL {$abs} SECOND))";
		}
		return "DATE(DATE_SUB({$column}, INTERVAL {$abs} SECOND))";
	}

	/**
	 * Convert a GMT mysql datetime to site-local Y-m-d.
	 *
	 * @param string $gmt_mysql GMT datetime.
	 * @return string
	 */
	public static function local_day_from_gmt( $gmt_mysql ) {
		$tz = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );
		try {
			$dt = new DateTimeImmutable( (string) $gmt_mysql, new DateTimeZone( 'UTC' ) );
			return $dt->setTimezone( $tz )->format( 'Y-m-d' );
		} catch ( Exception $e ) {
			return substr( (string) $gmt_mysql, 0, 10 );
		}
	}

	/**
	 * @param string $from_day Y-m-d.
	 * @param string $to_day   Y-m-d.
	 * @return array<string,mixed>
	 */
	public static function overview( $from_day, $to_day ) {
		if ( self::use_wp_statistics() ) {
			return Webino_Dashboard_Analytics_Wp_Statistics::overview( $from_day, $to_day );
		}
		global $wpdb;
		$totals = Webino_Dashboard_Analytics_Db::table( 'daily_totals' );
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT COALESCE(SUM(visitors),0) AS visitors, COALESCE(SUM(views),0) AS views
				FROM {$totals} WHERE day >= %s AND day <= %s",
				$from_day,
				$to_day
			),
			ARRAY_A
		);

		$visitors = (int) ( $row['visitors'] ?? 0 );
		$views    = (int) ( $row['views'] ?? 0 );

		if ( 0 === $views ) {
			$to_ts   = strtotime( $to_day . ' UTC' );
			$from_ts = strtotime( $from_day . ' UTC' );
			if ( $to_ts && $from_ts && ( $to_ts - $from_ts ) > 90 * DAY_IN_SECONDS ) {
				$from_day = gmdate( 'Y-m-d', $to_ts - 90 * DAY_IN_SECONDS );
			}
			list( $start, $end ) = self::gmt_bounds_for_local_days( $from_day, $to_day );
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
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$series = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT day, visitors, views FROM {$totals} WHERE day >= %s AND day <= %s ORDER BY day ASC",
				$from_day,
				$to_day
			),
			ARRAY_A
		);

		if ( empty( $series ) ) {
			$series = self::series_from_events( $from_day, $to_day );
		}

		$series = self::fill_daily_series( $from_day, $to_day, is_array( $series ) ? $series : array() );

		// Always merge live "today" event counts so overview is not stuck on yesterday-only rollups.
		$today = current_time( 'Y-m-d' );
		if ( $from_day <= $today && $today <= $to_day ) {
			$today_rows = self::series_from_events( $today, $today );
			$today_row  = isset( $today_rows[0] ) && is_array( $today_rows[0] )
				? $today_rows[0]
				: array(
					'day'      => $today,
					'visitors' => 0,
					'views'    => 0,
				);
			foreach ( $series as $i => $row ) {
				if ( (string) ( $row['day'] ?? '' ) === $today ) {
					$series[ $i ] = array(
						'day'      => $today,
						'visitors' => (int) ( $today_row['visitors'] ?? 0 ),
						'views'    => (int) ( $today_row['views'] ?? 0 ),
					);
					break;
				}
			}
			// Re-sum KPIs from the filled series so today is included even when rollups lagged.
			$visitors = 0;
			$views    = 0;
			foreach ( $series as $row ) {
				$visitors += (int) ( $row['visitors'] ?? 0 );
				$views    += (int) ( $row['views'] ?? 0 );
			}
		}

		return array(
			'visitors' => $visitors,
			'views'    => $views,
			'online'   => self::online_count(),
			'series'   => $series,
			'source'   => 'native',
		);
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array<int,array<string,mixed>>
	 */
	private static function series_from_events( $from_day, $to_day ) {
		global $wpdb;
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );
		list( $start, $end ) = self::gmt_bounds_for_local_days( $from_day, $to_day );
		$day_expr = self::sql_local_day_expr( 'created_at' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT {$day_expr} AS day, COUNT(DISTINCT visitor_hash) AS visitors, COUNT(*) AS views
				FROM {$events} WHERE created_at >= %s AND created_at <= %s
				GROUP BY {$day_expr} ORDER BY day ASC",
				$start,
				$end
			),
			ARRAY_A
		);
		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * Count visitors/views for a day range (inclusive).
	 *
	 * @param string $from_day Y-m-d.
	 * @param string $to_day   Y-m-d.
	 * @return array{visitors:int,views:int}
	 */
	public static function count_range( $from_day, $to_day ) {
		if ( self::use_wp_statistics() ) {
			return Webino_Dashboard_Analytics_Wp_Statistics::count_range( $from_day, $to_day );
		}
		global $wpdb;
		$totals = Webino_Dashboard_Analytics_Db::table( 'daily_totals' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT COALESCE(SUM(visitors),0) AS visitors, COALESCE(SUM(views),0) AS views
				FROM {$totals} WHERE day >= %s AND day <= %s",
				$from_day,
				$to_day
			),
			ARRAY_A
		);
		$visitors = (int) ( $row['visitors'] ?? 0 );
		$views    = (int) ( $row['views'] ?? 0 );
		if ( 0 === $views ) {
			$events = Webino_Dashboard_Analytics_Db::table( 'events' );
			list( $start, $end ) = self::gmt_bounds_for_local_days( $from_day, $to_day );
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
		}
		return array(
			'visitors' => $visitors,
			'views'    => $views,
		);
	}

	/**
	 * Percent change vs previous value (null when previous is zero and current > 0).
	 *
	 * @param int $current  Current.
	 * @param int $previous Previous.
	 * @return float|null
	 */
	private static function change_pct( $current, $previous ) {
		$current  = (int) $current;
		$previous = (int) $previous;
		if ( $previous <= 0 ) {
			return $current > 0 ? null : 0.0;
		}
		return round( ( ( $current - $previous ) / $previous ) * 100, 1 );
	}

	/**
	 * Build period row with comparison to immediately preceding equal-length window.
	 *
	 * @param string $id       Period id.
	 * @param string $from_day From Y-m-d.
	 * @param string $to_day   To Y-m-d.
	 * @param bool   $compare  Whether to compute change vs previous period.
	 * @return array<string,mixed>
	 */
	private static function traffic_period_row( $id, $from_day, $to_day, $compare = true ) {
		$cur = self::count_range( $from_day, $to_day );
		$row = array(
			'id'        => $id,
			'from'      => $from_day,
			'to'        => $to_day,
			'visitors'  => $cur['visitors'],
			'views'     => $cur['views'],
			'visitors_change_pct' => null,
			'views_change_pct'    => null,
		);
		if ( ! $compare ) {
			return $row;
		}
		$from_ts = strtotime( $from_day . ' 00:00:00 UTC' );
		$to_ts   = strtotime( $to_day . ' 23:59:59 UTC' );
		if ( ! $from_ts || ! $to_ts ) {
			return $row;
		}
		$span     = max( 1, $to_ts - $from_ts + 1 );
		$prev_to  = $from_ts - 1;
		$prev_from = $prev_to - $span + 1;
		$prev     = self::count_range( gmdate( 'Y-m-d', $prev_from ), gmdate( 'Y-m-d', $prev_to ) );
		$row['visitors_change_pct'] = self::change_pct( $cur['visitors'], $prev['visitors'] );
		$row['views_change_pct']    = self::change_pct( $cur['views'], $prev['views'] );
		return $row;
	}

	/**
	 * First tracked day (cached daily to avoid MIN scan on large events table).
	 *
	 * @param string $today Today Y-m-d (site).
	 * @return string
	 */
	public static function events_first_day( $today ) {
		$key    = 'webino_analytics_events_first_day';
		$cached = get_transient( $key );
		if ( is_string( $cached ) && '' !== $cached && '0000-00-00' !== $cached ) {
			return $cached;
		}

		Webino_Dashboard_Analytics_Db::ensure_tables();
		global $wpdb;
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$min_gmt = (string) $wpdb->get_var( "SELECT MIN(created_at) FROM {$events}" );
		if ( ! $min_gmt || '0000-00-00 00:00:00' === $min_gmt ) {
			$first_day = $today;
		} else {
			$first_day = self::local_day_from_gmt( $min_gmt );
		}
		set_transient( $key, $first_day, DAY_IN_SECONDS );
		return $first_day;
	}

	/**
	 * WP Statistics–style traffic summary for dashboard home.
	 *
	 * @return array<string,mixed>
	 */
	public static function traffic_periods() {
		if ( self::use_wp_statistics() ) {
			return Webino_Dashboard_Analytics_Wp_Statistics::traffic_periods();
		}
		Webino_Dashboard_Analytics_Db::ensure_tables();
		$today     = current_time( 'Y-m-d' );
		$yesterday = gmdate( 'Y-m-d', strtotime( $today . ' -1 day' ) );

		$last7_from = gmdate( 'Y-m-d', strtotime( $today . ' -7 days' ) );
		$last14_from = gmdate( 'Y-m-d', strtotime( $today . ' -14 days' ) );

		$periods = array(
			self::traffic_period_row( 'today', $today, $today ),
			self::traffic_period_row( 'yesterday', $yesterday, $yesterday ),
			self::traffic_period_row( 'last7_excl_today', $last7_from, $yesterday ),
			self::traffic_period_row( 'last14_excl_today', $last14_from, $yesterday ),
		);

		$first_day = self::events_first_day( $today );
		$all = self::traffic_period_row( 'all_time', $first_day, $today, false );
		$highlight = $periods[2];
		$periods[] = $all;
		$chart_from = gmdate( 'Y-m-d', strtotime( $today . ' -29 days' ) );
		$chart_data = self::overview( $chart_from, $today );
		$series     = is_array( $chart_data['series'] ?? null ) ? $chart_data['series'] : array();

		return array(
			'active'    => true,
			'source'    => 'native',
			'online'    => self::online_count(),
			'highlight' => array(
				'visitors'            => (int) $highlight['visitors'],
				'views'               => (int) $highlight['views'],
				'visitors_change_pct' => $highlight['visitors_change_pct'],
				'views_change_pct'    => $highlight['views_change_pct'],
			),
			'periods'   => $periods,
			'all_time'  => $all,
			'chart'     => array(
				'series' => self::fill_daily_series( $chart_from, $today, $series ),
			),
		);
	}

	/**
	 * Zero-fill missing days so home/report charts always have a series.
	 *
	 * @param string                           $from_day Y-m-d.
	 * @param string                           $to_day   Y-m-d.
	 * @param array<int,array<string,mixed>>   $rows     Existing day rows.
	 * @return array<int,array{day:string,visitors:int,views:int}>
	 */
	public static function fill_daily_series( $from_day, $to_day, $rows ) {
		$by_day = array();
		foreach ( (array) $rows as $row ) {
			$day = isset( $row['day'] ) ? (string) $row['day'] : '';
			if ( '' === $day ) {
				continue;
			}
			$by_day[ $day ] = array(
				'day'      => $day,
				'visitors' => (int) ( $row['visitors'] ?? 0 ),
				'views'    => (int) ( $row['views'] ?? 0 ),
			);
		}

		$out    = array();
		$cursor = strtotime( $from_day . ' UTC' );
		$end    = strtotime( $to_day . ' UTC' );
		if ( ! $cursor || ! $end || $cursor > $end ) {
			return array_values( $by_day );
		}
		while ( $cursor <= $end ) {
			$day   = gmdate( 'Y-m-d', $cursor );
			$out[] = isset( $by_day[ $day ] ) ? $by_day[ $day ] : array(
				'day'      => $day,
				'visitors' => 0,
				'views'    => 0,
			);
			$cursor += DAY_IN_SECONDS;
		}
		return $out;
	}

	/**
	 * @return int
	 */
	public static function online_count() {
		if ( self::use_wp_statistics() ) {
			return Webino_Dashboard_Analytics_Wp_Statistics::online_count();
		}
		global $wpdb;
		$settings = Webino_Dashboard_Analytics::get_settings();
		$mins     = max( 1, (int) ( $settings['online_timeout'] ?? 5 ) );
		$cutoff   = gmdate( 'Y-m-d H:i:s', time() - $mins * MINUTE_IN_SECONDS );
		$visitors = Webino_Dashboard_Analytics_Db::table( 'visitors' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$visitors} WHERE last_seen >= %s",
				$cutoff
			)
		);
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @param int    $limit    Limit.
	 * @return array<int,array<string,mixed>>
	 */
	public static function top_visitors( $from_day, $to_day, $limit = 20 ) {
		if ( self::use_wp_statistics() ) {
			return Webino_Dashboard_Analytics_Wp_Statistics::top_visitors( $from_day, $to_day, $limit );
		}
		global $wpdb;
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );
		$visitors = Webino_Dashboard_Analytics_Db::table( 'visitors' );
		list( $start, $end ) = self::gmt_bounds_for_local_days( $from_day, $to_day );
		$limit  = max( 1, min( 100, (int) $limit ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT e.visitor_hash, COUNT(*) AS views, v.first_seen, v.last_seen, v.country
				FROM {$events} e
				LEFT JOIN {$visitors} v ON v.visitor_hash = e.visitor_hash
				WHERE e.created_at >= %s AND e.created_at <= %s
				GROUP BY e.visitor_hash
				ORDER BY views DESC
				LIMIT %d",
				$start,
				$end,
				$limit
			),
			ARRAY_A
		);
		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @param int    $page     Page.
	 * @param int    $per_page Per page.
	 * @param string $search   Search.
	 * @return array{items: array<int,array<string,mixed>>, total: int}
	 */
	public static function top_pages( $from_day, $to_day, $page = 1, $per_page = 20, $search = '' ) {
		if ( self::use_wp_statistics() ) {
			return Webino_Dashboard_Analytics_Wp_Statistics::top_pages( $from_day, $to_day, $page, $per_page, $search );
		}
		global $wpdb;
		$page_d   = Webino_Dashboard_Analytics_Db::table( 'page_daily' );
		$events   = Webino_Dashboard_Analytics_Db::table( 'events' );
		$page     = max( 1, (int) $page );
		$per_page = max( 1, min( 100, (int) $per_page ) );
		$offset   = ( $page - 1 ) * $per_page;
		$search   = trim( (string) $search );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$count = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM (
					SELECT post_id, uri FROM {$page_d}
					WHERE day >= %s AND day <= %s
					GROUP BY post_id, uri
				) t",
				$from_day,
				$to_day
			)
		);

		if ( 0 === $count ) {
			return self::top_pages_from_events( $from_day, $to_day, $page, $per_page, $search );
		}

		$where_search = '';
		$params       = array( $from_day, $to_day );
		if ( '' !== $search ) {
			$where_search = ' AND uri LIKE %s';
			$params[]     = '%' . $wpdb->esc_like( $search ) . '%';
		}
		$params[] = $per_page;
		$params[] = $offset;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT post_id, uri, SUM(views) AS views FROM {$page_d}
				WHERE day >= %s AND day <= %s {$where_search}
				GROUP BY post_id, uri
				ORDER BY views DESC
				LIMIT %d OFFSET %d",
				...$params
			),
			ARRAY_A
		);

		$items = array();
		foreach ( is_array( $rows ) ? $rows : array() as $r ) {
			$items[] = self::format_page_row( $r );
		}

		return array(
			'items' => $items,
			'total' => $count,
		);
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @param int    $page     Page.
	 * @param int    $per_page Per page.
	 * @param string $search   Search.
	 * @return array{items: array<int,array<string,mixed>>, total: int}
	 */
	private static function top_pages_from_events( $from_day, $to_day, $page, $per_page, $search ) {
		global $wpdb;
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );
		list( $start, $end ) = self::gmt_bounds_for_local_days( $from_day, $to_day );
		$offset = ( max( 1, $page ) - 1 ) * $per_page;

		$where = '';
		$params = array( $start, $end );
		if ( '' !== trim( $search ) ) {
			$where    = ' AND uri LIKE %s';
			$params[] = '%' . $wpdb->esc_like( $search ) . '%';
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT post_id, uri, COUNT(*) AS views FROM {$events}
				WHERE created_at >= %s AND created_at <= %s {$where}
				GROUP BY post_id, uri ORDER BY views DESC LIMIT %d OFFSET %d",
				...array_merge( $params, array( $per_page, $offset ) )
			),
			ARRAY_A
		);

		$items = array();
		foreach ( is_array( $rows ) ? $rows : array() as $r ) {
			$items[] = self::format_page_row( $r );
		}

		return array(
			'items' => $items,
			'total' => count( $items ),
		);
	}

	/**
	 * @param array<string,mixed> $r Row.
	 * @return array<string,mixed>
	 */
	private static function format_page_row( $r ) {
		$post_id = (int) ( $r['post_id'] ?? 0 );
		$title   = '';
		if ( $post_id > 0 ) {
			$title = get_the_title( $post_id );
		}
		return array(
			'post_id' => $post_id,
			'uri'     => (string) ( $r['uri'] ?? '' ),
			'title'   => $title ? $title : (string) ( $r['uri'] ?? '' ),
			'views'   => (int) ( $r['views'] ?? 0 ),
		);
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array{categories: array<int,array<string,mixed>>, sources: array<int,array<string,mixed>>}
	 */
	public static function referrers( $from_day, $to_day ) {
		if ( self::use_wp_statistics() ) {
			return self::normalize_referrers(
				Webino_Dashboard_Analytics_Wp_Statistics::referrers( $from_day, $to_day )
			);
		}
		global $wpdb;
		$ref_d = Webino_Dashboard_Analytics_Db::table( 'referrer_daily' );
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$categories = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ref_category AS category, SUM(visits) AS visits FROM {$ref_d}
				WHERE day >= %s AND day <= %s GROUP BY ref_category ORDER BY visits DESC",
				$from_day,
				$to_day
			),
			ARRAY_A
		);

		if ( empty( $categories ) ) {
			list( $start, $end ) = self::gmt_bounds_for_local_days( $from_day, $to_day );
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$categories = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT ref_category AS category, COUNT(*) AS visits FROM {$events}
					WHERE created_at >= %s AND created_at <= %s GROUP BY ref_category ORDER BY visits DESC",
					$start,
					$end
				),
				ARRAY_A
			);
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$sources = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ref_source AS source, ref_category AS category, SUM(visits) AS visits FROM {$ref_d}
				WHERE day >= %s AND day <= %s AND ref_source != ''
				GROUP BY ref_source, ref_category ORDER BY visits DESC LIMIT 50",
				$from_day,
				$to_day
			),
			ARRAY_A
		);

		if ( empty( $sources ) ) {
			list( $start, $end ) = self::gmt_bounds_for_local_days( $from_day, $to_day );
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$sources = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT ref_source AS source, ref_category AS category, COUNT(*) AS visits FROM {$events}
					WHERE created_at >= %s AND created_at <= %s AND ref_source != ''
					GROUP BY ref_source, ref_category ORDER BY visits DESC LIMIT 50",
					$start,
					$end
				),
				ARRAY_A
			);
		}

		return self::normalize_referrers(
			array(
				'categories' => is_array( $categories ) ? $categories : array(),
				'sources'    => is_array( $sources ) ? $sources : array(),
			)
		);
	}

	/**
	 * Soft-normalize referrer payloads so wrong adapter shapes never reach the UI.
	 *
	 * @param mixed $raw Raw payload.
	 * @return array{categories: array<int,array<string,mixed>>, sources: array<int,array<string,mixed>>}
	 */
	private static function normalize_referrers( $raw ) {
		$categories = array();
		$sources    = array();

		if ( is_array( $raw ) && isset( $raw['categories'] ) && isset( $raw['sources'] ) ) {
			$categories = is_array( $raw['categories'] ) ? $raw['categories'] : array();
			$sources    = is_array( $raw['sources'] ) ? $raw['sources'] : array();
		} elseif ( is_array( $raw ) ) {
			$items = isset( $raw['items'] ) && is_array( $raw['items'] ) ? $raw['items'] : $raw;
			if ( is_array( $items ) ) {
				$cat_map = array();
				foreach ( $items as $item ) {
					if ( ! is_array( $item ) ) {
						continue;
					}
					$category = (string) ( $item['category'] ?? 'referral' );
					$source   = (string) ( $item['source'] ?? '' );
					$visits   = (int) ( $item['visits'] ?? $item['views'] ?? 0 );
					if ( $visits <= 0 ) {
						continue;
					}
					if ( ! isset( $cat_map[ $category ] ) ) {
						$cat_map[ $category ] = 0;
					}
					$cat_map[ $category ] += $visits;
					if ( '' !== $source ) {
						$sources[] = array(
							'source'   => $source,
							'category' => $category,
							'visits'   => $visits,
						);
					}
				}
				foreach ( $cat_map as $category => $visits ) {
					$categories[] = array(
						'category' => $category,
						'visits'   => (int) $visits,
					);
				}
			}
		}

		$norm_cats = array();
		foreach ( $categories as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$norm_cats[] = array(
				'category' => (string) ( $row['category'] ?? '' ),
				'visits'   => (int) ( $row['visits'] ?? $row['views'] ?? 0 ),
			);
		}
		$norm_sources = array();
		foreach ( $sources as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$norm_sources[] = array(
				'source'   => (string) ( $row['source'] ?? '' ),
				'category' => (string) ( $row['category'] ?? 'referral' ),
				'visits'   => (int) ( $row['visits'] ?? $row['views'] ?? 0 ),
			);
		}

		return array(
			'categories' => $norm_cats,
			'sources'    => $norm_sources,
		);
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @param string $dim      country|city.
	 * @return array<int,array<string,mixed>>
	 */
	public static function geo( $from_day, $to_day, $dim = 'country' ) {
		if ( self::use_wp_statistics() ) {
			return Webino_Dashboard_Analytics_Wp_Statistics::geo( $from_day, $to_day, $dim );
		}
		global $wpdb;
		$geo_d = Webino_Dashboard_Analytics_Db::table( 'geo_daily' );
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );
		$dim    = 'city' === $dim ? 'city' : 'country';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT dim_value AS label, SUM(views) AS views FROM {$geo_d}
				WHERE day >= %s AND day <= %s AND dim_type = %s AND dim_value != ''
				GROUP BY dim_value ORDER BY views DESC LIMIT 100",
				$from_day,
				$to_day,
				$dim
			),
			ARRAY_A
		);

		if ( ! empty( $rows ) ) {
			return $rows;
		}

		$col = 'country' === $dim ? 'country' : 'city';
		list( $start, $end ) = self::gmt_bounds_for_local_days( $from_day, $to_day );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT {$col} AS label, COUNT(*) AS views FROM {$events}
				WHERE created_at >= %s AND created_at <= %s AND {$col} != ''
				GROUP BY {$col} ORDER BY views DESC LIMIT 100",
				$start,
				$end
			),
			ARRAY_A
		);
		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @param string $dim      browser|os|device.
	 * @return array<int,array<string,mixed>>
	 */
	public static function devices( $from_day, $to_day, $dim = 'browser' ) {
		if ( self::use_wp_statistics() ) {
			return Webino_Dashboard_Analytics_Wp_Statistics::devices( $from_day, $to_day, $dim );
		}
		global $wpdb;
		$dev_d = Webino_Dashboard_Analytics_Db::table( 'device_daily' );
		$events = Webino_Dashboard_Analytics_Db::table( 'events' );
		$allowed = array( 'browser', 'os', 'device' );
		if ( ! in_array( $dim, $allowed, true ) ) {
			$dim = 'browser';
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT dim_value AS label, SUM(views) AS views FROM {$dev_d}
				WHERE day >= %s AND day <= %s AND dim_type = %s
				GROUP BY dim_value ORDER BY views DESC LIMIT 50",
				$from_day,
				$to_day,
				$dim
			),
			ARRAY_A
		);

		if ( ! empty( $rows ) ) {
			return $rows;
		}

		list( $start, $end ) = self::gmt_bounds_for_local_days( $from_day, $to_day );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT {$dim} AS label, COUNT(*) AS views FROM {$events}
				WHERE created_at >= %s AND created_at <= %s AND {$dim} != ''
				GROUP BY {$dim} ORDER BY views DESC LIMIT 50",
				$start,
				$end
			),
			ARRAY_A
		);
		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function online_visitors() {
		if ( self::use_wp_statistics() ) {
			return Webino_Dashboard_Analytics_Wp_Statistics::online_visitors();
		}
		global $wpdb;
		$settings = Webino_Dashboard_Analytics::get_settings();
		$mins     = max( 1, (int) ( $settings['online_timeout'] ?? 5 ) );
		$cutoff   = gmdate( 'Y-m-d H:i:s', time() - $mins * MINUTE_IN_SECONDS );
		$visitors = Webino_Dashboard_Analytics_Db::table( 'visitors' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT visitor_hash, last_seen, hits, country FROM {$visitors}
				WHERE last_seen >= %s ORDER BY last_seen DESC LIMIT 50",
				$cutoff
			),
			ARRAY_A
		);
		return is_array( $rows ) ? $rows : array();
	}
}
