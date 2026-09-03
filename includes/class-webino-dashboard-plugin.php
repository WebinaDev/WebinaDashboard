<?php
/**
 * Core plugin loader.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Singleton bootstrap.
 */
final class Webino_Dashboard_Plugin {

	const FLUSH_REWRITES_HOOK = 'webino_dashboard_flush_rewrites';

	const DEFERRED_INSTALL_HOOK = 'webino_dashboard_deferred_install';

	const REPAIR_AJAX_ACTION = 'webino_dashboard_repair';

	const REWRITE_FLUSH_PENDING_TRANSIENT = 'webino_dashboard_rewrite_flush_pending';

	/**
	 * @var Webino_Dashboard_Plugin|null
	 */
	private static $instance = null;

	/**
	 * @var Webino_Dashboard_Rewrite
	 */
	public $rewrite;

	/**
	 * @var Webino_Dashboard_Assets
	 */
	public $assets;

	/**
	 * @return Webino_Dashboard_Plugin
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		$this->rewrite = new Webino_Dashboard_Rewrite();
		$this->assets  = new Webino_Dashboard_Assets();

		register_activation_hook( WEBINO_DASHBOARD_FILE, array( $this, 'activate' ) );
		register_deactivation_hook( WEBINO_DASHBOARD_FILE, array( $this, 'deactivate' ) );

		add_action( 'init', array( $this->rewrite, 'register_rewrites' ), 1 );
		add_action( 'init', array( $this, 'maybe_flush_rewrites' ), 2 );
		add_action( self::FLUSH_REWRITES_HOOK, array( $this, 'run_deferred_rewrite_flush' ) );
		add_action( self::DEFERRED_INSTALL_HOOK, array( $this, 'run_deferred_install' ) );
		add_action( 'wp_ajax_' . self::REPAIR_AJAX_ACTION, array( $this, 'ajax_dashboard_repair' ) );
		add_action( 'parse_request', array( $this->rewrite, 'parse_dashboard_request' ), 1 );
		add_action( 'init', array( 'Webino_Dashboard_Taxonomies', 'register' ), 2 );
		add_action( 'init', array( 'Webino_Dashboard_I18n', 'load_textdomain' ) );
		Webino_Dashboard_I18n::init();
		Webino_Dashboard_Roles::init();
		add_filter( 'query_vars', array( $this->rewrite, 'register_query_vars' ) );
		add_filter( 'template_include', array( $this->rewrite, 'template_include' ), 99 );
		add_action( 'template_redirect', array( $this, 'maybe_force_dashboard_trailing_slash' ), -1 );
		add_action( 'template_redirect', array( $this, 'maybe_prevent_dashboard_html_cache' ), 0 );
		add_action( 'template_redirect', array( $this, 'maybe_require_login' ), 1 );
		add_action( 'template_redirect', array( $this, 'maybe_require_license' ), 2 );
		add_filter( 'wp_redirect', array( $this, 'normalize_dashboard_redirect_location' ), 0, 2 );
		add_filter( 'wp_redirect', array( $this, 'abort_self_redirect' ), 1, 2 );
		add_filter( 'login_redirect', array( $this, 'normalize_login_redirect' ), 10, 3 );
		add_filter( 'redirect_canonical', array( $this, 'disable_canonical_on_dashboard' ), 10, 1 );
		add_filter( 'show_admin_bar', array( $this, 'hide_admin_bar' ) );
		add_filter( 'document_title_parts', array( $this, 'document_title_parts' ), 20, 1 );
		add_action( 'wp_enqueue_scripts', array( $this->assets, 'enqueue' ), 5 );
		add_action( 'wp_enqueue_scripts', array( $this->assets, 'dequeue_theme_on_dashboard' ), 999 );
		add_filter( 'litespeed_control_cacheable', array( $this, 'litespeed_dashboard_not_cacheable' ) );
		add_filter( 'litespeed_optimize_js_excludes', array( $this, 'litespeed_exclude_dashboard_assets' ) );
		add_filter( 'litespeed_optm_js_defer_exc', array( $this, 'litespeed_exclude_dashboard_assets' ) );
		add_filter( 'litespeed_optm_gm_js_exc', array( $this, 'litespeed_exclude_dashboard_assets' ) );
		add_filter( 'litespeed_optimize_css_excludes', array( $this, 'litespeed_exclude_dashboard_assets' ) );
		add_filter( 'litespeed_optm_css_exc', array( $this, 'litespeed_exclude_dashboard_assets' ) );
		add_filter( 'litespeed_optm_uri_exc', array( $this, 'litespeed_exclude_dashboard_uri' ) );
		add_filter( 'litespeed_ucss_exc', array( $this, 'litespeed_exclude_dashboard_uri' ) );
		add_filter( 'litespeed_can_optm', array( $this, 'litespeed_can_optm_dashboard' ) );

		Webino_Dashboard_REST::init();
		Webino_Dashboard_REST_Crud::init();
		if ( class_exists( 'Webino_Dashboard_Product_Slugs', false ) ) {
			Webino_Dashboard_Product_Slugs::init();
		}
		if ( class_exists( 'Webino_Dashboard_Coupon_Restrictions', false ) ) {
			Webino_Dashboard_Coupon_Restrictions::init();
		}
		if ( class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
			Webino_Dashboard_Variation_Swatches::init();
		}
		if ( class_exists( 'Webino_Dashboard_Order_Configs', false ) ) {
			Webino_Dashboard_Order_Configs::init();
		}
		if ( class_exists( 'Webino_Dashboard_Order_Notes', false ) ) {
			Webino_Dashboard_Order_Notes::init();
		}
		if ( class_exists( 'Webino_Dashboard_Pay_Order', false ) ) {
			Webino_Dashboard_Pay_Order::init();
		}

		add_action( 'woocommerce_new_order', array( __CLASS__, 'invalidate_dashboard_caches' ) );
		add_action( 'woocommerce_update_order', array( __CLASS__, 'invalidate_dashboard_caches' ) );
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'invalidate_dashboard_caches' ) );
		add_action( 'save_post_product', array( __CLASS__, 'invalidate_dashboard_caches' ) );
		add_action( 'deleted_post', array( __CLASS__, 'invalidate_dashboard_caches' ) );
	}

	/**
	 * Drop overview/bootstrap transients when shop data changes.
	 *
	 * @return void
	 */
	public static function invalidate_dashboard_caches() {
		if ( class_exists( 'Webino_Dashboard_SSR', false ) ) {
			Webino_Dashboard_SSR::invalidate_user_caches();
		}
	}

