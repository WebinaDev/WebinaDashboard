<?php
/**
 * Batch Processing Service
 *
 * @package    WFCP
 * @subpackage WFCP/includes/services
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Batch Processing Service
 */
class WFCP_Batch_Process {

	const GROUP      = 'wfcp-recalc';
	const PER_PAGE   = 100;
	const LOCK_KEY   = 'wfcp_recalc_lock';
	const PARAMS_KEY = 'wfcp_recalc_params';
	const STATE_KEY  = 'wfcp_recalc_state';
	const HOOK       = 'wfcp_recalc_batch';

	/**
	 * Product types that store a single WooCommerce customer-facing price on the product object.
	 *
	 * @var string[]
	 */
	private static $syncable_product_types = array( 'simple', 'external', 'variation' );

	/**
	 * Register background job hook.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( self::HOOK, array( __CLASS__, 'job_recalculate_batch' ), 10, 2 );
	}

	/**
	 * Queue a batched recalculate job (returns immediately).
	 *
	 * @param bool $dry_run Dry run mode (don't save to database).
	 * @return array|WP_Error
	 */
	public static function queue_recalculate( $dry_run = false ) {
		if ( get_transient( self::LOCK_KEY ) ) {
			return new WP_Error(
				'wfcp_recalc_lock',
				__( 'A price recalculation job is already running.', 'webina-woo-core' ),
				array( 'status' => 409 )
			);
		}

		self::delete_transients();

		$total = self::count_syncable_posts();
		$pages = (int) max( 1, ceil( $total / self::PER_PAGE ) );
		$run_id = wp_generate_uuid4();

		update_option(
			self::PARAMS_KEY,
			array(
				'run_id'     => $run_id,
				'dry_run'    => $dry_run ? 1 : 0,
				'started_at' => time(),
			),
			false
		);

		update_option(
			self::STATE_KEY,
			array(
				'total'        => $total,
				'pages'        => $pages,
				'current_page' => 0,
				'processed'    => 0,
				'success'      => 0,
				'failed'       => 0,
				'finished'     => false,
			),
			false
		);

		set_transient( self::LOCK_KEY, 1, 30 * MINUTE_IN_SECONDS );
		self::enqueue_batch( 1, $run_id );

		return array(
			'queued'  => true,
			'run_id'  => $run_id,
			'total'   => $total,
			'pages'   => $pages,
			'dry_run' => (bool) $dry_run,
		);
	}

	/**
	 * Current queue state for dashboard polling.
	 *
	 * @return array<string,mixed>
	 */
	public static function get_recalc_state() {
		return array(
			'params' => get_option( self::PARAMS_KEY, array() ),
			'state'  => get_option( self::STATE_KEY, array() ),
			'locked' => (bool) get_transient( self::LOCK_KEY ),
		);
	}

	/**
	 * Background job: process one batch page.
	 *
	 * @param int    $page Page number (1-based).
	 * @param string $run  Run ID.
	 * @return void
	 */
	public static function job_recalculate_batch( $page = 1, $run = '' ) {
		set_transient( self::LOCK_KEY, 1, 30 * MINUTE_IN_SECONDS );

		$params = get_option( self::PARAMS_KEY, array() );
		$state  = get_option( self::STATE_KEY, array() );

		if ( ! is_array( $params ) || ! is_array( $state ) || empty( $params['run_id'] ) || $run !== $params['run_id'] ) {
			delete_transient( self::LOCK_KEY );
			return;
		}

		if ( isset( $params['dry_run'] ) ) {
			$dry_run = ! empty( $params['dry_run'] );
		} else {
			$dry_run = false;
		}

		$batch   = self::recalculate_batch( (int) $page, $dry_run );
		$state['current_page'] = (int) $page;
		$state['processed']   = (int) ( $state['processed'] ?? 0 ) + (int) $batch['processed'];
		$state['success']     = (int) ( $state['success'] ?? 0 ) + (int) $batch['success'];
		$state['failed']      = (int) ( $state['failed'] ?? 0 ) + (int) $batch['failed'];

		$total_pages = (int) ( $state['pages'] ?? 1 );
		if ( $page >= $total_pages || $batch['finished'] ) {
			$state['finished'] = true;
			update_option( self::STATE_KEY, $state, false );
			delete_option( self::PARAMS_KEY );
			delete_transient( self::LOCK_KEY );

			if ( $dry_run && ! empty( $batch['log'] ) ) {
				self::write_log( $batch['log'] );
			}
			return;
		}

		update_option( self::STATE_KEY, $state, false );
		self::enqueue_batch( (int) $page + 1, $run );
	}

