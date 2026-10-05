<?php

namespace Webino_Dashboard_Bots_Telegram\Bot;

use Webino_Dashboard_Bots_Telegram\Bale\Client;
use Webino_Dashboard_Bots_Telegram\Core\Plugin;

/**
 * Telegram inline_query product search.
 */
class InlineQueryHandler {

	/**
	 * @param array<string, mixed> $inline
	 */
	public static function handle( array $inline ): void {
		$query_id = isset( $inline['id'] ) ? (string) $inline['id'] : '';
		$q        = isset( $inline['query'] ) ? trim( (string) $inline['query'] ) : '';
		if ( $query_id === '' || ! function_exists( 'wc_get_products' ) ) {
			return;
		}
		$client  = new Client();
		$results = array();
		$args    = array(
			'status' => 'publish',
			'limit'  => 10,
			'return' => 'objects',
		);
		if ( $q !== '' ) {
			$args['s'] = $q;
		}
		$products = wc_get_products( $args );
		if ( ! is_array( $products ) ) {
			$products = array();
		}
		$bot_username = '';
		$s            = Plugin::get_settings();
		if ( ! empty( $s['bot_username'] ) ) {
			$bot_username = ltrim( (string) $s['bot_username'], '@' );
		}
		foreach ( $products as $product ) {
			if ( ! $product instanceof \WC_Product || ! $product->is_visible() ) {
				continue;
			}
			$pid   = $product->get_id();
			$title = wp_strip_all_tags( (string) $product->get_name() );
			$price = StoreFlow::price_text( $product );
			$desc  = $price;
			$body  = '<b>' . esc_html( $title ) . '</b>' . "\n" . esc_html( $price );
			$kbd   = array(
				'inline_keyboard' => array(
					array(
						array(
							'text'          => __( 'مشاهده در ربات', 'webino-dashboard' ),
							'callback_data' => 'pd:' . $pid,
						),
					),
				),
			);
			if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
				$url = Webino_Dashboard_Bots_Loyalty::webapp_url( 'product/' . $pid );
				if ( $url !== '' ) {
					$kbd['inline_keyboard'][0][] = array(
						'text' => __( 'WebApp', 'webino-dashboard' ),
						'url'  => $url,
					);
				}
			}
			$results[] = array(
				'type'                  => 'article',
				'id'                    => (string) $pid,
				'title'                 => mb_substr( $title, 0, 64 ),
				'description'           => mb_substr( $desc, 0, 120 ),
				'input_message_content' => array(
					'message_text' => $body,
					'parse_mode'   => 'HTML',
				),
				'reply_markup'          => $kbd,
			);
		}
		$client->answer_inline_query(
			array(
				'inline_query_id' => $query_id,
				'results'         => wp_json_encode( $results ),
				'cache_time'      => 30,
				'is_personal'     => false,
			)
		);
	}
}
