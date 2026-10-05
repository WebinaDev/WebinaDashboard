<?php
/**
 * Aggregate KPI payloads for analytics commerce/compare/seo/support/content panels.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * KPI query helpers.
 */
final class Webino_Dashboard_Analytics_Kpis {

	/**
	 * Calendar month bounds as Y-m-d + unix timestamps (site timezone).
	 * Jalali for fa* dashboard locale; Gregorian otherwise.
	 *
	 * @param int $offset_months 0 = this month, -1 = previous month.
	 * @return array{from:string,to:string,from_ts:int,to_ts:int,label:string}
	 */
	public static function calendar_month_bounds( $offset_months = 0 ) {
		$tz = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );

		if ( class_exists( 'Webino_Dashboard_Locale', false ) ) {
			$b = Webino_Dashboard_Locale::calendar_month_bounds_offset( (int) $offset_months );
			$from = ( new DateTimeImmutable( '@' . (int) $b['from_ts'] ) )->setTimezone( $tz );
			$to   = ( new DateTimeImmutable( '@' . (int) $b['to_ts'] ) )->setTimezone( $tz );
			return array(
				'from'    => $from->format( 'Y-m-d' ),
				'to'      => $to->format( 'Y-m-d' ),
				'from_ts' => (int) $b['from_ts'],
				'to_ts'   => (int) $b['to_ts'],
				'label'   => (string) $b['label'],
			);
		}

		try {
			$now    = new DateTimeImmutable( 'now', $tz );
			$cursor = $now->modify( (int) $offset_months . ' months' );
			$start  = $cursor->modify( 'first day of this month' )->setTime( 0, 0, 0 );
			$end    = $cursor->modify( 'last day of this month' )->setTime( 23, 59, 59 );
			if ( 0 === (int) $offset_months && $now < $end ) {
				$end = $now;
			}
		} catch ( Exception $e ) {
			$from_ts = strtotime( gmdate( 'Y-m-01 00:00:00' ) );
			$to_ts   = time();
			return array(
				'from'    => gmdate( 'Y-m-d', $from_ts ),
				'to'      => gmdate( 'Y-m-d', $to_ts ),
				'from_ts' => (int) $from_ts,
				'to_ts'   => (int) $to_ts,
				'label'   => gmdate( 'F Y', $from_ts ),
			);
		}

