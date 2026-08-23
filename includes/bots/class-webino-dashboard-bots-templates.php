<?php
/**
 * Message template engine with variable substitution for bot notifications.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Replaces {tokens} in templates.
 */
final class Webino_Dashboard_Bots_Templates {

	const OPTION = 'webino_dashboard_bots_templates';

	/**
	 * @return array<string,string>
	 */
	public static function settings() {
		$defaults = array(
			'order_paid'       => __( 'سفارش #{order_number} پرداخت شد. مبلغ: {total}', 'webino-dashboard' ),
			'order_processing' => __( 'سفارش #{order_number} در حال آماده‌سازی است.', 'webino-dashboard' ),
			'order_completed'  => __( 'سفارش #{order_number} تکمیل شد.', 'webino-dashboard' ),
			'order_shipped'    => __( 'سفارش #{order_number} ارسال شد. پیگیری: {tracking_code}', 'webino-dashboard' ),
			'abandon_cart'     => __( 'سبد خرید شما منتظر است. مجموع تقریبی: {total}', 'webino-dashboard' ),
			'welcome'          => __( 'سلام {customer}، به فروشگاه خوش آمدید.', 'webino-dashboard' ),
		);
		$raw = get_option( self::OPTION, array() );
		return is_array( $raw ) ? array_merge( $defaults, $raw ) : $defaults;
	}

	/**
	 * @param array<string,mixed> $input Input.
	 * @return array<string,string>
	 */
	public static function save_settings( $input ) {
		$cur = self::settings();
		if ( ! is_array( $input ) ) {
			return $cur;
		}
		foreach ( $cur as $key => $_v ) {
			if ( isset( $input[ $key ] ) ) {
				$cur[ $key ] = sanitize_textarea_field( (string) $input[ $key ] );
			}
		}
		// Allow extra custom keys.
		foreach ( $input as $key => $val ) {
			$k = sanitize_key( (string) $key );
			if ( $k === '' || isset( $cur[ $k ] ) || ! is_scalar( $val ) ) {
				continue;
			}
			$cur[ $k ] = sanitize_textarea_field( (string) $val );
		}
		update_option( self::OPTION, $cur, false );
		return $cur;
	}

	/**
	 * Preview a template with sample or provided vars.
	 *
	 * @param string               $template Template body or settings key.
	 * @param array<string,string> $vars     Vars.
	 * @return string
	 */
	public static function preview( $template, array $vars = array() ) {
		$settings = self::settings();
		$body     = (string) $template;
		if ( isset( $settings[ $body ] ) ) {
			$body = (string) $settings[ $body ];
		}
		$sample = array_merge(
			array(
				'order_id'       => '1001',
				'order_number'   => '1001',
				'total'          => '250,000 تومان',
				'customer'       => 'کاربر نمونه',
				'phone'          => '09120000000',
				'email'          => 'sample@example.com',
				'address'        => 'تهران',
				'payment_method' => 'کیف پول',
				'order_status'   => 'processing',
				'date'           => date_i18n( get_option( 'date_format' ) ),
				'time'           => date_i18n( get_option( 'time_format' ) ),
				'items'          => 'محصول نمونه × 1',
				'tracking_code'  => 'TRACK123',
				'order_url'      => home_url( '/' ),
				'admin_url'      => admin_url(),
				'payment_url'    => home_url( '/' ),
			),
			$vars
		);
		return self::render( $body, $sample );
	}

	/**
	 * @param string               $template Template.
	 * @param array<string,string> $vars     Vars.
	 * @return string
	 */
	public static function render( $template, array $vars ) {
		$out = (string) $template;
		foreach ( $vars as $key => $value ) {
			$out = str_replace( '{' . $key . '}', (string) $value, $out );
		}
		return $out;
	}

	/**
	 * Build common vars from a WC order.
	 *
	 * @param WC_Order $order Order.
	 * @return array<string,string>
	 */
	public static function order_vars( $order ) {
		if ( ! $order || ! is_a( $order, 'WC_Order' ) ) {
			return array();
		}
		$items = array();
		foreach ( $order->get_items() as $item ) {
			$items[] = $item->get_name() . ' × ' . $item->get_quantity();
		}
		$tracking = (string) $order->get_meta( '_tracking_code' );
		if ( '' === $tracking ) {
			$tracking = (string) $order->get_meta( 'tracking_code' );
		}
		return array(
			'order_id'       => (string) $order->get_id(),
			'order_number'   => (string) $order->get_order_number(),
			'total'          => wp_strip_all_tags( $order->get_formatted_order_total() ),
			'customer'       => trim( $order->get_formatted_billing_full_name() ),
			'phone'          => (string) $order->get_billing_phone(),
			'email'          => (string) $order->get_billing_email(),
			'address'        => wp_strip_all_tags( $order->get_formatted_billing_address() ),
			'payment_method' => (string) $order->get_payment_method_title(),
			'order_status'   => wc_get_order_status_name( $order->get_status() ),
			'date'           => $order->get_date_created() ? $order->get_date_created()->date_i18n( get_option( 'date_format' ) ) : '',
			'time'           => $order->get_date_created() ? $order->get_date_created()->date_i18n( get_option( 'time_format' ) ) : '',
			'items'          => implode( "\n", $items ),
			'tracking_code'  => $tracking,
			'order_url'      => $order->get_view_order_url(),
			'admin_url'      => $order->get_edit_order_url(),
			'payment_url'    => $order->get_checkout_payment_url( true ),
		);
	}

	/**
	 * Rich admin order card text.
	 *
	 * @param WC_Order $order Order.
	 * @return string
	 */
	public static function admin_order_card( $order ) {
		$v = self::order_vars( $order );
		$lines = array(
			sprintf( __( 'سفارش #%s', 'webino-dashboard' ), $v['order_number'] ),
			__( 'مشتری:', 'webino-dashboard' ) . ' ' . $v['customer'],
			__( 'تلفن:', 'webino-dashboard' ) . ' ' . $v['phone'],
			__( 'ایمیل:', 'webino-dashboard' ) . ' ' . $v['email'],
			__( 'مبلغ:', 'webino-dashboard' ) . ' ' . $v['total'],
			__( 'پرداخت:', 'webino-dashboard' ) . ' ' . $v['payment_method'],
			__( 'وضعیت:', 'webino-dashboard' ) . ' ' . $v['order_status'],
			__( 'آدرس:', 'webino-dashboard' ) . "\n" . $v['address'],
			__( 'اقلام:', 'webino-dashboard' ) . "\n" . $v['items'],
		);
		if ( $v['tracking_code'] !== '' ) {
			$lines[] = __( 'پیگیری:', 'webino-dashboard' ) . ' ' . $v['tracking_code'];
		}
		return implode( "\n", $lines );
	}
}
