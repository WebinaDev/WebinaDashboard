<?php
/**
 * Regression tests for the bulk strikethrough-price engine (no WP bootstrap).
 *
 * Covers: no 200-product cap, explicit selection/filters/whole-catalog scopes, 1,000-toman
 * rounding, WFCP retail base + sale mirroring, and the chunked job that always completes.
 *
 * Run: php scripts/test-bulk-sale.php
 *
 * @package WebinoDashboard
 */

declare(strict_types=1);

$root = dirname( __DIR__ );
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', $root . '/' );
}
if ( ! defined( 'DAY_IN_SECONDS' ) ) {
	define( 'DAY_IN_SECONDS', 86400 );
}

// ---- Minimal WordPress / WooCommerce stubs ---------------------------------
$GLOBALS['wd_options']    = array();
$GLOBALS['wd_meta']       = array();
$GLOBALS['wd_transients'] = array();
$GLOBALS['wd_products']   = array();
$GLOBALS['wd_cache']      = array();
$GLOBALS['wd_scheduled']  = array();
$GLOBALS['wd_fail']       = 0;

function wd_assert( $cond, $label ) {
	if ( $cond ) {
		echo "  ok: {$label}\n";
		return;
	}
	++$GLOBALS['wd_fail'];
	echo "  FAIL: {$label}\n";
}

function get_option( $key, $default = false ) { return array_key_exists( $key, $GLOBALS['wd_options'] ) ? $GLOBALS['wd_options'][ $key ] : $default; }
function update_option( $key, $value, $autoload = null ) { $GLOBALS['wd_options'][ $key ] = $value; return true; }
function delete_option( $key ) { unset( $GLOBALS['wd_options'][ $key ] ); }
function get_transient( $key ) { return $GLOBALS['wd_transients'][ $key ] ?? false; }
function set_transient( $key, $value, $ttl = 0 ) { $GLOBALS['wd_transients'][ $key ] = $value; return true; }
function delete_transient( $key ) { unset( $GLOBALS['wd_transients'][ $key ] ); }
function get_post_meta( $id, $key = '', $single = false ) { return $GLOBALS['wd_meta'][ $id ][ $key ] ?? ''; }
function update_post_meta( $id, $key, $value ) { $GLOBALS['wd_meta'][ $id ][ $key ] = $value; return true; }
function add_action( $hook = null, $cb = null, $prio = 10, $args = 1 ) { return true; }
function apply_filters( $hook, $value, ...$args ) { return $value; }
function sanitize_key( $v ) { return strtolower( preg_replace( '/[^a-z0-9_\-]/i', '', (string) $v ) ); }
function sanitize_text_field( $v ) { return trim( (string) $v ); }
function sanitize_title( $v ) { return strtolower( trim( (string) $v ) ); }
function taxonomy_exists( $t ) { return in_array( (string) $t, array( 'product_brand', 'product_tag' ), true ); }
function __( $v, $d = null ) { return $v; }
function wp_strip_all_tags( $v ) { return strip_tags( (string) $v ); }
function wp_get_attachment_image_url( $id, $size = '' ) { return ''; }
function wc_format_decimal( $v, $dp = null ) { return number_format( (float) $v, (int) ( $dp ?? 0 ), '.', '' ); }
function wc_delete_product_transients( $id ) { $GLOBALS['wd_cache'][] = (int) $id; }
function wp_next_scheduled( $hook, $args = array() ) { return false; }
function wp_schedule_single_event( $ts, $hook, $args = array() ) { $GLOBALS['wd_scheduled'][] = array( $hook, $args ); return true; }
function wp_unschedule_event( $ts, $hook, $args = array() ) {}
function wp_generate_uuid4() { static $i = 0; return 'run-' . ( ++$i ); }

class WP_Error {
	public $code;
	public function __construct( $code = '', $message = '', $data = null ) { $this->code = $code; }
	public function get_error_code() { return $this->code; }
}
function is_wp_error( $e ) { return $e instanceof WP_Error; }

class WC_DateTime {
	public $ts;
	public function __construct( $ts ) { $this->ts = (int) substr( (string) $ts, 1 ); }
}

class WC_Product_Variable {
	public static $synced = array();
	public static function sync( $id, $x = true ) { self::$synced[] = (int) $id; }
}

class WC_Product {
	public $id;
	public $type;
	public $regular;
	public $sale    = '';
	public $dates   = array();
	public $saves   = 0;
	public $children = array();
	public $status  = 'publish';

