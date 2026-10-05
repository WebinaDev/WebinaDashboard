<?php
/**
 * ishop-theme script dependency compatibility (underscore / wp-util / WC variations).
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Ensures WP script dependencies load in correct order when ishop optimizer strips them.
 */
class WFCP_Ishop_Script_Compat {

	/**
	 * @return void
	 */
	public static function init() {
		if ( ! class_exists( 'WFCP_Ishop_Theme_Compat', false ) || ! WFCP_Ishop_Theme_Compat::is_active() ) {
			return;
		}

		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'ensure_script_dependencies' ), 1 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'ensure_script_dependencies' ), 999 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'ensure_product_variation_scripts' ), 999 );
		add_action( 'wp_print_scripts', array( __CLASS__, 'ensure_script_dependencies_before_print' ), 1 );
		add_filter( 'script_loader_tag', array( __CLASS__, 'remove_defer_from_underscore' ), 10, 3 );
	}

	/**
	 * Underscore/wp-util race fix runs on all ishop frontend pages.
	 *
	 * @return bool
	 */
	private static function should_run_script_guard() {
		return ! is_admin();
	}

	/**
	 * WFCP product-specific script helpers.
	 *
	 * @return bool
	 */
	private static function should_run_wfcp_product() {
		return class_exists( 'WFCP_Helper', false ) && WFCP_Helper::is_enabled() && ! is_admin();
	}

	/**
	 * Force underscore before wp-util; strip defer strategy that races with sync wp-util.
	 *
	 * Live ishop HTML shows: underscore deferred, wp-util not deferred → `_ is not defined`.
	 *
	 * @return void
	 */
	public static function ensure_script_dependencies() {
		if ( ! self::should_run_script_guard() ) {
			return;
		}

		self::force_underscore_sync();

		if ( wp_script_is( 'wp-util', 'enqueued' ) || wp_script_is( 'wp-util', 'to_do' ) || wp_script_is( 'wp-util', 'registered' ) ) {
			wp_enqueue_script( 'underscore' );
			wp_enqueue_script( 'wp-util' );
			self::force_underscore_sync();
		}
	}

	/**
	 * Last-chance guard before scripts print.
	 *
	 * @return void
	 */
	public static function ensure_script_dependencies_before_print() {
		if ( ! self::should_run_script_guard() ) {
			return;
		}

		if ( wp_script_is( 'wp-util', 'enqueued' ) || wp_script_is( 'wp-util', 'to_do' ) ) {
			self::force_underscore_sync();
		}
	}

	/**
	 * Re-enqueue WC variation script on WFCP product pages after theme dequeuing.
	 *
	 * @return void
	 */
	public static function ensure_product_variation_scripts() {
		if ( ! self::should_run_wfcp_product() || ! is_product() ) {
			return;
		}

		global $product;

		if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
			return;
		}

		if ( ! WFCP_Helper::product_has_wfcp_pricing( $product ) || ! $product->is_type( 'variable' ) ) {
			return;
		}

		self::force_underscore_sync();

		if ( wp_script_is( 'wc-add-to-cart-variation', 'registered' ) ) {
			wp_enqueue_script( 'wc-add-to-cart-variation' );
		}
	}

	/**
	 * Enqueue underscore without defer/async strategy.
	 *
	 * @return void
	 */
	private static function force_underscore_sync() {
		wp_enqueue_script( 'underscore' );

		if ( function_exists( 'wp_script_add_data' ) ) {
			wp_script_add_data( 'underscore', 'strategy', false );
		}

		$wp_scripts = wp_scripts();
		if ( $wp_scripts instanceof WP_Scripts && isset( $wp_scripts->registered['underscore'] ) ) {
			unset( $wp_scripts->registered['underscore']->extra['strategy'] );
		}
	}

	/**
	 * Remove defer/async attributes from underscore tag when wp-util is present.
	 *
	 * @param string $tag    Script HTML tag.
	 * @param string $handle Script handle.
	 * @param string $src    Script source URL.
	 * @return string
	 */
	public static function remove_defer_from_underscore( $tag, $handle, $src ) {
		unset( $src );

		if ( 'underscore' !== $handle ) {
			return $tag;
		}

		if ( ! self::should_run_script_guard() ) {
			return $tag;
		}

		$tag = preg_replace( '/\sdefer(=("|\')defer("|\')|=("|\')("|\')|)?/i', '', $tag );
		$tag = preg_replace( '/\sasync(=("|\')async("|\')|=("|\')("|\')|)?/i', '', $tag );
		$tag = str_replace( ' data-wp-strategy="defer"', '', $tag );
		$tag = str_replace( " data-wp-strategy='defer'", '', $tag );

		return $tag;
	}
}
