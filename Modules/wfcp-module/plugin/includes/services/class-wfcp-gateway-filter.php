<?php
/**
 * Payment gateway filtering by WFCP purchase type.
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Filters WooCommerce payment gateways based on active purchase type.
 */
class WFCP_Gateway_Filter {

	/**
	 * Prevent duplicate empty-gateway notices.
	 *
	 * @var bool
	 */
	private static $empty_gateway_notice_added = false;

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_available_payment_gateways', array( __CLASS__, 'filter_gateways' ), 25 );
		add_action( 'woocommerce_before_checkout_form', array( __CLASS__, 'clear_ishop_forbidden_gateway_notice' ), 1 );
		add_action( 'wp', array( __CLASS__, 'clear_ishop_forbidden_gateway_notice' ), 20 );
	}

	/**
	 * ishop payment-gateway.php wraps raw HTTP "Forbidden" as «خطای درگاه Forbidden».
	 * That is not a WFCP block — clear the false-positive so checkout can proceed.
	 *
	 * @return void
	 */
	public static function clear_ishop_forbidden_gateway_notice() {
		if ( ! function_exists( 'is_checkout' ) || ! is_checkout() || is_wc_endpoint_url( 'order-received' ) ) {
			return;
		}

		if ( ! function_exists( 'wc_get_notices' ) || ! function_exists( 'wc_clear_notices' ) ) {
			return;
		}

		$all = wc_get_notices();
		if ( empty( $all ) || ! is_array( $all ) ) {
			return;
		}

		$changed = false;
		foreach ( array( 'error', 'notice', 'success' ) as $type ) {
			if ( empty( $all[ $type ] ) || ! is_array( $all[ $type ] ) ) {
				continue;
			}
			$kept = array();
			foreach ( $all[ $type ] as $notice ) {
				$text = is_array( $notice ) && isset( $notice['notice'] ) ? wp_strip_all_tags( (string) $notice['notice'] ) : wp_strip_all_tags( (string) $notice );
				if ( self::is_ishop_forbidden_gateway_notice( $text ) ) {
					$changed = true;
					continue;
				}
				$kept[] = $notice;
			}
			$all[ $type ] = $kept;
		}

		if ( ! $changed ) {
			return;
		}

		wc_clear_notices();
		foreach ( $all as $type => $notices ) {
			foreach ( $notices as $notice ) {
				$text = is_array( $notice ) && isset( $notice['notice'] ) ? $notice['notice'] : $notice;
				$data = is_array( $notice ) && isset( $notice['data'] ) ? $notice['data'] : array();
				wc_add_notice( $text, $type, $data );
			}
		}
	}

	/**
	 * @param string $text Notice text.
	 * @return bool
	 */
	private static function is_ishop_forbidden_gateway_notice( $text ) {
		$text = trim( $text );
		if ( '' === $text ) {
			return false;
		}

		// Exact / near-exact ishop wrapper around HTTP body "Forbidden".
		if ( false !== stripos( $text, 'خطای درگاه' ) && false !== stripos( $text, 'Forbidden' ) ) {
			return true;
		}

		return 'Forbidden' === $text;
	}

	/**
	 * Map cart purchase type to settings section key.
	 *
	 * @param string $purchase_type Purchase type slug.
	 * @return string
	 */
	public static function purchase_type_to_section( $purchase_type ) {
		$map = array(
			'cash'        => 'retail',
			'credit'      => 'credit',
			'installment' => 'installment',
			'wholesale'   => 'wholesale',
		);

		return isset( $map[ $purchase_type ] ) ? $map[ $purchase_type ] : 'retail';
	}

	/**
	 * Resolve active purchase type for gateway filtering.
	 *
	 * @return string|null
	 */
	public static function get_active_purchase_type() {
		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return null;
		}

		if ( class_exists( 'WFCP_Cart_Manager', false ) && WFCP_Cart_Manager::cart_has_wholesale() ) {
			return 'wholesale';
		}

		$active = WC()->session->get( 'wfcp_active_checkout_type' );
		if ( is_string( $active ) && '' !== $active ) {
			return $active;
		}

		if ( ! WC()->cart || WC()->cart->is_empty() ) {
			return null;
		}

		$types = array();
		foreach ( WC()->cart->get_cart() as $item ) {
			$types[] = isset( $item['wfcp_purchase_type'] ) ? (string) $item['wfcp_purchase_type'] : 'cash';
		}

		$types = array_unique( $types );
		if ( 1 === count( $types ) ) {
			return $types[0];
		}

		return null;
	}

	/**
	 * Allowed gateway IDs for a purchase type.
	 *
	 * @param string $purchase_type Purchase type slug.
	 * @return array<int,string>
	 */
	public static function get_allowed_gateway_ids( $purchase_type ) {
		$section  = self::purchase_type_to_section( $purchase_type );
		$settings = WFCP_Helper::get_settings( $section );

		if ( ! is_array( $settings ) || empty( $settings['gateways'] ) || ! is_array( $settings['gateways'] ) ) {
			return array();
		}

		return array_values( array_filter( array_map( 'sanitize_text_field', $settings['gateways'] ) ) );
	}

	/**
	 * @param array<string,WC_Payment_Gateway> $available Available gateways.
	 * @return array<string,WC_Payment_Gateway>
	 */
	public static function filter_gateways( $available ) {
		if ( ! WFCP_Helper::is_enabled() || ! is_array( $available ) ) {
			return $available;
		}

		if ( ! self::should_filter_gateways() ) {
			return $available;
		}

		$purchase_type = self::get_active_purchase_type();
		if ( ! $purchase_type || ! self::cart_has_wfcp_items() ) {
			return $available;
		}

		$allowed = self::get_allowed_gateway_ids( $purchase_type );
		if ( empty( $allowed ) ) {
			if ( ! self::$empty_gateway_notice_added ) {
				wc_add_notice(
					sprintf(
						/* translators: %s: purchase type label */
						__( 'درگاه پرداخت برای «%s» در تنظیمات WFCP تعریف نشده است. همه درگاه‌های فعال نمایش داده می‌شوند.', 'webina-woo-core' ),
						WFCP_Helper::get_purchase_type_label( $purchase_type )
					),
					'notice'
				);
				self::$empty_gateway_notice_added = true;
			}
			return $available;
		}

		foreach ( array_keys( $available ) as $gateway_id ) {
			if ( ! in_array( $gateway_id, $allowed, true ) ) {
				unset( $available[ $gateway_id ] );
			}
		}

		return $available;
	}

	/**
	 * @return bool
	 */
	private static function should_filter_gateways() {
		if ( is_admin() && ! wp_doing_ajax() ) {
			return false;
		}

		if ( is_cart() ) {
			return false;
		}

		if ( is_checkout() ) {
			return true;
		}

		if ( wp_doing_ajax() ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$action = isset( $_REQUEST['wc-ajax'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['wc-ajax'] ) ) : '';
			return in_array( $action, array( 'checkout', 'update_order_review' ), true );
		}

		return false;
	}

	/**
	 * @return bool
	 */
	private static function cart_has_wfcp_items() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return false;
		}

		foreach ( WC()->cart->get_cart() as $item ) {
			if ( isset( $item['wfcp_purchase_type'] ) ) {
				return true;
			}
		}

		return false;
	}
}
