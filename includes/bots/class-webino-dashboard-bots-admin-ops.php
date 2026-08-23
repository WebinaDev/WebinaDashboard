<?php
/**
 * Admin ops: order alerts, stock, reports, comments, forms, routing.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared admin console hooks for Bale/Telegram.
 */
final class Webino_Dashboard_Bots_Admin_Ops {

	const OPTION = 'webino_dashboard_bots_admin_ops';

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		add_action( 'woocommerce_new_order', array( __CLASS__, 'on_new_order' ), 40, 1 );
		add_action( 'woocommerce_low_stock', array( __CLASS__, 'on_low_stock' ), 20, 1 );
		add_action( 'woocommerce_no_stock', array( __CLASS__, 'on_no_stock' ), 20, 1 );
		add_action( 'transition_comment_status', array( __CLASS__, 'on_comment_status' ), 20, 3 );
		add_action( 'wp_insert_comment', array( __CLASS__, 'on_new_comment' ), 20, 2 );
		add_action( 'wpcf7_mail_sent', array( __CLASS__, 'on_cf7' ), 20, 1 );
		add_action( 'gform_after_submission', array( __CLASS__, 'on_gravity' ), 20, 2 );
		add_action( 'updraftplus_backup_complete', array( __CLASS__, 'on_backup_ok' ), 20, 1 );
		add_action( 'updraftplus_backupfailed', array( __CLASS__, 'on_backup_fail' ), 20, 1 );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function settings() {
		$defaults = array(
			'enabled'              => '1',
			'notify_new_order'     => '1',
			'notify_stock'         => '1',
			'notify_comments'      => '1',
			'notify_forms'         => '1',
			'notify_backup'        => '1',
			'stock_threshold'      => 5,
			'min_order_amount'     => 0,
			'route_high_aov'       => 0,
			'route_high_aov_chats' => '',
			'route_cancel_chats'   => '',
			'admin_roles'          => array(),
		);
		$raw = get_option( self::OPTION, array() );
		return is_array( $raw ) ? array_merge( $defaults, $raw ) : $defaults;
	}

	/**
	 * @param array<string,mixed> $input Input.
	 * @return array<string,mixed>
	 */
	public static function save_settings( $input ) {
		$cur = self::settings();
		if ( ! is_array( $input ) ) {
			return $cur;
		}
		foreach ( array( 'enabled', 'notify_new_order', 'notify_stock', 'notify_comments', 'notify_forms', 'notify_backup' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = ! empty( $input[ $f ] ) && '0' !== (string) $input[ $f ] ? '1' : '0';
			}
		}
		foreach ( array( 'stock_threshold', 'min_order_amount', 'route_high_aov' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = max( 0, (float) $input[ $f ] );
			}
		}
		foreach ( array( 'route_high_aov_chats', 'route_cancel_chats' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = sanitize_textarea_field( (string) $input[ $f ] );
			}
		}
		update_option( self::OPTION, $cur, false );
		return $cur;
	}

	/**
	 * Chat IDs for a provider from bot settings + routing.
	 *
	 * @param string $provider Provider.
	 * @return list<string>
	 */
	public static function admin_chats( $provider ) {
		$provider = sanitize_key( $provider );
		$chats    = array();
		if ( class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			Webino_Dashboard_Bots_Loader::register_autoloaders();
		}
		if ( 'telegram' === $provider && class_exists( '\Webino_Dashboard_Bots_Telegram\Core\Plugin', false ) ) {
			$s = \Webino_Dashboard_Bots_Telegram\Core\Plugin::get_settings();
		} elseif ( 'bale' === $provider && class_exists( '\Webino_Dashboard_Bots_Bale\Core\Plugin', false ) ) {
			$s = \Webino_Dashboard_Bots_Bale\Core\Plugin::get_settings();
		} else {
			$s = array();
		}
		$raw = isset( $s['bot_admin_chat_ids'] ) ? (string) $s['bot_admin_chat_ids'] : '';
		foreach ( preg_split( '/[\s,;]+/', $raw ) as $id ) {
			$id = trim( (string) $id );
			if ( $id !== '' ) {
				$chats[] = $id;
			}
		}
		return array_values( array_unique( $chats ) );
	}

