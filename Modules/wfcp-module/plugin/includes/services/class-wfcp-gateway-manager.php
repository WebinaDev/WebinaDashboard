<?php
/**
 * Gateway Manager Service
 *
 * Handles per-method gateway selection, display badges, and filtering.
 *
 * @package    WFCP
 * @subpackage WFCP/includes/services
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * WFCP_Gateway_Manager
 */
class WFCP_Gateway_Manager {

	/**
	 * Normalize gateway IDs from list or map formats.
	 *
	 * Accepts:
	 * - list: [0 => 'zarinpal', 1 => 'mellat']
	 * - map:  ['zarinpal' => true/'1'/'yes']
	 *
	 * Rejects fake IDs like '', '1', 'true', 'false'.
	 *
	 * @param mixed $gateways Raw setting value.
	 * @return array List of gateway ID strings.
	 */
	public static function normalize_gateway_ids( $gateways ) {
		if ( ! is_array( $gateways ) ) {
			return array();
		}

		$invalid = array( '', '0', '1', 'true', 'false', 'on', 'yes', 'no' );
		$ids     = array();

		foreach ( $gateways as $key => $value ) {
			// Associative map: gateway_id => truthy
			if ( is_string( $key ) && '' !== $key && ! is_numeric( $key ) ) {
				$truthy = in_array( $value, array( true, 1, '1', 'true', 'on', 'yes' ), true ) || true === $value;
				// Also accept if value is the same as key (odd saves) or non-empty string ID mistakenly as value with string key
				if ( $truthy || ( is_string( $value ) && $value === $key ) ) {
					$id = sanitize_text_field( $key );
					if ( $id && ! in_array( strtolower( $id ), $invalid, true ) ) {
						$ids[] = $id;
					}
				}
				continue;
			}

			// Numeric list: index => gateway_id
			if ( is_string( $value ) || is_numeric( $value ) ) {
				$id = sanitize_text_field( (string) $value );
				if ( $id && ! in_array( strtolower( $id ), $invalid, true ) ) {
					$ids[] = $id;
				}
			}
		}

		return array_values( array_unique( $ids ) );
	}

	/**
	 * Get selected gateway IDs for a purchase type.
	 *
	 * @param string $type 'cash'|'retail'|'credit'|'installment'
	 * @return array
	 */
	public static function get_selected_gateways( $type = 'cash' ) {
		$map = array(
			'cash'        => 'retail',
			'retail'      => 'retail',
			'credit'      => 'credit',
			'installment' => 'installment',
			'wholesale'   => 'wholesale',
		);
		$section  = isset( $map[ $type ] ) ? $map[ $type ] : 'retail';
		$gateways = WFCP_Helper::get_settings( $section, 'gateways' );
		return self::normalize_gateway_ids( $gateways );
	}

	/**
	 * Cached gateways to avoid repeated initialization issues.
	 *
	 * @var array|null
	 */
	private static $cached_gateways = null;

	/**
	 * Legacy init method. No longer hooked to 'init' because early calls
	 * can trigger cart access warnings. get_all_gateways() is now lazy + safe.
	 */
	public static function init() {
		// Gateways load on-demand via get_all_gateways(). Register ishop notice cleaner only.
		add_action( 'woocommerce_before_checkout_form', array( __CLASS__, 'clear_ishop_forbidden_gateway_notice' ), 1 );
		add_action( 'wp', array( __CLASS__, 'clear_ishop_forbidden_gateway_notice' ), 20 );
	}

