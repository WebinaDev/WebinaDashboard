<?php
/**
 * Fired during plugin activation
 *
 * @package    WFCP
 * @subpackage WFCP/includes
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Fired during plugin activation.
 */
class WFCP_Activator {

	/**
	 * Activate plugin
	 */
	public static function activate() {
		// Set default options
		$default_settings = self::get_default_settings();
		
		// Check if settings already exist
		$existing_settings = get_option( 'wfcp_settings', array() );
		
		// Merge with defaults (preserve existing settings)
		$settings = wp_parse_args( $existing_settings, $default_settings );
		
		update_option( 'wfcp_settings', $settings );

		if ( class_exists( 'WFCP_Wholesale_Partner', false ) ) {
			WFCP_Wholesale_Partner::register_role();
		}
		
		// Set version
		update_option( 'wfcp_version', WFCP_VERSION );
		
		// Flush rewrite rules
		flush_rewrite_rules();
	}

	/**
	 * Ensure marketplace pricing sections exist for existing installs.
	 */
	public static function maybe_upgrade_settings() {
		$settings = get_option( 'wfcp_settings', array() );
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}
		$defaults = self::get_default_settings();
		$changed  = false;
		$sections = array( 'digikala', 'basalam', 'technolife', 'snappshop', 'tapsishop', 'zarehbin', 'emalls', 'snapppay-search', 'torob', 'wholesale' );
		foreach ( $sections as $section ) {
			if ( ! isset( $settings[ $section ] ) || ! is_array( $settings[ $section ] ) ) {
				$settings[ $section ] = $defaults[ $section ];
				$changed = true;
			} else {
				$orig   = $settings[ $section ];
				$merged = wp_parse_args( $orig, $defaults[ $section ] );
				if ( 'wholesale' === $section && isset( $defaults[ $section ]['defaults'] ) && is_array( $defaults[ $section ]['defaults'] ) ) {
					$prev_defaults = isset( $merged['defaults'] ) && is_array( $merged['defaults'] ) ? $merged['defaults'] : array();
					$merged['defaults'] = wp_parse_args( $prev_defaults, $defaults[ $section ]['defaults'] );
					$migrated = self::migrate_wholesale_flags( $orig, $merged );
					if ( $migrated !== $merged ) {
						$merged  = $migrated;
						$changed = true;
					}
				}
				if ( $merged !== $settings[ $section ] ) {
					$settings[ $section ] = $merged;
					$changed = true;
				}
			}
		}

		foreach ( array( 'retail', 'installment' ) as $core_section ) {
			if ( ! isset( $settings[ $core_section ] ) || ! is_array( $settings[ $core_section ] ) ) {
				$settings[ $core_section ] = $defaults[ $core_section ];
				$changed                   = true;
				continue;
			}
			$merged = wp_parse_args( $settings[ $core_section ], $defaults[ $core_section ] );
			if ( $merged !== $settings[ $core_section ] ) {
				$settings[ $core_section ] = $merged;
				$changed                     = true;
			}
		}

