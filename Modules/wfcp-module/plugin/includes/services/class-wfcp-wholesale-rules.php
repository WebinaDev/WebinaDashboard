<?php
/**
 * Resolve wholesale min qty / weight / step / variety per product.
 *
 * @package    WFCP
 * @subpackage WFCP/includes/services
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Wholesale purchase constraints.
 */
class WFCP_Wholesale_Rules {

	/**
	 * Sanitize a wholesale custom rule array.
	 *
	 * @param mixed $rule Raw rule.
	 * @return array<string,mixed>
	 */
	public static function sanitize_rule( $rule ) {
		if ( ! is_array( $rule ) ) {
			$rule = array();
		}
		$sell_by = isset( $rule['sell_by'] ) ? sanitize_key( (string) $rule['sell_by'] ) : 'unit';
		if ( ! in_array( $sell_by, array( 'unit', 'weight' ), true ) ) {
			$sell_by = 'unit';
		}
		$out = array(
			'discount_percent'   => isset( $rule['discount_percent'] ) ? (float) $rule['discount_percent'] : 0.0,
			'min_qty'            => isset( $rule['min_qty'] ) ? max( 0, (float) $rule['min_qty'] ) : 0.0,
			'min_weight'         => isset( $rule['min_weight'] ) ? max( 0, (float) $rule['min_weight'] ) : 0.0,
			'qty_step'           => isset( $rule['qty_step'] ) ? max( 0, (float) $rule['qty_step'] ) : 0.0,
			'sell_by'            => $sell_by,
			'wholesale_enabled'  => array_key_exists( 'wholesale_enabled', $rule )
				? (bool) WFCP_Helper::to_bool( $rule['wholesale_enabled'] )
				: true,
		);
		return $out;
	}

	/**
	 * Global defaults from WFCP wholesale settings.
	 *
	 * @return array<string,mixed>
	 */
	public static function global_defaults() {
		$defaults = WFCP_Helper::get_settings( 'wholesale', 'defaults' );
		if ( ! is_array( $defaults ) ) {
			$defaults = array();
		}
		return array(
			'min_qty'           => isset( $defaults['min_qty'] ) ? max( 0, (float) $defaults['min_qty'] ) : 0.0,
			'min_weight'        => isset( $defaults['min_weight'] ) ? max( 0, (float) $defaults['min_weight'] ) : 0.0,
			'qty_step'          => isset( $defaults['qty_step'] ) ? max( 0, (float) $defaults['qty_step'] ) : 0.0,
			'min_distinct_skus' => isset( $defaults['min_distinct_skus'] ) ? max( 0, (int) $defaults['min_distinct_skus'] ) : 0,
			'sell_by'           => 'unit',
		);
	}

	/**
	 * Effective constraints for a product/variation. Product meta overrides defaults. 0 = not enforced.
	 *
	 * @param int $product_id   Parent or simple ID.
	 * @param int $variation_id Variation ID.
	 * @return array<string,mixed>
	 */
	public static function for_product( $product_id, $variation_id = 0 ) {
		$product_id   = (int) $product_id;
		$variation_id = (int) $variation_id;
		$base         = self::global_defaults();
		$meta_id      = $variation_id > 0 ? $variation_id : $product_id;
		$raw          = get_post_meta( $meta_id, '_wfcp_wholesale_custom_rule', true );
		if ( ( ! is_array( $raw ) || empty( $raw ) ) && $variation_id > 0 ) {
			$raw = get_post_meta( $product_id, '_wfcp_wholesale_custom_rule', true );
		}
		$raw_is_array = is_array( $raw );
		$rule         = self::sanitize_rule( $raw_is_array ? $raw : array() );

		return array(
			'min_qty'           => ( $raw_is_array && array_key_exists( 'min_qty', $raw ) ) ? $rule['min_qty'] : $base['min_qty'],
			'min_weight'        => ( $raw_is_array && array_key_exists( 'min_weight', $raw ) ) ? $rule['min_weight'] : $base['min_weight'],
			'qty_step'          => ( $raw_is_array && array_key_exists( 'qty_step', $raw ) ) ? $rule['qty_step'] : $base['qty_step'],
			'sell_by'           => ( $raw_is_array && array_key_exists( 'sell_by', $raw ) ) ? $rule['sell_by'] : $base['sell_by'],
			'wholesale_enabled' => $rule['wholesale_enabled'],
			'discount_percent'  => $rule['discount_percent'],
			'min_distinct_skus' => $base['min_distinct_skus'],
		);
	}

