<?php
/**
 * Outbound license checks to webina.dev (CRM) — separate from inbound CRM→site REST.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Persists CRM license state, schedules periodic checks, exposes bootstrap payload.
 */
final class Webino_Dashboard_License {

	const CRON_HOOK = 'webino_dashboard_license_cron';

	const TABLE_ROW_ID = 1;

	/** Soft nag option: first time license became inactive (unix timestamp). */
	const NAG_SINCE_OPTION = 'webino_dashboard_license_nag_since';

	/** Days of soft banner before forcing the license page. */
	const NAG_FORCE_DAYS = 2;

	/**
	 * @var self|null
	 */
	private static $instance = null;

	/**
	 * @var bool
	 */
	private static $checked_this_request = false;

	/**
	 * @var array<string,mixed>|null
	 */
	private $row_cache = null;

	/**
	 * @return self
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'plugins_loaded', array( $this, 'ensure_license_table' ), 3 );
		add_action( 'init', array( $this, 'maybe_schedule_cron' ), 5 );
		add_action( self::CRON_HOOK, array( $this, 'cron_check' ) );
		add_action( 'wp_ajax_nopriv_webino_dashboard_license_webhook', array( $this, 'ajax_webhook_stub' ) );
		add_action( 'wp_ajax_webino_dashboard_license_webhook', array( $this, 'ajax_webhook_stub' ) );
		add_action( 'wp_ajax_nopriv_maneli_license_webhook', array( $this, 'ajax_crm_webhook' ) );
		add_action( 'wp_ajax_maneli_license_webhook', array( $this, 'ajax_crm_webhook' ) );
	}

	/**
	 * @return void
	 */
	public function ensure_license_table() {
		global $wpdb;
		$table = self::table_name();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( $wpdb->get_var( "SHOW TABLES LIKE '" . esc_sql( $table ) . "'" ) === $table ) {
			return;
		}
		Webino_Dashboard_Install::ensure_dashboard_license_table();
	}

	/**
	 * @return string
	 */
	public static function table_name() {
		global $wpdb;
		return $wpdb->prefix . 'webino_dashboard_license';
	}

