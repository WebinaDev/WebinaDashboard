<?php
/**
 * Price Calculator Service
 *
 * @package    WFCP
 * @subpackage WFCP/includes/services
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Price Calculator Service
 */
class WFCP_Calculator {

	/**
	 * Calculate price based on type
	 *
	 * @param float  $base_price Base purchase price.
	 * @param string $type       Price type: retail, credit, installment, wholesale.
	 * @param int    $product_id Optional. Product ID.
	 * @param array  $args       Optional. Additional arguments.
	 * @return float
	 */
	public static function calculate_price( $base_price, $type = 'retail', $product_id = null, $args = array() ) {
		// Check cache first
		$cache_key = self::get_cache_key( $base_price, $type, $product_id, $args );
		$cached    = get_transient( $cache_key );

		if ( false !== $cached ) {
			return floatval( $cached );
		}

		$price = floatval( $base_price );

		// Get exchange rate (from API if enabled, otherwise manual)
		$general = WFCP_Helper::get_settings( 'general' );
		if ( ! is_array( $general ) ) {
			$general = array();
		}
		$api_enabled = WFCP_Helper::to_bool( isset( $general['api_enabled'] ) ? $general['api_enabled'] : false );

		$exchange_rate = isset( $general['exchange_rate'] ) ? $general['exchange_rate'] : 42000;

		// If API is enabled, try to get latest rate (but use cached if available)
		if ( $api_enabled && ! empty( $general['api_key'] ) ) {
			$exchange_rate = isset( $general['exchange_rate'] ) ? $general['exchange_rate'] : 42000;
		}

		$purchase_currency     = isset( $general['purchase_currency'] ) ? $general['purchase_currency'] : 'base';
		$exchange_rate_enabled = isset( $general['exchange_rate_enabled'] )
			? WFCP_Helper::to_bool( $general['exchange_rate_enabled'] )
			: true;

		// Apply exchange rate only when enabled and purchase_currency is 'base'
		if ( $exchange_rate_enabled && $exchange_rate && $exchange_rate > 0 ) {
			if ( ! $purchase_currency || 'base' === $purchase_currency ) {
				$price = $price * floatval( $exchange_rate );
			}
		}

		$rounded_retail = self::get_rounded_retail( $price );

		// Calculate based on type (derived types use rounded retail as base).
		switch ( $type ) {
			case 'retail':
				$price = $rounded_retail;
				break;

			case 'credit':
				$price = self::apply_section_rounding(
					self::calculate_credit_price( $rounded_retail ),
					'retail',
					true
				);
				break;

			case 'installment':
				$months = isset( $args['months'] ) ? intval( $args['months'] ) : 3;
				$price  = self::apply_section_rounding(
					self::calculate_installment_price( $rounded_retail, $months ),
					'installment',
					true
				);
				break;

			case 'wholesale':
				$price = self::apply_section_rounding(
					self::calculate_wholesale_price( $price, $product_id ),
					'retail',
					true
				);
				break;

			case 'digikala':
			case 'basalam':
			case 'technolife':
			case 'snappshop':
			case 'tapsishop':
			case 'zarehbin':
			case 'emalls':
			case 'snapppay-search':
			case 'torob':
				$price = self::calculate_marketplace_price( $rounded_retail, $type, $product_id );
				$skip_platform_round = in_array( $type, array( 'torob', 'zarehbin', 'emalls', 'snapppay-search' ), true )
					&& 'markup' !== (string) WFCP_Helper::get_settings( $type, 'price_mode' );
				if ( ! $skip_platform_round ) {
					$price = self::apply_section_rounding( $price, $type, true );
				}
				break;
		}

		// Cache the result (1 hour)
		set_transient( $cache_key, $price, HOUR_IN_SECONDS );

		return floatval( $price );
	}

	/**
	 * Apply rounding for a settings section (round_enabled defaults to on when unset).
	 *
	 * @param float  $price           Price to round.
	 * @param string $section         Settings section key.
	 * @param bool   $default_enabled Default when round_enabled is missing.
	 * @return float
	 */
	private static function apply_section_rounding( $price, $section, $default_enabled = true ) {
		$round_raw     = WFCP_Helper::get_settings( $section, 'round_enabled' );
		$round_enabled = null === $round_raw ? $default_enabled : WFCP_Helper::to_bool( $round_raw );
		if ( ! $round_enabled ) {
			return floatval( $price );
		}

		$round_to = WFCP_Helper::get_settings( $section, 'round_to' );
		$round_to = $round_to ? intval( $round_to ) : 1000;

		return WFCP_Helper::round_price( $price, max( 1, $round_to ) );
	}

