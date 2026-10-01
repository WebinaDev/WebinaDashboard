<?php
/**
 * Versioned WordPress → Webino import payload helpers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Schema name, endpoint defaults, URL checks, and redaction.
 *
 * Payload contract: docs/WEBINO_MIGRATE.md (`webino.wordpress.import.v1`).
 */
final class Webino_Dashboard_Migrate_Schema {

	const NAME = 'webino.wordpress.import.v1';

	const VERSION = 1;

	const MAX_LOG = 200;

	/**
	 * Entity keys in dependency order.
	 *
	 * @return list<string>
	 */
	public static function entity_order() {
		$order = array(
			'categories',
			'media',
			'products',
			'customers',
			'orders',
			'pages',
			'posts',
			'menus',
		);
		if ( function_exists( 'apply_filters' ) ) {
			$filtered = apply_filters( 'webino_dashboard_migrate_entities', $order );
			if ( is_array( $filtered ) ) {
				$order = array();
				foreach ( $filtered as $key ) {
					$key = sanitize_key( (string) $key );
					if ( '' !== $key ) {
						$order[] = $key;
					}
				}
			}
		}
		return array_values( array_unique( $order ) );
	}

	/**
	 * Persian labels for the admin checklist.
	 *
	 * @return array<string,string>
	 */
	public static function entity_labels() {
		return array(
			'categories' => 'دسته‌بندی‌ها و برچسب‌ها',
			'media'      => 'رسانه',
			'products'   => 'محصولات و متغیرها',
			'customers'  => 'مشتریان',
			'orders'     => 'سفارش‌ها',
			'pages'      => 'برگه‌ها',
			'posts'      => 'نوشته‌ها',
			'menus'      => 'فهرست‌ها',
		);
	}

	/**
	 * Default ingest paths, relative to the Webino site origin.
	 *
	 * @return array<string,string>
	 */
	public static function default_endpoints() {
		// Match WebinoDashboard docs/wordpress-import.md (job + ingest + run).
		$paths = array(
			'ping'     => '/api/v1/import/wordpress/ping',
			'ingest'   => '/api/v1/import/wordpress/ingest',
			'run'      => '/api/v1/import/wordpress/jobs/{id}/run',
			'complete' => '/api/v1/import/wordpress/jobs/{id}/run',
		);
		if ( function_exists( 'apply_filters' ) ) {
			$filtered = apply_filters( 'webino_dashboard_migrate_endpoints', $paths );
			if ( is_array( $filtered ) ) {
				foreach ( $paths as $key => $fallback ) {
					if ( isset( $filtered[ $key ] ) ) {
						$paths[ $key ] = self::sanitize_endpoint_path( $filtered[ $key ], $fallback );
					}
				}
			}
		}
		return $paths;
	}

	/**
	 * @param mixed  $path     Candidate path.
	 * @param string $fallback Safe default.
	 * @return string
	 */
	public static function sanitize_endpoint_path( $path, $fallback ) {
		$path = trim( (string) $path );
		if ( '' === $path ) {
			return $fallback;
		}
		if ( preg_match( '#^[a-z][a-z0-9+.-]*:#i', $path ) ) {
			return $fallback;
		}
		if ( false !== strpos( $path, '..' ) || false !== strpos( $path, '\\' ) || false !== strpos( $path, '?' ) || false !== strpos( $path, '#' ) ) {
			return $fallback;
		}
		if ( '/' !== substr( $path, 0, 1 ) ) {
			$path = '/' . $path;
		}
		if ( ! preg_match( '#^/[A-Za-z0-9_./~{}-]+$#', $path ) ) {
			return $fallback;
		}
		return $path;
	}

	/**
	 * @param string $base Site origin without trailing slash.
	 * @param string $path Absolute path.
	 * @return string
	 */
	public static function join_url( $base, $path ) {
		return rtrim( (string) $base, '/' ) . '/' . ltrim( (string) $path, '/' );
	}

