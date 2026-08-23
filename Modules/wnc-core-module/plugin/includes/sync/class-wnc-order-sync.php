<?php
/**
 * Order sync — pull marketplace orders into WooCommerce.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Order pull / create.
 */
class WNC_Order_Sync {

	/**
	 * Pull orders for a platform.
	 *
	 * @param string              $platform Platform.
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job ID.
	 * @return bool
	 */
	public static function pull( $platform, array $payload = array(), $job_id = 0 ) {
		$adapter = WNC_Platform_Registry::get( $platform );
		if ( ! $adapter || ! $adapter->is_live() ) {
			return false;
		}

		$list = $adapter->pull_orders( $payload );
		if ( is_wp_error( $list ) ) {
			WNC_Logger::error( $list->get_error_message(), $platform, 'orders', array( 'job_id' => $job_id ) );
			return false;
		}

		$created = 0;
		foreach ( (array) $list as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$remote_id = (string) ( $item['id'] ?? $item['order_id'] ?? '' );
			if ( '' === $remote_id ) {
				continue;
			}
			if ( self::find_map( $platform, $remote_id ) ) {
				continue;
			}
			$detail = $adapter->get_order( $remote_id );
			if ( is_wp_error( $detail ) ) {
				$detail = $item;
			}
			$normalized = WNC_Order_Normalizer::normalize( $platform, is_array( $detail ) ? $detail : $item );
			$wc_id      = self::create_wc_order( $platform, $remote_id, $normalized );
			if ( $wc_id ) {
				self::save_map( $platform, $remote_id, $wc_id, (string) ( $normalized['status'] ?? '' ) );
				$created++;
			}
		}

		WNC_Logger::info( 'Orders pulled', $platform, 'orders', array( 'job_id' => $job_id, 'created' => $created ) );
		return true;
	}

	/**
	 * Pull all live platforms.
	 */
	public static function pull_all() {
		foreach ( WNC_Platform_Registry::all() as $adapter ) {
			if ( ! $adapter->is_live() ) {
				continue;
			}
			$settings = WNC_Settings::get_platform( $adapter->id() );
			if ( empty( $settings['enabled'] ) ) {
				continue;
			}
			WNC_Jobs::enqueue( 'pull_orders', array(), $adapter->id() );
		}
	}

