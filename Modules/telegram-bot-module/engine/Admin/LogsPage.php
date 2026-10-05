<?php

namespace Webino_Dashboard_Bots_Telegram\Admin;

use Webino_Dashboard_Bots_Telegram\Logging\ActivityLog;

/**
 * Admin: recent WooBale log lines with date filter.
 */
class LogsPage {

	public static function render(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'شما اجازه دسترسی ندارید.', 'webino-dashboard' ) );
		}

		$df = isset( $_GET['woobale_log_from'] ) ? sanitize_text_field( wp_unslash( $_GET['woobale_log_from'] ) ) : '';
		$dt = isset( $_GET['woobale_log_to'] ) ? sanitize_text_field( wp_unslash( $_GET['woobale_log_to'] ) ) : '';
		$ch = isset( $_GET['woobale_log_channel'] ) ? sanitize_key( wp_unslash( $_GET['woobale_log_channel'] ) ) : '';

		$from_ts = null;
		$to_ts   = null;
		if ( $df !== '' ) {
			$t = strtotime( $df . ' 00:00:00' );
			if ( $t ) {
				$from_ts = $t;
			}
		}
		if ( $dt !== '' ) {
			$t = strtotime( $dt . ' 23:59:59' );
			if ( $t ) {
				$to_ts = $t;
			}
		}

		$entries = ActivityLog::get_entries( $from_ts, $to_ts, $ch !== '' ? $ch : null );
		$entries = array_reverse( $entries );

		$base = admin_url( 'admin.php?page=woobale-logs' );
		?>
		<div class="wrap woobale-admin-wrap">
			<h1><?php esc_html_e( 'WooBale — لاگ و خطاها', 'webino-dashboard' ); ?></h1>
			<p class="description"><?php esc_html_e( 'رویدادهای اخیر API بله، وب‌هوک رد شده، و صف ارسال مجدد — بدون نیاز به لاگ سرور.', 'webino-dashboard' ); ?></p>

			<form method="get" action="" style="margin: 1em 0;">
				<input type="hidden" name="page" value="woobale-logs" />
				<label>
					<?php esc_html_e( 'از تاریخ', 'webino-dashboard' ); ?>
					<input type="date" name="woobale_log_from" value="<?php echo esc_attr( $df ); ?>" />
				</label>
				<label>
					<?php esc_html_e( 'تا تاریخ', 'webino-dashboard' ); ?>
					<input type="date" name="woobale_log_to" value="<?php echo esc_attr( $dt ); ?>" />
				</label>
				<label>
					<?php esc_html_e( 'نوع', 'webino-dashboard' ); ?>
					<select name="woobale_log_channel">
						<option value=""><?php esc_html_e( 'همه', 'webino-dashboard' ); ?></option>
						<option value="api" <?php selected( $ch, 'api' ); ?>><?php esc_html_e( 'API بله', 'webino-dashboard' ); ?></option>
						<option value="webhook" <?php selected( $ch, 'webhook' ); ?>><?php esc_html_e( 'وب‌هوک', 'webino-dashboard' ); ?></option>
						<option value="outbound" <?php selected( $ch, 'outbound' ); ?>><?php esc_html_e( 'ارسال / صف', 'webino-dashboard' ); ?></option>
					</select>
				</label>
				<?php submit_button( __( 'فیلتر', 'webino-dashboard' ), 'secondary', '', false ); ?>
				<a class="button" href="<?php echo esc_url( $base ); ?>"><?php esc_html_e( 'پاک کردن فیلتر', 'webino-dashboard' ); ?></a>
			</form>

			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'زمان', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'سطح', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'بخش', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'پیام', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'جزئیات', 'webino-dashboard' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $entries ) ) : ?>
						<tr><td colspan="5"><?php esc_html_e( 'موردی یافت نشد.', 'webino-dashboard' ); ?></td></tr>
					<?php else : ?>
						<?php foreach ( $entries as $row ) : ?>
							<tr>
								<td><code><?php echo esc_html( wp_date( 'Y-m-d H:i:s', (int) $row['ts'] ) ); ?></code></td>
								<td><?php echo esc_html( (string) $row['level'] ); ?></td>
								<td><?php echo esc_html( (string) $row['channel'] ); ?></td>
								<td><?php echo esc_html( (string) $row['msg'] ); ?></td>
								<td><code style="word-break:break-all;font-size:11px;"><?php echo esc_html( wp_json_encode( $row['ctx'] ) ); ?></code></td>
							</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}
}
