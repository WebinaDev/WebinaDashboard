<?php
/**
 * Digikala auth — RSA-4096 decrypt of authorization_code → access/refresh tokens.
 *
 * Digikala encrypts the seller authorization_code with the seller's public key
 * (RSA 4096). The seller decrypts with the matching private key, then POSTs the
 * plaintext to /open-api/v1/auth/token.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Digikala OpenAPI token management.
 */
class WNC_Digikala_Auth {

	const TOKEN_OPTION = 'wnc_digikala_tokens';

	/**
	 * Credentials from settings.
	 *
	 * @return array
	 */
	public static function credentials() {
		$p = WNC_Settings::get_platform( 'digikala' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		// Migrate legacy authorization_code into encrypted_code if needed.
		if ( empty( $c['encrypted_code'] ) ) {
			if ( ! empty( $c['validation_code'] ) ) {
				$c['encrypted_code'] = $c['validation_code'];
			} elseif ( ! empty( $c['authorization_code'] ) ) {
				$c['encrypted_code'] = $c['authorization_code'];
			}
		}
		return wp_parse_args(
			$c,
			array(
				'base_url'                   => 'https://seller.digikala.com',
				'client_code'                => '',
				'encrypted_code'             => '',
				'private_key'                => '',
				'public_key'                 => '',
				'credit_increase_percentage' => 0,
			)
		);
	}

	/**
	 * Stored tokens.
	 *
	 * @return array
	 */
	public static function tokens() {
		$t = get_option( self::TOKEN_OPTION, array() );
		return is_array( $t ) ? $t : array();
	}

	/**
	 * Parse Digikala datetime object/string into unix timestamp.
	 *
	 * Digikala returns e.g. access_token_expires_at: { date, timezone, timezone_type }.
	 *
	 * @param mixed $value Raw expiry value.
	 * @return int Unix timestamp or 0.
	 */
	public static function parse_expiry( $value ) {
		if ( is_numeric( $value ) ) {
			$n = (int) $value;
			// Digikala sometimes returns ms; treat large values as ms.
			if ( $n > 20000000000 ) {
				$n = (int) floor( $n / 1000 );
			}
			return $n > 0 ? $n : 0;
		}
		if ( is_array( $value ) ) {
			$date = (string) ( $value['date'] ?? $value['datetime'] ?? '' );
			$tz   = (string) ( $value['timezone'] ?? 'Asia/Tehran' );
			if ( '' === $date ) {
				return 0;
			}
			try {
				$dt = new DateTimeImmutable( $date, new DateTimeZone( $tz ? $tz : 'Asia/Tehran' ) );
				return $dt->getTimestamp();
			} catch ( Exception $e ) {
				$ts = strtotime( $date );
				return $ts ? (int) $ts : 0;
			}
		}
		if ( is_string( $value ) && '' !== trim( $value ) ) {
			try {
				$dt = new DateTimeImmutable( trim( $value ), new DateTimeZone( 'Asia/Tehran' ) );
				return $dt->getTimestamp();
			} catch ( Exception $e ) {
				$ts = strtotime( $value );
				return $ts ? (int) $ts : 0;
			}
		}
		return 0;
	}

	/**
	 * Persist tokens from API data payload.
	 *
	 * @param array $data Token payload (usually response['data']).
	 */
	public static function persist_tokens( array $data ) {
		$current = self::tokens();
		$now     = time();

		$expires = 0;
		if ( isset( $data['expires_in'] ) ) {
			$expires = $now + (int) $data['expires_in'];
		} elseif ( ! empty( $data['access_token_expires_at'] ) ) {
			$expires = self::parse_expiry( $data['access_token_expires_at'] );
		} elseif ( ! empty( $data['access_expires_at'] ) ) {
			$expires = self::parse_expiry( $data['access_expires_at'] );
		}
		if ( $expires <= $now ) {
			// Digikala: access ≈ 1 hour.
			$expires = $now + HOUR_IN_SECONDS;
		}

		$refresh_expires = 0;
		if ( isset( $data['refresh_expires_in'] ) ) {
			$refresh_expires = $now + (int) $data['refresh_expires_in'];
		} elseif ( ! empty( $data['refresh_token_expires_at'] ) ) {
			$refresh_expires = self::parse_expiry( $data['refresh_token_expires_at'] );
		} elseif ( ! empty( $data['refresh_expires_at'] ) ) {
			$refresh_expires = self::parse_expiry( $data['refresh_expires_at'] );
		} elseif ( ! empty( $current['refresh_expires_at'] ) && (int) $current['refresh_expires_at'] > $now ) {
			$refresh_expires = (int) $current['refresh_expires_at'];
		}
		if ( $refresh_expires <= $now ) {
			// Digikala: refresh ≈ 6 months.
			$refresh_expires = $now + ( 6 * MONTH_IN_SECONDS );
		}

		$access = (string) ( $data['access_token'] ?? '' );
		if ( '' === $access ) {
			$access = (string) ( $current['access_token'] ?? '' );
		}
		$refresh = (string) ( $data['refresh_token'] ?? '' );
		if ( '' === $refresh ) {
			$refresh = (string) ( $current['refresh_token'] ?? '' );
		}

		$merged = array(
			'access_token'       => $access,
			'refresh_token'      => $refresh,
			'access_expires_at'  => $expires,
			'refresh_expires_at' => $refresh_expires,
		);
		update_option( self::TOKEN_OPTION, $merged, false );
	}

	/**
	 * Sanitize / normalize PEM private key without destroying newlines.
	 *
	 * @param string $raw Raw pasted key.
	 * @return string
	 */
	public static function normalize_private_key( $raw ) {
		$key = str_replace( array( "\r\n", "\r" ), "\n", (string) $raw );
		$key = trim( $key );
		$key = str_replace( "\0", '', $key );
		if ( '' === $key ) {
			return '';
		}

		// Already PEM.
		if ( false !== strpos( $key, 'BEGIN' ) && false !== strpos( $key, 'PRIVATE KEY' ) ) {
			return $key;
		}

		// Raw base64 body → wrap as PKCS#8 PEM.
		$body = preg_replace( '/\s+/', '', $key );
		$body = chunk_split( $body, 64, "\n" );
		return "-----BEGIN PRIVATE KEY-----\n" . trim( $body ) . "\n-----END PRIVATE KEY-----";
	}

	/**
	 * Normalize public key PEM.
	 *
	 * @param string $raw Raw key.
	 * @return string
	 */
	public static function normalize_public_key( $raw ) {
		$key = str_replace( array( "\r\n", "\r" ), "\n", (string) $raw );
		$key = trim( str_replace( "\0", '', $key ) );
		if ( '' === $key ) {
			return '';
		}
		if ( false !== strpos( $key, 'BEGIN' ) && false !== strpos( $key, 'PUBLIC KEY' ) ) {
			return $key;
		}
		$body = preg_replace( '/\s+/', '', $key );
		$body = chunk_split( $body, 64, "\n" );
		return "-----BEGIN PUBLIC KEY-----\n" . trim( $body ) . "\n-----END PUBLIC KEY-----";
	}

	/**
	 * Generate RSA-4096 key pair for Digikala (seller keeps private, uploads public).
	 *
	 * @return array|WP_Error { private_key, public_key }
	 */
	public static function generate_rsa_keypair() {
		if ( class_exists( '\\WncDigikala\\Auth', false ) ) {
			$res = \WncDigikala\Auth::generate_rsa_keypair();
			if ( is_wp_error( $res ) ) {
				return $res;
			}
			// Mirror into classic settings for WP-Admin fields.
			$all = WNC_Settings::all();
			if ( empty( $all['digikala'] ) || ! is_array( $all['digikala'] ) ) {
				$all['digikala'] = array( 'credentials' => array() );
			}
			if ( empty( $all['digikala']['credentials'] ) || ! is_array( $all['digikala']['credentials'] ) ) {
				$all['digikala']['credentials'] = array();
			}
			$eng = \WncDigikala\Settings::all();
			$all['digikala']['credentials']['public_key']  = $eng['public_key'] ?? '';
			$all['digikala']['credentials']['private_key'] = $eng['private_key'] ?? '';
			update_option( 'wnc_settings', $all, false );
			return array(
				'public_key'  => $res['public_key'],
				'private_key' => '', // never echo private via this path in AJAX success payloads that only need public.
			);
		}
		if ( ! function_exists( 'openssl_pkey_new' ) ) {
			return new WP_Error( 'wnc_dk_auth', __( 'افزونه OpenSSL در PHP فعال نیست.', 'webinaconnector' ) );
		}

		$config = array(
			'private_key_bits' => 4096,
			'private_key_type' => OPENSSL_KEYTYPE_RSA,
		);
		$res = openssl_pkey_new( $config );
		if ( false === $res ) {
			return new WP_Error( 'wnc_dk_auth', __( 'تولید کلید RSA 4096 ناموفق بود.', 'webinaconnector' ) );
		}

		$private = '';
		if ( ! openssl_pkey_export( $res, $private ) || '' === $private ) {
			return new WP_Error( 'wnc_dk_auth', __( 'خروجی کلید خصوصی ناموفق بود.', 'webinaconnector' ) );
		}
		$details = openssl_pkey_get_details( $res );
		$public  = is_array( $details ) ? (string) ( $details['key'] ?? '' ) : '';
		if ( '' === $public ) {
			return new WP_Error( 'wnc_dk_auth', __( 'خروجی کلید عمومی ناموفق بود.', 'webinaconnector' ) );
		}

		$all = WNC_Settings::all();
		if ( empty( $all['digikala'] ) || ! is_array( $all['digikala'] ) ) {
			$all['digikala'] = array( 'credentials' => array() );
		}
		if ( empty( $all['digikala']['credentials'] ) || ! is_array( $all['digikala']['credentials'] ) ) {
			$all['digikala']['credentials'] = array();
		}
		$all['digikala']['credentials']['private_key'] = $private;
		$all['digikala']['credentials']['public_key']  = $public;
		update_option( 'wnc_settings', $all, false );

		return array(
			'private_key' => $private,
			'public_key'  => $public,
		);
	}

	/**
	 * Decode Digikala Base64 ciphertext (standard / url-safe / whitespace).
	 *
	 * @param string $encoded Encoded ciphertext.
	 * @return string|false Binary ciphertext.
	 */
	private static function decode_ciphertext( $encoded ) {
		$encoded = trim( (string) $encoded );
		$encoded = preg_replace( '/\s+/', '', $encoded );
		if ( '' === $encoded ) {
			return false;
		}

		$bin = base64_decode( $encoded, true );
		if ( false !== $bin && '' !== $bin ) {
			return $bin;
		}

		// URL-safe Base64.
		$safe = strtr( $encoded, '-_', '+/' );
		$pad  = strlen( $safe ) % 4;
		if ( $pad ) {
			$safe .= str_repeat( '=', 4 - $pad );
		}
		$bin = base64_decode( $safe, true );
		if ( false !== $bin && '' !== $bin ) {
			return $bin;
		}

		// Last resort: non-strict.
		$bin = base64_decode( $encoded, false );
		return ( false !== $bin && '' !== $bin ) ? $bin : false;
	}

	/**
	 * Decrypt Digikala RSA-encrypted authorization_code with seller private key.
	 *
	 * @param string $encrypted_code Base64 ciphertext from Digikala.
	 * @param string $private_key    PEM private key (RSA 4096).
	 * @return string|WP_Error Plaintext authorization_code.
	 */
	public static function decrypt_authorization_code( $encrypted_code, $private_key ) {
		$encrypted_code = trim( (string) $encrypted_code );
		$private_key    = self::normalize_private_key( $private_key );

		if ( '' === $encrypted_code ) {
			return new WP_Error( 'wnc_dk_auth', __( 'کد هویت‌سنجی رمزشده دیجیکالا وارد نشده است.', 'webinaconnector' ) );
		}
		if ( '' === $private_key ) {
			return new WP_Error( 'wnc_dk_auth', __( 'کلید خصوصی RSA دیجیکالا وارد نشده است.', 'webinaconnector' ) );
		}
		if ( ! function_exists( 'openssl_private_decrypt' ) ) {
			return new WP_Error( 'wnc_dk_auth', __( 'افزونه OpenSSL در PHP فعال نیست.', 'webinaconnector' ) );
		}

		$bin = self::decode_ciphertext( $encrypted_code );
		if ( false === $bin ) {
			return new WP_Error( 'wnc_dk_auth', __( 'کد هویت‌سنجی Base64 نامعتبر است.', 'webinaconnector' ) );
		}

		$key = openssl_pkey_get_private( $private_key );
		if ( false === $key ) {
			// Try RSA PRIVATE KEY header variant after re-wrap.
			$alt = preg_replace( '/BEGIN PRIVATE KEY/', 'BEGIN RSA PRIVATE KEY', $private_key );
			$alt = preg_replace( '/END PRIVATE KEY/', 'END RSA PRIVATE KEY', $alt );
			$key = openssl_pkey_get_private( $alt );
		}
		if ( false === $key ) {
			return new WP_Error( 'wnc_dk_auth', __( 'کلید خصوصی PEM نامعتبر است. باید کلید خصوصی RSA 4096 مربوط به کلید عمومی ثبت‌شده در دیجیکالا باشد.', 'webinaconnector' ) );
		}

		$details = openssl_pkey_get_details( $key );
		$bits    = is_array( $details ) ? (int) ( $details['bits'] ?? 0 ) : 0;
		if ( $bits > 0 && $bits < 2048 ) {
			WNC_Logger::info( 'Digikala private key bits=' . $bits . ' (expected 4096)', 'digikala', 'auth' );
		}

		$plain   = '';
		$ok      = false;
		$paddings = array( OPENSSL_PKCS1_PADDING );
		if ( defined( 'OPENSSL_PKCS1_OAEP_PADDING' ) ) {
			$paddings[] = OPENSSL_PKCS1_OAEP_PADDING;
		}

		foreach ( $paddings as $padding ) {
			$try = '';
			if ( openssl_private_decrypt( $bin, $try, $key, $padding ) && '' !== (string) $try ) {
				$plain = $try;
				$ok    = true;
				break;
			}
		}

		// Some PHP builds support OAEP with explicit digest via openssl_pkey_decrypt (PHP 8.5+).
		if ( ! $ok && function_exists( 'openssl_pkey_decrypt' ) && defined( 'OPENSSL_PKCS1_OAEP_PADDING' ) ) {
			foreach ( array( 'sha256', 'sha1' ) as $digest ) {
				$try = '';
				if ( @openssl_pkey_decrypt( $bin, $try, $key, OPENSSL_PKCS1_OAEP_PADDING, $digest ) && '' !== (string) $try ) {
					$plain = $try;
					$ok    = true;
					break;
				}
			}
		}

		if ( ! $ok || '' === (string) $plain ) {
			$err = function_exists( 'openssl_error_string' ) ? (string) openssl_error_string() : '';
			return new WP_Error(
				'wnc_dk_auth',
				__( 'رمزگشایی RSA ناموفق بود. کلید خصوصی باید همان جفت کلید عمومی باشد که به دیجیکالا داده‌اید (RSA 4096).', 'webinaconnector' ) . ( $err ? ' (' . $err . ')' : '' )
			);
		}

		return trim( (string) $plain );
	}

	/**
	 * Backward-compatible alias.
	 *
	 * @param string $validation_code Encrypted code.
	 * @param string $private_key Private key.
	 * @return string|WP_Error
	 */
	public static function decrypt_validation_code( $validation_code, $private_key ) {
		return self::decrypt_authorization_code( $validation_code, $private_key );
	}

	/**
	 * Clear one-shot encrypted authorization code after successful issue.
	 */
	public static function clear_encrypted_code() {
		$all = WNC_Settings::all();
		if ( empty( $all['digikala']['credentials'] ) || ! is_array( $all['digikala']['credentials'] ) ) {
			return;
		}
		foreach ( array( 'encrypted_code', 'validation_code', 'authorization_code' ) as $k ) {
			$all['digikala']['credentials'][ $k ] = '';
		}
		update_option( 'wnc_settings', $all, false );
	}

	/**
	 * Issue token: RSA-decrypt encrypted code then POST /open-api/v1/auth/token.
	 *
	 * @return true|WP_Error
	 */
	public static function issue_from_code() {
		$c    = self::credentials();
		$code = self::decrypt_authorization_code( $c['encrypted_code'] ?? '', $c['private_key'] ?? '' );
		if ( is_wp_error( $code ) ) {
			return $code;
		}

		$url = trailingslashit( $c['base_url'] ) . 'open-api/v1/auth/token';
		$res = WNC_HTTP::request(
			'POST',
			$url,
			array(
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'body'    => array(
					'authorization_code' => $code,
				),
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$data = isset( $res['data'] ) && is_array( $res['data'] ) ? $res['data'] : $res;
		if ( empty( $data['access_token'] ) ) {
			return new WP_Error( 'wnc_dk_auth', __( 'توکن دیجیکالا دریافت نشد.', 'webinaconnector' ) );
		}
		self::persist_tokens( $data );
		self::clear_encrypted_code();
		return true;
	}

	/**
	 * Refresh access token (requires expired access_token + refresh_token).
	 *
	 * @return true|WP_Error
	 */
	public static function refresh() {
		$c   = self::credentials();
		$t   = self::tokens();
		$now = time();

		if ( empty( $t['refresh_token'] ) ) {
			return new WP_Error( 'wnc_dk_auth', __( 'رفرش توکن دیجیکالا موجود نیست. دوباره کد هویت‌سنجی را رمزگشایی و صادر کنید.', 'webinaconnector' ) );
		}
		if ( ! empty( $t['refresh_expires_at'] ) && (int) $t['refresh_expires_at'] <= $now ) {
			return new WP_Error( 'wnc_dk_auth', __( 'رفرش توکن دیجیکالا منقضی شده است. دوباره کد هویت‌سنجی را رمزگشایی و صادر کنید.', 'webinaconnector' ) );
		}
		if ( empty( $t['access_token'] ) ) {
			return new WP_Error( 'wnc_dk_auth', __( 'توکن دسترسی دیجیکالا برای رفرش موجود نیست.', 'webinaconnector' ) );
		}

		$url = trailingslashit( $c['base_url'] ) . 'open-api/v1/auth/refresh-token';
		$res = WNC_HTTP::request(
			'POST',
			$url,
			array(
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'body'    => array(
					'access_token'  => $t['access_token'],
					'refresh_token' => $t['refresh_token'],
				),
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$data = isset( $res['data'] ) && is_array( $res['data'] ) ? $res['data'] : $res;
		if ( empty( $data['access_token'] ) ) {
			return new WP_Error( 'wnc_dk_auth', __( 'رفرش توکن دیجیکالا ناموفق بود.', 'webinaconnector' ) );
		}
		self::persist_tokens( $data );
		return true;
	}

	/**
	 * Valid access token.
	 *
	 * @return string|WP_Error
	 */
	public static function access_token() {
		$t   = self::tokens();
		$now = time();

		if ( ! empty( $t['access_token'] ) && ! empty( $t['access_expires_at'] ) && (int) $t['access_expires_at'] > $now + 60 ) {
			return (string) $t['access_token'];
		}

		if ( ! empty( $t['access_token'] ) && empty( $t['access_expires_at'] ) && empty( $t['refresh_token'] ) ) {
			return (string) $t['access_token'];
		}

		$ref = self::refresh();
		if ( is_wp_error( $ref ) ) {
			return $ref;
		}
		$t = self::tokens();
		if ( empty( $t['access_token'] ) ) {
			return new WP_Error( 'wnc_dk_auth', __( 'توکن دسترسی دیجیکالا موجود نیست.', 'webinaconnector' ) );
		}
		return (string) $t['access_token'];
	}
}
