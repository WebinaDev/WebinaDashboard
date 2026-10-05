<?php
/**
 * DigiPay OAuth token helper (password + refresh_token).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digipay_OAuth {

	const OPTION_KEY = 'webino_digipay_upg_settings';
	const TOKEN_KEY  = 'webino_digipay_upg_token';

	/** @var list<string> */
	const OFFICIAL_PLUGINS = array(
		'digipay-woocommerce/digipay-woocommerce.php',
		'digipay-payment-gateway/digipay-payment-gateway.php',
		'digipay-upg/digipay-upg.php',
	);

	/**
	 * @return bool
	 */
	public static function official_plugin_active() {
		return class_exists( 'Webino_Payment_Gateway_Bridge', false )
			&& Webino_Payment_Gateway_Bridge::official_active( self::OFFICIAL_PLUGINS );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'environment'       => 'staging',
			'client_id'         => '',
			'client_secret'     => '',
			'username'          => '',
			'password'          => '',
			'digipay_version'   => '2022-02-02',
			'seller_id'         => '',
			'supplier_id'       => '',
			'category_id'       => '',
			'product_type'      => 1,
			'title_ipg'         => 'دیجی‌پی — درگاه اینترنتی',
			'description_ipg'   => 'پرداخت امن از طریق دیجی‌پی',
			'title_wallet'      => 'دیجی‌پی — کیف پول',
			'description_wallet'=> 'پرداخت با کیف پول دیجی‌پی',
			'title_cpg'         => 'دیجی‌پی — پرداخت اعتباری',
			'description_cpg'   => 'پرداخت اعتباری از طریق دیجی‌پی',
			'title_bpg'         => 'دیجی‌پی — پرداخت در محل',
			'description_bpg'   => 'پرداخت در محل از طریق دیجی‌پی',
			'order_button_text' => 'پرداخت با دیجی‌پی',
			'success_message'   => 'پرداخت موفق. کد پیگیری: {tracking_code}',
			'failed_message'    => 'پرداخت ناموفق: {fault}',
			'cancelled_message' => 'پرداخت توسط کاربر لغو شد.',
			'icon_url'          => '',
		);
	}

	/**
	 * Bundled DigiPay logo URL.
	 *
	 * @return string
	 */
	public static function default_icon_url() {
		if ( defined( 'WEBINO_DASHBOARD_FILE' ) ) {
			return plugins_url( 'Modules/digipay-upg-module/assets/digipay-logo.png', WEBINO_DASHBOARD_FILE );
		}
		return plugins_url( 'assets/digipay-logo.png', dirname( __DIR__, 2 ) . '/bootstrap.php' );
	}

	/**
	 * @param string|null $configured Optional override.
	 * @return string
	 */
	public static function resolve_icon_url( $configured = null ) {
		if ( null === $configured ) {
			$configured = (string) ( self::settings()['icon_url'] ?? '' );
		}
		$configured = trim( (string) $configured );
		return '' !== $configured ? esc_url_raw( $configured ) : self::default_icon_url();
	}

	/**
	 * Persist only known DigiPay option keys (secrets preserved when blank).
	 *
	 * @param array<string,mixed> $data Raw input.
	 * @return array<string,mixed> Public settings (secrets masked).
	 */
	public static function save( array $data ) {
		$current = self::settings();
		$allowed = array_keys( self::defaults() );
		$new     = array();
		foreach ( $allowed as $key ) {
			if ( ! array_key_exists( $key, $data ) ) {
				$new[ $key ] = $current[ $key ];
				continue;
			}
			$val = $data[ $key ];
			if ( in_array( $key, array( 'client_secret', 'password' ), true ) ) {
				$incoming = trim( (string) $val );
				$new[ $key ] = '' !== $incoming ? sanitize_text_field( $incoming ) : (string) $current[ $key ];
				continue;
			}
			if ( in_array( $key, array( 'description_ipg', 'description_wallet', 'description_cpg', 'description_bpg', 'success_message', 'failed_message', 'cancelled_message' ), true ) ) {
				$new[ $key ] = sanitize_textarea_field( (string) $val );
				continue;
			}
			if ( 'icon_url' === $key ) {
				$new[ $key ] = esc_url_raw( (string) $val );
				continue;
			}
			if ( 'product_type' === $key ) {
				$new[ $key ] = max( 1, (int) $val );
				continue;
			}
			if ( 'environment' === $key ) {
				$env = sanitize_key( (string) $val );
				$new[ $key ] = in_array( $env, array( 'staging', 'live' ), true ) ? $env : 'staging';
				continue;
			}
			$new[ $key ] = sanitize_text_field( (string) $val );
		}
		update_option( self::OPTION_KEY, $new, false );
		delete_transient( self::TOKEN_KEY );
		return self::settings_public();
	}

	/**
	 * Settings for REST (secrets masked).
	 *
	 * @return array<string,mixed>
	 */
	public static function settings_public() {
		$settings = self::settings();
		$has_secret = '' !== (string) $settings['client_secret'];
		$has_pass   = '' !== (string) $settings['password'];
		$settings['client_secret'] = '';
		$settings['password'] = '';
		$settings['has_client_secret'] = $has_secret;
		$settings['has_password'] = $has_pass;
		$settings['official_plugin_active'] = self::official_plugin_active();
		$settings['callback_url'] = class_exists( 'Digipay_Callback_Handler', false )
			? Digipay_Callback_Handler::callback_url()
			: '';
		$settings['default_icon_url'] = self::default_icon_url();
		$settings['resolved_icon_url'] = self::resolve_icon_url( (string) ( $settings['icon_url'] ?? '' ) );
		return $settings;
	}

	/**
	 * Checkout title for a DigiPay method key (ipg|wallet|cpg|bpg).
	 *
	 * @param string $key Method key.
	 * @return string
	 */
	public static function gateway_title( $key ) {
		$key = sanitize_key( (string) $key );
		$s   = self::settings();
		$field = 'title_' . $key;
		$title = isset( $s[ $field ] ) ? trim( (string) $s[ $field ] ) : '';
		if ( '' !== $title ) {
			return $title;
		}
		$defaults = self::defaults();
		return isset( $defaults[ $field ] ) ? (string) $defaults[ $field ] : 'دیجی‌پی';
	}

	/**
	 * @param string $key Method key.
	 * @return string
	 */
	public static function gateway_description( $key ) {
		$key = sanitize_key( (string) $key );
		$s   = self::settings();
		$field = 'description_' . $key;
		$desc = isset( $s[ $field ] ) ? (string) $s[ $field ] : '';
		if ( '' !== $desc ) {
			return $desc;
		}
		$defaults = self::defaults();
		return isset( $defaults[ $field ] ) ? (string) $defaults[ $field ] : '';
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function settings() {
		$defaults = self::defaults();
		$raw = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		// Strip UI-only keys accidentally persisted by older saves.
		foreach ( array( 'has_client_secret', 'has_password', 'callback_url', 'official_plugin_active', 'default_icon_url', 'resolved_icon_url' ) as $junk ) {
			unset( $raw[ $junk ] );
		}
		// Bridge: prefer official WC option bags when present.
		if ( class_exists( 'Webino_Payment_Gateway_Bridge', false ) ) {
			$wc = Webino_Payment_Gateway_Bridge::read_wc_settings(
				array(
					'woocommerce_digipay_settings',
					'woocommerce_digipay_ipg_settings',
					'woocommerce_digipay_upg_settings',
				)
			);
			if ( ! empty( $wc ) && self::official_plugin_active() ) {
				foreach ( array( 'client_id', 'client_secret', 'username', 'password', 'environment' ) as $k ) {
					if ( ! empty( $wc[ $k ] ) ) {
						$raw[ $k ] = $wc[ $k ];
					}
				}
			}
		}
		return wp_parse_args( $raw, $defaults );
	}

	/**
	 * @return string
	 */
	public static function base_url() {
		$s = self::settings();
		return 'live' === $s['environment'] ? 'https://api.mydigipay.com/digipay/api' : 'https://uat.mydigipay.info/digipay/api';
	}

	/**
	 * @return string|WP_Error
	 */
	public static function get_access_token() {
		$cached = get_transient( self::TOKEN_KEY );
		if ( is_array( $cached ) && ! empty( $cached['access_token'] ) ) {
			return (string) $cached['access_token'];
		}

		$s = self::settings();
		foreach ( array( 'client_id', 'client_secret', 'username', 'password' ) as $field ) {
			if ( empty( $s[ $field ] ) ) {
				return new WP_Error( 'digipay_missing_credentials', __( 'DigiPay credentials are incomplete.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
		}

		// Try refresh_token first when we still have one stored outside TTL window.
		$refresh_store = get_option( 'webino_digipay_upg_refresh', '' );
		if ( is_string( $refresh_store ) && '' !== $refresh_store ) {
			$refreshed = self::request_token(
				array(
					'grant_type'    => 'refresh_token',
					'refresh_token' => $refresh_store,
				),
				$s
			);
			if ( ! is_wp_error( $refreshed ) ) {
				return (string) $refreshed['access_token'];
			}
		}

		$body = self::request_token(
			array(
				'username'   => $s['username'],
				'password'   => $s['password'],
				'grant_type' => 'password',
			),
			$s
		);
		if ( is_wp_error( $body ) ) {
			return $body;
		}
		return (string) $body['access_token'];
	}

	/**
	 * @param array<string,string> $form Form body.
	 * @param array<string,mixed>  $s Settings.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function request_token( array $form, array $s ) {
		$auth = base64_encode( $s['client_id'] . ':' . $s['client_secret'] );
		$res  = wp_remote_post(
			trailingslashit( self::base_url() ) . 'oauth/token',
			array(
				'timeout' => 25,
				'headers' => array(
					'Authorization' => 'Basic ' . $auth,
				),
				'body'    => $form,
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$code = wp_remote_retrieve_response_code( $res );
		$body = json_decode( wp_remote_retrieve_body( $res ), true );
		if ( $code < 200 || $code >= 300 || ! is_array( $body ) || empty( $body['access_token'] ) ) {
			return new WP_Error( 'digipay_auth_failed', __( 'Failed to authenticate with DigiPay.', 'webino-dashboard' ), array( 'status' => 502, 'response' => $body ) );
		}
		$ttl = isset( $body['expires_in'] ) ? max( 60, (int) $body['expires_in'] - 60 ) : 300;
		set_transient( self::TOKEN_KEY, $body, $ttl );
		if ( ! empty( $body['refresh_token'] ) ) {
			update_option( 'webino_digipay_upg_refresh', (string) $body['refresh_token'], false );
		}
		return $body;
	}
}
