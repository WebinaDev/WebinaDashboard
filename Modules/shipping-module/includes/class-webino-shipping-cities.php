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
		// Modules load at init:10 — register at 11 (same pattern as coffee-origins).
		if ( did_action( 'init' ) ) {
			self::register_taxonomy();
			self::maybe_schedule_ensure();
		} else {
			add_action( 'init', array( __CLASS__, 'register_taxonomy' ), 11 );
			add_action( 'init', array( __CLASS__, 'maybe_schedule_ensure' ), 12 );
		}
		add_action( 'webino_shipping_cities_ensure', array( __CLASS__, 'cron_seed_batches' ) );
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'filter_city_bound_zones' ), 15, 2 );
	}

	/**
	 * Load bundled state/city data file.
	 *
	 * @return bool
	 */
	private static function load_data_file() {
		$file = dirname( __DIR__ ) . '/data/state_city.php';
		if ( ! is_readable( $file ) ) {
			return false;
		}
		require_once $file;
		return function_exists( 'webino_shipping_get_states' ) && function_exists( 'webino_shipping_get_state_city' );
	}

	/**
	 * @return array<string,string>
	 */
	public static function data_states() {
		if ( ! self::load_data_file() ) {
			return array();
		}
		$states = webino_shipping_get_states();
		return is_array( $states ) ? $states : array();
	}

	/**
	 * Cron: seed a few provinces per run without blocking HTTP.
	 *
	 * @return void
	 */
	public static function cron_seed_batches() {
		self::register_taxonomy();
		if ( self::is_seed_complete() ) {
			return;
		}
		$deadline = time() + 20;
		while ( time() < $deadline && ! self::is_seed_complete() ) {
			$res = self::seed_batch( null );
			if ( empty( $res['ok'] ) || empty( $res['next_key'] ) && ! empty( $res['installed'] ) ) {
				break;
			}
			if ( empty( $res['next_key'] ) ) {
				break;
			}
		}
		if ( ! self::is_seed_complete() && function_exists( 'wp_schedule_single_event' ) ) {
			if ( ! wp_next_scheduled( 'webino_shipping_cities_ensure' ) ) {
				wp_schedule_single_event( time() + 30, 'webino_shipping_cities_ensure' );
			}
		}
	}

	/**
	 * Schedule a one-shot background seed if provinces are missing.
	 *
	 * @return void
	 */
	public static function maybe_schedule_ensure() {
		self::register_taxonomy();
		if ( self::is_seed_complete() ) {
			return;
		}
		if ( ! function_exists( 'wp_next_scheduled' ) || ! function_exists( 'wp_schedule_single_event' ) ) {
			return;
		}
		if ( wp_next_scheduled( 'webino_shipping_cities_ensure' ) ) {
			return;
		}
		wp_schedule_single_event( time() + 5, 'webino_shipping_cities_ensure' );
	}

	/**
	 * Whether taxonomy has at least as many top-level provinces as the data file.
	 *
	 * @return bool
	 */
	public static function is_seed_complete() {
		if ( ! taxonomy_exists( self::TAXONOMY ) ) {
			return false;
		}
		$expected = count( self::data_states() );
		if ( $expected < 1 ) {
			return (bool) get_option( 'webino_shipping_cities_installed', 0 ) && count( self::get_states() ) > 0;
		}
		return count( self::get_states() ) >= $expected;
	}

	/**
	 * Seed progress / next key for UI.
	 *
	 * @return array{installed:bool,needs_seed:bool,next_key:string|null,states_done:int,states_total:int}
	 */
	public static function seed_status() {
		self::register_taxonomy();
		if ( ! self::load_data_file() ) {
			return array(
				'installed'    => false,
				'needs_seed'   => true,
				'next_key'     => null,
				'states_done'  => 0,
				'states_total' => 0,
			);
		}
		$states = webino_shipping_get_states();
		$total  = is_array( $states ) ? count( $states ) : 0;
		$done   = 0;
		$next   = null;
		foreach ( (array) $states as $key => $_name ) {
			$term = term_exists( $key, self::TAXONOMY );
			if ( ! $term ) {
				if ( null === $next ) {
					$next = (string) $key;
				}
				continue;
			}
			$term_id = (int) ( is_array( $term ) ? $term['term_id'] : $term );
			$cities  = webino_shipping_get_state_city( $key );
			$have    = count( self::get_cities( $term_id ) );
			$need    = is_array( $cities ) ? count( $cities ) : 0;
			if ( $have < $need ) {
				if ( null === $next ) {
					$next = (string) $key;
				}
				continue;
			}
			++$done;
		}
		$installed = self::is_seed_complete();
		if ( $installed ) {
			update_option( 'webino_shipping_cities_installed', 1, false );
			$next = null;
		}
		return array(
			'installed'    => $installed,
			'needs_seed'   => ! $installed,
			'next_key'     => $next,
			'states_done'  => $done,
			'states_total' => $total,
		);
	}

	/**
	 * Insert one province and its cities.
	 *
	 * @param string $state_key State key e.g. TE.
	 * @return array{ok:bool,message:string,count:int,state_key:string}
	 */
	public static function seed_state( $state_key ) {
		self::register_taxonomy();
		if ( ! taxonomy_exists( self::TAXONOMY ) ) {
			return array(
				'ok'        => false,
				'message'   => __( 'taxonomy شهرها ثبت نشد.', 'webino-dashboard' ),
				'count'     => 0,
				'state_key' => (string) $state_key,
			);
		}
		if ( ! self::load_data_file() ) {
			return array(
				'ok'        => false,
				'message'   => __( 'فایل شهرها پیدا نشد.', 'webino-dashboard' ),
				'count'     => 0,
				'state_key' => (string) $state_key,
			);
		}
		$states = webino_shipping_get_states();
		$key    = sanitize_key( (string) $state_key );
		if ( '' === $key || ! isset( $states[ $key ] ) ) {
			return array(
				'ok'        => false,
				'message'   => __( 'استان نامعتبر است.', 'webino-dashboard' ),
				'count'     => 0,
				'state_key' => $key,
			);
		}
		$state_name = (string) $states[ $key ];
		$term       = term_exists( $key, self::TAXONOMY );
		if ( ! $term ) {
			$term = wp_insert_term(
				$state_name,
				self::TAXONOMY,
				array(
					'slug'        => $key,
					'description' => $state_name,
				)
			);
		}
		if ( is_wp_error( $term ) ) {
			return array(
				'ok'        => false,
				'message'   => $term->get_error_message(),
				'count'     => 0,
				'state_key' => $key,
			);
		}
		$term_id = (int) ( is_array( $term ) ? $term['term_id'] : $term );
		$count   = 0;
		$cities  = webino_shipping_get_state_city( $key );
		$have    = wp_list_pluck( self::get_cities( $term_id ), 'name' );
		$i       = 0;
		foreach ( array_diff( is_array( $cities ) ? $cities : array(), $have ) as $city ) {
			++$i;
			$slug = strtolower( $key ) . '-c' . $i . '-' . substr( md5( (string) $city ), 0, 6 );
			$ins  = wp_insert_term(
				$city,
				self::TAXONOMY,
				array(
					'parent' => $term_id,
					'slug'   => $slug,
				)
			);
			if ( is_wp_error( $ins ) ) {
				// Already exists under this parent — treat as success.
				if ( 'term_exists' === $ins->get_error_code() ) {
					continue;
				}
				continue;
			}
			++$count;
		}
		return array(
			'ok'        => true,
			'message'   => sprintf(
				/* translators: %s: province name */
				__( 'استان %s تکمیل شد.', 'webino-dashboard' ),
				$state_name
			),
			'count'     => $count,
			'state_key' => $key,
		);
	}

	/**
	 * Seed one batch (one province). Empty state_key = next incomplete.
	 *
	 * @param string|null $state_key Optional key.
	 * @return array{ok:bool,installed:bool,next_key:?string,states_done:int,states_total:int,message:string,count:int}
	 */
	public static function seed_batch( $state_key = null ) {
		self::register_taxonomy();
		$status = self::seed_status();
		if ( $status['installed'] ) {
			return array_merge(
				$status,
				array(
					'ok'      => true,
					'message' => __( 'لیست شهرها آماده است.', 'webino-dashboard' ),
					'count'   => 0,
				)
			);
		}
		$key = is_string( $state_key ) && '' !== $state_key ? sanitize_key( $state_key ) : (string) ( $status['next_key'] ?? '' );
		if ( '' === $key ) {
			return array_merge(
				$status,
				array(
					'ok'      => false,
					'message' => __( 'استان بعدی پیدا نشد.', 'webino-dashboard' ),
					'count'   => 0,
				)
			);
		}
		$res    = self::seed_state( $key );
		$status = self::seed_status();
		return array(
			'ok'           => ! empty( $res['ok'] ),
			'installed'    => $status['installed'],
			'needs_seed'   => $status['needs_seed'],
			'next_key'     => $status['next_key'],
			'states_done'  => $status['states_done'],
			'states_total' => $status['states_total'],
			'message'      => (string) ( $res['message'] ?? '' ),
			'count'        => (int) ( $res['count'] ?? 0 ),
		);
	}

	/**
	 * Auto-seed Iran provinces/cities when missing or incomplete (legacy full run).
	 *
	 * @return array{ok:bool,message:string,count:int}
	 */
	public static function ensure_seeded() {
		self::register_taxonomy();
		if ( self::is_seed_complete() ) {
			update_option( 'webino_shipping_cities_installed', 1, false );
			return array(
				'ok'      => true,
				'message' => __( 'لیست شهرها آماده است.', 'webino-dashboard' ),
				'count'   => 0,
			);
		}
		return self::reinstall( false );
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
		if ( taxonomy_exists( self::TAXONOMY ) ) {
			return;
		}
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
		self::register_taxonomy();
		if ( function_exists( 'wp_raise_memory_limit' ) ) {
			wp_raise_memory_limit( 'admin' );
		}
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 300 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		}

		if ( ! self::load_data_file() ) {
			return array( 'ok' => false, 'message' => __( 'فایل شهرها پیدا نشد.', 'webino-dashboard' ), 'count' => 0 );
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
		foreach ( webino_shipping_get_states() as $key => $_state ) {
			$res = self::seed_state( (string) $key );
			if ( ! empty( $res['ok'] ) ) {
				$count += (int) $res['count'];
			}
		}

		$states_ok = self::is_seed_complete();
		if ( $states_ok ) {
			update_option( 'webino_shipping_cities_installed', 1, false );
			return array(
				'ok'      => true,
				'message' => __( 'شهرها نصب شدند.', 'webino-dashboard' ),
				'count'   => $count,
			);
		}

		delete_option( 'webino_shipping_cities_installed' );
		return array(
			'ok'      => false,
			'message' => __( 'نصب شهرها کامل نشد. دوباره تلاش کنید.', 'webino-dashboard' ),
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
