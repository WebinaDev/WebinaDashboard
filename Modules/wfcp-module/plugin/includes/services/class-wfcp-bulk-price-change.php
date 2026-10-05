<?php
/**
 * Bulk Price Change Service
 * 
 * Handles bulk price modifications, CSV import, and background processing
 * for WooCommerce products using Action Scheduler / WP-Cron.
 *
 * @package    WFCP
 * @subpackage WFCP/includes/services
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Bulk Price Change Service
 */
class WFCP_Bulk_Price_Change {

	const SLUG        = 'wfcp-price-changer';
	const GROUP       = 'wfcp-bpc';
	const PER_PAGE    = 100;
	const LOCK_KEY    = 'wfcp_bpc_lock';
	const PARAMS_KEY  = 'wfcp_bpc_params';
	const STATE_KEY   = 'wfcp_bpc_state';
	const LASTLOG_KEY = 'wfcp_bpc_last_log';
	const LOG_DIR     = 'wfcp-bpc-logs';

	/**
	 * Register hooks.
	 */
	public function __construct() {
		add_action( 'admin_notices', array( $this, 'notices' ) );
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_status' ), 100 );
		add_action( 'admin_post_wfcp_bpc_start', array( $this, 'handle_start' ) );
		add_action( 'admin_post_wfcp_bpc_cancel', array( $this, 'handle_cancel' ) );
		add_action( 'admin_post_wfcp_bpc_run_now', array( $this, 'handle_run_now' ) );
		add_action( 'admin_post_wfcp_bpc_import', array( $this, 'handle_import' ) );
		add_action( 'admin_post_wfcp_bpc_clear_queue', array( $this, 'handle_clear_queue' ) );
		add_action( 'wfcp_bpc_process', array( $this, 'job_bump' ), 10, 2 );
		add_action( 'wfcp_bpc_import_process', array( $this, 'job_import' ), 10, 2 );
	}

	/* ─────────────────────── Helpers ─────────────────────── */

	/**
	 * Sanitize a price string - keep only digits and dots.
	 *
	 * @param string $price_string The raw price string.
	 * @return string Sanitized price or empty.
	 */
	private function sanitize_price( $price_string ) {
		$price_string = trim( $price_string );
		if ( '' === $price_string ) {
			return '';
		}
		return preg_replace( '/[^0-9.]/', '', $price_string );
	}

	/**
	 * Verify nonce.
	 */
	private function nonce_ok( $action, $field ) {
		return isset( $_POST[ $field ] ) && wp_verify_nonce( $_POST[ $field ], $action );
	}

	/**
	 * Redirect with error.
	 */
	private function redirect_err( $msg ) {
		wp_redirect( admin_url( 'admin.php?page=' . self::SLUG . '&wfcp_bpc_err=' . urlencode( $msg ) ) );
		exit;
	}

	/**
	 * Enqueue an async action via Action Scheduler or WP-Cron.
	 */
	private function enqueue_job( $hook, $page = 1, $run_id = '' ) {
		if ( function_exists( 'as_enqueue_async_action' ) ) {
			as_enqueue_async_action( $hook, array( 'page' => (int) $page, 'run' => (string) $run_id ), self::GROUP );
		} else {
			wp_schedule_single_event( time() + 1, $hook, array( (int) $page, (string) $run_id ) );
		}
	}

	/* ─────────────────────── CSV Import ─────────────────────── */

