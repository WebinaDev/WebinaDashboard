<?php
/**
 * ishop-theme compatibility layer for WFCP product pricing and cart UX.
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * ishop body-class markers; pricing-box hooks come from style.placement.
 */
class WFCP_Ishop_Theme_Compat {

	/**
	 * @return bool
	 */
	public static function is_active() {
		if ( function_exists( 'ishop_theme_util' ) ) {
			return true;
		}

		$stylesheet = get_stylesheet();
		$template   = get_template();

		return in_array( 'ishop-theme', array( $stylesheet, $template ), true );
	}

	/**
	 * @param WFCP_Public $public Public facade (unused; kept for caller compatibility).
	 * @return void
	 */
	public static function init( WFCP_Public $public ) {
		if ( ! self::is_active() ) {
			return;
		}

		unset( $public );

		add_filter( 'body_class', array( __CLASS__, 'add_body_class' ) );
	}

	/**
	 * @param array $classes Body classes.
	 * @return array
	 */
	public static function add_body_class( $classes ) {
		if ( self::is_active() ) {
			$classes[] = 'wfcp-ishop-theme';
		}

		if ( is_product() ) {
			global $product;
			$resolved = ( $product && is_a( $product, 'WC_Product' ) ) ? $product : null;
			if ( ! $resolved && function_exists( 'wc_get_product' ) ) {
				$id = (int) get_the_ID();
				if ( $id > 0 ) {
					$maybe = wc_get_product( $id );
					if ( $maybe && is_a( $maybe, 'WC_Product' ) ) {
						$resolved = $maybe;
					}
				}
			}
			if ( $resolved && WFCP_Helper::is_enabled() && ( $resolved->is_type( 'variable' ) || WFCP_Helper::product_has_wfcp_pricing( $resolved ) ) ) {
				$classes[] = 'wfcp-has-pricing';
			}
		}

		return $classes;
	}
}
