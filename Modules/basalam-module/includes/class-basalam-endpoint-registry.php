<?php
/**
 * Basalam endpoint coverage registry.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Basalam_Endpoint_Registry {
	const CACHE_KEY = 'webino_basalam_endpoint_registry';
	const CACHE_TTL = 6 * HOUR_IN_SECONDS;

	/**
	 * @return array<string,mixed>
	 */
	public static function report() {
		$cached = get_transient( self::CACHE_KEY );
		if ( is_array( $cached ) ) {
			return $cached;
		}
		$items = array(
			array( 'method' => 'POST', 'path' => '/oauth/token', 'status' => 'implemented', 'source' => 'includes/api/class-basalam-auth.php' ),
			array( 'method' => 'POST', 'path' => '/gateway/payments', 'status' => 'implemented', 'source' => 'includes/class-basalam-gateway-service.php' ),
			array( 'method' => 'POST', 'path' => '/gateway/payments/verify', 'status' => 'implemented', 'source' => 'includes/class-basalam-gateway-service.php' ),
			array( 'method' => 'GET', 'path' => '/wallet/overview', 'status' => 'implemented', 'source' => 'includes/class-basalam-wallet-service.php' ),
			array( 'method' => 'GET', 'path' => '/wallet/settlements', 'status' => 'implemented', 'source' => 'includes/class-basalam-wallet-service.php' ),
			array( 'method' => 'GET', 'path' => '/subscriptions/plans', 'status' => 'implemented', 'source' => 'includes/class-basalam-subscriptions-service.php' ),
			array( 'method' => 'GET', 'path' => '/subscriptions/items', 'status' => 'implemented', 'source' => 'includes/class-basalam-subscriptions-service.php' ),
			array( 'method' => 'POST', 'path' => '/webhooks/events', 'status' => 'implemented', 'source' => 'includes/webhooks/class-basalam-webhook-handler.php' ),
		);
		$summary = array(
			'implemented' => count( $items ),
			'queued'      => 0,
			'pending'     => 0,
			'total'       => count( $items ),
		);
		$report = array(
			'summary' => $summary,
			'items'   => $items,
			'meta'    => array(
				'generated_at' => gmdate( 'c' ),
				'schema_version' => '1.0.0',
			),
		);
		set_transient( self::CACHE_KEY, $report, self::CACHE_TTL );
		return $report;
	}
}
