<?php
/**
 * Cart Manager Service
 *
 * @package    WFCP
 * @subpackage WFCP/includes/services
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Cart Manager Service
 */
class WFCP_Cart_Manager {

	/**
	 * Allowed purchase type slugs.
	 *
	 * @return array
	 */
	public static function allowed_purchase_types() {
		return array( 'cash', 'credit', 'installment', 'retail', 'wholesale' );
	}

	/**
	 * Register cart/order hooks (line-item meta + Store API).
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'woocommerce_checkout_create_order_line_item', array( __CLASS__, 'save_order_line_item_meta' ), 10, 4 );
		add_action( 'woocommerce_store_api_checkout_update_order_from_request', array( __CLASS__, 'store_api_persist_purchase_meta' ), 10, 2 );
		add_action( 'woocommerce_checkout_init', array( __CLASS__, 'apply_chosen_gateway' ), 5 );
		add_filter( 'woocommerce_hidden_order_itemmeta', array( __CLASS__, 'hidden_order_itemmeta' ) );
		add_filter( 'woocommerce_order_item_display_meta_key', array( __CLASS__, 'order_item_display_meta_key' ), 10, 3 );
		add_filter( 'woocommerce_order_item_display_meta_value', array( __CLASS__, 'order_item_display_meta_value' ), 10, 3 );
		add_filter( 'woocommerce_cart_item_name', array( __CLASS__, 'cart_item_name_badge' ), 10, 3 );
	}

	/**
	 * Hide internal installment gateway id from customer-facing order views.
	 *
	 * @param array<int,string> $hidden Hidden keys.
	 * @return array<int,string>
	 */
	public static function hidden_order_itemmeta( $hidden ) {
		if ( ! is_array( $hidden ) ) {
			$hidden = array();
		}
		$hidden[] = 'wfcp_gateway';
		return array_values( array_unique( $hidden ) );
	}

	/**
	 * @param string                 $display_key Display key.
	 * @param WC_Meta_Data           $meta        Meta.
	 * @param WC_Order_Item_Product  $item        Item.
	 * @return string
	 */
	public static function order_item_display_meta_key( $display_key, $meta, $item ) {
		unset( $item );
		$key = $meta instanceof WC_Meta_Data ? (string) $meta->get_data()['key'] : '';
		if ( 'wfcp_installment_months' === $key ) {
			return __( 'مدت اقساط', 'webina-woo-core' );
		}
		if ( 'wfcp_installment_total' === $key ) {
			return __( 'مبلغ اقساطی', 'webina-woo-core' );
		}
		if ( 'wfcp_purchase_type' === $key ) {
			return __( 'نوع خرید', 'webina-woo-core' );
		}
		return $display_key;
	}

	/**
	 * @param string                $display_value Display value.
	 * @param WC_Meta_Data          $meta          Meta.
	 * @param WC_Order_Item_Product $item          Item.
	 * @return string
	 */
	public static function order_item_display_meta_value( $display_value, $meta, $item ) {
		unset( $item );
		if ( ! $meta instanceof WC_Meta_Data ) {
			return $display_value;
		}
		$key = (string) $meta->get_data()['key'];
		$val = (string) $meta->get_data()['value'];
		if ( 'wfcp_installment_months' === $key ) {
			$months = (int) $val;
			if ( $months > 0 ) {
				return sprintf( __( '%d ماه', 'webina-woo-core' ), $months );
			}
		}
		if ( 'wfcp_installment_total' === $key ) {
			$amount = (float) $val;
			if ( $amount > 0 ) {
				return wp_strip_all_tags( wc_price( $amount ) );
			}
		}
		if ( 'wfcp_purchase_type' === $key ) {
			$labels = array(
				'cash'        => __( 'نقدی', 'webina-woo-core' ),
				'credit'      => __( 'اعتباری', 'webina-woo-core' ),
				'installment' => __( 'اقساطی', 'webina-woo-core' ),
				'wholesale'   => __( 'عمده', 'webina-woo-core' ),
			);
			$type = sanitize_key( $val );
			return $labels[ $type ] ?? $display_value;
		}
		return $display_value;
	}

	/**
	 * Normalize a raw purchase type slug.
	 *
	 * @param string $raw Raw type.
	 * @return string|null Normalized allowed type or null.
	 */
	public static function normalize_purchase_type( $raw ) {
		$type = sanitize_text_field( (string) $raw );
		if ( 'retail' === $type ) {
			$type = 'cash';
		}
		if ( in_array( $type, self::allowed_purchase_types(), true ) ) {
			return $type;
		}
		return null;
	}