		return array(
			'from'    => $start->format( 'Y-m-d' ),
			'to'      => $end->format( 'Y-m-d' ),
			'from_ts' => (int) $start->getTimestamp(),
			'to_ts'   => (int) $end->getTimestamp(),
			'label'   => $start->format( 'F Y' ),
		);
	}

	/**
	 * Current + previous windows for MoM compare/summary.
	 * With explicit days: previous = equal-length window ending before current start.
	 * Without: locale calendar this month vs previous month.
	 *
	 * @param string|null $from_day Optional Y-m-d.
	 * @param string|null $to_day   Optional Y-m-d.
	 * @return array{current:array{from:string,to:string,from_ts:int,to_ts:int,label:string},previous:array{from:string,to:string,from_ts:int,to_ts:int,label:string}}
	 */
	public static function period_pair( $from_day = null, $to_day = null ) {
		$tz = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );

		if (
			is_string( $from_day ) && is_string( $to_day )
			&& preg_match( '/^\d{4}-\d{2}-\d{2}$/', $from_day )
			&& preg_match( '/^\d{4}-\d{2}-\d{2}$/', $to_day )
		) {
			list( $from_ts, $to_ts ) = self::day_range_to_ts( $from_day, $to_day );
			if ( $to_ts < $from_ts ) {
				$tmp     = $from_ts;
				$from_ts = $to_ts;
				$to_ts   = $tmp;
				$tmp_d   = $from_day;
				$from_day = $to_day;
				$to_day   = $tmp_d;
			}
			$duration = max( 0, $to_ts - $from_ts );
			$prev_to  = $from_ts - 1;
			$prev_from = $prev_to - $duration;
			$prev_from_dt = ( new DateTimeImmutable( '@' . $prev_from ) )->setTimezone( $tz );
			$prev_to_dt   = ( new DateTimeImmutable( '@' . $prev_to ) )->setTimezone( $tz );
			$cur_from_dt  = ( new DateTimeImmutable( '@' . $from_ts ) )->setTimezone( $tz );
			$cur_to_dt    = ( new DateTimeImmutable( '@' . $to_ts ) )->setTimezone( $tz );

			return array(
				'current'  => array(
					'from'    => $from_day,
					'to'      => $to_day,
					'from_ts' => $from_ts,
					'to_ts'   => $to_ts,
					'label'   => self::format_period_label( $cur_from_dt, $cur_to_dt ),
				),
				'previous' => array(
					'from'    => $prev_from_dt->format( 'Y-m-d' ),
					'to'      => $prev_to_dt->format( 'Y-m-d' ),
					'from_ts' => $prev_from,
					'to_ts'   => $prev_to,
					'label'   => self::format_period_label( $prev_from_dt, $prev_to_dt ),
				),
			);
		}

		return array(
			'current'  => self::calendar_month_bounds( 0 ),
			'previous' => self::calendar_month_bounds( -1 ),
		);
	}

	/**
	 * @param DateTimeImmutable $from From.
	 * @param DateTimeImmutable $to   To.
	 * @return string
	 */
	private static function format_period_label( DateTimeImmutable $from, DateTimeImmutable $to ) {
		if ( class_exists( 'Webino_Dashboard_Locale', false ) ) {
			$locale = Webino_Dashboard_Locale::resolve_locale();
			if ( Webino_Dashboard_Locale::is_jalali_locale( $locale ) ) {
				$a = Webino_Dashboard_Locale::format_jalali_date_label(
					(int) $from->format( 'Y' ),
					(int) $from->format( 'n' ),
					(int) $from->format( 'j' )
				);
				$b = Webino_Dashboard_Locale::format_jalali_date_label(
					(int) $to->format( 'Y' ),
					(int) $to->format( 'n' ),
					(int) $to->format( 'j' )
				);
				return $a === $b ? $a : ( $a . ' – ' . $b );
			}
		}
		$a = $from->format( 'Y-m-d' );
		$b = $to->format( 'Y-m-d' );
		return $a === $b ? $a : ( $a . ' – ' . $b );
	}

	/**
	 * @param int $a Current.
	 * @param int $b Previous.
	 * @return float|null
	 */
	public static function change_pct( $a, $b ) {
		$a = (float) $a;
		$b = (float) $b;
		if ( 0.0 === $b ) {
			return $a > 0 ? 100.0 : null;
		}
		return round( ( ( $a - $b ) / $b ) * 100, 1 );
	}

	/**
	 * Commerce KPIs for a day range (Y-m-d), with prior equal window comparison.
	 *
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array<string,mixed>
	 */
	public static function commerce( $from_day, $to_day ) {
		list( $from_ts, $to_ts ) = self::day_range_to_ts( $from_day, $to_day );
		$statuses = class_exists( 'Webino_Dashboard_Order_Reports', false )
			? Webino_Dashboard_Order_Reports::default_statuses()
			: array( 'processing', 'completed' );

		$report = array();
		$prev   = array();
		if ( class_exists( 'Webino_Dashboard_Order_Reports', false ) && function_exists( 'wc_get_orders' ) ) {
			$report = Webino_Dashboard_Order_Reports::build_report( $from_ts, $to_ts, 'day', $statuses );
			list( $p_from, $p_to ) = Webino_Dashboard_Order_Reports::compare_range( $from_ts, $to_ts );
			$prev = Webino_Dashboard_Order_Reports::build_report( $p_from, $p_to, 'day', $statuses );
		}

		$visitors = (int) ( Webino_Dashboard_Analytics_Query::count_range( $from_day, $to_day )['visitors'] ?? 0 );
		$sum      = ( isset( $report['summary'] ) && is_array( $report['summary'] ) ) ? $report['summary'] : $report;
		$psum     = ( isset( $prev['summary'] ) && is_array( $prev['summary'] ) ) ? $prev['summary'] : $prev;

		$order_count = (int) ( $sum['order_count'] ?? 0 );
		$revenue     = (float) ( $sum['revenue'] ?? 0 );
		$aov         = (float) ( $sum['avg_order_value'] ?? ( $order_count > 0 ? $revenue / $order_count : 0 ) );
		$new_c       = (int) ( $sum['new_customers'] ?? 0 );
		$ret_c       = (int) ( $sum['returning_customers'] ?? 0 );

		$conversion = $visitors > 0 ? round( ( $order_count / $visitors ) * 100, 2 ) : null;

		$channels = self::bucket_sales_channels( isset( $report['by_utm_source'] ) ? $report['by_utm_source'] : array(), isset( $report['by_source'] ) ? $report['by_source'] : array() );

		$prev_orders = (int) ( $psum['order_count'] ?? 0 );
		$prev_rev    = (float) ( $psum['revenue'] ?? 0 );

		return array(
			'from'                 => $from_day,
			'to'                   => $to_day,
			'source'               => Webino_Dashboard_Analytics::data_source(),
			'order_count'          => $order_count,
			'revenue'              => $revenue,
			'avg_order_value'      => $aov,
			'currency'             => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRT',
			'visitors'             => $visitors,
			'conversion_rate_pct'  => $conversion,
			'sales_site'           => $channels['site'],
			'sales_instagram'      => $channels['instagram'],
			'sales_other'          => $channels['other'],
			'new_customers'        => $new_c,
			'returning_customers'  => $ret_c,
			'compare'              => array(
				'order_count_pct' => self::change_pct( $order_count, $prev_orders ),
				'revenue_pct'     => self::change_pct( $revenue, $prev_rev ),
				'aov_pct'         => self::change_pct( $aov, (float) ( $psum['avg_order_value'] ?? 0 ) ),
				'new_customers_pct' => self::change_pct( $new_c, (int) ( $psum['new_customers'] ?? 0 ) ),
				'returning_customers_pct' => self::change_pct( $ret_c, (int) ( $psum['returning_customers'] ?? 0 ) ),
			),
			'by_utm_source'        => array_slice( is_array( $report['by_utm_source'] ?? null ) ? $report['by_utm_source'] : array(), 0, 12 ),
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $by_utm UTM rows.
	 * @param array<int,array<string,mixed>> $by_source Source rows.
	 * @return array{site:float,instagram:float,other:float}
	 */
	private static function bucket_sales_channels( $by_utm, $by_source ) {
		$site = 0.0;
		$ig   = 0.0;
		$other = 0.0;

		$ig_aliases = array( 'instagram', 'ig', 'ig.me' );
		$site_aliases = array( '(direct/none)', 'direct', 'none', 'organic', 'google', 'bing', 'yahoo', '' );

		foreach ( (array) $by_utm as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$key = strtolower( trim( (string) ( $row['key'] ?? $row['source'] ?? $row['label'] ?? '' ) ) );
			$rev = (float) ( $row['revenue'] ?? 0 );
			if ( in_array( $key, $ig_aliases, true ) ) {
				$ig += $rev;
			} elseif ( in_array( $key, $site_aliases, true ) || false !== strpos( $key, 'google' ) ) {
				$site += $rev;
			} else {
				$other += $rev;
			}
		}

		// Marketplace-heavy sources from by_source count as other if not already attributed.
		foreach ( (array) $by_source as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$key = strtolower( (string) ( $row['key'] ?? $row['source'] ?? $row['label'] ?? '' ) );
			$rev = (float) ( $row['revenue'] ?? 0 );
			if ( '' === $key ) {
				continue;
			}
			if ( false !== strpos( $key, 'instagram' ) || 'ig' === $key ) {
				// already counted via utm preferably; avoid double-count if utm empty.
				if ( $ig <= 0 ) {
					$ig += $rev;
				}
			}
		}

		return array(
			'site'      => round( $site, 2 ),
			'instagram' => round( $ig, 2 ),
			'other'     => round( $other, 2 ),
		);
	}

	/**
	 * Month-over-month traffic + conversion comparison.
	 *
	 * @param string|null $from_day Optional Y-m-d current window start.
	 * @param string|null $to_day   Optional Y-m-d current window end.
	 * @return array<string,mixed>
	 */
	public static function compare( $from_day = null, $to_day = null ) {
		$pair = self::period_pair( $from_day, $to_day );
		$cur  = $pair['current'];
		$prev = $pair['previous'];

		$cur_counts  = Webino_Dashboard_Analytics_Query::count_range( $cur['from'], $cur['to'] );
		$prev_counts = Webino_Dashboard_Analytics_Query::count_range( $prev['from'], $prev['to'] );

		$session_cur  = self::session_stats( $cur['from'], $cur['to'] );
		$session_prev = self::session_stats( $prev['from'], $prev['to'] );

		$refs_cur  = Webino_Dashboard_Analytics_Query::referrers( $cur['from'], $cur['to'] );
		$pages_cur = Webino_Dashboard_Analytics_Query::top_pages( $cur['from'], $cur['to'], 1, 3, '' );

		$commerce_cur  = self::commerce( $cur['from'], $cur['to'] );
		$commerce_prev = self::commerce( $prev['from'], $prev['to'] );

		$top_sources = array();
		foreach ( array_slice( (array) ( $refs_cur['sources'] ?? array() ), 0, 3 ) as $s ) {
			$top_sources[] = (string) ( $s['source'] ?? '' );
		}
		$top_pages = array();
		foreach ( (array) ( $pages_cur['items'] ?? array() ) as $p ) {
			$top_pages[] = (string) ( $p['title'] ?? $p['uri'] ?? '' );
		}

		$rows = array(
			self::compare_row( 'visitors', (int) $cur_counts['visitors'], (int) $prev_counts['visitors'] ),
			self::compare_row( 'views', (int) $cur_counts['views'], (int) $prev_counts['views'] ),
			self::compare_row(
				'avg_duration_ms',
				$session_cur['avg_duration_ms'],
				$session_prev['avg_duration_ms'],
				! $session_cur['has_data']
			),
			self::compare_row(
				'bounce_rate_pct',
				$session_cur['bounce_rate_pct'],
				$session_prev['bounce_rate_pct'],
				! $session_cur['has_data']
			),
			array(
				'id'         => 'top_sources',
				'current'    => implode( ' · ', array_filter( $top_sources ) ),
				'previous'   => '—',
				'change_pct' => null,
				'pending'    => empty( $top_sources ),
			),
			array(
				'id'         => 'top_pages',
				'current'    => implode( ' · ', array_filter( $top_pages ) ),
				'previous'   => '—',
				'change_pct' => null,
				'pending'    => empty( $top_pages ),
			),
			self::compare_row(
				'site_conversion_pct',
				$commerce_cur['conversion_rate_pct'],
				$commerce_prev['conversion_rate_pct']
			),
		);

		return array(
			'source'       => Webino_Dashboard_Analytics::data_source(),
			'current'      => $cur,
			'previous'     => $prev,
			'rows'         => $rows,
			'session_note' => $session_cur['has_data'] ? null : 'pending_sessions',
		);
	}

	/**
	 * Auto monthly business summary: status, score, achievement, challenge.
	 *
	 * @param string|null $from_day Optional Y-m-d current window start.
	 * @param string|null $to_day   Optional Y-m-d current window end.
	 * @return array<string,mixed>
	 */
	public static function month_summary( $from_day = null, $to_day = null ) {
		$pair = self::period_pair( $from_day, $to_day );
		$cur  = $pair['current'];
		$prev = $pair['previous'];

		$commerce_cur  = self::commerce( $cur['from'], $cur['to'] );
		$commerce_prev = self::commerce( $prev['from'], $prev['to'] );
		$vis_cur       = Webino_Dashboard_Analytics_Query::count_range( $cur['from'], $cur['to'] );
		$vis_prev      = Webino_Dashboard_Analytics_Query::count_range( $prev['from'], $prev['to'] );

		$signals = array(
			array(
				'id'         => 'revenue',
				'weight'     => 0.35,
				'current'    => (float) ( $commerce_cur['revenue'] ?? 0 ),
				'previous'   => (float) ( $commerce_prev['revenue'] ?? 0 ),
				'change_pct' => self::change_pct( (float) ( $commerce_cur['revenue'] ?? 0 ), (float) ( $commerce_prev['revenue'] ?? 0 ) ),
			),
			array(
				'id'         => 'order_count',
				'weight'     => 0.25,
				'current'    => (float) ( $commerce_cur['order_count'] ?? 0 ),
				'previous'   => (float) ( $commerce_prev['order_count'] ?? 0 ),
				'change_pct' => self::change_pct( (float) ( $commerce_cur['order_count'] ?? 0 ), (float) ( $commerce_prev['order_count'] ?? 0 ) ),
			),
			array(
				'id'         => 'visitors',
				'weight'     => 0.20,
				'current'    => (float) ( $vis_cur['visitors'] ?? 0 ),
				'previous'   => (float) ( $vis_prev['visitors'] ?? 0 ),
				'change_pct' => self::change_pct( (float) ( $vis_cur['visitors'] ?? 0 ), (float) ( $vis_prev['visitors'] ?? 0 ) ),
			),
			array(
				'id'         => 'conversion',
				'weight'     => 0.20,
				'current'    => null !== ( $commerce_cur['conversion_rate_pct'] ?? null ) ? (float) $commerce_cur['conversion_rate_pct'] : null,
				'previous'   => null !== ( $commerce_prev['conversion_rate_pct'] ?? null ) ? (float) $commerce_prev['conversion_rate_pct'] : null,
				'change_pct' => self::change_pct(
					(float) ( $commerce_cur['conversion_rate_pct'] ?? 0 ),
					(float) ( $commerce_prev['conversion_rate_pct'] ?? 0 )
				),
			),
		);

		$composite  = 0.0;
		$weight_sum = 0.0;
		foreach ( $signals as $sig ) {
			if ( null === $sig['change_pct'] ) {
				continue;
			}
			$clamped     = max( -100.0, min( 100.0, (float) $sig['change_pct'] ) );
			$composite  += $clamped * (float) $sig['weight'];
			$weight_sum += (float) $sig['weight'];
		}
		if ( $weight_sum > 0 && abs( $weight_sum - 1.0 ) > 0.001 ) {
			$composite = $composite / $weight_sum;
		}

		if ( $composite >= 5.0 ) {
			$status = 'growth';
		} elseif ( $composite <= -5.0 ) {
			$status = 'decline';
		} else {
			$status = 'stable';
		}

		// Map composite [-50, +50] → [0, 10].
		$mapped = ( ( max( -50.0, min( 50.0, $composite ) ) + 50.0 ) / 100.0 ) * 10.0;
		$score  = round( $mapped, 1 );

		$achievement = null;
		$challenge   = null;
		$best_pct    = null;
		$worst_pct   = null;
		foreach ( $signals as $sig ) {
			$pct = $sig['change_pct'];
			if ( null === $pct ) {
				continue;
			}
			$pct = (float) $pct;
			if ( null === $best_pct || $pct > $best_pct ) {
				$best_pct    = $pct;
				$achievement = array(
					'id'         => $sig['id'],
					'change_pct' => $pct,
					'current'    => $sig['current'],
					'previous'   => $sig['previous'],
				);
			}
			if ( null === $worst_pct || $pct < $worst_pct ) {
				$worst_pct = $pct;
				$challenge = array(
					'id'         => $sig['id'],
					'change_pct' => $pct,
					'current'    => $sig['current'],
					'previous'   => $sig['previous'],
				);
			}
		}

		if ( null === $best_pct || $best_pct <= 0 ) {
			$achievement = null;
		}
		if ( null === $worst_pct || $worst_pct >= 0 ) {
			$challenge = null;
		}

		$deltas = array();
		foreach ( $signals as $sig ) {
			$deltas[] = array(
				'id'         => $sig['id'],
				'change_pct' => $sig['change_pct'],
				'current'    => $sig['current'],
				'previous'   => $sig['previous'],
			);
		}

		return array(
			'source'      => Webino_Dashboard_Analytics::data_source(),
			'current'     => $cur,
			'previous'    => $prev,
			'status'      => $status,
			'score'       => $score,
			'composite'   => round( $composite, 2 ),
			'achievement' => $achievement,
			'challenge'   => $challenge,
			'deltas'      => $deltas,
		);
	}

	/**
	 * @param string     $id      Row id.
	 * @param float|null $cur     Current.
	 * @param float|null $prev    Previous.
	 * @param bool       $pending Pending flag.
	 * @return array<string,mixed>
	 */
	private static function compare_row( $id, $cur, $prev, $pending = false ) {
		return array(
			'id'         => $id,
			'current'    => $pending ? null : $cur,
			'previous'   => $pending ? null : $prev,
			'change_pct' => $pending || null === $cur || null === $prev ? null : self::change_pct( $cur, $prev ),
			'pending'    => (bool) $pending,
		);
	}

	/**
	 * Session aggregates from daily_totals / events.
	 *
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array{has_data:bool,sessions:int,bounces:int,avg_duration_ms:float|null,bounce_rate_pct:float|null}
	 */
	public static function session_stats( $from_day, $to_day ) {
		if ( 'wp-statistics' === Webino_Dashboard_Analytics::data_source() ) {
			return array(
				'has_data'         => false,
				'sessions'         => 0,
				'bounces'          => 0,
				'avg_duration_ms'  => null,
				'bounce_rate_pct'  => null,
			);
		}
		global $wpdb;
		$totals = Webino_Dashboard_Analytics_Db::table( 'daily_totals' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$cols = $wpdb->get_col( "SHOW COLUMNS FROM {$totals}", 0 ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$cols = is_array( $cols ) ? $cols : array();
		if ( ! in_array( 'sessions', $cols, true ) ) {
			return array(
				'has_data'        => false,
				'sessions'        => 0,
				'bounces'         => 0,
				'avg_duration_ms' => null,
				'bounce_rate_pct' => null,
			);
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT COALESCE(SUM(sessions),0) AS sessions, COALESCE(SUM(bounces),0) AS bounces,
					COALESCE(SUM(duration_sum_ms),0) AS duration_sum_ms
				FROM {$totals} WHERE day >= %s AND day <= %s",
				$from_day,
				$to_day
			),
			ARRAY_A
		);
		$sessions = (int) ( $row['sessions'] ?? 0 );
		$bounces  = (int) ( $row['bounces'] ?? 0 );
		$dur_sum  = (int) ( $row['duration_sum_ms'] ?? 0 );
		$has      = $sessions > 0;
		return array(
			'has_data'        => $has,
			'sessions'        => $sessions,
			'bounces'         => $bounces,
			'avg_duration_ms' => $has ? round( $dur_sum / $sessions ) : null,
			'bounce_rate_pct' => $has ? round( ( $bounces / $sessions ) * 100, 1 ) : null,
		);
	}

	/**
	 * SEO aggregates.
	 *
	 * @param string $from_day From (for AI monthly counts).
	 * @param string $to_day   To.
	 * @return array<string,mixed>
	 */
	public static function seo( $from_day, $to_day ) {
		global $wpdb;
		$keywords = (int) $wpdb->get_var(
			"SELECT COUNT(DISTINCT meta_value) FROM {$wpdb->postmeta} pm
			INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			WHERE pm.meta_key = 'rank_math_focus_keyword' AND pm.meta_value != ''
			AND p.post_status = 'publish' AND p.post_type IN ('post','page','product')"
		);

		$ai_keywords = 0;
		$runs_table  = $wpdb->prefix . 'webino_ai_runs';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $runs_table ) ) === $runs_table ) {
			list( $start, $end ) = Webino_Dashboard_Analytics_Query::gmt_bounds_for_local_days( $from_day, $to_day );
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$ai_keywords = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(DISTINCT focus_keyword) FROM {$runs_table}
					WHERE focus_keyword != '' AND created_at >= %s AND created_at <= %s",
					$start,
					$end
				)
			);
		}

		$optimized = (int) $wpdb->get_var(
			"SELECT COUNT(DISTINCT p.ID) FROM {$wpdb->posts} p
			INNER JOIN {$wpdb->postmeta} kw ON kw.post_id = p.ID AND kw.meta_key = 'rank_math_focus_keyword' AND kw.meta_value != ''
			LEFT JOIN {$wpdb->postmeta} sc ON sc.post_id = p.ID AND sc.meta_key = 'rank_math_seo_score'
			WHERE p.post_status = 'publish' AND p.post_type IN ('post','page','product')
			AND CAST(COALESCE(sc.meta_value,'0') AS UNSIGNED) >= 50"
		);

		$publish_count = (int) $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->posts}
			WHERE post_status = 'publish' AND post_type IN ('post','page','product')"
		);

		$noindex = (int) $wpdb->get_var(
			"SELECT COUNT(DISTINCT post_id) FROM {$wpdb->postmeta}
			WHERE meta_key = 'rank_math_robots' AND meta_value LIKE '%noindex%'"
		);

		$links = self::sample_link_counts( 80 );

		return array(
			'source'              => Webino_Dashboard_Analytics::data_source(),
			'from'                => $from_day,
			'to'                  => $to_day,
			'keywords_in_use'     => $keywords,
			'keywords_ai_month'   => $ai_keywords,
			'optimized_pages'     => $optimized,
			'publish_count'       => $publish_count,
			'noindex_count'       => $noindex,
			'noindex_share_pct'   => $publish_count > 0 ? round( ( $noindex / $publish_count ) * 100, 1 ) : 0,
			'internal_links'      => $links['internal'],
			'external_links'      => $links['external'],
			'links_sampled'       => $links['sampled'],
			'rank_available'      => false,
			'index_available'     => false,
			'gsc_connected'       => false,
		);
	}

	/**
	 * Approximate internal/external link counts from a sample of published content.
	 *
	 * @param int $limit Sample size.
	 * @return array{internal:int,external:int,sampled:int}
	 */
	private static function sample_link_counts( $limit = 80 ) {
		global $wpdb;
		$limit = max( 10, min( 200, (int) $limit ) );
		$host  = wp_parse_url( home_url(), PHP_URL_HOST );
		$host  = is_string( $host ) ? strtolower( $host ) : '';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$posts = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT post_content FROM {$wpdb->posts}
				WHERE post_status = 'publish' AND post_type IN ('post','page','product')
				ORDER BY post_modified DESC LIMIT %d",
				$limit
			),
			ARRAY_A
		);
		$internal = 0;
		$external = 0;
		$sampled  = 0;
		foreach ( (array) $posts as $row ) {
			$content = (string) ( $row['post_content'] ?? '' );
			if ( '' === $content ) {
				continue;
			}
			++$sampled;
			if ( ! preg_match_all( '/<a\s[^>]*href=["\']([^"\']+)["\']/i', $content, $m ) ) {
				continue;
			}
			foreach ( $m[1] as $href ) {
				$href = trim( (string) $href );
				if ( '' === $href || 0 === strpos( $href, '#' ) || 0 === strpos( $href, 'mailto:' ) || 0 === strpos( $href, 'tel:' ) ) {
					continue;
				}
				if ( 0 === strpos( $href, '/' ) ) {
					++$internal;
					continue;
				}
				$h = wp_parse_url( $href, PHP_URL_HOST );
				$h = is_string( $h ) ? strtolower( $h ) : '';
				if ( '' === $h || $h === $host || ( $host && false !== strpos( $h, $host ) ) ) {
					++$internal;
				} else {
					++$external;
				}
			}
		}
		return array(
			'internal' => $internal,
			'external' => $external,
			'sampled'  => $sampled,
		);
	}

	/**
	 * Support KPIs.
	 *
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array<string,mixed>
	 */
	public static function support( $from_day, $to_day ) {
		global $wpdb;
		if ( ! class_exists( 'Webino_Dashboard_Support_Tickets', false ) ) {
			return array(
				'tickets_created' => 0,
				'staff_replies'   => 0,
				'csat_avg'        => null,
				'csat_count'      => 0,
				'frequent'        => array(),
			);
		}
		Webino_Dashboard_Support_Tickets::ensure_tables();
		$tickets = Webino_Dashboard_Support_Tickets::tickets_table();
		$replies = Webino_Dashboard_Support_Tickets::replies_table();
		$from_dt = $from_day . ' 00:00:00';
		$to_dt   = $to_day . ' 23:59:59';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$created = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$tickets} WHERE created_at >= %s AND created_at <= %s",
				$from_dt,
				$to_dt
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$staff_replies = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$replies} WHERE is_staff = 1 AND created_at >= %s AND created_at <= %s",
				$from_dt,
				$to_dt
			)
		);

		$csat_avg   = null;
		$csat_count = 0;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$cols = $wpdb->get_col( "SHOW COLUMNS FROM {$tickets}", 0 );
		if ( is_array( $cols ) && in_array( 'csat_rating', $cols, true ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$row = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT AVG(csat_rating) AS avg_r, COUNT(*) AS cnt FROM {$tickets}
					WHERE csat_rating IS NOT NULL AND csat_rating > 0
					AND COALESCE(csat_at, updated_at) >= %s AND COALESCE(csat_at, updated_at) <= %s",
					$from_dt,
					$to_dt
				),
				ARRAY_A
			);
			$csat_count = (int) ( $row['cnt'] ?? 0 );
			$csat_avg   = $csat_count > 0 ? round( (float) ( $row['avg_r'] ?? 0 ), 2 ) : null;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$frequent = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT subject, COUNT(*) AS cnt FROM {$tickets}
				WHERE created_at >= %s AND created_at <= %s
				GROUP BY subject ORDER BY cnt DESC LIMIT 10",
				$from_dt,
				$to_dt
			),
			ARRAY_A
		);

		return array(
			'from'            => $from_day,
			'to'              => $to_day,
			'tickets_created' => $created,
			'staff_replies'   => $staff_replies,
			'csat_avg'        => $csat_avg,
			'csat_count'      => $csat_count,
			'frequent'        => is_array( $frequent ) ? $frequent : array(),
		);
	}

	/**
	 * Content ops for a calendar range.
	 *
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array<string,mixed>
	 */
	public static function content( $from_day, $to_day ) {
		global $wpdb;
		$from_dt = $from_day . ' 00:00:00';
		$to_dt   = $to_day . ' 23:59:59';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$products_created = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->posts}
				WHERE post_type = 'product' AND post_status NOT IN ('trash','auto-draft')
				AND post_date >= %s AND post_date <= %s",
				$from_dt,
				$to_dt
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$products_updated = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->posts}
				WHERE post_type = 'product' AND post_status NOT IN ('trash','auto-draft')
				AND post_modified >= %s AND post_modified <= %s
				AND DATE(post_modified) != DATE(post_date)",
				$from_dt,
				$to_dt
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$posts_published = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->posts}
				WHERE post_type = 'post' AND post_status = 'publish'
				AND post_date >= %s AND post_date <= %s",
				$from_dt,
				$to_dt
			)
		);

		$ai_products = 0;
		$ai_blog     = 0;
		$ai_pages    = 0;
		$jobs_table  = $wpdb->prefix . 'webino_ai_jobs';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $jobs_table ) ) === $jobs_table ) {
			list( $start, $end ) = Webino_Dashboard_Analytics_Query::gmt_bounds_for_local_days( $from_day, $to_day );
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$ai_products = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(*) FROM {$jobs_table}
					WHERE status = 'done' AND job_type = 'product_fill'
					AND finished_at >= %s AND finished_at <= %s",
					$start,
					$end
				)
			);
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$ai_blog = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(*) FROM {$jobs_table}
					WHERE status = 'done' AND job_type = 'blog_write'
					AND finished_at >= %s AND finished_at <= %s",
					$start,
					$end
				)
			);
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$ai_pages = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(*) FROM {$jobs_table}
					WHERE status = 'done' AND job_type IN ('page_design','term_fill')
					AND finished_at >= %s AND finished_at <= %s",
					$start,
					$end
				)
			);
		}

		return array(
			'from'              => $from_day,
			'to'                => $to_day,
			'products_created'  => $products_created,
			'products_updated'  => $products_updated,
			'posts_published'   => $posts_published,
			'ai_products_done'  => $ai_products,
			'ai_blog_done'      => $ai_blog,
			'ai_pages_done'     => $ai_pages,
		);
	}

	/**
	 * @param string $from_day From.
	 * @param string $to_day   To.
	 * @return array{0:int,1:int}
	 */
	private static function day_range_to_ts( $from_day, $to_day ) {
		$tz = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );
		try {
			$start = new DateTimeImmutable( $from_day . ' 00:00:00', $tz );
			$end   = new DateTimeImmutable( $to_day . ' 23:59:59', $tz );
			return array( (int) $start->getTimestamp(), (int) $end->getTimestamp() );
		} catch ( Exception $e ) {
			return array( (int) strtotime( $from_day . ' 00:00:00' ), (int) strtotime( $to_day . ' 23:59:59' ) );
		}
	}
}
