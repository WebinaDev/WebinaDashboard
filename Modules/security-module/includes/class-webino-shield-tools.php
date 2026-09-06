<?php
/**
 * Security tools handlers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tool endpoints for /security/tools/{tool}.
 */
final class Webino_Shield_Tools {

	/** @var array<string,string> */
	private static $handlers = array(
		'whois'           => 'tool_whois',
		'ip-lookup'       => 'tool_ip_lookup',
		'diagnostics'     => 'tool_diagnostics',
		'integrity-diff'  => 'tool_integrity_diff',
		'quarantine'      => 'tool_quarantine',
		'snapshots'       => 'tool_snapshots',
		'sessions'        => 'tool_sessions',
		'password-audit'  => 'tool_password_audit',
		'headers-tester'  => 'tool_headers_tester',
		'tls-dns'         => 'tool_tls_dns',
		'secrets-search'  => 'tool_secrets_search',
		'canary'          => 'tool_canary',
		'honeypot'        => 'tool_honeypot',
		'import-export'   => 'tool_import_export',
		'waf-learning'    => 'tool_waf_learning',
		'incident'        => 'tool_incident',
		'compat'          => 'tool_compat',
		'cli-recipes'     => 'tool_cli_recipes',
		'heal-wizard'     => 'tool_heal_wizard',
		'file-browser'    => 'tool_file_browser',
	);

	/**
	 * @param string              $tool Tool id.
	 * @param string              $method HTTP method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function handle( $tool, $method, $params = array() ) {
		$tool = sanitize_key( $tool );
		if ( ! isset( self::$handlers[ $tool ] ) ) {
			return new WP_Error( 'unknown_tool', 'Unknown tool', array( 'status' => 404 ) );
		}
		$cb = array( __CLASS__, self::$handlers[ $tool ] );
		return call_user_func( $cb, $method, $params );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_whois( $method, $params ) {
		unset( $method );
		$ip = sanitize_text_field( (string) ( $params['ip'] ?? Webino_Dashboard_Security::get_client_ip() ) );
		return array(
			'ip'      => $ip,
			'geo'     => Webino_Shield_Geo::lookup( $ip ),
			'events'  => self::ip_events( $ip ),
		);
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_ip_lookup( $method, $params ) {
		return self::tool_whois( $method, $params );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_diagnostics( $method, $params ) {
		unset( $method, $params );
		return array(
			'php'     => PHP_VERSION,
			'wp'      => get_bloginfo( 'version' ),
			'layers'  => Webino_Dashboard_Security_Install::layer_status(),
			'object_cache' => wp_using_ext_object_cache(),
			'cron'    => (bool) wp_next_scheduled( Webino_Shield_Feeds::CRON_HOOK ),
			'conflicts' => self::detect_conflicts(),
		);
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_integrity_diff( $method, $params ) {
		unset( $method );
		$path  = sanitize_text_field( (string) ( $params['path'] ?? '' ) );
		$local = ABSPATH . ltrim( $path, '/' );
		if ( ! is_readable( $local ) ) {
			return array( 'error' => 'not_readable' );
		}
		$local_md5    = md5_file( $local );
		$official_md5 = Webino_Shield_Heal::get_official_core_md5( $path );
		return array(
			'path'         => $path,
			'local_md5'    => $local_md5,
			'official_md5' => $official_md5,
			'match'        => $official_md5 ? hash_equals( $official_md5, $local_md5 ) : null,
		);
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_quarantine( $method, $params ) {
		if ( 'POST' === $method && ! empty( $params['restore_id'] ) ) {
			return Webino_Shield_Heal::restore_quarantine( (int) $params['restore_id'] );
		}
		return array( 'items' => Webino_Shield_Heal::list_quarantine( $params ) );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_snapshots( $method, $params ) {
		unset( $method );
		return array( 'items' => Webino_Shield_Heal::list_snapshots( $params ) );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_sessions( $method, $params ) {
		unset( $method, $params );
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'sessions' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( "SELECT * FROM {$table} WHERE invalidated = 0 ORDER BY last_seen DESC LIMIT 50", ARRAY_A );
		return array( 'sessions' => $rows ?: array() );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_password_audit( $method, $params ) {
		unset( $method, $params );
		$users = get_users( array( 'role__in' => array( 'administrator', 'editor' ), 'number' => 100 ) );
		$weak  = array();
		$top   = self::top_passwords();
		foreach ( $users as $user ) {
			$issues = array();
			if ( ! Webino_Shield_2FA::is_enabled( $user->ID ) ) {
				$issues[] = 'no_2fa';
			}
			$hash = $user->user_pass;
			foreach ( $top as $pwd ) {
				if ( wp_check_password( $pwd, $hash, $user->ID ) ) {
					$issues[] = 'common_password';
					break;
				}
			}
			if ( $issues ) {
				$weak[] = array(
					'id'     => $user->ID,
					'login'  => $user->user_login,
					'issues' => $issues,
				);
			}
		}
		return array( 'users' => $weak, 'checked_common_passwords' => count( $top ) );
	}

	/**
	 * Local top common passwords for offline audit (no external API).
	 *
	 * @return array<int,string>
	 */
	private static function top_passwords() {
		return array(
			'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
			'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
			'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
			'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang',
			'password1', 'admin', 'admin123', 'root', 'toor', 'pass', 'test', 'guest',
			'changeme', 'wordpress', 'wp-admin', 'secret', 'login', 'access',
		);
	}

