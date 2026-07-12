<?php
/**
 * WooCommerce order helpers for dashboard REST.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Order serialization and utilities.
 */
class Webino_Dashboard_Orders {

	/**
	 * @return bool
	 */
	public static function wc_active() {
		return function_exists( 'wc_get_order' );
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function get_tracking_code( $o ) {
		if ( class_exists( '\Webino_Dashboard_Bots_Telegram\Messaging\TemplateRenderer' ) ) {
			return \Webino_Dashboard_Bots_Telegram\Messaging\TemplateRenderer::get_tracking_code( $o );
		}
		$v = apply_filters( 'wbdb_tg_tracking_value', '', $o );
		if ( '' !== $v ) {
			return (string) $v;
		}
		$m = $o->get_meta( 'woobale_tracking_code' );
		if ( '' !== $m ) {
			return (string) $m;
		}
		return (string) $o->get_meta( '_tracking_number' );
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function get_tracking_url( $o ) {
		if ( class_exists( '\Webino_Dashboard_Bots_Telegram\Messaging\TemplateRenderer' ) ) {
			return \Webino_Dashboard_Bots_Telegram\Messaging\TemplateRenderer::get_tracking_url( $o );
		}
		$code = self::get_tracking_code( $o );
		if ( '' === $code ) {
			return '';
		}
		$url = (string) apply_filters( 'webino_dashboard_tracking_url', '', $o, $code );
		if ( '' === $url ) {
			$url = 'https://tracking.post.ir/?id=' . rawurlencode( $code );
		}
		return (string) apply_filters( 'wbdb_tg_tracking_url', $url, $o, $code );
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function get_order_source( $o ) {
		$source_type = (string) $o->get_meta( '_wc_order_attribution_source_type' );
		$utm_source  = (string) $o->get_meta( '_wc_order_attribution_utm_source' );
		if ( '' !== $source_type && '' !== $utm_source ) {
			return ucfirst( $source_type ) . ': ' . $utm_source;
		}
		if ( '' !== $utm_source ) {
			return $utm_source;
		}
		if ( '' !== $source_type ) {
			return ucfirst( $source_type );
		}
		$created_via = $o->get_created_via();
		return $created_via ? ucfirst( $created_via ) : '';
	}

	/**
	 * @param WC_Order $o Order.
	 * @return array<string, mixed>
	 */
	public static function get_attribution( $o ) {
		$source_type = (string) $o->get_meta( '_wc_order_attribution_source_type' );
		return array(
			'source'         => self::get_order_source( $o ),
			'source_type'    => $source_type,
			'created_via'    => (string) $o->get_created_via(),
			'device_type'    => (string) $o->get_meta( '_wc_order_attribution_device_type' ),
			'session_count'  => (int) $o->get_meta( '_wc_order_attribution_session_count' ),
			'utm_source'     => (string) $o->get_meta( '_wc_order_attribution_utm_source' ),
			'utm_medium'     => (string) $o->get_meta( '_wc_order_attribution_utm_medium' ),
			'utm_campaign'   => (string) $o->get_meta( '_wc_order_attribution_utm_campaign' ),
		);
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function format_ship_to_line( $o ) {
		$ship = self::format_address_parts( $o, 'shipping' );
		$parts = array_filter(
			array(
				$ship['name'],
				$ship['state_label'],
				$ship['city'],
				$ship['address'],
				$ship['postcode'],
			)
		);
		return implode( ', ', $parts );
	}

	/**
	 * Resolve WooCommerce state code to label.
	 *
	 * @param string $country Country code.
	 * @param string $state State code.
	 * @return string
	 */
	public static function get_state_label( $country, $state ) {
		$state   = (string) $state;
		$country = (string) $country;
		if ( '' === $state ) {
			return '';
		}
		if ( function_exists( 'WC' ) && WC()->countries ) {
			$states = WC()->countries->get_states( $country );
			if ( is_array( $states ) && isset( $states[ $state ] ) ) {
				return (string) $states[ $state ];
			}
		}
		return $state;
	}

	/**
	 * Structured address: state, city, street, postcode (Iran-friendly order).
	 *
	 * @param WC_Order $o Order.
	 * @param string   $type billing|shipping.
	 * @return array<string, string>
	 */
	public static function format_address_parts( $o, $type = 'billing' ) {
		$type = 'shipping' === $type ? 'shipping' : 'billing';
		if ( 'billing' === $type ) {
			$country    = $o->get_billing_country();
			$state      = $o->get_billing_state();
			$first_name = $o->get_billing_first_name();
			$last_name  = $o->get_billing_last_name();
			$company    = $o->get_billing_company();
			$email      = $o->get_billing_email();
			$phone      = $o->get_billing_phone();
			$address_1  = $o->get_billing_address_1();
			$address_2  = $o->get_billing_address_2();
			$city       = $o->get_billing_city();
			$postcode   = $o->get_billing_postcode();
		} else {
			$country    = $o->get_shipping_country();
			$state      = $o->get_shipping_state();
			$first_name = $o->get_shipping_first_name();
			$last_name  = $o->get_shipping_last_name();
			$company    = $o->get_shipping_company();
			$email      = '';
			$phone      = $o->get_billing_phone();
			$address_1  = $o->get_shipping_address_1();
			$address_2  = $o->get_shipping_address_2();
			$city       = $o->get_shipping_city();
			$postcode   = $o->get_shipping_postcode();
		}

		$name    = trim( $first_name . ' ' . $last_name );
		$sep     = Webino_Dashboard_Locale::list_separator();
		$address = trim( implode( $sep, array_filter( array( $address_1, $address_2 ) ) ) );
		$state_label = self::get_state_label( $country, $state );

		return array(
			'name'         => $name,
			'company'      => (string) $company,
			'email'        => (string) $email,
			'phone'        => (string) $phone,
			'state'        => (string) $state,
			'state_label'  => $state_label,
			'city'         => (string) $city,
			'address'      => $address,
			'postcode'     => (string) $postcode,
			'country'      => (string) $country,
		);
	}

	/**
	 * @param array<string, string> $parts Address parts.
	 * @return array<string, string>
	 */
	public static function address_parts_for_rest( $parts ) {
		return array(
			'first_name'  => '',
			'last_name'   => '',
			'name'        => $parts['name'] ?? '',
			'company'     => $parts['company'] ?? '',
			'email'       => $parts['email'] ?? '',
			'phone'       => $parts['phone'] ?? '',
			'address_1'   => $parts['address'] ?? '',
			'address_2'   => '',
			'city'        => $parts['city'] ?? '',
			'state'       => $parts['state'] ?? '',
			'state_label' => $parts['state_label'] ?? '',
			'postcode'    => $parts['postcode'] ?? '',
			'country'     => $parts['country'] ?? '',
		);
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function ship_to_maps_url( $o ) {
		$line = self::format_ship_to_line( $o );
		if ( '' === $line ) {
			return '';
		}
		return 'https://maps.google.com/maps?&q=' . rawurlencode( $line ) . '&z=16';
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function get_shipping_method_title( $o ) {
		$methods = array();
		foreach ( $o->get_shipping_methods() as $method ) {
			$methods[] = $method->get_name();
		}
		return implode( ', ', $methods );
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function get_meta_first( $o, $keys ) {
		foreach ( $keys as $key ) {
			$val = $o->get_meta( $key );
			if ( '' !== $val && null !== $val ) {
				return (string) $val;
			}
		}
		return '';
	}

	/**
	 * @param int $customer_id Customer user ID.
	 * @return array<string, float|int>
	 */
	public static function get_customer_history( $customer_id ) {
		$customer_id = (int) $customer_id;
		if ( $customer_id <= 0 || ! function_exists( 'wc_get_orders' ) ) {
			return array(
				'order_count'       => 0,
				'total_spent'       => 0.0,
				'avg_order_value'   => 0.0,
			);
		}
		$paid_statuses = function_exists( 'wc_get_is_paid_statuses' )
			? wc_get_is_paid_statuses()
			: array( 'completed', 'processing' );
		$order_limit = 500;
		$orders      = wc_get_orders(
			array(
				'customer_id' => $customer_id,
				'limit'       => $order_limit,
				'return'      => 'objects',
				'status'      => $paid_statuses,
			)
		);
		$total       = 0.0;
		foreach ( $orders as $order ) {
			if ( $order ) {
				$total += (float) $order->get_total();
			}
		}
		$count = count( $orders );
		return array(
			'order_count'     => $count,
			'total_spent'     => $total,
			'avg_order_value' => $count > 0 ? $total / $count : 0.0,
			'truncated'       => $count >= $order_limit,
		);
	}

	/**
	 * @return array<int, array{slug: string, label: string, count: int}>
	 */
	public static function get_status_counts() {
		global $wpdb;
		$counts = array();
		if ( ! self::wc_active() ) {
			return $counts;
		}
		$statuses = wc_get_order_statuses();
		$total    = 0;
		foreach ( array_keys( $statuses ) as $status ) {
			$slug  = str_replace( 'wc-', '', $status );
			$count = function_exists( 'wc_orders_count' ) ? (int) wc_orders_count( $slug ) : 0;
			$counts[] = array(
				'slug'  => str_replace( 'wc-', '', $status ),
				'label' => $statuses[ $status ],
				'count' => $count,
			);
			$total += $count;
		}
		array_unshift(
			$counts,
			array(
				'slug'  => 'all',
				'label' => __( 'All', 'webino-dashboard' ),
				'count' => $total,
			)
		);
		return $counts;
	}

	/**
	 * @param WC_Order $o Order.
	 * @return array<string, mixed>
	 */
	public static function map_list_item( $o ) {
		$dc = $o->get_date_created();
		return array(
			'id'                => $o->get_id(),
			'number'            => $o->get_order_number(),
			'status'            => $o->get_status(),
			'status_label'      => wc_get_order_status_name( $o->get_status() ),
			'total'             => $o->get_total(),
			'currency'          => $o->get_currency(),
			'date'              => $dc ? $dc->format( 'c' ) : null,
			'customer_name'     => trim( $o->get_formatted_billing_full_name() ) ?: trim( $o->get_formatted_shipping_full_name() ),
			'billing_email'     => $o->get_billing_email(),
			'billing_phone'     => $o->get_billing_phone(),
			'ship_to'           => self::format_ship_to_line( $o ),
			'ship_to_maps_url'  => self::ship_to_maps_url( $o ),
			'shipping_method'   => self::get_shipping_method_title( $o ),
			'source'            => self::get_order_source( $o ),
			'source_type'       => (string) $o->get_meta( '_wc_order_attribution_source_type' ),
			'utm_source'        => (string) $o->get_meta( '_wc_order_attribution_utm_source' ),
			'created_via'       => (string) $o->get_created_via(),
		);
	}

	/**
	 * @param WC_Order $o Order.
	 * @return array<string, mixed>
	 */
	public static function map_detail( $o ) {
		$items_out = array();
		foreach ( array_values( $o->get_items() ) as $item ) {
			$product = $item->get_product();
			$sku     = $product && is_callable( array( $product, 'get_sku' ) ) ? (string) $product->get_sku() : '';
			$items_out[] = array(
				'name'         => $item->get_name(),
				'quantity'     => $item->get_quantity(),
				'subtotal'     => $item->get_subtotal(),
				'total'        => $item->get_total(),
				'sku'          => $sku,
				'product_id'   => (int) $item->get_product_id(),
				'variation_id' => (int) $item->get_variation_id(),
			);
		}

		$shipping_items = array();
		foreach ( $o->get_shipping_methods() as $method ) {
			$shipping_items[] = array(
				'name'  => $method->get_name(),
				'total' => $method->get_total(),
			);
		}

		$notes_out = array();
		if ( function_exists( 'wc_get_order_notes' ) ) {
			$all_notes = wc_get_order_notes(
				array(
					'order_id' => $o->get_id(),
					'orderby'  => 'date_created',
					'order'    => 'DESC',
				)
			);
			foreach ( $all_notes as $note ) {
				$notes_out[] = array(
					'id'            => (int) $note->id,
					'content'       => $note->content,
					'date'          => $note->date_created ? $note->date_created->format( 'c' ) : null,
					'customer_note' => (bool) $note->customer_note,
					'added_by'      => $note->added_by,
				);
			}
		}

		$dc = $o->get_date_created();
		$dm = $o->get_date_modified();
		$customer_id = (int) $o->get_customer_id();

		$digipay = array(
			'transaction_id' => self::get_meta_first( $o, array( '_digipay_transaction_id', 'digipay_transaction_id', '_transaction_id' ) ),
			'type'           => self::get_meta_first( $o, array( '_digipay_type', 'digipay_type' ) ),
			'tracking_code'  => self::get_meta_first( $o, array( '_digipay_tracking_code', 'digipay_tracking_code' ) ),
			'provider_id'    => self::get_meta_first( $o, array( '_digipay_provider_id', 'digipay_provider_id' ) ),
			'gateway'        => self::get_meta_first( $o, array( '_digipay_payment_gateway', 'digipay_payment_gateway' ) ),
			'delivered'      => self::get_meta_first( $o, array( '_digipay_delivered', 'digipay_delivered' ) ),
		);

		$billing_parts  = self::format_address_parts( $o, 'billing' );
		$shipping_parts = self::format_address_parts( $o, 'shipping' );

		return array(
			'id'                   => $o->get_id(),
			'number'               => $o->get_order_number(),
			'status'               => $o->get_status(),
			'status_label'         => wc_get_order_status_name( $o->get_status() ),
			'total'                => $o->get_total(),
			'subtotal'             => $o->get_subtotal(),
			'total_discount'       => $o->get_discount_total(),
			'shipping_total'       => $o->get_shipping_total(),
			'currency'             => $o->get_currency(),
			'payment_method'       => $o->get_payment_method(),
			'payment_method_title' => $o->get_payment_method_title(),
			'customer_note'        => $o->get_customer_note(),
			'customer_id'          => $customer_id,
			'is_guest'             => $customer_id <= 0,
			'customer_ip'          => (string) $o->get_customer_ip_address(),
			'is_editable'          => $o->is_editable(),
			'billing'              => array_merge(
				array(
					'first_name' => $o->get_billing_first_name(),
					'last_name'  => $o->get_billing_last_name(),
					'company'    => $o->get_billing_company(),
					'email'      => $o->get_billing_email(),
					'phone'      => $o->get_billing_phone(),
					'address_1'  => $o->get_billing_address_1(),
					'address_2'  => $o->get_billing_address_2(),
					'city'       => $o->get_billing_city(),
					'state'      => $o->get_billing_state(),
					'postcode'   => $o->get_billing_postcode(),
					'country'    => $o->get_billing_country(),
				),
				array(
					'state_label' => $billing_parts['state_label'],
					'name'        => $billing_parts['name'],
				)
			),
			'shipping'             => array_merge(
				array(
					'first_name' => $o->get_shipping_first_name(),
					'last_name'  => $o->get_shipping_last_name(),
					'company'    => $o->get_shipping_company(),
					'address_1'  => $o->get_shipping_address_1(),
					'address_2'  => $o->get_shipping_address_2(),
					'city'       => $o->get_shipping_city(),
					'state'      => $o->get_shipping_state(),
					'postcode'   => $o->get_shipping_postcode(),
					'country'    => $o->get_shipping_country(),
					'phone'      => $o->get_billing_phone(),
				),
				array(
					'state_label' => $shipping_parts['state_label'],
					'name'        => $shipping_parts['name'],
				)
			),
			'billing_formatted'    => self::address_parts_for_rest( $billing_parts ),
			'shipping_formatted'   => self::address_parts_for_rest( $shipping_parts ),
			'shipping_method'      => self::get_shipping_method_title( $o ),
			'shipping_items'       => $shipping_items,
			'tracking_code'        => self::get_tracking_code( $o ),
			'tracking_url'         => self::get_tracking_url( $o ),
			'tracking_provider'    => self::get_meta_first( $o, array( '_tracking_provider', 'tracking_provider' ) ) ?: '',
			'delivery_date'        => self::get_meta_first( $o, array( '_delivery_date', 'delivery_date', '_pws_delivery_date' ) ),
			'delivery_time'        => self::get_meta_first( $o, array( '_delivery_time', 'delivery_time', '_pws_delivery_time' ) ),
			'national_id'          => self::get_meta_first( $o, array( '_billing_national_id', '_national_code', 'billing_national_id', 'national_id' ) ),
			'checkout_phone'       => self::get_meta_first( $o, array( '_billing_phone_extra', 'checkout_phone', '_checkout_phone' ) ),
			'payment_gateway_meta' => $digipay,
			'attribution'          => self::get_attribution( $o ),
			'notes'                => $notes_out,
			'customer_history'     => self::get_customer_history( $customer_id ),
			'date_created'         => $dc ? $dc->format( 'c' ) : null,
			'date_modified'        => $dm ? $dm->format( 'c' ) : null,
			'items'                => $items_out,
		);
	}

	/**
	 *
	 * @param WP_REST_Request $request Request.
	 * @return array<string, mixed>
	 */
	public static function query_args_from_request( $request ) {
		$page     = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$search   = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$status   = sanitize_key( (string) $request->get_param( 'status' ) );
		$orderby  = sanitize_key( (string) $request->get_param( 'orderby' ) ) ?: 'date';
		$order    = strtoupper( sanitize_key( (string) $request->get_param( 'order' ) ) ) === 'ASC' ? 'ASC' : 'DESC';
		$after    = sanitize_text_field( (string) $request->get_param( 'after' ) );
		$before   = sanitize_text_field( (string) $request->get_param( 'before' ) );

		$wc_orderby = 'date';
		if ( 'id' === $orderby ) {
			$wc_orderby = 'ID';
		} elseif ( 'total' === $orderby ) {
			$wc_orderby = 'total';
		}

		$args = array(
			'limit'    => $per_page,
			'page'     => $page,
			'orderby'  => $wc_orderby,
			'order'    => $order,
			'return'   => 'objects',
			'paginate' => true,
		);

		if ( '' !== $status && 'all' !== $status ) {
			$args['status'] = $status;
		}

		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		if ( '' !== $after || '' !== $before ) {
			$args['date_created'] = self::build_date_query( $after, $before );
		}

		return $args;
	}

	/**
	 * @param string $after After ISO date.
	 * @param string $before Before ISO date.
	 * @return string
	 */
	private static function build_date_query( $after, $before ) {
		$after_ts  = $after ? strtotime( $after ) : false;
		$before_ts = $before ? strtotime( $before ) : false;
		if ( $after_ts && $before_ts ) {
			return gmdate( 'Y-m-d', $after_ts ) . '...' . gmdate( 'Y-m-d', $before_ts );
		}
		if ( $after_ts ) {
			return gmdate( 'Y-m-d', $after_ts ) . '...';
		}
		if ( $before_ts ) {
			return '...' . gmdate( 'Y-m-d', $before_ts );
		}
		return '';
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_action( $request ) {
		if ( ! self::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$action = sanitize_key( (string) $request->get_param( 'action' ) );
		$ids    = $request->get_param( 'ids' );
		if ( ! is_array( $ids ) || array() === $ids ) {
			return new WP_Error( 'invalid', __( 'No orders selected.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$ids = array_map( 'intval', $ids );
		$results = array( 'ok' => 0, 'failed' => 0 );

		foreach ( $ids as $id ) {
			$o = wc_get_order( $id );
			if ( ! $o ) {
				++$results['failed'];
				continue;
			}
			$ok = false;
			switch ( $action ) {
				case 'change_status':
					$st = sanitize_key( (string) $request->get_param( 'status' ) );
					if ( $st ) {
						$result = $o->update_status( $st );
						if ( is_wp_error( $result ) ) {
							++$results['failed'];
							continue 2;
						}
						$ok = true;
					}
					break;
				case 'trash':
					$ok = wp_trash_post( $id ) !== false;
					break;
				case 'untrash':
					$ok = wp_untrash_post( $id ) !== false;
					break;
				case 'delete':
					$ok = wp_delete_post( $id, true ) !== false;
					break;
				case 'send_email':
					$email_type = sanitize_key( (string) $request->get_param( 'email_type' ) );
					$ok         = self::send_order_email( $o, $email_type );
					break;
				default:
					break;
			}
			if ( $ok ) {
				++$results['ok'];
			} else {
				++$results['failed'];
			}
		}
		return new WP_REST_Response( $results );
	}

	/**
	 * @param WC_Order $o Order.
	 * @param string   $email_type Email type slug.
	 * @return bool
	 */
	private static function send_order_email( $o, $email_type ) {
		if ( ! function_exists( 'WC' ) || ! WC()->mailer() ) {
			return false;
		}
		$map = array(
			'customer_invoice'           => 'WC_Email_Customer_Invoice',
			'customer_completed_order'     => 'WC_Email_Customer_Completed_Order',
			'customer_processing_order'    => 'WC_Email_Customer_Processing_Order',
			'customer_on_hold_order'       => 'WC_Email_Customer_On_Hold_Order',
			'customer_refunded_order'      => 'WC_Email_Customer_Refunded_Order',
			'customer_note'              => 'WC_Email_Customer_Note',
		);
		if ( ! isset( $map[ $email_type ] ) || ! class_exists( $map[ $email_type ] ) ) {
			return false;
		}
		$mailer = WC()->mailer();
		$emails = $mailer->get_emails();
		foreach ( $emails as $email ) {
			if ( $email instanceof $map[ $email_type ] ) {
				$email->trigger( $o->get_id(), $o );
				return true;
			}
		}
		$instance = new $map[ $email_type ]();
		if ( method_exists( $instance, 'trigger' ) ) {
			$instance->trigger( $o->get_id(), $o );
			return true;
		}
		return false;
	}
}
