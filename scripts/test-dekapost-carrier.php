<?php
/**
 * Asserts Dekapost is a first-class carrier everywhere a carrier is enumerated:
 * pricing engine, WC method, order statuses, tracking providers, SMS event map,
 * sales-report allowlist, tracking URL and the dashboard route.
 *
 * Bug being guarded: adding a carrier to one registry but not the others means the
 * method can be selected at checkout yet never gets a status, an SMS pattern event,
 * a tracking link or a report bucket.
 *
 * Run: php scripts/test-dekapost-carrier.php
 *
 * @package WebinoDashboard
 */

declare(strict_types=1);

$root = dirname( __DIR__ );
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', $root . '/' );
}

// ---- Minimal WordPress / WooCommerce stubs ---------------------------------
$GLOBALS['wd_fail']   = 0;
$GLOBALS['wd_option'] = array();
$GLOBALS['wd_transient'] = array();

function wd_assert( $cond, $label ) {
	if ( $cond ) {
		echo "  ok: {$label}\n";
		return;
	}
	++$GLOBALS['wd_fail'];
	echo "  FAIL: {$label}\n";
}

function __( $text, $domain = '' ) { return $text; }
function _n_noop( $a, $b, $domain = '' ) { return array( $a, $b ); }
function add_action( $h, $c, $p = 10, $a = 1 ) { return true; }
function add_filter( $h, $c, $p = 10, $a = 1 ) { return true; }
function apply_filters( $hook, $value ) { return $value; }
function sanitize_key( $k ) { return strtolower( preg_replace( '/[^a-z0-9_\-]/i', '', (string) $k ) ); }
function sanitize_text_field( $v ) { return trim( (string) $v ); }
function wp_strip_all_tags( $v ) { return strip_tags( (string) $v ); }
function wp_parse_url( $url, $component = -1 ) { return parse_url( (string) $url, $component ); }
function register_post_status( $slug, $args = array() ) { return true; }
function get_option( $key, $default = false ) { return array_key_exists( $key, $GLOBALS['wd_option'] ) ? $GLOBALS['wd_option'][ $key ] : $default; }
function update_option( $key, $value, $autoload = null ) { $GLOBALS['wd_option'][ $key ] = $value; return true; }
function get_transient( $key ) { return $GLOBALS['wd_transient'][ $key ] ?? false; }
function set_transient( $key, $value, $ttl = 0 ) { $GLOBALS['wd_transient'][ $key ] = $value; return true; }
function get_term_meta( $id, $key, $single = false ) { return $GLOBALS['wd_term'][ (int) $id ][ $key ] ?? ''; }
function home_url( $p = '' ) { return 'https://shop.test' . $p; }

function wc_get_order_statuses() {
	return array(
		'wc-processing'      => 'در حال انجام',
		'wc-completed'       => 'تکمیل‌شده',
		'wc-webino-post'     => 'پست',
		'wc-webino-dekapost' => 'دکاپست',
		'wc-webino-tipax'    => 'تیپاکس',
	);
}

// ---- Load the units under test ---------------------------------------------
require_once $root . '/Modules/shipping-module/includes/class-webino-shipping-dekapost.php';
require_once $root . '/Modules/shipping-module/includes/class-webino-shipping-order-statuses.php';
require_once $root . '/Modules/sms-panel-module/includes/class-webino-dashboard-sms-order-map.php';
require_once $root . '/includes/class-webino-dashboard-orders.php';
require_once $root . '/includes/class-webino-dashboard-order-reports.php';

echo "== Dekapost carrier contract ==\n";

// ---- Pricing engine ---------------------------------------------------------
$d = Webino_Shipping_Dekapost::defaults();
wd_assert( false === $d['enabled'], 'carrier ships disabled by default' );
wd_assert( 'https://tracking.dekapost.ir/?code={code}' === $d['tracking_url_template'], 'default tracking template points at tracking.dekapost.ir' );

wd_assert( '' === Webino_Shipping_Dekapost::sanitize_template( 'javascript:alert({code})' ), 'rejects non-http tracking templates' );
wd_assert( '' === Webino_Shipping_Dekapost::sanitize_template( 'https://tracking.dekapost.ir/' ), 'rejects a template without {code}' );
wd_assert( '' !== Webino_Shipping_Dekapost::sanitize_template( 'https://tracking.dekapost.ir/?code={code}' ), 'accepts the default template' );

Webino_Shipping_Dekapost::update(
	array(
		'enabled'            => true,
		'use_city_table'     => false,
		'rate_extra_percent' => 0,
		'rate_extra_fixed'   => 0,
		'cod_extra'          => 0,
		'tariffs'            => array(
			array( 'min_weight_g' => 0, 'max_weight_g' => 1000, 'price' => 60000, 'state' => '' ),
			array( 'min_weight_g' => 1001, 'max_weight_g' => 5000, 'price' => 90000, 'state' => '' ),
			array( 'min_weight_g' => 0, 'max_weight_g' => 1000, 'price' => 75000, 'state' => 'THR' ),
			array( 'min_weight_g' => 5000, 'max_weight_g' => 100, 'price' => 1, 'state' => '' ),
		),
	)
);
$s = Webino_Shipping_Dekapost::get();
wd_assert( 3 === count( $s['tariffs'] ), 'invalid tariff band (max < min) is dropped' );