	/**
	 * ishop payment-gateway.php wraps raw HTTP "Forbidden" as «خطای درگاه Forbidden».
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
		$text = trim( (string) $text );
		if ( '' === $text ) {
			return false;
		}
		if ( false !== stripos( $text, 'خطای درگاه' ) && false !== stripos( $text, 'Forbidden' ) ) {
			return true;
		}
		return 'Forbidden' === $text;
	}

	/**
	 * Get all registered WC gateways keyed by id.
	 * Strictly uses get_payment_gateways() + direct property (never the "available" one)
	 * to avoid triggering cart-related filters/fatals in admin settings.
	 *
	 * @return array
	 */
	public static function get_all_gateways() {
		// Return cached result if available
		if ( self::$cached_gateways !== null ) {
			return self::$cached_gateways;
		}

		if ( ! function_exists( 'WC' ) || ! class_exists( 'WC_Payment_Gateways' ) ) {
			self::$cached_gateways = array();
			return array();
		}

		// Get / create the gateways object (accessing the property lazily creates it)
		$gateways_obj = WC()->payment_gateways;

		if ( ! $gateways_obj ) {
			self::$cached_gateways = array();
			return array();
		}

		// Prefer already-populated list — never force ->init() on the storefront.
		if ( method_exists( $gateways_obj, 'get_payment_gateways' ) ) {
			$via_get = $gateways_obj->get_payment_gateways();
			if ( ! empty( $via_get ) ) {
				self::$cached_gateways = $via_get;
				return $via_get;
			}
		}

		// Admin / late contexts only: force full init when still empty.
		if ( is_admin() && method_exists( $gateways_obj, 'init' ) ) {
			$gateways_obj->init();
		}

		$all = array();
		if ( method_exists( $gateways_obj, 'get_payment_gateways' ) ) {
			$all = $gateways_obj->get_payment_gateways();
		}

		if ( empty( $all ) && property_exists( $gateways_obj, 'payment_gateways' ) && is_array( $gateways_obj->payment_gateways ) ) {
			$all = $gateways_obj->payment_gateways;
		}

		if ( is_array( $all ) && ! empty( $all ) ) {
			self::$cached_gateways = $all;
			return $all;
		}

		// Do not cache empty result so a later call in the same request can retry.
		self::$cached_gateways = null;
		return array();
	}

	/**
	 * Get available gateways keyed by id (filters by current user/context).
	 * Note: this intentionally calls the "available" method which may trigger
	 * cart-dependent filters. Only use on frontend after cart is ready.
	 *
	 * @return array
	 */
	public static function get_available_gateways() {
		if ( ! function_exists( 'WC' ) || ! WC()->payment_gateways ) {
			return array();
		}
		// Safe guard similar to the filter
		if ( is_admin() && ! wp_doing_ajax() ) {
			return self::get_all_gateways(); // in pure admin return all instead
		}
		return WC()->payment_gateways->get_available_payment_gateways();
	}

	/**
	 * Render logo-only gateway badges (name on hover via title).
	 * Only shows gateways that are selected and enabled in WooCommerce.
	 *
	 * @param array $gateway_ids
	 * @param array $available
	 * @param bool  $selectable Clickable buttons that set chosen gateway.
	 */
	public static function render_badges( $gateway_ids, $available = null, $selectable = false ) {
		if ( empty( $gateway_ids ) ) {
			return;
		}
		if ( null === $available ) {
			$available = self::get_all_gateways();
		}
		$config = WFCP_Helper::get_settings( 'gateways_config' );
		if ( ! is_array( $config ) ) {
			$config = array();
		}

		$has_any    = false;
		$logos_only = class_exists( 'WFCP_Helper', false ) && WFCP_Helper::installment_gateway_logos_only();
		$wrap_class = 'wfcp-gateways-badges';
		if ( $selectable ) {
			$wrap_class .= ' wfcp-gateways-badges--pick';
		}
		if ( $logos_only ) {
			$wrap_class .= ' wfcp-gateways-badges--logos-only';
		}
		echo '<div class="' . esc_attr( $wrap_class ) . '">';
		foreach ( $gateway_ids as $gid ) {
			if ( ! isset( $available[ $gid ] ) ) {
				continue;
			}
			$gw = $available[ $gid ];

			// Skip WooCommerce-disabled gateways.
			$enabled = isset( $gw->enabled ) ? $gw->enabled : 'no';
			if ( 'yes' !== $enabled ) {
				continue;
			}

			$title = $gw->get_title();
			$icon  = $gw->get_icon();

			// override from config
			if ( isset( $config[ $gid ] ) ) {
				$c = $config[ $gid ];
				if ( ! empty( $c['name'] ) ) {
					$title = $c['name'];
				}
				if ( ! empty( $c['icon'] ) ) {
					$icon_url = $c['icon'];
					if ( is_numeric( $icon_url ) ) {
						$maybe_url = wp_get_attachment_url( intval( $icon_url ) );
						if ( $maybe_url ) {
							$icon_url = $maybe_url;
						}
					}
					$icon = '<img src="' . esc_url( $icon_url ) . '" alt="' . esc_attr( $title ) . '" />';
				}
			}

			$has_any = true;
			$tag     = $selectable ? 'button' : 'span';
			$attrs   = ' class="wfcp-gateway-badge" title="' . esc_attr( $title ) . '" data-name="' . esc_attr( $title ) . '"';
			if ( $selectable ) {
				$attrs .= ' type="button" data-gateway-id="' . esc_attr( (string) $gid ) . '"';
			}
			$attrs .= ' aria-label="' . esc_attr( $title ) . '"';

			echo '<' . $tag . $attrs . '>';
			if ( $icon ) {
				echo '<span class="wfcp-badge-icon">' . wp_kses_post( $icon ) . '</span>';
			} else {
				echo '<span class="wfcp-badge-fallback">' . esc_html( function_exists( 'mb_substr' ) ? mb_substr( $title, 0, 1 ) : substr( $title, 0, 1 ) ) . '</span>';
			}
			if ( $selectable ) {
				echo '<span class="wfcp-badge-name">' . esc_html( $title ) . '</span>';
			}
			echo '</' . $tag . '>';
		}
		echo '</div>';

		if ( ! $has_any ) {
			echo '<span class="wfcp-gateways-empty">' . esc_html__( 'هیچ درگاهی انتخاب نشده', 'webina-woo-core' ) . '</span>';
		}
	}

