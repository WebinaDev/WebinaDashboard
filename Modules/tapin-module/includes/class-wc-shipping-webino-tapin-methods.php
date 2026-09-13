<?php
/**
 * Tapin / courier WooCommerce shipping method classes.
 *
 * Loaded only on woocommerce_shipping_init (WC_Shipping_Method available).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'WC_Shipping_Webino_Tapin_Base', false ) ) {
	return;
}

/**
 * Shared Tapin-backed shipping method.
 */
class WC_Shipping_Webino_Tapin_Base extends WC_Shipping_Method {
	/** @var string */
	protected $method_key = 'pishtaz';

	/**
	 * @param int $instance_id Instance.
	 */
	public function __construct( $instance_id = 0 ) {
		$this->instance_id = absint( $instance_id );
		$this->supports    = array( 'shipping-zones', 'instance-settings', 'instance-settings-modal' );
		$this->enabled     = 'yes';
		$this->init();
	}

	/**
	 * @return void
	 */
	public function init() {
		$this->init_form_fields();
		$this->init_settings();
		$this->title = $this->get_option( 'title', $this->method_title );
		add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
	}

	/**
	 * @return void
	 */
	public function init_form_fields() {
		$fields = array(
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
		if ( 'courier' === $this->method_key ) {
			$fields['base_cost'] = array(
				'title'   => __( 'هزینه پایه', 'webino-dashboard' ),
				'type'    => 'price',
				'default' => '',
			);
			$fields['cost_per_kg'] = array(
				'title'   => __( 'هزینه هر کیلو', 'webino-dashboard' ),
				'type'    => 'price',
				'default' => '',
			);
			$fields['delivery_areas'] = array(
				'title'       => __( 'نواحی تحویل', 'webino-dashboard' ),
				'type'        => 'textarea',
				'description' => __( 'نام شهرها با ویرگول؛ خالی = همه', 'webino-dashboard' ),
				'default'     => '',
			);
		}
		$this->instance_form_fields = $fields;
	}

	/**
	 * @param array<string, mixed> $package Package.
	 * @return void
	 */
	public function calculate_shipping( $package = array() ) {
		$cost = Webino_Tapin_Rates::calculate( $this->method_key, $package, $this );
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

/**
 * Pishtaz method.
 */
class WC_Shipping_Webino_Tapin_Pishtaz extends WC_Shipping_Webino_Tapin_Base {
	/** @param int $instance_id Instance. */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'webino_tapin_pishtaz';
		$this->method_key         = 'pishtaz';
		$this->method_title       = __( 'پیشتاز', 'webino-dashboard' );
		$this->method_description = __( 'ارسال پیشتاز', 'webino-dashboard' );
		parent::__construct( $instance_id );
	}
}

/**
 * VIP method.
 */
class WC_Shipping_Webino_Tapin_Vip extends WC_Shipping_Webino_Tapin_Base {
	/** @param int $instance_id Instance. */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'webino_tapin_vip';
		$this->method_key         = 'vip';
		$this->method_title       = __( 'پست ویژه', 'webino-dashboard' );
		$this->method_description = __( 'ارسال ویژه', 'webino-dashboard' );
		parent::__construct( $instance_id );
	}
}

/**
 * Tipax (manual) method.
 */
class WC_Shipping_Webino_Tapin_Tipax extends WC_Shipping_Webino_Tapin_Base {
	/** @param int $instance_id Instance. */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'webino_tapin_tipax';
		$this->method_key         = 'tipax';
		$this->method_title       = __( 'تیپاکس', 'webino-dashboard' );
		$this->method_description = __( 'ارسال تیپاکس (دستی)', 'webino-dashboard' );
		parent::__construct( $instance_id );
	}
}

/**
 * Courier method.
 */
class WC_Shipping_Webino_Courier extends WC_Shipping_Webino_Tapin_Base {
	/** @param int $instance_id Instance. */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'webino_courier';
		$this->method_key         = 'courier';
		$this->method_title       = __( 'پیک موتوری', 'webino-dashboard' );
		$this->method_description = __( 'ارسال با پیک', 'webino-dashboard' );
		parent::__construct( $instance_id );
	}
}

/**
 * Tipax via Tapin API.
 */
class WC_Shipping_Webino_Tapin_Tipax_Api extends WC_Shipping_Webino_Tapin_Base {
	/** @param int $instance_id Instance. */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'webino_tapin_tipax_api';
		$this->method_key         = 'tipax_api';
		$this->method_title       = __( 'تیپاکس تاپین', 'webino-dashboard' );
		$this->method_description = __( 'تیپاکس از طریق تاپین', 'webino-dashboard' );
		parent::__construct( $instance_id );
	}
}

/**
 * Alonomic via Tapin.
 */
class WC_Shipping_Webino_Tapin_Alonomic extends WC_Shipping_Webino_Tapin_Base {
	/** @param int $instance_id Instance. */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'webino_tapin_alonomic';
		$this->method_key         = 'alonomic';
		$this->method_title       = __( 'الونومیک تاپین', 'webino-dashboard' );
		$this->method_description = __( 'ارسال الونومیک تاپین', 'webino-dashboard' );
		parent::__construct( $instance_id );
	}
}

/**
 * Offline pishtaz 1405 tariff.
 */
class WC_Shipping_Webino_Pishtaz_1405 extends WC_Shipping_Webino_Tapin_Base {
	/** @param int $instance_id Instance. */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'webino_pishtaz_1405';
		$this->method_key         = 'pishtaz_1405';
		$this->method_title       = __( 'پیشتاز ۱۴۰۵', 'webino-dashboard' );
		$this->method_description = __( 'تعرفه آفلاین پیشتاز ۱۴۰۵', 'webino-dashboard' );
		parent::__construct( $instance_id );
	}
}
