<?php
/**
 * Digikala platform adapter — aligned with OpenAPI v1.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Digikala platform adapter.
 */
class WNC_Digikala_Adapter implements WNC_Platform {

	/**
	 * @var int
	 */
	private static $rate_limited_until = 0;

	/**
	 * {@inheritdoc}
	 */
	public function id() {
		return 'digikala';
	}

	/**
	 * {@inheritdoc}
	 */
	public function label() {
		return __( 'دیجیکالا', 'webinaconnector' );
	}

	/**
	 * {@inheritdoc}
	 */
	public function is_live() {
		return true;
	}

	/**
	 * Raw API request with 401 → refresh → retry once.
	 *
	 * @param string     $method Method.
	 * @param string     $path Path.
	 * @param mixed      $body Body.
	 * @param array|null $query Query.
	 * @param bool       $retried Already retried after refresh.
	 * @return array|WP_Error
	 */
	public function request( $method, $path, $body = null, $query = null, $retried = false ) {
		if ( self::$rate_limited_until > time() ) {
			return new WP_Error( 'wnc_dk_rate', __( 'دیجیکالا موقتاً محدود شده است.', 'webinaconnector' ), array( 'retry_after' => self::$rate_limited_until - time() ) );
		}

		$token = WNC_Digikala_Auth::access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}

		$creds = WNC_Digikala_Auth::credentials();
		$url   = trailingslashit( $creds['base_url'] ) . ltrim( $path, '/' );

