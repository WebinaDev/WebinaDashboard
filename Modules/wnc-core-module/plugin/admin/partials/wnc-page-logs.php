<?php
/**
 * Logs & jobs page.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

$logs = WNC_Logger::recent( 50 );
$jobs = WNC_Jobs::recent( 30 );
?>
<div class="wrap wnc-wrap">
	<h1><?php esc_html_e( 'لاگ و صف کارها', 'webinaconnector' ); ?></h1>

	<div class="wnc-card">
		<h2><?php esc_html_e( 'صف جاب', 'webinaconnector' ); ?></h2>
		<table class="widefat striped">
			<thead>
				<tr>
					<th>ID</th>
					<th><?php esc_html_e( 'نوع', 'webinaconnector' ); ?></th>
					<th><?php esc_html_e( 'پلتفرم', 'webinaconnector' ); ?></th>
					<th><?php esc_html_e( 'وضعیت', 'webinaconnector' ); ?></th>
					<th><?php esc_html_e( 'خطا', 'webinaconnector' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php if ( empty( $jobs ) ) : ?>
					<tr><td colspan="5">—</td></tr>
				<?php else : ?>
					<?php foreach ( $jobs as $job ) : ?>
						<tr>
							<td><?php echo esc_html( $job['id'] ); ?></td>
							<td><?php echo esc_html( $job['job_type'] ); ?></td>
							<td><?php echo esc_html( $job['platform'] ); ?></td>
							<td><?php echo esc_html( $job['status'] ); ?></td>
							<td><?php echo esc_html( $job['last_error'] ); ?></td>
						</tr>
					<?php endforeach; ?>
				<?php endif; ?>
			</tbody>
		</table>
	</div>

	<div class="wnc-card">
		<h2><?php esc_html_e( 'لاگ‌ها', 'webinaconnector' ); ?></h2>
		<table class="widefat striped">
			<thead>
				<tr>
					<th><?php esc_html_e( 'زمان', 'webinaconnector' ); ?></th>
					<th><?php esc_html_e( 'سطح', 'webinaconnector' ); ?></th>
					<th><?php esc_html_e( 'پلتفرم', 'webinaconnector' ); ?></th>
					<th><?php esc_html_e( 'پیام', 'webinaconnector' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php if ( empty( $logs ) ) : ?>
					<tr><td colspan="4">—</td></tr>
				<?php else : ?>
					<?php foreach ( $logs as $log ) : ?>
						<tr>
							<td><?php echo esc_html( $log['created_at'] ); ?></td>
							<td><?php echo esc_html( $log['level'] ); ?></td>
							<td><?php echo esc_html( $log['platform'] ); ?></td>
							<td><?php echo esc_html( $log['message'] ); ?></td>
						</tr>
					<?php endforeach; ?>
				<?php endif; ?>
			</tbody>
		</table>
	</div>
</div>
