<?php
/**
 * WooCommerce ZarinPal payment gateway.
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
 * Gateway id: zarinpal_gateway (stable for existing orders).
 */
class WC_Gateway_Zarinpal extends WC_Payment_Gateway {

	/** @var string */
	public $instructions = '';

	/** @var string */
	public $success_message = '';

	/** @var string */
	public $failed_message = '';

	/** @var string */
	public $fee_payer = 'merchant';

	/**
	 * Constructor.
	 */
	public function __construct() {
		$s                        = Zarinpal_Config::get();
		$this->id                 = Zarinpal_Config::GATEWAY_ID;
		$this->method_title       = __( 'Zarinpal Gateway', 'webino-dashboard' );
		$this->method_description = __( 'Pay via Zarinpal PG v4 gateway.', 'webino-dashboard' );
		$this->has_fields         = true;
		$this->supports           = array( 'products', 'refunds' );
		$this->icon               = apply_filters(
			'webino_zarinpal_gateway_icon',
			Zarinpal_Config::resolve_icon_url( (string) ( $s['icon_url'] ?? '' ) )
		);

		$this->init_form_fields();
		$this->init_settings();

		$this->enabled           = ! empty( $s['gateway_enabled'] ) ? 'yes' : 'no';
		$this->title             = (string) $s['title'];
		$this->description       = (string) $s['description'];
		$this->instructions      = (string) $s['instructions'];
		$this->success_message   = (string) $s['success_message'];
		$this->failed_message    = (string) $s['failed_message'];
		$this->fee_payer         = (string) $s['fee_payer'];
		$this->order_button_text = (string) ( $s['order_button_text'] ?? '' );
		if ( '' === $this->order_button_text ) {
			$this->order_button_text = (string) Zarinpal_Config::defaults()['order_button_text'];
		}

		add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
		add_action( 'woocommerce_thankyou_' . $this->id, array( $this, 'thankyou_page' ) );
		add_action( 'woocommerce_email_after_order_table', array( $this, 'email_instructions' ), 10, 3 );
		add_action( 'woocommerce_cart_calculate_fees', array( $this, 'add_zarinpal_fee_to_cart' ) );
		add_filter( 'allowed_redirect_hosts', array( $this, 'allow_zarinpal_redirect_hosts' ) );

		if ( is_admin() ) {
			add_action( 'add_meta_boxes', array( $this, 'add_order_metabox' ), 40 );
			add_action( 'woocommerce_admin_order_data_after_billing_address', array( $this, 'admin_order_inquiry_button' ), 20 );
		}
	}

	/**
	 * Persist WC settings into module option.
	 *
	 * @return bool
	 */
	public function process_admin_options() {
		$parent = parent::process_admin_options();
		$posted = array(
			'gateway_enabled'       => ( 'yes' === $this->get_option( 'enabled', 'no' ) ),
			'title'                 => $this->get_option( 'title', '' ),
			'description'           => $this->get_option( 'description', '' ),
			'instructions'          => $this->get_option( 'instructions', '' ),
			'success_message'       => $this->get_option( 'success_message', '' ),
			'failed_message'        => $this->get_option( 'failed_message', '' ),
			'order_button_text'     => $this->get_option( 'order_button_text', '' ),
			'fee_label'             => $this->get_option( 'fee_label', '' ),
			'cancelled_message'     => $this->get_option( 'cancelled_message', '' ),
			'invalid_token_message' => $this->get_option( 'invalid_token_message', '' ),
			'payment_description'   => $this->get_option( 'payment_description', '' ),
			'icon_url'              => $this->get_option( 'icon_url', '' ),
			'fee_payer'             => $this->get_option( 'fee_payer', 'merchant' ),
			'merchant_id'           => $this->get_option( 'merchantcode', '' ),
			'sandbox'               => ( 'yes' === $this->get_option( 'sandbox', 'no' ) ),
			'access_token'          => $this->get_option( 'access_token', '' ),
		);
		Zarinpal_Config::save( array_merge( Zarinpal_Config::get(), $posted ) );
		return $parent;
	}

