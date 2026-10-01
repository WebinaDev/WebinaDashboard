<?php
/**
 * Batched WordPress / WooCommerce exporters for the Webino import schema.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registry.
 */
final class Webino_Dashboard_Migrate_Exporters {

	/**
	 * @return array<string,string> Entity key => class name.
	 */
	public static function map() {
		return array(
			'categories' => 'Webino_Dashboard_Migrate_Export_Categories',
			'media'      => 'Webino_Dashboard_Migrate_Export_Media',
			'products'   => 'Webino_Dashboard_Migrate_Export_Products',
			'customers'  => 'Webino_Dashboard_Migrate_Export_Customers',
			'orders'     => 'Webino_Dashboard_Migrate_Export_Orders',
			'pages'      => 'Webino_Dashboard_Migrate_Export_Pages',
			'posts'      => 'Webino_Dashboard_Migrate_Export_Posts',
			'menus'      => 'Webino_Dashboard_Migrate_Export_Menus',
		);
	}

	/**
	 * @param string $entity Entity key.
	 * @param string $cursor Cursor.
	 * @param int    $limit  Batch size.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function batch( $entity, $cursor, $limit ) {
		$map = self::map();
		if ( ! isset( $map[ $entity ] ) || ! class_exists( $map[ $entity ] ) ) {
			return new WP_Error( 'unknown_entity', 'Unknown migration entity.' );
		}
		$class = $map[ $entity ];
		return $class::export_batch( (string) $cursor, (int) $limit );
	}

	/**
	 * @param string $entity Entity key.
	 * @return int
	 */
	public static function count( $entity ) {
		$map = self::map();
		if ( ! isset( $map[ $entity ] ) || ! class_exists( $map[ $entity ] ) ) {
			return 0;
		}
		$class = $map[ $entity ];
		return (int) $class::count_total();
	}
}

/**
 * Shared row helpers.
 */
final class Webino_Dashboard_Migrate_Export_Support {

	/**
	 * @param list<string> $statuses Status slugs.
	 * @param string       $post_type Post type.
	 * @param int          $cursor Last ID.
	 * @param int          $limit Limit.
	 * @return list<int>
	 */
	public static function post_ids_after( $post_type, array $statuses, $cursor, $limit ) {
		global $wpdb;
		$statuses = array_values( $statuses );
		if ( ! $statuses ) {
			return array();
		}
		$placeholders = implode( ', ', array_fill( 0, count( $statuses ), '%s' ) );
		$sql          = "SELECT ID FROM {$wpdb->posts} WHERE post_type = %s AND post_status IN ($placeholders) AND ID > %d ORDER BY ID ASC LIMIT %d";
		$args         = array_merge( array( $post_type ), $statuses, array( (int) $cursor, (int) $limit ) );
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$ids = $wpdb->get_col( $wpdb->prepare( $sql, $args ) );
		return array_map( 'intval', is_array( $ids ) ? $ids : array() );
	}

	/**
	 * @param string $post_type Post type.
	 * @param list<string> $statuses Statuses.
	 * @return int
	 */
	public static function count_posts( $post_type, array $statuses ) {
		if ( ! function_exists( 'wp_count_posts' ) ) {
			return 0;
		}
		$counts = wp_count_posts( $post_type );
		$total  = 0;
		foreach ( $statuses as $status ) {
			$total += isset( $counts->$status ) ? (int) $counts->$status : 0;
		}
		return $total;
	}

	/**
	 * @param int $attachment_id Attachment ID.
	 * @return array<string,mixed>|null
	 */
	public static function image_ref( $attachment_id ) {
		$attachment_id = (int) $attachment_id;
		if ( $attachment_id <= 0 ) {
			return null;
		}
		$url = function_exists( 'wp_get_attachment_url' ) ? (string) wp_get_attachment_url( $attachment_id ) : '';
		$url = Webino_Dashboard_Migrate_Schema::public_url( $url );
		if ( '' === $url ) {
			return null;
		}
		$alt = function_exists( 'get_post_meta' ) ? (string) get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ) : '';
		return array(
			'source_id' => $attachment_id,
			'url'       => $url,
			'alt'       => $alt,
		);
	}

	/**
	 * @param mixed $date WC_DateTime|string|null.
	 * @return string ISO-8601 or empty.
	 */
	public static function iso_date( $date ) {
		if ( $date instanceof DateTimeInterface ) {
			return gmdate( 'c', $date->getTimestamp() );
		}
		if ( is_string( $date ) && '' !== $date ) {
			$stamp = strtotime( $date );
			return $stamp ? gmdate( 'c', $stamp ) : '';
		}
		return '';
	}

	/**
	 * @param string $value Scalar stored as string.
	 * @return string
	 */
	public static function money( $value ) {
		if ( null === $value || false === $value ) {
			return '';
		}
		return (string) $value;
	}

	/**
	 * @param array<string,mixed> $item Item.
	 * @param string              $entity Entity.
	 * @param int                 $source_id Source id.
	 * @return array<string,mixed>
	 */
	public static function filter_item( array $item, $entity, $source_id ) {
		$item = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $item );
		if ( function_exists( 'apply_filters' ) ) {
			$filtered = apply_filters( 'webino_dashboard_migrate_item', $item, $entity, (int) $source_id );
			if ( is_array( $filtered ) ) {
				$item = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $filtered );
			}
		}
		return $item;
	}
}

/**
 * Product categories, tags, post categories/tags, and brand taxonomies.
 */
final class Webino_Dashboard_Migrate_Export_Categories {

	/**
	 * @return list<string>
	 */
	public static function taxonomies() {
		$taxes = array( 'product_cat', 'product_tag', 'category', 'post_tag' );
		foreach ( array( 'product_brand', 'pwb-brand', 'yith_product_brand' ) as $brand ) {
			if ( function_exists( 'taxonomy_exists' ) && taxonomy_exists( $brand ) ) {
				$taxes[] = $brand;
			}
		}
		if ( function_exists( 'apply_filters' ) ) {
			$filtered = apply_filters( 'webino_dashboard_migrate_taxonomies', $taxes );
			if ( is_array( $filtered ) ) {
				$taxes = $filtered;
			}
		}
		$out = array();
		foreach ( $taxes as $tax ) {
			$tax = (string) $tax;
			if ( preg_match( '/^[A-Za-z0-9_-]+$/', $tax ) ) {
				$out[] = $tax;
			}
		}
		return array_values( array_unique( $out ) );
	}

