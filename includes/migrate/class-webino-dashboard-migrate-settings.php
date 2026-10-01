<?php
/**
 * Migration settings (destination URL, encrypted token, batching).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option storage. The API token is never returned in the public view.
 */
final class Webino_Dashboard_Migrate_Settings {

	const OPTION = 'webino_dashboard_migrate_settings';

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		$entities = array();
		foreach ( Webino_Dashboard_Migrate_Schema::entity_order() as $key ) {
			$entities[ $key ] = true;
		}
		return array(
			'site_url'   => '',
			'token_enc'  => '',
			'batch_size' => 20,
			'delay_ms'   => 400,
			'timeout'    => 45,
			'dry_run'    => false,
			'entities'   => $entities,
			'endpoints'  => array(),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function raw() {
		$stored = get_option( self::OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return array_merge( self::defaults(), $stored );
	}

	/**
	 * Settings safe to send to the browser.
	 *
	 * @return array<string,mixed>
	 */
	public static function public_view() {
		$raw   = self::raw();
		$token = Webino_Dashboard_Migrate_Crypto::decrypt( (string) $raw['token_enc'] );
		return array(
			'site_url'           => (string) $raw['site_url'],
			'token_set'          => '' !== $token,
			'token_hint'         => Webino_Dashboard_Migrate_Schema::mask_token( $token ),
			'batch_size'         => (int) $raw['batch_size'],
			'delay_ms'           => (int) $raw['delay_ms'],
			'timeout'            => (int) $raw['timeout'],
			'dry_run'            => ! empty( $raw['dry_run'] ),
			'entities'           => self::entity_flags( isset( $raw['entities'] ) ? $raw['entities'] : array() ),
			'endpoints'          => self::effective_endpoints( isset( $raw['endpoints'] ) ? $raw['endpoints'] : array() ),
			'endpoint_defaults'  => Webino_Dashboard_Migrate_Schema::default_endpoints(),
			'schema'             => Webino_Dashboard_Migrate_Schema::NAME,
			'schema_version'     => Webino_Dashboard_Migrate_Schema::VERSION,
			'entity_labels'      => Webino_Dashboard_Migrate_Schema::entity_labels(),
		);
	}

	/**
	 * @param array<string,mixed> $input Request fields.
	 * @return array<string,mixed>|WP_Error Public view, or error.
	 */
	public static function update( array $input ) {
		$current = self::raw();
		$url     = Webino_Dashboard_Migrate_Schema::normalize_site_url( isset( $input['site_url'] ) ? $input['site_url'] : '' );
		if ( is_wp_error( $url ) ) {
			return $url;
		}

		$token_enc = (string) $current['token_enc'];
		if ( ! empty( $input['clear_token'] ) ) {
			$token_enc = '';
		} elseif ( isset( $input['token'] ) && '' !== trim( (string) $input['token'] ) ) {
			$encrypted = Webino_Dashboard_Migrate_Crypto::encrypt( trim( (string) $input['token'] ) );
			if ( is_wp_error( $encrypted ) ) {
				return $encrypted;
			}
			$token_enc = $encrypted;
		}

		$entities = array();
		$posted   = isset( $input['entities'] ) && is_array( $input['entities'] ) ? $input['entities'] : array();
		foreach ( Webino_Dashboard_Migrate_Schema::entity_order() as $key ) {
			$entities[ $key ] = ! empty( $posted[ $key ] );
		}

		$defaults  = Webino_Dashboard_Migrate_Schema::default_endpoints();
		$endpoints = array();
		$posted_ep = isset( $input['endpoints'] ) && is_array( $input['endpoints'] ) ? $input['endpoints'] : array();
		foreach ( $defaults as $key => $fallback ) {
			if ( ! isset( $posted_ep[ $key ] ) ) {
				continue;
			}
			$clean = Webino_Dashboard_Migrate_Schema::sanitize_endpoint_path( $posted_ep[ $key ], $fallback );
			if ( $clean !== $fallback ) {
				$endpoints[ $key ] = $clean;
			}
		}

		$stored = array(
			'site_url'   => $url,
			'token_enc'  => $token_enc,
			'batch_size' => self::clamp_int( isset( $input['batch_size'] ) ? $input['batch_size'] : 20, 1, 100 ),
			'delay_ms'   => self::clamp_int( isset( $input['delay_ms'] ) ? $input['delay_ms'] : 400, 0, 10000 ),
			'timeout'    => self::clamp_int( isset( $input['timeout'] ) ? $input['timeout'] : 45, 5, 120 ),
			'dry_run'    => ! empty( $input['dry_run'] ),
			'entities'   => $entities,
			'endpoints'  => $endpoints,
		);
		update_option( self::OPTION, $stored, false );
		return self::public_view();
	}

	/**
	 * @return string
	 */
	public static function site_url() {
		$raw = self::raw();
		return (string) $raw['site_url'];
	}

	/**
	 * @return string
	 */
	public static function token() {
		$raw = self::raw();
		return Webino_Dashboard_Migrate_Crypto::decrypt( (string) $raw['token_enc'] );
	}

	/**
	 * @return bool
	 */
	public static function dry_run() {
		$raw = self::raw();
		return ! empty( $raw['dry_run'] );
	}

	/**
	 * @return int
	 */
	public static function batch_size() {
		$raw = self::raw();
		return self::clamp_int( $raw['batch_size'], 1, 100 );
	}

	/**
	 * @return int
	 */
	public static function delay_ms() {
		$raw = self::raw();
		return self::clamp_int( $raw['delay_ms'], 0, 10000 );
	}

	/**
	 * @return int
	 */
	public static function timeout() {
		$raw = self::raw();
		return self::clamp_int( $raw['timeout'], 5, 120 );
	}

	/**
	 * Selected entities in schema order.
	 *
	 * @return list<string>
	 */
	public static function selected_entities() {
		$raw   = self::raw();
		$flags = self::entity_flags( isset( $raw['entities'] ) ? $raw['entities'] : array() );
		$out   = array();
		foreach ( Webino_Dashboard_Migrate_Schema::entity_order() as $key ) {
			if ( ! empty( $flags[ $key ] ) ) {
				$out[] = $key;
			}
		}
		return $out;
	}

	/**
	 * @param string $key Endpoint key.
	 * @return string
	 */
	public static function endpoint( $key ) {
		$raw  = self::raw();
		$all  = self::effective_endpoints( isset( $raw['endpoints'] ) ? $raw['endpoints'] : array() );
		$key  = (string) $key;
		return isset( $all[ $key ] ) ? $all[ $key ] : '';
	}

	/**
	 * @param mixed $flags Posted or stored flags.
	 * @return array<string,bool>
	 */
	private static function entity_flags( $flags ) {
		$flags = is_array( $flags ) ? $flags : array();
		$out   = array();
		foreach ( Webino_Dashboard_Migrate_Schema::entity_order() as $key ) {
			$out[ $key ] = ! empty( $flags[ $key ] );
		}
		return $out;
	}

	/**
	 * @param mixed $overrides Stored path overrides.
	 * @return array<string,string>
	 */
	private static function effective_endpoints( $overrides ) {
		$overrides = is_array( $overrides ) ? $overrides : array();
		$paths     = Webino_Dashboard_Migrate_Schema::default_endpoints();
		foreach ( $paths as $key => $fallback ) {
			if ( isset( $overrides[ $key ] ) ) {
				$paths[ $key ] = Webino_Dashboard_Migrate_Schema::sanitize_endpoint_path( $overrides[ $key ], $fallback );
			}
		}
		return $paths;
	}

	/**
	 * @param mixed $value Value.
	 * @param int   $min   Min.
	 * @param int   $max   Max.
	 * @return int
	 */
	private static function clamp_int( $value, $min, $max ) {
		$n = (int) $value;
		if ( $n < $min ) {
			return $min;
		}
		if ( $n > $max ) {
			return $max;
		}
		return $n;
	}
}
