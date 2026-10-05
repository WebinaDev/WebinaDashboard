<?php
/**
 * Wholesale partner role and access.
 *
 * @package    WFCP
 * @subpackage WFCP/includes/services
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Partner (همکار) role: wholesale cart + dashboard portal.
 */
class WFCP_Wholesale_Partner {

	const ROLE       = 'webino_partner';
	const CAP        = 'webino_wholesale';
	const PORTAL_CAP = 'webino_partner_portal';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_role' ), 5 );
	}

	/**
	 * Register webino_partner based on WooCommerce customer.
	 *
	 * @return void
	 */
	public static function register_role() {
		$extra = array(
			self::CAP        => true,
			self::PORTAL_CAP => true,
			'webino_account_portal' => true,
		);

		if ( get_role( self::ROLE ) ) {
			$role = get_role( self::ROLE );
			if ( $role ) {
				if ( ! $role->has_cap( self::CAP ) ) {
					$role->add_cap( self::CAP );
				}
				if ( ! $role->has_cap( self::PORTAL_CAP ) ) {
					$role->add_cap( self::PORTAL_CAP );
				}
				if ( ! $role->has_cap( 'webino_account_portal' ) ) {
					$role->add_cap( 'webino_account_portal' );
				}
			}
			return;
		}

		$caps     = array_merge( array( 'read' => true ), $extra );
		$customer = get_role( 'customer' );
		if ( $customer && is_array( $customer->capabilities ) ) {
			$caps = array_merge( $customer->capabilities, $extra );
		}
		add_role( self::ROLE, __( 'همکار (عمده)', 'webina-woo-core' ), $caps );
	}

	/**
	 * Whether wholesale module is enabled.
	 *
	 * @return bool
	 */
	public static function wholesale_enabled() {
		return class_exists( 'WFCP_Helper', false ) && WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'wholesale', 'enabled' ) );
	}

	/**
	 * Quantity/weight threshold mode for regular customers.
	 *
	 * @return bool
	 */
	public static function threshold_enabled() {
		if ( ! self::wholesale_enabled() ) {
			return false;
		}
		return WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'wholesale', 'threshold_enabled' ) );
	}

	/**
	 * Partner-role wholesale mode.
	 *
	 * @return bool
	 */
	public static function partner_enabled() {
		if ( ! self::wholesale_enabled() ) {
			return false;
		}
		return WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'wholesale', 'partner_enabled' ) );
	}

	/**
	 * Legacy: only partners may use wholesale (threshold off).
	 *
	 * @return bool
	 */
	public static function partner_only() {
		return self::partner_enabled() && ! self::threshold_enabled();
	}

	/**
	 * @param int|null $user_id User ID or current user.
	 * @return bool
	 */
	public static function is_partner( $user_id = null ) {
		if ( null === $user_id ) {
			$user_id = get_current_user_id();
		}
		$user_id = (int) $user_id;
		if ( $user_id <= 0 ) {
			return false;
		}
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}
		if ( user_can( $user, self::CAP ) ) {
			return true;
		}
		return in_array( self::ROLE, (array) $user->roles, true );
	}

	/**
	 * Logged-in partner shopping with partner mode on.
	 *
	 * @return bool
	 */
	public static function is_partner_shopping() {
		return self::partner_enabled() && self::is_partner();
	}

	/**
	 * Show wholesale price row (partners and/or threshold guests).
	 *
	 * @return bool
	 */
	public static function current_sees_wholesale() {
		if ( ! self::wholesale_enabled() ) {
			return false;
		}
		if ( self::is_partner_shopping() ) {
			return true;
		}
		return self::threshold_enabled();
	}

	/**
	 * Partners always see retail + wholesale; retail is never hidden.
	 *
	 * @return bool
	 */
	public static function hide_retail_ui() {
		return false;
	}
}