	/**
	 * Purchase type already present on cart lines (first matching item).
	 *
	 * @return string|null cash|credit|installment|… or null when cart empty / unset.
	 */
	public static function cart_dominant_purchase_type() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
			return null;
		}
		foreach ( WC()->cart->get_cart() as $cart_item ) {
			if ( empty( $cart_item['wfcp_purchase_type'] ) ) {
				continue;
			}
			$normalized = self::normalize_purchase_type( $cart_item['wfcp_purchase_type'] );
			if ( $normalized ) {
				return $normalized;
			}
		}
		return null;
	}

	/**
	 * Installment months from an existing cart line when cart is installment.
	 *
	 * @return int
	 */
	public static function cart_dominant_installment_months() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
			return 0;
		}
		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$type = isset( $cart_item['wfcp_purchase_type'] ) ? self::normalize_purchase_type( $cart_item['wfcp_purchase_type'] ) : null;
			if ( 'installment' !== $type ) {
				continue;
			}
			$months = isset( $cart_item['wfcp_installment_months'] ) ? intval( $cart_item['wfcp_installment_months'] ) : 0;
			if ( $months > 0 ) {
				return $months;
			}
		}
		return 0;
	}

	/**
	 * Whether any cart line is stamped wholesale.
	 *
	 * @return bool
	 */
	public static function cart_has_wholesale() {
		if ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::is_partner_shopping() ) {
			return true;
		}
		if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
			return false;
		}
		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$type = isset( $cart_item['wfcp_purchase_type'] ) ? self::normalize_purchase_type( $cart_item['wfcp_purchase_type'] ) : '';
			if ( 'wholesale' === $type ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Site default purchase type from admin settings (enabled modes only).
	 *
	 * @return string cash|credit|installment
	 */
	public static function get_default_purchase_type() {
		if ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::is_partner_shopping() ) {
			return 'wholesale';
		}
		$type = WFCP_Helper::get_settings( 'general', 'default_purchase_type' );
		$normalized = self::normalize_purchase_type( $type ? $type : 'cash' );
		if ( ! $normalized || ! in_array( $normalized, array( 'cash', 'credit', 'installment' ), true ) ) {
			$normalized = 'cash';
		}
		if ( 'credit' === $normalized && ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) ) ) {
			$normalized = 'cash';
		}
		if ( 'installment' === $normalized && ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) ) ) {
			$normalized = 'cash';
		}
		return $normalized;
	}

	/**
	 * Resolve purchase type: existing cart wins, else request/cookie, else admin default.
	 *
	 * ishop theme posts extras as cart_item_data[purchase_type], not top-level.
	 *
	 * @param array $cart_item_data Optional cart item data already passed into the filter.
	 * @return string
	 */
	public static function resolve_purchase_type( $cart_item_data = array() ) {
		if ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::is_partner_shopping() ) {
			return 'wholesale';
		}

		$candidates = array();

		if ( isset( $_REQUEST['purchase_type'] ) ) {
			$candidates[] = wp_unslash( $_REQUEST['purchase_type'] );
		}

		if ( isset( $_REQUEST['cart_item_data'] ) && is_array( $_REQUEST['cart_item_data'] ) ) {
			$nested = wp_unslash( $_REQUEST['cart_item_data'] );
			if ( isset( $nested['purchase_type'] ) ) {
				$candidates[] = $nested['purchase_type'];
			}
			if ( isset( $nested['wfcp_purchase_type'] ) ) {
				$candidates[] = $nested['wfcp_purchase_type'];
			}
		}

		if ( is_array( $cart_item_data ) ) {
			if ( ! empty( $cart_item_data['purchase_type'] ) ) {
				$candidates[] = $cart_item_data['purchase_type'];
			}
			if ( ! empty( $cart_item_data['wfcp_purchase_type'] ) ) {
				$candidates[] = $cart_item_data['wfcp_purchase_type'];
			}
		}

		if ( isset( $_COOKIE['wfcp_purchase_type'] ) ) {
			$candidates[] = wp_unslash( $_COOKIE['wfcp_purchase_type'] );
		}

		$allow_wholesale = class_exists( 'WFCP_Wholesale_Partner', false )
			&& WFCP_Wholesale_Partner::threshold_enabled();

		foreach ( $candidates as $raw ) {
			$type = self::normalize_purchase_type( $raw );
			if ( ! $type ) {
				continue;
			}
			if ( 'wholesale' === $type ) {
				if ( $allow_wholesale ) {
					return $type;
				}
				continue;
			}
			if ( in_array( $type, array( 'cash', 'credit', 'installment' ), true ) ) {
				if ( 'credit' === $type && ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) ) ) {
					continue;
				}
				if ( 'installment' === $type && ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) ) ) {
					continue;
				}
				return $type;
			}
		}

		return self::get_default_purchase_type();
	}

	/**
	 * Resolve installment months from request / cart_item_data / cookie.
	 *
	 * @param array $cart_item_data Optional.
	 * @return int
	 */
	public static function resolve_installment_months( $cart_item_data = array() ) {
		if ( 'installment' === self::cart_dominant_purchase_type() ) {
			$cart_months = self::cart_dominant_installment_months();
			if ( $cart_months > 0 ) {
				return $cart_months;
			}
		}

		$candidates = array();

		if ( isset( $_REQUEST['installment_months'] ) ) {
			$candidates[] = $_REQUEST['installment_months'];
		}

		if ( isset( $_REQUEST['cart_item_data'] ) && is_array( $_REQUEST['cart_item_data'] ) ) {
			$nested = wp_unslash( $_REQUEST['cart_item_data'] );
			if ( isset( $nested['installment_months'] ) ) {
				$candidates[] = $nested['installment_months'];
			}
			if ( isset( $nested['wfcp_installment_months'] ) ) {
				$candidates[] = $nested['wfcp_installment_months'];
			}
		}

		if ( is_array( $cart_item_data ) ) {
			if ( isset( $cart_item_data['installment_months'] ) ) {
				$candidates[] = $cart_item_data['installment_months'];
			}
			if ( isset( $cart_item_data['wfcp_installment_months'] ) ) {
				$candidates[] = $cart_item_data['wfcp_installment_months'];
			}
		}

		if ( isset( $_COOKIE['wfcp_installment_months'] ) ) {
			$candidates[] = $_COOKIE['wfcp_installment_months'];
		}

		foreach ( $candidates as $raw ) {
			$months = intval( $raw );
			if ( $months > 0 ) {
				return $months;
			}
		}

		return 0;
	}

	/**
	 * Resolve chosen payment gateway ID from request / cart / cookie.
	 *
	 * @param array  $cart_item_data Optional cart item data.
	 * @param string $purchase_type  Purchase type for allow-list.
	 * @return string
	 */
	public static function resolve_gateway( $cart_item_data = array(), $purchase_type = '' ) {
		$candidates = array();

		if ( isset( $_REQUEST['wfcp_gateway'] ) ) {
			$candidates[] = wp_unslash( $_REQUEST['wfcp_gateway'] );
		}

		if ( isset( $_REQUEST['cart_item_data'] ) && is_array( $_REQUEST['cart_item_data'] ) ) {
			$nested = wp_unslash( $_REQUEST['cart_item_data'] );
			if ( isset( $nested['wfcp_gateway'] ) ) {
				$candidates[] = $nested['wfcp_gateway'];
			}
		}

		if ( is_array( $cart_item_data ) && ! empty( $cart_item_data['wfcp_gateway'] ) ) {
			$candidates[] = $cart_item_data['wfcp_gateway'];
		}

		if ( isset( $_COOKIE['wfcp_gateway'] ) ) {
			$candidates[] = wp_unslash( $_COOKIE['wfcp_gateway'] );
		}

		$allowed = array();
		if ( $purchase_type && class_exists( 'WFCP_Gateway_Manager', false ) ) {
			$allowed = WFCP_Gateway_Manager::get_selected_gateways( $purchase_type );
			$allowed = array_map( 'strval', is_array( $allowed ) ? $allowed : array() );
		}

		foreach ( $candidates as $raw ) {
			$id = sanitize_key( (string) $raw );
			if ( '' === $id ) {
				continue;
			}
			if ( ! empty( $allowed ) && ! in_array( $id, $allowed, true ) ) {
				continue;
			}
			return $id;
		}

		if ( ! empty( $allowed ) ) {
			return sanitize_key( (string) $allowed[0] );
		}

		return '';
	}

	/**
	 * Apply cart-chosen gateway as Woo checkout payment method.
	 *
	 * @return void
	 */
	public static function apply_chosen_gateway() {
		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return;
		}

		$gid = (string) WC()->session->get( 'wfcp_gateway' );
		if ( '' === $gid && WC()->cart ) {
			foreach ( WC()->cart->get_cart() as $item ) {
				if ( ! empty( $item['wfcp_gateway'] ) ) {
					$gid = sanitize_key( (string) $item['wfcp_gateway'] );
					break;
				}
			}
		}

		if ( '' === $gid ) {
			return;
		}

		WC()->session->set( 'wfcp_gateway', $gid );
		$current = (string) WC()->session->get( 'chosen_payment_method' );
		if ( '' === $current ) {
			WC()->session->set( 'chosen_payment_method', $gid );
		}
	}

	/**
	 * Promote nested theme cart_item_data fields onto $_REQUEST before WC add_to_cart.
	 */
	public static function promote_nested_purchase_fields() {
		if ( empty( $_REQUEST['cart_item_data'] ) || ! is_array( $_REQUEST['cart_item_data'] ) ) {
			return;
		}

		$nested = wp_unslash( $_REQUEST['cart_item_data'] );
		if ( ! is_array( $nested ) ) {
			return;
		}

		if ( empty( $_REQUEST['purchase_type'] ) && ! empty( $nested['purchase_type'] ) ) {
			$_REQUEST['purchase_type'] = sanitize_text_field( $nested['purchase_type'] );
			$_POST['purchase_type']    = $_REQUEST['purchase_type'];
		}

		if ( empty( $_REQUEST['installment_months'] ) && ! empty( $nested['installment_months'] ) ) {
			$_REQUEST['installment_months'] = intval( $nested['installment_months'] );
			$_POST['installment_months']    = $_REQUEST['installment_months'];
		}

		if ( empty( $_REQUEST['wfcp_gateway'] ) && ! empty( $nested['wfcp_gateway'] ) ) {
			$_REQUEST['wfcp_gateway'] = sanitize_text_field( (string) $nested['wfcp_gateway'] );
			$_POST['wfcp_gateway']    = $_REQUEST['wfcp_gateway'];
		}
	}

	/**
	 * Validate cart item addition
	 *
	 * @param bool $passed Validation result.
	 * @param int  $product_id Product ID.
	 * @param int  $quantity Quantity.
	 * @return bool|WP_Error
	 */
	public static function validate_add_to_cart( $passed, $product_id, $quantity ) {
		if ( ! $passed ) {
			return $passed;
		}

		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return $passed;
		}

		$product = wc_get_product( $product_id );
		if ( $product && $product->is_type( 'variable' ) ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$variation_id = isset( $_REQUEST['variation_id'] ) ? (int) $_REQUEST['variation_id'] : 0;
			if ( $variation_id <= 0 ) {
				wc_add_notice( __( 'لطفاً متغیر محصول را انتخاب کنید.', 'webina-woo-core' ), 'error' );
				return false;
			}
		}

		// Mixed types are coerced to the cart's dominant type in resolve_purchase_type().
		return $passed;
	}

	/**
	 * Add purchase type to cart item data
	 *
	 * @param array $cart_item_data Cart item data.
	 * @param int   $product_id     Product ID.
	 * @param int   $variation_id   Variation ID (optional, WC passes 3 args).
	 * @return array
	 */
	public static function add_cart_item_data( $cart_item_data, $product_id, $variation_id = 0 ) {
		self::promote_nested_purchase_fields();

		$purchase_type = self::resolve_purchase_type( is_array( $cart_item_data ) ? $cart_item_data : array() );

		$cart_item_data['wfcp_purchase_type'] = $purchase_type;

		// Drop raw theme keys so they are not treated as opaque cart meta forever.
		unset( $cart_item_data['purchase_type'], $cart_item_data['installment_months'], $cart_item_data['wfcp_gateway'] );

		if ( 'installment' === $purchase_type ) {
			$months = self::resolve_installment_months( $cart_item_data );
			if ( $months > 0 ) {
				$cart_item_data['wfcp_installment_months'] = $months;
			}
		} else {
			unset( $cart_item_data['wfcp_installment_months'] );
		}

		$gateway = self::resolve_gateway( is_array( $cart_item_data ) ? $cart_item_data : array(), $purchase_type );
		if ( $gateway ) {
			$cart_item_data['wfcp_gateway'] = $gateway;
		} else {
			unset( $cart_item_data['wfcp_gateway'] );
		}

		if ( function_exists( 'WC' ) && WC()->session ) {
			WC()->session->set( 'wfcp_purchase_type', $purchase_type );
			if ( 'installment' === $purchase_type && ! empty( $cart_item_data['wfcp_installment_months'] ) ) {
				WC()->session->set( 'wfcp_installment_months', intval( $cart_item_data['wfcp_installment_months'] ) );
			}
			if ( $gateway ) {
				WC()->session->set( 'wfcp_gateway', $gateway );
				WC()->session->set( 'chosen_payment_method', $gateway );
			}
		}

		// Keep cookie aligned with the stamped cart type (helps empty-cart flows).
		if ( ! headers_sent() ) {
			$cookie_path = defined( 'COOKIEPATH' ) && COOKIEPATH ? COOKIEPATH : '/';
			$cookie_domain = defined( 'COOKIE_DOMAIN' ) ? COOKIE_DOMAIN : '';
			setcookie( 'wfcp_purchase_type', $purchase_type, time() + ( 6 * HOUR_IN_SECONDS ), $cookie_path, $cookie_domain, is_ssl(), false );
			if ( 'installment' === $purchase_type && ! empty( $cart_item_data['wfcp_installment_months'] ) ) {
				setcookie( 'wfcp_installment_months', (string) intval( $cart_item_data['wfcp_installment_months'] ), time() + ( 6 * HOUR_IN_SECONDS ), $cookie_path, $cookie_domain, is_ssl(), false );
			} else {
				setcookie( 'wfcp_installment_months', '', time() - YEAR_IN_SECONDS, $cookie_path, $cookie_domain, is_ssl(), false );
			}
			if ( $gateway ) {
				setcookie( 'wfcp_gateway', $gateway, time() + ( 6 * HOUR_IN_SECONDS ), $cookie_path, $cookie_domain, is_ssl(), false );
			} else {
				setcookie( 'wfcp_gateway', '', time() - YEAR_IN_SECONDS, $cookie_path, $cookie_domain, is_ssl(), false );
			}
		}

		return $cart_item_data;
	}

	/**
	 * Append purchase-type badge next to product name (avoids empty ":" meta rows).
	 *
	 * @param string $name      Product name HTML.
	 * @param array  $cart_item Cart item.
	 * @param string $cart_key  Cart key.
	 * @return string
	 */
	public static function cart_item_name_badge( $name, $cart_item, $cart_key = '' ) {
		unset( $cart_key );
		if ( ! is_array( $cart_item ) || empty( $cart_item['wfcp_purchase_type'] ) ) {
			return $name;
		}
		$badge = self::format_purchase_type_badge( $cart_item );
		if ( '' === $badge ) {
			return $name;
		}
		return $name . ' ' . $badge;
	}

	/**
	 * @param array $cart_item Cart item.
	 * @return string HTML badge or empty.
	 */
	public static function format_purchase_type_badge( array $cart_item ) {
		$purchase_type = sanitize_text_field( (string) ( $cart_item['wfcp_purchase_type'] ?? '' ) );
		if ( '' === $purchase_type ) {
			return '';
		}
		if ( 'retail' === $purchase_type ) {
			$purchase_type = 'cash';
		}

		$labels = array(
			'cash'        => __( 'نقدی', 'webina-woo-core' ),
			'credit'      => __( 'اعتباری', 'webina-woo-core' ),
			'installment' => __( 'اقساطی', 'webina-woo-core' ),
			'wholesale'   => __( 'عمده', 'webina-woo-core' ),
		);

		$badge_class = 'cash';
		if ( 'credit' === $purchase_type ) {
			$badge_class = 'credit';
		} elseif ( 'installment' === $purchase_type ) {
			$badge_class = 'installment';
		} elseif ( 'wholesale' === $purchase_type ) {
			$badge_class = 'wholesale';
		}

		$label = isset( $labels[ $purchase_type ] ) ? $labels[ $purchase_type ] : $purchase_type;
		$value = $label;

		if ( 'installment' === $purchase_type && isset( $cart_item['wfcp_installment_months'] ) ) {
			$months = intval( $cart_item['wfcp_installment_months'] );
			if ( $months > 0 ) {
				$value = $label . ' (' . sprintf( __( '%d ماهه', 'webina-woo-core' ), $months ) . ')';
			}
		}

		return sprintf(
			'<span class="wfcp-type-badge wfcp-type-badge--%1$s">%2$s</span>',
			esc_attr( $badge_class ),
			esc_html( $value )
		);
	}

	/**
	 * Display installment monthly amount in cart (purchase badge is on the name).
	 *
	 * @param array $item_data Cart item data.
	 * @param array $cart_item Cart item.
	 * @return array
	 */
	public static function get_item_data( $item_data, $cart_item ) {
		if ( ! is_array( $item_data ) ) {
			$item_data = array();
		}

		if ( ! isset( $cart_item['wfcp_purchase_type'] ) ) {
			return $item_data;
		}

		$purchase_type = sanitize_text_field( $cart_item['wfcp_purchase_type'] );
		if ( 'retail' === $purchase_type ) {
			$purchase_type = 'cash';
		}

		if ( 'installment' === $purchase_type && isset( $cart_item['wfcp_installment_total'] ) && $cart_item['wfcp_installment_total'] > 0 ) {
			$months  = isset( $cart_item['wfcp_installment_months'] ) ? max( 1, intval( $cart_item['wfcp_installment_months'] ) ) : 1;
			$total   = floatval( $cart_item['wfcp_installment_total'] );
			$monthly = $total / $months;
			$formatted = class_exists( 'WFCP_Helper', false )
				? WFCP_Helper::format_price_with_irt_symbol( $monthly )
				: wp_strip_all_tags( wc_price( $monthly ) );
			$item_data[] = array(
				'name'    => __( 'هر قسط', 'webina-woo-core' ),
				'value'   => wp_strip_all_tags( $formatted ),
				'display' => $formatted,
			);
		}

		return $item_data;
	}

	/**
	 * Restore purchase type fields from session.
	 *
	 * @param array $cart_item Cart item.
	 * @param array $values    Session values.
	 * @return array
	 */
	public static function get_cart_item_from_session( $cart_item, $values ) {
		if ( isset( $values['wfcp_purchase_type'] ) ) {
			$cart_item['wfcp_purchase_type'] = sanitize_text_field( $values['wfcp_purchase_type'] );
			if ( function_exists( 'WC' ) && WC()->session ) {
				WC()->session->set( 'wfcp_purchase_type', $cart_item['wfcp_purchase_type'] );
			}
		}
		if ( isset( $values['wfcp_installment_months'] ) ) {
			$cart_item['wfcp_installment_months'] = intval( $values['wfcp_installment_months'] );
		}
		if ( isset( $values['wfcp_installment_total'] ) ) {
			$cart_item['wfcp_installment_total'] = floatval( $values['wfcp_installment_total'] );
		}
		if ( isset( $values['wfcp_gateway'] ) ) {
			$cart_item['wfcp_gateway'] = sanitize_key( (string) $values['wfcp_gateway'] );
			if ( function_exists( 'WC' ) && WC()->session && $cart_item['wfcp_gateway'] ) {
				WC()->session->set( 'wfcp_gateway', $cart_item['wfcp_gateway'] );
				WC()->session->set( 'chosen_payment_method', $cart_item['wfcp_gateway'] );
			}
		}
		if ( isset( $values['wfcp_retail_type'] ) ) {
			$cart_item['wfcp_retail_type'] = sanitize_text_field( $values['wfcp_retail_type'] );
		}
		return $cart_item;
	}

	/**
	 * Apply correct line price based on WFCP purchase type (called on woocommerce_before_calculate_totals).
	 *
	 * @param WC_Cart $cart
	 */
	public static function before_calculate_totals( $cart ) {
		static $running = false;
		if ( $running ) {
			return;
		}
		$running = true;

		if ( class_exists( 'WFCP_Storefront_Price' ) ) {
			WFCP_Storefront_Price::suspend( true );
		}

		if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
			self::finish_totals( $running );
			return;
		}
		if ( ! $cart || ! WFCP_Helper::is_enabled() ) {
			self::finish_totals( $running );
			return;
		}

		$contents = method_exists( $cart, 'get_cart_contents' ) ? $cart->get_cart_contents() : ( isset( $cart->cart_contents ) ? $cart->cart_contents : array() );
		if ( empty( $contents ) || ! is_array( $contents ) ) {
			self::finish_totals( $running );
			return;
		}

		$session_type = null;

		foreach ( $contents as $cart_item_key => $cart_item ) {
			if ( ! isset( $cart_item['wfcp_purchase_type'] ) ) {
				continue;
			}

			if ( ! isset( $cart_item['data'] ) || ! ( $cart_item['data'] instanceof WC_Product ) ) {
				continue;
			}

			$type       = sanitize_text_field( $cart_item['wfcp_purchase_type'] );
			$product    = $cart_item['data'];
			$product_id = $product->get_id();
			$parent_id  = $product->get_parent_id();

			if ( null === $session_type ) {
				$session_type = $type;
			}

			// Locked products keep WooCommerce prices.
			if ( WFCP_Helper::is_product_price_locked( $product_id )
				|| ( $parent_id && WFCP_Helper::is_product_price_locked( $parent_id ) ) ) {
				continue;
			}

			$purchase = WFCP_Helper::get_product_purchase_price( $product_id );
			if ( ! $purchase || $purchase <= 0 ) {
				if ( $parent_id ) {
					$purchase = WFCP_Helper::get_product_purchase_price( $parent_id );
				}
			}
			if ( ! $purchase || $purchase <= 0 ) {
				continue;
			}

			$calc_price = 0;
			$months     = 0;

			if ( 'cash' === $type || 'retail' === $type ) {
				$retail = WFCP_Calculator::calculate_price( $purchase, 'retail', $product_id );
				$sale   = $product->get_sale_price( 'edit' );
				if ( '' !== $sale && null !== $sale && is_numeric( $sale ) ) {
					$sale_f = (float) $sale;
					if ( $sale_f > 0 && $sale_f < $retail && $sale_f >= ( $retail * 0.05 ) ) {
						$calc_price = $sale_f;
					} else {
						$calc_price = $retail;
					}
				} else {
					$calc_price = $retail;
				}
			} elseif ( 'credit' === $type ) {
				if ( ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) ) ) {
					$calc_price = WFCP_Calculator::calculate_price( $purchase, 'retail', $product_id );
				} else {
					$calc_price = WFCP_Calculator::calculate_price( $purchase, 'credit', $product_id );
				}
			} elseif ( 'installment' === $type ) {
				if ( ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) ) ) {
					$calc_price = WFCP_Calculator::calculate_price( $purchase, 'retail', $product_id );
				} else {
					$months = isset( $cart_item['wfcp_installment_months'] ) ? intval( $cart_item['wfcp_installment_months'] ) : 0;
					if ( $months <= 0 ) {
						$months = self::default_installment_months();
					}
					$calc_price = WFCP_Helper::get_full_installment_total( $purchase, $months, $product_id );
				}
			} elseif ( 'wholesale' === $type ) {
				if ( ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'wholesale', 'enabled' ) ) ) {
					$calc_price = WFCP_Calculator::calculate_price( $purchase, 'retail', $product_id );
				} else {
					$calc_price = WFCP_Calculator::calculate_price( $purchase, 'wholesale', $product_id );
				}
			}

			if ( $calc_price > 0 ) {
				$product->set_price( $calc_price );
			}

			if ( $months > 0 && $calc_price > 0 ) {
				$cart->cart_contents[ $cart_item_key ]['wfcp_installment_total'] = $calc_price;
			}
		}

		if ( null !== $session_type && function_exists( 'WC' ) && WC()->session ) {
			WC()->session->set( 'wfcp_purchase_type', $session_type );
		}

		self::finish_totals( $running );
	}

	/**
	 * @param bool $running Running flag by ref.
	 */
	private static function finish_totals( &$running ) {
		if ( class_exists( 'WFCP_Storefront_Price' ) ) {
			WFCP_Storefront_Price::suspend( false );
		}
		$running = false;
	}

	/**
	 * First configured installment plan months, or 3.
	 *
	 * @return int
	 */
	private static function default_installment_months() {
		$plans = WFCP_Helper::get_settings( 'installment', 'plans' );
		if ( is_array( $plans ) ) {
			foreach ( $plans as $plan ) {
				$m = isset( $plan['months'] ) ? intval( $plan['months'] ) : 0;
				if ( $m > 0 ) {
					return $m;
				}
			}
		}
		return 3;
	}

	/**
	 * Persist WFCP metadata on order line items (classic checkout).
	 *
	 * @param WC_Order_Item_Product $item Order item.
	 * @param string                $cart_item_key Cart item key.
	 * @param array                 $values Cart item values.
	 * @param WC_Order              $order Order.
	 * @return void
	 */
	public static function save_order_line_item_meta( $item, $cart_item_key, $values, $order ) {
		unset( $cart_item_key, $order );

		if ( empty( $values['wfcp_purchase_type'] ) ) {
			return;
		}

		$purchase_type = sanitize_text_field( (string) $values['wfcp_purchase_type'] );
		$months        = isset( $values['wfcp_installment_months'] ) ? (int) $values['wfcp_installment_months'] : 0;

		$item->add_meta_data( 'wfcp_purchase_type', $purchase_type, true );
		if ( $months > 0 ) {
			$item->add_meta_data( 'wfcp_installment_months', $months, true );
		}
		if ( ! empty( $values['wfcp_gateway'] ) ) {
			$item->add_meta_data( 'wfcp_gateway', sanitize_key( (string) $values['wfcp_gateway'] ), true );
		}
		if ( ! empty( $values['wfcp_installment_total'] ) ) {
			$item->add_meta_data( 'wfcp_installment_total', (float) $values['wfcp_installment_total'], true );
		}
	}

	/**
	 * Persist purchase type from cart session onto Store API / Blocks checkout orders.
	 *
	 * @param WC_Order        $order Order.
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	public static function store_api_persist_purchase_meta( $order, $request ) {
		unset( $request );
		if ( ! $order instanceof WC_Order || ! function_exists( 'WC' ) || ! WC()->cart ) {
			return;
		}

		$cart_items = WC()->cart->get_cart();
		foreach ( $order->get_items( 'line_item' ) as $item ) {
			if ( ! $item instanceof WC_Order_Item_Product ) {
				continue;
			}
			$product_id   = (int) $item->get_product_id();
			$variation_id = (int) $item->get_variation_id();
			foreach ( $cart_items as $cart_item ) {
				$cid = isset( $cart_item['product_id'] ) ? (int) $cart_item['product_id'] : 0;
				$vid = isset( $cart_item['variation_id'] ) ? (int) $cart_item['variation_id'] : 0;
				if ( $cid !== $product_id || $vid !== $variation_id ) {
					continue;
				}
				if ( empty( $cart_item['wfcp_purchase_type'] ) ) {
					break;
				}
				$item->add_meta_data( 'wfcp_purchase_type', sanitize_text_field( (string) $cart_item['wfcp_purchase_type'] ), true );
				if ( ! empty( $cart_item['wfcp_installment_months'] ) ) {
					$item->add_meta_data( 'wfcp_installment_months', (int) $cart_item['wfcp_installment_months'], true );
				}
				if ( ! empty( $cart_item['wfcp_gateway'] ) ) {
					$item->add_meta_data( 'wfcp_gateway', sanitize_key( (string) $cart_item['wfcp_gateway'] ), true );
				}
				break;
			}
		}
	}

	/**
	 * Clear purchase-type session when cart is emptied.
	 */
	public static function clear_purchase_type_session() {
		if ( function_exists( 'WC' ) && WC()->session ) {
			WC()->session->set( 'wfcp_purchase_type', null );
			WC()->session->set( 'wfcp_gateway', null );
		}
	}

	/**
	 * AJAX: update entire cart to new purchase type (global switcher).
	 */
	public static function ajax_update_cart_type() {
		check_ajax_referer( 'wfcp_public_nonce', 'nonce' );

		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			wp_send_json_error( array( 'message' => 'سبد خرید در دسترس نیست' ) );
		}

		$new_type = isset( $_POST['new_type'] ) ? sanitize_text_field( $_POST['new_type'] ) : '';
		if ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::is_partner_shopping() ) {
			wp_send_json_error( array( 'message' => __( 'سبد همکار فقط با قیمت عمده محاسبه می‌شود.', 'webina-woo-core' ) ) );
		}
		$allowed = array( 'cash', 'credit', 'installment' );
		if ( ! in_array( $new_type, $allowed, true ) ) {
			wp_send_json_error( array( 'message' => 'نوع پرداخت نامعتبر' ) );
		}

		$cart = WC()->cart;
		if ( $cart->is_empty() ) {
			wp_send_json_error( array( 'message' => 'سبد خرید خالی است' ) );
		}

		$plans = WFCP_Helper::get_settings( 'installment', 'plans' );
		$default_months = 3;
		if ( is_array( $plans ) && ! empty( $plans[0]['months'] ) ) {
			$default_months = intval( $plans[0]['months'] );
		}

		foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
			$existing = isset( $cart_item['wfcp_purchase_type'] ) ? self::normalize_purchase_type( $cart_item['wfcp_purchase_type'] ) : '';
			if ( 'wholesale' === $existing ) {
				continue;
			}
			WC()->cart->cart_contents[ $cart_item_key ]['wfcp_purchase_type'] = $new_type;

			if ( 'installment' === $new_type ) {
				if ( empty( WC()->cart->cart_contents[ $cart_item_key ]['wfcp_installment_months'] ) ) {
					WC()->cart->cart_contents[ $cart_item_key ]['wfcp_installment_months'] = $default_months;
				}
			} else {
				unset( WC()->cart->cart_contents[ $cart_item_key ]['wfcp_installment_months'] );
				unset( WC()->cart->cart_contents[ $cart_item_key ]['wfcp_installment_total'] );
			}
		}

		if ( WC()->session ) {
			WC()->session->set( 'wfcp_purchase_type', $new_type );
		}

		$cart->set_session();
		$cart->calculate_totals();

		$fragments = self::build_cart_type_fragments();

		wp_send_json_success(
			array(
				'message'   => 'نوع پرداخت سبد خرید تغییر کرد',
				'fragments' => $fragments,
				'cart_hash' => $cart->get_cart_hash(),
			)
		);
	}

	/**
	 * Mini-cart (+ optional totals) fragments after purchase-type change.
	 * Do not replace the full cart form — that nests cart HTML on ishop themes.
	 *
	 * @return array<string,string>
	 */
	private static function build_cart_type_fragments() {
		$fragments = array();

		if ( function_exists( 'woocommerce_mini_cart' ) ) {
			ob_start();
			woocommerce_mini_cart();
			$mini = ob_get_clean();
			if ( $mini ) {
				$fragments['div.widget_shopping_cart_content'] = '<div class="widget_shopping_cart_content">' . $mini . '</div>';
			}
		}

		$fragments = apply_filters( 'woocommerce_add_to_cart_fragments', $fragments );

		if ( function_exists( 'wc_get_template' ) ) {
			ob_start();
			wc_get_template( 'cart/cart-totals.php' );
			$totals = ob_get_clean();
			if ( $totals ) {
				$fragments['.cart_totals'] = $totals;
			}
		}

		if ( class_exists( 'WFCP_Multi_Cart', false ) && method_exists( 'WFCP_Multi_Cart', 'render_subcart_groups' ) ) {
			ob_start();
			WFCP_Multi_Cart::render_subcart_groups();
			$sub = trim( (string) ob_get_clean() );
			if ( '' !== $sub ) {
				$fragments['.wfcp-subcarts'] = $sub;
			}
		}

		return $fragments;
	}
}

