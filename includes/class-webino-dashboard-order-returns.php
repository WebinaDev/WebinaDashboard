<?php
/**
 * Per-line order returns (request, approve, receive, refund, exchange).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Order return workflow service.
 */
final class Webino_Dashboard_Order_Returns {

	const STATUS_REQUESTED       = 'requested';
	const STATUS_APPROVED        = 'approved';
	const STATUS_REJECTED        = 'rejected';
	const STATUS_PARCEL_RECEIVED = 'parcel_received';
	const STATUS_REFUNDED        = 'refunded';
	const STATUS_EXCHANGED       = 'exchanged';

	const RESOLUTION_NONE     = 'none';
	const RESOLUTION_REFUND   = 'refund';
	const RESOLUTION_EXCHANGE = 'exchange';

	/** @var array<int,string> */
	private static $terminal_statuses = array(
		self::STATUS_REJECTED,
		self::STATUS_REFUNDED,
		self::STATUS_EXCHANGED,
	);

	/**
	 * @return string
	 */
	public static function table() {
		global $wpdb;
		return $wpdb->prefix . 'webino_order_returns';
	}

	/**
	 * @return void
	 */
	public static function ensure_table() {
		global $wpdb;
		$table = self::table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) === $table ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_Install', false ) ) {
			Webino_Dashboard_Install::activate();
		}
	}

	/**
	 * @param int $order_id Order ID.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_for_order( $order_id ) {
		self::ensure_table();
		global $wpdb;
		$table = self::table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE order_id = %d ORDER BY id DESC",
				(int) $order_id
			),
			ARRAY_A
		);
		$out = array();
		foreach ( (array) $rows as $row ) {
			$out[] = self::map_row( $row );
		}
		return $out;
	}

	/**
	 * @param int $return_id Return ID.
	 * @return array<string,mixed>|null
	 */
	public static function get( $return_id ) {
		self::ensure_table();
		global $wpdb;
		$table = self::table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d LIMIT 1", (int) $return_id ),
			ARRAY_A
		);
		return $row ? self::map_row( $row ) : null;
	}

	/**
	 * @param array<string,mixed> $row DB row.
	 * @return array<string,mixed>
	 */
	private static function map_row( array $row ) {
		return array(
			'id'                 => (int) $row['id'],
			'order_id'           => (int) $row['order_id'],
			'order_item_id'      => (int) $row['order_item_id'],
			'product_id'         => (int) $row['product_id'],
			'variation_id'       => (int) $row['variation_id'],
			'item_name'          => (string) $row['item_name'],
			'qty'                => (float) $row['qty'],
			'reason'             => (string) $row['reason'],
			'status'             => (string) $row['status'],
			'status_label'       => self::status_label( (string) $row['status'] ),
			'resolution'         => (string) $row['resolution'],
			'source'             => (string) $row['source'],
			'wc_refund_id'       => (int) $row['wc_refund_id'],
			'exchange_order_id'  => (int) $row['exchange_order_id'],
			'created_by'         => (int) $row['created_by'],
			'created_at'         => (string) $row['created_at'],
			'updated_at'         => (string) $row['updated_at'],
		);
	}

	/**
	 * @param string $status Status slug.
	 * @return string
	 */
	public static function status_label( $status ) {
		$labels = array(
			self::STATUS_REQUESTED       => __( 'Return requested', 'webino-dashboard' ),
			self::STATUS_APPROVED          => __( 'Return approved', 'webino-dashboard' ),
			self::STATUS_REJECTED          => __( 'Return rejected', 'webino-dashboard' ),
			self::STATUS_PARCEL_RECEIVED   => __( 'Parcel received', 'webino-dashboard' ),
			self::STATUS_REFUNDED          => __( 'Refunded', 'webino-dashboard' ),
			self::STATUS_EXCHANGED         => __( 'Exchanged', 'webino-dashboard' ),
		);
		return $labels[ $status ] ?? $status;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return bool
	 */
	public static function order_eligible( $order ) {
		if ( ! $order || ! is_a( $order, 'WC_Order' ) ) {
			return false;
		}
		$status = $order->get_status();
		if ( in_array( $status, array( 'cancelled', 'failed', 'refunded', 'pending', 'checkout-draft' ), true ) ) {
			return false;
		}
		if ( method_exists( $order, 'is_paid' ) && ! $order->is_paid() ) {
			return false;
		}
		return true;
	}

	/**
	 * @param WC_Order $order         Order.
	 * @param int      $order_item_id Line item ID.
	 * @return float Remaining returnable qty.
	 */
	public static function returnable_qty( $order, $order_item_id ) {
		$item = $order->get_item( (int) $order_item_id );
		if ( ! $item instanceof WC_Order_Item_Product ) {
			return 0.0;
		}
		$line_qty = (float) $item->get_quantity();
		$used     = self::qty_reserved_for_item( (int) $order->get_id(), (int) $order_item_id );
		return max( 0.0, $line_qty - $used );
	}

	/**
	 * @param int $order_id      Order ID.
	 * @param int $order_item_id Item ID.
	 * @return float
	 */
	private static function qty_reserved_for_item( $order_id, $order_item_id ) {
		self::ensure_table();
		global $wpdb;
		$table = self::table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$sum = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COALESCE(SUM(qty), 0) FROM {$table}
				WHERE order_id = %d AND order_item_id = %d
				AND status NOT IN ('rejected')",
				(int) $order_id,
				(int) $order_item_id
			)
		);
		return (float) $sum;
	}

	/**
	 * @param int                 $order_id Order ID.
	 * @param array<string,mixed> $data     Payload.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function create( $order_id, array $data ) {
		$order = wc_get_order( (int) $order_id );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( ! self::order_eligible( $order ) ) {
			return new WP_Error( 'not_eligible', __( 'This order is not eligible for returns.', 'webino-dashboard' ), array( 'status' => 409 ) );
		}

		$order_item_id = isset( $data['order_item_id'] ) ? (int) $data['order_item_id'] : 0;
		$qty           = isset( $data['qty'] ) ? (float) $data['qty'] : 1.0;
		$reason        = isset( $data['reason'] ) ? sanitize_textarea_field( (string) $data['reason'] ) : '';
		$source        = isset( $data['source'] ) ? sanitize_key( (string) $data['source'] ) : 'staff';
		if ( ! in_array( $source, array( 'staff', 'portal', 'telegram', 'bale' ), true ) ) {
			$source = 'staff';
		}

		$item = $order->get_item( $order_item_id );
		if ( ! $item instanceof WC_Order_Item_Product ) {
			return new WP_Error( 'bad_item', __( 'Invalid order line.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( $qty < 1 ) {
			$qty = 1.0;
		}
		$max = self::returnable_qty( $order, $order_item_id );
		if ( $qty > $max ) {
			return new WP_Error( 'qty_exceeded', __( 'Return quantity exceeds available quantity for this line.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( '' === trim( $reason ) ) {
			return new WP_Error( 'reason_required', __( 'Please provide a return reason.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		self::ensure_table();
		global $wpdb;
		$now   = current_time( 'mysql', true );
		$uid   = get_current_user_id();
		$table = self::table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$ok = $wpdb->insert(
			$table,
			array(
				'order_id'          => (int) $order->get_id(),
				'order_item_id'     => $order_item_id,
				'product_id'        => (int) $item->get_product_id(),
				'variation_id'      => (int) $item->get_variation_id(),
				'item_name'         => $item->get_name(),
				'qty'               => $qty,
				'reason'            => $reason,
				'status'            => self::STATUS_REQUESTED,
				'resolution'        => self::RESOLUTION_NONE,
				'source'            => $source,
				'wc_refund_id'      => 0,
				'exchange_order_id' => 0,
				'created_by'        => $uid,
				'created_at'        => $now,
				'updated_at'        => $now,
			),
			array( '%d', '%d', '%d', '%d', '%s', '%f', '%s', '%s', '%s', '%s', '%d', '%d', '%d', '%s', '%s' )
		);
		if ( ! $ok ) {
			return new WP_Error( 'db_error', __( 'Could not save return request.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$return_id = (int) $wpdb->insert_id;
		$row       = self::get( $return_id );
		if ( $row ) {
			self::notify_event( 'return-requested', $order, $row );
		}
		return $row ? $row : array( 'id' => $return_id );
	}

	/**
	 * @param int    $return_id Return ID.
	 * @param string $action    approve|reject|receive|refund|exchange.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function transition( $return_id, $action ) {
		$row = self::get( (int) $return_id );
		if ( ! $row ) {
			return new WP_Error( 'not_found', __( 'Return not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$order = wc_get_order( (int) $row['order_id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$action = sanitize_key( (string) $action );
		$status = (string) $row['status'];

		switch ( $action ) {
			case 'approve':
				if ( self::STATUS_REQUESTED !== $status ) {
					return new WP_Error( 'invalid_state', __( 'Only requested returns can be approved.', 'webino-dashboard' ), array( 'status' => 409 ) );
				}
				$row = self::update_status( (int) $return_id, self::STATUS_APPROVED );
				self::notify_event( 'return-approved', $order, $row );
				break;
			case 'reject':
				if ( self::STATUS_REQUESTED !== $status ) {
					return new WP_Error( 'invalid_state', __( 'Only requested returns can be rejected.', 'webino-dashboard' ), array( 'status' => 409 ) );
				}
				$row = self::update_status( (int) $return_id, self::STATUS_REJECTED );
				self::notify_event( 'return-rejected', $order, $row );
				break;
			case 'receive':
				if ( self::STATUS_APPROVED !== $status ) {
					return new WP_Error( 'invalid_state', __( 'Only approved returns can be marked received.', 'webino-dashboard' ), array( 'status' => 409 ) );
				}
				$row = self::update_status( (int) $return_id, self::STATUS_PARCEL_RECEIVED );
				self::notify_event( 'return-parcel-received', $order, $row );
				break;
			case 'refund':
				if ( self::STATUS_PARCEL_RECEIVED !== $status ) {
					return new WP_Error( 'invalid_state', __( 'Refund is only available after parcel is received.', 'webino-dashboard' ), array( 'status' => 409 ) );
				}
				$result = self::process_refund( $order, $row );
				if ( is_wp_error( $result ) ) {
					return $result;
				}
				$row = $result;
				self::notify_event( 'return-refund', $order, $row );
				self::maybe_mark_order_fully_refunded( $order );
				break;
			case 'exchange':
				if ( self::STATUS_PARCEL_RECEIVED !== $status ) {
					return new WP_Error( 'invalid_state', __( 'Exchange is only available after parcel is received.', 'webino-dashboard' ), array( 'status' => 409 ) );
				}
				$result = self::process_exchange( $order, $row );
				if ( is_wp_error( $result ) ) {
					return $result;
				}
				$row = $result;
				self::notify_event( 'return-exchange', $order, $row );
				break;
			default:
				return new WP_Error( 'bad_action', __( 'Invalid action.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		return $row;
	}

	/**
	 * @param int    $return_id Return ID.
	 * @param string $status    New status.
	 * @return array<string,mixed>
	 */
	private static function update_status( $return_id, $status ) {
		self::ensure_table();
		global $wpdb;
		$now = current_time( 'mysql', true );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			self::table(),
			array(
				'status'     => $status,
				'updated_at' => $now,
			),
			array( 'id' => (int) $return_id ),
			array( '%s', '%s' ),
			array( '%d' )
		);
		return self::get( (int) $return_id );
	}

	/**
	 * @param WC_Order            $order Order.
	 * @param array<string,mixed> $row   Return row.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function process_refund( $order, array $row ) {
		$item = $order->get_item( (int) $row['order_item_id'] );
		if ( ! $item instanceof WC_Order_Item_Product ) {
			return new WP_Error( 'bad_item', __( 'Order line not found.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$qty        = (float) $row['qty'];
		$line_qty   = max( 1.0, (float) $item->get_quantity() );
		$line_total = (float) $item->get_total();
		$amount     = round( ( $line_total / $line_qty ) * $qty, wc_get_price_decimals() );
		if ( $amount <= 0 ) {
			return new WP_Error( 'zero_amount', __( 'Refund amount is zero.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$line_items = array(
			(int) $row['order_item_id'] => array(
				'qty'          => $qty,
				'refund_total' => $amount,
			),
		);

		$refund = wc_create_refund(
			array(
				'amount'         => $amount,
				'reason'         => sprintf(
					/* translators: %s: return id */
					__( 'Return #%d', 'webino-dashboard' ),
					(int) $row['id']
				),
				'order_id'       => (int) $order->get_id(),
				'line_items'     => $line_items,
				'refund_payment' => true,
			)
		);
		if ( is_wp_error( $refund ) ) {
			return $refund;
		}

		self::ensure_table();
		global $wpdb;
		$now = current_time( 'mysql', true );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			self::table(),
			array(
				'status'       => self::STATUS_REFUNDED,
				'resolution'   => self::RESOLUTION_REFUND,
				'wc_refund_id' => (int) $refund->get_id(),
				'updated_at'   => $now,
			),
			array( 'id' => (int) $row['id'] ),
			array( '%s', '%s', '%d', '%s' ),
			array( '%d' )
		);
		return self::get( (int) $row['id'] );
	}

	/**
	 * @param WC_Order            $order Order.
	 * @param array<string,mixed> $row   Return row.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function process_exchange( $order, array $row ) {
		$product_id   = (int) $row['product_id'];
		$variation_id = (int) $row['variation_id'];
		$qty          = (float) $row['qty'];
		$product      = $variation_id ? wc_get_product( $variation_id ) : wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'bad_product', __( 'Product not found for exchange.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		if ( $product->managing_stock() ) {
			wc_update_product_stock( $product, $qty, 'increase' );
		}

		$exchange = wc_create_order(
			array(
				'customer_id' => (int) $order->get_customer_id(),
				'created_via' => 'webino_return',
			)
		);
		if ( is_wp_error( $exchange ) || ! $exchange ) {
			return new WP_Error( 'exchange_failed', __( 'Could not create exchange order.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		$exchange->add_product( $product, $qty );
		$exchange->set_address( $order->get_address( 'billing' ), 'billing' );
		$exchange->set_address( $order->get_address( 'shipping' ), 'shipping' );
		$exchange->update_meta_data( '_webino_exchange_from_return', (int) $row['id'] );
		$exchange->update_meta_data( '_webino_exchange_parent_order', (int) $order->get_id() );
		$exchange->calculate_totals();
		$exchange->set_status( 'processing' );
		$exchange->save();

		self::ensure_table();
		global $wpdb;
		$now = current_time( 'mysql', true );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			self::table(),
			array(
				'status'              => self::STATUS_EXCHANGED,
				'resolution'          => self::RESOLUTION_EXCHANGE,
				'exchange_order_id'   => (int) $exchange->get_id(),
				'updated_at'          => $now,
			),
			array( 'id' => (int) $row['id'] ),
			array( '%s', '%s', '%d', '%s' ),
			array( '%d' )
		);
		return self::get( (int) $row['id'] );
	}

	/**
	 * @param WC_Order $order Order.
	 * @return void
	 */
	private static function maybe_mark_order_fully_refunded( $order ) {
		$all_refunded = true;
		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof WC_Order_Item_Product ) {
				continue;
			}
			if ( self::returnable_qty( $order, (int) $item->get_id() ) > 0 ) {
				$all_refunded = false;
				break;
			}
		}
		if ( $all_refunded ) {
			$order->set_status( 'refunded' );
			$order->save();
		}
	}

	/**
	 * @param string              $event_key Event key.
	 * @param WC_Order            $order     Order.
	 * @param array<string,mixed> $row       Return row.
	 * @return void
	 */
	public static function notify_event( $event_key, $order, array $row ) {
		$snapshot = self::build_notify_snapshot( $order, $row );
		$link     = class_exists( 'Webino_Dashboard_Rewrite', false )
			? Webino_Dashboard_Rewrite::url( 'orders/list/' . (int) $order->get_id() )
			: '';
		$vars     = array(
			'order_number'    => $order->get_order_number(),
			'order_id'        => (string) $order->get_id(),
			'order_status'    => wc_get_order_status_name( $order->get_status() ),
			'customer_name'   => trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ),
			'order_total'     => wp_strip_all_tags( $order->get_formatted_order_total() ),
			'return_item'     => (string) ( $row['item_name'] ?? '' ),
			'return_qty'      => (string) ( $row['qty'] ?? '' ),
			'return_reason'   => (string) ( $row['reason'] ?? '' ),
			'return_status'   => self::status_label( (string) ( $row['status'] ?? '' ) ),
			'link'            => $link,
		);

		if ( class_exists( 'Webino_Dashboard_Sms_Order_Hooks', false ) ) {
			Webino_Dashboard_Sms_Order_Hooks::notify_snapshot( $event_key, $snapshot );
		}
		if ( class_exists( 'Webino_Dashboard_Bots_Order_Notify', false ) ) {
			Webino_Dashboard_Bots_Order_Notify::notify( $event_key, $snapshot );
		}
		if ( class_exists( 'Webino_Dashboard_Notify', false ) ) {
			Webino_Dashboard_Notify::dispatch(
				$event_key,
				$vars,
				$link,
				(int) $order->get_customer_id(),
				(string) $order->get_billing_email()
			);
		}
	}

	/**
	 * @param WC_Order            $order Order.
	 * @param array<string,mixed> $row   Return row.
	 * @return array<string,mixed>
	 */
	public static function build_notify_snapshot( $order, array $row ) {
		$snapshot = class_exists( 'Webino_Dashboard_Sms_Order_Hooks', false )
			? Webino_Dashboard_Sms_Order_Hooks::build_snapshot( $order )
			: array();
		$snapshot['return_id']     = (string) ( $row['id'] ?? '' );
		$snapshot['return_item']   = (string) ( $row['item_name'] ?? '' );
		$snapshot['return_qty']    = (string) ( $row['qty'] ?? '' );
		$snapshot['return_reason'] = (string) ( $row['reason'] ?? '' );
		$snapshot['return_status'] = self::status_label( (string) ( $row['status'] ?? '' ) );
		return $snapshot;
	}

	/**
	 * Pending returns for home dashboard.
	 *
	 * @param array<int,string> $statuses Statuses.
	 * @param int               $limit    Limit.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_by_statuses( array $statuses, $limit = 20 ) {
		self::ensure_table();
		if ( ! $statuses ) {
			return array();
		}
		global $wpdb;
		$table    = self::table();
		$placeholders = implode( ',', array_fill( 0, count( $statuses ), '%s' ) );
		$args     = array_merge( $statuses, array( (int) $limit ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE status IN ({$placeholders}) ORDER BY id DESC LIMIT %d",
				...$args
			),
			ARRAY_A
		);
		$out = array();
		foreach ( (array) $rows as $row ) {
			$mapped = self::map_row( $row );
			$order  = wc_get_order( (int) $mapped['order_id'] );
			if ( $order ) {
				$mapped['order_number'] = $order->get_order_number();
			}
			$out[] = $mapped;
		}
		return $out;
	}

	public static function count_by_statuses( array $statuses ) {
		self::ensure_table();
		if ( ! $statuses ) {
			return 0;
		}
		global $wpdb;
		$table        = self::table();
		$placeholders = implode( ',', array_fill( 0, count( $statuses ), '%s' ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$count = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE status IN ({$placeholders})",
				...$statuses
			)
		);
		return (int) $count;
	}

	/**
	 * Store return shipping address for approved returns.
	 *
	 * @return string
	 */
	public static function return_address_text() {
		$addr = apply_filters( 'webino_dashboard_return_shipping_address', '' );
		if ( is_string( $addr ) && '' !== trim( $addr ) ) {
			return trim( $addr );
		}
		return (string) get_option( 'woocommerce_store_address', '' );
	}
}
