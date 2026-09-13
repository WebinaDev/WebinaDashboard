<?php
/**
 * Tapin HTTP client — full public v2 surface from docs.tapin.ir.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Thin wrapper around Tapin / Posteketab public v2 endpoints.
 */
class Webino_Tapin_Client {

	const PUBLIC_TREE = 'https://public.api.tapin.ir/api/v1/public/state/tree/';

	/**
	 * @return string
	 */
	public static function base_url() {
		$host = Webino_Tapin_Settings::is_posteketab() ? 'posteketab.com' : 'tapin.ir';
		return 'https://api.' . $host . '/api/v2/public';
	}

	/**
	 * Current shop_id from settings.
	 *
	 * @return string
	 */
	public static function shop_id() {
		$s = Webino_Tapin_Settings::get();
		return (string) ( $s['shop_id'] ?? '' );
	}

	/**
	 * Merge shop_id into payload when missing.
	 *
	 * @param array<string, mixed> $payload Payload.
	 * @return array<string, mixed>
	 */
	public static function with_shop( $payload = array() ) {
		if ( ! is_array( $payload ) ) {
			$payload = array();
		}
		if ( empty( $payload['shop_id'] ) ) {
			$payload['shop_id'] = self::shop_id();
		}
		return $payload;
	}

	/**
	 * @param string               $path Relative path under BASE (or absolute URL).
	 * @param array<string, mixed> $body JSON body.
	 * @param string               $method HTTP method.
	 * @return array{ok:bool,status:int,message:string,entries:mixed,raw?:array}
	 */
	public static function request( $path, $body = array(), $method = 'POST' ) {
		$settings = Webino_Tapin_Settings::get();
		$token    = (string) $settings['token'];
		$url      = 0 === strpos( $path, 'http' ) ? $path : trailingslashit( self::base_url() ) . ltrim( $path, '/' );
		// Keep path params like {order_id} endings without forcing slash mid-token; still prefer trailing slash for dirs.
		if ( '/' !== substr( $url, -1 ) && false === strpos( $url, '?' ) && ! preg_match( '/\{[^}]+\}$/', $path ) ) {
			$url .= '/';
		}

		$method = strtoupper( (string) $method );
		$args   = array(
			'timeout' => 60,
			'method'  => $method,
			'headers' => array(
				'Content-Type' => 'application/json',
				'Accept'       => 'application/json',
			),
		);
		if ( 'GET' !== $method && 'HEAD' !== $method ) {
			$args['body'] = wp_json_encode( is_array( $body ) ? $body : array() );
		} elseif ( is_array( $body ) && $body ) {
			$url = add_query_arg( $body, $url );
		}
		if ( '' !== $token ) {
			$args['headers']['Authorization'] = $token;
		}

		$response = wp_remote_request( $url, $args );
		if ( is_wp_error( $response ) ) {
			return array(
				'ok'      => false,
				'status'  => 0,
				'message' => __( 'اتصال به سرویس ارسال برقرار نشد. لطفاً دوباره تلاش کنید.', 'webino-dashboard' ),
				'entries' => null,
			);
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$raw  = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $raw ) ) {
			// Some label endpoints return raw HTML.
			$body_raw = (string) wp_remote_retrieve_body( $response );
			if ( $code >= 200 && $code < 300 && '' !== $body_raw && false !== stripos( $body_raw, '<html' ) ) {
				return array(
					'ok'      => true,
					'status'  => $code,
					'message' => __( 'انجام شد.', 'webino-dashboard' ),
					'entries' => array( 'html' => $body_raw ),
					'raw'     => array( 'html' => $body_raw ),
				);
			}
			return array(
				'ok'      => false,
				'status'  => $code,
				'message' => __( 'پاسخ سرویس ارسال نامعتبر بود.', 'webino-dashboard' ),
				'entries' => null,
			);
		}

		$returns = isset( $raw['returns'] ) && is_array( $raw['returns'] ) ? $raw['returns'] : array();
		$api_st  = isset( $returns['status'] ) ? (int) $returns['status'] : $code;
		$msg     = isset( $returns['message'] ) ? (string) $returns['message'] : '';
		$ok      = ( 200 === $api_st || 201 === $api_st );

		if ( ! $ok && '' === $msg ) {
			$msg = __( 'انجام عملیات ممکن نشد.', 'webino-dashboard' );
		}
		if ( $ok && '' === $msg ) {
			$msg = __( 'انجام شد.', 'webino-dashboard' );
		}

