<?php
/**
 * WooCommerce order reports aggregation for dashboard REST.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds order report payloads (summary, series, breakdowns).
 */
class Webino_Dashboard_Order_Reports {

	/** Report REST cache lifetime (seconds). */
	const CACHE_TTL = 90;

	/** Maximum orders loaded per report query. */
	const ORDER_FETCH_LIMIT = 10000;

	/**
	 * Default order statuses included in revenue reports.
	 *
	 * @return string[]
	 */
	public static function default_statuses() {
		return array( 'completed', 'processing' );
	}

	/**
	 * @param mixed $raw Raw status param.
	 * @return string[]
	 */
	public static function parse_statuses( $raw ) {
		if ( null === $raw || '' === $raw ) {
			return self::default_statuses();
		}
		$parts = array_map( 'sanitize_key', explode( ',', (string) $raw ) );
		$parts = array_values( array_filter( $parts ) );
		return $parts ? $parts : self::default_statuses();
	}

	/**
	 * @param mixed $value Date-ish value.
	 * @return int Unix timestamp.
	 */
	public static function parse_timestamp( $value ) {
		if ( is_numeric( $value ) ) {
			return (int) $value;
		}
		$ts = strtotime( (string) $value );
		return $ts ? $ts : time();
	}

	/**
	 * @param int $from_ts Start.
	 * @param int $to_ts End.
	 * @return array{0:int,1:int}
	 */
	public static function compare_range( $from_ts, $to_ts ) {
		$span   = max( 1, $to_ts - $from_ts );
		$cmp_to = $from_ts - 1;
		$cmp_from = $cmp_to - $span;
		return array( $cmp_from, $cmp_to );
	}

	/**
	 * @return bool
	 */
	private static function wfcp_enabled() {
		return class_exists( 'WFCP_Helper' );
	}

	/**
	 * @return string[]
	 */
	private static function wholesale_gateway_ids() {
		if ( ! self::wfcp_enabled() ) {
			return array();
		}
		$gateways = WFCP_Helper::get_settings( 'wholesale', 'gateways' );
		return is_array( $gateways ) ? array_values( array_filter( array_map( 'strval', $gateways ) ) ) : array();
	}

	/**
	 * @param int $product_id Product ID.
	 * @param int $variation_id Variation ID.
	 * @param array<int,float> $cache Cost cache.
	 * @return float
	 */
	private static function get_line_purchase_cost( $product_id, $variation_id, &$cache ) {
		$product_id   = (int) $product_id;
		$variation_id = (int) $variation_id;
		$lookup_id    = $variation_id > 0 ? $variation_id : $product_id;
		if ( $lookup_id <= 0 ) {
			return 0.0;
		}
		if ( isset( $cache[ $lookup_id ] ) ) {
			return $cache[ $lookup_id ];
		}
		$cost = 0.0;
		if ( self::wfcp_enabled() ) {
			$raw = WFCP_Helper::get_product_purchase_price( $lookup_id );
			if ( ( ! $raw || (float) $raw <= 0 ) && $variation_id > 0 && $product_id > 0 ) {
				$raw = WFCP_Helper::get_product_purchase_price( $product_id );
			}
			$cost = $raw ? (float) $raw : 0.0;
		} else {
			$raw = get_post_meta( $lookup_id, '_wfcp_purchase_price', true );
			if ( ( '' === $raw || false === $raw ) && $variation_id > 0 && $product_id > 0 ) {
				$raw = get_post_meta( $product_id, '_wfcp_purchase_price', true );
			}
			if ( '' !== $raw && false !== $raw ) {
				$cost = (float) $raw;
			}
		}
		$cache[ $lookup_id ] = $cost;
		return $cost;
	}

	/**
	 * @param WC_Order              $order Order.
	 * @param WC_Order_Item_Product $item Line item.
	 * @return string retail|credit|installment|wholesale
	 */
	private static function resolve_price_tier( $order, $item ) {
		if ( self::is_wholesale_order( $order ) ) {
			return 'wholesale';
		}
		$meta = $item->get_meta( 'wfcp_purchase_type' );
		if ( is_string( $meta ) && '' !== $meta ) {
			if ( 'credit' === $meta ) {
				return 'credit';
			}
			if ( 'installment' === $meta ) {
				return 'installment';
			}
		}
		return 'retail';
	}

