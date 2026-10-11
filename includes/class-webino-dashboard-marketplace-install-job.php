<?php
/**
 * Background marketplace module install jobs.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Async install state stored in transients; heavy work runs after REST response, cron, or CLI.
 */
final class Webino_Dashboard_Marketplace_Install_Job {

	const TRANSIENT_PREFIX = 'webino_mp_install_';

	const LOCK_PREFIX = 'webino_mp_install_lock_';

	const SLUG_LOCK_PREFIX = 'webino_mp_install_slug_';

	const CRON_HOOK = 'webino_dashboard_mp_install_run';

	const TTL = 1800;

	const RUN_LOCK_TTL = 900;

	/**
	 * @return void
	 */
	public static function init() {
		add_action( self::CRON_HOOK, array( __CLASS__, 'cron_run' ), 10, 1 );
	}

	/**
	 * Cron worker — runs without internal_token by design (job state validated via transient).
	 *
	 * @param string $job_id Job id.
	 * @return void
	 */
	public static function cron_run( $job_id ) {
		self::run( (string) $job_id );
	}

	/**
	 * @param string $slug    Module slug.
	 * @param string $version Optional version.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function start( $slug, $version = '' ) {
		$slug    = sanitize_key( (string) $slug );
		$version = sanitize_text_field( (string) $version );
		if ( self::has_active_job_for_slug( $slug ) ) {
			return new WP_Error(
				'install_in_progress',
				__( 'Another install for this module is already running.', 'webino-dashboard' ),
				array( 'status' => 409 )
			);
		}
		$version_err = self::validate_requested_version( $slug, $version );
		if ( is_wp_error( $version_err ) ) {
			return $version_err;
		}
		$module  = Webino_Dashboard_REST_Marketplace::fetch_module_meta_from_cache( $slug );
		if ( empty( $module ) ) {
			return new WP_Error(
				'not_found',
				__( 'Module not found in catalog.', 'webino-dashboard' ),
				array( 'status' => 404 )
			);
		}

		$job_id         = wp_generate_password( 16, false, false );
		$internal_token = wp_generate_password( 32, false, false );
		$domain         = Webino_Dashboard_License::instance()->get_current_domain();
		$state          = array(
			'job_id'           => $job_id,
			'internal_token'   => $internal_token,
			'status'           => 'queued',
			'step'             => 'queued',
			'slug'             => $slug,
			'version'          => $version,
			'message'          => '',
			'error'            => '',
			'domain'           => $domain,
			'started_at'       => gmdate( 'c' ),
			'finished_at'      => null,
			'dispatched_at'    => null,
			'dispatch_methods' => '',
			'last_step_at'     => gmdate( 'c' ),
			'ok'               => false,
			'install_version'  => '',
			'reinstall'        => Webino_Dashboard_Module_Registry::is_installed( $slug ),
			'debug'            => array(),
		);
		self::save( $job_id, $state );
		self::set_slug_lock( $slug );

		$methods = self::dispatch_worker( $job_id, $internal_token );
		self::patch(
			$job_id,
			array(
				'dispatched_at'    => gmdate( 'c' ),
				'dispatch_methods' => implode( ',', $methods ),
			)
		);

		if ( empty( $methods ) ) {
			self::clear_slug_lock( $slug );
			self::fail(
				$job_id,
				'queued',
				__( 'Could not schedule background install.', 'webino-dashboard' )
			);
			return new WP_Error(
				'worker_spawn_failed',
				__( 'Could not schedule background install.', 'webino-dashboard' ),
				array( 'status' => 500 )
			);
		}

		return array(
			'job_id'  => $job_id,
			'status'  => 'running',
			'slug'    => $slug,
			'step'    => 'queued',
		);
	}

	/**
	 * @param string $slug Module slug.
	 * @return bool
	 */
	public static function has_active_job_for_slug( $slug ) {
		$slug = sanitize_key( (string) $slug );
		if ( '' === $slug ) {
			return false;
		}
		return (bool) get_transient( self::slug_lock_key( $slug ) );
	}

