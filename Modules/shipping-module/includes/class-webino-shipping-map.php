<?php
/**
 * Checkout/order map pin + distance (OSM / Neshan / Map.ir).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webino_Shipping_Map {

	const OPTION = 'webino_shipping_map';
	const META   = '_webino_map_location';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_checkout' ) );
		add_action( 'woocommerce_checkout_process', array( __CLASS__, 'validate_checkout' ) );
		add_action( 'woocommerce_checkout_update_order_meta', array( __CLASS__, 'save_checkout' ) );
		add_action( 'woocommerce_after_order_notes', array( __CLASS__, 'render_checkout_field_after_notes' ), 20 );
		add_action( 'woocommerce_before_checkout_billing_form', array( __CLASS__, 'render_checkout_field_before' ), 5 );
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function defaults() {
		return array(
			'provider'              => 'osm',
			'neshan_api_key'        => '',
			'mapp_api_key'          => '',
			'ors_token'             => '',
			'checkout_placement'    => 'after_order_notes',
			'required_location'     => false,
			'shipping_methods'      => array(),
			'store_location'        => array( 'lat' => 35.6892, 'lng' => 51.3890 ),
			'store_marker_enable'   => true,
			'distance_mode'         => 'none',
			'enabled'               => true,
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function get() {
		$raw = get_option( self::OPTION, null );
		$out = self::defaults();
		if ( ! is_array( $raw ) ) {
			return $out;
		}
		foreach ( $out as $k => $d ) {
			if ( ! array_key_exists( $k, $raw ) ) {
				continue;
			}
			if ( is_array( $d ) && is_array( $raw[ $k ] ) ) {
				$out[ $k ] = array_merge( $d, $raw[ $k ] );
			} else {
				$out[ $k ] = $raw[ $k ];
			}
		}
		$out['enabled']             = (bool) $out['enabled'];
		$out['required_location']   = (bool) $out['required_location'];
		$out['store_marker_enable'] = (bool) $out['store_marker_enable'];
		$out['provider']            = in_array( $out['provider'], array( 'osm', 'neshan', 'mapp' ), true ) ? $out['provider'] : 'osm';
		return $out;
	}

	/**
	 * @param array<string, mixed> $input Input.
	 * @return array<string, mixed>
	 */
	public static function update( $input ) {
		$current = self::get();
		if ( ! is_array( $input ) ) {
			return $current;
		}
		$merged = array_merge( $current, $input );
		if ( isset( $input['store_location'] ) && is_array( $input['store_location'] ) ) {
			$merged['store_location'] = array_merge( $current['store_location'], $input['store_location'] );
		}
		$clean = self::defaults();
		foreach ( $clean as $k => $_d ) {
			if ( array_key_exists( $k, $merged ) ) {
				$clean[ $k ] = $merged[ $k ];
			}
		}
		update_option( self::OPTION, $clean, false );
		return self::get();
	}

	/**
	 * Tile layer config for current provider.
	 *
	 * @param array<string, mixed> $s Settings.
	 * @return array{url:string,attribution:string,options:array<string,mixed>}
	 */
	public static function tile_config( $s ) {
		$provider = (string) ( $s['provider'] ?? 'osm' );
		if ( 'neshan' === $provider && ! empty( $s['neshan_api_key'] ) ) {
			return array(
				'url'         => 'https://api.neshan.org/v4/static?key=' . rawurlencode( (string) $s['neshan_api_key'] ),
				'attribution' => '© Neshan',
				'options'     => array(
					'type'   => 'neshan',
					'apiKey' => (string) $s['neshan_api_key'],
				),
			);
		}
		if ( 'mapp' === $provider && ! empty( $s['mapp_api_key'] ) ) {
			return array(
				'url'         => 'https://map.ir/raster/styles/main/{z}/{x}/{y}',
				'attribution' => '© Map.ir',
				'options'     => array(
					'type'   => 'mapp',
					'apiKey' => (string) $s['mapp_api_key'],
				),
			);
		}
		return array(
			'url'         => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			'attribution' => '© OSM',
			'options'     => array( 'type' => 'osm' ),
		);
	}

	/**
	 * @return void
	 */
	public static function enqueue_checkout() {
		$s = self::get();
		if ( empty( $s['enabled'] ) || ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
			return;
		}
		wp_enqueue_style( 'leaflet', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', array(), '1.9.4' );
		wp_enqueue_script( 'leaflet', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', array(), '1.9.4', true );

		$tile = self::tile_config( $s );
		$config = array(
			'provider' => $s['provider'],
			'store'    => $s['store_location'],
			'required' => (bool) $s['required_location'],
			'tile'     => $tile,
			'i18n'     => array(
				'pick' => __( 'موقعیت را روی نقشه مشخص کنید', 'webino-dashboard' ),
			),
		);

		$js = 'window.webinoShippingMap=' . wp_json_encode( $config ) . ';'
			. <<<'JS'
document.addEventListener('DOMContentLoaded',function(){
  var el=document.getElementById('webino_shipping_map');
  if(!el||!window.L||!window.webinoShippingMap)return;
  var cfg=window.webinoShippingMap;
  var store=cfg.store||{lat:35.69,lng:51.39};
  var map=L.map(el).setView([store.lat,store.lng],13);
  var tile=cfg.tile||{};
  var opts=tile.options||{};
  var layerOpts={maxZoom:19,attribution:tile.attribution||''};
  if(opts.type==='mapp'&&opts.apiKey){
    layerOpts.headers={'x-api-key':opts.apiKey};
    // Map.ir raster via Leaflet GridLayer with custom headers is limited; use tile URL with key query if needed.
    L.tileLayer(tile.url+'?x-api-key='+encodeURIComponent(opts.apiKey),layerOpts).addTo(map);
  }else if(opts.type==='neshan'&&opts.apiKey){
    // Neshan vector SDK is heavy; use OSM-compatible raster proxy style when key present, else OSM.
    // Prefer Neshan raster tiles when available.
    L.tileLayer('https://static.neshan.org/raster/{z}/{x}/{y}.png',Object.assign({},layerOpts,{attribution:'© Neshan'})).addTo(map);
  }else{
    L.tileLayer(tile.url||'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',layerOpts).addTo(map);
  }
  if(cfg.store&&cfg.store.lat&&window.webinoShippingMap){
    try{L.marker([store.lat,store.lng],{opacity:0.6}).addTo(map);}catch(e){}
  }
  var marker=null;
  var input=document.getElementById('webino_map_location');
  function setM(latlng){
    if(marker)marker.setLatLng(latlng);else marker=L.marker(latlng).addTo(map);
    if(input)input.value=latlng.lat+','+latlng.lng;
  }
  map.on('click',function(e){setM(e.latlng);});
  if(input&&input.value){
    var p=input.value.split(',');
    if(p.length===2)setM({lat:parseFloat(p[0]),lng:parseFloat(p[1])});
  }
});
JS;
		wp_add_inline_script( 'leaflet', $js );
	}

	/**
	 * @return void
	 */
	public static function render_checkout_field_after_notes() {
		$s = self::get();
		if ( empty( $s['enabled'] ) || 'after_order_notes' !== $s['checkout_placement'] ) {
			return;
		}
		self::render_field();
	}

	/**
	 * @return void
	 */
	public static function render_checkout_field_before() {
		$s = self::get();
		if ( empty( $s['enabled'] ) || 'before_customer_details' !== $s['checkout_placement'] ) {
			return;
		}
		self::render_field();
	}

	/**
	 * @return void
	 */
	private static function render_field() {
		echo '<div class="form-row form-row-wide webino-shipping-map-wrap"><label>' . esc_html__( 'موقعیت روی نقشه', 'webino-dashboard' ) . '</label>';
		echo '<div id="webino_shipping_map" style="height:280px;width:100%;border-radius:8px;margin:8px 0;"></div>';
		echo '<input type="hidden" name="webino_map_location" id="webino_map_location" value="" />';
		echo '</div>';
	}

	/**
	 * @return void
	 */
	public static function validate_checkout() {
		$s = self::get();
		if ( empty( $s['enabled'] ) || empty( $s['required_location'] ) ) {
			return;
		}
		$loc = isset( $_POST['webino_map_location'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['webino_map_location'] ) ) : '';
		if ( '' === $loc || false === strpos( $loc, ',' ) ) {
			wc_add_notice( __( 'لطفاً موقعیت را روی نقشه مشخص کنید.', 'webino-dashboard' ), 'error' );
		}
	}

	/**
	 * @param int $order_id Order.
	 * @return void
	 */
	public static function save_checkout( $order_id ) {
		$loc = isset( $_POST['webino_map_location'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['webino_map_location'] ) ) : '';
		if ( '' === $loc ) {
			return;
		}
		$order = wc_get_order( $order_id );
		if ( $order ) {
			$order->update_meta_data( self::META, $loc );
			$order->save();
		}
	}

	/**
	 * @param float $lat1 Lat.
	 * @param float $lng1 Lng.
	 * @param float $lat2 Lat.
	 * @param float $lng2 Lng.
	 * @return float km
	 */
	public static function haversine_km( $lat1, $lng1, $lat2, $lng2 ) {
		$r    = 6371;
		$dlat = deg2rad( $lat2 - $lat1 );
		$dlng = deg2rad( $lng2 - $lng1 );
		$a    = sin( $dlat / 2 ) ** 2 + cos( deg2rad( $lat1 ) ) * cos( deg2rad( $lat2 ) ) * sin( $dlng / 2 ) ** 2;
		return $r * 2 * atan2( sqrt( $a ), sqrt( 1 - $a ) );
	}

	/**
	 * @param float $lat Lat.
	 * @param float $lng Lng.
	 * @return array{ok:bool,distance_km:float,mode:string,message?:string}
	 */
	public static function distance_from_store( $lat, $lng ) {
		$s     = self::get();
		$store = $s['store_location'];
		$mode  = (string) $s['distance_mode'];
		if ( 'none' === $mode ) {
			return array( 'ok' => true, 'distance_km' => 0, 'mode' => 'none' );
		}
		$direct = self::haversine_km( (float) $store['lat'], (float) $store['lng'], (float) $lat, (float) $lng );
		if ( 'direct' === $mode || empty( $s['ors_token'] ) ) {
			return array( 'ok' => true, 'distance_km' => round( $direct, 3 ), 'mode' => 'direct' );
		}
		$url  = 'https://api.openrouteservice.org/v2/directions/driving-car';
		$body = array(
			'coordinates' => array(
				array( (float) $store['lng'], (float) $store['lat'] ),
				array( (float) $lng, (float) $lat ),
			),
		);
		$res  = wp_remote_post(
			$url,
			array(
				'timeout' => 20,
				'headers' => array(
					'Authorization' => (string) $s['ors_token'],
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode( $body ),
			)
		);
		if ( is_wp_error( $res ) ) {
			return array( 'ok' => true, 'distance_km' => round( $direct, 3 ), 'mode' => 'direct', 'message' => $res->get_error_message() );
		}
		$raw    = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		$meters = $raw['routes'][0]['summary']['distance'] ?? null;
		if ( null === $meters ) {
			return array( 'ok' => true, 'distance_km' => round( $direct, 3 ), 'mode' => 'direct' );
		}
		return array( 'ok' => true, 'distance_km' => round( ( (float) $meters ) / 1000, 3 ), 'mode' => 'real' );
	}
}
