<?php
/**
 * Retail settings tab
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials/tabs
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$retail = WFCP_Helper::get_settings( 'retail' );

// Use Gateway Manager for consistent gateway loading (all registered gateways)
if ( ! class_exists( 'WFCP_Gateway_Manager' ) ) {
	require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-gateway-manager.php';
}
$gateways = WFCP_Gateway_Manager::get_all_gateways();
$selected_gateways = WFCP_Gateway_Manager::normalize_gateway_ids( $retail['gateways'] ?? array() );
?>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'تنظیمات قیمت تکی', 'webina-woo-core' ); ?></h2>
	
	<form class="wfcp-settings-form" data-section="retail">
		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="profit_percent">
				<?php esc_html_e( 'درصد سود', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="number" 
				name="profit_percent" 
				id="profit_percent" 
				class="wfcp-form-control wfcp-form-control-small" 
				value="<?php echo esc_attr( $retail['profit_percent'] ?? 20 ); ?>"
				step="0.1"
				min="0"
			>
			<small><?php esc_html_e( 'درصد سود که به قیمت خرید اضافه می‌شود', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'فعال‌سازی رند کردن قیمت', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="round_enabled" value="1" <?php checked( $retail['round_enabled'] ?? true, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="round_to">
				<?php esc_html_e( 'رند کردن به', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="number" 
				name="round_to" 
				id="round_to" 
				class="wfcp-form-control wfcp-form-control-small" 
				value="<?php echo esc_attr( $retail['round_to'] ?? 1000 ); ?>"
				min="1"
			>
			<small><?php esc_html_e( 'مثلاً 1000 برای رند کردن به هزار', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'درگاه‌های پرداخت برای خرید نقدی', 'webina-woo-core' ); ?>
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
					<p style="color:#d32f2f; font-size:12px; font-family:monospace;">
						Debug: WC()->payment_gateways = <?php echo $pg ? 'exists' : 'null'; ?> | 
						get_all_gateways: <?php echo count( $gateways ); ?> | 
						raw->payment_gateways: <?php echo $raw_count; ?> | 
						via get_payment_gateways(): <?php echo $via_get; ?> | 
						Selected: <?php echo count( $selected_gateways ); ?>
					</p>
				<?php endif; ?>
			<?php endif; ?>
			<small><?php esc_html_e( 'درگاه‌های پرداختی که برای خرید نقدی (تکی) قابل استفاده هستند. مثال: زرین‌پال، زیبال', 'webina-woo-core' ); ?></small>
		</div>

		<button type="submit" class="wfcp-btn wfcp-btn-primary">
			<?php esc_html_e( 'ذخیره تنظیمات', 'webina-woo-core' ); ?>
		</button>
	</form>
</div>