	/**
	 * @param string       $cursor Cursor `taxonomy|term_id`.
	 * @param list<string> $taxes  Taxonomy list.
	 * @return array{0:string,1:int}
	 */
	public static function parse_cursor( $cursor, array $taxes ) {
		$cursor = (string) $cursor;
		if ( '' === $cursor || ! $taxes ) {
			return array( $taxes ? (string) $taxes[0] : '', 0 );
		}
		$parts = explode( '|', $cursor, 2 );
		$tax   = isset( $parts[0] ) ? (string) $parts[0] : '';
		$last  = isset( $parts[1] ) ? (int) $parts[1] : 0;
		if ( ! in_array( $tax, $taxes, true ) ) {
			return array( (string) $taxes[0], 0 );
		}
		return array( $tax, max( 0, $last ) );
	}

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		$taxes = self::taxonomies();
		$total = self::count_total();
		if ( ! $taxes ) {
			return array(
				'items'       => array(),
				'next_cursor' => '',
				'done'        => true,
				'total'       => 0,
			);
		}
		list( $taxonomy, $last_id ) = self::parse_cursor( $cursor, $taxes );
		$items = array();
		$guard = 0;
		while ( count( $items ) < $limit && $guard < 20 ) {
			++$guard;
			$need = $limit - count( $items );
			$ids  = self::term_ids_after( $taxonomy, $last_id, $need );
			foreach ( $ids as $term_id ) {
				$last_id = $term_id;
				$item    = self::map_term( $term_id, $taxonomy );
				if ( $item ) {
					$items[] = $item;
				}
			}
			if ( count( $ids ) >= $need ) {
				break;
			}
			$next = self::next_taxonomy( $taxonomy, $taxes );
			if ( null === $next ) {
				return array(
					'items'       => $items,
					'next_cursor' => $taxonomy . '|' . $last_id,
					'done'        => true,
					'total'       => $total,
				);
			}
			$taxonomy = $next;
			$last_id  = 0;
		}
		return array(
			'items'       => $items,
			'next_cursor' => $taxonomy . '|' . $last_id,
			'done'        => false,
			'total'       => $total,
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		if ( ! function_exists( 'wp_count_terms' ) ) {
			return 0;
		}
		$total = 0;
		foreach ( self::taxonomies() as $tax ) {
			$n = wp_count_terms(
				array(
					'taxonomy'   => $tax,
					'hide_empty' => false,
				)
			);
			if ( ! is_wp_error( $n ) ) {
				$total += (int) $n;
			}
		}
		return $total;
	}

	/**
	 * @param string $taxonomy Taxonomy.
	 * @param int    $last_id  Last term id.
	 * @param int    $limit    Limit.
	 * @return list<int>
	 */
	private static function term_ids_after( $taxonomy, $last_id, $limit ) {
		global $wpdb;
		if ( $limit <= 0 ) {
			return array();
		}
		$sql = "SELECT t.term_id FROM {$wpdb->terms} t INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = t.term_id WHERE tt.taxonomy = %s AND t.term_id > %d ORDER BY t.term_id ASC LIMIT %d";
		$ids = $wpdb->get_col( $wpdb->prepare( $sql, $taxonomy, (int) $last_id, (int) $limit ) );
		return array_map( 'intval', is_array( $ids ) ? $ids : array() );
	}

	/**
	 * @param string       $current Current taxonomy.
	 * @param list<string> $taxes   All.
	 * @return string|null
	 */
	private static function next_taxonomy( $current, array $taxes ) {
		$index = array_search( $current, $taxes, true );
		if ( false === $index ) {
			return null;
		}
		$next = $index + 1;
		return isset( $taxes[ $next ] ) ? $taxes[ $next ] : null;
	}

	/**
	 * @param int    $term_id  Term id.
	 * @param string $taxonomy Taxonomy.
	 * @return array<string,mixed>|null
	 */
	private static function map_term( $term_id, $taxonomy ) {
		$term = get_term( (int) $term_id, $taxonomy );
		if ( ! $term || is_wp_error( $term ) ) {
			return null;
		}
		$image = null;
		$thumb = (int) get_term_meta( $term->term_id, 'thumbnail_id', true );
		if ( $thumb ) {
			$image = Webino_Dashboard_Migrate_Export_Support::image_ref( $thumb );
		}
		$item = self::shape_item(
			array(
				'taxonomy'         => $taxonomy,
				'source_id'        => (int) $term->term_id,
				'parent_source_id' => (int) $term->parent,
				'name'             => $term->name,
				'slug'             => $term->slug,
				'description'      => $term->description,
				'count'            => (int) $term->count,
				'image'            => $image,
			)
		);
		return Webino_Dashboard_Migrate_Export_Support::filter_item( $item, 'categories', (int) $term->term_id );
	}

	/**
	 * @param array<string,mixed> $raw Raw term.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$raw   = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		$image = null;
		if ( isset( $raw['image'] ) && is_array( $raw['image'] ) ) {
			$url = Webino_Dashboard_Migrate_Schema::public_url( isset( $raw['image']['url'] ) ? $raw['image']['url'] : '' );
			if ( '' !== $url ) {
				$image = array(
					'source_id' => isset( $raw['image']['source_id'] ) ? (int) $raw['image']['source_id'] : 0,
					'url'       => $url,
					'alt'       => isset( $raw['image']['alt'] ) ? (string) $raw['image']['alt'] : '',
				);
			}
		}
		return array(
			'taxonomy'         => isset( $raw['taxonomy'] ) ? (string) $raw['taxonomy'] : '',
			'source_id'        => isset( $raw['source_id'] ) ? (int) $raw['source_id'] : 0,
			'parent_source_id' => isset( $raw['parent_source_id'] ) ? (int) $raw['parent_source_id'] : 0,
			'name'             => isset( $raw['name'] ) ? (string) $raw['name'] : '',
			'slug'             => isset( $raw['slug'] ) ? (string) $raw['slug'] : '',
			'description'      => isset( $raw['description'] ) ? (string) $raw['description'] : '',
			'count'            => isset( $raw['count'] ) ? (int) $raw['count'] : 0,
			'image'            => $image,
		);
	}
}

/**
 * Attachment metadata and public file URLs. Bytes are fetched by Webino.
 */
final class Webino_Dashboard_Migrate_Export_Media {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		$ids   = Webino_Dashboard_Migrate_Export_Support::post_ids_after( 'attachment', array( 'inherit', 'private' ), (int) $cursor, $limit );
		$items = array();
		$last  = (int) $cursor;
		foreach ( $ids as $id ) {
			$last = $id;
			$item = self::map_attachment( $id );
			if ( $item ) {
				$items[] = $item;
			}
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $ids ) < $limit,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		return Webino_Dashboard_Migrate_Export_Support::count_posts( 'attachment', array( 'inherit', 'private' ) );
	}

	/**
	 * @param int $id Attachment ID.
	 * @return array<string,mixed>|null
	 */
	private static function map_attachment( $id ) {
		$post = get_post( $id );
		if ( ! $post ) {
			return null;
		}
		$url  = Webino_Dashboard_Migrate_Schema::public_url( (string) wp_get_attachment_url( $id ) );
		$meta = wp_get_attachment_metadata( $id );
		$meta = is_array( $meta ) ? $meta : array();
		$sizes = array();
		if ( $url && ! empty( $meta['sizes'] ) && is_array( $meta['sizes'] ) && ! empty( $meta['file'] ) ) {
			$base = trailingslashit( dirname( $url ) );
			foreach ( $meta['sizes'] as $name => $size ) {
				if ( ! is_array( $size ) || empty( $size['file'] ) ) {
					continue;
				}
				$size_url = Webino_Dashboard_Migrate_Schema::public_url( $base . $size['file'] );
				if ( '' === $size_url ) {
					continue;
				}
				$sizes[] = array(
					'name'      => (string) $name,
					'url'       => $size_url,
					'width'     => isset( $size['width'] ) ? (int) $size['width'] : 0,
					'height'    => isset( $size['height'] ) ? (int) $size['height'] : 0,
					'mime_type' => isset( $size['mime-type'] ) ? (string) $size['mime-type'] : '',
				);
			}
		}
		$item = self::shape_item(
			array(
				'source_id'   => (int) $id,
				'title'       => $post->post_title,
				'alt'         => (string) get_post_meta( $id, '_wp_attachment_image_alt', true ),
				'caption'     => $post->post_excerpt,
				'description' => $post->post_content,
				'mime_type'   => (string) $post->post_mime_type,
				'url'         => $url,
				'file'        => isset( $meta['file'] ) ? (string) $meta['file'] : '',
				'width'       => isset( $meta['width'] ) ? (int) $meta['width'] : 0,
				'height'      => isset( $meta['height'] ) ? (int) $meta['height'] : 0,
				'filesize'    => isset( $meta['filesize'] ) ? (int) $meta['filesize'] : 0,
				'sizes'       => $sizes,
				'created_at'  => Webino_Dashboard_Migrate_Export_Support::iso_date( $post->post_date_gmt ),
			)
		);
		return Webino_Dashboard_Migrate_Export_Support::filter_item( $item, 'media', (int) $id );
	}

