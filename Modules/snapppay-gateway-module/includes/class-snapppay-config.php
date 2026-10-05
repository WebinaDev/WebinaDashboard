<?php
/**
 * SnappPay settings (dashboard + WC bridge).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option webino_snapppay_settings + mirror to woocommerce_WC_Gateway_SnappPay_settings.
 */
final class Webino_SnappPay_Config {

	const OPTION_KEY   = 'webino_snapppay_settings';
	const GATEWAY_ID   = 'WC_Gateway_SnappPay';
	const LOG_OPTION   = 'webino_snapppay_logs';
	const TOKEN_KEY    = 'webino_snapppay_bearer_token';
	const IP_OPTION    = 'webino_snapppay_server_ip';

	/** @var list<string> */
	const OFFICIAL_PLUGINS = array(
		'snapppay-woocommerce-gateway/index.php',
		'snapppay-woocommerce-gateway/snapppay-woocommerce-gateway.php',
	);

	/** @var list<string> */
	const WC_OPTION_KEYS = array(
		'woocommerce_WC_Gateway_SnappPay_settings',
		'woocommerce_snapppay_settings',
		'woocommerce_snapp_pay_settings',
		'woocommerce_wc_snapppay_settings',
	);

	/**
	 * @return bool
	 */
	public static function official_plugin_active() {
		return class_exists( 'Webino_Payment_Gateway_Bridge', false )
			&& Webino_Payment_Gateway_Bridge::official_active( self::OFFICIAL_PLUGINS );
	}