	/**
	 * Reset gateway cache (call after settings changes).
	 */
	public static function reset_cache() {
		self::$cached_gateways = null;
	}

	/**
	 * Build lowercase ID aliases for a gateway (array key + ->id).
	 *
	 * @param string|int $gid     Array key.
	 * @param object     $gateway Gateway object.
	 * @return array
	 */
	private static function gateway_id_aliases( $gid, $gateway ) {
		$aliases = array( strtolower( trim( strval( $gid ) ) ) );
		if ( is_object( $gateway ) && isset( $gateway->id ) ) {
			$aliases[] = strtolower( trim( strval( $gateway->id ) ) );
		}
		return array_values( array_unique( array_filter( $aliases ) ) );
	}

	/**
	 * Expand stored selected IDs to all known aliases via registered WC gateways.
	 *
	 * Admin may store array keys while checkout available list is keyed by ->id.
	 *
	 * @param array $selected Selected IDs from settings.
	 * @return array Lowercase aliases. Empty if none resolve to a registered gateway.
	 */
	public static function expand_selected_gateway_aliases( $selected ) {
		$selected = self::normalize_gateway_ids( $selected );
		if ( empty( $selected ) ) {
			return array();
		}

		$all      = self::get_all_gateways();
		$aliases  = array();
		$resolved = false;

		foreach ( $selected as $sid ) {
			$sid_l = strtolower( trim( strval( $sid ) ) );
			if ( ! $sid_l ) {
				continue;
			}

			// Always keep the raw stored id as a candidate.
			$aliases[] = $sid_l;

			if ( ! is_array( $all ) || empty( $all ) ) {
				continue;
			}

			foreach ( $all as $gid => $gateway ) {
				$gw_aliases = self::gateway_id_aliases( $gid, $gateway );
				if ( in_array( $sid_l, $gw_aliases, true ) ) {
					$resolved  = true;
					$aliases   = array_merge( $aliases, $gw_aliases );
				}
			}
		}

		$aliases = array_values( array_unique( array_filter( $aliases ) ) );

		// If we have a registered list and nothing matched it, treat config as corrupt.
		if ( is_array( $all ) && ! empty( $all ) && ! $resolved ) {
			return array();
		}

		return $aliases;
	}

