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
	const META_REFUND_METHOD = 'webino_dashboard_refund_method';

	/**
	 * @param WP_User $user User.
	 * @return array<string, mixed>
	 */
	public static function map_list_item( $user ) {
		$roles = array_values( (array) $user->roles );
		$role  = $roles[0] ?? '';
		$uid   = (int) $user->ID;
		return array(
			'id'          => $uid,
			'login'       => $user->user_login,
			'name'        => $user->display_name,
			'email'       => $user->user_email,
			'phone'       => self::get_phone( $uid ),
			'national_id' => (string) get_user_meta( $uid, self::META_NATIONAL_ID, true ),
			'avatar_url'  => self::get_avatar_url( $uid ),
			'roles'       => $roles,
			'role'        => $role,
			'role_label'  => self::get_role_label( $role ),
		);
	}

	/**
	 * Find user IDs matching phone / national ID (and loose digit variants).
	 *
	 * @param string $search Search term.
	 * @param int    $limit  Max IDs.
	 * @return array<int>
	 */
	public static function search_ids_by_phone_or_national_id( $search, $limit = 50 ) {
		$search = trim( (string) $search );
		if ( '' === $search ) {
			return array();
		}
		$digits = preg_replace( '/\D+/', '', $search );
		$limit  = max( 1, min( 100, (int) $limit ) );

		$meta_query = array( 'relation' => 'OR' );
		$meta_query[] = array(
			'key'     => self::META_NATIONAL_ID,
			'value'   => $search,
			'compare' => 'LIKE',
		);
		if ( '' !== $digits && strlen( $digits ) >= 4 ) {
			$meta_query[] = array(
				'key'     => 'billing_phone',
				'value'   => $digits,
				'compare' => 'LIKE',
			);
			$meta_query[] = array(
				'key'     => 'webino_dashboard_phone',
				'value'   => $digits,
				'compare' => 'LIKE',
			);
			$meta_query[] = array(
				'key'     => self::META_NATIONAL_ID,
				'value'   => $digits,
				'compare' => 'LIKE',
			);
		}

		$users = get_users(
			array(
				'meta_query' => $meta_query,
				'number'     => $limit,
				'fields'     => 'ID',
			)
		);
		return array_values( array_map( 'intval', (array) $users ) );
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
				'order_history'      => class_exists( 'Webino_Dashboard_Orders', false )
					? Webino_Dashboard_Orders::get_customer_history( $uid )
					: array(
						'order_count'     => 0,
						'total_spent'     => 0.0,
						'avg_order_value' => 0.0,
					),
				'notes'              => self::get_notes( $uid ),
				'wallet_balance'     => class_exists( 'Webino_Dashboard_Wallet', false )
					? Webino_Dashboard_Wallet::get_balance( $uid )
					: 0,
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
		$refund = (string) get_user_meta( $user_id, self::META_REFUND_METHOD, true );
		if ( ! in_array( $refund, array( 'wallet', 'bank' ), true ) ) {
			$refund = 'wallet';
		}
		return array(
			'job'           => (string) get_user_meta( $user_id, self::META_JOB, true ),
			'national_id'   => (string) get_user_meta( $user_id, self::META_NATIONAL_ID, true ),
			'birth_date'    => (string) get_user_meta( $user_id, self::META_BIRTH_DATE, true ),
			'landline'      => (string) get_user_meta( $user_id, self::META_LANDLINE, true ),
			'refund_method' => $refund,
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
		$refund = sanitize_key( (string) ( $input['refund_method'] ?? 'wallet' ) );
		if ( ! in_array( $refund, array( 'wallet', 'bank' ), true ) ) {
			$refund = 'wallet';
		}
		return array(
			'job'           => sanitize_text_field( (string) ( $input['job'] ?? '' ) ),
			'national_id'   => $national,
			'birth_date'    => $birth,
			'landline'      => sanitize_text_field( (string) ( $input['landline'] ?? '' ) ),
			'refund_method' => $refund,
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
		if ( isset( $profile['refund_method'] ) ) {
			$refund = sanitize_key( (string) $profile['refund_method'] );
			if ( in_array( $refund, array( 'wallet', 'bank' ), true ) ) {
				update_user_meta( $user_id, self::META_REFUND_METHOD, $refund );
			}
		}
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
		if ( class_exists( 'Webino_Dashboard_Addresses', false ) ) {
			return 'Webino_Dashboard_Addresses';
		}
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
				'permalink' => get_permalink( $pid ),
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
		$points          = class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ? Webino_Dashboard_Bots_Loyalty::get_points( $user_id ) : 0;
		$blocked         = class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) && Webino_Dashboard_Bots_Loyalty::is_blocked( $user_id );
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
			'loyalty_points' => $points,
			'blocked'        => (bool) $blocked,
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

	const NOTES_META = 'webino_user_notes';

	/**
	 * @param int $user_id User ID.
	 * @return array<int,array<string,mixed>>
	 */
	public static function get_notes( $user_id ) {
		$raw = get_user_meta( (int) $user_id, self::NOTES_META, true );
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out = array();
		foreach ( $raw as $note ) {
			if ( ! is_array( $note ) || empty( $note['id'] ) ) {
				continue;
			}
			$out[] = array(
				'id'         => (string) $note['id'],
				'content'    => (string) ( $note['content'] ?? '' ),
				'author_id'  => (int) ( $note['author_id'] ?? 0 ),
				'author'     => (string) ( $note['author'] ?? '' ),
				'created_at' => (string) ( $note['created_at'] ?? '' ),
			);
		}
		return $out;
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $content Note body.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function add_note( $user_id, $content ) {
		$content = trim( wp_strip_all_tags( (string) $content ) );
		if ( '' === $content ) {
			return new WP_Error( 'empty', __( 'Note content required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$author_id = get_current_user_id();
		$author    = '';
		$u         = get_userdata( $author_id );
		if ( $u ) {
			$author = $u->display_name ? $u->display_name : $u->user_login;
		}
		$note = array(
			'id'         => wp_generate_uuid4(),
			'content'    => $content,
			'author_id'  => $author_id,
			'author'     => $author,
			'created_at' => gmdate( 'c' ),
		);
		$notes   = self::get_notes( $user_id );
		$notes[] = $note;
		update_user_meta( (int) $user_id, self::NOTES_META, $notes );
		return $note;
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $note_id Note ID.
	 * @return true|WP_Error
	 */
	public static function delete_note( $user_id, $note_id ) {
		$note_id = (string) $note_id;
		$notes   = self::get_notes( $user_id );
		$next    = array();
		$found   = false;
		foreach ( $notes as $note ) {
			if ( (string) $note['id'] === $note_id ) {
				$found = true;
				continue;
			}
			$next[] = $note;
		}
		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'Note not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		update_user_meta( (int) $user_id, self::NOTES_META, $next );
		return true;
	}

	/**
	 * @param int $user_id User ID.
	 * @param int $product_id Product ID.
	 * @return void
	 */
	public static function add_wishlist_product( $user_id, $product_id ) {
		$product_id = absint( $product_id );
		if ( $product_id < 1 ) {
			return;
		}
		$ids = get_user_meta( (int) $user_id, '_woobale_wishlist_product_ids', true );
		if ( ! is_array( $ids ) ) {
			$ids = array();
		}
		if ( ! in_array( $product_id, array_map( 'absint', $ids ), true ) ) {
			$ids[] = $product_id;
		}
		update_user_meta( (int) $user_id, '_woobale_wishlist_product_ids', array_values( array_unique( array_map( 'absint', $ids ) ) ) );
	}

	/**
	 * @param int $user_id User ID.
	 * @param int $product_id Product ID.
	 * @return void
	 */
	public static function remove_wishlist_product( $user_id, $product_id ) {
		$product_id = absint( $product_id );
		$ids        = get_user_meta( (int) $user_id, '_woobale_wishlist_product_ids', true );
		if ( ! is_array( $ids ) ) {
			return;
		}
		$ids = array_values(
			array_filter(
				array_map( 'absint', $ids ),
				static function ( $id ) use ( $product_id ) {
					return $id !== $product_id;
				}
			)
		);
		update_user_meta( (int) $user_id, '_woobale_wishlist_product_ids', $ids );
	}

	/**
	 * Products from completed orders without a review from this user.
	 *
	 * @param int $user_id User ID.
	 * @return list<array<string, mixed>>
	 */
	public static function get_pending_reviews( $user_id ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return array();
		}
		$user_id  = (int) $user_id;
		$order_ids = wc_get_orders(
			array(
				'customer_id' => $user_id,
				'status'      => array( 'completed' ),
				'limit'       => 50,
				'return'      => 'ids',
			)
		);
		if ( ! is_array( $order_ids ) ) {
			return array();
		}
		$reviewed = self::get_reviewed_product_ids( $user_id );
		$seen     = array();
		$out      = array();
		foreach ( $order_ids as $oid ) {
			$order = wc_get_order( $oid );
			if ( ! $order ) {
				continue;
			}
			foreach ( $order->get_items() as $item ) {
				$pid = (int) $item->get_product_id();
				if ( $pid < 1 || isset( $seen[ $pid ] ) || in_array( $pid, $reviewed, true ) ) {
					continue;
				}
				$product = wc_get_product( $pid );
				if ( ! $product ) {
					continue;
				}
				$seen[ $pid ] = true;
				$thumb        = wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' );
				$out[]        = array(
					'product_id'  => $pid,
					'name'        => $product->get_name(),
					'thumbnail'   => $thumb ? $thumb : '',
					'order_id'    => (int) $order->get_id(),
					'permalink'   => get_permalink( $pid ),
				);
			}
		}
		return $out;
	}

	/**
	 * @param int $user_id User ID.
	 * @return list<int>
	 */
	private static function get_reviewed_product_ids( $user_id ) {
		$comments = get_comments(
			array(
				'user_id' => (int) $user_id,
				'type'    => 'review',
				'status'  => 'all',
				'number'  => 500,
			)
		);
		$ids = array();
		foreach ( (array) $comments as $c ) {
			$ids[] = (int) $c->comment_post_ID;
		}
		return array_values( array_unique( $ids ) );
	}

	/**
	 * @param int $user_id User ID.
	 * @return list<array<string, mixed>>
	 */
	public static function get_user_reviews( $user_id ) {
		$comments = get_comments(
			array(
				'user_id' => (int) $user_id,
				'type'    => 'review',
				'status'  => 'all',
				'number'  => 100,
			)
		);
		$out = array();
		foreach ( (array) $comments as $c ) {
			$pid     = (int) $c->comment_post_ID;
			$product = wc_get_product( $pid );
			$out[]   = array(
				'id'         => (int) $c->comment_ID,
				'product_id' => $pid,
				'product'    => $product ? $product->get_name() : '',
				'rating'     => (int) get_comment_meta( (int) $c->comment_ID, 'rating', true ),
				'content'    => wp_strip_all_tags( $c->comment_content ),
				'status'     => (string) $c->comment_approved,
				'created_at' => (string) $c->comment_date,
				'permalink'  => get_permalink( $pid ),
			);
		}
		return $out;
	}

	/**
	 * @param int $user_id User ID.
	 * @return list<array<string, mixed>>
	 */
	public static function get_user_questions( $user_id ) {
		$comments = get_comments(
			array(
				'user_id' => (int) $user_id,
				'type'    => 'product_question',
				'status'  => 'all',
				'number'  => 100,
			)
		);
		$out = array();
		foreach ( (array) $comments as $c ) {
			$pid     = (int) $c->comment_post_ID;
			$product = wc_get_product( $pid );
			$out[]   = array(
				'id'         => (int) $c->comment_ID,
				'product_id' => $pid,
				'product'    => $product ? $product->get_name() : '',
				'content'    => wp_strip_all_tags( $c->comment_content ),
				'status'     => (string) $c->comment_approved,
				'created_at' => (string) $c->comment_date,
				'permalink'  => get_permalink( $pid ),
			);
		}
		return $out;
	}

	/**
	 * @param int    $user_id User ID.
	 * @param int    $product_id Product ID.
	 * @param int    $rating Rating 1-5.
	 * @param string $content Review text.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function create_product_review( $user_id, $product_id, $rating, $content ) {
		$user_id    = (int) $user_id;
		$product_id = (int) $product_id;
		$rating     = max( 1, min( 5, (int) $rating ) );
		$content    = trim( wp_strip_all_tags( (string) $content ) );
		if ( $product_id < 1 || '' === $content ) {
			return new WP_Error( 'invalid', __( 'Product and review text are required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( ! self::user_purchased_product( $user_id, $product_id ) ) {
			return new WP_Error( 'not_purchased', __( 'You can only review products you purchased.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$comment_id = wp_insert_comment(
			array(
				'comment_post_ID'      => $product_id,
				'comment_author'       => $user->display_name,
				'comment_author_email' => $user->user_email,
				'comment_content'      => $content,
				'comment_type'         => 'review',
				'comment_approved'     => 0,
				'user_id'              => $user_id,
			)
		);
		if ( ! $comment_id ) {
			return new WP_Error( 'create_failed', __( 'Could not save review.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		update_comment_meta( (int) $comment_id, 'rating', $rating );
		return array(
			'id'         => (int) $comment_id,
			'product_id' => $product_id,
			'rating'     => $rating,
		);
	}

	/**
	 * @param int    $user_id User ID.
	 * @param int    $product_id Product ID.
	 * @param string $content Question text.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function create_product_question( $user_id, $product_id, $content ) {
		$user_id    = (int) $user_id;
		$product_id = (int) $product_id;
		$content    = trim( wp_strip_all_tags( (string) $content ) );
		if ( $product_id < 1 || '' === $content ) {
			return new WP_Error( 'invalid', __( 'Product and question are required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( ! wc_get_product( $product_id ) ) {
			return new WP_Error( 'invalid_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$comment_id = wp_insert_comment(
			array(
				'comment_post_ID'      => $product_id,
				'comment_author'       => $user->display_name,
				'comment_author_email' => $user->user_email,
				'comment_content'      => $content,
				'comment_type'         => 'product_question',
				'comment_approved'     => 0,
				'user_id'              => $user_id,
			)
		);
		if ( ! $comment_id ) {
			return new WP_Error( 'create_failed', __( 'Could not save question.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		return array(
			'id'         => (int) $comment_id,
			'product_id' => $product_id,
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @param int $product_id Product ID.
	 * @return bool
	 */
	private static function user_purchased_product( $user_id, $product_id ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return false;
		}
		$order_ids = wc_get_orders(
			array(
				'customer_id' => (int) $user_id,
				'status'      => array( 'completed' ),
				'limit'       => 100,
				'return'      => 'ids',
			)
		);
		foreach ( (array) $order_ids as $oid ) {
			$order = wc_get_order( $oid );
			if ( ! $order ) {
				continue;
			}
			foreach ( $order->get_items() as $item ) {
				if ( (int) $item->get_product_id() === (int) $product_id ) {
					return true;
				}
			}
		}
		return false;
	}
}
