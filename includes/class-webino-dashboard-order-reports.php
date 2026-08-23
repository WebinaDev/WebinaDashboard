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
		if ( function_exists( 'wc_get_is_paid_statuses' ) ) {
			$paid = wc_get_is_paid_statuses();
			if ( is_array( $paid ) && $paid ) {
				return array_values( array_unique( array_map( array( __CLASS__, 'normalize_status_slug' ), $paid ) ) );
			}
		}
		return array( 'completed', 'processing' );
	}

	/**
	 * Active store statuses (excludes cancelled / refunded / failed / drafts).
	 *
	 * @return string[]
	 */
	public static function active_statuses() {
		$exclude = array( 'cancelled', 'refunded', 'failed', 'checkout-draft', 'trash', 'auto-draft' );
		$out     = array();
		if ( function_exists( 'wc_get_order_statuses' ) ) {
			foreach ( array_keys( wc_get_order_statuses() ) as $st ) {
				$slug = self::normalize_status_slug( $st );
				if ( $slug && ! in_array( $slug, $exclude, true ) ) {
					$out[] = $slug;
				}
			}
		}
		return $out ? array_values( array_unique( $out ) ) : self::default_statuses();
	}

	/**
	 * Strip optional wc- prefix for wc_get_orders.
	 *
	 * @param string $status Status slug.
	 * @return string
	 */
	public static function normalize_status_slug( $status ) {
		$st = sanitize_key( (string) $status );
		if ( 0 === strpos( $st, 'wc-' ) ) {
			$st = substr( $st, 3 );
		}
		return $st;
	}

	/**
	 * @param string[] $statuses Status slugs.
	 * @return string[]
	 */
	public static function normalize_query_statuses( $statuses ) {
		$out = array();
		foreach ( (array) $statuses as $st ) {
			$slug = self::normalize_status_slug( $st );
			if ( $slug ) {
				$out[] = $slug;
			}
		}
		return array_values( array_unique( $out ) );
	}

	/**
	 * @param mixed $raw Raw status param. Empty string/array = all active statuses.
	 * @return string[]
	 */
	public static function parse_statuses( $raw ) {
		if ( null === $raw ) {
			return self::default_statuses();
		}
		if ( is_array( $raw ) ) {
			$parts = array_map( array( __CLASS__, 'normalize_status_slug' ), $raw );
		} else {
			$raw = trim( (string) $raw );
			if ( '' === $raw ) {
				return self::active_statuses();
			}
			$parts = array_map( 'sanitize_key', explode( ',', $raw ) );
		}
		$parts = self::normalize_query_statuses( $parts );
		return $parts ? $parts : self::active_statuses();
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
	 * Public cost lookup for inventory reports.
	 *
	 * @param int $product_id Product ID.
	 * @param int $variation_id Variation ID.
	 * @param array<int,float> $cache Cost cache.
	 * @return float
	 */
	public static function get_product_purchase_cost( $product_id, $variation_id = 0, &$cache = null ) {
		if ( ! is_array( $cache ) ) {
			$local = array();
			return self::get_line_purchase_cost( $product_id, $variation_id, $local );
		}
		return self::get_line_purchase_cost( $product_id, $variation_id, $cache );
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

		// Match WFCP calculator: apply FX when purchase_currency is base.
		if ( $cost > 0 && self::wfcp_enabled() ) {
			$general = WFCP_Helper::get_settings( 'general' );
			if ( is_array( $general ) ) {
				$exchange_enabled = WFCP_Helper::to_bool( isset( $general['exchange_rate_enabled'] ) ? $general['exchange_rate_enabled'] : true );
				$purchase_currency = isset( $general['purchase_currency'] ) ? $general['purchase_currency'] : 'base';
				$rate = isset( $general['exchange_rate'] ) ? (float) $general['exchange_rate'] : 0.0;
				if ( $exchange_enabled && $rate > 0 && ( ! $purchase_currency || 'base' === $purchase_currency ) ) {
					$cost = $cost * $rate;
				}
			}
		}

		$cache[ $lookup_id ] = $cost;
		return $cost;
	}

	/**
	 * @param WC_Order              $order Order.
	 * @param WC_Order_Item_Product $item Line item.
	 * @return string retail|credit|installment|wholesale|marketplace
	 */
	private static function resolve_price_tier( $order, $item ) {
		$platform = (string) $order->get_meta( '_wnc_platform' );
		if ( '' !== $platform ) {
			return 'marketplace:' . sanitize_key( $platform );
		}
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
			if ( 'wholesale' === $meta ) {
				return 'wholesale';
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
		if ( 0 === strpos( $tier, 'marketplace:' ) ) {
			$slug = substr( $tier, strlen( 'marketplace:' ) );
			return sprintf(
				/* translators: %s: marketplace platform slug */
				__( 'Marketplace (%s)', 'webino-dashboard' ),
				$slug
			);
		}
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
			'products'            => array_slice( (array) ( $current['products'] ?? array() ), 0, 50 ),
			'variations'          => array_slice( (array) ( $current['variations'] ?? array() ), 0, 50 ),
			'categories_full'     => array_slice( (array) ( $current['categories'] ?? array() ), 0, 50 ),
			'brands'              => array_slice( (array) ( $current['brands'] ?? array() ), 0, 50 ),
			'customers_full'      => array_slice( (array) ( $current['customers'] ?? array() ), 0, 50 ),
			'coupons_full'        => array_slice( (array) ( $current['coupons'] ?? array() ), 0, 50 ),
			'taxes'               => $current['taxes'] ?? array(),
			'downloads'           => array_slice( (array) ( $current['downloads'] ?? array() ), 0, 50 ),
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
			'v'        => 4,
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
		$by_utm_source  = array();
		$by_utm_medium  = array();
		$by_utm_campaign = array();
		$by_utm         = array();
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
		$variations      = array();
		$categories      = array();
		$brands          = array();
		$customers       = array();
		$coupons         = array();
		$taxes           = array();
		$orders_lite     = array();
		$orders_by_payment = array();
		$orders_by_utm_source = array();
		$new_customers   = 0;
		$returning_customers = 0;
		$utm_none        = '(direct/none)';
		$sample_limit    = 20;

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
					'method'       => $pay_method,
					'title'        => $pay_title,
					'count'        => 0,
					'revenue'      => 0.0,
					'cogs'         => 0.0,
					'line_revenue' => 0.0,
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

			$utm_source   = (string) $o->get_meta( '_wc_order_attribution_utm_source' );
			$utm_medium   = (string) $o->get_meta( '_wc_order_attribution_utm_medium' );
			$utm_campaign = (string) $o->get_meta( '_wc_order_attribution_utm_campaign' );
			if ( '' === $utm_source ) {
				$utm_source = $utm_none;
			}
			if ( '' === $utm_medium ) {
				$utm_medium = $utm_none;
			}
			if ( '' === $utm_campaign ) {
				$utm_campaign = $utm_none;
			}
			self::bump_utm_bucket( $by_utm_source, 'source', $utm_source, $total );
			self::bump_utm_bucket( $by_utm_medium, 'medium', $utm_medium, $total );
			self::bump_utm_bucket( $by_utm_campaign, 'campaign', $utm_campaign, $total );
			$utm_combo_key = $utm_source . "\0" . $utm_medium . "\0" . $utm_campaign;
			if ( ! isset( $by_utm[ $utm_combo_key ] ) ) {
				$by_utm[ $utm_combo_key ] = array(
					'source'       => $utm_source,
					'medium'       => $utm_medium,
					'campaign'     => $utm_campaign,
					'count'        => 0,
					'revenue'      => 0.0,
					'cogs'         => 0.0,
					'line_revenue' => 0.0,
				);
			}
			++$by_utm[ $utm_combo_key ]['count'];
			$by_utm[ $utm_combo_key ]['revenue'] += $total;

			$order_line_cogs = 0.0;
			$order_line_rev  = 0.0;

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
					$series_buckets[ $key ]['revenue']  += $total;
					$series_buckets[ $key ]['refunds']  += $refunded;
					$series_buckets[ $key ]['coupons']  += (float) $o->get_discount_total();
					$series_buckets[ $key ]['tax']      += (float) $o->get_total_tax();
					$series_buckets[ $key ]['shipping'] += (float) $o->get_shipping_total();
					$series_buckets[ $key ]['net']      += max( 0, $total - $refunded );
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
				$order_line_cogs          += $line_cogs;
				$order_line_rev           += $line_rev;
				if ( $unit_cost <= 0 ) {
					$summary['items_missing_cost'] += $qty;
				}

				if ( ! isset( $by_price_tier[ $tier ] ) ) {
					$by_price_tier[ $tier ] = array( 'count' => 0, 'revenue' => 0.0, 'cogs' => 0.0 );
				}
				++$by_price_tier[ $tier ]['count'];
				$by_price_tier[ $tier ]['revenue'] += $line_rev;
				$by_price_tier[ $tier ]['cogs']    += $line_cogs;

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

					if ( $vid > 0 ) {
						if ( ! isset( $variations[ $vid ] ) ) {
							$variations[ $vid ] = array(
								'variation_id' => $vid,
								'product_id'   => $pid,
								'name'         => $item->get_name(),
								'quantity'     => 0,
								'revenue'      => 0.0,
								'cogs'         => 0.0,
								'missing_cost' => 0,
							);
						}
						$variations[ $vid ]['quantity'] += $qty;
						$variations[ $vid ]['revenue']  += $line_rev;
						$variations[ $vid ]['cogs']     += $line_cogs;
						if ( $unit_cost <= 0 ) {
							$variations[ $vid ]['missing_cost'] += $qty;
						}
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
									'cogs'     => 0.0,
								);
							}
							$categories[ $tid ]['quantity'] += $qty;
							$categories[ $tid ]['revenue']  += $line_rev;
							$categories[ $tid ]['cogs']     += $line_cogs;
						}
					}
					if ( taxonomy_exists( 'product_brand' ) ) {
						$brand_terms = wp_get_post_terms( $pid, 'product_brand', array( 'fields' => 'all' ) );
						if ( ! is_wp_error( $brand_terms ) ) {
							foreach ( $brand_terms as $term ) {
								$tid = (int) $term->term_id;
								if ( ! isset( $brands[ $tid ] ) ) {
									$brands[ $tid ] = array(
										'term_id'  => $tid,
										'name'     => $term->name,
										'quantity' => 0,
										'revenue'  => 0.0,
										'cogs'     => 0.0,
									);
								}
								$brands[ $tid ]['quantity'] += $qty;
								$brands[ $tid ]['revenue']  += $line_rev;
								$brands[ $tid ]['cogs']     += $line_cogs;
							}
						}
					}
				}
			}

			$by_payment[ $pay_method ]['cogs']         += $order_line_cogs;
			$by_payment[ $pay_method ]['line_revenue'] += $order_line_rev;
			self::add_utm_costs( $by_utm_source, $utm_source, $order_line_cogs, $order_line_rev );
			self::add_utm_costs( $by_utm_medium, $utm_medium, $order_line_cogs, $order_line_rev );
			self::add_utm_costs( $by_utm_campaign, $utm_campaign, $order_line_cogs, $order_line_rev );
			$by_utm[ $utm_combo_key ]['cogs']         += $order_line_cogs;
			$by_utm[ $utm_combo_key ]['line_revenue'] += $order_line_rev;

			$customer_name = trim( $o->get_formatted_billing_full_name() );
			if ( '' === $customer_name ) {
				$customer_name = trim( $o->get_formatted_shipping_full_name() );
			}
			$order_lite = array(
				'id'             => (int) $o->get_id(),
				'number'         => (string) $o->get_order_number(),
				'date'           => $dc ? $dc->format( 'c' ) : null,
				'status'         => $status,
				'status_label'   => $st_label,
				'total'          => $total,
				'payment_method' => $pay_method,
				'payment_title'  => $pay_title,
				'utm_source'     => $utm_source,
				'utm_medium'     => $utm_medium,
				'utm_campaign'   => $utm_campaign,
				'customer_name'  => $customer_name ?: __( 'Guest', 'webino-dashboard' ),
			);
			$orders_lite[] = $order_lite;
			if ( ! isset( $orders_by_payment[ $pay_method ] ) ) {
				$orders_by_payment[ $pay_method ] = array();
			}
			if ( count( $orders_by_payment[ $pay_method ] ) < $sample_limit ) {
				$orders_by_payment[ $pay_method ][] = $order_lite;
			}
			if ( ! isset( $orders_by_utm_source[ $utm_source ] ) ) {
				$orders_by_utm_source[ $utm_source ] = array();
			}
			if ( count( $orders_by_utm_source[ $utm_source ] ) < $sample_limit ) {
				$orders_by_utm_source[ $utm_source ][] = $order_lite;
			}

			$cust_id = (int) $o->get_customer_id();
			$email   = (string) $o->get_billing_email();
			$ckey    = $cust_id > 0 ? 'u_' . $cust_id : ( $email ? 'e_' . md5( strtolower( $email ) ) : 'g_' . $o->get_id() );
			$name    = trim( $o->get_formatted_billing_full_name() );
			$order_ts = $dc ? $dc->getTimestamp() : $from_ts;
			if ( ! isset( $customers[ $ckey ] ) ) {
				$is_new = self::customer_is_new( $cust_id, $email, $from_ts );
				if ( $is_new ) {
					++$new_customers;
				} else {
					++$returning_customers;
				}
				$customers[ $ckey ] = array(
					'customer_id' => $cust_id,
					'name'        => $name ?: __( 'Guest', 'webino-dashboard' ),
					'email'       => $email,
					'orders'      => 0,
					'revenue'     => 0.0,
					'aov'         => 0.0,
					'is_new'      => $is_new,
					'last_order'  => $order_ts,
				);
			}
			++$customers[ $ckey ]['orders'];
			$customers[ $ckey ]['revenue'] += $total;
			if ( $order_ts > (int) $customers[ $ckey ]['last_order'] ) {
				$customers[ $ckey ]['last_order'] = $order_ts;
			}

			$discount_total = (float) $o->get_discount_total();
			if ( is_callable( array( $o, 'get_coupon_codes' ) ) ) {
				$codes = $o->get_coupon_codes();
				$code_count = count( $codes );
				foreach ( $codes as $code ) {
					$code = (string) $code;
					if ( '' === $code ) {
						continue;
					}
					if ( ! isset( $coupons[ $code ] ) ) {
						$coupons[ $code ] = array(
							'code'     => $code,
							'count'    => 0,
							'revenue'  => 0.0,
							'discount' => 0.0,
						);
					}
					++$coupons[ $code ]['count'];
					$coupons[ $code ]['revenue']  += $total;
					$coupons[ $code ]['discount'] += $code_count > 0 ? ( $discount_total / $code_count ) : 0.0;
				}
			}

			foreach ( $o->get_items( 'tax' ) as $tax_item ) {
				if ( ! is_a( $tax_item, 'WC_Order_Item_Tax' ) ) {
					continue;
				}
				$rate_id = (int) $tax_item->get_rate_id();
				$tkey    = $rate_id > 0 ? 'r_' . $rate_id : 'c_' . sanitize_key( (string) $tax_item->get_rate_code() );
				if ( ! isset( $taxes[ $tkey ] ) ) {
					$taxes[ $tkey ] = array(
						'rate_id'      => $rate_id,
						'code'         => (string) $tax_item->get_rate_code(),
						'label'        => (string) $tax_item->get_label(),
						'rate_percent' => (float) $tax_item->get_rate_percent(),
						'order_tax'    => 0.0,
						'shipping_tax' => 0.0,
						'total'        => 0.0,
						'orders'       => 0,
					);
				}
				$order_tax    = (float) $tax_item->get_tax_total();
				$shipping_tax = (float) $tax_item->get_shipping_tax_total();
				$taxes[ $tkey ]['order_tax']    += $order_tax;
				$taxes[ $tkey ]['shipping_tax'] += $shipping_tax;
				$taxes[ $tkey ]['total']        += $order_tax + $shipping_tax;
				++$taxes[ $tkey ]['orders'];
			}
		}

		if ( $truncated ) {
			$agg = Webino_Dashboard_Order_Aggregates::sum_orders_in_range(
				array(
					'status'       => self::normalize_query_statuses( $statuses ),
					'date_created' => (int) $from_ts . '...' . (int) $to_ts,
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

		$profit_products = self::finalize_profit_rows( $products_profit, 'product_id' );
		$variation_rows  = self::finalize_profit_rows( $variations, 'variation_id' );
		$category_rows   = self::finalize_profit_rows( $categories, 'term_id' );
		$brand_rows      = self::finalize_profit_rows( $brands, 'term_id' );

		foreach ( $customers as $ck => $crow ) {
			$ord = max( 1, (int) $crow['orders'] );
			$customers[ $ck ]['aov'] = (float) $crow['revenue'] / $ord;
		}

		$summary['new_customers']       = $new_customers;
		$summary['returning_customers'] = $returning_customers;
		$summary['items_per_order']     = $summary['order_count'] > 0 ? $summary['items_sold'] / $summary['order_count'] : 0.0;
		$summary['target_margin_pct']   = self::wfcp_retail_margin_target();

		$hour_out = array();
		foreach ( $by_hour as $hour => $count ) {
			$hour_out[] = array(
				'hour'   => (int) $hour,
				'orders' => (int) $count,
			);
		}

		$tax_rows = array_values( $taxes );
		usort(
			$tax_rows,
			function ( $a, $b ) {
				return ( (float) $b['total'] ) <=> ( (float) $a['total'] );
			}
		);

		$coupon_rows = array_values( $coupons );
		usort(
			$coupon_rows,
			function ( $a, $b ) {
				return ( (int) $b['count'] ) <=> ( (int) $a['count'] );
			}
		);

		$customer_rows = array_values( $customers );
		usort(
			$customer_rows,
			function ( $a, $b ) {
				return ( (float) $b['revenue'] ) <=> ( (float) $a['revenue'] );
			}
		);

		$product_rows = array_values( $products );
		usort(
			$product_rows,
			function ( $a, $b ) {
				return ( (float) $b['revenue'] ) <=> ( (float) $a['revenue'] );
			}
		);

		return array(
			'summary'             => $summary,
			'series'              => array_values( $series_buckets ),
			'by_status'           => self::sort_by_revenue( array_values( $by_status ) ),
			'by_payment'          => self::finalize_finance_dim_rows( array_values( $by_payment ) ),
			'by_source'           => self::sort_by_revenue( array_values( $by_source ) ),
			'by_utm_source'       => self::finalize_finance_dim_rows( array_values( $by_utm_source ) ),
			'by_utm_medium'       => self::finalize_finance_dim_rows( array_values( $by_utm_medium ) ),
			'by_utm_campaign'     => self::finalize_finance_dim_rows( array_values( $by_utm_campaign ) ),
			'by_utm'              => self::finalize_finance_dim_rows( array_values( $by_utm ) ),
			'by_hour'             => $hour_out,
			'by_price_tier'       => self::finalize_tier_rows( $by_price_tier ),
			'heatmap'             => self::flatten_heatmap( $heatmap ),
			'top_products'        => self::top_n( $product_rows, 'revenue', 10 ),
			'top_products_profit' => self::top_n( $profit_products, 'profit', 10 ),
			'top_categories'      => self::top_n( $category_rows, 'revenue', 10 ),
			'top_customers'       => self::top_n( $customer_rows, 'revenue', 10 ),
			'top_coupons'         => self::top_n( $coupon_rows, 'count', 10 ),
			'products'            => $profit_products,
			'variations'          => $variation_rows,
			'categories'          => $category_rows,
			'brands'              => $brand_rows,
			'customers'           => $customer_rows,
			'coupons'             => $coupon_rows,
			'taxes'               => $tax_rows,
			'downloads'           => self::build_downloads( $from_ts, $to_ts ),
			'orders_lite'         => $orders_lite,
			'orders_by_payment'   => $orders_by_payment,
			'orders_by_utm_source'=> $orders_by_utm_source,
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
		$statuses = self::normalize_query_statuses( $statuses );
		$ids      = self::fetch_order_ids_from_stats( $from_ts, $to_ts, $statuses );
		if ( is_array( $ids ) && $ids ) {
			return self::load_orders_by_ids( $ids );
		}
		return self::fetch_orders_via_wc( $from_ts, $to_ts, $statuses );
	}

	/**
	 * @param int      $from_ts From.
	 * @param int      $to_ts To.
	 * @param string[] $statuses Status slugs without wc- prefix.
	 * @return int[]|null
	 */
	private static function fetch_order_ids_from_stats( $from_ts, $to_ts, $statuses ) {
		global $wpdb;
		$table = $wpdb->prefix . 'wc_order_stats';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) {
			return null;
		}

		$wc_status = array();
		foreach ( $statuses as $st ) {
			$slug = self::normalize_status_slug( $st );
			if ( ! $slug ) {
				continue;
			}
			$wc_status[] = $slug;
			$wc_status[] = 'wc-' . $slug;
		}
		$wc_status = array_values( array_unique( $wc_status ) );
		if ( ! $wc_status ) {
			return array();
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$cols     = $wpdb->get_col( "DESC {$table}", 0 );
		$date_col = is_array( $cols ) && in_array( 'date_created_gmt', $cols, true ) ? 'date_created_gmt' : 'date_created';

		$placeholders = implode( ', ', array_fill( 0, count( $wc_status ), '%s' ) );
		$from_gmt     = gmdate( 'Y-m-d H:i:s', $from_ts );
		$to_gmt       = gmdate( 'Y-m-d H:i:s', $to_ts );
		$limit        = (int) Webino_Dashboard_Order_Aggregates::MAX_ORDERS + 1;
		$params       = array_merge( array( $from_gmt, $to_gmt ), $wc_status, array( $limit ) );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT order_id FROM {$table}
				WHERE {$date_col} >= %s AND {$date_col} <= %s
				AND parent_id = 0
				AND status IN ({$placeholders})
				ORDER BY {$date_col} DESC
				LIMIT %d",
				$params
			)
		);

		if ( ! is_array( $ids ) ) {
			return null;
		}
		return array_map( 'intval', $ids );
	}

	/**
	 * @param int[] $ids Order IDs.
	 * @return array{orders:WC_Order[],truncated:bool}
	 */
	private static function load_orders_by_ids( $ids ) {
		$ids       = array_values( array_filter( array_map( 'intval', $ids ) ) );
		$truncated = count( $ids ) > Webino_Dashboard_Order_Aggregates::MAX_ORDERS;
		$ids       = array_slice( $ids, 0, Webino_Dashboard_Order_Aggregates::MAX_ORDERS );
		$orders    = array();

		foreach ( array_chunk( $ids, Webino_Dashboard_Order_Aggregates::PAGE_SIZE ) as $chunk ) {
			$batch = wc_get_orders(
				array(
					'limit'   => count( $chunk ),
					'include' => $chunk,
					'type'    => 'shop_order',
					'return'  => 'objects',
				)
			);
			if ( ! is_array( $batch ) ) {
				continue;
			}
			foreach ( $batch as $order ) {
				$orders[] = $order;
			}
		}

		return array(
			'orders'    => $orders,
			'truncated' => $truncated,
		);
	}

	/**
	 * @param int      $from_ts From.
	 * @param int      $to_ts To.
	 * @param string[] $statuses Status slugs without wc- prefix.
	 * @return array{orders:WC_Order[],truncated:bool}
	 */
	private static function fetch_orders_via_wc( $from_ts, $to_ts, $statuses ) {
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
					'status'       => $statuses,
					'type'         => 'shop_order',
					'date_created' => (int) $from_ts . '...' . (int) $to_ts,
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
					'key'      => $key,
					'label'    => self::series_label_for_key( $key, $interval ),
					'revenue'  => 0.0,
					'orders'   => 0,
					'items'    => 0,
					'cogs'     => 0.0,
					'profit'   => 0.0,
					'refunds'  => 0.0,
					'coupons'  => 0.0,
					'net'      => 0.0,
					'tax'      => 0.0,
					'shipping' => 0.0,
				);
			}
			if ( 'month' === $interval ) {
				$dt     = ( new DateTimeImmutable( '@' . $cursor ) )->setTimezone( wp_timezone() );
				$next   = $dt->modify( 'first day of next month' )->setTime( 0, 0 )->getTimestamp();
			} elseif ( 'week' === $interval ) {
				$dt     = ( new DateTimeImmutable( '@' . $cursor ) )->setTimezone( wp_timezone() );
				$next   = $dt->modify( 'monday next week' )->setTime( 0, 0 )->getTimestamp();
			} else {
				$next = $cursor + DAY_IN_SECONDS;
			}
			if ( $next <= $cursor || count( $buckets ) > 400 ) {
				break;
			}
			$cursor = $next;
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

	/**
	 * @param array<int|string,array<string,mixed>> $rows Rows.
	 * @param string                                $id_key ID key.
	 * @return array<int,array<string,mixed>>
	 */
	private static function finalize_profit_rows( $rows, $id_key ) {
		$out = array();
		foreach ( $rows as $row ) {
			$rev    = (float) ( $row['revenue'] ?? 0 );
			$cogs   = (float) ( $row['cogs'] ?? 0 );
			$qty    = max( 0, (int) ( $row['quantity'] ?? 0 ) );
			$profit = $rev - $cogs;
			$item   = array(
				'name'           => $row['name'] ?? '',
				'quantity'       => $qty,
				'revenue'        => $rev,
				'cogs'           => $cogs,
				'profit'         => $profit,
				'margin_pct'     => self::margin_pct( $profit, $rev ),
				'missing_cost'   => (int) ( $row['missing_cost'] ?? 0 ),
				'avg_sell_price' => $qty > 0 ? $rev / $qty : 0.0,
				'avg_cost'       => $qty > 0 ? $cogs / $qty : 0.0,
			);
			if ( isset( $row[ $id_key ] ) ) {
				$item[ $id_key ] = (int) $row[ $id_key ];
			}
			if ( isset( $row['product_id'] ) && 'product_id' !== $id_key ) {
				$item['product_id'] = (int) $row['product_id'];
			}
			if ( isset( $row['term_id'] ) ) {
				$item['term_id'] = (int) $row['term_id'];
			}
			$out[] = $item;
		}
		usort(
			$out,
			function ( $a, $b ) {
				return ( (float) $b['profit'] ) <=> ( (float) $a['profit'] );
			}
		);
		return $out;
	}

	/**
	 * @return float
	 */
	private static function wfcp_retail_margin_target() {
		if ( ! self::wfcp_enabled() ) {
			return 0.0;
		}
		$pct = WFCP_Helper::get_settings( 'retail', 'profit_percent' );
		return $pct ? (float) $pct : 0.0;
	}

	/**
	 * @param int    $customer_id Customer ID.
	 * @param string $email Email.
	 * @param int    $from_ts Period start.
	 * @return bool
	 */
	private static function customer_is_new( $customer_id, $email, $from_ts ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return true;
		}
		$args = array(
			'limit'        => 1,
			'return'       => 'ids',
			'status'       => array_keys( wc_get_order_statuses() ),
			'date_created' => '<=' . wp_date( 'Y-m-d H:i:s', max( 0, $from_ts - 1 ) ),
		);
		if ( $customer_id > 0 ) {
			$args['customer_id'] = $customer_id;
		} elseif ( $email ) {
			$args['billing_email'] = $email;
		} else {
			return true;
		}
		$prior = wc_get_orders( $args );
		return empty( $prior );
	}

	/**
	 * @param int $from_ts From.
	 * @param int $to_ts To.
	 * @return array<int,array<string,mixed>>
	 */
	private static function build_downloads( $from_ts, $to_ts ) {
		global $wpdb;
		$table = $wpdb->prefix . 'woocommerce_downloadable_product_permissions';
		$log   = $wpdb->prefix . 'woocommerce_download_log';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $log ) );
		if ( ! $exists ) {
			return array();
		}
		$from = gmdate( 'Y-m-d H:i:s', $from_ts );
		$to   = gmdate( 'Y-m-d H:i:s', $to_ts );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT p.product_id, p.order_id, COUNT(l.download_log_id) AS downloads
				FROM {$log} l
				INNER JOIN {$table} p ON p.permission_id = l.permission_id
				WHERE l.timestamp BETWEEN %s AND %s
				GROUP BY p.product_id
				ORDER BY downloads DESC
				LIMIT 500",
				$from,
				$to
			),
			ARRAY_A
		);
		$out = array();
		foreach ( (array) $rows as $row ) {
			$pid  = (int) ( $row['product_id'] ?? 0 );
			$name = $pid ? get_the_title( $pid ) : '';
			$out[] = array(
				'product_id' => $pid,
				'name'       => $name ?: ( '#' . $pid ),
				'downloads'  => (int) ( $row['downloads'] ?? 0 ),
			);
		}
		return $out;
	}

	/**
	 * @param array<string,array<string,mixed>> $buckets Buckets by key.
	 * @param string                            $dim_key Dimension field name (source|medium|campaign).
	 * @param string                            $value Dimension value.
	 * @param float                             $total Order total.
	 * @return void
	 */
	private static function bump_utm_bucket( &$buckets, $dim_key, $value, $total ) {
		if ( ! isset( $buckets[ $value ] ) ) {
			$buckets[ $value ] = array(
				$dim_key       => $value,
				'count'        => 0,
				'revenue'      => 0.0,
				'cogs'         => 0.0,
				'line_revenue' => 0.0,
			);
		}
		++$buckets[ $value ]['count'];
		$buckets[ $value ]['revenue'] += $total;
	}

	/**
	 * @param array<string,array<string,mixed>> $buckets Buckets.
	 * @param string                            $key Key.
	 * @param float                             $cogs COGS.
	 * @param float                             $line_rev Line revenue.
	 * @return void
	 */
	private static function add_utm_costs( &$buckets, $key, $cogs, $line_rev ) {
		if ( ! isset( $buckets[ $key ] ) ) {
			return;
		}
		$buckets[ $key ]['cogs']         += $cogs;
		$buckets[ $key ]['line_revenue'] += $line_rev;
	}

	/**
	 * Finalize payment / UTM dimension rows with profit + AOV.
	 *
	 * @param array<int,array<string,mixed>> $rows Rows.
	 * @return array<int,array<string,mixed>>
	 */
	private static function finalize_finance_dim_rows( $rows ) {
		$out = array();
		foreach ( $rows as $row ) {
			$line   = (float) ( $row['line_revenue'] ?? 0 );
			$cogs   = (float) ( $row['cogs'] ?? 0 );
			$profit = $line - $cogs;
			$count  = (int) ( $row['count'] ?? 0 );
			$rev    = (float) ( $row['revenue'] ?? 0 );
			unset( $row['line_revenue'] );
			$row['cogs']            = $cogs;
			$row['profit']          = $profit;
			$row['margin_pct']      = self::margin_pct( $profit, $line );
			$row['avg_order_value'] = $count > 0 ? $rev / $count : 0.0;
			$out[]                  = $row;
		}
		usort(
			$out,
			function ( $a, $b ) {
				return ( (float) ( $b['revenue'] ?? 0 ) ) <=> ( (float) ( $a['revenue'] ?? 0 ) );
			}
		);
		return $out;
	}

	/**
	 * Filter and paginate orders_lite rows.
	 *
	 * @param array<int,array<string,mixed>> $orders Orders.
	 * @param WP_REST_Request                $request Request.
	 * @return array{items:array<int,array<string,mixed>>,total:int,page:int,per_page:int}
	 */
	private static function filter_orders_lite( $orders, $request ) {
		$pay    = sanitize_key( (string) $request->get_param( 'payment_method' ) );
		$us     = (string) $request->get_param( 'utm_source' );
		$um     = (string) $request->get_param( 'utm_medium' );
		$uc     = (string) $request->get_param( 'utm_campaign' );
		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );

		$filtered = array();
		foreach ( $orders as $row ) {
			if ( $pay && (string) ( $row['payment_method'] ?? '' ) !== $pay ) {
				continue;
			}
			if ( '' !== $us && (string) ( $row['utm_source'] ?? '' ) !== $us ) {
				continue;
			}
			if ( '' !== $um && (string) ( $row['utm_medium'] ?? '' ) !== $um ) {
				continue;
			}
			if ( '' !== $uc && (string) ( $row['utm_campaign'] ?? '' ) !== $uc ) {
				continue;
			}
			if ( '' !== $search ) {
				$hay = strtolower(
					(string) ( $row['number'] ?? '' ) . ' ' .
					(string) ( $row['customer_name'] ?? '' ) . ' ' .
					(string) ( $row['payment_title'] ?? '' ) . ' ' .
					(string) ( $row['utm_source'] ?? '' )
				);
				if ( false === strpos( $hay, strtolower( $search ) ) ) {
					continue;
				}
			}
			$filtered[] = $row;
		}

		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = (int) $request->get_param( 'per_page' );
		if ( $per_page <= 0 ) {
			$per_page = 25;
		}
		$per_page = min( 100, $per_page );
		$total    = count( $filtered );
		$offset   = ( $page - 1 ) * $per_page;
		$items    = array_slice( $filtered, $offset, $per_page );

		return array(
			'items'    => $items,
			'total'    => $total,
			'page'     => $page,
			'per_page' => $per_page,
		);
	}

	/**
	 * Cached full report for list endpoints.
	 *
	 * @param int      $from_ts From.
	 * @param int      $to_ts To.
	 * @param string   $interval Interval.
	 * @param string[] $statuses Statuses.
	 * @return array<string,mixed>
	 */
	public static function get_cached_report( $from_ts, $to_ts, $interval, $statuses ) {
		$key = 'webino_order_report_full_' . md5(
			wp_json_encode(
				array(
					'from'     => $from_ts,
					'to'       => $to_ts,
					'interval' => $interval,
					'status'   => $statuses,
					'uid'      => get_current_user_id(),
					'v'        => 4,
				)
			)
		);
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			return $cached;
		}
		$data = self::build_report( $from_ts, $to_ts, $interval, $statuses );
		set_transient( $key, $data, self::CACHE_TTL );
		return $data;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return array{0:int,1:int,2:string,3:string[]}
	 */
	private static function parse_common_params( $request ) {
		$from_ts = self::parse_timestamp( $request->get_param( 'from' ) ?: strtotime( '-30 days' ) );
		$to_ts   = self::parse_timestamp( $request->get_param( 'to' ) ?: time() );
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
		return array( $from_ts, $to_ts, $interval, $statuses );
	}

	/**
	 * @param array<int,array<string,mixed>> $rows Rows.
	 * @param WP_REST_Request                $request Request.
	 * @param string[]                       $search_keys Searchable keys.
	 * @return array{items:array,total:int,page:int,per_page:int}
	 */
	public static function paginate_rows( $rows, $request, $search_keys = array( 'name', 'code', 'email', 'label' ) ) {
		$search = strtolower( trim( (string) $request->get_param( 'search' ) ) );
		$orderby = sanitize_key( (string) ( $request->get_param( 'orderby' ) ?: '' ) );
		$order   = strtolower( (string) ( $request->get_param( 'order' ) ?: 'desc' ) );
		$page    = max( 1, (int) ( $request->get_param( 'page' ) ?: 1 ) );
		$per     = min( 100, max( 1, (int) ( $request->get_param( 'per_page' ) ?: 25 ) ) );

		if ( '' !== $search ) {
			$rows = array_values(
				array_filter(
					$rows,
					function ( $row ) use ( $search, $search_keys ) {
						foreach ( $search_keys as $k ) {
							if ( isset( $row[ $k ] ) && false !== strpos( strtolower( (string) $row[ $k ] ), $search ) ) {
								return true;
							}
						}
						return false;
					}
				)
			);
		}

		if ( $orderby ) {
			usort(
				$rows,
				function ( $a, $b ) use ( $orderby, $order ) {
					$av = $a[ $orderby ] ?? 0;
					$bv = $b[ $orderby ] ?? 0;
					if ( is_numeric( $av ) && is_numeric( $bv ) ) {
						$cmp = (float) $av <=> (float) $bv;
					} else {
						$cmp = strcasecmp( (string) $av, (string) $bv );
					}
					return 'asc' === $order ? $cmp : -$cmp;
				}
			);
		}

		$total = count( $rows );
		$slice = array_slice( $rows, ( $page - 1 ) * $per, $per );
		return array(
			'items'    => $slice,
			'total'    => $total,
			'page'     => $page,
			'per_page' => $per,
		);
	}

	/**
	 * List endpoint for products|variations|categories|coupons|taxes|customers|downloads|brands.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_list( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$section = sanitize_key( (string) $request['section'] );
		$map     = array(
			'products'   => 'products',
			'variations' => 'variations',
			'categories' => 'categories',
			'brands'     => 'brands',
			'coupons'    => 'coupons',
			'taxes'      => 'taxes',
			'customers'  => 'customers',
			'downloads'  => 'downloads',
		);
		if ( ! isset( $map[ $section ] ) ) {
			return new WP_Error( 'invalid_section', $section, array( 'status' => 404 ) );
		}
		list( $from_ts, $to_ts, $interval, $statuses ) = self::parse_common_params( $request );
		$report = self::get_cached_report( $from_ts, $to_ts, $interval, $statuses );
		$key    = $map[ $section ];
		$rows   = isset( $report[ $key ] ) && is_array( $report[ $key ] ) ? $report[ $key ] : array();
		$page   = self::paginate_rows( $rows, $request );
		return new WP_REST_Response(
			array(
				'currency'  => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '',
				'from'      => $from_ts,
				'to'        => $to_ts,
				'from_date' => gmdate( 'c', $from_ts ),
				'to_date'   => gmdate( 'c', $to_ts ),
				'interval'  => $interval,
				'statuses'  => $statuses,
				'summary'   => $report['summary'] ?? array(),
				'series'    => $report['series'] ?? array(),
				'section'   => $section,
				'items'     => $page['items'],
				'total'     => $page['total'],
				'page'      => $page['page'],
				'per_page'  => $page['per_page'],
				'truncated' => ! empty( $report['truncated'] ),
			)
		);
	}

	/**
	 * Revenue-focused payload.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_revenue( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		list( $from_ts, $to_ts, $interval, $statuses ) = self::parse_common_params( $request );
		$compare = rest_sanitize_boolean( $request->get_param( 'compare' ) );
		$current = self::get_cached_report( $from_ts, $to_ts, $interval, $statuses );
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
			'truncated' => ! empty( $current['truncated'] ),
		);
		if ( $compare ) {
			list( $cmp_from, $cmp_to ) = self::compare_range( $from_ts, $to_ts );
			$prev = self::get_cached_report( $cmp_from, $cmp_to, $interval, $statuses );
			$payload['compare'] = array(
				'from'      => $cmp_from,
				'to'        => $cmp_to,
				'from_date' => gmdate( 'c', $cmp_from ),
				'to_date'   => gmdate( 'c', $cmp_to ),
				'summary'   => $prev['summary'],
				'series'    => $prev['series'],
			);
		}
		return new WP_REST_Response( $payload );
	}

	/**
	 * Full sales / P&L payload (also keeps legacy revenue + order_count).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_sales_pnl( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		list( $from_ts, $to_ts, $interval, $statuses ) = self::parse_common_params( $request );
		$compare = rest_sanitize_boolean( $request->get_param( 'compare' ) );
		$current = self::get_cached_report( $from_ts, $to_ts, $interval, $statuses );
		$summary = $current['summary'];
		$page    = self::paginate_rows( (array) ( $current['products'] ?? array() ), $request );
		$payload = array(
			'currency'     => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '',
			'from'         => $from_ts,
			'to'           => $to_ts,
			'from_date'    => gmdate( 'c', $from_ts ),
			'to_date'      => gmdate( 'c', $to_ts ),
			'interval'     => $interval,
			'statuses'     => $statuses,
			'revenue'      => (float) ( $summary['revenue'] ?? 0 ),
			'order_count'  => (int) ( $summary['order_count'] ?? 0 ),
			'summary'      => $summary,
			'series'       => $current['series'],
			'by_price_tier'=> $current['by_price_tier'] ?? array(),
			'items'        => $page['items'],
			'total'        => $page['total'],
			'page'         => $page['page'],
			'per_page'     => $page['per_page'],
			'truncated'    => ! empty( $current['truncated'] ),
		);
		if ( $compare ) {
			list( $cmp_from, $cmp_to ) = self::compare_range( $from_ts, $to_ts );
			$prev = self::get_cached_report( $cmp_from, $cmp_to, $interval, $statuses );
			$payload['compare'] = array(
				'from'      => $cmp_from,
				'to'        => $cmp_to,
				'from_date' => gmdate( 'c', $cmp_from ),
				'to_date'   => gmdate( 'c', $cmp_to ),
				'summary'   => $prev['summary'],
				'series'    => $prev['series'],
			);
		}
		return new WP_REST_Response( $payload );
	}

	/**
	 * Financial hub: P&amp;L + gateways + structured UTM + order drill-down.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_financial( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		list( $from_ts, $to_ts, $interval, $statuses ) = self::parse_common_params( $request );
		$compare = rest_sanitize_boolean( $request->get_param( 'compare' ) );
		$current = self::get_cached_report( $from_ts, $to_ts, $interval, $statuses );
		$orders_lite = isset( $current['orders_lite'] ) && is_array( $current['orders_lite'] )
			? $current['orders_lite']
			: array();
		$filtered = self::filter_orders_lite( $orders_lite, $request );

		$payload = array(
			'currency'             => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '',
			'from'                 => $from_ts,
			'to'                   => $to_ts,
			'from_date'            => gmdate( 'c', $from_ts ),
			'to_date'              => gmdate( 'c', $to_ts ),
			'interval'             => $interval,
			'statuses'             => $statuses,
			'summary'              => $current['summary'],
			'series'               => $current['series'],
			'by_payment'           => $current['by_payment'] ?? array(),
			'by_source'            => $current['by_source'] ?? array(),
			'by_utm_source'        => $current['by_utm_source'] ?? array(),
			'by_utm_medium'        => $current['by_utm_medium'] ?? array(),
			'by_utm_campaign'      => $current['by_utm_campaign'] ?? array(),
			'by_utm'               => $current['by_utm'] ?? array(),
			'by_price_tier'        => $current['by_price_tier'] ?? array(),
			'by_status'            => $current['by_status'] ?? array(),
			'orders_by_payment'    => $current['orders_by_payment'] ?? array(),
			'orders_by_utm_source' => $current['orders_by_utm_source'] ?? array(),
			'orders_filtered'      => $filtered,
			'truncated'            => ! empty( $current['truncated'] ),
		);

		if ( $compare ) {
			list( $cmp_from, $cmp_to ) = self::compare_range( $from_ts, $to_ts );
			$prev = self::get_cached_report( $cmp_from, $cmp_to, $interval, $statuses );
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

		return new WP_REST_Response( $payload );
	}

	/**
	 * CSV export for financial hub.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	public static function rest_financial_export( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			status_header( 400 );
			echo esc_html__( 'Store module is not available.', 'webino-dashboard' );
			exit;
		}
		$response = self::rest_financial( $request );
		if ( is_wp_error( $response ) ) {
			status_header( 400 );
			echo esc_html( $response->get_error_message() );
			exit;
		}
		$data     = $response->get_data();
		$filename = 'shop-report-financial-' . gmdate( 'Y-m-d' ) . '.csv';
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
		echo "\xEF\xBB\xBF";
		$out = fopen( 'php://output', 'w' );
		if ( ! $out ) {
			exit;
		}

		fputcsv( $out, array( __( 'Metric', 'webino-dashboard' ), __( 'Value', 'webino-dashboard' ) ) );
		foreach ( (array) ( $data['summary'] ?? array() ) as $key => $val ) {
			fputcsv( $out, array( $key, is_scalar( $val ) ? $val : wp_json_encode( $val ) ) );
		}

		fputcsv( $out, array() );
		fputcsv(
			$out,
			array(
				__( 'Payment method', 'webino-dashboard' ),
				__( 'Title', 'webino-dashboard' ),
				__( 'Orders', 'webino-dashboard' ),
				__( 'Revenue', 'webino-dashboard' ),
				'COGS',
				__( 'Profit', 'webino-dashboard' ),
				__( 'Margin %', 'webino-dashboard' ),
				__( 'AOV', 'webino-dashboard' ),
			)
		);
		foreach ( (array) ( $data['by_payment'] ?? array() ) as $row ) {
			fputcsv(
				$out,
				array(
					$row['method'] ?? '',
					$row['title'] ?? '',
					$row['count'] ?? 0,
					$row['revenue'] ?? 0,
					$row['cogs'] ?? 0,
					$row['profit'] ?? 0,
					$row['margin_pct'] ?? 0,
					$row['avg_order_value'] ?? 0,
				)
			);
		}

		fputcsv( $out, array() );
		fputcsv(
			$out,
			array(
				'UTM Source',
				'UTM Medium',
				'UTM Campaign',
				__( 'Orders', 'webino-dashboard' ),
				__( 'Revenue', 'webino-dashboard' ),
				'COGS',
				__( 'Profit', 'webino-dashboard' ),
				__( 'Margin %', 'webino-dashboard' ),
				__( 'AOV', 'webino-dashboard' ),
			)
		);
		foreach ( (array) ( $data['by_utm'] ?? array() ) as $row ) {
			fputcsv(
				$out,
				array(
					$row['source'] ?? '',
					$row['medium'] ?? '',
					$row['campaign'] ?? '',
					$row['count'] ?? 0,
					$row['revenue'] ?? 0,
					$row['cogs'] ?? 0,
					$row['profit'] ?? 0,
					$row['margin_pct'] ?? 0,
					$row['avg_order_value'] ?? 0,
				)
			);
		}

		$orders = isset( $data['orders_filtered']['items'] ) ? (array) $data['orders_filtered']['items'] : array();
		if ( $orders ) {
			fputcsv( $out, array() );
			fputcsv(
				$out,
				array(
					__( 'Order', 'webino-dashboard' ),
					__( 'Date', 'webino-dashboard' ),
					__( 'Status', 'webino-dashboard' ),
					__( 'Customer', 'webino-dashboard' ),
					__( 'Total', 'webino-dashboard' ),
					__( 'Payment', 'webino-dashboard' ),
					'UTM Source',
					'UTM Medium',
					'UTM Campaign',
				)
			);
			foreach ( $orders as $row ) {
				fputcsv(
					$out,
					array(
						$row['number'] ?? $row['id'] ?? '',
						$row['date'] ?? '',
						$row['status_label'] ?? $row['status'] ?? '',
						$row['customer_name'] ?? '',
						$row['total'] ?? 0,
						$row['payment_title'] ?? $row['payment_method'] ?? '',
						$row['utm_source'] ?? '',
						$row['utm_medium'] ?? '',
						$row['utm_campaign'] ?? '',
					)
				);
			}
		}

		fclose( $out );
		exit;
	}

	/**
	 * Section CSV export.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	public static function rest_section_export( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			status_header( 400 );
			echo esc_html__( 'Store module is not available.', 'webino-dashboard' );
			exit;
		}
		$section = sanitize_key( (string) $request['section'] );
		if ( 'financial' === $section ) {
			self::rest_financial_export( $request );
			return;
		}
		if ( 'orders' === $section || 'overview' === $section ) {
			self::rest_export_csv( $request );
			return;
		}
		if ( 'sales' === $section ) {
			$request->set_param( 'section', 'products' );
			$section = 'products';
		}
		$request['section'] = $section;
		$response = self::rest_list( $request );
		if ( is_wp_error( $response ) ) {
			status_header( 400 );
			echo esc_html( $response->get_error_message() );
			exit;
		}
		$data = $response->get_data();
		$items = isset( $data['items'] ) ? (array) $data['items'] : array();
		// Re-fetch unpaginated for export.
		list( $from_ts, $to_ts, $interval, $statuses ) = self::parse_common_params( $request );
		$report = self::get_cached_report( $from_ts, $to_ts, $interval, $statuses );
		$map = array(
			'products'   => 'products',
			'variations' => 'variations',
			'categories' => 'categories',
			'brands'     => 'brands',
			'coupons'    => 'coupons',
			'taxes'      => 'taxes',
			'customers'  => 'customers',
			'downloads'  => 'downloads',
			'revenue'    => 'series',
		);
		$key = $map[ $section ] ?? '';
		$items = ( $key && isset( $report[ $key ] ) ) ? (array) $report[ $key ] : $items;

		$filename = 'shop-report-' . $section . '-' . gmdate( 'Y-m-d' ) . '.csv';
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
		echo "\xEF\xBB\xBF";
		$out = fopen( 'php://output', 'w' );
		if ( ! $out ) {
			exit;
		}
		if ( $items ) {
			$headers = array_keys( (array) $items[0] );
			fputcsv( $out, $headers );
			foreach ( $items as $row ) {
				$line = array();
				foreach ( $headers as $h ) {
					$val = $row[ $h ] ?? '';
					$line[] = is_scalar( $val ) ? $val : wp_json_encode( $val );
				}
				fputcsv( $out, $line );
			}
		}
		fclose( $out );
		exit;
	}

}
