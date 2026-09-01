<?php
/**
 * Seed chart of accounts, fiscal year, default warehouse.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * One-time seed.
 */
final class Accounting_Seed {
	const SEEDED_OPTION = 'webino_accounting_seeded';

	/**
	 * @return void
	 */
	public static function maybe_seed() {
		if ( get_option( self::SEEDED_OPTION ) ) {
			return;
		}
		self::seed();
		update_option( self::SEEDED_OPTION, '1.0.0', false );
	}

	/**
	 * @return void
	 */
	public static function seed() {
		global $wpdb;
		$fy = Accounting_Db::table( 'fiscal_years' );
		$n  = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$fy}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( 0 === $n ) {
			$year = (int) gmdate( 'Y' );
			// Approximate Iranian fiscal year as calendar year for seed.
			$wpdb->insert(
				$fy,
				array(
					'title'     => sprintf( 'FY %d', $year ),
					'starts_on' => sprintf( '%d-01-01', $year ),
					'ends_on'   => sprintf( '%d-12-31', $year ),
					'is_closed' => 0,
				),
				array( '%s', '%s', '%s', '%d' )
			);
		}

		$chart = Accounting_Db::table( 'chart_accounts' );
		$cn    = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$chart}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( 0 === $cn ) {
			foreach ( self::default_accounts() as $row ) {
				$wpdb->insert(
					$chart,
					array(
						'code'       => $row[0],
						'name'       => $row[1],
						'type'       => $row[2],
						'is_postable'=> $row[3],
						'parent_id'  => null,
					),
					array( '%s', '%s', '%s', '%d' )
				);
			}
		}

		$wh = Accounting_Db::table( 'warehouses' );
		$wn = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wh}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( 0 === $wn ) {
			$wpdb->insert(
				$wh,
				array(
					'name'       => __( 'Main warehouse', 'webino-dashboard' ),
					'is_default' => 1,
					'is_active'  => 1,
				),
				array( '%s', '%d', '%d' )
			);
			$id = (int) $wpdb->insert_id;
			if ( $id > 0 ) {
				$s = Accounting_Config::get();
				$s['default_warehouse_id'] = $id;
				update_option( Accounting_Config::OPTION_KEY, $s, false );
			}
		}

		$units = Accounting_Db::table( 'units' );
		$un    = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$units}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( 0 === $un ) {
			$wpdb->insert( $units, array( 'name' => 'عدد', 'symbol' => 'pcs' ), array( '%s', '%s' ) );
			$wpdb->insert( $units, array( 'name' => 'کیلوگرم', 'symbol' => 'kg' ), array( '%s', '%s' ) );
		}

		$cash = Accounting_Db::table( 'cash_accounts' );
		$cc   = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$cash}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( 0 === $cc ) {
			$bank_id = Accounting_Chart::id_by_code( '1102' );
			$wpdb->insert(
				$cash,
				array(
					'name'             => __( 'Main bank', 'webino-dashboard' ),
					'type'             => 'bank',
					'chart_account_id' => $bank_id ?: null,
					'is_active'        => 1,
					'is_default'       => 1,
				),
				array( '%s', '%s', '%d', '%d', '%d' )
			);
			$wpdb->insert(
				$cash,
				array(
					'name'             => __( 'Cash desk', 'webino-dashboard' ),
					'type'             => 'cash',
					'chart_account_id' => Accounting_Chart::id_by_code( '1101' ) ?: null,
					'is_active'        => 1,
					'is_default'       => 0,
				),
				array( '%s', '%s', '%d', '%d', '%d' )
			);
		}
	}

	/**
	 * @return array<int,array{0:string,1:string,2:string,3:int}>
	 */
	private static function default_accounts() {
		return array(
			array( '1000', 'دارایی‌ها', 'asset', 0 ),
			array( '1101', 'صندوق', 'asset', 1 ),
			array( '1102', 'بانک', 'asset', 1 ),
			array( '1103', 'درگاه پرداخت', 'asset', 1 ),
			array( '1201', 'حساب‌های دریافتنی', 'asset', 1 ),
			array( '1301', 'موجودی کالا', 'asset', 1 ),
			array( '2000', 'بدهی‌ها', 'liability', 0 ),
			array( '2101', 'مالیات بر ارزش افزوده پرداختنی', 'liability', 1 ),
			array( '2102', 'حساب‌های پرداختنی', 'liability', 1 ),
			array( '2103', 'حقوق پرداختنی', 'liability', 1 ),
			array( '2104', 'بیمه پرداختنی', 'liability', 1 ),
			array( '2105', 'بیمه بیکاری پرداختنی', 'liability', 1 ),
			array( '2106', 'مالیات حقوق پرداختنی', 'liability', 1 ),
			array( '3000', 'حقوق صاحبان سهام', 'equity', 0 ),
			array( '3101', 'سرمایه', 'equity', 1 ),
			array( '3201', 'سود انباشته', 'equity', 1 ),
			array( '4000', 'درآمدها', 'income', 0 ),
			array( '4101', 'فروش کالا و خدمات', 'income', 1 ),
			array( '5000', 'هزینه‌ها', 'expense', 0 ),
			array( '5101', 'بهای تمام‌شده کالای فروش‌رفته', 'expense', 1 ),
			array( '5201', 'هزینه حقوق و دستمزد', 'expense', 1 ),
			array( '5202', 'هزینه بیمه سهم کارفرما', 'expense', 1 ),
			array( '5203', 'هزینه بیمه بیکاری', 'expense', 1 ),
			array( '5301', 'هزینه‌های عملیاتی', 'expense', 1 ),
		);
	}

	/**
	 * Ensure payroll/Tamin COA codes exist (upgrade path).
	 *
	 * @return void
	 */
	public static function ensure_payroll_accounts() {
		$extra = array(
			array( '2105', 'بیمه بیکاری پرداختنی', 'liability', 1 ),
			array( '2106', 'مالیات حقوق پرداختنی', 'liability', 1 ),
			array( '5203', 'هزینه بیمه بیکاری', 'expense', 1 ),
		);
		foreach ( $extra as $row ) {
			if ( Accounting_Chart::id_by_code( $row[0] ) ) {
				continue;
			}
			Accounting_Db::insert(
				'chart_accounts',
				array(
					'code'        => $row[0],
					'name'        => $row[1],
					'type'        => $row[2],
					'is_postable' => $row[3],
				)
			);
		}
	}
}
