<?php

namespace Webino_Dashboard_Bots_Bale\Bot;

use Webino_Dashboard_Bots_Bale\Bale\Client;
use Webino_Dashboard_Bots_Bale\Core\Plugin;
use Webino_Dashboard_Bots_Bale\Database\SessionRepository;
use Webino_Dashboard_Bots_Bale\Messaging\TemplateRenderer;
use Webino_Dashboard_Bots_Bale\Util\ContactVerifier;
use Webino_Dashboard_Bots_Bale\Util\MoneyFormatter;
use Webino_Dashboard_Bots_Bale\Util\PersianDate;
use Webino_Dashboard_Bots_Bale\Util\PhoneNormalizer;
use Webino_Dashboard_Bots_Bale\Woo\AddressBook;
use Webino_Dashboard_Bots_Bale\Woo\UserCartContext;

/**
 * My orders, saved addresses and address form wizard for the linked WooCommerce customer.
 */
class AccountFlow {
	public const STATE_ADDRESS_FORM   = 'address_form';
	public const STATE_RETURN_REQUEST = 'return_request';

	// ─── Orders ───────────────────────────────────────────────────────

	public static function send_my_orders( string $chat_id, int $user_id ): void {
		$client = new Client();
		if ( ! function_exists( 'wc_get_orders' ) ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'ووکامرس در دسترس نیست.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$orders = wc_get_orders(
			array(
				'customer_id' => $user_id,
				'limit'       => 10,
				'orderby'     => 'date',
				'order'       => 'DESC',
				'return'      => 'objects',
			)
		);

		if ( empty( $orders ) ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'هنوز سفارشی ثبت نکرده‌اید.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$text = __( '📦 سفارش‌های من', 'webino-dashboard' ) . "\n\n" . __( '👇 برای دیدن جزئیات، روی سفارش بزنید.', 'webino-dashboard' );
		$rows = array();
		foreach ( $orders as $order ) {
			if ( ! $order instanceof \WC_Order ) {
				continue;
			}
			$status = wc_get_order_status_name( $order->get_status() );
			$total  = MoneyFormatter::plain_price_amount( (float) $order->get_total(), $order );
			$label  = sprintf(
				__( '#%1$s | %2$s | %3$s', 'webino-dashboard' ),
				$order->get_order_number(),
				$status,
				$total
			);
			$rows[] = array(
				array(
					'text'          => $label,
					'callback_data' => 'od:' . $order->get_id(),
				),
			);
			$rows[] = array(
				array(
					'text'          => '🔁 ' . __( 'سفارش مجدد', 'webino-dashboard' ) . ' #' . $order->get_order_number(),
					'callback_data' => 'ro:' . $order->get_id(),
				),
			);
		}
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => $text,
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	public static function send_order_detail( string $chat_id, int $user_id, int $order_id ): void {
		$client = new Client();
		$order  = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : null;
		if ( ! $order || ! $order instanceof \WC_Order || (int) $order->get_user_id() !== $user_id ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'سفارش پیدا نشد.', 'webino-dashboard' ) ) );
			return;
		}

		$sep = '──────────';

		$lines   = array();
		$lines[] = sprintf( __( '📦 سفارش #%s', 'webino-dashboard' ), $order->get_order_number() );
		$lines[] = sprintf( __( '📋 وضعیت: %s', 'webino-dashboard' ), wc_get_order_status_name( $order->get_status() ) );
		$lines[] = '';

