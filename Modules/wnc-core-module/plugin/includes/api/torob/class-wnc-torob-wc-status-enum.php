<?php
/**
 * Torob port — adapted from official plugin 2.3.0.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Order Status Enum
 *
 * Defines WooCommerce order status constants without the 'wc-' prefix
 * These match the values returned by WC_Order::get_status()
 *
 * @package Torob_WCPE
 */
class WNC_Torob_WC_Status_Enum
{
    const PENDING = 'pending';
    const ON_HOLD = 'on-hold';
    const PROCESSING = 'processing';
    const COMPLETED = 'completed';
    const CANCELLED = 'cancelled';
    const REFUNDED = 'refunded';
    const FAILED = 'failed';
}
