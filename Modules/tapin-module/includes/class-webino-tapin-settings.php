<?php
/**
 * Tapin module settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stores Tapin connection and shipping preferences.
 */
class Webino_Tapin_Settings {

	const OPTION = 'webino_tapin_settings';
	const TARIFFS_OPTION = 'webino_tapin_offline_tariffs';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_bar_menu', array( __CLASS__, 'admin_bar_credit' ), 999 );
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function defaults() {
		return array(
			'enabled'                 => true,
			'token'                   => '',
			'shop_id'                 => '',
			'shop_title'              => '',
			'gateway'                 => 'tapin',
			'show_credit'             => true,
			'use_pws_formula'         => true,
			'content_type'            => 1,
			'tipax_pickup_type'       => 10,
			'tipax_delivery_type'     => 10,
			'origin_province_code'    => 0,
			'origin_city_code'        => 0,
			'auto_register'           => false,
			'auto_register_status'    => 'processing',
			'register_type'           => 1,
			'default_pay_type'        => 1,
			'default_order_type'      => 0,
			'has_insurance'           => false,
			'employee_code'           => -1,
			'methods'                 => array(
				'pishtaz'   => true,
				'vip'       => true,
				'tipax'     => true,
				'courier'   => true,
				'tipax_api' => true,
				'alonomic'  => false,
			),
			'courier_base_price'      => 0,
			'courier_per_kg'          => 0,
			'free_shipping_min'       => 0,
			'rate_extra_percent'      => 0,
			'rate_extra_fixed'        => 0,
			'box_id_map'              => array(
				'1' => 1,
				'2' => 2,
				'3' => 3,
				'4' => 4,
				'5' => 5,
				'6' => 6,
				'7' => 7,
				'8' => 8,
				'9' => 9,
			),
			'default_box_id'          => 1,
			'default_kiosk_id'        => 0,
			'notify_customer_link'    => true,
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
		foreach ( $out as $key => $default ) {
			if ( ! array_key_exists( $key, $raw ) ) {
				continue;
			}
			if ( is_array( $default ) && is_array( $raw[ $key ] ) ) {
				$out[ $key ] = array_merge( $default, $raw[ $key ] );
			} else {
				$out[ $key ] = $raw[ $key ];
			}
		}
		$out['enabled']              = (bool) $out['enabled'];
		$out['auto_register']        = (bool) $out['auto_register'];
		$out['has_insurance']        = (bool) $out['has_insurance'];
		$out['show_credit']          = (bool) $out['show_credit'];
		$out['use_pws_formula']      = (bool) $out['use_pws_formula'];
		$out['notify_customer_link'] = (bool) $out['notify_customer_link'];
		$out['token']                = sanitize_text_field( (string) $out['token'] );
		$out['shop_id']              = sanitize_text_field( (string) $out['shop_id'] );
		$out['gateway']              = in_array( $out['gateway'], array( 'tapin', 'posteketab' ), true ) ? $out['gateway'] : 'tapin';
		$out['origin_province_code'] = (int) $out['origin_province_code'];
		$out['origin_city_code']     = (int) $out['origin_city_code'];
		$out['register_type']        = (int) $out['register_type'];
		$out['default_pay_type']     = (int) $out['default_pay_type'];
		$out['default_order_type']   = (int) $out['default_order_type'];
		$out['content_type']         = (int) $out['content_type'];
		$out['default_kiosk_id']     = (int) ( $out['default_kiosk_id'] ?? 0 );
		$out['tipax_pickup_type']    = (int) $out['tipax_pickup_type'];
		$out['tipax_delivery_type']  = (int) $out['tipax_delivery_type'];
		$out['courier_base_price']   = max( 0, (float) $out['courier_base_price'] );
		$out['courier_per_kg']       = max( 0, (float) $out['courier_per_kg'] );
		$out['free_shipping_min']    = max( 0, (float) $out['free_shipping_min'] );
		$out['rate_extra_percent']   = (float) $out['rate_extra_percent'];
		$out['rate_extra_fixed']     = max( 0, (float) $out['rate_extra_fixed'] );
		$out['default_box_id']       = max( 1, (int) $out['default_box_id'] );
		return $out;
	}

	/**
	 * @param array<string, mixed> $input Settings.
	 * @return array<string, mixed>
	 */
	public static function update( $input ) {
		$current = self::get();
		if ( ! is_array( $input ) ) {
			return $current;
		}
		$merged = array_merge( $current, $input );
		if ( isset( $input['methods'] ) && is_array( $input['methods'] ) ) {
			$merged['methods'] = array_merge( $current['methods'], $input['methods'] );
		}
		if ( isset( $input['box_id_map'] ) && is_array( $input['box_id_map'] ) ) {
			$merged['box_id_map'] = array_merge( $current['box_id_map'], $input['box_id_map'] );
		}
		$clean = self::defaults();
		foreach ( $clean as $key => $default ) {
			if ( ! array_key_exists( $key, $merged ) ) {
				continue;
			}
			$clean[ $key ] = $merged[ $key ];
		}
		update_option( self::OPTION, $clean, false );
		delete_transient( 'webino_tapin_credit' );
		return self::get();
	}

	/**
	 * @return bool
	 */
	public static function is_connected() {
		$s = self::get();
		return ! empty( $s['enabled'] ) && '' !== $s['token'] && '' !== $s['shop_id'];
	}

	/**
	 * @return bool
	 */
	public static function is_posteketab() {
		return 'posteketab' === self::get()['gateway'];
	}

	/**
	 * @param WP_Admin_Bar $bar Bar.
	 * @return void
	 */
	public static function admin_bar_credit( $bar ) {
		if ( ! is_a( $bar, 'WP_Admin_Bar' ) || ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		$s = self::get();
		if ( empty( $s['show_credit'] ) || ! self::is_connected() ) {
			return;
		}
		$credit = Webino_Tapin_Client::credit_amount();
		if ( null === $credit ) {
			return;
		}
		$label = self::is_posteketab() ? __( 'اعتبار پست کتاب', 'webino-dashboard' ) : __( 'اعتبار تاپین', 'webino-dashboard' );
		$bar->add_node(
			array(
				'id'    => 'webino-tapin-credit',
				'title' => $label . ': ' . ( function_exists( 'wc_price' ) ? wp_strip_all_tags( wc_price( $credit ) ) : (string) $credit ),
				'href'  => admin_url( 'admin.php?page=webino-dashboard#/settings/shop/transport/tapin' ),
			)
		);
	}

	/**
	 * Offline tariffs: method => list of {min_weight_g, max_weight_g, price, province_code?}
	 *
	 * @return array<string, list<array<string,mixed>>>
	 */
	public static function get_tariffs() {
		$raw = get_option( self::TARIFFS_OPTION, null );
		if ( ! is_array( $raw ) ) {
			return self::default_tariffs();
		}
		$out = self::default_tariffs();
		foreach ( array( 'pishtaz', 'vip', 'tipax', 'tipax_api', 'alonomic' ) as $method ) {
			if ( isset( $raw[ $method ] ) && is_array( $raw[ $method ] ) ) {
				$out[ $method ] = array_values( $raw[ $method ] );
			}
		}
		return $out;
	}

	/**
	 * @param array<string, mixed> $input Tariffs.
	 * @return array<string, list<array<string,mixed>>>
	 */
	public static function update_tariffs( $input ) {
		$current = self::get_tariffs();
		if ( ! is_array( $input ) ) {
			return $current;
		}
		foreach ( array( 'pishtaz', 'vip', 'tipax', 'tipax_api', 'alonomic' ) as $method ) {
			if ( ! isset( $input[ $method ] ) || ! is_array( $input[ $method ] ) ) {
				continue;
			}
			$rows = array();
			foreach ( $input[ $method ] as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$rows[] = array(
					'min_weight_g'  => max( 0, (int) ( $row['min_weight_g'] ?? 0 ) ),
					'max_weight_g'  => max( 0, (int) ( $row['max_weight_g'] ?? 0 ) ),
					'price'         => max( 0, (float) ( $row['price'] ?? 0 ) ),
					'province_code' => isset( $row['province_code'] ) ? (int) $row['province_code'] : 0,
				);
			}
			$current[ $method ] = $rows;
		}
		update_option( self::TARIFFS_OPTION, $current, false );
		return $current;
	}

	/**
	 * @return array<string, list<array<string,mixed>>>
	 */
	public static function default_tariffs() {
		return array(
			'pishtaz'   => array(
				array( 'min_weight_g' => 0, 'max_weight_g' => 500, 'price' => 45000, 'province_code' => 0 ),
				array( 'min_weight_g' => 501, 'max_weight_g' => 1000, 'price' => 55000, 'province_code' => 0 ),
				array( 'min_weight_g' => 1001, 'max_weight_g' => 2000, 'price' => 70000, 'province_code' => 0 ),
				array( 'min_weight_g' => 2001, 'max_weight_g' => 5000, 'price' => 95000, 'province_code' => 0 ),
			),
			'vip'       => array(
				array( 'min_weight_g' => 0, 'max_weight_g' => 1000, 'price' => 85000, 'province_code' => 0 ),
				array( 'min_weight_g' => 1001, 'max_weight_g' => 5000, 'price' => 120000, 'province_code' => 0 ),
			),
			'tipax'     => array(
				array( 'min_weight_g' => 0, 'max_weight_g' => 1000, 'price' => 90000, 'province_code' => 0 ),
				array( 'min_weight_g' => 1001, 'max_weight_g' => 5000, 'price' => 140000, 'province_code' => 0 ),
			),
			'tipax_api' => array(),
			'alonomic'  => array(),
		);
	}
}
