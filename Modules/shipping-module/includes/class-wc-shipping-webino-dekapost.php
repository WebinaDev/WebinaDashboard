<?php
/**
 * WooCommerce shipping method: Dekapost (دکاپست) postal rate.
 *
 * Loaded only on woocommerce_shipping_init (WC_Shipping_Method available).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'WC_Shipping_Webino_Dekapost', false ) ) {
	return;
}

/**
 * WC shipping method backed by Webino_Shipping_Dekapost.
 */
class WC_Shipping_Webino_Dekapost extends WC_Shipping_Method {

	/**
	 * @param int $instance_id Instance ID.
	 */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'webino_dekapost';
		$this->instance_id        = absint( $instance_id );
		$this->method_title       = __( 'دکاپست', 'webino-dashboard' );
		$this->method_description = __( 'نرخ از جدول شهرها یا تعرفه وزنی دکاپست', 'webino-dashboard' );
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
				'title'       => __( 'تصویر روش (URL)', 'webino-dashboard' ),
				'type'        => 'text',
				'description' => __( 'آدرس تصویر برای نمایش کنار عنوان در چک‌اوت', 'webino-dashboard' ),
				'default'     => '',
			),
		);
		$this->init_settings();
		$this->title   = $this->get_option( 'title', $this->method_title );
		$this->enabled = $this->get_option( 'enabled', 'yes' );
		add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
	}

	/**
	 * @param array<string, mixed> $package Package.
	 * @return void
	 */
	public function calculate_shipping( $package = array() ) {
		if ( ! class_exists( 'Webino_Shipping_Dekapost', false ) ) {
			return;
		}
		$rate = Webino_Shipping_Dekapost::resolve_rate( $package, (int) $this->instance_id );
		if ( null === $rate ) {
			return;
		}
		$this->add_rate(
			array(
				'id'      => $this->get_rate_id(),
				'label'   => $this->title,
				'cost'    => (float) $rate['cost'],
				'package' => $package,
			)
		);
	}
}
