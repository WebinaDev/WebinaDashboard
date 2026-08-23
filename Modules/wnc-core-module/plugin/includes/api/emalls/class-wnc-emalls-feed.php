<?php
/**
 * Emalls crawl feed — compatible with official Emalls Extraction API 1.3.0.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * REST feed for Emalls crawler.
 */
class WNC_Emalls_Feed {

	/**
	 * Register hooks.
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ), 20 );
	}

	/**
	 * Register or override emalls_ext/v1/products.
	 */
	public static function register_routes() {
		register_rest_route(
			'emalls_ext/v1',
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
	 * Metadata block matching official plugin.
	 *
	 * @param string $version Version.
	 * @return array
	 */
	private static function metadata( $version ) {
		$wc_ver = null;
		if ( defined( 'WC_VERSION' ) ) {
			$wc_ver = WC_VERSION;
		} elseif ( function_exists( 'WC' ) && WC() && isset( WC()->version ) ) {
			$wc_ver = WC()->version;
		}
		$sodium = null;
		if ( defined( 'SODIUM_LIBRARY_VERSION' ) ) {
			$sodium = SODIUM_LIBRARY_VERSION;
		}
		return array(
			'wordpress_version'   => get_bloginfo( 'version' ),
			'php_version'         => defined( 'PHP_VERSION' ) ? PHP_VERSION : phpversion(),
			'plugin_version'      => $version,
			'woocommerce_version' => $wc_ver,
			'libsodium_version'   => $sodium,
		);
	}

	/**
	 * Handle product list.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function handle_products( $request ) {
		$settings = WNC_Settings::get_platform( 'emalls' );
		if ( empty( $settings['enabled'] ) ) {
			return new WP_Error( 'wnc_em_disabled', __( 'پلتفرم ایمالز در WebinaConnector غیرفعال است.', 'webinaconnector' ), array( 'status' => 403 ) );
		}

		$c       = isset( $settings['credentials'] ) && is_array( $settings['credentials'] ) ? $settings['credentials'] : array();
		$version = (string) ( $c['version'] ?? '1.3.0' );

		// Official plugin reads variation but does not use it for filtering.
		rest_sanitize_boolean( $request->get_param( 'variation' ) );

		$token = sanitize_text_field( (string) $request->get_param( 'token' ) );
		// Match official 1.3.0: min(intval(limit), 100) — no forced default when omitted/0.
		$limit = min( (int) $request->get_param( 'limit' ), 100 );
		$page  = max( (int) $request->get_param( 'page' ), 1 );

		$need_request = ! WNC_Emalls_Adapter::token_cache_valid( $token );
		$need_session = false;

		if ( $need_request ) {
			$verify = WNC_Emalls_Adapter::verify_token( $token, $version );
			if ( is_wp_error( $verify ) ) {
				if ( 'wnc_em_auth_network' === $verify->get_error_code() ) {
					update_option( WNC_Emalls_Adapter::TOKEN_OPTION, '---', false );
					return new WP_REST_Response(
						array( 'Error' => $verify->get_error_message() ),
						500
					);
				}
				return new WP_REST_Response(
					array_merge(
						array( 'Error' => 'Invalid token' ),
						self::metadata( $version )
					),
					401
				);
			}
			$need_session = true;
		}

		$data = self::get_all_products( $limit, $page );
		$data['Version']           = $version;
		$data['NeedSession']       = $need_session;
		$data['TokenSendByEmalls'] = $token;
		$data['SignedBy']          = 'webinaconnector';
		$data['metadata']          = self::metadata( $version );

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * Paginated product list (product + variation), official-compatible.
	 *
	 * @param int $limit Limit.
	 * @param int $page Page.
	 * @return array
	 */
	private static function get_all_products( $limit, $page ) {
		$query = new WP_Query(
			array(
				'posts_per_page' => $limit,
				'paged'          => $page,
				'post_status'    => 'publish',
				'orderby'        => 'ID',
				'order'          => 'DESC',
				'post_type'      => array( 'product', 'product_variation' ),
			)
		);

		$products = array_filter( array_map( 'wc_get_product', $query->posts ) );

		$attachment_ids = array();
		foreach ( $products as $product ) {
			if ( ! $product instanceof WC_Product ) {
				continue;
			}
			if ( $product->get_image_id() ) {
				$attachment_ids[] = $product->get_image_id();
			}
			$attachment_ids = array_merge( $attachment_ids, $product->get_gallery_image_ids() );
		}
		$attachment_ids = array_unique( array_filter( $attachment_ids ) );
		if ( ! empty( $attachment_ids ) && function_exists( '_prime_post_caches' ) ) {
			_prime_post_caches( $attachment_ids, false, true );
		}

		$out = array(
			'count'     => (int) $query->found_posts,
			'max_pages' => (int) $query->max_num_pages,
			'products'  => array(),
		);

		foreach ( $products as $product ) {
			if ( ! $product instanceof WC_Product ) {
				continue;
			}
			$out['products'][] = WNC_Emalls_Adapter::build_product_payload( $product );
		}

		return $out;
	}
}
