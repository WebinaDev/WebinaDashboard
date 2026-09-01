<?php
/**
 * Chart of accounts service.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Chart CRUD helpers.
 */
final class Accounting_Chart {

	/**
	 * @param string $code Account code.
	 * @return int
	 */
	public static function id_by_code( $code ) {
		global $wpdb;
		$table = Accounting_Db::table( 'chart_accounts' );
		$id    = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE code = %s LIMIT 1", (string) $code ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return absint( $id );
	}

	/**
	 * Resolve mapped account id from settings.
	 *
	 * @param string $map_key Map key (sales, bank, …).
	 * @return int
	 */
	public static function mapped_id( $map_key ) {
		$map  = Accounting_Config::get()['account_map'];
		$code = (string) ( $map[ $map_key ] ?? '' );
		return $code ? self::id_by_code( $code ) : 0;
	}

	/**
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_all( array $args = array() ) {
		$args['per_page']    = $args['per_page'] ?? 500;
		$args['search_cols'] = array( 'code', 'name' );
		$args['order']       = 'code ASC';
		return Accounting_Db::list_rows( 'chart_accounts', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create( array $data ) {
		$code = sanitize_text_field( (string) ( $data['code'] ?? '' ) );
		$name = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		$type = sanitize_key( (string) ( $data['type'] ?? 'expense' ) );
		if ( '' === $code || '' === $name ) {
			return new WP_Error( 'acc_chart_invalid', __( 'Code and name are required.', 'webino-dashboard' ) );
		}
		if ( self::id_by_code( $code ) ) {
			return new WP_Error( 'acc_chart_dup', __( 'Account code already exists.', 'webino-dashboard' ) );
		}
		return Accounting_Db::insert(
			'chart_accounts',
			array(
				'code'        => $code,
				'name'        => $name,
				'type'        => $type,
				'parent_id'   => ! empty( $data['parent_id'] ) ? absint( $data['parent_id'] ) : null,
				'is_postable' => isset( $data['is_postable'] ) ? (int) ! empty( $data['is_postable'] ) : 1,
			)
		);
	}

	/**
	 * @param int                 $id   ID.
	 * @param array<string,mixed> $data Data.
	 * @return true|WP_Error
	 */
	public static function update( $id, array $data ) {
		$row = Accounting_Db::get_row( 'chart_accounts', $id );
		if ( ! $row ) {
			return new WP_Error( 'acc_not_found', __( 'Account not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$upd = array();
		if ( isset( $data['name'] ) ) {
			$upd['name'] = sanitize_text_field( (string) $data['name'] );
		}
		if ( isset( $data['type'] ) ) {
			$upd['type'] = sanitize_key( (string) $data['type'] );
		}
		if ( isset( $data['is_postable'] ) ) {
			$upd['is_postable'] = (int) ! empty( $data['is_postable'] );
		}
		if ( isset( $data['parent_id'] ) ) {
			$upd['parent_id'] = absint( $data['parent_id'] ) ?: null;
		}
		return $upd ? Accounting_Db::update( 'chart_accounts', $id, $upd ) : true;
	}
}
