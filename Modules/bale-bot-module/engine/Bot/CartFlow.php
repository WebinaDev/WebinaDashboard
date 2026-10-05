<?php

namespace Webino_Dashboard_Bots_Bale\Bot;

use Webino_Dashboard_Bots_Bale\Bale\Client;
use Webino_Dashboard_Bots_Bale\Database\SessionRepository;
use Webino_Dashboard_Bots_Bale\Util\MoneyFormatter;
use Webino_Dashboard_Bots_Bale\Woo\UserCartContext;

/**
 * Cart UI: inline keyboards with short refs stored in session.
 */
class CartFlow {

	public const META_PREFIX = 'r';

	/**
	 * @return array{lines: list<array{ref:string,key:string,name:string,qty:int}>, text: string, parse_mode?: string}
	 */
	public static function build_cart_state( int $user_id ): array {
		$cart_ctx = new UserCartContext();
		$snapshot = $cart_ctx->get_cart_snapshot_for_bot( $user_id );
		if ( $snapshot === null || ! is_array( $snapshot['cart'] ) || empty( $snapshot['cart'] ) ) {
			return array(
				'lines' => array(),
				'text'  => __( '🛒 سبد خرید:', 'webino-dashboard' ) . "\n\n" . __( 'سبد خرید خالی است.', 'webino-dashboard' ),
			);
		}

		$contents = $snapshot['cart'];
		$lines    = array();
		$i        = 0;
		$sep      = '──────────';

		$product_blocks = array();
		foreach ( $contents as $key => $item ) {
			$ref = self::META_PREFIX . $i;
			/** @var \WC_Product $p */
			$p = $item['data'];
			$lines[] = array(
				'ref'  => $ref,
				'key'  => $key,
				'name' => $p->get_name(),
				'qty'  => (int) $item['quantity'],
			);
			$qty        = max( 1, (int) $item['quantity'] );
			$line_total = isset( $item['line_total'] ) ? (float) $item['line_total'] : 0.0;
			$unit       = $line_total / $qty;
			$qty_label  = MoneyFormatter::to_persian_digits( (string) $qty ) . ' ' . __( 'عدد', 'webino-dashboard' );
			$idx_fa     = MoneyFormatter::to_persian_digits( (string) ( $i + 1 ) );
			$block_lines = array(
				esc_html( $idx_fa . '.  ' . wp_strip_all_tags( $p->get_name() ) ),
				'   🔢 ' . esc_html( $qty_label ),
			);
			if ( ! empty( $item['wfcp_purchase_type'] ) && class_exists( 'Webino_Dashboard_Bots_WFCP', false ) ) {
				$ptype = Webino_Dashboard_Bots_WFCP::cart_type( (string) $item['wfcp_purchase_type'] );
				$tlab  = Webino_Dashboard_Bots_WFCP::type_label( $ptype );
				if ( 'installment' === $ptype && ! empty( $item['wfcp_installment_months'] ) ) {
					$tlab .= ' — ' . sprintf(
						/* translators: %d: months */
						__( '%d ماهه', 'webino-dashboard' ),
						(int) $item['wfcp_installment_months']
					);
				}
				$block_lines[] = '   🏷 ' . esc_html( sprintf( __( 'نوع خرید: %s', 'webino-dashboard' ), $tlab ) );
			}
			$block_lines[]    = '   💵 ' . esc_html( sprintf( __( 'مبلغ هر عدد: %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $unit, null ) ) );
			$block_lines[]    = '   📊 ' . esc_html( sprintf( __( 'مبلغ کل: %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $line_total, null ) ) );
			$product_blocks[] = implode( "\n", $block_lines );
			++$i;
		}

		$header = esc_html( __( '🛒 سبد خرید', 'webino-dashboard' ) ) . "\n\n" . '🛍️ ' . esc_html( __( 'اقلام', 'webino-dashboard' ) ) . "\n\n";
		$body   = implode( "\n" . $sep . "\n", $product_blocks );

		$summary_title = '<b>' . esc_html( '💳 ' . __( 'جمع و تخفیف', 'webino-dashboard' ) ) . '</b>';
		$summary_lines = array();
		foreach ( $snapshot['coupons'] as $code ) {
			$summary_lines[] = esc_html(
				sprintf(
					/* translators: %s: coupon code */
					__( 'کد تخفیف: %s', 'webino-dashboard' ),
					$code
				)
			);
		}
		$subtotal = isset( $snapshot['subtotal'] ) ? (float) $snapshot['subtotal'] : (float) $snapshot['items_total'];
		$discount = (float) $snapshot['discount'];
		$items_net = (float) $snapshot['items_total'];
		$total_no_ship = isset( $snapshot['total_excluding_shipping'] )
			? (float) $snapshot['total_excluding_shipping']
			: $items_net;

		if ( $discount > 0.00001 ) {
			$summary_lines[] = esc_html( sprintf( __( 'جمع قبل از تخفیف: %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $subtotal, null ) ) );
			$summary_lines[] = esc_html( sprintf( __( 'تخفیف: %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $discount, null ) ) );
		}
		$summary_lines[] = esc_html( sprintf( __( 'جمع کالا: %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $items_net, null ) ) );
		$summary_lines[] = esc_html( sprintf( __( 'جمع نهایی: %s', 'webino-dashboard' ), MoneyFormatter::plain_price_amount( $total_no_ship, null ) ) );

		$text = $header . $body . "\n\n" . $summary_title . "\n" . implode( "\n", $summary_lines );

		return array(
			'lines'      => $lines,
			'text'       => $text,
			'parse_mode' => 'HTML',
		);
	}

	/**
	 * @param list<array{ref:string,key:string,name:string,qty:int}> $lines
	 * @return list<array<int, array<string, mixed>>>
	 */
	public static function cart_inline_keyboard( array $lines ): array {
		$rows = array();
		foreach ( $lines as $row_idx => $line ) {
			$ref    = $line['ref'];
			$num_fa = MoneyFormatter::to_persian_digits( (string) ( $row_idx + 1 ) );
			$rows[] = array(
				array(
					'text'          => '−',
					'callback_data' => 'qm:' . $ref,
				),
				array(
					'text'          => (string) $line['qty'],
					'callback_data' => 'i:' . $ref,
				),
				array(
					'text'          => '+',
					'callback_data' => 'qp:' . $ref,
				),
				array(
					'text'          => $num_fa . ' 🗑',
					'callback_data' => 'qd:' . $ref,
				),
			);
		}
		$rows[] = array(
			array(
				'text'          => '🎁 ' . __( 'کد تخفیف', 'webino-dashboard' ),
				'callback_data' => 'cp',
			),
			array(
				'text'          => '✅ ' . __( 'تسویه', 'webino-dashboard' ),
				'callback_data' => 'ch',
			),
		);
		return $rows;
	}

	public static function persist_refs( string $chat_id, array $lines ): void {
		$map = array();
		foreach ( $lines as $line ) {
			$map[ $line['ref'] ] = $line['key'];
		}
		$repo = new SessionRepository();
		$repo->merge_temp_data( $chat_id, array( 'cart_refs' => $map ) );
	}

	/**
	 * @return array<string, string>|null
	 */
	public static function get_refs_map( string $chat_id ): ?array {
		$repo = new SessionRepository();
		$data = $repo->get_temp_data( $chat_id );
		return isset( $data['cart_refs'] ) && is_array( $data['cart_refs'] ) ? $data['cart_refs'] : null;
	}

	public static function send_cart( string $chat_id, int $user_id ): void {
		$state = self::build_cart_state( $user_id );
		$client = new Client();
		if ( empty( $state['lines'] ) ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'سبد خرید خالی است.', 'webino-dashboard' ),
				)
			);
			return;
		}
		self::persist_refs( $chat_id, $state['lines'] );
		$rows = self::cart_inline_keyboard( $state['lines'] );
		$msg  = array(
			'chat_id'      => $chat_id,
			'text'         => $state['text'],
			'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
		);
		if ( ! empty( $state['parse_mode'] ) ) {
			$msg['parse_mode'] = $state['parse_mode'];
		}
		$client->send_message( $msg );
	}

	public static function edit_cart_message( string $chat_id, int $message_id, int $user_id ): void {
		$state  = self::build_cart_state( $user_id );
		$client = new Client();
		if ( empty( $state['lines'] ) ) {
			$client->edit_message_text(
				array(
					'chat_id'    => $chat_id,
					'message_id' => $message_id,
					'text'       => __( 'سبد خرید خالی است.', 'webino-dashboard' ),
				)
			);
			return;
		}
		self::persist_refs( $chat_id, $state['lines'] );
		$rows = self::cart_inline_keyboard( $state['lines'] );
		$edit = array(
			'chat_id'      => $chat_id,
			'message_id'   => $message_id,
			'text'         => $state['text'],
			'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
		);
		if ( ! empty( $state['parse_mode'] ) ) {
			$edit['parse_mode'] = $state['parse_mode'];
		}
		$client->edit_message_text( $edit );
	}
}
