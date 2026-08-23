<?php
/**
 * Core user address book (woobale_addresses meta).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Address CRUD without bot-module dependency.
 */
class Webino_Dashboard_Addresses {

	const META_KEY         = 'woobale_addresses';
	const META_DEFAULT_KEY = 'woobale_default_address_id';

	/**
	 * @param int $user_id User ID.
	 * @return list<array<string, string>>
	 */
	public static function all( $user_id ) {
		$raw = get_user_meta( (int) $user_id, self::META_KEY, true );
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out = array();
		foreach ( $raw as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$n = self::normalize( $row );
			if ( '' === $n['id'] ) {
				continue;
			}
			$out[] = $n;
		}
		return $out;
	}

	/**
	 * @param int $user_id User ID.
	 * @return string
	 */
	public static function default_id( $user_id ) {
		return (string) get_user_meta( (int) $user_id, self::META_DEFAULT_KEY, true );
	}

	/**
	 * @param array<string, mixed> $input Input.
	 * @param string               $existing_id Existing ID.
	 * @return array<string, string>|WP_Error
	 */
	public static function validate_and_build( $input, $existing_id = '' ) {
		$input = is_array( $input ) ? $input : array();

		$label = sanitize_text_field( (string) ( $input['label'] ?? '' ) );
		$first = sanitize_text_field( (string) ( $input['first_name'] ?? '' ) );
		$last  = sanitize_text_field( (string) ( $input['last_name'] ?? '' ) );
		$state = sanitize_text_field( (string) ( $input['state'] ?? '' ) );
		$city  = sanitize_text_field( (string) ( $input['city'] ?? '' ) );
		$addr1 = sanitize_text_field( (string) ( $input['address_1'] ?? '' ) );
		$addr2 = sanitize_text_field( (string) ( $input['address_2'] ?? '' ) );
		$plaque = sanitize_text_field( (string) ( $input['plaque'] ?? '' ) );
		$unit   = sanitize_text_field( (string) ( $input['unit'] ?? '' ) );
		$post   = preg_replace( '/\D+/', '', (string) ( $input['postcode'] ?? '' ) );
		$phone  = self::normalize_phone( (string) ( $input['phone'] ?? '' ) );
		$country = sanitize_text_field( (string) ( $input['country'] ?? '' ) );
		if ( '' === $country ) {
			$country = function_exists( 'wc_get_base_location' ) ? (string) wc_get_base_location()['country'] : 'IR';
		}
		$state_term = sanitize_text_field( (string) ( $input['state_term'] ?? '' ) );
		$city_term  = sanitize_text_field( (string) ( $input['city_term'] ?? '' ) );
		$lat        = isset( $input['lat'] ) ? (string) $input['lat'] : '';
		$lng        = isset( $input['lng'] ) ? (string) $input['lng'] : '';
		$lat        = is_numeric( $lat ) ? (string) (float) $lat : '';
		$lng        = is_numeric( $lng ) ? (string) (float) $lng : '';

		if ( '' === $label || '' === $first || '' === $last || '' === $state || '' === $city || '' === $addr1 ) {
			return new WP_Error( 'address_required', __( 'All address fields except unit are required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( strlen( $post ) !== 10 ) {
			return new WP_Error( 'address_postcode', __( 'Postcode must be 10 digits.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( '' === $phone || ! preg_match( '/^09\d{9}$/', $phone ) ) {
			return new WP_Error( 'address_phone', __( 'Recipient mobile number is invalid.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$now = (string) current_time( 'mysql' );
		return array(
			'id'         => '' !== $existing_id ? $existing_id : wp_generate_uuid4(),
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
			'plaque'     => $plaque,
			'unit'       => $unit,
			'lat'        => $lat,
			'lng'        => $lng,
			'postcode'   => $post,
			'phone'      => $phone,
			'updated_at' => $now,
			'created_at' => (string) ( $input['created_at'] ?? $now ),
		);
	}

	/**
	 * @param int                   $user_id User ID.
	 * @param array<string, string> $address Address row.
	 * @return void
	 */
	public static function upsert( $user_id, $address ) {
		$user_id = (int) $user_id;
		$items   = self::all( $user_id );
		$found   = false;
		foreach ( $items as $i => $row ) {
			if ( isset( $row['id'] ) && (string) $row['id'] === (string) $address['id'] ) {
				$items[ $i ] = self::normalize( array_merge( $row, $address ) );
				$found      = true;
				break;
			}
		}
		if ( ! $found ) {
			$items[] = self::normalize( $address );
		}
		update_user_meta( $user_id, self::META_KEY, $items );
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $address_id Address ID.
	 * @return bool
	 */
	public static function delete( $user_id, $address_id ) {
		$user_id    = (int) $user_id;
		$address_id = (string) $address_id;
		$items      = self::all( $user_id );
		$next       = array();
		$removed    = false;
		foreach ( $items as $row ) {
			if ( isset( $row['id'] ) && (string) $row['id'] === $address_id ) {
				$removed = true;
				continue;
			}
			$next[] = $row;
		}
		if ( ! $removed ) {
			return false;
		}
		update_user_meta( $user_id, self::META_KEY, $next );
		if ( self::default_id( $user_id ) === $address_id ) {
			delete_user_meta( $user_id, self::META_DEFAULT_KEY );
		}
		return true;
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $address_id Address ID.
	 * @return void
	 */
	public static function set_default( $user_id, $address_id ) {
		update_user_meta( (int) $user_id, self::META_DEFAULT_KEY, sanitize_text_field( (string) $address_id ) );
	}

	/**
	 * @param array<string, mixed> $row Raw row.
	 * @return array<string, string>
	 */
	public static function normalize( $row ) {
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

	/**
	 * @param string $phone Phone.
	 * @return string
	 */
	private static function normalize_phone( $phone ) {
		$digits = preg_replace( '/\D+/', '', (string) $phone );
		if ( preg_match( '/^9\d{9}$/', $digits ) ) {
			return '0' . $digits;
		}
		return $digits;
	}
}
