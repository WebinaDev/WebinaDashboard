<?php
/**
 * Currency settings tab — display currency is owned by WooCommerce.
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials/tabs
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$wc_currency = function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRR';
$wc_symbol   = function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol( $wc_currency ) : $wc_currency;
// Strip HTML if a filter injected markup (we show plain text here).
$wc_symbol   = wp_strip_all_tags( $wc_symbol );
$wc_settings = admin_url( 'admin.php?page=wc-settings&tab=general' );
?>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'تنظیمات واحد پول', 'webina-woo-core' ); ?></h2>

	<div class="wfcp-form-group">
		<label class="wfcp-form-label">
			<?php esc_html_e( 'واحد پول نمایشی', 'webina-woo-core' ); ?>
		</label>
		<p style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #1e293b;">
			<?php echo esc_html( $wc_symbol . ' (' . $wc_currency . ')' ); ?>
		</p>
		<small>
			<?php esc_html_e( 'واحد پول نمایشی مستقیماً از تنظیمات ووکامرس خوانده می‌شود و در این افزونه قابل تغییر نیست.', 'webina-woo-core' ); ?>
		</small>
		<p style="margin-top: 12px;">
			<a class="wfcp-btn wfcp-btn-primary" href="<?php echo esc_url( $wc_settings ); ?>">
				<?php esc_html_e( 'تغییر واحد پول در ووکامرس', 'webina-woo-core' ); ?>
			</a>
		</p>
	</div>
</div>
