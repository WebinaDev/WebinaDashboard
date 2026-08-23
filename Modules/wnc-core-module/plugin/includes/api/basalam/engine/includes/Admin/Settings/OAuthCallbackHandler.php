<?php

namespace WncBasalam\Admin\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Early OAuth callback for Hamsalam/WooSalam save-token slugs.
 *
 * Hamsalam redirects to admin.php?page=basalam-save-token with JWT query params.
 * Handling on admin_init avoids depending on submenu registration alone.
 */
class OAuthCallbackHandler {

	const PAGE_SLUGS = array(
		'basalam-save-token',
		'webino_basalam-save-token',
		'wnc_basalam-save-token',
	);

	/**
	 * @return void
	 */
	public static function register() {
		add_action( 'admin_init', array( __CLASS__, 'maybe_handle' ), 1 );
	}

	/**
	 * @return void
	 */
	public static function maybe_handle() {
		if ( ! is_admin() ) {
			return;
		}

		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( (string) $_GET['page'] ) ) : '';
		if ( ! in_array( $page, self::PAGE_SLUGS, true ) ) {
			return;
		}

		$has_token = ( isset( $_GET['access_token'] ) && '' !== (string) $_GET['access_token'] )
			|| ( isset( $_GET['hamsalam_token'] ) && '' !== (string) $_GET['hamsalam_token'] );
		if ( ! $has_token ) {
			return;
		}

		SettingsPageHandler::handleOauthCallback();
		exit;
	}
}
