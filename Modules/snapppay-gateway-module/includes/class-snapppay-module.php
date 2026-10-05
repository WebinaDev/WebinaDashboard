<?php
/**
 * SnappPay module lifecycle hooks.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register gateway + storefront/admin behaviors.
 */
final class Webino_SnappPay_Module {

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_hpos' ) );
		if ( Webino_SnappPay_Config::should_register_gateway() ) {
			add_filter( 'woocommerce_payment_gateways', array( __CLASS__, 'register_gateway' ) );
		}
		// Official plugin hooks.php assigns ->title without isset; strip it so our guarded filter runs alone.
		add_action( 'init', array( __CLASS__, 'remove_official_unguarded_gateway_hook' ), 20 );
		add_filter( 'woocommerce_available_payment_gateways', array( __CLASS__, 'filter_gateways' ), 20 );
		add_filter( 'woocommerce_checkout_fields', array( __CLASS__, 'checkout_fields' ) );
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'on_status_changed' ), 20, 3 );
		add_action( 'woocommerce_order_status_processing', array( __CLASS__, 'maybe_update_payment' ), 20 );
		add_action( 'woocommerce_order_status_completed', array( __CLASS__, 'maybe_update_payment' ), 20 );
		add_action( 'woocommerce_single_product_summary', array( __CLASS__, 'pdp_widget' ), 25 );
		add_action( 'woocommerce_single_variation', array( __CLASS__, 'pdp_widget' ), 25 );
		add_action( 'product_cat_add_form_fields', array( __CLASS__, 'commission_add_field' ) );
		add_action( 'product_cat_edit_form_fields', array( __CLASS__, 'commission_edit_field' ) );
		add_action( 'created_product_cat', array( __CLASS__, 'save_commission' ) );
		add_action( 'edited_product_cat', array( __CLASS__, 'save_commission' ) );
		Webino_SnappPay_Config::maybe_refresh_server_ip();
	}

	/**
	 * Drop official snapppay-woocommerce-gateway callback that fatals when gateway was already unset.
	 *
	 * @return void
	 */
	public static function remove_official_unguarded_gateway_hook() {
		$callback = 'show_snapppay_payment_gateway_based_on_cart_amount';
		if ( ! function_exists( $callback ) ) {
			return;
		}
		$priorities = array( 10, 20, 99, 100, 999, PHP_INT_MAX );
		foreach ( $priorities as $priority ) {
			remove_filter( 'woocommerce_available_payment_gateways', $callback, $priority );
		}
		global $wp_filter;
		if ( ! isset( $wp_filter['woocommerce_available_payment_gateways'] ) || ! is_object( $wp_filter['woocommerce_available_payment_gateways'] ) ) {
			return;
		}
		$hook = $wp_filter['woocommerce_available_payment_gateways'];
		if ( empty( $hook->callbacks ) || ! is_array( $hook->callbacks ) ) {
			return;
		}
		foreach ( array_keys( $hook->callbacks ) as $priority ) {
			remove_filter( 'woocommerce_available_payment_gateways', $callback, (int) $priority );
		}
	}

	/**
	 * @return void
	 */
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
		if ( class_exists( 'WC_Gateway_SnappPay', false ) ) {
			$methods[] = 'WC_Gateway_SnappPay';
		}
		return $methods;
	}

	/**
	 * Eligibility gating + dynamic title/description.
	 *
	 * @param array<string,WC_Payment_Gateway> $gateways Gateways.
	 * @return array<string,WC_Payment_Gateway>
	 */
	public static function filter_gateways( $gateways ) {
		$id = Webino_SnappPay_Config::GATEWAY_ID;
		if ( empty( $gateways[ $id ] ) || is_admin() ) {
			return $gateways;
		}
		if ( ! function_exists( 'is_checkout' ) || ( ! is_checkout() && ! is_wc_endpoint_url( 'order-pay' ) ) ) {
			return $gateways;
		}
		$amount = 0;
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$amount = Webino_Payment_Money::to_rial( (float) WC()->cart->total );
		}
		if ( $amount <= 0 ) {
			return $gateways;
		}
		$eligible = Webino_SnappPay_Api_Client::eligible( $amount );
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
		$cfg = Webino_SnappPay_Config::get();
		if ( ! empty( $cfg['default_gateway'] ) && function_exists( 'WC' ) && WC()->session ) {
			WC()->session->set( 'chosen_payment_method', $id );
		}
		return $gateways;
	}

	/**
	 * @param array<string,mixed> $fields Fields.
	 * @return array<string,mixed>
	 */
	public static function checkout_fields( $fields ) {
		$cfg = Webino_SnappPay_Config::get();
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
	 * @param string $from From status.
	 * @param string $to To status.
	 * @return void
	 */
	public static function on_status_changed( $order_id, $from, $to ) {
		if ( ! in_array( $to, array( 'cancelled', 'refunded' ), true ) ) {
			return;
		}
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order ) {
			return;
		}
		if ( Webino_SnappPay_Config::GATEWAY_ID !== $order->get_payment_method() ) {
			return;
		}
		$token = (string) $order->get_meta( '_order_spp_token' );
		if ( '' === $token ) {
			$token = (string) $order->get_meta( '_paymentToken' );
		}
		if ( '' === $token ) {
			return;
		}

		if ( 'pending' === $from ) {
			$status = Webino_SnappPay_Api_Client::status( $token );
			if ( is_wp_error( $status ) || empty( $status['successful'] ) ) {
				$checked = $order->get_meta( '_wc_snapppay_check_status' );
				if ( 'yes' === $checked ) {
					$order->update_status( 'failed' );
				} else {
					$order->update_meta_data( '_wc_snapppay_check_status', 'yes' );
					$order->update_status( $from );
					$order->save();
				}
				return;
			}
			$remote = isset( $status['response']['status'] ) ? (string) $status['response']['status'] : '';
			if ( 'REVERT' === $remote ) {
				$order->update_status( 'failed' );
				return;
			}
			if ( in_array( $remote, array( 'VERIFY', 'PENDING' ), true ) ) {
				$settle = Webino_SnappPay_Api_Client::settle( $token );
				if ( ! is_wp_error( $settle ) && ! empty( $settle['successful'] ) ) {
					$order->update_status( 'processing' );
					return;
				}
			}
			if ( 'SETTLE' === $remote ) {
				$order->update_status( 'processing' );
				return;
			}
		}

		if ( 'refunded' === $to ) {
			$revert = Webino_SnappPay_Api_Client::revert( $token );
			$order->add_order_note(
				is_wp_error( $revert )
					? ( 'SnappPay revert failed: ' . $revert->get_error_message() )
					: 'SnappPay revert requested.'
			);
			return;
		}

		$cancel = Webino_SnappPay_Api_Client::cancel( $token );
		$order->add_order_note(
			is_wp_error( $cancel )
				? ( 'SnappPay cancel failed: ' . $cancel->get_error_message() )
				: 'SnappPay cancel requested.'
		);
	}

	/**
	 * Sync cart via update API when pending/on-hold moves to paid.
	 *
	 * @param int $order_id Order id.
	 * @return void
	 */
	public static function maybe_update_payment( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order ) {
			return;
		}
		if ( Webino_SnappPay_Config::GATEWAY_ID !== $order->get_payment_method() ) {
			return;
		}
		$token = (string) $order->get_meta( '_order_spp_token' );
		if ( '' === $token ) {
			return;
		}
		$payload = array(
			'amount'               => Webino_Payment_Money::order_total_rial( $order ),
			'paymentMethodTypeDto' => 'INSTALLMENT',
			'paymentToken'         => $token,
			'cartList'             => array( Webino_SnappPay_Api_Client::build_cart_list( $order ) ),
			'discountAmount'       => Webino_Payment_Money::to_rial( (float) $order->get_discount_total(), $order->get_currency() ),
		);
		$res = Webino_SnappPay_Api_Client::update_payment( $payload );
		$order->add_order_note(
			is_wp_error( $res )
				? ( 'SnappPay update failed: ' . $res->get_error_message() )
				: 'SnappPay payment updated.'
		);
	}

	/**
	 * @return void
	 */
	public static function pdp_widget() {
		$cfg = Webino_SnappPay_Config::get();
		if ( empty( $cfg['has_pdp'] ) || ! function_exists( 'wc_get_product' ) ) {
			return;
		}
		global $product;
		if ( ! $product ) {
			return;
		}
		$price = Webino_Payment_Money::to_rial( (float) $product->get_price() );
		if ( $price < 50000 || $price > 100000000 ) {
			return;
		}
		$installment = (int) floor( $price / 4 );
		$class       = ! empty( $cfg['dark_pdp'] ) ? 'webino-snapppay-pdp dark' : 'webino-snapppay-pdp';
		echo '<div class="' . esc_attr( $class ) . '" style="margin:12px 0;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;">';
		echo esc_html(
			sprintf(
				/* translators: %s: installment amount */
				__( '۴ قسط ماهانه حدوداً %s ریال با اسنپ پی', 'webino-dashboard' ),
				number_format_i18n( $installment )
			)
		);
		echo '</div>';
	}

	/**
	 * @return void
	 */
	public static function commission_add_field() {
		$cfg = Webino_SnappPay_Config::get();
		if ( empty( $cfg['has_comission'] ) ) {
			return;
		}
		echo '<div class="form-field"><label for="snp_commission_type">' . esc_html__( 'SnappPay commission type', 'webino-dashboard' ) . '</label>';
		echo '<input type="text" name="snp_commission_type" id="snp_commission_type" value="" /></div>';
	}

	/**
	 * @param WP_Term $term Term.
	 * @return void
	 */
	public static function commission_edit_field( $term ) {
		$cfg = Webino_SnappPay_Config::get();
		if ( empty( $cfg['has_comission'] ) ) {
			return;
		}
		$val = get_term_meta( $term->term_id, 'snp_commission_type', true );
		echo '<tr class="form-field"><th><label for="snp_commission_type">' . esc_html__( 'SnappPay commission type', 'webino-dashboard' ) . '</label></th><td>';
		echo '<input type="text" name="snp_commission_type" id="snp_commission_type" value="' . esc_attr( (string) $val ) . '" /></td></tr>';
	}

	/**
	 * @param int $term_id Term id.
	 * @return void
	 */
	public static function save_commission( $term_id ) {
		if ( ! isset( $_POST['snp_commission_type'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return;
		}
		update_term_meta( $term_id, 'snp_commission_type', sanitize_text_field( wp_unslash( (string) $_POST['snp_commission_type'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
	}
}