		if ( $changed ) {
			update_option( 'wfcp_settings', $settings );
		}
	}

	/**
	 * Get default settings
	 *
	 * @return array
	 */
	public static function get_default_settings() {
		return array(
			'general' => array(
				'enabled'                => true,
				'currency'               => 'IRR',
				'exchange_rate'          => 42000,
				'exchange_rate_enabled'  => true, // When false, never apply exchange rate.
				'purchase_currency'      => 'base', // 'base' = USD, 'display' = IRR/IRT
				'default_purchase_type'  => 'cash',
				'api_enabled'            => false,
				'api_key'          => '',
				'api_symbol'       => 'USD',
				'auto_update_enabled' => false,
				'auto_update_hour' => 0,
			),
			'retail' => array(
				'profit_percent' => 20,
				'round_enabled'  => true,
				'round_to'      => 1000,
				'gateways'      => array(),
			),
			'credit' => array(
				'enabled'        => false,
				'increase_percent' => 5,
				'gateways'       => array(),
				'texts'          => array(
					'title'       => 'خرید اعتباری',
					'button_text' => 'افزودن اعتباری',
				),
			),
			'installment' => array(
				'enabled'       => false,
				'round_enabled' => true,
				'round_to'      => 1000,
				'plans'         => array(
					array(
						'months'   => 3,
						'interest' => 5,
					),
					array(
						'months'   => 6,
						'interest' => 10,
					),
				),
				'gateways'            => array(),
				'pdp_theme'           => 'classic',
				'gateway_logos_only'  => true,
				'texts'     => array(
					'title'       => 'خرید اقساطی',
					'button_text' => 'افزودن اقساطی',
				),
			),
			'wholesale' => array(
				'enabled'                   => false,
				'strategy'                  => 'global',
				'discount_percent'          => 10,
				'gateways'                  => array(),
				'shipping_methods'          => array(),
				'category_rules'            => array(),
				'partner_role'              => 'webino_partner',
				'threshold_enabled'         => false,
				'partner_enabled'           => false,
				'partner_only'              => false,
				'hide_retail_from_partner'  => false,
				'defaults'                  => array(
					'min_qty'           => 0,
					'min_weight'        => 0,
					'qty_step'          => 0,
					'min_distinct_skus' => 0,
				),
				'category_variety_rules'    => array(),
			),
			'digikala' => array(
				'enabled'        => false,
				'profit_percent' => 20,
				'extra_percent'  => 0,
				'round_enabled'  => true,
				'round_to'       => 1000,
				'price_unit'     => 'rial',
			),
			'basalam' => array(
				'enabled'        => false,
				'profit_percent' => 20,
				'extra_percent'  => 0,
				'round_enabled'  => true,
				'round_to'       => 1000,
				'price_unit'     => 'toman',
			),
			'technolife' => array(
				'enabled'        => false,
				'profit_percent' => 20,
				'extra_percent'  => 0,
				'round_enabled'  => true,
				'round_to'       => 1000,
				'price_unit'     => 'toman',
			),
			'snappshop' => array(
				'enabled'        => false,
				'profit_percent' => 20,
				'extra_percent'  => 0,
				'round_enabled'  => true,
				'round_to'       => 1000,
				'price_unit'     => 'toman',
			),
			'tapsishop' => array(
				'enabled'        => false,
				'profit_percent' => 20,
				'extra_percent'  => 0,
				'round_enabled'  => true,
				'round_to'       => 1000,
				'price_unit'     => 'toman',
			),
			'zarehbin' => array(
				'enabled'        => false,
				'price_mode'     => 'retail',
				'profit_percent' => 20,
				'extra_percent'  => 0,
				'round_enabled'  => true,
				'round_to'       => 1000,
				'price_unit'     => 'toman',
			),
			'emalls' => array(
				'enabled'        => false,
				'price_mode'     => 'retail',
				'profit_percent' => 20,
				'extra_percent'  => 0,
				'round_enabled'  => true,
				'round_to'       => 1000,
				'price_unit'     => 'toman',
			),
			'snapppay-search' => array(
				'enabled'        => false,
				'price_mode'     => 'retail',
				'profit_percent' => 20,
				'extra_percent'  => 0,
				'round_enabled'  => true,
				'round_to'       => 1000,
				'price_unit'     => 'toman',
			),
			'torob' => array(
				'enabled'        => false,
				'price_mode'     => 'retail',
				'profit_percent' => 20,
				'extra_percent'  => 0,
				'round_enabled'  => true,
				'round_to'       => 1000,
				'price_unit'     => 'toman',
			),
			'notifications' => array(
				'installment_text'        => 'خرید اقساطی',
				'credit_text'             => 'خرید اعتباری',
				'cash_description'        => '',
				'installment_description' => '',
				'credit_description'      => '',
				'wholesale_description'   => '',
				'need_review'             => 'نیاز به بررسی',
				'show_cash_badge'         => true,
				'custom_cash_label'       => '',
				'show_install_badge'      => true,
				'custom_install_label'    => '',
				'show_credit_badge'       => true,
				'show_guaranty_label'     => false,
				'guaranty_text'           => 'گارانتی ۲۴ ماهه',
				'alert_product_enabled'   => true,
				'alert_cart_enabled'      => true,
				'alert_checkout_enabled'  => true,
				'alert_product_text'      => 'در صورت نیاز می‌توانید روش پرداخت اقساطی یا اعتباری را از باکس قیمت انتخاب کنید، سپس محصول را به سبد اضافه کنید.',
				'alert_cart_text'         => 'می‌توانید روش پرداخت همه محصولات سبد را از بخش زیر به نقدی، اقساطی یا اعتباری تغییر دهید.',
				'alert_checkout_text'     => 'روش پرداخت فعلی سبد: {type}. برای تغییر به اقساطی یا اعتباری به سبد خرید برگردید و روش را عوض کنید.',
			),
			'style' => array(
				'placement'              => 'before_cart',
				'box_background'         => '#ffffff',
				'box_border_color'       => '#e0e0e0',
				'button_background'      => '#2271b1',
				'button_text_color'      => '#ffffff',
				'price_color'            => '#2271b1',
				'border_radius'          => 8,
				'alert_bg'               => '#ffffff',
				'alert_text_color'       => '#9A3412',
				'alert_border_color'     => '#FDBA74',
				'alert_accent'           => '#EA580C',
				'badge_cash_bg'          => '#ECFDF5',
				'badge_cash_text'        => '#047857',
				'badge_credit_bg'        => '#EFF6FF',
				'badge_credit_text'      => '#1D4ED8',
				'badge_installment_bg'   => '#FFFBEB',
				'badge_installment_text' => '#B45309',
				'timeline_dot'           => '#c45c26',
				'timeline_line'          => '#d6b089',
				'timeline_today_text'    => '#111827',
				'timeline_future_text'   => '#6b7280',
			),
		);
	}

	/**
	 * Map legacy partner_only / hide_retail_from_partner onto dual mode flags.
	 *
	 * @param array<string,mixed> $orig   Stored wholesale section before merge.
	 * @param array<string,mixed> $merged Merged with defaults.
	 * @return array<string,mixed>
	 */
	private static function migrate_wholesale_flags( $orig, $merged ) {
		if ( ! is_array( $orig ) || ! is_array( $merged ) ) {
			return $merged;
		}
		if ( array_key_exists( 'threshold_enabled', $orig ) || array_key_exists( 'partner_enabled', $orig ) ) {
			return $merged;
		}

		$old_partner_only = true;
		if ( array_key_exists( 'partner_only', $orig ) ) {
			$v                = $orig['partner_only'];
			$old_partner_only = in_array( $v, array( true, 1, '1', 'true', 'yes', 'on' ), true );
		}

		if ( $old_partner_only ) {
			$merged['partner_enabled']   = true;
			$merged['threshold_enabled'] = false;
		} else {
			$en                          = $merged['enabled'] ?? false;
			$enabled                     = in_array( $en, array( true, 1, '1', 'true', 'yes', 'on' ), true );
			$merged['threshold_enabled'] = $enabled;
			$merged['partner_enabled']   = self::partner_role_in_use();
		}

		$merged['hide_retail_from_partner'] = false;
		return $merged;
	}

	/**
	 * @return bool
	 */
	private static function partner_role_in_use() {
		if ( ! function_exists( 'count_users' ) ) {
			return (bool) get_role( 'webino_partner' );
		}
		$counts = count_users();
		$avail  = isset( $counts['avail_roles'] ) && is_array( $counts['avail_roles'] ) ? $counts['avail_roles'] : array();
		return ! empty( $avail['webino_partner'] );
	}
}

