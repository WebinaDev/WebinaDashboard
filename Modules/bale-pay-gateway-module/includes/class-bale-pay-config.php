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
			'enabled'      => false,
			'title'        => __( 'پرداخت از طریق بله', 'webino-dashboard' ),
			'description'  => __( 'فاکتور یک‌بارمصرف در بازوی بله برایتان ارسال می‌شود.', 'webino-dashboard' ),
			'instructions' => __( 'پس از ثبت سفارش، فاکتور را در بله باز کنید و پرداخت کنید.', 'webino-dashboard' ),
		);
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
	 * @param array<string,mixed> $data Raw.
	 * @return array<string,mixed>
	 */
	public static function save( $data ) {
		$old = self::get();
		if ( ! is_array( $data ) ) {
			$data = array();
		}
		$new = array(
			'enabled'      => ! empty( $data['enabled'] ),
			'title'        => sanitize_text_field( (string) ( $data['title'] ?? $old['title'] ) ),
			'description'  => sanitize_textarea_field( (string) ( $data['description'] ?? $old['description'] ) ),
			'instructions' => sanitize_textarea_field( (string) ( $data['instructions'] ?? $old['instructions'] ) ),
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
		return $new;
	}
}