	/**
	 * @param array<string,mixed> $raw Raw media.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$raw   = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		$sizes = array();
		if ( isset( $raw['sizes'] ) && is_array( $raw['sizes'] ) ) {
			foreach ( $raw['sizes'] as $size ) {
				if ( ! is_array( $size ) ) {
					continue;
				}
				$url = Webino_Dashboard_Migrate_Schema::public_url( isset( $size['url'] ) ? $size['url'] : '' );
				if ( '' === $url ) {
					continue;
				}
				$sizes[] = array(
					'name'      => isset( $size['name'] ) ? (string) $size['name'] : '',
					'url'       => $url,
					'width'     => isset( $size['width'] ) ? (int) $size['width'] : 0,
					'height'    => isset( $size['height'] ) ? (int) $size['height'] : 0,
					'mime_type' => isset( $size['mime_type'] ) ? (string) $size['mime_type'] : '',
				);
			}
		}
		return array(
			'source_id'   => isset( $raw['source_id'] ) ? (int) $raw['source_id'] : 0,
			'title'       => isset( $raw['title'] ) ? (string) $raw['title'] : '',
			'alt'         => isset( $raw['alt'] ) ? (string) $raw['alt'] : '',
			'caption'     => isset( $raw['caption'] ) ? (string) $raw['caption'] : '',
			'description' => isset( $raw['description'] ) ? (string) $raw['description'] : '',
			'mime_type'   => isset( $raw['mime_type'] ) ? (string) $raw['mime_type'] : '',
			'url'         => Webino_Dashboard_Migrate_Schema::public_url( isset( $raw['url'] ) ? $raw['url'] : '' ),
			'file'        => isset( $raw['file'] ) ? (string) $raw['file'] : '',
			'width'       => isset( $raw['width'] ) ? (int) $raw['width'] : 0,
			'height'      => isset( $raw['height'] ) ? (int) $raw['height'] : 0,
			'filesize'    => isset( $raw['filesize'] ) ? (int) $raw['filesize'] : 0,
			'sizes'       => $sizes,
			'created_at'  => isset( $raw['created_at'] ) ? (string) $raw['created_at'] : '',
		);
	}
}

/**
 * WooCommerce products, including variations and image URLs.
 */
final class Webino_Dashboard_Migrate_Export_Products {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return array(
				'items'       => array(),
				'next_cursor' => (string) $cursor,
				'done'        => true,
				'total'       => 0,
				'warning'     => 'ووکامرس فعال نیست؛ محصولات رد شد.',
			);
		}
		$ids   = Webino_Dashboard_Migrate_Export_Support::post_ids_after(
			'product',
			array( 'publish', 'draft', 'private', 'pending' ),
			(int) $cursor,
			$limit
		);
		$items = array();
		$last  = (int) $cursor;
		foreach ( $ids as $id ) {
			$last    = $id;
			$product = wc_get_product( $id );
			if ( ! $product ) {
				continue;
			}
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item( self::from_product( $product ), 'products', $id );
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $ids ) < $limit,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return 0;
		}
		return Webino_Dashboard_Migrate_Export_Support::count_posts( 'product', array( 'publish', 'draft', 'private', 'pending' ) );
	}

	/**
	 * @param WC_Product $product Product.
	 * @return array<string,mixed>
	 */
	public static function from_product( $product ) {
		$images = array();
		$thumb  = Webino_Dashboard_Migrate_Export_Support::image_ref( (int) $product->get_image_id() );
		if ( $thumb ) {
			$thumb['position'] = 0;
			$images[]          = $thumb;
		}
		$position = 1;
		foreach ( $product->get_gallery_image_ids() as $image_id ) {
			$ref = Webino_Dashboard_Migrate_Export_Support::image_ref( (int) $image_id );
			if ( ! $ref ) {
				continue;
			}
			$ref['position'] = $position++;
			$images[]        = $ref;
		}

		$categories = self::terms( $product->get_id(), 'product_cat' );
		$tags       = self::terms( $product->get_id(), 'product_tag' );
		$brands     = array();
		foreach ( array( 'product_brand', 'pwb-brand', 'yith_product_brand' ) as $brand_tax ) {
			if ( taxonomy_exists( $brand_tax ) ) {
				$brands = array_merge( $brands, self::terms( $product->get_id(), $brand_tax ) );
			}
		}

		$attributes = array();
		foreach ( $product->get_attributes() as $attr ) {
			if ( ! is_object( $attr ) || ! method_exists( $attr, 'get_name' ) ) {
				continue;
			}
			$options = array();
			if ( $attr->is_taxonomy() ) {
				foreach ( (array) $attr->get_options() as $term_id ) {
					$term = get_term( (int) $term_id );
					if ( $term && ! is_wp_error( $term ) ) {
						$options[] = array(
							'source_id' => (int) $term->term_id,
							'name'      => (string) $term->name,
							'slug'      => (string) $term->slug,
						);
					}
				}
			} else {
				foreach ( (array) $attr->get_options() as $option ) {
					$options[] = array(
						'source_id' => 0,
						'name'      => (string) $option,
						'slug'      => sanitize_title( (string) $option ),
					);
				}
			}
			$attributes[] = array(
				'source_id' => (int) $attr->get_id(),
				'name'      => wc_attribute_label( $attr->get_name() ),
				'slug'      => (string) $attr->get_name(),
				'visible'   => (bool) $attr->get_visible(),
				'variation' => (bool) $attr->get_variation(),
				'options'   => $options,
			);
		}

		$variations = array();
		if ( $product->is_type( 'variable' ) ) {
			foreach ( $product->get_children() as $child_id ) {
				$variation = wc_get_product( $child_id );
				if ( ! $variation ) {
					continue;
				}
				$image = Webino_Dashboard_Migrate_Export_Support::image_ref( (int) $variation->get_image_id() );
				$variations[] = array(
					'source_id'        => (int) $variation->get_id(),
					'sku'              => (string) $variation->get_sku(),
					'status'           => (string) $variation->get_status(),
					'regular_price'    => Webino_Dashboard_Migrate_Export_Support::money( $variation->get_regular_price() ),
					'sale_price'       => Webino_Dashboard_Migrate_Export_Support::money( $variation->get_sale_price() ),
					'manage_stock'     => (bool) $variation->get_manage_stock(),
					'stock_quantity'   => null === $variation->get_stock_quantity() ? null : (int) $variation->get_stock_quantity(),
					'stock_status'     => (string) $variation->get_stock_status(),
					'weight'           => (string) $variation->get_weight(),
					'attributes'       => $variation->get_attributes(),
					'image'            => $image,
					'description'      => method_exists( $variation, 'get_description' ) ? (string) $variation->get_description() : '',
				);
				if ( count( $variations ) >= 200 ) {
					break;
				}
			}
		}

		$downloads = array();
		if ( $product->is_downloadable() ) {
			foreach ( $product->get_downloads() as $download ) {
				$file = Webino_Dashboard_Migrate_Schema::public_url( $download->get_file() );
				if ( '' === $file ) {
					continue;
				}
				$downloads[] = array(
					'name' => (string) $download->get_name(),
					'url'  => $file,
				);
			}
		}

		return self::shape_item(
			array(
				'source_id'          => (int) $product->get_id(),
				'type'               => (string) $product->get_type(),
				'status'             => (string) $product->get_status(),
				'slug'               => (string) $product->get_slug(),
				'name'               => (string) $product->get_name(),
				'description'        => (string) $product->get_description(),
				'short_description'  => (string) $product->get_short_description(),
				'sku'                => (string) $product->get_sku(),
				'regular_price'      => Webino_Dashboard_Migrate_Export_Support::money( $product->get_regular_price() ),
				'sale_price'         => Webino_Dashboard_Migrate_Export_Support::money( $product->get_sale_price() ),
				'currency'           => function_exists( 'get_woocommerce_currency' ) ? (string) get_woocommerce_currency() : '',
				'manage_stock'       => (bool) $product->get_manage_stock(),
				'stock_quantity'     => null === $product->get_stock_quantity() ? null : (int) $product->get_stock_quantity(),
				'stock_status'       => (string) $product->get_stock_status(),
				'backorders'         => (string) $product->get_backorders(),
				'weight'             => (string) $product->get_weight(),
				'dimensions'         => array(
					'length' => (string) $product->get_length(),
					'width'  => (string) $product->get_width(),
					'height' => (string) $product->get_height(),
				),
				'tax_status'         => (string) $product->get_tax_status(),
				'tax_class'          => (string) $product->get_tax_class(),
				'catalog_visibility' => (string) $product->get_catalog_visibility(),
				'featured'           => (bool) $product->get_featured(),
				'virtual'            => (bool) $product->is_virtual(),
				'downloadable'       => (bool) $product->is_downloadable(),
				'downloads'          => $downloads,
				'menu_order'         => (int) $product->get_menu_order(),
				'categories'         => $categories,
				'tags'               => $tags,
				'brands'             => $brands,
				'attributes'         => $attributes,
				'images'             => $images,
				'variations'         => $variations,
				'grouped_children'   => $product->is_type( 'grouped' ) ? array_map( 'intval', (array) $product->get_children() ) : array(),
				'external_url'       => $product->is_type( 'external' ) && method_exists( $product, 'get_product_url' ) ? Webino_Dashboard_Migrate_Schema::public_url( $product->get_product_url() ) : '',
				'created_at'         => Webino_Dashboard_Migrate_Export_Support::iso_date( $product->get_date_created() ),
				'updated_at'         => Webino_Dashboard_Migrate_Export_Support::iso_date( $product->get_date_modified() ),
				'permalink'          => Webino_Dashboard_Migrate_Schema::public_url( (string) get_permalink( $product->get_id() ) ),
			)
		);
	}

	/**
	 * @param int    $product_id Product id.
	 * @param string $taxonomy   Taxonomy.
	 * @return list<array<string,mixed>>
	 */
	private static function terms( $product_id, $taxonomy ) {
		$terms = get_the_terms( $product_id, $taxonomy );
		if ( ! is_array( $terms ) ) {
			return array();
		}
		$out = array();
		foreach ( $terms as $term ) {
			$out[] = array(
				'source_id' => (int) $term->term_id,
				'name'      => (string) $term->name,
				'slug'      => (string) $term->slug,
			);
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $raw Raw product.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$raw    = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		$images = array();
		if ( isset( $raw['images'] ) && is_array( $raw['images'] ) ) {
			foreach ( $raw['images'] as $image ) {
				if ( ! is_array( $image ) ) {
					continue;
				}
				$url = Webino_Dashboard_Migrate_Schema::public_url( isset( $image['url'] ) ? $image['url'] : '' );
				if ( '' === $url ) {
					continue;
				}
				$images[] = array(
					'source_id' => isset( $image['source_id'] ) ? (int) $image['source_id'] : 0,
					'url'       => $url,
					'alt'       => isset( $image['alt'] ) ? (string) $image['alt'] : '',
					'position'  => isset( $image['position'] ) ? (int) $image['position'] : 0,
				);
			}
		}
		$variations = array();
		if ( isset( $raw['variations'] ) && is_array( $raw['variations'] ) ) {
			foreach ( $raw['variations'] as $variation ) {
				if ( ! is_array( $variation ) ) {
					continue;
				}
				$image = null;
				if ( isset( $variation['image'] ) && is_array( $variation['image'] ) ) {
					$url = Webino_Dashboard_Migrate_Schema::public_url( isset( $variation['image']['url'] ) ? $variation['image']['url'] : '' );
					if ( '' !== $url ) {
						$image = array(
							'source_id' => isset( $variation['image']['source_id'] ) ? (int) $variation['image']['source_id'] : 0,
							'url'       => $url,
							'alt'       => isset( $variation['image']['alt'] ) ? (string) $variation['image']['alt'] : '',
						);
					}
				}
				$variations[] = array(
					'source_id'      => isset( $variation['source_id'] ) ? (int) $variation['source_id'] : 0,
					'sku'            => isset( $variation['sku'] ) ? (string) $variation['sku'] : '',
					'status'         => isset( $variation['status'] ) ? (string) $variation['status'] : '',
					'regular_price'  => isset( $variation['regular_price'] ) ? (string) $variation['regular_price'] : '',
					'sale_price'     => isset( $variation['sale_price'] ) ? (string) $variation['sale_price'] : '',
					'manage_stock'   => ! empty( $variation['manage_stock'] ),
					'stock_quantity' => array_key_exists( 'stock_quantity', $variation ) && null !== $variation['stock_quantity'] ? (int) $variation['stock_quantity'] : null,
					'stock_status'   => isset( $variation['stock_status'] ) ? (string) $variation['stock_status'] : '',
					'weight'         => isset( $variation['weight'] ) ? (string) $variation['weight'] : '',
					'attributes'     => isset( $variation['attributes'] ) && is_array( $variation['attributes'] ) ? $variation['attributes'] : array(),
					'image'          => $image,
					'description'    => isset( $variation['description'] ) ? (string) $variation['description'] : '',
				);
			}
		}
		return array(
			'source_id'          => isset( $raw['source_id'] ) ? (int) $raw['source_id'] : 0,
			'type'               => isset( $raw['type'] ) ? (string) $raw['type'] : 'simple',
			'status'             => isset( $raw['status'] ) ? (string) $raw['status'] : '',
			'slug'               => isset( $raw['slug'] ) ? (string) $raw['slug'] : '',
			'name'               => isset( $raw['name'] ) ? (string) $raw['name'] : '',
			'description'        => isset( $raw['description'] ) ? (string) $raw['description'] : '',
			'short_description'  => isset( $raw['short_description'] ) ? (string) $raw['short_description'] : '',
			'sku'                => isset( $raw['sku'] ) ? (string) $raw['sku'] : '',
			'regular_price'      => isset( $raw['regular_price'] ) ? (string) $raw['regular_price'] : '',
			'sale_price'         => isset( $raw['sale_price'] ) ? (string) $raw['sale_price'] : '',
			'currency'           => isset( $raw['currency'] ) ? (string) $raw['currency'] : '',
			'manage_stock'       => ! empty( $raw['manage_stock'] ),
			'stock_quantity'     => array_key_exists( 'stock_quantity', $raw ) && null !== $raw['stock_quantity'] ? (int) $raw['stock_quantity'] : null,
			'stock_status'       => isset( $raw['stock_status'] ) ? (string) $raw['stock_status'] : '',
			'backorders'         => isset( $raw['backorders'] ) ? (string) $raw['backorders'] : 'no',
			'weight'             => isset( $raw['weight'] ) ? (string) $raw['weight'] : '',
			'dimensions'         => array(
				'length' => isset( $raw['dimensions']['length'] ) ? (string) $raw['dimensions']['length'] : '',
				'width'  => isset( $raw['dimensions']['width'] ) ? (string) $raw['dimensions']['width'] : '',
				'height' => isset( $raw['dimensions']['height'] ) ? (string) $raw['dimensions']['height'] : '',
			),
			'tax_status'         => isset( $raw['tax_status'] ) ? (string) $raw['tax_status'] : '',
			'tax_class'          => isset( $raw['tax_class'] ) ? (string) $raw['tax_class'] : '',
			'catalog_visibility' => isset( $raw['catalog_visibility'] ) ? (string) $raw['catalog_visibility'] : 'visible',
			'featured'           => ! empty( $raw['featured'] ),
			'virtual'            => ! empty( $raw['virtual'] ),
			'downloadable'       => ! empty( $raw['downloadable'] ),
			'downloads'          => isset( $raw['downloads'] ) && is_array( $raw['downloads'] ) ? array_values( $raw['downloads'] ) : array(),
			'menu_order'         => isset( $raw['menu_order'] ) ? (int) $raw['menu_order'] : 0,
			'categories'         => isset( $raw['categories'] ) && is_array( $raw['categories'] ) ? array_values( $raw['categories'] ) : array(),
			'tags'               => isset( $raw['tags'] ) && is_array( $raw['tags'] ) ? array_values( $raw['tags'] ) : array(),
			'brands'             => isset( $raw['brands'] ) && is_array( $raw['brands'] ) ? array_values( $raw['brands'] ) : array(),
			'attributes'         => isset( $raw['attributes'] ) && is_array( $raw['attributes'] ) ? array_values( $raw['attributes'] ) : array(),
			'images'             => $images,
			'variations'         => $variations,
			'grouped_children'   => isset( $raw['grouped_children'] ) && is_array( $raw['grouped_children'] ) ? array_map( 'intval', $raw['grouped_children'] ) : array(),
			'external_url'       => Webino_Dashboard_Migrate_Schema::public_url( isset( $raw['external_url'] ) ? $raw['external_url'] : '' ),
			'created_at'         => isset( $raw['created_at'] ) ? (string) $raw['created_at'] : '',
			'updated_at'         => isset( $raw['updated_at'] ) ? (string) $raw['updated_at'] : '',
			'permalink'          => Webino_Dashboard_Migrate_Schema::public_url( isset( $raw['permalink'] ) ? $raw['permalink'] : '' ),
		);
	}
}

