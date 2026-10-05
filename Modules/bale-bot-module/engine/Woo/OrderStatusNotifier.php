<?php

namespace Webino_Dashboard_Bots_Bale\Woo;

use Webino_Dashboard_Bots_Bale\Core\Plugin;
use Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger;

/**
 * Send Bale templated messages when order status changes (per settings).
 */
class OrderStatusNotifier {

	private static $instance = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function init(): void {
		add_action( 'woocommerce_order_status_changed', array( $this, 'on_status_changed' ), 20, 4 );
	}

	/**
	 * @param int            $order_id
	 * @param string         $old_status
	 * @param string         $new_status
	 * @param \WC_Order|null $order
	 */
	public function on_status_changed( $order_id, $old_status, $new_status, $order ): void {
		if ( ! $order instanceof \WC_Order ) {
			$order = wc_get_order( $order_id );
		}
		if ( ! $order ) {
			return;
		}

		// Structured shop notify (SMS-parity) owns delivery when enabled for this status.
		if ( class_exists( 'Webino_Dashboard_Bots_Order_Notify', false )
			&& Webino_Dashboard_Bots_Order_Notify::handled_status( 'bale', (int) $order_id, (string) $new_status ) ) {
			return;
		}

		$s      = Plugin::get_settings();
		$notify = isset( $s['notify_status'][ $new_status ] ) ? $s['notify_status'][ $new_status ] : '0';
		if ( $notify !== '1' && $notify !== 1 ) {
			return;
		}

		$templates = isset( $s['order_status_templates'] ) && is_array( $s['order_status_templates'] ) ? $s['order_status_templates'] : array();
		if ( empty( $templates[ $new_status ] ) ) {
			return;
		}

		// Avoid duplicate sends if the same transition is processed twice in a short window.
		$dedup_key = 'woobale_ordst_' . (int) $order_id . '_' . $old_status . '_' . $new_status;
		if ( get_transient( $dedup_key ) ) {
			return;
		}

		$res = OutboundMessenger::send_status_template( $order->get_id(), $new_status );
		if ( ! empty( $res['ok'] ) ) {
			set_transient( $dedup_key, 1, 2 * MINUTE_IN_SECONDS );
			$order->update_meta_data( 'woobale_last_notified_status', $new_status );
			$order->save();
			$order->add_order_note( __( 'اعلان خودکار بله برای تغییر وضعیت ارسال شد.', 'webino-dashboard' ), false, true );
		}
	}
}
