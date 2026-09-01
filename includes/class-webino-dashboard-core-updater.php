<?php
/**
 * In-place core update from CRM/Gitea release ZIP.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Downloads and applies WebinoDashboard core package without touching installed Modules/{slug}.
 */
final class Webino_Dashboard_Core_Updater {

	const LOCK_KEY       = 'webino_dashboard_core_update_lock';
	const CHECK_CACHE_KEY = 'webino_dashboard_core_update_check';
	const CHECK_CACHE_TTL = 900;
	const MAX_BACKUPS    = 5;
	const CORE_SLUG      = 'webino-dashboard';

	/**
	 * Bootstrap-safe status: transient only, never calls CRM.
	 *
	 * @return array<string,mixed>
	 */
	public static function get_cached_update_status() {
		$current = defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '0.0.0';
		$cached  = get_transient( self::CHECK_CACHE_KEY );
		if ( is_array( $cached ) ) {
			$cached['version'] = $current;
			return $cached;
		}
		return array(
			'version'           => $current,
			'latest_version'    => $current,
			'update_available'  => false,
			'release_notes'     => '',
			'package_available' => false,
			'license_active'    => true,
			'unavailable'       => true,
		);
	}

	/**
	 * @param bool $force_refresh Bypass transient and hit CRM.
	 * @return array<string,mixed>
	 */
	public static function get_update_status( $force_refresh = false ) {
		$current = defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '0.0.0';
		if ( ! $force_refresh ) {
			$cached = get_transient( self::CHECK_CACHE_KEY );
			if ( is_array( $cached ) ) {
				$cached['version'] = $current;
				return $cached;
			}
		}
		$license = Webino_Dashboard_License::instance();
		$res = $license->crm_get(
			'wp-json/webinocrm/v1/marketplace/core/check',
			array(
				'current_version' => $current,
			)
		);
		if ( empty( $res['ok'] ) || ! is_array( $res['data'] ?? null ) ) {
			$payload = array(
				'version'           => $current,
				'latest_version'    => $current,
				'update_available'  => false,
				'release_notes'     => '',
				'package_available' => false,
				'license_active'    => true,
				'unavailable'       => true,
			);
			set_transient( self::CHECK_CACHE_KEY, $payload, 120 );
			return $payload;
		}
		$data = $res['data'];
		$payload = array(
			'version'           => $current,
			'latest_version'    => (string) ( $data['latest_version'] ?? $current ),
			'update_available'  => ! empty( $data['update_available'] ),
			'release_notes'     => (string) ( $data['release_notes'] ?? '' ),
			'package_available' => ! empty( $data['package_available'] ),
			'license_active'    => true,
			'unavailable'       => false,
		);
		set_transient( self::CHECK_CACHE_KEY, $payload, self::CHECK_CACHE_TTL );
		return $payload;
	}

