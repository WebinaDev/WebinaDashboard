<?php
/**
 * ModirPayamak REST proxy to WebinoCRM.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers webino-dashboard/v1/modirpayamak/* routes.
 */
final class Webino_Dashboard_REST_ModirPayamak {

	const NS = 'webino-dashboard/v1';

	/** GET proxy cache lifetime (seconds). */
	const CACHE_TTL = 90;

	/** Fast CRM options for dashboard reads. */
	const CRM_FAST_OPTS = array(
		'timeout'  => 8,
		'wall_cap' => 12,
	);

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
		$routes = array(
			array( 'GET', '/modirpayamak/dashboard', 'dashboard' ),
			array( 'GET', '/modirpayamak/account', 'account' ),
			array( 'GET', '/modirpayamak/packages', 'packages' ),
			array( 'POST', '/modirpayamak/topup/init', 'topup_init' ),
			array( 'POST', '/modirpayamak/topup/verify', 'topup_verify' ),
			array( 'POST', '/modirpayamak/send', 'send' ),
			array( 'POST', '/modirpayamak/send/peer-to-peer', 'send_p2p' ),
			array( 'POST', '/modirpayamak/send/calculate-price', 'calculate_price' ),
			array( 'POST', '/modirpayamak/send/cancel-scheduled', 'cancel_scheduled' ),
			array( 'GET', '/modirpayamak/reports/messages', 'reports_messages' ),
			array( 'GET', '/modirpayamak/reports/inbox', 'reports_inbox' ),
			array( 'GET', '/modirpayamak/reports/outbox', 'reports_outbox' ),
			array( 'GET', '/modirpayamak/patterns', 'patterns' ),
			array( 'POST', '/modirpayamak/patterns', 'patterns_create' ),
			array( 'GET', '/modirpayamak/patterns/registry', 'patterns_registry' ),
			array( 'POST', '/modirpayamak/patterns/sync', 'patterns_sync' ),
			array( 'POST', '/modirpayamak/patterns/detach', 'patterns_detach' ),
			array( 'GET', '/modirpayamak/numbers', 'numbers' ),
			array( 'GET', '/modirpayamak/ledger', 'ledger' ),
			array( 'GET', '/modirpayamak/phonebooks', 'phonebooks' ),
			array( 'POST', '/modirpayamak/phonebooks', 'create_phonebook' ),
			array( 'GET', '/modirpayamak/phonebooks/edge', 'phonebooks_edge' ),
			array( 'POST', '/modirpayamak/phonebooks/edge', 'create_phonebook_edge' ),
			array( 'GET', '/modirpayamak/settings/site', 'settings_site_get' ),
			array( 'POST', '/modirpayamak/settings/site', 'settings_site_post' ),
			array( 'GET', '/modirpayamak/settings/shop', 'settings_shop_get' ),
			array( 'POST', '/modirpayamak/settings/shop', 'settings_shop_post' ),
			array( 'GET', '/modirpayamak/templates', 'templates_get' ),
			array( 'POST', '/modirpayamak/templates', 'templates_post' ),
			array( 'GET', '/modirpayamak/templates/shortcodes', 'templates_shortcodes' ),
			array( 'POST', '/modirpayamak/orders/notify', 'orders_notify' ),
			array( 'POST', '/modirpayamak/orders/test-notify', 'orders_test_notify' ),
			array( 'POST', '/modirpayamak/auth/send-otp', 'auth_send_otp' ),
			array( 'POST', '/modirpayamak/auth/verify-otp', 'auth_verify_otp' ),
			array( 'POST', '/modirpayamak/newsletter/subscribe', 'newsletter_subscribe' ),
			array( 'GET', '/modirpayamak/newsletter/subscribers', 'newsletter_subscribers' ),
			array( 'POST', '/modirpayamak/newsletter/unsubscribe', 'newsletter_unsubscribe' ),
			array( 'POST', '/modirpayamak/newsletter/send', 'newsletter_send' ),
			array( 'GET', '/modirpayamak/drafts', 'drafts' ),
			array( 'POST', '/modirpayamak/drafts', 'drafts_create' ),
			array( 'POST', '/modirpayamak/drafts/delete', 'drafts_delete' ),
			array( 'GET', '/modirpayamak/tickets', 'tickets' ),
			array( 'GET', '/modirpayamak/reports/bulk-stats', 'reports_bulk_stats' ),
			array( 'GET', '/modirpayamak/reports/bulk-recipients', 'reports_bulk_recipients' ),
			array( 'GET', '/modirpayamak/secretaries', 'secretaries_list' ),
			array( 'POST', '/modirpayamak/secretaries', 'secretaries_save' ),
			array( 'POST', '/modirpayamak/secretaries/delete', 'secretaries_delete' ),
			array( 'POST', '/modirpayamak/secretaries/process', 'secretaries_process' ),
		);

