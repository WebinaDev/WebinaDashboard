<?php
/**
 * REST API for native analytics.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Analytics REST routes.
 */
final class Webino_Dashboard_REST_Analytics {

	const NS = 'webino-dashboard/v1';

	/** Analytics read endpoint cache (seconds). */
	const CACHE_TTL = 90;

	/** Shorter cache for online visitors (seconds). */
	const CACHE_TTL_ONLINE = 15;

	const CACHE_PREFIX = 'webino_analytics_rest_';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		// admin-ajax fallback when CDN/WAF blocks /wp-json/ for analytics SPA pages.
		add_action( 'wp_ajax_webino_dashboard_analytics_rest', array( __CLASS__, 'ajax_analytics_rest' ) );
		// Public hit via admin-ajax (token-gated) when REST is blocked.
		add_action( 'wp_ajax_webino_dashboard_analytics_hit', array( __CLASS__, 'ajax_analytics_hit' ) );
		add_action( 'wp_ajax_nopriv_webino_dashboard_analytics_hit', array( __CLASS__, 'ajax_analytics_hit' ) );
		if ( did_action( 'rest_api_init' ) ) {
			self::register_routes();
		}
	}

	/**
	 * Whether a REST path under webino-dashboard/v1 is allowed via analytics admin-ajax proxy.
	 *
	 * @param string $path Path without leading slash.
	 * @return bool
	 */
	private static function is_ajax_proxy_path_allowed( $path ) {
		$path = ltrim( (string) $path, '/' );
		$path = strtok( $path, '?' );
		if ( ! is_string( $path ) || '' === $path ) {
			return false;
		}
		// Public hit uses dedicated ajax action — never via this proxy.
		if ( 'analytics/hit' === $path ) {
			return false;
		}
		$allowed = array(
			'analytics/overview',
			'analytics/visitors',
			'analytics/pages',
			'analytics/referrals',
			'analytics/geo',
			'analytics/devices',
			'analytics/online',
			'analytics/settings',
			'analytics/summary',
			'analytics/purge-cache',
			'analytics/commerce',
			'analytics/compare',
			'analytics/seo',
			'analytics/support',
			'analytics/content',
			'analytics/month-summary',
		);
		return in_array( $path, $allowed, true );
	}

	/**
	 * admin-ajax proxy for analytics REST (CDN/WAF-safe). Always HTTP 200 envelope.
	 *
	 * @return void
	 */
	public static function ajax_analytics_rest() {
		if ( ! check_ajax_referer( 'wp_rest', 'nonce', false ) ) {
			wp_send_json_error(
				array(
					'message' => 'Invalid nonce',
					'code'    => 'invalid_nonce',
				)
			);
		}
		if ( ! is_user_logged_in() || ! self::perm_admin() ) {
			wp_send_json_error(
				array(
					'message' => 'Forbidden',
					'code'    => 'forbidden',
				)
			);
		}

		$rest_path = isset( $_POST['rest_path'] ) // phpcs:ignore WordPress.Security.NonceVerification.Missing -- checked above.
			? sanitize_text_field( wp_unslash( (string) $_POST['rest_path'] ) )
			: '';
		$rest_path = ltrim( $rest_path, '/' );

		if ( ! self::is_ajax_proxy_path_allowed( $rest_path ) ) {
			wp_send_json_error(
				array(
					'message' => 'Path not allowed',
					'code'    => 'path_not_allowed',
				)
			);
		}

		$method = isset( $_POST['rest_method'] ) // phpcs:ignore WordPress.Security.NonceVerification.Missing
			? strtoupper( sanitize_text_field( wp_unslash( (string) $_POST['rest_method'] ) ) )
			: 'GET';
		if ( ! in_array( $method, array( 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ), true ) ) {
			$method = 'GET';
		}

		$query = array();
		if ( isset( $_POST['rest_query'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$raw_q = wp_unslash( (string) $_POST['rest_query'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
			parse_str( ltrim( $raw_q, '?' ), $parsed );
			if ( is_array( $parsed ) ) {
				$query = $parsed;
			}
		}

		$route = '/' . self::NS . '/' . $rest_path;
		$req   = new WP_REST_Request( $method, $route );
		foreach ( $query as $key => $value ) {
			$req->set_param( (string) $key, $value );
		}

		if ( in_array( $method, array( 'POST', 'PUT', 'PATCH', 'DELETE' ), true ) && isset( $_POST['payload'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$raw = wp_unslash( (string) $_POST['payload'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
			if ( '' !== $raw ) {
				$req->set_body( $raw );
				$req->set_header( 'Content-Type', 'application/json' );
				$decoded = json_decode( $raw, true );
				if ( is_array( $decoded ) ) {
					$req->set_body_params( $decoded );
				}
			}
		}

		$response = rest_do_request( $req );
		if ( $response->is_error() ) {
			$err = $response->as_error();
			wp_send_json_error(
				array(
					'message' => $err->get_error_message(),
					'code'    => $err->get_error_code(),
				)
			);
		}

		wp_send_json_success( $response->get_data() );
	}

	/**
	 * Public analytics hit via admin-ajax (token-gated).
	 *
	 * @return void
	 */
	public static function ajax_analytics_hit() {
		$settings = Webino_Dashboard_Analytics::get_settings();
		$token    = isset( $_REQUEST['token'] ) // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- token auth.
			? sanitize_text_field( wp_unslash( (string) $_REQUEST['token'] ) )
			: '';
		if ( '' === $token || ! hash_equals( (string) $settings['hit_token'], $token ) ) {
			wp_send_json_error(
				array(
					'message' => 'Forbidden',
					'code'    => 'forbidden',
				),
				403
			);
		}

		$body = array();
		if ( isset( $_POST['payload'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- token auth.
			$raw = wp_unslash( (string) $_POST['payload'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
			$decoded = json_decode( $raw, true );
			if ( is_array( $decoded ) ) {
				$body = $decoded;
			}
		} else {
			foreach ( array( 'uri', 'referrer', 'title', 'utm_source', 'utm_medium', 'utm_campaign' ) as $key ) {
				if ( isset( $_POST[ $key ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- token auth.
					$body[ $key ] = sanitize_text_field( wp_unslash( (string) $_POST[ $key ] ) );
				}
			}
		}

		$result = Webino_Dashboard_Analytics_Tracker::record( $body );
		if ( is_wp_error( $result ) ) {
			$code = (int) ( $result->get_error_data()['status'] ?? 400 );
			if ( 200 === $code ) {
				wp_send_json_success( array( 'ok' => true, 'skipped' => true ) );
			}
			wp_send_json_error(
				array(
					'message' => $result->get_error_message(),
					'code'    => $result->get_error_code(),
				),
				$code > 0 ? $code : 400
			);
		}

		wp_send_json_success( array( 'ok' => true ) );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/analytics/hit',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'hit' ),
				'permission_callback' => '__return_true',
			)
		);

		$admin = array(
			'permission_callback' => array( __CLASS__, 'perm_admin' ),
		);

		register_rest_route(
			self::NS,
			'/analytics/overview',
			array_merge(
				$admin,
				array(
					'methods'  => 'GET',
					'callback' => array( __CLASS__, 'overview' ),
				)
			)
		);

		register_rest_route(
			self::NS,
			'/analytics/visitors',
			array_merge(
				$admin,
				array(
					'methods'  => 'GET',
					'callback' => array( __CLASS__, 'visitors' ),
				)
			)
		);

		register_rest_route(
			self::NS,
			'/analytics/pages',
			array_merge(
				$admin,
				array(
					'methods'  => 'GET',
					'callback' => array( __CLASS__, 'pages' ),
				)
			)
		);

		register_rest_route(
			self::NS,
			'/analytics/referrals',
			array_merge(
				$admin,
				array(
					'methods'  => 'GET',
					'callback' => array( __CLASS__, 'referrals' ),
				)
			)
		);

		register_rest_route(
			self::NS,
			'/analytics/geo',
			array_merge(
				$admin,
				array(
					'methods'  => 'GET',
					'callback' => array( __CLASS__, 'geo' ),
				)
			)
		);

		register_rest_route(
			self::NS,
			'/analytics/devices',
			array_merge(
				$admin,
				array(
					'methods'  => 'GET',
					'callback' => array( __CLASS__, 'devices' ),
				)
			)
		);

		register_rest_route(
			self::NS,
			'/analytics/online',
			array_merge(
				$admin,
				array(
					'methods'  => 'GET',
					'callback' => array( __CLASS__, 'online' ),
				)
			)
		);

		register_rest_route(
			self::NS,
			'/analytics/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'get_settings' ),
					'permission_callback' => array( __CLASS__, 'perm_settings' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'save_settings' ),
					'permission_callback' => array( __CLASS__, 'perm_settings' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/analytics/purge-cache',
			array_merge(
				$admin,
				array(
					'methods'  => 'POST',
					'callback' => array( __CLASS__, 'purge_cache' ),
				)
			)
		);

		foreach ( array( 'commerce', 'compare', 'seo', 'support', 'content' ) as $kpi ) {
			register_rest_route(
				self::NS,
				'/analytics/' . $kpi,
				array_merge(
					$admin,
					array(
						'methods'  => 'GET',
						'callback' => array( __CLASS__, $kpi ),
					)
				)
			);
		}

		register_rest_route(
			self::NS,
			'/analytics/month-summary',
			array_merge(
				$admin,
				array(
					'methods'  => 'GET',
					'callback' => array( __CLASS__, 'month_summary' ),
				)
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function perm_admin() {
		if ( ! Webino_Dashboard_Analytics::is_module_active() ) {
			return false;
		}
		return Webino_Dashboard_Rest_Base::can_view_analytics();
	}

	/**
	 * @return bool
	 */
	public static function perm_settings() {
		return Webino_Dashboard_Rest_Base::can( 'manage_options' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function hit( WP_REST_Request $request ) {
		$settings = Webino_Dashboard_Analytics::get_settings();
		$token    = (string) $request->get_param( 'token' );
		if ( '' === $token ) {
			$token = (string) $request->get_header( 'X-Webino-Analytics-Token' );
		}
		if ( ! hash_equals( (string) $settings['hit_token'], $token ) ) {
			return new WP_Error( 'forbidden', __( 'Invalid token.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}

		$result = Webino_Dashboard_Analytics_Tracker::record( $body );
		if ( is_wp_error( $result ) ) {
			$code = (int) ( $result->get_error_data()['status'] ?? 400 );
			if ( 200 === $code ) {
				return new WP_REST_Response( array( 'ok' => true, 'skipped' => true ) );
			}
			return $result;
		}

		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @return void
	 */
	private static function ensure_ready() {
		Webino_Dashboard_Analytics_Db::ensure_tables();
	}

	/**
	 * @param string            $endpoint Endpoint slug.
	 * @param WP_REST_Request   $request  Request.
	 * @param callable():array  $builder  Payload builder.
	 * @return WP_REST_Response
	 */
	private static function cached_response( $endpoint, WP_REST_Request $request, callable $builder, $ttl = null ) {
		$key    = self::cache_key( $endpoint, $request );
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			return new WP_REST_Response( $cached );
		}
		$data      = $builder();
		$cache_ttl = null !== $ttl ? max( 5, (int) $ttl ) : self::CACHE_TTL;
		if ( is_array( $data ) ) {
			set_transient( $key, $data, $cache_ttl );
		}
		return new WP_REST_Response( $data );
	}

	/**
	 * @param string          $endpoint Endpoint slug.
	 * @param WP_REST_Request $request  Request.
	 * @return string
	 */
	private static function cache_key( $endpoint, WP_REST_Request $request ) {
		$parts = array( $endpoint );
		foreach ( array( 'from', 'to', 'days', 'page', 'per_page', 'search', 'dim' ) as $param ) {
			$val = $request->get_param( $param );
			if ( null !== $val && '' !== $val ) {
				$parts[] = $param . '=' . (string) $val;
			}
		}
		return self::CACHE_PREFIX . md5( implode( '|', $parts ) );
	}

	/**
	 * @return void
	 */
	private static function flush_read_cache() {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
				$wpdb->esc_like( '_transient_' . self::CACHE_PREFIX ) . '%',
				$wpdb->esc_like( '_transient_timeout_' . self::CACHE_PREFIX ) . '%'
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function overview( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'overview',
			$request,
			function () use ( $request ) {
				$range = self::parse_range( $request );
				$data  = Webino_Dashboard_Analytics_Query::overview( $range['from'], $range['to'] );
				return array_merge( $range, $data );
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function visitors( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'visitors',
			$request,
			function () use ( $request ) {
				$range = self::parse_range( $request );
				return array(
					'from'         => $range['from'],
					'to'           => $range['to'],
					'source'       => Webino_Dashboard_Analytics::data_source(),
					'top_visitors' => Webino_Dashboard_Analytics_Query::top_visitors( $range['from'], $range['to'] ),
					'online'       => Webino_Dashboard_Analytics_Query::online_visitors(),
					'series'       => Webino_Dashboard_Analytics_Query::overview( $range['from'], $range['to'] )['series'],
				);
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function pages( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'pages',
			$request,
			function () use ( $request ) {
				$range  = self::parse_range( $request );
				$page   = max( 1, (int) $request->get_param( 'page' ) );
				$pp     = max( 1, min( 100, (int) $request->get_param( 'per_page' ) ) );
				if ( ! $request->get_param( 'per_page' ) ) {
					$pp = 20;
				}
				$search = (string) $request->get_param( 'search' );
				$data   = Webino_Dashboard_Analytics_Query::top_pages( $range['from'], $range['to'], $page, $pp, $search );
				return array_merge(
					$range,
					array(
						'source'   => Webino_Dashboard_Analytics::data_source(),
						'page'     => $page,
						'per_page' => $pp,
						'items'    => $data['items'],
						'total'    => $data['total'],
					)
				);
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function referrals( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'referrals',
			$request,
			function () use ( $request ) {
				$range = self::parse_range( $request );
				return array_merge(
					$range,
					array( 'source' => Webino_Dashboard_Analytics::data_source() ),
					Webino_Dashboard_Analytics_Query::referrers( $range['from'], $range['to'] )
				);
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function geo( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'geo',
			$request,
			function () use ( $request ) {
				$range = self::parse_range( $request );
				$dim   = sanitize_key( (string) $request->get_param( 'dim' ) );
				return array_merge(
					$range,
					array(
						'source' => Webino_Dashboard_Analytics::data_source(),
						'dim'    => $dim ? $dim : 'country',
						'items'  => Webino_Dashboard_Analytics_Query::geo( $range['from'], $range['to'], $dim ),
					)
				);
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function devices( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'devices',
			$request,
			function () use ( $request ) {
				$range = self::parse_range( $request );
				$dim   = sanitize_key( (string) $request->get_param( 'dim' ) );
				return array_merge(
					$range,
					array(
						'source' => Webino_Dashboard_Analytics::data_source(),
						'dim'    => $dim ? $dim : 'browser',
						'items'  => Webino_Dashboard_Analytics_Query::devices( $range['from'], $range['to'], $dim ),
					)
				);
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function online( WP_REST_Request $request = null ) {
		self::ensure_ready();
		$req = $request instanceof WP_REST_Request ? $request : new WP_REST_Request( 'GET' );
		return self::cached_response(
			'online',
			$req,
			static function () {
				return array(
					'source'   => Webino_Dashboard_Analytics::data_source(),
					'count'    => Webino_Dashboard_Analytics_Query::online_count(),
					'visitors' => Webino_Dashboard_Analytics_Query::online_visitors(),
				);
			},
			self::CACHE_TTL_ONLINE
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function get_settings() {
		$s = Webino_Dashboard_Analytics::get_settings();
		unset( $s['hit_token'], $s['daily_salt'] );
		$roles = array_keys( get_editable_roles() );
		return new WP_REST_Response(
			array(
				'settings'       => $s,
				'editable_roles' => $roles,
				'source'         => Webino_Dashboard_Analytics::data_source(),
				'wp_statistics'  => class_exists( 'Webino_Dashboard_Analytics_Wp_Statistics', false )
					&& Webino_Dashboard_Analytics_Wp_Statistics::is_active(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function save_settings( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$payload = isset( $body['settings'] ) && is_array( $body['settings'] ) ? $body['settings'] : $body;
		$next    = Webino_Dashboard_Analytics::sanitize_settings( $payload );
		update_option( Webino_Dashboard_Analytics::OPTION_SETTINGS, $next, false );
		if ( ! empty( $next['bypass_adblocker'] ) ) {
			Webino_Dashboard_Analytics::ensure_bypass_tracker_file();
		}
		return self::get_settings();
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function purge_cache() {
		self::ensure_ready();
		self::flush_read_cache();
		$days = Webino_Dashboard_Analytics_Cron::rebuild_all();
		Webino_Dashboard_Analytics_Cron::purge_old_events();
		return new WP_REST_Response(
			array(
				'ok'            => true,
				'days_rebuilt'  => $days,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return array{from: string, to: string, from_ts: int, to_ts: int}
	 */
	private static function parse_range( WP_REST_Request $request ) {
		$from_ts = (int) $request->get_param( 'from' );
		$to_ts   = (int) $request->get_param( 'to' );
		if ( ! $to_ts ) {
			$to_ts = time();
		}
		if ( ! $from_ts ) {
			$days    = max( 1, min( 365, (int) $request->get_param( 'days' ) ) );
			$from_ts = $to_ts - ( $days ? $days : 30 ) * DAY_IN_SECONDS;
		}
		$range = Webino_Dashboard_Analytics_Query::date_range( $from_ts, $to_ts );
		return array(
			'from'    => $range['from'],
			'to'      => $range['to'],
			'from_ts' => $from_ts,
			'to_ts'   => $to_ts,
		);
	}

	/**
	 * Default to current calendar month when from/to omitted.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return array{from:string,to:string}
	 */
	private static function parse_month_or_range( WP_REST_Request $request ) {
		$from = sanitize_text_field( (string) $request->get_param( 'from_day' ) );
		$to   = sanitize_text_field( (string) $request->get_param( 'to_day' ) );
		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $from ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $to ) ) {
			return array( 'from' => $from, 'to' => $to );
		}
		if ( $request->get_param( 'from' ) || $request->get_param( 'to' ) || $request->get_param( 'days' ) ) {
			$r = self::parse_range( $request );
			return array( 'from' => $r['from'], 'to' => $r['to'] );
		}
		$m = Webino_Dashboard_Analytics_Kpis::calendar_month_bounds( 0 );
		return array( 'from' => $m['from'], 'to' => $m['to'] );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function commerce( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'commerce',
			$request,
			static function () use ( $request ) {
				$r = self::parse_month_or_range( $request );
				return Webino_Dashboard_Analytics_Kpis::commerce( $r['from'], $r['to'] );
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function compare( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'compare',
			$request,
			static function () use ( $request ) {
				$r = self::parse_month_or_range( $request );
				return Webino_Dashboard_Analytics_Kpis::compare( $r['from'], $r['to'] );
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function seo( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'seo',
			$request,
			static function () use ( $request ) {
				$r = self::parse_month_or_range( $request );
				return Webino_Dashboard_Analytics_Kpis::seo( $r['from'], $r['to'] );
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function support( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'support',
			$request,
			static function () use ( $request ) {
				$r = self::parse_month_or_range( $request );
				return Webino_Dashboard_Analytics_Kpis::support( $r['from'], $r['to'] );
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function content( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'content',
			$request,
			static function () use ( $request ) {
				$r = self::parse_month_or_range( $request );
				return Webino_Dashboard_Analytics_Kpis::content( $r['from'], $r['to'] );
			}
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function month_summary( WP_REST_Request $request ) {
		self::ensure_ready();
		return self::cached_response(
			'month-summary',
			$request,
			static function () use ( $request ) {
				$r = self::parse_month_or_range( $request );
				return Webino_Dashboard_Analytics_Kpis::month_summary( $r['from'], $r['to'] );
			}
		);
	}
}
