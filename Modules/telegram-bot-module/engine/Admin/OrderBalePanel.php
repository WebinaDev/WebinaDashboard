<?php

namespace Webino_Dashboard_Bots_Telegram\Admin;

/**
 * Order edit screen: send messages to customer's Bale chat.
 */
class OrderBalePanel {

	public static function init(): void {
		add_action( 'woocommerce_admin_order_data_after_billing_address', array( __CLASS__, 'render' ), 30 );
		add_action( 'woocommerce_process_shop_order_meta', array( __CLASS__, 'save_order_meta' ), 20, 1 );
		// HPOS / modern order editor.
		add_action( 'woocommerce_update_order', array( __CLASS__, 'save_order_meta' ), 20, 1 );
	}

	/**
	 * @param int $order_id
	 */
	public static function save_order_meta( $order_id ): void {
		if ( ! isset( $_POST['woobale_order_tracking'] ) || ! current_user_can( 'edit_shop_order', $order_id ) ) {
			return;
		}
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		$order->update_meta_data( 'woobale_tracking_code', sanitize_text_field( wp_unslash( $_POST['woobale_order_tracking'] ) ) );
		$order->save();
	}

	/**
	 * @param \WC_Order $order
	 */
	public static function render( $order ): void {
		if ( ! $order instanceof \WC_Order ) {
			return;
		}
		if ( ! current_user_can( 'edit_shop_order', $order->get_id() ) ) {
			return;
		}

		$uid  = (int) $order->get_user_id();
		$chat = $uid ? get_user_meta( $uid, 'webino_dashboard_telegram_chat_id', true ) : '';
		?>
		<div class="woobale-order-bale-panel address">
			<h3><?php esc_html_e( 'WooBale — پیام در بله', 'webino-dashboard' ); ?></h3>
			<p>
				<label for="woobale_order_tracking"><?php esc_html_e( 'کد رهگیری پست (متغیر {tracking_code})', 'webino-dashboard' ); ?></label>
				<input type="text" name="woobale_order_tracking" id="woobale_order_tracking" class="regular-text" value="<?php echo esc_attr( (string) $order->get_meta( 'woobale_tracking_code' ) ); ?>" />
			</p>
			<?php if ( ! $uid ) : ?>
				<p class="woobale-chat-info"><?php esc_html_e( 'سفارش مهمان: ارسال به بله ممکن نیست.', 'webino-dashboard' ); ?></p>
			<?php elseif ( ! $chat ) : ?>
				<p class="woobale-chat-info"><?php esc_html_e( 'این مشتری هنوز با بازو وارد نشده (chat_id ندارد).', 'webino-dashboard' ); ?></p>
			<?php else : ?>
				<p class="woobale-chat-info">
					<?php esc_html_e( 'chat_id:', 'webino-dashboard' ); ?>
					<code><?php echo esc_html( (string) $chat ); ?></code>
				</p>
				<p>
					<label for="woobale_custom_message"><?php esc_html_e( 'متن دلخواه', 'webino-dashboard' ); ?></label>
					<textarea id="woobale_custom_message" rows="4" placeholder="<?php esc_attr_e( 'پیام به مشتری در بله…', 'webino-dashboard' ); ?>"></textarea>
				</p>
				<div class="woobale-order-bale-actions">
					<button type="button" class="button button-primary woobale-js-order-send" data-order-id="<?php echo esc_attr( (string) $order->get_id() ); ?>" data-action="custom">
						<?php esc_html_e( 'ارسال متن', 'webino-dashboard' ); ?>
					</button>
					<button type="button" class="button woobale-js-order-send" data-order-id="<?php echo esc_attr( (string) $order->get_id() ); ?>" data-action="summary">
						<?php esc_html_e( 'خلاصه سفارش', 'webino-dashboard' ); ?>
					</button>
					<button type="button" class="button woobale-js-order-send" data-order-id="<?php echo esc_attr( (string) $order->get_id() ); ?>" data-action="payment_link">
						<?php esc_html_e( 'لینک پرداخت', 'webino-dashboard' ); ?>
					</button>
					<button type="button" class="button woobale-js-order-send" data-order-id="<?php echo esc_attr( (string) $order->get_id() ); ?>" data-action="invoice">
						<?php esc_html_e( 'فاکتور بله', 'webino-dashboard' ); ?>
					</button>
					<button type="button" class="button woobale-js-order-send" data-order-id="<?php echo esc_attr( (string) $order->get_id() ); ?>" data-action="status_template">
						<?php esc_html_e( 'قالب وضعیت فعلی', 'webino-dashboard' ); ?>
					</button>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}
}
