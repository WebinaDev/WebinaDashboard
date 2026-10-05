<?php
/**
 * ZarinPal payment / verify / refund / inquiry service.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Business logic around PG v4 and GraphQL refunds.
 */
final class Zarinpal_Gateway_Service {

	/**
	 * Convert store amount to Rial integer for ZarinPal.
	 *
	 * @param float       $amount   Amount in shop currency.
	 * @param string|null $currency Currency code.
	 * @return int
	 */
	public static function amount_to_rial( $amount, $currency = null ) {
		$currency = strtoupper( (string) ( $currency ?: ( function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRT' ) ) );
		$amount   = (float) $amount;
		switch ( $currency ) {
			case 'IRT':
			case 'TOMAN':
				return (int) round( $amount * 10 );
			case 'IRHR':
				return (int) round( $amount * 1000 );
			case 'IRHT':
				return (int) round( $amount * 10000 );
			case 'IRR':
			default:
				return (int) round( $amount );
		}
	}

	/**
	 * Convert Rial back to shop currency units.
	 *
	 * @param float       $rial     Amount in Rial.
	 * @param string|null $currency Currency code.
	 * @return float
	 */
	public static function amount_from_rial( $rial, $currency = null ) {
		$currency = strtoupper( (string) ( $currency ?: ( function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'IRT' ) ) );
		$rial     = (float) $rial;
		switch ( $currency ) {
			case 'IRT':
			case 'TOMAN':
				return $rial / 10;
			case 'IRHR':
				return $rial / 1000;
			case 'IRHT':
				return $rial / 10000;
			case 'IRR':
			default:
				return $rial;
		}
	}

	/**
	 * Amount to send/verify for an order (honours customer fee suggested_amount).
	 *
	 * @param WC_Order $order Order.
	 * @return int Rial.
	 */
	public static function order_payment_rial( WC_Order $order ) {
		$s        = Zarinpal_Config::get();
		$currency = $order->get_currency();
		$order_rial = self::amount_to_rial( (float) $order->get_total(), $currency );

		if ( 'customer' !== (string) $s['fee_payer'] ) {
			return $order_rial;
		}

		$fee_data = $order->get_meta( '_zarinpal_fee_data' );
		if ( ! is_array( $fee_data ) ) {
			return $order_rial;
		}

		$suggested = isset( $fee_data['suggested_amount'] ) ? (int) $fee_data['suggested_amount'] : 0;
		$fee_type  = (string) ( $fee_data['fee_type'] ?? '' );
		$ts        = isset( $fee_data['timestamp'] ) ? (int) $fee_data['timestamp'] : 0;
		$stored_ot = isset( $fee_data['order_total'] ) ? (int) $fee_data['order_total'] : 0;

		if (
			$suggested > 0
			&& 'Merchant' === $fee_type
			&& ( time() - $ts ) < HOUR_IN_SECONDS
			&& ( 0 === $stored_ot || $stored_ot === $order_rial || abs( $stored_ot - $order_rial ) < 2 )
		) {
			return $suggested;
		}

		return $order_rial;
	}

	/**
	 * Start payment; returns authority + redirect URL.
	 *
	 * @param WC_Order $order Order.
	 * @return array<string,string>|WP_Error
	 */
	public static function request_payment( WC_Order $order ) {
		$s = Zarinpal_Config::get();
		if ( '' === (string) $s['merchant_id'] ) {
			return new WP_Error( 'zarinpal_no_merchant', __( 'Zarinpal merchant ID is not configured.', 'webino-dashboard' ) );
		}

		$amount = self::order_payment_rial( $order );
		if ( $amount < 1000 ) {
			return new WP_Error( 'zarinpal_amount_low', __( 'Order amount is below Zarinpal minimum.', 'webino-dashboard' ) );
		}

		// Refresh fee meta when customer pays fee.
		if ( 'customer' === (string) $s['fee_payer'] ) {
			self::refresh_order_fee_meta( $order );
			$amount = self::order_payment_rial( $order );
		}

		$callback = (string) $s['callback_url'];
		if ( '' === $callback ) {
			$callback = Zarinpal_Config::default_callback_url();
		}
		$callback = add_query_arg( 'order_id', (int) $order->get_id(), $callback );

		$desc_tpl = (string) ( $s['payment_description'] ?? '' );
		if ( '' === $desc_tpl ) {
			$desc_tpl = (string) Zarinpal_Config::defaults()['payment_description'];
		}
		$description = str_replace(
			array( '{order_id}', '{order_number}' ),
			array( (string) $order->get_order_number(), (string) $order->get_order_number() ),
			$desc_tpl
		);

		$payload = array(
			'merchant_id'  => (string) $s['merchant_id'],
			'amount'       => $amount,
			'description'  => $description,
			'callback_url' => $callback,
			'metadata'     => array(
				'mobile' => (string) $order->get_billing_phone(),
				'email'  => (string) $order->get_billing_email(),
			),
		);

		$res = Zarinpal_Client::payment( 'request.json', $payload, array( 100 ) );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$authority = (string) ( $res['data']['authority'] ?? '' );
		if ( '' === $authority ) {
			return new WP_Error( 'zarinpal_authority_missing', __( 'Missing Zarinpal authority.', 'webino-dashboard' ) );
		}

		$order->update_meta_data( '_zarinpal_authority', $authority );
		$history = $order->get_meta( '_zarinpal_authority_history' );
		if ( ! is_array( $history ) ) {
			$history = array();
		}
		$history[] = $authority;
		$order->update_meta_data( '_zarinpal_authority_history', array_values( array_unique( $history ) ) );
		$order->update_meta_data( '_zarinpal_amount_rial', $amount );
		$order->add_order_note(
			sprintf(
				/* translators: %s: authority */
				__( 'Customer redirected to Zarinpal. Authority: %s', 'webino-dashboard' ),
				$authority
			)
		);
		$order->save();

		return array(
			'authority'    => $authority,
			'redirect_url' => Zarinpal_Config::start_pay_base( ! empty( $s['sandbox'] ) ) . $authority,
		);
	}

	/**
	 * Verify payment after callback (codes 100 / 101).
	 *
	 * @param WC_Order $order     Order.
	 * @param string   $authority Authority from callback.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function verify_payment( WC_Order $order, $authority ) {
		$s         = Zarinpal_Config::get();
		$authority = sanitize_text_field( (string) $authority );
		$amount    = (int) $order->get_meta( '_zarinpal_amount_rial' );
		if ( $amount <= 0 ) {
			$amount = self::order_payment_rial( $order );
		}

		$payload = array(
			'merchant_id' => (string) $s['merchant_id'],
			'amount'      => $amount,
			'authority'   => $authority,
		);

		$res = Zarinpal_Client::payment( 'verify.json', $payload, array( 100, 101 ) );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$data   = is_array( $res['data'] ?? null ) ? $res['data'] : array();
		$ref_id = (string) ( $data['ref_id'] ?? '' );
		$card   = (string) ( $data['card_pan'] ?? '' );

		if ( ! $order->is_paid() ) {
			$order->payment_complete( $ref_id );
		}

		$order->update_meta_data( '_zarinpal_ref_id', $ref_id );
		if ( '' !== $card ) {
			$order->update_meta_data( '_zarinpal_card_pan', $card );
		}
		$order->add_order_note(
			sprintf(
				/* translators: %s: ref id */
				__( 'Zarinpal payment verified. Ref ID: %s', 'webino-dashboard' ),
				$ref_id
			)
		);
		$order->save();

		return $data;
	}

