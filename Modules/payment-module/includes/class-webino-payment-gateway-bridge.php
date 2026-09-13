<?php
/**
 * Shared official-plugin detection + settings bridging for payment gateways.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Detect standalone WC gateway plugins and prefer their option bags when active.
 */
final class Webino_Payment_Gateway_Bridge {

	/**
	 * @param string|list<string> $plugin_files Relative to wp-content/plugins (e.g. snapppay-woocommerce-gateway/index.php).
	 * @return bool
	 */
	public static function official_active( $plugin_files ) {
		$files = is_array( $plugin_files ) ? $plugin_files : array( $plugin_files );
		if ( ! function_exists( 'is_plugin_active' ) ) {
			$path = ABSPATH . 'wp-admin/includes/plugin.php';
			if ( is_readable( $path ) ) {
				require_once $path;
			}
		}
		if ( ! function_exists( 'is_plugin_active' ) ) {
			return false;
		}
		foreach ( $files as $file ) {
			$file = ltrim( str_replace( '\\', '/', (string) $file ), '/' );
			if ( '' === $file ) {
				continue;
			}
			if ( is_plugin_active( $file ) ) {
				return true;
			}
			// Network-active on multisite.
			if ( function_exists( 'is_plugin_active_for_network' ) && is_plugin_active_for_network( $file ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * First non-empty WooCommerce gateway settings bag.
	 *
	 * @param list<string> $option_keys e.g. woocommerce_WC_Gateway_SnappPay_settings.
	 * @return array<string,mixed>
	 */
	public static function read_wc_settings( array $option_keys ) {
		foreach ( $option_keys as $key ) {
			$raw = get_option( (string) $key, null );
			if ( is_array( $raw ) && ! empty( $raw ) ) {
				return $raw;
			}
		}
		return array();
	}

	/**
	 * Persist WC gateway settings to the first existing key, or create $create_key.
	 *
	 * @param list<string>        $option_keys Candidate keys (prefer existing).
	 * @param array<string,mixed> $settings    Settings bag.
	 * @param string              $create_key  Key to create when none exist.
	 * @return string Written option key.
	 */
	public static function write_wc_settings( array $option_keys, array $settings, $create_key ) {
		$target = (string) $create_key;
		foreach ( $option_keys as $key ) {
			$key = (string) $key;
			$existing = get_option( $key, null );
			if ( is_array( $existing ) ) {
				$target = $key;
				break;
			}
		}
		update_option( $target, $settings, false );
		return $target;
	}

	/**
	 * Merge webino module settings with WC bag (WC wins for shared keys when official active).
	 *
	 * @param array<string,mixed> $webino
	 * @param array<string,mixed> $wc
	 * @param list<string>        $shared_keys
	 * @param bool                $prefer_wc
	 * @return array<string,mixed>
	 */
	public static function merge_settings( array $webino, array $wc, array $shared_keys, $prefer_wc ) {
		$out = $webino;
		foreach ( $shared_keys as $key ) {
			if ( ! array_key_exists( $key, $wc ) ) {
				continue;
			}
			$wc_val = $wc[ $key ];
			if ( $prefer_wc || ! array_key_exists( $key, $out ) || '' === (string) $out[ $key ] ) {
				$out[ $key ] = $wc_val;
			}
		}
		return $out;
	}
}
