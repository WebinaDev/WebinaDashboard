<?php
/**
 * Iranian payroll engine + workshops + attendance.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Employees, workshops, jalali payroll runs, payslips.
 */
final class Accounting_Payroll {

	/**
	 * Days in a Jalali month.
	 *
	 * @param int $jy Year.
	 * @param int $jm Month 1-12.
	 * @return int
	 */
	public static function jalali_days_in_month( $jy, $jm ) {
		$jm = max( 1, min( 12, (int) $jm ) );
		if ( $jm <= 6 ) {
			return 31;
		}
		if ( $jm <= 11 ) {
			return 30;
		}
		// Esfand: 29 or 30 (leap).
		list( $gy1 ) = Webino_Dashboard_Locale::jalali_to_gregorian( (int) $jy, 12, 30 );
		list( $gy2 ) = Webino_Dashboard_Locale::jalali_to_gregorian( (int) $jy + 1, 1, 1 );
		unset( $gy1, $gy2 );
		// Probe: if converting 12/30 succeeds as valid day by round-trip.
		list( $ry, $rm, $rd ) = Webino_Dashboard_Locale::jalali_to_gregorian( (int) $jy, 12, 30 );
		list( $jy2, $jm2, $jd2 ) = self::gregorian_to_jalali_public( $ry, $rm, $rd );
		if ( (int) $jy2 === (int) $jy && 12 === (int) $jm2 && 30 === (int) $jd2 ) {
			return 30;
		}
		return 29;
	}

