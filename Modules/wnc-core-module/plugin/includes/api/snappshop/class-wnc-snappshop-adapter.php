<?php
/**
 * SnappShop live adapter (apix + automation), based on VWare/SnappShopAdmin patterns.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * SnappShop platform adapter.
 */
class WNC_Snappshop_Adapter implements WNC_Platform {

	/**
	 * {@inheritdoc}
	 */
	public function id() {
		return 'snappshop';
	}

	/**
	 * {@inheritdoc}
	 */
	public function label() {
		return __( 'اسنپ شاپ', 'webinaconnector' );
	}

	/**
	 * {@inheritdoc}
	 */
	public function is_live() {
		return true;
	}

	/**
	 * Credentials.
	 *
	 * @return array
	 */
	private function credentials() {
		$p = WNC_Settings::get_platform( 'snappshop' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		return wp_parse_args(
			$c,
			array(
				'base_url'            => 'https://apix.snappshop.ir',
				'automation_base_url' => 'https://apix.snappshop.ir/automation/v1',
				'token'               => '',
				'token_api'           => '',
				'vendor_id'           => '',
				'shop_code'           => '',
				'user_agent'          => '',
			)
		);
	}

	/**
	 * Resolve vendor id (shop_code may equal vendor id).
	 *
	 * @param array $c Creds.
	 * @return string
	 */
	private function vendor_id( array $c ) {
		if ( ! empty( $c['vendor_id'] ) ) {
			return (string) $c['vendor_id'];
		}
		return (string) ( $c['shop_code'] ?? '' );
	}

	/**
	 * Panel/inventory token.
	 *
	 * @param array $c Creds.
	 * @return string
	 */
	private function panel_token( array $c ) {
		return (string) ( $c['token'] ?: $c['token_api'] );
	}

	/**
	 * Automation token.
	 *
	 * @param array $c Creds.
	 * @return string
	 */
	private function automation_token( array $c ) {
		return (string) ( $c['token_api'] ?: $c['token'] );
	}

	/**
	 * Request helper.
	 *
	 * @param string     $method Method.
	 * @param string     $base Base URL.
	 * @param string     $path Path.
	 * @param string     $token Bearer.
	 * @param mixed      $body Body.
	 * @param array|null $query Query.
	 * @param array      $extra_headers Extra headers.
	 * @return array|WP_Error
	 */
	private function request( $method, $base, $path, $token, $body = null, $query = null, array $extra_headers = array() ) {
		if ( '' === $token ) {
			return new WP_Error( 'wnc_ss_auth', __( 'توکن اسنپ‌شاپ تنظیم نشده است.', 'webinaconnector' ) );
		}
		$url = trailingslashit( $base ) . ltrim( $path, '/' );
		$headers = array_merge(
			array(
				'Authorization' => 'Bearer ' . $token,
				'Content-Type'  => 'application/json',
				'x-client-type' => 'seller',
				'referer'       => 'https://seller.snappshop.ir/',
				'origin'        => 'https://seller.snappshop.ir',
			),
			$extra_headers
		);
		$res = WNC_HTTP::request(
			$method,
			$url,
			array(
				'headers' => $headers,
				'body'    => $body,
				'query'   => $query,
			)
		);
		if ( is_wp_error( $res ) ) {
			WNC_Logger::error( 'SnappShop API error: ' . $res->get_error_message(), 'snappshop', 'api', array( 'path' => $path ) );
		}
		return $res;
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		$c      = $this->credentials();
		$vendor = $this->vendor_id( $c );
		if ( '' === $vendor ) {
			return new WP_Error( 'wnc_ss_vendor', __( 'Vendor ID / Shop Code اسنپ‌شاپ تنظیم نشده است.', 'webinaconnector' ) );
		}
		$res = $this->request(
			'GET',
			$c['base_url'],
			'vendors/v1/' . rawurlencode( $vendor ) . '/inventory/products',
			$this->panel_token( $c ),
			null,
			array( 'page' => 1 ),
			array( 'snappshop-seller-code' => $vendor )
		);
		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function search_products( array $args ) {
		$c      = $this->credentials();
		$vendor = $this->vendor_id( $c );
		if ( '' === $vendor ) {
			return new WP_Error( 'wnc_ss_vendor', __( 'Vendor ID / Shop Code اسنپ‌شاپ تنظیم نشده است.', 'webinaconnector' ) );
		}
		$page = (int) ( $args['page'] ?? 1 );
		$res  = $this->request(
			'GET',
			$c['base_url'],
			'vendors/v1/' . rawurlencode( $vendor ) . '/inventory/products',
			$this->panel_token( $c ),
			null,
			array( 'page' => $page ),
			array( 'snappshop-seller-code' => $vendor )
		);
		if ( is_wp_error( $res ) ) {
			// Fallback automation list.
			$res = $this->request(
				'GET',
				$c['automation_base_url'],
				'vendors/' . rawurlencode( $vendor ) . '/products',
				$this->automation_token( $c ),
				null,
				array( 'page' => $page ),
				$this->ua_headers( $c )
			);
		}
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$items = (array) ( $res['data'] ?? array() );
		$kw    = isset( $args['keyword'] ) ? mb_strtolower( sanitize_text_field( (string) $args['keyword'] ) ) : '';
		$out   = array();
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$title = (string) ( $item['title'] ?? $item['name'] ?? '' );
			$id    = (string) ( $item['id'] ?? $item['product_id'] ?? '' );
			if ( $kw && false === mb_strpos( mb_strtolower( $title . ' ' . $id ), $kw ) ) {
				continue;
			}
			$out[] = array(
				'id'         => $id,
				'variant_id' => (string) ( $item['sku'] ?? $id ),
				'title'      => $title ? $title : ( 'Product #' . $id ),
				'price'      => (int) ( $item['price'] ?? 0 ),
				'stock'      => (int) ( $item['stock'] ?? $item['warehouse_stock'] ?? 0 ),
				'raw'        => $item,
			);
		}
		return $out;
	}

	/**
	 * User-Agent headers for automation.
	 *
	 * @param array $c Creds.
	 * @return array
	 */
	private function ua_headers( array $c ) {
		$ua = (string) ( $c['user_agent'] ?? '' );
		if ( '' === $ua ) {
			$ua = 'WebinaConnector/' . WNC_VERSION;
		}
		return array( 'User-Agent' => $ua );
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_price( array $map, $price ) {
		$c      = $this->credentials();
		$vendor = $this->vendor_id( $c );
		$id     = (string) ( $map['remote_product_id'] ?: $map['remote_variant_id'] );
		$sku    = (string) ( $map['remote_variant_id'] ?: $id );
		if ( '' === $vendor || '' === $id ) {
			return new WP_Error( 'wnc_ss_map', __( 'شناسه محصول اسنپ‌شاپ نامعتبر است.', 'webinaconnector' ) );
		}

		$body = array(
			'products' => array(
				array(
					'id'    => $id,
					'sku'   => $sku,
					'price' => (int) $price,
					'stock' => WNC_Pricing::get_stock_qty( (int) ( $map['wc_variation_id'] ?: $map['wc_product_id'] ) ),
				),
			),
		);

		$res = $this->request(
			'PATCH',
			$c['automation_base_url'],
			'vendors/' . rawurlencode( $vendor ) . '/products',
			$this->automation_token( $c ),
			$body,
			null,
			$this->ua_headers( $c )
		);

		if ( is_wp_error( $res ) ) {
			// Inventory PUT fallback.
			$res = $this->request(
				'PUT',
				$c['base_url'],
				'vendors/v1/' . rawurlencode( $vendor ) . '/inventory/products/' . rawurlencode( $id ),
				$this->panel_token( $c ),
				array(
					'price' => (int) $price,
				),
				null,
				array( 'snappshop-seller-code' => $vendor )
			);
		}

		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_stock( array $map, $qty ) {
		$c      = $this->credentials();
		$vendor = $this->vendor_id( $c );
		$id     = (string) ( $map['remote_product_id'] ?: $map['remote_variant_id'] );
		if ( '' === $vendor || '' === $id ) {
			return new WP_Error( 'wnc_ss_map', __( 'شناسه محصول اسنپ‌شاپ نامعتبر است.', 'webinaconnector' ) );
		}

		$price = 0;
		if ( ! empty( $map['wc_product_id'] ) ) {
			$target = (int) ( $map['wc_variation_id'] ?: $map['wc_product_id'] );
			$price  = WNC_Pricing::to_remote_unit( WNC_Pricing::get_price( $target, 'snappshop' ), 'snappshop' );
		}

		$body = array(
			'products' => array(
				array(
					'id'    => $id,
					'stock' => max( 0, (int) $qty ),
					'price' => (int) $price,
				),
			),
		);

		$res = $this->request(
			'PATCH',
			$c['automation_base_url'],
			'vendors/' . rawurlencode( $vendor ) . '/products',
			$this->automation_token( $c ),
			$body,
			null,
			$this->ua_headers( $c )
		);

		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function pull_orders( array $args ) {
		$c      = $this->credentials();
		$vendor = $this->vendor_id( $c );
		if ( '' === $vendor ) {
			return new WP_Error( 'wnc_ss_vendor', __( 'Vendor ID / Shop Code اسنپ‌شاپ تنظیم نشده است.', 'webinaconnector' ) );
		}

		$end   = ! empty( $args['end_date'] ) ? sanitize_text_field( (string) $args['end_date'] ) : gmdate( 'Y-m-d' );
		$start = ! empty( $args['start_date'] ) ? sanitize_text_field( (string) $args['start_date'] ) : gmdate( 'Y-m-d', strtotime( '-14 days' ) );
		$page  = (int) ( $args['page'] ?? 1 );

		$res = $this->request(
			'GET',
			$c['base_url'],
			'vendors/v1/' . rawurlencode( $vendor ) . '/orders/report',
			$this->panel_token( $c ),
			null,
			array(
				'start_date' => $start,
				'end_date'   => $end,
				'page'       => $page,
			),
			array( 'snappshop-seller-code' => $vendor )
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$items = (array) ( $res['data'] ?? $res['orders'] ?? array() );
		if ( isset( $items['data'] ) && is_array( $items['data'] ) ) {
			$items = $items['data'];
		}
		$out = array();
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$out[] = array_merge(
				$item,
				array(
					'id' => (string) ( $item['id'] ?? $item['order_id'] ?? $item['code'] ?? '' ),
				)
			);
		}
		return $out;
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_order( $remote_id ) {
		$list = $this->pull_orders( array() );
		if ( is_wp_error( $list ) ) {
			return $list;
		}
		foreach ( $list as $item ) {
			if ( (string) ( $item['id'] ?? '' ) === (string) $remote_id ) {
				return $item;
			}
		}
		return array(
			'id'    => (string) $remote_id,
			'items' => array(),
		);
	}

	/**
	 * @return bool
	 */
	public function supports_create_product() {
		return false;
	}

	/**
	 * @param WC_Product $product Product.
	 * @return array|WP_Error
	 */
	public function create_product( $product ) {
		unset( $product );
		return new \WP_Error( 'wnc_no_create', __( 'Remote create is not supported for this platform.', 'webinaconnector' ) );
	}
}
