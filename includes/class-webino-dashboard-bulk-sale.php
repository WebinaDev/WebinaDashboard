<?php
/**
 * Bulk strikethrough (sale) price apply/remove/preview.
 *
 * Works on the merchant's real selection or on the whole catalog, has no 200-product
 * cap, rounds every discount to a 1,000-toman step and keeps WooCommerce + WFCP in sync.
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

	/** Products handled per background batch (no cap on the job itself). */
	const BATCH_SIZE = 50;

	/** @deprecated Kept for backwards compatibility with older callers/tests. */
	const BATCH_LIMIT = self::BATCH_SIZE;

	/** Discount step in store currency (toman). */
	const ROUND_STEP = 1000;

	const JOB_OPTION = 'webino_bulk_sale_job';

	const JOB_LOCK = 'webino_bulk_sale_lock';

	const JOB_HISTORY = 'webino_bulk_sale_history';

	const JOB_HISTORY_MAX = 20;

	const CRON_HOOK = 'webino_dashboard_bulk_sale_batch';

	const JOB_LOCK_TTL = 300;

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( self::CRON_HOOK, array( __CLASS__, 'cron_batch' ), 10, 1 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest( $request ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$action = sanitize_key( (string) $request->get_param( 'action' ) );
		if ( ! in_array( $action, array( 'apply', 'remove', 'preview', 'count' ), true ) ) {
			return new WP_Error( 'invalid_action', __( 'Invalid action.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$scope  = self::resolve_scope( $request );
		$filters = is_array( $request->get_param( 'filters' ) )
			? (array) $request->get_param( 'filters' )
			: array();

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

		// Count first: it is also the guard against an accidental site-wide run.
		$total_ids = self::resolve_product_ids( $request, $scope, $filters, 0 );
		if ( is_wp_error( $total_ids ) ) {
			return $total_ids;
		}

		if ( 'count' === $action ) {
			return new WP_REST_Response(
				array(
					'action' => 'count',
					'scope'  => $scope,
					'count'  => count( $total_ids ),
				)
			);
		}

		if ( empty( $total_ids ) ) {
			return new WP_Error( 'no_products', __( 'No products selected.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		if ( 'preview' === $action ) {
			$samples = array();
			foreach ( array_slice( $total_ids, 0, 5 ) as $pid ) {
				$row = self::preview_product( (int) $pid, $percent );
				if ( $row ) {
					$samples[] = $row;
				}
			}
			return new WP_REST_Response(
				array(
					'action'    => 'preview',
					'scope'     => $scope,
					'count'     => count( $total_ids ),
					'percent'   => $percent,
					'round_step' => self::ROUND_STEP,
					'from'      => gmdate( 'c', $from_ts ),
					'to'        => gmdate( 'c', $to_ts ),
					'samples'   => $samples,
				)
			);
		}

		// Applying/removing is chunked in the background so any catalog size completes.
		$job = self::start_job( $action, $scope, $filters, $total_ids, $percent, $from_ts, $to_ts );
		if ( is_wp_error( $job ) ) {
			return $job;
		}
		return new WP_REST_Response( $job, 202 );
	}

	/**
	 * Job progress / finished summary (also used by the dashboard poller).
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_job_state() {
		return new WP_REST_Response( self::public_job_state() );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function public_job_state() {
		$job = get_option( self::JOB_OPTION, array() );
		if ( ! is_array( $job ) ) {
			$job = array();
		}
		$history = get_option( self::JOB_HISTORY, array() );
		return array(
			'active'  => self::is_job_running( $job ),
			'job'     => self::is_job_running( $job ) ? self::public_job_row( $job ) : null,
			'last'    => self::public_job_row( $job ),
			'history' => is_array( $history ) ? array_values( $history ) : array(),
		);
	}

	/**
	 * @param array<string,mixed> $job Job state.
	 * @return bool
	 */
	private static function is_job_running( $job ) {
		$status = isset( $job['status'] ) ? (string) $job['status'] : '';
		return in_array( $status, array( 'queued', 'running' ), true ) && ! empty( $job['total'] );
	}

	/**
	 * @param array<string,mixed> $job Job state.
	 * @return array<string,mixed>
	 */
	private static function public_job_row( $job ) {
		if ( ! is_array( $job ) || empty( $job ) ) {
			return array();
		}
		$total     = max( 1, (int) ( $job['total'] ?? 0 ) );
		$processed = (int) ( $job['processed'] ?? 0 );
		$out       = array(
			'run_id'      => (string) ( $job['run_id'] ?? '' ),
			'action'      => (string) ( $job['action'] ?? '' ),
			'scope'       => (string) ( $job['scope'] ?? '' ),
			'status'      => (string) ( $job['status'] ?? '' ),
			'total'       => (int) ( $job['total'] ?? 0 ),
			'processed'   => $processed,
			'ok'          => (int) ( $job['ok'] ?? 0 ),
			'failed'      => (int) ( $job['failed'] ?? 0 ),
			'skipped'     => (int) ( $job['skipped'] ?? 0 ),
			'progress_pct' => min( 100, (int) round( ( $processed / $total ) * 100 ) ),
			'started_at'  => (int) ( $job['started_at'] ?? 0 ),
			'finished_at' => (int) ( $job['finished_at'] ?? 0 ),
			'percent'     => isset( $job['percent'] ) ? (float) $job['percent'] : 0,
			'round_step'  => self::ROUND_STEP,
		);
		$errors = isset( $job['errors'] ) && is_array( $job['errors'] ) ? $job['errors'] : array();
		$out['errors'] = array_slice( $errors, 0, 50 );
		return $out;
	}

	/**
	 * Best-effort resolution of the requested scope.
	 *
	 * `scope` wins: `selected` (explicit ids only) | `filters` (current filters) | `all` (whole catalog).
	 * Without an explicit scope, ids imply `selected` and filters imply `filters` — never the whole
	 * catalog, so a site-wide sale can only happen when the merchant asked for it.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return string
	 */
	private static function resolve_scope( $request ) {
		$scope = sanitize_key( (string) $request->get_param( 'scope' ) );
		if ( in_array( $scope, array( 'selected', 'filters', 'all' ), true ) ) {
			return $scope;
		}
		$ids = $request->get_param( 'product_ids' );
		if ( is_array( $ids ) && ! empty( $ids ) ) {
			return 'selected';
		}
		return 'filters';
	}

	/**
	 * @param mixed  $days  Days int or null.
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
	 * Resolve every product id the merchant targets (no artificial cap).
	 *
	 * @param WP_REST_Request $request  Request.
	 * @param string          $scope    selected|filters|all.
	 * @param array           $filters  Filter payload.
	 * @param int             $limit    0 = every id.
	 * @return array<int>|WP_Error
	 */
	private static function resolve_product_ids( $request, $scope, $filters, $limit = 0 ) {
		if ( 'selected' === $scope ) {
			$raw = $request->get_param( 'product_ids' );
			if ( is_array( $raw ) && ! empty( $raw ) ) {
				$ids = array_values( array_unique( array_filter( array_map( 'intval', $raw ) ) ) );
				if ( $limit > 0 ) {
					$ids = array_slice( $ids, 0, $limit );
				}
				return self::filter_eligible_ids( $ids );
			}
			// Selection scope without ids: fall back to filters but tell the caller.
			$scope = 'filters';
		}

		if ( 'all' === $scope ) {
			$args = array(
				'status'   => array( 'publish' ),
				'limit'    => $limit > 0 ? $limit : -1,
				'page'     => 1,
				'orderby'  => 'ID',
				'order'    => 'ASC',
				'return'   => 'ids',
				'paginate' => false,
			);
			$ids = wc_get_products( $args );
			return self::filter_eligible_ids( is_array( $ids ) ? array_map( 'intval', $ids ) : array() );
		}

		$args = array(
			'status'   => array( 'publish' ),
			'limit'    => $limit > 0 ? $limit : -1,
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
		$tag = sanitize_title( (string) ( $filters['tag'] ?? $request->get_param( 'tag' ) ) );
		if ( '' !== $tag && taxonomy_exists( 'product_tag' ) ) {
			$tax_query[] = array(
				'taxonomy' => 'product_tag',
				'field'    => 'slug',
				'terms'    => $tag,
			);
		}
		if ( ! empty( $tax_query ) ) {
			$args['tax_query'] = $tax_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
		}

		$status = sanitize_key( (string) ( $filters['status'] ?? '' ) );
		if ( in_array( $status, array( 'publish', 'draft', 'pending', 'private' ), true ) ) {
			$args['status'] = array( $status );
		}

		$stock = sanitize_key( (string) ( $filters['stock_status'] ?? '' ) );
		if ( in_array( $stock, array( 'instock', 'outofstock', 'onbackorder' ), true ) ) {
			$args['stock_status'] = $stock;
		}

		$ids = wc_get_products( $args );
		if ( ! is_array( $ids ) ) {
			return array();
		}
		return self::filter_eligible_ids( array_map( 'intval', $ids ) );
	}

	/**
	 * Skip trash and auto-drafts.
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
			$out[] = $id;
		}
		return array_values( array_unique( $out ) );
	}

	/* ─────────────────────── Job engine ─────────────────────── */

	/**
	 * @param string $action  apply|remove.
	 * @param string $scope   Scope.
	 * @param array  $filters Filters (kept for the record).
	 * @param array  $ids     Every targeted id.
	 * @param float  $percent Percent.
	 * @param int    $from_ts From.
	 * @param int    $to_ts   To.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function start_job( $action, $scope, $filters, $ids, $percent, $from_ts, $to_ts ) {
		$current = get_option( self::JOB_OPTION, array() );
		if ( is_array( $current ) && self::is_job_running( $current ) ) {
			// A stuck job (worker died) is archived instead of blocking the merchant forever.
			if ( (int) ( $current['updated_at'] ?? 0 ) > ( time() - self::JOB_LOCK_TTL ) ) {
				return new WP_Error(
					'job_running',
					__( 'Another bulk sale job is still running. Wait for it to finish or cancel it.', 'webino-dashboard' ),
					array( 'status' => 409 )
				);
			}
			self::archive_job( $current, 'stalled' );
		}

		$job = array(
			'run_id'      => function_exists( 'wp_generate_uuid4' ) ? wp_generate_uuid4() : uniqid( 'bs', true ),
			'action'      => $action,
			'scope'       => $scope,
			'filters'     => $filters,
			'percent'     => $percent,
			'from_ts'     => (int) $from_ts,
			'to_ts'       => (int) $to_ts,
			'ids'         => array_values( array_map( 'intval', $ids ) ),
			'total'       => count( $ids ),
			'offset'      => 0,
			'processed'   => 0,
			'ok'          => 0,
			'failed'      => 0,
			'skipped'     => 0,
			'errors'      => array(),
			'status'      => 'queued',
			'started_at'  => time(),
			'updated_at'  => time(),
			'finished_at' => 0,
		);
		update_option( self::JOB_OPTION, $job, false );
		self::schedule_next( $job['run_id'], 0 );
		self::schedule_after_response( (string) $job['run_id'] );

		return array(
			'action'  => $action,
			'scope'   => $scope,
			'run_id'  => (string) $job['run_id'],
			'total'   => (int) $job['total'],
			'ok'      => 0,
			'failed'  => 0,
			'skipped' => 0,
			'status'  => 'queued',
			'async'   => true,
		);
	}

	/**
	 * Start the first chunk right after the REST response is flushed, so the merchant sees progress
	 * immediately on hosts where WP-Cron is not triggered by front-end traffic.
	 *
	 * @param string $run_id Run id.
	 * @return void
	 */
	private static function schedule_after_response( $run_id ) {
		static $scheduled = false;
		if ( $scheduled ) {
			return;
		}
		$scheduled = true;
		add_action(
			'shutdown',
			static function () use ( $run_id ) {
				if ( function_exists( 'fastcgi_finish_request' ) ) {
					@fastcgi_finish_request(); // phpcs:ignore WordPress.PHP.NoSilencedErrors
				}
				self::run_batch( (string) $run_id );
			},
			99
		);
	}

	/**
	 * Cron/loopback entry point for the next chunk.
	 *
	 * @param string $run_id Run id.
	 * @return void
	 */
	public static function cron_batch( $run_id ) {
		self::run_batch( (string) $run_id );
	}

	/**
	 * Run a single chunk of the active job.
	 *
	 * @param string $run_id Run id.
	 * @return void
	 */
	public static function run_batch( $run_id ) {
		$job = get_option( self::JOB_OPTION, array() );
		if ( ! is_array( $job ) || empty( $job['run_id'] ) || (string) $job['run_id'] !== (string) $run_id ) {
			return;
		}
		if ( ! self::is_job_running( $job ) ) {
			return;
		}
		if ( get_transient( self::JOB_LOCK ) ) {
			return; // Another worker is already chewing on this job.
		}
		set_transient( self::JOB_LOCK, time(), self::JOB_LOCK_TTL );

		try {
			if ( function_exists( 'ignore_user_abort' ) ) {
				ignore_user_abort( true );
			}
			if ( function_exists( 'set_time_limit' ) ) {
				@set_time_limit( 0 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
			}

			$job['status']     = 'running';
			$job['updated_at'] = time();
			update_option( self::JOB_OPTION, $job, false );

			$ids   = isset( $job['ids'] ) && is_array( $job['ids'] ) ? $job['ids'] : array();
			$slice = array_slice( $ids, (int) $job['offset'], self::BATCH_SIZE );
			$from  = (int) $job['from_ts'];
			$to    = (int) $job['to_ts'];
			foreach ( $slice as $pid ) {
				$result = 'remove' === (string) $job['action']
					? self::remove_product( (int) $pid )
					: self::apply_product( (int) $pid, (float) $job['percent'], $from, $to );
				++$job['processed'];
				if ( true === $result ) {
					++$job['ok'];
				} elseif ( 'skipped' === $result ) {
					++$job['skipped'];
				} else {
					++$job['failed'];
					if ( count( $job['errors'] ) < 50 ) {
						$job['errors'][] = array(
							'id'      => (int) $pid,
							'name'    => self::product_name( (int) $pid ),
							'message' => is_string( $result ) ? $result : __( 'Unknown error', 'webino-dashboard' ),
						);
					}
				}
			}

			$job['offset']     = (int) $job['offset'] + count( $slice );
			$job['updated_at'] = time();
			$done              = $job['offset'] >= count( $ids );

			if ( $done ) {
				$job['status']      = ( (int) $job['failed'] > 0 ) ? 'completed_with_errors' : 'completed';
				$job['finished_at'] = time();
				update_option( self::JOB_OPTION, $job, false );
				self::archive_job( $job, 'completed' );
			} else {
				update_option( self::JOB_OPTION, $job, false );
			}
		} finally {
			delete_transient( self::JOB_LOCK );
		}

		$job = get_option( self::JOB_OPTION, array() );
		if ( is_array( $job ) && self::is_job_running( $job ) && (string) ( $job['run_id'] ?? '' ) === (string) $run_id ) {
			self::schedule_next( (string) $run_id, (int) ( $job['offset'] ?? 0 ) );
		}
	}

	/**
	 * Queue the next chunk (Action Scheduler when available, WP-Cron otherwise).
	 *
	 * @param string $run_id Run id.
	 * @param int    $offset Offset already processed.
	 * @return void
	 */
	private static function schedule_next( $run_id, $offset ) {
		if ( function_exists( 'as_enqueue_async_action' ) ) {
			as_enqueue_async_action( self::CRON_HOOK, array( 'run_id' => (string) $run_id ), 'webino-dashboard' );
			return;
		}
		$args = array( (string) $run_id );
		$next = wp_next_scheduled( self::CRON_HOOK, $args );
		if ( $next ) {
			wp_unschedule_event( $next, self::CRON_HOOK, $args );
		}
		wp_schedule_single_event( time() + 1, self::CRON_HOOK, $args );
	}

	/**
	 * Store the finished job so the merchant keeps a per-product record.
	 *
	 * @param array<string,mixed> $job    Job state.
	 * @param string              $status Final status.
	 * @return void
	 */
	private static function archive_job( $job, $status ) {
		$history = get_option( self::JOB_HISTORY, array() );
		if ( ! is_array( $history ) ) {
			$history = array();
		}
		$row = array(
			'run_id'      => (string) ( $job['run_id'] ?? '' ),
			'action'      => (string) ( $job['action'] ?? '' ),
			'scope'       => (string) ( $job['scope'] ?? '' ),
			'status'      => sanitize_key( (string) $status ),
			'percent'     => isset( $job['percent'] ) ? (float) $job['percent'] : 0,
			'total'       => (int) ( $job['total'] ?? 0 ),
			'processed'   => (int) ( $job['processed'] ?? 0 ),
			'ok'          => (int) ( $job['ok'] ?? 0 ),
			'failed'      => (int) ( $job['failed'] ?? 0 ),
			'skipped'     => (int) ( $job['skipped'] ?? 0 ),
			'errors'      => isset( $job['errors'] ) && is_array( $job['errors'] ) ? array_slice( $job['errors'], 0, 50 ) : array(),
			'started_at'  => (int) ( $job['started_at'] ?? 0 ),
			'finished_at' => (int) ( $job['finished_at'] ?? time() ),
		);
		$history = array_values(
			array_filter(
				$history,
				static function ( $item ) use ( $row ) {
					return ! is_array( $item ) || (string) ( $item['run_id'] ?? '' ) !== $row['run_id'];
				}
			)
		);
		array_unshift( $history, $row );
		update_option( self::JOB_HISTORY, array_slice( $history, 0, self::JOB_HISTORY_MAX ), false );
	}

	/**
	 * @param int $product_id Product.
	 * @return string
	 */
	private static function product_name( $product_id ) {
		$p = wc_get_product( (int) $product_id );
		if ( ! $p ) {
			return '';
		}
		$name = (string) $p->get_name();
		return function_exists( 'wp_strip_all_tags' ) ? wp_strip_all_tags( $name ) : $name;
	}

	/* ─────────────────────── Price maths ─────────────────────── */

	/**
	 * Sale price for a regular price, rounded to a 1,000-toman step.
	 *
	 * The discount amount is rounded to the nearest step and then subtracted, so both the struck-out
	 * price and the payable price stay on the same clean 1,000-toman grid. Returns '' when the
	 * resulting price would not be a real discount (e.g. the regular price is below one step).
	 *
	 * @param float $regular Base price.
	 * @param float $percent Percent off.
	 * @return string
	 */
	public static function calc_sale( $regular, $percent ) {
		$base = max( 0.0, (float) $regular );
		if ( $base <= 0 ) {
			return '';
		}
		$step     = self::rounding_step();
		$discount = $base * ( (float) $percent / 100 );
		if ( $step > 0 ) {
			$discount = round( $discount / $step ) * $step;
		}
		$discount = max( 0.0, min( $discount, $base ) );
		$sale     = $base - $discount;
		if ( $step > 0 && $sale > 0 ) {
			// Keep the payable price on the same grid (a no-op when the regular price is already aligned).
			$aligned = round( $sale / $step ) * $step;
			if ( $aligned >= $step && $aligned < $base ) {
				$sale = $aligned;
			}
		}
		if ( $sale <= 0 || $sale >= $base ) {
			return '';
		}
		return function_exists( 'wc_format_decimal' ) ? wc_format_decimal( $sale ) : (string) $sale;
	}

	/**
	 * Rounding step; WFCP stores toman amounts rounded to 1,000 by default.
	 *
	 * @return int
	 */
	private static function rounding_step() {
		$step = (int) apply_filters( 'webino_dashboard_bulk_sale_round_step', self::ROUND_STEP );
		return $step > 0 ? $step : self::ROUND_STEP;
	}

	/**
	 * Base price a discount must be applied to: WFCP retail when WFCP is active.
	 *
	 * @param WC_Product $product Product or variation.
	 * @return float
	 */
	private static function base_regular_price( $product ) {
		if ( ! $product instanceof WC_Product ) {
			return 0.0;
		}
		// The struck-out price the shopper sees. When WFCP drives the price it is the computed
		// retail (with the parent's purchase price as fallback for variations) — discounting from
		// anything else made a 10% campaign read as 14% or 21%.
		if ( self::wfcp_manages_price( $product ) ) {
			$retail = self::wfcp_retail_price( $product );
			if ( $retail > 0 ) {
				return $retail;
			}
		}
		return (float) $product->get_regular_price( 'edit' );
	}

	/**
	 * Is WFCP the source of truth for this product's price?
	 *
	 * @param WC_Product $product Product.
	 * @return bool
	 */
	private static function wfcp_manages_price( $product ) {
		if ( ! self::wfcp_available() || ! $product instanceof WC_Product ) {
			return false;
		}
		$pid = (int) $product->get_id();
		if ( $pid <= 0 || ! class_exists( 'WFCP_Helper' ) ) {
			return false;
		}
		if ( method_exists( 'WFCP_Helper', 'is_product_price_locked' ) && WFCP_Helper::is_product_price_locked( $pid ) ) {
			return false;
		}
		$purchase = get_post_meta( $pid, '_wfcp_purchase_price', true );
		if ( is_numeric( $purchase ) && (float) $purchase > 0 ) {
			return true;
		}
		if ( method_exists( $product, 'get_parent_id' ) ) {
			$parent_id = (int) $product->get_parent_id();
			if ( $parent_id > 0 ) {
				$parent_purchase = get_post_meta( $parent_id, '_wfcp_purchase_price', true );
				return is_numeric( $parent_purchase ) && (float) $parent_purchase > 0;
			}
		}
		return false;
	}

	/**
	 * @return bool
	 */
	private static function wfcp_available() {
		return class_exists( 'WFCP_Helper' ) || class_exists( 'WFCP_Calculator' );
	}

	/**
	 * WFCP retail (unit) price for a product/variation.
	 *
	 * @param WC_Product $product Product.
	 * @return float
	 */
	private static function wfcp_retail_price( $product ) {
		$id       = (int) $product->get_id();
		$purchase = (float) get_post_meta( $id, '_wfcp_purchase_price', true );
		if ( $purchase <= 0 && method_exists( $product, 'get_parent_id' ) ) {
			// A variation without its own purchase price inherits the parent's, which is exactly what
			// the storefront price filter does — so it is also the price shown as "regular".
			$parent_id = (int) $product->get_parent_id();
			if ( $parent_id > 0 ) {
				$purchase = (float) get_post_meta( $parent_id, '_wfcp_purchase_price', true );
			}
		}
		if ( $purchase <= 0 || ! class_exists( 'WFCP_Calculator' ) ) {
			return 0.0;
		}
		if ( ! method_exists( 'WFCP_Calculator', 'calculate_price' ) ) {
			return 0.0;
		}
		try {
			$retail = (float) WFCP_Calculator::calculate_price( $purchase, 'retail', $id );
		} catch ( Throwable $e ) {
			return 0.0;
		}
		return $retail > 0 ? $retail : 0.0;
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
			$regular  = $first ? self::base_regular_price( $first ) : 0;
			return array(
				'id'            => $product_id,
				'name'          => $name,
				'image'         => $image ? $image : '',
				'type'          => 'variable',
				'regular_price' => (string) $regular,
				'sale_price'    => self::calc_sale( $regular, $percent ),
				'variations'    => count( $children ),
			);
		}

		$regular = self::base_regular_price( $p );
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
	 * Apply to one product (and every variation, keeping WFCP in sync).
	 *
	 * @param int   $product_id Product.
	 * @param float $percent    Percent.
	 * @param int   $from_ts    From.
	 * @param int   $to_ts      To.
	 * @return true|string|'skipped'
	 */
	private static function apply_product( $product_id, $percent, $from_ts, $to_ts ) {
		$p = wc_get_product( $product_id );
		if ( ! $p ) {
			return __( 'Product not found', 'webino-dashboard' );
		}

		try {
			$from = class_exists( 'WC_DateTime' ) ? new WC_DateTime( '@' . $from_ts ) : null;
			$to   = class_exists( 'WC_DateTime' ) ? new WC_DateTime( '@' . $to_ts ) : null;

			if ( $p->is_type( 'variable' ) ) {
				$any   = false;
				$error = '';
				foreach ( $p->get_children() as $vid ) {
					$v = wc_get_product( $vid );
					if ( ! $v ) {
						continue;
					}
					$res = self::apply_to_single( $v, $percent, $from, $to );
					if ( true === $res ) {
						$any = true;
					} elseif ( 'skipped' !== $res ) {
						$error = is_string( $res ) ? $res : $error;
					}
				}
				if ( ! $any ) {
					return '' !== $error ? $error : 'skipped';
				}
				self::sync_variable( (int) $p->get_id() );
				return true;
			}

			return self::apply_to_single( $p, $percent, $from, $to );
		} catch ( Exception $e ) {
			return $e->getMessage();
		} catch ( Throwable $e ) {
			return $e->getMessage();
		}
	}

	/**
	 * @param WC_Product   $product Product or variation.
	 * @param float        $percent Percent.
	 * @param WC_DateTime|null $from Sale start.
	 * @param WC_DateTime|null $to   Sale end.
	 * @return true|string|'skipped'
	 */
	private static function apply_to_single( $product, $percent, $from, $to ) {
		$base = self::base_regular_price( $product );
		if ( $base <= 0 ) {
			return 'skipped';
		}
		$sale = self::calc_sale( $base, $percent );
		if ( '' === $sale || (float) $sale <= 0 ) {
			return 'skipped';
		}
		// The regular price must be the same number the discount was measured against, otherwise
		// WooCommerce discards a sale that is above the stored regular and the shopper keeps seeing
		// the bare price (this is how a 10% campaign ended up rendering as 14%/21%).
		$stored_regular = (float) $product->get_regular_price( 'edit' );
		if ( self::wfcp_manages_price( $product ) && 0.0 !== $base && $base !== $stored_regular ) {
			$product->set_regular_price( function_exists( 'wc_format_decimal' ) ? wc_format_decimal( $base ) : (string) $base );
		}
		$product->set_sale_price( $sale );
		if ( $from && $to && method_exists( $product, 'set_date_on_sale_from' ) ) {
			$product->set_date_on_sale_from( $from );
			$product->set_date_on_sale_to( $to );
		}
		$product->save();
		self::sync_wfcp_sale( $product, (float) $sale );
		self::flush_product_cache( (int) $product->get_id() );
		return true;
	}

	/**
	 * @param int $product_id Product.
	 * @return true|string|'skipped'
	 */
	private static function remove_product( $product_id ) {
		$p = wc_get_product( $product_id );
		if ( ! $p ) {
			return __( 'Product not found', 'webino-dashboard' );
		}
		try {
			if ( $p->is_type( 'variable' ) ) {
				foreach ( $p->get_children() as $vid ) {
					$v = wc_get_product( $vid );
					if ( ! $v ) {
						continue;
					}
					self::clear_sale( $v );
				}
				self::sync_variable( (int) $p->get_id() );
				return true;
			}
			self::clear_sale( $p );
			return true;
		} catch ( Exception $e ) {
			return $e->getMessage();
		} catch ( Throwable $e ) {
			return $e->getMessage();
		}
	}

	/**
	 * @param WC_Product $product Product or variation.
	 * @return void
	 */
	private static function clear_sale( $product ) {
		$product->set_sale_price( '' );
		if ( method_exists( $product, 'set_date_on_sale_from' ) ) {
			$product->set_date_on_sale_from( null );
			$product->set_date_on_sale_to( null );
		}
		$product->save();
		self::sync_wfcp_sale( $product, 0.0 );
		self::flush_product_cache( (int) $product->get_id() );
	}

	/**
	 * Mirror the sale into WFCP meta so the storefront shows the same strikethrough price.
	 *
	 * The WFCP storefront filter only honours a sale that is below its computed retail price, so the
	 * meta/option pair matters as much as the WooCommerce sale field. Locked prices are never touched.
	 *
	 * @param WC_Product $product Product or variation.
	 * @param float      $sale    Sale price (0 = none).
	 * @return void
	 */
	private static function sync_wfcp_sale( $product, $sale ) {
		$pid = (int) $product->get_id();
		if ( $pid <= 0 || ! self::wfcp_forget_suspended() ) {
			return;
		}
		if ( class_exists( 'WFCP_Helper' ) && method_exists( 'WFCP_Helper', 'is_product_price_locked' ) && WFCP_Helper::is_product_price_locked( $pid ) ) {
			return;
		}
		update_post_meta( $pid, '_wfcp_sale_price', $sale > 0 ? (float) $sale : '' );
		update_post_meta( $pid, '_wfcp_sale_synced_at', time() );
		if ( class_exists( 'WFCP_Helper' ) && method_exists( 'WFCP_Helper', 'sync_retail_price_from_purchase' ) ) {
			$purchase = (float) get_post_meta( $pid, '_wfcp_purchase_price', true );
			if ( $purchase > 0 ) {
				WFCP_Helper::sync_retail_price_from_purchase( $pid, $purchase );
			}
		}
	}

	/**
	 * @return bool
	 */
	private static function wfcp_forget_suspended() {
		return class_exists( 'WFCP_Helper' ) || class_exists( 'WFCP_Calculator' );
	}

	/**
	 * @param int $parent_id Parent product.
	 * @return void
	 */
	private static function sync_variable( $parent_id ) {
		if ( class_exists( 'WC_Product_Variable' ) ) {
			WC_Product_Variable::sync( (int) $parent_id );
		}
		self::flush_product_cache( (int) $parent_id );
	}

	/**
	 * @param int $product_id Product.
	 * @return void
	 */
	private static function flush_product_cache( $product_id ) {
		if ( function_exists( 'wc_delete_product_transients' ) ) {
			wc_delete_product_transients( (int) $product_id );
		}
	}
}