	/**
	 * GraphQL refund via AddRefund (requires access_token).
	 *
	 * @param WC_Order $order  Order.
	 * @param float    $amount Amount in shop currency.
	 * @param string   $reason Reason.
	 * @return true|WP_Error
	 */
	public static function refund( WC_Order $order, $amount, $reason = '' ) {
		if ( '' === Zarinpal_Config::bearer_token() ) {
			return new WP_Error(
				'zarinpal_no_access_token',
				__( 'Zarinpal access token is required for refunds. Add it in Connection settings.', 'webino-dashboard' )
			);
		}

		$authority = (string) $order->get_meta( '_zarinpal_authority' );
		if ( '' === $authority ) {
			return new WP_Error( 'zarinpal_authority_missing', __( 'No Zarinpal authority on this order.', 'webino-dashboard' ) );
		}

		$session = self::session_by_authority( $authority );
		if ( is_wp_error( $session ) ) {
			return $session;
		}
		if ( empty( $session['id'] ) ) {
			return new WP_Error( 'zarinpal_session_missing', __( 'Zarinpal session not found for refund.', 'webino-dashboard' ) );
		}

		$rial = self::amount_to_rial( (float) $amount, $order->get_currency() );
		$query = array(
			'query'     => 'mutation AddRefund($session_id: ID!, $amount: BigInteger!, $description: String, $method: InstantPayoutActionTypeEnum, $reason: RefundReasonEnum) {
				resource: AddRefund(
					session_id: $session_id,
					amount: $amount,
					description: $description,
					method: $method,
					reason: $reason
				) {
					terminal_id
					id
					amount
					timeline { refund_amount refund_time refund_status }
				}
			}',
			'variables' => array(
				'session_id'  => (string) $session['id'],
				'amount'      => $rial,
				'description' => (string) $reason,
				'method'      => 'PAYA',
				'reason'      => 'CUSTOMER_REQUEST',
			),
		);

