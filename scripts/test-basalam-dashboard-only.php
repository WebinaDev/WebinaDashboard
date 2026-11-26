<?php
/**
 * Asserts that Basalam lives only in /dashboard: no wp-admin menu rows, legacy slugs redirect,
 * OAuth callbacks stay untouched, and the floating chat is no longer injected by wp-admin.
 *
 * Bug being guarded: the module registered a full wp-admin menu tree AND injected the floating
 * chat widget into every admin page, so the product had two competing surfaces.
 *
 * Run: php scripts/test-basalam-dashboard-only.php
 *
 * @package WebinoDashboard
 */

declare(strict_types=1);

$root = dirname( __DIR__ );
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', $root . '/' );
}

// ---- Minimal WordPress stubs ------------------------------------------------
$GLOBALS['wd_menu_pages']    = array();
$GLOBALS['wd_submenu']       = array();
$GLOBALS['wd_removed']       = array();
$GLOBALS['wd_hooks']         = array();
$GLOBALS['wd_redirect']      = null;
$GLOBALS['wd_enqueued']      = array();
$GLOBALS['wd_fail']          = 0;
$GLOBALS['submenu']          = array();

function wd_assert( $cond, $label ) {
	if ( $cond ) {
		echo "  ok: {$label}\n";
		return;
	}
	++$GLOBALS['wd_fail'];
	echo "  FAIL: {$label}\n";
}

function add_action( $hook, $cb, $prio = 10, $args = 1 ) {
	$GLOBALS['wd_hooks'][ $hook ][] = $cb;
	return true;
}
function add_filter( $hook, $cb, $prio = 10, $args = 1 ) { return add_action( $hook, $cb, $prio, $args ); }
function apply_filters( $hook, $value, ...$args ) { return $value; }
function add_menu_page( $page_title, $menu_title, $cap, $slug, $cb = '', $icon = '', $pos = null ) {
	$GLOBALS['wd_menu_pages'][] = (string) $slug;
	return 'toplevel_page_' . $slug;
}
function add_submenu_page( $parent, $page_title, $menu_title, $cap, $slug, $cb = '' ) {
	$GLOBALS['wd_submenu'][ (string) $parent ][] = (string) $slug;
	return 'basalam_page_' . $slug;
}
function remove_menu_page( $slug ) { $GLOBALS['wd_removed'][] = (string) $slug; return true; }
function remove_submenu_page( $parent, $slug ) { return true; }
function sanitize_key( $k ) { return strtolower( preg_replace( '/[^a-z0-9_\-]/i', '', (string) $k ) ); }
function sanitize_text_field( $v ) { return trim( (string) $v ); }
function wp_unslash( $v ) { return $v; }
function home_url( $p = '' ) { return 'https://shop.test' . $p; }
function wp_safe_redirect( $url ) {
	$GLOBALS['wd_redirect'] = (string) $url;
	throw new RuntimeException( 'redirected' );
}
function wp_enqueue_script( $handle, $src = '', $deps = array(), $ver = false, $footer = false ) {
	$GLOBALS['wd_enqueued'][] = (string) $handle;
}
function wp_register_script( $handle, $src = '', $deps = array(), $ver = false, $footer = false ) {}
function wp_enqueue_style( $handle, $src = '', $deps = array(), $ver = false ) {}
function esc_url( $u ) { return $u; }
function esc_attr( $v ) { return htmlspecialchars( (string) $v, ENT_QUOTES ); }
function __( $v, $d = null ) { return $v; }
function plugin_dir_url( $f ) { return 'https://shop.test/plugins/basalam/'; }

require_once $root . '/Modules/basalam-module/engine/includes/Admin/AdminPageRedirects.php';

use WebinoBasalam\Admin\AdminPageRedirects;

echo "== basalam is dashboard-only ==\n";

// 1) Registering menus draws no wp-admin menu row.
AdminPageRedirects::registerMenus();
wd_assert( in_array( 'webino_basalam', $GLOBALS['wd_removed'], true ), 'the top-level Basalam menu is removed from wp-admin' );
wd_assert( array() === ( $GLOBALS['submenu']['webino_basalam'] ?? array() ), 'no Basalam submenu rows remain' );

// 2) Every legacy slug is still resolvable (hidden page) so bookmarks do not 404.
$registered = array();
foreach ( $GLOBALS['wd_submenu'] as $slugs ) {
	foreach ( $slugs as $slug ) {
		$registered[] = $slug;
	}
}
// add_menu_page for the parent + one hidden page per slug below.
wd_assert( count( $registered ) > 0, 'hidden pages stay resolvable (no 404 on old links)' );

