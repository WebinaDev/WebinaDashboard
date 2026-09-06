<?php
/**
 * Site scan orchestrator.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Queued scans: quick/standard/deep.
 */
final class Webino_Shield_Scanner {

	const CRON_HOOK = 'webino_shield_scan_tick';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( self::CRON_HOOK, array( __CLASS__, 'process_queue' ) );
		add_action( 'init', array( __CLASS__, 'schedule_daily' ), 25 );
	}

	/**
	 * @return void
	 */
	public static function schedule_daily() {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( 'daily' !== ( $s['scan']['schedule'] ?? '' ) ) {
			return;
		}
		if ( ! wp_next_scheduled( 'webino_shield_scan_daily' ) ) {
			$hour = (int) ( $s['scan']['schedule_hour'] ?? 3 );
			wp_schedule_event( strtotime( "today {$hour}:00" ), 'daily', 'webino_shield_scan_daily' );
		}
		add_action( 'webino_shield_scan_daily', function () {
			self::start( (string) ( Webino_Dashboard_Security_Settings::get()['scan']['default_profile'] ?? 'standard' ) );
		} );
	}

	/**
	 * @param string $profile Profile name.
	 * @return int|false Scan ID.
	 */
	public static function start( $profile = 'standard' ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$profile = sanitize_key( $profile );
		if ( ! in_array( $profile, array( 'quick', 'standard', 'deep', 'custom' ), true ) ) {
			$profile = 'standard';
		}

		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'scans' ),
			array(
				'profile'      => $profile,
				'status'       => 'queued',
				'progress_pct' => 0,
				'current_path' => '',
				'created_at'   => current_time( 'mysql', true ),
				'meta'         => wp_json_encode(
					array(
						'phase'            => 'integrity',
						'integrity_index'  => 0,
						'integrity_sub'    => 'dropins',
						'file_index'       => 0,
						'plugin_index'     => 0,
						'theme_index'      => 0,
					)
				),
			)
		);
		$id = (int) $wpdb->insert_id;
		self::schedule_next( $id );
		return $id;
	}

	/**
	 * @param int $scan_id Scan ID.
	 * @return void
	 */
	public static function process_queue( $scan_id = 0 ) {
		$scan_id = (int) $scan_id;
		if ( $scan_id <= 0 ) {
			return;
		}

		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'scans' );
		$scan  = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $scan_id ), ARRAY_A );
		if ( ! $scan || in_array( $scan['status'], array( 'done', 'cancelled' ), true ) ) {
			return;
		}

		$meta    = self::decode_meta( $scan['meta'] ?? '' );
		$profile = $scan['profile'];
		$phase   = (string) ( $meta['phase'] ?? 'integrity' );

		if ( 'queued' === $scan['status'] ) {
			$wpdb->update(
				$table,
				array(
					'status'     => 'running',
					'started_at' => current_time( 'mysql', true ),
				),
				array( 'id' => $scan_id )
			);
		}

		$findings     = 0;
		$current_path = '';
		$done         = false;

		switch ( $phase ) {
			case 'integrity':
				$result = self::integrity_scan_chunk( $scan_id, $profile, $meta );
				break;
			case 'files':
				$result = self::file_scan_chunk( $scan_id, $profile, $meta );
				break;
			case 'db':
				$result = self::db_scan_chunk( $scan_id, $meta );
				break;
			case 'vuln':
				$result = self::vuln_scan_chunk( $scan_id, $meta );
				break;
			case 'config':
				$result = self::config_scan_chunk( $scan_id, $meta );
				break;
			default:
				$done = true;
				$result = array( 'findings' => 0, 'done' => true, 'current_path' => '', 'meta' => $meta );
		}

		$findings     = (int) ( $result['findings'] ?? 0 );
		$current_path = (string) ( $result['current_path'] ?? '' );
		$meta         = is_array( $result['meta'] ?? null ) ? $result['meta'] : $meta;
		$chunk_done   = ! empty( $result['done'] );

		if ( $chunk_done && ! $done ) {
			$next = self::next_phase( $phase, $profile );
			if ( null === $next ) {
				$done         = true;
				$progress_pct = 100;
			} else {
				$meta['phase'] = $next;
				if ( 'files' === $next ) {
					$meta['file_index'] = 0;
				}
				$progress_pct = self::estimate_progress( $meta, $profile );
				self::schedule_next( $scan_id );
			}
		} else {
			$progress_pct = $done ? 100 : self::estimate_progress( $meta, $profile );
			if ( ! $chunk_done ) {
				self::schedule_next( $scan_id );
			}
		}

		$update = array(
			'progress_pct'   => min( 100, max( 0, (int) $progress_pct ) ),
			'current_path'   => substr( sanitize_text_field( $current_path ), 0, 512 ),
			'findings_count' => (int) $scan['findings_count'] + $findings,
			'meta'           => wp_json_encode( $meta ),
		);

		if ( $done ) {
			$update['status']       = 'done';
			$update['progress_pct'] = 100;
			$update['finished_at']  = current_time( 'mysql', true );
			$update['current_path'] = '';
		}

		$wpdb->update( $table, $update, array( 'id' => $scan_id ) );
	}

	/**
	 * @param int                  $scan_id Scan ID.
	 * @param string               $profile Profile.
	 * @param array<string,mixed>  $meta    Meta.
	 * @return array<string,mixed>
	 */
	private static function integrity_scan_chunk( $scan_id, $profile, $meta ) {
		unset( $profile );
		$s     = Webino_Dashboard_Security_Settings::get();
		$chunk = max( 25, (int) ( $s['scan']['chunk_files'] ?? 200 ) );
		$count = 0;
		$sub   = (string) ( $meta['integrity_sub'] ?? 'dropins' );

		if ( 'dropins' === $sub ) {
			$count += self::check_dropins_and_mu( $scan_id );
			$meta['integrity_sub'] = 'core';
			$meta['integrity_index'] = 0;
			return array(
				'findings'     => $count,
				'done'         => false,
				'current_path' => 'drop-ins',
				'meta'         => $meta,
			);
		}

		if ( 'core' === $sub ) {
			$cached = self::get_core_checksums();
			if ( ! is_array( $cached ) || empty( $cached['checksums'] ) ) {
				$meta['integrity_sub']   = 'plugins';
				$meta['plugin_index']    = 0;
				return array(
					'findings'     => 0,
					'done'         => false,
					'current_path' => '',
					'meta'         => $meta,
				);
			}

			$keys   = array_keys( $cached['checksums'] );
			$total  = count( $keys );
			$offset = (int) ( $meta['integrity_index'] ?? 0 );
			$slice  = array_slice( $keys, $offset, $chunk, true );

			foreach ( $slice as $rel ) {
				$md5  = $cached['checksums'][ $rel ];
				$path = ABSPATH . $rel;
				if ( ! is_readable( $path ) ) {
					continue;
				}
				if ( md5_file( $path ) !== $md5 ) {
					self::add_finding(
						$scan_id,
						array(
							'severity'            => 'high',
							'category'            => 'integrity',
							'title'               => 'Core file modified',
							'path_or_object'      => $rel,
							'remediation'         => 'Restore from wordpress.org',
							'auto_heal_available' => true,
						)
					);
					$count++;
				}
				self::index_file( $scan_id, $rel, $path );
			}

			$meta['integrity_index'] = $offset + count( $slice );
			$core_done               = $meta['integrity_index'] >= $total;

			if ( $core_done ) {
				$meta['integrity_sub']   = 'plugins';
				$meta['plugin_index']    = 0;
			}

			$last = end( $slice );
			return array(
				'findings'     => $count,
				'done'         => false,
				'current_path' => is_string( $last ) ? $last : '',
				'meta'         => $meta,
			);
		}

		if ( 'plugins' === $sub ) {
			$result = self::scan_org_plugins_chunk( $scan_id, $meta, $chunk );
			if ( ! empty( $result['plugins_done'] ) ) {
				$result['meta']['integrity_sub'] = 'themes';
				$result['meta']['theme_index']   = 0;
				$result['done']                  = false;
				$result['current_path']          = 'plugins';
			}
			return $result;
		}

		if ( 'themes' === $sub ) {
			$result = self::scan_org_themes_chunk( $scan_id, $meta, $chunk );
			$result['done'] = ! empty( $result['themes_done'] );
			return $result;
		}

		return array(
			'findings'     => 0,
			'done'         => true,
			'current_path' => '',
			'meta'         => $meta,
		);
	}

	/**
	 * @param int $scan_id Scan ID.
	 * @return int
	 */
	private static function check_dropins_and_mu( $scan_id ) {
		$count = 0;
		foreach ( array( 'advanced-cache.php', 'object-cache.php', 'db.php' ) as $dropin ) {
			$path = WP_CONTENT_DIR . '/' . $dropin;
			if ( file_exists( $path ) ) {
				self::add_finding(
					$scan_id,
					array(
						'severity'       => 'info',
						'category'       => 'integrity',
						'title'          => 'Drop-in present: ' . $dropin,
						'path_or_object' => 'wp-content/' . $dropin,
					)
				);
				self::index_file( $scan_id, 'wp-content/' . $dropin, $path );
				$count++;
			}
		}

		if ( defined( 'WPMU_PLUGIN_DIR' ) && is_dir( WPMU_PLUGIN_DIR ) ) {
			$mu_files = glob( trailingslashit( WPMU_PLUGIN_DIR ) . '*.php' );
			if ( is_array( $mu_files ) ) {
				foreach ( $mu_files as $mu_path ) {
					$rel = str_replace( ABSPATH, '', wp_normalize_path( $mu_path ) );
					self::add_finding(
						$scan_id,
						array(
							'severity'       => 'info',
							'category'       => 'integrity',
							'title'          => 'MU plugin: ' . basename( $mu_path ),
							'path_or_object' => $rel,
						)
					);
					self::index_file( $scan_id, $rel, $mu_path );
					$count++;
				}
			}
		}

		return $count;
	}

	/**
	 * @param int                  $scan_id Scan ID.
	 * @param array<string,mixed>  $meta    Meta.
	 * @param int                  $chunk   Chunk size.
	 * @return array<string,mixed>
	 */
	private static function scan_org_plugins_chunk( $scan_id, $meta, $chunk ) {
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$plugins = get_plugins();
		$keys    = array_keys( $plugins );
		$offset  = (int) ( $meta['plugin_index'] ?? 0 );
		$slice   = array_slice( $keys, $offset, $chunk, true );
		$count   = 0;
		$current = '';

		foreach ( $slice as $plugin_file ) {
			$data = $plugins[ $plugin_file ];
			$slug = dirname( $plugin_file );
			if ( '.' === $slug ) {
				$slug = basename( $plugin_file, '.php' );
			}
			$ver       = (string) ( $data['Version'] ?? '' );
			$checksums = self::fetch_plugin_checksums( $slug, $ver );
			$current   = $plugin_file;

			if ( null === $checksums ) {
				self::index_plugin_baseline( $scan_id, $slug, $plugin_file );
				continue;
			}

			$plugin_dir = WP_PLUGIN_DIR . '/' . $slug;
			foreach ( $checksums as $rel => $md5 ) {
				$path = $plugin_dir . '/' . $rel;
				if ( ! is_readable( $path ) ) {
					continue;
				}
				if ( md5_file( $path ) !== $md5 ) {
					self::add_finding(
						$scan_id,
						array(
							'severity'            => 'high',
							'category'            => 'integrity',
							'title'               => 'Plugin file modified',
							'path_or_object'      => 'wp-content/plugins/' . $slug . '/' . $rel,
							'remediation'         => 'Restore from wordpress.org',
							'auto_heal_available' => true,
							'evidence'            => array( 'slug' => $slug, 'version' => $ver, 'file' => $rel ),
						)
					);
					$count++;
				}
				self::index_file( $scan_id, 'wp-content/plugins/' . $slug . '/' . $rel, $path );
			}
		}

		$meta['plugin_index'] = $offset + count( $slice );
		$done                 = $meta['plugin_index'] >= count( $keys );

		return array(
			'findings'      => $count,
			'done'          => false,
			'plugins_done'  => $done,
			'current_path'  => $current,
			'meta'          => $meta,
		);
	}

	/**
	 * @param int                  $scan_id Scan ID.
	 * @param array<string,mixed>  $meta    Meta.
	 * @param int                  $chunk   Chunk size.
	 * @return array<string,mixed>
	 */
	private static function scan_org_themes_chunk( $scan_id, $meta, $chunk ) {
		$themes = wp_get_themes();
		$keys   = array_keys( $themes );
		$offset = (int) ( $meta['theme_index'] ?? 0 );
		$slice  = array_slice( $keys, $offset, $chunk, true );
		$count  = 0;
		$current = '';

		foreach ( $slice as $stylesheet ) {
			$theme     = $themes[ $stylesheet ];
			$ver       = (string) $theme->get( 'Version' );
			$checksums = self::fetch_theme_checksums( $stylesheet, $ver );
			$current   = $stylesheet;

			if ( null === $checksums ) {
				self::index_theme_baseline( $scan_id, $stylesheet );
				continue;
			}

			$theme_dir = get_theme_root() . '/' . $stylesheet;
			foreach ( $checksums as $rel => $md5 ) {
				$path = $theme_dir . '/' . $rel;
				if ( ! is_readable( $path ) ) {
					continue;
				}
				if ( md5_file( $path ) !== $md5 ) {
					self::add_finding(
						$scan_id,
						array(
							'severity'            => 'high',
							'category'            => 'integrity',
							'title'               => 'Theme file modified',
							'path_or_object'      => 'wp-content/themes/' . $stylesheet . '/' . $rel,
							'remediation'         => 'Restore from wordpress.org',
							'auto_heal_available' => true,
							'evidence'            => array( 'stylesheet' => $stylesheet, 'version' => $ver, 'file' => $rel ),
						)
					);
					$count++;
				}
				self::index_file( $scan_id, 'wp-content/themes/' . $stylesheet . '/' . $rel, $path );
			}
		}

		$meta['theme_index'] = $offset + count( $slice );
		$done                = $meta['theme_index'] >= count( $keys );

		return array(
			'findings'     => $count,
			'done'         => $done,
			'themes_done'  => $done,
			'current_path' => $current,
			'meta'         => $meta,
		);
	}

	/**
	 * @param string $slug    Plugin slug.
	 * @param string $version Version.
	 * @return array<string,string>|null
	 */
	private static function fetch_plugin_checksums( $slug, $version ) {
		$slug    = sanitize_key( $slug );
		$version = preg_replace( '/[^0-9a-zA-Z\.\-_]/', '', (string) $version );
		if ( ! $slug || ! $version ) {
			return null;
		}

		$key = 'webino_shield_plugin_cs_' . md5( $slug . '@' . $version );
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$url  = "https://downloads.wordpress.org/plugin-checksums/{$slug}/{$version}.json";
		$resp = wp_remote_get( $url, array( 'timeout' => 20 ) );
		if ( is_wp_error( $resp ) || 200 !== (int) wp_remote_retrieve_response_code( $resp ) ) {
			set_transient( $key, array(), HOUR_IN_SECONDS );
			return null;
		}

		$body = json_decode( wp_remote_retrieve_body( $resp ), true );
		if ( ! is_array( $body ) ) {
			return null;
		}

		$checksums = array();
		foreach ( $body as $file => $hashes ) {
			if ( is_array( $hashes ) && ! empty( $hashes['md5'] ) ) {
				$checksums[ ltrim( (string) $file, '/' ) ] = (string) $hashes['md5'];
			} elseif ( is_string( $hashes ) ) {
				$checksums[ ltrim( (string) $file, '/' ) ] = $hashes;
			}
		}

		set_transient( $key, $checksums, DAY_IN_SECONDS );
		return $checksums ?: null;
	}

	/**
	 * @param string $stylesheet Theme slug.
	 * @param string $version    Version.
	 * @return array<string,string>|null
	 */
	private static function fetch_theme_checksums( $stylesheet, $version ) {
		$stylesheet = sanitize_key( $stylesheet );
		$version    = preg_replace( '/[^0-9a-zA-Z\.\-_]/', '', (string) $version );
		if ( ! $stylesheet || ! $version ) {
			return null;
		}

		$key = 'webino_shield_theme_cs_' . md5( $stylesheet . '@' . $version );
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$url  = "https://downloads.wordpress.org/theme-checksums/{$stylesheet}/{$version}.json";
		$resp = wp_remote_get( $url, array( 'timeout' => 20 ) );
		if ( is_wp_error( $resp ) || 200 !== (int) wp_remote_retrieve_response_code( $resp ) ) {
			set_transient( $key, array(), HOUR_IN_SECONDS );
			return null;
		}

		$body = json_decode( wp_remote_retrieve_body( $resp ), true );
		if ( ! is_array( $body ) ) {
			return null;
		}

		$checksums = array();
		foreach ( $body as $file => $hashes ) {
			if ( is_array( $hashes ) && ! empty( $hashes['md5'] ) ) {
				$checksums[ ltrim( (string) $file, '/' ) ] = (string) $hashes['md5'];
			} elseif ( is_string( $hashes ) ) {
				$checksums[ ltrim( (string) $file, '/' ) ] = $hashes;
			}
		}

		set_transient( $key, $checksums, DAY_IN_SECONDS );
		return $checksums ?: null;
	}

	/**
	 * @param int    $scan_id     Scan ID.
	 * @param string $slug        Plugin slug.
	 * @param string $plugin_file Plugin file.
	 * @return void
	 */
	private static function index_plugin_baseline( $scan_id, $slug, $plugin_file ) {
		$dir = WP_PLUGIN_DIR . '/' . $slug;
		if ( ! is_dir( $dir ) ) {
			return;
		}
		$main = $dir . '/' . basename( $plugin_file );
		if ( is_readable( $main ) ) {
			self::index_file( $scan_id, 'wp-content/plugins/' . $plugin_file, $main );
		}
	}

	/**
	 * @param int    $scan_id    Scan ID.
	 * @param string $stylesheet Theme slug.
	 * @return void
	 */
	private static function index_theme_baseline( $scan_id, $stylesheet ) {
		$style = get_theme_root() . '/' . $stylesheet . '/style.css';
		if ( is_readable( $style ) ) {
			self::index_file( $scan_id, 'wp-content/themes/' . $stylesheet . '/style.css', $style );
		}
	}

	/**
	 * @return array<string,mixed>|null
	 */
	private static function get_core_checksums() {
		$cached = get_transient( 'webino_shield_wp_checksums' );
		if ( ! is_array( $cached ) || empty( $cached['checksums'] ) ) {
			Webino_Shield_Feeds::sync_wp_core_checksums();
			$cached = get_transient( 'webino_shield_wp_checksums' );
		}
		return is_array( $cached ) ? $cached : null;
	}

	/**
	 * Scan a chunk of files using a stable, pre-built path list.
	 *
	 * On the first entry (file_index === 0 and no file_list_ready flag), the full set of
	 * matching paths under WP_CONTENT_DIR is collected once, capped at FILE_LIST_CAP, and
	 * stored in a transient keyed by scan_id. Subsequent chunks load the list from the
	 * transient and slice by file_index, ensuring consistent ordering across cron ticks even
	 * when the filesystem changes mid-scan.
	 *
	 * @param int                  $scan_id Scan ID.
	 * @param string               $profile Profile.
	 * @param array<string,mixed>  $meta    Meta.
	 * @return array<string,mixed>
	 */
	private static function file_scan_chunk( $scan_id, $profile, $meta ) {
		$s      = Webino_Dashboard_Security_Settings::get();
		$chunk  = max( 1, (int) ( $s['scan']['chunk_files'] ?? 200 ) );
		$max_mb = max( 1, (int) ( $s['scan']['max_file_mb'] ?? 8 ) );
		$count   = 0;
		$current = '';

		$list_option = 'webino_shield_scan_' . $scan_id . '_filelist';

		// --- Phase A: build stable file list on first entry ---
		if ( empty( $meta['file_list_ready'] ) ) {
			$cap       = 10000;
			$all_files = array();
			$now       = time();
			$max_bytes = $max_mb * 1024 * 1024;

			try {
				$iterator = new RecursiveIteratorIterator(
					new RecursiveDirectoryIterator( WP_CONTENT_DIR, RecursiveDirectoryIterator::SKIP_DOTS )
				);
				foreach ( $iterator as $file ) {
					/** @var SplFileInfo $file */
					if ( ! $file->isFile() ) {
						continue;
					}
					if ( $file->getSize() > $max_bytes ) {
						continue;
					}
					if ( 'quick' === $profile && $file->getMTime() < ( $now - WEEK_IN_SECONDS ) ) {
						continue;
					}
					$ext = strtolower( $file->getExtension() );
					if ( 'deep' !== $profile
						&& ! in_array( $ext, array( 'php', 'js', 'phtml', 'php5' ), true ) ) {
						continue;
					}
					$all_files[] = wp_normalize_path( $file->getPathname() );
					if ( count( $all_files ) >= $cap ) {
						break;
					}
				}
			} catch ( Exception $e ) {
				unset( $e );
			}

			// Persist for the lifetime of the scan (7 days max).
			update_option( $list_option, $all_files, false );

			$meta['file_list_ready'] = true;
			$meta['file_list_total'] = count( $all_files );
			$meta['file_index']      = 0;
		}

		// --- Phase B: load list and process chunk ---
		$all_files = get_option( $list_option, array() );
		if ( ! is_array( $all_files ) ) {
			$all_files = array();
		}

		$offset = (int) ( $meta['file_index'] ?? 0 );
		$slice  = array_slice( $all_files, $offset, $chunk );

		foreach ( $slice as $path ) {
			if ( ! is_readable( $path ) || ! is_file( $path ) ) {
				continue;
			}
			$current = str_replace( ABSPATH, '', $path );
			$hits    = Webino_Shield_Malware::scan_file( $path );
			foreach ( $hits as $hit ) {
				self::add_finding(
					$scan_id,
					array_merge(
						$hit,
						array(
							'path_or_object'      => $current,
							'auto_heal_available' => true,
						)
					)
				);
				$count++;
				Webino_Shield_Notify::dispatch( 'malware', array( 'path' => $path ) );
			}
			self::index_file( $scan_id, $current, $path );
		}

		$meta['file_index'] = $offset + count( $slice );
		$total              = (int) ( $meta['file_list_total'] ?? count( $all_files ) );
		$more               = ( $meta['file_index'] < $total && count( $slice ) > 0 );

		// Clean up stored list when scan phase is complete.
		if ( ! $more ) {
			delete_option( $list_option );
		}

		return array(
			'findings'     => $count,
			'done'         => ! $more,
			'current_path' => $current,
			'meta'         => $meta,
		);
	}

	/**
	 * @param int                 $scan_id Scan ID.
	 * @param array<string,mixed> $meta    Meta.
	 * @return array<string,mixed>
	 */
	private static function db_scan_chunk( $scan_id, $meta ) {
		unset( $meta );
		$count = 0;
		if ( ! empty( Webino_Dashboard_Security_Settings::get()['scan']['include_db'] ) ) {
			$db    = Webino_Shield_Db_Scan::run( $scan_id );
			$count = count( $db );
		}
		return array(
			'findings'     => $count,
			'done'         => true,
			'current_path' => 'database',
			'meta'         => $meta,
		);
	}

	/**
	 * @param int                 $scan_id Scan ID.
	 * @param array<string,mixed> $meta    Meta.
	 * @return array<string,mixed>
	 */
	private static function vuln_scan_chunk( $scan_id, $meta ) {
		unset( $meta );
		$count = 0;
		if ( ! empty( Webino_Dashboard_Security_Settings::get()['scan']['include_vuln'] ) ) {
			$count = self::vuln_scan( $scan_id );
		}
		return array(
			'findings'     => $count,
			'done'         => true,
			'current_path' => 'vulnerabilities',
			'meta'         => $meta,
		);
	}

	/**
	 * @param int                 $scan_id Scan ID.
	 * @param array<string,mixed> $meta    Meta.
	 * @return array<string,mixed>
	 */
	private static function config_scan_chunk( $scan_id, $meta ) {
		unset( $meta );
		$count = self::config_audit( $scan_id );
		return array(
			'findings'     => $count,
			'done'         => true,
			'current_path' => 'configuration',
			'meta'         => $meta,
		);
	}

	/**
	 * @param int $scan_id Scan ID.
	 * @return int
	 */
	private static function vuln_scan( $scan_id ) {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'intel_cve' );
		$count = 0;
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		$plugins = get_plugins();
		foreach ( $plugins as $slug => $data ) {
			$base = dirname( $slug );
			if ( '.' === $base ) {
				$base = basename( $slug, '.php' );
			}
			$ver = (string) ( $data['Version'] ?? '' );
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$rows = $wpdb->get_results(
				$wpdb->prepare( "SELECT * FROM {$table} WHERE slug = %s OR slug LIKE %s", $base, '%' . $wpdb->esc_like( $base ) . '%' ),
				ARRAY_A
			);
			foreach ( $rows ?: array() as $row ) {
				if ( ! self::version_is_affected( $ver, (string) ( $row['affected_version'] ?? '' ) ) ) {
					continue;
				}
				self::add_finding(
					$scan_id,
					array(
						'severity'       => ! empty( $row['kev'] ) ? 'critical' : 'high',
						'category'       => 'vuln',
						'title'          => 'CVE: ' . $row['cve_id'],
						'path_or_object' => $slug . '@' . $ver,
						'cve_ids'        => array( $row['cve_id'] ),
						'feed_ids'       => array( $row['feed_id'] ),
					)
				);
				$count++;
			}
		}
		return $count;
	}

	/**
	 * @param string $installed Installed version.
	 * @param string $affected  Affected version spec.
	 * @return bool
	 */
	private static function version_is_affected( $installed, $affected ) {
		$installed = trim( (string) $installed );
		$affected  = trim( (string) $affected );
		if ( '' === $affected ) {
			return true;
		}
		if ( '' === $installed ) {
			return false;
		}
		if ( preg_match( '/^(<=|<|>=|>)\s*(.+)$/', $affected, $m ) ) {
			$op = $m[1];
			if ( '<=' === $op || '>=' === $op ) {
				return version_compare( $installed, trim( $m[2] ), $op );
			}
			return version_compare( $installed, trim( $m[2] ), $op );
		}
		if ( false !== strpos( $affected, ' - ' ) ) {
			$parts = array_map( 'trim', explode( ' - ', $affected, 2 ) );
			if ( 2 === count( $parts ) ) {
				return version_compare( $installed, $parts[0], '>=' ) && version_compare( $installed, $parts[1], '<=' );
			}
		}
		if ( $installed === $affected ) {
			return true;
		}
		return version_compare( $installed, $affected, '<=' );
	}

	/**
	 * @param int $scan_id Scan ID.
	 * @return int
	 */
	private static function config_audit( $scan_id ) {
		$count = 0;
		$s     = Webino_Dashboard_Security_Settings::get();

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG && 'production' === wp_get_environment_type() ) {
			self::add_finding(
				$scan_id,
				array(
					'severity'       => 'medium',
					'category'       => 'config',
					'title'          => 'WP_DEBUG enabled on production',
					'path_or_object' => 'wp-config',
				)
			);
			$count++;
		}

		if ( ! defined( 'DISALLOW_FILE_EDIT' ) || ! DISALLOW_FILE_EDIT ) {
			self::add_finding(
				$scan_id,
				array(
					'severity'            => 'medium',
					'category'            => 'config',
					'title'               => 'DISALLOW_FILE_EDIT not enabled',
					'path_or_object'      => 'wp-config',
					'remediation'         => 'Add define( \'DISALLOW_FILE_EDIT\', true ); to wp-config.php',
					'auto_heal_available' => true,
				)
			);
			$count++;
		}

		$login = (array) ( $s['login'] ?? array() );
		if ( empty( $login['disable_xmlrpc'] ) && is_readable( ABSPATH . 'xmlrpc.php' ) ) {
			self::add_finding(
				$scan_id,
				array(
					'severity'       => 'medium',
					'category'       => 'config',
					'title'          => 'XML-RPC enabled',
					'path_or_object' => 'xmlrpc.php',
				)
			);
			$count++;
		}

		if ( empty( $login['disable_rest_users'] ) ) {
			self::add_finding(
				$scan_id,
				array(
					'severity'       => 'medium',
					'category'       => 'config',
					'title'          => 'REST users endpoint exposed to anonymous',
					'path_or_object' => '/wp-json/wp/v2/users',
				)
			);
			$count++;
		}

		foreach ( array( 'readme.html', 'license.txt' ) as $expose ) {
			if ( is_readable( ABSPATH . $expose ) ) {
				self::add_finding(
					$scan_id,
					array(
						'severity'            => 'low',
						'category'            => 'config',
						'title'               => $expose . ' exposed',
						'path_or_object'      => $expose,
						'auto_heal_available' => true,
					)
				);
				$count++;
			}
		}

		$debug_log = WP_CONTENT_DIR . '/debug.log';
		if ( is_readable( $debug_log ) ) {
			self::add_finding(
				$scan_id,
				array(
					'severity'       => 'medium',
					'category'       => 'config',
					'title'          => 'debug.log readable under wp-content',
					'path_or_object' => 'wp-content/debug.log',
				)
			);
			$count++;
		}

		$count += self::audit_world_writable_dirs( $scan_id );
		$count += self::audit_backup_files( $scan_id );
		$count += self::audit_admin_2fa( $scan_id, $login );
		$count += self::audit_default_admin( $scan_id );
		$count += self::audit_application_passwords( $scan_id );
		$count += self::audit_sensitive_files_world_readable( $scan_id );

		return $count;
	}

	/**
	 * @param int $scan_id Scan ID.
	 * @return int
	 */
	private static function audit_world_writable_dirs( $scan_id ) {
		$count = 0;
		$roots = array( ABSPATH, WP_CONTENT_DIR );
		foreach ( $roots as $root ) {
			if ( ! is_dir( $root ) ) {
				continue;
			}
			try {
				$iterator = new RecursiveIteratorIterator(
					new RecursiveDirectoryIterator( $root, RecursiveDirectoryIterator::SKIP_DOTS ),
					RecursiveIteratorIterator::SELF_FIRST
				);
				$n = 0;
				foreach ( $iterator as $item ) {
					if ( ! $item->isDir() ) {
						continue;
					}
					$path = wp_normalize_path( $item->getPathname() );
					$perm = fileperms( $path ) & 0777;
					if ( 0777 === $perm ) {
						$rel = str_replace( ABSPATH, '', $path );
						self::add_finding(
							$scan_id,
							array(
								'severity'            => 'high',
								'category'            => 'config',
								'title'               => 'World-writable directory (0777)',
								'path_or_object'      => $rel,
								'auto_heal_available' => true,
							)
						);
						$count++;
					}
					$n++;
					if ( $n > 500 ) {
						break;
					}
				}
			} catch ( Exception $e ) {
				unset( $e );
			}
		}
		return $count;
	}

	/**
	 * @param int $scan_id Scan ID.
	 * @return int
	 */
	private static function audit_backup_files( $scan_id ) {
		$count = 0;
		$patterns = array( '*.sql', '*.zip', '*.tar.gz', '*.bak' );
		foreach ( $patterns as $pattern ) {
			$matches = glob( trailingslashit( ABSPATH ) . $pattern );
			if ( ! is_array( $matches ) ) {
				continue;
			}
			foreach ( $matches as $path ) {
				if ( ! is_file( $path ) ) {
					continue;
				}
				$rel = str_replace( ABSPATH, '', wp_normalize_path( $path ) );
				self::add_finding(
					$scan_id,
					array(
						'severity'       => 'medium',
						'category'       => 'config',
						'title'          => 'Backup file in webroot',
						'path_or_object' => $rel,
					)
				);
				$count++;
			}
		}
		return $count;
	}

	/**
	 * @param int                 $scan_id Scan ID.
	 * @param array<string,mixed> $login   Login settings.
	 * @return int
	 */
	private static function audit_admin_2fa( $scan_id, $login ) {
		$required_roles = (array) ( $login['2fa_required_roles'] ?? array() );
		if ( ! in_array( 'administrator', $required_roles, true ) ) {
			return 0;
		}

		$count = 0;
		$admins = get_users( array( 'role' => 'administrator', 'number' => 100 ) );
		foreach ( $admins as $user ) {
			if ( Webino_Shield_2FA::is_enabled( $user->ID ) ) {
				continue;
			}
			self::add_finding(
				$scan_id,
				array(
					'severity'       => 'high',
					'category'       => 'config',
					'title'          => 'Administrator without 2FA',
					'path_or_object' => 'user:' . $user->user_login,
				)
			);
			$count++;
		}
		return $count;
	}

	/**
	 * Flag if user ID 1 still has the default "admin" login.
	 *
	 * @param int $scan_id Scan ID.
	 * @return int
	 */
	private static function audit_default_admin( $scan_id ) {
		$admin_user = get_userdata( 1 );
		if ( $admin_user && 'admin' === $admin_user->user_login ) {
			self::add_finding(
				$scan_id,
				array(
					'severity'       => 'high',
					'category'       => 'config',
					'title'          => 'Default "admin" username still in use (user ID 1)',
					'path_or_object' => 'user:admin',
					'remediation'    => 'Create a new admin account with a unique username and delete or demote the "admin" account',
				)
			);
			return 1;
		}
		return 0;
	}

	/**
	 * Flag if Application Passwords are available without site-wide restriction.
	 *
	 * @param int $scan_id Scan ID.
	 * @return int
	 */
	private static function audit_application_passwords( $scan_id ) {
		if ( ! function_exists( 'wp_is_application_passwords_available' )
			|| ! wp_is_application_passwords_available() ) {
			return 0;
		}

		// If the site has disabled app passwords for all users via filter, skip.
		$available = apply_filters( 'wp_is_application_passwords_available', true );
		if ( ! $available ) {
			return 0;
		}

		self::add_finding(
			$scan_id,
			array(
				'severity'       => 'medium',
				'category'       => 'config',
				'title'          => 'Application Passwords enabled without restriction',
				'path_or_object' => 'wp-config',
				'remediation'    => "Disable via add_filter( 'wp_is_application_passwords_available', '__return_false' ) or restrict to specific users",
			)
		);
		return 1;
	}

	/**
	 * Flag .htaccess and .user.ini in ABSPATH if world-readable.
	 *
	 * @param int $scan_id Scan ID.
	 * @return int
	 */
	private static function audit_sensitive_files_world_readable( $scan_id ) {
		$count = 0;
		foreach ( array( '.htaccess', '.user.ini' ) as $filename ) {
			$path = ABSPATH . $filename;
			if ( ! is_readable( $path ) ) {
				continue;
			}
			$perm = fileperms( $path ) & 0777;
			if ( $perm & 0004 ) { // world-readable bit set.
				self::add_finding(
					$scan_id,
					array(
						'severity'            => 'medium',
						'category'            => 'config',
						'title'               => $filename . ' is world-readable (permissions: ' . decoct( $perm ) . ')',
						'path_or_object'      => $filename,
						'remediation'         => 'Run: chmod 640 ' . $filename,
						'auto_heal_available' => true,
					)
				);
				$count++;
			}
		}
		return $count;
	}

	/**
	 * @param int                  $scan_id Scan ID.
	 * @param array<string,mixed>  $finding Finding.
	 * @return void
	 */
	private static function add_finding( $scan_id, $finding ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'findings' ),
			array(
				'scan_id'             => (int) $scan_id,
				'severity'            => sanitize_key( (string) ( $finding['severity'] ?? 'info' ) ),
				'status'              => 'open',
				'category'            => sanitize_key( (string) ( $finding['category'] ?? '' ) ),
				'title'               => sanitize_text_field( (string) ( $finding['title'] ?? '' ) ),
				'path_or_object'      => sanitize_text_field( (string) ( $finding['path_or_object'] ?? '' ) ),
				'evidence'            => wp_json_encode( $finding['evidence'] ?? '' ),
				'remediation'         => sanitize_text_field( (string) ( $finding['remediation'] ?? '' ) ),
				'auto_heal_available' => ! empty( $finding['auto_heal_available'] ) ? 1 : 0,
				'cve_ids'             => wp_json_encode( $finding['cve_ids'] ?? array() ),
				'feed_ids'            => wp_json_encode( $finding['feed_ids'] ?? array() ),
				'created_at'          => current_time( 'mysql', true ),
				'updated_at'          => current_time( 'mysql', true ),
			)
		);
	}

	/**
	 * @param int    $scan_id Scan ID.
	 * @param string $rel     Relative path.
	 * @param string $path    Absolute path.
	 * @return void
	 */
	private static function index_file( $scan_id, $rel, $path ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'file_index' ),
			array(
				'scan_id'   => (int) $scan_id,
				'path'      => sanitize_text_field( substr( $rel, 0, 512 ) ),
				'file_hash' => is_readable( $path ) ? hash_file( 'sha256', $path ) : '',
				'size'      => is_readable( $path ) ? filesize( $path ) : 0,
				'mtime'     => is_readable( $path ) ? filemtime( $path ) : 0,
				'origin'    => 'scan',
			)
		);
	}

	/**
	 * @param string $phase   Current phase.
	 * @param string $profile Scan profile.
	 * @return string|null
	 */
	private static function next_phase( $phase, $profile ) {
		$s       = Webino_Dashboard_Security_Settings::get();
		$enabled = array( 'integrity', 'files' );
		if ( ! empty( $s['scan']['include_db'] ) ) {
			$enabled[] = 'db';
		}
		if ( ! empty( $s['scan']['include_vuln'] ) ) {
			$enabled[] = 'vuln';
		}
		$enabled[] = 'config';

		$idx = array_search( $phase, $enabled, true );
		if ( false === $idx ) {
			return null;
		}
		$next_idx = $idx + 1;
		if ( ! isset( $enabled[ $next_idx ] ) ) {
			return null;
		}
		if ( 'files' === $enabled[ $next_idx ] && 'quick' === $profile ) {
			// quick profile still runs file scan with mtime filter.
			return $enabled[ $next_idx ];
		}
		return $enabled[ $next_idx ];
	}

	/**
	 * @param array<string,mixed> $meta    Meta.
	 * @param string              $profile Profile.
	 * @return int
	 */
	private static function estimate_progress( $meta, $profile ) {
		unset( $profile );
		$phase = (string) ( $meta['phase'] ?? 'integrity' );
		$weights = array(
			'integrity' => array( 0, 35 ),
			'files'     => array( 35, 75 ),
			'db'        => array( 75, 82 ),
			'vuln'      => array( 82, 90 ),
			'config'    => array( 90, 100 ),
		);
		if ( ! isset( $weights[ $phase ] ) ) {
			return 0;
		}
		list( $start, $end ) = $weights[ $phase ];
		$span = max( 1, $end - $start );
		$inner = 0.0;

		if ( 'integrity' === $phase ) {
			$sub = (string) ( $meta['integrity_sub'] ?? 'dropins' );
			if ( 'dropins' === $sub ) {
				$inner = 0.02;
			} elseif ( 'core' === $sub ) {
				$cached = self::get_core_checksums();
				$total  = is_array( $cached ) && ! empty( $cached['checksums'] ) ? count( $cached['checksums'] ) : 1;
				$inner  = min( 0.55, (int) ( $meta['integrity_index'] ?? 0 ) / max( 1, $total ) );
			} elseif ( 'plugins' === $sub ) {
				$inner = 0.6 + min( 0.15, (int) ( $meta['plugin_index'] ?? 0 ) / 100 );
			} else {
				$inner = 0.8 + min( 0.19, (int) ( $meta['theme_index'] ?? 0 ) / 50 );
			}
		} elseif ( 'files' === $phase ) {
			$inner = min( 0.95, (int) ( $meta['file_index'] ?? 0 ) / 2000 );
		} else {
			$inner = 0.5;
		}

		return (int) floor( $start + ( $span * $inner ) );
	}

	/**
	 * @param int $scan_id Scan ID.
	 * @return void
	 */
	private static function schedule_next( $scan_id ) {
		if ( function_exists( 'as_enqueue_async_action' ) ) {
			as_enqueue_async_action( self::CRON_HOOK, array( (int) $scan_id ), 'webino-shield' );
			return;
		}
		if ( ! wp_next_scheduled( self::CRON_HOOK, array( (int) $scan_id ) ) ) {
			wp_schedule_single_event( time() + 5, self::CRON_HOOK, array( (int) $scan_id ) );
		}
	}

	/**
	 * @param string|null $raw Raw meta JSON.
	 * @return array<string,mixed>
	 */
	private static function decode_meta( $raw ) {
		if ( is_array( $raw ) ) {
			return $raw;
		}
		$decoded = json_decode( (string) $raw, true );
		return is_array( $decoded ) ? $decoded : array();
	}

	/**
	 * @param int $scan_id Scan ID.
	 * @return bool
	 */
	public static function cancel( $scan_id ) {
		global $wpdb;
		// Remove any persisted file list for this scan.
		delete_option( 'webino_shield_scan_' . (int) $scan_id . '_filelist' );
		return (bool) $wpdb->update(
			Webino_Dashboard_Security_Db::table( 'scans' ),
			array( 'status' => 'cancelled', 'finished_at' => current_time( 'mysql', true ) ),
			array( 'id' => (int) $scan_id ),
			array( '%s', '%s' ),
			array( '%d' )
		);
	}

	/**
	 * @param int $scan_id Scan ID.
	 * @return array<string,mixed>|null
	 */
	public static function get( $scan_id ) {
		global $wpdb;
		$row = $wpdb->get_row(
			$wpdb->prepare( 'SELECT * FROM ' . Webino_Dashboard_Security_Db::table( 'scans' ) . ' WHERE id = %d', (int) $scan_id ),
			ARRAY_A
		);
		return $row ?: null;
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_scans( $args = array() ) {
		global $wpdb;
		$limit = min( 50, max( 1, (int) ( $args['limit'] ?? 20 ) ) );
		$table = Webino_Dashboard_Security_Db::table( 'scans' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT {$limit}", ARRAY_A ) ?: array();
	}
}
