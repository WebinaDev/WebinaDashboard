<?php
/**
 * Shared REST helpers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Static helpers for REST controllers.
 */
class Webino_Dashboard_Rest_Base {

	/**
	 * @return bool
	 */
	public static function can_read() {
		return is_user_logged_in() && current_user_can( 'read' );
	}

	/**
	 * @param string $cap Capability.
	 * @return bool
	 */
	public static function can( $cap ) {
		return is_user_logged_in() && current_user_can( $cap );
	}

	/**
	 * WooCommerce analytics / sales reports.
	 *
	 * @return bool
	 */
	public static function can_view_analytics() {
		return self::can( 'view_woocommerce_reports' ) || self::can( 'manage_woocommerce' );
	}

	/**
	 * Accounting module data (financial tables).
	 *
	 * @return bool
	 */
	public static function can_view_accounting() {
		return self::can( 'manage_options' );
	}

	/**
	 * License CRM refresh (admin only).
	 *
	 * @return bool
	 */
	public static function can_manage_license() {
		return self::can( 'manage_options' );
	}

	/**
	 * Validate role for user creation against editable roles.
	 *
	 * @param string $role Requested role slug.
	 * @return string|WP_Error Sanitized role or error.
	 */
	public static function sanitize_assignable_role( $role ) {
		$role = sanitize_key( (string) $role );
		if ( '' === $role ) {
			$role = get_option( 'default_role', 'subscriber' );
		}

		$editable = array_keys( get_editable_roles() );
		if ( ! in_array( $role, $editable, true ) ) {
			return new WP_Error( 'invalid_role', __( 'Role is not allowed.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		$default = get_option( 'default_role', 'subscriber' );
		if ( $role !== $default && ! current_user_can( 'promote_users' ) ) {
			return new WP_Error( 'forbidden_role', __( 'You cannot assign this role.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		return $role;
	}

	/**
	 * @param int    $post_id Post ID.
	 * @param string $type    Expected post type.
	 * @return WP_Post|WP_Error
	 */
	public static function get_post_for_type( $post_id, $type ) {
		$p = get_post( (int) $post_id );
		if ( ! $p || $type !== $p->post_type ) {
			return new WP_Error( 'not_found', __( 'Not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return $p;
	}

	/**
	 * @param WP_Post $post Post.
	 * @param string  $cap  Capability.
	 * @return bool|WP_Error
	 */
	public static function assert_post_cap( $post, $cap ) {
		if ( ! current_user_can( $cap, $post->ID ) ) {
			return new WP_Error( 'forbidden', __( 'Forbidden.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		return true;
	}

	/**
	 * Resolve login identifier to WP_User or null.
	 *
	 * @param string $login Email, username, or phone.
	 * @return WP_User|null
	 */
	public static function resolve_user_from_login( $login ) {
		$login = trim( (string) $login );
		if ( '' === $login ) {
			return null;
		}

		if ( is_email( $login ) ) {
			return get_user_by( 'email', $login );
		}

		if ( preg_match( '/^\+?[0-9]{10,15}$/', preg_replace( '/\s+/', '', $login ) ) ) {
			$normalized = preg_replace( '/\D+/', '', $login );
			$users      = get_users(
				array(
					'meta_query' => array(
						'relation' => 'OR',
						array(
							'key'     => 'billing_phone',
							'value'   => $normalized,
							'compare' => '=',
						),
						array(
							'key'     => 'webino_dashboard_phone',
							'value'   => $normalized,
							'compare' => '=',
						),
					),
					'number'     => 1,
				)
			);
			if ( ! empty( $users[0] ) && $users[0] instanceof WP_User ) {
				return $users[0];
			}
		}

		return get_user_by( 'login', $login );
	}

	/**
	 * Login form CSRF nonce action.
	 *
	 * @return string
	 */
	public static function login_nonce_action() {
		return 'webino_dashboard_login';
	}

	/**
	 * @param string $nonce Nonce from client.
	 * @return bool
	 */
	public static function verify_login_nonce( $nonce ) {
		return (bool) wp_verify_nonce( (string) $nonce, self::login_nonce_action() );
	}

	/**
	 * @param string $action Action key.
	 * @param int    $max    Max attempts per window.
	 * @param int    $window Seconds.
	 * @return bool True if allowed.
	 */
	public static function rate_limit_ok( $action, $max = 20, $window = 300 ) {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
		$key = 'wd_rl_' . $action . '_' . md5( $ip );
		$n   = (int) get_transient( $key );
		if ( $n >= $max ) {
			return false;
		}
		set_transient( $key, $n + 1, $window );
		return true;
	}

	/**
	 * @return string
	 */
	public static function accounting_table( $suffix ) {
		global $wpdb;
		return $wpdb->prefix . 'webino_acc_' . $suffix;
	}

	/**
	 * @return string
	 */
	public static function licenses_table() {
		global $wpdb;
		return $wpdb->prefix . 'webino_core_licenses';
	}
}
