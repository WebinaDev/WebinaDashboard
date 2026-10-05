<?php

namespace Webino_Dashboard_Bots_Bale\Bot;

use Webino_Dashboard_Bots_Bale\Bale\Client;
use Webino_Dashboard_Bots_Bale\Bot\AdminFlow;
use Webino_Dashboard_Bots_Bale\Bot\AdminGate;
use Webino_Dashboard_Bots_Bale\Core\Plugin;
use Webino_Dashboard_Bots_Bale\Database\SessionRepository;
use Webino_Dashboard_Bots_Bale\Util\ChatUser;
use Webino_Dashboard_Bots_Bale\Util\MoneyFormatter;
use Webino_Dashboard_Bots_Bale\Woo\CheckoutService;
use Webino_Dashboard_Bots_Bale\Woo\OrderInvoiceMeta;
use Webino_Dashboard_Bots_Bale\Woo\StockWatchRegistry;
use Webino_Dashboard_Bots_Bale\Woo\UserCartContext;
use Webino_Dashboard_Bots_Bale\Woo\UserWishlistContext;

/**
 * Inline callback queries.
 *
 * Uses callback_query.from.id for user/session (private chat id). Channel inline
 * buttons use message.chat.id = channel; from.id is always the clicking user.
 */
class CallbackHandler {
	private const FORCE_JOIN_CHECK_CALLBACK = 'fj:check';

	/**
	 * Remove the inline keyboard message the user clicked so store navigation stays tidy.
	 */
	private static function delete_callback_message_if_any( Client $client, string $message_chat, string $user_chat, int $mid ): void {
		if ( $mid < 1 ) {
			return;
		}
		$chat_for_delete = $message_chat !== '' ? $message_chat : $user_chat;
		$client->delete_message(
			array(
				'chat_id'    => $chat_for_delete,
				'message_id' => $mid,
			)
		);
	}

	/**
	 * @param array<string, mixed> $context
	 */
	private static function log_info( string $event, array $context = array() ): void {
		$message = '[' . $event . '] ' . wp_json_encode( $context );
		if ( function_exists( 'wc_get_logger' ) ) {
			wc_get_logger()->info( $message, array( 'source' => 'webino_dashboard_bale' ) );
			return;
		}
		error_log( 'woobale ' . $message );
	}

	/**
	 * @param array<string, mixed> $cb
	 */
	public static function handle( array $cb ): void {
		$data = isset( $cb['data'] ) ? (string) $cb['data'] : '';
		$id   = isset( $cb['id'] ) ? (string) $cb['id'] : '';
		$msg  = isset( $cb['message'] ) && is_array( $cb['message'] ) ? $cb['message'] : array();
		/** Chat where the inline message lives (private user chat or channel). */
		$message_chat = isset( $msg['chat']['id'] ) ? (string) $msg['chat']['id'] : '';
		/** User who clicked (always use for linking + DM replies). */
		$user_chat = isset( $cb['from']['id'] ) ? (string) $cb['from']['id'] : '';
		$reply_chat = $message_chat !== '' ? $message_chat : $user_chat;
		$mid       = isset( $msg['message_id'] ) ? (int) $msg['message_id'] : 0;

		$client = new Client();
		if ( $id !== '' ) {
			$client->answer_callback_query( array( 'callback_query_id' => $id ) );
		}

		if ( $data === '' || $user_chat === '' ) {
			self::log_info( 'callback_skip_invalid_payload' );
			return;
		}
		if ( strpos( $data, AdminFlow::CB_PREFIX ) === 0 ) {
			if ( AdminGate::is_admin_chat( $user_chat ) ) {
				AdminFlow::handle_callback( $data, $user_chat, $client );
			}
			return;
		}
		$from = isset( $cb['from'] ) && is_array( $cb['from'] ) ? $cb['from'] : array();
		if ( $data === 'noop' ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false ) && Webino_Dashboard_Bots_Admin_Ops::handle_callback( $data, $user_chat, 'bale' ) ) {
			return;
		}
		if ( class_exists( 'Webino_C2C_Receipts', false ) && Webino_C2C_Receipts::handle_callback( $data, $user_chat, 'bale', $from ) ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_Bots_C2C_Gateway', false ) && Webino_Dashboard_Bots_C2C_Gateway::handle_callback( $data, $user_chat, 'bale', $from ) ) {
			return;
		}
		if ( strpos( $data, 'tkc:' ) === 0 && class_exists( 'Webino_Dashboard_Bots_Tickets', false ) ) {
			Webino_Dashboard_Bots_Tickets::close( substr( $data, 4 ) );
			$client->send_message( array( 'chat_id' => $user_chat, 'text' => __( 'تیکت بسته شد.', 'webino-dashboard' ) ) );
			return;
		}
		if ( strpos( $data, 'tkr:' ) === 0 && class_exists( 'Webino_Dashboard_Bots_Tickets', false ) ) {
			$repo = new SessionRepository();
			$repo->set_state( $user_chat, 'admin_ticket_reply' );
			$repo->merge_temp_data( $user_chat, array( 'ticket_id' => substr( $data, 4 ) ) );
			$client->send_message( array( 'chat_id' => $user_chat, 'text' => __( 'پاسخ تیکت را بنویسید:', 'webino-dashboard' ) ) );
			return;
		}
		if ( $data === self::FORCE_JOIN_CHECK_CALLBACK ) {
			$settings          = Plugin::get_settings();
			$force_join_on     = ! empty( $settings['force_join_enabled'] ) && $settings['force_join_enabled'] !== '0';
			$force_join_chat   = isset( $settings['force_join_channel_id'] ) ? trim( (string) $settings['force_join_channel_id'] ) : '';
			$membership_status = null;
			if ( $force_join_on && $force_join_chat !== '' ) {
				$membership_status = $client->is_channel_member( $force_join_chat, $user_chat );
			}

			if ( $force_join_on && $force_join_chat !== '' && $membership_status !== true ) {
				MessageHandler::enforce_force_join( $user_chat, $client );
				$client->send_message(
					array(
						'chat_id' => $user_chat,
						'text'    => __( 'عضویت شما هنوز تایید نشده است. لطفاً ابتدا عضو کانال شوید و دوباره بررسی کنید.', 'webino-dashboard' ),
					)
				);
				return;
			}
			$uid_for_menu = ChatUser::get_wp_user_id_by_chat( $user_chat );
			if ( $uid_for_menu && class_exists( 'Webino_Dashboard_Bots_Club', false ) ) {
				$code = Webino_Dashboard_Bots_Club::maybe_issue_join_coupon( $uid_for_menu );
				if ( $code !== '' ) {
					$client->send_message(
						array(
							'chat_id' => $user_chat,
							'text'    => sprintf( __( 'کوپن عضویت شما: %s', 'webino-dashboard' ), $code ),
						)
					);
				}
				$repo_fj = new SessionRepository();
				$row_fj  = $repo_fj->get_by_chat_id( $user_chat );
				$payload = ( $row_fj && isset( $row_fj['data']['pending_ref_payload'] ) ) ? (string) $row_fj['data']['pending_ref_payload'] : '';
				if ( $payload !== '' && preg_match( '/^ref_(\d+)$/', $payload, $rm ) ) {
					Webino_Dashboard_Bots_Club::record_join_referral( (int) $rm[1], (int) $uid_for_menu );
				}
			}
			if ( $uid_for_menu ) {
				$client->send_message(
					array(
						'chat_id'      => $user_chat,
						'text'         => __( 'عضویت شما تایید شد. حالا می‌توانید از ربات استفاده کنید.', 'webino-dashboard' ),
						'reply_markup' => MessageHandler::main_menu_reply_markup(),
					)
				);
			} else {
				$client->send_message(
					array(
						'chat_id' => $user_chat,
						'text'    => __( 'عضویت شما تایید شد. حالا /start را بزنید و شماره را ارسال کنید.', 'webino-dashboard' ),
					)
				);
			}
			return;
		}
		if ( MessageHandler::enforce_force_join( $user_chat, $client ) ) {
			return;
		}

