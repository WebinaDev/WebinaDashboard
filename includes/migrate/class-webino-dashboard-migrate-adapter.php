<?php
/**
 * Maps plugin export rows onto the WebinoDashboard ingest contract.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Converts source_id batches into external_id ingest payloads.
 *
 * WebinoDashboard (docs/wordpress-import.md) expects:
 * POST /api/v1/import/wordpress/ingest { source_url, resource, items[] }
 * then POST /api/v1/import/wordpress/jobs/{id}/run
 */
final class Webino_Dashboard_Migrate_Adapter {

	/**
	 * Split one exporter batch into one or more ingest resource payloads.
	 *
	 * @param string               $entity Exporter entity key.
	 * @param list<array<string,mixed>> $items Exporter items.
	 * @return list<array{resource:string,items:list<array<string,mixed>>}>
	 */
	public static function for_ingest( $entity, array $items ) {
		$entity = (string) $entity;
		if ( 'categories' === $entity ) {
			$categories = array();
			$tags       = array();
			foreach ( $items as $item ) {
				if ( ! is_array( $item ) ) {
					continue;
				}
				$taxonomy = isset( $item['taxonomy'] ) ? (string) $item['taxonomy'] : '';
				$row      = self::category_item( $item );
				if ( in_array( $taxonomy, array( 'product_tag', 'post_tag' ), true ) ) {
					$tags[] = $row;
				} else {
					$categories[] = $row;
				}
			}
			$out = array();
			if ( $categories ) {
				$out[] = array(
					'resource' => 'categories',
					'items'    => $categories,
				);
			}
			if ( $tags ) {
				$out[] = array(
					'resource' => 'tags',
					'items'    => $tags,
				);
			}
			return $out;
		}

		$map = array(
			'media'     => 'media',
			'products'  => 'products',
			'customers' => 'customers',
			'orders'    => 'orders',
			'pages'     => 'pages',
			'posts'     => 'posts',
			'menus'     => 'menus',
		);
		if ( ! isset( $map[ $entity ] ) ) {
			return array();
		}
		$resource = $map[ $entity ];
		$mapped   = array();
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$row = self::map_item( $entity, $item );
			if ( null !== $row ) {
				$mapped[] = $row;
			}
		}
		if ( ! $mapped ) {
			return array();
		}
		return array(
			array(
				'resource' => $resource,
				'items'    => $mapped,
			),
		);
	}

	/**
	 * @param string              $entity Entity.
	 * @param array<string,mixed> $item   Item.
	 * @return array<string,mixed>|null
	 */
	public static function map_item( $entity, array $item ) {
		switch ( (string) $entity ) {
			case 'media':
				return self::media_item( $item );
			case 'products':
				return self::product_item( $item );
			case 'customers':
				return self::customer_item( $item );
			case 'orders':
				return self::order_item( $item );
			case 'pages':
			case 'posts':
				return self::content_item( $item );
			case 'menus':
				return self::menu_item( $item );
			case 'categories':
				return self::category_item( $item );
			default:
				return null;
		}
	}

	/**
	 * @param array<string,mixed> $item Item.
	 * @return string
	 */
	public static function external_id( array $item ) {
		if ( isset( $item['external_id'] ) && '' !== trim( (string) $item['external_id'] ) ) {
			return (string) $item['external_id'];
		}
		if ( isset( $item['source_id'] ) && '' !== (string) $item['source_id'] && '0' !== (string) $item['source_id'] ) {
			return (string) $item['source_id'];
		}
		if ( isset( $item['id'] ) && '' !== (string) $item['id'] ) {
			return (string) $item['id'];
		}
		return '';
	}

	/**
	 * @param array<string,mixed> $item Item.
	 * @return array<string,mixed>
	 */
	private static function category_item( array $item ) {
		$external = self::external_id( $item );
		$parent   = '';
		if ( isset( $item['parent_external_id'] ) && '' !== trim( (string) $item['parent_external_id'] ) ) {
			$parent = (string) $item['parent_external_id'];
		} elseif ( ! empty( $item['parent_source_id'] ) ) {
			$parent = (string) (int) $item['parent_source_id'];
		}
		$out = array(
			'external_id' => $external,
			'name'        => isset( $item['name'] ) ? (string) $item['name'] : '',
			'slug'        => isset( $item['slug'] ) ? (string) $item['slug'] : '',
			'description' => isset( $item['description'] ) ? (string) $item['description'] : '',
		);
		if ( '' !== $parent && '0' !== $parent ) {
			$out['parent_external_id'] = $parent;
		}
		if ( isset( $item['taxonomy'] ) ) {
			$out['taxonomy'] = (string) $item['taxonomy'];
		}
		if ( isset( $item['image'] ) && is_array( $item['image'] ) ) {
			$image = self::image_ref( $item['image'] );
			if ( $image ) {
				$out['image'] = $image;
			}
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $item Item.
	 * @return array<string,mixed>|null
	 */
	private static function media_item( array $item ) {
		$external = self::external_id( $item );
		if ( '' === $external ) {
			return null;
		}
		$out = array(
			'external_id' => $external,
			'title'       => isset( $item['title'] ) ? (string) $item['title'] : '',
			'alt'         => isset( $item['alt'] ) ? (string) $item['alt'] : '',
			'caption'     => isset( $item['caption'] ) ? (string) $item['caption'] : '',
			'description' => isset( $item['description'] ) ? (string) $item['description'] : '',
			'mime_type'   => isset( $item['mime_type'] ) ? (string) $item['mime_type'] : '',
			'url'         => isset( $item['url'] ) ? (string) $item['url'] : '',
			'filename'    => isset( $item['file'] ) ? (string) $item['file'] : ( isset( $item['filename'] ) ? (string) $item['filename'] : '' ),
		);
		if ( ! empty( $item['created_at'] ) ) {
			$out['created_at'] = (string) $item['created_at'];
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $item Item.
	 * @return array<string,mixed>|null
	 */
	private static function product_item( array $item ) {
		$external = self::external_id( $item );
		if ( '' === $external ) {
			return null;
		}
		$category_ids = array();
		if ( isset( $item['category_external_ids'] ) && is_array( $item['category_external_ids'] ) ) {
			foreach ( $item['category_external_ids'] as $id ) {
				$id = trim( (string) $id );
				if ( '' !== $id ) {
					$category_ids[] = $id;
				}
			}
		} elseif ( isset( $item['categories'] ) && is_array( $item['categories'] ) ) {
			foreach ( $item['categories'] as $cat ) {
				if ( is_array( $cat ) ) {
					$id = self::external_id( $cat );
					if ( '' !== $id ) {
						$category_ids[] = $id;
					}
				}
			}
		}
		$tag_ids = array();
		if ( isset( $item['tag_external_ids'] ) && is_array( $item['tag_external_ids'] ) ) {
			foreach ( $item['tag_external_ids'] as $id ) {
				$id = trim( (string) $id );
				if ( '' !== $id ) {
					$tag_ids[] = $id;
				}
			}
		} elseif ( isset( $item['tags'] ) && is_array( $item['tags'] ) ) {
			foreach ( $item['tags'] as $tag ) {
				if ( is_array( $tag ) ) {
					$id = self::external_id( $tag );
					if ( '' !== $id ) {
						$tag_ids[] = $id;
					}
				}
			}
		}
		$images = array();
		if ( isset( $item['images'] ) && is_array( $item['images'] ) ) {
			foreach ( $item['images'] as $image ) {
				if ( ! is_array( $image ) ) {
					continue;
				}
				$ref = self::image_ref( $image );
				if ( $ref ) {
					if ( isset( $image['position'] ) ) {
						$ref['position'] = (int) $image['position'];
					}
					$images[] = $ref;
				}
			}
		}
		$variations = array();
		if ( isset( $item['variations'] ) && is_array( $item['variations'] ) ) {
			foreach ( $item['variations'] as $variation ) {
				if ( ! is_array( $variation ) ) {
					continue;
				}
				$vid = self::external_id( $variation );
				$row = $variation;
				if ( '' !== $vid ) {
					$row['external_id'] = $vid;
				}
				unset( $row['source_id'] );
				if ( isset( $row['image'] ) && is_array( $row['image'] ) ) {
					$img = self::image_ref( $row['image'] );
					if ( $img ) {
						$row['image'] = $img;
					} else {
						unset( $row['image'] );
					}
				}
				$variations[] = $row;
			}
		}
		$out = array(
			'external_id'          => $external,
			'source_guid'          => isset( $item['permalink'] ) ? (string) $item['permalink'] : ( isset( $item['source_guid'] ) ? (string) $item['source_guid'] : '' ),
			'type'                 => isset( $item['type'] ) ? (string) $item['type'] : 'simple',
			'status'               => isset( $item['status'] ) ? (string) $item['status'] : 'publish',
			'slug'                 => isset( $item['slug'] ) ? (string) $item['slug'] : '',
			'name'                 => isset( $item['name'] ) ? (string) $item['name'] : '',
			'description'          => isset( $item['description'] ) ? (string) $item['description'] : '',
			'short_description'    => isset( $item['short_description'] ) ? (string) $item['short_description'] : '',
			'sku'                  => isset( $item['sku'] ) ? (string) $item['sku'] : '',
			'regular_price'        => isset( $item['regular_price'] ) ? (string) $item['regular_price'] : '',
			'sale_price'           => isset( $item['sale_price'] ) ? (string) $item['sale_price'] : '',
			'currency'             => isset( $item['currency'] ) ? (string) $item['currency'] : '',
			'manage_stock'         => ! empty( $item['manage_stock'] ),
			'stock_quantity'       => array_key_exists( 'stock_quantity', $item ) ? $item['stock_quantity'] : null,
			'stock_status'         => isset( $item['stock_status'] ) ? (string) $item['stock_status'] : 'instock',
			'backorders'           => isset( $item['backorders'] ) ? (string) $item['backorders'] : 'no',
			'weight'               => isset( $item['weight'] ) ? (string) $item['weight'] : '',
			'catalog_visibility'   => isset( $item['catalog_visibility'] ) ? (string) $item['catalog_visibility'] : 'visible',
			'featured'             => ! empty( $item['featured'] ),
			'category_external_ids'=> array_values( array_unique( $category_ids ) ),
			'tag_external_ids'     => array_values( array_unique( $tag_ids ) ),
			'attributes'           => isset( $item['attributes'] ) && is_array( $item['attributes'] ) ? array_values( $item['attributes'] ) : array(),
			'images'               => $images,
			'variations'           => $variations,
		);
		if ( isset( $item['dimensions'] ) && is_array( $item['dimensions'] ) ) {
			$out['length'] = isset( $item['dimensions']['length'] ) ? $item['dimensions']['length'] : null;
			$out['width']  = isset( $item['dimensions']['width'] ) ? $item['dimensions']['width'] : null;
			$out['height'] = isset( $item['dimensions']['height'] ) ? $item['dimensions']['height'] : null;
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $item Item.
	 * @return array<string,mixed>|null
	 */
	private static function customer_item( array $item ) {
		$external = self::external_id( $item );
		if ( '' === $external ) {
			return null;
		}
		$out = $item;
		$out['external_id'] = $external;
		unset( $out['source_id'] );
		if ( empty( $out['source_guid'] ) && ! empty( $item['source_guid'] ) ) {
			$out['source_guid'] = (string) $item['source_guid'];
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $item Item.
	 * @return array<string,mixed>|null
	 */
	private static function order_item( array $item ) {
		$external = self::external_id( $item );
		if ( '' === $external ) {
			return null;
		}
		$totals = isset( $item['totals'] ) && is_array( $item['totals'] ) ? $item['totals'] : array();
		$billing = isset( $item['billing'] ) && is_array( $item['billing'] ) ? $item['billing'] : array();
		$customer_external = '';
		if ( isset( $item['customer_external_id'] ) ) {
			$customer_external = (string) $item['customer_external_id'];
		} elseif ( ! empty( $item['customer_source_id'] ) ) {
			$customer_external = (string) (int) $item['customer_source_id'];
		}
		$lines = array();
		if ( isset( $item['line_items'] ) && is_array( $item['line_items'] ) ) {
			foreach ( $item['line_items'] as $line ) {
				if ( ! is_array( $line ) ) {
					continue;
				}
				$row = array(
					'external_id' => self::external_id( $line ),
					'name'        => isset( $line['name'] ) ? (string) $line['name'] : '',
					'sku'         => isset( $line['sku'] ) ? (string) $line['sku'] : '',
					'quantity'    => isset( $line['quantity'] ) ? (int) $line['quantity'] : 1,
					'total'       => isset( $line['total'] ) ? (string) $line['total'] : '',
					'subtotal'    => isset( $line['subtotal'] ) ? (string) $line['subtotal'] : '',
					'price'       => isset( $line['price'] ) ? (string) $line['price'] : '',
				);
				if ( isset( $line['product_external_id'] ) ) {
					$row['product_external_id'] = (string) $line['product_external_id'];
				} elseif ( ! empty( $line['product_source_id'] ) ) {
					$row['product_external_id'] = (string) (int) $line['product_source_id'];
				}
				if ( isset( $line['variation_external_id'] ) ) {
					$row['variation_external_id'] = (string) $line['variation_external_id'];
				} elseif ( ! empty( $line['variation_source_id'] ) ) {
					$row['variation_external_id'] = (string) (int) $line['variation_source_id'];
				}
				$lines[] = $row;
			}
		}
		$out = array(
			'external_id'          => $external,
			'number'               => isset( $item['number'] ) ? (string) $item['number'] : '',
			'status'               => isset( $item['status'] ) ? (string) $item['status'] : 'processing',
			'currency'             => isset( $item['currency'] ) ? (string) $item['currency'] : '',
			'created_at'           => isset( $item['created_at'] ) ? (string) $item['created_at'] : '',
			'customer_external_id' => $customer_external,
			'customer_email'       => isset( $item['customer_email'] ) ? (string) $item['customer_email'] : ( isset( $billing['email'] ) ? (string) $billing['email'] : '' ),
			'customer_phone'       => isset( $item['customer_phone'] ) ? (string) $item['customer_phone'] : ( isset( $billing['phone'] ) ? (string) $billing['phone'] : '' ),
			'customer_note'        => isset( $item['customer_note'] ) ? (string) $item['customer_note'] : '',
			'billing'              => $billing,
			'shipping_address'     => isset( $item['shipping_address'] ) ? $item['shipping_address'] : ( isset( $item['shipping'] ) ? $item['shipping'] : array() ),
			'total'                => isset( $item['total'] ) ? (string) $item['total'] : ( isset( $totals['total'] ) ? (string) $totals['total'] : '' ),
			'subtotal'             => isset( $item['subtotal'] ) ? (string) $item['subtotal'] : ( isset( $totals['subtotal'] ) ? (string) $totals['subtotal'] : '' ),
			'discount'             => isset( $item['discount'] ) ? (string) $item['discount'] : ( isset( $totals['discount'] ) ? (string) $totals['discount'] : '' ),
			'shipping'             => isset( $item['shipping'] ) && ! is_array( $item['shipping'] ) ? (string) $item['shipping'] : ( isset( $totals['shipping'] ) ? (string) $totals['shipping'] : '' ),
			'tax'                  => isset( $item['tax'] ) ? (string) $item['tax'] : ( isset( $totals['tax'] ) ? (string) $totals['tax'] : '' ),
			'payment_method'       => isset( $item['payment_method'] ) ? (string) $item['payment_method'] : '',
			'transaction_id'       => isset( $item['transaction_id'] ) ? (string) $item['transaction_id'] : '',
			'line_items'           => $lines,
		);
		return $out;
	}

	/**
	 * @param array<string,mixed> $item Item.
	 * @return array<string,mixed>|null
	 */
	private static function content_item( array $item ) {
		$external = self::external_id( $item );
		if ( '' === $external ) {
			return null;
		}
		$out = array(
			'external_id' => $external,
			'source_guid' => isset( $item['permalink'] ) ? (string) $item['permalink'] : ( isset( $item['source_guid'] ) ? (string) $item['source_guid'] : '' ),
			'status'      => isset( $item['status'] ) ? (string) $item['status'] : 'draft',
			'slug'        => isset( $item['slug'] ) ? (string) $item['slug'] : '',
			'title'       => isset( $item['title'] ) ? (string) $item['title'] : '',
			'name'        => isset( $item['title'] ) ? (string) $item['title'] : ( isset( $item['name'] ) ? (string) $item['name'] : '' ),
			'content'     => isset( $item['content'] ) ? (string) $item['content'] : '',
			'excerpt'     => isset( $item['excerpt'] ) ? (string) $item['excerpt'] : '',
			'created_at'  => isset( $item['created_at'] ) ? (string) $item['created_at'] : '',
			'published_at'=> isset( $item['created_at'] ) ? (string) $item['created_at'] : '',
		);
		if ( isset( $item['featured_image'] ) && is_array( $item['featured_image'] ) ) {
			$img = self::image_ref( $item['featured_image'] );
			if ( $img ) {
				$out['images'] = array( $img );
			}
		}
		if ( isset( $item['categories'] ) && is_array( $item['categories'] ) ) {
			$cats = array();
			foreach ( $item['categories'] as $cat ) {
				if ( ! is_array( $cat ) ) {
					continue;
				}
				$row = $cat;
				$id  = self::external_id( $cat );
				if ( '' !== $id ) {
					$row['external_id'] = $id;
				}
				unset( $row['source_id'] );
				$cats[] = $row;
			}
			$out['categories'] = $cats;
		}
		if ( isset( $item['tags'] ) && is_array( $item['tags'] ) ) {
			$tags = array();
			foreach ( $item['tags'] as $tag ) {
				if ( ! is_array( $tag ) ) {
					continue;
				}
				$row = $tag;
				$id  = self::external_id( $tag );
				if ( '' !== $id ) {
					$row['external_id'] = $id;
				}
				unset( $row['source_id'] );
				$tags[] = $row;
			}
			$out['tags'] = $tags;
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $item Item.
	 * @return array<string,mixed>|null
	 */
	private static function menu_item( array $item ) {
		$external = self::external_id( $item );
		if ( '' === $external ) {
			return null;
		}
		$location = 'header';
		if ( isset( $item['location'] ) && '' !== trim( (string) $item['location'] ) ) {
			$location = (string) $item['location'];
		} elseif ( isset( $item['locations'] ) && is_array( $item['locations'] ) && $item['locations'] ) {
			$location = (string) $item['locations'][0];
		}
		$items = array();
		if ( isset( $item['items'] ) && is_array( $item['items'] ) ) {
			foreach ( $item['items'] as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$items[] = array(
					'title' => isset( $row['title'] ) ? (string) $row['title'] : '',
					'label' => isset( $row['title'] ) ? (string) $row['title'] : '',
					'url'   => isset( $row['url'] ) ? (string) $row['url'] : '',
				);
			}
		}
		return array(
			'external_id' => $external,
			'name'        => isset( $item['name'] ) ? (string) $item['name'] : '',
			'slug'        => isset( $item['slug'] ) ? (string) $item['slug'] : '',
			'location'    => $location,
			'items'       => $items,
		);
	}

	/**
	 * @param array<string,mixed> $image Image ref.
	 * @return array<string,mixed>|null
	 */
	private static function image_ref( array $image ) {
		$url = isset( $image['url'] ) ? (string) $image['url'] : '';
		if ( '' === $url && empty( $image['data_base64'] ) ) {
			return null;
		}
		$out = array(
			'url' => $url,
			'alt' => isset( $image['alt'] ) ? (string) $image['alt'] : '',
		);
		$id = self::external_id( $image );
		if ( '' !== $id ) {
			$out['external_id'] = $id;
		}
		if ( ! empty( $image['data_base64'] ) ) {
			$out['data_base64'] = (string) $image['data_base64'];
		}
		if ( ! empty( $image['filename'] ) ) {
			$out['filename'] = (string) $image['filename'];
		}
		return $out;
	}
}
