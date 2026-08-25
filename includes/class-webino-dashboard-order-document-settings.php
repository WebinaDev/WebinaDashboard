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

	const LABEL_PRINTED_META = '_webino_shipping_label_printed';

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
		$thanks        = __( 'Thank you for your trust', 'webino-dashboard' );

		return array(
			'store_name'     => $site,
			'logo_url'       => '',
			'accent_color'   => '#e775ae',
			'footer_thanks'  => $thanks,
			'footer_site'    => wp_parse_url( home_url(), PHP_URL_HOST ) ?: home_url(),
			'sender_name'    => $site,
			'sender_address' => implode( $sep, $address_parts ),
			'sender_postcode' => $store_post,
			'sender_phone'   => $store_phone,
			'sender_email'   => $store_email,
			'enable_invoice'         => true,
			'enable_receipt'         => true,
			'enable_label'           => true,
			'enable_product_label'   => true,
			'enable_packing'         => true,
			'enable_customer_label'  => true,
			'enable_store_label'     => true,
			'invoice_logo_url' => '',
			'invoice_logo_id'  => 0,
			'receipt_logo_url' => '',
			'receipt_logo_id'  => 0,
			'label_logo_url'   => '',
			'label_logo_id'    => 0,
			'invoice_thanks' => $thanks,
			'receipt_thanks' => $thanks,
			'label_note'     => __( 'Please handle with care', 'webino-dashboard' ),
			'invoice_parties_order' => 'sender_first',
			'label_parties_order'   => 'sender_first',
			'label_orientation'     => 'landscape',
			'invoice_orientation'   => 'portrait',
			'invoice_theme' => 'classic',
			'receipt_theme' => 'classic',
			'label_theme'   => 'stacked',
			'packing_theme' => 'classic',
			'label_size'          => 'A5',
			'customer_label_size' => '100x70',
			'store_label_size'    => '100x70',
			'product_label_size'  => '58x40',
			'product_label_split_variations' => true,
			'invoice_show_status'        => true,
			'invoice_show_barcode'       => true,
			'invoice_show_product_image' => true,
			'invoice_show_sku'           => true,
			'receipt_show_barcode'       => true,
			'receipt_show_items_table'   => true,
			'label_show_barcode'           => true,
			'label_show_products'          => false,
			'label_show_postman_placeholder' => true,
			'label_postman_title'        => __( 'Place for attaching postal label', 'webino-dashboard' ),
			'label_postman_hint'         => __( 'The post officer will attach the official label in this area', 'webino-dashboard' ),
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
		$defaults = self::defaults();
		$merged   = array_merge( $defaults, $stored );

		$legacy_logo = isset( $stored['logo_url'] ) ? esc_url_raw( (string) $stored['logo_url'] ) : '';
		if ( $legacy_logo ) {
			foreach ( array( 'invoice_logo_url', 'receipt_logo_url', 'label_logo_url' ) as $k ) {
				if ( empty( $stored[ $k ] ) ) {
					$merged[ $k ] = $legacy_logo;
				}
			}
		}

		if ( isset( $stored['footer_thanks'] ) && ! isset( $stored['invoice_thanks'] ) ) {
			$merged['invoice_thanks'] = (string) $stored['footer_thanks'];
			$merged['receipt_thanks'] = (string) $stored['footer_thanks'];
		}

		return $merged;
	}

	/**
	 * Logo URL for a document kind.
	 *
	 * @param string               $kind invoice|receipt|label.
	 * @param array<string,mixed>|null $s Settings.
	 * @return string
	 */
	public static function logo_url( $kind, $s = null ) {
		if ( ! is_array( $s ) ) {
			$s = self::get();
		}
		$key = $kind . '_logo_url';
		$url = isset( $s[ $key ] ) ? (string) $s[ $key ] : '';
		if ( '' === $url && ! empty( $s['logo_url'] ) ) {
			$url = (string) $s['logo_url'];
		}
		return $url;
	}

	/**
	 * @param string $type invoice|receipt|label|product_label|packing|customer_label|store_label.
	 * @return bool
	 */
	public static function is_enabled( $type ) {
		$s = self::get();
		$map = array(
			'invoice'         => 'enable_invoice',
			'receipt'         => 'enable_receipt',
			'label'           => 'enable_label',
			'product_label'   => 'enable_product_label',
			'packing'         => 'enable_packing',
			'customer_label'  => 'enable_customer_label',
			'store_label'     => 'enable_store_label',
		);
		$key = isset( $map[ $type ] ) ? $map[ $type ] : '';
		return $key && ! empty( $s[ $key ] );
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
			'invoice_logo_url',
			'receipt_logo_url',
			'label_logo_url',
			'invoice_thanks',
			'receipt_thanks',
			'label_note',
		);
		foreach ( $strings as $key ) {
			if ( array_key_exists( $key, $input ) ) {
				$val         = (string) $input[ $key ];
				$out[ $key ] = ( 'sender_address' === $key ) ? sanitize_textarea_field( $val ) : sanitize_text_field( $val );
			}
		}
		foreach ( array( 'logo_url', 'invoice_logo_url', 'receipt_logo_url', 'label_logo_url' ) as $uk ) {
			if ( isset( $out[ $uk ] ) ) {
				$out[ $uk ] = esc_url_raw( $out[ $uk ] );
			}
		}
		if ( isset( $out['accent_color'] ) && ! preg_match( '/^#[0-9a-fA-F]{3,8}$/', $out['accent_color'] ) ) {
			$out['accent_color'] = $defaults['accent_color'];
		}

		foreach ( array( 'invoice_logo_id', 'receipt_logo_id', 'label_logo_id' ) as $ik ) {
			if ( array_key_exists( $ik, $input ) ) {
				$out[ $ik ] = max( 0, (int) $input[ $ik ] );
			}
		}

		$enums = array(
			'invoice_parties_order' => array( 'sender_first', 'recipient_first' ),
			'label_parties_order'   => array( 'sender_first', 'recipient_first' ),
			'label_orientation'     => array( 'portrait', 'landscape' ),
			'invoice_orientation'   => array( 'portrait', 'landscape' ),
			'invoice_theme'         => array( 'classic', 'modern', 'band', 'boxed', 'stripe', 'compact', 'landscape' ),
			'receipt_theme'         => array( 'classic', 'modern', 'band', 'compact' ),
			'label_theme'           => array( 'stacked', 'rows', 'classic', 'modern', 'iran', 'stamp' ),
			'packing_theme'         => array( 'classic', 'band', 'compact' ),
			'label_size'            => array( '100x150', '100x100', 'A5' ),
			'product_label_size'    => array( '40x30', '50x30', '58x40', '60x40', '80x50', '100x50' ),
			'customer_label_size'   => array( '100x70', '100x100' ),
			'store_label_size'      => array( '100x70', '100x100' ),
		);
		foreach ( $enums as $key => $allowed ) {
			if ( array_key_exists( $key, $input ) ) {
				$val = sanitize_key( (string) $input[ $key ] );
				$out[ $key ] = in_array( $val, $allowed, true ) ? $val : $defaults[ $key ];
			}
		}

		$bools = array(
			'enable_invoice',
			'enable_receipt',
			'enable_label',
			'enable_product_label',
			'enable_packing',
			'enable_customer_label',
			'enable_store_label',
			'invoice_show_status',
			'invoice_show_barcode',
			'invoice_show_product_image',
			'invoice_show_sku',
			'receipt_show_barcode',
			'receipt_show_items_table',
			'label_show_barcode',
			'label_show_postman_placeholder',
			'product_label_split_variations',
		);
		foreach ( $bools as $key ) {
			if ( array_key_exists( $key, $input ) ) {
				$out[ $key ] = ! empty( $input[ $key ] );
			}
		}

		$out['label_show_products'] = false;

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
