<?php
/**
 * TapsiShop live adapter (vendorgw.tapsi.shop), based on VWare patterns.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * TapsiShop platform adapter.
 */
class WNC_Tapsishop_Adapter implements WNC_Platform {

	const TOKEN_OPTION = 'wnc_tapsishop_tokens';

	/**
	 * {@inheritdoc}
	 */
	public function id() {
		return 'tapsishop';
	}

	/**
	 * {@inheritdoc}
	 */
	public function label() {
		return __( 'تپسی شاپ', 'webinaconnector' );
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
		$p = WNC_Settings::get_platform( 'tapsishop' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		$c = wp_parse_args(
			$c,
			array(
				'base_url'       => 'https://vendorgw.tapsi.shop',
				'username'       => '',
				'password'       => '',
				'store_id'       => '',
				'client_name'    => 'vendor.dartil.com',
				'client_version' => '1.0.0.0',
				'token'          => '',
				'token_name'     => '5',
			)
		);
		$stored = get_option( self::TOKEN_OPTION, array() );
		if ( is_array( $stored ) && ! empty( $stored['token'] ) ) {
			$c['token']           = $stored['token'];
			$c['token_expires_at'] = (int) ( $stored['expires_at'] ?? 0 );
		}
		return $c;
	}

	/**
	 * Persist refreshed token.
	 *
	 * @param string $token Token.
	 * @param int    $expires_at Unix expiry.
	 */
	private function persist_token( $token, $expires_at = 0 ) {
		update_option(
			self::TOKEN_OPTION,
			array(
				'token'      => (string) $token,
				'expires_at' => (int) $expires_at,
			),
			false
		);
		$settings = WNC_Settings::get_platform( 'tapsishop' );
		$creds    = isset( $settings['credentials'] ) && is_array( $settings['credentials'] ) ? $settings['credentials'] : array();
		$creds['token'] = (string) $token;
		WNC_Settings::update_platform( 'tapsishop', array( 'credentials' => $creds ) );
	}

	/**
	 * Refresh vendor token.
	 *
	 * @return true|WP_Error
	 */
	public function refresh_token() {
		$c = $this->credentials();
		if ( empty( $c['token'] ) ) {
			return new WP_Error( 'wnc_ts_auth', __( 'توکن تپسی‌شاپ تنظیم نشده است.', 'webinaconnector' ) );
		}
		$url = trailingslashit( $c['base_url'] ) . 'Web/Hub/vendors/v1/refresh-token';
		$res = WNC_HTTP::request(
			'POST',
			$url,
			array(
				'headers' => $this->headers( $c, false ),
				'body'    => array(
					'token'             => $c['token'],
					'name'              => (string) $c['token_name'],
					'revokeCurrentToken' => false,
					'expiredAt'         => gmdate( 'c', time() + MONTH_IN_SECONDS ),
				),
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$new = (string) ( $res['data']['token'] ?? $res['token'] ?? '' );
		if ( '' === $new ) {
			return new WP_Error( 'wnc_ts_auth', __( 'رفرش توکن تپسی‌شاپ ناموفق بود.', 'webinaconnector' ) );
		}
		$exp_raw = $res['data']['expireDate'] ?? $res['data']['expiredAt'] ?? '';
		$expires = $exp_raw ? strtotime( (string) $exp_raw ) : time() + MONTH_IN_SECONDS;
		$this->persist_token( $new, (int) $expires );
		return true;
	}

	/**
	 * Ensure valid token.
	 *
	 * @return string|WP_Error
	 */
	private function access_token() {
		$c = $this->credentials();
		if ( empty( $c['token'] ) ) {
			return new WP_Error( 'wnc_ts_auth', __( 'توکن تپسی‌شاپ تنظیم نشده است. توکن پنل فروشنده را وارد کنید.', 'webinaconnector' ) );
		}
		$expires = (int) ( $c['token_expires_at'] ?? 0 );
		if ( $expires > 0 && $expires <= time() + DAY_IN_SECONDS ) {
			$ref = $this->refresh_token();
			if ( ! is_wp_error( $ref ) ) {
				$c = $this->credentials();
			}
		}
		return (string) $c['token'];
	}

	/**
	 * Common headers.
	 *
	 * @param array $c Creds.
	 * @param bool  $with_auth Include auth header.
	 * @return array
	 */
	private function headers( array $c, $with_auth = true ) {
		$headers = array(
			'Content-Type'   => 'application/json',
			'accept'         => 'application/json',
			'client-name'    => (string) $c['client_name'],
			'client-version' => (string) $c['client_version'],
		);
		if ( $with_auth && ! empty( $c['token'] ) ) {
			$headers['TapsiShop.Hub.Authorization'] = $c['token'];
		}
		return $headers;
	}

	/**
	 * Request with 401 refresh retry.
	 *
	 * @param string     $method Method.
	 * @param string     $path Path.
	 * @param mixed      $body Body.
	 * @param array|null $query Query.
	 * @return array|WP_Error
	 */
	private function request( $method, $path, $body = null, $query = null ) {
		$token = $this->access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}
		$c   = $this->credentials();
		$c['token'] = $token;
		$url = trailingslashit( $c['base_url'] ) . ltrim( $path, '/' );

		$res = WNC_HTTP::request(
			$method,
			$url,
			array(
				'headers' => $this->headers( $c, true ),
				'body'    => $body,
				'query'   => $query,
			)
		);

		if ( is_wp_error( $res ) ) {
			$data = $res->get_error_data();
			if ( is_array( $data ) && 401 === (int) ( $data['status'] ?? 0 ) ) {
				$ref = $this->refresh_token();
				if ( ! is_wp_error( $ref ) ) {
					$c = $this->credentials();
					$res = WNC_HTTP::request(
						$method,
						$url,
						array(
							'headers' => $this->headers( $c, true ),
							'body'    => $body,
							'query'   => $query,
						)
					);
				}
			}
			if ( is_wp_error( $res ) ) {
				WNC_Logger::error( 'TapsiShop API error: ' . $res->get_error_message(), 'tapsishop', 'api', array( 'path' => $path ) );
			}
		}
		return $res;
	}

	/**
	 * Ensure price is valid Tapsi rial (multiple of 10).
	 *
	 * @param int $price Price.
	 * @return int
	 */
	private function normalize_rial( $price ) {
		$price = (int) $price;
		if ( $price <= 0 ) {
			return 0;
		}
		// Price from WNC_Pricing::to_remote_unit is already in configured unit.
		// Only convert toman → rial here; never convert again if already rial.
		$unit = WNC_Pricing::price_unit( 'tapsishop' );
		if ( 'rial' !== $unit ) {
			$price = $price * 10;
		}
		return (int) ( round( $price / 10 ) * 10 );
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		$res = $this->request( 'GET', 'Web/Hub/vendors/v1/vendor-information' );
		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function search_products( array $args ) {
		$page     = max( 1, (int) ( $args['page'] ?? 1 ) );
		$pageSize = max( 1, min( 100, (int) ( $args['per_page'] ?? 50 ) ) );
		$res      = $this->request( 'GET', 'Web/Hub/vendors/v1/products/' . $page . '/' . $pageSize );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$items = (array) ( $res['data']['items'] ?? $res['data'] ?? $res['items'] ?? array() );
		$kw    = isset( $args['keyword'] ) ? mb_strtolower( sanitize_text_field( (string) $args['keyword'] ) ) : '';
		$out   = array();
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$id    = (string) ( $item['id'] ?? $item['sku'] ?? '' );
			$title = (string) ( $item['title'] ?? $item['name'] ?? $item['sku'] ?? '' );
			if ( $kw && false === mb_strpos( mb_strtolower( $title . ' ' . $id . ' ' . ( $item['hsin'] ?? '' ) ), $kw ) ) {
				continue;
			}
			$out[] = array(
				'id'         => $id,
				'variant_id' => (string) ( $item['sku'] ?? $id ),
				'title'      => $title ? $title : ( 'Item #' . $id ),
				'price'      => (int) ( $item['finalPrice'] ?? $item['originalPrice'] ?? 0 ),
				'stock'      => (int) ( $item['onHandQuantity'] ?? $item['onHandQty'] ?? 0 ),
				'raw'        => $item,
			);
		}
		return $out;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_price( array $map, $price ) {
		$id = (string) ( $map['remote_product_id'] ?: $map['remote_variant_id'] );
		if ( '' === $id ) {
			return new WP_Error( 'wnc_ts_map', __( 'شناسه محصول تپسی‌شاپ نامعتبر است.', 'webinaconnector' ) );
		}
		$rial = $this->normalize_rial( $price );
		$qty  = 0;
		if ( ! empty( $map['wc_product_id'] ) ) {
			$qty = WNC_Pricing::get_stock_qty( (int) ( $map['wc_variation_id'] ?: $map['wc_product_id'] ) );
		}
		$res = $this->request(
			'PUT',
			'web/hub/vendors/v1/products',
			array(
				'products' => array(
					array(
						'id'           => $id,
						'stock'        => max( 0, (int) $qty ),
						'price'        => $rial,
						'specialprice' => $rial,
					),
				),
			)
		);
		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_stock( array $map, $qty ) {
		$id = (string) ( $map['remote_product_id'] ?: $map['remote_variant_id'] );
		if ( '' === $id ) {
			return new WP_Error( 'wnc_ts_map', __( 'شناسه محصول تپسی‌شاپ نامعتبر است.', 'webinaconnector' ) );
		}
		$price = 0;
		if ( ! empty( $map['wc_product_id'] ) ) {
			$target = (int) ( $map['wc_variation_id'] ?: $map['wc_product_id'] );
			$price  = WNC_Pricing::to_remote_unit( WNC_Pricing::get_price( $target, 'tapsishop' ), 'tapsishop' );
		}
		$rial = $this->normalize_rial( $price );
		$res  = $this->request(
			'PUT',
			'web/hub/vendors/v1/products',
			array(
				'products' => array(
					array(
						'id'           => $id,
						'stock'        => max( 0, (int) $qty ),
						'price'        => $rial,
						'specialprice' => $rial,
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
		// Vendor order list is often webhook-driven; try a common hub path then empty.
		$page = (int) ( $args['page'] ?? 1 );
		$res  = $this->request( 'GET', 'Web/Hub/vendors/v1/orders/' . max( 1, $page ) . '/50' );
		if ( is_wp_error( $res ) ) {
			$res = $this->request( 'GET', 'Web/Hub/vendors/v1/orders', null, array( 'page' => $page ) );
		}
		if ( is_wp_error( $res ) ) {
			WNC_Logger::info( 'TapsiShop order pull unavailable; use webhooks if configured.', 'tapsishop', 'orders' );
			return array();
		}
		$items = (array) ( $res['data']['items'] ?? $res['data'] ?? $res['orders'] ?? array() );
		$out   = array();
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$out[] = array_merge(
				$item,
				array(
					'id' => (string) ( $item['id'] ?? $item['orderId'] ?? $item['code'] ?? '' ),
				)
			);
		}
		return $out;
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_order( $remote_id ) {
		$res = $this->request( 'GET', 'Web/Hub/vendors/v1/orders/' . rawurlencode( (string) $remote_id ) );
		if ( is_wp_error( $res ) ) {
			return array(
				'id'    => (string) $remote_id,
				'items' => array(),
			);
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
