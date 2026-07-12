<?php
/**
 * Order print document settings (invoice, receipt, label).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Site-level settings for printable order documents.
 */
class Webino_Dashboard_Order_Document_Settings {

	const OPTION = 'webino_dashboard_order_documents';

	/**
	 * @return array<string, mixed>
	 */
	public static function defaults() {
		$store_address = function_exists( 'get_option' ) ? (string) get_option( 'woocommerce_store_address', '' ) : '';
		$store_city    = function_exists( 'get_option' ) ? (string) get_option( 'woocommerce_store_city', '' ) : '';
		$store_post    = function_exists( 'get_option' ) ? (string) get_option( 'woocommerce_store_postcode', '' ) : '';
		$store_phone   = function_exists( 'get_option' ) ? (string) get_option( 'woocommerce_store_phone', '' ) : '';
		$store_email   = function_exists( 'get_option' ) ? (string) get_option( 'woocommerce_store_email', '' ) : '';
		$address_parts = array_filter( array( $store_address, $store_city ) );
		$sep           = Webino_Dashboard_Locale::list_separator();
		$site          = get_bloginfo( 'name' );

		return array(
			'store_name'     => $site,
			'logo_url'       => '',
			'accent_color'   => '#e775ae',
			'footer_thanks'  => __( 'Thank you for your trust', 'webino-dashboard' ),
			'footer_site'    => wp_parse_url( home_url(), PHP_URL_HOST ) ?: home_url(),
			'sender_name'    => $site,
			'sender_address' => implode( $sep, $address_parts ),
			'sender_postcode' => $store_post,
			'sender_phone'   => $store_phone,
			'sender_email'   => $store_email,
			'invoice_show_status'        => true,
			'invoice_show_barcode'       => true,
			'invoice_show_product_image' => true,
			'invoice_show_sku'           => true,
			'receipt_show_barcode'       => true,
			'receipt_show_items_table'   => true,
			'label_show_barcode'           => true,
			'label_show_products'          => true,
			'label_show_postman_placeholder' => true,
			'label_postman_title'        => __( 'Place for postal label', 'webino-dashboard' ),
			'label_postman_hint'         => __( 'The post officer will attach the official label here', 'webino-dashboard' ),
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function get() {
		$stored = get_option( self::OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return array_merge( self::defaults(), $stored );
	}

	/**
	 * @param array<string, mixed> $input Raw input.
	 * @return array<string, mixed>
	 */
	public static function sanitize( $input ) {
		if ( ! is_array( $input ) ) {
			return self::defaults();
		}
		$defaults = self::defaults();
		$out      = array();

		$strings = array(
			'store_name',
			'logo_url',
			'accent_color',
			'footer_thanks',
			'footer_site',
			'sender_name',
			'sender_address',
			'sender_postcode',
			'sender_phone',
			'sender_email',
			'label_postman_title',
			'label_postman_hint',
		);
		foreach ( $strings as $key ) {
			if ( array_key_exists( $key, $input ) ) {
				$out[ $key ] = sanitize_text_field( (string) $input[ $key ] );
			}
		}
		if ( isset( $out['logo_url'] ) ) {
			$out['logo_url'] = esc_url_raw( $out['logo_url'] );
		}
		if ( isset( $out['accent_color'] ) && ! preg_match( '/^#[0-9a-fA-F]{3,8}$/', $out['accent_color'] ) ) {
			$out['accent_color'] = $defaults['accent_color'];
		}

		$bools = array(
			'invoice_show_status',
			'invoice_show_barcode',
			'invoice_show_product_image',
			'invoice_show_sku',
			'receipt_show_barcode',
			'receipt_show_items_table',
			'label_show_barcode',
			'label_show_products',
			'label_show_postman_placeholder',
		);
		foreach ( $bools as $key ) {
			if ( array_key_exists( $key, $input ) ) {
				$out[ $key ] = ! empty( $input[ $key ] );
			}
		}

		return array_merge( $defaults, $out );
	}

	/**
	 * @param array<string, mixed> $input Raw input.
	 * @return array<string, mixed>
	 */
	public static function save( $input ) {
		$sanitized = self::sanitize( $input );
		update_option( self::OPTION, $sanitized );
		return $sanitized;
	}
}
