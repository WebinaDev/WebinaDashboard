<?php
/**
 * Smoke assertions for Digikala endpoint registry report shape.
 *
 * Run inside WordPress context:
 * wp eval-file Modules/digikala-sellers/tests/endpoint-registry-smoke.php
 */

if ( ! defined( 'ABSPATH' ) ) {
	echo "Run this test via wp eval-file inside WordPress.\n";
	return;
}

$report = Digikala_Endpoint_Registry::report();
if ( is_wp_error( $report ) ) {
	echo 'registry_error: ' . $report->get_error_message() . "\n";
	return;
}

$summary = isset( $report['summary'] ) && is_array( $report['summary'] ) ? $report['summary'] : array();
$items   = isset( $report['items'] ) && is_array( $report['items'] ) ? $report['items'] : array();
$meta    = isset( $report['meta'] ) && is_array( $report['meta'] ) ? $report['meta'] : array();

$checks = array(
	'summary_has_total'     => isset( $summary['total'] ),
	'items_is_not_empty'    => ! empty( $items ),
	'meta_has_schema'       => ! empty( $meta['schema_version'] ),
	'meta_has_duration'     => isset( $meta['parse_duration_ms'] ),
	'meta_has_assertions'   => isset( $meta['assertions'] ) && is_array( $meta['assertions'] ),
);

foreach ( $checks as $name => $ok ) {
	echo $name . ': ' . ( $ok ? 'ok' : 'fail' ) . "\n";
}