wd_assert( 60000.0 === Webino_Shipping_Dekapost::tariff_price( 700, 'KER' ), 'generic band matches by weight' );
wd_assert( 75000.0 === Webino_Shipping_Dekapost::tariff_price( 700, 'THR' ), 'province-specific band beats the generic one' );
wd_assert( 90000.0 === Webino_Shipping_Dekapost::tariff_price( 3000, 'THR' ), 'falls back to the generic band when no province row fits' );
wd_assert( null === Webino_Shipping_Dekapost::tariff_price( 9000, 'THR' ), 'no match returns null so the method is hidden' );

$rate = Webino_Shipping_Dekapost::resolve_rate( array( 'contents' => array(), 'destination' => array( 'city' => '', 'state' => 'KER' ) ) );
wd_assert( is_array( $rate ) && 'tariff' === $rate['source'] && 60000.0 === $rate['cost'], 'resolve_rate reports the tariff source' );

Webino_Shipping_Dekapost::update( array( 'fallback_flat' => 45000 ) );
$rate = Webino_Shipping_Dekapost::resolve_rate( array( 'contents' => array(), 'destination' => array( 'city' => '', 'state' => 'KER' ) ), 0, 20000 );
wd_assert( is_array( $rate ) && 'flat' === $rate['source'] && 45000.0 === $rate['cost'], 'flat fallback used when no band matches' );

Webino_Shipping_Dekapost::update( array( 'enabled' => false ) );
wd_assert( null === Webino_Shipping_Dekapost::resolve_rate( array( 'contents' => array(), 'destination' => array() ) ), 'disabled carrier never resolves a rate' );
Webino_Shipping_Dekapost::update(
	array(
		'enabled'            => true,
		'fallback_flat'      => 50000,
		'tariffs'            => array(),
		'rate_extra_fixed'   => 5000,
		'rate_extra_percent' => 10,
	)
);
$rate = Webino_Shipping_Dekapost::resolve_rate( array( 'contents' => array(), 'destination' => array( 'city' => '', 'state' => '' ) ) );
wd_assert( is_array( $rate ) && 60000.0 === $rate['cost'], 'percent extra applies to the base rate, then the fixed extra is added once' );
Webino_Shipping_Dekapost::update( array( 'rate_extra_percent' => 0, 'rate_extra_fixed' => 0, 'fallback_flat' => 45000 ) );

$url = Webino_Shipping_Dekapost::tracking_url( '148188425731' );
wd_assert( 'https://tracking.dekapost.ir/?code=148188425731' === $url, 'tracking URL embeds the parcel barcode' );
wd_assert( '' === Webino_Shipping_Dekapost::tracking_url( '' ), 'empty barcode yields no tracking URL (no bare portal link in SMS)' );

$tpl = Webino_Shipping_Dekapost::filter_tracking_template( 'https://tracking.post.ir/?id={code}', 'dekapost' );
wd_assert( false !== strpos( $tpl, 'dekapost' ), 'tracking template filter overrides the generic post fallback for dekapost' );
$tpl2 = Webino_Shipping_Dekapost::filter_tracking_template( 'https://tracking.post.ir/?id={code}', 'post' );
wd_assert( 'https://tracking.post.ir/?id={code}' === $tpl2, 'tracking template filter leaves other carriers untouched' );

// ---- Order statuses ---------------------------------------------------------
$defs = Webino_Shipping_Order_Statuses::definitions();
wd_assert( isset( $defs['wc-webino-dekapost'] ), 'a webino-dekapost order status is registered' );
$map = array();
$map = Webino_Shipping_Order_Statuses::sms_map( $map );
wd_assert( isset( $map['webino-dekapost'] ) && 'dekapost' === $map['webino-dekapost'], 'webino-dekapost status maps to the dekapost SMS event' );

// ---- SMS event map ----------------------------------------------------------
$order = Webino_Dashboard_Sms_Order_Map::preferred_event_order();
wd_assert( in_array( 'dekapost', $order, true ), 'SMS pattern matrix lists a dekapost event' );
$after_chapar = array_search( 'dekapost', $order, true ) === array_search( 'chapar', $order, true ) + 1;
wd_assert( $after_chapar, 'dekapost sits right after chapar in the matrix' );

