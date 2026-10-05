<?php

namespace Webino_Dashboard_Bots_Bale\Admin;

use Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger;

/**
 * AJAX: send Bale messages from order / user screens.
 */
class AjaxHandlers {

	public static function init(): void {
		add_action( 'wp_ajax_woobale_order_message', array( __CLASS__, 'order_message' ) );
		add_action( 'wp_ajax_woobale_user_message', array( __CLASS__, 'user_message' ) );
	}

	public static function order_message(): void {
		check_ajax_referer( 'woobale_admin', 'nonce' );
		$order_id = isset( $_POST['order_id'] ) ? absint( $_POST['order_id'] ) : 0;
		$action   = isset( $_POST['bale_action'] ) ? sanitize_key( wp_unslash( $_POST['bale_action'] ) ) : '';
		$order    = wc_get_order( $order_id );
		if ( ! $order ) {
			wp_send_json_error( array( 'message' => __( 'سفارش نامعتبر است.', 'webino-dashboard' ) ) );
		}
		if ( ! current_user_can( 'edit_shop_order', $order_id ) ) {
			wp_send_json_error( array( 'message' => __( 'مجوز ندارید.', 'webino-dashboard' ) ), 403 );
		}

		$res = array( 'ok' => false, 'error' => '' );
		switch ( $action ) {
			case 'custom':
				$text = isset( $_POST['custom_text'] ) ? wp_kses_post( wp_unslash( $_POST['custom_text'] ) ) : '';
				if ( $text === '' ) {
					wp_send_json_error( array( 'message' => __( 'متن خالی است.', 'webino-dashboard' ) ) );
				}
				$res = OutboundMessenger::send_text_to_user( (int) $order->get_user_id(), $text );
				break;
			case 'summary':
				$res = OutboundMessenger::send_order_summary( $order_id );
				break;
			case 'payment_link':
				$res = OutboundMessenger::send_payment_link( $order_id );
				break;
			case 'invoice':
				$chat = get_user_meta( (int) $order->get_user_id(), 'woobale_chat_id', true );
				if ( ! $chat ) {
					wp_send_json_error( array( 'message' => __( 'کاربر chat_id ندارد.', 'webino-dashboard' ) ) );
				}
				$res = OutboundMessenger::send_invoice( $order_id, (int) $chat );
				break;
			case 'status_template':
				$res = OutboundMessenger::send_status_template( $order_id, $order->get_status() );
				break;
			default:
				wp_send_json_error( array( 'message' => __( 'عمل نامعتبر است.', 'webino-dashboard' ) ) );
		}

		if ( ! empty( $res['ok'] ) ) {
			$note = sprintf(
				/* translators: %s: admin user login */
				__( 'پیام بله توسط مدیر ارسال شد (%s).', 'webino-dashboard' ),
				wp_get_current_user()->user_login
			);
			$order->add_order_note( $note, false, true );
			wp_send_json_success( array( 'message' => __( 'ارسال شد.', 'webino-dashboard' ) ) );
		}
		wp_send_json_error( array( 'message' => isset( $res['error'] ) ? $res['error'] : __( 'خطا', 'webino-dashboard' ) ) );
	}

	public static function user_message(): void {
		check_ajax_referer( 'woobale_admin', 'nonce' );
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_send_json_error( array( 'message' => __( 'مجوز ندارید.', 'webino-dashboard' ) ), 403 );
		}
		$user_id = isset( $_POST['user_id'] ) ? absint( $_POST['user_id'] ) : 0;
		$text    = isset( $_POST['custom_text'] ) ? wp_kses_post( wp_unslash( $_POST['custom_text'] ) ) : '';
		if ( $user_id < 1 || $text === '' ) {
			wp_send_json_error( array( 'message' => __( 'داده نامعتبر است.', 'webino-dashboard' ) ) );
		}
		$res = OutboundMessenger::send_text_to_user( $user_id, $text );
		if ( ! empty( $res['ok'] ) ) {
			wp_send_json_success( array( 'message' => __( 'ارسال شد.', 'webino-dashboard' ) ) );
		}
		wp_send_json_error( array( 'message' => isset( $res['error'] ) ? $res['error'] : __( 'خطا', 'webino-dashboard' ) ) );
	}
}
