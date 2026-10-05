<?php
/**
 * Background jobs for ZarinPal (reconcile unverified authorities).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Simple option-backed job queue.
 */
final class Zarinpal_Jobs {
	const OPTION_QUEUE  = 'webino_zarinpal_jobs';
	const OPTION_LAST   = 'webino_zarinpal_last_reconcile';

	/**
	 * @param string               $type    Job type.
	 * @param array<string,mixed>  $payload Payload.
	 * @param int                  $delay   Delay seconds.
	 * @return void
	 */
	public static function enqueue( $type, array $payload = array(), $delay = 0 ) {
		$q = get_option( self::OPTION_QUEUE, array() );
		if ( ! is_array( $q ) ) {
			$q = array();
		}
		$q[] = array(
			'id'        => wp_generate_uuid4(),
			'type'      => sanitize_key( (string) $type ),
			'payload'   => $payload,
			'run_after' => time() + max( 0, (int) $delay ),
		);
		update_option( self::OPTION_QUEUE, $q, false );
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function all() {
		$q = get_option( self::OPTION_QUEUE, array() );
		return is_array( $q ) ? $q : array();
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function last_reconcile() {
		$last = get_option( self::OPTION_LAST, array() );
		return is_array( $last ) ? $last : array();
	}

	/**
	 * @return void
	 */
	public static function process_due() {
		$q   = self::all();
		$out = array();
		$now = time();
		foreach ( $q as $job ) {
			if ( (int) ( $job['run_after'] ?? 0 ) > $now ) {
				$out[] = $job;
				continue;
			}
			if ( 'reconcile' === (string) ( $job['type'] ?? '' ) ) {
				self::run_reconcile();
			}
		}
		update_option( self::OPTION_QUEUE, $out, false );
	}

	/**
	 * Pull unVerified authorities and complete matching pending orders.
	 *
	 * @return array<string,mixed>
	 */
	public static function run_reconcile() {
		$result = array(
			'checked_at'  => gmdate( 'c' ),
			'authorities' => 0,
			'matched'     => 0,
			'completed'   => 0,
			'skipped'     => 0,
			'errors'      => array(),
		);

		$unverified = Zarinpal_Gateway_Service::unverified();
		if ( is_wp_error( $unverified ) ) {
			$result['errors'][] = $unverified->get_error_message();
			update_option( self::OPTION_LAST, $result, false );
			do_action( 'webino_zarinpal_reconcile', $result );
			return $result;
		}

		$result['authorities'] = count( $unverified );

		foreach ( $unverified as $row ) {
			$authority = is_array( $row )
				? (string) ( $row['authority'] ?? $row['Authority'] ?? '' )
				: (string) $row;
			$authority = sanitize_text_field( $authority );
			if ( '' === $authority ) {
				++$result['skipped'];
				continue;
			}

			$order = self::find_order_by_authority( $authority );
			if ( ! $order ) {
				++$result['skipped'];
				continue;
			}
			++$result['matched'];

			if ( $order->is_paid() ) {
				++$result['skipped'];
				continue;
			}

			$status = $order->get_status();
			if ( ! in_array( $status, array( 'pending', 'on-hold', 'failed', 'cancelled' ), true ) ) {
				++$result['skipped'];
				continue;
			}

			// Prefer inquiry then verify.
			$inquiry = Zarinpal_Gateway_Service::inquiry( $authority );
			if ( is_wp_error( $inquiry ) ) {
				$result['errors'][] = sprintf( '#%d: %s', $order->get_id(), $inquiry->get_error_message() );
				continue;
			}

			$inq_status = strtoupper( (string) ( $inquiry['data']['status'] ?? $inquiry['status'] ?? '' ) );
			if ( $inq_status && ! in_array( $inq_status, array( 'PAID', 'VERIFIED', 'OK', 'SUCCESS' ), true ) ) {
				// Still try verify — unVerified list implies paid but not verified.
			}

			$verify = Zarinpal_Gateway_Service::verify_payment( $order, $authority );
			if ( is_wp_error( $verify ) ) {
				$result['errors'][] = sprintf( '#%d: %s', $order->get_id(), $verify->get_error_message() );
				continue;
			}
			++$result['completed'];
		}

		update_option( self::OPTION_LAST, $result, false );
		do_action( 'webino_zarinpal_reconcile', $result );
		return $result;
	}

	/**
	 * @param string $authority Authority.
	 * @return WC_Order|null
	 */
	private static function find_order_by_authority( $authority ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return null;
		}
		$orders = wc_get_orders(
			array(
				'limit'      => 1,
				'status'     => array( 'pending', 'on-hold', 'failed', 'cancelled' ),
				'meta_key'   => '_zarinpal_authority', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value' => $authority, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			)
		);
		if ( ! empty( $orders[0] ) && $orders[0] instanceof WC_Order ) {
			return $orders[0];
		}

		// Fallback: authority history.
		$orders = wc_get_orders(
			array(
				'limit'    => 20,
				'status'   => array( 'pending', 'on-hold', 'failed', 'cancelled' ),
				'meta_key' => '_zarinpal_authority_history', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			)
		);
		foreach ( $orders as $order ) {
			if ( ! $order instanceof WC_Order ) {
				continue;
			}
			$history = $order->get_meta( '_zarinpal_authority_history' );
			if ( is_array( $history ) && in_array( $authority, $history, true ) ) {
				return $order;
			}
		}
		return null;
	}
}
