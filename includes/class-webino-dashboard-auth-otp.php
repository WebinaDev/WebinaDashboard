<?php
/**
 * Multi-channel OTP for dashboard / site login and register.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Generates, delivers, and verifies one-time codes across SMS / email / Bale / Telegram.
 */
final class Webino_Dashboard_Auth_Otp {

	const TRANSIENT_PREFIX = 'webino_auth_otp_';
	const ATTEMPTS_PREFIX  = 'webino_auth_otp_att_';
	const RATE_PREFIX      = 'webino_auth_otp_rl_';

	/**
	 * Default OTP settings (stored under webino_dashboard_notify['otp']).
	 *
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'login_enabled'    => false,
			'register_enabled' => false,
			'length'           => 5,
			'expiry_minutes'   => 5,
			'max_attempts'     => 5,
			'channels'         => array(
				'sms'      => true,
				'email'    => true,
				'bale'     => true,
				'telegram' => true,
			),
			'templates'        => array(
				'login'    => __( 'کد ورود به {site_name}: {code}', 'webino-dashboard' ),
				'register' => __( 'کد ثبت‌نام در {site_name}: {code}', 'webino-dashboard' ),
			),
			'site_notice'      => true,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_settings() {
		$raw_opt = get_option( 'webino_dashboard_notify', array() );
		if ( ! is_array( $raw_opt ) ) {
			$raw_opt = array();
		}
		$raw = isset( $raw_opt['otp'] ) && is_array( $raw_opt['otp'] ) ? $raw_opt['otp'] : array();
		return self::normalize( $raw );
	}

	/**
	 * Normalize raw otp option blob.
	 *
	 * @param array<string,mixed> $raw Raw.
	 * @return array<string,mixed>
	 */
	public static function normalize( array $raw ) {
		$defaults = self::defaults();
		$out      = array_replace_recursive( $defaults, $raw );
		$out['login_enabled']    = ! empty( $out['login_enabled'] );
		$out['register_enabled'] = ! empty( $out['register_enabled'] );
		$out['length']           = max( 4, min( 8, (int) ( $out['length'] ?? 5 ) ) );
		$out['expiry_minutes']   = max( 1, min( 30, (int) ( $out['expiry_minutes'] ?? 5 ) ) );
		$out['max_attempts']     = max( 1, min( 20, (int) ( $out['max_attempts'] ?? 5 ) ) );
		$out['site_notice']      = ! isset( $out['site_notice'] ) || ! empty( $out['site_notice'] );
		$channels                = isset( $out['channels'] ) && is_array( $out['channels'] ) ? $out['channels'] : array();
		$out['channels']         = array(
			'sms'      => ! empty( $channels['sms'] ),
			'email'    => ! empty( $channels['email'] ),
			'bale'     => ! empty( $channels['bale'] ),
			'telegram' => ! empty( $channels['telegram'] ),
		);
		$tpl = isset( $out['templates'] ) && is_array( $out['templates'] ) ? $out['templates'] : array();
		$out['templates'] = array(
			'login'    => (string) ( $tpl['login'] ?? $defaults['templates']['login'] ),
			'register' => (string) ( $tpl['register'] ?? $defaults['templates']['register'] ),
		);
		return $out;
	}

	/**
	 * Sanitize OTP blob for Notify::save_settings.
	 *
	 * @param array<string,mixed> $otp Raw otp settings.
	 * @return array<string,mixed>
	 */
	public static function sanitize_settings( array $otp ) {
		$defaults = self::defaults();
		$channels_in = isset( $otp['channels'] ) && is_array( $otp['channels'] ) ? $otp['channels'] : array();
		$tpl_in      = isset( $otp['templates'] ) && is_array( $otp['templates'] ) ? $otp['templates'] : array();
		return array(
			'login_enabled'    => ! empty( $otp['login_enabled'] ),
			'register_enabled' => ! empty( $otp['register_enabled'] ),
			'length'           => max( 4, min( 8, (int) ( $otp['length'] ?? 5 ) ) ),
			'expiry_minutes'   => max( 1, min( 30, (int) ( $otp['expiry_minutes'] ?? 5 ) ) ),
			'max_attempts'     => max( 1, min( 20, (int) ( $otp['max_attempts'] ?? 5 ) ) ),
			'site_notice'      => ! isset( $otp['site_notice'] ) || ! empty( $otp['site_notice'] ),
			'channels'         => array(
				'sms'      => ! empty( $channels_in['sms'] ),
				'email'    => ! empty( $channels_in['email'] ),
				'bale'     => ! empty( $channels_in['bale'] ),
				'telegram' => ! empty( $channels_in['telegram'] ),
			),
			'templates'        => array(
				'login'    => sanitize_textarea_field( (string) ( $tpl_in['login'] ?? $defaults['templates']['login'] ) ),
				'register' => sanitize_textarea_field( (string) ( $tpl_in['register'] ?? $defaults['templates']['register'] ) ),
			),
		);
	}

