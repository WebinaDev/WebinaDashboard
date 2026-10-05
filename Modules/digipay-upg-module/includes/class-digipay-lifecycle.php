<?php
/**
 * DigiPay post-payment lifecycle.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digipay_Lifecycle {

	const LOG_OPTION = 'webino_digipay_upg_logs';

	/**
	 * @param int      $order_id Order id.
	 * @param string   $endpoint Endpoint.
	 * @param bool     $success Success.
	 * @param string   $message Message.
	 * @param int|null $status Status.
	 * @return void
	 */
	public static function log_event( $order_id, $endpoint, $success, $message, $status = null ) {
		$logs = get_option( self::LOG_OPTION, array() );
		if ( ! is_array( $logs ) ) {
			$logs = array();
		}
		array_unshift(
			$logs,
			array(
				'time'      => gmdate( 'c' ),
				'order_id'  => (int) $order_id,
				'endpoint'  => (string) $endpoint,
				'success'   => (bool) $success,
				'message'   => (string) $message,
				'http_code' => null === $status ? null : (int) $status,
			)
		);
		$logs = array_slice( $logs, 0, 200 );
		update_option( self::LOG_OPTION, $logs, false );
	}

	/**
	 * @param int $order_id Order id.
	 * @return void
	 */
	public static function maybe_deliver_order( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order ) {
			return;
		}
		$type = (int) $order->get_meta( '_digipay_type' );
		if ( ! in_array( $type, array( 5, 13 ), true ) ) {
			return;
		}
		if ( 'yes' === $order->get_meta( '_digipay_delivered' ) ) {
			return;
		}
		$payload = array(
			'deliveryDate' => round( microtime( true ) * 1000 ),
			'invoiceNumber' => (string) $order->get_order_number(),
			'trackingCode' => (string) $order->get_meta( '_digipay_tracking_code' ),
			'products' => array_values(
				array_map(
					static function ( $item ) {
						return (string) $item->get_product_id();
					},
					$order->get_items()
				)
			),
		);
		$res = Digipay_Api_Client::deliver_purchase( $type, $payload );
		if ( is_wp_error( $res ) ) {
			self::log_event( $order_id, 'purchases/deliver', false, $res->get_error_message() );
			$order->add_order_note( 'DigiPay deliver failed: ' . $res->get_error_message() );
			return;
		}
		$order->update_meta_data( '_digipay_delivered', 'yes' );
		$order->save();
		self::log_event( $order_id, 'purchases/deliver', true, 'Delivered to DigiPay' );
	}

	/**
	 * @param int $refund_id Refund id.
	 * @param array<string,mixed> $args Args.
	 * @return void
	 */
	public static function on_refund_created( $refund_id, $args ) {
		$refund = wc_get_order( $refund_id );
		if ( ! $refund instanceof WC_Order_Refund ) {
			return;
		}
		$order = wc_get_order( $refund->get_parent_id() );
		if ( ! $order instanceof WC_Order ) {
			return;
		}
		$tracking = (string) $order->get_meta( '_digipay_tracking_code' );
		$provider = (string) $order->get_meta( '_digipay_provider_id' );
		$type     = (int) $order->get_meta( '_digipay_type' );
		if ( '' === $tracking || '' === $provider ) {
			return;
		}
		$payload = array(
			'trackingCode' => $tracking,
			'providerId'   => $provider,
			'amount'       => abs( (int) round(
				class_exists( 'Webino_Payment_Money', false )
					? Webino_Payment_Money::to_rial( (float) $refund->get_amount(), $order->get_currency() )
					: ( (float) $refund->get_amount() * ( in_array( strtoupper( (string) get_woocommerce_currency() ), array( 'IRT', 'TOMAN' ), true ) ? 10 : 1 ) )
			) ),
		);
		$within_reverse_window = in_array( $type, array( 0, 1 ), true ) && ( time() - $order->get_date_created()->getTimestamp() ) < ( 25 * 60 );
		$res = $within_reverse_window ? Digipay_Api_Client::reverse_purchase( $type, $payload ) : Digipay_Api_Client::refund_purchase( $type, $payload );
		if ( is_wp_error( $res ) ) {
			self::log_event( $order->get_id(), $within_reverse_window ? 'reverse' : 'refunds', false, $res->get_error_message() );
			$order->add_order_note( 'DigiPay refund failed: ' . $res->get_error_message() );
			return;
		}
		self::log_event( $order->get_id(), $within_reverse_window ? 'reverse' : 'refunds', true, 'Refund synced with DigiPay' );
	}
}
