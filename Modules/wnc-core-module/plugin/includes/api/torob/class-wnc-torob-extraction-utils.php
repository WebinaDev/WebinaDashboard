<?php
/**
 * Torob port — adapted from official plugin 2.3.0.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

class WNC_Torob_Extraction_Utils
{
    public static function get_page_unique(WC_Product $product): int
    {
        return $product->get_id();
    }

    public static function get_page_url(WC_Product $product): string
    {
        return $product->get_permalink();
    }
}
