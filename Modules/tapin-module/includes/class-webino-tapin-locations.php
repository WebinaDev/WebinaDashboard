<?php
/**
 * Iran province/city store synced from Tapin.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cached location tree for checkout and orders.
 */
class Webino_Tapin_Locations {

	const OPTION = 'webino_tapin_locations_tree';
	const META_PROVINCE = '_webino_province_code';
	const META_CITY     = '_webino_city_code';

	/**
	 * @return void
	 */
	public static function init() {
		// Public helpers used by Basalam bridge.
	}

	/**
	 * @return bool
	 */
	public static function is_available() {
		$tree = self::get_tree();
		return is_array( $tree ) && count( $tree ) > 0;
	}

	/**
	 * @return list<array{code:int,title:string,cities:list<array{code:int,title:string}>}>
	 */
	public static function get_tree() {
		$raw = get_option( self::OPTION, null );
		if ( ! is_array( $raw ) ) {
			return array();
		}
		return $raw;
	}

	/**
	 * Sync from Tapin API.
	 *
	 * @return array{ok:bool,message:string,count:int}
	 */
	public static function sync_from_tapin() {
		$res = Webino_Tapin_Client::state_tree();
		if ( ! $res['ok'] || ! is_array( $res['entries'] ) ) {
			return array(
				'ok'      => false,
				'message' => $res['message'] ?: __( 'دریافت فهرست استان‌ها ممکن نشد.', 'webino-dashboard' ),
				'count'   => 0,
			);
		}
		$tree = self::normalize_tree( $res['entries'] );
		// Enrich empty city lists via city/list when tree has provinces without cities.
		foreach ( $tree as $i => $prov ) {
			if ( ! empty( $prov['cities'] ) ) {
				continue;
			}
			$city_res = Webino_Tapin_Client::city_list(
				array(
					'province_code' => (int) $prov['code'],
					'state_code'    => (int) $prov['code'],
				)
			);
			if ( ! $city_res['ok'] || ! is_array( $city_res['entries'] ) ) {
				continue;
			}
			$rows = isset( $city_res['entries']['list'] ) && is_array( $city_res['entries']['list'] )
				? $city_res['entries']['list']
				: $city_res['entries'];
			$cities = array();
			foreach ( (array) $rows as $city ) {
				if ( ! is_array( $city ) ) {
					continue;
				}
				$cc = (int) ( $city['code'] ?? $city['id'] ?? $city['city_code'] ?? 0 );
				$ct = (string) ( $city['title'] ?? $city['name'] ?? '' );
				if ( $cc < 1 || '' === $ct ) {
					continue;
				}
				$cities[] = array(
					'code'  => $cc,
					'title' => $ct,
				);
			}
			if ( $cities ) {
				$tree[ $i ]['cities'] = $cities;
			}
		}
		update_option( self::OPTION, $tree, false );
		return array(
			'ok'      => true,
			'message' => __( 'فهرست استان و شهر به‌روز شد.', 'webino-dashboard' ),
			'count'   => count( $tree ),
		);
	}

	/**
	 * @param mixed $entries API entries.
	 * @return list<array{code:int,title:string,cities:list<array{code:int,title:string}>}>
	 */
	private static function normalize_tree( $entries ) {
		$out = array();
		if ( ! is_array( $entries ) ) {
			return $out;
		}
		// Sometimes wrapped.
		if ( isset( $entries['list'] ) && is_array( $entries['list'] ) ) {
			$entries = $entries['list'];
		}
		foreach ( $entries as $province ) {
			if ( ! is_array( $province ) ) {
				continue;
			}
			$code  = (int) ( $province['code'] ?? $province['id'] ?? 0 );
			$title = (string) ( $province['title'] ?? $province['name'] ?? '' );
			if ( $code < 1 || '' === $title ) {
				continue;
			}
			$cities = array();
			$raw_cities = $province['cities'] ?? $province['city'] ?? array();
			if ( is_array( $raw_cities ) ) {
				foreach ( $raw_cities as $city ) {
					if ( ! is_array( $city ) ) {
						continue;
					}
					$cc = (int) ( $city['code'] ?? $city['id'] ?? 0 );
					$ct = (string) ( $city['title'] ?? $city['name'] ?? '' );
					if ( $cc < 1 || '' === $ct ) {
						continue;
					}
					$cities[] = array(
						'code'  => $cc,
						'title' => $ct,
					);
				}
			}
			$out[] = array(
				'code'   => $code,
				'title'  => $title,
				'cities' => $cities,
			);
		}
		usort(
			$out,
			static function ( $a, $b ) {
				return strcmp( $a['title'], $b['title'] );
			}
		);
		return $out;
	}

	/**
	 * @return list<array{code:int,title:string}>
	 */
	public static function provinces() {
		$out = array();
		foreach ( self::get_tree() as $p ) {
			$out[] = array(
				'code'  => (int) $p['code'],
				'title' => (string) $p['title'],
			);
		}
		return $out;
	}

	/**
	 * @param int $province_code Province code.
	 * @return list<array{code:int,title:string}>
	 */
	public static function cities( $province_code ) {
		$province_code = (int) $province_code;
		foreach ( self::get_tree() as $p ) {
			if ( (int) $p['code'] === $province_code ) {
				return isset( $p['cities'] ) && is_array( $p['cities'] ) ? $p['cities'] : array();
			}
		}
		return array();
	}

	/**
	 * Resolve Tapin province code from Persian title.
	 *
	 * @param string $title Title.
	 * @return int|null
	 */
	public static function province_code_by_title( $title ) {
		$needle = self::normalize( $title );
		foreach ( self::get_tree() as $p ) {
			if ( self::normalize( $p['title'] ) === $needle ) {
				return (int) $p['code'];
			}
		}
		return null;
	}

	/**
	 * @param int    $province_code Province.
	 * @param string $title City title.
	 * @return int|null
	 */
	public static function city_code_by_title( $province_code, $title ) {
		$needle = self::normalize( $title );
		foreach ( self::cities( (int) $province_code ) as $c ) {
			if ( self::normalize( $c['title'] ) === $needle ) {
				return (int) $c['code'];
			}
		}
		return null;
	}

	/**
	 * @param string $s Text.
	 * @return string
	 */
	public static function normalize( $s ) {
		$s = (string) $s;
		$s = str_replace( array( 'ي', 'ك', '‌', ' ' ), array( 'ی', 'ک', '', '' ), $s );
		return mb_strtolower( $s );
	}

	/**
	 * Map for WooCommerce IR states (title => title).
	 *
	 * @return array<string, string>
	 */
	public static function wc_states_map() {
		$map = array();
		foreach ( self::provinces() as $p ) {
			$map[ $p['title'] ] = $p['title'];
		}
		return $map;
	}
}
