<?php
/**
 * Public pay-order page for POS payment-link orders.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Serves /pay-order/{id}/{key} for customers paying pending POS orders.
 */
final class Webino_Dashboard_Pay_Order {

	const QUERY_FLAG = 'webino_pay_order';
	const QUERY_KEY  = 'webino_pay_order_key';

	/**
	 * @var WC_Order|null
	 */
	private static $current_order = null;

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_rewrites' ), 5 );
		add_filter( 'query_vars', array( __CLASS__, 'register_query_vars' ) );
		add_action( 'parse_request', array( __CLASS__, 'parse_request_fallback' ), 2 );
		add_action( 'template_redirect', array( __CLASS__, 'maybe_render' ), 5 );
		add_filter( 'woocommerce_available_payment_gateways', array( __CLASS__, 'filter_gateways' ), 50 );
	}

	/**
	 * @return void
	 */
	public static function register_rewrites() {
		add_rewrite_rule( '^pay-order/([0-9]+)/([^/]+)/?$', 'index.php?' . self::QUERY_FLAG . '=$matches[1]&' . self::QUERY_KEY . '=$matches[2]', 'top' );
	}

	/**
	 * @param array<int,string> $vars Vars.
	 * @return array<int,string>
	 */
	public static function register_query_vars( $vars ) {
		$vars[] = self::QUERY_FLAG;
		$vars[] = self::QUERY_KEY;
		return $vars;
	}

	/**
	 * @param WP $wp WP.
	 * @return void
	 */
	public static function parse_request_fallback( $wp ) {
		if ( ! empty( $wp->query_vars[ self::QUERY_FLAG ] ) ) {
			return;
		}
		$uri  = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( (string) $_SERVER['REQUEST_URI'] ) : '';
		$path = wp_parse_url( $uri, PHP_URL_PATH );
		if ( ! is_string( $path ) || ! preg_match( '#pay-order/([0-9]+)/([^/]+)/?$#', trim( $path, '/' ), $m ) ) {
			return;
		}
		$wp->query_vars[ self::QUERY_FLAG ] = $m[1];
		$wp->query_vars[ self::QUERY_KEY ]  = rawurldecode( $m[2] );
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	public static function public_url( $order ) {
		return home_url( '/pay-order/' . (int) $order->get_id() . '/' . rawurlencode( (string) $order->get_order_key() ) . '/' );
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<int,string>
	 */
	public static function allowed_gateway_ids( $order ) {
		$raw = (string) $order->get_meta( '_webino_pay_gateways' );
		if ( '' === $raw ) {
			return array();
		}
		$decoded = json_decode( $raw, true );
		if ( ! is_array( $decoded ) ) {
			return array();
		}
		$out = array();
		foreach ( $decoded as $id ) {
			$id = sanitize_key( (string) $id );
			if ( '' !== $id ) {
				$out[] = $id;
			}
		}
		return array_values( array_unique( $out ) );
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<int,string>
	 */
	public static function allowed_purchase_types( $order ) {
		$raw = (string) $order->get_meta( '_webino_pay_purchase_types' );
		if ( '' !== $raw ) {
			$decoded = json_decode( $raw, true );
			if ( is_array( $decoded ) && $decoded ) {
				$out = array();
				foreach ( $decoded as $pt ) {
					$pt = sanitize_key( (string) $pt );
					if ( in_array( $pt, array( 'retail', 'credit', 'cash', 'installment' ), true ) ) {
						$out[] = 'credit' === $pt || 'installment' === $pt ? 'credit' : 'retail';
					}
				}
				$out = array_values( array_unique( $out ) );
				if ( $out ) {
					return $out;
				}
			}
		}
		$current = sanitize_key( (string) $order->get_meta( '_wfcp_purchase_type' ) );
		if ( in_array( $current, array( 'credit', 'retail' ), true ) ) {
			return array( $current );
		}
		return array( 'retail' );
	}

	/**
	 * @param array<string,WC_Payment_Gateway> $gateways Gateways.
	 * @return array<string,WC_Payment_Gateway>
	 */
	public static function filter_gateways( $gateways ) {
		$order = self::$current_order;
		if ( ! $order instanceof WC_Order ) {
			$order_id = absint( get_query_var( 'order-pay' ) );
			if ( $order_id > 0 ) {
				$maybe = wc_get_order( $order_id );
				if ( $maybe && '1' === (string) $maybe->get_meta( '_webino_pay_link_order' ) ) {
					$order = $maybe;
				}
			}
		}
		if ( ! $order instanceof WC_Order || '1' !== (string) $order->get_meta( '_webino_pay_link_order' ) ) {
			return $gateways;
		}
		$allowed = self::allowed_gateway_ids( $order );
		if ( ! $allowed ) {
			return $gateways;
		}
		foreach ( array_keys( $gateways ) as $id ) {
			if ( ! in_array( $id, $allowed, true ) ) {
				unset( $gateways[ $id ] );
			}
		}
		return $gateways;
	}

	/**
	 * @return void
	 */
	public static function maybe_render() {
		$order_id = absint( get_query_var( self::QUERY_FLAG ) );
		$key      = (string) get_query_var( self::QUERY_KEY );
		if ( $order_id <= 0 || '' === $key ) {
			return;
		}

		$order = wc_get_order( $order_id );
		if ( ! $order || ! hash_equals( (string) $order->get_order_key(), $key ) ) {
			wp_die( esc_html__( 'Invalid payment link.', 'webino-dashboard' ), esc_html__( 'Payment', 'webino-dashboard' ), array( 'response' => 404 ) );
		}
		if ( '1' !== (string) $order->get_meta( '_webino_pay_link_order' ) ) {
			wp_die( esc_html__( 'This order cannot be paid here.', 'webino-dashboard' ), esc_html__( 'Payment', 'webino-dashboard' ), array( 'response' => 403 ) );
		}

		self::$current_order = $order;

		if ( isset( $_POST['webino_pay_purchase_type'] ) && check_admin_referer( 'webino_pay_order_' . $order_id ) ) {
			$pt = sanitize_key( wp_unslash( (string) $_POST['webino_pay_purchase_type'] ) );
			$allowed = self::allowed_purchase_types( $order );
			$canonical = in_array( $pt, array( 'credit', 'installment' ), true ) ? 'credit' : 'retail';
			if ( in_array( $canonical, $allowed, true ) ) {
				Webino_Dashboard_Order_Writer::recalculate_order_purchase_type( $order, $canonical );
				$order = wc_get_order( $order_id );
				if ( $order ) {
					self::$current_order = $order;
				}
			}
		}

		if ( isset( $_POST['payment_method'] ) && $order->needs_payment() ) {
			self::process_payment( $order );
			return;
		}

		if ( ! $order->needs_payment() ) {
			wp_safe_redirect( $order->get_checkout_order_received_url() );
			exit;
		}

		if ( ! function_exists( 'WC' ) || ! WC()->payment_gateways() ) {
			wp_die( esc_html__( 'Payment is not available.', 'webino-dashboard' ), esc_html__( 'Payment', 'webino-dashboard' ), array( 'response' => 503 ) );
		}

		WC()->customer = new WC_Customer( $order->get_customer_id(), true );
		WC()->session  = new WC_Session_Handler();
		WC()->session->init();

		$template = WEBINO_DASHBOARD_DIR . 'templates/pay-order.php';
		if ( ! is_readable( $template ) ) {
			wp_die( esc_html__( 'Payment template missing.', 'webino-dashboard' ), esc_html__( 'Payment', 'webino-dashboard' ), array( 'response' => 500 ) );
		}

		status_header( 200 );
		nocache_headers();
		include $template;
		exit;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return void
	 */
	private static function process_payment( $order ) {
		$method = isset( $_POST['payment_method'] ) ? sanitize_key( wp_unslash( (string) $_POST['payment_method'] ) ) : '';
		if ( '' === $method ) {
			wc_add_notice( __( 'Please choose a payment method.', 'webino-dashboard' ), 'error' );
			return;
		}
		$allowed = self::allowed_gateway_ids( $order );
		if ( $allowed && ! in_array( $method, $allowed, true ) ) {
			wc_add_notice( __( 'Invalid payment method.', 'webino-dashboard' ), 'error' );
			return;
		}

		$gateways = WC()->payment_gateways()->get_available_payment_gateways();
		if ( ! isset( $gateways[ $method ] ) ) {
			wc_add_notice( __( 'Invalid payment method.', 'webino-dashboard' ), 'error' );
			return;
		}

		$order->set_payment_method( $gateways[ $method ] );
		$order->save();

		$result = $gateways[ $method ]->process_payment( $order->get_id() );
		if ( isset( $result['result'] ) && 'success' === $result['result'] && ! empty( $result['redirect'] ) ) {
			wp_safe_redirect( $result['redirect'] );
			exit;
		}
		if ( isset( $result['result'] ) && 'success' === $result['result'] ) {
			wp_safe_redirect( $order->get_checkout_order_received_url() );
			exit;
		}
		wc_add_notice( __( 'Payment could not be processed.', 'webino-dashboard' ), 'error' );
	}
}
