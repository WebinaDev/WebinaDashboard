<?php
/**
 * Inventory / stock valuation reports for dashboard REST.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds inventory snapshot with purchase + WFCP sell prices.
 */
class Webino_Dashboard_Inventory_Reports {

	const CACHE_TTL = 120;

	/**
	 * Marketplace platforms used by WFCP calculator.
	 *
	 * @return string[]
	 */
	public static function marketplace_platforms() {
		return array( 'digikala', 'basalam', 'technolife', 'snappshop', 'tapsishop', 'zarehbin', 'emalls', 'snapppay-search', 'torob' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_get( $request ) {
		if ( ! function_exists( 'wc_get_products' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$filter  = sanitize_key( (string) ( $request->get_param( 'stock_filter' ) ?: 'all' ) );
		$search  = trim( (string) $request->get_param( 'search' ) );
		$page    = max( 1, (int) ( $request->get_param( 'page' ) ?: 1 ) );
		$per     = min( 100, max( 1, (int) ( $request->get_param( 'per_page' ) ?: 25 ) ) );
		$orderby = sanitize_key( (string) ( $request->get_param( 'orderby' ) ?: 'name' ) );
		$order   = strtolower( (string) ( $request->get_param( 'order' ) ?: 'asc' ) ) === 'desc' ? 'DESC' : 'ASC';

		$cache_key = 'webino_inv_report_' . md5(
			wp_json_encode(
				array(
					'f'   => $filter,
					's'   => $search,
					'ob'  => $orderby,
					'o'   => $order,
					'uid' => get_current_user_id(),
					'v'   => 1,
				)
			)
		);

		$payload = get_transient( $cache_key );
		if ( ! is_array( $payload ) ) {
			$payload = self::build_snapshot( $filter, $search );
			set_transient( $cache_key, $payload, self::CACHE_TTL );
		}

		$rows = isset( $payload['rows'] ) && is_array( $payload['rows'] ) ? $payload['rows'] : array();
		$rows = self::sort_rows( $rows, $orderby, $order );
		$total = count( $rows );
		$items = array_slice( $rows, ( $page - 1 ) * $per, $per );

		return new WP_REST_Response(
			array(
				'currency'  => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '',
				'summary'   => $payload['summary'] ?? array(),
				'price_keys'=> $payload['price_keys'] ?? array(),
				'items'     => $items,
				'total'     => $total,
				'page'      => $page,
				'per_page'  => $per,
				'filter'    => $filter,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	public static function rest_export_csv( $request ) {
		$response = self::rest_get( $request );
		if ( is_wp_error( $response ) ) {
			status_header( 400 );
			echo esc_html( $response->get_error_message() );
			exit;
		}
		$data  = $response->get_data();
		// Unpaginated: rebuild with high per_page via snapshot cache.
		$request->set_param( 'page', 1 );
		$request->set_param( 'per_page', 100 );
		$filter = sanitize_key( (string) ( $request->get_param( 'stock_filter' ) ?: 'all' ) );
		$search = trim( (string) $request->get_param( 'search' ) );
		$snap   = self::build_snapshot( $filter, $search );
		$rows   = isset( $snap['rows'] ) ? $snap['rows'] : array();

		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="inventory-report-' . gmdate( 'Y-m-d' ) . '.csv"' );
		echo "\xEF\xBB\xBF";
		$out = fopen( 'php://output', 'w' );
		if ( ! $out ) {
			exit;
		}
		fputcsv(
			$out,
			array(
				'ID',
				'SKU',
				'Name',
				'Type',
				'Stock',
				'Status',
				'Purchase',
				'Regular',
				'Sale',
				'Current',
				'Retail',
				'Credit',
				'Wholesale',
				'Installment',
				'Value purchase',
				'Value retail',
				'Potential profit',
			)
		);
		foreach ( $rows as $row ) {
			$prices = isset( $row['prices'] ) ? (array) $row['prices'] : array();
			$values = isset( $row['values'] ) ? (array) $row['values'] : array();
			fputcsv(
				$out,
				array(
					$row['id'] ?? 0,
					$row['sku'] ?? '',
					$row['name'] ?? '',
					$row['type'] ?? '',
					$row['stock_qty'] ?? 0,
					$row['stock_status'] ?? '',
					$prices['purchase'] ?? 0,
					$prices['regular'] ?? 0,
					$prices['sale'] ?? 0,
					$prices['current'] ?? 0,
					$prices['retail'] ?? 0,
					$prices['credit'] ?? 0,
					$prices['wholesale'] ?? 0,
					$prices['installment'] ?? 0,
					$values['purchase'] ?? 0,
					$values['retail'] ?? 0,
					$row['potential_profit'] ?? 0,
				)
			);
		}
		fclose( $out );
		exit;
	}

	/**
	 * @param string $filter Stock filter.
	 * @param string $search Search.
	 * @return array{summary:array,rows:array,price_keys:array}
	 */
	private static function build_snapshot( $filter, $search ) {
		$cost_cache = array();
		$rows       = array();
		$summary    = array(
			'sku_count'            => 0,
			'units_in_stock'       => 0,
			'outofstock_count'     => 0,
			'low_stock_count'      => 0,
			'missing_cost_count'   => 0,
			'value_purchase'       => 0.0,
			'value_retail'         => 0.0,
			'value_current'        => 0.0,
			'value_wholesale'      => 0.0,
			'value_credit'         => 0.0,
			'potential_profit'     => 0.0,
			'wfcp_enabled'         => class_exists( 'WFCP_Helper' ),
			'target_margin_pct'    => 0.0,
		);
		if ( class_exists( 'WFCP_Helper' ) ) {
			$pct = WFCP_Helper::get_settings( 'retail', 'profit_percent' );
			$summary['target_margin_pct'] = $pct ? (float) $pct : 0.0;
		}

		$price_keys = array( 'purchase', 'regular', 'sale', 'current', 'retail', 'credit', 'wholesale', 'installment' );
		foreach ( self::marketplace_platforms() as $platform ) {
			$price_keys[] = $platform;
		}

		$page = 1;
		do {
			$args = array(
				'status'  => array( 'publish', 'private' ),
				'limit'   => 100,
				'page'    => $page,
				'type'    => array( 'simple', 'variable', 'variation' ),
				'orderby' => 'title',
				'order'   => 'ASC',
				'return'  => 'objects',
			);
			if ( $search ) {
				$args['s'] = $search;
			}
			$products = wc_get_products( $args );
			if ( ! is_array( $products ) || ! $products ) {
				break;
			}
			foreach ( $products as $product ) {
				if ( ! is_a( $product, 'WC_Product' ) ) {
					continue;
				}
				if ( $product->is_type( 'variable' ) ) {
					// Parent variable has no sellable stock rows; variations are listed separately when type includes variation.
					continue;
				}
				$row = self::map_product_row( $product, $cost_cache );
				if ( ! self::row_matches_filter( $row, $filter ) ) {
					continue;
				}
				$rows[] = $row;
				self::accumulate_summary( $summary, $row );
			}
			++$page;
		} while ( count( $products ) >= 100 && $page <= 200 );

		return array(
			'summary'    => $summary,
			'rows'       => $rows,
			'price_keys' => $price_keys,
		);
	}

	/**
	 * @param WC_Product       $product Product.
	 * @param array<int,float> $cost_cache Cache.
	 * @return array<string,mixed>
	 */
	private static function map_product_row( $product, &$cost_cache ) {
		$id         = (int) $product->get_id();
		$parent_id  = $product->get_parent_id() ? (int) $product->get_parent_id() : 0;
		$manage     = (bool) $product->get_manage_stock();
		$qty        = $manage ? (int) $product->get_stock_quantity() : ( 'instock' === $product->get_stock_status() ? 1 : 0 );
		$low_amount = $product->get_low_stock_amount();
		if ( '' === $low_amount || null === $low_amount ) {
			$low_amount = function_exists( 'wc_get_low_stock_amount' ) ? wc_get_low_stock_amount( $product ) : 2;
		}
		$low_amount = (int) $low_amount;
		$is_low     = $manage && $qty > 0 && $qty <= $low_amount;

		$purchase = class_exists( 'Webino_Dashboard_Order_Reports' )
			? Webino_Dashboard_Order_Reports::get_product_purchase_cost( $parent_id > 0 ? $parent_id : $id, $parent_id > 0 ? $id : 0, $cost_cache )
			: 0.0;

		$prices = array(
			'purchase' => $purchase,
			'regular'  => (float) $product->get_regular_price(),
			'sale'     => (float) $product->get_sale_price(),
			'current'  => (float) $product->get_price(),
			'retail'   => 0.0,
			'credit'   => 0.0,
			'wholesale'=> 0.0,
			'installment' => 0.0,
		);

		if ( class_exists( 'WFCP_Calculator' ) && $purchase > 0 ) {
			$calc_id = $parent_id > 0 ? $parent_id : $id;
			$prices['retail']      = (float) WFCP_Calculator::calculate_price( $purchase, 'retail', $calc_id );
			$prices['credit']      = (float) WFCP_Calculator::calculate_price( $purchase, 'credit', $calc_id );
			$prices['wholesale']   = (float) WFCP_Calculator::calculate_price( $purchase, 'wholesale', $calc_id );
			$prices['installment'] = (float) WFCP_Calculator::calculate_price( $purchase, 'installment', $calc_id, array( 'months' => 12 ) );
			foreach ( self::marketplace_platforms() as $platform ) {
				$prices[ $platform ] = (float) WFCP_Calculator::calculate_price( $purchase, $platform, $calc_id );
			}
		} else {
			$prices['retail'] = $prices['regular'] > 0 ? $prices['regular'] : $prices['current'];
			foreach ( self::marketplace_platforms() as $platform ) {
				$prices[ $platform ] = 0.0;
			}
		}

		$stock_qty = max( 0, $qty );
		$values    = array();
		foreach ( $prices as $key => $price ) {
			$values[ $key ] = $stock_qty * (float) $price;
		}

		$sell_for_profit = $prices['retail'] > 0 ? $prices['retail'] : $prices['current'];
		$potential       = ( $sell_for_profit - $purchase ) * $stock_qty;
		$margin          = $sell_for_profit > 0 ? ( ( $sell_for_profit - $purchase ) / $sell_for_profit ) * 100 : 0.0;

		return array(
			'id'                => $id,
			'parent_id'         => $parent_id,
			'name'              => $product->get_name(),
			'sku'               => (string) $product->get_sku(),
			'type'              => $product->get_type(),
			'manage_stock'      => $manage,
			'stock_qty'         => $stock_qty,
			'stock_status'      => $product->get_stock_status(),
			'low_stock_amount'  => $low_amount,
			'is_low_stock'      => $is_low,
			'missing_cost'      => $purchase <= 0,
			'prices'            => $prices,
			'values'            => $values,
			'potential_profit'  => $potential,
			'potential_margin'  => $margin,
		);
	}

	/**
	 * @param array<string,mixed> $row Row.
	 * @param string              $filter Filter.
	 * @return bool
	 */
	private static function row_matches_filter( $row, $filter ) {
		switch ( $filter ) {
			case 'outofstock':
				return 'outofstock' === ( $row['stock_status'] ?? '' );
			case 'lowstock':
				return ! empty( $row['is_low_stock'] );
			case 'missing_cost':
				return ! empty( $row['missing_cost'] );
			case 'instock':
				return 'instock' === ( $row['stock_status'] ?? '' );
			case 'all':
			default:
				return true;
		}
	}

	/**
	 * @param array<string,mixed> $summary Summary.
	 * @param array<string,mixed> $row Row.
	 * @return void
	 */
	private static function accumulate_summary( &$summary, $row ) {
		++$summary['sku_count'];
		$summary['units_in_stock'] += (int) ( $row['stock_qty'] ?? 0 );
		if ( 'outofstock' === ( $row['stock_status'] ?? '' ) ) {
			++$summary['outofstock_count'];
		}
		if ( ! empty( $row['is_low_stock'] ) ) {
			++$summary['low_stock_count'];
		}
		if ( ! empty( $row['missing_cost'] ) ) {
			++$summary['missing_cost_count'];
		}
		$values = isset( $row['values'] ) ? (array) $row['values'] : array();
		$summary['value_purchase']  += (float) ( $values['purchase'] ?? 0 );
		$summary['value_retail']    += (float) ( $values['retail'] ?? 0 );
		$summary['value_current']   += (float) ( $values['current'] ?? 0 );
		$summary['value_wholesale'] += (float) ( $values['wholesale'] ?? 0 );
		$summary['value_credit']    += (float) ( $values['credit'] ?? 0 );
		$summary['potential_profit'] += (float) ( $row['potential_profit'] ?? 0 );
	}

	/**
	 * @param array<int,array<string,mixed>> $rows Rows.
	 * @param string                         $orderby Field.
	 * @param string                         $order ASC|DESC.
	 * @return array<int,array<string,mixed>>
	 */
	private static function sort_rows( $rows, $orderby, $order ) {
		$flat_keys = array( 'name', 'sku', 'stock_qty', 'stock_status', 'potential_profit', 'potential_margin' );
		usort(
			$rows,
			function ( $a, $b ) use ( $orderby, $order, $flat_keys ) {
				if ( in_array( $orderby, $flat_keys, true ) ) {
					$av = $a[ $orderby ] ?? '';
					$bv = $b[ $orderby ] ?? '';
				} elseif ( 0 === strpos( $orderby, 'price_' ) ) {
					$key = substr( $orderby, 6 );
					$av  = $a['prices'][ $key ] ?? 0;
					$bv  = $b['prices'][ $key ] ?? 0;
				} elseif ( 0 === strpos( $orderby, 'value_' ) ) {
					$key = substr( $orderby, 6 );
					$av  = $a['values'][ $key ] ?? 0;
					$bv  = $b['values'][ $key ] ?? 0;
				} else {
					$av = $a['name'] ?? '';
					$bv = $b['name'] ?? '';
				}
				if ( is_numeric( $av ) && is_numeric( $bv ) ) {
					$cmp = (float) $av <=> (float) $bv;
				} else {
					$cmp = strcasecmp( (string) $av, (string) $bv );
				}
				return 'DESC' === $order ? -$cmp : $cmp;
			}
		);
		return $rows;
	}
}
