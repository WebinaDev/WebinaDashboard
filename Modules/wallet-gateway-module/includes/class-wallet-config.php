<?php
/**
 * Store wallet gateway settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option webino_wallet_settings (synced to WC gateway option).
 */
final class Webino_Wallet_Config {

	const OPTION_KEY = 'webino_wallet_settings';
	const GATEWAY_ID = 'webino_wallet';

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'enabled'   => true,
			'title'     => __( 'کیف پول', 'webino-dashboard' ),
			'min_topup' => 1000,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		$stored = get_option( self::OPTION_KEY, array() );
		$out    = wp_parse_args( is_array( $stored ) ? $stored : array(), self::defaults() );
		$out['enabled']   = ! empty( $out['enabled'] );
		$out['min_topup'] = max( 1, (int) $out['min_topup'] );
		$wc               = get_option( 'woocommerce_' . self::GATEWAY_ID . '_settings', array() );
		if ( is_array( $wc ) ) {
			if ( isset( $wc['enabled'] ) ) {
				$out['enabled'] = 'yes' === (string) $wc['enabled'];
			}
			if ( ! empty( $wc['title'] ) ) {
				$out['title'] = (string) $wc['title'];
			}
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
			'enabled'   => ! empty( $data['enabled'] ),
			'title'     => sanitize_text_field( (string) ( $data['title'] ?? $old['title'] ) ),
			'min_topup' => max( 1, (int) ( $data['min_topup'] ?? $old['min_topup'] ) ),
		);
		update_option( self::OPTION_KEY, $new, false );
		$wc_key = 'woocommerce_' . self::GATEWAY_ID . '_settings';
		$wc     = get_option( $wc_key, array() );
		if ( ! is_array( $wc ) ) {
			$wc = array();
		}
		$wc['enabled'] = $new['enabled'] ? 'yes' : 'no';
		$wc['title']   = $new['title'];
		update_option( $wc_key, $wc, false );
		return self::get();
	}

	/**
	 * @return int
	 */
	public static function min_topup() {
		return (int) self::get()['min_topup'];
	}
}
