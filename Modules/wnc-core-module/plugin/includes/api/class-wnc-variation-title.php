<?php
/**
 * Shared variation title helper for crawl feeds (Basalam / Torob style).
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Build parent + attribute display titles for WooCommerce variations.
 */
class WNC_Variation_Title {

	/**
	 * Whether platform credentials enable expand_variations.
	 *
	 * @param string $platform Platform id.
	 * @param bool   $default  Default when key missing.
	 * @return bool
	 */
	public static function expand_enabled( $platform, $default = false ) {
		$p = WNC_Settings::get_platform( (string) $platform );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		if ( ! array_key_exists( 'expand_variations', $c ) ) {
			return (bool) $default;
		}
		return ! empty( $c['expand_variations'] );
	}

	/**
	 * Parent name + variation attribute display values.
	 *
	 * Uses get_variation_attributes() (Basalam parity). On failed term lookup,
	 * keeps the raw decoded slug/value instead of blanking it.
	 *
	 * @param WC_Product $variation Variation product.
	 * @param WC_Product $parent    Parent variable product.
	 * @param int        $max_len   Max title length.
	 * @return string
	 */
	public static function build( $variation, $parent, $max_len = 500 ) {
		if ( ! $variation instanceof WC_Product || ! $parent instanceof WC_Product ) {
			return $variation instanceof WC_Product ? $variation->get_name() : '';
		}

		$base  = $parent->get_name();
		$parts = array();

		$attrs = method_exists( $variation, 'get_variation_attributes' )
			? $variation->get_variation_attributes()
			: $variation->get_attributes();

		if ( ! is_array( $attrs ) ) {
			$attrs = array();
		}

		foreach ( $attrs as $attribute_name => $attribute_value ) {
			if ( '' === $attribute_value || null === $attribute_value ) {
				continue;
			}

			$taxonomy = str_replace( 'attribute_', '', (string) $attribute_name );
			$value    = rawurldecode( (string) $attribute_value );

			if ( $taxonomy && taxonomy_exists( $taxonomy ) ) {
				$term = get_term_by( 'slug', $attribute_value, $taxonomy );
				if ( $term && ! is_wp_error( $term ) ) {
					$value = (string) $term->name;
				}
			}

			$value = trim( str_replace( '-', ' ', $value ) );
			if ( '' !== $value ) {
				$parts[] = $value;
			}
		}

		$combined = $parts ? trim( $base . ' ' . implode( ' ', $parts ) ) : $base;
		$max_len  = max( 1, (int) $max_len );
		return function_exists( 'mb_substr' ) ? mb_substr( $combined, 0, $max_len ) : substr( $combined, 0, $max_len );
	}
}
