<?php
/**
 * REST API for Tapin module.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tapin REST routes.
 */
class Webino_Dashboard_REST_Tapin {

	const NS = 'webino-dashboard/v1';

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
			'/shipping/tapin/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'settings_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
				array(
					'methods'             => array( 'POST', 'PUT' ),
					'callback'            => array( __CLASS__, 'settings_put' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/test',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'test_connection' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/shops',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'shops_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/locations/sync',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'locations_sync' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/provinces',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'provinces_get' ),
					'permission_callback' => array( __CLASS__, 'perm_read_locations' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/cities',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'cities_get' ),
					'permission_callback' => array( __CLASS__, 'perm_read_locations' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/tariffs',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'tariffs_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
				array(
					'methods'             => array( 'POST', 'PUT' ),
					'callback'            => array( __CLASS__, 'tariffs_put' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/orders/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'order_get' ),
					'permission_callback' => array( __CLASS__, 'perm_orders' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/orders/(?P<id>\d+)/register',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_register' ),
					'permission_callback' => array( __CLASS__, 'perm_orders' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/orders/(?P<id>\d+)/label',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_label' ),
					'permission_callback' => array( __CLASS__, 'perm_orders' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/orders/(?P<id>\d+)/refresh',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_refresh' ),
					'permission_callback' => array( __CLASS__, 'perm_orders' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/orders/(?P<id>\d+)/location',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_location' ),
					'permission_callback' => array( __CLASS__, 'perm_orders' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/orders/(?P<id>\d+)/ready',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_ready' ),
					'permission_callback' => array( __CLASS__, 'perm_orders' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/orders/(?P<id>\d+)/meta',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_meta' ),
					'permission_callback' => array( __CLASS__, 'perm_orders' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/packing-boxes',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'packing_boxes_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/packing-boxes/sync',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'packing_boxes_sync' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tapin/credit',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'credit_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		self::register_extended_routes();
	}

	/**
	 * Extra Tapin API surface (edit/detail/list/kiosk/finance/catalog/tasks).
	 *
	 * @return void
	 */
	private static function register_extended_routes() {
		$routes = array(
			array( '/shipping/tapin/shop/detail', 'GET', 'shop_detail_get' ),
			array( '/shipping/tapin/shop/create', 'POST', 'shop_create' ),
			array( '/shipping/tapin/kiosks', 'GET', 'kiosks_get' ),
			array( '/shipping/tapin/orders-list', 'GET', 'tapin_orders_list' ),
			array( '/shipping/tapin/orders/bulk-status', 'POST', 'orders_bulk_status' ),
			array( '/shipping/tapin/orders/bulk-labels', 'POST', 'orders_bulk_labels' ),
			array( '/shipping/tapin/status/report', 'POST', 'status_report' ),
			array( '/shipping/tapin/status/change-report', 'GET', 'change_status_report' ),
			array( '/shipping/tapin/status/last-change', 'GET', 'last_change_status' ),
			array( '/shipping/tapin/credit/topup', 'POST', 'credit_topup' ),
			array( '/shipping/tapin/credit/history', 'GET', 'credit_history' ),
			array( '/shipping/tapin/products', 'GET', 'products_list' ),
			array( '/shipping/tapin/products/create', 'POST', 'products_create' ),
			array( '/shipping/tapin/products/update', 'POST', 'products_update' ),
			array( '/shipping/tapin/products/delete', 'POST', 'products_delete' ),
			array( '/shipping/tapin/products/categories', 'GET', 'product_categories' ),
			array( '/shipping/tapin/products/push-wc', 'POST', 'products_push_wc' ),
			array( '/shipping/tapin/customers', 'GET', 'customers_list' ),
			array( '/shipping/tapin/customers/categories', 'GET', 'customer_categories' ),
			array( '/shipping/tapin/employees', 'GET', 'employees_list' ),
			array( '/shipping/tapin/tasks', 'GET', 'tasks_list' ),
			array( '/shipping/tapin/tasks/detail', 'POST', 'tasks_detail' ),
			array( '/shipping/tapin/labels/by-date', 'POST', 'labels_by_date' ),
			array( '/shipping/tapin/barcode-html', 'POST', 'barcode_html' ),
		);
		foreach ( $routes as $r ) {
			register_rest_route(
				self::NS,
				$r[0],
				array(
					array(
						'methods'             => $r[1],
						'callback'            => array( __CLASS__, $r[2] ),
						'permission_callback' => array( __CLASS__, 'perm_manage' ),
					),
				)
			);
		}

		register_rest_route(
			self::NS,
			'/shipping/tapin/orders/(?P<id>\d+)/edit',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_edit' ),
					'permission_callback' => array( __CLASS__, 'perm_orders' ),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/shipping/tapin/orders/(?P<id>\d+)/detail',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_detail' ),
					'permission_callback' => array( __CLASS__, 'perm_orders' ),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/shipping/tapin/orders/(?P<id>\d+)/clear',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_clear' ),
					'permission_callback' => array( __CLASS__, 'perm_orders' ),
				),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function perm_manage() {
		return class_exists( 'Webino_Dashboard_Rest_Base', false ) && Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
	}

	/**
	 * @return bool
	 */
	public static function perm_orders() {
		return class_exists( 'Webino_Dashboard_Rest_Base', false )
			&& ( Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' ) || Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' ) );
	}

	/**
	 * @return bool
	 */
	public static function perm_read_locations() {
		return is_user_logged_in() || self::perm_manage() || self::perm_orders();
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return array<string, mixed>
	 */
	private static function body( $request ) {
		$body = $request->get_json_params();
		if ( ( ! is_array( $body ) || array() === $body ) && method_exists( $request, 'get_body' ) ) {
			$decoded = json_decode( (string) $request->get_body(), true );
			if ( is_array( $decoded ) ) {
				$body = $decoded;
			}
		}
		return is_array( $body ) ? $body : array();
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		$settings = Webino_Tapin_Settings::get();
		$credit   = null;
		if ( ! empty( $settings['show_credit'] ) && Webino_Tapin_Settings::is_connected() ) {
			$credit = Webino_Tapin_Client::credit_amount();
		}
		return rest_ensure_response(
			array(
				'settings'  => $settings,
				'connected' => Webino_Tapin_Settings::is_connected(),
				'credit'    => $credit,
				'locations' => array(
					'count' => count( Webino_Tapin_Locations::provinces() ),
				),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function settings_put( $request ) {
		$body = self::body( $request );
		$input = isset( $body['settings'] ) && is_array( $body['settings'] ) ? $body['settings'] : $body;
		$saved = Webino_Tapin_Settings::update( $input );
		return rest_ensure_response(
			array(
				'settings'  => $saved,
				'connected' => Webino_Tapin_Settings::is_connected(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function test_connection( $request ) {
		$body = self::body( $request );
		if ( ! empty( $body['token'] ) ) {
			Webino_Tapin_Settings::update( array( 'token' => sanitize_text_field( (string) $body['token'] ) ) );
		}
		$res = Webino_Tapin_Client::shop_list();
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['ok'] ? __( 'اتصال برقرار شد.', 'webino-dashboard' ) : $res['message'],
				'shops'   => self::normalize_shops( $res['entries'] ),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function shops_get() {
		$res = Webino_Tapin_Client::shop_list();
		return rest_ensure_response(
			array(
				'ok'    => $res['ok'],
				'message' => $res['message'],
				'shops' => self::normalize_shops( $res['entries'] ),
			)
		);
	}

	/**
	 * @param mixed $entries Entries.
	 * @return list<array{id:string,title:string}>
	 */
	private static function normalize_shops( $entries ) {
		$list = array();
		if ( ! is_array( $entries ) ) {
			return $list;
		}
		$rows = isset( $entries['list'] ) && is_array( $entries['list'] ) ? $entries['list'] : $entries;
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$id = (string) ( $row['id'] ?? $row['shop_id'] ?? '' );
			$title = (string) ( $row['title'] ?? $row['name'] ?? $id );
			if ( '' === $id ) {
				continue;
			}
			$list[] = array(
				'id'    => $id,
				'title' => $title,
			);
		}
		return $list;
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function locations_sync() {
		$result = Webino_Tapin_Locations::sync_from_tapin();
		return rest_ensure_response( $result );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function provinces_get() {
		return rest_ensure_response( array( 'items' => Webino_Tapin_Locations::provinces() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function cities_get( $request ) {
		$p = (int) $request->get_param( 'province' );
		return rest_ensure_response( array( 'items' => Webino_Tapin_Locations::cities( $p ) ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function tariffs_get() {
		return rest_ensure_response( array( 'tariffs' => Webino_Tapin_Settings::get_tariffs() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function tariffs_put( $request ) {
		$body = self::body( $request );
		$input = isset( $body['tariffs'] ) && is_array( $body['tariffs'] ) ? $body['tariffs'] : $body;
		return rest_ensure_response( array( 'tariffs' => Webino_Tapin_Settings::update_tariffs( $input ) ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_get( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return rest_ensure_response(
			array(
				'shipment'  => Webino_Tapin_Shipments::summarize( $order ),
				'provinces' => Webino_Tapin_Locations::provinces(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_register( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body = self::body( $request );
		if ( $body ) {
			Webino_Tapin_Shipments::save_order_meta( $order, $body );
		}
		$result = Webino_Tapin_Shipments::register_for_order( $order, $body );
		$result['shipment'] = Webino_Tapin_Shipments::summarize( $order );
		return rest_ensure_response( $result );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_label( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body = self::body( $request );
		$kind = sanitize_key( (string) ( $body['kind'] ?? $request->get_param( 'kind' ) ?? 'html' ) );
		return rest_ensure_response( Webino_Tapin_Shipments::fetch_label( $order, $kind ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_refresh( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$result = Webino_Tapin_Shipments::refresh_status( $order );
		$result['shipment'] = Webino_Tapin_Shipments::summarize( $order );
		return rest_ensure_response( $result );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_location( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body = self::body( $request );
		$p = (int) ( $body['province_code'] ?? 0 );
		$c = (int) ( $body['city_code'] ?? 0 );
		if ( $p > 0 ) {
			$order->update_meta_data( Webino_Tapin_Locations::META_PROVINCE, $p );
			$order->update_meta_data( '_billing_state_id', $p );
			$order->update_meta_data( '_shipping_state_id', $p );
			foreach ( Webino_Tapin_Locations::provinces() as $prov ) {
				if ( (int) $prov['code'] === $p ) {
					$order->set_shipping_state( $prov['title'] );
					break;
				}
			}
		}
		if ( $c > 0 ) {
			$order->update_meta_data( Webino_Tapin_Locations::META_CITY, $c );
			$order->update_meta_data( '_billing_city_id', $c );
			$order->update_meta_data( '_shipping_city_id', $c );
			foreach ( Webino_Tapin_Locations::cities( $p ) as $city ) {
				if ( (int) $city['code'] === $c ) {
					$order->set_shipping_city( $city['title'] );
					break;
				}
			}
		}
		$order->save();
		return rest_ensure_response(
			array(
				'ok'       => true,
				'message'  => __( 'آدرس ذخیره شد.', 'webino-dashboard' ),
				'shipment' => Webino_Tapin_Shipments::summarize( $order ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_ready( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$result = Webino_Tapin_Shipments::ready_to_ship( $order );
		$result['shipment'] = Webino_Tapin_Shipments::summarize( $order );
		return rest_ensure_response( $result );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_meta( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		Webino_Tapin_Shipments::save_order_meta( $order, self::body( $request ) );
		return rest_ensure_response(
			array(
				'ok'       => true,
				'message'  => __( 'ذخیره شد.', 'webino-dashboard' ),
				'shipment' => Webino_Tapin_Shipments::summarize( $order ),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function packing_boxes_get() {
		return rest_ensure_response( array( 'boxes' => Webino_Tapin_Shipments::get_packing_boxes() ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function packing_boxes_sync() {
		return rest_ensure_response( Webino_Tapin_Shipments::sync_packing_boxes() );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function credit_get() {
		return rest_ensure_response(
			array(
				'credit' => Webino_Tapin_Client::credit_amount( true ),
			)
		);
	}

	/** @return WP_REST_Response */
	public static function shop_detail_get() {
		$res = Webino_Tapin_Client::shop_detail();
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'detail'  => $res['entries'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function shop_create( $request ) {
		$res = Webino_Tapin_Client::shop_create( self::body( $request ) );
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'entries' => $res['entries'],
			)
		);
	}

	/** @return WP_REST_Response */
	public static function kiosks_get() {
		$res  = Webino_Tapin_Client::kiosk_list();
		$list = Webino_Tapin_Catalog::normalize_list( $res['entries'] );
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'items'   => $list['list'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function tapin_orders_list( $request ) {
		$payload = array(
			'page'  => max( 1, (int) $request->get_param( 'page' ) ),
			'count' => max( 1, min( 100, (int) ( $request->get_param( 'count' ) ?: 20 ) ) ),
		);
		$status = $request->get_param( 'status' );
		if ( null !== $status && '' !== $status ) {
			$payload['status'] = (int) $status;
		}
		$res  = Webino_Tapin_Client::order_list( $payload );
		$list = Webino_Tapin_Catalog::normalize_list( $res['entries'] );
		return rest_ensure_response(
			array(
				'ok'          => $res['ok'],
				'message'     => $res['message'],
				'items'       => $list['list'],
				'page'        => $list['page'],
				'total_count' => $list['total_count'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function orders_bulk_status( $request ) {
		$body = self::body( $request );
		$ids  = isset( $body['order_ids'] ) && is_array( $body['order_ids'] ) ? $body['order_ids'] : array();
		$st   = (int) ( $body['status'] ?? 2 );
		return rest_ensure_response( Webino_Tapin_Shipments::change_status_bulk_for_orders( $ids, $st ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function orders_bulk_labels( $request ) {
		$body = self::body( $request );
		$ids  = isset( $body['order_ids'] ) && is_array( $body['order_ids'] ) ? $body['order_ids'] : array();
		return rest_ensure_response( Webino_Tapin_Shipments::fetch_labels_bulk( $ids ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function status_report( $request ) {
		$body = self::body( $request );
		$res  = Webino_Tapin_Client::get_status_report( $body );
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'entries' => $res['entries'],
			)
		);
	}

	/** @return WP_REST_Response */
	public static function change_status_report() {
		$res = Webino_Tapin_Client::change_status_report();
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'entries' => $res['entries'],
			)
		);
	}

	/** @return WP_REST_Response */
	public static function last_change_status() {
		$res = Webino_Tapin_Client::change_status_report_last();
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'entries' => $res['entries'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function credit_topup( $request ) {
		$body = self::body( $request );
		$price = (int) ( $body['price'] ?? 0 );
		$redirect = (string) ( $body['redirect_page'] ?? home_url( '/' ) );
		$res = Webino_Tapin_Client::credit_topup_start(
			array(
				'price'         => $price,
				'redirect_page' => $redirect,
			)
		);
		$url = '';
		if ( is_array( $res['entries'] ) ) {
			$url = (string) ( $res['entries']['url'] ?? '' );
		}
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'url'     => $url,
				'entries' => $res['entries'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function credit_history( $request ) {
		$res  = Webino_Tapin_Client::credit_increase_list(
			array(
				'page'  => max( 1, (int) $request->get_param( 'page' ) ),
				'count' => max( 1, min( 50, (int) ( $request->get_param( 'count' ) ?: 20 ) ) ),
			)
		);
		$list = Webino_Tapin_Catalog::normalize_list( $res['entries'] );
		return rest_ensure_response(
			array(
				'ok'          => $res['ok'],
				'message'     => $res['message'],
				'items'       => $list['list'],
				'page'        => $list['page'],
				'total_count' => $list['total_count'],
				'credit'      => Webino_Tapin_Client::credit_amount( true ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function products_list( $request ) {
		$res  = Webino_Tapin_Client::product_list(
			array(
				'page'  => max( 1, (int) $request->get_param( 'page' ) ),
				'count' => max( 1, min( 100, (int) ( $request->get_param( 'count' ) ?: 50 ) ) ),
			)
		);
		$list = Webino_Tapin_Catalog::normalize_list( $res['entries'] );
		return rest_ensure_response(
			array(
				'ok'          => $res['ok'],
				'message'     => $res['message'],
				'items'       => $list['list'],
				'page'        => $list['page'],
				'total_count' => $list['total_count'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function products_create( $request ) {
		$res = Webino_Tapin_Client::product_create( self::body( $request ) );
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'entries' => $res['entries'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function products_update( $request ) {
		$res = Webino_Tapin_Client::product_update( self::body( $request ) );
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'entries' => $res['entries'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function products_delete( $request ) {
		$res = Webino_Tapin_Client::product_delete( self::body( $request ) );
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'entries' => $res['entries'],
			)
		);
	}

	/** @return WP_REST_Response */
	public static function product_categories() {
		$res  = Webino_Tapin_Client::product_category_list();
		$list = Webino_Tapin_Catalog::normalize_list( $res['entries'] );
		return rest_ensure_response(
			array(
				'ok'    => $res['ok'],
				'items' => $list['list'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function products_push_wc( $request ) {
		$body = self::body( $request );
		$pid  = (int) ( $body['product_id'] ?? 0 );
		return rest_ensure_response( Webino_Tapin_Catalog::push_wc_product( $pid ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function customers_list( $request ) {
		$res  = Webino_Tapin_Client::customer_list(
			array(
				'page'  => max( 1, (int) $request->get_param( 'page' ) ),
				'count' => max( 1, min( 100, (int) ( $request->get_param( 'count' ) ?: 50 ) ) ),
			)
		);
		$list = Webino_Tapin_Catalog::normalize_list( $res['entries'] );
		return rest_ensure_response(
			array(
				'ok'          => $res['ok'],
				'message'     => $res['message'],
				'items'       => $list['list'],
				'page'        => $list['page'],
				'total_count' => $list['total_count'],
			)
		);
	}

	/** @return WP_REST_Response */
	public static function customer_categories() {
		$res  = Webino_Tapin_Client::customer_category_list();
		$list = Webino_Tapin_Catalog::normalize_list( $res['entries'] );
		return rest_ensure_response(
			array(
				'ok'    => $res['ok'],
				'items' => $list['list'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function employees_list( $request ) {
		$res  = Webino_Tapin_Client::employee_list(
			array(
				'page'  => max( 1, (int) $request->get_param( 'page' ) ),
				'count' => max( 1, min( 100, (int) ( $request->get_param( 'count' ) ?: 50 ) ) ),
			)
		);
		$list = Webino_Tapin_Catalog::normalize_list( $res['entries'] );
		return rest_ensure_response(
			array(
				'ok'          => $res['ok'],
				'message'     => $res['message'],
				'items'       => $list['list'],
				'page'        => $list['page'],
				'total_count' => $list['total_count'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function tasks_list( $request ) {
		$res  = Webino_Tapin_Client::task_list(
			array(
				'page'  => max( 1, (int) $request->get_param( 'page' ) ),
				'count' => max( 1, min( 100, (int) ( $request->get_param( 'count' ) ?: 20 ) ) ),
			)
		);
		$list = Webino_Tapin_Catalog::normalize_list( $res['entries'] );
		return rest_ensure_response(
			array(
				'ok'          => $res['ok'],
				'message'     => $res['message'],
				'items'       => $list['list'],
				'page'        => $list['page'],
				'total_count' => $list['total_count'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function tasks_detail( $request ) {
		$body = self::body( $request );
		$res  = Webino_Tapin_Client::task_detail( array( 'task_id' => (string) ( $body['task_id'] ?? '' ) ) );
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'detail'  => $res['entries'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function labels_by_date( $request ) {
		$body = self::body( $request );
		$res  = Webino_Tapin_Client::detail_label_date( $body );
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'html'    => Webino_Tapin_Client::extract_html( $res['entries'] ),
				'entries' => $res['entries'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function barcode_html( $request ) {
		$res = Webino_Tapin_Client::barcode_html( self::body( $request ) );
		return rest_ensure_response(
			array(
				'ok'      => $res['ok'],
				'message' => $res['message'],
				'html'    => Webino_Tapin_Client::extract_html( $res['entries'] ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_edit( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$result = Webino_Tapin_Shipments::edit_for_order( $order, self::body( $request ) );
		$result['shipment'] = Webino_Tapin_Shipments::summarize( $order );
		return rest_ensure_response( $result );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_detail( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$result = Webino_Tapin_Shipments::fetch_detail( $order );
		$result['shipment'] = Webino_Tapin_Shipments::summarize( $order );
		return rest_ensure_response( $result );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_clear( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$result = Webino_Tapin_Shipments::clear_local_shipment( $order );
		$result['shipment'] = Webino_Tapin_Shipments::summarize( $order );
		return rest_ensure_response( $result );
	}
}