/**
 * WordPress customers. Password hashes and sessions are omitted.
 */
final class Webino_Dashboard_Migrate_Export_Customers {

	/**
	 * @return list<string>
	 */
	public static function roles() {
		$roles = array( 'customer' );
		if ( function_exists( 'apply_filters' ) ) {
			$filtered = apply_filters( 'webino_dashboard_migrate_customer_roles', $roles );
			if ( is_array( $filtered ) ) {
				$roles = array();
				foreach ( $filtered as $role ) {
					$role = sanitize_key( (string) $role );
					if ( '' !== $role ) {
						$roles[] = $role;
					}
				}
			}
		}
		return array_values( array_unique( $roles ) );
	}

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		$ids   = self::user_ids_after( (int) $cursor, $limit );
		$items = array();
		$last  = (int) $cursor;
		foreach ( $ids as $id ) {
			$last = $id;
			$user = get_userdata( $id );
			if ( ! $user ) {
				continue;
			}
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item( self::from_user( $user ), 'customers', $id );
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $ids ) < $limit,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		if ( ! function_exists( 'count_users' ) ) {
			return 0;
		}
		$counts = count_users();
		$total  = 0;
		$avail  = isset( $counts['avail_roles'] ) && is_array( $counts['avail_roles'] ) ? $counts['avail_roles'] : array();
		foreach ( self::roles() as $role ) {
			$total += isset( $avail[ $role ] ) ? (int) $avail[ $role ] : 0;
		}
		return $total;
	}

	/**
	 * @param int $cursor Last user id.
	 * @param int $limit  Limit.
	 * @return list<int>
	 */
	private static function user_ids_after( $cursor, $limit ) {
		global $wpdb;
		$roles = self::roles();
		if ( ! $roles ) {
			return array();
		}
		$like = array();
		$args = array( $wpdb->prefix . 'capabilities', (int) $cursor );
		foreach ( $roles as $role ) {
			$like[] = 'meta_value LIKE %s';
			$args[] = '%"' . $wpdb->esc_like( $role ) . '"%';
		}
		$args[] = (int) $limit;
		$sql    = "SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = %s AND user_id > %d AND (" . implode( ' OR ', $like ) . ') ORDER BY user_id ASC LIMIT %d';
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$ids = $wpdb->get_col( $wpdb->prepare( $sql, $args ) );
		return array_map( 'intval', is_array( $ids ) ? $ids : array() );
	}

	/**
	 * @param WP_User $user User.
	 * @return array<string,mixed>
	 */
	private static function from_user( $user ) {
		$billing  = array();
		$shipping = array();
		$fields   = array( 'first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone', 'email' );
		foreach ( $fields as $field ) {
			$billing[ $field ]  = (string) get_user_meta( $user->ID, 'billing_' . $field, true );
			if ( 'phone' === $field || 'email' === $field ) {
				continue;
			}
			$shipping[ $field ] = (string) get_user_meta( $user->ID, 'shipping_' . $field, true );
		}
		$roles = array_values( array_intersect( (array) $user->roles, self::roles() ) );
		return self::shape_item(
			array(
				'source_id'     => (int) $user->ID,
				'email'         => (string) $user->user_email,
				'username'      => (string) $user->user_login,
				'first_name'    => (string) $user->first_name,
				'last_name'     => (string) $user->last_name,
				'display_name'  => (string) $user->display_name,
				'roles'         => $roles,
				'registered_at' => Webino_Dashboard_Migrate_Export_Support::iso_date( $user->user_registered ),
				'billing'       => $billing,
				'shipping'      => $shipping,
				'phone'         => (string) get_user_meta( $user->ID, 'billing_phone', true ),
			)
		);
	}

	/**
	 * @param array<string,mixed> $raw Raw customer.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$raw = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		unset( $raw['user_pass'], $raw['user_activation_key'] );
		return array(
			'source_id'     => isset( $raw['source_id'] ) ? (int) $raw['source_id'] : 0,
			'email'         => isset( $raw['email'] ) ? (string) $raw['email'] : '',
			'username'      => isset( $raw['username'] ) ? (string) $raw['username'] : '',
			'first_name'    => isset( $raw['first_name'] ) ? (string) $raw['first_name'] : '',
			'last_name'     => isset( $raw['last_name'] ) ? (string) $raw['last_name'] : '',
			'display_name'  => isset( $raw['display_name'] ) ? (string) $raw['display_name'] : '',
			'roles'         => isset( $raw['roles'] ) && is_array( $raw['roles'] ) ? array_values( array_map( 'strval', $raw['roles'] ) ) : array(),
			'registered_at' => isset( $raw['registered_at'] ) ? (string) $raw['registered_at'] : '',
			'billing'       => isset( $raw['billing'] ) && is_array( $raw['billing'] ) ? $raw['billing'] : array(),
			'shipping'      => isset( $raw['shipping'] ) && is_array( $raw['shipping'] ) ? $raw['shipping'] : array(),
			'phone'         => isset( $raw['phone'] ) ? (string) $raw['phone'] : '',
		);
	}
}

/**
 * WooCommerce orders. Refunds are nested. Payment tokens are not exported.
 */
