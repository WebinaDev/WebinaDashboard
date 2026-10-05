<?php
/**
 * SnappShop marketplace pricing tab
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

$platform = 'snappshop';
$label    = __( 'اسنپ شاپ', 'webina-woo-core' );
$settings = WFCP_Helper::get_settings( $platform );
if ( ! is_array( $settings ) ) {
	$settings = array();
}
?>
<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php echo esc_html( sprintf( __( 'تنظیمات قیمت %s', 'webina-woo-core' ), $label ) ); ?></h2>
	<form class="wfcp-settings-form" data-section="<?php echo esc_attr( $platform ); ?>">
		<div class="wfcp-form-group">
			<label class="wfcp-form-label"><?php esc_html_e( 'فعال‌سازی', 'webina-woo-core' ); ?></label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="enabled" value="1" <?php checked( ! empty( $settings['enabled'] ) ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="<?php echo esc_attr( $platform ); ?>_profit_percent"><?php esc_html_e( 'درصد سود', 'webina-woo-core' ); ?></label>
			<input type="number" name="profit_percent" id="<?php echo esc_attr( $platform ); ?>_profit_percent" class="wfcp-form-control wfcp-form-control-small" value="<?php echo esc_attr( $settings['profit_percent'] ?? 20 ); ?>" step="0.1" min="0">
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="<?php echo esc_attr( $platform ); ?>_extra_percent"><?php esc_html_e( 'کارمزد / هزینه اضافی (%)', 'webina-woo-core' ); ?></label>
			<input type="number" name="extra_percent" id="<?php echo esc_attr( $platform ); ?>_extra_percent" class="wfcp-form-control wfcp-form-control-small" value="<?php echo esc_attr( $settings['extra_percent'] ?? 0 ); ?>" step="0.1" min="0">
		</div>
		<div class="wfcp-form-group">
			<small><?php esc_html_e( 'درصد سود و کارمزد روی قیمت نقدی (تکی) اعمال می‌شود، نه قیمت خرید.', 'webina-woo-core' ); ?></small>
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label"><?php esc_html_e( 'رند کردن قیمت', 'webina-woo-core' ); ?></label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="round_enabled" value="1" <?php checked( ! isset( $settings['round_enabled'] ) || ! empty( $settings['round_enabled'] ) ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="<?php echo esc_attr( $platform ); ?>_round_to"><?php esc_html_e( 'رند کردن به', 'webina-woo-core' ); ?></label>
			<input type="number" name="round_to" id="<?php echo esc_attr( $platform ); ?>_round_to" class="wfcp-form-control wfcp-form-control-small" value="<?php echo esc_attr( $settings['round_to'] ?? 1000 ); ?>" min="1">
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="<?php echo esc_attr( $platform ); ?>_price_unit"><?php esc_html_e( 'واحد ارسال به API', 'webina-woo-core' ); ?></label>
			<select name="price_unit" id="<?php echo esc_attr( $platform ); ?>_price_unit" class="wfcp-form-control wfcp-form-control-small">
				<option value="toman" <?php selected( ( $settings['price_unit'] ?? 'toman' ), 'toman' ); ?>><?php esc_html_e( 'تومان', 'webina-woo-core' ); ?></option>
				<option value="rial" <?php selected( ( $settings['price_unit'] ?? 'toman' ), 'rial' ); ?>><?php esc_html_e( 'ریال', 'webina-woo-core' ); ?></option>
			</select>
		</div>
		<button type="submit" class="wfcp-btn wfcp-btn-primary"><?php esc_html_e( 'ذخیره تنظیمات', 'webina-woo-core' ); ?></button>
	</form>
</div>
