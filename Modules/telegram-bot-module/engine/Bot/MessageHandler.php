<?php

namespace Webino_Dashboard_Bots_Telegram\Bot;

use Webino_Dashboard_Bots_Telegram\Bale\Client;
use Webino_Dashboard_Bots_Telegram\Bot\AdminFlow;
use Webino_Dashboard_Bots_Telegram\Bot\AdminGate;
use Webino_Dashboard_Bots_Telegram\Core\Plugin;
use Webino_Dashboard_Bots_Telegram\Database\SessionRepository;
use Webino_Dashboard_Bots_Telegram\Util\ChatUser;
use Webino_Dashboard_Bots_Telegram\Util\ContactVerifier;
use Webino_Dashboard_Bots_Telegram\Util\PhoneNormalizer;
use Webino_Dashboard_Bots_Telegram\Util\UserResolver;
use Webino_Dashboard_Bots_Telegram\Woo\UserCartContext;

/**
 * Private messages: /start, contact, text commands, coupon entry.
 */
class MessageHandler {
	private const STATE_WAITING_FIRST_NAME = 'waiting_first_name';
	private const STATE_WAITING_LAST_NAME  = 'waiting_last_name';
	private const FORCE_JOIN_CHECK_CALLBACK = 'fj:check';

	private static function is_cart_trigger( string $text ): bool {
		$t = trim( $text );
		return $t === '/cart' || strpos( $t, 'سبد خرید' ) !== false;
	}

	private static function is_checkout_trigger( string $text ): bool {
		$t = trim( $text );
		return $t === '/checkout' || strpos( $t, 'تسویه' ) !== false || strpos( $t, 'تسویه حساب' ) !== false;
	}

	/**
	 * @return array<string, string>
	 */
	private static function menu_labels(): array {
		$s = Plugin::get_settings();
		return array(
			'store'     => (string) $s['store_button_text'],
			'search'    => __( '🔎 جستجوی محصول', 'webino-dashboard' ),
			'wishlist'  => __( '❤️ لیست علاقمندی‌ها', 'webino-dashboard' ),
			'cart'      => __( '🛒 سبد خرید', 'webino-dashboard' ),
			'checkout'  => __( '💳 تسویه حساب', 'webino-dashboard' ),
			'orders'    => __( '📦 سفارش‌های من', 'webino-dashboard' ),
			'addresses' => __( '📍 آدرس‌های من', 'webino-dashboard' ),
			'support'   => __( '💬 پشتیبانی', 'webino-dashboard' ),
			'sale'      => __( '🔥 فروش ویژه', 'webino-dashboard' ),
		);
	}

	/**
	 * @param string $key Setting key without menu_show_ prefix.
	 * @return bool
	 */
	private static function menu_item_enabled( string $key ): bool {
		$s = Plugin::get_settings();
		$k = 'menu_show_' . $key;
		if ( ! isset( $s[ $k ] ) ) {
			return true;
		}
		return '0' !== (string) $s[ $k ];
	}

	private static function is_menu_navigation( string $text ): bool {
		foreach ( self::menu_labels() as $label ) {
			if ( $text === $label ) {
				return true;
			}
		}
		return false;
	}

	private static function build_support_message(): string {
		$s    = Plugin::get_settings();
		$main = isset( $s['support_contact_text'] ) ? trim( (string) $s['support_contact_text'] ) : '';
		if ( $main !== '' ) {
			return $main;
		}
		$parts = array();
		$cid   = isset( $s['channel_contact_id'] ) ? trim( (string) $s['channel_contact_id'] ) : '';
		$link  = isset( $s['channel_bale_link'] ) ? trim( (string) $s['channel_bale_link'] ) : '';
		if ( $cid !== '' ) {
			$parts[] = __( 'ارتباط:', 'webino-dashboard' ) . "\n" . $cid;
		}
		if ( $link !== '' ) {
			$parts[] = __( 'لینک کانال:', 'webino-dashboard' ) . "\n" . $link;
		}
		if ( empty( $parts ) ) {
			return __( 'راه‌های ارتباط هنوز در تنظیمات سایت ثبت نشده است.', 'webino-dashboard' );
		}
		return implode( "\n\n", $parts );
	}

