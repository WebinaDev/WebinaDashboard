<?php
/**
 * L0 early WAF bootstrap — runs before WordPress when prepended / MU / advanced-cache.
 *
 * EMERGENCY (0.7.73+): L0 never blocks requests. Early layers previously locked
 * out wp-admin, dashboard login, and admin-ajax. Blocking only returns when WordPress
 * is fully loaded and Shield is explicitly re-enabled from settings (L3 hooks).
 *
 * Kill-switch file/constant still short-circuit for clarity.
 *
 * @package WebinoDashboard
 */

define( 'WEBINO_SHIELD_LITE', true );

/**
 * Resolve wp-content directory without WordPress.
 *
 * @return string
 */
function webino_shield_lite_content_dir() {
	if ( defined( 'WP_CONTENT_DIR' ) ) {
		return WP_CONTENT_DIR;
	}
	// engine/ → security-module → Modules → WebinaDashboard → plugins → wp-content
	return dirname( __DIR__, 5 );
}

$content_dir = webino_shield_lite_content_dir();

// Panic / kill-switch.
if ( defined( 'WEBINO_SHIELD_DISABLE' ) && WEBINO_SHIELD_DISABLE ) {
	return;
}
if ( defined( 'WEBINO_DASHBOARD_SECURITY_DISABLE' ) && WEBINO_DASHBOARD_SECURITY_DISABLE ) {
	return;
}
$env_disable = getenv( 'WEBINO_SHIELD_DISABLE' );
if ( false !== $env_disable && '' !== $env_disable && '0' !== (string) $env_disable ) {
	return;
}
if ( is_readable( $content_dir . '/webino-shield.disable' ) ) {
	return;
}

/*
 * Hard fail-open: do not evaluate or block at L0.
 * Leftover runtime-waf.json with enabled=true must not take the site down
 * before WordPress can run emergency disarm.
 */
return;