	public function __construct( $id, $type = 'simple', $regular = '' ) {
		$this->id      = (int) $id;
		$this->type    = $type;
		$this->regular = $regular;
	}
	public function get_id() { return $this->id; }
	public function get_type() { return $this->type; }
	public function is_type( $t ) { return $this->type === $t; }
	public function get_status() { return $this->status; }
	public function get_name() { return 'Product ' . $this->id; }
	public function get_image_id() { return 0; }
	public function get_regular_price( $context = '' ) { return $this->regular; }
	public function set_regular_price( $v ) { $this->regular = $v; }
	public function get_sale_price( $context = '' ) { return $this->sale; }
	public function set_sale_price( $v ) { $this->sale = $v; }
	public function get_price( $context = '' ) { return $this->sale !== '' ? $this->sale : $this->regular; }
	public function get_children() { return $this->children; }
	public function get_parent_id() { return (int) $this->parent_id; }
	public $parent_id = 0;
	public function set_date_on_sale_from( $d ) { $this->dates['from'] = $d; }
	public function set_date_on_sale_to( $d ) { $this->dates['to'] = $d; }
	public function save() { ++$this->saves; }
}

function wc_get_product( $id ) { return $GLOBALS['wd_products'][ (int) $id ] ?? false; }

function wc_get_products( $args ) {
	$ids = array();
	foreach ( $GLOBALS['wd_products'] as $id => $product ) {
		if ( 'variation' === $product->get_type() ) {
			continue;
		}
		$ids[] = (int) $id;
	}
	$limit = isset( $args['limit'] ) ? (int) $args['limit'] : -1;
	return $limit > 0 ? array_slice( $ids, 0, $limit ) : $ids;
}

class WD_Test_Request implements ArrayAccess {
	private $params;
	public function __construct( array $params ) { $this->params = $params; }
	public function get_param( $key ) { return $this->params[ $key ] ?? null; }
	public function offsetExists( $o ): bool { return isset( $this->params[ $o ] ); }
	public function offsetGet( $o ): mixed { return $this->params[ $o ] ?? null; }
	public function offsetSet( $o, $v ): void { $this->params[ $o ] = $v; }
	public function offsetUnset( $o ): void { unset( $this->params[ $o ] ); }
}

class WP_REST_Response {
	public $data;
	public $status;
	public function __construct( $data, $status = 200 ) { $this->data = $data; $this->status = $status; }
}

// WFCP stubs.
class WFCP_Calculator {
	public static $retail = array();
	public static function calculate_price( $purchase, $type = 'retail', $product_id = null, $args = array() ) {
		return self::$retail[ (int) $product_id ] ?? 0;
	}
}
class WFCP_Helper {
	public static $locked = array();
	public static $synced = array();
	public static function is_product_price_locked( $id ) { return ! empty( self::$locked[ (int) $id ] ); }
	public static function sync_retail_price_from_purchase( $id, $purchase ) { self::$synced[] = (int) $id; }
}

require_once $root . '/includes/class-webino-dashboard-bulk-sale.php';

/**
 * Fill the fake catalog with simple products.
 *
 * @param int $count How many.
 * @return void
 */
function wd_seed_catalog( $count ) {
	$GLOBALS['wd_products'] = array();
	$GLOBALS['wd_options']  = array();
	$GLOBALS['wd_meta']     = array();
	$GLOBALS['wd_cache']    = array();
	for ( $i = 1; $i <= $count; $i++ ) {
		$GLOBALS['wd_products'][ $i ] = new WC_Product( $i, 'simple', (string) ( 100000 + ( $i * 1000 ) ) );
	}
}

/**
 * Drain every pending batch of the current job.
 *
 * @param string $run_id Run id.
 * @param int    $max    Safety stop.
 * @return int Number of batches executed.
 */
function wd_drain_job( $run_id, $max = 200 ) {
	$batches = 0;
	while ( $batches < $max ) {
		$job = get_option( Webino_Dashboard_Bulk_Sale::JOB_OPTION );
		if ( ! is_array( $job ) || ! in_array( (string) ( $job['status'] ?? '' ), array( 'queued', 'running' ), true ) ) {
			break;
		}
		++$batches;
		Webino_Dashboard_Bulk_Sale::run_batch( $run_id );
	}
	return $batches;
}

echo "== bulk sale ==\n";