	/**
	 * Re-register dashboard rewrites when the plugin version changes.
	 *
	 * @return void
	 */
	public function maybe_flush_rewrites() {
		$option = 'webino_dashboard_rewrite_version';
		$stored = (string) get_option( $option, '' );
		if ( $stored === WEBINO_DASHBOARD_VERSION ) {
			return;
		}
		if ( ! get_transient( self::REWRITE_FLUSH_PENDING_TRANSIENT ) ) {
			set_transient( self::REWRITE_FLUSH_PENDING_TRANSIENT, WEBINO_DASHBOARD_VERSION, DAY_IN_SECONDS );
			self::schedule_rewrite_flush();
			self::flush_all_bootstrap_transients();
			if ( class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
				delete_option( Webino_Dashboard_Variation_Swatches::YITH_MIGRATE_OPTION );
			}
			if ( function_exists( 'opcache_reset' ) ) {
				// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				@opcache_reset();
			}
			if ( function_exists( 'litespeed_purge_all' ) ) {
				litespeed_purge_all();
			}
			if ( has_action( 'litespeed_purge_all' ) ) {
				do_action( 'litespeed_purge_all' );
			}
		}
	}

	/**
	 * Defer expensive rewrite flush so wp-admin (e.g. permalinks) does not white-screen.
	 *
	 * @return void
	 */
	public static function schedule_rewrite_flush() {
		if ( ! wp_next_scheduled( self::FLUSH_REWRITES_HOOK ) ) {
			wp_schedule_single_event( time() + 1, self::FLUSH_REWRITES_HOOK );
		}
	}

