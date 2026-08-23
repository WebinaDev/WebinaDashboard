<?php
/**
 * Emalls platform adapter — price-comparison feed (not order marketplace).
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Emalls adapter.
 */
class WNC_Emalls_Adapter implements WNC_Platform {

	const AUTH_URL           = 'https://emalls.ir/swservice/wp_plugin.ashx';
	const TOKEN_OPTION       = 'emalls_connection';
	const TOKEN_TIME_OPTION  = 'emalls_connection_time';
	const TOKEN_CACHE_EXPIRY = 3600;

	/**
	 * {@inheritdoc}
	 */
	public function id() {
		return 'emalls';
	}

	/**
	 * {@inheritdoc}
	 */
	public function label() {
		return __( 'ایمالز', 'webinaconnector' );
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
	public function credentials() {
		$p = WNC_Settings::get_platform( 'emalls' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		return wp_parse_args(
			$c,
			array(
				'per_page' => 50,
				'version'  => '1.3.0',
			)
		);
	}

	/**
	 * Site domain for auth (no protocol / www).
	 *
	 * @return string
	 */
	public static function site_domain() {
		$host = wp_parse_url( get_site_url(), PHP_URL_HOST );
		if ( ! is_string( $host ) || '' === $host ) {
			$host = (string) wp_parse_url( site_url(), PHP_URL_HOST );
		}
		return str_replace( 'www.', '', $host );
	}

	/**
	 * Verify token with Emalls auth API (form POST).
	 *
	 * @param string $token Token.
	 * @param string $version Version string.
	 * @return true|WP_Error
	 */
	public static function verify_token( $token, $version = '1.3.0' ) {
		$token = trim( (string) $token );
		if ( '' === $token ) {
			return new WP_Error( 'wnc_em_auth_invalid', __( 'توکن ایمالز خالی است.', 'webinaconnector' ) );
		}

		$res = WNC_HTTP::request(
			'POST',
			self::AUTH_URL,
			array(
				'form'    => true,
				'timeout' => 5,
				'body'    => array(
					'token'       => $token,
					'shop_domain' => self::site_domain(),
					'version'     => (string) $version,
				),
			)
		);

		if ( is_wp_error( $res ) ) {
			return new WP_Error(
				'wnc_em_auth_network',
				$res->get_error_message() ? $res->get_error_message() : __( 'خطا در ارتباط با وب‌سرویس احراز هویت ایمالز.', 'webinaconnector' ),
				$res->get_error_data()
			);
		}

		$success = ! empty( $res['success'] );
		$message = isset( $res['message'] ) ? (string) $res['message'] : '';
		if ( $success && 'the token is valid' === $message ) {
			update_option( self::TOKEN_OPTION, $token, false );
			update_option( self::TOKEN_TIME_OPTION, time(), false );
			return true;
		}

		update_option( self::TOKEN_OPTION, '---', false );
		return new WP_Error( 'wnc_em_auth_invalid', __( 'توکن ایمالز نامعتبر است.', 'webinaconnector' ), array( 'response' => $res ) );
	}

	/**
	 * Whether cached token still valid.
	 *
	 * @param string $token Token from request.
	 * @return bool
	 */
	public static function token_cache_valid( $token ) {
		$cached = (string) get_option( self::TOKEN_OPTION, '' );
		$time   = (int) get_option( self::TOKEN_TIME_OPTION, 0 );
		return $cached === (string) $token && $time > 0 && ( time() - $time ) < self::TOKEN_CACHE_EXPIRY;
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		// Crawl auth is crawler-supplied; test only that the auth host is reachable.
		$c       = $this->credentials();
		$version = (string) ( $c['version'] ?? '1.3.0' );
		$res     = wp_remote_post(
			self::AUTH_URL,
			array(
				'timeout' => 12,
				'body'    => array(
					'token'       => 'wnc-connectivity-probe',
					'shop_domain' => self::site_domain(),
					'version'     => $version,
				),
			)
		);
		if ( is_wp_error( $res ) ) {
			return new WP_Error( 'wnc_em_auth', __( 'خطا در ارتباط با وب‌سرویس احراز هویت ایمالز.', 'webinaconnector' ), $res->get_error_data() );
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		if ( $code < 100 ) {
			return new WP_Error( 'wnc_em_auth', __( 'پاسخ نامعتبر از وب‌سرویس ایمالز.', 'webinaconnector' ) );
		}
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function search_products( array $args ) {
		$keyword = isset( $args['keyword'] ) ? sanitize_text_field( (string) $args['keyword'] ) : '';
		$query   = array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => (int) ( $args['per_page'] ?? 20 ),
			'paged'          => max( 1, (int) ( $args['page'] ?? 1 ) ),
		);
		if ( $keyword ) {
			$query['s'] = $keyword;
		}
		$q   = new WP_Query( $query );
		$out = array();
		foreach ( $q->posts as $post ) {
			$product = wc_get_product( $post->ID );
			if ( ! $product ) {
				continue;
			}
			$payload = self::build_product_payload( $product );
			$out[]   = array(
				'id'         => (string) $product->get_id(),
				'variant_id' => '',
				'title'      => $product->get_name(),
				'price'      => (int) round( (float) $payload['current_price'] ),
				'stock'      => WNC_Pricing::get_stock_qty( $product->get_id() ),
				'raw'        => $payload,
			);
		}
		return $out;
	}

	/**
	 * Build official-plugin-compatible product object as array.
	 *
	 * @param WC_Product $product Product or variation.
	 * @return array
	 */
	public static function build_product_payload( $product ) {
		$is_child = (bool) $product->get_parent_id();
		$parent   = null;

		$out = array(
			'title'         => '',
			'subtitle'      => '',
			'parent_id'     => 0,
			'page_unique'   => $product->get_id(),
			'current_price' => '',
			'old_price'     => '',
			'availability'  => $product->get_stock_status(),
			'category_name' => '',
			'image_link'    => null,
			'image_links'   => array(),
			'page_url'      => $product->get_permalink(),
			'short_desc'    => $product->get_short_description(),
			'spec'          => array(),
			'date_added'    => null,
			'date_updated'  => null,
			'product_type'  => $product->get_type(),
			'registry'      => '',
			'guarantee'     => '',
		);

		if ( $is_child ) {
			$parent            = wc_get_product( $product->get_parent_id() );
			$out['title']      = $parent ? $parent->get_name() : $product->get_name();
			$out['subtitle']   = (string) get_post_meta( $product->get_parent_id(), 'product_english_name', true );
			$out['parent_id']  = $parent ? $parent->get_id() : 0;
			$cat_ids           = $parent ? $parent->get_category_ids() : $product->get_category_ids();
			$price_id          = $product->get_id();
		} else {
			$out['title']     = $product->get_name();
			$out['subtitle']  = (string) get_post_meta( $product->get_id(), 'product_english_name', true );
			$out['parent_id'] = 0;
			$cat_ids          = $product->get_category_ids();
			$price_id         = $product->get_id();
		}

		$feed_price = (float) WNC_Pricing::get_price( $price_id, 'emalls' );
		$regular    = (float) $product->get_regular_price();
		$out['current_price'] = (string) (int) round( $feed_price );
		$out['old_price']     = ( $regular > $feed_price && $regular > 0 )
			? (string) (int) round( $regular )
			: $out['current_price'];

		if ( ! empty( $cat_ids ) ) {
			$term = get_term_by( 'id', end( $cat_ids ), 'product_cat', 'ARRAY_A' );
			$out['category_name'] = is_array( $term ) ? (string) ( $term['name'] ?? '' ) : '';
		}

		foreach ( $product->get_gallery_image_ids() as $attachment_id ) {
			$t_link = wp_get_attachment_image_src( $attachment_id, 'full' );
			if ( $t_link ) {
				$out['image_links'][] = $t_link[0];
			}
		}
		$t_image = wp_get_attachment_image_src( $product->get_image_id(), 'full' );
		if ( $t_image ) {
			$out['image_link'] = $t_image[0];
			if ( ! in_array( $t_image[0], $out['image_links'], true ) ) {
				$out['image_links'][] = $t_image[0];
			}
		}

		$created = $product->get_date_created();
		$updated = $product->get_date_modified();
		$out['date_added']   = $created ? $created->format( DATE_ATOM ) : null;
		$out['date_updated'] = $updated ? $updated->format( DATE_ATOM ) : null;

		$spec = array();
		if ( ! $is_child ) {
			foreach ( $product->get_attributes() as $attribute ) {
				$visible = true;
				if ( is_object( $attribute ) && method_exists( $attribute, 'get_visible' ) ) {
					$visible = $attribute->get_visible();
				} elseif ( is_array( $attribute ) ) {
					$visible = ! empty( $attribute['visible'] );
				}
				if ( ! $visible ) {
					continue;
				}
				$name = is_object( $attribute ) ? $attribute->get_name() : (string) ( $attribute['name'] ?? '' );
				$label = wc_attribute_label( $name );
				if ( is_object( $attribute ) && $attribute->is_taxonomy() ) {
					$values = wc_get_product_terms( $product->get_id(), $name, array( 'fields' => 'names' ) );
				} elseif ( is_object( $attribute ) ) {
					$values = $attribute->get_options();
				} elseif ( isset( $attribute['name'] ) && 0 === strpos( $attribute['name'], 'pa_' ) ) {
					$values = wc_get_product_terms( $product->get_id(), $attribute['name'], array( 'fields' => 'names' ) );
				} else {
					$values = isset( $attribute['options'] ) ? (array) $attribute['options'] : array();
				}
				if ( ! is_array( $values ) ) {
					$values = array();
				}
				$spec[ $label ] = implode( ', ', $values );
			}
		}

		if ( ! empty( $spec['رجیستری'] ) ) {
			$out['registry'] = $spec['رجیستری'];
		} elseif ( ! empty( $spec['registry'] ) ) {
			$out['registry'] = $spec['registry'];
		} elseif ( ! empty( $spec['ریجیستری'] ) ) {
			$out['registry'] = $spec['ریجیستری'];
		} elseif ( ! empty( $spec['ریجستری'] ) ) {
			$out['registry'] = $spec['ریجستری'];
		}

		foreach ( array( 'گارانتی', 'guarantee', 'warranty', 'garanty', 'گارانتی محصول', 'ضمانت' ) as $gkey ) {
			if ( ! empty( $spec[ $gkey ] ) ) {
				$out['guarantee'] = $spec[ $gkey ];
			}
		}

		if ( ! array_key_exists( 'شناسه کالا', $spec ) ) {
			$sku = $product->get_sku();
			if ( $sku ) {
				$spec['شناسه کالا'] = $sku;
			}
		}

		$out['spec'] = count( $spec ) > 0 ? array( $spec ) : array();

		return $out;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_price( array $map, $price ) {
		WNC_Logger::info( 'Emalls price sync is feed-based; no remote push.', 'emalls', 'price', array( 'map' => $map, 'price' => $price ) );
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_stock( array $map, $qty ) {
		WNC_Logger::info( 'Emalls stock sync is feed-based; no remote push.', 'emalls', 'stock', array( 'map' => $map, 'qty' => $qty ) );
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function pull_orders( array $args ) {
		WNC_Logger::info( 'Emalls has no seller orders to pull.', 'emalls', 'orders' );
		return array();
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_order( $remote_id ) {
		return new WP_Error( 'wnc_em_orders', __( 'ایمالز موتور مقایسه قیمت است و سفارش فروشنده ندارد.', 'webinaconnector' ) );
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
