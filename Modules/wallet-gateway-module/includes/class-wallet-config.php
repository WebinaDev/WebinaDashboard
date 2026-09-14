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
			'enabled'           => true,
			'title'             => 'کیف پول',
			'description'       => 'پرداخت از موجودی کیف پول فروشگاه.',
			'order_button_text' => 'پرداخت با کیف پول',
			'login_prompt'      => 'برای پرداخت با کیف پول وارد شوید.',
			'balance_label'     => 'موجودی کیف پول: {balance}',
			'icon_url'          => '',
			'min_topup'         => 1000,
		);
	}

	/**
	 * @return string
	 */
	public static function default_icon_url() {
		if ( defined( 'WEBINO_DASHBOARD_FILE' ) ) {
			return plugins_url( 'Modules/wallet-gateway-module/assets/wallet-logo.png', WEBINO_DASHBOARD_FILE );
		}
		return plugins_url( 'assets/wallet-logo.png', dirname( __DIR__ ) . '/bootstrap.php' );
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
			'order_button_text' => sanitize_text_field( (string) ( $data['order_button_text'] ?? $old['order_button_text'] ) ),
			'login_prompt'      => sanitize_text_field( (string) ( $data['login_prompt'] ?? $old['login_prompt'] ) ),
			'balance_label'     => sanitize_text_field( (string) ( $data['balance_label'] ?? $old['balance_label'] ) ),
			'icon_url'          => esc_url_raw( (string) ( $data['icon_url'] ?? $old['icon_url'] ) ),
			'min_topup'         => max( 1, (int) ( $data['min_topup'] ?? $old['min_topup'] ) ),
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

	/**
	 * @return int
	 */
	public static function min_topup() {
		return (int) self::get()['min_topup'];
	}
}