	/**
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public static function on_new_order( $order_id ) {
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] || empty( $s['notify_new_order'] ) || '0' === (string) $s['notify_new_order'] ) {
			return;
		}
		$order = function_exists( 'wc_get_order' ) ? wc_get_order( (int) $order_id ) : false;
		if ( ! $order ) {
			return;
		}
		$min = (float) $s['min_order_amount'];
		if ( $min > 0 && (float) $order->get_total() + 0.0001 < $min ) {
			return;
		}
		$text = class_exists( 'Webino_Dashboard_Bots_Templates', false )
			? Webino_Dashboard_Bots_Templates::admin_order_card( $order )
			: sprintf( __( 'سفارش جدید #%s', 'webino-dashboard' ), $order->get_order_number() );
		$oid  = $order->get_id();
		$kbd  = array(
			'inline_keyboard' => array(
				array(
					array( 'text' => __( 'در حال انجام', 'webino-dashboard' ), 'callback_data' => 'aos:' . $oid . ':processing' ),
					array( 'text' => __( 'تکمیل', 'webino-dashboard' ), 'callback_data' => 'aos:' . $oid . ':completed' ),
				),
				array(
					array( 'text' => __( 'لغو', 'webino-dashboard' ), 'callback_data' => 'aos:' . $oid . ':cancelled' ),
					array( 'text' => __( 'یادداشت', 'webino-dashboard' ), 'callback_data' => 'aon:' . $oid ),
					array( 'text' => __( 'پیگیری', 'webino-dashboard' ), 'callback_data' => 'atrk:' . $oid ),
				),
			),
		);
		$targets = self::route_chats_for_order( $order );
		self::broadcast_admins( $text, $kbd, $targets );
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,list<string>> provider => chats.
	 */
	private static function route_chats_for_order( $order ) {
		$s       = self::settings();
		$out     = array(
			'bale'     => self::admin_chats( 'bale' ),
			'telegram' => self::admin_chats( 'telegram' ),
		);
		$high = (float) $s['route_high_aov'];
		if ( $high > 0 && (float) $order->get_total() >= $high ) {
			$extra = preg_split( '/[\s,;]+/', (string) $s['route_high_aov_chats'] );
			foreach ( (array) $extra as $id ) {
				$id = trim( (string) $id );
				if ( $id !== '' ) {
					$out['bale'][]     = $id;
					$out['telegram'][] = $id;
				}
			}
		}
		if ( 'cancelled' === $order->get_status() ) {
			$extra = preg_split( '/[\s,;]+/', (string) $s['route_cancel_chats'] );
			foreach ( (array) $extra as $id ) {
				$id = trim( (string) $id );
				if ( $id !== '' ) {
					$out['bale'][]     = $id;
					$out['telegram'][] = $id;
				}
			}
		}
		$out['bale']     = array_values( array_unique( $out['bale'] ) );
		$out['telegram'] = array_values( array_unique( $out['telegram'] ) );
		return $out;
	}

	/**
	 * @param string                         $text Text.
	 * @param array<string,mixed>|null       $kbd  Keyboard.
	 * @param array<string,list<string>>|null $map  Provider map.
	 * @return void
	 */
	public static function broadcast_admins( $text, $kbd = null, $map = null ) {
		if ( null === $map ) {
			$map = array(
				'bale'     => self::admin_chats( 'bale' ),
				'telegram' => self::admin_chats( 'telegram' ),
			);
		}
		foreach ( $map as $provider => $chats ) {
			foreach ( $chats as $chat ) {
				$payload = array( 'text' => $text );
				if ( is_array( $kbd ) ) {
					$payload['reply_markup'] = wp_json_encode( $kbd );
				}
				$client = class_exists( 'Webino_Dashboard_Bots_Client_Facade', false )
					? Webino_Dashboard_Bots_Client_Facade::make( $provider )
					: null;
				if ( $client ) {
					$payload['chat_id'] = $chat;
					$res                = $client->send_message( $payload );
					if ( ( ! is_array( $res ) || empty( $res['ok'] ) ) && class_exists( 'Webino_Dashboard_Bots_Outbound_Queue', false ) ) {
						Webino_Dashboard_Bots_Outbound_Queue::enqueue_message( $provider, $chat, $payload );
					}
				} elseif ( class_exists( 'Webino_Dashboard_Bots_Outbound_Queue', false ) ) {
					Webino_Dashboard_Bots_Outbound_Queue::enqueue_message( $provider, $chat, $payload );
				}
			}
		}
	}

	/**
	 * @param WC_Product $product Product.
	 * @return void
	 */
	public static function on_low_stock( $product ) {
		$s = self::settings();
		if ( empty( $s['notify_stock'] ) || '0' === (string) $s['notify_stock'] || ! $product ) {
			return;
		}
		$name = is_object( $product ) && method_exists( $product, 'get_name' ) ? $product->get_name() : '';
		$qty  = is_object( $product ) && method_exists( $product, 'get_stock_quantity' ) ? $product->get_stock_quantity() : '';
		self::broadcast_admins( sprintf( __( '⚠ موجودی کم: %1$s (تعداد: %2$s)', 'webino-dashboard' ), $name, (string) $qty ) );
	}

