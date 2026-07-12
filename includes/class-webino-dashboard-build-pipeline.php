<?php
/**
 * Release build pipeline runner (modules + dashboard + verify + zip + smoke).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Executes whitelisted shell steps and persists progress for dashboard UI.
 */
final class Webino_Dashboard_Build_Pipeline {

	const LOCK_KEY   = 'webino_dashboard_build_pipeline_lock';
	const STATE_KEY  = 'webino_dashboard_build_pipeline_state';
	const LOG_MAX    = 120000;
	const STEP_TIMEOUT = 900;

	/**
	 * Pipeline steps in order.
	 *
	 * @return array<int,array<string,string>>
	 */
	public static function steps() {
		$root = trailingslashit( WEBINO_DASHBOARD_DIR );
		return array(
			array(
				'id'      => 'client_deps',
				'label'   => __( 'Install dashboard client dependencies', 'webino-dashboard' ),
				'command' => 'npm ci',
				'cwd'     => $root . 'client',
			),
			array(
				'id'      => 'dashboard_client',
				'label'   => __( 'Build dashboard client', 'webino-dashboard' ),
				'command' => 'npm run build',
				'cwd'     => $root . 'client',
			),
			array(
				'id'      => 'verify',
				'label'   => __( 'Verify dashboard build', 'webino-dashboard' ),
				'command' => 'bash ' . escapeshellarg( $root . 'scripts/verify-dashboard-build.sh' ),
				'cwd'     => $root,
			),
			array(
				'id'      => 'release_zip',
				'label'   => __( 'Create release ZIP', 'webino-dashboard' ),
				'command' => 'bash ' . escapeshellarg( $root . 'scripts/build-release-zip.sh' ),
				'cwd'     => $root,
			),
			array(
				'id'      => 'smoke',
				'label'   => __( 'Smoke test module structure', 'webino-dashboard' ),
				'command' => 'bash ' . escapeshellarg( $root . 'scripts/smoke-modules-structure.sh' ),
				'cwd'     => $root,
			),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function default_state() {
		return array(
			'status'        => 'idle',
			'current_step'  => '',
			'started_at'    => null,
			'finished_at'   => null,
			'exit_code'     => null,
			'artifact_path' => '',
			'error'         => '',
			'log'           => '',
			'steps_done'    => array(),
			'worker_token'  => '',
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_status() {
		$state = get_option( self::STATE_KEY, array() );
		if ( ! is_array( $state ) ) {
			$state = self::default_state();
		}
		return array_merge( self::default_state(), $state );
	}

	/**
	 * Whether the build pipeline may run on this host (dev/staging only).
	 *
	 * @return bool
	 */
	public static function is_dev_environment() {
		if ( defined( 'WEBINO_DASHBOARD_ALLOW_BUILD_PIPELINE' ) && WEBINO_DASHBOARD_ALLOW_BUILD_PIPELINE ) {
			return true;
		}
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			return true;
		}
		$host = isset( $_SERVER['HTTP_HOST'] ) ? strtolower( (string) wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '';
		if ( '' === $host ) {
			$host = strtolower( (string) wp_parse_url( home_url(), PHP_URL_HOST ) );
		}
		if ( '' === $host ) {
			return false;
		}
		$host = preg_replace( '/:\d+$/', '', $host );
		if ( in_array( $host, array( 'localhost', '127.0.0.1', '::1' ), true ) ) {
			return true;
		}
		return (bool) preg_match( '/\.(local|test)$/', $host );
	}

	/**
	 * Environment checks before starting.
	 *
	 * @return true|WP_Error
	 */
	public static function preflight() {
		if ( ! function_exists( 'proc_open' ) && ! function_exists( 'exec' ) ) {
			return new WP_Error(
				'build_no_exec',
				__( 'This server cannot run shell commands (proc_open/exec disabled).', 'webino-dashboard' ),
				array( 'status' => 500 )
			);
		}
		$client = trailingslashit( WEBINO_DASHBOARD_DIR ) . 'client';
		if ( ! is_dir( $client ) ) {
			return new WP_Error( 'build_no_client', __( 'Dashboard client directory is missing.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		if ( ! is_readable( $client . '/package.json' ) ) {
			return new WP_Error( 'build_no_client_pkg', __( 'Dashboard client package.json is missing.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		if ( ! is_readable( trailingslashit( WEBINO_DASHBOARD_DIR ) . 'scripts/verify-dashboard-build.sh' ) ) {
			return new WP_Error( 'build_no_scripts', __( 'Build scripts are missing from WebinoDashboard/scripts.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		return true;
	}

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function start() {
		if ( get_transient( self::LOCK_KEY ) ) {
			return new WP_Error( 'build_locked', __( 'A build pipeline is already running.', 'webino-dashboard' ), array( 'status' => 409 ) );
		}
		if ( ! self::is_dev_environment() ) {
			return new WP_Error(
				'build_dev_only',
				__( 'Release build pipeline is only available in development environments (WP_DEBUG, local host, or WEBINO_DASHBOARD_ALLOW_BUILD_PIPELINE).', 'webino-dashboard' ),
				array( 'status' => 403 )
			);
		}
		$check = self::preflight();
		if ( is_wp_error( $check ) ) {
			return $check;
		}

		$worker_token = wp_generate_password( 32, false, false );
		$state = array_merge(
			self::default_state(),
			array(
				'status'        => 'running',
				'current_step'  => 'starting',
				'started_at'    => gmdate( 'c' ),
				'finished_at'   => null,
				'exit_code'     => null,
				'artifact_path' => '',
				'error'         => '',
				'log'           => "== Build pipeline started ==\n",
				'steps_done'    => array(),
				'worker_token'  => $worker_token,
			)
		);
		update_option( self::STATE_KEY, $state, false );
		set_transient( self::LOCK_KEY, 1, 2 * HOUR_IN_SECONDS );

		$spawned = self::spawn_background_worker( $worker_token );
		if ( ! $spawned ) {
			delete_transient( self::LOCK_KEY );
			$state['status'] = 'failed';
			$state['error']    = __( 'Could not start background build worker.', 'webino-dashboard' );
			update_option( self::STATE_KEY, $state, false );
			return new WP_Error( 'build_spawn_failed', $state['error'], array( 'status' => 500 ) );
		}

		return self::get_status();
	}

	/**
	 * @param string $worker_token Expected worker token from pipeline state.
	 * @return bool
	 */
	public static function verify_worker_token( $worker_token ) {
		$state    = self::get_status();
		$expected = (string) ( $state['worker_token'] ?? '' );
		$token    = (string) $worker_token;
		return '' !== $expected && '' !== $token && hash_equals( $expected, $token );
	}

	/**
	 * @param string $worker_token Worker auth token.
	 * @return bool
	 */
	private static function spawn_background_worker( $worker_token ) {
		$worker = WEBINO_DASHBOARD_DIR . 'includes/build-pipeline-worker.php';
		if ( ! is_readable( $worker ) || '' === (string) $worker_token ) {
			return false;
		}
		$php = defined( 'PHP_BINARY' ) && PHP_BINARY ? PHP_BINARY : 'php';
		$cmd = escapeshellcmd( $php ) . ' ' . escapeshellarg( $worker ) . ' ' . escapeshellarg( (string) $worker_token );
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
	 * Run all pipeline steps (called from background worker).
	 *
	 * @return void
	 */
	public static function run_all_steps() {
		@set_time_limit( 0 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
		if ( ! get_transient( self::LOCK_KEY ) ) {
			set_transient( self::LOCK_KEY, 1, 2 * HOUR_IN_SECONDS );
		}

		$env = self::build_env();
		foreach ( self::steps() as $step ) {
			self::update_state(
				array(
					'status'       => 'running',
					'current_step' => $step['id'],
				)
			);
			self::append_log( "\n== {$step['label']} ==\n" );

			$result = self::run_command( $step['command'], $step['cwd'], $env );
			if ( ! $result['ok'] ) {
				self::finish_failed( $step['id'], $result['exit_code'], $result['output'] );
				return;
			}
			$state = self::get_status();
			$done  = is_array( $state['steps_done'] ) ? $state['steps_done'] : array();
			$done[] = $step['id'];
			self::update_state( array( 'steps_done' => $done ) );
		}

		$artifact = self::locate_release_zip();
		self::update_state(
			array(
				'status'        => 'success',
				'current_step'  => '',
				'finished_at'   => gmdate( 'c' ),
				'exit_code'     => 0,
				'artifact_path' => $artifact,
				'error'         => '',
			)
		);
		self::append_log( "\n== Build pipeline completed successfully ==\n" );
		if ( '' !== $artifact ) {
			self::append_log( 'Artifact: ' . $artifact . "\n" );
		}
		delete_transient( self::LOCK_KEY );
	}

	/**
	 * @return array<string,string>
	 */
	private static function build_env() {
		$root   = dirname( WEBINO_DASHBOARD_DIR );
		$client = trailingslashit( WEBINO_DASHBOARD_DIR ) . 'client';
		$path   = getenv( 'PATH' ) ? (string) getenv( 'PATH' ) : '/usr/local/bin:/usr/bin:/bin';
		return array(
			'PATH'      => $path,
			'HOME'      => getenv( 'HOME' ) ? (string) getenv( 'HOME' ) : '/tmp',
			'NODE_PATH' => $client . '/node_modules',
		);
	}

	/**
	 * @param string               $command Command.
	 * @param string               $cwd Working directory.
	 * @param array<string,string> $env Environment.
	 * @return array{ok:bool,exit_code:int,output:string}
	 */
	private static function run_command( $command, $cwd, array $env ) {
		$descriptors = array(
			0 => array( 'pipe', 'r' ),
			1 => array( 'pipe', 'w' ),
			2 => array( 'pipe', 'w' ),
		);
		$proc = @proc_open( $command, $descriptors, $pipes, $cwd, $env );
		if ( ! is_resource( $proc ) ) {
			return array(
				'ok'        => false,
				'exit_code' => 1,
				'output'    => 'proc_open failed',
			);
		}
		fclose( $pipes[0] );
		stream_set_blocking( $pipes[1], false );
		stream_set_blocking( $pipes[2], false );
		$output   = '';
		$start    = time();
		$timed_out = false;
		while ( true ) {
			$stdout = stream_get_contents( $pipes[1] );
			$stderr = stream_get_contents( $pipes[2] );
			if ( false !== $stdout && '' !== $stdout ) {
				$output .= $stdout;
				self::append_log( self::sanitize_log( $stdout ) );
			}
			if ( false !== $stderr && '' !== $stderr ) {
				$output .= $stderr;
				self::append_log( self::sanitize_log( $stderr ) );
			}
			$status = proc_get_status( $proc );
			if ( ! $status['running'] ) {
				break;
			}
			if ( ( time() - $start ) > self::STEP_TIMEOUT ) {
				$timed_out = true;
				proc_terminate( $proc );
				break;
			}
			usleep( 200000 );
		}
		fclose( $pipes[1] );
		fclose( $pipes[2] );
		$exit = proc_close( $proc );
		if ( $timed_out ) {
			return array(
				'ok'        => false,
				'exit_code' => 124,
				'output'    => $output . "\nStep timed out.",
			);
		}
		return array(
			'ok'        => 0 === $exit,
			'exit_code' => (int) $exit,
			'output'    => $output,
		);
	}

	/**
	 * @param string $step_id Step id.
	 * @param int    $exit_code Exit code.
	 * @param string $output Output snippet.
	 * @return void
	 */
	private static function finish_failed( $step_id, $exit_code, $output ) {
		$msg = sprintf(
			/* translators: 1: step id, 2: exit code */
			__( 'Step "%1$s" failed with exit code %2$d.', 'webino-dashboard' ),
			$step_id,
			(int) $exit_code
		);
		self::update_state(
			array(
				'status'       => 'failed',
				'current_step' => $step_id,
				'finished_at'  => gmdate( 'c' ),
				'exit_code'    => (int) $exit_code,
				'error'        => $msg,
			)
		);
		self::append_log( "\n== FAILED: {$msg} ==\n" );
		if ( '' !== $output ) {
			self::append_log( self::sanitize_log( $output ) );
		}
		delete_transient( self::LOCK_KEY );
	}

	/**
	 * @return string
	 */
	private static function locate_release_zip() {
		$dist = trailingslashit( WEBINO_DASHBOARD_DIR ) . 'dist/';
		if ( ! is_dir( $dist ) ) {
			return '';
		}
		$files = glob( $dist . 'webino-dashboard-*.zip' );
		if ( ! is_array( $files ) || empty( $files ) ) {
			return '';
		}
		usort(
			$files,
			static function ( $a, $b ) {
				return filemtime( $b ) - filemtime( $a );
			}
		);
		return (string) $files[0];
	}

	/**
	 * @param array<string,mixed> $patch Patch.
	 * @return void
	 */
	private static function update_state( array $patch ) {
		$state = self::get_status();
		update_option( self::STATE_KEY, array_merge( $state, $patch ), false );
	}

	/**
	 * @param string $chunk Log chunk.
	 * @return void
	 */
	private static function append_log( $chunk ) {
		$state = self::get_status();
		$log   = (string) ( $state['log'] ?? '' ) . self::sanitize_log( $chunk );
		if ( strlen( $log ) > self::LOG_MAX ) {
			$log = '…' . substr( $log, -self::LOG_MAX );
		}
		self::update_state( array( 'log' => $log ) );
	}

	/**
	 * @param string $text Raw log.
	 * @return string
	 */
	private static function sanitize_log( $text ) {
		$text = wp_strip_all_tags( $text );
		$text = preg_replace( '/(client_secret|password|authorization)\s*[:=]\s*\S+/i', '$1=***', $text );
		return is_string( $text ) ? $text : '';
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function cancel() {
		$state = self::get_status();
		if ( 'running' !== ( $state['status'] ?? '' ) ) {
			return $state;
		}
		delete_transient( self::LOCK_KEY );
		self::update_state(
			array(
				'status'      => 'failed',
				'finished_at' => gmdate( 'c' ),
				'error'       => __( 'Build cancelled by user (running process may still finish on server).', 'webino-dashboard' ),
			)
		);
		self::append_log( "\n== Build cancelled ==\n" );
		return self::get_status();
	}
}
