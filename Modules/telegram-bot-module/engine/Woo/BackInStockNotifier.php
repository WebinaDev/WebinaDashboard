<?php

namespace Webino_Dashboard_Bots_Telegram\Woo;

use Webino_Dashboard_Bots_Telegram\Bale\Client;

/**
 * When a watched product returns to stock, notify Bale chats.
 */
class BackInStockNotifier {

	public static function init(): void {
		add_action( 'woocommerce_product_set_stock', array( __CLASS__, 'on_set_stock' ), 30, 1 );
	}

	/**
	 * @param \WC_Product $product
	 */
	public static function on_set_stock( $product ): void {
		if ( ! $product instanceof \WC_Product ) {
			return;
		}
		if ( ! $product->is_in_stock() ) {
			return;
		}
		$pid = $product->get_id();
		if ( $product->is_type( 'variation' ) ) {
			$pid = (int) $product->get_parent_id();
		}
		if ( $pid < 1 ) {
			return;
		}
		$chats = StockWatchRegistry::pop_chat_ids_for_product( $pid );
		if ( empty( $chats ) ) {
			return;
		}
		if ( $product->is_type( 'variation' ) ) {
			$parent = wc_get_product( $pid );
			$name   = $parent ? wp_strip_all_tags( (string) $parent->get_name() ) : wp_strip_all_tags( (string) $product->get_name() );
		} else {
			$name = wp_strip_all_tags( (string) $product->get_name() );
		}
		$client = new Client();
		$text   = sprintf(
			/* translators: %s: product name */
			__( 'کالای «%s» دوباره موجود شد. می‌توانید از فروشگاه بازو بازدید کنید.', 'webino-dashboard' ),
			$name
		);
		foreach ( $chats as $chat ) {
			$client->send_message(
				array(
					'chat_id' => $chat,
					'text'    => $text,
				)
			);
		}
	}
}
