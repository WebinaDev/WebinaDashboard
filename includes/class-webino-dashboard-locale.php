<?php
/**
 * Persian digit and Jalali date helpers for dashboard HTML output.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Locale formatting for print documents and HTML display.
 */
class Webino_Dashboard_Locale {

	/**
	 * @var string
	 */
	private static $request_locale = '';

	/**
	 * @var array<int, string>
	 */
	private static $western_digits = array( '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' );

	/**
	 * @var array<int, string>
	 */
	private static $persian_digits = array( '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹' );

	/**
	 * @var array<int, string>
	 */
	private static $jalali_months = array(
		1  => 'فروردین',
		2  => 'اردیبهشت',
		3  => 'خرداد',
		4  => 'تیر',
		5  => 'مرداد',
		6  => 'شهریور',
		7  => 'مهر',
		8  => 'آبان',
		9  => 'آذر',
		10 => 'دی',
		11 => 'بهمن',
		12 => 'اسفند',
	);

	/**
	 * @param string $locale Locale string.
	 * @return void
	 */
	public static function set_request_locale( $locale ) {
		self::$request_locale = self::normalize_locale( $locale );
	}

	/**
	 * @return void
	 */
	public static function clear_request_locale() {
		self::$request_locale = '';
	}

	/**
	 * @param string $locale Raw locale.
	 * @return string
	 */
	public static function normalize_locale( $locale ) {
		if ( class_exists( 'Webino_Dashboard_I18n', false ) ) {
			return Webino_Dashboard_I18n::normalize_locale( $locale );
		}
		$locale = (string) $locale;
		if ( 'fa' === $locale || 0 === strpos( $locale, 'fa' ) ) {
			return 'fa_IR';
		}
		if ( 'en' === $locale || 0 === strpos( $locale, 'en' ) ) {
			return 'en_US';
		}
		return $locale;
	}

	/**
	 * @param string|null $locale Optional explicit locale.
	 * @return string
	 */
	public static function resolve_locale( $locale = null ) {
		if ( null !== $locale && '' !== (string) $locale ) {
			return self::normalize_locale( (string) $locale );
		}
		if ( '' !== self::$request_locale ) {
			return self::$request_locale;
		}
		if ( class_exists( 'Webino_Dashboard_I18n', false ) ) {
			return Webino_Dashboard_I18n::get_user_locale();
		}
		return self::normalize_locale( function_exists( 'determine_locale' ) ? determine_locale() : get_locale() );
	}

	/**
	 * @param string|null $locale Locale.
	 * @return string
	 */
	public static function list_separator( $locale = null ) {
		return self::is_jalali_locale( self::resolve_locale( $locale ) ) ? '، ' : ', ';
	}

	/**
	 * Convert Western digits to Persian when locale is Jalali.
	 *
	 * @param string      $s      Input.
	 * @param string|null $locale Locale.
	 * @return string
	 */
	public static function to_persian_digits( $s, $locale = null ) {
		$s = (string) $s;
		if ( ! self::is_jalali_locale( self::resolve_locale( $locale ) ) ) {
			return $s;
		}
		return str_replace( self::$western_digits, self::$persian_digits, $s );
	}

	/**
	 * Localize user-facing display text for print/HTML.
	 *
	 * @param string      $s      Input.
	 * @param string|null $locale Locale.
	 * @return string
	 */
	public static function localize_display( $s, $locale = null ) {
		return self::to_persian_digits( (string) $s, $locale );
	}

	/**
	 * Format number for print documents.
	 *
	 * @param float       $amount   Amount.
	 * @param int|null    $decimals Decimal places.
	 * @param string|null $locale   Locale.
	 * @return string
	 */
	public static function format_number( $amount, $decimals = null, $locale = null ) {
		if ( null === $decimals && function_exists( 'wc_get_price_decimals' ) ) {
			$decimals = wc_get_price_decimals();
		}
		if ( null === $decimals ) {
			$decimals = 0;
		}
		$formatted = number_format_i18n( (float) $amount, (int) $decimals );
		return self::to_persian_digits( $formatted, $locale );
	}

	/**
	 * @param int $gy Gregorian year.
	 * @param int $gm Gregorian month.
	 * @param int $gd Gregorian day.
	 * @return array{0:int,1:int,2:int}
	 */
	private static function gregorian_to_jalali( $gy, $gm, $gd ) {
		$g_d_m = array( 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 );
		if ( $gy > 1600 ) {
			$jy = 979;
			$gy -= 1600;
		} else {
			$jy = 0;
			$gy -= 621;
		}
		$gy2  = ( $gm > 2 ) ? ( $gy + 1 ) : $gy;
		$days = ( 365 * $gy ) + ( (int) ( ( $gy2 + 3 ) / 4 ) ) - ( (int) ( ( $gy2 + 99 ) / 100 ) ) + ( (int) ( ( $gy2 + 399 ) / 400 ) ) - 80 + $gd + $g_d_m[ $gm - 1 ];
		$jy  += 33 * ( (int) ( $days / 12053 ) );
		$days %= 12053;
		$jy   += 4 * ( (int) ( $days / 1461 ) );
		$days %= 1461;
		if ( $days > 365 ) {
			$jy  += (int) ( ( $days - 1 ) / 365 );
			$days = ( $days - 1 ) % 365;
		}
		if ( $days < 186 ) {
			$jm = 1 + (int) ( $days / 31 );
			$jd = 1 + ( $days % 31 );
		} else {
			$jm = 7 + (int) ( ( $days - 186 ) / 30 );
			$jd = 1 + ( ( $days - 186 ) % 30 );
		}
		return array( $jy, $jm, $jd );
	}

