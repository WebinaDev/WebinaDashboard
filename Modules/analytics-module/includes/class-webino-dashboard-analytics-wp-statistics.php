<?php
/**
 * Live read adapter for WP Statistics plugin (source of truth when active).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps WP Statistics Function API / Models into Webino analytics shapes.
 */
class Webino_Dashboard_Analytics_Wp_Statistics {

	/**
	 * @return bool
	 */
	public static function is_active() {
		if ( defined( 'WP_STATISTICS_VERSION' ) ) {
			return true;
		}
		return function_exists( 'wp_statistics_visitor' ) && function_exists( 'wp_statistics_visit' );
	}

	/**
	 * @return string
	 */
	public static function source_id() {
		return 'wp-statistics';
	}

	/**
	 * @param string $time WP Statistics time token.
	 * @return int
	 */
	public static function visitors( $time ) {
		if ( ! function_exists( 'wp_statistics_visitor' ) ) {
			return 0;
		}
		return (int) wp_statistics_visitor( $time );
	}

	/**
	 * @param string $time WP Statistics time token.
	 * @return int
	 */
	public static function views( $time ) {
		if ( ! function_exists( 'wp_statistics_visit' ) ) {
			return 0;
		}
		return (int) wp_statistics_visit( $time );
	}

	/**
	 * @return int
	 */
	public static function online_count() {
		if ( function_exists( 'wp_statistics_useronline' ) ) {
			return (int) wp_statistics_useronline();
		}
		return 0;
	}

