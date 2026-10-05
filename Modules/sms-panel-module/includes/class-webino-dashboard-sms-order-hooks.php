<?php
/**
 * WooCommerce hooks → CRM order SMS notify.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Forwards order events to webinocrm/v1/modirpayamak/orders/notify (realtime, non-blocking).
 */
final class Webino_Dashboard_Sms_Order_Hooks {

	/** @var array<int,array{event_key:string,order:array<string,mixed>}> */
	private static $pending = array();

	/** @var bool */
	private static $shutdown_registered = false;

	/** @var array<int,bool> Order ids that queued pending_on_create in this request. */
	private static $pending_on_create_queued = array();

	/**
	 * @return void
	 */
	public static function init() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}
		add_action( 'woocommerce_checkout_order_processed', array( __CLASS__, 'on_checkout_processed' ), 20, 1 );
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'on_status_changed' ), 20, 4 );
		add_action( 'webino_dashboard_order_post_barcode_saved', array( __CLASS__, 'on_post_barcode' ), 10, 2 );
		add_action( 'woocommerce_low_stock', array( __CLASS__, 'on_wc_low_stock' ), 10, 1 );
		add_action( 'woocommerce_no_stock', array( __CLASS__, 'on_wc_no_stock' ), 10, 1 );
		add_action( 'webino_dashboard_product_stock_low', array( __CLASS__, 'on_stock_low' ), 10, 2 );
		add_action( 'webino_dashboard_product_stock_out', array( __CLASS__, 'on_stock_out' ), 10, 2 );
	}

	/**
	 * @param WC_Product $product Product.
	 * @return void
	 */
	public static function on_wc_low_stock( $product ) {
		$resolved = self::resolve_wc_product( $product );
		if ( ! $resolved ) {
			return;
		}
		self::notify_stock_event( 'stock-low', $resolved['id'], $resolved['qty'] );
	}

	/**
	 * @param WC_Product $product Product.
	 * @return void
	 */
	public static function on_wc_no_stock( $product ) {
		$resolved = self::resolve_wc_product( $product );
		if ( ! $resolved ) {
			return;
		}
		self::notify_stock_event( 'stock-out', $resolved['id'], $resolved['qty'] );
	}

	/**
	 * @param WC_Product|int $product Product or id.
	 * @return array{id:int,qty:float|null}|null
	 */
	private static function resolve_wc_product( $product ) {
		if ( is_numeric( $product ) ) {
			$product = wc_get_product( (int) $product );
		}
		if ( ! $product instanceof WC_Product ) {
			return null;
		}
		$id = (int) $product->get_id();
		if ( $product->is_type( 'variation' ) ) {
			$id = (int) $product->get_parent_id();
			if ( $id < 1 ) {
				$id = (int) $product->get_id();
			}
		}
		$qty = $product->managing_stock() ? (float) $product->get_stock_quantity() : null;
		return array(
			'id'  => $id,
			'qty' => $qty,
		);
	}

	/**
	 * @param int $order_id Order id.
	 * @return void
	 */
	public static function on_checkout_processed( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		$status = $order->get_status();
		if ( 'pending' === $status ) {
			self::$pending_on_create_queued[ (int) $order_id ] = true;
			self::notify( 'pending_on_create', $order );
		}
	}

	/**
	 * @param int      $order_id Order id.
	 * @param string   $from From status.
	 * @param string   $to To status.
	 * @param WC_Order $order Order object.
	 * @return void
	 */
	public static function on_status_changed( $order_id, $from, $to, $order ) {
		if ( ! $order instanceof WC_Order ) {
			$order = wc_get_order( $order_id );
		}
		if ( ! $order ) {
			return;
		}
		$event = Webino_Dashboard_Sms_Order_Map::event_for_status( $to );
		if ( '' === $event ) {
			return;
		}
		if ( '1' === (string) $order->get_meta( '_webino_pay_link_order' ) && in_array( $event, array( 'pending_on_status', 'pending_on_create' ), true ) ) {
			return;
		}
		if ( 'pending_on_status' === $event ) {
			$from_slug = sanitize_key( (string) $from );
			if ( ( '' === $from_slug || 'pending' === $from_slug || 'checkout-draft' === $from_slug || 'auto-draft' === $from_slug )
				&& ! empty( self::$pending_on_create_queued[ (int) $order_id ] ) ) {
				return;
			}
		}
		self::notify( $event, $order );
	}

	/**
	 * @param int    $order_id Order id.
	 * @param string $barcode Barcode.
	 * @return void
	 */
	public static function on_post_barcode( $order_id, $barcode ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		$snapshot            = self::build_snapshot( $order );
		$snapshot['barcode'] = (string) $barcode;
		// Merged with "post" delivery pattern (no separate post-barcode event).
		self::notify_snapshot( 'post', $snapshot );
	}

	/**
	 * @param int $product_id Product id.
	 * @param int $qty Quantity.
	 * @return void
	 */
	public static function on_stock_low( $product_id, $qty ) {
		self::notify_stock_event( 'stock-low', (int) $product_id, $qty );
	}

	/**
	 * @param int       $product_id Product id.
	 * @param int|float $qty Quantity.
	 * @return void
	 */
	public static function on_stock_out( $product_id, $qty ) {
		self::notify_stock_event( 'stock-out', (int) $product_id, $qty );
	}

	/**
	 * @param string   $event_key Event.
	 * @param WC_Order $order Order.
	 * @return void
	 */
	private static function notify( $event_key, $order ) {
		self::notify_snapshot( $event_key, self::build_snapshot( $order ) );
	}

	/**
	 * Queue realtime CRM notify (fires on shutdown, non-blocking HTTP).
	 *
	 * @param string               $event_key Event.
	 * @param array<string,mixed>  $snapshot Snapshot.
	 * @param bool                 $sync When true, send immediately and wait (manual UI).
	 * @return array{ok:bool,error?:string}|null Sync result or null when queued.
	 */
	public static function notify_snapshot( $event_key, array $snapshot, $sync = false ) {
		$event_key = Webino_Dashboard_Sms_Order_Map::normalize_event_key( $event_key );
		$order_id  = (int) ( $snapshot['id'] ?? 0 );
		if ( $order_id <= 0 && ! in_array( $event_key, array( 'stock-low', 'stock-out', 'cart-abandoned', 'user-welcome' ), true ) ) {
			return array( 'ok' => false, 'error' => 'invalid_order' );
		}
		if ( self::should_skip_notify( $event_key ) ) {
			if ( $order_id > 0 && class_exists( 'Webino_Dashboard_Orders', false ) ) {
				$phone = (string) ( $snapshot['customer_phone'] ?? $snapshot['mobile'] ?? '' );
				Webino_Dashboard_Orders::append_sms_log(
					$order_id,
					array(
						'status' => 'skipped',
						'event'  => $event_key,
						'phone'  => $phone,
						'reason' => 'event_off',
						'source' => 'auto',
						'role'   => 'system',
					)
				);
			}
			return array( 'ok' => true, 'skipped' => true, 'reason' => 'event_off' );
		}
		$product_id = (int) ( $snapshot['product_id'] ?? 0 );
		if ( $product_id > 0 && in_array( $event_key, array( 'stock-low', 'stock-out' ), true ) ) {
			$dedupe_key = 'webino_sms_' . $event_key . '_p' . $product_id . '_q' . (string) ( $snapshot['stock_quantity'] ?? '' );
		} elseif ( 'post' === $event_key && $order_id > 0 ) {
			// Status "post" and barcode save share one SMS.
			$dedupe_key = 'webino_sms_post_' . $order_id;
		} elseif ( 'cart-abandoned' === $event_key ) {
			$dedupe_key = 'webino_sms_cart_abandoned_' . (int) ( $snapshot['user_id'] ?? 0 );
		} elseif ( 'user-welcome' === $event_key ) {
			$dedupe_key = 'webino_sms_user_welcome_' . (int) ( $snapshot['user_id'] ?? 0 );
		} elseif ( 'order-abandoned' === $event_key && $order_id > 0 ) {
			$dedupe_key = 'webino_sms_order_abandoned_' . $order_id;
		} else {
			$dedupe_key = 'webino_sms_' . $event_key . '_' . $order_id . '_' . ( $snapshot['status'] ?? '' );
		}
		if ( ! $sync && get_transient( $dedupe_key ) ) {
			return array( 'ok' => true, 'skipped' => true, 'reason' => 'dedupe' );
		}
		if ( ! $sync ) {
			$ttl = in_array( $event_key, array( 'cart-abandoned', 'order-abandoned', 'user-welcome', 'post' ), true ) ? DAY_IN_SECONDS : 60;
			set_transient( $dedupe_key, 1, $ttl );
		}

		if ( class_exists( 'Webino_Dashboard_Sms_Recovery', false ) ) {
			$snapshot = Webino_Dashboard_Sms_Recovery::maybe_attach_coupon( $event_key, $snapshot );
		}

		$license = Webino_Dashboard_License::instance();

		$payload = array(
			'event_key' => sanitize_key( $event_key ),
			'order'     => $snapshot,
		);

		if ( $sync ) {
			$res = $license->crm_post(
				'wp-json/webinocrm/v1/modirpayamak/orders/notify',
				$payload,
				'install'
			);
			return array(
				'ok'    => ! empty( $res['ok'] ),
				'data'  => $res['data'] ?? null,
				'error' => $res['error'] ?? '',
			);
		}

		self::$pending[] = $payload;
		if ( $order_id > 0 && class_exists( 'Webino_Dashboard_Orders', false ) ) {
			$phone = (string) ( $snapshot['customer_phone'] ?? $snapshot['mobile'] ?? '' );
			Webino_Dashboard_Orders::append_sms_log(
				$order_id,
				array(
					'status' => 'queued',
					'event'  => $event_key,
					'phone'  => $phone,
					'source' => 'auto',
					'role'   => 'customer',
				)
			);
			delete_transient( 'webino_order_sms_sync_' . $order_id );
		}
		if ( ! self::$shutdown_registered ) {
			self::$shutdown_registered = true;
			add_action( 'shutdown', array( __CLASS__, 'flush_pending' ), 5 );
		}
		return null;
	}

	/**
	 * Fire queued notifies with non-blocking HTTP so checkout/status UI is not delayed.
	 *
	 * @return void
	 */
	public static function flush_pending() {
		if ( ! self::$pending ) {
			return;
		}
		$queue         = self::$pending;
		self::$pending = array();
		$license       = Webino_Dashboard_License::instance();
		foreach ( $queue as $payload ) {
			$license->crm_post_async(
				'wp-json/webinocrm/v1/modirpayamak/orders/notify',
				$payload
			);
		}
	}

	/**
	 * @param string       $event_key Event key.
	 * @param int          $product_id WC product id.
	 * @param int|float|null $qty Stock qty if known.
	 * @return void
	 */
	public static function notify_stock_event( $event_key, $product_id, $qty = null ) {
		self::notify_snapshot( $event_key, self::build_stock_snapshot( $product_id, $qty ) );
	}

	/**
	 * @param int            $product_id Product id.
	 * @param int|float|null $qty Quantity.
	 * @return array<string,mixed>
	 */
	public static function build_stock_snapshot( $product_id, $qty = null ) {
		$product_id = (int) $product_id;
		$name       = '';
		$url        = '';
		$stock_qty  = $qty;
		$low_amount = '';

		$product = function_exists( 'wc_get_product' ) ? wc_get_product( $product_id ) : false;
		if ( $product instanceof WC_Product ) {
			$name = $product->get_name();
			$url  = (string) get_permalink( $product_id );
			if ( null === $stock_qty && $product->managing_stock() ) {
				$stock_qty = (float) $product->get_stock_quantity();
			}
			$low = $product->get_low_stock_amount();
			if ( null !== $low && '' !== $low ) {
				$low_amount = (string) $low;
			}
		}

		return array(
			'id'               => 0,
			'product_id'       => $product_id,
			'product_name'     => $name ?: (string) $product_id,
			'product_url'      => $url,
			'stock_quantity'   => null !== $stock_qty ? (string) $stock_qty : '',
			'qty'              => null !== $stock_qty ? (string) $stock_qty : '',
			'low_stock_amount' => $low_amount,
			'site_name'        => get_bloginfo( 'name' ),
			'site_url'         => home_url(),
		);
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,mixed>
	 */
	public static function build_snapshot( $order ) {
		$status = $order->get_status();
		$phone  = $order->get_billing_phone();
		if ( '' === $phone ) {
			$phone = (string) get_user_meta( $order->get_customer_id(), 'billing_phone', true );
		}
		$tracking_code = class_exists( 'Webino_Dashboard_Orders', false )
			? Webino_Dashboard_Orders::get_tracking_code( $order )
			: '';
		$tracking_url  = class_exists( 'Webino_Dashboard_Orders', false )
			? Webino_Dashboard_Orders::get_tracking_url( $order )
			: '';
		$tracking = $tracking_code;
		$barcode  = (string) $order->get_meta( '_post_barcode' );
		if ( '' === $barcode ) {
			$barcode = (string) $order->get_meta( 'post_barcode' );
		}
		if ( '' === $barcode ) {
			$barcode = $tracking_code;
		}
		$statuses = function_exists( 'wc_get_order_statuses' ) ? wc_get_order_statuses() : array();
		$wc_label = $statuses[ 'wc-' . $status ] ?? $status;
		$status_fa = class_exists( 'Webino_Dashboard_Sms_Order_Map', false )
			? Webino_Dashboard_Sms_Order_Map::persian_status_label( $status, (string) $wc_label )
			: wp_strip_all_tags( (string) $wc_label );

		$item_names = array();
		$item_full  = array();
		$items_qty  = 0;
		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof WC_Order_Item_Product ) {
				continue;
			}
			$qty          = (int) $item->get_quantity();
			$items_qty   += $qty;
			$item_names[] = $item->get_name() . ( $qty > 1 ? ' ×' . $qty : '' );
			$item_full[]  = $item->get_name() . ' ×' . $qty;
		}

		$shipping_methods = array();
		foreach ( $order->get_shipping_methods() as $ship ) {
			$shipping_methods[] = $ship->get_name();
		}

		$billing  = self::format_address( $order, 'billing' );
		$shipping = self::format_address( $order, 'shipping' );
		$created  = $order->get_date_created();
		$items_str = implode( ', ', $item_names );
		$payment_url = '';
		if ( '1' === (string) $order->get_meta( '_webino_pay_link_order' ) && class_exists( 'Webino_Dashboard_Pay_Order', false ) ) {
			$payment_url = Webino_Dashboard_Pay_Order::public_url( $order );
		} elseif ( method_exists( $order, 'get_checkout_payment_url' ) ) {
			$payment_url = (string) $order->get_checkout_payment_url();
		}

		$raw_total = (string) $order->get_formatted_order_total();
		$sms_total = class_exists( 'Webino_Dashboard_Currency', false )
			? Webino_Dashboard_Currency::plain_sms_price( $raw_total )
			: wp_strip_all_tags( $raw_total );
		$sms_amount = class_exists( 'Webino_Dashboard_Currency', false )
			? Webino_Dashboard_Currency::sms_amount_only( $raw_total )
			: $sms_total;

		$customer_name = trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() );
		$snapshot      = array(
			'id'               => $order->get_id(),
			'number'           => $order->get_order_number(),
			'order_number'     => $order->get_order_number(),
			'order_id'         => (string) $order->get_id(),
			'customer_name'    => $customer_name,
			'name'             => $customer_name,
			'customer_phone'   => $phone,
			'mobile'           => $phone,
			'phone'            => $phone,
			'customer_email'   => (string) $order->get_billing_email(),
			'total'            => $sms_total,
			'price'            => $sms_total,
			'total_amount'     => $sms_amount,
			'price_amount'     => $sms_amount,
			'status'           => $status_fa,
			'status_label'     => $status_fa,
			'status_slug'      => $status,
			'tracking'         => $tracking,
			'tracking_code'    => $tracking_code,
			'tracking_url'     => $tracking_url,
			'barcode'          => $barcode,
			'items'            => $items_str,
			'all_items'        => $items_str,
			'all_items_full'   => implode( ', ', $item_full ),
			'items_qty'        => (string) $items_qty,
			'count_items'      => (string) $items_qty,
			'payment_method'   => (string) ( $order->get_payment_method_title() ?: $order->get_payment_method() ),
			'payment_url'      => $payment_url,
			'payment_link'     => $payment_url,
			'link'             => $payment_url,
			'shipping_method'  => implode( ', ', $shipping_methods ),
			'transaction_id'   => (string) $order->get_transaction_id(),
			'description'      => (string) $order->get_customer_note(),
			'billing_address'  => $billing,
			'shipping_address' => $shipping,
			'b_first_name'     => (string) $order->get_billing_first_name(),
			'b_last_name'      => (string) $order->get_billing_last_name(),
			'b_company'        => (string) $order->get_billing_company(),
			'b_country'        => (string) $order->get_billing_country(),
			'b_state'          => (string) $order->get_billing_state(),
			'b_city'           => (string) $order->get_billing_city(),
			'b_address_1'      => (string) $order->get_billing_address_1(),
			'b_address_2'      => (string) $order->get_billing_address_2(),
			'b_postcode'       => (string) $order->get_billing_postcode(),
			'sh_first_name'    => (string) $order->get_shipping_first_name(),
			'sh_last_name'     => (string) $order->get_shipping_last_name(),
			'sh_company'       => (string) $order->get_shipping_company(),
			'sh_country'       => (string) $order->get_shipping_country(),
			'sh_state'         => (string) $order->get_shipping_state(),
			'sh_city'          => (string) $order->get_shipping_city(),
			'sh_address_1'     => (string) $order->get_shipping_address_1(),
			'sh_address_2'     => (string) $order->get_shipping_address_2(),
			'sh_postcode'      => (string) $order->get_shipping_postcode(),
			'order_date'       => $created ? $created->date_i18n( 'Y-m-d H:i' ) : '',
			'site_name'        => get_bloginfo( 'name' ),
			'site_url'         => home_url(),
		);

		/**
		 * Filter order SMS snapshot (POS payment vars, module extras, etc.).
		 *
		 * @param array<string,mixed> $snapshot Snapshot.
		 * @param WC_Order            $order    Order.
		 */
		$filtered = apply_filters( 'webino_dashboard_sms_order_snapshot', $snapshot, $order );
		return is_array( $filtered ) ? $filtered : $snapshot;
	}

	/**
	 * @param WC_Order $order Order.
	 * @param string   $type billing|shipping.
	 * @return string
	 */
	private static function format_address( $order, $type ) {
		$parts = array();
		if ( 'billing' === $type ) {
			$parts = array_filter(
				array(
					$order->get_billing_address_1(),
					$order->get_billing_address_2(),
					$order->get_billing_city(),
					$order->get_billing_state(),
					$order->get_billing_postcode(),
				)
			);
		} else {
			$parts = array_filter(
				array(
					$order->get_shipping_address_1(),
					$order->get_shipping_address_2(),
					$order->get_shipping_city(),
					$order->get_shipping_state(),
					$order->get_shipping_postcode(),
				)
			);
		}
		return implode( '، ', $parts );
	}

	/**
	 * Cached shop SMS settings for the local notify gate.
	 * Prefers the full UI transient; otherwise uses a settings-only gate cache
	 * (never writes a partial payload into the UI cache).
	 *
	 * @return array<string,mixed>|null
	 */
	private static function shop_settings_cached() {
		if ( ! class_exists( 'Webino_Dashboard_License', false ) ) {
			return null;
		}
		$license = Webino_Dashboard_License::instance();
		if ( ! $license->is_license_active( false ) ) {
			return null;
		}
		$domain    = $license->get_current_domain();
		$cache_key = 'webino_sms_shop_settings_' . md5( (string) $domain );
		$cached    = get_transient( $cache_key );
		if ( is_array( $cached ) && isset( $cached['settings'] ) && is_array( $cached['settings'] ) ) {
			$settings = $cached['settings'];
			if ( class_exists( 'Webino_Dashboard_Sms_Recovery', false ) ) {
				$settings = Webino_Dashboard_Sms_Recovery::merge_into_shop_settings( $settings );
			}
			return $settings;
		}

		$gate_key = 'webino_sms_shop_gate_' . md5( (string) $domain );
		$gate     = get_transient( $gate_key );
		if ( is_array( $gate ) ) {
			if ( class_exists( 'Webino_Dashboard_Sms_Recovery', false ) ) {
				$gate = Webino_Dashboard_Sms_Recovery::merge_into_shop_settings( $gate );
			}
			return $gate;
		}

		$opts = array(
			'timeout'  => 3,
			'wall_cap' => 5,
		);
		if ( class_exists( 'Webino_Dashboard_REST_Site_Settings', false ) ) {
			$opts = Webino_Dashboard_REST_Site_Settings::CRM_FAST_OPTS;
		}
		$res = $license->crm_get( 'wp-json/webinocrm/v1/modirpayamak/settings/shop', array(), $opts );
		if ( empty( $res['ok'] ) || ! is_array( $res['data']['settings'] ?? null ) ) {
			return null;
		}
		$settings = $res['data']['settings'];
		$ttl      = 300;
		if ( class_exists( 'Webino_Dashboard_REST_Site_Settings', false ) ) {
			$ttl = (int) Webino_Dashboard_REST_Site_Settings::SMS_SHOP_CACHE_TTL;
		}
		set_transient( $gate_key, $settings, $ttl );
		if ( class_exists( 'Webino_Dashboard_Sms_Recovery', false ) ) {
			$settings = Webino_Dashboard_Sms_Recovery::merge_into_shop_settings( $settings );
		}
		return $settings;
	}

	/**
	 * Resolve customer/admin toggles for a canonical event key (merges alias keys).
	 *
	 * @param array<string,mixed> $events Shop events map.
	 * @param string              $event_key Canonical event key.
	 * @return array{customer:bool,admin:bool}
	 */
	private static function resolve_event_toggles( array $events, $event_key ) {
		$event_key = Webino_Dashboard_Sms_Order_Map::normalize_event_key( $event_key );

		if ( array_key_exists( $event_key, $events ) && is_array( $events[ $event_key ] ) ) {
			return array(
				'customer' => ! empty( $events[ $event_key ]['customer'] ),
				'admin'    => ! empty( $events[ $event_key ]['admin'] ),
			);
		}

		$customer = false;
		$admin    = false;
		foreach ( $events as $key => $toggle ) {
			if ( ! is_array( $toggle ) ) {
				continue;
			}
			if ( Webino_Dashboard_Sms_Order_Map::normalize_event_key( (string) $key ) !== $event_key ) {
				continue;
			}
			if ( ! empty( $toggle['customer'] ) ) {
				$customer = true;
			}
			if ( ! empty( $toggle['admin'] ) ) {
				$admin = true;
			}
		}
		return array(
			'customer' => $customer,
			'admin'    => $admin,
		);
	}

	/**
	 * Local gate before queuing CRM notify (optimization only).
	 * When settings cache/CRM is unavailable, fail-open so CRM remains source of truth.
	 *
	 * @param string $event_key Canonical event key.
	 * @return bool True when notify should be skipped.
	 */
	public static function should_skip_notify( $event_key ) {
		$settings = self::shop_settings_cached();
		if ( ! is_array( $settings ) ) {
			// Fail-open: queue to CRM; CRM enforces switches + patterns.
			return false;
		}
		if ( empty( $settings['enabled'] ) ) {
			return true;
		}
		$events = isset( $settings['events'] ) && is_array( $settings['events'] ) ? $settings['events'] : array();
		$ev     = self::resolve_event_toggles( $events, $event_key );
		return ! $ev['customer'] && ! $ev['admin'];
	}
}
