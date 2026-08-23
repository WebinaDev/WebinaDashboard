<?php
/**
 * Coffee finder shortcode markup.
 *
 * @package WebinoDashboard
 *
 * @var string $title
 * @var string $lead
 * @var string $bean
 * @var string $acid
 * @var string $bitter
 * @var string $caff
 * @var int    $limit
 * @var int    $columns
 * @var array{html:string,found:int,pages:int,page:int,message:string} $result
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<section
	class="wcs"
	data-limit="<?php echo esc_attr( (string) $limit ); ?>"
	data-columns="<?php echo esc_attr( (string) $columns ); ?>"
>
	<div class="wcs-card">
		<header class="wcs-hero">
			<p class="wcs-kicker"><?php esc_html_e( 'کشف طعم', 'webino-dashboard' ); ?></p>
			<h2 class="wcs-title"><?php echo esc_html( $title ); ?></h2>
			<?php if ( $lead ) : ?>
				<p class="wcs-lead"><?php echo esc_html( $lead ); ?></p>
			<?php endif; ?>
		</header>
		<form class="wcs-form" method="get" action="">
			<input type="hidden" name="wcs" value="1" />
			<input type="hidden" name="wcs_page" value="1" />
			<label class="wcs-field">
				<span><?php esc_html_e( 'نوع دانه', 'webino-dashboard' ); ?></span>
				<select name="wcs_bean">
					<option value=""><?php esc_html_e( 'همه', 'webino-dashboard' ); ?></option>
					<option value="arabica" <?php selected( $bean, 'arabica' ); ?>><?php esc_html_e( 'ترکیبی (۱۰۰٪ عربیکا)', 'webino-dashboard' ); ?></option>
					<option value="mix" <?php selected( $bean, 'mix' ); ?>><?php esc_html_e( 'ترکیبی (ربوستا - عربیکا)', 'webino-dashboard' ); ?></option>
					<option value="single" <?php selected( $bean, 'single' ); ?>><?php esc_html_e( 'تک خاستگاه (عربیکا)', 'webino-dashboard' ); ?></option>
				</select>
			</label>
			<label class="wcs-field">
				<span><?php esc_html_e( 'میزان اسیدیته', 'webino-dashboard' ); ?></span>
				<select name="wcs_acidity">
					<option value=""><?php esc_html_e( 'همه', 'webino-dashboard' ); ?></option>
					<option value="high" <?php selected( $acid, 'high' ); ?>><?php esc_html_e( 'زیاد', 'webino-dashboard' ); ?></option>
					<option value="mid" <?php selected( $acid, 'mid' ); ?>><?php esc_html_e( 'متوسط', 'webino-dashboard' ); ?></option>
					<option value="low" <?php selected( $acid, 'low' ); ?>><?php esc_html_e( 'کم', 'webino-dashboard' ); ?></option>
				</select>
			</label>
			<label class="wcs-field">
				<span><?php esc_html_e( 'میزان تلخی', 'webino-dashboard' ); ?></span>
				<select name="wcs_bitterness">
					<option value=""><?php esc_html_e( 'همه', 'webino-dashboard' ); ?></option>
					<option value="high" <?php selected( $bitter, 'high' ); ?>><?php esc_html_e( 'زیاد', 'webino-dashboard' ); ?></option>
					<option value="mid" <?php selected( $bitter, 'mid' ); ?>><?php esc_html_e( 'متوسط', 'webino-dashboard' ); ?></option>
					<option value="low" <?php selected( $bitter, 'low' ); ?>><?php esc_html_e( 'کم', 'webino-dashboard' ); ?></option>
				</select>
			</label>
			<label class="wcs-field">
				<span><?php esc_html_e( 'میزان کافئین', 'webino-dashboard' ); ?></span>
				<select name="wcs_caffeine">
					<option value=""><?php esc_html_e( 'همه', 'webino-dashboard' ); ?></option>
					<option value="high" <?php selected( $caff, 'high' ); ?>><?php esc_html_e( 'زیاد', 'webino-dashboard' ); ?></option>
					<option value="mid" <?php selected( $caff, 'mid' ); ?>><?php esc_html_e( 'متوسط', 'webino-dashboard' ); ?></option>
					<option value="low" <?php selected( $caff, 'low' ); ?>><?php esc_html_e( 'کم', 'webino-dashboard' ); ?></option>
				</select>
			</label>
			<button type="submit" class="wcs-submit"><?php esc_html_e( 'جستجو', 'webino-dashboard' ); ?></button>
		</form>
	</div>
	<div class="wcs-results" aria-live="polite">
		<?php echo $result['html']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>
</section>
