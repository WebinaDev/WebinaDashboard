<?php
/**
 * Order sync for Digikala seller module — delegates to engine.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Order_Sync {

	/**
	 * @param int      $order_id Order id.
	 * @param string   $old Old status.
	 * @param string   $new New status.
	 * @param WC_Order $order Order object.
	 * @return void
	 */
	public static function on_order_status_changed( $order_id, $old, $new, $order ) {
		if ( class_exists( '\\WebinoDigikala\\Sync\\OrderSync' ) && \WebinoDigikala\Sync\OrderSync::is_importing() ) {
			return;
		}
		$settings = Digikala_Auth::settings();
		if ( empty( $settings['auto_sync'] ) ) {
			return;
		}
		if ( ! $order instanceof WC_Order ) {
			$order = wc_get_order( $order_id );
		}
		if ( ! $order || 'digikala' !== (string) $order->get_meta( '_wnc_platform' ) ) {
			return;
		}
		$payload = array(
			'order_id' => (int) $order_id,
			'status'   => (string) $new,
			'action'   => (string) $new,
		);
		if ( class_exists( '\\WebinoDigikala\\Jobs', false ) ) {
			\WebinoDigikala\Jobs::enqueue( 'order_push_status', $payload, 5 );
			return;
		}
		Digikala_Jobs::enqueue( 'order_push_status', $payload, 5 );
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function pull_orders( array $payload = array(), $job_id = 0 ) {
		if ( class_exists( '\\WebinoDigikala\\Sync\\OrderSync' ) ) {
			return \WebinoDigikala\Sync\OrderSync::pull( $payload, (int) $job_id );
		}
		return false;
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function push_order_status( array $payload = array(), $job_id = 0 ) {
		if ( class_exists( '\\WebinoDigikala\\Sync\\OrderSync' ) ) {
			return \WebinoDigikala\Sync\OrderSync::push_status( $payload, (int) $job_id );
		}
		return false;
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function cancel_order( array $payload = array(), $job_id = 0 ) {
		$order_id = (int) ( $payload['order_id'] ?? 0 );
		$order    = $order_id > 0 ? wc_get_order( $order_id ) : null;
		if ( ! $order || ! class_exists( '\\WebinoDigikala\\Sync\\OrderSync' ) ) {
			return false;
		}
		return \WebinoDigikala\Sync\OrderSync::cancel_items( $order, $payload, (int) $job_id );
	}
}