	/**
	 * @return void
	 */
	public function run_deferred_rewrite_flush() {
		$this->rewrite->register_rewrites();
		if ( class_exists( 'Webino_Dashboard_Pay_Order', false ) ) {
			Webino_Dashboard_Pay_Order::register_rewrites();
		}
		flush_rewrite_rules( false );
		update_option( 'webino_dashboard_rewrite_version', WEBINO_DASHBOARD_VERSION, false );
		delete_transient( self::REWRITE_FLUSH_PENDING_TRANSIENT );
	}

	/**
	 * Deferred table creation — keeps plugin activation fast on slow hosts.
	 *
	 * @return void
	 */
	public function run_deferred_install() {
		Webino_Dashboard_Install::activate();
	}

	/**
	 * Shared repair steps (bootstrap cache, license nag, rewrite schedule).
	 *
	 * @return void
	 */
	public static function run_dashboard_repair() {
		self::flush_all_bootstrap_transients();
		Webino_Dashboard_License::instance()->repair_transport_state();
		if ( class_exists( 'Webino_Dashboard_Product_Slugs', false ) ) {
			Webino_Dashboard_Product_Slugs::heal_rank_math_product_redirects();
			update_option( Webino_Dashboard_Product_Slugs::HEAL_OPTION, WEBINO_DASHBOARD_VERSION, false );
		}
		if ( ! get_transient( self::REWRITE_FLUSH_PENDING_TRANSIENT ) ) {
			set_transient( self::REWRITE_FLUSH_PENDING_TRANSIENT, WEBINO_DASHBOARD_VERSION, DAY_IN_SECONDS );
		}
		self::schedule_rewrite_flush();
		if ( function_exists( 'opcache_reset' ) ) {
			// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			@opcache_reset();
		}
	}

