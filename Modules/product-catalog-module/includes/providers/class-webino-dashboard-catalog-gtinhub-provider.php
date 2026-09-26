<?php
/**
 * GTINHub provider (API key, barcode only).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * GTINHub product lookup.
 */
final class Webino_Dashboard_Catalog_Gtinhub_Provider extends Webino_Dashboard_Catalog_Provider {

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
		$key = Webino_Dashboard_Product_Catalog_Settings::get()['gtinhub_api_key'] ?? '';
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
		$url  = 'https://gtinhub.com/api/v1/product/' . rawurlencode( $code );
		$data = Webino_Dashboard_Product_Catalog_Http::get_json(
			$url,
			array( 'headers' => array( 'X-API-Key' => $key ) ),
			HOUR_IN_SECONDS
		);
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		if ( empty( $data['found'] ) && empty( $data['product'] ) ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$prod  = isset( $data['product'] ) && is_array( $data['product'] ) ? $data['product'] : array();
		$title = trim( (string) ( $prod['name'] ?? '' ) );
		if ( '' === $title ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$item = self::item(
			array(
				'id'          => 'gtin:' . (string) ( $prod['gtin'] ?? $code ),
				'category'    => 'merchandise',
				'barcode'     => (string) ( $prod['gtin'] ?? $code ),
				'title'       => $title,
				'brand'       => (string) ( $prod['brand'] ?? '' ),
				'description' => (string) ( $prod['description'] ?? $prod['category'] ?? '' ),
				'image_url'   => (string) ( $prod['image_url'] ?? '' ),
				'source'      => 'gtinhub',
			)
		);
		return array( 'items' => array( $item ), 'has_more' => false );
	}
}
