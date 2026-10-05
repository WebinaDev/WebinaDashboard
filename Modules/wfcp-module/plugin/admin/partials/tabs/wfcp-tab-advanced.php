<?php
/**
 * Advanced settings tab
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials/tabs
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}
?>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'تنظیمات پیشرفته', 'webina-woo-core' ); ?></h2>
	
	<div class="wfcp-form-group">
		<label class="wfcp-form-label"><?php esc_html_e( 'محاسبه مجدد قیمت‌ها', 'webina-woo-core' ); ?></label>
		<p><?php esc_html_e( 'با استفاده از این گزینه می‌توانید تمام قیمت‌های محصولات را بر اساس تنظیمات فعلی مجدداً محاسبه کنید.', 'webina-woo-core' ); ?></p>
		
		<div class="wfcp-checkbox" style="margin-bottom: 15px;">
			<input type="checkbox" id="wfcp-dry-run" value="1">
			<label for="wfcp-dry-run"><?php esc_html_e( 'حالت Dry Run (فقط لاگ، بدون ذخیره)', 'webina-woo-core' ); ?></label>
		</div>
		
		<button type="button" class="wfcp-btn wfcp-btn-primary wfcp-recalculate-all">
			<?php esc_html_e( 'محاسبه مجدد', 'webina-woo-core' ); ?>
		</button>
	</div>

	<div class="wfcp-form-group">
		<label class="wfcp-form-label"><?php esc_html_e( 'حذف کش', 'webina-woo-core' ); ?></label>
		<p><?php esc_html_e( 'تمام کش‌های محاسبات قیمت را حذف می‌کند.', 'webina-woo-core' ); ?></p>
		<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-delete-transients">
			<?php esc_html_e( 'حذف کش', 'webina-woo-core' ); ?>
		</button>
	</div>

	<div class="wfcp-form-group">
		<label class="wfcp-form-label"><?php esc_html_e( 'بکاپ و بازگردانی', 'webina-woo-core' ); ?></label>
		<p><?php esc_html_e( 'تنظیمات را به صورت JSON دانلود یا وارد کنید.', 'webina-woo-core' ); ?></p>
		<button type="button" class="wfcp-btn wfcp-btn-success wfcp-export-settings" style="margin-left: 10px;">
			<?php esc_html_e( 'دانلود بکاپ', 'webina-woo-core' ); ?>
		</button>
		<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-import-settings">
			<?php esc_html_e( 'وارد کردن بکاپ', 'webina-woo-core' ); ?>
		</button>
	</div>
</div>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'پیکربندی درگاه‌ها (اسم و عکس سفارشی)', 'webina-woo-core' ); ?></h2>
	<p><?php esc_html_e( 'برای بج‌های زیبا در صفحه محصول، نام و آیکون سفارشی برای درگاه‌ها تعریف کنید. روی «انتخاب از رسانه» کلیک کنید تا از کتابخانه رسانه وردپرس تصویر آپلود یا انتخاب کنید.', 'webina-woo-core' ); ?></p>
	<form class="wfcp-settings-form" data-section="gateways">
		<?php
		$gw_config = WFCP_Helper::get_settings( 'gateways_config' ) ?: array();
		
		// Use Gateway Manager for consistent gateway loading (all registered gateways)
		if ( ! class_exists( 'WFCP_Gateway_Manager' ) ) {
			require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-gateway-manager.php';
		}
		$all_gws = WFCP_Gateway_Manager::get_all_gateways();
		if ( ! empty( $all_gws ) ) {
			echo '<table class="wfcp-gateway-config-table" style="width:100%; margin-top:10px; border-collapse: collapse;"><thead><tr><th style="text-align:right; padding:8px;">درگاه</th><th style="text-align:right; padding:8px;">نام نمایشی</th><th style="text-align:right; padding:8px;">آیکون (آپلود از رسانه وردپرس)</th></tr></thead><tbody>';
			foreach ( $all_gws as $gid => $gw ) {
				$c = isset( $gw_config[ $gid ] ) ? $gw_config[ $gid ] : array();
				$icon_url = $c['icon'] ?? '';
				echo '<tr data-gateway-id="' . esc_attr( $gid ) . '">';
				echo '<td style="padding:8px; border-bottom:1px solid #eee;"><strong>' . esc_html( $gw->get_title() ) . '</strong><br><small>' . esc_html( $gid ) . '</small>';
				echo '<input type="hidden" name="config[' . esc_attr( $gid ) . '][id]" value="' . esc_attr( $gid ) . '" data-gateway-id="' . esc_attr( $gid ) . '" /></td>';
				echo '<td style="padding:8px; border-bottom:1px solid #eee;"><input type="text" name="config[' . esc_attr( $gid ) . '][name]" value="' . esc_attr( $c['name'] ?? '' ) . '" class="wfcp-form-control" placeholder="' . esc_attr( $gw->get_title() ) . '" style="width:100%;"></td>';
				echo '<td style="padding:8px; border-bottom:1px solid #eee;">';
				echo '<input type="text" class="wfcp-icon-url wfcp-form-control" name="config[' . esc_attr( $gid ) . '][icon]" value="' . esc_attr( $icon_url ) . '" placeholder="URL تصویر یا از رسانه انتخاب کنید" style="width:48%; vertical-align:middle;" /> ';
				echo '<button type="button" class="button wfcp-upload-icon-btn" data-gid="' . esc_attr( $gid ) . '">انتخاب از رسانه</button> ';
				echo '<button type="button" class="button wfcp-remove-icon-btn">حذف</button>';
				if ( $icon_url ) {
					echo ' <img class="wfcp-icon-preview" src="' . esc_url( $icon_url ) . '" style="max-height:32px; max-width:48px; vertical-align:middle; margin-left:6px; border:1px solid #ddd; border-radius:3px;" />';
				}
				echo '</td>';
				echo '</tr>';
			}
			echo '</tbody></table>';
		} else {
			echo '<p>هیچ درگاهی یافت نشد.</p>';
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				$pg = WC()->payment_gateways;
				$raw_count = ( $pg && property_exists( $pg, 'payment_gateways' ) && is_array( $pg->payment_gateways ) ) ? count( $pg->payment_gateways ) : 0;
				$via_get = ( $pg && method_exists( $pg, 'get_payment_gateways' ) ) ? count( $pg->get_payment_gateways() ) : 0;
				echo '<p style="color:#666; font-size:12px;">Debug: WC()->payment_gateways = ' . ( $pg ? 'exists' : 'null' ) . ' | get_all: ' . count( $all_gws ) . ' | raw: ' . $raw_count . ' | get_payment: ' . $via_get . '</p>';
			}
		}
		?>
		<button type="submit" class="wfcp-btn wfcp-btn-primary" style="margin-top:12px;">ذخیره پیکربندی درگاه‌ها</button>
	</form>
</div>

