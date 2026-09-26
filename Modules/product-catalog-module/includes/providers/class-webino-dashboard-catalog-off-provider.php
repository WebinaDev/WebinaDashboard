<?php
/**
 * Open Food / Beauty / Pet / Products Facts provider.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * OFF family adapter.
 */
final class Webino_Dashboard_Catalog_Off_Provider extends Webino_Dashboard_Catalog_Provider {

	/**
	 * @return array<string,string>
	 */
	public static function hosts() {
		return array(
			'food'    => 'https://world.openfoodfacts.org',
			'beauty'  => 'https://world.openbeautyfacts.org',
			'pet'     => 'https://world.openpetfoodfacts.org',
			'general' => 'https://world.openproductsfacts.org',
		);
	}

	/**
	 * @param string $category Category.
	 * @param string $q Query.
	 * @param string $barcode Barcode.
	 * @param int    $page Page.
	 * @return array{items:array<int,array<string,mixed>>,has_more:bool}|WP_Error
	 */
	public function search( $category, $q, $barcode, $page ) {
		$hosts = self::hosts();
		if ( ! isset( $hosts[ $category ] ) ) {
			return array( 'items' => array(), 'has_more' => false );
		}
		$host = $hosts[ $category ];
		$page = max( 1, (int) $page );
		$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $barcode );
		if ( '' === $code ) {
			$code = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( $q );
		}

		if ( '' !== $code ) {
			$url  = $host . '/api/v2/product/' . rawurlencode( $code ) . '.json';
			$data = Webino_Dashboard_Product_Catalog_Http::get_json( $url, array(), HOUR_IN_SECONDS );
			if ( is_wp_error( $data ) ) {
				return $data;
			}
			$status = (int) ( $data['status'] ?? 0 );
			$prod   = isset( $data['product'] ) && is_array( $data['product'] ) ? $data['product'] : null;
			if ( 1 !== $status || ! $prod ) {
				return array( 'items' => array(), 'has_more' => false );
			}
			$item = $this->map_product( $prod, $category );
			return array(
				'items'    => $item ? array( $item ) : array(),
				'has_more' => false,
			);
		}

		$q = trim( (string) $q );
		if ( '' === $q ) {
			return array( 'items' => array(), 'has_more' => false );
		}

		// Prefer Search-a-licious for food; other verticals use CGI search on their host.
		if ( 'food' === $category ) {
			$url  = add_query_arg(
				array(
					'q'         => $q,
					'page_size' => 24,
					'page'      => $page,
					'fields'    => 'code,product_name,brands,image_url,image_front_url,generic_name,ingredients_text,categories',
				),
				'https://search.openfoodfacts.org/search'
			);
			$data = Webino_Dashboard_Product_Catalog_Http::get_json( $url, array(), 15 * MINUTE_IN_SECONDS );
			if ( ! is_wp_error( $data ) ) {
				$hits = array();
				if ( isset( $data['hits'] ) && is_array( $data['hits'] ) ) {
					$hits = $data['hits'];
				} elseif ( isset( $data['products'] ) && is_array( $data['products'] ) ) {
					$hits = $data['products'];
				}
				$items = array();
				foreach ( $hits as $row ) {
					if ( ! is_array( $row ) ) {
						continue;
					}
					// Search-a-licious may nest under _source / product.
					$prod = $row;
					if ( isset( $row['_source'] ) && is_array( $row['_source'] ) ) {
						$prod = $row['_source'];
					}
					$mapped = $this->map_product( $prod, $category );
					if ( $mapped ) {
						$items[] = $mapped;
					}
				}
				if ( $items ) {
					return array(
						'items'    => $items,
						'has_more' => count( $items ) >= 24,
					);
				}
			}
		}

		$url  = add_query_arg(
			array(
				'search_terms'  => $q,
				'search_simple' => 1,
				'action'        => 'process',
				'json'          => 1,
				'page'          => $page,
				'page_size'     => 24,
			),
			$host . '/cgi/search.pl'
		);
		$data = Webino_Dashboard_Product_Catalog_Http::get_json( $url, array(), 15 * MINUTE_IN_SECONDS );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$products = isset( $data['products'] ) && is_array( $data['products'] ) ? $data['products'] : array();
		$items    = array();
		foreach ( $products as $prod ) {
			if ( ! is_array( $prod ) ) {
				continue;
			}
			$mapped = $this->map_product( $prod, $category );
			if ( $mapped ) {
				$items[] = $mapped;
			}
		}
		$count      = (int) ( $data['count'] ?? 0 );
		$page_size  = (int) ( $data['page_size'] ?? 24 );
		$page_count = $page_size > 0 ? (int) ceil( $count / $page_size ) : 1;
		return array(
			'items'    => $items,
			'has_more' => $page < $page_count,
		);
	}

	/**
	 * @param array<string,mixed> $prod Product.
	 * @param string              $category Category.
	 * @return array<string,mixed>|null
	 */
	private function map_product( array $prod, $category ) {
		$title = (string) ( $prod['product_name'] ?? $prod['product_name_en'] ?? $prod['generic_name'] ?? '' );
		$title = trim( $title );
		if ( '' === $title ) {
			return null;
		}
		$code = (string) ( $prod['code'] ?? $prod['barcode'] ?? '' );
		$img  = (string) ( $prod['image_front_url'] ?? $prod['image_url'] ?? '' );
		if ( '' === $img && isset( $prod['image_small_url'] ) ) {
			$img = (string) $prod['image_small_url'];
		}
		$desc = trim(
			(string) ( $prod['generic_name'] ?? '' ) . "\n" . (string) ( $prod['ingredients_text'] ?? '' )
		);
		return self::item(
			array(
				'id'          => 'off:' . $category . ':' . ( $code ?: md5( $title ) ),
				'category'    => $category,
				'barcode'     => $code,
				'title'       => $title,
				'brand'       => (string) ( $prod['brands'] ?? '' ),
				'description' => trim( $desc ),
				'image_url'   => $img,
				'source'      => 'openfacts',
			)
		);
	}
}
