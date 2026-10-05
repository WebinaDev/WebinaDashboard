<?php
/**
 * TorobPay module lifecycle hooks.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_TorobPay_Module {

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_hpos' ) );
		if ( Webino_TorobPay_Config::should_register_gateway() ) {
			add_filter( 'woocommerce_payment_gateways', array( __CLASS__, 'register_gateway' ) );
		}
		add_filter( 'woocommerce_available_payment_gateways', array( __CLASS__, 'filter_gateways' ), 20 );
		add_filter( 'woocommerce_checkout_fields', array( __CLASS__, 'checkout_fields' ) );
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'on_status_changed' ), 20, 3 );
		add_action( 'init', array( __CLASS__, 'capture_utm' ) );
		add_action( 'http_api_curl', array( __CLASS__, 'dns_resolve' ), 10, 3 );
		add_action( 'woocommerce_single_product_summary', array( __CLASS__, 'pdp_widget' ), 26 );
		add_action( 'woocommerce_after_shop_loop_item_title', array( __CLASS__, 'badge' ), 11 );
		add_shortcode( 'webino_torobpay_widget', array( __CLASS__, 'shortcode_widget' ) );
		add_shortcode( 'webino_torobpay_topbar', array( __CLASS__, 'shortcode_topbar' ) );
		add_shortcode( 'torobpay_widget', array( __CLASS__, 'shortcode_widget' ) );
		add_shortcode( 'torobpay_topbar', array( __CLASS__, 'shortcode_topbar' ) );
		add_action( 'wp_footer', array( __CLASS__, 'maybe_marquee' ) );
	}

	public static function declare_hpos() {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
				'custom_order_tables',
				dirname( dirname( __FILE__ ) ) . '/bootstrap.php',
				true
			);
		}
	}

	/**
	 * @param string[] $methods Methods.
	 * @return string[]
	 */
	public static function register_gateway( $methods ) {
		if ( class_exists( 'WC_Gateway_TorobPay', false ) ) {
			$methods[] = 'WC_Gateway_TorobPay';
		}
		return $methods;
	}

	/**
	 * @param array<string,WC_Payment_Gateway> $gateways Gateways.
	 * @return array<string,WC_Payment_Gateway>
	 */
	public static function filter_gateways( $gateways ) {
		$id = Webino_TorobPay_Config::GATEWAY_ID;
		if ( empty( $gateways[ $id ] ) || is_admin() ) {
			return $gateways;
		}
		$cfg = Webino_TorobPay_Config::get();

		// UTM exclusive.
		if ( ! empty( $cfg['utm_exclude_others'] ) && self::is_torob_visitor() ) {
			foreach ( array_keys( $gateways ) as $gid ) {
				if ( $gid !== $id ) {
					unset( $gateways[ $gid ] );
				}
			}
		}

		if ( ! function_exists( 'is_checkout' ) || ( ! is_checkout() && ! is_wc_endpoint_url( 'order-pay' ) ) ) {
			return $gateways;
		}

		if ( ! empty( $cfg['disable_payment_retry'] ) && is_wc_endpoint_url( 'order-pay' ) ) {
			$order_id = absint( get_query_var( 'order-pay' ) );
			$order    = $order_id ? wc_get_order( $order_id ) : false;
			if ( $order instanceof WC_Order && $order->has_status( 'failed' ) && $id === $order->get_payment_method() ) {
				unset( $gateways[ $id ] );
				return $gateways;
			}
		}

		$amount = 0;
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$amount = Webino_Payment_Money::to_rial( (float) WC()->cart->total );
		}
		if ( $amount <= 0 ) {
			return $gateways;
		}
		$eligible = Webino_TorobPay_Api_Client::eligible( $amount );
		if ( is_wp_error( $eligible ) ) {
			unset( $gateways[ $id ] );
			return $gateways;
		}
		$resp = isset( $eligible['response'] ) && is_array( $eligible['response'] ) ? $eligible['response'] : $eligible;
		if ( empty( $resp['eligible'] ) ) {
			unset( $gateways[ $id ] );
			return $gateways;
		}
		if ( ! empty( $resp['title_message'] ) ) {
			$gateways[ $id ]->title = (string) $resp['title_message'];
		}
		if ( ! empty( $resp['description'] ) ) {
			$gateways[ $id ]->description = (string) $resp['description'];
		}
		if ( ( ! empty( $cfg['default_gateway'] ) || ( ! empty( $cfg['utm_torob_enabled'] ) && self::is_torob_visitor() ) )
			&& function_exists( 'WC' ) && WC()->session ) {
			WC()->session->set( 'chosen_payment_method', $id );
		}
		return $gateways;
	}

	/**
	 * @return bool
	 */
	public static function is_torob_visitor() {
		return ! empty( $_COOKIE['webino_torob_utm'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	}

	/**
	 * @return void
	 */
	public static function capture_utm() {
		$cfg = Webino_TorobPay_Config::get();
		if ( empty( $cfg['utm_torob_enabled'] ) && empty( $cfg['utm_exclude_others'] ) ) {
			return;
		}
		$src = isset( $_GET['utm_source'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['utm_source'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( 'torob' === strtolower( $src ) ) {
			$ttl = ! empty( $cfg['utm_exclude_others'] ) ? 2 * HOUR_IN_SECONDS : DAY_IN_SECONDS;
			setcookie( 'webino_torob_utm', '1', time() + $ttl, COOKIEPATH ? COOKIEPATH : '/', COOKIE_DOMAIN, is_ssl(), true );
		}
	}

	/**
	 * @param array<string,mixed> $fields Fields.
	 * @return array<string,mixed>
	 */
	public static function checkout_fields( $fields ) {
		$cfg = Webino_TorobPay_Config::get();
		if ( ! empty( $cfg['mobile_enabled'] ) && isset( $fields['billing']['billing_phone'] ) ) {
			$fields['billing']['billing_phone']['required'] = true;
		}
		if ( ! empty( $cfg['postal_enabled'] ) ) {
			if ( isset( $fields['billing']['billing_postcode'] ) ) {
				$fields['billing']['billing_postcode']['required'] = true;
			}
			if ( isset( $fields['shipping']['shipping_postcode'] ) ) {
				$fields['shipping']['shipping_postcode']['required'] = true;
			}
		}
		return $fields;
	}

	/**
	 * @param int    $order_id Order id.
	 * @param string $from From.
	 * @param string $to To.
	 * @return void
	 */
	public static function on_status_changed( $order_id, $from, $to ) {
		if ( ! in_array( $to, array( 'cancelled', 'refunded' ), true ) ) {
			return;
		}
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order || Webino_TorobPay_Config::GATEWAY_ID !== $order->get_payment_method() ) {
			return;
		}
		if ( 'yes' === $order->get_meta( '_torobpay_cancel_confirmed' ) ) {
			return;
		}
		$token = (string) $order->get_meta( '_order_torobpay_token' );
		if ( '' === $token ) {
			return;
		}
		$cancel = Webino_TorobPay_Api_Client::cancel( $token );
		if ( ! is_wp_error( $cancel ) ) {
			$order->update_meta_data( '_torobpay_cancel_confirmed', 'yes' );
			$order->update_meta_data( '_torobpay_cached_status', 'REVERT' );
			$order->save();
		}
		$order->add_order_note(
			is_wp_error( $cancel )
				? ( 'TorobPay cancel failed: ' . $cancel->get_error_message() )
				: 'TorobPay cancel requested.'
		);
	}

	/**
	 * @param resource               $handle Curl handle.
	 * @param array<string,mixed>    $r Request.
	 * @param string                 $url URL.
	 * @return void
	 */
	public static function dns_resolve( $handle, $r, $url ) {
		$cfg = Webino_TorobPay_Config::get();
		if ( empty( $cfg['dns_smart_resolve_enabled'] ) || empty( $cfg['dns_ip_override'] ) ) {
			return;
		}
		$host = wp_parse_url( (string) $cfg['base_url'], PHP_URL_HOST );
		if ( ! $host || false === strpos( (string) $url, (string) $host ) ) {
			return;
		}
		$ip = sanitize_text_field( (string) $cfg['dns_ip_override'] );
		if ( ! filter_var( $ip, FILTER_VALIDATE_IP ) ) {
			return;
		}
		curl_setopt( $handle, CURLOPT_RESOLVE, array( $host . ':443:' . $ip ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	}

	public static function pdp_widget() {
		$cfg = Webino_TorobPay_Config::get();
		if ( empty( $cfg['widget_enabled'] ) ) {
			return;
		}
		global $product;
		if ( ! $product ) {
			return;
		}
		$rial = Webino_Payment_Money::to_rial( (float) $product->get_price() );
		if ( $rial < 50000 ) {
			return;
		}
		echo '<div class="webino-torobpay-pdp" style="margin:12px 0;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;">';
		echo esc_html( sprintf( __( 'اقساط ترب‌پی از حدود %s ریال', 'webino-dashboard' ), number_format_i18n( (int) floor( $rial / 4 ) ) ) );
		echo '</div>';
	}

	public static function badge() {
		$cfg = Webino_TorobPay_Config::get();
		if ( empty( $cfg['badge_enabled'] ) ) {
			return;
		}
		echo '<span class="webino-torobpay-badge" style="display:inline-block;margin-top:6px;font-size:11px;padding:2px 6px;border-radius:999px;background:#111;color:#fff;">TorobPay</span>';
	}

	/**
	 * @return string
	 */
	public static function shortcode_widget() {
		ob_start();
		self::pdp_widget();
		return (string) ob_get_clean();
	}

	/**
	 * @return string
	 */
	public static function shortcode_topbar() {
		$cfg = Webino_TorobPay_Config::get();
		if ( empty( $cfg['topbar_enabled'] ) ) {
			return '';
		}
		return '<div class="webino-torobpay-topbar" style="padding:8px 12px;background:#0f172a;color:#fff;text-align:center;font-size:13px;">' . esc_html__( 'خرید اقساطی با ترب‌پی', 'webino-dashboard' ) . '</div>';
	}

	public static function maybe_marquee() {
		$cfg = Webino_TorobPay_Config::get();
		if ( empty( $cfg['marquee_enabled'] ) ) {
			return;
		}
		echo '<div class="webino-torobpay-marquee" style="position:fixed;bottom:0;left:0;right:0;z-index:40;background:#111;color:#fff;padding:6px 0;overflow:hidden;"><div style="white-space:nowrap;animation:webino-torob-scroll 18s linear infinite;padding-inline:1rem;">' . esc_html__( 'پرداخت اقساطی با ترب‌پی — بدون کارمزد اضافه فروشگاه', 'webino-dashboard' ) . '</div></div>';
		echo '<style>@keyframes webino-torob-scroll{from{transform:translateX(100%)}to{transform:translateX(-100%)}}</style>';
	}
}
