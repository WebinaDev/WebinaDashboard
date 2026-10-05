<?php
/**
 * REST bridge for bundled WFCP (settings, bulk list, quick add, advanced tools).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers webino-dashboard/v1/wfcp/* routes.
 */
final class Webino_Dashboard_REST_WFCP {

	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * @return bool
	 */
	public static function wfcp_available() {
		return class_exists( 'WFCP_Helper', false );
	}

	/**
	 * @return bool
	 */
	public static function can_edit_products() {
		return Webino_Dashboard_Rest_Base::can( 'edit_products' );
	}

	/**
	 * @return bool
	 */
	public static function can_manage_woocommerce() {
		return Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
	}

	/**
	 * WFCP settings tab module ids (sidebar).
	 *
	 * @return array<int,string>
	 */
	private static function wfcp_settings_module_ids() {
		return array(
			'wfcp-dashboard',
			'wfcp-currency',
			'wfcp-exchange',
			'wfcp-retail',
			'wfcp-credit',
			'wfcp-installment',
			'wfcp-wholesale',
			'wfcp-notifications',
			'wfcp-style',
			'wfcp-advanced',
		);
	}

	/**
	 * @param string $slug Module id.
	 * @return true|WP_Error
	 */
	private static function require_module_enabled( $slug ) {
		if ( ! Webino_Dashboard_Modules::is_module_enabled( $slug ) ) {
			return new WP_Error(
				'webino_module_disabled',
				__( 'This dashboard module is disabled.', 'webino-dashboard' ),
				array( 'status' => 403 )
			);
		}
		return true;
	}

	/**
	 * @return true|WP_Error
	 */
	private static function require_any_wfcp_settings_module() {
		foreach ( self::wfcp_settings_module_ids() as $id ) {
			if ( Webino_Dashboard_Modules::is_module_enabled( $id ) ) {
				return true;
			}
		}
		return new WP_Error(
			'webino_module_disabled',
			__( 'WFCP settings are disabled in dashboard preferences.', 'webino-dashboard' ),
			array( 'status' => 403 )
		);
	}

