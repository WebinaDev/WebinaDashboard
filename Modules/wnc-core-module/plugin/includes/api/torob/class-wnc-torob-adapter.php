<?php
/**
 * Torob platform adapter — price-comparison + official Torob API parity.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Torob adapter.
 */
class WNC_Torob_Adapter implements WNC_Platform {

	/**
	 * {@inheritdoc}
	 */
	public function id() {
		return 'torob';
	}

	/**
	 * {@inheritdoc}
	 */
	public function label() {
		return __( 'ترب', 'webinaconnector' );
	}

	/**
	 * {@inheritdoc}
	 */
	public function is_live() {
		return true;
	}

	/**
	 * Credentials / feature flags stored under platform settings.
	 *
	 * @return array
	 */
	public function credentials() {
		$p = WNC_Settings::get_platform( 'torob' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		return wp_parse_args(
			$c,
			array(
				'per_page'                  => 50,
				'order_status_enabled'      => true,
				'orders_list_api_enabled'   => true,
				'product_page_webhook_enabled' => true,
			)
		);
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		$extractor = WNC_Torob_HTTP::check_extractor_health();
		$backend   = WNC_Torob_HTTP::check_backend_health();
		if ( $extractor->is_successful() && $backend->is_successful() ) {
			return true;
		}
		$parts = array();
		if ( ! $extractor->is_successful() ) {
			$parts[] = 'extractor.torob.com';
		}
		if ( ! $backend->is_successful() ) {
			$parts[] = 'api.torob.com';
		}
		return new WP_Error(
			'wnc_torob_conn',
			sprintf(
				/* translators: %s: service hostnames */
				__( 'ارتباط با سرویس‌های ترب برقرار نشد: %s', 'webinaconnector' ),
				implode( ', ', $parts )
			)
		);
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
		$feed = new WNC_Torob_Feed();
		foreach ( $q->posts as $post ) {
			$product = wc_get_product( $post->ID );
			if ( ! $product ) {
				continue;
			}
			$payload = $feed->get_product_values( $product );
			$out[]   = array(
				'id'         => (string) $product->get_id(),
				'variant_id' => '',
				'title'      => $product->get_name(),
				'price'      => (int) round( (float) ( $payload->current_price ?? 0 ) ),
				'stock'      => WNC_Pricing::get_stock_qty( $product->get_id() ),
				'raw'        => $payload,
			);
		}
		return $out;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_price( array $map, $price ) {
		WNC_Logger::info( 'Torob price sync is feed-based; no remote push.', 'torob', 'price', array( 'map' => $map, 'price' => $price ) );
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_stock( array $map, $qty ) {
		WNC_Logger::info( 'Torob stock sync is feed-based; no remote push.', 'torob', 'stock', array( 'map' => $map, 'qty' => $qty ) );
		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function pull_orders( array $args ) {
		WNC_Logger::info( 'Torob has no seller marketplace orders to pull.', 'torob', 'orders' );
		return array();
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_order( $remote_id ) {
		return new WP_Error( 'wnc_torob_orders', __( 'ترب موتور مقایسه قیمت است؛ سفارش فروشنده از طریق API ترب قابل pull نیست.', 'webinaconnector' ) );
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
