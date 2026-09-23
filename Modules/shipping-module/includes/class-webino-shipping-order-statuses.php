<?php
/**
 * Custom WooCommerce order statuses for transport.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webino_Shipping_Order_Statuses {

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ), 20 );
		add_filter( 'wc_order_statuses', array( __CLASS__, 'add_to_list' ) );
		add_filter( 'webino_dashboard_sms_custom_status_map', array( __CLASS__, 'sms_map' ) );
	}

	/**
	 * @return array<string, string>
	 */
	public static function definitions() {
		return array(
			'wc-webino-in-stock'       => __( 'انبار', 'webino-dashboard' ),
			'wc-webino-packaged'       => __( 'بسته‌بندی‌شده', 'webino-dashboard' ),
			'wc-webino-courier'        => __( 'پیک', 'webino-dashboard' ),
			'wc-webino-post'           => __( 'پست', 'webino-dashboard' ),
			'wc-webino-tipax'          => __( 'تیپاکس', 'webino-dashboard' ),
			'wc-webino-ready-to-ship'  => __( 'آماده ارسال', 'webino-dashboard' ),
			'wc-webino-returned'       => __( 'برگشتی', 'webino-dashboard' ),
			'wc-webino-deleted'        => __( 'حذف‌شده', 'webino-dashboard' ),
			'wc-webino-shipping'       => __( 'در حال ارسال', 'webino-dashboard' ),
			'wc-webino-need-review'    => __( 'نیازمند بررسی', 'webino-dashboard' ),
		);
	}

	/**
	 * @return bool
	 */
	public static function enabled() {
		if ( ! class_exists( 'Webino_Shipping_Tools', false ) ) {
			return true;
		}
		return ! empty( Webino_Shipping_Tools::get()['status_enable'] );
	}

	/**
	 * @return void
	 */
	public static function register() {
		if ( ! self::enabled() ) {
			return;
		}
		foreach ( self::definitions() as $slug => $label ) {
			register_post_status(
				$slug,
				array(
					'label'                     => $label,
					'public'                    => true,
					'exclude_from_search'       => false,
					'show_in_admin_all_list'    => true,
					'show_in_admin_status_list' => true,
					/* translators: %s: count */
					'label_count'               => _n_noop( $label . ' <span class="count">(%s)</span>', $label . ' <span class="count">(%s)</span>', 'webino-dashboard' ),
				)
			);
		}
	}

	/**
	 * @param array<string, string> $statuses Statuses.
	 * @return array<string, string>
	 */
	public static function add_to_list( $statuses ) {
		if ( ! self::enabled() ) {
			return $statuses;
		}
		foreach ( self::definitions() as $slug => $label ) {
			$statuses[ $slug ] = $label;
		}
		return $statuses;
	}

	/**
	 * @param array<string, string> $map Map.
	 * @return array<string, string>
	 */
	public static function sms_map( $map ) {
		$map['webino-packaged']      = 'packaged';
		$map['webino-courier']       = 'courier';
		$map['webino-post']          = 'post';
		$map['webino-tipax']         = 'tipax';
		$map['webino-chapar']        = 'chapar';
		$map['webino-ready-to-ship'] = 'post';
		$map['webino-shipping']      = 'post';
		$map['webino-returned']      = 'refunded';
		$map['webino-in-stock']      = 'sent-to-warehouse';
		$map['webino-need-review']   = 'on-hold';
		return $map;
	}

	/**
	 * Tapin API status → WC status slug without wc- prefix.
	 *
	 * @param int $code Tapin status.
	 * @return string|null
	 */
	public static function from_tapin_code( $code ) {
		$code = (int) $code;
		$map  = array(
			2   => 'webino-ready-to-ship',
			1   => 'webino-packaged',
			10  => 'webino-returned',
			11  => 'webino-returned',
			83  => 'webino-returned',
			102 => 'webino-returned',
			7   => 'completed',
			70  => 'completed',
			71  => 'completed',
			72  => 'completed',
			80  => 'webino-deleted',
			5   => 'webino-shipping',
			13  => 'webino-shipping',
			14  => 'webino-shipping',
			15  => 'webino-shipping',
			16  => 'webino-shipping',
			17  => 'webino-shipping',
			50  => 'webino-shipping',
		);
		if ( isset( $map[ $code ] ) ) {
			return $map[ $code ];
		}
		if ( $code > 0 ) {
			return 'webino-need-review';
		}
		return null;
	}
}
