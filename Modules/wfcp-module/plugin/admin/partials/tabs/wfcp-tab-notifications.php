<?php
/**
 * Notifications settings tab
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials/tabs
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$notifications = WFCP_Helper::get_settings( 'notifications' );
?>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'متن‌های نمایشی', 'webina-woo-core' ); ?></h2>
	
	<form class="wfcp-settings-form" data-section="notifications">
		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="installment_text">
				<?php esc_html_e( 'متن خرید اقساطی', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="text" 
				name="installment_text" 
				id="installment_text" 
				class="wfcp-form-control" 
				value="<?php echo esc_attr( $notifications['installment_text'] ?? 'خرید اقساطی' ); ?>"
			>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="credit_text">
				<?php esc_html_e( 'متن خرید اعتباری', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="text" 
				name="credit_text" 
				id="credit_text" 
				class="wfcp-form-control" 
				value="<?php echo esc_attr( $notifications['credit_text'] ?? 'خرید اعتباری' ); ?>"
			>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="cash_description">
				<?php esc_html_e( 'توضیح خرید نقدی', 'webina-woo-core' ); ?>
			</label>
			<textarea name="cash_description" id="cash_description" class="wfcp-form-control" rows="3"><?php echo esc_textarea( $notifications['cash_description'] ?? '' ); ?></textarea>
			<small><?php esc_html_e( 'متن دلخواه زیر قیمت نقدی در صفحه محصول', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="installment_description">
				<?php esc_html_e( 'توضیح خرید اقساطی', 'webina-woo-core' ); ?>
			</label>
			<textarea name="installment_description" id="installment_description" class="wfcp-form-control" rows="3"><?php echo esc_textarea( $notifications['installment_description'] ?? '' ); ?></textarea>
			<small><?php esc_html_e( 'متن دلخواه در بلوک خرید اقساطی', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="credit_description">
				<?php esc_html_e( 'توضیح خرید اعتباری', 'webina-woo-core' ); ?>
			</label>
			<textarea name="credit_description" id="credit_description" class="wfcp-form-control" rows="3"><?php echo esc_textarea( $notifications['credit_description'] ?? '' ); ?></textarea>
			<small><?php esc_html_e( 'متن دلخواه در بلوک خرید اعتباری', 'webina-woo-core' ); ?></small>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="need_review">
				<?php esc_html_e( 'متن نیاز به بررسی', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="text" 
				name="need_review" 
				id="need_review" 
				class="wfcp-form-control" 
				value="<?php echo esc_attr( $notifications['need_review'] ?? 'نیاز به بررسی' ); ?>"
			>
		</div>

		<hr>
		<h4><?php esc_html_e( 'لیبل‌ها و آلارم‌های قابل نمایش (روشن/خاموش)', 'webina-woo-core' ); ?></h4>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'نمایش بج نقدی', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="show_cash_badge" value="1" <?php checked( $notifications['show_cash_badge'] ?? true, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
			<input type="text" name="custom_cash_label" class="wfcp-form-control" placeholder="نقدی" value="<?php echo esc_attr( $notifications['custom_cash_label'] ?? '' ); ?>">
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'نمایش بج اقساطی', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="show_install_badge" value="1" <?php checked( $notifications['show_install_badge'] ?? true, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
			<input type="text" name="custom_install_label" class="wfcp-form-control" placeholder="اقساطی" value="<?php echo esc_attr( $notifications['custom_install_label'] ?? '' ); ?>">
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'نمایش بج اعتباری', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="show_credit_badge" value="1" <?php checked( $notifications['show_credit_badge'] ?? true, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label">
				<?php esc_html_e( 'نمایش لیبل گارانتی', 'webina-woo-core' ); ?>
			</label>
			<label class="wfcp-toggle">
				<input type="checkbox" name="show_guaranty_label" value="1" <?php checked( $notifications['show_guaranty_label'] ?? false, true ); ?>>
				<span class="wfcp-toggle-slider"></span>
			</label>
			<input type="text" name="guaranty_text" class="wfcp-form-control" value="<?php echo esc_attr( $notifications['guaranty_text'] ?? 'گارانتی ۲۴ ماهه' ); ?>">
		</div>

		<hr>
		<h4><?php esc_html_e( 'راهنماهای صفحه', 'webina-woo-core' ); ?></h4>
		<p class="description" style="margin-bottom:16px;">
			<?php esc_html_e( 'آلرت راهنما بالای صفحات محصول، سبد خرید و تسویه حساب. در متن تسویه می‌توانید از {type} برای نام روش پرداخت فعلی استفاده کنید.', 'webina-woo-core' ); ?>
		</p>

		<?php
		$alert_defaults = array(
			'product'   => 'در صورت نیاز می‌توانید روش پرداخت اقساطی یا اعتباری را از باکس قیمت انتخاب کنید، سپس محصول را به سبد اضافه کنید.',
			'cart'      => 'می‌توانید روش پرداخت همه محصولات سبد را از بخش زیر به نقدی، اقساطی یا اعتباری تغییر دهید.',
			'checkout'  => 'روش پرداخت فعلی سبد: {type}. برای تغییر به اقساطی یا اعتباری به سبد خرید برگردید و روش را عوض کنید.',
		);
		$alert_labels = array(
			'product'  => __( 'آلرت صفحه محصول', 'webina-woo-core' ),
			'cart'     => __( 'آلرت سبد خرید', 'webina-woo-core' ),
			'checkout' => __( 'آلرت تسویه حساب', 'webina-woo-core' ),
		);
		foreach ( $alert_labels as $ctx => $label ) :
			$enabled_key = 'alert_' . $ctx . '_enabled';
			$text_key    = 'alert_' . $ctx . '_text';
			$enabled     = isset( $notifications[ $enabled_key ] ) ? (bool) $notifications[ $enabled_key ] : true;
			$text        = isset( $notifications[ $text_key ] ) ? $notifications[ $text_key ] : $alert_defaults[ $ctx ];
			?>
			<div class="wfcp-form-group" style="padding:14px;background:#f8fafc;border-radius:8px;margin-bottom:12px;">
				<label class="wfcp-form-label"><?php echo esc_html( $label ); ?></label>
				<label class="wfcp-toggle" style="margin-bottom:10px;display:inline-flex;align-items:center;gap:8px;">
					<input type="checkbox" name="<?php echo esc_attr( $enabled_key ); ?>" value="1" <?php checked( $enabled, true ); ?>>
					<span class="wfcp-toggle-slider"></span>
					<span><?php esc_html_e( 'نمایش', 'webina-woo-core' ); ?></span>
				</label>
				<textarea
					name="<?php echo esc_attr( $text_key ); ?>"
					id="<?php echo esc_attr( $text_key ); ?>"
					class="wfcp-form-control"
					rows="3"
				><?php echo esc_textarea( $text ); ?></textarea>
			</div>
		<?php endforeach; ?>

		<button type="submit" class="wfcp-btn wfcp-btn-primary">
			<?php esc_html_e( 'ذخیره تنظیمات', 'webina-woo-core' ); ?>
		</button>
	</form>
</div>

