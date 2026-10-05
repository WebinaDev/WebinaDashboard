<?php

namespace Webino_Dashboard_Bots_Bale\Bot;

use Webino_Dashboard_Bots_Bale\Admin\BroadcastQueue;
use Webino_Dashboard_Bots_Bale\Bale\Client;
use Webino_Dashboard_Bots_Bale\Core\Plugin;
use Webino_Dashboard_Bots_Bale\Database\SessionRepository;
use Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger;
use Webino_Dashboard_Bots_Bale\Util\MoneyFormatter;
use Webino_Dashboard_Bots_Bale\Woo\ProductChannelSync;

/**
 * Operator panel via /admin (see AdminGate).
 */
class AdminFlow {

	public const CB_PREFIX = 'am:';

	public const STATE_P_TITLE   = 'admin_p_title';
	public const STATE_P_DESC    = 'admin_p_desc';
	public const STATE_P_PRICE   = 'admin_p_price';
	public const STATE_P_STOCK   = 'admin_p_stock';
	public const STATE_P_CAT     = 'admin_p_cat';
	public const STATE_P_IMAGE   = 'admin_p_image';
	public const STATE_P_CONFIRM = 'admin_p_confirm';

	public const STATE_CP_CODE      = 'admin_cp_code';
	public const STATE_CP_WAIT_TYPE = 'admin_cp_wait_type';
	public const STATE_CP_AMOUNT    = 'admin_cp_amount';

	public const STATE_DM_TARGET = 'admin_dm_target';
	public const STATE_DM_BODY   = 'admin_dm_body';

	public const STATE_BC_BODY = 'admin_bc_body';

	public const STATE_CH_PID = 'admin_ch_pid';

	public const STATE_FJ_MSG  = 'admin_fj_msg';
	public const STATE_FJ_CID  = 'admin_fj_cid';
	public const STATE_FJ_LINK = 'admin_fj_link';

	/**
	 * Clear admin wizard state on /start for admins.
	 */
	public static function clear_on_start( string $chat_id ): void {
		if ( ! AdminGate::is_admin_chat( $chat_id ) ) {
			return;
		}
		$repo = new SessionRepository();
		$row  = $repo->get_by_chat_id( $chat_id );
		$st   = $row && ! empty( $row['current_state'] ) ? (string) $row['current_state'] : '';
		if ( $st !== '' && strpos( $st, 'admin_' ) === 0 ) {
			$repo->set_state( $chat_id, null );
		}
	}

	public static function handle_command( string $chat_id, Client $client ): void {
		if ( ! AdminGate::is_admin_chat( $chat_id ) ) {
			return;
		}
		self::send_main_menu( $chat_id, $client );
	}

