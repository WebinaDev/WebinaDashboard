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
				'gateway_ids'   => array( 'digipay_ipg' ),
				'settings_path' => '/settings/shop/digipay',
			),
			array(
				'id'            => 'snapppay',
				'title_key'     => 'paymentsHub.snapppay',
				'module_slug'   => 'snapppay-gateway-module',
				'gateway_ids'   => array( 'snapppay', 'snapp_pay', 'wc_snapppay' ),
				'id_match'      => 'snapp',
				'settings_path' => '/settings/shop/snapppay',
			),
			array(
				'id'            => 'torobpay',
				'title_key'     => 'paymentsHub.torobpay',
				'module_slug'   => 'torobpay-gateway-module',
				'gateway_ids'   => array( 'torobpay', 'torob_pay', 'wc_gateway_torobpay' ),
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

			$items[] = array(
				'id'            => (string) $row['id'],
				'title_key'     => (string) $row['title_key'],
				'module_slug'   => $module_slug,
				'module_active' => $module_active,
				'gateway_id'    => $gw_id,
				'enabled'       => $available && ! empty( $wc_map[ $gw_id ]['enabled'] ),
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