	/**
	 * Read-only file browser under ABSPATH (no write/delete).
	 *
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function tool_file_browser( $method, $params ) {
		unset( $method );
		$rel = sanitize_text_field( (string) ( $params['path'] ?? '' ) );
		$rel = ltrim( str_replace( '\\', '/', $rel ), '/' );
		if ( false !== strpos( $rel, '..' ) ) {
			return new WP_Error( 'bad_path', 'Invalid path', array( 'status' => 400 ) );
		}
		$base = wp_normalize_path( ABSPATH );
		$path = wp_normalize_path( '' === $rel ? $base : trailingslashit( $base ) . $rel );
		if ( 0 !== strpos( $path, $base ) || ! file_exists( $path ) ) {
			return new WP_Error( 'not_found', 'Path not found', array( 'status' => 404 ) );
		}
		if ( is_file( $path ) ) {
			$size = filesize( $path );
			$hash = is_readable( $path ) && $size !== false && $size < 5 * MB_IN_BYTES ? md5_file( $path ) : '';
			return array(
				'type' => 'file',
				'path' => $rel,
				'size' => $size,
				'md5'  => $hash,
				'mtime'=> filemtime( $path ),
			);
		}
		$entries = array();
		$dh = opendir( $path );
		if ( ! $dh ) {
			return new WP_Error( 'unreadable', 'Cannot read directory', array( 'status' => 403 ) );
		}
		while ( false !== ( $name = readdir( $dh ) ) ) {
			if ( '.' === $name || '..' === $name ) {
				continue;
			}
			$full = $path . '/' . $name;
			$entries[] = array(
				'name'  => $name,
				'type'  => is_dir( $full ) ? 'dir' : 'file',
				'size'  => is_file( $full ) ? filesize( $full ) : null,
				'mtime' => filemtime( $full ),
			);
			if ( count( $entries ) >= 500 ) {
				break;
			}
		}
		closedir( $dh );
		usort(
			$entries,
			static function ( $a, $b ) {
				if ( $a['type'] !== $b['type'] ) {
					return 'dir' === $a['type'] ? -1 : 1;
				}
				return strcasecmp( $a['name'], $b['name'] );
			}
		);
		return array( 'type' => 'dir', 'path' => $rel, 'entries' => $entries );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_headers_tester( $method, $params ) {
		unset( $method, $params );
		return Webino_Shield_Headers::test_front();
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_tls_dns( $method, $params ) {
		unset( $method, $params );
		$host   = (string) wp_parse_url( home_url(), PHP_URL_HOST );
		$result = array(
			'host' => $host,
			'ssl'  => is_ssl(),
		);

		if ( ! function_exists( 'dns_get_record' ) ) {
			$result['dns_available'] = false;
			$result['hints']         = array(
				'spf'   => 'Check DNS TXT records manually',
				'dmarc' => '_dmarc.' . $host,
			);
			return $result;
		}

		$result['dns_available'] = true;

		// TXT records on apex → SPF.
		$txt_records = dns_get_record( $host, DNS_TXT );
		$txt_records = is_array( $txt_records ) ? $txt_records : array();

		$spf_record = null;
		foreach ( $txt_records as $rec ) {
			$txt = (string) ( $rec['txt'] ?? ( isset( $rec['entries'] ) ? implode( '', (array) $rec['entries'] ) : '' ) );
			if ( 0 === strpos( $txt, 'v=spf' ) ) {
				$spf_record = $txt;
				break;
			}
		}
		$result['spf']        = null !== $spf_record;
		$result['spf_record'] = $spf_record;

		// DMARC — _dmarc sub-domain.
		$dmarc_records = dns_get_record( '_dmarc.' . $host, DNS_TXT );
		$dmarc_records = is_array( $dmarc_records ) ? $dmarc_records : array();

		$dmarc_record = null;
		foreach ( $dmarc_records as $rec ) {
			$txt = (string) ( $rec['txt'] ?? ( isset( $rec['entries'] ) ? implode( '', (array) $rec['entries'] ) : '' ) );
			if ( false !== strpos( $txt, 'v=DMARC' ) ) {
				$dmarc_record = $txt;
				break;
			}
		}
		$result['dmarc']        = null !== $dmarc_record;
		$result['dmarc_record'] = $dmarc_record;

		// CAA records.
		$caa_records     = dns_get_record( $host, DNS_CAA );
		$caa_records     = is_array( $caa_records ) ? $caa_records : array();
		$result['caa']   = count( $caa_records ) > 0;
		$result['caa_records'] = array_map(
			static function ( $r ) {
				return array(
					'tag'   => $r['tag'] ?? '',
					'value' => $r['value'] ?? '',
				);
			},
			$caa_records
		);

		// MX records.
		$mx_records        = dns_get_record( $host, DNS_MX );
		$mx_records        = is_array( $mx_records ) ? $mx_records : array();
		$result['mx_count'] = count( $mx_records );
		$result['mx']       = array_map(
			static function ( $r ) {
				return array(
					'host'     => (string) ( $r['target'] ?? '' ),
					'priority' => (int) ( $r['pri'] ?? 0 ),
				);
			},
			$mx_records
		);

		return $result;
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_secrets_search( $method, $params ) {
		unset( $method );
		$path = sanitize_text_field( (string) ( $params['path'] ?? WP_CONTENT_DIR ) );
		$hits = Webino_Shield_Malware::scan_file( $path );
		return array( 'findings' => $hits );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_canary( $method, $params ) {
		if ( 'POST' === $method ) {
			return Webino_Shield_Canary::create( $params );
		}
		return array( 'canaries' => Webino_Shield_Canary::list_all() );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_honeypot( $method, $params ) {
		unset( $method, $params );
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'events' );
		$count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE rule_id LIKE '%honeypot%'" );
		return array( 'hits' => $count, 'enabled' => Webino_Dashboard_Security_Settings::get()['login']['honeypot'] ?? false );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_import_export( $method, $params ) {
		if ( 'POST' === $method ) {
			// Wordfence-style IP list import (CSV or newline / JSON array).
			if ( ! empty( $params['wordfence_blocks'] ) ) {
				$raw   = (string) $params['wordfence_blocks'];
				$items = array();
				$json  = json_decode( $raw, true );
				if ( is_array( $json ) ) {
					$items = $json;
				} else {
					$items = preg_split( '/[\s,;]+/', $raw ) ?: array();
				}
				$added = 0;
				foreach ( $items as $item ) {
					if ( is_array( $item ) ) {
						$ip = (string) ( $item['IP'] ?? $item['ip'] ?? $item['value'] ?? '' );
					} else {
						$ip = (string) $item;
					}
					$ip = trim( $ip );
					if ( '' === $ip || ! filter_var( explode( '/', $ip )[0], FILTER_VALIDATE_IP ) ) {
						continue;
					}
					$type = false !== strpos( $ip, '/' ) ? 'cidr' : 'ip';
					Webino_Shield_Blocklist::add_block( $type, $ip, 'wordfence_import', 0 );
					$added++;
				}
				Webino_Shield_Audit::write( 'wordfence_import', 'blocks', (string) $added, array() );
				return array( 'ok' => true, 'imported' => $added );
			}
			if ( ! empty( $params['import'] ) ) {
				$data = json_decode( (string) $params['import'], true );
				if ( is_array( $data ) ) {
					Webino_Dashboard_Security_Settings::update( $data );
					return array( 'ok' => true );
				}
				return array( 'error' => 'invalid_json' );
			}
		}
		$export = Webino_Dashboard_Security_Settings::mask_secrets( Webino_Dashboard_Security_Settings::get() );
		return array( 'export' => $export );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_waf_learning( $method, $params ) {
		unset( $method );
		if ( ! empty( $params['rule_id'] ) ) {
			Webino_Shield_Rules::promote_learning( (string) $params['rule_id'] );
		}
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'rule_hits' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$hits = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY day DESC, hits DESC LIMIT 50", ARRAY_A );
		return array( 'hits' => $hits ?: array() );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_incident( $method, $params ) {
		if ( 'POST' === $method ) {
			return Webino_Shield_Forensics::create_incident( $params );
		}
		return array( 'incidents' => Webino_Shield_Forensics::list_incidents() );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_compat( $method, $params ) {
		unset( $method, $params );
		return array( 'conflicts' => self::detect_conflicts(), 'guidance' => self::compat_guidance() );
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_cli_recipes( $method, $params ) {
		unset( $method, $params );
		return array(
			'commands' => array(
				'wp webino shield status',
				'wp webino shield unlock',
				'wp webino shield scan --profile=quick',
				'wp webino shield feeds sync',
			),
		);
	}

	/**
	 * @param string              $method Method.
	 * @param array<string,mixed> $params Params.
	 * @return array<string,mixed>
	 */
	public static function tool_heal_wizard( $method, $params ) {
		unset( $method );
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'findings' );
		$limit = (int) ( $params['limit'] ?? 20 );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$open = $wpdb->get_results( "SELECT * FROM {$table} WHERE status = 'open' AND auto_heal_available = 1 ORDER BY severity DESC LIMIT {$limit}", ARRAY_A );
		$actions = array();
		foreach ( $open ?: array() as $f ) {
			$actions[] = array(
				'finding_id' => $f['id'],
				'type'       => 'integrity' === $f['category'] ? 'restore_core_file' : 'quarantine_file',
				'target'     => $f['path_or_object'],
			);
		}
		return Webino_Shield_Heal::preview( $actions );
	}

	/**
	 * @param string $ip IP.
	 * @return array<int,array<string,mixed>>
	 */
	private static function ip_events( $ip ) {
		global $wpdb;
		$hash  = Webino_Dashboard_Security::ip_hash( $ip );
		$table = Webino_Dashboard_Security_Db::table( 'events' );
		return $wpdb->get_results(
			$wpdb->prepare( "SELECT id, created_at, action, path, rule_id FROM {$table} WHERE ip_hash = %s ORDER BY id DESC LIMIT 20", $hash ),
			ARRAY_A
		) ?: array();
	}

	/**
	 * @return array<int,array<string,string>>
	 */
	private static function detect_conflicts() {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		$conflicts = array();
		if ( is_plugin_active( 'wordfence/wordfence.php' ) ) {
			$conflicts[] = array( 'plugin' => 'Wordfence', 'severity' => 'warning' );
		}
		if ( is_plugin_active( 'better-wp-security/better-wp-security.php' ) ) {
			$conflicts[] = array( 'plugin' => 'Solid Security', 'severity' => 'warning' );
		}
		return $conflicts;
	}

	/**
	 * @return array<int,string>
	 */
	private static function compat_guidance() {
		return array(
			'Disable duplicate WAF in conflicting plugins.',
			'Keep Webino Shield in learning mode during migration.',
			'Add admin IP to allowlist before enforce mode.',
		);
	}
}
