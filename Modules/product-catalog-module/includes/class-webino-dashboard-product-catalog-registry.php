<?php
/**
 * Product catalog provider registry + search orchestration.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Runs category providers and merges/dedupes results.
 */
final class Webino_Dashboard_Product_Catalog_Registry {

	/**
	 * @return array<string,string>
	 */
	public static function categories() {
		return array(
			'food'         => 'food',
			'beauty'       => 'beauty',
			'pet'          => 'pet',
			'general'      => 'general',
			'books'        => 'books',
			'merchandise'  => 'merchandise',
		);
	}

	/**
	 * @param string $category Category.
	 * @return array<int,Webino_Dashboard_Catalog_Provider>
	 */
	public static function providers_for( $category ) {
		$category = sanitize_key( $category );
		$list     = array();
		switch ( $category ) {
			case 'food':
			case 'beauty':
			case 'pet':
			case 'general':
				$list[] = new Webino_Dashboard_Catalog_Off_Provider();
				break;
			case 'books':
				$list[] = new Webino_Dashboard_Catalog_Openlibrary_Provider();
				$list[] = new Webino_Dashboard_Catalog_Googlebooks_Provider();
				break;
			case 'merchandise':
				$list[] = new Webino_Dashboard_Catalog_Upcitemdb_Provider();
				$list[] = new Webino_Dashboard_Catalog_Barcodenest_Provider();
				$list[] = new Webino_Dashboard_Catalog_Gtinhub_Provider();
				$list[] = new Webino_Dashboard_Catalog_Buycott_Provider();
				break;
		}
		return $list;
	}

	/**
	 * @param string $category Category.
	 * @param string $q Query.
	 * @param string $barcode Barcode.
	 * @param int    $page Page.
	 * @return array{items:array<int,array<string,mixed>>,page:int,has_more:bool,errors:array<int,string>}|WP_Error
	 */
	public static function search( $category, $q, $barcode, $page = 1 ) {
		$category = sanitize_key( $category );
		if ( ! isset( self::categories()[ $category ] ) ) {
			return new WP_Error( 'invalid_category', __( 'Invalid catalog category.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$page = max( 1, (int) $page );
		$q    = sanitize_text_field( (string) $q );
		$barcode = sanitize_text_field( (string) $barcode );
		if ( '' === $q && '' === $barcode ) {
			return new WP_Error( 'empty_query', __( 'Enter a search term or barcode.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$merged   = array();
		$seen     = array();
		$has_more = false;
		$errors   = array();

		foreach ( self::providers_for( $category ) as $provider ) {
			$res = $provider->search( $category, $q, $barcode, $page );
			if ( is_wp_error( $res ) ) {
				$errors[] = $res->get_error_message();
				continue;
			}
			if ( ! empty( $res['has_more'] ) ) {
				$has_more = true;
			}
			foreach ( (array) ( $res['items'] ?? array() ) as $item ) {
				if ( ! is_array( $item ) || '' === (string) ( $item['title'] ?? '' ) ) {
					continue;
				}
				$key = strtolower( (string) ( $item['barcode'] ?? '' ) );
				if ( '' === $key ) {
					$key = strtolower( (string) ( $item['title'] ?? '' ) ) . '|' . strtolower( (string) ( $item['brand'] ?? '' ) );
				}
				if ( isset( $seen[ $key ] ) ) {
					continue;
				}
				$seen[ $key ] = true;
				$merged[]     = $item;
			}
		}

		return array(
			'items'    => array_values( $merged ),
			'page'     => $page,
			'has_more' => $has_more,
			'errors'   => $errors,
		);
	}
}