	/**
	 * @return bool True when Webina should register its own WC gateway.
	 */
	public static function should_register_gateway() {
		if ( self::official_plugin_active() ) {
			return false;
		}
		// Official class already present (edge case).
		if ( class_exists( 'WC_Gateway_SnappPay', false ) && ! defined( 'WEBINO_SNAPPPAY_GATEWAY_OWNED' ) ) {
			return false;
		}
		return true;
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'enabled'            => false,
			'title'              => 'پرداخت اقساطیِ اسنپ پی',
			'description'        => 'پرداخت اقساطی اسنپ پی',
			'base_url'           => 'https://api.snapppay.ir/',
			'client_id'          => '',
			'client_secret'      => '',
			'client_username'    => '',
			'client_password'    => '',
			'mobile_enabled'     => false,
			'postal_enabled'     => false,
			'default_gateway'    => true,
			'has_comission'      => false,
			'has_pdp'            => false,
			'dark_pdp'           => false,
			'direct_payment'     => false,
			'success_message'    => 'پرداخت با موفقیت انجام شد. شناسه تراکنش: {transactionId}',
			'failed_message'     => 'پرداخت ناموفق بود: {fault}',
			'cancelled_message'  => 'پرداخت لغو شد.',
			'order_button_text'  => 'پرداخت با اسنپ‌پی',
			'icon_url'           => '',
		);
	}

	/**
	 * @return string
	 */
	public static function default_icon_url() {
		if ( defined( 'WEBINO_DASHBOARD_FILE' ) ) {
			return plugins_url( 'Modules/snapppay-gateway-module/assets/snapppay-logo.png', WEBINO_DASHBOARD_FILE );
		}
		return plugins_url( 'assets/snapppay-logo.png', dirname( __DIR__ ) . '/bootstrap.php' );
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

		$wc = class_exists( 'Webino_Payment_Gateway_Bridge', false )
			? Webino_Payment_Gateway_Bridge::read_wc_settings( self::WC_OPTION_KEYS )
			: array();

		// Prefer WC only when the official SnappPay plugin owns settings.
		$prefer_wc = self::official_plugin_active();
		$shared    = array(
			'enabled', 'title', 'description', 'base_url',
			'client_id', 'client_secret', 'client_username', 'client_password',
			'mobile_enabled', 'postal_enabled', 'default_gateway', 'has_comission',
			'has_pdp', 'dark_pdp', 'direct_payment',
			'success_message', 'failed_message', 'cancelled_message',
			'order_button_text', 'icon_url',
		);

		if ( ! empty( $wc ) ) {
			$mapped = $wc;
			if ( isset( $wc['enabled'] ) ) {
				$mapped['enabled'] = ( 'yes' === (string) $wc['enabled'] || true === $wc['enabled'] );
			}
			foreach ( array( 'mobile_enabled', 'postal_enabled', 'default_gateway', 'has_comission', 'has_pdp', 'dark_pdp', 'direct_payment' ) as $flag ) {
				if ( isset( $wc[ $flag ] ) ) {
					$mapped[ $flag ] = ( 'yes' === (string) $wc[ $flag ] || true === $wc[ $flag ] );
				}
			}
			$out = Webino_Payment_Gateway_Bridge::merge_settings( $out, $mapped, $shared, $prefer_wc );
		}

		return $out;
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_public() {
		$s = self::get();
		$has_secret = '' !== (string) $s['client_secret'];
		$has_pass   = '' !== (string) $s['client_password'];
		$s['client_secret']   = '';
		$s['client_password'] = '';
		$s['has_client_secret']   = $has_secret;
		$s['has_client_password'] = $has_pass;
		$s['official_plugin_active'] = self::official_plugin_active();
		$s['gateway_source'] = self::official_plugin_active()
			? 'official'
			: ( self::should_register_gateway() ? 'webino' : 'external' );
		$s['server_ip'] = (string) get_option( self::IP_OPTION, '' );
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
		if ( '' === $base ) {
			$base = 'https://api.snapppay.ir/';
		}
		if ( '/' !== substr( $base, -1 ) ) {
			$base .= '/';
		}

		$new = array(
			'enabled'           => ! empty( $data['enabled'] ),
			'title'             => sanitize_text_field( (string) ( $data['title'] ?? $old['title'] ) ),
			'description'       => sanitize_text_field( (string) ( $data['description'] ?? $old['description'] ) ),
			'base_url'          => $base,
			'client_id'         => sanitize_text_field( (string) ( $data['client_id'] ?? $old['client_id'] ) ),
			'client_secret'     => $secret,
			'client_username'   => sanitize_text_field( (string) ( $data['client_username'] ?? $old['client_username'] ) ),
			'client_password'   => $password,
			'mobile_enabled'    => ! empty( $data['mobile_enabled'] ),
			'postal_enabled'    => ! empty( $data['postal_enabled'] ),
			'default_gateway'   => ! empty( $data['default_gateway'] ),
			'has_comission'     => ! empty( $data['has_comission'] ),
			'has_pdp'           => ! empty( $data['has_pdp'] ),
			'dark_pdp'          => ! empty( $data['dark_pdp'] ),
			'direct_payment'    => ! empty( $data['direct_payment'] ),
			'success_message'   => sanitize_textarea_field( (string) ( $data['success_message'] ?? $old['success_message'] ) ),
			'failed_message'    => sanitize_textarea_field( (string) ( $data['failed_message'] ?? $old['failed_message'] ) ),
			'cancelled_message' => sanitize_textarea_field( (string) ( $data['cancelled_message'] ?? $old['cancelled_message'] ) ),
			'order_button_text' => sanitize_text_field( (string) ( $data['order_button_text'] ?? $old['order_button_text'] ) ),
			'icon_url'          => esc_url_raw( (string) ( $data['icon_url'] ?? $old['icon_url'] ) ),
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
			delete_transient( 'snapppay_bearer_token' );
		}

		return self::get_public();
	}

	/**
	 * @param array<string,mixed> $s Settings.
	 * @return void
	 */
	public static function mirror_to_wc( array $s ) {
		$yesno = static function ( $v ) {
			return ! empty( $v ) ? 'yes' : 'no';
		};
		$bag = array(
			'enabled'           => $yesno( $s['enabled'] ),
			'title'             => (string) $s['title'],
			'description'       => (string) $s['description'],
			'base_url'          => (string) $s['base_url'],
			'client_id'         => (string) $s['client_id'],
			'client_secret'     => (string) $s['client_secret'],
			'client_username'   => (string) $s['client_username'],
			'client_password'   => (string) $s['client_password'],
			'mobile_enabled'    => $yesno( $s['mobile_enabled'] ),
			'postal_enabled'    => $yesno( $s['postal_enabled'] ),
			'default_gateway'   => $yesno( $s['default_gateway'] ),
			'has_comission'     => $yesno( $s['has_comission'] ),
			'has_pdp'           => $yesno( $s['has_pdp'] ),
			'dark_pdp'          => $yesno( $s['dark_pdp'] ),
			'direct_payment'    => $yesno( $s['direct_payment'] ),
			'success_message'   => (string) $s['success_message'],
			'failed_message'    => (string) $s['failed_message'],
			'cancelled_message' => (string) $s['cancelled_message'],
			'order_button_text' => (string) ( $s['order_button_text'] ?? '' ),
			'icon_url'          => (string) ( $s['icon_url'] ?? '' ),
		);
		if ( class_exists( 'Webino_Payment_Gateway_Bridge', false ) ) {
			Webino_Payment_Gateway_Bridge::write_wc_settings(
				self::WC_OPTION_KEYS,
				$bag,
				'woocommerce_WC_Gateway_SnappPay_settings'
			);
		} else {
			update_option( 'woocommerce_WC_Gateway_SnappPay_settings', $bag, false );
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

	/**
	 * @return void
	 */
	public static function maybe_refresh_server_ip() {
		$ip = (string) get_option( self::IP_OPTION, '' );
		if ( '' !== $ip ) {
			return;
		}
		$res = wp_remote_get( 'https://whatisip.snapppay.ir/whatis/ip', array( 'timeout' => 8 ) );
		if ( is_wp_error( $res ) ) {
			return;
		}
		$body = trim( (string) wp_remote_retrieve_body( $res ) );
		if ( preg_match( '/\d{1,3}(?:\.\d{1,3}){3}/', $body, $m ) ) {
			update_option( self::IP_OPTION, $m[0], false );
		}
	}
}
