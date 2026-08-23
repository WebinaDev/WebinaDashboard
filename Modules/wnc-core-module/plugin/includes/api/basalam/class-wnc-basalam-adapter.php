<?php
/**
 * Basalam platform adapter — Core + Order Processing + OAuth refresh.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Basalam adapter.
 */
class WNC_Basalam_Adapter implements WNC_Platform {

	const TOKEN_OPTION = 'wnc_basalam_tokens';

	/**
	 * {@inheritdoc}
	 */
	public function id() {
		return 'basalam';
	}

	/**
	 * {@inheritdoc}
	 */
	public function label() {
		return __( 'باسلام', 'webinaconnector' );
	}

	/**
	 * {@inheritdoc}
	 */
	public function is_live() {
		return true;
	}

	/**
	 * Credentials from settings; newly saved settings tokens override stored option.
	 *
	 * @return array
	 */
	private function credentials() {
		$p = WNC_Settings::get_platform( 'basalam' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		$c = wp_parse_args(
			$c,
			array(
				'base_url'      => 'https://openapi.basalam.com',
				'auth_url'      => 'https://auth.basalam.com/oauth/token',
				'access_token'  => '',
				'refresh_token' => '',
				'vendor_id'     => '',
				'client_id'     => '',
				'client_secret' => '',
			)
		);

		$stored = get_option( self::TOKEN_OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		$settings_access  = (string) ( $c['access_token'] ?? '' );
		$settings_refresh = (string) ( $c['refresh_token'] ?? '' );
		$stored_access    = (string) ( $stored['access_token'] ?? '' );
		$stored_refresh   = (string) ( $stored['refresh_token'] ?? '' );

		if ( '' !== $settings_access ) {
			if ( $settings_access !== $stored_access || ( '' !== $settings_refresh && $settings_refresh !== $stored_refresh ) ) {
				$stored = array(
					'access_token'      => $settings_access,
					'refresh_token'     => ( '' !== $settings_refresh ) ? $settings_refresh : $stored_refresh,
					'access_expires_at' => ( $settings_access === $stored_access ) ? (int) ( $stored['access_expires_at'] ?? 0 ) : 0,
				);
				update_option( self::TOKEN_OPTION, $stored, false );
			}
		} elseif ( '' !== $stored_access ) {
			$c['access_token'] = $stored_access;
			if ( '' === $settings_refresh && '' !== $stored_refresh ) {
				$c['refresh_token'] = $stored_refresh;
			}
		}

		if ( '' === $c['refresh_token'] && '' !== $stored_refresh ) {
			$c['refresh_token'] = $stored_refresh;
		}

		$c['access_expires_at'] = (int) ( $stored['access_expires_at'] ?? 0 );
		return $c;
	}

	/**
	 * Persist OAuth tokens.
	 *
	 * @param array $data Token payload.
	 */
	private function persist_tokens( array $data ) {
		$current = get_option( self::TOKEN_OPTION, array() );
		if ( ! is_array( $current ) ) {
			$current = array();
		}

		$access = (string) ( $data['access_token'] ?? '' );
		if ( '' === $access ) {
			$access = (string) ( $current['access_token'] ?? '' );
		}
		$refresh = (string) ( $data['refresh_token'] ?? '' );
		// Never accept empty string as a new refresh token.
		if ( '' === $refresh ) {
			$refresh = (string) ( $current['refresh_token'] ?? '' );
		}

		$expires = (int) ( $current['access_expires_at'] ?? 0 );
		if ( isset( $data['expires_in'] ) ) {
			$expires = time() + (int) $data['expires_in'];
		}

		$merged = array(
			'access_token'      => $access,
			'refresh_token'     => $refresh,
			'access_expires_at' => $expires,
		);
		update_option( self::TOKEN_OPTION, $merged, false );

		// Mirror into settings so UI remains consistent.
		$settings = WNC_Settings::get_platform( 'basalam' );
		$creds    = isset( $settings['credentials'] ) && is_array( $settings['credentials'] ) ? $settings['credentials'] : array();
		$creds['access_token']  = $merged['access_token'];
		$creds['refresh_token'] = $merged['refresh_token'];
		WNC_Settings::update_platform( 'basalam', array( 'credentials' => $creds ) );
	}

	/**
	 * Refresh access token via OAuth.
	 *
	 * @return true|WP_Error
	 */
	public function refresh_token() {
		$c = $this->credentials();
		if ( empty( $c['refresh_token'] ) ) {
			return new WP_Error( 'wnc_bs_auth', __( 'رفرش توکن باسلام موجود نیست.', 'webinaconnector' ) );
		}
		if ( empty( $c['client_id'] ) || empty( $c['client_secret'] ) ) {
			return new WP_Error( 'wnc_bs_auth', __( 'Client ID/Secret باسلام برای رفرش لازم است.', 'webinaconnector' ) );
		}

		$res = WNC_HTTP::request(
			'POST',
			$c['auth_url'],
			array(
				'form' => true,
				'body' => array(
					'grant_type'    => 'refresh_token',
					'refresh_token' => $c['refresh_token'],
					'client_id'     => $c['client_id'],
					'client_secret' => $c['client_secret'],
				),
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		if ( empty( $res['access_token'] ) ) {
			return new WP_Error( 'wnc_bs_auth', __( 'رفرش توکن باسلام ناموفق بود.', 'webinaconnector' ) );
		}
		$this->persist_tokens( $res );
		return true;
	}

	/**
	 * Ensure a usable access token.
	 *
	 * @return string|WP_Error
	 */
	private function access_token() {
		$c = $this->credentials();
		if ( empty( $c['access_token'] ) ) {
			return new WP_Error( 'wnc_bs_auth', __( 'توکن باسلام تنظیم نشده است.', 'webinaconnector' ) );
		}
		$expires = (int) ( $c['access_expires_at'] ?? 0 );
		if ( $expires > 0 && $expires <= time() + 60 ) {
			$ref = $this->refresh_token();
			if ( is_wp_error( $ref ) ) {
				WNC_Logger::info( 'Basalam token refresh failed: ' . $ref->get_error_message(), 'basalam', 'auth' );
				return $ref;
			}
			$c = $this->credentials();
			if ( empty( $c['access_token'] ) ) {
				return new WP_Error( 'wnc_bs_auth', __( 'توکن باسلام پس از رفرش موجود نیست.', 'webinaconnector' ) );
			}
		}
		return (string) $c['access_token'];
	}

	/**
	 * Authenticated request with 401 retry after refresh.
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
		$url = trailingslashit( $c['base_url'] ) . ltrim( $path, '/' );

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
			if ( is_array( $data ) && 401 === (int) ( $data['status'] ?? 0 ) ) {
				$ref = $this->refresh_token();
				if ( ! is_wp_error( $ref ) ) {
					$token = $this->access_token();
					if ( ! is_wp_error( $token ) ) {
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
					}
				}
			}
			if ( is_wp_error( $res ) ) {
				WNC_Logger::error( 'Basalam API error: ' . $res->get_error_message(), 'basalam', 'api', array( 'path' => $path ) );
			}
		}
		return $res;
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		$res = $this->request( 'GET', 'v1/users/me' );
		if ( is_wp_error( $res ) ) {
			$c = $this->credentials();
			if ( ! empty( $c['vendor_id'] ) ) {
				$res = $this->request( 'GET', 'v1/vendors/' . rawurlencode( (string) $c['vendor_id'] ) );
			}
			return is_wp_error( $res ) ? $res : true;
		}

		// Persist vendor.id from /users/me when settings vendor_id is empty.
		$c = $this->credentials();
		if ( empty( $c['vendor_id'] ) ) {
			$vendor_id = '';
			if ( ! empty( $res['vendor']['id'] ) ) {
				$vendor_id = (string) $res['vendor']['id'];
			} elseif ( ! empty( $res['data']['vendor']['id'] ) ) {
				$vendor_id = (string) $res['data']['vendor']['id'];
			} elseif ( ! empty( $res['vendor_id'] ) ) {
				$vendor_id = (string) $res['vendor_id'];
			}
			if ( '' !== $vendor_id ) {
				$settings = WNC_Settings::get_platform( 'basalam' );
				$creds    = isset( $settings['credentials'] ) && is_array( $settings['credentials'] ) ? $settings['credentials'] : array();
				$creds['vendor_id'] = $vendor_id;
				WNC_Settings::update_platform( 'basalam', array( 'credentials' => $creds ) );
			}
		}
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function search_products( array $args ) {
		$c      = $this->credentials();
		$vendor = (string) ( $args['vendor_id'] ?? $c['vendor_id'] );
		if ( '' === $vendor ) {
			return new WP_Error( 'wnc_bs_vendor', __( 'شناسه غرفه باسلام تنظیم نشده است.', 'webinaconnector' ) );
		}

		$query = array(
			'page'     => (int) ( $args['page'] ?? 1 ),
			'per_page' => (int) ( $args['per_page'] ?? 20 ),
		);
		if ( ! empty( $args['keyword'] ) ) {
			$query['title'] = sanitize_text_field( (string) $args['keyword'] );
		}

		$res = $this->request( 'GET', 'v1/vendors/' . rawurlencode( $vendor ) . '/products', null, $query );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$items = (array) ( $res['data'] ?? $res['products'] ?? $res );
		if ( isset( $items['data'] ) && is_array( $items['data'] ) ) {
			$items = $items['data'];
		}

		$out = array();
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$variants = array();
			if ( isset( $item['variants'] ) && is_array( $item['variants'] ) ) {
				$variants = $item['variants'];
			} elseif ( isset( $item['variant'] ) && is_array( $item['variant'] ) ) {
				$variants = isset( $item['variant'][0] ) ? $item['variant'] : array( $item['variant'] );
			} elseif ( isset( $item['variations'] ) && is_array( $item['variations'] ) ) {
				$variants = $item['variations'];
			} else {
				$variants = array( $item );
			}
			foreach ( $variants as $v ) {
				if ( ! is_array( $v ) ) {
					continue;
				}
				$out[] = array(
					'id'         => (string) ( $item['id'] ?? '' ),
					'variant_id' => (string) ( $v['id'] ?? $v['variant_id'] ?? $item['id'] ?? '' ),
					'title'      => (string) ( $item['title'] ?? $item['name'] ?? '' ),
					'price'      => (int) ( $v['primary_price'] ?? $v['price'] ?? $item['price'] ?? 0 ),
					'stock'      => (int) ( $v['inventory'] ?? $v['stock'] ?? $item['inventory'] ?? $item['stock'] ?? 0 ),
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
		$product_id   = (string) $map['remote_product_id'];
		$variation_id = (string) ( $map['remote_variant_id'] ?: $product_id );
		if ( '' === $product_id ) {
			return new WP_Error( 'wnc_bs_map', __( 'شناسه محصول باسلام نامعتبر است.', 'webinaconnector' ) );
		}

		$path = 'v1/products/' . rawurlencode( $product_id ) . '/variations/' . rawurlencode( $variation_id );
		$res  = $this->request(
			'PATCH',
			$path,
			array(
				'primary_price' => (int) $price,
			)
		);
		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_stock( array $map, $qty ) {
		$product_id   = (string) $map['remote_product_id'];
		$variation_id = (string) ( $map['remote_variant_id'] ?: $product_id );
		if ( '' === $product_id ) {
			return new WP_Error( 'wnc_bs_map', __( 'شناسه محصول باسلام نامعتبر است.', 'webinaconnector' ) );
		}

		$path = 'v1/products/' . rawurlencode( $product_id ) . '/variations/' . rawurlencode( $variation_id );
		$res  = $this->request(
			'PATCH',
			$path,
			array(
				'stock' => max( 0, (int) $qty ),
			)
		);
		return is_wp_error( $res ) ? $res : true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function pull_orders( array $args ) {
		$c      = $this->credentials();
		$vendor = (string) ( $args['vendor_id'] ?? $c['vendor_id'] );
		$query  = array(
			'per_page' => (int) ( $args['per_page'] ?? 20 ),
		);
		if ( $vendor ) {
			$query['items.vendor_ids'] = $vendor;
		}
		if ( ! empty( $args['cursor'] ) ) {
			$query['cursor'] = sanitize_text_field( (string) $args['cursor'] );
		}

		$res = $this->request( 'GET', 'v1/vendor-parcels', null, $query );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$items = (array) ( $res['data'] ?? $res['parcels'] ?? $res );
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
					'id' => (string) ( $item['id'] ?? $item['parcel_id'] ?? '' ),
				)
			);
		}
		return $out;
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_order( $remote_id ) {
		$res = $this->request( 'GET', 'v1/vendor-parcels/' . rawurlencode( (string) $remote_id ) );
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
