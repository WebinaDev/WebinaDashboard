<?php
/**
 * Orders page.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

$orders = WNC_Order_Sync::list_maps( 50 );
$labels = WNC_Platform_Registry::labels();
?>
<div class="wrap wnc-wrap">
	<h1><?php esc_html_e( 'سفارش‌های بازارگاه', 'webinaconnector' ); ?></h1>
	<p>
		<button type="button" class="button button-primary wnc-pull-orders" data-platform=""><?php esc_html_e( 'کشیدن همه سفارش‌ها', 'webinaconnector' ); ?></button>
		<?php foreach ( WNC_Platform_Registry::all() as $id => $adapter ) : ?>
			<button type="button" class="button wnc-pull-orders" data-platform="<?php echo esc_attr( $id ); ?>">
				<?php echo esc_html( $adapter->label() ); ?>
			</button>
		<?php endforeach; ?>
	</p>
	<div class="wnc-ajax-msg"></div>
	<table class="widefat striped">
		<thead>
			<tr>
				<th><?php esc_html_e( 'سفارش WC', 'webinaconnector' ); ?></th>
				<th><?php esc_html_e( 'پلتفرم', 'webinaconnector' ); ?></th>
				<th><?php esc_html_e( 'شناسه ریموت', 'webinaconnector' ); ?></th>
				<th><?php esc_html_e( 'وضعیت', 'webinaconnector' ); ?></th>
				<th><?php esc_html_e( 'آخرین سینک', 'webinaconnector' ); ?></th>
			</tr>
		</thead>
		<tbody>
			<?php if ( empty( $orders ) ) : ?>
				<tr><td colspan="5"><?php esc_html_e( 'سفارشی وارد نشده است.', 'webinaconnector' ); ?></td></tr>
			<?php else : ?>
				<?php foreach ( $orders as $row ) : ?>
					<tr>
						<td>
							<a href="<?php
							$edit_url = admin_url( 'post.php?post=' . (int) $row['wc_order_id'] . '&action=edit' );
							if ( class_exists( '\Automattic\WooCommerce\Utilities\OrderUtil' ) ) {
								$edit_url = \Automattic\WooCommerce\Utilities\OrderUtil::get_order_admin_edit_url( (int) $row['wc_order_id'] );
							}
							echo esc_url( $edit_url );
							?>">
								#<?php echo esc_html( (int) $row['wc_order_id'] ); ?>
							</a>
						</td>
						<td><?php echo esc_html( $labels[ $row['platform'] ] ?? $row['platform'] ); ?></td>
						<td><?php echo esc_html( $row['remote_order_id'] ); ?></td>
						<td><?php echo esc_html( $row['status'] ); ?></td>
						<td><?php echo esc_html( $row['last_sync_at'] ); ?></td>
					</tr>
				<?php endforeach; ?>
			<?php endif; ?>
		</tbody>
	</table>
</div>
