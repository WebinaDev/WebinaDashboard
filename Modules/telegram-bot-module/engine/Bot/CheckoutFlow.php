<?php

namespace Webino_Dashboard_Bots_Telegram\Bot;

use Webino_Dashboard_Bots_Telegram\Bale\Client;
use Webino_Dashboard_Bots_Telegram\Database\SessionRepository;
use Webino_Dashboard_Bots_Telegram\Util\ChatUser;
use Webino_Dashboard_Bots_Telegram\Util\MoneyFormatter;
use Webino_Dashboard_Bots_Telegram\Woo\CheckoutService;
use Webino_Dashboard_Bots_Telegram\Woo\AddressBook;
use Webino_Dashboard_Bots_Telegram\Woo\UserCartContext;

/**
 * Multi-step checkout in chat: address → shipping rates → place order.
 */
class CheckoutFlow {
	/**
	 * @param array<string, mixed> $data
	 * @return array<string, mixed>
	 */
	private static function fill_from_wc_profile( int $user_id, array $data ): array {
		$city = get_user_meta( $user_id, 'billing_city', true );
		$addr = get_user_meta( $user_id, 'billing_address_1', true );
		$addr2 = get_user_meta( $user_id, 'billing_address_2', true );
		$post = get_user_meta( $user_id, 'billing_postcode', true );
		$company = get_user_meta( $user_id, 'billing_company', true );
		$phone = get_user_meta( $user_id, 'billing_phone', true );
		if ( empty( $data['co_city'] ) && is_string( $city ) && trim( $city ) !== '' ) {
			$data['co_city'] = trim( $city );
		}
		if ( empty( $data['co_addr'] ) && is_string( $addr ) && trim( $addr ) !== '' ) {
			$data['co_addr'] = trim( $addr );
		}
		if ( empty( $data['co_addr2'] ) && is_string( $addr2 ) && trim( $addr2 ) !== '' ) {
			$data['co_addr2'] = trim( $addr2 );
		}
		if ( empty( $data['co_post'] ) && is_string( $post ) && trim( $post ) !== '' ) {
			$data['co_post'] = trim( $post );
		}
		if ( empty( $data['co_company'] ) && is_string( $company ) && trim( $company ) !== '' ) {
			$data['co_company'] = trim( $company );
		}
		if ( empty( $data['co_phone'] ) && is_string( $phone ) && trim( $phone ) !== '' ) {
			$data['co_phone'] = trim( $phone );
		}
		return $data;
	}

