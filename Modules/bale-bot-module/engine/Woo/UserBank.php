<?php

namespace Webino_Dashboard_Bots_Bale\Woo;

/**
 * Shared bank account meta for Bale bot and dashboard user profile.
 */
class UserBank {

	const META_KEY = 'woobale_bank';

	/**
	 * @param int $user_id User ID.
	 * @return array{bank_name:string,account_number:string,card_number:string,sheba:string}
	 */
	public static function get( int $user_id ): array {
		$raw = get_user_meta( $user_id, self::META_KEY, true );
		if ( ! is_array( $raw ) ) {
			return self::empty();
		}
		return self::normalize( $raw );
	}

	/**
	 * @param int                   $user_id User ID.
	 * @param array<string, string> $bank Bank fields.
	 * @return void
	 */
	public static function save( int $user_id, array $bank ): void {
		update_user_meta( $user_id, self::META_KEY, self::normalize( $bank ) );
	}

	/**
	 * @return array{bank_name:string,account_number:string,card_number:string,sheba:string}
	 */
	public static function empty(): array {
		return array(
			'bank_name'      => '',
			'account_number' => '',
			'card_number'    => '',
			'sheba'          => '',
		);
	}

	/**
	 * @param array<string, mixed> $raw Raw meta.
	 * @return array{bank_name:string,account_number:string,card_number:string,sheba:string}
	 */
	private static function normalize( array $raw ): array {
		return array(
			'bank_name'      => sanitize_text_field( (string) ( $raw['bank_name'] ?? '' ) ),
			'account_number' => sanitize_text_field( (string) ( $raw['account_number'] ?? '' ) ),
			'card_number'    => preg_replace( '/\D+/', '', (string) ( $raw['card_number'] ?? '' ) ),
			'sheba'          => strtoupper( preg_replace( '/\s+/', '', (string) ( $raw['sheba'] ?? '' ) ) ),
		);
	}
}