	/**
	 * Handle CSV import form submission.
	 */
	public function handle_import() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'No access' );
		}
		if ( ! $this->nonce_ok( self::SLUG . '_import_nonce', self::SLUG . '_import_nonce_field' ) ) {
			wp_die( 'Bad nonce' );
		}
		if ( get_transient( self::LOCK_KEY ) ) {
			$this->redirect_err( 'یک فرآیند دیگر در حال اجراست. لطفا صبر کرده یا آن را لغو کنید.' );
		}
		if ( empty( $_FILES['import_csv'] ) || UPLOAD_ERR_OK !== $_FILES['import_csv']['error'] ) {
			$this->redirect_err( 'خطا در آپلود فایل یا فایلی انتخاب نشده است.' );
		}

		$file_info = wp_check_filetype( $_FILES['import_csv']['name'] );
		if ( ! in_array( strtolower( $file_info['ext'] ), array( 'csv' ), true ) ) {
			$this->redirect_err( 'نوع فایل نامعتبر است. لطفاً فقط فایل با فرمت CSV آپلود کنید.' );
		}

		if ( ! function_exists( 'wp_handle_upload' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		$movefile = wp_handle_upload( $_FILES['import_csv'], array( 'test_form' => false ) );

		if ( ! $movefile || isset( $movefile['error'] ) ) {
			$this->redirect_err( 'خطا در آپلود فایل: ' . ( $movefile['error'] ?? 'Unknown error' ) );
		}

		$file_path = $movefile['file'];
		$handle = fopen( $file_path, 'r' );
		if ( ! $handle ) {
			$this->redirect_err( 'امکان خواندن فایل آپلود شده وجود ندارد.' );
		}

		$header = fgetcsv( $handle );
		if ( empty( $header ) || ! in_array( 'id', $header, true ) || ! in_array( 'regular_new', $header, true ) ) {
			fclose( $handle );
			wp_delete_file( $file_path );
			$this->redirect_err( 'فایل CSV نامعتبر است. سطر اول (هدر) باید حتما شامل ستون‌های `id` و `regular_new` باشد.' );
		}

		$total_rows = 0;
		while ( false !== fgetcsv( $handle ) ) {
			$total_rows++;
		}
		fclose( $handle );

		if ( 0 === $total_rows ) {
			wp_delete_file( $file_path );
			$this->redirect_err( 'فایل CSV هیچ ردیف داده‌ای ندارد.' );
		}

		$run_id = wp_generate_uuid4();
		$this->init_import_log( $run_id );
		$params = array(
			'job_type'   => 'import',
			'run_id'     => $run_id,
			'started_at' => time(),
			'file_path'  => $file_path,
		);
		update_option( self::PARAMS_KEY, $params, false );

		$pages = (int) ceil( $total_rows / self::PER_PAGE );
		$state = array(
			'total'         => $total_rows,
			'pages'         => $pages,
			'current_page'  => 0,
			'processed'     => 0,
			'processed_ids' => array(),
		);
		update_option( self::STATE_KEY, $state, false );

		set_transient( self::LOCK_KEY, 1, 30 * MINUTE_IN_SECONDS );
		$this->enqueue_job( 'wfcp_bpc_import_process', 1, $run_id );

		wp_redirect( admin_url( 'admin.php?page=' . self::SLUG . '&queued=1' ) );
		exit;
	}

	/**
	 * Background job: process a single CSV import batch.
	 */
	public function job_import( $page = 1, $run = '' ) {
		set_transient( self::LOCK_KEY, 1, 30 * MINUTE_IN_SECONDS );
		$params = get_option( self::PARAMS_KEY );
		$state  = get_option( self::STATE_KEY );
		if ( ! $params || ! $state || $run !== $params['run_id'] || empty( $params['file_path'] ) || ! file_exists( $params['file_path'] ) ) {
			delete_transient( self::LOCK_KEY );
			return;
		}

		$processed_ids_map = isset( $state['processed_ids'] ) ? $state['processed_ids'] : array();

		$handle = fopen( $params['file_path'], 'r' );
		if ( ! $handle ) {
			return;
		}

		$header       = fgetcsv( $handle );
		$id_idx       = array_search( 'id', $header, true );
		$reg_new_idx  = array_search( 'regular_new', $header, true );
		$sale_new_idx = array_search( 'sale_new', $header, true );

		if ( false === $id_idx || false === $reg_new_idx ) {
			fclose( $handle );
			delete_transient( self::LOCK_KEY );
			return;
		}

		rewind( $handle );
		fgetcsv( $handle );

		$start_row = ( ( $page - 1 ) * self::PER_PAGE );
		if ( $start_row > 0 ) {
			for ( $i = 0; $i < $start_row; $i++ ) {
				if ( false === fgetcsv( $handle ) ) {
					break;
				}
			}
		}

		$processed_in_batch    = 0;
		$total_processed_so_far = ( $page - 1 ) * self::PER_PAGE;
		$log_rows              = array();

		while ( $processed_in_batch < self::PER_PAGE && false !== ( $row = fgetcsv( $handle ) ) ) {
			$processed_in_batch++;
			$product_id = ! empty( $row[ $id_idx ] ) ? absint( $row[ $id_idx ] ) : 0;
			if ( ! $product_id ) {
				continue;
			}

			if ( isset( $processed_ids_map[ $product_id ] ) ) {
				$log_rows[] = $this->row_import( $product_id, 'SKIPPED', '', '', 'Duplicate Product ID in CSV. Already processed.' );
				continue;
			}

			$product = wc_get_product( $product_id );
			if ( ! $product ) {
				$log_rows[] = $this->row_import( $product_id, 'SKIPPED', '', '', 'Product ID not found.' );
				continue;
			}

			$old_reg_price     = $product->get_regular_price( 'edit' );
			$reg_price_csv     = $row[ $reg_new_idx ];
			$sanitized_reg_price = $this->sanitize_price( $reg_price_csv );

			if ( '' === $sanitized_reg_price || ! is_numeric( $sanitized_reg_price ) || $sanitized_reg_price < 0 ) {
				$log_rows[] = $this->row_import( $product_id, 'SKIPPED', $old_reg_price, $reg_price_csv, "Invalid price format: '{$reg_price_csv}'" );
				continue;
			}

			$sale_price_csv     = ( false !== $sale_new_idx ) ? $row[ $sale_new_idx ] : '';
			$sanitized_sale_price = $this->sanitize_price( $sale_price_csv );

			try {
				if ( $product->is_type( 'variable' ) ) {
					$children = $product->get_children();
					if ( empty( $children ) ) {
						$log_rows[] = $this->row_import( $product_id, 'SKIPPED', $old_reg_price, $reg_price_csv, 'Variable product has no variations.' );
						continue;
					}
					$all_variations_saved = true;
					foreach ( $children as $variation_id ) {
						$variation = wc_get_product( $variation_id );
						if ( ! $variation ) {
							continue;
						}

						$variation->set_regular_price( $sanitized_reg_price );
						if ( '' !== $sanitized_sale_price && is_numeric( $sanitized_sale_price ) && $sanitized_sale_price >= 0 ) {
							$variation->set_sale_price( $sanitized_sale_price );
						} else {
							$variation->set_sale_price( '' );
						}

						$update_result = $variation->save();
						if ( 0 === $update_result || false === $update_result ) {
							$all_variations_saved = false;
						}
					}

					if ( $all_variations_saved ) {
						WC_Product_Variable::sync( $product );
						$log_rows[] = $this->row_import( $product_id, 'SUCCESS', $old_reg_price, $sanitized_reg_price, 'All variations updated.' );
					} else {
						$log_rows[] = $this->row_import( $product_id, 'FAILED', $old_reg_price, $sanitized_reg_price, 'One or more variations failed to save silently.' );
					}
				} else {
					$product->set_regular_price( $sanitized_reg_price );
					if ( '' !== $sanitized_sale_price && is_numeric( $sanitized_sale_price ) && $sanitized_sale_price >= 0 ) {
						$product->set_sale_price( $sanitized_sale_price );
					} else {
						$product->set_sale_price( '' );
					}

					$update_result = $product->save();

					if ( $update_result > 0 ) {
						$log_rows[] = $this->row_import( $product_id, 'SUCCESS', $old_reg_price, $sanitized_reg_price, 'Product updated.' );
					} else {
						$log_rows[] = $this->row_import( $product_id, 'FAILED', $old_reg_price, $sanitized_reg_price, 'Save command failed silently.' );
					}
				}
				wc_delete_product_transients( $product_id );
				$processed_ids_map[ $product_id ] = true;
			} catch ( \Throwable $e ) {
				$log_rows[] = $this->row_import( $product_id, 'ERROR', $old_reg_price, $reg_price_csv, 'Exception during save: ' . $e->getMessage() );
			}
		}

		$is_last_batch = feof( $handle );
		fclose( $handle );

		if ( ! empty( $log_rows ) ) {
			$this->log_rows( $run, $log_rows, 'import-log-' );
		}

		$state['current_page']  = (int) $page;
		$state['processed']     = $total_processed_so_far + $processed_in_batch;
		$state['processed_ids'] = $processed_ids_map;
		update_option( self::STATE_KEY, $state, false );

		if ( $is_last_batch || $state['processed'] >= $state['total'] ) {
			if ( function_exists( 'wp_cache_flush' ) ) {
				wp_cache_flush();
			}
			if ( function_exists( 'litespeed_purge_all' ) ) {
				litespeed_purge_all();
			}

			$last = array(
				'run' => $run,
				'url' => $this->log_url( $run, 'import-log-' ),
			);
			update_option( self::LASTLOG_KEY, $last, false );

			if ( file_exists( $params['file_path'] ) ) {
				wp_delete_file( $params['file_path'] );
			}
			delete_option( self::PARAMS_KEY );
			delete_option( self::STATE_KEY );
			delete_transient( self::LOCK_KEY );
		} else {
			$this->enqueue_job( 'wfcp_bpc_import_process', (int) $page + 1, $run );
		}
	}

	/* ─────────────────────── Bulk Bump ─────────────────────── */

	/**
	 * Background job: process a single bump batch.
	 */
	public function job_bump( $page = 1, $run = '', $from_ui = false ) {
		set_transient( self::LOCK_KEY, 1, 30 * MINUTE_IN_SECONDS );
		$params = get_option( self::PARAMS_KEY );
		$state  = get_option( self::STATE_KEY );
		if ( ! $params || ! $state || $run !== $params['run_id'] ) {
			delete_transient( self::LOCK_KEY );
			return;
		}
		$done                = $this->process_batch( $params, (int) $page );
		$state['current_page'] = (int) $page;
		$state['processed']   += (int) $done['updated'];
		update_option( self::STATE_KEY, $state, false );
		if ( $done['finished'] ) {
			delete_option( self::PARAMS_KEY );
			delete_option( self::STATE_KEY );
			delete_transient( self::LOCK_KEY );
			$last = array(
				'run' => $run,
				'url' => $this->log_url( $run ),
			);
			update_option( self::LASTLOG_KEY, $last, false );
			if ( $from_ui ) {
				wp_redirect( admin_url( 'admin.php?page=' . self::SLUG . '&wfcp_bpc_done=' . urlencode( 'پایان فرآیند افزایش قیمت. به‌روزرسانی انجام شد.' ) ) );
				exit;
			}
		} else {
			$this->enqueue_job( 'wfcp_bpc_process', (int) $page + 1, $run );
		}
	}

	/* ─────────────────────── Form Handlers ─────────────────────── */

	/**
	 * Handle start bulk price change.
	 */
	public function handle_start() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'No access' );
		}
		if ( ! $this->nonce_ok( self::SLUG . '_nonce', self::SLUG . '_nonce_field' ) ) {
			wp_die( 'Bad nonce' );
		}
		if ( get_transient( self::LOCK_KEY ) ) {
			$this->redirect_err( 'یک فرآیند در حال اجراست. اول صبر/لغو کنید.' );
		}

		$type               = sanitize_text_field( $_POST['type'] ?? 'fixed' );
		$value              = floatval( $_POST['value'] ?? 0 );
		$apply_sale         = ! empty( $_POST['apply_sale'] );
		$cat_slugs          = sanitize_text_field( $_POST['category_slugs'] ?? '' );
		$range_rules        = isset( $_POST['range_rules'] ) ? sanitize_textarea_field( wp_unslash( $_POST['range_rules'] ) ) : '';
		$rules_combine      = ! empty( $_POST['rules_combine'] ) ? 1 : 0;
		$enable_rounding    = ! empty( $_POST['enable_rounding'] );
		$rounding_threshold = (float) ( $_POST['rounding_threshold'] ?? 50000 );
		$rounding_value     = (int) ( $_POST['rounding_value'] ?? 1000 );

		if ( 0 == $value && '' === trim( $range_rules ) ) {
			$this->redirect_err( 'حداقل یکی از «افزایش پایه» یا «قوانین بازه‌ای» باید تنظیم شود.' );
		}

		$run_id = wp_generate_uuid4();
		$params = array(
			'job_type'           => 'bump',
			'type'               => ( 'percent' === $type ) ? 'percent' : 'fixed',
			'value'              => $value,
			'apply_sale'         => $apply_sale ? 1 : 0,
			'cats'               => $cat_slugs,
			'run_id'             => $run_id,
			'started_at'         => time(),
			'rules'              => $range_rules,
			'rules_mode'         => $rules_combine ? 'combine' : 'override',
			'enable_rounding'    => $enable_rounding,
			'rounding_threshold' => $rounding_threshold,
			'rounding_value'     => $rounding_value,
		);
		update_option( self::PARAMS_KEY, $params, false );

		$total = $this->count_products( $cat_slugs );
		$pages = (int) ceil( max( 1, $total ) / self::PER_PAGE );
		$state = array(
			'total'        => $total,
			'pages'        => $pages,
			'current_page' => 0,
			'processed'    => 0,
		);
		update_option( self::STATE_KEY, $state, false );

		$this->init_log( $run_id );
		set_transient( self::LOCK_KEY, 1, 30 * MINUTE_IN_SECONDS );
		$this->enqueue_job( 'wfcp_bpc_process', 1, $run_id );

		wp_redirect( admin_url( 'admin.php?page=' . self::SLUG . '&queued=1' ) );
		exit;
	}

	/**
	 * Handle cancel.
	 */
	public function handle_cancel() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'No access' );
		}
		if ( ! $this->nonce_ok( self::SLUG . '_nonce', self::SLUG . '_nonce_field' ) ) {
			wp_die( 'Bad nonce' );
		}
		$params = get_option( self::PARAMS_KEY );
		if ( $params && isset( $params['job_type'] ) && 'import' === $params['job_type'] && ! empty( $params['file_path'] ) ) {
			if ( file_exists( $params['file_path'] ) ) {
				wp_delete_file( $params['file_path'] );
			}
		}
		delete_transient( self::LOCK_KEY );
		delete_option( self::PARAMS_KEY );
		delete_option( self::STATE_KEY );
		wp_redirect( admin_url( 'admin.php?page=' . self::SLUG . '&canceled=1' ) );
		exit;
	}

	/**
	 * Handle "Run Now" (synchronous single step).
	 */
	public function handle_run_now() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'No access' );
		}
		if ( ! $this->nonce_ok( self::SLUG . '_nonce', self::SLUG . '_nonce_field' ) ) {
			wp_die( 'Bad nonce' );
		}
		$params = get_option( self::PARAMS_KEY );
		$state  = get_option( self::STATE_KEY );
		if ( ! $params || ! $state || ( isset( $params['job_type'] ) && 'import' === $params['job_type'] ) ) {
			$this->redirect_err( 'هیچ Job افزایش قیمتی در صف نیست.' );
		}
		$next_page = max( 1, (int) $state['current_page'] + 1 );
		$this->job_bump( $next_page, $params['run_id'], true );
		wp_redirect( admin_url( 'admin.php?page=' . self::SLUG . '&queued=1' ) );
		exit;
	}

	/**
	 * Handle clearing queue.
	 */
	public function handle_clear_queue() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'No access' );
		}
		if ( ! $this->nonce_ok( self::SLUG . '_clear_queue_nonce', self::SLUG . '_clear_queue_nonce_field' ) ) {
			wp_die( 'Bad nonce' );
		}
		global $wpdb;
		$table = $wpdb->prefix . 'actionscheduler_actions';
		$count1 = $wpdb->query( "DELETE FROM {$table} WHERE hook = 'wc_update_product_lookup_tables' AND status = 'pending'" );
		$count2 = $wpdb->query( "DELETE FROM {$table} WHERE hook = 'wc_update_product_lookup_tables_column' AND status = 'pending'" );
		$total_deleted = $count1 + $count2;
		wp_redirect( admin_url( 'admin.php?page=' . self::SLUG . '&cleared=' . $total_deleted ) );
		exit;
	}

	/* ─────────────────────── Admin Notices ─────────────────────── */

	/**
	 * Show admin notices for status updates.
	 */
	public function notices() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		if ( isset( $_GET['wfcp_bpc_done'] ) ) {
			$msg = sanitize_text_field( urldecode( $_GET['wfcp_bpc_done'] ) );
			echo '<div class="notice notice-success"><p>' . esc_html( $msg ) . '</p></div>';
		}
		if ( isset( $_GET['wfcp_bpc_err'] ) ) {
			$msg = sanitize_text_field( urldecode( $_GET['wfcp_bpc_err'] ) );
			echo '<div class="notice notice-error"><p>' . esc_html( $msg ) . '</p></div>';
		}
		if ( isset( $_GET['queued'] ) && isset( $_GET['page'] ) && self::SLUG === $_GET['page'] ) {
			echo '<div class="notice notice-info"><p>وظیفه با موفقیت صف شد و به زودی در پس‌زمینه اجرا می‌شود.</p></div>';
		}
		if ( isset( $_GET['canceled'] ) && isset( $_GET['page'] ) && self::SLUG === $_GET['page'] ) {
			echo '<div class="notice notice-warning"><p>فرآیند لغو شد.</p></div>';
		}
		if ( isset( $_GET['cleared'] ) && isset( $_GET['page'] ) && self::SLUG === $_GET['page'] ) {
			$count = (int) $_GET['cleared'];
			echo '<div class="notice notice-success"><p>' . sprintf( '%d وظیفه در انتظار با موفقیت حذف شد.', $count ) . '</p></div>';
		}
	}

	/**
	 * Admin bar status indicator.
	 */
	public function admin_bar_status( $wp_admin_bar ) {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		$params = get_option( self::PARAMS_KEY );
		$state  = get_option( self::STATE_KEY );
		if ( ! $params || ! $state ) {
			return;
		}
		$pages   = max( 1, intval( $state['pages'] ?? 1 ) );
		$current = intval( $state['current_page'] ?? 0 );
		$percent = min( 100, max( 0, floor( ( $current / $pages ) * 100 ) ) );
		$job_type_label = ( isset( $params['job_type'] ) && 'import' === $params['job_type'] ) ? 'Import' : 'Price Bump';
		$title          = $job_type_label . ': ' . $percent . '%';
		$wp_admin_bar->add_node( array(
			'id'    => 'wfcp-bpc-status',
			'title' => esc_html( $title ),
			'href'  => admin_url( 'admin.php?page=' . self::SLUG ),
			'meta'  => array( 'class' => 'wfcp-bpc-status' ),
		) );
	}

	/* ─────────────────────── Page Render ─────────────────────── */

	/**
	 * Render the price changer page.
	 */
	public function page() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}

		$params = get_option( self::PARAMS_KEY );
		$state  = get_option( self::STATE_KEY );
		$locked = (bool) get_transient( self::LOCK_KEY );
		?>
		<div class="wrap wfcp-bulk-wrap">
			<div class="wfcp-bulk-header">
				<h1><span class="dashicons dashicons-update"></span>تغییر قیمت گروهی</h1>
				<p>ابزار قدرتمند برای تغییر قیمت‌های گروهی محصولات ووکامرس با قابلیت‌های پیشرفته</p>
			</div>

			<?php if ( $params ) : ?>
				<?php $this->render_status( $params, $state, true, $locked ); ?>
				<div class="wfcp-bulk-actions">
					<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="wfcp-inline-form">
						<?php wp_nonce_field( self::SLUG . '_nonce', self::SLUG . '_nonce_field' ); ?>
						<input type="hidden" name="action" value="wfcp_bpc_cancel">
						<button class="button button-secondary wfcp-cancel-btn">
							<span class="dashicons dashicons-no"></span> لغو فرآیند
						</button>
					</form>

					<?php if ( isset( $params['job_type'] ) && 'import' !== $params['job_type'] ) : ?>
						<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="wfcp-inline-form">
							<?php wp_nonce_field( self::SLUG . '_nonce', self::SLUG . '_nonce_field' ); ?>
							<input type="hidden" name="action" value="wfcp_bpc_run_now">
							<button class="button button-primary wfcp-run-now-btn">
								<span class="dashicons dashicons-controls-play"></span> اجرای فوری
							</button>
						</form>
					<?php endif; ?>
				</div>
			<?php else : ?>
				<div class="wfcp-bulk-content">
					<?php $this->render_form(); ?>
					<?php $this->render_import_form(); ?>
					<?php $this->render_tools_section(); ?>

					<?php
					$last = get_option( self::LASTLOG_KEY );
					if ( ! empty( $last['url'] ) ) :
						?>
						<div class="wfcp-log-section">
							<h3><span class="dashicons dashicons-download"></span>آخرین فایل لاگ</h3>
							<p>لینک آخرین فایل لاگ ایجاد شده:
								<a target="_blank" href="<?php echo esc_url( $last['url'] ); ?>" class="wfcp-log-link">
									<?php echo esc_html( basename( $last['url'] ) ); ?>
								</a>
							</p>
						</div>
					<?php endif; ?>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/* ─────────────────────── Form Renders ─────────────────────── */

	/**
	 * Render bulk bump form.
	 */
	private function render_form() {
		?>
		<div class="wfcp-bulk-card">
			<div class="wfcp-card-header">
				<h2><span class="dashicons dashicons-chart-line"></span>افزایش گروهی قیمت‌ها</h2>
				<p>قیمت محصولات را به صورت گروهی و خودکار افزایش دهید</p>
			</div>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="wfcp-bulk-form">
				<?php wp_nonce_field( self::SLUG . '_nonce', self::SLUG . '_nonce_field' ); ?>
				<input type="hidden" name="action" value="wfcp_bpc_start">

				<div class="wfcp-form-section">
					<h3>تنظیمات پایه</h3>
					<div class="wfcp-form-row">
						<label class="wfcp-form-label">نوع افزایش</label>
						<div class="wfcp-radio-group">
							<label class="wfcp-radio-item">
								<input type="radio" name="type" value="fixed" checked>
								<span class="wfcp-radio-text">مبلغ ثابت (تومان)</span>
							</label>
							<label class="wfcp-radio-item">
								<input type="radio" name="type" value="percent">
								<span class="wfcp-radio-text">درصد (%)</span>
							</label>
						</div>
					</div>

					<div class="wfcp-form-row">
						<label class="wfcp-form-label" for="wfcp_bpc_value">مقدار افزایش</label>
						<input type="number" id="wfcp_bpc_value" name="value" step="0.0001" required
							   class="wfcp-form-input" placeholder="مثلاً 50000 یا 10">
						<p class="wfcp-form-description">مقدار افزایش را وارد کنید</p>
					</div>

					<div class="wfcp-form-row">
						<label class="wfcp-checkbox-item">
							<input type="checkbox" name="apply_sale" value="1" checked>
							<span class="wfcp-checkbox-text">اعمال روی قیمت‌های حراج</span>
						</label>
					</div>
				</div>

				<div class="wfcp-form-section">
					<h3>فیلترها (اختیاری)</h3>
					<div class="wfcp-form-row">
						<label class="wfcp-form-label" for="wfcp_bpc_category_slugs">محدود به دسته‌ها</label>
						<input type="text" id="wfcp_bpc_category_slugs" name="category_slugs"
							   class="wfcp-form-input" placeholder="slug دسته‌ها با کاما: makeup,skincare">
						<p class="wfcp-form-description">فقط محصولات این دسته‌ها را تغییر دهید</p>
					</div>
				</div>

				<div class="wfcp-form-section">
					<h3>قوانین پیشرفته (اختیاری)</h3>
					<div class="wfcp-form-row">
						<label class="wfcp-form-label" for="wfcp_bpc_range_rules">قوانین بازه‌ای</label>
						<textarea id="wfcp_bpc_range_rules" name="range_rules" rows="6"
								  class="wfcp-form-textarea" placeholder="هر خط: min-max: delta"></textarea>
						<p class="wfcp-form-description">مثال: 10000-50000: 5000 (برای قیمت‌های 10-50 هزار تومان، 5 هزار تومان اضافه کن)</p>

						<label class="wfcp-checkbox-item">
							<input type="checkbox" name="rules_combine" value="1">
							<span class="wfcp-checkbox-text">ترکیب با افزایش پایه (پیش‌فرض: جایگزین)</span>
						</label>
					</div>
				</div>

				<div class="wfcp-form-section">
					<h3>رند کردن قیمت (اختیاری)</h3>
					<div class="wfcp-form-row">
						<label class="wfcp-checkbox-item">
							<input type="checkbox" name="enable_rounding" value="1">
							<span class="wfcp-checkbox-text">فعال‌سازی رند کردن قیمت</span>
						</label>
						<p class="wfcp-form-description">قیمت‌های نهایی که کمتر از آستانه باشند، رند می‌شوند</p>

						<div class="wfcp-form-inline">
							<div class="wfcp-form-group">
								<label class="wfcp-form-label" for="wfcp_bpc_rounding_threshold">آستانه قیمت</label>
								<input type="number" id="wfcp_bpc_rounding_threshold" name="rounding_threshold"
									   value="50000" class="wfcp-form-input-small">
							</div>
							<div class="wfcp-form-group">
								<label class="wfcp-form-label" for="wfcp_bpc_rounding_value">رند به نزدیک‌ترین</label>
								<input type="number" id="wfcp_bpc_rounding_value" name="rounding_value"
									   value="1000" step="10" class="wfcp-form-input-small">
							</div>
						</div>
					</div>
				</div>

				<div class="wfcp-form-actions">
					<button type="submit" class="button button-primary button-large wfcp-submit-btn">
						<span class="dashicons dashicons-yes"></span> شروع فرآیند
					</button>
				</div>
			</form>
		</div>
		<?php
	}

	/**
	 * Render CSV import form.
	 */
	private function render_import_form() {
		?>
		<div class="wfcp-bulk-card">
			<div class="wfcp-card-header">
				<h2><span class="dashicons dashicons-upload"></span>ورود قیمت از CSV</h2>
				<p>فایل CSV خود را برای به‌روزرسانی قیمت‌ها آپلود کنید</p>
			</div>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>"
				  enctype="multipart/form-data" class="wfcp-bulk-form">
				<?php wp_nonce_field( self::SLUG . '_import_nonce', self::SLUG . '_import_nonce_field' ); ?>
				<input type="hidden" name="action" value="wfcp_bpc_import">

				<div class="wfcp-form-section">
					<div class="wfcp-form-row">
						<label class="wfcp-form-label" for="import_csv">فایل CSV</label>
						<div class="wfcp-file-upload">
							<input type="file" id="import_csv" name="import_csv"
								   accept=".csv, text/csv" required class="wfcp-file-input">
							<label for="import_csv" class="wfcp-file-label">
								<span class="dashicons dashicons-cloud-upload"></span>
								<span class="wfcp-file-text">انتخاب فایل CSV</span>
							</label>
						</div>
						<p class="wfcp-form-description">
							فایل CSV باید شامل ستون‌های <code>id</code> و <code>regular_new</code> باشد
						</p>
					</div>
				</div>

				<div class="wfcp-form-actions">
					<button type="submit" class="button button-secondary button-large wfcp-submit-btn">
						<span class="dashicons dashicons-upload"></span> شروع آپلود و پردازش
					</button>
				</div>
			</form>
		</div>
		<?php
	}

	/**
	 * Render tools section.
	 */
	private function render_tools_section() {
		?>
		<div class="wfcp-bulk-card wfcp-tools-card">
			<div class="wfcp-card-header">
				<h2><span class="dashicons dashicons-admin-tools"></span>ابزارهای کمکی</h2>
				<p>ابزارهای پیشرفته برای مدیریت و بهینه‌سازی سیستم</p>
			</div>

			<div class="wfcp-tool-item">
				<div class="wfcp-tool-header">
					<h3><span class="dashicons dashicons-trash"></span>پاک کردن صف وظایف</h3>
					<span class="wfcp-tool-badge wfcp-badge-warning">پیشرفته</span>
				</div>
				<p>اگر به دلیل اجرای نسخه‌های قدیمی این افزونه، تعداد بسیار زیادی وظیفه با نام
				   <code>wc_update_product_lookup_tables</code> در صف دارید، می‌توانید با این دکمه همه آنها را یکجا حذف کنید.</p>

				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>"
					  onsubmit="return confirm('آیا مطمئن هستید؟ این عمل تمام وظایف در انتظار ووکامرس برای آپدیت جداول را حذف می‌کند. این کار غیرقابل بازگشت است.');"
					  class="wfcp-tool-form">
					<?php wp_nonce_field( self::SLUG . '_clear_queue_nonce', self::SLUG . '_clear_queue_nonce_field' ); ?>
					<input type="hidden" name="action" value="wfcp_bpc_clear_queue">
					<button type="submit" class="button button-danger wfcp-tool-btn">
						<span class="dashicons dashicons-trash"></span> حذف وظایف در انتظار
					</button>
				</form>
			</div>
		</div>
		<?php
	}

	/**
	 * Render progress/status card.
	 */
	private function render_status( $params, $state, $show_log_link = false, $locked = false ) {
		$job_type_label = ( isset( $params['job_type'] ) && 'import' === $params['job_type'] ) ? 'ورود از CSV' : 'افزایش قیمت';
		$total     = isset( $state['total'] ) ? max( 0, intval( $state['total'] ) ) : 0;
		$pages     = isset( $state['pages'] ) ? max( 1, intval( $state['pages'] ) ) : 1;
		$current   = isset( $state['current_page'] ) ? intval( $state['current_page'] ) : 0;
		$processed = isset( $state['processed'] ) ? intval( $state['processed'] ) : 0;
		$run_id    = isset( $params['run_id'] ) ? sanitize_text_field( $params['run_id'] ) : '-';
		$started   = ! empty( $params['started_at'] ) ? date_i18n( 'Y-m-d H:i:s', intval( $params['started_at'] ) ) : '-';
		$percent   = min( 100, max( 0, ( $total > 0 ? floor( ( $processed / $total ) * 100 ) : 0 ) ) );
		?>
		<div class="wfcp-status-card">
			<div class="wfcp-status-header">
				<h2>
					<span class="dashicons dashicons-<?php echo $locked ? 'update' : 'clock'; ?>"></span>
					فرآیند <?php echo esc_html( $job_type_label ); ?>
					<span class="wfcp-status-badge <?php echo $locked ? 'wfcp-badge-running' : 'wfcp-badge-queued'; ?>">
						<?php echo $locked ? 'در حال اجرا…' : 'در صف/قابل اجرا'; ?>
					</span>
				</h2>
			</div>

			<div class="wfcp-status-content">
				<div class="wfcp-progress-section">
					<div class="wfcp-progress-bar">
						<div class="wfcp-progress-fill" style="width: <?php echo $percent; ?>%"></div>
					</div>
					<div class="wfcp-progress-text">
						<?php echo esc_html( $processed ); ?> از <?php echo esc_html( $total ); ?>
						(<?php echo $percent; ?>%)
					</div>
				</div>

				<div class="wfcp-status-details">
					<div class="wfcp-status-item">
						<span class="wfcp-status-label">شناسه فرآیند:</span>
						<code class="wfcp-status-value"><?php echo esc_html( $run_id ); ?></code>
					</div>
					<div class="wfcp-status-item">
						<span class="wfcp-status-label">زمان شروع:</span>
						<span class="wfcp-status-value"><?php echo esc_html( $started ); ?></span>
					</div>
					<div class="wfcp-status-item">
						<span class="wfcp-status-label">بچ فعلی:</span>
						<span class="wfcp-status-value"><?php echo esc_html( $current . ' / ' . $pages ); ?></span>
					</div>
				</div>

				<?php
				if ( $show_log_link ) :
					$log_url = ( 'import' === $params['job_type'] ) ? $this->log_url( $run_id, 'import-log-' ) : $this->log_url( $run_id );
					$log_prefix = ( 'import' === $params['job_type'] ) ? 'import-log-' : 'bpc-';
					if ( $log_url && file_exists( $this->log_path( $run_id, $log_prefix ) ) ) :
						?>
						<div class="wfcp-log-section">
							<a target="_blank" href="<?php echo esc_url( $log_url ); ?>" class="wfcp-log-link">
								<span class="dashicons dashicons-download"></span>
								دانلود فایل لاگ: <?php echo esc_html( basename( $log_url ) ); ?>
							</a>
						</div>
					<?php endif; ?>
				<?php endif; ?>

				<div class="wfcp-status-footer">
					<p><span class="dashicons dashicons-info"></span> وظیفه در پس‌زمینه با Action Scheduler/WP-Cron اجرا می‌شود.</p>
				</div>
			</div>
		</div>
		<?php
	}

	/* ─────────────────────── Price Processing ─────────────────────── */

	/**
	 * Count total products matching filters.
	 */
	private function count_products( $cat_slugs ) {
		$args = array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'fields'         => 'ids',
			'posts_per_page' => -1,
			'no_found_rows'  => true,
		);
		if ( ! empty( $cat_slugs ) ) {
			$args['tax_query'] = array(
				array(
					'taxonomy' => 'product_cat',
					'field'    => 'slug',
					'terms'    => array_filter( array_map( 'trim', explode( ',', $cat_slugs ) ) ),
				),
			);
		}
		$q = new WP_Query( $args );
		return intval( $q->post_count );
	}

	/**
	 * Process a single batch of products for bulk bump.
	 */
	private function process_batch( $params, $paged ) {
		$taxq = array();
		if ( ! empty( $params['cats'] ) ) {
			$taxq[] = array(
				'taxonomy' => 'product_cat',
				'field'    => 'slug',
				'terms'    => array_filter( array_map( 'trim', explode( ',', $params['cats'] ) ) ),
			);
		}
		$q = new WP_Query( array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'fields'         => 'ids',
			'posts_per_page' => self::PER_PAGE,
			'paged'          => $paged,
			'tax_query'      => $taxq,
			'orderby'        => 'ID',
			'order'          => 'ASC',
		) );

		$updated = 0;
		$skipped = 0;
		$d       = function_exists( 'wc_get_price_decimals' ) ? wc_get_price_decimals() : 2;
		$rows    = array();

		foreach ( $q->posts as $pid ) {
			$product = wc_get_product( $pid );
			if ( ! $product ) {
				$skipped++;
				continue;
			}
			try {
				if ( $product->is_type( 'variable' ) ) {
					$children = $product->get_children();
					foreach ( $children as $vid ) {
						$v = wc_get_product( $vid );
						if ( ! $v ) {
							$skipped++;
							continue;
						}
						$reg_old  = $v->get_regular_price( 'edit' );
						$sale_old = $v->get_sale_price( 'edit' );
						list( $reg_new, $msg_r ) = $this->apply_adjustment( $reg_old, $params, $d );
						if ( '' !== $reg_old ) {
							$v->set_regular_price( $reg_new );
						}
						$sale_new = $sale_old;
						$msg_s    = '';
						if ( ! empty( $params['apply_sale'] ) ) {
							list( $sale_new, $msg_s ) = $this->apply_adjustment( $sale_old, $params, $d );
							if ( '' !== $sale_old ) {
								$v->set_sale_price( $sale_new );
							}
						}
						if ( '' !== $sale_new && is_numeric( $sale_new ) && (float) $sale_new >= 0 && (float) $reg_new > 0 && (float) $sale_new < (float) $reg_new ) {
							$v->set_price( $sale_new );
						} else {
							$v->set_price( $reg_new );
						}
						$v->save();
						wc_delete_product_transients( $v->get_id() );
						$updated++;
						$rows[] = $this->row( time(), $paged, 'variation', $vid, $pid, $reg_old, $reg_new, $sale_old, $sale_new, 'ok', trim( $msg_r . ( $msg_s ? ' | ' . $msg_s : '' ) ) );
					}
					if ( class_exists( 'WC_Product_Variable' ) ) {
						WC_Product_Variable::sync( $product, false );
					}
					$product->save();
					wc_delete_product_transients( $product->get_id() );
				} elseif ( $product->is_type( 'simple' ) ) {
					$reg_old  = $product->get_regular_price( 'edit' );
					$sale_old = $product->get_sale_price( 'edit' );
					list( $reg_new, $msg_r ) = $this->apply_adjustment( $reg_old, $params, $d );
					if ( '' !== $reg_old ) {
						$product->set_regular_price( $reg_new );
					}
					$sale_new = $sale_old;
					$msg_s    = '';
					if ( ! empty( $params['apply_sale'] ) ) {
						list( $sale_new, $msg_s ) = $this->apply_adjustment( $sale_old, $params, $d );
						if ( '' !== $sale_old ) {
							$product->set_sale_price( $sale_new );
						}
					}
					if ( '' !== $sale_new && is_numeric( $sale_new ) && (float) $sale_new >= 0 && (float) $reg_new > 0 && (float) $sale_new < (float) $reg_new ) {
						$product->set_price( $sale_new );
					} else {
						$product->set_price( $reg_new );
					}
					$product->save();
					wc_delete_product_transients( $product->get_id() );
					$updated++;
					$rows[] = $this->row( time(), $paged, 'product', $pid, '', $reg_old, $reg_new, $sale_old, $sale_new, 'ok', trim( $msg_r . ( $msg_s ? ' | ' . $msg_s : '' ) ) );
				} else {
					$skipped++;
					$rows[] = $this->row( time(), $paged, 'product', $pid, '', '', '', '', '', 'skipped', 'unsupported_type: ' . $product->get_type() );
				}
			} catch ( \Throwable $e ) {
				$skipped++;
				$rows[] = $this->row( time(), $paged, 'product', $pid, '', '', '', '', '', 'error', $e->getMessage() );
			}
		}

		if ( ! empty( $rows ) ) {
			$run_id = isset( $params['run_id'] ) ? $params['run_id'] : '';
			$this->log_rows( $run_id, $rows );
		}
		$finished = ( $q->post_count < self::PER_PAGE );
		return compact( 'finished', 'updated', 'skipped' );
	}

	/**
	 * Apply a price adjustment (fixed/percent, range rules, rounding).
	 */
	private function apply_adjustment( $old, $params, $decimals ) {
		if ( '' === $old || null === $old ) {
			return array( '', 'empty-price' );
		}
		$oldf      = (float) $old;
		$final_new = 0;
		$msg       = '';
		$base_new  = $oldf;

		if ( ! ( 'fixed' === $params['type'] && 0.0 === (float) $params['value'] ) ) {
			if ( 'percent' === $params['type'] ) {
				$base_new = $oldf * ( 1 + ( (float) $params['value'] / 100 ) );
			} else {
				$base_new = $oldf + (float) $params['value'];
			}
		}

		$base_msg     = 'base:' . $params['type'] . '=' . $params['value'];
		$rules        = $this->parse_rules( $params['rules'] ?? '' );
		$rule_applied = null;

		foreach ( $rules as $r ) {
			if ( $oldf >= $r['min'] && $oldf <= $r['max'] ) {
				$rule_applied = $r;
				break;
			}
		}

		if ( $rule_applied ) {
			$ref       = ( 'combine' === ( $params['rules_mode'] ?? 'override' ) ) ? $base_new : $oldf;
			$final_new = $rule_applied['percent'] ? $ref * ( 1 + ( $rule_applied['delta'] / 100.0 ) ) : $ref + $rule_applied['delta'];
			$msg       = 'rule:' . $rule_applied['raw'] . ' (' . ( $params['rules_mode'] ?? 'override' ) . ')';
		} else {
			$final_new = $base_new;
			$msg       = $base_msg;
		}

		if ( ! empty( $params['enable_rounding'] ) ) {
			$threshold = (float) ( $params['rounding_threshold'] ?? 50000 );
			$value     = (int) ( $params['rounding_value'] ?? 1000 );
			if ( $value > 0 && $final_new > 0 && $final_new < $threshold ) {
				$rounded_price = ceil( $final_new / $value ) * $value;
				if ( $rounded_price != $final_new ) {
					$final_new = $rounded_price;
					$msg      .= ' | rounded';
				}
			}
		}

		if ( $final_new < 0 ) {
			$final_new = 0;
		}
		$final_new = number_format( (float) $final_new, $decimals, '.', '' );
		return array( $final_new, $msg );
	}

	/**
	 * Convert Farsi/Arabic digits to English.
	 */
	private function fa_to_en( $s ) {
		$find = array( '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '،', ',', ' ' );
		$repl = array( '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '', '', '', '' );
		return str_replace( $find, $repl, (string) $s );
	}

	/**
	 * Convert to float with Farsi digit support.
	 */
	private function to_float( $s ) {
		$s = $this->fa_to_en( $s );
		$s = str_replace( '%', '', $s );
		return (float) $s;
	}

	/**
	 * Parse range rules from textarea.
	 */
	private function parse_rules( $rules_str ) {
		$rules = array();
		if ( ! $rules_str ) {
			return $rules;
		}
		$lines = preg_split( '/\r\n|\r|\n/', $rules_str );
		foreach ( $lines as $line ) {
			$line = trim( $line );
			if ( '' === $line || ( isset( $line[0] ) && '#' === $line[0] ) ) {
				continue;
			}
			if ( false === strpos( $line, ':' ) ) {
				continue;
			}
			list( $range, $deltaRaw ) = array_map( 'trim', explode( ':', $line, 2 ) );
			$tag = '';
			if ( false !== strpos( $deltaRaw, '#' ) ) {
				list( $deltaRaw, $tag ) = array_map( 'trim', explode( '#', $deltaRaw, 2 ) );
			}
			$parts = preg_split( '/\s*-\s*/', $range );
			if ( 2 !== count( $parts ) ) {
				continue;
			}
			$min = $this->to_float( $parts[0] );
			$max = $this->to_float( $parts[1] );
			if ( $max < $min ) {
				$tmp = $min;
				$min = $max;
				$max = $tmp;
			}
			$dtrim      = trim( $deltaRaw );
			$is_percent = ( '%' === substr( $dtrim, -1 ) );
			$delta      = $this->to_float( $dtrim );
			$rules[]    = array(
				'min'     => $min,
				'max'     => $max,
				'percent' => $is_percent,
				'delta'   => $delta,
				'raw'     => $line,
				'tag'     => $tag,
			);
		}
		return $rules;
	}

	/* ─────────────────────── Logging ─────────────────────── */

	/**
	 * Get uploads base directory.
	 */
	private function uploads_base() {
		$u = wp_upload_dir();
		return array(
			'dir' => trailingslashit( $u['basedir'] ) . self::LOG_DIR . '/',
			'url' => trailingslashit( $u['baseurl'] ) . self::LOG_DIR . '/',
		);
	}

	/**
	 * Initialize bump log file.
	 */
	private function init_log( $run_id ) {
		$b = $this->uploads_base();
		if ( ! wp_mkdir_p( $b['dir'] ) ) {
			return;
		}
		$path = $this->log_path( $run_id );
		if ( ! file_exists( $path ) ) {
			$header = "timestamp,page,entity,id,parent_id,regular_old,regular_new,sale_old,sale_new,status,message\n";
			file_put_contents( $path, $header, LOCK_EX );
			update_option( self::LASTLOG_KEY, array(
				'run' => $run_id,
				'url' => $this->log_url( $run_id ),
			), false );
		}
	}

	/**
	 * Initialize import log file.
	 */
	private function init_import_log( $run_id ) {
		$b = $this->uploads_base();
		if ( ! wp_mkdir_p( $b['dir'] ) ) {
			return;
		}
		$path = $this->log_path( $run_id, 'import-log-' );
		if ( ! file_exists( $path ) ) {
			$header = "timestamp,product_id,status,regular_price_before,regular_price_from_csv,message\n";
			file_put_contents( $path, $header, LOCK_EX );
		}
	}

	/**
	 * Build a single CSV row for bump log.
	 */
	private function row( $ts, $page, $entity, $id, $parent_id, $reg_old, $reg_new, $sale_old, $sale_new, $status, $message ) {
		$csv = array(
			(string) $ts,
			(string) $page,
			(string) $entity,
			(string) $id,
			(string) $parent_id,
			( null === $reg_old ? '' : (string) $reg_old ),
			( null === $reg_new ? '' : (string) $reg_new ),
			( null === $sale_old ? '' : (string) $sale_old ),
			( null === $sale_new ? '' : (string) $sale_new ),
			(string) $status,
			str_replace( array( "\n", "\r", '"' ), array( ' ', ' ', "'" ), (string) $message ),
		);
		$fh = fopen( 'php://temp', 'r+' );
		fputcsv( $fh, $csv );
		rewind( $fh );
		$line = stream_get_contents( $fh );
		fclose( $fh );
		return $line;
	}

	/**
	 * Build a single CSV row for import log.
	 */
	private function row_import( $id, $status, $reg_old, $reg_new, $message ) {
		$csv = array(
			(string) time(),
			(string) $id,
			(string) $status,
			(string) $reg_old,
			(string) $reg_new,
			str_replace( array( "\n", "\r", '"' ), array( ' ', ' ', "'" ), (string) $message ),
		);
		$fh = fopen( 'php://temp', 'r+' );
		fputcsv( $fh, $csv );
		rewind( $fh );
		$line = stream_get_contents( $fh );
		fclose( $fh );
		return $line;
	}

	/**
	 * Append log rows to file.
	 */
	private function log_rows( $run_id, $rows, $prefix = 'bpc-' ) {
		if ( empty( $rows ) ) {
			return;
		}
		$path = $this->log_path( $run_id, $prefix );
		if ( file_exists( $path ) && is_writable( $path ) ) {
			file_put_contents( $path, implode( '', $rows ), FILE_APPEND | LOCK_EX );
		}
	}

	/**
	 * Get full path for log file.
	 */
	private function log_path( $run_id, $prefix = 'bpc-' ) {
		$base = $this->uploads_base();
		return $base['dir'] . $prefix . sanitize_file_name( $run_id ) . '.csv';
	}

	/**
	 * Get URL for log file.
	 */
	private function log_url( $run_id, $prefix = 'bpc-' ) {
		$base = $this->uploads_base();
		return $base['url'] . $prefix . sanitize_file_name( $run_id ) . '.csv';
	}
}
