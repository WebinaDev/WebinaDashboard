<?php
/**
 * WAF orchestrator (L2/L3).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Webino Shield WAF orchestration.
 */
final class Webino_Shield_Waf {

	/** @var int */
	private static $errors = 0;

	/** @var int */
	private static $error_window = 0;

	/** @var bool Circuit open — skip rule evaluation (fail-open). */
	private static $circuit_open = false;

	/**
	 * @return void
	 */
	public static function init() {
		if ( self::is_disabled() ) {
			return;
		}

		$settings = Webino_Dashboard_Security_Settings::get();
		if ( empty( $settings['waf']['layer3_hooks'] ) || empty( $settings['waf']['enabled'] ) ) {
			return;
		}

		// Module bootstrap runs on init@10 (after plugins_loaded). Evaluate on this request.
		if ( did_action( 'plugins_loaded' ) ) {
			add_action( 'init', array( __CLASS__, 'evaluate_request' ), 20 );
		} else {
			add_action( 'plugins_loaded', array( __CLASS__, 'evaluate_request' ), 1 );
		}
	}

	/**
	 * MU-plugin early hook — only schedule evaluation; do not short-circuit permanently
	 * before Settings/Rules exist (module loads on init@10).
	 *
	 * @return void
	 */
	public static function init_mu() {
		// L0 lite already ran from MU stub. Full rules wait for module bootstrap.
		add_action( 'init', array( __CLASS__, 'evaluate_request' ), 20 );
	}

	/**
	 * @return bool
	 */
	public static function is_disabled() {
		if ( class_exists( 'Webino_Dashboard_Security_Install', false )
			&& Webino_Dashboard_Security_Install::is_disabled_file_present() ) {
			return true;
		}
		if ( defined( 'WP_CONTENT_DIR' ) && is_readable( trailingslashit( WP_CONTENT_DIR ) . 'webino-shield.disable' ) ) {
			return true;
		}
		if ( ! class_exists( 'Webino_Dashboard_Security_Settings', false ) ) {
			return false;
		}
		$settings = Webino_Dashboard_Security_Settings::get();
		return empty( $settings['general']['enabled'] ) || empty( $settings['waf']['enabled'] );
	}

	/**
	 * @return void
	 */
	public static function evaluate_request() {
		static $done = false;
		if ( $done ) {
			return;
		}

		if ( ! class_exists( 'Webino_Dashboard_Security_Settings', false )
			|| ! class_exists( 'Webino_Shield_Rules', false ) ) {
			// Not ready yet — do NOT set $done so a later hook can retry.
			return;
		}

		$done = true;

		if ( self::is_disabled() ) {
			return;
		}

		if ( self::$circuit_open ) {
			return;
		}

		if ( self::should_skip() ) {
			return;
		}

		try {
			$request = self::normalize_request();
			$result  = Webino_Shield_Rules::evaluate( $request );

			if ( 'allow' === $result['action'] ) {
				return;
			}

			self::log_event( $request, $result );

			if ( 'log' === $result['action'] ) {
				return;
			}

			if ( in_array( $result['action'], array( 'block', 'virtual_patch_block' ), true ) ) {
				if ( ! empty( $result['auto_block'] ) ) {
					Webino_Shield_Blocklist::auto_block(
						$request['ip'],
						$result['rule_id'] ?? 'waf',
						30
					);
				}
				self::block_response( $result );
			}
		} catch ( Exception $e ) {
			self::handle_error( $e );
		}
	}

	/**
	 * @return bool
	 */
	private static function should_skip() {
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			$s = Webino_Dashboard_Security_Settings::get();
			if ( ! empty( $s['perf']['disable_on_wp_cli'] ) ) {
				return true;
			}
		}

		if ( defined( 'DOING_CRON' ) && DOING_CRON ) {
			$s = Webino_Dashboard_Security_Settings::get();
			if ( ! empty( $s['perf']['disable_on_cron'] ) ) {
				return true;
			}
		}

