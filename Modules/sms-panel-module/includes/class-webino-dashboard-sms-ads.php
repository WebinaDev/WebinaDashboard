<?php
/**
 * SMS ads campaigns (store-local marketing blasts).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Campaign CRUD, schedule, send, and attribution stats.
 */
final class Webino_Dashboard_Sms_Ads {

	const OPTION     = 'webino_sms_ads_campaigns';
	const CRON_HOOK  = 'webino_dashboard_sms_ads_run';
	const BATCH_SIZE = 80;

	/**
	 * @return void
	 */
	public static function init() {
		add_action( self::CRON_HOOK, array( __CLASS__, 'cron_run' ), 10, 1 );
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function all() {
		$rows = get_option( self::OPTION, array() );
		return is_array( $rows ) ? array_values( $rows ) : array();
	}

	/**
	 * @param array<int,array<string,mixed>> $rows Rows.
	 * @return void
	 */
	private static function save_all( array $rows ) {
		update_option( self::OPTION, array_values( $rows ), false );
	}

	/**
	 * @param string $id Campaign id.
	 * @return array<string,mixed>|null
	 */
	public static function get( $id ) {
		$id = sanitize_key( (string) $id );
		foreach ( self::all() as $row ) {
			if ( (string) ( $row['id'] ?? '' ) === $id ) {
				return $row;
			}
		}
		return null;
	}

	/**
	 * @param array<string,mixed> $patch Patch.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function create( array $patch ) {
		$name = mb_substr( sanitize_text_field( (string) ( $patch['name'] ?? '' ) ), 0, 16 );
		if ( '' === $name ) {
			return new WP_Error( 'invalid_name', __( 'Campaign name is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$segment = sanitize_key( (string) ( $patch['segment'] ?? '' ) );
		if ( ! isset( Webino_Dashboard_Sms_Ads_Segments::segment_keys()[ $segment ] ) ) {
			return new WP_Error( 'invalid_segment', __( 'Invalid target segment.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$channel = sanitize_key( (string) ( $patch['channel'] ?? 'sms' ) );
		if ( ! in_array( $channel, array( 'sms', 'notification' ), true ) ) {
			$channel = 'sms';
		}
		$message = sanitize_textarea_field( (string) ( $patch['message'] ?? '' ) );
		if ( '' === trim( $message ) ) {
			return new WP_Error( 'invalid_message', __( 'Message is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$scheduled_at = 0;
		if ( ! empty( $patch['scheduled_at'] ) && is_numeric( $patch['scheduled_at'] ) ) {
			$scheduled_at = absint( $patch['scheduled_at'] );
		} elseif ( ! empty( $patch['schedule'] ) ) {
			$parsed = strtotime( (string) $patch['schedule'] );
			$scheduled_at = $parsed ? (int) $parsed : 0;
		}
		$tomorrow = strtotime( 'tomorrow', current_time( 'timestamp' ) );
		if ( $scheduled_at < $tomorrow ) {
			$scheduled_at = (int) $tomorrow + HOUR_IN_SECONDS;
		}

		$preview = Webino_Dashboard_Sms_Ads_Segments::resolve(
			$segment,
			array( 'include_phones' => true, 'limit' => Webino_Dashboard_Sms_Ads_Segments::CAP )
		);
		$phones = isset( $preview['phones'] ) && is_array( $preview['phones'] ) ? $preview['phones'] : array();
		if ( empty( $phones ) ) {
			return new WP_Error( 'no_recipients', __( 'No recipients in this segment.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$id  = 'smsad_' . wp_generate_password( 10, false, false );
		$utm = 'smsad_' . $id;
		$row = array(
			'id'              => $id,
			'name'            => $name,
			'segment'         => $segment,
			'channel'         => $channel,
			'message'         => $message,
			'product_id'      => absint( $patch['product_id'] ?? 0 ),
			'category_id'     => absint( $patch['category_id'] ?? 0 ),
			'content_type'    => sanitize_key( (string) ( $patch['content_type'] ?? 'product' ) ),
			'coupon_code'     => sanitize_text_field( (string) ( $patch['coupon_code'] ?? '' ) ),
			'scheduled_at'    => $scheduled_at,
			'status'          => 'scheduled',
			'recipient_count' => count( $phones ),
			'phones'          => $phones,
			'sent'            => 0,
			'failed'          => 0,
			'cost'            => (float) ( $patch['quoted_cost'] ?? 0 ),
			'bulk_ids'        => array(),
			'utm_campaign'    => $utm,
			'created_at'      => time(),
			'created_by'      => get_current_user_id(),
			'error'           => '',
		);

		$message_final = self::stamp_message( $message, $row );
		$row['message'] = $message_final;

		$rows   = self::all();
		$rows[] = $row;
		self::save_all( $rows );

		if ( ! wp_next_scheduled( self::CRON_HOOK, array( $id ) ) ) {
			wp_schedule_single_event( $scheduled_at, self::CRON_HOOK, array( $id ) );
		}

		return self::public_row( $row );
	}

	/**
	 * @param array<string,mixed> $row Row.
	 * @return array<string,mixed>
	 */
	public static function public_row( array $row ) {
		unset( $row['phones'] );
		return $row;
	}

	/**
	 * @param string $id Campaign id.
	 * @return true|WP_Error
	 */
	public static function cancel( $id ) {
		$rows = self::all();
		$found = false;
		foreach ( $rows as &$row ) {
			if ( (string) ( $row['id'] ?? '' ) !== sanitize_key( $id ) ) {
				continue;
			}
			$found = true;
			if ( in_array( (string) ( $row['status'] ?? '' ), array( 'sent', 'sending', 'cancelled' ), true ) ) {
				return new WP_Error( 'cannot_cancel', __( 'Campaign cannot be cancelled.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			$row['status'] = 'cancelled';
			wp_clear_scheduled_hook( self::CRON_HOOK, array( $row['id'] ) );
		}
		unset( $row );
		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'Campaign not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		self::save_all( $rows );
		return true;
	}

	/**
	 * Append UTM + product/category link + coupon to message.
	 *
	 * @param string              $message Message.
	 * @param array<string,mixed> $row Campaign.
	 * @return string
	 */
	public static function stamp_message( $message, array $row ) {
		$utm = (string) ( $row['utm_campaign'] ?? '' );
		$url = home_url( '/' );
		if ( ! empty( $row['product_id'] ) && function_exists( 'wc_get_product' ) ) {
			$p = wc_get_product( (int) $row['product_id'] );
			if ( $p ) {
				$url = $p->get_permalink();
			}
		} elseif ( ! empty( $row['category_id'] ) ) {
			$term = get_term( (int) $row['category_id'], 'product_cat' );
			if ( $term && ! is_wp_error( $term ) ) {
				$link = get_term_link( $term );
				if ( ! is_wp_error( $link ) ) {
					$url = $link;
				}
			}
		}
		$sep = false === strpos( $url, '?' ) ? '?' : '&';
		$url = $url . $sep . 'utm_source=sms&utm_medium=sms_ad&utm_campaign=' . rawurlencode( $utm );

		$msg = (string) $message;
		if ( false === strpos( $msg, $url ) && false === strpos( $msg, '{link}' ) ) {
			$msg .= "\n" . $url;
		} else {
			$msg = str_replace( '{link}', $url, $msg );
		}
		$code = (string) ( $row['coupon_code'] ?? '' );
		if ( $code && false === strpos( $msg, $code ) ) {
			$msg = str_replace( '{coupon}', $code, $msg );
			if ( false === strpos( $msg, $code ) ) {
				$msg .= "\n" . $code;
			}
		}
		return $msg;
	}

	/**
	 * Cron entry.
	 *
	 * @param string $id Campaign id.
	 * @return void
	 */
	public static function cron_run( $id ) {
		self::run_send( (string) $id );
	}

	/**
	 * @param string $id Campaign id.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function run_send( $id ) {
		$row = self::get( $id );
		if ( ! $row ) {
			return new WP_Error( 'not_found', __( 'Campaign not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( 'cancelled' === ( $row['status'] ?? '' ) ) {
			return $row;
		}
		if ( 'sent' === ( $row['status'] ?? '' ) ) {
			return self::public_row( $row );
		}

		$phones = isset( $row['phones'] ) && is_array( $row['phones'] ) ? $row['phones'] : array();
		if ( empty( $phones ) ) {
			$resolved = Webino_Dashboard_Sms_Ads_Segments::resolve(
				(string) $row['segment'],
				array( 'include_phones' => true )
			);
			$phones = $resolved['phones'] ?? array();
		}
		if ( empty( $phones ) ) {
			self::update_fields( $id, array( 'status' => 'failed', 'error' => 'no_recipients' ) );
			return new WP_Error( 'no_recipients', __( 'No recipients.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		self::update_fields( $id, array( 'status' => 'sending' ) );

		$from = '';
		if ( class_exists( 'Webino_Dashboard_License', false ) ) {
			$acc = Webino_Dashboard_License::instance()->crm_get( 'wp-json/webinocrm/v1/modirpayamak/account' );
			if ( ! empty( $acc['ok'] ) && is_array( $acc['data'] ?? null ) ) {
				$from = (string) ( $acc['data']['account']['default_from'] ?? '' );
			}
		}

		$message = (string) ( $row['message'] ?? '' );
		$channel = (string) ( $row['channel'] ?? 'sms' );
		$sent    = 0;
		$failed  = 0;
		$cost    = 0.0;
		$bulk_ids = array();
		$license = class_exists( 'Webino_Dashboard_License', false ) ? Webino_Dashboard_License::instance() : null;

		$chunks = array_chunk( $phones, self::BATCH_SIZE );
		foreach ( $chunks as $chunk ) {
			$payload = array(
				'sending_type' => 'webservice',
				'from_number'  => $from,
				'message'      => $message,
				'channel'      => $channel,
				'params'       => array(
					'recipients' => array_values( $chunk ),
				),
			);
			if ( ! $license ) {
				$failed += count( $chunk );
				continue;
			}
			$res = $license->crm_post( 'wp-json/webinocrm/v1/modirpayamak/send', $payload );
			if ( empty( $res['ok'] ) ) {
				$failed += count( $chunk );
				continue;
			}
			$sent += count( $chunk );
			$data = is_array( $res['data'] ?? null ) ? $res['data'] : array();
			if ( isset( $data['cost'] ) ) {
				$cost += (float) $data['cost'];
			}
			$bulk = (string) ( $data['bulk_id'] ?? $data['message_id'] ?? '' );
			if ( $bulk ) {
				$bulk_ids[] = $bulk;
			}
		}

		self::update_fields(
			$id,
			array(
				'status'   => $sent > 0 ? 'sent' : 'failed',
				'sent'     => $sent,
				'failed'   => $failed,
				'cost'     => $cost > 0 ? $cost : (float) ( $row['cost'] ?? 0 ),
				'bulk_ids' => $bulk_ids,
				'phones'   => array(),
				'error'    => $sent > 0 ? '' : 'send_failed',
			)
		);

		$updated = self::get( $id );
		return $updated ? self::public_row( $updated ) : new WP_Error( 'not_found', 'missing', array( 'status' => 404 ) );
	}

	/**
	 * @param string              $id Id.
	 * @param array<string,mixed> $fields Fields.
	 * @return void
	 */
	private static function update_fields( $id, array $fields ) {
		$rows = self::all();
		foreach ( $rows as &$row ) {
			if ( (string) ( $row['id'] ?? '' ) !== sanitize_key( $id ) ) {
				continue;
			}
			$row = array_merge( $row, $fields );
		}
		unset( $row );
		self::save_all( $rows );
	}

	/**
	 * Quote cost via CRM calculate-price.
	 *
	 * @param array<string,mixed> $body Body.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function quote( array $body ) {
		$segment = sanitize_key( (string) ( $body['segment'] ?? '' ) );
		$channel = sanitize_key( (string) ( $body['channel'] ?? 'sms' ) );
		$message = sanitize_textarea_field( (string) ( $body['message'] ?? 'test' ) );
		$preview = Webino_Dashboard_Sms_Ads_Segments::resolve( $segment, array( 'include_phones' => false ) );
		$count   = (int) ( $preview['count'] ?? 0 );
		if ( $count < 1 ) {
			return new WP_Error( 'no_recipients', __( 'No recipients in this segment.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$from = '';
		$dummy_recipients = array_fill( 0, min( $count, 5 ), '09120000000' );
		$payload = array(
			'sending_type'     => 'webservice',
			'from_number'      => $from,
			'message'          => $message,
			'channel'          => $channel,
			'recipient_count'  => $count,
			'params'           => array( 'recipients' => $dummy_recipients ),
		);

		if ( ! class_exists( 'Webino_Dashboard_License', false ) ) {
			return new WP_Error( 'crm_unavailable', __( 'SMS service unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$res = Webino_Dashboard_License::instance()->crm_post( 'wp-json/webinocrm/v1/modirpayamak/send/calculate-price', $payload );
		if ( empty( $res['ok'] ) || ! is_array( $res['data'] ?? null ) ) {
			$msg = is_array( $res['data'] ?? null ) && ! empty( $res['data']['message'] )
				? (string) $res['data']['message']
				: ( $res['error'] ?? __( 'CRM request failed.', 'webino-dashboard' ) );
			return new WP_Error( 'crm_error', $msg, array( 'status' => 502 ) );
		}
		$res = $res['data'];
		$unit = (float) ( $res['price_per_unit'] ?? 0 );
		$cost = (float) ( $res['customer_cost'] ?? 0 );
		// Scale flat estimate when we only quoted a sample of recipients.
		if ( $count > 5 && $unit > 0 && 'notification' !== $channel ) {
			$parts = (int) ( $res['parts'] ?? 0 );
			if ( $parts > 0 && $parts < $count ) {
				$cost = round( $cost * ( $count / $parts ), 2 );
			}
		}
		if ( 'notification' === $channel && $unit > 0 ) {
			$cost = (float) ( $res['customer_cost'] ?? ( $unit * $count ) );
		}

		return array(
			'ok'                   => true,
			'recipient_count'      => $count,
			'sample'               => $preview['sample'] ?? array(),
			'customer_cost'        => $cost,
			'cost_before_discount' => (float) ( $res['cost_before_discount'] ?? $cost ),
			'discount_percent'     => (float) ( $res['discount_percent'] ?? 0 ),
			'price_per_unit'       => $unit,
			'price_list'           => (float) ( $res['price_list'] ?? 0 ),
			'volume_tiers'         => $res['volume_tiers'] ?? array(),
			'channel'              => $channel,
			'balance'              => self::account_balance(),
		);
	}

	/**
	 * @return float
	 */
	private static function account_balance() {
		if ( ! class_exists( 'Webino_Dashboard_License', false ) ) {
			return 0;
		}
		$acc = Webino_Dashboard_License::instance()->crm_get( 'wp-json/webinocrm/v1/modirpayamak/account' );
		if ( empty( $acc['ok'] ) || ! is_array( $acc['data'] ?? null ) ) {
			return 0;
		}
		return (float) ( $acc['data']['account']['balance'] ?? 0 );
	}

	/**
	 * Delivery + revenue/ROAS for a campaign.
	 *
	 * @param string $id Campaign id.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function stats( $id ) {
		$row = self::get( $id );
		if ( ! $row ) {
			return new WP_Error( 'not_found', __( 'Campaign not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$utm = (string) ( $row['utm_campaign'] ?? '' );
		$revenue = 0.0;
		$orders_n = 0;
		$order_samples = array();

		if ( $utm && function_exists( 'wc_get_orders' ) ) {
			$orders = wc_get_orders(
				array(
					'limit'      => 100,
					'status'     => array( 'processing', 'completed' ),
					'meta_key'   => '_wc_order_attribution_utm_campaign',
					'meta_value' => $utm,
					'return'     => 'objects',
				)
			);
			// Fallback meta keys.
			if ( empty( $orders ) ) {
				$orders = wc_get_orders(
					array(
						'limit'    => 200,
						'status'   => array( 'processing', 'completed' ),
						'return'   => 'objects',
					)
				);
				$filtered = array();
				foreach ( $orders as $o ) {
					if ( ! is_a( $o, 'WC_Order' ) ) {
						continue;
					}
					$c = (string) $o->get_meta( '_wc_order_attribution_utm_campaign' );
					if ( '' === $c ) {
						$c = (string) $o->get_meta( 'utm_campaign' );
					}
					if ( $c === $utm ) {
						$filtered[] = $o;
					}
				}
				$orders = $filtered;
			}
			foreach ( $orders as $o ) {
				if ( ! is_a( $o, 'WC_Order' ) ) {
					continue;
				}
				++$orders_n;
				$revenue += (float) $o->get_total();
				if ( count( $order_samples ) < 10 ) {
					$order_samples[] = array(
						'id'     => $o->get_id(),
						'number' => $o->get_order_number(),
						'total'  => (float) $o->get_total(),
						'date'   => $o->get_date_created() ? $o->get_date_created()->date( 'c' ) : '',
					);
				}
			}
		}

		$cost = max( 0, (float) ( $row['cost'] ?? 0 ) );
		$sent = max( 0, (int) ( $row['sent'] ?? 0 ) );
		$delivered = $sent; // Until CRM bulk-stats refine.
		$bulk_stats = array();
		if ( ! empty( $row['bulk_ids'] ) && is_array( $row['bulk_ids'] ) && class_exists( 'Webino_Dashboard_License', false ) ) {
			$license = Webino_Dashboard_License::instance();
			foreach ( array_slice( $row['bulk_ids'], 0, 3 ) as $bid ) {
				$res = $license->crm_get(
					'wp-json/webinocrm/v1/modirpayamak/reports/bulk-stats',
					array( 'bulk_id' => (string) $bid )
				);
				if ( ! empty( $res['ok'] ) ) {
					$bulk_stats[] = $res['data'] ?? $res;
				}
			}
		}

		$roas = $cost > 0 ? round( $revenue / $cost, 2 ) : null;
		$conversion = $delivered > 0 ? round( ( $orders_n / $delivered ) * 100, 2 ) : 0;

		return array(
			'campaign'       => self::public_row( $row ),
			'sent'           => $sent,
			'failed'         => (int) ( $row['failed'] ?? 0 ),
			'delivered'      => $delivered,
			'cost'           => $cost,
			'revenue'        => $revenue,
			'orders'         => $orders_n,
			'roas'           => $roas,
			'conversion_pct' => $conversion,
			'order_samples'  => $order_samples,
			'bulk_stats'     => $bulk_stats,
		);
	}
}
