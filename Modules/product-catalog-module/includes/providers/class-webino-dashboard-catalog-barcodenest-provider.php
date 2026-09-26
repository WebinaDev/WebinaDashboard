<?php
/**
 * BarcodeNest provider (API key required, barcode only).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * BarcodeNest lookup.
 */
final class Webino_Dashboard_Catalog_Barcodenest_Provider extends Webino_Dashboard_Catalog_Provider {

	/**
	 * @param string $category Category.
	 * @param string $q Query.
	 * @param string $barcode Barcode.
	 * @param int    $page Page.
	 * @return array{items:array<int,array<string,mixed>>,has_more:bool}|WP_Error
	 */
	public function search( $category, $q, $barcode, $page ) {
		if ( 'merchandise' !== $category ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$key = Webino_Dashboard_Product_Catalog_Settings::get()['barcodenest_api_key'] ?? '';
		if ( '' === $key ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $barcode );
		if ( '' === $code ) {
			$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $q );
		}
		if ( '' === $code ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$url  = 'https://api.barcodenest.com/v1/products/' . rawurlencode( $code );
		$data = Webino_Dashboard_Product_Catalog_Http::get_json(
			$url,
			array( 'headers' => array( 'X-API-Key' => $key ) ),
			HOUR_IN_SECONDS
		);
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$prod = isset( $data['product'] ) && is_array( $data['product'] ) ? $data['product'] : $data;
		$title = trim( (string) ( $prod['name'] ?? $prod['title'] ?? '' ) );
		if ( '' === $title ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$cats = '';
		if ( ! empty( $prod['categories'] ) && is_array( $prod['categories'] ) ) {
			$cats = implode( ', ', array_map( 'strval', $prod['categories'] ) );
		}
		$item = self::item(
			array(
				'id'          => 'bnest:' . (string) ( $data['barcode'] ?? $code ),
				'category'    => 'merchandise',
				'barcode'     => (string) ( $data['barcode'] ?? $data['canonical_gtin'] ?? $code ),
				'title'       => $title,
				'brand'       => (string) ( $prod['brand'] ?? '' ),
				'description' => (string) ( $prod['ingredients'] ?? $prod['description'] ?? $cats ),
				'image_url'   => (string) ( $prod['image_url'] ?? '' ),
				'source'      => 'barcodenest',
			)
		);
		return array( 'items' => array( $item ), 'has_more' => false );
	}
}
