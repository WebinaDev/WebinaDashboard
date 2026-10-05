<?php

namespace Webino_Dashboard_Bots_Bale\Woo;

use Webino_Dashboard_Bots_Bale\Util\OrderPayload;

/**
 * Create WC orders from cart; payment URLs and invoice params.
 */
class CheckoutService {

	/**
	 * Create pending order from current user's cart (must be called inside UserCartContext::run_as_user).
	 */
	public function create_order_from_cart( int $user_id ): ?\WC_Order {
		if ( ! function_exists( 'wc_create_order' ) ) {
			return null;
		}

		$cart = \WC()->cart;
		if ( $cart->is_empty() ) {
			return null;
		}

		try {
			self::sync_chosen_shipping_session_from_user_meta( $user_id );

			$order = wc_create_order( array( 'customer_id' => $user_id ) );

			$customer = \WC()->customer;
			$order->set_billing_first_name( (string) get_user_meta( $user_id, 'billing_first_name', true ) );
			$order->set_billing_last_name( (string) get_user_meta( $user_id, 'billing_last_name', true ) );
			$order->set_billing_country( (string) get_user_meta( $user_id, 'billing_country', true ) );
			$order->set_billing_address_1( (string) get_user_meta( $user_id, 'billing_address_1', true ) );
			$order->set_billing_address_2( (string) get_user_meta( $user_id, 'billing_address_2', true ) );
			$order->set_billing_city( (string) get_user_meta( $user_id, 'billing_city', true ) );
			$order->set_billing_state( (string) get_user_meta( $user_id, 'billing_state', true ) );
			$order->set_billing_postcode( (string) get_user_meta( $user_id, 'billing_postcode', true ) );
			$order->set_billing_phone( (string) get_user_meta( $user_id, 'billing_phone', true ) );
			$user_obj = get_userdata( $user_id );
			if ( $user_obj && isset( $user_obj->user_email ) ) {
				$order->set_billing_email( (string) $user_obj->user_email );
			}
			$order->set_shipping_first_name( (string) get_user_meta( $user_id, 'shipping_first_name', true ) );
			$order->set_shipping_last_name( (string) get_user_meta( $user_id, 'shipping_last_name', true ) );
			$order->set_shipping_country( (string) get_user_meta( $user_id, 'shipping_country', true ) );
			$order->set_shipping_address_1( (string) get_user_meta( $user_id, 'shipping_address_1', true ) );
			$order->set_shipping_address_2( (string) get_user_meta( $user_id, 'shipping_address_2', true ) );
			$order->set_shipping_city( (string) get_user_meta( $user_id, 'shipping_city', true ) );
			$order->set_shipping_state( (string) get_user_meta( $user_id, 'shipping_state', true ) );
			$order->set_shipping_postcode( (string) get_user_meta( $user_id, 'shipping_postcode', true ) );

			if ( $customer ) {
				if ( $order->get_billing_country() === '' ) {
					$order->set_billing_country( $customer->get_billing_country() );
				}
				if ( $order->get_shipping_country() === '' ) {
					$order->set_shipping_country( $customer->get_shipping_country() );
				}
			}

			foreach ( $cart->get_cart() as $cart_item ) {
				$args = array();
				if ( ! empty( $cart_item['variation'] ) && is_array( $cart_item['variation'] ) ) {
					$args['variation'] = $cart_item['variation'];
				}
				$item_id = $order->add_product( $cart_item['data'], $cart_item['quantity'], $args );
				if ( ! $item_id ) {
					continue;
				}
				$item = $order->get_item( $item_id );
				if ( ! $item ) {
					continue;
				}
				if ( ! empty( $cart_item['wfcp_purchase_type'] ) ) {
					$ptype = sanitize_key( (string) $cart_item['wfcp_purchase_type'] );
					$item->add_meta_data( 'wfcp_purchase_type', $ptype, true );
					if ( ! empty( $cart_item['wfcp_installment_months'] ) ) {
						$item->add_meta_data( 'wfcp_installment_months', (int) $cart_item['wfcp_installment_months'], true );
					}
				}
				if ( isset( $cart_item['line_total'] ) ) {
					$item->set_total( (float) $cart_item['line_total'] );
				}
				if ( isset( $cart_item['line_subtotal'] ) ) {
					$item->set_subtotal( (float) $cart_item['line_subtotal'] );
				}
				$item->save();
			}

			foreach ( $cart->get_fees() as $fee ) {
				if ( empty( $fee->name ) ) {
					continue;
				}
				$item = new \WC_Order_Item_Fee();
				$item->set_name( $fee->name );
				$item->set_amount( $fee->amount );
				$item->set_total( $fee->amount );
				if ( isset( $fee->taxable ) && $fee->taxable ) {
					$item->set_tax_status( 'taxable' );
				} else {
					$item->set_tax_status( 'none' );
				}
				$order->add_item( $item );
			}

			if ( method_exists( $order, 'apply_coupon' ) ) {
				foreach ( $cart->get_applied_coupons() as $coupon_code ) {
					$order->apply_coupon( wc_format_coupon_code( $coupon_code ) );
				}
			}

			if ( is_callable( array( $cart, 'calculate_shipping' ) ) ) {
				$cart->calculate_shipping();
			}
			self::add_shipping_lines_from_cart( $order );

			$order->set_payment_method( 'bacs' );
			$order->set_payment_method_title( __( 'پرداخت از طریق بله / سایت', 'webino-dashboard' ) );
			$order->update_meta_data( '_woobale_source', '1' );
			$order->update_meta_data( '_woobale_provider', 'bale' );
			$purchase_type = 'cash';
			if ( class_exists( 'Webino_Dashboard_Bots_WFCP', false ) ) {
				foreach ( $cart->get_cart() as $ci ) {
					if ( ! empty( $ci['wfcp_purchase_type'] ) ) {
						$purchase_type = Webino_Dashboard_Bots_WFCP::cart_type( (string) $ci['wfcp_purchase_type'] );
						break;
					}
				}
				$order->update_meta_data( '_wfcp_purchase_type', $purchase_type );
				$allowed = Webino_Dashboard_Bots_WFCP::allowed_gateway_ids( $purchase_type );
				if ( is_array( $allowed ) && ! empty( $allowed ) ) {
					$order->set_payment_method( (string) $allowed[0] );
					if ( function_exists( 'WC' ) && \WC()->payment_gateways() ) {
						$all = \WC()->payment_gateways()->payment_gateways();
						$gid = (string) $allowed[0];
						if ( isset( $all[ $gid ] ) && is_object( $all[ $gid ] ) && method_exists( $all[ $gid ], 'get_title' ) ) {
							$order->set_payment_method_title( (string) $all[ $gid ]->get_title() );
						}
					}
				}
			}
			$order->calculate_totals();
			$order->update_status( 'pending' );
			$order->add_order_note( __( 'سفارش از طریق بازوی بله ایجاد شد.', 'webino-dashboard' ) );
			if ( $user_id > 0 ) {
				delete_user_meta( $user_id, '_woobale_chosen_shipping_methods' );
				delete_user_meta( $user_id, '_woobale_shipping_pick_snapshot' );
			}
			$cart->empty_cart();
			return $order;
		} catch ( \Exception $e ) {
			$message = '[checkout_create_order_exception] ' . wp_json_encode(
				array(
					'user_id' => $user_id,
					'message' => $e->getMessage(),
				)
			);
			if ( function_exists( 'wc_get_logger' ) ) {
				wc_get_logger()->error( $message, array( 'source' => 'webino_dashboard_bale' ) );
			} else {
				error_log( 'woobale ' . $message );
			}
			return null;
		}
	}