	/**
	 * @param string $version Target version (optional).
	 * @return array<string,mixed>|WP_Error
	 */
	public static function run_update( $version = '' ) {
		if ( get_transient( self::LOCK_KEY ) ) {
			return new WP_Error( 'locked', __( 'A core update is already in progress.', 'webino-dashboard' ), array( 'status' => 409 ) );
		}
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 'forbidden', __( 'You do not have permission to update the dashboard.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		$license = Webino_Dashboard_License::instance();
		if ( ! class_exists( 'ZipArchive' ) ) {
			return new WP_Error( 'zip', __( 'ZipArchive is not available on this server.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		set_transient( self::LOCK_KEY, 1, 15 * MINUTE_IN_SECONDS );
		$backup_dir = null;
		$staging    = null;

		try {
			$body = array( 'module_slug' => self::CORE_SLUG );
			if ( '' !== $version ) {
				$body['version'] = sanitize_text_field( $version );
			}
			$grant = $license->crm_post( 'wp-json/webinocrm/v1/marketplace/core/download-token', $body );
			if ( empty( $grant['ok'] ) || empty( $grant['data']['download_url'] ) ) {
				$msg = is_array( $grant['data'] ?? null ) && ! empty( $grant['data']['message'] )
					? (string) $grant['data']['message']
					: ( $grant['error'] ?? __( 'Could not obtain download URL.', 'webino-dashboard' ) );
				throw new Exception( $msg );
			}

			$download_url = (string) $grant['data']['download_url'];
			if ( ! class_exists( 'Webino_Dashboard_Remote_Url', false ) || ! Webino_Dashboard_Remote_Url::is_allowed_download_url( $download_url ) ) {
				throw new Exception( __( 'Download URL is not allowed.', 'webino-dashboard' ) );
			}
			$tmp = download_url( $download_url, 600 );
			if ( is_wp_error( $tmp ) ) {
				throw new Exception( $tmp->get_error_message() );
			}

			$staging = trailingslashit( WP_CONTENT_DIR ) . '.webino-core-update-' . wp_generate_password( 8, false, false );
			wp_mkdir_p( $staging );
			$unzip = self::unzip_to( $tmp, $staging );
			wp_delete_file( $tmp );
			if ( is_wp_error( $unzip ) ) {
				throw new Exception( $unzip->get_error_message() );
			}

			$core_src = self::locate_core_source_dir( $staging );
			if ( is_wp_error( $core_src ) ) {
				throw new Exception( $core_src->get_error_message() );
			}
			$valid = self::validate_core_package( $core_src );
			if ( is_wp_error( $valid ) ) {
				throw new Exception( $valid->get_error_message() );
			}

			$new_version = self::read_version_from_plugin_file( $core_src . 'webino-dashboard.php' );
			if ( '' === $new_version ) {
				throw new Exception( __( 'Could not read version from the update package.', 'webino-dashboard' ) );
			}
			$current = defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '0.0.0';
			if ( version_compare( $new_version, $current, '<' ) && ! apply_filters( 'webino_dashboard_allow_core_downgrade', false ) ) {
				throw new Exception( __( 'Downgrading the dashboard core is not allowed.', 'webino-dashboard' ) );
			}

			$backup_dir = self::create_backup();
			if ( is_wp_error( $backup_dir ) ) {
				throw new Exception( $backup_dir->get_error_message() );
			}

			$copied = self::copy_tree( $core_src, trailingslashit( WEBINO_DASHBOARD_DIR ), array( 'Modules' ) );
			if ( is_wp_error( $copied ) ) {
				$restore = self::restore_backup( $backup_dir );
				if ( is_wp_error( $restore ) ) {
					throw new Exception(
						$copied->get_error_message() . ' ' . __( 'Backup restore also failed.', 'webino-dashboard' )
					);
				}
				throw new Exception( $copied->get_error_message() );
			}

			self::ensure_modules_dir_from_staging( $staging );

			Webino_Dashboard_Install::ensure_dashboard_license_table();
			if ( method_exists( 'Webino_Dashboard_Install', 'ensure_analytics_tables' ) ) {
				Webino_Dashboard_Install::ensure_analytics_tables();
			}
			if ( class_exists( 'Webino_Dashboard_Assets', false ) && method_exists( 'Webino_Dashboard_Assets', 'purge_stale_build_assets' ) ) {
				Webino_Dashboard_Assets::purge_stale_build_assets();
			}
			update_option( 'webino_dashboard_db_version', $new_version );
			self::clear_caches();
			flush_rewrite_rules( false );

			delete_transient( self::CHECK_CACHE_KEY );
			self::prune_old_backups();

			return array(
				'ok'              => true,
				'version'         => $new_version,
				'previous_version'=> $current,
				'reload_required' => true,
			);
		} catch ( Exception $e ) {
			if ( $backup_dir && is_dir( $backup_dir ) ) {
				$restore = self::restore_backup( $backup_dir );
				if ( is_wp_error( $restore ) ) {
					return new WP_Error(
						'update_failed',
						$e->getMessage() . ' ' . __( 'Backup restore also failed.', 'webino-dashboard' ),
						array( 'status' => 500 )
					);
				}
			}
			return new WP_Error( 'update_failed', $e->getMessage(), array( 'status' => 500 ) );
		} finally {
			delete_transient( self::LOCK_KEY );
			if ( $staging && is_dir( $staging ) ) {
				self::rrmdir( $staging );
			}
		}
	}

	/**
	 * @param string $staging Staging root.
	 * @return string|WP_Error Absolute path with trailing slash.
	 */
	private static function locate_core_source_dir( $staging ) {
		$direct = trailingslashit( $staging ) . 'WebinoDashboard/';
		if ( is_readable( $direct . 'webino-dashboard.php' ) ) {
			return $direct;
		}
		self::flatten_single_root_folder( $staging );
		$direct = trailingslashit( $staging ) . 'WebinoDashboard/';
		if ( is_readable( $direct . 'webino-dashboard.php' ) ) {
			return $direct;
		}
		if ( is_readable( trailingslashit( $staging ) . 'webino-dashboard.php' ) ) {
			return trailingslashit( $staging );
		}
		return new WP_Error( 'invalid_package', __( 'Update ZIP does not contain WebinoDashboard/webino-dashboard.php.', 'webino-dashboard' ), array( 'status' => 500 ) );
	}

	/**
	 * @param string $file Plugin main file path.
	 * @return string
	 */
	private static function read_version_from_plugin_file( $file ) {
		if ( ! is_readable( $file ) ) {
			return '';
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$contents = file_get_contents( $file );
		if ( false === $contents ) {
			return '';
		}
		if ( preg_match( "/define\s*\(\s*'WEBINO_DASHBOARD_VERSION'\s*,\s*'([^']+)'/", $contents, $m ) ) {
			return (string) $m[1];
		}
		if ( preg_match( '/Version:\s*([0-9a-zA-Z.-]+)/', $contents, $m ) ) {
			return (string) trim( $m[1] );
		}
		return '';
	}

	/**
	 * @param string $source Source directory with trailing slash.
	 * @return true|WP_Error
	 */
	private static function validate_core_package( $source ) {
		$required = array(
			'webino-dashboard.php',
			'includes/',
			'includes/class-webino-dashboard-bootstrap.php',
			'includes/bots/class-webino-dashboard-bots-core.php',
			'assets/dashboard-build/build-entry.json',
		);
		$missing = array();
		foreach ( $required as $path ) {
			$abs = $source . $path;
			if ( str_ends_with( $path, '/' ) ) {
				if ( ! is_dir( $abs ) ) {
					$missing[] = $path;
				}
				continue;
			}
			if ( ! is_readable( $abs ) ) {
				$missing[] = $path;
			}
		}
		if ( $missing ) {
			return new WP_Error( 'invalid_package', sprintf( __( 'Dashboard core package is missing required paths: %s', 'webino-dashboard' ), implode( ', ', $missing ) ), array( 'status' => 500, 'missing' => $missing ) );
		}
		return true;
	}

	/**
	 * @return string|WP_Error Backup directory path.
	 */
	private static function create_backup() {
		$upload = wp_upload_dir();
		if ( ! empty( $upload['error'] ) ) {
			return new WP_Error( 'backup', $upload['error'], array( 'status' => 500 ) );
		}
		$root = trailingslashit( $upload['basedir'] ) . 'webino-dashboard-backups/';
		wp_mkdir_p( $root );
		$dest = $root . gmdate( 'Y-m-d-His' ) . '/';
		wp_mkdir_p( $dest );
		$copied = self::copy_tree( trailingslashit( WEBINO_DASHBOARD_DIR ), $dest );
		if ( is_wp_error( $copied ) ) {
			self::rrmdir( $dest );
			return $copied;
		}
		return $dest;
	}

	/**
	 * @param string $backup_dir Backup path.
	 * @return true|WP_Error
	 */
	private static function restore_backup( $backup_dir ) {
		if ( ! is_dir( $backup_dir ) ) {
			return new WP_Error(
				'restore',
				__( 'Backup directory is missing; core files may be in an inconsistent state.', 'webino-dashboard' ),
				array( 'status' => 500 )
			);
		}
		$restored = self::copy_tree( trailingslashit( $backup_dir ), trailingslashit( WEBINO_DASHBOARD_DIR ) );
		if ( is_wp_error( $restored ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( 'Webino Dashboard: failed to restore backup after update failure: ' . $restored->get_error_message() );
			return $restored;
		}
		return true;
	}

	/**
	 * Ensure in-plugin Modules/ exists after core update (never wipe installed slugs).
	 *
	 * @param string $staging Staging extract root.
	 * @return void
	 */
	private static function ensure_modules_dir_from_staging( $staging ) {
		if ( ! defined( 'WEBINO_MODULES_DIR' ) ) {
			return;
		}
		wp_mkdir_p( WEBINO_MODULES_DIR );

		$candidates = array(
			trailingslashit( $staging ) . 'WebinaDashboard/Modules',
			trailingslashit( $staging ) . 'Modules',
		);
		$modules_staging = '';
		foreach ( $candidates as $candidate ) {
			if ( is_dir( $candidate ) ) {
				$modules_staging = $candidate;
				break;
			}
		}
		if ( '' === $modules_staging ) {
			return;
		}
		$keep = trailingslashit( $modules_staging ) . '.gitkeep';
		if ( is_readable( $keep ) && ! file_exists( trailingslashit( WEBINO_MODULES_DIR ) . '.gitkeep' ) ) {
			copy( $keep, trailingslashit( WEBINO_MODULES_DIR ) . '.gitkeep' );
		}
	}

	/**
	 * @return void
	 */
	private static function clear_caches() {
		global $wpdb;
		$domain = Webino_Dashboard_License::instance()->get_current_domain();
		delete_transient( 'webino_marketplace_catalog_' . md5( $domain ) );
		if ( class_exists( 'Webino_Dashboard_REST_Marketplace', false ) ) {
			delete_transient( Webino_Dashboard_REST_Marketplace::catalog_cache_key() );
		} else {
			delete_transient( 'webino_marketplace_catalog_v2_' . md5( $domain ) );
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_webino_dashboard_boot_%' OR option_name LIKE '_transient_timeout_webino_dashboard_boot_%'" );
	}

	/**
	 * @return void
	 */
	private static function prune_old_backups() {
		$upload = wp_upload_dir();
		if ( ! empty( $upload['error'] ) ) {
			return;
		}
		$root = trailingslashit( $upload['basedir'] ) . 'webino-dashboard-backups/';
		if ( ! is_dir( $root ) ) {
			return;
		}
		$dirs = array();
		foreach ( array_diff( scandir( $root ) ?: array(), array( '.', '..' ) ) as $name ) {
			$path = $root . $name;
			if ( is_dir( $path ) ) {
				$dirs[] = $path;
			}
		}
		usort(
			$dirs,
			static function ( $a, $b ) {
				return filemtime( $b ) <=> filemtime( $a );
			}
		);
		foreach ( array_slice( $dirs, self::MAX_BACKUPS ) as $old ) {
			self::rrmdir( $old );
		}
	}

	/**
	 * @param string        $src            Source directory (trailing slash).
	 * @param string        $dest           Destination directory (trailing slash).
	 * @param array<int,string> $skip_top_level Top-level names under $src to skip (e.g. Modules).
	 * @return true|WP_Error
	 */
	private static function copy_tree( $src, $dest, $skip_top_level = array() ) {
		if ( ! is_dir( $src ) ) {
			return new WP_Error( 'copy', __( 'Source directory is missing.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		wp_mkdir_p( $dest );
		$skip = array();
		foreach ( $skip_top_level as $name ) {
			$name = trim( (string) $name, "/\\ \t\n\r\0\x0B" );
			if ( '' !== $name ) {
				$skip[ $name ] = true;
			}
		}
		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $src, RecursiveDirectoryIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::SELF_FIRST
		);
		foreach ( $iterator as $item ) {
			$rel = substr( $item->getPathname(), strlen( $src ) );
			$rel = ltrim( str_replace( '\\', '/', $rel ), '/' );
			if ( '' === $rel ) {
				continue;
			}
			$top = strtok( $rel, '/' );
			if ( isset( $skip[ $top ] ) ) {
				continue;
			}
			$target = $dest . $rel;
			if ( $item->isDir() ) {
				wp_mkdir_p( $target );
			} else {
				wp_mkdir_p( dirname( $target ) );
				if ( ! copy( $item->getPathname(), $target ) ) {
					return new WP_Error( 'copy', __( 'Failed to copy update files.', 'webino-dashboard' ), array( 'status' => 500 ) );
				}
			}
		}
		return true;
	}

	/**
	 * @param string $zip Zip path.
	 * @param string $dest Destination.
	 * @return true|WP_Error
	 */
	private static function unzip_to( $zip, $dest ) {
		if ( ! class_exists( 'Webino_Dashboard_Zip', false ) ) {
			return new WP_Error( 'zip', __( 'ZIP helper is not available.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		return Webino_Dashboard_Zip::extract_to( $zip, $dest );
	}

	/**
	 * @param string $dir Directory.
	 * @return void
	 */
	private static function flatten_single_root_folder( $dir ) {
		$entries = array_diff( scandir( $dir ) ?: array(), array( '.', '..' ) );
		if ( 1 !== count( $entries ) ) {
			return;
		}
		$only = $dir . '/' . reset( $entries );
		if ( ! is_dir( $only ) ) {
			return;
		}
		foreach ( array_diff( scandir( $only ) ?: array(), array( '.', '..' ) ) as $item ) {
			rename( $only . '/' . $item, $dir . '/' . $item );
		}
		rmdir( $only );
	}

	/**
	 * @param string $dir Directory.
	 * @return void
	 */
	private static function rrmdir( $dir ) {
		if ( ! is_dir( $dir ) ) {
			return;
		}
		$items = array_diff( scandir( $dir ) ?: array(), array( '.', '..' ) );
		foreach ( $items as $item ) {
			$path = $dir . '/' . $item;
			if ( is_dir( $path ) ) {
				self::rrmdir( $path );
			} else {
				wp_delete_file( $path );
			}
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
		@rmdir( $dir );
	}
}
