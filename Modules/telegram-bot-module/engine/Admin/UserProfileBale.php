<?php

namespace Webino_Dashboard_Bots_Telegram\Admin;

/**
 * User profile: Bale chat + send message.
 */
class UserProfileBale {

	public static function init(): void {
		add_action( 'show_user_profile', array( __CLASS__, 'render' ) );
		add_action( 'edit_user_profile', array( __CLASS__, 'render' ) );
		add_action( 'admin_notices', array( __CLASS__, 'admin_notice_disconnected' ) );
		add_filter( 'manage_users_columns', array( __CLASS__, 'users_columns' ) );
		add_filter( 'manage_users_custom_column', array( __CLASS__, 'users_column_content' ), 10, 3 );
		add_filter( 'user_row_actions', array( __CLASS__, 'users_row_actions' ), 10, 2 );
	}

	/**
	 * @param \WP_User $user
	 */
	public static function render( $user ): void {
		if ( ! current_user_can( 'edit_users' ) ) {
			return;
		}
		$chat = get_user_meta( $user->ID, 'webino_dashboard_telegram_chat_id', true );
		?>
		<div id="woobale-user-bale" class="woobale-user-bale-section">
			<h2><?php esc_html_e( 'WooBale — بله', 'webino-dashboard' ); ?></h2>
			<table class="form-table">
				<tr>
					<th><label><?php esc_html_e( 'وضعیت بازو', 'webino-dashboard' ); ?></label></th>
					<td>
						<?php if ( $chat ) : ?>
							<span class="dashicons dashicons-yes-alt" style="color:green;"></span>
							<?php esc_html_e( 'متصل', 'webino-dashboard' ); ?>
							<code><?php echo esc_html( (string) $chat ); ?></code>
						<?php else : ?>
							<span class="dashicons dashicons-minus"></span>
							<?php esc_html_e( 'بدون اتصال', 'webino-dashboard' ); ?>
						<?php endif; ?>
					</td>
				</tr>
				<?php if ( $chat ) : ?>
				<tr>
					<th><?php esc_html_e( 'حذف اتصال بله (GDPR)', 'webino-dashboard' ); ?></th>
					<td>
						<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" onsubmit="return confirm('<?php echo esc_js( __( 'chat_id و سشن ربات برای این کاربر حذف شود؟', 'webino-dashboard' ) ); ?>');">
							<?php wp_nonce_field( 'woobale_admin_disconnect_bale' ); ?>
							<input type="hidden" name="action" value="woobale_admin_disconnect_bale" />
							<input type="hidden" name="user_id" value="<?php echo esc_attr( (string) $user->ID ); ?>" />
							<?php submit_button( __( 'حذف اتصال بله', 'webino-dashboard' ), 'delete', 'submit', false ); ?>
						</form>
					</td>
				</tr>
				<tr>
					<th><label for="woobale_user_message_<?php echo esc_attr( (string) $user->ID ); ?>"><?php esc_html_e( 'ارسال پیام تست', 'webino-dashboard' ); ?></label></th>
					<td>
						<textarea id="woobale_user_message_<?php echo esc_attr( (string) $user->ID ); ?>" rows="3" class="large-text"></textarea>
						<p>
							<button type="button" class="button button-primary woobale-js-user-send" data-user-id="<?php echo esc_attr( (string) $user->ID ); ?>">
								<?php esc_html_e( 'ارسال به بله', 'webino-dashboard' ); ?>
							</button>
						</p>
					</td>
				</tr>
				<?php endif; ?>
			</table>
		</div>
		<?php
	}

	/**
	 * @param list<string> $columns
	 * @return array<string, string>
	 */
	public static function users_columns( $columns ) {
		$columns['woobale_bale'] = __( 'بله', 'webino-dashboard' );
		return $columns;
	}

	/**
	 * @param string $value
	 * @param string $column
	 * @param int    $user_id
	 */
	public static function users_column_content( $value, $column, $user_id ) {
		if ( $column !== 'woobale_bale' ) {
			return $value;
		}
		$chat = get_user_meta( $user_id, 'webino_dashboard_telegram_chat_id', true );
		if ( $chat ) {
			return '<span class="dashicons dashicons-yes-alt" style="color:green;" title="' . esc_attr( (string) $chat ) . '"></span>';
		}
		return '<span class="dashicons dashicons-minus" title="' . esc_attr__( 'بدون اتصال', 'webino-dashboard' ) . '"></span>';
	}

	/**
	 * @param array<string, string> $actions
	 * @param \WP_User              $user
	 * @return array<string, string>
	 */
	public static function users_row_actions( $actions, $user ) {
		if ( ! $user instanceof \WP_User || ! current_user_can( 'edit_users' ) ) {
			return $actions;
		}
		$chat = get_user_meta( $user->ID, 'webino_dashboard_telegram_chat_id', true );
		if ( ! $chat ) {
			return $actions;
		}
		$actions['woobale_send'] = '<a href="#" class="woobale-js-user-send-quick" data-user-id="' . esc_attr( (string) $user->ID ) . '">' . esc_html__( 'ارسال پیام در بله', 'webino-dashboard' ) . '</a>';
		return $actions;
	}

	public static function admin_notice_disconnected(): void {
		if ( ! isset( $_GET['woobale_disconnected'] ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_users' ) ) {
			return;
		}
		echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'اتصال بله این کاربر حذف شد.', 'webino-dashboard' ) . '</p></div>';
	}
}
