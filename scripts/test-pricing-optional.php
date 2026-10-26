<?php
/**
 * Pricing module (wfcp) optional: single-price writes, wfcp_on gating, marketplace fallback,
 * and the wfcp storefront gate.
 *
 * Run: php scripts/test-pricing-optional.php
 *
 * @package WebinoDashboard
 */

declare(strict_types=1);
$root = dirname( __DIR__ );
define( 'ABSPATH', $root . '/' );
define( 'WPINC', 'wp-includes' );

$GLOBALS['filters'] = array();
function add_filter( $h, $cb, $p = 10, $a = 1 ) { $GLOBALS['filters'][ $h ][] = $cb; return true; }
function apply_filters( $h, $v, ...$a ) { foreach ( $GLOBALS['filters'][ $h ] ?? array() as $cb ) { $v = $cb( $v, ...$a ); } return $v; }
function wc_format_decimal( $v ) { $s = (string) $v; return false !== strpos( $s, '.' ) ? rtrim( rtrim( $s, '0' ), '.' ) : $s; }
function sanitize_key( $v ) { return strtolower( preg_replace( '/[^a-z0-9_\-]/i', '', (string) $v ) ); }
function get_post_meta( $id, $k, $s = false ) { return $GLOBALS['meta'][ $id ][ $k ] ?? ''; }

class P {
	public $r = ''; public $s = ''; public $p = ''; public $type = 'simple';
	public function set_regular_price( $v ) { $this->r = (string) $v; }
	public function set_sale_price( $v ) { $this->s = (string) $v; }
	public function set_price( $v ) { $this->p = (string) $v; }
	public function get_regular_price( $c = 'view' ) { return $this->r; }
	public function get_sale_price( $c = 'view' ) { return $this->s; }
	public function get_price( $c = 'view' ) { return $this->p; }
	public function is_type( $t ) { return $t === $this->type; }
}
$GLOBALS['products'] = array();
function wc_get_product( $id ) { return $GLOBALS['products'][ $id ] ?? false; }

class Webino_Dashboard_Module_Registry {
	public static $active = false;
	public static function is_active( $s ) { return self::$active; }
	public static function wfcp_ready() { return class_exists( 'WFCP_Helper', false ) && self::$active; }
}

require $root . '/includes/class-webino-dashboard-pricing.php';
require $root . '/Modules/wnc-core-module/plugin/includes/class-wnc-pricing.php';

$fail = 0;
function ok( $c, $m ) { global $fail; if ( ! $c ) { $fail++; echo "FAIL: $m\n"; } else { echo "ok - $m\n"; } }
$X = 'Webino_Dashboard_Pricing';

// --- resolve / apply --------------------------------------------------------
$r = $X::resolve( '1200000', '' );
ok( '1200000' === $r['price'] && '' === $r['sale'], 'single price → _price = regular' );
$r = $X::resolve( '1,200,000', '۹۰۰۰۰۰' );
ok( '1200000' === $r['regular'] && '900000' === $r['sale'] && '900000' === $r['price'], 'separators + Persian digits; valid sale → _price = sale' );
$r = $X::resolve( '100', '100' );
ok( '' === $r['sale'] && '100' === $r['price'], 'sale == regular dropped' );
$r = $X::resolve( '100', '150' );
ok( '' === $r['sale'] && '100' === $r['price'], 'sale > regular dropped' );
$r = $X::resolve( '100', '0' );
ok( '' === $r['sale'] && '100' === $r['price'], 'zero sale dropped' );
$r = $X::resolve( '', '500' );
ok( '500' === $r['regular'] && '500' === $r['price'] && '' === $r['sale'], 'sale without regular becomes the single price' );
$r = $X::resolve( 'abc', '-5' );
ok( '' === $r['regular'] && '' === $r['price'], 'garbage/negative → empty (no zero price written)' );
$r = $X::resolve( '99999999999999', '' );
ok( '99999999999999' === $r['price'], 'very large rial amount preserved' );

$p = new P(); $p->r = '1000'; $p->s = '800'; $p->p = '800';
$X::apply( $p, '700', null );
ok( '700' === $p->r && '' === $p->s && '700' === $p->p, 'lowering regular below existing sale clears stale sale' );
$p = new P(); $p->r = '1000';
$X::apply( $p, null, '600' );
ok( '600' === $p->p && '600' === $p->s && '1000' === $p->r, 'sale-only update keeps regular' );
$p = new P(); $p->r = '1000'; $p->s = '600'; $p->p = '1000';
$X::apply( $p );
ok( '600' === $p->p, 'apply() repairs stale _price' );

// --- wfcp_on gating ---------------------------------------------------------
ok( false === $X::wfcp_on(), 'wfcp absent → off' );
class WFCP_Helper { public static $enabled = true; public static function is_enabled() { return self::$enabled; } public static function get_product_purchase_price( $id ) { return 100; } public static function get_settings( $s, $k = null ) { return array(); } }
class WFCP_Calculator { public static function calculate_price( $p, $t, $id ) { return 4242.0; } }
Webino_Dashboard_Module_Registry::$active = false;
ok( false === $X::wfcp_on(), 'wfcp installed but module toggle off → off' );
Webino_Dashboard_Module_Registry::$active = true; WFCP_Helper::$enabled = false;
ok( false === $X::wfcp_on(), 'module on but master switch off → off' );
WFCP_Helper::$enabled = true;
ok( true === $X::wfcp_on(), 'module on + enabled → on' );

// --- storefront gate filter --------------------------------------------------
Webino_Dashboard_Module_Registry::$active = false;
ok( false === apply_filters( 'wfcp_storefront_active', true ), 'wfcp storefront hooks blocked when module toggle off' );
Webino_Dashboard_Module_Registry::$active = true;
ok( true === apply_filters( 'wfcp_storefront_active', true ), 'wfcp storefront hooks allowed when on' );
$main = file_get_contents( $root . '/Modules/wfcp-module/plugin/includes/class-wfcp-main.php' );
$pos_gate = strpos( $main, 'if ( ! self::storefront_active() )' );
$pos_hook = strpos( $main, "'wp_enqueue_scripts', \$plugin_public" );
ok( false !== $pos_gate && $pos_gate < $pos_hook, 'define_public_hooks returns before any storefront enqueue/hook' );

// --- marketplace price fallback ----------------------------------------------
$v = new P(); $v->r = '1000'; $v->s = '850'; $v->p = '850';
$GLOBALS['products'][7] = $v;
$GLOBALS['meta'][7] = array( '_wfcp_torob_lock' => '1', '_wfcp_torob_price' => '1' );
Webino_Dashboard_Module_Registry::$active = false;
ok( 850.0 === WNC_Pricing::get_price( 7, 'torob' ), 'wfcp off → marketplace gets WC active (sale) price, stale lock ignored' );
ok( false === WNC_Pricing::wfcp_available(), 'WNC sees wfcp as unavailable when toggled off' );
Webino_Dashboard_Module_Registry::$active = true;
ok( 1.0 === WNC_Pricing::get_price( 7, 'torob' ), 'wfcp on → manual locked platform price unchanged' );
unset( $GLOBALS['meta'][7] );
ok( 4242.0 === WNC_Pricing::get_price( 7, 'torob' ), 'wfcp on → calculator price unchanged' );

echo $fail ? "\n$fail failure(s)\n" : "\nAll optional-pricing tests passed.\n";
exit( $fail ? 1 : 0 );
