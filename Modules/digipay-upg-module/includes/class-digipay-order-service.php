<?php
/**
 * DigiPay order mappers and utilities.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digipay_Order_Service {

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	public static function ensure_provider_id( WC_Order $order ) {
		$provider_id = (string) $order->get_meta( '_digipay_provider_id' );
		if ( '' !== $provider_id ) {
			return $provider_id;
		}
		$provider_id = (string) $order->get_id() . '_' . (string) time();
		$order->update_meta_data( '_digipay_provider_id', $provider_id );
		$order->save();
		return $provider_id;
	}

	/**
	 * @param float $amount Amount in store currency.
	 * @return int
	 */
	public static function amount_in_rial_value( $amount ) {
		$currency = strtoupper( (string) get_woocommerce_currency() );
		if ( in_array( $currency, array( 'IRT', 'TOMAN' ), true ) ) {
			$amount *= 10;
		}
		return (int) round( $amount );
	}

	/**
	 * @param WC_Order $order Order.
	 * @return int
	 */
	public static function amount_in_rial( WC_Order $order ) {
		if ( class_exists( 'Webino_Payment_Money', false ) ) {
			return Webino_Payment_Money::order_total_rial( $order );
		}
		return self::amount_in_rial_value( (float) $order->get_total() );
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,mixed>
	 */
	public static function build_basket_from_order( WC_Order $order ) {
		$settings = Digipay_OAuth::settings();
		$items    = array();
		foreach ( $order->get_items() as $item ) {
			$product = $item->get_product();
			$items[] = array(
				'sellerId'    => (string) $settings['seller_id'],
				'supplierId'  => (string) $settings['supplier_id'],
				'productCode' => $product ? (string) $product->get_sku() : (string) $item->get_product_id(),
				'brand'       => $product ? (string) $product->get_attribute( 'brand' ) : '',
				'productType' => (int) $settings['product_type'],
				'count'       => max( 1, (int) $item->get_quantity() ),
				'categoryId'  => (string) $settings['category_id'],
				'price'       => class_exists( 'Webino_Payment_Money', false )
					? Webino_Payment_Money::to_rial( (float) $item->get_total(), $order->get_currency() )
					: self::amount_in_rial_value( (float) $item->get_total() ),
			);
		}
		return array(
			'basketId' => 'wc_' . $order->get_id(),
			'items'    => $items,
		);
	}

	/**
	 * @param WC_Order $order Order.
	 * @param string   $gateway_key One of bpg,cpg,wallet,ipg.
	 * @return array<string,mixed>
	 */
	public static function build_ticket_payload( WC_Order $order, $gateway_key ) {
		$payload = array(
			'cellNumber'  => (string) $order->get_billing_phone(),
			'amount'      => self::amount_in_rial( $order ),
			'providerId'  => self::ensure_provider_id( $order ),
			'callbackUrl' => Digipay_Callback_Handler::callback_url(),
		);

		if ( in_array( $gateway_key, array( 'bpg', 'cpg' ), true ) ) {
			$payload['basketDetailsDto'] = self::build_basket_from_order( $order );
		} elseif ( 'wallet' === $gateway_key ) {
			$payload['additionalInfo'] = array( 'preferredGateway' => 0 );
		} elseif ( 'ipg' === $gateway_key ) {
			$payload['additionalInfo'] = array( 'preferredGateway' => 2 );
		}
		return $payload;
	}

	/**
	 * @param string $gateway_key Gateway key.
	 * @param int    $callback_type Callback type.
	 * @return int
	 */
	public static function resolve_verify_type( $gateway_key, $callback_type ) {
		$callback_type = (int) $callback_type;
		if ( $callback_type >= 0 ) {
			return $callback_type;
		}
		if ( 'wallet' === $gateway_key ) {
			return 11;
		}
		if ( 'ipg' === $gateway_key ) {
			return 0;
		}
		if ( 'cpg' === $gateway_key ) {
			return 4;
		}
		return 5;
	}
}
