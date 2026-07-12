<?php
/**
 * CLI worker for async marketplace module install.
 *
 * Usage: php marketplace-install-worker.php {job_id} {internal_token}
 *
 * @package WebinoDashboard
 */

$job_id = isset( $argv[1] ) ? trim( (string) $argv[1] ) : '';
$token  = isset( $argv[2] ) ? trim( (string) $argv[2] ) : '';
if ( '' === $job_id || '' === $token ) {
	fwrite( STDERR, "Job id and internal token required\n" );
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

if ( ! class_exists( 'Webino_Dashboard_Marketplace_Install_Job', false ) ) {
	require_once dirname( __FILE__ ) . '/class-webino-dashboard-marketplace-install-job.php';
}

Webino_Dashboard_Marketplace_Install_Job::run_cli( sanitize_key( $job_id ), $token );
