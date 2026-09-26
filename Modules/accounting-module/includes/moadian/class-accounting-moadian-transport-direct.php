<?php
/**
 * Direct self-tsp Moadian transport.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Wraps Accounting_Moadian_Client.
 */
final class Accounting_Moadian_Transport_Direct implements Accounting_Moadian_Transport {

	/**
	 * {@inheritdoc}
	 */
	public function send_invoices( array $packets ) {
		return Accounting_Moadian_Client::send_invoices( $packets );
	}

	/**
	 * {@inheritdoc}
	 */
	public function inquiry_by_uid( $uid ) {
		return Accounting_Moadian_Client::inquiry_by_uid( $uid );
	}

	/**
	 * {@inheritdoc}
	 */
	public function inquiry_by_reference( $ref ) {
		return Accounting_Moadian_Client::inquiry_by_reference( $ref );
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_fiscal_information() {
		return Accounting_Moadian_Client::get_fiscal_information();
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_server_information() {
		return Accounting_Moadian_Client::get_server_information();
	}
}
