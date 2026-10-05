<?php
/**
 * Reference price sync orchestrator (fetch, apply, cron, AJAX).
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Class WFCP_Reference_Sync
 */
class WFCP_Reference_Sync {

	const CRON_HOOK   = 'wfcp_sync_reference_prices';
	const AS_BATCH    = 'wfcp_reference_sync_batch';
	const BATCH_SIZE  = 30;
	const META_URL    = '_wfcp_reference_url';
	const META_SOURCE = '_wfcp_reference_source';
	const META_SYNC   = '_wfcp_reference_last_sync';

	/**
	 * Init hooks.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'maybe_schedule_cron' ), 25 );
		add_action( self::CRON_HOOK, array( __CLASS__, 'cron_enqueue_all' ) );
		add_action( self::AS_BATCH, array( __CLASS__, 'process_batch' ), 10, 1 );

		add_action( 'wp_ajax_wfcp_fetch_reference', array( __CLASS__, 'ajax_fetch_one' ) );
		add_action( 'wp_ajax_wfcp_sync_all_references', array( __CLASS__, 'ajax_sync_all' ) );

		add_action( 'wfcp_reference_settings_saved', array( __CLASS__, 'maybe_schedule_cron' ) );
	}

	/**
	 * Load dependencies.
	 */
	public static function load_dependencies() {
		$dir = WFCP_PLUGIN_DIR . 'includes/services/reference/';
		require_once $dir . 'class-wfcp-reference-http.php';
		require_once $dir . 'class-wfcp-reference-currency.php';
		require_once $dir . 'class-wfcp-reference-adapter.php';
		require_once $dir . 'adapters/class-wfcp-adapter-woocommerce.php';
		require_once $dir . 'adapters/class-wfcp-adapter-digikala.php';
		require_once $dir . 'adapters/class-wfcp-adapter-technolife.php';
		require_once $dir . 'adapters/class-wfcp-adapter-basalam.php';
	}

	/**
	 * Registered adapters.
	 *
	 * @return WFCP_Reference_Adapter[]
	 */
	public static function get_adapters() {
		static $adapters = null;
		if ( null === $adapters ) {
			self::load_dependencies();
			$adapters = array(
				new WFCP_Adapter_Digikala(),
				new WFCP_Adapter_Technolife(),
				new WFCP_Adapter_Basalam(),
				new WFCP_Adapter_WooCommerce(),
			);
			/**
			 * Filter reference adapters.
			 *
			 * @param WFCP_Reference_Adapter[] $adapters Adapters.
			 */
			$adapters = apply_filters( 'wfcp_reference_adapters', $adapters );
		}
		return $adapters;
	}

	/**
	 * Resolve adapter for URL.
	 *
	 * @param string $url URL.
	 * @return WFCP_Reference_Adapter|null
	 */
	public static function resolve_adapter( $url ) {
		foreach ( self::get_adapters() as $adapter ) {
			if ( $adapter->can_handle( $url ) ) {
				return $adapter;
			}
		}
		return null;
	}

	/**
	 * Whether module is enabled.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		$settings = WFCP_Helper::get_settings( 'reference' );
		return is_array( $settings ) && ! empty( $settings['enabled'] );
	}

	/**
	 * Schedule / clear WP-Cron.
	 */
	public static function maybe_schedule_cron() {
		$settings = WFCP_Helper::get_settings( 'reference' );
		if ( ! is_array( $settings ) || empty( $settings['enabled'] ) ) {
			wp_clear_scheduled_hook( self::CRON_HOOK );
			delete_option( 'wfcp_reference_cron_interval' );
			return;
		}
		$interval = isset( $settings['cron_interval'] ) ? $settings['cron_interval'] : 'daily';
		if ( ! in_array( $interval, array( 'hourly', 'twicedaily', 'daily' ), true ) ) {
			$interval = 'daily';
		}

		$stored = get_option( 'wfcp_reference_cron_interval', '' );
		$next   = wp_next_scheduled( self::CRON_HOOK );

		if ( $next && $stored === $interval ) {
			return;
		}

		wp_clear_scheduled_hook( self::CRON_HOOK );
		wp_schedule_event( time() + MINUTE_IN_SECONDS, $interval, self::CRON_HOOK );
		update_option( 'wfcp_reference_cron_interval', $interval, false );
	}