		foreach ( $routes as $r ) {
			register_rest_route(
				self::NS,
				$r[1],
				array(
					'methods'             => $r[0],
					'callback'            => array( __CLASS__, $r[2] ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				)
			);
		}

		register_rest_route(
			self::NS,
			'/modirpayamak/phonebooks/(?P<id>\d+)/contacts',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'list_contacts' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'create_contact' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/modirpayamak/patterns/(?P<code>[a-zA-Z0-9_%-]+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'patterns_get' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/modirpayamak/ads',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'ads_list' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'ads_create' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/modirpayamak/ads/preview-segment',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'ads_preview_segment' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/modirpayamak/ads/quote',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'ads_quote' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/modirpayamak/ads/(?P<id>[a-zA-Z0-9_\\-]+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'ads_get' ),
					'permission_callback' => array( __CLASS__, 'perm_manage' ),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/modirpayamak/ads/(?P<id>[a-zA-Z0-9_\\-]+)/cancel',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'ads_cancel' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);
		register_rest_route(
			self::NS,
			'/modirpayamak/ads/(?P<id>[a-zA-Z0-9_\\-]+)/stats',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'ads_stats' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function perm_manage() {
		return Webino_Dashboard_Rest_Base::can( 'manage_options' );
	}

	/**
	 * @param string              $path CRM path.
	 * @param array<string,mixed> $body Body.
	 * @return WP_REST_Response|WP_Error
	 */
	/**
	 * @param string $message Error message.
	 * @return WP_REST_Response
	 */
	private static function crm_unavailable_response( $message ) {
		return new WP_REST_Response(
			array(
				'ok'          => false,
				'unavailable' => true,
				'message'     => $message,
			),
			200
		);
	}

	/**
	 * @param string              $path CRM path.
	 * @param array<string,mixed> $body Body.
	 * @return WP_REST_Response
	 */
	private static function crm_post( $path, array $body = array() ) {
		$license = Webino_Dashboard_License::instance();
		$res     = $license->crm_post( 'wp-json/webinocrm/v1/' . ltrim( $path, '/' ), $body );
		if ( empty( $res['ok'] ) ) {
			$msg = is_array( $res['data'] ?? null ) && ! empty( $res['data']['message'] )
				? (string) $res['data']['message']
				: ( $res['error'] ?? __( 'CRM request failed.', 'webino-dashboard' ) );
			return self::crm_unavailable_response( $msg );
		}
		return new WP_REST_Response( is_array( $res['data'] ) ? $res['data'] : array( 'ok' => true ), 200 );
	}

	/**
	 * @param string              $path CRM path.
	 * @param array<string,mixed> $query Query.
	 * @return WP_REST_Response
	 */
	/**
	 * @param string $cache_slug Cache key slug.
	 * @return string
	 */
	private static function cache_transient_key( $cache_slug ) {
		$domain = Webino_Dashboard_License::instance()->get_current_domain();
		return 'webino_mp_' . md5( $cache_slug . '|' . $domain );
	}

	/**
	 * @param string              $cache_slug Cache slug.
	 * @param string              $path       CRM path under modirpayamak/.
	 * @param array<string,mixed> $query      Query args.
	 * @return WP_REST_Response
	 */
	private static function crm_get_cached( $cache_slug, $path, array $query = array() ) {
		$key    = self::cache_transient_key( $cache_slug );
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			return new WP_REST_Response( $cached, 200 );
		}

		$response = self::crm_get( $path, $query );
		if ( $response instanceof WP_REST_Response ) {
			$data = $response->get_data();
			if ( is_array( $data ) && empty( $data['unavailable'] ) ) {
				set_transient( $key, $data, self::CACHE_TTL );
			}
		}
		return $response;
	}

	/**
	 * @param string              $path CRM path.
	 * @param array<string,mixed> $query Query.
	 * @return WP_REST_Response
	 */
	private static function crm_get( $path, array $query = array() ) {
		$license = Webino_Dashboard_License::instance();
		$res     = $license->crm_get( 'wp-json/webinocrm/v1/' . ltrim( $path, '/' ), $query, self::CRM_FAST_OPTS );
		if ( empty( $res['ok'] ) ) {
			$msg = $res['error'] ?? __( 'CRM request failed.', 'webino-dashboard' );
			return self::crm_unavailable_response( $msg );
		}
		return new WP_REST_Response( is_array( $res['data'] ) ? $res['data'] : array( 'ok' => true ), 200 );
	}

	/**
	 * Combined account + recent messages (single client round-trip).
	 *
	 * @return WP_REST_Response
	 */
	public static function dashboard() {
		$key    = self::cache_transient_key( 'dashboard' );
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			return new WP_REST_Response( $cached, 200 );
		}

		$license = Webino_Dashboard_License::instance();
		$opts    = self::CRM_FAST_OPTS;

		$account_res = $license->crm_get( 'wp-json/webinocrm/v1/modirpayamak/account', array(), $opts );
		if ( empty( $account_res['ok'] ) ) {
			$msg = $account_res['error'] ?? __( 'CRM request failed.', 'webino-dashboard' );
			return self::crm_unavailable_response( $msg );
		}

		$account_data = is_array( $account_res['data'] ) ? $account_res['data'] : array();
		$messages_res = $license->crm_get(
			'wp-json/webinocrm/v1/modirpayamak/reports/messages',
			array(
				'page'  => 1,
				'limit' => 10,
			),
			$opts
		);
		$messages_data = ! empty( $messages_res['ok'] ) && is_array( $messages_res['data'] ) ? $messages_res['data'] : array();

		$payload = array_merge(
			$account_data,
			array(
				'ok'       => true,
				'messages' => isset( $messages_data['messages'] ) && is_array( $messages_data['messages'] )
					? $messages_data['messages']
					: array(),
			)
		);
		set_transient( $key, $payload, self::CACHE_TTL );

		return new WP_REST_Response( $payload, 200 );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function account() {
		return self::crm_get_cached( 'account', 'modirpayamak/account' );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function packages() {
		return self::crm_get_cached( 'packages', 'modirpayamak/packages' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function topup_init( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		if ( empty( $body['callback_url'] ) ) {
			$body['callback_url'] = Webino_Dashboard_Rewrite::url( 'marketing/sms/payment-callback' );
		}
		return self::crm_post( 'modirpayamak/topup/init', $body );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function topup_verify( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/topup/verify', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function send( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/send', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function send_p2p( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/send/peer-to-peer', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function calculate_price( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/send/calculate-price', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function reports_messages( WP_REST_Request $request ) {
		$page  = max( 1, (int) $request->get_param( 'page' ) );
		$limit = min( 50, max( 1, (int) $request->get_param( 'limit' ) ) );
		$query = array(
			'page'  => $page,
			'limit' => $limit,
		);
		if ( 1 === $page && $limit <= 20 ) {
			return self::crm_get_cached( 'reports_messages_p1', 'modirpayamak/reports/messages', $query );
		}
		return self::crm_get( 'modirpayamak/reports/messages', $query );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function patterns( WP_REST_Request $request ) {
		return self::crm_get(
			'modirpayamak/patterns',
			array(
				'page'     => max( 1, (int) $request->get_param( 'page' ) ),
				'per_page' => min( 100, max( 1, (int) $request->get_param( 'per_page' ) ) ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function patterns_create( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/patterns', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function patterns_get( WP_REST_Request $request ) {
		$code = rawurlencode( (string) $request->get_param( 'code' ) );
		return self::crm_get( 'modirpayamak/patterns/' . $code );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function numbers() {
		return self::crm_get( 'modirpayamak/numbers' );
	}

	/**
	 * Domain credit ledger (site-facing via CRM).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function ledger( WP_REST_Request $request ) {
		return self::crm_get(
			'modirpayamak/ledger',
			array(
				'page'  => max( 1, (int) $request->get_param( 'page' ) ),
				'limit' => min( 100, max( 1, (int) $request->get_param( 'limit' ) ) ),
			)
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function phonebooks() {
		return self::crm_get( 'modirpayamak/phonebooks' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_phonebook( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/phonebooks', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_contacts( WP_REST_Request $request ) {
		$id = (int) $request['id'];
		return self::crm_get( 'modirpayamak/phonebooks/' . $id . '/contacts' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_contact( WP_REST_Request $request ) {
		$id   = (int) $request['id'];
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/phonebooks/' . $id . '/contacts', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function cancel_scheduled( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/send/cancel-scheduled', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function reports_inbox( WP_REST_Request $request ) {
		return self::crm_get(
			'modirpayamak/reports/inbox',
			array(
				'page'  => max( 1, (int) $request->get_param( 'page' ) ),
				'limit' => min( 50, max( 1, (int) $request->get_param( 'limit' ) ) ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function reports_outbox( WP_REST_Request $request ) {
		return self::crm_get(
			'modirpayamak/reports/outbox',
			array(
				'page'  => max( 1, (int) $request->get_param( 'page' ) ),
				'limit' => min( 50, max( 1, (int) $request->get_param( 'limit' ) ) ),
			)
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function patterns_registry() {
		return self::crm_get( 'modirpayamak/patterns/registry' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function patterns_sync( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$result = self::crm_post( 'modirpayamak/patterns/sync', is_array( $body ) ? $body : array() );
		if ( class_exists( 'Webino_Dashboard_REST_Site_Settings', false ) ) {
			Webino_Dashboard_REST_Site_Settings::invalidate_sms_shop_cache();
		}
		delete_transient( 'webino_tracking_providers_registry' );
		return $result;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function patterns_detach( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$result = self::crm_post( 'modirpayamak/patterns/detach', is_array( $body ) ? $body : array() );
		if ( class_exists( 'Webino_Dashboard_REST_Site_Settings', false ) ) {
			Webino_Dashboard_REST_Site_Settings::invalidate_sms_shop_cache();
		}
		delete_transient( 'webino_tracking_providers_registry' );
		return $result;
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function phonebooks_edge() {
		return self::crm_get( 'modirpayamak/phonebooks/edge' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_phonebook_edge( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/phonebooks/edge', is_array( $body ) ? $body : array() );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_site_get() {
		return self::crm_get( 'modirpayamak/settings/site' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_site_post( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/settings/site', is_array( $body ) ? $body : array() );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_shop_get() {
		return self::crm_get( 'modirpayamak/settings/shop' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function settings_shop_post( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/settings/shop', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function templates_get( WP_REST_Request $request ) {
		return self::crm_get(
			'modirpayamak/templates',
			array_filter(
				array(
					'scope'     => $request->get_param( 'scope' ),
					'event_key' => $request->get_param( 'event_key' ),
				)
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function templates_post( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/templates', is_array( $body ) ? $body : array() );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function templates_shortcodes() {
		return self::crm_get( 'modirpayamak/templates/shortcodes' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function orders_notify( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}

		$order_id = (int) ( $body['order_id'] ?? 0 );
		if ( $order_id > 0 && empty( $body['order'] ) && class_exists( 'Webino_Dashboard_Sms_Order_Hooks', false ) ) {
			$wc_order = wc_get_order( $order_id );
			if ( ! $wc_order ) {
				return new WP_Error( 'not_found', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
			}
			$body['order'] = Webino_Dashboard_Sms_Order_Hooks::build_snapshot( $wc_order );
			if ( empty( $body['event_key'] ) ) {
				$body['event_key'] = Webino_Dashboard_Sms_Order_Map::event_for_status( $wc_order->get_status() );
			}
		}

		$event_key = isset( $body['event_key'] ) ? (string) $body['event_key'] : '';
		$force     = ! empty( $body['force'] ) || ! empty( $body['force_customer'] ) || ! empty( $body['force_admin'] );
		if (
			! $force
			&& '' !== $event_key
			&& class_exists( 'Webino_Dashboard_Sms_Order_Hooks', false )
			&& Webino_Dashboard_Sms_Order_Hooks::should_skip_notify( $event_key )
		) {
			if ( $order_id > 0 && class_exists( 'Webino_Dashboard_Orders', false ) ) {
				$phone = '';
				if ( ! empty( $body['order']['customer_phone'] ) ) {
					$phone = (string) $body['order']['customer_phone'];
				}
				Webino_Dashboard_Orders::append_sms_log(
					$order_id,
					array(
						'event'  => $event_key,
						'phone'  => $phone,
						'status' => 'skipped',
						'reason' => 'event_off',
						'source' => 'dashboard',
						'role'   => 'system',
					)
				);
			}
			return new WP_REST_Response(
				array(
					'ok'      => true,
					'skipped' => true,
					'reason'  => 'event_off',
				)
			);
		}

		$res = self::crm_post( 'modirpayamak/orders/notify', $body );
		if ( ! is_wp_error( $res ) && $order_id > 0 && class_exists( 'Webino_Dashboard_Orders', false ) ) {
			$phone = '';
			if ( ! empty( $body['order']['customer_phone'] ) ) {
				$phone = (string) $body['order']['customer_phone'];
			} else {
				$wc = wc_get_order( $order_id );
				if ( $wc ) {
					$phone = (string) $wc->get_billing_phone();
				}
			}
			$data   = is_a( $res, 'WP_REST_Response' ) ? $res->get_data() : array();
			$status = self::notify_result_status( $data );
			$reason = self::notify_result_reason( $data );
			$role   = ! empty( $body['force_admin'] ) && empty( $body['force_customer'] ) ? 'admin' : 'customer';
			Webino_Dashboard_Orders::append_sms_log(
				$order_id,
				array(
					'event'  => (string) ( $body['event_key'] ?? 'manual' ),
					'phone'  => $phone,
					'status' => $status,
					'reason' => $reason,
					'source' => 'dashboard',
					'role'   => $role,
				)
			);
			delete_transient( 'webino_order_sms_sync_' . $order_id );
		}
		return $res;
	}

	/**
	 * @param mixed $data CRM notify response body.
	 * @return string
	 */
	private static function notify_result_status( $data ) {
		if ( ! is_array( $data ) ) {
			return 'failed';
		}
		if ( ! empty( $data['skipped'] ) ) {
			return 'skipped';
		}
		$results = is_array( $data['results'] ?? null ) ? $data['results'] : array();
		$customer = $results['customer'] ?? null;
		$admins   = is_array( $results['admin'] ?? null ) ? $results['admin'] : array();
		$parts    = array();
		if ( null !== $customer ) {
			$parts[] = $customer;
		}
		foreach ( $admins as $a ) {
			$parts[] = $a;
		}
		if ( ! $parts ) {
			return ! empty( $data['ok'] ) ? 'sent' : 'failed';
		}
		$any_sent    = false;
		$any_fail    = false;
		$any_skip    = false;
		foreach ( $parts as $part ) {
			if ( ! is_array( $part ) ) {
				continue;
			}
			if ( ! empty( $part['skipped'] ) ) {
				$any_skip = true;
				continue;
			}
			if ( isset( $part['ok'] ) && false === $part['ok'] ) {
				$any_fail = true;
				continue;
			}
			if ( ! empty( $part['reason'] ) && empty( $part['ok'] ) && empty( $part['message_id'] ) && empty( $part['outbox_id'] ) ) {
				// Normalized failure without ok:true.
				if ( 'send_failed' === (string) $part['reason'] || 'insufficient_balance' === (string) $part['reason'] ) {
					$any_fail = true;
					continue;
				}
			}
			$any_sent = true;
		}
		if ( $any_sent ) {
			return 'sent';
		}
		if ( $any_fail ) {
			return 'failed';
		}
		if ( $any_skip ) {
			return 'skipped';
		}
		return 'failed';
	}

	/**
	 * @param mixed $data CRM notify response body.
	 * @return string
	 */
	private static function notify_result_reason( $data ) {
		if ( ! is_array( $data ) ) {
			return '';
		}
		if ( ! empty( $data['reason'] ) ) {
			return sanitize_key( (string) $data['reason'] );
		}
		$results  = is_array( $data['results'] ?? null ) ? $data['results'] : array();
		$customer = is_array( $results['customer'] ?? null ) ? $results['customer'] : null;
		if ( $customer && ! empty( $customer['reason'] ) ) {
			return sanitize_key( (string) $customer['reason'] );
		}
		$admins = is_array( $results['admin'] ?? null ) ? $results['admin'] : array();
		foreach ( $admins as $a ) {
			if ( is_array( $a ) && ! empty( $a['reason'] ) ) {
				return sanitize_key( (string) $a['reason'] );
			}
		}
		return '';
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function auth_send_otp( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/auth/send-otp', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function auth_verify_otp( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/auth/verify-otp', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function newsletter_subscribe( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/newsletter/subscribe', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function newsletter_subscribers( WP_REST_Request $request ) {
		return self::crm_get(
			'modirpayamak/newsletter/subscribers',
			array(
				'product_id' => (int) $request->get_param( 'product_id' ),
				'page'       => max( 1, (int) $request->get_param( 'page' ) ),
				'limit'      => min( 100, max( 1, (int) $request->get_param( 'limit' ) ) ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function newsletter_send( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/newsletter/send', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function drafts( WP_REST_Request $request ) {
		return self::crm_get(
			'modirpayamak/drafts',
			array(
				'page'     => max( 1, (int) $request->get_param( 'page' ) ),
				'per_page' => min( 100, max( 1, (int) $request->get_param( 'per_page' ) ) ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function drafts_create( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/drafts', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function drafts_delete( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/drafts/delete', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function newsletter_unsubscribe( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/newsletter/unsubscribe', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function orders_test_notify( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		if ( empty( $body['order'] ) && ! empty( $body['order_id'] ) && function_exists( 'wc_get_order' ) ) {
			$wc_order = wc_get_order( (int) $body['order_id'] );
			if ( $wc_order ) {
				$body['order'] = Webino_Dashboard_Sms_Order_Hooks::build_snapshot( $wc_order );
				if ( empty( $body['event_key'] ) ) {
					$body['event_key'] = Webino_Dashboard_Sms_Order_Map::event_for_status( $wc_order->get_status() );
				}
			}
		}
		return self::crm_post( 'modirpayamak/orders/test-notify', $body );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function reports_bulk_stats( WP_REST_Request $request ) {
		return self::crm_get(
			'modirpayamak/reports/bulk-stats',
			array(
				'bulk_id'   => (string) ( $request->get_param( 'bulk_id' ) ?: $request->get_param( 'outbox_id' ) ),
				'outbox_id' => (string) ( $request->get_param( 'outbox_id' ) ?: $request->get_param( 'bulk_id' ) ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function reports_bulk_recipients( WP_REST_Request $request ) {
		return self::crm_get(
			'modirpayamak/reports/bulk-recipients',
			array(
				'bulk_id'   => (string) ( $request->get_param( 'bulk_id' ) ?: $request->get_param( 'outbox_id' ) ),
				'outbox_id' => (string) ( $request->get_param( 'outbox_id' ) ?: $request->get_param( 'bulk_id' ) ),
				'page'      => max( 1, (int) $request->get_param( 'page' ) ),
				'limit'     => min( 100, max( 1, (int) $request->get_param( 'limit' ) ) ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function secretaries_list( WP_REST_Request $request ) {
		return self::crm_get( 'modirpayamak/secretaries' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function secretaries_save( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/secretaries', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function secretaries_delete( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/secretaries/delete', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function secretaries_process( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		return self::crm_post( 'modirpayamak/secretaries/process', is_array( $body ) ? $body : array() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function tickets( WP_REST_Request $request ) {
		return self::crm_get(
			'modirpayamak/tickets',
			array(
				'page'     => max( 1, (int) $request->get_param( 'page' ) ),
				'per_page' => min( 100, max( 1, (int) $request->get_param( 'per_page' ) ) ),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function ads_list() {
		$items = array_map(
			static function ( $row ) {
				return Webino_Dashboard_Sms_Ads::public_row( $row );
			},
			Webino_Dashboard_Sms_Ads::all()
		);
		usort(
			$items,
			static function ( $a, $b ) {
				return (int) ( $b['created_at'] ?? 0 ) <=> (int) ( $a['created_at'] ?? 0 );
			}
		);
		return new WP_REST_Response( array( 'ok' => true, 'items' => $items ), 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function ads_create( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$res  = Webino_Dashboard_Sms_Ads::create( is_array( $body ) ? $body : array() );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array( 'ok' => true, 'campaign' => $res ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function ads_get( WP_REST_Request $request ) {
		$row = Webino_Dashboard_Sms_Ads::get( (string) $request['id'] );
		if ( ! $row ) {
			return new WP_Error( 'not_found', __( 'Campaign not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( array( 'ok' => true, 'campaign' => Webino_Dashboard_Sms_Ads::public_row( $row ) ), 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function ads_cancel( WP_REST_Request $request ) {
		$res = Webino_Dashboard_Sms_Ads::cancel( (string) $request['id'] );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function ads_preview_segment( WP_REST_Request $request ) {
		$body    = $request->get_json_params();
		$segment = is_array( $body ) ? (string) ( $body['segment'] ?? '' ) : '';
		$data    = Webino_Dashboard_Sms_Ads_Segments::resolve( $segment, array( 'include_phones' => false ) );
		return new WP_REST_Response( array_merge( array( 'ok' => true ), $data ), 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function ads_quote( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$res  = Webino_Dashboard_Sms_Ads::quote( is_array( $body ) ? $body : array() );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( $res, 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function ads_stats( WP_REST_Request $request ) {
		$res = Webino_Dashboard_Sms_Ads::stats( (string) $request['id'] );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array_merge( array( 'ok' => true ), $res ), 200 );
	}
}
