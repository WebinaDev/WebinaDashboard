<?php
/**
 * Static checks for sales status / net revenue helpers (no WordPress bootstrap).
 *
 * @package WebinoDashboard
 */

declare(strict_types=1);

$root = dirname( __DIR__ );
$file = $root . '/includes/class-webino-dashboard-order-reports.php';
if ( ! is_readable( $file ) ) {
	fwrite( STDERR, "FAIL: missing order-reports class\n" );
	exit( 1 );
}

// Minimal stubs so the class file can load.
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', $root . '/' );
}
if ( ! function_exists( 'sanitize_key' ) ) {
	function sanitize_key( $key ) {
		$key = strtolower( (string) $key );
		return preg_replace( '/[^a-z0-9_\-]/', '', $key );
	}
}
if ( ! function_exists( 'apply_filters' ) ) {
	function apply_filters( $tag, $value ) {
		return $value;
	}
}
if ( ! function_exists( 'wc_get_is_paid_statuses' ) ) {
	function wc_get_is_paid_statuses() {
		return array( 'processing', 'completed', 'partially-refunded' );
	}
}
if ( ! function_exists( 'wc_get_order_statuses' ) ) {
	function wc_get_order_statuses() {
		return array(
			'wc-pending'             => 'Pending',
			'wc-processing'          => 'Processing',
			'wc-completed'           => 'Completed',
			'wc-cancelled'           => 'Cancelled',
			'wc-refunded'            => 'Refunded',
			'wc-failed'              => 'Failed',
			'wc-partially-refunded'  => 'Partially refunded',
			'wc-packaged'            => 'Packaged',
			'wc-awaiting-review'     => 'Awaiting review', // unpaid custom — must NOT auto-join sales
			'wc-webino-packaged'     => 'Packaged',
			'wc-bslm-preparation'    => 'Basalam prep',
		);
	}
}

require_once $file;

$never = Webino_Dashboard_Order_Reports::sales_never_count_statuses();
foreach ( array( 'cancelled', 'refunded', 'failed', 'pending', 'on-hold' ) as $bad ) {
	if ( ! in_array( $bad, $never, true ) ) {
		fwrite( STDERR, "FAIL: never-count must include {$bad}\n" );
		exit( 1 );
	}
}
if ( in_array( 'partially-refunded', $never, true ) ) {
	fwrite( STDERR, "FAIL: partially-refunded must remain a sales-eligible status\n" );
	exit( 1 );
}

$sales = Webino_Dashboard_Order_Reports::sales_statuses();
foreach ( array( 'cancelled', 'refunded', 'failed', 'pending' ) as $bad ) {
	if ( in_array( $bad, $sales, true ) ) {
		fwrite( STDERR, "FAIL: sales_statuses must not include {$bad}\n" );
		exit( 1 );
	}
}
$must_include = array(
	'processing',
	'completed',
	'partially-refunded',
	'webino-in-stock',
	'webino-packaged',
	'webino-courier',
	'webino-post',
	'webino-tipax',
	'webino-ready-to-ship',
	'webino-shipping',
	'sent-to-warehouse',
	'packaged',
	'courier',
	'post',
	'tipax',
	'bslm-preparation',
	'bslm-shipping',
	'bslm-completed',
);
foreach ( $must_include as $good ) {
	if ( ! in_array( $good, $sales, true ) ) {
		fwrite( STDERR, "FAIL: sales_statuses must include {$good}\n" );
		exit( 1 );
	}
}
foreach ( array( 'awaiting-review', 'bslm-wait-vendor', 'bslm-rejected', 'webino-returned', 'webino-deleted', 'webino-need-review', 'on-hold' ) as $still_out ) {
	if ( in_array( $still_out, $sales, true ) ) {
		fwrite( STDERR, "FAIL: sales_statuses must not include {$still_out}\n" );
		exit( 1 );
	}
}

// Net total helper.
if ( ! class_exists( 'WC_Order' ) ) {
	class WC_Order {
		private $total;
		private $refunded;
		private $status;

		public function __construct( float $total, float $refunded, string $status ) {
			$this->total    = $total;
			$this->refunded = $refunded;
			$this->status   = $status;
		}

		public function get_total() {
			return $this->total;
		}

		public function get_total_refunded() {
			return $this->refunded;
		}

		public function get_status() {
			return $this->status;
		}

		public function get_refunds() {
			return array();
		}
	}
}

$partial = new WC_Order( 100.0, 30.0, 'processing' );
if ( abs( Webino_Dashboard_Order_Reports::order_net_total( $partial ) - 70.0 ) > 0.001 ) {
	fwrite( STDERR, "FAIL: order_net_total partial refund\n" );
	exit( 1 );
}
if ( ! Webino_Dashboard_Order_Reports::order_counts_in_sale_metrics( $partial ) ) {
	fwrite( STDERR, "FAIL: partial refund order should count in sales\n" );
	exit( 1 );
}

$packaged = new WC_Order( 100.0, 0.0, 'webino-packaged' );
if ( ! Webino_Dashboard_Order_Reports::order_counts_in_sale_metrics( $packaged ) ) {
	fwrite( STDERR, "FAIL: webino-packaged order should count in sales\n" );
	exit( 1 );
}

$basalam = new WC_Order( 100.0, 0.0, 'bslm-preparation' );
if ( ! Webino_Dashboard_Order_Reports::order_counts_in_sale_metrics( $basalam ) ) {
	fwrite( STDERR, "FAIL: bslm-preparation order should count in sales\n" );
	exit( 1 );
}

$cancelled = new WC_Order( 100.0, 0.0, 'cancelled' );
if ( Webino_Dashboard_Order_Reports::order_counts_in_sale_metrics( $cancelled ) ) {
	fwrite( STDERR, "FAIL: cancelled order must not count in sales\n" );
	exit( 1 );
}

$full_refund = new WC_Order( 100.0, 100.0, 'processing' );
if ( Webino_Dashboard_Order_Reports::order_counts_in_sale_metrics( $full_refund ) ) {
	fwrite( STDERR, "FAIL: fully refunded net-zero order must not count in sales\n" );
	exit( 1 );
}

echo "OK: order-reports sales status helpers\n";
