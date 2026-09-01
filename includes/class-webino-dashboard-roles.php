<?php
/**
 * Custom dashboard roles (seller, accountant) and menu ACL.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers WP roles/caps and optional per-role sidebar ACL.
 */
final class Webino_Dashboard_Roles {

	const SELLER_ROLE     = 'webino_seller';
	const ACCOUNTANT_ROLE = 'webino_accountant';

	const CAP_POS            = 'webino_pos';
	const CAP_CREATE_ORDERS  = 'webino_create_shop_orders';
	const CAP_VIEW_OWN       = 'webino_view_own_shop_orders';
	const CAP_ACCOUNTING     = 'webino_manage_accounting';

	const MENU_ACL_OPTION = 'webino_dashboard_menu_acl';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'ensure_roles' ), 5 );
		add_filter( 'webino_dashboard_modules', array( __CLASS__, 'filter_modules_by_menu_acl' ), 50 );
	}

	/**
	 * @return void
	 */
	public static function ensure_roles() {
		$seller_caps = array(
			'read'               => true,
			self::CAP_POS        => true,
			self::CAP_CREATE_ORDERS => true,
			self::CAP_VIEW_OWN   => true,
		);
		self::upsert_role( self::SELLER_ROLE, __( 'Seller', 'webino-dashboard' ), $seller_caps );

		$accountant_caps = array(
			'read'                   => true,
			self::CAP_ACCOUNTING     => true,
			'view_woocommerce_reports' => true,
		);
		self::upsert_role( self::ACCOUNTANT_ROLE, __( 'Accountant', 'webino-dashboard' ), $accountant_caps );

		foreach ( array( 'administrator', 'shop_manager' ) as $role_slug ) {
			$role = get_role( $role_slug );
			if ( ! $role ) {
				continue;
			}
			foreach ( array( self::CAP_POS, self::CAP_CREATE_ORDERS, self::CAP_ACCOUNTING ) as $cap ) {
				if ( ! $role->has_cap( $cap ) ) {
					$role->add_cap( $cap );
				}
			}
		}
	}

	/**
	 * @param string               $slug Role slug.
	 * @param string               $label Display name.
	 * @param array<string,bool>   $caps Caps.
	 * @return void
	 */
	private static function upsert_role( $slug, $label, array $caps ) {
		$existing = get_role( $slug );
		if ( ! $existing ) {
			add_role( $slug, $label, $caps );
			return;
		}
		foreach ( $caps as $cap => $grant ) {
			if ( $grant && ! $existing->has_cap( $cap ) ) {
				$existing->add_cap( $cap );
			}
		}
	}

	/**
	 * Menu ACL map: role_slug => list of allowed module/child ids (empty = no override).
	 *
	 * @return array<string,array<int,string>>
	 */
	public static function get_menu_acl() {
		$raw = get_option( self::MENU_ACL_OPTION, array() );
		return is_array( $raw ) ? $raw : array();
	}

	/**
	 * @param array<string,array<int,string>> $acl ACL map.
	 * @return array<string,array<int,string>>
	 */
	public static function save_menu_acl( array $acl ) {
		$clean = array();
		foreach ( $acl as $role => $ids ) {
			$role = sanitize_key( (string) $role );
			if ( '' === $role || ! is_array( $ids ) ) {
				continue;
			}
			$clean[ $role ] = array_values( array_unique( array_map( 'sanitize_key', $ids ) ) );
		}
		update_option( self::MENU_ACL_OPTION, $clean, false );
		return $clean;
	}

	/**
	 * Restrict modules when the current user's primary role has an ACL list.
	 *
	 * @param array<int,array<string,mixed>> $modules Modules.
	 * @return array<int,array<string,mixed>>
	 */
	public static function filter_modules_by_menu_acl( $modules ) {
		$user = wp_get_current_user();
		if ( ! $user || ! $user->exists() || empty( $user->roles ) ) {
			return $modules;
		}
		$acl   = self::get_menu_acl();
		$allow = null;
		foreach ( (array) $user->roles as $role ) {
			if ( isset( $acl[ $role ] ) && is_array( $acl[ $role ] ) && $acl[ $role ] ) {
				$allow = $acl[ $role ];
				break;
			}
		}
		if ( null === $allow ) {
			return $modules;
		}
		$allow_set = array_fill_keys( $allow, true );
		$out       = array();
		foreach ( $modules as $mod ) {
			$id = isset( $mod['id'] ) ? (string) $mod['id'] : '';
			if ( ! isset( $allow_set[ $id ] ) ) {
				continue;
			}
			if ( ! empty( $mod['children'] ) && is_array( $mod['children'] ) ) {
				$kids = array();
				foreach ( $mod['children'] as $child ) {
					$cid = isset( $child['id'] ) ? (string) $child['id'] : '';
					if ( isset( $allow_set[ $cid ] ) || isset( $allow_set[ $id ] ) ) {
						$kids[] = $child;
					}
				}
				$mod['children'] = $kids;
			}
			$out[] = $mod;
		}
		return $out;
	}
}
