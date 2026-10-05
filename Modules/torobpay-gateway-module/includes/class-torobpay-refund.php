<?php
/**
 * Safe TorobPay cancel-then-local-refund.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_TorobPay_Refund {

	/**
	 * @param int    $order_id Order id.
	 * @param float  $amount Amount (store currency) or 0 for full.
	 * @param string $reason Reason.
	 * @return true|WP_Error
	 */
	public static function refund_order( $order_id, $amount = 0, $reason = '' ) {
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order ) {
			return new WP_Error( 'torobpay_order_missing', __( 'Order not found.', 'webino-dashboard' ) );
		}
		if ( Webino_TorobPay_Config::GATEWAY_ID !== $order->get_payment_method() ) {
			return new WP_Error( 'torobpay_wrong_gateway', __( 'Not a TorobPay order.', 'webino-dashboard' ) );
		}
		$token = (string) $order->get_meta( '_order_torobpay_token' );
		if ( '' === $token ) {
			return new WP_Error( 'torobpay_no_token', __( 'Missing TorobPay token.', 'webino-dashboard' ) );
		}

		$status = Webino_TorobPay_Api_Client::status( $token );
		$remote = '';
		if ( ! is_wp_error( $status ) ) {
			$remote = isset( $status['response']['status'] ) ? (string) $status['response']['status'] : (string) ( $status['status'] ?? '' );
		}

		if ( 'REVERT' !== $remote ) {
			$cancel = Webino_TorobPay_Api_Client::cancel( $token );
			if ( is_wp_error( $cancel ) ) {
				return $cancel;
			}
			// Poll briefly for REVERT.
			for ( $i = 0; $i < 5; $i++ ) {
				usleep( 400000 );
				$status = Webino_TorobPay_Api_Client::status( $token );
				if ( is_wp_error( $status ) ) {
					continue;
				}
				$remote = isset( $status['response']['status'] ) ? (string) $status['response']['status'] : (string) ( $status['status'] ?? '' );
				if ( 'REVERT' === $remote ) {
					break;
				}
			}
		}

		$order->update_meta_data( '_torobpay_cancel_confirmed', 'yes' );
		$order->update_meta_data( '_torobpay_cached_status', 'REVERT' );
		$order->save();

		$refund_amount = $amount > 0 ? (float) $amount : (float) $order->get_remaining_refund_amount();
		if ( $refund_amount <= 0 ) {
			return true;
		}
		$refund = wc_create_refund(
			array(
				'amount'   => $refund_amount,
				'reason'   => $reason ? $reason : 'TorobPay cancel + refund',
				'order_id' => $order->get_id(),
			)
		);
		if ( is_wp_error( $refund ) ) {
			return $refund;
		}
		Webino_Payment_Money::push_log(
			Webino_TorobPay_Config::LOG_OPTION,
			array(
				'action'   => 'refund',
				'order_id' => $order->get_id(),
				'ok'       => true,
				'detail'   => 'amount=' . $refund_amount,
			)
		);
		return true;
	}
}
