<?php
/**
 * Dashboard page.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

$platforms = WNC_Platform_Registry::all();
?>
<div class="wrap wnc-wrap">
	<h1><?php esc_html_e( 'داشبورد بازارگاه‌ها', 'webinaconnector' ); ?></h1>
	<div class="wnc-grid">
		<?php foreach ( $platforms as $id => $adapter ) : ?>
			<?php $settings = WNC_Settings::get_platform( $id ); ?>
			<div class="wnc-card">
				<h2><?php echo esc_html( $adapter->label() ); ?></h2>
				<p>
					<?php if ( ! empty( $settings['enabled'] ) ) : ?>
						<span class="wnc-badge wnc-badge-ok"><?php esc_html_e( 'فعال', 'webinaconnector' ); ?></span>
					<?php else : ?>
						<span class="wnc-badge"><?php esc_html_e( 'غیرفعال', 'webinaconnector' ); ?></span>
					<?php endif; ?>
					<?php if ( $adapter->is_live() ) : ?>
						<span class="wnc-badge wnc-badge-ok"><?php esc_html_e( 'API زنده', 'webinaconnector' ); ?></span>
					<?php else : ?>
						<span class="wnc-badge wnc-badge-warn"><?php esc_html_e( 'منتظر مستندات', 'webinaconnector' ); ?></span>
					<?php endif; ?>
				</p>
				<p>
					<button type="button" class="button button-primary wnc-test-connection" data-platform="<?php echo esc_attr( $id ); ?>">
						<?php esc_html_e( 'تست اتصال', 'webinaconnector' ); ?>
					</button>
					<button type="button" class="button wnc-pull-orders" data-platform="<?php echo esc_attr( $id ); ?>">
						<?php esc_html_e( 'کشیدن سفارش‌ها', 'webinaconnector' ); ?>
					</button>
				</p>
				<div class="wnc-ajax-msg" data-platform="<?php echo esc_attr( $id ); ?>"></div>
			</div>
		<?php endforeach; ?>
	</div>
	<p>
		<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=wnc-settings' ) ); ?>"><?php esc_html_e( 'تنظیمات اتصال', 'webinaconnector' ); ?></a>
		<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=wnc-mapping' ) ); ?>"><?php esc_html_e( 'نقشه محصولات', 'webinaconnector' ); ?></a>
	</p>
</div>
