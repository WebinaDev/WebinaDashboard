<?php
/**
 * Abstract DigiPay UPG WooCommerce gateway.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

abstract class WC_Gateway_Digipay_UPG extends WC_Payment_Gateway {

	/** @var string */
	protected $digipay_key = '';

	/**
	 * @return void
	 */
	protected function setup_gateway() {
		$this->has_fields         = false;
		$this->method_description = __( 'DigiPay UPG integrated gateway', 'webino-dashboard' );
		$this->supports           = array( 'products', 'refunds' );
		$this->init_form_fields();
		$this->init_settings();

		$s = class_exists( 'Digipay_OAuth', false ) ? Digipay_OAuth::settings() : array();
		$key = (string) $this->digipay_key;
		$this->title = class_exists( 'Digipay_OAuth', false )
			? Digipay_OAuth::gateway_title( $key )
			: (string) $this->get_option( 'title', $this->method_title );
		$this->description = class_exists( 'Digipay_OAuth', false )
			? Digipay_OAuth::gateway_description( $key )
			: (string) $this->get_option( 'description', '' );
		$this->order_button_text = (string) ( $s['order_button_text'] ?? 'پرداخت با دیجی‌پی' );
		$this->icon = apply_filters(
			'webino_digipay_gateway_icon',
			class_exists( 'Digipay_OAuth', false )
				? Digipay_OAuth::resolve_icon_url( (string) ( $s['icon_url'] ?? '' ) )
				: ''
		);
		$this->enabled = (string) $this->get_option( 'enabled', 'no' );
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
				'label'   => __( 'Enable this gateway', 'webino-dashboard' ),
				'default' => 'no',
			),
			'title' => array(
				'title'   => __( 'Title', 'webino-dashboard' ),
				'type'    => 'text',
				'default' => class_exists( 'Digipay_OAuth', false )
					? Digipay_OAuth::gateway_title( (string) $this->digipay_key )
					: $this->method_title,
			),
			'description' => array(
				'title'   => __( 'Description', 'webino-dashboard' ),
				'type'    => 'textarea',
				'default' => class_exists( 'Digipay_OAuth', false )
					? Digipay_OAuth::gateway_description( (string) $this->digipay_key )
					: '',
			),
		);
	}

	/**
	 * @param int $order_id Order id.
	 * @return array<string,mixed>
	 */
	public function process_payment( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order ) {
			wc_add_notice( __( 'Order not found.', 'webino-dashboard' ), 'error' );
			return array( 'result' => 'failure' );
		}

		$payload = Digipay_Order_Service::build_ticket_payload( $order, $this->digipay_key );
		$result  = Digipay_Api_Client::create_ticket( $payload );
		$cfg     = Digipay_OAuth::settings();
		$failed  = (string) ( $cfg['failed_message'] ?? Digipay_OAuth::defaults()['failed_message'] );
		if ( is_wp_error( $result ) ) {
			Digipay_Lifecycle::log_event( $order_id, 'tickets/business', false, $result->get_error_message() );
			wc_add_notice( str_replace( '{fault}', $result->get_error_message(), $failed ), 'error' );
			return array( 'result' => 'failure' );
		}
		$redirect = '';
		if ( isset( $result['redirectUrl'] ) ) {
			$redirect = (string) $result['redirectUrl'];
		} elseif ( isset( $result['payUrl'] ) ) {
			$redirect = (string) $result['payUrl'];
		}
		if ( '' === $redirect ) {
			wc_add_notice( str_replace( '{fault}', __( 'Invalid DigiPay response.', 'webino-dashboard' ), $failed ), 'error' );
			return array( 'result' => 'failure' );
		}

		if ( isset( $result['ticket'] ) ) {
			$order->update_meta_data( '_digipay_ticket', sanitize_text_field( (string) $result['ticket'] ) );
		}
		$order->save();
		Digipay_Lifecycle::log_event( $order_id, 'tickets/business', true, 'Ticket created' );
		return array(
			'result'   => 'success',
			'redirect' => esc_url_raw( $redirect ),
		);
	}

	/**
	 * @param int    $order_id Order id.
	 * @param float  $amount Refund amount.
	 * @param string $reason Reason.
	 * @return bool|WP_Error
	 */
	public function process_refund( $order_id, $amount = null, $reason = '' ) {
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order ) {
			return new WP_Error( 'digipay_refund_order_not_found', __( 'Order not found.', 'webino-dashboard' ) );
		}
		$tracking = (string) $order->get_meta( '_digipay_tracking_code' );
		$provider = (string) $order->get_meta( '_digipay_provider_id' );
		$type     = (int) $order->get_meta( '_digipay_type' );
		if ( '' === $tracking || '' === $provider ) {
			return new WP_Error( 'digipay_refund_missing_meta', __( 'DigiPay reference data is missing.', 'webino-dashboard' ) );
		}
		$rial = class_exists( 'Webino_Payment_Money', false )
			? Webino_Payment_Money::to_rial( (float) $amount, $order->get_currency() )
			: (int) round( (float) $amount );
		$res  = Digipay_Api_Client::refund_purchase(
			$type,
			array(
				'trackingCode' => $tracking,
				'providerId'   => $provider,
				'amount'       => $rial,
				'reason'       => (string) $reason,
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return true;
	}
}