	/**
	 * Expose private locale converter via gregorian probe.
	 *
	 * @param int $gy Y.
	 * @param int $gm M.
	 * @param int $gd D.
	 * @return array{0:int,1:int,2:int}
	 */
	public static function gregorian_to_jalali_public( $gy, $gm, $gd ) {
		// Use format_jalali_date_short internals via jalali_to_gregorian inverse isn't public;
		// reimplement compact converter matching Locale.
		$g_d_m = array( 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 );
		$gy    = (int) $gy;
		$gm    = (int) $gm;
		$gd    = (int) $gd;
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
	 * @param int $jy Jalali year.
	 * @param int $jm Jalali month.
	 * @return string Gregorian YYYY-MM (approx mid-month).
	 */
	public static function jalali_to_year_month( $jy, $jm ) {
		list( $gy, $gm ) = Webino_Dashboard_Locale::jalali_to_gregorian( (int) $jy, (int) $jm, 15 );
		return sprintf( '%04d-%02d', $gy, $gm );
	}

	/**
	 * Insurance wage ceiling for a month.
	 *
	 * @param int $days Days in month.
	 * @return float
	 */
	public static function insurance_ceiling( $days ) {
		$cfg  = Accounting_Config::get();
		$daily = (float) ( $cfg['payroll_min_daily_wage'] ?? 0 );
		$mult  = (float) ( $cfg['payroll_ceiling_multiplier'] ?? 7 );
		return round( $daily * $mult * max( 1, (int) $days ), 2 );
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_workshops( array $args = array() ) {
		$args['search_cols'] = array( 'name', 'code' );
		return Accounting_Db::list_rows( 'workshops', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_workshop( array $data ) {
		$code = sanitize_text_field( (string) ( $data['code'] ?? '' ) );
		$name = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		if ( '' === $code || '' === $name ) {
			return new WP_Error( 'acc_workshop', __( 'Workshop code and name are required.', 'webino-dashboard' ) );
		}
		$id = Accounting_Db::insert(
			'workshops',
			array(
				'code'          => $code,
				'name'          => $name,
				'row_code'      => sanitize_text_field( (string) ( $data['row_code'] ?? '' ) ),
				'branch_code'   => sanitize_text_field( (string) ( $data['branch_code'] ?? '' ) ),
				'branch_name'   => sanitize_text_field( (string) ( $data['branch_name'] ?? '' ) ),
				'address'       => sanitize_textarea_field( (string) ( $data['address'] ?? '' ) ),
				'hardship_rate' => (float) ( $data['hardship_rate'] ?? 0 ),
				'is_default'    => ! empty( $data['is_default'] ) ? 1 : 0,
				'is_active'     => 1,
			)
		);
		if ( ! is_wp_error( $id ) && ! empty( $data['is_default'] ) ) {
			Accounting_Config::save( array( 'default_workshop_id' => (int) $id ) );
		}
		return $id;
	}

	/**
	 * @param int                 $id   ID.
	 * @param array<string,mixed> $data Data.
	 * @return true|WP_Error
	 */
	public static function update_workshop( $id, array $data ) {
		if ( ! Accounting_Db::get_row( 'workshops', $id ) ) {
			return new WP_Error( 'acc_not_found', __( 'Workshop not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$row = array();
		foreach ( array( 'code', 'name', 'row_code', 'branch_code', 'branch_name' ) as $k ) {
			if ( array_key_exists( $k, $data ) ) {
				$row[ $k ] = sanitize_text_field( (string) $data[ $k ] );
			}
		}
		if ( array_key_exists( 'address', $data ) ) {
			$row['address'] = sanitize_textarea_field( (string) $data['address'] );
		}
		if ( isset( $data['hardship_rate'] ) ) {
			$row['hardship_rate'] = (float) $data['hardship_rate'];
		}
		if ( array_key_exists( 'is_default', $data ) ) {
			$row['is_default'] = ! empty( $data['is_default'] ) ? 1 : 0;
		}
		if ( array_key_exists( 'is_active', $data ) ) {
			$row['is_active'] = ! empty( $data['is_active'] ) ? 1 : 0;
		}
		$res = Accounting_Db::update( 'workshops', $id, $row );
		if ( ! is_wp_error( $res ) && ! empty( $data['is_default'] ) ) {
			Accounting_Config::save( array( 'default_workshop_id' => absint( $id ) ) );
		}
		return $res;
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_employees( array $args = array() ) {
		$args['search_cols'] = array( 'name', 'national_id', 'insurance_no', 'first_name', 'last_name' );
		return Accounting_Db::list_rows( 'employees', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return array<string,mixed>
	 */
	private static function employee_row( array $data, $create = true ) {
		$cfg = Accounting_Config::get();
		$first = sanitize_text_field( (string) ( $data['first_name'] ?? '' ) );
		$last  = sanitize_text_field( (string) ( $data['last_name'] ?? '' ) );
		$name  = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		if ( '' === $name ) {
			$name = trim( $first . ' ' . $last );
		}
		$row = array();
		if ( $create || '' !== $name ) {
			$row['name'] = $name;
		}
		$map = array(
			'first_name'                   => 'sanitize_text_field',
			'last_name'                    => 'sanitize_text_field',
			'father_name'                  => 'sanitize_text_field',
			'gender'                       => 'sanitize_key',
			'national_id'                  => 'sanitize_text_field',
			'insurance_no'                 => 'sanitize_text_field',
			'job_title'                    => 'sanitize_text_field',
			'job_code'                     => 'sanitize_text_field',
			'marital_status'               => 'sanitize_key',
			'contract_type'                => 'sanitize_key',
			'status'                       => 'sanitize_key',
			'iban'                         => 'sanitize_text_field',
			'id_issue_place'               => 'sanitize_text_field',
			'department'                   => 'sanitize_text_field',
		);
		foreach ( $map as $k => $fn ) {
			if ( $create || array_key_exists( $k, $data ) ) {
				$row[ $k ] = isset( $data[ $k ] ) ? call_user_func( $fn, (string) $data[ $k ] ) : '';
			}
		}
		foreach ( array( 'insurance_start', 'insurance_end', 'hire_date', 'birth_date' ) as $dk ) {
			if ( $create || array_key_exists( $dk, $data ) ) {
				$v = sanitize_text_field( (string) ( $data[ $dk ] ?? '' ) );
				$row[ $dk ] = $v ?: null;
			}
		}
		if ( $create || isset( $data['children_count'] ) ) {
			$row['children_count'] = absint( $data['children_count'] ?? 0 );
		}
		if ( $create || isset( $data['workshop_id'] ) ) {
			$row['workshop_id'] = ! empty( $data['workshop_id'] ) ? absint( $data['workshop_id'] ) : ( absint( $cfg['default_workshop_id'] ?? 0 ) ?: null );
		}
		if ( $create || isset( $data['wp_user_id'] ) ) {
			$row['wp_user_id'] = ! empty( $data['wp_user_id'] ) ? absint( $data['wp_user_id'] ) : null;
		}
		if ( $create || isset( $data['current_decree_id'] ) ) {
			$row['current_decree_id'] = ! empty( $data['current_decree_id'] ) ? absint( $data['current_decree_id'] ) : null;
		}
		$nums = array(
			'base_salary',
			'daily_wage',
			'benefits',
			'benefit_food',
			'benefit_housing',
			'benefit_child',
			'benefit_marriage',
			'benefit_seniority',
			'benefit_transport',
			'benefit_other_insurable',
			'benefit_other_non_insurable',
			'hardship_rate',
		);
		foreach ( $nums as $nk ) {
			if ( $create || array_key_exists( $nk, $data ) ) {
				$default = 0.0;
				if ( $create && ! array_key_exists( $nk, $data ) ) {
					if ( 'benefit_food' === $nk ) {
						$default = (float) ( $cfg['payroll_legal_food'] ?? 0 );
					} elseif ( 'benefit_housing' === $nk ) {
						$default = (float) ( $cfg['payroll_legal_housing'] ?? 0 );
					} elseif ( 'benefit_marriage' === $nk ) {
						$default = (float) ( $cfg['payroll_legal_marriage'] ?? 0 );
					} elseif ( 'benefit_seniority' === $nk ) {
						$default = (float) ( $cfg['payroll_legal_seniority'] ?? 0 );
					}
				}
				$row[ $nk ] = isset( $data[ $nk ] ) ? (float) $data[ $nk ] : $default;
			}
		}
		if ( $create && empty( $row['status'] ) ) {
			$row['status'] = 'active';
		}
		return array_filter(
			$row,
			static function ( $v ) {
				return null !== $v;
			}
		);
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_employee( array $data ) {
		$row = self::employee_row( $data, true );
		if ( empty( $row['name'] ) ) {
			return new WP_Error( 'acc_emp_name', __( 'Employee name is required.', 'webino-dashboard' ) );
		}
		return Accounting_Db::insert( 'employees', $row );
	}

	/**
	 * @param int                 $id   ID.
	 * @param array<string,mixed> $data Data.
	 * @return true|WP_Error
	 */
	public static function update_employee( $id, array $data ) {
		if ( ! Accounting_Db::get_row( 'employees', $id ) ) {
			return new WP_Error( 'acc_not_found', __( 'Employee not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return Accounting_Db::update( 'employees', $id, self::employee_row( $data, false ) );
	}

	/**
	 * Upsert attendance for employee/month.
	 *
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function upsert_attendance( array $data ) {
		$emp = absint( $data['employee_id'] ?? 0 );
		$jy  = absint( $data['jalali_year'] ?? 0 );
		$jm  = absint( $data['jalali_month'] ?? 0 );
		if ( ! $emp || ! $jy || $jm < 1 || $jm > 12 ) {
			return new WP_Error( 'acc_att', __( 'Employee and Jalali year/month required.', 'webino-dashboard' ) );
		}
		global $wpdb;
		$table = Accounting_Db::table( 'payroll_attendance' );
		$existing = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT id FROM {$table} WHERE employee_id = %d AND jalali_year = %d AND jalali_month = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$emp,
				$jy,
				$jm
			),
			ARRAY_A
		);
		$row = array(
			'employee_id'         => $emp,
			'jalali_year'         => $jy,
			'jalali_month'        => $jm,
			'absent_days'         => (float) ( $data['absent_days'] ?? 0 ),
			'leave_days'          => (float) ( $data['leave_days'] ?? 0 ),
			'unpaid_leave_days'   => (float) ( $data['unpaid_leave_days'] ?? 0 ),
			'sick_leave_days'     => (float) ( $data['sick_leave_days'] ?? 0 ),
			'overtime_hours'      => (float) ( $data['overtime_hours'] ?? 0 ),
			'night_hours'         => (float) ( $data['night_hours'] ?? 0 ),
			'holiday_hours'       => (float) ( $data['holiday_hours'] ?? 0 ),
			'volume_qty'          => (float) ( $data['volume_qty'] ?? 0 ),
			'piece_rate'          => (float) ( $data['piece_rate'] ?? 0 ),
			'loan_deduction'      => (float) ( $data['loan_deduction'] ?? 0 ),
			'advance_deduction'   => (float) ( $data['advance_deduction'] ?? 0 ),
			'notes'               => sanitize_textarea_field( (string) ( $data['notes'] ?? '' ) ),
		);
		if ( $existing ) {
			Accounting_Db::update( 'payroll_attendance', (int) $existing['id'], $row );
			return (int) $existing['id'];
		}
		return Accounting_Db::insert( 'payroll_attendance', $row );
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_runs( array $args = array() ) {
		$args['order'] = 'jalali_year DESC, jalali_month DESC, id DESC';
		return Accounting_Db::list_rows( 'payroll_runs', $args );
	}

	/**
	 * @param int $run_id Run.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function get_run( $run_id ) {
		$run = Accounting_Db::get_row( 'payroll_runs', $run_id );
		if ( ! $run ) {
			return new WP_Error( 'acc_not_found', __( 'Payroll run not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		global $wpdb;
		$pt = Accounting_Db::table( 'payslips' );
		$et = Accounting_Db::table( 'employees' );
		$slips = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT p.*, e.name AS employee_name, e.national_id, e.insurance_no FROM {$pt} p INNER JOIN {$et} e ON e.id = p.employee_id WHERE p.run_id = %d ORDER BY p.id ASC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				absint( $run_id )
			),
			ARRAY_A
		);
		$run['payslips'] = is_array( $slips ) ? $slips : array();
		return $run;
	}

	/**
	 * Create draft payroll for Jalali year/month.
	 *
	 * @param array<string,mixed> $data Data with jalali_year, jalali_month, optional workshop_id / year_month.
	 * @return int|WP_Error
	 */
	public static function create_run( $data ) {
		Accounting_Seed::ensure_payroll_accounts();
		if ( is_string( $data ) ) {
			// Back-compat: YYYY-MM gregorian.
			$ym = preg_replace( '/[^0-9\-]/', '', $data );
			if ( ! preg_match( '/^\d{4}-\d{2}$/', $ym ) ) {
				return new WP_Error( 'acc_payroll_ym', __( 'Invalid year-month.', 'webino-dashboard' ) );
			}
			list( $jy, $jm ) = self::gregorian_to_jalali_public( (int) substr( $ym, 0, 4 ), (int) substr( $ym, 5, 2 ), 15 );
			$data = array(
				'jalali_year'  => $jy,
				'jalali_month' => $jm,
				'year_month'   => $ym,
			);
		}
		$jy = absint( $data['jalali_year'] ?? 0 );
		$jm = absint( $data['jalali_month'] ?? 0 );
		if ( ! $jy || $jm < 1 || $jm > 12 ) {
			return new WP_Error( 'acc_payroll_jalali', __( 'Jalali year and month are required.', 'webino-dashboard' ) );
		}
		$days = self::jalali_days_in_month( $jy, $jm );
		$ym   = ! empty( $data['year_month'] ) ? (string) $data['year_month'] : self::jalali_to_year_month( $jy, $jm );
		$wh   = ! empty( $data['workshop_id'] ) ? absint( $data['workshop_id'] ) : absint( Accounting_Config::get()['default_workshop_id'] ?? 0 );
		$wh   = $wh ?: null;

		$emps_args = array(
			'per_page'  => 500,
			'where_sql' => "AND status = 'active'",
		);
		if ( $wh ) {
			$emps_args['where_sql']   .= ' AND (workshop_id = %d OR workshop_id IS NULL OR workshop_id = 0)';
			$emps_args['where_params'] = array( $wh );
		}
		$emps = self::list_employees( $emps_args );

		$run_id = Accounting_Db::insert(
			'payroll_runs',
			array(
				'year_month'       => $ym,
				'jalali_year'      => $jy,
				'jalali_month'     => $jm,
				'workshop_id'      => $wh,
				'status'           => 'draft',
				'list_status'      => 'draft',
				'total_gross'      => 0,
				'total_net'        => 0,
				'total_insurable'  => 0,
				'total_emp_ins'    => 0,
				'total_er_ins'     => 0,
				'total_unemployment' => 0,
				'total_tax'        => 0,
				'days_in_month'    => $days,
				'created_by'       => get_current_user_id() ?: null,
			)
		);
		if ( is_wp_error( $run_id ) ) {
			return $run_id;
		}

		foreach ( $emps['items'] as $emp ) {
			self::insert_payslip_for_employee( (int) $run_id, $emp, $jy, $jm, $days );
		}
		self::recalc_run_totals( (int) $run_id );
		return $run_id;
	}

	/**
	 * Recreate slips for a draft run.
	 *
	 * @param int $run_id Run.
	 * @return true|WP_Error
	 */
	public static function recalc_run( $run_id ) {
		$run = Accounting_Db::get_row( 'payroll_runs', $run_id );
		if ( ! $run ) {
			return new WP_Error( 'acc_not_found', __( 'Payroll run not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( 'posted' === $run['status'] ) {
			return new WP_Error( 'acc_posted', __( 'Cannot recalculate a posted payroll.', 'webino-dashboard' ) );
		}
		global $wpdb;
		$pt = Accounting_Db::table( 'payslips' );
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$pt} WHERE run_id = %d", absint( $run_id ) ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		$jy   = (int) ( $run['jalali_year'] ?: 0 );
		$jm   = (int) ( $run['jalali_month'] ?: 0 );
		$days = (int) ( $run['days_in_month'] ?: 30 );
		if ( ! $jy || ! $jm ) {
			list( $jy, $jm ) = self::gregorian_to_jalali_public( (int) substr( $run['year_month'], 0, 4 ), (int) substr( $run['year_month'], 5, 2 ), 15 );
			$days = self::jalali_days_in_month( $jy, $jm );
		}
		$wh = ! empty( $run['workshop_id'] ) ? (int) $run['workshop_id'] : 0;
		$emps_args = array(
			'per_page'  => 500,
			'where_sql' => "AND status = 'active'",
		);
		if ( $wh ) {
			$emps_args['where_sql']   .= ' AND (workshop_id = %d OR workshop_id IS NULL OR workshop_id = 0)';
			$emps_args['where_params'] = array( $wh );
		}
		$emps = self::list_employees( $emps_args );
		foreach ( $emps['items'] as $emp ) {
			self::insert_payslip_for_employee( (int) $run_id, $emp, $jy, $jm, $days );
		}
		self::recalc_run_totals( (int) $run_id );
		Accounting_Db::update( 'payroll_runs', $run_id, array( 'list_status' => 'ready' ) );
		return true;
	}

	/**
	 * @param int                 $run_id Run.
	 * @param array<string,mixed> $emp Employee.
	 * @param int                 $jy Jalali year.
	 * @param int                 $jm Jalali month.
	 * @param int                 $days Days in month.
	 * @return int|WP_Error
	 */
	private static function insert_payslip_for_employee( $run_id, array $emp, $jy, $jm, $days ) {
		$calc = self::calculate_slip( $emp, $jy, $jm, $days );
		return Accounting_Db::insert(
			'payslips',
			array(
				'run_id'                  => absint( $run_id ),
				'employee_id'             => (int) $emp['id'],
				'decree_id'               => $calc['decree_id'] ?: null,
				'days_worked'             => $calc['days_worked'],
				'gross'                   => $calc['gross'],
				'insurable_wage'          => $calc['insurable_wage'],
				'insurable_capped'        => $calc['insurable_capped'],
				'employee_insurance'      => $calc['employee_insurance'],
				'employer_insurance'      => $calc['employer_insurance'],
				'unemployment_insurance'  => $calc['unemployment_insurance'],
				'taxable_income'          => $calc['taxable_income'],
				'tax'                     => $calc['tax'],
				'overtime'                => $calc['overtime'],
				'overtime_night'          => $calc['overtime_night'],
				'overtime_holiday'        => $calc['overtime_holiday'],
				'volume_pay'              => $calc['volume_pay'],
				'volume_qty'              => $calc['volume_qty'],
				'other_deductions'        => $calc['other_deductions'],
				'loan_deduction'          => $calc['loan_deduction'],
				'advance_deduction'       => $calc['advance_deduction'],
				'net'                     => $calc['net'],
				'items_json'              => wp_json_encode( $calc['items'] ),
				'meta'                    => wp_json_encode( $calc['meta'] ),
			)
		);
	}

	/**
	 * Active decree for employee as of Jalali month mid-point (approx Gregorian).
	 *
	 * @param int $employee_id Emp.
	 * @param int $jy Year.
	 * @param int $jm Month.
	 * @return array<string,mixed>|null
	 */
	public static function get_active_decree( $employee_id, $jy, $jm ) {
		$as_of = self::jalali_to_year_month( $jy, $jm ) . '-15';
		global $wpdb;
		$table = Accounting_Db::table( 'employment_decrees' );
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE employee_id = %d AND status = 'issued'
				AND effective_from <= %s AND (effective_to IS NULL OR effective_to = '' OR effective_to >= %s)
				ORDER BY effective_from DESC, id DESC LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				absint( $employee_id ),
				$as_of,
				$as_of
			),
			ARRAY_A
		);
		if ( is_array( $row ) ) {
			return $row;
		}
		$emp = Accounting_Db::get_row( 'employees', $employee_id );
		if ( $emp && ! empty( $emp['current_decree_id'] ) ) {
			$d = Accounting_Db::get_row( 'employment_decrees', (int) $emp['current_decree_id'] );
			return is_array( $d ) ? $d : null;
		}
		return null;
	}

	/**
	 * Merge decree pay fields onto employee snapshot for calc.
	 *
	 * @param array<string,mixed> $emp Emp.
	 * @param array<string,mixed>|null $decree Decree.
	 * @return array<string,mixed>
	 */
	private static function apply_decree_to_emp( array $emp, $decree ) {
		if ( ! is_array( $decree ) ) {
			return $emp;
		}
		$map = array(
			'daily_wage', 'base_salary', 'benefit_food', 'benefit_housing', 'benefit_child',
			'benefit_marriage', 'benefit_seniority', 'benefit_transport',
			'benefit_other_insurable', 'benefit_other_non_insurable', 'hardship_rate',
			'job_title', 'job_code', 'workshop_id', 'contract_type',
		);
		foreach ( $map as $k ) {
			if ( isset( $decree[ $k ] ) && ( '' !== $decree[ $k ] || is_numeric( $decree[ $k ] ) ) ) {
				$emp[ $k ] = $decree[ $k ];
			}
		}
		if ( ! empty( $decree['benefit_responsibility'] ) ) {
			$emp['benefit_other_insurable'] = (float) ( $emp['benefit_other_insurable'] ?? 0 ) + (float) $decree['benefit_responsibility'];
		}
		$emp['_decree_id'] = (int) $decree['id'];
		return $emp;
	}

	/**
	 * Calculate one payslip (decree-driven + volume + night/holiday OT).
	 *
	 * @param array<string,mixed> $emp Employee.
	 * @param int                 $jy Year.
	 * @param int                 $jm Month.
	 * @param int                 $days Days.
	 * @return array<string,mixed>
	 */
	public static function calculate_slip( array $emp, $jy, $jm, $days ) {
		$cfg    = Accounting_Config::get();
		$decree = self::get_active_decree( (int) $emp['id'], $jy, $jm );
		$emp    = self::apply_decree_to_emp( $emp, $decree );

		$att      = self::get_attendance( (int) $emp['id'], $jy, $jm );
		$absent   = (float) ( $att['absent_days'] ?? 0 );
		$leave    = (float) ( $att['leave_days'] ?? 0 );
		$unpaid   = (float) ( $att['unpaid_leave_days'] ?? 0 );
		$sick     = (float) ( $att['sick_leave_days'] ?? 0 );
		$ot_h     = (float) ( $att['overtime_hours'] ?? 0 );
		$night_h  = (float) ( $att['night_hours'] ?? 0 );
		$hol_h    = (float) ( $att['holiday_hours'] ?? 0 );
		$vol_qty  = (float) ( $att['volume_qty'] ?? 0 );
		$piece    = (float) ( $att['piece_rate'] ?? 0 );
		$loan     = (float) ( $att['loan_deduction'] ?? 0 );
		$advance  = (float) ( $att['advance_deduction'] ?? 0 );

		$sick_worked = ! empty( $cfg['payroll_sick_counts_worked'] );
		// leave_days = paid leave (still paid); unpaid + absent (+ unpaid sick) reduce days.
		$worked = max( 0, (float) $days - $absent - $unpaid - ( $sick_worked ? 0 : $sick ) );

		$daily = (float) ( $emp['daily_wage'] ?? 0 );
		if ( $daily <= 0 && (float) ( $emp['base_salary'] ?? 0 ) > 0 ) {
			$daily = (float) $emp['base_salary'] / max( 1, (int) $days );
		}
		if ( $daily <= 0 ) {
			$daily = (float) ( $cfg['payroll_min_daily_wage'] ?? 0 );
		}

		$base_pay = round( $daily * $worked, 2 );
		$ot_rate  = (float) ( $cfg['payroll_overtime_rate'] ?? 1.4 );
		$night_r  = (float) ( $cfg['payroll_night_ot_rate'] ?? 1.35 );
		$hol_r    = (float) ( $cfg['payroll_holiday_ot_rate'] ?? 1.4 );
		$hourly   = $daily / 7.33;
		$ot_pay   = round( $hourly * $ot_h * $ot_rate, 2 );
		$night_pay = round( $hourly * $night_h * $night_r, 2 );
		$hol_pay  = round( $hourly * $hol_h * $hol_r, 2 );
		$volume_pay = round( $vol_qty * $piece, 2 );

		$food      = (float) ( $emp['benefit_food'] ?? 0 );
		$housing   = (float) ( $emp['benefit_housing'] ?? 0 );
		$child_each = (float) ( $cfg['payroll_child_benefit_each'] ?? 0 );
		$child     = (float) ( $emp['benefit_child'] ?? 0 );
		if ( $child <= 0 && $child_each > 0 ) {
			$child = $child_each * absint( $emp['children_count'] ?? 0 );
		}
		$marriage  = (float) ( $emp['benefit_marriage'] ?? 0 );
		$seniority = (float) ( $emp['benefit_seniority'] ?? 0 );
		$transport = (float) ( $emp['benefit_transport'] ?? 0 );
		$other_i   = (float) ( $emp['benefit_other_insurable'] ?? 0 ) + (float) ( $emp['benefits'] ?? 0 );
		$other_n   = (float) ( $emp['benefit_other_non_insurable'] ?? 0 );

		$vol_insurable = ! empty( $cfg['payroll_volume_insurable'] );
		$insurable     = $base_pay + $ot_pay + $night_pay + $hol_pay + $food + $housing + $marriage + $seniority + $transport + $other_i;
		if ( $vol_insurable ) {
			$insurable += $volume_pay;
		}
		$gross = $insurable + $child + $other_n;
		if ( ! $vol_insurable ) {
			$gross += $volume_pay;
		}
		$ceiling = self::insurance_ceiling( $days );
		$capped  = min( $insurable, $ceiling );

		$emp_pct = (float) ( $cfg['employee_insurance_pct'] ?? 7 );
		$er_pct  = (float) ( $cfg['employer_insurance_pct'] ?? 20 );
		$ue_pct  = (float) ( $cfg['unemployment_insurance_pct'] ?? 3 );
		$hard    = (float) ( $emp['hardship_rate'] ?? 0 );
		$wh_id   = ! empty( $emp['workshop_id'] ) ? (int) $emp['workshop_id'] : 0;
		if ( $wh_id ) {
			$wh = Accounting_Db::get_row( 'workshops', $wh_id );
			if ( $wh ) {
				$hard += (float) ( $wh['hardship_rate'] ?? 0 );
			}
		}
		$er_pct += $hard;

		$emp_ins = round( $capped * $emp_pct / 100, 2 );
		$er_ins  = round( $capped * $er_pct / 100, 2 );
		$ue_ins  = round( $capped * $ue_pct / 100, 2 );

		$taxable = max( 0, $gross - $emp_ins - (float) ( $cfg['payroll_tax_exemption'] ?? 0 ) );
		$tax     = self::calc_monthly_tax_cumulative( (int) $emp['id'], $jy, $jm, $taxable );

		$other_ded = $loan + $advance;
		$net       = max( 0, $gross - $emp_ins - $tax - $other_ded );

		return array(
			'decree_id'               => (int) ( $emp['_decree_id'] ?? 0 ),
			'days_worked'             => $worked,
			'gross'                   => $gross,
			'insurable_wage'          => $insurable,
			'insurable_capped'        => $capped,
			'employee_insurance'      => $emp_ins,
			'employer_insurance'      => $er_ins,
			'unemployment_insurance'  => $ue_ins,
			'taxable_income'          => $taxable,
			'tax'                     => $tax,
			'overtime'                => $ot_pay,
			'overtime_night'          => $night_pay,
			'overtime_holiday'        => $hol_pay,
			'volume_pay'              => $volume_pay,
			'volume_qty'              => $vol_qty,
			'other_deductions'        => $other_ded,
			'loan_deduction'          => $loan,
			'advance_deduction'       => $advance,
			'net'                     => $net,
			'items'                   => array(
				'base_pay'         => $base_pay,
				'overtime'         => $ot_pay,
				'overtime_night'   => $night_pay,
				'overtime_holiday' => $hol_pay,
				'volume'           => $volume_pay,
				'food'             => $food,
				'housing'          => $housing,
				'child'            => $child,
				'marriage'         => $marriage,
				'seniority'        => $seniority,
				'transport'        => $transport,
				'other_ins'        => $other_i,
				'other_non'        => $other_n,
				'loan'             => $loan,
				'advance'          => $advance,
			),
			'meta'                    => array(
				'daily_wage'     => $daily,
				'days_in_month'  => $days,
				'absent_days'    => $absent,
				'leave_days'     => $leave,
				'unpaid_leave'   => $unpaid,
				'sick_leave'     => $sick,
				'overtime_h'     => $ot_h,
				'night_h'        => $night_h,
				'holiday_h'      => $hol_h,
				'volume_qty'     => $vol_qty,
				'piece_rate'     => $piece,
				'ceiling'        => $ceiling,
				'hardship_rate'  => $hard,
				'decree_id'      => (int) ( $emp['_decree_id'] ?? 0 ),
				'job_code'       => (string) ( $emp['job_code'] ?? '' ),
			),
		);
	}

	/**
	 * @param int $employee_id Emp.
	 * @param int $jy Year.
	 * @param int $jm Month.
	 * @return array<string,mixed>|null
	 */
	public static function get_attendance( $employee_id, $jy, $jm ) {
		global $wpdb;
		$table = Accounting_Db::table( 'payroll_attendance' );
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE employee_id = %d AND jalali_year = %d AND jalali_month = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				absint( $employee_id ),
				absint( $jy ),
				absint( $jm )
			),
			ARRAY_A
		);
		return is_array( $row ) ? $row : null;
	}

	/**
	 * Cumulative YTD tax for Jalali year up to month (inclusive of current taxable).
	 *
	 * @param int   $employee_id Emp.
	 * @param int   $jy Year.
	 * @param int   $jm Month.
	 * @param float $this_month_taxable This month taxable.
	 * @return float Tax for this month only.
	 */
	public static function calc_monthly_tax_cumulative( $employee_id, $jy, $jm, $this_month_taxable ) {
		global $wpdb;
		$rt = Accounting_Db::table( 'payroll_runs' );
		$pt = Accounting_Db::table( 'payslips' );
		$prior = (float) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COALESCE(SUM(p.taxable_income),0) FROM {$pt} p
				INNER JOIN {$rt} r ON r.id = p.run_id
				WHERE p.employee_id = %d AND r.jalali_year = %d AND r.jalali_month < %d AND r.status IN ('draft','posted')", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				absint( $employee_id ),
				absint( $jy ),
				absint( $jm )
			)
		);
		$ytd_before = $prior;
		$ytd_after  = $prior + max( 0, (float) $this_month_taxable );
		$tax_after  = self::calc_tax( $ytd_after );
		$tax_before = self::calc_tax( $ytd_before );
		return round( max( 0, $tax_after - $tax_before ), 2 );
	}

	/**
	 * @param int $run_id Run.
	 * @return void
	 */
	public static function recalc_run_totals( $run_id ) {
		global $wpdb;
		$pt = Accounting_Db::table( 'payslips' );
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT
					COALESCE(SUM(gross),0) AS g,
					COALESCE(SUM(net),0) AS n,
					COALESCE(SUM(insurable_capped),0) AS i,
					COALESCE(SUM(employee_insurance),0) AS ei,
					COALESCE(SUM(employer_insurance),0) AS er,
					COALESCE(SUM(unemployment_insurance),0) AS ue,
					COALESCE(SUM(tax),0) AS t
				FROM {$pt} WHERE run_id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				absint( $run_id )
			),
			ARRAY_A
		);
		Accounting_Db::update(
			'payroll_runs',
			$run_id,
			array(
				'total_gross'        => (float) ( $row['g'] ?? 0 ),
				'total_net'          => (float) ( $row['n'] ?? 0 ),
				'total_insurable'    => (float) ( $row['i'] ?? 0 ),
				'total_emp_ins'      => (float) ( $row['ei'] ?? 0 ),
				'total_er_ins'       => (float) ( $row['er'] ?? 0 ),
				'total_unemployment' => (float) ( $row['ue'] ?? 0 ),
				'total_tax'          => (float) ( $row['t'] ?? 0 ),
			)
		);
	}

	/**
	 * Update a draft payslip then recalc run.
	 *
	 * @param int                 $slip_id Slip.
	 * @param array<string,mixed> $data Data.
	 * @return true|WP_Error
	 */
	public static function update_payslip( $slip_id, array $data ) {
		$slip = Accounting_Db::get_row( 'payslips', $slip_id );
		if ( ! $slip ) {
			return new WP_Error( 'acc_not_found', __( 'Payslip not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$run = Accounting_Db::get_row( 'payroll_runs', (int) $slip['run_id'] );
		if ( ! $run || 'posted' === $run['status'] ) {
			return new WP_Error( 'acc_posted', __( 'Cannot edit payslip of posted payroll.', 'webino-dashboard' ) );
		}
		$row = array();
		foreach ( array( 'days_worked', 'gross', 'insurable_wage', 'insurable_capped', 'employee_insurance', 'employer_insurance', 'unemployment_insurance', 'taxable_income', 'tax', 'overtime', 'other_deductions', 'net' ) as $k ) {
			if ( isset( $data[ $k ] ) ) {
				$row[ $k ] = (float) $data[ $k ];
			}
		}
		if ( isset( $data['items_json'] ) ) {
			$row['items_json'] = is_string( $data['items_json'] ) ? $data['items_json'] : wp_json_encode( $data['items_json'] );
		}
		if ( $row ) {
			Accounting_Db::update( 'payslips', $slip_id, $row );
		}
		self::recalc_run_totals( (int) $slip['run_id'] );
		return true;
	}

	/**
	 * Post payroll run to GL.
	 *
	 * @param int $run_id Run.
	 * @return int|WP_Error Journal ID.
	 */
	public static function post_run( $run_id ) {
		Accounting_Seed::ensure_payroll_accounts();
		$run = Accounting_Db::get_row( 'payroll_runs', $run_id );
		if ( ! $run ) {
			return new WP_Error( 'acc_not_found', __( 'Payroll run not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( 'posted' === $run['status'] ) {
			return new WP_Error( 'acc_already_posted', __( 'Payroll already posted.', 'webino-dashboard' ) );
		}
		$gross = (float) $run['total_gross'];
		$emp_i = (float) $run['total_emp_ins'];
		$er_i  = (float) $run['total_er_ins'];
		$ue_i  = (float) $run['total_unemployment'];
		$tax   = (float) $run['total_tax'];
		$net   = (float) $run['total_net'];

		$exp   = Accounting_Chart::mapped_id( 'payroll_expense' );
		$ins_e = Accounting_Chart::mapped_id( 'insurance_exp' );
		$ue_e  = Accounting_Chart::mapped_id( 'unemployment_exp' );
		$pay   = Accounting_Chart::mapped_id( 'payroll_payable' );
		$ins_p = Accounting_Chart::mapped_id( 'insurance_pay' );
		$ue_p  = Accounting_Chart::mapped_id( 'unemployment_pay' );
		$tax_p = Accounting_Chart::mapped_id( 'payroll_tax_payable' ) ?: Accounting_Chart::mapped_id( 'vat_payable' );

		if ( ! $exp || ! $pay ) {
			return new WP_Error( 'acc_map', __( 'Payroll accounts are not mapped.', 'webino-dashboard' ) );
		}

		$lines = array(
			array( 'account_id' => $exp, 'debit' => $gross, 'credit' => 0, 'description' => 'Gross wages' ),
		);
		if ( $er_i > 0 && $ins_e ) {
			$lines[] = array( 'account_id' => $ins_e, 'debit' => $er_i, 'credit' => 0, 'description' => 'Employer insurance' );
		}
		if ( $ue_i > 0 && $ue_e ) {
			$lines[] = array( 'account_id' => $ue_e, 'debit' => $ue_i, 'credit' => 0, 'description' => 'Unemployment insurance' );
		}
		$lines[] = array( 'account_id' => $pay, 'debit' => 0, 'credit' => $net, 'description' => 'Net payable' );
		if ( $emp_i + $er_i > 0 && $ins_p ) {
			$lines[] = array( 'account_id' => $ins_p, 'debit' => 0, 'credit' => $emp_i + $er_i, 'description' => 'SS payable' );
		}
		if ( $ue_i > 0 && $ue_p ) {
			$lines[] = array( 'account_id' => $ue_p, 'debit' => 0, 'credit' => $ue_i, 'description' => 'Unemployment payable' );
		}
		if ( $tax > 0 && $tax_p ) {
			$lines[] = array( 'account_id' => $tax_p, 'debit' => 0, 'credit' => $tax, 'description' => 'Payroll tax payable' );
		}

		$jy = (int) ( $run['jalali_year'] ?? 0 );
		$jm = (int) ( $run['jalali_month'] ?? 0 );
		$doc_date = $run['year_month'] . '-28';
		if ( $jy && $jm ) {
			$dim = self::jalali_days_in_month( $jy, $jm );
			list( $gy, $gm, $gd ) = Webino_Dashboard_Locale::jalali_to_gregorian( $jy, $jm, $dim );
			$doc_date = sprintf( '%04d-%02d-%02d', $gy, $gm, $gd );
		}

		$jid = Accounting_Journal::create(
			array(
				'document_date' => $doc_date,
				'description'   => sprintf( 'Payroll %s (JY %d/%02d)', $run['year_month'], $jy, $jm ),
				'source'        => 'payroll',
				'source_id'     => $run_id,
			),
			$lines,
			true
		);
		if ( is_wp_error( $jid ) ) {
			return $jid;
		}
		Accounting_Db::update(
			'payroll_runs',
			$run_id,
			array(
				'status'           => 'posted',
				'list_status'      => 'ready',
				'journal_entry_id' => $jid,
			)
		);
		return $jid;
	}

	/**
	 * Annual progressive tax.
	 *
	 * @param float $annual Annual taxable.
	 * @return float
	 */
	public static function calc_tax( $annual ) {
		$brackets  = Accounting_Config::get()['payroll_tax_brackets'];
		$tax       = 0.0;
		$prev      = 0.0;
		$remaining = max( 0, (float) $annual );
		foreach ( (array) $brackets as $b ) {
			$up   = (float) ( $b['up_to'] ?? 0 );
			$rate = (float) ( $b['rate'] ?? 0 );
			if ( $up <= 0 ) {
				$tax += $remaining * $rate / 100;
				break;
			}
			$slice = min( $remaining, max( 0, $up - $prev ) );
			$tax  += $slice * $rate / 100;
			$remaining -= $slice;
			$prev = $up;
			if ( $remaining <= 0 ) {
				break;
			}
		}
		return $tax;
	}

	/**
	 * CSV export of a run.
	 *
	 * @param int $run_id Run.
	 * @return string|WP_Error CSV.
	 */
	public static function export_csv( $run_id ) {
		$run = self::get_run( $run_id );
		if ( is_wp_error( $run ) ) {
			return $run;
		}
		$out = "name,national_id,insurance_no,days,gross,insurable,emp_ins,er_ins,unemployment,tax,net\n";
		foreach ( (array) ( $run['payslips'] ?? array() ) as $r ) {
			$out .= sprintf(
				"%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
				str_replace( ',', ' ', (string) ( $r['employee_name'] ?? $r['name'] ?? '' ) ),
				(string) ( $r['national_id'] ?? '' ),
				(string) ( $r['insurance_no'] ?? '' ),
				$r['days_worked'] ?? '',
				$r['gross'],
				$r['insurable_capped'] ?? '',
				$r['employee_insurance'],
				$r['employer_insurance'],
				$r['unemployment_insurance'] ?? '',
				$r['tax'],
				$r['net']
			);
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_attendance( array $args = array() ) {
		$args['order'] = 'jalali_year DESC, jalali_month DESC, id DESC';
		return Accounting_Db::list_rows( 'payroll_attendance', $args );
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_decrees( array $args = array() ) {
		$args['order'] = 'effective_from DESC, id DESC';
		return Accounting_Db::list_rows( 'employment_decrees', $args );
	}

	/**
	 * @param int $id ID.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function get_decree( $id ) {
		$row = Accounting_Db::get_row( 'employment_decrees', $id );
		return $row ? $row : new WP_Error( 'acc_not_found', __( 'Decree not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_decree( array $data ) {
		$emp = absint( $data['employee_id'] ?? 0 );
		if ( ! $emp || ! Accounting_Db::get_row( 'employees', $emp ) ) {
			return new WP_Error( 'acc_decree_emp', __( 'Valid employee is required.', 'webino-dashboard' ) );
		}
		$no = sanitize_text_field( (string) ( $data['decree_no'] ?? '' ) );
		if ( '' === $no ) {
			$no = 'HK-' . $emp . '-' . gmdate( 'YmdHis' );
		}
		$from = sanitize_text_field( (string) ( $data['effective_from'] ?? '' ) );
		if ( '' === $from ) {
			return new WP_Error( 'acc_decree_from', __( 'Effective date is required.', 'webino-dashboard' ) );
		}
		$row = self::decree_row( $data, true );
		$row['employee_id']    = $emp;
		$row['decree_no']      = $no;
		$row['effective_from'] = $from;
		$row['created_by']     = get_current_user_id() ?: null;
		$id = Accounting_Db::insert( 'employment_decrees', $row );
		if ( ! is_wp_error( $id ) && 'issued' === ( $row['status'] ?? '' ) ) {
			self::activate_decree( (int) $id );
		}
		return $id;
	}

	/**
	 * @param int                 $id   ID.
	 * @param array<string,mixed> $data Data.
	 * @return true|WP_Error
	 */
	public static function update_decree( $id, array $data ) {
		$existing = Accounting_Db::get_row( 'employment_decrees', $id );
		if ( ! $existing ) {
			return new WP_Error( 'acc_not_found', __( 'Decree not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$row = self::decree_row( $data, false );
		if ( $row ) {
			Accounting_Db::update( 'employment_decrees', $id, $row );
		}
		$status = $data['status'] ?? $existing['status'];
		if ( 'issued' === $status ) {
			self::activate_decree( (int) $id );
		}
		return true;
	}

	/**
	 * Mark decree issued and set as current on employee; supersede previous.
	 *
	 * @param int $id Decree ID.
	 * @return void
	 */
	public static function activate_decree( $id ) {
		$d = Accounting_Db::get_row( 'employment_decrees', $id );
		if ( ! $d ) {
			return;
		}
		$emp_id = (int) $d['employee_id'];
		$prev   = ! empty( $d['previous_decree_id'] ) ? (int) $d['previous_decree_id'] : 0;
		if ( ! $prev ) {
			$emp = Accounting_Db::get_row( 'employees', $emp_id );
			$prev = $emp && ! empty( $emp['current_decree_id'] ) ? (int) $emp['current_decree_id'] : 0;
		}
		if ( $prev && $prev !== (int) $id ) {
			Accounting_Db::update(
				'employment_decrees',
				$prev,
				array(
					'status'       => 'superseded',
					'effective_to' => $d['effective_from'],
				)
			);
			Accounting_Db::update( 'employment_decrees', $id, array( 'previous_decree_id' => $prev ) );
		}
		Accounting_Db::update( 'employment_decrees', $id, array( 'status' => 'issued' ) );
		$patch = array(
			'current_decree_id' => (int) $id,
			'daily_wage'        => (float) $d['daily_wage'],
			'base_salary'       => (float) $d['base_salary'],
			'benefit_food'      => (float) $d['benefit_food'],
			'benefit_housing'   => (float) $d['benefit_housing'],
			'benefit_child'     => (float) $d['benefit_child'],
			'benefit_marriage'  => (float) $d['benefit_marriage'],
			'benefit_seniority' => (float) $d['benefit_seniority'],
			'benefit_transport' => (float) $d['benefit_transport'],
			'benefit_other_insurable' => (float) $d['benefit_other_insurable'] + (float) $d['benefit_responsibility'],
			'benefit_other_non_insurable' => (float) $d['benefit_other_non_insurable'],
			'hardship_rate'     => (float) $d['hardship_rate'],
		);
		if ( ! empty( $d['job_title'] ) ) {
			$patch['job_title'] = $d['job_title'];
		}
		if ( ! empty( $d['job_code'] ) ) {
			$patch['job_code'] = $d['job_code'];
		}
		if ( ! empty( $d['workshop_id'] ) ) {
			$patch['workshop_id'] = (int) $d['workshop_id'];
		}
		if ( ! empty( $d['department'] ) ) {
			$patch['department'] = $d['department'];
		}
		Accounting_Db::update( 'employees', $emp_id, $patch );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @param bool                $create Create.
	 * @return array<string,mixed>
	 */
	private static function decree_row( array $data, $create = true ) {
		$cfg = Accounting_Config::get();
		$row = array();
		$text = array( 'decree_no', 'decree_type', 'job_title', 'job_code', 'department', 'contract_type', 'status', 'notes' );
		foreach ( $text as $k ) {
			if ( $create || array_key_exists( $k, $data ) ) {
				if ( 'notes' === $k ) {
					$row[ $k ] = sanitize_textarea_field( (string) ( $data[ $k ] ?? '' ) );
				} else {
					$row[ $k ] = sanitize_text_field( (string) ( $data[ $k ] ?? ( 'status' === $k ? 'draft' : ( 'decree_type' === $k ? 'hire' : '' ) ) ) );
				}
			}
		}
		foreach ( array( 'issue_date', 'effective_from', 'effective_to' ) as $dk ) {
			if ( $create || array_key_exists( $dk, $data ) ) {
				$v = sanitize_text_field( (string) ( $data[ $dk ] ?? '' ) );
				$row[ $dk ] = $v ?: null;
			}
		}
		if ( $create || isset( $data['workshop_id'] ) ) {
			$row['workshop_id'] = ! empty( $data['workshop_id'] ) ? absint( $data['workshop_id'] ) : null;
		}
		if ( $create || isset( $data['previous_decree_id'] ) ) {
			$row['previous_decree_id'] = ! empty( $data['previous_decree_id'] ) ? absint( $data['previous_decree_id'] ) : null;
		}
		$nums = array(
			'daily_wage', 'base_salary', 'benefit_food', 'benefit_housing', 'benefit_child',
			'benefit_marriage', 'benefit_seniority', 'benefit_transport', 'benefit_responsibility',
			'benefit_other_insurable', 'benefit_other_non_insurable', 'hardship_rate',
		);
		foreach ( $nums as $nk ) {
			if ( $create || array_key_exists( $nk, $data ) ) {
				$default = 0.0;
				if ( $create && ! array_key_exists( $nk, $data ) ) {
					if ( 'benefit_food' === $nk ) {
						$default = (float) ( $cfg['payroll_legal_food'] ?? 0 );
					} elseif ( 'benefit_housing' === $nk ) {
						$default = (float) ( $cfg['payroll_legal_housing'] ?? 0 );
					} elseif ( 'benefit_marriage' === $nk ) {
						$default = (float) ( $cfg['payroll_legal_marriage'] ?? 0 );
					} elseif ( 'benefit_seniority' === $nk ) {
						$default = (float) ( $cfg['payroll_legal_seniority'] ?? 0 );
					}
				}
				$row[ $nk ] = isset( $data[ $nk ] ) ? (float) $data[ $nk ] : $default;
			}
		}
		if ( isset( $data['items_json'] ) ) {
			$row['items_json'] = is_string( $data['items_json'] ) ? $data['items_json'] : wp_json_encode( $data['items_json'] );
		}
		return array_filter(
			$row,
			static function ( $v ) {
				return null !== $v;
			}
		);
	}

	/**
	 * Payslips visible to current WP user (own employee link).
	 *
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}|WP_Error
	 */
	public static function my_payslips( array $args = array() ) {
		$uid = get_current_user_id();
		if ( ! $uid ) {
			return new WP_Error( 'acc_auth', __( 'Not authenticated.', 'webino-dashboard' ), array( 'status' => 401 ) );
		}
		global $wpdb;
		$et = Accounting_Db::table( 'employees' );
		$emp_ids = $wpdb->get_col( $wpdb->prepare( "SELECT id FROM {$et} WHERE wp_user_id = %d", $uid ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( empty( $emp_ids ) ) {
			return array( 'items' => array(), 'total' => 0 );
		}
		$ids = array_map( 'absint', $emp_args = $emp_ids );
		$in  = implode( ',', $ids );
		$args['where_sql'] = ( $args['where_sql'] ?? '' ) . " AND employee_id IN ({$in})";
		$args['order']     = $args['order'] ?? 'id DESC';
		return Accounting_Db::list_rows( 'payslips', $args );
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}|WP_Error
	 */
	public static function my_decrees( array $args = array() ) {
		$uid = get_current_user_id();
		if ( ! $uid ) {
			return new WP_Error( 'acc_auth', __( 'Not authenticated.', 'webino-dashboard' ), array( 'status' => 401 ) );
		}
		global $wpdb;
		$et = Accounting_Db::table( 'employees' );
		$emp_ids = $wpdb->get_col( $wpdb->prepare( "SELECT id FROM {$et} WHERE wp_user_id = %d", $uid ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( empty( $emp_ids ) ) {
			return array( 'items' => array(), 'total' => 0 );
		}
		$in = implode( ',', array_map( 'absint', $emp_ids ) );
		$args['where_sql'] = ( $args['where_sql'] ?? '' ) . " AND employee_id IN ({$in})";
		$args['order']     = $args['order'] ?? 'effective_from DESC, id DESC';
		return Accounting_Db::list_rows( 'employment_decrees', $args );
	}

	/**
	 * Whether current user may view a payslip (manager or owner).
	 *
	 * @param int $slip_id Slip.
	 * @return bool
	 */
	public static function can_view_payslip( $slip_id ) {
		if ( current_user_can( 'webino_manage_accounting' ) || current_user_can( 'manage_woocommerce' ) || current_user_can( 'manage_options' ) ) {
			return true;
		}
		$slip = Accounting_Db::get_row( 'payslips', $slip_id );
		if ( ! $slip ) {
			return false;
		}
		$emp = Accounting_Db::get_row( 'employees', (int) $slip['employee_id'] );
		return $emp && (int) ( $emp['wp_user_id'] ?? 0 ) === get_current_user_id();
	}

	/**
	 * @param int $decree_id Decree.
	 * @return bool
	 */
	public static function can_view_decree( $decree_id ) {
		if ( current_user_can( 'webino_manage_accounting' ) || current_user_can( 'manage_woocommerce' ) || current_user_can( 'manage_options' ) ) {
			return true;
		}
		$d = Accounting_Db::get_row( 'employment_decrees', $decree_id );
		if ( ! $d ) {
			return false;
		}
		$emp = Accounting_Db::get_row( 'employees', (int) $d['employee_id'] );
		return $emp && (int) ( $emp['wp_user_id'] ?? 0 ) === get_current_user_id();
	}
}