	/**
	 * Restore WC session chosen methods before calculate_shipping() (that call may depend on them).
	 */
	private static function sync_chosen_shipping_session_from_user_meta( int $user_id ): void {
		if ( $user_id < 1 || ! \WC()->session ) {
			return;
		}
		$stored = get_user_meta( $user_id, '_woobale_chosen_shipping_methods', true );
		if ( ! is_string( $stored ) || $stored === '' ) {
			return;
		}
		$decoded = json_decode( $stored, true );
		if ( ! is_array( $decoded ) || empty( array_filter( $decoded ) ) ) {
			return;
		}
		\WC()->session->set( 'chosen_shipping_methods', $decoded );
		if ( method_exists( \WC()->session, 'save_data' ) ) {
			\WC()->session->save_data();
		}
	}

	/**
	 * If rate ids from checkout no longer match package keys (e.g. PWS), use label+cost saved at selection time.
	 */
	private static function add_shipping_line_from_user_snapshot( \WC_Order $order, int $user_id ): void {
		if ( $user_id < 1 ) {
			return;
		}
		$raw = get_user_meta( $user_id, '_woobale_shipping_pick_snapshot', true );
		if ( ! is_string( $raw ) || $raw === '' ) {
			return;
		}
		$data = json_decode( $raw, true );
		if ( ! is_array( $data ) ) {
			return;
		}
		$label   = isset( $data['label'] ) ? (string) $data['label'] : '';
		$cost    = isset( $data['cost'] ) ? (float) $data['cost'] : 0.0;
		$rate_id = isset( $data['rate_id'] ) ? (string) $data['rate_id'] : '';
		if ( $label === '' && $rate_id === '' ) {
			return;
		}
		$item = new \WC_Order_Item_Shipping();
		$item->set_method_title( $label !== '' ? $label : $rate_id );
		$mid = 'other';
		if ( $rate_id !== '' && strpos( $rate_id, ':' ) !== false ) {
			$parsed = strstr( $rate_id, ':', true );
			$mid    = ( is_string( $parsed ) && $parsed !== '' ) ? $parsed : 'other';
		}
		$item->set_method_id( $mid );
		$item->set_total( wc_format_decimal( $cost, wc_get_price_decimals() ) );
		$order->add_item( $item );
	}