	/**
	 * Cron: enqueue all products with reference URLs.
	 */
	public static function cron_enqueue_all() {
		if ( ! self::is_enabled() ) {
			return;
		}
		self::enqueue_all( 'cron' );
	}

	/**
	 * Collect product/variation IDs that have a reference URL.
	 *
	 * @return int[]
	 */
	public static function get_synced_ids() {
		global $wpdb;
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value <> ''",
				self::META_URL
			)
		);
		$ids = array_map( 'intval', (array) $ids );
		$ids = array_values( array_filter( $ids ) );
		return $ids;
	}

	/**
	 * Enqueue batch jobs for all reference URLs.
	 *
	 * @param string $trigger Trigger label.
	 * @return array{queued:int,batches:int}
	 */
	public static function enqueue_all( $trigger = 'manual' ) {
		$ids = self::get_synced_ids();
		if ( empty( $ids ) ) {
			update_option(
				'wfcp_reference_last_run',
				array(
					'at'      => current_time( 'mysql' ),
					'success' => 0,
					'failed'  => 0,
					'skipped' => 0,
					'message' => __( 'هیچ محصولی با لینک مرجع یافت نشد', 'webina-woo-core' ),
					'trigger' => $trigger,
				),
				false
			);
			return array( 'queued' => 0, 'batches' => 0 );
		}

		$chunks  = array_chunk( $ids, self::BATCH_SIZE );
		$batches = 0;
		$delay   = 0;
		foreach ( $chunks as $chunk ) {
			self::schedule_batch( $chunk, $delay );
			++$batches;
			$delay += 5;
		}

		update_option(
			'wfcp_reference_last_run',
			array(
				'at'      => current_time( 'mysql' ),
				'success' => 0,
				'failed'  => 0,
				'skipped' => 0,
				'message' => sprintf(
					/* translators: 1: products 2: batches 3: trigger */
					__( 'صف همگام‌سازی: %1$d محصول در %2$d بچ (%3$s)', 'webina-woo-core' ),
					count( $ids ),
					$batches,
					$trigger
				),
				'trigger' => $trigger,
			),
			false
		);

		return array( 'queued' => count( $ids ), 'batches' => $batches );
	}

	/**
	 * Schedule a batch via Action Scheduler or WP-Cron fallback.
	 *
	 * @param int[] $ids   Product IDs.
	 * @param int   $delay Delay seconds.
	 */
	private static function schedule_batch( $ids, $delay = 0 ) {
		$ids = array_values( array_map( 'intval', $ids ) );
		if ( function_exists( 'as_schedule_single_action' ) ) {
			as_schedule_single_action( time() + max( 0, (int) $delay ), self::AS_BATCH, array( $ids ), 'wfcp-reference' );
			return;
		}
		wp_schedule_single_event( time() + max( 0, (int) $delay ), self::AS_BATCH, array( $ids ) );
	}

	/**
	 * Process a batch of IDs.
	 *
	 * @param int[] $ids IDs.
	 */
	public static function process_batch( $ids ) {
		if ( ! self::is_enabled() ) {
			return;
		}
		$ids = array_values( array_map( 'intval', (array) $ids ) );
		$settings = WFCP_Helper::get_settings( 'reference' );
		$delay    = isset( $settings['request_delay'] ) ? max( 0, (int) $settings['request_delay'] ) : 2;

		$success = 0;
		$failed  = 0;
		$skipped = 0;

		foreach ( $ids as $i => $product_id ) {
			if ( $i > 0 && $delay > 0 ) {
				sleep( min( 5, $delay ) );
			}
			$result = self::sync_product( $product_id );
			if ( is_wp_error( $result ) ) {
				$code = $result->get_error_code();
				if ( in_array( $code, array( 'wfcp_ref_disabled', 'wfcp_ref_no_url', 'wfcp_ref_locked' ), true ) ) {
					++$skipped;
				} else {
					++$failed;
				}
			} else {
				++$success;
			}
		}

		$prev = get_option( 'wfcp_reference_last_run', array() );
		if ( ! is_array( $prev ) ) {
			$prev = array();
		}
		update_option(
			'wfcp_reference_last_run',
			array(
				'at'      => current_time( 'mysql' ),
				'success' => (int) ( $prev['success'] ?? 0 ) + $success,
				'failed'  => (int) ( $prev['failed'] ?? 0 ) + $failed,
				'skipped' => (int) ( $prev['skipped'] ?? 0 ) + $skipped,
				'message' => sprintf(
					/* translators: 1: success 2: failed 3: skipped */
					__( 'بچ پردازش شد — موفق: %1$d، ناموفق: %2$d، رد شده: %3$d', 'webina-woo-core' ),
					$success,
					$failed,
					$skipped
				),
				'trigger' => $prev['trigger'] ?? 'batch',
			),
			false
		);
	}

	/**
	 * Sync a single product/variation by stored URL (or override).
	 *
	 * @param int         $product_id Product or variation ID.
	 * @param string|null $url_override Optional URL.
	 * @return array|WP_Error Result data.
	 */
	public static function sync_product( $product_id, $url_override = null ) {
		if ( ! self::is_enabled() ) {
			return new WP_Error( 'wfcp_ref_disabled', __( 'ماژول سایت‌های مرجع غیرفعال است', 'webina-woo-core' ) );
		}

		$product_id = (int) $product_id;
		$product    = wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'wfcp_ref_product', __( 'محصول یافت نشد', 'webina-woo-core' ) );
		}

		$url = $url_override ? esc_url_raw( $url_override ) : (string) get_post_meta( $product_id, self::META_URL, true );
		$url = trim( $url );
		if ( '' === $url ) {
			return new WP_Error( 'wfcp_ref_no_url', __( 'لینک مرجع تنظیم نشده است', 'webina-woo-core' ) );
		}

		$adapter = self::resolve_adapter( $url );
		if ( ! $adapter ) {
			$err = new WP_Error( 'wfcp_ref_adapter', __( 'منبع این لینک پشتیبانی نمی‌شود یا در تنظیمات غیرفعال است', 'webina-woo-core' ) );
			self::store_sync_meta( $product_id, null, $err );
			return $err;
		}

		$context = self::build_context( $product, $url );
		$data    = $adapter->fetch( $url, $context );
		if ( is_wp_error( $data ) ) {
			self::store_sync_meta( $product_id, null, $data );
			return $data;
		}

		$applied = self::apply_result( $product, $data );
		if ( is_wp_error( $applied ) ) {
			self::store_sync_meta( $product_id, $data, $applied );
			return $applied;
		}

		update_post_meta( $product_id, self::META_URL, $url );
		update_post_meta( $product_id, self::META_SOURCE, isset( $data['source'] ) ? sanitize_key( $data['source'] ) : $adapter->get_slug() );
		self::store_sync_meta( $product_id, array_merge( $data, $applied ), null );

		return array_merge( $data, $applied );
	}

	/**
	 * Build fetch context from local product.
	 *
	 * @param WC_Product $product Product.
	 * @param string     $url     URL.
	 * @return array
	 */
	private static function build_context( $product, $url ) {
		$context = array();
		if ( $product->is_type( 'variation' ) ) {
			$attrs = $product->get_variation_attributes();
			if ( is_array( $attrs ) ) {
				$normalized = array();
				foreach ( $attrs as $k => $v ) {
					$key = ( 0 === strpos( $k, 'attribute_' ) ) ? $k : 'attribute_' . $k;
					$normalized[ $key ] = $v;
				}
				$context['variation_attributes'] = $normalized;
			}
		}
		return $context;
	}

	/**
	 * Apply fetched data to product.
	 *
	 * @param WC_Product $product Product.
	 * @param array      $data    Adapter result.
	 * @return array|WP_Error Applied fields.
	 */
	public static function apply_result( $product, $data ) {
		$settings = WFCP_Helper::get_settings( 'reference' );
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		$product_id   = $product->get_id();
		$parent_id    = $product->get_parent_id();
		$price_locked = WFCP_Helper::is_product_price_locked( $product_id )
			|| ( $parent_id && WFCP_Helper::is_product_price_locked( $parent_id ) );

		$sync_stock = ! isset( $settings['sync_stock'] ) || ! empty( $settings['sync_stock'] );
		$stock_when_locked = ! empty( $settings['sync_stock_when_locked'] );

		$out = array(
			'purchase_price' => null,
			'stock_updated'  => false,
			'price_updated'  => false,
			'skipped_price'  => false,
		);

		$raw_price = isset( $data['price'] ) ? $data['price'] : null;
		$unit      = isset( $data['price_unit'] ) ? $data['price_unit'] : 'toman';

		if ( $raw_price && floatval( $raw_price ) > 0 ) {
			if ( $price_locked ) {
				$out['skipped_price'] = true;
			} else {
				$purchase = WFCP_Reference_Currency::to_purchase_price( floatval( $raw_price ), $unit );
				if ( $purchase > 0 ) {
					$product->update_meta_data( '_wfcp_purchase_price', $purchase );
					$product->save();

					$calc_id      = $parent_id > 0 ? $parent_id : $product_id;
					$retail_price = WFCP_Calculator::calculate_price( $purchase, 'retail', $calc_id );

					if ( ! WFCP_Helper::is_product_price_locked( $product_id )
						&& ! ( $parent_id && WFCP_Helper::is_product_price_locked( $parent_id ) ) ) {
						$types = array( 'simple', 'external', 'variation' );
						if ( in_array( $product->get_type(), $types, true ) ) {
							$product->set_regular_price( wc_format_decimal( $retail_price ) );
							$product->set_price( wc_format_decimal( $retail_price ) );
							$product->save();
						}
					}

					wc_delete_product_transients( $product_id );
					if ( $parent_id > 0 ) {
						wc_delete_product_transients( $parent_id );
					}

					/**
					 * After purchase price update.
					 *
					 * @param int   $product_id Product ID.
					 * @param float $purchase   Purchase price.
					 */
					do_action( 'wfcp_after_product_price_update', $product_id, $purchase );

					$out['purchase_price'] = $purchase;
					$out['price_updated']  = true;
					$out['retail_price']   = $retail_price;
				}
			}
		} elseif ( $price_locked ) {
			$out['skipped_price'] = true;
		}

		// Stock.
		$can_stock = $sync_stock && ( ! $price_locked || $stock_when_locked );
		if ( $can_stock ) {
			$stock_qty = array_key_exists( 'stock_qty', $data ) ? $data['stock_qty'] : null;
			$in_stock  = array_key_exists( 'in_stock', $data ) ? $data['in_stock'] : null;

			if ( null !== $stock_qty && '' !== $stock_qty && is_numeric( $stock_qty ) ) {
				$qty = max( 0, (int) $stock_qty );
				$product->set_manage_stock( true );
				$product->set_stock_quantity( $qty );
				$product->set_stock_status( $qty > 0 ? 'instock' : 'outofstock' );
				$product->save();
				$out['stock_updated'] = true;
				$out['stock_qty']     = $qty;
			} elseif ( null !== $in_stock ) {
				$product->set_stock_status( $in_stock ? 'instock' : 'outofstock' );
				$product->save();
				$out['stock_updated'] = true;
				$out['in_stock']      = (bool) $in_stock;
			}
		}

		if ( ! $out['price_updated'] && ! $out['stock_updated'] && ! $out['skipped_price']
			&& ( ! $raw_price || floatval( $raw_price ) <= 0 )
			&& ( ! array_key_exists( 'in_stock', $data ) || null === $data['in_stock'] ) ) {
			return new WP_Error( 'wfcp_ref_empty', __( 'قیمت یا موجودی از سایت مرجع استخراج نشد', 'webina-woo-core' ) );
		}

		// Locked with no stock update allowed and no stock change → soft skip.
		if ( $out['skipped_price'] && ! $out['stock_updated'] && $price_locked ) {
			return new WP_Error( 'wfcp_ref_locked', __( 'قیمت محصول قفل است؛ به‌روزرسانی انجام نشد', 'webina-woo-core' ) );
		}

		return $out;
	}

	/**
	 * Persist last sync meta.
	 *
	 * @param int             $product_id Product ID.
	 * @param array|null      $data       Data.
	 * @param WP_Error|null   $error      Error.
	 */
	private static function store_sync_meta( $product_id, $data, $error ) {
		$meta = array(
			'at'    => current_time( 'mysql' ),
			'price' => null,
			'stock' => null,
			'error' => '',
		);
		if ( $error instanceof WP_Error ) {
			$meta['error'] = $error->get_error_message();
		}
		if ( is_array( $data ) ) {
			if ( isset( $data['purchase_price'] ) ) {
				$meta['price'] = $data['purchase_price'];
			} elseif ( isset( $data['price'] ) ) {
				$meta['price'] = $data['price'];
			}
			if ( isset( $data['stock_qty'] ) ) {
				$meta['stock'] = $data['stock_qty'];
			} elseif ( isset( $data['in_stock'] ) ) {
				$meta['stock'] = $data['in_stock'] ? 'instock' : 'outofstock';
			}
			if ( ! empty( $data['message'] ) && empty( $meta['error'] ) ) {
				$meta['message'] = $data['message'];
			}
			if ( ! empty( $data['source'] ) ) {
				$meta['source'] = $data['source'];
			}
		}
		update_post_meta( $product_id, self::META_SYNC, $meta );
	}

	/**
	 * AJAX: fetch one product.
	 */
	public static function ajax_fetch_one() {
		check_ajax_referer( 'wfcp_reference_nonce', 'nonce' );
		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		$url        = isset( $_POST['url'] ) ? esc_url_raw( wp_unslash( $_POST['url'] ) ) : '';

		if ( ! $product_id ) {
			wp_send_json_error( array( 'message' => __( 'شناسه محصول نامعتبر است', 'webina-woo-core' ) ) );
		}

		if ( $url ) {
			update_post_meta( $product_id, self::META_URL, $url );
		}

		$result = self::sync_product( $product_id, $url ? $url : null );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}

		$purchase = WFCP_Helper::get_product_purchase_price( $product_id );
		$retail   = $purchase ? WFCP_Calculator::calculate_price( $purchase, 'retail', $product_id ) : 0;

		wp_send_json_success(
			array(
				'message'        => __( 'همگام‌سازی با موفقیت انجام شد', 'webina-woo-core' ),
				'purchase_price' => $purchase,
				'retail_price'   => $retail ? WFCP_Helper::format_price_with_irt_symbol( $retail ) : '—',
				'data'           => $result,
				'last_sync'      => get_post_meta( $product_id, self::META_SYNC, true ),
			)
		);
	}

	/**
	 * AJAX: enqueue all.
	 */
	public static function ajax_sync_all() {
		check_ajax_referer( 'wfcp_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}
		if ( ! self::is_enabled() ) {
			wp_send_json_error( array( 'message' => __( 'ماژول سایت‌های مرجع را فعال کنید', 'webina-woo-core' ) ) );
		}
		$stats = self::enqueue_all( 'manual' );
		wp_send_json_success(
			array(
				'message' => sprintf(
					/* translators: 1: queued 2: batches */
					__( '%1$d محصول در %2$d بچ به صف اضافه شد', 'webina-woo-core' ),
					$stats['queued'],
					$stats['batches']
				),
				'stats'   => $stats,
			)
		);
	}
}
