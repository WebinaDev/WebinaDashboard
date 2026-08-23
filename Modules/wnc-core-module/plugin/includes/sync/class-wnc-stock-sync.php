<?php
/**
 * Stock sync.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Push stock to marketplaces.
 */
class WNC_Stock_Sync {

	/**
	 * Push stock for mapped product.
	 *
	 * @param string              $platform Platform.
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job ID.
	 * @return bool
	 */
	public static function push_for_product( $platform, array $payload, $job_id = 0 ) {
		$adapter = WNC_Platform_Registry::get( $platform );
		if ( ! $adapter || ! $adapter->is_live() ) {
			return false;
		}

		$map = null;
		if ( ! empty( $payload['wc_product_id'] ) ) {
			$map = WNC_Mapper::get( (int) $payload['wc_product_id'], (int) ( $payload['wc_variation_id'] ?? 0 ), $platform );
		} elseif ( ! empty( $payload['product_id'] ) ) {
			$pid = (int) $payload['product_id'];
			$p   = wc_get_product( $pid );
			if ( $p && $p->is_type( 'variation' ) ) {
				$map = WNC_Mapper::get( $p->get_parent_id(), $pid, $platform );
			} elseif ( $p ) {
				$map = WNC_Mapper::get( $pid, 0, $platform );
			}
		}

		if ( ! $map || empty( $map['sync_enabled'] ) ) {
			return true;
		}

		$target = WNC_Mapper::target_id( $map );
		$qty    = WNC_Pricing::get_stock_qty( $target );
		$result = $adapter->push_stock( $map, $qty );

		if ( is_wp_error( $result ) ) {
			WNC_Mapper::upsert(
				array(
					'wc_product_id'   => $map['wc_product_id'],
					'wc_variation_id' => $map['wc_variation_id'],
					'platform'        => $platform,
					'last_error'      => $result->get_error_message(),
				)
			);
			WNC_Logger::error( $result->get_error_message(), $platform, 'stock', array( 'job_id' => $job_id ) );
			return false;
		}

		WNC_Mapper::upsert(
			array(
				'wc_product_id'     => $map['wc_product_id'],
				'wc_variation_id'   => $map['wc_variation_id'],
				'platform'          => $platform,
				'remote_product_id' => $map['remote_product_id'],
				'remote_variant_id' => $map['remote_variant_id'],
				'remote_stock'      => $qty,
				'last_error'        => null,
				'touch_sync'        => true,
			)
		);
		WNC_Logger::info( 'Stock pushed', $platform, 'stock', array( 'job_id' => $job_id, 'qty' => $qty ) );
		return true;
	}
}