		$product_blocks = array();
		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof \WC_Order_Item_Product ) {
				continue;
			}
			$qty        = max( 1, (int) $item->get_quantity() );
			$line_total = (float) $item->get_total();
			$unit       = $line_total / $qty;
			$qty_label  = MoneyFormatter::to_persian_digits( (string) $qty ) . ' ' . __( 'عدد', 'webino-dashboard' );
			$block      = array(
				'▫️ ' . $item->get_name(),
				'   🔢 ' . $qty_label,
				'   💵 ' . sprintf( __( 'مبلغ هر عدد: %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $unit, $order ) ),
				'   📊 ' . sprintf( __( 'مبلغ کل: %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $line_total, $order ) ),
			);
			$product_blocks[] = implode( "\n", $block );
		}
		if ( ! empty( $product_blocks ) ) {
			$lines[] = '🛍️ ' . __( 'اقلام سفارش', 'webino-dashboard' );
			$lines[] = '';
			$lines[] = implode( "\n\n" . $sep . "\n\n", $product_blocks );
		}

		$lines[] = '';
		$lines[] = '🚚 ' . __( 'ارسال و جمع', 'webino-dashboard' );
		$lines[] = '';
		$shipping_methods = array();
		foreach ( $order->get_items( 'shipping' ) as $ship_item ) {
			if ( $ship_item instanceof \WC_Order_Item_Shipping ) {
				$t = $ship_item->get_method_title();
				if ( $t !== '' ) {
					$shipping_methods[] = $t;
				}
			}
		}
		if ( empty( $shipping_methods ) ) {
			$m = $order->get_shipping_method();
			if ( is_string( $m ) && $m !== '' ) {
				$shipping_methods[] = $m;
			}
		}
		$ship_label = ! empty( $shipping_methods ) ? implode( '، ', $shipping_methods ) : __( 'ندارد', 'webino-dashboard' );
		$lines[]    = sprintf( __( '📦 روش ارسال: %s', 'webino-dashboard' ), $ship_label );
		$lines[]    = sprintf(
			__( '💰 هزینه ارسال: %s', 'webino-dashboard' ),
			MoneyFormatter::plain_price_amount( (float) $order->get_shipping_total(), $order )
		);
		$lines[]    = sprintf(
			__( '✅ جمع سفارش: %s', 'webino-dashboard' ),
			MoneyFormatter::plain_formatted_order_total( $order )
		);

		$created = $order->get_date_created();
		if ( $created ) {
			$parts = PersianDate::order_created_parts( $created );
			if ( $parts['date'] !== '' ) {
				$lines[] = '';
				$lines[] = sprintf( __( '📅 تاریخ ثبت سفارش: %s', 'webino-dashboard' ), $parts['date'] );
			}
			if ( $parts['time'] !== '' ) {
				$lines[] = sprintf( __( '🕐 ساعت: %s', 'webino-dashboard' ), $parts['time'] );
			}
		}

		if ( $order->needs_payment() ) {
			$lines[] = '';
			$lines[] = __( '💳 روش پرداخت را انتخاب کنید:', 'webino-dashboard' );
		}

		$keyboard_rows = array();
		if ( $order->needs_payment() ) {
			$keyboard_rows = array_merge( $keyboard_rows, CallbackHandler::build_order_payment_keyboard_rows( $order, $user_id ) );
		}

		$action_row = array();
		$st         = $order->get_status();
		if ( in_array( $st, array( 'pending', 'on-hold' ), true ) ) {
			$action_row[] = array(
				'text'          => '❌ ' . __( 'لغو سفارش', 'webino-dashboard' ),
				'callback_data' => 'oc:' . $order_id,
			);
		}
		if ( method_exists( $order, 'is_paid' ) && $order->is_paid() ) {
			$action_row[] = array(
				'text'          => '📍 ' . __( 'پیگیری سفارش', 'webino-dashboard' ),
				'callback_data' => 'ot:' . $order_id,
			);
		}
		if ( self::order_has_returnable_lines( $order ) ) {
			$action_row[] = array(
				'text'          => '📤 ' . __( 'درخواست مرجوعی', 'webino-dashboard' ),
				'callback_data' => 'orn:' . $order_id,
			);
		}
		$action_row[] = array(
			'text'          => '🔁 ' . __( 'سفارش مجدد', 'webino-dashboard' ),
			'callback_data' => 'ro:' . $order_id,
		);
		if ( ! empty( $action_row ) ) {
			$keyboard_rows[] = $action_row;
		}

		$msg = array(
			'chat_id' => $chat_id,
			'text'    => implode( "\n", $lines ),
		);
		if ( ! empty( $keyboard_rows ) ) {
			$msg['reply_markup'] = wp_json_encode( array( 'inline_keyboard' => $keyboard_rows ) );
		}
		$client->send_message( $msg );
	}

	public static function cancel_order( string $chat_id, int $user_id, int $order_id ): void {
		$client = new Client();
		$order  = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : null;
		if ( ! $order || ! $order instanceof \WC_Order || (int) $order->get_user_id() !== $user_id ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'سفارش پیدا نشد.', 'webino-dashboard' ) ) );
			return;
		}
		$st = $order->get_status();
		if ( ! in_array( $st, array( 'pending', 'on-hold' ), true ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'این سفارش قابل لغو نیست.', 'webino-dashboard' ) ) );
			return;
		}
		$order->update_status( 'cancelled', __( 'لغو شده توسط مشتری از طریق ربات بله.', 'webino-dashboard' ) );
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => sprintf( __( 'سفارش #%s لغو شد.', 'webino-dashboard' ), $order->get_order_number() ),
			)
		);
	}

	public static function track_order( string $chat_id, int $user_id, int $order_id ): void {
		$client = new Client();
		$order  = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : null;
		if ( ! $order || ! $order instanceof \WC_Order || (int) $order->get_user_id() !== $user_id ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'سفارش پیدا نشد.', 'webino-dashboard' ) ) );
			return;
		}
		if ( method_exists( $order, 'is_paid' ) && ! $order->is_paid() ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'این سفارش هنوز پرداخت نشده است.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$text = OrderStatusNarrative::build_tracking_message( $order );

		$tracking_slugs = TemplateRenderer::get_post_tracking_status_slugs( $order );
		$url            = '';
		if ( in_array( $order->get_status(), $tracking_slugs, true ) ) {
			$code = TemplateRenderer::get_tracking_code( $order );
			$url  = TemplateRenderer::get_tracking_url( $order );
			$text .= "\n\n";
			if ( $code === '' ) {
				$text .= __( '📮 کد رهگیری پست هنوز توسط فروشگاه ثبت نشده است.', 'webino-dashboard' );
			} else {
				$text .= sprintf( __( '📮 کد رهگیری پست: %s', 'webino-dashboard' ), $code );
				if ( $url !== '' ) {
					$text .= "\n" . sprintf( __( '🔗 %s', 'webino-dashboard' ), $url );
				}
			}
		}

		$msg = array(
			'chat_id' => $chat_id,
			'text'    => $text,
		);
		if ( $url !== '' && filter_var( $url, FILTER_VALIDATE_URL ) ) {
			$msg['reply_markup'] = wp_json_encode(
				array(
					'inline_keyboard' => array(
						array(
							array(
								'text' => __( 'مشاهده رهگیری پست', 'webino-dashboard' ),
								'url'  => $url,
							),
						),
					),
				)
			);
		}
		$client->send_message( $msg );
	}

	// ─── Returns ──────────────────────────────────────────────────────

	/**
	 * @param \WC_Order $order Order.
	 * @return bool
	 */
	private static function order_has_returnable_lines( $order ): bool {
		if ( ! $order instanceof \WC_Order || ! class_exists( 'Webino_Dashboard_Order_Returns', false ) ) {
			return false;
		}
		if ( ! Webino_Dashboard_Order_Returns::order_eligible( $order ) ) {
			return false;
		}
		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof \WC_Order_Item_Product ) {
				continue;
			}
			if ( Webino_Dashboard_Order_Returns::returnable_qty( $order, (int) $item->get_id() ) > 0 ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param \WC_Order|null $order Order.
	 * @return bool
	 */
	private static function verify_order_owner( $order, int $user_id ): bool {
		return $order instanceof \WC_Order && (int) $order->get_user_id() === $user_id;
	}

	public static function start_return_flow( string $chat_id, int $user_id, int $order_id ): void {
		$client = new Client();
		$order  = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : null;
		if ( ! self::verify_order_owner( $order, $user_id ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'سفارش پیدا نشد.', 'webino-dashboard' ) ) );
			return;
		}
		if ( ! self::order_has_returnable_lines( $order ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'این سفارش واجد شرایط مرجوعی نیست.', 'webino-dashboard' ) ) );
			return;
		}

		$rows = array();
		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof \WC_Order_Item_Product ) {
				continue;
			}
			$item_id = (int) $item->get_id();
			$max     = Webino_Dashboard_Order_Returns::returnable_qty( $order, $item_id );
			if ( $max < 1 ) {
				continue;
			}
			$rows[] = array(
				array(
					'text'          => $item->get_name() . ' (' . MoneyFormatter::to_persian_digits( (string) (int) $max ) . ')',
					'callback_data' => 'ori:' . $order_id . ':' . $item_id,
				),
			);
		}
		if ( empty( $rows ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'کالای قابل مرجوعی برای این سفارش نیست.', 'webino-dashboard' ) ) );
			return;
		}
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => __( 'کالای مورد نظر برای مرجوعی را انتخاب کنید:', 'webino-dashboard' ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	public static function send_return_qty_picker( string $chat_id, int $user_id, int $order_id, int $item_id ): void {
		$client = new Client();
		$order  = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : null;
		if ( ! self::verify_order_owner( $order, $user_id ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'سفارش پیدا نشد.', 'webino-dashboard' ) ) );
			return;
		}
		$max = Webino_Dashboard_Order_Returns::returnable_qty( $order, $item_id );
		if ( $max < 1 ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'این کالا دیگر قابل مرجوعی نیست.', 'webino-dashboard' ) ) );
			return;
		}
		$limit = min( (int) $max, 5 );
		$row   = array();
		for ( $q = 1; $q <= $limit; $q++ ) {
			$row[] = array(
				'text'          => MoneyFormatter::to_persian_digits( (string) $q ),
				'callback_data' => 'orq:' . $order_id . ':' . $item_id . ':' . $q,
			);
		}
		$rows = array( $row );
		if ( $max > 5 ) {
			$rows[] = array(
				array(
					'text'          => MoneyFormatter::to_persian_digits( (string) (int) $max ) . ' ' . __( '(حداکثر)', 'webino-dashboard' ),
					'callback_data' => 'orq:' . $order_id . ':' . $item_id . ':' . (int) $max,
				),
			);
		}
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => __( 'تعداد مرجوعی را انتخاب کنید:', 'webino-dashboard' ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	public static function prompt_return_reason( string $chat_id, int $user_id, int $order_id, int $item_id, float $qty ): void {
		$client = new Client();
		$order  = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : null;
		if ( ! self::verify_order_owner( $order, $user_id ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'سفارش پیدا نشد.', 'webino-dashboard' ) ) );
			return;
		}
		$max = Webino_Dashboard_Order_Returns::returnable_qty( $order, $item_id );
		if ( $qty < 1 || $qty > $max ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'تعداد نامعتبر است.', 'webino-dashboard' ) ) );
			return;
		}
		$repo = new SessionRepository();
		$repo->set_state( $chat_id, self::STATE_RETURN_REQUEST );
		$repo->merge_temp_data(
			$chat_id,
			array(
				'return_order_id' => $order_id,
				'return_item_id'  => $item_id,
				'return_qty'      => $qty,
			)
		);
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => __( 'دلیل مرجوعی را بنویسید (یا «لغو» برای انصراف):', 'webino-dashboard' ),
			)
		);
	}

	public static function cancel_return_flow( string $chat_id ): void {
		$repo = new SessionRepository();
		$repo->set_state( $chat_id, null );
		$repo->merge_temp_data(
			$chat_id,
			array(
				'return_order_id' => null,
				'return_item_id'  => null,
				'return_qty'      => null,
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function handle_return_form_text( string $chat_id, int $user_id, string $text ): bool {
		$repo = new SessionRepository();
		$row  = $repo->get_by_chat_id( $chat_id );
		if ( ! $row || (string) ( $row['current_state'] ?? '' ) !== self::STATE_RETURN_REQUEST ) {
			return false;
		}
		$client = new Client();
		$val    = sanitize_textarea_field( trim( $text ) );
		if ( $val === '/cancel' || $val === 'لغو' ) {
			self::cancel_return_flow( $chat_id );
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'درخواست مرجوعی لغو شد.', 'webino-dashboard' ) ) );
			return true;
		}
		if ( $val === '' ) {
			return true;
		}
		$data     = $repo->get_temp_data( $chat_id );
		$order_id = (int) ( $data['return_order_id'] ?? 0 );
		$item_id  = (int) ( $data['return_item_id'] ?? 0 );
		$qty      = (float) ( $data['return_qty'] ?? 1 );
		self::cancel_return_flow( $chat_id );

		if ( ! class_exists( 'Webino_Dashboard_Order_Returns', false ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'سرویس مرجوعی در دسترس نیست.', 'webino-dashboard' ) ) );
			return true;
		}
		$result = Webino_Dashboard_Order_Returns::create(
			$order_id,
			array(
				'order_item_id' => $item_id,
				'qty'           => $qty,
				'reason'        => $val,
				'source'        => 'bale',
			)
		);
		if ( is_wp_error( $result ) ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => $result->get_error_message(),
				)
			);
			return true;
		}
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => __( 'درخواست مرجوعی شما ثبت شد. پس از بررسی، نتیجه اطلاع‌رسانی می‌شود.', 'webino-dashboard' ),
			)
		);
		return true;
	}

	/**
	 * @return bool
	 */
	public static function handle_return_callback( string $chat_id, int $user_id, string $data ): bool {
		if ( strpos( $data, 'orn:' ) === 0 ) {
			self::start_return_flow( $chat_id, $user_id, (int) substr( $data, 4 ) );
			return true;
		}
		if ( strpos( $data, 'ori:' ) === 0 ) {
			$parts    = explode( ':', $data );
			$order_id = isset( $parts[1] ) ? (int) $parts[1] : 0;
			$item_id  = isset( $parts[2] ) ? (int) $parts[2] : 0;
			self::send_return_qty_picker( $chat_id, $user_id, $order_id, $item_id );
			return true;
		}
		if ( strpos( $data, 'orq:' ) === 0 ) {
			$parts    = explode( ':', $data );
			$order_id = isset( $parts[1] ) ? (int) $parts[1] : 0;
			$item_id  = isset( $parts[2] ) ? (int) $parts[2] : 0;
			$qty      = isset( $parts[3] ) ? (float) $parts[3] : 1.0;
			self::prompt_return_reason( $chat_id, $user_id, $order_id, $item_id, $qty );
			return true;
		}
		return false;
	}

	// ─── Addresses ────────────────────────────────────────────────────

	public static function send_my_addresses( string $chat_id, int $user_id ): void {
		$client    = new Client();
		$all       = AddressBook::all( $user_id );
		$default   = AddressBook::default_id( $user_id );
		$lines     = array( __( '📍 آدرس‌های من', 'webino-dashboard' ), '' );
		$keyboard  = array();
		if ( empty( $all ) ) {
			$lines[] = __( 'هنوز آدرسی ثبت نشده است.', 'webino-dashboard' );
		} else {
			foreach ( $all as $i => $addr ) {
				$is_default = $default !== '' && $default === (string) $addr['id'];
				$badge      = $is_default ? '⭐ ' : '';
				$lines[]    = $badge . ( $i + 1 ) . ') ' . (string) $addr['label'];
				$lines[]    = '   ' . __( 'نام:', 'webino-dashboard' ) . ' ' . (string) $addr['first_name'] . ' ' . (string) $addr['last_name'];
				$state_label = AddressBook::format_state_for_display( $addr );
				$city_label  = AddressBook::format_city_for_display( $addr );
				$lines[]    = '   ' . __( 'آدرس:', 'webino-dashboard' ) . ' ' . $state_label . ' - ' . $city_label . ' - ' . (string) $addr['address_1'];
				if ( (string) $addr['postcode'] !== '' ) {
					$lines[] = '   ' . __( 'کدپستی:', 'webino-dashboard' ) . ' ' . (string) $addr['postcode'];
				}
				if ( (string) $addr['phone'] !== '' ) {
					$lines[] = '   ' . __( 'موبایل:', 'webino-dashboard' ) . ' ' . (string) $addr['phone'];
				}
				$lines[]    = '';
				$keyboard[] = array(
					array(
						'text'          => '✏️ ' . __( 'ویرایش', 'webino-dashboard' ),
						'callback_data' => 'ae:' . (string) $addr['id'],
					),
					array(
						'text'          => '🗑 ' . __( 'حذف', 'webino-dashboard' ),
						'callback_data' => 'ad:' . (string) $addr['id'],
					),
					array(
						'text'          => '⭐ ' . __( 'پیش‌فرض', 'webino-dashboard' ),
						'callback_data' => 'as:' . (string) $addr['id'],
					),
				);
			}
		}
		$keyboard[] = array(
			array(
				'text'          => '➕ ' . __( 'افزودن آدرس جدید', 'webino-dashboard' ),
				'callback_data' => 'an:account',
			),
		);
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => implode( "\n", $lines ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $keyboard ) ),
			)
		);
	}

	// ─── Callbacks ────────────────────────────────────────────────────

	/**
	 * @return bool
	 */
	public static function handle_address_callback( string $chat_id, int $user_id, string $data ): bool {
		if ( strpos( $data, 'an:' ) === 0 ) {
			$context = substr( $data, 3 ) === 'checkout' ? 'checkout' : 'account';
			self::start_address_form( $chat_id, $user_id, 'create', $context, '' );
			return true;
		}
		if ( strpos( $data, 'ae:' ) === 0 ) {
			$id = (string) substr( $data, 3 );
			self::start_address_form( $chat_id, $user_id, 'edit', 'account', $id );
			return true;
		}
		if ( strpos( $data, 'ad:' ) === 0 ) {
			$id = (string) substr( $data, 3 );
			$ok = AddressBook::delete( $user_id, $id );
			if ( $ok ) {
				$next = AddressBook::default_or_first( $user_id );
				if ( $next ) {
					( new UserCartContext() )->apply_address_book_entry( $user_id, $next );
				}
			}
			$client = new Client();
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => $ok ? __( 'آدرس حذف شد.', 'webino-dashboard' ) : __( 'آدرس پیدا نشد.', 'webino-dashboard' ),
				)
			);
			self::send_my_addresses( $chat_id, $user_id );
			return true;
		}
		if ( strpos( $data, 'as:' ) === 0 ) {
			$id = (string) substr( $data, 3 );
			$addr = AddressBook::find( $user_id, $id );
			if ( $addr ) {
				AddressBook::set_default( $user_id, $id );
				( new UserCartContext() )->apply_address_book_entry( $user_id, $addr );
			}
			self::send_my_addresses( $chat_id, $user_id );
			return true;
		}
		if ( strpos( $data, 'ac:' ) === 0 ) {
			$id = (string) substr( $data, 3 );
			CheckoutFlow::handle_address_chosen( $chat_id, $user_id, $id );
			return true;
		}
		return false;
	}

	/**
	 * @return bool
	 */
	public static function handle_order_callback( string $chat_id, int $user_id, string $data ): bool {
		if ( strpos( $data, 'od:' ) === 0 ) {
			self::send_order_detail( $chat_id, $user_id, (int) substr( $data, 3 ) );
			return true;
		}
		if ( strpos( $data, 'oc:' ) === 0 ) {
			self::cancel_order( $chat_id, $user_id, (int) substr( $data, 3 ) );
			return true;
		}
		if ( strpos( $data, 'ot:' ) === 0 ) {
			self::track_order( $chat_id, $user_id, (int) substr( $data, 3 ) );
			return true;
		}
		if ( self::handle_return_callback( $chat_id, $user_id, $data ) ) {
			return true;
		}
		return false;
	}

	/**
	 * @return bool
	 */
	public static function handle_address_state_city_callback( string $chat_id, string $data, int $message_id = 0, string $message_chat = '' ): bool {
		$edit_chat = $message_chat !== '' ? $message_chat : $chat_id;
		if ( strpos( $data, 'ast:' ) === 0 ) {
			self::handle_form_state_select( $chat_id, (string) substr( $data, 4 ), $message_id, $edit_chat );
			return true;
		}
		if ( strpos( $data, 'act:' ) === 0 ) {
			self::handle_form_city_select( $chat_id, (int) substr( $data, 4 ), $message_id, $edit_chat );
			return true;
		}
		return false;
	}

	// ─── Address form wizard ──────────────────────────────────────────

	public static function start_address_form( string $chat_id, int $user_id, string $mode, string $context, string $address_id ): void {
		$repo = new SessionRepository();
		$seed = array(
			'label'      => '',
			'first_name' => '',
			'last_name'  => '',
			'country'    => '',
			'state'      => '',
			'state_term' => '',
			'city'       => '',
			'city_term'  => '',
			'address_1'  => '',
			'address_2'  => '',
			'postcode'   => '',
			'phone'      => '',
		);
		if ( $mode === 'edit' && $address_id !== '' ) {
			$found = AddressBook::find( $user_id, $address_id );
			if ( $found ) {
				$seed = array_merge( $seed, $found );
			}
		}
		$repo->set_state( $chat_id, self::STATE_ADDRESS_FORM );
		$repo->merge_temp_data(
			$chat_id,
			array(
				'addr_context' => $context,
				'addr_mode'    => $mode,
				'addr_id'      => $address_id,
				'addr_step'    => 'label',
				'addr_form'    => $seed,
			)
		);
		$client  = new Client();
		$is_edit = $mode === 'edit';
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => self::address_form_prompt( 'label', $seed, $is_edit ),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function handle_address_form_text( string $chat_id, int $user_id, string $text ): bool {
		$repo = new SessionRepository();
		$row  = $repo->get_by_chat_id( $chat_id );
		if ( ! $row || (string) ( $row['current_state'] ?? '' ) !== self::STATE_ADDRESS_FORM ) {
			return false;
		}
		$data    = $repo->get_temp_data( $chat_id );
		$step    = (string) ( $data['addr_step'] ?? '' );
		$form    = isset( $data['addr_form'] ) && is_array( $data['addr_form'] ) ? $data['addr_form'] : array();
		$context = (string) ( $data['addr_context'] ?? 'account' );
		$mode    = (string) ( $data['addr_mode'] ?? 'create' );
		$edit_id = (string) ( $data['addr_id'] ?? '' );
		$is_edit = $mode === 'edit';
		$val     = sanitize_text_field( trim( $text ) );

		if ( $val === '/cancel' || $val === 'لغو' ) {
			self::finish_address_form( $chat_id, $user_id, $context, false, '' );
			return true;
		}
		if ( $step === '' || $val === '' ) {
			return true;
		}

		$next_prompt = '';
		$send_picker = false;
		switch ( $step ) {
			case 'label':
				if ( ! ( $is_edit && $val === '-' ) ) {
					$form['label'] = $val;
				}
				$step          = 'first_name';
				$next_prompt   = self::address_form_prompt( 'first_name', $form, $is_edit );
				break;
			case 'first_name':
				if ( ! ( $is_edit && $val === '-' ) ) {
					$form['first_name'] = $val;
				}
				$step               = 'last_name';
				$next_prompt        = self::address_form_prompt( 'last_name', $form, $is_edit );
				break;
			case 'last_name':
				if ( ! ( $is_edit && $val === '-' ) ) {
					$form['last_name'] = $val;
				}
				$step        = 'state';
				$send_picker = true;
				break;
			case 'state':
				if ( ! ( $is_edit && $val === '-' ) ) {
					$form['state'] = $val;
				}
				$step        = 'city';
				$send_picker = true;
				break;
			case 'city':
				if ( ! ( $is_edit && $val === '-' ) ) {
					$form['city'] = $val;
				}
				$step          = 'address_1';
				$next_prompt   = self::address_form_prompt( 'address_1', $form, $is_edit );
				break;
			case 'address_1':
				if ( ! ( $is_edit && $val === '-' ) ) {
					$form['address_1'] = $val;
				}
				$step              = 'postcode';
				$next_prompt       = self::address_form_prompt( 'postcode', $form, $is_edit );
				break;
			case 'postcode':
				if ( ! ( $is_edit && $val === '-' ) ) {
					$normalized_post = preg_replace( '/\D+/', '', PhoneNormalizer::normalize_digits( $val ) );
					if ( ! is_string( $normalized_post ) || strlen( $normalized_post ) !== 10 ) {
						$client = new Client();
						$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'کدپستی باید دقیقاً ۱۰ رقم باشد. لطفاً دوباره وارد کنید:', 'webino-dashboard' ) ) );
						return true;
					}
					$form['postcode'] = $normalized_post;
				}
				$step = 'phone';
				$repo->merge_temp_data( $chat_id, array( 'addr_step' => $step, 'addr_form' => $form ) );
				self::send_phone_prompt( $chat_id, $form, $is_edit );
				return true;
			case 'phone':
				if ( ! ( $is_edit && $val === '-' ) ) {
					$normalized_phone = PhoneNormalizer::normalize( PhoneNormalizer::normalize_digits( $val ) );
					if ( $normalized_phone === '' || ! preg_match( '/^09\d{9}$/', $normalized_phone ) ) {
						$client = new Client();
						$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'شماره موبایل معتبر نیست. لطفاً دوباره وارد کنید:', 'webino-dashboard' ) ) );
						return true;
					}
					$form['phone'] = $normalized_phone;
				}
				return self::try_save_address( $chat_id, $user_id, $form, $context, $mode, $edit_id, $repo );
			default:
				return true;
		}

		$repo->merge_temp_data( $chat_id, array( 'addr_step' => $step, 'addr_form' => $form ) );

		if ( $send_picker && $step === 'state' ) {
			self::send_address_state_picker( $chat_id );
			return true;
		}
		if ( $send_picker && $step === 'city' ) {
			self::send_address_city_picker( $chat_id, $form );
			return true;
		}

		$client = new Client();
		$client->send_message( array( 'chat_id' => $chat_id, 'text' => $next_prompt ) );
		return true;
	}

	private static function try_save_address( string $chat_id, int $user_id, array $form, string $context, string $mode, string $edit_id, SessionRepository $repo ): bool {
		$payload = AddressBook::validate_and_build( $form, $mode === 'edit' ? $edit_id : '' );
		$client  = new Client();
		if ( is_wp_error( $payload ) ) {
			$code = $payload->get_error_code();
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => $payload->get_error_message() ) );
			$retry_step_map = array(
				'address_postcode' => 'postcode',
				'address_phone'    => 'phone',
				'address_required' => 'label',
			);
			$retry_step = isset( $retry_step_map[ $code ] ) ? $retry_step_map[ $code ] : 'label';
			$repo->merge_temp_data( $chat_id, array( 'addr_step' => $retry_step, 'addr_form' => $form ) );
			$is_edit = $mode === 'edit';
			if ( $retry_step === 'phone' ) {
				self::send_phone_prompt( $chat_id, $form, $is_edit );
			} else {
				$client->send_message( array( 'chat_id' => $chat_id, 'text' => self::address_form_prompt( $retry_step, $form, $is_edit ) ) );
			}
			return true;
		}
		AddressBook::upsert( $user_id, $payload );
		if ( AddressBook::default_id( $user_id ) === (string) $payload['id'] ) {
			( new UserCartContext() )->apply_address_book_entry( $user_id, $payload );
		}
		self::finish_address_form( $chat_id, $user_id, $context, true, (string) $payload['id'] );
		return true;
	}

	private static function send_phone_prompt( string $chat_id, array $form, bool $is_edit ): void {
		$client  = new Client();
		$prompt  = self::address_form_prompt( 'phone', $form, $is_edit );
		$prompt .= "\n" . __( 'می‌توانید شماره تماس خود را ارسال کنید یا شماره دیگری تایپ کنید.', 'webino-dashboard' );
		$kbd = array(
			'keyboard'          => array(
				array(
					array(
						'text'            => __( '📱 ارسال شماره تماس من', 'webino-dashboard' ),
						'request_contact' => true,
					),
				),
			),
			'resize_keyboard'   => true,
			'one_time_keyboard' => true,
		);
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => $prompt,
				'reply_markup' => wp_json_encode( $kbd ),
			)
		);
	}

	/**
	 * @param array<string, mixed> $contact
	 * @param array<string, mixed> $from
	 */
	public static function handle_address_form_contact( string $chat_id, int $user_id, array $contact, array $from ): bool {
		$repo = new SessionRepository();
		$row  = $repo->get_by_chat_id( $chat_id );
		if ( ! $row || (string) ( $row['current_state'] ?? '' ) !== self::STATE_ADDRESS_FORM ) {
			return false;
		}
		$data = $repo->get_temp_data( $chat_id );
		if ( (string) ( $data['addr_step'] ?? '' ) !== 'phone' ) {
			return false;
		}
		if ( ! ContactVerifier::is_own_contact( $contact, $from ) ) {
			$client = new Client();
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => (string) Plugin::get_settings()['error_text'] ) );
			return true;
		}
		$raw   = isset( $contact['phone_number'] ) ? (string) $contact['phone_number'] : '';
		$phone = PhoneNormalizer::normalize( PhoneNormalizer::normalize_digits( $raw ) );
		if ( $phone === '' || ! preg_match( '/^09\d{9}$/', $phone ) ) {
			$client = new Client();
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'شماره موبایل معتبر نیست. لطفاً دوباره وارد کنید:', 'webino-dashboard' ) ) );
			return true;
		}
		$form    = isset( $data['addr_form'] ) && is_array( $data['addr_form'] ) ? $data['addr_form'] : array();
		$context = (string) ( $data['addr_context'] ?? 'account' );
		$mode    = (string) ( $data['addr_mode'] ?? 'create' );
		$edit_id = (string) ( $data['addr_id'] ?? '' );
		$form['phone'] = $phone;
		return self::try_save_address( $chat_id, $user_id, $form, $context, $mode, $edit_id, $repo );
	}

	// ─── State / city pickers ─────────────────────────────────────────

	private static function send_address_state_picker( string $chat_id ): void {
		$client = new Client();
		$state_terms = self::get_state_terms();
		if ( ! empty( $state_terms ) ) {
			$rows   = array();
			$buffer = array();
			foreach ( $state_terms as $term ) {
				$buffer[] = array(
					'text'          => (string) $term->name,
					'callback_data' => 'ast:' . (int) $term->term_id,
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
				'callback_data' => 'ast:' . (string) $code,
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
	 * @param array<string, mixed> $form
	 */
	private static function send_address_city_picker( string $chat_id, array $form, int $message_id = 0, string $edit_chat = '' ): void {
		$client       = new Client();
		$state_term   = isset( $form['state_term'] ) ? (int) $form['state_term'] : 0;
		$cities       = array();
		$target_chat  = $edit_chat !== '' ? $edit_chat : $chat_id;
		if ( $state_term > 0 ) {
			$children = get_terms( array( 'taxonomy' => 'state_city', 'hide_empty' => false, 'parent' => $state_term ) );
			if ( is_array( $children ) && ! is_wp_error( $children ) ) {
				$cities = array_values( array_filter( $children, static function ( $t ) { return $t instanceof \WP_Term; } ) );
			}
		}
		$state_title = self::address_form_state_title( $form );
		if ( empty( $cities ) ) {
			$plain = __( 'شهر را بنویسید:', 'webino-dashboard' );
			if ( $message_id > 0 ) {
				$res = $client->edit_message_text(
					array(
						'chat_id'    => $target_chat,
						'message_id' => $message_id,
						'text'       => $plain,
					)
				);
				if ( is_array( $res ) && ! empty( $res['ok'] ) ) {
					return;
				}
			}
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => $plain ) );
			return;
		}
		$rows   = array();
		$buffer = array();
		foreach ( $cities as $city ) {
			$buffer[] = array(
				'text'          => (string) $city->name,
				'callback_data' => 'act:' . (int) $city->term_id,
			);
			if ( count( $buffer ) >= 2 ) {
				$rows[] = $buffer;
				$buffer = array();
			}
		}
		if ( ! empty( $buffer ) ) {
			$rows[] = $buffer;
		}
		$prompt = $state_title !== ''
			? sprintf( __( 'شهر را برای «%s» انتخاب کنید:', 'webino-dashboard' ), $state_title )
			: __( 'شهر را از لیست انتخاب کنید:', 'webino-dashboard' );
		$params = array(
			'chat_id'      => $target_chat,
			'text'         => $prompt,
			'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
		);
		if ( $message_id > 0 ) {
			$params['message_id'] = $message_id;
			$res                  = $client->edit_message_text( $params );
			if ( is_array( $res ) && ! empty( $res['ok'] ) ) {
				return;
			}
		}
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => $prompt,
				'reply_markup' => $params['reply_markup'],
			)
		);
	}

	/**
	 * @param array<string, mixed> $form
	 */
	private static function address_form_state_title( array $form ): string {
		$tid = isset( $form['state_term'] ) ? (int) $form['state_term'] : 0;
		if ( $tid > 0 ) {
			$t = get_term( $tid, 'state_city' );
			if ( $t instanceof \WP_Term ) {
				return (string) $t->name;
			}
		}
		$code = isset( $form['state'] ) ? (string) $form['state'] : '';
		if ( $code === '' ) {
			return '';
		}
		$country = function_exists( 'wc_get_base_location' ) ? wc_get_base_location()['country'] : 'IR';
		$states  = function_exists( 'WC' ) && \WC()->countries ? \WC()->countries->get_states( $country ) : array();
		if ( is_array( $states ) && isset( $states[ $code ] ) ) {
			return (string) $states[ $code ];
		}
		return $code;
	}

	private static function handle_form_state_select( string $chat_id, string $state_code, int $message_id = 0, string $edit_chat = '' ): void {
		$repo = new SessionRepository();
		$row  = $repo->get_by_chat_id( $chat_id );
		if ( ! $row || (string) ( $row['current_state'] ?? '' ) !== self::STATE_ADDRESS_FORM ) {
			return;
		}
		$data = $repo->get_temp_data( $chat_id );
		if ( (string) ( $data['addr_step'] ?? '' ) !== 'state' ) {
			return;
		}
		$form = isset( $data['addr_form'] ) && is_array( $data['addr_form'] ) ? $data['addr_form'] : array();
		$state_code = sanitize_text_field( $state_code );
		$term_id    = ctype_digit( $state_code ) ? (int) $state_code : 0;
		if ( $term_id > 0 ) {
			$term = get_term( $term_id, 'state_city' );
			if ( $term instanceof \WP_Term ) {
				$resolved = self::resolve_wc_state_code_from_term( $term );
				$form['state']      = $resolved !== '' ? $resolved : sanitize_text_field( (string) $term->slug );
				$form['state_term'] = (string) $term->term_id;
			} else {
				$form['state'] = $state_code;
			}
		} else {
			$form['state'] = $state_code;
		}
		$repo->merge_temp_data( $chat_id, array( 'addr_step' => 'city', 'addr_form' => $form ) );
		self::send_address_city_picker( $chat_id, $form, $message_id, $edit_chat );
	}

	private static function handle_form_city_select( string $chat_id, int $city_term_id, int $message_id = 0, string $edit_chat = '' ): void {
		$repo = new SessionRepository();
		$row  = $repo->get_by_chat_id( $chat_id );
		if ( ! $row || (string) ( $row['current_state'] ?? '' ) !== self::STATE_ADDRESS_FORM ) {
			return;
		}
		$data = $repo->get_temp_data( $chat_id );
		if ( (string) ( $data['addr_step'] ?? '' ) !== 'city' ) {
			return;
		}
		$form = isset( $data['addr_form'] ) && is_array( $data['addr_form'] ) ? $data['addr_form'] : array();
		$city = get_term( $city_term_id, 'state_city' );
		if ( ! ( $city instanceof \WP_Term ) ) {
			return;
		}
		$form['city']      = sanitize_text_field( (string) $city->name );
		$form['city_term'] = (string) $city->term_id;
		$repo->merge_temp_data( $chat_id, array( 'addr_step' => 'address_1', 'addr_form' => $form ) );
		$is_edit = (string) ( $data['addr_mode'] ?? 'create' ) === 'edit';
		$client  = new Client();
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => self::address_form_prompt( 'address_1', $form, $is_edit ),
			)
		);
	}

	// ─── Helpers ──────────────────────────────────────────────────────

	/**
	 * @return list<\WP_Term>
	 */
	private static function get_state_terms(): array {
		$terms = get_terms( array( 'taxonomy' => 'state_city', 'hide_empty' => false, 'parent' => 0 ) );
		if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
			return array();
		}
		return array_values( array_filter( $terms, static function ( $term ) { return $term instanceof \WP_Term; } ) );
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

	private static function finish_address_form( string $chat_id, int $user_id, string $context, bool $saved, string $saved_id ): void {
		$repo = new SessionRepository();
		$repo->set_state( $chat_id, null );
		$repo->merge_temp_data(
			$chat_id,
			array(
				'addr_context' => '',
				'addr_mode'    => '',
				'addr_id'      => '',
				'addr_step'    => '',
				'addr_form'    => array(),
			)
		);
		$client = new Client();
		$main_kbd = MessageHandler::main_menu_reply_markup();
		if ( ! $saved ) {
			$client->send_message(
				array(
					'chat_id'      => $chat_id,
					'text'         => __( 'ثبت آدرس لغو شد.', 'webino-dashboard' ),
					'reply_markup' => $main_kbd,
				)
			);
			if ( $context === 'checkout' ) {
				CheckoutFlow::start( $chat_id );
			}
			return;
		}
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => __( 'آدرس با موفقیت ذخیره شد.', 'webino-dashboard' ),
				'reply_markup' => $main_kbd,
			)
		);
		if ( $context === 'checkout' ) {
			CheckoutFlow::handle_address_chosen( $chat_id, $user_id, $saved_id );
			return;
		}
		self::send_my_addresses( $chat_id, $user_id );
	}

	/**
	 * @param array<string, mixed> $form
	 */
	private static function address_form_prompt( string $step, array $form, bool $is_edit ): string {
		$labels = array(
			'label'      => __( 'نام آدرس را بنویسید (مثال: خانه، محل کار):', 'webino-dashboard' ),
			'first_name' => __( 'نام گیرنده:', 'webino-dashboard' ),
			'last_name'  => __( 'نام خانوادگی گیرنده:', 'webino-dashboard' ),
			'state'      => __( 'استان:', 'webino-dashboard' ),
			'city'       => __( 'شهر:', 'webino-dashboard' ),
			'address_1'  => __( 'آدرس کامل:', 'webino-dashboard' ),
			'postcode'   => __( 'کدپستی (۱۰ رقم):', 'webino-dashboard' ),
			'phone'      => __( 'شماره موبایل گیرنده:', 'webino-dashboard' ),
		);
		$prompt = isset( $labels[ $step ] ) ? (string) $labels[ $step ] : __( 'مقدار را وارد کنید:', 'webino-dashboard' );
		if ( ! $is_edit ) {
			return $prompt;
		}
		$current = isset( $form[ $step ] ) ? trim( (string) $form[ $step ] ) : '';
		if ( $current === '' ) {
			return $prompt;
		}
		return $prompt . "\n" . sprintf(
			__( 'مقدار فعلی: %s', 'webino-dashboard' ),
			$current
		) . "\n" . __( 'برای عدم تغییر «-» بفرستید.', 'webino-dashboard' );
	}

	public static function send_checkout_address_picker( string $chat_id, int $user_id ): void {
		$all      = AddressBook::all( $user_id );
		$default  = AddressBook::default_id( $user_id );
		$rows     = array();
		$text     = __( 'آدرس خود را انتخاب کنید:', 'webino-dashboard' );
		foreach ( $all as $addr ) {
			$label = (string) $addr['label'];
			if ( $default !== '' && $default === (string) $addr['id'] ) {
				$label = '⭐ ' . $label;
			}
			$rows[] = array(
				array(
					'text'          => $label,
					'callback_data' => 'ac:' . (string) $addr['id'],
				),
			);
		}
		$rows[] = array(
			array(
				'text'          => '➕ ' . __( 'افزودن آدرس جدید', 'webino-dashboard' ),
				'callback_data' => 'an:checkout',
			),
		);
		$client = new Client();
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => $text,
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}
}