// 1) rounding: 1,000-toman grid, never more than the requested percentage.
wd_assert( '135000' === Webino_Dashboard_Bulk_Sale::calc_sale( 150000, 10 ), '150,000 at 10% => 135,000' );
wd_assert( '134000' === Webino_Dashboard_Bulk_Sale::calc_sale( 148500, 10 ), 'rounding lands on a 1,000-toman grid' );
wd_assert( '1317000' === Webino_Dashboard_Bulk_Sale::calc_sale( 1550000, 15 ), 'large prices keep the grid' );
wd_assert( '' === Webino_Dashboard_Bulk_Sale::calc_sale( 999, 50 ), 'prices below one step are skipped, not discounted to 0' );
wd_assert( ( 150000 - (float) Webino_Dashboard_Bulk_Sale::calc_sale( 150000, 10 ) ) <= 150000 * 0.10, 'discount never exceeds the requested percent' );

// 2) whole catalog, far beyond the old 200 cap.
wd_seed_catalog( 437 );
$res = Webino_Dashboard_Bulk_Sale::rest( new WD_Test_Request( array( 'action' => 'apply', 'scope' => 'all', 'percent' => 10, 'days' => 7 ) ) );
wd_assert( 202 === $res->status && 437 === (int) $res->data['total'], 'all-products scope covers the whole catalog (437)' );
$batches = wd_drain_job( (string) $res->data['run_id'] );
$state   = Webino_Dashboard_Bulk_Sale::public_job_state();
wd_assert( $batches > 1, 'the job is chunked in the background' );
wd_assert( 'completed' === $state['last']['status'], 'job completes instead of stopping after one batch' );
wd_assert( 437 === (int) $state['last']['processed'] && 437 === (int) $state['last']['ok'], 'every product was processed' );
$on_grid = 0;
foreach ( $GLOBALS['wd_products'] as $product ) {
	if ( '' !== $product->sale && 0 === (int) $product->sale % 1000 ) {
		++$on_grid;
	}
}
wd_assert( 437 === $on_grid, 'every sale price is rounded to 1,000 toman' );
wd_assert( 1 === count( $state['history'] ), 'history records the finished run' );

// 3) an explicit selection must never touch the rest of the catalog.
wd_seed_catalog( 300 );
$res = Webino_Dashboard_Bulk_Sale::rest( new WD_Test_Request( array( 'action' => 'apply', 'percent' => 20, 'days' => 3, 'product_ids' => array( 5, 6, 7 ) ) ) );
wd_drain_job( (string) $res->data['run_id'] );
$touched = array();
foreach ( $GLOBALS['wd_products'] as $id => $product ) {
	if ( '' !== $product->sale ) {
		$touched[] = (int) $id;
	}
}
wd_assert( array( 5, 6, 7 ) === $touched, 'only the selected products get a sale price' );

// 4) WFCP: retail price is the base, the sale is mirrored, locked products stay untouched.
wd_seed_catalog( 6 );
$GLOBALS['wd_meta'][2]['_wfcp_purchase_price'] = 100;
WFCP_Calculator::$retail[2]                     = 500000;
$GLOBALS['wd_meta'][3]['_wfcp_purchase_price'] = 100;
WFCP_Calculator::$retail[3]                     = 500000;
WFCP_Helper::$locked[3]                         = true;
WFCP_Helper::$synced                            = array();
$res = Webino_Dashboard_Bulk_Sale::rest( new WD_Test_Request( array( 'action' => 'apply', 'percent' => 10, 'days' => 2, 'product_ids' => array( 2, 3 ) ) ) );
wd_drain_job( (string) $res->data['run_id'] );
wd_assert( '450000' === $GLOBALS['wd_products'][2]->sale, 'sale is computed on the WFCP retail price' );
wd_assert( 450000.0 === (float) ( $GLOBALS['wd_meta'][2]['_wfcp_sale_price'] ?? 0 ), 'sale is mirrored into WFCP meta' );
wd_assert( in_array( 2, WFCP_Helper::$synced, true ), 'WFCP retail sync ran for the discounted product' );
wd_assert( ! isset( $GLOBALS['wd_meta'][3]['_wfcp_sale_price'] ), 'a locked WFCP price is never rewritten' );

// 5) remove clears sale price, schedule and WFCP mirror.
$res = Webino_Dashboard_Bulk_Sale::rest( new WD_Test_Request( array( 'action' => 'remove', 'product_ids' => array( 2 ) ) ) );
wd_drain_job( (string) $res->data['run_id'] );
wd_assert( '' === $GLOBALS['wd_products'][2]->sale, 'remove clears the sale price' );
wd_assert( '' === (string) ( $GLOBALS['wd_meta'][2]['_wfcp_sale_price'] ?? '' ), 'remove clears the WFCP sale mirror' );
wd_assert( null === $GLOBALS['wd_products'][2]->dates['from'] && null === $GLOBALS['wd_products'][2]->dates['to'], 'remove clears the sale schedule' );

