<?php

namespace Webino_Dashboard_Bots_Telegram\Bot;

/**
 * Route incoming Bale updates to handlers.
 */
class Router {
	/**
	 * @param array<string, mixed> $context
	 */
	private function log_info( string $event, array $context = array() ): void {
		$message = '[' . $event . '] ' . wp_json_encode( $context );
		if ( function_exists( 'wc_get_logger' ) ) {
			wc_get_logger()->info( $message, array( 'source' => 'webino_dashboard_telegram' ) );
			return;
		}
		error_log( 'woobale ' . $message );
	}

	/**
	 * @param array<string, mixed> $update
	 */
	public function dispatch( array $update ): void {
		if ( ! class_exists( '\WooCommerce' ) ) {
			$this->log_info( 'router_skip_woocommerce_inactive' );
			return;
		}

		if ( ! empty( $update['pre_checkout_query'] ) ) {
			PaymentHandler::handle_pre_checkout( $update['pre_checkout_query'] );
			return;
		}

		if ( ! empty( $update['inline_query'] ) && is_array( $update['inline_query'] ) ) {
			InlineQueryHandler::handle( $update['inline_query'] );
			return;
		}

		if ( ! empty( $update['callback_query'] ) ) {
			CallbackHandler::handle( $update['callback_query'] );
			return;
		}

		if ( ! empty( $update['message']['successful_payment'] ) && is_array( $update['message'] ) ) {
			PaymentHandler::handle_successful_payment( $update['message'] );
			return;
		}

		if ( ! empty( $update['message'] ) && is_array( $update['message'] ) ) {
			MessageHandler::handle( $update['message'] );
			return;
		}

		$this->log_info( 'router_unhandled_update', array( 'keys' => array_keys( $update ) ) );
	}
}
