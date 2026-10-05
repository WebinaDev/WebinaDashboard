<?php

namespace Webino_Dashboard_Bots_Bale\Woo;

use Webino_Dashboard_Bots_Bale\Util\PhoneNormalizer;

class AddressBook {
	private const META_KEY         = 'woobale_addresses';
	private const META_DEFAULT_KEY = 'woobale_default_address_id';

	/**
	 * @return list<array<string, string>>
	 */
	public static function all( int $user_id ): array {
		$raw = get_user_meta( $user_id, self::META_KEY, true );
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out = array();
		foreach ( $raw as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$n = self::normalize_address( $row );
			if ( $n['id'] === '' ) {
				continue;
			}
			$out[] = $n;
		}
		return $out;
	}

	/**
	 * @param array<string, mixed> $input
	 * @return array<string, string>|\WP_Error
	 */
	public static function validate_and_build( array $input, string $existing_id = '' ) {
		$label = sanitize_text_field( (string) ( $input['label'] ?? '' ) );
		$first = sanitize_text_field( (string) ( $input['first_name'] ?? '' ) );
		$last  = sanitize_text_field( (string) ( $input['last_name'] ?? '' ) );
		$state = sanitize_text_field( (string) ( $input['state'] ?? '' ) );
		$city  = sanitize_text_field( (string) ( $input['city'] ?? '' ) );
		$addr1 = sanitize_text_field( (string) ( $input['address_1'] ?? '' ) );
		$addr2 = sanitize_text_field( (string) ( $input['address_2'] ?? '' ) );
		$post  = preg_replace( '/\D+/', '', PhoneNormalizer::normalize_digits( (string) ( $input['postcode'] ?? '' ) ) );
		$phone = PhoneNormalizer::normalize( (string) ( $input['phone'] ?? '' ) );
		$country    = sanitize_text_field( (string) ( $input['country'] ?? '' ) );
		if ( $country === '' ) {
			$country = function_exists( 'wc_get_base_location' ) ? (string) wc_get_base_location()['country'] : 'IR';
		}
		$state_term = sanitize_text_field( (string) ( $input['state_term'] ?? '' ) );
		$city_term  = sanitize_text_field( (string) ( $input['city_term'] ?? '' ) );

		if ( $label === '' || $first === '' || $last === '' || $state === '' || $city === '' || $addr1 === '' ) {
			return new \WP_Error( 'address_required', __( 'همه فیلدهای آدرس به‌جز خط دوم آدرس الزامی هستند.', 'webino-dashboard' ) );
		}
		if ( ! is_string( $post ) || strlen( $post ) !== 10 ) {
			return new \WP_Error( 'address_postcode', __( 'کدپستی باید ۱۰ رقم باشد.', 'webino-dashboard' ) );
		}
		if ( $phone === '' || ! preg_match( '/^09\d{9}$/', $phone ) ) {
			return new \WP_Error( 'address_phone', __( 'شماره موبایل گیرنده معتبر نیست.', 'webino-dashboard' ) );
		}

		$now = (string) current_time( 'mysql' );
		return array(
			'id'         => $existing_id !== '' ? $existing_id : wp_generate_uuid4(),
			'label'      => $label,
			'first_name' => $first,
			'last_name'  => $last,
			'country'    => $country,
			'state'      => $state,
			'state_term' => $state_term,
			'city'       => $city,
			'city_term'  => $city_term,
			'address_1'  => $addr1,
			'address_2'  => $addr2,
			'plaque'     => sanitize_text_field( (string) ( $input['plaque'] ?? '' ) ),
			'unit'       => sanitize_text_field( (string) ( $input['unit'] ?? '' ) ),
			'lat'        => is_numeric( $input['lat'] ?? '' ) ? (string) (float) $input['lat'] : '',
			'lng'        => is_numeric( $input['lng'] ?? '' ) ? (string) (float) $input['lng'] : '',
			'postcode'   => $post,
			'phone'      => $phone,
			'updated_at' => $now,
			'created_at' => (string) ( $input['created_at'] ?? $now ),
		);
	}

	/**
	 * @param array<string, string> $address
	 */
	public static function upsert( int $user_id, array $address ): void {
		$all   = self::all( $user_id );
		$found = false;
		foreach ( $all as $i => $row ) {
			if ( $row['id'] === $address['id'] ) {
				$all[ $i ] = self::normalize_address( array_merge( $row, $address ) );
				$found     = true;
				break;
			}
		}
		if ( ! $found ) {
			$all[] = self::normalize_address( $address );
		}
		update_user_meta( $user_id, self::META_KEY, array_values( $all ) );
		if ( self::default_id( $user_id ) === '' ) {
			self::set_default( $user_id, $address['id'] );
		}
	}

