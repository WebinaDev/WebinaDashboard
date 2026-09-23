<?php
/**
 * REST API for transport / packaging / tools / map / cities / rules.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shipping module REST routes.
 */
class Webino_Dashboard_REST_Shipping {

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
			'/shipping/packaging/settings',
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
			'/shipping/orders/(?P<id>\d+)/packaging',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'order_packaging_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage_orders' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_packaging_recalc' ),
					'permission_callback' => array( __CLASS__, 'perm_manage_orders' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/tools/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'tools_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
				array(
					'methods'             => array( 'POST', 'PUT' ),
					'callback'            => array( __CLASS__, 'tools_put' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/map/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'map_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
				array(
					'methods'             => array( 'POST', 'PUT' ),
					'callback'            => array( __CLASS__, 'map_put' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/map/distance',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'map_distance' ),
					'permission_callback' => array( __CLASS__, 'perm_manage_orders' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/rules',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'rules_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
				array(
					'methods'             => array( 'POST', 'PUT' ),
					'callback'            => array( __CLASS__, 'rules_put' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/cities/tree',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'cities_tree' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/cities/state/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'cities_state' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/cities/reinstall',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'cities_reinstall' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/cities/seed-batch',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'cities_seed_batch' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/cities/bulk/(?P<state_id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'cities_bulk_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
				array(
					'methods'             => array( 'POST', 'PUT' ),
					'callback'            => array( __CLASS__, 'cities_bulk_put' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/cities/create-zones',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'cities_create_zones' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/cities/district',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'district_add' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/cities/district/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'district_delete' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/cities/search',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'cities_search' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shipping/orders/(?P<id>\d+)/map',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'order_map_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage_orders' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_map_put' ),
					'permission_callback' => array( __CLASS__, 'perm_manage_orders' ),
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
	public static function perm_manage_orders() {
		return class_exists( 'Webino_Dashboard_Rest_Base', false )
			&& ( Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' ) || Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' ) );
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
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function settings_get( $request ) {
		unset( $request );
		return rest_ensure_response( array( 'settings' => Webino_Shipping_Packaging_Settings::get() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function settings_put( $request ) {
		$body  = self::body( $request );
		$input = isset( $body['settings'] ) && is_array( $body['settings'] ) ? $body['settings'] : $body;
		return rest_ensure_response( array( 'settings' => Webino_Shipping_Packaging_Settings::update( $input ) ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_packaging_get( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return rest_ensure_response( array( 'plan' => Webino_Shipping_Packer::get_order_plan( $order ) ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_packaging_recalc( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$plan = Webino_Shipping_Packer::pack_from_order( $order );
		$order->update_meta_data( Webino_Shipping_Packer::ORDER_META, wp_json_encode( $plan ) );
		$order->save();
		return rest_ensure_response( array( 'plan' => $plan ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function tools_get() {
		return rest_ensure_response( array( 'settings' => Webino_Shipping_Tools::get() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function tools_put( $request ) {
		$body  = self::body( $request );
		$input = isset( $body['settings'] ) && is_array( $body['settings'] ) ? $body['settings'] : $body;
		return rest_ensure_response( array( 'settings' => Webino_Shipping_Tools::update( $input ) ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function map_get() {
		return rest_ensure_response( array( 'settings' => Webino_Shipping_Map::get() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function map_put( $request ) {
		$body  = self::body( $request );
		$input = isset( $body['settings'] ) && is_array( $body['settings'] ) ? $body['settings'] : $body;
		return rest_ensure_response( array( 'settings' => Webino_Shipping_Map::update( $input ) ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function map_distance( $request ) {
		$body = self::body( $request );
		$lat  = (float) ( $body['lat'] ?? 0 );
		$lng  = (float) ( $body['lng'] ?? 0 );
		return rest_ensure_response( Webino_Shipping_Map::distance_from_store( $lat, $lng ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function rules_get() {
		return rest_ensure_response( array( 'rules' => Webino_Shipping_Rules::get() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function rules_put( $request ) {
		$body  = self::body( $request );
		$rules = isset( $body['rules'] ) && is_array( $body['rules'] ) ? $body['rules'] : $body;
		return rest_ensure_response( array( 'rules' => Webino_Shipping_Rules::update( $rules ) ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function cities_tree() {
		Webino_Shipping_Cities::register_taxonomy();
		$status = Webino_Shipping_Cities::seed_status();
		return rest_ensure_response(
			array(
				'states'       => Webino_Shipping_Cities::get_states(),
				'installed'    => $status['installed'],
				'needs_seed'   => $status['needs_seed'],
				'next_key'     => $status['next_key'],
				'states_done'  => $status['states_done'],
				'states_total' => $status['states_total'],
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function cities_state( $request ) {
		$state_id = (int) $request['id'];
		$cities   = Webino_Shipping_Cities::get_cities( $state_id );
		foreach ( $cities as &$city ) {
			$city['districts'] = Webino_Shipping_Cities::get_districts( (int) $city['id'] );
		}
		return rest_ensure_response( array( 'cities' => $cities ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function cities_reinstall( $request ) {
		$body  = self::body( $request );
		$force = ! empty( $body['force'] );
		return rest_ensure_response( Webino_Shipping_Cities::reinstall( $force ) );
	}

	/**
	 * Seed one province batch.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function cities_seed_batch( $request ) {
		$body = self::body( $request );
		$key  = isset( $body['state_key'] ) ? (string) $body['state_key'] : '';
		return rest_ensure_response( Webino_Shipping_Cities::seed_batch( '' !== $key ? $key : null ) );
	}

	/**
	 * List zone method instances for bulk price columns.
	 *
	 * @return list<array{key:string,label:string,method_id:string,instance_id:int}>
	 */
	private static function zone_method_columns() {
		$out = array();
		if ( ! class_exists( 'WC_Shipping_Zones', false ) ) {
			return $out;
		}
		foreach ( WC_Shipping_Zones::get_zones() as $zone ) {
			$zone_obj = new WC_Shipping_Zone( (int) ( $zone['zone_id'] ?? $zone['id'] ?? 0 ) );
			foreach ( $zone_obj->get_shipping_methods( true ) as $method ) {
				$out[] = array(
					'key'         => (string) $method->instance_id,
					'label'       => $zone_obj->get_zone_name() . ' — ' . $method->get_title(),
					'method_id'   => (string) $method->id,
					'instance_id' => (int) $method->instance_id,
				);
			}
		}
		return $out;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function cities_bulk_get( $request ) {
		Webino_Shipping_Cities::register_taxonomy();
		$state_id = (int) $request['state_id'];
		$columns  = self::zone_method_columns();
		$cities   = Webino_Shipping_Cities::get_cities( $state_id );
		$rows     = array();
		foreach ( $cities as $city ) {
			$prices = array();
			foreach ( $columns as $col ) {
				$key = $col['key'];
				$prices[ $key ] = Webino_Shipping_Cities::get_term_option( (int) $city['id'], $key, '' );
				$prices[ $key . '_on' ] = Webino_Shipping_Cities::get_term_option( (int) $city['id'], $key . '_on', '' );
			}
			$rows[] = array(
				'id'      => (int) $city['id'],
				'name'    => $city['name'],
				'prices'  => $prices,
			);
			foreach ( Webino_Shipping_Cities::get_districts( (int) $city['id'] ) as $d ) {
				$prices_d = array();
				foreach ( $columns as $col ) {
					$key = $col['key'];
					$prices_d[ $key ] = Webino_Shipping_Cities::get_term_option( (int) $d['id'], $key, '' );
					$prices_d[ $key . '_on' ] = Webino_Shipping_Cities::get_term_option( (int) $d['id'], $key . '_on', '' );
				}
				$rows[] = array(
					'id'     => (int) $d['id'],
					'name'   => '— ' . $d['name'],
					'prices' => $prices_d,
				);
			}
		}
		return rest_ensure_response(
			array(
				'columns' => $columns,
				'rows'    => $rows,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function cities_bulk_put( $request ) {
		$state_id = (int) $request['state_id'];
		$body     = self::body( $request );
		$payload  = isset( $body['prices'] ) && is_array( $body['prices'] ) ? $body['prices'] : $body;
		Webino_Shipping_Cities::save_bulk( $state_id, $payload );
		return self::cities_bulk_get( $request );
	}

	/**
	 * Create WC zones from selected city term IDs (named after city).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function cities_create_zones( $request ) {
		$body = self::body( $request );
		$ids  = isset( $body['city_ids'] ) && is_array( $body['city_ids'] ) ? $body['city_ids'] : array();
		$created = array();
		if ( ! class_exists( 'WC_Shipping_Zone', false ) ) {
			return rest_ensure_response( array( 'ok' => false, 'created' => array() ) );
		}
		foreach ( $ids as $tid ) {
			$term = get_term( (int) $tid, Webino_Shipping_Cities::TAXONOMY );
			if ( ! $term || is_wp_error( $term ) ) {
				continue;
			}
			$zone = new WC_Shipping_Zone();
			$zone->set_zone_name( $term->name );
			// Bind zone to Iran + province; city match enforced via webino_shipping_zone_city_* filter.
			$parent = $term->parent ? get_term( (int) $term->parent, Webino_Shipping_Cities::TAXONOMY ) : null;
			$zone->add_location( 'IR', 'country' );
			if ( $parent && ! is_wp_error( $parent ) && $parent->slug ) {
				$slug = strtoupper( (string) $parent->slug );
				$zone->add_location( 'IR:' . $slug, 'state' );
				// Also try common WooCommerce IR state codes when slug differs.
				$aliases = array(
					'TEHRAN' => 'THR',
					'TEH'    => 'THR',
					'ALBORZ' => 'ALB',
					'ISFAHAN'=> 'ESF',
					'ESF'    => 'ESF',
				);
				if ( isset( $aliases[ $slug ] ) && $aliases[ $slug ] !== $slug ) {
					$zone->add_location( 'IR:' . $aliases[ $slug ], 'state' );
				}
			}
			// City name as postcode wildcard helps some storefronts that put city in postcode.
			if ( $term->name ) {
				$zone->add_location( (string) $term->name, 'postcode' );
			}
			$zone_id = $zone->save();
			update_option( 'webino_shipping_zone_city_' . (int) $zone_id, (int) $term->term_id, false );
			$created[] = array(
				'zone_id' => (int) $zone_id,
				'name'    => $term->name,
				'city_id' => (int) $term->term_id,
			);
		}
		return rest_ensure_response( array( 'ok' => true, 'created' => $created ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function district_add( $request ) {
		$body = self::body( $request );
		$city = (int) ( $body['city_id'] ?? 0 );
		$name = (string) ( $body['name'] ?? '' );
		return rest_ensure_response( Webino_Shipping_Cities::add_district( $city, $name ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function district_delete( $request ) {
		return rest_ensure_response( Webino_Shipping_Cities::delete_district( (int) $request['id'] ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function cities_search( $request ) {
		Webino_Shipping_Cities::register_taxonomy();
		$q = (string) $request->get_param( 'q' );
		$state = (int) $request->get_param( 'state' );
		return rest_ensure_response( array( 'items' => Webino_Shipping_Cities::search( $q, $state, 40 ) ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_map_get( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$loc = (string) $order->get_meta( Webino_Shipping_Map::META );
		$parts = array_map( 'floatval', array_pad( explode( ',', $loc ), 2, 0 ) );
		return rest_ensure_response(
			array(
				'location' => $loc,
				'lat'      => $parts[0],
				'lng'      => $parts[1],
				'settings' => Webino_Shipping_Map::get(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_map_put( $request ) {
		$order = wc_get_order( (int) $request['id'] );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body = self::body( $request );
		$lat  = (float) ( $body['lat'] ?? 0 );
		$lng  = (float) ( $body['lng'] ?? 0 );
		$loc  = $lat . ',' . $lng;
		$order->update_meta_data( Webino_Shipping_Map::META, $loc );
		$order->save();
		return rest_ensure_response( array( 'ok' => true, 'location' => $loc ) );
	}
}
