<?php
/**
 * In-app user notifications.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Notifications stored in custom table.
 */
class Webino_Dashboard_Notifications {

	/**
	 * @return string
	 */
	public static function table() {
		global $wpdb;
		return $wpdb->prefix . 'webino_notifications';
	}

	/**
	 * @return void
	 */
	public static function ensure_table() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$table = self::table();
		$charset_collate = $wpdb->get_charset_collate();
		$sql = "CREATE TABLE {$table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			type varchar(50) NOT NULL DEFAULT 'info',
			title varchar(255) NOT NULL DEFAULT '',
			body text NULL,
			link varchar(500) NULL,
			read_at datetime NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY read_at (read_at)
		) {$charset_collate};";
		dbDelta( $sql );
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $type Type slug.
	 * @param string $title Title.
	 * @param string $body Body.
	 * @param string $link Optional link.
	 * @return int Notification ID.
	 */
	public static function create( $user_id, $type, $title, $body = '', $link = '' ) {
		global $wpdb;
		self::ensure_table();
		$user_id = (int) $user_id;
		if ( $user_id <= 0 ) {
			return 0;
		}
		$wpdb->insert(
			self::table(),
			array(
				'user_id'    => $user_id,
				'type'       => sanitize_key( (string) $type ),
				'title'      => sanitize_text_field( (string) $title ),
				'body'       => sanitize_textarea_field( (string) $body ),
				'link'       => esc_url_raw( (string) $link ),
				'created_at' => current_time( 'mysql' ),
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s' )
		);
		return (int) $wpdb->insert_id;
	}

	/**
	 * @param int $user_id User ID.
	 * @param int $page Page.
	 * @param int $per_page Per page.
	 * @return array{items: array<int, array<string, mixed>>, total: int, unread: int}
	 */
	public static function list_for_user( $user_id, $page = 1, $per_page = 20 ) {
		global $wpdb;
		self::ensure_table();
		$user_id  = (int) $user_id;
		$page     = max( 1, (int) $page );
		$per_page = max( 1, min( 50, (int) $per_page ) );
		$offset   = ( $page - 1 ) * $per_page;
		$table    = self::table();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$total = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE user_id = %d",
				$user_id
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$unread = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE user_id = %d AND read_at IS NULL",
				$user_id
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE user_id = %d ORDER BY id DESC LIMIT %d OFFSET %d",
				$user_id,
				$per_page,
				$offset
			),
			ARRAY_A
		);
		$items = array();
		foreach ( (array) $rows as $row ) {
			$items[] = self::map_row( $row );
		}
		return array(
			'items'  => $items,
			'total'  => $total,
			'unread' => $unread,
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @param int $id Notification ID.
	 * @return bool
	 */
	public static function mark_read( $user_id, $id ) {
		global $wpdb;
		self::ensure_table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return false !== $wpdb->update(
			self::table(),
			array( 'read_at' => current_time( 'mysql' ) ),
			array(
				'id'      => (int) $id,
				'user_id' => (int) $user_id,
			),
			array( '%s' ),
			array( '%d', '%d' )
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @return int
	 */
	public static function mark_all_read( $user_id ) {
		global $wpdb;
		self::ensure_table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return (int) $wpdb->query(
			$wpdb->prepare(
				'UPDATE ' . self::table() . ' SET read_at = %s WHERE user_id = %d AND read_at IS NULL',
				current_time( 'mysql' ),
				(int) $user_id
			)
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @return int
	 */
	public static function unread_count( $user_id ) {
		global $wpdb;
		self::ensure_table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT COUNT(*) FROM ' . self::table() . ' WHERE user_id = %d AND read_at IS NULL',
				(int) $user_id
			)
		);
	}

	/**
	 * @param array<string, mixed> $row DB row.
	 * @return array<string, mixed>
	 */
	private static function map_row( $row ) {
		return array(
			'id'         => (int) ( $row['id'] ?? 0 ),
			'type'       => (string) ( $row['type'] ?? '' ),
			'title'      => (string) ( $row['title'] ?? '' ),
			'body'       => (string) ( $row['body'] ?? '' ),
			'link'       => (string) ( $row['link'] ?? '' ),
			'read'       => ! empty( $row['read_at'] ),
			'read_at'    => (string) ( $row['read_at'] ?? '' ),
			'created_at' => (string) ( $row['created_at'] ?? '' ),
		);
	}

	/**
	 * Hook order status changes for customer notifications.
	 *
	 * @return void
	 */
	public static function init_hooks() {
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'on_order_status_changed' ), 20, 4 );
	}

	/**
	 * @param int    $order_id Order ID.
	 * @param string $from From status.
	 * @param string $to To status.
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function on_order_status_changed( $order_id, $from, $to, $order ) {
		if ( ! $order instanceof WC_Order ) {
			$order = wc_get_order( $order_id );
		}
		if ( ! $order ) {
			return;
		}
		$uid = (int) $order->get_customer_id();
		if ( $uid <= 0 ) {
			return;
		}
		$label = function_exists( 'wc_get_order_status_name' ) ? wc_get_order_status_name( $to ) : $to;
		self::create(
			$uid,
			'order_status',
			/* translators: %s: order number */
			sprintf( __( 'Order #%s updated', 'webino-dashboard' ), $order->get_order_number() ),
			$label,
			home_url( '/dashboard/account/orders/' . (int) $order_id )
		);
	}
}
