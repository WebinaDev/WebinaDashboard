<?php
/**
 * Unified loader for dashboard extension modules in Modules/{slug}/ (inside the plugin).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Scans manifest.json, bootstraps active modules, sidebar injection.
 */
final class Webino_Dashboard_Module_Registry {

	const OPTION_PREFIX = 'webino_dashboard_marketplace_';

	const INSTALLED_VIA_VALUE = 'crm';

	const MIGRATION_OPTION = 'webino_dashboard_modules_migrated_v1';
	const MIGRATION_SLUG_OPTION = 'webino_dashboard_modules_slug_migrated_v1';
	const TOGGLE_SYNC_OPTION   = 'webino_dashboard_module_toggle_synced_v1';
	/** One-time: re-activate complete on-disk modules after Modules path move. */
	const DISK_REACTIVATE_OPTION = 'webino_dashboard_disk_modules_reactivated_2';
	/** One-time: turn coffee-profile on after it shipped default_active=false. */
	const COFFEE_PROFILE_FORCE_ON = 'webino_dashboard_coffee_profile_force_on_v1';

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;

		self::maybe_migrate_legacy_paths();
		self::maybe_migrate_legacy_slug_options();
		self::ensure_disk_modules_registered();
		self::maybe_reactivate_disk_modules();
		self::maybe_force_enable_coffee_profile();
		self::maybe_sync_sidebar_toggles_from_marketplace();

