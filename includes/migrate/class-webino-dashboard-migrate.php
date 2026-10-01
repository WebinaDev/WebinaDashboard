<?php
/**
 * Migrate this WordPress site to a Webino tenant.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Boots admin UI, REST, and the background tick.
 */
final class Webino_Dashboard_Migrate {

	/**
	 * @return void
	 */
	public static function init() {
		if ( class_exists( 'Webino_Dashboard_Migrate_Client', false ) ) {
			Webino_Dashboard_Migrate_Client::init();
		}
		if ( class_exists( 'Webino_Dashboard_Migrate_Job', false ) ) {
			Webino_Dashboard_Migrate_Job::init();
		}
		if ( class_exists( 'Webino_Dashboard_Migrate_Admin', false ) ) {
			Webino_Dashboard_Migrate_Admin::init();
		}
		if ( class_exists( 'Webino_Dashboard_Migrate_REST', false ) ) {
			Webino_Dashboard_Migrate_REST::init();
		}
	}

	/**
	 * @return string
	 */
	public static function capability() {
		$cap = 'manage_options';
		if ( function_exists( 'apply_filters' ) ) {
			$filtered = apply_filters( 'webino_dashboard_migrate_capability', $cap );
			if ( is_string( $filtered ) && '' !== $filtered ) {
				$cap = $filtered;
			}
		}
		return $cap;
	}

	/**
	 * @return bool
	 */
	public static function current_user_can() {
		return function_exists( 'current_user_can' ) && current_user_can( self::capability() );
	}
}