	/**
	 * Persist a wholesale rule onto a WC product (null clears override).
	 *
	 * @param WC_Product $product Product or variation.
	 * @param mixed      $rule    Raw rule or null.
	 * @return void
	 */
	public static function apply_to_wc_product( $product, $rule ) {
		if ( ! $product instanceof WC_Product ) {
			return;
		}
		if ( null === $rule || false === $rule || '' === $rule ) {
			$product->delete_meta_data( '_wfcp_wholesale_custom_rule' );
			return;
		}
		if ( ! is_array( $rule ) ) {
			$product->delete_meta_data( '_wfcp_wholesale_custom_rule' );
			return;
		}
		$product->update_meta_data( '_wfcp_wholesale_custom_rule', self::sanitize_rule( $rule ) );
	}

	/**
	 * Whether a cart line qty/weight qualifies for threshold wholesale pricing.
	 *
	 * @param array $rules        Resolved rules.
	 * @param float $qty          Quantity.
	 * @param int   $product_id   Product ID.
	 * @param int   $variation_id Variation ID.
	 * @return bool
	 */
	public static function line_meets_threshold( $rules, $qty, $product_id, $variation_id = 0 ) {
		if ( ! is_array( $rules ) || empty( $rules['wholesale_enabled'] ) ) {
			return false;
		}
		$qty     = (float) $qty;
		$min_qty = isset( $rules['min_qty'] ) ? (float) $rules['min_qty'] : 0.0;
		$min_w   = isset( $rules['min_weight'] ) ? (float) $rules['min_weight'] : 0.0;
		$hit     = false;
		if ( $min_qty > 0 && $qty + 0.0001 >= $min_qty ) {
			$hit = true;
		}
		if ( $min_w > 0 ) {
			$line_w = self::line_weight( $rules, $qty, $product_id, $variation_id );
			if ( $line_w + 0.0001 >= $min_w ) {
				$hit = true;
			}
		}
		return $hit;
	}

	/**
	 * Product weight in store unit (kg by default).
	 *
	 * @param int $product_id   Product ID.
	 * @param int $variation_id Variation ID.
	 * @return float
	 */
	public static function product_weight( $product_id, $variation_id = 0 ) {
		$id      = $variation_id > 0 ? $variation_id : $product_id;
		$product = wc_get_product( $id );
		if ( ! $product ) {
			return 0.0;
		}
		$w = (float) $product->get_weight();
		if ( $w <= 0 && $variation_id > 0 ) {
			$parent = wc_get_product( $product_id );
			if ( $parent ) {
				$w = (float) $parent->get_weight();
			}
		}
		return max( 0, $w );
	}

	/**
	 * Whether qty matches step (float-safe).
	 *
	 * @param float $qty  Quantity.
	 * @param float $step Step.
	 * @return bool
	 */
	public static function qty_matches_step( $qty, $step ) {
		$qty  = (float) $qty;
		$step = (float) $step;
		if ( $step <= 0 ) {
			return true;
		}
		$ratio = round( $qty / $step );
		return abs( $qty - ( $ratio * $step ) ) < 0.0001;
	}

	/**
	 * Line weight for a cart qty.
	 *
	 * @param array $rules Resolved rules.
	 * @param float $qty   Quantity.
	 * @param int   $product_id Product ID.
	 * @param int   $variation_id Variation ID.
	 * @return float
	 */
	public static function line_weight( $rules, $qty, $product_id, $variation_id = 0 ) {
		$qty = (float) $qty;
		if ( isset( $rules['sell_by'] ) && 'weight' === $rules['sell_by'] ) {
			return $qty;
		}
		return $qty * self::product_weight( $product_id, $variation_id );
	}
}
