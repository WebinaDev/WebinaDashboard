<?php

namespace Webino_Dashboard_Bots_Bale\Woo;

/**
 * Persistent per-user wishlist storage for bot flows.
 */
class UserWishlistContext {

	private const META_KEY = '_woobale_wishlist_product_ids';

	/**
	 * @return list<int>
	 */
	public function get_product_ids( int $user_id ): array {
		if ( $user_id < 1 ) {
			return array();
		}
		$raw = get_user_meta( $user_id, self::META_KEY, true );
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$ids = array_values(
			array_unique(
				array_filter(
					array_map( 'absint', $raw ),
					static function ( int $id ): bool {
						return $id > 0;
					}
				)
			)
		);
		return $ids;
	}

	public function has( int $user_id, int $product_id ): bool {
		if ( $user_id < 1 || $product_id < 1 ) {
			return false;
		}
		return in_array( $product_id, $this->get_product_ids( $user_id ), true );
	}

	public function add( int $user_id, int $product_id ): bool {
		if ( $user_id < 1 || $product_id < 1 ) {
			return false;
		}
		$ids = $this->get_product_ids( $user_id );
		if ( in_array( $product_id, $ids, true ) ) {
			return true;
		}
		$ids[] = $product_id;
		return $this->save_ids( $user_id, $ids );
	}

	public function remove( int $user_id, int $product_id ): bool {
		if ( $user_id < 1 || $product_id < 1 ) {
			return false;
		}
		$ids = array_values(
			array_filter(
				$this->get_product_ids( $user_id ),
				static function ( int $id ) use ( $product_id ): bool {
					return $id !== $product_id;
				}
			)
		);
		return $this->save_ids( $user_id, $ids );
	}

	/**
	 * @param list<int> $ids
	 */
	private function save_ids( int $user_id, array $ids ): bool {
		$sanitized = array_values(
			array_unique(
				array_filter(
					array_map( 'absint', $ids ),
					static function ( int $id ): bool {
						return $id > 0;
					}
				)
			)
		);
		return false !== update_user_meta( $user_id, self::META_KEY, $sanitized );
	}
}
