<?php
/**
 * Exchange rate settings tab
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials/tabs
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$general = WFCP_Helper::get_settings( 'general' );
$exchange_rate_enabled = isset( $general['exchange_rate_enabled'] ) ? (bool) $general['exchange_rate_enabled'] : true;
$api_enabled = $general['api_enabled'] ?? false;
$auto_update_enabled = $general['auto_update_enabled'] ?? false;
$last_api_update = $general['last_api_update'] ?? '';
$current_exchange_rate = $general['exchange_rate'] ?? 42000;
$api_symbol = $general['api_symbol'] ?? 'USD';
$currency_names = array(
	'USD' => 'دلار آمریکا',
	'EUR' => 'یورو',
	'GBP' => 'پوند',
	'AED' => 'درهم امارات',
	'TRY' => 'لیر ترکیه',
);
$currency_name = $currency_names[ $api_symbol ] ?? 'دلار آمریکا';
?>

<div class="wfcp-card wfcp-exchange-rate-card">
	<div class="wfcp-exchange-rate-content">
		<div class="wfcp-exchange-rate-info">
			<h3 class="wfcp-exchange-rate-title">
				<?php esc_html_e( 'نرخ ارز امروز', 'webina-woo-core' ); ?>
			</h3>
			<p class="wfcp-exchange-rate-currency">
				<?php echo esc_html( $currency_name ); ?> (<?php echo esc_html( $api_symbol ); ?>)
			</p>
		</div>
		<div class="wfcp-exchange-rate-value">
			<p class="wfcp-exchange-rate-number">
				<?php echo esc_html( number_format_i18n( $current_exchange_rate, 0 ) ); ?>
			</p>
			<p class="wfcp-exchange-rate-unit">
				<?php esc_html_e( 'تومان', 'webina-woo-core' ); ?>
			</p>
		</div>
		<?php if ( $last_api_update ) : ?>
		<div class="wfcp-exchange-rate-update">
			<p class="wfcp-exchange-rate-update-label">
				<strong><?php esc_html_e( 'آخرین به‌روزرسانی:', 'webina-woo-core' ); ?></strong>
			</p>
			<p class="wfcp-exchange-rate-update-time">
				<?php echo esc_html( $last_api_update ); ?>
			</p>
		</div>
		<?php else : ?>
		<div class="wfcp-exchange-rate-update">
			<p class="wfcp-exchange-rate-update-label" style="opacity: 0.7;">
				<?php esc_html_e( 'هنوز به‌روزرسانی نشده است', 'webina-woo-core' ); ?>
			</p>
		</div>
		<?php endif; ?>
		<div class="wfcp-exchange-rate-actions">
			<button type="button" id="wfcp-update-now-card" class="wfcp-btn wfcp-btn-success" style="white-space: nowrap;">
				<span class="dashicons dashicons-update" style="margin-left: 5px; vertical-align: middle;"></span>
				<?php esc_html_e( 'دریافت الان', 'webina-woo-core' ); ?>
			</button>
		</div>
	</div>
</div>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'تنظیمات نرخ تبدیل ارز', 'webina-woo-core' ); ?></h2>
	
	<form class="wfcp-settings-form" data-section="exchange">
		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'اعمال نرخ تبدیل ارز', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="exchange_rate_enabled" value="1" <?php checked( $exchange_rate_enabled, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
			<small><?php esc_html_e( 'با خاموش کردن این گزینه، نرخ تبدیل ارز اعمال نمی‌شود و قیمت خرید بدون تبدیل استفاده می‌شود.', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="purchase_currency">
				<?php esc_html_e( 'واحد پول قیمت خرید', 'webina-woo-core' ); ?>
			</label>
			<select name="purchase_currency" id="purchase_currency" class="wfcp-form-control wfcp-form-control-medium">
				<option value="base" <?php selected( $general['purchase_currency'] ?? 'base', 'base' ); ?>>
					<?php esc_html_e( 'ارز پایه (مثلاً دلار)', 'webina-woo-core' ); ?>
				</option>
				<option value="display" <?php selected( $general['purchase_currency'] ?? 'base', 'display' ); ?>>
					<?php esc_html_e( 'واحد پول نمایشی (مثلاً تومان)', 'webina-woo-core' ); ?>
				</option>
			</select>
			<small><?php esc_html_e( 'واحد پولی که قیمت خرید محصولات به آن وارد می‌شود. اگر "ارز پایه" انتخاب شود، نرخ تبدیل اعمال می‌شود. اگر "واحد پول نمایشی" انتخاب شود، نرخ تبدیل اعمال نمی‌شود.', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="api_key">
				<?php esc_html_e( 'API Key', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="text" 
				name="api_key" 
				id="api_key" 
				class="wfcp-form-control wfcp-form-control-medium" 
				value="<?php echo esc_attr( $general['api_key'] ?? '' ); ?>"
				placeholder="<?php esc_attr_e( 'API Key خود را وارد کنید', 'webina-woo-core' ); ?>"
			>
			<small>
				<?php esc_html_e( 'API Key را از', 'webina-woo-core' ); ?>
				<a href="https://BrsApi.ir" target="_blank" rel="noopener">BrsApi.ir</a>
				<?php esc_html_e( 'دریافت کنید', 'webina-woo-core' ); ?>
			</small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="api_symbol">
				<?php esc_html_e( 'نوع ارز', 'webina-woo-core' ); ?>
			</label>
			<select name="api_symbol" id="api_symbol" class="wfcp-form-control wfcp-form-control-medium">
				<option value="USD" <?php selected( $general['api_symbol'] ?? 'USD', 'USD' ); ?>>دلار آمریکا (USD)</option>
				<option value="EUR" <?php selected( $general['api_symbol'] ?? 'USD', 'EUR' ); ?>>یورو (EUR)</option>
				<option value="GBP" <?php selected( $general['api_symbol'] ?? 'USD', 'GBP' ); ?>>پوند (GBP)</option>
				<option value="AED" <?php selected( $general['api_symbol'] ?? 'USD', 'AED' ); ?>>درهم امارات (AED)</option>
				<option value="TRY" <?php selected( $general['api_symbol'] ?? 'USD', 'TRY' ); ?>>لیر ترکیه (TRY)</option>
			</select>
			<small><?php esc_html_e( 'نوع ارزی که می‌خواهید نرخ آن از API دریافت شود', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'فعال‌سازی دریافت خودکار از API', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="api_enabled" value="1" <?php checked( $api_enabled, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
			<small><?php esc_html_e( 'با فعال کردن این گزینه، نرخ ارز از API دریافت می‌شود. در غیر این صورت از قیمت دستی استفاده می‌شود.', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<button type="button" id="wfcp-test-api" class="wfcp-btn wfcp-btn-secondary">
				<?php esc_html_e( 'تست اتصال به API', 'webina-woo-core' ); ?>
			</button>
			<small style="display: block; margin-top: 10px; color: #64748b;">
				<?php esc_html_e( 'برای تست اتصال به API، ابتدا API Key و نوع ارز را وارد کنید و سپس این دکمه را کلیک کنید.', 'webina-woo-core' ); ?>
			</small>
		</div>

		<?php if ( $api_enabled ) : ?>
			<div class="wfcp-form-group">
				<label class="wfcp-form-label">
					<?php esc_html_e( 'به‌روزرسانی خودکار', 'webina-woo-core' ); ?>
				</label>
				<label class="wfcp-toggle">
					<input type="checkbox" name="auto_update_enabled" value="1" <?php checked( $auto_update_enabled, true ); ?>>
					<span class="wfcp-toggle-slider"></span>
				</label>
				<small><?php esc_html_e( 'با فعال کردن این گزینه، نرخ ارز به صورت خودکار در ساعت مشخص شده به‌روزرسانی می‌شود', 'webina-woo-core' ); ?></small>
			</div>

			<div class="wfcp-form-group">
				<label class="wfcp-form-label" for="auto_update_hour">
					<?php esc_html_e( 'ساعت به‌روزرسانی', 'webina-woo-core' ); ?>
				</label>
				<select name="auto_update_hour" id="auto_update_hour" class="wfcp-form-control wfcp-form-control-small">
					<?php for ( $i = 0; $i < 24; $i++ ) : ?>
						<option value="<?php echo esc_attr( $i ); ?>" <?php selected( $general['auto_update_hour'] ?? 0, $i ); ?>>
							<?php echo esc_html( sprintf( '%02d:00', $i ) ); ?>
						</option>
					<?php endfor; ?>
				</select>
				<small><?php esc_html_e( 'ساعتی که نرخ ارز به صورت خودکار به‌روزرسانی می‌شود (به وقت محلی)', 'webina-woo-core' ); ?></small>
			</div>
		<?php endif; ?>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="exchange_rate">
				<?php esc_html_e( 'نرخ تبدیل ارز (دستی)', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="number" 
				name="exchange_rate" 
				id="exchange_rate" 
				class="wfcp-form-control wfcp-form-control-medium" 
				value="<?php echo esc_attr( $general['exchange_rate'] ?? 42000 ); ?>"
				step="0.01"
				min="0"
				placeholder="42000"
				<?php echo $api_enabled ? 'readonly' : ''; ?>
			>
			<small>
				<?php if ( $api_enabled ) : ?>
					<?php esc_html_e( 'این فیلد فقط خواندنی است. نرخ ارز از API دریافت می‌شود.', 'webina-woo-core' ); ?>
				<?php else : ?>
					<?php esc_html_e( 'نرخ تبدیل ارز پایه (مثلاً دلار) به واحد پول نمایشی. این نرخ فقط زمانی اعمال می‌شود که "واحد پول قیمت خرید" روی "ارز پایه" تنظیم شده باشد.', 'webina-woo-core' ); ?>
				<?php endif; ?>
			</small>
		</div>

		<div class="wfcp-form-group">
			<button type="button" id="wfcp-update-all-prices" class="wfcp-btn wfcp-btn-primary wfcp-sync-all-wc-prices">
				<?php esc_html_e( 'به‌روزرسانی قیمت تمام محصولات', 'webina-woo-core' ); ?>
			</button>
			<small style="display: block; margin-top: 10px; color: #f59e0b;">
				<?php esc_html_e( '⚠️ توجه: این عملیات ممکن است زمان‌بر باشد. پس از به‌روزرسانی نرخ ارز، برای اعمال تغییرات در تمام محصولات از این دکمه استفاده کنید.', 'webina-woo-core' ); ?>
			</small>
		</div>

		<button type="submit" class="wfcp-btn wfcp-btn-primary">
			<?php esc_html_e( 'ذخیره تنظیمات', 'webina-woo-core' ); ?>
		</button>
	</form>
</div>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'راهنمای استفاده', 'webina-woo-core' ); ?></h2>
	<p style="color: #64748b; line-height: 1.8; font-family: 'YekanBakh', 'Tahoma', sans-serif;">
		<?php esc_html_e( 'نرخ تبدیل ارز برای تبدیل قیمت خرید (که معمولاً به دلار یا ارز پایه است) به واحد پول نمایشی استفاده می‌شود. می‌توانید نرخ ارز را به صورت دستی وارد کنید یا از API دریافت کنید.', 'webina-woo-core' ); ?>
	</p>
	<p style="color: #64748b; line-height: 1.8; font-family: 'YekanBakh', 'Tahoma', sans-serif; margin-top: 15px;">
		<strong><?php esc_html_e( 'استفاده از API:', 'webina-woo-core' ); ?></strong>
		<?php esc_html_e( 'برای دریافت API Key رایگان به', 'webina-woo-core' ); ?>
		<a href="https://BrsApi.ir" target="_blank" rel="noopener">BrsApi.ir</a>
		<?php esc_html_e( 'مراجعه کنید. با فعال کردن به‌روزرسانی خودکار، نرخ ارز در ساعت مشخص شده به صورت خودکار به‌روزرسانی می‌شود.', 'webina-woo-core' ); ?>
	</p>
</div>
