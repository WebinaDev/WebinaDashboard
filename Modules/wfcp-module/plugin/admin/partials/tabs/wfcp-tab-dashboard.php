<?php
/**
 * Dashboard tab - Shows status of all settings
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials/tabs
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$settings = WFCP_Helper::get_settings();
$general = $settings['general'] ?? array();
$retail = $settings['retail'] ?? array();
$credit = $settings['credit'] ?? array();
$installment = $settings['installment'] ?? array();
$wholesale = $settings['wholesale'] ?? array();

// Get statistics
$total_products = wp_count_posts( 'product' );
$products_with_price = 0;
$products_locked = 0;

$args = array(
	'post_type'      => 'product',
	'posts_per_page' => -1,
	'post_status'    => 'any',
	'fields'         => 'ids',
);

$product_ids = get_posts( $args );
foreach ( $product_ids as $product_id ) {
	if ( WFCP_Helper::get_product_purchase_price( $product_id ) ) {
		$products_with_price++;
	}
	if ( WFCP_Helper::is_product_price_locked( $product_id ) ) {
		$products_locked++;
	}
}

$is_enabled = WFCP_Helper::is_enabled();
$currency = function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : ( $general['currency'] ?? 'IRR' );
$exchange_rate = $general['exchange_rate'] ?? 0;
?>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'فعال‌سازی افزونه', 'webina-woo-core' ); ?></h2>
	
	<form class="wfcp-settings-form" data-section="general">
		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'وضعیت افزونه', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="enabled" value="1" <?php checked( $general['enabled'] ?? true, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
			<small><?php esc_html_e( 'با غیرفعال کردن این گزینه، تمام محاسبات قیمت متوقف می‌شود', 'webina-woo-core' ); ?></small>
		</div>

		<?php
		$default_purchase_type = isset( $general['default_purchase_type'] ) ? (string) $general['default_purchase_type'] : 'cash';
		if ( 'retail' === $default_purchase_type ) {
			$default_purchase_type = 'cash';
		}
		$credit_enabled_opt      = WFCP_Helper::to_bool( $credit['enabled'] ?? false );
		$installment_enabled_opt = WFCP_Helper::to_bool( $installment['enabled'] ?? false );
		if ( 'credit' === $default_purchase_type && ! $credit_enabled_opt ) {
			$default_purchase_type = 'cash';
		}
		if ( 'installment' === $default_purchase_type && ! $installment_enabled_opt ) {
			$default_purchase_type = 'cash';
		}
		?>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="wfcp-default-purchase-type">
				<?php esc_html_e( 'روش پرداخت پیش‌فرض سایت', 'webina-woo-core' ); ?>
			</label>
			<select id="wfcp-default-purchase-type" name="default_purchase_type" class="wfcp-form-select">
				<option value="cash" <?php selected( $default_purchase_type, 'cash' ); ?>><?php esc_html_e( 'نقدی', 'webina-woo-core' ); ?></option>
				<?php if ( $credit_enabled_opt ) : ?>
					<option value="credit" <?php selected( $default_purchase_type, 'credit' ); ?>><?php esc_html_e( 'اعتباری', 'webina-woo-core' ); ?></option>
				<?php endif; ?>
				<?php if ( $installment_enabled_opt ) : ?>
					<option value="installment" <?php selected( $default_purchase_type, 'installment' ); ?>><?php esc_html_e( 'اقساطی', 'webina-woo-core' ); ?></option>
				<?php endif; ?>
			</select>
			<small><?php esc_html_e( 'وقتی سبد خالی است و مشتری روشی انتخاب نکرده، این نوع روی آیتم‌های جدید اعمال می‌شود.', 'webina-woo-core' ); ?></small>
		</div>

		<button type="submit" class="wfcp-btn wfcp-btn-primary">
			<?php esc_html_e( 'ذخیره تنظیمات', 'webina-woo-core' ); ?>
		</button>
	</form>
</div>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'وضعیت افزونه', 'webina-woo-core' ); ?></h2>
	
	<div class="wfcp-dashboard-stats">
		<div class="wfcp-stat-card <?php echo $is_enabled ? 'success' : 'warning'; ?>">
			<div class="wfcp-stat-icon"><?php echo $is_enabled ? '✅' : '⚠️'; ?></div>
			<div class="wfcp-stat-label"><?php esc_html_e( 'وضعیت افزونه', 'webina-woo-core' ); ?></div>
			<div class="wfcp-stat-value"><?php echo $is_enabled ? esc_html__( 'فعال', 'webina-woo-core' ) : esc_html__( 'غیرفعال', 'webina-woo-core' ); ?></div>
		</div>

		<div class="wfcp-stat-card info">
			<div class="wfcp-stat-icon">📦</div>
			<div class="wfcp-stat-label"><?php esc_html_e( 'کل محصولات', 'webina-woo-core' ); ?></div>
			<div class="wfcp-stat-value"><?php echo esc_html( number_format_i18n( $total_products->publish ?? 0 ) ); ?></div>
		</div>

		<div class="wfcp-stat-card success">
			<div class="wfcp-stat-icon">💰</div>
			<div class="wfcp-stat-label"><?php esc_html_e( 'محصولات با قیمت خرید', 'webina-woo-core' ); ?></div>
			<div class="wfcp-stat-value"><?php echo esc_html( number_format_i18n( $products_with_price ) ); ?></div>
		</div>

		<div class="wfcp-stat-card warning">
			<div class="wfcp-stat-icon">🔒</div>
			<div class="wfcp-stat-label"><?php esc_html_e( 'محصولات قفل شده', 'webina-woo-core' ); ?></div>
			<div class="wfcp-stat-value"><?php echo esc_html( number_format_i18n( $products_locked ) ); ?></div>
		</div>
	</div>
</div>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'وضعیت ماژول‌ها', 'webina-woo-core' ); ?></h2>
	
	<ul class="wfcp-status-list">
		<li>
			<span class="wfcp-status-label"><?php esc_html_e( 'قیمت تکی (Retail)', 'webina-woo-core' ); ?></span>
			<span class="wfcp-status-badge active"><?php esc_html_e( 'همیشه فعال', 'webina-woo-core' ); ?></span>
		</li>
		<li>
			<span class="wfcp-status-label"><?php esc_html_e( 'خرید اعتباری', 'webina-woo-core' ); ?></span>
			<span class="wfcp-status-badge <?php echo ( $credit['enabled'] ?? false ) ? 'active' : 'inactive'; ?>">
				<?php echo ( $credit['enabled'] ?? false ) ? esc_html__( 'فعال', 'webina-woo-core' ) : esc_html__( 'غیرفعال', 'webina-woo-core' ); ?>
			</span>
		</li>
		<li>
			<span class="wfcp-status-label"><?php esc_html_e( 'خرید اقساطی', 'webina-woo-core' ); ?></span>
			<span class="wfcp-status-badge <?php echo ( $installment['enabled'] ?? false ) ? 'active' : 'inactive'; ?>">
				<?php echo ( $installment['enabled'] ?? false ) ? esc_html__( 'فعال', 'webina-woo-core' ) : esc_html__( 'غیرفعال', 'webina-woo-core' ); ?>
			</span>
		</li>
		<li>
			<span class="wfcp-status-label"><?php esc_html_e( 'فروش عمده', 'webina-woo-core' ); ?></span>
			<span class="wfcp-status-badge <?php echo ( $wholesale['enabled'] ?? false ) ? 'active' : 'inactive'; ?>">
				<?php echo ( $wholesale['enabled'] ?? false ) ? esc_html__( 'فعال', 'webina-woo-core' ) : esc_html__( 'غیرفعال', 'webina-woo-core' ); ?>
			</span>
		</li>
	</ul>
</div>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'تنظیمات فعلی', 'webina-woo-core' ); ?></h2>
	
	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
		<div>
			<strong style="display: block; margin-bottom: 10px; color: #475569; font-family: 'YekanBakh', 'Tahoma', sans-serif;"><?php esc_html_e( 'واحد پول', 'webina-woo-core' ); ?></strong>
			<p style="margin: 0; font-size: 16px; color: #1e293b; font-family: 'YekanBakh', 'Tahoma', sans-serif;">
				<?php
				$dash_symbol = function_exists( 'get_woocommerce_currency_symbol' ) ? wp_strip_all_tags( get_woocommerce_currency_symbol( $currency ) ) : WFCP_Helper::get_currency_symbol( $currency );
				echo esc_html( $dash_symbol . ' (' . $currency . ')' );
				?>
			</p>
		</div>
		
		<div>
			<strong style="display: block; margin-bottom: 10px; color: #475569; font-family: 'YekanBakh', 'Tahoma', sans-serif;"><?php esc_html_e( 'نرخ تبدیل ارز', 'webina-woo-core' ); ?></strong>
			<p style="margin: 0; font-size: 16px; color: #1e293b; font-family: 'YekanBakh', 'Tahoma', sans-serif;">
				<?php echo esc_html( number_format_i18n( $exchange_rate, 2 ) ); ?>
			</p>
		</div>
		
		<div>
			<strong style="display: block; margin-bottom: 10px; color: #475569; font-family: 'YekanBakh', 'Tahoma', sans-serif;"><?php esc_html_e( 'درصد سود تکی', 'webina-woo-core' ); ?></strong>
			<p style="margin: 0; font-size: 16px; color: #1e293b; font-family: 'YekanBakh', 'Tahoma', sans-serif;">
				<?php echo esc_html( number_format_i18n( $retail['profit_percent'] ?? 20, 1 ) ); ?>%
			</p>
		</div>
		
		<div>
			<strong style="display: block; margin-bottom: 10px; color: #475569; font-family: 'YekanBakh', 'Tahoma', sans-serif;"><?php esc_html_e( 'درصد افزایش اعتباری', 'webina-woo-core' ); ?></strong>
			<p style="margin: 0; font-size: 16px; color: #1e293b; font-family: 'YekanBakh', 'Tahoma', sans-serif;">
				<?php echo esc_html( number_format_i18n( $credit['increase_percent'] ?? 5, 1 ) ); ?>%
			</p>
		</div>
	</div>
</div>
