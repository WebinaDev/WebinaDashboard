<?php
/**
 * Paginated WooCommerce order aggregation for dashboard summaries.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sums order totals across all pages in a date range.
 */
final class Webino_Dashboard_Order_Aggregates {

	const PAGE_SIZE     = 500;
	const MAX_ORDERS    = 50000;

	/**
	 * @param array<string,mixed> $query_args wc_get_orders args (date_created, status, etc.).
	 * @param bool                $collect_daily When true, bucket revenue by Y-m-d.
	 * @param bool                $collect_refunds When true, sum refunded amounts and count.
	 * @return array{ revenue: float, order_count: int, truncated: bool, daily?: array<string,float>, refunds?: float, refund_count?: int }
	 */
	public static function sum_orders_in_range( array $query_args, $collect_daily = false, $collect_refunds = false ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return array(
				'revenue'     => 0.0,
				'order_count' => 0,
				'truncated'   => false,
			);
		}

		$revenue      = 0.0;
		$order_count  = 0;
		$truncated    = false;
		$daily        = array();
		$refunds      = 0.0;
		$refund_count = 0;
		$page         = 1;

		do {
			$result = wc_get_orders(
				array_merge(
					$query_args,
					array(
						'limit'    => self::PAGE_SIZE,
						'paginate' => true,
						'page'     => $page,
						'return'   => 'objects',
					)
				)
			);

			$orders       = array();
			$max_pages    = 1;
			if ( is_object( $result ) && isset( $result->orders ) ) {
				$orders    = is_array( $result->orders ) ? $result->orders : array();
				$max_pages = isset( $result->max_num_pages ) ? (int) $result->max_num_pages : 1;
			} elseif ( is_array( $result ) ) {
				$orders = $result;
			}

			foreach ( $orders as $order ) {
				if ( ! $order instanceof WC_Order ) {
					continue;
				}
				$amt = (float) $order->get_total();
				$revenue += $amt;
				++$order_count;

				if ( $collect_refunds ) {
					$refunded = (float) $order->get_total_refunded();
					if ( $refunded > 0 ) {
						$refunds += $refunded;
						++$refund_count;
					}
				}

				if ( $collect_daily ) {
					$dc      = $order->get_date_created();
					$day_key = $dc ? $dc->date( 'Y-m-d' ) : wp_date( 'Y-m-d' );
					if ( ! isset( $daily[ $day_key ] ) ) {
						$daily[ $day_key ] = 0.0;
					}
					$daily[ $day_key ] += $amt;
				}

				if ( $order_count >= self::MAX_ORDERS ) {
					$truncated = true;
					break 2;
				}
			}

			++$page;
		} while ( $page <= $max_pages );

		$out = array(
			'revenue'     => $revenue,
			'order_count' => $order_count,
			'truncated'   => $truncated,
		);
		if ( $collect_daily ) {
			ksort( $daily );
			$out['daily'] = $daily;
		}
		if ( $collect_refunds ) {
			$out['refunds']      = $refunds;
			$out['refund_count'] = $refund_count;
		}
		return $out;
	}
}
