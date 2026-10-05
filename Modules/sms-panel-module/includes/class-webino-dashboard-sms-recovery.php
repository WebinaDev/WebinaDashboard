<?php
/**
 * SMS recovery / welcome coupons and abandoned cart/order crons.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds one-time coupons for recovery SMS events and runs abandonment crons.
 */
final class Webino_Dashboard_Sms_Recovery {

	const CRON_HOOK = 'webino_dashboard_sms_recovery_cron';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'user_register', array( __CLASS__, 'on_user_register' ), 20, 1 );
		add_action( 'woocommerce_created_customer', array( __CLASS__, 'on_user_register' ), 20, 1 );
		add_action( self::CRON_HOOK, array( __CLASS__, 'run_cron' ) );
		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'hourly', self::CRON_HOOK );
		}
	}

	/**
	 * Default recovery block stored under shop SMS settings.recovery.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	public static function default_recovery_settings() {
		$coupon = array(
			'enabled'     => false,
			'type'        => 'percent',
			'amount'      => 10,
			'expires_days'=> 7,
			'usage_limit' => 1,
		);
		return array(
			'cart-abandoned'  => array_merge(
				array( 'delay_hours' => 24 ),
				$coupon
			),
			'order-abandoned' => array_merge(
				array( 'delay_hours' => 24 ),
				$coupon
			),
			'cancelled'       => $coupon,
			'failed'          => $coupon,
			'user-welcome'    => $coupon,
		);
	}

	/**
	 * Merge recovery defaults into shop settings array.
	 *
	 * @param array<string,mixed> $settings Shop SMS settings.
	 * @return array<string,mixed>
	 */
	public static function merge_into_shop_settings( array $settings ) {
		$defaults = self::default_recovery_settings();
		$stored   = isset( $settings['recovery'] ) && is_array( $settings['recovery'] ) ? $settings['recovery'] : array();
		$out      = array();
		foreach ( $defaults as $key => $def ) {
			$row = isset( $stored[ $key ] ) && is_array( $stored[ $key ] ) ? $stored[ $key ] : array();
			$out[ $key ] = array(
				'delay_hours'  => isset( $row['delay_hours'] ) ? max( 1, min( 720, (int) $row['delay_hours'] ) ) : (int) ( $def['delay_hours'] ?? 24 ),
				'enabled'      => ! empty( $row['enabled'] ),
				'type'         => in_array( (string) ( $row['type'] ?? $def['type'] ), array( 'percent', 'fixed_cart' ), true )
					? (string) ( $row['type'] ?? $def['type'] )
					: 'percent',
				'amount'       => isset( $row['amount'] ) ? max( 0, (float) $row['amount'] ) : (float) $def['amount'],
				'expires_days' => isset( $row['expires_days'] ) ? max( 1, min( 365, (int) $row['expires_days'] ) ) : (int) $def['expires_days'],
				'usage_limit'  => isset( $row['usage_limit'] ) ? max( 1, min( 100, (int) $row['usage_limit'] ) ) : (int) $def['usage_limit'],
			);
			if ( ! isset( $def['delay_hours'] ) ) {
				unset( $out[ $key ]['delay_hours'] );
			}
		}
		$settings['recovery'] = $out;
		return $settings;
	}

	/**
	 * Extra SMS shortcodes (price amount + recovery coupon fields).
	 *
	 * @return array<int,array{key:string,label:string,scope:string}>
	 */
	public static function extra_shortcodes() {
		return array(
			array( 'key' => 'total_amount', 'label' => 'مبلغ سفارش بدون واحد', 'scope' => 'order' ),
			array( 'key' => 'price_amount', 'label' => 'مبلغ سفارش بدون واحد', 'scope' => 'order' ),
			array( 'key' => 'coupon_amount', 'label' => 'مقدار تخفیف', 'scope' => 'recovery' ),
			array( 'key' => 'coupon_type', 'label' => 'نوع تخفیف', 'scope' => 'recovery' ),
			array( 'key' => 'coupon_type_label', 'label' => 'برچسب نوع تخفیف', 'scope' => 'recovery' ),
			array( 'key' => 'coupon_expires', 'label' => 'تاریخ انقضای کدتخفیف', 'scope' => 'recovery' ),
			array( 'key' => 'coupon_expires_days', 'label' => 'اعتبار کدتخفیف (روز)', 'scope' => 'recovery' ),
			array( 'key' => 'coupon_usage_limit', 'label' => 'حد مصرف کدتخفیف', 'scope' => 'recovery' ),
			array( 'key' => 'coupon_discount_text', 'label' => 'متن تخفیف', 'scope' => 'recovery' ),
		);
	}

	/**
	 * Merge extra shortcodes into a CRM/dashboard shortcode list.
	 *
	 * @param mixed $shortcodes Existing list.
	 * @return array<int,array<string,mixed>>
	 */
	public static function merge_shortcodes( $shortcodes ) {
		$by_key = array();
		if ( is_array( $shortcodes ) ) {
			foreach ( $shortcodes as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$key = sanitize_key( (string) ( $row['key'] ?? '' ) );
				if ( '' === $key ) {
					continue;
				}
				$by_key[ $key ] = $row;
			}
		}
		foreach ( self::extra_shortcodes() as $row ) {
			$key = $row['key'];
			if ( ! isset( $by_key[ $key ] ) ) {
				$by_key[ $key ] = $row;
			}
		}
		return array_values( $by_key );
	}

	/**
	 * Load recovery config for an event (from CRM shop settings cache when possible).
	 *
	 * @param string $event_key Event key.
	 * @return array<string,mixed>
	 */
	public static function config_for_event( $event_key ) {
		$event_key = sanitize_key( (string) $event_key );
		$defaults  = self::default_recovery_settings();
		$def       = $defaults[ $event_key ] ?? array(
			'enabled'      => false,
			'type'         => 'percent',
			'amount'       => 0,
			'expires_days' => 7,
			'usage_limit'  => 1,
		);

		$recovery = array();
		if ( class_exists( 'Webino_Dashboard_License', false ) ) {
			$license = Webino_Dashboard_License::instance();
			if ( $license->is_license_active( false ) ) {
				$domain    = $license->get_current_domain();
				$cache_key = 'webino_sms_shop_settings_' . md5( (string) $domain );
				$cached    = get_transient( $cache_key );
				if ( is_array( $cached ) && isset( $cached['settings']['recovery'] ) && is_array( $cached['settings']['recovery'] ) ) {
					$recovery = $cached['settings']['recovery'];
				} else {
					$res = $license->crm_get( 'wp-json/webinocrm/v1/modirpayamak/settings/shop', array(), array( 'timeout' => 8 ) );
					if ( ! empty( $res['ok'] ) && is_array( $res['data']['settings'] ?? null ) ) {
						$settings = self::merge_into_shop_settings( $res['data']['settings'] );
						$recovery = $settings['recovery'];
					}
				}
			}
		}

		$row = isset( $recovery[ $event_key ] ) && is_array( $recovery[ $event_key ] ) ? $recovery[ $event_key ] : array();
		return array_merge( $def, $row );
	}

	/**
	 * Attach a one-time coupon to the snapshot when recovery coupon is enabled.
	 *
	 * @param string              $event_key Event.
	 * @param array<string,mixed> $snapshot Snapshot.
	 * @return array<string,mixed>
	 */
	public static function maybe_attach_coupon( $event_key, array $snapshot ) {
		$event_key = sanitize_key( (string) $event_key );
		if ( ! in_array( $event_key, array( 'cart-abandoned', 'order-abandoned', 'cancelled', 'failed', 'user-welcome' ), true ) ) {
			return $snapshot;
		}
		$cfg = self::config_for_event( $event_key );
		if ( empty( $cfg['enabled'] ) || (float) ( $cfg['amount'] ?? 0 ) <= 0 ) {
			return $snapshot;
		}

		$user_id = (int) ( $snapshot['user_id'] ?? 0 );
		if ( 'user-welcome' === $event_key && $user_id > 0 ) {
			$existing = (string) get_user_meta( $user_id, '_webino_sms_welcome_coupon', true );
			if ( $existing !== '' ) {
				return array_merge( $snapshot, self::coupon_snapshot_fields( $cfg, $existing ) );
			}
		}

		$code = self::create_coupon( $cfg, $event_key, $user_id, (int) ( $snapshot['id'] ?? 0 ) );
		if ( $code === '' ) {
			return $snapshot;
		}
		$snapshot = array_merge( $snapshot, self::coupon_snapshot_fields( $cfg, $code ) );
		if ( 'user-welcome' === $event_key && $user_id > 0 ) {
			update_user_meta( $user_id, '_webino_sms_welcome_coupon', $code );
		}
		return $snapshot;
	}

	/**
	 * Coupon fields for SMS pattern variables.
	 *
	 * @param array<string,mixed> $cfg Recovery config.
	 * @param string              $code Coupon code.
	 * @return array<string,string>
	 */
	public static function coupon_snapshot_fields( array $cfg, $code ) {
		$type   = in_array( (string) ( $cfg['type'] ?? 'percent' ), array( 'percent', 'fixed_cart' ), true )
			? (string) $cfg['type']
			: 'percent';
		$amount = (float) ( $cfg['amount'] ?? 0 );
		$days   = max( 1, (int) ( $cfg['expires_days'] ?? 7 ) );
		$usage  = max( 1, (int) ( $cfg['usage_limit'] ?? 1 ) );

		$expires_ts = time() + ( $days * DAY_IN_SECONDS );
		$expires    = '';
		if ( class_exists( 'Webino_Dashboard_Locale', false ) ) {
			try {
				$tz = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );
				$dt = ( new DateTime( '@' . $expires_ts ) )->setTimezone( $tz );
				$expires = Webino_Dashboard_Locale::format_jalali_date_label(
					(int) $dt->format( 'Y' ),
					(int) $dt->format( 'n' ),
					(int) $dt->format( 'j' )
				);
			} catch ( Exception $e ) {
				$expires = date_i18n( 'Y-m-d', $expires_ts );
			}
		} else {
			$expires = date_i18n( 'Y-m-d', $expires_ts );
		}

		$type_label = 'fixed_cart' === $type ? 'مبلغ ثابت' : 'درصدی';
		if ( 'percent' === $type ) {
			$amount_txt     = rtrim( rtrim( (string) $amount, '0' ), '.' );
			$discount_text  = $amount_txt . '٪';
		} elseif ( class_exists( 'Webino_Dashboard_Currency', false ) ) {
			$discount_text = Webino_Dashboard_Currency::format_sms_amount( $amount );
		} else {
			$discount_text = number_format( $amount, 0, '.', ',' ) . ' تومان';
		}
		if ( class_exists( 'Webino_Dashboard_Locale', false ) ) {
			$discount_text = Webino_Dashboard_Locale::to_persian_digits( $discount_text, 'fa_IR' );
		}

		return array(
			'coupon'               => (string) $code,
			'coupon_code'          => (string) $code,
			'coupon_amount'        => (string) $amount,
			'coupon_type'          => $type,
			'coupon_type_label'    => $type_label,
			'coupon_expires_days'  => (string) $days,
			'coupon_expires'       => $expires,
			'coupon_usage_limit'   => (string) $usage,
			'coupon_discount_text' => $discount_text,
		);
	}

	/**
	 * @param array<string,mixed> $cfg Config.
	 * @param string              $event_key Event.
	 * @param int                 $user_id User id.
	 * @param int                 $order_id Order id.
	 * @return string
	 */
	public static function create_coupon( array $cfg, $event_key, $user_id = 0, $order_id = 0 ) {
		if ( ! class_exists( 'WC_Coupon', false ) ) {
			return '';
		}
		$amount = (float) ( $cfg['amount'] ?? 0 );
		if ( $amount <= 0 ) {
			return '';
		}
		$type = (string) ( $cfg['type'] ?? 'percent' );
		if ( ! in_array( $type, array( 'percent', 'fixed_cart' ), true ) ) {
			$type = 'percent';
		}
		$prefix = strtoupper( substr( preg_replace( '/[^a-z]/', '', (string) $event_key ), 0, 4 ) );
		$code   = $prefix . '-' . strtoupper( wp_generate_password( 8, false, false ) );
		$c      = new WC_Coupon();
		$c->set_code( $code );
		$c->set_discount_type( $type );
		$c->set_amount( (string) $amount );
		$c->set_individual_use( true );
		$c->set_usage_limit( max( 1, (int) ( $cfg['usage_limit'] ?? 1 ) ) );
		if ( $user_id > 0 ) {
			$c->set_usage_limit_per_user( 1 );
		}
		$days = max( 1, (int) ( $cfg['expires_days'] ?? 7 ) );
		$c->set_date_expires( strtotime( '+' . $days . ' days', current_time( 'timestamp' ) ) );
		$c->update_meta_data( '_webino_sms_recovery', '1' );
		$c->update_meta_data( '_webino_sms_recovery_event', sanitize_key( (string) $event_key ) );
		if ( $order_id > 0 ) {
			$c->update_meta_data( '_webino_sms_recovery_order', (string) $order_id );
		}
		if ( ! $c->save() ) {
			return '';
		}
		return (string) $c->get_code();
	}

	/**
	 * @param int $user_id User id.
	 * @return void
	 */
	public static function on_user_register( $user_id ) {
		$user_id = (int) $user_id;
		if ( $user_id < 1 ) {
			return;
		}
		$phone = (string) get_user_meta( $user_id, 'billing_phone', true );
		if ( '' === $phone ) {
			$user = get_userdata( $user_id );
			$phone = $user && ! empty( $user->user_login ) && preg_match( '/^09\d{9}$/', $user->user_login )
				? (string) $user->user_login
				: '';
		}
		if ( '' === trim( $phone ) ) {
			return;
		}
		$user = get_userdata( $user_id );
		$name = $user ? trim( $user->first_name . ' ' . $user->last_name ) : '';
		if ( '' === $name && $user ) {
			$name = (string) $user->display_name;
		}
		$snapshot = array(
			'id'             => 0,
			'user_id'        => $user_id,
			'customer_name'  => $name,
			'customer_phone' => $phone,
			'mobile'         => $phone,
			'site_name'      => get_bloginfo( 'name' ),
			'site_url'       => home_url(),
		);
		Webino_Dashboard_Sms_Order_Hooks::notify_snapshot( 'user-welcome', $snapshot );
	}

	/**
	 * Hourly cron: abandoned carts + unpaid pending orders.
	 *
	 * @return void
	 */
	public static function run_cron() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}
		self::scan_abandoned_orders();
		self::scan_abandoned_carts();
	}

	/**
	 * @return void
	 */
	private static function scan_abandoned_orders() {
		$cfg   = self::config_for_event( 'order-abandoned' );
		$hours = max( 1, (int) ( $cfg['delay_hours'] ?? 24 ) );
		$before = gmdate( 'Y-m-d H:i:s', time() - ( $hours * HOUR_IN_SECONDS ) );

		$orders = wc_get_orders(
			array(
				'status'       => array( 'pending' ),
				'limit'        => 40,
				'date_created' => '<' . $before,
				'orderby'      => 'date',
				'order'        => 'ASC',
				'return'       => 'objects',
			)
		);
		if ( ! is_array( $orders ) ) {
			return;
		}
		foreach ( $orders as $order ) {
			if ( ! $order instanceof WC_Order || ! $order->needs_payment() ) {
				continue;
			}
			if ( get_post_meta( $order->get_id(), '_webino_sms_order_abandoned_sent', true ) ) {
				continue;
			}
			$snapshot = Webino_Dashboard_Sms_Order_Hooks::build_snapshot( $order );
			$snapshot['user_id'] = (int) $order->get_user_id();
			Webino_Dashboard_Sms_Order_Hooks::notify_snapshot( 'order-abandoned', $snapshot );
			update_post_meta( $order->get_id(), '_webino_sms_order_abandoned_sent', current_time( 'mysql' ) );
		}
	}

	/**
	 * @return void
	 */
	private static function scan_abandoned_carts() {
		$cfg   = self::config_for_event( 'cart-abandoned' );
		$hours = max( 1, (int) ( $cfg['delay_hours'] ?? 24 ) );
		$cutoff = time() - ( $hours * HOUR_IN_SECONDS );

		$user_ids = get_users(
			array(
				'fields'     => 'ID',
				'number'     => 60,
				'meta_query' => array(
					array(
						'key'     => '_woocommerce_persistent_cart_' . get_current_blog_id(),
						'compare' => 'EXISTS',
					),
				),
			)
		);
		if ( ! is_array( $user_ids ) ) {
			return;
		}

		foreach ( $user_ids as $uid ) {
			$uid = (int) $uid;
			if ( $uid < 1 ) {
				continue;
			}
			if ( get_user_meta( $uid, '_webino_sms_cart_abandoned_sent', true ) ) {
				continue;
			}
			$meta_key = '_woocommerce_persistent_cart_' . get_current_blog_id();
			$cart     = get_user_meta( $uid, $meta_key, true );
			if ( ! is_array( $cart ) || empty( $cart['cart'] ) || ! is_array( $cart['cart'] ) ) {
				continue;
			}
			$touched = (int) get_user_meta( $uid, '_webino_sms_cart_touched', true );
			if ( $touched < 1 ) {
				// Approximate: use user registered / last update via meta empty → skip until touched.
				update_user_meta( $uid, '_webino_sms_cart_touched', time() );
				continue;
			}
			if ( $touched > $cutoff ) {
				continue;
			}

			// Skip if user has a recent pending/processing order.
			$recent = wc_get_orders(
				array(
					'customer_id'  => $uid,
					'status'       => array( 'pending', 'processing', 'on-hold', 'completed' ),
					'limit'        => 1,
					'date_created' => '>' . gmdate( 'Y-m-d H:i:s', $touched ),
					'return'       => 'ids',
				)
			);
			if ( ! empty( $recent ) ) {
				continue;
			}

			$phone = (string) get_user_meta( $uid, 'billing_phone', true );
			if ( '' === trim( $phone ) ) {
				continue;
			}
			$names = array();
			$qty   = 0;
			foreach ( $cart['cart'] as $line ) {
				if ( ! is_array( $line ) ) {
					continue;
				}
				$q = (int) ( $line['quantity'] ?? 0 );
				$qty += $q;
				$pid = (int) ( $line['product_id'] ?? 0 );
				$p   = $pid > 0 && function_exists( 'wc_get_product' ) ? wc_get_product( $pid ) : false;
				$names[] = $p ? $p->get_name() . ( $q > 1 ? ' ×' . $q : '' ) : (string) $pid;
			}
			$user = get_userdata( $uid );
			$name = $user ? trim( $user->first_name . ' ' . $user->last_name ) : '';
			if ( '' === $name && $user ) {
				$name = (string) $user->display_name;
			}
			$snapshot = array(
				'id'             => 0,
				'user_id'        => $uid,
				'customer_name'  => $name,
				'customer_phone' => $phone,
				'mobile'         => $phone,
				'items'          => implode( ', ', $names ),
				'all_items'      => implode( ', ', $names ),
				'items_qty'      => (string) $qty,
				'count_items'    => (string) $qty,
				'site_name'      => get_bloginfo( 'name' ),
				'site_url'       => home_url(),
				'payment_url'    => function_exists( 'wc_get_cart_url' ) ? (string) wc_get_cart_url() : home_url( '/cart/' ),
			);
			Webino_Dashboard_Sms_Order_Hooks::notify_snapshot( 'cart-abandoned', $snapshot );
			update_user_meta( $uid, '_webino_sms_cart_abandoned_sent', current_time( 'mysql' ) );
		}
	}

	/**
	 * Touch cart activity so abandonment delay starts from last change.
	 *
	 * @return void
	 */
	public static function touch_cart() {
		if ( ! is_user_logged_in() ) {
			return;
		}
		$uid = get_current_user_id();
		update_user_meta( $uid, '_webino_sms_cart_touched', time() );
		delete_user_meta( $uid, '_webino_sms_cart_abandoned_sent' );
	}
}
