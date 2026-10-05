<?php
/**
 * Phase 3 features: webhook matrix, reconciliation, health and alerting.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Phase3_Sync {

	/**
	 * Digikala seller-panel event keys (stable) → job routing.
	 *
	 * @return array<string,array{job:string,context:string,label_fa:string}>
	 */
	public static function webhook_matrix() {
		return array(
			'variant_status'         => array(
				'job'      => 'inventory_sync',
				'context'  => 'inventory',
				'label_fa' => 'تغییر وضعیت تنوع کالایی',
			),
			'order_shipping_status'  => array(
				'job'      => 'orders_pull',
				'context'  => 'orders',
				'label_fa' => 'تغییر وضعیت ارسال سفارش',
			),
			'package_status'         => array(
				'job'      => 'phase2_shipments',
				'context'  => 'shipments',
				'label_fa' => 'تغییر وضعیت محموله ها',
			),
			'commission'             => array(
				'job'      => 'phase2_finance',
				'context'  => 'finance',
				'label_fa' => 'تغییر در کمیسیون ها',
			),
			'product_upsert'         => array(
				'job'      => 'product_import',
				'context'  => 'product',
				'label_fa' => 'ساخت و ویرایش محصول',
			),
			'brand_request'          => array(
				'job'      => 'product_import',
				'context'  => 'catalog',
				'label_fa' => 'درخواست برند',
			),
			'warranty_request'       => array(
				'job'      => 'product_import',
				'context'  => 'catalog',
				'label_fa' => 'درخواست گارانتی',
			),
			'color_request'          => array(
				'job'      => 'product_import',
				'context'  => 'catalog',
				'label_fa' => 'درخواست رنگ',
			),
			'size_request'           => array(
				'job'      => 'product_import',
				'context'  => 'catalog',
				'label_fa' => 'درخواست سایز',
			),
			'order_finalized'        => array(
				'job'      => 'orders_pull',
				'context'  => 'orders',
				'label_fa' => 'نهایی شدن سفارش',
			),
			'order_item_cancelled'   => array(
				'job'      => 'orders_pull',
				'context'  => 'orders',
				'label_fa' => 'لغو آیتم سفارش',
			),
			'order_returned'         => array(
				'job'      => 'orders_pull',
				'context'  => 'orders',
				'label_fa' => 'مرجوعی سفارش',
			),
		);
	}

	/**
	 * Map legacy / alternate Digikala event names onto stable keys.
	 *
	 * @return array<string,string>
	 */
	public static function webhook_event_aliases() {
		return array(
			'order.created'         => 'order_finalized',
			'order.updated'         => 'order_shipping_status',
			'order.cancelled'       => 'order_item_cancelled',
			'shipment.updated'      => 'package_status',
			'inventory.updated'     => 'variant_status',
			'price.updated'         => 'product_upsert',
			'promotion.updated'     => 'commission',
			'voucher.updated'       => 'commission',
			'sbs.order.updated'     => 'order_shipping_status',
			'variant.status'        => 'variant_status',
			'product.created'       => 'product_upsert',
			'product.updated'       => 'product_upsert',
			'order.finalized'       => 'order_finalized',
			'order.returned'        => 'order_returned',
			'order.item.cancelled'  => 'order_item_cancelled',
			'product_variant_status_change' => 'variant_status',
			'order_shipment'                => 'order_shipping_status',
			'seller_package_status_change'  => 'package_status',
			'commission_change'             => 'commission',
		);
	}

	/**
	 * Default: all known events enabled.
	 *
	 * @return array<string,bool>
	 */
	public static function default_webhook_events() {
		$out = array();
		foreach ( array_keys( self::webhook_matrix() ) as $key ) {
			$out[ $key ] = true;
		}
		return $out;
	}

	/**
	 * Normalize stored toggles; unknown keys dropped, missing default to true.
	 *
	 * @param mixed $raw Raw settings value.
	 * @return array<string,bool>
	 */
	public static function normalize_webhook_events( $raw ) {
		$defaults = self::default_webhook_events();
		if ( ! is_array( $raw ) ) {
			return $defaults;
		}
		$out = $defaults;
		foreach ( $defaults as $key => $_ ) {
			if ( array_key_exists( $key, $raw ) ) {
				$out[ $key ] = (bool) $raw[ $key ];
			}
		}
		return $out;
	}

	/**
	 * Resolve incoming event string to stable matrix key.
	 *
	 * @param string $event Raw event.
	 * @return string
	 */
	public static function resolve_event_key( $event ) {
		$raw = trim( (string) $event );
		if ( '' === $raw ) {
			return '';
		}
		$aliases = self::webhook_event_aliases();
		if ( isset( $aliases[ $raw ] ) ) {
			return $aliases[ $raw ];
		}
		$lower = strtolower( $raw );
		if ( isset( $aliases[ $lower ] ) ) {
			return $aliases[ $lower ];
		}
		$as_key = sanitize_key( str_replace( array( ' ', '-', '.' ), array( '_', '_', '_' ), $lower ) );
		$as_key = preg_replace( '/_+/', '_', (string) $as_key );
		if ( isset( $aliases[ $as_key ] ) ) {
			return $aliases[ $as_key ];
		}
		// Map sanitized dotted aliases (order_created → order.created).
		$dotted = str_replace( '_', '.', $as_key );
		if ( isset( $aliases[ $dotted ] ) ) {
			return $aliases[ $dotted ];
		}
		$matrix = self::webhook_matrix();
		if ( isset( $matrix[ $as_key ] ) ) {
			return $as_key;
		}
		return $as_key;
	}

	/**
	 * @param string              $event Event key.
	 * @param array<string,mixed> $payload Payload.
	 * @return bool
	 */
	public static function dispatch_webhook_event( $event, array $payload ) {
		$candidates = array( (string) $event );
		foreach ( array( 'event', 'type', 'event_type', 'name' ) as $field ) {
			if ( isset( $payload[ $field ] ) && is_string( $payload[ $field ] ) && '' !== $payload[ $field ] ) {
				$candidates[] = (string) $payload[ $field ];
			}
		}
		$key = '';
		foreach ( $candidates as $candidate ) {
			$resolved = self::resolve_event_key( $candidate );
			if ( isset( self::webhook_matrix()[ $resolved ] ) ) {
				$key = $resolved;
				break;
			}
			if ( '' === $key ) {
				$key = $resolved;
			}
		}

		$matrix = self::webhook_matrix();
		if ( ! isset( $matrix[ $key ] ) ) {
			Digikala_Jobs::log( 'info', 'webhook', 'Unhandled webhook event.', array( 'event' => $event, 'resolved' => $key ) );
			return false;
		}

		$settings = Digikala_Auth::settings();
		$enabled  = self::normalize_webhook_events( $settings['webhook_events'] ?? null );
		if ( empty( $enabled[ $key ] ) ) {
			Digikala_Jobs::log( 'info', 'webhook', 'Webhook event disabled in settings.', array( 'event' => $key ) );
			return false;
		}

		$rule = $matrix[ $key ];
		$job  = (string) ( $rule['job'] ?? '' );
		if ( '' === $job ) {
			return false;
		}
		Digikala_Jobs::enqueue(
			$job,
			array(
				'source'  => 'webhook',
				'event'   => $key,
				'payload' => $payload,
			),
			2
		);
		Digikala_Jobs::log( 'info', 'webhook', 'Webhook event routed to queue.', array( 'event' => $key, 'job_type' => $job ) );
		return true;
	}

	/**
	 * Register webhook URL with official Digikala Open API event names.
	 *
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function subscribe_official_webhooks() {
		$url      = home_url( '/webino/digikala-webhook/' );
		$settings = Digikala_Auth::settings();
		$enabled  = self::normalize_webhook_events( $settings['webhook_events'] ?? null );
		$official = array(
			'variant_status'        => 'product_variant_status_change',
			'order_shipping_status' => 'order_shipment',
			'package_status'        => 'seller_package_status_change',
			'commission'            => 'commission_change',
			'order_finalized'       => 'order_shipment',
			'order_item_cancelled'  => 'order_shipment',
			'order_returned'        => 'order_shipment',
		);
		$events = array();
		foreach ( $enabled as $key => $on ) {
			if ( $on && isset( $official[ $key ] ) ) {
				$events[] = $official[ $key ];
			}
		}
		$events = array_values( array_unique( $events ) );
		$types  = Digikala_Client::request( 'GET', 'open-api/v1/webhook/event-types' );
		$body   = array(
			'url'          => $url,
			'callback_url' => $url,
			'events'       => $events,
			'event_types'  => $events,
		);
		$res = Digikala_Client::request( 'POST', 'open-api/v1/webhook/subscription', $body );
		if ( is_wp_error( $res ) ) {
			Digikala_Jobs::log( 'error', 'webhook', 'Official webhook subscription failed.', array( 'error' => $res->get_error_message() ) );
			return $res;
		}
		Digikala_Jobs::log( 'info', 'webhook', 'Official webhook subscription saved.', array( 'events' => $events ) );
		return array(
			'ok'          => true,
			'events'      => $events,
			'event_types' => is_wp_error( $types ) ? array() : $types,
			'result'      => $res,
		);
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function reconcile_products( array $payload = array(), $job_id = 0 ) {
		global $wpdb;
		$map_table = $wpdb->prefix . 'webino_dk_product_map';
		$rows      = $wpdb->get_results( "SELECT wc_product_id, dk_product_id FROM {$map_table} ORDER BY id DESC LIMIT 500", ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$drift = 0;
		foreach ( (array) $rows as $row ) {
			$wc_id = (int) ( $row['wc_product_id'] ?? 0 );
			$dk_id = (string) ( $row['dk_product_id'] ?? '' );
			if ( $wc_id <= 0 || '' === $dk_id ) {
				$drift++;
				continue;
			}
			if ( ! wc_get_product( $wc_id ) ) {
				$drift++;
			}
		}
		Digikala_Jobs::log( 'info', 'reconcile', 'Product reconciliation finished.', array( 'job_id' => $job_id, 'drift_count' => $drift ) );
		return true;
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function reconcile_orders( array $payload = array(), $job_id = 0 ) {
		global $wpdb;
		$map_table = $wpdb->prefix . 'webino_dk_order_map';
		$rows      = $wpdb->get_results( "SELECT wc_order_id, dk_order_id FROM {$map_table} ORDER BY id DESC LIMIT 500", ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$drift = 0;
		foreach ( (array) $rows as $row ) {
			$wc_id = (int) ( $row['wc_order_id'] ?? 0 );
			$dk_id = (string) ( $row['dk_order_id'] ?? '' );
			if ( $wc_id <= 0 || '' === $dk_id || ! wc_get_order( $wc_id ) ) {
				$drift++;
			}
		}
		Digikala_Jobs::log( 'info', 'reconcile', 'Order reconciliation finished.', array( 'job_id' => $job_id, 'drift_count' => $drift ) );
		return true;
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function reconcile_inventory( array $payload = array(), $job_id = 0 ) {
		global $wpdb;
		$stock_table = $wpdb->prefix . 'webino_acc_warehouse_stock';
		$rows        = $wpdb->get_results( "SELECT product_id, SUM(quantity) AS qty FROM {$stock_table} GROUP BY product_id LIMIT 1000", ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$drift = 0;
		foreach ( (array) $rows as $row ) {
			$product_id = (int) ( $row['product_id'] ?? 0 );
			$qty        = (int) ( $row['qty'] ?? 0 );
			$product    = wc_get_product( $product_id );
			if ( ! $product ) {
				continue;
			}
			$wc_qty = (int) $product->get_stock_quantity();
			if ( $wc_qty !== $qty ) {
				$drift++;
			}
		}
		Digikala_Jobs::log( 'info', 'reconcile', 'Inventory reconciliation finished.', array( 'job_id' => $job_id, 'drift_count' => $drift ) );
		return true;
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function health_status() {
		global $wpdb;
		$jobs_table = $wpdb->prefix . 'webino_dk_jobs';
		$logs_table = $wpdb->prefix . 'webino_dk_logs';
		$pending = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$jobs_table} WHERE status=%s", 'pending' ) );
		$running = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$jobs_table} WHERE status=%s", 'running' ) );
		$failed_24h = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$logs_table} WHERE level=%s AND created_at >= %s", 'error', gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS ) ) );
		$token = Digikala_Auth::access_token();
		$auth_ok = ! is_wp_error( $token );
		$status = 'healthy';
		if ( ! $auth_ok || $failed_24h > 30 ) {
			$status = 'critical';
		} elseif ( $failed_24h > 5 || $pending > 50 ) {
			$status = 'warning';
		}
		return array(
			'status'        => $status,
			'auth_ok'       => $auth_ok,
			'queue_pending' => $pending,
			'queue_running' => $running,
			'errors_24h'    => $failed_24h,
			'checked_at'    => gmdate( 'c' ),
		);
	}
}
