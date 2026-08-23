<?php
/**
 * Store credit wallet (ledger + withdrawals).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Customer wallet balance and transactions.
 */
class Webino_Dashboard_Wallet {

	const META_BALANCE     = 'webino_wallet_balance';
	const TOPUP_META       = '_webino_wallet_topup';
	const TOPUP_AMOUNT_META = '_webino_wallet_topup_amount';
	const GATEWAY_ID       = 'webino_wallet';

	/**
	 * @return string
	 */
	public static function ledger_table() {
		global $wpdb;
		return $wpdb->prefix . 'webino_wallet_ledger';
	}

	/**
	 * @return string
	 */
	public static function withdrawals_table() {
		global $wpdb;
		return $wpdb->prefix . 'webino_wallet_withdrawals';
	}

	/**
	 * @return void
	 */
	public static function ensure_tables() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset_collate = $wpdb->get_charset_collate();
		$p               = $wpdb->prefix;

		dbDelta(
			"CREATE TABLE {$p}webino_wallet_ledger (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				user_id bigint(20) unsigned NOT NULL,
				direction varchar(10) NOT NULL DEFAULT 'credit',
				amount decimal(18,2) NOT NULL DEFAULT 0,
				balance_after decimal(18,2) NOT NULL DEFAULT 0,
				reason varchar(100) NOT NULL DEFAULT '',
				ref_type varchar(50) NULL,
				ref_id bigint(20) unsigned NULL,
				note text NULL,
				created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
				PRIMARY KEY  (id),
				KEY user_id (user_id)
			) {$charset_collate};"
		);

		dbDelta(
			"CREATE TABLE {$p}webino_wallet_withdrawals (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				user_id bigint(20) unsigned NOT NULL,
				amount decimal(18,2) NOT NULL DEFAULT 0,
				sheba varchar(30) NOT NULL DEFAULT '',
				status varchar(20) NOT NULL DEFAULT 'pending',
				admin_note text NULL,
				created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				PRIMARY KEY  (id),
				KEY user_id (user_id),
				KEY status (status)
			) {$charset_collate};"
		);
	}

	/**
	 * @return void
	 */
	public static function init_hooks() {
		add_action( 'woocommerce_payment_complete', array( __CLASS__, 'maybe_credit_topup' ), 20 );
		add_action( 'woocommerce_order_status_completed', array( __CLASS__, 'maybe_credit_topup' ), 20 );
		add_filter( 'woocommerce_payment_gateways', array( __CLASS__, 'register_gateway' ) );
		add_action( 'woocommerce_order_refunded', array( __CLASS__, 'maybe_refund_to_wallet' ), 20, 2 );
		add_action( 'woocommerce_order_status_cancelled', array( __CLASS__, 'maybe_restore_checkout_debit' ), 20 );
		add_action( 'woocommerce_order_status_failed', array( __CLASS__, 'maybe_restore_checkout_debit' ), 20 );
	}

	/**
	 * @param array<int, string> $gateways Gateways.
	 * @return array<int, string>
	 */
	public static function register_gateway( $gateways ) {
		if ( class_exists( 'Webino_Wallet_Module', false ) ) {
			return $gateways;
		}
		if ( ! class_exists( 'WC_Gateway_Webino_Wallet', false ) ) {
			require_once WEBINO_DASHBOARD_DIR . 'includes/woocommerce/class-wc-gateway-webino-wallet.php';
		}
		$gateways[] = 'WC_Gateway_Webino_Wallet';
		return $gateways;
	}

	/**
	 * @param int $user_id User ID.
	 * @return float
	 */
	public static function get_balance( $user_id ) {
		self::ensure_tables();
		return max( 0, (float) get_user_meta( (int) $user_id, self::META_BALANCE, true ) );
	}

	/**
	 * @param int    $user_id User ID.
	 * @param float  $amount Amount.
	 * @param string $direction credit|debit.
	 * @param string $reason Reason slug.
	 * @param string $ref_type Ref type.
	 * @param int    $ref_id Ref ID.
	 * @param string $note Note.
	 * @return float|WP_Error Balance after.
	 */
	public static function adjust( $user_id, $amount, $direction, $reason, $ref_type = '', $ref_id = 0, $note = '' ) {
		global $wpdb;
		self::ensure_tables();
		$user_id   = (int) $user_id;
		$amount    = abs( (float) $amount );
		$direction = 'debit' === $direction ? 'debit' : 'credit';
		if ( $user_id <= 0 || $amount <= 0 ) {
			return new WP_Error( 'invalid_amount', __( 'Invalid amount.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$current = self::get_balance( $user_id );
		if ( 'debit' === $direction && $amount > $current ) {
			return new WP_Error( 'insufficient_balance', __( 'Insufficient wallet balance.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$after = 'credit' === $direction ? $current + $amount : $current - $amount;
		update_user_meta( $user_id, self::META_BALANCE, $after );

		$wpdb->insert(
			self::ledger_table(),
			array(
				'user_id'        => $user_id,
				'direction'      => $direction,
				'amount'         => $amount,
				'balance_after'  => $after,
				'reason'         => sanitize_key( (string) $reason ),
				'ref_type'       => sanitize_key( (string) $ref_type ),
				'ref_id'         => (int) $ref_id,
				'note'           => sanitize_textarea_field( (string) $note ),
				'created_at'     => current_time( 'mysql' ),
			),
			array( '%d', '%s', '%f', '%f', '%s', '%s', '%d', '%s', '%s' )
		);

		if ( class_exists( 'Webino_Dashboard_Notifications', false ) ) {
			if ( 'credit' === $direction && 'topup' === $reason ) {
				Webino_Dashboard_Notifications::create(
					$user_id,
					'wallet',
					__( 'Wallet topped up', 'webino-dashboard' ),
					/* translators: %s: amount */
					sprintf( __( 'Your wallet was credited.', 'webino-dashboard' ) ),
					home_url( '/dashboard/account/wallet' )
				);
			}
		}

		return $after;
	}

	/**
	 * @param int $user_id User ID.
	 * @param int $page Page.
	 * @param int $per_page Per page.
	 * @return array{items: array<int, array<string, mixed>>, total: int}
	 */
	public static function ledger_for_user( $user_id, $page = 1, $per_page = 20 ) {
		global $wpdb;
		self::ensure_tables();
		$user_id  = (int) $user_id;
		$page     = max( 1, (int) $page );
		$per_page = max( 1, min( 50, (int) $per_page ) );
		$offset   = ( $page - 1 ) * $per_page;
		$table    = self::ledger_table();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$total = (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE user_id = %d", $user_id )
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
			$items[] = array(
				'id'            => (int) ( $row['id'] ?? 0 ),
				'direction'     => (string) ( $row['direction'] ?? '' ),
				'amount'        => (float) ( $row['amount'] ?? 0 ),
				'balance_after' => (float) ( $row['balance_after'] ?? 0 ),
				'reason'        => (string) ( $row['reason'] ?? '' ),
				'ref_type'      => (string) ( $row['ref_type'] ?? '' ),
				'ref_id'        => (int) ( $row['ref_id'] ?? 0 ),
				'note'          => (string) ( $row['note'] ?? '' ),
				'created_at'    => (string) ( $row['created_at'] ?? '' ),
			);
		}
		return array(
			'items' => $items,
			'total' => $total,
		);
	}

	/**
	 * @param int   $user_id User ID.
	 * @param float $amount Amount.
	 * @return array{order_id: int, payment_url: string}|WP_Error
	 */
	public static function create_topup_order( $user_id, $amount ) {
		if ( ! function_exists( 'wc_create_order' ) ) {
			return new WP_Error( 'woocommerce', __( 'WooCommerce is not available.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$amount = (float) $amount;
		$min    = class_exists( 'Webino_Wallet_Config', false ) ? Webino_Wallet_Config::min_topup() : 1000;
		if ( $amount < $min ) {
			return new WP_Error(
				'min_topup',
				sprintf(
					/* translators: %s: amount */
					__( 'Minimum top-up is %s.', 'webino-dashboard' ),
					(string) $min
				),
				array( 'status' => 400 )
			);
		}
		$user = get_userdata( (int) $user_id );
		if ( ! $user ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$order = wc_create_order( array( 'customer_id' => (int) $user_id ) );
		if ( is_wp_error( $order ) ) {
			return $order;
		}
		$item = new WC_Order_Item_Fee();
		$item->set_name( __( 'Wallet top-up', 'webino-dashboard' ) );
		$item->set_total( $amount );
		$order->add_item( $item );
		$order->calculate_totals();
		$order->update_meta_data( self::TOPUP_META, '1' );
		$order->update_meta_data( self::TOPUP_AMOUNT_META, $amount );
		$order->save();

		$pay_url = $order->get_checkout_payment_url();
		return array(
			'order_id'    => (int) $order->get_id(),
			'payment_url' => (string) $pay_url,
		);
	}

	/**
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public static function maybe_credit_topup( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		if ( '1' !== (string) $order->get_meta( self::TOPUP_META ) ) {
			return;
		}
		if ( 'yes' === (string) $order->get_meta( '_webino_wallet_topup_credited' ) ) {
			return;
		}
		if ( ! in_array( $order->get_status(), array( 'processing', 'completed' ), true ) ) {
			return;
		}
		$uid    = (int) $order->get_customer_id();
		$amount = (float) $order->get_meta( self::TOPUP_AMOUNT_META );
		if ( $uid <= 0 || $amount <= 0 ) {
			$amount = (float) $order->get_total();
		}
		self::adjust( $uid, $amount, 'credit', 'topup', 'order', (int) $order->get_id() );
		$order->update_meta_data( '_webino_wallet_topup_credited', 'yes' );
		$order->save();
	}

	/**
	 * @param int   $user_id User ID.
	 * @param float $amount Amount.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function request_withdrawal( $user_id, $amount ) {
		global $wpdb;
		self::ensure_tables();
		$user_id = (int) $user_id;
		$amount  = (float) $amount;
		$sheba   = (string) get_user_meta( $user_id, Webino_Dashboard_Users::META_BANK_SHEBA, true );
		$sheba   = preg_replace( '/\s+/', '', strtoupper( $sheba ) );
		if ( '' === $sheba ) {
			return new WP_Error( 'no_sheba', __( 'Bank Sheba is required for withdrawal.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( $amount < 10000 ) {
			return new WP_Error( 'min_withdraw', __( 'Minimum withdrawal is 10,000.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$balance = self::get_balance( $user_id );
		if ( $amount > $balance ) {
			return new WP_Error( 'insufficient_balance', __( 'Insufficient wallet balance.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$adj = self::adjust( $user_id, $amount, 'debit', 'withdraw_request', 'withdraw', 0 );
		if ( is_wp_error( $adj ) ) {
			return $adj;
		}

		$wpdb->insert(
			self::withdrawals_table(),
			array(
				'user_id'    => $user_id,
				'amount'     => $amount,
				'sheba'      => $sheba,
				'status'     => 'pending',
				'created_at' => current_time( 'mysql' ),
				'updated_at' => current_time( 'mysql' ),
			),
			array( '%d', '%f', '%s', '%s', '%s', '%s' )
		);
		$id = (int) $wpdb->insert_id;

		if ( class_exists( 'Webino_Dashboard_Notifications', false ) ) {
			Webino_Dashboard_Notifications::create(
				$user_id,
				'wallet',
				__( 'Withdrawal requested', 'webino-dashboard' ),
				__( 'Your withdrawal request is pending review.', 'webino-dashboard' ),
				home_url( '/dashboard/account/wallet' )
			);
		}

		return array(
			'id'     => $id,
			'amount' => $amount,
			'status' => 'pending',
		);
	}

	/**
	 * @param int    $order_id Order ID.
	 * @param int    $refund_id Refund ID.
	 * @return void
	 */
	public static function maybe_refund_to_wallet( $order_id, $refund_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		$uid = (int) $order->get_customer_id();
		if ( $uid <= 0 ) {
			return;
		}
		if ( 'wallet' !== (string) get_user_meta( $uid, Webino_Dashboard_Users::META_REFUND_METHOD, true ) ) {
			return;
		}
		$refund = wc_get_order( $refund_id );
		if ( ! $refund ) {
			return;
		}
		$amount = (float) $refund->get_amount();
		if ( $amount <= 0 ) {
			return;
		}
		if ( 'yes' === (string) $refund->get_meta( '_webino_wallet_refund_credited' ) ) {
			return;
		}
		self::adjust( $uid, $amount, 'credit', 'order_refund', 'refund', (int) $refund_id );
		$refund->update_meta_data( '_webino_wallet_refund_credited', 'yes' );
		$refund->save();
	}

	/**
	 * Staff: list pending withdrawals.
	 *
	 * @param string $status Status filter.
	 * @return array{items: array<int, array<string, mixed>>}
	 */
	public static function list_withdrawals( $status = 'pending' ) {
		global $wpdb;
		self::ensure_tables();
		$table  = self::withdrawals_table();
		$status = sanitize_key( (string) $status );
		if ( '' === $status ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$rows = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT 100", ARRAY_A );
		} else {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$rows = $wpdb->get_results(
				$wpdb->prepare( "SELECT * FROM {$table} WHERE status = %s ORDER BY id DESC LIMIT 100", $status ),
				ARRAY_A
			);
		}
		$items = array();
		foreach ( (array) $rows as $row ) {
			$uid  = (int) ( $row['user_id'] ?? 0 );
			$user = get_userdata( $uid );
			$items[] = array(
				'id'         => (int) ( $row['id'] ?? 0 ),
				'user_id'    => $uid,
				'user_name'  => $user ? $user->display_name : '',
				'amount'     => (float) ( $row['amount'] ?? 0 ),
				'sheba'      => (string) ( $row['sheba'] ?? '' ),
				'status'     => (string) ( $row['status'] ?? '' ),
				'admin_note' => (string) ( $row['admin_note'] ?? '' ),
				'created_at' => (string) ( $row['created_at'] ?? '' ),
				'updated_at' => (string) ( $row['updated_at'] ?? '' ),
			);
		}
		return array( 'items' => $items );
	}

	/**
	 * @param int    $id Withdrawal ID.
	 * @param string $status New status.
	 * @param string $admin_note Note.
	 * @return true|WP_Error
	 */
	public static function update_withdrawal_status( $id, $status, $admin_note = '' ) {
		global $wpdb;
		self::ensure_tables();
		$id     = (int) $id;
		$status = sanitize_key( (string) $status );
		if ( ! in_array( $status, array( 'pending', 'approved', 'rejected', 'paid' ), true ) ) {
			return new WP_Error( 'invalid_status', __( 'Invalid status.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare( 'SELECT * FROM ' . self::withdrawals_table() . ' WHERE id = %d', $id ),
			ARRAY_A
		);
		if ( ! $row ) {
			return new WP_Error( 'not_found', __( 'Not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$prev = (string) ( $row['status'] ?? '' );
		$uid  = (int) ( $row['user_id'] ?? 0 );
		$amt  = (float) ( $row['amount'] ?? 0 );

		if ( 'rejected' === $status && 'rejected' !== $prev ) {
			self::adjust( $uid, $amt, 'credit', 'withdraw_rejected', 'withdraw', $id );
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			self::withdrawals_table(),
			array(
				'status'     => $status,
				'admin_note' => sanitize_textarea_field( (string) $admin_note ),
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $id ),
			array( '%s', '%s', '%s' ),
			array( '%d' )
		);

		if ( class_exists( 'Webino_Dashboard_Notifications', false ) && $uid > 0 ) {
			Webino_Dashboard_Notifications::create(
				$uid,
				'wallet',
				__( 'Withdrawal update', 'webino-dashboard' ),
				$status,
				home_url( '/dashboard/account/wallet' )
			);
		}

		return true;
	}

	/**
	 * Restore wallet debit when a paid wallet order is cancelled or failed.
	 *
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public static function maybe_restore_checkout_debit( $order_id ) {
		$order = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : false;
		if ( ! $order || self::GATEWAY_ID !== $order->get_payment_method() ) {
			return;
		}
		if ( '1' === (string) $order->get_meta( self::TOPUP_META ) ) {
			return;
		}
		if ( 'yes' === (string) $order->get_meta( '_webino_wallet_debit_restored' ) ) {
			return;
		}
		$uid = (int) $order->get_customer_id();
		$amt = (float) $order->get_meta( '_webino_wallet_debited_amount' );
		if ( $amt <= 0 ) {
			$amt = (float) $order->get_total();
		}
		if ( $uid < 1 || $amt <= 0 ) {
			return;
		}
		self::adjust( $uid, $amt, 'credit', 'checkout_restore', 'order', (int) $order_id );
		$order->update_meta_data( '_webino_wallet_debit_restored', 'yes' );
		$order->add_order_note( __( 'Wallet debit restored after order cancel/fail.', 'webino-dashboard' ) );
		$order->save();
	}
}