		if ( strpos( $data, 'a:' ) === 0 || strpos( $data, 'pt:' ) === 0 ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $reply_chat );
			if ( ! $uid ) {
				$uid = ChatUser::get_wp_user_id_by_chat( $user_chat );
			}
			$pid = (int) substr( $data, strpos( $data, ':' ) + 1 );
			if ( ! $uid ) {
				$client->send_message(
					array(
						'chat_id' => $reply_chat,
						'text'    => __( 'ابتدا /start را بزنید و شماره را ارسال کنید.', 'webino-dashboard' ),
					)
				);
				return;
			}
			if ( $pid < 1 ) {
				return;
			}
			$need_type = class_exists( 'Webino_Dashboard_Bots_WFCP', false ) && count( Webino_Dashboard_Bots_WFCP::enabled_types() ) > 1;
			if ( $need_type || strpos( $data, 'pt:' ) === 0 ) {
				StoreFlow::send_purchase_type_picker( $user_chat, 'pta', $pid );
				return;
			}
			self::add_product_with_type( $client, $reply_chat, $uid, $pid, 'cash', 0, false );
			return;
		}

		if ( strpos( $data, 'qb:' ) === 0 ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $reply_chat );
			if ( ! $uid ) {
				$uid = ChatUser::get_wp_user_id_by_chat( $user_chat );
			}
			if ( ! $uid ) {
				$client->send_message(
					array(
						'chat_id' => $reply_chat,
						'text'    => __( 'ابتدا /start را بزنید و شماره را ارسال کنید.', 'webino-dashboard' ),
					)
				);
				return;
			}
			$parts = explode( ':', $data );
			$pid   = isset( $parts[1] ) ? (int) $parts[1] : 0;
			$qty   = isset( $parts[2] ) ? max( 1, (int) $parts[2] ) : 1;
			if ( $pid < 1 ) {
				return;
			}
			self::handle_quick_buy( $client, $user_chat, $uid, $pid, $qty );
			return;
		}

		if ( strpos( $data, 'ao:' ) === 0 ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $reply_chat );
			if ( ! $uid ) {
				$uid = ChatUser::get_wp_user_id_by_chat( $user_chat );
			}
			if ( ! $uid ) {
				$client->send_message(
					array(
						'chat_id' => $reply_chat,
						'text'    => __( 'ابتدا /start را بزنید و شماره را ارسال کنید.', 'webino-dashboard' ),
					)
				);
				return;
			}
			$parts = explode( ':', $data );
			$pid   = isset( $parts[1] ) ? (int) $parts[1] : 0;
			$opt   = isset( $parts[2] ) ? sanitize_key( (string) $parts[2] ) : '';
			if ( $pid < 1 || $opt === '' ) {
				return;
			}
			self::add_product_with_type( $client, $user_chat, $uid, $pid, 'cash', 0, false, array( 'webino_bot_addon' => $opt ) );
			return;
		}

		if ( strpos( $data, 'pta:' ) === 0 || strpos( $data, 'ptv:' ) === 0 ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $reply_chat );
			if ( ! $uid ) {
				$uid = ChatUser::get_wp_user_id_by_chat( $user_chat );
			}
			if ( ! $uid ) {
				$client->send_message(
					array(
						'chat_id' => $reply_chat,
						'text'    => __( 'ابتدا /start را بزنید و شماره را ارسال کنید.', 'webino-dashboard' ),
					)
				);
				return;
			}
			$is_var = strpos( $data, 'ptv:' ) === 0;
			$parts  = explode( ':', $data );
			// pta|ptv : id [: type [: months]]  OR  ptv:id alone → type picker
			$id = isset( $parts[1] ) ? (int) $parts[1] : 0;
			if ( $id < 1 ) {
				return;
			}
			$type = isset( $parts[2] ) ? sanitize_key( (string) $parts[2] ) : '';
			if ( $type === '' ) {
				StoreFlow::send_purchase_type_picker( $user_chat, $is_var ? 'ptv' : 'pta', $id );
				return;
			}
			$months = isset( $parts[3] ) ? (int) $parts[3] : 0;
			self::add_product_with_type( $client, $user_chat, $uid, $id, $type, $months, $is_var );
			return;
		}

		if ( strpos( $data, 'pd:' ) === 0 ) {
			$pid = (int) substr( $data, 3 );
			$uid = ChatUser::get_wp_user_id_by_chat( $reply_chat );
			if ( ! $uid ) {
				$uid = ChatUser::get_wp_user_id_by_chat( $user_chat );
			}
			if ( ! $uid ) {
				$client->send_message(
					array(
						'chat_id' => $user_chat,
						'text'    => __( 'ابتدا /start را بزنید و شماره را ارسال کنید.', 'webino-dashboard' ),
					)
				);
				return;
			}
			if ( $pid > 0 ) {
				if ( $uid ) {
					update_user_meta( $uid, '_webino_bot_viewed_product_' . $pid, time() );
				}
				StoreFlow::send_product_detail( $user_chat, $pid );
			}
			return;
		}

		if ( strpos( $data, 'w:' ) === 0 ) {
			$pid = (int) substr( $data, 2 );
			if ( $pid < 1 ) {
				return;
			}
			$uid = ChatUser::get_wp_user_id_by_chat( $reply_chat );
			if ( ! $uid ) {
				$uid = ChatUser::get_wp_user_id_by_chat( $user_chat );
			}
			if ( ! $uid ) {
				$client->send_message(
					array(
						'chat_id' => $reply_chat,
						'text'    => __( 'ابتدا /start را بزنید و شماره را ارسال کنید.', 'webino-dashboard' ),
					)
				);
				return;
			}
			$wishlist = new UserWishlistContext();
			$in_list  = $wishlist->has( $uid, $pid );
			$ok       = $in_list ? $wishlist->remove( $uid, $pid ) : $wishlist->add( $uid, $pid );
			if ( ! $ok ) {
				$client->send_message(
					array(
						'chat_id' => $reply_chat,
						'text'    => __( 'به‌روزرسانی علاقمندی‌ها انجام نشد.', 'webino-dashboard' ),
					)
				);
				return;
			}
			$client->send_message(
				array(
					'chat_id' => $reply_chat,
					'text'    => $in_list ? __( 'محصول از علاقمندی‌ها حذف شد.', 'webino-dashboard' ) : __( 'محصول به علاقمندی‌ها اضافه شد.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$uid = ChatUser::get_wp_user_id_by_chat( $reply_chat );
		if ( ! $uid ) {
			$uid = ChatUser::get_wp_user_id_by_chat( $user_chat );
		}
		if ( ! $uid ) {
			$client->send_message(
				array(
					'chat_id' => $reply_chat,
					'text'    => __( 'ابتدا /start را بزنید و شماره را ارسال کنید.', 'webino-dashboard' ),
				)
			);
			return;
		}

		if ( strpos( $data, 'oq:' ) === 0 ) {
			$order_id = (int) substr( $data, 3 );
			self::handle_order_question_callback( $client, $user_chat, $uid, $order_id );
			return;
		}

		if ( strpos( $data, 'sn:' ) === 0 ) {
			$pid = (int) substr( $data, 3 );
			self::handle_stock_notify_callback( $client, $user_chat, $uid, $pid );
			return;
		}

		if (
			strpos( $data, 'an:' ) === 0 ||
			strpos( $data, 'ae:' ) === 0 ||
			strpos( $data, 'ad:' ) === 0 ||
			strpos( $data, 'as:' ) === 0 ||
			strpos( $data, 'ac:' ) === 0
		) {
			AccountFlow::handle_address_callback( $user_chat, $uid, $data );
			return;
		}

		if ( strpos( $data, 'ast:' ) === 0 || strpos( $data, 'act:' ) === 0 ) {
			$edit_chat = $message_chat !== '' ? $message_chat : $user_chat;
			AccountFlow::handle_address_state_city_callback( $user_chat, $data, $mid, $edit_chat );
			return;
		}

		if ( strpos( $data, 'od:' ) === 0 || strpos( $data, 'oc:' ) === 0 || strpos( $data, 'ot:' ) === 0
			|| strpos( $data, 'orn:' ) === 0 || strpos( $data, 'ori:' ) === 0 || strpos( $data, 'orq:' ) === 0 ) {
			AccountFlow::handle_order_callback( $user_chat, $uid, $data );
			return;
		}

		if ( strpos( $data, 'ro:' ) === 0 ) {
			$order_id = (int) substr( $data, 3 );
			self::handle_reorder( $client, $user_chat, $uid, $order_id );
			return;
		}

		if ( strpos( $data, 'v:' ) === 0 ) {
			$parts  = explode( ':', $data );
			$parent = isset( $parts[1] ) ? (int) $parts[1] : 0;
			$cat    = isset( $parts[2] ) ? (int) $parts[2] : 0;
			$brand  = isset( $parts[3] ) ? (int) $parts[3] : 0;
			$pg     = isset( $parts[4] ) ? (int) $parts[4] : 0;
			if ( $parent > 0 ) {
				self::delete_callback_message_if_any( $client, $message_chat, $user_chat, $mid );
				StoreFlow::send_variation_picker( $user_chat, $parent, $cat, $brand, $pg );
			}
			return;
		}

		if ( strpos( $data, 'vx:' ) === 0 ) {
			$vid = (int) substr( $data, 3 );
			if ( $vid < 1 ) {
				return;
			}
			$need_type = class_exists( 'Webino_Dashboard_Bots_WFCP', false ) && count( Webino_Dashboard_Bots_WFCP::enabled_types() ) > 1;
			if ( $need_type ) {
				StoreFlow::send_purchase_type_picker( $user_chat, 'ptv', $vid );
				return;
			}
			self::add_product_with_type( $client, $user_chat, $uid, $vid, 'cash', 0, true );
			return;
		}

		if ( strpos( $data, 'c:' ) === 0 ) {
			$parts = explode( ':', $data );
			$cat   = isset( $parts[1] ) ? (int) $parts[1] : 0;
			if ( $cat > 0 ) {
				self::delete_callback_message_if_any( $client, $message_chat, $user_chat, $mid );
				StoreFlow::send_categories( $user_chat, 0, $cat );
			}
			return;
		}

		if ( strpos( $data, 'p:' ) === 0 ) {
			$parts = explode( ':', $data );
			$cat   = isset( $parts[1] ) ? (int) $parts[1] : 0;
			$brand = isset( $parts[2] ) ? (int) $parts[2] : 0;
			$page  = isset( $parts[3] ) ? (int) $parts[3] : 0;
			if ( $cat > 0 ) {
				self::delete_callback_message_if_any( $client, $message_chat, $user_chat, $mid );
				StoreFlow::send_products_page( $user_chat, $cat, $page, $brand > 0 ? $brand : null, $uid );
			}
			return;
		}

		if ( strpos( $data, 'bpg:' ) === 0 ) {
			$parts = explode( ':', $data );
			$cat   = isset( $parts[1] ) ? (int) $parts[1] : 0;
			$page  = isset( $parts[2] ) ? (int) $parts[2] : 0;
			if ( $cat > 0 ) {
				self::delete_callback_message_if_any( $client, $message_chat, $user_chat, $mid );
				StoreFlow::send_brands_page( $user_chat, $cat, $page );
			}
			return;
		}

		if ( strpos( $data, 'b:' ) === 0 ) {
			$parts = explode( ':', $data );
			$key   = isset( $parts[1] ) ? (string) $parts[1] : '';
			$cat   = isset( $parts[2] ) ? (int) $parts[2] : 0;
			$page  = isset( $parts[3] ) ? (int) $parts[3] : 0;
			if ( $cat < 1 ) {
				return;
			}
			self::delete_callback_message_if_any( $client, $message_chat, $user_chat, $mid );
			if ( $key === 'all' ) {
				StoreFlow::send_products_page( $user_chat, $cat, $page, null, $uid );
				return;
			}
			$brand_id = (int) $key;
			if ( $brand_id > 0 ) {
				StoreFlow::send_products_page( $user_chat, $cat, $page, $brand_id, $uid );
			}
			return;
		}

		if ( strpos( $data, 'catp:' ) === 0 ) {
			$parts = explode( ':', $data );
			self::delete_callback_message_if_any( $client, $message_chat, $user_chat, $mid );
			if ( count( $parts ) >= 3 ) {
				$parent = isset( $parts[1] ) ? (int) $parts[1] : 0;
				$page   = isset( $parts[2] ) ? (int) $parts[2] : 0;
				StoreFlow::send_categories( $user_chat, max( 0, $page ), max( 0, $parent ) );
			} else {
				$page = (int) substr( $data, 5 );
				StoreFlow::send_categories( $user_chat, max( 0, $page ) );
			}
			return;
		}

		if ( $data === 'cp' ) {
			$repo = new SessionRepository();
			$repo->set_state( $user_chat, 'waiting_for_coupon' );
			$client->send_message(
				array(
					'chat_id' => $user_chat,
					'text'    => __( '🎁 لطفاً کد تخفیف خود را ارسال کنید.', 'webino-dashboard' ),
				)
			);
			return;
		}

		if ( $data === 'ch' ) {
			CheckoutFlow::start( $user_chat );
			return;
		}

		if ( strpos( $data, 'sh:' ) === 0 ) {
			$idx = (int) substr( $data, 3 );
			CheckoutFlow::handle_shipping_select( $user_chat, $idx );
			return;
		}

		if ( strpos( $data, 'st:' ) === 0 ) {
			$state_code = (string) substr( $data, 3 );
			if ( $state_code !== '' ) {
				$edit_chat = $message_chat !== '' ? $message_chat : $user_chat;
				CheckoutFlow::handle_state_select( $user_chat, $state_code, $mid, $edit_chat );
			}
			return;
		}

		if ( strpos( $data, 'ct:' ) === 0 ) {
			$city_term_id = (int) substr( $data, 3 );
			if ( $city_term_id > 0 ) {
				CheckoutFlow::handle_city_select( $user_chat, $city_term_id );
			}
			return;
		}

		if ( strpos( $data, 'qp:' ) === 0 || strpos( $data, 'qm:' ) === 0 || strpos( $data, 'qd:' ) === 0 ) {
			if ( $mid < 1 ) {
				return;
			}
			$edit_chat = $message_chat !== '' ? $message_chat : $user_chat;
			$ref       = substr( $data, 3 );
			$map       = CartFlow::get_refs_map( $user_chat );
			if ( ! $map || empty( $map[ $ref ] ) ) {
				CartFlow::send_cart( $user_chat, $uid );
				return;
			}
			$key      = (string) $map[ $ref ];
			$cart     = new UserCartContext();
			$contents = $cart->get_cart_contents( $uid );
			$item     = $contents[ $key ] ?? null;
			if ( ! $item ) {
				CartFlow::edit_cart_message( $edit_chat, $mid, $uid );
				return;
			}
			$qty = (int) $item['quantity'];
			if ( strpos( $data, 'qp:' ) === 0 ) {
				$cart->set_quantity( $uid, $key, $qty + 1 );
			} elseif ( strpos( $data, 'qm:' ) === 0 ) {
				if ( $qty <= 1 ) {
					$cart->remove_line( $uid, $key );
				} else {
					$cart->set_quantity( $uid, $key, $qty - 1 );
				}
			} else {
				$cart->remove_line( $uid, $key );
			}
			CartFlow::edit_cart_message( $edit_chat, $mid, $uid );
			return;
		}

		if ( strpos( $data, 'i:' ) === 0 ) {
			// Quantity-center button: just refresh cart to keep UX consistent.
			CartFlow::send_cart( $user_chat, $uid );
			return;
		}

		if ( strpos( $data, 'pb:' ) === 0 ) {
			$oid = (int) substr( $data, 3 );
			self::send_bale_invoice( $user_chat, $oid, $uid );
			return;
		}

		if ( strpos( $data, 'pg:' ) === 0 ) {
			$parts = explode( ':', $data );
			$oid   = isset( $parts[1] ) ? (int) $parts[1] : 0;
			$gid   = isset( $parts[2] ) ? sanitize_key( (string) $parts[2] ) : '';
			if ( $oid > 0 && $gid !== '' ) {
				self::send_gateway_pay( $user_chat, $oid, $uid, $gid );
			}
			return;
		}

		if ( strpos( $data, 'pw:' ) === 0 ) {
			$oid = (int) substr( $data, 3 );
			self::send_web_pay( $user_chat, $oid, $uid );
			return;
		}
		self::log_info( 'callback_unhandled_action', array( 'data' => $data ) );
	}

	/**
	 * Add simple product or variation with WFCP purchase type meta.
	 *
	 * @param array<string, mixed> $extra_meta Extra cart item data.
	 */
	private static function add_product_with_type( Client $client, string $chat, int $uid, int $id, string $type, int $months, bool $is_variation, array $extra_meta = array() ): void {
		$product_name = '';
		if ( function_exists( 'wc_get_product' ) ) {
			$product = wc_get_product( $id );
			if ( $product ) {
				$product_name = wp_strip_all_tags( (string) $product->get_name() );
			}
		}
		$cart = new UserCartContext();
		if ( $is_variation ) {
			if ( $cart->has_variation_in_cart( $uid, $id ) ) {
				$client->send_message(
					array(
						'chat_id' => $chat,
						'text'    => __( 'شما قبلاً این محصول را به سبد اضافه کرده‌اید.', 'webino-dashboard' ),
					)
				);
				return;
			}
		} elseif ( $cart->has_product_in_cart( $uid, $id ) && empty( $extra_meta['webino_bot_addon'] ) ) {
			$client->send_message(
				array(
					'chat_id' => $chat,
					'text'    => __( 'شما قبلاً این محصول را به سبد اضافه کرده‌اید.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$meta = class_exists( 'Webino_Dashboard_Bots_WFCP', false )
			? Webino_Dashboard_Bots_WFCP::cart_item_data( $type, $months )
			: array( 'wfcp_purchase_type' => 'cash' );
		if ( ! empty( $extra_meta ) ) {
			$meta = array_merge( $meta, $extra_meta );
		}

		$conflict = $cart->get_purchase_type_conflict( $uid, isset( $meta['wfcp_purchase_type'] ) ? (string) $meta['wfcp_purchase_type'] : 'cash' );
		if ( is_string( $conflict ) && $conflict !== '' ) {
			$client->send_message( array( 'chat_id' => $chat, 'text' => $conflict ) );
			return;
		}

		if ( class_exists( 'Webino_Dashboard_Bots_Addons', false ) ) {
			$bot_opts = Webino_Dashboard_Bots_Addons::get_bot_options( $id );
			if ( ! empty( $bot_opts ) && empty( $extra_meta['webino_bot_addon'] ) ) {
				$kbd = Webino_Dashboard_Bots_Addons::format_options_keyboard( $id );
				$msg = array(
					'chat_id' => $chat,
					'text'    => __( 'یک گزینه برای این محصول انتخاب کنید:', 'webino-dashboard' ),
				);
				if ( $kbd !== '' ) {
					$msg['reply_markup'] = $kbd;
				}
				$client->send_message( $msg );
				return;
			}
			if ( Webino_Dashboard_Bots_Addons::requires_storefront( $id ) ) {
				$msg = __( 'این محصول افزودنی اجباری دارد؛ لطفاً از دکمه وب / فروشگاه سایت خرید کنید.', 'webino-dashboard' );
				$client->send_message( array( 'chat_id' => $chat, 'text' => $msg ) );
				return;
			}
		}

		$ok = $is_variation
			? $cart->add_to_cart_variation( $uid, $id, 1, $meta )
			: $cart->add_to_cart( $uid, $id, 1, $meta );

		$msg = $ok
			? sprintf(
				/* translators: %s: product name */
				__( '%s به سبد اضافه شد.', 'webino-dashboard' ),
				$product_name !== '' ? $product_name : __( 'محصول', 'webino-dashboard' )
			)
			: ( $is_variation
				? __( 'افزودن به سبد ممکن نیست.', 'webino-dashboard' )
				: __( 'افزودن به سبد ممکن نیست (موجودی، نوع محصول، یا محصول متغیر بدون انتخاب تنوع).', 'webino-dashboard' ) );

		if ( $ok && class_exists( 'Webino_Dashboard_Bots_WFCP', false ) ) {
			$lab = Webino_Dashboard_Bots_WFCP::type_label( (string) $meta['wfcp_purchase_type'] );
			$msg .= "\n" . sprintf( __( 'نوع خرید: %s', 'webino-dashboard' ), $lab );
		}

		$client->send_message( array( 'chat_id' => $chat, 'text' => $msg ) );
	}

	/**
	 * Clear cart, add product, jump to checkout.
	 */
	private static function handle_quick_buy( Client $client, string $chat, int $uid, int $pid, int $qty ): void {
		if ( class_exists( 'Webino_Dashboard_Bots_Addons', false ) ) {
			$bot_opts = Webino_Dashboard_Bots_Addons::get_bot_options( $pid );
			if ( ! empty( $bot_opts ) ) {
				$kbd = Webino_Dashboard_Bots_Addons::format_options_keyboard( $pid );
				$msg = array(
					'chat_id' => $chat,
					'text'    => __( 'قبل از خرید سریع، یک گزینه انتخاب کنید:', 'webino-dashboard' ),
				);
				if ( $kbd !== '' ) {
					$msg['reply_markup'] = $kbd;
				}
				$client->send_message( $msg );
				return;
			}
			if ( Webino_Dashboard_Bots_Addons::requires_storefront( $pid ) ) {
				$client->send_message(
					array(
						'chat_id' => $chat,
						'text'    => __( 'این محصول افزودنی اجباری دارد؛ لطفاً از فروشگاه سایت خرید کنید.', 'webino-dashboard' ),
					)
				);
				return;
			}
		}
		$cart = new UserCartContext();
		$cart->empty_cart( $uid );
		$ok = $cart->add_to_cart( $uid, $pid, max( 1, $qty ) );
		if ( ! $ok ) {
			$client->send_message(
				array(
					'chat_id' => $chat,
					'text'    => __( 'افزودن به سبد برای خرید سریع ممکن نیست.', 'webino-dashboard' ),
				)
			);
			return;
		}
		if ( method_exists( CheckoutFlow::class, 'start' ) ) {
			CheckoutFlow::start( $chat );
			return;
		}
		$client->send_message(
			array(
				'chat_id'      => $chat,
				'text'         => __( 'محصول آماده تسویه است.', 'webino-dashboard' ),
				'reply_markup' => wp_json_encode(
					array(
						'inline_keyboard' => array(
							array(
								array(
									'text'          => __( '💳 تسویه حساب', 'webino-dashboard' ),
									'callback_data' => 'ch',
								),
							),
						),
					)
				),
			)
		);
	}

	/**
	 * Re-add order line items to cart and prompt checkout.
	 */
	private static function handle_reorder( Client $client, string $chat, int $uid, int $order_id ): void {
		$order = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : false;
		if ( ! $order || (int) $order->get_user_id() !== $uid ) {
			$client->send_message( array( 'chat_id' => $chat, 'text' => __( 'سفارش یافت نشد.', 'webino-dashboard' ) ) );
			return;
		}
		$cart  = new UserCartContext();
		$cart->empty_cart( $uid );
		$added = 0;
		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof \WC_Order_Item_Product ) {
				continue;
			}
			$pid = (int) $item->get_product_id();
			$vid = (int) $item->get_variation_id();
			$qty = max( 1, (int) $item->get_quantity() );
			$ok  = false;
			if ( $vid > 0 ) {
				$ok = $cart->add_to_cart_variation( $uid, $vid, $qty );
			} elseif ( $pid > 0 ) {
				$ok = $cart->add_to_cart( $uid, $pid, $qty );
			}
			if ( $ok ) {
				++$added;
			}
		}
		if ( $added < 1 ) {
			$client->send_message(
				array(
					'chat_id' => $chat,
					'text'    => __( 'امکان افزودن مجدد اقلام این سفارش به سبد وجود ندارد.', 'webino-dashboard' ),
				)
			);
			return;
		}
		$client->send_message(
			array(
				'chat_id'      => $chat,
				'text'         => __( 'اقلام سفارش به سبد اضافه شد. برای ادامه تسویه را بزنید.', 'webino-dashboard' ),
				'reply_markup' => wp_json_encode(
					array(
						'inline_keyboard' => array(
							array(
								array(
									'text'          => __( '💳 تسویه حساب', 'webino-dashboard' ),
									'callback_data' => 'ch',
								),
							),
						),
					)
				),
			)
		);
	}

	/**
	 * Persist selected WC gateway on order, then send pay URL.
	 */
	private static function send_gateway_pay( string $chat, int $order_id, int $uid, string $gateway_id ): void {
		$client = new Client();
		$order  = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : false;
		if ( ! $order || (int) $order->get_user_id() !== $uid ) {
			$client->send_message( array( 'chat_id' => $chat, 'text' => __( 'سفارش یافت نشد.', 'webino-dashboard' ) ) );
			return;
		}
		$order->set_payment_method( $gateway_id );
		if ( function_exists( 'WC' ) && \WC()->payment_gateways() ) {
			$all = \WC()->payment_gateways()->payment_gateways();
			if ( isset( $all[ $gateway_id ] ) && is_object( $all[ $gateway_id ] ) && method_exists( $all[ $gateway_id ], 'get_title' ) ) {
				$order->set_payment_method_title( (string) $all[ $gateway_id ]->get_title() );
			}
		}
		$order->save();
		$checkout = new CheckoutService();
		$url      = add_query_arg( 'wc_gateway', $gateway_id, $checkout->get_order_pay_url( $order ) );
		$client->send_message(
			array(
				'chat_id'      => $chat,
				'text'         => __( 'برای پرداخت روی دکمه زیر بزنید:', 'webino-dashboard' ),
				'reply_markup' => wp_json_encode(
					array(
						'inline_keyboard' => array(
							array(
								array(
									'text' => '💳 ' . __( 'ادامه پرداخت', 'webino-dashboard' ),
									'url'  => $url,
								),
							),
						),
					)
				),
			)
		);
	}

	/**
	 * @param array{0:string,1:int}|null $edit_ctx Unused.
	 */
	public static function run_checkout( string $chat, $edit_ctx ): void {
		CheckoutFlow::start( $chat );
	}

	/**
	 * Inline keyboard rows for paying an existing order (Bale invoice, gateways, or site pay URL).
	 * Shared by checkout completion and «my orders» order detail.
	 *
	 * @return list<list<array<string, string>>>
	 */
	public static function build_order_payment_keyboard_rows( \WC_Order $order, int $uid ): array {
		$checkout = new CheckoutService();
		$cart     = new UserCartContext();
		$oid      = $order->get_id();
		$rows     = array();
		$prov     = Plugin::get_provider_token();
		if ( $prov !== '' ) {
			$rows[] = array(
				array(
					'text'          => '💳 ' . __( 'پرداخت در بله', 'webino-dashboard' ),
					'callback_data' => 'pb:' . $oid,
				),
			);
		}

		$gateways = $cart->run_as_user(
			$uid,
			static function () use ( $checkout, $order ) {
				return $checkout->get_available_gateway_buttons( $order );
			}
		);
		if ( is_array( $gateways ) ) {
			foreach ( $gateways as $gw ) {
				$gid = isset( $gw['id'] ) ? sanitize_key( (string) $gw['id'] ) : '';
				if ( $gid !== '' ) {
					$rows[] = array(
						array(
							'text'          => '💳 ' . (string) $gw['title'],
							'callback_data' => 'pg:' . $oid . ':' . $gid,
						),
					);
				} else {
					$rows[] = array(
						array(
							'text' => '💳 ' . (string) $gw['title'],
							'url'  => (string) $gw['url'],
						),
					);
				}
			}
		}

		if ( empty( $rows ) ) {
			$pay_url = $checkout->get_order_pay_url( $order );
			$rows[]  = array(
				array(
					'text' => '🌐 ' . __( 'پرداخت در سایت', 'webino-dashboard' ),
					'url'  => $pay_url,
				),
			);
		}

		return $rows;
	}

	/**
	 * Create order from cart and send payment options (after address + optional shipping).
	 */
	public static function finalize_order_creation( string $chat, int $uid ): void {
		$client = new Client();

		$cart     = new UserCartContext();
		$contents = $cart->get_cart_contents( $uid );
		if ( empty( $contents ) ) {
			$client->send_message(
				array(
					'chat_id' => $chat,
					'text'    => __( 'سبد خالی است.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$checkout = new CheckoutService();
		$order    = $cart->run_as_user(
			$uid,
			function () use ( $checkout, $uid ) {
				return $checkout->create_order_from_cart( $uid );
			}
		);

		if ( ! $order ) {
			$client->send_message(
				array(
					'chat_id' => $chat,
					'text'    => __( 'ایجاد سفارش ناموفق بود.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$subtotal        = (float) $order->get_subtotal();
		$discount_total  = (float) $order->get_discount_total();
		$shipping        = (float) $order->get_shipping_total();
		$shipping_tax    = (float) $order->get_shipping_tax();
		$shipping_all    = $shipping + $shipping_tax;

		$text_lines   = array();
		$text_lines[] = sprintf( __( 'سفارش #%s ثبت شد.', 'webino-dashboard' ), $order->get_order_number() );

		$purchase_label = CheckoutService::get_wfcp_purchase_type_label( $order );
		if ( $purchase_label !== '' ) {
			$text_lines[] = sprintf( __( 'نوع خرید: %s', 'webino-dashboard' ), $purchase_label );
		}

		$text_lines[] = sprintf( __( 'جمع محصولات (قبل از تخفیف): %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $subtotal, $order ) );
		if ( $discount_total > 0.00001 ) {
			$text_lines[] = sprintf( __( 'تخفیف: %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $discount_total, $order ) );
		}
		if ( $shipping_all > 0.00001 ) {
			$text_lines[] = sprintf( __( 'هزینه ارسال: %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $shipping_all, $order ) );
		}
		$text_lines[] = sprintf( __( 'جمع نهایی: %s', 'webino-dashboard' ), MoneyFormatter::plain_formatted_order_total( $order ) );
		$text_lines[] = '';
		$text_lines[] = __( 'روش پرداخت را انتخاب کنید:', 'webino-dashboard' );

		$rows = self::build_order_payment_keyboard_rows( $order, $uid );

		$client->send_message(
			array(
				'chat_id'      => $chat,
				'text'         => implode( "\n", $text_lines ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	private static function send_bale_invoice( string $chat, int $order_id, int $uid ): void {
		$order  = wc_get_order( $order_id );
		$client = new Client();
		if ( ! $order || (int) $order->get_user_id() !== $uid || ! $order->needs_payment() ) {
			$client->send_message(
				array(
					'chat_id' => $chat,
					'text'    => __( 'سفارش نامعتبر است.', 'webino-dashboard' ),
				)
			);
			return;
		}
		$prov = Plugin::get_provider_token();
		if ( $prov === '' ) {
			$client->send_message(
				array(
					'chat_id' => $chat,
					'text'    => __( 'توکن درگاه پرداخت در تنظیمات ثبت نشده است.', 'webino-dashboard' ),
				)
			);
			return;
		}
		$checkout = new CheckoutService();
		$params   = $checkout->build_send_invoice_params( (int) $chat, $order );
		$res      = $client->send_invoice( $params );
		if ( ! $res || ( isset( $res['ok'] ) && ! $res['ok'] ) ) {
			self::log_info( 'callback_send_invoice_failed', array( 'order_id' => $order_id ) );
			$client->send_message(
				array(
					'chat_id' => $chat,
					'text'    => __( 'ارسال فاکتور بله ناموفق بود. گزینه پرداخت در سایت را امتحان کنید.', 'webino-dashboard' ),
				)
			);
			return;
		}
		$order->update_meta_data( OrderInvoiceMeta::TARGET_CHAT_ID, (string) $chat );
		$order->save();
	}

	private static function send_web_pay( string $chat, int $order_id, int $uid ): void {
		$order  = wc_get_order( $order_id );
		$client = new Client();
		if ( ! $order || (int) $order->get_user_id() !== $uid || ! $order->needs_payment() ) {
			$client->send_message(
				array(
					'chat_id' => $chat,
					'text'    => __( 'سفارش نامعتبر است.', 'webino-dashboard' ),
				)
			);
			return;
		}
		$checkout = new CheckoutService();
		$url      = $checkout->get_order_pay_url( $order );
		$kbd      = array(
			'inline_keyboard' => array(
				array(
					array(
						'text' => __( '🔗 باز کردن صفحه پرداخت', 'webino-dashboard' ),
						'url'  => $url,
					),
				),
			),
		);
		$client->send_message(
			array(
				'chat_id'      => $chat,
				'text'         => __( 'برای پرداخت از دکمه زیر استفاده کنید:', 'webino-dashboard' ),
				'reply_markup' => wp_json_encode( $kbd ),
			)
		);
	}

	private static function handle_order_question_callback( Client $client, string $user_chat, int $uid, int $order_id ): void {
		$order = wc_get_order( $order_id );
		if ( ! $order || (int) $order->get_user_id() !== $uid ) {
			$client->send_message(
				array(
					'chat_id' => $user_chat,
					'text'    => __( 'این سفارش متعلق به شما نیست.', 'webino-dashboard' ),
				)
			);
			return;
		}
		$s          = Plugin::get_settings();
		$admin_chat = isset( $s['support_notify_chat_id'] ) ? trim( (string) $s['support_notify_chat_id'] ) : '';
		if ( $admin_chat === '' ) {
			$client->send_message(
				array(
					'chat_id' => $user_chat,
					'text'    => __( 'درخواست پشتیبانی هنوز در تنظیمات (chat_id ادمین) ثبت نشده است.', 'webino-dashboard' ),
				)
			);
			return;
		}
		$u     = get_userdata( $uid );
		$lines = array(
			'📋 ' . __( 'سوال دربارهٔ سفارش', 'webino-dashboard' ),
			__( 'شماره سفارش:', 'webino-dashboard' ) . ' ' . $order->get_order_number(),
			__( 'شناسه:', 'webino-dashboard' ) . ' ' . (string) $order->get_id(),
			__( 'مشتری:', 'webino-dashboard' ) . ' ' . ( $u ? $u->display_name : (string) $uid ),
			__( 'چت بله:', 'webino-dashboard' ) . ' ' . $user_chat,
			__( 'جمع:', 'webino-dashboard' ) . ' ' . wp_strip_all_tags( wc_price( $order->get_total() ) ),
		);
		$client->send_message(
			array(
				'chat_id' => $admin_chat,
				'text'    => implode( "\n", $lines ),
			)
		);
		$client->send_message(
			array(
				'chat_id' => $user_chat,
				'text'    => __( 'درخواست شما برای پشتیبانی ارسال شد.', 'webino-dashboard' ),
			)
		);
	}

	private static function handle_stock_notify_callback( Client $client, string $user_chat, int $uid, int $product_id ): void {
		unset( $uid );
		if ( $product_id < 1 ) {
			return;
		}
		$product = wc_get_product( $product_id );
		if ( ! $product || ! $product->is_visible() ) {
			$client->send_message(
				array(
					'chat_id' => $user_chat,
					'text'    => __( 'محصول یافت نشد.', 'webino-dashboard' ),
				)
			);
			return;
		}
		if ( $product->is_in_stock() ) {
			$client->send_message(
				array(
					'chat_id' => $user_chat,
					'text'    => __( 'این محصول الان موجود است.', 'webino-dashboard' ),
				)
			);
			return;
		}
		StockWatchRegistry::add( $product_id, $user_chat );
		$client->send_message(
			array(
				'chat_id' => $user_chat,
				'text'    => __( 'باشد؛ وقتی موجود شد در همین چت به شما اطلاع می‌دهیم.', 'webino-dashboard' ),
			)
		);
	}
}
