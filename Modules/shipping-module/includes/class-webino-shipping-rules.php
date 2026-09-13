<?php
/**
 * Conditional shipping rules engine.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webino_Shipping_Rules {

	const OPTION = 'webino_shipping_rules';

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'apply' ), 90, 2 );
	}

	/**
	 * @return list<array<string,mixed>>
	 */
	public static function get() {
		$raw = get_option( self::OPTION, array() );
		return is_array( $raw ) ? array_values( $raw ) : array();
	}

	/**
	 * @param list<array<string,mixed>> $rules Rules.
	 * @return list<array<string,mixed>>
	 */
	public static function update( $rules ) {
		$clean = array();
		if ( ! is_array( $rules ) ) {
			update_option( self::OPTION, array(), false );
			return array();
		}
		foreach ( $rules as $rule ) {
			if ( ! is_array( $rule ) ) {
				continue;
			}
			$clean[] = array(
				'id'         => sanitize_key( (string) ( $rule['id'] ?? wp_generate_uuid4() ) ),
				'enabled'    => ! empty( $rule['enabled'] ),
				'priority'   => (int) ( $rule['priority'] ?? 10 ),
				'title'      => sanitize_text_field( (string) ( $rule['title'] ?? '' ) ),
				'conditions' => is_array( $rule['conditions'] ?? null ) ? $rule['conditions'] : array(),
				'actions'    => is_array( $rule['actions'] ?? null ) ? $rule['actions'] : array(),
			);
		}
		usort(
			$clean,
			static function ( $a, $b ) {
				return (int) $a['priority'] <=> (int) $b['priority'];
			}
		);
		update_option( self::OPTION, $clean, false );
		return $clean;
	}

	/**
	 * @param array<string, WC_Shipping_Rate> $rates Rates.
	 * @param array<string, mixed>            $package Package.
	 * @return array<string, WC_Shipping_Rate>
	 */
	public static function apply( $rates, $package ) {
		if ( ! is_array( $rates ) ) {
			return $rates;
		}
		foreach ( self::get() as $rule ) {
			if ( empty( $rule['enabled'] ) ) {
				continue;
			}
			if ( ! self::match_conditions( $rule['conditions'], $package ) ) {
				continue;
			}
			$rates = self::apply_actions( $rule['actions'], $rates );
		}
		return $rates;
	}

	/**
	 * @param array $conditions Conditions.
	 * @param array $package Package.
	 * @return bool
	 */
	private static function match_conditions( $conditions, $package ) {
		if ( ! is_array( $conditions ) || array() === $conditions ) {
			return true;
		}
		$dest = isset( $package['destination'] ) && is_array( $package['destination'] ) ? $package['destination'] : array();
		$state = (string) ( $dest['state'] ?? '' );
		$city  = (string) ( $dest['city'] ?? '' );
		$cart_total = 0.0;
		$weight = 0.0;
		$qty = 0;
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$cart_total = (float) WC()->cart->get_displayed_subtotal();
		}
		$contents = isset( $package['contents'] ) && is_array( $package['contents'] ) ? $package['contents'] : array();
		$product_ids = array();
		$cat_ids = array();
		$class_ids = array();
		foreach ( $contents as $row ) {
			$qty += max( 1, (int) ( $row['quantity'] ?? 1 ) );
			if ( empty( $row['data'] ) || ! is_a( $row['data'], 'WC_Product' ) ) {
				continue;
			}
			/** @var WC_Product $p */
			$p = $row['data'];
			$product_ids[] = (int) $p->get_id();
			if ( $p->get_parent_id() ) {
				$product_ids[] = (int) $p->get_parent_id();
			}
			$class_ids[] = (int) $p->get_shipping_class_id();
			$terms = wc_get_product_term_ids( $p->get_id(), 'product_cat' );
			$cat_ids = array_merge( $cat_ids, $terms );
			$w = (float) $p->get_weight();
			$weight += $w * max( 1, (int) ( $row['quantity'] ?? 1 ) );
		}
		$user = wp_get_current_user();
		$roles = $user && $user->exists() ? (array) $user->roles : array();
		$payment = '';
		if ( function_exists( 'WC' ) && WC()->session ) {
			$payment = (string) WC()->session->get( 'chosen_payment_method' );
		}

		foreach ( $conditions as $cond ) {
			if ( ! is_array( $cond ) ) {
				continue;
			}
			$type = (string) ( $cond['type'] ?? '' );
			$val  = $cond['value'] ?? '';
			$ok   = true;
			switch ( $type ) {
				case 'state':
					$ok = self::eq_loose( $state, $val );
					break;
				case 'city':
					$ok = self::eq_loose( $city, $val );
					break;
				case 'district':
					$ok = self::eq_loose( (string) ( $dest['district'] ?? '' ), $val );
					break;
				case 'product':
					$ok = in_array( (int) $val, $product_ids, true );
					break;
				case 'category':
					$ok = in_array( (int) $val, $cat_ids, true );
					break;
				case 'shipping_class':
					$ok = in_array( (int) $val, $class_ids, true );
					break;
				case 'role':
					$ok = in_array( (string) $val, $roles, true );
					break;
				case 'payment_method':
					$ok = self::eq_loose( $payment, $val );
					break;
				case 'weight_min':
					$ok = $weight >= (float) $val;
					break;
				case 'weight_max':
					$ok = $weight <= (float) $val;
					break;
				case 'cart_total_min':
					$ok = $cart_total >= (float) $val;
					break;
				case 'cart_total_max':
					$ok = $cart_total <= (float) $val;
					break;
				case 'item_count_min':
					$ok = $qty >= (int) $val;
					break;
				default:
					$ok = true;
			}
			if ( ! $ok ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * @param mixed $a A.
	 * @param mixed $b B.
	 * @return bool
	 */
	private static function eq_loose( $a, $b ) {
		return trim( (string) $a ) === trim( (string) $b );
	}

	/**
	 * @param array $actions Actions.
	 * @param array $rates Rates.
	 * @return array
	 */
	private static function apply_actions( $actions, $rates ) {
		foreach ( (array) $actions as $action ) {
			if ( ! is_array( $action ) ) {
				continue;
			}
			$type = (string) ( $action['type'] ?? '' );
			$method_id = (string) ( $action['method_id'] ?? '' );
			$value = $action['value'] ?? '';
			switch ( $type ) {
				case 'hide_method':
					foreach ( $rates as $key => $rate ) {
						if ( is_a( $rate, 'WC_Shipping_Rate' ) && self::rate_matches( $rate, $method_id ) ) {
							unset( $rates[ $key ] );
						}
					}
					break;
				case 'force_method':
					foreach ( $rates as $key => $rate ) {
						if ( is_a( $rate, 'WC_Shipping_Rate' ) && ! self::rate_matches( $rate, $method_id ) ) {
							unset( $rates[ $key ] );
						}
					}
					break;
				case 'set_cost':
				case 'free':
					$cost = 'free' === $type ? 0.0 : (float) $value;
					foreach ( $rates as $rate ) {
						if ( is_a( $rate, 'WC_Shipping_Rate' ) && self::rate_matches( $rate, $method_id ) ) {
							$rate->set_cost( $cost );
						}
					}
					break;
				case 'set_title':
					foreach ( $rates as $rate ) {
						if ( is_a( $rate, 'WC_Shipping_Rate' ) && self::rate_matches( $rate, $method_id ) ) {
							$rate->set_label( (string) $value );
						}
					}
					break;
			}
		}
		return $rates;
	}

	/**
	 * @param WC_Shipping_Rate $rate Rate.
	 * @param string           $method_id Method id or empty=all.
	 * @return bool
	 */
	private static function rate_matches( $rate, $method_id ) {
		if ( '' === $method_id ) {
			return true;
		}
		return (string) $rate->get_method_id() === $method_id || false !== strpos( (string) $rate->get_id(), $method_id );
	}
}
