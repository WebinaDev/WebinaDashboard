<?php

namespace Webino_Dashboard_Bots_Telegram\Admin;

/**
 * WooBale dashboard (stats + recent lists).
 */
class DashboardPage {

	public static function render(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'شما اجازه دسترسی ندارید.', 'webino-dashboard' ) );
		}

		$users_n   = StatsService::count_linked_users();
		$orders_n  = StatsService::count_bale_orders_all();
		$orders_7d = StatsService::count_bale_orders_since( 7 );
		$sessions  = StatsService::count_sessions_active_hours( 24 );
		$sales_cmp = StatsService::bale_sales_compare_periods( 30 );
		$recent_o  = StatsService::recent_bale_orders( 8 );
		$recent_u  = StatsService::recent_bale_users( 8 );
		?>
		<div class="wrap woobale-admin-wrap">
			<h1 class="woobale-admin-title"><?php esc_html_e( 'WooBale — داشبورد', 'webino-dashboard' ); ?></h1>
			<p class="woobale-admin-lead"><?php esc_html_e( 'آمار اتصال فروشگاه به پیام‌رسان بله', 'webino-dashboard' ); ?></p>

			<div class="woobale-stat-grid">
				<div class="woobale-stat-card">
					<span class="woobale-stat-value"><?php echo esc_html( (string) $users_n ); ?></span>
					<span class="woobale-stat-label"><?php esc_html_e( 'کاربران متصل به بازو', 'webino-dashboard' ); ?></span>
				</div>
				<div class="woobale-stat-card">
					<span class="woobale-stat-value"><?php echo esc_html( (string) $orders_n ); ?></span>
					<span class="woobale-stat-label"><?php esc_html_e( 'کل سفارش‌های ثبت‌شده از بازو', 'webino-dashboard' ); ?></span>
				</div>
				<div class="woobale-stat-card">
					<span class="woobale-stat-value"><?php echo esc_html( (string) $orders_7d ); ?></span>
					<span class="woobale-stat-label"><?php esc_html_e( 'سفارش بازو در ۷ روز اخیر', 'webino-dashboard' ); ?></span>
				</div>
				<div class="woobale-stat-card">
					<span class="woobale-stat-value"><?php echo esc_html( (string) $sessions ); ?></span>
					<span class="woobale-stat-label"><?php esc_html_e( 'سشن‌های فعال ۲۴ ساعت اخیر', 'webino-dashboard' ); ?></span>
				</div>
			</div>

			<div class="woobale-stat-grid" style="margin-top:12px;">
				<div class="woobale-stat-card">
					<span class="woobale-stat-value"><?php echo esc_html( (string) $sales_cmp['current']['count'] ); ?></span>
					<span class="woobale-stat-label"><?php esc_html_e( 'سفارش بازو — ۳۰ روز اخیر', 'webino-dashboard' ); ?></span>
				</div>
				<div class="woobale-stat-card">
					<span class="woobale-stat-value"><?php echo wp_kses_post( wc_price( $sales_cmp['current']['total'] ) ); ?></span>
					<span class="woobale-stat-label"><?php esc_html_e( 'جمع مبلغ (۳۰ روز اخیر)', 'webino-dashboard' ); ?></span>
				</div>
				<div class="woobale-stat-card">
					<span class="woobale-stat-value"><?php echo esc_html( (string) $sales_cmp['previous']['count'] ); ?></span>
					<span class="woobale-stat-label"><?php esc_html_e( 'سفارش بازو — ۳۰ روز قبل (دورهٔ قبلی)', 'webino-dashboard' ); ?></span>
				</div>
				<div class="woobale-stat-card">
					<span class="woobale-stat-value"><?php echo wp_kses_post( wc_price( $sales_cmp['previous']['total'] ) ); ?></span>
					<span class="woobale-stat-label"><?php esc_html_e( 'جمع مبلغ (دورهٔ قبلی)', 'webino-dashboard' ); ?></span>
				</div>
			</div>

			<div class="woobale-admin-columns">
				<div class="postbox woobale-postbox">
					<h2 class="hndle"><?php esc_html_e( 'آخرین سفارش‌های بازو', 'webino-dashboard' ); ?></h2>
					<div class="inside">
						<table class="widefat striped">
							<thead>
								<tr>
									<th><?php esc_html_e( 'سفارش', 'webino-dashboard' ); ?></th>
									<th><?php esc_html_e( 'مبلغ', 'webino-dashboard' ); ?></th>
									<th><?php esc_html_e( 'وضعیت', 'webino-dashboard' ); ?></th>
									<th><?php esc_html_e( 'تاریخ', 'webino-dashboard' ); ?></th>
								</tr>
							</thead>
							<tbody>
								<?php if ( empty( $recent_o ) ) : ?>
									<tr><td colspan="4"><?php esc_html_e( 'موردی نیست.', 'webino-dashboard' ); ?></td></tr>
								<?php else : ?>
									<?php foreach ( $recent_o as $order ) : ?>
										<?php if ( ! $order instanceof \WC_Order ) { continue; } ?>
										<tr>
											<td>
												<a href="<?php echo esc_url( $order->get_edit_order_url() ); ?>">
													#<?php echo esc_html( $order->get_order_number() ); ?>
												</a>
											</td>
											<td><?php echo wp_kses_post( $order->get_formatted_order_total() ); ?></td>
											<td><?php echo esc_html( wc_get_order_status_name( $order->get_status() ) ); ?></td>
											<td><?php echo esc_html( $order->get_date_created() ? $order->get_date_created()->date_i18n( get_option( 'date_format' ) ) : '' ); ?></td>
										</tr>
									<?php endforeach; ?>
								<?php endif; ?>
							</tbody>
						</table>
					</div>
				</div>
				<div class="postbox woobale-postbox">
					<h2 class="hndle"><?php esc_html_e( 'آخرین کاربران متصل به بازو', 'webino-dashboard' ); ?></h2>
					<div class="inside">
						<table class="widefat striped">
							<thead>
								<tr>
									<th><?php esc_html_e( 'کاربر', 'webino-dashboard' ); ?></th>
									<th><?php esc_html_e( 'موبایل', 'webino-dashboard' ); ?></th>
									<th><?php esc_html_e( 'chat_id', 'webino-dashboard' ); ?></th>
								</tr>
							</thead>
							<tbody>
								<?php if ( empty( $recent_u ) ) : ?>
									<tr><td colspan="3"><?php esc_html_e( 'موردی نیست.', 'webino-dashboard' ); ?></td></tr>
								<?php else : ?>
									<?php foreach ( $recent_u as $u ) : ?>
										<tr>
											<td>
												<a href="<?php echo esc_url( get_edit_user_link( $u->ID ) ); ?>">
													<?php echo esc_html( $u->display_name ); ?>
												</a>
											</td>
											<td><?php echo esc_html( (string) get_user_meta( $u->ID, 'billing_phone', true ) ); ?></td>
											<td><code><?php echo esc_html( (string) get_user_meta( $u->ID, 'webino_dashboard_telegram_chat_id', true ) ); ?></code></td>
										</tr>
									<?php endforeach; ?>
								<?php endif; ?>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
		<?php
	}
}