	/**
	 * @return void
	 */
	public function init_form_fields() {
		$defaults = Zarinpal_Config::defaults();
		$this->form_fields = array(
			'enabled'               => array(
				'title'   => __( 'Enable/Disable', 'webino-dashboard' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable Zarinpal Gateway', 'webino-dashboard' ),
				'default' => 'no',
			),
			'title'                 => array(
				'title'   => __( 'Title', 'webino-dashboard' ),
				'type'    => 'text',
				'default' => (string) $defaults['title'],
			),
			'description'           => array(
				'title'   => __( 'Description', 'webino-dashboard' ),
				'type'    => 'textarea',
				'default' => (string) $defaults['description'],
			),
			'instructions'          => array(
				'title'       => __( 'Instructions', 'webino-dashboard' ),
				'type'        => 'textarea',
				'description' => __( 'Shown on thank-you page and emails.', 'webino-dashboard' ),
				'default'     => '',
			),
			'order_button_text'     => array(
				'title'   => __( 'Order button text', 'webino-dashboard' ),
				'type'    => 'text',
				'default' => (string) $defaults['order_button_text'],
			),
			'fee_label'             => array(
				'title'   => __( 'Fee label', 'webino-dashboard' ),
				'type'    => 'text',
				'default' => (string) $defaults['fee_label'],
			),
			'icon_url'              => array(
				'title'       => __( 'Icon URL', 'webino-dashboard' ),
				'type'        => 'text',
				'description' => __( 'Leave empty to use the bundled Zarinpal logo.', 'webino-dashboard' ),
				'default'     => '',
			),
			'merchantcode'          => array(
				'title'   => __( 'Merchant ID', 'webino-dashboard' ),
				'type'    => 'text',
				'default' => '',
			),
			'sandbox'               => array(
				'title'   => __( 'Sandbox', 'webino-dashboard' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable sandbox mode', 'webino-dashboard' ),
				'default' => 'yes',
			),
			'access_token'          => array(
				'title'       => __( 'Access token', 'webino-dashboard' ),
				'type'        => 'password',
				'description' => __( 'Optional. Required for refunds and GraphQL session lookup.', 'webino-dashboard' ),
				'default'     => '',
			),
			'fee_payer'             => array(
				'title'   => __( 'Fee payer', 'webino-dashboard' ),
				'type'    => 'select',
				'default' => 'merchant',
				'options' => array(
					'merchant' => __( 'Merchant', 'webino-dashboard' ),
					'customer' => __( 'Customer', 'webino-dashboard' ),
				),
			),
			'success_message'       => array(
				'title'       => __( 'Success message', 'webino-dashboard' ),
				'type'        => 'textarea',
				'description' => __( 'Use {transaction_id} placeholder.', 'webino-dashboard' ),
				'default'     => (string) $defaults['success_message'],
			),
			'failed_message'        => array(
				'title'       => __( 'Failed message', 'webino-dashboard' ),
				'type'        => 'textarea',
				'description' => __( 'Use {fault} placeholder.', 'webino-dashboard' ),
				'default'     => (string) $defaults['failed_message'],
			),
			'cancelled_message'     => array(
				'title'   => __( 'Cancelled message', 'webino-dashboard' ),
				'type'    => 'textarea',
				'default' => (string) $defaults['cancelled_message'],
			),
			'invalid_token_message' => array(
				'title'   => __( 'Invalid token message', 'webino-dashboard' ),
				'type'    => 'textarea',
				'default' => (string) $defaults['invalid_token_message'],
			),
			'payment_description'   => array(
				'title'       => __( 'Payment description', 'webino-dashboard' ),
				'type'        => 'text',
				'description' => __( 'Sent to Zarinpal. Use {order_id} placeholder.', 'webino-dashboard' ),
				'default'     => (string) $defaults['payment_description'],
			),
		);
	}

	/**
	 * @return void
	 */
	public function payment_fields() {
		if ( $this->description ) {
			echo wp_kses_post( wpautop( wptexturize( $this->description ) ) );
		}
	}

	/**
	 * @param string[] $hosts Hosts.
	 * @return string[]
	 */
	public function allow_zarinpal_redirect_hosts( $hosts ) {
		$hosts[] = 'sandbox.zarinpal.com';
		$hosts[] = 'payment.zarinpal.com';
		$hosts[] = 'www.zarinpal.com';
		return array_values( array_unique( array_filter( $hosts ) ) );
	}

	/**
	 * @param int $order_id Order ID.
	 * @return array<string,string>
	 */
	public function process_payment( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return array( 'result' => 'failure' );
		}

		$res = Zarinpal_Gateway_Service::request_payment( $order );
		if ( is_wp_error( $res ) ) {
			wc_add_notice( $res->get_error_message(), 'error' );
			return array( 'result' => 'failure' );
		}

		return array(
			'result'   => 'success',
			'redirect' => (string) $res['redirect_url'],
		);
	}

	/**
	 * @param int         $order_id Order ID.
	 * @param float|null  $amount   Amount.
	 * @param string      $reason   Reason.
	 * @return bool|WP_Error
	 */
	public function process_refund( $order_id, $amount = null, $reason = '' ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return new WP_Error( 'zarinpal_order_missing', __( 'Order not found.', 'webino-dashboard' ) );
		}
		if ( null === $amount || (float) $amount <= 0 ) {
			return new WP_Error( 'zarinpal_invalid_amount', __( 'Invalid refund amount.', 'webino-dashboard' ) );
		}
		$res = Zarinpal_Gateway_Service::refund( $order, (float) $amount, (string) $reason );
		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public function thankyou_page( $order_id ) {
		if ( $this->instructions ) {
			echo wp_kses_post( wpautop( wptexturize( $this->instructions ) ) );
		}
	}

	/**
	 * @param WC_Order $order         Order.
	 * @param bool     $sent_to_admin Admin email.
	 * @param bool     $plain_text    Plain.
	 * @return void
	 */
	public function email_instructions( $order, $sent_to_admin, $plain_text = false ) {
		if ( $sent_to_admin || ! $order || $order->get_payment_method() !== $this->id || ! $this->instructions ) {
			return;
		}
		echo wp_kses_post( wpautop( wptexturize( $this->instructions ) ) . "\n" );
	}

	/**
	 * Add gateway fee when customer is fee payer and Zarinpal is selected.
	 *
	 * @param WC_Cart $cart Cart.
	 * @return void
	 */
	public function add_zarinpal_fee_to_cart( $cart ) {
		if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
			return;
		}
		if ( ! $cart || 'customer' !== $this->fee_payer || 'yes' !== $this->enabled ) {
			return;
		}
		if ( ! $this->is_zarinpal_chosen() ) {
			return;
		}

		$currency = function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRT';
		$total = (float) $cart->get_cart_contents_total() + (float) $cart->get_shipping_total() - (float) $cart->get_discount_total();
		if ( method_exists( $cart, 'get_total_tax' ) ) {
			$total += (float) $cart->get_total_tax();
		} elseif ( method_exists( $cart, 'get_taxes_total' ) ) {
			$total += (float) $cart->get_taxes_total( false, false );
		}
		// Exclude existing zarinpal fees from base.
		foreach ( $cart->get_fees() as $fee ) {
			if ( $this->is_zarinpal_fee_name( $fee->name ) ) {
				$total -= (float) $fee->total;
			}
		}

		$rial = Zarinpal_Gateway_Service::amount_to_rial( $total, $currency );
		if ( $rial < 1000 ) {
			return;
		}

		$fee_data = Zarinpal_Gateway_Service::fee_calculation( $rial, 'IRR' );
		if ( is_wp_error( $fee_data ) ) {
			return;
		}
		if ( empty( $fee_data['suggested_amount'] ) || 'Merchant' !== (string) ( $fee_data['fee_type'] ?? '' ) ) {
			return;
		}

		$suggested_shop = Zarinpal_Gateway_Service::amount_from_rial( (float) $fee_data['suggested_amount'], $currency );
		$fee_amount     = max( 0, $suggested_shop - $total );
		if ( $fee_amount <= 0 ) {
			return;
		}

		$fee_label = (string) ( Zarinpal_Config::get()['fee_label'] ?? '' );
		if ( '' === $fee_label ) {
			$fee_label = (string) Zarinpal_Config::defaults()['fee_label'];
		}
		$cart->add_fee( $fee_label, $fee_amount, false );

		if ( function_exists( 'WC' ) && WC()->session ) {
			WC()->session->set(
				'webino_zarinpal_fee_data',
				array(
					'base_amount'      => $rial,
					'order_total'      => Zarinpal_Gateway_Service::amount_to_rial( $total + $fee_amount, $currency ),
					'fee'              => $fee_data['fee'] ?? 0,
					'suggested_amount' => (int) $fee_data['suggested_amount'],
					'fee_type'         => (string) $fee_data['fee_type'],
					'timestamp'        => time(),
				)
			);
		}
	}

