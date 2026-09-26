<?php
/**
 * UPCitemdb trial provider (merchandise).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * UPCitemdb free trial lookup + search.
 */
final class Webino_Dashboard_Catalog_Upcitemdb_Provider extends Webino_Dashboard_Catalog_Provider {

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
		$page = max( 1, (int) $page );
		$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $barcode );
		if ( '' === $code ) {
			$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $q );
		}

		if ( '' !== $code ) {
			$url  = 'https://api.upcitemdb.com/prod/trial/lookup?upc=' . rawurlencode( $code );
			$data = Webino_Dashboard_Product_Catalog_Http::get_json( $url, array(), HOUR_IN_SECONDS );
			if ( is_wp_error( $data ) ) {
				return $data;
			}
			return array(
				'items'    => $this->map_items( isset( $data['items'] ) && is_array( $data['items'] ) ? $data['items'] : array() ),
				'has_more' => false,
			);
		}

		$q = trim( (string) $q );
		if ( '' === $q ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$offset = ( $page - 1 ) * 10;
		$url    = add_query_arg(
			array(
				's'      => $q,
				'offset' => $offset,
			),
			'https://api.upcitemdb.com/prod/trial/search'
		);
		$data = Webino_Dashboard_Product_Catalog_Http::get_json( $url, array(), 10 * MINUTE_IN_SECONDS );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$items = $this->map_items( isset( $data['items'] ) && is_array( $data['items'] ) ? $data['items'] : array() );
		$total = (int) ( $data['total'] ?? 0 );
		return array(
			'items'    => $items,
			'has_more' => ( $offset + 10 ) < $total && (int) ( $data['offset'] ?? -1 ) >= 0,
		);
	}

	/**
	 * @param array<int,mixed> $rows Rows.
	 * @return array<int,array<string,mixed>>
	 */
	private function map_items( array $rows ) {
		$out = array();
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$title = trim( (string) ( $row['title'] ?? '' ) );
			if ( '' === $title ) {
				continue;
			}
			$barcode = (string) ( $row['ean'] ?? $row['upc'] ?? '' );
			$img     = '';
			if ( ! empty( $row['images'] ) && is_array( $row['images'] ) ) {
				$img = (string) $row['images'][0];
			}
			$out[] = self::item(
				array(
					'id'          => 'upc:' . ( $barcode ?: md5( $title ) ),
					'category'    => 'merchandise',
					'barcode'     => $barcode,
					'title'       => $title,
					'brand'       => (string) ( $row['brand'] ?? '' ),
					'description' => (string) ( $row['description'] ?? '' ),
					'image_url'   => $img,
					'source'      => 'upcitemdb',
				)
			);
		}
		return $out;
	}
}
