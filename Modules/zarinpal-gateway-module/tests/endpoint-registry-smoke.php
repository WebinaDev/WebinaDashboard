<?php
/**
 * Smoke check for Zarinpal endpoint report.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit( 0 );
}

$report = Zarinpal_Endpoint_Registry::report();
if ( ! is_array( $report ) || empty( $report['items'] ) ) {
	fwrite( STDERR, "Invalid endpoint report\n" );
	exit( 1 );
}
exit( 0 );
