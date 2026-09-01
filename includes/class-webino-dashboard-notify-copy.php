<?php
/**
 * Default Persian notification copy (site, email, bots).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Per-event notification templates with {token} placeholders.
 */
final class Webino_Dashboard_Notify_Copy {

	/**
	 * @param string $event Event key.
	 * @return string
	 */
	public static function canonical_event_key( $event ) {
		$key = sanitize_key( (string) $event );
		if ( '' === $key ) {
			return '';
		}
		if ( class_exists( 'Webino_Dashboard_Sms_Order_Map', false ) ) {
			return Webino_Dashboard_Sms_Order_Map::normalize_event_key( $key );
		}
		return $key;
	}

	/**
	 * @param string $event Event key.
	 * @return array{title_customer:string,body_customer:string,title_admin:string,body_admin:string}
	 */
	public static function site_defaults( $event ) {
		$event = self::canonical_event_key( $event );
		$body  = self::customer_body( $event );
		return array(
			'title_customer' => self::customer_title( $event ),
			'body_customer'  => $body,
			'title_admin'    => self::admin_title( $event ),
			'body_admin'     => self::admin_body( $event ),
		);
	}

	/**
	 * @param string $event Event key.
	 * @return array{subject_customer:string,body_customer:string,subject_admin:string,body_admin:string}
	 */
	public static function email_defaults( $event ) {
		$event  = self::canonical_event_key( $event );
		$site   = self::site_defaults( $event );
		$is_ord = self::is_order_event( $event );
		return array(
			'subject_customer' => $is_ord
				? sprintf(
					/* translators: 1: order number, 2: site name */
					__( 'Order #%1$s update — %2$s', 'webino-dashboard' ),
					'{order_number}',
					'{site_name}'
				)
				: $site['title_customer'],
			'body_customer'    => '<p>' . esc_html( $site['body_customer'] ) . '</p>',
			'subject_admin'    => sprintf(
				/* translators: %s: site name */
				__( '[%s] Store notification', 'webino-dashboard' ),
				'{site_name}'
			),
			'body_admin'       => '<p>' . esc_html( $site['body_admin'] ) . '</p>',
		);
	}

	/**
	 * @param string $scope order_customer|order_admin.
	 * @param string $event Event key.
	 * @return string
	 */
	public static function bot_template( $scope, $event ) {
		$event = self::canonical_event_key( $event );
		if ( 'order_admin' === $scope ) {
			return self::admin_body( $event );
		}
		return self::customer_body( $event );
	}

	/**
	 * @param string $event Event key.
	 * @return string
	 */
	public static function sms_customer_template( $event ) {
		return self::customer_body( self::canonical_event_key( $event ) );
	}

	/**
	 * @param string $event Event key.
	 * @return string
	 */
	public static function sms_admin_template( $event ) {
		return self::admin_body( self::canonical_event_key( $event ) );
	}

	/**
	 * @param string $body Stored template body.
	 * @return bool
	 */
	public static function is_legacy_generic_sms_customer( $body ) {
		$body = trim( (string) $body );
		$legacy = array(
			'Order {order_id}: status updated to {status_label}.',
			__( 'Order {order_id}: status updated to {status_label}.', 'webinocrm' ),
		);
		return in_array( $body, $legacy, true );
	}