	/**
	 * HTTPS origin only. Rejects userinfo, private IPs, and metadata hosts.
	 *
	 * @param string $url Raw URL.
	 * @return string|WP_Error Normalized origin (optional base path, no query).
	 */
	public static function normalize_site_url( $url ) {
		$url = trim( (string) $url );
		if ( '' === $url ) {
			return new WP_Error( 'empty_url', __( 'Enter the Webino site URL.', 'webino-dashboard' ) );
		}
		if ( ! preg_match( '#^https://#i', $url ) ) {
			return new WP_Error( 'https_required', __( 'The Webino site URL must start with https://.', 'webino-dashboard' ) );
		}
		$parts = function_exists( 'wp_parse_url' ) ? wp_parse_url( $url ) : parse_url( $url );
		if ( ! is_array( $parts ) || empty( $parts['host'] ) ) {
			return new WP_Error( 'bad_url', __( 'The Webino site URL is not valid.', 'webino-dashboard' ) );
		}
		if ( ! empty( $parts['user'] ) || ! empty( $parts['pass'] ) ) {
			return new WP_Error( 'userinfo', __( 'Remove username and password from the Webino site URL.', 'webino-dashboard' ) );
		}
		$host = strtolower( (string) $parts['host'] );
		if ( self::is_blocked_host( $host ) ) {
			return new WP_Error( 'blocked_host', __( 'That host cannot be used as a Webino destination.', 'webino-dashboard' ) );
		}
		$path = isset( $parts['path'] ) ? (string) $parts['path'] : '';
		if ( false !== strpos( $path, '..' ) ) {
			return new WP_Error( 'bad_path', __( 'The Webino site URL path is not valid.', 'webino-dashboard' ) );
		}
		$path = '/' === $path ? '' : rtrim( $path, '/' );
		$port = isset( $parts['port'] ) ? ':' . (int) $parts['port'] : '';
		return 'https://' . $host . $port . $path;
	}

	/**
	 * @param string $host Lowercase host.
	 * @return bool
	 */
	public static function is_blocked_host( $host ) {
		$host = strtolower( trim( (string) $host, '.' ) );
		if ( '' === $host ) {
			return true;
		}
		$names = array( 'localhost', 'localhost.localdomain', 'metadata.google.internal', 'metadata.internal' );
		if ( in_array( $host, $names, true ) ) {
			return true;
		}
		if ( substr( $host, -6 ) === '.local' || substr( $host, -9 ) === '.internal' ) {
			return true;
		}
		if ( false !== filter_var( $host, FILTER_VALIDATE_IP ) ) {
			$public = filter_var(
				$host,
				FILTER_VALIDATE_IP,
				FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
			);
			return false === $public;
		}
		return false;
	}

	/**
	 * @param string $job_id Job id.
	 * @param string $entity Entity key.
	 * @param string $cursor Cursor.
	 * @param int    $count  Item count in this batch.
	 * @return string Header-safe idempotency key.
	 */
	public static function idempotency_key( $job_id, $entity, $cursor, $count ) {
		$cursor = '' === (string) $cursor ? 'start' : (string) $cursor;
		$hash   = substr( hash( 'sha256', $job_id . '|' . $entity . '|' . $cursor . '|' . (int) $count ), 0, 24 );
		$key    = $job_id . ':' . $entity . ':' . $cursor . ':' . $hash;
		$key    = (string) preg_replace( '/[^A-Za-z0-9_:\-|.]/', '', $key );
		return substr( $key, 0, 180 );
	}

	/**
	 * @param string $entity  Entity key or `complete`.
	 * @param array  $items   Batch items.
	 * @param array  $batch   cursor, next_cursor, limit, done, total.
	 * @param array  $source  Source site descriptor.
	 * @param string $job_id  Job id.
	 * @return array<string,mixed>
	 */
	public static function envelope( $entity, array $items, array $batch, array $source, $job_id ) {
		return array(
			'schema'         => self::NAME,
			'schema_version' => self::VERSION,
			'job_id'         => (string) $job_id,
			'entity'         => (string) $entity,
			'source'         => $source,
			'batch'          => array(
				'cursor'      => isset( $batch['cursor'] ) ? (string) $batch['cursor'] : '',
				'next_cursor' => isset( $batch['next_cursor'] ) ? (string) $batch['next_cursor'] : '',
				'limit'       => isset( $batch['limit'] ) ? (int) $batch['limit'] : count( $items ),
				'count'       => count( $items ),
				'done'        => ! empty( $batch['done'] ),
				'total'       => isset( $batch['total'] ) ? (int) $batch['total'] : null,
			),
			'items'          => array_values( $items ),
		);
	}

	/**
	 * Final handshake after every selected entity has been pushed.
	 *
	 * @param array  $source  Source descriptor.
	 * @param array  $summary Per-entity exported counts.
	 * @param string $job_id  Job id.
	 * @return array<string,mixed>
	 */
	public static function complete_payload( array $source, array $summary, $job_id ) {
		return array(
			'schema'         => self::NAME,
			'schema_version' => self::VERSION,
			'job_id'         => (string) $job_id,
			'entity'         => 'complete',
			'source'         => $source,
			'summary'        => $summary,
		);
	}

