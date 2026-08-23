<?php
/**
 * WooCommerce Product Add-Ons detection for shop bots.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Minimal Add-Ons gate: required add-ons must use WebApp / storefront,
 * or simple bot options from product meta `_webino_bot_addons`.
 */
final class Webino_Dashboard_Bots_Addons {

	/**
	 * @return bool
	 */
	public static function plugin_active() {
		return class_exists( 'WC_Product_Addons_Helper', false )
			|| class_exists( 'WC_Product_Addons', false )
			|| function_exists( 'get_product_addons' );
	}

	/**
	 * @param int $product_id Product ID.
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_addons( $product_id ) {
		$product_id = (int) $product_id;
		if ( $product_id < 1 ) {
			return array();
		}
		if ( class_exists( 'WC_Product_Addons_Helper', false ) && method_exists( 'WC_Product_Addons_Helper', 'get_product_addons' ) ) {
			$addons = WC_Product_Addons_Helper::get_product_addons( $product_id );
			return is_array( $addons ) ? $addons : array();
		}
		if ( function_exists( 'get_product_addons' ) ) {
			$addons = get_product_addons( $product_id );
			return is_array( $addons ) ? $addons : array();
		}
		$raw = get_post_meta( $product_id, '_product_addons', true );
		return is_array( $raw ) ? $raw : array();
	}

	/**
	 * Simple checkbox/select options from product meta `_webino_bot_addons` JSON.
	 *
	 * Expected JSON: [{"id":"opt1","label":"..."}, ...] or {"options":[...]}.
	 *
	 * @param int $product_id Product ID.
	 * @return list<array{id:string,label:string}>
	 */
	public static function get_bot_options( $product_id ) {
		$product_id = (int) $product_id;
		if ( $product_id < 1 ) {
			return array();
		}
		$raw = get_post_meta( $product_id, '_webino_bot_addons', true );
		if ( is_string( $raw ) && $raw !== '' ) {
			$decoded = json_decode( $raw, true );
			$raw     = is_array( $decoded ) ? $decoded : array();
		}
		if ( ! is_array( $raw ) ) {
			return array();
		}
		if ( isset( $raw['options'] ) && is_array( $raw['options'] ) ) {
			$raw = $raw['options'];
		}
		$out = array();
		foreach ( $raw as $i => $opt ) {
			if ( is_string( $opt ) ) {
				$id = sanitize_key( $opt );
				if ( $id === '' ) {
					$id = 'o' . (int) $i;
				}
				$out[] = array(
					'id'    => $id,
					'label' => $opt,
				);
				continue;
			}
			if ( ! is_array( $opt ) ) {
				continue;
			}
			$id = isset( $opt['id'] ) ? sanitize_key( (string) $opt['id'] ) : '';
			if ( $id === '' ) {
				$id = 'o' . (int) $i;
			}
			$label = isset( $opt['label'] ) ? (string) $opt['label'] : ( isset( $opt['name'] ) ? (string) $opt['name'] : $id );
			if ( $label === '' ) {
				continue;
			}
			$out[] = array(
				'id'    => $id,
				'label' => $label,
			);
		}
		return $out;
	}

	/**
	 * Inline keyboard JSON for bot add-on options (`ao:{pid}:{opt}`).
	 *
	 * @param int $product_id Product ID.
	 * @return string Empty if no options.
	 */
	public static function format_options_keyboard( $product_id ) {
		$opts = self::get_bot_options( $product_id );
		if ( empty( $opts ) ) {
			return '';
		}
		$pid  = (int) $product_id;
		$rows = array();
		$row  = array();
		foreach ( $opts as $opt ) {
			$row[] = array(
				'text'          => (string) $opt['label'],
				'callback_data' => 'ao:' . $pid . ':' . (string) $opt['id'],
			);
			if ( count( $row ) >= 2 ) {
				$rows[] = $row;
				$row    = array();
			}
		}
		if ( ! empty( $row ) ) {
			$rows[] = $row;
		}
		return wp_json_encode( array( 'inline_keyboard' => $rows ) );
	}

	/**
	 * True when product has a required add-on that cannot be configured in-bot.
	 *
	 * @param int $product_id Product ID.
	 * @return bool
	 */
	public static function requires_storefront( $product_id ) {
		if ( ! empty( self::get_bot_options( $product_id ) ) ) {
			return false;
		}
		if ( ! self::plugin_active() ) {
			return false;
		}
		foreach ( self::get_addons( $product_id ) as $addon ) {
			if ( ! is_array( $addon ) ) {
				continue;
			}
			$required = ! empty( $addon['required'] );
			if ( ! $required ) {
				continue;
			}
			return true;
		}
		return false;
	}
}
