<?php

namespace Webino_Dashboard_Bots_Telegram\Admin;

use Webino_Dashboard_Bots_Telegram\Core\Plugin;

/**
 * Admin UI for broadcast messages to Bale users.
 */
class BroadcastPage {

	public static function init(): void {
		add_action( 'admin_post_woobale_broadcast_start', array( __CLASS__, 'handle_start' ) );
		add_action( 'admin_post_woobale_broadcast_cancel', array( __CLASS__, 'handle_cancel' ) );
	}

	public static function render(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'شما اجازه دسترسی ندارید.', 'webino-dashboard' ) );
		}

		$job = BroadcastQueue::get_job();
		$is_advanced = Plugin::has_feature( 'advanced_media' );
		if ( isset( $_GET['woobale_broadcast'] ) && $_GET['woobale_broadcast'] === 'err' ) {
			$err = get_transient( 'woobale_broadcast_err' );
			delete_transient( 'woobale_broadcast_err' );
			if ( $err ) {
				echo '<div class="notice notice-error is-dismissible"><p>' . esc_html( $err ) . '</p></div>';
			}
		}
		if ( isset( $_GET['woobale_broadcast'] ) && $_GET['woobale_broadcast'] === 'started' ) {
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'صف ارسال شروع شد.', 'webino-dashboard' ) . '</p></div>';
		}
		if ( isset( $_GET['woobale_broadcast'] ) && $_GET['woobale_broadcast'] === 'cancelled' ) {
			echo '<div class="notice notice-info is-dismissible"><p>' . esc_html__( 'صف متوقف شد.', 'webino-dashboard' ) . '</p></div>';
		}
		?>
		<div class="wrap woobale-admin-wrap">
			<h1><?php esc_html_e( 'پیام همگانی بله', 'webino-dashboard' ); ?></h1>
			<p class="description"><?php esc_html_e( 'پیام به همه کاربرانی که chat_id بازو دارند، ارسال می‌شود. ارسال به صورت تدریجی انجام می‌شود تا محدودیت API رعایت شود.', 'webino-dashboard' ); ?></p>
			<?php if ( ! $is_advanced ) : ?>
				<div class="notice notice-warning"><p><?php esc_html_e( 'طرح فعلی: پایه. ارسال رسانه فقط در طرح پیشرفته فعال است.', 'webino-dashboard' ); ?></p></div>
			<?php endif; ?>

			<?php if ( $job && ! empty( $job['active'] ) ) : ?>
				<div class="notice notice-info">
					<p>
						<?php
						echo esc_html(
							sprintf(
								/* translators: 1: sent, 2: failed */
								__( 'در حال ارسال… موفق: %1$d — ناموفق: %2$d', 'webino-dashboard' ),
								(int) $job['sent'],
								(int) $job['failed']
							)
						);
						?>
					</p>
					<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
						<?php wp_nonce_field( 'woobale_broadcast_cancel' ); ?>
						<input type="hidden" name="action" value="woobale_broadcast_cancel" />
						<?php submit_button( __( 'توقف و پاک کردن صف', 'webino-dashboard' ), 'delete', 'submit', false ); ?>
					</form>
				</div>
			<?php elseif ( $job && empty( $job['active'] ) ) : ?>
				<div class="notice notice-success is-dismissible">
					<p>
						<?php
						echo esc_html(
							sprintf(
								/* translators: 1: sent, 2: failed */
								__( 'آخرین ارسال تمام شد. موفق: %1$d — ناموفق: %2$d', 'webino-dashboard' ),
								(int) $job['sent'],
								(int) $job['failed']
							)
						);
						?>
					</p>
				</div>
			<?php endif; ?>

			<?php if ( ! $job || empty( $job['active'] ) ) : ?>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="max-width:720px;">
				<?php wp_nonce_field( 'woobale_broadcast_start' ); ?>
				<input type="hidden" name="action" value="woobale_broadcast_start" />
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="woobale_broadcast_type"><?php esc_html_e( 'نوع پیام', 'webino-dashboard' ); ?></label></th>
						<td>
							<select name="broadcast_type" id="woobale_broadcast_type">
								<option value="text"><?php esc_html_e( 'متنی', 'webino-dashboard' ); ?></option>
								<option value="photo"><?php esc_html_e( 'عکس', 'webino-dashboard' ); ?></option>
								<option value="video"><?php esc_html_e( 'ویدیو', 'webino-dashboard' ); ?></option>
								<option value="voice"><?php esc_html_e( 'ویس', 'webino-dashboard' ); ?></option>
								<option value="document"><?php esc_html_e( 'فایل', 'webino-dashboard' ); ?></option>
							</select>
							<p class="description"><?php esc_html_e( 'برای رسانه، آدرس مستقیم فایل یا file_id بله را وارد کنید.', 'webino-dashboard' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="woobale_broadcast_text"><?php esc_html_e( 'متن/کپشن پیام', 'webino-dashboard' ); ?></label></th>
						<td>
							<textarea name="broadcast_text" id="woobale_broadcast_text" class="large-text" rows="6"></textarea>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="woobale_broadcast_media"><?php esc_html_e( 'فایل رسانه (اختیاری)', 'webino-dashboard' ); ?></label></th>
						<td>
							<input type="text" name="broadcast_media" id="woobale_broadcast_media" class="large-text" value="" />
						</td>
					</tr>
				</table>
				<?php submit_button( __( 'شروع ارسال همگانی', 'webino-dashboard' ), 'primary', 'submit', false ); ?>
			</form>
			<?php endif; ?>
		</div>
		<?php
	}

	public static function handle_start(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'Forbidden', 'webino-dashboard' ) );
		}
		check_admin_referer( 'woobale_broadcast_start' );
		$text = isset( $_POST['broadcast_text'] ) ? wp_unslash( $_POST['broadcast_text'] ) : '';
		$type = isset( $_POST['broadcast_type'] ) ? sanitize_key( wp_unslash( $_POST['broadcast_type'] ) ) : 'text';
		$media = isset( $_POST['broadcast_media'] ) ? sanitize_text_field( wp_unslash( $_POST['broadcast_media'] ) ) : '';
		if ( $type !== 'text' && ! Plugin::has_feature( 'advanced_media' ) ) {
			$res = array(
				'ok'    => false,
				'error' => __( 'ارسال رسانه فقط در طرح پیشرفته فعال است.', 'webino-dashboard' ),
			);
		} else {
			$payload = array(
			'type'    => $type,
			'text'    => is_string( $text ) ? $text : '',
			'caption' => is_string( $text ) ? $text : '',
			'media'   => $media,
		);
			$res  = BroadcastQueue::start( $payload );
		}
		$args = array( 'page' => 'woobale-broadcast' );
		if ( ! $res['ok'] ) {
			$args['woobale_broadcast'] = 'err';
			set_transient( 'woobale_broadcast_err', isset( $res['error'] ) ? (string) $res['error'] : '', 60 );
		} else {
			$args['woobale_broadcast'] = 'started';
		}
		wp_safe_redirect( add_query_arg( $args, admin_url( 'admin.php' ) ) );
		exit;
	}

	public static function handle_cancel(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'Forbidden', 'webino-dashboard' ) );
		}
		check_admin_referer( 'woobale_broadcast_cancel' );
		BroadcastQueue::cancel();
		wp_safe_redirect( add_query_arg( array( 'page' => 'woobale-broadcast', 'woobale_broadcast' => 'cancelled' ), admin_url( 'admin.php' ) ) );
		exit;
	}
}
