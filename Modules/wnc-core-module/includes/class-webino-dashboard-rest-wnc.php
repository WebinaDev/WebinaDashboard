<?php
/**
 * REST facade for WebinaConnector platforms.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers webino-dashboard/v1/wnc/* routes.
 */
final class Webino_Dashboard_REST_WNC {

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
	public static function available() {
		return class_exists( 'WNC_Settings', false ) && class_exists( 'WNC_Platform_Registry', false );
	}

	/**
	 * @return bool
	 */
	private static function can_manage() {
		return current_user_can( 'manage_woocommerce' );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		if ( ! self::available() ) {
			return;
		}

		register_rest_route(
			self::NS,
			'/wnc/hub',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'hub_get' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/platforms',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'list_platforms' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/(?P<platform>[a-z0-9_-]+)/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'get_settings' ),
					'permission_callback' => function () {
						return self::can_manage();
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'save_settings' ),
					'permission_callback' => function () {
						return self::can_manage();
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/(?P<platform>[a-z0-9_-]+)/test-connection',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'test_connection' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/(?P<platform>[a-z0-9_-]+)/sync-now',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'sync_now' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/(?P<platform>[a-z0-9_-]+)/pull-orders',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'pull_orders' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/(?P<platform>[a-z0-9_-]+)/maps',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'list_maps' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/(?P<platform>[a-z0-9_-]+)/maps',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'save_map' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/(?P<platform>[a-z0-9_-]+)/jobs',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'list_jobs' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/(?P<platform>[a-z0-9_-]+)/logs',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'list_logs' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/(?P<platform>[a-z0-9_-]+)/feed-url',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'feed_url' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/torob/preview',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'torob_preview' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/torob/queue',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'torob_queue' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/products/(?P<id>\d+)/maps',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'product_maps' ),
					'permission_callback' => function () {
						return self::can_manage();
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'save_product_maps' ),
					'permission_callback' => function () {
						return self::can_manage();
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/products/(?P<id>\d+)/sync-now',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_sync_now' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);

		register_rest_route(
			self::NS,
			'/wnc/products/(?P<id>\d+)/create-remote',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_create_remote' ),
				'permission_callback' => function () {
					return self::can_manage();
				},
			)
		);
	}

	/**
	 * @param string $platform Platform.
	 * @return true|WP_Error
	 */
	private static function assert_platform( $platform ) {
		$platform = sanitize_key( $platform );
		$adapter  = WNC_Platform_Registry::get( $platform );
		if ( ! $adapter ) {
			return new WP_Error( 'wnc_unknown_platform', __( 'Unknown platform.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return true;
	}

	/**
	 * Fixed marketplace connector rows (hub UI order).
	 *
	 * @return list<array<string,mixed>>
	 */
	public static function hub_catalog() {
		return array(
			array(
				'id'            => 'basalam',
				'title_key'     => 'bazaarHub.basalam',
				'module_slug'   => 'basalam-module',
				'platform'      => 'basalam',
				'settings_path' => '/settings/shop/basalam',
			),
			array(
				'id'            => 'digikala',
				'title_key'     => 'bazaarHub.digikala',
				'module_slug'   => 'digikala-sellers-module',
				'platform'      => 'digikala',
				'settings_path' => '/settings/shop/digikala',
			),
			array(
				'id'            => 'snappshop',
				'title_key'     => 'bazaarHub.snappshop',
				'module_slug'   => 'snappshop-module',
				'platform'      => 'snappshop',
				'settings_path' => '/settings/shop/snappshop',
			),
			array(
				'id'            => 'tapsishop',
				'title_key'     => 'bazaarHub.tapsishop',
				'module_slug'   => 'tapsishop-module',
				'platform'      => 'tapsishop',
				'settings_path' => '/settings/shop/tapsishop',
			),
			array(
				'id'            => 'technolife',
				'title_key'     => 'bazaarHub.technolife',
				'module_slug'   => 'technolife-module',
				'platform'      => 'technolife',
				'settings_path' => '/settings/shop/technolife',
			),
			array(
				'id'            => 'emalls',
				'title_key'     => 'bazaarHub.emalls',
				'module_slug'   => 'emalls-module',
				'platform'      => 'emalls',
				'settings_path' => '/settings/shop/emalls',
			),
			array(
				'id'            => 'torob',
				'title_key'     => 'bazaarHub.torob',
				'module_slug'   => 'torob-connector-module',
				'platform'      => 'torob',
				'settings_path' => '/settings/shop/torob',
			),
			array(
				'id'            => 'zarehbin',
				'title_key'     => 'bazaarHub.zarehbin',
				'module_slug'   => 'zarehbin-module',
				'platform'      => 'zarehbin',
				'settings_path' => '/settings/shop/zarehbin',
			),
			array(
				'id'            => 'snapppay_search',
				'title_key'     => 'bazaarHub.snapppaySearch',
				'module_slug'   => 'snapppay-search-module',
				'platform'      => 'snapppay-search',
				'settings_path' => '/settings/shop/snapppay-search',
			),
		);
	}

	/**
	 * GET /wnc/hub
	 *
	 * @return WP_REST_Response
	 */
	public static function hub_get() {
		$items = array();
		foreach ( self::hub_catalog() as $row ) {
			$module_slug   = (string) $row['module_slug'];
			$platform      = (string) $row['platform'];
			$module_active = class_exists( 'Webino_Dashboard_Module_Registry', false )
				&& Webino_Dashboard_Module_Registry::is_active( $module_slug );
			$settings      = class_exists( 'WNC_Settings', false ) ? WNC_Settings::get_platform( $platform ) : array();
			$enabled       = $module_active && ! empty( $settings['enabled'] );

			$items[] = array(
				'id'            => (string) $row['id'],
				'title_key'     => (string) $row['title_key'],
				'module_slug'   => $module_slug,
				'module_active' => $module_active,
				'platform'      => $platform,
				'enabled'       => $enabled,
				'available'     => $module_active,
				'settings_path' => (string) $row['settings_path'],
			);
		}

		return new WP_REST_Response( array( 'items' => $items ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_platforms() {
		$rows = array();
		foreach ( WNC_Platform_Registry::all() as $adapter ) {
			$settings = WNC_Settings::get_platform( $adapter->id() );
			$rows[]   = array(
				'id'      => $adapter->id(),
				'label'   => $adapter->label(),
				'live'    => (bool) $adapter->is_live(),
				'enabled' => ! empty( $settings['enabled'] ),
			);
		}
		return new WP_REST_Response( array( 'platforms' => $rows ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_settings( $request ) {
		$platform = sanitize_key( (string) $request['platform'] );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$adapter  = WNC_Platform_Registry::get( $platform );
		$settings = WNC_Settings::get_platform( $platform );
		return new WP_REST_Response(
			array(
				'platform' => $platform,
				'label'    => $adapter ? $adapter->label() : $platform,
				'live'     => $adapter ? (bool) $adapter->is_live() : false,
				'settings' => $settings,
				'pricing_tab' => in_array( $platform, array( 'digikala', 'basalam', 'technolife', 'snappshop', 'tapsishop' ), true )
					? '/settings/shop/pricing/marketplaces'
					: ( in_array( $platform, array( 'zarehbin', 'emalls', 'snapppay-search', 'torob' ), true )
						? '/settings/shop/pricing/search-engines'
						: '/settings/shop/pricing/dashboard' ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function save_settings( $request ) {
		$platform = sanitize_key( (string) $request['platform'] );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = array();
		}
		$payload = isset( $data['settings'] ) && is_array( $data['settings'] ) ? $data['settings'] : $data;
		WNC_Settings::update_platform( $platform, $payload );
		if ( 'torob' === $platform && class_exists( 'WNC_Torob_Bootstrap' ) ) {
			WNC_Torob_Bootstrap::sync_feature_flags_from_settings();
		}
		return self::get_settings( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function test_connection( $request ) {
		$platform = sanitize_key( (string) $request['platform'] );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$adapter = WNC_Platform_Registry::get( $platform );
		$result  = $adapter->test_connection();
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function sync_now( $request ) {
		$platform = sanitize_key( (string) $request['platform'] );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$body       = $request->get_json_params();
		$product_id = isset( $body['product_id'] ) ? (int) $body['product_id'] : 0;
		if ( $product_id > 0 && class_exists( 'WNC_Price_Sync' ) ) {
			WNC_Price_Sync::enqueue_for_product( $product_id );
		} elseif ( class_exists( 'WNC_Jobs' ) ) {
			WNC_Jobs::enqueue(
				'push_price_stock',
				array(
					'wc_product_id' => 0,
					'product_id'    => 0,
				),
				$platform
			);
		}
		if ( class_exists( 'WNC_Jobs' ) ) {
			WNC_Jobs::process( 5 );
		}
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function pull_orders( $request ) {
		$platform = sanitize_key( (string) $request['platform'] );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		if ( class_exists( 'WNC_Jobs' ) ) {
			WNC_Jobs::enqueue( 'pull_orders', array(), $platform );
			WNC_Jobs::process( 5 );
		} elseif ( class_exists( 'WNC_Order_Sync' ) ) {
			WNC_Order_Sync::pull( $platform );
		}
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_maps( $request ) {
		$platform = sanitize_key( (string) $request['platform'] );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$rows = array();
		if ( class_exists( 'WNC_Mapper' ) ) {
			if ( method_exists( 'WNC_Mapper', 'list_enabled' ) ) {
				$rows = WNC_Mapper::list_enabled( $platform, 100 );
			}
		}
		if ( empty( $rows ) ) {
			global $wpdb;
			if ( class_exists( 'WNC_Storage' ) ) {
				$table = WNC_Storage::product_map_table();
				$rows  = $wpdb->get_results(
					$wpdb->prepare(
						"SELECT * FROM {$table} WHERE platform = %s ORDER BY id DESC LIMIT 100",
						$platform
					),
					ARRAY_A
				);
			}
		}
		return new WP_REST_Response( array( 'maps' => $rows ? $rows : array() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function save_map( $request ) {
		$platform = sanitize_key( (string) $request['platform'] );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$body = $request->get_json_params();
		if ( ! is_array( $body ) || ! class_exists( 'WNC_Mapper' ) ) {
			return new WP_Error( 'wnc_bad_map', __( 'Invalid map payload.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		WNC_Mapper::upsert(
			array(
				'wc_product_id'      => (int) ( $body['wc_product_id'] ?? 0 ),
				'wc_variation_id'    => (int) ( $body['wc_variation_id'] ?? 0 ),
				'platform'           => $platform,
				'remote_product_id'  => (string) ( $body['remote_product_id'] ?? '' ),
				'remote_variant_id'  => (string) ( $body['remote_variant_id'] ?? '' ),
				'remote_url'         => (string) ( $body['remote_url'] ?? '' ),
				'sync_enabled'       => ! empty( $body['sync_enabled'] ) ? 1 : 0,
			)
		);
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * Maps for one WC product (API seller platforms).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_maps( $request ) {
		$id = (int) $request['id'];
		if ( $id <= 0 || ! class_exists( 'WNC_Mapper' ) ) {
			return new WP_Error( 'wnc_bad_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$api_platforms = array( 'digikala', 'basalam', 'technolife', 'tapsishop', 'snappshop' );
		$rows          = WNC_Mapper::get_for_product( $id );
		$by_platform   = array();
		foreach ( $api_platforms as $slug ) {
			$by_platform[ $slug ] = array(
				'platform'          => $slug,
				'wc_product_id'     => $id,
				'wc_variation_id'   => 0,
				'remote_product_id' => '',
				'remote_variant_id' => '',
				'remote_url'        => '',
				'sync_enabled'      => 1,
				'can_create'        => false,
			);
			if ( class_exists( 'WNC_Platform_Registry' ) ) {
				$adapter = WNC_Platform_Registry::get( $slug );
				if ( $adapter && method_exists( $adapter, 'supports_create_product' ) ) {
					$by_platform[ $slug ]['can_create'] = (bool) $adapter->supports_create_product();
				} elseif ( $adapter && method_exists( $adapter, 'create_product' ) ) {
					$by_platform[ $slug ]['can_create'] = true;
				}
			}
		}
		foreach ( (array) $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$slug = sanitize_key( (string) ( $row['platform'] ?? '' ) );
			if ( ! isset( $by_platform[ $slug ] ) ) {
				continue;
			}
			if ( (int) ( $row['wc_variation_id'] ?? 0 ) !== 0 ) {
				continue;
			}
			$by_platform[ $slug ] = array_merge( $by_platform[ $slug ], $row );
		}
		return new WP_REST_Response(
			array(
				'product_id' => $id,
				'maps'       => array_values( $by_platform ),
			)
		);
	}

	/**
	 * Save maps for one product.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function save_product_maps( $request ) {
		$id = (int) $request['id'];
		if ( $id <= 0 || ! class_exists( 'WNC_Mapper' ) ) {
			return new WP_Error( 'wnc_bad_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$body = $request->get_json_params();
		$maps = is_array( $body ) && isset( $body['maps'] ) && is_array( $body['maps'] ) ? $body['maps'] : array();
		$allowed = array( 'digikala', 'basalam', 'technolife', 'tapsishop', 'snappshop' );
		foreach ( $maps as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$platform = sanitize_key( (string) ( $row['platform'] ?? '' ) );
			if ( ! in_array( $platform, $allowed, true ) ) {
				continue;
			}
			$remote_product = sanitize_text_field( (string) ( $row['remote_product_id'] ?? '' ) );
			$remote_variant = sanitize_text_field( (string) ( $row['remote_variant_id'] ?? '' ) );
			$remote_url     = isset( $row['remote_url'] ) ? esc_url_raw( (string) $row['remote_url'] ) : '';
			if ( '' === $remote_product && '' === $remote_variant && '' === $remote_url ) {
				WNC_Mapper::delete( $id, 0, $platform );
				continue;
			}
			$variation_id = (int) ( $row['wc_variation_id'] ?? 0 );
			if ( 'digikala' === $platform && class_exists( 'Digikala_Product_Map' ) ) {
				$parsed = Digikala_Product_Map::parse_product_id( $remote_product );
				if ( '' !== $parsed ) {
					$remote_product = $parsed;
				}
			}
			WNC_Mapper::upsert(
				array(
					'wc_product_id'     => $id,
					'wc_variation_id'   => $variation_id,
					'platform'          => $platform,
					'remote_product_id' => $remote_product,
					'remote_variant_id' => $remote_variant,
					'remote_url'        => $remote_url,
					'sync_enabled'      => ! empty( $row['sync_enabled'] ) ? 1 : 0,
				)
			);
			if ( 'digikala' === $platform && class_exists( 'Digikala_Product_Map' ) ) {
				Digikala_Product_Map::upsert( $id, $variation_id, $remote_product, $remote_variant );
			}
		}
		return self::product_maps( $request );
	}

	/**
	 * Queue price/stock push for one product.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_sync_now( $request ) {
		$id = (int) $request['id'];
		if ( $id <= 0 ) {
			return new WP_Error( 'wnc_bad_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( class_exists( 'WNC_Price_Sync' ) ) {
			WNC_Price_Sync::enqueue_for_product( $id );
		}
		if ( class_exists( 'WNC_Jobs' ) ) {
			WNC_Jobs::process( 5 );
		}
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * Create product on remote platform when adapter supports it.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_create_remote( $request ) {
		$id       = (int) $request['id'];
		$body     = $request->get_json_params();
		$platform = sanitize_key( (string) ( is_array( $body ) ? ( $body['platform'] ?? '' ) : '' ) );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$product = wc_get_product( $id );
		if ( ! $product ) {
			return new WP_Error( 'wnc_bad_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$adapter = WNC_Platform_Registry::get( $platform );
		if ( ! $adapter || ! method_exists( $adapter, 'create_product' ) ) {
			return new WP_Error( 'wnc_no_create', __( 'Remote create is not supported for this platform.', 'webino-dashboard' ), array( 'status' => 501 ) );
		}
		if ( method_exists( $adapter, 'supports_create_product' ) && ! $adapter->supports_create_product() ) {
			return new WP_Error( 'wnc_no_create', __( 'Remote create is not supported for this platform.', 'webino-dashboard' ), array( 'status' => 501 ) );
		}
		$result = $adapter->create_product( $product );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		if ( ! is_array( $result ) ) {
			return new WP_Error( 'wnc_create_failed', __( 'Remote create failed.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		WNC_Mapper::upsert(
			array(
				'wc_product_id'     => $id,
				'wc_variation_id'   => 0,
				'platform'          => $platform,
				'remote_product_id' => (string) ( $result['remote_product_id'] ?? '' ),
				'remote_variant_id' => (string) ( $result['remote_variant_id'] ?? '' ),
				'remote_url'        => (string) ( $result['remote_url'] ?? '' ),
				'sync_enabled'      => 1,
			)
		);
		return self::product_maps( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_jobs( $request ) {
		$platform = sanitize_key( (string) $request['platform'] );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$jobs = array();
		if ( class_exists( 'WNC_Jobs' ) && method_exists( 'WNC_Jobs', 'recent' ) ) {
			foreach ( (array) WNC_Jobs::recent( 80 ) as $job ) {
				if ( ! is_array( $job ) ) {
					continue;
				}
				if ( $platform && isset( $job['platform'] ) && $platform !== $job['platform'] ) {
					continue;
				}
				$jobs[] = $job;
				if ( count( $jobs ) >= 50 ) {
					break;
				}
			}
		}
		return new WP_REST_Response( array( 'jobs' => $jobs ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_logs( $request ) {
		$platform = sanitize_key( (string) $request['platform'] );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$logs = class_exists( 'WNC_Logger' ) && method_exists( 'WNC_Logger', 'recent' )
			? WNC_Logger::recent( 50, $platform )
			: array();
		return new WP_REST_Response( array( 'logs' => $logs ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function feed_url( $request ) {
		$platform = sanitize_key( (string) $request['platform'] );
		$ok       = self::assert_platform( $platform );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$map = array(
			'zarehbin'          => rest_url( 'zarehbin/v1/products' ),
			'emalls'            => rest_url( 'emalls_ext/v1/products' ),
			'snapppay-search'   => rest_url( 'v1/product/feed' ),
			'torob'             => rest_url( 'wcpe/v1/products' ),
		);
		$settings = class_exists( 'WNC_Settings' ) ? WNC_Settings::get_platform( $platform ) : array();
		$payload  = array(
			'platform' => $platform,
			'url'      => isset( $map[ $platform ] ) ? $map[ $platform ] : '',
			'enabled'  => ! empty( $settings['enabled'] ),
		);
		if ( empty( $settings['enabled'] ) && isset( $map[ $platform ] ) ) {
			$payload['note'] = __( 'Platform is disabled — crawler requests return HTTP 403 until you enable it.', 'webino-dashboard' );
		}
		if ( 'torob' === $platform ) {
			$payload['order_status_url'] = rest_url( 'torob-api/v1/order-status' );
			$payload['orders_list_url']  = rest_url( 'torob-api/v1/orders' );
			if ( empty( $payload['note'] ) ) {
				$payload['note'] = __( 'Torob pulls site orders via these GET endpoints (official plugin pattern). Enable Torob in Connector settings.', 'webino-dashboard' );
			}
		}
		return new WP_REST_Response( $payload );
	}

	/**
	 * Torob product feed preview (first 5 products, official admin tool parity).
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public static function torob_preview() {
		if ( ! class_exists( 'WNC_Torob_Bootstrap' ) || ! method_exists( 'WNC_Torob_Bootstrap', 'feed' ) ) {
			return new WP_Error( 'wnc_torob', 'Torob feed unavailable', array( 'status' => 503 ) );
		}
		$feed = WNC_Torob_Bootstrap::feed();
		if ( ! $feed || ! method_exists( $feed, 'get_all_products' ) ) {
			return new WP_Error( 'wnc_torob', 'Torob feed unavailable', array( 'status' => 503 ) );
		}
		$data = $feed->get_all_products( true, 5, 1, true );
		return new WP_REST_Response(
			array(
				'products' => $data['products'] ?? array(),
				'count'    => $data['count'] ?? 0,
			)
		);
	}

	/**
	 * Torob webhook queue status.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public static function torob_queue() {
		if ( ! class_exists( 'WNC_Torob_Bootstrap' ) || ! method_exists( 'WNC_Torob_Bootstrap', 'webhook' ) ) {
			return new WP_REST_Response(
				array(
					'pending'   => 0,
					'last_run'  => null,
					'next_hint' => null,
					'items'     => array(),
				)
			);
		}
		$webhook = WNC_Torob_Bootstrap::webhook();
		$pending = $webhook && method_exists( $webhook, 'get_pending_queue_product_count' )
			? (int) $webhook->get_pending_queue_product_count()
			: 0;
		$last = $webhook && method_exists( $webhook, 'get_queue_runner_last_run_timestamp' )
			? $webhook->get_queue_runner_last_run_timestamp()
			: null;
		$items = $webhook && method_exists( $webhook, 'get_pending_queue_products' )
			? $webhook->get_pending_queue_products( 10, 0 )
			: array();
		$next = null;
		if ( function_exists( 'wp_next_scheduled' ) && class_exists( 'WNC_Torob_Webhook_Queue_Services' ) ) {
			$ts = wp_next_scheduled( WNC_Torob_Webhook_Queue_Services::CRON_HOOK );
			$next = $ts ? gmdate( 'c', (int) $ts ) : null;
		}
		return new WP_REST_Response(
			array(
				'pending'   => $pending,
				'last_run'  => $last ? gmdate( 'c', (int) $last ) : null,
				'next_hint' => $next,
				'items'     => $items,
			)
		);
	}
}