	/**
	 * @param WC_Order $order Order.
	 * @return bool
	 */
	private static function is_wholesale_order( $order ) {
		$method = (string) $order->get_payment_method();
		if ( '' === $method ) {
			return false;
		}
		return in_array( $method, self::wholesale_gateway_ids(), true );
	}

	/**
	 * @param string $tier Tier slug.
	 * @return string
	 */
	private static function tier_label( $tier ) {
		$labels = array(
			'retail'      => __( 'Retail', 'webino-dashboard' ),
			'credit'      => __( 'Credit', 'webino-dashboard' ),
			'installment' => __( 'Installment', 'webino-dashboard' ),
			'wholesale'   => __( 'Wholesale', 'webino-dashboard' ),
		);
		return isset( $labels[ $tier ] ) ? $labels[ $tier ] : $tier;
	}

	/**
	 * @param WC_DateTime|null $dc Order date.
	 * @return array{dow:int,hour:int}|null
	 */
	private static function order_local_parts( $dc ) {
		if ( ! $dc || ! is_a( $dc, 'WC_DateTime' ) ) {
			return null;
		}
		$dt = clone $dc;
		$dt->setTimezone( wp_timezone() );
		return array(
			'dow'  => (int) $dt->format( 'w' ),
			'hour' => (int) $dt->format( 'G' ),
		);
	}

	/**
	 * @return array<int,array<int,array{orders:int,revenue:float}>>
	 */
	private static function init_heatmap_matrix() {
		$matrix = array();
		for ( $dow = 0; $dow <= 6; $dow++ ) {
			$matrix[ $dow ] = array();
			for ( $hour = 0; $hour <= 23; $hour++ ) {
				$matrix[ $dow ][ $hour ] = array(
					'orders'  => 0,
					'revenue' => 0.0,
				);
			}
		}
		return $matrix;
	}

	/**
	 * @param array<int,array<int,array{orders:int,revenue:float}>> $matrix Matrix.
	 * @return array<int,array<string,mixed>>
	 */
	private static function flatten_heatmap( $matrix ) {
		$out = array();
		for ( $dow = 0; $dow <= 6; $dow++ ) {
			for ( $hour = 0; $hour <= 23; $hour++ ) {
				$cell = $matrix[ $dow ][ $hour ];
				$out[] = array(
					'dow'     => $dow,
					'hour'    => $hour,
					'orders'  => (int) $cell['orders'],
					'revenue' => (float) $cell['revenue'],
				);
			}
		}
		return $out;
	}

	/**
	 * @param float $profit Profit.
	 * @param float $revenue Revenue.
	 * @return float
	 */
	private static function margin_pct( $profit, $revenue ) {
		return $revenue > 0 ? ( $profit / $revenue ) * 100 : 0.0;
	}

