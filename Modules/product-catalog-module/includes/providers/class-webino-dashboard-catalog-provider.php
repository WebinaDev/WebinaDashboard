<?php
/**
 * Base catalog provider helpers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared helpers for catalog providers.
 */
abstract class Webino_Dashboard_Catalog_Provider {

	/**
	 * @param string $category Category key.
	 * @param string $q Text query.
	 * @param string $barcode Barcode.
	 * @param int    $page Page (1-based).
	 * @return array{items:array<int,array<string,mixed>>,has_more:bool}|WP_Error
	 */
	abstract public function search( $category, $q, $barcode, $page );

	/**
	 * Build a normalized item.
	 *
	 * @param array<string,mixed> $fields Fields.
	 * @return array<string,mixed>
	 */
	protected static function item( array $fields ) {
		return array(
			'id'          => (string) ( $fields['id'] ?? '' ),
			'category'    => (string) ( $fields['category'] ?? '' ),
			'barcode'     => (string) ( $fields['barcode'] ?? '' ),
			'title'       => (string) ( $fields['title'] ?? '' ),
			'brand'       => (string) ( $fields['brand'] ?? '' ),
			'description' => (string) ( $fields['description'] ?? '' ),
			'image_url'   => (string) ( $fields['image_url'] ?? '' ),
			'source'      => (string) ( $fields['source'] ?? '' ),
		);
	}
}
