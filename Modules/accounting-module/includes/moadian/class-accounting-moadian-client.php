<?php
/**
 * Moadian TSP API client (v2 self-tsp).
 *
 * RSA-SHA256 signatures + AES-256-GCM payload encryption (JWE-style fields)
 * using server public key from GET_SERVER_INFORMATION when available.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Low-level Moadian HTTP + signing helpers.
 */
final class Accounting_Moadian_Client {

	/**
	 * @return string
	 */
	public static function base_url() {
		$sandbox = ! empty( Accounting_Config::get()['moadian_sandbox'] );
		// Documented sandbox host when sandbox flag is on; production otherwise.
		return $sandbox
			? 'https://sandboxrc.tax.gov.ir/req/api/self-tsp/'
			: 'https://tp.tax.gov.ir/req/api/self-tsp/';
	}

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function get_server_information() {
		return self::request( 'sync/GET_SERVER_INFORMATION', array(), false );
	}

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function get_fiscal_information() {
		$fiscal = (string) Accounting_Config::get()['fiscal_id'];
		if ( '' === $fiscal ) {
			return new WP_Error( 'acc_moadian_fiscal', __( 'Fiscal memory ID is not configured.', 'webino-dashboard' ) );
		}
		return self::request(
			'sync/GET_FISCAL_INFORMATION',
			array( 'fiscalId' => $fiscal ),
			true
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $packets Packets.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function send_invoices( array $packets ) {
		return self::request(
			'async/normal-enqueue',
			array( 'packets' => $packets ),
			true
		);
	}

	/**
	 * @param string $uid UID.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function inquiry_by_uid( $uid ) {
		return self::request(
			'sync/INQUIRY_BY_UID',
			array( 'uidList' => array( (string) $uid ) ),
			true
		);
	}

	/**
	 * @param string $ref Reference number.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function inquiry_by_reference( $ref ) {
		return self::request(
			'sync/INQUIRY_BY_REFERENCE_NUMBER',
			array( 'referenceNumber' => array( (string) $ref ) ),
			true
		);
	}

	/**
	 * Build a signed + encrypted packet wrapper for an invoice body.
	 *
	 * @param array<string,mixed> $invoice_body Invoice JSON (header+body+payments).
	 * @param string              $uid          Packet UID.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function wrap_packet( array $invoice_body, $uid ) {
		$fiscal  = (string) Accounting_Config::get()['fiscal_id'];
		$payload = wp_json_encode( $invoice_body );
		$sig     = self::sign_payload( (string) $payload );
		if ( is_wp_error( $sig ) ) {
			return $sig;
		}

		$enc_key_id = '';
		$sym_key    = '';
		$iv         = '';
		$data_payload = base64_encode( (string) $payload );

		$enc = self::encrypt_payload( (string) $payload );
		if ( ! is_wp_error( $enc ) && is_array( $enc ) ) {
			$data_payload = $enc['ciphertext'];
			$enc_key_id   = $enc['encryptionKeyId'];
			$sym_key      = $enc['symmetricKey'];
			$iv           = $enc['iv'];
		}

		return array(
			'uid'             => (string) $uid,
			'packetType'      => 'INVOICE.V01',
			'retry'           => false,
			'data'            => array(
				'payload'   => $data_payload,
				'signature' => $sig,
			),
			'encryptionKeyId' => $enc_key_id,
			'symmetricKey'    => $sym_key,
			'iv'              => $iv,
			'fiscalId'        => $fiscal,
			'dataSignature'   => $sig,
		);
	}

	/**
	 * Encrypt invoice JSON with AES-256-GCM; wrap AES key with server RSA public key.
	 *
	 * @param string $payload JSON.
	 * @return array{ciphertext:string,encryptionKeyId:string,symmetricKey:string,iv:string}|WP_Error
	 */
	public static function encrypt_payload( $payload ) {
		$srv = self::get_server_information();
		if ( is_wp_error( $srv ) ) {
			return $srv;
		}
		$result = is_array( $srv['result'] ?? null ) ? $srv['result'] : $srv;
		$pub_pem = (string) ( $result['publicKey'] ?? $result['serverPublicKey'] ?? '' );
		$key_id  = (string) ( $result['encryptionKeyId'] ?? $result['keyId'] ?? '' );
		if ( '' === $pub_pem ) {
			return new WP_Error( 'acc_moadian_pubkey', __( 'Moadian server public key unavailable.', 'webino-dashboard' ) );
		}
		if ( false === strpos( $pub_pem, 'BEGIN' ) ) {
			$pub_pem = "-----BEGIN PUBLIC KEY-----\n" . chunk_split( preg_replace( '/\s+/', '', $pub_pem ), 64, "\n" ) . "-----END PUBLIC KEY-----";
		}
		$pub = openssl_pkey_get_public( $pub_pem );
		if ( ! $pub ) {
			return new WP_Error( 'acc_moadian_pubkey_invalid', __( 'Invalid Moadian server public key.', 'webino-dashboard' ) );
		}

		$aes_key = random_bytes( 32 );
		$iv_bin  = random_bytes( 12 );
		$tag     = '';
		$cipher  = openssl_encrypt( (string) $payload, 'aes-256-gcm', $aes_key, OPENSSL_RAW_DATA, $iv_bin, $tag, '', 16 );
		if ( false === $cipher ) {
			return new WP_Error( 'acc_moadian_aes', __( 'AES encryption failed.', 'webino-dashboard' ) );
		}
		$wrapped = '';
		$ok      = openssl_public_encrypt( $aes_key, $wrapped, $pub, OPENSSL_PKCS1_OAEP_PADDING );
		if ( ! $ok ) {
			// Fallback PKCS1 v1.5 used by some TSP stacks.
			$ok = openssl_public_encrypt( $aes_key, $wrapped, $pub, OPENSSL_PKCS1_PADDING );
		}
		if ( ! $ok ) {
			return new WP_Error( 'acc_moadian_wrap', __( 'Could not wrap AES key with server public key.', 'webino-dashboard' ) );
		}

		return array(
			'ciphertext'      => base64_encode( $cipher . $tag ),
			'encryptionKeyId' => $key_id,
			'symmetricKey'    => base64_encode( $wrapped ),
			'iv'              => base64_encode( $iv_bin ),
		);
	}

	/**
	 * RSA-SHA256 sign (base64).
	 *
	 * @param string $payload Payload.
	 * @return string|WP_Error
	 */
	public static function sign_payload( $payload ) {
		$key_pem = Accounting_Config::private_key_pem();
		if ( '' === $key_pem ) {
			return new WP_Error( 'acc_moadian_key', __( 'Private key is not configured.', 'webino-dashboard' ) );
		}
		$key = openssl_pkey_get_private( $key_pem );
		if ( ! $key ) {
			return new WP_Error( 'acc_moadian_key_invalid', __( 'Invalid private key PEM.', 'webino-dashboard' ) );
		}
		$signature = '';
		$ok        = openssl_sign( $payload, $signature, $key, OPENSSL_ALGO_SHA256 );
		if ( ! $ok ) {
			return new WP_Error( 'acc_moadian_sign', __( 'Failed to sign Moadian payload.', 'webino-dashboard' ) );
		}
		return base64_encode( $signature );
	}

	/**
	 * Generate 22-char taxid: fiscal(6) + hex datetime(8) + serial(5) + Verhoeff check(1).
	 *
	 * @param string   $serial Serial numeric string.
	 * @param int|null $ts     Unix timestamp.
	 * @return string
	 */
	public static function make_taxid( $serial, $ts = null ) {
		$fiscal = strtoupper( substr( preg_replace( '/[^A-Za-z0-9]/', '', (string) Accounting_Config::get()['fiscal_id'] ), 0, 6 ) );
		$fiscal = str_pad( $fiscal, 6, '0' );
		$ts     = $ts ?: time();
		$hex_ts = strtoupper( str_pad( dechex( $ts ), 8, '0', STR_PAD_LEFT ) );
		$ser    = strtoupper( str_pad( dechex( (int) preg_replace( '/\D/', '', (string) $serial ) % 0xFFFFF ), 5, '0', STR_PAD_LEFT ) );
		$raw    = $fiscal . $hex_ts . $ser;
		$check  = self::verhoeff_check_char( $raw );
		return substr( $raw . $check, 0, 22 );
	}

	/**
	 * Verhoeff check character for alphanumeric Moadian taxid body.
	 *
	 * @param string $raw Body without check digit.
	 * @return string Single hex digit 0-9 (Verhoeff digit as char).
	 */
	public static function verhoeff_check_char( $raw ) {
		$map = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$digits = '';
		$len = strlen( $raw );
		for ( $i = 0; $i < $len; $i++ ) {
			$ch = strtoupper( $raw[ $i ] );
			$pos = strpos( $map, $ch );
			$digits .= false === $pos ? '0' : (string) ( $pos % 10 );
		}
		return (string) self::verhoeff_checksum( $digits );
	}

	/**
	 * Verhoeff checksum digit for a numeric string.
	 *
	 * @param string $num Digits.
	 * @return int
	 */
	public static function verhoeff_checksum( $num ) {
		$d = array(
			array( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ),
			array( 1, 2, 3, 4, 0, 6, 7, 8, 9, 5 ),
			array( 2, 3, 4, 0, 1, 7, 8, 9, 5, 6 ),
			array( 3, 4, 0, 1, 2, 8, 9, 5, 6, 7 ),
			array( 4, 0, 1, 2, 3, 9, 5, 6, 7, 8 ),
			array( 5, 9, 8, 7, 6, 0, 4, 3, 2, 1 ),
			array( 6, 5, 9, 8, 7, 1, 0, 4, 3, 2 ),
			array( 7, 6, 5, 9, 8, 2, 1, 0, 4, 3 ),
			array( 8, 7, 6, 5, 9, 3, 2, 1, 0, 4 ),
			array( 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 ),
		);
		$p = array(
			array( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ),
			array( 1, 5, 7, 6, 2, 8, 3, 0, 9, 4 ),
			array( 5, 8, 0, 3, 7, 9, 6, 1, 4, 2 ),
			array( 8, 9, 1, 6, 0, 4, 3, 5, 2, 7 ),
			array( 9, 4, 5, 3, 1, 2, 6, 8, 7, 0 ),
			array( 4, 2, 8, 6, 5, 7, 3, 9, 0, 1 ),
			array( 2, 7, 9, 3, 8, 0, 6, 4, 1, 5 ),
			array( 7, 0, 4, 6, 9, 1, 3, 2, 5, 8 ),
		);
		$c = 0;
		$reversed = strrev( (string) $num );
		$len = strlen( $reversed );
		for ( $i = 0; $i < $len; $i++ ) {
			$c = $d[ $c ][ $p[ ( $i + 1 ) % 8 ][ (int) $reversed[ $i ] ] ];
		}
		for ( $n = 0; $n < 10; $n++ ) {
			if ( 0 === $d[ $c ][ $p[0][ $n ] ] ) {
				return $n;
			}
		}
		return 0;
	}

	/**
	 * @param string              $path Relative path.
	 * @param array<string,mixed> $body Body.
	 * @param bool                $auth Require keys.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function request( $path, array $body, $auth ) {
		if ( $auth && '' === Accounting_Config::private_key_pem() ) {
			return new WP_Error( 'acc_moadian_key', __( 'Private key is not configured.', 'webino-dashboard' ) );
		}
		$url     = rtrim( self::base_url(), '/' ) . '/' . ltrim( $path, '/' );
		$json    = wp_json_encode( $body );
		$headers = array(
			'Content-Type' => 'application/json',
			'Accept'       => 'application/json',
			'User-Agent'   => 'WebinaDashboard-Accounting/1.5',
		);
		if ( $auth ) {
			$token = self::auth_token();
			if ( is_wp_error( $token ) ) {
				return $token;
			}
			$headers['Authorization'] = 'Bearer ' . $token;
		}

		$args = array(
			'timeout' => 45,
			'headers' => $headers,
			'body'    => $json,
		);
		$proxy = trim( (string) ( Accounting_Config::get()['moadian_proxy'] ?? '' ) );
		if ( '' !== $proxy ) {
			$args['proxy'] = $proxy;
		}
		$res = wp_remote_post( $url, $args );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		$data = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		if ( ! is_array( $data ) ) {
			$data = array( 'raw' => wp_remote_retrieve_body( $res ) );
		}
		self::log( null, null, 'out', $path, $code, $body, $data );
		if ( $code < 200 || $code >= 300 ) {
			$msg = (string) ( $data['message'] ?? $data['error'] ?? __( 'Moadian API error.', 'webino-dashboard' ) );
			return new WP_Error( 'acc_moadian_http', $msg, array( 'status' => $code, 'data' => $data ) );
		}
		return $data;
	}

	/**
	 * @return string|WP_Error
	 */
	private static function auth_token() {
		$fiscal  = (string) Accounting_Config::get()['fiscal_id'];
		$header  = array( 'alg' => 'RS256', 'typ' => 'JWT' );
		$now     = time();
		$payload = array(
			'nonce'    => wp_generate_uuid4(),
			'iat'      => $now,
			'exp'      => $now + 120,
			'fiscalId' => $fiscal,
		);
		$h   = self::b64url( wp_json_encode( $header ) );
		$p   = self::b64url( wp_json_encode( $payload ) );
		$sig = self::sign_payload( $h . '.' . $p );
		if ( is_wp_error( $sig ) ) {
			return $sig;
		}
		return $h . '.' . $p . '.' . self::b64url( base64_decode( $sig ) );
	}

	/**
	 * @param string $data Data.
	 * @return string
	 */
	private static function b64url( $data ) {
		return rtrim( strtr( base64_encode( (string) $data ), '+/', '-_' ), '=' );
	}

	/**
	 * @param int|null            $invoice_id Invoice.
	 * @param int|null            $job_id     Job.
	 * @param string              $direction  Direction.
	 * @param string              $endpoint   Endpoint.
	 * @param int                 $http_code  HTTP.
	 * @param array<string,mixed> $payload    Payload.
	 * @param array<string,mixed> $response   Response.
	 * @return void
	 */
	public static function log( $invoice_id, $job_id, $direction, $endpoint, $http_code, $payload, $response ) {
		Accounting_Db::insert(
			'moadian_log',
			array(
				'invoice_id' => $invoice_id ? absint( $invoice_id ) : null,
				'job_id'     => $job_id ? absint( $job_id ) : null,
				'direction'  => sanitize_key( $direction ),
				'endpoint'   => sanitize_text_field( $endpoint ),
				'http_code'  => (int) $http_code,
				'payload'    => wp_json_encode( $payload ),
				'response'   => wp_json_encode( $response ),
			)
		);
	}
}
