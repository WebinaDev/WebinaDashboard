<?php
/**
 * WooCommerce TorobPay installment gateway (Webina first-party).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WC_Payment_Gateway', false ) ) {
	return;
}

if ( ! class_exists( 'WC_Gateway_TorobPay', false ) ) :

	define( 'WEBINO_TOROBPAY_GATEWAY_OWNED', true );

	/**
	 * Gateway id matches official plugin for order continuity.
	 */
	class WC_Gateway_TorobPay extends WC_Payment_Gateway {

		public function __construct() {
			$this->id                 = Webino_TorobPay_Config::GATEWAY_ID;
			$this->method_title       = __( 'TorobPay', 'webino-dashboard' );
			$this->method_description = __( 'TorobPay installment gateway (Webina).', 'webino-dashboard' );
			$this->has_fields         = false;
			$this->supports           = array( 'products' );
			$this->init_form_fields();
			$this->init_settings();
			$cfg                     = Webino_TorobPay_Config::get();
			$this->enabled           = ! empty( $cfg['enabled'] ) ? 'yes' : 'no';
			$this->title             = (string) $cfg['title'];
			$this->description       = (string) $cfg['description'];
			$this->order_button_text = (string) ( $cfg['order_button_text'] ?? 'پرداخت با ترب‌پی' );
			$this->icon              = apply_filters(
				'webino_torobpay_gateway_icon',
				Webino_TorobPay_Config::resolve_icon_url( (string) ( $cfg['icon_url'] ?? '' ) )
			);
			add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
			add_action( 'woocommerce_receipt_' . $this->id, array( $this, 'receipt_page' ) );
			add_action( 'woocommerce_api_' . strtolower( $this->id ), array( $this, 'handle_callback' ) );
		}

		public function init_form_fields() {
			$this->form_fields = array(
				'enabled'     => array(
					'title'   => __( 'Enable', 'webino-dashboard' ),
					'type'    => 'checkbox',
					'label'   => __( 'Enable TorobPay', 'webino-dashboard' ),
					'default' => 'no',
				),
				'title'       => array(
					'title'   => __( 'Title', 'webino-dashboard' ),
					'type'    => 'text',
					'default' => 'پرداخت اقساطی ترب‌پی',
				),
				'description' => array(
					'title'   => __( 'Description', 'webino-dashboard' ),
					'type'    => 'text',
					'default' => 'پرداخت اقساطی ترب‌پی',
				),
			);
		}

		public function process_admin_options() {
			parent::process_admin_options();
			$cfg                = Webino_TorobPay_Config::get();
			$cfg['enabled']     = ( 'yes' === $this->get_option( 'enabled', 'no' ) );
			$cfg['title']       = (string) $this->get_option( 'title', $cfg['title'] );
			$cfg['description'] = (string) $this->get_option( 'description', $cfg['description'] );
			Webino_TorobPay_Config::save( $cfg );
			return true;
		}

		public function process_payment( $order_id ) {
			$order = wc_get_order( $order_id );
			if ( ! $order instanceof WC_Order ) {
				wc_add_notice( __( 'Order not found.', 'webino-dashboard' ), 'error' );
				return array( 'result' => 'failure' );
			}
			$cfg = Webino_TorobPay_Config::get();
			if ( empty( $cfg['direct_payment'] ) ) {
				return array(
					'result'   => 'success',
					'redirect' => $order->get_checkout_payment_url( true ),
				);
			}
			return $this->start_redirect( $order );
		}

		public function receipt_page( $order_id ) {
			$order = wc_get_order( $order_id );
			if ( ! $order instanceof WC_Order ) {
				return;
			}
			$result = $this->start_redirect( $order );
			if ( ! empty( $result['redirect'] ) ) {
				wp_safe_redirect( $result['redirect'] );
				exit;
			}
			echo '<p>' . esc_html__( 'Could not start TorobPay payment.', 'webino-dashboard' ) . '</p>';
		}

		/**
		 * @param WC_Order $order Order.
		 * @return array<string,mixed>
		 */
		private function start_redirect( WC_Order $order ) {
			$transaction_id = (string) time() . '-' . $order->get_id();
			$order->update_meta_data( '_torobpay_transaction_id', $transaction_id );
			$order->update_meta_data( '_transactionId', $transaction_id );
			$hash = md5( wp_json_encode( array_map( static function ( $i ) {
				return array( $i->get_product_id(), $i->get_quantity(), $i->get_total() );
			}, $order->get_items() ) ) );
			$order->update_meta_data( '_torobpay_items_hash', $hash );
			$order->save();

			$res = Webino_TorobPay_Api_Client::payment_token_for_order( $order, $transaction_id );
			Webino_Payment_Money::push_log(
				Webino_TorobPay_Config::LOG_OPTION,
				array(
					'action'   => 'token',
					'order_id' => $order->get_id(),
					'ok'       => ! is_wp_error( $res ),
					'detail'   => is_wp_error( $res ) ? $res->get_error_message() : 'ok',
				)
			);
			if ( is_wp_error( $res ) ) {
				$order->add_order_note( 'TorobPay token error: ' . $res->get_error_message() );
				wc_add_notice( $this->format_message( 'failed', $order, $res->get_error_message() ), 'error' );
				return array( 'result' => 'failure' );
			}
			$token = '';
			$url   = '';
			if ( ! empty( $res['response']['paymentToken'] ) ) {
				$token = (string) $res['response']['paymentToken'];
			} elseif ( ! empty( $res['paymentToken'] ) ) {
				$token = (string) $res['paymentToken'];
			}
			if ( ! empty( $res['response']['paymentPageUrl'] ) ) {
				$url = (string) $res['response']['paymentPageUrl'];
			} elseif ( ! empty( $res['paymentPageUrl'] ) ) {
				$url = (string) $res['paymentPageUrl'];
			}
			if ( '' === $token || '' === $url ) {
				wc_add_notice( __( 'Invalid TorobPay token response.', 'webino-dashboard' ), 'error' );
				return array( 'result' => 'failure' );
			}
			$order->update_meta_data( '_order_torobpay_token', $token );
			$order->update_meta_data( '_torobpay_cached_status', 'PENDING' );
			$order->add_order_note( 'TorobPay paymentToken stored; redirecting.' );
			$order->save();
			return array(
				'result'   => 'success',
				'redirect' => esc_url_raw( $url ),
			);
		}

		public function handle_callback() {
			$order_id = isset( $_REQUEST['wc_order'] ) ? absint( $_REQUEST['wc_order'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$order    = $order_id ? wc_get_order( $order_id ) : false;
			if ( ! $order instanceof WC_Order ) {
				wp_safe_redirect( wc_get_checkout_url() );
				exit;
			}
			$key = isset( $_REQUEST['key'] ) ? sanitize_text_field( wp_unslash( (string) $_REQUEST['key'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if ( $key && $key !== $order->get_order_key() ) {
				wp_safe_redirect( wc_get_checkout_url() );
				exit;
			}

			// Align with Online Merchant / SnappPay: only proceed when state is OK (if provided).
			$state = '';
			if ( isset( $_POST['state'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
				$state = sanitize_text_field( wp_unslash( (string) $_POST['state'] ) );
			} elseif ( isset( $_REQUEST['state'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$state = sanitize_text_field( wp_unslash( (string) $_REQUEST['state'] ) );
			}
			if ( '' !== $state && 'OK' !== strtoupper( $state ) ) {
				$order->update_meta_data( '_torobpay_cached_status', 'CANCELLED' );
				$order->update_meta_data( 'wc_torobpay_order_notice', $this->format_message( 'failed', $order, $state ) );
				$order->save();
				wc_add_notice( $this->format_message( 'failed', $order, $state ), 'error' );
				wp_safe_redirect( wc_get_checkout_url() );
				exit;
			}

			$token = (string) $order->get_meta( '_order_torobpay_token' );
			if ( '' === $token ) {
				wc_add_notice( $this->format_message( 'failed', $order, 'missing token' ), 'error' );
				wp_safe_redirect( wc_get_checkout_url() );
				exit;
			}
			if ( ! $order->needs_payment() ) {
				wp_safe_redirect( $this->get_return_url( $order ) );
				exit;
			}

			$verify = Webino_TorobPay_Api_Client::verify( $token );
			Webino_Payment_Money::push_log(
				Webino_TorobPay_Config::LOG_OPTION,
				array(
					'action'   => 'verify',
					'order_id' => $order->get_id(),
					'ok'       => ! is_wp_error( $verify ) && ! empty( $verify['successful'] ),
					'detail'   => is_wp_error( $verify ) ? $verify->get_error_message() : 'ok',
				)
			);
			if ( is_wp_error( $verify ) || empty( $verify['successful'] ) ) {
				$fault = is_wp_error( $verify ) ? $verify->get_error_message() : 'verify failed';
				$order->update_meta_data( '_torobpay_cached_status', 'REVERT' );
				$order->update_meta_data( 'wc_torobpay_order_notice', $this->format_message( 'failed', $order, $fault ) );
				$order->add_order_note( 'TorobPay verify failed: ' . $fault );
				$order->save();
				wc_add_notice( $this->format_message( 'failed', $order, $fault ), 'error' );
				wp_safe_redirect( wc_get_checkout_url() );
				exit;
			}

			$order->update_meta_data( '_torobpay_cached_status', 'VERIFY' );
			$settle = Webino_TorobPay_Api_Client::settle( $token );
			Webino_Payment_Money::push_log(
				Webino_TorobPay_Config::LOG_OPTION,
				array(
					'action'   => 'settle',
					'order_id' => $order->get_id(),
					'ok'       => ! is_wp_error( $settle ) && ! empty( $settle['successful'] ),
					'detail'   => is_wp_error( $settle ) ? $settle->get_error_message() : 'ok',
				)
			);
			if ( ! is_wp_error( $settle ) && ! empty( $settle['successful'] ) ) {
				$order->update_meta_data( '_torobpay_cached_status', 'SETTLE' );
				$order->update_meta_data( '_torobpay_settle_handled', 'yes' );
				$order->update_meta_data( '_torobpay_verified_by_api', 'yes' );
				$order->payment_complete( $token );
				$order->add_order_note( 'TorobPay settled.' );
				$order->update_meta_data( 'wc_torobpay_order_notice', $this->format_message( 'success', $order, '' ) );
				$order->save();
				if ( function_exists( 'WC' ) && WC()->cart ) {
					WC()->cart->empty_cart();
				}
				wp_safe_redirect( $this->get_return_url( $order ) );
				exit;
			}

			$order->payment_complete( $token );
			$order->add_order_note( 'TorobPay verified; settle pending/failed.' );
			$order->save();
			wp_safe_redirect( $this->get_return_url( $order ) );
			exit;
		}

		/**
		 * @param string   $kind Kind.
		 * @param WC_Order $order Order.
		 * @param string   $fault Fault.
		 * @return string
		 */
		private function format_message( $kind, WC_Order $order, $fault ) {
			$cfg = Webino_TorobPay_Config::get();
			$tpl = 'success' === $kind ? (string) $cfg['success_message'] : (string) $cfg['failed_message'];
			return strtr(
				$tpl,
				array(
					'{referenceID}' => (string) $order->get_meta( '_torobpay_transaction_id' ),
					'{fault}'       => (string) $fault,
				)
			);
		}
	}

endif;
