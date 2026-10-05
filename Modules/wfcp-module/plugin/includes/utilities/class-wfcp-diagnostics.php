<?php
/**
 * Runtime diagnostics for WFCP (admin-only ?wfcp_diag=1).
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Serves JSON diagnostics on product/cart pages.
 */
class WFCP_Diagnostics {

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'template_redirect', array( __CLASS__, 'maybe_serve' ), 1 );
	}

	/**
	 * @return void
	 */
	public static function maybe_serve() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( empty( $_GET['wfcp_diag'] ) || '1' !== (string) wp_unslash( $_GET['wfcp_diag'] ) ) {
			return;
		}

		if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
			status_header( 403 );
			wp_die( esc_html__( 'Forbidden', 'webina-woo-core' ), '', array( 'response' => 403 ) );
		}

		if ( ! is_product() && ! is_cart() && ! is_checkout() ) {
			status_header( 400 );
			wp_die( esc_html__( 'WFCP diagnostics are only available on product, cart, or checkout pages.', 'webina-woo-core' ) );
		}

		nocache_headers();
		header( 'Content-Type: application/json; charset=utf-8' );

		echo wp_json_encode( self::build_payload(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
		exit;
	}

	/**
	 * @return bool
	 */
	public static function is_pricing_box_rendered() {
		return WFCP_Public::is_pricing_box_rendered();
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function build_payload() {
		global $product;

		$payload = array(
			'wfcp_enabled'        => WFCP_Helper::is_enabled(),
			'ishop_compat_active' => class_exists( 'WFCP_Ishop_Theme_Compat', false ) && WFCP_Ishop_Theme_Compat::is_active(),
			'stylesheet'          => get_stylesheet(),
			'template'            => get_template(),
			'is_product'          => is_product(),
			'is_cart'             => is_cart(),
			'is_checkout'         => is_checkout(),
			'pricing_box_rendered'=> self::is_pricing_box_rendered(),
			'hooks'               => self::get_hook_snapshot(),
			'scripts'             => self::get_script_snapshot(),
		);

		if ( $product && is_a( $product, 'WC_Product' ) ) {
			$payload['product'] = self::get_product_snapshot( $product );
		}

		if ( function_exists( 'WC' ) && WC()->session ) {
			$payload['session'] = array(
				'wfcp_active_checkout_type' => WC()->session->get( 'wfcp_active_checkout_type' ),
				'wfcp_held_cart_items'      => WC()->session->get( 'wfcp_held_cart_items', array() ),
			);
		}

		if ( is_cart() || is_checkout() ) {
			$payload['subcart_groups'] = WFCP_Multi_Cart::group_cart_by_purchase_type();
			$active_type               = WFCP_Gateway_Filter::get_active_purchase_type();
			$payload['gateway']        = array(
				'active_purchase_type' => $active_type,
				'allowed_gateway_ids'  => $active_type ? WFCP_Gateway_Filter::get_allowed_gateway_ids( $active_type ) : array(),
			);
		}

		return $payload;
	}

	/**
	 * @param WC_Product $product Product.
	 * @return array<string,mixed>
	 */
	private static function get_product_snapshot( $product ) {
		$snapshot = array(
			'id'                      => $product->get_id(),
			'type'                    => $product->get_type(),
			'is_in_stock'             => $product->is_in_stock(),
			'is_purchasable'          => $product->is_purchasable(),
			'has_wfcp_pricing'        => WFCP_Helper::product_has_wfcp_pricing( $product ),
			'parent_purchase_price'   => WFCP_Helper::get_product_purchase_price( $product->get_id() ),
		);

		if ( $product->is_type( 'variable' ) ) {
			$variations = array();
			foreach ( $product->get_children() as $variation_id ) {
				$variations[ (string) (int) $variation_id ] = WFCP_Helper::get_product_purchase_price( (int) $variation_id );
			}
			$snapshot['variation_purchase_prices'] = $variations;
		}

		return $snapshot;
	}

	/**
	 * @return array<string,array<string,bool>>
	 */
	private static function get_script_snapshot() {
		$handles = array(
			'underscore',
			'wp-util',
			'wc-add-to-cart-variation',
			'wfcp-public',
			'jquery',
		);

		$snapshot = array();
		foreach ( $handles as $handle ) {
			$snapshot[ $handle ] = array(
				'registered' => wp_script_is( $handle, 'registered' ),
				'enqueued'   => wp_script_is( $handle, 'enqueued' ),
				'to_do'      => wp_script_is( $handle, 'to_do' ),
				'done'       => wp_script_is( $handle, 'done' ),
			);
		}

		return $snapshot;
	}

	/**
	 * @return array<string,array<int,array<string,mixed>>>
	 */
	private static function get_hook_snapshot() {
		global $wp_filter;

		$hooks = array(
			'woocommerce_before_add_to_cart_form',
			'woocommerce_after_add_to_cart_form',
			'woocommerce_single_product_summary',
		);

		$snapshot = array();
		foreach ( $hooks as $hook ) {
			$snapshot[ $hook ] = self::summarize_hook( isset( $wp_filter[ $hook ] ) ? $wp_filter[ $hook ] : null );
		}

		return $snapshot;
	}

	/**
	 * @param WP_Hook|null $hook_object Hook object.
	 * @return array<int,array<string,mixed>>
	 */
	private static function summarize_hook( $hook_object ) {
		if ( ! $hook_object instanceof WP_Hook ) {
			return array();
		}

		$entries = array();
		foreach ( $hook_object->callbacks as $priority => $callbacks ) {
			foreach ( $callbacks as $callback ) {
				$entries[] = array(
					'priority' => (int) $priority,
					'callback' => self::callback_label( $callback['function'] ),
				);
			}
		}

		return $entries;
	}

	/**
	 * @param mixed $callback Callback.
	 * @return string
	 */
	private static function callback_label( $callback ) {
		if ( is_string( $callback ) ) {
			return $callback;
		}
		if ( is_array( $callback ) && isset( $callback[0], $callback[1] ) ) {
			$class = is_object( $callback[0] ) ? get_class( $callback[0] ) : (string) $callback[0];
			return $class . '::' . (string) $callback[1];
		}
		if ( $callback instanceof Closure ) {
			return 'Closure';
		}
		return 'unknown';
	}
}
