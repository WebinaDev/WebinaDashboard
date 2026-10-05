<?php
/**
 * WooCommerce SnappPay installment gateway (Webina first-party).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WC_Payment_Gateway', false ) ) {
	return;
}

if ( ! class_exists( 'WC_Gateway_SnappPay', false ) ) :

	define( 'WEBINO_SNAPPPAY_GATEWAY_OWNED', true );

	/**
	 * Gateway id matches official plugin for order continuity.
	 */
	class WC_Gateway_SnappPay extends WC_Payment_Gateway {

		/**
		 * Constructor.
		 */
		public function __construct() {
			$this->id                 = Webino_SnappPay_Config::GATEWAY_ID;
			$this->method_title       = __( 'SnappPay', 'webino-dashboard' );
			$this->method_description = __( 'SnappPay installment gateway (Webina).', 'webino-dashboard' );
			$this->has_fields         = false;
			$this->supports           = array( 'products' );

			$this->init_form_fields();
			$this->init_settings();

			$cfg                     = Webino_SnappPay_Config::get();
			$this->enabled           = ! empty( $cfg['enabled'] ) ? 'yes' : 'no';
			$this->title             = (string) $cfg['title'];
			$this->description       = (string) $cfg['description'];
			$this->order_button_text = (string) ( $cfg['order_button_text'] ?? 'پرداخت با اسنپ‌پی' );
			$this->icon              = apply_filters(
				'webino_snapppay_gateway_icon',
				Webino_SnappPay_Config::resolve_icon_url( (string) ( $cfg['icon_url'] ?? '' ) )
			);

			add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
			add_action( 'woocommerce_receipt_' . $this->id, array( $this, 'receipt_page' ) );
			add_action( 'woocommerce_api_' . strtolower( $this->id ), array( $this, 'handle_callback' ) );
		}

		/**
		 * @return void
		 */
		public function init_form_fields() {
			$this->form_fields = array(
				'enabled' => array(
					'title'   => __( 'Enable', 'webino-dashboard' ),
					'type'    => 'checkbox',
					'label'   => __( 'Enable SnappPay', 'webino-dashboard' ),
					'default' => 'no',
				),
				'title' => array(
					'title'   => __( 'Title', 'webino-dashboard' ),
					'type'    => 'text',
					'default' => 'پرداخت اقساطیِ اسنپ پی',
				),
				'description' => array(
					'title'   => __( 'Description', 'webino-dashboard' ),
					'type'    => 'text',
					'default' => 'پرداخت اقساطی اسنپ پی',
				),
			);
		}

		/**
		 * Persist via Webina config (keeps secrets in sync).
		 *
		 * @return bool
		 */
		public function process_admin_options() {
			parent::process_admin_options();
			$cfg = Webino_SnappPay_Config::get();
			$cfg['enabled']     = ( 'yes' === $this->get_option( 'enabled', 'no' ) );
			$cfg['title']       = (string) $this->get_option( 'title', $cfg['title'] );
			$cfg['description'] = (string) $this->get_option( 'description', $cfg['description'] );
			Webino_SnappPay_Config::save( $cfg );
			return true;
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
			$cfg = Webino_SnappPay_Config::get();
			if ( ! empty( $cfg['direct_payment'] ) ) {
				return $this->start_redirect( $order );
			}
			return array(
				'result'   => 'success',
				'redirect' => $order->get_checkout_payment_url( true ),
			);
		}

		/**
		 * @param int $order_id Order id.
		 * @return void
		 */
		public function receipt_page( $order_id ) {
			$order = wc_get_order( $order_id );
			if ( ! $order instanceof WC_Order ) {
				return;
			}
			$cfg = Webino_SnappPay_Config::get();
			if ( ! empty( $cfg['direct_payment'] ) ) {
				$result = $this->start_redirect( $order );
				if ( ! empty( $result['redirect'] ) ) {
					wp_safe_redirect( $result['redirect'] );
					exit;
				}
				echo '<p>' . esc_html__( 'Could not start SnappPay payment.', 'webino-dashboard' ) . '</p>';
				return;
			}
			echo '<form method="post">';
			$btn = (string) ( Webino_SnappPay_Config::get()['order_button_text'] ?? 'پرداخت با اسنپ‌پی' );
			echo '<button type="submit" class="button alt" name="webino_snapppay_pay" value="1">' . esc_html( $btn ) . '</button>';
			echo '</form>';
			if ( ! empty( $_POST['webino_snapppay_pay'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
				$result = $this->start_redirect( $order );
				if ( ! empty( $result['redirect'] ) ) {
					wp_safe_redirect( $result['redirect'] );
					exit;
				}
				echo '<p>' . esc_html__( 'Could not start SnappPay payment.', 'webino-dashboard' ) . '</p>';
			}
		}

		/**
		 * @param WC_Order $order Order.
		 * @return array<string,mixed>
		 */
		private function start_redirect( WC_Order $order ) {
			$transaction_id = (string) time() . '-' . $order->get_id();
			$order->update_meta_data( '_transactionId', $transaction_id );
			$order->save();

			$res = Webino_SnappPay_Api_Client::payment_token_for_order( $order, $transaction_id );
			Webino_Payment_Money::push_log(
				Webino_SnappPay_Config::LOG_OPTION,
				array(
					'action'   => 'token',
					'order_id' => $order->get_id(),
					'ok'       => ! is_wp_error( $res ),
					'detail'   => is_wp_error( $res ) ? $res->get_error_message() : 'ok',
				)
			);
			if ( is_wp_error( $res ) ) {
				$order->add_order_note( 'SnappPay token error: ' . $res->get_error_message() );
				wc_add_notice( $this->format_message( 'failed', $order, $res->get_error_message() ), 'error' );
				return array( 'result' => 'failure' );
			}

			$token = '';
			if ( ! empty( $res['response']['paymentToken'] ) ) {
				$token = (string) $res['response']['paymentToken'];
			} elseif ( ! empty( $res['paymentToken'] ) ) {
				$token = (string) $res['paymentToken'];
			}
			$url = '';
			if ( ! empty( $res['response']['paymentPageUrl'] ) ) {
				$url = (string) $res['response']['paymentPageUrl'];
			} elseif ( ! empty( $res['paymentPageUrl'] ) ) {
				$url = (string) $res['paymentPageUrl'];
			}
			if ( '' === $token || '' === $url ) {
				wc_add_notice( __( 'Invalid SnappPay token response.', 'webino-dashboard' ), 'error' );
				return array( 'result' => 'failure' );
			}

			$order->update_meta_data( '_order_spp_token', $token );
			$order->update_meta_data( '_paymentToken', $token );
			$order->add_order_note( 'SnappPay paymentToken stored; redirecting.' );
			$order->save();

			return array(
				'result'   => 'success',
				'redirect' => esc_url_raw( $url ),
			);
		}

		/**
		 * Callback verify + settle.
		 *
		 * @return void
		 */
		public function handle_callback() {
			$order_id = isset( $_REQUEST['wc_order'] ) ? absint( $_REQUEST['wc_order'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$order    = $order_id ? wc_get_order( $order_id ) : false;
			$cfg      = Webino_SnappPay_Config::get();

			if ( ! $order instanceof WC_Order ) {
				wp_safe_redirect( wc_get_checkout_url() );
				exit;
			}

			$state = isset( $_POST['state'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['state'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
			if ( 'OK' !== $state ) {
				$order->update_meta_data( 'wc_snapppay_order_notice', $this->format_message( 'failed', $order, $state ? $state : 'cancelled' ) );
				$order->save();
				wc_add_notice( $this->format_message( 'failed', $order, $state ), 'error' );
				wp_safe_redirect( wc_get_checkout_url() );
				exit;
			}

			$token = (string) $order->get_meta( '_order_spp_token' );
			if ( '' === $token ) {
				$token = (string) $order->get_meta( '_paymentToken' );
			}
			if ( '' === $token ) {
				wc_add_notice( $this->format_message( 'failed', $order, 'missing token' ), 'error' );
				wp_safe_redirect( wc_get_checkout_url() );
				exit;
			}

			if ( ! $order->needs_payment() ) {
				wp_safe_redirect( $this->get_return_url( $order ) );
				exit;
			}

			$verify = Webino_SnappPay_Api_Client::verify( $token );
			Webino_Payment_Money::push_log(
				Webino_SnappPay_Config::LOG_OPTION,
				array(
					'action'   => 'verify',
					'order_id' => $order->get_id(),
					'ok'       => ! is_wp_error( $verify ) && ! empty( $verify['successful'] ),
					'detail'   => is_wp_error( $verify ) ? $verify->get_error_message() : wp_json_encode( $verify ),
				)
			);
			if ( is_wp_error( $verify ) || empty( $verify['successful'] ) ) {
				$fault = is_wp_error( $verify ) ? $verify->get_error_message() : 'verify failed';
				$order->add_order_note( 'SnappPay verify failed: ' . $fault );
				$order->update_meta_data( 'wc_snapppay_order_notice', $this->format_message( 'failed', $order, $fault ) );
				$order->save();
				wc_add_notice( $this->format_message( 'failed', $order, $fault ), 'error' );
				wp_safe_redirect( wc_get_checkout_url() );
				exit;
			}

			$settle = Webino_SnappPay_Api_Client::settle( $token );
			Webino_Payment_Money::push_log(
				Webino_SnappPay_Config::LOG_OPTION,
				array(
					'action'   => 'settle',
					'order_id' => $order->get_id(),
					'ok'       => ! is_wp_error( $settle ) && ! empty( $settle['successful'] ),
					'detail'   => is_wp_error( $settle ) ? $settle->get_error_message() : 'ok',
				)
			);
			if ( ! is_wp_error( $settle ) && ! empty( $settle['successful'] ) ) {
				$order->update_meta_data( 'order_spp_status', 'SETTLE' );
				$order->payment_complete( $token );
				$order->add_order_note( 'SnappPay settled.' );
				$order->update_meta_data( 'wc_snapppay_order_notice', $this->format_message( 'success', $order, '' ) );
				$order->save();
				if ( function_exists( 'WC' ) && WC()->cart ) {
					WC()->cart->empty_cart();
				}
				wp_safe_redirect( $this->get_return_url( $order ) );
				exit;
			}

			$order->update_meta_data( 'order_spp_status', 'VERIFY' );
			$order->payment_complete( $token );
			$order->add_order_note( 'SnappPay verified; settle pending/failed.' );
			$order->save();
			wp_safe_redirect( $this->get_return_url( $order ) );
			exit;
		}

		/**
		 * @param string   $kind success|failed|cancelled.
		 * @param WC_Order $order Order.
		 * @param string   $fault Fault.
		 * @return string
		 */
		private function format_message( $kind, WC_Order $order, $fault ) {
			$cfg = Webino_SnappPay_Config::get();
			$map = array(
				'success'   => (string) $cfg['success_message'],
				'failed'    => (string) $cfg['failed_message'],
				'cancelled' => (string) $cfg['cancelled_message'],
			);
			$tpl = isset( $map[ $kind ] ) ? $map[ $kind ] : $map['failed'];
			$token = (string) $order->get_meta( '_order_spp_token' );
			$tx    = (string) $order->get_meta( '_transactionId' );
			return strtr(
				$tpl,
				array(
					'{transactionId}' => $tx,
					'{paymentToken}'  => $token,
					'{fault}'         => (string) $fault,
				)
			);
		}
	}

endif;
