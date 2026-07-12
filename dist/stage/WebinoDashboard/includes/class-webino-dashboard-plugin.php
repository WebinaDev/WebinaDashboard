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
		add_action( 'init', array( $this, 'maybe_flush_rewrites' ), 20 );
		add_action( 'parse_request', array( $this->rewrite, 'parse_dashboard_request' ), 1 );
		add_action( 'init', array( 'Webino_Dashboard_Taxonomies', 'register' ), 2 );
		add_action( 'init', array( 'Webino_Dashboard_I18n', 'load_textdomain' ) );
		Webino_Dashboard_I18n::init();
		add_filter( 'query_vars', array( $this->rewrite, 'register_query_vars' ) );
		add_filter( 'template_include', array( $this->rewrite, 'template_include' ), 99 );
		add_action( 'template_redirect', array( $this, 'maybe_prevent_dashboard_html_cache' ), 0 );
		add_action( 'template_redirect', array( $this, 'maybe_require_login' ), 1 );
		add_action( 'template_redirect', array( $this, 'maybe_require_license' ), 2 );
		add_filter( 'show_admin_bar', array( $this, 'hide_admin_bar' ) );
		add_filter( 'document_title_parts', array( $this, 'document_title_parts' ), 20, 1 );
		add_action( 'wp_enqueue_scripts', array( $this->assets, 'enqueue' ), 5 );
		add_action( 'wp_enqueue_scripts', array( $this->assets, 'dequeue_theme_on_dashboard' ), 999 );
		add_filter( 'litespeed_control_cacheable', array( $this, 'litespeed_dashboard_not_cacheable' ) );

		Webino_Dashboard_REST::init();
		Webino_Dashboard_REST_Crud::init();
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
		$this->rewrite->register_rewrites();
		flush_rewrite_rules( false );
		update_option( $option, WEBINO_DASHBOARD_VERSION, false );
		$this->flush_bootstrap_transients();
		if ( function_exists( 'opcache_reset' ) ) {
			// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			@opcache_reset();
		}
	}

	/**
	 * Drop per-user bootstrap transients after plugin updates.
	 *
	 * @return void
	 */
	private function flush_bootstrap_transients() {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_webino_dashboard_boot_%' OR option_name LIKE '_transient_timeout_webino_dashboard_boot_%'"
		);
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
	 * Flush rewrite rules on activate.
	 */
	public function activate() {
		Webino_Dashboard_Install::activate();
		$this->rewrite->register_rewrites();
		flush_rewrite_rules( false );
		update_option( 'webino_dashboard_rewrite_version', WEBINO_DASHBOARD_VERSION, false );
		$this->flush_bootstrap_transients();
		Webino_Dashboard_License::instance()->remote_license_check( true, 'install' );
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

		nocache_headers();
		if ( ! headers_sent() ) {
			header( 'Cache-Control: no-store, no-cache, must-revalidate, max-age=0' );
			header( 'Pragma: no-cache' );
			header( 'X-Webino-Dashboard-Version: ' . WEBINO_DASHBOARD_VERSION );
			header( 'X-LiteSpeed-Cache-Control: no-cache' );
			header( 'CDN-Cache-Control: no-store' );
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

		wp_safe_redirect( home_url( '/dashboard/login' ) );
		exit;
	}

	/**
	 * Block dashboard SPA routes until CRM license is active (except login/license).
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
		if ( $lic->is_license_check_stale() ) {
			$lic->maybe_sync_if_stale( 'gate' );
		}
		if ( ! $lic->should_gate_dashboard() ) {
			return;
		}

		wp_safe_redirect( home_url( '/dashboard/license' ) );
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
