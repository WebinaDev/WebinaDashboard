<?php
/**
 * Normalize a Basalam vendor invoice for the order screen.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Webino_Basalam_Order_View {

	/**
	 * @param int $order_id Woo order id.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest( $order_id ) {
		$order_id = absint( $order_id );
		$order    = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : null;
		if ( ! $order ) {
			return new WP_Error( 'basalam_order', __( 'سفارش پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$invoice = (string) $order->get_meta( '_basalam_invoice_id' );
		if ( '' === $invoice ) {
			return new WP_Error( 'basalam_order', __( 'این سفارش شناسه باسلام ندارد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( ! class_exists( '\WebinoBasalam\Services\Orders\OrderManager' ) ) {
			return new WP_Error( 'basalam_order', 'Engine not loaded', array( 'status' => 503 ) );
		}

		$cached = self::read_cache( $order );
		if ( is_array( $cached ) ) {
			$cached['woo_status'] = $order->get_status();
			return new WP_REST_Response( $cached );
		}

		$data = \WebinoBasalam\Services\Orders\OrderManager::fetchInvoice( $invoice );
		if ( ! is_array( $data ) ) {
			return new WP_REST_Response( self::from_order( $order, $invoice ) );
		}

		\WebinoBasalam\Services\Orders\OrderManager::applyRemoteState( $order, $data );
		$order = wc_get_order( $order_id );
		$fresh = self::read_cache( $order );
		if ( is_array( $fresh ) ) {
			return new WP_REST_Response( $fresh );
		}
		return new WP_REST_Response( self::present( $order, $data, $invoice ) );
	}

	/**
	 * Persist the normalized view. Skips thin status-only payloads so a full snapshot is kept.
	 *
	 * @param WC_Order            $order Order.
	 * @param array<string,mixed> $data Invoice.
	 */
	public static function remember( $order, array $data ) {
		if ( empty( $data['items'] ) && empty( $data['financial_report'] ) && empty( $data['customer_data'] ) ) {
			return;
		}
		$invoice = (string) ( $data['id'] ?? $order->get_meta( '_basalam_invoice_id' ) );
		$view    = self::present( $order, $data, $invoice );
		$order->update_meta_data( '_basalam_order_snapshot', wp_json_encode( $view ) );
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,mixed>|null
	 */
	private static function read_cache( $order ) {
		$raw = $order->get_meta( '_basalam_order_snapshot' );
		if ( ! is_string( $raw ) || '' === $raw ) {
			return null;
		}
		$decoded = json_decode( $raw, true );
		return is_array( $decoded ) ? $decoded : null;
	}

	/**
	 * @param WC_Order            $order Order.
	 * @param array<string,mixed> $data Invoice.
	 * @param string              $invoice Invoice id.
	 * @return array<string,mixed>
	 */
	private static function present( $order, array $data, $invoice ) {
		$status = isset( $data['status'] ) && is_array( $data['status'] ) ? $data['status'] : array();
		$customer = isset( $data['customer_data'] ) && is_array( $data['customer_data'] ) ? $data['customer_data'] : array();
		$recipient = isset( $customer['recipient'] ) && is_array( $customer['recipient'] ) ? $customer['recipient'] : array();
		$city = isset( $customer['city'] ) && is_array( $customer['city'] ) ? $customer['city'] : array();
		$province = isset( $city['parent'] ) && is_array( $city['parent'] ) ? (string) ( $city['parent']['title'] ?? '' ) : '';

		$items = array();
		foreach ( (array) ( $data['items'] ?? array() ) as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$qty = max( 1, (int) ( $item['quantity'] ?? 1 ) );
			$product = isset( $item['product'] ) && is_array( $item['product'] ) ? $item['product'] : array();
			$items[] = array(
				'title'    => (string) ( $product['title'] ?? $item['title'] ?? '' ),
				'quantity' => $qty,
				'id'       => (string) ( $product['id'] ?? $item['id'] ?? '' ),
				'amount'   => self::money( \WebinoBasalam\Services\Orders\OrderManager::resolveLineTotalRial( $item, $qty ) ),
			);
		}

		$finance = self::finance( isset( $data['financial_report'] ) && is_array( $data['financial_report'] ) ? $data['financial_report'] : array() );

		$tracking = \WebinoBasalam\Services\Orders\OrderManager::pickString(
			$data,
			array(
				'parcel_detail.tracking_code',
				'parcel_detail.post_tracking_code',
				'shipping.tracking_code',
				'tracking_code',
			)
		);
		if ( '' === $tracking ) {
			$tracking = (string) $order->get_meta( '_tracking_code' );
		}

		$coupon = '';
		if ( isset( $data['coupon'] ) && is_array( $data['coupon'] ) ) {
			$coupon = (string) ( $data['coupon']['code'] ?? $data['coupon']['title'] ?? '' );
		} elseif ( isset( $data['coupon'] ) && is_scalar( $data['coupon'] ) ) {
			$coupon = (string) $data['coupon'];
		} elseif ( isset( $data['coupons'] ) && is_array( $data['coupons'] ) && isset( $data['coupons'][0] ) ) {
			$first = $data['coupons'][0];
			$coupon = is_array( $first ) ? (string) ( $first['code'] ?? $first['title'] ?? '' ) : (string) $first;
		}

		return array(
			'order_id'          => $order->get_id(),
			'woo_status'        => $order->get_status(),
			'invoice_id'        => (string) $invoice,
			'code'              => (string) ( $data['id'] ?? $invoice ),
			'hash_id'           => (string) ( $data['hash_id'] ?? $order->get_meta( '_sync_basalam_hash_id' ) ),
			'status_id'         => (int) ( $status['id'] ?? 0 ),
			'status_title'      => (string) ( $status['title'] ?? $status['name'] ?? '' ),
			'notice'            => self::notice( $data, $status ),
			'created_at'        => self::iso( $data['created_at'] ?? $data['paid_at'] ?? null ),
			'confirmed_at'      => self::iso( self::deep( $data, array( 'parcel_detail.confirmed_at', 'confirmed_at', 'preparation_at' ) ) ),
			'shipped_at'        => self::iso( self::deep( $data, array( 'parcel_detail.posted_at', 'parcel_detail.shipped_at', 'posted_at' ) ) ),
			'delivery_estimate' => self::estimate( $data ),
			'shipping_method'   => \WebinoBasalam\Services\Orders\OrderManager::pickString(
				$data,
				array( 'parcel_detail.shipping_method.title', 'shipping_method.title', 'shipping_method' )
			),
			'tracking_code'     => $tracking,
			'coupon'            => $coupon,
			'purchase_count'    => (int) ( $customer['purchase_count'] ?? $customer['orders_count'] ?? 0 ),
			'recipient'         => array(
				'name'     => (string) ( $recipient['name'] ?? '' ),
				'phone'    => (string) ( $recipient['mobile'] ?? $recipient['phone'] ?? '' ),
				'province' => $province,
				'city'     => (string) ( $city['title'] ?? '' ),
				'address'  => (string) ( $recipient['postal_address'] ?? $recipient['address'] ?? '' ),
				'postcode' => (string) ( $recipient['postal_code'] ?? '' ),
			),
			'items'             => $items,
			'finance'           => $finance,
			'currency'          => $order->get_currency(),
		);
	}

	/**
	 * One card per Basalam finance group. Duplicate API keys are collapsed.
	 *
	 * @param array<string,mixed> $report Report.
	 * @return array<int,array<string,mixed>>
	 */
	private static function finance( array $report ) {
		$groups = array(
			array(
				'key'   => 'products',
				'title' => 'هزینه محصولات',
				'keys'  => array( 'product_cost', 'product_submit' ),
			),
			array(
				'key'   => 'shipping',
				'title' => 'هزینه ارسال',
				'keys'  => array( 'shipping_cost', 'shipping_submit' ),
			),
			array(
				'key'     => 'balance',
				'title'   => 'مبالغ اضافه‌شده به تراز',
				'keys'    => array( 'product_balance', 'shipping_balance' ),
				'pending' => true,
			),
		);
		$out = array();
		foreach ( $groups as $group ) {
			$rows  = array();
			$total = null;
			foreach ( $group['keys'] as $key ) {
				$block = isset( $report[ $key ] ) && is_array( $report[ $key ] ) ? $report[ $key ] : null;
				if ( ! $block ) {
					continue;
				}
				$block_rows = self::finance_rows( $block, ! empty( $group['pending'] ) );
				if ( $block_rows && ! $rows ) {
					$rows = $block_rows;
				} elseif ( ! empty( $group['pending'] ) ) {
					$rows = array_merge( $rows, $block_rows );
				}
				if ( null === $total ) {
					$total = self::block_total( $block );
				}
			}
			if ( ! $rows && null === $total ) {
				continue;
			}
			$out[] = array(
				'key'   => $group['key'],
				'title' => $group['title'],
				'total' => ! empty( $group['pending'] ) ? null : self::money( $total ),
				'rows'  => $rows,
			);
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $block Block.
	 * @param bool                $pending Balance rows keep a settlement state.
	 * @return array<int,array<string,mixed>>
	 */
	private static function finance_rows( array $block, $pending ) {
		$rows = array();
		foreach ( (array) ( $block['report_items'] ?? array() ) as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$state = '';
			if ( isset( $row['status'] ) && is_array( $row['status'] ) ) {
				$state = (string) ( $row['status']['title'] ?? $row['status']['description'] ?? '' );
			} elseif ( isset( $row['status'] ) && is_scalar( $row['status'] ) ) {
				$state = (string) $row['status'];
			}
			if ( '' === $state && $pending ) {
				$state = 'در انتظار تعیین وضعیت';
			}
			$rows[] = array(
				'title'  => (string) ( $row['title'] ?? '' ),
				'amount' => self::money( $row['amount'] ?? null ),
				'state'  => $state,
			);
		}
		if ( ! $rows && $pending ) {
			$title = (string) ( $block['title'] ?? '' );
			if ( '' !== $title ) {
				$rows[] = array(
					'title'  => $title,
					'amount' => self::money( self::block_total( $block ) ),
					'state'  => 'در انتظار تعیین وضعیت',
				);
			}
		}
		return $rows;
	}

	/**
	 * @param array<string,mixed> $block Block.
	 * @return mixed
	 */
	private static function block_total( array $block ) {
		if ( isset( $block['total'] ) && is_array( $block['total'] ) ) {
			return $block['total']['amount'] ?? null;
		}
		if ( isset( $block['total'] ) && is_numeric( $block['total'] ) ) {
			return $block['total'];
		}
		return null;
	}

	/**
	 * Offline fallback from the Woo order when Basalam cannot be reached and nothing is cached.
	 *
	 * @param WC_Order $order Order.
	 * @param string   $invoice Invoice id.
	 * @return array<string,mixed>
	 */
	private static function from_order( $order, $invoice ) {
		$items = array();
		foreach ( $order->get_items() as $item ) {
			$items[] = array(
				'title'    => $item->get_name(),
				'quantity' => (int) $item->get_quantity(),
				'id'       => '',
				'amount'   => (float) $item->get_total(),
			);
		}
		return array(
			'order_id'       => $order->get_id(),
			'woo_status'     => $order->get_status(),
			'invoice_id'     => (string) $invoice,
			'code'           => (string) $invoice,
			'hash_id'        => (string) $order->get_meta( '_sync_basalam_hash_id' ),
			'status_title'   => (string) $order->get_meta( '_basalam_status_slug' ),
			'tracking_code'  => (string) $order->get_meta( '_tracking_code' ),
			'shipping_method'=> $order->get_shipping_method(),
			'recipient'      => array(
				'name'    => trim( $order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name() ),
				'phone'   => (string) ( $order->get_shipping_phone() ?: $order->get_billing_phone() ),
				'address' => (string) $order->get_shipping_address_1(),
				'postcode'=> (string) $order->get_shipping_postcode(),
			),
			'items'          => $items,
			'finance'        => array(),
			'currency'       => $order->get_currency(),
			'cached'         => false,
		);
	}

	/**
	 * @param array<string,mixed> $data Invoice.
	 * @param array<string,mixed> $status Status object.
	 */
	private static function notice( array $data, array $status ) {
		$title = (string) ( $status['title'] ?? $status['name'] ?? '' );
		$text  = \WebinoBasalam\Services\Orders\OrderManager::pickString(
			$data,
			array(
				'status.description',
				'status.message',
				'status.hint',
				'parcel_detail.status_description',
				'parcel_detail.description',
				'parcel_detail.message',
				'notice',
				'description',
			)
		);
		if ( $text === $title ) {
			return '';
		}
		return $text;
	}

	/**
	 * @param array<string,mixed> $data Invoice.
	 */
	private static function estimate( array $data ) {
		$from = self::deep( $data, array( 'parcel_detail.estimated_delivery_from', 'estimated_delivery_from', 'delivery_from' ) );
		$to   = self::deep( $data, array( 'parcel_detail.estimated_delivery_to', 'estimated_delivery_to', 'delivery_to' ) );
		$text = \WebinoBasalam\Services\Orders\OrderManager::pickString(
			$data,
			array( 'parcel_detail.estimated_delivery', 'estimated_delivery', 'delivery_estimate' )
		);
		return array(
			'from' => self::iso( $from ),
			'to'   => self::iso( $to ),
			'text' => $text,
		);
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @param array<int,string>   $paths Paths.
	 * @return mixed
	 */
	private static function deep( array $data, array $paths ) {
		foreach ( $paths as $path ) {
			$cur = $data;
			foreach ( explode( '.', $path ) as $key ) {
				if ( ! is_array( $cur ) || ! array_key_exists( $key, $cur ) ) {
					$cur = null;
					break;
				}
				$cur = $cur[ $key ];
			}
			if ( null !== $cur && '' !== $cur ) {
				return $cur;
			}
		}
		return null;
	}

	/**
	 * @param mixed $value Time.
	 */
	private static function iso( $value ) {
		$ts = \WebinoBasalam\Services\Orders\OrderManager::parseBasalamTime( $value );
		return $ts ? gmdate( 'c', $ts ) : null;
	}

	/**
	 * @param mixed $rial Rial amount.
	 * @return float|null
	 */
	private static function money( $rial ) {
		if ( ! is_numeric( $rial ) ) {
			return null;
		}
		if ( class_exists( 'Webino_Dashboard_Currency' ) ) {
			return (float) Webino_Dashboard_Currency::from_rial( (float) $rial );
		}
		return ( (float) $rial ) / 10;
	}
}
