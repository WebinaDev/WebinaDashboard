<?php
/**
 * Accounting DB helpers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Table names and CRUD helpers.
 */
final class Accounting_Db {

	/**
	 * @param string $suffix Suffix without prefix.
	 * @return string
	 */
	public static function table( $suffix ) {
		return Webino_Dashboard_Rest_Base::accounting_table( $suffix );
	}

	/**
	 * @param string               $suffix Table suffix.
	 * @param array<string,mixed>  $args   Query args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_rows( $suffix, array $args = array() ) {
		global $wpdb;
		$table = self::table( $suffix );
		$page  = max( 1, (int) ( $args['page'] ?? 1 ) );
		$per   = min( 200, max( 1, (int) ( $args['per_page'] ?? 50 ) ) );
		$offset = ( $page - 1 ) * $per;
		$where  = 'WHERE 1=1';
		$params = array();

		if ( ! empty( $args['search'] ) && ! empty( $args['search_cols'] ) && is_array( $args['search_cols'] ) ) {
			$likes = array();
			$s     = '%' . $wpdb->esc_like( (string) $args['search'] ) . '%';
			foreach ( $args['search_cols'] as $col ) {
				$col = preg_replace( '/[^a-z0-9_]/', '', (string) $col );
				if ( $col ) {
					$likes[]  = "`{$col}` LIKE %s";
					$params[] = $s;
				}
			}
			if ( $likes ) {
				$where .= ' AND (' . implode( ' OR ', $likes ) . ')';
			}
		}
		if ( ! empty( $args['status'] ) ) {
			$where   .= ' AND status = %s';
			$params[] = sanitize_key( (string) $args['status'] );
		}
		if ( ! empty( $args['type'] ) ) {
			$where   .= ' AND type = %s';
			$params[] = sanitize_key( (string) $args['type'] );
		}
		if ( isset( $args['where_sql'] ) && is_string( $args['where_sql'] ) && '' !== $args['where_sql'] ) {
			$where .= ' ' . $args['where_sql'];
			if ( ! empty( $args['where_params'] ) && is_array( $args['where_params'] ) ) {
				$params = array_merge( $params, $args['where_params'] );
			}
		}

		$order = ! empty( $args['order'] ) ? (string) $args['order'] : 'id DESC';
		$order = preg_replace( '/[^a-z0-9_\s,]/', '', strtolower( $order ) );

		$count_sql = "SELECT COUNT(*) FROM {$table} {$where}";
		$list_sql  = "SELECT * FROM {$table} {$where} ORDER BY {$order} LIMIT %d OFFSET %d";

		if ( $params ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			$total = (int) $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) );
			$params2 = array_merge( $params, array( $per, $offset ) );
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			$rows = $wpdb->get_results( $wpdb->prepare( $list_sql, $params2 ), ARRAY_A );
		} else {
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$total = (int) $wpdb->get_var( $count_sql );
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$rows = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table} ORDER BY {$order} LIMIT %d OFFSET %d", $per, $offset ), ARRAY_A );
		}

		return array(
			'items' => is_array( $rows ) ? $rows : array(),
			'total' => $total,
		);
	}

	/**
	 * Alias for list_rows.
	 *
	 * @param string              $suffix Table suffix.
	 * @param array<string,mixed> $args   Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function paginate( $suffix, array $args = array() ) {
		return self::list_rows( $suffix, $args );
	}

	/**
	 * @param string $suffix Suffix.
	 * @param int    $id     ID.
	 * @return array<string,mixed>|null
	 */
	public static function get_row( $suffix, $id ) {
		global $wpdb;
		$table = self::table( $suffix );
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", absint( $id ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return is_array( $row ) ? $row : null;
	}

	/**
	 * @param string              $suffix Suffix.
	 * @param array<string,mixed> $data   Data.
	 * @param array<string>|null  $format Formats.
	 * @return int|WP_Error Insert ID.
	 */
	public static function insert( $suffix, array $data, $format = null ) {
		global $wpdb;
		$ok = $wpdb->insert( self::table( $suffix ), $data, $format );
		if ( false === $ok ) {
			return new WP_Error( 'acc_db_insert', $wpdb->last_error ?: __( 'Insert failed.', 'webino-dashboard' ) );
		}
		return (int) $wpdb->insert_id;
	}

	/**
	 * @param string              $suffix Suffix.
	 * @param int                 $id     ID.
	 * @param array<string,mixed> $data   Data.
	 * @param array<string>|null  $format Formats.
	 * @return true|WP_Error
	 */
	public static function update( $suffix, $id, array $data, $format = null ) {
		global $wpdb;
		$ok = $wpdb->update( self::table( $suffix ), $data, array( 'id' => absint( $id ) ), $format, array( '%d' ) );
		if ( false === $ok ) {
			return new WP_Error( 'acc_db_update', $wpdb->last_error ?: __( 'Update failed.', 'webino-dashboard' ) );
		}
		return true;
	}

	/**
	 * @param string $suffix Suffix.
	 * @param int    $id     ID.
	 * @return true|WP_Error
	 */
	public static function delete( $suffix, $id ) {
		global $wpdb;
		$ok = $wpdb->delete( self::table( $suffix ), array( 'id' => absint( $id ) ), array( '%d' ) );
		if ( false === $ok ) {
			return new WP_Error( 'acc_db_delete', $wpdb->last_error ?: __( 'Delete failed.', 'webino-dashboard' ) );
		}
		return true;
	}
}
