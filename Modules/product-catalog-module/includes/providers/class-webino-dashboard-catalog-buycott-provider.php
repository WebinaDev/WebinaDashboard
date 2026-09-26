<?php
/**
 * Buycott provider (access token required).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Buycott UPC lookup / search.
 */
final class Webino_Dashboard_Catalog_Buycott_Provider extends Webino_Dashboard_Catalog_Provider {

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
		$token = Webino_Dashboard_Product_Catalog_Settings::get()['buycott_access_token'] ?? '';
		if ( '' === $token ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $barcode );
		if ( '' === $code ) {
			$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $q );
		}

		if ( '' !== $code ) {
			$url  = add_query_arg(
				array(
					'barcode'      => $code,
					'access_token' => $token,
				),
				'https://www.buycott.com/api/v4/products/lookup'
			);
		} else {
			$q = trim( (string) $q );
			if ( '' === $q ) {
				return array( 'items' => array(), 'has_more' => false );
			}
			$url = add_query_arg(
				array(
					'query'        => $q,
					'access_token' => $token,
				),
				'https://www.buycott.com/api/v4/products/search'
			);
		}

		$data = Webino_Dashboard_Product_Catalog_Http::get_json( $url, array(), 20 * MINUTE_IN_SECONDS );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$products = isset( $data['products'] ) && is_array( $data['products'] ) ? $data['products'] : array();
		$items    = array();
		foreach ( $products as $prod ) {
			if ( ! is_array( $prod ) ) {
				continue;
			}
			$title = trim( (string) ( $prod['product_name'] ?? $prod['name'] ?? '' ) );
			if ( '' === $title ) {
				continue;
			}
			$items[] = self::item(
				array(
					'id'          => 'buycott:' . (string) ( $prod['product_gtin'] ?? $prod['id'] ?? md5( $title ) ),
					'category'    => 'merchandise',
					'barcode'     => (string) ( $prod['product_gtin'] ?? '' ),
					'title'       => $title,
					'brand'       => (string) ( $prod['brand_name'] ?? $prod['manufacturer_name'] ?? '' ),
					'description' => (string) ( $prod['product_description'] ?? $prod['category_name'] ?? '' ),
					'image_url'   => (string) ( $prod['product_image_url'] ?? '' ),
					'source'      => 'buycott',
				)
			);
		}
		return array(
			'items'    => $items,
			'has_more' => false,
		);
	}
}
