<?php
/**
 * Accounting products linked to WooCommerce.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Products / SSTID tax meta.
 */
final class Accounting_Products {

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_all( array $args = array() ) {
		$args['search_cols'] = array( 'name', 'barcode', 'sstid' );
		return Accounting_Db::list_rows( 'products', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create( array $data ) {
		$name = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		if ( '' === $name ) {
			return new WP_Error( 'acc_product_name', __( 'Product name is required.', 'webino-dashboard' ) );
		}
		$id = Accounting_Db::insert( 'products', self::row( $data ) );
		if ( ! is_wp_error( $id ) ) {
			do_action( 'webino_acc_product_saved', (int) $id );
		}
		return $id;
	}

	/**
	 * @param int                 $id   ID.
	 * @param array<string,mixed> $data Data.
	 * @return true|WP_Error
	 */
	public static function update( $id, array $data ) {
		if ( ! Accounting_Db::get_row( 'products', $id ) ) {
			return new WP_Error( 'acc_not_found', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$res = Accounting_Db::update( 'products', $id, self::row( $data, false ) );
		if ( ! is_wp_error( $res ) ) {
			do_action( 'webino_acc_product_saved', absint( $id ) );
		}
		return $res;
	}

	/**
	 * Bulk update SSTID / VAT from CSV-like rows.
	 *
	 * @param array<int,array<string,mixed>> $rows Rows with wc_product_id or id + sstid/vat_rate.
	 * @return array{updated:int,errors:array<int,string>}
	 */
	public static function bulk_tax_meta( array $rows ) {
		$updated = 0;
		$errors  = array();
		foreach ( $rows as $i => $row ) {
			$id = absint( $row['id'] ?? 0 );
			if ( ! $id && ! empty( $row['wc_product_id'] ) ) {
				$id = self::id_by_wc( (int) $row['wc_product_id'] );
				if ( ! $id ) {
					$sync = self::upsert_from_wc( (int) $row['wc_product_id'] );
					$id   = is_wp_error( $sync ) ? 0 : $sync;
				}
			}
			if ( ! $id ) {
				$errors[] = sprintf( 'row %d: missing product', $i + 1 );
				continue;
			}
			$upd = array();
			if ( isset( $row['sstid'] ) ) {
				$upd['sstid'] = sanitize_text_field( (string) $row['sstid'] );
			}
			if ( isset( $row['vat_rate'] ) ) {
				$upd['vat_rate'] = (float) $row['vat_rate'];
			}
			if ( isset( $row['tax_exempt'] ) ) {
				$upd['tax_exempt'] = (int) ! empty( $row['tax_exempt'] );
			}
			if ( $upd ) {
				$r = Accounting_Db::update( 'products', $id, $upd );
				if ( is_wp_error( $r ) ) {
					$errors[] = $r->get_error_message();
				} else {
					++$updated;
					if ( ! empty( $row['wc_product_id'] ) ) {
						update_post_meta( (int) $row['wc_product_id'], '_webino_acc_sstid', $upd['sstid'] ?? '' );
						if ( isset( $upd['vat_rate'] ) ) {
							update_post_meta( (int) $row['wc_product_id'], '_webino_acc_vat_rate', $upd['vat_rate'] );
						}
					}
				}
			}
		}
		return array( 'updated' => $updated, 'errors' => $errors );
	}

	/**
	 * @param int $wc_product_id WC product ID.
	 * @return int
	 */
	public static function id_by_wc( $wc_product_id ) {
		global $wpdb;
		$table = Accounting_Db::table( 'products' );
		return absint( $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE wc_product_id = %d LIMIT 1", absint( $wc_product_id ) ) ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	}

	/**
	 * @param int $wc_product_id WC ID.
	 * @return int|WP_Error
	 */
	public static function upsert_from_wc( $wc_product_id ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'acc_no_wc', __( 'WooCommerce not available.', 'webino-dashboard' ) );
		}
		$p = wc_get_product( absint( $wc_product_id ) );
		if ( ! $p ) {
			return new WP_Error( 'acc_wc_product', __( 'Woo product not found.', 'webino-dashboard' ) );
		}
		$existing = self::id_by_wc( $p->get_id() );
		$cogs     = (float) $p->get_meta( '_wfcp_purchase_price' );
		$sstid    = (string) ( $p->get_meta( '_webino_moadian_sstid' ) ?: $p->get_meta( '_webino_acc_sstid' ) );
		$vat      = $p->get_meta( '_webino_moadian_vat_rate' );
		if ( '' === (string) $vat ) {
			$vat = $p->get_meta( '_webino_acc_vat_rate' );
		}
		$row      = array(
			'name'                  => $p->get_name(),
			'barcode'               => $p->get_sku(),
			'buy_price'             => $cogs,
			'sell_price'            => (float) $p->get_regular_price(),
			'inventory_controlled'  => $p->get_manage_stock() ? 1 : 0,
			'wc_product_id'         => $p->get_id(),
			'sstid'                 => $sstid ?: null,
			'vat_rate'              => '' !== (string) $vat ? (float) $vat : (float) Accounting_Config::get()['default_vat_rate'],
			'tax_exempt'            => '1' === (string) $p->get_meta( '_webino_moadian_tax_exempt' ) ? 1 : 0,
		);
		if ( $existing ) {
			Accounting_Db::update( 'products', $existing, $row );
			return $existing;
		}
		return Accounting_Db::insert( 'products', $row );
	}

	/**
	 * @param array<string,mixed> $data   Data.
	 * @param bool                $create Create mode.
	 * @return array<string,mixed>
	 */
	private static function row( array $data, $create = true ) {
		$out = array();
		if ( $create || isset( $data['name'] ) ) {
			$out['name'] = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		}
		foreach ( array( 'unit', 'barcode', 'category', 'sstid' ) as $k ) {
			if ( $create || isset( $data[ $k ] ) ) {
				$out[ $k ] = sanitize_text_field( (string) ( $data[ $k ] ?? '' ) );
			}
		}
		foreach ( array( 'buy_price', 'sell_price', 'vat_rate' ) as $k ) {
			if ( $create || isset( $data[ $k ] ) ) {
				$out[ $k ] = (float) ( $data[ $k ] ?? 0 );
			}
		}
		foreach ( array( 'inventory_controlled', 'tax_exempt' ) as $k ) {
			if ( $create || isset( $data[ $k ] ) ) {
				$out[ $k ] = (int) ! empty( $data[ $k ] );
			}
		}
		foreach ( array( 'wc_product_id', 'unit_id', 'cogs_account_id', 'sales_account_id' ) as $k ) {
			if ( $create || array_key_exists( $k, $data ) ) {
				$out[ $k ] = ! empty( $data[ $k ] ) ? absint( $data[ $k ] ) : null;
			}
		}
		return $out;
	}
}
