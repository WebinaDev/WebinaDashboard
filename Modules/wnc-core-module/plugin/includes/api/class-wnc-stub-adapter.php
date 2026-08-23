<?php
/**
 * Stub platform adapter (Technolife / SnappShop until docs arrive).
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Unsupported / pending-docs platform.
 */
class WNC_Stub_Adapter implements WNC_Platform {

	/**
	 * @var string
	 */
	private $platform_id;

	/**
	 * @var string
	 */
	private $platform_label;

	/**
	 * @param string $id ID.
	 * @param string $label Label.
	 */
	public function __construct( $id, $label ) {
		$this->platform_id    = $id;
		$this->platform_label = $label;
	}

	/**
	 * {@inheritdoc}
	 */
	public function id() {
		return $this->platform_id;
	}

	/**
	 * {@inheritdoc}
	 */
	public function label() {
		return $this->platform_label;
	}

	/**
	 * {@inheritdoc}
	 */
	public function is_live() {
		return false;
	}

	/**
	 * Pending docs error.
	 *
	 * @return WP_Error
	 */
	private function pending() {
		return new WP_Error(
			'wnc_pending_docs',
			sprintf(
				/* translators: %s platform name */
				__( 'سینک زنده «%s» پس از دریافت مستندات API فعال می‌شود. نقشه محصول و قیمت‌گذاری آماده است.', 'webinaconnector' ),
				$this->platform_label
			)
		);
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		return $this->pending();
	}

	/**
	 * {@inheritdoc}
	 */
	public function search_products( array $args ) {
		return $this->pending();
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_price( array $map, $price ) {
		return $this->pending();
	}

	/**
	 * {@inheritdoc}
	 */
	public function push_stock( array $map, $qty ) {
		return $this->pending();
	}

	/**
	 * {@inheritdoc}
	 */
	public function pull_orders( array $args ) {
		return $this->pending();
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_order( $remote_id ) {
		return $this->pending();
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
