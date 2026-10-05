<?php
/**
 * Basalam reconciliation and sync utilities.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Basalam_Reconciliation_Service {
	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function reconcile_wallet() {
		return Basalam_Wallet_Service::wallet_overview();
	}

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function reconcile_subscriptions() {
		return Basalam_Subscriptions_Service::subscriptions();
	}
}
