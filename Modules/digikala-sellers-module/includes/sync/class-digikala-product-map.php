<?php
/**
 * Digikala DKP / variant mapping + dual-write to WNC_Mapper.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Product_Map {

	/**
	 * @param string $raw DKP or numeric id.
	 * @return string
	 */
	public static function parse_product_id( $raw ) {
		$raw = strtoupper( trim( (string) $raw ) );
		$raw = preg_replace( '/\s+/', '', $raw );
		if ( preg_match( '/DKP-?(\d+)/', $raw, $m ) ) {
			return $m[1];
		}
		if ( preg_match( '/^(\d+)$/', $raw, $m ) ) {
			return $m[1];
		}
		return '';
	}

	/**
	 * @param int    $wc_product_id Product.
	 * @param int    $wc_variation_id Variation.
	 * @param string $dk_product_id DK product.
	 * @param string $dk_variant_id DK variant.
	 * @return void
	 */
	public static function upsert( $wc_product_id, $wc_variation_id, $dk_product_id, $dk_variant_id ) {
		global $wpdb;
		$wc_product_id   = (int) $wc_product_id;
		$wc_variation_id = (int) $wc_variation_id;
		$dk_product_id   = sanitize_text_field( (string) $dk_product_id );
		$dk_variant_id   = sanitize_text_field( (string) $dk_variant_id );
		if ( $wc_product_id <= 0 ) {
			return;
		}
		$table = $wpdb->prefix . 'webino_dk_product_map';
		$now   = gmdate( 'Y-m-d H:i:s' );
		$id    = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT id FROM {$table} WHERE wc_product_id=%d AND wc_variation_id=%d LIMIT 1",
				$wc_product_id,
				$wc_variation_id
			)
		);
		$data  = array(
			'dk_product_id' => $dk_product_id,
			'dk_variant_id' => $dk_variant_id,
			'last_sync_at'  => $now,
		);
		if ( $id ) {
			$wpdb->update( $table, $data, array( 'id' => (int) $id ) );
		} else {
			$wpdb->insert(
				$table,
				array_merge(
					$data,
					array(
						'wc_product_id'   => $wc_product_id,
						'wc_variation_id' => $wc_variation_id,
					)
				)
			);
		}
		if ( class_exists( 'WNC_Mapper' ) ) {
			WNC_Mapper::upsert(
				array(
					'wc_product_id'     => $wc_product_id,
					'wc_variation_id'   => $wc_variation_id,
					'platform'          => 'digikala',
					'remote_product_id' => $dk_product_id,
					'remote_variant_id' => $dk_variant_id,
					'sync_enabled'      => 1,
					'remote_url'        => $dk_product_id ? ( 'https://www.digikala.com/product/dkp-' . $dk_product_id . '/' ) : '',
				)
			);
		}
	}

	/**
	 * @param int $wc_product_id Product.
	 * @param int $wc_variation_id Variation.
	 * @return array{dk_product_id:string,dk_variant_id:string}
	 */
	public static function get( $wc_product_id, $wc_variation_id = 0 ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dk_product_map';
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT dk_product_id, dk_variant_id FROM {$table} WHERE wc_product_id=%d AND wc_variation_id=%d LIMIT 1",
				(int) $wc_product_id,
				(int) $wc_variation_id
			),
			ARRAY_A
		);
		if ( ! is_array( $row ) && class_exists( 'WNC_Mapper' ) ) {
			$wnc = WNC_Mapper::get( (int) $wc_product_id, (int) $wc_variation_id, 'digikala' );
			if ( is_array( $wnc ) ) {
				return array(
					'dk_product_id' => (string) ( $wnc['remote_product_id'] ?? '' ),
					'dk_variant_id' => (string) ( $wnc['remote_variant_id'] ?? '' ),
				);
			}
		}
		return array(
			'dk_product_id' => (string) ( $row['dk_product_id'] ?? '' ),
			'dk_variant_id' => (string) ( $row['dk_variant_id'] ?? '' ),
		);
	}

	/**
	 * Search Digikala variants for a DKP / product id.
	 *
	 * @param string $dk_product_id Product id.
	 * @return array<int,array<string,mixed>>|\WP_Error
	 */
	public static function search_variants( $dk_product_id ) {
		$dk_product_id = self::parse_product_id( $dk_product_id );
		if ( '' === $dk_product_id ) {
			return new WP_Error( 'dk_dkp', __( 'Invalid DKP code.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$res = Digikala_Client::request(
			'GET',
			'open-api/v1/variants',
			null,
			array(
				'search[search_term]' => $dk_product_id,
				'size'                => 50,
				'page'                => 1,
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$items = (array) ( $res['data']['items'] ?? array() );
		$out   = array();
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$pid = (string) ( $item['product_id'] ?? $item['product']['id'] ?? '' );
			if ( $pid !== '' && $pid !== $dk_product_id && (string) ( $item['id'] ?? '' ) !== $dk_product_id ) {
				// Keep if search matched title; still include.
			}
			$out[] = array(
				'product_id' => $pid !== '' ? $pid : $dk_product_id,
				'variant_id' => (string) ( $item['id'] ?? $item['product_variant_id'] ?? '' ),
				'title'      => (string) ( $item['product_title'] ?? $item['title'] ?? '' ),
				'price'      => (int) ( $item['selling_price'] ?? 0 ),
				'stock'      => (int) ( $item['seller_stock'] ?? $item['selling_stock'] ?? 0 ),
			);
		}
		return self::enrich_variants_with_public_attrs( $dk_product_id, $out );
	}

	/**
	 * Fetch Digikala public product API and attach color/size titles to variants.
	 *
	 * @param string                         $dk_product_id Product id.
	 * @param array<int,array<string,mixed>> $variants      Seller variants.
	 * @return array<int,array<string,mixed>>
	 */
	public static function enrich_variants_with_public_attrs( $dk_product_id, array $variants ) {
		$dk_product_id = self::parse_product_id( $dk_product_id );
		if ( '' === $dk_product_id || array() === $variants ) {
			return $variants;
		}
		$by_id = self::public_variant_attrs_map( $dk_product_id );
		if ( array() === $by_id ) {
			return $variants;
		}
		foreach ( $variants as $i => $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$vid = (string) ( $row['variant_id'] ?? '' );
			if ( '' === $vid || empty( $by_id[ $vid ] ) || ! is_array( $by_id[ $vid ] ) ) {
				continue;
			}
			$meta = $by_id[ $vid ];
			if ( ! empty( $meta['color'] ) ) {
				$variants[ $i ]['color'] = (string) $meta['color'];
			}
			if ( ! empty( $meta['size'] ) ) {
				$variants[ $i ]['size'] = (string) $meta['size'];
			}
			$parts = array_filter(
				array(
					isset( $meta['color'] ) ? (string) $meta['color'] : '',
					isset( $meta['size'] ) ? (string) $meta['size'] : '',
				)
			);
			if ( $parts ) {
				$variants[ $i ]['label'] = implode( ' · ', $parts );
			}
			if ( empty( $variants[ $i ]['title'] ) && ! empty( $meta['title'] ) ) {
				$variants[ $i ]['title'] = (string) $meta['title'];
			}
		}
		return $variants;
	}

	/**
	 * Map of Digikala variant_id => color/size/title from public product API (cached).
	 *
	 * @param string $dk_product_id Product id.
	 * @return array<string,array{color?:string,size?:string,title?:string}>
	 */
	public static function public_variant_attrs_map( $dk_product_id ) {
		$dk_product_id = self::parse_product_id( $dk_product_id );
		if ( '' === $dk_product_id ) {
			return array();
		}
		$cache_key = 'wd_dk_pub_attrs_' . $dk_product_id;
		$cached    = get_transient( $cache_key );
		if ( is_array( $cached ) ) {
			return $cached;
		}
		$url  = 'https://api.digikala.com/v2/product/' . rawurlencode( $dk_product_id ) . '/';
		$res  = wp_remote_get(
			$url,
			array(
				'timeout' => 12,
				'headers' => array(
					'Accept'     => 'application/json',
					'User-Agent' => 'WebinoDashboard/1.0',
				),
			)
		);
		$out = array();
		if ( ! is_wp_error( $res ) && 200 === (int) wp_remote_retrieve_response_code( $res ) ) {
			$body = json_decode( (string) wp_remote_retrieve_body( $res ), true );
			$product = is_array( $body ) && isset( $body['data']['product'] ) && is_array( $body['data']['product'] )
				? $body['data']['product']
				: array();
			$variants = isset( $product['variants'] ) && is_array( $product['variants'] ) ? $product['variants'] : array();
			foreach ( $variants as $v ) {
				if ( ! is_array( $v ) || empty( $v['id'] ) ) {
					continue;
				}
				$vid = (string) $v['id'];
				$row = array();
				if ( ! empty( $v['color']['title'] ) ) {
					$row['color'] = (string) $v['color']['title'];
				}
				if ( ! empty( $v['size']['title'] ) ) {
					$row['size'] = (string) $v['size']['title'];
				}
				if ( ! empty( $v['title'] ) ) {
					$row['title'] = (string) $v['title'];
				} elseif ( ! empty( $product['title_fa'] ) ) {
					$row['title'] = (string) $product['title_fa'];
				}
				$out[ $vid ] = $row;
			}
		}
		set_transient( $cache_key, $out, 15 * MINUTE_IN_SECONDS );
		return $out;
	}

	/**
	 * Labels for mapped Digikala variants on a Woo product (for orphan card identity).
	 *
	 * @param int $wc_product_id Parent product.
	 * @return array<string,array{variant_id:string,product_id:string,title:string,color:string,size:string,label:string,price:int,stock:int}>
	 */
	public static function labels_for_product_maps( $wc_product_id ) {
		$maps           = self::maps_for_product( (int) $wc_product_id );
		$pub_by_product = array();
		$out            = array();
		foreach ( $maps as $m ) {
			if ( ! is_array( $m ) ) {
				continue;
			}
			$pid = (string) ( $m['dk_product_id'] ?? '' );
			$vid = (string) ( $m['dk_variant_id'] ?? '' );
			if ( '' === $pid || '' === $vid ) {
				continue;
			}
			if ( ! isset( $pub_by_product[ $pid ] ) ) {
				$pub_by_product[ $pid ] = self::public_variant_attrs_map( $pid );
			}
			$meta  = isset( $pub_by_product[ $pid ][ $vid ] ) && is_array( $pub_by_product[ $pid ][ $vid ] )
				? $pub_by_product[ $pid ][ $vid ]
				: array();
			$parts = array_filter(
				array(
					isset( $meta['color'] ) ? (string) $meta['color'] : '',
					isset( $meta['size'] ) ? (string) $meta['size'] : '',
				)
			);
			$label = $parts ? implode( ' · ', $parts ) : '';
			$title = isset( $meta['title'] ) ? (string) $meta['title'] : '';
			$out[ $vid ] = array(
				'variant_id' => $vid,
				'product_id' => $pid,
				'title'      => $title,
				'color'      => isset( $meta['color'] ) ? (string) $meta['color'] : '',
				'size'       => isset( $meta['size'] ) ? (string) $meta['size'] : '',
				'label'      => $label ? $label : $title,
				'price'      => 0,
				'stock'      => 0,
			);
		}
		return $out;
	}

	/**
	 * Resolve DKP onto a Woo product (auto-pick variant when unique).
	 *
	 * @param int    $wc_product_id Product.
	 * @param int    $wc_variation_id Variation.
	 * @param string $dkp DKP.
	 * @param string $variant_id Optional explicit variant.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function resolve_and_map( $wc_product_id, $wc_variation_id, $dkp, $variant_id = '' ) {
		$product_id = self::parse_product_id( $dkp );
		if ( '' === $product_id ) {
			return new WP_Error( 'dk_dkp', __( 'Invalid DKP code.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$variants = self::search_variants( $product_id );
		if ( is_wp_error( $variants ) ) {
			return $variants;
		}
		$chosen = '';
		$variant_id = sanitize_text_field( (string) $variant_id );
		if ( '' !== $variant_id ) {
			$chosen = $variant_id;
		} elseif ( 1 === count( $variants ) ) {
			$chosen = (string) ( $variants[0]['variant_id'] ?? '' );
		}
		self::upsert( (int) $wc_product_id, (int) $wc_variation_id, $product_id, $chosen );
		return array(
			'dk_product_id' => $product_id,
			'dk_variant_id' => $chosen,
			'variants'      => $variants,
			'needs_variant' => '' === $chosen && count( $variants ) > 1,
		);
	}

	/**
	 * Push WFCP Digikala price + Woo stock for a mapped product/variation.
	 *
	 * @param int $wc_product_id Product or parent.
	 * @param int $wc_variation_id Variation id.
	 * @return true|\WP_Error
	 */
	public static function sync_price_stock( $wc_product_id, $wc_variation_id = 0 ) {
		$map = self::get( (int) $wc_product_id, (int) $wc_variation_id );
		if ( '' === $map['dk_variant_id'] && 0 === (int) $wc_variation_id ) {
			$map = self::get( (int) $wc_product_id, 0 );
		}
		if ( '' === $map['dk_variant_id'] ) {
			return new WP_Error( 'dk_no_variant', __( 'Digikala variant is not mapped.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$target = (int) $wc_variation_id > 0 ? (int) $wc_variation_id : (int) $wc_product_id;
		$price  = 0.0;
		if ( class_exists( 'WNC_Pricing' ) ) {
			$price = (float) WNC_Pricing::get_price( $target, 'digikala' );
		}
		if ( $price <= 0 ) {
			$price = (float) apply_filters( 'webino_digikala_channel_price', 0, $target );
		}
		$remote = 0;
		if ( class_exists( 'WNC_Pricing' ) && $price > 0 ) {
			$remote = (int) WNC_Pricing::to_remote_unit( $price, 'digikala' );
		} else {
			$remote = (int) round( $price * 10 );
		}
		$credit = 0;
		if ( class_exists( 'Digikala_Auth' ) ) {
			$credit = (int) ( Digikala_Auth::settings()['credit_increase_percentage'] ?? 0 );
		}
		$variant_id = (int) $map['dk_variant_id'];
		$res        = Digikala_Client::request(
			'PATCH',
			'open-api/v1/variants/selling-price',
			array(
				'variant_id'                 => $variant_id,
				'selling_price'              => $remote,
				'credit_increase_percentage' => max( 0, $credit ),
			)
		);
		if ( is_wp_error( $res ) ) {
			Digikala_Client::request(
				'POST',
				'open-api/v1/batch/variant/update',
				array(
					'deadline' => 300,
					'items'    => array(
						array(
							'variant_id' => $variant_id,
							'payload'    => array( 'selling_price' => $remote ),
						),
					),
				)
			);
		}
		$product = wc_get_product( $target );
		$qty     = $product ? max( 0, (int) $product->get_stock_quantity() ) : 0;
		Digikala_Client::request(
			'POST',
			'open-api/v1/batch/variant/seller-stock/update',
			array(
				'deadline' => 300,
				'items'    => array(
					array(
						'variant_id' => $variant_id,
						'payload'    => array( 'seller_stock' => $qty ),
					),
				),
			)
		);
		return true;
	}

	/**
	 * Maps for a Woo product including variations.
	 *
	 * @param int $wc_product_id Product.
	 * @return array<int,array<string,mixed>>
	 */
	public static function maps_for_product( $wc_product_id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dk_product_map';
		$rows  = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE wc_product_id=%d ORDER BY wc_variation_id ASC",
				(int) $wc_product_id
			),
			ARRAY_A
		);
		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * All mapped products for Digikala products page.
	 *
	 * @param int $limit Limit.
	 * @param int $offset Offset.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_mapped( $limit = 100, $offset = 0 ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dk_product_map';
		$limit = max( 1, min( 200, (int) $limit ) );
		$offset = max( 0, (int) $offset );
		$rows  = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE dk_product_id<>'' OR dk_variant_id<>'' ORDER BY last_sync_at DESC LIMIT %d OFFSET %d",
				$limit,
				$offset
			),
			ARRAY_A
		);
		$out = array();
		foreach ( (array) $rows as $row ) {
			$pid     = (int) ( $row['wc_product_id'] ?? 0 );
			$vid     = (int) ( $row['wc_variation_id'] ?? 0 );
			$product = $vid > 0 ? wc_get_product( $vid ) : wc_get_product( $pid );
			$parent  = $pid > 0 ? wc_get_product( $pid ) : null;
			$out[]   = array(
				'wc_product_id'   => $pid,
				'wc_variation_id' => $vid,
				'dk_product_id'   => (string) ( $row['dk_product_id'] ?? '' ),
				'dk_variant_id'   => (string) ( $row['dk_variant_id'] ?? '' ),
				'last_sync_at'    => (string) ( $row['last_sync_at'] ?? '' ),
				'name'            => $product ? $product->get_name() : ( $parent ? $parent->get_name() : '' ),
				'sku'             => $product ? (string) $product->get_sku() : '',
			);
		}
		return $out;
	}
}
