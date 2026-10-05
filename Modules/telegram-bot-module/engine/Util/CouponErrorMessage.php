<?php

namespace Webino_Dashboard_Bots_Telegram\Util;

/**
 * Turns WooCommerce coupon error notices into clear Persian for the bot.
 */
class CouponErrorMessage {

	/**
	 * @param string $raw HTML or plain notice from wc_get_notices (after strip_tags optional).
	 */
	public static function localize( string $raw ): string {
		$raw = html_entity_decode( wp_strip_all_tags( $raw ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$raw = trim( preg_replace( '/\s+/u', ' ', $raw ) );
		if ( $raw === '' ) {
			return __( 'کد تخفیف اعمال نشد.', 'webino-dashboard' );
		}

		$lower = strtolower( $raw );

		// Coupon "x" cannot be applied because it does not exist.
		if ( preg_match( '/coupon\s+"([^"]+)"\s+cannot\s+be\s+applied\s+because\s+it\s+does\s+not\s+exist/i', $raw, $m ) ) {
			return sprintf(
				/* translators: %s: coupon code */
				__( 'کد تخفیف «%s» در فروشگاه ثبت نشده و قابل اعمال نیست.', 'webino-dashboard' ),
				sanitize_text_field( $m[1] )
			);
		}
		if ( preg_match( "/coupon\s+'([^']+)'\s+cannot\s+be\s+applied\s+because\s+it\s+does\s+not\s+exist/i", $raw, $m ) ) {
			return sprintf(
				__( 'کد تخفیف «%s» در فروشگاه ثبت نشده و قابل اعمال نیست.', 'webino-dashboard' ),
				sanitize_text_field( $m[1] )
			);
		}

		// Sorry, coupon "%s" is not applicable to your cart contents.
		if ( preg_match( '/coupon\s+"([^"]+)"\s+is\s+not\s+applicable/i', $raw, $m ) ) {
			return sprintf(
				__( 'کد تخفیف «%s» برای محتوای این سبد قابل اعمال نیست.', 'webino-dashboard' ),
				sanitize_text_field( $m[1] )
			);
		}

		// "%s" is not a valid coupon.
		if ( preg_match( '/"([^"]+)"\s+is\s+not\s+a\s+valid\s+coupon/i', $raw, $m ) ) {
			return sprintf(
				__( '«%s» یک کد تخفیف معتبر نیست.', 'webino-dashboard' ),
				sanitize_text_field( $m[1] )
			);
		}

		if ( strpos( $lower, 'has expired' ) !== false
			|| ( strpos( $lower, 'expired' ) !== false && strpos( $lower, 'coupon' ) !== false ) ) {
			return __( 'این کد تخفیف منقضی شده است.', 'webino-dashboard' );
		}

		if ( strpos( $lower, 'already been applied' ) !== false ) {
			return __( 'این کد تخفیف قبلاً روی سبد اعمال شده است.', 'webino-dashboard' );
		}

		if ( strpos( $lower, 'usage limit' ) !== false ) {
			return __( 'محدودیت استفاده از این کد تخفیف رعایت نشده است.', 'webino-dashboard' );
		}

		if ( strpos( $lower, 'minimum spend' ) !== false || strpos( $lower, 'minimum amount' ) !== false ) {
			return __( 'مبلغ سبد برای استفاده از این کد تخفیف به حداقل لازم نرسیده است.', 'webino-dashboard' );
		}

		if ( strpos( $lower, 'maximum spend' ) !== false || strpos( $lower, 'maximum amount' ) !== false ) {
			return __( 'مبلغ سبد برای این کد تخفیف بیش از حد مجاز است.', 'webino-dashboard' );
		}

		if ( strpos( $lower, 'not valid' ) !== false || strpos( $lower, 'invalid coupon' ) !== false ) {
			return __( 'این کد تخفیف نامعتبر است.', 'webino-dashboard' );
		}

		// If WooCommerce already returned Persian, keep it (no leading ASCII error keyword).
		if ( preg_match( '/[\x{0600}-\x{06FF}]/u', $raw ) && ! preg_match( '/^(coupon|sorry|the)\s/i', $raw ) ) {
			return $raw;
		}

		return __( 'این کد تخفیف قابل اعمال نیست. کد را دوباره بررسی کنید یا با فروشگاه تماس بگیرید.', 'webino-dashboard' );
	}
}
