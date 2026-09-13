<?php
/**
 * Torob Action Tracking API (Torob-Sync).
 *
 * @package WNC
 * @see https://github.com/torob/Torob-Sync/blob/main/action_tracking_api.md
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Exposes GET /torob/v1/actions for purchase attribution.
 */
class WNC_Torob_Action_Tracking {

	/** Cancellation updates are reported for this many days after purchase. */
	const UPDATE_WINDOW_DAYS = 7;

	/** @var WNC_Torob_Order_Tracking */
	private $order_tracking;

	/**
	 * @param WNC_Torob_Order_Tracking|null $order_tracking Shared cookie/order helpers.
	 */
	public function __construct( ?WNC_Torob_Order_Tracking $order_tracking = null ) {
		$this->order_tracking = $order_tracking instanceof WNC_Torob_Order_Tracking
			? $order_tracking
			: new WNC_Torob_Order_Tracking();
	}

	/**
	 * Register REST route ending in /torob/v1/actions.
	 */
	public function register_actions_route( WNC_Torob_Token $token_validator ): void {
		register_rest_route(
			'torob/v1',
			'/actions',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_actions' ),
					'permission_callback' => array( $token_validator, 'validate_token' ),
					'args'                => array(
						'timestamp_gt' => array(
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'limit'        => array(
							'required'          => true,
							'type'              => 'integer',
							'sanitize_callback' => 'absint',
							'validate_callback' => static function ( $param ) {
								return $param > 0 && $param <= 1000;
							},
						),
					),
				),
			),
			true
		);
	}

	/**
	 * Action list handler.
	 */
	public function get_actions( WP_REST_Request $request ): WP_REST_Response {
		if ( ! WNC_Torob_Options::isActionTrackingEnabled() ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'error'   => 'Action tracking API is disabled by the administrator.',
				),
				403
			);
		}

		$timestamp_gt = $request->get_param( 'timestamp_gt' );
		$limit        = min( absint( $request->get_param( 'limit' ) ), 1000 );
		$timestamp    = $this->order_tracking->parse_iso8601_timestamp( (string) $timestamp_gt );
		if ( false === $timestamp ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'error'   => 'Invalid timestamp format. Use ISO 8601 UTC format.',
				),
				400
			);
		}

		$timestamp = $this->order_tracking->apply_lookback_limit( (int) $timestamp );
		$actions   = $this->query_actions( $timestamp, $limit );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $actions,
			),
			200
		);
	}

	/**
	 * @return array<int,array<string,string>>
	 */
	public function query_actions( int $timestamp_gt, int $limit ): array {
		$orders = $this->order_tracking->query_torob_orders_for_tracking( $timestamp_gt, max( $limit * 3, $limit ), true );
		$out    = array();
		foreach ( $orders as $order ) {
			if ( ! $order instanceof WC_Order ) {
				continue;
			}
			$row = $this->format_action( $order, $timestamp_gt );
			if ( null === $row ) {
				continue;
			}
			$out[] = $row;
			if ( count( $out ) >= $limit ) {
				break;
			}
		}

		usort(
			$out,
			static function ( $a, $b ) {
				return strcmp( (string) $a['timestamp'], (string) $b['timestamp'] );
			}
		);

		return array_values( $out );
	}

	/**
	 * @return array<string,string>|null
	 */
	public function format_action( WC_Order $order, int $timestamp_gt ): ?array {
		$torob_clid = $order->get_meta( '_torob_clid' );
		if ( empty( $torob_clid ) ) {
			return null;
		}

		$created = $order->get_date_created();
		if ( ! $created ) {
			return null;
		}

		$modified = $order->get_date_modified();
		$last_ts  = $created->getTimestamp();
		if ( $modified instanceof WC_DateTime && $modified->getTimestamp() >= $last_ts ) {
			$last_ts = $modified->getTimestamp();
		}

		$purchase_ts = $created->getTimestamp();
		$wc_status   = $order->get_status();
		$cancelled   = in_array( $wc_status, array( 'cancelled', 'refunded', 'failed' ), true );

		// Include new purchases after cursor, or status updates within 7 days of purchase.
		$is_new      = $purchase_ts > $timestamp_gt;
		$is_update   = $last_ts > $timestamp_gt
			&& ( $last_ts - $purchase_ts ) <= ( self::UPDATE_WINDOW_DAYS * DAY_IN_SECONDS );
		if ( ! $is_new && ! $is_update ) {
			return null;
		}

		return array(
			'timestamp'              => $this->order_tracking->format_iso8601_timestamp( $purchase_ts ),
			'last_updated_timestamp' => $this->order_tracking->format_iso8601_timestamp( $last_ts ),
			'torob_clid'             => (string) $torob_clid,
			'status'                 => $cancelled ? 'cancelled' : 'completed',
			'action_type'            => 'purchase',
		);
	}
}