	/**
	 * Retail price after profit markup and retail rounding.
	 *
	 * @param float $fx_price Purchase after FX conversion.
	 * @return float
	 */
	private static function get_rounded_retail( $fx_price ) {
		return self::apply_section_rounding(
			self::calculate_retail_price( $fx_price ),
			'retail',
			true
		);
	}

	/**
	 * Calculate retail price
	 *
	 * @param float $base_price Base price.
	 * @return float
	 */
	private static function calculate_retail_price( $base_price ) {
		$profit_percent = WFCP_Helper::get_settings( 'retail', 'profit_percent' );

		if ( ! $profit_percent || $profit_percent <= 0 ) {
			return $base_price;
		}

		$profit = ( $base_price * floatval( $profit_percent ) ) / 100;
		return $base_price + $profit;
	}

	/**
	 * Calculate credit price (expects retail base).
	 *
	 * @param float $base_price Retail-level price.
	 * @return float
	 */
	private static function calculate_credit_price( $base_price ) {
		if ( ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) ) ) {
			return $base_price;
		}

		$increase_percent = WFCP_Helper::get_settings( 'credit', 'increase_percent' );

		if ( ! $increase_percent || $increase_percent <= 0 ) {
			return $base_price;
		}

		$increase = ( $base_price * floatval( $increase_percent ) ) / 100;
		return $base_price + $increase;
	}

	/**
	 * Calculate installment monthly payment (expects retail base).
	 *
	 * @param float $base_price Retail-level price.
	 * @param int   $months     Number of months.
	 * @return float
	 */
	private static function calculate_installment_price( $base_price, $months ) {
		if ( ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) ) ) {
			return $base_price;
		}

		$plans = WFCP_Helper::get_settings( 'installment', 'plans' );

		if ( ! is_array( $plans ) || empty( $plans ) ) {
			return $base_price;
		}

		// Find matching plan
		$plan = null;
		foreach ( $plans as $p ) {
			if ( isset( $p['months'] ) && intval( $p['months'] ) === $months ) {
				$plan = $p;
				break;
			}
		}

		if ( ! $plan || ! isset( $plan['interest'] ) ) {
			return $base_price;
		}

		$interest_percent = floatval( $plan['interest'] );
		$total_interest   = ( $base_price * $interest_percent ) / 100;
		$total_price      = $base_price + $total_interest;

		// Prevent division by zero
		if ( $months <= 0 ) {
			return $base_price;
		}

		return $total_price / $months;
	}

	/**
	 * Calculate wholesale price
	 *
	 * Discount is applied on FX-converted purchase price (not retail/نقدی).
	 *
	 * @param float $base_price Purchase after FX.
	 * @param int   $product_id Product ID.
	 * @return float
	 */
	private static function calculate_wholesale_price( $base_price, $product_id = null ) {
		if ( ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'wholesale', 'enabled' ) ) ) {
			return $base_price;
		}

		$discount_percent = self::resolve_wholesale_discount_percent( $product_id );

		if ( ! $discount_percent || $discount_percent <= 0 ) {
			return $base_price;
		}

		// Prevent discount from being more than 100%
		if ( $discount_percent >= 100 ) {
			$discount_percent = 99.99;
		}

		$discount = ( $base_price * $discount_percent ) / 100;
		return max( 0, $base_price - $discount ); // Prevent negative prices
	}

	/**
	 * Product custom % → first category % > 0 → global %.
	 *
	 * @param int|null $product_id Product or variation ID.
	 * @return float
	 */
	private static function resolve_wholesale_discount_percent( $product_id ) {
		$lookup_id = (int) $product_id;
		$parent_id = 0;
		if ( $lookup_id > 0 && function_exists( 'wc_get_product' ) ) {
			$prod = wc_get_product( $lookup_id );
			if ( $prod && $prod->get_parent_id() ) {
				$parent_id = (int) $prod->get_parent_id();
			}
		}

		$raw = $lookup_id > 0 ? get_post_meta( $lookup_id, '_wfcp_wholesale_custom_rule', true ) : null;
		if ( ( ! is_array( $raw ) || ! array_key_exists( 'discount_percent', $raw ) ) && $parent_id > 0 ) {
			$raw = get_post_meta( $parent_id, '_wfcp_wholesale_custom_rule', true );
		}
		if ( is_array( $raw ) && array_key_exists( 'discount_percent', $raw ) ) {
			return (float) $raw['discount_percent'];
		}

		$cat_id = $parent_id > 0 ? $parent_id : $lookup_id;
		if ( $cat_id > 0 ) {
			$terms = wp_get_post_terms( $cat_id, 'product_cat' );
			if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
				$category_rules = WFCP_Helper::get_settings( 'wholesale', 'category_rules' );
				if ( ! is_array( $category_rules ) ) {
					$category_rules = array();
				}
				foreach ( $terms as $term ) {
					$tid = (int) $term->term_id;
					$pct = null;
					if ( isset( $category_rules[ $tid ] ) ) {
						$pct = $category_rules[ $tid ];
					} elseif ( isset( $category_rules[ (string) $tid ] ) ) {
						$pct = $category_rules[ (string) $tid ];
					}
					if ( null !== $pct ) {
						$pct = (float) $pct;
						if ( $pct > 0 ) {
							return $pct;
						}
					}
				}
			}
		}

		return (float) WFCP_Helper::get_settings( 'wholesale', 'discount_percent' );
	}

	/**
	 * Marketplace channel price.
	 * Formula (on retail/نقدی): retail * (1 + profit/100) * (1 + extra/100)
	 * Respects per-product lock + manual price meta.
	 *
	 * @param float  $retail_price Retail (نقدی) base.
	 * @param string $platform     Platform slug.
	 * @param int    $product_id   Product ID.
	 * @return float
	 */
	private static function calculate_marketplace_price( $retail_price, $platform, $product_id = null ) {
		if ( $product_id ) {
			$locked = get_post_meta( $product_id, '_wfcp_' . $platform . '_lock', true );
			if ( '1' === (string) $locked ) {
				$manual = get_post_meta( $product_id, '_wfcp_' . $platform . '_price', true );
				if ( '' !== $manual && null !== $manual ) {
					return floatval( $manual );
				}
			}
		}

		if ( ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( $platform, 'enabled' ) ) ) {
			return floatval( $retail_price );
		}

		// Comparison engines: optional "use retail as-is" mode (retail_price is already rounded).
		if ( in_array( $platform, array( 'torob', 'zarehbin', 'emalls', 'snapppay-search' ), true ) ) {
			$mode = (string) WFCP_Helper::get_settings( $platform, 'price_mode' );
			if ( 'markup' !== $mode ) {
				return floatval( $retail_price );
			}
		}

		$profit = floatval( WFCP_Helper::get_settings( $platform, 'profit_percent' ) );
		$extra  = floatval( WFCP_Helper::get_settings( $platform, 'extra_percent' ) );
		$price  = floatval( $retail_price );

		if ( $profit > 0 ) {
			$price = $price * ( 1 + ( $profit / 100 ) );
		}
		if ( $extra > 0 ) {
			$price = $price * ( 1 + ( $extra / 100 ) );
		}

		return max( 0, $price );
	}

	/**
	 * Hash of pricing-related settings for cache invalidation.
	 *
	 * @return string
	 */
	private static function settings_hash() {
		$parts = array(
			WFCP_Helper::get_settings( 'general' ),
			WFCP_Helper::get_settings( 'retail' ),
			WFCP_Helper::get_settings( 'credit' ),
			WFCP_Helper::get_settings( 'installment' ),
			WFCP_Helper::get_settings( 'wholesale' ),
			WFCP_Helper::get_settings( 'digikala' ),
			WFCP_Helper::get_settings( 'basalam' ),
			WFCP_Helper::get_settings( 'technolife' ),
			WFCP_Helper::get_settings( 'snappshop' ),
			WFCP_Helper::get_settings( 'tapsishop' ),
			WFCP_Helper::get_settings( 'zarehbin' ),
			WFCP_Helper::get_settings( 'emalls' ),
			WFCP_Helper::get_settings( 'snapppay-search' ),
			WFCP_Helper::get_settings( 'torob' ),
		);
		return md5( wp_json_encode( $parts ) );
	}

	/**
	 * Get cache key
	 *
	 * @param float  $base_price Base price.
	 * @param string $type       Price type.
	 * @param int    $product_id Product ID.
	 * @param array  $args       Additional arguments.
	 * @return string
	 */
	private static function get_cache_key( $base_price, $type, $product_id, $args ) {
		$key = 'wfcp_price_' . md5( $base_price . $type . $product_id . serialize( $args ) . self::settings_hash() );
		return $key;
	}
}
