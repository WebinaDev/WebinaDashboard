<?php
/**
 * Open Library books provider.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Open Library search / ISBN lookup.
 */
final class Webino_Dashboard_Catalog_Openlibrary_Provider extends Webino_Dashboard_Catalog_Provider {

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
		$page = max( 1, (int) $page );
		$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $barcode );
		if ( '' === $code ) {
			$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $q );
		}

		$query = '' !== $code ? ( 'isbn:' . $code ) : trim( (string) $q );
		if ( '' === $query ) {
			return array( 'items' => array(), 'has_more' => false );
		}

		$url  = add_query_arg(
			array(
				'q'      => $query,
				'page'   => $page,
				'limit'  => 20,
				'fields' => 'key,title,author_name,isbn,publisher,cover_i,first_sentence,subject',
			),
			'https://openlibrary.org/search.json'
		);
		$data = Webino_Dashboard_Product_Catalog_Http::get_json( $url, array(), 30 * MINUTE_IN_SECONDS );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$docs  = isset( $data['docs'] ) && is_array( $data['docs'] ) ? $data['docs'] : array();
		$items = array();
		foreach ( $docs as $doc ) {
			if ( ! is_array( $doc ) ) {
				continue;
			}
			$title = trim( (string) ( $doc['title'] ?? '' ) );
			if ( '' === $title ) {
				continue;
			}
			$isbn = '';
			if ( ! empty( $doc['isbn'] ) && is_array( $doc['isbn'] ) ) {
				$isbn = (string) $doc['isbn'][0];
			}
			$img = '';
			if ( ! empty( $doc['cover_i'] ) ) {
				$img = 'https://covers.openlibrary.org/b/id/' . (int) $doc['cover_i'] . '-L.jpg';
			}
			$authors = '';
			if ( ! empty( $doc['author_name'] ) && is_array( $doc['author_name'] ) ) {
				$authors = implode( ', ', array_map( 'strval', $doc['author_name'] ) );
			}
			$desc = '';
			if ( ! empty( $doc['first_sentence'] ) ) {
				if ( is_array( $doc['first_sentence'] ) ) {
					$desc = (string) $doc['first_sentence'][0];
				} else {
					$desc = (string) $doc['first_sentence'];
				}
			}
			$key = (string) ( $doc['key'] ?? md5( $title ) );
			$items[] = self::item(
				array(
					'id'          => 'ol:' . $key,
					'category'    => 'books',
					'barcode'     => $isbn,
					'title'       => $title,
					'brand'       => $authors,
					'description' => $desc,
					'image_url'   => $img,
					'source'      => 'openlibrary',
				)
			);
		}
		$num = (int) ( $data['numFound'] ?? $data['num_found'] ?? 0 );
		return array(
			'items'    => $items,
			'has_more' => ( $page * 20 ) < $num,
		);
	}
}
