<?php
/**
 * Google Books provider (requires API key).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Google Books volumes search.
 */
final class Webino_Dashboard_Catalog_Googlebooks_Provider extends Webino_Dashboard_Catalog_Provider {

	/**
	 * @param string $category Category.
	 * @param string $q Query.
	 * @param string $barcode Barcode/ISBN.
	 * @param int    $page Page.
	 * @return array{items:array<int,array<string,mixed>>,has_more:bool}|WP_Error
	 */
	public function search( $category, $q, $barcode, $page ) {
		if ( 'books' !== $category ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$key = Webino_Dashboard_Product_Catalog_Settings::get()['google_books_api_key'] ?? '';
		if ( '' === $key ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$page = max( 1, (int) $page );
		$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $barcode );
		if ( '' === $code ) {
			$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $q );
		}
		$query = '' !== $code ? ( 'isbn:' . $code ) : trim( (string) $q );
		if ( '' === $query ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$start = ( $page - 1 ) * 20;
		$url   = add_query_arg(
			array(
				'q'          => $query,
				'startIndex' => $start,
				'maxResults' => 20,
				'key'        => $key,
			),
			'https://www.googleapis.com/books/v1/volumes'
		);
		$data = Webino_Dashboard_Product_Catalog_Http::get_json( $url, array(), 20 * MINUTE_IN_SECONDS );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$volumes = isset( $data['items'] ) && is_array( $data['items'] ) ? $data['items'] : array();
		$items   = array();
		foreach ( $volumes as $vol ) {
			if ( ! is_array( $vol ) ) {
				continue;
			}
			$info = isset( $vol['volumeInfo'] ) && is_array( $vol['volumeInfo'] ) ? $vol['volumeInfo'] : array();
			$title = trim( (string) ( $info['title'] ?? '' ) );
			if ( '' === $title ) {
				continue;
			}
			$isbn = '';
			if ( ! empty( $info['industryIdentifiers'] ) && is_array( $info['industryIdentifiers'] ) ) {
				foreach ( $info['industryIdentifiers'] as $idrow ) {
					if ( ! is_array( $idrow ) ) {
						continue;
					}
					$type = (string) ( $idrow['type'] ?? '' );
					if ( in_array( $type, array( 'ISBN_13', 'ISBN_10' ), true ) ) {
						$isbn = (string) ( $idrow['identifier'] ?? '' );
						if ( 'ISBN_13' === $type ) {
							break;
						}
					}
				}
			}
			$img = '';
			if ( ! empty( $info['imageLinks'] ) && is_array( $info['imageLinks'] ) ) {
				$img = (string) ( $info['imageLinks']['thumbnail'] ?? $info['imageLinks']['smallThumbnail'] ?? '' );
				$img = str_replace( 'http://', 'https://', $img );
			}
			$authors = '';
			if ( ! empty( $info['authors'] ) && is_array( $info['authors'] ) ) {
				$authors = implode( ', ', array_map( 'strval', $info['authors'] ) );
			}
			$items[] = self::item(
				array(
					'id'          => 'gbooks:' . (string) ( $vol['id'] ?? md5( $title ) ),
					'category'    => 'books',
					'barcode'     => $isbn,
					'title'       => $title,
					'brand'       => $authors ?: (string) ( $info['publisher'] ?? '' ),
					'description' => (string) ( $info['description'] ?? '' ),
					'image_url'   => $img,
					'source'      => 'googlebooks',
				)
			);
		}
		$total = (int) ( $data['totalItems'] ?? 0 );
		return array(
			'items'    => $items,
			'has_more' => ( $start + 20 ) < $total,
		);
	}
}
