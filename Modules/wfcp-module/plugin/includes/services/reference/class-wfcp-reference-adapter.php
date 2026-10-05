<?php
/**
 * Adapter interface for reference price sources.
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Interface WFCP_Reference_Adapter.
 */
interface WFCP_Reference_Adapter {

	/**
	 * Unique source slug.
	 *
	 * @return string
	 */
	public function get_slug();

	/**
	 * Whether this adapter can handle the URL (and is enabled in settings).
	 *
	 * @param string $url URL.
	 * @return bool
	 */
	public function can_handle( $url );

	/**
	 * Fetch price/stock from URL.
	 *
	 * Context may include:
	 * - variation_attributes (array attribute_pa_x => value)
	 * - variation_id (remote or local hint)
	 * - query params already parsed from URL
	 *
	 * Return shape:
	 * array(
	 *   'price'        => float|null,   // in unit below
	 *   'price_unit'   => 'toman'|'rial',
	 *   'in_stock'     => bool|null,
	 *   'stock_qty'    => int|null,     // only when real quantity known
	 *   'source'       => string,
	 *   'raw'          => mixed,        // optional debug
	 *   'message'      => string,       // optional
	 * )
	 * or WP_Error.
	 *
	 * @param string $url     Product URL.
	 * @param array  $context Optional context.
	 * @return array|WP_Error
	 */
	public function fetch( $url, $context = array() );
}
