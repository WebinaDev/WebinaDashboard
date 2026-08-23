<?php
/**
 * Shared loyalty / referral / block helpers for shop bots.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Points, referral rewards, and user block flags for Bale/Telegram bots.
 */
final class Webino_Dashboard_Bots_Loyalty {

	const META_POINTS   = '_webino_bot_loyalty_points';
	const META_REFERRER = '_webino_bot_referred_by';
	const META_BLOCKED  = '_webino_bot_blocked';
	const OPTION_KEY    = 'webino_dashboard_bots_loyalty';

	/**
	 * @return array<string, mixed>
	 */
	public static function settings() {
		$defaults = array(
			'enabled'                 => '0',
			'points_per_order'        => 10,
			'points_per_currency'     => 0,
			'first_order_bonus'       => 0,
			'referral_enabled'        => '0',
			'referral_points'         => 50,
			'referral_coupon_prefix'  => 'REF',
			'referral_coupon_amount'  => 0,
			'min_order_amount'        => 0,
			'webapp_base_url'         => '',
			'redeem_points'           => 100,
			'redeem_coupon_amount'    => 10,
			'welcome_coupon_amount'   => 0,
			'inactive_nudge_days'     => 30,
			'tiers'                   => array(
				array( 'id' => 'bronze', 'label' => 'برنز', 'min' => 0 ),
				array( 'id' => 'silver', 'label' => 'نقره', 'min' => 100 ),
				array( 'id' => 'gold', 'label' => 'طلا', 'min' => 300 ),
				array( 'id' => 'platinum', 'label' => 'پلاتین', 'min' => 600 ),
				array( 'id' => 'diamond', 'label' => 'الماس', 'min' => 1000 ),
			),
			'checkout_fields'         => array(
				'national_id' => array( 'enabled' => '0', 'required' => '0' ),
				'company'     => array( 'enabled' => '0', 'required' => '0' ),
			),
		);
		$raw = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		$out = array_merge( $defaults, $raw );
		if ( isset( $raw['checkout_fields'] ) && is_array( $raw['checkout_fields'] ) ) {
			$out['checkout_fields'] = array_merge( $defaults['checkout_fields'], $raw['checkout_fields'] );
		}
		return $out;
	}

	/**
	 * @param array<string, mixed> $input Settings.
	 * @return array<string, mixed>
	 */
	public static function save_settings( $input ) {
		$cur = self::settings();
		if ( ! is_array( $input ) ) {
			return $cur;
		}
		foreach ( array( 'enabled', 'referral_enabled' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = ! empty( $input[ $f ] ) && '0' !== (string) $input[ $f ] ? '1' : '0';
			}
		}
		foreach ( array( 'points_per_order', 'points_per_currency', 'referral_points', 'referral_coupon_amount', 'min_order_amount', 'first_order_bonus', 'redeem_points', 'redeem_coupon_amount', 'welcome_coupon_amount', 'inactive_nudge_days' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = max( 0, (float) $input[ $f ] );
			}
		}
		if ( isset( $input['referral_coupon_prefix'] ) ) {
			$cur['referral_coupon_prefix'] = sanitize_text_field( (string) $input['referral_coupon_prefix'] );
		}
		if ( isset( $input['webapp_base_url'] ) ) {
			$cur['webapp_base_url'] = esc_url_raw( (string) $input['webapp_base_url'] );
		}
		if ( isset( $input['checkout_fields'] ) && is_array( $input['checkout_fields'] ) ) {
			foreach ( array( 'national_id', 'company' ) as $field ) {
				if ( ! isset( $input['checkout_fields'][ $field ] ) || ! is_array( $input['checkout_fields'][ $field ] ) ) {
					continue;
				}
				$row = $input['checkout_fields'][ $field ];
				$cur['checkout_fields'][ $field ] = array(
					'enabled'  => ! empty( $row['enabled'] ) && '0' !== (string) $row['enabled'] ? '1' : '0',
					'required' => ! empty( $row['required'] ) && '0' !== (string) $row['required'] ? '1' : '0',
				);
			}
		}
		update_option( self::OPTION_KEY, $cur, false );
		return $cur;
	}

