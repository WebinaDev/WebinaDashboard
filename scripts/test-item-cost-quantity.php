<?php
/**
 * Regression tests for the per-quantity item shipping cost (no WP bootstrap).
 *
 * Covers the bug where a per-unit shipping cost was charged only once per cart because the
 * «max»/«once» aggregation modes ignored quantity.
 *
 * Run: php scripts/test-item-cost-quantity.php
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
$GLOBALS['wd_test_cart']    = array();
$GLOBALS['wd_fail']         = 0;

function wd_assert( $cond, $label ) {
	if ( $cond ) {
		echo "  ok: {$label}\n";
		return;
	}
	++$GLOBALS['wd_fail'];
	echo "  FAIL: {$label}\n";
}

function get_option( $key, $default = false ) { return $GLOBALS['wd_test_options'][ $key ] ?? $default; }
function update_option( $key, $value, $autoload = null ) { $GLOBALS['wd_test_options'][ $key ] = $value; return true; }
function sanitize_key( $v ) { return strtolower( preg_replace( '/[^a-z0-9_\-]/i', '', (string) $v ) ); }
function sanitize_text_field( $v ) { return trim( (string) $v ); }
function absint( $v ) { return abs( (int) $v ); }
function apply_filters( $hook, $value, ...$args ) { return $value; }
function taxonomy_exists( $t ) { return 0 === strpos( (string) $t, 'pa_' ); }
function wc_get_product_term_ids( $id, $tax ) { return array(); }
function wc_get_price_decimals() { return 0; }
function wc_format_decimal( $v, $dp = null ) { return number_format( (float) $v, (int) ( $dp ?? 0 ), '.', '' ); }
function __( $v, $d = null ) { return $v; }
function is_checkout() { return false; }
function is_cart() { return false; }
function is_admin() { return false; }

class WC_Cache_Helper {
	public static function get_transient_version( $key, $force = false ) { return 1; }
}

class WC_Product {
	private $id;
	public function __construct( $id = 0 ) { $this->id = (int) $id; }
	public function get_id() { return $this->id; }
	public function get_parent_id() { return 0; }
	public function is_virtual() { return false; }
	public function is_downloadable() { return false; }
	public function get_type() { return 'simple'; }
}

class WD_Test_Session {
	public function get( $key, $default = '' ) { return $default; }
	public function set( $key, $value ) {}
}

class WD_Test_Cart {
	public function get_cart() { return $GLOBALS['wd_test_cart']; }
	public function get_applied_coupons() { return array(); }
	public function calculate_shipping() {}
	public function needs_shipping() { return true; }
	public function get_subtotal() { return 0; }
}

class WC {
	public $cart;
	public $session;
	public function __construct() {
		$this->cart    = new WD_Test_Cart();
		$this->session = new WD_Test_Session();
	}
}

function WC() {
	static $wc = null;
	if ( ! $wc ) {
		$wc = new WC();
	}
	return $wc;
}

require_once $root . '/Modules/shipping-module/includes/class-webino-shipping-item-cost.php';

/**
 * Cart line factory.
 *
 * @param int $id  Product ID.
 * @param int $qty Quantity.
 * @return array<string,mixed>
 */
function wd_item( $id, $qty ) {
	return array(
		'data'       => new WC_Product( $id ),
		'quantity'   => $qty,
		'product_id' => $id,
		'line_total' => 0,
	);
}

/**
 * Compute the surcharge base for a settings patch and a 3+2 line cart.
 *
 * @param array<string,mixed> $patch Settings override.
 * @return float
 */
function wd_base( array $patch ) {
	$settings = array_merge(
		array(
			'enabled'        => true,
			'product_costs'  => array(
				'11' => 5000,
				'22' => 2000,
			),
			'default_cost'   => '',
		),
		$patch
	);
	update_option( 'webino_shipping_item_cost', $settings );
	$GLOBALS['wd_test_cart'] = array( wd_item( 11, 3 ), wd_item( 22, 2 ) );
	$m                       = new ReflectionMethod( 'Webino_Shipping_Item_Cost', 'compute_amount' );
	$res                     = $m->invoke( null, Webino_Shipping_Item_Cost::get(), array() );
	return (float) $res['base'];
}

echo "== item cost per quantity ==\n";

// Default store mode (max + multiply_by_qty): adding units must raise the amount.
wd_assert( 15000.0 === wd_base( array( 'mode' => 'max', 'multiply_by_qty' => true ) ), 'max mode charges every unit of the winning line (3 x 5000)' );
wd_assert( 5000.0 === wd_base( array( 'mode' => 'max', 'multiply_by_qty' => false ) ), 'max mode without per-unit billing charges once' );
wd_assert( 19000.0 === wd_base( array( 'mode' => 'each', 'multiply_by_qty' => true ) ), 'each mode sums every line x qty' );
wd_assert( 7000.0 === wd_base( array( 'mode' => 'each', 'multiply_by_qty' => false ) ), 'each mode without per-unit billing sums unit prices' );
wd_assert( 15000.0 === wd_base( array( 'mode' => 'once', 'multiply_by_qty' => true ) ), 'once mode picks the highest line, per unit' );
wd_assert( 4000.0 === wd_base( array( 'mode' => 'once', 'default_cost' => 4000 ) ), 'once mode honours the flat default fee (no double charge)' );

// Per-rule overrides.
wd_assert(
	9000.0 === wd_base(
		array(
			'mode'           => 'each',
			'multiply_by_qty' => true,
			'rule_qty_modes' => array( 'products' => array( '11' => 'once' ) ),
		)
	),
	'per-rule «once» still charges a single unit price'
);
wd_assert(
	17000.0 === wd_base(
		array(
			'mode'           => 'each',
			'multiply_by_qty' => false,
			'rule_qty_modes' => array( 'products' => array( '11' => 'per_qty' ) ),
		)
	),
	'per-rule «per_qty» overrides a global off switch'
);

if ( $GLOBALS['wd_fail'] > 0 ) {
	exit( 1 );
}
echo "OK: item cost per quantity\n";
