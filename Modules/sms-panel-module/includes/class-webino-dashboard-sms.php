<?php
/**
 * SMS sending adapters.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sends SMS via configured provider.
 */
class Webino_Dashboard_Sms {

	/**
	 * @param string $phone E.164 or local mobile.
	 * @param string $message Text body.
	 * @return true|WP_Error
	 */
	public static function send( $phone, $message, $from_number = '' ) {
		$phone   = preg_replace( '/\D+/', '', (string) $phone );
		$message = trim( (string) $message );
		if ( '' === $phone || '' === $message ) {
			return new WP_Error( 'invalid', __( 'Phone and message are required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$settings = Webino_Dashboard_Sms_Settings::get();
		$from     = '' !== (string) $from_number ? (string) $from_number : (string) ( $settings['sender_line'] ?? '' );
		return self::send_modirpayamak( $phone, $message, array_merge( $settings, array( 'sender_line' => $from ) ) );
	}

	/**
	 * Send OTP via CRM ModirPayamak.
	 *
	 * @param string $phone Phone.
	 * @param string $purpose login|register.
	 * @return true|WP_Error
	 */
	public static function send_otp( $phone, $purpose = 'login' ) {
		$license = Webino_Dashboard_License::instance();
		$res = $license->crm_post(
			'wp-json/webinocrm/v1/modirpayamak/auth/send-otp',
			array(
				'phone'   => $phone,
				'purpose' => sanitize_key( $purpose ),
			)
		);
		if ( empty( $res['ok'] ) ) {
			$msg = is_array( $res['data'] ?? null ) && ! empty( $res['data']['message'] )
				? (string) $res['data']['message']
				: ( $res['error'] ?? __( 'OTP send failed.', 'webino-dashboard' ) );
			return new WP_Error( 'otp_failed', $msg, array( 'status' => 502 ) );
		}
		return true;
	}

	/**
	 * @param string $phone Phone.
	 * @param string $code OTP code.
	 * @param string $purpose login|register.
	 * @return true|WP_Error
	 */
	public static function verify_otp( $phone, $code, $purpose = 'login' ) {
		$license = Webino_Dashboard_License::instance();
		$res = $license->crm_post(
			'wp-json/webinocrm/v1/modirpayamak/auth/verify-otp',
			array(
				'phone'   => $phone,
				'code'    => $code,
				'purpose' => sanitize_key( $purpose ),
			)
		);
		if ( empty( $res['ok'] ) ) {
			$msg = $res['error'] ?? __( 'OTP verification failed.', 'webino-dashboard' );
			if ( is_array( $res['data'] ?? null ) && ! empty( $res['data']['message'] ) ) {
				$msg = (string) $res['data']['message'];
			}
			return new WP_Error( 'otp_invalid', $msg, array( 'status' => 400 ) );
		}
		return true;
	}

	/**
	 * @param array<string, mixed> $settings Settings.
	 * @param string               $phone Phone digits.
	 * @param string               $message Message.
	 * @return true|WP_Error
	 */
	private static function send_kavenegar( $settings, $phone, $message ) {
		$line = (string) $settings['sender_line'];
		$url  = 'https://api.kavenegar.com/v1/' . rawurlencode( (string) $settings['api_key'] ) . '/sms/send.json';
		$res  = wp_remote_post(
			$url,
			array(
				'timeout' => 20,
				'body'    => array(
					'receptor' => $phone,
					'sender'   => $line,
					'message'  => $message,
				),
			)
		);
		return self::parse_http_response( $res );
	}

	/**
	 * @param array<string, mixed> $settings Settings.
	 * @param string               $phone Phone digits.
	 * @param string               $message Message.
	 * @return true|WP_Error
	 */
	private static function send_melipayamak( $settings, $phone, $message ) {
		$url = 'https://rest.payamak-panel.com/api/SendSMS/SendSMS';
		$res = wp_remote_post(
			$url,
			array(
				'timeout' => 20,
				'body'    => array(
					'username' => (string) $settings['api_key'],
					'password' => (string) $settings['sender_line'],
					'to'       => $phone,
					'from'     => (string) $settings['sender_line'],
					'text'     => $message,
				),
			)
		);
		return self::parse_http_response( $res );
	}

	/**
	 * @param array<string, mixed> $settings Settings.
	 * @param string               $phone Phone digits.
	 * @param string               $message Message.
	 * @return true|WP_Error
	 */
	private static function send_custom( $settings, $phone, $message ) {
		$url = (string) $settings['custom_endpoint'];
		if ( '' === $url ) {
			return new WP_Error( 'sms_not_configured', __( 'Custom SMS endpoint is not set.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$res = wp_remote_post(
			$url,
			array(
				'timeout' => 20,
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode(
					array(
						'phone'   => $phone,
						'message' => $message,
						'line'    => (string) $settings['sender_line'],
					)
				),
			)
		);
		return self::parse_http_response( $res );
	}

	/**
	 * Send via WebinoCRM ModirPayamak wallet.
	 *
	 * @param string               $phone Phone digits.
	 * @param string               $message Message.
	 * @param array<string, mixed> $settings Settings.
	 * @return true|WP_Error
	 */
	private static function send_modirpayamak( $phone, $message, $settings ) {
		$license = Webino_Dashboard_License::instance();
		$body    = array(
			'phone'   => $phone,
			'message' => $message,
		);
		if ( ! empty( $settings['sender_line'] ) ) {
			$body['from_number'] = (string) $settings['sender_line'];
		}
		$res = $license->crm_post( 'wp-json/webinocrm/v1/modirpayamak/send', $body );
		if ( empty( $res['ok'] ) ) {
			$msg = is_array( $res['data'] ?? null ) && ! empty( $res['data']['message'] )
				? (string) $res['data']['message']
				: ( $res['error'] ?? __( 'SMS send failed.', 'webino-dashboard' ) );
			return new WP_Error( 'sms_failed', $msg, array( 'status' => 502 ) );
		}
		return true;
	}

	/**
	 * @param array<string, mixed>|WP_Error $res HTTP response.
	 * @return true|WP_Error
	 */
	private static function parse_http_response( $res ) {
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		if ( $code < 200 || $code >= 300 ) {
			return new WP_Error( 'sms_failed', __( 'SMS provider returned an error.', 'webino-dashboard' ), array( 'status' => 502 ) );
		}
		return true;
	}
}