		$res = WNC_HTTP::request(
			$method,
			$url,
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $token,
					'Content-Type'  => 'application/json',
				),
				'body'    => $body,
				'query'   => $query,
			)
		);

		if ( is_wp_error( $res ) ) {
			$data = $res->get_error_data();
			$status = is_array( $data ) ? (int) ( $data['status'] ?? 0 ) : 0;
			if ( 429 === $status ) {
				$retry = (int) ( $data['retry_after'] ?? 60 );
				self::$rate_limited_until = time() + max( 10, $retry );
			}
			if ( 401 === $status && ! $retried ) {
				$ref = WNC_Digikala_Auth::refresh();
				if ( ! is_wp_error( $ref ) ) {
					return $this->request( $method, $path, $body, $query, true );
				}
			}
			WNC_Logger::error( 'Digikala API error: ' . $res->get_error_message(), 'digikala', 'api', array( 'path' => $path, 'data' => $data ) );
			return $res;
		}
		return $res;
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		$creds = WNC_Digikala_Auth::credentials();
		$path  = 'open-api/v1/auth/scopes';
		if ( ! empty( $creds['client_code'] ) ) {
			$path = 'open-api/v1/auth/scopes/' . rawurlencode( (string) $creds['client_code'] );
		}
		$res = $this->request( 'GET', $path );
		if ( is_wp_error( $res ) ) {
			// Connectivity proof without re-issuing one-shot validation code.
			$res = $this->request( 'GET', 'open-api/v1/variants', null, array( 'page' => 1, 'size' => 1 ) );
			return is_wp_error( $res ) ? $res : true;
		}
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function search_products( array $args ) {
		$query = array(
			'page' => (int) ( $args['page'] ?? 1 ),
			'size' => (int) ( $args['per_page'] ?? $args['size'] ?? 50 ),
		);
		if ( ! empty( $args['keyword'] ) ) {
			$query['search[search]'] = sanitize_text_field( (string) $args['keyword'] );
		}
		if ( ! empty( $args['variant_id'] ) ) {
			$query['search[id]'] = (int) $args['variant_id'];
		}
		if ( ! empty( $args['product_id'] ) ) {
			$query['search[product_id]'] = (int) $args['product_id'];
		}

		$res = $this->request( 'GET', 'open-api/v1/variants', null, $query );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$items = (array) ( $res['data']['items'] ?? $res['data'] ?? array() );
		$out   = array();
		$kw    = isset( $args['keyword'] ) ? mb_strtolower( sanitize_text_field( (string) $args['keyword'] ) ) : '';

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$variant_id = (string) ( $item['id'] ?? $item['product_variant_id'] ?? '' );
			$product_id = (string) ( $item['product_id'] ?? $item['product']['id'] ?? '' );
			$title      = (string) ( $item['product_title'] ?? $item['title'] ?? $item['product']['title'] ?? '' );
			if ( $kw && $title && false === mb_strpos( mb_strtolower( $title ), $kw ) && empty( $args['variant_id'] ) ) {
				if ( empty( $args['keyword'] ) || false === mb_strpos( mb_strtolower( $title . ' ' . $variant_id ), $kw ) ) {
					continue;
				}
			}
			$raw_price = (float) ( $item['selling_price'] ?? $item['price'] ?? 0 );
			$out[]     = array(
				'id'         => $product_id,
				'variant_id' => $variant_id,
				'title'      => $title ? $title : ( 'Variant #' . $variant_id ),
				'price'      => (int) round( WNC_Pricing::from_remote_unit( $raw_price, 'digikala' ) ),
				'stock'      => (int) ( $item['seller_stock'] ?? $item['marketplace_seller_stock'] ?? $item['selling_stock'] ?? 0 ),
				'raw'        => $item,
			);
		}
		return $out;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_price( array $map, $price ) {
		$variant_id = (int) ( $map['remote_variant_id'] ?: $map['remote_product_id'] );
		if ( $variant_id <= 0 ) {
			return new WP_Error( 'wnc_dk_variant', __( 'شناسه تنوع دیجیکالا نامعتبر است.', 'webinaconnector' ) );
		}

		$credit = 0;
		$settings = WNC_Settings::get_platform( 'digikala' );
		if ( isset( $settings['credentials']['credit_increase_percentage'] ) ) {
			$credit = (int) $settings['credentials']['credit_increase_percentage'];
		}

		// Caller (price sync) already converts via to_remote_unit; accept either.
		$remote_price = (int) $price;

		$res = $this->request(
			'PATCH',
			'open-api/v1/variants/selling-price',
			array(
				'variant_id'                 => $variant_id,
				'selling_price'              => $remote_price,
				'credit_increase_percentage' => max( 0, $credit ),
			)
		);

		if ( is_wp_error( $res ) ) {
			$data   = $res->get_error_data();
			$status = is_array( $data ) ? (int) ( $data['status'] ?? 0 ) : 0;
			// Do not batch-fallback on auth/validation failures.
			if ( in_array( $status, array( 401, 403, 422 ), true ) || in_array( $res->get_error_code(), array( 'wnc_dk_auth' ), true ) ) {
				return $res;
			}
			$res = $this->request(
				'POST',
				'open-api/v1/batch/variant/update',
				array(
					'deadline' => 300,
					'items'    => array(
						array(
							'variant_id' => $variant_id,
							'payload'    => array(
								'selling_price' => $remote_price,
							),
						),
					),
				)
			);
		}

		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_stock( array $map, $qty ) {
		$variant_id = (int) ( $map['remote_variant_id'] ?: $map['remote_product_id'] );
		if ( $variant_id <= 0 ) {
			return new WP_Error( 'wnc_dk_variant', __( 'شناسه تنوع دیجیکالا نامعتبر است.', 'webinaconnector' ) );
		}

		$res = $this->request(
			'POST',
			'open-api/v1/batch/variant/seller-stock/update',
			array(
				'deadline' => 300,
				'items'    => array(
					array(
						'variant_id' => $variant_id,
						'payload'    => array(
							'seller_stock' => max( 0, (int) $qty ),
						),
					),
				),
			)
		);

		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function pull_orders( array $args ) {
		$page     = max( 1, (int) ( $args['page'] ?? 1 ) );
		$size     = max( 1, min( 100, (int) ( $args['size'] ?? $args['per_page'] ?? 50 ) ) );
		$max_pages = max( 1, (int) ( $args['max_pages'] ?? 20 ) );
		$out      = array();

		for ( $i = 0; $i < $max_pages; $i++ ) {
			$res = $this->request(
				'GET',
				'open-api/v1/orders',
				null,
				array(
					'page' => $page + $i,
					'size' => $size,
				)
			);
			if ( is_wp_error( $res ) ) {
				return empty( $out ) ? $res : $out;
			}
			$items = (array) ( $res['data']['items'] ?? $res['data'] ?? array() );
			if ( empty( $items ) ) {
				break;
			}
			foreach ( $items as $item ) {
				if ( ! is_array( $item ) ) {
					continue;
				}
				$out[] = array_merge(
					$item,
					array(
						'id' => (string) ( $item['id'] ?? $item['order_item_id'] ?? $item['order_id'] ?? '' ),
					)
				);
			}
			if ( count( $items ) < $size ) {
				break;
			}
		}
		return $out;
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_order( $remote_id ) {
		$res = $this->request(
			'GET',
			'open-api/v1/orders',
			null,
			array(
				'page'       => 1,
				'size'       => 10,
				'search[id]' => $remote_id,
			)
		);
		if ( ! is_wp_error( $res ) ) {
			$items = (array) ( $res['data']['items'] ?? $res['data'] ?? array() );
			foreach ( $items as $item ) {
				if ( ! is_array( $item ) ) {
					continue;
				}
				$id = (string) ( $item['id'] ?? $item['order_item_id'] ?? '' );
				if ( $id === (string) $remote_id ) {
					$item['id'] = $id;
					return $item;
				}
			}
			// Never return first list item with a forged id.
		}

		$detail = $this->request( 'GET', 'open-api/v1/orders/' . rawurlencode( (string) $remote_id ) );
		if ( is_wp_error( $detail ) ) {
			return $detail;
		}
		$data = isset( $detail['data'] ) && is_array( $detail['data'] ) ? $detail['data'] : $detail;
		$data['id'] = (string) ( $data['id'] ?? $remote_id );
		return $data;
	}

	/**
	 * Digikala seller catalog create is not a simple POST; we support auto-link by SKU/search.
	 *
	 * @return bool
	 */
	public function supports_create_product() {
		return true;
	}

	/**
	 * Auto-link an existing Digikala variant by SKU or product title search.
	 *
	 * @param WC_Product $product Product.
	 * @return array|WP_Error
	 */
	public function create_product( $product ) {
		if ( ! $product instanceof WC_Product ) {
			return new WP_Error( 'wnc_bad_product', __( 'Invalid product.', 'webinaconnector' ) );
		}
		$sku = trim( (string) $product->get_sku() );
		$args = array( 'size' => 20 );
		if ( '' !== $sku ) {
			$args['keyword'] = $sku;
		} else {
			$args['keyword'] = $product->get_name();
		}
		$found = $this->search_products( $args );
		if ( is_wp_error( $found ) ) {
			return $found;
		}
		if ( empty( $found ) || ! is_array( $found ) ) {
			return new WP_Error(
				'wnc_dk_no_match',
				__( 'No Digikala variant found to link. Create the product in Digikala panel, then paste remote IDs.', 'webinaconnector' )
			);
		}
		$match = $found[0];
		if ( '' !== $sku ) {
			foreach ( $found as $item ) {
				$raw = is_array( $item['raw'] ?? null ) ? $item['raw'] : array();
				$remote_sku = (string) ( $raw['supplier_code'] ?? $raw['sku'] ?? $raw['product']['sku'] ?? '' );
				if ( $remote_sku && 0 === strcasecmp( $remote_sku, $sku ) ) {
					$match = $item;
					break;
				}
			}
		}
		return array(
			'remote_product_id' => (string) ( $match['id'] ?? '' ),
			'remote_variant_id' => (string) ( $match['variant_id'] ?? '' ),
			'remote_url'        => '',
		);
	}
}