	/**
	 * @param array<string,array<string,mixed>> $tier_rows Tier rows.
	 * @return array<int,array<string,mixed>>
	 */
	private static function finalize_tier_rows( $tier_rows ) {
		$out = array();
		foreach ( $tier_rows as $tier => $row ) {
			$rev    = (float) $row['revenue'];
			$cogs   = (float) $row['cogs'];
			$profit = $rev - $cogs;
			$out[]  = array(
				'tier'        => $tier,
				'label'       => self::tier_label( $tier ),
				'count'       => (int) $row['count'],
				'revenue'     => $rev,
				'cogs'        => $cogs,
				'profit'      => $profit,
				'margin_pct'  => self::margin_pct( $profit, $rev ),
			);
		}
		usort(
			$out,
			function ( $a, $b ) {
				return $b['revenue'] <=> $a['revenue'];
			}
		);
		return $out;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_get( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$cache_key = self::rest_cache_key( $request );
		$cached    = get_transient( $cache_key );
		if ( is_array( $cached ) ) {
			return new WP_REST_Response( $cached );
		}

		$from_ts   = self::parse_timestamp( $request->get_param( 'from' ) ?: strtotime( '-30 days' ) );
		$to_ts     = self::parse_timestamp( $request->get_param( 'to' ) ?: time() );
		if ( $from_ts > $to_ts ) {
			$tmp     = $from_ts;
			$from_ts = $to_ts;
			$to_ts   = $tmp;
		}

		$interval = sanitize_key( (string) ( $request->get_param( 'interval' ) ?: 'day' ) );
		if ( ! in_array( $interval, array( 'day', 'week', 'month' ), true ) ) {
			$interval = 'day';
		}

		$statuses = self::parse_statuses( $request->get_param( 'status' ) );
		$compare  = rest_sanitize_boolean( $request->get_param( 'compare' ) );

		$current = self::build_report( $from_ts, $to_ts, $interval, $statuses );

		$payload = array(
			'currency'  => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '',
			'from'      => $from_ts,
			'to'        => $to_ts,
			'from_date' => gmdate( 'c', $from_ts ),
			'to_date'   => gmdate( 'c', $to_ts ),
			'interval'  => $interval,
			'statuses'  => $statuses,
			'summary'   => $current['summary'],
			'series'    => $current['series'],
			'by_status' => $current['by_status'],
			'by_payment' => $current['by_payment'],
			'by_source' => $current['by_source'],
			'by_hour'   => $current['by_hour'],
			'top_products'   => $current['top_products'],
			'top_categories' => $current['top_categories'],
			'top_customers'  => $current['top_customers'],
			'top_coupons'    => $current['top_coupons'],
			'by_price_tier'  => $current['by_price_tier'],
			'heatmap'        => $current['heatmap'],
			'top_products_profit' => $current['top_products_profit'],
			'truncated'           => ! empty( $current['truncated'] ),
		);

		if ( $compare ) {
			list( $cmp_from, $cmp_to ) = self::compare_range( $from_ts, $to_ts );
			$prev = self::build_report( $cmp_from, $cmp_to, $interval, $statuses );
			$payload['compare'] = array(
				'from'      => $cmp_from,
				'to'        => $cmp_to,
				'from_date' => gmdate( 'c', $cmp_from ),
				'to_date'   => gmdate( 'c', $cmp_to ),
				'summary'   => $prev['summary'],
				'series'    => $prev['series'],
				'truncated' => ! empty( $prev['truncated'] ),
			);
		}

		set_transient( $cache_key, $payload, self::CACHE_TTL );

		return new WP_REST_Response( $payload );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return string
	 */
	private static function rest_cache_key( $request ) {
		$parts = array(
			'from'     => (string) $request->get_param( 'from' ),
			'to'       => (string) $request->get_param( 'to' ),
			'interval' => (string) $request->get_param( 'interval' ),
			'status'   => (string) $request->get_param( 'status' ),
			'compare'  => $request->get_param( 'compare' ) ? '1' : '0',
			'uid'      => (string) get_current_user_id(),
		);
		return 'webino_order_report_' . md5( wp_json_encode( $parts ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	public static function rest_export_csv( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			status_header( 400 );
			echo esc_html__( 'Store module is not available.', 'webino-dashboard' );
			exit;
		}

		$response = self::rest_get( $request );
		if ( is_wp_error( $response ) ) {
			status_header( 400 );
			echo esc_html( $response->get_error_message() );
			exit;
		}

		$data = $response->get_data();
		$filename = 'order-reports-' . gmdate( 'Y-m-d' ) . '.csv';

		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
		header( 'Pragma: no-cache' );
		header( 'Expires: 0' );

		// UTF-8 BOM for Excel.
		echo "\xEF\xBB\xBF";

		$out = fopen( 'php://output', 'w' );
		if ( ! $out ) {
			exit;
		}

		fputcsv( $out, array( __( 'Metric', 'webino-dashboard' ), __( 'Value', 'webino-dashboard' ) ) );
		$summary = isset( $data['summary'] ) ? (array) $data['summary'] : array();
		foreach ( $summary as $key => $val ) {
			fputcsv( $out, array( $key, $val ) );
		}

		fputcsv( $out, array() );
		fputcsv( $out, array( __( 'Date', 'webino-dashboard' ), __( 'Revenue', 'webino-dashboard' ), __( 'Orders', 'webino-dashboard' ), __( 'Items', 'webino-dashboard' ), 'COGS', __( 'Profit', 'webino-dashboard' ) ) );
		foreach ( (array) ( $data['series'] ?? array() ) as $row ) {
			fputcsv(
				$out,
				array(
					$row['label'] ?? $row['key'] ?? '',
					$row['revenue'] ?? 0,
					$row['orders'] ?? 0,
					$row['items'] ?? 0,
					$row['cogs'] ?? 0,
					$row['profit'] ?? 0,
				)
			);
		}

		fputcsv( $out, array() );
		fputcsv( $out, array( __( 'Top products', 'webino-dashboard' ) ) );
		fputcsv( $out, array( __( 'Name', 'webino-dashboard' ), __( 'Quantity', 'webino-dashboard' ), __( 'Revenue', 'webino-dashboard' ) ) );
		foreach ( (array) ( $data['top_products'] ?? array() ) as $row ) {
			fputcsv( $out, array( $row['name'] ?? '', $row['quantity'] ?? 0, $row['revenue'] ?? 0 ) );
		}

		fputcsv( $out, array() );
		fputcsv( $out, array( __( 'Top products by profit', 'webino-dashboard' ) ) );
		fputcsv(
			$out,
			array(
				__( 'Name', 'webino-dashboard' ),
				__( 'Quantity', 'webino-dashboard' ),
				__( 'Revenue', 'webino-dashboard' ),
				'COGS',
				__( 'Profit', 'webino-dashboard' ),
			)
		);
		foreach ( (array) ( $data['top_products_profit'] ?? array() ) as $row ) {
			fputcsv(
				$out,
				array(
					$row['name'] ?? '',
					$row['quantity'] ?? 0,
					$row['revenue'] ?? 0,
					$row['cogs'] ?? 0,
					$row['profit'] ?? 0,
				)
			);
		}

		fputcsv( $out, array() );
		fputcsv( $out, array( __( 'Heatmap (day x hour)', 'webino-dashboard' ) ) );
		fputcsv( $out, array( 'dow', 'hour', __( 'Orders', 'webino-dashboard' ), __( 'Revenue', 'webino-dashboard' ) ) );
		foreach ( (array) ( $data['heatmap'] ?? array() ) as $row ) {
			if ( (int) ( $row['orders'] ?? 0 ) <= 0 ) {
				continue;
			}
			fputcsv(
				$out,
				array(
					$row['dow'] ?? 0,
					$row['hour'] ?? 0,
					$row['orders'] ?? 0,
					$row['revenue'] ?? 0,
				)
			);
		}

		fclose( $out );
		exit;
	}

	/**
	 * @param int      $from_ts From unix.
	 * @param int      $to_ts To unix.
	 * @param string   $interval day|week|month.
	 * @param string[] $statuses Status slugs.
	 * @return array<string,mixed>
	 */
	public static function build_report( $from_ts, $to_ts, $interval, $statuses ) {
		$fetch       = self::fetch_orders( $from_ts, $to_ts, $statuses );
		$orders      = $fetch['orders'];
		$truncated   = $fetch['truncated'];
		$cost_cache = array();

		$summary = array(
			'revenue'            => 0.0,
			'net_revenue'        => 0.0,
			'refunds'            => 0.0,
			'refund_count'       => 0,
			'order_count'        => 0,
			'avg_order_value'    => 0.0,
			'items_sold'         => 0,
			'discount_total'     => 0.0,
			'shipping_total'     => 0.0,
			'tax_total'          => 0.0,
			'cogs'               => 0.0,
			'gross_profit'       => 0.0,
			'gross_margin_pct'   => 0.0,
			'items_missing_cost' => 0,
			'line_revenue'       => 0.0,
			'wfcp_enabled'       => self::wfcp_enabled(),
		);

		$series_buckets = self::init_series_buckets( $from_ts, $to_ts, $interval );
		$by_status      = array();
		$by_payment     = array();
		$by_source      = array();
		$by_hour        = array();
		$heatmap        = self::init_heatmap_matrix();
		$by_price_tier  = array(
			'retail'      => array( 'count' => 0, 'revenue' => 0.0, 'cogs' => 0.0 ),
			'credit'      => array( 'count' => 0, 'revenue' => 0.0, 'cogs' => 0.0 ),
			'installment' => array( 'count' => 0, 'revenue' => 0.0, 'cogs' => 0.0 ),
			'wholesale'   => array( 'count' => 0, 'revenue' => 0.0, 'cogs' => 0.0 ),
		);
		for ( $h = 0; $h < 24; $h++ ) {
			$by_hour[ $h ] = 0;
		}

		$products        = array();
		$products_profit = array();
		$categories      = array();
		$customers       = array();
		$coupons         = array();

		foreach ( $orders as $o ) {
			if ( ! is_a( $o, 'WC_Order' ) ) {
				continue;
			}

			$total    = (float) $o->get_total();
			$refunded = (float) $o->get_total_refunded();
			$status   = $o->get_status();

			++$summary['order_count'];
			$summary['revenue']        += $total;
			$summary['discount_total'] += (float) $o->get_discount_total();
			$summary['shipping_total'] += (float) $o->get_shipping_total();
			$summary['tax_total']      += (float) $o->get_total_tax();
			if ( $refunded > 0 ) {
				$summary['refunds']      += $refunded;
				++$summary['refund_count'];
			}

			$st_label = wc_get_order_status_name( $status );
			if ( ! isset( $by_status[ $status ] ) ) {
				$by_status[ $status ] = array(
					'status'  => $status,
					'label'   => $st_label,
					'count'   => 0,
					'revenue' => 0.0,
				);
			}
			++$by_status[ $status ]['count'];
			$by_status[ $status ]['revenue'] += $total;

			$pay_method = $o->get_payment_method() ?: 'unknown';
			$pay_title  = $o->get_payment_method_title() ?: $pay_method;
			if ( ! isset( $by_payment[ $pay_method ] ) ) {
				$by_payment[ $pay_method ] = array(
					'method'  => $pay_method,
					'title'   => $pay_title,
					'count'   => 0,
					'revenue' => 0.0,
				);
			}
			++$by_payment[ $pay_method ]['count'];
			$by_payment[ $pay_method ]['revenue'] += $total;

			$source = Webino_Dashboard_Orders::get_order_source( $o );
			if ( '' === $source ) {
				$source = __( 'Unknown', 'webino-dashboard' );
			}
			if ( ! isset( $by_source[ $source ] ) ) {
				$by_source[ $source ] = array(
					'source'  => $source,
					'count'   => 0,
					'revenue' => 0.0,
				);
			}
			++$by_source[ $source ]['count'];
			$by_source[ $source ]['revenue'] += $total;

			$dc  = $o->get_date_created();
			$key = '';
			if ( $dc ) {
				$parts = self::order_local_parts( $dc );
				if ( $parts ) {
					$hour = $parts['hour'];
					$dow  = $parts['dow'];
					if ( isset( $by_hour[ $hour ] ) ) {
						++$by_hour[ $hour ];
					}
					if ( isset( $heatmap[ $dow ][ $hour ] ) ) {
						++$heatmap[ $dow ][ $hour ]['orders'];
						$heatmap[ $dow ][ $hour ]['revenue'] += $total;
					}
				}
				$key = self::series_key_for_datetime( $dc, $interval );
				if ( isset( $series_buckets[ $key ] ) ) {
					$series_buckets[ $key ]['revenue'] += $total;
					++$series_buckets[ $key ]['orders'];
				}
			}

			foreach ( $o->get_items() as $item ) {
				if ( ! is_a( $item, 'WC_Order_Item_Product' ) ) {
					continue;
				}
				$qty         = (int) $item->get_quantity();
				$line_rev    = (float) $item->get_total();
				$pid         = (int) $item->get_product_id();
				$vid         = (int) $item->get_variation_id();
				$unit_cost   = self::get_line_purchase_cost( $pid, $vid, $cost_cache );
				$line_cogs   = $unit_cost * $qty;
				$tier        = self::resolve_price_tier( $o, $item );

				$summary['items_sold']    += $qty;
				$summary['line_revenue']  += $line_rev;
				$summary['cogs']          += $line_cogs;
				if ( $unit_cost <= 0 ) {
					$summary['items_missing_cost'] += $qty;
				}

				if ( isset( $by_price_tier[ $tier ] ) ) {
					++$by_price_tier[ $tier ]['count'];
					$by_price_tier[ $tier ]['revenue'] += $line_rev;
					$by_price_tier[ $tier ]['cogs']    += $line_cogs;
				}

				if ( $key && isset( $series_buckets[ $key ] ) ) {
					$series_buckets[ $key ]['items']  += $qty;
					$series_buckets[ $key ]['cogs']   += $line_cogs;
					$series_buckets[ $key ]['profit'] += ( $line_rev - $line_cogs );
				}

				if ( $pid > 0 ) {
					if ( ! isset( $products[ $pid ] ) ) {
						$products[ $pid ] = array(
							'product_id' => $pid,
							'name'       => $item->get_name(),
							'quantity'   => 0,
							'revenue'    => 0.0,
						);
					}
					$products[ $pid ]['quantity'] += $qty;
					$products[ $pid ]['revenue']  += $line_rev;

					if ( ! isset( $products_profit[ $pid ] ) ) {
						$products_profit[ $pid ] = array(
							'product_id'   => $pid,
							'name'         => $item->get_name(),
							'quantity'     => 0,
							'revenue'      => 0.0,
							'cogs'         => 0.0,
							'missing_cost' => 0,
						);
					}
					$products_profit[ $pid ]['quantity'] += $qty;
					$products_profit[ $pid ]['revenue']  += $line_rev;
					$products_profit[ $pid ]['cogs']     += $line_cogs;
					if ( $unit_cost <= 0 ) {
						$products_profit[ $pid ]['missing_cost'] += $qty;
					}

					$terms = wp_get_post_terms( $pid, 'product_cat', array( 'fields' => 'all' ) );
					if ( ! is_wp_error( $terms ) ) {
						foreach ( $terms as $term ) {
							$tid = (int) $term->term_id;
							if ( ! isset( $categories[ $tid ] ) ) {
								$categories[ $tid ] = array(
									'term_id'  => $tid,
									'name'     => $term->name,
									'quantity' => 0,
									'revenue'  => 0.0,
								);
							}
							$categories[ $tid ]['quantity'] += $qty;
							$categories[ $tid ]['revenue']  += $line_rev;
						}
					}
				}
			}

			$cust_id = (int) $o->get_customer_id();
			$email   = (string) $o->get_billing_email();
			$ckey    = $cust_id > 0 ? 'u_' . $cust_id : ( $email ? 'e_' . md5( strtolower( $email ) ) : 'g_' . $o->get_id() );
			$name    = trim( $o->get_formatted_billing_full_name() );
			if ( ! isset( $customers[ $ckey ] ) ) {
				$customers[ $ckey ] = array(
					'customer_id' => $cust_id,
					'name'        => $name ?: __( 'Guest', 'webino-dashboard' ),
					'email'       => $email,
					'orders'      => 0,
					'revenue'     => 0.0,
				);
			}
			++$customers[ $ckey ]['orders'];
			$customers[ $ckey ]['revenue'] += $total;

			if ( is_callable( array( $o, 'get_coupon_codes' ) ) ) {
				foreach ( $o->get_coupon_codes() as $code ) {
					$code = (string) $code;
					if ( '' === $code ) {
						continue;
					}
					if ( ! isset( $coupons[ $code ] ) ) {
						$coupons[ $code ] = array(
							'code'    => $code,
							'count'   => 0,
							'revenue' => 0.0,
						);
					}
					++$coupons[ $code ]['count'];
					$coupons[ $code ]['revenue'] += $total;
				}
			}
		}

		if ( $truncated ) {
			$from_date = wp_date( 'Y-m-d H:i:s', $from_ts );
			$to_date   = wp_date( 'Y-m-d H:i:s', $to_ts );
			$wc_status = array();
			foreach ( $statuses as $st ) {
				$wc_status[] = 0 === strpos( $st, 'wc-' ) ? $st : 'wc-' . $st;
			}
			$agg = Webino_Dashboard_Order_Aggregates::sum_orders_in_range(
				array(
					'status'       => $wc_status,
					'date_created' => $from_date . '...' . $to_date,
				),
				false,
				true
			);
			$summary['revenue']      = (float) ( $agg['revenue'] ?? $summary['revenue'] );
			$summary['order_count']  = (int) ( $agg['order_count'] ?? $summary['order_count'] );
			$summary['refunds']      = (float) ( $agg['refunds'] ?? $summary['refunds'] );
			$summary['refund_count'] = (int) ( $agg['refund_count'] ?? $summary['refund_count'] );
		}

		$summary['net_revenue']       = max( 0, $summary['revenue'] - $summary['refunds'] );
		$summary['avg_order_value']   = $summary['order_count'] > 0 ? $summary['revenue'] / $summary['order_count'] : 0.0;
		$summary['gross_profit']      = $summary['line_revenue'] - $summary['cogs'];
		$summary['gross_margin_pct']  = self::margin_pct( $summary['gross_profit'], $summary['line_revenue'] );
		unset( $summary['line_revenue'] );

		$profit_products = array();
		foreach ( $products_profit as $row ) {
			$rev    = (float) $row['revenue'];
			$cogs   = (float) $row['cogs'];
			$profit = $rev - $cogs;
			$profit_products[] = array(
				'product_id'   => (int) $row['product_id'],
				'name'         => $row['name'],
				'quantity'     => (int) $row['quantity'],
				'revenue'      => $rev,
				'cogs'         => $cogs,
				'profit'       => $profit,
				'margin_pct'   => self::margin_pct( $profit, $rev ),
				'missing_cost' => (int) $row['missing_cost'],
			);
		}

		$hour_out = array();
		foreach ( $by_hour as $hour => $count ) {
			$hour_out[] = array(
				'hour'   => (int) $hour,
				'orders' => (int) $count,
			);
		}

		return array(
			'summary'             => $summary,
			'series'              => array_values( $series_buckets ),
			'by_status'           => self::sort_by_revenue( array_values( $by_status ) ),
			'by_payment'          => self::sort_by_revenue( array_values( $by_payment ) ),
			'by_source'           => self::sort_by_revenue( array_values( $by_source ) ),
			'by_hour'             => $hour_out,
			'by_price_tier'       => self::finalize_tier_rows( $by_price_tier ),
			'heatmap'             => self::flatten_heatmap( $heatmap ),
			'top_products'        => self::top_n( array_values( $products ), 'revenue', 10 ),
			'top_products_profit' => self::top_n( $profit_products, 'profit', 10 ),
			'top_categories'      => self::top_n( array_values( $categories ), 'revenue', 10 ),
			'top_customers'       => self::top_n( array_values( $customers ), 'revenue', 10 ),
			'top_coupons'         => self::top_n( array_values( $coupons ), 'count', 10 ),
			'truncated'           => $truncated,
		);
	}

	/**
	 * @param WC_DateTime|null $dc Order date.
	 * @param string           $interval Interval.
	 * @return string
	 */
	private static function series_key_for_datetime( $dc, $interval ) {
		if ( ! $dc || ! is_a( $dc, 'WC_DateTime' ) ) {
			return '';
		}
		$dt = clone $dc;
		$dt->setTimezone( wp_timezone() );
		return self::series_key_for_date( $dt->getTimestamp(), $interval );
	}

	/**
	 * @param int      $from_ts From.
	 * @param int      $to_ts To.
	 * @param string[] $statuses Statuses.
	 * @return array{orders:WC_Order[],truncated:bool}
	 */
	private static function fetch_orders( $from_ts, $to_ts, $statuses ) {
		$from_date = wp_date( 'Y-m-d H:i:s', $from_ts );
		$to_date   = wp_date( 'Y-m-d H:i:s', $to_ts );
		$wc_status = array();
		foreach ( $statuses as $st ) {
			$wc_status[] = 0 === strpos( $st, 'wc-' ) ? $st : 'wc-' . $st;
		}

		$orders    = array();
		$truncated = false;
		$page      = 1;
		$max_pages = 1;

		do {
			$result = wc_get_orders(
				array(
					'limit'        => Webino_Dashboard_Order_Aggregates::PAGE_SIZE,
					'paginate'     => true,
					'page'         => $page,
					'status'       => $wc_status,
					'date_created' => $from_date . '...' . $to_date,
					'return'       => 'objects',
				)
			);

			$batch = array();
			if ( is_object( $result ) && isset( $result->orders ) ) {
				$batch     = is_array( $result->orders ) ? $result->orders : array();
				$max_pages = isset( $result->max_num_pages ) ? (int) $result->max_num_pages : 1;
				if ( isset( $result->total ) && (int) $result->total > Webino_Dashboard_Order_Aggregates::MAX_ORDERS ) {
					$truncated = true;
				}
			} elseif ( is_array( $result ) ) {
				$batch = $result;
			}

			foreach ( $batch as $order ) {
				$orders[] = $order;
				if ( count( $orders ) >= Webino_Dashboard_Order_Aggregates::MAX_ORDERS ) {
					$truncated = true;
					break 2;
				}
			}

			++$page;
		} while ( $page <= $max_pages );

		return array(
			'orders'    => $orders,
			'truncated' => $truncated,
		);
	}

	/**
	 * @param int    $from_ts From.
	 * @param int    $to_ts To.
	 * @param string $interval Interval.
	 * @return array<string,array<string,mixed>>
	 */
	private static function init_series_buckets( $from_ts, $to_ts, $interval ) {
		$buckets = array();
		$cursor  = $from_ts;
		while ( $cursor <= $to_ts ) {
			$key = self::series_key_for_date( $cursor, $interval );
			if ( ! isset( $buckets[ $key ] ) ) {
				$buckets[ $key ] = array(
					'key'     => $key,
					'label'   => self::series_label_for_key( $key, $interval ),
					'revenue' => 0.0,
					'orders'  => 0,
					'items'   => 0,
					'cogs'    => 0.0,
					'profit'  => 0.0,
				);
			}
			if ( 'month' === $interval ) {
				$dt     = ( new DateTimeImmutable( '@' . $cursor ) )->setTimezone( wp_timezone() );
				$cursor = $dt->modify( 'first day of next month' )->setTime( 0, 0 )->getTimestamp();
			} elseif ( 'week' === $interval ) {
				$dt     = ( new DateTimeImmutable( '@' . $cursor ) )->setTimezone( wp_timezone() );
				$cursor = $dt->modify( 'monday next week' )->setTime( 0, 0 )->getTimestamp();
			} else {
				$cursor += DAY_IN_SECONDS;
			}
		}
		return $buckets;
	}

	/**
	 * @param int    $ts Timestamp.
	 * @param string $interval Interval.
	 * @return string
	 */
	private static function series_key_for_date( $ts, $interval ) {
		if ( 'month' === $interval ) {
			return wp_date( 'Y-m', $ts );
		}
		if ( 'week' === $interval ) {
			return wp_date( 'o-\WW', $ts );
		}
		return wp_date( 'Y-m-d', $ts );
	}

	/**
	 * @param string $key Bucket key.
	 * @param string $interval Interval.
	 * @return string
	 */
	private static function series_label_for_key( $key, $interval ) {
		if ( 'month' === $interval ) {
			return $key;
		}
		if ( 'week' === $interval ) {
			return $key;
		}
		return $key;
	}

	/**
	 * @param array<int,array<string,mixed>> $rows Rows.
	 * @param string                         $field Sort field.
	 * @param int                              $limit Limit.
	 * @return array<int,array<string,mixed>>
	 */
	private static function top_n( $rows, $field, $limit ) {
		usort(
			$rows,
			function ( $a, $b ) use ( $field ) {
				$av = isset( $a[ $field ] ) ? (float) $a[ $field ] : 0;
				$bv = isset( $b[ $field ] ) ? (float) $b[ $field ] : 0;
				if ( $av === $bv ) {
					return 0;
				}
				return $av > $bv ? -1 : 1;
			}
		);
		return array_slice( $rows, 0, $limit );
	}

	/**
	 * @param array<int,array<string,mixed>> $rows Rows.
	 * @return array<int,array<string,mixed>>
	 */
	private static function sort_by_revenue( $rows ) {
		usort(
			$rows,
			function ( $a, $b ) {
				$av = isset( $a['revenue'] ) ? (float) $a['revenue'] : 0;
				$bv = isset( $b['revenue'] ) ? (float) $b['revenue'] : 0;
				if ( $av === $bv ) {
					return 0;
				}
				return $av > $bv ? -1 : 1;
			}
		);
		return $rows;
	}
}
