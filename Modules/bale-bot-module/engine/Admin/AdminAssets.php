<?php

namespace Webino_Dashboard_Bots_Bale\Admin;

/**
 * Enqueue admin styles/scripts on WooBale screens.
 */
class AdminAssets {

	public static function init(): void {
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	public static function enqueue( string $hook ): void {
		$load = strpos( $hook, 'webino-dashboard' ) !== false
			|| $hook === 'woocommerce_page_wc-orders'
			|| in_array( $hook, array( 'user-edit.php', 'profile.php', 'users.php', 'woocommerce_page_wc-admin' ), true );
		if ( ! $load && function_exists( 'get_current_screen' ) ) {
			$screen = get_current_screen();
			if ( $screen ) {
				// Legacy CPT orders + HPOS order screens.
				if ( $screen->post_type === 'shop_order'
					|| ( isset( $screen->id ) && false !== strpos( (string) $screen->id, 'wc-orders' ) ) ) {
					$load = true;
				}
			}
		}
		if ( ! $load ) {
			return;
		}
		wp_enqueue_style(
			'woobale-admin',
			WOOBALE_PLUGIN_URL . 'assets/css/admin.css',
			array(),
			WOOBALE_VERSION
		);
		wp_enqueue_script(
			'woobale-admin',
			WOOBALE_PLUGIN_URL . 'assets/js/admin.js',
			array( 'jquery' ),
			WOOBALE_VERSION,
			true
		);
		wp_localize_script(
			'woobale-admin',
			'woobaleAdmin',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'woobale_admin' ),
			)
		);
	}
}
