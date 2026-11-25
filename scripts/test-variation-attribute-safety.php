<?php
/**
 * Regression tests: variation attribute storage must never be modified by read paths.
 *
 * Bug being guarded: listing/saving variations used to run a "migration" that created attribute
 * taxonomies and terms, rewrote the parent's attributes and re-saved children — which left real
 * storefront variations unmatched (selection jumped back) and could destroy variation data.
 *
 * Run: php scripts/test-variation-attribute-safety.php
 *
 * @package WebinoDashboard
 */

declare(strict_types=1);

$root = dirname( __DIR__ );
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', $root . '/' );
}

// ---- Minimal WordPress / WooCommerce stubs ---------------------------------
$GLOBALS['wd_terms']     = array();
$GLOBALS['wd_inserts']   = array();
$GLOBALS['wd_taxonomies'] = array( 'pa_color' => true );
$GLOBALS['wd_vmeta']     = array();
$GLOBALS['wd_fail']      = 0;

function wd_assert( $cond, $label ) {
	if ( $cond ) {
		echo "  ok: {$label}\n";
		return;
	}
	++$GLOBALS['wd_fail'];
	echo "  FAIL: {$label}\n";
}

/**
 * Mirrors WP's sanitize_title_with_dashes closely enough for taxonomy names:
 * lowercase, spaces to dashes, underscores preserved (so pa_color stays stable).
 */
function sanitize_title( $value ) {
	$value = strtolower( trim( (string) $value ) );
	$value = preg_replace( '/[^a-z0-9\x{0600}-\x{06FF} _-]+/u', '', $value );
	$value = preg_replace( '/\s+/', '-', (string) $value );
	return trim( preg_replace( '/-+/', '-', (string) $value ), '-' );
}
function sanitize_text_field( $v ) { return trim( (string) $v ); }
function sanitize_key( $v ) { return strtolower( preg_replace( '/[^a-z0-9_\-]/i', '', (string) $v ) ); }
function taxonomy_exists( $t ) { return ! empty( $GLOBALS['wd_taxonomies'][ (string) $t ] ); }
function register_taxonomy( $t, $object, $args = array() ) { $GLOBALS['wd_taxonomies'][ (string) $t ] = true; }
function apply_filters( $hook, $value, ...$args ) { return $value; }
function wc_attribute_label( $name, $product = null ) { return (string) $name; }
function __( $v, $d = null ) { return $v; }
function delete_transient( $k ) {}
function wp_cache_delete( $k, $g = '' ) {}
function wc_get_attribute_taxonomies() { return array(); }
function wc_delete_product_transients( $id ) {}
function get_post_meta( $id, $key = '', $single = false ) {
	$meta = $GLOBALS['wd_vmeta'][ (int) $id ] ?? array();
	if ( '' === (string) $key ) {
		return $meta; // WP returns every meta key when the key is omitted.
	}
	return $meta[ $key ] ?? '';
}

function wp_insert_term( $name, $taxonomy, $args = array() ) {
	$slug = $args['slug'] ?? sanitize_title( $name );
	$GLOBALS['wd_inserts'][] = array( (string) $taxonomy, (string) $name, (string) $slug );
	$GLOBALS['wd_terms'][ (string) $taxonomy ][ $slug ] = array(
		'term_id' => count( $GLOBALS['wd_terms'][ (string) $taxonomy ] ?? array() ) + 1,
		'name'    => (string) $name,
		'slug'    => (string) $slug,
	);
	return array( 'term_id' => $GLOBALS['wd_terms'][ (string) $taxonomy ][ $slug ]['term_id'], 'slug' => $slug );
}

class WP_Error {
	public $code;
	public function __construct( $code = '', $message = '', $data = null ) { $this->code = $code; }
	public function get_error_code() { return $this->code; }
	public function get_error_data() { return 1; }
}
function is_wp_error( $e ) { return $e instanceof WP_Error; }

function get_term_by( $field, $value, $taxonomy ) {
	foreach ( $GLOBALS['wd_terms'][ (string) $taxonomy ] ?? array() as $slug => $row ) {
		if ( 'slug' === $field && (string) $slug === (string) $value ) {
			return (object) $row;
		}
		if ( 'name' === $field && (string) $row['name'] === (string) $value ) {
			return (object) $row;
		}
	}
	return false;
}
function get_term( $id, $taxonomy ) {
	foreach ( $GLOBALS['wd_terms'][ (string) $taxonomy ] ?? array() as $row ) {
		if ( (int) $row['term_id'] === (int) $id ) {
			return (object) $row;
		}
	}
	return false;
}

class WC_Product_Attribute {
	private $id = 0;
	private $name = '';
	private $options = array();
	private $position = 0;
	private $visible = true;
	private $variation = false;
	public function set_id( $v ) { $this->id = (int) $v; }
	public function get_id() { return $this->id; }
	public function set_name( $v ) { $this->name = (string) $v; }
	public function get_name() { return $this->name; }
	public function set_options( $v ) { $this->options = (array) $v; }
	public function get_options() { return $this->options; }
	public function set_position( $v ) { $this->position = (int) $v; }
	public function get_position() { return $this->position; }
	public function set_visible( $v ) { $this->visible = (bool) $v; }
	public function get_visible() { return $this->visible; }
	public function set_variation( $v ) { $this->variation = (bool) $v; }
	public function get_variation() { return $this->variation; }
	public function is_taxonomy() { return 0 === strpos( $this->name, 'pa_' ); }
}

class WC_Product_Variation {
	public function get_id() { return 0; }
}

