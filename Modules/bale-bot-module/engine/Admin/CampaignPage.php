<?php

namespace Webino_Dashboard_Bots_Bale\Admin;

use Webino_Dashboard_Bots_Bale\Core\Plugin;

/**
 * Campaign management page and scheduling handlers.
 */
class CampaignPage {

	private const ADMIN_POST_ACTION = 'webino_dashboard_bale_campaign_create';
	private const NONCE_ACTION      = 'webino_dashboard_bale_campaign_create';

	public static function init(): void {
		add_action( CampaignRepository::HOOK_LAUNCH, array( __CLASS__, 'launch_campaign' ) );
		$embedded = defined( 'WEBINO_DASHBOARD_BOTS_EMBEDDED' ) && WEBINO_DASHBOARD_BOTS_EMBEDDED;
		if ( $embedded || ! is_admin() ) {
			return;
		}
		add_action( 'admin_post_' . self::ADMIN_POST_ACTION, array( __CLASS__, 'handle_create' ) );
	}

	public static function render(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'شما اجازه دسترسی ندارید.', 'webino-dashboard' ) );
		}
		if ( ! Plugin::has_feature( 'campaigns' ) ) {
			echo '<div class="wrap"><h1>' . esc_html__( 'کمپین‌ها', 'webino-dashboard' ) . '</h1><p>' . esc_html__( 'این قابلیت در طرح پایه غیرفعال است.', 'webino-dashboard' ) . '</p></div>';
			return;
		}

		$items = array_reverse( CampaignRepository::all() );
		?>
		<div class="wrap woobale-admin-wrap">
			<h1><?php esc_html_e( 'کمپین‌های پیام‌رسانی', 'webino-dashboard' ); ?></h1>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="max-width: 780px;">
				<?php wp_nonce_field( self::NONCE_ACTION ); ?>
				<input type="hidden" name="action" value="<?php echo esc_attr( self::ADMIN_POST_ACTION ); ?>" />
				<table class="form-table">
					<tr>
						<th><label for="woobale_campaign_name"><?php esc_html_e( 'نام کمپین', 'webino-dashboard' ); ?></label></th>
						<td><input type="text" class="regular-text" name="campaign_name" id="woobale_campaign_name" required /></td>
					</tr>
					<tr>
						<th><label for="woobale_campaign_schedule"><?php esc_html_e( 'زمان اجرا', 'webino-dashboard' ); ?></label></th>
						<td>
							<input type="datetime-local" name="campaign_schedule" id="woobale_campaign_schedule" required />
							<p class="description"><?php esc_html_e( 'با timezone وردپرس ذخیره می‌شود.', 'webino-dashboard' ); ?></p>
						</td>
					</tr>
					<tr>
						<th><label for="woobale_campaign_type"><?php esc_html_e( 'نوع پیام', 'webino-dashboard' ); ?></label></th>
						<td>
							<select name="campaign_type" id="woobale_campaign_type">
								<option value="text"><?php esc_html_e( 'متنی', 'webino-dashboard' ); ?></option>
								<option value="photo"><?php esc_html_e( 'عکس', 'webino-dashboard' ); ?></option>
								<option value="video"><?php esc_html_e( 'ویدیو', 'webino-dashboard' ); ?></option>
								<option value="voice"><?php esc_html_e( 'ویس', 'webino-dashboard' ); ?></option>
								<option value="document"><?php esc_html_e( 'فایل', 'webino-dashboard' ); ?></option>
							</select>
						</td>
					</tr>
					<tr>
						<th><label for="woobale_campaign_text"><?php esc_html_e( 'متن/کپشن', 'webino-dashboard' ); ?></label></th>
						<td><textarea name="campaign_text" id="woobale_campaign_text" class="large-text" rows="5"></textarea></td>
					</tr>
					<tr>
						<th><label for="woobale_campaign_media"><?php esc_html_e( 'رسانه', 'webino-dashboard' ); ?></label></th>
						<td><input type="text" class="large-text" name="campaign_media" id="woobale_campaign_media" /></td>
					</tr>
					<tr>
						<th><?php esc_html_e( 'مخاطب هدف', 'webino-dashboard' ); ?></th>
						<td>
							<label><input type="radio" name="campaign_audience" value="all" checked /> <?php esc_html_e( 'تمام کاربران متصل به بله', 'webino-dashboard' ); ?></label><br />
							<label><input type="radio" name="campaign_audience" value="imported" /> <?php esc_html_e( 'فقط مخاطبین واردشده از CSV', 'webino-dashboard' ); ?></label>
						</td>
					</tr>
				</table>
				<?php submit_button( __( 'ثبت کمپین', 'webino-dashboard' ) ); ?>
			</form>

			<h2 style="margin-top:24px;"><?php esc_html_e( 'لیست کمپین‌ها', 'webino-dashboard' ); ?></h2>
			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'نام', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'وضعیت', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'زمان اجرا', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'موفق', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'ناموفق', 'webino-dashboard' ); ?></th>
					</tr>
				</thead>
				<tbody>
				<?php if ( empty( $items ) ) : ?>
					<tr><td colspan="5"><?php esc_html_e( 'کمپینی ثبت نشده است.', 'webino-dashboard' ); ?></td></tr>
				<?php else : ?>
					<?php foreach ( $items as $item ) : ?>
						<tr>
							<td><?php echo esc_html( (string) $item['name'] ); ?></td>
							<td><?php echo esc_html( (string) $item['status'] ); ?></td>
							<td><?php echo esc_html( wp_date( 'Y-m-d H:i', (int) $item['scheduled_at'] ) ); ?></td>
							<td><?php echo esc_html( (string) (int) $item['sent'] ); ?></td>
							<td><?php echo esc_html( (string) (int) $item['failed'] ); ?></td>
						</tr>
					<?php endforeach; ?>
				<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	public static function handle_create(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'Forbidden', 'webino-dashboard' ) );
		}
		check_admin_referer( self::NONCE_ACTION );
		if ( ! Plugin::has_feature( 'campaigns' ) ) {
			wp_safe_redirect( admin_url( 'admin.php?page=woobale-campaigns' ) );
			exit;
		}

		$name = isset( $_POST['campaign_name'] ) ? sanitize_text_field( wp_unslash( $_POST['campaign_name'] ) ) : '';
		$type = isset( $_POST['campaign_type'] ) ? sanitize_key( wp_unslash( $_POST['campaign_type'] ) ) : 'text';
		$text = isset( $_POST['campaign_text'] ) ? wp_kses_post( wp_unslash( $_POST['campaign_text'] ) ) : '';
		$media = isset( $_POST['campaign_media'] ) ? sanitize_text_field( wp_unslash( $_POST['campaign_media'] ) ) : '';
		$audience = isset( $_POST['campaign_audience'] ) ? sanitize_key( wp_unslash( $_POST['campaign_audience'] ) ) : 'all';
		$schedule = isset( $_POST['campaign_schedule'] ) ? sanitize_text_field( wp_unslash( $_POST['campaign_schedule'] ) ) : '';
		$scheduled_at = strtotime( $schedule . ':00' );
		if ( ! $scheduled_at ) {
			$scheduled_at = time() + 60;
		}

		$payload = array(
			'type'    => $type,
			'text'    => $text,
			'caption' => $text,
			'media'   => $media,
		);
		$user_ids = $audience === 'imported'
			? \Webino_Dashboard_Bots_REST_Context::get_imported_user_ids( 'bale' )
			: array();
		$campaign_id = CampaignRepository::create( $name, $scheduled_at, $payload, $user_ids );

		if ( ! wp_next_scheduled( CampaignRepository::HOOK_LAUNCH, array( $campaign_id ) ) ) {
			wp_schedule_single_event( $scheduled_at, CampaignRepository::HOOK_LAUNCH, array( $campaign_id ) );
		}
		wp_safe_redirect( admin_url( 'admin.php?page=woobale-campaigns' ) );
		exit;
	}

	public static function launch_campaign( int $campaign_id ): void {
		$campaign = CampaignRepository::find( $campaign_id );
		if ( ! $campaign || empty( $campaign['payload'] ) || ! is_array( $campaign['payload'] ) ) {
			return;
		}
		CampaignRepository::mark_running( $campaign_id );
		$user_ids = isset( $campaign['user_ids'] ) && is_array( $campaign['user_ids'] ) ? $campaign['user_ids'] : array();
		$res      = BroadcastQueue::start(
			$campaign['payload'],
			array(
				'user_ids'    => $user_ids,
				'campaign_id' => $campaign_id,
			)
		);
		if ( empty( $res['ok'] ) ) {
			CampaignRepository::mark_finished( $campaign_id, 0, 0 );
		}
	}
}
