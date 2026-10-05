<?php
/**
 * Basalam dashboard REST — full Basalam-parity surface over WebinoBasalam engine.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_Dashboard_REST_Basalam {
	const NS = 'webino-dashboard/v1';

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_action( 'wp_ajax_webino_dashboard_basalam_oauth_start', array( __CLASS__, 'ajax_oauth_start' ) );
		add_action( 'wp_ajax_webino_dashboard_basalam_oauth_complete', array( __CLASS__, 'ajax_oauth_complete' ) );
	}

	public static function can_manage() {
		return class_exists( 'Webino_Dashboard_Rest_Base', false )
			? Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' )
			: current_user_can( 'manage_woocommerce' );
	}

	public static function register_routes() {
		$routes = array(
			'/basalam/settings'           => array( 'GET' => 'settings_get', 'POST' => 'settings_post' ),
			'/basalam/status'             => array( 'GET' => 'status_get' ),
			'/basalam/coverage/endpoints' => array( 'GET' => 'coverage_get' ),
			'/basalam/oauth/start'        => array( 'POST' => 'oauth_start' ),
			'/basalam/oauth/complete'     => array( 'POST' => 'oauth_complete' ),
			'/basalam/oauth/manual'       => array( 'POST' => 'oauth_manual' ),
			'/basalam/oauth/refresh'      => array( 'POST' => 'oauth_refresh' ),
			'/basalam/oauth/disconnect'   => array( 'POST' => 'oauth_disconnect' ),
			'/basalam/vendor'             => array( 'GET' => 'vendor_get', 'POST' => 'vendor_post' ),
			'/basalam/shipping'           => array( 'GET' => 'shipping_get', 'POST' => 'shipping_post' ),
			'/basalam/webhooks'           => array( 'GET' => 'webhooks_list' ),
			'/basalam/webhooks/rotate'    => array( 'POST' => 'webhooks_rotate' ),
			'/basalam/webhooks/delete'    => array( 'POST' => 'webhooks_delete' ),
			'/basalam/discounts'          => array( 'GET' => 'discounts_get', 'POST' => 'discounts_post' ),
			'/basalam/chat/token'         => array( 'GET' => 'chat_token_get' ),
			'/basalam/chat/notify'        => array( 'POST' => 'chat_notify' ),
			'/basalam/jobs'               => array( 'GET' => 'jobs_get' ),
			'/basalam/jobs/cancel'        => array( 'POST' => 'jobs_cancel' ),
			'/basalam/logs'               => array( 'GET' => 'logs_get' ),
			'/basalam/products'           => array( 'GET' => 'products_list' ),
			'/basalam/orders'             => array( 'GET' => 'orders_list' ),
			'/basalam/gateway/settings'   => array( 'GET' => 'gateway_settings_get', 'POST' => 'gateway_settings_post' ),
			'/basalam/sync/products/create-all'  => array( 'POST' => 'products_create_all' ),
			'/basalam/sync/products/update-all'  => array( 'POST' => 'products_update_all' ),
			'/basalam/sync/products/connect-all' => array( 'POST' => 'products_connect_all' ),
			'/basalam/sync/products/sync-now'    => array( 'POST' => 'products_sync_now' ),
			'/basalam/commission'                => array( 'GET' => 'commission_get', 'POST' => 'commission_import' ),
			'/basalam/sync/products/create'      => array( 'POST' => 'product_create' ),
			'/basalam/sync/products/update'      => array( 'POST' => 'product_update' ),
			'/basalam/sync/products/archive'     => array( 'POST' => 'product_archive' ),
			'/basalam/sync/products/restore'     => array( 'POST' => 'product_restore' ),
			'/basalam/sync/products/disconnect'  => array( 'POST' => 'product_disconnect' ),
			'/basalam/sync/products/connect'     => array( 'POST' => 'product_connect' ),
			'/basalam/sync/orders/pull'          => array( 'POST' => 'orders_pull' ),
			'/basalam/orders/confirm'            => array( 'POST' => 'order_confirm' ),
			'/basalam/orders/cancel'             => array( 'POST' => 'order_cancel' ),
			'/basalam/orders/cancel-request'     => array( 'POST' => 'order_cancel_request' ),
			'/basalam/orders/delay'              => array( 'POST' => 'order_delay' ),
			'/basalam/orders/tracking'           => array( 'POST' => 'order_tracking' ),
			'/basalam/categories'                => array( 'GET' => 'categories_get' ),
			'/basalam/categories/detect'         => array( 'POST' => 'categories_detect' ),
			'/basalam/categories/attributes'     => array( 'GET' => 'categories_attributes' ),
			'/basalam/categories/option-maps'    => array( 'GET' => 'option_maps_get', 'POST' => 'option_maps_post' ),
			'/basalam/categories/option-maps/delete' => array( 'POST' => 'option_maps_delete' ),
			'/basalam/categories/mappings'       => array( 'GET' => 'mappings_get', 'POST' => 'mappings_post' ),
			'/basalam/categories/mappings/delete'=> array( 'POST' => 'mappings_delete' ),
			'/basalam/finance/balance'           => array( 'GET' => 'finance_balance' ),
			'/basalam/finance/banks'             => array( 'GET' => 'finance_banks' ),
			'/basalam/finance/settlement'        => array( 'POST' => 'finance_settlement' ),
			'/basalam/tickets'                   => array( 'GET' => 'tickets_get' ),
			'/basalam/reconcile'                 => array( 'POST' => 'reconcile_post' ),
			'/basalam/webhook/setup'             => array( 'POST' => 'webhook_setup' ),
		);

		foreach ( $routes as $path => $methods ) {
			$args = array();
			foreach ( $methods as $method => $callback ) {
				$args[] = array(
					'methods'             => $method,
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => array( __CLASS__, $callback ),
				);
			}
			register_rest_route( self::NS, $path, $args );
		}
	}

	private static function engine_ready() {
		return function_exists( 'webinoBasalamSettings' ) && function_exists( 'webinoBasalamContainer' );
	}

	public static function settings_get() {
		if ( ! self::engine_ready() ) {
			return new WP_Error( 'basalam_engine', 'Engine not loaded', array( 'status' => 503 ) );
		}
		$all = webinoBasalamSettings()->getSettings();
		if ( ! is_array( $all ) ) {
			$all = array();
		}
		foreach ( array( 'token', 'refresh_token', 'hamsalam_token' ) as $secret ) {
			if ( ! empty( $all[ $secret ] ) ) {
				$all[ $secret ] = '***';
			}
		}
		return new WP_REST_Response(
			array(
				'settings'  => $all,
				'connected' => webinoBasalamSettings()->isConnected(),
				'vendor_id' => webinoBasalamSettings()->getSettings( 'vendor_id' ),
			)
		);
	}

	public static function settings_post( WP_REST_Request $request ) {
		if ( ! self::engine_ready() ) {
			return new WP_Error( 'basalam_engine', 'Engine not loaded', array( 'status' => 503 ) );
		}
		$data = $request->get_json_params();
		if ( ! is_array( $data ) || array() === $data ) {
			$raw = $request->get_body();
			if ( is_string( $raw ) && '' !== trim( $raw ) ) {
				$decoded = json_decode( $raw, true );
				if ( is_array( $decoded ) ) {
					$data = $decoded;
				}
			}
		}
		if ( ! is_array( $data ) ) {
			$data = array();
		}
		// Strip masked secrets.
		foreach ( array( 'token', 'refresh_token', 'hamsalam_token' ) as $secret ) {
			if ( isset( $data[ $secret ] ) && '***' === $data[ $secret ] ) {
				unset( $data[ $secret ] );
			}
		}
		// Engine checks some flags with === 'yes'; coerce dashboard booleans.
		$yes_no_keys = array(
			'add_attr_to_desc_product',
			'add_short_desc_to_desc_product',
			'add_full_desc_to_desc_product',
			'cap_preparation_to_category_max',
			'product_attribute_suffix_enabled',
		);
		foreach ( $yes_no_keys as $key ) {
			if ( ! array_key_exists( $key, $data ) ) {
				continue;
			}
			$val = $data[ $key ];
			if ( true === $val || 1 === $val || '1' === $val || 'yes' === $val || 'true' === $val ) {
				$data[ $key ] = 'yes';
			} elseif ( false === $val || 0 === $val || '0' === $val || 'no' === $val || 'false' === $val ) {
				$data[ $key ] = 'no';
			}
		}
		\WebinoBasalam\Admin\Settings\SettingsManager::updateSettings( $data );
		if ( function_exists( 'webinoBasalamSettings' ) ) {
			webinoBasalamSettings()->forget();
		}
		return self::settings_get();
	}

	public static function status_get() {
		if ( ! self::engine_ready() ) {
			return new WP_REST_Response( array( 'engine' => false ) );
		}
		self::maybe_import_legacy_woosalam_token();

		// Self-heal booth id when token exists but vendor_id was never saved (broken OAuth handoff).
		if (
			webinoBasalamSettings()->hasToken()
			&& absint( webinoBasalamSettings()->getSettings( 'vendor_id' ) ) < 1
		) {
			\WebinoBasalam\Services\VendorGate::tryEnsureVendorId();
		}

		$jm = webinoBasalamContainer()->get( \WebinoBasalam\JobManager::class );
		$pending = 0;
		if ( method_exists( $jm, 'countByStatus' ) ) {
			$pending = $jm->countByStatus( 'pending' );
		} else {
			global $wpdb;
			$table = $wpdb->prefix . 'webino_basalam_job_manager';
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$pending = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE status='pending'" );
		}
		return new WP_REST_Response(
			array(
				'engine'     => true,
				'connected'  => webinoBasalamSettings()->isConnected(),
				'is_vendor'  => (bool) webinoBasalamSettings()->getSettings( 'is_vendor' ),
				'vendor_id'  => webinoBasalamSettings()->getSettings( 'vendor_id' ),
				'jobs_pending' => $pending,
				'webhook_url'=> get_site_url() . '/wp-json/webino-basalam/v1/order-manager',
				'webhook_id' => webinoBasalamSettings()->getSettings( 'webhook_id' ),
				'owns_runtime' => true,
				'version'    => \WebinoBasalam\Plugin::VERSION,
				'checked_at' => gmdate( 'c' ),
			)
		);
	}

	public static function coverage_get() {
		return new WP_REST_Response(
			array(
				'source'    => 'basalam-engine-1.10.8',
				'endpoints' => array(
					array( 'host' => 'openapi.basalam.com', 'domain' => 'products/categories/webhooks', 'status' => 'implemented' ),
					array( 'host' => 'core.basalam.com', 'domain' => 'variations/commission', 'status' => 'implemented' ),
					array( 'host' => 'order-processing.basalam.com', 'domain' => 'orders', 'status' => 'implemented' ),
					array( 'host' => 'uploadio.basalam.com', 'domain' => 'media', 'status' => 'implemented' ),
					array( 'host' => 'categorydetection.basalam.com', 'domain' => 'category', 'status' => 'implemented' ),
					array( 'host' => 'auth.basalam.com', 'domain' => 'oauth', 'status' => 'implemented' ),
					array( 'host' => 'webina.dev', 'domain' => 'oauth-proxy', 'status' => 'implemented' ),
					array( 'host' => 'accounting.basalam.com', 'domain' => 'finance', 'status' => 'implemented' ),
					array( 'host' => 'identity.basalam.com', 'domain' => 'bank-accounts', 'status' => 'implemented' ),
				),
			)
		);
	}

	/**
	 * @param WP_REST_Request|null $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function oauth_start( $request = null ) {
		if ( ! self::engine_ready() ) {
			return new WP_Error( 'basalam_engine', 'Engine not loaded', array( 'status' => 503 ) );
		}
		self::maybe_import_legacy_woosalam_token();

		$return = Webino_Dashboard_Rewrite::url( 'settings/shop/basalam' );
		$params = array();
		if ( $request instanceof WP_REST_Request ) {
			$params = $request->get_json_params();
			if ( ! is_array( $params ) ) {
				$params = $request->get_params();
			}
		} elseif ( isset( $_POST['return_url'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- ajax_oauth_start verifies nonce.
			$params['return_url'] = wp_unslash( (string) $_POST['return_url'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
		}
		if ( is_array( $params ) && ! empty( $params['return_url'] ) ) {
			$candidate = esc_url_raw( (string) $params['return_url'] );
			$candidate = remove_query_arg(
				array( 'oauth', 'access_token', 'refresh_token', 'vendor_id', 'webino_sig', 'webino_ts', 'webino_hk', 'reason', 'expires_in', 'is_vendor' ),
				$candidate
			);
			$home_host = (string) wp_parse_url( home_url( '/' ), PHP_URL_HOST );
			$cand_host = (string) wp_parse_url( $candidate, PHP_URL_HOST );
			$cand_path = (string) wp_parse_url( $candidate, PHP_URL_PATH );
			if (
				'' !== $candidate
				&& wp_http_validate_url( $candidate )
				&& 0 === strcasecmp( $home_host, $cand_host )
				&& class_exists( 'Webino_Dashboard_Rewrite', false )
				&& Webino_Dashboard_Rewrite::is_dashboard_path( $cand_path )
			) {
				$return = $candidate;
			}
		}

		\WebinoBasalam\Admin\Settings\OAuthManager::issueOauthState( $return );
		$oauth   = new \WebinoBasalam\Admin\Settings\OAuthManager();
		$started = $oauth->startViaCrm( $return );
		if ( ! empty( $started['error'] ) || empty( $started['url'] ) ) {
			return new WP_Error(
				'basalam_oauth_start',
				isset( $started['error'] ) ? (string) $started['error'] : __( 'شروع OAuth از WebinaCRM ناموفق بود.', 'webino-dashboard' ),
				array( 'status' => 502 )
			);
		}
		return new WP_REST_Response(
			array(
				'url'          => $started['url'],
				'redirect_uri' => $started['redirect_uri'] ?? '',
				'client_id'    => $started['client_id'] ?? '',
				'return_url'   => $return,
			)
		);
	}

	/**
	 * Manual token paste for testing / recovery (no Hamsalam).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function oauth_manual( WP_REST_Request $request ) {
		if ( ! self::engine_ready() ) {
			return new WP_Error( 'basalam_engine', 'Engine not loaded', array( 'status' => 503 ) );
		}
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$access  = isset( $params['access_token'] ) ? (string) $params['access_token'] : '';
		$refresh = isset( $params['refresh_token'] ) ? (string) $params['refresh_token'] : '';
		$vendor  = isset( $params['vendor_id'] ) ? $params['vendor_id'] : null;
		$expires = isset( $params['expires_in'] ) ? absint( $params['expires_in'] ) : null;
		if ( '' === trim( $access ) ) {
			return new WP_Error( 'basalam_oauth_manual', __( 'access_token الزامی است.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$ok = \WebinoBasalam\Admin\Settings\OAuthManager::saveManualTokens( $access, $refresh, $vendor, $expires );
		if ( ! $ok ) {
			return new WP_Error( 'basalam_oauth_manual', __( 'ذخیره توکن ناموفق بود.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		try {
			$webhook_service = new \WebinoBasalam\Services\WebhookService();
			$webhook_service->setupWebhook();
			$vendor_info_service = new \WebinoBasalam\Services\VendorInfoService();
			$vendor_info_service->FetchVendorInfo();
		} catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
		}
		return new WP_REST_Response(
			array(
				'ok'        => true,
				'connected' => webinoBasalamSettings()->isConnected(),
				'vendor_id' => webinoBasalamSettings()->getSettings( 'vendor_id' ),
			)
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function oauth_refresh() {
		if ( ! self::engine_ready() ) {
			return new WP_Error( 'basalam_engine', 'Engine not loaded', array( 'status' => 503 ) );
		}
		$result = \WebinoBasalam\Admin\Settings\OAuthManager::refreshAccessToken();
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response(
			array(
				'ok'        => true,
				'connected' => webinoBasalamSettings()->isConnected(),
				'vendor_id' => webinoBasalamSettings()->getSettings( 'vendor_id' ),
			)
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function oauth_disconnect() {
		if ( ! self::engine_ready() ) {
			return new WP_Error( 'basalam_engine', 'Engine not loaded', array( 'status' => 503 ) );
		}
		$cfg = \WebinoBasalam\Admin\Settings\SettingsConfig::class;
		\WebinoBasalam\Admin\Settings\SettingsManager::updateSettings(
			array(
				$cfg::TOKEN                => null,
				$cfg::REFRESH_TOKEN        => null,
				$cfg::VENDOR_ID            => null,
				$cfg::IS_VENDOR            => false,
				$cfg::EXPIRE_TOKEN_TIME    => null,
				$cfg::HAMSALAM_TOKEN       => null,
				$cfg::HAMSALAM_BUSINESS_ID => null,
				$cfg::WEBHOOK_ID           => null,
			)
		);
		if ( function_exists( 'webinoBasalamSettings' ) ) {
			webinoBasalamSettings()->forget();
		}
		self::ping_crm_disconnect();
		return new WP_REST_Response( array( 'ok' => true, 'connected' => false ) );
	}

	/**
	 * admin-ajax for oauth/start (CDN often blocks /wp-json/). Always HTTP 200.
	 *
	 * @return void
	 */
	public static function ajax_oauth_start() {
		if ( ! check_ajax_referer( 'wp_rest', 'nonce', false ) ) {
			wp_send_json_error(
				array(
					'message' => 'Invalid nonce',
					'code'    => 'invalid_nonce',
				)
			);
		}
		if ( ! self::can_manage() ) {
			wp_send_json_error(
				array(
					'message' => 'Forbidden',
					'code'    => 'forbidden',
				)
			);
		}
		$result = self::oauth_start();
		if ( is_wp_error( $result ) ) {
			wp_send_json_error(
				array(
					'message' => $result->get_error_message(),
					'code'    => $result->get_error_code(),
				)
			);
		}
		$data = $result instanceof WP_REST_Response ? $result->get_data() : $result;
		wp_send_json_success( $data );
	}

	/**
	 * Complete OAuth when CDN/WAF blocks the GET callback URL (JWT in query).
	 * Admin pastes the return URL; CSRF via logged-in ajax/REST nonce (not OAuth state).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function oauth_complete( WP_REST_Request $request ) {
		if ( ! self::engine_ready() ) {
			return new WP_Error( 'basalam_engine', 'Engine not loaded', array( 'status' => 503 ) );
		}

		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$callback_url = isset( $params['callback_url'] ) ? (string) $params['callback_url'] : '';
		if ( '' === $callback_url && isset( $_POST['payload'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$raw     = wp_unslash( (string) $_POST['payload'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
			$decoded = json_decode( $raw, true );
			if ( is_array( $decoded ) && isset( $decoded['callback_url'] ) ) {
				$callback_url = (string) $decoded['callback_url'];
			}
		}

		$saved = self::save_oauth_from_callback_url( $callback_url );
		if ( is_wp_error( $saved ) ) {
			return $saved;
		}

		return new WP_REST_Response(
			array(
				'ok'        => true,
				'connected' => webinoBasalamSettings()->isConnected(),
				'vendor_id' => webinoBasalamSettings()->getSettings( 'vendor_id' ),
			)
		);
	}

	/**
	 * @return void
	 */
	public static function ajax_oauth_complete() {
		if ( ! check_ajax_referer( 'wp_rest', 'nonce', false ) ) {
			wp_send_json_error(
				array(
					'message' => 'Invalid nonce',
					'code'    => 'invalid_nonce',
				)
			);
		}
		if ( ! self::can_manage() ) {
			wp_send_json_error(
				array(
					'message' => 'Forbidden',
					'code'    => 'forbidden',
				)
			);
		}

		$callback_url = '';
		if ( isset( $_POST['payload'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$raw     = wp_unslash( (string) $_POST['payload'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
			$decoded = json_decode( $raw, true );
			if ( is_array( $decoded ) && isset( $decoded['callback_url'] ) ) {
				$callback_url = (string) $decoded['callback_url'];
			}
		}
		if ( '' === $callback_url && isset( $_POST['callback_url'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$callback_url = wp_unslash( (string) $_POST['callback_url'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
		}

		$saved = self::save_oauth_from_callback_url( $callback_url );
		if ( is_wp_error( $saved ) ) {
			wp_send_json_error(
				array(
					'message' => $saved->get_error_message(),
					'code'    => $saved->get_error_code(),
				)
			);
		}

		wp_send_json_success(
			array(
				'ok'        => true,
				'connected' => webinoBasalamSettings()->isConnected(),
				'vendor_id' => webinoBasalamSettings()->getSettings( 'vendor_id' ),
			)
		);
	}

	/**
	 * Notify CRM registry that this site disconnected locally.
	 *
	 * @return void
	 */
	private static function ping_crm_disconnect() {
		$endpoint = \WebinoBasalam\Admin\Settings\OAuthManager::crmBaseUrl() . '/wp-json/webinocrm/v1/basalam/oauth/disconnect';
		wp_remote_post(
			$endpoint,
			array(
				'timeout'  => 12,
				'blocking' => false,
				'headers'  => array(
					'Content-Type' => 'application/json',
					'Accept'       => 'application/json',
				),
				'body'     => wp_json_encode(
					array(
						'site_url' => get_site_url(),
					)
				),
			)
		);
	}

	/**
	 * One-shot: copy WooSalam tokens from sync_basalam_settings when our option has none.
	 *
	 * @return void
	 */
	private static function maybe_import_legacy_woosalam_token() {
		if ( ! self::engine_ready() ) {
			return;
		}
		if ( webinoBasalamSettings()->hasToken() ) {
			return;
		}
		if ( get_option( 'webino_basalam_imported_sync_basalam', false ) ) {
			return;
		}

		$legacy = get_option( 'sync_basalam_settings', null );
		if ( ! is_array( $legacy ) || empty( $legacy['token'] ) ) {
			update_option( 'webino_basalam_imported_sync_basalam', 1, false );
			return;
		}

		$cfg = \WebinoBasalam\Admin\Settings\SettingsConfig::class;
		\WebinoBasalam\Admin\Settings\SettingsManager::updateSettings(
			array(
				$cfg::TOKEN                => sanitize_text_field( (string) $legacy['token'] ),
				$cfg::REFRESH_TOKEN        => isset( $legacy['refresh_token'] ) ? sanitize_text_field( (string) $legacy['refresh_token'] ) : null,
				$cfg::HAMSALAM_TOKEN       => isset( $legacy['hamsalam_token'] ) ? sanitize_text_field( (string) $legacy['hamsalam_token'] ) : null,
				$cfg::HAMSALAM_BUSINESS_ID => isset( $legacy['hamsalam_business_id'] ) ? sanitize_text_field( (string) $legacy['hamsalam_business_id'] ) : null,
				$cfg::VENDOR_ID            => isset( $legacy['vendor_id'] ) ? (string) absint( $legacy['vendor_id'] ) : null,
				$cfg::IS_VENDOR            => $legacy['is_vendor'] ?? true,
				$cfg::EXPIRE_TOKEN_TIME    => isset( $legacy['expire_token_time'] ) ? absint( $legacy['expire_token_time'] ) : null,
			)
		);
		update_option( 'webino_basalam_imported_sync_basalam', 1, false );
		webinoBasalamSettings()->forget();
	}

	/**
	 * Parse a pasted Hamsalam/WooSalam return URL and persist tokens (WooSalam field set).
	 *
	 * @param string $callback_url Full return URL or query string.
	 * @return true|WP_Error
	 */
	private static function save_oauth_from_callback_url( $callback_url ) {
		$callback_url = trim( (string) $callback_url );
		if ( '' === $callback_url ) {
			return new WP_Error( 'basalam_oauth_empty', __( 'آدرس بازگشت خالی است.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$query = array();
		$parts = wp_parse_url( $callback_url );
		if ( is_array( $parts ) && ! empty( $parts['query'] ) ) {
			wp_parse_str( $parts['query'], $query );
		} elseif ( false !== strpos( $callback_url, '=' ) ) {
			// Bare query string pasted.
			wp_parse_str( ltrim( $callback_url, '?' ), $query );
		}

		$access_token = isset( $query['access_token'] ) ? sanitize_text_field( (string) $query['access_token'] ) : '';
		$hamsalam_tok = isset( $query['hamsalam_token'] ) ? sanitize_text_field( (string) $query['hamsalam_token'] ) : '';
		if ( '' === $access_token && '' === $hamsalam_tok ) {
			return new WP_Error(
				'basalam_oauth_no_token',
				__( 'در آدرس بازگشت توکن یافت نشد. کل URL صفحهٔ بازگشت (با access_token) را بچسبانید.', 'webino-dashboard' ),
				array( 'status' => 400 )
			);
		}

		$is_vendor            = isset( $query['is_vendor'] ) ? sanitize_text_field( (string) $query['is_vendor'] ) : 'true';
		$vendor_id            = isset( $query['vendor_id'] ) ? (string) absint( $query['vendor_id'] ) : null;
		$refresh_token        = isset( $query['refresh_token'] ) ? sanitize_text_field( (string) $query['refresh_token'] ) : null;
		$hamsalam_business_id = isset( $query['hamsalam_business_id'] ) ? sanitize_text_field( (string) $query['hamsalam_business_id'] ) : null;
		$expires_in           = isset( $query['expires_in'] ) ? absint( $query['expires_in'] ) : null;

		// Verify CRM handoff HMAC when present (dashboard SPA callback).
		if ( isset( $query['webino_sig'], $query['webino_ts'], $query['webino_hk'] ) ) {
			$ts  = absint( $query['webino_ts'] );
			$hk  = sanitize_text_field( (string) $query['webino_hk'] );
			$sig = sanitize_text_field( (string) $query['webino_sig'] );
			$max = \WebinoBasalam\Admin\Settings\OAuthManager::HANDOFF_MAX_AGE;
			if ( $ts < 1 || ( time() - $ts ) > $max || '' === $hk || '' === $sig ) {
				return new WP_Error( 'basalam_oauth_sig', __( 'امضای بازگشت منقضی یا نامعتبر است.', 'webino-dashboard' ), array( 'status' => 403 ) );
			}
			$payload = (string) $access_token . '|' . (string) $refresh_token . '|' . (string) $ts . '|' . (string) $vendor_id . '|' . untrailingslashit( get_site_url() );
			$expect  = hash_hmac( 'sha256', $payload, $hk );
			if ( ! hash_equals( $expect, $sig ) ) {
				return new WP_Error( 'basalam_oauth_sig', __( 'امضای بازگشت نامعتبر است.', 'webino-dashboard' ), array( 'status' => 403 ) );
			}
		}

		$cfg = \WebinoBasalam\Admin\Settings\SettingsConfig::class;

		if ( 'false' === $is_vendor ) {
			\WebinoBasalam\Admin\Settings\SettingsManager::updateSettings(
				array(
					$cfg::IS_VENDOR => false,
				)
			);
			return true;
		}

		if ( absint( $vendor_id ) < 1 ) {
			return new WP_Error(
				'basalam_oauth_vendor',
				__( 'شناسه غرفه (vendor_id) معتبر نیست. اتصال را دوباره از حساب غرفه‌دار انجام دهید.', 'webino-dashboard' ),
				array( 'status' => 400 )
			);
		}

		\WebinoBasalam\Admin\Settings\SettingsManager::updateSettings(
			array(
				$cfg::VENDOR_ID            => $vendor_id,
				$cfg::IS_VENDOR            => $is_vendor,
				$cfg::TOKEN                => $access_token !== '' ? $access_token : null,
				$cfg::REFRESH_TOKEN        => $refresh_token,
				$cfg::HAMSALAM_TOKEN       => $hamsalam_tok !== '' ? $hamsalam_tok : null,
				$cfg::HAMSALAM_BUSINESS_ID => $hamsalam_business_id,
				$cfg::EXPIRE_TOKEN_TIME    => $expires_in,
			)
		);

		if ( function_exists( 'webinoBasalamSettings' ) ) {
			webinoBasalamSettings()->forget();
		}

		try {
			$webhook_service = new \WebinoBasalam\Services\WebhookService();
			$webhook_service->setupWebhook();
			$vendor_info_service = new \WebinoBasalam\Services\VendorInfoService();
			$vendor_info_service->FetchVendorInfo();
		} catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			// Token saved; webhook/vendor refresh can be retried from UI.
		}

		if ( ! webinoBasalamSettings()->isConnected() ) {
			\WebinoBasalam\Admin\Settings\SettingsManager::updateSettings(
				array(
					$cfg::TOKEN             => null,
					$cfg::REFRESH_TOKEN     => null,
					$cfg::VENDOR_ID         => null,
					$cfg::IS_VENDOR         => false,
					$cfg::EXPIRE_TOKEN_TIME => null,
					$cfg::HAMSALAM_TOKEN    => null,
					$cfg::HAMSALAM_BUSINESS_ID => null,
				)
			);
			webinoBasalamSettings()->forget();
			return new WP_Error(
				'basalam_oauth_incomplete',
				__( 'اتصال ناقص ذخیره نشد؛ شناسه غرفه نامعتبر است.', 'webino-dashboard' ),
				array( 'status' => 400 )
			);
		}

		return true;
	}

	public static function vendor_get() {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_REST_Response( array( 'vendor' => null ) );
		}
		try {
			$svc = new \WebinoBasalam\Services\VendorInfoService();
			if ( method_exists( $svc, 'FetchVendorInfo' ) ) {
				$info = $svc->FetchVendorInfo();
				return new WP_REST_Response( array( 'vendor' => $info ) );
			}
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_vendor', $e->getMessage(), array( 'status' => 500 ) );
		}
		return new WP_REST_Response(
			array(
				'vendor' => array(
					'id' => webinoBasalamSettings()->getSettings( 'vendor_id' ),
				),
			)
		);
	}

	public static function vendor_post( WP_REST_Request $request ) {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_Error( 'basalam_vendor', __( 'متصل نیستید.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = $request->get_params();
		}
		$svc = new \WebinoBasalam\Services\VendorInfoService();
		$res = $svc->updateVendor( is_array( $params ) ? $params : array() );
		if ( empty( $res['success'] ) ) {
			return new WP_Error( 'basalam_vendor', (string) ( $res['message'] ?? 'update failed' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'ok' => true, 'result' => $res, 'vendor' => $svc->FetchVendorInfo() ) );
	}

	public static function shipping_get() {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_Error( 'basalam_shipping', __( 'متصل نیستید.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$vendor_id = absint( webinoBasalamSettings()->getSettings( 'vendor_id' ) );
		if ( $vendor_id < 1 ) {
			return new WP_Error( 'basalam_shipping', __( 'vendor_id نامعتبر.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$svc      = new \WebinoBasalam\Services\ShippingService();
		$profiles = $svc->listProfiles();
		$carriers = $svc->listCarriers();
		$vendor_carriers = $svc->listVendorCarriers();
		$strategy = $svc->readStrategy();
		return new WP_REST_Response(
			array(
				'ok'              => ! empty( $profiles['success'] ),
				'service'         => 'shipping',
				'profiles'        => $profiles['data'] ?? null,
				'carriers'        => $carriers['data'] ?? null,
				'vendor_carriers' => $vendor_carriers['data'] ?? null,
				'strategy'        => $strategy['data'] ?? null,
				// Back-compat for older Booth UI that expected `shipping`.
				'shipping'        => $profiles['data'] ?? null,
			)
		);
	}

	public static function shipping_post( WP_REST_Request $request ) {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_Error( 'basalam_shipping', __( 'متصل نیستید.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$action     = sanitize_key( (string) ( $params['action'] ?? '' ) );
		$profile_id = absint( $params['profile_id'] ?? $params['id'] ?? 0 );
		$svc        = new \WebinoBasalam\Services\ShippingService();

		if ( 'delete' === $action || 'delete_profile' === $action ) {
			$res = $svc->deleteProfile( $profile_id );
		} elseif ( 'update' === $action || 'update_profile' === $action || $profile_id > 0 ) {
			$res = $svc->updateProfile( $profile_id, $params );
		} else {
			$res = $svc->createProfile( $params );
		}

		if ( empty( $res['success'] ) ) {
			return new WP_Error(
				'basalam_shipping',
				(string) ( $res['message'] ?? 'Shipping request failed' ),
				array( 'status' => (int) ( $res['status_code'] ?? 400 ), 'body' => $res['data'] ?? null )
			);
		}
		return new WP_REST_Response( array( 'ok' => true, 'result' => $res['data'] ?? $res ) );
	}

	public static function webhooks_list() {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_REST_Response( array( 'webhooks' => array() ) );
		}
		$svc = new \WebinoBasalam\Services\WebhookService();
		$res = $svc->listWebhooks();
		return new WP_REST_Response(
			array(
				'ok'       => ! empty( $res['success'] ),
				'webhooks' => $res['data'] ?? array(),
				'webhook_id' => webinoBasalamSettings()->getSettings( 'webhook_id' ),
				'webhook_url'=> get_site_url() . '/wp-json/webino-basalam/v1/order-manager',
			)
		);
	}

	public static function webhooks_rotate() {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_Error( 'basalam_webhook', __( 'متصل نیستید.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$svc = new \WebinoBasalam\Services\WebhookService();
		$ok  = $svc->rotateAndSetup();
		return new WP_REST_Response( array( 'ok' => (bool) $ok ) );
	}

	public static function webhooks_delete( WP_REST_Request $request ) {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_Error( 'basalam_webhook', __( 'متصل نیستید.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$id  = absint( $request->get_param( 'webhook_id' ) );
		$svc = new \WebinoBasalam\Services\WebhookService();
		$ok  = $svc->deleteWebhook( $id );
		return new WP_REST_Response( array( 'ok' => (bool) $ok ) );
	}

	public static function discounts_get() {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_Error( 'basalam_discounts', __( 'متصل نیستید.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$vendor_id = absint( webinoBasalamSettings()->getSettings( 'vendor_id' ) );
		try {
			$api   = webinoBasalamContainer()->get( \WebinoBasalam\Services\ApiServiceManager::class );
			$token = (string) webinoBasalamSettings()->getSettings( 'token' );
			$url   = sprintf( \WebinoBasalam\Config\Endpoints::VENDOR_DISCOUNTS, $vendor_id );
			$res   = $api->get( $url, array( 'Authorization' => 'Bearer ' . $token ) );
			return new WP_REST_Response( array( 'ok' => true, 'discounts' => $res['body'] ?? $res ) );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_discounts', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function discounts_post( WP_REST_Request $request ) {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_Error( 'basalam_discounts', __( 'متصل نیستید.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$vendor_id = absint( webinoBasalamSettings()->getSettings( 'vendor_id' ) );
		$params    = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		try {
			$api   = webinoBasalamContainer()->get( \WebinoBasalam\Services\ApiServiceManager::class );
			$token = (string) webinoBasalamSettings()->getSettings( 'token' );
			$url   = sprintf( \WebinoBasalam\Config\Endpoints::VENDOR_DISCOUNTS, $vendor_id );
			$res   = $api->post( $url, $params, array( 'Authorization' => 'Bearer ' . $token ) );
			$code  = (int) ( $res['status_code'] ?? 0 );
			if ( $code < 200 || $code >= 300 ) {
				return new WP_Error( 'basalam_discounts', 'Create failed', array( 'status' => $code ?: 400 ) );
			}
			return new WP_REST_Response( array( 'ok' => true, 'result' => $res['body'] ?? $res ) );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_discounts', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function chat_token_get() {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_REST_Response( array( 'token' => null, 'enabled' => false ) );
		}
		$token = (string) webinoBasalamSettings()->getSettings( 'token' );
		$script = '';
		if ( class_exists( '\\WebinoBasalam\\Registrar\\AdminRegistrar' ) ) {
			$script = \WebinoBasalam\Registrar\AdminRegistrar::assetsUrl( 'chat/widget-loader.js' );
		} elseif ( function_exists( 'webinoBasalamPlugin' ) ) {
			$script = trailingslashit( (string) webinoBasalamPlugin()->pluginUrl() ) . 'assets/chat/widget-loader.js';
		}
		// Token is for in-browser widget injection only; do not expose admin URLs or log it.
		return new WP_REST_Response(
			array(
				'enabled'    => '' !== $token,
				'token'      => $token,
				'script_url' => $script,
			)
		);
	}

	/**
	 * Soft-notify shop managers when Basalam chat is opened / message activity detected.
	 * Throttled to once per day per site when chat_notify_admins is enabled (default on).
	 */
	public static function chat_notify( WP_REST_Request $request ) {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_REST_Response( array( 'ok' => false ) );
		}
		$notify = webinoBasalamSettings()->getSettings( 'chat_notify_admins' );
		if ( null === $notify || '' === $notify ) {
			$notify = true;
		}
		if ( ! $notify || '0' === (string) $notify || false === $notify ) {
			return new WP_REST_Response( array( 'ok' => true, 'skipped' => true ) );
		}
		if ( ! class_exists( 'Webino_Dashboard_Notifications', false ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'reason' => 'notifications_unavailable' ) );
		}
		$throttle_key = 'webino_basalam_chat_notify_day';
		if ( get_transient( $throttle_key ) ) {
			return new WP_REST_Response( array( 'ok' => true, 'throttled' => true ) );
		}
		$admins = get_users(
			array(
				'role__in' => array( 'administrator', 'shop_manager' ),
				'fields'   => array( 'ID' ),
				'number'   => 20,
			)
		);
		$link  = home_url( '/dashboard/settings/shop/basalam/booth/' );
		$title = __( 'پیام جدید باسلام', 'webino-dashboard' );
		$body  = __( 'ممکن است پیام تازه‌ای در چت باسلام داشته باشید. غرفه را باز کنید.', 'webino-dashboard' );
		$count = 0;
		foreach ( $admins as $user ) {
			$uid = is_object( $user ) ? (int) $user->ID : (int) $user;
			if ( $uid <= 0 ) {
				continue;
			}
			Webino_Dashboard_Notifications::create( $uid, 'basalam_chat', $title, $body, $link );
			++$count;
		}
		set_transient( $throttle_key, 1, DAY_IN_SECONDS );
		return new WP_REST_Response( array( 'ok' => true, 'notified' => $count ) );
	}

	public static function jobs_get( WP_REST_Request $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_basalam_job_manager';
		if ( class_exists( '\\WebinoBasalam\\JobManager', false ) ) {
			try {
				$jm = webinoBasalamContainer()->get( \WebinoBasalam\JobManager::class );
				if ( $jm && method_exists( $jm, 'pruneCompletedJobs' ) ) {
					$jm->pruneCompletedJobs( 7 * DAY_IN_SECONDS );
				}
			} catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
				// Best-effort prune only.
			}
		}
		$status = sanitize_text_field( (string) $request->get_param( 'status' ) );
		$sql = "SELECT * FROM {$table}";
		if ( $status ) {
			$sql .= $wpdb->prepare( ' WHERE status = %s', $status );
		}
		$sql .= ' ORDER BY id DESC LIMIT 100';
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$rows = $wpdb->get_results( $sql, ARRAY_A );
		if ( ! is_array( $rows ) ) {
			$rows = array();
		}
		foreach ( $rows as &$row ) {
			foreach ( array( 'created_at', 'started_at', 'completed_at', 'failed_at', 'retry_after' ) as $ts_key ) {
				if ( ! array_key_exists( $ts_key, $row ) ) {
					continue;
				}
				$val = $row[ $ts_key ];
				if ( null === $val || '' === $val || 0 === $val || '0' === $val ) {
					$row[ $ts_key ] = null;
				} else {
					$row[ $ts_key ] = (int) $val;
				}
			}
		}
		unset( $row );
		return new WP_REST_Response( array( 'jobs' => $rows ) );
	}

	public static function jobs_cancel() {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_basalam_job_manager';
		$now   = time();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query(
			$wpdb->prepare(
				"UPDATE {$table} SET status='failed', error_message=%s, failed_at=%d, started_at=0 WHERE status IN ('pending','processing')",
				'user_cancelled',
				$now
			)
		);
		return new WP_REST_Response( array( 'ok' => true, 'cancelled' => true ) );
	}

	public static function logs_get() {
		$entries = array();
		$hint    = '';
		try {
			if ( class_exists( '\\WebinoBasalam\\Logger\\Logger' ) ) {
				$raw = \WebinoBasalam\Logger\Logger::getLogs();
				if ( is_array( $raw ) ) {
					if ( isset( $raw['error'] ) ) {
						$hint = (string) $raw['error'];
					} else {
						$entries = $raw['logs'] ?? $raw;
					}
				}
			}
		} catch ( \Throwable $e ) {
			$hint = $e->getMessage();
		}
		if ( ! $hint ) {
			$hint = __( 'وضعیت همگام‌سازی اخیر باسلام', 'webino-dashboard' );
		}
		return new WP_REST_Response(
			array(
				'hint' => $hint,
				'logs' => is_array( $entries ) ? $entries : array(),
			)
		);
	}

	public static function products_list( WP_REST_Request $request ) {
		$filter = sanitize_text_field( (string) $request->get_param( 'filter' ) ); // connected|unconnected|all
		$page   = max( 1, absint( $request->get_param( 'page' ) ) ?: 1 );
		$per    = min( 100, max( 1, absint( $request->get_param( 'per_page' ) ) ?: 20 ) );
		$meta_key = class_exists( '\\WebinoBasalam\\Utilities\\ProductMetaKey' )
			? \WebinoBasalam\Utilities\ProductMetaKey::basalamProductId()
			: 'sync_basalam_product_id';

		$connected_parent_ids = self::basalam_connected_parent_ids( $meta_key );

		$args = array(
			'status'   => array( 'publish', 'private', 'draft' ),
			'limit'    => $per,
			'page'     => $page,
			'paginate' => true,
			'return'   => 'objects',
			'orderby'  => 'date',
			'order'    => 'DESC',
			'type'     => array( 'simple', 'variable', 'external', 'grouped' ),
		);
		if ( 'connected' === $filter ) {
			if ( array() === $connected_parent_ids ) {
				return new WP_REST_Response(
					array(
						'products' => array(),
						'total'    => 0,
						'page'     => $page,
						'per_page' => $per,
						'filter'   => 'connected',
					)
				);
			}
			$args['include'] = $connected_parent_ids;
		} elseif ( 'unconnected' === $filter && array() !== $connected_parent_ids ) {
			$args['exclude'] = $connected_parent_ids;
		}

		$result   = wc_get_products( $args );
		$items    = array();
		$products = is_object( $result ) && isset( $result->products ) ? $result->products : (array) $result;
		$total    = is_object( $result ) && isset( $result->total ) ? (int) $result->total : count( $products );

		foreach ( $products as $product ) {
			if ( ! $product instanceof WC_Product ) {
				continue;
			}
			$pid      = $product->get_id();
			$link_info = self::basalam_product_link_info( $product, $meta_key );
			$sync      = get_post_meta(
				$pid,
				class_exists( '\\WebinoBasalam\\Utilities\\ProductMetaKey' )
					? \WebinoBasalam\Utilities\ProductMetaKey::basalamProductSyncStatus()
					: 'sync_basalam_product_sync_status',
				true
			);
			$items[] = array(
				'id'                   => $pid,
				'name'                 => $product->get_name(),
				'sku'                  => $product->get_sku(),
				'status'               => $product->get_status(),
				'basalam_product_id'   => $link_info['primary_id'],
				'basalam_product_ids'  => $link_info['ids'],
				'connected'            => $link_info['connected'],
				'sync_status'          => $sync ? (string) $sync : null,
				'edit_url'             => get_edit_post_link( $pid, 'raw' ),
			);
		}

		return new WP_REST_Response(
			array(
				'products' => $items,
				'total'    => $total,
				'page'     => $page,
				'per_page' => $per,
				'filter'   => $filter ?: 'all',
			)
		);
	}

	/**
	 * Parent product IDs that are linked on the parent or any variation.
	 *
	 * @param string $meta_key Basalam product id meta key.
	 * @return array<int,int>
	 */
	private static function basalam_connected_parent_ids( $meta_key ) {
		global $wpdb;
		$meta_key = (string) $meta_key;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$parent_with_meta = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT p.ID
				FROM {$wpdb->posts} p
				INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = %s AND pm.meta_value <> ''
				WHERE p.post_type = 'product'
				AND p.post_status IN ('publish','private','draft')",
				$meta_key
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$parents_via_children = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT p.post_parent
				FROM {$wpdb->posts} p
				INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = %s AND pm.meta_value <> ''
				WHERE p.post_type = 'product_variation'
				AND p.post_parent > 0
				AND p.post_status IN ('publish','private')",
				$meta_key
			)
		);
		$ids = array_merge(
			is_array( $parent_with_meta ) ? $parent_with_meta : array(),
			is_array( $parents_via_children ) ? $parents_via_children : array()
		);
		$ids = array_values( array_unique( array_filter( array_map( 'intval', $ids ) ) ) );
		return $ids;
	}

	/**
	 * @param WC_Product $product Product.
	 * @param string     $meta_key Meta key.
	 * @return array{connected:bool,primary_id:?string,ids:array<int,string>}
	 */
	private static function basalam_product_link_info( $product, $meta_key ) {
		$ids = array();
		$parent_id = get_post_meta( $product->get_id(), $meta_key, true );
		if ( $parent_id ) {
			$ids[] = (string) $parent_id;
		}
		if ( $product->is_type( 'variable' ) && method_exists( $product, 'get_children' ) ) {
			foreach ( $product->get_children() as $vid ) {
				$child_id = get_post_meta( (int) $vid, $meta_key, true );
				if ( $child_id ) {
					$ids[] = (string) $child_id;
				}
			}
		}
		$ids = array_values( array_unique( array_filter( $ids ) ) );
		return array(
			'connected'  => array() !== $ids,
			'primary_id' => $ids[0] ?? null,
			'ids'        => $ids,
		);
	}

	public static function orders_list( WP_REST_Request $request ) {
		global $wpdb;
		$page = max( 1, absint( $request->get_param( 'page' ) ) ?: 1 );
		$per  = min( 100, max( 1, absint( $request->get_param( 'per_page' ) ) ?: 20 ) );
		$offset = ( $page - 1 ) * $per;
		$table  = $wpdb->prefix . 'webino_basalam_payments';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE order_id IS NOT NULL AND order_id > 0" );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, payment_id, invoice_id, user_id, order_id FROM {$table} WHERE order_id IS NOT NULL AND order_id > 0 ORDER BY id DESC LIMIT %d OFFSET %d",
				$per,
				$offset
			),
			ARRAY_A
		);
		$orders = array();
		foreach ( (array) $rows as $row ) {
			$oid   = absint( $row['order_id'] );
			$order = $oid ? wc_get_order( $oid ) : null;
			$orders[] = array(
				'id'          => $oid,
				'invoice_id'  => absint( $row['invoice_id'] ),
				'payment_id'  => absint( $row['payment_id'] ),
				'status'      => $order ? $order->get_status() : null,
				'total'       => $order ? $order->get_total() : null,
				'currency'    => $order ? $order->get_currency() : null,
				'date'        => $order ? $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : null : null,
				'customer'    => $order ? trim( $order->get_formatted_billing_full_name() ) : null,
				'tracking'    => $order ? (string) $order->get_meta( '_basalam_order_tracking_code' ) : '',
				'edit_url'    => $order ? $order->get_edit_order_url() : null,
			);
		}
		return new WP_REST_Response(
			array(
				'orders'   => $orders,
				'total'    => $total,
				'page'     => $page,
				'per_page' => $per,
			)
		);
	}

	public static function gateway_settings_get() {
		$cfg = Basalam_Config::get();
		return new WP_REST_Response(
			array(
				'gateway_secret_set' => ! empty( $cfg['gateway_secret'] ),
				'sandbox'            => ! empty( $cfg['gateway_sandbox'] ),
				'sandbox_token'      => (string) ( $cfg['gateway_sandbox_token'] ?? '' ),
				'pay_api_base'       => (string) ( $cfg['pay_api_base'] ?? 'https://openapi.basalam.com' ),
			)
		);
	}

	public static function gateway_settings_post( WP_REST_Request $request ) {
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = array();
		}
		$patch = array();
		if ( array_key_exists( 'gateway_secret', $data ) && '***' !== (string) $data['gateway_secret'] ) {
			$patch['gateway_secret'] = sanitize_text_field( (string) $data['gateway_secret'] );
		}
		if ( array_key_exists( 'gateway_sandbox', $data ) ) {
			$patch['gateway_sandbox'] = ! empty( $data['gateway_sandbox'] );
		}
		if ( array_key_exists( 'gateway_sandbox_token', $data ) ) {
			$patch['gateway_sandbox_token'] = sanitize_text_field( (string) $data['gateway_sandbox_token'] );
		}
		if ( array_key_exists( 'pay_api_base', $data ) ) {
			$patch['pay_api_base'] = esc_url_raw( (string) $data['pay_api_base'] );
		}
		Basalam_Config::save( $patch );
		return self::gateway_settings_get();
	}

	private static function enqueue_job( $type, $payload = null ) {
		$jm = webinoBasalamContainer()->get( \WebinoBasalam\JobManager::class );
		$encoded = null === $payload ? null : wp_json_encode( $payload );
		$jm->createJob( $type, 'pending', $encoded );
		return new WP_REST_Response( array( 'ok' => true, 'job_type' => $type ) );
	}

	public static function products_create_all() {
		$include_oos = false;
		$count       = 0;
		try {
			$count = \WebinoBasalam\Admin\ProductService::countCreatableProducts( $include_oos );
		} catch ( \Throwable $e ) {
			$count = 0;
		}

		if ( $count <= 0 ) {
			return new WP_REST_Response(
				array(
					'ok'              => true,
					'creatable_count' => 0,
					'queued'          => false,
					'message'         => 'no_creatable_products',
				)
			);
		}

		$svc    = new \WebinoBasalam\Admin\Product\Services\ProductSyncService();
		$result = $svc->enqueueBulkCreate( $include_oos, 100 );
		if ( empty( $result['success'] ) ) {
			$code = isset( $result['status_code'] ) ? (int) $result['status_code'] : 409;
			return new WP_REST_Response(
				array(
					'ok'              => false,
					'message'         => (string) ( $result['message'] ?? '' ),
					'creatable_count' => $count,
				),
				$code > 0 ? $code : 409
			);
		}

		return new WP_REST_Response(
			array(
				'ok'              => true,
				'queued'          => true,
				'job_type'        => 'sync_basalam_create_all_products',
				'creatable_count' => $count,
				'message'         => (string) ( $result['message'] ?? '' ),
			)
		);
	}

	public static function products_update_all( WP_REST_Request $request ) {
		$mode = sanitize_text_field( (string) $request->get_param( 'mode' ) );
		$type = ( 'quick' === $mode ) ? 'sync_basalam_bulk_update_products' : 'sync_basalam_update_all_products';
		return self::enqueue_job( $type );
	}

	public static function products_connect_all() {
		return self::enqueue_job( 'sync_basalam_auto_connect_products' );
	}

	/**
	 * Connect orphan Basalam products, then update all linked products (prices/stock).
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public static function products_sync_now() {
		if ( ! self::engine_ready() ) {
			return new WP_Error( 'basalam_engine', 'Engine not loaded', array( 'status' => 503 ) );
		}
		$jm = webinoBasalamContainer()->get( \WebinoBasalam\JobManager::class );
		// Connect first; AutoConnectProductsJob queues update-all when then_update is set and pagination ends.
		$jm->createJob(
			'sync_basalam_auto_connect_products',
			'pending',
			wp_json_encode( array( 'then_update' => true ) )
		);
		return new WP_REST_Response(
			array(
				'ok'       => true,
				'job_type' => 'sync_basalam_sync_now',
				'jobs'     => array( 'sync_basalam_auto_connect_products', 'sync_basalam_update_all_products' ),
			)
		);
	}

	/**
	 * Local commission tariff status.
	 *
	 * @return WP_REST_Response
	 */
	public static function commission_get() {
		if ( ! self::engine_ready() ) {
			return new WP_REST_Response( array( 'ok' => false, 'engine' => false ) );
		}
		$data = \WebinoBasalam\Services\Products\CommissionRates::get();
		return new WP_REST_Response(
			array(
				'ok'                   => true,
				'row_count'            => (int) $data['row_count'],
				'unmatched'            => (int) $data['unmatched'],
				'imported_at'          => (string) $data['imported_at'],
				'price_change_value'   => webinoBasalamSettings()->getSettings( 'price_change_value' ),
				'commission_enabled'   => \WebinoBasalam\Utilities\PriceAdjustment::isCommission(
					webinoBasalamSettings()->getSettings( 'price_change_value' )
				),
			)
		);
	}

	/**
	 * Seed bundled Mehr 1405 tariff or import CSV.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function commission_import( WP_REST_Request $request ) {
		if ( ! self::engine_ready() ) {
			return new WP_Error( 'basalam_engine', 'Engine not loaded', array( 'status' => 503 ) );
		}
		$params = $request->get_json_params();
		if ( ! is_array( $params ) || array() === $params ) {
			$raw = $request->get_body();
			if ( is_string( $raw ) && '' !== trim( $raw ) ) {
				$decoded = json_decode( $raw, true );
				if ( is_array( $decoded ) ) {
					$params = $decoded;
				}
			}
		}
		if ( ! is_array( $params ) ) {
			$params = $request->get_params();
		}
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		$action = isset( $params['action'] ) ? sanitize_key( (string) $params['action'] ) : '';
		$enable = ! isset( $params['enable_commission'] ) || ! empty( $params['enable_commission'] );

		if ( 'seed' === $action || ( empty( $params['csv'] ) && empty( $params['csv_base64'] ) ) ) {
			// Default POST without CSV seeds the bundled Mehr 1405 tariff.
			$result = \WebinoBasalam\Services\Products\CommissionRates::seedFromBundledTariff( (bool) $enable );
			if ( empty( $result['ok'] ) ) {
				return new WP_Error(
					'basalam_commission_seed',
					(string) ( $result['message'] ?? 'seed_failed' ),
					array( 'status' => 400, 'result' => $result )
				);
			}
			$status = \WebinoBasalam\Services\Products\CommissionRates::get();
			return new WP_REST_Response(
				array(
					'ok'                 => true,
					'source'             => 'mehr_1405_bundled',
					'matched'            => (int) ( $result['matched'] ?? 0 ),
					'unmatched'          => (int) ( $result['unmatched'] ?? 0 ),
					'row_count'          => (int) $status['row_count'],
					'imported_at'        => (string) $status['imported_at'],
					'commission_enabled' => \WebinoBasalam\Utilities\PriceAdjustment::isCommission(
						webinoBasalamSettings()->getSettings( 'price_change_value' )
					),
				)
			);
		}

		$csv = '';
		if ( isset( $params['csv'] ) ) {
			$csv = (string) $params['csv'];
		} elseif ( isset( $params['csv_base64'] ) ) {
			$decoded = base64_decode( (string) $params['csv_base64'], true );
			$csv     = false !== $decoded ? $decoded : '';
		}
		if ( '' === trim( $csv ) ) {
			return new WP_Error( 'basalam_commission_csv', __( 'فایل CSV خالی است.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$result = \WebinoBasalam\Services\Products\CommissionRates::importCsv( $csv );
		if ( empty( $result['ok'] ) ) {
			return new WP_Error(
				'basalam_commission_import',
				(string) ( $result['message'] ?? 'import_failed' ),
				array( 'status' => 400, 'result' => $result )
			);
		}

		if ( $enable && (int) ( $result['matched'] ?? 0 ) > 0 ) {
			\WebinoBasalam\Admin\Settings\SettingsManager::updateSettings(
				array(
					\WebinoBasalam\Admin\Settings\SettingsConfig::PRICE_CHANGE_VALUE => \WebinoBasalam\Utilities\PriceAdjustment::COMMISSION,
				)
			);
			webinoBasalamSettings()->forget();
		}

		$status = \WebinoBasalam\Services\Products\CommissionRates::get();
		return new WP_REST_Response(
			array(
				'ok'                 => true,
				'source'             => 'csv',
				'matched'            => (int) ( $result['matched'] ?? 0 ),
				'unmatched'          => (int) ( $result['unmatched'] ?? 0 ),
				'row_count'          => (int) $status['row_count'],
				'imported_at'        => (string) $status['imported_at'],
				'commission_enabled' => \WebinoBasalam\Utilities\PriceAdjustment::isCommission(
					webinoBasalamSettings()->getSettings( 'price_change_value' )
				),
			)
		);
	}

	public static function product_create( WP_REST_Request $request ) {
		$id = absint( $request->get_param( 'product_id' ) );
		return self::enqueue_job( 'sync_basalam_create_single_product', array( 'product_id' => $id ) );
	}

	public static function product_update( WP_REST_Request $request ) {
		$id = absint( $request->get_param( 'product_id' ) );
		return self::enqueue_job( 'sync_basalam_update_single_product', array( 'product_id' => $id ) );
	}

	public static function product_archive( WP_REST_Request $request ) {
		$id = absint( $request->get_param( 'product_id' ) );
		try {
			$ops = webinoBasalamContainer()->get( \WebinoBasalam\Admin\Product\ProductOperations::class );
			$ops->archiveExistProduct( $id );
			return new WP_REST_Response( array( 'ok' => true ) );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_archive', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function product_restore( WP_REST_Request $request ) {
		$id = absint( $request->get_param( 'product_id' ) );
		try {
			$ops = webinoBasalamContainer()->get( \WebinoBasalam\Admin\Product\ProductOperations::class );
			$ops->restoreExistProduct( $id );
			return new WP_REST_Response( array( 'ok' => true ) );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_restore', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function product_disconnect( WP_REST_Request $request ) {
		$id = absint( $request->get_param( 'product_id' ) );
		$svc = new \WebinoBasalam\Admin\Product\Services\ProductDisconnectService();
		$svc->disconnectSelected( array( $id ) );
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function product_connect( WP_REST_Request $request ) {
		$woo = absint( $request->get_param( 'product_id' ) );
		$bsl = absint( $request->get_param( 'basalam_product_id' ) );
		\WebinoBasalam\Services\Products\ConnectSingleProductService::connectProductById( $woo, $bsl );
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * Clamp order-pull lookback window (days).
	 *
	 * @param mixed $raw Raw days value.
	 * @param int   $default Default when missing/invalid.
	 * @return int
	 */
	private static function clamp_order_pull_days( $raw, $default = 90 ) {
		$days = absint( $raw );
		if ( $days < 1 || $days > 365 ) {
			return (int) $default;
		}
		return $days;
	}

	public static function orders_pull( $request = null ) {
		$raw = null;
		if ( $request instanceof WP_REST_Request ) {
			$raw = $request->get_param( 'days' );
			if ( null === $raw || '' === $raw ) {
				$raw = $request->get_param( 'day' );
			}
		}
		$days = self::clamp_order_pull_days( $raw, 90 );
		return self::enqueue_job(
			'sync_basalam_fetch_orders',
			array(
				'cursor' => null,
				'day'    => $days,
			)
		);
	}

	public static function order_confirm( WP_REST_Request $request ) {
		$order_id = absint( $request->get_param( 'order_id' ) );
		$svc = new \WebinoBasalam\Services\Orders\ConfirmOrderService();
		$result = $svc->confirmOrderOnBasalam( $order_id );
		return new WP_REST_Response( array( 'ok' => true, 'result' => $result ) );
	}

	public static function order_cancel( WP_REST_Request $request ) {
		$order_id = absint( $request->get_param( 'order_id' ) );
		$reason   = absint( $request->get_param( 'reason_id' ) ) ?: 3481;
		$svc = new \WebinoBasalam\Services\Orders\CancelOrderService();
		$result = $svc->cancelOrderOnBasalam( $order_id, (string) $request->get_param( 'description' ), $reason );
		return new WP_REST_Response( array( 'ok' => true, 'result' => $result ) );
	}

	public static function order_tracking( WP_REST_Request $request ) {
		$order_id = absint( $request->get_param( 'order_id' ) );
		$code     = sanitize_text_field( (string) $request->get_param( 'tracking_code' ) );
		$method   = absint( $request->get_param( 'shipping_method' ) ) ?: 3197;
		$phone    = sanitize_text_field( (string) $request->get_param( 'phone' ) );
		$svc = new \WebinoBasalam\Services\Orders\TrackingCodeOrderService();
		$result = $svc->trackingCodeOnBasalam( $order_id, $code, $phone, $method );
		return new WP_REST_Response( array( 'ok' => true, 'result' => $result ) );
	}

	public static function order_delay( WP_REST_Request $request ) {
		$order_id = absint( $request->get_param( 'order_id' ) );
		$days     = absint( $request->get_param( 'postpone_days' ) ) ?: absint( $request->get_param( 'days' ) );
		$desc     = sanitize_text_field( (string) $request->get_param( 'description' ) );
		$svc      = new \WebinoBasalam\Services\Orders\DelayReqOrderService();
		$result   = $svc->delayReqOnBasalam( $order_id, $desc, $days );
		if ( empty( $result['success'] ) ) {
			return new WP_Error( 'basalam_order_delay', (string) ( $result['message'] ?? 'delay failed' ), array( 'status' => (int) ( $result['status_code'] ?? 400 ) ) );
		}
		return new WP_REST_Response( array( 'ok' => true, 'result' => $result ) );
	}

	public static function order_cancel_request( WP_REST_Request $request ) {
		$order_id = absint( $request->get_param( 'order_id' ) );
		$desc     = sanitize_text_field( (string) $request->get_param( 'description' ) );
		// Service currently reads $_POST (WooSalam AJAX legacy).
		$_POST['order_id']    = $order_id; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$_POST['description'] = $desc; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$svc    = new \WebinoBasalam\Services\Orders\CancelReqOrderService();
		$result = $svc->reqCancelOrderOnBasalam();
		if ( empty( $result['success'] ) ) {
			return new WP_Error( 'basalam_order_cancel_req', (string) ( $result['message'] ?? 'cancel request failed' ), array( 'status' => (int) ( $result['status_code'] ?? 400 ) ) );
		}
		return new WP_REST_Response( array( 'ok' => true, 'result' => $result ) );
	}

	public static function categories_detect( WP_REST_Request $request ) {
		$title = sanitize_text_field( (string) $request->get_param( 'title' ) );
		if ( '' === $title ) {
			return new WP_Error( 'basalam_detect', __( 'عنوان محصول الزامی است.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		try {
			$raw = \WebinoBasalam\Services\Products\GetCategoryId::getCategoryIdFromBasalam( $title, 'all', false, true );
			$prediction = null;
			if ( is_array( $raw ) && ! empty( $raw[0] ) && is_array( $raw[0] ) ) {
				$first = $raw[0];
				$ids   = isset( $first['cat_id'] ) && is_array( $first['cat_id'] ) ? $first['cat_id'] : array();
				$prediction = array(
					'name'        => (string) ( $first['cat_title'] ?? '' ),
					'category_id' => isset( $ids[2] ) ? (int) $ids[2] : ( isset( $ids[ count( $ids ) - 1 ] ) ? (int) $ids[ count( $ids ) - 1 ] : null ),
					'level1'      => isset( $ids[0] ) ? (int) $ids[0] : null,
					'level2'      => isset( $ids[1] ) ? (int) $ids[1] : null,
					'level3'      => isset( $ids[2] ) ? (int) $ids[2] : null,
				);
			} elseif ( is_array( $raw ) && isset( $raw['cat_id'] ) ) {
				$ids = is_array( $raw['cat_id'] ) ? $raw['cat_id'] : array( $raw['cat_id'] );
				$prediction = array(
					'name'        => (string) ( $raw['cat_title'] ?? '' ),
					'category_id' => isset( $ids[ count( $ids ) - 1 ] ) ? (int) $ids[ count( $ids ) - 1 ] : null,
					'level1'      => isset( $ids[0] ) ? (int) $ids[0] : null,
					'level2'      => isset( $ids[1] ) ? (int) $ids[1] : null,
					'level3'      => isset( $ids[2] ) ? (int) $ids[2] : null,
				);
			}
			return new WP_REST_Response( array( 'ok' => true, 'prediction' => $prediction ) );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_detect', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function categories_attributes( WP_REST_Request $request ) {
		$category_id = absint( $request->get_param( 'category_id' ) );
		if ( $category_id < 1 ) {
			return new WP_Error( 'basalam_attrs', __( 'category_id الزامی است.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		try {
			$api = webinoBasalamContainer()->get( \WebinoBasalam\Services\ApiServiceManager::class );
			$url = sprintf( \WebinoBasalam\Config\Endpoints::CATEGORY_ATTRIBUTES, $category_id );
			$res = $api->get( $url );
			return new WP_REST_Response( array( 'attributes' => $res['body'] ?? $res ) );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_attrs', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function option_maps_get() {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_basalam_map_options';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT 500", ARRAY_A );
		return new WP_REST_Response( array( 'maps' => $rows ? $rows : array() ) );
	}

	public static function option_maps_post( WP_REST_Request $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_basalam_map_options';
		$data  = array(
			'woo_name'             => sanitize_text_field( (string) ( $request->get_param( 'woo_name' ) ?: $request->get_param( 'woo_attr_name' ) ) ),
			'webino_basalam_name'  => sanitize_text_field( (string) ( $request->get_param( 'webino_basalam_name' ) ?: $request->get_param( 'basalam_attr_name' ) ) ),
		);
		$id = absint( $request->get_param( 'id' ) );
		if ( $id > 0 ) {
			$wpdb->update( $table, $data, array( 'id' => $id ) );
		} else {
			$wpdb->insert( $table, $data );
		}
		return self::option_maps_get();
	}

	public static function option_maps_delete( WP_REST_Request $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_basalam_map_options';
		$wpdb->delete( $table, array( 'id' => absint( $request->get_param( 'id' ) ) ) );
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function finance_banks() {
		try {
			$svc  = new \WebinoBasalam\Services\FinancialManagementService();
			$banks = $svc->getBankAccounts();
			return new WP_REST_Response( array( 'ok' => ! empty( $banks['success'] ), 'banks' => $banks ) );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_banks', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function finance_settlement( WP_REST_Request $request ) {
		$amount = absint( $request->get_param( 'amount' ) );
		$method = absint( $request->get_param( 'method' ) );
		$bank   = $request->get_param( 'bank_account_id' );
		$invest = $request->get_param( 'investment_option_id' );
		if ( $amount < 1 || $method < 1 ) {
			return new WP_Error( 'basalam_settlement', __( 'amount و method الزامی هستند.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		try {
			$svc = new \WebinoBasalam\Services\FinancialManagementService();
			$res = $svc->createSettlement(
				$amount,
				$method,
				null !== $invest && '' !== (string) $invest ? absint( $invest ) : null,
				null !== $bank && '' !== (string) $bank ? absint( $bank ) : null
			);
			if ( empty( $res['success'] ) ) {
				return new WP_Error( 'basalam_settlement', (string) ( $res['message'] ?? 'settlement failed' ), array( 'status' => (int) ( $res['status_code'] ?? 400 ) ) );
			}
			return new WP_REST_Response( array( 'ok' => true, 'result' => $res ) );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_settlement', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function webhook_setup() {
		if ( ! self::engine_ready() || ! webinoBasalamSettings()->hasToken() ) {
			return new WP_Error( 'basalam_webhook', __( 'ابتدا به باسلام متصل شوید.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		try {
			$webhook_service = new \WebinoBasalam\Services\WebhookService();
			$webhook_service->setupWebhook();
			return new WP_REST_Response(
				array(
					'ok'         => true,
					'webhook_id' => webinoBasalamSettings()->getSettings( 'webhook_id' ),
					'webhook_url'=> get_site_url() . '/wp-json/webino-basalam/v1/order-manager',
				)
			);
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_webhook', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function categories_get() {
		try {
			$categories = \WebinoBasalam\Admin\Product\Category\CategoryMapping::getBasalamCategories();
			return new WP_REST_Response( array( 'categories' => $categories ) );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_categories', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function mappings_get() {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_basalam_category_mappings';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC", ARRAY_A );
		return new WP_REST_Response( array( 'mappings' => $rows ? $rows : array() ) );
	}

	public static function mappings_post( WP_REST_Request $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_basalam_category_mappings';
		$wpdb->replace(
			$table,
			array(
				'woo_category_id'         => absint( $request->get_param( 'woo_category_id' ) ),
				'woo_category_name'       => sanitize_text_field( (string) $request->get_param( 'woo_category_name' ) ),
				'basalam_category_level1' => absint( $request->get_param( 'basalam_category_level1' ) ) ?: null,
				'basalam_category_level2' => absint( $request->get_param( 'basalam_category_level2' ) ) ?: null,
				'basalam_category_level3' => absint( $request->get_param( 'basalam_category_level3' ) ) ?: null,
				'basalam_category_name'   => sanitize_text_field( (string) $request->get_param( 'basalam_category_name' ) ),
			)
		);
		return self::mappings_get();
	}

	public static function mappings_delete( WP_REST_Request $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_basalam_category_mappings';
		$wpdb->delete( $table, array( 'id' => absint( $request->get_param( 'id' ) ) ) );
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function finance_balance() {
		try {
			if ( ! class_exists( '\\WebinoBasalam\\Services\\FinancialManagementService' ) ) {
				return new WP_REST_Response( array( 'ok' => false, 'message' => 'Finance service unavailable.' ) );
			}
			$svc = new \WebinoBasalam\Services\FinancialManagementService();
			$balance = $svc->getBalance();
			$active  = $svc->getActiveSettlements( 1, 10 );
			$history = $svc->getSettlementHistory( 1, 10 );
			return new WP_REST_Response(
				array(
					'ok'          => true,
					'balance'     => $balance,
					'settlements' => $active,
					'history'     => $history,
				)
			);
		} catch ( \Throwable $e ) {
			return new WP_Error( 'basalam_finance', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public static function tickets_get( WP_REST_Request $request ) {
		return new WP_REST_Response(
			array(
				'tickets'  => array(),
				'disabled' => true,
				'hint'     => __( 'تیکت‌های همسلام حذف شده‌اند. از پشتیبانی وبینو استفاده کنید.', 'webino-dashboard' ),
			)
		);
	}

	public static function reconcile_post( $request = null ) {
		return self::orders_pull( $request );
	}
}
