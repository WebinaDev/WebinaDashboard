<?php
/**
 * WooCommerce Basalam payment gateway (App Store pay API).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

class WC_Gateway_Basalam extends WC_Payment_Gateway {
	public function __construct() {
		$this->id                 = 'basalam_gateway';
		$this->method_title       = __( 'Basalam', 'webino-dashboard' );
		$this->method_description = __( 'Pay with Basalam (App Store payment gateway).', 'webino-dashboard' );
		$this->has_fields         = false;
		$this->supports           = array( 'products' );
		$this->init_form_fields();
		$this->init_settings();
		$this->title       = $this->get_option( 'title', __( 'Basalam', 'webino-dashboard' ) );
		$this->description = $this->get_option( 'description', '' );
		$this->enabled     = $this->get_option( 'enabled', 'no' );
		add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
	}

	public function init_form_fields() {
		$this->form_fields = array(
			'enabled'     => array(
				'title'   => __( 'Enable/Disable', 'webino-dashboard' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable Basalam payment', 'webino-dashboard' ),
				'default' => 'no',
			),
			'title'       => array(
				'title'   => __( 'Title', 'webino-dashboard' ),
				'type'    => 'text',
				'default' => __( 'Basalam', 'webino-dashboard' ),
			),
			'description' => array(
				'title'   => __( 'Description', 'webino-dashboard' ),
				'type'    => 'textarea',
				'default' => __( 'پرداخت باسلام', 'webino-dashboard' ),
			),
		);
	}

	public function process_admin_options() {
		parent::process_admin_options();
		$secret  = isset( $_POST['woocommerce_basalam_gateway_gateway_secret'] ) // phpcs:ignore WordPress.Security.NonceVerification.Missing
			? sanitize_text_field( wp_unslash( $_POST['woocommerce_basalam_gateway_gateway_secret'] ) )
			: '';
		$sandbox = isset( $_POST['woocommerce_basalam_gateway_gateway_sandbox'] ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( '' !== $secret || isset( $_POST['woocommerce_basalam_gateway_gateway_sandbox'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$patch = array( 'gateway_sandbox' => $sandbox );
			if ( '' !== $secret && '***' !== $secret ) {
				$patch['gateway_secret'] = $secret;
			}
			Basalam_Config::save( $patch );
		}
	}

	public function admin_options() {
		parent::admin_options();
		$cfg = Basalam_Config::get();
		echo '<table class="form-table"><tr><th>' . esc_html__( 'Gateway Secret', 'webino-dashboard' ) . '</th><td>';
		echo '<input type="password" class="input-text regular-input" name="woocommerce_basalam_gateway_gateway_secret" value="' . ( ! empty( $cfg['gateway_secret'] ) ? '***' : '' ) . '" autocomplete="off" />';
		echo '<p class="description">' . esc_html__( 'X-Gateway-Secret from Basalam developer panel → Internet payment gateway.', 'webino-dashboard' ) . '</p></td></tr>';
		echo '<tr><th>' . esc_html__( 'Sandbox', 'webino-dashboard' ) . '</th><td>';
		echo '<label><input type="checkbox" name="woocommerce_basalam_gateway_gateway_sandbox" value="1" ' . checked( ! empty( $cfg['gateway_sandbox'] ), true, false ) . ' /> ';
		echo esc_html__( 'Use x-sandbox test mode (no real secret required)', 'webino-dashboard' ) . '</label></td></tr></table>';
	}

	public function process_payment( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return array( 'result' => 'failure' );
		}
		$init = Basalam_Gateway_Service::create_payment( $order );
		if ( is_wp_error( $init ) ) {
			wc_add_notice( $init->get_error_message(), 'error' );
			return array( 'result' => 'failure' );
		}
		$redirect = (string) ( $init['pay_url'] ?? $init['redirect_url'] ?? '' );
		if ( '' === $redirect ) {
			wc_add_notice( __( 'Basalam payment URL missing.', 'webino-dashboard' ), 'error' );
			return array( 'result' => 'failure' );
		}
		$order->update_status( 'pending', __( 'Awaiting Basalam payment.', 'webino-dashboard' ) );
		return array(
			'result'   => 'success',
			'redirect' => $redirect,
		);
	}
}