	/**
	 * Recalculate all product prices synchronously (legacy; prefer queue_recalculate).
	 *
	 * @param bool $dry_run Dry run mode (don't save to database).
	 * @return array
	 */
	public static function recalculate_all( $dry_run = false ) {
		$results = array(
			'success' => 0,
			'failed'  => 0,
			'log'     => array(),
		);

		$page = 1;
		do {
			$batch = self::recalculate_batch( $page, $dry_run );
			$results['success'] += (int) $batch['success'];
			$results['failed']  += (int) $batch['failed'];
			if ( ! empty( $batch['log'] ) ) {
				$results['log'] = array_merge( $results['log'], $batch['log'] );
			}
			$page++;
		} while ( ! $batch['finished'] );

		if ( $dry_run && ! empty( $results['log'] ) ) {
			self::write_log( $results['log'] );
		}

		return $results;
	}

	/**
	 * Process one page of products/variations.
	 *
	 * @param int  $page    Page number (1-based).
	 * @param bool $dry_run Dry run mode.
	 * @return array{processed:int,success:int,failed:int,finished:bool,log:array}
	 */
	public static function recalculate_batch( $page, $dry_run = false ) {
		$results = array(
			'processed' => 0,
			'success'   => 0,
			'failed'    => 0,
			'finished'  => false,
			'log'       => array(),
		);

		$page = max( 1, (int) $page );
		$q    = new WP_Query(
			array(
				'post_type'              => array( 'product', 'product_variation' ),
				'post_status'            => 'any',
				'posts_per_page'         => self::PER_PAGE,
				'paged'                  => $page,
				'orderby'                => 'ID',
				'order'                  => 'ASC',
				'fields'                 => 'ids',
				'no_found_rows'          => false,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		$total_pages = (int) $q->max_num_pages;
		if ( empty( $q->posts ) ) {
			$results['finished'] = true;
			return $results;
		}

		foreach ( $q->posts as $product_id ) {
			$product_id = (int) $product_id;
			$results['processed']++;
			$row = self::sync_product_price( $product_id, $dry_run );
			if ( ! empty( $row['success'] ) ) {
				$results['success']++;
			} elseif ( ! empty( $row['failed'] ) ) {
				$results['failed']++;
			}
			if ( ! empty( $row['log'] ) ) {
				$results['log'][] = $row['log'];
			}
		}

		$results['finished'] = $page >= $total_pages;
		return $results;
	}

	/**
	 * Sync one product/variation WooCommerce price from WFCP purchase price.
	 *
	 * @param int  $product_id Product or variation ID.
	 * @param bool $dry_run    Dry run mode.
	 * @return array{success?:bool,failed?:bool,log?:string}
	 */
	private static function sync_product_price( $product_id, $dry_run = false ) {
		$parent_id = (int) wp_get_post_parent_id( $product_id );

		if ( self::is_price_sync_locked( $product_id, $parent_id ) ) {
			return array(
				'log' => sprintf( 'محصول #%d: قیمت قفل شده است', $product_id ),
			);
		}

		$purchase_price = self::resolve_purchase_price_for_sync( $product_id, $parent_id );
		if ( ! $purchase_price ) {
			return array(
				'failed' => true,
				'log'    => sprintf( 'محصول #%d: قیمت خرید تعیین نشده', $product_id ),
			);
		}

		$calc_product_id = $parent_id > 0 ? $parent_id : $product_id;
		$retail_price    = WFCP_Calculator::calculate_price( $purchase_price, 'retail', $calc_product_id );
		$title           = get_the_title( $product_id );

		if ( $dry_run ) {
			return array(
				'success' => true,
				'log'     => sprintf(
					'محصول #%d (%s): قیمت خرید: %s، قیمت تکی: %s',
					$product_id,
					$title,
					WFCP_Helper::format_price_with_irt_symbol( $purchase_price ),
					WFCP_Helper::format_price_with_irt_symbol( $retail_price )
				),
			);
		}

		$wc_product = wc_get_product( $product_id );
		if ( ! $wc_product ) {
			return array(
				'failed' => true,
				'log'    => sprintf( 'محصول #%d: شیء ووکامرس یافت نشد', $product_id ),
			);
		}

		if ( ! in_array( $wc_product->get_type(), self::$syncable_product_types, true ) ) {
			return array(
				'log' => sprintf(
					'محصول #%d: نوع %s — قیمت ووکامرس از تنوع‌ها/زیرمجموعه مدیریت می‌شود',
					$product_id,
					$wc_product->get_type()
				),
			);
		}

		$decimal = wc_format_decimal( $retail_price );
		$wc_product->set_regular_price( $decimal );
		$wc_product->set_price( $decimal );
		$wc_product->save();

		wc_delete_product_transients( $product_id );
		if ( $parent_id > 0 ) {
			wc_delete_product_transients( $parent_id );
		}

		return array(
			'success' => true,
			'log'     => sprintf(
				'محصول #%d (%s): قیمت به‌روزرسانی شد',
				$product_id,
				$title
			),
		);
	}

	/**
	 * Count product + variation posts for batch sizing.
	 *
	 * @return int
	 */
	private static function count_syncable_posts() {
		$q = new WP_Query(
			array(
				'post_type'      => array( 'product', 'product_variation' ),
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'no_found_rows'  => false,
			)
		);
		return (int) $q->found_posts;
	}

	/**
	 * Enqueue next batch via Action Scheduler or WP-Cron.
	 *
	 * @param int    $page    Page number.
	 * @param string $run_id  Run ID.
	 * @return void
	 */
	private static function enqueue_batch( $page, $run_id ) {
		if ( function_exists( 'as_enqueue_async_action' ) ) {
			as_enqueue_async_action(
				self::HOOK,
				array(
					'page' => (int) $page,
					'run'  => (string) $run_id,
				),
				self::GROUP
			);
		} else {
			wp_schedule_single_event(
				time() + 1,
				self::HOOK,
				array( (int) $page, (string) $run_id )
			);
		}
	}

	/**
	 * Effective purchase price for sync (variation inherits parent when own meta empty).
	 *
	 * @param int $product_id Product or variation ID.
	 * @param int $parent_id  Parent product ID for variations, else 0.
	 * @return float|null
	 */
	private static function resolve_purchase_price_for_sync( $product_id, $parent_id ) {
		$own = WFCP_Helper::get_product_purchase_price( $product_id );
		if ( null !== $own && $own > 0 ) {
			return (float) $own;
		}
		if ( $parent_id > 0 ) {
			$parent_purchase = WFCP_Helper::get_product_purchase_price( $parent_id );
			if ( null !== $parent_purchase && $parent_purchase > 0 ) {
				return (float) $parent_purchase;
			}
		}
		return null;
	}

	/**
	 * Whether WooCommerce prices should not be overwritten (matches parent lock for variations in admin UI).
	 *
	 * @param int $product_id Product or variation ID.
	 * @param int $parent_id  Parent ID for variations.
	 * @return bool
	 */
	private static function is_price_sync_locked( $product_id, $parent_id ) {
		if ( WFCP_Helper::is_product_price_locked( $product_id ) ) {
			return true;
		}
		if ( $parent_id > 0 && WFCP_Helper::is_product_price_locked( $parent_id ) ) {
			return true;
		}
		return false;
	}

	/**
	 * Write log to file
	 *
	 * @param array $log Log entries.
	 * @return bool
	 */
	private static function write_log( $log ) {
		$upload_dir = wp_upload_dir();

		if ( empty( $upload_dir['error'] ) ) {
			$log_dir = $upload_dir['basedir'] . '/wfcp-logs';

			if ( ! file_exists( $log_dir ) ) {
				wp_mkdir_p( $log_dir );
			}

			if ( ! is_writable( $log_dir ) ) {
				return false;
			}

			$log_file = $log_dir . '/recalculate-' . gmdate( 'Y-m-d-H-i-s' ) . '.log';
			$content  = implode( "\n", $log );

			return false !== file_put_contents( $log_file, $content );
		}

		return false;
	}

	/**
	 * Delete all transients
	 *
	 * @return int Number of deleted transients.
	 */
	public static function delete_transients() {
		global $wpdb;

		$deleted  = (int) $wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_wfcp_%'" );
		$deleted += (int) $wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_wfcp_%'" );

		return $deleted;
	}

	/**
	 * Export settings to JSON
	 *
	 * @return string JSON encoded settings.
	 */
	public static function export_settings() {
		$settings = WFCP_Helper::get_settings();
		return wp_json_encode( $settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
	}

	/**
	 * Import settings from JSON
	 *
	 * @param string $json JSON encoded settings.
	 * @return bool|WP_Error
	 */
	public static function import_settings( $json ) {
		$settings = json_decode( $json, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new WP_Error( 'invalid_json', __( 'فرمت JSON نامعتبر است.', 'webina-woo-core' ) );
		}

		return update_option( 'wfcp_settings', $settings );
	}
}