		return array(
			'ok'      => $ok,
			'status'  => $api_st,
			'message' => self::humanize_message( $msg, $api_st ),
			'entries' => $raw['entries'] ?? null,
			'raw'     => $raw,
		);
	}

	/**
	 * @param string $message API message.
	 * @param int    $status  API status.
	 * @return string
	 */
	private static function humanize_message( $message, $status ) {
		$map = array(
			303 => __( 'شهر انتخاب‌شده پیدا نشد.', 'webino-dashboard' ),
			304 => __( 'استان انتخاب‌شده پیدا نشد.', 'webino-dashboard' ),
			405 => __( 'این روش ارسال برای فروشگاه شما فعال نیست.', 'webino-dashboard' ),
			502 => __( 'استان یا شهر مقصد درست نیست.', 'webino-dashboard' ),
			503 => __( 'ارسال به این مقصد ممکن نیست.', 'webino-dashboard' ),
			802 => __( 'روش ارسال انتخاب‌شده معتبر نیست.', 'webino-dashboard' ),
			803 => __( 'روش پرداخت ارسال معتبر نیست.', 'webino-dashboard' ),
		);
		if ( isset( $map[ $status ] ) ) {
			return $map[ $status ];
		}
		$clean = preg_replace( '/\b(api|endpoint|http|curl|json)\b/i', '', $message );
		$clean = trim( (string) $clean );
		return '' !== $clean ? $clean : $message;
	}

	/* ——— Shops ——— */

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function shop_list( $payload = array() ) {
		return self::request( 'shop/list', is_array( $payload ) ? $payload : array() );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function shop_detail( $payload = array() ) {
		return self::request( 'shop/detail', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function shop_create( $payload ) {
		return self::request( 'shop/create', is_array( $payload ) ? $payload : array() );
	}

	/* ——— Locations ——— */

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function state_tree() {
		$res = self::request( 'state/tree', array() );
		if ( $res['ok'] && ! empty( $res['entries'] ) ) {
			return $res;
		}
		$response = wp_remote_get(
			self::PUBLIC_TREE,
			array(
				'timeout' => 45,
				'headers' => array( 'Accept' => 'application/json' ),
			)
		);
		if ( is_wp_error( $response ) ) {
			return $res;
		}
		$raw = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $raw ) ) {
			return $res;
		}
		$returns = isset( $raw['returns'] ) && is_array( $raw['returns'] ) ? $raw['returns'] : array();
		$ok      = isset( $returns['status'] ) && 200 === (int) $returns['status'];
		return array(
			'ok'      => $ok,
			'status'  => (int) ( $returns['status'] ?? 0 ),
			'message' => $ok ? __( 'لیست استان‌ها به‌روز شد.', 'webino-dashboard' ) : (string) ( $returns['message'] ?? '' ),
			'entries' => $raw['entries'] ?? null,
		);
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function city_list( $payload = array() ) {
		return self::request( 'city/list', is_array( $payload ) ? $payload : array() );
	}

	/* ——— Finance ——— */

	/**
	 * Cached credit amount or null.
	 *
	 * @param bool $force Bypass cache.
	 * @return float|null
	 */
	public static function credit_amount( $force = false ) {
		if ( ! $force ) {
			$cached = get_transient( 'webino_tapin_credit' );
			if ( false !== $cached && is_numeric( $cached ) ) {
				return ( (float) $cached >= 0 ) ? (float) $cached : null;
			}
		}
		$res    = self::request( 'transaction/credit/', self::with_shop() );
		$amount = null;
		if ( $res['ok'] && is_array( $res['entries'] ) ) {
			foreach ( array( 'credit', 'amount', 'balance', 'wallet' ) as $k ) {
				if ( isset( $res['entries'][ $k ] ) && is_numeric( $res['entries'][ $k ] ) ) {
					$amount = (float) $res['entries'][ $k ];
					break;
				}
			}
		}
		if ( null !== $amount ) {
			set_transient( 'webino_tapin_credit', $amount, 5 * MINUTE_IN_SECONDS );
		} else {
			set_transient( 'webino_tapin_credit', -1, 14 * MINUTE_IN_SECONDS );
		}
		return ( null !== $amount && $amount >= 0 ) ? $amount : null;
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function credit_topup_start( $payload ) {
		delete_transient( 'webino_tapin_credit' );
		return self::request( 'transaction/indirect/new/', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function credit_increase_list( $payload = array() ) {
		$payload = self::with_shop( $payload );
		if ( empty( $payload['count'] ) ) {
			$payload['count'] = 20;
		}
		if ( empty( $payload['page'] ) ) {
			$payload['page'] = 1;
		}
		return self::request( 'transaction/online-increase-credit/list/', $payload );
	}

	/* ——— Orders ——— */

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function check_price( $payload ) {
		$payload = self::with_shop( $payload );
		$res     = self::request( 'order/post/check-price', $payload );
		if ( $res['ok'] ) {
			return $res;
		}
		return self::request( 'order/post/price/check', $payload );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function register_order( $payload ) {
		return self::request( 'order/post/register', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function edit_order( $payload ) {
		return self::request( 'order/post/edit', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function order_detail( $payload ) {
		return self::request( 'order/post/detail', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function order_list( $payload = array() ) {
		return self::request( 'order/post/list', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function kiosk_list( $payload = array() ) {
		return self::request( 'order/post/kiosk', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function packing_boxes( $payload = array() ) {
		return self::request( 'order/post/packing-box', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function change_status( $payload ) {
		return self::request( 'order/post/change-status', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function change_status_bulk( $payload ) {
		return self::request( 'order/post/change-status/bulk', is_array( $payload ) ? $payload : array() );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function get_status_bulk( $payload ) {
		return self::request( 'order/post/get-status/bulk', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function get_status_report( $payload ) {
		return self::request( 'order/post/get-status/report', is_array( $payload ) ? $payload : array() );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function change_status_report( $payload = array() ) {
		return self::request( 'order/post/change-status/report', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function change_status_report_last( $payload = array() ) {
		return self::request( 'order/post/change-status/report/last-change-status', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function label_html( $payload ) {
		return self::request( 'order/post/detail/html', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function label_html_bulk( $payload ) {
		return self::request( 'order/post/detail/html/bulk', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function detail_label( $payload ) {
		return self::request( 'order/post/detail/label', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function detail_label_date( $payload ) {
		return self::request( 'order/post/detail/label/date', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function barcode_html( $payload ) {
		return self::request( 'order/post/barcode/html', self::with_shop( $payload ) );
	}

	/**
	 * @param string|int $order_id Tapin order id.
	 * @return array{ok:bool,status:int,message:string,entries:mixed}
	 */
	public static function detail_list_html( $order_id ) {
		$path = 'order/post/detail/list/html/' . rawurlencode( (string) $order_id );
		return self::request( $path, self::with_shop(), 'GET' );
	}

	/* ——— Products ——— */

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function product_list( $payload = array() ) {
		$payload = self::with_shop( $payload );
		if ( empty( $payload['count'] ) ) {
			$payload['count'] = 50;
		}
		if ( empty( $payload['page'] ) ) {
			$payload['page'] = 1;
		}
		return self::request( 'product/list', $payload );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function product_create( $payload ) {
		return self::request( 'product/create', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function product_update( $payload ) {
		return self::request( 'product/update', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function product_delete( $payload ) {
		return self::request( 'product/delete', self::with_shop( $payload ) );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function product_category_list( $payload = array() ) {
		$payload = self::with_shop( $payload );
		if ( empty( $payload['count'] ) ) {
			$payload['count'] = 50;
		}
		if ( empty( $payload['page'] ) ) {
			$payload['page'] = 1;
		}
		return self::request( 'product/category/list', $payload );
	}

	/* ——— Customers ——— */

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function customer_list( $payload = array() ) {
		$payload = self::with_shop( $payload );
		if ( empty( $payload['count'] ) ) {
			$payload['count'] = 50;
		}
		if ( empty( $payload['page'] ) ) {
			$payload['page'] = 1;
		}
		return self::request( 'customer/list', $payload );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function customer_category_list( $payload = array() ) {
		$payload = self::with_shop( $payload );
		if ( empty( $payload['count'] ) ) {
			$payload['count'] = 50;
		}
		if ( empty( $payload['page'] ) ) {
			$payload['page'] = 1;
		}
		return self::request( 'customer/category/list', $payload );
	}

	/* ——— Employees ——— */

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function employee_list( $payload = array() ) {
		$payload = self::with_shop( $payload );
		if ( empty( $payload['count'] ) ) {
			$payload['count'] = 50;
		}
		if ( empty( $payload['page'] ) ) {
			$payload['page'] = 1;
		}
		return self::request( 'employee/list', $payload );
	}

	/* ——— Tasks ——— */

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function task_list( $payload = array() ) {
		if ( empty( $payload['count'] ) ) {
			$payload['count'] = 20;
		}
		if ( empty( $payload['page'] ) ) {
			$payload['page'] = 1;
		}
		return self::request( 'task/list', is_array( $payload ) ? $payload : array() );
	}

	/** @return array{ok:bool,status:int,message:string,entries:mixed} */
	public static function task_detail( $payload ) {
		return self::request( 'task/detail', is_array( $payload ) ? $payload : array() );
	}

	/**
	 * Extract HTML string from various Tapin label responses.
	 *
	 * @param mixed $entries Entries.
	 * @return string
	 */
	public static function extract_html( $entries ) {
		if ( is_string( $entries ) && '' !== $entries ) {
			return $entries;
		}
		if ( ! is_array( $entries ) ) {
			return '';
		}
		foreach ( array( 'html', 'content', 'label', 'data' ) as $k ) {
			if ( ! empty( $entries[ $k ] ) && is_string( $entries[ $k ] ) ) {
				return $entries[ $k ];
			}
		}
		if ( isset( $entries['list'] ) && is_array( $entries['list'] ) ) {
			$chunks = array();
			foreach ( $entries['list'] as $row ) {
				if ( is_string( $row ) ) {
					$chunks[] = $row;
				} elseif ( is_array( $row ) ) {
					$h = self::extract_html( $row );
					if ( $h ) {
						$chunks[] = $h;
					}
				}
			}
			return implode( "\n", $chunks );
		}
		return '';
	}
}
