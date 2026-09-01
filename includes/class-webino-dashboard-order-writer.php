<?php
/**
 * Create / update WooCommerce orders from the dashboard POS and order composer.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manual / POS order writer.
 */
final class Webino_Dashboard_Order_Writer {

	const META_POS         = '_webino_pos_order';
	const META_PAY_LINK    = '_webino_pay_link_order';
	const META_PAY_GW      = '_webino_pay_gateways';
	const META_CHANNEL     = '_webino_sales_channel';
	const META_CREATED_BY  = '_webino_created_by';
	const META_TENDER      = '_webino_payment_tender';
	const META_AMOUNT_PAID = '_webino_amount_paid';

	/**
	 * Default purchase type while applying line items.
	 *
	 * @var string
	 */
	private static $line_purchase_type = '';

	/**
	 *
	 * @return array<int,string>
	 */
	public static function channels() {
		return array( 'in_store', 'phone', 'bale', 'eitaa', 'rubika', 'telegram', 'instagram', 'other' );
	}

	/**
	 * Allowed payment tender labels.
	 *
	 * @return array<int,string>
	 */
	public static function tenders() {
		return array( 'cash', 'card_to_card', 'pos_terminal', 'online', 'other' );
	}

	/**
	 * Statuses that block line/address edits.
	 *
	 * @return array<int,string>
	 */
	public static function locked_statuses() {
		$defaults = array( 'completed', 'refunded', 'cancelled', 'failed' );
		/**
		 * Filter statuses that lock POS/manual order editing.
		 *
		 * @param array<int,string> $statuses Statuses.
		 */
		return apply_filters( 'webino_dashboard_order_locked_statuses', $defaults );
	}

	/**
	 * Create a WC order from dashboard payload.
	 *
	 * @param array<string,mixed> $data Payload.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function create( array $data ) {
		if ( ! function_exists( 'wc_create_order' ) ) {
			return new WP_Error( 'no_wc', __( 'WooCommerce is required.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		$customer_id = self::resolve_customer( $data );
		if ( is_wp_error( $customer_id ) ) {
			return $customer_id;
		}

		$pay_link = ! empty( $data['pay_link'] );
		$order = wc_create_order(
			array(
				'customer_id' => (int) $customer_id,
				'created_via' => ( ! empty( $data['pos'] ) || $pay_link ) ? 'webino_pos' : 'webino_dashboard',
			)
		);
		if ( is_wp_error( $order ) || ! $order ) {
			return new WP_Error( 'order_create_failed', __( 'Could not create order.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		$result = self::apply_payload( $order, $data, true );
		if ( is_wp_error( $result ) ) {
			$order->delete( true );
			return $result;
		}

		$pay_link = ! empty( $data['pay_link'] );
		if ( $pay_link ) {
			$status = 'pending';
		} else {
			$status = isset( $data['status'] ) ? sanitize_key( (string) $data['status'] ) : 'processing';
			if ( '' === $status ) {
				$status = 'processing';
			}
		}
		$order->set_status( $status );
		$order->save();

		$detail = Webino_Dashboard_Orders::map_detail( $order );
		if ( $pay_link && class_exists( 'Webino_Dashboard_Pay_Order', false ) ) {
			$detail['payment_url'] = Webino_Dashboard_Pay_Order::public_url( $order );
			if ( class_exists( 'Webino_Dashboard_Sms_Order_Hooks', false ) ) {
				Webino_Dashboard_Sms_Order_Hooks::notify_snapshot(
					'pos-payment-link',
					Webino_Dashboard_Sms_Order_Hooks::build_snapshot( $order )
				);
			}
		}

		return $detail;
	}

	/**
	 * Update an existing order (lines/address/fees) when not locked.
	 *
	 * @param int                 $order_id Order ID.
	 * @param array<string,mixed> $data     Payload.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function update( $order_id, array $data ) {
		$order = wc_get_order( (int) $order_id );
		if ( ! $order ) {
			return new WP_Error( 'not_found', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( ! Webino_Dashboard_Rest_Base::can_view_order( (int) $order_id ) ) {
			return new WP_Error( 'forbidden', __( 'Forbidden.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		if ( in_array( $order->get_status(), self::locked_statuses(), true ) ) {
			return new WP_Error( 'locked', __( 'This order can no longer be edited.', 'webino-dashboard' ), array( 'status' => 409 ) );
		}
		if ( Webino_Dashboard_Rest_Base::is_seller_only() ) {
			if ( (int) $order->get_meta( self::META_CREATED_BY, true ) !== get_current_user_id() ) {
				return new WP_Error( 'forbidden', __( 'Forbidden.', 'webino-dashboard' ), array( 'status' => 403 ) );
			}
		}

		$result = self::apply_payload( $order, $data, false );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( ! empty( $data['status'] ) && Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' ) ) {
			$order->set_status( sanitize_key( (string) $data['status'] ) );
		}
		$order->save();

		return Webino_Dashboard_Orders::map_detail( $order );
	}

	/**
	 * POS product search by name / SKU / barcode.
	 *
	 * @param string $q     Query.
	 * @param int    $limit Limit.
	 * @return array<int,array<string,mixed>>
	 */
	public static function pos_search( $q, $limit = 30 ) {
		$q     = trim( (string) $q );
		$limit = max( 1, min( 100, (int) $limit ) );
		if ( '' === $q || ! function_exists( 'wc_get_products' ) ) {
			return array();
		}

		$by_sku = wc_get_product_id_by_sku( $q );
		$ids    = array();
		if ( $by_sku ) {
			$ids[] = (int) $by_sku;
		}

		$search = wc_get_products(
			array(
				'status' => 'publish',
				'limit'  => $limit,
				's'      => $q,
				'return' => 'ids',
			)
		);
		foreach ( (array) $search as $id ) {
			$ids[] = (int) $id;
		}
		$ids = array_values( array_unique( array_filter( $ids ) ) );
		$ids = array_slice( $ids, 0, $limit );

		$out = array();
		foreach ( $ids as $id ) {
			$p = wc_get_product( $id );
			if ( ! $p ) {
				continue;
			}
			$row = self::serialize_pos_product( $p );
			if ( $row ) {
				$out[] = $row;
			}
		}
		return $out;
	}

