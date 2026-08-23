<?php
/**
 * SnappPay Search (SearchWise) platform adapter — product feed (not order marketplace).
 *
 * Parity with official Searchwise plugin 1.0.2 product formatting.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * SnappPay Search adapter.
 */
class WNC_SnappPay_Search_Adapter implements WNC_Platform {

	const AUTH_URL       = 'https://merchants.searchwise.ir/api/v1/feed/validate-token';
	const PLUGIN_VERSION = '1.0.2';

	/**
	 * {@inheritdoc}
	 */
	public function id() {
		return 'snapppay-search';
	}

	/**
	 * {@inheritdoc}
	 */
	public function label() {
		return __( 'اسنپ‌پی سرچ', 'webinaconnector' );
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
		$p = WNC_Settings::get_platform( 'snapppay-search' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		return wp_parse_args(
			$c,
			array(
				'per_page' => 100,
				'version'  => self::PLUGIN_VERSION,
			)
		);
	}

	/**
	 * Merchant domain for SearchWise auth (host only).
	 *
	 * @return string
	 */
	public static function merchant_domain() {
		$site_url = wp_parse_url( get_site_url() );
		if ( is_array( $site_url ) && ! empty( $site_url['host'] ) ) {
			return (string) $site_url['host'];
		}
		$host = wp_parse_url( site_url(), PHP_URL_HOST );
		return is_string( $host ) ? $host : '';
	}

	/**
	 * Validate crawler API key with SearchWise (official form POST).
	 *
	 * @param string $api_key API key from x-api-key header.
	 * @param string $version Plugin version reported to SearchWise.
	 * @return array|WP_Error Decoded JSON body or error.
	 */
	public static function verify_api_key( $api_key, $version = self::PLUGIN_VERSION ) {
		$response = wp_safe_remote_post(
			self::AUTH_URL,
			array(
				'method'  => 'POST',
				'timeout' => 5,
				'body'    => array(
					'merchant_domain' => self::merchant_domain(),
					'api_key'         => $api_key,
					'plugin_version'  => (string) $version,
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body = wp_remote_retrieve_body( $response );
		return json_decode( $body, true );
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		$res = wp_remote_post(
			self::AUTH_URL,
			array(
				'timeout' => 12,
				'body'    => array(
					'merchant_domain' => self::merchant_domain(),
					'api_key'         => 'wnc-connectivity-probe',
					'plugin_version'  => self::PLUGIN_VERSION,
				),
			)
		);
		if ( is_wp_error( $res ) ) {
			return new WP_Error( 'wnc_sps_auth', __( 'خطا در ارتباط با وب‌سرویس احراز هویت اسنپ‌پی سرچ.', 'webinaconnector' ), $res->get_error_data() );
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		if ( $code < 100 ) {
			return new WP_Error( 'wnc_sps_auth', __( 'پاسخ نامعتبر از وب‌سرویس اسنپ‌پی سرچ.', 'webinaconnector' ) );
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
			$payload = self::format_product_data( $product, false );
			$out[]   = array(
				'id'         => (string) $product->get_id(),
				'variant_id' => '',
				'title'      => $product->get_name(),
				'price'      => (int) round( (float) ( $payload->sale_price ?: $payload->regular_price ) ),
				'stock'      => WNC_Pricing::get_stock_qty( $product->get_id() ),
				'raw'        => $payload,
			);
		}
		return $out;
	}

	/**
	 * Format product like official Searchwise 1.0.2.
	 *
	 * @param WC_Product $product Product.
	 * @param bool       $include_content Include post_content.
	 * @return \stdClass
	 */
	public static function format_product_data( $product, $include_content = false ) {
		$formatted_product        = new \stdClass();
		$formatted_product->id    = $product->get_id();
		$formatted_product->slug  = $product->get_slug();
		$formatted_product->title = $product->get_name();

		if ( $include_content ) {
			$post = get_post( $product->get_id() );
			$formatted_product->content = $post ? $post->post_content : '';
		}

		$price_product_id = $product->get_id();
		$is_variable      = $product->is_type( 'variable' );

		if ( $is_variable ) {
			$available_variations = $product->get_available_variations();
			$found_available_price = false;

			if ( ! empty( $available_variations ) ) {
				foreach ( $available_variations as $variation_data ) {
					if ( isset( $variation_data['is_in_stock'] ) && $variation_data['is_in_stock'] ) {
						$variation_obj = wc_get_product( $variation_data['variation_id'] );
						if ( $variation_obj ) {
							$formatted_product->regular_price = floatval( $variation_obj->get_regular_price() );
							$formatted_product->sale_price    = floatval( $variation_obj->get_sale_price() );
							$price_product_id                 = $variation_obj->get_id();
							$found_available_price            = true;
							break;
						}
					}
				}
			}

			if ( ! $found_available_price ) {
				// Official computes these but omits assignment; assign so feed stays usable.
				$formatted_product->regular_price = floatval( $product->get_variation_regular_price( 'min' ) );
				$formatted_product->sale_price    = floatval( $product->get_variation_sale_price( 'min' ) );
			}
		} else {
			$formatted_product->regular_price = floatval( $product->get_regular_price() );
			$formatted_product->sale_price    = floatval( $product->get_sale_price() );
		}

		self::overlay_wfcp_prices( $formatted_product, $price_product_id );

		$formatted_product->availability      = $product->get_stock_status();
		$formatted_product->category          = wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) );
		if ( is_wp_error( $formatted_product->category ) ) {
			$formatted_product->category = array();
		}
		$formatted_product->image_link        = self::get_product_images( $product );
		$formatted_product->link              = get_permalink( $product->get_id() );
		$formatted_product->short_description = $product->get_short_description();
		$formatted_product->description       = self::get_product_attributes( $product );
		$formatted_product->shipping_cost     = floatval( get_post_meta( $product->get_id(), '_shipping_cost', true ) );
		$formatted_product->delivery_time     = intval( get_post_meta( $product->get_id(), '_delivery_days', true ) );
		$formatted_product->brand             = self::get_product_brand( $product );

		return $formatted_product;
	}

	/**
	 * Overlay WFCP snapppay-search price onto sale_price (keep field names).
	 *
	 * @param \stdClass $formatted_product Product payload.
	 * @param int       $product_id Product or variation ID used for pricing.
	 */
	private static function overlay_wfcp_prices( $formatted_product, $product_id ) {
		if ( ! class_exists( 'WNC_Pricing' ) ) {
			return;
		}
		$wfcp = (float) WNC_Pricing::get_price( (int) $product_id, 'snapppay-search' );
		if ( $wfcp <= 0 ) {
			return;
		}
		$formatted_product->sale_price = $wfcp;
		if ( empty( $formatted_product->regular_price ) || (float) $formatted_product->regular_price <= 0 ) {
			$formatted_product->regular_price = $wfcp;
		}
	}

	/**
	 * Product attributes as key/value object (official shape).
	 *
	 * @param WC_Product $product Product.
	 * @return \stdClass
	 */
	private static function get_product_attributes( $product ) {
		$formatted_attributes = array();
		$wc_attributes        = $product->get_attributes();

		if ( empty( $wc_attributes ) ) {
			return (object) $formatted_attributes;
		}

		foreach ( $wc_attributes as $attribute ) {
			if ( is_object( $attribute ) && method_exists( $attribute, 'get_variation' ) && $attribute->get_variation() ) {
				continue;
			}

			$name    = is_object( $attribute ) ? wc_attribute_label( $attribute->get_name() ) : '';
			$options = array();

			if ( is_object( $attribute ) && $attribute->is_taxonomy() ) {
				$terms = $attribute->get_terms();
				if ( $terms ) {
					foreach ( $terms as $term ) {
						$options[] = $term->name;
					}
				}
			} elseif ( is_object( $attribute ) ) {
				$options = $attribute->get_options();
			}

			if ( empty( $options ) ) {
				continue;
			}

			$formatted_attributes[ $name ] = count( $options ) === 1 ? $options[0] : $options;
		}

		return (object) $formatted_attributes;
	}

	/**
	 * Brand from pa_brand or _brand meta.
	 *
	 * @param WC_Product $product Product.
	 * @return string
	 */
	private static function get_product_brand( $product ) {
		$terms = wp_get_post_terms( $product->get_id(), 'pa_brand', array( 'fields' => 'names' ) );

		if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
			return $terms[0];
		}
		return (string) get_post_meta( $product->get_id(), '_brand', true );
	}

	/**
	 * Featured + gallery image URLs.
	 *
	 * @param WC_Product $product Product.
	 * @return array
	 */
	private static function get_product_images( $product ) {
		$images = array();

		$featured_image_id = $product->get_image_id();
		if ( $featured_image_id ) {
			$image_url = wp_get_attachment_image_src( $featured_image_id, 'full' );
			if ( $image_url ) {
				$images[] = esc_url_raw( $image_url[0] );
			}
		}

		foreach ( $product->get_gallery_image_ids() as $id ) {
			if ( (int) $id === (int) $featured_image_id ) {
				continue;
			}
			$image_url = wp_get_attachment_image_src( $id, 'full' );
			if ( $image_url ) {
				$images[] = esc_url_raw( $image_url[0] );
			}
		}

		return $images;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_price( array $map, $price ) {
		WNC_Logger::info( 'SnappPay Search price sync is feed-based; no remote push.', 'snapppay-search', 'price', array( 'map' => $map, 'price' => $price ) );
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_stock( array $map, $qty ) {
		WNC_Logger::info( 'SnappPay Search stock sync is feed-based; no remote push.', 'snapppay-search', 'stock', array( 'map' => $map, 'qty' => $qty ) );
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function pull_orders( array $args ) {
		WNC_Logger::info( 'SnappPay Search has no seller orders to pull.', 'snapppay-search', 'orders' );
		return array();
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_order( $remote_id ) {
		return new WP_Error( 'wnc_sps_orders', __( 'اسنپ‌پی سرچ موتور جستجو است و سفارش فروشنده ندارد.', 'webinaconnector' ) );
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