// 6) variables: every variation is discounted on its own base, parent is re-synced.
$GLOBALS['wd_products'] = array();
$parent                 = new WC_Product( 100, 'variable' );
$v1                     = new WC_Product( 101, 'variation', '400000' );
$v2                     = new WC_Product( 102, 'variation', '600000' );
$parent->children       = array( 101, 102 );
$GLOBALS['wd_products'] = array( 100 => $parent, 101 => $v1, 102 => $v2 );
WC_Product_Variable::$synced = array();
$res = Webino_Dashboard_Bulk_Sale::rest( new WD_Test_Request( array( 'action' => 'apply', 'percent' => 25, 'days' => 5, 'product_ids' => array( 100 ) ) ) );
wd_drain_job( (string) $res->data['run_id'] );
wd_assert( '300000' === $v1->sale && '450000' === $v2->sale, 'each variation is discounted individually' );
wd_assert( in_array( 100, WC_Product_Variable::$synced, true ), 'the variable parent is re-synced afterwards' );

// 7) a second job cannot silently overwrite a running one.
wd_seed_catalog( 120 );
Webino_Dashboard_Bulk_Sale::rest( new WD_Test_Request( array( 'action' => 'apply', 'scope' => 'all', 'percent' => 5, 'days' => 1 ) ) );
$second = Webino_Dashboard_Bulk_Sale::rest( new WD_Test_Request( array( 'action' => 'apply', 'scope' => 'all', 'percent' => 7, 'days' => 1 ) ) );
wd_assert( is_wp_error( $second ) && 'job_running' === $second->get_error_code(), 'a concurrent job is rejected with 409' );

// 8) the discount % must be measured against the price the shopper actually sees.
//    A variation without its own purchase price inherits the parent's WFCP retail — that was the
//    base for the "regular" display, so a 10% campaign used to read as 14%/21%.
$GLOBALS['wd_products'] = array();
$parent                 = new WC_Product( 200, 'variable' );
$vA                     = new WC_Product( 201, 'variation', '400000' );
$vB                     = new WC_Product( 202, 'variation', '600000' );
$vA->parent_id          = 200;
$vB->parent_id          = 200;
$parent->children       = array( 201, 202 );
$GLOBALS['wd_products'] = array( 200 => $parent, 201 => $vA, 202 => $vB );

// Only the parent knows the purchase price -> both children inherit the same retail.
$GLOBALS['wd_meta'][200]['_wfcp_purchase_price'] = 100;
WFCP_Calculator::$retail[200]                     = 500000;
WFCP_Calculator::$retail[201]                     = 500000;
WFCP_Calculator::$retail[202]                     = 500000;
unset( $GLOBALS['wd_meta'][201], $GLOBALS['wd_meta'][202], $GLOBALS['wd_meta'][202] );
// The previous scenario left a job/lock behind; clear it so this run can start.
delete_option( Webino_Dashboard_Bulk_Sale::JOB_OPTION );
delete_transient( Webino_Dashboard_Bulk_Sale::JOB_LOCK );
$res = Webino_Dashboard_Bulk_Sale::rest( new WD_Test_Request( array( 'action' => 'apply', 'percent' => 10, 'days' => 2, 'product_ids' => array( 200 ) ) ) );
if ( is_wp_error( $res ) ) {
	wd_assert( false, 'the variation-base scenario could start a job: ' . $res->get_error_code() );
} else {
	wd_drain_job( (string) $res->data['run_id'] );
}
$discA = 100 - ( (float) $vA->sale / 500000 ) * 100;
$discB = 100 - ( (float) $vB->sale / 500000 ) * 100;
wd_assert( '450000' === $vA->sale, 'variation sale uses the inherited parent retail, not its own regular' );
wd_assert( '450000' === $vB->sale, 'every variation of a parent-priced product lands on the same sale' );
wd_assert( abs( $discA - 10 ) < 0.2 && abs( $discB - 10 ) < 0.2, 'the shown discount is the requested 10%, not 14%/21%' );
// The stored regular must equal the base, or WooCommerce drops a sale that sits above it.
wd_assert( '500000' === (string) $vA->regular && '500000' === (string) $vB->regular, 'the stored regular is aligned with the discount base' );

if ( $GLOBALS['wd_fail'] > 0 ) {
	exit( 1 );
}
echo "OK: bulk sale\n";
