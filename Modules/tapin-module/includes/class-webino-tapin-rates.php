<?php
/**
 * Shipping rate calculation (live Tapin + PWS formula + offline tariffs).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Rate helpers for Tapin WC methods.
 */
class Webino_Tapin_Rates {

	/**
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
				$est = Webino_Shipping_Weight::estimate_unit_package( $row['data'] );
				$total += ( (int) $est['package_weight_g'] ) * $qty;
			} else {
				$w = (float) $row['data']->get_weight();
				$unit = (string) get_option( 'woocommerce_weight_unit', 'kg' );
				$g = ( 'kg' === $unit ) ? (int) round( $w * 1000 ) : (int) round( $w );
				$total += max( 1, $g ) * $qty;
			}
		}
		if ( class_exists( 'Webino_Shipping_Tools', false ) ) {
			$total += max( 0, (int) Webino_Shipping_Tools::get()['default_package_weight_g'] );
		}
		return max( 1, $total );
	}

	/**
	 * @param array<string, mixed> $package Package.
	 * @return array{province:int,city:int}
	 */
	public static function destination_codes( $package ) {
		$dest = isset( $package['destination'] ) && is_array( $package['destination'] ) ? $package['destination'] : array();
		$state = (string) ( $dest['state'] ?? '' );
		$city  = (string) ( $dest['city'] ?? '' );
		$p = Webino_Tapin_Locations::province_code_by_title( $state );
		$c = $p ? Webino_Tapin_Locations::city_code_by_title( $p, $city ) : null;
		if ( ! $p && is_numeric( $state ) ) {
			$p = (int) $state;
		}
		if ( ! $c && is_numeric( $city ) ) {
			$c = (int) $city;
		}
		return array(
			'province' => $p ? (int) $p : 0,
			'city'     => $c ? (int) $c : 0,
		);
	}

	/**
	 * @param string               $method_key Method key.
	 * @param array<string, mixed> $package Package.
	 * @param WC_Shipping_Method|null $method Optional WC method instance.
	 * @return float|null
	 */
	public static function calculate( $method_key, $package, $method = null ) {
		$settings = Webino_Tapin_Settings::get();
		if ( empty( $settings['enabled'] ) ) {
			return null;
		}
		if ( empty( $settings['methods'][ $method_key ] ) && ! in_array( $method_key, array( 'pishtaz_1405' ), true ) ) {
			return null;
		}

		$dest = self::destination_codes( $package );
		if ( $dest['province'] < 1 ) {
			return null;
		}

		$cart_total = 0.0;
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$cart_total = (float) WC()->cart->get_displayed_subtotal();
		}
		if ( $settings['free_shipping_min'] > 0 && $cart_total >= $settings['free_shipping_min'] ) {
			return 0.0;
		}

		$weight = self::package_weight_g( $package );
		if ( class_exists( 'Webino_Shipping_Tools', false ) && in_array( $method_key, array( 'pishtaz', 'vip', 'pishtaz_1405' ), true ) ) {
			$limit_kg = (float) Webino_Shipping_Tools::get()['post_weight_limit_kg'];
			if ( $limit_kg > 0 && ( $weight / 1000 ) > $limit_kg ) {
				return null;
			}
		}

		$chosen_payment = '';
		if ( function_exists( 'WC' ) && WC()->session ) {
			$chosen_payment = (string) WC()->session->get( 'chosen_payment_method' );
		}
		$is_cod = ( false !== stripos( $chosen_payment, 'cod' ) );
		if ( Webino_Tapin_Settings::is_posteketab() && ( $is_cod || 3 === (int) $settings['default_pay_type'] ) ) {
			if ( in_array( $method_key, array( 'pishtaz', 'vip' ), true ) ) {
				return null;
			}
		}

		if ( 'courier' === $method_key ) {
			return self::apply_extras( self::courier_price( $package, $method, $settings ), $settings );
		}

		if ( 'tipax' === $method_key ) {
			$city_price = self::city_override_price( $package, $method );
			if ( null !== $city_price ) {
				return self::apply_extras( $city_price, $settings );
			}
			if ( $method && is_a( $method, 'WC_Shipping_Method' ) ) {
				$on = self::city_tipax_enabled( $package, $method );
				if ( false === $on ) {
					return null;
				}
			}
		}