	/**
	 * Map REST settings section to dashboard module id.
	 *
	 * @param string $section Section key from route.
	 * @return string|null
	 */
	private static function settings_section_module_id( $section ) {
		$map = array(
			'general'       => 'wfcp-dashboard',
			'currency'      => 'wfcp-currency',
			'exchange'      => 'wfcp-exchange',
			'retail'        => 'wfcp-retail',
			'credit'        => 'wfcp-credit',
			'installment'   => 'wfcp-installment',
			'wholesale'     => 'wfcp-wholesale',
			'notifications' => 'wfcp-notifications',
			'style'         => 'wfcp-style',
			'advanced'      => 'wfcp-advanced',
			// Marketplace channel pricing (same gate as retail settings).
			'digikala'      => 'wfcp-retail',
			'basalam'       => 'wfcp-retail',
			'technolife'    => 'wfcp-retail',
			'snappshop'     => 'wfcp-retail',
			'tapsishop'     => 'wfcp-retail',
			'zarehbin'      => 'wfcp-retail',
			'emalls'        => 'wfcp-retail',
			'snapppay-search' => 'wfcp-retail',
			'torob'         => 'wfcp-retail',
		);
		return isset( $map[ $section ] ) ? $map[ $section ] : null;
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function perm_lookup() {
		if ( ! self::can_edit_products() ) {
			return false;
		}
		return self::require_module_enabled( 'wfcp-bulk' );
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function perm_settings_get() {
		if ( ! self::can_edit_products() ) {
			return false;
		}
		return self::require_any_wfcp_settings_module();
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return bool|WP_Error
	 */
	public static function perm_settings_save( WP_REST_Request $req ) {
		if ( ! self::can_edit_products() ) {
			return false;
		}
		$section = sanitize_key( (string) $req['section'] );
		$mod     = self::settings_section_module_id( $section );
		if ( null === $mod ) {
			return new WP_Error(
				'webino_wfcp_bad_section',
				__( 'Unknown settings section.', 'webino-dashboard' ),
				array( 'status' => 400 )
			);
		}
		return self::require_module_enabled( $mod );
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function perm_exchange() {
		if ( ! self::can_edit_products() ) {
			return false;
		}
		return self::require_module_enabled( 'wfcp-exchange' );
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function perm_quick_add() {
		if ( ! self::can_edit_products() ) {
			return false;
		}
		return self::require_module_enabled( 'wfcp-quick' );
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function perm_bulk_editor() {
		if ( ! self::can_edit_products() ) {
			return false;
		}
		return self::require_module_enabled( 'wfcp-bulk' );
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function perm_advanced() {
		if ( ! self::can_edit_products() ) {
			return false;
		}
		return self::require_module_enabled( 'wfcp-advanced' );
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function perm_price_changer() {
		if ( ! self::can_manage_woocommerce() ) {
			return false;
		}
		return self::require_module_enabled( 'wfcp-price' );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		if ( ! self::wfcp_available() ) {
			return;
		}

		register_rest_route(
			self::NS,
			'/wfcp/lookup',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'lookup' ),
				'permission_callback' => array( __CLASS__, 'perm_lookup' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'settings_get' ),
				'permission_callback' => array( __CLASS__, 'perm_settings_get' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/shipping-methods',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'shipping_methods' ),
				'permission_callback' => array( __CLASS__, 'perm_settings_get' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/stats',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'stats_get' ),
				'permission_callback' => array( __CLASS__, 'perm_settings_get' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/products/(?P<id>\d+)/reference-fetch',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'reference_fetch' ),
				'permission_callback' => array( __CLASS__, 'perm_quick_add' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/settings/(?P<section>[a-z0-9\-]+)',
			array(
				'methods'             => array( 'POST', 'PUT', 'PATCH' ),
				'callback'            => array( __CLASS__, 'settings_save' ),
				'permission_callback' => array( __CLASS__, 'perm_settings_save' ),
				'args'                => array(
					'section' => array(
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/exchange/test',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'exchange_test' ),
				'permission_callback' => array( __CLASS__, 'perm_exchange' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/exchange/fetch',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'exchange_fetch' ),
				'permission_callback' => array( __CLASS__, 'perm_exchange' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/quick-add',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'quick_add' ),
				'permission_callback' => array( __CLASS__, 'perm_quick_add' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/bulk-products',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'bulk_products' ),
				'permission_callback' => array( __CLASS__, 'perm_bulk_editor' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/bulk-products/(?P<id>\d+)/purchase-price',
			array(
				'methods'             => 'PATCH',
				'callback'            => array( __CLASS__, 'bulk_patch_purchase' ),
				'permission_callback' => array( __CLASS__, 'perm_bulk_editor' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/bulk-products/(?P<id>\d+)/wc-price',
			array(
				'methods'             => 'PATCH',
				'callback'            => array( __CLASS__, 'bulk_patch_wc_price' ),
				'permission_callback' => array( __CLASS__, 'perm_bulk_editor' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/bulk-products/(?P<id>\d+)/stock',
			array(
				'methods'             => 'PATCH',
				'callback'            => array( __CLASS__, 'bulk_patch_stock' ),
				'permission_callback' => array( __CLASS__, 'perm_bulk_editor' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/bulk-products/(?P<id>\d+)/lock',
			array(
				'methods'             => 'PATCH',
				'callback'            => array( __CLASS__, 'bulk_patch_lock' ),
				'permission_callback' => array( __CLASS__, 'perm_bulk_editor' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/bulk-products/(?P<id>\d+)/brand',
			array(
				'methods'             => 'PATCH',
				'callback'            => array( __CLASS__, 'bulk_patch_brand' ),
				'permission_callback' => array( __CLASS__, 'perm_bulk_editor' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/bulk-products/(?P<id>\d+)/wholesale-rule',
			array(
				'methods'             => 'PATCH',
				'callback'            => array( __CLASS__, 'bulk_patch_wholesale_rule' ),
				'permission_callback' => array( __CLASS__, 'perm_bulk_editor' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/advanced/recalculate-all',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'advanced_recalculate' ),
				'permission_callback' => array( __CLASS__, 'perm_advanced' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/advanced/recalculate-state',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'advanced_recalculate_state' ),
				'permission_callback' => array( __CLASS__, 'perm_advanced' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/advanced/delete-transients',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'advanced_delete_transients' ),
				'permission_callback' => array( __CLASS__, 'perm_advanced' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/advanced/export-settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'advanced_export' ),
				'permission_callback' => array( __CLASS__, 'perm_advanced' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/advanced/import-settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'advanced_import' ),
				'permission_callback' => array( __CLASS__, 'perm_advanced' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/bulk-price-change/start',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'bulk_price_start' ),
				'permission_callback' => array( __CLASS__, 'perm_price_changer' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/bulk-price-change/state',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'bulk_price_state' ),
				'permission_callback' => array( __CLASS__, 'perm_price_changer' ),
			)
		);

		register_rest_route(
			self::NS,
			'/wfcp/bulk-price-change/cancel',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'bulk_price_cancel' ),
				'permission_callback' => array( __CLASS__, 'perm_price_changer' ),
			)
		);
	}

	/**
	 * @param string               $section Section key.
	 * @param array<string,mixed> $data    Raw data.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function sanitize_wfcp_section( $section, $data ) {
		if ( ! class_exists( 'WFCP_Admin', false ) ) {
			return new WP_Error( 'wfcp_missing', __( 'WFCP admin is not available.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$ref = new ReflectionMethod( 'WFCP_Admin', 'sanitize_settings_data' );
		$ref->setAccessible( true );
		$admin = new WFCP_Admin();
		$out   = $ref->invoke( $admin, $section, is_array( $data ) ? $data : array() );
		return is_array( $out ) ? $out : array();
	}

	/**
	 * Product categories + brands for bulk editor filters.
	 *
	 * @return WP_REST_Response
	 */
	public static function lookup() {
		$cats = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
			)
		);
		$cat_out = array();
		if ( ! is_wp_error( $cats ) ) {
			foreach ( $cats as $t ) {
				$cat_out[] = array(
					'id'   => (int) $t->term_id,
					'slug' => $t->slug,
					'name' => $t->name,
				);
			}
		}
		$brands = get_terms(
			array(
				'taxonomy'   => 'product_brand',
				'hide_empty' => false,
			)
		);
		$brand_out = array();
		if ( ! is_wp_error( $brands ) ) {
			foreach ( $brands as $t ) {
				$brand_out[] = array(
					'id'   => (int) $t->term_id,
					'slug' => $t->slug,
					'name' => $t->name,
				);
			}
		}
		return new WP_REST_Response(
			array(
				'categories' => $cat_out,
				'brands'     => $brand_out,
			)
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_get() {
		return new WP_REST_Response( WFCP_Helper::get_settings() );
	}

	/**
	 * Enabled WooCommerce shipping methods for wholesale picker.
	 *
	 * @return WP_REST_Response
	 */
	public static function shipping_methods() {
		$methods = array();
		if ( class_exists( 'Webino_Dashboard_Orders', false ) ) {
			foreach ( Webino_Dashboard_Orders::get_shipping_method_options() as $row ) {
				if ( ! is_array( $row ) || empty( $row['id'] ) || 'other' === $row['id'] ) {
					continue;
				}
				$methods[] = array(
					'id'    => (string) $row['id'],
					'title' => (string) ( $row['title'] ?? $row['id'] ),
				);
			}
		}
		return new WP_REST_Response( array( 'methods' => $methods ) );
	}

	/**
	 * Lightweight dashboard stats for the pricing overview tab.
	 *
	 * @return WP_REST_Response
	 */
	public static function stats_get() {
		$total = 0;
		$with_purchase = 0;
		$locked = 0;
		if ( function_exists( 'wp_count_posts' ) ) {
			$counts = wp_count_posts( 'product' );
			$total  = (int) ( $counts->publish ?? 0 ) + (int) ( $counts->draft ?? 0 ) + (int) ( $counts->private ?? 0 );
		}
		$ids = get_posts(
			array(
				'post_type'      => 'product',
				'post_status'    => array( 'publish', 'draft', 'private' ),
				'posts_per_page' => 500,
				'fields'         => 'ids',
				'no_found_rows'  => true,
			)
		);
		foreach ( (array) $ids as $pid ) {
			$pid = (int) $pid;
			if ( class_exists( 'WFCP_Helper' ) ) {
				if ( WFCP_Helper::get_product_purchase_price( $pid ) ) {
					$with_purchase++;
				}
				if ( WFCP_Helper::is_product_price_locked( $pid ) ) {
					$locked++;
				}
			} else {
				if ( (float) get_post_meta( $pid, '_wfcp_purchase_price', true ) > 0 ) {
					$with_purchase++;
				}
				if ( '1' === (string) get_post_meta( $pid, '_wfcp_lock_price', true ) ) {
					$locked++;
				}
			}
		}
		$general = class_exists( 'WFCP_Helper' ) ? (array) WFCP_Helper::get_settings( 'general' ) : array();
		return new WP_REST_Response(
			array(
				'total_products'      => $total,
				'products_with_price' => $with_purchase,
				'products_locked'     => $locked,
				'sampled'             => count( (array) $ids ),
				'enabled'             => ! empty( $general['enabled'] ),
				'exchange_rate'       => (float) ( $general['exchange_rate'] ?? 0 ),
				'currency'            => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : (string) ( $general['currency'] ?? 'IRT' ),
			)
		);
	}

	/**
	 * Fetch reference price/stock for one product.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function reference_fetch( WP_REST_Request $req ) {
		$id = (int) $req['id'];
		if ( $id <= 0 || ! function_exists( 'wc_get_product' ) || ! wc_get_product( $id ) ) {
			return new WP_Error( 'wfcp_bad_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body = $req->get_json_params();
		$url  = is_array( $body ) ? esc_url_raw( (string) ( $body['url'] ?? '' ) ) : '';
		if ( '' === $url ) {
			$url = esc_url_raw( (string) get_post_meta( $id, '_wfcp_reference_url', true ) );
		}
		if ( '' === $url ) {
			return new WP_Error( 'wfcp_no_url', __( 'Reference URL is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		update_post_meta( $id, '_wfcp_reference_url', $url );
		if ( ! class_exists( 'WFCP_Reference_Sync', false ) ) {
			return new WP_Error( 'wfcp_no_reference', __( 'Reference sync is unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$result = WFCP_Reference_Sync::sync_product( $id, $url );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$purchase = class_exists( 'WFCP_Helper' ) ? WFCP_Helper::get_product_purchase_price( $id ) : (float) get_post_meta( $id, '_wfcp_purchase_price', true );
		$retail   = 0;
		if ( $purchase && class_exists( 'WFCP_Calculator' ) ) {
			$retail = (float) WFCP_Calculator::calculate_price( $purchase, 'retail', $id );
		}
		$last = get_post_meta( $id, '_wfcp_reference_last_sync', true );
		return new WP_REST_Response(
			array(
				'ok'             => true,
				'result'         => $result,
				'purchase_price' => $purchase,
				'retail_price'   => $retail,
				'last_sync'      => is_array( $last ) ? $last : array(),
				'url'            => $url,
				'source'         => (string) get_post_meta( $id, '_wfcp_reference_source', true ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_save( WP_REST_Request $req ) {
		$section = (string) $req['section'];
		$params  = $req->get_json_params();
		$data    = ( is_array( $params ) && isset( $params['data'] ) && is_array( $params['data'] ) ) ? $params['data'] : ( is_array( $params ) ? $params : array() );

		if ( '' === $section ) {
			return new WP_Error( 'wfcp_section', __( 'Missing settings section.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$sanitized = self::sanitize_wfcp_section( $section, $data );
		if ( is_wp_error( $sanitized ) ) {
			return $sanitized;
		}

		$update_section = ( 'exchange' === $section ) ? 'general' : $section;
		$result         = WFCP_Helper::update_settings( $update_section, $sanitized );

		if ( ! $result ) {
			return new WP_Error( 'wfcp_save', __( 'Could not save settings.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		if ( 'general' === $update_section && method_exists( 'WFCP_Helper', 'reschedule_exchange_cron' ) ) {
			WFCP_Helper::reschedule_exchange_cron();
		}

		if ( class_exists( 'WFCP_Batch_Process', false ) ) {
			$pricing_sections = array( 'general', 'retail', 'credit', 'installment', 'wholesale', 'exchange' );
			if ( in_array( $section, $pricing_sections, true ) || in_array( $update_section, $pricing_sections, true ) ) {
				WFCP_Batch_Process::delete_transients();
			}
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'section' => $update_section,
			)
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function exchange_test( WP_REST_Request $req ) {
		$params  = $req->get_json_params();
		$api_key = isset( $params['api_key'] ) ? sanitize_text_field( (string) $params['api_key'] ) : '';
		$symbol  = isset( $params['api_symbol'] ) ? sanitize_text_field( (string) $params['api_symbol'] ) : 'USD';
		if ( '' === $api_key ) {
			return new WP_Error( 'wfcp_api_key', __( 'API key is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$result = WFCP_Exchange_API::get_exchange_rate( $api_key, $symbol );
		if ( ! empty( $result['success'] ) ) {
			return new WP_REST_Response(
				array(
					'success' => true,
					'message' => isset( $result['message'] ) ? (string) $result['message'] : '',
					'price'   => isset( $result['price'] ) ? $result['price'] : null,
				)
			);
		}
		return new WP_Error(
			'wfcp_exchange',
			isset( $result['message'] ) ? (string) $result['message'] : __( 'Exchange test failed.', 'webino-dashboard' ),
			array( 'status' => 400 )
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function exchange_fetch() {
		$result = WFCP_Exchange_API::update_exchange_rate();
		if ( ! empty( $result['success'] ) ) {
			return new WP_REST_Response(
				array(
					'success' => true,
					'message' => isset( $result['message'] ) ? (string) $result['message'] : '',
					'price'   => isset( $result['price'] ) ? $result['price'] : null,
				)
			);
		}
		return new WP_Error(
			'wfcp_exchange',
			isset( $result['message'] ) ? (string) $result['message'] : __( 'Could not update exchange rate.', 'webino-dashboard' ),
			array( 'status' => 400 )
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function quick_add( WP_REST_Request $req ) {
		$params         = $req->get_json_params();
		$product_name   = isset( $params['product_name'] ) ? sanitize_text_field( (string) $params['product_name'] ) : '';
		$purchase_price = isset( $params['purchase_price'] ) ? WFCP_Helper::sanitize_price( $params['purchase_price'] ) : 0;
		$image_id       = isset( $params['image_id'] ) ? absint( $params['image_id'] ) : 0;

		if ( '' === $product_name ) {
			return new WP_Error( 'wfcp_name', __( 'Product name is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( $purchase_price <= 0 ) {
			return new WP_Error( 'wfcp_price', __( 'Purchase price must be greater than zero.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( ! class_exists( 'WC_Product_Simple', false ) ) {
			return new WP_Error( 'wfcp_wc', __( 'WooCommerce is not available.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}

		$product = new WC_Product_Simple();
		$product->set_name( $product_name );
		$product->set_status( 'publish' );
		$product->set_catalog_visibility( 'visible' );
		$product->set_manage_stock( false );
		$product->set_stock_status( 'instock' );
		$product->update_meta_data( '_wfcp_purchase_price', $purchase_price );
		$retail_price = WFCP_Calculator::calculate_price( $purchase_price, 'retail' );
		$product->set_regular_price( $retail_price );
		$product->set_price( $retail_price );
		$product_id = $product->save();

		if ( ! $product_id || is_wp_error( $product_id ) ) {
			return new WP_Error( 'wfcp_save', __( 'Could not create product.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		if ( $image_id > 0 ) {
			set_post_thumbnail( (int) $product_id, $image_id );
		}

		return new WP_REST_Response(
			array(
				'success'    => true,
				'product_id' => (int) $product_id,
			)
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_products( WP_REST_Request $req ) {
		$paged          = max( 1, (int) $req->get_param( 'page' ) );
		$search_term    = sanitize_text_field( (string) $req->get_param( 'search' ) );
		$posts_per_page = 50;
		$sort_option    = sanitize_text_field( (string) $req->get_param( 'sort' ) );
		if ( '' === $sort_option ) {
			$sort_option = 'date_desc';
		}
		$orderby = 'date';
		$order   = 'DESC';
		switch ( $sort_option ) {
			case 'date_asc':
				$orderby = 'date';
				$order   = 'ASC';
				break;
			case 'name_asc':
				$orderby = 'title';
				$order   = 'ASC';
				break;
			case 'name_desc':
				$orderby = 'title';
				$order   = 'DESC';
				break;
			case 'price_asc':
				$orderby = 'meta_value_num';
				$order   = 'ASC';
				break;
			case 'price_desc':
				$orderby = 'meta_value_num';
				$order   = 'DESC';
				break;
		}

		$args = array(
			'post_type'              => 'product',
			'post_status'            => 'publish',
			'posts_per_page'         => $posts_per_page,
			'paged'                  => $paged,
			's'                      => $search_term,
			'orderby'                => $orderby,
			'order'                  => $order,
			'fields'                 => 'ids',
			'no_found_rows'          => false,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => true,
		);

		if ( false !== strpos( $sort_option, 'price' ) ) {
			$args['meta_key'] = '_regular_price';
		}

		$tax_query = array();
		$cat       = sanitize_text_field( (string) $req->get_param( 'category' ) );
		if ( $cat ) {
			$tax_query[] = array(
				'taxonomy' => 'product_cat',
				'field'    => 'slug',
				'terms'    => $cat,
			);
		}
		$brand = sanitize_text_field( (string) $req->get_param( 'brand' ) );
		if ( $brand ) {
			$tax_query[] = array(
				'taxonomy' => 'product_brand',
				'field'    => 'slug',
				'terms'    => $brand,
			);
		}
		$type = sanitize_key( (string) $req->get_param( 'type' ) );
		if ( in_array( $type, array( 'simple', 'variable', 'grouped', 'external' ), true ) ) {
			$tax_query[] = array(
				'taxonomy' => 'product_type',
				'field'    => 'slug',
				'terms'    => $type,
			);
		}
		if ( ! empty( $tax_query ) ) {
			$tax_query['relation'] = 'AND';
			$args['tax_query']     = $tax_query;
		}

		$meta_query = array();
		$locked_f   = sanitize_key( (string) $req->get_param( 'locked' ) );
		if ( '1' === $locked_f || 'yes' === $locked_f || 'true' === $locked_f ) {
			$meta_query[] = array(
				'key'   => '_wfcp_lock_price',
				'value' => '1',
			);
		} elseif ( '0' === $locked_f || 'no' === $locked_f || 'false' === $locked_f ) {
			$meta_query[] = array(
				'relation' => 'OR',
				array(
					'key'     => '_wfcp_lock_price',
					'compare' => 'NOT EXISTS',
				),
				array(
					'key'   => '_wfcp_lock_price',
					'value' => '0',
				),
			);
		}
		if ( ! empty( $meta_query ) ) {
			$meta_query['relation'] = 'AND';
			$args['meta_query']     = $meta_query;
		}

		$stock_filter   = sanitize_text_field( (string) $req->get_param( 'stock_status' ) );
		$has_purchase_f = sanitize_key( (string) $req->get_param( 'has_purchase' ) );

		$q    = new WP_Query( $args );
		$rows = array();
		foreach ( $q->posts as $post_id ) {
			$product = wc_get_product( $post_id );
			if ( ! $product ) {
				continue;
			}
			clean_post_cache( $post_id );
			wc_delete_product_transients( $post_id );
			$product = wc_get_product( $post_id );

			if ( $product->is_type( 'variable' ) ) {
				$variations_data = $product->get_available_variations();
				$parent_purchase = WFCP_Helper::get_product_purchase_price( $product->get_id() );
				$parent_locked   = WFCP_Helper::is_product_price_locked( $product->get_id() );
				foreach ( $variations_data as $variation_data ) {
					$variation = wc_get_product( $variation_data['variation_id'] );
					if ( ! $variation ) {
						continue;
					}
					$stock_status = $variation->get_stock_status();
					if ( '' !== $stock_filter && $stock_status !== $stock_filter ) {
						continue;
					}
					$v_purchase = WFCP_Helper::get_product_purchase_price( $variation->get_id() );
					if ( null === $v_purchase ) {
						$v_purchase = $parent_purchase;
					}
					if ( '1' === $has_purchase_f && ( null === $v_purchase || (float) $v_purchase <= 0 ) ) {
						continue;
					}
					if ( '0' === $has_purchase_f && null !== $v_purchase && (float) $v_purchase > 0 ) {
						continue;
					}
					$rows[] = self::bulk_row_from_product(
						$variation,
						$product->get_name(),
						$v_purchase,
						$parent_locked,
						$variation_data['attributes'] ?? array(),
						$product->get_id()
					);
				}
			} else {
				$stock_status = $product->get_stock_status();
				if ( '' !== $stock_filter && $stock_status !== $stock_filter ) {
					continue;
				}
				$purchase = WFCP_Helper::get_product_purchase_price( $product->get_id() );
				if ( '1' === $has_purchase_f && ( null === $purchase || (float) $purchase <= 0 ) ) {
					continue;
				}
				if ( '0' === $has_purchase_f && null !== $purchase && (float) $purchase > 0 ) {
					continue;
				}
				$locked = WFCP_Helper::is_product_price_locked( $product->get_id() );
				$rows[] = self::bulk_row_from_product( $product, $product->get_name(), $purchase, $locked, array(), null );
			}
		}

		return new WP_REST_Response(
			array(
				'items'       => $rows,
				'page'        => $paged,
				'total_pages' => (int) $q->max_num_pages,
				'total_posts' => (int) $q->found_posts,
			)
		);
	}

	/**
	 * @param WC_Product          $product Product or variation.
	 * @param string              $display_name Parent name for variations.
	 * @param float|null          $purchase Purchase price.
	 * @param bool                $locked Locked flag.
	 * @param array<string,mixed> $attr_slugs Variation attributes.
	 * @param int|null              $calc_parent_id Parent product ID for variation pricing context.
	 * @return array<string,mixed>
	 */
	private static function bulk_row_from_product( WC_Product $product, $display_name, $purchase, $locked, $attr_slugs, $calc_parent_id = null ) {
		$pid         = $product->get_id();
		$calc_id     = $calc_parent_id ? (int) $calc_parent_id : $pid;
		$purchase_f  = $purchase ? (float) $purchase : 0.0;
		$retail      = $purchase_f ? WFCP_Calculator::calculate_price( $purchase_f, 'retail', $calc_id ) : 0;
		$credit      = $purchase_f ? WFCP_Calculator::calculate_price( $purchase_f, 'credit', $calc_id ) : 0;
		$wholesale   = $purchase_f ? WFCP_Calculator::calculate_price( $purchase_f, 'wholesale', $calc_id ) : 0;
		$attr_labels = array();
		foreach ( $attr_slugs as $attr_key => $term_slug ) {
			$taxonomy = str_replace( 'attribute_', '', urldecode( (string) $attr_key ) );
			$term     = get_term_by( 'slug', $term_slug, $taxonomy );
			$attr_labels[ $taxonomy ] = $term ? $term->name : $term_slug;
		}
		$rule = array();
		if ( class_exists( 'WFCP_Wholesale_Rules', false ) ) {
			$parent = $product->is_type( 'variation' ) ? (int) $product->get_parent_id() : $pid;
			$vid    = $product->is_type( 'variation' ) ? $pid : 0;
			$rule   = WFCP_Wholesale_Rules::for_product( $parent, $vid );
		}
		$parent_id   = $product->is_type( 'variation' ) ? (int) $product->get_parent_id() : $pid;
		$variation_label = implode( ' · ', array_filter( array_map( 'strval', array_values( $attr_labels ) ) ) );
		$thumb_id    = (int) $product->get_image_id();
		if ( $thumb_id <= 0 && $product->is_type( 'variation' ) ) {
			$parent_p = wc_get_product( $parent_id );
			$thumb_id = $parent_p ? (int) $parent_p->get_image_id() : 0;
		}
		$image_url = $thumb_id ? (string) wp_get_attachment_image_url( $thumb_id, 'thumbnail' ) : '';
		$qty       = $product->get_manage_stock() ? $product->get_stock_quantity() : null;

		return array(
			'id'               => $pid,
			'parent_id'        => $parent_id,
			'parent_name'      => $display_name,
			'name'             => $display_name,
			'variation_label'  => $variation_label,
			'sku'              => $product->get_sku(),
			'stock_status'     => $product->get_stock_status(),
			'stock_quantity'   => null !== $qty ? (float) $qty : null,
			'manage_stock'     => (bool) $product->get_manage_stock(),
			'image_url'        => $image_url,
			'purchase_price'   => $purchase_f ? $purchase_f : null,
			'locked'           => (bool) $locked,
			'retail'           => $retail,
			'credit'           => $credit,
			'wholesale'        => $wholesale,
			'wc_regular'       => $product->get_regular_price(),
			'wc_sale'          => $product->get_sale_price(),
			'is_variation'     => $product->is_type( 'variation' ),
			'attributes'       => $attr_labels,
			'min_qty'          => isset( $rule['min_qty'] ) ? (float) $rule['min_qty'] : 0,
			'min_weight'       => isset( $rule['min_weight'] ) ? (float) $rule['min_weight'] : 0,
			'sell_by'          => isset( $rule['sell_by'] ) ? (string) $rule['sell_by'] : 'unit',
			'discount_percent' => self::bulk_custom_discount_percent( $product ),
		);
	}

	/**
	 * Product-level wholesale discount if a custom rule exists; otherwise null (inherit cascade).
	 *
	 * @param WC_Product $product Product or variation.
	 * @return float|null
	 */
	private static function bulk_custom_discount_percent( WC_Product $product ) {
		$pid = (int) $product->get_id();
		$raw = get_post_meta( $pid, '_wfcp_wholesale_custom_rule', true );
		if ( ( ! is_array( $raw ) || ! array_key_exists( 'discount_percent', $raw ) ) && $product->is_type( 'variation' ) ) {
			$raw = get_post_meta( (int) $product->get_parent_id(), '_wfcp_wholesale_custom_rule', true );
		}
		if ( is_array( $raw ) && array_key_exists( 'discount_percent', $raw ) ) {
			return (float) $raw['discount_percent'];
		}
		return null;
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_patch_purchase( WP_REST_Request $req ) {
		$product_id = (int) $req['id'];
		$params     = $req->get_json_params();
		$price      = isset( $params['purchase_price'] ) ? WFCP_Helper::sanitize_price( $params['purchase_price'] ) : 0;
		if ( $product_id <= 0 || $price <= 0 ) {
			return new WP_Error( 'wfcp_bad', __( 'Invalid product or price.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'wfcp_nf', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$product->update_meta_data( '_wfcp_purchase_price', $price );
		$product->save();
		if ( ! WFCP_Helper::is_product_price_locked( $product_id ) && class_exists( 'WFCP_Helper', false ) ) {
			WFCP_Helper::sync_retail_price_from_purchase( $product_id, $price );
		} else {
			wc_delete_product_transients( $product_id );
		}
		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_patch_wc_price( WP_REST_Request $req ) {
		$product_id = (int) $req['id'];
		$params     = $req->get_json_params();
		$price      = isset( $params['price'] ) ? wc_clean( (string) $params['price'] ) : '';
		$price_type = isset( $params['price_type'] ) && 'sale' === $params['price_type'] ? 'sale' : 'regular';
		$price      = str_replace( ',', '', $price );
		$product    = wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'wfcp_nf', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( '' !== $price && ! is_numeric( $price ) ) {
			return new WP_Error( 'wfcp_price', __( 'Invalid price.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( 'sale' === $price_type ) {
			$product->set_sale_price( $price );
		} else {
			$product->set_regular_price( $price );
		}
		$reg  = $product->get_regular_price( 'edit' );
		$sale = $product->get_sale_price( 'edit' );
		if ( '' !== $sale && is_numeric( $sale ) && (float) $sale > 0 && '' !== $reg && is_numeric( $reg ) && (float) $sale < (float) $reg ) {
			$product->set_price( (string) wc_format_decimal( $sale ) );
		} elseif ( '' !== $reg && is_numeric( $reg ) ) {
			$product->set_price( (string) wc_format_decimal( $reg ) );
		} else {
			$product->set_price( '' );
		}
		$product->save();
		wc_delete_product_transients( $product_id );
		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_patch_stock( WP_REST_Request $req ) {
		$product_id   = (int) $req['id'];
		$params       = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$stock_status = isset( $params['stock_status'] ) && in_array( $params['stock_status'], array( 'instock', 'outofstock', 'onbackorder' ), true )
			? (string) $params['stock_status']
			: null;
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'wfcp_nf', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( array_key_exists( 'manage_stock', $params ) ) {
			$product->set_manage_stock( ! empty( $params['manage_stock'] ) );
		}
		if ( array_key_exists( 'stock_quantity', $params ) ) {
			$qty = $params['stock_quantity'];
			if ( '' === $qty || null === $qty ) {
				$product->set_stock_quantity( null );
			} else {
				$product->set_manage_stock( true );
				$product->set_stock_quantity( (float) $qty );
			}
		}
		if ( null !== $stock_status ) {
			$product->set_stock_status( $stock_status );
			update_post_meta( $product_id, '_stock_status', $stock_status );
		}
		$product->save();
		wc_delete_product_transients( $product_id );
		return new WP_REST_Response(
			array(
				'success'        => true,
				'stock_status'   => $product->get_stock_status(),
				'stock_quantity' => $product->get_manage_stock() ? $product->get_stock_quantity() : null,
				'manage_stock'   => (bool) $product->get_manage_stock(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_patch_lock( WP_REST_Request $req ) {
		$product_id = (int) $req['id'];
		$params     = $req->get_json_params();
		$locked     = ! empty( $params['locked'] );
		if ( $product_id <= 0 ) {
			return new WP_Error( 'wfcp_bad', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		update_post_meta( $product_id, '_wfcp_lock_price', $locked ? '1' : '0' );
		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_patch_brand( WP_REST_Request $req ) {
		$product_id = (int) $req['id'];
		$params     = $req->get_json_params();
		$brand_id   = isset( $params['brand_id'] ) ? absint( $params['brand_id'] ) : 0;
		if ( $product_id <= 0 ) {
			return new WP_Error( 'wfcp_bad', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( $brand_id > 0 ) {
			wp_set_object_terms( $product_id, array( $brand_id ), 'product_brand', false );
		} else {
			wp_set_object_terms( $product_id, array(), 'product_brand', false );
		}
		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * Patch wholesale min qty / weight / sell_by on a product or variation.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_patch_wholesale_rule( WP_REST_Request $req ) {
		$product_id = (int) $req['id'];
		$params     = $req->get_json_params();
		$product    = wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'wfcp_nf', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( ! class_exists( 'WFCP_Wholesale_Rules', false ) ) {
			return new WP_Error( 'wfcp_bad', __( 'Wholesale rules unavailable.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$parent = $product->is_type( 'variation' ) ? (int) $product->get_parent_id() : $product_id;
		$vid    = $product->is_type( 'variation' ) ? $product_id : 0;
		$rule   = WFCP_Wholesale_Rules::for_product( $parent, $vid );
		if ( array_key_exists( 'min_qty', $params ) ) {
			$rule['min_qty'] = max( 0, floatval( $params['min_qty'] ) );
		}
		if ( array_key_exists( 'min_weight', $params ) ) {
			$rule['min_weight'] = max( 0, floatval( $params['min_weight'] ) );
		}
		if ( array_key_exists( 'sell_by', $params ) ) {
			$sell            = sanitize_key( (string) $params['sell_by'] );
			$rule['sell_by'] = in_array( $sell, array( 'unit', 'weight' ), true ) ? $sell : 'unit';
		}
		if ( array_key_exists( 'discount_percent', $params ) ) {
			$rule['discount_percent'] = max( 0, floatval( $params['discount_percent'] ) );
		}
		WFCP_Wholesale_Rules::apply_to_wc_product( $product, $rule );
		$product->save();
		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function advanced_recalculate( WP_REST_Request $req ) {
		$params  = $req->get_json_params();
		$dry     = ! empty( $params['dry_run'] );
		$results = WFCP_Batch_Process::queue_recalculate( $dry );
		if ( is_wp_error( $results ) ) {
			return $results;
		}
		return new WP_REST_Response(
			array(
				'queued'  => true,
				'run_id'  => (string) $results['run_id'],
				'total'   => (int) $results['total'],
				'pages'   => (int) $results['pages'],
				'dry_run' => (bool) $results['dry_run'],
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function advanced_recalculate_state() {
		$payload = WFCP_Batch_Process::get_recalc_state();
		return new WP_REST_Response( $payload );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function advanced_delete_transients() {
		WFCP_Batch_Process::delete_transients();
		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function advanced_export() {
		$json = WFCP_Batch_Process::export_settings();
		return new WP_REST_Response( array( 'json' => $json ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function advanced_import( WP_REST_Request $req ) {
		$params = $req->get_json_params();
		$json   = isset( $params['json'] ) ? wp_unslash( (string) $params['json'] ) : '';
		$json   = sanitize_textarea_field( $json );
		if ( '' === $json ) {
			return new WP_Error( 'wfcp_json', __( 'JSON payload missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$result = WFCP_Batch_Process::import_settings( $json );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_price_start( WP_REST_Request $req ) {
		if ( ! isset( $GLOBALS['wfcp_bulk_price_change'] ) || ! is_object( $GLOBALS['wfcp_bulk_price_change'] ) ) {
			return new WP_Error( 'wfcp_bpc', __( 'Bulk price change service is not loaded.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		/** @var WFCP_Bulk_Price_Change $svc */
		$svc = $GLOBALS['wfcp_bulk_price_change'];

		if ( get_transient( WFCP_Bulk_Price_Change::LOCK_KEY ) ) {
			return new WP_Error( 'wfcp_lock', __( 'A bulk job is already running.', 'webino-dashboard' ), array( 'status' => 409 ) );
		}

		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		$type               = isset( $params['type'] ) ? sanitize_text_field( (string) $params['type'] ) : 'fixed';
		$value              = isset( $params['value'] ) ? floatval( $params['value'] ) : 0;
		$apply_sale         = ! empty( $params['apply_sale'] );
		$cat_slugs          = isset( $params['category_slugs'] ) ? sanitize_text_field( (string) $params['category_slugs'] ) : '';
		$range_rules        = isset( $params['range_rules'] ) ? sanitize_textarea_field( wp_unslash( (string) $params['range_rules'] ) ) : '';
		$rules_combine      = ! empty( $params['rules_combine'] ) ? 1 : 0;
		$enable_rounding    = ! empty( $params['enable_rounding'] );
		$rounding_threshold = isset( $params['rounding_threshold'] ) ? (float) $params['rounding_threshold'] : 50000;
		$rounding_value     = isset( $params['rounding_value'] ) ? (int) $params['rounding_value'] : 1000;

		if ( 0.0 === $value && '' === trim( $range_rules ) ) {
			return new WP_Error( 'wfcp_params', __( 'Set a bump value or range rules.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$run_id = wp_generate_uuid4();
		$job    = array(
			'job_type'           => 'bump',
			'type'               => ( 'percent' === $type ) ? 'percent' : 'fixed',
			'value'              => $value,
			'apply_sale'         => $apply_sale ? 1 : 0,
			'cats'               => $cat_slugs,
			'run_id'             => $run_id,
			'started_at'         => time(),
			'rules'              => $range_rules,
			'rules_mode'         => $rules_combine ? 'combine' : 'override',
			'enable_rounding'    => $enable_rounding,
			'rounding_threshold' => $rounding_threshold,
			'rounding_value'     => $rounding_value,
		);
		update_option( WFCP_Bulk_Price_Change::PARAMS_KEY, $job, false );

		$ref_count = new ReflectionMethod( 'WFCP_Bulk_Price_Change', 'count_products' );
		$ref_count->setAccessible( true );
		$total = (int) $ref_count->invoke( $svc, $cat_slugs );
		$pages = (int) ceil( max( 1, $total ) / WFCP_Bulk_Price_Change::PER_PAGE );
		update_option(
			WFCP_Bulk_Price_Change::STATE_KEY,
			array(
				'total'        => $total,
				'pages'        => $pages,
				'current_page' => 0,
				'processed'    => 0,
			),
			false
		);

		$ref_log = new ReflectionMethod( 'WFCP_Bulk_Price_Change', 'init_log' );
		$ref_log->setAccessible( true );
		$ref_log->invoke( $svc, $run_id );

		set_transient( WFCP_Bulk_Price_Change::LOCK_KEY, 1, 30 * MINUTE_IN_SECONDS );

		$ref_enqueue = new ReflectionMethod( 'WFCP_Bulk_Price_Change', 'enqueue_job' );
		$ref_enqueue->setAccessible( true );
		$ref_enqueue->invoke( $svc, 'wfcp_bpc_process', 1, $run_id );

		return new WP_REST_Response(
			array(
				'success' => true,
				'run_id'  => $run_id,
				'total'   => $total,
				'pages'   => $pages,
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function bulk_price_state() {
		return new WP_REST_Response(
			array(
				'params' => get_option( WFCP_Bulk_Price_Change::PARAMS_KEY ),
				'state'  => get_option( WFCP_Bulk_Price_Change::STATE_KEY ),
				'locked' => (bool) get_transient( WFCP_Bulk_Price_Change::LOCK_KEY ),
				'last'   => get_option( WFCP_Bulk_Price_Change::LASTLOG_KEY ),
			)
		);
	}

	/**
	 * Cancel a running/queued bulk price change job and clear lock.
	 *
	 * @return WP_REST_Response
	 */
	public static function bulk_price_cancel() {
		$params = get_option( WFCP_Bulk_Price_Change::PARAMS_KEY );
		if ( is_array( $params ) && isset( $params['job_type'] ) && 'import' === $params['job_type'] && ! empty( $params['file_path'] ) ) {
			$file = (string) $params['file_path'];
			if ( file_exists( $file ) ) {
				wp_delete_file( $file );
			}
		}
		delete_transient( WFCP_Bulk_Price_Change::LOCK_KEY );
		delete_option( WFCP_Bulk_Price_Change::PARAMS_KEY );
		delete_option( WFCP_Bulk_Price_Change::STATE_KEY );
		return new WP_REST_Response( array( 'success' => true, 'canceled' => true ) );
	}
}
