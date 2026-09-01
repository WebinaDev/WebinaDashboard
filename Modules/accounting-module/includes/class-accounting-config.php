<?php
/**
 * Accounting module settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option webino_accounting_settings.
 */
final class Accounting_Config {
	const OPTION_KEY = 'webino_accounting_settings';

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'company_name'           => '',
			'economic_code'          => '',
			'national_id'            => '',
			'postal_code'             => '',
			'address'                => '',
			'province'               => '',
			'city'                   => '',
			'phone'                  => '',
			'fiscal_id'              => '',
			'certificate_pem'        => '',
			'private_key_enc'        => '',
			'moadian_sandbox'        => false,
			'moadian_proxy'          => '',
			'auto_send_moadian'      => false,
			'default_invoice_type'   => 2,
			'gateway_cash_map'       => array(),
			'modules_enabled'        => array(
				'payroll'      => true,
				'projects'     => true,
				'production'   => true,
				'installments' => true,
				'moadian'      => true,
				'hesabfa'      => false,
			),
			'hesabfa_enabled'                 => false,
			'hesabfa_api_key'                 => '',
			'hesabfa_login_token_enc'         => '',
			'hesabfa_user_id'                 => '',
			'hesabfa_password_enc'            => '',
			'hesabfa_year_id'                 => 0,
			'hesabfa_currency'                => 'IRT',
			'hesabfa_default_bank_code'       => '',
			'hesabfa_default_warehouse_code'  => '',
			'hesabfa_hook_password'           => '',
			'hesabfa_last_change_id'          => 0,
			'hesabfa_link_wc_only'            => true,
			'hesabfa_sync_entities'           => array(
				'contacts'       => true,
				'items'          => true,
				'invoices'       => true,
				'receipts'       => true,
				'warehouses'     => true,
				'cash_accounts'  => true,
				'journals'       => true,
				'bank_transfers' => true,
				'categories'     => true,
				'projects'       => true,
				'accounts'       => true,
			),
			'wizard_done'            => false,
			'sync_order_statuses'    => array( 'processing', 'completed' ),
			'snapshot_cogs'          => true,
			'default_vat_rate'       => 10,
			'default_warehouse_id'   => 0,
			'account_map'            => array(
				'sales'               => '4101',
				'vat_payable'         => '2101',
				'cogs'                => '5101',
				'inventory'           => '1301',
				'cash'                => '1101',
				'bank'                => '1102',
				'gateway'             => '1103',
				'receivables'         => '1201',
				'payables'            => '2102',
				'payroll_expense'     => '5201',
				'payroll_payable'     => '2103',
				'insurance_exp'       => '5202',
				'insurance_pay'       => '2104',
				'unemployment_exp'    => '5203',
				'unemployment_pay'    => '2105',
				'payroll_tax_payable' => '2106',
			),
			'payroll_tax_brackets'   => array(
				array( 'up_to' => 120000000, 'rate' => 0 ),
				array( 'up_to' => 165000000, 'rate' => 10 ),
				array( 'up_to' => 270000000, 'rate' => 15 ),
				array( 'up_to' => 400000000, 'rate' => 20 ),
				array( 'up_to' => 0, 'rate' => 30 ),
			),
			'employee_insurance_pct'     => 7,
			'employer_insurance_pct'     => 20,
			'unemployment_insurance_pct' => 3,
			'payroll_min_daily_wage'     => 3463656,
			'payroll_ceiling_multiplier' => 7,
			'payroll_tax_exemption'      => 0,
			'payroll_legal_food'         => 22000000,
			'payroll_legal_housing'      => 9000000,
			'payroll_legal_marriage'     => 5000000,
			'payroll_legal_seniority'    => 2820000,
			'payroll_overtime_rate'      => 1.4,
			'payroll_night_ot_rate'      => 1.35,
			'payroll_holiday_ot_rate'    => 1.4,
			'payroll_child_benefit_each' => 7167750,
			'payroll_volume_insurable'   => true,
			'payroll_sick_counts_worked' => true,
			'default_workshop_id'        => 0,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		$stored = get_option( self::OPTION_KEY, array() );
		return wp_parse_args( is_array( $stored ) ? $stored : array(), self::defaults() );
	}

	/**
	 * Public settings (secrets masked).
	 *
	 * @return array<string,mixed>
	 */
	public static function get_public() {
		$s = self::get();
		$s['has_private_key']  = '' !== (string) $s['private_key_enc'];
		$s['has_certificate']  = '' !== (string) $s['certificate_pem'];
		$s['private_key_enc']  = '';
		$s['private_key']      = '';
		$s['certificate_pem']  = $s['has_certificate'] ? '••••••••' : '';
		$s['has_hesabfa_login_token'] = '' !== (string) ( $s['hesabfa_login_token_enc'] ?? '' );
		$s['has_hesabfa_password']    = '' !== (string) ( $s['hesabfa_password_enc'] ?? '' );
		$s['hesabfa_login_token_enc'] = '';
		$s['hesabfa_password_enc']    = '';
		$s['hesabfa_login_token']     = '';
		$s['hesabfa_password']        = '';
		$api = (string) ( $s['hesabfa_api_key'] ?? '' );
		if ( '' !== $api ) {
			$s['hesabfa_api_key_masked'] = strlen( $api ) > 8
				? ( substr( $api, 0, 4 ) . '••••' . substr( $api, -4 ) )
				: '••••••••';
			$s['hesabfa_api_key'] = '';
		} else {
			$s['hesabfa_api_key_masked'] = '';
		}
		$hook = (string) ( $s['hesabfa_hook_password'] ?? '' );
		if ( '' !== $hook ) {
			$s['hesabfa_hook_password'] = '••••••••';
			$s['has_hesabfa_hook_password'] = true;
		} else {
			$s['has_hesabfa_hook_password'] = false;
		}
		return $s;
	}

	/**
	 * @param array<string,mixed> $data Raw.
	 * @return array<string,mixed>
	 */
	public static function save( array $data ) {
		$old = self::get();
		$new = $old;

		$text_keys = array( 'company_name', 'economic_code', 'national_id', 'postal_code', 'address', 'province', 'city', 'phone', 'fiscal_id', 'moadian_proxy' );
		foreach ( $text_keys as $key ) {
			if ( array_key_exists( $key, $data ) ) {
				$new[ $key ] = sanitize_text_field( (string) $data[ $key ] );
			}
		}

		if ( array_key_exists( 'moadian_sandbox', $data ) ) {
			$new['moadian_sandbox'] = ! empty( $data['moadian_sandbox'] );
		}
		if ( array_key_exists( 'auto_send_moadian', $data ) ) {
			$new['auto_send_moadian'] = ! empty( $data['auto_send_moadian'] );
		}
		if ( array_key_exists( 'wizard_done', $data ) ) {
			$new['wizard_done'] = ! empty( $data['wizard_done'] );
		}
		if ( array_key_exists( 'snapshot_cogs', $data ) ) {
			$new['snapshot_cogs'] = ! empty( $data['snapshot_cogs'] );
		}
		if ( isset( $data['default_invoice_type'] ) ) {
			$new['default_invoice_type'] = max( 1, min( 3, (int) $data['default_invoice_type'] ) );
		}
		if ( isset( $data['default_vat_rate'] ) ) {
			$new['default_vat_rate'] = (float) $data['default_vat_rate'];
		}
		if ( isset( $data['default_warehouse_id'] ) ) {
			$new['default_warehouse_id'] = absint( $data['default_warehouse_id'] );
		}
		if ( isset( $data['sync_order_statuses'] ) && is_array( $data['sync_order_statuses'] ) ) {
			$new['sync_order_statuses'] = array_values( array_filter( array_map( 'sanitize_key', $data['sync_order_statuses'] ) ) );
		}
		if ( isset( $data['account_map'] ) && is_array( $data['account_map'] ) ) {
			$map = $old['account_map'];
			foreach ( $data['account_map'] as $k => $v ) {
				$map[ sanitize_key( (string) $k ) ] = sanitize_text_field( (string) $v );
			}
			$new['account_map'] = $map;
		}
		if ( isset( $data['gateway_cash_map'] ) && is_array( $data['gateway_cash_map'] ) ) {
			$map = array();
			foreach ( $data['gateway_cash_map'] as $k => $v ) {
				$map[ sanitize_key( (string) $k ) ] = absint( $v );
			}
			$new['gateway_cash_map'] = $map;
		}
		if ( isset( $data['modules_enabled'] ) && is_array( $data['modules_enabled'] ) ) {
			$mods = $old['modules_enabled'];
			foreach ( $data['modules_enabled'] as $k => $v ) {
				$mods[ sanitize_key( (string) $k ) ] = ! empty( $v );
			}
			$new['modules_enabled'] = $mods;
		}
		if ( isset( $data['employee_insurance_pct'] ) ) {
			$new['employee_insurance_pct'] = (float) $data['employee_insurance_pct'];
		}
		if ( isset( $data['employer_insurance_pct'] ) ) {
			$new['employer_insurance_pct'] = (float) $data['employer_insurance_pct'];
		}
		if ( isset( $data['unemployment_insurance_pct'] ) ) {
			$new['unemployment_insurance_pct'] = (float) $data['unemployment_insurance_pct'];
		}
		foreach (
			array(
				'payroll_min_daily_wage',
				'payroll_ceiling_multiplier',
				'payroll_tax_exemption',
				'payroll_legal_food',
				'payroll_legal_housing',
				'payroll_legal_marriage',
				'payroll_legal_seniority',
				'payroll_overtime_rate',
				'payroll_night_ot_rate',
				'payroll_holiday_ot_rate',
				'payroll_child_benefit_each',
			) as $pk
		) {
			if ( isset( $data[ $pk ] ) ) {
				$new[ $pk ] = (float) $data[ $pk ];
			}
		}
		if ( array_key_exists( 'payroll_volume_insurable', $data ) ) {
			$new['payroll_volume_insurable'] = ! empty( $data['payroll_volume_insurable'] );
		}
		if ( array_key_exists( 'payroll_sick_counts_worked', $data ) ) {
			$new['payroll_sick_counts_worked'] = ! empty( $data['payroll_sick_counts_worked'] );
		}
		if ( isset( $data['default_workshop_id'] ) ) {
			$new['default_workshop_id'] = absint( $data['default_workshop_id'] );
		}
		if ( isset( $data['payroll_tax_brackets'] ) && is_array( $data['payroll_tax_brackets'] ) ) {
			$brackets = array();
			foreach ( $data['payroll_tax_brackets'] as $b ) {
				if ( ! is_array( $b ) ) {
					continue;
				}
				$brackets[] = array(
					'up_to' => (float) ( $b['up_to'] ?? 0 ),
					'rate'  => (float) ( $b['rate'] ?? 0 ),
				);
			}
			if ( $brackets ) {
				$new['payroll_tax_brackets'] = $brackets;
			}
		}

		if ( ! empty( $data['private_key'] ) ) {
			$new['private_key_enc'] = self::encrypt_secret( (string) $data['private_key'] );
		}
		if ( array_key_exists( 'certificate_pem', $data ) && is_string( $data['certificate_pem'] ) && '' !== trim( $data['certificate_pem'] ) && 0 !== strpos( trim( $data['certificate_pem'] ), '•' ) ) {
			$new['certificate_pem'] = sanitize_textarea_field( (string) $data['certificate_pem'] );
		}

		if ( array_key_exists( 'hesabfa_enabled', $data ) ) {
			$new['hesabfa_enabled'] = ! empty( $data['hesabfa_enabled'] );
			$new['modules_enabled']['hesabfa'] = $new['hesabfa_enabled'];
		}
		if ( array_key_exists( 'hesabfa_api_key', $data ) && is_string( $data['hesabfa_api_key'] ) && '' !== trim( $data['hesabfa_api_key'] ) && false === strpos( $data['hesabfa_api_key'], '•' ) ) {
			$new['hesabfa_api_key'] = sanitize_text_field( (string) $data['hesabfa_api_key'] );
		}
		if ( array_key_exists( 'hesabfa_login_token', $data ) && is_string( $data['hesabfa_login_token'] ) && '' !== trim( $data['hesabfa_login_token'] ) && false === strpos( $data['hesabfa_login_token'], '•' ) ) {
			$new['hesabfa_login_token_enc'] = self::encrypt_secret( (string) $data['hesabfa_login_token'] );
		}
		if ( array_key_exists( 'hesabfa_user_id', $data ) ) {
			$new['hesabfa_user_id'] = sanitize_text_field( (string) $data['hesabfa_user_id'] );
		}
		if ( array_key_exists( 'hesabfa_password', $data ) && is_string( $data['hesabfa_password'] ) && '' !== trim( $data['hesabfa_password'] ) && false === strpos( $data['hesabfa_password'], '•' ) ) {
			$new['hesabfa_password_enc'] = self::encrypt_secret( (string) $data['hesabfa_password'] );
		}
		if ( isset( $data['hesabfa_year_id'] ) ) {
			$new['hesabfa_year_id'] = absint( $data['hesabfa_year_id'] );
		}
		if ( array_key_exists( 'hesabfa_currency', $data ) ) {
			$cur = strtoupper( sanitize_text_field( (string) $data['hesabfa_currency'] ) );
			$new['hesabfa_currency'] = in_array( $cur, array( 'IRR', 'IRT' ), true ) ? $cur : 'IRT';
		}
		foreach ( array( 'hesabfa_default_bank_code', 'hesabfa_default_warehouse_code' ) as $hk ) {
			if ( array_key_exists( $hk, $data ) ) {
				$new[ $hk ] = sanitize_text_field( (string) $data[ $hk ] );
			}
		}
		if ( array_key_exists( 'hesabfa_hook_password', $data ) && is_string( $data['hesabfa_hook_password'] ) && '' !== trim( $data['hesabfa_hook_password'] ) && false === strpos( $data['hesabfa_hook_password'], '•' ) ) {
			$new['hesabfa_hook_password'] = sanitize_text_field( (string) $data['hesabfa_hook_password'] );
		}
		if ( isset( $data['hesabfa_last_change_id'] ) ) {
			$new['hesabfa_last_change_id'] = absint( $data['hesabfa_last_change_id'] );
		}
		if ( array_key_exists( 'hesabfa_link_wc_only', $data ) ) {
			$new['hesabfa_link_wc_only'] = ! empty( $data['hesabfa_link_wc_only'] );
		}
		if ( isset( $data['hesabfa_sync_entities'] ) && is_array( $data['hesabfa_sync_entities'] ) ) {
			$ents = $old['hesabfa_sync_entities'];
			foreach ( $data['hesabfa_sync_entities'] as $k => $v ) {
				$ents[ sanitize_key( (string) $k ) ] = ! empty( $v );
			}
			$new['hesabfa_sync_entities'] = $ents;
		}

		update_option( self::OPTION_KEY, $new, false );
		return self::get_public();
	}

	/**
	 * @return string
	 */
	public static function hesabfa_login_token() {
		$enc = (string) ( self::get()['hesabfa_login_token_enc'] ?? '' );
		return '' === $enc ? '' : self::decrypt_secret( $enc );
	}

	/**
	 * @return string
	 */
	public static function hesabfa_password() {
		$enc = (string) ( self::get()['hesabfa_password_enc'] ?? '' );
		return '' === $enc ? '' : self::decrypt_secret( $enc );
	}

	/**
	 * Convert local shop amount to Hesabfa amount (business currency).
	 *
	 * @param float $amount Local amount (usually WC currency).
	 * @return float
	 */
	public static function hesabfa_amount( $amount ) {
		$cfg      = self::get();
		$target   = strtoupper( (string) ( $cfg['hesabfa_currency'] ?? 'IRT' ) );
		$shop     = strtoupper( (string) ( function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRT' ) );
		$amount   = (float) $amount;
		if ( $shop === $target ) {
			return $amount;
		}
		// IRT (toman) ↔ IRR (rial).
		if ( 'IRT' === $shop && 'IRR' === $target ) {
			return $amount * 10;
		}
		if ( 'IRR' === $shop && 'IRT' === $target ) {
			return $amount / 10;
		}
		return $amount;
	}

	/**
	 * Convert Hesabfa amount to local shop amount.
	 *
	 * @param float $amount Hesabfa amount.
	 * @return float
	 */
	public static function hesabfa_amount_to_local( $amount ) {
		$cfg    = self::get();
		$source = strtoupper( (string) ( $cfg['hesabfa_currency'] ?? 'IRT' ) );
		$shop   = strtoupper( (string) ( function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRT' ) );
		$amount = (float) $amount;
		if ( $shop === $source ) {
			return $amount;
		}
		if ( 'IRR' === $source && 'IRT' === $shop ) {
			return $amount / 10;
		}
		if ( 'IRT' === $source && 'IRR' === $shop ) {
			return $amount * 10;
		}
		return $amount;
	}

	/**
	 * Decrypted private key PEM.
	 *
	 * @return string
	 */
	public static function private_key_pem() {
		$enc = (string) self::get()['private_key_enc'];
		if ( '' === $enc ) {
			return '';
		}
		return self::decrypt_secret( $enc );
	}

	/**
	 * @param string $plain Plaintext.
	 * @return string
	 */
	public static function encrypt_secret( $plain ) {
		$key = self::crypto_key();
		$iv  = substr( hash( 'sha256', $key . 'iv', true ), 0, 16 );
		$raw = openssl_encrypt( (string) $plain, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv );
		return is_string( $raw ) ? base64_encode( $raw ) : '';
	}

	/**
	 * @param string $enc Encoded.
	 * @return string
	 */
	public static function decrypt_secret( $enc ) {
		$key = self::crypto_key();
		$iv  = substr( hash( 'sha256', $key . 'iv', true ), 0, 16 );
		$raw = base64_decode( (string) $enc, true );
		if ( false === $raw ) {
			return '';
		}
		$out = openssl_decrypt( $raw, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv );
		return is_string( $out ) ? $out : '';
	}

	/**
	 * @return string
	 */
	private static function crypto_key() {
		$salt = defined( 'AUTH_KEY' ) ? AUTH_KEY : 'webino-accounting';
		return hash( 'sha256', $salt . '|webino_acc', true );
	}

	/**
	 * Convert shop amount to Rial integer for Moadian.
	 *
	 * @param float       $amount   Amount.
	 * @param string|null $currency Currency.
	 * @return int
	 */
	public static function amount_to_rial( $amount, $currency = null ) {
		$currency = strtoupper( (string) ( $currency ?: ( function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRT' ) ) );
		$amount   = (float) $amount;
		switch ( $currency ) {
			case 'IRT':
			case 'TOMAN':
				return (int) round( $amount * 10 );
			case 'IRHR':
				return (int) round( $amount * 1000 );
			case 'IRHT':
				return (int) round( $amount * 10000 );
			case 'IRR':
			default:
				return (int) round( $amount );
		}
	}
}