	/**
	 * @param array<string, mixed> $message Full message payload.
	 */
	public static function handle_message( string $chat_id, string $text, array $message, Client $client ): bool {
		if ( ! AdminGate::is_admin_chat( $chat_id ) ) {
			return false;
		}
		$repo  = new SessionRepository();
		$row   = $repo->get_by_chat_id( $chat_id );
		$state = $row && ! empty( $row['current_state'] ) ? (string) $row['current_state'] : '';
		if ( $state === '' || strpos( $state, 'admin_' ) !== 0 ) {
			return false;
		}

		if ( ! empty( $message['photo'] ) && is_array( $message['photo'] ) && $state === self::STATE_P_IMAGE ) {
			return self::handle_product_photo( $chat_id, $message['photo'], $repo, $client );
		}

		if ( $text === '' ) {
			self::send_text( $chat_id, __( 'متن یا تصویر معتبر ارسال کنید یا /admin را بزنید.', 'webino-dashboard' ), $client );
			return true;
		}

		switch ( $state ) {
			case self::STATE_P_TITLE:
				$repo->merge_temp_data( $chat_id, array( 'p_title' => sanitize_text_field( $text ) ) );
				$repo->set_state( $chat_id, self::STATE_P_DESC );
				self::send_text( $chat_id, __( 'توضیح کوتاه محصول را بفرستید (یا «-» برای خالی):', 'webino-dashboard' ), $client );
				return true;
			case self::STATE_P_DESC:
				$d = $text === '-' ? '' : sanitize_textarea_field( $text );
				$repo->merge_temp_data( $chat_id, array( 'p_desc' => $d ) );
				$repo->set_state( $chat_id, self::STATE_P_PRICE );
				self::send_text( $chat_id, __( 'قیمت را به تومان (فقط عدد) وارد کنید:', 'webino-dashboard' ), $client );
				return true;
			case self::STATE_P_PRICE:
				$price = self::parse_positive_float( $text );
				if ( $price === null ) {
					self::send_text( $chat_id, __( 'عدد نامعتبر است.', 'webino-dashboard' ), $client );
					return true;
				}
				$repo->merge_temp_data( $chat_id, array( 'p_price' => $price ) );
				$repo->set_state( $chat_id, self::STATE_P_STOCK );
				self::send_text( $chat_id, __( 'موجودی (عدد صحیح):', 'webino-dashboard' ), $client );
				return true;
			case self::STATE_P_STOCK:
				if ( ! ctype_digit( trim( $text ) ) ) {
					self::send_text( $chat_id, __( 'فقط عدد صحیح برای موجودی.', 'webino-dashboard' ), $client );
					return true;
				}
				$repo->merge_temp_data( $chat_id, array( 'p_stock' => absint( $text ) ) );
				$repo->set_state( $chat_id, self::STATE_P_CAT );
				self::send_text( $chat_id, __( 'شناسهٔ دستهٔ محصول (عدد) را وارد کنید یا ۰ برای بدون دسته:', 'webino-dashboard' ), $client );
				return true;
			case self::STATE_P_CAT:
				if ( ! ctype_digit( trim( $text ) ) ) {
					self::send_text( $chat_id, __( 'فقط عدد (شناسهٔ دسته) یا ۰.', 'webino-dashboard' ), $client );
					return true;
				}
				$repo->merge_temp_data( $chat_id, array( 'p_cat' => absint( $text ) ) );
				$repo->set_state( $chat_id, self::STATE_P_IMAGE );
				self::send_text( $chat_id, __( 'یک تصویر برای محصول بفرستید (یا برای رد کردن «-» بزنید):', 'webino-dashboard' ), $client );
				return true;
			case self::STATE_P_IMAGE:
				if ( trim( $text ) === '-' ) {
					$repo->merge_temp_data( $chat_id, array( 'p_image_id' => 0 ) );
					self::goto_product_confirm( $chat_id, $repo, $client );
					return true;
				}
				self::send_text( $chat_id, __( 'لطفاً تصویر بفرستید یا «-».', 'webino-dashboard' ), $client );
				return true;
			case self::STATE_CP_CODE:
				$raw  = sanitize_text_field( $text );
				$code = function_exists( 'wc_format_coupon_code' ) ? wc_format_coupon_code( $raw ) : strtoupper( preg_replace( '/\s+/', '', $raw ) );
				if ( $code === '' ) {
					self::send_text( $chat_id, __( 'کد نامعتبر است.', 'webino-dashboard' ), $client );
					return true;
				}
				$repo->merge_temp_data( $chat_id, array( 'cp_code' => $code ) );
				$repo->set_state( $chat_id, self::STATE_CP_WAIT_TYPE );
				self::send_coupon_type_keyboard( $chat_id, $client );
				return true;
			case self::STATE_CP_AMOUNT:
				$parts = preg_split( '/\s+/', trim( $text ) );
				$amt   = isset( $parts[0] ) ? self::parse_positive_float( (string) $parts[0] ) : null;
				if ( $amt === null || $amt <= 0 ) {
					self::send_text( $chat_id, __( 'مقدار نامعتبر. عدد بفرستید (اختیاری: بعد از فاصله روز انقضا).', 'webino-dashboard' ), $client );
					return true;
				}
				$days = isset( $parts[1] ) ? absint( $parts[1] ) : 0;
				$repo->merge_temp_data( $chat_id, array( 'cp_amount' => $amt, 'cp_days' => $days ) );
				self::save_coupon_from_session( $chat_id, $repo, $client );
				return true;
			case self::STATE_DM_TARGET:
				self::handle_dm_target( $chat_id, $text, $repo, $client );
				return true;
			case self::STATE_DM_BODY:
				self::send_dm_message( $chat_id, $text, $repo, $client );
				return true;
			case self::STATE_BC_BODY:
				self::start_broadcast( $chat_id, $text, $client );
				$repo->set_state( $chat_id, null );
				return true;
			case self::STATE_CH_PID:
				self::sync_channel_product( $chat_id, $text, $repo, $client );
				return true;
			case self::STATE_FJ_MSG:
				$s = Plugin::get_settings();
				$s['force_join_message'] = sanitize_textarea_field( $text );
				Plugin::update_settings( $s );
				$repo->set_state( $chat_id, null );
				self::send_text( $chat_id, __( 'متن جوین اجباری به‌روز شد.', 'webino-dashboard' ), $client );
				self::send_main_menu( $chat_id, $client );
				return true;
			case self::STATE_FJ_CID:
				$s = Plugin::get_settings();
				$s['force_join_channel_id'] = sanitize_text_field( $text );
				Plugin::update_settings( $s );
				$repo->set_state( $chat_id, null );
				self::send_text( $chat_id, __( 'شناسهٔ کانال جوین اجباری ذخیره شد.', 'webino-dashboard' ), $client );
				self::send_force_join_panel( $chat_id, $client );
				return true;
			case self::STATE_FJ_LINK:
				$s    = Plugin::get_settings();
				$link = trim( $text );
				$url  = esc_url_raw( $link );
				$s['force_join_channel_link'] = $url !== '' ? $url : sanitize_text_field( $link );
				Plugin::update_settings( $s );
				$repo->set_state( $chat_id, null );
				self::send_text( $chat_id, __( 'لینک کانال ذخیره شد.', 'webino-dashboard' ), $client );
				self::send_force_join_panel( $chat_id, $client );
				return true;
			default:
				return false;
		}
	}

