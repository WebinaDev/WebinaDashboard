<?php
/**
 * Moadian transport interface (direct vs TSP).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared send/inquiry surface.
 */
interface Accounting_Moadian_Transport {
	/**
	 * @param array<int,array<string,mixed>> $packets Packets.
	 * @return array<string,mixed>|WP_Error
	 */
	public function send_invoices( array $packets );

	/**
	 * @param string $uid UID.
	 * @return array<string,mixed>|WP_Error
	 */
	public function inquiry_by_uid( $uid );

	/**
	 * @param string $ref Reference.
	 * @return array<string,mixed>|WP_Error
	 */
	public function inquiry_by_reference( $ref );

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public function get_fiscal_information();

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public function get_server_information();
}
