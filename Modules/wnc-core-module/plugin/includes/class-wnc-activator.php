<?php
/**
 * Activation / deactivation.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Activator.
 */
class WNC_Activator {

	/**
	 * Activate.
	 */
	public static function activate() {
		require_once WNC_PLUGIN_DIR . 'includes/class-wnc-storage.php';
		WNC_Storage::ensure_schema();
		$bs = WNC_PLUGIN_DIR . 'includes/api/basalam/class-wnc-basalam-bootstrap.php';
		if ( file_exists( $bs ) ) {
			require_once $bs;
			if ( class_exists( 'WNC_Basalam_Schema', false ) ) {
				WNC_Basalam_Schema::ensure();
			}
		}

		$defaults = self::default_settings();
		$existing = get_option( 'wnc_settings', array() );
		if ( ! is_array( $existing ) ) {
			$existing = array();
		}
		// Deep-merge platform defaults so new platforms appear after upgrade.
		foreach ( $defaults as $platform => $def ) {
			if ( ! isset( $existing[ $platform ] ) || ! is_array( $existing[ $platform ] ) ) {
				$existing[ $platform ] = $def;
				continue;
			}
			$creds = isset( $def['credentials'] ) && is_array( $def['credentials'] ) ? $def['credentials'] : array();
			$cur   = isset( $existing[ $platform ]['credentials'] ) && is_array( $existing[ $platform ]['credentials'] ) ? $existing[ $platform ]['credentials'] : array();
			$existing[ $platform ] = wp_parse_args( $existing[ $platform ], $def );
			$existing[ $platform ]['credentials'] = wp_parse_args( $cur, $creds );
		}
		update_option( 'wnc_settings', $existing );
		update_option( 'wnc_version', WNC_VERSION );

		if ( ! wp_next_scheduled( 'wnc_process_jobs' ) ) {
			wp_schedule_event( time() + 60, 'wnc_five_minutes', 'wnc_process_jobs' );
		}
		if ( ! wp_next_scheduled( 'wnc_pull_orders' ) ) {
			wp_schedule_event( time() + 120, 'wnc_fifteen_minutes', 'wnc_pull_orders' );
		}

		flush_rewrite_rules();
	}

	/**
	 * Deactivate.
	 */
	public static function deactivate() {
		wp_clear_scheduled_hook( 'wnc_process_jobs' );
		wp_clear_scheduled_hook( 'wnc_pull_orders' );
	}

	/**
	 * Merge new platform defaults for existing installs.
	 */
	public static function maybe_upgrade() {
		$stored = get_option( 'wnc_version', '' );
		if ( WNC_VERSION === (string) $stored ) {
			// Still merge missing platforms even on same version if needed.
			$existing = get_option( 'wnc_settings', array() );
			if ( is_array( $existing ) && isset( $existing['torob'] ) ) {
				return;
			}
		}
		self::activate();
	}

	/**
	 * Default settings.
	 *
	 * @return array
	 */
	public static function default_settings() {
		$platform_defaults = array(
			'enabled'     => false,
			'auto_sync'   => false,
			'credentials' => array(),
		);

		return array(
			'digikala' => array_merge(
				$platform_defaults,
				array(
					'credentials' => array(
						'base_url'                   => 'https://seller.digikala.com',
						'client_code'                => '',
						'encrypted_code'             => '',
						'private_key'                => '',
						'public_key'                 => '',
						'credit_increase_percentage' => 0,
					),
				)
			),
			'basalam' => array_merge(
				$platform_defaults,
				array(
					'credentials' => array(
						'base_url'      => 'https://openapi.basalam.com',
						'auth_url'      => 'https://auth.basalam.com/oauth/token',
						'access_token'  => '',
						'refresh_token' => '',
						'vendor_id'     => '',
						'client_id'     => '',
						'client_secret' => '',
					),
				)
			),
			'technolife' => array_merge(
				$platform_defaults,
				array(
					'credentials' => array(
						'api_key'       => '',
						'base_url'      => '',
						'auth_header'   => 'bearer',
						'products_path' => 'api/v1/seller/products',
						'price_path'    => 'api/v1/seller/variants/{variant_id}/price',
						'stock_path'    => 'api/v1/seller/variants/{variant_id}/stock',
						'orders_path'   => 'api/v1/seller/orders',
						'order_path'    => 'api/v1/seller/orders/{order_id}',
						'test_path'     => 'api/v1/seller/me',
					),
				)
			),
			'snappshop' => array_merge(
				$platform_defaults,
				array(
					'credentials' => array(
						'base_url'            => 'https://apix.snappshop.ir',
						'automation_base_url' => 'https://apix.snappshop.ir/automation/v1',
						'token'               => '',
						'token_api'           => '',
						'vendor_id'           => '',
						'shop_code'           => '',
						'user_agent'          => '',
					),
				)
			),
			'tapsishop' => array_merge(
				$platform_defaults,
				array(
					'credentials' => array(
						'base_url'       => 'https://vendorgw.tapsi.shop',
						'username'       => '',
						'password'       => '',
						'store_id'       => '',
						'client_name'    => 'vendor.dartil.com',
						'client_version' => '1.0.0.0',
						'token'          => '',
						'token_name'     => '5',
					),
				)
			),
			'zarehbin' => array_merge(
				$platform_defaults,
				array(
					'credentials' => array(
						'per_page' => 50,
						'version'  => '1.0.0',
					),
				)
			),
			'emalls' => array_merge(
				$platform_defaults,
				array(
					'credentials' => array(
						'per_page' => 50,
						'version'  => '1.3.0',
					),
				)
			),
			'snapppay-search' => array_merge(
				$platform_defaults,
				array(
					'credentials' => array(
						'per_page' => 100,
						'version'  => '1.0.2',
					),
				)
			),
			'torob' => array_merge(
				$platform_defaults,
				array(
					'credentials' => array(
						'per_page'                     => 50,
						'order_status_enabled'         => true,
						'orders_list_api_enabled'      => true,
						'product_page_webhook_enabled' => true,
					),
				)
			),
		);
	}
}