	/**
	 * Copy chosen shipping methods from session cart to the order.
	 */
	private static function add_shipping_lines_from_cart( \WC_Order $order ): void {
		if ( ! \WC()->cart || ! \WC()->cart->needs_shipping() ) {
			return;
		}
		$uid = (int) $order->get_user_id();
		$chosen = \WC()->session ? \WC()->session->get( 'chosen_shipping_methods', array() ) : array();
		if ( ! is_array( $chosen ) ) {
			$chosen = array();
		}
		if ( $uid > 0 && empty( array_filter( $chosen ) ) ) {
			$stored = get_user_meta( $uid, '_woobale_chosen_shipping_methods', true );
			if ( is_string( $stored ) && $stored !== '' ) {
				$decoded = json_decode( $stored, true );
				if ( is_array( $decoded ) && ! empty( array_filter( $decoded ) ) ) {
					$chosen = $decoded;
					if ( \WC()->session ) {
						\WC()->session->set( 'chosen_shipping_methods', $chosen );
					}
				}
			}
		}
		$packages = \WC()->cart->get_shipping_packages();
		if ( \WC()->shipping() ) {
			$alt = \WC()->shipping()->get_packages();
			if ( is_array( $alt ) && ! empty( $alt ) && ( empty( $packages ) || self::packages_have_no_rates( $packages ) ) ) {
				$packages = $alt;
			}
		}
		$added = 0;
		foreach ( $packages as $i => $package ) {
			if ( empty( $chosen[ $i ] ) || empty( $package['rates'] ) || ! is_array( $package['rates'] ) ) {
				continue;
			}
			$chosen_id = (string) $chosen[ $i ];
			$rate      = null;
			if ( isset( $package['rates'][ $chosen_id ] ) && $package['rates'][ $chosen_id ] instanceof \WC_Shipping_Rate ) {
				$rate = $package['rates'][ $chosen_id ];
			} else {
				foreach ( $package['rates'] as $candidate ) {
					if ( ! $candidate instanceof \WC_Shipping_Rate ) {
						continue;
					}
					if ( (string) $candidate->get_id() === $chosen_id || (string) $candidate->get_method_id() === $chosen_id ) {
						$rate = $candidate;
						break;
					}
				}
			}
			if ( ! $rate instanceof \WC_Shipping_Rate ) {
				continue;
			}
			$item = new \WC_Order_Item_Shipping();
			if ( is_callable( array( $item, 'set_shipping_rate' ) ) ) {
				$item->set_shipping_rate( $rate );
			} else {
				$item->set_method_title( $rate->get_label() );
				$item->set_method_id( $rate->get_method_id() ? $rate->get_method_id() : $rate->get_id() );
				$item->set_total( wc_format_decimal( $rate->get_cost(), wc_get_price_decimals() ) );
			}
			$order->add_item( $item );
			++$added;
		}
		if ( $added < 1 && $uid > 0 ) {
			self::add_shipping_line_from_user_snapshot( $order, $uid );
		}
	}