	/**
	 * @param WC_Product $product Product.
	 * @return void
	 */
	public static function on_no_stock( $product ) {
		$s = self::settings();
		if ( empty( $s['notify_stock'] ) || '0' === (string) $s['notify_stock'] || ! $product ) {
			return;
		}
		$name = is_object( $product ) && method_exists( $product, 'get_name' ) ? $product->get_name() : '';
		self::broadcast_admins( sprintf( __( '🚫 ناموجود شد: %s', 'webino-dashboard' ), $name ) );
	}

	/**
	 * @param int         $id      Comment ID.
	 * @param WP_Comment  $comment Comment.
	 * @return void
	 */
	public static function on_new_comment( $id, $comment ) {
		$s = self::settings();
		if ( empty( $s['notify_comments'] ) || '0' === (string) $s['notify_comments'] ) {
			return;
		}
		if ( ! $comment || '0' !== (string) $comment->comment_approved ) {
			return;
		}
		$text = sprintf(
			__( "💬 کامنت جدید از %1\$s:\n%2\$s", 'webino-dashboard' ),
			$comment->comment_author,
			wp_strip_all_tags( $comment->comment_content )
		);
		$kbd = array(
			'inline_keyboard' => array(
				array(
					array( 'text' => __( 'تأیید', 'webino-dashboard' ), 'callback_data' => 'acm:' . (int) $id . ':approve' ),
					array( 'text' => __( 'حذف', 'webino-dashboard' ), 'callback_data' => 'acm:' . (int) $id . ':trash' ),
				),
			),
		);
		self::broadcast_admins( $text, $kbd );
	}

	/**
	 * @param string     $new_status New.
	 * @param string     $old_status Old.
	 * @param WP_Comment $comment    Comment.
	 * @return void
	 */
	public static function on_comment_status( $new_status, $old_status, $comment ) {
		unset( $new_status, $old_status, $comment );
	}

	/**
	 * @param WPCF7_ContactForm $contact_form Form.
	 * @return void
	 */
	public static function on_cf7( $contact_form ) {
		$s = self::settings();
		if ( empty( $s['notify_forms'] ) || '0' === (string) $s['notify_forms'] ) {
			return;
		}
		$title = is_object( $contact_form ) && method_exists( $contact_form, 'title' ) ? $contact_form->title() : 'CF7';
		self::broadcast_admins( sprintf( __( '📝 فرم ارسال شد: %s', 'webino-dashboard' ), $title ) );
	}

	/**
	 * @param array<string,mixed> $entry Entry.
	 * @param array<string,mixed> $form  Form.
	 * @return void
	 */
	public static function on_gravity( $entry, $form ) {
		$s = self::settings();
		if ( empty( $s['notify_forms'] ) || '0' === (string) $s['notify_forms'] ) {
			return;
		}
		$title = isset( $form['title'] ) ? (string) $form['title'] : 'Gravity';
		self::broadcast_admins( sprintf( __( '📝 Gravity Forms: %s', 'webino-dashboard' ), $title ) );
	}

	/**
	 * @param mixed $arg Arg.
	 * @return void
	 */
	public static function on_backup_ok( $arg = null ) {
		unset( $arg );
		$s = self::settings();
		if ( empty( $s['notify_backup'] ) || '0' === (string) $s['notify_backup'] ) {
			return;
		}
		self::broadcast_admins( __( '✅ پشتیبان‌گیری موفق بود.', 'webino-dashboard' ) );
	}

	/**
	 * @param mixed $arg Arg.
	 * @return void
	 */
	public static function on_backup_fail( $arg = null ) {
		$s = self::settings();
		if ( empty( $s['notify_backup'] ) || '0' === (string) $s['notify_backup'] ) {
			return;
		}
		$msg = is_string( $arg ) ? $arg : '';
		self::broadcast_admins( __( '❌ پشتیبان‌گیری ناموفق.', 'webino-dashboard' ) . ( $msg !== '' ? "\n" . $msg : '' ) );
	}