	/**
	 * Jalali date label e.g. ۲۷ فروردین ۱۴۰۵.
	 *
	 * @param int $gy Gregorian year.
	 * @param int $gm Gregorian month.
	 * @param int $gd Gregorian day.
	 * @return string
	 */
	public static function format_jalali_date_label( $gy, $gm, $gd ) {
		list( $jy, $jm, $jd ) = self::gregorian_to_jalali( (int) $gy, (int) $gm, (int) $gd );
		$month = isset( self::$jalali_months[ $jm ] ) ? self::$jalali_months[ $jm ] : '';
		return trim(
			self::to_persian_digits( (string) $jd ) . ' ' . $month . ' ' . self::to_persian_digits( (string) $jy )
		);
	}

	/**
	 * Short Jalali date YYYY/MM/DD with Persian digits.
	 *
	 * @param int $gy Gregorian year.
	 * @param int $gm Gregorian month.
	 * @param int $gd Gregorian day.
	 * @return string
	 */
	public static function format_jalali_date_short( $gy, $gm, $gd ) {
		list( $jy, $jm, $jd ) = self::gregorian_to_jalali( (int) $gy, (int) $gm, (int) $gd );
		return self::to_persian_digits(
			sprintf( '%04d/%02d/%02d', $jy, $jm, $jd )
		);
	}

	/**
	 * 24-hour time with Persian digits.
	 *
	 * @param int $hour24 Hour.
	 * @param int $minute Minute.
	 * @return string
	 */
	public static function format_time_24_persian( $hour24, $minute ) {
		$s = sprintf( '%d:%02d', max( 0, min( 23, (int) $hour24 ) ), max( 0, min( 59, (int) $minute ) ) );
		return self::to_persian_digits( $s );
	}

	/**
	 * Format WC order datetime for print (Jalali date + Persian time).
	 *
	 * @param \WC_DateTime|\DateTimeInterface|null $wc_date Order date.
	 * @return string
	 */
	public static function format_order_datetime( $wc_date, $locale = null ) {
		if ( ! $wc_date ) {
			return '';
		}
		$locale = self::resolve_locale( $locale );
		if ( ! self::is_jalali_locale( $locale ) ) {
			$ts = 0;
			if ( $wc_date instanceof \WC_DateTime && method_exists( $wc_date, 'getTimestamp' ) ) {
				$ts = (int) $wc_date->getTimestamp();
			} elseif ( $wc_date instanceof \DateTimeInterface ) {
				$ts = (int) $wc_date->getTimestamp();
			}
			if ( $ts <= 0 ) {
				return '';
			}
			$date_format = get_option( 'date_format', 'Y-m-d' );
			$time_format = get_option( 'time_format', 'H:i' );
			if ( function_exists( 'wp_date' ) ) {
				return wp_date( trim( $date_format . ' ' . $time_format ), $ts );
			}
			return gmdate( trim( $date_format . ' ' . $time_format ), $ts );
		}
		if ( $wc_date instanceof \WC_DateTime && method_exists( $wc_date, 'date' ) ) {
			$y  = (int) $wc_date->date( 'Y' );
			$m  = (int) $wc_date->date( 'n' );
			$d  = (int) $wc_date->date( 'j' );
			$gh = (int) $wc_date->date( 'G' );
			$gm = (int) $wc_date->date( 'i' );
		} elseif ( $wc_date instanceof \DateTimeInterface ) {
			$y  = (int) $wc_date->format( 'Y' );
			$m  = (int) $wc_date->format( 'n' );
			$d  = (int) $wc_date->format( 'j' );
			$gh = (int) $wc_date->format( 'G' );
			$gm = (int) $wc_date->format( 'i' );
		} else {
			return '';
		}
		$date = self::format_jalali_date_label( $y, $m, $d );
		$time = self::format_time_24_persian( $gh, $gm );
		return trim( $date . ' ' . $time );
	}

