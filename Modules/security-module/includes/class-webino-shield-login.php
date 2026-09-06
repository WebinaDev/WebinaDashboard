<?php
/**
 * Login protection hooks.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Brute force, honeypot, enum protection.
 */
final class Webino_Shield_Login {

	/**
	 * @return void
	 */
	public static function init() {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['login']['protect'] ) ) {
			return;
		}

		add_filter( 'authenticate', array( __CLASS__, 'check_brute_force' ), 30, 3 );
		add_filter( 'authenticate', array( __CLASS__, 'check_honeypot' ), 5, 3 );
		add_filter( 'login_errors', array( __CLASS__, 'hide_errors' ) );
		add_action( 'wp_login_failed', array( __CLASS__, 'record_failure' ) );
		add_action( 'wp_login', array( __CLASS__, 'record_success' ), 10, 2 );

		if ( ! empty( $s['login']['disable_author_enum'] ) ) {
			add_action( 'template_redirect', array( __CLASS__, 'block_author_enum' ) );
		}

		if ( ! empty( $s['login']['disable_rest_users'] ) ) {
			add_filter( 'rest_endpoints', array( __CLASS__, 'restrict_rest_users' ) );
		}

		if ( ! empty( $s['login']['disable_xmlrpc'] ) ) {
			add_filter( 'xmlrpc_enabled', '__return_false' );
			add_filter( 'wp_xmlrpc_server_class', array( __CLASS__, 'disable_xmlrpc_class' ) );
		} elseif ( ! empty( $s['login']['xmlrpc_pingback_only'] ) ) {
			add_filter( 'xmlrpc_methods', array( __CLASS__, 'xmlrpc_pingback_only' ) );
		}

		if ( ! empty( $s['login']['disable_app_passwords'] ) ) {
			add_filter( 'wp_is_application_passwords_available', '__return_false' );
		}
	}

	/**
	 * @param WP_User|WP_Error|null $user     User.
	 * @param string                $username Username.
	 * @param string                $password Password.
	 * @return WP_User|WP_Error|null
	 */
	public static function check_brute_force( $user, $username, $password ) {
		unset( $password );
		$ip = Webino_Dashboard_Security::get_client_ip();
		if ( Webino_Shield_Blocklist::is_blocked( $ip ) ) {
			return new WP_Error( 'shield_locked', __( 'Too many failed login attempts. Please try again later.', 'webino-dashboard' ) );
		}
		$key   = 'shield_login_' . Webino_Dashboard_Security::ip_hash( $ip );
		$fails = (int) get_transient( $key );
		$s     = Webino_Dashboard_Security_Settings::get();
		if ( $fails >= (int) ( $s['login']['max_fail'] ?? 5 ) ) {
			Webino_Shield_Blocklist::auto_block( $ip, 'login_brute', (int) ( $s['login']['lock_min'] ?? 30 ) );
			return new WP_Error( 'shield_locked', __( 'Too many failed login attempts. Please try again later.', 'webino-dashboard' ) );
		}
		if ( ! empty( $s['login']['same_response_time_ms'] ) ) {
			usleep( (int) $s['login']['same_response_time_ms'] * 1000 );
		}
		return $user;
	}

	/**
	 * @param WP_User|WP_Error|null $user     User.
	 * @param string                $username Username.
	 * @param string                $password Password.
	 * @return WP_User|WP_Error|null
	 */
	public static function check_honeypot( $user, $username, $password ) {
		unset( $username, $password );
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['login']['honeypot'] ) ) {
			return $user;
		}
		if ( ! empty( $_POST['webino_shield_hp'] ) ) {
			$ip = Webino_Dashboard_Security::get_client_ip();
			Webino_Shield_Blocklist::auto_block( $ip, 'honeypot', 60 );
			return new WP_Error( 'shield_honeypot', __( 'Login blocked.', 'webino-dashboard' ) );
		}
		add_action( 'login_form', array( __CLASS__, 'render_honeypot' ) );
		return $user;
	}

	/**
	 * @return void
	 */
	public static function render_honeypot() {
		echo '<input type="text" name="webino_shield_hp" value="" style="display:none !important" tabindex="-1" autocomplete="off" />';
	}

	/**
	 * @param string $errors Errors.
	 * @return string
	 */
	public static function hide_errors( $errors ) {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( ! empty( $s['login']['hide_errors'] ) ) {
			return __( 'Invalid credentials.', 'webino-dashboard' );
		}
		return $errors;
	}

	/**
	 * @param string $username Username.
	 * @return void
	 */
	public static function record_failure( $username ) {
		$ip  = Webino_Dashboard_Security::get_client_ip();
		$key = 'shield_login_' . Webino_Dashboard_Security::ip_hash( $ip );
		$s   = Webino_Dashboard_Security_Settings::get();
		$win = (int) ( $s['login']['window_min'] ?? 10 ) * MINUTE_IN_SECONDS;
		$fails = (int) get_transient( $key );
		set_transient( $key, $fails + 1, $win );
		Webino_Shield_Audit::write( 'login_failed', 'user', sanitize_user( $username ), array( 'ip' => $ip ) );
	}

	/**
	 * @param string  $user_login Login.
	 * @param WP_User $user       User.
	 * @return void
	 */
	public static function record_success( $user_login, $user ) {
		unset( $user_login );
		$ip = Webino_Dashboard_Security::get_client_ip();
		delete_transient( 'shield_login_' . Webino_Dashboard_Security::ip_hash( $ip ) );
		if ( user_can( $user, 'administrator' ) ) {
			Webino_Shield_Notify::dispatch( 'admin_login', array(
				'user' => $user->user_login,
				'ip'   => $ip,
			) );
		}
	}

	/**
	 * @return void
	 */
	public static function block_author_enum() {
		if ( is_admin() || ! is_author() ) {
			return;
		}
		if ( isset( $_GET['author'] ) ) {
			wp_safe_redirect( home_url( '/' ), 301 );
			exit;
		}
	}

	/**
	 * @param array<string,mixed> $endpoints Endpoints.
	 * @return array<string,mixed>
	 */
	public static function restrict_rest_users( $endpoints ) {
		if ( is_user_logged_in() ) {
			return $endpoints;
		}
		unset( $endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
		return $endpoints;
	}

	/**
	 * @return bool
	 */
	public static function disable_xmlrpc_class() {
		return false;
	}

	/**
	 * @param array<string,callable> $methods Methods.
	 * @return array<string,callable>
	 */
	public static function xmlrpc_pingback_only( $methods ) {
		$keep = array();
		if ( isset( $methods['pingback.ping'] ) ) {
			$keep['pingback.ping'] = $methods['pingback.ping'];
		}
		return $keep;
	}
}
