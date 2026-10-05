<?php
/**
 * Quick Add Products Page
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}
?>

<div class="wrap wfcp-admin-wrap">
	<div class="wfcp-header">
		<div class="wfcp-header-content">
			<div class="wfcp-logo-wrapper">
				<img src="<?php echo esc_url( WFCP_PLUGIN_URL . 'assets/images/logo.png' ); ?>" alt="Logo" class="wfcp-logo">
			</div>
			<div class="wfcp-header-text">
				<h1 class="wfcp-page-title"><?php esc_html_e( 'افزودن سریع محصولات', 'webina-woo-core' ); ?></h1>
				<p class="wfcp-page-subtitle"><?php esc_html_e( 'افزودن سریع محصولات به ووکامرس', 'webina-woo-core' ); ?></p>
			</div>
		</div>
	</div>

	<div class="wfcp-content">
		<div class="wfcp-card">
			<div class="wfcp-quick-add-container">
				<table class="wfcp-quick-add-table" id="wfcp-quick-add-table">
					<thead>
						<tr>
							<th><?php esc_html_e( 'ردیف', 'webina-woo-core' ); ?></th>
							<th><?php esc_html_e( 'عکس محصول', 'webina-woo-core' ); ?></th>
							<th><?php esc_html_e( 'نام محصول', 'webina-woo-core' ); ?></th>
							<th><?php esc_html_e( 'قیمت خرید', 'webina-woo-core' ); ?></th>
							<th><?php esc_html_e( 'عملیات', 'webina-woo-core' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php for ( $i = 1; $i <= 50; $i++ ) : ?>
						<tr data-row="<?php echo esc_attr( $i ); ?>">
							<td class="wfcp-row-number"><?php echo esc_html( $i ); ?></td>
							<td>
								<div class="wfcp-image-upload">
									<div class="wfcp-image-upload-box" data-row="<?php echo esc_attr( $i ); ?>">
										<div class="wfcp-image-preview" data-row="<?php echo esc_attr( $i ); ?>">
											<span class="wfcp-image-placeholder">
												<span class="dashicons dashicons-camera-alt"></span>
												<span><?php esc_html_e( 'افزودن عکس', 'webina-woo-core' ); ?></span>
											</span>
										</div>
										<button type="button" class="wfcp-remove-image" data-row="<?php echo esc_attr( $i ); ?>" style="display: none;">
											<span class="dashicons dashicons-no-alt"></span>
										</button>
									</div>
									<input type="hidden" class="wfcp-image-id" data-row="<?php echo esc_attr( $i ); ?>" value="">
								</div>
							</td>
							<td>
								<input 
									type="text" 
									class="wfcp-form-control wfcp-product-name" 
									placeholder="<?php esc_attr_e( 'نام محصول', 'webina-woo-core' ); ?>"
									data-row="<?php echo esc_attr( $i ); ?>"
									maxlength="5040"
								>
								<small class="wfcp-char-count" data-row="<?php echo esc_attr( $i ); ?>" style="display: block; text-align: left; margin-top: 5px; color: #6b7280; font-size: 12px;">
									<span class="wfcp-char-current">0</span> / 5040
								</small>
							</td>
							<td>
								<input type="number" 
									class="wfcp-form-control wfcp-purchase-price" 
									placeholder="0"
									step="0.01"
									min="0"
									data-row="<?php echo esc_attr( $i ); ?>"
								>
							</td>
							<td>
								<button type="button" 
									class="wfcp-btn wfcp-btn-primary wfcp-save-row" 
									data-row="<?php echo esc_attr( $i ); ?>"
								>
									<?php esc_html_e( 'ذخیره', 'webina-woo-core' ); ?>
								</button>
							</td>
						</tr>
						<?php endfor; ?>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

