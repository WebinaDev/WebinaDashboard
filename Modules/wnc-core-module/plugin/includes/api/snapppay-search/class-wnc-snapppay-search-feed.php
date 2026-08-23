<?php
/**
 * SnappPay Search (SearchWise) crawl feed — parity with official plugin 1.0.2.
 *
 * Route: POST /wp-json/v1/product/feed (x-api-key).
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * REST feed for SnappPay Search crawler.
 */
class WNC_SnappPay_Search_Feed {

	/**
	 * Register hooks.
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ), 20 );
	}

	/**
	 * Register or override v1/product/feed.
	 */
	public static function register_routes() {
		register_rest_route(
			'v1',
			'/product/feed',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle_product_request' ),
				'permission_callback' => array( __CLASS__, 'permission_check' ),
			),
			true
		);
	}

	/**
	 * Auth like official Searchwise (permission_callback).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return true|WP_Error
	 */
	public static function permission_check( $request ) {
		$settings = WNC_Settings::get_platform( 'snapppay-search' );
		if ( empty( $settings['enabled'] ) ) {
			return new WP_Error(
				'wnc_sps_disabled',
				__( 'پلتفرم اسنپ‌پی سرچ در WebinaConnector غیرفعال است.', 'webinaconnector' ),
				array( 'status' => 403 )
			);
		}

		$auth_response = self::has_access( $request );
		if ( is_wp_error( $auth_response ) ) {
			return new WP_Error( 'error', 'Authentication server could not be reached.', array( 'status' => 503 ) );
		}
		if ( ! isset( $auth_response['success'] ) || true !== $auth_response['success'] ) {
			return new WP_Error(
				'rest_forbidden',
				'Invalid API Key.',
				array( 'status' => 401 )
			);
		}

		return true;
	}

	/**
	 * Validate x-api-key via SearchWise merchants API.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return array|WP_Error
	 */
	private static function has_access( $request ) {
		$c       = WNC_Settings::get_platform( 'snapppay-search' );
		$creds   = isset( $c['credentials'] ) && is_array( $c['credentials'] ) ? $c['credentials'] : array();
		$version = (string) ( $creds['version'] ?? WNC_SnappPay_Search_Adapter::PLUGIN_VERSION );
		$api_key = $request->get_header( 'x_api_key' );

		return WNC_SnappPay_Search_Adapter::verify_api_key( $api_key, $version );
	}

	/**
	 * Main handler — official handle_product_request shape.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function handle_product_request( $request ) {
		$limit           = intval( $request->get_param( 'limit' ) ?: 100 );
		$page            = intval( $request->get_param( 'page' ) ?: 1 );
		$id_string       = $request->get_param( 'products' );
		$product_ids     = ! empty( $id_string ) ? array_map( 'absint', explode( ',', $id_string ) ) : array();
		$slug_string     = $request->get_param( 'slugs' );
		$slug_list       = ! empty( $slug_string ) ? array_map( 'sanitize_title', explode( ',', $slug_string ) ) : array();
		$include_content = rest_sanitize_boolean( $request->get_param( 'include_content' ) );

		if ( ! empty( $product_ids ) ) {
			$data = self::get_products_by_ids( $product_ids, $include_content );
		} elseif ( ! empty( $slug_list ) ) {
			$data = self::get_products_by_slugs( $slug_list, $include_content );
		} else {
			$data = self::get_all_products( $limit, $page, $include_content );
		}

		global $wp_version;
		$c       = WNC_Settings::get_platform( 'snapppay-search' );
		$creds   = isset( $c['credentials'] ) && is_array( $c['credentials'] ) ? $c['credentials'] : array();
		$version = (string) ( $creds['version'] ?? WNC_SnappPay_Search_Adapter::PLUGIN_VERSION );

		$data['plugin_version'] = $version;
		$data['wc_version']     = defined( 'WC_VERSION' ) ? WC_VERSION : 'not_installed';
		$data['wp_version']     = $wp_version;

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * Paginated publish products.
	 *
	 * @param int  $limit Limit.
	 * @param int  $page Page.
	 * @param bool $include_content Include content.
	 * @return array
	 */
	private static function get_all_products( $limit, $page, $include_content ) {
		$query = new WP_Query(
			array(
				'posts_per_page' => $limit,
				'paged'          => $page,
				'post_status'    => 'publish',
				'orderby'        => 'ID',
				'order'          => 'DESC',
				'post_type'      => 'product',
			)
		);

		$data = array(
			'count'     => $query->found_posts,
			'max_pages' => $query->max_num_pages,
			'products'  => array(),
		);

		foreach ( $query->posts as $post ) {
			$product = wc_get_product( $post->ID );
			if ( ! $product ) {
				continue;
			}
			$data['products'][] = WNC_SnappPay_Search_Adapter::format_product_data( $product, $include_content );
		}

		return $data;
	}

	/**
	 * Products by IDs.
	 *
	 * @param array $product_ids IDs.
	 * @param bool  $include_content Include content.
	 * @return array
	 */
	private static function get_products_by_ids( $product_ids, $include_content ) {
		$data = array( 'products' => array() );

		foreach ( $product_ids as $id ) {
			$id      = intval( $id );
			$product = wc_get_product( $id );
			if ( $product && 'publish' === $product->get_status() ) {
				$data['products'][] = WNC_SnappPay_Search_Adapter::format_product_data( $product, $include_content );
			}
		}

		return $data;
	}

	/**
	 * Products by slugs.
	 *
	 * @param array $slug_list Slugs.
	 * @param bool  $include_content Include content.
	 * @return array
	 */
	private static function get_products_by_slugs( $slug_list, $include_content ) {
		$data = array( 'products' => array() );

		foreach ( $slug_list as $slug ) {
			$product_post = get_page_by_path( $slug, OBJECT, 'product' );
			if ( $product_post && 'publish' === $product_post->post_status ) {
				$data['products'][] = WNC_SnappPay_Search_Adapter::format_product_data( wc_get_product( $product_post->ID ), $include_content );
			}
		}

		return $data;
	}
}
