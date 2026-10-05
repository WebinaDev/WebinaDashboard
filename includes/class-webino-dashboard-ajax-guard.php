<?php
/**
 * Keeps dashboard admin-ajax endpoints JSON-only.
 *
 * The SPA parses admin-ajax responses as JSON. Stray PHP notices/warnings (display_errors=On),
 * third-party echo output, or WordPress' "critical error" fatal page turn a valid response into
 * "Invalid AJAX response (HTML, HTTP 200)" and brick the home page. This guard buffers output for
 * the SPA's own ajax actions and, at flush time:
 *  - strips junk printed before a valid {"success":…} envelope;
 *  - converts an HTML/plain-text error page into a JSON error envelope.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Output buffer guard for Webino Dashboard admin-ajax actions.
 */
final class Webino_Dashboard_Ajax_Guard {

	/**
	 * @var bool
	 */
	private static $started = false;

	/**
	 * @var string
	 */
	private static $action = '';

	/**
	 * @var string
	 */
	private static $buffer = '';

	/**
	 * Actions the SPA calls through admin-ajax (see client/src/lib/api.ts ajaxActionForPath).
	 *
	 * @param string $action Ajax action.
	 * @return bool
	 */
	public static function is_guarded_action( $action ) {
		$action = (string) $action;
		if ( '' === $action ) {
			return false;
		}
		return (bool) preg_match(
			'/^webino_dashboard_(bootstrap|auth_session|overview|sms_panel|shop_rest|bots_rest|payments_rest|analytics_rest|digikala_[a-z_]+|basalam_oauth_(start|complete))$/',
			$action
		);
	}

	/**
	 * Start buffering when this is a guarded admin-ajax request. Call as early as possible.
	 *
	 * @return void
	 */
	public static function maybe_start() {
		if ( self::$started ) {
			return;
		}
		if ( ! ( defined( 'DOING_AJAX' ) && DOING_AJAX ) ) {
			return;
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- routing only, no state change.
		$action = isset( $_REQUEST['action'] ) ? (string) $_REQUEST['action'] : '';
		$action = preg_replace( '/[^a-z0-9_]/', '', strtolower( $action ) );
		if ( ! self::is_guarded_action( $action ) ) {
			return;
		}
		if ( (bool) apply_filters( 'webino_dashboard_ajax_guard_disabled', false ) ) {
			return;
		}
		self::$started = true;
		self::$action  = $action;
		ob_start( array( __CLASS__, 'filter_output' ) );
	}

	/**
	 * Output buffer callback.
	 *
	 * @param string $chunk Buffered output.
	 * @param int    $phase PHP_OUTPUT_HANDLER_* bitmask.
	 * @return string
	 */
	public static function filter_output( $chunk, $phase ) {
		self::$buffer .= (string) $chunk;
		if ( ! ( $phase & PHP_OUTPUT_HANDLER_FINAL ) ) {
			// Explicit ob_flush() mid-request: keep accumulating; emit once at the end.
			return '';
		}
		$out          = self::sanitize( self::$buffer );
		self::$buffer = '';
		return $out;
	}

	/**
	 * @param string $raw Full response body.
	 * @return string
	 */
	public static function sanitize( $raw ) {
		$raw     = (string) $raw;
		$trimmed = trim( $raw );
		if ( '' === $trimmed ) {
			return self::error_json( 'Empty response from server.', 'empty_response' );
		}
		if ( self::is_json( $trimmed ) ) {
			return $raw;
		}
		// Junk (PHP notice/warning HTML, BOM, stray echo) printed before the JSON envelope.
		$pos = strpos( $raw, '{"success":' );
		if ( false !== $pos && $pos > 0 ) {
			$tail = substr( $raw, $pos );
			if ( self::is_json( trim( $tail ) ) ) {
				return $tail;
			}
		}
		// Fatal error page / wp_die text / "-1" / "0".
		$text = trim( preg_replace( '/\s+/', ' ', self::strip_tags_safe( $raw ) ) );
		if ( '-1' === $text ) {
			return self::error_json( 'Invalid nonce', 'invalid_nonce' );
		}
		if ( '0' === $text ) {
			return self::error_json( 'Ajax action not registered (plugin/module not loaded).', 'ajax_unhandled' );
		}
		$msg = '' !== $text ? substr( $text, 0, 300 ) : 'Server error.';
		return self::error_json( $msg, 'php_error' );
	}

	/**
	 * @param string $s String.
	 * @return bool
	 */
	private static function is_json( $s ) {
		if ( '' === $s || ( '{' !== $s[0] && '[' !== $s[0] ) ) {
			return false;
		}
		json_decode( $s );
		return JSON_ERROR_NONE === json_last_error();
	}

	/**
	 * @param string $message Message.
	 * @param string $code    Code.
	 * @return string
	 */
	private static function error_json( $message, $code ) {
		$json = json_encode(
			array(
				'success' => false,
				'data'    => array(
					'message' => (string) $message,
					'code'    => (string) $code,
					'action'  => self::$action,
				),
			),
			JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
		);
		return false !== $json ? $json : '{"success":false,"data":{"message":"Server error.","code":"php_error"}}';
	}

	/**
	 * strip_tags that also drops <script>/<style> bodies; safe before WP formatting.php loads.
	 *
	 * @param string $s HTML.
	 * @return string
	 */
	private static function strip_tags_safe( $s ) {
		$s = preg_replace( '@<(script|style)[^>]*?>.*?</\\1>@si', '', (string) $s );
		return html_entity_decode( strip_tags( (string) $s ), ENT_QUOTES, 'UTF-8' );
	}
}
