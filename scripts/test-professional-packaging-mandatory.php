<?php
/**
 * Asserts for the professional packaging fee "mandatory" setting (no WP bootstrap).
 *
 * Run: php scripts/test-professional-packaging-mandatory.php
 *
 * @package WebinoDashboard
 */

declare(strict_types=1);

$root = dirname( __DIR__ );
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', $root . '/' );
}

// ---- Minimal WordPress / WooCommerce stubs ---------------------------------
$GLOBALS['wd_test_options'] = array();
$GLOBALS['wd_test_hooks']   = array();

function add_action( $hook, $cb, $prio = 10, $args = 1 ) { $GLOBALS['wd_test_hooks'][ $hook ][] = $cb; return true; }
function add_filter( $hook, $cb, $prio = 10, $args = 1 ) { $GLOBALS['wd_test_hooks'][ $hook ][] = $cb; return true; }
function apply_filters( $hook, $value, ...$args ) { return $value; }
function get_option( $key, $default = false ) { return $GLOBALS['wd_test_options'][ $key ] ?? $default; }
function update_option( $key, $value, $autoload = null ) { $GLOBALS['wd_test_options'][ $key ] = $value; return true; }
function sanitize_text_field( $v ) { return trim( (string) $v ); }
function sanitize_textarea_field( $v ) { return trim( (string) $v ); }
function sanitize_key( $v ) { return strtolower( preg_replace( '/[^a-z0-9_\-]/i', '', (string) $v ) ); }
function is_admin() { return false; }
function esc_html( $v ) { return htmlspecialchars( (string) $v, ENT_QUOTES ); }
function esc_attr( $v ) { return htmlspecialchars( (string) $v, ENT_QUOTES ); }
function esc_html__( $v, $d = null ) { return esc_html( $v ); }
function __( $v, $d = null ) { return $v; }
function wp_kses_post( $v ) { return (string) $v; }
function checked( $a, $b = true, $echo = true ) { return ( (string) $a === (string) $b ) ? ' checked="checked"' : ''; }

class WD_Test_Session {
	public $data = array();
	public function get( $k ) { return $this->data[ $k ] ?? null; }
	public function set( $k, $v ) { $this->data[ $k ] = $v; }
}
class WD_Test_Product {
	private $ship;
	public function __construct( $ship ) { $this->ship = $ship; }
	public function needs_shipping() { return $this->ship; }
}
class WC_Cart {
	public $fees  = array();
	public $items = array();
	public function add_fee( $name, $amount, $taxable = false ) { $this->fees[] = array( $name, $amount ); }
	public function get_cart() { return $this->items; }
	public function is_empty() { return empty( $this->items ); }
	public function calculate_totals() {}
}
class WD_Test_WC {
	public $session;
	public $cart;
}
$GLOBALS['wd_test_wc'] = new WD_Test_WC();
function WC() { return $GLOBALS['wd_test_wc']; }

require_once $root . '/Modules/shipping-module/includes/class-webino-shipping-packaging-settings.php';
require_once $root . '/Modules/shipping-module/includes/class-webino-shipping-professional-packaging.php';

$fail = 0;
function wd_assert( $cond, $msg ) {
	global $fail;
	if ( ! $cond ) {
		fwrite( STDERR, "FAIL: {$msg}\n" );
		$fail++;
	}
}
function wd_cart( $physical = true ) {
	$c        = new WC_Cart();
	$c->items = array( 'k1' => array( 'data' => new WD_Test_Product( $physical ), 'quantity' => 1 ) );
	return $c;
}

Webino_Shipping_Professional_Packaging::init();
wd_assert( ! empty( $GLOBALS['wd_test_hooks']['woocommerce_cart_calculate_fees'] ), 'cart fee hook registered' );
wd_assert( ! empty( $GLOBALS['wd_test_hooks']['woocommerce_store_api_checkout_update_order_from_request'] ), 'Store API order hook registered' );

// Defaults.
$d = Webino_Shipping_Packaging_Settings::get();
wd_assert( false === $d['professional_fee_mandatory'], 'mandatory defaults to false' );
wd_assert( true === $d['professional_fee_replaces_carton'], 'replaces_carton defaults to true' );