	/**
	 * Count visitors/views for a site-local calendar range.
	 *
	 * @param string $from_day Y-m-d.
	 * @param string $to_day   Y-m-d.
	 * @return array{visitors:int,views:int}
	 */
	public static function count_range( $from_day, $to_day ) {
		$from_day = (string) $from_day;
		$to_day   = (string) $to_day;
		$today    = current_time( 'Y-m-d' );

		if ( $from_day === $to_day ) {
			if ( $from_day === $today ) {
				return array(
					'visitors' => self::visitors( 'today' ),
					'views'    => self::views( 'today' ),
				);
			}
			$yesterday = gmdate( 'Y-m-d', strtotime( $today . ' -1 day' ) );
			if ( $from_day === $yesterday ) {
				return array(
					'visitors' => self::visitors( 'yesterday' ),
					'views'    => self::views( 'yesterday' ),
				);
			}
		}

		$model = self::count_via_models( $from_day, $to_day );
		if ( null !== $model ) {
			return $model;
		}

		$sql = self::count_via_sql( $from_day, $to_day );
		if ( null !== $sql ) {
			return $sql;
		}

		// Approximate with relative "-N" windows ending today when range ends today.
		if ( $to_day === $today ) {
			$days = max( 1, (int) ( ( strtotime( $to_day . ' UTC' ) - strtotime( $from_day . ' UTC' ) ) / DAY_IN_SECONDS ) + 1 );
			$token = '-' . $days;
			return array(
				'visitors' => self::visitors( $token ),
				'views'    => self::views( $token ),
			);
		}

		return array( 'visitors' => 0, 'views' => 0 );
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array{visitors:int,views:int}|null
	 */
	private static function count_via_models( $from_day, $to_day ) {
		$date = array(
			'from' => $from_day,
			'to'   => $to_day,
		);
		$views = 0;
		$visitors = 0;
		$ok = false;

		if ( class_exists( '\WP_Statistics\Models\ViewsModel' ) ) {
			try {
				$model = new \WP_Statistics\Models\ViewsModel();
				if ( is_callable( array( $model, 'countViews' ) ) ) {
					$views = (int) $model->countViews( array( 'date' => $date ) );
					$ok    = true;
				}
			} catch ( Exception $e ) {
				$ok = false;
			}
		}
		if ( class_exists( '\WP_Statistics\Models\VisitorsModel' ) ) {
			try {
				$model = new \WP_Statistics\Models\VisitorsModel();
				if ( is_callable( array( $model, 'countVisitors' ) ) ) {
					$visitors = (int) $model->countVisitors( array( 'date' => $date ) );
					$ok       = true;
				} elseif ( is_callable( array( $model, 'count' ) ) ) {
					$visitors = (int) $model->count( array( 'date' => $date ) );
					$ok       = true;
				}
			} catch ( Exception $e ) {
				// keep views if any.
			}
		}

		return $ok ? array( 'visitors' => $visitors, 'views' => $views ) : null;
	}

	/**
	 * Conservative SQL for WP Statistics 14.x style visit/visitor daily rows.
	 *
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array{visitors:int,views:int}|null
	 */
	private static function count_via_sql( $from_day, $to_day ) {
		global $wpdb;
		$visit_table = $wpdb->prefix . 'statistics_visit';
		$visitor_table = $wpdb->prefix . 'statistics_visitor';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$has_visit = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $visit_table ) );
		if ( $has_visit !== $visit_table ) {
			return null;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$views = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COALESCE(SUM(visit),0) FROM {$visit_table} WHERE last_counter >= %s AND last_counter <= %s",
				$from_day,
				$to_day
			)
		);

		$visitors = 0;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$has_visitor = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $visitor_table ) );
		if ( $has_visitor === $visitor_table ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$visitors = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(*) FROM {$visitor_table} WHERE last_counter >= %s AND last_counter <= %s",
					$from_day,
					$to_day
				)
			);
		}

		return array(
			'visitors' => $visitors,
			'views'    => $views,
		);
	}

	/**
	 * Daily series for chart.
	 *
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array<int,array{day:string,visitors:int,views:int}>
	 */
	public static function daily_series( $from_day, $to_day ) {
		global $wpdb;
		$visit_table = $wpdb->prefix . 'statistics_visit';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$has_visit = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $visit_table ) );
		$by_day    = array();

		if ( $has_visit === $visit_table ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$rows = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT last_counter AS day, visit AS views FROM {$visit_table}
					WHERE last_counter >= %s AND last_counter <= %s ORDER BY last_counter ASC",
					$from_day,
					$to_day
				),
				ARRAY_A
			);
			if ( is_array( $rows ) ) {
				foreach ( $rows as $row ) {
					$day = (string) ( $row['day'] ?? '' );
					if ( '' === $day ) {
						continue;
					}
					$by_day[ $day ] = array(
						'day'      => $day,
						'visitors' => 0,
						'views'    => (int) ( $row['views'] ?? 0 ),
					);
				}
			}

			$visitor_table = $wpdb->prefix . 'statistics_visitor';
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$has_visitor = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $visitor_table ) );
			if ( $has_visitor === $visitor_table ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$vrows = $wpdb->get_results(
					$wpdb->prepare(
						"SELECT last_counter AS day, COUNT(*) AS visitors FROM {$visitor_table}
						WHERE last_counter >= %s AND last_counter <= %s GROUP BY last_counter",
						$from_day,
						$to_day
					),
					ARRAY_A
				);
				if ( is_array( $vrows ) ) {
					foreach ( $vrows as $row ) {
						$day = (string) ( $row['day'] ?? '' );
						if ( '' === $day ) {
							continue;
						}
						if ( ! isset( $by_day[ $day ] ) ) {
							$by_day[ $day ] = array(
								'day'      => $day,
								'visitors' => 0,
								'views'    => 0,
							);
						}
						$by_day[ $day ]['visitors'] = (int) ( $row['visitors'] ?? 0 );
					}
				}
			}
		} else {
			// Per-day model counts (slower but version-safe when tables differ).
			$cursor = strtotime( $from_day . ' UTC' );
			$end    = strtotime( $to_day . ' UTC' );
			while ( $cursor && $end && $cursor <= $end ) {
				$day  = gmdate( 'Y-m-d', $cursor );
				$c    = self::count_via_models( $day, $day );
				$by_day[ $day ] = array(
					'day'      => $day,
					'visitors' => $c ? (int) $c['visitors'] : 0,
					'views'    => $c ? (int) $c['views'] : 0,
				);
				$cursor += DAY_IN_SECONDS;
			}
		}

		return Webino_Dashboard_Analytics_Query::fill_daily_series( $from_day, $to_day, array_values( $by_day ) );
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array<string,mixed>
	 */
	public static function overview( $from_day, $to_day ) {
		$counts = self::count_range( $from_day, $to_day );
		return array(
			'visitors' => $counts['visitors'],
			'views'    => $counts['views'],
			'online'   => self::online_count(),
			'series'   => self::daily_series( $from_day, $to_day ),
			'source'   => self::source_id(),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function traffic_periods() {
		$today     = current_time( 'Y-m-d' );
		$yesterday = gmdate( 'Y-m-d', strtotime( $today . ' -1 day' ) );
		$last7_from  = gmdate( 'Y-m-d', strtotime( $today . ' -7 days' ) );
		$last14_from = gmdate( 'Y-m-d', strtotime( $today . ' -14 days' ) );

		$periods = array(
			self::period_row( 'today', $today, $today ),
			self::period_row( 'yesterday', $yesterday, $yesterday ),
			self::period_row( 'last7_excl_today', $last7_from, $yesterday ),
			self::period_row( 'last14_excl_today', $last14_from, $yesterday ),
		);

		$all = self::period_row( 'all_time', '1970-01-01', $today, false );
		$all['visitors'] = self::visitors( 'total' );
		$all['views']    = self::views( 'total' );
		$highlight       = $periods[2];
		$periods[]       = $all;

		$chart_from = gmdate( 'Y-m-d', strtotime( $today . ' -29 days' ) );

		return array(
			'active'    => true,
			'source'    => self::source_id(),
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
				'series' => self::daily_series( $chart_from, $today ),
			),
		);
	}

	/**
	 * @param string $id         Period id.
	 * @param string $from_day   From.
	 * @param string $to_day     To.
	 * @param bool   $compare    Compare previous window.
	 * @return array<string,mixed>
	 */
	private static function period_row( $id, $from_day, $to_day, $compare = true ) {
		$cur = self::count_range( $from_day, $to_day );
		$row = array(
			'id'                  => $id,
			'from'                => $from_day,
			'to'                  => $to_day,
			'visitors'            => $cur['visitors'],
			'views'               => $cur['views'],
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
		$span      = max( 1, $to_ts - $from_ts + 1 );
		$prev_to   = $from_ts - 1;
		$prev_from = $prev_to - $span + 1;
		$prev      = self::count_range( gmdate( 'Y-m-d', $prev_from ), gmdate( 'Y-m-d', $prev_to ) );
		$row['visitors_change_pct'] = self::change_pct( $cur['visitors'], $prev['visitors'] );
		$row['views_change_pct']    = self::change_pct( $cur['views'], $prev['views'] );
		return $row;
	}

	/**
	 * @param int $cur Current.
	 * @param int $prev Previous.
	 * @return float|null
	 */
	private static function change_pct( $cur, $prev ) {
		$cur  = (int) $cur;
		$prev = (int) $prev;
		if ( 0 === $prev ) {
			return $cur > 0 ? 100.0 : null;
		}
		return round( ( ( $cur - $prev ) / $prev ) * 100, 1 );
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
		$page     = max( 1, (int) $page );
		$per_page = max( 1, min( 100, (int) $per_page ) );
		$search   = trim( (string) $search );
		$items    = array();

		if ( function_exists( 'wp_statistics_get_top_pages' ) ) {
			$raw = wp_statistics_get_top_pages( $from_day, $to_day, 200, null );
			$list = array();
			if ( is_array( $raw ) ) {
				// Newer returns [ total?, rows ]; older returns rows.
				if ( isset( $raw[1] ) && is_array( $raw[1] ) ) {
					$list = $raw[1];
				} elseif ( isset( $raw[0] ) && is_array( $raw[0] ) && isset( $raw[0][0] ) && is_string( $raw[0][0] ) ) {
					$list = $raw;
				} elseif ( isset( $raw[0] ) && is_array( $raw[0] ) ) {
					$list = $raw[0];
				}
			}
			foreach ( $list as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$uri   = (string) ( $row[0] ?? $row['uri'] ?? '' );
				$views = (int) ( $row[1] ?? $row['views'] ?? 0 );
				$pid   = (int) ( $row[2] ?? $row['page_id'] ?? $row['id'] ?? 0 );
				$title = (string) ( $row[3] ?? $row['title'] ?? $uri );
				if ( '' !== $search && false === stripos( $uri . ' ' . $title, $search ) ) {
					continue;
				}
				$items[] = array(
					'post_id' => $pid,
					'uri'     => $uri,
					'title'   => $title,
					'views'   => $views,
				);
			}
		}

		$total  = count( $items );
		$offset = ( $page - 1 ) * $per_page;
		$slice  = array_slice( $items, $offset, $per_page );
		return array(
			'items' => $slice,
			'total' => $total,
		);
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array{categories: array<int,array<string,mixed>>, sources: array<int,array<string,mixed>>}
	 */
	public static function referrers( $from_day, $to_day ) {
		$by_source = array();
		$providers = array( 'google', 'bing', 'yahoo', 'duckduckgo', 'yandex' );
		foreach ( $providers as $provider ) {
			if ( ! function_exists( 'wp_statistics_searchengine' ) ) {
				break;
			}
			$time  = self::time_token_for_range( $from_day, $to_day );
			$count = (int) wp_statistics_searchengine( $provider, $time );
			if ( $count <= 0 ) {
				continue;
			}
			$key = 'search|' . $provider;
			$by_source[ $key ] = array(
				'category' => 'search',
				'source'   => $provider,
				'visits'   => $count,
			);
		}

		$sql_sources = self::referrers_via_sql( $from_day, $to_day );
		foreach ( $sql_sources as $row ) {
			$source   = (string) ( $row['source'] ?? '' );
			$category = (string) ( $row['category'] ?? 'referral' );
			$visits   = (int) ( $row['visits'] ?? 0 );
			if ( '' === $source || $visits <= 0 ) {
				continue;
			}
			$key = $category . '|' . $source;
			if ( isset( $by_source[ $key ] ) ) {
				$by_source[ $key ]['visits'] = max( (int) $by_source[ $key ]['visits'], $visits );
			} else {
				$by_source[ $key ] = array(
					'category' => $category,
					'source'   => $source,
					'visits'   => $visits,
				);
			}
		}

		$sources = array_values( $by_source );
		usort(
			$sources,
			static function ( $a, $b ) {
				return (int) $b['visits'] - (int) $a['visits'];
			}
		);
		$sources = array_slice( $sources, 0, 50 );

		$cat_map = array();
		foreach ( $sources as $row ) {
			$cat = (string) ( $row['category'] ?? 'referral' );
			if ( ! isset( $cat_map[ $cat ] ) ) {
				$cat_map[ $cat ] = 0;
			}
			$cat_map[ $cat ] += (int) ( $row['visits'] ?? 0 );
		}
		$categories = array();
		foreach ( $cat_map as $category => $visits ) {
			$categories[] = array(
				'category' => $category,
				'visits'   => (int) $visits,
			);
		}
		usort(
			$categories,
			static function ( $a, $b ) {
				return (int) $b['visits'] - (int) $a['visits'];
			}
		);

		return array(
			'categories' => $categories,
			'sources'    => $sources,
		);
	}

	/**
	 * Aggregate referrers from WP Statistics visitor.referred column when present.
	 *
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array<int,array{category:string,source:string,visits:int}>
	 */
	private static function referrers_via_sql( $from_day, $to_day ) {
		global $wpdb;
		$table = $wpdb->prefix . 'statistics_visitor';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) {
			return array();
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$cols = $wpdb->get_col( "SHOW COLUMNS FROM {$table}" );
		if ( ! is_array( $cols ) || ! in_array( 'referred', $cols, true ) || ! in_array( 'last_counter', $cols, true ) ) {
			return array();
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT referred AS referred, COUNT(*) AS visits
				FROM {$table}
				WHERE last_counter >= %s AND last_counter <= %s
				GROUP BY referred
				ORDER BY visits DESC
				LIMIT 200",
				$from_day,
				$to_day
			),
			ARRAY_A
		);
		if ( ! is_array( $rows ) ) {
			return array();
		}

		$out = array();
		foreach ( $rows as $row ) {
			$classified = self::classify_referred( (string) ( $row['referred'] ?? '' ) );
			$key        = $classified['category'] . '|' . $classified['source'];
			if ( ! isset( $out[ $key ] ) ) {
				$out[ $key ] = array(
					'category' => $classified['category'],
					'source'   => $classified['source'],
					'visits'   => 0,
				);
			}
			$out[ $key ]['visits'] += (int) ( $row['visits'] ?? 0 );
		}
		return array_values( $out );
	}

	/**
	 * @param string $referred Raw referrer URL or empty.
	 * @return array{category:string,source:string}
	 */
	private static function classify_referred( $referred ) {
		$referred = trim( (string) $referred );
		if ( '' === $referred || '0' === $referred ) {
			return array(
				'category' => 'direct',
				'source'   => 'direct',
			);
		}
		$host = '';
		$parts = wp_parse_url( $referred );
		if ( is_array( $parts ) && ! empty( $parts['host'] ) ) {
			$host = strtolower( (string) $parts['host'] );
		} else {
			$host = strtolower( preg_replace( '#^https?://#i', '', $referred ) );
			$host = preg_replace( '#/.*$#', '', $host );
		}
		$host = preg_replace( '/^www\./', '', (string) $host );

		$search = array(
			'google.'     => 'google',
			'bing.'       => 'bing',
			'yahoo.'      => 'yahoo',
			'duckduckgo.' => 'duckduckgo',
			'yandex.'     => 'yandex',
			'baidu.'      => 'baidu',
		);
		foreach ( $search as $needle => $label ) {
			if ( false !== strpos( $host, $needle ) ) {
				return array(
					'category' => 'search',
					'source'   => $label,
				);
			}
		}

		$social = array(
			'facebook.'  => 'facebook',
			'fb.'        => 'facebook',
			'instagram.' => 'instagram',
			'twitter.'   => 'twitter',
			'x.com'      => 'twitter',
			't.me'       => 'telegram',
			'telegram.'  => 'telegram',
			'linkedin.'  => 'linkedin',
			'pinterest.' => 'pinterest',
			'reddit.'    => 'reddit',
			'youtube.'   => 'youtube',
			'tiktok.'    => 'tiktok',
		);
		foreach ( $social as $needle => $label ) {
			if ( false !== strpos( $host, $needle ) || $host === $needle ) {
				return array(
					'category' => 'social',
					'source'   => $label,
				);
			}
		}

		$source = '' !== $host ? $host : 'referral';
		return array(
			'category' => 'referral',
			'source'   => $source,
		);
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return string
	 */
	private static function time_token_for_range( $from_day, $to_day ) {
		$today = current_time( 'Y-m-d' );
		if ( $from_day === $to_day && $from_day === $today ) {
			return 'today';
		}
		$yesterday = gmdate( 'Y-m-d', strtotime( $today . ' -1 day' ) );
		if ( $from_day === $to_day && $from_day === $yesterday ) {
			return 'yesterday';
		}
		$days = max( 1, (int) ( ( strtotime( $to_day . ' UTC' ) - strtotime( $from_day . ' UTC' ) ) / DAY_IN_SECONDS ) + 1 );
		return '-' . $days;
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @param string $dim      browser|os|device.
	 * @return array<int,array<string,mixed>>
	 */
	public static function devices( $from_day, $to_day, $dim = 'browser' ) {
		$items = array();
		$time  = self::time_token_for_range( $from_day, $to_day );
		if ( 'os' === $dim && function_exists( 'wp_statistics_platform_list' ) && function_exists( 'wp_statistics_platform' ) ) {
			$list = wp_statistics_platform_list();
			if ( is_array( $list ) ) {
				foreach ( $list as $platform ) {
					$platform = (string) $platform;
					$items[]  = array(
						'label' => $platform,
						'views' => (int) wp_statistics_platform( $platform ),
					);
				}
			}
		} elseif ( function_exists( 'wp_statistics_ua_list' ) && function_exists( 'wp_statistics_useragent' ) ) {
			$list = wp_statistics_ua_list();
			if ( is_array( $list ) ) {
				foreach ( $list as $ua ) {
					$ua      = (string) $ua;
					$items[] = array(
						'label' => $ua,
						'views' => (int) wp_statistics_useragent( $ua ),
					);
				}
			}
		}
		usort(
			$items,
			static function ( $a, $b ) {
				return (int) $b['views'] - (int) $a['views'];
			}
		);
		return array_slice( $items, 0, 50 );
	}

	/**
	 * Geo from visitor.location / city columns when present.
	 *
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @param string $dim      country|city.
	 * @return array<int,array<string,mixed>>
	 */
	public static function geo( $from_day, $to_day, $dim = 'country' ) {
		global $wpdb;
		$dim   = 'city' === $dim ? 'city' : 'country';
		$table = $wpdb->prefix . 'statistics_visitor';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) {
			return array();
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$cols = $wpdb->get_col( "SHOW COLUMNS FROM {$table}" );
		if ( ! is_array( $cols ) || ! in_array( 'last_counter', $cols, true ) ) {
			return array();
		}

		$col = null;
		if ( 'city' === $dim ) {
			foreach ( array( 'city', 'region' ) as $candidate ) {
				if ( in_array( $candidate, $cols, true ) ) {
					$col = $candidate;
					break;
				}
			}
		} else {
			foreach ( array( 'location', 'country', 'country_code' ) as $candidate ) {
				if ( in_array( $candidate, $cols, true ) ) {
					$col = $candidate;
					break;
				}
			}
		}
		if ( null === $col ) {
			return array();
		}

		$hits_expr = in_array( 'hits', $cols, true ) ? 'SUM(hits)' : 'COUNT(*)';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT {$col} AS label, {$hits_expr} AS views
				FROM {$table}
				WHERE last_counter >= %s AND last_counter <= %s AND {$col} IS NOT NULL AND {$col} != '' AND {$col} != '000'
				GROUP BY {$col}
				ORDER BY views DESC
				LIMIT 100",
				$from_day,
				$to_day
			),
			ARRAY_A
		);
		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * Online visitors from useronline table / helper when available.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function online_visitors() {
		global $wpdb;
		$table = $wpdb->prefix . 'statistics_useronline';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) === $table ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$cols = $wpdb->get_col( "SHOW COLUMNS FROM {$table}" );
			$cols = is_array( $cols ) ? $cols : array();
			$ip_col = in_array( 'ip', $cols, true ) ? 'ip' : ( in_array( 'IP', $cols, true ) ? 'IP' : null );
			$ts_col = in_array( 'timestamp', $cols, true ) ? 'timestamp' : ( in_array( 'created', $cols, true ) ? 'created' : null );
			$loc_col = in_array( 'location', $cols, true ) ? 'location' : null;
			$hits_col = in_array( 'hits', $cols, true ) ? 'hits' : null;

			if ( $ip_col && $ts_col ) {
				$select = "{$ip_col} AS visitor_hash, {$ts_col} AS last_seen";
				$select .= $hits_col ? ", {$hits_col} AS hits" : ', 1 AS hits';
				$select .= $loc_col ? ", {$loc_col} AS country" : ", '' AS country";
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$rows = $wpdb->get_results(
					"SELECT {$select} FROM {$table} ORDER BY {$ts_col} DESC LIMIT 50",
					ARRAY_A
				);
				if ( is_array( $rows ) ) {
					$out = array();
					foreach ( $rows as $row ) {
						$hash = (string) ( $row['visitor_hash'] ?? '' );
						if ( '' === $hash ) {
							continue;
						}
						$last = (string) ( $row['last_seen'] ?? '' );
						if ( is_numeric( $last ) ) {
							$last = gmdate( 'Y-m-d H:i:s', (int) $last );
						}
						$out[] = array(
							'visitor_hash' => substr( hash( 'sha256', $hash ), 0, 32 ),
							'last_seen'    => $last,
							'hits'         => (int) ( $row['hits'] ?? 1 ),
							'country'      => (string) ( $row['country'] ?? '' ),
						);
					}
					return $out;
				}
			}
		}

		return array();
	}

	/**
	 * Top visitors from statistics_visitor for date range.
	 *
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @param int    $limit    Limit.
	 * @return array<int,array<string,mixed>>
	 */
	public static function top_visitors( $from_day, $to_day, $limit = 20 ) {
		global $wpdb;
		$limit = max( 1, min( 100, (int) $limit ) );
		$table = $wpdb->prefix . 'statistics_visitor';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) {
			return array();
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$cols = $wpdb->get_col( "SHOW COLUMNS FROM {$table}" );
		$cols = is_array( $cols ) ? $cols : array();
		if ( ! in_array( 'last_counter', $cols, true ) ) {
			return array();
		}

		$ip_col  = in_array( 'ip', $cols, true ) ? 'ip' : ( in_array( 'IP', $cols, true ) ? 'IP' : null );
		$hits_col = in_array( 'hits', $cols, true ) ? 'hits' : null;
		$loc_col = in_array( 'location', $cols, true ) ? 'location' : ( in_array( 'country', $cols, true ) ? 'country' : null );

		if ( ! $ip_col ) {
			return array();
		}

		$hits_select = $hits_col ? "SUM({$hits_col}) AS views" : 'COUNT(*) AS views';
		$loc_select  = $loc_col ? "MAX({$loc_col}) AS country" : "'' AS country";

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT {$ip_col} AS raw_ip, {$hits_select}, MAX(last_counter) AS last_seen, {$loc_select}
				FROM {$table}
				WHERE last_counter >= %s AND last_counter <= %s
				GROUP BY {$ip_col}
				ORDER BY views DESC
				LIMIT %d",
				$from_day,
				$to_day,
				$limit
			),
			ARRAY_A
		);
		if ( ! is_array( $rows ) ) {
			return array();
		}

		$out = array();
		foreach ( $rows as $row ) {
			$raw = (string) ( $row['raw_ip'] ?? '' );
			if ( '' === $raw ) {
				continue;
			}
			$out[] = array(
				'visitor_hash' => substr( hash( 'sha256', $raw ), 0, 32 ),
				'views'        => (int) ( $row['views'] ?? 0 ),
				'last_seen'    => (string) ( $row['last_seen'] ?? '' ),
				'country'      => (string) ( $row['country'] ?? '' ),
			);
		}
		return $out;
	}
}
