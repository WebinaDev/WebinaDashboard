<?php
/**
 * Zarehbin platform adapter — price-comparison feed (not order marketplace).
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Zarehbin adapter.
 */
class WNC_Zarehbin_Adapter implements WNC_Platform {

	const AUTH_URL = 'https://www.zarehbin.com/bots/api/auth';

	/**
	 * {@inheritdoc}
	 */
	public function id() {
		return 'zarehbin';
	}

	/**
	 * {@inheritdoc}
	 */
	public function label() {
		return __( 'ذره‌بین', 'webinaconnector' );
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
		$p = WNC_Settings::get_platform( 'zarehbin' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		return wp_parse_args(
			$c,
			array(
				'per_page' => 50,
				'version'  => '1.0.0',
			)
		);
	}

	/**
	 * Site domain for auth (no protocol / www).
	 *
	 * @return string
	 */
	public static function site_domain() {
		// Official plugin: strip protocol + www from site_url() string.
		return str_replace( array( 'https://', 'http://', 'www.' ), '', (string) site_url() );
	}

	/**
	 * Verify Bearer token with Zarehbin auth API (JSON body, official 1.0.0).
	 *
	 * @param string $token Token.
	 * @param string $version Plugin/API version string.
	 * @return true|WP_Error
	 */
	public static function verify_token( $token, $version = '1.0.0' ) {
		$token = trim( (string) $token );
		if ( '' === $token ) {
			return new WP_Error( 'wnc_zb_auth', __( 'توکن ذره‌بین خالی است.', 'webinaconnector' ) );
		}

		$res = WNC_HTTP::request(
			'POST',
			self::AUTH_URL,
			array(
				'timeout' => 12,
				'body'    => array(
					'token'   => $token,
					'domain'  => self::site_domain(),
					'version' => (string) $version,
				),
			)
		);

		if ( is_wp_error( $res ) ) {
			return new WP_Error( 'wnc_zb_auth', __( 'خطا در ارتباط با وب‌سرویس احراز هویت ذره‌بین.', 'webinaconnector' ), $res->get_error_data() );
		}

		$status  = (int) ( $res['status'] ?? 0 );
		$success = ! empty( $res['success'] );
		if ( 200 === $status && $success ) {
			return true;
		}

		$err = isset( $res['error'] ) && null !== $res['error'] && '' !== $res['error']
			? (string) $res['error']
			: __( 'درخواست غیرمجاز است.', 'webinaconnector' );
		return new WP_Error( 'wnc_zb_auth', $err, array( 'response' => $res ) );
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		// Crawl auth is crawler-supplied; test only that the auth host is reachable.
		$c       = $this->credentials();
		$version = (string) ( $c['version'] ?? '1.0.0' );
		$res     = wp_remote_post(
			self::AUTH_URL,
			array(
				'timeout' => 12,
				'body'    => array(
					'token'   => 'wnc-connectivity-probe',
					'domain'  => self::site_domain(),
					'version' => $version,
				),
			)
		);
		if ( is_wp_error( $res ) ) {
			return new WP_Error( 'wnc_zb_auth', __( 'خطا در ارتباط با وب‌سرویس احراز هویت ذره‌بین.', 'webinaconnector' ), $res->get_error_data() );
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		if ( $code < 100 ) {
			return new WP_Error( 'wnc_zb_auth', __( 'پاسخ نامعتبر از وب‌سرویس ذره‌بین.', 'webinaconnector' ) );
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
			$price = (int) round( WNC_Pricing::get_price( $product->get_id(), 'zarehbin' ) );
			$out[] = array(
				'id'         => (string) $product->get_id(),
				'variant_id' => '',
				'title'      => $product->get_name(),
				'price'      => $price,
				'stock'      => WNC_Pricing::get_stock_qty( $product->get_id() ),
				'raw'        => self::build_product_payload( $product ),
			);
		}
		return $out;
	}

	/**
	 * Build official-plugin-compatible product array (Zarehbin 1.0.0 + WFCP overlay).
	 *
	 * @param WC_Product $product Product.
	 * @return array
	 */
	public static function build_product_payload( $product ) {
		$prices = self::get_product_prices( $product );

		$images = array();
		if ( $product->get_image_id() ) {
			$url = wp_get_attachment_url( $product->get_image_id() );
			if ( $url ) {
				$images[] = $url;
			}
		}
		foreach ( $product->get_gallery_image_ids() as $gid ) {
			$url = wp_get_attachment_url( $gid );
			if ( $url ) {
				$images[] = $url;
			}
		}

		$cat_list   = function_exists( 'wc_get_product_category_list' )
			? (string) wc_get_product_category_list( $product->get_id() )
			: '';
		$categories = array_values(
			array_filter(
				array_map( 'trim', explode( ',', sanitize_text_field( wp_strip_all_tags( $cat_list ) ) ) )
			)
		);

		$attributes = array();
		foreach ( $product->get_attributes() as $attr => $attr_deets ) {
			$attribute_label = wc_attribute_label( $attr );
			$attrs_map       = $product->get_attributes();
			$attribute       = $attr_deets ?? ( $attrs_map[ 'pa_' . $attr ] ?? null );
			if ( ! $attribute ) {
				continue;
			}
			if ( is_object( $attribute ) ) {
				if ( $attribute->is_taxonomy() ) {
					$names = wc_get_product_terms( $product->get_id(), $attribute->get_name(), array( 'fields' => 'names' ) );
					$value = is_array( $names ) ? implode( ', ', $names ) : '';
				} else {
					$value = implode( ', ', $attribute->get_options() );
				}
			} elseif ( is_array( $attribute ) ) {
				if ( ! empty( $attribute['is_taxonomy'] ) ) {
					$names = wc_get_product_terms( $product->get_id(), $attribute['name'], array( 'fields' => 'names' ) );
					$value = is_array( $names ) ? implode( ', ', $names ) : '';
				} else {
					$value = (string) ( $attribute['value'] ?? '' );
				}
			} else {
				continue;
			}
			$attributes[] = array(
				'title' => $attribute_label,
				'value' => $value,
			);
		}

		return array(
			'id'            => $product->get_id(),
			'sku'           => (string) $product->get_sku(),
			'title'         => $product->get_title(),
			'stock'         => $prices['stock'],
			'regular_price' => $prices['regular_price'],
			'sale_price'    => $prices['sale_price'],
			'categories'    => $categories,
			'images'        => $images,
			'url'           => $product->get_permalink(),
			'attributes'    => $attributes,
		);
	}

	/**
	 * Official getProductPrice shape + WFCP current-price overlay.
	 *
	 * @param WC_Product $product Product.
	 * @return array{regular_price:int,sale_price:int,stock:string}
	 */
	private static function get_product_prices( $product ) {
		if ( $product->is_type( 'variable' ) ) {
			$regular_price = 0;
			$sale_price    = 0;
			$stock         = 'outofstock';
			$variation_map = $product->get_variation_prices();
			$prices        = isset( $variation_map['price'] ) && is_array( $variation_map['price'] ) ? $variation_map['price'] : array();
			foreach ( $prices as $variation_id => $price ) {
				$child = wc_get_product( $variation_id );
				if ( ! $child || 'instock' !== $child->get_stock_status() ) {
					continue;
				}
				$child_sale = self::wc_sale_or_regular( $child );
				$child_sale = self::overlay_wfcp_price( $child->get_id(), $child_sale );
				if ( 0 === $sale_price || $child_sale < $sale_price ) {
					$regular_price = (int) $child->get_regular_price();
					$sale_price    = $child_sale;
					$stock         = $product->get_stock_status();
					if ( 'instock' !== $stock ) {
						$stock = 'instock';
					}
				}
			}
			if ( $sale_price > 0 && $regular_price <= 0 ) {
				$regular_price = $sale_price;
			}
			return array(
				'regular_price' => (int) $regular_price,
				'sale_price'    => (int) $sale_price,
				'stock'         => $stock,
			);
		}

		$regular = (int) $product->get_regular_price();
		$sale    = self::wc_sale_or_regular( $product );
		$sale    = self::overlay_wfcp_price( $product->get_id(), $sale );
		if ( $regular <= 0 ) {
			$regular = $sale;
		}

		return array(
			'regular_price' => $regular,
			'sale_price'    => $sale,
			'stock'         => $product->get_stock_status(),
		);
	}

	/**
	 * @param WC_Product $product Product.
	 * @return int
	 */
	private static function wc_sale_or_regular( $product ) {
		$sale = $product->get_sale_price();
		if ( '' === $sale || null === $sale ) {
			return (int) $product->get_regular_price();
		}
		return (int) $sale;
	}

	/**
	 * Prefer WFCP platform price when set (Webina overlay on official shape).
	 *
	 * @param int $product_id Product or variation ID.
	 * @param int $fallback Fallback price.
	 * @return int
	 */
	private static function overlay_wfcp_price( $product_id, $fallback ) {
		if ( ! class_exists( 'WNC_Pricing' ) ) {
			return (int) $fallback;
		}
		$wfcp = (int) round( (float) WNC_Pricing::get_price( $product_id, 'zarehbin' ) );
		return $wfcp > 0 ? $wfcp : (int) $fallback;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_price( array $map, $price ) {
		WNC_Logger::info( 'Zarehbin price sync is feed-based; no remote push.', 'zarehbin', 'price', array( 'map' => $map, 'price' => $price ) );
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_stock( array $map, $qty ) {
		WNC_Logger::info( 'Zarehbin stock sync is feed-based; no remote push.', 'zarehbin', 'stock', array( 'map' => $map, 'qty' => $qty ) );
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function pull_orders( array $args ) {
		WNC_Logger::info( 'Zarehbin has no seller orders to pull.', 'zarehbin', 'orders' );
		return array();
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_order( $remote_id ) {
		return new WP_Error( 'wnc_zb_orders', __( 'ذره‌بین موتور مقایسه قیمت است و سفارش فروشنده ندارد.', 'webinaconnector' ) );
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