	/**
	 * @param array<int, array<string, mixed>> $packages
	 */
	private static function packages_have_no_rates( array $packages ): bool {
		foreach ( $packages as $pkg ) {
			if ( is_array( $pkg ) && ! empty( $pkg['rates'] ) && is_array( $pkg['rates'] ) ) {
				return false;
			}
		}
		return true;
	}

	public function get_order_pay_url( \WC_Order $order ): string {
		return $order->get_checkout_payment_url( true );
	}

	/**
	 * @return list<array{id:string,title:string,url:string}>
	 */
	public function get_available_gateway_buttons( \WC_Order $order ): array {
		$out = array();
		if ( ! function_exists( 'WC' ) || ! \WC()->payment_gateways() ) {
			return $out;
		}
		$available = \WC()->payment_gateways()->get_available_payment_gateways();
		if ( ! is_array( $available ) || empty( $available ) ) {
			return $out;
		}

		$allowed_ids = null;
		if ( class_exists( 'Webino_Dashboard_Bots_WFCP', false ) ) {
			$purchase_type = Webino_Dashboard_Bots_WFCP::detect_order_type( $order );
			$allowed_ids   = Webino_Dashboard_Bots_WFCP::allowed_gateway_ids( $purchase_type );
		} elseif ( class_exists( 'WFCP_Helper' ) ) {
			$purchase_type = self::detect_wfcp_purchase_type( $order );
			$section_map   = array(
				'cash'        => 'retail',
				'credit'      => 'credit',
				'installment' => 'installment',
				'wholesale'   => 'wholesale',
			);
			$section = isset( $section_map[ $purchase_type ] ) ? $section_map[ $purchase_type ] : 'retail';
			$gw_list = \WFCP_Helper::get_settings( $section, 'gateways' );
			if ( is_array( $gw_list ) && ! empty( $gw_list ) ) {
				$allowed_ids = $gw_list;
			}
		}

		$base_url = $order->get_checkout_payment_url( true );
		foreach ( $available as $gw_id => $gateway ) {
			$gid = (string) $gw_id;
			if ( null !== $allowed_ids ) {
				$ok = in_array( $gid, $allowed_ids, true );
				if ( ! $ok && class_exists( 'WFCP_Gateway_Manager', false ) && method_exists( 'WFCP_Gateway_Manager', 'expand_gateway_aliases' ) ) {
					$expanded = WFCP_Gateway_Manager::expand_gateway_aliases( $allowed_ids );
					$ok       = in_array( $gid, array_map( 'strval', (array) $expanded ), true );
				}
				if ( ! $ok ) {
					continue;
				}
			}
			$url   = add_query_arg( 'wc_gateway', $gw_id, $base_url );
			$title = is_callable( array( $gateway, 'get_title' ) ) ? $gateway->get_title() : (string) $gw_id;
			$out[] = array(
				'id'    => (string) $gw_id,
				'title' => $title,
				'url'   => $url,
			);
		}
		return $out;
	}

