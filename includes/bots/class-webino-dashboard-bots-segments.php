<?php
/**
 * Broadcast audience segments for shop bots.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolve WP user IDs for segmented broadcasts.
 */
final class Webino_Dashboard_Bots_Segments {

	/**
	 * @param string               $segment Segment key.
	 * @param array<string, mixed> $args    Optional filters (provider, product_id, limit, days).
	 * @return list<int>
	 */
	public static function resolve_user_ids( $segment, $args = array() ) {
		$segment  = sanitize_key( (string) $segment );
		$args     = is_array( $args ) ? $args : array();
		$provider = isset( $args['provider'] ) ? sanitize_key( (string) $args['provider'] ) : '';
		$limit    = isset( $args['limit'] ) ? max( 1, min( 5000, (int) $args['limit'] ) ) : 2000;
		$chat_meta = 'bale' === $provider
			? 'woobale_chat_id'
			: ( 'telegram' === $provider ? 'webino_dashboard_telegram_chat_id' : '' );

		switch ( $segment ) {
			case 'buyers':
				return self::users_with_orders( true, $chat_meta, $limit );
			case 'never_bought':
				return self::users_with_orders( false, $chat_meta, $limit );
			case 'recent':
				$days = isset( $args['days'] ) ? max( 1, (int) $args['days'] ) : 30;
				return self::recent_buyers( $days, $chat_meta, $limit );
			case 'vip':
				return self::vip_users( $chat_meta, $limit );
			case 'inactive_30':
				return self::inactive_users( 30, $chat_meta, $limit );
			case 'sku_viewers':
				$pid = isset( $args['product_id'] ) ? (int) $args['product_id'] : ( isset( $args['sku'] ) ? (int) $args['sku'] : 0 );
				return self::sku_viewers( $pid, $chat_meta, $limit );
			case 'all':
			default:
				return self::linked_users( $chat_meta, $limit );
		}
	}

	/**
	 * @param string $chat_meta Meta key or empty for either provider.
	 * @param int    $limit Limit.
	 * @return list<int>
	 */
	private static function linked_users( $chat_meta, $limit ) {
		if ( $chat_meta !== '' ) {
			$ids = get_users(
				array(
					'meta_key'     => $chat_meta,
					'meta_compare' => 'EXISTS',
					'number'       => $limit,
					'fields'       => 'ID',
				)
			);
			return array_map( 'intval', (array) $ids );
		}
		$bale = get_users(
			array(
				'meta_key'     => 'woobale_chat_id',
				'meta_compare' => 'EXISTS',
				'number'       => $limit,
				'fields'       => 'ID',
			)
		);
		$tg = get_users(
			array(
				'meta_key'     => 'webino_dashboard_telegram_chat_id',
				'meta_compare' => 'EXISTS',
				'number'       => $limit,
				'fields'       => 'ID',
			)
		);
		return array_values( array_unique( array_map( 'intval', array_merge( (array) $bale, (array) $tg ) ) ) );
	}

	/**
	 * @param bool   $has_orders Buyers vs never bought.
	 * @param string $chat_meta Chat meta.
	 * @param int    $limit Limit.
	 * @return list<int>
	 */
	private static function users_with_orders( $has_orders, $chat_meta, $limit ) {
		$linked = self::linked_users( $chat_meta, $limit * 2 );
		$out    = array();
		foreach ( $linked as $uid ) {
			$n = function_exists( 'wc_get_customer_order_count' )
				? (int) wc_get_customer_order_count( $uid )
				: 0;
			if ( $has_orders ? $n > 0 : $n < 1 ) {
				$out[] = $uid;
			}
			if ( count( $out ) >= $limit ) {
				break;
			}
		}
		return $out;
	}

