<?php
/**
 * Style settings tab
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials/tabs
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$style_settings = WFCP_Helper::get_settings( 'style' );
?>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'تنظیمات استایل باکس قیمت', 'webina-woo-core' ); ?></h2>
	
	<form class="wfcp-settings-form" data-section="style">
		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="wfcp_placement">
				<?php esc_html_e( 'جایگاه فرم قیمت', 'webina-woo-core' ); ?>
			</label>
			<?php
			$placement = 'before_cart';
			if ( class_exists( 'WFCP_Helper', false ) ) {
				$placement = WFCP_Helper::product_box_placement();
			}
			$placement_options = array(
				'summary'      => __( 'زیر عنوان محصول', 'webina-woo-core' ),
				'before_cart'  => __( 'قبل از فرم افزودن به سبد', 'webina-woo-core' ),
				'after_cart'   => __( 'بعد از فرم افزودن به سبد', 'webina-woo-core' ),
				'before_tabs'  => __( 'قبل از تب‌های محصول', 'webina-woo-core' ),
				'after_tabs'   => __( 'بعد از تب‌های محصول', 'webina-woo-core' ),
				'none'         => __( 'بدون هوک خودکار', 'webina-woo-core' ),
			);
			?>
			<select name="placement" id="wfcp_placement" class="wfcp-form-control">
				<?php foreach ( $placement_options as $value => $label ) : ?>
					<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $placement, $value ); ?>><?php echo esc_html( $label ); ?></option>
				<?php endforeach; ?>
			</select>
		</div>
		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="box_background">
				<?php esc_html_e( 'رنگ پس‌زمینه باکس', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="color" 
				name="box_background" 
				id="box_background" 
				class="wfcp-form-control" 
				value="<?php echo esc_attr( $style_settings['box_background'] ?? '#ffffff' ); ?>"
				style="width: 100px; height: 40px;"
			>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="box_border_color">
				<?php esc_html_e( 'رنگ حاشیه باکس', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="color" 
				name="box_border_color" 
				id="box_border_color" 
				class="wfcp-form-control" 
				value="<?php echo esc_attr( $style_settings['box_border_color'] ?? '#e0e0e0' ); ?>"
				style="width: 100px; height: 40px;"
			>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="button_background">
				<?php esc_html_e( 'رنگ پس‌زمینه دکمه‌ها', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="color" 
				name="button_background" 
				id="button_background" 
				class="wfcp-form-control" 
				value="<?php echo esc_attr( $style_settings['button_background'] ?? '#2271b1' ); ?>"
				style="width: 100px; height: 40px;"
			>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="button_text_color">
				<?php esc_html_e( 'رنگ متن دکمه‌ها', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="color" 
				name="button_text_color" 
				id="button_text_color" 
				class="wfcp-form-control" 
				value="<?php echo esc_attr( $style_settings['button_text_color'] ?? '#ffffff' ); ?>"
				style="width: 100px; height: 40px;"
			>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="price_color">
				<?php esc_html_e( 'رنگ نمایش قیمت', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="color" 
				name="price_color" 
				id="price_color" 
				class="wfcp-form-control" 
				value="<?php echo esc_attr( $style_settings['price_color'] ?? '#2271b1' ); ?>"
				style="width: 100px; height: 40px;"
			>
		</div>

		<div class="wfcp-form-group">
			<label class="wfcp-form-label" for="border_radius">
				<?php esc_html_e( 'گردی گوشه‌ها (px)', 'webina-woo-core' ); ?>
			</label>
			<input 
				type="number" 
				name="border_radius" 
				id="border_radius" 
				class="wfcp-form-control" 
				value="<?php echo esc_attr( $style_settings['border_radius'] ?? 8 ); ?>"
				min="0"
				max="50"
			>
		</div>

		<hr>
		<h4><?php esc_html_e( 'آلرت راهنما', 'webina-woo-core' ); ?></h4>
		<div class="wfcp-form-group" style="display:flex;flex-wrap:wrap;gap:16px;">
			<?php
			$alert_colors = array(
				'alert_bg'           => array( '#ffffff', __( 'پس‌زمینه آلرت', 'webina-woo-core' ) ),
				'alert_text_color'   => array( '#9A3412', __( 'متن آلرت', 'webina-woo-core' ) ),
				'alert_border_color' => array( '#FDBA74', __( 'حاشیه آلرت', 'webina-woo-core' ) ),
				'alert_accent'       => array( '#EA580C', __( 'رنگ تاکیدی آلرت', 'webina-woo-core' ) ),
			);
			foreach ( $alert_colors as $key => $meta ) :
				?>
				<div>
					<label class="wfcp-form-label" for="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $meta[1] ); ?></label>
					<input
						type="color"
						name="<?php echo esc_attr( $key ); ?>"
						id="<?php echo esc_attr( $key ); ?>"
						class="wfcp-form-control"
						value="<?php echo esc_attr( $style_settings[ $key ] ?? $meta[0] ); ?>"
						style="width:100px;height:40px;"
					>
				</div>
			<?php endforeach; ?>
		</div>

		<hr>
		<h4><?php esc_html_e( 'بج نوع خرید', 'webina-woo-core' ); ?></h4>
		<div class="wfcp-form-group" style="display:flex;flex-wrap:wrap;gap:16px;">
			<?php
			$badge_colors = array(
				'badge_cash_bg'           => array( '#ECFDF5', __( 'پس‌زمینه نقدی', 'webina-woo-core' ) ),
				'badge_cash_text'         => array( '#047857', __( 'متن نقدی', 'webina-woo-core' ) ),
				'badge_credit_bg'         => array( '#EFF6FF', __( 'پس‌زمینه اعتباری', 'webina-woo-core' ) ),
				'badge_credit_text'       => array( '#1D4ED8', __( 'متن اعتباری', 'webina-woo-core' ) ),
				'badge_installment_bg'    => array( '#FFFBEB', __( 'پس‌زمینه اقساطی', 'webina-woo-core' ) ),
				'badge_installment_text'  => array( '#B45309', __( 'متن اقساطی', 'webina-woo-core' ) ),
			);
			foreach ( $badge_colors as $key => $meta ) :
				?>
				<div>
					<label class="wfcp-form-label" for="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $meta[1] ); ?></label>
					<input
						type="color"
						name="<?php echo esc_attr( $key ); ?>"
						id="<?php echo esc_attr( $key ); ?>"
						class="wfcp-form-control"
						value="<?php echo esc_attr( $style_settings[ $key ] ?? $meta[0] ); ?>"
						style="width:100px;height:40px;"
					>
				</div>
			<?php endforeach; ?>
		</div>

		<hr>
		<h4><?php esc_html_e( 'تایم‌لاین اقساط', 'webina-woo-core' ); ?></h4>
		<div class="wfcp-form-group" style="display:flex;flex-wrap:wrap;gap:16px;">
			<?php
			$timeline_colors = array(
				'timeline_dot'         => array( '#c45c26', __( 'رنگ نقطه تایم‌لاین', 'webina-woo-core' ) ),
				'timeline_line'        => array( '#d6b089', __( 'رنگ خط تایم‌لاین', 'webina-woo-core' ) ),
				'timeline_today_text'  => array( '#111827', __( 'متن امروز', 'webina-woo-core' ) ),
				'timeline_future_text' => array( '#6b7280', __( 'متن تاریخ‌های بعدی', 'webina-woo-core' ) ),
			);
			foreach ( $timeline_colors as $key => $meta ) :
				?>
				<div>
					<label class="wfcp-form-label" for="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $meta[1] ); ?></label>
					<input
						type="color"
						name="<?php echo esc_attr( $key ); ?>"
						id="<?php echo esc_attr( $key ); ?>"
						class="wfcp-form-control"
						value="<?php echo esc_attr( $style_settings[ $key ] ?? $meta[0] ); ?>"
						style="width:100px;height:40px;"
					>
				</div>
			<?php endforeach; ?>
		</div>

		<button type="submit" class="wfcp-btn wfcp-btn-primary">
			<?php esc_html_e( 'ذخیره تنظیمات', 'webina-woo-core' ); ?>
		</button>
	</form>
</div>

<div class="wfcp-card">
	<h2 class="wfcp-card-title"><?php esc_html_e( 'پیش‌نمایش', 'webina-woo-core' ); ?></h2>
	<div id="wfcp-style-preview" style="padding: 20px; background: #f8fafc; border-radius: 8px; margin-top: 20px;">
		<div class="wfcp-preview-box" style="background: <?php echo esc_attr( $style_settings['box_background'] ?? '#ffffff' ); ?>; border: 1px solid <?php echo esc_attr( $style_settings['box_border_color'] ?? '#e0e0e0' ); ?>; border-radius: <?php echo esc_attr( $style_settings['border_radius'] ?? 8 ); ?>px; padding: 20px;">
			<div style="margin-bottom: 15px;">
				<strong style="font-family: 'YekanBakh', 'Tahoma', sans-serif;">قیمت نقدی</strong>
				<div style="color: <?php echo esc_attr( $style_settings['price_color'] ?? '#2271b1' ); ?>; font-size: 18px; font-weight: bold; font-family: 'YekanBakh', 'Tahoma', sans-serif;">1,000,000 <?php echo WFCP_Helper::get_toman_svg(); ?></div>
			</div>
			<button style="background: <?php echo esc_attr( $style_settings['button_background'] ?? '#2271b1' ); ?>; color: <?php echo esc_attr( $style_settings['button_text_color'] ?? '#ffffff' ); ?>; border: none; padding: 10px 20px; border-radius: 6px; font-family: 'YekanBakh', 'Tahoma', sans-serif; cursor: pointer;">
				افزودن به سبد
			</button>
		</div>
	</div>
</div>

