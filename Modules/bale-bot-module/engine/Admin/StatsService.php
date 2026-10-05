<?php

namespace Webino_Dashboard_Bots_Bale\Admin;

/**
 * Dashboard metrics for WooBale.
 */
class StatsService {

	private const PROVIDER = 'bale';

	
	/**
	 * Meta query for bot orders of this messenger.
	 *
	 * @return array<int|string, mixed>
	 */
	private static function order_meta_query(): array {
		$provider = self::PROVIDER;
		$source   = array(
			'key'   => '_woobale_source',
			'value' => '1',
		);
		if ( 'bale' === $provider ) {
			return array(
				'relation' => 'AND',
				$source,
				array(
					'relation' => 'OR',
					array(
						'key'   => '_woobale_provider',
						'value' => 'bale',
					),
					array(
						'key'     => '_woobale_provider',
						'compare' => 'NOT EXISTS',
					),
				),
			);
		}
		return array(
			'relation' => 'AND',
			$source,
			array(
				'key'   => '_woobale_provider',
				'value' => $provider,
			),
		);
	}

	public static function count_linked_users(): int {
		global $wpdb;
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(DISTINCT user_id) FROM {$wpdb->usermeta} WHERE meta_key = %s AND meta_value <> ''",
				'woobale_chat_id'
			)
		);
	}

	public static function count_bale_orders_all(): int {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return 0;
		}
		$ids = wc_get_orders(
			array(
				'limit'      => -1,
				'return'     => 'ids',
				'meta_query' => self::order_meta_query(),
			)
		);
		return is_array( $ids ) ? count( $ids ) : 0;
	}

	public static function count_bale_orders_since( int $days ): int {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return 0;
		}
		$from = strtotime( '-' . absint( $days ) . ' days midnight' );
		$to   = time();
		$ids  = wc_get_orders(
			array(
				'limit'        => -1,
				'return'       => 'ids',
				'date_created' => $from . '...' . $to,
				'meta_query'   => self::order_meta_query(),
			)
		);
		return is_array( $ids ) ? count( $ids ) : 0;
	}

	public static function count_sessions_active_hours( int $hours = 24 ): int {
		global $wpdb;
		$table     = $wpdb->prefix . 'webino_dashboard_bot_sessions';
		$cutoff_ts = current_time( 'timestamp' ) - absint( $hours ) * HOUR_IN_SECONDS;
		$since     = wp_date( 'Y-m-d H:i:s', $cutoff_ts );
		return (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE updated_at >= %s", $since )
		);
	}

	/**
	 * @return list<\WC_Order>
	 */
	public static function recent_bale_orders( int $limit = 8 ): array {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return array();
		}
		$orders = wc_get_orders(
			array(
				'limit'      => $limit,
				'orderby'    => 'date',
				'order'      => 'DESC',
				'meta_query' => self::order_meta_query(),
			)
		);
		return is_array( $orders ) ? $orders : array();
	}

	/**
	 * @return list<\WP_User>
	 */
	public static function recent_bale_users( int $limit = 8 ): array {
		$users = get_users(
			array(
				'meta_key'     => 'woobale_chat_id',
				'meta_compare' => '!=',
				'meta_value'   => '',
				'number'       => $limit,
				'orderby'      => 'registered',
				'order'        => 'DESC',
			)
		);
		return is_array( $users ) ? $users : array();
	}

	/**
	 * @return array{count:int, total:float}
	 */
	public static function bale_orders_aggregate( int $from_ts, int $to_ts ): array {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return array( 'count' => 0, 'total' => 0.0 );
		}
		$orders = wc_get_orders(
			array(
				'limit'        => -1,
				'return'       => 'objects',
				'date_created' => $from_ts . '...' . $to_ts,
				'meta_query'   => self::order_meta_query(),
			)
		);
		$count = 0;
		$total = 0.0;
		if ( is_array( $orders ) ) {
			foreach ( $orders as $order ) {
				if ( ! $order instanceof \WC_Order ) {
					continue;
				}
				++$count;
				$total += (float) $order->get_total();
			}
		}
		return array(
			'count' => $count,
			'total' => $total,
		);
	}

	/**
	 * Current window vs previous window of equal length.
	 *
	 * @return array{current: array{count:int, total:float}, previous: array{count:int, total:float}, days:int}
	 */
	public static function bale_sales_compare_periods( int $days = 30 ): array {
		$now       = time();
		$len       = max( 1, $days ) * DAY_IN_SECONDS;
		$cur_start = $now - $len;
		$prev_end  = $cur_start;
		$prev_start = $prev_end - $len;
		return array(
			'current'  => self::bale_orders_aggregate( $cur_start, $now ),
			'previous' => self::bale_orders_aggregate( $prev_start, $prev_end ),
			'days'     => $days,
		);
	}
}
