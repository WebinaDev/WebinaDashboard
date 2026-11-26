<?php
/**
 * Keeps every retired wp-admin Basalam slug alive by redirecting to /dashboard.
 *
 * The Basalam screens now live only in /dashboard (our SPA). Removing the wp-admin menu must not
 * break bookmarks, docs, support links, or an OAuth return that still points at
 * admin.php?page=webino_basalam*. Those slugs are registered as *hidden* pages (no menu entry)
 * so WordPress resolves them and this class bounces the browser to the matching dashboard route.
 *
 * The save-token slugs are intentionally NOT handled here: OAuthCallbackHandler finishes the
 * OAuth handshake on admin_init (priority 1) and exits before any page renders.
 *
 * @package WebinoDashboard
 */

namespace WebinoBasalam\Admin;

defined( 'ABSPATH' ) || exit;

/**
 * Class AdminPageRedirects
 */
class AdminPageRedirects {

	/**
	 * wp-admin page slug => dashboard route.
	 *
	 * @var array<string,string>
	 */
	const REDIRECTS = array(
		'webino_basalam'                   => '',
		'webino_basalam_logs'              => 'logs',
		'webino_basalam_vendor_info'       => 'info',
		'webino_basalam_help'              => 'help',
		'webino_basalam_category_mapping'  => 'categories',
		'webino_basalam-onboarding'        => 'onboarding',
		'webino_basalam-show-products'     => 'products?filter=unconnected',
		'webino_basalam_tickets'           => 'tickets',
		'webino_basalam_ticket'            => 'tickets',
		'webino_basalam_new_ticket'        => 'tickets',
		'webino_basalam_finance'           => 'finance',
		'webino_basalam_booth'             => 'booth',
		'webino_basalam_products'          => 'products',
		'webino_basalam_orders'            => 'orders',
	);

	/**
	 * Register the hidden pages (no menu entry is drawn for any of them).
	 *
	 * @return void
	 */
	public static function registerMenus() {
		$parent = 'webino_basalam';

		// The parent itself must exist for the hidden children to resolve, but it never renders a
		// menu row: add_menu_page() is skipped on purpose, add_submenu_page() with a null parent is
		// not possible, so the parent page is registered and immediately unlinked below.
		add_menu_page(
			'باسلام',
			'باسلام',
			'manage_options',
			$parent,
			array( __CLASS__, 'redirect' ),
			'',
			4
		);
		remove_menu_page( $parent );

		foreach ( self::REDIRECTS as $slug => $route ) {
			if ( $slug === $parent ) {
				continue;
			}
			add_submenu_page(
				$parent,
				'باسلام',
				'باسلام',
				'manage_options',
				$slug,
				array( __CLASS__, 'redirect' )
			);
		}

		// Titles/parents above still create submenu rows; unlink them after registration.
		global $submenu;
		unset( $submenu[ $parent ] );

		add_action( 'admin_init', array( __CLASS__, 'maybe_redirect_early' ), 2 );
	}

	/**
	 * Redirect before anything renders, so no wp-admin chrome flashes.
	 *
	 * @return void
	 */
	public static function maybe_redirect_early() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only routing.
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( (string) $_GET['page'] ) ) : '';
		if ( '' === $page || ! array_key_exists( $page, self::REDIRECTS ) ) {
			return;
		}
		self::redirect( $page );
	}

	/**
	 * Page callback (fallback when admin_init did not fire the redirect).
	 *
	 * @return void
	 */
	public static function redirect() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only routing.
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( (string) $_GET['page'] ) ) : 'webino_basalam';
		self::go( $page );
	}

	/**
	 * Send the browser to the dashboard route that replaced a wp-admin slug.
	 *
	 * @param string $page wp-admin page slug.
	 * @return void
	 */
	private static function go( $page ) {
		$route = isset( self::REDIRECTS[ $page ] ) ? (string) self::REDIRECTS[ $page ] : '';
		$url   = home_url( '/dashboard/settings/shop/basalam/' . ltrim( $route, '/' ) );
		wp_safe_redirect( $url );
		exit;
	}
}
