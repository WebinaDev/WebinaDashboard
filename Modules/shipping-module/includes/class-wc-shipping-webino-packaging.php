<?php
/**
 * Packaging-based flat rate from selected postal boxes.
 *
 * Loaded only on woocommerce_shipping_init (WC_Shipping_Method available).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'WC_Shipping_Webino_Packaging', false ) ) {
	return;
}

/**
 * WC shipping method: Iran Post carton packaging.
 */
class WC_Shipping_Webino_Packaging extends WC_Shipping_Method {

	/**
	 * @param int $instance_id Instance ID.
	 */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'webino_packaging';
		$this->instance_id        = absint( $instance_id );
		$this->method_title       = __( 'Webino packaging (Iran Post boxes)', 'webino-dashboard' );
		$this->method_description = __( 'Calculates shipping from selected Iran Post carton sizes and their configured prices.', 'webino-dashboard' );
		$this->supports           = array(
			'shipping-zones',
			'instance-settings',
			'instance-settings-modal',
		);
		$this->init();
	}

	/**
	 * @return void
	 */
	public function init() {
		$this->init_form_fields();
		$this->init_settings();
		$this->title   = $this->get_option( 'title', __( 'Postal packaging', 'webino-dashboard' ) );
		$this->enabled = $this->get_option( 'enabled', 'yes' );
		add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
	}

	/**
	 * @return void
	 */
	public function init_form_fields() {
		$this->instance_form_fields = array(
			'title' => array(
				'title'       => __( 'Title', 'woocommerce' ),
				'type'        => 'text',
				'description' => __( 'Shown to customers at checkout.', 'webino-dashboard' ),
				'default'     => __( 'Postal packaging', 'webino-dashboard' ),
				'desc_tip'    => true,
			),
		);
	}

	/**
	 * @param array<string, mixed> $package Package.
	 * @return void
	 */
	public function calculate_shipping( $package = array() ) {
		$contents = isset( $package['contents'] ) && is_array( $package['contents'] ) ? $package['contents'] : array();
		$plan     = Webino_Shipping_Packer::pack_from_package_contents( $contents );

		if ( function_exists( 'WC' ) && WC()->session ) {
			WC()->session->set( 'webino_packaging_plan', $plan );
		}

		$cost = 0.0;
		if ( ! empty( $plan['add_to_checkout'] ) ) {
			$cost = isset( $plan['total_packaging_cost'] ) ? (float) $plan['total_packaging_cost'] : 0.0;
		}

		$label = $this->title;
		if ( ! empty( $plan['box_count'] ) ) {
			$label .= ' (' . sprintf(
				/* translators: %d: number of boxes */
				_n( '%d box', '%d boxes', (int) $plan['box_count'], 'webino-dashboard' ),
				(int) $plan['box_count']
			) . ')';
		}

		$this->add_rate(
			array(
				'id'        => $this->get_rate_id(),
				'label'     => $label,
				'cost'      => $cost,
				'package'   => $package,
				'meta_data' => array(
					'webino_packaging_plan' => wp_json_encode( $plan ),
				),
			)
		);
	}
}
