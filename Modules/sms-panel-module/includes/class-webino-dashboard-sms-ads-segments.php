<?php
/**
 * Resolve WooCommerce local audiences for SMS ads.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Store-local phone segments for SMS advertising.
 */
final class Webino_Dashboard_Sms_Ads_Segments {

	const CAP = 5000;

	/**
	 * @return array<string,string>
	 */
	public static function segment_keys() {
		return array(
			'system_suggest'  => 'system_suggest',
			'retarget'        => 'retarget',
			'acquire'         => 'acquire',
			'city_customers'  => 'city_customers',
			'all_city'        => 'all_city',
			'vip_buyers'      => 'vip_buyers',
			'followers'       => 'followers',
		);
	}

	/**
	 * Normalize Iranian mobile to 09xxxxxxxxx.
	 *
	 * @param string $raw Raw phone.
	 * @return string Empty if invalid.
	 */
	public static function normalize_phone( $raw ) {
		$digits = preg_replace( '/\D+/', '', (string) $raw );
		if ( ! is_string( $digits ) || '' === $digits ) {
			return '';
		}
		if ( preg_match( '/^09\d{9}$/', $digits ) ) {
			return $digits;
		}
		if ( preg_match( '/^989\d{9}$/', $digits ) ) {
			return '0' . substr( $digits, 2 );
		}
		if ( preg_match( '/^9\d{9}$/', $digits ) ) {
			return '0' . $digits;
		}
		return '';
	}

	/**
	 * @param string               $segment Segment key.
	 * @param array<string,mixed>  $opts Options (include_phones, limit).
	 * @return array{count:int,sample:array<int,array{phone:string,name?:string}>,phones?:array<int,string>}
	 */
	public static function resolve( $segment, array $opts = array() ) {
		$segment = sanitize_key( (string) $segment );
		if ( ! isset( self::segment_keys()[ $segment ] ) ) {
			return array( 'count' => 0, 'sample' => array() );
		}

		$include_phones = ! empty( $opts['include_phones'] );
		$limit          = isset( $opts['limit'] ) ? max( 1, min( self::CAP, (int) $opts['limit'] ) ) : self::CAP;

		$map = array();
		switch ( $segment ) {
			case 'system_suggest':
				self::merge_phones( $map, self::phones_abandon_candidates() );
				self::merge_phones( $map, self::phones_category_affinity() );
				break;
			case 'retarget':
				self::merge_phones( $map, self::phones_past_customers( 30 ) );
				break;
			case 'acquire':
				self::merge_phones( $map, self::phones_acquire() );
				break;
			case 'city_customers':
				self::merge_phones( $map, self::phones_city( true ) );
				break;
			case 'all_city':
				self::merge_phones( $map, self::phones_city( false ) );
				break;
			case 'vip_buyers':
				self::merge_phones( $map, self::phones_vip( 3 ) );
				break;
			case 'followers':
				self::merge_phones( $map, self::phones_followers() );
				break;
		}

		$phones = array_keys( $map );
		$phones = array_slice( $phones, 0, $limit );
		$sample = array();
		foreach ( array_slice( $phones, 0, 5 ) as $p ) {
			$sample[] = array(
				'phone' => $p,
				'name'  => (string) ( $map[ $p ] ?? '' ),
			);
		}

		$out = array(
			'count'  => count( $phones ),
			'sample' => $sample,
		);
		if ( $include_phones ) {
			$out['phones'] = $phones;
		}
		return $out;
	}

	/**
	 * @param array<string,string> $map Phone => name.
	 * @param array<string,string> $add Additions.
	 * @return void
	 */
	private static function merge_phones( array &$map, array $add ) {
		foreach ( $add as $phone => $name ) {
			$n = self::normalize_phone( $phone );
			if ( '' === $n ) {
				continue;
			}
			if ( ! isset( $map[ $n ] ) ) {
				$map[ $n ] = (string) $name;
			}
		}
	}

	/**
	 * Shop base city from WooCommerce settings.
	 *
	 * @return string
	 */
	public static function store_city() {
		$city = (string) get_option( 'woocommerce_store_city', '' );
		if ( '' === $city && function_exists( 'WC' ) ) {
			$base = get_option( 'woocommerce_default_country', '' );
			// City is separate option; leave empty if unset.
		}
		return trim( $city );
	}