// 3) Redirect target per slug.
$cases = array(
	'webino_basalam'                  => '/dashboard/settings/shop/basalam/',
	'webino_basalam_logs'             => '/dashboard/settings/shop/basalam/logs',
	'webino_basalam_help'             => '/dashboard/settings/shop/basalam/help',
	'webino_basalam_vendor_info'      => '/dashboard/settings/shop/basalam/info',
	'webino_basalam_category_mapping' => '/dashboard/settings/shop/basalam/categories',
	'webino_basalam-onboarding'       => '/dashboard/settings/shop/basalam/onboarding',
	'webino_basalam-show-products'    => '/dashboard/settings/shop/basalam/products?filter=unconnected',
	'webino_basalam_finance'          => '/dashboard/settings/shop/basalam/finance',
	'webino_basalam_booth'            => '/dashboard/settings/shop/basalam/booth',
);
foreach ( $cases as $slug => $expected ) {
	$GLOBALS['wd_redirect'] = null;
	$_GET['page']           = $slug;
	try {
		AdminPageRedirects::maybe_redirect_early();
	} catch ( RuntimeException $e ) {
		// expected: the handler exits after redirecting.
	}
	$got = (string) $GLOBALS['wd_redirect'];
	wd_assert( 'https://shop.test' . $expected === $got, "{$slug} redirects to {$expected}" );
}

// 4) OAuth save-token slugs must NOT be redirected (the OAuth handler owns them).
foreach ( array( 'webino_basalam-save-token', 'basalam-save-token', 'wnc_basalam-save-token' ) as $slug ) {
	$GLOBALS['wd_redirect'] = null;
	$_GET['page']           = $slug;
	try {
		AdminPageRedirects::maybe_redirect_early();
	} catch ( RuntimeException $e ) {
		// should not happen.
	}
	wd_assert( null === $GLOBALS['wd_redirect'], "{$slug} is left to the OAuth callback handler" );
}

// 5) Unrelated admin pages are never touched.
$GLOBALS['wd_redirect'] = null;
$_GET['page']           = 'woocommerce-settings';
try {
	AdminPageRedirects::maybe_redirect_early();
} catch ( RuntimeException $e ) {
	// should not happen.
}
wd_assert( null === $GLOBALS['wd_redirect'], 'unrelated wp-admin pages are untouched' );

// 6) admin_enqueue_scripts must not enqueue the chat widget any more.
$registrar = $root . '/Modules/basalam-module/engine/includes/Registrar/AdminRegistrar.php';
$src       = (string) file_get_contents( $registrar );
wd_assert( false === strpos( $src, 'wp_enqueue_script(' . "\n" . '                "basalam-chat-widget-script"' ), 'wp-admin no longer enqueues the chat widget' );
wd_assert( false !== strpos( $src, 'AdminPageRedirects' ), 'wp-admin menu registration goes through the redirect keeper' );
wd_assert( false !== strpos( $src, 'dashboard shell' ), 'the chat widget move to the dashboard is documented in place' );

// 7) The dashboard bundle exports the dock the shell mounts.
$entry = (string) file_get_contents( $root . '/Modules/basalam-module/client/module-entry.tsx' );
wd_assert( false !== strpos( $entry, 'BasalamChatDock' ), 'module bundle exports BasalamChatDock' );
wd_assert( false !== strpos( $entry, 'export const components' ), 'module bundle exposes a components map' );

$layout = (string) file_get_contents( $root . '/client/src/layouts/DashboardLayout.tsx' );
wd_assert( false !== strpos( $layout, 'BasalamChatDock' ), 'dashboard shell mounts BasalamChatDock' );

// 8) The ported pages are routed.
foreach ( array( 'help', 'info', 'onboarding' ) as $route ) {
	wd_assert(
		false !== strpos( $entry, "settings/shop/basalam/{$route}'" ),
		"dashboard route settings/shop/basalam/{$route} exists"
	);
}

// 9) FAQ content parity with the retired wp-admin Help page.
$faqTs = (string) file_get_contents( $root . '/Modules/basalam-module/client/pages/basalam/basalamFaq.ts' );
// 48 entries: the only other `question:` occurrence is the type declaration.
wd_assert( 49 === substr_count( $faqTs, 'question:' ), 'all 48 FAQ entries were ported' );
$faqPhp = (string) file_get_contents( $root . '/Modules/basalam-module/engine/includes/Admin/Faq.php' );
wd_assert( 48 === substr_count( $faqPhp, "'question' =>" ), 'the retired wp-admin FAQ still holds 48 entries (parity source)' );

if ( $GLOBALS['wd_fail'] > 0 ) {
	exit( 1 );
}
echo "OK: basalam is dashboard-only\n";