		$uri  = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
		$path = (string) ( wp_parse_url( $uri, PHP_URL_PATH ) ?: '/' );
		$s    = Webino_Dashboard_Security_Settings::get();
		$skip = array_filter( array_map( 'trim', explode( ',', (string) ( $s['waf']['skip_paths'] ?? '' ) ) ) );
		// Always protect dashboard + payment/checkout paths from false positives.
		$hard = array( '/dashboard', '/checkout', '/order-pay' );
		$query_skip = array( 'wc-ajax', 'wc-api' );
		foreach ( array_merge( $skip, $hard ) as $needle ) {
			if ( '' === $needle ) {
				continue;
			}
			if ( self::path_segment_match( $path, $needle ) ) {
				return true;
			}
		}
		foreach ( $query_skip as $q ) {
			if ( false !== strpos( $uri, $q ) ) {
				return true;
			}
		}

		if ( false !== strpos( $uri, '/wp-json/webino-dashboard/v1/security' ) ) {
			return true;
		}

		// Operator-configured REST namespaces to skip (e.g. my-plugin/v1).
		$ns_raw = (string) ( $s['waf']['skip_rest_namespaces'] ?? '' );
		foreach ( array_filter( array_map( 'trim', explode( ',', $ns_raw ) ) ) as $ns ) {
			$ns = trim( $ns, '/' );
			if ( '' !== $ns && false !== strpos( $uri, '/wp-json/' . $ns ) ) {
				return true;
			}
		}

		// Only skip for allowlisted IPs — never blanket-skip every manage_security user.
		$ip = Webino_Dashboard_Security::get_client_ip();
		if ( $ip && Webino_Shield_Blocklist::is_allowed( $ip ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Path-segment aware match: /checkout matches /checkout and /checkout/… but not /my-checkout-guide.
	 *
	 * @param string $path   Request path.
	 * @param string $needle Configured skip path.
	 * @return bool
	 */
	private static function path_segment_match( $path, $needle ) {
		$needle = '/' . trim( $needle, '/' );
		if ( '/' === $needle ) {
			return false;
		}
		if ( $path === $needle || 0 === strpos( $path, $needle . '/' ) ) {
			return true;
		}
		// Allow bare slug match when needle has no leading slash semantics already applied.
		return false;
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function normalize_request() {
		$ip  = Webino_Dashboard_Security::get_client_ip();
		$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '/';
		$ua  = isset( $_SERVER['HTTP_USER_AGENT'] ) ? (string) wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) : '';
		$query = isset( $_SERVER['QUERY_STRING'] ) ? (string) wp_unslash( $_SERVER['QUERY_STRING'] ) : '';
		$body  = '';
		if ( ! empty( $_POST ) && is_array( $_POST ) ) {
			$body = wp_json_encode( wp_unslash( $_POST ) );
		}

		$geo = Webino_Shield_Geo::lookup( $ip );
		return array(
			'ip'      => $ip,
			'ip_hash' => Webino_Dashboard_Security::ip_hash( $ip ),
			'method'  => isset( $_SERVER['REQUEST_METHOD'] ) ? strtoupper( (string) $_SERVER['REQUEST_METHOD'] ) : 'GET',
			'uri'     => $uri,
			'path'    => wp_parse_url( $uri, PHP_URL_PATH ) ?: '/',
			'query'   => $query,
			'body'    => $body,
			'payload' => $query . ' ' . $body,
			'ua'      => $ua,
			'ua_hash' => hash( 'sha256', $ua ),
			'country' => Webino_Shield_Geo::country_code(),
			'asn'     => (string) ( $geo['asn'] ?? Webino_Shield_Geo::asn_for_ip( $ip ) ),
		);
	}

	/**
	 * @param array<string,mixed> $request Request.
	 * @param array<string,mixed> $result  Result.
	 * @return void
	 */
	private static function log_event( $request, $result ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();

		$settings = Webino_Dashboard_Security_Settings::get();
		$ip       = $request['ip'];
		if ( ! empty( $settings['privacy']['anonymize_ip'] ) ) {
			$ip = preg_replace( '/(\d+\.\d+\.\d+)\.\d+/', '$1.0', $ip );
		}

		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'events' ),
			array(
				'created_at' => current_time( 'mysql', true ),
				'action'     => sanitize_key( (string) ( $result['action'] ?? 'log' ) ),
				'ip'         => $ip,
				'ip_hash'    => $request['ip_hash'],
				'user_id'    => get_current_user_id(),
				'method'     => sanitize_text_field( $request['method'] ),
				'path'       => sanitize_text_field( substr( $request['path'], 0, 512 ) ),
				'rule_id'    => sanitize_text_field( (string) ( $result['rule_id'] ?? '' ) ),
				'country'    => sanitize_text_field( $request['country'] ),
				'ua_hash'    => $request['ua_hash'],
				'score'      => (int) ( $result['score'] ?? 0 ),
				'meta'       => wp_json_encode( array( 'reason' => $result['reason'] ?? '' ) ),
			),
			array( '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s', '%s', '%s', '%d', '%s' )
		);
	}