		$price = null;
		if ( Webino_Tapin_Settings::is_connected() && $dest['city'] > 0 && ! in_array( $method_key, array( 'pishtaz_1405' ), true ) ) {
			$price = self::live_price( $method_key, $weight, $dest, $settings );
		}
		if ( null === $price && ! empty( $settings['use_pws_formula'] ) && class_exists( 'Webino_Tapin_Formula', false ) && in_array( $method_key, array( 'pishtaz', 'vip' ), true ) ) {
			$price = Webino_Tapin_Formula::calculate(
				$method_key,
				$weight,
				(int) $settings['default_box_id'],
				(int) $settings['origin_province_code'],
				(int) $dest['province'],
				array(
					'price'      => class_exists( 'Webino_Shipping_Currency', false )
						? Webino_Shipping_Currency::to_rial( $cart_total )
						: $cart_total * 10,
					'is_cod'     => $is_cod,
					'posteketab' => Webino_Tapin_Settings::is_posteketab(),
				)
			);
			if ( null !== $price && class_exists( 'Webino_Shipping_Currency', false ) ) {
				$price = Webino_Shipping_Currency::from_rial( (float) $price );
			}
		}
		if ( null === $price && 'pishtaz_1405' === $method_key && class_exists( 'Webino_Tapin_Formula', false ) ) {
			$price = Webino_Tapin_Formula::pishtaz_1405(
				$weight,
				(int) $settings['default_box_id'],
				(int) $settings['origin_province_code'],
				(int) $dest['province']
			);
			if ( null !== $price && class_exists( 'Webino_Shipping_Currency', false ) ) {
				$price = Webino_Shipping_Currency::from_rial( (float) $price );
			}
		}
		if ( null === $price ) {
			$price = self::offline_price( $method_key, $weight, $dest['province'] );
			if ( null !== $price && Webino_Tapin_Settings::is_posteketab() && in_array( $method_key, array( 'pishtaz', 'vip' ), true ) ) {
				$price *= 0.7;
			}
		}
		if ( null === $price ) {
			return null;
		}
		return self::apply_extras( (float) $price, $settings );
	}

	/**
	 * @param array                $package Package.
	 * @param WC_Shipping_Method|null $method Method.
	 * @param array                $settings Settings.
	 * @return float
	 */
	private static function courier_price( $package, $method, $settings ) {
		$base = (float) $settings['courier_base_price'];
		$per  = (float) $settings['courier_per_kg'];
		if ( $method && is_a( $method, 'WC_Shipping_Method' ) ) {
			$b = $method->get_option( 'base_cost', '' );
			$p = $method->get_option( 'cost_per_kg', '' );
			if ( '' !== $b ) {
				$base = (float) $b;
			}
			if ( '' !== $p ) {
				$per = (float) $p;
			}
			$areas = (string) $method->get_option( 'delivery_areas', '' );
			if ( '' !== $areas ) {
				$allowed = array_filter( array_map( 'trim', explode( ',', $areas ) ) );
				$city = (string) ( $package['destination']['city'] ?? '' );
				if ( $allowed && $city && ! in_array( $city, $allowed, true ) ) {
					// Still allow numeric term ids match later.
					$ok = false;
					foreach ( $allowed as $a ) {
						if ( $a === $city || ( is_numeric( $a ) && class_exists( 'Webino_Shipping_Cities', false ) ) ) {
							$ok = true;
							break;
						}
					}
					if ( ! $ok ) {
						return -1; // signal unavailable — caller checks.
					}
				}
			}
		}
		$override = self::city_override_price( $package, $method );
		if ( null !== $override ) {
			return $override;
		}
		$kg = (int) ceil( self::package_weight_g( $package ) / 1000 );
		return max( 0, $base + ( $per * max( 1, $kg ) ) );
	}

	/**
	 * @param array $package Package.
	 * @param WC_Shipping_Method|null $method Method.
	 * @return float|null
	 */
	private static function city_override_price( $package, $method ) {
		if ( ! $method || ! class_exists( 'Webino_Shipping_Cities', false ) ) {
			return null;
		}
		$city = (string) ( $package['destination']['city'] ?? '' );
		if ( '' === $city ) {
			return null;
		}
		$city_id = Webino_Shipping_Cities::find_term_id_by_name( $city );
		if ( ! $city_id ) {
			return null;
		}
		$val = Webino_Shipping_Cities::get_term_option( $city_id, (string) $method->instance_id, '' );
		return ( '' !== $val && is_numeric( $val ) ) ? (float) $val : null;
	}

	/**
	 * @param array $package Package.
	 * @param WC_Shipping_Method $method Method.
	 * @return bool|null null = no restriction, false = disabled.
	 */
	private static function city_tipax_enabled( $package, $method ) {
		if ( ! class_exists( 'Webino_Shipping_Cities', false ) ) {
			return null;
		}
		$city = (string) ( $package['destination']['city'] ?? '' );
		$city_id = $city ? Webino_Shipping_Cities::find_term_id_by_name( $city ) : 0;
		if ( ! $city_id ) {
			return null;
		}
		$on = Webino_Shipping_Cities::get_term_option( $city_id, (string) $method->instance_id . '_on', '' );
		if ( '' === $on ) {
			return null;
		}
		return ( '1' === (string) $on );
	}

	/**
	 * @param float $price Price.
	 * @param array $settings Settings.
	 * @return float|null
	 */
	private static function apply_extras( $price, $settings ) {
		if ( $price < 0 ) {
			return null;
		}
		$pct = (float) ( $settings['rate_extra_percent'] ?? 0 );
		$fix = (float) ( $settings['rate_extra_fixed'] ?? 0 );
		if ( $pct ) {
			$price += $price * ( $pct / 100 );
		}
		$price += $fix;
		if ( class_exists( 'Webino_Shipping_Currency', false ) ) {
			$price = Webino_Shipping_Currency::round_shipping( $price );
		}
		return max( 0, round( $price ) );
	}

	/**
	 * @param string $method_key Method.
	 * @param int    $weight_g Weight.
	 * @param array  $dest Dest.
	 * @param array  $settings Settings.
	 * @return float|null
	 */
	private static function live_price( $method_key, $weight_g, $dest, $settings ) {
		$order_type = self::order_type_for_method( $method_key );
		$box_id     = (int) $settings['default_box_id'];
		$payload    = array(
			'shop_id'        => $settings['shop_id'],
			'rate_type'      => 'tapin',
			'weight'         => (int) $weight_g,
			'package_weight' => (int) $weight_g,
			'order_type'     => $order_type,
			'pay_type'       => (int) $settings['default_pay_type'],
			'from_province'  => (int) $settings['origin_province_code'],
			'from_city'      => (int) $settings['origin_city_code'],
			'to_province'    => (int) $dest['province'],
			'to_city'        => (int) $dest['city'],
			'box_id'         => $box_id,
		);
		if ( 'tipax_api' === $method_key ) {
			$payload['pickup_type']   = (int) $settings['tipax_pickup_type'];
			$payload['delivery_type'] = (int) $settings['tipax_delivery_type'];
		}
		$res = Webino_Tapin_Client::check_price( $payload );
		if ( ! $res['ok'] ) {
			return null;
		}
		$entries = $res['entries'];
		if ( $res['ok'] && is_array( $res['entries'] ) ) {
			foreach ( array( 'price', 'total_price', 'post_price', 'amount' ) as $key ) {
				if ( isset( $entries[ $key ] ) && is_numeric( $entries[ $key ] ) ) {
					$p = (float) $entries[ $key ];
					if ( class_exists( 'Webino_Shipping_Currency', false ) ) {
						$p = Webino_Shipping_Currency::from_rial( $p );
					}
					return $p;
				}
			}
			if ( isset( $entries['list'][0]['price'] ) ) {
				$p = (float) $entries['list'][0]['price'];
				if ( class_exists( 'Webino_Shipping_Currency', false ) ) {
					$p = Webino_Shipping_Currency::from_rial( $p );
				}
				return $p;
			}
		}
		return null;
	}

	/**
	 * @param string $method_key Method.
	 * @param int    $weight_g Weight.
	 * @param int    $province_code Province.
	 * @return float|null
	 */
	private static function offline_price( $method_key, $weight_g, $province_code ) {
		$tariffs = Webino_Tapin_Settings::get_tariffs();
		$key     = $method_key;
		if ( 'tipax_api' === $key && empty( $tariffs['tipax_api'] ) ) {
			$key = 'tipax';
		}
		$rows = isset( $tariffs[ $key ] ) ? $tariffs[ $key ] : array();
		$best = null;
		foreach ( $rows as $row ) {
			$min = (int) ( $row['min_weight_g'] ?? 0 );
			$max = (int) ( $row['max_weight_g'] ?? 0 );
			$pc  = (int) ( $row['province_code'] ?? 0 );
			if ( $weight_g < $min || ( $max > 0 && $weight_g > $max ) ) {
				continue;
			}
			if ( $pc > 0 && $pc !== (int) $province_code ) {
				continue;
			}
			$price = (float) ( $row['price'] ?? 0 );
			if ( null === $best || $price < $best ) {
				$best = $price;
			}
		}
		return $best;
	}

	/**
	 * @param string $method_key Method.
	 * @return int
	 */
	public static function order_type_for_method( $method_key ) {
		$map = array(
			'pishtaz'   => 0,
			'vip'       => 1,
			'tipax'     => 2,
			'tipax_api' => 2,
			'alonomic'  => 4,
			'courier'   => 0,
		);
		return isset( $map[ $method_key ] ) ? (int) $map[ $method_key ] : 0;
	}
}
