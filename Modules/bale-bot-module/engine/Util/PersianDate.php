<?php

namespace Webino_Dashboard_Bots_Bale\Util;

/**
 * Jalali (Persian) calendar labels for bot messages (site-local Gregorian → شمسی).
 */
class PersianDate {

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
	 * @return array{0:int,1:int,2:int} Jalali year, month (1–12), day
	 */
	public static function gregorian_to_jalali( int $gy, int $gm, int $gd ): array {
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
	 * e.g. ۲۷ فروردین ۱۴۰۵
	 */
	public static function format_jalali_date_label( int $gy, int $gm, int $gd ): string {
		list( $jy, $jm, $jd ) = self::gregorian_to_jalali( $gy, $gm, $gd );
		$month = isset( self::$jalali_months[ $jm ] ) ? self::$jalali_months[ $jm ] : '';
		return trim(
			MoneyFormatter::to_persian_digits( (string) $jd ) . ' ' . $month . ' ' . MoneyFormatter::to_persian_digits( (string) $jy )
		);
	}

	/**
	 * 24-hour clock, Persian digits (e.g. ۱۶:۰۹).
	 */
	public static function format_time_24_persian( int $hour24, int $minute ): string {
		$s = sprintf( '%d:%02d', max( 0, min( 23, $hour24 ) ), max( 0, min( 59, $minute ) ) );
		return MoneyFormatter::to_persian_digits( $s );
	}

	/**
	 * @param \WC_DateTime|\DateTimeInterface $wc_date Order date in site timezone.
	 * @return array{date:string,time:string}
	 */
	public static function order_created_parts( $wc_date ): array {
		if ( $wc_date instanceof \WC_DateTime && method_exists( $wc_date, 'date' ) ) {
			$y   = (int) $wc_date->date( 'Y' );
			$m   = (int) $wc_date->date( 'n' );
			$d   = (int) $wc_date->date( 'j' );
			$gh  = (int) $wc_date->date( 'G' );
			$gm  = (int) $wc_date->date( 'i' );
		} elseif ( $wc_date instanceof \DateTimeInterface ) {
			$y  = (int) $wc_date->format( 'Y' );
			$m  = (int) $wc_date->format( 'n' );
			$d  = (int) $wc_date->format( 'j' );
			$gh = (int) $wc_date->format( 'G' );
			$gm = (int) $wc_date->format( 'i' );
		} else {
			return array( 'date' => '', 'time' => '' );
		}
		return array(
			'date' => self::format_jalali_date_label( $y, $m, $d ),
			'time' => self::format_time_24_persian( $gh, $gm ),
		);
	}
}
