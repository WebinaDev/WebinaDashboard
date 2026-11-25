<?php
/**
 * Regression test: 404 deploy hardening.
 *
 * 1. A cached 404 on a virtual /dashboard route must be cleared (SPA routes are
 *    never real posts), while normal 404s stay untouched.
 * 2. A partial deploy (missing critical files) must still answer JSON via the
 *    minimal REST routes instead of a fatal HTML page.
 *
 * Run: php scripts/test-deploy-hardening.php
 *
 * @package WebinoDashboard
 */

// phpcs:disable

// A partial deploy logs the missing files; keep the test output readable.
ini_set( 'error_log', '/dev/null' );

$GLOBALS['wd_actions'] = array();
$GLOBALS['wd_filters'] = array();
$GLOBALS['wd_routes']  = array();
$GLOBALS['wd_status']  = null;
$GLOBALS['wd_nocache'] = false;
$GLOBALS['wd_qv']      = array();

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', '/tmp/' );
}
if ( ! defined( 'WEBINO_DASHBOARD_DIR' ) ) {
	// Missing files on purpose: nothing exists under this directory.
	define( 'WEBINO_DASHBOARD_DIR', '/tmp/webino-dashboard-partial-deploy/' );
}
if ( ! defined( 'WEBINO_DASHBOARD_VERSION' ) ) {
	define( 'WEBINO_DASHBOARD_VERSION', '0.9.94' );
}

if ( ! function_exists( 'add_action' ) ) {
	function add_action( $hook, $callback, $priority = 10, $args = 1 ) {
		$GLOBALS['wd_actions'][ $hook ][] = $callback;
	}
}
if ( ! function_exists( 'add_filter' ) ) {
	function add_filter( $hook, $callback, $priority = 10, $args = 1 ) {
		$GLOBALS['wd_filters'][ $hook ][] = $callback;
	}
}
if ( ! function_exists( 'apply_filters' ) ) {
	function apply_filters( $hook, $value ) {
		return $value;
	}
}
if ( ! function_exists( 'register_rest_route' ) ) {
	function register_rest_route( $ns, $route, $args ) {
		$GLOBALS['wd_routes'][] = $ns . $route;
		return true;
	}
}
if ( ! function_exists( 'get_option' ) ) {
	function get_option( $key, $default = false ) {
		if ( 'webino_dashboard_core_broken' === $key ) {
			return array( 'includes/class-webino-dashboard-rest.php' );
		}
		return $default;
	}
}
if ( ! function_exists( 'update_option' ) ) {
	function update_option( $key, $value, $autoload = null ) {
		return true;
	}
}
if ( ! function_exists( 'delete_option' ) ) {
	function delete_option( $key ) {
		return true;
	}
}
if ( ! function_exists( 'current_user_can' ) ) {
	function current_user_can( $cap ) {
		return true;
	}
}
if ( ! function_exists( 'esc_html__' ) ) {
	function esc_html__( $text, $domain = null ) {
		return $text;
	}
}
if ( ! function_exists( 'esc_html' ) ) {
	function esc_html( $text ) {
		return $text;
	}
}
if ( ! function_exists( 'home_url' ) ) {
	function home_url( $path = '' ) {
		return 'https://shop.test' . $path;
	}
}
if ( ! function_exists( 'wp_parse_url' ) ) {
	function wp_parse_url( $url, $component = -1 ) {
		return parse_url( $url, $component );
	}
}
if ( ! function_exists( 'wp_unslash' ) ) {
	function wp_unslash( $value ) {
		return $value;
	}
}
if ( ! function_exists( 'is_admin' ) ) {
	function is_admin() {
		return false;
	}
}
if ( ! function_exists( 'status_header' ) ) {
	function status_header( $code ) {
		$GLOBALS['wd_status'] = $code;
	}
}
if ( ! function_exists( 'nocache_headers' ) ) {
	function nocache_headers() {
		$GLOBALS['wd_nocache'] = true;
	}
}
if ( ! function_exists( 'get_query_var' ) ) {
	function get_query_var( $key ) {
		return isset( $GLOBALS['wd_qv'][ $key ] ) ? $GLOBALS['wd_qv'][ $key ] : '';
	}
}
if ( ! function_exists( 'headers_sent' ) ) {
	function headers_sent() {
		return false;
	}
}
if ( ! class_exists( 'WP_Query' ) ) {
	class WP_Query {
		public $is_404 = true;
	}
}
if ( ! class_exists( 'WP_REST_Response' ) ) {
	class WP_REST_Response {
		public $data;
		public $status;
		public function __construct( $data = null, $status = 200 ) {
			$this->data   = $data;
			$this->status = $status;
		}
	}
}
if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error {
		public $code;
		public $message;
		public $data;
		public function __construct( $code = '', $message = '', $data = null ) {
			$this->code    = $code;
			$this->message = $message;
			$this->data    = $data;
		}
	}
}

