<?php
/**
 * WooCommerce C2C payment gateway class.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WC_Payment_Gateway', false ) ) {
	return;
}

/**
 * Card-to-card gateway.
 */
class Webino_Dashboard_Bots_WC_Gateway_C2C extends WC_Payment_Gateway {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id                 = Webino_Dashboard_Bots_C2C_Gateway::GATEWAY_ID;
		$this->method_title       = __( 'کارت به کارت (ربات)', 'webino-dashboard' );
		$this->method_description = __( 'پرداخت کارت‌به‌کارت با تأیید رسید در ربات بله/تلگرام.', 'webino-dashboard' );
		$this->has_fields         = true;
		$s                        = Webino_Dashboard_Bots_C2C_Gateway::settings();
		$this->enabled            = ! empty( $s['enabled'] ) && '0' !== (string) $s['enabled'] ? 'yes' : 'no';
		$this->title              = (string) $s['title'];
		$this->description        = (string) $s['instructions'];
		add_action( 'woocommerce_thankyou_' . $this->id, array( $this, 'thankyou' ) );
	}

	/**
	 * @return void
	 */
	public function payment_fields() {
		$s = Webino_Dashboard_Bots_C2C_Gateway::settings();
		echo '<p>' . esc_html( (string) $s['instructions'] ) . '</p>';
		if ( ! empty( $s['iban'] ) ) {
			echo '<p><strong>' . esc_html__( 'شبا:', 'webino-dashboard' ) . '</strong> ' . esc_html( (string) $s['iban'] ) . '</p>';
		}
		foreach ( (array) $s['cards'] as $card ) {
			if ( is_string( $card ) ) {
				echo '<p class="font-mono">' . esc_html( $card ) . '</p>';
			} elseif ( is_array( $card ) ) {
				echo '<p class="font-mono">' . esc_html( (string) ( $card['number'] ?? '' ) );
				if ( ! empty( $card['name'] ) ) {
					echo ' — ' . esc_html( (string) $card['name'] );
				}
				echo '</p>';
			}
		}
		$h = (int) $s['deadline_h'];
		echo '<p>' . esc_html( sprintf( __( 'مهلت پرداخت: %d ساعت', 'webino-dashboard' ), $h ) ) . '</p>';
	}

	/**
	 * @param int $order_id Order ID.
	 * @return array<string,mixed>
	 */
	public function process_payment( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return array( 'result' => 'failure' );
		}
		$order->update_status( 'on-hold', __( 'در انتظار رسید کارت‌به‌کارت', 'webino-dashboard' ) );
		if ( function_exists( 'WC' ) && WC()->cart ) {
			WC()->cart->empty_cart();
		}
		return array(
			'result'   => 'success',
			'redirect' => $this->get_return_url( $order ),
		);
	}

	/**
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public function thankyou( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		echo '<p>' . esc_html__( 'پس از واریز، رسید را از حساب کاربری ارسال کنید. ادمین از ربات تأیید می‌کند.', 'webino-dashboard' ) . '</p>';
		echo '<form method="post" enctype="multipart/form-data">';
		wp_nonce_field( 'webino_c2c_receipt_' . $order_id, 'webino_c2c_nonce' );
		echo '<input type="file" name="webino_c2c_receipt" accept="image/jpeg,image/png,image/webp" required />';
		echo '<button type="submit" name="webino_c2c_upload" value="1">' . esc_html__( 'آپلود رسید', 'webino-dashboard' ) . '</button>';
		echo '</form>';
		if ( ! empty( $_POST['webino_c2c_upload'] ) && isset( $_POST['webino_c2c_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['webino_c2c_nonce'] ) ), 'webino_c2c_receipt_' . $order_id ) ) {
			if ( ! empty( $_FILES['webino_c2c_receipt']['tmp_name'] ) ) {
				require_once ABSPATH . 'wp-admin/includes/file.php';
				$upload = wp_handle_upload( $_FILES['webino_c2c_receipt'], array( 'test_form' => false ) );
				if ( ! empty( $upload['url'] ) ) {
					$order->update_meta_data( '_webino_c2c_receipt_url', esc_url_raw( $upload['url'] ) );
					$order->add_order_note( __( 'رسید کارت‌به‌کارت آپلود شد.', 'webino-dashboard' ) . ' ' . $upload['url'] );
					$order->save();
					Webino_Dashboard_Bots_C2C_Gateway::notify_admins_receipt_pending( $order_id );
					echo '<p>' . esc_html__( 'رسید دریافت شد.', 'webino-dashboard' ) . '</p>';
				}
			}
		}
	}
}
