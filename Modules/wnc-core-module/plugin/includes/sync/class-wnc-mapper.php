<?php
/**
 * Product mapper.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * CRUD for product mappings.
 */
class WNC_Mapper {

	/**
	 * Get map row.
	 *
	 * @param int    $wc_product_id Product ID.
	 * @param int    $wc_variation_id Variation ID (0 for simple).
	 * @param string $platform Platform.
	 * @return array|null
	 */
	public static function get( $wc_product_id, $wc_variation_id, $platform ) {
		global $wpdb;
		$table = WNC_Storage::product_map_table();
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE wc_product_id = %d AND wc_variation_id = %d AND platform = %s",
				(int) $wc_product_id,
				(int) $wc_variation_id,
				sanitize_key( $platform )
			),
			ARRAY_A
		);
		return $row ? $row : null;
	}

	/**
	 * Get all maps for a product (and its variations if parent).
	 *
	 * @param int $wc_product_id Product ID.
	 * @return array
	 */
	public static function get_for_product( $wc_product_id ) {
		global $wpdb;
		$table = WNC_Storage::product_map_table();
		return $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE wc_product_id = %d OR wc_variation_id = %d ORDER BY platform ASC",
				(int) $wc_product_id,
				(int) $wc_product_id
			),
			ARRAY_A
		);
	}

	/**
	 * Find WC product by remote IDs.
	 *
	 * @param string $platform Platform.
	 * @param string $remote_product_id Remote product.
	 * @param string $remote_variant_id Remote variant.
	 * @return array|null
	 */
	public static function find_by_remote( $platform, $remote_product_id, $remote_variant_id = '' ) {
		global $wpdb;
		$table = WNC_Storage::product_map_table();
		if ( '' !== $remote_variant_id ) {
			return $wpdb->get_row(
				$wpdb->prepare(
					"SELECT * FROM {$table} WHERE platform = %s AND remote_variant_id = %s LIMIT 1",
					sanitize_key( $platform ),
					sanitize_text_field( $remote_variant_id )
				),
				ARRAY_A
			);
		}
		return $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE platform = %s AND remote_product_id = %s LIMIT 1",
				sanitize_key( $platform ),
				sanitize_text_field( $remote_product_id )
			),
			ARRAY_A
		);
	}

	/**
	 * Upsert mapping.
	 *
	 * @param array<string,mixed> $data Data.
	 * @return int|false Map ID.
	 */
	public static function upsert( array $data ) {
		global $wpdb;
		$table = WNC_Storage::product_map_table();
		$now   = current_time( 'mysql' );

		$wc_product_id   = (int) ( $data['wc_product_id'] ?? 0 );
		$wc_variation_id = (int) ( $data['wc_variation_id'] ?? 0 );
		$platform        = sanitize_key( $data['platform'] ?? '' );

		if ( $wc_product_id <= 0 || '' === $platform ) {
			return false;
		}

		$existing = self::get( $wc_product_id, $wc_variation_id, $platform );
		$row      = array(
			'wc_product_id'     => $wc_product_id,
			'wc_variation_id'   => $wc_variation_id,
			'platform'          => $platform,
			'remote_product_id' => sanitize_text_field( (string) ( $data['remote_product_id'] ?? '' ) ),
			'remote_variant_id' => sanitize_text_field( (string) ( $data['remote_variant_id'] ?? '' ) ),
			'sync_enabled'      => isset( $data['sync_enabled'] ) ? (int) (bool) $data['sync_enabled'] : 1,
			'updated_at'        => $now,
		);

		if ( array_key_exists( 'remote_url', $data ) ) {
			$url = trim( (string) $data['remote_url'] );
			$row['remote_url'] = '' === $url ? null : esc_url_raw( $url );
		}
		if ( array_key_exists( 'remote_price', $data ) ) {
			$row['remote_price'] = null === $data['remote_price'] ? null : (int) $data['remote_price'];
		}
		if ( array_key_exists( 'remote_stock', $data ) ) {
			$row['remote_stock'] = null === $data['remote_stock'] ? null : (int) $data['remote_stock'];
		}
		if ( array_key_exists( 'last_error', $data ) ) {
			$row['last_error'] = $data['last_error'] ? sanitize_text_field( (string) $data['last_error'] ) : null;
		}
		if ( ! empty( $data['touch_sync'] ) ) {
			$row['last_sync_at'] = $now;
		}

		if ( $existing ) {
			$wpdb->update( $table, $row, array( 'id' => (int) $existing['id'] ) );
			return (int) $existing['id'];
		}

		$row['created_at'] = $now;
		$wpdb->insert( $table, $row );
		return (int) $wpdb->insert_id;
	}

	/**
	 * Delete mapping.
	 *
	 * @param int    $wc_product_id Product.
	 * @param int    $wc_variation_id Variation.
	 * @param string $platform Platform.
	 * @return bool
	 */
	public static function delete( $wc_product_id, $wc_variation_id, $platform ) {
		global $wpdb;
		$table = WNC_Storage::product_map_table();
		return false !== $wpdb->delete(
			$table,
			array(
				'wc_product_id'   => (int) $wc_product_id,
				'wc_variation_id' => (int) $wc_variation_id,
				'platform'        => sanitize_key( $platform ),
			),
			array( '%d', '%d', '%s' )
		);
	}

	/**
	 * All enabled maps for a platform.
	 *
	 * @param string $platform Platform.
	 * @param int    $limit Limit.
	 * @return array
	 */
	public static function list_enabled( $platform, $limit = 100 ) {
		global $wpdb;
		$table = WNC_Storage::product_map_table();
		return $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE platform = %s AND sync_enabled = 1 ORDER BY id ASC LIMIT %d",
				sanitize_key( $platform ),
				max( 1, (int) $limit )
			),
			ARRAY_A
		);
	}

	/**
	 * Resolve target product ID for sync (variation if set).
	 *
	 * @param array $map Map row.
	 * @return int
	 */
	public static function target_id( array $map ) {
		$vid = (int) ( $map['wc_variation_id'] ?? 0 );
		return $vid > 0 ? $vid : (int) ( $map['wc_product_id'] ?? 0 );
	}
}
