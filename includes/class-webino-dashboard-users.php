<?php
/**
 * Dashboard user mapping and profile helpers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * User list/detail payloads and profile meta.
 */
class Webino_Dashboard_Users {

	const META_NATIONAL_ID  = 'webino_dashboard_national_id';
	const META_JOB          = 'webino_dashboard_job';
	const META_BIRTH_DATE   = 'webino_dashboard_birth_date';
	const META_LANDLINE     = 'webino_dashboard_landline';
	const META_BANK_NAME    = 'webino_dashboard_bank_name';
	const META_BANK_ACCOUNT = 'webino_dashboard_bank_account';
	const META_BANK_CARD    = 'webino_dashboard_bank_card';
	const META_BANK_SHEBA   = 'webino_dashboard_bank_sheba';

	/**
	 * @param WP_User $user User.
	 * @return array<string, mixed>
	 */
	public static function map_list_item( $user ) {
		$roles = array_values( (array) $user->roles );
		$role  = $roles[0] ?? '';
		return array(
			'id'          => (int) $user->ID,
			'login'       => $user->user_login,
			'name'        => $user->display_name,
			'email'       => $user->user_email,
			'phone'       => self::get_phone( (int) $user->ID ),
			'avatar_url'  => self::get_avatar_url( (int) $user->ID ),
			'roles'       => $roles,
			'role'        => $role,
			'role_label'  => self::get_role_label( $role ),
		);
	}

