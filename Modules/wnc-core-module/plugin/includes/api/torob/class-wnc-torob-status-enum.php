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
 * Torob Status Enum
 *
 * Defines Torob-specific order status constants
 * These are the statuses returned by the order status API
 *
 * @package Torob_WCPE
 */
class WNC_Torob_Status_Enum
{
    const WAITING_FOR_USER_PAYMENT = 'WAITING_FOR_USER_PAYMENT';
    const WAITING_FOR_SHOP = 'WAITING_FOR_SHOP';
    const PROCESSING = 'PROCESSING';
    const SHIPPED = 'SHIPPED';
    const CANCELED_PAID = 'CANCELED_PAID';
    const CANCELED_UNPAID = 'CANCELED_UNPAID';
}