	/**
	 * Abandoned pending orders + users with recent cart activity.
	 *
	 * @return array<string,string>
	 */
	private static function phones_abandon_candidates() {
		$out = array();
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return $out;
		}
		$orders = wc_get_orders(
			array(
				'status'       => array( 'pending', 'on-hold' ),
				'limit'        => 400,
				'date_created' => '>' . ( time() - 14 * DAY_IN_SECONDS ),
				'return'       => 'objects',
			)
		);
		foreach ( $orders as $order ) {
			if ( ! is_a( $order, 'WC_Order' ) ) {
				continue;
			}
			$phone = self::normalize_phone( $order->get_billing_phone() );
			if ( '' === $phone ) {
				continue;
			}
			$out[ $phone ] = trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() );
		}

		$users = get_users(
			array(
				'number'     => 300,
				'meta_key'   => '_woocommerce_persistent_cart_' . get_current_blog_id(),
				'meta_compare' => 'EXISTS',
				'fields'     => array( 'ID', 'display_name' ),
			)
		);
		foreach ( $users as $u ) {
			$phone = self::normalize_phone( (string) get_user_meta( $u->ID, 'billing_phone', true ) );
			if ( '' === $phone ) {
				$phone = self::normalize_phone( (string) get_user_meta( $u->ID, 'phone', true ) );
			}
			if ( '' === $phone ) {
				continue;
			}
			$out[ $phone ] = (string) $u->display_name;
		}
		return $out;
	}

	/**
	 * Customers who bought in top product categories.
	 *
	 * @return array<string,string>
	 */
	private static function phones_category_affinity() {
		$out = array();
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return $out;
		}
		$orders = wc_get_orders(
			array(
				'status' => array( 'processing', 'completed' ),
				'limit'  => 200,
				'return' => 'objects',
			)
		);
		foreach ( $orders as $order ) {
			if ( ! is_a( $order, 'WC_Order' ) ) {
				continue;
			}
			$phone = self::normalize_phone( $order->get_billing_phone() );
			if ( '' === $phone ) {
				continue;
			}
			$out[ $phone ] = trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() );
		}
		return $out;
	}

	/**
	 * Past customers whose last paid order is older than $days.
	 *
	 * @param int $days Days.
	 * @return array<string,string>
	 */
	private static function phones_past_customers( $days = 30 ) {
		$out = array();
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return $out;
		}
		$cutoff = time() - ( max( 1, (int) $days ) * DAY_IN_SECONDS );
		$orders = wc_get_orders(
			array(
				'status' => array( 'processing', 'completed' ),
				'limit'  => 800,
				'return' => 'objects',
			)
		);
		$latest = array();
		foreach ( $orders as $order ) {
			if ( ! is_a( $order, 'WC_Order' ) ) {
				continue;
			}
			$phone = self::normalize_phone( $order->get_billing_phone() );
			if ( '' === $phone ) {
				continue;
			}
			$ts = $order->get_date_created() ? $order->get_date_created()->getTimestamp() : 0;
			if ( ! isset( $latest[ $phone ] ) || $ts > $latest[ $phone ]['ts'] ) {
				$latest[ $phone ] = array(
					'ts'   => $ts,
					'name' => trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ),
				);
			}
		}
		foreach ( $latest as $phone => $row ) {
			if ( (int) $row['ts'] <= $cutoff ) {
				$out[ $phone ] = (string) $row['name'];
			}
		}
		return $out;
	}

	/**
	 * Newsletter / phonebook phones without completed orders.
	 *
	 * @return array<string,string>
	 */
	private static function phones_acquire() {
		$followers = self::phones_followers();
		$buyers    = self::phones_category_affinity();
		$out       = array();
		foreach ( $followers as $phone => $name ) {
			if ( isset( $buyers[ $phone ] ) ) {
				continue;
			}
			$out[ $phone ] = $name;
		}
		return $out;
	}

	/**
	 * @param bool $purchasers_only Only phones that have orders.
	 * @return array<string,string>
	 */
	private static function phones_city( $purchasers_only ) {
		$out  = array();
		$city = self::store_city();
		if ( '' === $city || ! function_exists( 'wc_get_orders' ) ) {
			return $out;
		}
		$city_norm = mb_strtolower( $city );
		$orders    = wc_get_orders(
			array(
				'status' => $purchasers_only
					? array( 'processing', 'completed' )
					: array_keys( wc_get_order_statuses() ),
				'limit'  => 800,
				'return' => 'objects',
			)
		);
		foreach ( $orders as $order ) {
			if ( ! is_a( $order, 'WC_Order' ) ) {
				continue;
			}
			$oc = mb_strtolower( trim( (string) $order->get_billing_city() ) );
			if ( $oc !== $city_norm && false === mb_strpos( $oc, $city_norm ) && false === mb_strpos( $city_norm, $oc ) ) {
				continue;
			}
			$phone = self::normalize_phone( $order->get_billing_phone() );
			if ( '' === $phone ) {
				continue;
			}
			$out[ $phone ] = trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() );
		}

		if ( ! $purchasers_only ) {
			$users = get_users(
				array(
					'number'   => 500,
					'meta_key' => 'billing_city',
					'meta_value' => $city,
					'fields'   => array( 'ID', 'display_name' ),
				)
			);
			foreach ( $users as $u ) {
				$phone = self::normalize_phone( (string) get_user_meta( $u->ID, 'billing_phone', true ) );
				if ( '' === $phone ) {
					continue;
				}
				$out[ $phone ] = (string) $u->display_name;
			}
		}
		return $out;
	}

	/**
	 * @param int $min_orders Min paid orders.
	 * @return array<string,string>
	 */
	private static function phones_vip( $min_orders = 3 ) {
		$out = array();
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return $out;
		}
		$min    = max( 2, (int) $min_orders );
		$orders = wc_get_orders(
			array(
				'status' => array( 'processing', 'completed' ),
				'limit'  => 1000,
				'return' => 'objects',
			)
		);
		$counts = array();
		foreach ( $orders as $order ) {
			if ( ! is_a( $order, 'WC_Order' ) ) {
				continue;
			}
			$phone = self::normalize_phone( $order->get_billing_phone() );
			if ( '' === $phone ) {
				continue;
			}
			if ( ! isset( $counts[ $phone ] ) ) {
				$counts[ $phone ] = array(
					'n'    => 0,
					'name' => trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ),
				);
			}
			++$counts[ $phone ]['n'];
		}
		foreach ( $counts as $phone => $row ) {
			if ( (int) $row['n'] >= $min ) {
				$out[ $phone ] = (string) $row['name'];
			}
		}
		return $out;
	}

	/**
	 * Newsletter subscribers via CRM proxy + local option fallback.
	 *
	 * @return array<string,string>
	 */
	private static function phones_followers() {
		$out = array();

		$local = get_option( 'webino_dashboard_newsletter_subscribers', array() );
		if ( is_array( $local ) ) {
			foreach ( $local as $row ) {
				if ( is_string( $row ) ) {
					$p = self::normalize_phone( $row );
					if ( $p ) {
						$out[ $p ] = '';
					}
					continue;
				}
				if ( ! is_array( $row ) ) {
					continue;
				}
				$p = self::normalize_phone( (string) ( $row['phone'] ?? $row['mobile'] ?? '' ) );
				if ( $p ) {
					$out[ $p ] = (string) ( $row['name'] ?? '' );
				}
			}
		}

		if ( class_exists( 'Webino_Dashboard_License', false ) ) {
			$res = Webino_Dashboard_License::instance()->crm_get(
				'wp-json/webinocrm/v1/modirpayamak/newsletter/subscribers',
				array( 'page' => 1, 'limit' => 500 )
			);
			if ( ! empty( $res['ok'] ) && is_array( $res['data'] ?? null ) ) {
				$data = $res['data'];
				$list = array();
				if ( isset( $data['subscribers'] ) && is_array( $data['subscribers'] ) ) {
					$list = $data['subscribers'];
				} elseif ( isset( $data['data'] ) && is_array( $data['data'] ) ) {
					$list = $data['data'];
				} elseif ( isset( $data['items'] ) && is_array( $data['items'] ) ) {
					$list = $data['items'];
				}
				foreach ( $list as $row ) {
					if ( ! is_array( $row ) ) {
						continue;
					}
					$p = self::normalize_phone( (string) ( $row['phone'] ?? $row['mobile'] ?? $row['number'] ?? '' ) );
					if ( $p ) {
						$out[ $p ] = (string) ( $row['name'] ?? '' );
					}
				}
			}
		}

		return $out;
	}
}