	/**
	 * @param int $user_id User ID.
	 * @return int
	 */
	public static function get_points( $user_id ) {
		return max( 0, (int) get_user_meta( (int) $user_id, self::META_POINTS, true ) );
	}

	/**
	 * @param int $user_id User ID.
	 * @param int $delta Delta.
	 * @return int
	 */
	public static function add_points( $user_id, $delta ) {
		$user_id = (int) $user_id;
		$delta   = (int) $delta;
		$cur     = self::get_points( $user_id );
		$next    = max( 0, $cur + $delta );
		update_user_meta( $user_id, self::META_POINTS, $next );
		return $next;
	}

	/**
	 * @param int $user_id User ID.
	 * @return bool
	 */
	public static function is_blocked( $user_id ) {
		return '1' === (string) get_user_meta( (int) $user_id, self::META_BLOCKED, true );
	}

	/**
	 * @param int  $user_id User ID.
	 * @param bool $blocked Blocked.
	 * @return void
	 */
	public static function set_blocked( $user_id, $blocked ) {
		update_user_meta( (int) $user_id, self::META_BLOCKED, $blocked ? '1' : '0' );
	}

	/**
	 * Award points for a completed bot order.
	 *
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function maybe_award_order( $order ) {
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] ) {
			return;
		}
		if ( ! $order || ! is_a( $order, 'WC_Order' ) ) {
			return;
		}
		if ( '1' !== (string) $order->get_meta( '_woobale_source' ) ) {
			return;
		}
		if ( '1' === (string) $order->get_meta( '_webino_bot_loyalty_awarded' ) ) {
			return;
		}
		$uid = (int) $order->get_user_id();
		if ( $uid < 1 ) {
			return;
		}
		$pts = (int) $s['points_per_order'];
		$per = (float) $s['points_per_currency'];
		if ( $per > 0 ) {
			$pts += (int) floor( (float) $order->get_total() / $per );
		}
		$bonus = (int) $s['first_order_bonus'];
		if ( $bonus > 0 && self::is_first_completed_order( $uid, (int) $order->get_id() ) ) {
			$pts += $bonus;
		}
		if ( $pts > 0 ) {
			self::add_points( $uid, $pts );
		}
		$order->update_meta_data( '_webino_bot_loyalty_awarded', '1' );
		$order->save();
	}

	/**
	 * True when this is the customer's first completed order (excluding current if already completed elsewhere).
	 *
	 * @param int $user_id  User ID.
	 * @param int $order_id Current order ID.
	 * @return bool
	 */
	private static function is_first_completed_order( $user_id, $order_id ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return false;
		}
		$prev = wc_get_orders(
			array(
				'customer_id' => (int) $user_id,
				'status'      => array( 'wc-completed' ),
				'limit'       => 2,
				'return'      => 'ids',
				'exclude'     => array( (int) $order_id ),
			)
		);
		return empty( $prev );
	}

	/**
	 * Issue a one-time welcome coupon after first bot link / login.
	 *
	 * @param int $user_id User ID.
	 * @return string Coupon code or empty.
	 */
	public static function maybe_welcome_coupon( $user_id ) {
		$user_id = (int) $user_id;
		if ( $user_id < 1 ) {
			return '';
		}
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] ) {
			return '';
		}
		$amount = (float) $s['welcome_coupon_amount'];
		if ( $amount <= 0 ) {
			return '';
		}
		if ( get_user_meta( $user_id, '_webino_bots_welcome_coupon', true ) ) {
			return '';
		}
		if ( ! class_exists( 'WC_Coupon', false ) ) {
			return '';
		}
		$code = 'WELCOME' . $user_id . wp_generate_password( 4, false, false );
		$c    = new WC_Coupon();
		$c->set_code( $code );
		$c->set_discount_type( 'fixed_cart' );
		$c->set_amount( $amount );
		$c->set_usage_limit( 1 );
		$c->set_individual_use( true );
		$c->update_meta_data( '_webino_bot_coupon', '1' );
		$c->update_meta_data( '_webino_bots_welcome', '1' );
		if ( ! $c->save() ) {
			return '';
		}
		update_user_meta( $user_id, '_webino_bots_welcome_coupon', $c->get_code() );
		return $c->get_code();
	}

	/**
	 * Touch last bot activity timestamp for inactive nudges.
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	public static function touch_last_seen( $user_id ) {
		$user_id = (int) $user_id;
		if ( $user_id > 0 ) {
			update_user_meta( $user_id, '_webino_bot_last_seen', time() );
		}
	}

	/**
	 * Nudge users inactive longer than inactive_nudge_days (once).
	 *
	 * @return void
	 */
	public static function run_inactive_nudge_cron() {
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] ) {
			return;
		}
		$days = max( 1, (int) $s['inactive_nudge_days'] );
		$cut  = time() - ( $days * DAY_IN_SECONDS );
		$text = sprintf(
			/* translators: %d: days */
			__( 'مدتی است به فروشگاه سر نزده‌اید (%d روز). منتظر شما هستیم!', 'webino-dashboard' ),
			$days
		);
		foreach ( array( 'woobale_chat_id' => 'bale', 'webino_dashboard_telegram_chat_id' => 'telegram' ) as $meta => $prov ) {
			$users = get_users(
				array(
					'meta_key'     => $meta,
					'meta_compare' => 'EXISTS',
					'number'       => 100,
					'fields'       => 'ID',
				)
			);
			foreach ( (array) $users as $uid ) {
				$uid = (int) $uid;
				if ( $uid < 1 || get_user_meta( $uid, '_webino_bot_inactive_nudged', true ) ) {
					continue;
				}
				$seen = (int) get_user_meta( $uid, '_webino_bot_last_seen', true );
				if ( $seen <= 0 ) {
					$seen = (int) get_user_meta( $uid, 'wc_last_active', true );
				}
				if ( $seen <= 0 || $seen > $cut ) {
					continue;
				}
				$chat = (string) get_user_meta( $uid, $meta, true );
				if ( $chat === '' ) {
					continue;
				}
				$payload = array(
					'chat_id' => $chat,
					'text'    => $text,
				);
				if ( class_exists( 'Webino_Dashboard_Bots_Outbound_Queue', false ) ) {
					Webino_Dashboard_Bots_Outbound_Queue::enqueue_message( $prov, $chat, $payload );
				} else {
					$client = Webino_Dashboard_Bots_Client_Facade::make( $prov );
					if ( $client ) {
						$client->send_message( $payload );
					}
				}
				update_user_meta( $uid, '_webino_bot_inactive_nudged', '1' );
			}
		}
	}

	/**
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public static function maybe_award_order_id( $order_id ) {
		if ( ! function_exists( 'wc_get_order' ) ) {
			return;
		}
		$order = wc_get_order( (int) $order_id );
		if ( $order ) {
			self::maybe_award_order( $order );
		}
	}

	/**
	 * Handle /start payload ref_{user_id}.
	 *
	 * @param int    $new_user_id New WP user.
	 * @param string $start_payload Payload after /start.
	 * @return void
	 */
	public static function maybe_apply_referral( $new_user_id, $start_payload ) {
		$s = self::settings();
		if ( empty( $s['referral_enabled'] ) || '0' === (string) $s['referral_enabled'] ) {
			return;
		}
		$new_user_id = (int) $new_user_id;
		if ( $new_user_id < 1 ) {
			return;
		}
		if ( get_user_meta( $new_user_id, self::META_REFERRER, true ) ) {
			return;
		}
		$payload = trim( (string) $start_payload );
		if ( ! preg_match( '/^ref_(\d+)$/', $payload, $m ) ) {
			return;
		}
		$ref = (int) $m[1];
		if ( $ref < 1 || $ref === $new_user_id || ! get_userdata( $ref ) ) {
			return;
		}
		update_user_meta( $new_user_id, self::META_REFERRER, $ref );
		$pts = (int) $s['referral_points'];
		if ( $pts > 0 ) {
			self::add_points( $ref, $pts );
		}
		$amount = (float) $s['referral_coupon_amount'];
		if ( $amount > 0 && class_exists( 'WC_Coupon', false ) ) {
			$code = sanitize_text_field( (string) $s['referral_coupon_prefix'] ) . $new_user_id . wp_generate_password( 4, false, false );
			$c    = new WC_Coupon();
			$c->set_code( $code );
			$c->set_discount_type( 'fixed_cart' );
			$c->set_amount( $amount );
			$c->set_usage_limit( 1 );
			$c->set_individual_use( true );
			$c->update_meta_data( '_webino_bot_coupon', '1' );
			$c->update_meta_data( '_webino_bot_referral_for', $new_user_id );
			$c->save();
			update_user_meta( $new_user_id, '_webino_bot_referral_coupon', $c->get_code() );
		}
	}

	/**
	 * Deep-link payload for inviting user.
	 *
	 * @param int $user_id User ID.
	 * @return string
	 */
	public static function referral_payload( $user_id ) {
		return 'ref_' . (int) $user_id;
	}

	/**
	 * Top customers by points.
	 *
	 * @param int $limit Limit.
	 * @return list<array{id:int,name:string,points:int}>
	 */
	public static function top_customers( $limit = 20 ) {
		$users = get_users(
			array(
				'meta_key'     => self::META_POINTS,
				'meta_compare' => '>',
				'meta_value'   => '0',
				'number'       => max( 1, (int) $limit ),
				'orderby'      => 'meta_value_num',
				'order'        => 'DESC',
			)
		);
		$out = array();
		foreach ( $users as $u ) {
			if ( ! $u instanceof WP_User ) {
				continue;
			}
			$out[] = array(
				'id'     => (int) $u->ID,
				'name'   => $u->display_name,
				'points' => self::get_points( $u->ID ),
			);
		}
		return $out;
	}

	/**
	 * Min order amount from shared loyalty settings (0 = disabled).
	 *
	 * @return float
	 */
	public static function min_order_amount() {
		$s = self::settings();
		return max( 0.0, (float) $s['min_order_amount'] );
	}

	/**
	 * WebApp URL for product or cart.
	 *
	 * @param string $path Relative path e.g. cart or product/123.
	 * @return string
	 */
	public static function webapp_url( $path = '' ) {
		$s   = self::settings();
		$base = isset( $s['webapp_base_url'] ) ? trim( (string) $s['webapp_base_url'] ) : '';
		if ( $base === '' ) {
			$base = function_exists( 'wc_get_page_permalink' ) ? (string) wc_get_page_permalink( 'shop' ) : home_url( '/' );
		}
		$path = ltrim( (string) $path, '/' );
		return $path !== '' ? trailingslashit( $base ) . $path : $base;
	}

	/**
	 * @param int $user_id User.
	 * @return array{id:string,label:string,min:int}
	 */
	public static function tier_for_user( $user_id ) {
		$pts   = self::get_points( $user_id );
		$s     = self::settings();
		$tiers = isset( $s['tiers'] ) && is_array( $s['tiers'] ) ? $s['tiers'] : array();
		$cur   = array( 'id' => 'bronze', 'label' => 'برنز', 'min' => 0 );
		foreach ( $tiers as $t ) {
			if ( ! is_array( $t ) ) {
				continue;
			}
			$min = isset( $t['min'] ) ? (int) $t['min'] : 0;
			if ( $pts >= $min ) {
				$cur = array(
					'id'    => sanitize_key( (string) ( $t['id'] ?? 'tier' ) ),
					'label' => (string) ( $t['label'] ?? '' ),
					'min'   => $min,
				);
			}
		}
		return $cur;
	}

	/**
	 * Redeem points for a coupon.
	 *
	 * @param int $user_id User.
	 * @return string|\WP_Error
	 */
	public static function redeem_points( $user_id ) {
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] ) {
			return new WP_Error( 'off', __( 'باشگاه غیرفعال است.', 'webino-dashboard' ) );
		}
		$need = max( 1, (int) $s['redeem_points'] );
		$have = self::get_points( $user_id );
		if ( $have < $need ) {
			return new WP_Error( 'points', sprintf( __( 'حداقل %d امتیاز لازم است.', 'webino-dashboard' ), $need ) );
		}
		if ( ! class_exists( 'WC_Coupon', false ) ) {
			return new WP_Error( 'wc', __( 'کوپن در دسترس نیست.', 'webino-dashboard' ) );
		}
		$amount = max( 1, (float) $s['redeem_coupon_amount'] );
		$code   = 'PTS' . (int) $user_id . wp_generate_password( 4, false, false );
		$c      = new WC_Coupon();
		$c->set_code( $code );
		$c->set_discount_type( 'fixed_cart' );
		$c->set_amount( $amount );
		$c->set_usage_limit( 1 );
		$c->update_meta_data( '_webino_bot_coupon', '1' );
		if ( ! $c->save() ) {
			return new WP_Error( 'create', __( 'ساخت کوپن ناموفق.', 'webino-dashboard' ) );
		}
		self::add_points( $user_id, -$need );
		return $c->get_code();
	}

	/**
	 * Store birthday Y-m-d and schedule greeting meta.
	 *
	 * @param int    $user_id User.
	 * @param string $ymd Date.
	 * @return void
	 */
	public static function set_birthday( $user_id, $ymd ) {
		$ymd = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $ymd ) ? $ymd : '';
		if ( $ymd !== '' ) {
			update_user_meta( (int) $user_id, '_webino_bot_birthday', $ymd );
		}
	}

	/**
	 * Daily cron helper: birthday greetings.
	 *
	 * @return void
	 */
	public static function run_birthday_cron() {
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] ) {
			return;
		}
		$today = wp_date( 'm-d' );
		$users = get_users(
			array(
				'meta_key'     => '_webino_bot_birthday',
				'meta_compare' => 'EXISTS',
				'number'       => 200,
				'fields'       => 'ID',
			)
		);
		foreach ( (array) $users as $uid ) {
			$uid = (int) $uid;
			$b   = (string) get_user_meta( $uid, '_webino_bot_birthday', true );
			if ( strlen( $b ) < 10 || substr( $b, 5 ) !== $today ) {
				continue;
			}
			$key = '_webino_bot_bday_' . wp_date( 'Y' );
			if ( get_user_meta( $uid, $key, true ) ) {
				continue;
			}
			self::add_points( $uid, 20 );
			update_user_meta( $uid, $key, '1' );
			$text = __( 'تولدتان مبارک! ۲۰ امتیاز هدیه به حسابتان اضافه شد.', 'webino-dashboard' );
			foreach ( array( 'woobale_chat_id' => 'bale', 'webino_dashboard_telegram_chat_id' => 'telegram' ) as $meta => $prov ) {
				$chat = (string) get_user_meta( $uid, $meta, true );
				if ( $chat === '' ) {
					continue;
				}
				$client = Webino_Dashboard_Bots_Client_Facade::make( $prov );
				if ( $client ) {
					$client->send_message( array( 'chat_id' => $chat, 'text' => $text ) );
				}
			}
		}
	}
}
