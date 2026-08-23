<?php
/**
 * Price sync.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Push prices to marketplaces.
 */
class WNC_Price_Sync {

	/**
	 * Push price for mapped product.
	 *
	 * @param string              $platform Platform.
	 * @param array<string,mixed> $payload Payload with product_id / variation_id / map_id.
	 * @param int                 $job_id Job ID.
	 * @return bool
	 */
	public static function push_for_product( $platform, array $payload, $job_id = 0 ) {
		$adapter = WNC_Platform_Registry::get( $platform );
		if ( ! $adapter || ! $adapter->is_live() ) {
			WNC_Logger::error( 'Price push skipped — platform not live', $platform, 'price', array( 'job_id' => $job_id ) );
			return false;
		}

		$map = self::resolve_map( $platform, $payload );
		if ( ! $map ) {
			WNC_Logger::error( 'No product map for price push', $platform, 'price', array( 'job_id' => $job_id, 'payload' => $payload ) );
			return false;
		}
		if ( empty( $map['sync_enabled'] ) ) {
			return true;
		}

		$target = WNC_Mapper::target_id( $map );
		$price  = WNC_Pricing::get_price( $target, $platform );
		$remote = WNC_Pricing::to_remote_unit( $price, $platform );

		$result = $adapter->push_price( $map, $remote );
		if ( is_wp_error( $result ) ) {
			WNC_Mapper::upsert(
				array(
					'wc_product_id'   => $map['wc_product_id'],
					'wc_variation_id' => $map['wc_variation_id'],
					'platform'        => $platform,
					'last_error'      => $result->get_error_message(),
				)
			);
			WNC_Logger::error( $result->get_error_message(), $platform, 'price', array( 'job_id' => $job_id, 'map' => $map ) );
			return false;
		}

		WNC_Mapper::upsert(
			array(
				'wc_product_id'     => $map['wc_product_id'],
				'wc_variation_id'   => $map['wc_variation_id'],
				'platform'          => $platform,
				'remote_product_id' => $map['remote_product_id'],
				'remote_variant_id' => $map['remote_variant_id'],
				'remote_price'      => $remote,
				'last_error'        => null,
				'touch_sync'        => true,
			)
		);
		WNC_Logger::info( 'Price pushed', $platform, 'price', array( 'job_id' => $job_id, 'price' => $remote, 'product' => $target ) );
		return true;
	}

	/**
	 * Resolve map from payload.
	 *
	 * @param string $platform Platform.
	 * @param array  $payload Payload.
	 * @return array|null
	 */
	private static function resolve_map( $platform, array $payload ) {
		if ( ! empty( $payload['wc_product_id'] ) ) {
			return WNC_Mapper::get(
				(int) $payload['wc_product_id'],
				(int) ( $payload['wc_variation_id'] ?? 0 ),
				$platform
			);
		}
		$product_id = (int) ( $payload['product_id'] ?? 0 );
		if ( $product_id <= 0 ) {
			return null;
		}
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return null;
		}
		if ( $product->is_type( 'variation' ) ) {
			return WNC_Mapper::get( $product->get_parent_id(), $product_id, $platform );
		}
		return WNC_Mapper::get( $product_id, 0, $platform );
	}

	/**
	 * Enqueue push for product across enabled platforms.
	 *
	 * @param int $product_id Product or variation ID.
	 */
	public static function enqueue_for_product( $product_id ) {
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return;
		}

		$parent = $product->is_type( 'variation' ) ? $product->get_parent_id() : $product_id;
		$var_id = $product->is_type( 'variation' ) ? $product_id : 0;

		foreach ( WNC_Pricing::PLATFORMS as $platform ) {
			$settings = WNC_Settings::get_platform( $platform );
			if ( empty( $settings['enabled'] ) || empty( $settings['auto_sync'] ) ) {
				continue;
			}
			$map = WNC_Mapper::get( $parent, $var_id, $platform );
			if ( ! $map || empty( $map['sync_enabled'] ) ) {
				continue;
			}
			WNC_Jobs::enqueue(
				'push_price_stock',
				array(
					'wc_product_id'   => $parent,
					'wc_variation_id' => $var_id,
					'product_id'      => $product_id,
				),
				$platform,
				5
			);
		}
	}
}