	/**
	 * @return string 'cash'|'credit'|'installment'
	 */
	private static function detect_wfcp_purchase_type( \WC_Order $order ): string {
		foreach ( $order->get_items() as $item ) {
			$meta = $item->get_meta( 'wfcp_purchase_type' );
			if ( is_string( $meta ) && $meta !== '' ) {
				return $meta;
			}
		}
		return 'cash';
	}

	public static function get_wfcp_purchase_type_label( \WC_Order $order ): string {
		if ( class_exists( 'Webino_Dashboard_Bots_WFCP', false ) ) {
			$type = Webino_Dashboard_Bots_WFCP::detect_order_type( $order );
			if ( 'cash' === $type ) {
				return '';
			}
			return Webino_Dashboard_Bots_WFCP::type_label( $type );
		}
		if ( ! class_exists( 'WFCP_Helper' ) ) {
			return '';
		}
		$type   = self::detect_wfcp_purchase_type( $order );
		$labels = array(
			'cash'        => '',
			'credit'      => __( 'اعتباری', 'webino-dashboard' ),
			'installment' => __( 'اقساطی', 'webino-dashboard' ),
			'wholesale'   => __( 'عمده', 'webino-dashboard' ),
		);
		return isset( $labels[ $type ] ) ? (string) $labels[ $type ] : '';
	}

	/**
	 * Amount for Bale invoice (integer, smallest currency unit).
	 */
	public function get_invoice_amount( \WC_Order $order ): int {
		$decimals   = (int) wc_get_price_decimals();
		$mult       = (int) pow( 10, $decimals );
		$rial_mult  = \Webino_Dashboard_Bots_Bale\Core\Plugin::get_invoice_amount_rial_multiplier();
		$total  = (float) $order->get_total() * $rial_mult;
		$amount = (int) max( 1, round( $total * $mult ) );
		return $amount;
	}

	/**
	 * @return array<string, mixed>
	 */
	public function build_send_invoice_params( int $chat_id, \WC_Order $order ): array {
		$provider = \Webino_Dashboard_Bots_Bale\Core\Plugin::get_provider_token();
		$payload  = OrderPayload::sign( $order->get_id() );
		$title    = sprintf( __( 'سفارش #%s', 'webino-dashboard' ), $order->get_order_number() );
		$desc     = __( 'پرداخت از طریق بله', 'webino-dashboard' );
		$amount   = $this->get_invoice_amount( $order );

		// Bale docs (docs.bale.ai): title 1–32, description 1–255, payload 1–128 bytes,
		// provider_token + prices (amount in IRR). Extra Telegram-only fields are omitted.
		$title = self::mb_clip( $title, 32 );
		$desc  = self::mb_clip( $desc, 255 );
		if ( strlen( $payload ) > 128 ) {
			$payload = substr( $payload, 0, 128 );
		}

		return array(
			'chat_id'        => (int) $chat_id,
			'title'          => $title,
			'description'    => $desc,
			'payload'        => $payload,
			'provider_token' => $provider,
			'prices'         => array(
				array(
					'label'  => $title,
					'amount' => $amount,
				),
			),
		);
	}

	/**
	 * Clip a UTF-8 string to at most $max characters (Bale invoice limits).
	 */
	private static function mb_clip( string $text, int $max ): string {
		$text = trim( $text );
		if ( $text === '' ) {
			return $text;
		}
		if ( function_exists( 'mb_substr' ) ) {
			return (string) mb_substr( $text, 0, $max );
		}
		return substr( $text, 0, $max );
	}
}