	public static function delete( int $user_id, string $id ): bool {
		$all = self::all( $user_id );
		$next = array();
		$removed = false;
		foreach ( $all as $row ) {
			if ( $row['id'] === $id ) {
				$removed = true;
				continue;
			}
			$next[] = $row;
		}
		if ( ! $removed ) {
			return false;
		}
		update_user_meta( $user_id, self::META_KEY, array_values( $next ) );
		$default_id = self::default_id( $user_id );
		if ( $default_id === $id ) {
			if ( ! empty( $next[0]['id'] ) ) {
				self::set_default( $user_id, (string) $next[0]['id'] );
			} else {
				delete_user_meta( $user_id, self::META_DEFAULT_KEY );
			}
		}
		return true;
	}

	/**
	 * @return array<string, string>|null
	 */
	public static function find( int $user_id, string $id ): ?array {
		foreach ( self::all( $user_id ) as $row ) {
			if ( $row['id'] === $id ) {
				return $row;
			}
		}
		return null;
	}

	public static function default_id( int $user_id ): string {
		return sanitize_text_field( (string) get_user_meta( $user_id, self::META_DEFAULT_KEY, true ) );
	}

	public static function set_default( int $user_id, string $id ): void {
		update_user_meta( $user_id, self::META_DEFAULT_KEY, sanitize_text_field( $id ) );
	}

	/**
	 * @return array<string, string>|null
	 */
	public static function default_or_first( int $user_id ): ?array {
		$default_id = self::default_id( $user_id );
		if ( $default_id !== '' ) {
			$found = self::find( $user_id, $default_id );
			if ( $found ) {
				return $found;
			}
		}
		$all = self::all( $user_id );
		return $all[0] ?? null;
	}

	/**
	 * Human-readable province label for chat UI (stored `state` stays WC code).
	 *
	 * @param array<string, string> $addr
	 */
	public static function format_state_for_display( array $addr ): string {
		$tid = isset( $addr['state_term'] ) ? (int) $addr['state_term'] : 0;
		if ( $tid > 0 && taxonomy_exists( 'state_city' ) ) {
			$t = get_term( $tid, 'state_city' );
			if ( $t instanceof \WP_Term ) {
				return (string) $t->name;
			}
		}
		$code    = isset( $addr['state'] ) ? (string) $addr['state'] : '';
		$country = isset( $addr['country'] ) ? trim( (string) $addr['country'] ) : '';
		if ( $country === '' ) {
			$country = function_exists( 'wc_get_base_location' ) ? (string) wc_get_base_location()['country'] : 'IR';
		}
		if ( function_exists( 'WC' ) && \WC()->countries ) {
			$states = \WC()->countries->get_states( $country );
			if ( is_array( $states ) && $code !== '' && isset( $states[ $code ] ) ) {
				return (string) $states[ $code ];
			}
		}
		return $code;
	}

	/**
	 * Human-readable city for chat UI.
	 *
	 * @param array<string, string> $addr
	 */
	public static function format_city_for_display( array $addr ): string {
		$tid = isset( $addr['city_term'] ) ? (int) $addr['city_term'] : 0;
		if ( $tid > 0 && taxonomy_exists( 'state_city' ) ) {
			$t = get_term( $tid, 'state_city' );
			if ( $t instanceof \WP_Term ) {
				return (string) $t->name;
			}
		}
		return isset( $addr['city'] ) ? (string) $addr['city'] : '';
	}

	/**
	 * @param array<string, mixed> $row
	 * @return array<string, string>
	 */
	private static function normalize_address( array $row ): array {
		return array(
			'id'         => sanitize_text_field( (string) ( $row['id'] ?? '' ) ),
			'label'      => sanitize_text_field( (string) ( $row['label'] ?? '' ) ),
			'first_name' => sanitize_text_field( (string) ( $row['first_name'] ?? '' ) ),
			'last_name'  => sanitize_text_field( (string) ( $row['last_name'] ?? '' ) ),
			'country'    => sanitize_text_field( (string) ( $row['country'] ?? '' ) ),
			'state'      => sanitize_text_field( (string) ( $row['state'] ?? '' ) ),
			'state_term' => sanitize_text_field( (string) ( $row['state_term'] ?? '' ) ),
			'city'       => sanitize_text_field( (string) ( $row['city'] ?? '' ) ),
			'city_term'  => sanitize_text_field( (string) ( $row['city_term'] ?? '' ) ),
			'address_1'  => sanitize_text_field( (string) ( $row['address_1'] ?? '' ) ),
			'address_2'  => sanitize_text_field( (string) ( $row['address_2'] ?? '' ) ),
			'plaque'     => sanitize_text_field( (string) ( $row['plaque'] ?? '' ) ),
			'unit'       => sanitize_text_field( (string) ( $row['unit'] ?? '' ) ),
			'lat'        => is_numeric( $row['lat'] ?? '' ) ? (string) (float) $row['lat'] : '',
			'lng'        => is_numeric( $row['lng'] ?? '' ) ? (string) (float) $row['lng'] : '',
			'postcode'   => sanitize_text_field( (string) ( $row['postcode'] ?? '' ) ),
			'phone'      => sanitize_text_field( (string) ( $row['phone'] ?? '' ) ),
			'created_at' => sanitize_text_field( (string) ( $row['created_at'] ?? '' ) ),
			'updated_at' => sanitize_text_field( (string) ( $row['updated_at'] ?? '' ) ),
		);
	}
}
