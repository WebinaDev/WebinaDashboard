<?php
/**
 * Technolife live adapter — API Key + configurable base_url / endpoint map.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Technolife platform adapter.
 */
class WNC_Technolife_Adapter implements WNC_Platform {

	/**
	 * {@inheritdoc}
	 */
	public function id() {
		return 'technolife';
	}

	/**
	 * {@inheritdoc}
	 */
	public function label() {
		return __( 'تکنولایف', 'webinaconnector' );
	}

	/**
	 * {@inheritdoc}
	 */
	public function is_live() {
		return true;
	}

	/**
	 * Credentials + endpoint map.
	 *
	 * @return array
	 */
	private function credentials() {
		$p = WNC_Settings::get_platform( 'technolife' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		$defaults = array(
			'api_key'       => '',
			'base_url'      => '',
			'auth_header'   => 'bearer', // bearer | x-api-key
			'products_path' => 'api/v1/seller/products',
			'price_path'    => 'api/v1/seller/variants/{variant_id}/price',
			'stock_path'    => 'api/v1/seller/variants/{variant_id}/stock',
			'orders_path'   => 'api/v1/seller/orders',
			'order_path'    => 'api/v1/seller/orders/{order_id}',
			'test_path'     => 'api/v1/seller/me',
		);
		return wp_parse_args( $c, $defaults );
	}

	/**
	 * Interpolate path placeholders.
	 *
	 * @param string              $template Template.
	 * @param array<string,mixed> $vars Vars.
	 * @return string
	 */
	private function path( $template, array $vars = array() ) {
		$out = (string) $template;
		foreach ( $vars as $k => $v ) {
			$out = str_replace( '{' . $k . '}', rawurlencode( (string) $v ), $out );
		}
		return ltrim( $out, '/' );
	}

	/**
	 * Auth headers.
	 *
	 * @param array $c Creds.
	 * @return array|WP_Error
	 */
	private function auth_headers( array $c ) {
		if ( empty( $c['api_key'] ) ) {
			return new WP_Error( 'wnc_tl_auth', __( 'API Key تکنولایف تنظیم نشده است.', 'webinaconnector' ) );
		}
		if ( 'x-api-key' === ( $c['auth_header'] ?? 'bearer' ) ) {
			return array(
				'X-Api-Key'    => $c['api_key'],
				'Content-Type' => 'application/json',
			);
		}
		return array(
			'Authorization' => 'Bearer ' . $c['api_key'],
			'Content-Type'  => 'application/json',
		);
	}

	/**
	 * Request.
	 *
	 * @param string     $method Method.
	 * @param string     $path Path.
	 * @param mixed      $body Body.
	 * @param array|null $query Query.
	 * @return array|WP_Error
	 */
	private function request( $method, $path, $body = null, $query = null ) {
		$c = $this->credentials();
		if ( empty( $c['base_url'] ) ) {
			return new WP_Error(
				'wnc_tl_base',
				__( 'Base URL تکنولایف خالی است. آدرس API را از پنل فروشنده وارد کنید.', 'webinaconnector' )
			);
		}
		$headers = $this->auth_headers( $c );
		if ( is_wp_error( $headers ) ) {
			return $headers;
		}
		$url = trailingslashit( $c['base_url'] ) . ltrim( $path, '/' );
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
			WNC_Logger::error( 'Technolife API error: ' . $res->get_error_message(), 'technolife', 'api', array( 'path' => $path ) );
		}
		return $res;
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		$c = $this->credentials();
		if ( empty( $c['base_url'] ) ) {
			return new WP_Error(
				'wnc_tl_base',
				__( 'Base URL تکنولایف خالی است. آدرس API را از پنل فروشنده وارد کنید.', 'webinaconnector' )
			);
		}
		$res = $this->request( 'GET', $this->path( $c['test_path'] ) );
		if ( is_wp_error( $res ) ) {
			$res = $this->request( 'GET', $this->path( $c['products_path'] ), null, array( 'page' => 1, 'per_page' => 1 ) );
		}
		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function search_products( array $args ) {
		$c     = $this->credentials();
		$query = array(
			'page'     => (int) ( $args['page'] ?? 1 ),
			'per_page' => (int) ( $args['per_page'] ?? 20 ),
		);
		if ( ! empty( $args['keyword'] ) ) {
			$query['q'] = sanitize_text_field( (string) $args['keyword'] );
			$query['search'] = $query['q'];
		}
		$res = $this->request( 'GET', $this->path( $c['products_path'] ), null, $query );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$items = (array) ( $res['data'] ?? $res['products'] ?? $res['items'] ?? $res );
		if ( isset( $items['data'] ) && is_array( $items['data'] ) ) {
			$items = $items['data'];
		}
		$out = array();
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$variants = isset( $item['variants'] ) && is_array( $item['variants'] ) ? $item['variants'] : array( $item );
			foreach ( $variants as $v ) {
				if ( ! is_array( $v ) ) {
					continue;
				}
				$out[] = array(
					'id'         => (string) ( $item['id'] ?? $item['product_id'] ?? '' ),
					'variant_id' => (string) ( $v['id'] ?? $v['variant_id'] ?? $item['id'] ?? '' ),
					'title'      => (string) ( $item['title'] ?? $item['name'] ?? $v['title'] ?? '' ),
					'price'      => (int) ( $v['price'] ?? $item['price'] ?? 0 ),
					'stock'      => (int) ( $v['stock'] ?? $item['stock'] ?? 0 ),
					'raw'        => $item,
				);
			}
		}
		return $out;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_price( array $map, $price ) {
		$c          = $this->credentials();
		$variant_id = (string) ( $map['remote_variant_id'] ?: $map['remote_product_id'] );
		if ( '' === $variant_id ) {
			return new WP_Error( 'wnc_tl_map', __( 'شناسه تنوع تکنولایف نامعتبر است.', 'webinaconnector' ) );
		}
		$path = $this->path(
			$c['price_path'],
			array(
				'variant_id' => $variant_id,
				'product_id' => (string) $map['remote_product_id'],
			)
		);
		$res = $this->request(
			'PATCH',
			$path,
			array(
				'price'         => (int) $price,
				'selling_price' => (int) $price,
			)
		);
		if ( is_wp_error( $res ) ) {
			$res = $this->request(
				'PUT',
				$path,
				array(
					'price' => (int) $price,
				)
			);
		}
		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_stock( array $map, $qty ) {
		$c          = $this->credentials();
		$variant_id = (string) ( $map['remote_variant_id'] ?: $map['remote_product_id'] );
		if ( '' === $variant_id ) {
			return new WP_Error( 'wnc_tl_map', __( 'شناسه تنوع تکنولایف نامعتبر است.', 'webinaconnector' ) );
		}
		$path = $this->path(
			$c['stock_path'],
			array(
				'variant_id' => $variant_id,
				'product_id' => (string) $map['remote_product_id'],
			)
		);
		$res = $this->request(
			'PATCH',
			$path,
			array(
				'stock'    => max( 0, (int) $qty ),
				'quantity' => max( 0, (int) $qty ),
			)
		);
		if ( is_wp_error( $res ) ) {
			$res = $this->request(
				'PUT',
				$path,
				array(
					'stock' => max( 0, (int) $qty ),
				)
			);
		}
		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function pull_orders( array $args ) {
		$c     = $this->credentials();
		$query = array(
			'page'     => (int) ( $args['page'] ?? 1 ),
			'per_page' => (int) ( $args['per_page'] ?? 20 ),
		);
		$res = $this->request( 'GET', $this->path( $c['orders_path'] ), null, $query );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$items = (array) ( $res['data'] ?? $res['orders'] ?? $res['items'] ?? $res );
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
					'id' => (string) ( $item['id'] ?? $item['order_id'] ?? '' ),
				)
			);
		}
		return $out;
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_order( $remote_id ) {
		$c    = $this->credentials();
		$path = $this->path( $c['order_path'], array( 'order_id' => $remote_id ) );
		$res  = $this->request( 'GET', $path );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$data = isset( $res['data'] ) && is_array( $res['data'] ) ? $res['data'] : $res;
		$data['id'] = (string) $remote_id;
		return $data;
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
