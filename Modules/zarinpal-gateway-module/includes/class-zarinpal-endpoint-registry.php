<?php
/**
 * Endpoint coverage registry for ZarinPal PG v4 + GraphQL refund.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cached coverage report.
 */
final class Zarinpal_Endpoint_Registry {
	const CACHE_KEY = 'webino_zarinpal_endpoint_registry_v11';
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
			array( 'method' => 'POST', 'path' => 'request.json', 'status' => 'implemented', 'source' => 'includes/class-zarinpal-gateway-service.php' ),
			array( 'method' => 'POST', 'path' => 'verify.json', 'status' => 'implemented', 'source' => 'includes/class-zarinpal-gateway-service.php' ),
			array( 'method' => 'POST', 'path' => 'inquiry.json', 'status' => 'implemented', 'source' => 'includes/class-zarinpal-gateway-service.php' ),
			array( 'method' => 'POST', 'path' => 'unVerified.json', 'status' => 'implemented', 'source' => 'includes/class-zarinpal-jobs.php' ),
			array( 'method' => 'POST', 'path' => 'reverse.json', 'status' => 'implemented', 'source' => 'includes/class-zarinpal-gateway-service.php' ),
			array( 'method' => 'POST', 'path' => 'feeCalculation.json', 'status' => 'implemented', 'source' => 'includes/class-zarinpal-gateway-service.php' ),
			array( 'method' => 'POST', 'path' => 'GraphQL AddRefund', 'status' => 'implemented', 'source' => 'includes/class-zarinpal-gateway-service.php' ),
			array( 'method' => 'POST', 'path' => 'GraphQL Session', 'status' => 'implemented', 'source' => 'includes/class-zarinpal-gateway-service.php' ),
		);
		$report = array(
			'summary' => array(
				'implemented' => count( $items ),
				'queued'      => 0,
				'pending'     => 0,
				'total'       => count( $items ),
			),
			'items'   => $items,
			'meta'    => array(
				'generated_at'   => gmdate( 'c' ),
				'schema_version' => '1.1.0',
				'api_base_live'  => 'https://payment.zarinpal.com/pg/v4/payment/',
				'api_base_sandbox' => 'https://sandbox.zarinpal.com/pg/v4/payment/',
			),
		);
		set_transient( self::CACHE_KEY, $report, self::CACHE_TTL );
		return $report;
	}
}