	/**
	 * Find order map.
	 *
	 * @param string $platform Platform.
	 * @param string $remote_id Remote ID.
	 * @return array|null
	 */
	public static function find_map( $platform, $remote_id ) {
		global $wpdb;
		$table = WNC_Storage::order_map_table();
		return $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE platform = %s AND remote_order_id = %s",
				sanitize_key( $platform ),
				sanitize_text_field( $remote_id )
			),
			ARRAY_A
		);
	}

	/**
	 * Save order map.
	 *
	 * @param string $platform Platform.
	 * @param string $remote_id Remote.
	 * @param int    $wc_order_id WC order.
	 * @param string $status Status.
	 */
	public static function save_map( $platform, $remote_id, $wc_order_id, $status = '' ) {
		global $wpdb;
		$table = WNC_Storage::order_map_table();
		$now   = current_time( 'mysql' );
		$wpdb->insert(
			$table,
			array(
				'wc_order_id'     => (int) $wc_order_id,
				'platform'        => sanitize_key( $platform ),
				'remote_order_id' => sanitize_text_field( $remote_id ),
				'status'          => sanitize_text_field( $status ),
				'last_sync_at'    => $now,
				'created_at'      => $now,
				'updated_at'      => $now,
			)
		);
	}

	/**
	 * Create WooCommerce order from normalized remote data.
	 *
	 * @param string              $platform Platform.
	 * @param string              $remote_id Remote ID.
	 * @param array<string,mixed> $detail Normalized detail.
	 * @return int|false
	 */
	private static function create_wc_order( $platform, $remote_id, array $detail ) {
		if ( ! function_exists( 'wc_create_order' ) ) {
			return false;
		}

		$order = wc_create_order();
		if ( is_wp_error( $order ) || ! $order ) {
			return false;
		}

		$order->update_meta_data( '_wnc_platform', $platform );
		$order->update_meta_data( '_wnc_remote_order_id', $remote_id );
		$remote_status = (string) ( $detail['status'] ?? '' );
		if ( '' !== $remote_status ) {
			$order->update_meta_data( '_wnc_remote_status', sanitize_text_field( $remote_status ) );
		}
		$order->set_created_via( 'webinaconnector-' . $platform );

		$lines = isset( $detail['items'] ) && is_array( $detail['items'] ) ? $detail['items'] : array();

		foreach ( $lines as $line ) {
			if ( ! is_array( $line ) ) {
				continue;
			}
			$qty   = max( 1, (int) ( $line['quantity'] ?? 1 ) );
			$price = floatval( $line['price'] ?? 0 );

			$remote_variant = (string) ( $line['variant_id'] ?? '' );
			$remote_product = (string) ( $line['product_id'] ?? '' );
			$map            = WNC_Mapper::find_by_remote( $platform, $remote_product, $remote_variant );

			if ( $map ) {
				$pid     = WNC_Mapper::target_id( $map );
				$product = wc_get_product( $pid );
				if ( $product ) {
					$order->add_product( $product, $qty, array( 'subtotal' => $price * $qty, 'total' => $price * $qty ) );
					continue;
				}
			}

			$item = new WC_Order_Item_Product();
			$name = (string) ( $line['title'] ?? ( 'Remote #' . $remote_variant ) );
			$item->set_name( $name );
			$item->set_quantity( $qty );
			$item->set_subtotal( $price * $qty );
			$item->set_total( $price * $qty );
			$item->add_meta_data( '_wnc_remote_variant_id', $remote_variant, true );
			$order->add_item( $item );
		}

		$billing = isset( $detail['customer'] ) && is_array( $detail['customer'] ) ? $detail['customer'] : array();
		if ( ! empty( $billing['name'] ) || ! empty( $billing['first_name'] ) || ! empty( $billing['phone'] ) ) {
			$order->set_billing_first_name( sanitize_text_field( (string) ( $billing['first_name'] ?? $billing['name'] ?? '' ) ) );
			$order->set_billing_last_name( sanitize_text_field( (string) ( $billing['last_name'] ?? '' ) ) );
			$order->set_billing_phone( sanitize_text_field( (string) ( $billing['phone'] ?? '' ) ) );
			$order->set_billing_email( sanitize_email( (string) ( $billing['email'] ?? '' ) ) );
			$order->set_billing_address_1( sanitize_text_field( (string) ( $billing['address_1'] ?? $billing['address'] ?? '' ) ) );
			$order->set_billing_address_2( sanitize_text_field( (string) ( $billing['address_2'] ?? '' ) ) );
			$order->set_billing_city( sanitize_text_field( (string) ( $billing['city'] ?? '' ) ) );
			$order->set_billing_state( sanitize_text_field( (string) ( $billing['state'] ?? '' ) ) );
			$order->set_billing_postcode( sanitize_text_field( (string) ( $billing['postcode'] ?? '' ) ) );
			$order->set_billing_country( sanitize_text_field( (string) ( $billing['country'] ?? 'IR' ) ) );

			$order->set_shipping_first_name( $order->get_billing_first_name() );
			$order->set_shipping_last_name( $order->get_billing_last_name() );
			$order->set_shipping_address_1( $order->get_billing_address_1() );
			$order->set_shipping_address_2( $order->get_billing_address_2() );
			$order->set_shipping_city( $order->get_billing_city() );
			$order->set_shipping_state( $order->get_billing_state() );
			$order->set_shipping_postcode( $order->get_billing_postcode() );
			$order->set_shipping_country( $order->get_billing_country() );
			$order->set_shipping_phone( $order->get_billing_phone() );
		}

		$wc_status = self::map_remote_status( $remote_status );
		$order->set_status( $wc_status );
		$order->calculate_totals( false );
		$order->save();

		self::apply_platform_tag( $order, $platform, $remote_id );

		return $order->get_id();
	}

	/**
	 * Map remote marketplace status to a WC status.
	 *
	 * @param string $remote Remote status.
	 * @return string
	 */
	private static function map_remote_status( $remote ) {
		$r = strtolower( trim( (string) $remote ) );
		if ( '' === $r ) {
			return 'processing';
		}
		$map = array(
			'cancel'    => 'cancelled',
			'refund'    => 'refunded',
			'return'    => 'refunded',
			'complete'  => 'completed',
			'deliver'   => 'completed',
			'ship'      => 'completed',
			'fulfill'   => 'completed',
			'pending'   => 'pending',
			'wait'      => 'on-hold',
			'hold'      => 'on-hold',
			'payment'   => 'pending',
			'new'       => 'processing',
			'confirm'   => 'processing',
			'process'   => 'processing',
			'accept'    => 'processing',
		);
		foreach ( $map as $needle => $status ) {
			if ( false !== strpos( $r, $needle ) ) {
				return $status;
			}
		}
		return 'processing';
	}

	/**
	 * Tag order with marketplace platform for sellers.
	 *
	 * @param WC_Order $order Order.
	 * @param string   $platform Platform slug.
	 * @param string   $remote_id Remote order id.
	 * @return void
	 */
	private static function apply_platform_tag( $order, $platform, $remote_id ) {
		$platform = sanitize_key( $platform );
		$labels   = array(
			'digikala'   => 'Digikala',
			'basalam'    => 'Basalam',
			'technolife' => 'Technolife',
			'tapsishop'  => 'TapsiShop',
			'snappshop'  => 'SnappShop',
			'torob'      => 'Torob',
			'emalls'            => 'Emalls',
			'snapppay-search'   => 'SnappPay Search',
			'zarehbin'          => 'Zarehbin',
		);
		$label = $labels[ $platform ] ?? $platform;

		self::ensure_platform_taxonomy();
		$term = term_exists( $platform, 'wnc_order_platform' );
		if ( ! $term ) {
			$term = wp_insert_term( $label, 'wnc_order_platform', array( 'slug' => $platform ) );
		}
		if ( ! is_wp_error( $term ) ) {
			$term_id = is_array( $term ) ? (int) ( $term['term_id'] ?? 0 ) : (int) $term;
			if ( $term_id > 0 ) {
				wp_set_object_terms( $order->get_id(), array( $term_id ), 'wnc_order_platform', false );
			}
		}

		$order->add_order_note(
			sprintf(
				/* translators: 1: platform label 2: remote order id */
				__( 'Marketplace order from %1$s (remote #%2$s). Ship via this platform.', 'webinaconnector' ),
				$label,
				$remote_id
			),
			false,
			true
		);
		$order->save();
	}

	/**
	 * Register order platform taxonomy once.
	 *
	 * @return void
	 */
	public static function ensure_platform_taxonomy() {
		if ( taxonomy_exists( 'wnc_order_platform' ) ) {
			return;
		}
		register_taxonomy(
			'wnc_order_platform',
			array( 'shop_order' ),
			array(
				'label'        => __( 'Marketplace', 'webinaconnector' ),
				'public'       => false,
				'show_ui'      => true,
				'show_in_menu' => false,
				'hierarchical' => false,
				'rewrite'      => false,
			)
		);
	}

	/**
	 * List mapped orders.
	 *
	 * @param int $limit Limit.
	 * @return array
	 */
	public static function list_maps( $limit = 50 ) {
		global $wpdb;
		$table = WNC_Storage::order_map_table();
		return $wpdb->get_results(
			$wpdb->prepare( "SELECT * FROM {$table} ORDER BY id DESC LIMIT %d", max( 1, (int) $limit ) ),
			ARRAY_A
		);
	}
}
