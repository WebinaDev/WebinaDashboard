<?php
/**
 * Shared WFCP helpers for Bale/Telegram shop bots.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Purchase-type pricing + gateway helpers used by both bot engines.
 */
final class Webino_Dashboard_Bots_WFCP {

	/**
	 * @return bool
	 */
	public static function available() {
		return class_exists( 'WFCP_Helper', false ) && class_exists( 'WFCP_Calculator', false ) && WFCP_Helper::is_enabled();
	}

	/**
	 * Map bot type (cash|credit|installment|wholesale) to calculator type.
	 *
	 * @param string $type Purchase type.
	 * @return string
	 */
	public static function calculator_type( $type ) {
		$type = sanitize_key( (string) $type );
		if ( 'cash' === $type || 'retail' === $type || '' === $type ) {
			return 'retail';
		}
		if ( in_array( $type, array( 'credit', 'installment', 'wholesale' ), true ) ) {
			return $type;
		}
		return 'retail';
	}

	/**
	 * Normalize to cart meta type (cash not retail).
	 *
	 * @param string $type Type.
	 * @return string
	 */
	public static function cart_type( $type ) {
		$type = sanitize_key( (string) $type );
		if ( 'retail' === $type || '' === $type ) {
			return 'cash';
		}
		return in_array( $type, array( 'cash', 'credit', 'installment', 'wholesale' ), true ) ? $type : 'cash';
	}