	/**
	 * @param string $token Token.
	 * @return string
	 */
	public static function mask_token( $token ) {
		$token = (string) $token;
		$len   = strlen( $token );
		if ( $len <= 0 ) {
			return '';
		}
		if ( $len <= 8 ) {
			return str_repeat( '*', $len );
		}
		return substr( $token, 0, 4 ) . str_repeat( '*', max( 4, $len - 8 ) ) . substr( $token, -4 );
	}

	/**
	 * Remove bearer tokens and common secret assignments from a log line.
	 *
	 * @param string $text   Message.
	 * @param string $secret Known token, if any.
	 * @return string
	 */
	public static function redact( $text, $secret = '' ) {
		$text = (string) $text;
		$text = (string) preg_replace( '/Bearer\s+[A-Za-z0-9\-._~+\/=]+/i', 'Bearer [redacted]', $text );
		$text = (string) preg_replace(
			'/((?:token|api[_-]?key|authorization|secret|password)["\']?\s*[:=]\s*["\']?)([^"\'\s&,}]+)/i',
			'$1[redacted]',
			$text
		);
		$secret = (string) $secret;
		if ( strlen( $secret ) >= 6 ) {
			$text = str_replace( $secret, '[redacted]', $text );
		}
		if ( function_exists( 'mb_substr' ) ) {
			return mb_substr( $text, 0, 500 );
		}
		return substr( $text, 0, 500 );
	}

	/**
	 * Drop keys that must never leave the source site.
	 *
	 * @param mixed $value Arbitrary value.
	 * @return mixed
	 */
	public static function strip_sensitive_keys( $value ) {
		if ( ! is_array( $value ) ) {
			return $value;
		}
		$out = array();
		foreach ( $value as $key => $child ) {
			if ( is_string( $key ) && preg_match( '/password|passwd|secret|api[_-]?key|authorization|user_pass|session_token|payment_token|card_number/i', $key ) ) {
				continue;
			}
			$out[ $key ] = is_array( $child ) ? self::strip_sensitive_keys( $child ) : $child;
		}
		return $out;
	}

	/**
	 * @param string $url Candidate.
	 * @return string http(s) URL or empty.
	 */
	public static function public_url( $url ) {
		$url = trim( (string) $url );
		if ( ! preg_match( '#^https?://#i', $url ) ) {
			return '';
		}
		if ( preg_match( '/[\s<>]/', $url ) ) {
			return '';
		}
		return $url;
	}

	/**
	 * @param array<int,array<string,mixed>> $log Log rows.
	 * @param string                         $level info|warn|error.
	 * @param string                         $message Already redacted message.
	 * @param int|null                       $now Unix time.
	 * @return array<int,array<string,string>>
	 */
	public static function append_log( array $log, $level, $message, $now = null ) {
		$now   = null === $now ? time() : (int) $now;
		$level = in_array( $level, array( 'info', 'warn', 'error' ), true ) ? $level : 'info';
		$log[] = array(
			'ts'      => gmdate( 'c', $now ),
			'level'   => $level,
			'message' => self::redact( $message ),
		);
		if ( count( $log ) > self::MAX_LOG ) {
			$log = array_slice( $log, -1 * self::MAX_LOG );
		}
		return array_values( $log );
	}

	/**
	 * Source descriptor included on every batch. Safe to log.
	 *
	 * @return array<string,string>
	 */
	public static function source_site() {
		$wc = defined( 'WC_VERSION' ) ? (string) WC_VERSION : '';
		return array(
			'site_url'       => function_exists( 'home_url' ) ? (string) home_url() : '',
			'name'           => function_exists( 'get_bloginfo' ) ? (string) get_bloginfo( 'name' ) : '',
			'locale'         => function_exists( 'get_locale' ) ? (string) get_locale() : '',
			'timezone'       => function_exists( 'wp_timezone_string' ) ? (string) wp_timezone_string() : '',
			'wp_version'     => function_exists( 'get_bloginfo' ) ? (string) get_bloginfo( 'version' ) : '',
			'wc_version'     => $wc,
			'plugin_version' => defined( 'WEBINO_DASHBOARD_VERSION' ) ? (string) WEBINO_DASHBOARD_VERSION : '',
			'exported_at'    => gmdate( 'c' ),
		);
	}
}