	/**
	 * @param list<array<string, mixed>> $photo_sizes
	 */
	private static function handle_product_photo( string $chat_id, array $photo_sizes, SessionRepository $repo, Client $client ): bool {
		$last = end( $photo_sizes );
		if ( ! is_array( $last ) || empty( $last['file_id'] ) ) {
			self::send_text( $chat_id, __( 'فایل تصویر نامعتبر است.', 'webino-dashboard' ), $client );
			return true;
		}
		$file_id = (string) $last['file_id'];
		$att_id  = self::sideload_photo_to_media( $file_id, $client );
		if ( is_wp_error( $att_id ) ) {
			self::send_text( $chat_id, $att_id->get_error_message(), $client );
			return true;
		}
		$repo->merge_temp_data( $chat_id, array( 'p_image_id' => (int) $att_id ) );
		self::goto_product_confirm( $chat_id, $repo, $client );
		return true;
	}

	private static function goto_product_confirm( string $chat_id, SessionRepository $repo, Client $client ): void {
		$repo->set_state( $chat_id, self::STATE_P_CONFIRM );
		$d    = $repo->get_temp_data( $chat_id );
		$txt  = self::format_product_preview( $d );
		$kbd  = wp_json_encode(
			array(
				'inline_keyboard' => array(
					array(
						array( 'text' => __( '✅ ثبت محصول', 'webino-dashboard' ), 'callback_data' => self::CB_PREFIX . 'py:1' ),
						array( 'text' => __( '❌ لغو', 'webino-dashboard' ), 'callback_data' => self::CB_PREFIX . 'cn' ),
					),
				),
			)
		);
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => $txt,
				'reply_markup' => $kbd,
			)
		);
	}

	/**
	 * @param array<string, mixed> $d
	 */
	private static function format_product_preview( array $d ): string {
		$title = isset( $d['p_title'] ) ? (string) $d['p_title'] : '';
		$desc  = isset( $d['p_desc'] ) ? (string) $d['p_desc'] : '';
		$price = isset( $d['p_price'] ) ? (float) $d['p_price'] : 0;
		$stock = isset( $d['p_stock'] ) ? (int) $d['p_stock'] : 0;
		$cat   = isset( $d['p_cat'] ) ? (int) $d['p_cat'] : 0;
		$img   = isset( $d['p_image_id'] ) ? (int) $d['p_image_id'] : 0;
		$lines = array(
			__( 'پیش‌نمایش محصول:', 'webino-dashboard' ),
			__( 'نام:', 'webino-dashboard' ) . ' ' . $title,
			__( 'توضیح:', 'webino-dashboard' ) . ' ' . ( $desc !== '' ? $desc : '—' ),
			__( 'قیمت (تومان):', 'webino-dashboard' ) . ' ' . MoneyFormatter::to_persian_digits( (string) $price ),
			__( 'موجودی:', 'webino-dashboard' ) . ' ' . MoneyFormatter::to_persian_digits( (string) $stock ),
			__( 'دسته:', 'webino-dashboard' ) . ' ' . ( $cat > 0 ? (string) $cat : __( 'بدون دسته', 'webino-dashboard' ) ),
			__( 'تصویر:', 'webino-dashboard' ) . ' ' . ( $img > 0 ? __( 'دارد', 'webino-dashboard' ) : __( 'ندارد', 'webino-dashboard' ) ),
		);
		return implode( "\n", $lines );
	}

	private static function save_product_from_session( string $chat_id, SessionRepository $repo, Client $client ): void {
		$d = $repo->get_temp_data( $chat_id );
		$repo->set_state( $chat_id, null );
		$repo->merge_temp_data(
			$chat_id,
			array(
				'p_title'    => '',
				'p_desc'     => '',
				'p_price'    => '',
				'p_stock'    => '',
				'p_cat'      => '',
				'p_image_id' => '',
			)
		);

		$title = isset( $d['p_title'] ) ? sanitize_text_field( (string) $d['p_title'] ) : '';
		if ( $title === '' ) {
			self::send_text( $chat_id, __( 'داده ناقص است.', 'webino-dashboard' ), $client );
			return;
		}
		$product = new \WC_Product_Simple();
		$product->set_name( $title );
		$product->set_description( isset( $d['p_desc'] ) ? (string) $d['p_desc'] : '' );
		$product->set_short_description( isset( $d['p_desc'] ) ? wp_strip_all_tags( (string) $d['p_desc'] ) : '' );
		$price = isset( $d['p_price'] ) ? (float) $d['p_price'] : 0;
		$product->set_regular_price( (string) $price );
		$product->set_manage_stock( true );
		$product->set_stock_quantity( isset( $d['p_stock'] ) ? (int) $d['p_stock'] : 0 );
		$product->set_stock_status( $product->get_stock_quantity() > 0 ? 'instock' : 'outofstock' );
		$product->set_catalog_visibility( 'visible' );
		$product->set_status( 'publish' );
		$product->save();
		$pid = $product->get_id();
		if ( $pid < 1 ) {
			self::send_text( $chat_id, __( 'ذخیرهٔ محصول ناموفق بود.', 'webino-dashboard' ), $client );
			return;
		}
		$cat = isset( $d['p_cat'] ) ? (int) $d['p_cat'] : 0;
		if ( $cat > 0 && term_exists( (int) $cat, 'product_cat' ) ) {
			wp_set_object_terms( $product->get_id(), array( (int) $cat ), 'product_cat' );
		}
		$img = isset( $d['p_image_id'] ) ? (int) $d['p_image_id'] : 0;
		if ( $img > 0 ) {
			$product->set_image_id( $img );
			$product->save();
		}
		self::send_text(
			$chat_id,
			sprintf(
				/* translators: %s: product id */
				__( 'محصول #%s ثبت شد.', 'webino-dashboard' ),
				MoneyFormatter::to_persian_digits( (string) (int) $product->get_id() )
			),
			$client
		);
		self::send_main_menu( $chat_id, $client );
	}

	private static function sideload_photo_to_media( string $file_id, Client $client ) {
		$gf = $client->get_file( array( 'file_id' => $file_id ) );
		if ( ! is_array( $gf ) || empty( $gf['ok'] ) || empty( $gf['result']['file_path'] ) ) {
			return new \WP_Error( 'getfile', __( 'دریافت فایل از بله ناموفق بود.', 'webino-dashboard' ) );
		}
		$url = $client->get_file_download_url( (string) $gf['result']['file_path'] );
		if ( ! function_exists( 'download_url' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}
		$tmp = download_url( $url );
		if ( is_wp_error( $tmp ) ) {
			return $tmp;
		}
		$file_array = array(
			'name'     => 'bale-' . sanitize_file_name( $file_id ) . '.jpg',
			'tmp_name' => $tmp,
		);
		$att_id = media_handle_sideload( $file_array, 0 );
		if ( is_wp_error( $att_id ) ) {
			@unlink( $tmp );
			return $att_id;
		}
		return $att_id;
	}

	private static function send_coupon_type_keyboard( string $chat_id, Client $client ): void {
		$kbd = wp_json_encode(
			array(
				'inline_keyboard' => array(
					array(
						array( 'text' => __( 'درصدی', 'webino-dashboard' ), 'callback_data' => self::CB_PREFIX . 'ct:p' ),
						array( 'text' => __( 'مبلغ ثابت سبد', 'webino-dashboard' ), 'callback_data' => self::CB_PREFIX . 'ct:f' ),
					),
					array(
						array( 'text' => __( '❌ لغو', 'webino-dashboard' ), 'callback_data' => self::CB_PREFIX . 'cn' ),
					),
				),
			)
		);
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => __( 'نوع تخفیف را انتخاب کنید، سپس مقدار را بفرستید (عدد):', 'webino-dashboard' ),
				'reply_markup' => $kbd,
			)
		);
	}

	public static function handle_coupon_type_callback( string $chat_id, string $kind, SessionRepository $repo, Client $client ): void {
		$row = $repo->get_by_chat_id( $chat_id );
		$st  = $row && ! empty( $row['current_state'] ) ? (string) $row['current_state'] : '';
		if ( $st !== self::STATE_CP_WAIT_TYPE ) {
			return;
		}
		$type = $kind === 'p' ? 'percent' : 'fixed_cart';
		$repo->merge_temp_data( $chat_id, array( 'cp_type' => $type ) );
		$repo->set_state( $chat_id, self::STATE_CP_AMOUNT );
		$msg = $type === 'percent'
			? __( 'درصد تخفیف را بفرستید. اختیاری: «۱۰ ۳۰» = ۱۰٪ و انقضا بعد از ۳۰ روز.', 'webino-dashboard' )
			: __( 'مبلغ تخفیف سبد را به تومان بفرستید. اختیاری: «۵۰۰۰۰ ۱۴» = مبلغ و روز انقضا.', 'webino-dashboard' );
		self::send_text( $chat_id, $msg, $client );
	}

	private static function save_coupon_from_session( string $chat_id, SessionRepository $repo, Client $client ): void {
		$d = $repo->get_temp_data( $chat_id );
		$repo->set_state( $chat_id, null );

		$code = isset( $d['cp_code'] ) ? (string) $d['cp_code'] : '';
		$type = isset( $d['cp_type'] ) ? (string) $d['cp_type'] : '';
		if ( $code === '' || ! in_array( $type, array( 'percent', 'fixed_cart' ), true ) ) {
			self::send_text( $chat_id, __( 'دادهٔ کوپن ناقص است. دوباره از منو شروع کنید.', 'webino-dashboard' ), $client );
			self::send_main_menu( $chat_id, $client );
			return;
		}
		$amount = isset( $d['cp_amount'] ) ? (float) $d['cp_amount'] : 0;
		if ( $amount <= 0 ) {
			self::send_text( $chat_id, __( 'مقدار نامعتبر است.', 'webino-dashboard' ), $client );
			self::send_main_menu( $chat_id, $client );
			return;
		}
		$days = isset( $d['cp_days'] ) ? (int) $d['cp_days'] : 0;

		$c = new \WC_Coupon();
		$c->set_code( $code );
		$c->set_discount_type( $type );
		$c->set_amount( (string) $amount );
		$c->set_individual_use( true );
		if ( $days > 0 ) {
			$c->set_date_expires( strtotime( '+' . $days . ' days', current_time( 'timestamp' ) ) );
		}
		$c->save();
		self::send_text(
			$chat_id,
			sprintf(
				/* translators: %s: coupon code */
				__( 'کد تخفیف «%s» ایجاد شد.', 'webino-dashboard' ),
				$code
			),
			$client
		);
		self::send_main_menu( $chat_id, $client );
	}

	private static function handle_dm_target( string $chat_id, string $text, SessionRepository $repo, Client $client ): void {
		$text = trim( $text );
		$repo->merge_temp_data( $chat_id, array( 'dm_target' => $text ) );
		$repo->set_state( $chat_id, self::STATE_DM_BODY );
		self::send_text( $chat_id, __( 'متن پیام را بفرستید:', 'webino-dashboard' ), $client );
	}

	private static function send_dm_message( string $chat_id, string $text, SessionRepository $repo, Client $client ): void {
		$d      = $repo->get_temp_data( $chat_id );
		$target = isset( $d['dm_target'] ) ? trim( (string) $d['dm_target'] ) : '';
		$repo->set_state( $chat_id, null );

		if ( $target === '' ) {
			self::send_text( $chat_id, __( 'هدف نامشخص است.', 'webino-dashboard' ), $client );
			self::send_main_menu( $chat_id, $client );
			return;
		}

		$dest_chat = '';
		if ( ctype_digit( $target ) ) {
			$uid = absint( $target );
			$ch  = get_user_meta( $uid, 'woobale_chat_id', true );
			if ( $ch ) {
				$dest_chat = (string) $ch;
			} else {
				$dest_chat = $target;
			}
		} else {
			$dest_chat = $target;
		}

		$res = OutboundMessenger::send_text_to_chat( $dest_chat, wp_kses_post( $text ) );
		if ( ! empty( $res['ok'] ) ) {
			self::send_text( $chat_id, __( 'پیام ارسال شد.', 'webino-dashboard' ), $client );
		} else {
			$err = isset( $res['error'] ) ? (string) $res['error'] : __( 'خطا در ارسال.', 'webino-dashboard' );
			self::send_text( $chat_id, $err, $client );
		}
		self::send_main_menu( $chat_id, $client );
	}

	private static function start_broadcast( string $chat_id, string $text, Client $client ): void {
		if ( ! Plugin::has_feature( 'text_broadcast' ) ) {
			self::send_text( $chat_id, __( 'همگانی متن در این پلن فعال نیست.', 'webino-dashboard' ), $client );
			self::send_main_menu( $chat_id, $client );
			return;
		}
		$r = BroadcastQueue::start(
			array(
				'type' => OutboundMessenger::TYPE_TEXT,
				'text' => wp_kses_post( $text ),
			)
		);
		if ( ! empty( $r['ok'] ) ) {
			self::send_text( $chat_id, __( 'صف همگانی شروع شد. پیشرفت در پس‌زمینه انجام می‌شود.', 'webino-dashboard' ), $client );
		} else {
			$e = isset( $r['error'] ) ? (string) $r['error'] : __( 'خطا در شروع همگانی.', 'webino-dashboard' );
			self::send_text( $chat_id, $e, $client );
		}
		self::send_main_menu( $chat_id, $client );
	}

	private static function sync_channel_product( string $chat_id, string $text, SessionRepository $repo, Client $client ): void {
		$repo->set_state( $chat_id, null );
		if ( ! ctype_digit( trim( $text ) ) ) {
			self::send_text( $chat_id, __( 'شناسهٔ محصول عددی نیست.', 'webino-dashboard' ), $client );
			self::send_main_menu( $chat_id, $client );
			return;
		}
		$pid = absint( $text );
		$res = ProductChannelSync::instance()->sync_product_to_channel( $pid );
		if ( is_wp_error( $res ) ) {
			self::send_text( $chat_id, $res->get_error_message(), $client );
		} else {
			self::send_text( $chat_id, __( 'همگام‌سازی با کانال انجام شد (یا بدون تغییر).', 'webino-dashboard' ), $client );
		}
		self::send_main_menu( $chat_id, $client );
	}

	public static function handle_callback( string $data, string $user_chat, Client $client ): void {
		if ( ! AdminGate::is_admin_chat( $user_chat ) ) {
			return;
		}
		if ( strpos( $data, self::CB_PREFIX ) !== 0 ) {
			return;
		}
		$rest = substr( $data, strlen( self::CB_PREFIX ) );
		self::dispatch_admin_rest( $user_chat, $rest, $client );
	}

	/**
	 * Text from reply keyboard (main admin menu). Returns true if handled.
	 */
	public static function handle_main_menu_text( string $chat_id, string $text, Client $client ): bool {
		if ( ! AdminGate::is_admin_chat( $chat_id ) ) {
			return false;
		}
		foreach ( self::main_menu_label_to_rest() as $label => $rest ) {
			if ( $text === $label ) {
				self::dispatch_admin_rest( $chat_id, $rest, $client );
				return true;
			}
		}
		return false;
	}

	/**
	 * @return array<string, string> label => rest (without am: prefix)
	 */
	private static function main_menu_label_to_rest(): array {
		$rows = self::main_menu_keyboard_rows();
		$out  = array();
		foreach ( $rows as $pair ) {
			$out[ $pair[0] ] = $pair[1];
		}
		return $out;
	}

	/**
	 * @return list<array{0: string, 1: string}> [ label, rest ]
	 */
	private static function main_menu_keyboard_rows(): array {
		return array(
			array( __( '📦 سفارش‌ها', 'webino-dashboard' ), 'or:0' ),
			array( __( '➕ محصول', 'webino-dashboard' ), 'np' ),
			array( __( '🏷 کد تخفیف', 'webino-dashboard' ), 'nc' ),
			array( __( '✉️ پیام به کاربر', 'webino-dashboard' ), 'dm' ),
			array( __( '📣 همگانی', 'webino-dashboard' ), 'bc' ),
			array( __( '📢 کانال', 'webino-dashboard' ), 'cs' ),
			array( __( '🔐 جوین اجباری', 'webino-dashboard' ), 'fj' ),
			array( __( '📊 گزارش فروش', 'webino-dashboard' ), 'rpt' ),
			array( __( '📦 موجودی کم', 'webino-dashboard' ), 'stk' ),
		);
	}

	public static function main_menu_reply_markup(): string {
		$keyboard = array();
		$spec     = array(
			array( __( '📦 سفارش‌ها', 'webino-dashboard' ), __( '➕ محصول', 'webino-dashboard' ) ),
			array( __( '🏷 کد تخفیف', 'webino-dashboard' ), __( '✉️ پیام به کاربر', 'webino-dashboard' ) ),
			array( __( '📣 همگانی', 'webino-dashboard' ), __( '📢 کانال', 'webino-dashboard' ) ),
			array( __( '🔐 جوین اجباری', 'webino-dashboard' ), __( '📊 گزارش فروش', 'webino-dashboard' ) ),
			array( __( '📦 موجودی کم', 'webino-dashboard' ) ),
		);
		foreach ( $spec as $row ) {
			$r = array();
			foreach ( $row as $label ) {
				$r[] = array( 'text' => $label );
			}
			$keyboard[] = $r;
		}
		return wp_json_encode(
			array(
				'keyboard'          => $keyboard,
				'resize_keyboard'   => true,
			)
		);
	}

	private static function dispatch_admin_rest( string $user_chat, string $rest, Client $client ): void {
		$repo = new SessionRepository();

		if ( $rest === 'h' ) {
			self::send_main_menu( $user_chat, $client );
			return;
		}
		if ( $rest === 'cn' ) {
			$repo->set_state( $user_chat, null );
			self::send_text( $user_chat, __( 'عملیات لغو شد.', 'webino-dashboard' ), $client );
			self::send_main_menu( $user_chat, $client );
			return;
		}

		if ( strpos( $rest, 'or:' ) === 0 ) {
			$page = max( 0, absint( substr( $rest, 3 ) ) );
			self::send_orders_page( $user_chat, $page, $client );
			return;
		}
		if ( strpos( $rest, 'od:' ) === 0 ) {
			$oid = absint( substr( $rest, 3 ) );
			self::send_order_detail( $user_chat, $oid, $client );
			return;
		}
		if ( strpos( $rest, 'ss:' ) === 0 ) {
			$sub = substr( $rest, 3 );
			$pos = strrpos( $sub, ':' );
			if ( $pos === false ) {
				return;
			}
			$oid    = absint( substr( $sub, 0, $pos ) );
			$letter = substr( $sub, $pos + 1 );
			self::set_order_status( $user_chat, $oid, $letter, $client );
			return;
		}
		if ( $rest === 'np' ) {
			$repo->set_state( $user_chat, self::STATE_P_TITLE );
			$repo->merge_temp_data( $user_chat, array() );
			self::send_text( $user_chat, __( 'نام محصول را بفرستید:', 'webino-dashboard' ), $client );
			return;
		}
		if ( $rest === 'nc' ) {
			$repo->set_state( $user_chat, self::STATE_CP_CODE );
			self::send_text( $user_chat, __( 'کد تخفیف را وارد کنید (فقط حروف/اعداد لاتین):', 'webino-dashboard' ), $client );
			return;
		}
		if ( strpos( $rest, 'ct:' ) === 0 ) {
			$kind = substr( $rest, 3 );
			if ( $kind === 'p' || $kind === 'f' ) {
				self::handle_coupon_type_callback( $user_chat, $kind, $repo, $client );
			}
			return;
		}
		if ( $rest === 'dm' ) {
			$repo->set_state( $user_chat, self::STATE_DM_TARGET );
			self::send_text(
				$user_chat,
				__( 'شناسهٔ کاربر وردپرس یا chat_id بله گیرنده را بفرستید:', 'webino-dashboard' ),
				$client
			);
			return;
		}
		if ( $rest === 'bc' ) {
			$repo->set_state( $user_chat, self::STATE_BC_BODY );
			self::send_text( $user_chat, __( 'متن پیام همگانی را بفرستید:', 'webino-dashboard' ), $client );
			return;
		}
		if ( $rest === 'cs' ) {
			$repo->set_state( $user_chat, self::STATE_CH_PID );
			self::send_text( $user_chat, __( 'شناسهٔ محصول (عدد) برای انتشار در کانال:', 'webino-dashboard' ), $client );
			return;
		}
		if ( $rest === 'fj' ) {
			self::send_force_join_panel( $user_chat, $client );
			return;
		}
		if ( $rest === 'rpt' ) {
			$text = class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false )
				? \Webino_Dashboard_Bots_Admin_Ops::sales_report( 'today' )
				: __( 'گزارش در دسترس نیست.', 'webino-dashboard' );
			$kbd  = wp_json_encode(
				array(
					'inline_keyboard' => array(
						array(
							array( 'text' => __( 'امروز', 'webino-dashboard' ), 'callback_data' => 'arpt:today' ),
							array( 'text' => __( '۷ روز', 'webino-dashboard' ), 'callback_data' => 'arpt:7d' ),
						),
						array(
							array( 'text' => __( '۳۰ روز', 'webino-dashboard' ), 'callback_data' => 'arpt:30d' ),
							array( 'text' => __( 'ماه جاری', 'webino-dashboard' ), 'callback_data' => 'arpt:month' ),
						),
					),
				)
			);
			$client->send_message(
				array(
					'chat_id'      => $user_chat,
					'text'         => $text,
					'reply_markup' => $kbd,
				)
			);
			return;
		}
		if ( $rest === 'stk' ) {
			$text = class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false )
				? \Webino_Dashboard_Bots_Admin_Ops::low_stock_list()
				: __( 'موجودی در دسترس نیست.', 'webino-dashboard' );
			self::send_text( $user_chat, $text, $client );
			return;
		}
		if ( strpos( $rest, 'fe:' ) === 0 ) {
			$on = substr( $rest, 3 ) === '1';
			$s  = Plugin::get_settings();
			$s['force_join_enabled'] = $on ? '1' : '0';
			Plugin::update_settings( $s );
			self::send_text( $user_chat, $on ? __( 'جوین اجباری فعال شد.', 'webino-dashboard' ) : __( 'جوین اجباری غیرفعال شد.', 'webino-dashboard' ), $client );
			self::send_force_join_panel( $user_chat, $client );
			return;
		}
		if ( $rest === 'fjm' ) {
			$repo->set_state( $user_chat, self::STATE_FJ_MSG );
			self::send_text( $user_chat, __( 'متن جدید پیام جوین اجباری را بفرستید:', 'webino-dashboard' ), $client );
			return;
		}
		if ( $rest === 'fjc' ) {
			$repo->set_state( $user_chat, self::STATE_FJ_CID );
			self::send_text( $user_chat, __( 'شناسهٔ کانال (مثلاً @channel یا ID عددی) را بفرستید:', 'webino-dashboard' ), $client );
			return;
		}
		if ( $rest === 'fjl' ) {
			$repo->set_state( $user_chat, self::STATE_FJ_LINK );
			self::send_text( $user_chat, __( 'لینک عضویت کانال را بفرستید:', 'webino-dashboard' ), $client );
			return;
		}
		if ( strpos( $rest, 'py:' ) === 0 ) {
			if ( substr( $rest, 3 ) === '1' ) {
				$row = $repo->get_by_chat_id( $user_chat );
				$st  = $row && ! empty( $row['current_state'] ) ? (string) $row['current_state'] : '';
				if ( $st === self::STATE_P_CONFIRM ) {
					self::save_product_from_session( $user_chat, $repo, $client );
				}
			}
			return;
		}
	}

	private static function set_order_status( string $chat_id, int $order_id, string $letter, Client $client ): void {
		$map = self::status_letter_map();
		if ( ! isset( $map[ $letter ] ) ) {
			return;
		}
		$status = $map[ $letter ];
		$o      = wc_get_order( $order_id );
		if ( ! $o ) {
			self::send_text( $chat_id, __( 'سفارش یافت نشد.', 'webino-dashboard' ), $client );
			return;
		}
		$o->update_status( $status, __( 'تغییر از پنل بازوی ادمین', 'webino-dashboard' ), true );
		self::send_text( $chat_id, __( 'وضعیت سفارش به‌روز شد.', 'webino-dashboard' ), $client );
		self::send_order_detail( $chat_id, $order_id, $client );
	}

	/**
	 * @return array<string, string>
	 */
	private static function status_letter_map(): array {
		return array(
			'n' => 'pending',
			'g' => 'processing',
			'h' => 'on-hold',
			'd' => 'completed',
			'c' => 'cancelled',
			'r' => 'refunded',
			'f' => 'failed',
		);
	}

	private static function send_orders_page( string $chat_id, int $page, Client $client ): void {
		$per  = 5;
		$list = wc_get_orders(
			array(
				'limit'   => $per,
				'page'    => $page + 1,
				'orderby' => 'date',
				'order'   => 'DESC',
				'return'  => 'objects',
			)
		);
		$lines = array( __( '📦 سفارش‌ها:', 'webino-dashboard' ) );
		$rows  = array();
		foreach ( $list as $o ) {
			if ( ! $o instanceof \WC_Order ) {
				continue;
			}
			$num = $o->get_order_number();
			$st  = wc_get_order_status_name( $o->get_status() );
			$lines[] = '#' . MoneyFormatter::to_persian_digits( (string) $num ) . ' — ' . $st;
			$rows[]  = array(
				array(
					'text'          => '#' . $num,
					'callback_data' => self::CB_PREFIX . 'od:' . $o->get_id(),
				),
			);
		}
		if ( empty( $list ) ) {
			$lines[] = __( 'سفارشی نیست.', 'webino-dashboard' );
		}
		$nav = array();
		if ( $page > 0 ) {
			$nav[] = array(
				'text'          => __( '◀ قبلی', 'webino-dashboard' ),
				'callback_data' => self::CB_PREFIX . 'or:' . ( $page - 1 ),
			);
		}
		if ( count( $list ) >= $per ) {
			$nav[] = array(
				'text'          => __( 'بعدی ▶', 'webino-dashboard' ),
				'callback_data' => self::CB_PREFIX . 'or:' . ( $page + 1 ),
			);
		}
		if ( ! empty( $nav ) ) {
			$rows[] = $nav;
		}
		$rows[] = array(
			array(
				'text'          => __( '🏠 منوی ادمین', 'webino-dashboard' ),
				'callback_data' => self::CB_PREFIX . 'h',
			),
		);
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => implode( "\n", $lines ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	private static function send_order_detail( string $chat_id, int $order_id, Client $client ): void {
		$o = wc_get_order( $order_id );
		if ( ! $o ) {
			self::send_text( $chat_id, __( 'سفارش یافت نشد.', 'webino-dashboard' ), $client );
			return;
		}
		$lines   = array();
		$lines[] = __( 'سفارش #', 'webino-dashboard' ) . MoneyFormatter::to_persian_digits( (string) $o->get_order_number() );
		$lines[] = __( 'وضعیت:', 'webino-dashboard' ) . ' ' . wc_get_order_status_name( $o->get_status() );
		$lines[] = __( 'مبلغ:', 'webino-dashboard' ) . ' ' . wp_strip_all_tags( $o->get_formatted_order_total() );
		$lines[] = __( 'مشتری:', 'webino-dashboard' ) . ' ' . $o->get_billing_first_name() . ' ' . $o->get_billing_last_name();
		$lines[] = __( 'تلفن:', 'webino-dashboard' ) . ' ' . $o->get_billing_phone();

		$st_row = array();
		$labels = array(
			'n' => __( 'در انتظار', 'webino-dashboard' ),
			'g' => __( 'در حال پردازش', 'webino-dashboard' ),
			'h' => __( 'معلق', 'webino-dashboard' ),
			'd' => __( 'تکمیل', 'webino-dashboard' ),
			'c' => __( 'لغو', 'webino-dashboard' ),
			'r' => __( 'بازپرداخت', 'webino-dashboard' ),
			'f' => __( 'ناموفق', 'webino-dashboard' ),
		);
		foreach ( $labels as $letter => $label ) {
			$st_row[] = array(
				'text'          => $label,
				'callback_data' => self::CB_PREFIX . 'ss:' . $order_id . ':' . $letter,
			);
		}
		$chunks = array_chunk( $st_row, 3 );
		$kbd    = $chunks;
		$kbd[]  = array(
			array(
				'text'          => __( '🔙 لیست سفارش‌ها', 'webino-dashboard' ),
				'callback_data' => self::CB_PREFIX . 'or:0',
			),
			array(
				'text'          => __( '🏠 منو', 'webino-dashboard' ),
				'callback_data' => self::CB_PREFIX . 'h',
			),
		);
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => implode( "\n", $lines ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $kbd ) ),
			)
		);
	}

	private static function send_force_join_panel( string $chat_id, Client $client ): void {
		$s     = Plugin::get_settings();
		$on    = ! empty( $s['force_join_enabled'] ) && $s['force_join_enabled'] !== '0';
		$lines = array(
			__( 'تنظیمات جوین اجباری:', 'webino-dashboard' ),
			__( 'وضعیت:', 'webino-dashboard' ) . ' ' . ( $on ? __( 'فعال', 'webino-dashboard' ) : __( 'غیرفعال', 'webino-dashboard' ) ),
			__( 'کانال:', 'webino-dashboard' ) . ' ' . ( isset( $s['force_join_channel_id'] ) ? (string) $s['force_join_channel_id'] : '' ),
			__( 'لینک:', 'webino-dashboard' ) . ' ' . ( isset( $s['force_join_channel_link'] ) ? (string) $s['force_join_channel_link'] : '' ),
		);
		$kbd = array(
			array(
				array(
					'text'          => $on ? __( '⏹ غیرفعال کردن', 'webino-dashboard' ) : __( '▶️ فعال کردن', 'webino-dashboard' ),
					'callback_data' => self::CB_PREFIX . 'fe:' . ( $on ? '0' : '1' ),
				),
			),
			array(
				array(
					'text'          => __( '✏️ ویرایش متن پیام', 'webino-dashboard' ),
					'callback_data' => self::CB_PREFIX . 'fjm',
				),
			),
			array(
				array(
					'text'          => __( '🆔 شناسه کانال', 'webino-dashboard' ),
					'callback_data' => self::CB_PREFIX . 'fjc',
				),
				array(
					'text'          => __( '🔗 لینک کانال', 'webino-dashboard' ),
					'callback_data' => self::CB_PREFIX . 'fjl',
				),
			),
			array(
				array(
					'text'          => __( '🏠 منو', 'webino-dashboard' ),
					'callback_data' => self::CB_PREFIX . 'h',
				),
			),
		);
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => implode( "\n", $lines ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $kbd ) ),
			)
		);
	}

	public static function send_main_menu( string $chat_id, Client $client ): void {
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => __( 'پنل مدیریت — یک گزینه را انتخاب کنید:', 'webino-dashboard' ),
				'reply_markup' => self::main_menu_reply_markup(),
			)
		);
	}

	private static function send_text( string $chat_id, string $text, Client $client ): void {
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => $text,
			)
		);
	}

	private static function parse_positive_float( string $text ): ?float {
		$t = str_replace( array( '،', ',' ), '.', trim( $text ) );
		if ( ! is_numeric( $t ) ) {
			return null;
		}
		$f = (float) $t;
		return $f >= 0 ? $f : null;
	}
}