	/**
	 * @return bool
	 */
	private function is_zarinpal_chosen() {
		$chosen = '';
		if ( function_exists( 'WC' ) && WC()->session ) {
			$chosen = (string) WC()->session->get( 'chosen_payment_method' );
		}
		if ( $chosen === $this->id ) {
			return true;
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['payment_method'] ) && $this->id === sanitize_text_field( wp_unslash( $_POST['payment_method'] ) ) ) {
			return true;
		}
		return false;
	}

	/**
	 * @param string $name Fee name.
	 * @return bool
	 */
	private function is_zarinpal_fee_name( $name ) {
		$name = (string) $name;
		$label = (string) ( Zarinpal_Config::get()['fee_label'] ?? '' );
		if ( '' !== $label && 0 === strcasecmp( $name, $label ) ) {
			return true;
		}
		return false !== stripos( $name, 'zarinpal' )
			|| false !== stripos( $name, 'gateway fee' )
			|| false !== strpos( $name, 'کارمزد' );
	}

	/**
	 * @return void
	 */
	public function add_order_metabox() {
		$screen = function_exists( 'wc_get_page_screen_id' ) ? wc_get_page_screen_id( 'shop-order' ) : 'shop_order';
		add_meta_box(
			'webino_zarinpal_inquiry',
			__( 'Zarinpal transaction', 'webino-dashboard' ),
			array( $this, 'render_order_metabox' ),
			$screen,
			'side',
			'default'
		);
	}

	/**
	 * @param WP_Post|WC_Order $post_or_order Post or order.
	 * @return void
	 */
	public function render_order_metabox( $post_or_order ) {
		$order = ( $post_or_order instanceof WC_Order ) ? $post_or_order : wc_get_order( $post_or_order->ID );
		if ( ! $order || $order->get_payment_method() !== $this->id ) {
			echo '<p>' . esc_html__( 'Not a Zarinpal order.', 'webino-dashboard' ) . '</p>';
			return;
		}
		$authority = (string) $order->get_meta( '_zarinpal_authority' );
		$ref       = (string) $order->get_meta( '_zarinpal_ref_id' );
		echo '<p><strong>' . esc_html__( 'Authority', 'webino-dashboard' ) . ':</strong> ' . esc_html( $authority ?: '—' ) . '</p>';
		echo '<p><strong>' . esc_html__( 'Ref ID', 'webino-dashboard' ) . ':</strong> ' . esc_html( $ref ?: '—' ) . '</p>';
		if ( $authority ) {
			$lookup = Zarinpal_Gateway_Service::lookup( $authority );
			if ( is_wp_error( $lookup ) ) {
				echo '<p class="description">' . esc_html( $lookup->get_error_message() ) . '</p>';
			} else {
				echo '<pre style="white-space:pre-wrap;font-size:11px;max-height:220px;overflow:auto;">' . esc_html( wp_json_encode( $lookup, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ) ) . '</pre>';
			}
		}
	}

	/**
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public function admin_order_inquiry_button( $order ) {
		if ( ! $order || $order->get_payment_method() !== $this->id ) {
			return;
		}
		$authority = (string) $order->get_meta( '_zarinpal_authority' );
		if ( '' === $authority ) {
			return;
		}
		echo '<p><strong>' . esc_html__( 'Zarinpal', 'webino-dashboard' ) . ':</strong> ' . esc_html( $authority ) . '</p>';
	}
}