$labels = Webino_Dashboard_Sms_Order_Map::status_labels_fa();
wd_assert( isset( $labels['dekapost'] ), 'dekapost has a Persian SMS label' );
wd_assert( 'dekapost' === Webino_Dashboard_Sms_Order_Map::event_key_from_label( 'تحویل دکاپست' ), 'Persian delivery label maps back to dekapost' );
wd_assert( 'dekapost' === Webino_Dashboard_Sms_Order_Map::event_key_from_label( 'دکاپست' ), 'bare carrier name maps to dekapost' );
wd_assert( 'dekapost' === Webino_Dashboard_Sms_Order_Map::event_for_status( 'webino-dekapost' ), 'order status slug resolves to the dekapost event' );
wd_assert( 'dekapost' === Webino_Dashboard_Sms_Order_Map::event_for_status( 'dekapost' ), 'event key is idempotent' );

$catalog_keys = Webino_Dashboard_Sms_Order_Map::all_event_keys();
wd_assert( in_array( 'dekapost', $catalog_keys, true ), 'event catalog exposes dekapost to the SMS settings UI' );

// ---- Tracking providers -----------------------------------------------------
$kinds = Webino_Dashboard_Orders::tracking_provider_kinds();
wd_assert( in_array( 'dekapost', $kinds, true ), 'dekapost is a tracking provider kind' );

$providers = Webino_Dashboard_Orders::get_tracking_providers();
$ids       = array_column( $providers, 'id' );
wd_assert( in_array( 'dekapost', $ids, true ), 'order UI offers a dekapost provider option' );
wd_assert( 'دکاپست' === $providers[ array_search( 'dekapost', $ids, true ) ]['title'], 'provider option is labelled دکاپست' );

$template = Webino_Dashboard_Orders::get_tracking_url_template( 'dekapost' );
wd_assert( false !== strpos( $template, 'tracking.dekapost.ir' ), 'generic tracking template resolves to the dekapost portal' );
wd_assert( false !== strpos( $template, '{code}' ), 'dekapost template keeps the {code} placeholder' );

$sniffed = Webino_Dashboard_Orders::get_shipping_kind(
	new class() {
		public function get_meta( $k ) { return ''; }
		public function get_status() { return 'processing'; }
		public function get_shipping_methods() {
			return array(
				new class() {
					public function get_method_id() { return 'webino_dekapost'; }
					public function get_name() { return 'دکاپست'; }
				},
			);
		}
	}
);
wd_assert( 'dekapost' === $sniffed, 'carrier is detected from the webino_dekapost shipping method id' );

// ---- Sales reports ----------------------------------------------------------
$allow = Webino_Dashboard_Order_Reports::sales_status_allowlist_builtin();
wd_assert( in_array( 'webino-dekapost', $allow, true ), 'webino-dekapost counts as a paid/sales status' );
wd_assert( in_array( 'dekapost', $allow, true ), 'legacy dekapost slug counts as a paid/sales status' );

// ---- Dashboard surface ------------------------------------------------------
$manifest = json_decode( (string) file_get_contents( $root . '/Modules/shipping-module/manifest.json' ), true );
$paths    = array_column( (array) ( $manifest['client']['routes'] ?? array() ), 'path' );
wd_assert( in_array( 'settings/shop/transport/dekapost', $paths, true ), 'manifest exposes the dashboard route' );

$sections = array_column( (array) ( $manifest['settings']['sections'] ?? array() ), 'id' );
wd_assert( in_array( 'dekapost', $sections, true ), 'manifest lists dekapost as a transport section' );

$entry = (string) file_get_contents( $root . '/Modules/shipping-module/client/module-entry.tsx' );
wd_assert( false !== strpos( $entry, "'settings/shop/transport/dekapost': DekapostSettingsPage" ), 'module-entry maps the route to the page' );

$hub = (string) file_get_contents( $root . '/Modules/shipping-module/client/pages/TransportHubPage.tsx' );
wd_assert( false !== strpos( $hub, '/settings/shop/transport/dekapost' ), 'transport hub links to the dekapost screen' );

// ---- Shipping method registration -------------------------------------------
$methods_file = (string) file_get_contents( $root . '/Modules/shipping-module/includes/class-webino-shipping-method-dekapost.php' );
wd_assert( false !== strpos( $methods_file, "'webino_dekapost'" ), 'WC shipping method id is webino_dekapost' );
$bootstrap = (string) file_get_contents( $root . '/Modules/shipping-module/bootstrap.php' );
wd_assert( false !== strpos( $bootstrap, 'Webino_Shipping_Method_Dekapost::register()' ), 'bootstrap registers the WC method' );
wd_assert( false !== strpos( $bootstrap, 'Webino_Shipping_Dekapost::init()' ), 'bootstrap initialises the carrier settings' );

echo $GLOBALS['wd_fail'] > 0 ? "\nFAILED: {$GLOBALS['wd_fail']} assertion(s)\n" : "\nPASS: Dekapost carrier contract\n";
exit( $GLOBALS['wd_fail'] > 0 ? 1 : 0 );
