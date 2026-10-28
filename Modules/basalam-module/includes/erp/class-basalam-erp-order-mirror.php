<?php
/**
 * Mirror Basalam orders to WebinoERP (contract §2: POST /api/webinocrm/v1/crm/basalam/orders).
 *
 * Non-blocking by design: callers only enqueue an order id; a cron event flushes the queue
 * in batches (≤200), with exponential backoff. Any failure is logged and retried — it never
 * throws into checkout, webhooks or dashboard requests. Request signing (Site-Auth HMAC) is
 * added automatically by Webino_Dashboard_Site_Auth::sign_request for ERP Edge paths.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_Basalam_Erp_Order_Mirror {
	const QUEUE_OPTION    = 'webino_basalam_erp_queue';
	const BACKFILL_OPTION = 'webino_basalam_erp_backfilled';
	const LAST_OPTION     = 'webino_basalam_erp_last_result';
	const CRON_HOOK       = 'webino_basalam_erp_flush';
	const LOCK            = 'webino_basalam_erp_flush_lock';
	const PATH            = '/api/webinocrm/v1/crm/basalam/orders';
	const BATCH           = 200;
	const MAX_ATTEMPTS    = 12;
	// Hard cap so a long ERP outage cannot grow the (non-autoloaded) option without bound.
	const MAX_QUEUE       = 5000;

	/** Basalam status ids by our Woo status slug (contract status mapping). */
	const STATUS_IDS = array(
		'bslm-wait-vendor' => 3739,
		'bslm-preparation' => 3237,
		'bslm-shipping'    => 3238,
		'bslm-completed'   => 3195,
		'bslm-rejected'    => 3067,
	);

	public static function init() {
		add_action( self::CRON_HOOK, array( __CLASS__, 'flush' ) );
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'on_status_changed' ), 20, 1 );
		add_action( 'webino_basalam_process_jobs', array( __CLASS__, 'maybe_backfill' ), 30 );
	}

	/**
	 * @param int $order_id Order id.
	 */
	public static function on_status_changed( $order_id ) {
		try {
			$order = wc_get_order( $order_id );
			if ( $order && self::is_basalam_order( $order ) ) {
				self::enqueue( (int) $order_id );
			}
		} catch ( \Throwable $e ) {
			self::log( 'enqueue on status change failed: ' . $e->getMessage() );
		}
	}

	/**
	 * @param \WC_Order $order Order.
	 * @return bool
	 */
	private static function is_basalam_order( $order ) {
		return (bool) ( $order->get_meta( '_is_sync_basalam_order' ) || $order->get_meta( '_basalam_invoice_id' ) );
	}

	/**
	 * Queue one order (dedup by order id). Never throws.
	 *
	 * @param int $order_id Order id.
	 */
	public static function enqueue( $order_id ) {
		try {
			$order_id = absint( $order_id );
			if ( $order_id < 1 ) {
				return;
			}
			$q = get_option( self::QUEUE_OPTION, array() );
			$q = is_array( $q ) ? $q : array();
			// Reset attempts: the newest state should be sent soon.
			unset( $q[ $order_id ] ); // Re-append so insertion order = recency.
			$q[ $order_id ] = array( 'attempts' => 0, 'next' => time() );
			if ( count( $q ) > self::MAX_QUEUE ) {
				$drop = count( $q ) - self::MAX_QUEUE;
				self::log( "queue over cap, dropping {$drop} oldest entries (backfill/reconcile will resend)" );
				$q = array_slice( $q, $drop, null, true );
			}
			update_option( self::QUEUE_OPTION, $q, false );
			if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
				wp_schedule_single_event( time() + 15, self::CRON_HOOK );
			}
		} catch ( \Throwable $e ) {
			self::log( 'enqueue failed: ' . $e->getMessage() );
		}
	}

	/**
	 * One-time initial backfill of existing Basalam orders (contract: push on initial backfill).
	 */
	public static function maybe_backfill() {
		if ( get_option( self::BACKFILL_OPTION ) || ! function_exists( 'wc_get_orders' ) ) {
			return;
		}
		update_option( self::BACKFILL_OPTION, time(), false );
		try {
			$ids = wc_get_orders(
				array(
					'limit'      => 2000,
					'return'     => 'ids',
					'type'       => 'shop_order',
					'meta_key'   => '_is_sync_basalam_order', // phpcs:ignore WordPress.DB.SlowDBQuery
					'meta_value' => '1', // phpcs:ignore WordPress.DB.SlowDBQuery
				)
			);
			foreach ( (array) $ids as $id ) {
				self::enqueue( (int) $id );
			}
		} catch ( \Throwable $e ) {
			self::log( 'backfill failed: ' . $e->getMessage() );
		}
	}

	/**
	 * Cron: send due orders in batches.
	 */
	public static function flush() {
		if ( get_transient( self::LOCK ) ) {
			return;
		}
		set_transient( self::LOCK, 1, 120 );
		try {
			$q = get_option( self::QUEUE_OPTION, array() );
			$q = is_array( $q ) ? $q : array();
			$now = time();
			$due = array();
			foreach ( $q as $oid => $meta ) {
				if ( (int) ( $meta['next'] ?? 0 ) <= $now ) {
					$due[] = (int) $oid;
				}
				if ( count( $due ) >= self::BATCH ) {
					break;
				}
			}

			if ( $due ) {
				$orders = array();
				$sent   = array();
				foreach ( $due as $oid ) {
					$row = self::build_order( $oid );
					if ( null === $row ) {
						unset( $q[ $oid ] ); // Deleted / not Basalam: nothing to mirror.
						continue;
					}
					$orders[] = $row;
					$sent[]   = $oid;
				}

				if ( $orders ) {
					$result = self::post( $orders );
					update_option( self::LAST_OPTION, array( 'at' => $now, 'ok' => true === $result, 'count' => count( $orders ), 'error' => true === $result ? '' : (string) $result ), false );
					foreach ( $sent as $oid ) {
						if ( true === $result ) {
							unset( $q[ $oid ] );
							continue;
						}
						$attempts = (int) ( $q[ $oid ]['attempts'] ?? 0 ) + 1;
						if ( $attempts >= self::MAX_ATTEMPTS ) {
							self::log( "order {$oid} dropped after {$attempts} attempts: {$result}" );
							unset( $q[ $oid ] );
							continue;
						}
						$q[ $oid ] = array( 'attempts' => $attempts, 'next' => $now + min( 6 * HOUR_IN_SECONDS, 60 * ( 2 ** $attempts ) ) );
					}
					if ( true !== $result ) {
						self::log( 'ERP mirror failed: ' . $result );
					}
				}
				update_option( self::QUEUE_OPTION, $q, false );
			}

			if ( $q && ! wp_next_scheduled( self::CRON_HOOK ) ) {
				$next = min( array_map( static function ( $m ) { return (int) ( $m['next'] ?? 0 ); }, $q ) );
				wp_schedule_single_event( max( time() + 15, $next ), self::CRON_HOOK );
			}
		} catch ( \Throwable $e ) {
			self::log( 'flush crashed: ' . $e->getMessage() );
		} finally {
			delete_transient( self::LOCK );
		}
	}

	/**
	 * @param array<int,array<string,mixed>> $orders Orders.
	 * @return true|string True or error text.
	 */
	private static function post( array $orders ) {
		$base = class_exists( '\\WebinoBasalam\\Config\\Endpoints' )
			? \WebinoBasalam\Config\Endpoints::vendorBaseUrl()
			: ( defined( 'WEBINO_DASHBOARD_VENDOR_URL' ) ? untrailingslashit( (string) WEBINO_DASHBOARD_VENDOR_URL ) : 'https://webina.dev' );

		$body = array(
			'site_url' => untrailingslashit( home_url() ),
			'orders'   => array_values( $orders ),
		);
		if ( class_exists( 'Webino_Dashboard_Site_Auth', false ) ) {
			$body['domain'] = Webino_Dashboard_Site_Auth::site_domain();
		}

		$response = wp_remote_post(
			$base . self::PATH,
			array(
				'timeout' => 15,
				'headers' => array(
					'Content-Type' => 'application/json',
					'Accept'       => 'application/json',
				),
				'body'    => wp_json_encode( $body ),
			)
		);
		if ( is_wp_error( $response ) ) {
			return $response->get_error_message();
		}
		$code = (int) wp_remote_retrieve_response_code( $response );
		$data = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		if ( $code >= 200 && $code < 300 && is_array( $data ) && ! empty( $data['success'] ) ) {
			return true;
		}
		$msg = is_array( $data ) ? (string) ( $data['message'] ?? ( $data['code'] ?? '' ) ) : '';
		return 'HTTP ' . $code . ( '' !== $msg ? ' ' . $msg : '' );
	}

	/**
	 * @param int $order_id Order id.
	 * @return array<string,mixed>|null
	 */
	private static function build_order( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof \WC_Order || ! self::is_basalam_order( $order ) ) {
			return null;
		}
		$invoice = (string) $order->get_meta( '_basalam_invoice_id' );
		if ( '' === $invoice ) {
			global $wpdb;
			$table   = $wpdb->prefix . 'webino_basalam_payments';
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$invoice = (string) $wpdb->get_var( $wpdb->prepare( "SELECT invoice_id FROM {$table} WHERE order_id = %d LIMIT 1", $order_id ) );
		}
		if ( '' === $invoice ) {
			return null; // No stable external id → never send (avoids duplicate rows on ERP).
		}

		$factor = class_exists( 'Webino_Dashboard_Currency', false ) ? (float) Webino_Dashboard_Currency::to_rial_factor( $order->get_currency() ) : 10.0;
		$factor = $factor > 0 ? $factor : 1.0;

		$items = array();
		foreach ( $order->get_items() as $item ) {
			$qty     = max( 1, (int) $item->get_quantity() );
			$items[] = array(
				'title'          => (string) $item->get_name(),
				'qty'            => $qty,
				'price'          => (int) round( (float) $item->get_total() / $qty * $factor ),
				'product_id'     => 0,
				'woo_product_id' => (int) ( $item->get_variation_id() ? $item->get_variation_id() : $item->get_product_id() ),
			);
		}

		$status = (string) $order->get_status();
		$row    = array(
			'id'           => $invoice,
			'total'        => (int) round( (float) $order->get_total() * $factor ),
			'currency'     => 'IRR',
			'buyer_name'   => trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ),
			'buyer_mobile' => self::normalize_mobile( (string) $order->get_billing_phone() ),
			'items'        => $items,
		);
		if ( isset( self::STATUS_IDS[ $status ] ) ) {
			$row['status_id'] = self::STATUS_IDS[ $status ];
		} else {
			$row['status'] = substr( $status, 0, 40 );
		}
		$created = $order->get_date_created();
		if ( $created ) {
			$row['ordered_at'] = $created->format( DATE_ATOM );
		}
		$paid = $order->get_date_paid();
		if ( $paid ) {
			$row['paid_at'] = $paid->format( DATE_ATOM );
		}
		return $row;
	}

	/**
	 * @param string $phone Raw phone.
	 * @return string 09xxxxxxxxx when recognizable, else digits.
	 */
	private static function normalize_mobile( $phone ) {
		$phone = strtr( $phone, array( '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9' ) );
		$d     = preg_replace( '/\D+/', '', $phone );
		if ( preg_match( '/^(?:0098|98)?0?(9\d{9})$/', (string) $d, $m ) ) {
			return '0' . $m[1];
		}
		return (string) $d;
	}

	/**
	 * @param string $msg Message.
	 */
	private static function log( $msg ) {
		if ( class_exists( '\\WebinoBasalam\\Logger\\Logger' ) ) {
			\WebinoBasalam\Logger\Logger::error( '[ERP mirror] ' . $msg );
		}
		if ( function_exists( 'wc_get_logger' ) ) {
			wc_get_logger()->warning( $msg, array( 'source' => 'webino-basalam-erp' ) );
		}
	}
}
