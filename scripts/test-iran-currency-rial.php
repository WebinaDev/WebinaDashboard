<?php
/**
 * Smoke asserts for shared Iranian currency → rial factors (no WP bootstrap).
 *
 * @package WebinoDashboard
 */

declare(strict_types=1);

$root = dirname( __DIR__ );
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', $root . '/' );
}
if ( ! defined( 'WEBINO_DASHBOARD_URL' ) ) {
	define( 'WEBINO_DASHBOARD_URL', 'http://example.test/' );
}

require_once $root . '/includes/class-webino-dashboard-currency.php';
require_once $root . '/Modules/shipping-module/includes/class-webino-shipping-currency.php';
require_once $root . '/Modules/payment-module/includes/class-webino-payment-money.php';

$cases = array(
	array( 'IRR',  1000, 1000 ),
	array( 'IRT',  1000, 10000 ),
	array( 'IRHR', 5,    5000 ),
	array( 'IRHT', 5,    50000 ),
);

foreach ( $cases as list( $code, $amount, $expect ) ) {
	$core = Webino_Dashboard_Currency::to_rial_int( $amount, $code );
	$ship = (int) round( Webino_Shipping_Currency::to_rial( $amount, $code ) );
	$pay  = Webino_Payment_Money::to_rial( $amount, $code );
	if ( $core !== $expect || $ship !== $expect || $pay !== $expect ) {
		fwrite( STDERR, "FAIL: {$code} {$amount} → core={$core} ship={$ship} pay={$pay} expect={$expect}\n" );
		exit( 1 );
	}
	if ( Webino_Dashboard_Currency::to_rial_factor( $code ) !== Webino_Shipping_Currency::to_rial_factor( $code ) ) {
		fwrite( STDERR, "FAIL: factor mismatch for {$code}\n" );
		exit( 1 );
	}
}

echo "OK: IRHR/IRHT/IRR/IRT rial factors aligned (payment + shipping + core)\n";
exit( 0 );
