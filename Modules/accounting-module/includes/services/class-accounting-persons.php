<?php
/**
 * Persons (customers / suppliers).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Persons CRUD + WC customer sync helpers.
 */
final class Accounting_Persons {

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array{items:array<int,array<string,mixed>>,total:int}
	 */
	public static function list_all( array $args = array() ) {
		$args['search_cols'] = array( 'name', 'national_id', 'economic_code', 'mobile' );
		return Accounting_Db::list_rows( 'persons', $args );
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create( array $data ) {
		$name = sanitize_text_field( (string) ( $data['name'] ?? '' ) );
		if ( '' === $name ) {
			return new WP_Error( 'acc_person_name', __( 'Person name is required.', 'webino-dashboard' ) );
		}
		$id = Accounting_Db::insert( 'persons', self::sanitize_row( $data ) );
		if ( ! is_wp_error( $id ) ) {
			do_action( 'webino_acc_person_saved', (int) $id );
		}
		return $id;
	}

	/**
	 * @param int                 $id   ID.
	 * @param array<string,mixed> $data Data.
	 * @return true|WP_Error
	 */
	public static function update( $id, array $data ) {
		if ( ! Accounting_Db::get_row( 'persons', $id ) ) {
			return new WP_Error( 'acc_not_found', __( 'Person not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$res = Accounting_Db::update( 'persons', $id, self::sanitize_row( $data, false ) );
		if ( ! is_wp_error( $res ) ) {
			do_action( 'webino_acc_person_saved', absint( $id ) );
		}
		return $res;
	}

	/**
	 * Find or create from WC customer / order billing.
	 *
	 * @param WC_Order $order Order.
	 * @return int Person ID.
	 */
	public static function upsert_from_order( WC_Order $order ) {
		global $wpdb;
		$table   = Accounting_Db::table( 'persons' );
		$user_id = (int) $order->get_user_id();
		$nid     = (string) $order->get_meta( '_billing_national_id' );
		if ( '' === $nid ) {
			$nid = (string) $order->get_meta( 'billing_national_id' );
		}
		$econ = (string) $order->get_meta( '_billing_economic_code' );
		if ( '' === $econ ) {
			$econ = (string) $order->get_meta( 'billing_economic_code' );
		}
		$company = trim( (string) $order->get_billing_company() );
		$kind    = '' !== $company || '' !== $econ ? 'legal' : 'natural';

		$id = 0;
		if ( $user_id > 0 ) {
			$id = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE wp_user_id = %d LIMIT 1", $user_id ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}
		if ( ! $id && '' !== $nid ) {
			$id = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE national_id = %s LIMIT 1", $nid ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}

		$name = trim( $order->get_formatted_billing_full_name() );
		if ( '' === $name ) {
			$name = $company ?: ( 'Customer #' . $order->get_id() );
		}

		$row = array(
			'name'          => $name,
			'type'          => 'customer',
			'person_kind'   => $kind,
			'national_id'   => $nid ?: null,
			'economic_code' => $econ ?: null,
			'mobile'        => (string) $order->get_billing_phone(),
			'address'       => trim( $order->get_billing_address_1() . ' ' . $order->get_billing_address_2() ),
			'province'      => (string) $order->get_billing_state(),
			'city'          => (string) $order->get_billing_city(),
			'postal_code'    => (string) $order->get_billing_postcode(),
			'buyer_type'    => 'legal' === $kind ? 2 : 1,
			'wp_user_id'    => $user_id ?: null,
			'sync_source'   => 'woocommerce',
		);

		if ( $id > 0 ) {
			Accounting_Db::update( 'persons', $id, $row );
			return $id;
		}
		$new = Accounting_Db::insert( 'persons', $row );
		return is_wp_error( $new ) ? 0 : $new;
	}

	/**
	 * @param array<string,mixed> $data   Data.
	 * @param bool                $create Full row.
	 * @return array<string,mixed>
	 */
	private static function sanitize_row( array $data, $create = true ) {
		$out = array();
		$map = array(
			'name'          => 'sanitize_text_field',
			'type'          => 'sanitize_key',
			'person_kind'   => 'sanitize_key',
			'legal_type'    => 'sanitize_text_field',
			'national_id'   => 'sanitize_text_field',
			'economic_code' => 'sanitize_text_field',
			'postal_code'    => 'sanitize_text_field',
			'mobile'        => 'sanitize_text_field',
			'address'       => 'sanitize_textarea_field',
			'province'      => 'sanitize_text_field',
			'city'          => 'sanitize_text_field',
			'category'      => 'sanitize_text_field',
			'sync_source'   => 'sanitize_key',
		);
		foreach ( $map as $k => $fn ) {
			if ( $create || array_key_exists( $k, $data ) ) {
				$out[ $k ] = isset( $data[ $k ] ) ? call_user_func( $fn, (string) $data[ $k ] ) : ( $create ? '' : null );
			}
		}
		if ( $create || isset( $data['buyer_type'] ) ) {
			$out['buyer_type'] = isset( $data['buyer_type'] ) ? absint( $data['buyer_type'] ) : 1;
		}
		if ( $create || isset( $data['wp_user_id'] ) ) {
			$out['wp_user_id'] = ! empty( $data['wp_user_id'] ) ? absint( $data['wp_user_id'] ) : null;
		}
		if ( $create && empty( $out['name'] ) ) {
			$out['name'] = '';
		}
		if ( $create && empty( $out['type'] ) ) {
			$out['type'] = 'both';
		}
		if ( $create && empty( $out['person_kind'] ) ) {
			$out['person_kind'] = 'natural';
		}
		return array_filter(
			$out,
			static function ( $v ) {
				return null !== $v;
			}
		);
	}
}