	/**
	 * Enabled purchase types for bot UI.
	 *
	 * @return list<array{id:string,label:string}>
	 */
	public static function enabled_types() {
		$out = array(
			array(
				'id'    => 'cash',
				'label' => __( 'نقدی', 'webino-dashboard' ),
			),
		);
		if ( ! self::available() ) {
			return $out;
		}
		if ( WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) ) ) {
			$out[] = array(
				'id'    => 'credit',
				'label' => __( 'اعتباری', 'webino-dashboard' ),
			);
		}
		if ( WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) ) ) {
			$out[] = array(
				'id'    => 'installment',
				'label' => __( 'اقساطی', 'webino-dashboard' ),
			);
		}
		if ( WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'wholesale', 'enabled' ) ) ) {
			$is_partner = class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::is_partner();
			if ( $is_partner && class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::partner_enabled() ) {
				$out[] = array(
					'id'    => 'wholesale',
					'label' => __( 'عمده', 'webino-dashboard' ),
				);
			}
		}
		return $out;
	}

	/**
	 * Installment plans for bot keyboard.
	 *
	 * @return list<array{months:int,interest:float,label:string}>
	 */
	public static function installment_plans() {
		if ( ! self::available() ) {
			return array();
		}
		$plans = WFCP_Helper::get_settings( 'installment', 'plans' );
		$out   = array();
		if ( ! is_array( $plans ) ) {
			return $out;
		}
		foreach ( $plans as $plan ) {
			if ( ! is_array( $plan ) ) {
				continue;
			}
			$months = isset( $plan['months'] ) ? (int) $plan['months'] : 0;
			if ( $months < 1 ) {
				continue;
			}
			$interest = isset( $plan['interest_percent'] ) ? (float) $plan['interest_percent'] : ( isset( $plan['interest'] ) ? (float) $plan['interest'] : 0 );
			$out[]    = array(
				'months'   => $months,
				'interest' => $interest,
				'label'    => sprintf(
					/* translators: 1: months 2: interest */
					__( '%1$d ماه (سود %2$s%%)', 'webino-dashboard' ),
					$months,
					$interest
				),
			);
		}
		return $out;
	}

	/**
	 * Purchase price meta for product (fallback to regular).
	 *
	 * @param WC_Product $product Product.
	 * @return float
	 */
	public static function purchase_base( $product ) {
		if ( ! $product ) {
			return 0.0;
		}
		$id  = $product->get_id();
		$raw = $product->get_meta( '_wfcp_purchase_price', true );
		if ( '' === $raw || null === $raw ) {
			$raw = get_post_meta( $id, '_wfcp_purchase_price', true );
		}
		if ( '' !== $raw && null !== $raw && is_numeric( $raw ) ) {
			return (float) $raw;
		}
		return (float) $product->get_regular_price();
	}

	/**
	 * Calculate display/cart price for a product + purchase type.
	 *
	 * @param WC_Product $product Product.
	 * @param string     $type cash|credit|installment|wholesale.
	 * @param int        $months Installment months.
	 * @return float
	 */
	public static function price_for( $product, $type = 'cash', $months = 0 ) {
		if ( ! $product ) {
			return 0.0;
		}
		if ( ! self::available() ) {
			return (float) $product->get_price();
		}
		$calc_type = self::calculator_type( $type );
		$base      = self::purchase_base( $product );
		if ( $base <= 0 ) {
			$base = (float) $product->get_price();
		}
		$args = array();
		if ( 'installment' === $calc_type && $months > 0 ) {
			$args['months'] = (int) $months;
		}
		$price = WFCP_Calculator::calculate_price( $base, $calc_type, $product->get_id(), $args );
		return (float) $price;
	}

	/**
	 * Format price for bot messages.
	 *
	 * @param float $amount Amount.
	 * @return string
	 */
	public static function format_price( $amount ) {
		return number_format( (float) $amount, 0, '.', ',' ) . ' ' . __( 'تومان', 'webino-dashboard' );
	}

	/**
	 * Human label for purchase type.
	 *
	 * @param string $type Type.
	 * @return string
	 */
	public static function type_label( $type ) {
		$type = self::cart_type( $type );
		$map  = array(
			'cash'        => __( 'نقدی', 'webino-dashboard' ),
			'credit'      => __( 'اعتباری', 'webino-dashboard' ),
			'installment' => __( 'اقساطی', 'webino-dashboard' ),
			'wholesale'   => __( 'عمده', 'webino-dashboard' ),
		);
		return isset( $map[ $type ] ) ? $map[ $type ] : $type;
	}

	/**
	 * Cart item data payload for WC add_to_cart.
	 *
	 * @param string $type Type.
	 * @param int    $months Months.
	 * @return array<string,mixed>
	 */
	public static function cart_item_data( $type, $months = 0 ) {
		$type = self::cart_type( $type );
		$data = array(
			'wfcp_purchase_type' => $type,
			'purchase_type'      => $type,
		);
		if ( 'installment' === $type && $months > 0 ) {
			$data['wfcp_installment_months'] = (int) $months;
			$data['installment_months']      = (int) $months;
		}
		return $data;
	}

	/**
	 * Gateway IDs allowed for a purchase type (empty = all).
	 *
	 * @param string $type cash|credit|installment|wholesale.
	 * @return list<string>|null
	 */
	public static function allowed_gateway_ids( $type ) {
		$type = self::cart_type( $type );
		$section_map = array(
			'cash'        => 'retail',
			'credit'      => 'credit',
			'installment' => 'installment',
			'wholesale'   => 'wholesale',
		);
		$section = isset( $section_map[ $type ] ) ? $section_map[ $type ] : 'retail';

		// Gateway_Manager maps unknown types (e.g. wholesale) to retail — prefer section settings.
		if ( class_exists( 'WFCP_Helper', false ) && 'wholesale' === $type ) {
			$list = WFCP_Helper::get_settings( 'wholesale', 'gateways' );
			if ( is_array( $list ) && ! empty( $list ) ) {
				$selected = array_values( array_map( 'strval', $list ) );
				if ( class_exists( 'WFCP_Gateway_Manager', false ) && method_exists( 'WFCP_Gateway_Manager', 'expand_gateway_aliases' ) ) {
					$selected = array_values( array_map( 'strval', (array) WFCP_Gateway_Manager::expand_gateway_aliases( $selected ) ) );
				}
				return $selected;
			}
		}

		if ( class_exists( 'WFCP_Gateway_Manager', false ) ) {
			$selected = WFCP_Gateway_Manager::get_selected_gateways( $type );
			if ( empty( $selected ) && class_exists( 'WFCP_Helper', false ) ) {
				$list = WFCP_Helper::get_settings( $section, 'gateways' );
				$selected = is_array( $list ) ? $list : array();
			}
			if ( empty( $selected ) ) {
				return null;
			}
			if ( method_exists( 'WFCP_Gateway_Manager', 'expand_gateway_aliases' ) ) {
				$selected = WFCP_Gateway_Manager::expand_gateway_aliases( $selected );
			}
			return array_values( array_map( 'strval', (array) $selected ) );
		}

		if ( ! class_exists( 'WFCP_Helper', false ) ) {
			return null;
		}
		$list = WFCP_Helper::get_settings( $section, 'gateways' );
		return ( is_array( $list ) && ! empty( $list ) ) ? array_values( array_map( 'strval', $list ) ) : null;
	}

	/**
	 * Detect purchase type from WC order line meta.
	 *
	 * @param WC_Order $order Order.
	 * @return string
	 */
	public static function detect_order_type( $order ) {
		if ( ! $order ) {
			return 'cash';
		}
		$order_meta = $order->get_meta( '_wfcp_purchase_type' );
		if ( is_string( $order_meta ) && $order_meta !== '' ) {
			return self::cart_type( $order_meta );
		}
		foreach ( $order->get_items() as $item ) {
			$meta = $item->get_meta( 'wfcp_purchase_type' );
			if ( is_string( $meta ) && $meta !== '' ) {
				return self::cart_type( $meta );
			}
		}
		return 'cash';
	}

	/**
	 * Build inline keyboard rows for purchase type selection.
	 *
	 * @param string $prefix Callback prefix without trailing colon (pta|ptv).
	 * @param int    $id Product or variation id.
	 * @return list<list<array{text:string,callback_data:string}>>
	 */
	public static function type_keyboard_rows( $prefix, $id ) {
		$rows = array();
		foreach ( self::enabled_types() as $row ) {
			$tid = $row['id'];
			if ( 'installment' === $tid ) {
				$plans = self::installment_plans();
				if ( empty( $plans ) ) {
					continue;
				}
				foreach ( $plans as $plan ) {
					$rows[] = array(
						array(
							'text'          => '💳 ' . $row['label'] . ' — ' . $plan['label'],
							'callback_data' => $prefix . ':' . (int) $id . ':installment:' . (int) $plan['months'],
						),
					);
				}
				continue;
			}
			$rows[] = array(
				array(
					'text'          => '💵 ' . $row['label'],
					'callback_data' => $prefix . ':' . (int) $id . ':' . $tid,
				),
			);
		}
		return $rows;
	}
}
