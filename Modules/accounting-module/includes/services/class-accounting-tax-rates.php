<?php
/**
 * Versioned tax rate tables.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * VAT + art.131 + corporate rate versions.
 */
final class Accounting_Tax_Rates {
	const SEED_OPTION = 'webino_accounting_tax_rates_seeded';

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
		$table = Accounting_Db::table( 'tax_rate_versions' );
		$n     = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $n > 0 ) {
			return;
		}
		$art131 = array(
			array( 'up_to' => 2000000000, 'rate' => 15 ),
			array( 'up_to' => 4000000000, 'rate' => 20 ),
			array( 'up_to' => 0, 'rate' => 25 ),
		);
		$special = array(
			'tobacco'  => 25,
			'beverage' => 16,
			'fuel'     => 15,
		);
		$wpdb->insert(
			$table,
			array(
				'label'               => '1404-1405 default',
				'vat_general'         => 10,
				'special_rates_json'  => wp_json_encode( $special ),
				'art131_brackets_json'=> wp_json_encode( $art131 ),
				'corporate_rate'      => 25,
				'effective_from'      => '2025-03-21',
				'source_note'         => 'Seed from budget-law general VAT 10%; art.131 brackets illustrative — refresh from intamedia.ir / tax.gov.ir.',
				'is_active'           => 1,
			),
			array( '%s', '%f', '%s', '%s', '%f', '%s', '%s', '%d' )
		);
	}

	/**
	 * Active version for a date (or latest active).
	 *
	 * @param string|null $as_of Y-m-d.
	 * @return array<string,mixed>|null
	 */
	public static function active( $as_of = null ) {
		global $wpdb;
		$table = Accounting_Db::table( 'tax_rate_versions' );
		$as_of = $as_of ?: gmdate( 'Y-m-d' );
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE is_active = 1 AND effective_from <= %s ORDER BY effective_from DESC, id DESC LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$as_of
			),
			ARRAY_A
		);
		if ( ! is_array( $row ) ) {
			$row = $wpdb->get_row( "SELECT * FROM {$table} ORDER BY id DESC LIMIT 1", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}
		return is_array( $row ) ? self::normalize( $row ) : null;
	}

	/**
	 * @param array<string,mixed> $row Row.
	 * @return array<string,mixed>
	 */
	public static function normalize( array $row ) {
		$special = json_decode( (string) ( $row['special_rates_json'] ?? '' ), true );
		$art131  = json_decode( (string) ( $row['art131_brackets_json'] ?? '' ), true );
		$row['special_rates']  = is_array( $special ) ? $special : array();
		$row['art131_brackets']= is_array( $art131 ) ? $art131 : array();
		$row['vat_general']    = (float) ( $row['vat_general'] ?? 10 );
		$row['corporate_rate'] = (float) ( $row['corporate_rate'] ?? 25 );
		return $row;
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return int|WP_Error
	 */
	public static function create_version( array $data ) {
		global $wpdb;
		$table = Accounting_Db::table( 'tax_rate_versions' );
		$active = ! empty( $data['is_active'] );
		if ( $active ) {
			$wpdb->query( "UPDATE {$table} SET is_active = 0" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}
		$ok = $wpdb->insert(
			$table,
			array(
				'label'                => sanitize_text_field( (string) ( $data['label'] ?? 'custom' ) ),
				'vat_general'          => (float) ( $data['vat_general'] ?? 10 ),
				'special_rates_json'   => wp_json_encode( is_array( $data['special_rates'] ?? null ) ? $data['special_rates'] : array() ),
				'art131_brackets_json' => wp_json_encode( is_array( $data['art131_brackets'] ?? null ) ? $data['art131_brackets'] : array() ),
				'corporate_rate'       => (float) ( $data['corporate_rate'] ?? 25 ),
				'effective_from'       => sanitize_text_field( (string) ( $data['effective_from'] ?? gmdate( 'Y-m-d' ) ) ),
				'source_note'          => sanitize_textarea_field( (string) ( $data['source_note'] ?? '' ) ),
				'is_active'            => $active ? 1 : 0,
			),
			array( '%s', '%f', '%s', '%s', '%f', '%s', '%s', '%d' )
		);
		if ( ! $ok ) {
			return new WP_Error( 'acc_tax_rate', __( 'Could not save tax rate version.', 'webino-dashboard' ) );
		}
		return (int) $wpdb->insert_id;
	}
}