	/**
	 * @return list<\WP_Term>
	 */
	private static function get_state_terms(): array {
		$terms = get_terms(
			array(
				'taxonomy'   => 'state_city',
				'hide_empty' => false,
				'parent'     => 0,
			)
		);
		if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
			return array();
		}
		return array_values(
			array_filter(
				$terms,
				static function ( $term ) {
					return $term instanceof \WP_Term;
				}
			)
		);
	}

	private static function resolve_wc_state_code_by_label( string $label ): string {
		$country = function_exists( 'wc_get_base_location' ) ? wc_get_base_location()['country'] : 'IR';
		$states  = function_exists( 'WC' ) && \WC()->countries ? \WC()->countries->get_states( $country ) : array();
		if ( ! is_array( $states ) ) {
			return '';
		}
		foreach ( $states as $code => $name ) {
			if ( strcasecmp( (string) $name, $label ) === 0 ) {
				return (string) $code;
			}
		}
		return '';
	}

	private static function resolve_wc_state_code_from_term( \WP_Term $term ): string {
		$candidates = array(
			(string) get_term_meta( $term->term_id, 'state_code', true ),
			(string) get_term_meta( $term->term_id, 'code', true ),
			(string) get_term_meta( $term->term_id, 'state', true ),
			(string) get_term_meta( $term->term_id, 'state_en', true ),
			(string) $term->slug,
		);
		foreach ( $candidates as $candidate ) {
			$candidate = trim( (string) $candidate );
			if ( $candidate === '' ) {
				continue;
			}
			$resolved = self::resolve_wc_state_code_by_label( $candidate );
			if ( $resolved !== '' ) {
				return $resolved;
			}
			if ( preg_match( '/^[A-Z]{2,3}$/', strtoupper( $candidate ) ) ) {
				return strtoupper( $candidate );
			}
		}
		return self::resolve_wc_state_code_by_label( (string) $term->name );
	}


	public const STATE = 'checkout_collect';

	/**
	 * Begin checkout: ask for recipient first/last name.
	 */
	public static function start( string $chat_id ): void {
		$uid = ChatUser::get_wp_user_id_by_chat( $chat_id );
		$client = new Client();
		if ( ! $uid ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'ابتدا وارد شوید.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$cart = new UserCartContext();
		if ( empty( $cart->get_cart_contents( $uid ) ) ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'سبد خالی است.', 'webino-dashboard' ),
				)
			);
			return;
		}

		if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			$min = Webino_Dashboard_Bots_Loyalty::min_order_amount();
			if ( $min > 0 ) {
				$snap = $cart->get_cart_snapshot_for_bot( $uid );
				$total = is_array( $snap ) ? (float) ( $snap['total_excluding_shipping'] ?? $snap['items_total'] ?? 0 ) : 0.0;
				if ( $total + 0.00001 < $min ) {
					$client->send_message(
						array(
							'chat_id' => $chat_id,
							'text'    => sprintf(
								/* translators: %s: min amount */
								__( 'حداقل مبلغ سفارش %s است.', 'webino-dashboard' ),
								number_format( $min, 0, '.', ',' ) . ' ' . __( 'تومان', 'webino-dashboard' )
							),
						)
					);
					return;
				}
			}
		}

		$repo = new SessionRepository();
		$repo->upsert(
			$chat_id,
			$uid,
			self::STATE,
			array(
				'co_step'   => 'select_address',
				'co_first'  => '',
				'co_last'   => '',
				'co_state'  => '',
				'co_city'   => '',
				'co_addr'   => '',
				'co_addr2'  => '',
				'co_post'   => '',
				'co_rates'  => array(),
			),
			false
		);
		AccountFlow::send_checkout_address_picker( $chat_id, $uid );
	}

	/**
	 * @return bool True if message was handled as checkout input.
	 */
	public static function handle_text( string $chat_id, string $text ): bool {
		$repo = new SessionRepository();
		$row  = $repo->get_by_chat_id( $chat_id );
		if ( ! $row || (string) ( $row['current_state'] ?? '' ) !== self::STATE ) {
			return false;
		}

		$text = trim( $text );
		if ( $text === '/cancel' || $text === 'لغو' ) {
			self::abort( $chat_id );
			return true;
		}

		if ( $text === '' ) {
			return true;
		}

		$uid = ChatUser::get_wp_user_id_by_chat( $chat_id );
		if ( ! $uid ) {
			$repo->set_state( $chat_id, null );
			return true;
		}

		$data = $repo->get_temp_data( $chat_id );
		$step = isset( $data['co_step'] ) ? (string) $data['co_step'] : 'first_name';

		$client = new Client();
		switch ( $step ) {
			case 'select_address':
				$client->send_message(
					array(
						'chat_id' => $chat_id,
						'text'    => __( 'لطفاً آدرس را از لیست انتخاب کنید یا آدرس جدید اضافه کنید.', 'webino-dashboard' ),
					)
				);
				break;
			case 'first_name':
				$data['co_first'] = sanitize_text_field( $text );
				$data['co_step']  = 'last_name';
				$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
				$client->send_message(
					array(
						'chat_id' => $chat_id,
						'text'    => __( 'نام خانوادگی گیرنده را بنویسید:', 'webino-dashboard' ),
					)
				);
				break;
			case 'last_name':
				$data['co_last'] = sanitize_text_field( $text );
				$data['co_step'] = 'state';
				$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
				self::send_state_picker( $chat_id );
				break;
			case 'state':
				// Backward compatibility: allow typing state manually if user doesn't tap.
				$data['co_state'] = sanitize_text_field( $text );
				$data             = self::fill_from_wc_profile( $uid, $data );
				$data['co_step']  = 'city';
				$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
				self::prompt_city_step( $chat_id, $data );
				break;
			case 'city':
				if ( $text === '-' ) {
					$data = self::fill_from_wc_profile( $uid, $data );
				} else {
					$data['co_city'] = sanitize_text_field( $text );
				}
				$data['co_step'] = 'address';
				$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
				$client->send_message(
					array(
						'chat_id' => $chat_id,
						'text'    => __( 'آدرس کامل پستی (کوچه، پلاک، واحد) را بنویسید:', 'webino-dashboard' ),
					)
				);
				break;
			case 'address':
				if ( $text === '-' ) {
					$data = self::fill_from_wc_profile( $uid, $data );
				} else {
					$data['co_addr'] = sanitize_text_field( $text );
				}
				$data['co_step'] = 'address2';
				$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
				$client->send_message(
					array(
						'chat_id' => $chat_id,
						'text'    => __( 'آدرس خط ۲ (واحد، طبقه، توضیح تکمیلی) را بنویسید. در صورت نداشتن «-» بفرستید:', 'webino-dashboard' ),
					)
				);
				break;
			case 'address2':
				if ( $text === '-' ) {
					$data = self::fill_from_wc_profile( $uid, $data );
					$data['co_addr2'] = isset( $data['co_addr2'] ) ? sanitize_text_field( (string) $data['co_addr2'] ) : '';
				} else {
					$data['co_addr2'] = sanitize_text_field( $text );
				}
				$need_nid = false;
				if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
					$ls = \Webino_Dashboard_Bots_Loyalty::settings();
					$cf = isset( $ls['checkout_fields']['national_id'] ) ? $ls['checkout_fields']['national_id'] : array();
					$need_nid = ! empty( $cf['enabled'] ) && '0' !== (string) $cf['enabled'];
				}
				if ( $need_nid ) {
					$data['co_step'] = 'national_id';
					$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
					$client->send_message(
						array(
							'chat_id' => $chat_id,
							'text'    => __( 'کد ملی را وارد کنید:', 'webino-dashboard' ),
						)
					);
					break;
				}
				self::advance_after_identity_fields( $chat_id, $uid, $data, $repo, $client );
				break;
			case 'national_id':
				$data['co_national_id'] = sanitize_text_field( $text );
				if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
					$ls = \Webino_Dashboard_Bots_Loyalty::settings();
					$cf = isset( $ls['checkout_fields']['national_id'] ) ? $ls['checkout_fields']['national_id'] : array();
					if ( ! empty( $cf['required'] ) && '0' !== (string) $cf['required'] && $data['co_national_id'] === '' ) {
						$client->send_message(
							array(
								'chat_id' => $chat_id,
								'text'    => __( 'کد ملی الزامی است.', 'webino-dashboard' ),
							)
						);
						break;
					}
				}
				update_user_meta( $uid, 'billing_national_id', $data['co_national_id'] );
				self::advance_after_identity_fields( $chat_id, $uid, $data, $repo, $client );
				break;
			case 'company':
				if ( $text === '-' ) {
					$data = self::fill_from_wc_profile( $uid, $data );
					$data['co_company'] = isset( $data['co_company'] ) ? sanitize_text_field( (string) $data['co_company'] ) : '';
				} else {
					$data['co_company'] = sanitize_text_field( $text );
				}
				if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
					$ls = \Webino_Dashboard_Bots_Loyalty::settings();
					$cf = isset( $ls['checkout_fields']['company'] ) ? $ls['checkout_fields']['company'] : array();
					if ( ! empty( $cf['required'] ) && '0' !== (string) $cf['required'] && trim( (string) $data['co_company'] ) === '' ) {
						$client->send_message(
							array(
								'chat_id' => $chat_id,
								'text'    => __( 'نام شرکت الزامی است.', 'webino-dashboard' ),
							)
						);
						break;
					}
				}
				update_user_meta( $uid, 'billing_company', (string) $data['co_company'] );
				self::advance_after_identity_fields( $chat_id, $uid, $data, $repo, $client );
				break;
			case 'phone':
				if ( $text === '-' ) {
					$data = self::fill_from_wc_profile( $uid, $data );
					$data['co_phone'] = isset( $data['co_phone'] ) ? sanitize_text_field( (string) $data['co_phone'] ) : '';
				} else {
					$data['co_phone'] = sanitize_text_field( $text );
				}
				if ( trim( (string) ( $data['co_phone'] ?? '' ) ) === '' ) {
					$client->send_message(
						array(
							'chat_id' => $chat_id,
							'text'    => __( 'شماره تلفن را وارد کنید:', 'webino-dashboard' ),
						)
					);
					break;
				}
				update_user_meta( $uid, 'billing_phone', (string) $data['co_phone'] );
				self::advance_after_identity_fields( $chat_id, $uid, $data, $repo, $client );
				break;
			case 'postcode':
				if ( $text === '-' ) {
					$data = self::fill_from_wc_profile( $uid, $data );
					$data['co_post'] = isset( $data['co_post'] ) ? sanitize_text_field( (string) $data['co_post'] ) : '';
				} else {
					$data['co_post'] = sanitize_text_field( $text );
				}
				$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
				self::after_address( $chat_id, $uid, $data );
				break;
			default:
				break;
		}

		return true;
	}

	/**
	 * After address2 / national_id: company → phone → postcode → after_address.
	 *
	 * @param array<string, mixed> $data Session temp data.
	 */
	private static function advance_after_identity_fields( string $chat_id, int $uid, array $data, SessionRepository $repo, Client $client ): void {
		$data = self::fill_from_wc_profile( $uid, $data );
		$step = isset( $data['co_step'] ) ? (string) $data['co_step'] : '';

		$need_company = false;
		if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			$ls = \Webino_Dashboard_Bots_Loyalty::settings();
			$cf = isset( $ls['checkout_fields']['company'] ) ? $ls['checkout_fields']['company'] : array();
			$need_company = ! empty( $cf['enabled'] ) && '0' !== (string) $cf['enabled'];
		}

		$phone_empty = empty( $data['co_phone'] ) || trim( (string) $data['co_phone'] ) === '';
		$need_phone  = $phone_empty;

		$from_company = ( $step === 'company' );
		$from_phone   = ( $step === 'phone' );

		if ( $need_company && ! $from_company && ! $from_phone ) {
			$data['co_step'] = 'company';
			$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'نام شرکت را بنویسید (در صورت نداشتن «-» بفرستید):', 'webino-dashboard' ),
				)
			);
			return;
		}

		if ( $need_phone && ! $from_phone ) {
			$data['co_step'] = 'phone';
			$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'شماره تلفن را وارد کنید:', 'webino-dashboard' ),
				)
			);
			return;
		}

		$data['co_step'] = 'postcode';
		$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => __( 'کد پستی را بنویسید (در صورت نداشتن: ۰):', 'webino-dashboard' ),
			)
		);
	}

	public static function handle_address_chosen( string $chat_id, int $uid, string $address_id ): void {
		$address = AddressBook::find( $uid, $address_id );
		if ( ! $address ) {
			$client = new Client();
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'آدرس انتخاب‌شده معتبر نیست.', 'webino-dashboard' ),
				)
			);
			AccountFlow::send_checkout_address_picker( $chat_id, $uid );
			return;
		}
		AddressBook::set_default( $uid, $address_id );
		$base_country = function_exists( 'wc_get_base_location' ) ? (string) wc_get_base_location()['country'] : 'IR';
		$data         = array(
			'co_first'      => (string) $address['first_name'],
			'co_last'       => (string) $address['last_name'],
			'co_country'    => isset( $address['country'] ) && (string) $address['country'] !== '' ? (string) $address['country'] : $base_country,
			'co_state'      => (string) $address['state'],
			'co_city'       => (string) $address['city'],
			'co_addr'       => (string) $address['address_1'],
			'co_addr2'      => (string) $address['address_2'],
			'co_post'       => (string) $address['postcode'],
			'co_phone'      => (string) $address['phone'],
			'co_state_term' => isset( $address['state_term'] ) ? (int) $address['state_term'] : 0,
			'co_city_term'  => isset( $address['city_term'] ) ? (int) $address['city_term'] : 0,
		);
		$repo = new SessionRepository();
		$repo->merge_temp_data(
			$chat_id,
			array_merge(
				$data,
				array(
					'co_step' => 'done',
				)
			)
		);
		self::after_address( $chat_id, $uid, $data );
	}

	private static function send_state_picker( string $chat_id ): void {
		$client  = new Client();
		$state_terms = self::get_state_terms();
		if ( ! empty( $state_terms ) ) {
			$rows   = array();
			$buffer = array();
			foreach ( $state_terms as $term ) {
				$buffer[] = array(
					'text'          => (string) $term->name,
					'callback_data' => 'st:' . (int) $term->term_id,
				);
				if ( count( $buffer ) >= 2 ) {
					$rows[] = $buffer;
					$buffer = array();
				}
			}
			if ( ! empty( $buffer ) ) {
				$rows[] = $buffer;
			}
			$client->send_message(
				array(
					'chat_id'      => $chat_id,
					'text'         => __( 'استان را از لیست انتخاب کنید:', 'webino-dashboard' ),
					'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
				)
			);
			return;
		}

		$country = function_exists( 'wc_get_base_location' ) ? wc_get_base_location()['country'] : 'IR';
		$states  = function_exists( 'WC' ) && \WC()->countries ? \WC()->countries->get_states( $country ) : array();
		if ( ! is_array( $states ) || empty( $states ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'استان را بنویسید:', 'webino-dashboard' ) ) );
			return;
		}
		$rows   = array();
		$buffer = array();
		foreach ( $states as $code => $label ) {
			$buffer[] = array(
				'text'          => (string) $label,
				'callback_data' => 'st:' . (string) $code,
			);
			if ( count( $buffer ) >= 2 ) {
				$rows[] = $buffer;
				$buffer = array();
			}
		}
		if ( ! empty( $buffer ) ) {
			$rows[] = $buffer;
		}
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => __( 'استان را از لیست انتخاب کنید:', 'webino-dashboard' ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	/**
	 * @return list<\WP_Term>
	 */
	private static function get_city_terms_for_state( array $data ): array {
		$state_term_id = isset( $data['co_state_term'] ) ? (int) $data['co_state_term'] : 0;
		if ( $state_term_id > 0 ) {
			$children = get_terms(
				array(
					'taxonomy'   => 'state_city',
					'hide_empty' => false,
					'parent'     => $state_term_id,
				)
			);
			if ( is_array( $children ) && ! is_wp_error( $children ) ) {
				return array_values(
					array_filter(
						$children,
						static function ( $term ) {
							return $term instanceof \WP_Term;
						}
					)
				);
			}
		}

		$terms = get_terms(
			array(
				'taxonomy'   => 'state_city',
				'hide_empty' => false,
			)
		);
		if ( is_wp_error( $terms ) || ! is_array( $terms ) || empty( $terms ) ) {
			return array();
		}

		$state_code  = isset( $data['co_state'] ) ? (string) $data['co_state'] : '';
		$state_label = isset( $data['co_state_label'] ) ? (string) $data['co_state_label'] : '';
		if ( $state_label === '' ) {
			$country = function_exists( 'wc_get_base_location' ) ? wc_get_base_location()['country'] : 'IR';
			$states  = function_exists( 'WC' ) && \WC()->countries ? \WC()->countries->get_states( $country ) : array();
			$state_label = isset( $states[ $state_code ] ) ? (string) $states[ $state_code ] : '';
		}
		$matched     = array();
		$parent_ids  = array();

		foreach ( $terms as $term ) {
			if ( ! $term instanceof \WP_Term ) {
				continue;
			}
			$term_state_code = (string) get_term_meta( $term->term_id, 'state_code', true );
			$term_state_name = (string) get_term_meta( $term->term_id, 'state_name', true );
			$term_name       = trim( (string) $term->name );
			if ( $term_state_code !== '' && strcasecmp( $term_state_code, $state_code ) === 0 ) {
				$matched[] = $term;
				continue;
			}
			if ( $state_label !== '' && $term_state_name !== '' && strcasecmp( $term_state_name, $state_label ) === 0 ) {
				$matched[] = $term;
				continue;
			}
			if ( strcasecmp( $term_name, $state_code ) === 0 || ( $state_label !== '' && strcasecmp( $term_name, $state_label ) === 0 ) ) {
				$parent_ids[] = (int) $term->term_id;
			}
		}

		if ( ! empty( $parent_ids ) ) {
			foreach ( $terms as $term ) {
				if ( ! $term instanceof \WP_Term ) {
					continue;
				}
				if ( in_array( (int) $term->parent, $parent_ids, true ) ) {
					$matched[] = $term;
				}
			}
		}

		$unique = array();
		foreach ( $matched as $term ) {
			$unique[ (int) $term->term_id ] = $term;
		}
		$out = array_values( $unique );
		usort(
			$out,
			static function ( \WP_Term $a, \WP_Term $b ) {
				return strcasecmp( $a->name, $b->name );
			}
		);
		return $out;
	}

	/**
	 * @param array<string, mixed> $data
	 */
	private static function prompt_city_step( string $chat_id, array $data, int $edit_message_id = 0, string $edit_chat_id = '' ): void {
		$client     = new Client();
		$cities     = self::get_city_terms_for_state( $data );
		$target_chat = $edit_chat_id !== '' ? $edit_chat_id : $chat_id;
		if ( empty( $cities ) ) {
			if ( $edit_message_id > 0 ) {
				$client->edit_message_text(
					array(
						'chat_id'    => $target_chat,
						'message_id' => $edit_message_id,
						'text'       => __( 'شهر را بنویسید:', 'webino-dashboard' ),
					)
				);
			} else {
				$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'شهر را بنویسید:', 'webino-dashboard' ) ) );
			}
			return;
		}
		$rows   = array();
		$buffer = array();
		foreach ( $cities as $city ) {
			$buffer[] = array(
				'text'          => (string) $city->name,
				'callback_data' => 'ct:' . (int) $city->term_id,
			);
			if ( count( $buffer ) >= 2 ) {
				$rows[] = $buffer;
				$buffer = array();
			}
		}
		if ( ! empty( $buffer ) ) {
			$rows[] = $buffer;
		}
		$params = array(
			'chat_id'      => $target_chat,
			'text'         => __( 'شهر را از لیست انتخاب کنید:', 'webino-dashboard' ),
			'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
		);
		if ( $edit_message_id > 0 ) {
			$params['message_id'] = $edit_message_id;
			$client->edit_message_text( $params );
			return;
		}
		$client->send_message( $params );
	}

	public static function handle_state_select( string $chat_id, string $state_code, int $message_id = 0, string $message_chat_id = '' ): void {
		$repo = new SessionRepository();
		$row  = $repo->get_by_chat_id( $chat_id );
		if ( ! $row || (string) ( $row['current_state'] ?? '' ) !== self::STATE ) {
			return;
		}
		$uid = ChatUser::get_wp_user_id_by_chat( $chat_id );
		if ( ! $uid ) {
			return;
		}
		$data = $repo->get_temp_data( $chat_id );
		if ( (string) ( $data['co_step'] ?? '' ) !== 'state' ) {
			return;
		}
		$state_code = sanitize_text_field( $state_code );
		$term_id    = ctype_digit( $state_code ) ? (int) $state_code : 0;
		if ( $term_id > 0 ) {
			$term = get_term( $term_id, 'state_city' );
			if ( $term instanceof \WP_Term ) {
				$resolved_code          = self::resolve_wc_state_code_from_term( $term );
				$data['co_state']       = $resolved_code !== '' ? $resolved_code : sanitize_text_field( (string) $term->slug );
				$data['co_state_label'] = (string) $term->name;
				$data['co_state_term']  = (int) $term->term_id;
			} else {
				$data['co_state'] = $state_code;
			}
		} else {
			$data['co_state'] = $state_code;
		}
		$data             = self::fill_from_wc_profile( $uid, $data );
		$data['co_step']  = 'city';
		$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
		self::prompt_city_step( $chat_id, $data, $message_id, $message_chat_id );
	}

	public static function handle_city_select( string $chat_id, int $city_term_id ): void {
		$repo = new SessionRepository();
		$row  = $repo->get_by_chat_id( $chat_id );
		if ( ! $row || (string) ( $row['current_state'] ?? '' ) !== self::STATE ) {
			return;
		}
		$uid = ChatUser::get_wp_user_id_by_chat( $chat_id );
		if ( ! $uid ) {
			return;
		}
		$data = $repo->get_temp_data( $chat_id );
		if ( (string) ( $data['co_step'] ?? '' ) !== 'city' ) {
			return;
		}
		$city = get_term( $city_term_id, 'state_city' );
		if ( ! ( $city instanceof \WP_Term ) ) {
			return;
		}
		$selected_state_term = isset( $data['co_state_term'] ) ? (int) $data['co_state_term'] : 0;
		if ( $selected_state_term > 0 && (int) $city->parent !== $selected_state_term ) {
			return;
		}
		$data['co_city']      = sanitize_text_field( (string) $city->name );
		$data['co_city_term'] = (int) $city->term_id;
		$data['co_step']      = 'address';
		$repo->upsert( $chat_id, $uid, self::STATE, $data, false );
		$client = new Client();
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => __( 'آدرس کامل پستی (کوچه، پلاک، واحد) را بنویسید:', 'webino-dashboard' ),
			)
		);
	}

	/**
	 * @param array<string, mixed> $data
	 */
	private static function after_address( string $chat_id, int $uid, array $data ): void {
		$state = isset( $data['co_state'] ) ? trim( (string) $data['co_state'] ) : '';
		$city  = isset( $data['co_city'] ) ? trim( (string) $data['co_city'] ) : '';
		$addr  = isset( $data['co_addr'] ) ? trim( (string) $data['co_addr'] ) : '';
		if ( $state === '' || $city === '' || $addr === '' ) {
			$client = new Client();
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'اطلاعات آدرس کامل نیست. لطفاً تسویه را دوباره شروع کنید و استان/شهر/آدرس را کامل انتخاب کنید.', 'webino-dashboard' ),
				)
			);
			self::clear_checkout_session( $chat_id );
			return;
		}

		$cart_ctx = new UserCartContext();
		$co       = $cart_ctx->checkout_collect_shipping_rates_after_address( $uid, $data );
		if ( $co === null ) {
			$client = new Client();
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'سبد در دسترس نیست. دوباره تلاش کنید.', 'webino-dashboard' ),
				)
			);
			self::clear_checkout_session( $chat_id );
			return;
		}

		if ( empty( $co['needs_shipping'] ) ) {
			self::clear_checkout_session( $chat_id );
			CallbackHandler::finalize_order_creation( $chat_id, $uid );
			return;
		}

		if ( ! empty( $co['multi_package'] ) ) {
			$client = new Client();
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'این سبد چند مرحله ارسال دارد. لطفاً تسویه را از طریق سایت انجام دهید:', 'webino-dashboard' ) . ' ' . ( function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : '' ),
				)
			);
			self::clear_checkout_session( $chat_id );
			return;
		}

		$rates_flat = isset( $co['rates'] ) && is_array( $co['rates'] ) ? $co['rates'] : array();
		if ( empty( $rates_flat ) ) {
			$client = new Client();
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'هیچ روش ارسالی برای این آدرس فعال نیست. لطفاً با فروشگاه تماس بگیرید یا آدرس را در تنظیمات ووکامرس بررسی کنید.', 'webino-dashboard' ),
				)
			);
			self::clear_checkout_session( $chat_id );
			return;
		}

		$repo = new SessionRepository();
		$repo->merge_temp_data( $chat_id, array( 'co_rates' => $rates_flat ) );

		$rows = array();
		foreach ( $rates_flat as $i => $r ) {
			$label    = isset( $r['label'] ) ? (string) $r['label'] : '';
			$cost_amt = isset( $r['cost'] ) ? (float) $r['cost'] : 0.0;
			$price    = MoneyFormatter::format_toman_fa( $cost_amt );
			$btn      = mb_substr( trim( $label . ' - ' . $price ), 0, 58 );
			$rows[]   = array(
				array(
					'text'          => $btn !== '' ? $btn : (string) $i,
					'callback_data' => 'sh:' . $i,
				),
			);
		}

		$client = new Client();
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => __( '🚚 روش ارسال را انتخاب کنید:', 'webino-dashboard' ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	/**
	 * @param string $chat_id
	 * @param int    $rate_index Index into co_rates flat list.
	 */
	public static function handle_shipping_select( string $chat_id, int $rate_index ): void {
		$uid = ChatUser::get_wp_user_id_by_chat( $chat_id );
		if ( ! $uid ) {
			return;
		}
		$repo = new SessionRepository();
		$data = $repo->get_temp_data( $chat_id );
		$rates = isset( $data['co_rates'] ) && is_array( $data['co_rates'] ) ? $data['co_rates'] : array();
		if ( ! isset( $rates[ $rate_index ] ) ) {
			$client = new Client();
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'گزینه نامعتبر است. تسویه را دوباره شروع کنید.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$r       = $rates[ $rate_index ];
		$pkg_idx = isset( $r['package'] ) ? (int) $r['package'] : 0;
		$rate_id = isset( $r['id'] ) ? (string) $r['id'] : '';
		$r_label = isset( $r['label'] ) ? (string) $r['label'] : '';
		$r_cost  = isset( $r['cost'] ) ? (float) $r['cost'] : 0.0;

		$cart_ctx = new UserCartContext();
		$cart_ctx->set_chosen_shipping( $uid, $pkg_idx, $rate_id, $r_label, $r_cost );

		self::clear_checkout_session( $chat_id );
		CallbackHandler::finalize_order_creation( $chat_id, $uid );
	}

	public static function clear_checkout_session( string $chat_id ): void {
		$repo = new SessionRepository();
		$repo->set_state( $chat_id, null );
		$repo->merge_temp_data(
			$chat_id,
			array(
				'co_step'    => '',
				'co_first'   => '',
				'co_last'    => '',
				'co_state'   => '',
				'co_city'    => '',
				'co_addr'    => '',
				'co_addr2'   => '',
				'co_post'    => '',
				'co_company' => '',
				'co_phone'   => '',
				'co_rates'   => array(),
			)
		);
	}

	private static function abort( string $chat_id ): void {
		self::clear_checkout_session( $chat_id );
		$client = new Client();
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => __( 'تسویه لغو شد.', 'webino-dashboard' ),
			)
		);
	}
}
