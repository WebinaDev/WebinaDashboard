<?php
/**
 * Credit settings tab
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials/tabs
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$credit = WFCP_Helper::get_settings( 'credit' );

// Use Gateway Manager for consistent gateway loading (all registered gateways)
if ( ! class_exists( 'WFCP_Gateway_Manager' ) ) {
	require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-gateway-manager.php';
}
$gateways = WFCP_Gateway_Manager::get_all_gateways();
$selected_gateways = WFCP_Gateway_Manager::normalize_gateway_ids( $credit['gateways'] ?? array() );
?>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'تنظیمات خرید اعتباری', 'webina-woo-core' ); ?></h2>
	
	<form class="wfcp-settings-form" data-section="credit">
		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'فعال‌سازی خرید اعتباری', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="enabled" value="1" <?php checked( $credit['enabled'] ?? false, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="increase_percent">
				<?php esc_html_e( 'درصد افزایش قیمت', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="number" 
				name="increase_percent" 
				id="increase_percent" 
				class="wfcp-form-control wfcp-form-control-small" 
				value="<?php echo esc_attr( $credit['increase_percent'] ?? 5 ); ?>"
				step="0.1"
				min="0"
			>
			<small><?php esc_html_e( 'درصد افزایش قیمت برای خرید اعتباری', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'درگاه‌های پرداخت برای خرید اعتباری', 'webina-woo-core' ); ?>
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
			<small><?php esc_html_e( 'درگاه‌های پرداختی که برای خرید اعتباری قابل استفاده هستند. مثال: اسنپ‌پی، پی‌پینگ', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="credit_title">
				<?php esc_html_e( 'عنوان خرید اعتباری', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="text" 
				name="texts[title]" 
				id="credit_title" 
				class="wfcp-form-control wfcp-form-control-medium" 
				value="<?php echo esc_attr( $credit['texts']['title'] ?? 'خرید اعتباری' ); ?>"
			>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="credit_button">
				<?php esc_html_e( 'متن دکمه', 'webina-woo-core' ); ?></label>
			<input 
				type="text" 
				name="texts[button_text]" 
				id="credit_button" 
				class="wfcp-form-control wfcp-form-control-medium" 
				value="<?php echo esc_attr( $credit['texts']['button_text'] ?? 'افزودن اعتباری' ); ?>"
			>
		</div>

		<button type="submit" class="wfcp-btn wfcp-btn-primary">
			<?php esc_html_e( 'ذخیره تنظیمات', 'webina-woo-core' ); ?>
		</button>
	</form>
</div>
