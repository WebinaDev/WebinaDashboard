<?php
/**
 * Uninstall Webino Shield module (optional data wipe).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) && ! defined( 'ABSPATH' ) ) {
	exit;
}

$settings = get_option( 'webino_dashboard_security', array() );
$wipe     = is_array( $settings ) && ! empty( $settings['general']['uninstall_wipe'] );

if ( ! $wipe ) {
	return;
}

global $wpdb;

$suffixes = array(
	'events', 'event_payloads', 'blocks', 'allow', 'rate', 'reputation',
	'rules', 'rule_hits', 'scans', 'findings', 'file_index', 'quarantine',
	'snapshots', 'feeds', 'intel_ip', 'intel_hash', 'intel_cve', 'audit',
	'reports', 'incidents', 'canaries', '2fa', 'sessions',
);

foreach ( $suffixes as $suffix ) {
	// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	$wpdb->query( 'DROP TABLE IF EXISTS ' . $wpdb->prefix . 'webino_shield_' . $suffix );
}

$options = array(
	'webino_dashboard_security',
	'webino_dashboard_security_db_version',
	'webino_shield_wizard_completed',
	'webino_shield_unlock_token',
	'webino_shield_ip_salt',
	'webino_shield_heal_tokens',
	'webino_shield_self_guard_baseline',
	'webino_shield_feed_pubkey',
);

foreach ( $options as $opt ) {
	delete_option( $opt );
}

wp_clear_scheduled_hook( 'webino_shield_feeds_sync' );
wp_clear_scheduled_hook( 'webino_shield_scan_tick' );
wp_clear_scheduled_hook( 'webino_shield_scan_daily' );
wp_clear_scheduled_hook( 'webino_shield_self_guard' );

$disable = WP_CONTENT_DIR . '/webino-shield.disable';
if ( is_readable( $disable ) ) {
	wp_delete_file( $disable );
}

$mu = WP_CONTENT_DIR . '/mu-plugins/000-webino-shield.php';
if ( is_readable( $mu ) ) {
	wp_delete_file( $mu );
}
