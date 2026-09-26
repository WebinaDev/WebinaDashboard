<?php
/**
 * Bulk strikethrough (sale) price apply/remove/preview.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Apply percent sale prices with schedule across products.
 */
final class Webino_Dashboard_Bulk_Sale {

	const BATCH_LIMIT = 200;

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest( $request ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$action = sanitize_key( (string) $request->get_param( 'action' ) );
		if ( ! in_array( $action, array( 'apply', 'remove', 'preview' ), true ) ) {
			return new WP_Error( 'invalid_action', __( 'Invalid action.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$ids = self::resolve_product_ids( $request );
		if ( is_wp_error( $ids ) ) {
			return $ids;
		}
		if ( empty( $ids ) ) {
			return new WP_Error( 'no_products', __( 'No products selected.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$percent = (float) $request->get_param( 'percent' );
		$days    = $request->get_param( 'days' );
		$until   = sanitize_text_field( (string) $request->get_param( 'until' ) );

		if ( in_array( $action, array( 'apply', 'preview' ), true ) ) {
			if ( $percent <= 0 || $percent >= 100 ) {
				return new WP_Error( 'invalid_percent', __( 'Percent must be between 0 and 100.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
		}

		$from_ts = time();
		$to_ts   = self::resolve_end_ts( $days, $until, $from_ts );
		if ( is_wp_error( $to_ts ) ) {
			return $to_ts;
		}

		if ( 'preview' === $action ) {
			$samples = array();
			foreach ( array_slice( $ids, 0, 5 ) as $pid ) {
				$row = self::preview_product( (int) $pid, $percent );
				if ( $row ) {
					$samples[] = $row;
				}
			}
			return new WP_REST_Response(
				array(
					'action'  => 'preview',
					'count'   => count( $ids ),
					'percent' => $percent,
					'from'    => gmdate( 'c', $from_ts ),
					'to'      => gmdate( 'c', $to_ts ),
					'samples' => $samples,
				)
			);
		}

		$ok     = 0;
		$failed = 0;
		$skipped = 0;
		$errors = array();

		foreach ( $ids as $pid ) {
			$result = 'remove' === $action
				? self::remove_product( (int) $pid )
				: self::apply_product( (int) $pid, $percent, $from_ts, $to_ts );
			if ( true === $result ) {
				++$ok;
			} elseif ( 'skipped' === $result ) {
				++$skipped;
			} else {
				++$failed;
				if ( count( $errors ) < 10 && is_string( $result ) ) {
					$errors[] = array(
						'id'      => (int) $pid,
						'message' => $result,
					);
				}
			}
		}

		return new WP_REST_Response(
			array(
				'action'  => $action,
				'ok'      => $ok,
				'failed'  => $failed,
				'skipped' => $skipped,
				'total'   => count( $ids ),
				'errors'  => $errors,
			)
		);
	}

	/**
	 * @param mixed $days  Days int or null.
	 * @param string $until Y-m-d or ISO.
	 * @param int    $from_ts From.
	 * @return int|WP_Error
	 */
	private static function resolve_end_ts( $days, $until, $from_ts ) {
		if ( '' !== $until ) {
			$ts = strtotime( $until );
			if ( ! $ts || $ts <= $from_ts ) {
				return new WP_Error( 'invalid_until', __( 'Invalid end date.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			return (int) $ts;
		}
		$d = (int) $days;
		if ( $d < 1 ) {
			$d = 7;
		}
		return $from_ts + ( $d * DAY_IN_SECONDS );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return array<int>|WP_Error
	 */
	private static function resolve_product_ids( $request ) {
		$raw = $request->get_param( 'product_ids' );
		if ( is_array( $raw ) && ! empty( $raw ) ) {
			$ids = array_values( array_unique( array_filter( array_map( 'intval', $raw ) ) ) );
			$ids = array_slice( $ids, 0, self::BATCH_LIMIT );
			return self::filter_eligible_ids( $ids );
		}

		$filters = $request->get_param( 'filters' );
		if ( ! is_array( $filters ) ) {
			$filters = array();
		}

		$args = array(
			'status'   => array( 'publish' ),
			'limit'    => self::BATCH_LIMIT,
			'page'     => 1,
			'orderby'  => 'date',
			'order'    => 'DESC',
			'return'   => 'ids',
			'paginate' => false,
		);

		$search = sanitize_text_field( (string) ( $filters['search'] ?? $request->get_param( 'search' ) ) );
		if ( '' !== $search ) {
			$args['s'] = $search;
		}
		$cat = sanitize_title( (string) ( $filters['category'] ?? $request->get_param( 'category' ) ) );
		if ( '' !== $cat ) {
			$args['category'] = array( $cat );
		}
		$type = sanitize_key( (string) ( $filters['type'] ?? '' ) );
		if ( in_array( $type, array( 'simple', 'variable', 'grouped', 'external' ), true ) ) {
			$args['type'] = $type;
		}

		$tax_query = array();
		$brand     = sanitize_title( (string) ( $filters['brand'] ?? $request->get_param( 'brand' ) ) );
		if ( '' !== $brand && taxonomy_exists( 'product_brand' ) ) {
			$tax_query[] = array(
				'taxonomy' => 'product_brand',
				'field'    => 'slug',
				'terms'    => $brand,
			);
		}
		if ( ! empty( $tax_query ) ) {
			$args['tax_query'] = $tax_query;
		}

		$status = sanitize_key( (string) ( $filters['status'] ?? '' ) );
		if ( in_array( $status, array( 'publish', 'draft', 'pending', 'private' ), true ) ) {
			$args['status'] = array( $status );
		}

		$ids = wc_get_products( $args );
		if ( ! is_array( $ids ) ) {
			return array();
		}
		return self::filter_eligible_ids( array_map( 'intval', $ids ) );
	}

	/**
	 * Skip trash and draft/pending by default; keep publish.
	 *
	 * @param array<int> $ids IDs.
	 * @return array<int>
	 */
	private static function filter_eligible_ids( $ids ) {
		$out = array();
		foreach ( $ids as $id ) {
			$id = (int) $id;
			if ( $id <= 0 ) {
				continue;
			}
			$p = wc_get_product( $id );
			if ( ! $p ) {
				continue;
			}
			$status = $p->get_status();
			if ( in_array( $status, array( 'trash', 'auto-draft' ), true ) ) {
				continue;
			}
			// Prefer published; still allow explicit draft if passed via ids.
			$out[] = $id;
		}
		return array_values( array_unique( $out ) );
	}

	/**
	 * @param int   $product_id Product ID.
	 * @param float $percent    Percent off.
	 * @return array<string,mixed>|null
	 */
	private static function preview_product( $product_id, $percent ) {
		$p = wc_get_product( $product_id );
		if ( ! $p ) {
			return null;
		}
		$name  = $p->get_name();
		$image = wp_get_attachment_image_url( $p->get_image_id(), 'thumbnail' );

		if ( $p->is_type( 'variable' ) ) {
			$children = $p->get_children();
			$first    = ! empty( $children[0] ) ? wc_get_product( $children[0] ) : null;
			$regular  = $first ? (float) $first->get_regular_price() : 0;
			$sale     = self::calc_sale( $regular, $percent );
			return array(
				'id'            => $product_id,
				'name'          => $name,
				'image'         => $image ? $image : '',
				'type'          => 'variable',
				'regular_price' => (string) $regular,
				'sale_price'    => $sale,
				'variations'    => count( $children ),
			);
		}

		$regular = (float) $p->get_regular_price();
		if ( $regular <= 0 ) {
			return null;
		}
		return array(
			'id'            => $product_id,
			'name'          => $name,
			'image'         => $image ? $image : '',
			'type'          => $p->get_type(),
			'regular_price' => (string) $regular,
			'sale_price'    => self::calc_sale( $regular, $percent ),
		);
	}

	/**
	 * @param float $regular Regular.
	 * @param float $percent Percent.
	 * @return string
	 */
	private static function calc_sale( $regular, $percent ) {
		$sale = $regular * ( 1 - ( $percent / 100 ) );
		$sale = max( 0, $sale );
		return wc_format_decimal( $sale );
	}

	/**
	 * @param int   $product_id Product.
	 * @param float $percent    Percent.
	 * @param int   $from_ts    From.
	 * @param int   $to_ts      To.
	 * @return true|string|'skipped'
	 */
	private static function apply_product( $product_id, $percent, $from_ts, $to_ts ) {
		$p = wc_get_product( $product_id );
		if ( ! $p ) {
			return 'not found';
		}

		$from = new WC_DateTime( '@' . $from_ts );
		$to   = new WC_DateTime( '@' . $to_ts );

		try {
			if ( $p->is_type( 'variable' ) ) {
				$any = false;
				foreach ( $p->get_children() as $vid ) {
					$v = wc_get_product( $vid );
					if ( ! $v ) {
						continue;
					}
					$regular = (float) $v->get_regular_price();
					if ( $regular <= 0 ) {
						continue;
					}
					$v->set_sale_price( self::calc_sale( $regular, $percent ) );
					$v->set_date_on_sale_from( $from );
					$v->set_date_on_sale_to( $to );
					$v->save();
					$any = true;
				}
				if ( ! $any ) {
					return 'skipped';
				}
				// Sync parent min/max.
				WC_Product_Variable::sync( $product_id );
				return true;
			}

			$regular = (float) $p->get_regular_price();
			if ( $regular <= 0 ) {
				return 'skipped';
			}
			$p->set_sale_price( self::calc_sale( $regular, $percent ) );
			$p->set_date_on_sale_from( $from );
			$p->set_date_on_sale_to( $to );
			$p->save();
			return true;
		} catch ( Exception $e ) {
			return $e->getMessage();
		}
	}

	/**
	 * @param int $product_id Product.
	 * @return true|string|'skipped'
	 */
	private static function remove_product( $product_id ) {
		$p = wc_get_product( $product_id );
		if ( ! $p ) {
			return 'not found';
		}
		try {
			if ( $p->is_type( 'variable' ) ) {
				foreach ( $p->get_children() as $vid ) {
					$v = wc_get_product( $vid );
					if ( ! $v ) {
						continue;
					}
					$v->set_sale_price( '' );
					$v->set_date_on_sale_from( null );
					$v->set_date_on_sale_to( null );
					$v->save();
				}
				WC_Product_Variable::sync( $product_id );
				return true;
			}
			$p->set_sale_price( '' );
			$p->set_date_on_sale_from( null );
			$p->set_date_on_sale_to( null );
			$p->save();
			return true;
		} catch ( Exception $e ) {
			return $e->getMessage();
		}
	}
}