	/**
	 * Find or create customer from payload.
	 *
	 * @param array<string,mixed> $data Payload.
	 * @return int|WP_Error User ID (0 = guest).
	 */
	public static function resolve_customer( array $data ) {
		if ( isset( $data['customer_id'] ) && (int) $data['customer_id'] > 0 ) {
			$uid = (int) $data['customer_id'];
			if ( ! get_user_by( 'id', $uid ) ) {
				return new WP_Error( 'bad_customer', __( 'Customer not found.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			return $uid;
		}

		$customer = isset( $data['customer'] ) && is_array( $data['customer'] ) ? $data['customer'] : array();
		$phone    = isset( $customer['phone'] ) ? preg_replace( '/\D+/', '', (string) $customer['phone'] ) : '';
		$email    = isset( $customer['email'] ) ? sanitize_email( (string) $customer['email'] ) : '';
		$first    = isset( $customer['first_name'] ) ? sanitize_text_field( (string) $customer['first_name'] ) : '';
		$last     = isset( $customer['last_name'] ) ? sanitize_text_field( (string) $customer['last_name'] ) : '';
		$create   = ! empty( $data['create_customer'] ) || ! empty( $customer['create'] );

		if ( $phone ) {
			$found = self::find_user_by_phone( $phone );
			if ( $found ) {
				return $found;
			}
		}
		if ( $email ) {
			$u = get_user_by( 'email', $email );
			if ( $u ) {
				return (int) $u->ID;
			}
		}

		if ( ! $create && ! $phone && ! $email ) {
			return 0;
		}

		if ( ! $create && ( $phone || $email ) ) {
			// Guest checkout with billing phone only.
			return 0;
		}

		if ( ! $email && $phone ) {
			$email = 'pos+' . $phone . '@' . wp_parse_url( home_url(), PHP_URL_HOST );
		}
		if ( ! $email ) {
			return new WP_Error( 'customer_required', __( 'Phone or email is required to create a customer.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$login = 'pos_' . ( $phone ? $phone : wp_generate_password( 8, false ) );
		$uid   = wc_create_new_customer( $email, $login, wp_generate_password( 16, true ) );
		if ( is_wp_error( $uid ) ) {
			return $uid;
		}
		wp_update_user(
			array(
				'ID'         => (int) $uid,
				'first_name' => $first,
				'last_name'  => $last,
				'display_name' => trim( $first . ' ' . $last ) ?: $login,
			)
		);
		if ( $phone ) {
			update_user_meta( (int) $uid, 'billing_phone', $phone );
			update_user_meta( (int) $uid, 'phone', $phone );
		}
		if ( ! empty( $customer['national_id'] ) ) {
			update_user_meta( (int) $uid, 'billing_national_id', sanitize_text_field( (string) $customer['national_id'] ) );
			update_user_meta( (int) $uid, '_webino_national_id', sanitize_text_field( (string) $customer['national_id'] ) );
		}
		if ( ! empty( $customer['economic_code'] ) ) {
			update_user_meta( (int) $uid, '_webino_economic_code', sanitize_text_field( (string) $customer['economic_code'] ) );
		}
		if ( ! empty( $customer['person_kind'] ) ) {
			update_user_meta( (int) $uid, '_webino_person_kind', sanitize_key( (string) $customer['person_kind'] ) );
		}
		return (int) $uid;
	}

	/**
	 * @param string $phone Digits.
	 * @return int
	 */
	private static function find_user_by_phone( $phone ) {
		$phone = preg_replace( '/\D+/', '', (string) $phone );
		if ( '' === $phone ) {
			return 0;
		}
		$q = new WP_User_Query(
			array(
				'number'     => 1,
				'meta_query' => array(
					'relation' => 'OR',
					array( 'key' => 'billing_phone', 'value' => $phone, 'compare' => 'LIKE' ),
					array( 'key' => 'phone', 'value' => $phone, 'compare' => 'LIKE' ),
				),
				'fields'     => 'ID',
			)
		);
		$ids = $q->get_results();
		return $ids ? (int) $ids[0] : 0;
	}

	/**
	 * @param WC_Order            $order  Order.
	 * @param array<string,mixed> $data   Payload.
	 * @param bool                $is_new New order.
	 * @return true|WP_Error
	 */
	private static function apply_payload( $order, array $data, $is_new ) {
		self::$line_purchase_type = ! empty( $data['purchase_type'] ) ? sanitize_key( (string) $data['purchase_type'] ) : '';
		if ( in_array( self::$line_purchase_type, array( 'cash', 'installment' ), true ) ) {
			self::$line_purchase_type = 'installment' === self::$line_purchase_type ? 'credit' : 'retail';
		}

		$items = isset( $data['line_items'] ) && is_array( $data['line_items'] ) ? $data['line_items'] : null;
		if ( null !== $items ) {
			foreach ( $order->get_items( array( 'line_item', 'fee', 'shipping', 'coupon' ) ) as $item_id => $item ) {
				$order->remove_item( $item_id );
			}
			if ( ! $items ) {
				return new WP_Error( 'no_items', __( 'Add at least one product.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			foreach ( $items as $row ) {
				$err = self::add_line_item( $order, $row );
				if ( is_wp_error( $err ) ) {
					return $err;
				}
			}
		} elseif ( $is_new ) {
			return new WP_Error( 'no_items', __( 'Add at least one product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		if ( ! empty( $data['fees'] ) && is_array( $data['fees'] ) ) {
			foreach ( $data['fees'] as $fee ) {
				$name   = isset( $fee['name'] ) ? sanitize_text_field( (string) $fee['name'] ) : __( 'Fee', 'webino-dashboard' );
				$amount = isset( $fee['amount'] ) ? (float) $fee['amount'] : 0;
				if ( 0.0 === $amount ) {
					continue;
				}
				$item = new WC_Order_Item_Fee();
				$item->set_name( $name );
				$item->set_total( $amount );
				$order->add_item( $item );
			}
		}

		if ( isset( $data['shipping_total'] ) || ! empty( $data['shipping_line'] ) ) {
			foreach ( $order->get_items( 'shipping' ) as $ship_id => $ship_item ) {
				$order->remove_item( $ship_id );
			}
			if ( ! empty( $data['shipping_line'] ) && is_array( $data['shipping_line'] ) ) {
				$sl   = $data['shipping_line'];
				$item = new WC_Order_Item_Shipping();
				$item->set_method_title( isset( $sl['title'] ) ? sanitize_text_field( (string) $sl['title'] ) : __( 'Shipping', 'webino-dashboard' ) );
				if ( ! empty( $sl['method_id'] ) ) {
					$item->set_method_id( sanitize_key( (string) $sl['method_id'] ) );
				}
				if ( isset( $sl['instance_id'] ) ) {
					$item->set_instance_id( (int) $sl['instance_id'] );
				}
				$item->set_total( isset( $sl['total'] ) ? (float) $sl['total'] : (float) ( $data['shipping_total'] ?? 0 ) );
				$order->add_item( $item );
			} else {
				$ship = (float) $data['shipping_total'];
				if ( $ship > 0 ) {
					$item = new WC_Order_Item_Shipping();
					$item->set_method_title( isset( $data['shipping_method'] ) ? sanitize_text_field( (string) $data['shipping_method'] ) : __( 'Shipping', 'webino-dashboard' ) );
					$item->set_total( $ship );
					$order->add_item( $item );
				}
			}
		}

		if ( ! empty( $data['coupon_codes'] ) && is_array( $data['coupon_codes'] ) ) {
			foreach ( $data['coupon_codes'] as $code ) {
				$code = wc_format_coupon_code( (string) $code );
				if ( $code ) {
					$order->apply_coupon( $code );
				}
			}
		}

		self::apply_addresses( $order, $data );
		self::apply_meta( $order, $data, $is_new );

		$calc_taxes = ! isset( $data['calculate_taxes'] ) || ! empty( $data['calculate_taxes'] );
		$order->calculate_totals( $calc_taxes );

		if ( isset( $data['order_discount'] ) && (float) $data['order_discount'] > 0 ) {
			$disc = (float) $data['order_discount'];
			$item = new WC_Order_Item_Fee();
			$item->set_name( __( 'Order discount', 'webino-dashboard' ) );
			$item->set_total( -1 * abs( $disc ) );
			$order->add_item( $item );
			$order->calculate_totals( $calc_taxes );
		}

		if ( ! empty( $data['customer_note'] ) ) {
			$order->set_customer_note( sanitize_textarea_field( (string) $data['customer_note'] ) );
		}

		return true;
	}

	/**
	 * @param WC_Order            $order Order.
	 * @param array<string,mixed> $row   Line.
	 * @return true|WP_Error
	 */
	private static function add_line_item( $order, array $row ) {
		$product_id   = isset( $row['product_id'] ) ? (int) $row['product_id'] : 0;
		$variation_id = isset( $row['variation_id'] ) ? (int) $row['variation_id'] : 0;
		$qty          = isset( $row['quantity'] ) ? (float) $row['quantity'] : 1;
		if ( $qty <= 0 ) {
			$qty = 1;
		}
		$product = $variation_id ? wc_get_product( $variation_id ) : wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'bad_product', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$args = array();
		$purchase_type = ! empty( $row['purchase_type'] ) ? sanitize_key( (string) $row['purchase_type'] ) : self::$line_purchase_type;
		if ( in_array( $purchase_type, array( 'cash', 'installment' ), true ) ) {
			$purchase_type = 'installment' === $purchase_type ? 'credit' : 'retail';
		}
		$wfcp_unit = self::wfcp_unit_price( $product, $purchase_type );
		if ( null !== $wfcp_unit ) {
			$args['subtotal'] = $wfcp_unit * $qty;
			$args['total']    = isset( $row['total'] ) ? (float) $row['total'] : $args['subtotal'];
		} elseif ( isset( $row['subtotal'] ) || isset( $row['price'] ) ) {
			$unit = isset( $row['price'] ) ? (float) $row['price'] : ( (float) $row['subtotal'] / $qty );
			$args['subtotal'] = $unit * $qty;
			$args['total']    = isset( $row['total'] ) ? (float) $row['total'] : $args['subtotal'];
		}
		if ( ! empty( $row['variation'] ) && is_array( $row['variation'] ) ) {
			$args['variation'] = $row['variation'];
		}

		$item_id = $order->add_product( $product, $qty, $args );
		if ( ! $item_id ) {
			return new WP_Error( 'add_product_failed', __( 'Could not add product to order.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		$item = $order->get_item( $item_id );
		if ( $item && ! empty( $purchase_type ) ) {
			$item->add_meta_data( 'wfcp_purchase_type', $purchase_type, true );
		} elseif ( $item && ! empty( $row['purchase_type'] ) ) {
			$item->add_meta_data( 'wfcp_purchase_type', sanitize_key( (string) $row['purchase_type'] ), true );
		}
		if ( $item && isset( $row['cogs'] ) ) {
			$item->add_meta_data( '_wfcp_cogs', (float) $row['cogs'], true );
		} elseif ( $item && function_exists( 'get_post_meta' ) ) {
			$cogs = (float) get_post_meta( $product->get_id(), '_wfcp_purchase_price', true );
			if ( $cogs <= 0 && $product->is_type( 'variation' ) ) {
				$cogs = (float) get_post_meta( $product->get_parent_id(), '_wfcp_purchase_price', true );
			}
			if ( $cogs > 0 ) {
				$item->add_meta_data( '_wfcp_cogs', $cogs * $qty, true );
			}
		}
		if ( $item ) {
			$item->save();
		}
		return true;
	}

	/**
	 * @param WC_Order            $order Order.
	 * @param array<string,mixed> $data  Payload.
	 * @return void
	 */
	private static function apply_addresses( $order, array $data ) {
		$billing  = isset( $data['billing'] ) && is_array( $data['billing'] ) ? $data['billing'] : array();
		$shipping = isset( $data['shipping'] ) && is_array( $data['shipping'] ) ? $data['shipping'] : array();
		$customer = isset( $data['customer'] ) && is_array( $data['customer'] ) ? $data['customer'] : array();

		if ( ! $billing && $customer ) {
			$billing = array(
				'first_name' => $customer['first_name'] ?? '',
				'last_name'  => $customer['last_name'] ?? '',
				'phone'      => $customer['phone'] ?? '',
				'email'      => $customer['email'] ?? '',
				'company'    => $customer['company'] ?? '',
			);
		}

		$map = array(
			'first_name', 'last_name', 'company', 'address_1', 'address_2',
			'city', 'state', 'postcode', 'country', 'email', 'phone',
		);
		foreach ( $map as $key ) {
			if ( isset( $billing[ $key ] ) ) {
				$setter = 'set_billing_' . $key;
				if ( is_callable( array( $order, $setter ) ) ) {
					$order->{$setter}( sanitize_text_field( (string) $billing[ $key ] ) );
				}
			}
			if ( isset( $shipping[ $key ] ) && 'email' !== $key && 'phone' !== $key ) {
				$setter = 'set_shipping_' . $key;
				if ( is_callable( array( $order, $setter ) ) ) {
					$order->{$setter}( sanitize_text_field( (string) $shipping[ $key ] ) );
				}
			}
		}
		if ( ! $order->get_billing_country() ) {
			$order->set_billing_country( 'IR' );
		}
	}

	/**
	 * @param WC_Order            $order  Order.
	 * @param array<string,mixed> $data   Payload.
	 * @param bool                $is_new New.
	 * @return void
	 */
	private static function apply_meta( $order, array $data, $is_new ) {
		$pay_link = ! empty( $data['pay_link'] );
		if ( $is_new || ! empty( $data['pos'] ) || $pay_link ) {
			$order->update_meta_data( self::META_POS, '1' );
		}
		if ( $pay_link ) {
			$order->update_meta_data( self::META_PAY_LINK, '1' );
			if ( ! empty( $data['payment_gateways'] ) && is_array( $data['payment_gateways'] ) ) {
				$ids = array();
				foreach ( $data['payment_gateways'] as $gw_id ) {
					$gw_id = sanitize_key( (string) $gw_id );
					if ( '' !== $gw_id && 0 !== strpos( $gw_id, 'webino_' ) ) {
						$ids[] = $gw_id;
					}
				}
				$order->update_meta_data( self::META_PAY_GW, wp_json_encode( array_values( array_unique( $ids ) ) ) );
			}
			if ( ! empty( $data['allowed_purchase_types'] ) && is_array( $data['allowed_purchase_types'] ) ) {
				$types = array();
				foreach ( $data['allowed_purchase_types'] as $pt ) {
					$pt = sanitize_key( (string) $pt );
					if ( in_array( $pt, array( 'retail', 'credit', 'cash', 'installment' ), true ) ) {
						$types[] = in_array( $pt, array( 'credit', 'installment' ), true ) ? 'credit' : 'retail';
					}
				}
				$types = array_values( array_unique( $types ) );
				if ( $types ) {
					$order->update_meta_data( '_webino_pay_purchase_types', wp_json_encode( $types ) );
				}
			}
		}
		if ( $is_new ) {
			$order->update_meta_data( self::META_CREATED_BY, get_current_user_id() );
		}
		if ( ! empty( $data['sales_channel'] ) ) {
			$ch = sanitize_key( (string) $data['sales_channel'] );
			if ( in_array( $ch, self::channels(), true ) ) {
				$order->update_meta_data( self::META_CHANNEL, $ch );
			}
		}
		if ( ! empty( $data['payment_tender'] ) && empty( $data['pay_link'] ) ) {
			$t = sanitize_key( (string) $data['payment_tender'] );
			if ( in_array( $t, self::tenders(), true ) ) {
				$order->update_meta_data( self::META_TENDER, $t );
				$order->set_payment_method( 'webino_' . $t );
				$order->set_payment_method_title( self::tender_label( $t ) );
			}
		}
		if ( isset( $data['amount_paid'] ) ) {
			$order->update_meta_data( self::META_AMOUNT_PAID, (float) $data['amount_paid'] );
		}
		if ( ! empty( $data['purchase_type'] ) ) {
			$order->update_meta_data( '_wfcp_purchase_type', sanitize_key( (string) $data['purchase_type'] ) );
		}
		if ( ! empty( $data['warehouse_id'] ) ) {
			$order->update_meta_data( '_webino_warehouse_id', (int) $data['warehouse_id'] );
		}
		if ( ! empty( $data['buyer_tax'] ) && is_array( $data['buyer_tax'] ) ) {
			$order->update_meta_data( '_webino_buyer_tax', wp_json_encode( $data['buyer_tax'] ) );
			if ( ! empty( $data['buyer_tax']['national_id'] ) ) {
				$order->update_meta_data( '_billing_national_id', sanitize_text_field( (string) $data['buyer_tax']['national_id'] ) );
			}
			if ( ! empty( $data['buyer_tax']['economic_code'] ) ) {
				$order->update_meta_data( '_billing_economic_code', sanitize_text_field( (string) $data['buyer_tax']['economic_code'] ) );
			}
		}
		if ( ! empty( $data['set_paid'] ) && empty( $data['pay_link'] ) ) {
			$order->set_date_paid( time() );
		}
	}

	/**
	 * WFCP unit price for a product and purchase type.
	 *
	 * @param WC_Product $product       Product.
	 * @param string     $purchase_type retail|credit|cash|installment.
	 * @return float|null
	 */
	public static function wfcp_unit_price( $product, $purchase_type = '' ) {
		if ( ! class_exists( 'WFCP_Calculator' ) || ! $product ) {
			return null;
		}
		$product_id = (int) $product->get_id();
		$purchase   = (float) get_post_meta( $product_id, '_wfcp_purchase_price', true );
		if ( $purchase <= 0 && $product->is_type( 'variation' ) ) {
			$purchase = (float) get_post_meta( (int) $product->get_parent_id(), '_wfcp_purchase_price', true );
		}
		if ( $purchase <= 0 ) {
			return null;
		}
		$pt = in_array( $purchase_type, array( 'credit', 'installment' ), true ) ? 'credit' : 'retail';
		return (float) WFCP_Calculator::calculate_price( $purchase, $pt, $product_id );
	}

	/**
	 * Recalculate line totals when customer switches cash/installment on pay page.
	 *
	 * @param WC_Order $order         Order.
	 * @param string   $purchase_type retail|credit.
	 * @return void
	 */
	public static function recalculate_order_purchase_type( $order, $purchase_type ) {
		$purchase_type = in_array( $purchase_type, array( 'credit', 'installment' ), true ) ? 'credit' : 'retail';
		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof WC_Order_Item_Product ) {
				continue;
			}
			$product = $item->get_product();
			if ( ! $product ) {
				continue;
			}
			$unit = self::wfcp_unit_price( $product, $purchase_type );
			if ( null === $unit ) {
				continue;
			}
			$qty = (float) $item->get_quantity();
			$item->set_subtotal( $unit * $qty );
			$item->set_total( $unit * $qty );
			$item->update_meta_data( 'wfcp_purchase_type', $purchase_type, true );
			$item->save();
		}
		$order->update_meta_data( '_wfcp_purchase_type', $purchase_type );
		$order->calculate_totals();
		$order->save();
	}

	/**
	 * @param string $tender Tender key.
	 * @return string
	 */
	public static function tender_label( $tender ) {
		$labels = array(
			'cash'          => __( 'Cash', 'webino-dashboard' ),
			'card_to_card'  => __( 'Card to card', 'webino-dashboard' ),
			'pos_terminal'  => __( 'Card terminal', 'webino-dashboard' ),
			'online'        => __( 'Online', 'webino-dashboard' ),
			'other'         => __( 'Other', 'webino-dashboard' ),
		);
		return $labels[ $tender ] ?? $tender;
	}

	/**
	 * @param WC_Product $p Product.
	 * @return array<string,mixed>|null
	 */
	private static function serialize_pos_product( $p ) {
		$type = $p->get_type();
		$row  = array(
			'id'             => $p->get_id(),
			'name'           => $p->get_name(),
			'sku'            => $p->get_sku(),
			'price'          => (float) $p->get_price(),
			'regular_price'  => (float) $p->get_regular_price(),
			'stock_quantity' => $p->get_stock_quantity(),
			'stock_status'   => $p->get_stock_status(),
			'type'           => $type,
			'image'          => wp_get_attachment_image_url( $p->get_image_id(), 'thumbnail' ) ?: '',
			'purchase_price' => (float) get_post_meta( $p->get_id(), '_wfcp_purchase_price', true ),
			'variations'     => array(),
		);
		if ( $p->is_type( 'variable' ) ) {
			foreach ( $p->get_available_variations() as $v ) {
				$vp = wc_get_product( $v['variation_id'] );
				if ( ! $vp ) {
					continue;
				}
				$row['variations'][] = array(
					'id'            => $vp->get_id(),
					'name'          => $vp->get_name(),
					'sku'           => $vp->get_sku(),
					'price'         => (float) $vp->get_price(),
					'stock_quantity'=> $vp->get_stock_quantity(),
					'stock_status'  => $vp->get_stock_status(),
					'attributes'    => $v['attributes'] ?? array(),
				);
			}
		}
		return $row;
	}
}
