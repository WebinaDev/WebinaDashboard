<?php
/**
 * L0 early WAF bootstrap — runs before WordPress when prepended.
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

// Panic disable file — fail open completely.
if ( is_readable( $content_dir . '/webino-shield.disable' ) ) {
	return;
}

// Locate runtime JSON (uploads/webino-shield/runtime-waf.json).
$uploads_candidates = array(
	$content_dir . '/uploads/webino-shield/runtime-waf.json',
);

$runtime_path = '';
foreach ( $uploads_candidates as $candidate ) {
	if ( is_readable( $candidate ) ) {
		$runtime_path = $candidate;
		break;
	}
}

if ( '' === $runtime_path ) {
	return;
}

$raw = file_get_contents( $runtime_path );
$runtime = json_decode( $raw, true );
if ( ! is_array( $runtime ) ) {
	return;
}

require_once dirname( __DIR__ ) . '/includes/class-webino-shield-engine.php';

/**
 * Resolve client IP for lite engine.
 *
 * @return string
 */
function webino_shield_lite_client_ip() {
	foreach ( array( 'HTTP_CF_CONNECTING_IP', 'HTTP_AR_REAL_IP', 'HTTP_X_REAL_IP', 'REMOTE_ADDR' ) as $h ) {
		if ( empty( $_SERVER[ $h ] ) ) {
			continue;
		}
		$ip = trim( explode( ',', (string) $_SERVER[ $h ] )[0] );
		if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
			return $ip;
		}
	}
	return '';
}

$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '/';
if ( false !== strpos( $uri, '/wp-json/webino-dashboard/v1/security' ) ) {
	return;
}

$request = array(
	'ip'     => webino_shield_lite_client_ip(),
	'method' => isset( $_SERVER['REQUEST_METHOD'] ) ? strtoupper( (string) $_SERVER['REQUEST_METHOD'] ) : 'GET',
	'path'   => parse_url( $uri, PHP_URL_PATH ) ?: '/',
	'query'  => isset( $_SERVER['QUERY_STRING'] ) ? (string) $_SERVER['QUERY_STRING'] : '',
	'ua'     => isset( $_SERVER['HTTP_USER_AGENT'] ) ? (string) $_SERVER['HTTP_USER_AGENT'] : '',
);

$result = Webino_Shield_Engine::evaluate_lite( $runtime, $request );

if ( ! in_array( $result['action'] ?? 'allow', array( 'block', 'virtual_patch_block' ), true ) ) {
	return;
}

$code = 403;
http_response_code( $code );
header( 'Content-Type: text/html; charset=utf-8' );
header( 'X-Webino-Shield: block' );
$ref = htmlspecialchars( (string) ( $result['rule_id'] ?? 'shield' ), ENT_QUOTES, 'UTF-8' );
echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Access denied</title></head><body>';
echo '<h1>Access denied</h1><p>Your request was blocked by Webino Shield.</p>';
echo '<p><small>Ref: ' . $ref . '</small></p></body></html>';
exit;