	/**
	 * @param int    $days Days.
	 * @param string $chat_meta Chat meta.
	 * @param int    $limit Limit.
	 * @return list<int>
	 */
	private static function recent_buyers( $days, $chat_meta, $limit ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return array();
		}
		$after = gmdate( 'Y-m-d H:i:s', time() - ( $days * DAY_IN_SECONDS ) );
		$orders = wc_get_orders(
			array(
				'limit'        => $limit * 3,
				'status'       => array( 'wc-processing', 'wc-completed', 'wc-on-hold' ),
				'date_created' => '>' . $after,
				'return'       => 'objects',
			)
		);
		$out = array();
		foreach ( (array) $orders as $order ) {
			if ( ! $order instanceof WC_Order ) {
				continue;
			}
			$uid = (int) $order->get_user_id();
			if ( $uid < 1 || isset( $out[ $uid ] ) ) {
				continue;
			}
			if ( $chat_meta !== '' && ! get_user_meta( $uid, $chat_meta, true ) ) {
				continue;
			}
			$out[ $uid ] = $uid;
			if ( count( $out ) >= $limit ) {
				break;
			}
		}
		return array_values( $out );
	}

	/**
	 * VIP = diamond/gold tier or high points (>= gold min).
	 *
	 * @param string $chat_meta Chat meta.
	 * @param int    $limit Limit.
	 * @return list<int>
	 */
	private static function vip_users( $chat_meta, $limit ) {
		$min_pts   = 300;
		$pts_meta  = class_exists( 'Webino_Dashboard_Bots_Loyalty', false )
			? Webino_Dashboard_Bots_Loyalty::META_POINTS
			: '_webino_bot_loyalty_points';
		if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			$s     = Webino_Dashboard_Bots_Loyalty::settings();
			$tiers = isset( $s['tiers'] ) && is_array( $s['tiers'] ) ? $s['tiers'] : array();
			foreach ( $tiers as $t ) {
				if ( ! is_array( $t ) ) {
					continue;
				}
				$id = sanitize_key( (string) ( $t['id'] ?? '' ) );
				if ( in_array( $id, array( 'gold', 'diamond', 'platinum' ), true ) ) {
					$min = isset( $t['min'] ) ? (int) $t['min'] : 0;
					if ( 'gold' === $id || $min < $min_pts ) {
						$min_pts = $min > 0 ? $min : $min_pts;
					}
				}
			}
		}
		$q = array(
			'meta_key'     => $pts_meta,
			'meta_value'   => (string) $min_pts,
			'meta_compare' => '>=',
			'meta_type'    => 'NUMERIC',
			'number'       => $limit,
			'fields'       => 'ID',
			'orderby'      => 'meta_value_num',
			'order'        => 'DESC',
		);
		if ( $chat_meta !== '' ) {
			$q['meta_query'] = array(
				'relation' => 'AND',
				array(
					'key'     => $pts_meta,
					'value'   => $min_pts,
					'compare' => '>=',
					'type'    => 'NUMERIC',
				),
				array(
					'key'     => $chat_meta,
					'compare' => 'EXISTS',
				),
			);
			unset( $q['meta_key'], $q['meta_value'], $q['meta_compare'], $q['meta_type'] );
		}
		$ids = get_users( $q );
		$out = array();
		foreach ( (array) $ids as $uid ) {
			$uid = (int) $uid;
			if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
				$tier = Webino_Dashboard_Bots_Loyalty::tier_for_user( $uid );
				$tid  = isset( $tier['id'] ) ? (string) $tier['id'] : '';
				if ( ! in_array( $tid, array( 'gold', 'platinum', 'diamond' ), true )
					&& Webino_Dashboard_Bots_Loyalty::get_points( $uid ) < $min_pts ) {
					continue;
				}
			}
			$out[] = $uid;
		}
		return $out;
	}

	/**
	 * @param int    $days Days inactive.
	 * @param string $chat_meta Chat meta.
	 * @param int    $limit Limit.
	 * @return list<int>
	 */
	private static function inactive_users( $days, $chat_meta, $limit ) {
		$cut    = time() - ( max( 1, $days ) * DAY_IN_SECONDS );
		$linked = self::linked_users( $chat_meta, $limit * 3 );
		$out    = array();
		foreach ( $linked as $uid ) {
			$seen = (int) get_user_meta( $uid, '_webino_bot_last_seen', true );
			if ( $seen <= 0 ) {
				$seen = (int) get_user_meta( $uid, 'wc_last_active', true );
			}
			if ( $seen > 0 && $seen < $cut ) {
				$out[] = $uid;
			}
			if ( count( $out ) >= $limit ) {
				break;
			}
		}
		return $out;
	}

	/**
	 * Users who viewed a product in-bot (meta `_webino_bot_viewed_product_{id}`).
	 *
	 * @param int    $product_id Product ID.
	 * @param string $chat_meta Chat meta.
	 * @param int    $limit Limit.
	 * @return list<int>
	 */
	private static function sku_viewers( $product_id, $chat_meta, $limit ) {
		$product_id = (int) $product_id;
		if ( $product_id < 1 ) {
			return array();
		}
		$key = '_webino_bot_viewed_product_' . $product_id;
		$q   = array(
			'meta_key'     => $key,
			'meta_compare' => 'EXISTS',
			'number'       => $limit,
			'fields'       => 'ID',
		);
		if ( $chat_meta !== '' ) {
			$q['meta_query'] = array(
				'relation' => 'AND',
				array(
					'key'     => $key,
					'compare' => 'EXISTS',
				),
				array(
					'key'     => $chat_meta,
					'compare' => 'EXISTS',
				),
			);
			unset( $q['meta_key'], $q['meta_compare'] );
		}
		return array_map( 'intval', (array) get_users( $q ) );
	}
}