	/**
	 * @param WP_User $user User.
	 * @return array<string, mixed>
	 */
	public static function map_detail( $user ) {
		$uid   = (int) $user->ID;
		$base  = self::map_list_item( $user );
		$names = self::get_name_parts( $uid );
		return array_merge(
			$base,
			array(
				'first_name'         => $names['first_name'],
				'last_name'          => $names['last_name'],
				'profile'            => self::get_profile( $uid ),
				'bank'               => self::get_bank( $uid ),
				'addresses'          => self::get_addresses( $uid ),
				'default_address_id' => self::get_default_address_id( $uid ),
				'wishlist'           => self::get_wishlist_summary( $uid ),
				'bots'               => self::get_bot_connections( $uid ),
			)
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @return array{first_name:string,last_name:string}
	 */
	public static function get_name_parts( $user_id ) {
		$first = (string) get_user_meta( $user_id, 'billing_first_name', true );
		$last  = (string) get_user_meta( $user_id, 'billing_last_name', true );
		if ( '' !== $first || '' !== $last ) {
			return array(
				'first_name' => $first,
				'last_name'  => $last,
			);
		}
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return array(
				'first_name' => '',
				'last_name'  => '',
			);
		}
		$parts = preg_split( '/\s+/', trim( $user->display_name ), 2 );
		return array(
			'first_name' => $parts[0] ?? '',
			'last_name'  => $parts[1] ?? '',
		);
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $first First name.
	 * @param string $last Last name.
	 * @return void
	 */
	public static function save_name( $user_id, $first, $last ) {
		$first = sanitize_text_field( (string) $first );
		$last  = sanitize_text_field( (string) $last );
		update_user_meta( $user_id, 'billing_first_name', $first );
		update_user_meta( $user_id, 'billing_last_name', $last );
		update_user_meta( $user_id, 'shipping_first_name', $first );
		update_user_meta( $user_id, 'shipping_last_name', $last );
		$display = trim( $first . ' ' . $last );
		wp_update_user(
			array(
				'ID'           => $user_id,
				'display_name' => $display,
			)
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @return string
	 */
	public static function get_avatar_url( $user_id ) {
		return Webino_Dashboard_REST::dashboard_avatar_url( (int) $user_id, 96 );
	}

	/**
	 * @param int $user_id User ID.
	 * @return string
	 */
	public static function get_phone( $user_id ) {
		$phone = (string) get_user_meta( $user_id, 'billing_phone', true );
		if ( '' === $phone ) {
			$phone = (string) get_user_meta( $user_id, 'webino_dashboard_phone', true );
		}
		return $phone;
	}

	/**
	 * @param string $role Role slug.
	 * @return string
	 */
	public static function get_role_label( $role ) {
		if ( '' === $role ) {
			return '';
		}
		$wp_roles = wp_roles();
		if ( isset( $wp_roles->roles[ $role ]['name'] ) ) {
			return translate_user_role( $wp_roles->roles[ $role ]['name'] );
		}
		return $role;
	}

	/**
	 * @param int $user_id User ID.
	 * @return array<string, string>
	 */
	public static function get_profile( $user_id ) {
		return array(
			'job'          => (string) get_user_meta( $user_id, self::META_JOB, true ),
			'national_id'  => (string) get_user_meta( $user_id, self::META_NATIONAL_ID, true ),
			'birth_date'   => (string) get_user_meta( $user_id, self::META_BIRTH_DATE, true ),
			'landline'     => (string) get_user_meta( $user_id, self::META_LANDLINE, true ),
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @return array<string, string>
	 */
	public static function get_bank( $user_id ) {
		if ( class_exists( '\Webino_Dashboard_Bots_Bale\Woo\UserBank' ) ) {
			$woobale = \Webino_Dashboard_Bots_Bale\Woo\UserBank::get( $user_id );
			if ( self::bank_has_data( $woobale ) ) {
				return $woobale;
			}
		}
		return array(
			'bank_name'      => (string) get_user_meta( $user_id, self::META_BANK_NAME, true ),
			'account_number' => (string) get_user_meta( $user_id, self::META_BANK_ACCOUNT, true ),
			'card_number'    => (string) get_user_meta( $user_id, self::META_BANK_CARD, true ),
			'sheba'          => (string) get_user_meta( $user_id, self::META_BANK_SHEBA, true ),
		);
	}

	/**
	 * @param array<string, string> $bank Bank fields.
	 * @return bool
	 */
	private static function bank_has_data( $bank ) {
		foreach ( $bank as $value ) {
			if ( '' !== (string) $value ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param array<string, mixed> $input Raw profile.
	 * @return array<string, string>|WP_Error
	 */
	public static function sanitize_profile( $input ) {
		if ( ! is_array( $input ) ) {
			return array();
		}
		$national = preg_replace( '/\D+/', '', (string) ( $input['national_id'] ?? '' ) );
		if ( '' !== $national && strlen( $national ) !== 10 ) {
			return new WP_Error( 'invalid_national_id', __( 'National ID must be 10 digits.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$birth = sanitize_text_field( (string) ( $input['birth_date'] ?? '' ) );
		if ( '' !== $birth && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $birth ) ) {
			return new WP_Error( 'invalid_birth_date', __( 'Birth date must be YYYY-MM-DD.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return array(
			'job'         => sanitize_text_field( (string) ( $input['job'] ?? '' ) ),
			'national_id' => $national,
			'birth_date'  => $birth,
			'landline'    => sanitize_text_field( (string) ( $input['landline'] ?? '' ) ),
		);
	}

	/**
	 * @param array<string, mixed> $input Raw bank.
	 * @return array<string, string>|WP_Error
	 */
	public static function sanitize_bank( $input ) {
		if ( ! is_array( $input ) ) {
			return array();
		}
		$sheba = strtoupper( preg_replace( '/\s+/', '', (string) ( $input['sheba'] ?? '' ) ) );
		if ( '' !== $sheba && ! preg_match( '/^IR\d{24}$/', $sheba ) ) {
			return new WP_Error( 'invalid_sheba', __( 'Sheba must be IR followed by 24 digits.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return array(
			'bank_name'      => sanitize_text_field( (string) ( $input['bank_name'] ?? '' ) ),
			'account_number' => sanitize_text_field( (string) ( $input['account_number'] ?? '' ) ),
			'card_number'    => preg_replace( '/\D+/', '', (string) ( $input['card_number'] ?? '' ) ),
			'sheba'          => $sheba,
		);
	}

	/**
	 * @param int                   $user_id User ID.
	 * @param array<string, string> $profile Profile fields.
	 * @return void
	 */
	public static function save_profile( $user_id, $profile ) {
		update_user_meta( $user_id, self::META_JOB, $profile['job'] ?? '' );
		update_user_meta( $user_id, self::META_NATIONAL_ID, $profile['national_id'] ?? '' );
		update_user_meta( $user_id, self::META_BIRTH_DATE, $profile['birth_date'] ?? '' );
		update_user_meta( $user_id, self::META_LANDLINE, $profile['landline'] ?? '' );
	}

	/**
	 * @param int                   $user_id User ID.
	 * @param array<string, string> $bank Bank fields.
	 * @return void
	 */
	public static function save_bank( $user_id, $bank ) {
		if ( class_exists( '\Webino_Dashboard_Bots_Bale\Woo\UserBank' ) ) {
			\Webino_Dashboard_Bots_Bale\Woo\UserBank::save( $user_id, $bank );
		}
		update_user_meta( $user_id, self::META_BANK_NAME, $bank['bank_name'] ?? '' );
		update_user_meta( $user_id, self::META_BANK_ACCOUNT, $bank['account_number'] ?? '' );
		update_user_meta( $user_id, self::META_BANK_CARD, $bank['card_number'] ?? '' );
		update_user_meta( $user_id, self::META_BANK_SHEBA, $bank['sheba'] ?? '' );
	}

	/**
	 * @return class-string|null
	 */
	private static function address_book_class() {
		if ( class_exists( '\Webino_Dashboard_Bots_Bale\Woo\AddressBook' ) ) {
			return '\Webino_Dashboard_Bots_Bale\Woo\AddressBook';
		}
		if ( class_exists( '\Webino_Dashboard_Bots_Telegram\Woo\AddressBook' ) ) {
			return '\Webino_Dashboard_Bots_Telegram\Woo\AddressBook';
		}
		return null;
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $phone Phone.
	 * @return void
	 */
	public static function save_phone( $user_id, $phone ) {
		$phone = sanitize_text_field( (string) $phone );
		update_user_meta( $user_id, 'billing_phone', $phone );
	}

	/**
	 * @param int $user_id User ID.
	 * @return list<array<string, string>>
	 */
	public static function get_addresses( $user_id ) {
		$class = self::address_book_class();
		if ( $class ) {
			return $class::all( $user_id );
		}
		$raw = get_user_meta( $user_id, 'woobale_addresses', true );
		return is_array( $raw ) ? array_values( $raw ) : array();
	}

	/**
	 * @param int $user_id User ID.
	 * @return string
	 */
	public static function get_default_address_id( $user_id ) {
		$class = self::address_book_class();
		if ( $class ) {
			return $class::default_id( $user_id );
		}
		return (string) get_user_meta( $user_id, 'woobale_default_address_id', true );
	}

	/**
	 * @param int                  $user_id User ID.
	 * @param array<string, mixed> $input Address input.
	 * @param string               $existing_id Existing ID for update.
	 * @return array<string, string>|WP_Error
	 */
	public static function validate_address( $user_id, $input, $existing_id = '' ) {
		$class = self::address_book_class();
		if ( $class ) {
			return $class::validate_and_build( $input, $existing_id );
		}
		return new WP_Error( 'no_addressbook', __( 'Address book is not available.', 'webino-dashboard' ), array( 'status' => 501 ) );
	}

	/**
	 * @param int                   $user_id User ID.
	 * @param array<string, string> $address Address row.
	 * @return void
	 */
	public static function upsert_address( $user_id, $address ) {
		$class = self::address_book_class();
		if ( $class ) {
			$class::upsert( $user_id, $address );
		}
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $address_id Address ID.
	 * @return bool
	 */
	public static function delete_address( $user_id, $address_id ) {
		$class = self::address_book_class();
		if ( $class ) {
			return $class::delete( $user_id, $address_id );
		}
		return false;
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $address_id Address ID.
	 * @return void
	 */
	public static function set_default_address( $user_id, $address_id ) {
		$class = self::address_book_class();
		if ( $class ) {
			$class::set_default( $user_id, $address_id );
		}
	}

	/**
	 * @param int $user_id User ID.
	 * @return list<array<string, mixed>>
	 */
	public static function get_wishlist_summary( $user_id ) {
		$ids = get_user_meta( $user_id, '_woobale_wishlist_product_ids', true );
		if ( ! is_array( $ids ) ) {
			return array();
		}
		$out = array();
		foreach ( array_unique( array_filter( array_map( 'absint', $ids ) ) ) as $pid ) {
			if ( $pid < 1 ) {
				continue;
			}
			$product = function_exists( 'wc_get_product' ) ? wc_get_product( $pid ) : null;
			if ( ! $product ) {
				continue;
			}
			$thumb = wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' );
			$out[] = array(
				'id'        => $pid,
				'name'      => $product->get_name(),
				'thumbnail' => $thumb ? $thumb : '',
				'price'     => $product->get_price(),
			);
		}
		return $out;
	}

	/**
	 * @param int $user_id User ID.
	 * @return array<string, mixed>
	 */
	public static function get_bot_connections( $user_id ) {
		$telegram_chat = (string) get_user_meta( $user_id, 'webino_dashboard_telegram_chat_id', true );
		$bale_chat       = (string) get_user_meta( $user_id, 'woobale_chat_id', true );
		return array(
			'telegram' => array(
				'connected' => '' !== $telegram_chat,
				'chat_id'   => $telegram_chat,
				'username'  => '',
			),
			'bale'     => array(
				'connected' => '' !== $bale_chat,
				'chat_id'   => $bale_chat,
				'username'  => '',
			),
		);
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $provider telegram|bale.
	 * @return true|WP_Error
	 */
	public static function disconnect_bot( $user_id, $provider ) {
		$provider = sanitize_key( $provider );
		if ( class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			Webino_Dashboard_Bots_Loader::register_autoloaders();
		}
		if ( 'telegram' === $provider && class_exists( '\Webino_Dashboard_Bots_Telegram\Woo\BaleDisconnect' ) ) {
			\Webino_Dashboard_Bots_Telegram\Woo\BaleDisconnect::purge_user_bale_data( $user_id );
			return true;
		}
		if ( 'bale' === $provider && class_exists( '\Webino_Dashboard_Bots_Bale\Woo\BaleDisconnect' ) ) {
			\Webino_Dashboard_Bots_Bale\Woo\BaleDisconnect::purge_user_bale_data( $user_id );
			return true;
		}
		return new WP_Error( 'disconnect_failed', __( 'Could not disconnect bot.', 'webino-dashboard' ), array( 'status' => 400 ) );
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $channel sms|telegram|bale|email.
	 * @param string $message Message body.
	 * @return true|WP_Error
	 */
	public static function send_message( $user_id, $channel, $message ) {
		$channel = sanitize_key( $channel );
		$message = trim( (string) $message );
		if ( '' === $message ) {
			return new WP_Error( 'invalid', __( 'Message is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( 'email' === $channel ) {
			$user = get_userdata( $user_id );
			if ( ! $user || '' === $user->user_email ) {
				return new WP_Error( 'no_email', __( 'User has no email address.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			$subject = sprintf(
				/* translators: %s: site name */
				__( 'Message from %s', 'webino-dashboard' ),
				get_bloginfo( 'name' )
			);
			$sent = wp_mail( $user->user_email, $subject, $message );
			return $sent ? true : new WP_Error( 'send_failed', __( 'Email could not be sent.', 'webino-dashboard' ), array( 'status' => 502 ) );
		}
		if ( 'sms' === $channel ) {
			if ( ! class_exists( 'Webino_Dashboard_Sms', false ) || ! Webino_Dashboard_Module_Registry::sms_ready() ) {
				return new WP_Error(
					'webino_module_disabled',
					__( 'SMS panel module is not available.', 'webino-dashboard' ),
					array( 'status' => 403 )
				);
			}
			$phone = self::get_phone( $user_id );
			if ( '' === $phone ) {
				return new WP_Error( 'no_phone', __( 'User has no mobile number.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			return Webino_Dashboard_Sms::send( $phone, $message );
		}
		if ( 'telegram' === $channel && class_exists( '\Webino_Dashboard_Bots_Telegram\Messaging\OutboundMessenger' ) ) {
			$res = \Webino_Dashboard_Bots_Telegram\Messaging\OutboundMessenger::send_text_to_user( $user_id, $message );
			return ! empty( $res['ok'] ) ? true : new WP_Error( 'send_failed', $res['error'] ?? __( 'Send failed.', 'webino-dashboard' ), array( 'status' => 502 ) );
		}
		if ( 'bale' === $channel && class_exists( '\Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger' ) ) {
			$res = \Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger::send_text_to_user( $user_id, $message );
			return ! empty( $res['ok'] ) ? true : new WP_Error( 'send_failed', $res['error'] ?? __( 'Send failed.', 'webino-dashboard' ), array( 'status' => 502 ) );
		}
		return new WP_Error( 'invalid_channel', __( 'Invalid message channel.', 'webino-dashboard' ), array( 'status' => 400 ) );
	}

	/**
	 * @param int              $user_id User ID.
	 * @param list<string>     $channels Channel slugs (whatsapp is client-only).
	 * @param string           $message Message body.
	 * @return array{ok:bool,results:array<string,bool>}
	 */
	public static function send_messages( $user_id, $channels, $message ) {
		$message = trim( (string) $message );
		if ( '' === $message ) {
			return array(
				'ok'      => false,
				'results' => array(),
			);
		}
		$results = array();
		foreach ( (array) $channels as $channel ) {
			$channel = sanitize_key( (string) $channel );
			if ( '' === $channel || 'whatsapp' === $channel ) {
				continue;
			}
			$res = self::send_message( $user_id, $channel, $message );
			$results[ $channel ] = ! is_wp_error( $res );
		}
		$ok = ! empty( $results ) && ! in_array( false, $results, true );
		return array(
			'ok'      => $ok,
			'results' => $results,
		);
	}
}