	/**
	 * @param array<string,mixed> $result Result.
	 * @return void
	 */
	private static function block_response( $result ) {
		$s    = Webino_Dashboard_Security_Settings::get();
		$code = (int) ( $s['waf']['block_http_code'] ?? 403 );
		if ( ! empty( $s['waf']['tarpit_seconds'] ) ) {
			sleep( min( 5, (int) $s['waf']['tarpit_seconds'] ) );
		}
		status_header( $code );
		nocache_headers();
		header( 'Content-Type: text/html; charset=utf-8' );
		echo self::block_page_html( $result );
		exit;
	}

	/**
	 * @param array<string,mixed> $result Result.
	 * @return string
	 */
	private static function block_page_html( $result ) {
		$s     = Webino_Dashboard_Security_Settings::get();
		$brand = sanitize_text_field( (string) ( $s['waf']['page_branding'] ?? 'Webino Shield' ) );
		if ( '' === $brand ) {
			$brand = 'Webino Shield';
		}
		$ref  = esc_html( (string) ( $result['rule_id'] ?? 'shield' ) );
		$lang = function_exists( 'determine_locale' ) ? (string) determine_locale() : 'en_US';
		$fa   = 0 === strpos( $lang, 'fa' );
		$title = $fa ? 'دسترسی رد شد' : 'Access denied';
		$msg   = $fa
			? sprintf( 'درخواست شما توسط %s مسدود شد.', $brand )
			: sprintf( 'Your request was blocked by %s.', $brand );
		$ref_l = $fa ? 'کد مرجع' : 'Ref';
		return '<!DOCTYPE html><html lang="' . ( $fa ? 'fa' : 'en' ) . '" dir="' . ( $fa ? 'rtl' : 'ltr' ) . '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'
			. esc_html( $title ) . '</title><style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:3rem auto;padding:1rem;line-height:1.5}h1{font-size:1.5rem}small{color:#666}</style></head><body><h1>'
			. esc_html( $title ) . '</h1><p>' . esc_html( $msg ) . '</p><p><small>' . esc_html( $ref_l ) . ': ' . $ref . '</small></p></body></html>';
	}

	/**
	 * @param Exception $e Exception.
	 * @return void
	 */
	private static function handle_error( $e ) {
		$now = time();
		if ( $now - self::$error_window > 60 ) {
			self::$errors      = 0;
			self::$error_window = $now;
		}
		self::$errors++;

		$s = Webino_Dashboard_Security_Settings::get();
		$threshold = (int) ( $s['waf']['circuit_breaker_errors'] ?? 20 );

		if ( class_exists( 'Webino_Shield_Audit', false ) ) {
			Webino_Shield_Audit::write(
				'waf_error',
				'waf',
				(string) self::$errors,
				array( 'message' => $e->getMessage(), 'circuit' => self::$errors >= $threshold )
			);
		}

		if ( ! empty( $s['waf']['fail_open'] ) || self::$errors >= $threshold ) {
			self::$circuit_open = true;
			return;
		}
	}

	/**
	 * @return bool Whether the circuit breaker is open.
	 */
	public static function is_circuit_open() {
		return self::$circuit_open;
	}
}