		add_action( 'init', array( __CLASS__, 'load_active_modules' ), 10 );
		add_filter( 'webino_dashboard_modules', array( __CLASS__, 'merge_sidebar_modules' ), 20 );
		add_filter( 'webino_dashboard_marketplace_modules', array( __CLASS__, 'filter_registered_modules' ) );
		add_filter( 'webino_dashboard_marketplace_settings_sections', array( __CLASS__, 'filter_settings_sections' ) );
	}

	/**
	 * @return string
	 */
	public static function modules_dir() {
		if ( defined( 'WEBINO_MODULES_DIR' ) ) {
			$dir = (string) WEBINO_MODULES_DIR;
		} else {
			$dir = trailingslashit( WEBINO_DASHBOARD_DIR ) . 'Modules/';
		}
		/**
		 * Filter absolute path to the Modules directory (inside WebinaDashboard).
		 *
		 * @param string $dir Path with trailing slash.
		 */
		$dir = apply_filters( 'webino_dashboard_modules_dir', $dir );
		return trailingslashit( $dir );
	}

	/**
	 * @param string $slug Module slug.
	 * @return string
	 */
	public static function module_dir( $slug ) {
		return self::modules_dir() . sanitize_key( $slug ) . '/';
	}

	/**
	 * @return void
	 */
	public static function maybe_migrate_legacy_paths() {
		if ( get_option( self::MIGRATION_OPTION, '' ) === '1' ) {
			return;
		}

		$legacy = WEBINO_DASHBOARD_DIR . 'includes/marketplace/';
		if ( ! is_dir( $legacy ) ) {
			update_option( self::MIGRATION_OPTION, '1', false );
			return;
		}

		wp_mkdir_p( self::modules_dir() );

		foreach ( glob( $legacy . '*', GLOB_ONLYDIR ) ?: array() as $old_dir ) {
			$slug = basename( $old_dir );
			if ( '' === $slug || '.' === $slug[0] ) {
				continue;
			}
			$new_dir = self::module_dir( $slug );
			if ( is_dir( $new_dir ) ) {
				continue;
			}
			// phpcs:ignore WordPress.WP.AlternativeFunctions.rename_rename
			@rename( $old_dir, $new_dir );
		}

		update_option( self::MIGRATION_OPTION, '1', false );
	}

	/**
	 * Migrate old slug-based options to the new naming convention.
	 *
	 * @return void
	 */
	public static function maybe_migrate_legacy_slug_options() {
		if ( '1' === get_option( self::MIGRATION_SLUG_OPTION, '' ) ) {
			return;
		}
		foreach ( self::legacy_slug_map() as $old => $new ) {
			self::copy_marketplace_option( $old, $new, 'installed' );
			self::copy_marketplace_option( $old, $new, 'active' );
			self::copy_marketplace_option( $old, $new, 'version' );
		}
		update_option( self::MIGRATION_SLUG_OPTION, '1', false );
	}

	/**
	 * @return array<string,string>
	 */
	public static function legacy_slug_map() {
		return array(
			'wfcp'                     => 'wfcp-module',
			'sms-panel'                => 'sms-panel-module',
			'bale-bot'                 => 'bale-bot-module',
			'telegram-bot'             => 'telegram-bot-module',
			'analytics'                => 'analytics-module',
			'digipay-upg'              => 'digipay-upg-module',
			'digikala-sellers'         => 'digikala-sellers-module',
			'torob-products-extractor' => 'torob-products-extractor-module',
			'torobpay-gateway'         => 'torobpay-gateway-module',
			'snapppay-gateway'         => 'snapppay-gateway-module',
			'basalam'                  => 'basalam-module',
			'zarinpal-gateway'         => 'zarinpal-gateway-module',
		);
	}

	/**
	 * @param string $old Old slug.
	 * @param string $new New slug.
	 * @param string $suffix Option suffix.
	 * @return void
	 */
	private static function copy_marketplace_option( $old, $new, $suffix ) {
		$old_key = self::OPTION_PREFIX . sanitize_key( $old ) . '_' . $suffix;
		$new_key = self::OPTION_PREFIX . sanitize_key( $new ) . '_' . $suffix;
		$new_val = get_option( $new_key, null );
		if ( null !== $new_val ) {
			return;
		}
		$old_val = get_option( $old_key, null );
		if ( null !== $old_val ) {
			update_option( $new_key, $old_val, false );
		}
	}

	/**
	 * Disk presence + complete package. CRM install markers are not required.
	 *
	 * @param string $slug Module slug.
	 * @return bool
	 */
	public static function is_installed( $slug ) {
		$slug = sanitize_key( $slug );
		if ( '' === $slug ) {
			return false;
		}
		$manifest = self::get_manifest( $slug );
		if ( ! is_array( $manifest ) ) {
			return false;
		}
		return self::module_package_is_complete( $slug, $manifest );
	}

	/**
	 * Register every complete module on disk as installed + active.
	 *
	 * @return void
	 */
	public static function ensure_disk_modules_registered() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;

		foreach ( self::scan_manifests() as $manifest ) {
			$slug = sanitize_key( (string) ( $manifest['slug'] ?? '' ) );
			if ( '' === $slug ) {
				continue;
			}
			if ( ! self::module_package_is_complete( $slug, $manifest ) ) {
				continue;
			}
			$version = (string) ( $manifest['version'] ?? '' );
			if ( ! get_option( self::OPTION_PREFIX . $slug . '_installed', false ) ) {
				self::mark_installed( $slug, $version );
				continue;
			}
			if ( '' === (string) get_option( self::OPTION_PREFIX . $slug . '_installed_via', '' ) ) {
				update_option( self::OPTION_PREFIX . $slug . '_installed_via', self::INSTALLED_VIA_VALUE, false );
			}
			$active = get_option( self::OPTION_PREFIX . $slug . '_active', null );
			if ( null === $active ) {
				self::set_active( $slug, self::manifest_default_active( $manifest ) );
			}
			if ( $version && '' === (string) get_option( self::OPTION_PREFIX . $slug . '_version', '' ) ) {
				update_option( self::OPTION_PREFIX . $slug . '_version', sanitize_text_field( $version ), false );
			}
		}
	}

	/**
	 * One-time: force-activate every complete module on disk.
	 * Fixes modules left inactive after the Modules/ path move / unsafe-bootstrap deactivation.
	 *
	 * @return void
	 */
	public static function maybe_reactivate_disk_modules() {
		if ( '1' === (string) get_option( self::DISK_REACTIVATE_OPTION, '' ) ) {
			return;
		}
		foreach ( self::scan_manifests() as $manifest ) {
			$slug = sanitize_key( (string) ( $manifest['slug'] ?? '' ) );
			if ( '' === $slug || ! self::module_package_is_complete( $slug, $manifest ) ) {
				continue;
			}
			if ( ! get_option( self::OPTION_PREFIX . $slug . '_installed', false ) ) {
				self::mark_installed( $slug, (string) ( $manifest['version'] ?? '' ) );
				continue;
			}
			if ( ! self::manifest_default_active( $manifest ) ) {
				continue;
			}
			self::set_active( $slug, true );
		}
		update_option( self::DISK_REACTIVATE_OPTION, '1', false );
	}

	/**
	 * First 0.1.59 builds registered coffee-profile as inactive (default_active false).
	 * Force it on once so it appears in shop settings after zip replace.
	 *
	 * @return void
	 */
	public static function maybe_force_enable_coffee_profile() {
		if ( '1' === (string) get_option( self::COFFEE_PROFILE_FORCE_ON, '' ) ) {
			return;
		}
		$slug     = 'coffee-profile-module';
		$manifest = self::get_manifest( $slug );
		if ( is_array( $manifest ) && self::module_package_is_complete( $slug, $manifest ) ) {
			if ( ! get_option( self::OPTION_PREFIX . $slug . '_installed', false ) ) {
				self::mark_installed( $slug, (string) ( $manifest['version'] ?? '' ) );
			}
			self::set_active( $slug, true );
		}
		update_option( self::COFFEE_PROFILE_FORCE_ON, '1', false );
	}

	/**
	 * True when at least one complete module on disk has a readable client entry.
	 *
	 * @return bool
	 */
	public static function disk_has_readable_module_clients() {
		foreach ( self::scan_manifests() as $manifest ) {
			$slug = sanitize_key( (string) ( $manifest['slug'] ?? '' ) );
			if ( '' === $slug ) {
				continue;
			}
			$client = isset( $manifest['client'] ) && is_array( $manifest['client'] ) ? $manifest['client'] : array();
			if ( empty( $client ) ) {
				continue;
			}
			$entry_rel = (string) ( $client['entry'] ?? 'client/dist/module.js' );
			$entry_abs = self::module_dir( $slug ) . ltrim( $entry_rel, '/' );
			if ( is_readable( $entry_abs ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param string $slug Module slug.
	 * @return bool
	 */
	public static function is_active( $slug ) {
		$slug = sanitize_key( $slug );
		if ( ! self::is_installed( $slug ) ) {
			return false;
		}
		return (bool) get_option( self::OPTION_PREFIX . $slug . '_active', self::manifest_default_active( $slug ) );
	}

	/**
	 * Whether a module should be active on first install.
	 *
	 * @param string|array<string,mixed> $slug_or_manifest Package slug or decoded manifest.
	 * @return bool
	 */
	public static function manifest_default_active( $slug_or_manifest ) {
		$manifest = is_array( $slug_or_manifest ) ? $slug_or_manifest : self::get_manifest( (string) $slug_or_manifest );
		if ( ! is_array( $manifest ) ) {
			return true;
		}
		if ( array_key_exists( 'default_active', $manifest ) ) {
			return (bool) $manifest['default_active'];
		}
		return true;
	}

	/**
	 * @param string $slug Package slug.
	 * @return string Sidebar toggle id.
	 */
	public static function sidebar_module_id_for_slug( $slug ) {
		$manifest = self::get_manifest( $slug );
		if ( $manifest && ! empty( $manifest['sidebar']['module_id'] ) ) {
			return sanitize_key( (string) $manifest['sidebar']['module_id'] );
		}
		return sanitize_key( $slug );
	}

	/**
	 * Resolve marketplace package slug from sidebar settings module id.
	 *
	 * @param string $module_id Sidebar toggle id.
	 * @return string Package slug or empty when not a marketplace module.
	 */
	public static function slug_for_sidebar_module_id( $module_id ) {
		$module_id = sanitize_key( (string) $module_id );
		if ( '' === $module_id ) {
			return '';
		}
		$map = self::sidebar_id_to_slug_map();
		return isset( $map[ $module_id ] ) ? $map[ $module_id ] : '';
	}

	/**
	 * @return array<string,string> Sidebar id => package slug.
	 */
	private static function sidebar_id_to_slug_map() {
		static $map = null;
		if ( null !== $map ) {
			return $map;
		}
		$map = array();
		foreach ( self::legacy_slug_map() as $old => $new ) {
			$map[ sanitize_key( $old ) ]     = sanitize_key( $new );
			$map[ sanitize_key( $new ) ]      = sanitize_key( $new );
		}
		foreach ( self::scan_manifests() as $manifest ) {
			$slug = sanitize_key( (string) ( $manifest['slug'] ?? '' ) );
			if ( '' === $slug ) {
				continue;
			}
			$map[ self::sidebar_module_id_for_slug( $slug ) ] = $slug;
			$map[ $slug ] = $slug;
		}
		return $map;
	}

	/**
	 * Keep legacy sidebar toggle options aligned with marketplace active state.
	 *
	 * @param string $slug   Package slug.
	 * @param bool   $active Active flag.
	 * @return void
	 */
	public static function sync_sidebar_toggle( $slug, $active ) {
		$module_id = self::sidebar_module_id_for_slug( $slug );
		if ( '' === $module_id ) {
			return;
		}
		update_option( 'webino_dashboard_module_' . $module_id . '_active', $active ? '1' : '0', false );
	}

	/**
	 * @param string $slug Package slug.
	 * @return void
	 */
	public static function clear_sidebar_toggle( $slug ) {
		$module_id = self::sidebar_module_id_for_slug( $slug );
		if ( '' === $module_id ) {
			return;
		}
		delete_option( 'webino_dashboard_module_' . $module_id . '_active' );
	}

	/**
	 * One-time alignment of sidebar toggles with marketplace options.
	 *
	 * @return void
	 */
	public static function maybe_sync_sidebar_toggles_from_marketplace() {
		if ( '1' === get_option( self::TOGGLE_SYNC_OPTION, '' ) ) {
			return;
		}
		foreach ( self::list_installed_module_slugs() as $slug ) {
			$active = (bool) get_option( self::OPTION_PREFIX . $slug . '_active', true );
			self::sync_sidebar_toggle( $slug, $active );
		}
		update_option( self::TOGGLE_SYNC_OPTION, '1', false );
	}

	/**
	 * @param string $slug Module slug.
	 * @return array<string,mixed>|null
	 */
	public static function get_manifest( $slug ) {
		$file = self::module_dir( $slug ) . 'manifest.json';
		if ( ! is_readable( $file ) ) {
			return null;
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$data = json_decode( (string) file_get_contents( $file ), true );
		return is_array( $data ) ? $data : null;
	}

	/**
	 * @param string $slug Module slug.
	 * @param bool   $active Active.
	 * @return void
	 */
	public static function set_active( $slug, $active ) {
		$slug = sanitize_key( $slug );
		update_option( self::OPTION_PREFIX . $slug . '_active', $active ? 1 : 0, false );
		self::sync_sidebar_toggle( $slug, $active );
	}

	/**
	 * @param string $slug Module slug.
	 * @param string $version Version.
	 * @return void
	 */
	public static function mark_installed( $slug, $version = '' ) {
		$slug = sanitize_key( $slug );
		$active = self::manifest_default_active( $slug );
		update_option( self::OPTION_PREFIX . $slug . '_installed', 1, false );
		update_option( self::OPTION_PREFIX . $slug . '_installed_via', self::INSTALLED_VIA_VALUE, false );
		update_option( self::OPTION_PREFIX . $slug . '_active', $active ? 1 : 0, false );
		if ( $version ) {
			update_option( self::OPTION_PREFIX . $slug . '_version', sanitize_text_field( $version ), false );
		}
		self::sync_sidebar_toggle( $slug, $active );
	}

	/**
	 * @param string $slug Module slug.
	 * @return void
	 */
	public static function mark_uninstalled( $slug ) {
		$slug = sanitize_key( $slug );
		self::clear_sidebar_toggle( $slug );
		delete_option( self::OPTION_PREFIX . $slug . '_installed' );
		delete_option( self::OPTION_PREFIX . $slug . '_installed_via' );
		delete_option( self::OPTION_PREFIX . $slug . '_active' );
		delete_option( self::OPTION_PREFIX . $slug . '_version' );
		/**
		 * Fires after a marketplace module is uninstalled locally (files may still exist).
		 *
		 * @param string $slug Module slug.
		 */
		do_action( 'webino_dashboard_module_uninstalled', $slug );
	}

	/**
	 * Whether WooCommerce payment gateway APIs are available.
	 *
	 * @return bool
	 */
	public static function is_woocommerce_ready() {
		return class_exists( 'WooCommerce', false ) && class_exists( 'WC_Payment_Gateway', false );
	}

	/**
	 * @param string               $slug     Module slug.
	 * @param array<string,mixed> $manifest Manifest data.
	 * @return bool
	 */
	public static function can_load_module_bootstrap( $slug, array $manifest ) {
		$slug = sanitize_key( $slug );
		if ( '' === $slug ) {
			return false;
		}
		$dir = self::module_dir( $slug );
		if ( ! is_dir( $dir ) || ! is_readable( $dir . 'manifest.json' ) ) {
			return false;
		}
		$bootstrap = ! empty( $manifest['bootstrap'] ) ? ltrim( (string) $manifest['bootstrap'], '/' ) : 'bootstrap.php';
		if ( ! is_readable( $dir . $bootstrap ) ) {
			return false;
		}
		if ( ! empty( $manifest['requires_woocommerce'] ) && ! self::is_woocommerce_ready() ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[Webino Dashboard] Skipping module bootstrap (WooCommerce required): ' . $slug );
			return false;
		}
		if ( ! self::module_dependencies_satisfied( $manifest ) ) {
			return false;
		}
		if ( ! self::module_package_is_complete( $slug, $manifest ) ) {
			return false;
		}
		return true;
	}

	/**
	 * @param array<string,mixed> $manifest Module manifest.
	 * @return bool
	 */
	public static function module_dependencies_satisfied( array $manifest ) {
		$requires = $manifest['requires_modules'] ?? array();
		if ( ! is_array( $requires ) ) {
			return true;
		}
		$slug = sanitize_key( (string) ( $manifest['slug'] ?? '' ) );
		foreach ( $requires as $dep ) {
			$dep = sanitize_key( (string) $dep );
			if ( '' === $dep ) {
				continue;
			}
			if ( ! self::is_installed( $dep ) || ! self::is_active( $dep ) ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log(
					sprintf(
						'[Webino Dashboard] Skipping module %s bootstrap: requires installed active module %s',
						$slug,
						$dep
					)
				);
				return false;
			}
			$dep_manifest = self::get_manifest( $dep );
			if ( is_array( $dep_manifest ) && ! self::can_load_module_bootstrap( $dep, $dep_manifest ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * @param array<string,mixed>|null $manifest Optional manifest (avoids re-read).
	 * @return WP_Error|true
	 */
	public static function validate_module_dependencies( $slug, $manifest = null ) {
		$slug = sanitize_key( (string) $slug );
		if ( '' === $slug ) {
			return new WP_Error( 'invalid_slug', __( 'Invalid module slug.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( ! is_array( $manifest ) ) {
			$manifest = self::get_manifest( $slug );
		}
		if ( ! is_array( $manifest ) ) {
			return new WP_Error( 'invalid_manifest', __( 'Module manifest is missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$requires = $manifest['requires_modules'] ?? array();
		if ( ! is_array( $requires ) || empty( $requires ) ) {
			return true;
		}
		$missing = array();
		foreach ( $requires as $dep ) {
			$dep = sanitize_key( (string) $dep );
			if ( '' === $dep ) {
				continue;
			}
			if ( ! self::is_installed( $dep ) ) {
				$missing[] = $dep;
			}
		}
		if ( ! empty( $missing ) ) {
			return new WP_Error(
				'dependencies_missing',
				sprintf(
					/* translators: %s: comma-separated module slugs */
					__( 'Install required modules first: %s', 'webino-dashboard' ),
					implode( ', ', $missing )
				),
				array(
					'status'  => 400,
					'missing' => $missing,
				)
			);
		}
		return true;
	}

	/**
	 * @return array<int,string>
	 */
	public static function list_installed_module_slugs() {
		$slugs = array();
		foreach ( self::scan_manifests() as $manifest ) {
			$slug = sanitize_key( (string) ( $manifest['slug'] ?? '' ) );
			if ( '' !== $slug && self::is_installed( $slug ) ) {
				$slugs[] = $slug;
			}
		}
		return array_values( array_unique( $slugs ) );
	}

	/**
	 * Disabled: never auto-uninstall modules or strip options.
	 *
	 * @return void
	 */
	public static function heal_orphan_module_options() {
		// Intentionally no-op — disk modules must remain available without CRM markers.
	}

	/**
	 * @param array<string,mixed> $manifest Manifest.
	 * @return string Bootstrap relative path inside module dir.
	 */
	public static function bootstrap_relative_path( array $manifest ) {
		return ! empty( $manifest['bootstrap'] ) ? ltrim( (string) $manifest['bootstrap'], '/' ) : 'bootstrap.php';
	}

	/**
	 * @param string               $slug     Module slug.
	 * @param array<string,mixed>|null $manifest Optional manifest.
	 * @return string Absolute bootstrap path or empty.
	 */
	public static function bootstrap_file_for_slug( $slug, $manifest = null ) {
		$slug = sanitize_key( (string) $slug );
		if ( '' === $slug ) {
			return '';
		}
		if ( ! is_array( $manifest ) ) {
			$manifest = self::get_manifest( $slug );
		}
		if ( ! is_array( $manifest ) ) {
			return '';
		}
		return self::module_dir( $slug ) . self::bootstrap_relative_path( $manifest );
	}

	/**
	 * Parse bootstrap for $dir-relative PHP requires (includes/*.php).
	 *
	 * @param string $bootstrap_file Absolute path.
	 * @return array<int,string> Paths relative to module root (e.g. includes/class-foo.php).
	 */
	public static function bootstrap_required_relative_paths( $bootstrap_file ) {
		$bootstrap_file = (string) $bootstrap_file;
		if ( '' === $bootstrap_file || ! is_readable( $bootstrap_file ) ) {
			return array();
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$content = (string) file_get_contents( $bootstrap_file, false, null, 0, 8192 );
		$paths   = array();
		if ( preg_match_all( '#\$dir\s*\.\s*[\'"]([^\'"]+\.php)[\'"]#', $content, $matches ) ) {
			foreach ( $matches[1] as $rel ) {
				$paths[] = 'includes/' . ltrim( (string) $rel, '/' );
			}
		}
		return array_values( array_unique( $paths ) );
	}

	/**
	 * Whether manifest, bootstrap, and bootstrap-required includes exist and are safe.
	 *
	 * @param string               $slug     Module slug.
	 * @param array<string,mixed> $manifest Manifest.
	 * @return bool
	 */
	public static function module_package_is_complete( $slug, array $manifest ) {
		$slug = sanitize_key( (string) $slug );
		if ( '' === $slug ) {
			return false;
		}
		$dir = self::module_dir( $slug );
		if ( ! is_readable( $dir . 'manifest.json' ) ) {
			return false;
		}
		$bootstrap = self::bootstrap_file_for_slug( $slug, $manifest );
		if ( '' === $bootstrap || ! is_readable( $bootstrap ) ) {
			return false;
		}
		if ( ! self::bootstrap_file_is_safe( $bootstrap, $slug ) ) {
			return false;
		}
		foreach ( self::bootstrap_required_relative_paths( $bootstrap ) as $rel ) {
			if ( ! is_readable( $dir . $rel ) ) {
				return false;
			}
		}
		$client = isset( $manifest['client'] ) && is_array( $manifest['client'] ) ? $manifest['client'] : array();
		$routes = isset( $client['routes'] ) && is_array( $client['routes'] ) ? $client['routes'] : array();
		if ( ! empty( $routes ) ) {
			$entry_rel = (string) ( $client['entry'] ?? 'client/dist/module.js' );
			if ( ! is_readable( $dir . ltrim( $entry_rel, '/' ) ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Installed modules that declare a dependency on $slug.
	 *
	 * @param string $slug Module slug being removed.
	 * @return array<int,string>
	 */
	public static function find_dependent_slugs( $slug ) {
		$slug = sanitize_key( (string) $slug );
		if ( '' === $slug ) {
			return array();
		}
		$dependents = array();
		foreach ( self::list_installed_module_slugs() as $installed ) {
			if ( $installed === $slug ) {
				continue;
			}
			$manifest = self::get_manifest( $installed );
			if ( ! is_array( $manifest ) ) {
				continue;
			}
			$requires = $manifest['requires_modules'] ?? array();
			if ( ! is_array( $requires ) ) {
				continue;
			}
			foreach ( $requires as $dep ) {
				if ( $slug === sanitize_key( (string) $dep ) ) {
					$dependents[] = $installed;
					break;
				}
			}
		}
		return array_values( array_unique( $dependents ) );
	}

	/**
	 * Copy installed module files to uploads backup before reinstall.
	 *
	 * @param string $slug Module slug.
	 * @return string|WP_Error Backup directory path with trailing slash.
	 */
	public static function backup_module_dir( $slug ) {
		$slug = sanitize_key( $slug );
		$src  = self::module_dir( $slug );
		if ( ! is_dir( $src ) ) {
			return new WP_Error( 'backup', __( 'Module directory is missing.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$upload = wp_upload_dir();
		if ( ! empty( $upload['error'] ) ) {
			return new WP_Error( 'backup', $upload['error'], array( 'status' => 500 ) );
		}
		$root = trailingslashit( $upload['basedir'] ) . 'webino-dashboard-backups/modules/';
		wp_mkdir_p( $root );
		$dest = $root . $slug . '-' . gmdate( 'Y-m-d-His' ) . '/';
		wp_mkdir_p( $dest );
		$copied = self::copy_tree( $src, $dest );
		if ( is_wp_error( $copied ) ) {
			self::rrmdir_local( $dest );
			return $copied;
		}
		self::prune_old_module_backups( $root, $slug );
		return $dest;
	}

	/**
	 * Restore module directory from a backup path.
	 *
	 * @param string $slug        Module slug.
	 * @param string $backup_dir  Backup root with trailing slash.
	 * @return true|WP_Error
	 */
	public static function restore_module_dir_from_backup( $slug, $backup_dir ) {
		$slug = sanitize_key( $slug );
		$src  = trailingslashit( (string) $backup_dir );
		if ( ! is_dir( $src ) ) {
			return new WP_Error( 'restore', __( 'Module backup is missing.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$dest = self::module_dir( $slug );
		if ( is_dir( $dest ) ) {
			self::remove_module_dir( $slug );
		}
		wp_mkdir_p( dirname( $dest ) );
		return self::copy_tree( $src, $dest );
	}

	/**
	 * @param string $root Backup modules root with trailing slash.
	 * @param string $slug Module slug.
	 * @return void
	 */
	private static function prune_old_module_backups( $root, $slug ) {
		$slug = sanitize_key( $slug );
		$dirs = array();
		foreach ( glob( trailingslashit( $root ) . $slug . '-*', GLOB_ONLYDIR ) ?: array() as $path ) {
			$dirs[] = $path;
		}
		usort(
			$dirs,
			static function ( $a, $b ) {
				return filemtime( $b ) <=> filemtime( $a );
			}
		);
		foreach ( array_slice( $dirs, 3 ) as $old ) {
			self::rrmdir_local( $old );
		}
	}

	/**
	 * @param string $src  Source directory with trailing slash.
	 * @param string $dest Destination directory with trailing slash.
	 * @return true|WP_Error
	 */
	private static function copy_tree( $src, $dest ) {
		$src  = trailingslashit( (string) $src );
		$dest = trailingslashit( (string) $dest );
		if ( ! is_dir( $src ) ) {
			return new WP_Error( 'copy', __( 'Source directory is missing.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		wp_mkdir_p( $dest );
		$it = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $src, RecursiveDirectoryIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::SELF_FIRST
		);
		foreach ( $it as $item ) {
			$rel = substr( $item->getPathname(), strlen( $src ) );
			$target = $dest . $rel;
			if ( $item->isDir() ) {
				wp_mkdir_p( $target );
				continue;
			}
			wp_mkdir_p( dirname( $target ) );
			if ( ! copy( $item->getPathname(), $target ) ) {
				return new WP_Error( 'copy', __( 'Could not copy module backup files.', 'webino-dashboard' ), array( 'status' => 500 ) );
			}
		}
		return true;
	}

	/**
	 * @param string $dir Directory path.
	 * @return void
	 */
	private static function rrmdir_local( $dir ) {
		if ( ! is_dir( $dir ) ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_REST_Marketplace', false ) ) {
			Webino_Dashboard_REST_Marketplace::rrmdir( $dir );
			return;
		}
		$it = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $dir, RecursiveDirectoryIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::CHILD_FIRST
		);
		foreach ( $it as $file ) {
			if ( $file->isDir() ) {
				// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
				@rmdir( $file->getPathname() );
			} else {
				wp_delete_file( $file->getPathname() );
			}
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
		@rmdir( $dir );
	}

	/**
	 * Require module include files with readability checks (for bootstrap.php).
	 *
	 * @param string              $dir   Directory with trailing slash.
	 * @param array<int,string>   $files Relative filenames inside $dir.
	 * @param string              $slug  Module slug for logging.
	 * @return bool False when any file is missing.
	 */
	public static function require_module_files( $dir, array $files, $slug = '' ) {
		$dir = trailingslashit( (string) $dir );
		foreach ( $files as $file ) {
			$path = $dir . ltrim( (string) $file, '/' );
			if ( ! is_readable( $path ) ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log(
					sprintf(
						'[Webino Dashboard] Module bootstrap skipped (%s): missing %s',
						$slug ? $slug : 'unknown',
						$path
					)
				);
				return false;
			}
			require_once $path;
		}
		return true;
	}

	/**
	 * @param string $slug Module slug.
	 * @return bool
	 */
	public static function is_builtin_slug( $slug ) {
		$manifest = self::get_manifest( sanitize_key( (string) $slug ) );
		if ( ! is_array( $manifest ) ) {
			return false;
		}
		return ! empty( $manifest['is_builtin'] ) || ! empty( $manifest['is_first_party'] );
	}

	/**
	 * Disabled: never delete module directories automatically.
	 *
	 * @return void
	 */
	public static function prune_unregistered_module_dirs() {
		// Intentionally no-op — uploaded Modules/ packages must not be removed.
	}

	/**
	 * Reject legacy or cross-module bootstrap patterns before require (prevents fatal on bad ZIPs).
	 *
	 * @param string $file Bootstrap absolute path.
	 * @param string $slug Module slug (for logging).
	 * @return bool
	 */
	public static function bootstrap_file_is_safe( $file, $slug = '' ) {
		$file = (string) $file;
		if ( '' === $file || ! is_readable( $file ) ) {
			return false;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$head = file_get_contents( $file, false, null, 0, 4096 );
		if ( false === $head || '' === $head ) {
			return false;
		}

		$unsafe = array(
			'bale-bot/includes/',
			'telegram-bot/includes/',
		);
		foreach ( $unsafe as $needle ) {
			if ( false !== strpos( $head, $needle ) ) {
				return false;
			}
		}

		if ( preg_match( '#Modules/(bale-bot|telegram-bot|wfcp)(?!-module)#', $head ) ) {
			return false;
		}

		if ( preg_match( '#require(?:_once)?\s*\(?\s*[\'"][^\'"]*Modules/[^\'"]+-module/[^\'"]*/includes/#', $head ) ) {
			$own = preg_quote( self::module_dir( $slug ), '#' );
			if ( ! preg_match( '#' . $own . '#', $head ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @param string $file Bootstrap file path.
	 * @param string $slug Module slug (used to auto-disable unsafe bootstraps).
	 * @return bool True when loaded.
	 */
	public static function safe_require_bootstrap( $file, $slug = '' ) {
		$file = (string) $file;
		$slug = sanitize_key( (string) $slug );
		if ( '' === $file || ! is_readable( $file ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[Webino Dashboard] Module bootstrap not readable: ' . $file );
			return false;
		}
		if ( ! self::bootstrap_file_is_safe( $file, $slug ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log(
				sprintf(
					'[Webino Dashboard] Unsafe/legacy module bootstrap blocked (module deactivated): %s (%s)',
					$slug ? $slug : $file,
					$file
				)
			);
			if ( '' !== $slug ) {
				self::set_active( $slug, false );
			}
			return false;
		}
		$manifest = '' !== $slug ? self::get_manifest( $slug ) : null;
		if ( '' !== $slug && ( ! is_array( $manifest ) || ! self::module_package_is_complete( $slug, $manifest ) ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[Webino Dashboard] Incomplete module package blocked (not uninstalled): ' . $slug );
			return false;
		}
		require_once $file;
		return true;
	}

	/**
	 * @return void
	 */
	public static function load_active_modules() {
		self::ensure_disk_modules_registered();

		foreach ( self::list_installed_module_slugs() as $slug ) {
			if ( ! self::is_active( $slug ) ) {
				continue;
			}
			$manifest = self::get_manifest( $slug );
			if ( ! is_array( $manifest ) ) {
				continue;
			}
			if ( ! self::can_load_module_bootstrap( $slug, $manifest ) ) {
				continue;
			}
			$bootstrap = (string) ( $manifest['bootstrap'] ?? 'bootstrap.php' );
			$file      = self::module_dir( $slug ) . ltrim( $bootstrap, '/' );
			self::safe_require_bootstrap( $file, $slug );
		}
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function scan_manifests() {
		$dir = self::modules_dir();
		if ( ! is_dir( $dir ) ) {
			return array();
		}
		$out = array();
		foreach ( glob( $dir . '*/manifest.json' ) ?: array() as $file ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$raw  = file_get_contents( $file );
			$data = json_decode( (string) $raw, true );
			if ( is_array( $data ) && ! empty( $data['slug'] ) ) {
				$out[] = $data;
			}
		}
		return $out;
	}

	/**
	 * @param array<int,array<string,mixed>> $modules Nav tree.
	 * @return array<int,array<string,mixed>>
	 */
	public static function merge_sidebar_modules( $modules ) {
		foreach ( self::scan_manifests() as $manifest ) {
			$slug = (string) ( $manifest['slug'] ?? '' );
			if ( ! $slug || ! self::is_active( $slug ) ) {
				continue;
			}
			$nodes = self::sidebar_nodes_from_manifest( $manifest );
			foreach ( $nodes as $node ) {
				$modules = self::inject_sidebar_node( $modules, $node, $manifest );
			}
		}
		return $modules;
	}

	/**
	 * @param array<string,mixed> $manifest Manifest.
	 * @return array<int,array<string,mixed>>
	 */
	private static function sidebar_nodes_from_manifest( $manifest ) {
		$sidebar = isset( $manifest['sidebar'] ) && is_array( $manifest['sidebar'] ) ? $manifest['sidebar'] : array();
		if ( isset( $sidebar[0] ) && is_array( $sidebar[0] ) ) {
			$out = array();
			foreach ( $sidebar as $block ) {
				if ( empty( $block['nodes'] ) || ! is_array( $block['nodes'] ) ) {
					continue;
				}
				foreach ( $block['nodes'] as $node ) {
					if ( is_array( $node ) ) {
						$out[] = array_merge( $node, array( '_parent_id' => (string) ( $block['parent_id'] ?? '' ) ) );
					}
				}
			}
			return $out;
		}
		if ( ! empty( $sidebar['nodes'] ) && is_array( $sidebar['nodes'] ) ) {
			return $sidebar['nodes'];
		}
		if ( empty( $sidebar ) ) {
			return array();
		}
		$id = (string) ( $sidebar['module_id'] ?? $manifest['slug'] ?? '' );
		if ( '' === $id ) {
			return array();
		}
		return array(
			array_merge(
				array(
					'id'         => $id,
					'title'      => (string) ( $sidebar['title'] ?? $manifest['name'] ?? $id ),
					'path'       => (string) ( $sidebar['path'] ?? '' ),
					'capability' => (string) ( $sidebar['capability'] ?? 'read' ),
					'icon'       => (string) ( $sidebar['icon'] ?? 'box' ),
					'nav_group'  => (string) ( $sidebar['nav_group'] ?? 'tools' ),
				),
				isset( $sidebar['children'] ) && is_array( $sidebar['children'] ) ? array( 'children' => $sidebar['children'] ) : array()
			),
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $modules Tree.
	 * @param array<string,mixed>          $node    Node to inject.
	 * @param array<string,mixed>          $manifest Manifest.
	 * @return array<int,array<string,mixed>>
	 */
	private static function inject_sidebar_node( array $modules, array $node, array $manifest ) {
		$parent_key = ! empty( $node['_parent_id'] )
			? (string) $node['_parent_id']
			: ( isset( $manifest['sidebar']['parent_id'] ) ? (string) $manifest['sidebar']['parent_id'] : '' );
		unset( $node['_parent_id'] );
		if ( '' !== $parent_key ) {
			foreach ( $modules as $i => $mod ) {
				if ( (string) ( $mod['id'] ?? '' ) !== $parent_key ) {
					continue;
				}
				$children = isset( $mod['children'] ) && is_array( $mod['children'] ) ? $mod['children'] : array();
				$children = self::upsert_child( $children, $node );
				$modules[ $i ]['children'] = $children;
				return $modules;
			}
		}
		return self::upsert_top_level( $modules, $node );
	}

	/**
	 * @param array<int,array<string,mixed>> $children Children.
	 * @param array<string,mixed>          $node Node.
	 * @return array<int,array<string,mixed>>
	 */
	private static function upsert_child( array $children, array $node ) {
		$id   = (string) ( $node['id'] ?? '' );
		$path = (string) ( $node['path'] ?? '' );
		foreach ( $children as $i => $child ) {
			$child_id   = (string) ( $child['id'] ?? '' );
			$child_path = (string) ( $child['path'] ?? '' );
			$same_id    = '' !== $id && $child_id === $id;
			$same_path  = '' !== $path && $child_path === $path;
			if ( $same_id || $same_path ) {
				$children[ $i ] = $node;
				return $children;
			}
		}
		$children[] = $node;
		return $children;
	}

	/**
	 * @param array<int,array<string,mixed>> $modules Modules.
	 * @param array<string,mixed>          $node Node.
	 * @return array<int,array<string,mixed>>
	 */
	private static function upsert_top_level( array $modules, array $node ) {
		$id = (string) ( $node['id'] ?? '' );
		foreach ( $modules as $i => $mod ) {
			if ( (string) ( $mod['id'] ?? '' ) === $id ) {
				$modules[ $i ] = $node;
				return $modules;
			}
		}
		$modules[] = $node;
		return $modules;
	}

	/**
	 * @param array<int,array<string,mixed>> $modules Modules list.
	 * @return array<int,array<string,mixed>>
	 */
	public static function filter_registered_modules( $modules ) {
		foreach ( self::get_local_state_list() as $row ) {
			$modules[] = $row;
		}
		return $modules;
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function get_local_state_list() {
		$list = array();
		foreach ( self::scan_manifests() as $manifest ) {
			$list[] = self::local_row_from_manifest( $manifest );
		}
		return $list;
	}

	/**
	 * @param array<string,mixed> $manifest Manifest.
	 * @return array<string,mixed>
	 */
	public static function local_row_from_manifest( $manifest ) {
		$slug     = (string) ( $manifest['slug'] ?? '' );
		$settings = isset( $manifest['settings'] ) && is_array( $manifest['settings'] ) ? $manifest['settings'] : array();
		$name = (string) ( $manifest['name'] ?? $settings['title'] ?? $slug );
		return array(
			'slug'           => $slug,
			'name'           => $name,
			'installed'      => self::is_installed( $slug ),
			'active'         => self::is_active( $slug ),
			'is_builtin'     => ! empty( $manifest['is_builtin'] ),
			'version'        => (string) ( $manifest['version'] ?? get_option( self::OPTION_PREFIX . $slug . '_version', '1.0.0' ) ),
			'settings_area'  => (string) ( $settings['area'] ?? 'shop' ),
			'settings_route' => (string) ( $settings['route'] ?? '' ),
			'settings_title' => (string) ( $settings['title'] ?? $name ),
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $sections Sections.
	 * @return array<int,array<string,mixed>>
	 */
	public static function filter_settings_sections( $sections ) {
		foreach ( self::scan_manifests() as $manifest ) {
			$slug = (string) ( $manifest['slug'] ?? '' );
			if ( ! $slug || ! self::is_active( $slug ) ) {
				continue;
			}
			foreach ( self::settings_sections_from_manifest( $manifest ) as $sec ) {
				$sections[] = $sec;
			}
		}
		return $sections;
	}

	/**
	 * @param array<string,mixed> $manifest Manifest.
	 * @return array<int,array<string,mixed>>
	 */
	public static function settings_sections_from_manifest( $manifest ) {
		$slug     = (string) ( $manifest['slug'] ?? '' );
		$settings = isset( $manifest['settings'] ) && is_array( $manifest['settings'] ) ? $manifest['settings'] : array();
		$area     = (string) ( $settings['area'] ?? 'shop' );
		$title    = (string) ( $settings['title'] ?? $manifest['name'] ?? $slug );
		$out      = array();

		if ( ! empty( $settings['sections'] ) && is_array( $settings['sections'] ) ) {
			foreach ( $settings['sections'] as $sec ) {
				if ( ! is_array( $sec ) ) {
					continue;
				}
				$route = (string) ( $sec['route'] ?? '' );
				if ( '' === $route ) {
					continue;
				}
				$section_id = ! empty( $sec['id'] ) ? sanitize_key( (string) $sec['id'] ) : '';
				$title_key  = ! empty( $sec['titleKey'] ) ? (string) $sec['titleKey'] : '';
				if ( '' === $title_key && 'wfcp-module' === $slug && '' !== $section_id ) {
					$title_key = 'wfcp.tab.' . $section_id;
				}
				$row = array(
					'slug'        => $slug . ( $section_id ? '-' . $section_id : '' ),
					'moduleSlug'  => $slug,
					'sectionId'   => $section_id,
					'moduleTitle' => $title,
					'title'       => (string) ( $sec['title'] ?? $title ),
					'area'        => (string) ( $sec['area'] ?? $area ),
					'route'       => $route,
					'parentSlug'  => sanitize_key( (string) ( $manifest['parent_slug'] ?? '' ) ),
				);
				if ( '' !== $title_key ) {
					$row['titleKey'] = $title_key;
				}
				$out[] = $row;
			}
			return $out;
		}

		$route = (string) ( $settings['route'] ?? '' );
		if ( '' === $route ) {
			$route = '/settings/' . $area . '/ext/' . $slug;
		}
		$out[] = array(
			'slug'        => $slug,
			'moduleSlug'  => $slug,
			'sectionId'   => '',
			'moduleTitle' => $title,
			'title'       => $title,
			'area'        => $area,
			'route'       => $route,
			'parentSlug'  => sanitize_key( (string) ( $manifest['parent_slug'] ?? '' ) ),
		);
		return $out;
	}

	/**
	 * Active modules with client bundles for SPA dynamic routes.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function get_active_module_clients() {
		$out = array();
		foreach ( self::scan_manifests() as $manifest ) {
			$slug = (string) ( $manifest['slug'] ?? '' );
			if ( ! $slug || ! self::is_active( $slug ) ) {
				continue;
			}
			$client = isset( $manifest['client'] ) && is_array( $manifest['client'] ) ? $manifest['client'] : array();
			if ( empty( $client ) ) {
				continue;
			}
			$entry_rel = (string) ( $client['entry'] ?? 'client/dist/module.js' );
			$entry_abs = self::module_dir( $slug ) . ltrim( $entry_rel, '/' );
			if ( ! is_readable( $entry_abs ) ) {
				continue;
			}
			$entry_url = plugins_url(
				'Modules/' . $slug . '/' . ltrim( $entry_rel, '/' ),
				WEBINO_DASHBOARD_FILE
			);
			// Bust long-lived CDN/browser caches of unhashed module.js after rebuilds.
			$mtime = @filemtime( $entry_abs ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			if ( $mtime ) {
				$entry_url = add_query_arg( 'ver', (string) $mtime, $entry_url );
			}
			$routes = isset( $client['routes'] ) && is_array( $client['routes'] ) ? $client['routes'] : array();
			$normalized_routes = array();
			foreach ( $routes as $route ) {
				if ( ! is_array( $route ) || empty( $route['path'] ) ) {
					continue;
				}
				$normalized_routes[] = array(
					'path'           => ltrim( (string) $route['path'], '/' ),
					'capability'     => self::normalize_route_capability( $route['capability'] ?? 'read' ),
					'headerTitleKey' => (string) ( $route['headerTitleKey'] ?? '' ),
					'headerParamKeys'=> isset( $route['headerParamKeys'] ) && is_array( $route['headerParamKeys'] ) ? $route['headerParamKeys'] : array(),
				);
			}
			// Include modules with a readable entry even when routes are empty —
			// settings panels load named components from the same bundle.
			$out[] = array(
				'slug'   => $slug,
				'entry'  => $entry_url,
				'routes' => $normalized_routes,
			);
		}
		return $out;
	}

	/**
	 * Normalize route capability from manifest (string or OR-list array).
	 *
	 * @param mixed $capability Capability from manifest route.
	 * @return string|array<int,string>
	 */
	private static function normalize_route_capability( $capability ) {
		if ( is_array( $capability ) ) {
			$out = array();
			foreach ( $capability as $cap ) {
				$cap = sanitize_key( (string) $cap );
				if ( '' !== $cap ) {
					$out[] = $cap;
				}
			}
			return ! empty( $out ) ? array_values( array_unique( $out ) ) : 'read';
		}
		$cap = sanitize_key( (string) $capability );
		return '' !== $cap ? $cap : 'read';
	}

	/**
	 * Validate extracted module package before marking installed.
	 *
	 * @param string $slug Module slug.
	 * @return true|WP_Error
	 */
	public static function validate_installed_package( $slug ) {
		$slug = sanitize_key( $slug );
		$dir  = self::module_dir( $slug );
		if ( ! is_dir( $dir ) ) {
			return new WP_Error( 'invalid_package', __( 'Module directory is missing.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		if ( ! is_readable( $dir . 'manifest.json' ) ) {
			self::remove_module_dir( $slug );
			return new WP_Error( 'invalid_package', __( 'manifest.json is missing in the module package.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$manifest = self::get_manifest( $slug );
		if ( ! $manifest || empty( $manifest['slug'] ) ) {
			self::remove_module_dir( $slug );
			return new WP_Error( 'invalid_package', __( 'manifest.json is invalid.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$manifest_slug = sanitize_key( (string) $manifest['slug'] );
		if ( $manifest_slug !== $slug ) {
			self::remove_module_dir( $slug );
			return new WP_Error( 'invalid_package', __( 'Manifest slug does not match requested module slug.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$bootstrap = ! empty( $manifest['bootstrap'] ) ? ltrim( (string) $manifest['bootstrap'], '/' ) : 'bootstrap.php';
		if ( ! is_readable( $dir . $bootstrap ) ) {
			self::remove_module_dir( $slug );
			return new WP_Error( 'invalid_package', __( 'Manifest bootstrap file is missing.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		if ( ! self::module_package_is_complete( $slug, $manifest ) ) {
			self::remove_module_dir( $slug );
			return new WP_Error(
				'incomplete_package',
				__( 'Module package is incomplete. Required files are missing.', 'webino-dashboard' ),
				array( 'status' => 400 )
			);
		}
		if ( ! empty( $manifest['requires_woocommerce'] ) && ! self::is_woocommerce_ready() ) {
			self::remove_module_dir( $slug );
			return new WP_Error(
				'woocommerce_required',
				__( 'WooCommerce is required for this module.', 'webino-dashboard' ),
				array( 'status' => 400 )
			);
		}
		return true;
	}

	/**
	 * Merge CRM catalog parent into installed manifest for sidebar grouping.
	 *
	 * @param string               $slug           Module slug.
	 * @param array<string,mixed>  $catalog_module Catalog row from CRM.
	 * @return void
	 */
	public static function apply_catalog_parent_to_manifest( $slug, array $catalog_module ) {
		$parent_slug = sanitize_key( (string) ( $catalog_module['parent_slug'] ?? '' ) );
		if ( '' === $parent_slug ) {
			return;
		}
		$file = self::module_dir( sanitize_key( $slug ) ) . 'manifest.json';
		if ( ! is_readable( $file ) ) {
			return;
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$manifest = json_decode( (string) file_get_contents( $file ), true );
		if ( ! is_array( $manifest ) ) {
			return;
		}
		if ( ! isset( $manifest['sidebar'] ) || ! is_array( $manifest['sidebar'] ) ) {
			$manifest['sidebar'] = array();
		}
		$parent_id = $parent_slug;
		if ( str_ends_with( $parent_id, '-module' ) ) {
			$parent_id = substr( $parent_id, 0, -7 );
		}
		$manifest['sidebar']['parent_id'] = $parent_id;
		$manifest['parent_slug']            = $parent_slug;
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_put_contents_file_put_contents
		file_put_contents(
			$file,
			wp_json_encode( $manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ) . "\n"
		);
	}

	/**
	 * @param string $slug Module slug.
	 * @return void
	 */
	public static function remove_module_dir( $slug ) {
		$dir = self::module_dir( sanitize_key( $slug ) );
		if ( ! is_dir( $dir ) ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_REST_Marketplace', false ) ) {
			Webino_Dashboard_REST_Marketplace::rrmdir( $dir );
			return;
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
		$it = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $dir, RecursiveDirectoryIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::CHILD_FIRST
		);
		foreach ( $it as $file ) {
			if ( $file->isDir() ) {
				// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
				@rmdir( $file->getPathname() );
			} else {
				wp_delete_file( $file->getPathname() );
			}
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
		@rmdir( $dir );
	}

	/**
	 * @return bool
	 */
	public static function wfcp_ready() {
		return class_exists( 'WFCP_Helper', false ) && self::is_active( 'wfcp-module' );
	}

	/**
	 * Analytics bootstrap loaded and module toggle active.
	 *
	 * @return bool
	 */
	public static function analytics_ready() {
		return class_exists( 'Webino_Dashboard_Analytics', false )
			&& Webino_Dashboard_Analytics::is_module_active();
	}

	/**
	 * SMS panel bootstrap loaded and module active.
	 *
	 * @return bool
	 */
	public static function sms_ready() {
		return class_exists( 'Webino_Dashboard_Sms_Settings', false )
			&& self::is_active( 'sms-panel-module' );
	}

	/**
	 * Bale/Telegram bot loader available (at least one bot module bootstrapped).
	 *
	 * @return bool
	 */
	public static function bots_loader_ready() {
		return class_exists( 'Webino_Dashboard_Bots_Loader', false )
			&& ( self::is_active( 'bale-bot-module' ) || self::is_active( 'telegram-bot-module' ) );
	}

	/**
	 * Security (Webino Shield) module active and facade loaded.
	 *
	 * @return bool
	 */
	public static function security_ready() {
		return class_exists( 'Webino_Dashboard_Security', false )
			&& self::is_active( 'security-module' );
	}
}
