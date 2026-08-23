<?php
/**
 * Per-platform order normalizers.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Normalize marketplace order payloads into a common shape for WC import.
 */
class WNC_Order_Normalizer {

	/**
	 * Normalize raw remote order/detail into common structure.
	 *
	 * @param string              $platform Platform slug.
	 * @param array<string,mixed> $raw Raw payload.
	 * @return array{id:string,status:string,items:array,customer:array,raw:array}
	 */
	public static function normalize( $platform, array $raw ) {
		$platform = sanitize_key( $platform );
		switch ( $platform ) {
			case 'digikala':
				return self::digikala( $raw );
			case 'basalam':
				return self::basalam( $raw );
			case 'snappshop':
				return self::snappshop( $raw );
			case 'technolife':
				return self::technolife( $raw );
			case 'tapsishop':
				return self::tapsishop( $raw );
			case 'zarehbin':
			case 'emalls':
			case 'snapppay-search':
			case 'torob':
				return self::generic( $raw );
			default:
				return self::generic( $raw );
		}
	}

	/**
	 * Digikala order-item oriented payload.
	 *
	 * @param array $raw Raw.
	 * @return array
	 */
	private static function digikala( array $raw ) {
		$id = (string) ( $raw['id'] ?? $raw['order_item_id'] ?? $raw['order_id'] ?? '' );
		$variant_id = (string) ( $raw['variant_id'] ?? $raw['product_variant_id'] ?? $raw['variant']['id'] ?? '' );
		$product_id = (string) ( $raw['product_id'] ?? $raw['product']['id'] ?? '' );
		$title = (string) ( $raw['product_title'] ?? $raw['title'] ?? $raw['product']['title'] ?? '' );
		$qty = max( 1, (int) ( $raw['quantity'] ?? $raw['qty'] ?? 1 ) );
		$price = (float) ( $raw['selling_price'] ?? $raw['price'] ?? $raw['unit_price'] ?? 0 );
		if ( $price > 0 ) {
			$price = WNC_Pricing::from_remote_unit( $price, 'digikala' );
		}

		$customer = array();
		if ( ! empty( $raw['customer'] ) && is_array( $raw['customer'] ) ) {
			$customer = $raw['customer'];
		} elseif ( ! empty( $raw['buyer'] ) && is_array( $raw['buyer'] ) ) {
			$customer = $raw['buyer'];
		}

		$items = array();
		if ( ! empty( $raw['items'] ) && is_array( $raw['items'] ) ) {
			foreach ( $raw['items'] as $line ) {
				if ( ! is_array( $line ) ) {
					continue;
				}
				$lp = (float) ( $line['selling_price'] ?? $line['price'] ?? 0 );
				$items[] = array(
					'product_id' => (string) ( $line['product_id'] ?? '' ),
					'variant_id' => (string) ( $line['variant_id'] ?? $line['id'] ?? '' ),
					'title'      => (string) ( $line['product_title'] ?? $line['title'] ?? '' ),
					'quantity'   => max( 1, (int) ( $line['quantity'] ?? 1 ) ),
					'price'      => $lp > 0 ? WNC_Pricing::from_remote_unit( $lp, 'digikala' ) : 0,
				);
			}
		} else {
			$items[] = array(
				'product_id' => $product_id,
				'variant_id' => $variant_id,
				'title'      => $title,
				'quantity'   => $qty,
				'price'      => $price,
			);
		}

		return array(
			'id'       => $id,
			'status'   => (string) ( $raw['status'] ?? $raw['order_status'] ?? '' ),
			'items'    => $items,
			'customer' => self::customer_from( $customer, $raw ),
			'raw'      => $raw,
		);
	}

