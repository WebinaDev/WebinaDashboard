<?php
/**
 * ZarinPal module settings + WooCommerce gateway sync.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option webino_zarinpal_settings.
 */
final class Zarinpal_Config {
	const OPTION_KEY = 'webino_zarinpal_settings';
	const GATEWAY_ID = 'zarinpal_gateway';

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'merchant_id'            => '',
			'access_token'           => '',
			'sandbox'                => true,
			'gateway_enabled'        => false,
			'title'                  => 'زرین‌پال',
			'description'            => 'پرداخت امن از طریق زرین‌پال.',
			'instructions'           => '',
			'success_message'        => 'پرداخت موفق. کد پیگیری: {transaction_id}',
			'failed_message'         => 'پرداخت ناموفق: {fault}',
			'order_button_text'      => 'پرداخت با زرین‌پال',
			'fee_label'              => 'کارمزد زرین‌پال',
			'cancelled_message'      => 'پرداخت توسط کاربر لغو شد.',
			'invalid_token_message'  => 'توکن پرداخت نامعتبر است.',
			'payment_description'    => 'سفارش #{order_id}',
			'icon_url'               => '',
			'fee_payer'              => 'merchant',
			'callback_url'           => '',
			'redact_logs'            => true,
		);
	}

	/**
	 * Bundled official logo URL (no remote hotlink).
	 *
	 * @return string
	 */
	public static function default_icon_url() {
		if ( defined( 'WEBINO_DASHBOARD_FILE' ) ) {
			return plugins_url( 'Modules/zarinpal-gateway-module/assets/zarinpal-logo.png', WEBINO_DASHBOARD_FILE );
		}
		return plugins_url( 'assets/zarinpal-logo.png', dirname( __DIR__ ) . '/bootstrap.php' );
	}

	/**
	 * Configured icon_url or bundled default.
	 *
	 * @param string|null $configured Optional override.
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

		$wc = get_option( 'woocommerce_' . self::GATEWAY_ID . '_settings', array() );
		if ( is_array( $wc ) ) {
			if ( isset( $wc['enabled'] ) ) {
				$out['gateway_enabled'] = ( 'yes' === (string) $wc['enabled'] );
			}
			if ( isset( $wc['title'] ) && '' !== (string) $wc['title'] ) {
				$out['title'] = (string) $wc['title'];
			}
			if ( isset( $wc['description'] ) ) {
				$out['description'] = (string) $wc['description'];
			}
			if ( isset( $wc['instructions'] ) ) {
				$out['instructions'] = (string) $wc['instructions'];
			}
			if ( isset( $wc['success_message'] ) && '' !== (string) $wc['success_message'] ) {
				$out['success_message'] = (string) $wc['success_message'];
			}
			if ( isset( $wc['failed_message'] ) && '' !== (string) $wc['failed_message'] ) {
				$out['failed_message'] = (string) $wc['failed_message'];
			}
			if ( isset( $wc['order_button_text'] ) && '' !== (string) $wc['order_button_text'] ) {
				$out['order_button_text'] = (string) $wc['order_button_text'];
			}
			if ( isset( $wc['fee_label'] ) && '' !== (string) $wc['fee_label'] ) {
				$out['fee_label'] = (string) $wc['fee_label'];
			}
			if ( isset( $wc['cancelled_message'] ) && '' !== (string) $wc['cancelled_message'] ) {
				$out['cancelled_message'] = (string) $wc['cancelled_message'];
			}
			if ( isset( $wc['invalid_token_message'] ) && '' !== (string) $wc['invalid_token_message'] ) {
				$out['invalid_token_message'] = (string) $wc['invalid_token_message'];
			}
			if ( isset( $wc['payment_description'] ) && '' !== (string) $wc['payment_description'] ) {
				$out['payment_description'] = (string) $wc['payment_description'];
			}
			if ( isset( $wc['icon_url'] ) ) {
				$out['icon_url'] = (string) $wc['icon_url'];
			}
			if ( isset( $wc['fee_payer'] ) && '' !== (string) $wc['fee_payer'] ) {
				$out['fee_payer'] = (string) $wc['fee_payer'];
			}
		}

		if ( '' === (string) $out['callback_url'] ) {
			$out['callback_url'] = self::default_callback_url();
		}

		return $out;
	}

	/**
	 * Public settings for REST (secrets masked).
	 *
	 * @return array<string,mixed>
	 */
	public static function get_public() {
		$s = self::get();
		$has_token = '' !== (string) $s['access_token'];
		$s['access_token'] = '';
		$s['has_access_token'] = $has_token;
		$s['api_base'] = self::api_base( ! empty( $s['sandbox'] ) );
		$s['start_pay_base'] = self::start_pay_base( ! empty( $s['sandbox'] ) );
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

		$access_token = (string) $old['access_token'];
		if ( array_key_exists( 'access_token', $data ) ) {
			$incoming = trim( (string) $data['access_token'] );
			if ( '' !== $incoming ) {
				$access_token = self::sanitize_access_token( $incoming );
			}
		}

		$fee_payer = sanitize_key( (string) ( $data['fee_payer'] ?? $old['fee_payer'] ) );
		if ( ! in_array( $fee_payer, array( 'merchant', 'customer' ), true ) ) {
			$fee_payer = 'merchant';
		}

		$new = array(
			'merchant_id'           => sanitize_text_field( (string) ( $data['merchant_id'] ?? $old['merchant_id'] ) ),
			'access_token'          => $access_token,
			'sandbox'               => ! empty( $data['sandbox'] ),
			'gateway_enabled'       => ! empty( $data['gateway_enabled'] ),
			'title'                 => sanitize_text_field( (string) ( $data['title'] ?? $old['title'] ) ),
			'description'           => sanitize_textarea_field( (string) ( $data['description'] ?? $old['description'] ) ),
			'instructions'          => sanitize_textarea_field( (string) ( $data['instructions'] ?? $old['instructions'] ) ),
			'success_message'       => sanitize_textarea_field( (string) ( $data['success_message'] ?? $old['success_message'] ) ),
			'failed_message'        => sanitize_textarea_field( (string) ( $data['failed_message'] ?? $old['failed_message'] ) ),
			'order_button_text'     => sanitize_text_field( (string) ( $data['order_button_text'] ?? $old['order_button_text'] ) ),
			'fee_label'             => sanitize_text_field( (string) ( $data['fee_label'] ?? $old['fee_label'] ) ),
			'cancelled_message'     => sanitize_textarea_field( (string) ( $data['cancelled_message'] ?? $old['cancelled_message'] ) ),
			'invalid_token_message' => sanitize_textarea_field( (string) ( $data['invalid_token_message'] ?? $old['invalid_token_message'] ) ),
			'payment_description'   => sanitize_text_field( (string) ( $data['payment_description'] ?? $old['payment_description'] ) ),
			'icon_url'              => esc_url_raw( (string) ( $data['icon_url'] ?? $old['icon_url'] ) ),
			'fee_payer'             => $fee_payer,
			'callback_url'          => esc_url_raw( (string) ( $data['callback_url'] ?? $old['callback_url'] ) ),
			'redact_logs'           => array_key_exists( 'redact_logs', $data ) ? ! empty( $data['redact_logs'] ) : ! empty( $old['redact_logs'] ),
		);

		if ( '' === $new['callback_url'] ) {
			$new['callback_url'] = self::default_callback_url();
		}

		update_option( self::OPTION_KEY, $new, false );

		$wc_key = 'woocommerce_' . self::GATEWAY_ID . '_settings';
		$wc     = get_option( $wc_key, array() );
		if ( ! is_array( $wc ) ) {
			$wc = array();
		}
		$wc['enabled']               = $new['gateway_enabled'] ? 'yes' : 'no';
		$wc['title']                 = $new['title'];
		$wc['description']           = $new['description'];
		$wc['instructions']          = $new['instructions'];
		$wc['success_message']       = $new['success_message'];
		$wc['failed_message']        = $new['failed_message'];
		$wc['order_button_text']     = $new['order_button_text'];
		$wc['fee_label']             = $new['fee_label'];
		$wc['cancelled_message']     = $new['cancelled_message'];
		$wc['invalid_token_message'] = $new['invalid_token_message'];
		$wc['payment_description']   = $new['payment_description'];
		$wc['icon_url']              = $new['icon_url'];
		$wc['fee_payer']             = $new['fee_payer'];
		$wc['merchantcode']          = $new['merchant_id'];
		$wc['sandbox']               = $new['sandbox'] ? 'yes' : 'no';
		$wc['access_token']          = $new['access_token'];
		update_option( $wc_key, $wc, false );

		return self::get_public();
	}

	/**
	 * @param bool $sandbox Sandbox mode.
	 * @return string
	 */
	public static function api_base( $sandbox = null ) {
		if ( null === $sandbox ) {
			$sandbox = ! empty( self::get()['sandbox'] );
		}
		return $sandbox
			? 'https://sandbox.zarinpal.com/pg/v4/payment/'
			: 'https://payment.zarinpal.com/pg/v4/payment/';
	}

	/**
	 * @param bool $sandbox Sandbox mode.
	 * @return string
	 */
	public static function start_pay_base( $sandbox = null ) {
		if ( null === $sandbox ) {
			$sandbox = ! empty( self::get()['sandbox'] );
		}
		return $sandbox
			? 'https://sandbox.zarinpal.com/pg/StartPay/'
			: 'https://payment.zarinpal.com/pg/StartPay/';
	}

	/**
	 * @return string
	 */
	public static function graphql_url() {
		return 'https://next.zarinpal.com/api/v4/graphql';
	}

	/**
	 * @return string
	 */
	public static function default_callback_url() {
		if ( function_exists( 'WC' ) && WC() ) {
			return WC()->api_request_url( 'webino_zarinpal_gateway' );
		}
		return home_url( '/wc-api/webino_zarinpal_gateway' );
	}

	/**
	 * @param string $token Raw token.
	 * @return string
	 */
	public static function sanitize_access_token( $token ) {
		$token = trim( (string) $token );
		$token = preg_replace( '/^Bearer\s+/i', '', $token );
		return sanitize_text_field( (string) $token );
	}

	/**
	 * Authorization header value (Bearer …).
	 *
	 * @return string Empty when unset.
	 */
	public static function bearer_token() {
		$token = self::sanitize_access_token( (string) self::get()['access_token'] );
		if ( '' === $token ) {
			return '';
		}
		return 'Bearer ' . $token;
	}
}
