<?php
/**
 * TorobPay settings (dashboard + WC bridge).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option webino_torobpay_settings + mirror to woocommerce_WC_Gateway_TorobPay_settings.
 */
final class Webino_TorobPay_Config {

	const OPTION_KEY = 'webino_torobpay_settings';
	const GATEWAY_ID = 'WC_Gateway_TorobPay';
	const LOG_OPTION = 'webino_torobpay_logs';
	const TOKEN_KEY  = 'webino_torobpay_bearer_token';

	/** @var list<string> */
	const OFFICIAL_PLUGINS = array(
		'torobpay-woocommerce-gateway/index.php',
		'torobpay-woocommerce-gateway/torobpay-woocommerce-gateway.php',
	);

	/** @var list<string> */
	const WC_OPTION_KEYS = array(
		'woocommerce_WC_Gateway_TorobPay_settings',
		'woocommerce_torobpay_settings',
		'woocommerce_torob_pay_settings',
		'woocommerce_wc_gateway_torobpay_settings',
	);

	/**
	 * @return bool
	 */
	public static function official_plugin_active() {
		return class_exists( 'Webino_Payment_Gateway_Bridge', false )
			&& Webino_Payment_Gateway_Bridge::official_active( self::OFFICIAL_PLUGINS );
	}

	/**
	 * @return bool
	 */
	public static function should_register_gateway() {
		if ( self::official_plugin_active() ) {
			return false;
		}
		if ( class_exists( 'WC_Gateway_TorobPay', false ) && ! defined( 'WEBINO_TOROBPAY_GATEWAY_OWNED' ) ) {
			return false;
		}
		return true;
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'enabled'                 => false,
			'title'                   => 'پرداخت اقساطی ترب‌پی',
			'description'             => 'پرداخت اقساطی ترب‌پی',
			'base_url'                => 'https://cpg.torobpay.com/',
			'client_id'               => '',
			'client_secret'           => '',
			'client_username'         => '',
			'client_password'         => '',
			'mobile_enabled'          => true,
			'postal_enabled'          => false,
			'default_gateway'         => true,
			'direct_payment'          => true,
			'disable_payment_retry'   => false,
			'utm_torob_enabled'       => false,
			'utm_exclude_others'      => false,
			'dns_smart_resolve_enabled' => false,
			'dns_ip_override'         => '',
			'success_message'         => 'پرداخت موفق. کد پیگیری: {referenceID}',
			'failed_message'          => 'پرداخت ناموفق: {fault}',
			'cancelled_message'       => 'پرداخت توسط کاربر لغو شد.',
			'order_button_text'       => 'پرداخت با ترب‌پی',
			'icon_url'                => '',
			'widget_enabled'          => false,
			'badge_enabled'           => false,
			'marquee_enabled'         => false,
			'topbar_enabled'          => false,
			'slider_enabled'          => false,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		$stored = get_option( self::OPTION_KEY, array() );
		$out    = wp_parse_args( is_array( $stored ) ? $stored : array(), self::defaults() );
		$wc     = class_exists( 'Webino_Payment_Gateway_Bridge', false )
			? Webino_Payment_Gateway_Bridge::read_wc_settings( self::WC_OPTION_KEYS )
			: array();
		if ( empty( $wc ) ) {
			return $out;
		}
		// Prefer WC only when the official TorobPay plugin owns settings.
		// Preferring any non-empty WC bag wiped Webina credentials after save.
		$prefer = self::official_plugin_active();
		$mapped = $wc;
		if ( isset( $wc['enabled'] ) ) {
			$mapped['enabled'] = ( 'yes' === (string) $wc['enabled'] || true === $wc['enabled'] );
		}
		foreach ( array( 'mobile_enabled', 'postal_enabled', 'default_gateway', 'direct_payment', 'disable_payment_retry', 'utm_torob_enabled', 'utm_exclude_others', 'dns_smart_resolve_enabled' ) as $flag ) {
			if ( isset( $wc[ $flag ] ) ) {
				$mapped[ $flag ] = ( 'yes' === (string) $wc[ $flag ] || true === $wc[ $flag ] );
			}
		}
		$shared = array_keys( self::defaults() );
		return Webino_Payment_Gateway_Bridge::merge_settings( $out, $mapped, $shared, $prefer );
	}

