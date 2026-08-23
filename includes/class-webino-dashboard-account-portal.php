<?php
/**
 * Customer / partner account portal capability.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Grants webino_account_portal to WooCommerce customers and wholesale partners.
 */
class Webino_Dashboard_Account_Portal {

	const CAP = 'webino_account_portal';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_caps' ), 5 );
	}

	/**
	 * @return void
	 */
	public static function register_caps() {
		foreach ( array( 'customer', 'webino_partner' ) as $role_slug ) {
			$role = get_role( $role_slug );
			if ( $role && ! $role->has_cap( self::CAP ) ) {
				$role->add_cap( self::CAP );
			}
		}
		$partner = get_role( 'webino_partner' );
		if ( $partner && class_exists( 'WFCP_Wholesale_Partner', false ) && ! $partner->has_cap( WFCP_Wholesale_Partner::PORTAL_CAP ) ) {
			$partner->add_cap( WFCP_Wholesale_Partner::PORTAL_CAP );
		}
	}
}
