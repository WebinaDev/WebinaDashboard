<?php
/**
 * Mapping page.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

global $wpdb;
$table = WNC_Storage::product_map_table();
$maps  = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT 100", ARRAY_A );
$labels = WNC_Platform_Registry::labels();
?>
<div class="wrap wnc-wrap">
	<h1><?php esc_html_e( 'نقشه محصولات', 'webinaconnector' ); ?></h1>

	<div class="wnc-card">
		<h2><?php esc_html_e( 'اتصال سریع', 'webinaconnector' ); ?></h2>
		<form class="wnc-map-form">
			<p>
				<label><?php esc_html_e( 'شناسه محصول ووکامرس', 'webinaconnector' ); ?></label>
				<input type="number" name="wc_product_id" required min="1" />
			</p>
			<p>
				<label><?php esc_html_e( 'شناسه تنوع (اختیاری)', 'webinaconnector' ); ?></label>
				<input type="number" name="wc_variation_id" min="0" value="0" />
			</p>
			<p>
				<label><?php esc_html_e( 'پلتفرم', 'webinaconnector' ); ?></label>
				<select name="platform">
					<?php foreach ( $labels as $id => $label ) : ?>
						<option value="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $label ); ?></option>
					<?php endforeach; ?>
				</select>
			</p>
			<p>
				<label><?php esc_html_e( 'شناسه محصول ریموت', 'webinaconnector' ); ?></label>
				<input type="text" name="remote_product_id" />
			</p>
			<p>
				<label><?php esc_html_e( 'شناسه تنوع ریموت', 'webinaconnector' ); ?></label>
				<input type="text" name="remote_variant_id" />
			</p>
			<p>
				<label><?php esc_html_e( 'جستجو در کاتالوگ ریموت', 'webinaconnector' ); ?></label>
				<input type="text" class="wnc-remote-keyword" />
				<button type="button" class="button wnc-search-remote"><?php esc_html_e( 'جستجو', 'webinaconnector' ); ?></button>
			</p>
			<div class="wnc-remote-results"></div>
			<p>
				<button type="submit" class="button button-primary"><?php esc_html_e( 'ذخیره نقشه', 'webinaconnector' ); ?></button>
			</p>
			<div class="wnc-ajax-msg"></div>
		</form>
	</div>

	<div class="wnc-card">
		<h2><?php esc_html_e( 'نقشه‌های موجود', 'webinaconnector' ); ?></h2>
		<table class="widefat striped">
			<thead>
				<tr>
					<th><?php esc_html_e( 'WC', 'webinaconnector' ); ?></th>
					<th><?php esc_html_e( 'پلتفرم', 'webinaconnector' ); ?></th>
					<th><?php esc_html_e( 'ریموت', 'webinaconnector' ); ?></th>
					<th><?php esc_html_e( 'سینک', 'webinaconnector' ); ?></th>
					<th><?php esc_html_e( 'عملیات', 'webinaconnector' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php if ( empty( $maps ) ) : ?>
					<tr><td colspan="5"><?php esc_html_e( 'نقشه‌ای ثبت نشده است.', 'webinaconnector' ); ?></td></tr>
				<?php else : ?>
					<?php foreach ( $maps as $map ) : ?>
						<tr>
							<td>
								<?php echo esc_html( (int) $map['wc_product_id'] ); ?>
								<?php if ( ! empty( $map['wc_variation_id'] ) ) : ?>
									/ <?php echo esc_html( (int) $map['wc_variation_id'] ); ?>
								<?php endif; ?>
							</td>
							<td><?php echo esc_html( $labels[ $map['platform'] ] ?? $map['platform'] ); ?></td>
							<td><?php echo esc_html( $map['remote_product_id'] . ( $map['remote_variant_id'] ? ' / ' . $map['remote_variant_id'] : '' ) ); ?></td>
							<td><?php echo ! empty( $map['sync_enabled'] ) ? '✓' : '—'; ?></td>
							<td>
								<button type="button" class="button wnc-sync-now"
									data-platform="<?php echo esc_attr( $map['platform'] ); ?>"
									data-wc-product="<?php echo esc_attr( $map['wc_product_id'] ); ?>"
									data-wc-variation="<?php echo esc_attr( $map['wc_variation_id'] ); ?>">
									<?php esc_html_e( 'سینک', 'webinaconnector' ); ?>
								</button>
								<button type="button" class="button wnc-delete-map"
									data-platform="<?php echo esc_attr( $map['platform'] ); ?>"
									data-wc-product="<?php echo esc_attr( $map['wc_product_id'] ); ?>"
									data-wc-variation="<?php echo esc_attr( $map['wc_variation_id'] ); ?>">
									<?php esc_html_e( 'حذف', 'webinaconnector' ); ?>
								</button>
							</td>
						</tr>
					<?php endforeach; ?>
				<?php endif; ?>
			</tbody>
		</table>
	</div>
</div>