require_once dirname( __DIR__ ) . '/includes/class-webino-dashboard-rewrite.php';
require_once dirname( __DIR__ ) . '/includes/class-webino-dashboard-bootstrap.php';

$fails = 0;
$ok    = 0;

/**
 * @param string $name Assertion label.
 * @param bool   $cond Condition.
 * @return void
 */
function wd_assert( $name, $cond ) {
	global $fails, $ok;
	if ( $cond ) {
		$ok++;
		echo "ok: {$name}\n";
		return;
	}
	$fails++;
	echo "FAIL: {$name}\n";
}

// --- 1. virtual dashboard 404 is cleared -----------------------------------
$_SERVER['REQUEST_URI'] = '/dashboard/shop/products/12/';
$GLOBALS['wd_qv']        = array( 'webino_dashboard' => '1' );
$GLOBALS['wd_status']    = null;
$GLOBALS['wp_query']     = new WP_Query();

$rewrite = new Webino_Dashboard_Rewrite();
wd_assert( 'dashboard 404 filter returns false', false === $rewrite->clear_dashboard_404( true ) );
wd_assert( 'wp_query 404 flag cleared', false === $GLOBALS['wp_query']->is_404 );
wd_assert( 'status reset to 200', 200 === $GLOBALS['wd_status'] );
wd_assert( 'nocache headers sent', true === $GLOBALS['wd_nocache'] );

// --- 2. a real 404 elsewhere is untouched ----------------------------------
$GLOBALS['wd_qv']    = array();
$GLOBALS['wd_status'] = null;
$GLOBALS['wp_query']  = new WP_Query();
wd_assert( 'non-dashboard 404 untouched', true === $rewrite->clear_dashboard_404( true ) );
wd_assert( 'non-dashboard wp_query untouched', true === $GLOBALS['wp_query']->is_404 );
wd_assert( 'non-dashboard status untouched', null === $GLOBALS['wd_status'] );

// --- 3. non-404 requests pass through --------------------------------------
wd_assert( 'non-404 request passes through', false === $rewrite->clear_dashboard_404( false ) );

// --- 4. partial deploy still exposes JSON ---------------------------------
Webino_Dashboard_Bootstrap::register_minimal_routes();
wd_assert( 'rest_api_init hook registered', ! empty( $GLOBALS['wd_actions']['rest_api_init'] ) );
foreach ( $GLOBALS['wd_actions']['rest_api_init'] as $callback ) {
	call_user_func( $callback );
}
wd_assert(
	'minimal health + bootstrap routes registered',
	'webino-dashboard/v1/health,webino-dashboard/v1/bootstrap' === implode( ',', $GLOBALS['wd_routes'] )
);

Webino_Dashboard_Bootstrap::register_broken_fallback_hooks();
wd_assert( 'broken-deploy admin notice registered', ! empty( $GLOBALS['wd_actions']['admin_notices'] ) );

wd_assert( 'load() reports the partial deploy as broken', false === Webino_Dashboard_Bootstrap::load() );

echo $fails > 0 ? "== test-deploy-hardening FAILED ({$fails} failed, {$ok} ok) ==\n" : "== test-deploy-hardening PASSED ({$ok} assertions) ==\n";
exit( $fails > 0 ? 1 : 0 );
