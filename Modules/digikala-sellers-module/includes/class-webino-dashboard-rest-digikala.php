<?php
/**
 * REST endpoints for Digikala seller integration.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_Dashboard_REST_Digikala {

	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		// admin-ajax fallbacks when CDN/WAF blocks /wp-json/.
		add_action( 'wp_ajax_webino_dashboard_digikala_keys_generate', array( __CLASS__, 'ajax_keys_generate' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_keys', array( __CLASS__, 'ajax_keys_get' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_token_issue', array( __CLASS__, 'ajax_token_issue' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_auth_status', array( __CLASS__, 'ajax_auth_status' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_settings', array( __CLASS__, 'ajax_settings' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_product_map', array( __CLASS__, 'ajax_product_map' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_product_sync', array( __CLASS__, 'ajax_product_sync' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_product_maps', array( __CLASS__, 'ajax_product_maps' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_products_mapped', array( __CLASS__, 'ajax_products_mapped' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_order_cancel', array( __CLASS__, 'ajax_order_cancel' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_order_sbs', array( __CLASS__, 'ajax_order_sbs' ) );
		add_action( 'wp_ajax_webino_dashboard_digikala_webhook_subscribe', array( __CLASS__, 'ajax_webhook_subscribe' ) );
	}

	/**
	 * Shared ajax guard + response wrapper for Digikala REST callbacks.
	 * Always HTTP 200 — CDN/WAF often replaces non-200 admin-ajax with HTML Forbidden.
	 *
	 * @param callable(): (WP_REST_Response|WP_Error|mixed) $callback REST-style callback.
	 * @return void
	 */
	private static function ajax_run( $callback ) {
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
		$result = call_user_func( $callback );
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
	 * @return void
	 */
	public static function ajax_keys_generate() {
		self::ajax_run( array( __CLASS__, 'keys_generate' ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_keys_get() {
		self::ajax_run( array( __CLASS__, 'keys_get' ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_token_issue() {
		self::ajax_run(
			static function () {
				$payload = array();
				if ( isset( $_POST['payload'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- checked in ajax_run.
					$raw = wp_unslash( (string) $_POST['payload'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
					$decoded = json_decode( $raw, true );
					if ( is_array( $decoded ) ) {
						$payload = $decoded;
					}
				}
				$request = new WP_REST_Request( 'POST' );
				$request->set_body( wp_json_encode( $payload ) );
				$request->set_header( 'Content-Type', 'application/json' );
				return self::token_issue( $request );
			}
		);
	}

	/**
	 * @return void
	 */
	public static function ajax_auth_status() {
		self::ajax_run( array( __CLASS__, 'auth_status' ) );
	}

	/**
	 * GET/POST digikala/settings via admin-ajax (WAF-safe).
	 *
	 * @return void
	 */
	public static function ajax_settings() {
		self::ajax_run(
			static function () {
				$payload = array();
				if ( isset( $_POST['payload'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- checked in ajax_run.
					$raw     = wp_unslash( (string) $_POST['payload'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
					$decoded = json_decode( $raw, true );
					if ( is_array( $decoded ) ) {
						$payload = $decoded;
					}
				}
				if ( empty( $payload ) ) {
					return self::settings_get();
				}
				$request = new WP_REST_Request( 'POST' );
				$request->set_body( wp_json_encode( $payload ) );
				$request->set_header( 'Content-Type', 'application/json' );
				return self::settings_post( $request );
			}
		);
	}

	/**
	 * @param callable(WP_REST_Request): (WP_REST_Response|WP_Error|mixed) $callback Callback.
	 * @return void
	 */
	private static function ajax_rest_request( $callback ) {
		self::ajax_run(
			static function () use ( $callback ) {
				$payload = array();
				if ( isset( $_POST['payload'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
					$raw     = wp_unslash( (string) $_POST['payload'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
					$decoded = json_decode( $raw, true );
					if ( is_array( $decoded ) ) {
						$payload = $decoded;
					}
				}
				$path = isset( $_POST['rest_path'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['rest_path'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
				$id   = (int) ( $payload['id'] ?? $payload['product_id'] ?? $payload['order_id'] ?? 0 );
				if ( $id <= 0 && preg_match( '#(?:products|orders)/(\d+)#', $path, $m ) ) {
					$id = (int) $m[1];
				}
				$request = new WP_REST_Request( 'POST' );
				$request->set_body( wp_json_encode( $payload ) );
				$request->set_header( 'Content-Type', 'application/json' );
				if ( $id > 0 ) {
					$request->set_param( 'id', $id );
				}
				return call_user_func( $callback, $request );
			}
		);
	}

	/**
	 * @return void
	 */
	public static function ajax_product_map() {
		self::ajax_rest_request( array( __CLASS__, 'product_map' ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_product_sync() {
		self::ajax_rest_request( array( __CLASS__, 'product_sync' ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_product_maps() {
		self::ajax_rest_request( array( __CLASS__, 'product_maps_get' ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_products_mapped() {
		self::ajax_run( array( __CLASS__, 'products_mapped' ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_order_cancel() {
		self::ajax_rest_request( array( __CLASS__, 'order_cancel' ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_order_sbs() {
		self::ajax_rest_request( array( __CLASS__, 'order_sbs_status' ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_webhook_subscribe() {
		self::ajax_run( array( __CLASS__, 'webhook_subscribe' ) );
	}

	/**
	 * @return bool
	 */
	public static function can_manage() {
		return Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
	}

	/**
	 * @return bool
	 */
	public static function can_manage_trace() {
		return self::can_manage();
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/digikala/keys/generate',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'keys_generate' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/keys',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'keys_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/token/issue',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'token_issue' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/auth/status',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'auth_status' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'settings_get' ),
					'permission_callback' => array( __CLASS__, 'can_manage' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'settings_post' ),
					'permission_callback' => array( __CLASS__, 'can_manage' ),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/test-connection',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'test_connection' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/scopes',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'scopes' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/sync/products/import',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_import' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/sync/products/export',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_export' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/sync/inventory',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'inventory_sync' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/sync/orders/pull',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'orders_pull' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/sync/orders/push-status',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'orders_push_status' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/sync/phase2/shipments',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'phase2_shipments' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/sync/phase2/finance',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'phase2_finance' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/sync/phase2/promotions',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'phase2_promotions' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/sync/phase2/sbs',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'phase2_sbs' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/jobs',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'jobs_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/logs',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'logs_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/coverage',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'coverage_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/webhook-matrix',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'webhook_matrix_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/webhook/subscribe',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'webhook_subscribe' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/products/mapped',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'products_mapped' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/products/(?P<id>\d+)/maps',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'product_maps_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/products/(?P<id>\d+)/variant-labels',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'product_variant_labels' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/products/(?P<id>\d+)/map',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_map' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/products/(?P<id>\d+)/sync',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_sync' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/orders/(?P<id>\d+)/cancel',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'order_cancel' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/orders/(?P<id>\d+)/sbs-status',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'order_sbs_status' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/reconcile',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'reconcile_post' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/health',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'health_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/alerts',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'alerts_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/digikala/coverage/endpoints',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'coverage_endpoints_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage_trace' ),
				'args'                => array(
					'status' => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_key',
					),
					'job_type' => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_key',
					),
					'dispatcher' => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'include_pending' => array(
						'type'              => 'boolean',
						'default'           => true,
						'sanitize_callback' => 'rest_sanitize_boolean',
					),
					'refresh' => array(
						'type'              => 'boolean',
						'default'           => false,
						'sanitize_callback' => 'rest_sanitize_boolean',
					),
					'page' => array(
						'type'              => 'integer',
						'default'           => 1,
						'sanitize_callback' => 'absint',
					),
					'per_page' => array(
						'type'              => 'integer',
						'default'           => 200,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		$s = Digikala_Auth::settings();
		if ( class_exists( '\\WebinoDigikala\\Settings' ) ) {
			$s = \WebinoDigikala\Settings::redact( $s );
		} else {
			$s['has_private_key'] = ! empty( $s['private_key'] );
			$s['private_key']     = '';
			$s['encrypted_code']  = ! empty( $s['encrypted_code'] ) ? '***' : '';
		}
		if ( class_exists( 'Digikala_Phase3_Sync' ) ) {
			$s['webhook_events'] = Digikala_Phase3_Sync::normalize_webhook_events( $s['webhook_events'] ?? null );
			$s['webhook_event_labels'] = array();
			foreach ( Digikala_Phase3_Sync::webhook_matrix() as $key => $rule ) {
				$s['webhook_event_labels'][ $key ] = (string) ( $rule['label_fa'] ?? $key );
			}
		}
		$s['webhook_url'] = home_url( '/webino/digikala-webhook/' );
		return new WP_REST_Response(
			array(
				'settings' => $s,
				'auth'     => Digikala_Auth::token_status(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_post( WP_REST_Request $request ) {
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'invalid_body', __( 'Invalid request body.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$clean = array();
		if ( isset( $data['base_url'] ) ) {
			$clean['base_url'] = esc_url_raw( (string) $data['base_url'] );
		}
		if ( isset( $data['client_code'] ) ) {
			$clean['client_code'] = sanitize_text_field( (string) $data['client_code'] );
		}
		if ( isset( $data['webhook_secret'] ) ) {
			$clean['webhook_secret'] = sanitize_text_field( (string) $data['webhook_secret'] );
		}
		if ( isset( $data['auto_sync'] ) ) {
			$clean['auto_sync'] = ! empty( $data['auto_sync'] );
		}
		if ( isset( $data['credit_increase_percentage'] ) ) {
			$clean['credit_increase_percentage'] = (int) $data['credit_increase_percentage'];
		}
		if ( isset( $data['webhook_events'] ) && is_array( $data['webhook_events'] ) ) {
			$clean['webhook_events'] = $data['webhook_events'];
		}
		// Never accept plaintext authorization_code as primary auth.
		unset( $data['authorization_code'], $data['client_secret'], $data['private_key'] );
		$saved = Digikala_Auth::save_settings( $clean );
		if ( class_exists( '\\WebinoDigikala\\Settings' ) ) {
			$saved = \WebinoDigikala\Settings::redact( $saved );
		}
		if ( class_exists( 'Digikala_Phase3_Sync' ) ) {
			$saved['webhook_events'] = Digikala_Phase3_Sync::normalize_webhook_events( $saved['webhook_events'] ?? null );
			$saved['webhook_url']    = home_url( '/webino/digikala-webhook/' );
			if ( ! empty( $saved['auto_sync'] ) || isset( $clean['webhook_events'] ) ) {
				$sub = Digikala_Phase3_Sync::subscribe_official_webhooks();
				if ( ! is_wp_error( $sub ) ) {
					$saved['webhook_subscribed'] = true;
				}
			}
		}
		return new WP_REST_Response( array( 'settings' => $saved ) );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function keys_generate() {
		$res = Digikala_Auth::generate_rsa_keypair();
		if ( is_wp_error( $res ) ) {
			$data = $res->get_error_data();
			if ( ! is_array( $data ) || ! isset( $data['status'] ) ) {
				$res->add_data( array( 'status' => 500 ) );
			}
			return $res;
		}
		return new WP_REST_Response(
			array(
				'public_key'      => $res['public_key'],
				'has_private_key' => true,
				'message'         => __( 'RSA-4096 keys generated. Copy the public key into Digikala seller panel. Private key is stored on the server.', 'webino-dashboard' ),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function keys_get() {
		$s = Digikala_Auth::settings();
		return new WP_REST_Response(
			array(
				'public_key'      => (string) ( $s['public_key'] ?? '' ),
				'has_private_key' => ! empty( $s['private_key'] ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function token_issue( WP_REST_Request $request ) {
		$data = $request->get_json_params();
		$code = is_array( $data ) ? sanitize_textarea_field( (string) ( $data['encrypted_code'] ?? '' ) ) : '';
		$res  = Digikala_Auth::issue_token_from_code( $code !== '' ? $code : null );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response(
			array(
				'ok'   => true,
				'auth' => Digikala_Auth::token_status(),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function auth_status() {
		return new WP_REST_Response( Digikala_Auth::token_status() );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function test_connection() {
		$token = Digikala_Auth::access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}
		if ( class_exists( '\\WebinoDigikala\\Client', false ) ) {
			$path = 'open-api/v1/auth/scopes';
			$s    = Digikala_Auth::settings();
			if ( ! empty( $s['client_code'] ) ) {
				$path = 'open-api/v1/auth/scopes/' . rawurlencode( (string) $s['client_code'] );
			}
			$health = \WebinoDigikala\Client::request( 'GET', $path );
			if ( is_wp_error( $health ) ) {
				$health = \WebinoDigikala\Client::request( 'GET', 'open-api/v1/variants', null, array( 'page' => 1, 'size' => 1 ) );
			}
			if ( is_wp_error( $health ) ) {
				return $health;
			}
			return new WP_REST_Response(
				array(
					'ok'   => true,
					'auth' => Digikala_Auth::token_status(),
					'health' => $health,
				)
			);
		}
		$health = Digikala_Client::request( 'GET', 'open-api/v1/variants', null, array( 'page' => 1, 'size' => 1 ) );
		if ( is_wp_error( $health ) ) {
			return $health;
		}
		return new WP_REST_Response( array( 'ok' => true, 'health' => $health, 'auth' => Digikala_Auth::token_status() ) );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function scopes() {
		$settings = Digikala_Auth::settings();
		$path = 'open-api/v1/auth/scopes';
		if ( ! empty( $settings['client_code'] ) ) {
			$path = 'open-api/v1/auth/scopes/' . rawurlencode( (string) $settings['client_code'] );
		}
		$res = Digikala_Client::request( 'GET', $path );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( $res );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function product_import( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$payload = is_array( $body ) ? $body : array();
		if ( class_exists( '\\WebinoDigikala\\Jobs', false ) ) {
			$job = \WebinoDigikala\Jobs::enqueue( 'product_import', $payload );
			return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job, 'engine' => 'WebinoDigikala' ) );
		}
		$job = Digikala_Jobs::enqueue( 'product_import', $payload, 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function product_export( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$payload = is_array( $body ) ? $body : array();
		if ( class_exists( '\\WebinoDigikala\\Jobs', false ) ) {
			return new WP_REST_Response( array( 'ok' => true, 'job_id' => \WebinoDigikala\Jobs::enqueue( 'product_export', $payload ), 'engine' => 'WebinoDigikala' ) );
		}
		$job = Digikala_Jobs::enqueue( 'product_export', $payload, 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function inventory_sync( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$payload = is_array( $body ) ? $body : array();
		if ( class_exists( '\\WebinoDigikala\\Jobs', false ) ) {
			return new WP_REST_Response( array( 'ok' => true, 'job_id' => \WebinoDigikala\Jobs::enqueue( 'inventory_sync', $payload ), 'engine' => 'WebinoDigikala' ) );
		}
		$job = Digikala_Jobs::enqueue( 'inventory_sync', $payload, 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function orders_pull( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$payload = is_array( $body ) ? $body : array();
		if ( class_exists( '\\WebinoDigikala\\Jobs', false ) ) {
			return new WP_REST_Response( array( 'ok' => true, 'job_id' => \WebinoDigikala\Jobs::enqueue( 'orders_pull', $payload ), 'engine' => 'WebinoDigikala' ) );
		}
		$job = Digikala_Jobs::enqueue( 'orders_pull', $payload, 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function orders_push_status( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$payload = is_array( $body ) ? $body : array();
		if ( class_exists( '\\WebinoDigikala\\Jobs', false ) ) {
			return new WP_REST_Response( array( 'ok' => true, 'job_id' => \WebinoDigikala\Jobs::enqueue( 'order_push_status', $payload ), 'engine' => 'WebinoDigikala' ) );
		}
		$job = Digikala_Jobs::enqueue( 'order_push_status', $payload, 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function phase2_shipments( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$job = Digikala_Jobs::enqueue( 'phase2_shipments', is_array( $body ) ? $body : array(), 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function phase2_finance( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$job = Digikala_Jobs::enqueue( 'phase2_finance', is_array( $body ) ? $body : array(), 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function phase2_promotions( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$job = Digikala_Jobs::enqueue( 'phase2_promotions', is_array( $body ) ? $body : array(), 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function phase2_sbs( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$job = Digikala_Jobs::enqueue( 'phase2_sbs', is_array( $body ) ? $body : array(), 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function jobs_get() {
		global $wpdb;
		if ( class_exists( '\\WebinoDigikala\\Storage', false ) ) {
			$table = \WebinoDigikala\Storage::table( 'jobs' );
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$rows = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT 100", ARRAY_A );
			return new WP_REST_Response( array( 'jobs' => $rows ? $rows : array(), 'engine' => 'WebinoDigikala' ) );
		}
		$table = $wpdb->prefix . 'webino_dk_jobs';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT 100", ARRAY_A );
		return new WP_REST_Response( array( 'jobs' => $rows ? $rows : array() ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function logs_get() {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dk_logs';
		$rows = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT 200", ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		return new WP_REST_Response( array( 'items' => is_array( $rows ) ? $rows : array() ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function coverage_get() {
		return new WP_REST_Response(
			array(
				'phase1' => array(
					'authentication',
					'products',
					'inventory',
					'orders',
					'webhooks',
					'jobs_logs',
				),
				'phase2' => array(
					'shipment_package_post_tracking_commitments',
					'invoices_commission_buybox_price_stats',
					'promotions_vouchers_smart_discount_search_ads',
					'sbs_drop_shipping_plp_insight',
				),
				'phase3' => array(
					'full_webhook_matrix',
					'advanced_rate_limit_and_retry_policies',
					'conflict_resolution_and_reconciliation',
					'monitoring_alerting_health_checks',
				),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function webhook_matrix_get() {
		return new WP_REST_Response( array( 'items' => Digikala_Phase3_Sync::webhook_matrix() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function reconcile_post( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$type = is_array( $body ) ? sanitize_key( (string) ( $body['type'] ?? 'all' ) ) : 'all';
		$jobs = array();
		if ( 'all' === $type || 'products' === $type ) {
			$jobs[] = Digikala_Jobs::enqueue( 'reconcile_products', array(), 0 );
		}
		if ( 'all' === $type || 'orders' === $type ) {
			$jobs[] = Digikala_Jobs::enqueue( 'reconcile_orders', array(), 0 );
		}
		if ( 'all' === $type || 'inventory' === $type ) {
			$jobs[] = Digikala_Jobs::enqueue( 'reconcile_inventory', array(), 0 );
		}
		if ( empty( $jobs ) ) {
			return new WP_Error( 'bad_type', __( 'Invalid reconcile type.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'ok' => true, 'job_ids' => $jobs ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function health_get() {
		return new WP_REST_Response( Digikala_Phase3_Sync::health_status() );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function alerts_get() {
		$health = Digikala_Phase3_Sync::health_status();
		$alerts = array();
		if ( ! empty( $health['auth_ok'] ) ) {
			// no alert
		} else {
			$alerts[] = array( 'level' => 'critical', 'message' => 'Authentication is not healthy.' );
		}
		if ( (int) ( $health['errors_24h'] ?? 0 ) > 5 ) {
			$alerts[] = array( 'level' => 'warning', 'message' => 'High error rate in last 24h.' );
		}
		if ( (int) ( $health['queue_pending'] ?? 0 ) > 50 ) {
			$alerts[] = array( 'level' => 'warning', 'message' => 'Queue backlog is high.' );
		}
		return new WP_REST_Response(
			array(
				'status' => $health['status'],
				'items'  => $alerts,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function coverage_endpoints_get( WP_REST_Request $request ) {
		$force_refresh = (bool) $request->get_param( 'refresh' );
		$report        = Digikala_Endpoint_Registry::report(
			array(
				'force_refresh' => $force_refresh,
			)
		);
		if ( is_wp_error( $report ) ) {
			return $report;
		}
		$list    = is_array( $report['items'] ?? null ) ? $report['items'] : array();
		$summary = is_array( $report['summary'] ?? null ) ? $report['summary'] : array();
		$meta    = is_array( $report['meta'] ?? null ) ? $report['meta'] : array();

		$status_filter = sanitize_key( (string) $request->get_param( 'status' ) );
		$job_filter    = sanitize_key( (string) $request->get_param( 'job_type' ) );
		$dispatcher_filter = sanitize_text_field( (string) $request->get_param( 'dispatcher' ) );
		$include_pending   = rest_sanitize_boolean( $request->get_param( 'include_pending' ) );

		if ( '' !== $status_filter ) {
			$list = array_values(
				array_filter(
					$list,
					static function ( $row ) use ( $status_filter ) {
						return ( $row['status'] ?? '' ) === $status_filter;
					}
				)
			);
		}

		if ( ! $include_pending ) {
			$list = array_values(
				array_filter(
					$list,
					static function ( $row ) {
						return ( $row['status'] ?? '' ) !== 'pending';
					}
				)
			);
		}

		if ( '' !== $job_filter ) {
			$list = array_values(
				array_filter(
					$list,
					static function ( $row ) use ( $job_filter ) {
						$jobs = isset( $row['job_types'] ) && is_array( $row['job_types'] ) ? $row['job_types'] : array();
						return in_array( $job_filter, $jobs, true );
					}
				)
			);
		}

		if ( '' !== $dispatcher_filter ) {
			$list = array_values(
				array_filter(
					$list,
					static function ( $row ) use ( $dispatcher_filter ) {
						$dispatchers = isset( $row['dispatchers'] ) && is_array( $row['dispatchers'] ) ? $row['dispatchers'] : array();
						foreach ( $dispatchers as $dispatcher ) {
							if ( false !== stripos( (string) $dispatcher, $dispatcher_filter ) ) {
								return true;
							}
						}
						return false;
					}
				)
			);
		}

		$per_page = min( 500, max( 1, (int) $request->get_param( 'per_page' ) ) );
		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$total    = count( $list );
		$offset   = ( $page - 1 ) * $per_page;
		$list     = array_slice( $list, $offset, $per_page );

		Digikala_Jobs::log(
			'info',
			'coverage_registry',
			'Endpoint coverage queried.',
			array(
				'refresh'        => (bool) $force_refresh,
				'status'         => $status_filter,
				'job_type'       => $job_filter,
				'dispatcher'     => $dispatcher_filter ? 'provided' : '',
				'include_pending'=> (bool) $include_pending,
				'page'           => $page,
				'per_page'       => $per_page,
			)
		);

		return new WP_REST_Response(
			array(
				'summary' => $summary,
				'items'   => $list,
				'meta'    => array_merge(
					$meta,
					array(
						'page'     => $page,
						'per_page' => $per_page,
						'total'    => $total,
					)
				),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_map( WP_REST_Request $request ) {
		$id = (int) $request['id'];
		if ( $id <= 0 || ! class_exists( 'Digikala_Product_Map' ) ) {
			return new WP_Error( 'dk_bad_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$body         = $request->get_json_params();
		$body         = is_array( $body ) ? $body : array();
		$dkp          = (string) ( $body['dkp'] ?? $body['remote_product_id'] ?? $body['dk_product_id'] ?? '' );
		$variant_id   = (string) ( $body['variant_id'] ?? $body['dk_variant_id'] ?? $body['remote_variant_id'] ?? '' );
		$variation_id = (int) ( $body['variation_id'] ?? $body['wc_variation_id'] ?? 0 );
		$res          = Digikala_Product_Map::resolve_and_map( $id, $variation_id, $dkp, $variant_id );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( $res );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_sync( WP_REST_Request $request ) {
		$id = (int) $request['id'];
		if ( $id <= 0 || ! class_exists( 'Digikala_Product_Map' ) ) {
			return new WP_Error( 'dk_bad_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$body         = $request->get_json_params();
		$body         = is_array( $body ) ? $body : array();
		$variation_id = (int) ( $body['variation_id'] ?? $body['wc_variation_id'] ?? 0 );
		$res          = Digikala_Product_Map::sync_price_stock( $id, $variation_id );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_maps_get( WP_REST_Request $request ) {
		$id = (int) $request['id'];
		if ( $id <= 0 || ! class_exists( 'Digikala_Product_Map' ) ) {
			return new WP_Error( 'dk_bad_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'maps' => Digikala_Product_Map::maps_for_product( $id ) ) );
	}

	/**
	 * Digikala color/size/title labels for mapped variants (orphan card identity).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_variant_labels( WP_REST_Request $request ) {
		$id = (int) $request['id'];
		if ( $id <= 0 || ! class_exists( 'Digikala_Product_Map' ) ) {
			return new WP_Error( 'dk_bad_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$labels = Digikala_Product_Map::labels_for_product_maps( $id );
		return new WP_REST_Response(
			array(
				'labels' => $labels,
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function products_mapped() {
		$items = class_exists( 'Digikala_Product_Map' ) ? Digikala_Product_Map::list_mapped( 100, 0 ) : array();
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_cancel( WP_REST_Request $request ) {
		$id = (int) $request['id'];
		$order = $id > 0 ? wc_get_order( $id ) : null;
		if ( ! $order || 'digikala' !== (string) $order->get_meta( '_wnc_platform' ) ) {
			return new WP_Error( 'dk_bad_order', __( 'Digikala order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body = $request->get_json_params();
		$body = is_array( $body ) ? $body : array();
		$payload = array(
			'order_id'               => $id,
			'cancellation_reason_id' => (int) ( $body['cancellation_reason_id'] ?? $body['reason_id'] ?? -1 ),
			'item_id'                => (int) ( $body['item_id'] ?? 0 ),
			'count'                  => (int) ( $body['count'] ?? 0 ),
		);
		if ( class_exists( '\\WebinoDigikala\\Jobs', false ) ) {
			return new WP_REST_Response( array( 'ok' => true, 'job_id' => \WebinoDigikala\Jobs::enqueue( 'order_cancel', $payload ), 'engine' => 'WebinoDigikala' ) );
		}
		$job = Digikala_Jobs::enqueue( 'order_cancel', $payload, 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_sbs_status( WP_REST_Request $request ) {
		$id    = (int) $request['id'];
		$order = $id > 0 ? wc_get_order( $id ) : null;
		if ( ! $order || 'digikala' !== (string) $order->get_meta( '_wnc_platform' ) ) {
			return new WP_Error( 'dk_bad_order', __( 'Digikala order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$fulfillment = (string) $order->get_meta( '_digikala_fulfillment' );
		if ( 'seller' !== $fulfillment ) {
			return new WP_Error(
				'dk_not_sbs',
				__( 'This Digikala order is warehouse-fulfilled; seller status updates are not allowed.', 'webino-dashboard' ),
				array( 'status' => 400 )
			);
		}
		$body   = $request->get_json_params();
		$body   = is_array( $body ) ? $body : array();
		$action = sanitize_key( (string) ( $body['action'] ?? $body['status'] ?? '' ) );
		$allowed = array( 'processing', 'processed', 'full_delivered_to_customer', 'completed' );
		if ( ! in_array( $action, $allowed, true ) ) {
			return new WP_Error( 'dk_bad_status', __( 'Invalid Digikala ship-by-seller status.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$payload = array(
			'order_id'          => $id,
			'action'            => $action,
			'status'            => $action,
			'verification_code' => (string) ( $body['verification_code'] ?? '' ),
		);
		if ( class_exists( '\\WebinoDigikala\\Jobs', false ) ) {
			return new WP_REST_Response( array( 'ok' => true, 'job_id' => \WebinoDigikala\Jobs::enqueue( 'order_push_status', $payload ), 'engine' => 'WebinoDigikala' ) );
		}
		$job = Digikala_Jobs::enqueue( 'order_push_status', $payload, 0 );
		return new WP_REST_Response( array( 'ok' => true, 'job_id' => $job ) );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function webhook_subscribe() {
		if ( ! class_exists( 'Digikala_Phase3_Sync' ) ) {
			return new WP_Error( 'dk_no_phase3', __( 'Webhook subscription is unavailable.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$res = Digikala_Phase3_Sync::subscribe_official_webhooks();
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array( 'ok' => true, 'result' => $res ) );
	}
}
