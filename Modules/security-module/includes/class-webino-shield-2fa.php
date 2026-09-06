<?php
/**
 * Two-factor authentication (TOTP + backup codes).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * TOTP RFC 6238 (backup codes). WebAuthn is not offered in v1.
 */
final class Webino_Shield_2FA {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'authenticate', array( __CLASS__, 'verify_login' ), 40, 3 );
		add_action( 'show_user_profile', array( __CLASS__, 'profile_fields' ) );
		add_action( 'personal_options_update', array( __CLASS__, 'save_profile' ) );
	}

	/**
	 * @param WP_User|WP_Error|null $user     User.
	 * @param string                $username Username.
	 * @param string                $password Password.
	 * @return WP_User|WP_Error|null
	 */
	public static function verify_login( $user, $username, $password ) {
		unset( $username, $password );
		if ( is_wp_error( $user ) || ! $user instanceof WP_User ) {
			return $user;
		}

		if ( ! self::is_required_for_user( $user ) && ! self::is_enabled( $user->ID ) ) {
			return $user;
		}

		$code = isset( $_POST['webino_shield_2fa'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['webino_shield_2fa'] ) ) : '';
		if ( '' === $code ) {
			return new WP_Error( 'shield_2fa_required', __( 'Two-factor code required.', 'webino-dashboard' ) );
		}

		if ( self::verify_code( $user->ID, $code ) || self::verify_backup( $user->ID, $code ) ) {
			return $user;
		}

		return new WP_Error( 'shield_2fa_invalid', __( 'Invalid two-factor code.', 'webino-dashboard' ) );
	}

	/**
	 * @param WP_User $user User.
	 * @return bool
	 */
	public static function is_required_for_user( $user ) {
		$s = Webino_Dashboard_Security_Settings::get();
		$roles = (array) ( $s['login']['2fa_required_roles'] ?? array() );
		foreach ( $roles as $role ) {
			if ( in_array( $role, (array) $user->roles, true ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param int $user_id User ID.
	 * @return bool
	 */
	public static function is_enabled( $user_id ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$row = $wpdb->get_var(
			$wpdb->prepare(
				'SELECT enabled FROM ' . Webino_Dashboard_Security_Db::table( '2fa' ) . ' WHERE user_id = %d',
				(int) $user_id
			)
		);
		return (bool) $row;
	}

	/**
	 * @param int $user_id User ID.
	 * @return array<string,mixed>
	 */
	public static function setup( $user_id ) {
		$secret = self::generate_secret();
		$backup = self::generate_backup_codes();
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$wpdb->replace(
			Webino_Dashboard_Security_Db::table( '2fa' ),
			array(
				'user_id'      => (int) $user_id,
				'secret'       => $secret,
				'backup_codes' => wp_json_encode( array_map( 'wp_hash_password', $backup ) ),
				'webauthn'     => wp_json_encode( array() ),
				'enabled'      => 0,
				'updated_at'   => current_time( 'mysql', true ),
			)
		);
		return array(
			'secret'       => $secret,
			'backup_codes' => $backup,
			'otpauth'      => 'otpauth://totp/WebinoShield:' . rawurlencode( wp_get_current_user()->user_login ) . '?secret=' . $secret . '&issuer=WebinoShield',
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @return bool
	 */
	public static function disable( $user_id ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		return (bool) $wpdb->update(
			Webino_Dashboard_Security_Db::table( '2fa' ),
			array( 'enabled' => 0, 'updated_at' => current_time( 'mysql', true ) ),
			array( 'user_id' => (int) $user_id ),
			array( '%d', '%s' ),
			array( '%d' )
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @return bool
	 */
	public static function enable( $user_id ) {
		global $wpdb;
		return (bool) $wpdb->update(
			Webino_Dashboard_Security_Db::table( '2fa' ),
			array( 'enabled' => 1, 'updated_at' => current_time( 'mysql', true ) ),
			array( 'user_id' => (int) $user_id ),
			array( '%d', '%s' ),
			array( '%d' )
		);
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $code    Code.
	 * @return bool
	 */
	public static function verify_code( $user_id, $code ) {
		$secret = self::get_secret( $user_id );
		if ( ! $secret ) {
			return false;
		}
		$time_slice = floor( time() / 30 );
		for ( $i = -1; $i <= 1; $i++ ) {
			if ( hash_equals( self::totp( $secret, $time_slice + $i ), $code ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $code    Backup code.
	 * @return bool
	 */
	public static function verify_backup( $user_id, $code ) {
		global $wpdb;
		$row = $wpdb->get_row(
			$wpdb->prepare( 'SELECT backup_codes FROM ' . Webino_Dashboard_Security_Db::table( '2fa' ) . ' WHERE user_id = %d', (int) $user_id ),
			ARRAY_A
		);
		if ( ! $row ) {
			return false;
		}
		$codes = json_decode( (string) ( $row['backup_codes'] ?? '[]' ), true );
		if ( ! is_array( $codes ) ) {
			return false;
		}
		foreach ( $codes as $i => $hash ) {
			if ( wp_check_password( $code, $hash ) ) {
				unset( $codes[ $i ] );
				$wpdb->update(
					Webino_Dashboard_Security_Db::table( '2fa' ),
					array( 'backup_codes' => wp_json_encode( array_values( $codes ) ) ),
					array( 'user_id' => (int) $user_id )
				);
				return true;
			}
		}
		return false;
	}

	/**
	 * @param int $user_id User ID.
	 * @return string
	 */
	private static function get_secret( $user_id ) {
		global $wpdb;
		return (string) $wpdb->get_var(
			$wpdb->prepare( 'SELECT secret FROM ' . Webino_Dashboard_Security_Db::table( '2fa' ) . ' WHERE user_id = %d', (int) $user_id )
		);
	}

	/**
	 * @param string $secret Secret.
	 * @param int    $slice  Time slice.
	 * @return string
	 */
	private static function totp( $secret, $slice ) {
		$key  = self::base32_decode( $secret );
		$time = pack( 'N*', 0, $slice );
		$hash = hash_hmac( 'sha1', $time, $key, true );
		$offset = ord( $hash[19] ) & 0x0F;
		$code = (
			( ( ord( $hash[ $offset ] ) & 0x7F ) << 24 ) |
			( ( ord( $hash[ $offset + 1 ] ) & 0xFF ) << 16 ) |
			( ( ord( $hash[ $offset + 2 ] ) & 0xFF ) << 8 ) |
			( ord( $hash[ $offset + 3 ] ) & 0xFF )
		) % 1000000;
		return str_pad( (string) $code, 6, '0', STR_PAD_LEFT );
	}

	/**
	 * @return string
	 */
	private static function generate_secret() {
		$chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
		$secret = '';
		for ( $i = 0; $i < 16; $i++ ) {
			$secret .= $chars[ random_int( 0, 31 ) ];
		}
		return $secret;
	}

	/**
	 * @return array<int,string>
	 */
	private static function generate_backup_codes() {
		$codes = array();
		for ( $i = 0; $i < 8; $i++ ) {
			$codes[] = wp_generate_password( 10, false, false );
		}
		return $codes;
	}

	/**
	 * @param string $b32 Base32.
	 * @return string
	 */
	private static function base32_decode( $b32 ) {
		$map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
		$b32 = strtoupper( $b32 );
		$buffer = 0;
		$bits   = 0;
		$output = '';
		for ( $i = 0, $len = strlen( $b32 ); $i < $len; $i++ ) {
			$val = strpos( $map, $b32[ $i ] );
			if ( false === $val ) {
				continue;
			}
			$buffer = ( $buffer << 5 ) | $val;
			$bits  += 5;
			if ( $bits >= 8 ) {
				$bits -= 8;
				$output .= chr( ( $buffer >> $bits ) & 0xFF );
			}
		}
		return $output;
	}

	/**
	 * @param WP_User $user User.
	 * @return void
	 */
	public static function profile_fields( $user ) {
		if ( ! self::is_enabled( $user->ID ) ) {
			return;
		}
		echo '<h2>Webino Shield 2FA</h2><p>' . esc_html__( 'Two-factor authentication is enabled.', 'webino-dashboard' ) . '</p>';
	}

	/**
	 * @param int $user_id User ID.
	 * @return void
	 */
	public static function save_profile( $user_id ) {
		unset( $user_id );
	}

	/**
	 * @param int $user_id User ID.
	 * @return void
	 */
	public static function invalidate_sessions( $user_id ) {
		global $wpdb;
		$wpdb->update(
			Webino_Dashboard_Security_Db::table( 'sessions' ),
			array( 'invalidated' => 1 ),
			array( 'user_id' => (int) $user_id ),
			array( '%d' ),
			array( '%d' )
		);
		$sessions = WP_Session_Tokens::get_instance( $user_id );
		$sessions->destroy_all();
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function status_summary() {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( '2fa' );
		$enabled = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE enabled = 1" );
		return array(
			'enabled_users'  => $enabled,
			'required_roles' => Webino_Dashboard_Security_Settings::get()['login']['2fa_required_roles'] ?? array(),
			'methods'        => array( 'totp', 'backup_codes' ),
		);
	}
}