final class Webino_Dashboard_Migrate_Export_Orders {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		if ( ! function_exists( 'wc_get_order' ) ) {
			return array(
				'items'       => array(),
				'next_cursor' => (string) $cursor,
				'done'        => true,
				'total'       => 0,
				'warning'     => 'ووکامرس فعال نیست؛ سفارش‌ها رد شد.',
			);
		}
		$ids   = self::order_ids_after( (int) $cursor, $limit );
		$items = array();
		$last  = (int) $cursor;
		foreach ( $ids as $id ) {
			$last  = $id;
			$order = wc_get_order( $id );
			if ( ! $order || 'shop_order_refund' === $order->get_type() ) {
				continue;
			}
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item( self::from_order( $order ), 'orders', $id );
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $ids ) < $limit,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return 0;
		}
		$result = wc_get_orders(
			array(
				'limit'    => 1,
				'paginate' => true,
				'status'   => 'any',
				'type'     => 'shop_order',
				'return'   => 'ids',
			)
		);
		if ( is_object( $result ) && isset( $result->total ) ) {
			return (int) $result->total;
		}
		return 0;
	}

	/**
	 * @param int $cursor Last order id.
	 * @param int $limit  Limit.
	 * @return list<int>
	 */
	private static function order_ids_after( $cursor, $limit ) {
		global $wpdb;
		$hpos = class_exists( '\Automattic\WooCommerce\Utilities\OrderUtil' )
			&& method_exists( '\Automattic\WooCommerce\Utilities\OrderUtil', 'custom_orders_table_usage_is_enabled' )
			&& \Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled();
		if ( $hpos ) {
			$table = $wpdb->prefix . 'wc_orders';
			$sql   = "SELECT id FROM {$table} WHERE type = 'shop_order' AND status NOT IN ('trash','wc-trash','auto-draft','checkout-draft','wc-checkout-draft') AND id > %d ORDER BY id ASC LIMIT %d";
			$ids   = $wpdb->get_col( $wpdb->prepare( $sql, (int) $cursor, (int) $limit ) ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			return array_map( 'intval', is_array( $ids ) ? $ids : array() );
		}
		$statuses = function_exists( 'wc_get_order_statuses' )
			? array_keys( wc_get_order_statuses() )
			: array( 'wc-pending', 'wc-processing', 'wc-on-hold', 'wc-completed', 'wc-cancelled', 'wc-refunded', 'wc-failed' );
		$statuses = array_values( array_diff( $statuses, array( 'wc-checkout-draft', 'checkout-draft', 'trash', 'wc-trash' ) ) );
		return Webino_Dashboard_Migrate_Export_Support::post_ids_after( 'shop_order', $statuses, $cursor, $limit );
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,mixed>
	 */
	public static function from_order( $order ) {
		$lines = array();
		foreach ( $order->get_items( 'line_item' ) as $item ) {
			$lines[] = array(
				'source_id'           => (int) $item->get_id(),
				'product_source_id'   => (int) $item->get_product_id(),
				'variation_source_id' => (int) $item->get_variation_id(),
				'name'                => (string) $item->get_name(),
				'sku'                 => (string) $item->get_meta( '_sku', true ) ?: ( method_exists( $item, 'get_product' ) && $item->get_product() ? (string) $item->get_product()->get_sku() : '' ),
				'quantity'            => (int) $item->get_quantity(),
				'subtotal'            => Webino_Dashboard_Migrate_Export_Support::money( $item->get_subtotal() ),
				'total'               => Webino_Dashboard_Migrate_Export_Support::money( $item->get_total() ),
				'tax'                 => Webino_Dashboard_Migrate_Export_Support::money( $item->get_total_tax() ),
			);
		}
		$shipping = array();
		foreach ( $order->get_items( 'shipping' ) as $ship ) {
			$shipping[] = array(
				'source_id'    => (int) $ship->get_id(),
				'method_id'    => method_exists( $ship, 'get_method_id' ) ? (string) $ship->get_method_id() : '',
				'method_title' => method_exists( $ship, 'get_method_title' ) ? (string) $ship->get_method_title() : '',
				'total'        => Webino_Dashboard_Migrate_Export_Support::money( $ship->get_total() ),
			);
		}
		$coupons = array();
		foreach ( $order->get_items( 'coupon' ) as $coupon ) {
			$coupons[] = array(
				'source_id' => (int) $coupon->get_id(),
				'code'      => method_exists( $coupon, 'get_code' ) ? (string) $coupon->get_code() : (string) $coupon->get_name(),
				'discount'  => method_exists( $coupon, 'get_discount' ) ? Webino_Dashboard_Migrate_Export_Support::money( $coupon->get_discount() ) : '',
			);
		}
		$fees = array();
		foreach ( $order->get_items( 'fee' ) as $fee ) {
			$fees[] = array(
				'source_id' => (int) $fee->get_id(),
				'name'      => (string) $fee->get_name(),
				'total'     => Webino_Dashboard_Migrate_Export_Support::money( $fee->get_total() ),
			);
		}
		$refunds = array();
		foreach ( $order->get_refunds() as $refund ) {
			$refunds[] = array(
				'source_id'  => (int) $refund->get_id(),
				'amount'     => Webino_Dashboard_Migrate_Export_Support::money( $refund->get_amount() ),
				'reason'     => (string) $refund->get_reason(),
				'created_at' => Webino_Dashboard_Migrate_Export_Support::iso_date( $refund->get_date_created() ),
			);
		}
		$billing  = $order->get_address( 'billing' );
		$shipping_address = $order->get_address( 'shipping' );
		return self::shape_item(
			array(
				'source_id'            => (int) $order->get_id(),
				'number'               => (string) $order->get_order_number(),
				'status'               => (string) $order->get_status(),
				'currency'             => (string) $order->get_currency(),
				'created_at'           => Webino_Dashboard_Migrate_Export_Support::iso_date( $order->get_date_created() ),
				'updated_at'           => Webino_Dashboard_Migrate_Export_Support::iso_date( $order->get_date_modified() ),
				'customer_source_id'   => (int) $order->get_customer_id(),
				'billing'              => is_array( $billing ) ? $billing : array(),
				'shipping_address'     => is_array( $shipping_address ) ? $shipping_address : array(),
				'totals'               => array(
					'subtotal' => Webino_Dashboard_Migrate_Export_Support::money( $order->get_subtotal() ),
					'discount' => Webino_Dashboard_Migrate_Export_Support::money( $order->get_discount_total() ),
					'shipping' => Webino_Dashboard_Migrate_Export_Support::money( $order->get_shipping_total() ),
					'tax'      => Webino_Dashboard_Migrate_Export_Support::money( $order->get_total_tax() ),
					'total'    => Webino_Dashboard_Migrate_Export_Support::money( $order->get_total() ),
				),
				'payment_method'       => (string) $order->get_payment_method(),
				'payment_method_title' => (string) $order->get_payment_method_title(),
				'transaction_id'       => (string) $order->get_transaction_id(),
				'customer_note'        => (string) $order->get_customer_note(),
				'line_items'           => $lines,
				'shipping_lines'       => $shipping,
				'coupon_lines'         => $coupons,
				'fee_lines'            => $fees,
				'refunds'              => $refunds,
			)
		);
	}

	/**
	 * @param array<string,mixed> $raw Raw order.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$raw = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		return array(
			'source_id'            => isset( $raw['source_id'] ) ? (int) $raw['source_id'] : 0,
			'number'               => isset( $raw['number'] ) ? (string) $raw['number'] : '',
			'status'               => isset( $raw['status'] ) ? (string) $raw['status'] : '',
			'currency'             => isset( $raw['currency'] ) ? (string) $raw['currency'] : '',
			'created_at'           => isset( $raw['created_at'] ) ? (string) $raw['created_at'] : '',
			'updated_at'           => isset( $raw['updated_at'] ) ? (string) $raw['updated_at'] : '',
			'customer_source_id'   => isset( $raw['customer_source_id'] ) ? (int) $raw['customer_source_id'] : 0,
			'billing'              => isset( $raw['billing'] ) && is_array( $raw['billing'] ) ? $raw['billing'] : array(),
			'shipping_address'     => isset( $raw['shipping_address'] ) && is_array( $raw['shipping_address'] ) ? $raw['shipping_address'] : array(),
			'totals'               => array(
				'subtotal' => isset( $raw['totals']['subtotal'] ) ? (string) $raw['totals']['subtotal'] : '',
				'discount' => isset( $raw['totals']['discount'] ) ? (string) $raw['totals']['discount'] : '',
				'shipping' => isset( $raw['totals']['shipping'] ) ? (string) $raw['totals']['shipping'] : '',
				'tax'      => isset( $raw['totals']['tax'] ) ? (string) $raw['totals']['tax'] : '',
				'total'    => isset( $raw['totals']['total'] ) ? (string) $raw['totals']['total'] : '',
			),
			'payment_method'       => isset( $raw['payment_method'] ) ? (string) $raw['payment_method'] : '',
			'payment_method_title' => isset( $raw['payment_method_title'] ) ? (string) $raw['payment_method_title'] : '',
			'transaction_id'       => isset( $raw['transaction_id'] ) ? (string) $raw['transaction_id'] : '',
			'customer_note'        => isset( $raw['customer_note'] ) ? (string) $raw['customer_note'] : '',
			'line_items'           => isset( $raw['line_items'] ) && is_array( $raw['line_items'] ) ? array_values( $raw['line_items'] ) : array(),
			'shipping_lines'       => isset( $raw['shipping_lines'] ) && is_array( $raw['shipping_lines'] ) ? array_values( $raw['shipping_lines'] ) : array(),
			'coupon_lines'         => isset( $raw['coupon_lines'] ) && is_array( $raw['coupon_lines'] ) ? array_values( $raw['coupon_lines'] ) : array(),
			'fee_lines'            => isset( $raw['fee_lines'] ) && is_array( $raw['fee_lines'] ) ? array_values( $raw['fee_lines'] ) : array(),
			'refunds'              => isset( $raw['refunds'] ) && is_array( $raw['refunds'] ) ? array_values( $raw['refunds'] ) : array(),
		);
	}
}

/**
 * Pages and posts share one mapper.
 */
final class Webino_Dashboard_Migrate_Export_Content {

	/**
	 * @param string $post_type Post type.
	 * @param string $entity    Entity key.
	 * @param string $cursor    Cursor.
	 * @param int    $limit     Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $post_type, $entity, $cursor, $limit ) {
		$ids   = Webino_Dashboard_Migrate_Export_Support::post_ids_after(
			$post_type,
			array( 'publish', 'draft', 'private', 'pending' ),
			(int) $cursor,
			$limit
		);
		$items = array();
		$last  = (int) $cursor;
		foreach ( $ids as $id ) {
			$last = $id;
			$post = get_post( $id );
			if ( ! $post ) {
				continue;
			}
			$featured = Webino_Dashboard_Migrate_Export_Support::image_ref( (int) get_post_thumbnail_id( $id ) );
			$author   = get_userdata( (int) $post->post_author );
			$cats     = array();
			$tags     = array();
			if ( 'post' === $post_type ) {
				$cats = self::term_list( $id, 'category' );
				$tags = self::term_list( $id, 'post_tag' );
			}
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item(
				self::shape_item(
					array(
						'source_id'        => (int) $id,
						'type'             => $post_type,
						'status'           => (string) $post->post_status,
						'slug'             => (string) $post->post_name,
						'title'            => (string) $post->post_title,
						'content'          => (string) $post->post_content,
						'excerpt'          => (string) $post->post_excerpt,
						'parent_source_id' => (int) $post->post_parent,
						'menu_order'       => (int) $post->menu_order,
						'author'           => array(
							'source_id'    => (int) $post->post_author,
							'display_name' => $author ? (string) $author->display_name : '',
						),
						'featured_image'   => $featured,
						'categories'       => $cats,
						'tags'             => $tags,
						'created_at'       => Webino_Dashboard_Migrate_Export_Support::iso_date( $post->post_date_gmt ),
						'updated_at'       => Webino_Dashboard_Migrate_Export_Support::iso_date( $post->post_modified_gmt ),
						'permalink'        => Webino_Dashboard_Migrate_Schema::public_url( (string) get_permalink( $id ) ),
					)
				),
				$entity,
				$id
			);
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $ids ) < $limit,
			'total'       => Webino_Dashboard_Migrate_Export_Support::count_posts( $post_type, array( 'publish', 'draft', 'private', 'pending' ) ),
		);
	}

	/**
	 * @param int    $post_id  Post id.
	 * @param string $taxonomy Taxonomy.
	 * @return list<array<string,mixed>>
	 */
	private static function term_list( $post_id, $taxonomy ) {
		$terms = get_the_terms( $post_id, $taxonomy );
		if ( ! is_array( $terms ) ) {
			return array();
		}
		$out = array();
		foreach ( $terms as $term ) {
			$out[] = array(
				'source_id' => (int) $term->term_id,
				'name'      => (string) $term->name,
				'slug'      => (string) $term->slug,
			);
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $raw Raw content.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$raw      = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		$featured = null;
		if ( isset( $raw['featured_image'] ) && is_array( $raw['featured_image'] ) ) {
			$url = Webino_Dashboard_Migrate_Schema::public_url( isset( $raw['featured_image']['url'] ) ? $raw['featured_image']['url'] : '' );
			if ( '' !== $url ) {
				$featured = array(
					'source_id' => isset( $raw['featured_image']['source_id'] ) ? (int) $raw['featured_image']['source_id'] : 0,
					'url'       => $url,
					'alt'       => isset( $raw['featured_image']['alt'] ) ? (string) $raw['featured_image']['alt'] : '',
				);
			}
		}
		return array(
			'source_id'        => isset( $raw['source_id'] ) ? (int) $raw['source_id'] : 0,
			'type'             => isset( $raw['type'] ) ? (string) $raw['type'] : '',
			'status'           => isset( $raw['status'] ) ? (string) $raw['status'] : '',
			'slug'             => isset( $raw['slug'] ) ? (string) $raw['slug'] : '',
			'title'            => isset( $raw['title'] ) ? (string) $raw['title'] : '',
			'content'          => isset( $raw['content'] ) ? (string) $raw['content'] : '',
			'excerpt'          => isset( $raw['excerpt'] ) ? (string) $raw['excerpt'] : '',
			'parent_source_id' => isset( $raw['parent_source_id'] ) ? (int) $raw['parent_source_id'] : 0,
			'menu_order'       => isset( $raw['menu_order'] ) ? (int) $raw['menu_order'] : 0,
			'author'           => array(
				'source_id'    => isset( $raw['author']['source_id'] ) ? (int) $raw['author']['source_id'] : 0,
				'display_name' => isset( $raw['author']['display_name'] ) ? (string) $raw['author']['display_name'] : '',
			),
			'featured_image'   => $featured,
			'categories'       => isset( $raw['categories'] ) && is_array( $raw['categories'] ) ? array_values( $raw['categories'] ) : array(),
			'tags'             => isset( $raw['tags'] ) && is_array( $raw['tags'] ) ? array_values( $raw['tags'] ) : array(),
			'created_at'       => isset( $raw['created_at'] ) ? (string) $raw['created_at'] : '',
			'updated_at'       => isset( $raw['updated_at'] ) ? (string) $raw['updated_at'] : '',
			'permalink'        => Webino_Dashboard_Migrate_Schema::public_url( isset( $raw['permalink'] ) ? $raw['permalink'] : '' ),
		);
	}
}

/**
 * Pages.
 */
final class Webino_Dashboard_Migrate_Export_Pages {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		return Webino_Dashboard_Migrate_Export_Content::export_batch( 'page', 'pages', $cursor, $limit );
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		return Webino_Dashboard_Migrate_Export_Support::count_posts( 'page', array( 'publish', 'draft', 'private', 'pending' ) );
	}
}

/**
 * Posts.
 */
final class Webino_Dashboard_Migrate_Export_Posts {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		return Webino_Dashboard_Migrate_Export_Content::export_batch( 'post', 'posts', $cursor, $limit );
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		return Webino_Dashboard_Migrate_Export_Support::count_posts( 'post', array( 'publish', 'draft', 'private', 'pending' ) );
	}
}

/**
 * Navigation menus and items.
 */
final class Webino_Dashboard_Migrate_Export_Menus {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		if ( ! function_exists( 'wp_get_nav_menu_items' ) ) {
			return array(
				'items'       => array(),
				'next_cursor' => (string) $cursor,
				'done'        => true,
				'total'       => 0,
				'warning'     => 'فهرست‌های وردپرس در دسترس نیستند.',
			);
		}
		$ids   = self::menu_ids_after( (int) $cursor, $limit );
		$items = array();
		$last  = (int) $cursor;
		$locations = get_nav_menu_locations();
		$locations = is_array( $locations ) ? $locations : array();
		foreach ( $ids as $id ) {
			$last = $id;
			$term = get_term( $id, 'nav_menu' );
			if ( ! $term || is_wp_error( $term ) ) {
				continue;
			}
			$assigned = array();
			foreach ( $locations as $location => $menu_id ) {
				if ( (int) $menu_id === (int) $id ) {
					$assigned[] = (string) $location;
				}
			}
			$menu_items = wp_get_nav_menu_items( $id );
			$rows       = array();
			if ( is_array( $menu_items ) ) {
				foreach ( $menu_items as $menu_item ) {
					$rows[] = array(
						'source_id'        => (int) $menu_item->ID,
						'parent_source_id' => (int) $menu_item->menu_item_parent,
						'title'            => (string) $menu_item->title,
						'type'             => (string) $menu_item->type,
						'object'           => (string) $menu_item->object,
						'object_source_id' => (int) $menu_item->object_id,
						'url'              => Webino_Dashboard_Migrate_Schema::public_url( (string) $menu_item->url ),
						'target'           => (string) $menu_item->target,
						'classes'          => array_values( array_filter( array_map( 'strval', (array) $menu_item->classes ) ) ),
						'menu_order'       => (int) $menu_item->menu_order,
						'attr_title'       => (string) $menu_item->attr_title,
						'description'      => (string) $menu_item->description,
					);
				}
			}
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item(
				self::shape_item(
					array(
						'source_id' => (int) $term->term_id,
						'name'      => (string) $term->name,
						'slug'      => (string) $term->slug,
						'locations' => $assigned,
						'items'     => $rows,
					)
				),
				'menus',
				(int) $id
			);
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $ids ) < $limit,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		if ( ! function_exists( 'wp_count_terms' ) ) {
			return 0;
		}
		$n = wp_count_terms(
			array(
				'taxonomy'   => 'nav_menu',
				'hide_empty' => false,
			)
		);
		return is_wp_error( $n ) ? 0 : (int) $n;
	}

	/**
	 * @param int $cursor Last term id.
	 * @param int $limit  Limit.
	 * @return list<int>
	 */
	private static function menu_ids_after( $cursor, $limit ) {
		global $wpdb;
		$sql = "SELECT t.term_id FROM {$wpdb->terms} t INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = t.term_id WHERE tt.taxonomy = 'nav_menu' AND t.term_id > %d ORDER BY t.term_id ASC LIMIT %d";
		$ids = $wpdb->get_col( $wpdb->prepare( $sql, (int) $cursor, (int) $limit ) );
		return array_map( 'intval', is_array( $ids ) ? $ids : array() );
	}

	/**
	 * @param array<string,mixed> $raw Raw menu.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$raw   = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		$items = array();
		if ( isset( $raw['items'] ) && is_array( $raw['items'] ) ) {
			foreach ( $raw['items'] as $item ) {
				if ( ! is_array( $item ) ) {
					continue;
				}
				$items[] = array(
					'source_id'        => isset( $item['source_id'] ) ? (int) $item['source_id'] : 0,
					'parent_source_id' => isset( $item['parent_source_id'] ) ? (int) $item['parent_source_id'] : 0,
					'title'            => isset( $item['title'] ) ? (string) $item['title'] : '',
					'type'             => isset( $item['type'] ) ? (string) $item['type'] : '',
					'object'           => isset( $item['object'] ) ? (string) $item['object'] : '',
					'object_source_id' => isset( $item['object_source_id'] ) ? (int) $item['object_source_id'] : 0,
					'url'              => Webino_Dashboard_Migrate_Schema::public_url( isset( $item['url'] ) ? $item['url'] : '' ),
					'target'           => isset( $item['target'] ) ? (string) $item['target'] : '',
					'classes'          => isset( $item['classes'] ) && is_array( $item['classes'] ) ? array_values( array_map( 'strval', $item['classes'] ) ) : array(),
					'menu_order'       => isset( $item['menu_order'] ) ? (int) $item['menu_order'] : 0,
					'attr_title'       => isset( $item['attr_title'] ) ? (string) $item['attr_title'] : '',
					'description'      => isset( $item['description'] ) ? (string) $item['description'] : '',
				);
			}
		}
		return array(
			'source_id' => isset( $raw['source_id'] ) ? (int) $raw['source_id'] : 0,
			'name'      => isset( $raw['name'] ) ? (string) $raw['name'] : '',
			'slug'      => isset( $raw['slug'] ) ? (string) $raw['slug'] : '',
			'locations' => isset( $raw['locations'] ) && is_array( $raw['locations'] ) ? array_values( array_map( 'strval', $raw['locations'] ) ) : array(),
			'items'     => $items,
		);
	}
}