	/**
	 * Basalam parcel / order payload.
	 *
	 * @param array $raw Raw.
	 * @return array
	 */
	private static function basalam( array $raw ) {
		$id = (string) ( $raw['id'] ?? $raw['parcel_id'] ?? $raw['order_id'] ?? '' );
		$items = array();
		$lines = array();
		if ( ! empty( $raw['items'] ) && is_array( $raw['items'] ) ) {
			$lines = $raw['items'];
		} elseif ( ! empty( $raw['order_items'] ) && is_array( $raw['order_items'] ) ) {
			$lines = $raw['order_items'];
		} elseif ( ! empty( $raw['products'] ) && is_array( $raw['products'] ) ) {
			$lines = $raw['products'];
		}
		foreach ( $lines as $line ) {
			if ( ! is_array( $line ) ) {
				continue;
			}
			$variant_id = '';
			if ( ! empty( $line['variation']['id'] ) ) {
				$variant_id = (string) $line['variation']['id'];
			} elseif ( ! empty( $line['variation_id'] ) ) {
				$variant_id = (string) $line['variation_id'];
			} elseif ( ! empty( $line['variant_id'] ) ) {
				$variant_id = (string) $line['variant_id'];
			} elseif ( ! empty( $line['id'] ) ) {
				$variant_id = (string) $line['id'];
			}
			$items[] = array(
				'product_id' => (string) ( $line['product_id'] ?? $line['product']['id'] ?? '' ),
				'variant_id' => $variant_id,
				'title'      => (string) ( $line['title'] ?? $line['product']['title'] ?? $line['name'] ?? '' ),
				'quantity'   => max( 1, (int) ( $line['quantity'] ?? $line['qty'] ?? 1 ) ),
				'price'      => (float) ( $line['price'] ?? $line['primary_price'] ?? $line['paid_price'] ?? 0 ),
			);
		}

		$customer = array();
		$order    = ( isset( $raw['order'] ) && is_array( $raw['order'] ) ) ? $raw['order'] : array();
		if ( ! empty( $order['customer']['recipient'] ) && is_array( $order['customer']['recipient'] ) ) {
			$customer = $order['customer']['recipient'];
		} elseif ( ! empty( $order['customer']['user'] ) && is_array( $order['customer']['user'] ) ) {
			$customer = $order['customer']['user'];
		} elseif ( ! empty( $order['customer'] ) && is_array( $order['customer'] ) ) {
			$customer = $order['customer'];
		} elseif ( ! empty( $raw['customer'] ) && is_array( $raw['customer'] ) ) {
			$customer = $raw['customer'];
		} elseif ( ! empty( $raw['user'] ) && is_array( $raw['user'] ) ) {
			$customer = $raw['user'];
		}

		$status = $raw['status'] ?? $raw['parcel_status'] ?? '';
		if ( is_array( $status ) ) {
			$status = (string) ( $status['title'] ?? $status['id'] ?? '' );
		} else {
			$status = (string) $status;
		}

		return array(
			'id'       => $id,
			'status'   => $status,
			'items'    => $items,
			'customer' => self::customer_from( $customer, $raw ),
			'raw'      => $raw,
		);
	}

	/**
	 * SnappShop order payload.
	 *
	 * @param array $raw Raw.
	 * @return array
	 */
	private static function snappshop( array $raw ) {
		$id = (string) ( $raw['id'] ?? $raw['order_id'] ?? $raw['code'] ?? '' );
		$items = array();
		$lines = (array) ( $raw['items'] ?? $raw['products'] ?? $raw['order_items'] ?? array() );
		foreach ( $lines as $line ) {
			if ( ! is_array( $line ) ) {
				continue;
			}
			$items[] = array(
				'product_id' => (string) ( $line['product_id'] ?? $line['id'] ?? '' ),
				'variant_id' => (string) ( $line['variant_id'] ?? $line['sku'] ?? '' ),
				'title'      => (string) ( $line['title'] ?? $line['name'] ?? '' ),
				'quantity'   => max( 1, (int) ( $line['quantity'] ?? $line['qty'] ?? 1 ) ),
				'price'      => (float) ( $line['price'] ?? $line['selling_price'] ?? 0 ),
			);
		}
		$customer = (array) ( $raw['customer'] ?? $raw['buyer'] ?? array() );
		return array(
			'id'       => $id,
			'status'   => (string) ( $raw['status'] ?? '' ),
			'items'    => $items,
			'customer' => self::customer_from( $customer, $raw ),
			'raw'      => $raw,
		);
	}

	/**
	 * Technolife order payload.
	 *
	 * @param array $raw Raw.
	 * @return array
	 */
	private static function technolife( array $raw ) {
		return self::generic( $raw );
	}

