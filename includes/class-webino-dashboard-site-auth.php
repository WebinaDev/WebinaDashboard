<?php
/**
 * Per-site HMAC auth for Dashboard → WebinoERP Edge calls.
 *
 * Enrollment: the site sends a one-time `pending` token to ERP /site-auth/enroll; ERP generates
 * the secret and POSTs it back to this site's REST route (proof the site controls its domain).
 * Afterwards every request to `/api/webinocrm/v1/*` on the ERP host is signed:
 *   X-Webino-Site, X-Webino-Ts, X-Webino-Nonce,
 *   X-Webino-Signature = HMAC-SHA256(secret, "v1\nMETHOD\n/path\ndomain\nts\nnonce\nsha256(body)")
 *
 * @package Webino_Dashboard
 */

defined( 'ABSPATH' ) || exit;

final class Webino_Dashboard_Site_Auth {

	const OPTION_SECRET   = 'webino_dashboard_site_auth_secret';
	const TRANSIENT_PEND  = 'webino_dashboard_site_auth_pending';
	const TRANSIENT_LOCK  = 'webino_dashboard_site_auth_enroll_lock';
	const CRON_HOOK       = 'webino_dashboard_site_auth_enroll';
	const EDGE_PATH_PREFIX = '/api/webinocrm/v1/';

	/** @var bool */
	private static $enrolling = false;

