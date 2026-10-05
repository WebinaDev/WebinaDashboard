<?php
/**
 * Endpoint-level coverage registry for Digikala Open API.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Endpoint_Registry {

	const CACHE_KEY = 'webino_digikala_endpoint_registry_cache';
	const CACHE_TTL = 6 * HOUR_IN_SECONDS;
	const SCHEMA_VERSION = '2.0.0';

	/**
	 * Backward-compatible helper. Returns only endpoint rows.
	 *
	 * @param array<string,mixed> $args Optional args.
	 * @return array<int,array<string,mixed>>|WP_Error
	 */
	public static function all( array $args = array() ) {
		$report = self::report( $args );
		if ( is_wp_error( $report ) ) {
			return $report;
		}
		return is_array( $report['items'] ?? null ) ? $report['items'] : array();
	}

	/**
	 * Build complete report with items + summary + meta.
	 *
	 * @param array<string,mixed> $args Optional args.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function report( array $args = array() ) {
		$force_refresh = ! empty( $args['force_refresh'] );
		$version       = self::cache_version();
		$cache_key     = self::CACHE_KEY . '_' . $version;

		if ( ! $force_refresh ) {
			$cached = get_transient( $cache_key );
			if ( is_array( $cached ) ) {
				return $cached;
			}
		}

		$started_at = microtime( true );
		$raw        = self::fetch_spec();
		if ( is_wp_error( $raw ) ) {
			return $raw;
		}

		$parse_errors = array();
		$call_sites   = self::scan_call_sites( $parse_errors );
		$dispatcher   = self::scan_dispatcher_map( $parse_errors );
		$items        = self::extract_endpoints( $raw, $call_sites, $dispatcher );

		$report = array(
			'summary' => self::summarize( $items ),
			'items'   => $items,
			'meta'    => array(
				'schema_version'         => self::SCHEMA_VERSION,
				'generated_at'           => gmdate( 'c' ),
				'source_scan_count'      => count( $call_sites ),
				'dispatcher_scan_count'  => count( $dispatcher ),
				'files_scanned'          => self::files_scanned_count(),
				'endpoints_resolved'     => count( $items ),
				'parse_duration_ms'      => (int) round( ( microtime( true ) - $started_at ) * 1000 ),
				'cache_version'          => $version,
				'partial'                => ! empty( $parse_errors ),
				'parse_errors'           => $parse_errors,
				'assertions'             => self::key_endpoint_assertions( $items ),
			),
		);

		set_transient( $cache_key, $report, self::CACHE_TTL );
		return $report;
	}

	/**
	 * @param array<string,mixed> $args Optional args.
	 * @return array<string,int>|WP_Error
	 */
	public static function summary( array $args = array() ) {
		$report = self::report( $args );
		if ( is_wp_error( $report ) ) {
			return $report;
		}
		return is_array( $report['summary'] ?? null ) ? $report['summary'] : array();
	}

	/**
	 * @return string|WP_Error
	 */
	private static function fetch_spec() {
		$settings = Digikala_Auth::settings();
		$url = trailingslashit( (string) $settings['base_url'] ) . 'open-api/v1/doc/specification.yml';
		$res = wp_remote_get(
			$url,
			array(
				'timeout' => 25,
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$code = wp_remote_retrieve_response_code( $res );
		$body = (string) wp_remote_retrieve_body( $res );
		if ( $code < 200 || $code >= 300 || '' === trim( $body ) ) {
			return new WP_Error( 'dk_spec_fetch_failed', __( 'Could not fetch Digikala OpenAPI spec.', 'webino-dashboard' ), array( 'status' => 502 ) );
		}
		return $body;
	}

	/**
	 * @param string                                       $raw Raw OpenAPI YAML string.
	 * @param array<string,array<string,mixed>>            $call_sites Parsed Digikala_Client::request call-sites.
	 * @param array<string,array{class:string,method:string}> $dispatcher Parsed job_type => dispatcher map.
	 * @return array<int,array<string,mixed>>
	 */
	private static function extract_endpoints( $raw, array $call_sites, array $dispatcher ) {
		$regex = "#(/open-api/v1/[a-zA-Z0-9_\\-/\\{\\}]+)\\s*:\\s*\\{\\s*(get|post|put|patch|delete)#";
		preg_match_all( $regex, $raw, $matches, PREG_SET_ORDER );
		$seen = array();
		$out  = array();
		foreach ( $matches as $m ) {
			$path = (string) $m[1];
			$method = strtoupper( (string) $m[2] );
			$key = $method . ' ' . $path;
			if ( isset( $seen[ $key ] ) ) {
				continue;
			}
			$seen[ $key ] = true;
			$class = self::classify( $method, $path, $call_sites, $dispatcher );
			$out[] = array(
				'method'      => $method,
				'path'        => $path,
				'status'      => $class['status'],
				'source'      => $class['source'],
				'sources'     => $class['sources'],
				'job_types'   => $class['job_types'],
				'dispatchers' => $class['dispatchers'],
				'confidence'  => $class['confidence'],
			);
		}
		usort(
			$out,
			static function ( $a, $b ) {
				return strcmp( $a['path'] . $a['method'], $b['path'] . $b['method'] );
			}
		);
		return $out;
	}

	/**
	 * @param string $method HTTP method.
	 * @param string $path API path.
	 * @param array<string,array<string,mixed>> $call_sites Call-sites map.
	 * @param array<string,array{class:string,method:string}> $dispatcher Dispatcher map.
	 * @return array<string,mixed>
	 */
	private static function classify( $method, $path, array $call_sites, array $dispatcher ) {
		$key = $method . ' ' . $path;
		if ( ! isset( $call_sites[ $key ] ) ) {
			return array(
				'status'      => 'pending',
				'source'      => 'openapi_only',
				'sources'     => array(),
				'job_types'   => array(),
				'dispatchers' => array(),
				'confidence'  => 'low',
			);
		}

		$entry       = $call_sites[ $key ];
		$sources     = isset( $entry['sources'] ) && is_array( $entry['sources'] ) ? array_values( $entry['sources'] ) : array();
		$job_types   = array();
		$dispatchers = array();

		if ( isset( $entry['handlers'] ) && is_array( $entry['handlers'] ) ) {
			foreach ( $entry['handlers'] as $handler ) {
				if ( ! is_string( $handler ) || '' === $handler ) {
					continue;
				}
				foreach ( $dispatcher as $job_type => $mapping ) {
					$sig = $mapping['class'] . '::' . $mapping['method'];
					if ( $sig !== $handler ) {
						continue;
					}
					$job_types[]   = (string) $job_type;
					$dispatchers[] = $sig;
				}
			}
		}

		$job_types   = self::stable_unique_sort( $job_types );
		$dispatchers = self::stable_unique_sort( $dispatchers );
		$source      = ! empty( $sources ) ? (string) $sources[0] : 'code_scan';

		if ( ! empty( $job_types ) ) {
			$status = self::is_queued_job_only( $job_types ) ? 'queued' : 'implemented';
			return array(
				'status'      => $status,
				'source'      => $source,
				'sources'     => $sources,
				'job_types'   => $job_types,
				'dispatchers' => $dispatchers,
				'confidence'  => 'high',
			);
		}

		return array(
			'status'      => 'queued',
			'source'      => $source,
			'sources'     => $sources,
			'job_types'   => array(),
			'dispatchers' => array(),
			'confidence'  => 'low',
		);
	}

	/**
	 * @param array<int,string> $job_types Job types.
	 * @return bool
	 */
	private static function is_queued_job_only( array $job_types ) {
		foreach ( $job_types as $job ) {
			if ( 0 !== strpos( $job, 'phase2_' ) ) {
				return false;
			}
		}
		return ! empty( $job_types );
	}

	/**
	 * Parse call-sites from includes PHP files.
	 *
	 * @param array<int,string> $parse_errors Parse error list.
	 * @return array<string,array<string,mixed>>
	 */
	private static function scan_call_sites( array &$parse_errors ) {
		$files = self::include_php_files();
		$map   = array();
		foreach ( $files as $path ) {
			$contents = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			if ( ! is_string( $contents ) ) {
				$parse_errors[] = 'Unable to read file: ' . basename( $path );
				continue;
			}
			if ( false === strpos( $contents, 'Digikala_Client::request' ) ) {
				continue;
			}
			$class_name = self::extract_class_name( $contents );
			preg_match_all(
				'/Digikala_Client::request\(\s*([\'"]([A-Za-z]+)[\'"])\s*,\s*([\'"]([^\'"]+)[\'"])/',
				$contents,
				$matches,
				PREG_SET_ORDER | PREG_OFFSET_CAPTURE
			);
			foreach ( $matches as $m ) {
				$method = strtoupper( (string) $m[2][0] );
				$api_path = (string) $m[4][0];
				if ( '' === $method || '' === $api_path ) {
					continue;
				}
				$endpoint_key = $method . ' /' . ltrim( $api_path, '/' );
				$offset       = isset( $m[0][1] ) ? (int) $m[0][1] : 0;
				$line         = 1 + substr_count( substr( $contents, 0, $offset ), "\n" );
				$fn_name      = self::extract_enclosing_function( $contents, $offset );
				$handler_sig  = $class_name && $fn_name ? $class_name . '::' . $fn_name : '';
				$source       = self::sanitize_source( str_replace( trailingslashit( dirname( __DIR__ ) ), '', $path ) . ':' . $line );
				if ( ! isset( $map[ $endpoint_key ] ) ) {
					$map[ $endpoint_key ] = array(
						'sources'  => array(),
						'handlers' => array(),
					);
				}
				$map[ $endpoint_key ]['sources'][] = $source;
				if ( '' !== $handler_sig ) {
					$map[ $endpoint_key ]['handlers'][] = $handler_sig;
				}
			}
		}
		foreach ( $map as $key => $entry ) {
			$map[ $key ]['sources']  = self::stable_unique_sort( is_array( $entry['sources'] ) ? $entry['sources'] : array() );
			$map[ $key ]['handlers'] = self::stable_unique_sort( is_array( $entry['handlers'] ) ? $entry['handlers'] : array() );
		}
		ksort( $map, SORT_STRING );
		return $map;
	}

	/**
	 * Parse job_type => dispatcher map from Digikala_Jobs::dispatch.
	 *
	 * @param array<int,string> $parse_errors Parse error list.
	 * @return array<string,array{class:string,method:string}>
	 */
	private static function scan_dispatcher_map( array &$parse_errors ) {
		$file = trailingslashit( dirname( __DIR__ ) ) . 'includes/class-digikala-jobs.php';
		$map  = array();
		$raw  = file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( ! is_string( $raw ) ) {
			$parse_errors[] = 'Unable to read dispatcher file.';
			return $map;
		}
		preg_match_all(
			"/case\\s+'([^']+)'\\s*:\\s*\\\$ok\\s*=\\s*([A-Za-z0-9_]+)::([A-Za-z0-9_]+)\\(/",
			$raw,
			$matches,
			PREG_SET_ORDER
		);
		foreach ( $matches as $m ) {
			$map[ (string) $m[1] ] = array(
				'class'  => (string) $m[2],
				'method' => (string) $m[3],
			);
		}
		ksort( $map, SORT_STRING );
		return $map;
	}

	/**
	 * @return array<string>
	 */
	private static function include_php_files() {
		$root = trailingslashit( dirname( __DIR__ ) ) . 'includes/';
		$out  = array();
		if ( ! is_dir( $root ) ) {
			return $out;
		}
		$it = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $root, FilesystemIterator::SKIP_DOTS )
		);
		foreach ( $it as $file ) {
			if ( ! $file instanceof SplFileInfo || 'php' !== strtolower( (string) $file->getExtension() ) ) {
				continue;
			}
			$out[] = (string) $file->getPathname();
		}
		sort( $out, SORT_STRING );
		return $out;
	}

	/**
	 * @return int
	 */
	private static function files_scanned_count() {
		return count( self::include_php_files() );
	}

	/**
	 * @param array<int,array<string,mixed>> $items Items.
	 * @return array<string,int>
	 */
	private static function summarize( array $items ) {
		$summary = array(
			'implemented' => 0,
			'queued'      => 0,
			'pending'     => 0,
			'total'       => 0,
		);
		foreach ( $items as $row ) {
			$status = (string) ( $row['status'] ?? 'pending' );
			if ( isset( $summary[ $status ] ) ) {
				$summary[ $status ]++;
			}
			$summary['total']++;
		}
		return $summary;
	}

	/**
	 * @param string $contents File contents.
	 * @return string
	 */
	private static function extract_class_name( $contents ) {
		if ( preg_match( '/class\s+([A-Za-z0-9_]+)/', $contents, $m ) ) {
			return (string) $m[1];
		}
		return '';
	}

	/**
	 * @param string $contents File contents.
	 * @param int    $offset Offset in bytes.
	 * @return string
	 */
	private static function extract_enclosing_function( $contents, $offset ) {
		$prefix = substr( $contents, 0, max( 0, (int) $offset ) );
		if ( ! is_string( $prefix ) || '' === $prefix ) {
			return '';
		}
		preg_match_all( '/function\s+([A-Za-z0-9_]+)\s*\(/', $prefix, $matches );
		if ( empty( $matches[1] ) || ! is_array( $matches[1] ) ) {
			return '';
		}
		$last = end( $matches[1] );
		return is_string( $last ) ? $last : '';
	}

	/**
	 * @param array<int,string> $items List.
	 * @return array<int,string>
	 */
	private static function stable_unique_sort( array $items ) {
		$items = array_values( array_unique( array_filter( $items ) ) );
		sort( $items, SORT_STRING );
		return $items;
	}

	/**
	 * @param string $source Source representation.
	 * @return string
	 */
	private static function sanitize_source( $source ) {
		$clean = (string) $source;
		$clean = preg_replace( '/(token|secret|authorization|access)[^\/:\s]*/i', '***', $clean );
		return is_string( $clean ) ? $clean : '';
	}

	/**
	 * @return string
	 */
	private static function cache_version() {
		$files = self::include_php_files();
		$data  = '';
		foreach ( $files as $file ) {
			$mtime = filemtime( $file );
			$data .= $file . '|' . ( false === $mtime ? '0' : (string) $mtime ) . ';';
		}
		return substr( sha1( $data . '|' . self::SCHEMA_VERSION ), 0, 12 );
	}

	/**
	 * @param array<int,array<string,mixed>> $items Registry rows.
	 * @return array<string,bool>
	 */
	private static function key_endpoint_assertions( array $items ) {
		$index = array();
		foreach ( $items as $row ) {
			$key = strtoupper( (string) ( $row['method'] ?? '' ) ) . ' ' . (string) ( $row['path'] ?? '' );
			$index[ $key ] = true;
		}
		return array(
			'auth_token_present'       => ! empty( $index['POST /open-api/v1/auth/token'] ),
			'orders_present'           => ! empty( $index['GET /open-api/v1/orders'] ) || ! empty( $index['POST /open-api/v1/orders/search'] ),
			'inventories_update_present' => ! empty( $index['POST /open-api/v1/inventories/update'] ),
		);
	}
}
