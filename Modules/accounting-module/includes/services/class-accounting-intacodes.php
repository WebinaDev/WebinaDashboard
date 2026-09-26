<?php
/**
 * Intacode catalog + seed.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Economic activity codes (اینتاکد).
 */
final class Accounting_Intacodes {
	const SEED_OPTION = 'webino_accounting_intacodes_seeded';

	/**
	 * @return void
	 */
	public static function maybe_seed() {
		if ( get_option( self::SEED_OPTION ) ) {
			return;
		}
		self::seed_defaults();
		update_option( self::SEED_OPTION, '1.5.0', false );
	}

	/**
	 * @return void
	 */
	public static function seed_defaults() {
		global $wpdb;
		$table = Accounting_Db::table( 'intacodes' );
		$rows  = array(
			array( '472100', 'خرده فروشی مواد غذایی در فروشگاه‌های تخصصی', 12, 1 ),
			array( '472200', 'خرده فروشی نوشیدنی در فروشگاه‌های تخصصی', 12, 1 ),
			array( '477100', 'خرده فروشی پوشاک در فروشگاه‌های تخصصی', 15, 1 ),
			array( '474100', 'خرده فروشی رایانه و نرم‌افزار', 18, 1 ),
			array( '475200', 'خرده فروشی لوازم خانگی برقی', 14, 1 ),
			array( '479100', 'خرده فروشی از طریق اینترنت', 16, 1 ),
			array( '461000', 'عمده فروشی بر اساس قرارداد یا حق‌العمل', 8, 1 ),
			array( '469000', 'عمده فروشی غیرتخصصی', 10, 1 ),
			array( '620100', 'برنامه‌نویسی رایانه', 25, 1 ),
			array( '620200', 'مشاوره رایانه و مدیریت تسهیلات', 25, 1 ),
			array( '702000', 'فعالیت‌های مشاوره مدیریت', 30, 1 ),
			array( '561000', 'رستوران‌ها و مکان‌های سرو غذا', 12, 1 ),
			array( '011100', 'کشت غلات (به جز برنج)', 10, 0 ),
			array( '862100', 'فعالیت‌های پزشکی عمومی', 15, 0 ),
			array( '471100', 'خرده فروشی در فروشگاه‌های غیرتخصصی با غلبه مواد غذایی', 10, 1 ),
		);
		foreach ( $rows as $r ) {
			$exists = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT id FROM {$table} WHERE code = %s AND version = %s LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$r[0],
					'seed'
				)
			);
			if ( $exists ) {
				continue;
			}
			$wpdb->insert(
				$table,
				array(
					'code'         => $r[0],
					'title'        => $r[1],
					'profit_ratio' => $r[2],
					'vat_liable'   => $r[3],
					'version'      => 'seed',
				),
				array( '%s', '%s', '%f', '%d', '%s' )
			);
		}
	}

	/**
	 * @param string $q     Query.
	 * @param int    $limit Limit.
	 * @return array<int,array<string,mixed>>
	 */
	public static function search( $q, $limit = 30 ) {
		global $wpdb;
		$table = Accounting_Db::table( 'intacodes' );
		$q     = trim( (string) $q );
		$limit = max( 1, min( 100, (int) $limit ) );
		if ( '' === $q ) {
			$sql = $wpdb->prepare( "SELECT * FROM {$table} ORDER BY code ASC LIMIT %d", $limit ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			return (array) $wpdb->get_results( $sql, ARRAY_A );
		}
		$like = '%' . $wpdb->esc_like( $q ) . '%';
		$sql  = $wpdb->prepare(
			"SELECT * FROM {$table} WHERE code LIKE %s OR title LIKE %s ORDER BY code ASC LIMIT %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$like,
			$like,
			$limit
		);
		return (array) $wpdb->get_results( $sql, ARRAY_A );
	}

	/**
	 * @param string $code Code.
	 * @return array<string,mixed>|null
	 */
	public static function get_by_code( $code ) {
		global $wpdb;
		$table = Accounting_Db::table( 'intacodes' );
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE code = %s ORDER BY id DESC LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				sanitize_text_field( (string) $code )
			),
			ARRAY_A
		);
		return is_array( $row ) ? $row : null;
	}

	/**
	 * Replace/append from uploaded JSON array.
	 *
	 * @param array<int,array<string,mixed>> $rows Rows.
	 * @param string                         $version Version label.
	 * @return int Inserted count.
	 */
	public static function import_rows( array $rows, $version = 'upload' ) {
		global $wpdb;
		$table = Accounting_Db::table( 'intacodes' );
		$n     = 0;
		$ver   = sanitize_text_field( (string) $version );
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) || empty( $row['code'] ) ) {
				continue;
			}
			$code = sanitize_text_field( (string) $row['code'] );
			$wpdb->replace(
				$table,
				array(
					'code'         => $code,
					'title'        => sanitize_text_field( (string) ( $row['title'] ?? $code ) ),
					'profit_ratio' => (float) ( $row['profit_ratio'] ?? 0 ),
					'vat_liable'   => empty( $row['vat_liable'] ) ? 0 : 1,
					'version'      => $ver,
				),
				array( '%s', '%s', '%f', '%d', '%s' )
			);
			++$n;
		}
		return $n;
	}
}