	/**
	 * @param string $slug    Module slug.
	 * @param string $version Requested version.
	 * @return true|WP_Error
	 */
	public static function validate_requested_version( $slug, $version ) {
		$slug    = sanitize_key( (string) $slug );
		$version = sanitize_text_field( (string) $version );
		if ( '' === $slug || '' === $version || ! Webino_Dashboard_Module_Registry::is_installed( $slug ) ) {
			return true;
		}
		$installed = (string) get_option( Webino_Dashboard_Module_Registry::OPTION_PREFIX . $slug . '_version', '' );
		if ( '' === $installed ) {
			return true;
		}
		if ( version_compare( $version, $installed, '<' ) && ! apply_filters( 'webino_dashboard_allow_module_downgrade', false, $slug ) ) {
			return new WP_Error(
				'downgrade_blocked',
				sprintf(
					/* translators: 1: installed version, 2: requested version */
					__( 'Downgrading module from %1$s to %2$s is not allowed.', 'webino-dashboard' ),
					$installed,
					$version
				),
				array( 'status' => 400 )
			);
		}
		return true;
	}

	/**
	 * @param string $job_id Job id.
	 * @return array<string,mixed>|null
	 */
	public static function get( $job_id ) {
		$job_id = sanitize_key( (string) $job_id );
		if ( '' === $job_id ) {
			return null;
		}
		$state = get_transient( self::transient_key( $job_id ) );
		return is_array( $state ) ? $state : null;
	}

	/**
	 * @param string              $job_id Job id.
	 * @param array<string,mixed> $patch  Fields to merge.
	 * @return void
	 */
	public static function patch( $job_id, array $patch ) {
		$state = self::get( $job_id );
		if ( ! is_array( $state ) ) {
			return;
		}
		if ( isset( $patch['step'] ) ) {
			$patch['last_step_at'] = gmdate( 'c' );
		}
		self::save( $job_id, array_merge( $state, $patch ) );
	}

	/**
	 * @param string $job_id Job id.
	 * @return void
	 */
	public static function run( $job_id ) {
		self::run_internal( $job_id, '' );
	}

	/**
	 * CLI entry — requires per-job internal token.
	 *
	 * @param string $job_id Job id.
	 * @param string $internal_token Token from job transient.
	 * @return void
	 */
	public static function run_cli( $job_id, $internal_token ) {
		$job_id = sanitize_key( (string) $job_id );
		if ( '' === $job_id || ! self::verify_internal_token( $job_id, (string) $internal_token ) ) {
			return;
		}
		self::run_internal( $job_id, (string) $internal_token );
	}

