<?php

namespace Webino_Dashboard_Bots_Telegram\Bot;

/**
 * Long-form copy for «پیگیری سفارش»: current step, next step, explanation.
 */
class OrderStatusNarrative {

	/**
	 * @return array{current:string,next:string,description:string}
	 */
	private static function parts_for_status( string $status, \WC_Order $order ): array {
		switch ( $status ) {
			case 'pending':
				return array(
					'current'     => __( 'سفارش ثبت شده و هنوز پرداخت نهایی نشده است.', 'webino-dashboard' ),
					'next'        => __( 'پس از پرداخت موفق، سفارش برای بررسی و آماده‌سازی نزد فروشگاه قرار می‌گیرد.', 'webino-dashboard' ),
					'description' => __( 'در این مرحله باید مبلغ سفارش را تسویه کنید. تا زمانی که پرداخت کامل نشود، فروشگاه سفارش را ارسال نمی‌کند. می‌توانید از طریق همین ربات یا سایت فروشگاه پرداخت را انجام دهید.', 'webino-dashboard' ),
				);
			case 'failed':
				return array(
					'current'     => __( 'آخرین تلاش برای پرداخت ناموفق بوده است.', 'webino-dashboard' ),
					'next'        => __( 'می‌توانید دوباره پرداخت را انجام دهید یا در صورت نیاز با پشتیبانی تماس بگیرید.', 'webino-dashboard' ),
					'description' => __( 'در این وضعیت هیچ مبلگی از حساب شما به‌طور قطعی کسر نشده یا تراکنش تکمیل نشده است. پیشنهاد می‌شود روش پرداخت یا کارت را بررسی کرده و مجدداً تلاش کنید.', 'webino-dashboard' ),
				);
			case 'on-hold':
				return array(
					'current'     => __( 'سفارش در انتظار بررسی دستی توسط فروشگاه است.', 'webino-dashboard' ),
					'next'        => __( 'پس از تایید فروشگاه، سفارش وارد مرحله آماده‌سازی و ارسال می‌شود.', 'webino-dashboard' ),
					'description' => __( 'گاهی برای تطابق با موجودی، آدرس یا تایید تلفنی، فروشگاه سفارش را موقتاً نگه می‌دارد. در این مدت نیازی به اقدام جدید از سمت شما نیست مگر اینکه فروشگاه درخواست کند.', 'webino-dashboard' ),
				);
			case 'processing':
				return array(
					'current'     => __( 'فروشگاه سفارش را تایید کرده و در حال آماده‌سازی و بسته‌بندی است.', 'webino-dashboard' ),
					'next'        => __( 'ارسال مرسوله (پست یا پیک) و سپس تحویل به شما؛ در صورت ثبت، کد رهگیری پست در همین بخش نمایش داده می‌شود.', 'webino-dashboard' ),
					'description' => __( 'در این مرحله کالاها جمع‌آوری، بسته‌بندی و برای ارسال تحویل پست یا پیک می‌شود. اگر تأخیری پیش آید، فروشگاه باید اطلاع‌رسانی کند.', 'webino-dashboard' ),
				);
			case 'completed':
				return array(
					'current'     => __( 'سفارش از نظر فروشگاه تکمیل شده است؛ کالا تحویل شده یا خدمت ارائه شده محسوب می‌شود.', 'webino-dashboard' ),
					'next'        => __( 'فرایند این سفارش برای شما به پایان رسیده است.', 'webino-dashboard' ),
					'description' => __( 'اگر کالایی را دریافت نکرده‌اید یا ایرادی دیدید، با پشتیبانی فروشگاه تماس بگیرید. در صورت ثبت کد رهگیری، می‌توانید وضعیت مرسوله را از سامانه پست پیگیری کنید.', 'webino-dashboard' ),
				);
			case 'cancelled':
				return array(
					'current'     => __( 'این سفارش لغو شده و دیگر ادامه پیدا نمی‌کند.', 'webino-dashboard' ),
					'next'        => __( '—', 'webino-dashboard' ),
					'description' => __( 'لغو ممکن است توسط شما، فروشگاه یا به‌دلیل عدم پرداخت انجام شده باشد. اگر مبلغی پرداخت کرده‌اید، مطابق قوانین فروشگاه درباره بازپرداخت اقدام می‌شود.', 'webino-dashboard' ),
				);
			case 'refunded':
				return array(
					'current'     => __( 'برای این سفارش بازپرداخت ثبت شده یا در حال انجام است.', 'webino-dashboard' ),
					'next'        => __( '—', 'webino-dashboard' ),
					'description' => __( 'مبلغ طبق روش پرداخت شما به حساب برمی‌گردد؛ زمان واریز به بانک و نوع کارت بستگی دارد. برای جزئیات با فروشگاه تماس بگیرید.', 'webino-dashboard' ),
				);
			case 'shipped':
				return array(
					'current'     => __( 'مرسوله تحویل پست یا پیک شده و در مسیر تحویل به شماست.', 'webino-dashboard' ),
					'next'        => __( 'تحویل به آدرس شما و در نهایت تکمیل سفارش توسط فروشگاه.', 'webino-dashboard' ),
					'description' => __( 'در این مرحله می‌توانید با کد رهگیری پست، وضعیت بسته را از سامانه پست بررسی کنید. در صورت مشکل در تحویل، با فروشگاه هماهنگ کنید.', 'webino-dashboard' ),
				);
			default:
				$label = wc_get_order_status_name( $status );
				return array(
					'current'     => sprintf(
						/* translators: %s: order status label */
						__( 'سفارش در وضعیت «%s» قرار دارد.', 'webino-dashboard' ),
						$label
					),
					'next'        => __( 'مرحله بعد بسته به تصمیم فروشگاه و نوع سفارش است.', 'webino-dashboard' ),
					'description' => __( 'برای جزئیات بیشتر درباره این وضعیت، با پشتیبانی فروشگاه تماس بگیرید.', 'webino-dashboard' ),
				);
		}
	}

	/**
	 * @return array{current:string,next:string,description:string}
	 */
	public static function get_parts( \WC_Order $order ): array {
		$status = $order->get_status();
		$parts  = self::parts_for_status( $status, $order );
		/**
		 * Filter narrative sections before building the tracking message.
		 *
		 * @param array{current:string,next:string,description:string} $parts
		 */
		return apply_filters( 'wbdb_tg_order_status_narrative_parts', $parts, $order, $status );
	}

	public static function build_tracking_message( \WC_Order $order ): string {
		$num = $order->get_order_number();
		$parts = self::get_parts( $order );

		$lines   = array();
		$lines[] = sprintf( __( '📍 پیگیری سفارش #%s', 'webino-dashboard' ), $num );
		$lines[] = '';
		$lines[] = __( 'وضعیت فعلی:', 'webino-dashboard' );
		$lines[] = $parts['current'];
		$lines[] = '';
		$lines[] = __( 'مرحله بعدی:', 'webino-dashboard' );
		$lines[] = $parts['next'];
		$lines[] = '';
		$lines[] = __( 'توضیح:', 'webino-dashboard' );
		$lines[] = $parts['description'];

		$text = implode( "\n", $lines );

		/** @var string $text */
		return (string) apply_filters( 'wbdb_tg_order_status_tracking_text', $text, $order );
	}
}