	/**
	 * Format WC order date only for receipt (short Jalali).
	 *
	 * @param \WC_DateTime|\DateTimeInterface|null $wc_date Order date.
	 * @return string
	 */
	public static function format_order_date_short( $wc_date, $locale = null ) {
		if ( ! $wc_date ) {
			return '';
		}
		$locale = self::resolve_locale( $locale );
		if ( ! self::is_jalali_locale( $locale ) ) {
			$ts = 0;
			if ( $wc_date instanceof \WC_DateTime && method_exists( $wc_date, 'getTimestamp' ) ) {
				$ts = (int) $wc_date->getTimestamp();
			} elseif ( $wc_date instanceof \DateTimeInterface ) {
				$ts = (int) $wc_date->getTimestamp();
			}
			if ( $ts <= 0 ) {
				return '';
			}
			if ( function_exists( 'wp_date' ) ) {
				return wp_date( 'Y/m/d', $ts );
			}
			return gmdate( 'Y/m/d', $ts );
		}
		if ( $wc_date instanceof \WC_DateTime && method_exists( $wc_date, 'date' ) ) {
			$y = (int) $wc_date->date( 'Y' );
			$m = (int) $wc_date->date( 'n' );
			$d = (int) $wc_date->date( 'j' );
		} elseif ( $wc_date instanceof \DateTimeInterface ) {
			$y = (int) $wc_date->format( 'Y' );
			$m = (int) $wc_date->format( 'n' );
			$d = (int) $wc_date->format( 'j' );
		} else {
			return '';
		}
		return self::format_jalali_date_short( $y, $m, $d );
	}

	/**
	 * Whether locale should use Jalali calendar month boundaries.
	 *
	 * @param string $locale Dashboard or WP locale.
	 * @return bool
	 */
	public static function is_jalali_locale( $locale ) {
		$locale = (string) $locale;
		return 'fa' === $locale || 0 === strpos( $locale, 'fa' );
	}

	/**
	 * @param int $jy Jalali year.
	 * @param int $jm Jalali month.
	 * @param int $jd Jalali day.
	 * @return array{0:int,1:int,2:int} Gregorian y,m,d.
	 */
	public static function jalali_to_gregorian( $jy, $jm, $jd ) {
		$jy = (int) $jy;
		$jm = (int) $jm;
		$jd = (int) $jd;
		$jy  += 1595;
		$days = -355668 + ( 365 * $jy ) + ( (int) ( $jy / 33 ) * 8 ) + ( (int) ( ( ( $jy % 33 ) + 3 ) / 4 ) ) + $jd + ( ( $jm < 7 ) ? ( ( $jm - 1 ) * 31 ) : ( ( ( $jm - 7 ) * 30 ) + 186 ) );
		$gy   = 400 * ( (int) ( $days / 146097 ) );
		$days = $days % 146097;
		if ( $days > 36524 ) {
			$gy   += 100 * ( (int) ( ( --$days ) / 36524 ) );
			$days  = $days % 36524;
			if ( $days >= 365 ) {
				++$days;
			}
		}
		$gy   += 4 * ( (int) ( $days / 1461 ) );
		$days  = $days % 1461;
		if ( $days > 365 ) {
			$gy   += (int) ( ( $days - 1 ) / 365 );
			$days  = ( $days - 1 ) % 365;
		}
		$gd    = $days + 1;
		$sal_a = array( 0, 31, ( ( ( $gy % 4 ) === 0 && ( $gy % 100 ) !== 0 ) || ( ( $gy % 400 ) === 0 ) ) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 );
		$gm    = 0;
		while ( $gm < 13 && $gd > $sal_a[ $gm ] ) {
			$gd -= $sal_a[ $gm ];
			++$gm;
		}
		return array( $gy, $gm, $gd );
	}

	/**
	 * Unix timestamp for start of current calendar month (Jalali for fa*, Gregorian otherwise).
	 *
	 * @param string $locale Dashboard or WP locale.
	 * @return int
	 */
	public static function calendar_month_start_ts( $locale = '' ) {
		$tz  = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );
		$now = new DateTimeImmutable( 'now', $tz );

		if ( self::is_jalali_locale( $locale ) ) {
			$gy = (int) $now->format( 'Y' );
			$gm = (int) $now->format( 'n' );
			$gd = (int) $now->format( 'j' );
			list( $jy, $jm ) = self::gregorian_to_jalali( $gy, $gm, $gd );
			list( $gy2, $gm2, $gd2 ) = self::jalali_to_gregorian( $jy, $jm, 1 );
			$dt = new DateTimeImmutable(
				sprintf( '%04d-%02d-%02d 00:00:00', $gy2, $gm2, $gd2 ),
				$tz
			);
			return $dt->getTimestamp();
		}

		$first = $now->modify( 'first day of this month' )->setTime( 0, 0, 0 );
		return $first->getTimestamp();
	}

	/**
	 * Human month label for dashboard (Jalali month name or Gregorian month name).
	 *
	 * @param string $locale Locale.
	 * @return string
	 */
	public static function calendar_month_label( $locale = '' ) {
		$tz  = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );
		$now = new DateTimeImmutable( 'now', $tz );
		if ( self::is_jalali_locale( $locale ) ) {
			$gy = (int) $now->format( 'Y' );
			$gm = (int) $now->format( 'n' );
			$gd = (int) $now->format( 'j' );
			list( $jy, $jm ) = self::gregorian_to_jalali( $gy, $gm, $gd );
			$month = isset( self::$jalali_months[ $jm ] ) ? self::$jalali_months[ $jm ] : '';
			return trim( $month . ' ' . self::to_persian_digits( (string) $jy ) );
		}
		return $now->format( 'F Y' );
	}
}
