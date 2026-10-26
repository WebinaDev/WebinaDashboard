<?php
/**
 * SMS order-status routing: recipients follow the per-event customer/admin toggles for EVERY status,
 * and the POS snapshot filter no longer overwrites status-SMS fields (phone/total/pattern).
 *
 * Run: php scripts/test-sms-recipients.php
 *
 * @package WebinoDashboard
 */

declare(strict_types=1);
$root = dirname( __DIR__ );
define( 'ABSPATH', $root . '/' );

function sanitize_key( $v ) { return strtolower( preg_replace( '/[^a-z0-9_\-]/i', '', (string) $v ) ); }
function apply_filters( $h, $v, ...$a ) { return $v; }
function add_filter( ...$a ) { return true; }
function add_action( ...$a ) { return true; }
function wp_strip_all_tags( $s ) { return strip_tags( (string) $s ); }
function __( $s, $d = null ) { return $s; }
function get_bloginfo( $k ) { return 'Shop'; }
function home_url( $p = '' ) { return 'https://shop.test' . $p; }
function get_transient( $k ) { return false; }

require $root . '/Modules/sms-panel-module/includes/class-webino-dashboard-sms-order-map.php';
require $root . '/Modules/sms-panel-module/includes/class-webino-dashboard-sms-order-hooks.php';

$fail = 0;
function ok( $c, $m ) { global $fail; if ( ! $c ) { $fail++; echo "FAIL: $m\n"; } else { echo "ok - $m\n"; } }

$H = 'Webino_Dashboard_Sms_Order_Hooks';
$events = array(
	'processing'        => array( 'customer' => true, 'admin' => false ),
	'completed'         => array( 'customer' => true, 'admin' => false ),
	'cancelled'         => array( 'customer' => true, 'admin' => true ),
	'on-hold'           => array( 'customer' => false, 'admin' => true ),
	'pending_on_status' => array( 'customer' => true, 'admin' => false ),
	'packaged'          => array( 'customer' => true, 'admin' => false ),
	'post'              => array( 'customer' => true, 'admin' => false ),
	'stock-low'         => array( 'customer' => true, 'admin' => true ),
);
$phone = '09121234567';

foreach ( array( 'processing', 'completed', 'pending_on_status', 'packaged', 'post' ) as $ev ) {
	$r = $H::route( $events, $ev, $phone );
	ok( true === $r['customer'] && false === $r['admin'] && $phone === $r['customer_phone'], "$ev → customer only" );
}
$r = $H::route( $events, 'cancelled', $phone );
ok( $r['customer'] && $r['admin'], 'cancelled → customer + admin' );
$r = $H::route( $events, 'on-hold', $phone );
ok( ! $r['customer'] && $r['admin'] && '' === $r['customer_phone'], 'on-hold → admin only, no customer phone' );
// Custom/alias status slugs map onto the same toggles.
$r = $H::route( $events, Webino_Dashboard_Sms_Order_Map::event_for_status( 'wc-pws-packaged' ), $phone );
ok( $r['customer'] && ! $r['admin'], 'pws-packaged alias → packaged toggles' );
$r = $H::route( $events, 'post-barcode', $phone );
ok( $r['customer'] && ! $r['admin'], 'post-barcode legacy key → post toggles' );
// Stock events never go to a customer.
$r = $H::route( $events, 'stock-low', $phone );
ok( ! $r['customer'] && $r['admin'], 'stock-low → admin only' );
// Missing toggle row → nobody.
$r = $H::route( $events, 'refunded', $phone );
ok( ! $r['customer'] && ! $r['admin'], 'unconfigured event → nobody' );
// No customer phone → customer leg off (never falls back to admin number).
$r = $H::route( $events, 'completed', '' );
ok( ! $r['customer'] && ! $r['admin'] && '' === $r['customer_phone'], 'no phone → customer leg skipped, admin not substituted' );
// Phone normalization.
ok( '09121234567' === $H::normalize_mobile( '+98 912 123 4567' ), 'normalize +98' );
ok( '09121234567' === $H::normalize_mobile( '۰۹۱۲۱۲۳۴۵۶۷' ), 'normalize Persian digits' );
ok( '09121234567' === $H::normalize_mobile( '9121234567' ), 'normalize 10-digit' );

// POS filter: fills gaps only, never overwrites status SMS fields nor injects POS pattern.
$src = file_get_contents( $root . '/includes/class-webino-dashboard-sms-pos-payment.php' );
ok( false !== strpos( $src, "unset( \$vars['pattern_code'], \$vars['pattern'] );" ), 'POS filter strips pattern_code for non-POS events' );
ok( false === strpos( $src, "return self::enrich_snapshot( \$order, is_array( \$snapshot ) ? \$snapshot : array() );" ), 'POS filter no longer array_merge-overwrites snapshot' );

echo $fail ? "\n$fail failure(s)\n" : "\nAll SMS recipient tests passed.\n";
exit( $fail ? 1 : 0 );