	/**
	 * @return void
	 */
	public function maybe_schedule_cron() {
		if ( wp_next_scheduled( self::CRON_HOOK ) ) {
			return;
		}
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'webino_dashboard_license_12h', self::CRON_HOOK );
	}

	/**
	 * @return void
	 */
	public function cron_check() {
		$this->remote_license_check( true, 'cron' );
	}

	/**
	 * TTL (seconds) before bootstrap triggers an outbound CRM sync.
	 * Default 12h — aligned with cron; avoid CRM spam on every dashboard load.
	 *
	 * @return int
	 */
	public function bootstrap_sync_ttl() {
		return max( 60, (int) apply_filters( 'webino_dashboard_license_bootstrap_sync_ttl', 12 * HOUR_IN_SECONDS ) );
	}

	/**
	 * Whether local license row has no recent CRM check.
	 *
	 * @return bool
	 */
	public function is_license_check_stale() {
		$row  = $this->get_row();
		$last = isset( $row['last_check'] ) ? (string) $row['last_check'] : '';
		if ( '' === $last ) {
			return true;
		}
		$ts = strtotime( $last );
		if ( ! $ts ) {
			return true;
		}
		return ( time() - $ts ) >= $this->bootstrap_sync_ttl();
	}

	/**
	 * Outbound CRM sync when local cache is stale (once per request).
	 *
	 * @param string $context install|bootstrap|gate|sync.
	 * @return void
	 */
	public function maybe_sync_if_stale( $context = 'bootstrap' ) {
		if ( ! $this->is_license_check_stale() ) {
			return;
		}
		$this->check_license_status( true, $context );
	}

	/**
	 * Optional CRM webhook (extend via filter).
	 *
	 * @return void
	 */
	public function ajax_webhook_stub() {
		$allow = apply_filters( 'webino_dashboard_license_webhook_enabled', false );
		if ( ! $allow || ! $this->verify_inbound_webhook_secret() ) {
			wp_die( '', '', 403 );
		}
		do_action( 'webino_dashboard_license_webhook' );
		wp_die( 'ok', '', 200 );
	}

	/**
	 * Whether this host is treated as production (webhook secret required).
	 *
	 * @return bool
	 */
	private function is_production_host() {
		if ( class_exists( 'Webino_Dashboard_Build_Pipeline', false ) && Webino_Dashboard_Build_Pipeline::is_dev_environment() ) {
			return false;
		}
		if ( defined( 'WEBINO_DASHBOARD_ALLOW_BUILD_PIPELINE' ) && WEBINO_DASHBOARD_ALLOW_BUILD_PIPELINE ) {
			return false;
		}
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			return false;
		}
		$host = isset( $_SERVER['HTTP_HOST'] ) ? strtolower( (string) wp_unslash( (string) $_SERVER['HTTP_HOST'] ) ) : '';
		if ( '' === $host ) {
			$host = strtolower( (string) wp_parse_url( home_url(), PHP_URL_HOST ) );
		}
		if ( '' === $host ) {
			return true;
		}
		$host = preg_replace( '/:\d+$/', '', $host );
		if ( in_array( $host, array( 'localhost', '127.0.0.1', '::1' ), true ) ) {
			return false;
		}
		if ( preg_match( '/\.(local|test)$/', $host ) ) {
			return false;
		}
		return true;
	}

	/**
	 * Optional shared secret for inbound CRM webhooks (header X-Webino-Webhook-Secret).
	 *
	 * @return bool True when no secret is configured or header matches.
	 */
	private function verify_inbound_webhook_secret() {
		$secret = apply_filters(
			'webino_dashboard_license_webhook_secret',
			defined( 'WEBINO_DASHBOARD_LICENSE_WEBHOOK_SECRET' ) ? WEBINO_DASHBOARD_LICENSE_WEBHOOK_SECRET : ''
		);
		$secret = trim( (string) $secret );
		if ( '' === $secret ) {
			if ( $this->is_production_host() && ! (bool) apply_filters( 'webino_dashboard_allow_open_webhook', false ) ) {
				return false;
			}
			return true;
		}
		$hdr = '';
		if ( isset( $_SERVER['HTTP_X_WEBINO_WEBHOOK_SECRET'] ) ) {
			$hdr = sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_X_WEBINO_WEBHOOK_SECRET'] ) );
		}
		return hash_equals( $secret, $hdr );
	}

	/**
	 * Inbound webhook from WebinoCRM (legacy action name).
	 *
	 * @return void
	 */
	public function ajax_crm_webhook() {
		if ( ! class_exists( 'Webino_Dashboard_Rest_Base', false ) || ! Webino_Dashboard_Rest_Base::rate_limit_ok( 'license_webhook', 30, 300 ) ) {
			wp_die( '', '', 429 );
		}

		if ( ! $this->verify_inbound_webhook_secret() ) {
			wp_die( '', '', 403 );
		}

		$domain = isset( $_POST['domain'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['domain'] ) ) : '';
		$type   = isset( $_POST['action_type'] ) ? sanitize_key( wp_unslash( (string) $_POST['action_type'] ) ) : '';
		$cur    = $this->get_current_domain();
		if ( '' === $domain || $this->normalize_site_domain( $domain ) !== $cur ) {
			wp_die( '', '', 403 );
		}

		// Never trust inbound POST body for license state — refresh from CRM outbound check.
		$this->remote_license_check( true, 'webhook' );
		do_action( 'webino_dashboard_license_webhook', $type, $domain );
		wp_die( 'ok', '', 200 );
	}

	/**
	 * Hostname for CRM (no scheme/path, www stripped).
	 *
	 * @return string
	 */
	/**
	 * Normalize host for license row vs site (strip scheme/path, lowercase, drop leading www).
	 *
	 * @param string $host Host or URL fragment from CRM/DB.
	 * @return string
	 */
	public function normalize_site_domain( $host ) {
		$host = trim( (string) $host );
		if ( '' === $host ) {
			return '';
		}
		if ( false !== strpos( $host, '://' ) || 0 === strpos( $host, '//' ) ) {
			$parsed = wp_parse_url( 0 === strpos( $host, '//' ) ? 'https:' . $host : $host, PHP_URL_HOST );
			$host   = is_string( $parsed ) ? $parsed : $host;
		}
		$host = strtolower( $host );
		if ( 0 === strpos( $host, 'www.' ) ) {
			$host = substr( $host, 4 );
		}
		$slash = strpos( $host, '/' );
		if ( false !== $slash ) {
			$host = substr( $host, 0, $slash );
		}
		return $host;
	}

	/**
	 * @return string
	 */
	public function get_current_domain() {
		$host = wp_parse_url( home_url(), PHP_URL_HOST );
		return $this->normalize_site_domain( is_string( $host ) ? $host : '' );
	}

	/**
	 * @return list<string>
	 */
	public function get_server_urls() {
		$urls = array( WEBINO_DASHBOARD_VENDOR_URL );
		if ( (bool) apply_filters( 'webino_dashboard_license_allow_http_fallback', false ) ) {
			$urls[] = 'http://' . WEBINO_DASHBOARD_VENDOR_HOST;
		}
		/**
		 * License CRM base URLs (no trailing path). HTTPS first, then HTTP when allowed.
		 *
		 * @param list<string> $urls Base URLs.
		 */
		$urls = apply_filters( 'webino_dashboard_license_server_urls', $urls );
		$https = array();
		$http  = array();
		foreach ( (array) $urls as $u ) {
			$u = esc_url_raw( (string) $u );
			if ( ! $u ) {
				continue;
			}
			$u = untrailingslashit( $u );
			if ( 0 === strpos( $u, 'https://' ) ) {
				$https[] = $u;
			} elseif ( 0 === strpos( $u, 'http://' ) ) {
				$http[] = $u;
			}
		}
		return array_values( array_unique( array_merge( $https, $http ) ) );
	}

	/**
	 * CRM public hostname (for Host header on local-NIC bypass).
	 *
	 * @return string
	 */
	private function crm_public_host() {
		foreach ( $this->get_server_urls() as $u ) {
			$h = wp_parse_url( $u, PHP_URL_HOST );
			if ( is_string( $h ) && '' !== $h ) {
				return $h;
			}
		}
		return WEBINO_DASHBOARD_VENDOR_HOST;
	}

	/**
	 * Local NIC base when CRM and site share one server (avoids hairpin NAT).
	 *
	 * @return string Empty when bypass disabled or SERVER_ADDR unavailable.
	 */
	private function local_bypass_base() {
		if ( (bool) apply_filters( 'webino_dashboard_license_disable_local_bypass', false ) ) {
			return '';
		}
		$addr = isset( $_SERVER['SERVER_ADDR'] ) ? (string) $_SERVER['SERVER_ADDR'] : '';
		if ( '' === $addr || ! filter_var( $addr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
			return '';
		}
		return 'https://' . $addr;
	}

	/**
	 * @param string $base Request base URL.
	 * @return bool
	 */
	private function is_local_bypass_base( $base ) {
		$host = wp_parse_url( (string) $base, PHP_URL_HOST );
		return is_string( $host ) && filter_var( $host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 );
	}

	/**
	 * True when this WordPress install resolves to the same IP as the CRM host.
	 *
	 * @return bool
	 */
	private function is_same_server_as_crm() {
		if ( (bool) apply_filters( 'webino_dashboard_license_disable_local_bypass', false ) ) {
			return false;
		}
		$crm_host  = $this->crm_public_host();
		$site_host = wp_parse_url( home_url(), PHP_URL_HOST );
		if ( ! $crm_host || ! is_string( $site_host ) || '' === $site_host ) {
			return false;
		}
		$crm_ip  = gethostbyname( $crm_host );
		$site_ip = gethostbyname( $site_host );
		if ( ! $crm_ip || ! $site_ip || $crm_ip === $crm_host || $site_ip === $site_host ) {
			return false;
		}
		return $crm_ip === $site_ip;
	}

	/**
	 * CRM bases to try: local NIC first on same server, then public HTTPS/HTTP.
	 *
	 * @return list<string>
	 */
	private function get_request_bases() {
		$public = $this->get_server_urls();
		if ( ! $this->is_same_server_as_crm() ) {
			return $public;
		}
		$local = $this->local_bypass_base();
		if ( '' === $local ) {
			return $public;
		}
		return array_values( array_unique( array_merge( array( $local ), $public ) ) );
	}

	/**
	 * @return bool
	 */
	public function verify_ssl() {
		/**
		 * Whether to verify SSL for outbound license HTTP requests.
		 *
		 * @param bool $verify Default true.
		 */
		return (bool) apply_filters( 'webino_dashboard_license_verify_ssl', true );
	}

	/**
	 * Whether local NIC bypass may disable TLS verification (dev-only).
	 *
	 * @return bool
	 */
	private function allows_insecure_local_bypass() {
		return (bool) apply_filters( 'webino_dashboard_license_allow_insecure_local', false );
	}

	/**
	 * @param string $base Request base URL.
	 * @return bool
	 */
	private function should_verify_ssl_for_base( $base ) {
		if ( $this->is_local_bypass_base( $base ) && $this->allows_insecure_local_bypass() ) {
			return false;
		}
		return 0 === strpos( (string) $base, 'https://' ) ? $this->verify_ssl() : false;
	}

	/**
	 * @return int
	 */
	private function http_timeout() {
		return max( 3, (int) apply_filters( 'webino_dashboard_license_http_timeout', 6 ) );
	}

	/**
	 * @return int
	 */
	private function http_connect_timeout() {
		return max( 2, (int) apply_filters( 'webino_dashboard_license_http_connect_timeout', 2 ) );
	}

	/**
	 * Max seconds for one license HTTP round-trip (all bases/retries).
	 *
	 * @return int
	 */
	private function wall_clock_cap() {
		return max( 5, (int) apply_filters( 'webino_dashboard_license_wall_clock_cap', 8 ) );
	}

	/**
	 * Wall clock cap by request context.
	 *
	 * @param string $context sync|cron|install.
	 * @return int
	 */
	private function wall_clock_cap_for_context( $context ) {
		if ( 'install' === $context ) {
			return max( 10, (int) apply_filters( 'webino_dashboard_license_install_wall_clock_cap', 30 ) );
		}
		return $this->wall_clock_cap();
	}

	/**
	 * HTTP timeout by request context.
	 *
	 * @param string $context sync|cron|install.
	 * @return int
	 */
	private function http_timeout_for_context( $context ) {
		if ( 'install' === $context ) {
			return max( 5, (int) apply_filters( 'webino_dashboard_license_install_http_timeout', 15 ) );
		}
		return $this->http_timeout();
	}

	/**
	 * Per-request timeout for crm_get (fail-fast for dashboard proxies).
	 *
	 * @return int
	 */
	private function crm_get_http_timeout() {
		return max( 2, (int) apply_filters( 'webino_dashboard_crm_get_timeout', 3 ) );
	}

	/**
	 * Wall clock cap for crm_get across all bases.
	 *
	 * @return int
	 */
	private function crm_get_wall_clock_cap() {
		return max( 4, (int) apply_filters( 'webino_dashboard_crm_get_wall_clock_cap', 6 ) );
	}

	/**
	 * @param string $code Transport error_code from CRM client.
	 * @return bool
	 */
	private function is_unreachable_transport_code( $code ) {
		return in_array( (string) $code, array( 'timeout', 'transport', 'empty_reply' ), true );
	}

	/**
	 * @return int
	 */
	private function http_retry_count() {
		return max( 0, (int) apply_filters( 'webino_dashboard_license_http_retry_count', 0 ) );
	}

	/**
	 * Retries: one extra attempt on wp-cron only; sync UI clicks fail fast.
	 *
	 * @param string $context sync|cron.
	 * @return int
	 */
	private function http_retry_count_for_context( $context ) {
		if ( 'cron' === $context ) {
			return max( 0, (int) apply_filters( 'webino_dashboard_license_cron_http_retry_count', 1 ) );
		}
		return $this->http_retry_count();
	}

	/**
	 * @return list<int>
	 */
	private function http_retry_backoff_ms() {
		$backoff = apply_filters( 'webino_dashboard_license_http_retry_backoff_ms', array( 500 ) );
		return is_array( $backoff ) ? array_map( 'intval', $backoff ) : array( 500 );
	}

	/**
	 * @return string
	 */
	private function correlation_id() {
		return 'wd-lic-' . wp_generate_password( 12, false );
	}

	/**
	 * @param array<string,mixed> $body Request body (domain optional; defaults to site host).
	 * @return array<string,mixed>
	 */
	private function build_request_body( array $body ) {
		$domain = isset( $body['domain'] ) ? $this->normalize_site_domain( (string) $body['domain'] ) : $this->get_current_domain();
		return array_merge( $body, array( 'domain' => $domain ) );
	}

	/**
	 * @param WP_Error $error Transport error.
	 * @return bool
	 */
	private function is_retryable_transport_error( $error ) {
		if ( ! is_wp_error( $error ) ) {
			return false;
		}
		$code = $error->get_error_code();
		if ( in_array( $code, array( 'http_request_failed', 'http_request_not_executed' ), true ) ) {
			return '' !== $this->transport_error_code_from_message( $error->get_error_message() );
		}
		return false;
	}

	/**
	 * Classify transport failure for retry mapping and user-facing error_code.
	 *
	 * @param string $message Raw WP HTTP error message.
	 * @return string empty_reply|timeout|transport|'' when not retryable.
	 */
	private function transport_error_code_from_message( $message ) {
		$msg = strtolower( trim( (string) $message ) );
		if ( '' === $msg ) {
			return 'transport';
		}
		if ( false !== strpos( $msg, 'curl error 52' )
			|| false !== strpos( $msg, 'empty reply from server' )
			|| false !== strpos( $msg, 'unexpected eof' ) ) {
			return 'empty_reply';
		}
		if ( false !== strpos( $msg, 'timed out' )
			|| false !== strpos( $msg, 'curl error 28' ) ) {
			return 'timeout';
		}
		if ( false !== strpos( $msg, 'could not resolve' )
			|| false !== strpos( $msg, 'connection reset' )
			|| false !== strpos( $msg, 'connection refused' )
			|| false !== strpos( $msg, 'connection' ) ) {
			return 'transport';
		}
		return '';
	}

	/**
	 * @param string $raw Raw transport message.
	 * @return string
	 */
	private function friendly_transport_error( $raw ) {
		$msg = trim( (string) $raw );
		if ( '' === $msg ) {
			return __( 'License server is unavailable.', 'webino-dashboard' );
		}
		$lower = strtolower( $msg );
		if ( false !== strpos( $lower, 'curl error 28' ) || false !== strpos( $lower, 'timed out' ) ) {
			return __( 'License server did not respond in time. Please try again shortly.', 'webino-dashboard' );
		}
		if ( false !== strpos( $lower, 'curl error 52' ) || false !== strpos( $lower, 'empty reply from server' ) ) {
			return __( 'License server closed the connection without a response. Please try again shortly.', 'webino-dashboard' );
		}
		if ( false !== strpos( $lower, 'could not resolve' ) ) {
			return __( 'License server hostname could not be resolved.', 'webino-dashboard' );
		}
		if ( false !== strpos( $lower, 'ssl' ) ) {
			return __( 'Secure connection to the license server failed.', 'webino-dashboard' );
		}
		return $msg;
	}

	/**
	 * @param string              $path Relative path.
	 * @param array<string,mixed> $meta Log context.
	 * @return void
	 */
	private function log_license_http( $path, array $meta ) {
		if ( ! ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ) {
			return;
		}
		if ( isset( $meta['url'] ) ) {
			$parsed = wp_parse_url( (string) $meta['url'] );
			if ( is_array( $parsed ) ) {
				$host = isset( $parsed['host'] ) ? (string) $parsed['host'] : '';
				$path_part = isset( $parsed['path'] ) ? (string) $parsed['path'] : '';
				$meta['url'] = $host . $path_part;
			}
		}
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( '[Webino Dashboard License] ' . $path . ' ' . wp_json_encode( $meta ) );
	}

	/**
	 * @param string $event Metric key suffix.
	 * @return void
	 */
	private function bump_license_metric( $event ) {
		$key  = 'webino_license_metric_' . sanitize_key( $event );
		$val  = (int) get_transient( $key );
		set_transient( $key, $val + 1, DAY_IN_SECONDS );
	}

	/**
	 * @param string              $path Relative to site root, e.g. wp-json/webinocrm/v1/license/check.
	 * @param array<string,mixed> $body Body fields.
	 * @param string              $context sync|cron.
	 * @param string              $context sync|cron|install.
	 * @return array{ ok: bool, code?: int, data?: mixed, error?: string, error_code?: string, transport_raw?: string }
	 */
	private function post_first_server( $path, array $body, $context = 'sync' ) {
		$path            = ltrim( (string) $path, '/' );
		$payload         = $this->build_request_body( $body );
		$correlation     = $this->correlation_id();
		$retries         = $this->http_retry_count_for_context( $context );
		$backoff_ms      = $this->http_retry_backoff_ms();
		$wall_started    = microtime( true );
		$wall_cap        = $this->wall_clock_cap_for_context( $context );
		$request_timeout = $this->http_timeout_for_context( $context );
		$wall_cap_msg    = __( 'License request exceeded time limit.', 'webino-dashboard' );
		$last_error      = '';
		$last_raw_error  = '';
		$last_code       = 0;

		foreach ( $this->get_request_bases() as $base ) {
			if ( ( microtime( true ) - $wall_started ) >= $wall_cap ) {
				$last_error = $wall_cap_msg;
				break;
			}

			$is_local  = $this->is_local_bypass_base( $base );
			$transport = $is_local ? 'local_bypass' : 'remote';
			$url       = trailingslashit( $base ) . $path;
			for ( $attempt = 0; $attempt <= $retries; $attempt++ ) {
				if ( ( microtime( true ) - $wall_started ) >= $wall_cap ) {
					$last_error = $wall_cap_msg;
					break 2;
				}
				if ( $attempt > 0 && isset( $backoff_ms[ $attempt - 1 ] ) ) {
					usleep( (int) $backoff_ms[ $attempt - 1 ] * 1000 );
				}

				$started = microtime( true );
				$headers = array(
					'Content-Type'            => 'application/json; charset=utf-8',
					'X-Webino-Correlation-Id' => $correlation,
				);
				if ( $is_local ) {
					$headers['Host'] = $this->crm_public_host();
				}
				$args = array(
					'timeout'         => $request_timeout,
					'connect_timeout' => $this->http_connect_timeout(),
					'httpversion'     => '1.1',
					'headers'         => $headers,
					'body'            => wp_json_encode( $payload ),
					'sslverify'       => $this->should_verify_ssl_for_base( $base ),
				);

				$response = wp_remote_post( $url, $args );
				$elapsed  = (int) round( ( microtime( true ) - $started ) * 1000 );

				if ( is_wp_error( $response ) ) {
					$last_error      = $response->get_error_message();
					$last_raw_error  = $last_error;
					$transport_cd = $this->transport_error_code_from_message( $last_error );
					$this->log_license_http(
						$path,
						array(
							'transport'      => $transport,
							'base_url'       => $base,
							'url'            => $url,
							'attempt'        => $attempt,
							'latency_ms'     => $elapsed,
							'error'          => $last_error,
							'error_code'     => $transport_cd ? $transport_cd : 'transport',
							'correlation_id' => $correlation,
						)
					);
					if ( $this->is_retryable_transport_error( $response ) && $attempt < $retries ) {
						continue;
					}
					break;
				}

				$code = (int) wp_remote_retrieve_response_code( $response );
				$raw  = (string) wp_remote_retrieve_body( $response );
				$data = json_decode( $raw, true );
				$last_code = $code;

				$this->log_license_http(
					$path,
					array(
						'transport'      => $transport,
						'base_url'       => $base,
						'url'            => $url,
						'attempt'        => $attempt,
						'latency_ms'     => $elapsed,
						'http_code'      => $code,
						'correlation_id' => $correlation,
					)
				);

				if ( $code >= 200 && $code < 300 ) {
					return array(
						'ok'   => true,
						'code' => $code,
						'data' => null !== $data ? $data : $raw,
					);
				}

				if ( $code >= 400 && $code < 500 ) {
					$err_msg = '';
					if ( is_array( $data ) && ! empty( $data['message'] ) ) {
						$err_msg = (string) $data['message'];
					}
					return array(
						'ok'         => false,
						'code'       => $code,
						'data'       => $data,
						'error'      => $err_msg ? $err_msg : __( 'License server rejected the request.', 'webino-dashboard' ),
						'error_code' => is_array( $data ) && ! empty( $data['code'] ) ? (string) $data['code'] : 'http_' . $code,
					);
				}

				$last_error = sprintf(
					/* translators: %d: HTTP status code */
					__( 'License server returned HTTP %d.', 'webino-dashboard' ),
					$code
				);
				if ( $code >= 500 && $attempt < $retries ) {
					continue;
				}
				break;
			}
		}

		if ( '' !== $last_error ) {
			$final_cd = $this->transport_error_code_from_message( $last_error );
			if ( '' !== $final_cd ) {
				$this->bump_license_metric( $final_cd );
			}
		}

		if ( '' === $last_error ) {
			$last_error = __( 'No license servers configured.', 'webino-dashboard' );
		}

		$transport_cd = $this->transport_error_code_from_message( $last_error );
		if ( '' === $transport_cd ) {
			$transport_cd = 'transport';
		}

		if ( $last_error === $wall_cap_msg ) {
			$friendly = sprintf(
				/* translators: 1: seconds cap, 2: last raw transport error */
				__( 'License server did not respond within %1$d seconds. Last raw error: %2$s', 'webino-dashboard' ),
				$wall_cap,
				'' !== $last_raw_error ? $last_raw_error : __( 'no transport error captured', 'webino-dashboard' )
			);
		} else {
			$friendly = $this->friendly_transport_error( $last_error );
		}

		$fail = array(
			'ok'         => false,
			'code'       => $last_code,
			'error'      => $friendly,
			'error_code' => $transport_cd,
		);
		if ( '' !== $last_raw_error ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG && '' !== $last_raw_error ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( '[Webino Dashboard] license transport: ' . $last_raw_error );
			}
		}
		return $fail;
	}

	/**
	 * Admin connectivity probes to webina.dev (CRM).
	 *
	 * @return array<string,mixed>
	 */
	public function run_license_diagnostics() {
		$domain      = $this->get_current_domain();
		$bases       = $this->get_server_urls();
		$base        = ! empty( $bases[0] ) ? (string) $bases[0] : WEBINO_DASHBOARD_VENDOR_URL;
		$base        = trailingslashit( $base );
		$same_server = $this->is_same_server_as_crm();
		$local_base  = $this->local_bypass_base();
		$check_body  = wp_json_encode( array( 'domain' => $domain ) );

		$probes = array();
		if ( $same_server && '' !== $local_base ) {
			$probes[] = $this->diagnostic_probe(
				'local_bypass_license_check',
				'POST',
				trailingslashit( $local_base ) . 'wp-json/webinocrm/v1/license/check',
				6,
				$check_body,
				true
			);
		}
		$probes[] = $this->diagnostic_probe( 'crm_home', 'GET', $base, 4 );
		$probes[] = $this->diagnostic_probe( 'crm_rest_namespace', 'GET', $base . 'wp-json/webinocrm/v1/', 4 );
		$probes[] = $this->diagnostic_probe(
			'license_check',
			'POST',
			$base . 'wp-json/webinocrm/v1/license/check',
			6,
			$check_body
		);

		$transport = 'streams';
		if ( function_exists( 'curl_version' ) ) {
			$transport = 'curl';
		}

		return array(
			'site_domain'          => $domain,
			'crm_base'             => rtrim( $base, '/' ),
			'same_server_detected' => $same_server,
			'local_bypass_base'    => ( $same_server && '' !== $local_base ) ? $local_base : null,
			'crm_host'             => $this->crm_public_host(),
			'wp_remote_transport'  => $transport,
			'probes'               => $probes,
		);
	}

	/**
	 * @param string      $name     Probe id.
	 * @param string      $method   HTTP method.
	 * @param string      $url      Full URL.
	 * @param int         $timeout  Seconds.
	 * @param string|null $body     Request body for POST.
	 * @param bool        $local_bypass Send Host header for CRM vhost via local NIC IP.
	 * @return array<string,mixed>
	 */
	private function diagnostic_probe( $name, $method, $url, $timeout, $body = null, $local_bypass = false ) {
		$started = microtime( true );
		$headers = array();
		if ( null !== $body ) {
			$headers['Content-Type'] = 'application/json; charset=utf-8';
		}
		if ( $local_bypass ) {
			$headers['Host'] = $this->crm_public_host();
		}
		$args = array(
			'method'          => $method,
			'timeout'         => $timeout,
			'connect_timeout' => min( 2, $timeout ),
			'httpversion'     => '1.1',
			'sslverify'       => $this->should_verify_ssl_for_base( $url ),
		);
		if ( ! empty( $headers ) ) {
			$args['headers'] = $headers;
		}
		if ( null !== $body ) {
			$args['body'] = $body;
		}

		$response = wp_remote_request( $url, $args );
		$elapsed  = (int) round( ( microtime( true ) - $started ) * 1000 );

		$probe = array(
			'name'        => (string) $name,
			'url'         => (string) $url,
			'method'      => (string) $method,
			'latency_ms'  => $elapsed,
			'ok'          => false,
			'http_code'   => 0,
			'error'       => '',
			'body_snippet' => '',
			'fastpath_detected' => false,
		);

		if ( is_wp_error( $response ) ) {
			$probe['error'] = $response->get_error_message();
			return $probe;
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$raw  = (string) wp_remote_retrieve_body( $response );
		$fp   = wp_remote_retrieve_header( $response, 'x-webino-fastpath' );
		if ( '' === $fp ) {
			$fp = wp_remote_retrieve_header( $response, 'X-Webino-Fastpath' );
		}

		$probe['http_code']          = $code;
		$probe['ok']                 = $code >= 200 && $code < 500;
		$probe['body_snippet']       = function_exists( 'mb_substr' ) ? mb_substr( $raw, 0, 500 ) : substr( $raw, 0, 500 );
		$probe['fastpath_detected']  = '1' === (string) $fp;

		return $probe;
	}

	/**
	 * @param mixed $payload Decoded JSON or array.
	 * @return array{ status: string, message: string, expiry: ?string, demo: bool }
	 */
	private function normalize_crm_payload( $payload ) {
		$status  = 'inactive';
		$message = '';
		$expiry  = null;
		$demo    = false;

		if ( is_string( $payload ) ) {
			return array(
				'status'  => 'error',
				'message' => __( 'Invalid response from license server.', 'webino-dashboard' ),
				'expiry'  => null,
				'demo'    => false,
			);
		}

		$root = is_array( $payload ) ? $payload : array();
		if ( isset( $root['data'] ) && is_array( $root['data'] ) ) {
			$root = $root['data'];
		}

		$raw_status = isset( $root['status'] ) ? strtolower( (string) $root['status'] ) : '';
		if ( '' === $raw_status && isset( $root['license_status'] ) ) {
			$raw_status = strtolower( (string) $root['license_status'] );
		}

		if ( in_array( $raw_status, array( 'active', 'valid', 'ok', 'licensed', 'success' ), true ) ) {
			$status = 'active';
		} elseif ( in_array( $raw_status, array( 'demo', 'trial' ), true ) ) {
			$status = 'active';
			$demo   = true;
		} elseif ( in_array( $raw_status, array( 'expired', 'inactive', 'invalid', 'disabled', 'not_found', 'cancelled', 'canceled' ), true ) ) {
			$status = 'canceled' === $raw_status ? 'cancelled' : $raw_status;
		} elseif ( '' !== $raw_status ) {
			$status = $raw_status;
		}

		if ( isset( $root['code'] ) && 'not_found' === strtolower( (string) $root['code'] ) ) {
			$status = 'not_found';
		}

		if ( ! empty( $root['message'] ) ) {
			$message = (string) $root['message'];
		} elseif ( ! empty( $root['msg'] ) ) {
			$message = (string) $root['msg'];
		}

		foreach ( array( 'expiry', 'expires_at', 'expiry_date', 'expires' ) as $k ) {
			if ( ! empty( $root[ $k ] ) ) {
				$expiry = (string) $root[ $k ];
				break;
			}
		}

		if ( isset( $root['is_demo'] ) ) {
			$demo = (bool) $root['is_demo'];
		}
		if ( isset( $root['demo'] ) && $root['demo'] ) {
			$demo = true;
		}

		return array(
			'status'  => $status,
			'message' => $message,
			'expiry'  => $expiry,
			'demo'    => $demo,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private function get_row() {
		if ( null !== $this->row_cache ) {
			return $this->row_cache;
		}
		global $wpdb;
		$table = self::table_name();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is internal.
		$row = $wpdb->get_row( "SELECT * FROM {$table} WHERE id = " . (int) self::TABLE_ROW_ID, ARRAY_A );
		if ( ! is_array( $row ) ) {
			$row = array(
				'id'           => self::TABLE_ROW_ID,
				'domain'       => '',
				'status'       => 'inactive',
				'message'      => '',
				'expiry_date'  => null,
				'is_demo'      => 0,
				'activated_at' => null,
				'last_check'   => null,
				'license_key'  => null,
			);
		}
		$this->row_cache = $row;
		return $this->row_cache;
	}

	/**
	 * @param array<string,mixed> $data Data.
	 * @return void
	 */
	public function save_row( array $data ) {
		global $wpdb;
		$table = self::table_name();
		$data  = wp_parse_args(
			$data,
			array(
				'id'           => self::TABLE_ROW_ID,
				'domain'       => $this->get_current_domain(),
				'status'       => 'inactive',
				'message'      => '',
				'expiry_date'  => null,
				'is_demo'      => 0,
				'activated_at' => null,
				'last_check'   => current_time( 'mysql' ),
				'license_key'  => null,
			)
		);
		$exists = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE id = %d", self::TABLE_ROW_ID ) );
		if ( $exists ) {
			unset( $data['id'] );
			$wpdb->update( $table, $data, array( 'id' => self::TABLE_ROW_ID ) );
		} else {
			$wpdb->insert( $table, $data );
		}
		$this->row_cache = null;
	}

	/**
	 * @param bool $persist_errors Whether to write connection errors to DB.
	 * @return array<string,mixed> Normalized result for REST/UI.
	 */
	public function remote_license_check( $persist_errors = true, $context = 'sync' ) {
		$domain = $this->get_current_domain();
		$result  = $this->post_first_server(
			'wp-json/webinocrm/v1/license/check',
			array_merge(
				array( 'domain' => $domain ),
				(array) apply_filters( 'webino_dashboard_license_check_body', array() )
			),
			$context
		);

		$now = current_time( 'mysql' );

		if ( ! $result['ok'] ) {
			$msg           = isset( $result['error'] ) ? (string) $result['error'] : __( 'License server error.', 'webino-dashboard' );
			$transport_raw = ! empty( $result['transport_raw'] ) ? (string) $result['transport_raw'] : '';
			$err_code      = ! empty( $result['error_code'] ) ? (string) $result['error_code'] : '';
			$was_ok        = false;
			if ( $persist_errors ) {
				$this->row_cache = null;
				$prev    = $this->get_row();
				$prev_st = isset( $prev['status'] ) ? strtolower( (string) $prev['status'] ) : '';
				$was_ok  = ! empty( $prev['is_demo'] )
					|| in_array( $prev_st, array( 'active', 'valid', 'ok', 'licensed' ), true );
				if ( '' !== $transport_raw ) {
					$db_message = '[diag] ' . $transport_raw;
				} elseif ( ! $was_ok && 'timeout' === $err_code ) {
					$db_message = '[unreachable] ' . $msg;
				}
				// Do not overwrite a known-good license with "error" on transient network/CRM failure.
				if ( $was_ok ) {
					$this->save_row(
						array(
							'last_check' => $now,
							'message'    => $db_message,
						)
					);
				} else {
					$this->save_row(
						array(
							'domain'     => $domain,
							'status'     => 'error',
							'message'    => $db_message,
							'last_check' => $now,
						)
					);
				}
			}
			$this->row_cache = null;
			$active = $this->is_license_active( false );
			$r      = $this->get_row();
			$out = array(
				'active'  => $active,
				'status'  => isset( $r['status'] ) ? (string) $r['status'] : 'error',
				'message' => $msg,
				'expiry'  => ! empty( $r['expiry_date'] ) ? (string) $r['expiry_date'] : null,
				'demo'    => ! empty( $r['is_demo'] ),
			);
			if ( '' !== $err_code ) {
				$out['error_code'] = $err_code;
			}
			if ( '' !== $transport_raw && defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( '[Webino Dashboard] license transport: ' . $transport_raw );
			}
			if (
				$was_ok
				&& $active
				&& $this->is_unreachable_transport_code( $err_code )
				&& ! (bool) apply_filters( 'webino_dashboard_license_disable_fallback', false )
			) {
				$out['warning'] = 'crm_unreachable';
			}
			$this->sync_nag_clock();
			return $out;
		}

		$norm = $this->normalize_crm_payload( $result['data'] ?? array() );
		$exp  = null;
		if ( ! empty( $norm['expiry'] ) ) {
			$ts = strtotime( $norm['expiry'] );
			if ( $ts ) {
				$exp = gmdate( 'Y-m-d H:i:s', $ts );
			}
		}

		$this->save_row(
			array(
				'domain'      => $domain,
				'status'      => $norm['status'],
				'message'     => $norm['message'],
				'expiry_date' => $exp,
				'is_demo'     => $norm['demo'] ? 1 : 0,
				'last_check'  => $now,
			)
		);

		$root = is_array( $result['data'] ?? null ) ? $result['data'] : array();
		$out  = array(
			'active'  => $this->is_license_active( false ),
			'status'  => $norm['status'],
			'message' => $norm['message'],
			'expiry'  => $norm['expiry'],
			'demo'    => $norm['demo'],
		);
		if ( 'not_found' === $norm['status'] ) {
			$out['error_code'] = 'not_found';
		} elseif ( ! empty( $root['code'] ) ) {
			$out['error_code'] = (string) $root['code'];
		}
		$this->sync_nag_clock();
		return $out;
	}

	/**
	 * @return array<string,mixed>
	 */
	public function remote_activate() {
		$domain = $this->get_current_domain();
		$result = $this->post_first_server(
			'wp-json/webinocrm/v1/license/activate',
			array_merge(
				array( 'domain' => $domain ),
				(array) apply_filters( 'webino_dashboard_license_activate_body', array() )
			),
			'sync'
		);

		$now = current_time( 'mysql' );

		if ( ! $result['ok'] ) {
			$msg = isset( $result['error'] ) ? (string) $result['error'] : __( 'Activation request failed.', 'webino-dashboard' );
			$this->save_row(
				array(
					'domain'     => $domain,
					'status'     => 'error',
					'message'    => $msg,
					'last_check' => $now,
				)
			);
			$out = array(
				'active'  => false,
				'status'  => 'error',
				'message' => $msg,
				'expiry'  => null,
				'demo'    => false,
			);
			if ( ! empty( $result['error_code'] ) ) {
				$out['error_code'] = (string) $result['error_code'];
			}
			return $out;
		}

		$norm = $this->normalize_crm_payload( $result['data'] ?? array() );
		$exp  = null;
		if ( ! empty( $norm['expiry'] ) ) {
			$ts = strtotime( $norm['expiry'] );
			if ( $ts ) {
				$exp = gmdate( 'Y-m-d H:i:s', $ts );
			}
		}

		$this->save_row(
			array(
				'domain'       => $domain,
				'status'       => $norm['status'],
				'message'      => $norm['message'],
				'expiry_date'  => $exp,
				'is_demo'      => $norm['demo'] ? 1 : 0,
				'activated_at' => $now,
				'last_check'   => $now,
			)
		);

		return array(
			'active'  => $this->is_license_active( false ),
			'status'  => $norm['status'],
			'message' => $norm['message'],
			'expiry'  => $norm['expiry'],
			'demo'    => $norm['demo'],
		);
	}

	/**
	 * @param bool $use_cache Skip duplicate remote calls in one request.
	 * @return void
	 */
	public function check_license_status( $use_cache = true, $context = 'sync' ) {
		if ( $use_cache && self::$checked_this_request ) {
			return;
		}
		self::$checked_this_request = true;
		$this->remote_license_check( true, $context );
	}

	/**
	 * @param bool $reload Reload row from DB.
	 * @return bool
	 */
	public function is_license_active( $reload = true ) {
		if ( $reload ) {
			$this->row_cache = null;
		}
		$row = $this->get_row();
		if ( ! empty( $row['is_demo'] ) ) {
			return true;
		}
		$st = isset( $row['status'] ) ? strtolower( (string) $row['status'] ) : '';
		if ( ! in_array( $st, array( 'active', 'valid', 'ok', 'licensed' ), true ) ) {
			return false;
		}
		if ( ! empty( $row['expiry_date'] ) ) {
			$ex = strtotime( (string) $row['expiry_date'] );
			if ( $ex && time() > $ex ) {
				return false;
			}
		}
		$dom = isset( $row['domain'] ) ? $this->normalize_site_domain( (string) $row['domain'] ) : '';
		$cur = $this->get_current_domain();
		if ( $dom && $dom !== $cur ) {
			return false;
		}
		return true;
	}

	/**
	 * @return bool
	 */
	public function is_demo_mode() {
		$row = $this->get_row();
		return ! empty( $row['is_demo'] );
	}

	/**
	 * CRM-confirmed inactive statuses (not transport/unreachable errors).
	 *
	 * @return list<string>
	 */
	private function definitive_inactive_statuses() {
		return array( 'inactive', 'expired', 'invalid', 'disabled', 'not_found', 'cancelled', 'canceled', 'revoked' );
	}

	/**
	 * Row reflects transport/CRM unreachable — not a definitive license decision.
	 *
	 * @param array<string,mixed>|null $row License row.
	 * @return bool
	 */
	private function is_row_transport_unreachable( $row = null ) {
		if ( null === $row ) {
			$row = $this->get_row();
		}
		$msg = isset( $row['message'] ) ? trim( (string) $row['message'] ) : '';
		if ( 0 === strpos( $msg, '[diag]' ) || 0 === strpos( $msg, '[unreachable]' ) ) {
			return true;
		}
		$st = isset( $row['status'] ) ? strtolower( (string) $row['status'] ) : '';
		// Transport failures persist status=error without a definitive inactive CRM status.
		if ( 'error' === $st && ! in_array( $st, $this->definitive_inactive_statuses(), true ) ) {
			return true;
		}
		return false;
	}

	/**
	 * License is definitively inactive (CRM confirmed or locally expired), not merely unreachable.
	 *
	 * @param array<string,mixed>|null $row License row.
	 * @return bool
	 */
	private function is_row_definitively_inactive( $row = null ) {
		if ( $this->is_license_active( false ) || $this->is_demo_mode() ) {
			return false;
		}
		if ( null === $row ) {
			$row = $this->get_row();
		}
		if ( $this->is_row_transport_unreachable( $row ) ) {
			return false;
		}
		$st = isset( $row['status'] ) ? strtolower( (string) $row['status'] ) : '';
		if ( in_array( $st, $this->definitive_inactive_statuses(), true ) ) {
			return true;
		}
		if ( ! empty( $row['expiry_date'] ) ) {
			$ex = strtotime( (string) $row['expiry_date'] );
			if ( $ex && time() > $ex ) {
				return true;
			}
		}
		if ( in_array( $st, array( 'active', 'valid', 'ok', 'licensed' ), true ) ) {
			$dom = isset( $row['domain'] ) ? $this->normalize_site_domain( (string) $row['domain'] ) : '';
			$cur = $this->get_current_domain();
			if ( $dom && $dom !== $cur ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Clear transport-only license noise and nag clock (admin repair tool).
	 *
	 * @return void
	 */
	public function repair_transport_state() {
		delete_option( self::NAG_SINCE_OPTION );
		$this->row_cache = null;
		$row             = $this->get_row();
		if ( ! $this->is_row_transport_unreachable( $row ) ) {
			return;
		}
		$this->save_row(
			array(
				'message' => '',
			)
		);
	}

	/**
	 * Keep nag_since in sync with current license activity.
	 *
	 * @return void
	 */
	public function sync_nag_clock() {
		if ( $this->is_license_active( false ) || $this->is_demo_mode() ) {
			if ( get_option( self::NAG_SINCE_OPTION, null ) !== null ) {
				delete_option( self::NAG_SINCE_OPTION );
			}
			return;
		}
		if ( ! $this->is_row_definitively_inactive() ) {
			if ( get_option( self::NAG_SINCE_OPTION, null ) !== null ) {
				delete_option( self::NAG_SINCE_OPTION );
			}
			return;
		}
		$since = (int) get_option( self::NAG_SINCE_OPTION, 0 );
		if ( $since <= 0 ) {
			update_option( self::NAG_SINCE_OPTION, time(), false );
		}
	}

	/**
	 * @return int Unix timestamp or 0.
	 */
	public function get_nag_since() {
		$this->sync_nag_clock();
		return (int) get_option( self::NAG_SINCE_OPTION, 0 );
	}

	/**
	 * Soft banner while inactive (before or after force redirect is handled by gates).
	 *
	 * @return bool
	 */
	public function should_show_license_banner() {
		if ( $this->is_license_active( false ) || $this->is_demo_mode() ) {
			return false;
		}
		if ( $this->should_force_license_page() ) {
			return false;
		}
		return $this->is_row_definitively_inactive();
	}

	/**
	 * Informational banner when CRM is unreachable — no nag timer, no dashboard lock.
	 *
	 * @return bool
	 */
	public function should_show_unreachable_banner() {
		if ( $this->is_demo_mode() ) {
			return false;
		}
		return $this->is_row_transport_unreachable();
	}

	/**
	 * After NAG_FORCE_DAYS of inactivity, hard-redirect to the license page.
	 *
	 * @return bool
	 */
	public function should_force_license_page() {
		if ( $this->is_license_active( false ) || $this->is_demo_mode() ) {
			return false;
		}
		if ( ! $this->is_row_definitively_inactive() ) {
			return false;
		}
		$since = $this->get_nag_since();
		if ( $since <= 0 ) {
			return false;
		}
		$grace = (int) apply_filters(
			'webino_dashboard_license_nag_force_seconds',
			self::NAG_FORCE_DAYS * DAY_IN_SECONDS
		);
		return ( time() - $since ) >= max( DAY_IN_SECONDS, $grace );
	}

	/**
	 * Hard dashboard lock — only after the soft nag grace period.
	 *
	 * @return bool
	 */
	public function should_gate_dashboard() {
		if ( ! apply_filters( 'webino_dashboard_license_gate_enabled', true ) ) {
			return false;
		}
		if ( apply_filters( 'webino_dashboard_skip_license_gate', false ) ) {
			return false;
		}
		return $this->should_force_license_page();
	}

	/**
	 * Sanitize license message exposed in bootstrap / window config.
	 *
	 * @param string $raw Raw DB message.
	 * @return string
	 */
	public function public_message_for_bootstrap( $raw ) {
		$raw = trim( (string) $raw );
		if ( '' === $raw ) {
			return '';
		}
		if ( 0 === strpos( $raw, '[diag]' ) || 0 === strpos( $raw, '[unreachable]' ) ) {
			return __( 'License server temporarily unreachable.', 'webino-dashboard' );
		}
		return $raw;
	}

	/**
	 * Public snapshot for bootstrap + window.webinoDashboard.
	 *
	 * @return array<string,mixed>
	 */
	public function get_bootstrap_payload() {
		$this->sync_nag_clock();
		$row   = $this->get_row();
		$since = (int) get_option( self::NAG_SINCE_OPTION, 0 );
		return array(
			'active'                   => $this->is_license_active( false ),
			'status'                   => isset( $row['status'] ) ? (string) $row['status'] : 'unknown',
			'message'                  => $this->public_message_for_bootstrap( isset( $row['message'] ) ? (string) $row['message'] : '' ),
			'expiry'                   => isset( $row['expiry_date'] ) && $row['expiry_date'] ? (string) $row['expiry_date'] : null,
			'demo'                     => $this->is_demo_mode(),
			'domain'                   => $this->get_current_domain(),
			'nag_since'                => $since > 0 ? $since : null,
			'force_license_page'       => $this->should_force_license_page(),
			'show_banner'              => $this->should_show_license_banner(),
			'show_unreachable_banner'  => $this->should_show_unreachable_banner(),
		);
	}

	/**
	 * POST JSON to CRM REST (marketplace, etc.).
	 *
	 * @param string              $path    Relative path under site root.
	 * @param array<string,mixed> $body    Body fields (domain optional).
	 * @param string              $context sync|cron|install.
	 * @return array{ ok: bool, code?: int, data?: mixed, error?: string }
	 */
	public function crm_post( $path, array $body = array(), $context = 'sync' ) {
		$domain  = isset( $body['domain'] ) ? $this->normalize_site_domain( (string) $body['domain'] ) : $this->get_current_domain();
		$payload = array_merge( $body, array( 'domain' => $domain ) );
		return $this->post_first_server( ltrim( (string) $path, '/' ), $payload, $context );
	}

	/**
	 * Fire-and-forget POST to CRM (non-blocking). Used for realtime order SMS.
	 *
	 * @param string              $path Relative path under site root.
	 * @param array<string,mixed> $body Body fields.
	 * @return void
	 */
	public function crm_post_async( $path, array $body = array() ) {
		$domain  = isset( $body['domain'] ) ? $this->normalize_site_domain( (string) $body['domain'] ) : $this->get_current_domain();
		$payload = $this->build_request_body( array_merge( $body, array( 'domain' => $domain ) ) );
		$path    = ltrim( (string) $path, '/' );
		$bases   = $this->get_request_bases();
		if ( ! $bases ) {
			return;
		}
		$base     = $bases[0];
		$url      = trailingslashit( $base ) . $path;
		$is_local = $this->is_local_bypass_base( $base );
		$headers  = array(
			'Content-Type' => 'application/json; charset=utf-8',
		);
		if ( $is_local ) {
			$headers['Host'] = $this->crm_public_host();
		}
		wp_remote_post(
			$url,
			array(
				'timeout'   => 0.01,
				'blocking'  => false,
				'headers'   => $headers,
				'body'      => wp_json_encode( $payload ),
				'sslverify' => $this->should_verify_ssl_for_base( $base ),
			)
		);
	}

	/**
	 * GET JSON from CRM REST.
	 *
	 * @param string              $path    Relative path.
	 * @param array<string,mixed> $query   Query args (domain optional).
	 * @return array{ ok: bool, code?: int, data?: mixed, error?: string }
	 */
	public function crm_get( $path, array $query = array(), array $options = array() ) {
		$domain       = isset( $query['domain'] ) ? $this->normalize_site_domain( (string) $query['domain'] ) : $this->get_current_domain();
		$query        = array_merge( $query, array( 'domain' => $domain ) );
		$path         = ltrim( (string) $path, '/' );
		$timeout      = isset( $options['timeout'] ) ? max( 2, (int) $options['timeout'] ) : $this->crm_get_http_timeout();
		$wall_cap     = isset( $options['wall_cap'] ) ? max( 3, (int) $options['wall_cap'] ) : $this->crm_get_wall_clock_cap();
		$wall_started = microtime( true );
		$last_error   = '';
		$last_code    = 0;

		foreach ( $this->get_request_bases() as $base ) {
			if ( ( microtime( true ) - $wall_started ) >= $wall_cap ) {
				$last_error = __( 'CRM request timed out.', 'webino-dashboard' );
				break;
			}
			$url      = add_query_arg( $query, trailingslashit( $base ) . $path );
			$is_local = $this->is_local_bypass_base( $base );
			$headers  = array( 'Accept' => 'application/json' );
			if ( $is_local ) {
				$headers['Host'] = $this->crm_public_host();
			}
			$response = wp_remote_get(
				$url,
				array(
					'timeout'   => $timeout,
					'headers'   => $headers,
					'sslverify' => $this->should_verify_ssl_for_base( $base ),
				)
			);
			if ( is_wp_error( $response ) ) {
				$last_error = $response->get_error_message();
				continue;
			}
			$code = (int) wp_remote_retrieve_response_code( $response );
			$raw  = (string) wp_remote_retrieve_body( $response );
			$data = json_decode( $raw, true );
			if ( $code >= 200 && $code < 300 ) {
				return array(
					'ok'   => true,
					'code' => $code,
					'data' => is_array( $data ) ? $data : array(),
				);
			}
			$last_code = $code;
			if ( is_array( $data ) ) {
				if ( ! empty( $data['message'] ) && is_string( $data['message'] ) ) {
					$last_error = $data['message'];
				} elseif ( ! empty( $data['error'] ) && is_string( $data['error'] ) ) {
					$last_error = $data['error'];
				} elseif ( ! empty( $data['code'] ) && is_string( $data['code'] ) ) {
					$last_error = $data['code'];
				} else {
					$last_error = sprintf(
						/* translators: %d: HTTP status code */
						__( 'CRM HTTP %d', 'webino-dashboard' ),
						$code
					);
				}
			} else {
				$last_error = sprintf(
					/* translators: %d: HTTP status code */
					__( 'CRM HTTP %d', 'webino-dashboard' ),
					$code
				);
			}
			// Auth / not-enabled errors won't succeed on another base — stop early.
			if ( in_array( $code, array( 401, 403, 404, 429, 503 ), true ) ) {
				break;
			}
		}
		$out = array(
			'ok'    => false,
			'error' => $last_error ? $last_error : __( 'CRM request failed.', 'webino-dashboard' ),
		);
		if ( $last_code > 0 ) {
			$out['code'] = $last_code;
		}
		return $out;
	}

	/**
	 * GET multiple CRM paths in parallel (shared query args and wall clock cap).
	 *
	 * @param array<string,string> $paths   Map of result key => relative path.
	 * @param array<string,mixed>  $query   Query args (domain optional).
	 * @param array<string,mixed>  $options timeout, wall_cap.
	 * @return array<string, array{ ok: bool, code?: int, data?: mixed, error?: string }>
	 */
	public function crm_get_many( array $paths, array $query = array(), array $options = array() ) {
		$results = array();
		foreach ( array_keys( $paths ) as $key ) {
			$results[ $key ] = array(
				'ok'    => false,
				'error' => __( 'CRM request failed.', 'webino-dashboard' ),
			);
		}
		if ( empty( $paths ) ) {
			return $results;
		}

		$domain       = isset( $query['domain'] ) ? $this->normalize_site_domain( (string) $query['domain'] ) : $this->get_current_domain();
		$query        = array_merge( $query, array( 'domain' => $domain ) );
		$timeout      = isset( $options['timeout'] ) ? max( 2, (int) $options['timeout'] ) : $this->crm_get_http_timeout();
		$wall_cap     = isset( $options['wall_cap'] ) ? max( 3, (int) $options['wall_cap'] ) : $this->crm_get_wall_clock_cap();
		$wall_started = microtime( true );

		foreach ( $this->get_request_bases() as $base ) {
			$elapsed = microtime( true ) - $wall_started;
			if ( $elapsed >= $wall_cap ) {
				break;
			}
			$pending = array();
			foreach ( $paths as $key => $path ) {
				if ( empty( $results[ $key ]['ok'] ) ) {
					$pending[ $key ] = ltrim( (string) $path, '/' );
				}
			}
			if ( empty( $pending ) ) {
				break;
			}
			$remaining = max( 1, (int) ceil( $wall_cap - $elapsed ) );
			$batch     = $this->crm_parallel_get_on_base( $base, $pending, $query, $timeout, $remaining );
			foreach ( $batch as $key => $res ) {
				if ( ! empty( $res['ok'] ) ) {
					$results[ $key ] = $res;
				}
			}
		}

		return $results;
	}

	/**
	 * Parallel GET requests against one CRM base URL.
	 *
	 * @param string               $base        CRM base URL.
	 * @param array<string,string> $paths       Key => relative path.
	 * @param array<string,mixed>  $query       Query args.
	 * @param int                  $timeout     Per-request timeout seconds.
	 * @param int                  $max_seconds Wall clock cap for this batch.
	 * @return array<string, array{ ok: bool, code?: int, data?: mixed, error?: string }>
	 */
	private function crm_parallel_get_on_base( $base, array $paths, array $query, $timeout, $max_seconds ) {
		$results = array();
		foreach ( array_keys( $paths ) as $key ) {
			$results[ $key ] = array(
				'ok'    => false,
				'error' => __( 'CRM request failed.', 'webino-dashboard' ),
			);
		}
		if ( empty( $paths ) ) {
			return $results;
		}

		if ( ! function_exists( 'curl_multi_init' ) ) {
			foreach ( $paths as $key => $path ) {
				$single = $this->crm_get_single_on_base( $base, $path, $query, $timeout );
				if ( ! empty( $single['ok'] ) ) {
					$results[ $key ] = $single;
				}
			}
			return $results;
		}

		$is_local  = $this->is_local_bypass_base( $base );
		$sslverify = $this->should_verify_ssl_for_base( $base );
		$mh        = curl_multi_init();
		$handles   = array();
		$deadline  = microtime( true ) + max( 1, (int) $max_seconds );

		foreach ( $paths as $key => $path ) {
			$url = add_query_arg( $query, trailingslashit( (string) $base ) . $path );
			$ch  = curl_init( $url );
			if ( false === $ch ) {
				continue;
			}
			$headers = array( 'Accept: application/json' );
			if ( $is_local ) {
				$headers[] = 'Host: ' . $this->crm_public_host();
			}
			curl_setopt_array(
				$ch,
				array(
					CURLOPT_RETURNTRANSFER => true,
					CURLOPT_TIMEOUT        => $timeout,
					CURLOPT_HTTPHEADER     => $headers,
					CURLOPT_SSL_VERIFYPEER => $sslverify,
					CURLOPT_SSL_VERIFYHOST => $sslverify ? 2 : 0,
				)
			);
			curl_multi_add_handle( $mh, $ch );
			$handles[ $key ] = $ch;
		}

		do {
			$status = curl_multi_exec( $mh, $running );
			if ( $running ) {
				curl_multi_select( $mh, 0.2 );
			}
		} while ( $running > 0 && CURLM_OK === $status && microtime( true ) < $deadline );

		foreach ( $handles as $key => $ch ) {
			$code = (int) curl_getinfo( $ch, CURLINFO_HTTP_CODE );
			$raw  = (string) curl_multi_getcontent( $ch );
			curl_multi_remove_handle( $mh, $ch );
			curl_close( $ch );
			if ( $code >= 200 && $code < 300 ) {
				$data = json_decode( $raw, true );
				$results[ $key ] = array(
					'ok'   => true,
					'code' => $code,
					'data' => is_array( $data ) ? $data : array(),
				);
			}
		}

		curl_multi_close( $mh );
		return $results;
	}

	/**
	 * Single GET against one CRM base (used when curl_multi is unavailable).
	 *
	 * @param string              $base    CRM base URL.
	 * @param string              $path    Relative path.
	 * @param array<string,mixed> $query   Query args.
	 * @param int                 $timeout Request timeout.
	 * @return array{ ok: bool, code?: int, data?: mixed, error?: string }
	 */
	private function crm_get_single_on_base( $base, $path, array $query, $timeout ) {
		$url      = add_query_arg( $query, trailingslashit( (string) $base ) . ltrim( (string) $path, '/' ) );
		$is_local = $this->is_local_bypass_base( $base );
		$headers  = array( 'Accept' => 'application/json' );
		if ( $is_local ) {
			$headers['Host'] = $this->crm_public_host();
		}
		$response = wp_remote_get(
			$url,
			array(
				'timeout'   => $timeout,
				'headers'   => $headers,
				'sslverify' => $this->should_verify_ssl_for_base( $base ),
			)
		);
		if ( is_wp_error( $response ) ) {
			return array(
				'ok'    => false,
				'error' => __( 'CRM request failed.', 'webino-dashboard' ),
			);
		}
		$code = (int) wp_remote_retrieve_response_code( $response );
		$raw  = (string) wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );
		if ( $code >= 200 && $code < 300 ) {
			return array(
				'ok'   => true,
				'code' => $code,
				'data' => is_array( $data ) ? $data : array(),
			);
		}
		return array(
			'ok'    => false,
			'error' => __( 'CRM request failed.', 'webino-dashboard' ),
		);
	}
}

add_filter(
	'cron_schedules',
	static function ( $schedules ) {
		if ( ! isset( $schedules['webino_dashboard_license_12h'] ) ) {
			$schedules['webino_dashboard_license_12h'] = array(
				'interval' => 12 * HOUR_IN_SECONDS,
				'display'  => __( 'Every 12 hours (Webino license)', 'webino-dashboard' ),
			);
		}
		return $schedules;
	}
);
