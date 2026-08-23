<?php
/**
 * Coffee origin countries taxonomy.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * product_coffee_origin taxonomy + seed countries.
 */
class Webino_Dashboard_Coffee_Origins {

	const TAXONOMY   = 'product_coffee_origin';
	const SEED_OPTION = 'webino_coffee_origins_seeded';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_taxonomy' ), 11 );
		add_action( 'init', array( __CLASS__, 'maybe_seed' ), 20 );
	}

	/**
	 * @return void
	 */
	public static function register_taxonomy() {
		if ( taxonomy_exists( self::TAXONOMY ) || ! post_type_exists( 'product' ) ) {
			return;
		}
		register_taxonomy(
			self::TAXONOMY,
			'product',
			array(
				'labels'            => array(
					'name'          => __( 'Coffee origins', 'webino-dashboard' ),
					'singular_name' => __( 'Coffee origin', 'webino-dashboard' ),
				),
				'public'            => true,
				'hierarchical'      => false,
				'show_ui'           => false,
				'show_admin_column' => false,
				'show_in_rest'      => true,
				'rewrite'           => array( 'slug' => 'coffee-origin' ),
			)
		);
	}

	/**
	 * @return array<int,array{name:string,slug:string,iso:string}>
	 */
	public static function seed_countries() {
		return array(
			array(
				'name' => 'اتیوپی',
				'slug' => 'ethiopia',
				'iso'  => 'ET',
			),
			array(
				'name' => 'برزیل',
				'slug' => 'brazil',
				'iso'  => 'BR',
			),
			array(
				'name' => 'کلمبیا',
				'slug' => 'colombia',
				'iso'  => 'CO',
			),
			array(
				'name' => 'کنیا',
				'slug' => 'kenya',
				'iso'  => 'KE',
			),
			array(
				'name' => 'گواتمالا',
				'slug' => 'guatemala',
				'iso'  => 'GT',
			),
			array(
				'name' => 'اندونزی',
				'slug' => 'indonesia',
				'iso'  => 'ID',
			),
			array(
				'name' => 'ویتنام',
				'slug' => 'vietnam',
				'iso'  => 'VN',
			),
			array(
				'name' => 'یمن',
				'slug' => 'yemen',
				'iso'  => 'YE',
			),
			array(
				'name' => 'هند',
				'slug' => 'india',
				'iso'  => 'IN',
			),
			array(
				'name' => 'رواندا',
				'slug' => 'rwanda',
				'iso'  => 'RW',
			),
			array(
				'name' => 'پرو',
				'slug' => 'peru',
				'iso'  => 'PE',
			),
			array(
				'name' => 'کاستاریکا',
				'slug' => 'costa-rica',
				'iso'  => 'CR',
			),
		);
	}

	/**
	 * @return void
	 */
	public static function maybe_seed() {
		if ( '1' === (string) get_option( self::SEED_OPTION, '' ) ) {
			return;
		}
		if ( ! taxonomy_exists( self::TAXONOMY ) ) {
			return;
		}
		$existing = get_terms(
			array(
				'taxonomy'   => self::TAXONOMY,
				'hide_empty' => false,
				'number'     => 1,
				'fields'     => 'ids',
			)
		);
		if ( is_wp_error( $existing ) ) {
			return;
		}
		if ( is_array( $existing ) && count( $existing ) > 0 ) {
			update_option( self::SEED_OPTION, '1', false );
			return;
		}
		foreach ( self::seed_countries() as $row ) {
			$r = wp_insert_term(
				$row['name'],
				self::TAXONOMY,
				array(
					'slug' => $row['slug'],
				)
			);
			if ( is_wp_error( $r ) || empty( $r['term_id'] ) ) {
				continue;
			}
			update_term_meta( (int) $r['term_id'], 'iso_code', strtoupper( $row['iso'] ) );
		}
		update_option( self::SEED_OPTION, '1', false );
	}

	/**
	 * @param WP_Term $term Term.
	 * @return array<string,mixed>
	 */
	public static function map_item( $term ) {
		$id       = (int) $term->term_id;
		$thumb_id = (int) get_term_meta( $id, 'thumbnail_id', true );
		$iso      = strtoupper( sanitize_text_field( (string) get_term_meta( $id, 'iso_code', true ) ) );
		$link     = get_term_link( $term );
		$settings = Webino_Dashboard_Coffee_Profile::get_settings();

		return array(
			'id'            => $id,
			'name'          => $term->name,
			'slug'          => $term->slug,
			'description'   => $term->description,
			'count'         => (int) $term->count,
			'iso_code'      => $iso,
			'flag_emoji'    => self::flag_emoji( $iso ),
			'flag_url'      => self::flag_image_url( $iso, $thumb_id, ! empty( $settings['use_flagcdn'] ) ),
			'thumbnail_id'  => $thumb_id > 0 ? $thumb_id : null,
			'thumbnail_url' => $thumb_id > 0 ? (string) wp_get_attachment_image_url( $thumb_id, 'thumbnail' ) : '',
			'url'           => is_wp_error( $link ) ? '' : (string) $link,
		);
	}

	/**
	 * @param int $product_id Product ID.
	 * @return array<int,int>
	 */
	public static function ids_for_product( $product_id ) {
		$product_id = (int) $product_id;
		if ( $product_id <= 0 || ! taxonomy_exists( self::TAXONOMY ) ) {
			return array();
		}
		$ids = wp_get_object_terms( $product_id, self::TAXONOMY, array( 'fields' => 'ids' ) );
		if ( is_wp_error( $ids ) || ! is_array( $ids ) ) {
			return array();
		}
		return array_values( array_map( 'intval', $ids ) );
	}

	/**
	 * @param int        $product_id Product ID.
	 * @param array<int> $ids        Term IDs.
	 * @return void
	 */
	public static function set_for_product( $product_id, $ids ) {
		$product_id = (int) $product_id;
		if ( $product_id <= 0 || ! taxonomy_exists( self::TAXONOMY ) ) {
			return;
		}
		$ids = array_values( array_filter( array_map( 'intval', (array) $ids ) ) );
		wp_set_object_terms( $product_id, $ids, self::TAXONOMY, false );
		if ( class_exists( 'Webino_Dashboard_Coffee_Profile', false ) ) {
			update_post_meta( $product_id, Webino_Dashboard_Coffee_Profile::INDEX_ORIGIN_COUNT, count( $ids ) );
		}
	}

	/**
	 * @param int $product_id Product ID.
	 * @return array<int,array<string,mixed>>
	 */
	public static function items_for_product( $product_id ) {
		$ids = self::ids_for_product( $product_id );
		if ( array() === $ids ) {
			return array();
		}
		$terms = get_terms(
			array(
				'taxonomy'   => self::TAXONOMY,
				'hide_empty' => false,
				'include'    => $ids,
			)
		);
		if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
			return array();
		}
		$items = array();
		foreach ( $terms as $term ) {
			$items[] = self::map_item( $term );
		}
		return $items;
	}

	/**
	 * @param string $iso ISO 3166-1 alpha-2.
	 * @return string
	 */
	public static function flag_emoji( $iso ) {
		$iso = strtoupper( preg_replace( '/[^A-Za-z]/', '', (string) $iso ) );
		if ( 2 !== strlen( $iso ) ) {
			return '';
		}
		return self::utf8_chr( 0x1F1E6 + ( ord( $iso[0] ) - 65 ) ) . self::utf8_chr( 0x1F1E6 + ( ord( $iso[1] ) - 65 ) );
	}

	/**
	 * @param string $iso      ISO code.
	 * @param int    $thumb_id Attachment ID.
	 * @param bool   $use_cdn  Allow flagcdn.
	 * @return string
	 */
	public static function flag_image_url( $iso, $thumb_id, $use_cdn ) {
		if ( $thumb_id > 0 ) {
			$url = wp_get_attachment_image_url( $thumb_id, 'thumbnail' );
			if ( $url ) {
				return (string) $url;
			}
		}
		$iso = strtolower( preg_replace( '/[^A-Za-z]/', '', (string) $iso ) );
		if ( $use_cdn && 2 === strlen( $iso ) ) {
			return 'https://flagcdn.com/w40/' . $iso . '.png';
		}
		return '';
	}

	/**
	 * @param int $cp Unicode code point.
	 * @return string
	 */
	private static function utf8_chr( $cp ) {
		$cp = (int) $cp;
		if ( $cp < 0x80 ) {
			return chr( $cp );
		}
		if ( $cp < 0x800 ) {
			return chr( 0xC0 | ( $cp >> 6 ) ) . chr( 0x80 | ( $cp & 0x3F ) );
		}
		if ( $cp < 0x10000 ) {
			return chr( 0xE0 | ( $cp >> 12 ) ) . chr( 0x80 | ( ( $cp >> 6 ) & 0x3F ) ) . chr( 0x80 | ( $cp & 0x3F ) );
		}
		return chr( 0xF0 | ( $cp >> 18 ) ) . chr( 0x80 | ( ( $cp >> 12 ) & 0x3F ) ) . chr( 0x80 | ( ( $cp >> 6 ) & 0x3F ) ) . chr( 0x80 | ( $cp & 0x3F ) );
	}
}
