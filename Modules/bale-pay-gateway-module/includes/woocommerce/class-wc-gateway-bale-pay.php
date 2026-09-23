<?php
/**
 * WooCommerce Bale Pay gateway.
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
 * Send a one-time Bale invoice via the shop bot.
 */
class WC_Gateway_Bale_Pay extends WC_Payment_Gateway {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$s                        = Webino_Bale_Pay_Config::get();
		$this->id                 = Webino_Bale_Pay_Config::GATEWAY_ID;
		$this->method_title       = __( 'پرداخت بله', 'webino-dashboard' );
		$this->method_description = __( 'فاکتور یک‌بارمصرف کیف‌پول بله از طریق بازو.', 'webino-dashboard' );
		$this->has_fields         = false;
		$this->supports           = array( 'products' );
		$this->init_form_fields();
		$this->init_settings();
		$this->title             = (string) $s['title'];
		$this->description       = (string) $s['description'];
		$this->order_button_text = (string) ( $s['order_button_text'] ?? 'ثبت و پرداخت با بله' );
		$this->icon              = apply_filters(
			'webino_bale_pay_gateway_icon',
			Webino_Bale_Pay_Config::resolve_icon_url( (string) ( $s['icon_url'] ?? '' ) )
		);
		$this->enabled           = ! empty( $s['enabled'] ) ? 'yes' : 'no';
		add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
		add_action( 'woocommerce_thankyou_' . $this->id, array( $this, 'thankyou' ) );
	}

	/**
	 * @return void
	 */
	public function init_form_fields() {
		$this->form_fields = array(
			'enabled' => array(
				'title'   => __( 'Enable/Disable', 'webino-dashboard' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable Bale Pay', 'webino-dashboard' ),
				'default' => 'no',
			),
			'title'   => array(
				'title'   => __( 'Title', 'webino-dashboard' ),
				'type'    => 'text',
				'default' => __( 'پرداخت از طریق بله', 'webino-dashboard' ),
			),
		);
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
		$s = Webino_Bale_Pay_Config::get();
		$order->update_status( 'on-hold', __( 'در انتظار پرداخت فاکتور بله', 'webino-dashboard' ) );
		$send = Webino_Bale_Pay_Service::send_invoice_for_order( $order );
		if ( is_array( $send ) && empty( $send['ok'] ) && empty( $send['sent'] ) ) {
			$fault = isset( $send['error'] ) ? (string) $send['error'] : 'send_failed';
			$tpl   = (string) ( $s['failed_message'] ?? Webino_Bale_Pay_Config::defaults()['failed_message'] );
			wc_add_notice( str_replace( '{fault}', $fault, $tpl ), 'error' );
		}
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
		$s    = Webino_Bale_Pay_Config::get();
		$sent = '1' === (string) $order->get_meta( Webino_Bale_Pay_Service::META_SENT );
		echo '<div class="webino-bale-pay-thankyou">';
		if ( $sent ) {
			$msg = (string) ( $s['success_message'] ?? Webino_Bale_Pay_Config::defaults()['success_message'] );
			echo '<p>' . esc_html( $msg ) . '</p>';
		} else {
			echo '<p>' . esc_html( (string) $s['instructions'] ) . '</p>';
			$url = Webino_Bale_Pay_Service::start_url( (int) $order_id );
			if ( $url ) {
				echo '<p><a class="button" href="' . esc_url( $url ) . '">' . esc_html__( 'باز کردن بازوی بله و دریافت فاکتور', 'webino-dashboard' ) . '</a></p>';
			} else {
				$fault_tpl = (string) ( $s['failed_message'] ?? Webino_Bale_Pay_Config::defaults()['failed_message'] );
				echo '<p>' . esc_html( str_replace( '{fault}', __( 'بازوی بله را استارت کنید تا فاکتور برایتان ارسال شود.', 'webino-dashboard' ), $fault_tpl ) ) . '</p>';
			}
		}
		echo '</div>';
	}
}