	private static function render_force_join_message( array $settings ): string {
		$template = isset( $settings['force_join_message'] ) ? trim( (string) $settings['force_join_message'] ) : '';
		if ( $template === '' ) {
			$template = __( "لطفاً برای استفاده از امکانات ربات ابتدا در کانال ما عضو شوید.\n\nبعد از عضویت روی دکمه «بررسی عضویت» بزنید.", 'webino-dashboard' );
		}
		$channel_id   = isset( $settings['force_join_channel_id'] ) ? trim( (string) $settings['force_join_channel_id'] ) : '';
		$channel_link = isset( $settings['force_join_channel_link'] ) ? trim( (string) $settings['force_join_channel_link'] ) : '';
		return str_replace(
			array( '{channel_id}', '{channel_link}' ),
			array( $channel_id, $channel_link ),
			$template
		);
	}

	private static function send_force_join_prompt( string $chat_id, Client $client, array $settings ): void {
		$channel_link      = isset( $settings['force_join_channel_link'] ) ? trim( (string) $settings['force_join_channel_link'] ) : '';
		$check_button_text = isset( $settings['force_join_check_button_text'] ) && trim( (string) $settings['force_join_check_button_text'] ) !== ''
			? (string) $settings['force_join_check_button_text']
			: __( 'بررسی عضویت', 'webino-dashboard' );

		$row = array();
		if ( $channel_link !== '' ) {
			$row[] = array(
				'text' => __( 'عضویت در کانال', 'webino-dashboard' ),
				'url'  => $channel_link,
			);
		}
		$row[] = array(
			'text'          => $check_button_text,
			'callback_data' => self::FORCE_JOIN_CHECK_CALLBACK,
		);

		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => self::render_force_join_message( $settings ),
				'reply_markup' => wp_json_encode(
					array(
						'inline_keyboard' => array( $row ),
					)
				),
			)
		);
	}

	public static function enforce_force_join( string $chat_id, ?Client $client = null ): bool {
		if ( AdminGate::is_admin_chat( $chat_id ) ) {
			return false;
		}
		$settings = Plugin::get_settings();
		if ( empty( $settings['force_join_enabled'] ) || $settings['force_join_enabled'] === '0' ) {
			return false;
		}
		$channel_id = isset( $settings['force_join_channel_id'] ) ? trim( (string) $settings['force_join_channel_id'] ) : '';
		if ( $channel_id === '' ) {
			return false;
		}
		$client = $client ?: new Client();
		$status = $client->is_channel_member( $channel_id, $chat_id );
		if ( $status === true ) {
			return false;
		}
		self::send_force_join_prompt( $chat_id, $client, $settings );
		return true;
	}

	private static function needs_name_onboarding( int $user_id ): bool {
		$first = trim( (string) get_user_meta( $user_id, 'billing_first_name', true ) );
		$last  = trim( (string) get_user_meta( $user_id, 'billing_last_name', true ) );
		return $first === '' || $last === '';
	}

	private static function save_user_name_fields( int $user_id, string $first_name, string $last_name ): void {
		$first_name = sanitize_text_field( $first_name );
		$last_name  = sanitize_text_field( $last_name );
		update_user_meta( $user_id, 'first_name', $first_name );
		update_user_meta( $user_id, 'last_name', $last_name );
		update_user_meta( $user_id, 'billing_first_name', $first_name );
		update_user_meta( $user_id, 'billing_last_name', $last_name );
		update_user_meta( $user_id, 'shipping_first_name', $first_name );
		update_user_meta( $user_id, 'shipping_last_name', $last_name );
		wp_update_user(
			array(
				'ID'           => $user_id,
				'display_name' => trim( $first_name . ' ' . $last_name ),
			)
		);
	}

	/**
	 * @param array<string, mixed> $context
	 */
	private static function log_info( string $event, array $context = array() ): void {
		$message = '[' . $event . '] ' . wp_json_encode( $context );
		if ( function_exists( 'wc_get_logger' ) ) {
			wc_get_logger()->info( $message, array( 'source' => 'webino_dashboard_telegram' ) );
			return;
		}
		error_log( 'woobale ' . $message );
	}

	/**
	 * @param array<string, mixed> $message
	 */
	public static function handle( array $message ): void {
		$chat = isset( $message['chat']['id'] ) ? (string) $message['chat']['id'] : '';
		if ( $chat === '' ) {
			self::log_info( 'message_skip_missing_chat_id' );
			return;
		}

		$early_text = isset( $message['text'] ) ? trim( (string) $message['text'] ) : '';
		if ( $early_text !== '' && preg_match( '/^\/admin(@\S+)?$/u', $early_text ) ) {
			if ( AdminGate::is_admin_chat( $chat ) ) {
				AdminFlow::handle_command( $chat, new Client() );
			}
			return;
		}

		$linked_uid = ChatUser::get_wp_user_id_by_chat( $chat );
		if ( $linked_uid && class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) && Webino_Dashboard_Bots_Loyalty::is_blocked( $linked_uid ) ) {
			self::send_text( $chat, __( 'دسترسی شما به ربات مسدود شده است.', 'webino-dashboard' ) );
			return;
		}
		if ( $linked_uid && self::enforce_force_join( $chat ) ) {
			return;
		}

		if ( ! empty( $message['contact'] ) && is_array( $message['contact'] ) ) {
			$from_msg = isset( $message['from'] ) && is_array( $message['from'] ) ? $message['from'] : array();
			$repo_ct  = new SessionRepository();
			$row_ct   = $repo_ct->get_by_chat_id( $chat );
			$st_ct    = $row_ct && ! empty( $row_ct['current_state'] ) ? (string) $row_ct['current_state'] : '';
			if ( $st_ct === AccountFlow::STATE_ADDRESS_FORM ) {
				$uid_ct = ChatUser::get_wp_user_id_by_chat( $chat );
				if ( ! $uid_ct ) {
					$repo_ct->set_state( $chat, null );
					self::send_text( $chat, __( 'ابتدا از /start وارد شوید.', 'webino-dashboard' ) );
					return;
				}
				if ( AccountFlow::handle_address_form_contact( $chat, $uid_ct, $message['contact'], $from_msg ) ) {
					return;
				}
				self::send_text(
					$chat,
					__( 'در این مرحله از دکمهٔ «ارسال شماره تماس من» یا تایپ شماره استفاده کنید.', 'webino-dashboard' )
				);
				return;
			}
			self::handle_contact( $chat, $message['contact'], $from_msg );
			return;
		}

		$text = isset( $message['text'] ) ? trim( (string) $message['text'] ) : '';

		if ( $text === '/start' || strpos( $text, '/start ' ) === 0 ) {
			$payload = '';
			if ( strpos( $text, '/start ' ) === 0 ) {
				$payload = trim( substr( $text, 7 ) );
			}
			self::handle_start( $chat, $payload );
			return;
		}

		$c_admin = new Client();
		if ( AdminGate::is_admin_chat( $chat ) && $text !== ''
			&& class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false )
			&& \Webino_Dashboard_Bots_Admin_Ops::consume_pending_admin_text( 'telegram', $chat, $text ) ) {
			return;
		}
		if ( AdminGate::is_admin_chat( $chat ) && AdminFlow::handle_message( $chat, $text, $message, $c_admin ) ) {
			return;
		}

		if ( AdminGate::is_admin_chat( $chat ) && $text !== '' ) {
			$repo_admin = new SessionRepository();
			$row_admin  = $repo_admin->get_by_chat_id( $chat );
			$st_admin   = $row_admin && ! empty( $row_admin['current_state'] ) ? (string) $row_admin['current_state'] : '';
			$in_wizard  = $st_admin !== '' && strpos( $st_admin, 'admin_' ) === 0;
			if ( ! $in_wizard && AdminFlow::handle_main_menu_text( $chat, $text, $c_admin ) ) {
				return;
			}
		}

		$repo  = new SessionRepository();
		$row   = $repo->get_by_chat_id( $chat );
		$state = $row && ! empty( $row['current_state'] ) ? (string) $row['current_state'] : '';

		$labels       = self::menu_labels();
		$search_label = $labels['search'];

		if ( $state === self::STATE_WAITING_FIRST_NAME && $text !== '' ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( ! $uid ) {
				$repo->set_state( $chat, null );
				self::send_text( $chat, __( 'ابتدا از /start وارد شوید.', 'webino-dashboard' ) );
				return;
			}
			$repo->merge_temp_data( $chat, array( 'onb_first_name' => sanitize_text_field( $text ) ) );
			$repo->set_state( $chat, self::STATE_WAITING_LAST_NAME );
			self::send_text( $chat, __( 'نام خانوادگی را ارسال کنید:', 'webino-dashboard' ) );
			return;
		}

		if ( $state === self::STATE_WAITING_LAST_NAME && $text !== '' ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( ! $uid ) {
				$repo->set_state( $chat, null );
				self::send_text( $chat, __( 'ابتدا از /start وارد شوید.', 'webino-dashboard' ) );
				return;
			}
			$data  = $repo->get_temp_data( $chat );
			$first = isset( $data['onb_first_name'] ) ? (string) $data['onb_first_name'] : '';
			$last  = sanitize_text_field( $text );
			if ( trim( $first ) === '' || trim( $last ) === '' ) {
				self::send_text( $chat, __( 'نام و نام خانوادگی معتبر نیست. دوباره تلاش کنید.', 'webino-dashboard' ) );
				return;
			}
			self::save_user_name_fields( $uid, $first, $last );
			$repo->set_state( $chat, null );
			$repo->merge_temp_data( $chat, array( 'onb_first_name' => '' ) );
			self::send_text( $chat, __( 'ثبت نام شما کامل شد.', 'webino-dashboard' ) );
			$auth_text = (string) Plugin::get_settings()['auth_success_text'];
			if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
				Webino_Dashboard_Bots_Loyalty::touch_last_seen( $uid );
				$wcode = Webino_Dashboard_Bots_Loyalty::maybe_welcome_coupon( $uid );
				if ( $wcode !== '' ) {
					$auth_text .= "\n" . sprintf( __( 'کوپن خوش‌آمدگویی: %s', 'webino-dashboard' ), $wcode );
				}
			}
			$c = new Client();
			$c->send_message(
				array(
					'chat_id'      => $chat,
					'text'         => $auth_text,
					'reply_markup' => self::main_menu_reply_markup(),
				)
			);
			return;
		}

		if ( $state === CheckoutFlow::STATE ) {
			if ( self::is_menu_navigation( $text ) ) {
				CheckoutFlow::clear_checkout_session( $chat );
			} else {
				CheckoutFlow::handle_text( $chat, $text );
				return;
			}
		}

		if ( $state === AccountFlow::STATE_ADDRESS_FORM ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( ! $uid ) {
				$repo->set_state( $chat, null );
				self::send_text( $chat, __( 'ابتدا از /start وارد شوید.', 'webino-dashboard' ) );
				return;
			}
			AccountFlow::handle_address_form_text( $chat, $uid, $text );
			return;
		}

		if ( $state === AccountFlow::STATE_RETURN_REQUEST ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( ! $uid ) {
				$repo->set_state( $chat, null );
				self::send_text( $chat, __( 'ابتدا از /start وارد شوید.', 'webino-dashboard' ) );
				return;
			}
			AccountFlow::handle_return_form_text( $chat, $uid, $text );
			return;
		}

		if ( $state === 'waiting_for_coupon' && $text !== '' ) {
			self::handle_coupon_text( $chat, $text );
			return;
		}

		if ( $state === 'waiting_for_search' && $text !== '' ) {
			if ( self::is_menu_navigation( $text ) ) {
				$repo->set_state( $chat, null );
			} elseif ( strpos( $text, '/search ' ) === 0 ) {
				$repo->set_state( $chat, null );
				StoreFlow::send_search_results( $chat, trim( (string) substr( $text, 8 ) ), ChatUser::get_wp_user_id_by_chat( $chat ) ?: null );
				return;
			} elseif ( strpos( $text, '/' ) === 0 ) {
				self::send_text( $chat, __( 'برای جستجو نام محصول را بفرستید یا از /search استفاده کنید.', 'webino-dashboard' ) );
				return;
			} else {
				$repo->set_state( $chat, null );
				StoreFlow::send_search_results( $chat, $text, ChatUser::get_wp_user_id_by_chat( $chat ) ?: null );
				return;
			}
		}

		$store_label = $labels['store'];

		if ( $text === $store_label ) {
			StoreFlow::send_categories( $chat, 0 );
			return;
		}
		if ( self::is_cart_trigger( $text ) ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( ! $uid ) {
				self::send_text( $chat, __( 'ابتدا از /start وارد شوید.', 'webino-dashboard' ) );
				return;
			}
			CartFlow::send_cart( $chat, $uid );
			return;
		}
		if ( self::is_checkout_trigger( $text ) ) {
			CheckoutFlow::start( $chat );
			return;
		}
		if ( $text === $search_label ) {
			$repo->set_state( $chat, 'waiting_for_search' );
			self::send_text( $chat, __( 'نام محصول را بفرستید یا از /search نام محصول استفاده کنید.', 'webino-dashboard' ) );
			return;
		}
		if ( $text === $labels['wishlist'] ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( ! $uid ) {
				self::send_text( $chat, __( 'ابتدا از /start وارد شوید.', 'webino-dashboard' ) );
				return;
			}
			StoreFlow::send_wishlist_products( $chat, $uid );
			return;
		}
		if ( isset( $labels['sale'] ) && $text === $labels['sale'] ) {
			StoreFlow::send_on_sale_products( $chat, ChatUser::get_wp_user_id_by_chat( $chat ) ?: null );
			return;
		}
		if ( $text === $labels['orders'] ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( ! $uid ) {
				self::send_text( $chat, __( 'ابتدا از /start وارد شوید.', 'webino-dashboard' ) );
				return;
			}
			AccountFlow::send_my_orders( $chat, $uid );
			return;
		}
		if ( $text === $labels['addresses'] ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( ! $uid ) {
				self::send_text( $chat, __( 'ابتدا از /start وارد شوید.', 'webino-dashboard' ) );
				return;
			}
			AccountFlow::send_my_addresses( $chat, $uid );
			return;
		}
		if ( $text === $labels['support'] || $text === '/support' ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( $uid && class_exists( 'Webino_Dashboard_Bots_Tickets', false ) ) {
				$repo->set_state( $chat, 'waiting_for_ticket' );
				self::send_text( $chat, __( 'پیام پشتیبانی را بنویسید (یا /cancel):', 'webino-dashboard' ) );
				return;
			}
			self::send_text( $chat, self::build_support_message() );
			return;
		}
		if ( $text === '/coupon' || $text === '/redeem' ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( $uid && class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
				$res = Webino_Dashboard_Bots_Loyalty::redeem_points( $uid );
				if ( is_wp_error( $res ) ) {
					self::send_text( $chat, $res->get_error_message() );
				} else {
					self::send_text( $chat, sprintf( __( 'کد تخفیف شما: %s', 'webino-dashboard' ), $res ) );
				}
				return;
			}
		}
		if ( ( $text === '/points' || strpos( $text, '/points' ) === 0 ) && class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( $uid ) {
				Webino_Dashboard_Bots_Loyalty::touch_last_seen( $uid );
				$tier = Webino_Dashboard_Bots_Loyalty::tier_for_user( $uid );
				self::send_text(
					$chat,
					sprintf(
						/* translators: 1: points 2: tier label */
						__( "امتیاز شما: %1\$d\nسطح: %2\$s", 'webino-dashboard' ),
						Webino_Dashboard_Bots_Loyalty::get_points( $uid ),
						(string) ( $tier['label'] ?? '' )
					)
				);
				return;
			}
		}
		if ( preg_match( '/^\/birthday\s+(\d{4}-\d{2}-\d{2})$/', $text, $bm ) && class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( $uid ) {
				Webino_Dashboard_Bots_Loyalty::set_birthday( $uid, $bm[1] );
				self::send_text( $chat, __( 'تاریخ تولد ذخیره شد.', 'webino-dashboard' ) );
				return;
			}
		}
		if ( $text === '/daily' && class_exists( 'Webino_Dashboard_Bots_Club', false ) ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( $uid ) {
				$code = Webino_Dashboard_Bots_Club::maybe_daily_coupon( $uid );
				self::send_text( $chat, $code !== '' ? sprintf( __( 'کوپن روزانه: %s', 'webino-dashboard' ), $code ) : __( 'الان کوپن روزانه در دسترس نیست.', 'webino-dashboard' ) );
				return;
			}
		}
		if ( preg_match( '/^\d{4,}$/', $text ) ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( $uid && function_exists( 'wc_get_order' ) ) {
				$order = wc_get_order( (int) $text );
				if ( $order && (int) $order->get_user_id() === $uid ) {
					$vars = class_exists( 'Webino_Dashboard_Bots_Templates', false ) ? Webino_Dashboard_Bots_Templates::order_vars( $order ) : array();
					self::send_text(
						$chat,
						sprintf(
							__( "سفارش #%1\$s\nوضعیت: %2\$s\nمبلغ: %3\$s\nپیگیری: %4\$s", 'webino-dashboard' ),
							$vars['order_number'] ?? $order->get_order_number(),
							$vars['order_status'] ?? wc_get_order_status_name( $order->get_status() ),
							$vars['total'] ?? wp_strip_all_tags( $order->get_formatted_order_total() ),
							$vars['tracking_code'] ?? '—'
						)
					);
					return;
				}
			}
		}
		if ( strpos( $text, '/search ' ) === 0 ) {
			$repo->set_state( $chat, null );
			$q = trim( (string) substr( $text, 8 ) );
			StoreFlow::send_search_results( $chat, $q, ChatUser::get_wp_user_id_by_chat( $chat ) ?: null );
			return;
		}

		if ( $state === 'waiting_for_ticket' && $text !== '' && $text !== '/cancel' ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $chat );
			if ( $uid && class_exists( 'Webino_Dashboard_Bots_Tickets', false ) ) {
				Webino_Dashboard_Bots_Tickets::open( $uid, 'telegram', $chat, $text );
				$repo->set_state( $chat, null );
				self::send_text( $chat, __( 'تیکت ثبت شد. به‌زودی پاسخ می‌دهیم.', 'webino-dashboard' ) );
				return;
			}
		}

		if ( $state === 'admin_ticket_reply' && $text !== '' && $text !== '/cancel' ) {
			$temp = $repo->get_temp_data( $chat );
			$tid  = isset( $temp['ticket_id'] ) ? (string) $temp['ticket_id'] : '';
			if ( $tid !== '' && class_exists( 'Webino_Dashboard_Bots_Tickets', false ) ) {
				Webino_Dashboard_Bots_Tickets::append( $tid, 'admin', $text );
				$repo->set_state( $chat, null );
				self::send_text( $chat, __( 'پاسخ ارسال شد.', 'webino-dashboard' ) );
				return;
			}
		}

		if ( $text !== '' && strpos( $text, '/' ) !== 0 && class_exists( 'Webino_Dashboard_Bots_FAQ', false ) ) {
			$faq = Webino_Dashboard_Bots_FAQ::match( $text );
			if ( is_string( $faq ) && $faq !== '' ) {
				self::send_text( $chat, $faq );
				return;
			}
		}

		if ( $text !== '' && strpos( $text, '/' ) === 0 ) {
			self::send_text( $chat, __( 'دستور ناشناخته است. برای شروع از /start استفاده کنید.', 'webino-dashboard' ) );
			return;
		}

		self::log_info( 'message_unhandled_text', array( 'chat_id' => $chat ) );
	}

	private static function send_text( string $chat_id, string $text ): void {
		$c = new Client();
		$c->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => $text,
			)
		);
	}

	/**
	 * JSON reply_markup for the store main keyboard (replaces one-time contact keyboard).
	 */
	public static function main_menu_reply_markup(): string {
		$labels = self::menu_labels();
		$keys   = array( 'store', 'search', 'wishlist', 'cart', 'checkout', 'orders', 'addresses', 'support', 'sale' );
		$btns   = array();
		foreach ( $keys as $key ) {
			if ( ! self::menu_item_enabled( $key ) ) {
				continue;
			}
			if ( ! isset( $labels[ $key ] ) || $labels[ $key ] === '' ) {
				continue;
			}
			$btns[] = array( 'text' => $labels[ $key ] );
		}
		$has_store = false;
		$has_cart  = false;
		foreach ( $btns as $b ) {
			if ( $b['text'] === $labels['store'] ) {
				$has_store = true;
			}
			if ( $b['text'] === $labels['cart'] ) {
				$has_cart = true;
			}
		}
		if ( ! $has_store && ! $has_cart ) {
			$btns[] = array( 'text' => $labels['store'] );
		}
		$rows = array();
		$row  = array();
		foreach ( $btns as $btn ) {
			$row[] = $btn;
			if ( count( $row ) >= 2 ) {
				$rows[] = $row;
				$row    = array();
			}
		}
		if ( ! empty( $row ) ) {
			$rows[] = $row;
		}
		return wp_json_encode(
			array(
				'keyboard'        => $rows,
				'resize_keyboard' => true,
			)
		);
	}

	private static function contact_keyboard(): string {
		$s = Plugin::get_settings();
		return wp_json_encode(
			array(
				'keyboard'          => array(
					array(
						array(
							'text'            => (string) $s['contact_button_text'],
							'request_contact' => true,
						),
					),
				),
				'resize_keyboard'   => true,
				'one_time_keyboard' => true,
			)
		);
	}

	private static function handle_start( string $chat_id, string $start_payload = '' ): void {
				AdminFlow::clear_on_start( $chat_id );

		$is_account_link = $start_payload !== '' && ( 0 === strpos( $start_payload, 'BLP-' ) || 0 === strpos( $start_payload, 'otp_' ) );
		$is_referral     = $start_payload !== '' && 0 === strpos( $start_payload, 'ref_' );

		if ( $is_referral && class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			$repo0 = new SessionRepository();
			$row0  = $repo0->get_by_chat_id( $chat_id );
			$data0 = ( $row0 && isset( $row0['data'] ) && is_array( $row0['data'] ) ) ? $row0['data'] : array();
			$data0['pending_ref_payload'] = $start_payload;
			$repo0->upsert( $chat_id, ChatUser::get_wp_user_id_by_chat( $chat_id ) ?: null, null, $data0, false );
		}

		if ( $is_account_link && class_exists( 'Webino_Dashboard_Bots_Site_Widgets', false ) ) {
			$link_uid = \Webino_Dashboard_Bots_Site_Widgets::consume_account_link_token( $start_payload );
			if ( $link_uid > 0 && get_userdata( $link_uid ) ) {
				ChatUser::link_chat_to_user( $chat_id, $link_uid );
				$repo_link = new SessionRepository();
				$repo_link->upsert( $chat_id, $link_uid, null, array(), true );
				$c_link = new Client();
				$acct   = function_exists( 'wc_get_page_permalink' ) ? (string) wc_get_page_permalink( 'myaccount' ) : home_url( '/' );
				$c_link->send_message(
					array(
						'chat_id'      => $chat_id,
						'text'         => __( 'حساب شما با موفقیت متصل شد.', 'webino-dashboard' ) . "\n" . $acct,
						'reply_markup' => self::main_menu_reply_markup(),
					)
				);
				return;
			}
		}

		$s   = Plugin::get_settings();
		$uid = ChatUser::get_wp_user_id_by_chat( $chat_id );
		$c   = new Client();
		if ( $uid ) {
			if ( self::enforce_force_join( $chat_id, $c ) ) {
				return;
			}
			$repo = new SessionRepository();
			$repo->upsert( $chat_id, $uid, null, array(), true );
			if ( self::needs_name_onboarding( $uid ) ) {
				$repo->set_state( $chat_id, self::STATE_WAITING_FIRST_NAME );
				$c->send_message(
					array(
						'chat_id' => $chat_id,
						'text'    => __( 'نام را ارسال کنید:', 'webino-dashboard' ),
					)
				);
				return;
			}
			$welcome = (string) $s['welcome_text'];
			if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
				Webino_Dashboard_Bots_Loyalty::touch_last_seen( $uid );
				$ls = Webino_Dashboard_Bots_Loyalty::settings();
				if ( ! empty( $ls['enabled'] ) && '0' !== (string) $ls['enabled'] ) {
					$welcome .= "\n\n" . sprintf(
						/* translators: %d: points */
						__( 'امتیاز باشگاه مشتریان: %d', 'webino-dashboard' ),
						Webino_Dashboard_Bots_Loyalty::get_points( $uid )
					);
				}
				if ( ! empty( $ls['referral_enabled'] ) && '0' !== (string) $ls['referral_enabled'] ) {
					$welcome .= "\n" . sprintf(
						/* translators: %s: payload */
						__( 'لینک دعوت: /start %s', 'webino-dashboard' ),
						Webino_Dashboard_Bots_Loyalty::referral_payload( $uid )
					);
				}
				$wcode = Webino_Dashboard_Bots_Loyalty::maybe_welcome_coupon( $uid );
				if ( $wcode !== '' ) {
					$welcome .= "\n" . sprintf( __( 'کوپن خوش‌آمدگویی: %s', 'webino-dashboard' ), $wcode );
				}
			}
			$c->send_message(
				array(
					'chat_id'      => $chat_id,
					'text'         => $welcome,
					'reply_markup' => self::main_menu_reply_markup(),
				)
			);
			return;
		}

		$c->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => (string) $s['welcome_text'],
				'reply_markup' => self::contact_keyboard(),
			)
		);
	}

	/**
	 * @param array<string, mixed> $contact
	 * @param array<string, mixed> $from
	 */
	private static function handle_contact( string $chat_id, array $contact, array $from ): void {
		$s = Plugin::get_settings();
		if ( ! ContactVerifier::is_own_contact( $contact, $from ) ) {
			self::send_text( $chat_id, (string) $s['error_text'] );
			return;
		}
		$raw  = isset( $contact['phone_number'] ) ? (string) $contact['phone_number'] : '';
		$norm = PhoneNormalizer::normalize( $raw );
		if ( $norm === '' ) {
			self::send_text( $chat_id, (string) $s['error_text'] );
			return;
		}

		$user = UserResolver::find_user_by_phone( $norm );
		if ( ! $user ) {
			$created = UserResolver::create_customer( $norm );
			if ( is_wp_error( $created ) ) {
				self::send_text( $chat_id, (string) $s['error_text'] );
				return;
			}
			$user = get_user_by( 'id', $created );
		}

		if ( ! $user ) {
			self::send_text( $chat_id, (string) $s['error_text'] );
			return;
		}

		ChatUser::link_chat_to_user( $chat_id, (int) $user->ID );
		if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			$repo_ref = new SessionRepository();
			$row_ref  = $repo_ref->get_by_chat_id( $chat_id );
			$payload  = '';
			if ( $row_ref && isset( $row_ref['data']['pending_ref_payload'] ) ) {
				$payload = (string) $row_ref['data']['pending_ref_payload'];
			}
			if ( $payload !== '' ) {
				Webino_Dashboard_Bots_Loyalty::maybe_apply_referral( (int) $user->ID, $payload );
			}
		}

		$repo = new SessionRepository();
		$repo->upsert( $chat_id, (int) $user->ID, null, array(), true );

		$c = new Client();
		if ( self::enforce_force_join( $chat_id, $c ) ) {
			return;
		}
		if ( self::needs_name_onboarding( (int) $user->ID ) ) {
			$repo->set_state( $chat_id, self::STATE_WAITING_FIRST_NAME );
			$c->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'نام را ارسال کنید:', 'webino-dashboard' ),
				)
			);
			return;
		}
		$auth_text = (string) $s['auth_success_text'];
		if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			Webino_Dashboard_Bots_Loyalty::touch_last_seen( (int) $user->ID );
			$wcode = Webino_Dashboard_Bots_Loyalty::maybe_welcome_coupon( (int) $user->ID );
			if ( $wcode !== '' ) {
				$auth_text .= "\n" . sprintf( __( 'کوپن خوش‌آمدگویی: %s', 'webino-dashboard' ), $wcode );
			}
		}
		$c->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => $auth_text,
				'reply_markup' => self::main_menu_reply_markup(),
			)
		);
	}

	private static function handle_coupon_text( string $chat_id, string $code ): void {
		$repo = new SessionRepository();
		$uid  = ChatUser::get_wp_user_id_by_chat( $chat_id );
		if ( ! $uid ) {
			$repo->set_state( $chat_id, null );
			self::send_text( $chat_id, __( 'ابتدا وارد شوید.', 'webino-dashboard' ) );
			return;
		}

		$trimmed = trim( $code );
		if ( $trimmed === '' ) {
			self::send_text( $chat_id, __( 'لطفاً کد تخفیف را وارد کنید.', 'webino-dashboard' ) );
			return;
		}

		$cart = new UserCartContext();
		$res  = $cart->apply_coupon( $uid, $trimmed );
		$repo->set_state( $chat_id, null );

		$c = new Client();
		if ( is_wp_error( $res ) ) {
			$c->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => $res->get_error_message(),
				)
			);
			return;
		}

		$c->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => __( 'کد تخفیف اعمال شد.', 'webino-dashboard' ),
			)
		);
		CartFlow::send_cart( $chat_id, $uid );
	}
}
