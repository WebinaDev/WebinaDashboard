<?php

namespace Webino_Dashboard_Bots_Bale\Woo;

use Webino_Dashboard_Bots_Bale\Database\SessionRepository;

/**
 * GDPR: remove Bale chat binding and related session/meta from a user account.
 */
class BaleDisconnect {

	public static function init(): void {
		add_action( 'woocommerce_save_account_details', array( __CLASS__, 'maybe_disconnect_account' ), 15, 1 );
		add_action( 'woocommerce_edit_account_form', array( __CLASS__, 'render_account_checkbox' ) );
		add_action( 'admin_post_woobale_admin_disconnect_bale', array( __CLASS__, 'handle_admin_disconnect' ) );
	}

	public static function render_account_checkbox(): void {
		$user = wp_get_current_user();
		if ( ! $user || ! $user->ID ) {
			return;
		}
		$chat = get_user_meta( $user->ID, 'woobale_chat_id', true );
		if ( ! $chat ) {
			return;
		}
		wp_nonce_field( 'woobale_disconnect_bale', 'woobale_disconnect_bale_nonce' );
		?>
		<p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
			<label class="woocommerce-form__label woocommerce-form__label-for-checkbox checkbox">
				<input type="checkbox" name="woobale_disconnect_bale" value="1" class="woocommerce-form__input woocommerce-form__input-checkbox" />
				<span class="woocommerce-form__label-text"><?php esc_html_e( 'قطع اتصال حسابم از ربات بله و حذف دادهٔ مرتبط', 'webino-dashboard' ); ?></span>
			</label>
		</p>
		<?php
	}

	public static function maybe_disconnect_account( int $user_id ): void {
		if ( $user_id < 1 ) {
			return;
		}
		if ( empty( $_POST['woobale_disconnect_bale'] ) ) {
			return;
		}
		if ( ! isset( $_POST['woobale_disconnect_bale_nonce'] )
			|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['woobale_disconnect_bale_nonce'] ) ), 'woobale_disconnect_bale' ) ) {
			return;
		}
		self::purge_user_bale_data( $user_id );
		wc_add_notice( __( 'اتصال بله از حساب شما حذف شد.', 'webino-dashboard' ), 'success' );
	}

	public static function handle_admin_disconnect(): void {
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'مجوز ندارید.', 'webino-dashboard' ) );
		}
		check_admin_referer( 'woobale_admin_disconnect_bale' );
		$uid = isset( $_POST['user_id'] ) ? absint( $_POST['user_id'] ) : 0;
		if ( $uid < 1 ) {
			wp_safe_redirect( admin_url( 'users.php' ) );
			exit;
		}
		self::purge_user_bale_data( $uid );
		wp_safe_redirect( get_edit_user_link( $uid ) . '&woobale_disconnected=1' );
		exit;
	}

	public static function purge_user_bale_data( int $user_id ): void {
		if ( $user_id < 1 ) {
			return;
		}
		$chat = get_user_meta( $user_id, 'woobale_chat_id', true );
		delete_user_meta( $user_id, 'woobale_chat_id' );
		delete_user_meta( $user_id, AbandonedCartService::META_TOUCHED );
		delete_user_meta( $user_id, AbandonedCartService::META_REMINDED );
		if ( $chat ) {
			StockWatchRegistry::remove_chat_everywhere( (string) $chat );
			$repo = new SessionRepository();
			$repo->delete_by_chat_id( (string) $chat );
		}
		$repo = new SessionRepository();
		$repo->delete_by_wp_user_id( $user_id );
	}
}