	/**
	 * Whether current request is a checkout payment context.
	 *
	 * Themes sometimes hit update_order_review via admin-ajax action instead of wc-ajax.
	 *
	 * @return bool
	 */
	private static function is_checkout_payment_context() {
		if ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'order-pay' ) ) {
			return false;
		}

		if ( function_exists( 'is_checkout' ) && is_checkout()
			&& ( ! function_exists( 'is_order_received_page' ) || ! is_order_received_page() ) ) {
			return true;
		}

		$wc_ajax = isset( $_REQUEST['wc-ajax'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['wc-ajax'] ) ) : '';
		if ( in_array( $wc_ajax, array( 'update_order_review', 'checkout' ), true ) ) {
			return true;
		}

		$action = isset( $_REQUEST['action'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['action'] ) ) : '';
		if ( in_array( $action, array( 'woocommerce_update_order_review', 'update_order_review', 'woocommerce_checkout' ), true ) ) {
			return true;
		}

		if ( function_exists( 'WC' ) && WC() && method_exists( WC(), 'is_rest_api_request' ) && WC()->is_rest_api_request() ) {
			$uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
			if ( false !== strpos( $uri, '/wc/store' ) ) {
				return true;
			}
		}

		return (bool) did_action( 'woocommerce_checkout_update_order_review' );
	}

	/**
	 * Filter available gateways at checkout based on cart purchase type.
	 *
	 * Fail-open ONLY when no valid gateway IDs are configured for the type.
	 * When configured, apply strict intersection with WC available gateways.
	 *
	 * @param array $gateways Available gateways from WooCommerce.
	 * @return array
	 */
	public static function filter_available_gateways( $gateways ) {
		static $filtering = false;

		if ( $filtering ) {
			return $gateways;
		}

		if ( ! is_array( $gateways ) || empty( $gateways ) ) {
			return $gateways;
		}

		if ( ! WFCP_Helper::is_enabled() ) {
			return $gateways;
		}

		if ( is_admin() && ! wp_doing_ajax() && empty( $_REQUEST['wc-ajax'] ) ) {
			return $gateways;
		}

		if ( ! self::is_checkout_payment_context() ) {
			return $gateways;
		}

		if ( ! did_action( 'woocommerce_init' ) || ! function_exists( 'WC' ) || ! WC()->cart ) {
			return $gateways;
		}

		$session_type = null;
		if ( WC()->session ) {
			$raw = WC()->session->get( 'wfcp_purchase_type' );
			if ( $raw && in_array( $raw, array( 'cash', 'credit', 'installment', 'retail', 'wholesale' ), true ) ) {
				$session_type = sanitize_text_field( $raw );
			}
		}

		// Prefer waiting for cart session; allow through if we already know type from session.
		if ( ! did_action( 'woocommerce_cart_loaded_from_session' ) && null === $session_type ) {
			return $gateways;
		}

		$filtering = true;

		try {
			$contents = method_exists( WC()->cart, 'get_cart_contents' )
				? WC()->cart->get_cart_contents()
				: ( isset( WC()->cart->cart_contents ) ? WC()->cart->cart_contents : array() );

			$type          = null;
			$cart_has_items = is_array( $contents ) && ! empty( $contents );

			if ( class_exists( 'WFCP_Cart_Manager', false ) && WFCP_Cart_Manager::cart_has_wholesale() ) {
				$type = 'wholesale';
			} elseif ( is_array( $contents ) ) {
				foreach ( $contents as $item ) {
					if ( ! empty( $item['wfcp_purchase_type'] ) ) {
						$type = sanitize_text_field( $item['wfcp_purchase_type'] );
						break;
					}
				}
			}

			if ( null === $type && null !== $session_type ) {
				$type = $session_type;
			}

			// Legacy cart lines without meta: treat as cash when cart is non-empty.
			if ( ( null === $type || '' === $type ) && $cart_has_items ) {
				$type = 'cash';
			}

			if ( null === $type || '' === $type ) {
				return $gateways;
			}

			if ( 'retail' === $type ) {
				$type = 'cash';
			}

			$selected = self::get_selected_gateways( $type );

			// Resolve settings IDs against ALL registered gateways (key + ->id aliases).
			// Do NOT require them to already be in the "available" list — that caused
			// fail-open to the full list whenever key/id differed.
			$selected_aliases = self::expand_selected_gateway_aliases( $selected );

			// Fail-open only when nothing valid is configured for this purchase type.
			if ( empty( $selected_aliases ) ) {
				return $gateways;
			}

			$filtered = array();
			foreach ( $gateways as $gid => $gateway ) {
				$candidates = self::gateway_id_aliases( $gid, $gateway );
				foreach ( $candidates as $cand ) {
					if ( in_array( $cand, $selected_aliases, true ) ) {
						$filtered[ $gid ] = $gateway;
						break;
					}
				}
			}

			// Selected IDs are valid WC gateways but none available right now
			// (e.g. disabled for currency/country) — return empty filtered list.
			return $filtered;
		} finally {
			$filtering = false;
		}
	}
}
