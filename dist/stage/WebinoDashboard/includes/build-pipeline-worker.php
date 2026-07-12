<?php
/**
 * CLI worker for dashboard release build pipeline.
 *
 * Usage: php build-pipeline-worker.php {worker_token}
 *
 * @package WebinoDashboard
 */

$token = isset( $argv[1] ) ? trim( (string) $argv[1] ) : '';
if ( '' === $token ) {
	fwrite( STDERR, "Worker token required\n" );
	exit( 1 );
}

$wp_load = '';
$dir     = dirname( __DIR__ );
while ( $dir && strlen( $dir ) > 1 ) {
	$candidate = trailingslashit( $dir ) . 'wp-load.php';
	if ( is_readable( $candidate ) ) {
		$wp_load = $candidate;
		break;
	}
	$parent = dirname( $dir );
	if ( $parent === $dir ) {
		break;
	}
	$dir = $parent;
}
if ( '' === $wp_load ) {
	fwrite( STDERR, "wp-load.php not found\n" );
	exit( 1 );
}

require_once $wp_load;

if ( ! class_exists( 'Webino_Dashboard_Build_Pipeline', false ) ) {
	require_once dirname( __FILE__ ) . '/class-webino-dashboard-build-pipeline.php';
}

if ( ! Webino_Dashboard_Build_Pipeline::verify_worker_token( $token ) ) {
	fwrite( STDERR, "Invalid build pipeline worker token\n" );
	exit( 1 );
}

Webino_Dashboard_Build_Pipeline::run_all_steps();