// Optional mode (current behavior).
Webino_Shipping_Packaging_Settings::update( array( 'professional_fee_enabled' => true, 'professional_fee_amount' => 95000 ) );
WC()->session = new WD_Test_Session();
WC()->session->set( Webino_Shipping_Professional_Packaging::SESSION_KEY, 'no' );
$cart = wd_cart();
Webino_Shipping_Professional_Packaging::add_cart_fee( $cart );
wd_assert( array() === $cart->fees, 'optional + opted out => no fee' );
Webino_Shipping_Professional_Packaging::capture_checkout_choice( 'webino_professional_packaging=1' );
$cart = wd_cart();
Webino_Shipping_Professional_Packaging::add_cart_fee( $cart );
wd_assert( 1 === count( $cart->fees ) && 95000.0 === (float) $cart->fees[0][1], 'optional + opted in => fee' );
Webino_Shipping_Professional_Packaging::capture_checkout_choice( '' );
wd_assert( ! Webino_Shipping_Professional_Packaging::is_selected(), 'optional: unchecked checkout POST opts out' );
$cart = wd_cart( false );
Webino_Shipping_Professional_Packaging::set_selected( true );
Webino_Shipping_Professional_Packaging::add_cart_fee( $cart );
wd_assert( 1 === count( $cart->fees ), 'optional mode keeps original behavior for virtual carts' );

// Mandatory mode.
$saved = Webino_Shipping_Packaging_Settings::update( array( 'professional_fee_mandatory' => true ) );
wd_assert( true === $saved['professional_fee_mandatory'], 'mandatory persisted' );
wd_assert( Webino_Shipping_Professional_Packaging::is_mandatory(), 'is_mandatory()' );
Webino_Shipping_Professional_Packaging::capture_checkout_choice( '' );
wd_assert( 'yes' === WC()->session->get( Webino_Shipping_Professional_Packaging::SESSION_KEY ), 'mandatory: posted opt-out ignored' );
Webino_Shipping_Professional_Packaging::set_selected( false );
wd_assert( 'yes' === WC()->session->get( Webino_Shipping_Professional_Packaging::SESSION_KEY ), 'mandatory: set_selected(false) ignored' );
WC()->session->set( Webino_Shipping_Professional_Packaging::SESSION_KEY, 'no' );
$cart = wd_cart();
Webino_Shipping_Professional_Packaging::add_cart_fee( $cart );
wd_assert( 1 === count( $cart->fees ), 'mandatory: fee applied even with session=no' );
WC()->session = null;
wd_assert( Webino_Shipping_Professional_Packaging::is_selected(), 'mandatory: selected without a session (Store API / bots)' );
$cart = wd_cart();
Webino_Shipping_Professional_Packaging::add_cart_fee( $cart );
wd_assert( 1 === count( $cart->fees ), 'mandatory: fee applied without session' );
$cart = wd_cart( false );
Webino_Shipping_Professional_Packaging::add_cart_fee( $cart );
wd_assert( array() === $cart->fees, 'mandatory: virtual-only cart not eligible' );
$cart = new WC_Cart();
Webino_Shipping_Professional_Packaging::add_cart_fee( $cart );
wd_assert( array() === $cart->fees, 'mandatory: empty cart not eligible' );

// Shipping package tag (carton rate cache busting).
$pk = Webino_Shipping_Professional_Packaging::tag_shipping_packages( array( array( 'contents' => array() ) ) );
wd_assert( 'm1' === ( $pk[0]['webino_prof_pack'] ?? '' ), 'packages tagged as mandatory+selected' );

// Cart UI: no toggleable checkbox in mandatory mode.
WC()->session = new WD_Test_Session();
WC()->cart    = wd_cart();
ob_start();
Webino_Shipping_Professional_Packaging::reset_render_flag();
Webino_Shipping_Professional_Packaging::render_cart();
$html = (string) ob_get_clean();
wd_assert( false !== strpos( $html, 'webino-prof-pack--mandatory' ), 'mandatory UI class rendered' );
wd_assert( false === strpos( $html, 'type="checkbox"' ), 'mandatory UI has no checkbox' );
wd_assert( false !== strpos( $html, 'webino-prof-pack__note' ), 'mandatory UI shows note' );

// Turning mandatory off restores the checkbox.
Webino_Shipping_Packaging_Settings::update( array( 'professional_fee_mandatory' => false ) );
ob_start();
Webino_Shipping_Professional_Packaging::reset_render_flag();
Webino_Shipping_Professional_Packaging::render_cart();
$html = (string) ob_get_clean();
wd_assert( false !== strpos( $html, 'type="checkbox"' ), 'optional UI has checkbox' );

// Disabled feature => never mandatory.
Webino_Shipping_Packaging_Settings::update( array( 'professional_fee_enabled' => false, 'professional_fee_mandatory' => true ) );
wd_assert( ! Webino_Shipping_Professional_Packaging::is_mandatory(), 'disabled feature is never mandatory' );
$cart = wd_cart();
Webino_Shipping_Professional_Packaging::add_cart_fee( $cart );
wd_assert( array() === $cart->fees, 'disabled feature => no fee' );

if ( $fail > 0 ) {
	exit( 1 );
}
echo "OK: professional packaging mandatory\n";
