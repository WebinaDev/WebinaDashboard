<?php
/**
 * Flat rate from city taxonomy term meta.
 *
 * Loaded only on woocommerce_shipping_init.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'WC_Shipping_Webino_Flat_City', false ) ) {
	return;
}

/**
 * WC shipping method: per-city flat rate.
 */
class WC_Shipping_Webino_Flat_City extends WC_Shipping_Method {

	/**
	 * @param int $instance_id Instance ID.
	 */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'webino_flat_city';
		$this->instance_id        = absint( $instance_id );
		$this->method_title       = __( 'نرخ شهری وبینو', 'webino-dashboard' );
		$this->method_description = __( 'قیمت از جدول شهرها', 'webino-dashboard' );
		$this->supports           = array( 'shipping-zones', 'instance-settings', 'instance-settings-modal' );
		$this->init();
	}

	/**
	 * @return void
	 */
	public function init() {
		$this->instance_form_fields = array(
			'title'   => array(
				'title'   => __( 'Title', 'woocommerce' ),
				'type'    => 'text',
				'default' => $this->method_title,
			),
			'img_url' => array(
				'title'   => __( 'تصویر روش', 'webino-dashboard' ),
				'type'    => 'text',
				'default' => '',
			),
		);
		$this->init_settings();
		$this->title = $this->get_option( 'title', $this->method_title );
		add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
	}

	/**
	 * @param array $package Package.
	 * @return void
	 */
	public function calculate_shipping( $package = array() ) {
		$dest = isset( $package['destination'] ) ? $package['destination'] : array();
		$city = (string) ( $dest['city'] ?? '' );
		$cost = null;
		$key  = (string) $this->instance_id;
		if ( class_exists( 'Webino_Shipping_Cities', false ) && $city ) {
			$city_id = Webino_Shipping_Cities::find_term_id_by_name( $city );
			if ( $city_id ) {
				$override = Webino_Shipping_Cities::get_term_option( $city_id, $key, '' );
				if ( '' !== $override && is_numeric( $override ) ) {
					$cost = (float) $override;
				}
			}
		}
		if ( null === $cost ) {
			return;
		}
		$this->add_rate(
			array(
				'id'      => $this->get_rate_id(),
				'label'   => $this->title,
				'cost'    => $cost,
				'package' => $package,
			)
		);
	}
}
