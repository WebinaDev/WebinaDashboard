<?php
/**
 * Front-end routes for /dashboard.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers rewrite rules and serves the SPA shell template.
 */
class Webino_Dashboard_Rewrite {

	/**
	 * @return void
	 */
	public function register_rewrites() {
		add_rewrite_rule( '^dashboard(/.*)?$', 'index.php?webino_dashboard=1&wd_path=$matches[1]', 'top' );
	}

	/**
	 * @param array<int,string> $vars Query vars.
	 * @return array<int,string>
	 */
	public function register_query_vars( $vars ) {
		$vars[] = 'webino_dashboard';
		$vars[] = 'wd_path';
		return $vars;
	}

	/**
	 * Fallback when rewrite rules are stale: map /dashboard/* from REQUEST_URI.
	 *
	 * @param WP $wp WordPress environment instance.
	 * @return void
	 */
	public function parse_dashboard_request( $wp ) {
		if ( ! empty( $wp->query_vars['webino_dashboard'] ) ) {
			return;
		}

		$relative = $this->request_path_relative_to_home();
		if ( null === $relative ) {
			return;
		}

		if ( 'dashboard' === $relative ) {
			$wp->query_vars['webino_dashboard'] = '1';
			$wp->query_vars['wd_path']          = '';
			return;
		}

		if ( 0 === strpos( $relative, 'dashboard/' ) ) {
			$wp->query_vars['webino_dashboard'] = '1';
			$wp->query_vars['wd_path']          = substr( $relative, strlen( 'dashboard/' ) );
		}
	}

	/**
	 * Request path relative to the site home (no leading/trailing slashes), or null.
	 *
	 * @return string|null
	 */
	private function request_path_relative_to_home() {
		$uri = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( (string) $_SERVER['REQUEST_URI'] ) : '';
		$path = wp_parse_url( $uri, PHP_URL_PATH );
		if ( ! is_string( $path ) || '' === $path ) {
			return null;
		}

		$path = trim( $path, '/' );
		$home_path = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
		if ( is_string( $home_path ) && '' !== $home_path && '/' !== $home_path ) {
			$home_path = trim( $home_path, '/' );
			if ( $home_path !== '' && 0 === strpos( $path, $home_path . '/' ) ) {
				$path = substr( $path, strlen( $home_path ) + 1 );
			} elseif ( $path === $home_path ) {
				$path = '';
			}
		}

		return $path;
	}

	/**
	 * @param string $template Path to theme template.
	 * @return string
	 */
	public function template_include( $template ) {
		if ( ! $this->is_dashboard_request() ) {
			return $template;
		}

		$cap = apply_filters( 'webino_dashboard_required_cap', 'read' );
		if ( is_user_logged_in() && ! current_user_can( $cap ) ) {
			wp_die(
				esc_html__( 'You do not have permission to access this dashboard.', 'webino-dashboard' ),
				esc_html__( 'Dashboard', 'webino-dashboard' ),
				array( 'response' => 403 )
			);
		}

		$shell = WEBINO_DASHBOARD_DIR . 'templates/dashboard-shell.php';
		if ( is_readable( $shell ) ) {
			return $shell;
		}

		return $template;
	}

	/**
	 * True when the main query is serving the dashboard app.
	 *
	 * @return bool
	 */
	public function is_dashboard_request() {
		return (bool) get_query_var( 'webino_dashboard' );
	}

	/**
	 * Absolute dashboard URL with a trailing slash (SPA-safe).
	 *
	 * @param string               $path  Path under /dashboard (e.g. 'login', 'shop/products/1').
	 * @param array<string,string> $query Optional query args.
	 * @return string
	 */
	public static function url( $path = '', $query = array() ) {
		$path = trim( (string) $path, '/' );
		$base = trailingslashit( home_url( '/dashboard/' . ( '' !== $path ? $path : '' ) ) );
		if ( ! empty( $query ) && is_array( $query ) ) {
			return add_query_arg( $query, $base );
		}
		return $base;
	}

	/**
	 * Whether a URL path is under the site dashboard front route.
	 *
	 * @param string $path Absolute or site-relative path (may include home subdirectory).
	 * @return bool
	 */
	public static function is_dashboard_path( $path ) {
		if ( ! is_string( $path ) || '' === $path ) {
			return false;
		}
		$path = rawurldecode( $path );
		$path = '/' . ltrim( $path, '/' );

		$home_path = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
		$home_path = is_string( $home_path ) ? untrailingslashit( $home_path ) : '';
		if ( '' !== $home_path && '/' !== $home_path ) {
			if ( 0 === strpos( $path, $home_path . '/' ) ) {
				$path = substr( $path, strlen( $home_path ) );
			} elseif ( $path === $home_path ) {
				return false;
			}
			$path = '/' . ltrim( (string) $path, '/' );
		}

		return '/dashboard' === $path || 0 === strpos( $path, '/dashboard/' );
	}

	/**
	 * Ensure a dashboard location URL has a trailing slash on the path.
	 *
	 * @param string $location Absolute or relative redirect URL.
	 * @return string
	 */
	public static function ensure_trailing_slash_url( $location ) {
		if ( ! is_string( $location ) || '' === $location ) {
			return $location;
		}

		$parts = wp_parse_url( $location );
		if ( ! is_array( $parts ) || empty( $parts['path'] ) || ! is_string( $parts['path'] ) ) {
			return $location;
		}

		$path = $parts['path'];
		if ( ! self::is_dashboard_path( $path ) ) {
			return $location;
		}

		if ( '/' === substr( $path, -1 ) ) {
			return $location;
		}

		$parts['path'] = trailingslashit( $path );
		return self::build_url_from_parts( $parts, $location );
	}

	/**
	 * Rebuild a URL from parse_url parts, preserving relative vs absolute form.
	 *
	 * @param array<string,mixed> $parts    Parsed URL parts.
	 * @param string              $original Original location string.
	 * @return string
	 */
	private static function build_url_from_parts( array $parts, $original ) {
		$scheme   = isset( $parts['scheme'] ) ? (string) $parts['scheme'] . '://' : '';
		$user     = isset( $parts['user'] ) ? (string) $parts['user'] : '';
		$pass     = isset( $parts['pass'] ) ? ':' . (string) $parts['pass'] : '';
		$auth     = ( '' !== $user || '' !== $pass ) ? $user . $pass . '@' : '';
		$host     = isset( $parts['host'] ) ? (string) $parts['host'] : '';
		$port     = isset( $parts['port'] ) ? ':' . (int) $parts['port'] : '';
		$path     = isset( $parts['path'] ) ? (string) $parts['path'] : '';
		$query    = isset( $parts['query'] ) && '' !== (string) $parts['query'] ? '?' . (string) $parts['query'] : '';
		$fragment = isset( $parts['fragment'] ) && '' !== (string) $parts['fragment'] ? '#' . (string) $parts['fragment'] : '';

		// Relative URL (no host): keep leading slash path only.
		if ( '' === $host && 0 !== strpos( (string) $original, '//' ) ) {
			return $path . $query . $fragment;
		}

		return $scheme . $auth . $host . $port . $path . $query . $fragment;
	}
}