	/**
	 * Public flags for login UI (no secrets).
	 *
	 * @return array{login_enabled:bool,register_enabled:bool}
	 */
	public static function public_flags() {
		$s = self::get_settings();
		return array(
			'login_enabled'    => ! empty( $s['login_enabled'] ),
			'register_enabled' => ! empty( $s['register_enabled'] ),
		);
	}

	/**
	 * Send OTP on all enabled deliverable channels.
	 *
	 * @param string $identifier Email or phone.
	 * @param string $purpose    login|register.
	 * @return array{ok:bool,channels_sent:list<string>,masked_destinations:array<string,string>,message?:string}|WP_Error
	 */
	public static function send( $identifier, $purpose = 'login' ) {
		$purpose = sanitize_key( (string) $purpose );
		if ( ! in_array( $purpose, array( 'login', 'register' ), true ) ) {
			return new WP_Error( 'invalid_purpose', __( 'Invalid OTP purpose.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$settings = self::get_settings();
		if ( 'login' === $purpose && empty( $settings['login_enabled'] ) ) {
			return new WP_Error( 'otp_disabled', __( 'OTP login is disabled.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		if ( 'register' === $purpose && empty( $settings['register_enabled'] ) ) {
			return new WP_Error( 'otp_disabled', __( 'OTP registration is disabled.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		$parsed = self::parse_identifier( $identifier );
		if ( is_wp_error( $parsed ) ) {
			return $parsed;
		}

		if ( ! self::send_rate_ok( $parsed['key'] ) ) {
			return new WP_Error( 'too_many', __( 'Too many OTP requests. Try again later.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}

		$user = Webino_Dashboard_Rest_Base::resolve_user_from_login( $parsed['raw'] );
		if ( ! $user && '' !== $parsed['phone'] ) {
			$user = Webino_Dashboard_Rest_Base::resolve_user_from_login( $parsed['phone'] );
		}
		if ( ! $user && '' !== $parsed['email'] ) {
			$user = get_user_by( 'email', $parsed['email'] );
		}

		if ( 'login' === $purpose && ! $user ) {
			// Avoid user enumeration: same shape as success, no delivery.
			return array(
				'ok'                  => true,
				'channels_sent'       => array(),
				'masked_destinations' => array(),
				'message'             => __( 'If an account exists, a code was sent.', 'webino-dashboard' ),
			);
		}

		if ( 'register' === $purpose && $user ) {
			// Existing account: treat send as login OTP.
			$purpose = 'login';
			if ( empty( $settings['login_enabled'] ) ) {
				return new WP_Error( 'user_exists', __( 'An account with this identifier already exists.', 'webino-dashboard' ), array( 'status' => 409 ) );
			}
		}

		$code     = self::generate_code( (int) $settings['length'] );
		$ttl      = max( 60, (int) $settings['expiry_minutes'] * MINUTE_IN_SECONDS );
		$payload  = array(
			'code_hash'  => wp_hash_password( $code ),
			'purpose'    => $purpose,
			'user_id'    => $user ? (int) $user->ID : 0,
			'phone'      => $parsed['phone'],
			'email'      => $parsed['email'] !== '' ? $parsed['email'] : ( $user && is_email( $user->user_email ) ? $user->user_email : '' ),
			'identifier' => $parsed['raw'],
			'created'    => time(),
		);
		set_transient( self::TRANSIENT_PREFIX . $parsed['key'], $payload, $ttl );
		delete_transient( self::ATTEMPTS_PREFIX . $parsed['key'] );

		$message = self::render_template(
			(string) ( $settings['templates'][ $purpose ] ?? $settings['templates']['login'] ),
			$code
		);

		$delivered = self::deliver( $user, $payload, $message, $settings['channels'] );

		if ( empty( $delivered['channels_sent'] ) ) {
			return new WP_Error(
				'otp_undeliverable',
				__( 'Could not deliver the code on any channel. Check contact details and channel settings.', 'webino-dashboard' ),
				array( 'status' => 502 )
			);
		}

		return array(
			'ok'                  => true,
			'channels_sent'       => $delivered['channels_sent'],
			'masked_destinations' => $delivered['masked_destinations'],
			'message'             => __( 'Verification code sent.', 'webino-dashboard' ),
		);
	}

	/**
	 * Verify OTP and establish WP session.
	 *
	 * @param string $identifier Identifier.
	 * @param string $code       Code.
	 * @param string $purpose    login|register.
	 * @param bool   $remember   Remember cookie.
	 * @return array{ok:bool,user:array{id:int,login:string,name:string},created?:bool}|WP_Error
	 */
	public static function verify( $identifier, $code, $purpose = 'login', $remember = true ) {
		$purpose = sanitize_key( (string) $purpose );
		if ( ! in_array( $purpose, array( 'login', 'register' ), true ) ) {
			return new WP_Error( 'invalid_purpose', __( 'Invalid OTP purpose.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$settings = self::get_settings();
		if ( 'login' === $purpose && empty( $settings['login_enabled'] ) ) {
			return new WP_Error( 'otp_disabled', __( 'OTP login is disabled.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		if ( 'register' === $purpose && empty( $settings['register_enabled'] ) && empty( $settings['login_enabled'] ) ) {
			return new WP_Error( 'otp_disabled', __( 'OTP registration is disabled.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		$parsed = self::parse_identifier( $identifier );
		if ( is_wp_error( $parsed ) ) {
			return $parsed;
		}

		$code = preg_replace( '/\s+/', '', (string) $code );
		if ( '' === $code ) {
			return new WP_Error( 'invalid_code', __( 'Enter the verification code.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$key  = $parsed['key'];
		$att  = (int) get_transient( self::ATTEMPTS_PREFIX . $key );
		$max  = (int) $settings['max_attempts'];
		if ( $att >= $max ) {
			delete_transient( self::TRANSIENT_PREFIX . $key );
			return new WP_Error( 'too_many', __( 'Too many invalid attempts. Request a new code.', 'webino-dashboard' ), array( 'status' => 429 ) );
		}

		$stored = get_transient( self::TRANSIENT_PREFIX . $key );
		if ( ! is_array( $stored ) || empty( $stored['code_hash'] ) ) {
			return new WP_Error( 'otp_expired', __( 'Code expired or not found. Request a new one.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		if ( ! wp_check_password( $code, (string) $stored['code_hash'] ) ) {
			set_transient( self::ATTEMPTS_PREFIX . $key, $att + 1, HOUR_IN_SECONDS );
			return new WP_Error( 'invalid_code', __( 'Invalid verification code.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		delete_transient( self::TRANSIENT_PREFIX . $key );
		delete_transient( self::ATTEMPTS_PREFIX . $key );

		$purpose = sanitize_key( (string) ( $stored['purpose'] ?? $purpose ) );
		if ( ! in_array( $purpose, array( 'login', 'register' ), true ) ) {
			$purpose = 'login';
		}

		$created = false;
		$user_id = (int) ( $stored['user_id'] ?? 0 );
		$user    = $user_id > 0 ? get_userdata( $user_id ) : false;

		if ( ! $user && 'register' === $purpose ) {
			$created_user = self::create_user_from_payload( $stored, $parsed );
			if ( is_wp_error( $created_user ) ) {
				return $created_user;
			}
			$user    = $created_user;
			$created = true;
		}

		if ( ! $user ) {
			$user = Webino_Dashboard_Rest_Base::resolve_user_from_login( $parsed['raw'] );
		}
		if ( ! $user ) {
			return new WP_Error( 'user_missing', __( 'Account not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		wp_set_current_user( $user->ID );
		wp_set_auth_cookie( $user->ID, (bool) $remember, is_ssl() );

		if ( ! empty( $settings['site_notice'] ) && class_exists( 'Webino_Dashboard_Notifications', false ) ) {
			Webino_Dashboard_Notifications::create(
				$user->ID,
				'otp_login',
				__( 'Signed in with one-time code', 'webino-dashboard' ),
				__( 'You signed in successfully using a verification code.', 'webino-dashboard' ),
				''
			);
		}

		return array(
			'ok'      => true,
			'created' => $created,
			'user'    => array(
				'id'    => (int) $user->ID,
				'login' => (string) $user->user_login,
				'name'  => (string) $user->display_name,
			),
		);
	}

	/**
	 * @param string $identifier Raw input.
	 * @return array{raw:string,key:string,phone:string,email:string}|WP_Error
	 */
	public static function parse_identifier( $identifier ) {
		$raw = trim( (string) $identifier );
		if ( '' === $raw ) {
			return new WP_Error( 'invalid', __( 'Enter email or mobile number.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$email = '';
		$phone = '';
		if ( is_email( $raw ) ) {
			$email = sanitize_email( $raw );
		} else {
			$digits = preg_replace( '/\D+/', '', $raw );
			if ( strlen( (string) $digits ) >= 10 && strlen( (string) $digits ) <= 15 ) {
				$phone = (string) $digits;
			} else {
				return new WP_Error( 'invalid', __( 'Enter a valid email or mobile number.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
		}

		$key = $email !== '' ? 'e_' . md5( strtolower( $email ) ) : 'p_' . $phone;
		return array(
			'raw'   => $raw,
			'key'   => $key,
			'phone' => $phone,
			'email' => $email,
		);
	}

	/**
	 * @param int $length Digits.
	 * @return string
	 */
	private static function generate_code( $length ) {
		$length = max( 4, min( 8, (int) $length ) );
		$max    = (int) str_repeat( '9', $length );
		$min    = (int) str_pad( '1', $length, '0' );
		return (string) wp_rand( $min, $max );
	}

	/**
	 * @param string $key Rate key.
	 * @return bool
	 */
	private static function send_rate_ok( $key ) {
		$tkey = self::RATE_PREFIX . $key;
		$n    = (int) get_transient( $tkey );
		if ( $n >= 5 ) {
			return false;
		}
		set_transient( $tkey, $n + 1, 15 * MINUTE_IN_SECONDS );
		return true;
	}

	/**
	 * @param string $template Template.
	 * @param string $code     Code.
	 * @return string
	 */
	private static function render_template( $template, $code ) {
		$template = (string) $template;
		if ( '' === trim( $template ) ) {
			$template = __( 'Your code: {code} — {site_name}', 'webino-dashboard' );
		}
		return str_replace(
			array( '{code}', '{site_name}' ),
			array( (string) $code, get_bloginfo( 'name' ) ),
			$template
		);
	}

	/**
	 * @param WP_User|false       $user     User if known.
	 * @param array<string,mixed> $payload  Stored payload.
	 * @param string              $message  Message body.
	 * @param array<string,bool>  $channels Enabled channels.
	 * @return array{channels_sent:list<string>,masked_destinations:array<string,string>}
	 */
	private static function deliver( $user, array $payload, $message, array $channels ) {
		$sent   = array();
		$masked = array();

		$phone = (string) ( $payload['phone'] ?? '' );
		if ( $user && '' === $phone && class_exists( 'Webino_Dashboard_Users', false ) ) {
			$phone = preg_replace( '/\D+/', '', Webino_Dashboard_Users::get_phone( $user->ID ) );
		}

		$email = (string) ( $payload['email'] ?? '' );
		if ( $user && '' === $email && is_email( $user->user_email ) ) {
			$email = $user->user_email;
		}

		if ( ! empty( $channels['sms'] ) && '' !== $phone ) {
			$ok = false;
			if ( class_exists( 'Webino_Dashboard_Sms', false )
				&& class_exists( 'Webino_Dashboard_Module_Registry', false )
				&& Webino_Dashboard_Module_Registry::sms_ready()
			) {
				$res = Webino_Dashboard_Sms::send( $phone, $message );
				$ok  = ! is_wp_error( $res );
			} else {
				/**
				 * Fallback SMS hook (same as legacy bot OTP).
				 *
				 * @param string $phone Phone.
				 * @param string $message Message.
				 * @param null   $ctx Context.
				 */
				do_action( 'webino_sms_send', $phone, $message, null );
				$ok = (bool) apply_filters( 'webino_dashboard_bots_otp_deliver', false, $phone, $message );
				// Consider hook fire as attempted delivery when SMS module absent.
				if ( ! $ok ) {
					$ok = true;
				}
			}
			if ( $ok ) {
				$sent[]           = 'sms';
				$masked['sms']    = self::mask_phone( $phone );
			}
		}

		if ( ! empty( $channels['email'] ) && '' !== $email && is_email( $email ) ) {
			$subject = sprintf(
				/* translators: %s: site name */
				__( 'Verification code — %s', 'webino-dashboard' ),
				get_bloginfo( 'name' )
			);
			$body = '<p>' . esc_html( $message ) . '</p>';
			$ok   = false;
			if ( class_exists( 'Webino_Dashboard_Notify', false ) ) {
				$ok = Webino_Dashboard_Notify::send_mail( $email, $subject, $body );
			} else {
				$ok = (bool) wp_mail( $email, $subject, $message );
			}
			if ( $ok ) {
				$sent[]            = 'email';
				$masked['email']   = self::mask_email( $email );
			}
		}

		if ( $user ) {
			if ( ! empty( $channels['bale'] ) && class_exists( 'Webino_Dashboard_Users', false ) ) {
				$res = Webino_Dashboard_Users::send_message( $user->ID, 'bale', $message );
				if ( ! is_wp_error( $res ) ) {
					$sent[]          = 'bale';
					$masked['bale']  = __( 'Bale chat', 'webino-dashboard' );
				}
			}
			if ( ! empty( $channels['telegram'] ) && class_exists( 'Webino_Dashboard_Users', false ) ) {
				$res = Webino_Dashboard_Users::send_message( $user->ID, 'telegram', $message );
				if ( ! is_wp_error( $res ) ) {
					$sent[]              = 'telegram';
					$masked['telegram']  = __( 'Telegram chat', 'webino-dashboard' );
				}
			}
		}

		return array(
			'channels_sent'       => array_values( array_unique( $sent ) ),
			'masked_destinations' => $masked,
		);
	}

	/**
	 * @param array<string,mixed>              $stored Stored payload.
	 * @param array{raw:string,phone:string,email:string} $parsed Parsed id.
	 * @return WP_User|WP_Error
	 */
	private static function create_user_from_payload( array $stored, array $parsed ) {
		$phone = (string) ( $stored['phone'] ?? $parsed['phone'] );
		$email = (string) ( $stored['email'] ?? $parsed['email'] );

		if ( '' === $phone && '' === $email ) {
			return new WP_Error( 'invalid', __( 'Cannot create account without email or phone.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$login = '' !== $phone ? $phone : sanitize_user( current( explode( '@', $email ) ), true );
		if ( '' === $login ) {
			$login = 'user_' . wp_generate_password( 8, false );
		}
		if ( username_exists( $login ) ) {
			$login = $login . '_' . wp_generate_password( 4, false );
		}

		if ( '' === $email ) {
			$email = $phone . '@otp.local';
		}
		if ( email_exists( $email ) ) {
			return new WP_Error( 'user_exists', __( 'An account with this email already exists.', 'webino-dashboard' ), array( 'status' => 409 ) );
		}

		$user_id = wp_create_user( $login, wp_generate_password( 24, true ), $email );
		if ( is_wp_error( $user_id ) ) {
			return $user_id;
		}

		if ( '' !== $phone ) {
			update_user_meta( $user_id, 'billing_phone', $phone );
			update_user_meta( $user_id, 'webino_dashboard_phone', $phone );
		}

		$user = new WP_User( $user_id );
		if ( get_role( 'customer' ) ) {
			$user->set_role( 'customer' );
		} else {
			$user->set_role( 'subscriber' );
		}

		return $user;
	}

	/**
	 * @param string $phone Digits.
	 * @return string
	 */
	private static function mask_phone( $phone ) {
		$phone = preg_replace( '/\D+/', '', (string) $phone );
		$len   = strlen( $phone );
		if ( $len <= 4 ) {
			return str_repeat( '*', $len );
		}
		return str_repeat( '*', max( 0, $len - 4 ) ) . substr( $phone, -4 );
	}

	/**
	 * @param string $email Email.
	 * @return string
	 */
	private static function mask_email( $email ) {
		$email = (string) $email;
		$parts = explode( '@', $email, 2 );
		if ( count( $parts ) !== 2 ) {
			return '***';
		}
		$local = $parts[0];
		$domain = $parts[1];
		$keep  = min( 2, max( 1, (int) floor( strlen( $local ) / 3 ) ) );
		return substr( $local, 0, $keep ) . '***@' . $domain;
	}
}
