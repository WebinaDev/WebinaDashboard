<?php
/**
 * REST API for dashboard SPA.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers routes under webino-dashboard/v1.
 */
class Webino_Dashboard_REST {

	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		// Bypass WCDN/REST blocks: same payload via admin-ajax.php (same-origin cookies).
		add_action( 'wp_ajax_webino_dashboard_bootstrap', array( __CLASS__, 'ajax_bootstrap' ) );
		add_action( 'wp_ajax_webino_dashboard_auth_session', array( __CLASS__, 'ajax_auth_session' ) );
		add_action( 'wp_ajax_webino_dashboard_overview', array( __CLASS__, 'ajax_overview' ) );
		add_action( 'wp_ajax_webino_dashboard_sms_panel', array( __CLASS__, 'ajax_sms_panel' ) );
		add_action( 'wp_ajax_webino_dashboard_shop_rest', array( __CLASS__, 'ajax_shop_rest' ) );
	}

	/**
	 * admin-ajax fallback for GET /bootstrap when /wp-json is blocked by CDN.
	 *
	 * @return void
	 */
	public static function ajax_bootstrap() {
		if ( ! Webino_Dashboard_Rest_Base::can_read() ) {
			wp_send_json_error( array( 'message' => 'Forbidden' ), 403 );
		}
		check_ajax_referer( 'wp_rest', 'nonce' );
		$response = self::bootstrap();
		$data     = $response instanceof WP_REST_Response ? $response->get_data() : array();
		wp_send_json_success( $data );
	}

	/**
	 * admin-ajax fallback for auth/session.
	 *
	 * @return void
	 */
	public static function ajax_auth_session() {
		check_ajax_referer( 'wp_rest', 'nonce' );
		wp_send_json_success(
			array(
				'logged_in' => is_user_logged_in(),
			)
		);
	}

	/**
	 * admin-ajax fallback for GET /dashboard/overview.
	 *
	 * @return void
	 */
	public static function ajax_overview() {
		if ( ! Webino_Dashboard_Rest_Base::can_read() ) {
			wp_send_json_error( array( 'message' => 'Forbidden' ), 403 );
		}
		check_ajax_referer( 'wp_rest', 'nonce' );
		try {
			$response = Webino_Dashboard_Home_Overview::rest_get();
			$data     = $response instanceof WP_REST_Response ? $response->get_data() : array();
			wp_send_json_success( is_array( $data ) ? $data : array() );
		} catch ( Throwable $e ) {
			wp_send_json_error(
				array(
					'message' => $e->getMessage() ? $e->getMessage() : 'Overview failed',
				),
				500
			);
		}
	}

	/**
	 * admin-ajax fallback for GET /dashboard/sms-panel.
	 *
	 * @return void
	 */
	public static function ajax_sms_panel() {
		if ( ! Webino_Dashboard_Rest_Base::can_read() ) {
			wp_send_json_error( array( 'message' => 'Forbidden' ), 403 );
		}
		check_ajax_referer( 'wp_rest', 'nonce' );
		try {
			$response = Webino_Dashboard_Home_Overview::rest_sms_panel();
			$data     = $response instanceof WP_REST_Response ? $response->get_data() : array();
			wp_send_json_success( is_array( $data ) ? $data : array() );
		} catch ( Throwable $e ) {
			wp_send_json_error(
				array(
					'message' => $e->getMessage() ? $e->getMessage() : 'SMS panel failed',
				),
				500
			);
		}
	}

	/**
	 * Whether a shop REST path may be proxied via admin-ajax.
	 *
	 * @param string $path Path without leading slash, e.g. shop/products/12.
	 * @return bool
	 */
	private static function is_shop_ajax_proxy_path_allowed( $path ) {
		$path = ltrim( (string) $path, '/' );
		$path = strtok( $path, '?' );
		if ( ! is_string( $path ) || '' === $path ) {
			return false;
		}
		return 0 === strpos( $path, 'shop/products' );
	}

	/**
	 * admin-ajax proxy for shop/products* REST (CDN/WAF-safe). Always HTTP 200 envelope.
	 *
	 * @return void
	 */
	public static function ajax_shop_rest() {
		if ( ! check_ajax_referer( 'wp_rest', 'nonce', false ) ) {
			wp_send_json_error(
				array(
					'message' => 'Invalid nonce',
					'code'    => 'invalid_nonce',
				)
			);
		}
		if ( ! is_user_logged_in() ) {
			wp_send_json_error(
				array(
					'message' => 'Forbidden',
					'code'    => 'forbidden',
				)
			);
		}
		if ( ! Webino_Dashboard_Rest_Base::can_read() ) {
			wp_send_json_error(
				array(
					'message' => 'Forbidden',
					'code'    => 'forbidden',
				)
			);
		}

		$rest_path = isset( $_POST['rest_path'] ) // phpcs:ignore WordPress.Security.NonceVerification.Missing -- checked above.
			? sanitize_text_field( wp_unslash( (string) $_POST['rest_path'] ) )
			: '';
		$rest_path = ltrim( $rest_path, '/' );

		if ( ! self::is_shop_ajax_proxy_path_allowed( $rest_path ) ) {
			wp_send_json_error(
				array(
					'message' => 'Path not allowed',
					'code'    => 'path_not_allowed',
				)
			);
		}

		$method = isset( $_POST['rest_method'] ) // phpcs:ignore WordPress.Security.NonceVerification.Missing
			? strtoupper( sanitize_text_field( wp_unslash( (string) $_POST['rest_method'] ) ) )
			: 'GET';
		if ( ! in_array( $method, array( 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ), true ) ) {
			$method = 'GET';
		}

		$query = array();
		if ( isset( $_POST['rest_query'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$raw_q = wp_unslash( (string) $_POST['rest_query'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
			parse_str( ltrim( $raw_q, '?' ), $parsed );
			if ( is_array( $parsed ) ) {
				$query = $parsed;
			}
		}

		$route = '/' . self::NS . '/' . $rest_path;
		$req   = new WP_REST_Request( $method, $route );
		foreach ( $query as $key => $value ) {
			$req->set_param( (string) $key, $value );
		}

		if ( in_array( $method, array( 'POST', 'PUT', 'PATCH', 'DELETE' ), true ) && isset( $_POST['payload'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$raw = wp_unslash( (string) $_POST['payload'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
			if ( '' !== $raw ) {
				$req->set_body( $raw );
				$req->set_header( 'Content-Type', 'application/json' );
				$decoded = json_decode( $raw, true );
				if ( is_array( $decoded ) ) {
					$req->set_body_params( $decoded );
				}
			}
		}

		$response = rest_do_request( $req );
		if ( $response->is_error() ) {
			$err = $response->as_error();
			wp_send_json_error(
				array(
					'message' => $err->get_error_message(),
					'code'    => $err->get_error_code(),
				)
			);
		}

		$data = $response->get_data();
		wp_send_json_success( $data );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/bootstrap',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'bootstrap' ),
				'permission_callback' => array( 'Webino_Dashboard_Rest_Base', 'can_read' ),
			)
		);

		register_rest_route(
			self::NS,
			'/license/remote-check',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'license_remote_check' ),
				'permission_callback' => array( 'Webino_Dashboard_Rest_Base', 'can_manage_license' ),
			)
		);

		register_rest_route(
			self::NS,
			'/license/remote-activate',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'license_remote_activate' ),
				'permission_callback' => static function () {
					return current_user_can( 'manage_options' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/license/diagnostics',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'license_diagnostics' ),
				'permission_callback' => static function () {
					return current_user_can( 'manage_options' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/auth/session',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'auth_session' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NS,
			'/auth/login',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'auth_login' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NS,
			'/auth/otp/send',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'auth_otp_send' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NS,
			'/auth/otp/verify',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'auth_otp_verify' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NS,
			'/auth/logout',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'auth_logout' ),
				'permission_callback' => array( 'Webino_Dashboard_Rest_Base', 'can_read' ),
			)
		);

		register_rest_route(
			self::NS,
			'/webinocrm/v1/license/check',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'license_check' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NS,
			'/webinocrm/v1/license/activate',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'license_activate' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NS,
			'/module/(?P<slug>[a-z0-9\-]+)/licensed',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'module_licensed' ),
				'permission_callback' => array( 'Webino_Dashboard_Rest_Base', 'can_read' ),
			)
		);

		register_rest_route(
			self::NS,
			'/analytics/summary',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'analytics_summary' ),
				'permission_callback' => array( 'Webino_Dashboard_Rest_Base', 'can_view_analytics' ),
			)
		);

		register_rest_route(
			self::NS,
			'/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'settings_get' ),
					'permission_callback' => array( 'Webino_Dashboard_Rest_Base', 'can_read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'settings_post' ),
					'permission_callback' => array( 'Webino_Dashboard_Rest_Base', 'can_read' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/settings/pwa',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'settings_pwa_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_options' );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'settings_pwa_post' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_options' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/settings/style',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'settings_style_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_options' );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'settings_style_post' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_options' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/manifest.webmanifest',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'manifest' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/lookup',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'shop_products_lookup' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_products' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'shop_products' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_products' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/wfcp',
			array(
				'methods'             => 'PATCH',
				'callback'            => array( __CLASS__, 'shop_product_wfcp_patch' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_products' );
				},
			)
		);

		// Accounting REST is owned by accounting-module (Webino_Dashboard_REST_Accounting).

		register_rest_route(
			self::NS,
			'/content/posts',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'content_posts' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_posts' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/content/pages',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'content_pages' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_pages' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/content/media',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'content_media' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'upload_files' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/orders',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'shop_orders' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can_access_orders();
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'shop_orders_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can_create_orders();
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/pos-search',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'shop_products_pos_search' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can_create_orders();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/pos/customers',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'shop_pos_customers' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can_create_orders();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/orders/filter-options',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'shop_orders_filter_options' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can_access_orders();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/locations/states',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'shop_locations_states' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_shop_coupons' )
						|| Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' )
						|| Webino_Dashboard_Rest_Base::has_account_portal();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/locations/cities',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'shop_locations_cities' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_shop_coupons' )
						|| Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' )
						|| Webino_Dashboard_Rest_Base::has_account_portal();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/orders/statuses',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'shop_order_statuses' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can_access_orders();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/orders/bulk',
			array(
				'methods'             => 'POST',
				'callback'            => array( 'Webino_Dashboard_Orders', 'bulk_action' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/marketing/coupons',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'marketing_coupons' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_shop_coupons' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/attributes',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'shop_attributes' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_products' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/users/bulk-role',
			array(
				'methods'             => 'POST',
				'callback'            => array( 'Webino_Dashboard_Rest_Crud', 'users_bulk_role' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'promote_users' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/users',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'users_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'list_users' );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'users_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'create_users' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/comments',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'comments_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'moderate_comments' );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( 'Webino_Dashboard_Rest_Crud', 'comment_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'moderate_comments' );
					},
				),
			)
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bootstrap() {
		// No outbound CRM here — keep bootstrap local/fast. License sync is cron + remote-check;
		// core update check lives in CoreUpdatePanel / its REST endpoint.

		$uid    = get_current_user_id();
		$ui_loc = $uid ? (string) get_user_meta( $uid, 'webino_dashboard_locale', true ) : '';
		$locale = $ui_loc ? $ui_loc : determine_locale();

		$modules = Webino_Dashboard_Modules::get_default_modules();
		$modules = self::filter_modules_by_capabilities( $modules );
		$modules = self::filter_modules_without_wfcp( $modules );
		$modules = self::filter_modules_without_woocommerce( $modules );
		$modules = self::filter_inactive_modules( $modules );

		$ui_theme = $uid ? (string) get_user_meta( $uid, 'webino_dashboard_theme', true ) : '';

		$cap_whitelist = array(
			'read',
			'edit_posts',
			'delete_posts',
			'manage_categories',
			'upload_files',
			'edit_pages',
			'delete_pages',
			'edit_products',
			'manage_product_terms',
			'edit_shop_orders',
			'webino_partner_portal',
			'webino_account_portal',
			'webino_pos',
			'webino_create_shop_orders',
			'webino_view_own_shop_orders',
			'webino_manage_accounting',
			'view_woocommerce_reports',
			'edit_shop_coupons',
			'manage_woocommerce',
			'list_users',
			'create_users',
			'edit_users',
			'delete_users',
			'moderate_comments',
			'manage_options',
			'promote_users',
		);
		$capabilities = array();
		foreach ( $cap_whitelist as $c ) {
			if ( current_user_can( $c ) ) {
				$capabilities[] = $c;
			}
		}

		$ui_accent = class_exists( 'Webino_Dashboard_Brand_Style', false )
			? Webino_Dashboard_Brand_Style::accent()
			: 'colorful';
		$ui_fs     = $uid ? (string) get_user_meta( $uid, 'webino_dashboard_fullscreen', true ) : '';
		$brand_style = class_exists( 'Webino_Dashboard_Brand_Style', false )
			? Webino_Dashboard_Brand_Style::client_payload()
			: null;

		$wp_user = wp_get_current_user();
		$user    = array(
			'name'   => ( $wp_user && $wp_user->exists() ) ? (string) $wp_user->display_name : '',
			'email'  => ( $wp_user && $wp_user->exists() ) ? (string) $wp_user->user_email : '',
			'avatar' => ( $wp_user && $wp_user->exists() ) ? self::dashboard_avatar_url( (int) $wp_user->ID, 64 ) : '',
		);

		$site = array(
			'name' => get_bloginfo( 'name' ),
			'url'  => home_url( '/' ),
			'icon' => self::site_icon_url(),
		);
		if ( function_exists( 'get_woocommerce_currency' ) ) {
			$wc_currency = get_woocommerce_currency();
			$site['currency']        = $wc_currency;
			$site['currency_symbol'] = function_exists( 'get_woocommerce_currency_symbol' )
				? html_entity_decode( get_woocommerce_currency_symbol( $wc_currency ), ENT_QUOTES, 'UTF-8' )
				: '';
		}

		$payload = array(
			'modules'      => $modules,
			'locale'       => $locale,
			'uiTheme'      => $ui_theme ? $ui_theme : 'light',
			'uiAccent'     => $ui_accent ? $ui_accent : 'colorful',
			'uiFullscreen' => ( '1' === $ui_fs || 'true' === $ui_fs ),
			'brandStyle'   => $brand_style,
			'capabilities' => $capabilities,
			'user'         => $user,
			'site'         => $site,
			'flags'        => array(
				'woocommerce'  => class_exists( 'WooCommerce' ),
				'wfcp'         => Webino_Dashboard_Module_Registry::wfcp_ready(),
				'wnc'          => class_exists( 'WNC_Settings', false ) || ( class_exists( 'Webino_Dashboard_WNC_Loader', false ) && Webino_Dashboard_WNC_Loader::ready() ),
				'baleBot'      => self::bot_ui_ready( 'bale' ),
				'telegramBot'  => self::bot_ui_ready( 'telegram' ),
			),
			'license'      => Webino_Dashboard_License::instance()->get_bootstrap_payload(),
			'marketplaceSettingsSections' => apply_filters( 'webino_dashboard_marketplace_settings_sections', array() ),
			'activeModuleClients'         => Webino_Dashboard_Module_Registry::get_active_module_clients(),
			'installedModuleSlugs'        => Webino_Dashboard_Module_Registry::list_installed_module_slugs(),
			'coreUpdate'                  => Webino_Dashboard_Core_Updater::get_cached_update_status(),
		);

		if ( $uid > 0 ) {
			Webino_Dashboard_Assets::cache_bootstrap_payload( $uid, $payload );
		}

		return new WP_REST_Response( $payload );
	}

	/**
	 * Fast bootstrap for HTML embed — no module client scan, no CRM. Client/ajax fills full payload later.
	 *
	 * @return array<string,mixed>
	 */
	public static function bootstrap_embed_minimal() {
		$uid    = get_current_user_id();
		$ui_loc = $uid ? (string) get_user_meta( $uid, 'webino_dashboard_locale', true ) : '';
		$locale = $ui_loc ? $ui_loc : determine_locale();

		$modules = Webino_Dashboard_Modules::get_default_modules();
		$modules = self::filter_modules_by_capabilities( $modules );
		$modules = self::filter_modules_without_wfcp( $modules );
		$modules = self::filter_modules_without_woocommerce( $modules );
		$modules = self::filter_inactive_modules( $modules );

		$ui_theme = $uid ? (string) get_user_meta( $uid, 'webino_dashboard_theme', true ) : '';
		$ui_accent = class_exists( 'Webino_Dashboard_Brand_Style', false )
			? Webino_Dashboard_Brand_Style::accent()
			: 'colorful';
		$ui_fs     = $uid ? (string) get_user_meta( $uid, 'webino_dashboard_fullscreen', true ) : '';
		$brand_style = class_exists( 'Webino_Dashboard_Brand_Style', false )
			? Webino_Dashboard_Brand_Style::client_payload()
			: null;

		$cap_whitelist = array(
			'read',
			'edit_posts',
			'delete_posts',
			'manage_categories',
			'upload_files',
			'edit_pages',
			'delete_pages',
			'edit_products',
			'manage_product_terms',
			'edit_shop_orders',
			'webino_partner_portal',
			'webino_account_portal',
			'webino_pos',
			'webino_create_shop_orders',
			'webino_view_own_shop_orders',
			'webino_manage_accounting',
			'view_woocommerce_reports',
			'edit_shop_coupons',
			'manage_woocommerce',
			'list_users',
			'create_users',
			'edit_users',
			'delete_users',
			'moderate_comments',
			'manage_options',
			'promote_users',
		);
		$capabilities = array();
		foreach ( $cap_whitelist as $c ) {
			if ( current_user_can( $c ) ) {
				$capabilities[] = $c;
			}
		}

		$wp_user = wp_get_current_user();
		$user    = array(
			'name'   => ( $wp_user && $wp_user->exists() ) ? (string) $wp_user->display_name : '',
			'email'  => ( $wp_user && $wp_user->exists() ) ? (string) $wp_user->user_email : '',
			'avatar' => ( $wp_user && $wp_user->exists() ) ? self::dashboard_avatar_url( (int) $wp_user->ID, 64 ) : '',
		);

		$site = array(
			'name' => get_bloginfo( 'name' ),
			'url'  => home_url( '/' ),
			'icon' => self::site_icon_url(),
		);
		if ( function_exists( 'get_woocommerce_currency' ) ) {
			$wc_currency = get_woocommerce_currency();
			$site['currency']        = $wc_currency;
			$site['currency_symbol'] = function_exists( 'get_woocommerce_currency_symbol' )
				? html_entity_decode( get_woocommerce_currency_symbol( $wc_currency ), ENT_QUOTES, 'UTF-8' )
				: '';
		}

		return array(
			'embedMinimal'                => true,
			'modules'                     => $modules,
			'locale'                      => $locale,
			'uiTheme'                     => $ui_theme ? $ui_theme : 'light',
			'uiAccent'                    => $ui_accent ? $ui_accent : 'colorful',
			'uiFullscreen'                => ( '1' === $ui_fs || 'true' === $ui_fs ),
			'brandStyle'                  => $brand_style,
			'capabilities'                => $capabilities,
			'user'                        => $user,
			'site'                        => $site,
			'flags'                       => array(
				'woocommerce' => class_exists( 'WooCommerce' ),
				'wfcp'        => class_exists( 'Webino_Dashboard_Module_Registry', false )
					? Webino_Dashboard_Module_Registry::wfcp_ready()
					: class_exists( 'WFCP_Helper', false ),
				'wnc'         => class_exists( 'WNC_Settings', false ) || ( class_exists( 'Webino_Dashboard_WNC_Loader', false ) && Webino_Dashboard_WNC_Loader::ready() ),
				'baleBot'     => self::bot_ui_ready( 'bale' ),
				'telegramBot' => self::bot_ui_ready( 'telegram' ),
			),
			'license'                     => Webino_Dashboard_License::instance()->get_bootstrap_payload(),
			'marketplaceSettingsSections' => apply_filters( 'webino_dashboard_marketplace_settings_sections', array() ),
			'activeModuleClients'         => array(),
			'installedModuleSlugs'        => class_exists( 'Webino_Dashboard_Module_Registry', false )
				? Webino_Dashboard_Module_Registry::list_installed_module_slugs()
				: array(),
			'coreUpdate'                  => class_exists( 'Webino_Dashboard_Core_Updater', false )
				? Webino_Dashboard_Core_Updater::get_cached_update_status()
				: array(
					'version'           => defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '0.0.0',
					'latest_version'    => defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '0.0.0',
					'update_available'  => false,
					'unavailable'       => true,
				),
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function license_remote_check() {
		$out = Webino_Dashboard_License::instance()->remote_license_check( true );
		return new WP_REST_Response( $out );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function license_remote_activate() {
		$out = Webino_Dashboard_License::instance()->remote_activate();
		return new WP_REST_Response( $out );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function license_diagnostics() {
		$out = Webino_Dashboard_License::instance()->run_license_diagnostics();
		return new WP_REST_Response( $out );
	}

	/**
	 * Remove modules disabled via options (webino_dashboard_module_{id}_active). Overview (home) is always shown.
	 *
	 * @param array<int, array<string, mixed>> $modules Modules.
	 * @return array<int, array<string, mixed>>
	 */
	private static function filter_inactive_modules( $modules ) {
		$out = array();
		foreach ( $modules as $m ) {
			$kept = self::filter_inactive_module_node( $m );
			if ( null !== $kept ) {
				$out[] = $kept;
			}
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $m Module node.
	 * @return array<string,mixed>|null
	 */
	private static function filter_inactive_module_node( $m ) {
		if ( ! is_array( $m ) ) {
			return null;
		}
		$mid = isset( $m['id'] ) ? (string) $m['id'] : '';

		if ( ! empty( $m['children'] ) && is_array( $m['children'] ) ) {
			$kids = array();
			foreach ( $m['children'] as $c ) {
				$child = self::filter_inactive_module_node( $c );
				if ( null !== $child ) {
					$kids[] = $child;
				}
			}
			$m['children'] = $kids;
			if ( empty( $kids ) ) {
				return null;
			}
			$ignore_parent = ! empty( $m['ignore_parent_toggle'] );
			if ( ! $ignore_parent && $mid && ! Webino_Dashboard_Modules::is_module_enabled( $mid ) ) {
				return null;
			}
			return $m;
		}

		if ( $mid && empty( $m['exclude_from_module_toggle'] ) && ! Webino_Dashboard_Modules::is_module_enabled( $mid ) ) {
			return null;
		}
		return $m;
	}

	/**
	 * Remove WFCP-only nodes when the core is not loaded.
	 *
	 * @param array<int, array<string, mixed>> $modules Modules.
	 * @return array<int, array<string, mixed>>
	 */
	private static function filter_modules_without_wfcp( $modules ) {
		if ( class_exists( 'WFCP_Helper', false ) ) {
			return $modules;
		}
		$out = array();
		foreach ( $modules as $m ) {
			$pruned = self::strip_wfcp_required_nodes( $m );
			if ( null !== $pruned ) {
				$out[] = $pruned;
			}
		}
		return $out;
	}

	/**
	 * Whether a sidebar/bootstrap module node requires WFCP to be loaded.
	 *
	 * @param array<string,mixed> $m Module node.
	 * @return bool
	 */
	private static function module_node_requires_wfcp( $m ) {
		if ( ! is_array( $m ) ) {
			return false;
		}
		if ( ! empty( $m['requires_wfcp'] ) || ! empty( $m['requires_wfcp-module'] ) ) {
			return true;
		}
		return false;
	}

	/**
	 * @param array<string,mixed> $m Module node.
	 * @return array<string,mixed>|null
	 */
	private static function strip_wfcp_required_nodes( $m ) {
		if ( ! is_array( $m ) ) {
			return null;
		}
		if ( self::module_node_requires_wfcp( $m ) ) {
			return null;
		}
		if ( ! empty( $m['children'] ) && is_array( $m['children'] ) ) {
			$kids = array();
			foreach ( $m['children'] as $c ) {
				$child = self::strip_wfcp_required_nodes( $c );
				if ( null !== $child ) {
					$kids[] = $child;
				}
			}
			$m['children'] = $kids;
			if ( empty( $kids ) ) {
				$mid = isset( $m['id'] ) ? (string) $m['id'] : '';
				if ( '' === $mid ) {
					return null;
				}
			}
		}
		return $m;
	}

	/**
	 * Remove modules that require WooCommerce when WC is inactive.
	 *
	 * @param array<int, array<string, mixed>> $modules Modules.
	 * @return array<int, array<string, mixed>>
	 */
	private static function filter_modules_without_woocommerce( $modules ) {
		if ( class_exists( 'WooCommerce', false ) ) {
			return $modules;
		}
		$out = array();
		foreach ( $modules as $m ) {
			$pruned = self::strip_woocommerce_required_nodes( $m );
			if ( null !== $pruned ) {
				$out[] = $pruned;
			}
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $m Module node.
	 * @return array<string,mixed>|null
	 */
	private static function strip_woocommerce_required_nodes( $m ) {
		if ( ! is_array( $m ) ) {
			return null;
		}
		if ( ! empty( $m['requires_woocommerce'] ) ) {
			return null;
		}
		if ( ! empty( $m['children'] ) && is_array( $m['children'] ) ) {
			$kids = array();
			foreach ( $m['children'] as $c ) {
				$child = self::strip_woocommerce_required_nodes( $c );
				if ( null !== $child ) {
					$kids[] = $child;
				}
			}
			$m['children'] = $kids;
			if ( empty( $kids ) ) {
				$mid = isset( $m['id'] ) ? (string) $m['id'] : '';
				if ( '' === $mid ) {
					return null;
				}
			}
		}
		return $m;
	}

	/**
	 * Whether bot UI features should be exposed (module active + WC + token).
	 *
	 * @param string $which bale|telegram.
	 * @return bool
	 */
	public static function bot_ui_ready( $which ) {
		$which = sanitize_key( (string) $which );
		$slug  = ( 'telegram' === $which ) ? 'telegram-bot-module' : 'bale-bot-module';
		return Webino_Dashboard_Module_Registry::is_active( $slug )
			&& class_exists( 'WooCommerce' )
			&& self::bot_token_configured( $which );
	}

	/**
	 * @param string $which bale|telegram.
	 * @return bool
	 */
	private static function bot_token_configured( $which ) {
		$opt = ( 'telegram' === $which ) ? 'webino_dashboard_telegram_bot_settings' : 'webino_dashboard_bale_bot_settings';
		$s   = get_option( $opt, array() );
		if ( ! is_array( $s ) ) {
			return false;
		}
		$t = isset( $s['bot_token'] ) ? trim( (string) $s['bot_token'] ) : '';
		return '' !== $t;
	}

	/**
	 * @param array<int, array<string, mixed>> $modules Modules.
	 * @return array<int, array<string, mixed>>
	 */
	private static function filter_modules_by_capabilities( $modules ) {
		$out = array();
		foreach ( $modules as $m ) {
			$kept = self::filter_module_cap_node( $m, 'read' );
			if ( null !== $kept ) {
				$out[] = $kept;
			}
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $m          Module node.
	 * @param string              $parent_cap Default capability from parent.
	 * @return array<string,mixed>|null
	 */
	private static function filter_module_cap_node( $m, $parent_cap = 'read' ) {
		if ( ! is_array( $m ) ) {
			return null;
		}
		$cap = isset( $m['capability'] ) ? (string) $m['capability'] : $parent_cap;
		if ( ! empty( $m['children'] ) && is_array( $m['children'] ) ) {
			$kids = array();
			foreach ( $m['children'] as $c ) {
				$child = self::filter_module_cap_node( $c, $cap );
				if ( null !== $child ) {
					$kids[] = $child;
				}
			}
			if ( empty( $kids ) ) {
				return null;
			}
			$m['children'] = $kids;
			return $m;
		}
		if ( ! current_user_can( $cap ) ) {
			return null;
		}
		return $m;
	}

	/**
	 * Minimal auth probe for SPA (rate-limited).
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public static function auth_session() {
		if ( ! Webino_Dashboard_Rest_Base::rate_limit_ok( 'auth_session', 60, 300 ) ) {
			return new WP_Error( 'too_many', __( 'Too many attempts.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}
		return new WP_REST_Response( array( 'logged_in' => is_user_logged_in() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function auth_login( $request ) {
		if ( ! Webino_Dashboard_Rest_Base::rate_limit_ok( 'login', 30, 300 ) ) {
			return new WP_Error( 'too_many', __( 'Too many attempts.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}

		if ( ! Webino_Dashboard_Rest_Base::verify_login_nonce( (string) $request->get_param( 'login_nonce' ) ) ) {
			return new WP_Error( 'invalid_nonce', __( 'Invalid login token. Refresh the page and try again.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		$login    = (string) $request->get_param( 'login' );
		$password = (string) $request->get_param( 'password' );
		if ( '' === $login || '' === $password ) {
			return new WP_Error( 'invalid', __( 'Missing credentials.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$user = Webino_Dashboard_Rest_Base::resolve_user_from_login( $login );
		if ( ! $user ) {
			return new WP_Error( 'invalid', __( 'Invalid credentials.', 'webino-dashboard' ), array( 'status' => 401 ) );
		}

		$creds = array(
			'user_login'    => $user->user_login,
			'user_password' => $password,
			'remember'      => (bool) $request->get_param( 'remember' ),
		);

		$signon = wp_signon( $creds, is_ssl() );
		if ( is_wp_error( $signon ) ) {
			return new WP_Error( 'invalid', __( 'Invalid credentials.', 'webino-dashboard' ), array( 'status' => 401 ) );
		}

		wp_set_current_user( $signon->ID );

		return new WP_REST_Response(
			array(
				'success' => true,
				'user'    => array(
					'id'    => $signon->ID,
					'login' => $signon->user_login,
					'name'  => $signon->display_name,
				),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function auth_otp_send( $request ) {
		if ( ! Webino_Dashboard_Rest_Base::rate_limit_ok( 'otp_send', 20, 300 ) ) {
			return new WP_Error( 'too_many', __( 'Too many attempts.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}
		if ( ! Webino_Dashboard_Rest_Base::verify_login_nonce( (string) $request->get_param( 'login_nonce' ) ) ) {
			return new WP_Error( 'invalid_nonce', __( 'Invalid login token. Refresh the page and try again.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		if ( ! class_exists( 'Webino_Dashboard_Auth_Otp', false ) ) {
			return new WP_Error( 'unavailable', __( 'OTP service unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$identifier = (string) $request->get_param( 'identifier' );
		if ( '' === $identifier ) {
			$identifier = (string) $request->get_param( 'login' );
		}
		$purpose = sanitize_key( (string) $request->get_param( 'purpose' ) );
		if ( '' === $purpose ) {
			$purpose = 'login';
		}
		$result = Webino_Dashboard_Auth_Otp::send( $identifier, $purpose );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( $result, 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function auth_otp_verify( $request ) {
		if ( ! Webino_Dashboard_Rest_Base::rate_limit_ok( 'otp_verify', 40, 300 ) ) {
			return new WP_Error( 'too_many', __( 'Too many attempts.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}
		if ( ! Webino_Dashboard_Rest_Base::verify_login_nonce( (string) $request->get_param( 'login_nonce' ) ) ) {
			return new WP_Error( 'invalid_nonce', __( 'Invalid login token. Refresh the page and try again.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		if ( ! class_exists( 'Webino_Dashboard_Auth_Otp', false ) ) {
			return new WP_Error( 'unavailable', __( 'OTP service unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$identifier = (string) $request->get_param( 'identifier' );
		if ( '' === $identifier ) {
			$identifier = (string) $request->get_param( 'login' );
		}
		$purpose = sanitize_key( (string) $request->get_param( 'purpose' ) );
		if ( '' === $purpose ) {
			$purpose = 'login';
		}
		$result = Webino_Dashboard_Auth_Otp::verify(
			$identifier,
			(string) $request->get_param( 'code' ),
			$purpose,
			(bool) $request->get_param( 'remember' )
		);
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response(
			array(
				'success' => true,
				'ok'      => true,
				'created' => ! empty( $result['created'] ),
				'user'    => $result['user'],
			),
			200
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function auth_logout() {
		wp_logout();
		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * Deprecation headers for legacy inbound mirror routes (NEW-INT-10).
	 *
	 * @param WP_REST_Response $response Response.
	 * @param string           $crm_path Path under webinocrm/v1/.
	 * @return WP_REST_Response
	 */
	private static function license_mirror_deprecated_response( WP_REST_Response $response, $crm_path ) {
		$host = 'webina.dev';
		if ( class_exists( 'Webino_Dashboard_License', false ) ) {
			$bases = Webino_Dashboard_License::instance()->get_server_urls();
			if ( ! empty( $bases[0] ) ) {
				$parsed = wp_parse_url( (string) $bases[0] );
				if ( is_array( $parsed ) && ! empty( $parsed['host'] ) ) {
					$host = (string) $parsed['host'];
				}
			}
		}
		$successor = 'https://' . $host . '/wp-json/webinocrm/v1/' . ltrim( (string) $crm_path, '/' );
		$response->header( 'Deprecation', 'true' );
		$response->header( 'Link', '<' . $successor . '>; rel="successor-version"' );
		return $response;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function license_check( $request ) {
		if ( ! Webino_Dashboard_Rest_Base::rate_limit_ok( 'license_check', 60, 300 ) ) {
			return new WP_Error( 'too_many', __( 'Too many attempts.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}

		$license = Webino_Dashboard_License::instance();
		$domain  = $license->get_current_domain();
		$req_dom = sanitize_text_field( (string) $request->get_param( 'domain' ) );
		if ( '' === $req_dom ) {
			return new WP_Error( 'invalid', __( 'Domain is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( $license->normalize_site_domain( $req_dom ) !== $domain ) {
			return new WP_Error( 'forbidden', __( 'Domain mismatch.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		global $wpdb;
		$table = Webino_Dashboard_Rest_Base::licenses_table();
		$key   = (string) $request->get_param( 'license_key' );

		if ( $key ) {
			$sql = $wpdb->prepare( "SELECT * FROM {$table} WHERE domain = %s AND license_key = %s ORDER BY id DESC LIMIT 1", $domain, $key );
		} else {
			$sql = $wpdb->prepare( "SELECT * FROM {$table} WHERE domain = %s ORDER BY id DESC LIMIT 1", $domain );
		}

		$row = $wpdb->get_row( $sql, ARRAY_A );
		if ( ! $row ) {
			return self::license_mirror_deprecated_response(
				new WP_REST_Response( array( 'data' => array( 'status' => 'invalid', 'expiry_date' => null, 'remaining_days' => 0, 'remaining_percentage' => 0 ) ) ),
				'license/check'
			);
		}

		$exp        = $row['expires_at'] ? strtotime( $row['expires_at'] . ' UTC' ) : null;
		$valid_time = ! $exp || $exp > time();
		$max_users  = isset( $row['max_users'] ) ? (int) $row['max_users'] : 0;
		$user_count = (int) $wpdb->get_var( "SELECT COUNT(ID) FROM {$wpdb->users}" );
		$valid      = 'active' === $row['status'] && $valid_time && ( $max_users <= 0 || $user_count <= $max_users );

		$remaining_days = $exp ? max( 0, (int) floor( ( $exp - time() ) / DAY_IN_SECONDS ) ) : null;
		$remaining_pct  = 100;
		if ( $exp ) {
			$start_ts = ! empty( $row['created_at'] ) ? strtotime( $row['created_at'] . ' UTC' ) : null;
			if ( ! $start_ts && ! empty( $row['updated_at'] ) ) {
				$start_ts = strtotime( $row['updated_at'] . ' UTC' );
			}
			$total_days = ( $start_ts && $start_ts < $exp ) ? max( 1, (int) floor( ( $exp - $start_ts ) / DAY_IN_SECONDS ) ) : null;
			if ( null !== $remaining_days && $total_days ) {
				$remaining_pct = min( 100, (int) round( $remaining_days / $total_days * 100 ) );
			} else {
				$remaining_pct = null;
			}
		}

		$data = array(
			'status' => $valid ? 'valid' : 'invalid',
		);
		if ( current_user_can( 'manage_options' ) ) {
			$data['expiry_date']          = $row['expires_at'] ? gmdate( 'Y-m-d', strtotime( $row['expires_at'] ) ) : null;
			$data['remaining_days']       = $remaining_days;
			$data['remaining_percentage'] = $remaining_pct;
		}

		return self::license_mirror_deprecated_response(
			new WP_REST_Response( array( 'data' => $data ) ),
			'license/check'
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function license_activate( $request ) {
		if ( ! Webino_Dashboard_Rest_Base::rate_limit_ok( 'license_activate', 20, 300 ) ) {
			return new WP_Error( 'too_many', __( 'Too many attempts.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}

		$license = Webino_Dashboard_License::instance();
		$domain  = $license->get_current_domain();
		$req_dom = sanitize_text_field( (string) $request->get_param( 'domain' ) );
		if ( '' === $req_dom || $license->normalize_site_domain( $req_dom ) !== $domain ) {
			return new WP_Error( 'forbidden', __( 'Domain mismatch.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		$bound_key = $domain;
		$req_key   = sanitize_text_field( (string) $request->get_param( 'license_key' ) );
		if ( '' !== $req_key && $license->normalize_site_domain( $req_key ) !== $bound_key ) {
			return new WP_Error( 'forbidden', __( 'License key mismatch.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		$crm = $license->remote_activate();
		if ( empty( $crm['active'] ) && empty( $crm['demo'] ) ) {
			return new WP_Error( 'forbidden', __( 'License not confirmed by CRM.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		$id = 0;
		if ( (bool) apply_filters( 'webino_dashboard_license_mirror_persist', false ) ) {
			global $wpdb;
			$table = Webino_Dashboard_Rest_Base::licenses_table();
			$exp   = ! empty( $crm['expiry'] ) ? gmdate( 'Y-m-d H:i:s', strtotime( (string) $crm['expiry'] ) ) : null;
			$data  = array(
				'domain'      => $domain,
				'license_key' => $bound_key,
				'status'      => 'active',
				'expires_at'  => $exp,
				'max_users'   => 0,
				'meta'        => wp_json_encode( array( 'synced_via' => 'crm_activate' ) ),
				'updated_at'  => current_time( 'mysql', true ),
			);

			$existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE domain = %s AND license_key = %s LIMIT 1", $domain, $bound_key ) );
			if ( $existing ) {
				$updated = $wpdb->update( $table, $data, array( 'id' => (int) $existing ) );
				if ( false === $updated ) {
					return new WP_Error( 'db', __( 'Could not update license record.', 'webino-dashboard' ), array( 'status' => 403 ) );
				}
				$id = (int) $existing;
			} else {
				$data['created_at'] = current_time( 'mysql', true );
				$inserted           = $wpdb->insert( $table, $data );
				if ( false === $inserted ) {
					return new WP_Error( 'db', __( 'Could not save license record.', 'webino-dashboard' ), array( 'status' => 500 ) );
				}
				$id = (int) $wpdb->insert_id;
			}
		}

		return self::license_mirror_deprecated_response(
			new WP_REST_Response(
				array(
					'data' => array(
						'status'     => 'ok',
						'message'    => 'License confirmed by CRM',
						'license_id' => $id,
					),
				)
			),
			'license/activate'
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function module_licensed( $request ) {
		$slug = sanitize_key( (string) $request['slug'] );
		$ok    = (bool) get_option( 'webino_dashboard_module_' . $slug . '_active', true );
		return new WP_REST_Response( array( 'licensed' => $ok ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function analytics_summary( $request ) {
		if ( ! Webino_Dashboard_Module_Registry::analytics_ready() ) {
			return new WP_Error(
				'webino_module_disabled',
				__( 'This dashboard module is disabled.', 'webino-dashboard' ),
				array( 'status' => 403 )
			);
		}
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_REST_Response(
				array(
					'period_days'   => 30,
					'order_count'   => 0,
					'revenue'       => 0,
					'currency'      => '',
					'from'          => time() - 30 * DAY_IN_SECONDS,
					'to'            => time(),
					'from_date'     => gmdate( 'c', time() - 30 * DAY_IN_SECONDS ),
					'to_date'       => gmdate( 'c', time() ),
					'note'          => 'WooCommerce inactive',
					'daily_revenue' => array(),
				)
			);
		}

		$days = (int) $request->get_param( 'days' );
		if ( $days < 1 ) {
			$days = 30;
		}
		$days = min( 365, $days );

		$to_ts   = time();
		$from_ts = $to_ts - $days * DAY_IN_SECONDS;

		$agg = Webino_Dashboard_Order_Aggregates::sum_orders_in_range(
			array(
				'status'       => Webino_Dashboard_Order_Reports::default_statuses(),
				'date_created' => (int) $from_ts . '...' . (int) $to_ts,
			),
			true
		);

		$daily_out = array();
		foreach ( (array) ( $agg['daily'] ?? array() ) as $d => $sum ) {
			$daily_out[] = array(
				'date'    => $d,
				'revenue' => $sum,
			);
		}

		return new WP_REST_Response(
			array(
				'period_days'   => $days,
				'order_count'   => (int) $agg['order_count'],
				'revenue'       => (float) $agg['revenue'],
				'currency'      => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '',
				'from'          => $from_ts,
				'to'            => $to_ts,
				'from_date'     => gmdate( 'c', $from_ts ),
				'to_date'       => gmdate( 'c', $to_ts ),
				'daily_revenue' => $daily_out,
				'truncated'     => ! empty( $agg['truncated'] ),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		$user_id = get_current_user_id();
		$accent  = class_exists( 'Webino_Dashboard_Brand_Style', false )
			? Webino_Dashboard_Brand_Style::accent()
			: 'colorful';
		$body    = array(
			'ui_locale'             => get_user_meta( $user_id, 'webino_dashboard_locale', true ) ?: '',
			'ui_theme'              => get_user_meta( $user_id, 'webino_dashboard_theme', true ) ?: 'light',
			'ui_accent'             => $accent,
			'ui_fullscreen_default' => ( '1' === (string) get_user_meta( $user_id, 'webino_dashboard_fullscreen', true ) ),
		);
		if ( current_user_can( 'manage_options' ) ) {
			$body['dashboard_modules'] = self::settings_dashboard_modules_payload();
		}
		return new WP_REST_Response( $body );
	}

	/**
	 * Top-level + nested module ids/titles with active flag for settings UI.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	private static function settings_dashboard_modules_payload() {
		$mods = Webino_Dashboard_Modules::get_default_modules();
		$out  = array();
		foreach ( $mods as $m ) {
			self::settings_modules_payload_walk( $m, $out, '' );
		}
		$seen = array();
		foreach ( $out as $row ) {
			$seen[ (string) $row['id'] ] = true;
		}
		foreach ( Webino_Dashboard_Module_Registry::get_local_state_list() as $pkg ) {
			$slug = sanitize_key( (string) ( $pkg['slug'] ?? '' ) );
			if ( '' === $slug || empty( $pkg['installed'] ) || isset( $seen[ $slug ] ) ) {
				continue;
			}
			$seen[ $slug ] = true;
			$out[]         = array(
				'id'     => $slug,
				'title'  => (string) ( $pkg['settings_title'] ?? $pkg['name'] ?? $slug ),
				'active' => ! empty( $pkg['active'] ),
			);
		}
		return $out;
	}

	/**
	 * @param array<string,mixed>    $node   Module node.
	 * @param array<int,array<string,mixed>> $out    Accumulator.
	 * @param string                 $prefix Title prefix for nested items.
	 * @return void
	 */
	private static function settings_modules_payload_walk( $node, array &$out, $prefix ) {
		if ( ! is_array( $node ) ) {
			return;
		}
		$id = isset( $node['id'] ) ? (string) $node['id'] : '';
		if ( $id && empty( $node['exclude_from_module_toggle'] ) ) {
			$title = isset( $node['title'] ) ? (string) $node['title'] : $id;
			if ( $prefix ) {
				$title = $prefix . ' — ' . $title;
			}
			$out[] = array(
				'id'     => $id,
				'title'  => $title,
				'active' => Webino_Dashboard_Modules::is_module_enabled( $id ),
			);
		}
		if ( ! empty( $node['children'] ) && is_array( $node['children'] ) ) {
			$group = isset( $node['title'] ) && ! $id ? (string) $node['title'] : '';
			$next  = $prefix;
			if ( $group && ! $id ) {
				$next = $prefix ? $prefix . ' / ' . $group : $group;
			}
			foreach ( $node['children'] as $c ) {
				self::settings_modules_payload_walk( $c, $out, $next );
			}
		}
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_post( $request ) {
		$user_id = get_current_user_id();
		$loc     = sanitize_text_field( (string) $request->get_param( 'ui_locale' ) );
		$theme   = sanitize_key( (string) $request->get_param( 'ui_theme' ) );
		if ( $loc ) {
			update_user_meta( $user_id, 'webino_dashboard_locale', $loc );
		}
		if ( $theme ) {
			update_user_meta( $user_id, 'webino_dashboard_theme', $theme );
		}
		// ui_accent is site-locked via settings/style (Brand_Style); ignore per-user writes.
		if ( null !== $request->get_param( 'ui_fullscreen_default' ) ) {
			update_user_meta( $user_id, 'webino_dashboard_fullscreen', ! empty( $request->get_param( 'ui_fullscreen_default' ) ) ? '1' : '0' );
		}
		$mods_param = $request->get_param( 'modules' );
		if ( is_array( $mods_param ) && ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 'forbidden', __( 'Forbidden.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		if ( is_array( $mods_param ) && current_user_can( 'manage_options' ) ) {
			$allowed = array_flip( Webino_Dashboard_Modules::collect_module_ids( Webino_Dashboard_Modules::get_default_modules() ) );
			foreach ( Webino_Dashboard_Module_Registry::list_installed_module_slugs() as $pkg_slug ) {
				$allowed[ $pkg_slug ] = true;
			}
			foreach ( $mods_param as $slug => $active ) {
				$slug = sanitize_key( (string) $slug );
				if ( 'settings' === $slug ) {
					$slug = 'settings-app';
				}
				if ( '' === $slug || 'home' === $slug || ! isset( $allowed[ $slug ] ) ) {
					continue;
				}
				$active_flag = ! empty( $active );
				$package_slug = Webino_Dashboard_Module_Registry::slug_for_sidebar_module_id( $slug );
				if ( '' !== $package_slug && Webino_Dashboard_Module_Registry::is_installed( $package_slug ) ) {
					Webino_Dashboard_Module_Registry::set_active( $package_slug, $active_flag );
					continue;
				}
				update_option( 'webino_dashboard_module_' . $slug . '_active', $active_flag ? '1' : '0' );
				if ( 'settings-app' === $slug ) {
					update_option( 'webino_dashboard_module_settings_active', ! empty( $active ) ? '1' : '0' );
				}
			}
		}
		$docs_param = $request->get_param( 'order_documents' );
		if ( is_array( $docs_param ) && ! current_user_can( 'manage_woocommerce' ) ) {
			return new WP_Error( 'forbidden', __( 'Forbidden.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		if ( is_array( $docs_param ) && current_user_can( 'manage_woocommerce' ) ) {
			Webino_Dashboard_Order_Document_Settings::save( $docs_param );
		}
		$sms_param = $request->get_param( 'sms' );
		if ( is_array( $sms_param ) && ! current_user_can( 'manage_woocommerce' ) ) {
			return new WP_Error( 'forbidden', __( 'Forbidden.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		if ( is_array( $sms_param ) && current_user_can( 'manage_woocommerce' ) && Webino_Dashboard_Module_Registry::sms_ready() ) {
			Webino_Dashboard_Sms_Settings::save( $sms_param );
		}
		return self::settings_get();
	}

	/**
	 * Avatar URL safe for dashboard (no Gravatar / blocked external hosts).
	 *
	 * @param int $user_id User ID.
	 * @param int $size    Pixel size.
	 * @return string Empty when only Gravatar would be used.
	 */
	public static function dashboard_avatar_url( $user_id, $size = 64 ) {
		$user_id = (int) $user_id;
		if ( $user_id <= 0 ) {
			return '';
		}
		$url = (string) get_avatar_url( $user_id, array( 'size' => max( 16, (int) $size ) ) );
		if ( self::is_blocked_external_asset_url( $url ) ) {
			return '';
		}
		return $url;
	}

	/**
	 * Placeholder avatar bundled with the dashboard build (same-origin).
	 *
	 * @return string
	 */
	public static function dashboard_avatar_placeholder_url() {
		return plugins_url( 'assets/dashboard-build/avatar-placeholder.svg', WEBINO_DASHBOARD_FILE );
	}

	/**
	 * Whether a URL points outside the site (Gravatar, CRM CDN, etc.).
	 *
	 * @param string $url Asset URL.
	 * @return bool
	 */
	public static function is_blocked_external_asset_url( $url ) {
		$url = trim( (string) $url );
		if ( '' === $url ) {
			return true;
		}
		$host = wp_parse_url( $url, PHP_URL_HOST );
		if ( ! is_string( $host ) || '' === $host ) {
			return true;
		}
		$host = strtolower( $host );
		if ( false !== strpos( $host, 'gravatar.com' ) ) {
			return true;
		}
		$site_host = wp_parse_url( home_url(), PHP_URL_HOST );
		if ( ! is_string( $site_host ) || '' === $site_host ) {
			return false;
		}
		return strtolower( $site_host ) !== $host;
	}

	/**
	 * Absolute URL for Open Graph / PWA branding.
	 *
	 * @return string
	 */
	public static function site_icon_url() {
		$icon = get_site_icon_url();
		if ( $icon ) {
			return $icon;
		}
		return plugins_url( 'assets/dashboard-build/favicon.svg', WEBINO_DASHBOARD_FILE );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function manifest() {
		if ( class_exists( 'Webino_Dashboard_PWA', false ) && ! Webino_Dashboard_PWA::is_enabled() ) {
			return new WP_REST_Response( array( 'error' => 'disabled' ), 404 );
		}
		$body = class_exists( 'Webino_Dashboard_PWA', false )
			? Webino_Dashboard_PWA::manifest_body()
			: array(
				'name'             => get_bloginfo( 'name' ) . ' — ' . __( 'Dashboard', 'webino-dashboard' ),
				'short_name'       => 'Dashboard',
				'start_url'        => Webino_Dashboard_Rewrite::url(),
				'scope'            => Webino_Dashboard_Rewrite::url(),
				'display'          => 'standalone',
				'background_color' => '#ffffff',
				'theme_color'      => '#0f172a',
			);
		$res = new WP_REST_Response( $body );
		$res->header( 'Content-Type', 'application/manifest+json; charset=' . get_option( 'blog_charset' ) );
		$res->header( 'Cache-Control', 'no-cache, must-revalidate, max-age=0' );
		return $res;
	}

	/**
	 * GET settings/style
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_style_get() {
		if ( ! class_exists( 'Webino_Dashboard_Brand_Style', false ) ) {
			return new WP_Error( 'no_style', __( 'Brand style unavailable.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		return new WP_REST_Response( Webino_Dashboard_Brand_Style::settings_response_full() );
	}

	/**
	 * POST settings/style
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_style_post( $request ) {
		if ( ! class_exists( 'Webino_Dashboard_Brand_Style', false ) ) {
			return new WP_Error( 'no_style', __( 'Brand style unavailable.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = $request->get_params();
		}
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$out = Webino_Dashboard_Brand_Style::save_aggregate( $params );
		$uid = get_current_user_id();
		if ( $uid > 0 ) {
			delete_transient( 'webino_dashboard_boot_' . $uid );
		}
		return new WP_REST_Response( $out );
	}

	/**
	 * GET settings/pwa
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_pwa_get() {
		if ( ! class_exists( 'Webino_Dashboard_PWA', false ) ) {
			return new WP_Error( 'no_pwa', __( 'PWA unavailable.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		return new WP_REST_Response( Webino_Dashboard_PWA::settings_response() );
	}

	/**
	 * POST settings/pwa
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_pwa_post( $request ) {
		if ( ! class_exists( 'Webino_Dashboard_PWA', false ) ) {
			return new WP_Error( 'no_pwa', __( 'PWA unavailable.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = $request->get_params();
		}
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$clean = Webino_Dashboard_PWA::sanitize_settings( array_merge( Webino_Dashboard_PWA::get_settings(), $params ) );
		update_option( Webino_Dashboard_PWA::OPTION, $clean, false );
		return new WP_REST_Response( Webino_Dashboard_PWA::settings_response() );
	}

	public static function shop_products_lookup() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$cat_out = array();
		$cats    = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
			)
		);
		if ( ! is_wp_error( $cats ) ) {
			foreach ( $cats as $t ) {
				$cat_out[] = array(
					'id'     => (int) $t->term_id,
					'slug'   => $t->slug,
					'name'   => $t->name,
					'parent' => (int) $t->parent,
				);
			}
		}

		$brand_out = array();
		if ( taxonomy_exists( 'product_brand' ) ) {
			$brands = get_terms(
				array(
					'taxonomy'   => 'product_brand',
					'hide_empty' => false,
				)
			);
			if ( ! is_wp_error( $brands ) ) {
				foreach ( $brands as $t ) {
					$brand_out[] = array(
						'id'     => (int) $t->term_id,
						'slug'   => $t->slug,
						'name'   => $t->name,
						'parent' => (int) $t->parent,
					);
				}
			}
		}

		$tag_out = array();
		$tags    = get_terms(
			array(
				'taxonomy'   => 'product_tag',
				'hide_empty' => false,
			)
		);
		if ( ! is_wp_error( $tags ) ) {
			foreach ( $tags as $t ) {
				$tag_out[] = array(
					'id'   => (int) $t->term_id,
					'slug' => $t->slug,
					'name' => $t->name,
				);
			}
		}

		$product_base   = 'product';
		if ( function_exists( 'wc_get_permalink_structure' ) ) {
			$struct = wc_get_permalink_structure();
			if ( is_array( $struct ) && ! empty( $struct['product_rewrite_slug'] ) ) {
				$product_base = (string) $struct['product_rewrite_slug'];
			}
		}
		$permalink_base = trailingslashit( home_url( '/' . trim( $product_base, '/' ) ) );

		$ishop_labels = array(
			array( 'key' => 'check_purchase', 'label' => 'قابل خرید بصورت چک' ),
			array( 'key' => 'installment_purchase', 'label' => 'قابل خرید بصورت اقساطی' ),
			array( 'key' => 'credit_purchase', 'label' => 'قابل خرید بصورت اعتباری' ),
			array( 'key' => 'original_product', 'label' => 'کالای اصل' ),
			array( 'key' => 'non_original_product', 'label' => 'کالای غیراصل' ),
			array( 'key' => 'has_warranty', 'label' => 'دارای گارانتی' ),
		);
		if ( class_exists( 'ishop_theme_util', false ) && method_exists( 'ishop_theme_util', 'get_theme_option' ) ) {
			$global_labels = ishop_theme_util::get_theme_option( 'global_product_labels' );
			if ( is_array( $global_labels ) && isset( $global_labels['label_key'] ) && is_array( $global_labels['label_key'] ) ) {
				foreach ( $global_labels['label_key'] as $index => $label_key ) {
					$label_key = sanitize_key( (string) $label_key );
					$text      = isset( $global_labels['label_text'][ $index ] ) ? (string) $global_labels['label_text'][ $index ] : '';
					if ( '' === $label_key || '' === $text ) {
						continue;
					}
					$found = false;
					foreach ( $ishop_labels as $i => $row ) {
						if ( $row['key'] === $label_key ) {
							$ishop_labels[ $i ]['label'] = $text;
							$found                       = true;
							break;
						}
					}
					if ( ! $found ) {
						$ishop_labels[] = array(
							'key'   => $label_key,
							'label' => $text,
						);
					}
				}
			}
		}

		return new WP_REST_Response(
			array(
				'categories'          => $cat_out,
				'brands'              => $brand_out,
				'tags'                => $tag_out,
				'permalink_base'      => $permalink_base,
				'rank_math_available' => class_exists( 'RankMath', false ) || defined( 'RANK_MATH_VERSION' ),
				'ishop_labels'        => $ishop_labels,
				'site_name'           => (string) get_bloginfo( 'name' ),
				'seo_sep'             => ' - ',
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shop_products( $request ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$page     = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$search   = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$sort     = sanitize_key( (string) $request->get_param( 'sort' ) ) ?: 'date_desc';

		$status_param = sanitize_key( (string) $request->get_param( 'status' ) );
		$statuses     = array( 'publish', 'draft', 'pending' );
		if ( in_array( $status_param, array( 'publish', 'draft', 'pending', 'private' ), true ) ) {
			$statuses = array( $status_param );
		}

		$orderby = 'date';
		$order   = 'DESC';
		switch ( $sort ) {
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
				$orderby = 'price';
				$order   = 'ASC';
				break;
			case 'price_desc':
				$orderby = 'price';
				$order   = 'DESC';
				break;
		}

		$args = array(
			'status'   => $statuses,
			'limit'    => $per_page,
			'page'     => $page,
			'orderby'  => $orderby,
			'order'    => $order,
			'paginate' => true,
			'return'   => 'objects',
		);
		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		$cat = sanitize_title( (string) $request->get_param( 'category' ) );
		if ( '' !== $cat ) {
			$args['category'] = array( $cat );
		}
		$tag = sanitize_title( (string) $request->get_param( 'tag' ) );
		if ( '' !== $tag ) {
			$args['tag'] = array( $tag );
		}
		$type = sanitize_key( (string) $request->get_param( 'type' ) );
		if ( in_array( $type, array( 'simple', 'variable', 'grouped', 'external' ), true ) ) {
			$args['type'] = $type;
		}

		$tax_query = array();
		$brand     = sanitize_title( (string) $request->get_param( 'brand' ) );
		if ( '' !== $brand && taxonomy_exists( 'product_brand' ) ) {
			$tax_query[] = array(
				'taxonomy' => 'product_brand',
				'field'    => 'slug',
				'terms'    => $brand,
			);
		}
		$vis = sanitize_key( (string) $request->get_param( 'catalog_visibility' ) );
		if ( in_array( $vis, array( 'visible', 'catalog', 'search', 'hidden' ), true ) && taxonomy_exists( 'product_visibility' ) ) {
			if ( 'visible' === $vis ) {
				$tax_query[] = array(
					'taxonomy' => 'product_visibility',
					'field'    => 'name',
					'terms'    => array( 'exclude-from-catalog', 'exclude-from-search' ),
					'operator' => 'NOT IN',
				);
			} elseif ( 'catalog' === $vis ) {
				$tax_query[] = array(
					'taxonomy' => 'product_visibility',
					'field'    => 'name',
					'terms'    => array( 'exclude-from-search' ),
					'operator' => 'IN',
				);
			} elseif ( 'search' === $vis ) {
				$tax_query[] = array(
					'taxonomy' => 'product_visibility',
					'field'    => 'name',
					'terms'    => array( 'exclude-from-catalog' ),
					'operator' => 'IN',
				);
			} else {
				$tax_query[] = array(
					'taxonomy' => 'product_visibility',
					'field'    => 'name',
					'terms'    => array( 'exclude-from-catalog', 'exclude-from-search' ),
					'operator' => 'AND',
				);
			}
		}
		if ( ! empty( $tax_query ) ) {
			$tax_query['relation'] = 'AND';
			$args['tax_query']     = $tax_query;
		}

		$stock_filter = sanitize_key( (string) $request->get_param( 'stock_status' ) );
		if ( in_array( $stock_filter, array( 'instock', 'outofstock', 'onbackorder' ), true ) ) {
			$args['stock_status'] = $stock_filter;
		}

		$date_from = sanitize_text_field( (string) $request->get_param( 'date_from' ) );
		$date_to   = sanitize_text_field( (string) $request->get_param( 'date_to' ) );
		if ( '' !== $date_from && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_from ) ) {
			$args['date_created'] = '>=' . $date_from;
		}
		if ( '' !== $date_to && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_to ) ) {
			// Prefer inclusive upper bound when both ends are set.
			if ( isset( $args['date_created'] ) ) {
				$args['date_created'] = $date_from . '...' . $date_to;
			} else {
				$args['date_created'] = '<=' . $date_to;
			}
		}

		$result = wc_get_products( $args );
		$out    = array();
		$found  = 0;
		$total_pages = 1;
		if ( is_object( $result ) && isset( $result->products ) ) {
			foreach ( $result->products as $product ) {
				if ( ! $product ) {
					continue;
				}
				$out[] = self::map_product_list_item( $product );
			}
			$found       = (int) $result->total;
			$total_pages = max( 1, (int) $result->max_num_pages );
		} elseif ( is_array( $result ) ) {
			foreach ( $result as $product ) {
				if ( ! $product ) {
					continue;
				}
				$out[] = self::map_product_list_item( $product );
			}
			$found       = count( $out );
			$total_pages = max( 1, (int) ceil( $found / $per_page ) );
		}

		return new WP_REST_Response(
			array(
				'items'       => $out,
				'page'        => $page,
				'per_page'    => $per_page,
				'found'       => $found,
				'total_pages' => $total_pages,
			)
		);
	}

	/**
	 * @param WC_Product $p Product.
	 * @return array<string,mixed>
	 */
	public static function map_product_list_item( $p ) {
		$id = $p->get_id();

		$regular = (float) $p->get_regular_price();
		$sale    = (float) $p->get_sale_price();
		$discount_percent = null;
		if ( $regular > 0 && $sale > 0 && $sale < $regular ) {
			$discount_percent = round( ( ( $regular - $sale ) / $regular ) * 100, 1 );
		}

		$brand = null;
		if ( taxonomy_exists( 'product_brand' ) ) {
			$brand_terms = wp_get_post_terms( $id, 'product_brand', array( 'number' => 1 ) );
			if ( ! is_wp_error( $brand_terms ) && ! empty( $brand_terms ) ) {
				$t     = $brand_terms[0];
				$brand = array(
					'id'   => (int) $t->term_id,
					'name' => $t->name,
					'slug' => $t->slug,
				);
			}
		}

		$categories = array();
		$cat_terms  = wp_get_post_terms( $id, 'product_cat' );
		if ( ! is_wp_error( $cat_terms ) ) {
			foreach ( $cat_terms as $t ) {
				$categories[] = array(
					'id'   => (int) $t->term_id,
					'name' => $t->name,
					'slug' => $t->slug,
				);
			}
		}

		$tags = array();
		$tag_terms = wp_get_post_terms( $id, 'product_tag' );
		if ( ! is_wp_error( $tag_terms ) ) {
			foreach ( $tag_terms as $t ) {
				$tags[] = array(
					'id'   => (int) $t->term_id,
					'name' => $t->name,
					'slug' => $t->slug,
				);
			}
		}

		$views_raw = get_post_meta( $id, 'post_views_count', true );
		if ( '' === $views_raw || false === $views_raw ) {
			$views_raw = get_post_meta( $id, 'views', true );
		}
		$views = ( '' !== $views_raw && false !== $views_raw ) ? (int) $views_raw : null;

		$thumb_id = (int) $p->get_image_id();
		$image_url = $thumb_id ? (string) wp_get_attachment_image_url( $thumb_id, 'thumbnail' ) : '';

		$post = get_post( $id );
		$date = $post ? get_post_time( 'c', true, $post ) : null;

		$wfcp = self::map_product_list_wfcp( $p );

		return array(
			'id'                => $id,
			'name'              => $p->get_name(),
			'sku'               => $p->get_sku(),
			'type'              => $p->get_type(),
			'status'            => $p->get_status(),
			'catalog_visibility'=> $p->get_catalog_visibility(),
			'image_url'         => $image_url,
			'permalink'         => get_permalink( $id ),
			'date'              => $date,
			'views'             => $views,
			'price'             => $p->get_price(),
			'regular'           => $p->get_regular_price(),
			'sale'              => $p->get_sale_price(),
			'discount_percent'  => $discount_percent,
			'stock'             => $p->get_stock_quantity(),
			'stock_status'      => $p->get_stock_status(),
			'manage_stock'      => $p->get_manage_stock(),
			'brand'             => $brand,
			'categories'        => $categories,
			'tags'              => $tags,
			'wfcp'              => $wfcp,
			'marketplace_badges' => class_exists( 'Webino_Dashboard_Marketplace' )
				? Webino_Dashboard_Marketplace::product_slugs( $id )
				: array(),
		);
	}

	/**
	 * @param WC_Product $p Product.
	 * @return array<string,mixed>
	 */
	public static function map_product_list_wfcp( $p ) {
		$id     = $p->get_id();
		$locked = false;

		if ( class_exists( 'WFCP_Helper' ) ) {
			$locked = WFCP_Helper::is_product_price_locked( $id );
		} else {
			$locked = (bool) get_post_meta( $id, '_wfcp_lock_price', true );
		}

		$purchase_values = array();
		$calc_id         = $id;

		if ( $p->is_type( 'variable' ) ) {
			$children = $p->get_children();
			if ( empty( $children ) ) {
				$q = new WP_Query(
					array(
						'post_type'      => 'product_variation',
						'post_parent'    => $id,
						'posts_per_page' => -1,
						'fields'         => 'ids',
						'post_status'    => array( 'publish', 'private' ),
					)
				);
				$children = $q->posts;
			}
			foreach ( (array) $children as $vid ) {
				$vid = (int) $vid;
				if ( $vid <= 0 ) {
					continue;
				}
				$vp = null;
				if ( class_exists( 'WFCP_Helper' ) ) {
					$vp = WFCP_Helper::get_product_purchase_price( $vid );
				} else {
					$raw = get_post_meta( $vid, '_wfcp_purchase_price', true );
					if ( '' !== $raw && false !== $raw ) {
						$vp = (float) $raw;
					}
				}
				if ( null !== $vp && (float) $vp > 0 ) {
					$purchase_values[] = (float) $vp;
				}
			}
			// Fallback to parent meta if no variation purchase prices.
			if ( empty( $purchase_values ) ) {
				$parent_purchase = null;
				if ( class_exists( 'WFCP_Helper' ) ) {
					$parent_purchase = WFCP_Helper::get_product_purchase_price( $id );
				} else {
					$raw = get_post_meta( $id, '_wfcp_purchase_price', true );
					if ( '' !== $raw && false !== $raw ) {
						$parent_purchase = (float) $raw;
					}
				}
				if ( null !== $parent_purchase && (float) $parent_purchase > 0 ) {
					$purchase_values[] = (float) $parent_purchase;
				}
			}
		} else {
			$purchase = null;
			if ( class_exists( 'WFCP_Helper' ) ) {
				$purchase = WFCP_Helper::get_product_purchase_price( $id );
			} else {
				$raw = get_post_meta( $id, '_wfcp_purchase_price', true );
				if ( '' !== $raw && false !== $raw ) {
					$purchase = (float) $raw;
				}
			}
			if ( null !== $purchase && (float) $purchase > 0 ) {
				$purchase_values[] = (float) $purchase;
			}
		}

		$purchase_min = ! empty( $purchase_values ) ? min( $purchase_values ) : 0.0;
		$purchase_max = ! empty( $purchase_values ) ? max( $purchase_values ) : 0.0;
		$purchase_f   = $purchase_min;

		$retail_min  = 0.0;
		$retail_max  = 0.0;
		$credit      = 0.0;
		$wholesale   = 0.0;
		$installment = null;
		$marketplace = array();
		$platforms   = array();
		$slugs       = array( 'digikala', 'basalam', 'technolife', 'snappshop', 'tapsishop', 'zarehbin', 'emalls', 'snapppay-search', 'torob' );

		if ( $purchase_min > 0 && class_exists( 'WFCP_Calculator' ) ) {
			$retail_min  = (float) WFCP_Calculator::calculate_price( $purchase_min, 'retail', $calc_id );
			$retail_max  = $purchase_max > 0
				? (float) WFCP_Calculator::calculate_price( $purchase_max, 'retail', $calc_id )
				: $retail_min;
			$credit      = (float) WFCP_Calculator::calculate_price( $purchase_f, 'credit', $calc_id );
			$wholesale   = (float) WFCP_Calculator::calculate_price( $purchase_f, 'wholesale', $calc_id );
			$installment = self::wfcp_list_installment_price( $purchase_f, $calc_id );
			foreach ( $slugs as $slug ) {
				$marketplace[ $slug ] = (float) WFCP_Calculator::calculate_price( $purchase_f, $slug, $calc_id );
			}
		}

		foreach ( $slugs as $slug ) {
			$platforms[ $slug ] = array(
				'price'        => isset( $marketplace[ $slug ] ) && $marketplace[ $slug ] > 0 ? $marketplace[ $slug ] : null,
				'lock'         => '1' === (string) $p->get_meta( '_wfcp_' . $slug . '_lock', true ),
				'manual_price' => $p->get_meta( '_wfcp_' . $slug . '_price', true ),
			);
		}

		$wholesale_rule = $p->get_meta( '_wfcp_wholesale_custom_rule', true );
		if ( ! is_array( $wholesale_rule ) ) {
			$wholesale_rule = null;
		}

		$out = array(
			'purchase_price'     => $purchase_f > 0 ? $purchase_f : null,
			'purchase_price_min' => $purchase_min > 0 ? $purchase_min : null,
			'purchase_price_max' => $purchase_max > 0 ? $purchase_max : null,
			'lock_price'         => $locked,
			'retail'             => $retail_min > 0 ? $retail_min : null,
			'retail_min'         => $retail_min > 0 ? $retail_min : null,
			'retail_max'         => $retail_max > 0 ? $retail_max : null,
			'credit'             => $credit > 0 ? $credit : null,
			'wholesale'          => $wholesale > 0 ? $wholesale : null,
			'installment'        => $installment,
			'marketplace'        => $marketplace,
			'platforms'          => $platforms,
			'wholesale_rule'     => $wholesale_rule,
		);

		if ( class_exists( 'WFCP_Helper' ) ) {
			$out['settings_currency'] = function_exists( 'get_woocommerce_currency' )
				? get_woocommerce_currency()
				: WFCP_Helper::get_settings( 'general', 'currency' );
		}

		return $out;
	}

	/**
	 * @param float $purchase Purchase price.
	 * @param int   $product_id Product ID.
	 * @return float|null
	 */
	private static function wfcp_list_installment_price( $purchase, $product_id ) {
		if ( ! class_exists( 'WFCP_Helper' ) || ! class_exists( 'WFCP_Calculator' ) ) {
			return null;
		}
		if ( ! WFCP_Helper::get_settings( 'installment', 'enabled' ) ) {
			return null;
		}
		$plans = WFCP_Helper::get_settings( 'installment', 'plans' );
		if ( ! is_array( $plans ) || empty( $plans ) ) {
			return null;
		}
		$first  = reset( $plans );
		$months = isset( $first['months'] ) ? (int) $first['months'] : 0;
		if ( $months < 1 ) {
			return null;
		}
		$price = (float) WFCP_Calculator::calculate_price(
			$purchase,
			'installment',
			$product_id,
			array( 'months' => $months )
		);
		return $price > 0 ? $price : null;
	}

	/**
	 * @param WC_Product $p Product.
	 * @return array<string,mixed>
	 */
	public static function map_product_row( $p ) {
		$id = $p->get_id();
		$thumb_id = (int) $p->get_image_id();
		$row = array(
			'id'                  => $id,
			'name'                => $p->get_name(),
			'slug'                => $p->get_slug(),
			'sku'                 => $p->get_sku(),
			'moadian_sstid'       => (string) get_post_meta( $id, '_webino_moadian_sstid', true ),
			'moadian_vat_rate'    => (float) get_post_meta( $id, '_webino_moadian_vat_rate', true ),
			'moadian_tax_exempt'  => '1' === (string) get_post_meta( $id, '_webino_moadian_tax_exempt', true ),
			'status'              => $p->get_status(),
			'type'                => $p->get_type(),
			'price'               => $p->get_price(),
			'regular'             => $p->get_regular_price(),
			'sale'                => $p->get_sale_price(),
			'description'         => $p->get_description(),
			'short_description'   => $p->get_short_description(),
			'manage_stock'        => $p->get_manage_stock(),
			'stock'               => $p->get_stock_quantity(),
			'stock_status'        => $p->get_stock_status(),
			'image_id'            => $thumb_id,
			'image_url'           => $thumb_id ? (string) wp_get_attachment_image_url( $thumb_id, 'medium' ) : '',
			'gallery_ids'         => array_map( 'intval', (array) $p->get_gallery_image_ids() ),
			'gallery_urls'        => array(),
			'category_ids'      => array_map( 'intval', (array) $p->get_category_ids() ),
			'brand_ids'           => array(),
			'product_attributes'  => array(),
			'weight'              => $p->get_weight(),
			'length'              => $p->get_length(),
			'width'               => $p->get_width(),
			'height'              => $p->get_height(),
		);

		if ( taxonomy_exists( 'product_brand' ) ) {
			$bids = wp_get_post_terms( $id, 'product_brand', array( 'fields' => 'ids' ) );
			$row['brand_ids'] = is_wp_error( $bids ) ? array() : array_map( 'intval', $bids );
		}

		$product_attrs = $p->get_attributes();
		if ( ! empty( $product_attrs ) ) {
			uasort(
				$product_attrs,
				static function ( $a, $b ) {
					if ( ! is_a( $a, 'WC_Product_Attribute' ) || ! is_a( $b, 'WC_Product_Attribute' ) ) {
						return 0;
					}
					return (int) $a->get_position() <=> (int) $b->get_position();
				}
			);
		}
		foreach ( $product_attrs as $attr ) {
			if ( ! is_a( $attr, 'WC_Product_Attribute' ) ) {
				continue;
			}
			$options = $attr->get_options();
			if ( $attr->is_taxonomy() && function_exists( 'wc_get_product_terms' ) ) {
				$names = wc_get_product_terms( $id, $attr->get_name(), array( 'fields' => 'names' ) );
				if ( ! is_wp_error( $names ) && is_array( $names ) ) {
					$options = $names;
				}
			}
			$row['product_attributes'][] = array(
				'name'         => $attr->get_name(),
				'label'        => function_exists( 'wc_attribute_label' ) ? (string) wc_attribute_label( $attr->get_name(), $p ) : (string) $attr->get_name(),
				'options'      => $options,
				'variation'    => $attr->get_variation(),
				'visible'      => $attr->get_visible(),
				'taxonomy'     => $attr->is_taxonomy(),
				'attribute_id' => $attr->get_id(),
			);
		}
		if ( class_exists( 'Webino_Dashboard_Order_Configs', false ) && ! empty( $row['product_attributes'] ) ) {
			$row['product_attributes'] = Webino_Dashboard_Order_Configs::merge_into_attribute_rows( $id, $row['product_attributes'] );
		}

		$row['virtual']             = $p->get_virtual();
		$row['downloadable']        = $p->get_downloadable();
		$row['catalog_visibility']  = $p->get_catalog_visibility();
		$row['featured']            = $p->get_featured();
		$row['sold_individually']   = $p->get_sold_individually();
		$row['backorders']          = $p->get_backorders();
		$row['low_stock_amount']    = $p->get_low_stock_amount();
		$row['shipping_class_id']   = $p->get_shipping_class_id();
		$row['tax_status']          = $p->get_tax_status();
		$row['tax_class']           = $p->get_tax_class();
		$row['upsell_ids']          = array_map( 'intval', $p->get_upsell_ids() );
		$row['cross_sell_ids']      = array_map( 'intval', $p->get_cross_sell_ids() );
		$row['purchase_note']       = $p->get_purchase_note();
		$row['menu_order']          = $p->get_menu_order();
		$dsf                        = $p->get_date_on_sale_from();
		$dst                        = $p->get_date_on_sale_to();
		$row['date_on_sale_from']   = $dsf ? $dsf->format( 'c' ) : null;
		$row['date_on_sale_to']     = $dst ? $dst->format( 'c' ) : null;
		$tids                       = wp_get_post_terms( $id, 'product_tag', array( 'fields' => 'ids' ) );
		$row['tag_ids']             = is_wp_error( $tids ) ? array() : array_map( 'intval', $tids );
		$row['tags']                = array();
		$tag_terms                  = wp_get_post_terms( $id, 'product_tag' );
		if ( ! is_wp_error( $tag_terms ) ) {
			foreach ( $tag_terms as $t ) {
				$row['tags'][] = array(
					'id'   => (int) $t->term_id,
					'name' => $t->name,
					'slug' => $t->slug,
				);
			}
		}
		foreach ( $row['gallery_ids'] as $gid ) {
			$url = wp_get_attachment_image_url( (int) $gid, 'thumbnail' );
			if ( $url ) {
				$row['gallery_urls'][] = array(
					'id'  => (int) $gid,
					'url' => (string) $url,
				);
			}
		}
		$row['variation_ids']       = $p->is_type( 'variable' ) ? array_map( 'intval', $p->get_children() ) : array();

		if ( $p->is_type( 'grouped' ) ) {
			$row['grouped_children_ids'] = array_map( 'intval', $p->get_children() );
		} else {
			$row['grouped_children_ids'] = array();
		}

		if ( $p->is_type( 'external' ) ) {
			$row['product_url'] = $p->get_product_url();
			$row['button_text'] = $p->get_button_text();
		} else {
			$row['product_url'] = '';
			$row['button_text'] = '';
		}

		if ( $p->is_downloadable() && method_exists( $p, 'get_downloads' ) ) {
			$dls = array();
			foreach ( $p->get_downloads() as $dl ) {
				if ( is_object( $dl ) && method_exists( $dl, 'get_file' ) ) {
					$dls[] = array(
						'name' => method_exists( $dl, 'get_name' ) ? $dl->get_name() : '',
						'file' => $dl->get_file(),
						'id'   => method_exists( $dl, 'get_id' ) ? $dl->get_id() : '',
					);
				}
			}
			$row['downloads'] = $dls;
		} else {
			$row['downloads'] = array();
		}

		$row['wfcp'] = array(
			'purchase_price' => get_post_meta( $id, '_wfcp_purchase_price', true ),
			'lock_price'     => (bool) get_post_meta( $id, '_wfcp_lock_price', true ),
			'wholesale_rule' => get_post_meta( $id, '_wfcp_wholesale_custom_rule', true ),
			'reference_url'  => (string) get_post_meta( $id, '_wfcp_reference_url', true ),
			'reference_source' => (string) get_post_meta( $id, '_wfcp_reference_source', true ),
			'reference_last_sync' => get_post_meta( $id, '_wfcp_reference_last_sync', true ),
		);

		if ( class_exists( 'WFCP_Helper' ) ) {
			$row['wfcp']['settings_currency'] = WFCP_Helper::get_settings( 'general', 'currency' );
		}

		$row['wfcp_prices'] = self::map_product_list_wfcp( $p );

		$permalink = (string) get_permalink( $id );
		$slug      = (string) $p->get_slug();
		$permalink_base = trailingslashit( home_url( '/product' ) );
		if ( function_exists( 'wc_get_permalink_structure' ) ) {
			$struct = wc_get_permalink_structure();
			if ( is_array( $struct ) && ! empty( $struct['product_rewrite_slug'] ) ) {
				$permalink_base = trailingslashit( home_url( '/' . trim( (string) $struct['product_rewrite_slug'], '/' ) ) );
			}
		}
		if ( '' !== $slug && false !== strpos( $permalink, $slug ) ) {
			$permalink_base = (string) preg_replace( '#' . preg_quote( $slug, '#' ) . '/?$#', '', $permalink );
			$permalink_base = trailingslashit( $permalink_base );
		}
		$row['permalink']          = $permalink;
		$row['permalink_base']     = $permalink_base;
		$row['permalink_template'] = $permalink_base . '%postname%/';
		$row['seo']                = self::map_product_seo( $id );
		$row['ishop']              = self::map_product_ishop( $id );
		$row['rank_math_available'] = class_exists( 'RankMath', false ) || defined( 'RANK_MATH_VERSION' );

		return $row;
	}

	/**
	 * Rank Math SEO meta for product editor.
	 *
	 * @param int $id Product ID.
	 * @return array<string,mixed>
	 */
	public static function map_product_seo( $id ) {
		$id = (int) $id;
		$robots = get_post_meta( $id, 'rank_math_robots', true );
		if ( ! is_array( $robots ) ) {
			$robots = array();
		}
		$advanced = get_post_meta( $id, 'rank_math_advanced_robots', true );
		if ( ! is_array( $advanced ) ) {
			$advanced = array();
		}

		$schema_type = (string) get_post_meta( $id, 'rank_math_rich_snippet', true );
		if ( '' === $schema_type ) {
			$schema_type = 'product';
		}

		return array(
			'title'               => (string) get_post_meta( $id, 'rank_math_title', true ),
			'description'         => (string) get_post_meta( $id, 'rank_math_description', true ),
			'focus_keyword'       => (string) get_post_meta( $id, 'rank_math_focus_keyword', true ),
			'canonical_url'       => (string) get_post_meta( $id, 'rank_math_canonical_url', true ),
			'robots'              => array_values( array_map( 'strval', $robots ) ),
			'advanced_robots'     => $advanced,
			'breadcrumb_title'    => (string) get_post_meta( $id, 'rank_math_breadcrumb_title', true ),
			'pillar_content'      => 'on' === (string) get_post_meta( $id, 'rank_math_pillar_content', true ) || '1' === (string) get_post_meta( $id, 'rank_math_pillar_content', true ),
			'facebook_title'      => (string) get_post_meta( $id, 'rank_math_facebook_title', true ),
			'facebook_description'=> (string) get_post_meta( $id, 'rank_math_facebook_description', true ),
			'facebook_image'      => (string) get_post_meta( $id, 'rank_math_facebook_image', true ),
			'twitter_title'       => (string) get_post_meta( $id, 'rank_math_twitter_title', true ),
			'twitter_description' => (string) get_post_meta( $id, 'rank_math_twitter_description', true ),
			'twitter_image'       => (string) get_post_meta( $id, 'rank_math_twitter_image', true ),
			'twitter_card_type'   => (string) get_post_meta( $id, 'rank_math_twitter_card_type', true ) ?: 'summary_large_image',
			'schema_type'         => $schema_type,
			'gtin'                => (string) get_post_meta( $id, 'rank_math_snippet_product_gtin', true ),
			'mpn'                 => (string) get_post_meta( $id, 'rank_math_snippet_product_mpn', true ),
			'isbn'                => (string) get_post_meta( $id, 'rank_math_snippet_product_isbn', true ),
			'sku_override'        => (string) get_post_meta( $id, 'rank_math_snippet_product_sku', true ),
			'brand'               => (string) get_post_meta( $id, 'rank_math_snippet_product_brand', true ),
		);
	}

	/**
	 * iShop theme product meta for product editor.
	 *
	 * @param int $id Product ID.
	 * @return array<string,mixed>
	 */
	public static function map_product_ishop( $id ) {
		$id = (int) $id;
		$label_keys = array(
			'check_purchase',
			'installment_purchase',
			'credit_purchase',
			'original_product',
			'non_original_product',
			'has_warranty',
		);
		$labels = array();
		foreach ( $label_keys as $key ) {
			$labels[ $key ] = 'yes' === (string) get_post_meta( $id, '_' . $key, true );
		}

		if ( class_exists( 'ishop_theme_util', false ) && method_exists( 'ishop_theme_util', 'get_theme_option' ) ) {
			$global_labels = ishop_theme_util::get_theme_option( 'global_product_labels' );
			if ( is_array( $global_labels ) && isset( $global_labels['label_key'] ) && is_array( $global_labels['label_key'] ) ) {
				foreach ( $global_labels['label_key'] as $label_key ) {
					$key = sanitize_key( (string) $label_key );
					if ( '' === $key || isset( $labels[ $key ] ) ) {
						continue;
					}
					$labels[ $key ] = 'yes' === (string) get_post_meta( $id, '_' . $key, true );
				}
			}
		}

		$custom = get_post_meta( $id, '_custom_labels', true );
		if ( ! is_array( $custom ) ) {
			$custom = array();
		}
		$custom_out = array();
		foreach ( $custom as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$text  = isset( $row['text'] ) ? (string) $row['text'] : '';
			$color = isset( $row['color'] ) ? (string) $row['color'] : '#4052f0';
			if ( '' === $text ) {
				continue;
			}
			$custom_out[] = array(
				'text'  => $text,
				'color' => $color,
			);
		}

		$faqs = get_post_meta( $id, '_product_faqs', true );
		if ( ! is_array( $faqs ) ) {
			$faqs = array();
		}
		$faqs_out = array();
		foreach ( $faqs as $faq ) {
			if ( ! is_array( $faq ) ) {
				continue;
			}
			$q = isset( $faq['question'] ) ? (string) $faq['question'] : ( isset( $faq['q'] ) ? (string) $faq['q'] : '' );
			$a = isset( $faq['answer'] ) ? (string) $faq['answer'] : ( isset( $faq['a'] ) ? (string) $faq['a'] : '' );
			if ( '' === $q && '' === $a ) {
				continue;
			}
			$faqs_out[] = array(
				'question' => $q,
				'answer'   => $a,
			);
		}

		$initial = get_post_meta( $id, '_initial_stock_quantity', true );

		return array(
			'english_name'           => (string) get_post_meta( $id, '_ishop_english_name', true ),
			'shipping_time'          => (string) get_post_meta( $id, '_ishop_shipping_time', true ),
			'video_url'              => (string) get_post_meta( $id, '_ishop_product_video_url', true ),
			'video_cover_url'        => (string) get_post_meta( $id, '_ishop_product_video_cover_url', true ),
			'labels'                 => $labels,
			'custom_labels'          => $custom_out,
			'initial_stock_quantity' => ( '' === $initial || false === $initial ) ? '' : (string) $initial,
			'ai_review_summary'      => (string) get_post_meta( $id, 'ishop_ai_review_summary', true ),
			'faqs'                   => $faqs_out,
		);
	}

	/**
	 * Persist Rank Math SEO fields from dashboard product PATCH.
	 *
	 * @param WC_Product $p Product.
	 * @param array      $seo SEO payload.
	 * @return void
	 */
	public static function apply_product_seo( $p, $seo ) {
		if ( ! is_array( $seo ) || ! is_a( $p, 'WC_Product' ) ) {
			return;
		}
		$string_map = array(
			'title'                => 'rank_math_title',
			'description'          => 'rank_math_description',
			'focus_keyword'        => 'rank_math_focus_keyword',
			'canonical_url'        => 'rank_math_canonical_url',
			'breadcrumb_title'     => 'rank_math_breadcrumb_title',
			'facebook_title'       => 'rank_math_facebook_title',
			'facebook_description' => 'rank_math_facebook_description',
			'facebook_image'       => 'rank_math_facebook_image',
			'twitter_title'        => 'rank_math_twitter_title',
			'twitter_description'  => 'rank_math_twitter_description',
			'twitter_image'        => 'rank_math_twitter_image',
			'twitter_card_type'    => 'rank_math_twitter_card_type',
			'schema_type'          => 'rank_math_rich_snippet',
			'gtin'                 => 'rank_math_snippet_product_gtin',
			'mpn'                  => 'rank_math_snippet_product_mpn',
			'isbn'                 => 'rank_math_snippet_product_isbn',
			'sku_override'         => 'rank_math_snippet_product_sku',
			'brand'                => 'rank_math_snippet_product_brand',
		);
		foreach ( $string_map as $key => $meta_key ) {
			if ( ! array_key_exists( $key, $seo ) ) {
				continue;
			}
			$val = sanitize_text_field( (string) $seo[ $key ] );
			if ( in_array( $key, array( 'description', 'facebook_description', 'twitter_description' ), true ) ) {
				$val = sanitize_textarea_field( (string) $seo[ $key ] );
			}
			if ( in_array( $key, array( 'canonical_url', 'facebook_image', 'twitter_image' ), true ) ) {
				$val = esc_url_raw( (string) $seo[ $key ] );
			}
			$p->update_meta_data( $meta_key, $val );
		}
		if ( array_key_exists( 'pillar_content', $seo ) ) {
			$p->update_meta_data( 'rank_math_pillar_content', ! empty( $seo['pillar_content'] ) ? 'on' : 'off' );
		}
		if ( array_key_exists( 'robots', $seo ) && is_array( $seo['robots'] ) ) {
			$allowed = array( 'index', 'noindex', 'follow', 'nofollow', 'noarchive', 'noimageindex', 'nosnippet' );
			$robots  = array();
			foreach ( $seo['robots'] as $flag ) {
				$flag = sanitize_key( (string) $flag );
				if ( in_array( $flag, $allowed, true ) ) {
					$robots[] = $flag;
				}
			}
			$p->update_meta_data( 'rank_math_robots', array_values( array_unique( $robots ) ) );
		}
		if ( array_key_exists( 'advanced_robots', $seo ) && is_array( $seo['advanced_robots'] ) ) {
			$adv = array();
			foreach ( $seo['advanced_robots'] as $k => $v ) {
				$k = sanitize_key( (string) $k );
				if ( '' === $k ) {
					continue;
				}
				$adv[ $k ] = is_scalar( $v ) ? sanitize_text_field( (string) $v ) : '';
			}
			$p->update_meta_data( 'rank_math_advanced_robots', $adv );
		}
	}

	/**
	 * Persist iShop theme fields from dashboard product PATCH.
	 *
	 * @param WC_Product $p Product.
	 * @param array      $ishop iShop payload.
	 * @return void
	 */
	public static function apply_product_ishop( $p, $ishop ) {
		if ( ! is_array( $ishop ) || ! is_a( $p, 'WC_Product' ) ) {
			return;
		}
		if ( array_key_exists( 'english_name', $ishop ) ) {
			$p->update_meta_data( '_ishop_english_name', sanitize_text_field( (string) $ishop['english_name'] ) );
		}
		if ( array_key_exists( 'shipping_time', $ishop ) ) {
			$p->update_meta_data( '_ishop_shipping_time', sanitize_text_field( (string) $ishop['shipping_time'] ) );
		}
		if ( array_key_exists( 'video_url', $ishop ) ) {
			$p->update_meta_data( '_ishop_product_video_url', esc_url_raw( (string) $ishop['video_url'] ) );
		}
		if ( array_key_exists( 'video_cover_url', $ishop ) ) {
			$p->update_meta_data( '_ishop_product_video_cover_url', esc_url_raw( (string) $ishop['video_cover_url'] ) );
		}
		if ( array_key_exists( 'initial_stock_quantity', $ishop ) ) {
			$raw = $ishop['initial_stock_quantity'];
			if ( null === $raw || '' === $raw ) {
				$p->delete_meta_data( '_initial_stock_quantity' );
			} else {
				$p->update_meta_data( '_initial_stock_quantity', (int) $raw );
			}
		}
		if ( array_key_exists( 'ai_review_summary', $ishop ) ) {
			$p->update_meta_data( 'ishop_ai_review_summary', sanitize_textarea_field( (string) $ishop['ai_review_summary'] ) );
		}
		if ( array_key_exists( 'labels', $ishop ) && is_array( $ishop['labels'] ) ) {
			foreach ( $ishop['labels'] as $key => $on ) {
				$key = sanitize_key( (string) $key );
				if ( '' === $key ) {
					continue;
				}
				$p->update_meta_data( '_' . $key, ! empty( $on ) ? 'yes' : 'no' );
			}
		}
		if ( array_key_exists( 'custom_labels', $ishop ) && is_array( $ishop['custom_labels'] ) ) {
			$out = array();
			foreach ( $ishop['custom_labels'] as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$text  = isset( $row['text'] ) ? sanitize_text_field( (string) $row['text'] ) : '';
				$color = isset( $row['color'] ) ? sanitize_hex_color( (string) $row['color'] ) : '';
				if ( '' === $text ) {
					continue;
				}
				$out[] = array(
					'text'  => $text,
					'color' => $color ? $color : '#4052f0',
				);
			}
			$p->update_meta_data( '_custom_labels', $out );
		}
		if ( array_key_exists( 'faqs', $ishop ) && is_array( $ishop['faqs'] ) ) {
			$out = array();
			foreach ( $ishop['faqs'] as $faq ) {
				if ( ! is_array( $faq ) ) {
					continue;
				}
				$q = isset( $faq['question'] ) ? sanitize_text_field( (string) $faq['question'] ) : '';
				$a = isset( $faq['answer'] ) ? wp_kses_post( (string) $faq['answer'] ) : '';
				if ( '' === $q && '' === $a ) {
					continue;
				}
				$out[] = array(
					'question' => $q,
					'answer'   => $a,
				);
			}
			$p->update_meta_data( '_product_faqs', $out );
		}
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shop_product_wfcp_patch( $request ) {
		$id = (int) $request['id'];
		$p  = wc_get_product( $id );
		if ( ! $p ) {
			return new WP_Error( 'not_found', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$wfcp = (array) $request->get_param( 'wfcp' );
		if ( isset( $wfcp['purchase_price'] ) ) {
			$pp = class_exists( 'WFCP_Helper' ) ? WFCP_Helper::sanitize_price( $wfcp['purchase_price'] ) : (float) $wfcp['purchase_price'];
			$p->update_meta_data( '_wfcp_purchase_price', $pp );
			$p->save();
			if ( class_exists( 'WFCP_Helper', false ) ) {
				WFCP_Helper::sync_retail_price_from_purchase( $id, $pp );
				$p = wc_get_product( $id );
			}
		}
		if ( isset( $wfcp['lock_price'] ) ) {
			$p->update_meta_data( '_wfcp_lock_price', ! empty( $wfcp['lock_price'] ) ? '1' : '0' );
		}
		if ( array_key_exists( 'reference_url', $wfcp ) ) {
			$url = esc_url_raw( (string) $wfcp['reference_url'] );
			if ( '' === $url ) {
				$p->delete_meta_data( '_wfcp_reference_url' );
			} else {
				$p->update_meta_data( '_wfcp_reference_url', $url );
			}
		}
		if ( array_key_exists( 'wholesale_rule', $wfcp ) ) {
			$rule = $wfcp['wholesale_rule'];
			if ( class_exists( 'WFCP_Wholesale_Rules', false ) ) {
				WFCP_Wholesale_Rules::apply_to_wc_product( $p, $rule );
			} elseif ( is_array( $rule ) && isset( $rule['discount_percent'] ) ) {
				$p->update_meta_data(
					'_wfcp_wholesale_custom_rule',
					array( 'discount_percent' => (float) $rule['discount_percent'] )
				);
			} else {
				$p->delete_meta_data( '_wfcp_wholesale_custom_rule' );
			}
		}
		if ( isset( $wfcp['platforms'] ) && is_array( $wfcp['platforms'] ) ) {
			$allowed = array( 'digikala', 'basalam', 'technolife', 'snappshop', 'tapsishop', 'zarehbin', 'emalls', 'snapppay-search', 'torob' );
			foreach ( $wfcp['platforms'] as $slug => $row ) {
				$slug = sanitize_key( (string) $slug );
				if ( ! in_array( $slug, $allowed, true ) || ! is_array( $row ) ) {
					continue;
				}
				if ( array_key_exists( 'lock', $row ) ) {
					$p->update_meta_data( '_wfcp_' . $slug . '_lock', ! empty( $row['lock'] ) ? '1' : '0' );
				}
				if ( array_key_exists( 'manual_price', $row ) ) {
					$manual = $row['manual_price'];
					if ( '' === $manual || null === $manual ) {
						$p->delete_meta_data( '_wfcp_' . $slug . '_price' );
					} else {
						$val = class_exists( 'WFCP_Helper' ) ? WFCP_Helper::sanitize_price( $manual ) : (float) $manual;
						$p->update_meta_data( '_wfcp_' . $slug . '_price', $val );
					}
				}
			}
		}
		if ( isset( $wfcp['regular_price'] ) ) {
			$price = wc_format_decimal( $wfcp['regular_price'] );
			$p->set_regular_price( $price );
			$p->set_price( $price );
		}

		$p->save();

		return new WP_REST_Response( self::map_product_row( wc_get_product( $id ) ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function accounting_summary() {
		global $wpdb;
		$t = Webino_Dashboard_Rest_Base::accounting_table( 'fiscal_years' );
		$c = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$t}" );
		return new WP_REST_Response( array( 'fiscal_years' => $c ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function accounting_list( $request ) {
		global $wpdb;

		$map = array(
			'fiscal-years'         => 'fiscal_years',
			'journals'             => 'journal_entries',
			'persons'              => 'persons',
			'products'             => 'products',
			'invoices'             => 'invoices',
			'cash-accounts'        => 'cash_accounts',
			'receipts'             => 'receipt_vouchers',
			'checks'               => 'checks',
			'chart'                => 'chart_accounts',
			'warehouses'           => 'warehouses',
			'warehouse-stock'      => 'warehouse_stock',
			'person-categories'    => 'person_categories',
			'product-categories'   => 'product_categories',
			'units'                => 'units',
			'price-lists'          => 'price_lists',
			'price-list-items'     => 'price_list_items',
			'user-defaults'        => 'user_defaults',
		);

		$res = sanitize_key( (string) $request['resource'] );
		if ( ! isset( $map[ $res ] ) ) {
			return new WP_Error( 'invalid_resource', $res, array( 'status' => 404 ) );
		}

		$table = Webino_Dashboard_Rest_Base::accounting_table( $map[ $res ] );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is whitelisted.
		$rows = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT 200", ARRAY_A );

		return new WP_REST_Response( array( 'data' => $rows ? $rows : array() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function content_posts( $request ) {
		$page     = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$q        = new WP_Query(
			array(
				'post_type'      => 'post',
				'post_status'    => array( 'publish', 'draft', 'pending' ),
				'paged'          => $page,
				'posts_per_page' => $per_page,
				's'              => sanitize_text_field( (string) $request->get_param( 'search' ) ),
			)
		);
		$items = array();
		while ( $q->have_posts() ) {
			$q->the_post();
			$pid = (int) get_the_ID();
			$score_raw = get_post_meta( $pid, 'rank_math_seo_score', true );
			$items[]   = array(
				'id'            => $pid,
				'title'         => get_the_title(),
				'status'        => get_post_status(),
				'date'          => gmdate( 'c', strtotime( get_post()->post_date_gmt ? get_post()->post_date_gmt : get_post()->post_date ) ),
				'excerpt'       => wp_strip_all_tags( get_the_excerpt() ),
				'seo_score'     => ( '' !== $score_raw && false !== $score_raw ) ? (int) $score_raw : null,
				'focus_keyword' => (string) get_post_meta( $pid, 'rank_math_focus_keyword', true ),
			);
		}
		wp_reset_postdata();
		$counts = wp_count_posts( 'post' );
		$stats  = array(
			'total'   => (int) ( $counts->publish ?? 0 ) + (int) ( $counts->draft ?? 0 ) + (int) ( $counts->pending ?? 0 ),
			'publish' => (int) ( $counts->publish ?? 0 ),
			'draft'   => (int) ( $counts->draft ?? 0 ),
			'pending' => (int) ( $counts->pending ?? 0 ),
		);
		return new WP_REST_Response(
			array(
				'items' => $items,
				'page'  => $page,
				'found' => (int) $q->found_posts,
				'stats' => $stats,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function content_pages( $request ) {
		$page     = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$search   = sanitize_text_field( (string) $request->get_param( 'search' ) );

		$args = array(
			'post_type'      => 'page',
			'post_status'    => array( 'publish', 'draft', 'pending' ),
			'paged'          => $page,
			'posts_per_page' => $per_page,
		);
		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		$q     = new WP_Query( $args );
		$items = array();
		while ( $q->have_posts() ) {
			$q->the_post();
			$items[] = Webino_Dashboard_REST_Crud::serialize_page_list_item( get_post() );
		}
		wp_reset_postdata();
		$counts = wp_count_posts( 'page' );
		$stats  = array(
			'total'   => (int) ( $counts->publish ?? 0 ) + (int) ( $counts->draft ?? 0 ) + (int) ( $counts->pending ?? 0 ),
			'publish' => (int) ( $counts->publish ?? 0 ),
			'draft'   => (int) ( $counts->draft ?? 0 ),
			'pending' => (int) ( $counts->pending ?? 0 ),
		);
		return new WP_REST_Response(
			array(
				'items' => $items,
				'page'  => $page,
				'found' => (int) $q->found_posts,
				'stats' => $stats,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function content_media( $request ) {
		$page     = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 40 ) );
		$folder   = (int) $request->get_param( 'folder' );
		$category = (int) $request->get_param( 'category' );
		$search   = sanitize_text_field( (string) $request->get_param( 'search' ) );

		$args = array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'paged'          => $page,
			'posts_per_page' => $per_page,
		);
		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		$tax_query = array();
		if ( $folder > 0 && taxonomy_exists( 'webino_media_folder' ) ) {
			$tax_query[] = array(
				'taxonomy'         => 'webino_media_folder',
				'field'            => 'term_id',
				'terms'            => $folder,
				'include_children' => true,
			);
		}
		if ( $category > 0 && taxonomy_exists( 'webino_media_category' ) ) {
			$tax_query[] = array(
				'taxonomy'         => 'webino_media_category',
				'field'            => 'term_id',
				'terms'            => $category,
				'include_children' => true,
			);
		}
		if ( array() !== $tax_query ) {
			$args['tax_query'] = array_merge( array( 'relation' => 'AND' ), $tax_query );
		}

		$q     = new WP_Query( $args );
		$items = array();
		while ( $q->have_posts() ) {
			$q->the_post();
			$items[] = Webino_Dashboard_REST_Crud::serialize_media_attachment( get_the_ID() );
		}
		wp_reset_postdata();
		return new WP_REST_Response(
			array(
				'items' => $items,
				'page'  => $page,
				'total' => (int) $q->found_posts,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shop_orders( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$portal_uid = 0;
		if ( Webino_Dashboard_Rest_Base::is_portal_only() ) {
			$portal_uid = get_current_user_id();
			$request->set_param( 'customer', (string) $portal_uid );
			$request->set_param( 'customer_role', '' );
		}
		if ( Webino_Dashboard_Rest_Base::is_seller_only() ) {
			$request->set_param( 'created_by', (string) get_current_user_id() );
		}
		$args            = Webino_Dashboard_Orders::query_args_from_request( $request );
		$shipping_filter = '';
		if ( isset( $args['_webino_shipping_method'] ) ) {
			$shipping_filter = (string) $args['_webino_shipping_method'];
			unset( $args['_webino_shipping_method'] );
		}
		$page   = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$result = wc_get_orders( $args );
		$items  = array();
		$found  = 0;
		$orders = array();
		if ( is_object( $result ) && isset( $result->orders ) ) {
			$orders = is_array( $result->orders ) ? $result->orders : array();
			$found  = (int) $result->total;
		} elseif ( is_array( $result ) ) {
			$orders = $result;
			$count_args             = $args;
			$count_args['limit']    = 1;
			$count_args['paginate'] = true;
			$count_result           = wc_get_orders( $count_args );
			$found                  = ( is_object( $count_result ) && isset( $count_result->total ) )
				? (int) $count_result->total
				: count( $orders );
		}
		if ( '' !== $shipping_filter ) {
			$orders = Webino_Dashboard_Orders::filter_orders_by_shipping_method( $orders, $shipping_filter );
			$found  = count( $orders );
		}
		foreach ( $orders as $o ) {
			$items[] = Webino_Dashboard_Orders::map_list_item( $o );
		}
		return new WP_REST_Response(
			array(
				'items'         => $items,
				'page'          => $page,
				'found'         => $found,
				'status_counts' => $portal_uid > 0
					? Webino_Dashboard_Orders::get_portal_status_counts( $portal_uid )
					: Webino_Dashboard_Orders::get_status_counts( 0 ),
				'stats'         => Webino_Dashboard_Orders::get_list_stats( $request ),
			)
		);
	}

	/**
	 * Create a manual / POS WooCommerce order.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shop_orders_create( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $request->get_params();
		}
		if ( ! is_array( $data ) ) {
			$data = array();
		}
		$result = Webino_Dashboard_Order_Writer::create( $data );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( $result, 201 );
	}

	/**
	 * POS product search (name / SKU / barcode).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function shop_products_pos_search( $request ) {
		$q     = (string) $request->get_param( 'q' );
		$limit = (int) ( $request->get_param( 'limit' ) ?: 30 );
		return new WP_REST_Response(
			array(
				'items' => Webino_Dashboard_Order_Writer::pos_search( $q, $limit ),
			)
		);
	}

	/**
	 * Quick customer lookup for POS.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function shop_pos_customers( $request ) {
		$q = trim( (string) $request->get_param( 'q' ) );
		if ( strlen( $q ) < 2 ) {
			return new WP_REST_Response( array( 'items' => array() ) );
		}
		$phone = preg_replace( '/\D+/', '', $q );
		$args  = array(
			'number'  => 20,
			'orderby' => 'registered',
			'order'   => 'DESC',
			'fields'  => array( 'ID', 'user_email', 'display_name' ),
		);
		if ( $phone && strlen( $phone ) >= 4 ) {
			$args['meta_query'] = array(
				'relation' => 'OR',
				array( 'key' => 'billing_phone', 'value' => $phone, 'compare' => 'LIKE' ),
				array( 'key' => 'phone', 'value' => $phone, 'compare' => 'LIKE' ),
			);
		} else {
			$args['search']         = '*' . esc_attr( $q ) . '*';
			$args['search_columns'] = array( 'user_login', 'user_email', 'display_name' );
		}
		$users = get_users( $args );
		$items = array();
		foreach ( $users as $u ) {
			$items[] = array(
				'id'         => (int) $u->ID,
				'name'       => (string) $u->display_name,
				'email'      => (string) $u->user_email,
				'phone'      => (string) ( get_user_meta( $u->ID, 'billing_phone', true ) ?: get_user_meta( $u->ID, 'phone', true ) ),
				'first_name' => (string) get_user_meta( $u->ID, 'first_name', true ),
				'last_name'  => (string) get_user_meta( $u->ID, 'last_name', true ),
			);
		}
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shop_orders_filter_options() {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( Webino_Dashboard_Orders::get_filter_options() );
	}

	/**
	 * Province list for coupon location restrictions (state_city parents preferred).
	 *
	 * @return WP_REST_Response
	 */
	public static function shop_locations_states() {
		$items = array();
		if ( taxonomy_exists( 'state_city' ) ) {
			$terms = get_terms(
				array(
					'taxonomy'   => 'state_city',
					'hide_empty' => false,
					'parent'     => 0,
				)
			);
			if ( is_array( $terms ) ) {
				foreach ( $terms as $term ) {
					if ( ! ( $term instanceof WP_Term ) ) {
						continue;
					}
					$code = (string) get_term_meta( $term->term_id, 'state_code', true );
					$items[] = array(
						'id'    => (string) $term->term_id,
						'code'  => '' !== $code ? $code : (string) $term->term_id,
						'label' => (string) $term->name,
					);
				}
			}
		}
		if ( array() === $items && function_exists( 'WC' ) && WC()->countries ) {
			$country = 'IR';
			if ( function_exists( 'wc_get_base_location' ) ) {
				$base = wc_get_base_location();
				if ( ! empty( $base['country'] ) ) {
					$country = (string) $base['country'];
				}
			}
			$wc_states = WC()->countries->get_states( $country );
			if ( is_array( $wc_states ) ) {
				foreach ( $wc_states as $code => $label ) {
					$items[] = array(
						'id'    => (string) $code,
						'code'  => (string) $code,
						'label' => (string) $label,
					);
				}
			}
		}

		$purchase_types = array(
			array( 'id' => 'cash', 'label' => __( 'نقدی', 'webino-dashboard' ) ),
		);
		if ( class_exists( 'Webino_Dashboard_Bots_WFCP', false ) ) {
			$purchase_types = Webino_Dashboard_Bots_WFCP::enabled_types();
		}

		$opts = Webino_Dashboard_Orders::wc_active() ? Webino_Dashboard_Orders::get_filter_options() : array(
			'payments' => array(),
			'shipping' => array(),
		);

		return new WP_REST_Response(
			array(
				'items'          => $items,
				'payments'       => $opts['payments'] ?? array(),
				'shipping'       => $opts['shipping'] ?? array(),
				'purchase_types' => $purchase_types,
			)
		);
	}

	/**
	 * Cities under a province (state_city children).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shop_locations_cities( $request ) {
		$state = sanitize_text_field( (string) $request->get_param( 'state' ) );
		if ( '' === $state ) {
			return new WP_Error( 'invalid', __( 'State is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( ! taxonomy_exists( 'state_city' ) ) {
			return new WP_REST_Response( array( 'items' => array() ) );
		}

		$parent_id = 0;
		if ( ctype_digit( $state ) ) {
			$parent_id = (int) $state;
		} else {
			$found = get_terms(
				array(
					'taxonomy'   => 'state_city',
					'hide_empty' => false,
					'parent'     => 0,
					'meta_query' => array(
						array(
							'key'   => 'state_code',
							'value' => $state,
						),
					),
					'number'     => 1,
				)
			);
			if ( is_array( $found ) && ! empty( $found[0] ) && $found[0] instanceof WP_Term ) {
				$parent_id = (int) $found[0]->term_id;
			} else {
				$by_name = get_terms(
					array(
						'taxonomy'   => 'state_city',
						'hide_empty' => false,
						'parent'     => 0,
						'name'       => $state,
						'number'     => 1,
					)
				);
				if ( is_array( $by_name ) && ! empty( $by_name[0] ) && $by_name[0] instanceof WP_Term ) {
					$parent_id = (int) $by_name[0]->term_id;
				}
			}
		}

		if ( $parent_id < 1 ) {
			return new WP_REST_Response( array( 'items' => array() ) );
		}

		$children = get_terms(
			array(
				'taxonomy'   => 'state_city',
				'hide_empty' => false,
				'parent'     => $parent_id,
			)
		);
		$items = array();
		if ( is_array( $children ) ) {
			foreach ( $children as $term ) {
				if ( ! ( $term instanceof WP_Term ) ) {
					continue;
				}
				$items[] = array(
					'id'    => (string) $term->term_id,
					'label' => (string) $term->name,
				);
			}
		}
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shop_order_statuses() {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$statuses = wc_get_order_statuses();
		$items    = array();
		foreach ( $statuses as $key => $label ) {
			$items[] = array(
				'slug'  => str_replace( 'wc-', '', $key ),
				'label' => $label,
			);
		}
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	/**
	 * Serialize coupon for REST list/detail.
	 *
	 * @param WC_Coupon $c Coupon.
	 * @return array<string,mixed>
	 */
	public static function map_coupon_rest( $c ) {
		if ( ! is_a( $c, 'WC_Coupon' ) ) {
			return array();
		}
		return Webino_Dashboard_Coupons::map_detail( $c );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function marketing_coupons( $request ) {
		return Webino_Dashboard_Coupons::query_list( $request );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shop_attributes() {
		if ( ! function_exists( 'wc_get_attribute_taxonomies' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$attrs = wc_get_attribute_taxonomies();
		$out   = array();
		foreach ( $attrs as $a ) {
			$out[] = Webino_Dashboard_Rest_Crud::map_global_attribute_item( $a );
		}
		return new WP_REST_Response( array( 'items' => $out ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function users_list( $request ) {
		$search   = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$role     = sanitize_key( (string) $request->get_param( 'role' ) );
		if ( 'all' === $role ) {
			$role = '';
		}
		$role_in = array();
		$raw_in  = $request->get_param( 'role_in' );
		if ( is_string( $raw_in ) && '' !== trim( $raw_in ) ) {
			foreach ( explode( ',', $raw_in ) as $r ) {
				$r = sanitize_key( trim( $r ) );
				if ( '' !== $r && 'all' !== $r ) {
					$role_in[] = $r;
				}
			}
			$role_in = array_values( array_unique( $role_in ) );
		}

		$meta_ids = array();
		if ( '' !== $search ) {
			$meta_ids = Webino_Dashboard_Users::search_ids_by_phone_or_national_id( $search, 100 );
		}

		if ( $meta_ids && '' !== $search ) {
			$std_args = array(
				'search'         => '*' . $search . '*',
				'search_columns' => array( 'user_login', 'user_email', 'display_name' ),
				'number'         => 100,
				'fields'         => 'ID',
			);
			if ( $role_in ) {
				$std_args['role__in'] = $role_in;
			} elseif ( $role ) {
				$std_args['role'] = $role;
			}
			$std_q = new WP_User_Query( $std_args );
			$std_ids = array_map( 'intval', (array) $std_q->get_results() );
			$all_ids = array_values( array_unique( array_merge( $std_ids, $meta_ids ) ) );
			if ( $role_in || $role ) {
				$filtered = array();
				foreach ( $all_ids as $uid ) {
					$u = get_userdata( (int) $uid );
					if ( ! $u ) {
						continue;
					}
					$user_roles = (array) $u->roles;
					if ( $role_in ) {
						if ( array_intersect( $role_in, $user_roles ) ) {
							$filtered[] = (int) $uid;
						}
					} elseif ( in_array( $role, $user_roles, true ) ) {
						$filtered[] = (int) $uid;
					}
				}
				$all_ids = $filtered;
			}
			$total   = count( $all_ids );
			$slice   = array_slice( $all_ids, ( $page - 1 ) * $per_page, $per_page );
			$items   = array();
			if ( $slice ) {
				$users = get_users(
					array(
						'include' => $slice,
						'orderby' => 'include',
					)
				);
				$by_id = array();
				foreach ( $users as $u ) {
					if ( $u instanceof WP_User ) {
						$by_id[ (int) $u->ID ] = Webino_Dashboard_Users::map_list_item( $u );
					}
				}
				foreach ( $slice as $uid ) {
					if ( isset( $by_id[ $uid ] ) ) {
						$items[] = $by_id[ $uid ];
					}
				}
			}
			return new WP_REST_Response(
				array(
					'items'    => $items,
					'page'     => $page,
					'per_page' => $per_page,
					'found'    => $total,
					'stats'    => self::users_list_stats(),
				)
			);
		}

		$args = array(
			'number'  => $per_page,
			'offset'  => ( $page - 1 ) * $per_page,
			'orderby' => 'registered',
			'order'   => 'DESC',
		);
		if ( $role_in ) {
			$args['role__in'] = $role_in;
		} elseif ( $role ) {
			$args['role'] = $role;
		}
		if ( $search ) {
			$args['search']         = '*' . $search . '*';
			$args['search_columns'] = array( 'user_login', 'user_email', 'display_name' );
		}
		$query = new WP_User_Query( $args );
		$items = array();
		foreach ( $query->get_results() as $u ) {
			if ( $u instanceof WP_User ) {
				$items[] = Webino_Dashboard_Users::map_list_item( $u );
			}
		}
		return new WP_REST_Response(
			array(
				'items'    => $items,
				'page'     => $page,
				'per_page' => $per_page,
				'found'    => (int) $query->get_total(),
				'stats'    => self::users_list_stats(),
			)
		);
	}

	/**
	 * Site-wide user KPI counts for the users list.
	 *
	 * @return array{total:int,customers:int,partners:int}
	 */
	private static function users_list_stats() {
		$counts    = count_users();
		$total     = (int) ( $counts['total_users'] ?? 0 );
		$by        = is_array( $counts['avail_roles'] ?? null ) ? $counts['avail_roles'] : array();
		$customers = (int) ( $by['customer'] ?? 0 );
		$partners  = (int) ( $by['webino_partner'] ?? 0 );
		return array(
			'total'     => $total,
			'customers' => $customers,
			'partners'  => $partners,
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function users_create( $request ) {
		$login = sanitize_user( (string) $request->get_param( 'user_login' ), true );
		$email = sanitize_email( (string) $request->get_param( 'user_email' ) );
		$pass  = (string) $request->get_param( 'user_pass' );
		$role_check = Webino_Dashboard_Rest_Base::sanitize_assignable_role( (string) $request->get_param( 'role' ) );
		if ( is_wp_error( $role_check ) ) {
			return $role_check;
		}
		$role = $role_check;
		if ( '' === $login || ! is_email( $email ) || strlen( $pass ) < 8 ) {
			return new WP_Error( 'invalid', __( 'Invalid user data.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$uid = wp_insert_user(
			array(
				'user_login' => $login,
				'user_email' => $email,
				'user_pass'  => $pass,
				'role'       => $role,
			)
		);
		if ( is_wp_error( $uid ) ) {
			return $uid;
		}
		return new WP_REST_Response( array( 'id' => (int) $uid ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function comments_list( $request ) {
		$status   = sanitize_key( (string) $request->get_param( 'status' ) ) ?: 'hold';
		$page     = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$search   = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$post_id  = (int) $request->get_param( 'post_id' );
		$user_id  = (int) $request->get_param( 'user_id' );

		$allowed = array( 'all', 'hold', 'approve', 'spam', 'trash' );
		if ( ! in_array( $status, $allowed, true ) ) {
			$status = 'hold';
		}

		$base_args = Webino_Dashboard_Rest_Crud::comment_query_args_for_status( $status );
		if ( '' !== $search ) {
			$base_args['search'] = $search;
		}
		if ( $post_id > 0 ) {
			$base_args['post_id'] = $post_id;
		}
		if ( $user_id > 0 ) {
			$base_args['user_id'] = $user_id;
		}

		$found = (int) get_comments( array_merge( $base_args, array( 'count' => true ) ) );
		$list  = get_comments(
			array_merge(
				$base_args,
				array(
					'number' => $per_page,
					'offset' => ( $page - 1 ) * $per_page,
				)
			)
		);

		$items = array();
		foreach ( $list as $c ) {
			$row = Webino_Dashboard_Rest_Crud::serialize_comment( $c );
			if ( $row ) {
				$items[] = $row;
			}
		}

		return new WP_REST_Response(
			array(
				'items'    => $items,
				'page'     => $page,
				'per_page' => $per_page,
				'found'    => $found,
				'counts'   => Webino_Dashboard_Rest_Crud::comment_counts(),
			)
		);
	}
}