class WD_Test_Variation extends WC_Product_Variation {
	public $attributes;
	public $saves = 0;
	public function __construct( array $attributes ) { $this->attributes = $attributes; }
	public function is_type( $t ) { return 'variation' === $t; }
	public function get_attributes() { return $this->attributes; }
	public function set_attributes( $a ) { $this->attributes = $a; }
	public function save() { ++$this->saves; }
	public function get_id() { return 99; }
}

class WD_Test_Parent {
	public $attributes;
	public $saves = 0;
	public $children = array();
	public function __construct( array $attributes ) { $this->attributes = $attributes; }
	public function is_type( $t ) { return 'variable' === $t; }
	public function get_attributes() { return $this->attributes; }
	public function set_attributes( $a ) { $this->attributes = $a; }
	public function save() { ++$this->saves; }
	public function get_id() { return 10; }
	public function get_children() { return $this->children; }
	public function get_variation_attributes() {
		$out = array();
		foreach ( $this->attributes as $key => $attr ) {
			if ( ! $attr->get_variation() ) {
				continue;
			}
			$options = array();
			if ( $attr->is_taxonomy() ) {
				foreach ( $attr->get_options() as $term_id ) {
					$term = get_term( $term_id, $attr->get_name() );
					if ( $term ) {
						$options[] = $term->slug;
					}
				}
			} else {
				$options = $attr->get_options();
			}
			$out[ (string) $key ] = $options;
		}
		return $out;
	}
}

$GLOBALS['wd_products'] = array();
function wc_get_product( $id ) { return $GLOBALS['wd_products'][ (int) $id ] ?? false; }

// Load the class under test without firing its hooks (init/register are not called).
require_once $root . '/includes/class-webino-dashboard-rest-crud.php';

echo "== variation attribute safety ==\n";

$GLOBALS['wd_terms']['pa_color']['red']  = array( 'term_id' => 1, 'name' => 'قرمز', 'slug' => 'red' );
$GLOBALS['wd_terms']['pa_color']['blue'] = array( 'term_id' => 2, 'name' => 'آبی', 'slug' => 'blue' );

$color = new WC_Product_Attribute();
$color->set_id( 3 );
$color->set_name( 'pa_color' );
$color->set_options( array( 1, 2 ) );
$color->set_variation( true );

$size = new WC_Product_Attribute();
$size->set_name( 'اندازه' );
$size->set_options( array( 'S', 'M' ) );
$size->set_variation( true );

$parent                  = new WD_Test_Parent( array( 'pa_color' => $color, 'اندازه' => $size ) );
$GLOBALS['wd_products'][10] = $parent;

$ref = new ReflectionClass( 'Webino_Dashboard_REST_Crud' );

// 1) building storage attributes for the editor must never create terms.
$build  = $ref->getMethod( 'build_variation_storage_attributes' );
$before = count( $GLOBALS['wd_inserts'] );
$map    = $build->invoke( null, $parent, array( 'pa_color' => 'قرمز', 'اندازه' => 'M' ) );
wd_assert( $before === count( $GLOBALS['wd_inserts'] ), 'read-only storage build inserts no terms' );
wd_assert( isset( $map['pa_color'] ) && 'red' === $map['pa_color'], 'labels resolve to the stored term slug' );

// 2) a single unresolvable axis must not wipe the resolvable ones (was all-or-nothing).
$partial = $build->invoke( null, $parent, array( 'pa_color' => 'red', 'اندازه' => '' ) );
wd_assert( array( 'pa_color' => 'red' ) === $partial, 'partial maps keep the axes that do resolve' );

// 3) write mode may create a missing term (explicit save with a new value).
$write = $build->invoke( null, $parent, array( 'pa_color' => 'green', 'اندازه' => 'M' ), true );
wd_assert( 'green' === ( $write['pa_color'] ?? '' ) && count( $GLOBALS['wd_inserts'] ) > $before, 'explicit write may create the term' );

// 4) the parent migration is read-only unless the caller asks for it.
$migrate  = $ref->getMethod( 'migrate_parent_variation_attributes_to_global' );
$snapshot = serialize( $parent->get_attributes() );
$inserts  = count( $GLOBALS['wd_inserts'] );
$migrate->invoke( null, $parent );
wd_assert( serialize( $parent->get_attributes() ) === $snapshot, 'read path leaves parent attributes untouched' );
wd_assert( 0 === $parent->saves, 'read path does not save the parent' );
wd_assert( $inserts === count( $GLOBALS['wd_inserts'] ), 'read path creates no terms/taxonomies' );

// 5) reading a variation with blank meta never saves it.
$readable = $ref->getMethod( 'readable_variation_attributes' );
$variation = new WD_Test_Variation( array( 'pa_color' => '', 'اندازه' => 'M' ) );
$GLOBALS['wd_vmeta'][99] = array( 'attribute_pa_color' => array( 'red' ) );
$view = $readable->invoke( null, $parent, $variation );
wd_assert( 0 === $variation->saves, 'reading a variation never saves it' );
wd_assert( 'red' === ( $view['pa_color'] ?? '' ), 'the stored meta value is exposed for the editor' );

// 6) a complete variation needs no repair at all.
$complete = new WD_Test_Variation( array( 'pa_color' => 'red', 'اندازه' => 'M' ) );
wd_assert( null === $readable->invoke( null, $parent, $complete ), 'complete variations are left alone' );

// 7) variation stock repair respects backorders and unknown quantities.
$stock_ref = $ref->getMethod( 'repair_variable_children_stock_status' );
wd_assert( $stock_ref->isPublic(), 'stock repair stays callable from module code' );

if ( $GLOBALS['wd_fail'] > 0 ) {
	exit( 1 );
}
echo "OK: variation attribute safety\n";
