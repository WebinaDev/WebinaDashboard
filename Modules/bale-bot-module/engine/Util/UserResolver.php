<?php

namespace Webino_Dashboard_Bots_Bale\Util;

/**
 * Find WP user by phone (billing_phone, login).
 */
class UserResolver {

	public static function find_user_by_phone( string $normalized_phone ): ?\WP_User {
		$variants = PhoneNormalizer::search_variants( $normalized_phone );

		foreach ( $variants as $v ) {
			$users = get_users(
				array(
					'meta_key'   => 'billing_phone',
					'meta_value' => $v,
					'number'     => 1,
				)
			);
			if ( ! empty( $users ) ) {
				return $users[0];
			}
		}

		foreach ( $variants as $v ) {
			$u = get_user_by( 'login', $v );
			if ( $u ) {
				return $u;
			}
		}

		$email_guess = $normalized_phone . '@bale.local';
		$u           = get_user_by( 'email', $email_guess );
		if ( $u ) {
			return $u;
		}

		return null;
	}

	/**
	 * @return int|\WP_Error
	 */
	public static function create_customer( string $normalized_phone ) {
		$email = $normalized_phone . '@bale.local';
		$login = 'bale_' . preg_replace( '/\D/', '', $normalized_phone );
		if ( strlen( $login ) < 4 ) {
			$login .= wp_generate_password( 4, false );
		}
		if ( username_exists( $login ) ) {
			$login .= wp_generate_password( 4, false );
		}

		$user_id = wp_insert_user(
			array(
				'user_login'   => $login,
				'user_email'   => $email,
				'user_pass'    => wp_generate_password( 20 ),
				'display_name' => $normalized_phone,
				'role'         => 'customer',
			)
		);

		if ( is_wp_error( $user_id ) ) {
			return $user_id;
		}

		update_user_meta( $user_id, 'billing_phone', $normalized_phone );
		return $user_id;
	}
}
