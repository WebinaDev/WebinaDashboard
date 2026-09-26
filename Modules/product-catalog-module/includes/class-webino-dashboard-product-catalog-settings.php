<?php
/**
 * Product catalog module settings (API keys).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option-backed settings for optional catalog providers.
 */
final class Webino_Dashboard_Product_Catalog_Settings {

	const OPTION = 'webino_product_catalog_settings';

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'google_books_api_key' => '',
			'barcodenest_api_key'  => '',
			'gtinhub_api_key'      => '',
			'buycott_access_token' => '',
		);
	}

	/**
	 * @return array<string,string>
	 */
	public static function get() {
		$raw = get_option( self::OPTION, array() );
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		$out = self::defaults();
		foreach ( array_keys( $out ) as $key ) {
			if ( isset( $raw[ $key ] ) ) {
				$out[ $key ] = sanitize_text_field( (string) $raw[ $key ] );
			}
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $patch Patch.
	 * @return array<string,string>
	 */
	public static function update( array $patch ) {
		$cur = self::get();
		foreach ( array_keys( self::defaults() ) as $key ) {
			if ( array_key_exists( $key, $patch ) ) {
				$cur[ $key ] = sanitize_text_field( (string) $patch[ $key ] );
			}
		}
		update_option( self::OPTION, $cur, false );
		return $cur;
	}

	/**
	 * Public view (never hide keys entirely — site admin owns them; mask in UI if needed).
	 *
	 * @return array<string,mixed>
	 */
	public static function public_payload() {
		$s = self::get();
		return array(
			'google_books_configured' => '' !== $s['google_books_api_key'],
			'barcodenest_configured'  => '' !== $s['barcodenest_api_key'],
			'gtinhub_configured'      => '' !== $s['gtinhub_api_key'],
			'buycott_configured'      => '' !== $s['buycott_access_token'],
			'google_books_api_key'    => $s['google_books_api_key'],
			'barcodenest_api_key'     => $s['barcodenest_api_key'],
			'gtinhub_api_key'         => $s['gtinhub_api_key'],
			'buycott_access_token'    => $s['buycott_access_token'],
		);
	}
}
