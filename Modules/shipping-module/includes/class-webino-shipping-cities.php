<?php
/**
 * Iran state/city/district taxonomy + bulk prices.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webino_Shipping_Cities {

	const TAXONOMY = 'webino_state_city';
	const META_PREFIX = 'webino_ship_';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_taxonomy' ), 5 );
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'filter_city_bound_zones' ), 15, 2 );
	}

	/**
	 * Hide rates from zones bound to a specific city when destination city differs.
	 *
	 * @param array $rates Rates.
	 * @param array $package Package.
	 * @return array
	 */
	public static function filter_city_bound_zones( $rates, $package ) {
		if ( ! is_array( $rates ) || ! $rates ) {
			return $rates;
		}
		$dest = isset( $package['destination'] ) && is_array( $package['destination'] ) ? $package['destination'] : array();
		$city_name = trim( (string) ( $dest['city'] ?? '' ) );
		$dest_city_id = $city_name ? self::find_term_id_by_name( $city_name ) : 0;
		// District name typed as city: resolve parent city.
		if ( $dest_city_id ) {
			$term = get_term( $dest_city_id, self::TAXONOMY );
			if ( $term && ! is_wp_error( $term ) && (int) $term->parent > 0 ) {
				$parent = get_term( (int) $term->parent, self::TAXONOMY );
				if ( $parent && ! is_wp_error( $parent ) && (int) $parent->parent > 0 ) {
					$dest_city_id = (int) $term->parent;
				}
			}
		}
		foreach ( $rates as $rate_id => $rate ) {
			if ( ! is_a( $rate, 'WC_Shipping_Rate' ) ) {
				continue;
			}
			$instance_id = (int) $rate->get_instance_id();
			if ( $instance_id < 1 ) {
				continue;
			}
			$zone_id = 0;
			if ( class_exists( 'WC_Shipping_Zones', false ) ) {
				$zone = WC_Shipping_Zones::get_zone_by( 'instance_id', $instance_id );
				if ( $zone ) {
					$zone_id = (int) $zone->get_id();
				}
			}
			if ( $zone_id < 1 ) {
				continue;
			}
			$bound = (int) get_option( 'webino_shipping_zone_city_' . $zone_id, 0 );
			if ( $bound < 1 ) {
				continue;
			}
			if ( $dest_city_id !== $bound ) {
				unset( $rates[ $rate_id ] );
			}
		}
		return $rates;
	}

	/**
	 * @return void
	 */
	public static function register_taxonomy() {
		register_taxonomy(
			self::TAXONOMY,
			array( 'product' ),
			array(
				'labels'            => array(
					'name'          => __( 'شهرهای ارسال', 'webino-dashboard' ),
					'singular_name' => __( 'شهر', 'webino-dashboard' ),
				),
				'public'            => false,
				'show_ui'           => false,
				'hierarchical'      => true,
				'show_in_rest'      => false,
				'rewrite'           => false,
			)
		);
	}

	/**
	 * @return list<array{id:int,name:string,slug:string}>
	 */
	public static function get_states() {
		$terms = get_terms(
			array(
				'taxonomy'   => self::TAXONOMY,
				'hide_empty' => false,
				'parent'     => 0,
			)
		);
		$out = array();
		if ( is_wp_error( $terms ) ) {
			return $out;
		}
		foreach ( $terms as $t ) {
			$out[] = array(
				'id'   => (int) $t->term_id,
				'name' => (string) $t->name,
				'slug' => (string) $t->slug,
			);
		}
		return $out;
	}

	/**
	 * @param int $parent_id Parent term.
	 * @return list<array{id:int,name:string,slug:string,parent:int}>
	 */
	public static function get_children( $parent_id ) {
		$terms = get_terms(
			array(
				'taxonomy'   => self::TAXONOMY,
				'hide_empty' => false,
				'parent'     => (int) $parent_id,
			)
		);
		$out = array();
		if ( is_wp_error( $terms ) ) {
			return $out;
		}
		foreach ( $terms as $t ) {
			$out[] = array(
				'id'     => (int) $t->term_id,
				'name'   => (string) $t->name,
				'slug'   => (string) $t->slug,
				'parent' => (int) $t->parent,
			);
		}
		return $out;
	}

	/**
	 * @param int $state_id State.
	 * @return list<array{id:int,name:string,slug:string,parent:int}>
	 */
	public static function get_cities( $state_id ) {
		return self::get_children( $state_id );
	}

	/**
	 * @param int $city_id City.
	 * @return list<array{id:int,name:string,slug:string,parent:int}>
	 */
	public static function get_districts( $city_id ) {
		return self::get_children( $city_id );
	}

	/**
	 * @param int    $term_id Term.
	 * @param string $key Key without prefix.
	 * @param mixed  $default Default.
	 * @return mixed
	 */
	public static function get_term_option( $term_id, $key, $default = '' ) {
		$val = get_term_meta( (int) $term_id, self::META_PREFIX . $key, true );
		return ( '' === $val || null === $val ) ? $default : $val;
	}

	/**
	 * @param int    $term_id Term.
	 * @param string $key Key.
	 * @param mixed  $value Value.
	 * @return void
	 */
	public static function set_term_option( $term_id, $key, $value ) {
		update_term_meta( (int) $term_id, self::META_PREFIX . $key, $value );
	}

	/**
	 * Install/reinstall states and cities from bundled data.
	 *
	 * @param bool $force Delete existing terms first.
	 * @return array{ok:bool,message:string,count:int}
	 */
	public static function reinstall( $force = false ) {
		$file = dirname( __DIR__ ) . '/data/state_city.php';
		if ( ! is_readable( $file ) ) {
			return array( 'ok' => false, 'message' => __( 'فایل شهرها پیدا نشد.', 'webino-dashboard' ), 'count' => 0 );
		}
		require_once $file;
		if ( ! function_exists( 'webino_shipping_get_states' ) || ! function_exists( 'webino_shipping_get_state_city' ) ) {
			return array( 'ok' => false, 'message' => __( 'دادهٔ شهرها نامعتبر است.', 'webino-dashboard' ), 'count' => 0 );
		}
		if ( $force ) {
			$all = get_terms( array( 'taxonomy' => self::TAXONOMY, 'hide_empty' => false, 'fields' => 'ids' ) );
			if ( ! is_wp_error( $all ) ) {
				foreach ( $all as $tid ) {
					wp_delete_term( (int) $tid, self::TAXONOMY );
				}
			}
		}
		$count = 0;
		foreach ( webino_shipping_get_states() as $key => $state ) {
			$term = term_exists( $key, self::TAXONOMY );
			if ( ! $term ) {
				$term = wp_insert_term(
					$state,
					self::TAXONOMY,
					array(
						'slug'        => $key,
						'description' => $state,
					)
				);
			}
			if ( is_wp_error( $term ) ) {
				continue;
			}
			$term_id = (int) ( is_array( $term ) ? $term['term_id'] : $term );
			$installed = wp_list_pluck( self::get_cities( $term_id ), 'name' );
			foreach ( array_diff( webino_shipping_get_state_city( $key ), $installed ) as $city ) {
				$ins = wp_insert_term(
					$city,
					self::TAXONOMY,
					array(
						'parent' => $term_id,
						'slug'   => sanitize_title( $city . '-' . $key ),
					)
				);
				if ( ! is_wp_error( $ins ) ) {
					++$count;
				}
			}
		}
		update_option( 'webino_shipping_cities_installed', 1, false );
		return array(
			'ok'      => true,
			'message' => __( 'شهرها نصب شدند.', 'webino-dashboard' ),
			'count'   => $count,
		);
	}

	/**
	 * Bulk price map for a state: city_id => { instance_key => price|_on }.
	 *
	 * @param int                  $state_id State.
	 * @param array<string, mixed> $payload Map.
	 * @return void
	 */
	public static function save_bulk( $state_id, $payload ) {
		unset( $state_id );
		if ( ! is_array( $payload ) ) {
			return;
		}
		foreach ( $payload as $city_id => $fields ) {
			if ( ! is_array( $fields ) ) {
				continue;
			}
			foreach ( $fields as $key => $value ) {
				$key = sanitize_key( (string) $key );
				if ( '' === $key ) {
					continue;
				}
				if ( is_bool( $value ) || '1' === (string) $value || '0' === (string) $value ) {
					self::set_term_option( (int) $city_id, $key, $value ? '1' : '' );
				} elseif ( '' === $value || null === $value ) {
					delete_term_meta( (int) $city_id, self::META_PREFIX . $key );
				} else {
					self::set_term_option( (int) $city_id, $key, is_numeric( $value ) ? (float) $value : sanitize_text_field( (string) $value ) );
				}
			}
		}
	}

	/**
	 * Find term by name under optional parent.
	 *
	 * @param string   $name Name.
	 * @param int|null $parent Parent.
	 * @return int
	 */
	public static function find_term_id_by_name( $name, $parent = null ) {
		$args = array(
			'taxonomy'   => self::TAXONOMY,
			'hide_empty' => false,
			'name'       => $name,
			'number'     => 1,
		);
		if ( null !== $parent ) {
			$args['parent'] = (int) $parent;
		}
		$terms = get_terms( $args );
		if ( is_wp_error( $terms ) || ! $terms ) {
			return 0;
		}
		return (int) $terms[0]->term_id;
	}

	/**
	 * Add a district under a city.
	 *
	 * @param int    $city_id City term.
	 * @param string $name District name.
	 * @return array{ok:bool,message:string,term?:array}
	 */
	public static function add_district( $city_id, $name ) {
		$city_id = (int) $city_id;
		$name    = sanitize_text_field( (string) $name );
		if ( $city_id < 1 || '' === $name ) {
			return array( 'ok' => false, 'message' => __( 'نام محله نامعتبر است.', 'webino-dashboard' ) );
		}
		$city = get_term( $city_id, self::TAXONOMY );
		if ( ! $city || is_wp_error( $city ) || (int) $city->parent < 1 ) {
			return array( 'ok' => false, 'message' => __( 'شهر معتبر نیست.', 'webino-dashboard' ) );
		}
		$ins = wp_insert_term(
			$name,
			self::TAXONOMY,
			array(
				'parent' => $city_id,
				'slug'   => sanitize_title( $name . '-' . $city_id ),
			)
		);
		if ( is_wp_error( $ins ) ) {
			return array( 'ok' => false, 'message' => $ins->get_error_message() );
		}
		$term = get_term( (int) $ins['term_id'], self::TAXONOMY );
		return array(
			'ok'      => true,
			'message' => __( 'محله اضافه شد.', 'webino-dashboard' ),
			'term'    => array(
				'id'     => (int) $term->term_id,
				'name'   => (string) $term->name,
				'parent' => (int) $term->parent,
			),
		);
	}

	/**
	 * Delete a district term.
	 *
	 * @param int $term_id Term.
	 * @return array{ok:bool,message:string}
	 */
	public static function delete_district( $term_id ) {
		$term = get_term( (int) $term_id, self::TAXONOMY );
		if ( ! $term || is_wp_error( $term ) ) {
			return array( 'ok' => false, 'message' => __( 'محله پیدا نشد.', 'webino-dashboard' ) );
		}
		// Must be depth >= 2 (district under city).
		$parent = get_term( (int) $term->parent, self::TAXONOMY );
		if ( ! $parent || is_wp_error( $parent ) || (int) $parent->parent < 1 ) {
			return array( 'ok' => false, 'message' => __( 'فقط محله قابل حذف است.', 'webino-dashboard' ) );
		}
		$res = wp_delete_term( (int) $term_id, self::TAXONOMY );
		if ( is_wp_error( $res ) || ! $res ) {
			return array( 'ok' => false, 'message' => __( 'حذف نشد.', 'webino-dashboard' ) );
		}
		return array( 'ok' => true, 'message' => __( 'محله حذف شد.', 'webino-dashboard' ) );
	}

	/**
	 * Fast AJAX-friendly city search.
	 *
	 * @param string $q Query.
	 * @param int    $state_id Optional state.
	 * @param int    $limit Limit.
	 * @return list<array{id:int,name:string,parent:int,type:string}>
	 */
	public static function search( $q, $state_id = 0, $limit = 30 ) {
		$q = sanitize_text_field( (string) $q );
		$args = array(
			'taxonomy'   => self::TAXONOMY,
			'hide_empty' => false,
			'number'     => max( 1, min( 100, (int) $limit ) ),
			'name__like' => $q,
		);
		if ( $state_id > 0 ) {
			$args['child_of'] = (int) $state_id;
		}
		$terms = get_terms( $args );
		$out   = array();
		if ( is_wp_error( $terms ) ) {
			return $out;
		}
		foreach ( $terms as $t ) {
			$parent = (int) $t->parent;
			$type   = 0 === $parent ? 'state' : 'city';
			if ( $parent > 0 ) {
				$p = get_term( $parent, self::TAXONOMY );
				if ( $p && ! is_wp_error( $p ) && (int) $p->parent > 0 ) {
					$type = 'district';
				}
			}
			$out[] = array(
				'id'     => (int) $t->term_id,
				'name'   => (string) $t->name,
				'parent' => $parent,
				'type'   => $type,
			);
		}
		return $out;
	}
}
