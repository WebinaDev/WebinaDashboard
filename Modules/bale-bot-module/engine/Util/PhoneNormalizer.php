<?php

namespace Webino_Dashboard_Bots_Bale\Util;

/**
 * Normalize Iranian mobile numbers for lookup.
 */
class PhoneNormalizer {

	public static function normalize_digits( string $input ): string {
		$fa = array( '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹' );
		$ar = array( '٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩' );
		$en = array( '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' );
		return str_replace( array_merge( $fa, $ar ), array_merge( $en, $en ), $input );
	}

	public static function normalize( string $phone ): string {
		$phone = self::normalize_digits( $phone );
		$d = preg_replace( '/\D+/', '', $phone );
		if ( $d === null ) {
			return '';
		}
		if ( 0 === strpos( $d, '98' ) && strlen( $d ) >= 12 ) {
			$d = '0' . substr( $d, 2 );
		}
		if ( 0 === strpos( $d, '9' ) && strlen( $d ) === 10 ) {
			$d = '0' . $d;
		}
		return $d;
	}

	/**
	 * Variants for DB search (0xxx, 98xxx without leading 0).
	 *
	 * @return list<string>
	 */
	public static function search_variants( string $normalized ): array {
		$out = array( $normalized );
		if ( 0 === strpos( $normalized, '0' ) ) {
			$out[] = '98' . substr( $normalized, 1 );
			$out[] = '+98' . substr( $normalized, 1 );
			$out[] = '0098' . substr( $normalized, 1 );
		}
		return array_unique( $out );
	}
}
