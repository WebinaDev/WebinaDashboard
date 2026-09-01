#!/usr/bin/env php
<?php
/**
 * CLI smoke for dashboard trailing-slash URL helpers (no WordPress bootstrap).
 *
 * @package WebinoDashboard
 */

define( 'ABSPATH', __DIR__ . '/' );

if ( ! function_exists( 'trailingslashit' ) ) {
	/**
	 * @param string $path Path.
	 * @return string
	 */
	function trailingslashit( $path ) {
		return rtrim( (string) $path, '/\\' ) . '/';
	}
}

if ( ! function_exists( 'untrailingslashit' ) ) {
	/**
	 * @param string $path Path.
	 * @return string
	 */
	function untrailingslashit( $path ) {
		return rtrim( (string) $path, '/\\' );
	}
}

if ( ! function_exists( 'home_url' ) ) {
	/**
	 * @param string $path Path.
	 * @return string
	 */
	function home_url( $path = '' ) {
		$path = (string) $path;
		if ( '' === $path ) {
			return 'https://example.test';
		}
		if ( 0 === strpos( $path, 'http://' ) || 0 === strpos( $path, 'https://' ) ) {
			return $path;
		}
		return 'https://example.test' . ( '/' === $path[0] ? '' : '/' ) . $path;
	}
}

if ( ! function_exists( 'wp_parse_url' ) ) {
	/**
	 * @param string   $url       URL.
	 * @param int|null $component Component.
	 * @return mixed
	 */
	function wp_parse_url( $url, $component = -1 ) {
		if ( -1 === $component ) {
			return parse_url( $url );
		}
		return parse_url( $url, $component );
	}
}

if ( ! function_exists( 'add_query_arg' ) ) {
	/**
	 * @param array<string,string>|string $key   Args or key.
	 * @param string                      $value Value or URL.
	 * @param string|null                 $url   URL.
	 * @return string
	 */
	function add_query_arg( $key, $value = null, $url = null ) {
		if ( is_array( $key ) ) {
			$url  = (string) $value;
			$args = $key;
		} else {
			$args = array( (string) $key => $value );
			$url  = (string) $url;
		}
		$parts = parse_url( $url );
		$q     = array();
		if ( ! empty( $parts['query'] ) ) {
			parse_str( (string) $parts['query'], $q );
		}
		foreach ( $args as $k => $v ) {
			$q[ (string) $k ] = (string) $v;
		}
		$parts['query'] = http_build_query( $q );
		$scheme         = isset( $parts['scheme'] ) ? $parts['scheme'] . '://' : '';
		$host           = $parts['host'] ?? '';
		$path           = $parts['path'] ?? '';
		$query          = ! empty( $parts['query'] ) ? '?' . $parts['query'] : '';
		return $scheme . $host . $path . $query;
	}
}

require dirname( __DIR__ ) . '/includes/class-webino-dashboard-rewrite.php';

$fail = 0;
$assert = static function ( $ok, $msg ) use ( &$fail ) {
	if ( $ok ) {
		fwrite( STDOUT, "OK: {$msg}\n" );
		return;
	}
	++$fail;
	fwrite( STDERR, "FAIL: {$msg}\n" );
};

$assert( Webino_Dashboard_Rewrite::is_dashboard_path( '/dashboard' ), 'is_dashboard_path /dashboard' );
$assert( Webino_Dashboard_Rewrite::is_dashboard_path( '/dashboard/' ), 'is_dashboard_path /dashboard/' );
$assert( Webino_Dashboard_Rewrite::is_dashboard_path( '/dashboard/login' ), 'is_dashboard_path /dashboard/login' );
$assert( ! Webino_Dashboard_Rewrite::is_dashboard_path( '/wp-login.php' ), 'is_dashboard_path rejects wp-login.php' );
$assert( ! Webino_Dashboard_Rewrite::is_dashboard_path( '/wp-admin/' ), 'is_dashboard_path rejects wp-admin' );

$assert(
	'https://example.test/dashboard/' === Webino_Dashboard_Rewrite::url(),
	'url() root has trailing slash'
);
$assert(
	'https://example.test/dashboard/login/' === Webino_Dashboard_Rewrite::url( 'login' ),
	'url(login) has trailing slash'
);
$assert(
	false !== strpos( Webino_Dashboard_Rewrite::url( '', array( 'repaired' => '1' ) ), '/dashboard/?repaired=1' )
		|| false !== strpos( Webino_Dashboard_Rewrite::url( '', array( 'repaired' => '1' ) ), '/dashboard/?repaired=1' ),
	'url() with query keeps slash before query'
);

$assert(
	'https://example.test/dashboard/login/' === Webino_Dashboard_Rewrite::ensure_trailing_slash_url( 'https://example.test/dashboard/login' ),
	'ensure_trailing_slash adds slash'
);
$assert(
	'https://example.test/dashboard/login/?x=1' === Webino_Dashboard_Rewrite::ensure_trailing_slash_url( 'https://example.test/dashboard/login?x=1' ),
	'ensure_trailing_slash preserves query'
);
$assert(
	'https://example.test/wp-login.php?loggedout=true' === Webino_Dashboard_Rewrite::ensure_trailing_slash_url( 'https://example.test/wp-login.php?loggedout=true' ),
	'ensure_trailing_slash leaves wp-login alone'
);
$assert(
	'/dashboard/shop/products/' === Webino_Dashboard_Rewrite::ensure_trailing_slash_url( '/dashboard/shop/products' ),
	'ensure_trailing_slash works on relative paths'
);

// Abort-self semantics (mirrors plugin filter rules without loading the plugin).
$abort_self = static function ( $is_dashboard_request, $req_uri, $location ) {
	if ( ! $is_dashboard_request ) {
		return $location;
	}
	$req_path  = wp_parse_url( 'http://local.invalid' . $req_uri, PHP_URL_PATH );
	$req_query = wp_parse_url( 'http://local.invalid' . $req_uri, PHP_URL_QUERY );
	$loc_path  = wp_parse_url( $location, PHP_URL_PATH );
	$loc_query = wp_parse_url( $location, PHP_URL_QUERY );
	if ( ! is_string( $req_path ) || ! is_string( $loc_path ) ) {
		return $location;
	}
	$rq = is_string( $req_query ) ? $req_query : '';
	$lq = is_string( $loc_query ) ? $loc_query : '';
	if ( strtolower( $req_path ) === strtolower( $loc_path ) && $rq === $lq ) {
		return false;
	}
	return $location;
};

$assert(
	'https://example.test/wp-login.php?loggedout=true' === $abort_self( false, '/wp-login.php', 'https://example.test/wp-login.php?loggedout=true' ),
	'abort ignores non-dashboard (wp-login query-only redirect)'
);
$assert(
	'https://example.test/dashboard/login/' === $abort_self( true, '/dashboard/login', 'https://example.test/dashboard/login/' ),
	'abort allows slash-only on dashboard'
);
$assert(
	false === $abort_self( true, '/dashboard/login/?x=1', 'https://example.test/dashboard/login/?x=1' ),
	'abort kills exact self-loop on dashboard'
);
$assert(
	'https://example.test/dashboard/login/?y=2' === $abort_self( true, '/dashboard/login/?x=1', 'https://example.test/dashboard/login/?y=2' ),
	'abort allows query change on dashboard'
);

if ( $fail > 0 ) {
	fwrite( STDERR, "FAILED {$fail} assertion(s)\n" );
	exit( 1 );
}

fwrite( STDOUT, "OK: dashboard slash helpers\n" );
exit( 0 );
