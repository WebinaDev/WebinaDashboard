<?php
/**
 * Multi-subcart checkout: one purchase type per checkout session.
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Handles grouped cart display and per-type checkout flow.
 */
class WFCP_Multi_Cart {

	const SESSION_HELD_ITEMS         = 'wfcp_held_cart_items';
	const SESSION_ACTIVE_CHECKOUT    = 'wfcp_active_checkout_type';
	const QUERY_CHECKOUT_TYPE        = 'wfcp_checkout_type';
	const QUERY_CHECKOUT_NONCE       = 'wfcp_checkout_nonce';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'template_redirect', array( __CLASS__, 'handle_checkout_request' ), 5 );
		add_action( 'template_redirect', array( __CLASS__, 'maybe_clean_cart_query_args' ), 15 );
		add_action( 'template_redirect', array( __CLASS__, 'maybe_restore_checkout_empty_cart' ), 20 );
		add_action( 'woocommerce_before_cart', array( __CLASS__, 'render_subcart_groups' ), 5 );
		add_action( 'woocommerce_proceed_to_checkout', array( __CLASS__, 'maybe_hide_default_checkout_button' ), 1 );
		add_action( 'woocommerce_check_cart_items', array( __CLASS__, 'validate_mixed_cart_checkout' ) );
		add_action( 'woocommerce_cart_loaded_from_session', array( __CLASS__, 'maybe_restore_abandoned_checkout' ), 20 );
		add_action( 'woocommerce_checkout_create_order', array( __CLASS__, 'save_order_purchase_type_meta' ), 10, 2 );
		add_action( 'woocommerce_checkout_order_processed', array( __CLASS__, 'restore_held_items_after_order' ), 20 );
		add_action( 'woocommerce_thankyou', array( __CLASS__, 'restore_held_items_after_order' ), 5 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_cart_assets' ) );
	}

	/**
	 * @return void
	 */
	public static function enqueue_cart_assets() {
		if ( ! is_cart() || ! WFCP_Helper::is_enabled() ) {
			return;
		}

		wp_enqueue_style(
			'wfcp-cart-subcarts',
			WFCP_PLUGIN_URL . 'public/css/wfcp-cart-subcarts.css',
			array(),
			WFCP_VERSION
		);

		if ( count( self::group_cart_by_purchase_type() ) > 1 ) {
			add_filter( 'body_class', array( __CLASS__, 'add_mixed_cart_body_class' ) );
		}
	}

	/**
	 * @param array $classes Body classes.
	 * @return array
	 */
	public static function add_mixed_cart_body_class( $classes ) {
		$classes[] = 'wfcp-mixed-cart';

		return $classes;
	}

	/**
	 * @return void
	 */
	public static function handle_checkout_request() {
		if ( ! WFCP_Helper::is_enabled() || ! function_exists( 'WC' ) || ! WC()->cart ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( empty( $_GET[ self::QUERY_CHECKOUT_TYPE ] ) ) {
			return;
		}

		if ( ! is_cart() ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$type = sanitize_text_field( wp_unslash( $_GET[ self::QUERY_CHECKOUT_TYPE ] ) );
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$nonce = isset( $_GET[ self::QUERY_CHECKOUT_NONCE ] ) ? sanitize_text_field( wp_unslash( $_GET[ self::QUERY_CHECKOUT_NONCE ] ) ) : '';

		if ( ! wp_verify_nonce( $nonce, 'wfcp_subcart_checkout_' . $type ) ) {
			wc_add_notice( __( 'درخواست نامعتبر است. دوباره تلاش کنید.', 'webina-woo-core' ), 'error' );
			wp_safe_redirect( wc_get_cart_url() );
			exit;
		}

		if ( ! self::initiate_subcart_checkout( $type ) ) {
			wc_add_notice( __( 'سبد خرید انتخاب‌شده خالی است.', 'webina-woo-core' ), 'error' );
			wp_safe_redirect( wc_get_cart_url() );
			exit;
		}

		wp_safe_redirect( wc_get_checkout_url() );
		exit;
	}

	/**
	 * @param string $purchase_type Target purchase type.
	 * @return bool
	 */
	public static function initiate_subcart_checkout( $purchase_type ) {
		if ( ! function_exists( 'WC' ) || ! WC()->cart || ! WC()->session ) {
			return false;
		}

		$held = array();

		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			$item_type = isset( $cart_item['wfcp_purchase_type'] ) ? (string) $cart_item['wfcp_purchase_type'] : 'cash';
			if ( $item_type !== $purchase_type ) {
				$held[ $cart_item_key ] = $cart_item;
				WC()->cart->remove_cart_item( $cart_item_key );
			}
		}

		if ( WC()->cart->is_empty() ) {
			self::restore_held_items_to_cart( $held );
			return false;
		}

		WC()->session->set( self::SESSION_HELD_ITEMS, $held );
		WC()->session->set( self::SESSION_ACTIVE_CHECKOUT, $purchase_type );

		return true;
	}

	/**
	 * Restore held items when user returns to cart without completing checkout.
	 *
	 * @return void
	 */
	public static function maybe_restore_abandoned_checkout() {
		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return;
		}

		$held = WC()->session->get( self::SESSION_HELD_ITEMS, array() );
		if ( empty( $held ) || ! is_array( $held ) ) {
			return;
		}

		if ( is_cart() ) {
			self::restore_held_items_to_cart( $held );
			WC()->session->set( self::SESSION_HELD_ITEMS, array() );
			WC()->session->set( self::SESSION_ACTIVE_CHECKOUT, null );

			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if ( ! empty( $_GET[ self::QUERY_CHECKOUT_TYPE ] ) ) {
				wp_safe_redirect( wc_get_cart_url() );
				exit;
			}
		}
	}

	/**
	 * On checkout with empty cart but held subcart items, restore and send user back to cart.
	 *
	 * @return void
	 */
	public static function maybe_restore_checkout_empty_cart() {
		if ( ! function_exists( 'WC' ) || ! WC()->session || ! WC()->cart ) {
			return;
		}

		if ( ! is_checkout() || is_wc_endpoint_url( 'order-received' ) ) {
			return;
		}

		$held = WC()->session->get( self::SESSION_HELD_ITEMS, array() );
		if ( empty( $held ) || ! is_array( $held ) ) {
			return;
		}

		if ( ! WC()->cart->is_empty() ) {
			return;
		}

		self::restore_held_items_to_cart( $held );
		WC()->session->set( self::SESSION_HELD_ITEMS, array() );
		WC()->session->set( self::SESSION_ACTIVE_CHECKOUT, null );
		wc_add_notice( __( 'سبد خرید بازیابی شد. لطفاً دوباره تسویه را از سبد انجام دهید.', 'webina-woo-core' ), 'notice' );
		wp_safe_redirect( wc_get_cart_url() );
		exit;
	}

	/**
	 * Strip stale subcart query args from cart URL (WAF / bookmark safety).
	 *
	 * @return void
	 */
	public static function maybe_clean_cart_query_args() {
		if ( ! is_cart() ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( empty( $_GET[ self::QUERY_CHECKOUT_TYPE ] ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! empty( $_GET[ self::QUERY_CHECKOUT_NONCE ] ) ) {
			return;
		}

		wp_safe_redirect( wc_get_cart_url() );
		exit;
	}

	/**
	 * @return void
	 */
	public static function maybe_hide_default_checkout_button() {
		if ( count( self::group_cart_by_purchase_type() ) > 1 ) {
			remove_action( 'woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout', 20 );
		}
	}

	/**
	 * @return void
	 */
	public static function validate_mixed_cart_checkout() {
		if ( ! WFCP_Helper::is_enabled() || ! function_exists( 'WC' ) || ! WC()->session ) {
			return;
		}

		if ( is_checkout() ) {
			return;
		}

		if ( WC()->session->get( self::SESSION_ACTIVE_CHECKOUT ) ) {
			return;
		}

		if ( count( self::group_cart_by_purchase_type() ) > 1 ) {
			wc_add_notice( __( 'سبد خرید شما شامل چند روش پرداخت است. لطفاً هر سبد را جداگانه از بخش «سبدهای خرید بر اساس روش پرداخت» تسویه کنید.', 'webina-woo-core' ), 'error' );
		}
	}

	/**
	 * @param WC_Order $order Order.
	 * @param array    $data Checkout data.
	 * @return void
	 */
	public static function save_order_purchase_type_meta( $order, $data ) {
		unset( $data );

		if ( ! function_exists( 'WC' ) || ! WC()->session || ! is_a( $order, 'WC_Order' ) ) {
			return;
		}

		$type = WC()->session->get( self::SESSION_ACTIVE_CHECKOUT );
		if ( is_string( $type ) && '' !== $type ) {
			$order->update_meta_data( '_wfcp_purchase_type', $type );
		}
	}

	/**
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public static function restore_held_items_after_order( $order_id ) {
		unset( $order_id );

		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return;
		}

		$held = WC()->session->get( self::SESSION_HELD_ITEMS, array() );
		if ( empty( $held ) || ! is_array( $held ) ) {
			WC()->session->set( self::SESSION_ACTIVE_CHECKOUT, null );
			return;
		}

		self::restore_held_items_to_cart( $held );
		WC()->session->set( self::SESSION_HELD_ITEMS, array() );
		WC()->session->set( self::SESSION_ACTIVE_CHECKOUT, null );
	}

	/**
	 * @param array<string,array> $held Held cart items keyed by old cart item key.
	 * @return void
	 */
	private static function restore_held_items_to_cart( $held ) {
		if ( ! function_exists( 'WC' ) || ! WC()->cart || empty( $held ) ) {
			return;
		}

		foreach ( $held as $item ) {
			if ( self::cart_contains_equivalent_item( $item ) ) {
				continue;
			}

			$product_id   = isset( $item['product_id'] ) ? (int) $item['product_id'] : 0;
			$quantity     = isset( $item['quantity'] ) ? (int) $item['quantity'] : 1;
			$variation_id = isset( $item['variation_id'] ) ? (int) $item['variation_id'] : 0;
			$variation    = isset( $item['variation'] ) && is_array( $item['variation'] ) ? $item['variation'] : array();

			$cart_item_data = array();
			if ( isset( $item['wfcp_purchase_type'] ) ) {
				$cart_item_data['wfcp_purchase_type'] = $item['wfcp_purchase_type'];
			}
			if ( isset( $item['wfcp_installment_months'] ) ) {
				$cart_item_data['wfcp_installment_months'] = (int) $item['wfcp_installment_months'];
			}

			if ( $product_id > 0 && $quantity > 0 ) {
				WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation, $cart_item_data );
			}
		}
	}

	/**
	 * @return void
	 */
	public static function render_subcart_groups() {
		if ( ! WFCP_Helper::is_enabled() || ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
			return;
		}

		$groups = self::group_cart_by_purchase_type();
		if ( empty( $groups ) ) {
			return;
		}

		require WFCP_PLUGIN_DIR . 'public/partials/wfcp-cart-subcarts.php';
	}

	/**
	 * @param array $item Held cart item.
	 * @return bool
	 */
	private static function cart_contains_equivalent_item( $item ) {
		if ( ! function_exists( 'WC' ) || ! WC()->cart || ! is_array( $item ) ) {
			return false;
		}

		$product_id   = isset( $item['product_id'] ) ? (int) $item['product_id'] : 0;
		$variation_id = isset( $item['variation_id'] ) ? (int) $item['variation_id'] : 0;
		$item_type    = isset( $item['wfcp_purchase_type'] ) ? (string) $item['wfcp_purchase_type'] : 'cash';
		$item_months  = isset( $item['wfcp_installment_months'] ) ? (int) $item['wfcp_installment_months'] : 0;

		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$cart_product_id   = isset( $cart_item['product_id'] ) ? (int) $cart_item['product_id'] : 0;
			$cart_variation_id = isset( $cart_item['variation_id'] ) ? (int) $cart_item['variation_id'] : 0;
			$cart_type         = isset( $cart_item['wfcp_purchase_type'] ) ? (string) $cart_item['wfcp_purchase_type'] : 'cash';
			$cart_months       = isset( $cart_item['wfcp_installment_months'] ) ? (int) $cart_item['wfcp_installment_months'] : 0;

			if ( $product_id === $cart_product_id && $variation_id === $cart_variation_id && $item_type === $cart_type && $item_months === $cart_months ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * @return array<string,array{label:string,items:array<int,array>,subtotal:float}>
	 */
	public static function group_cart_by_purchase_type() {
		$groups = array();

		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return $groups;
		}

		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			$type = isset( $cart_item['wfcp_purchase_type'] ) ? (string) $cart_item['wfcp_purchase_type'] : 'cash';

			if ( ! isset( $groups[ $type ] ) ) {
				$groups[ $type ] = array(
					'label'    => WFCP_Helper::get_purchase_type_label( $type, $cart_item ),
					'items'    => array(),
					'subtotal' => 0.0,
				);
			}

			$line_total = isset( $cart_item['line_subtotal'] ) ? (float) $cart_item['line_subtotal'] : 0.0;
			$groups[ $type ]['items'][ $cart_item_key ] = $cart_item;
			$groups[ $type ]['subtotal']               += $line_total;
		}

		return $groups;
	}

	/**
	 * @param string $purchase_type Purchase type slug.
	 * @return string
	 */
	public static function get_subcart_checkout_url( $purchase_type ) {
		return add_query_arg(
			array(
				self::QUERY_CHECKOUT_TYPE  => $purchase_type,
				self::QUERY_CHECKOUT_NONCE => wp_create_nonce( 'wfcp_subcart_checkout_' . $purchase_type ),
			),
			wc_get_cart_url()
		);
	}
}
