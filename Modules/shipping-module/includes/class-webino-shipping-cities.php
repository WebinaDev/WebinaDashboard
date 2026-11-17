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

	const TAXONOMY        = 'webino_state_city';
	const META_PREFIX     = 'webino_ship_';
	const SETTINGS_OPTION = 'webino_shipping_cities_settings';

	/**
	 * @return void
	 */
	public static function init() {
		// Modules load at init:10 — register at 11 (same pattern as coffee-origins).
		if ( did_action( 'init' ) ) {
			self::register_taxonomy();
		} else {
			add_action( 'init', array( __CLASS__, 'register_taxonomy' ), 11 );
		}
		add_action( 'webino_shipping_cities_ensure', array( __CLASS__, 'cron_seed_batches' ) );
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'filter_city_bound_zones' ), 15, 2 );
	}

	/**
	 * Section toggle defaults (storefront checkout/My Account/zone city overrides OFF by default).
	 *
	 * @return array{enabled:bool}
	 */
	public static function settings_defaults() {
		return array(
			'enabled' => false,
		);
	}

	/**
	 * Whether city/district storefront & zone-filtering behavior is active.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		return ! empty( self::get_settings()['enabled'] );
	}

	/**
	 * @return array{enabled:bool}
	 */
	public static function get_settings() {
		$raw = get_option( self::SETTINGS_OPTION, null );
		$out = self::settings_defaults();
		if ( is_array( $raw ) && array_key_exists( 'enabled', $raw ) ) {
			$out['enabled'] = (bool) $raw['enabled'];
		}
		return $out;
	}

	/**
	 * @param array<string, mixed> $input Input settings.
	 * @return array{enabled:bool}
	 */
	public static function update_settings( $input ) {
		$out = self::get_settings();
		if ( is_array( $input ) && array_key_exists( 'enabled', $input ) ) {
			$out['enabled'] = (bool) $input['enabled'];
		}
		update_option( self::SETTINGS_OPTION, $out, false );
		return $out;
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
	 * Normalize Persian/Arabic characters and spacing for tolerant matching.
	 *
	 * @param string $value Input string.
	 * @return string
	 */
	public static function normalize_text( $value ) {
		$s = str_replace(
			array( "\xEF\xBB\xBF", "\xE2\x80\x8C", "\xC2\xA0", 'ي', 'ك', 'ﮐ', 'ﮏ', 'ﯼ', 'ﯽ', 'ة', 'أ', 'إ' ),
			array( '', ' ', ' ', 'ی', 'ک', 'ک', 'ک', 'ی', 'ی', 'ه', 'ا', 'ا' ),
			(string) $value
		);
		$s = preg_replace( '/\s+/u', ' ', $s );
		return trim( (string) $s );
	}

	/**
	 * WooCommerce IR / legacy state code => bundled state_city.php key map.
	 *
	 * @return array<string,string>
	 */
	public static function wc_to_state_key_map() {
		return array(
			'WAZ'     => 'AW',
			'EAZ'     => 'AE',
			'ESF'     => 'IS',
			'ABZ'     => 'AL',
			'ALB'     => 'AL',
			'THR'     => 'TE',
			'TEH'     => 'TE',
			'TEHRAN'  => 'TE',
			'ALBORZ'  => 'AL',
			'ISFAHAN' => 'IS',
			'RKH'     => 'KV',
			'KJR'     => 'KV',
			'KHZ'     => 'KZ',
			'FRS'     => 'FA',
			'MZN'     => 'MN',
			'ZJN'     => 'ZA',
			'ADL'     => 'AR',
			'ILM'     => 'IL',
			'BHR'     => 'BU',
			'CHB'     => 'CM',
			'NKH'     => 'KS',
			'KJS'     => 'KS',
			'SKH'     => 'KJ',
			'SMN'     => 'SM',
			'SBN'     => 'SB',
			'GZN'     => 'QZ',
			'QZN'     => 'QZ',
			'QHM'     => 'QM',
			'KRD'     => 'KD',
			'KRN'     => 'KE',
			'KRH'     => 'BK',
			'KBD'     => 'KB',
			'GLS'     => 'GO',
			'GIL'     => 'GI',
			'LRS'     => 'LO',
			'MKZ'     => 'MK',
			'HRZ'     => 'HG',
			'HDN'     => 'HD',
			'YZD'     => 'YA',
		);
	}

	/**
	 * Canonical bundled state_city.php key => WooCommerce IR state code map.
	 *
	 * @return array<string,string>
	 */
	public static function state_key_to_wc_code_map() {
		return array(
			'AW' => 'WAZ',
			'AE' => 'EAZ',
			'IS' => 'ESF',
			'AL' => 'ABZ',
			'TE' => 'THR',
			'KV' => 'RKH',
			'KZ' => 'KHZ',
			'FA' => 'FRS',
			'MN' => 'MZN',
			'ZA' => 'ZJN',
			'AR' => 'ADL',
			'IL' => 'ILM',
			'BU' => 'BHR',
			'CM' => 'CHB',
			'KS' => 'NKH',
			'KJ' => 'SKH',
			'SM' => 'SMN',
			'SB' => 'SBN',
			'QZ' => 'GZN',
			'QM' => 'QHM',
			'KD' => 'KRD',
			'KE' => 'KRN',
			'BK' => 'KRH',
			'KB' => 'KBD',
			'GO' => 'GLS',
			'GI' => 'GIL',
			'LO' => 'LRS',
			'MK' => 'MKZ',
			'HG' => 'HRZ',
			'HD' => 'HDN',
			'YA' => 'YZD',
		);
	}

	/**
	 * Resolve any state key, WC code, IR:CODE, term ID, or Persian name into canonical state_city.php key (e.g. 'TE').
	 *
	 * @param mixed $raw Input state identifier.
	 * @return string Uppercase state key or empty string.
	 */
	public static function resolve_state_key( $raw ) {
		$states = self::data_states();
		if ( ! $states ) {
			return '';
		}
		$val = trim( (string) $raw );
		if ( '' === $val ) {
			return '';
		}
		if ( 0 === stripos( $val, 'IR:' ) ) {
			$val = trim( substr( $val, 3 ) );
		}
		$upper = strtoupper( $val );
		if ( isset( $states[ $upper ] ) ) {
			return $upper;
		}
		$wc_map = self::wc_to_state_key_map();
		if ( isset( $wc_map[ $upper ] ) && isset( $states[ $wc_map[ $upper ] ] ) ) {
			return $wc_map[ $upper ];
		}
		if ( ctype_digit( $val ) && taxonomy_exists( self::TAXONOMY ) ) {
			$term = get_term( (int) $val, self::TAXONOMY );
			if ( $term && ! is_wp_error( $term ) ) {
				$by_slug = strtoupper( (string) $term->slug );
				if ( isset( $states[ $by_slug ] ) ) {
					return $by_slug;
				}
				$val = (string) $term->name;
			}
		}
		$needle = self::normalize_text( $val );
		foreach ( $states as $k => $label ) {
			if ( self::normalize_text( $label ) === $needle ) {
				return (string) $k;
			}
		}
		// Variant spelling tolerance (e.g. "چهارمحال و بختیاری" vs "چهار محال بختیاری").
		$compact = str_replace( array( ' ', 'و' ), '', $needle );
		foreach ( $states as $k => $label ) {
			$cand = str_replace( array( ' ', 'و' ), '', self::normalize_text( $label ) );
			if ( $cand === $compact ) {
				return (string) $k;
			}
		}
		return '';
	}

	/**
	 * Resolve Persian province label from any key / WC code / term ID / name.
	 *
	 * @param mixed $raw State identifier.
	 * @return string Persian province name or empty string.
	 */
	public static function resolve_state_name( $raw ) {
		$key = self::resolve_state_key( $raw );
		if ( '' === $key ) {
			return '';
		}
		$states = self::data_states();
		return isset( $states[ $key ] ) ? (string) $states[ $key ] : '';
	}

	/**
	 * Return raw city names directly from bundled state_city.php (no DB/cron requirement).
	 *
	 * @param mixed $raw State code, WC code, term ID, or Persian name.
	 * @return list<string>
	 */
	public static function data_cities_for_state( $raw ) {
		$key = self::resolve_state_key( $raw );
		if ( '' === $key || ! self::load_data_file() ) {
			return array();
		}
		$cities = webino_shipping_get_state_city( $key );
		return is_array( $cities ) ? array_values( array_filter( array_map( 'strval', $cities ) ) ) : array();
	}

	/**
	 * Locate an existing top-level state term ID without inserting anything.
	 *
	 * @param string $key Canonical uppercase state key (e.g. 'TE').
	 * @param string $state_name Province Persian name.
	 * @return int
	 */
	private static function find_existing_state_term_id( $key, $state_name ) {
		foreach ( array( $key, strtolower( $key ) ) as $slug_try ) {
			$by_slug = get_term_by( 'slug', $slug_try, self::TAXONOMY );
			if ( $by_slug && ! is_wp_error( $by_slug ) && 0 === (int) $by_slug->parent ) {
				return (int) $by_slug->term_id;
			}
		}
		$terms = get_terms(
			array(
				'taxonomy'   => self::TAXONOMY,
				'hide_empty' => false,
				'parent'     => 0,
				'name'       => $state_name,
				'number'     => 1,
			)
		);
		if ( is_array( $terms ) && ! empty( $terms[0] ) && ! is_wp_error( $terms[0] ) ) {
			return (int) $terms[0]->term_id;
		}
		return 0;
	}

	/**
	 * Quickly ensure all 31 top-level province terms exist in taxonomy (<30ms).
	 *
	 * @return void
	 */
	public static function ensure_states_seeded() {
		self::register_taxonomy();
		if ( ! taxonomy_exists( self::TAXONOMY ) ) {
			return;
		}
		$states = self::data_states();
		if ( ! $states ) {
			return;
		}
		$existing = self::get_raw_state_terms();
		if ( count( $existing ) >= count( $states ) ) {
			return;
		}
		$by_key  = array();
		$by_name = array();
		foreach ( $existing as $t ) {
			$by_key[ strtoupper( (string) $t->slug ) ] = (int) $t->term_id;
			$by_name[ self::normalize_text( $t->name ) ] = (int) $t->term_id;
		}
		$added = false;
		foreach ( $states as $key => $name ) {
			$upper = strtoupper( (string) $key );
			if ( isset( $by_key[ $upper ] ) || isset( $by_name[ self::normalize_text( $name ) ] ) ) {
				continue;
			}
			$ins = wp_insert_term(
				$name,
				self::TAXONOMY,
				array(
					'slug'        => $upper,
					'description' => $name,
				)
			);
			if ( ! is_wp_error( $ins ) ) {
				$added = true;
			}
		}
		if ( $added && function_exists( 'clean_taxonomy_cache' ) ) {
			clean_taxonomy_cache( self::TAXONOMY );
		}
	}

	/**
	 * Ensure cities for one province term are seeded on demand when empty.
	 *
	 * @param int $state_term_id Province term ID.
	 * @return void
	 */
	public static function ensure_state_cities_seeded( $state_term_id ) {
		$state_term_id = (int) $state_term_id;
		if ( $state_term_id < 1 ) {
			return;
		}
		self::register_taxonomy();
		$have = self::get_raw_children( $state_term_id );
		if ( count( $have ) > 0 ) {
			return;
		}
		$term = get_term( $state_term_id, self::TAXONOMY );
		if ( ! $term || is_wp_error( $term ) ) {
			return;
		}
		$key = self::resolve_state_key( $term->slug );
		if ( '' === $key ) {
			$key = self::resolve_state_key( $term->name );
		}
		if ( '' === $key ) {
			return;
		}
		self::seed_state( $key );
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
			if ( empty( $res['ok'] ) || ( empty( $res['next_key'] ) && ! empty( $res['installed'] ) ) ) {
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
			return (bool) get_option( 'webino_shipping_cities_installed', 0 ) && count( self::get_raw_state_terms() ) > 0;
		}
		return count( self::get_raw_state_terms() ) >= $expected;
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
		foreach ( (array) $states as $key => $state_name ) {
			$term_id = self::find_existing_state_term_id( (string) $key, (string) $state_name );
			if ( $term_id < 1 ) {
				if ( null === $next ) {
					$next = (string) $key;
				}
				continue;
			}
			$cities = webino_shipping_get_state_city( (string) $key );
			$have   = count( self::get_raw_children( $term_id ) );
			$need   = is_array( $cities ) ? count( $cities ) : 0;
			if ( $have < $need ) {
				if ( null === $next ) {
					$next = (string) $key;
				}
				continue;
			}
			++$done;
		}
		$installed = ( $total > 0 && $done >= $total );
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
	 * @param string $state_key State key e.g. TE or AW.
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
		// Preserve case / resolve aliases cleanly (sanitize_key previously lowercased 'AW' -> 'aw' and broke isset!).
		$key = self::resolve_state_key( $state_key );
		if ( '' === $key || ! isset( $states[ $key ] ) ) {
			return array(
				'ok'        => false,
				'message'   => __( 'استان نامعتبر است.', 'webino-dashboard' ),
				'count'     => 0,
				'state_key' => (string) $state_key,
			);
		}
		$state_name = (string) $states[ $key ];
		$term_id    = self::find_existing_state_term_id( $key, $state_name );
		if ( $term_id < 1 ) {
			$ins = wp_insert_term(
				$state_name,
				self::TAXONOMY,
				array(
					'slug'        => $key,
					'description' => $state_name,
				)
			);
			if ( is_wp_error( $ins ) ) {
				if ( 'term_exists' === $ins->get_error_code() ) {
					$term_id = (int) $ins->get_error_data( 'term_exists' );
				}
				if ( $term_id < 1 ) {
					return array(
						'ok'        => false,
						'message'   => $ins->get_error_message(),
						'count'     => 0,
						'state_key' => $key,
					);
				}
			} else {
				$term_id = (int) ( is_array( $ins ) ? $ins['term_id'] : $ins );
			}
		}

		$count  = 0;
		$cities = webino_shipping_get_state_city( $key );
		$have   = wp_list_pluck( self::get_raw_children( $term_id ), 'name' );
		$i      = 0;
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
				continue;
			}
			++$count;
		}
		if ( function_exists( 'clean_taxonomy_cache' ) ) {
			clean_taxonomy_cache( self::TAXONOMY );
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
	 * @return array{ok:bool,installed:bool,needs_seed:bool,next_key:?string,states_done:int,states_total:int,message:string,count:int}
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
		$resolved = is_string( $state_key ) && '' !== $state_key ? self::resolve_state_key( $state_key ) : '';
		$key      = '' !== $resolved ? $resolved : (string) ( $status['next_key'] ?? '' );
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
		self::ensure_states_seeded();
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
		if ( ! self::is_enabled() || ! is_array( $rates ) || ! $rates ) {
			return $rates;
		}
		$dest         = isset( $package['destination'] ) && is_array( $package['destination'] ) ? $package['destination'] : array();
		$city_name    = trim( (string) ( $dest['city'] ?? '' ) );
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
				'labels'       => array(
					'name'          => __( 'شهرهای ارسال', 'webino-dashboard' ),
					'singular_name' => __( 'شهر', 'webino-dashboard' ),
				),
				'public'       => false,
				'show_ui'      => false,
				'hierarchical' => true,
				'show_in_rest' => false,
				'rewrite'      => false,
			)
		);
	}

	/**
	 * Raw top-level province WP_Term rows without auto-seeding side effects.
	 *
	 * @return list<WP_Term>
	 */
	private static function get_raw_state_terms() {
		if ( ! taxonomy_exists( self::TAXONOMY ) ) {
			return array();
		}
		$terms = get_terms(
			array(
				'taxonomy'   => self::TAXONOMY,
				'hide_empty' => false,
				'parent'     => 0,
			)
		);
		if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
			return array();
		}
		return array_values( array_filter( $terms, static function ( $t ) { return $t instanceof WP_Term; } ) );
	}

	/**
	 * Raw child rows without triggering seed.
	 *
	 * @param int $parent_id Parent term ID.
	 * @return list<array{id:int,name:string,slug:string,parent:int}>
	 */
	private static function get_raw_children( $parent_id ) {
		if ( ! taxonomy_exists( self::TAXONOMY ) || (int) $parent_id < 1 ) {
			return array();
		}
		$terms = get_terms(
			array(
				'taxonomy'   => self::TAXONOMY,
				'hide_empty' => false,
				'parent'     => (int) $parent_id,
			)
		);
		$out = array();
		if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
			return $out;
		}
		foreach ( $terms as $t ) {
			if ( ! ( $t instanceof WP_Term ) ) {
				continue;
			}
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
	 * Always returns all provinces (ensures top-level 31 provinces exist if missing).
	 *
	 * @return list<array{id:int,name:string,slug:string}>
	 */
	public static function get_states() {
		self::register_taxonomy();
		$terms = self::get_raw_state_terms();
		if ( count( $terms ) < count( self::data_states() ) ) {
			self::ensure_states_seeded();
			$terms = self::get_raw_state_terms();
		}
		$out = array();
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
		return self::get_raw_children( $parent_id );
	}

	/**
	 * @param int $state_id State term ID.
	 * @return list<array{id:int,name:string,slug:string,parent:int}>
	 */
	public static function get_cities( $state_id ) {
		$state_id = (int) $state_id;
		if ( $state_id < 1 ) {
			return array();
		}
		$rows = self::get_raw_children( $state_id );
		if ( array() === $rows ) {
			self::ensure_state_cities_seeded( $state_id );
			$rows = self::get_raw_children( $state_id );
		}
		return $rows;
	}

	/**
	 * @param int $city_id City.
	 * @return list<array{id:int,name:string,slug:string,parent:int}>
	 */
	public static function get_districts( $city_id ) {
		return self::get_raw_children( $city_id );
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
	 * @return list<array{id:int,name:string,parent:int,state_id:int,type:string}>
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
			$parent   = (int) $t->parent;
			$type     = 0 === $parent ? 'state' : 'city';
			$resolved = 0 === $parent ? (int) $t->term_id : $parent;
			if ( $parent > 0 ) {
				$p = get_term( $parent, self::TAXONOMY );
				if ( $p && ! is_wp_error( $p ) && (int) $p->parent > 0 ) {
					$type     = 'district';
					$resolved = (int) $p->parent;
				}
			}
			$out[] = array(
				'id'       => (int) $t->term_id,
				'name'     => (string) $t->name,
				'parent'   => $parent,
				'state_id' => $resolved,
				'type'     => $type,
			);
		}
		return $out;
	}
}
