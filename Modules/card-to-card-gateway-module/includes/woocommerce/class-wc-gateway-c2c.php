<?php
/**
 * WooCommerce card-to-card payment gateway.
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
 * Card-to-card gateway (receipt upload + bot/dashboard approval).
 */
class WC_Gateway_C2C extends WC_Payment_Gateway {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$s                        = Webino_C2C_Config::get();
		$this->id                 = Webino_C2C_Config::GATEWAY_ID;
		$this->method_title       = __( 'کارت به کارت', 'webino-dashboard' );
		$this->method_description = __( 'پرداخت کارت‌به‌کارت با آپلود رسید و تأیید در بله، تلگرام یا داشبورد.', 'webino-dashboard' );
		$this->has_fields         = true;
		$this->supports           = array( 'products' );
		$this->init_form_fields();
		$this->init_settings();
		$this->title       = (string) $s['title'];
		$this->description = (string) $s['instructions'];
		$this->enabled     = ! empty( $s['enabled'] ) && '0' !== (string) $s['enabled'] ? 'yes' : 'no';
		add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
	}

	/**
	 * @return void
	 */
	public function init_form_fields() {
		$this->form_fields = array(
			'enabled' => array(
				'title'   => __( 'Enable/Disable', 'webino-dashboard' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable card-to-card', 'webino-dashboard' ),
				'default' => 'no',
			),
			'title'   => array(
				'title'   => __( 'Title', 'webino-dashboard' ),
				'type'    => 'text',
				'default' => __( 'کارت به کارت', 'webino-dashboard' ),
			),
		);
	}

	/**
	 * @return void
	 */
	public function payment_fields() {
		$s = Webino_C2C_Config::get();
		echo '<div class="webino-c2c-fields" style="line-height:1.6">';
		if ( ! empty( $s['instructions'] ) ) {
			echo '<p>' . esc_html( (string) $s['instructions'] ) . '</p>';
		}
		Webino_C2C_Receipts::echo_destination_details( $s );
		echo '<p class="webino-c2c-hint">' . esc_html__( 'پس از ثبت سفارش، عکس رسید را در صفحه تشکر یا حساب کاربری آپلود کنید.', 'webino-dashboard' ) . '</p>';
		echo '</div>';
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
}
