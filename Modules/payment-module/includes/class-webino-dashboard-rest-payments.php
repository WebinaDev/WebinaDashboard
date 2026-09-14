<?php
/**
 * Curated payment hub catalog.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * GET /payments/hub
 */
final class Webino_Dashboard_REST_Payments {

	const NS     = 'webino-dashboard/v1';
	const PARENT = 'payment-module';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		// admin-ajax fallback when CDN/WAF blocks /wp-json/ for payment SPA pages.
		add_action( 'wp_ajax_webino_dashboard_payments_rest', array( __CLASS__, 'ajax_payments_rest' ) );
		if ( did_action( 'rest_api_init' ) ) {
			self::register_routes();
		}
	}

	/**
	 * Whether a REST path under webino-dashboard/v1 is allowed via admin-ajax proxy.
	 *
	 * @param string $path Path without leading slash, e.g. torobpay/settings.
	 * @return bool
	 */
	private static function is_ajax_proxy_path_allowed( $path ) {
		$path = ltrim( (string) $path, '/' );
		$path = strtok( $path, '?' );
		if ( ! is_string( $path ) || '' === $path ) {
			return false;
		}
		$prefixes = array(
			'payments/',
			'torobpay/',
			'snapppay/',
			'digipay/',
			'zarinpal/',
			'bale-pay/',
			'wallet/',
			'c2c/',
		);
		foreach ( $prefixes as $prefix ) {
			if ( 0 === strpos( $path, $prefix ) || rtrim( $prefix, '/' ) === $path ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * admin-ajax proxy for payment gateway REST (CDN/WAF-safe). Always HTTP 200 envelope.
	 *
	 * @return void
	 */
	public static function ajax_payments_rest() {
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
		if ( ! self::can_manage() ) {
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

		if ( ! self::is_ajax_proxy_path_allowed( $rest_path ) ) {
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

		wp_send_json_success( $response->get_data() );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/payments/hub',
			array(
				array(
					'methods'             => 'GET',
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => array( __CLASS__, 'hub_get' ),
				),
				array(
					'methods'             => 'POST',
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'callback'            => array( __CLASS__, 'hub_post' ),
				),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function can_manage() {
		return class_exists( 'Webino_Dashboard_Rest_Base', false )
			&& Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
	}

	/**
	 * Fixed Webina gateway rows (order is the hub UI order).
	 *
	 * @return list<array<string,mixed>>
	 */
	public static function catalog() {
		return array(
			array(
				'id'            => 'zarinpal',
				'title_key'     => 'paymentsHub.zarinpal',
				'module_slug'   => 'zarinpal-gateway-module',
				'gateway_ids'   => array( 'zarinpal_gateway' ),
				'settings_path' => '/settings/shop/zarinpal',
			),
			array(
				'id'            => 'digipay',
				'title_key'     => 'paymentsHub.digipay',
				'module_slug'   => 'digipay-upg-module',
				'gateway_ids'   => array( 'digipay_ipg', 'digipay_bpg', 'digipay_cpg', 'digipay_wallet' ),
				'id_match'      => 'digipay',
				'settings_path' => '/settings/shop/digipay',
			),
			array(
				'id'            => 'snapppay',
				'title_key'     => 'paymentsHub.snapppay',
				'module_slug'   => 'snapppay-gateway-module',
				'gateway_ids'   => array( 'WC_Gateway_SnappPay', 'snapppay', 'snapp_pay', 'wc_snapppay' ),
				'id_match'      => 'snapp',
				'settings_path' => '/settings/shop/snapppay',
			),
			array(
				'id'            => 'torobpay',
				'title_key'     => 'paymentsHub.torobpay',
				'module_slug'   => 'torobpay-gateway-module',
				'gateway_ids'   => array( 'WC_Gateway_TorobPay', 'torobpay', 'torob_pay', 'wc_gateway_torobpay' ),
				'id_match'      => 'torob',
				'settings_path' => '/settings/shop/torobpay',
			),
			array(
				'id'            => 'bale_pay',
				'title_key'     => 'paymentsHub.balePay',
				'module_slug'   => 'bale-pay-gateway-module',
				'gateway_ids'   => array( 'webino_bale_pay' ),
				'settings_path' => '/settings/shop/bale-pay',
			),
			array(
				'id'            => 'wallet',
				'title_key'     => 'paymentsHub.wallet',
				'module_slug'   => 'wallet-gateway-module',
				'gateway_ids'   => array( 'webino_wallet' ),
				'settings_path' => '/settings/shop/wallet',
			),
			array(
				'id'            => 'c2c',
				'title_key'     => 'paymentsHub.c2c',
				'module_slug'   => 'card-to-card-gateway-module',
				'gateway_ids'   => array( 'webino_bots_c2c' ),
				'settings_path' => '/settings/shop/c2c',
			),
		);
	}

	/**
	 * @return list<string>
	 */
	public static function curated_gateway_ids() {
		$ids = array();
		foreach ( self::catalog() as $row ) {
			foreach ( (array) ( $row['gateway_ids'] ?? array() ) as $id ) {
				$ids[] = (string) $id;
			}
		}
		return array_values( array_unique( $ids ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function hub_get() {
		$wc_map = array();
		if ( function_exists( 'WC' ) && WC()->payment_gateways() ) {
			foreach ( WC()->payment_gateways()->payment_gateways() as $id => $gateway ) {
				if ( ! is_object( $gateway ) ) {
					continue;
				}
				$wc_map[ (string) $id ] = array(
					'enabled' => isset( $gateway->enabled ) && 'yes' === $gateway->enabled,
					'title'   => method_exists( $gateway, 'get_method_title' ) ? (string) $gateway->get_method_title() : (string) $id,
				);
			}
		}

		$items = array();
		foreach ( self::catalog() as $row ) {
			$gw_id = '';
			foreach ( (array) $row['gateway_ids'] as $candidate ) {
				if ( isset( $wc_map[ $candidate ] ) ) {
					$gw_id = (string) $candidate;
					break;
				}
			}
			if ( '' === $gw_id && ! empty( $row['id_match'] ) ) {
				$needle = strtolower( (string) $row['id_match'] );
				foreach ( $wc_map as $id => $_info ) {
					if ( false !== strpos( strtolower( (string) $id ), $needle ) ) {
						$gw_id = (string) $id;
						break;
					}
				}
			}

			$module_slug   = (string) $row['module_slug'];
			$module_active = class_exists( 'Webino_Dashboard_Module_Registry', false )
				&& Webino_Dashboard_Module_Registry::is_active( $module_slug );
			$available     = '' !== $gw_id && $module_active;

			$enabled = false;
			if ( $available ) {
				// DigiPay (and similar multi-id rows): enabled if ANY catalog candidate is on.
				foreach ( (array) $row['gateway_ids'] as $candidate ) {
					$cid = (string) $candidate;
					if ( ! empty( $wc_map[ $cid ]['enabled'] ) ) {
						$enabled = true;
						if ( '' === $gw_id ) {
							$gw_id = $cid;
						}
						break;
					}
				}
				if ( ! $enabled && '' !== $gw_id && ! empty( $wc_map[ $gw_id ]['enabled'] ) ) {
					$enabled = true;
				}
			}

			$items[] = array(
				'id'            => (string) $row['id'],
				'title_key'     => (string) $row['title_key'],
				'module_slug'   => $module_slug,
				'module_active' => $module_active,
				'gateway_id'    => $gw_id,
				'enabled'       => $enabled,
				'available'     => $available,
				'settings_path' => (string) $row['settings_path'],
			);
		}

		$geo = class_exists( 'Webino_Dashboard_Checkout_Geo', false )
			? Webino_Dashboard_Checkout_Geo::get_settings()
			: array(
				'enabled'  => true,
				'services' => array(),
				'colors'   => array(),
			);

		return new WP_REST_Response(
			array(
				'items'               => $items,
				'curated_gateway_ids' => self::curated_gateway_ids(),
				'geo_notice'          => $geo,
				// Legacy field for older clients.
				'geo_notice_enabled'  => ! empty( $geo['enabled'] ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function hub_post( $request ) {
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = $request->get_params();
		}
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		if ( class_exists( 'Webino_Dashboard_Checkout_Geo', false ) ) {
			if ( isset( $params['geo_notice'] ) && is_array( $params['geo_notice'] ) ) {
				$current = Webino_Dashboard_Checkout_Geo::get_settings();
				$merged  = array_replace_recursive( $current, $params['geo_notice'] );
				Webino_Dashboard_Checkout_Geo::set_settings( $merged );
			} elseif ( array_key_exists( 'geo_notice_enabled', $params ) ) {
				Webino_Dashboard_Checkout_Geo::set_enabled( ! empty( $params['geo_notice_enabled'] ) );
			}
		}
		return self::hub_get();
	}
}