	/**
	 * @return array<string,mixed>
	 */
	/**
	 * @return string
	 */
	public static function default_icon_url() {
		if ( defined( 'WEBINO_DASHBOARD_FILE' ) ) {
			return plugins_url( 'Modules/torobpay-gateway-module/assets/torobpay-logo.png', WEBINO_DASHBOARD_FILE );
		}
		return plugins_url( 'assets/torobpay-logo.png', dirname( __DIR__ ) . '/bootstrap.php' );
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

	public static function get_public() {
		$s = self::get();
		$has_secret = '' !== (string) $s['client_secret'];
		$has_pass   = '' !== (string) $s['client_password'];
		$s['client_secret'] = '';
		$s['client_password'] = '';
		$s['has_client_secret'] = $has_secret;
		$s['has_client_password'] = $has_pass;
		$s['official_plugin_active'] = self::official_plugin_active();
		$s['gateway_source'] = self::official_plugin_active() ? 'official' : ( self::should_register_gateway() ? 'webino' : 'external' );
		$s['callback_url'] = self::callback_url();
		$s['default_icon_url'] = self::default_icon_url();
		$s['resolved_icon_url'] = self::resolve_icon_url( (string) ( $s['icon_url'] ?? '' ) );
		return $s;
	}

	/**
	 * @param array<string,mixed> $data Raw.
	 * @return array<string,mixed>
	 */
	public static function save( array $data ) {
		$old = self::get();
		$secret = (string) $old['client_secret'];
		if ( array_key_exists( 'client_secret', $data ) && '' !== trim( (string) $data['client_secret'] ) ) {
			$secret = sanitize_text_field( (string) $data['client_secret'] );
		}
		$password = (string) $old['client_password'];
		if ( array_key_exists( 'client_password', $data ) && '' !== trim( (string) $data['client_password'] ) ) {
			$password = sanitize_text_field( (string) $data['client_password'] );
		}
		$base = esc_url_raw( (string) ( $data['base_url'] ?? $old['base_url'] ) );
		if ( '' === $base || 0 !== strpos( $base, 'https://' ) ) {
			$base = 'https://cpg.torobpay.com/';
		}
		if ( '/' !== substr( $base, -1 ) ) {
			$base .= '/';
		}

		$new = array(
			'enabled'                   => ! empty( $data['enabled'] ),
			'title'                     => sanitize_text_field( (string) ( $data['title'] ?? $old['title'] ) ),
			'description'               => sanitize_text_field( (string) ( $data['description'] ?? $old['description'] ) ),
			'base_url'                  => $base,
			'client_id'                 => sanitize_text_field( (string) ( $data['client_id'] ?? $old['client_id'] ) ),
			'client_secret'             => $secret,
			'client_username'           => sanitize_text_field( (string) ( $data['client_username'] ?? $old['client_username'] ) ),
			'client_password'           => $password,
			'mobile_enabled'            => ! empty( $data['mobile_enabled'] ),
			'postal_enabled'            => ! empty( $data['postal_enabled'] ),
			'default_gateway'           => ! empty( $data['default_gateway'] ),
			'direct_payment'            => ! empty( $data['direct_payment'] ),
			'disable_payment_retry'     => ! empty( $data['disable_payment_retry'] ),
			'utm_torob_enabled'         => ! empty( $data['utm_torob_enabled'] ),
			'utm_exclude_others'        => ! empty( $data['utm_exclude_others'] ),
			'dns_smart_resolve_enabled' => ! empty( $data['dns_smart_resolve_enabled'] ),
			'dns_ip_override'           => sanitize_text_field( (string) ( $data['dns_ip_override'] ?? $old['dns_ip_override'] ) ),
			'success_message'           => sanitize_textarea_field( (string) ( $data['success_message'] ?? $old['success_message'] ) ),
			'failed_message'            => sanitize_textarea_field( (string) ( $data['failed_message'] ?? $old['failed_message'] ) ),
			'cancelled_message'         => sanitize_textarea_field( (string) ( $data['cancelled_message'] ?? $old['cancelled_message'] ) ),
			'order_button_text'         => sanitize_text_field( (string) ( $data['order_button_text'] ?? $old['order_button_text'] ) ),
			'icon_url'                  => esc_url_raw( (string) ( $data['icon_url'] ?? $old['icon_url'] ) ),
			'widget_enabled'            => ! empty( $data['widget_enabled'] ),
			'badge_enabled'             => ! empty( $data['badge_enabled'] ),
			'marquee_enabled'           => ! empty( $data['marquee_enabled'] ),
			'topbar_enabled'            => ! empty( $data['topbar_enabled'] ),
			'slider_enabled'            => ! empty( $data['slider_enabled'] ),
		);
		update_option( self::OPTION_KEY, $new, false );
		self::mirror_to_wc( $new );
		if (
			$old['client_id'] !== $new['client_id']
			|| $old['client_secret'] !== $new['client_secret']
			|| $old['client_username'] !== $new['client_username']
			|| $old['client_password'] !== $new['client_password']
			|| $old['base_url'] !== $new['base_url']
		) {
			delete_transient( self::TOKEN_KEY );
			delete_transient( 'torobpay_bearer_token' );
		}
		return self::get_public();
	}

	/**
	 * @param array<string,mixed> $s Settings.
	 * @return void
	 */
	public static function mirror_to_wc( array $s ) {
		$yn = static function ( $v ) {
			return ! empty( $v ) ? 'yes' : 'no';
		};
		$bag = array(
			'enabled'                   => $yn( $s['enabled'] ),
			'title'                     => (string) $s['title'],
			'description'               => (string) $s['description'],
			'base_url'                  => (string) $s['base_url'],
			'client_id'                 => (string) $s['client_id'],
			'client_secret'             => (string) $s['client_secret'],
			'client_username'           => (string) $s['client_username'],
			'client_password'           => (string) $s['client_password'],
			'mobile_enabled'            => $yn( $s['mobile_enabled'] ),
			'postal_enabled'            => $yn( $s['postal_enabled'] ),
			'default_gateway'           => $yn( $s['default_gateway'] ),
			'direct_payment'            => $yn( $s['direct_payment'] ),
			'disable_payment_retry'     => $yn( $s['disable_payment_retry'] ),
			'utm_torob_enabled'         => $yn( $s['utm_torob_enabled'] ),
			'utm_exclude_others'        => $yn( $s['utm_exclude_others'] ),
			'dns_smart_resolve_enabled' => $yn( $s['dns_smart_resolve_enabled'] ),
			'dns_ip_override'           => (string) $s['dns_ip_override'],
			'success_message'           => (string) $s['success_message'],
			'failed_message'            => (string) $s['failed_message'],
			'cancelled_message'         => (string) ( $s['cancelled_message'] ?? '' ),
			'order_button_text'         => (string) ( $s['order_button_text'] ?? '' ),
			'icon_url'                  => (string) ( $s['icon_url'] ?? '' ),
		);
		if ( class_exists( 'Webino_Payment_Gateway_Bridge', false ) ) {
			Webino_Payment_Gateway_Bridge::write_wc_settings( self::WC_OPTION_KEYS, $bag, 'woocommerce_WC_Gateway_TorobPay_settings' );
		} else {
			update_option( 'woocommerce_WC_Gateway_TorobPay_settings', $bag, false );
		}
	}

	/**
	 * @return string
	 */
	public static function callback_url() {
		if ( function_exists( 'WC' ) && WC() ) {
			return WC()->api_request_url( strtolower( self::GATEWAY_ID ) );
		}
		return home_url( '/?wc-api=' . strtolower( self::GATEWAY_ID ) );
	}
}