	/**
	 * @param string $body Stored template body.
	 * @param string $event_key Event key (for legacy sprintf pattern).
	 * @return bool
	 */
	public static function is_legacy_generic_sms_admin( $body, $event_key = '' ) {
		$body = trim( (string) $body );
		if ( '' === $body ) {
			return false;
		}
		if ( preg_match( '/^Admin alert — order \{order_number\} \(\{status_label\}\)\. Event:/', $body ) ) {
			return true;
		}
		$event_key = sanitize_key( (string) $event_key );
		if ( '' !== $event_key ) {
			$legacy = sprintf(
				__( 'Admin alert — order {order_number} ({status_label}). Event: %s', 'webinocrm' ),
				$event_key
			);
			if ( $body === $legacy ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param string $event Event key.
	 * @return bool
	 */
	private static function is_order_event( $event ) {
		return ! in_array(
			$event,
			array( 'stock-low', 'stock-out', 'user-welcome', 'comment-pending', 'cart-abandoned' ),
			true
		);
	}

	/**
	 * @param string $event Event key.
	 * @return string
	 */
	private static function customer_title( $event ) {
		switch ( $event ) {
			case 'stock-low':
			case 'stock-out':
				return 'موجودی {product_name}';
			case 'user-welcome':
				return 'خوش آمدید';
			case 'comment-pending':
				return 'دیدگاه جدید';
			case 'cart-abandoned':
				return 'سبد خرید رها شده';
			default:
				return 'سفارش شماره {order_number}';
		}
	}

	/**
	 * @param string $event Event key.
	 * @return string
	 */
	private static function admin_title( $event ) {
		switch ( $event ) {
			case 'stock-low':
			case 'stock-out':
				return 'هشدار موجودی';
			case 'comment-pending':
				return 'دیدگاه در انتظار تأیید';
			case 'user-welcome':
				return 'کاربر جدید';
			case 'cart-abandoned':
				return 'سبد خرید رها شده';
			default:
				return 'سفارش شماره {order_number}';
		}
	}

	/**
	 * @param string $event Event key.
	 * @return string
	 */
	private static function customer_body( $event ) {
		$map = array(
			'pending_on_create'   => 'سفارش شماره {order_number} ثبت شد و در انتظار پرداخت است. مبلغ: {order_total}',
			'pending_on_status'   => 'سفارش شماره {order_number} در انتظار پرداخت است.',
			'on-hold'             => 'سفارش شماره {order_number} در انتظار بررسی است.',
			'processing'          => 'سفارش شماره {order_number} در حال انجام است.',
			'packaged'            => 'سفارش شماره {order_number} بسته‌بندی شد.',
			'sent-to-warehouse'   => 'سفارش شماره {order_number} به انبار ارسال شد.',
			'courier'             => 'سفارش شماره {order_number} تحویل پیک شد.',
			'post'                => 'سفارش شماره {order_number} تحویل پست شد. کد رهگیری: {tracking_code}',
			'tipax'               => 'سفارش شماره {order_number} تحویل تیپاکس شد.',
			'completed'           => 'سفارش شماره {order_number} تکمیل شد.',
			'cancelled'           => 'سفارش شماره {order_number} لغو شد.',
			'failed'              => 'پرداخت سفارش شماره {order_number} ناموفق بود.',
			'refunded'            => 'مبلغ سفارش شماره {order_number} مسترد شد.',
			'checkout-draft'      => 'پیش‌نویس سفارش شماره {order_number} ثبت شد.',
			'cart-abandoned'      => 'سبد خرید شما در {site_name} هنوز تکمیل نشده است. برای تکمیل خرید برگردید.',
			'order-abandoned'     => 'سفارش شماره {order_number} هنوز پرداخت نشده است. مبلغ: {order_total}',
			'user-welcome'        => 'به {site_name} خوش آمدید! از خرید شما سپاسگزاریم.',
			'stock-low'           => 'موجودی محصول «{product_name}» رو به اتمام است.',
			'stock-out'           => 'محصول «{product_name}» ناموجود شد.',
			'comment-pending'     => 'دیدگاه جدیدی در انتظار تأیید شماست: {comment_excerpt}',
			'return-requested'    => 'درخواست مرجوعی سفارش {order_number} ثبت شد: {return_item} ×{return_qty}',
			'return-approved'     => 'مرجوعی سفارش {order_number} تأیید شد. {return_item}',
			'return-rejected'     => 'مرجوعی سفارش {order_number} رد شد.',
			'return-parcel-received' => 'مرسوله مرجوعی سفارش {order_number} دریافت شد.',
			'return-refund'       => 'مبلغ مرجوعی سفارش {order_number} مسترد شد.',
			'return-exchange'     => 'تعویض کالا برای سفارش {order_number} ثبت شد.',
		);
		if ( isset( $map[ $event ] ) ) {
			return $map[ $event ];
		}
		return 'سفارش شماره {order_number} به‌روزرسانی شد. وضعیت: {order_status}';
	}

	/**
	 * @param string $event Event key.
	 * @return string
	 */
	private static function admin_body( $event ) {
		switch ( $event ) {
			case 'stock-low':
				return 'موجودی محصول «{product_name}» کم است.';
			case 'stock-out':
				return 'محصول «{product_name}» ناموجود شد.';
			case 'comment-pending':
				return 'دیدگاه جدید در انتظار تأیید: {comment_excerpt}';
			case 'user-welcome':
				return 'کاربر جدید در {site_name} ثبت‌نام کرد: {customer_name}';
			case 'cart-abandoned':
				return 'سبد خرید رها شده — مشتری: {customer_name}';
			case 'pending_on_create':
				return 'سفارش جدید شماره {order_number} از {customer_name} — در انتظار پرداخت. مبلغ: {order_total}';
			case 'return-requested':
				return 'درخواست مرجوعی سفارش {order_number} — {return_item} ×{return_qty}. دلیل: {return_reason}';
			case 'return-approved':
			case 'return-rejected':
			case 'return-parcel-received':
			case 'return-refund':
			case 'return-exchange':
				return 'مرجوعی سفارش {order_number} — {return_status}. {return_item}';
			default:
				if ( self::is_order_event( $event ) ) {
					return 'سفارش شماره {order_number} از {customer_name} — وضعیت: {order_status}. مبلغ: {order_total}';
				}
				return 'اعلان فروشگاه — رویداد: ' . $event;
		}
	}
}