	/**
	 * TapsiShop order payload.
	 *
	 * @param array $raw Raw.
	 * @return array
	 */
	private static function tapsishop( array $raw ) {
		$id = (string) ( $raw['id'] ?? $raw['orderId'] ?? $raw['code'] ?? '' );
		$items = array();
		$lines = (array) ( $raw['items'] ?? $raw['orderItems'] ?? $raw['products'] ?? array() );
		foreach ( $lines as $line ) {
			if ( ! is_array( $line ) ) {
				continue;
			}
			$items[] = array(
				'product_id' => (string) ( $line['productId'] ?? $line['sourceSimpleProductId'] ?? $line['id'] ?? '' ),
				'variant_id' => (string) ( $line['clientProductId'] ?? $line['variantId'] ?? '' ),
				'title'      => (string) ( $line['title'] ?? $line['name'] ?? '' ),
				'quantity'   => max( 1, (int) ( $line['quantity'] ?? $line['onHandQty'] ?? $line['qty'] ?? 1 ) ),
				'price'      => (float) ( $line['finalPrice'] ?? $line['price'] ?? $line['originalPrice'] ?? 0 ),
			);
		}
		$customer = (array) ( $raw['customer'] ?? $raw['user'] ?? array() );
		return array(
			'id'       => $id,
			'status'   => (string) ( $raw['status'] ?? $raw['orderStatus'] ?? '' ),
			'items'    => $items,
			'customer' => self::customer_from( $customer, $raw ),
			'raw'      => $raw,
		);
	}

	/**
	 * Generic fallback.
	 *
	 * @param array $raw Raw.
	 * @return array
	 */
	private static function generic( array $raw ) {
		$id = (string) ( $raw['id'] ?? $raw['order_id'] ?? '' );
		$items = array();
		$lines = (array) ( $raw['items'] ?? $raw['order_items'] ?? $raw['variants'] ?? array() );
		foreach ( $lines as $line ) {
			if ( ! is_array( $line ) ) {
				continue;
			}
			$items[] = array(
				'product_id' => (string) ( $line['product_id'] ?? '' ),
				'variant_id' => (string) ( $line['variant_id'] ?? $line['id'] ?? '' ),
				'title'      => (string) ( $line['title'] ?? $line['name'] ?? '' ),
				'quantity'   => max( 1, (int) ( $line['quantity'] ?? $line['qty'] ?? 1 ) ),
				'price'      => (float) ( $line['price'] ?? $line['selling_price'] ?? 0 ),
			);
		}
		$customer = (array) ( $raw['customer'] ?? array() );
		return array(
			'id'       => $id,
			'status'   => (string) ( $raw['status'] ?? '' ),
			'items'    => $items,
			'customer' => self::customer_from( $customer, $raw ),
			'raw'      => $raw,
		);
	}

	/**
	 * Build customer + address fields from nested marketplace payloads.
	 *
	 * @param array $customer Customer node.
	 * @param array $raw Full raw order.
	 * @return array<string,string>
	 */
	private static function customer_from( array $customer, array $raw ) {
		$address = array();
		foreach ( array( 'shipping_address', 'shippingAddress', 'address', 'delivery_address', 'recipient' ) as $key ) {
			if ( ! empty( $raw[ $key ] ) && is_array( $raw[ $key ] ) ) {
				$address = $raw[ $key ];
				break;
			}
			if ( ! empty( $customer[ $key ] ) && is_array( $customer[ $key ] ) ) {
				$address = $customer[ $key ];
				break;
			}
		}
		$src = array_merge( $customer, $address );
		$name = (string) ( $src['name'] ?? $src['full_name'] ?? $src['fullName'] ?? trim( ( $src['first_name'] ?? $src['firstName'] ?? '' ) . ' ' . ( $src['last_name'] ?? $src['lastName'] ?? '' ) ) );
		return array(
			'name'       => $name,
			'first_name' => (string) ( $src['first_name'] ?? $src['firstName'] ?? $name ),
			'last_name'  => (string) ( $src['last_name'] ?? $src['lastName'] ?? '' ),
			'phone'      => (string) ( $src['phone'] ?? $src['mobile'] ?? $src['cellphone'] ?? '' ),
			'email'      => (string) ( $src['email'] ?? '' ),
			'address'    => (string) ( $src['address'] ?? $src['address_1'] ?? $src['address1'] ?? $src['street'] ?? '' ),
			'address_1'  => (string) ( $src['address_1'] ?? $src['address1'] ?? $src['address'] ?? $src['street'] ?? '' ),
			'address_2'  => (string) ( $src['address_2'] ?? $src['address2'] ?? '' ),
			'city'       => (string) ( $src['city'] ?? $src['city_name'] ?? '' ),
			'state'      => (string) ( $src['state'] ?? $src['province'] ?? $src['state_name'] ?? '' ),
			'postcode'   => (string) ( $src['postcode'] ?? $src['postal_code'] ?? $src['zip'] ?? '' ),
			'country'    => (string) ( $src['country'] ?? 'IR' ),
		);
	}
}
