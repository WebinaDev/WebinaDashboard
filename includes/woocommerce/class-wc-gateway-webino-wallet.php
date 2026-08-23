<?php
/**
 * WooCommerce wallet payment gateway.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

/**
 * Pay with store wallet balance.
 */
class WC_Gateway_Webino_Wallet extends WC_Payment_Gateway {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id                 = Webino_Dashboard_Wallet::GATEWAY_ID;
		$this->method_title       = __( 'Store wallet', 'webino-dashboard' );
		$this->method_description = __( 'Pay using customer wallet balance.', 'webino-dashboard' );
		$this->has_fields         = true;
		$this->supports           = array( 'products' );
		$this->init_form_fields();
		$this->init_settings();
		$title_opt = $this->get_option( 'title', __( 'Wallet', 'webino-dashboard' ) );
		if ( class_exists( 'Webino_Wallet_Config', false ) ) {
			$s         = Webino_Wallet_Config::get();
			$title_opt = (string) $s['title'];
			$this->enabled = ! empty( $s['enabled'] ) ? 'yes' : 'no';
		} else {
			$this->enabled = $this->get_option( 'enabled', 'yes' );
		}
		$this->title = $title_opt;
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
				'label'   => __( 'Enable wallet payments', 'webino-dashboard' ),
				'default' => 'yes',
			),
			'title'   => array(
				'title'   => __( 'Title', 'webino-dashboard' ),
				'type'    => 'text',
				'default' => __( 'Wallet', 'webino-dashboard' ),
			),
		);
	}

	/**
	 * @return void
	 */
	public function payment_fields() {
		if ( ! is_user_logged_in() || ! class_exists( 'Webino_Dashboard_Wallet', false ) ) {
			echo '<p>' . esc_html__( 'برای پرداخت با کیف پول وارد شوید.', 'webino-dashboard' ) . '</p>';
			return;
		}
		$balance = Webino_Dashboard_Wallet::get_balance( get_current_user_id() );
		echo '<p>' . wp_kses_post( sprintf( __( 'موجودی کیف پول: %s', 'webino-dashboard' ), wc_price( $balance ) ) ) . '</p>';
	}

	/**
	 * @return bool
	 */
	public function is_available() {
		if ( 'yes' !== $this->enabled ) {
			return false;
		}
		if ( ! is_user_logged_in() ) {
			return false;
		}
		if ( ! class_exists( 'Webino_Dashboard_Wallet', false ) ) {
			return false;
		}
		$total = 0.0;
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$total = (float) WC()->cart->get_total( 'edit' );
		}
		$balance = Webino_Dashboard_Wallet::get_balance( get_current_user_id() );
		return $balance >= $total && $total > 0;
	}

	/**
	 * @param int $order_id Order ID.
	 * @return array<string, string>
	 */
	public function process_payment( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return array( 'result' => 'failure' );
		}
		if ( '1' === (string) $order->get_meta( Webino_Dashboard_Wallet::TOPUP_META ) ) {
			wc_add_notice( __( 'Wallet cannot pay for wallet top-up orders.', 'webino-dashboard' ), 'error' );
			return array( 'result' => 'failure' );
		}
		$uid    = (int) $order->get_customer_id();
		$amount = (float) $order->get_total();
		$result = Webino_Dashboard_Wallet::adjust( $uid, $amount, 'debit', 'checkout', 'order', (int) $order_id );
		if ( is_wp_error( $result ) ) {
			wc_add_notice( $result->get_error_message(), 'error' );
			return array( 'result' => 'failure' );
		}
		$order->update_meta_data( '_webino_wallet_debited_amount', $amount );
		$order->delete_meta_data( '_webino_wallet_debit_restored' );
		$order->save();
		$order->payment_complete();
		$order->add_order_note( __( 'Paid via store wallet.', 'webino-dashboard' ) );
		WC()->cart->empty_cart();
		return array(
			'result'   => 'success',
			'redirect' => $this->get_return_url( $order ),
		);
	}
}
