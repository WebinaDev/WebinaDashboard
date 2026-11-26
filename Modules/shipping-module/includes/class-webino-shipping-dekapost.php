<?php
/**
 * Dekapost (دکاپست) carrier: settings, weight tariffs and rate resolution.
 *
 * The tracking portal at https://tracking.dekapost.ir/ is a search form that takes the
 * parcel barcode (شماره بارکد) printed on the delivery SMS. Its deep-link parameter is not
 * documented, so the template is stored as a setting: {code} is replaced with the barcode.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option-backed Dekapost configuration + pricing.
 */
class Webino_Shipping_Dekapost {

	const OPTION             = 'webino_shipping_dekapost';
	const METHOD_ID          = 'webino_dekapost';
	const TRACKING_URL       = 'https://tracking.dekapost.ir/?code={code}';
	const TRACKING_HOME      = 'https://tracking.dekapost.ir/';

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'webino_dashboard_tracking_url_template', array( __CLASS__, 'filter_tracking_template' ), 10, 2 );
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function defaults() {
		return array(
			'enabled'               => false,
			'use_city_table'        => true,
			'fallback_flat'         => 0,
			'free_shipping_min'     => 0,
			'rate_extra_percent'    => 0,
			'rate_extra_fixed'      => 0,
			'cod_extra'             => 0,
			'tracking_url_template' => self::TRACKING_URL,
			'tariffs'               => array(),
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
			$out[ $key ] = $raw[ $key ];
		}
		$out['enabled']               = ! empty( $out['enabled'] );
		$out['use_city_table']        = ! empty( $out['use_city_table'] );
		$out['fallback_flat']         = max( 0, (float) $out['fallback_flat'] );
		$out['free_shipping_min']     = max( 0, (float) $out['free_shipping_min'] );
		$out['rate_extra_percent']    = (float) $out['rate_extra_percent'];
		$out['rate_extra_fixed']      = (float) $out['rate_extra_fixed'];
		$out['cod_extra']             = max( 0, (float) $out['cod_extra'] );
		$out['tracking_url_template'] = self::sanitize_template( (string) $out['tracking_url_template'] );
		$out['tariffs']               = self::sanitize_tariffs( $out['tariffs'] );
		return $out;
	}

	/**
	 * Whether the carrier is offered at checkout.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		return ! empty( self::get()['enabled'] );
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
		$merged = $current;
		foreach ( self::defaults() as $key => $default ) {
			if ( array_key_exists( $key, $input ) ) {
				$merged[ $key ] = $input[ $key ];
			}
		}
		update_option( self::OPTION, $merged, false );
		return self::get();
	}

	/**
	 * Normalise a URL template: must be http(s) and contain {code} or {code_raw}.
	 *
	 * @param string $template Raw template.
	 * @return string Empty when unusable (caller falls back to the home page).
	 */
	public static function sanitize_template( $template ) {
		$template = trim( (string) $template );
		if ( '' === $template ) {
			return '';
		}
		$scheme = strtolower( (string) wp_parse_url( $template, PHP_URL_SCHEME ) );
		if ( ! in_array( $scheme, array( 'http', 'https' ), true ) ) {
			return '';
		}
		if ( false === strpos( $template, '{code}' ) && false === strpos( $template, '{code_raw}' ) ) {
			return '';
		}
		return $template;
	}

	/**
	 * @param mixed $rows Raw tariff rows.
	 * @return list<array{min_weight_g:int,max_weight_g:int,price:float,state:string}>
	 */
	public static function sanitize_tariffs( $rows ) {
		$out = array();
		if ( ! is_array( $rows ) ) {
			return $out;
		}
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$min   = max( 0, (int) ( $row['min_weight_g'] ?? 0 ) );
			$max   = max( 0, (int) ( $row['max_weight_g'] ?? 0 ) );
			$price = max( 0, (float) ( $row['price'] ?? 0 ) );
			$state = strtoupper( preg_replace( '/[^A-Za-z0-9\-]/', '', (string) ( $row['state'] ?? '' ) ) );
			if ( $max > 0 && $max < $min ) {
				continue;
			}
			$out[] = array(
				'min_weight_g' => $min,
				'max_weight_g' => $max,
				'price'        => $price,
				'state'        => $state,
			);
		}
		return $out;
	}

	/**
	 * Cart weight in grams using product weights + carton tare (falls back to product weight).
	 *
	 * @param array<string, mixed> $package WC package.
	 * @return int
	 */
	public static function package_weight_g( $package ) {
		$contents = isset( $package['contents'] ) && is_array( $package['contents'] ) ? $package['contents'] : array();
		$total    = 0;
		foreach ( $contents as $row ) {
			if ( empty( $row['data'] ) || ! is_a( $row['data'], 'WC_Product' ) ) {
				continue;
			}
			$qty = max( 1, (int) ( $row['quantity'] ?? 1 ) );
			if ( class_exists( 'Webino_Shipping_Weight', false ) ) {
				$est    = Webino_Shipping_Weight::estimate_unit_package( $row['data'] );
				$total += ( (int) $est['package_weight_g'] ) * $qty;
				continue;
			}
			$unit = (string) get_option( 'woocommerce_weight_unit', 'kg' );
			$w    = (float) $row['data']->get_weight();
			if ( 'kg' === $unit ) {
				$w = $w * 1000;
			} elseif ( 'lbs' === $unit ) {
				$w = $w * 453.592;
			} elseif ( 'oz' === $unit ) {
				$w = $w * 28.3495;
			}
			$total += max( 1, (int) round( $w ) ) * $qty;
		}
		if ( class_exists( 'Webino_Shipping_Tools', false ) ) {
			$total += max( 0, (int) Webino_Shipping_Tools::get()['default_package_weight_g'] );
		}
		return max( 1, $total );
	}

	/**
	 * Per-city price override from the city table, keyed by the method instance id.
	 *
	 * @param string $city_name Destination city name.
	 * @param int    $instance  Method instance id.
	 * @return float|null
	 */
	public static function city_price( $city_name, $instance ) {
		if ( '' === $city_name || ! class_exists( 'Webino_Shipping_Cities', false ) ) {
			return null;
		}
		$city_id = Webino_Shipping_Cities::find_term_id_by_name( $city_name );
		if ( ! $city_id ) {
			return null;
		}
		$val = Webino_Shipping_Cities::get_term_option( $city_id, (string) (int) $instance, '' );
		if ( '' === $val || ! is_numeric( $val ) ) {
			return null;
		}
		return (float) $val;
	}

	/**
	 * Best matching weight tariff for a destination.
	 *
	 * State-specific rows win over generic rows; within a tier the narrowest band wins.
	 *
	 * @param int    $weight_g  Weight.
	 * @param string $state_code WC state code (e.g. THR).
	 * @return float|null
	 */
	public static function tariff_price( $weight_g, $state_code = '' ) {
		$settings = self::get();
		$state    = strtoupper( preg_replace( '/[^A-Za-z0-9\-]/', '', (string) $state_code ) );
		$best     = null;
		$best_rank = null;
		foreach ( $settings['tariffs'] as $row ) {
			$min = (int) $row['min_weight_g'];
			$max = (int) $row['max_weight_g'];
			if ( $weight_g < $min || ( $max > 0 && $weight_g > $max ) ) {
				continue;
			}
			if ( '' !== $row['state'] && $row['state'] !== $state ) {
				continue;
			}
			$specific = '' !== $row['state'] ? 0 : 1;
			$span     = $max > 0 ? $max - $min : PHP_INT_MAX;
			$rank     = array( $specific, $span );
			if ( null === $best_rank || $rank < $best_rank ) {
				$best_rank = $rank;
				$best      = (float) $row['price'];
			}
		}
		return $best;
	}

	/**
	 * Resolve the shipping cost for a package.
	 *
	 * Precedence: per-city table → weight tariff → flat fallback. Null means "not offered".
	 *
	 * @param array<string, mixed> $package  WC package.
	 * @param int                  $instance Method instance id.
	 * @param int                  $weight_g Weight override in grams (0 = weigh the cart).
	 * @return array{cost:float,free:bool,source:string}|null
	 */
	public static function resolve_rate( $package, $instance = 0, $weight_g = 0 ) {
		$settings = self::get();
		if ( empty( $settings['enabled'] ) ) {
			return null;
		}

		$cart_total = 0.0;
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$cart_total = (float) WC()->cart->get_displayed_subtotal();
		}
		if ( $settings['free_shipping_min'] > 0 && $cart_total >= $settings['free_shipping_min'] ) {
			return array(
				'cost'   => 0.0,
				'free'   => true,
				'source' => 'free_min',
			);
		}

		$dest       = isset( $package['destination'] ) && is_array( $package['destination'] ) ? $package['destination'] : array();
		$city_name  = trim( (string) ( $dest['city'] ?? '' ) );
		$state_code = (string) ( $dest['state'] ?? '' );

		$cost   = null;
		$source = '';
		if ( ! empty( $settings['use_city_table'] ) ) {
			$city = self::city_price( $city_name, $instance );
			if ( null !== $city ) {
				$cost   = $city;
				$source = 'city';
			}
		}
		if ( null === $cost && ! empty( $settings['tariffs'] ) ) {
			$grams  = $weight_g > 0 ? (int) $weight_g : self::package_weight_g( $package );
			$tariff = self::tariff_price( $grams, $state_code );
			if ( null !== $tariff ) {
				$cost   = $tariff;
				$source = 'tariff';
			}
		}
		if ( null === $cost && $settings['fallback_flat'] > 0 ) {
			$cost   = (float) $settings['fallback_flat'];
			$source = 'flat';
		}
		if ( null === $cost ) {
			return null;
		}

		$cost = (float) $cost;
		if ( ! empty( $settings['cod_extra'] ) && self::is_cod() ) {
			$cost += (float) $settings['cod_extra'];
		}
		if ( 0.0 !== (float) $settings['rate_extra_percent'] ) {
			$cost += $cost * ( (float) $settings['rate_extra_percent'] / 100 );
		}
		$cost += (float) $settings['rate_extra_fixed'];
		if ( class_exists( 'Webino_Shipping_Currency', false ) ) {
			$cost = Webino_Shipping_Currency::round_shipping( $cost );
		}
		return array(
			'cost'   => max( 0.0, $cost ),
			'free'   => false,
			'source' => $source,
		);
	}

	/**
	 * @return bool
	 */
	private static function is_cod() {
		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return false;
		}
		$chosen = (string) WC()->session->get( 'chosen_payment_method' );
		return false !== stripos( $chosen, 'cod' );
	}

	/**
	 * Tracking URL for a barcode, honouring the configured template.
	 *
	 * @param string $code Parcel barcode.
	 * @return string Empty when the barcode is empty.
	 */
	public static function tracking_url( $code ) {
		$code = trim( (string) $code );
		if ( '' === $code ) {
			return '';
		}
		$template = (string) self::get()['tracking_url_template'];
		if ( '' === $template ) {
			return self::TRACKING_HOME;
		}
		$url = str_replace( '{code_raw}', $code, $template );
		return str_replace( '{code}', rawurlencode( $code ), $url );
	}

	/**
	 * Feed the Dekapost template into the shared tracking-URL resolver.
	 *
	 * @param string $template Template from CRM / defaults.
	 * @param string $kind     Carrier kind.
	 * @return string
	 */
	public static function filter_tracking_template( $template, $kind ) {
		if ( 'dekapost' !== sanitize_key( (string) $kind ) ) {
			return $template;
		}
		$own = (string) self::get()['tracking_url_template'];
		if ( '' === $own ) {
			return '';
		}
		return $own;
	}
}
