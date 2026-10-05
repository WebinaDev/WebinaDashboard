<?php
/**
 * Digikala webhook endpoint.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Webhook_Handler {

	/**
	 * @return void
	 */
	public static function register_rewrite() {
		add_rewrite_rule( '^webino/digikala-webhook/?$', 'index.php?webino_digikala_webhook=1', 'top' );
		add_rewrite_tag( '%webino_digikala_webhook%', '1' );
	}

	/**
	 * @return void
	 */
	public static function handle_request() {
		if ( '1' !== get_query_var( 'webino_digikala_webhook' ) ) {
			return;
		}
		$body = file_get_contents( 'php://input' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$data = json_decode( is_string( $body ) ? $body : '', true );
		if ( ! is_array( $data ) ) {
			status_header( 400 );
			echo wp_json_encode( array( 'ok' => false, 'message' => 'invalid payload' ) );
			exit;
		}
		$settings = Digikala_Auth::settings();
		$secret_header = isset( $_SERVER['HTTP_X_DIGIKALA_SIGNATURE'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_X_DIGIKALA_SIGNATURE'] ) ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		if ( ! empty( $settings['webhook_secret'] ) ) {
			$expected = hash_hmac( 'sha256', (string) $body, (string) $settings['webhook_secret'] );
			if ( ! hash_equals( $expected, $secret_header ) ) {
				status_header( 403 );
				echo wp_json_encode( array( 'ok' => false, 'message' => 'invalid signature' ) );
				exit;
			}
		}
		$event = sanitize_key( (string) ( $data['event'] ?? '' ) );
		Digikala_Phase3_Sync::dispatch_webhook_event( $event, $data );
		status_header( 200 );
		echo wp_json_encode( array( 'ok' => true ) );
		exit;
	}
}