	/**
	 * Admin-ajax repair — works without SPA boot (logged-in manage_options).
	 *
	 * @return void
	 */
	public function ajax_dashboard_repair() {
		if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
			status_header( 403 );
			wp_die( esc_html__( 'Forbidden', 'webino-dashboard' ), '', array( 'response' => 403 ) );
		}
		self::run_dashboard_repair();
		wp_safe_redirect( Webino_Dashboard_Rewrite::url( '', array( 'repaired' => '1' ) ) );
		exit;
	}

	/**
	 * Drop per-user bootstrap transients after plugin updates.
	 *
	 * @return void
	 */
	public static function flush_all_bootstrap_transients() {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_webino_dashboard_boot_%' OR option_name LIKE '_transient_timeout_webino_dashboard_boot_%'"
		);
	}

	/**
	 * @return void
	 */
	private function flush_bootstrap_transients() {
		self::flush_all_bootstrap_transients();
	}

	/**
	 * @param bool $cacheable LiteSpeed cacheable flag.
	 * @return bool
	 */
	public function litespeed_dashboard_not_cacheable( $cacheable ) {
		if ( $this->rewrite->is_dashboard_request() ) {
			return false;
		}
		return $cacheable;
	}

	/**
	 * Keep Vite module bundles out of LiteSpeed minify/combine/push.
	 *
	 * @param mixed $excludes Existing excludes (array or newline string).
	 * @return mixed
	 */
	public function litespeed_exclude_dashboard_assets( $excludes ) {
		$add = array(
			'dashboard-build',
			'dashboard-shell',
			'WebinaDashboard/assets/dashboard-build',
		);
		if ( is_string( $excludes ) ) {
			$lines = preg_split( '/\r\n|\r|\n/', $excludes );
			$lines = is_array( $lines ) ? $lines : array();
			foreach ( $add as $item ) {
				if ( ! in_array( $item, $lines, true ) ) {
					$lines[] = $item;
				}
			}
			return implode( "\n", $lines );
		}
		if ( ! is_array( $excludes ) ) {
			$excludes = array();
		}
		foreach ( $add as $item ) {
			if ( ! in_array( $item, $excludes, true ) ) {
				$excludes[] = $item;
			}
		}
		return $excludes;
	}

	/**
	 * Skip page optimization on /dashboard SPA routes.
	 *
	 * @param mixed $list URI exclude list.
	 * @return mixed
	 */
	public function litespeed_exclude_dashboard_uri( $list ) {
		$add = array( '/dashboard', 'dashboard' );
		if ( is_string( $list ) ) {
			$lines = preg_split( '/\r\n|\r|\n/', $list );
			$lines = is_array( $lines ) ? $lines : array();
			foreach ( $add as $item ) {
				if ( ! in_array( $item, $lines, true ) ) {
					$lines[] = $item;
				}
			}
			return implode( "\n", $lines );
		}
		if ( ! is_array( $list ) ) {
			$list = array();
		}
		foreach ( $add as $item ) {
			if ( ! in_array( $item, $list, true ) ) {
				$list[] = $item;
			}
		}
		return $list;
	}

	/**
	 * Disable LiteSpeed page optimization entirely on dashboard requests.
	 *
	 * @param bool $can Whether optimization may run.
	 * @return bool
	 */
	public function litespeed_can_optm_dashboard( $can ) {
		if ( $this->rewrite->is_dashboard_request() ) {
			return false;
		}
		return $can;
	}

	/**
	 * Flush rewrite rules on activate.
	 */
	public function activate() {
		$this->rewrite->register_rewrites();
		set_transient( self::REWRITE_FLUSH_PENDING_TRANSIENT, WEBINO_DASHBOARD_VERSION, DAY_IN_SECONDS );
		self::schedule_rewrite_flush();
		self::flush_all_bootstrap_transients();
		if ( ! wp_next_scheduled( self::DEFERRED_INSTALL_HOOK ) ) {
			wp_schedule_single_event( time() + 5, self::DEFERRED_INSTALL_HOOK );
		}
		wp_schedule_single_event( time() + 30, Webino_Dashboard_License::CRON_HOOK );
		if ( function_exists( 'opcache_reset' ) ) {
			// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			@opcache_reset();
		}
	}

	/**
	 * Flush rewrite rules on deactivate.
	 */
	public function deactivate() {
		wp_clear_scheduled_hook( Webino_Dashboard_License::CRON_HOOK );
		wp_clear_scheduled_hook( self::FLUSH_REWRITES_HOOK );
		wp_clear_scheduled_hook( self::DEFERRED_INSTALL_HOOK );
		delete_transient( self::REWRITE_FLUSH_PENDING_TRANSIENT );
		flush_rewrite_rules( false );
	}

	/**
	 * Prevent CDN / browser from caching dashboard HTML (stale index.css / index.js links).
	 *
	 * @return void
	 */
	public function maybe_prevent_dashboard_html_cache() {
		if ( ! $this->rewrite->is_dashboard_request() ) {
			return;
		}
		if ( isset( $_GET['wd_diag'] ) && '1' === (string) wp_unslash( $_GET['wd_diag'] ) ) {
			return;
		}
		if ( isset( $_GET['wd_sniff'] ) && '1' === (string) wp_unslash( $_GET['wd_sniff'] ) ) {
			return;
		}
		if ( isset( $_GET['wd_repair'] ) && '1' === (string) wp_unslash( $_GET['wd_repair'] ) ) {
			return;
		}

		nocache_headers();
		if ( ! headers_sent() ) {
			header( 'Cache-Control: no-store, no-cache, must-revalidate, max-age=0' );
			header( 'Pragma: no-cache' );
			header( 'X-Webino-Dashboard-Version: ' . WEBINO_DASHBOARD_VERSION );
			header( 'X-LiteSpeed-Cache-Control: no-cache' );
			header( 'CDN-Cache-Control: no-store' );
		}
		if ( has_action( 'litespeed_control_set_nocache' ) ) {
			do_action( 'litespeed_control_set_nocache', 'webino-dashboard' );
		}
	}

	/**
	 * Optional strict guest redirect (off by default; SPA handles login).
	 *
	 * @return void
	 */
	public function maybe_require_login() {
		if ( ! $this->rewrite->is_dashboard_request() ) {
			return;
		}

		if ( ! apply_filters( 'webino_dashboard_redirect_guests', false ) ) {
			return;
		}

		if ( is_user_logged_in() ) {
			return;
		}

		$path = trim( (string) get_query_var( 'wd_path' ), '/' );
		if ( 'login' === $path || '' === $path ) {
			return;
		}

		wp_safe_redirect( Webino_Dashboard_Rewrite::url( 'login' ) );
		exit;
	}

	/**
	 * 301 dashboard HTML requests that lack a trailing slash (avoids empty 200 bodies).
	 *
	 * @return void
	 */
	public function maybe_force_dashboard_trailing_slash() {
		if ( ! $this->rewrite->is_dashboard_request() ) {
			return;
		}
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return;
		}
		if ( wp_doing_ajax() || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
			return;
		}
		if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'GET' !== strtoupper( (string) $_SERVER['REQUEST_METHOD'] ) && 'HEAD' !== strtoupper( (string) $_SERVER['REQUEST_METHOD'] ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$req = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
		if ( '' === $req ) {
			return;
		}
		$path = wp_parse_url( 'http://local.invalid' . $req, PHP_URL_PATH );
		if ( ! is_string( $path ) || '' === $path || '/' === substr( $path, -1 ) ) {
			return;
		}
		if ( ! Webino_Dashboard_Rewrite::is_dashboard_path( $path ) ) {
			return;
		}

		$query = wp_parse_url( 'http://local.invalid' . $req, PHP_URL_QUERY );
		$host  = isset( $_SERVER['HTTP_HOST'] ) ? (string) wp_unslash( $_SERVER['HTTP_HOST'] ) : '';
		if ( '' === $host ) {
			return;
		}
		$scheme = ( is_ssl() || ( ! empty( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && 'https' === strtolower( (string) wp_unslash( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) ) ) ) ? 'https' : 'http';
		$target = $scheme . '://' . $host . trailingslashit( $path );
		if ( is_string( $query ) && '' !== $query ) {
			$target .= '?' . $query;
		}
		wp_safe_redirect( $target, 301 );
		exit;
	}

	/**
	 * Ensure any redirect into /dashboard/* uses a trailing slash.
	 *
	 * @param string|false $location Target URL.
	 * @param int          $status   HTTP status.
	 * @return string|false
	 */
	public function normalize_dashboard_redirect_location( $location, $status = 302 ) {
		unset( $status );
		if ( false === $location || ! is_string( $location ) || '' === $location ) {
			return $location;
		}
		return Webino_Dashboard_Rewrite::ensure_trailing_slash_url( $location );
	}

	/**
	 * After wp-login, send users to a slash-normalized dashboard URL when applicable.
	 *
	 * @param string           $redirect_to           Requested redirect.
	 * @param string           $requested_redirect_to Raw requested redirect.
	 * @param WP_User|WP_Error $user                  Authenticated user or error.
	 * @return string
	 */
	public function normalize_login_redirect( $redirect_to, $requested_redirect_to, $user ) {
		unset( $requested_redirect_to, $user );
		if ( ! is_string( $redirect_to ) || '' === $redirect_to ) {
			return $redirect_to;
		}
		return Webino_Dashboard_Rewrite::ensure_trailing_slash_url( $redirect_to );
	}

	/**
	 * SPA routes must not be rewritten by WP canonical (avoids empty responses).
	 *
	 * @param string|false $redirect_url Canonical redirect target.
	 * @return string|false
	 */
	public function disable_canonical_on_dashboard( $redirect_url ) {
		if ( $this->rewrite->is_dashboard_request() ) {
			return false;
		}
		return $redirect_url;
	}

	/**
	 * Abort only exact self-loop redirects on dashboard requests (Rank Math).
	 * Never touches wp-login / wp-admin; never aborts slash-only or query-only changes.
	 *
	 * @param string|false $location Target URL.
	 * @param int          $status   HTTP status.
	 * @return string|false
	 */
	public function abort_self_redirect( $location, $status = 302 ) {
		unset( $status );
		if ( false === $location || ! is_string( $location ) || '' === $location ) {
			return $location;
		}
		if ( ! $this->rewrite->is_dashboard_request() ) {
			return $location;
		}
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$req = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
		if ( '' === $req ) {
			return $location;
		}

		$req_path  = wp_parse_url( 'http://local.invalid' . $req, PHP_URL_PATH );
		$req_query = wp_parse_url( 'http://local.invalid' . $req, PHP_URL_QUERY );
		$loc_path  = wp_parse_url( $location, PHP_URL_PATH );
		$loc_query = wp_parse_url( $location, PHP_URL_QUERY );
		if ( ! is_string( $req_path ) || ! is_string( $loc_path ) || '' === $req_path || '' === $loc_path ) {
			return $location;
		}

		$norm_path = static function ( $path ) {
			$path = rawurldecode( (string) $path );
			if ( function_exists( 'mb_strtolower' ) ) {
				return mb_strtolower( $path );
			}
			return strtolower( $path );
		};
		$norm_query = static function ( $query ) {
			if ( ! is_string( $query ) || '' === $query ) {
				return '';
			}
			return (string) $query;
		};

		// Exact self-loop only (same path including slash + same query).
		if ( $norm_path( $req_path ) === $norm_path( $loc_path ) && $norm_query( $req_query ) === $norm_query( $loc_query ) ) {
			return false;
		}
		return $location;
	}

	/**
	 * Soft-then-hard license nag: only redirect after the grace period (no CRM sync here).
	 *
	 * @return void
	 */
	public function maybe_require_license() {
		if ( ! $this->rewrite->is_dashboard_request() ) {
			return;
		}

		if ( ! is_user_logged_in() ) {
			return;
		}

		$path = trim( (string) get_query_var( 'wd_path' ), '/' );
		if ( 'login' === $path || 0 === strpos( $path, 'login/' ) ) {
			return;
		}
		if ( 'license' === $path || 0 === strpos( $path, 'license/' ) ) {
			return;
		}

		$lic = Webino_Dashboard_License::instance();
		if ( ! $lic->should_gate_dashboard() ) {
			return;
		}

		wp_safe_redirect( Webino_Dashboard_Rewrite::url( 'license' ) );
		exit;
	}

	/**
	 * @param bool $show Whether admin bar should show.
	 * @return bool
	 */
	public function hide_admin_bar( $show ) {
		if ( $this->rewrite->is_dashboard_request() ) {
			return false;
		}
		return $show;
	}

	/**
	 * @param array<string,string> $title Title parts.
	 * @return array<string,string>
	 */
	public function document_title_parts( $title ) {
		if ( ! $this->rewrite->is_dashboard_request() ) {
			return $title;
		}
		$title['title']   = __( 'Dashboard', 'webino-dashboard' );
		$title['site']    = get_bloginfo( 'name', 'display' );
		$title['tagline'] = '';
		return $title;
	}
}
