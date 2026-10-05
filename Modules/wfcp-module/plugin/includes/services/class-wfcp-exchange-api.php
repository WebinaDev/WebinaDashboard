<?php
/**
 * Exchange Rate API Service
 *
 * @package    WFCP
 * @subpackage WFCP/includes/services
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Exchange Rate API Service
 */
class WFCP_Exchange_API {

	/**
	 * API Base URL (Free Version)
	 */
	const API_BASE_URL = 'https://BrsApi.ir/Api/Market/Gold_Currency.php';

	/**
	 * Get exchange rate from API
	 *
	 * @param string $api_key  API Key.
	 * @param string $symbol   Currency symbol (USD, EUR, etc.).
	 * @return array|false     Array with 'price' and 'success', or false on error.
	 */
	public static function get_exchange_rate( $api_key, $symbol = 'USD' ) {
		if ( empty( $api_key ) ) {
			return array(
				'success' => false,
				'message' => __( 'API Key وارد نشده است', 'webina-woo-core' ),
			);
		}

		$url = add_query_arg(
			array(
				'key' => sanitize_text_field( $api_key ),
			),
			self::API_BASE_URL
		);

		$response = wp_remote_get(
			$url,
			array(
				'timeout'     => 10,
				'sslverify'   => true,
				'httpversion' => '1.1',
			)
		);

		if ( is_wp_error( $response ) ) {
			return array(
				'success' => false,
				'message' => $response->get_error_message(),
			);
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		// Check if response is valid
		if ( ! $data || ! is_array( $data ) ) {
			return array(
				'success' => false,
				'message' => __( 'پاسخ نامعتبر از API دریافت شد', 'webina-woo-core' ),
			);
		}

		// Check for error messages first
		if ( isset( $data['message_error'] ) && ! empty( $data['message_error'] ) ) {
			return array(
				'success' => false,
				'message' => $data['message_error'],
			);
		}

		// Free API returns data in structure: { "gold": [...], "currency": [...], "cryptocurrency": [...] }
		// We need to search in the 'currency' array
		$currency_data = null;
		
		if ( isset( $data['currency'] ) && is_array( $data['currency'] ) ) {
			// Search in currency array
			foreach ( $data['currency'] as $item ) {
				if ( is_array( $item ) && isset( $item['symbol'] ) && $item['symbol'] === $symbol ) {
					$currency_data = $item;
					break;
				}
			}
		} elseif ( isset( $data['data'] ) && is_array( $data['data'] ) ) {
			// Pro structure (wrapped in 'data' key)
			foreach ( $data['data'] as $item ) {
				if ( is_array( $item ) && isset( $item['symbol'] ) && $item['symbol'] === $symbol ) {
					$currency_data = $item;
					break;
				}
			}
		} else {
			// Try direct array structure
			foreach ( $data as $item ) {
				if ( is_array( $item ) && isset( $item['symbol'] ) && $item['symbol'] === $symbol ) {
					$currency_data = $item;
					break;
				}
			}
		}

		if ( ! $currency_data || ! isset( $currency_data['price'] ) ) {
			return array(
				'success' => false,
				'message' => sprintf( __( 'نماد %s یافت نشد. لطفاً مطمئن شوید که API Key معتبر است و نماد ارز صحیح است.', 'webina-woo-core' ), $symbol ),
			);
		}

		$price = floatval( $currency_data['price'] );
		
		// API returns price in Toman, no conversion needed
		// The price is already in the correct unit

		return array(
			'success' => true,
			'price'   => $price,
			'data'    => $currency_data,
		);
	}

	/**
	 * Update exchange rate from API
	 *
	 * @return array Result array with success status and message.
	 */
	public static function update_exchange_rate() {
		$general = WFCP_Helper::get_settings( 'general' );
		
		if ( ! isset( $general['api_enabled'] ) || ! $general['api_enabled'] ) {
			return array(
				'success' => false,
				'message' => __( 'API فعال نیست', 'webina-woo-core' ),
			);
		}

		$api_key = isset( $general['api_key'] ) ? $general['api_key'] : '';
		$symbol  = isset( $general['api_symbol'] ) ? $general['api_symbol'] : 'USD';

		$result = self::get_exchange_rate( $api_key, $symbol );

		if ( $result['success'] ) {
			// Update exchange rate (price is already in Toman from API)
			$general['exchange_rate'] = $result['price'];
			$general['last_api_update'] = self::get_persian_date_time();
			WFCP_Helper::update_settings( 'general', $general );

			// Clear price transients to force recalculation
			WFCP_Batch_Process::delete_transients();

			// Queue batched WooCommerce price sync (simple, external, variations).
			$queued = WFCP_Batch_Process::queue_recalculate( false );
			if ( is_wp_error( $queued ) ) {
				// Exchange rate still saved; price sync can be retried manually.
				return array(
					'success' => true,
					'message' => sprintf(
						__( 'نرخ ارز با موفقیت به‌روزرسانی شد: %s (همگام‌سازی قیمت در صف قرار نگرفت: %s)', 'webina-woo-core' ),
						number_format_i18n( $result['price'], 0 ),
						$queued->get_error_message()
					),
					'price'   => $result['price'],
				);
			}

			return array(
				'success' => true,
				'message' => sprintf( __( 'نرخ ارز با موفقیت به‌روزرسانی شد: %s', 'webina-woo-core' ), number_format_i18n( $result['price'], 0 ) ),
				'price'   => $result['price'],
			);
		}

		return $result;
	}

	/**
	 * Convert Gregorian date to Persian (Shamsi) date
	 *
	 * @param string $format Date format (default: 'Y/m/d H:i:s').
	 * @return string Persian date string.
	 */
	public static function get_persian_date_time( $format = 'Y/m/d H:i:s' ) {
		$timestamp = current_time( 'timestamp' );
		
		// Convert timestamp to Persian date
		$g_y = date( 'Y', $timestamp );
		$g_m = date( 'm', $timestamp );
		$g_d = date( 'd', $timestamp );
		$g_h = date( 'H', $timestamp );
		$g_i = date( 'i', $timestamp );
		$g_s = date( 's', $timestamp );
		
		// Convert Gregorian to Persian
		$pdate = self::gregorian_to_persian( $g_y, $g_m, $g_d );
		
		// Format the date
		$result = str_replace(
			array( 'Y', 'm', 'd', 'H', 'i', 's' ),
			array(
				str_pad( $pdate['year'], 4, '0', STR_PAD_LEFT ),
				str_pad( $pdate['month'], 2, '0', STR_PAD_LEFT ),
				str_pad( $pdate['day'], 2, '0', STR_PAD_LEFT ),
				str_pad( $g_h, 2, '0', STR_PAD_LEFT ),
				str_pad( $g_i, 2, '0', STR_PAD_LEFT ),
				str_pad( $g_s, 2, '0', STR_PAD_LEFT ),
			),
			$format
		);
		
		return $result;
	}

	/**
	 * Convert Gregorian date to Persian (Jalali) date
	 *
	 * @param int $g_y Gregorian year.
	 * @param int $g_m Gregorian month.
	 * @param int $g_d Gregorian day.
	 * @return array Persian date array with 'year', 'month', 'day'.
	 */
	private static function gregorian_to_persian( $g_y, $g_m, $g_d ) {
		$g_days_in_month = array( 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 );
		$j_days_in_month = array( 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29 );
		
		$gy = $g_y - 1600;
		$gm = $g_m - 1;
		$gd = $g_d - 1;
		
		$g_day_no = 365 * $gy + (int)( ( $gy + 3 ) / 4 ) - (int)( ( $gy + 99 ) / 100 ) + (int)( ( $gy + 399 ) / 400 ) - 80 + $gd;
		
		for ( $i = 0; $i < $gm; $i++ ) {
			$g_day_no += $g_days_in_month[ $i ];
		}
		
		if ( $gm > 1 && ( ( $gy % 4 === 0 && $gy % 100 !== 0 ) || ( $gy % 400 === 0 ) ) ) {
			$g_day_no++;
		}
		
		$j_day_no = $g_day_no - 79;
		$j_np = (int)( $j_day_no / 12053 );
		$j_day_no = $j_day_no % 12053;
		
		$jy = 979 + 33 * $j_np + 4 * (int)( $j_day_no / 1461 );
		$j_day_no %= 1461;
		
		if ( $j_day_no >= 366 ) {
			$jy += (int)( ( $j_day_no - 1 ) / 365 );
			$j_day_no = ( $j_day_no - 1 ) % 365;
		}
		
		$j = 0;
		for ( $i = 0; $i < 11 && $j_day_no >= $j_days_in_month[ $i ]; $i++ ) {
			$j_day_no -= $j_days_in_month[ $i ];
			$j++;
		}
		
		$jm = $j + 1;
		$jd = $j_day_no + 1;
		
		return array(
			'year'  => $jy,
			'month' => $jm,
			'day'   => $jd,
		);
	}
}

