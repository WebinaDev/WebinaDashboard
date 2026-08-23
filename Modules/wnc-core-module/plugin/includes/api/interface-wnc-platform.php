<?php
/**
 * Platform interface.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Marketplace platform adapter contract.
 */
interface WNC_Platform {

	/**
	 * Platform slug.
	 *
	 * @return string
	 */
	public function id();

	/**
	 * Human label.
	 *
	 * @return string
	 */
	public function label();

	/**
	 * Whether live API is implemented.
	 *
	 * @return bool
	 */
	public function is_live();

	/**
	 * Test connection.
	 *
	 * @return true|WP_Error
	 */
	public function test_connection();

	/**
	 * Search remote products.
	 *
	 * @param array<string,mixed> $args Args.
	 * @return array|WP_Error
	 */
	public function search_products( array $args );

	/**
	 * Push price.
	 *
	 * @param array<string,mixed> $map Map row.
	 * @param int                 $price Price in remote unit.
	 * @return true|WP_Error
	 */
	public function push_price( array $map, $price );

	/**
	 * Push stock.
	 *
	 * @param array<string,mixed> $map Map row.
	 * @param int                 $qty Quantity.
	 * @return true|WP_Error
	 */
	public function push_stock( array $map, $qty );

	/**
	 * Pull orders list.
	 *
	 * @param array<string,mixed> $args Args.
	 * @return array|WP_Error
	 */
	public function pull_orders( array $args );

	/**
	 * Get single order detail.
	 *
	 * @param string $remote_id Remote order ID.
	 * @return array|WP_Error
	 */
	public function get_order( $remote_id );

	/**
	 * Whether remote catalog create is supported.
	 *
	 * @return bool
	 */
	public function supports_create_product();

	/**
	 * Create product on remote (when supported).
	 *
	 * @param WC_Product $product Product.
	 * @return array{remote_product_id?:string,remote_variant_id?:string,remote_url?:string}|WP_Error
	 */
	public function create_product( $product );
}
