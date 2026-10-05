<?php
/**
 * Installment settings tab
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials/tabs
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$installment = WFCP_Helper::get_settings( 'installment' );
$plans = $installment['plans'] ?? array();

// Use Gateway Manager for consistent gateway loading (all registered gateways)
if ( ! class_exists( 'WFCP_Gateway_Manager' ) ) {
	require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-gateway-manager.php';
}
$gateways = WFCP_Gateway_Manager::get_all_gateways();
$selected_gateways = WFCP_Gateway_Manager::normalize_gateway_ids( $installment['gateways'] ?? array() );
?>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'تنظیمات خرید اقساطی', 'webina-woo-core' ); ?></h2>
	
	<form class="wfcp-settings-form" data-section="installment">
		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'فعال‌سازی خرید اقساطی', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="enabled" value="1" <?php checked( $installment['enabled'] ?? false, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'فعال‌سازی رند کردن مبلغ هر قسط', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="round_enabled" value="1" <?php checked( $installment['round_enabled'] ?? true, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
			<small><?php esc_html_e( 'مبلغ ماهانه اقساط پس از محاسبه رند می‌شود', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="installment_round_to">
				<?php esc_html_e( 'رند کردن هر قسط به', 'webina-woo-core' ); ?>
			</label>
			<input
				type="number"
				name="round_to"
				id="installment_round_to"
				class="wfcp-form-control wfcp-form-control-small"
				value="<?php echo esc_attr( $installment['round_to'] ?? 1000 ); ?>"
				min="1"
			>
			<small><?php esc_html_e( 'مثلاً 1000 برای رند کردن به هزار', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="installment_pdp_theme">
				<?php esc_html_e( 'تم نمایش اقساط در صفحه محصول', 'webina-woo-core' ); ?>
			</label>
			<select name="pdp_theme" id="installment_pdp_theme" class="wfcp-form-control">
				<option value="classic" <?php selected( $installment['pdp_theme'] ?? 'classic', 'classic' ); ?>><?php esc_html_e( 'کلاسیک', 'webina-woo-core' ); ?></option>
				<option value="timeline" <?php selected( $installment['pdp_theme'] ?? 'classic', 'timeline' ); ?>><?php esc_html_e( 'تایم‌لاین (تاریخ اقساط)', 'webina-woo-core' ); ?></option>
			</select>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'فقط لوگوی درگاه (نام با هاور)', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="gateway_logos_only" value="1" <?php checked( $installment['gateway_logos_only'] ?? true, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
			<small><?php esc_html_e( 'متن نام درگاه مخفی می‌شود و فقط با هاور دیده می‌شود.', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label"><?php esc_html_e( 'پلن‌های اقساطی', 'webina-woo-core' ); ?></label>
			<div class="wfcp-installment-plans">
				<?php if ( ! empty( $plans ) ) : ?>
					<?php foreach ( $plans as $index => $plan ) : ?>
						<div class="wfcp-installment-plan">
							<div class="wfcp-installment-plan-header">
								<span class="wfcp-installment-plan-title">پلن <?php echo esc_html( $index + 1 ); ?></span>
								<button type="button" class="wfcp-btn wfcp-btn-danger wfcp-remove-plan"><?php esc_html_e( 'حذف', 'webina-woo-core' ); ?></button>
							</div>
							<div class="wfcp-form-group">
								<label class="wfcp-form-label"><?php esc_html_e( 'تعداد ماه', 'webina-woo-core' ); ?></label>
								<input 
									type="number" 
									name="plan_months" 
									class="wfcp-form-control wfcp-form-control-small wfcp-plan-months" 
									min="1" 
									value="<?php echo esc_attr( $plan['months'] ?? 3 ); ?>"
								>
							</div>
							<div class="wfcp-form-group">
								<label class="wfcp-form-label"><?php esc_html_e( 'درصد سود', 'webina-woo-core' ); ?></label>
								<input 
									type="number" 
									name="plan_interest" 
									class="wfcp-form-control wfcp-form-control-small wfcp-plan-interest" 
									min="0" 
									step="0.1" 
									value="<?php echo esc_attr( $plan['interest'] ?? 5 ); ?>"
								>
							</div>
						</div>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
			<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-add-plan">
				<?php esc_html_e( 'افزودن پلن جدید', 'webina-woo-core' ); ?>
			</button>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'درگاه‌های پرداخت برای خرید اقساطی', 'webina-woo-core' ); ?>
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
				<?php if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) : ?>
					<?php
					$pg = WC()->payment_gateways;
					$raw_count = ( $pg && property_exists( $pg, 'payment_gateways' ) && is_array( $pg->payment_gateways ) ) ? count( $pg->payment_gateways ) : 0;
					$via_get = ( $pg && method_exists( $pg, 'get_payment_gateways' ) ) ? count( $pg->get_payment_gateways() ) : 0;
					?>
					<p style="color:#666; font-size:12px;">Debug: exists=<?php echo $pg ? '1' : '0'; ?> | get_all=<?php echo count( $gateways ); ?> | raw=<?php echo $raw_count; ?> | get_payment=<?php echo $via_get; ?> | sel=<?php echo count( $selected_gateways ); ?></p>
				<?php endif; ?>
			<?php endif; ?>
			<small><?php esc_html_e( 'درگاه‌های پرداختی که برای خرید اقساطی قابل استفاده هستند', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="installment_title">
				<?php esc_html_e( 'عنوان خرید اقساطی', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="text" 
				name="texts[title]" 
				id="installment_title" 
				class="wfcp-form-control wfcp-form-control-medium" 
				value="<?php echo esc_attr( $installment['texts']['title'] ?? 'خرید اقساطی' ); ?>"
			>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="installment_button">
				<?php esc_html_e( 'متن دکمه', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="text" 
				name="texts[button_text]" 
				id="installment_button" 
				class="wfcp-form-control wfcp-form-control-medium" 
				value="<?php echo esc_attr( $installment['texts']['button_text'] ?? 'افزودن اقساطی' ); ?>"
			>
		</div>

		<button type="submit" class="wfcp-btn wfcp-btn-primary">
			<?php esc_html_e( 'ذخیره تنظیمات', 'webina-woo-core' ); ?>
		</button>
	</form>
</div>