	/**
	 * Sales report text for a period.
	 *
	 * @param string $period today|7d|week|30d|month.
	 * @return string
	 */
	public static function sales_report( $period = 'today' ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return __( 'ووکامرس فعال نیست.', 'webino-dashboard' );
		}
		$now = time();
		switch ( sanitize_key( $period ) ) {
			case '7d':
				$from = $now - 7 * DAY_IN_SECONDS;
				$label = __( '۷ روز اخیر', 'webino-dashboard' );
				break;
			case 'week':
				$from = strtotime( 'monday this week' );
				$label = __( 'هفته جاری', 'webino-dashboard' );
				break;
			case '30d':
				$from = $now - 30 * DAY_IN_SECONDS;
				$label = __( '۳۰ روز اخیر', 'webino-dashboard' );
				break;
			case 'month':
				$from = strtotime( date( 'Y-m-01' ) );
				$label = __( 'ماه جاری', 'webino-dashboard' );
				break;
			default:
				$from = strtotime( 'today' );
				$label = __( 'امروز', 'webino-dashboard' );
		}
		$orders = wc_get_orders(
			array(
				'limit'        => -1,
				'status'       => array( 'wc-processing', 'wc-completed', 'wc-on-hold' ),
				'date_created' => $from . '...' . $now,
				'return'       => 'objects',
			)
		);
		$count = 0;
		$gmv   = 0.0;
		$skus  = array();
		if ( is_array( $orders ) ) {
			foreach ( $orders as $order ) {
				if ( ! $order instanceof WC_Order ) {
					continue;
				}
				++$count;
				$gmv += (float) $order->get_total();
				foreach ( $order->get_items() as $item ) {
					$pid = $item->get_product_id();
					$skus[ $pid ] = isset( $skus[ $pid ] ) ? $skus[ $pid ] + (int) $item->get_quantity() : (int) $item->get_quantity();
				}
			}
		}
		arsort( $skus );
		$top = array();
		$i   = 0;
		foreach ( $skus as $pid => $qty ) {
			if ( $i >= 5 ) {
				break;
			}
			$p = wc_get_product( $pid );
			$top[] = ( $p ? $p->get_name() : ( '#' . $pid ) ) . ' × ' . $qty;
			++$i;
		}
		$aov = $count > 0 ? $gmv / $count : 0;
		return implode(
			"\n",
			array(
				sprintf( __( '📊 گزارش فروش (%s)', 'webino-dashboard' ), $label ),
				sprintf( __( 'تعداد سفارش: %d', 'webino-dashboard' ), $count ),
				sprintf( __( 'فروش: %s', 'webino-dashboard' ), number_format( $gmv, 0, '.', ',' ) ),
				sprintf( __( 'میانگین: %s', 'webino-dashboard' ), number_format( $aov, 0, '.', ',' ) ),
				__( 'پرفروش‌ها:', 'webino-dashboard' ),
				empty( $top ) ? '—' : implode( "\n", $top ),
			)
		);
	}

	/**
	 * Handle admin callback aos:/aon:/acm:/arpt:
	 *
	 * @param string $data Callback data.
	 * @param string $chat Chat id.
	 * @param string $provider Provider.
	 * @return bool
	 */
	public static function handle_callback( $data, $chat, $provider ) {
		$data = (string) $data;
		if ( strpos( $data, 'aos:' ) === 0 ) {
			$parts = explode( ':', $data );
			$oid   = isset( $parts[1] ) ? (int) $parts[1] : 0;
			$st    = isset( $parts[2] ) ? sanitize_key( $parts[2] ) : '';
			$order = $oid > 0 && function_exists( 'wc_get_order' ) ? wc_get_order( $oid ) : false;
			if ( $order && $st !== '' ) {
				$order->update_status( $st, __( 'از ربات ادمین', 'webino-dashboard' ) );
				self::reply( $provider, $chat, sprintf( __( 'وضعیت سفارش #%1$s → %2$s', 'webino-dashboard' ), $order->get_order_number(), wc_get_order_status_name( $st ) ) );
			}
			return true;
		}
		if ( strpos( $data, 'acm:' ) === 0 ) {
			$parts = explode( ':', $data );
			$cid   = isset( $parts[1] ) ? (int) $parts[1] : 0;
			$act   = isset( $parts[2] ) ? sanitize_key( $parts[2] ) : '';
			if ( $cid > 0 && 'approve' === $act ) {
				wp_set_comment_status( $cid, 'approve' );
				self::reply( $provider, $chat, __( 'کامنت تأیید شد.', 'webino-dashboard' ) );
			} elseif ( $cid > 0 && 'trash' === $act ) {
				wp_trash_comment( $cid );
				self::reply( $provider, $chat, __( 'کامنت حذف شد.', 'webino-dashboard' ) );
			}
			return true;
		}
		if ( strpos( $data, 'arpt:' ) === 0 ) {
			$period = sanitize_key( substr( $data, 5 ) );
			self::reply( $provider, $chat, self::sales_report( $period !== '' ? $period : 'today' ) );
			return true;
		}
		if ( strpos( $data, 'aon:' ) === 0 ) {
			$oid = (int) substr( $data, 4 );
			set_transient( 'webino_bots_pending_aon_' . $provider . '_' . $chat, $oid, HOUR_IN_SECONDS );
			self::reply( $provider, $chat, __( 'یادداشت سفارش را بنویسید:', 'webino-dashboard' ) );
			return true;
		}
		if ( strpos( $data, 'atrk:' ) === 0 ) {
			$oid = (int) substr( $data, 5 );
			set_transient( 'webino_bots_pending_atrk_' . $provider . '_' . $chat, $oid, HOUR_IN_SECONDS );
			self::reply( $provider, $chat, __( 'کد پیگیری را بنویسید:', 'webino-dashboard' ) );
			return true;
		}
		return false;
	}

	/**
	 * Consume pending admin note / tracking text after aon:/atrk: prompts.
	 *
	 * @param string $provider Provider.
	 * @param string $chat     Chat id.
	 * @param string $text     Admin message text.
	 * @return bool True if handled.
	 */
	public static function consume_pending_admin_text( $provider, $chat, $text ) {
		$provider = sanitize_key( (string) $provider );
		$chat     = (string) $chat;
		$text     = trim( (string) $text );
		if ( $provider === '' || $chat === '' || $text === '' ) {
			return false;
		}

		$aon_key = 'webino_bots_pending_aon_' . $provider . '_' . $chat;
		$oid     = (int) get_transient( $aon_key );
		if ( $oid > 0 ) {
			delete_transient( $aon_key );
			$order = function_exists( 'wc_get_order' ) ? wc_get_order( $oid ) : false;
			if ( $order ) {
				$order->add_order_note( sanitize_textarea_field( $text ), false, true );
				self::reply( $provider, $chat, sprintf( __( 'یادداشت به سفارش #%s افزوده شد.', 'webino-dashboard' ), $order->get_order_number() ) );
			} else {
				self::reply( $provider, $chat, __( 'سفارش یافت نشد.', 'webino-dashboard' ) );
			}
			return true;
		}

		$atrk_key = 'webino_bots_pending_atrk_' . $provider . '_' . $chat;
		$oid      = (int) get_transient( $atrk_key );
		if ( $oid > 0 ) {
			delete_transient( $atrk_key );
			$order = function_exists( 'wc_get_order' ) ? wc_get_order( $oid ) : false;
			if ( $order ) {
				$code = sanitize_text_field( $text );
				$order->update_meta_data( '_woobale_tracking_code', $code );
				$order->save();
				self::reply( $provider, $chat, sprintf( __( 'کد پیگیری سفارش #%1$s ذخیره شد: %2$s', 'webino-dashboard' ), $order->get_order_number(), $code ) );
			} else {
				self::reply( $provider, $chat, __( 'سفارش یافت نشد.', 'webino-dashboard' ) );
			}
			return true;
		}

		return false;
	}

	/**
	 * @param string $provider Provider.
	 * @param string $chat Chat.
	 * @param string $text Text.
	 * @return void
	 */
	private static function reply( $provider, $chat, $text ) {
		$client = Webino_Dashboard_Bots_Client_Facade::make( $provider );
		if ( $client ) {
			$client->send_message( array( 'chat_id' => $chat, 'text' => $text ) );
		}
	}

	/**
	 * Low stock product list text.
	 *
	 * @return string
	 */
	public static function low_stock_list() {
		$s   = self::settings();
		$thr = max( 1, (int) $s['stock_threshold'] );
		$ids = function_exists( 'wc_get_products' )
			? wc_get_products(
				array(
					'limit'      => 30,
					'status'     => 'publish',
					'stock_status' => 'instock',
					'return'     => 'ids',
				)
			)
			: array();
		$lines = array( sprintf( __( '📦 موجودی ≤ %d', 'webino-dashboard' ), $thr ) );
		$n     = 0;
		foreach ( (array) $ids as $pid ) {
			$p = wc_get_product( $pid );
			if ( ! $p || ! $p->managing_stock() ) {
				continue;
			}
			$q = (int) $p->get_stock_quantity();
			if ( $q > $thr ) {
				continue;
			}
			$lines[] = $p->get_name() . ' — ' . $q;
			++$n;
			if ( $n >= 20 ) {
				break;
			}
		}
		if ( $n < 1 ) {
			$lines[] = '—';
		}
		return implode( "\n", $lines );
	}
}
