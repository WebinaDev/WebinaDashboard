<?php
/**
 * Integration test for storefront coupon rules (single coupon, tiers, caps, boundaries, validation).
 *
 * Runs inside a WordPress + WooCommerce site that loads Webino Dashboard. It CREATES and then DELETES
 * test products/coupons/orders (prefixed "wbtest"), so only run it on a local/staging site:
 *
 *   WEBINO_COUPON_TEST=1 wp eval-file scripts/test-coupon-rules.php
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	fwrite( STDERR, "Run with: WEBINO_COUPON_TEST=1 wp eval-file scripts/test-coupon-rules.php\n" );
	exit( 1 );
}
if ( '1' !== getenv( 'WEBINO_COUPON_TEST' ) ) {
	fwrite( STDERR, "Refusing to run: set WEBINO_COUPON_TEST=1 (creates/deletes test data; staging only).\n" );
	exit( 1 );
}
if ( ! class_exists( 'WooCommerce' ) || ! class_exists( 'Webino_Dashboard_Coupon_Storefront' ) ) {
	fwrite( STDERR, "WooCommerce + Webino Dashboard must be active.\n" );
	exit( 1 );
}

$GLOBALS['wbt_fail']    = 0;
$GLOBALS['wbt_pass']    = 0;
$GLOBALS['wbt_created'] = array( 'post' => array(), 'user' => array() );

function wbt_ok( $cond, $label, $extra = '' ) {
	if ( $cond ) {
		++$GLOBALS['wbt_pass'];
		echo "  ok   {$label}\n";
	} else {
		++$GLOBALS['wbt_fail'];
		echo "  FAIL {$label}" . ( '' !== $extra ? " — {$extra}" : '' ) . "\n";
	}
}
function wbt_eq( $a, $b, $label ) {
	wbt_ok( $a == $b, $label, 'got ' . wp_json_encode( $a ) . ' expected ' . wp_json_encode( $b ) ); // phpcs:ignore WordPress.PHP.StrictComparisons.LooseComparison
}
function wbt_product( $name, $price, $sale = '' ) {
	$p = new WC_Product_Simple();
	$p->set_name( 'wbtest ' . $name );
	$p->set_status( 'publish' );
	$p->set_regular_price( (string) $price );
	if ( '' !== $sale ) {
		$p->set_sale_price( (string) $sale );
	}
	$p->save();
	$GLOBALS['wbt_created']['post'][] = $p->get_id();
	return $p->get_id();
}
function wbt_coupon( $code, $type, $amount, $args = array() ) {
	$c = new WC_Coupon();
	$c->set_code( $code );
	$c->set_discount_type( $type );
	$c->set_amount( (string) $amount );
	if ( isset( $args['min'] ) ) {
		$c->set_minimum_amount( (string) $args['min'] );
	}
	if ( isset( $args['max'] ) ) {
		$c->set_maximum_amount( (string) $args['max'] );
	}
	if ( isset( $args['expires'] ) ) {
		$c->set_date_expires( $args['expires'] );
	}
	if ( isset( $args['usage_limit'] ) ) {
		$c->set_usage_limit( $args['usage_limit'] );
		$c->set_usage_count( $args['usage_count'] ?? 0 );
	}
	if ( ! empty( $args['free_shipping'] ) ) {
		$c->set_free_shipping( true );
	}
	$c->save();
	$id = $c->get_id();
	$GLOBALS['wbt_created']['post'][] = $id;
	if ( ! empty( $args['visible'] ) ) {
		update_post_meta( $id, '_webino_offer_visible', 1 );
	}
	if ( ! empty( $args['auto'] ) ) {
		update_post_meta( $id, '_webino_offer_auto_apply', 1 );
	}
	if ( isset( $args['cap'] ) ) {
		update_post_meta( $id, '_webino_offer_max_discount', (string) $args['cap'] );
	}
	if ( isset( $args['condition'] ) ) {
		update_post_meta( $id, '_webino_offer_builder', 1 );
		update_post_meta( $id, '_webino_offer_condition_type', $args['condition'][0] );
		update_post_meta( $id, '_webino_offer_condition_value', (string) $args['condition'][1] );
	}
	return $id;
}
function wbt_status( $ids, $status ) {
	foreach ( (array) $ids as $id ) {
		wp_update_post( array( 'ID' => $id, 'post_status' => $status ) );
	}
	Webino_Dashboard_Coupon_Storefront::flush_request_cache();
}
function wbt_reset_cart() {
	WC()->cart->empty_cart( true );
	WC()->cart->remove_coupons();
	wc_clear_notices();
	WC()->session->set( Webino_Dashboard_Coupon_Storefront::SESSION_AUTO, null );
	WC()->session->set( Webino_Dashboard_Coupon_Storefront::SESSION_OPTOUT, null );
	WC()->session->set( Webino_Dashboard_Coupon_Storefront::SESSION_FLASH, null );
	Webino_Dashboard_Coupon_Storefront::flush_request_cache();
}
function wbt_calc() {
	Webino_Dashboard_Coupon_Storefront::flush_request_cache();
	WC()->cart->calculate_totals();
	return WC()->cart;
}
function wbt_applied() {
	return array_values( WC()->cart->get_applied_coupons() );
}
function wbt_notices_text() {
	$out = array();
	foreach ( wc_get_notices() as $type => $list ) {
		foreach ( $list as $n ) {
			$out[] = $type . ':' . wp_strip_all_tags( is_array( $n ) ? $n['notice'] : $n );
		}
	}
	return implode( ' | ', $out );
}

// ---------------------------------------------------------------- setup
$prev = array(
	'currency' => get_option( 'woocommerce_currency' ),
	'decimals' => get_option( 'woocommerce_price_num_decimals' ),
	'settings' => get_option( Webino_Dashboard_Coupon_Storefront::OPTION, null ),
);
update_option( 'woocommerce_currency', 'IRT' );
update_option( 'woocommerce_price_num_decimals', '0' );
delete_option( Webino_Dashboard_Coupon_Storefront::OPTION );

wp_set_current_user( 0 );
wc_load_cart();
WC()->cart->get_cart();

$p_a    = wbt_product( 'A', 400000 );
$p_b    = wbt_product( 'B', 700000 );
$p_sale = wbt_product( 'S', 500000, 300000 );
$p_one  = wbt_product( 'one-toman', 1 );

$t1 = wbt_coupon( 'wbtest-t1', 'fixed_cart', 50000, array( 'min' => 1000000, 'visible' => 1, 'auto' => 1, 'condition' => array( 'min_amount', 1000000 ) ) );
$t2 = wbt_coupon( 'wbtest-t2', 'fixed_cart', 100000, array( 'min' => 1500000, 'visible' => 1, 'auto' => 1, 'condition' => array( 'min_amount', 1500000 ) ) );
$t3 = wbt_coupon( 'wbtest-t3', 'percent', 10, array( 'visible' => 1, 'cap' => 100000, 'condition' => array( 'min_items', 3 ) ) );
$pv = wbt_coupon( 'wbtest-private20', 'percent', 20 );
$big = wbt_coupon( 'wbtest-big', 'fixed_cart', 5000000, array( 'visible' => 1 ) );
$exp = wbt_coupon( 'wbtest-expired', 'fixed_cart', 10000, array( 'visible' => 1, 'expires' => time() - DAY_IN_SECONDS ) );
$used = wbt_coupon( 'wbtest-used', 'fixed_cart', 10000, array( 'visible' => 1, 'usage_limit' => 1, 'usage_count' => 1 ) );
$nth = wbt_coupon( 'wbtest-first', 'fixed_cart', 30000, array( 'visible' => 1, 'condition' => array( 'order_nth', 1 ) ) );
$bad = wbt_coupon( 'wbtest-badrange', 'fixed_cart', 1000, array( 'visible' => 1, 'min' => 900000 ) );
update_post_meta( $bad, 'maximum_amount', '800000' ); // Legacy bad data: WooCommerce setters refuse min > max.
clean_post_cache( $bad );
wp_cache_flush();

wbt_status( array( $big, $nth, $t3, $bad ), 'draft' );

// Isolate from the site's own coupons and shipping setup: only test coupons, no shipping costs.
add_filter(
	'webino_coupon_storefront_candidate_ids',
	static function ( $ids ) {
		return array_values(
			array_filter(
				$ids,
				static function ( $id ) {
					return 0 === strpos( (string) get_post_field( 'post_title', $id ), 'wbtest-' );
				}
			)
		);
	}
);
add_filter( 'woocommerce_cart_needs_shipping', '__return_false' );

try {
	echo "== tiers / auto-apply / boundaries ==\n";
	wbt_reset_cart();
	$s = Webino_Dashboard_Coupon_Storefront::get_state();
	wbt_ok( ! empty( $s['empty'] ) && null === $s['next'], 'empty cart → no widget data' );

	$key_a = WC()->cart->add_to_cart( $p_a, 1 );
	wbt_calc();
	wbt_eq( wbt_applied(), array(), '400k: nothing auto-applied (below 1M)' );
	$s = Webino_Dashboard_Coupon_Storefront::get_state();
	wbt_eq( $s['next']['id'] ?? null, $t1, '400k: next coupon is the 1M tier' );
	wbt_eq( (float) ( $s['next']['remaining'] ?? -1 ), 600000.0, '400k: remaining 600k' );
	wbt_eq( (float) ( $s['next']['ratio'] ?? -1 ), 0.4, '400k: ratio 0.4' );
	wbt_ok( false !== strpos( (string) ( $s['next']['message'] ?? '' ), '600' ), 'next message contains remaining amount', (string) ( $s['next']['message'] ?? '' ) );
	wbt_ok( ! in_array( $exp, wp_list_pluck( $s['eligible'], 'id' ), true ) && ! in_array( $used, wp_list_pluck( $s['eligible'], 'id' ), true ), 'expired / used-up coupons are not offered' );
	wbt_status( array( $bad ), 'publish' );
	$s2 = Webino_Dashboard_Coupon_Storefront::get_state();
	wbt_ok( is_array( $s2['eligible'] ), 'legacy min>max coupon data does not break state (WooCommerce reads it as no max)' );
	wbt_status( array( $bad ), 'draft' );

	$key_b = WC()->cart->add_to_cart( $p_b, 1 );
	wbt_calc();
	wbt_eq( wbt_applied(), array( 'wbtest-t1' ), '1.1M: 1M tier auto-applied' );
	wbt_eq( (float) WC()->cart->get_discount_total(), 50000.0, '1.1M: discount 50k' );
	$s = Webino_Dashboard_Coupon_Storefront::get_state();
	wbt_eq( $s['next']['id'] ?? null, $t2, '1.1M: next coupon is the 1.5M tier' );
	wbt_eq( (float) ( $s['next']['remaining'] ?? -1 ), 400000.0, '1.1M: remaining 400k' );

	// Exactly on the boundary: 400k*2 + 700k = 1.5M (WooCommerce minimum is inclusive).
	WC()->cart->set_quantity( $key_a, 2 );
	wbt_calc();
	wbt_eq( wbt_applied(), array( 'wbtest-t2' ), '1.5M (exact boundary): upgraded to 1.5M tier, single coupon' );
	wbt_eq( (float) WC()->cart->get_discount_total(), 100000.0, '1.5M: discount 100k (not 150k stacked)' );
	$s = Webino_Dashboard_Coupon_Storefront::get_state();
	wbt_ok( null === $s['next'], '1.5M: no next coupon' );

	// Drop below the tier: coupon removed gracefully, lower tier re-applied.
	wc_clear_notices();
	WC()->cart->set_quantity( $key_a, 1 );
	wbt_calc();
	wbt_eq( wbt_applied(), array( 'wbtest-t1' ), 'back to 1.1M: 1.5M tier removed, 1M tier auto-applied' );
	wbt_ok( false !== strpos( wbt_notices_text(), 'wbtest-t2' ), 'removal notice mentions the removed coupon', wbt_notices_text() );
	wbt_ok( WC()->cart->get_total( 'edit' ) >= 0, 'cart total never negative' );

	echo "== single coupon: manual replace / opt-out ==\n";
	wc_clear_notices();
	$ok = WC()->cart->apply_coupon( 'wbtest-private20' );
	wbt_calc();
	wbt_ok( $ok, 'customer can apply a private code' );
	wbt_eq( wbt_applied(), array( 'wbtest-private20' ), 'private code replaced the auto coupon (only one applied)' );
	wbt_eq( (float) WC()->cart->get_discount_total(), 220000.0, '20% of 1.1M = 220k' );
	wbt_ok( false !== strpos( wbt_notices_text(), 'wbtest-t1' ), 'replacement notice shown', wbt_notices_text() );
	wbt_ok( false === stripos( wbt_notices_text(), 'automatically' ), 'no bogus auto-apply notice while replacing', wbt_notices_text() );

	WC()->cart->remove_coupon( 'wbtest-private20' );
	wbt_calc();
	wbt_eq( wbt_applied(), array(), 'after customer removes the code, worse auto coupon is NOT forced back' );

	$ok = WC()->cart->apply_coupon( 'wbtest-t1' );
	wbt_calc();
	wbt_eq( wbt_applied(), array( 'wbtest-t1' ), 'customer picks the 1M tier from the list' );
	wc_clear_notices();
	$ok = WC()->cart->apply_coupon( 'wbtest-t2' );
	wbt_calc();
	wbt_ok( ! $ok, '1.5M tier rejected on a 1.1M cart' );
	wbt_eq( wbt_applied(), array( 'wbtest-t1' ), 'rejected coupon does not remove the current one' );

	// Store API (block cart) replace path: removes the old individual-use coupon first, which recalculates totals.
	if ( class_exists( '\\Automattic\\WooCommerce\\StoreApi\\Utilities\\CartController' ) ) {
		WC()->session->set( 'webino_coupon_flash', null );
		$cc = new \Automattic\WooCommerce\StoreApi\Utilities\CartController();
		$cc->apply_coupon( 'wbtest-private20' );
		wbt_calc();
		wbt_eq( wbt_applied(), array( 'wbtest-private20' ), 'Store API: new coupon replaces the old one' );
		$flash = wp_json_encode( WC()->session->get( 'webino_coupon_flash' ), JSON_UNESCAPED_UNICODE );
		wbt_ok( false === stripos( (string) $flash, 'automatically' ), 'Store API: auto-apply did not jump in during the replace', $flash );
		$cc->apply_coupon( 'wbtest-t1' );
		wbt_calc();
		wbt_eq( wbt_applied(), array( 'wbtest-t1' ), 'Store API: switch back to the tier coupon' );
	}

	// Legacy session / programmatic stacking → safety net keeps the latest only.
	WC()->cart->set_applied_coupons( array( 'wbtest-t1', 'wbtest-private20' ) );
	wbt_calc();
	wbt_eq( count( wbt_applied() ), 1, 'safety net: never more than one coupon at calculation time' );

	echo "== percent cap / min items ==\n";
	wbt_reset_cart();
	wbt_status( array( $t3 ), 'publish' );
	WC()->cart->add_to_cart( $p_a, 2 );
	wbt_calc();
	$ok = WC()->cart->apply_coupon( 'wbtest-t3' );
	wbt_ok( ! $ok, 'min-items offer rejected with 2 items (server-side condition)' );
	WC()->cart->add_to_cart( $p_b, 3 );
	wbt_calc();
	WC()->cart->remove_coupons();
	$ok = WC()->cart->apply_coupon( 'wbtest-t3' );
	wbt_calc();
	wbt_ok( $ok, 'min-items offer accepted with 5 items' );
	wbt_eq( wbt_applied(), array( 'wbtest-t3' ), 'only the percent offer applied' );
	wbt_eq( (float) WC()->cart->get_discount_total(), 100000.0, '10% of 2.9M capped at 100k (max discount)' );
	update_post_meta( $t3, '_webino_offer_max_discount', '1000000' );
	wbt_calc();
	wbt_eq( (float) WC()->cart->get_discount_total(), 290000.0, 'cap above the discount → full 10% (290k)' );
	update_post_meta( $t3, '_webino_offer_max_discount', '100000' );
	wbt_status( array( $t3 ), 'draft' );

	echo "== coupon larger than cart / tiny amounts ==\n";
	wbt_reset_cart();
	wbt_status( array( $big ), 'publish' );
	WC()->cart->add_to_cart( $p_a, 1 );
	wbt_calc();
	WC()->cart->apply_coupon( 'wbtest-big' );
	wbt_calc();
	wbt_eq( (float) WC()->cart->get_discount_total(), 400000.0, '5M fixed coupon on 400k cart discounts 400k only' );
	wbt_eq( (float) WC()->cart->get_total( 'edit' ), 0.0, 'cart total is 0, not negative' );
	wbt_reset_cart();
	WC()->cart->add_to_cart( $p_one, 1 );
	wbt_calc();
	WC()->cart->apply_coupon( 'wbtest-big' );
	wbt_calc();
	wbt_ok( (float) WC()->cart->get_total( 'edit' ) >= 0 && (float) WC()->cart->get_discount_total() <= 1.0, '1-toman cart: discount ≤ 1, total ≥ 0' );
	$s = Webino_Dashboard_Coupon_Storefront::get_state();
	wbt_ok( is_array( $s['eligible'] ), 'state builds for tiny cart' );
	wbt_status( array( $big ), 'draft' );

	echo "== sale items excluded ==\n";
	wbt_reset_cart();
	$ns = wbt_coupon( 'wbtest-nosale', 'percent', 50, array() );
	$c  = new WC_Coupon( $ns );
	$c->set_exclude_sale_items( true );
	$c->save();
	WC()->cart->add_to_cart( $p_sale, 1 );
	wbt_calc();
	$ok = WC()->cart->apply_coupon( 'wbtest-nosale' );
	wbt_ok( ! $ok, 'exclude-sale coupon rejected when only sale items are in cart' );

	echo "== Nth order ==\n";
	wbt_reset_cart();
	wbt_status( array( $nth ), 'publish' );
	$uid = wp_insert_user( array( 'user_login' => 'wbtest_' . wp_generate_password( 6, false ), 'user_pass' => wp_generate_password(), 'user_email' => 'wbtest' . wp_rand( 1000, 9999 ) . '@example.com' ) );
	$GLOBALS['wbt_created']['user'][] = $uid;
	WC()->cart->add_to_cart( $p_a, 1 );
	wbt_calc();
	wbt_ok( WC()->cart->apply_coupon( 'wbtest-first' ), 'guest: first-order coupon allowed in cart' );
	WC()->cart->remove_coupons();
	$order = wc_create_order( array( 'customer_id' => $uid ) );
	$order->add_product( wc_get_product( $p_a ), 1 );
	$order->calculate_totals();
	$order->set_status( 'completed' );
	$order->save();
	$GLOBALS['wbt_created']['post'][] = $order->get_id();
	wp_set_current_user( $uid );
	Webino_Dashboard_Coupon_Storefront::flush_request_cache();
	wc_clear_notices();
	wbt_ok( ! WC()->cart->apply_coupon( 'wbtest-first' ), 'customer with a completed order cannot use first-order coupon' );
	wp_set_current_user( 0 );
	wbt_status( array( $nth ), 'draft' );

	echo "== dashboard input validation ==\n";
	$req = static function ( $params ) {
		$r = new WP_REST_Request( 'POST', '/x' );
		foreach ( $params as $k => $v ) {
			$r->set_param( $k, $v );
		}
		return $r;
	};
	wbt_ok( is_wp_error( Webino_Dashboard_Coupons::validate_request( $req( array( 'code' => 'wbtest-new', 'type' => 'percent', 'amount' => '150' ) ) ) ), 'percent > 100 rejected' );
	wbt_ok( is_wp_error( Webino_Dashboard_Coupons::validate_request( $req( array( 'code' => 'wbtest-new', 'amount' => '-5' ) ) ) ), 'negative amount rejected' );
	wbt_ok( is_wp_error( Webino_Dashboard_Coupons::validate_request( $req( array( 'code' => 'wbtest-new', 'amount' => '1000', 'minimum_amount' => '2,000,000', 'maximum_amount' => '1,000,000' ) ) ) ), 'min spend > max spend rejected' );
	wbt_ok( is_wp_error( Webino_Dashboard_Coupons::validate_request( $req( array( 'code' => 'wbtest-t1', 'amount' => '1000' ) ) ) ), 'duplicate code rejected' );
	wbt_ok( is_wp_error( Webino_Dashboard_Coupons::validate_request( $req( array( 'code' => '', 'amount' => '1000' ) ) ) ), 'empty code rejected' );
	wbt_ok( true === Webino_Dashboard_Coupons::validate_request( $req( array( 'code' => 'wbtest-new', 'type' => 'fixed_cart', 'amount' => '۵۰,۰۰۰', 'minimum_amount' => '۱٬۰۰۰٬۰۰۰' ) ) ), 'Persian digits / separators accepted' );
	wbt_eq( Webino_Dashboard_Coupons::decimal_or_empty( '۱٬۵۰۰٬۰۰۰' ), '1500000', 'Persian amount normalized' );
	wbt_eq( Webino_Dashboard_Coupons::decimal_or_empty( '0' ), '', 'zero min/max means no limit' );
	wbt_eq( Webino_Dashboard_Coupons::limit_or_null( '-3' ), null, 'negative usage limit → unlimited (not 3)' );
	$tz = wp_timezone();
	$ts = Webino_Dashboard_Coupons::parse_expiry( '2026-10-10' );
	$dt = ( new DateTimeImmutable( '@' . $ts ) )->setTimezone( $tz );
	wbt_eq( $dt->format( 'Y-m-d H:i:s' ), '2026-10-10 23:59:59', 'expiry date-only = end of that day in store timezone' );
	wbt_eq( Webino_Dashboard_Coupons::parse_expiry( '2026-02-31' ), -1, 'invalid date ignored' );

	echo "== data repair (max discount stored as max spend) ==\n";
	$legacy = wbt_coupon( 'wbtest-legacy', 'percent', 5, array( 'max' => 1000000, 'cap' => 1000000, 'condition' => array( 'min_items', 2 ) ) );
	delete_option( Webino_Dashboard_Coupon_Storefront::DATA_VERSION_OPT );
	Webino_Dashboard_Coupon_Storefront::maybe_upgrade_data();
	$lc = new WC_Coupon( $legacy );
	wbt_eq( (float) $lc->get_maximum_amount(), 0.0, 'legacy offer: wrong maximum spend cleared' );
	wbt_eq( (string) get_post_meta( $legacy, '_webino_offer_max_discount', true ), '1000000', 'legacy offer: cap kept' );

	echo "== Rial / large amounts ==\n";
	update_option( 'woocommerce_currency', 'IRR' );
	wbt_reset_cart();
	$p_big = wbt_product( 'rial-big', 2000000000 );
	$rial  = wbt_coupon( 'wbtest-rial', 'fixed_cart', 500000, array( 'min' => 1500000000, 'visible' => 1 ) );
	WC()->cart->add_to_cart( $p_big, 1 );
	wbt_calc();
	wbt_ok( WC()->cart->apply_coupon( 'wbtest-rial' ), '2B rial cart passes 1.5B min spend' );
	wbt_calc();
	wbt_eq( (float) WC()->cart->get_total( 'edit' ), 1999500000.0, 'large rial total exact' );
	wbt_ok( false !== strpos( Webino_Dashboard_Coupon_Storefront::price_text( 1500000000 ), '1,500,000,000' ), 'price text formats large amounts', Webino_Dashboard_Coupon_Storefront::price_text( 1500000000 ) );
} catch ( Throwable $e ) {
	wbt_ok( false, 'unexpected exception', get_class( $e ) . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine() );
}

// ---------------------------------------------------------------- cleanup
wbt_reset_cart();
wp_set_current_user( 0 );
foreach ( array_reverse( $GLOBALS['wbt_created']['post'] ) as $id ) {
	wp_delete_post( $id, true );
	if ( function_exists( 'wc_get_order' ) && ( $o = wc_get_order( $id ) ) ) {
		$o->delete( true );
	}
}
require_once ABSPATH . 'wp-admin/includes/user.php';
foreach ( $GLOBALS['wbt_created']['user'] as $uid ) {
	wp_delete_user( $uid );
}
update_option( 'woocommerce_currency', $prev['currency'] );
update_option( 'woocommerce_price_num_decimals', $prev['decimals'] );
if ( null === $prev['settings'] ) {
	delete_option( Webino_Dashboard_Coupon_Storefront::OPTION );
} else {
	update_option( Webino_Dashboard_Coupon_Storefront::OPTION, $prev['settings'] );
}

echo "\n{$GLOBALS['wbt_pass']} passed, {$GLOBALS['wbt_fail']} failed\n";
if ( $GLOBALS['wbt_fail'] > 0 ) {
	exit( 1 );
}