		$res = Zarinpal_Client::graphql( $query );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		if ( empty( $res['data']['resource'] ) ) {
			return new WP_Error( 'zarinpal_refund_failed', __( 'Zarinpal refund failed.', 'webino-dashboard' ) );
		}

		$order->add_order_note(
			sprintf(
				/* translators: %s: refunded amount */
				__( 'Zarinpal refund processed: %s', 'webino-dashboard' ),
				function_exists( 'wc_price' ) ? wp_strip_all_tags( wc_price( (float) $amount ) ) : (string) $amount
			)
		);
		$order->save();

		return true;
	}

	/**
	 * Inquiry via REST.
	 *
	 * @param string $authority Authority.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function inquiry( $authority ) {
		$s = Zarinpal_Config::get();
		return Zarinpal_Client::payment(
			'inquiry.json',
			array(
				'merchant_id' => (string) $s['merchant_id'],
				'authority'   => sanitize_text_field( (string) $authority ),
			),
			array( 100 )
		);
	}

	/**
	 * List unverified authorities.
	 *
	 * @return array<int,mixed>|WP_Error
	 */
	public static function unverified() {
		$s   = Zarinpal_Config::get();
		$res = Zarinpal_Client::payment(
			'unVerified.json',
			array( 'merchant_id' => (string) $s['merchant_id'] ),
			array( 100 )
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$authorities = $res['data']['authorities'] ?? array();
		return is_array( $authorities ) ? $authorities : array();
	}

	/**
	 * Reverse unpaid authority.
	 *
	 * @param string $authority Authority.
	 * @return true|WP_Error
	 */
	public static function reverse( $authority ) {
		$s   = Zarinpal_Config::get();
		$res = Zarinpal_Client::payment(
			'reverse.json',
			array(
				'merchant_id' => (string) $s['merchant_id'],
				'authority'   => sanitize_text_field( (string) $authority ),
			),
			array( 100 )
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return true;
	}

	/**
	 * Fee calculation (amount in Rial).
	 *
	 * @param int    $amount_rial Amount Rial.
	 * @param string $currency    API currency (IRR).
	 * @return array<string,mixed>|WP_Error
	 */
	public static function fee_calculation( $amount_rial, $currency = 'IRR' ) {
		$s   = Zarinpal_Config::get();
		$res = Zarinpal_Client::payment(
			'feeCalculation.json',
			array(
				'merchant_id' => (string) $s['merchant_id'],
				'amount'      => (int) $amount_rial,
				'currency'    => $currency,
			),
			array( 100 )
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return is_array( $res['data'] ?? null ) ? $res['data'] : array();
	}

	/**
	 * Lightweight connection test via feeCalculation.
	 *
	 * @return true|WP_Error
	 */
	public static function test_connection() {
		$s = Zarinpal_Config::get();
		if ( '' === (string) $s['merchant_id'] ) {
			return new WP_Error( 'zarinpal_no_merchant', __( 'Zarinpal merchant ID is not configured.', 'webino-dashboard' ) );
		}
		$res = self::fee_calculation( 10000, 'IRR' );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return true;
	}

	/**
	 * Lookup transaction: GraphQL Session if token present, else inquiry.json.
	 *
	 * @param string $authority Authority.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function lookup( $authority ) {
		$authority = sanitize_text_field( (string) $authority );
		if ( '' === $authority ) {
			return new WP_Error( 'zarinpal_authority_missing', __( 'Authority is required.', 'webino-dashboard' ) );
		}

		if ( '' !== Zarinpal_Config::bearer_token() ) {
			$session = self::session_by_authority( $authority );
			if ( ! is_wp_error( $session ) && ! empty( $session ) ) {
				return array(
					'source'  => 'graphql',
					'session' => $session,
				);
			}
		}

		$inquiry = self::inquiry( $authority );
		if ( is_wp_error( $inquiry ) ) {
			return $inquiry;
		}
		return array(
			'source'  => 'inquiry',
			'inquiry' => $inquiry['data'] ?? $inquiry,
		);
	}

	/**
	 * GraphQL Session by authority (passed as id).
	 *
	 * @param string $authority Authority / session id.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function session_by_authority( $authority ) {
		$query = array(
			'query'     => 'query Sessions($id: ID, $limit: Int, $offset: Int) {
				Session(id: $id, limit: $limit, offset: $offset) {
					id
					authority
					amount
					fee
					status
					description
					created_at
					reference_id
					reconciled_at
					session_tries { card_pan rrn payer_ip }
				}
			}',
			'variables' => array(
				'id'     => sanitize_text_field( (string) $authority ),
				'limit'  => 1,
				'offset' => 0,
			),
		);

		$res = Zarinpal_Client::graphql( $query );
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$sessions = $res['data']['Session'] ?? array();
		if ( ! is_array( $sessions ) || empty( $sessions ) ) {
			return new WP_Error( 'zarinpal_session_missing', __( 'Zarinpal session not found.', 'webino-dashboard' ) );
		}

		return is_array( $sessions[0] ) ? $sessions[0] : array();
	}

	/**
	 * Store fee meta on order from feeCalculation.
	 *
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function refresh_order_fee_meta( WC_Order $order ) {
		$base = (float) $order->get_total();
		foreach ( $order->get_fees() as $fee ) {
			$name = $fee->get_name();
			if ( false !== strpos( $name, 'کارمزد' ) || false !== stripos( $name, 'zarinpal' ) || false !== stripos( $name, 'gateway fee' ) ) {
				$base -= (float) $fee->get_total();
			}
		}

		$base_rial = self::amount_to_rial( $base, $order->get_currency() );
		$fee_data  = self::fee_calculation( $base_rial, 'IRR' );
		if ( is_wp_error( $fee_data ) ) {
			return;
		}
		if ( empty( $fee_data['suggested_amount'] ) || 'Merchant' !== (string) ( $fee_data['fee_type'] ?? '' ) ) {
			return;
		}

		$order_rial = self::amount_to_rial( (float) $order->get_total(), $order->get_currency() );
		$order->update_meta_data(
			'_zarinpal_fee_data',
			array(
				'base_amount'      => $base_rial,
				'order_total'      => $order_rial,
				'fee'              => $fee_data['fee'] ?? 0,
				'suggested_amount' => (int) $fee_data['suggested_amount'],
				'fee_type'         => (string) $fee_data['fee_type'],
				'timestamp'        => time(),
			)
		);
		$order->save();
	}
}
