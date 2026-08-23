<?php
/**
 * Account portal REST API.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Customer/partner self-service endpoints.
 */
class Webino_Dashboard_REST_Account {

	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		$portal = static function () {
			return Webino_Dashboard_Rest_Base::has_account_portal();
		};

		register_rest_route(
			self::NS,
			'/account/overview',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'overview_get' ),
				'permission_callback' => $portal,
			)
		);

		register_rest_route(
			self::NS,
			'/account/notifications',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'notifications_list' ),
					'permission_callback' => $portal,
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'notifications_mark_all' ),
					'permission_callback' => $portal,
				),
			)
		);

		register_rest_route(
			self::NS,
			'/account/notifications/(?P<id>\d+)/read',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'notification_mark_read' ),
				'permission_callback' => $portal,
			)
		);

		register_rest_route(
			self::NS,
			'/account/wallet',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'wallet_get' ),
				'permission_callback' => $portal,
			)
		);

		register_rest_route(
			self::NS,
			'/account/wallet/topup',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'wallet_topup' ),
				'permission_callback' => $portal,
			)
		);

		register_rest_route(
			self::NS,
			'/account/wallet/withdraw',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'wallet_withdraw' ),
				'permission_callback' => $portal,
			)
		);

		register_rest_route(
			self::NS,
			'/account/wallet/prefs',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'wallet_prefs_get' ),
					'permission_callback' => $portal,
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'wallet_prefs' ),
					'permission_callback' => $portal,
				),
			)
		);

		register_rest_route(
			self::NS,
			'/account/wishlist',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'wishlist_get' ),
					'permission_callback' => $portal,
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'wishlist_add' ),
					'permission_callback' => $portal,
				),
			)
		);

		register_rest_route(
			self::NS,
			'/account/wishlist/(?P<product_id>\d+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( __CLASS__, 'wishlist_remove' ),
				'permission_callback' => $portal,
			)
		);

		register_rest_route(
			self::NS,
			'/account/reviews/pending',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'reviews_pending' ),
				'permission_callback' => $portal,
			)
		);

		register_rest_route(
			self::NS,
			'/account/reviews',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'reviews_list' ),
					'permission_callback' => $portal,
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'review_create' ),
					'permission_callback' => $portal,
				),
			)
		);

		register_rest_route(
			self::NS,
			'/account/questions',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'questions_list' ),
					'permission_callback' => $portal,
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'question_create' ),
					'permission_callback' => $portal,
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/wallet-withdrawals',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'withdrawals_list' ),
					'permission_callback' => static function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
					},
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'withdrawal_patch' ),
					'permission_callback' => static function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/account/neshan-key',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'neshan_key_get' ),
				'permission_callback' => $portal,
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function overview_get() {
		$uid      = get_current_user_id();
		$wishlist = Webino_Dashboard_Users::get_wishlist_summary( $uid );
		$wallet_on = class_exists( 'Webino_Dashboard_Modules', false )
			&& Webino_Dashboard_Modules::is_wallet_module_active();
		$recent   = array();
		if ( function_exists( 'wc_get_orders' ) ) {
			$orders = wc_get_orders(
				array(
					'customer_id' => $uid,
					'limit'       => 5,
					'orderby'     => 'date',
					'order'       => 'DESC',
					'type'        => 'shop_order',
					'status'      => 'any',
				)
			);
			if ( is_array( $orders ) ) {
				foreach ( $orders as $o ) {
					if ( $o instanceof WC_Order ) {
						$dc       = $o->get_date_created();
						$recent[] = array(
							'id'            => $o->get_id(),
							'number'        => $o->get_order_number(),
							'status'        => $o->get_status(),
							'status_label'  => wc_get_order_status_name( $o->get_status() ),
							'total'         => $o->get_total(),
							'date'          => $dc ? $dc->format( 'c' ) : '',
							'customer_name' => trim( $o->get_formatted_billing_full_name() ),
							'item_count'    => $o->get_item_count(),
						);
					}
				}
			}
		}
		return new WP_REST_Response(
			array(
				'wallet_balance'         => $wallet_on ? Webino_Dashboard_Wallet::get_balance( $uid ) : 0,
				'wallet_enabled'         => $wallet_on,
				'wishlist_count'         => count( $wishlist ),
				'notifications_unread'   => Webino_Dashboard_Notifications::unread_count( $uid ),
				'tickets_open'           => class_exists( 'Webino_Dashboard_Support_Tickets', false )
					? Webino_Dashboard_Support_Tickets::open_count_for_user( $uid )
					: 0,
				'order_groups'           => Webino_Dashboard_Orders::get_portal_status_groups( $uid ),
				'recent_orders'          => $recent,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function notifications_list( WP_REST_Request $request ) {
		$page = max( 1, (int) $request->get_param( 'page' ) );
		return new WP_REST_Response(
			Webino_Dashboard_Notifications::list_for_user( get_current_user_id(), $page, 20 )
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function notifications_mark_all() {
		Webino_Dashboard_Notifications::mark_all_read( get_current_user_id() );
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function notification_mark_read( WP_REST_Request $request ) {
		$id = (int) $request['id'];
		if ( ! Webino_Dashboard_Notifications::mark_read( get_current_user_id(), $id ) ) {
			return new WP_Error( 'not_found', __( 'Not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function wallet_get( WP_REST_Request $request ) {
		$uid  = get_current_user_id();
		$page = max( 1, (int) $request->get_param( 'page' ) );
		$bank = class_exists( 'Webino_Dashboard_Users', false ) ? Webino_Dashboard_Users::get_bank( $uid ) : array();
		$prof = class_exists( 'Webino_Dashboard_Users', false ) ? Webino_Dashboard_Users::get_profile( $uid ) : array();
		$min  = class_exists( 'Webino_Wallet_Config', false ) ? Webino_Wallet_Config::min_topup() : 1000;
		return new WP_REST_Response(
			array(
				'balance'        => Webino_Dashboard_Wallet::get_balance( $uid ),
				'ledger'         => Webino_Dashboard_Wallet::ledger_for_user( $uid, $page, 20 ),
				'sheba'          => isset( $bank['sheba'] ) ? (string) $bank['sheba'] : '',
				'refund_method'  => isset( $prof['refund_method'] ) ? (string) $prof['refund_method'] : 'wallet',
				'min_topup'      => (int) $min,
				'min_withdraw'   => 10000,
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function wallet_prefs_get() {
		$prof = class_exists( 'Webino_Dashboard_Users', false )
			? Webino_Dashboard_Users::get_profile( get_current_user_id() )
			: array();
		return new WP_REST_Response(
			array(
				'refund_method' => isset( $prof['refund_method'] ) ? (string) $prof['refund_method'] : 'wallet',
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function wallet_prefs( WP_REST_Request $request ) {
		$uid  = get_current_user_id();
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$refund = sanitize_key( (string) ( $body['refund_method'] ?? 'wallet' ) );
		if ( ! in_array( $refund, array( 'wallet', 'bank' ), true ) ) {
			$refund = 'wallet';
		}
		update_user_meta( $uid, Webino_Dashboard_Users::META_REFUND_METHOD, $refund );
		$request->set_param( 'page', 1 );
		return self::wallet_get( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function wallet_topup( WP_REST_Request $request ) {
		$body   = $request->get_json_params();
		$amount = isset( $body['amount'] ) ? (float) $body['amount'] : 0;
		$res    = Webino_Dashboard_Wallet::create_topup_order( get_current_user_id(), $amount );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( $res );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function wallet_withdraw( WP_REST_Request $request ) {
		$body   = $request->get_json_params();
		$amount = isset( $body['amount'] ) ? (float) $body['amount'] : 0;
		$res    = Webino_Dashboard_Wallet::request_withdrawal( get_current_user_id(), $amount );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( $res );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function wishlist_get() {
		return new WP_REST_Response(
			array(
				'items' => Webino_Dashboard_Users::get_wishlist_summary( get_current_user_id() ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function wishlist_add( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$pid  = isset( $body['product_id'] ) ? absint( $body['product_id'] ) : 0;
		if ( $pid < 1 || ! wc_get_product( $pid ) ) {
			return new WP_Error( 'invalid_product', __( 'Invalid product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		Webino_Dashboard_Users::add_wishlist_product( get_current_user_id(), $pid );
		return self::wishlist_get();
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function wishlist_remove( WP_REST_Request $request ) {
		Webino_Dashboard_Users::remove_wishlist_product( get_current_user_id(), (int) $request['product_id'] );
		return self::wishlist_get();
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function reviews_pending() {
		return new WP_REST_Response(
			array(
				'items' => Webino_Dashboard_Users::get_pending_reviews( get_current_user_id() ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function reviews_list( WP_REST_Request $request ) {
		return new WP_REST_Response(
			array(
				'items' => Webino_Dashboard_Users::get_user_reviews( get_current_user_id() ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function review_create( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$res = Webino_Dashboard_Users::create_product_review(
			get_current_user_id(),
			isset( $body['product_id'] ) ? (int) $body['product_id'] : 0,
			isset( $body['rating'] ) ? (int) $body['rating'] : 0,
			isset( $body['content'] ) ? (string) $body['content'] : ''
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( $res, 201 );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function questions_list() {
		return new WP_REST_Response(
			array(
				'items' => Webino_Dashboard_Users::get_user_questions( get_current_user_id() ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function question_create( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$res = Webino_Dashboard_Users::create_product_question(
			get_current_user_id(),
			isset( $body['product_id'] ) ? (int) $body['product_id'] : 0,
			isset( $body['content'] ) ? (string) $body['content'] : ''
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( $res, 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function withdrawals_list( WP_REST_Request $request ) {
		$status = (string) $request->get_param( 'status' );
		return new WP_REST_Response( Webino_Dashboard_Wallet::list_withdrawals( $status ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function withdrawal_patch( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$id = isset( $body['id'] ) ? (int) $body['id'] : 0;
		if ( $id < 1 ) {
			return new WP_Error( 'invalid_id', __( 'Invalid ID.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$res = Webino_Dashboard_Wallet::update_withdrawal_status(
			$id,
			isset( $body['status'] ) ? (string) $body['status'] : '',
			isset( $body['admin_note'] ) ? (string) $body['admin_note'] : ''
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function neshan_key_get() {
		$key = (string) get_option( 'webino_dashboard_neshan_api_key', '' );
		return new WP_REST_Response(
			array(
				'api_key' => $key ? 'configured' : '',
				'key'     => $key,
			)
		);
	}
}
