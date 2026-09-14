<?php
/**
 * Bale Pay gateway settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option webino_bale_pay_settings.
 */
final class Webino_Bale_Pay_Config {

	const OPTION_KEY = 'webino_bale_pay_settings';
	const GATEWAY_ID = 'webino_bale_pay';

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'enabled'           => false,
			'title'             => 'پرداخت از طریق بله',
			'description'       => 'فاکتور یک‌بارمصرف در بازوی بله برایتان ارسال می‌شود.',
			'instructions'      => 'پس از ثبت سفارش، فاکتور را در بله باز کنید و پرداخت کنید.',
			'order_button_text' => 'ثبت و پرداخت با بله',
			'success_message'   => 'فاکتور پرداخت در بله برایتان ارسال شد.',
			'failed_message'    => 'ارسال فاکتور بله ناموفق بود: {fault}',
			'icon_url'          => '',
		);
	}

	/**
	 * @return string
	 */
	public static function default_icon_url() {
		if ( defined( 'WEBINO_DASHBOARD_FILE' ) ) {
			return plugins_url( 'Modules/bale-pay-gateway-module/assets/bale-pay-logo.png', WEBINO_DASHBOARD_FILE );
		}
		return plugins_url( 'assets/bale-pay-logo.png', dirname( __DIR__ ) . '/bootstrap.php' );
	}

	/**
	 * @param string|null $configured Optional.
	 * @return string
	 */
	public static function resolve_icon_url( $configured = null ) {
		if ( null === $configured ) {
			$configured = (string) ( self::get()['icon_url'] ?? '' );
		}
		$configured = trim( (string) $configured );
		return '' !== $configured ? esc_url_raw( $configured ) : self::default_icon_url();
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		$stored = get_option( self::OPTION_KEY, array() );
		$out    = wp_parse_args( is_array( $stored ) ? $stored : array(), self::defaults() );
		$wc     = get_option( 'woocommerce_' . self::GATEWAY_ID . '_settings', array() );
		if ( is_array( $wc ) && isset( $wc['enabled'] ) ) {
			$out['enabled'] = 'yes' === (string) $wc['enabled'];
		}
		return $out;
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_public() {
		$s = self::get();
		$s['default_icon_url'] = self::default_icon_url();
		$s['resolved_icon_url'] = self::resolve_icon_url( (string) ( $s['icon_url'] ?? '' ) );
		return $s;
	}

	/**
	 * @param array<string,mixed> $data Raw.
	 * @return array<string,mixed>
	 */
	public static function save( $data ) {
		$old = self::get();
		if ( ! is_array( $data ) ) {
			$data = array();
		}
		$new = array(
			'enabled'           => ! empty( $data['enabled'] ),
			'title'             => sanitize_text_field( (string) ( $data['title'] ?? $old['title'] ) ),
			'description'       => sanitize_textarea_field( (string) ( $data['description'] ?? $old['description'] ) ),
			'instructions'      => sanitize_textarea_field( (string) ( $data['instructions'] ?? $old['instructions'] ) ),
			'order_button_text' => sanitize_text_field( (string) ( $data['order_button_text'] ?? $old['order_button_text'] ) ),
			'success_message'   => sanitize_textarea_field( (string) ( $data['success_message'] ?? $old['success_message'] ) ),
			'failed_message'    => sanitize_textarea_field( (string) ( $data['failed_message'] ?? $old['failed_message'] ) ),
			'icon_url'          => esc_url_raw( (string) ( $data['icon_url'] ?? $old['icon_url'] ) ),
		);
		update_option( self::OPTION_KEY, $new, false );
		$wc_key = 'woocommerce_' . self::GATEWAY_ID . '_settings';
		$wc     = get_option( $wc_key, array() );
		if ( ! is_array( $wc ) ) {
			$wc = array();
		}
		$wc['enabled']     = $new['enabled'] ? 'yes' : 'no';
		$wc['title']       = $new['title'];
		$wc['description'] = $new['description'];
		update_option( $wc_key, $wc, false );
		return self::get_public();
	}
}
