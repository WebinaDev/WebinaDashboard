<?php
/**
 * Storefront coffee blend wizard shell.
 *
 * @var array<string,mixed> $blend_config
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wcb" id="wcb-root" dir="rtl" data-config="<?php echo esc_attr( wp_json_encode( $blend_config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) ); ?>">
	<div class="wcb-hero">
		<p class="wcb-kicker">قهوه خودت را بساز</p>
		<h2 class="wcb-title">ترکیب شخصی قهوه</h2>
		<p class="wcb-lead">از ۲ تا ۴ دان تازه انتخاب کن، رست و آسیاب را مشخص کن، و ترکیبی بساز که دقیقاً طعم تو باشد.</p>
	</div>
	<div class="wcb-app"></div>
</div>
