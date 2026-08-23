<?php
/**
 * Zarehbin crawl feed — compatible with official plugin REST contract.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * REST feed for Zarehbin crawler.
 */
class WNC_Zarehbin_Feed {

	/**
	 * Register hooks.
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ), 20 );
	}

	/**
	 * Register or override zarehbin/v1/products.
	 */
	public static function register_routes() {
		$settings = WNC_Settings::get_platform( 'zarehbin' );
		if ( empty( $settings['enabled'] ) ) {
			// Still register so crawler gets a clear disabled response when enabled later;
			// permission/handler check enabled flag.
		}

		register_rest_route(
			'zarehbin/v1',
			'/products',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle_products' ),
				'permission_callback' => '__return_true',
				'args'                => array(),
			),
			true
		);
	}

	/**
	 * Handle product list request.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function handle_products( $request ) {
		$settings = WNC_Settings::get_platform( 'zarehbin' );
		if ( empty( $settings['enabled'] ) ) {
			return new WP_Error( 'wnc_zb_disabled', __( 'پلتفرم ذره‌بین در WebinaConnector غیرفعال است.', 'webinaconnector' ), array( 'status' => 403 ) );
		}

		$creds = WNC_Settings::get_platform( 'zarehbin' );
		$c     = isset( $creds['credentials'] ) && is_array( $creds['credentials'] ) ? $creds['credentials'] : array();
		$version = (string) ( $c['version'] ?? '1.0.0' );

		$auth_header = (string) $request->get_header( 'authorization' );
		$token       = trim( str_ireplace( 'Bearer ', '', $auth_header ) );
		$verify      = WNC_Zarehbin_Adapter::verify_token( $token, $version );
		if ( is_wp_error( $verify ) ) {
			return new WP_Error( 'authorization_error', $verify->get_error_message(), array( 'status' => 403 ) );
		}

		$product_id     = (int) $request->get_param( 'product_id' );
		$page_id        = (int) $request->get_param( 'page' );
		$posts_per_page = (int) $request->get_param( 'count' );
		if ( $page_id <= 0 ) {
			$page_id = 1;
		}
		if ( $posts_per_page <= 0 ) {
			$posts_per_page = ! empty( $c['per_page'] ) ? max( 1, (int) $c['per_page'] ) : 50;
		}

		$products = array();
		$count    = 0;
		$total_page = 1;

		if ( $product_id > 0 ) {
			$product = wc_get_product( $product_id );
			if ( ! $product || 'publish' !== get_post_status( $product_id ) ) {
				return array(
					'code'    => 'success',
					'message' => 'درخواست موفق بود',
					'data'    => array(
						'status'       => 200,
						'count'        => 0,
						'current_page' => 1,
						'total_page'   => 1,
						'products'     => array(),
					),
				);
			}
			$products   = array( WNC_Zarehbin_Adapter::build_product_payload( $product ) );
			$count      = 1;
			$total_page = 1;
		} else {
			$count_q = new WP_Query(
				array(
					'post_type'      => 'product',
					'post_status'    => 'publish',
					'posts_per_page' => 1,
					'fields'         => 'ids',
				)
			);
			$count      = (int) $count_q->found_posts;
			$total_page = max( 1, (int) ceil( $count / $posts_per_page ) );

			$posts = get_posts(
				array(
					'post_type'      => 'product',
					'post_status'    => 'publish',
					'posts_per_page' => $posts_per_page,
					'offset'         => ( $page_id * $posts_per_page ) - $posts_per_page,
				)
			);
			foreach ( $posts as $post ) {
				$product = wc_get_product( $post->ID );
				if ( $product ) {
					$products[] = WNC_Zarehbin_Adapter::build_product_payload( $product );
				}
			}
		}

		return array(
			'code'    => 'success',
			'message' => 'درخواست موفق بود',
			'data'    => array(
				'status'       => 200,
				'count'        => $count,
				'current_page' => $page_id,
				'total_page'   => $total_page,
				'products'     => $products,
			),
		);
	}
}
