<?php
/**
 * Wholesale settings tab
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials/tabs
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$wholesale      = WFCP_Helper::get_settings( 'wholesale' );
$category_rules = $wholesale['category_rules'] ?? array();
$categories     = get_terms(
	array(
		'taxonomy'   => 'product_cat',
		'hide_empty' => false,
	)
);
$defaults = is_array( $wholesale['defaults'] ?? null ) ? $wholesale['defaults'] : array();

if ( ! class_exists( 'WFCP_Gateway_Manager' ) ) {
	require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-gateway-manager.php';
}
$gateways          = WFCP_Gateway_Manager::get_all_gateways();
$selected_gateways = WFCP_Gateway_Manager::normalize_gateway_ids( $wholesale['gateways'] ?? array() );
?>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'تنظیمات فروش عمده', 'webina-woo-core' ); ?></h2>
	<p class="description"><?php esc_html_e( 'عمده = خریدِ تبدیل‌شده × (۱ − درصد تخفیف). تخفیف: محصول، سپس دسته، سپس سراسری.', 'webina-woo-core' ); ?></p>

	<form class="wfcp-settings-form" data-section="wholesale">
		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'فعال‌سازی فروش عمده', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="enabled" value="1" <?php checked( $wholesale['enabled'] ?? false, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
		</div>

		<h3><?php esc_html_e( 'عادی — آستانه تعداد / وزن', 'webina-woo-core' ); ?></h3>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'فروش عمده با آستانه تعداد/وزن', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="threshold_enabled" value="1" <?php checked( ! empty( $wholesale['threshold_enabled'] ), true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
			<small><?php esc_html_e( 'برای مشتری عادی: اگر تعداد یا وزن خط به حداقل برسد همان خط عمده می‌شود و بج عمده می‌گیرد. کمتر از حداقل نقدی می‌ماند.', 'webina-woo-core' ); ?></small>
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label"><?php esc_html_e( 'حداقل تعداد پیش‌فرض', 'webina-woo-core' ); ?></label>
			<input type="number" name="defaults[min_qty]" class="wfcp-form-control wfcp-form-control-small" min="0" step="0.01" value="<?php echo esc_attr( $defaults['min_qty'] ?? 0 ); ?>">
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label"><?php esc_html_e( 'حداقل وزن پیش‌فرض', 'webina-woo-core' ); ?></label>
			<input type="number" name="defaults[min_weight]" class="wfcp-form-control wfcp-form-control-small" min="0" step="0.01" value="<?php echo esc_attr( $defaults['min_weight'] ?? 0 ); ?>">
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label"><?php esc_html_e( 'گام تعداد / وزن', 'webina-woo-core' ); ?></label>
			<input type="number" name="defaults[qty_step]" class="wfcp-form-control wfcp-form-control-small" min="0" step="0.01" value="<?php echo esc_attr( $defaults['qty_step'] ?? 0 ); ?>">
		</div>

		<h3><?php esc_html_e( 'پیشرفته — نقش همکار', 'webina-woo-core' ); ?></h3>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'فروش عمده با نقش همکار', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="partner_enabled" value="1" <?php checked( ! empty( $wholesale['partner_enabled'] ), true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
			<small><?php esc_html_e( 'همکار قیمت خرد و عمده و حداقل خرید را می‌بیند. سبد قفل عمده است و حداقل اجباری است. نقش را از کاربران به «همکار (عمده)» بدهید.', 'webina-woo-core' ); ?></small>
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="discount_percent">
				<?php esc_html_e( 'درصد تخفیف سراسری', 'webina-woo-core' ); ?></label>
			<small><?php esc_html_e( 'اگر محصول یا دسته درصد نداشته باشد استفاده می‌شود. تخفیف از قیمت خرید (پس از تبدیل ارز) کم می‌شود.', 'webina-woo-core' ); ?></small>
			<input
				type="number"
				name="discount_percent"
				id="discount_percent"
				class="wfcp-form-control wfcp-form-control-small"
				value="<?php echo esc_attr( $wholesale['discount_percent'] ?? 10 ); ?>"
				step="0.1"
				min="0"
			>
		</div>
		<div class="wfcp-form-group wfcp-category-rules">
			<label class="wfcp-form-label"><?php esc_html_e( 'تخفیف بر اساس دسته‌بندی', 'webina-woo-core' ); ?></label>
			<?php if ( ! is_wp_error( $categories ) && ! empty( $categories ) ) : ?>
				<?php foreach ( $categories as $category ) : ?>
					<?php
					$cat_pct = 0;
					if ( isset( $category_rules[ $category->term_id ] ) ) {
						$cat_pct = $category_rules[ $category->term_id ];
					} elseif ( isset( $category_rules[ (string) $category->term_id ] ) ) {
						$cat_pct = $category_rules[ (string) $category->term_id ];
					}
					?>
					<div class="wfcp-form-group" style="margin-bottom: 10px;">
						<label class="wfcp-form-label" style="display: inline-block; width: 200px;">
							<?php echo esc_html( $category->name ); ?>
						</label>
						<input
							type="number"
							name="category_rules[<?php echo esc_attr( $category->term_id ); ?>]"
							class="wfcp-form-control wfcp-form-control-small"
							style="display: inline-block;"
							value="<?php echo esc_attr( $cat_pct ); ?>"
							step="0.1"
							min="0"
							placeholder="<?php esc_attr_e( 'درصد تخفیف', 'webina-woo-core' ); ?>"
						>
					</div>
				<?php endforeach; ?>
			<?php else : ?>
				<p><?php esc_html_e( 'هیچ دسته‌بندی یافت نشد', 'webina-woo-core' ); ?></p>
			<?php endif; ?>
			<small><?php esc_html_e( 'درصد محصول در ویرایشگر محصول، روی دسته و سراسری اولویت دارد.', 'webina-woo-core' ); ?></small>
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label"><?php esc_html_e( 'حداقل تنوع سبد', 'webina-woo-core' ); ?></label>
			<input type="number" name="defaults[min_distinct_skus]" class="wfcp-form-control wfcp-form-control-small" min="0" step="1" value="<?php echo esc_attr( $defaults['min_distinct_skus'] ?? 0 ); ?>">
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'درگاه‌های پرداخت برای فروش عمده', 'webina-woo-core' ); ?>
			</label>
			<?php if ( ! empty( $gateways ) ) : ?>
				<ul class="wfcp-gateway-list">
					<?php foreach ( $gateways as $gateway_id => $gateway ) : ?>
						<li class="wfcp-gateway-item">
							<span class="wfcp-gateway-name"><?php echo esc_html( $gateway->get_title() ); ?></span>
							<label class="wfcp-toggle wfcp-gateway-toggle">
								<input
									type="checkbox"
									name="gateways[]"
									value="<?php echo esc_attr( $gateway_id ); ?>"
									<?php checked( in_array( $gateway_id, $selected_gateways ), true ); ?>
								>
								<span class="wfcp-toggle-slider"></span>
							</label>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php else : ?>
				<p><?php esc_html_e( 'هیچ درگاه پرداختی یافت نشد', 'webina-woo-core' ); ?></p>
			<?php endif; ?>
			<small><?php esc_html_e( 'درگاه‌های پرداختی که برای فروش عمده قابل استفاده هستند', 'webina-woo-core' ); ?></small>
		</div>

		<?php
		$shipping_options = array();
		if ( class_exists( 'Webino_Dashboard_Orders', false ) ) {
			$shipping_options = Webino_Dashboard_Orders::get_shipping_method_options();
		}
		$selected_shipping = WFCP_Gateway_Manager::normalize_gateway_ids( $wholesale['shipping_methods'] ?? array() );
		?>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'روش‌های ارسال برای فروش عمده', 'webina-woo-core' ); ?>
			</label>
			<?php if ( ! empty( $shipping_options ) ) : ?>
				<ul class="wfcp-gateway-list">
					<?php foreach ( $shipping_options as $ship ) : ?>
						<?php
						if ( ! is_array( $ship ) || empty( $ship['id'] ) || 'other' === $ship['id'] ) {
							continue;
						}
						?>
						<li class="wfcp-gateway-item">
							<span class="wfcp-gateway-name"><?php echo esc_html( $ship['title'] ); ?></span>
							<label class="wfcp-toggle wfcp-gateway-toggle">
								<input
									type="checkbox"
									name="shipping_methods[]"
									value="<?php echo esc_attr( $ship['id'] ); ?>"
									<?php checked( in_array( $ship['id'], $selected_shipping, true ), true ); ?>
								>
								<span class="wfcp-toggle-slider"></span>
							</label>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php else : ?>
				<p><?php esc_html_e( 'هیچ روش ارسالی یافت نشد', 'webina-woo-core' ); ?></p>
			<?php endif; ?>
			<small><?php esc_html_e( 'خالی = همه روش‌های ارسال. اگر حداقل یک خط سبد عمده باشد اعمال می‌شود.', 'webina-woo-core' ); ?></small>
		</div>

		<button type="submit" class="wfcp-btn wfcp-btn-primary">
			<?php esc_html_e( 'ذخیره تنظیمات', 'webina-woo-core' ); ?>
		</button>
	</form>
</div>
