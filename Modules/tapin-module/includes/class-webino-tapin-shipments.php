<?php
/**
 * Tapin shipment register / label / status / ready-to-ship.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Order shipment lifecycle with Tapin.
 */
class Webino_Tapin_Shipments {

	const META_ORDER_ID     = '_webino_tapin_order_id';
	const META_BARCODE      = '_webino_tapin_barcode';
	const META_STATUS       = '_webino_tapin_status';
	const META_UUID         = '_webino_tapin_uuid';
	const META_BOX_ID       = '_webino_tapin_box_id';
	const META_CONTENT_TYPE = '_webino_tapin_content_type';
	const META_WEIGHT       = '_webino_tapin_weight';
	const META_PACKET_TYPE  = '_webino_tapin_packet_type';
	const META_KIOSK_ID     = '_webino_tapin_kiosk_id';
	const PACKING_OPTION    = 'webino_tapin_packing_boxes';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'maybe_auto_register' ), 40, 4 );
		add_action( 'webino_tapin_sync_statuses', array( __CLASS__, 'cron_sync_statuses' ) );
		add_filter( 'woocommerce_new_order_note_data', array( __CLASS__, 'barcode_from_note' ), 20, 2 );
		if ( ! wp_next_scheduled( 'webino_tapin_sync_statuses' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'hourly', 'webino_tapin_sync_statuses' );
		}
	}

	/**
	 * Detect numeric barcode notes (≥20 digits).
	 *
	 * @param array<string, mixed> $data Note data.
	 * @param array<string, mixed> $args Args with order_id.
	 * @return array<string, mixed>
	 */
	public static function barcode_from_note( $data, $args = array() ) {
		$content = isset( $data['comment_content'] ) ? trim( (string) $data['comment_content'] ) : '';
		if ( ! preg_match( '/^\d{20,}$/', $content ) ) {
			return $data;
		}
		$order_id = (int) ( $args['order_id'] ?? $data['comment_post_ID'] ?? 0 );
		$order    = $order_id ? wc_get_order( $order_id ) : null;
		if ( ! $order ) {
			return $data;
		}
		$order->update_meta_data( self::META_BARCODE, $content );
		$order->update_meta_data( '_post_barcode', $content );
		$order->save();
		do_action( 'webino_dashboard_order_post_barcode_saved', $order_id, $content );
		$data['comment_content'] = sprintf(
			/* translators: %s barcode */
			__( 'بارکد پستی ثبت شد: %s', 'webino-dashboard' ),
			$content
		);
		return $data;
	}

	/**
	 * @param int      $order_id Order ID.
	 * @param string   $from From status.
	 * @param string   $to To status.
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function maybe_auto_register( $order_id, $from, $to, $order ) {
		unset( $from );
		$settings = Webino_Tapin_Settings::get();
		if ( empty( $settings['auto_register'] ) || ! Webino_Tapin_Settings::is_connected() ) {
			return;
		}
		$trigger = sanitize_key( (string) $settings['auto_register_status'] );
		if ( '' === $trigger ) {
			$trigger = 'processing';
		}
		$to_key   = sanitize_key( (string) $to );
		$accepted = array( $trigger, 'webino-' . $trigger );
		if ( 'packaged' === $trigger ) {
			$accepted[] = 'webino-packaged';
		}
		if ( ! in_array( $to_key, $accepted, true ) ) {
			return;
		}
		if ( ! is_a( $order, 'WC_Order' ) ) {
			$order = wc_get_order( $order_id );
		}
		if ( ! $order ) {
			return;
		}
		if ( $order->get_meta( self::META_BARCODE ) || $order->get_meta( self::META_ORDER_ID ) ) {
			return;
		}
		if ( ! apply_filters( 'webino_tapin_can_register_order', true, $order ) ) {
			return;
		}
		self::register_for_order( $order );
	}

	/**
	 * @param WC_Order             $order Order.
	 * @param array<string, mixed> $overrides Optional meta overrides.
	 * @return array{ok:bool,message:string,plan?:array}
	 */
	public static function register_for_order( $order, $overrides = array() ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return array( 'ok' => false, 'message' => __( 'سفارش پیدا نشد.', 'webino-dashboard' ) );
		}
		if ( ! Webino_Tapin_Settings::is_connected() ) {
			return array( 'ok' => false, 'message' => __( 'ابتدا اتصال تاپین را کامل کنید.', 'webino-dashboard' ) );
		}

		$settings = Webino_Tapin_Settings::get();
		$province = (int) $order->get_meta( Webino_Tapin_Locations::META_PROVINCE );
		$city     = (int) $order->get_meta( Webino_Tapin_Locations::META_CITY );
		if ( $province < 1 ) {
			$province = (int) ( Webino_Tapin_Locations::province_code_by_title( $order->get_shipping_state() ?: $order->get_billing_state() ) ?: 0 );
		}
		if ( $city < 1 && $province > 0 ) {
			$city = (int) ( Webino_Tapin_Locations::city_code_by_title( $province, $order->get_shipping_city() ?: $order->get_billing_city() ) ?: 0 );
		}
		if ( $province < 1 || $city < 1 ) {
			return array( 'ok' => false, 'message' => __( 'استان و شهر گیرنده را کامل کنید.', 'webino-dashboard' ) );
		}

		$weight   = 0;
		$products = array();
		foreach ( $order->get_items() as $item ) {
			if ( ! is_a( $item, 'WC_Order_Item_Product' ) ) {
				continue;
			}
			$product = $item->get_product();
			$qty     = max( 1, (int) $item->get_quantity() );
			$w       = 100;
			if ( $product && class_exists( 'Webino_Shipping_Weight', false ) ) {
				$est = Webino_Shipping_Weight::estimate_unit_package( $product );
				$w   = max( 1, (int) $est['product_weight_g'] );
				$weight += ( (int) $est['package_weight_g'] ) * $qty;
			} else {
				$weight += 100 * $qty;
			}
			$line_price = (int) round( (float) $item->get_total() );
			if ( class_exists( 'Webino_Shipping_Currency', false ) ) {
				$line_price = (int) round( Webino_Shipping_Currency::to_rial( (float) $item->get_total(), method_exists( $order, 'get_currency' ) ? $order->get_currency() : null ) );
			} else {
				$currency = method_exists( $order, 'get_currency' ) ? $order->get_currency() : '';
				if ( in_array( $currency, array( 'IRT', 'IRHT' ), true ) ) {
					$line_price *= ( 'IRHT' === $currency ? 100 : 10 );
				}
			}
			$tapin_pid = null;
			if ( $product && class_exists( 'Webino_Tapin_Catalog', false ) ) {
				$tapin_pid = Webino_Tapin_Catalog::get_mapped_product_id( (int) $product->get_id() );
				if ( ! $tapin_pid && $product->get_parent_id() ) {
					$tapin_pid = Webino_Tapin_Catalog::get_mapped_product_id( (int) $product->get_parent_id() );
				}
			}
			$products[] = array(
				'count'             => $qty,
				'discount'          => 0,
				'discount_per_count'=> 0,
				'price'             => $line_price,
				'amount_per_count'  => (int) round( $line_price / max( 1, $qty ) ),
				'title'             => (string) $item->get_name(),
				'weight'            => $w,
				'weight_per_count'  => $w,
				'product_id'        => $tapin_pid,
			);
		}
		if ( $weight < 1 ) {
			$weight = 500;
		}

		$box_id = (int) ( $overrides['box_id'] ?? $order->get_meta( self::META_BOX_ID ) ?: $settings['default_box_id'] );
		$plan   = class_exists( 'Webino_Shipping_Packer', false ) ? Webino_Shipping_Packer::get_order_plan( $order ) : null;
		if ( empty( $overrides['box_id'] ) && ! $order->get_meta( self::META_BOX_ID ) && is_array( $plan ) && ! empty( $plan['boxes'][0]['size'] ) ) {
			$size = (string) $plan['boxes'][0]['size'];
			$map  = $settings['box_id_map'];
			if ( isset( $map[ $size ] ) ) {
				$box_id = (int) $map[ $size ];
			}
		}

		$content_type = (int) ( $overrides['content_type'] ?? $order->get_meta( self::META_CONTENT_TYPE ) ?: $settings['content_type'] );
		$meta_weight  = (int) ( $overrides['weight'] ?? $order->get_meta( self::META_WEIGHT ) ?: 0 );
		if ( $meta_weight > 0 ) {
			$weight = $meta_weight;
		}

		$packet_type = 2;
		if ( in_array( $box_id, array( 11, 12, 13 ), true ) ) {
			$packet_type = 3;
			if ( $weight > 2000 ) {
				return array( 'ok' => false, 'message' => __( 'وزن پاکت نباید بیشتر از ۲۰۰۰ گرم باشد.', 'webino-dashboard' ) );
			}
		}

		$method_key = 'pishtaz';
		foreach ( $order->get_shipping_methods() as $sm ) {
			$id = (string) $sm->get_method_id();
			if ( false !== strpos( $id, 'alonomic' ) ) {
				$method_key = 'alonomic';
			} elseif ( false !== strpos( $id, 'tipax_api' ) || false !== strpos( $id, 'tipax' ) ) {
				$method_key = false !== strpos( $id, 'tipax_api' ) ? 'tipax_api' : 'tipax';
			} elseif ( false !== strpos( $id, 'vip' ) ) {
				$method_key = 'vip';
			} elseif ( false !== strpos( $id, 'courier' ) ) {
				$method_key = 'courier';
			}
		}

		$first = $order->get_shipping_first_name() ?: $order->get_billing_first_name();
		$last  = $order->get_shipping_last_name() ?: $order->get_billing_last_name();
		$addr  = trim( $order->get_shipping_address_1() . ' ' . $order->get_shipping_address_2() );
		if ( '' === $addr ) {
			$addr = trim( $order->get_billing_address_1() . ' ' . $order->get_billing_address_2() );
		}
		$mobile = preg_replace( '/\D+/', '', (string) $order->get_billing_phone() );
		$postal  = preg_replace( '/\D+/', '', (string) ( $order->get_shipping_postcode() ?: $order->get_billing_postcode() ) );

		$payload = array(
			'register_type'  => (int) $settings['register_type'],
			'shop_id'        => $settings['shop_id'],
			'address'        => $addr ?: '-',
			'city_code'      => $city,
			'province_code'  => $province,
			'description'    => (string) $order->get_customer_note(),
			'email'          => (string) $order->get_billing_email(),
			'employee_code'  => (int) $settings['employee_code'],
			'first_name'     => $first ?: 'گیرنده',
			'last_name'      => $last ?: '-',
			'mobile'         => $mobile ?: '09000000000',
			'phone'          => $mobile ?: '',
			'postal_code'    => $postal ?: '0000000000',
			'pay_type'       => (int) $settings['default_pay_type'],
			'order_type'     => Webino_Tapin_Rates::order_type_for_method( $method_key ),
			'box_id'         => $box_id,
			'packet_type'    => $packet_type,
			'package_weight' => (int) $weight,
			'manual_id'      => (string) $order->get_order_number(),
			'has_insurance'  => ! empty( $settings['has_insurance'] ),
			'content_type'   => $content_type,
			'kiosk_id'       => (int) ( $overrides['kiosk_id'] ?? $order->get_meta( self::META_KIOSK_ID ) ?: ( $settings['default_kiosk_id'] ?? 0 ) ),
			'pre_paid_price' => 0,
			'products'       => $products,
		);
		if ( 'tipax_api' === $method_key ) {
			$payload['pickup_type']   = (int) $settings['tipax_pickup_type'];
			$payload['delivery_type'] = (int) $settings['tipax_delivery_type'];
		}

		$res = Webino_Tapin_Client::register_order( $payload );
		if ( ! $res['ok'] ) {
			return array( 'ok' => false, 'message' => $res['message'] );
		}

		$entries = is_array( $res['entries'] ) ? $res['entries'] : array();
		$barcode = (string) ( $entries['barcode'] ?? '' );
		$tid     = (string) ( $entries['order_id'] ?? '' );
		$uuid    = (string) ( $entries['id'] ?? '' );
		$status  = (int) ( $entries['status'] ?? 0 );

		if ( $barcode ) {
			$order->update_meta_data( self::META_BARCODE, $barcode );
			$order->update_meta_data( '_post_barcode', $barcode );
		}
		if ( $tid ) {
			$order->update_meta_data( self::META_ORDER_ID, $tid );
		}
		if ( $uuid ) {
			$order->update_meta_data( self::META_UUID, $uuid );
		}
		$order->update_meta_data( self::META_STATUS, $status );
		$order->update_meta_data( self::META_BOX_ID, $box_id );
		$order->update_meta_data( self::META_CONTENT_TYPE, $content_type );
		$order->update_meta_data( self::META_WEIGHT, $weight );
		$order->update_meta_data( self::META_PACKET_TYPE, $packet_type );
		$order->save();

		if ( $barcode ) {
			do_action( 'webino_dashboard_order_post_barcode_saved', (int) $order->get_id(), $barcode );
		}

		self::maybe_apply_wc_status( $order, $status );

		return array(
			'ok'      => true,
			'message' => $barcode
				? __( 'بارکد ارسال آماده است.', 'webino-dashboard' )
				: __( 'مرسوله ثبت شد.', 'webino-dashboard' ),
			'plan'    => array(
				'barcode'  => $barcode,
				'order_id' => $tid,
				'status'   => $status,
			),
		);
	}

	/**
	 * Mark ready-to-ship on Tapin (status=2).
	 *
	 * @param WC_Order $order Order.
	 * @return array{ok:bool,message:string}
	 */
	public static function ready_to_ship( $order ) {
		if ( ! is_a( $order, 'WC_Order' ) || ! Webino_Tapin_Settings::is_connected() ) {
			return array( 'ok' => false, 'message' => __( 'امکان آماده‌به‌ارسال نیست.', 'webino-dashboard' ) );
		}
		$settings = Webino_Tapin_Settings::get();
		$tid      = $order->get_meta( self::META_ORDER_ID );
		$uuid     = $order->get_meta( self::META_UUID );
		if ( ! $tid && ! $uuid ) {
			return array( 'ok' => false, 'message' => __( 'ابتدا مرسوله را ثبت کنید.', 'webino-dashboard' ) );
		}
		$res = Webino_Tapin_Client::change_status(
			array(
				'shop_id'  => $settings['shop_id'],
				'order_id' => $tid ?: $uuid,
				'status'   => 2,
			)
		);
		if ( ! $res['ok'] ) {
			return array( 'ok' => false, 'message' => $res['message'] );
		}
		$order->update_meta_data( self::META_STATUS, 2 );
		$order->save();
		if ( class_exists( 'Webino_Shipping_Order_Statuses', false ) && Webino_Shipping_Order_Statuses::enabled() ) {
			$order->update_status( 'webino-ready-to-ship', __( 'آماده ارسال در تاپین', 'webino-dashboard' ) );
		}
		return array( 'ok' => true, 'message' => __( 'مرسوله آماده ارسال شد.', 'webino-dashboard' ) );
	}

	/**
	 * @return array{ok:bool,message:string,boxes?:array}
	 */
	public static function sync_packing_boxes() {
		if ( ! Webino_Tapin_Settings::is_connected() ) {
			return array( 'ok' => false, 'message' => __( 'اتصال تاپین برقرار نیست.', 'webino-dashboard' ) );
		}
		$settings = Webino_Tapin_Settings::get();
		$res      = Webino_Tapin_Client::packing_boxes( array( 'shop_id' => $settings['shop_id'] ) );
		if ( ! $res['ok'] ) {
			return array( 'ok' => false, 'message' => $res['message'] );
		}
		$boxes = array();
		$entries = $res['entries'];
		$rows = is_array( $entries ) ? ( $entries['list'] ?? $entries ) : array();
		foreach ( (array) $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$id = (int) ( $row['id'] ?? $row['box_id'] ?? 0 );
			if ( $id < 1 ) {
				continue;
			}
			$boxes[] = array(
				'id'    => $id,
				'title' => (string) ( $row['title'] ?? $row['name'] ?? ( 'Box ' . $id ) ),
			);
		}
		update_option( self::PACKING_OPTION, $boxes, false );
		return array(
			'ok'      => true,
			'message' => __( 'جعبه‌های بسته‌بندی همگام شد.', 'webino-dashboard' ),
			'boxes'   => $boxes,
		);
	}

	/**
	 * @return list<array{id:int,title:string}>
	 */
	public static function get_packing_boxes() {
		$raw = get_option( self::PACKING_OPTION, array() );
		if ( ! is_array( $raw ) || array() === $raw ) {
			// Default 1-10 + pockets.
			$defaults = array();
			for ( $i = 1; $i <= 10; $i++ ) {
				$defaults[] = array( 'id' => $i, 'title' => sprintf( __( 'جعبه %d', 'webino-dashboard' ), $i ) );
			}
			$defaults[] = array( 'id' => 11, 'title' => __( 'پاکت A5', 'webino-dashboard' ) );
			$defaults[] = array( 'id' => 12, 'title' => __( 'پاکت A4', 'webino-dashboard' ) );
			$defaults[] = array( 'id' => 13, 'title' => __( 'پاکت A3', 'webino-dashboard' ) );
			return $defaults;
		}
		return $raw;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array{ok:bool,message:string,html?:string}
	 */
	/**
	 * @param WC_Order $order Order.
	 * @param string   $kind  html|label|barcode|list_html.
	 * @return array{ok:bool,message:string,html?:string,detail?:array}
	 */
	public static function fetch_label( $order, $kind = 'html' ) {
		if ( ! is_a( $order, 'WC_Order' ) || ! Webino_Tapin_Settings::is_connected() ) {
			return array( 'ok' => false, 'message' => __( 'امکان دریافت برچسب نیست.', 'webino-dashboard' ) );
		}
		$tid  = $order->get_meta( self::META_ORDER_ID );
		$uuid = (string) $order->get_meta( self::META_UUID );
		if ( ! $tid && ! $uuid ) {
			return array( 'ok' => false, 'message' => __( 'هنوز مرسوله‌ای ثبت نشده است.', 'webino-dashboard' ) );
		}
		$kind = sanitize_key( (string) $kind );
		if ( 'label' === $kind ) {
			$res = Webino_Tapin_Client::detail_label(
				array(
					'orders' => array_values( array_filter( array( $uuid, $tid ) ) ),
				)
			);
		} elseif ( 'barcode' === $kind ) {
			$res = Webino_Tapin_Client::barcode_html(
				array(
					'orders' => array_values( array_filter( array( $uuid, $tid ) ) ),
				)
			);
			if ( ! $res['ok'] ) {
				// Fallback: some accounts expect date range; try order detail list html.
				$res = Webino_Tapin_Client::detail_list_html( $tid ?: $uuid );
			}
		} elseif ( 'list_html' === $kind ) {
			$res = Webino_Tapin_Client::detail_list_html( $tid ?: $uuid );
		} else {
			$res = Webino_Tapin_Client::label_html(
				array(
					'order_id' => $tid ?: $uuid,
				)
			);
		}
		if ( ! $res['ok'] ) {
			return array( 'ok' => false, 'message' => $res['message'] );
		}
		$html = Webino_Tapin_Client::extract_html( $res['entries'] );
		if ( '' === $html && is_array( $res['entries'] ) ) {
			$html = '<pre dir="ltr">' . esc_html( wp_json_encode( $res['entries'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT ) ) . '</pre>';
		}
		return array(
			'ok'      => true,
			'message' => __( 'برچسب آماده است.', 'webino-dashboard' ),
			'html'    => $html,
		);
	}

	/**
	 * Fetch Tapin order JSON detail and sync local meta.
	 *
	 * @param WC_Order $order Order.
	 * @return array{ok:bool,message:string,detail?:array}
	 */
	public static function fetch_detail( $order ) {
		if ( ! is_a( $order, 'WC_Order' ) || ! Webino_Tapin_Settings::is_connected() ) {
			return array( 'ok' => false, 'message' => __( 'جزئیات در دسترس نیست.', 'webino-dashboard' ) );
		}
		$tid = $order->get_meta( self::META_ORDER_ID );
		if ( ! $tid ) {
			return array( 'ok' => false, 'message' => __( 'هنوز مرسوله‌ای ثبت نشده است.', 'webino-dashboard' ) );
		}
		$res = Webino_Tapin_Client::order_detail( array( 'order_id' => $tid ) );
		if ( ! $res['ok'] ) {
			return array( 'ok' => false, 'message' => $res['message'] );
		}
		$detail = is_array( $res['entries'] ) ? $res['entries'] : array();
		if ( isset( $detail['status'] ) ) {
			$order->update_meta_data( self::META_STATUS, (int) $detail['status'] );
		}
		if ( ! empty( $detail['barcode'] ) ) {
			$order->update_meta_data( self::META_BARCODE, (string) $detail['barcode'] );
			$order->update_meta_data( '_post_barcode', (string) $detail['barcode'] );
		}
		if ( ! empty( $detail['kiosk_id'] ) ) {
			$order->update_meta_data( self::META_KIOSK_ID, (int) $detail['kiosk_id'] );
		}
		$order->save();
		return array(
			'ok'      => true,
			'message' => __( 'جزئیات مرسوله دریافت شد.', 'webino-dashboard' ),
			'detail'  => $detail,
		);
	}

	/**
	 * Edit Tapin parcel after register.
	 *
	 * @param WC_Order             $order Order.
	 * @param array<string, mixed> $fields Fields to send.
	 * @return array{ok:bool,message:string,detail?:array}
	 */
	public static function edit_for_order( $order, $fields = array() ) {
		if ( ! is_a( $order, 'WC_Order' ) || ! Webino_Tapin_Settings::is_connected() ) {
			return array( 'ok' => false, 'message' => __( 'ویرایش ممکن نیست.', 'webino-dashboard' ) );
		}
		$tid = $order->get_meta( self::META_ORDER_ID );
		if ( ! $tid ) {
			return array( 'ok' => false, 'message' => __( 'ابتدا مرسوله را ثبت کنید.', 'webino-dashboard' ) );
		}
		$payload = array_merge(
			array(
				'order_id' => $tid,
			),
			is_array( $fields ) ? $fields : array()
		);
		// Prefer current WC address when not explicitly overridden.
		if ( empty( $payload['address'] ) ) {
			$addr = trim( $order->get_shipping_address_1() . ' ' . $order->get_shipping_address_2() );
			if ( '' === $addr ) {
				$addr = trim( $order->get_billing_address_1() . ' ' . $order->get_billing_address_2() );
			}
			$payload['address'] = $addr ?: '-';
		}
		if ( empty( $payload['first_name'] ) ) {
			$payload['first_name'] = $order->get_shipping_first_name() ?: $order->get_billing_first_name() ?: 'گیرنده';
		}
		if ( empty( $payload['last_name'] ) ) {
			$payload['last_name'] = $order->get_shipping_last_name() ?: $order->get_billing_last_name() ?: '-';
		}
		if ( empty( $payload['mobile'] ) ) {
			$payload['mobile'] = preg_replace( '/\D+/', '', (string) $order->get_billing_phone() ) ?: '09000000000';
		}
		if ( empty( $payload['province_code'] ) ) {
			$payload['province_code'] = (int) $order->get_meta( Webino_Tapin_Locations::META_PROVINCE );
		}
		if ( empty( $payload['city_code'] ) ) {
			$payload['city_code'] = (int) $order->get_meta( Webino_Tapin_Locations::META_CITY );
		}
		if ( isset( $fields['kiosk_id'] ) ) {
			$order->update_meta_data( self::META_KIOSK_ID, (int) $fields['kiosk_id'] );
		}
		$res = Webino_Tapin_Client::edit_order( $payload );
		if ( ! $res['ok'] ) {
			return array( 'ok' => false, 'message' => $res['message'] );
		}
		$entries = is_array( $res['entries'] ) ? $res['entries'] : array();
		if ( ! empty( $entries['barcode'] ) ) {
			$order->update_meta_data( self::META_BARCODE, (string) $entries['barcode'] );
			$order->update_meta_data( '_post_barcode', (string) $entries['barcode'] );
		}
		if ( isset( $entries['status'] ) ) {
			$order->update_meta_data( self::META_STATUS, (int) $entries['status'] );
		}
		$order->save();
		return array(
			'ok'      => true,
			'message' => __( 'مرسوله ویرایش شد.', 'webino-dashboard' ),
			'detail'  => $entries,
		);
	}

	/**
	 * Bulk change status for WC orders that have Tapin ids.
	 *
	 * @param list<int> $wc_order_ids WC order IDs.
	 * @param int       $status Tapin status.
	 * @return array{ok:bool,message:string,entries?:mixed}
	 */
	public static function change_status_bulk_for_orders( $wc_order_ids, $status ) {
		$settings = Webino_Tapin_Settings::get();
		$orders   = array();
		foreach ( (array) $wc_order_ids as $oid ) {
			$order = wc_get_order( (int) $oid );
			if ( ! $order ) {
				continue;
			}
			$uuid = (string) $order->get_meta( self::META_UUID );
			$tid  = (string) $order->get_meta( self::META_ORDER_ID );
			$id   = $uuid ?: $tid;
			if ( ! $id ) {
				continue;
			}
			$orders[] = array(
				'id'      => $id,
				'shop_id' => $settings['shop_id'],
				'status'  => (int) $status,
			);
		}
		if ( ! $orders ) {
			return array( 'ok' => false, 'message' => __( 'مرسوله‌ای برای تغییر وضعیت پیدا نشد.', 'webino-dashboard' ) );
		}
		$res = Webino_Tapin_Client::change_status_bulk( array( 'orders' => $orders ) );
		if ( $res['ok'] ) {
			foreach ( (array) $wc_order_ids as $oid ) {
				$order = wc_get_order( (int) $oid );
				if ( $order ) {
					$order->update_meta_data( self::META_STATUS, (int) $status );
					$order->save();
				}
			}
		}
		return array(
			'ok'      => $res['ok'],
			'message' => $res['message'],
			'entries' => $res['entries'],
		);
	}

	/**
	 * Bulk HTML labels for WC orders.
	 *
	 * @param list<int> $wc_order_ids Orders.
	 * @return array{ok:bool,message:string,html?:string}
	 */
	public static function fetch_labels_bulk( $wc_order_ids ) {
		$ids = array();
		foreach ( (array) $wc_order_ids as $oid ) {
			$order = wc_get_order( (int) $oid );
			if ( ! $order ) {
				continue;
			}
			$tid = (string) $order->get_meta( self::META_ORDER_ID );
			if ( $tid ) {
				$ids[] = $tid;
			}
		}
		if ( ! $ids ) {
			return array( 'ok' => false, 'message' => __( 'شناسه تاپین پیدا نشد.', 'webino-dashboard' ) );
		}
		$res = Webino_Tapin_Client::label_html_bulk( array( 'orders_id' => $ids ) );
		if ( ! $res['ok'] ) {
			return array( 'ok' => false, 'message' => $res['message'] );
		}
		return array(
			'ok'      => true,
			'message' => __( 'برچسب‌های گروهی آماده است.', 'webino-dashboard' ),
			'html'    => Webino_Tapin_Client::extract_html( $res['entries'] ),
		);
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array{ok:bool,message:string,status?:int}
	 */
	public static function refresh_status( $order ) {
		if ( ! is_a( $order, 'WC_Order' ) || ! Webino_Tapin_Settings::is_connected() ) {
			return array( 'ok' => false, 'message' => __( 'بروزرسانی ممکن نیست.', 'webino-dashboard' ) );
		}
		$settings = Webino_Tapin_Settings::get();
		$uuid     = (string) $order->get_meta( self::META_UUID );
		$tid      = $order->get_meta( self::META_ORDER_ID );
		$orders   = array();
		if ( $uuid ) {
			$orders[] = array( 'id' => $uuid );
		} elseif ( $tid ) {
			$orders[] = array( 'id' => $tid );
		} else {
			return array( 'ok' => false, 'message' => __( 'هنوز مرسوله‌ای ثبت نشده است.', 'webino-dashboard' ) );
		}
		$res = Webino_Tapin_Client::get_status_bulk(
			array(
				'shop_id' => $settings['shop_id'],
				'orders'  => $orders,
			)
		);
		if ( ! $res['ok'] ) {
			return array( 'ok' => false, 'message' => $res['message'] );
		}
		$status = 0;
		if ( is_array( $res['entries'] ) ) {
			$list = $res['entries']['list'] ?? $res['entries'];
			if ( is_array( $list ) && isset( $list[0]['status'] ) ) {
				$status = (int) $list[0]['status'];
			} elseif ( isset( $res['entries']['status'] ) ) {
				$status = (int) $res['entries']['status'];
			}
		}
		$order->update_meta_data( self::META_STATUS, $status );
		$order->save();
		self::maybe_apply_wc_status( $order, $status );
		return array(
			'ok'      => true,
			'message' => __( 'وضعیت به‌روز شد.', 'webino-dashboard' ),
			'status'  => $status,
		);
	}

	/**
	 * @param WC_Order $order Order.
	 * @param int      $status Tapin status.
	 * @return void
	 */
	private static function maybe_apply_wc_status( $order, $status ) {
		if ( ! class_exists( 'Webino_Shipping_Order_Statuses', false ) || ! Webino_Shipping_Order_Statuses::enabled() ) {
			return;
		}
		$slug = Webino_Shipping_Order_Statuses::from_tapin_code( (int) $status );
		if ( ! $slug || $slug === $order->get_status() ) {
			return;
		}
		// Avoid bouncing completed orders unexpectedly unless Tapin says completed.
		if ( 'completed' === $order->get_status() && 'completed' !== $slug ) {
			return;
		}
		$order->update_status( $slug, __( 'همگام‌سازی وضعیت تاپین', 'webino-dashboard' ) );
	}

	/**
	 * @param int $code Status code.
	 * @return string
	 */
	public static function status_label( $code ) {
		$code = (int) $code;
		$slug = class_exists( 'Webino_Shipping_Order_Statuses', false )
			? Webino_Shipping_Order_Statuses::from_tapin_code( $code )
			: null;
		$defs = class_exists( 'Webino_Shipping_Order_Statuses', false )
			? Webino_Shipping_Order_Statuses::definitions()
			: array();
		if ( $slug && isset( $defs[ 'wc-' . $slug ] ) ) {
			return $defs[ 'wc-' . $slug ];
		}
		if ( 'completed' === $slug ) {
			return __( 'تکمیل‌شده', 'webino-dashboard' );
		}
		return $code > 0 ? (string) $code : '—';
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string, mixed>
	 */
	public static function summarize( $order ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return array();
		}
		$status = (int) $order->get_meta( self::META_STATUS );
		return array(
			'barcode'        => (string) $order->get_meta( self::META_BARCODE ),
			'order_id'       => (string) $order->get_meta( self::META_ORDER_ID ),
			'status'         => $status,
			'status_label'   => self::status_label( $status ),
			'province_code'  => (int) $order->get_meta( Webino_Tapin_Locations::META_PROVINCE ),
			'city_code'      => (int) $order->get_meta( Webino_Tapin_Locations::META_CITY ),
			'connected'      => Webino_Tapin_Settings::is_connected(),
			'auto_register'  => (bool) Webino_Tapin_Settings::get()['auto_register'],
			'box_id'         => (int) ( $order->get_meta( self::META_BOX_ID ) ?: Webino_Tapin_Settings::get()['default_box_id'] ),
			'content_type'   => (int) ( $order->get_meta( self::META_CONTENT_TYPE ) ?: Webino_Tapin_Settings::get()['content_type'] ),
			'weight'         => (int) $order->get_meta( self::META_WEIGHT ),
			'packet_type'    => (int) $order->get_meta( self::META_PACKET_TYPE ),
			'kiosk_id'       => (int) ( $order->get_meta( self::META_KIOSK_ID ) ?: ( Webino_Tapin_Settings::get()['default_kiosk_id'] ?? 0 ) ),
			'packing_boxes'  => self::get_packing_boxes(),
		);
	}

	/**
	 * @param WC_Order             $order Order.
	 * @param array<string, mixed> $meta Meta.
	 * @return void
	 */
	public static function save_order_meta( $order, $meta ) {
		if ( ! is_a( $order, 'WC_Order' ) || ! is_array( $meta ) ) {
			return;
		}
		if ( isset( $meta['box_id'] ) ) {
			$order->update_meta_data( self::META_BOX_ID, (int) $meta['box_id'] );
		}
		if ( isset( $meta['content_type'] ) ) {
			$order->update_meta_data( self::META_CONTENT_TYPE, (int) $meta['content_type'] );
		}
		if ( isset( $meta['weight'] ) ) {
			$order->update_meta_data( self::META_WEIGHT, (int) $meta['weight'] );
		}
		if ( isset( $meta['kiosk_id'] ) ) {
			$order->update_meta_data( self::META_KIOSK_ID, (int) $meta['kiosk_id'] );
		}
		$order->save();
	}

	/**
	 * Clear local Tapin shipment meta so the order can be registered again.
	 * Does not delete the parcel on Tapin servers.
	 *
	 * @param WC_Order $order Order.
	 * @return array{ok:bool,message:string}
	 */
	public static function clear_local_shipment( $order ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return array( 'ok' => false, 'message' => __( 'سفارش پیدا نشد.', 'webino-dashboard' ) );
		}
		foreach ( array(
			self::META_ORDER_ID,
			self::META_BARCODE,
			self::META_STATUS,
			self::META_UUID,
			'_post_barcode',
		) as $key ) {
			$order->delete_meta_data( $key );
		}
		$order->save();
		return array(
			'ok'      => true,
			'message' => __( 'متای محلی تاپین پاک شد؛ می‌توانید دوباره ثبت کنید.', 'webino-dashboard' ),
		);
	}

	/**
	 * @return void
	 */
	public static function cron_sync_statuses() {
		if ( ! Webino_Tapin_Settings::is_connected() ) {
			return;
		}
		$q = wc_get_orders(
			array(
				'limit'        => 30,
				'status'       => array( 'processing', 'completed', 'on-hold', 'webino-packaged', 'webino-ready-to-ship', 'webino-shipping' ),
				'meta_key'     => self::META_ORDER_ID,
				'meta_compare' => 'EXISTS',
				'return'       => 'objects',
			)
		);
		foreach ( (array) $q as $order ) {
			if ( is_a( $order, 'WC_Order' ) ) {
				self::refresh_status( $order );
			}
		}
	}
}