	public static function init() {
		add_filter( 'http_request_args', array( __CLASS__, 'sign_request' ), 20, 2 );
		add_filter( 'http_response', array( __CLASS__, 'watch_response' ), 10, 3 );
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_action( 'admin_init', array( __CLASS__, 'maybe_enroll' ) );
		add_action( self::CRON_HOOK, array( __CLASS__, 'maybe_enroll' ) );
		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( time() + 120, 'twicedaily', self::CRON_HOOK );
		}
	}

	/** @return string */
	public static function secret() {
		return (string) get_option( self::OPTION_SECRET, '' );
	}

	/** @return string */
	public static function site_domain() {
		$host = wp_parse_url( home_url(), PHP_URL_HOST );
		$host = strtolower( is_string( $host ) ? $host : '' );
		if ( 0 === strpos( $host, 'www.' ) ) {
			$host = substr( $host, 4 );
		}
		return rtrim( $host, '.' );
	}

	/** @return list<string> */
	private static function erp_hosts() {
		$hosts = array( 'webina.dev', 'webinaagency.ir' );
		foreach ( array( 'WEBINO_DASHBOARD_VENDOR_URL', 'WEBINO_DASHBOARD_VENDOR_FALLBACK_URL' ) as $const ) {
			if ( defined( $const ) ) {
				$h = wp_parse_url( (string) constant( $const ), PHP_URL_HOST );
				if ( is_string( $h ) && '' !== $h ) {
					$hosts[] = strtolower( $h );
				}
			}
		}
		/** @param list<string> $hosts ERP hosts whose Edge calls get signed. */
		return array_values( array_unique( (array) apply_filters( 'webino_dashboard_site_auth_erp_hosts', $hosts ) ) );
	}

	/**
	 * @param string $url URL.
	 * @return string|null Edge path when the URL is an ERP Edge call.
	 */
	private static function edge_path( $url ) {
		$parts = wp_parse_url( (string) $url );
		if ( ! is_array( $parts ) || empty( $parts['host'] ) || empty( $parts['path'] ) ) {
			return null;
		}
		$host = strtolower( (string) $parts['host'] );
		if ( 0 === strpos( $host, 'www.' ) ) {
			$host = substr( $host, 4 );
		}
		if ( ! in_array( $host, self::erp_hosts(), true ) ) {
			return null;
		}
		$path = (string) $parts['path'];
		return 0 === strpos( $path, self::EDGE_PATH_PREFIX ) ? $path : null;
	}

	/**
	 * @param array<string,mixed> $args HTTP args.
	 * @param string              $url  URL.
	 * @return array<string,mixed>
	 */
	public static function sign_request( $args, $url ) {
		$path = self::edge_path( $url );
		$secret = self::secret();
		if ( null === $path || '' === $secret ) {
			return $args;
		}
		$method = strtoupper( isset( $args['method'] ) ? (string) $args['method'] : 'GET' );
		$body   = isset( $args['body'] ) ? $args['body'] : '';
		if ( is_array( $body ) || is_object( $body ) ) {
			// Encode here so the signed bytes are exactly the bytes sent.
			$body         = http_build_query( (array) $body, '', '&' );
			$args['body'] = $body;
			$headers      = isset( $args['headers'] ) && is_array( $args['headers'] ) ? $args['headers'] : array();
			$has_type     = false;
			foreach ( array_keys( $headers ) as $k ) {
				if ( 'content-type' === strtolower( (string) $k ) ) {
					$has_type = true;
				}
			}
			if ( ! $has_type ) {
				$headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=' . get_option( 'blog_charset', 'UTF-8' );
			}
			$args['headers'] = $headers;
		}
		$body   = in_array( $method, array( 'GET', 'HEAD' ), true ) ? '' : (string) $body;
		if ( in_array( $method, array( 'GET', 'HEAD' ), true ) ) {
			$args['body'] = null;
		}
		$domain = self::site_domain();
		$ts     = (string) time();
		$nonce  = wp_generate_password( 32, false, false );
		$canon  = implode( "\n", array( 'v1', $method, '/' . ltrim( $path, '/' ), $domain, $ts, $nonce, hash( 'sha256', $body ) ) );

		$headers                       = isset( $args['headers'] ) && is_array( $args['headers'] ) ? $args['headers'] : array();
		$headers['X-Webino-Site']      = $domain;
		$headers['X-Webino-Ts']        = $ts;
		$headers['X-Webino-Nonce']     = $nonce;
		$headers['X-Webino-Signature'] = hash_hmac( 'sha256', $canon, $secret );
		$args['headers']               = $headers;
		return $args;
	}

	/**
	 * ERP says our key is unknown/invalid (e.g. admin reset): drop it so we re-enroll.
	 *
	 * @param array|WP_Error      $response Response.
	 * @param array<string,mixed> $args     Args.
	 * @param string              $url      URL.
	 * @return array|WP_Error
	 */
	public static function watch_response( $response, $args, $url ) {
		if ( is_wp_error( $response ) || null === self::edge_path( $url ) || '' === self::secret() ) {
			return $response;
		}
		if ( 401 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return $response;
		}
		$data = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		if ( is_array( $data ) && isset( $data['code'] ) && 'invalid_signature' === $data['code'] && empty( $args['_webino_site_auth_probe'] ) ) {
			// Confirm with a fresh signed probe before dropping the key (a single replay/clock glitch must not unenroll).
			$probe = wp_remote_get(
				untrailingslashit( WEBINO_DASHBOARD_VENDOR_URL ) . self::EDGE_PATH_PREFIX . 'site-auth/status',
				array( 'timeout' => 10, '_webino_site_auth_probe' => true )
			);
			if ( ! is_wp_error( $probe ) && 401 === (int) wp_remote_retrieve_response_code( $probe ) ) {
				delete_option( self::OPTION_SECRET );
				delete_transient( self::TRANSIENT_LOCK );
			}
		}
		return $response;
	}

	public static function register_routes() {
		register_rest_route(
			'webino-dashboard/v1',
			'/site-auth/receive',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true', // Authenticated by the one-time pending token.
				'callback'            => array( __CLASS__, 'receive' ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function receive( $request ) {
		$pending  = (string) $request->get_param( 'pending' );
		$secret   = (string) $request->get_param( 'secret' );
		$expected = (string) get_transient( self::TRANSIENT_PEND );
		if ( '' === $expected || '' === $pending || ! hash_equals( $expected, $pending ) || strlen( $secret ) < 32 ) {
			return new WP_REST_Response( array( 'ok' => false ), 403 );
		}
		delete_transient( self::TRANSIENT_PEND );
		update_option( self::OPTION_SECRET, $secret, false );
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	/**
	 * Enroll when no key is stored. Rate-limited; safe to call often.
	 *
	 * @param bool $force Ignore the retry lock.
	 * @return bool|WP_Error
	 */
	public static function maybe_enroll( $force = false ) {
		if ( self::$enrolling || ( '' !== self::secret() && true !== $force ) ) {
			return true;
		}
		if ( true !== $force && get_transient( self::TRANSIENT_LOCK ) ) {
			return false;
		}
		set_transient( self::TRANSIENT_LOCK, 1, 6 * HOUR_IN_SECONDS );
		self::$enrolling = true;
		$pending         = wp_generate_password( 48, false, false );
		set_transient( self::TRANSIENT_PEND, $pending, 10 * MINUTE_IN_SECONDS );

		$response = wp_remote_post(
			untrailingslashit( WEBINO_DASHBOARD_VENDOR_URL ) . self::EDGE_PATH_PREFIX . 'site-auth/enroll',
			array(
				'timeout' => 30,
				'headers' => array(
					'Content-Type' => 'application/json',
					'Accept'       => 'application/json',
				),
				'body'    => wp_json_encode(
					array(
						'domain'      => self::site_domain(),
						'receive_url' => rest_url( 'webino-dashboard/v1/site-auth/receive' ),
						'pending'     => $pending,
					)
				),
			)
		);
		self::$enrolling = false;

		if ( is_wp_error( $response ) ) {
			return $response;
		}
		$code = (int) wp_remote_retrieve_response_code( $response );
		return ( $code >= 200 && $code < 300 && '' !== self::secret() )
			? true
			: new WP_Error( 'webino_site_auth_enroll', 'Site auth enrollment failed (HTTP ' . $code . ').' );
	}
}
