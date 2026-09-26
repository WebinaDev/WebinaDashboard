<?php
/**
 * Trusted Service Provider (شرکت معتمد) Moadian transport.
 *
 * Generic HTTP adapter: POST {base}/invoices, GET inquiry endpoints.
 * Merchants configure base URL + API key for their TSP.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * TSP proxy client.
 */
final class Accounting_Moadian_Transport_Tsp implements Accounting_Moadian_Transport {

	/**
	 * {@inheritdoc}
	 */
	public function send_invoices( array $packets ) {
		return $this->request( 'POST', 'invoices', array( 'packets' => $packets ) );
	}

	/**
	 * {@inheritdoc}
	 */
	public function inquiry_by_uid( $uid ) {
		return $this->request( 'POST', 'inquiry/uid', array( 'uidList' => array( (string) $uid ) ) );
	}

	/**
	 * {@inheritdoc}
	 */
	public function inquiry_by_reference( $ref ) {
		return $this->request( 'POST', 'inquiry/reference', array( 'referenceNumber' => array( (string) $ref ) ) );
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_fiscal_information() {
		$fiscal = (string) Accounting_Config::get()['fiscal_id'];
		return $this->request( 'POST', 'fiscal-information', array( 'fiscalId' => $fiscal ) );
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_server_information() {
		return $this->request( 'GET', 'server-information', array() );
	}

	/**
	 * @param string              $method Method.
	 * @param string              $path   Path.
	 * @param array<string,mixed> $body   Body.
	 * @return array<string,mixed>|WP_Error
	 */
	private function request( $method, $path, array $body ) {
		$cfg  = Accounting_Config::get();
		$base = rtrim( (string) ( $cfg['tsp_base_url'] ?? '' ), '/' );
		$key  = Accounting_Config::tsp_api_key();
		if ( '' === $base ) {
			return new WP_Error( 'acc_tsp_url', __( 'TSP base URL is not configured.', 'webino-dashboard' ) );
		}
		if ( '' === $key ) {
			return new WP_Error( 'acc_tsp_key', __( 'TSP API key is not configured.', 'webino-dashboard' ) );
		}
		$url = $base . '/' . ltrim( $path, '/' );
		$headers = array(
			'Content-Type'  => 'application/json',
			'Accept'        => 'application/json',
			'Authorization' => 'Bearer ' . $key,
			'X-API-Key'     => $key,
			'User-Agent'    => 'WebinoDashboard-Accounting-TSP/1.5',
		);
		$args = array(
			'timeout' => 45,
			'headers' => $headers,
			'method'  => $method,
		);
		if ( 'GET' !== strtoupper( $method ) ) {
			$args['body'] = wp_json_encode( $body );
		}
		$proxy = trim( (string) ( $cfg['moadian_proxy'] ?? '' ) );
		if ( '' !== $proxy ) {
			$args['proxy'] = $proxy;
		}
		$res = wp_remote_request( $url, $args );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		$data = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		if ( ! is_array( $data ) ) {
			$data = array( 'raw' => wp_remote_retrieve_body( $res ) );
		}
		Accounting_Moadian_Client::log( null, null, 'out', 'tsp:' . $path, $code, $body, $data );
		if ( $code < 200 || $code >= 300 ) {
			$msg = (string) ( $data['message'] ?? $data['error'] ?? __( 'TSP API error.', 'webino-dashboard' ) );
			return new WP_Error( 'acc_tsp_http', $msg, array( 'status' => $code, 'data' => $data ) );
		}
		return $data;
	}
}