	/**
	 * @param string $job_id         Job id.
	 * @param string $internal_token Empty when invoked from cron.
	 * @return void
	 */
	private static function run_internal( $job_id, $internal_token ) {
		@set_time_limit( 0 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors

		$job_id = sanitize_key( (string) $job_id );
		if ( '' === $job_id || ! self::acquire_run_lock( $job_id ) ) {
			return;
		}

		try {
			$state = self::get( $job_id );
			if ( ! is_array( $state ) ) {
				return;
			}
			if ( in_array( (string) ( $state['status'] ?? '' ), array( 'success', 'failed' ), true ) ) {
				return;
			}

			self::patch(
				$job_id,
				array(
					'status' => 'running',
					'step'   => 'clone_url',
				)
			);

			self::execute_install(
				$job_id,
				(string) ( $state['slug'] ?? '' ),
				(string) ( $state['version'] ?? '' ),
				Webino_Dashboard_REST_Marketplace::fetch_module_meta_from_cache( (string) ( $state['slug'] ?? '' ) )
			);
		} finally {
			self::release_run_lock( $job_id );
		}
	}

	/**
	 * @param string $job_id          Job id.
	 * @param string $internal_token  Expected internal token.
	 * @return bool
	 */
	public static function verify_internal_token( $job_id, $internal_token ) {
		$state = self::get( $job_id );
		if ( ! is_array( $state ) ) {
			return false;
		}
		$expected = (string) ( $state['internal_token'] ?? '' );
		return '' !== $expected && hash_equals( $expected, (string) $internal_token );
	}

	/**
	 * @param string $job_id Job id.
	 * @return array<string,mixed>
	 */
	public static function public_status( $job_id ) {
		$state = self::get( $job_id );
		if ( ! is_array( $state ) ) {
			return array();
		}
		$out = array(
			'job_id'  => (string) ( $state['job_id'] ?? $job_id ),
			'status'  => (string) ( $state['status'] ?? 'unknown' ),
			'step'    => (string) ( $state['step'] ?? '' ),
			'slug'    => (string) ( $state['slug'] ?? '' ),
			'message' => (string) ( $state['message'] ?? $state['error'] ?? '' ),
			'ok'      => ! empty( $state['ok'] ),
		);
		if ( ! empty( $state['install_version'] ) ) {
			$out['version'] = (string) $state['install_version'];
		}
		if ( current_user_can( 'manage_options' ) ) {
			$diag = array(
				'dispatched_at'    => (string) ( $state['dispatched_at'] ?? '' ),
				'dispatch_methods' => (string) ( $state['dispatch_methods'] ?? '' ),
				'last_step_at'     => (string) ( $state['last_step_at'] ?? '' ),
			);
			$extra = is_array( $state['debug'] ?? null ) ? $state['debug'] : array();
			$out['debug'] = array_merge( $diag, $extra );
		}
		return $out;
	}

	/**
	 * @param string               $job_id  Job id.
	 * @param string               $slug    Module slug.
	 * @param string               $version Version.
	 * @param array<string,mixed>  $module  Catalog module row.
	 * @return void
	 */
	private static function execute_install( $job_id, $slug, $version, array $module ) {
		$started = microtime( true );
		$license = Webino_Dashboard_License::instance();
		$domain  = $license->get_current_domain();

		if ( empty( $module ) ) {
			self::fail( $job_id, 'module_lookup', __( 'Module not found in catalog.', 'webino-dashboard' ), $started, $domain );
			return;
		}

		if ( ! self::git_is_available() ) {
			self::fail(
				$job_id,
				'git',
				__( 'Git is required to install marketplace modules but is not available on this server.', 'webino-dashboard' ),
				$started,
				$domain
			);
			return;
		}

		// Free modules: ensure ERP entitlement via purchase (no payment).
		if ( ! empty( $module['is_free'] ) && empty( $module['entitled'] ) ) {
			self::patch( $job_id, array( 'step' => 'purchase' ) );
			$free = $license->crm_post(
				'wp-json/webinocrm/v1/marketplace/purchase',
				array(
					'module_slug' => $slug,
					'pay'         => false,
					'mark_paid'   => true,
				),
				'install'
			);
			if ( empty( $free['ok'] ) ) {
				$msg = is_array( $free['data'] ?? null ) && ! empty( $free['data']['message'] )
					? (string) $free['data']['message']
					: ( $free['error'] ?? __( 'Could not claim free module entitlement.', 'webino-dashboard' ) );
				self::fail( $job_id, 'purchase', $msg, $started, $domain );
				return;
			}
		}

		self::patch( $job_id, array( 'step' => 'clone_url' ) );

		$clone_body = array( 'module_slug' => $slug );
		if ( '' !== $version ) {
			$clone_body['version'] = $version;
		}
		$grant = $license->crm_post(
			'wp-json/webinocrm/v1/license/module-clone-url',
			$clone_body,
			'install'
		);

		$grant_data = is_array( $grant['data'] ?? null ) ? $grant['data'] : array();
		if ( isset( $grant_data['data'] ) && is_array( $grant_data['data'] ) ) {
			$grant_data = $grant_data['data'];
		}
		$clone_url = (string) ( $grant_data['clone_url'] ?? '' );

		if ( empty( $grant['ok'] ) || '' === $clone_url ) {
			$msg = is_array( $grant['data'] ?? null ) && ! empty( $grant['data']['message'] )
				? (string) $grant['data']['message']
				: ( $grant['error'] ?? __( 'Could not obtain git clone URL.', 'webino-dashboard' ) );
			if ( is_array( $grant['data']['error'] ?? null ) && ! empty( $grant['data']['error']['message'] ) ) {
				$msg = (string) $grant['data']['error']['message'];
			}
			self::fail( $job_id, 'clone_url', $msg, $started, $domain, self::crm_grant_debug( $grant ) );
			return;
		}

		if ( ! class_exists( 'Webino_Dashboard_Remote_Url', false ) || ! Webino_Dashboard_Remote_Url::is_allowed_clone_url( $clone_url ) ) {
			self::fail( $job_id, 'clone_url', __( 'Clone URL is not allowed.', 'webino-dashboard' ), $started, $domain );
			return;
		}

		self::patch( $job_id, array( 'step' => 'git_clone' ) );

		$staging = trailingslashit( WP_CONTENT_DIR ) . '.webino-mp-clone-' . wp_generate_password( 8, false, false );
		$cloned  = self::git_clone_to( $clone_url, $staging, $version );
		if ( is_wp_error( $cloned ) ) {
			self::rrmdir( $staging );
			self::fail( $job_id, 'git_clone', $cloned->get_error_message(), $started, $domain );
			return;
		}

		self::patch( $job_id, array( 'step' => 'prepare' ) );

		$package_root = self::locate_module_package_root( $staging, $slug );
		if ( is_wp_error( $package_root ) ) {
			self::rrmdir( $staging );
			self::fail( $job_id, 'prepare', $package_root->get_error_message(), $started, $domain );
			return;
		}

		$target        = Webino_Dashboard_Module_Registry::module_dir( $slug );
		$was_installed = Webino_Dashboard_Module_Registry::is_installed( $slug ) && is_dir( $target );
		$backup_dir    = '';
		if ( $was_installed ) {
			$backup = Webino_Dashboard_Module_Registry::backup_module_dir( $slug );
			if ( is_wp_error( $backup ) ) {
				self::rrmdir( $staging );
				self::fail( $job_id, 'backup', $backup->get_error_message(), $started, $domain );
				return;
			}
			$backup_dir = (string) $backup;
		}
		if ( ! wp_mkdir_p( dirname( $target ) ) ) {
			self::rrmdir( $staging );
			self::fail( $job_id, 'prepare_dir', __( 'Could not create marketplace directory.', 'webino-dashboard' ), $started, $domain );
			return;
		}
		if ( is_dir( $target ) ) {
			Webino_Dashboard_REST_Marketplace::rrmdir( $target );
		}
		$copied = self::copy_tree( $package_root, $target );
		self::rrmdir( $staging );
		if ( is_wp_error( $copied ) ) {
			self::restore_failed_install( $slug, $backup_dir );
			self::fail( $job_id, 'prepare', $copied->get_error_message(), $started, $domain );
			return;
		}

		self::patch( $job_id, array( 'step' => 'validate' ) );

		$valid = Webino_Dashboard_Module_Registry::validate_installed_package( $slug );
		if ( is_wp_error( $valid ) ) {
			self::restore_failed_install( $slug, $backup_dir );
			self::fail( $job_id, 'validate', $valid->get_error_message(), $started, $domain );
			return;
		}

		$manifest = Webino_Dashboard_Module_Registry::get_manifest( $slug );
		if ( ! is_array( $manifest ) || ! Webino_Dashboard_Module_Registry::module_package_is_complete( $slug, $manifest ) ) {
			self::restore_failed_install( $slug, $backup_dir );
			self::fail(
				$job_id,
				'validate',
				__( 'Module package is incomplete. Reinstall from the marketplace.', 'webino-dashboard' ),
				$started,
				$domain
			);
			return;
		}

		$deps = Webino_Dashboard_Module_Registry::validate_module_dependencies( $slug, $manifest );
		if ( is_wp_error( $deps ) ) {
			self::restore_failed_install( $slug, $backup_dir );
			self::fail( $job_id, 'validate', $deps->get_error_message(), $started, $domain );
			return;
		}

		Webino_Dashboard_Module_Registry::apply_catalog_parent_to_manifest( $slug, $module );
		$install_version = '' !== $version
			? $version
			: (string) ( $manifest['version'] ?? $module['version'] ?? '1.0.0' );
		Webino_Dashboard_Module_Registry::mark_installed( $slug, $install_version );
		delete_transient( Webino_Dashboard_REST_Marketplace::catalog_cache_key() );
		self::clear_slug_lock( $slug );

		self::patch(
			$job_id,
			array(
				'status'          => 'success',
				'step'            => 'done',
				'ok'              => true,
				'install_version' => $install_version,
				'message'         => '',
				'error'           => '',
				'finished_at'     => gmdate( 'c' ),
				'debug'           => array(
					'step'           => 'done',
					'crm_elapsed_ms' => (int) round( ( microtime( true ) - $started ) * 1000 ),
					'domain'         => $domain,
					'distribution'   => 'git',
				),
			)
		);
	}

	/**
	 * @return bool
	 */
	private static function git_is_available() {
		if ( ! function_exists( 'proc_open' ) ) {
			return false;
		}
		$descriptors = array(
			0 => array( 'pipe', 'r' ),
			1 => array( 'pipe', 'w' ),
			2 => array( 'pipe', 'w' ),
		);
		$proc = @proc_open( 'git --version', $descriptors, $pipes, null, self::git_env() ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
		if ( ! is_resource( $proc ) ) {
			return false;
		}
		fclose( $pipes[0] );
		$out = stream_get_contents( $pipes[1] );
		fclose( $pipes[1] );
		fclose( $pipes[2] );
		$code = proc_close( $proc );
		return 0 === (int) $code && is_string( $out ) && false !== stripos( $out, 'git version' );
	}

	/**
	 * @return array<string,string>
	 */
	private static function git_env() {
		$path = getenv( 'PATH' ) ? (string) getenv( 'PATH' ) : '/usr/local/bin:/usr/bin:/bin';
		return array(
			'PATH'           => $path,
			'HOME'           => getenv( 'HOME' ) ? (string) getenv( 'HOME' ) : '/tmp',
			'GIT_TERMINAL_PROMPT' => '0',
			'GIT_ASKPASS'    => 'echo',
			'LC_ALL'         => 'C',
		);
	}

	/**
	 * @param string $clone_url Clone URL.
	 * @param string $dest      Destination directory (created by git).
	 * @param string $version   Optional tag/branch.
	 * @return true|WP_Error
	 */
	private static function git_clone_to( $clone_url, $dest, $version = '' ) {
		$dest = untrailingslashit( (string) $dest );
		if ( is_dir( $dest ) ) {
			self::rrmdir( $dest );
		}
		$parent = dirname( $dest );
		if ( ! wp_mkdir_p( $parent ) ) {
			return new WP_Error( 'git_clone', __( 'Could not create staging directory.', 'webino-dashboard' ) );
		}

		$cmd = 'git clone --depth 1';
		if ( '' !== $version ) {
			$cmd .= ' --branch ' . escapeshellarg( sanitize_text_field( $version ) );
		}
		$cmd .= ' ' . escapeshellarg( (string) $clone_url ) . ' ' . escapeshellarg( $dest );

		$result = self::run_shell( $cmd, $parent );
		if ( ! $result['ok'] ) {
			$msg = trim( (string) $result['output'] );
			if ( '' === $msg ) {
				$msg = __( 'git clone failed.', 'webino-dashboard' );
			}
			// Never echo credentials from clone URL in error text.
			if ( class_exists( 'Webino_Dashboard_Remote_Url', false ) ) {
				$msg = str_replace( (string) $clone_url, Webino_Dashboard_Remote_Url::redact_url( $clone_url ), $msg );
			}
			return new WP_Error( 'git_clone', $msg );
		}
		return true;
	}

	/**
	 * @param string $command Command.
	 * @param string $cwd     Working directory.
	 * @return array{ok:bool,exit_code:int,output:string}
	 */
	private static function run_shell( $command, $cwd ) {
		$descriptors = array(
			0 => array( 'pipe', 'r' ),
			1 => array( 'pipe', 'w' ),
			2 => array( 'pipe', 'w' ),
		);
		$proc = @proc_open( $command, $descriptors, $pipes, $cwd, self::git_env() ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
		if ( ! is_resource( $proc ) ) {
			return array(
				'ok'        => false,
				'exit_code' => 1,
				'output'    => 'proc_open failed',
			);
		}
		fclose( $pipes[0] );
		$stdout = stream_get_contents( $pipes[1] );
		$stderr = stream_get_contents( $pipes[2] );
		fclose( $pipes[1] );
		fclose( $pipes[2] );
		$code = proc_close( $proc );
		$out  = trim( (string) $stdout . "\n" . (string) $stderr );
		return array(
			'ok'        => 0 === (int) $code,
			'exit_code' => (int) $code,
			'output'    => $out,
		);
	}

	/**
	 * @param string $staging Staging clone root.
	 * @param string $slug    Module slug.
	 * @return string|WP_Error Absolute path with trailing slash.
	 */
	private static function locate_module_package_root( $staging, $slug ) {
		$staging = trailingslashit( (string) $staging );
		$slug    = sanitize_key( (string) $slug );
		$candidates = array(
			$staging,
			$staging . $slug . '/',
			$staging . 'Modules/' . $slug . '/',
		);
		foreach ( $candidates as $dir ) {
			if ( is_readable( $dir . 'module.json' ) || is_readable( $dir . 'manifest.json' ) ) {
				return trailingslashit( $dir );
			}
		}
		// Flatten single root folder then retry.
		Webino_Dashboard_REST_Marketplace::flatten_single_root_folder( untrailingslashit( $staging ) );
		foreach ( array( $staging, $staging . $slug . '/' ) as $dir ) {
			if ( is_readable( $dir . 'module.json' ) || is_readable( $dir . 'manifest.json' ) ) {
				return trailingslashit( $dir );
			}
		}
		return new WP_Error(
			'invalid_package',
			__( 'Cloned repository does not contain a valid module package (module.json).', 'webino-dashboard' )
		);
	}

	/**
	 * @param string $src  Source directory.
	 * @param string $dest Destination directory.
	 * @return true|WP_Error
	 */
	private static function copy_tree( $src, $dest ) {
		$src  = trailingslashit( (string) $src );
		$dest = trailingslashit( (string) $dest );
		if ( ! is_dir( $src ) ) {
			return new WP_Error( 'copy', __( 'Source directory is missing.', 'webino-dashboard' ) );
		}
		wp_mkdir_p( $dest );
		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $src, RecursiveDirectoryIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::SELF_FIRST
		);
		foreach ( $iterator as $item ) {
			$rel = substr( $item->getPathname(), strlen( $src ) );
			$rel = ltrim( str_replace( '\\', '/', (string) $rel ), '/' );
			if ( '' === $rel || 0 === strpos( $rel, '.git/' ) || '.git' === $rel ) {
				continue;
			}
			$target = $dest . $rel;
			if ( $item->isDir() ) {
				wp_mkdir_p( $target );
			} else {
				wp_mkdir_p( dirname( $target ) );
				if ( ! copy( $item->getPathname(), $target ) ) {
					return new WP_Error( 'copy', __( 'Failed to copy module files.', 'webino-dashboard' ) );
				}
			}
		}
		return true;
	}

	/**
	 * @param string $dir Directory.
	 * @return void
	 */
	private static function rrmdir( $dir ) {
		$dir = (string) $dir;
		if ( '' === $dir || ! is_dir( $dir ) ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_REST_Marketplace', false ) ) {
			Webino_Dashboard_REST_Marketplace::rrmdir( $dir );
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

	/**
	 * @param string $job_id  Job id.
	 * @param string $step    Step id.
	 * @param string $message Error message.
	 * @param float  $started microtime(true).
	 * @param string              $domain      Site domain.
	 * @param array<string,mixed> $extra_debug Optional debug fields (e.g. CRM response).
	 * @return void
	 */
	private static function fail( $job_id, $step, $message, $started = 0, $domain = '', array $extra_debug = array() ) {
		if ( 0.0 === (float) $started ) {
			$started = microtime( true );
		}
		if ( '' === $domain ) {
			$domain = Webino_Dashboard_License::instance()->get_current_domain();
		}
		$state = self::get( $job_id );
		$slug  = is_array( $state ) ? sanitize_key( (string) ( $state['slug'] ?? '' ) ) : '';
		$reinstall = is_array( $state ) && ! empty( $state['reinstall'] );
		if ( '' !== $slug ) {
			self::clear_slug_lock( $slug );
			if ( ! $reinstall && ! Webino_Dashboard_Module_Registry::is_installed( $slug ) ) {
				Webino_Dashboard_Module_Registry::remove_module_dir( $slug );
				Webino_Dashboard_Module_Registry::mark_uninstalled( $slug );
			}
		}
		$debug = array_merge(
			array(
				'step'           => (string) $step,
				'crm_elapsed_ms' => (int) round( ( microtime( true ) - $started ) * 1000 ),
				'domain'         => (string) $domain,
			),
			$extra_debug
		);
		self::patch(
			$job_id,
			array(
				'status'      => 'failed',
				'step'        => (string) $step,
				'message'     => (string) $message,
				'error'       => (string) $message,
				'ok'          => false,
				'finished_at' => gmdate( 'c' ),
				'debug'       => $debug,
			)
		);
	}

	/**
	 * @param array{ ok?: bool, data?: mixed, error?: string } $grant CRM response.
	 * @return array<string,mixed>
	 */
	private static function crm_grant_debug( array $grant ) {
		$data = is_array( $grant['data'] ?? null ) ? $grant['data'] : array();
		$dbg  = isset( $data['debug'] ) && is_array( $data['debug'] ) ? $data['debug'] : array();
		return $dbg;
	}

	/**
	 * @param string              $job_id Job id.
	 * @param array<string,mixed> $state  Job state.
	 * @return void
	 */
	private static function save( $job_id, array $state ) {
		set_transient( self::transient_key( $job_id ), $state, self::TTL );
	}

	/**
	 * @param string $job_id Job id.
	 * @return string
	 */
	private static function transient_key( $job_id ) {
		return self::TRANSIENT_PREFIX . sanitize_key( (string) $job_id );
	}

	/**
	 * @param string $slug Module slug.
	 * @return string
	 */
	private static function slug_lock_key( $slug ) {
		return self::SLUG_LOCK_PREFIX . sanitize_key( (string) $slug );
	}

	/**
	 * @param string $slug Module slug.
	 * @return void
	 */
	private static function set_slug_lock( $slug ) {
		set_transient( self::slug_lock_key( $slug ), '1', self::TTL );
	}

	/**
	 * @param string $slug Module slug.
	 * @return void
	 */
	private static function clear_slug_lock( $slug ) {
		delete_transient( self::slug_lock_key( sanitize_key( (string) $slug ) ) );
	}

	/**
	 * @param string $slug       Module slug.
	 * @param string $backup_dir Backup path or empty.
	 * @return void
	 */
	private static function restore_failed_install( $slug, $backup_dir ) {
		$slug = sanitize_key( (string) $slug );
		Webino_Dashboard_Module_Registry::remove_module_dir( $slug );
		if ( '' !== $backup_dir ) {
			Webino_Dashboard_Module_Registry::restore_module_dir_from_backup( $slug, $backup_dir );
		}
	}

	/**
	 * @param string $job_id Job id.
	 * @return bool
	 */
	private static function acquire_run_lock( $job_id ) {
		$key = self::LOCK_PREFIX . sanitize_key( (string) $job_id );
		if ( get_transient( $key ) ) {
			return false;
		}
		set_transient( $key, '1', self::RUN_LOCK_TTL );
		return true;
	}

	/**
	 * @param string $job_id Job id.
	 * @return void
	 */
	private static function release_run_lock( $job_id ) {
		delete_transient( self::LOCK_PREFIX . sanitize_key( (string) $job_id ) );
	}

	/**
	 * @param string $job_id         Job id.
	 * @param string $internal_token Internal auth token.
	 * @return array<int,string> Dispatch method ids.
	 */
	private static function dispatch_worker( $job_id, $internal_token ) {
		$methods = array();

		if ( self::schedule_run_after_response( $job_id ) ) {
			$methods[] = 'shutdown';
		}
		if ( self::schedule_cron( $job_id ) ) {
			$methods[] = 'cron';
		}
		if ( self::spawn_background_worker( $job_id ) ) {
			$methods[] = 'cli';
		} elseif ( self::dispatch_loopback( $job_id, $internal_token ) ) {
			$methods[] = 'loopback';
		}

		return $methods;
	}

	/**
	 * @param string $job_id Job id.
	 * @return bool
	 */
	private static function schedule_run_after_response( $job_id ) {
		static $scheduled = array();

		$job_id = sanitize_key( (string) $job_id );
		if ( '' === $job_id || isset( $scheduled[ $job_id ] ) ) {
			return '' !== $job_id;
		}
		$scheduled[ $job_id ] = true;

		add_action(
			'shutdown',
			static function () use ( $job_id ) {
				if ( function_exists( 'fastcgi_finish_request' ) ) {
					fastcgi_finish_request();
				}
				self::run( $job_id );
			},
			9999
		);

		return true;
	}

	/**
	 * @param string $job_id Job id.
	 * @return bool
	 */
	private static function schedule_cron( $job_id ) {
		$job_id = sanitize_key( (string) $job_id );
		if ( '' === $job_id ) {
			return false;
		}

		$args      = array( $job_id );
		$timestamp = wp_next_scheduled( self::CRON_HOOK, $args );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, self::CRON_HOOK, $args );
		}
		wp_schedule_single_event( time() + 2, self::CRON_HOOK, $args );

		if ( ! wp_doing_cron() ) {
			spawn_cron();
			$cron_url = site_url( 'wp-cron.php' );
			if ( $cron_url ) {
				wp_remote_post(
					$cron_url,
					array(
						'timeout'   => 0.01,
						'blocking'  => false,
						'sslverify' => apply_filters( 'https_local_ssl_verify', false ),
					)
				);
			}
		}

		return true;
	}

	/**
	 * @param string $job_id Job id.
	 * @return bool
	 */
	private static function spawn_background_worker( $job_id ) {
		$worker = WEBINO_DASHBOARD_DIR . 'includes/marketplace-install-worker.php';
		if ( ! is_readable( $worker ) ) {
			return false;
		}
		$state = self::get( $job_id );
		$token = is_array( $state ) ? (string) ( $state['internal_token'] ?? '' ) : '';
		if ( '' === $token ) {
			return false;
		}
		$php = defined( 'PHP_BINARY' ) && PHP_BINARY ? PHP_BINARY : 'php';
		$cmd = escapeshellcmd( $php ) . ' ' . escapeshellarg( $worker ) . ' ' . escapeshellarg( sanitize_key( (string) $job_id ) ) . ' ' . escapeshellarg( $token );
		if ( strtoupper( substr( PHP_OS, 0, 3 ) ) !== 'WIN' ) {
			$cmd .= ' > /dev/null 2>&1 &';
		}
		if ( function_exists( 'proc_open' ) ) {
			$proc = @proc_open( $cmd, array(), $pipes );
			if ( is_resource( $proc ) ) {
				return true;
			}
		}
		if ( function_exists( 'exec' ) ) {
			exec( $cmd ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.system_calls_exec
			return true;
		}
		return false;
	}

	/**
	 * @param string $job_id         Job id.
	 * @param string $internal_token Internal auth token.
	 * @return bool
	 */
	private static function dispatch_loopback( $job_id, $internal_token ) {
		$url      = rest_url( 'webino-dashboard/v1/marketplace/install-job/' . rawurlencode( sanitize_key( (string) $job_id ) ) . '/run' );
		$response = wp_remote_post(
			$url,
			array(
				'timeout'   => 0.01,
				'blocking'  => false,
				'headers'   => array(
					'Content-Type'      => 'application/json',
					'X-Webino-Internal' => $internal_token,
				),
				'body'      => '{}',
				'sslverify' => apply_filters( 'https_local_ssl_verify', false ),
			)
		);
		return ! is_wp_error( $response );
	}
}
