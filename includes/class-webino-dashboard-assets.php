<?php
/**
 * Enqueue dashboard SPA assets only on /dashboard.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Asset registration for Vite build output.
 */
class Webino_Dashboard_Assets {

	/**
	 * True when Vite entry JS is missing on disk (enqueue aborted).
	 *
	 * @var bool
	 */
	private static $build_missing = false;

	/**
	 * Resolved entry paths after render_entry_tags() (used by enqueue).
	 *
	 * @var array{js: string, css: string, js_path: string, css_path: string}|null
	 */
	private static $resolved_snapshot = null;

	/**
	 * @var bool
	 */
	private static $entry_tags_printed = false;

	/**
	 * Stashed runtime config for head inline print (module script runs before footer localize).
	 *
	 * @var array<string,mixed>|null
	 */
	private static $runtime_config_snapshot = null;

	/**
	 * @return bool
	 */
	public static function is_build_missing() {
		return self::$build_missing;
	}

	/**
	 * Cache-bust token for shell / service worker (plugin version + build-entry fingerprint).
	 *
	 * @return string
	 */
	public static function get_deploy_asset_version() {
		$build_dir = WEBINO_DASHBOARD_DIR . 'assets/dashboard-build/';
		$entry     = $build_dir . 'build-entry.json';
		$fp        = '';
		if ( is_readable( $entry ) ) {
			$raw = file_get_contents( $entry );
			if ( is_string( $raw ) && '' !== $raw ) {
				$fp = substr( md5( $raw ), 0, 8 );
			}
		}
		if ( '' === $fp ) {
			$resolved = self::resolve_entry_assets( $build_dir );
			if ( null !== $resolved ) {
				$version = is_readable( $resolved['js_path'] ) ? (int) filemtime( $resolved['js_path'] ) : 0;
				if ( '' !== $resolved['css_path'] && is_readable( $resolved['css_path'] ) ) {
					$version = max( $version, (int) filemtime( $resolved['css_path'] ) );
				}
				$fp = (string) max( 1, $version );
			}
		}
		return WEBINO_DASHBOARD_VERSION . ( '' !== $fp ? '-' . $fp : '' );
	}

	/**
	 * Delete hashed entry/shell leftovers that are not listed in build-entry.json.
	 *
	 * @return int Number of files removed.
	 */
	public static function purge_stale_build_assets() {
		$build_dir = WEBINO_DASHBOARD_DIR . 'assets/dashboard-build/';
		$assets    = $build_dir . 'assets/';
		if ( ! is_dir( $assets ) ) {
			return 0;
		}

		$keep = array();
		$path = $build_dir . 'build-entry.json';
		if ( is_readable( $path ) ) {
			$data = json_decode( (string) file_get_contents( $path ), true );
			if ( is_array( $data ) ) {
				foreach ( array( 'js', 'css', 'shared' ) as $key ) {
					if ( empty( $data[ $key ] ) || ! is_string( $data[ $key ] ) ) {
						continue;
					}
					$rel = ltrim( $data[ $key ], '/' );
					if ( 0 === strpos( $rel, 'assets/' ) ) {
						$keep[ basename( $rel ) ] = true;
					}
				}
			}
		}
		if ( empty( $keep ) ) {
			return 0;
		}

		$removed = 0;
		$patterns = array(
			$assets . 'index-*.js',
			$assets . 'index-*.css',
			$assets . 'dashboard-shell-*.js',
			$assets . 'dashboard-shared-*.js',
		);
		foreach ( $patterns as $pattern ) {
			$files = glob( $pattern );
			if ( ! is_array( $files ) ) {
				continue;
			}
			foreach ( $files as $file ) {
				$base = basename( $file );
				if ( isset( $keep[ $base ] ) ) {
					continue;
				}
				if ( is_file( $file ) && @unlink( $file ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
					++$removed;
				}
			}
		}
		return $removed;
	}

	/**
	 * @param string $url Absolute asset URL.
	 * @return array{ok: bool, status: int, content_type: string|null}
	 */
	private static function probe_asset_http( $url ) {
		$res = wp_remote_head(
			$url,
			array(
				'timeout'   => 8,
				'sslverify' => true,
			)
		);
		if ( is_wp_error( $res ) ) {
			return array(
				'ok'           => false,
				'status'       => 0,
				'content_type' => $res->get_error_message(),
			);
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		$type = wp_remote_retrieve_header( $res, 'content-type' );
		return array(
			'ok'           => $code >= 200 && $code < 400,
			'status'       => $code,
			'content_type' => is_string( $type ) ? $type : null,
		);
	}

	/**
	 * Visible notice when the SPA build was not deployed.
	 *
	 * @return void
	 */
	public static function render_build_missing_notice() {
		if ( ! self::$build_missing ) {
			return;
		}
		$msg = esc_html__( 'Dashboard build files are missing on the server.', 'webino-dashboard' );
		$hint = esc_html__( 'Upload assets/dashboard-build from: cd client && npm run build', 'webino-dashboard' );
		echo '<div id="wd-php-build-missing" role="alert" style="box-sizing:border-box;padding:1.5rem;font-family:system-ui,sans-serif;background:#fef2f2;color:#7f1d1d;min-height:50vh;">';
		echo '<p style="margin:0 0 0.5rem;font-size:1.125rem;font-weight:600;">' . $msg . '</p>';
		echo '<p style="margin:0;font-size:0.875rem;">' . $hint . '</p>';
		echo '</div>';
		echo '<script>try{var n=document.getElementById("wd-php-build-missing"),r=document.getElementById("root");if(n&&r){r.innerHTML=n.outerHTML;n.remove();}}catch(e){}</script>';
	}

	/**
	 * @return void
	 */
	public function __construct() {
		add_filter( 'script_loader_tag', array( $this, 'force_app_script_module' ), 10, 3 );
		add_action( 'template_redirect', array( $this, 'maybe_serve_admin_tools' ), 0 );
	}

	/**
	 * Admin JSON tools: ?wd_diag=1, ?wd_sniff=1, and repair ?wd_repair=1 on /dashboard.
	 *
	 * @return void
	 */
	public function maybe_serve_admin_tools() {
		if ( ! webino_dashboard()->rewrite->is_dashboard_request() ) {
			return;
		}

		$is_diag   = isset( $_GET['wd_diag'] ) && '1' === (string) wp_unslash( $_GET['wd_diag'] );
		$is_sniff  = isset( $_GET['wd_sniff'] ) && '1' === (string) wp_unslash( $_GET['wd_sniff'] );
		$is_repair = isset( $_GET['wd_repair'] ) && '1' === (string) wp_unslash( $_GET['wd_repair'] );
		if ( ! $is_diag && ! $is_sniff && ! $is_repair ) {
			return;
		}

		if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
			status_header( 403 );
			wp_die( esc_html__( 'Forbidden', 'webino-dashboard' ), '', array( 'response' => 403 ) );
		}

		if ( $is_repair ) {
			$this->run_dashboard_repair();
			return;
		}

		if ( $is_sniff ) {
			$this->send_html_sniff_json();
			return;
		}

		$this->send_deploy_diag_json();
	}

	/**
	 * One-click admin repair: flush bootstrap cache, clear false license nag, refresh rewrites.
	 *
	 * @return void
	 */
	private function run_dashboard_repair() {
		Webino_Dashboard_Plugin::run_dashboard_repair();
		wp_safe_redirect( Webino_Dashboard_Rewrite::url( '', array( 'repaired' => '1' ) ) );
		exit;
	}

	/**
	 * @return void
	 */
	private function send_deploy_diag_json() {

		$build_dir   = WEBINO_DASHBOARD_DIR . 'assets/dashboard-build/';
		$assets_php  = WEBINO_DASHBOARD_DIR . 'includes/class-webino-dashboard-assets.php';
		$resolved    = self::resolve_entry_assets( $build_dir );
		$opcache_on  = function_exists( 'opcache_get_status' );
		$opcache_ok  = false;
		if ( $opcache_on ) {
			$st = opcache_get_status( false );
			$opcache_ok = is_array( $st ) && ! empty( $st['opcache_enabled'] );
		}

		$build_url    = WEBINO_DASHBOARD_URL . 'assets/dashboard-build/';
		$legacy_js    = $build_dir . 'assets/index.js';
		$legacy_css   = $build_dir . 'assets/index.css';
		$expected_js  = null !== $resolved ? $build_url . $resolved['js'] : null;
		$expected_css = null !== $resolved && '' !== $resolved['css'] ? $build_url . $resolved['css'] : null;
		$shared_rel   = null !== $resolved ? self::resolve_shared_chunk_rel( $build_dir, $resolved ) : null;
		$expected_shared = null !== $shared_rel ? $build_url . $shared_rel : null;

		$asset_http = array();
		if ( null !== $expected_js ) {
			$asset_http['entry_js'] = self::probe_asset_http( $expected_js );
		}
		if ( null !== $expected_css ) {
			$asset_http['entry_css'] = self::probe_asset_http( $expected_css );
		}
		if ( null !== $expected_shared ) {
			$asset_http['shared_js'] = self::probe_asset_http( $expected_shared );
		}

		$payload = array(
			'plugin_version'          => WEBINO_DASHBOARD_VERSION,
			'plugin_dir'              => WEBINO_DASHBOARD_DIR,
			'plugin_url'              => WEBINO_DASHBOARD_URL,
			'php_file_mtime'          => is_readable( $assets_php ) ? (int) filemtime( $assets_php ) : 0,
			'build_dir_exists'        => is_dir( $build_dir ),
			'build_entry_json'        => is_readable( $build_dir . 'build-entry.json' ),
			'manifest_json'           => is_readable( $build_dir . 'manifest.json' ),
			'vite_manifest'           => is_readable( $build_dir . '.vite/manifest.json' ),
			'resolved_js'             => null !== $resolved ? $resolved['js'] : null,
			'resolved_css'            => null !== $resolved ? $resolved['css'] : null,
			'resolved_js_url'         => $expected_js,
			'expected_js_url'         => $expected_js,
			'expected_css_url'        => $expected_css,
			'expected_shared_url'     => $expected_shared,
			'legacy_index_js_on_disk' => is_readable( $legacy_js ),
			'legacy_index_css_on_disk'=> is_readable( $legacy_css ),
			'asset_http'              => $asset_http,
			'deploy_asset_version'    => self::get_deploy_asset_version(),
			'build_missing'           => self::$build_missing,
			'opcache'                 => $opcache_on ? ( $opcache_ok ? 'enabled' : 'disabled' ) : 'unavailable',
			'rewrite_version'         => (string) get_option( 'webino_dashboard_rewrite_version', '' ),
		);

		nocache_headers();
		header( 'Content-Type: application/json; charset=' . get_option( 'blog_charset' ), true );
		echo wp_json_encode( $payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
		exit;
	}

	/**
	 * HTML / cache sniff for admins (?wd_sniff=1).
	 *
	 * @return void
	 */
	private function send_html_sniff_json() {
		$build_dir = WEBINO_DASHBOARD_DIR . 'assets/dashboard-build/';
		$build_url = WEBINO_DASHBOARD_URL . 'assets/dashboard-build/';
		$resolved  = self::resolve_entry_assets( $build_dir );

		$legacy_js  = $build_dir . 'assets/index.js';
		$legacy_css = $build_dir . 'assets/index.css';
		$alias_js_ok  = false;
		$alias_css_ok = false;
		if ( null !== $resolved && is_readable( $legacy_js ) && is_readable( $resolved['js_path'] ) ) {
			$alias_js_ok = ( filesize( $legacy_js ) === filesize( $resolved['js_path'] ) )
				&& ( md5_file( $legacy_js ) === md5_file( $resolved['js_path'] ) );
		}
		if ( null !== $resolved && '' !== $resolved['css_path'] && is_readable( $legacy_css ) && is_readable( $resolved['css_path'] ) ) {
			$alias_css_ok = ( filesize( $legacy_css ) === filesize( $resolved['css_path'] ) )
				&& ( md5_file( $legacy_css ) === md5_file( $resolved['css_path'] ) );
		}

		$shell_js  = null !== $resolved ? $build_url . $resolved['js'] : null;
		$shell_css = null !== $resolved && '' !== $resolved['css'] ? $build_url . $resolved['css'] : null;
		$has_hashed = null !== $resolved && false !== strpos( $resolved['js'], 'index-' );

		$legacy_js_url  = $build_url . 'assets/index.js';
		$legacy_css_url = $build_url . 'assets/index.css';
		$asset_http     = array();
		if ( null !== $shell_js ) {
			$asset_http['shell_entry_js'] = self::probe_asset_http( $shell_js );
		}
		if ( null !== $shell_css ) {
			$asset_http['shell_entry_css'] = self::probe_asset_http( $shell_css );
		}
		$asset_http['compat_index_js']  = self::probe_asset_http( $legacy_js_url );
		$asset_http['compat_index_css'] = self::probe_asset_http( $legacy_css_url );

		$page_cache_hint = '';
		if ( $has_hashed && $alias_js_ok && $alias_css_ok ) {
			$page_cache_hint = 'PHP and compat aliases OK. If the browser still requests bare index.js/css, purge full-page cache for /dashboard (LiteSpeed, Cloudflare APO) and hard-refresh.';
		} elseif ( null === $resolved ) {
			$page_cache_hint = 'Build missing on disk.';
		}

		$payload = array(
			'plugin_version'             => WEBINO_DASHBOARD_VERSION,
			'shell_would_emit_js_url'    => $shell_js,
			'shell_would_emit_css_url'   => $shell_css,
			'has_hashed_entry_tag'       => $has_hashed,
			'has_legacy_index_js_on_disk'=> is_readable( $legacy_js ),
			'has_legacy_index_css_on_disk'=> is_readable( $legacy_css ),
			'compat_aliases_ok'          => $alias_js_ok && ( null === $resolved || '' === $resolved['css'] || $alias_css_ok ),
			'compat_alias_js_matches_entry' => $alias_js_ok,
			'compat_alias_css_matches_entry'=> $alias_css_ok,
			'asset_http'                 => $asset_http,
			'page_cache_hint'            => $page_cache_hint,
		);

		nocache_headers();
		header( 'Content-Type: application/json; charset=' . get_option( 'blog_charset' ), true );
		echo wp_json_encode( $payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
		exit;
	}

	/**
	 * Print hashed entry CSS/JS in the document head (before wp_head).
	 *
	 * @return void
	 */
	public static function render_entry_tags() {
		if ( self::$entry_tags_printed ) {
			return;
		}

		$build_dir = WEBINO_DASHBOARD_DIR . 'assets/dashboard-build/';
		$build_url = WEBINO_DASHBOARD_URL . 'assets/dashboard-build/';
		$resolved  = self::resolve_entry_assets( $build_dir );
		if ( null === $resolved ) {
			self::$build_missing = true;
			self::render_version_marker( null, null );
			return;
		}

		self::$resolved_snapshot  = $resolved;
		self::$entry_tags_printed = true;

		$entry_js      = $resolved['js_path'];
		$entry_css     = $resolved['css_path'];
		$entry_js_url  = $build_url . $resolved['js'];
		$entry_css_url = '' !== $resolved['css'] ? $build_url . $resolved['css'] : '';

		self::render_version_marker( $resolved['js'], $resolved['css'] );

		if ( '' !== $entry_css_url && is_readable( $entry_css ) ) {
			$ver = (string) filemtime( $entry_css );
			echo '<link rel="preload" as="style" href="' . esc_url( $entry_css_url ) . '?ver=' . esc_attr( $ver ) . '" />' . "\n";
			echo '<link rel="stylesheet" id="webino-dashboard-app-css" href="' . esc_url( $entry_css_url ) . '?ver=' . esc_attr( $ver ) . '" media="all" />' . "\n";
		}

		$href = esc_url( rest_url( 'webino-dashboard/v1/manifest.webmanifest' ) );
		echo '<link rel="manifest" href="' . $href . '" />' . "\n";

		// Config MUST precede the module entry — modules are deferred but must not race footer localize.
		self::print_runtime_config_script();

		// Import map MUST be registered before any modulepreload / type=module (bare "react" imports).
		$imports = self::print_shared_runtime_import_map( $build_dir, $build_url, $resolved );
		if ( empty( $imports['react'] ) ) {
			self::$build_missing = true;
			return;
		}
		self::$build_missing = false;

		$shared_rel = self::resolve_shared_chunk_rel( $build_dir, $resolved );
		if ( null !== $shared_rel ) {
			echo '<link rel="modulepreload" href="' . esc_url( $build_url . $shared_rel ) . '" crossorigin />' . "\n";
		}
		foreach ( array( 'react', 'react-dom', 'react-dom/client' ) as $spec ) {
			if ( isset( $imports[ $spec ] ) ) {
				echo '<link rel="modulepreload" href="' . esc_url( $imports[ $spec ] ) . '" crossorigin />' . "\n";
			}
		}

		if ( is_readable( $entry_js ) ) {
			$ver = (string) filemtime( $entry_js );
			echo '<link rel="modulepreload" href="' . esc_url( $entry_js_url ) . '?ver=' . esc_attr( $ver ) . '" crossorigin />' . "\n";
			echo '<script type="module" id="webino-dashboard-app-js" src="' . esc_url( $entry_js_url ) . '?ver=' . esc_attr( $ver ) . '"></script>' . "\n";
		}
	}

	/**
	 * Emit <script type="importmap"> so host SPA and dynamic module.js share one React/Query/i18n.
	 *
	 * @param string               $build_dir Absolute dashboard-build path (trailing slash).
	 * @param string               $build_url  URL to dashboard-build (trailing slash).
	 * @param array<string,mixed>  $resolved   Entry resolution payload.
	 * @return array<string,string> Absolute import URLs keyed by bare specifier (empty on failure).
	 */
	private static function print_shared_runtime_import_map( $build_dir, $build_url, $resolved ) {
		$packages = array();
		if ( isset( $resolved['importMap'] ) && is_array( $resolved['importMap'] ) ) {
			$packages = $resolved['importMap'];
		}
		if ( empty( $packages ) ) {
			$map_file = $build_dir . 'shared/import-map.json';
			if ( is_readable( $map_file ) ) {
				$raw = file_get_contents( $map_file );
				$data = is_string( $raw ) ? json_decode( $raw, true ) : null;
				if ( is_array( $data ) && isset( $data['packages'] ) && is_array( $data['packages'] ) ) {
					$packages = $data['packages'];
				}
			}
		}
		if ( empty( $packages ) ) {
			return array();
		}

		$imports = array();
		foreach ( $packages as $specifier => $rel ) {
			$specifier = (string) $specifier;
			$rel       = ltrim( (string) $rel, '/' );
			if ( '' === $specifier || '' === $rel ) {
				continue;
			}
			$abs = $build_dir . $rel;
			if ( ! is_readable( $abs ) ) {
				continue;
			}
			$ver                   = (string) filemtime( $abs );
			$imports[ $specifier ] = $build_url . $rel . '?ver=' . rawurlencode( $ver );
		}
		if ( empty( $imports ) || empty( $imports['react'] ) ) {
			return array();
		}

		$payload = wp_json_encode( array( 'imports' => $imports ) );
		if ( ! is_string( $payload ) || '' === $payload ) {
			return array();
		}
		echo '<script type="importmap" id="webino-dashboard-importmap">' . $payload . '</script>' . "\n";

		return $imports;
	}

	/**
	 * HTML comment in head so View Source shows active plugin + entry paths.
	 *
	 * @param string|null $js_rel Relative JS under dashboard-build.
	 * @param string|null $css_rel Relative CSS under dashboard-build.
	 * @return void
	 */
	private static function render_version_marker( $js_rel, $css_rel ) {
		$ver = WEBINO_DASHBOARD_VERSION;
		if ( null === $js_rel ) {
			echo '<!-- Webino Dashboard ' . esc_html( $ver ) . ' build=MISSING -->' . "\n";
			return;
		}
		$js  = esc_html( $js_rel );
		$css = $css_rel ? esc_html( $css_rel ) : 'none';
		echo '<!-- Webino Dashboard ' . esc_html( $ver ) . ' entry=' . $js . ' css=' . $css . ' -->' . "\n";
	}

	/**
	 * @param string $build_dir Absolute path to dashboard-build (trailing slash).
	 * @return array{js: string, css: string, js_path: string, css_path: string}|null
	 */
	private static function load_build_entry_json( $build_dir ) {
		$path = $build_dir . 'build-entry.json';
		if ( ! is_readable( $path ) ) {
			return null;
		}
		$raw = file_get_contents( $path );
		if ( false === $raw ) {
			return null;
		}
		$data = json_decode( $raw, true );
		if ( ! is_array( $data ) || empty( $data['js'] ) ) {
			return null;
		}
		$js_rel  = ltrim( (string) $data['js'], '/' );
		$js_path = $build_dir . $js_rel;
		if ( ! is_readable( $js_path ) ) {
			return null;
		}
		$css_rel  = '';
		$css_path = '';
		if ( ! empty( $data['css'] ) ) {
			$css_rel  = ltrim( (string) $data['css'], '/' );
			$css_path = $build_dir . $css_rel;
			if ( ! is_readable( $css_path ) ) {
				$css_rel  = '';
				$css_path = '';
			}
		}
		return array(
			'js'        => $js_rel,
			'css'       => $css_rel,
			'js_path'   => $js_path,
			'css_path'  => $css_path,
			'importMap' => isset( $data['importMap'] ) && is_array( $data['importMap'] ) ? $data['importMap'] : array(),
		);
	}

	/**
	 * When manifest / build-entry.json are missing (e.g. .vite not uploaded), match hashed files on disk.
	 *
	 * @param string $build_dir Absolute path to dashboard-build (trailing slash).
	 * @return array{js: string, css: string, js_path: string, css_path: string}|null
	 */
	private static function discover_hashed_entry_assets( $build_dir ) {
		$assets_dir = $build_dir . 'assets/';
		if ( ! is_dir( $assets_dir ) ) {
			return null;
		}

		$js_files = glob( $assets_dir . 'index-*.js' );
		if ( ! is_array( $js_files ) || empty( $js_files ) ) {
			return null;
		}

		$js_path = $js_files[0];
		if ( count( $js_files ) > 1 ) {
			usort(
				$js_files,
				static function ( $a, $b ) {
					return filemtime( $b ) <=> filemtime( $a );
				}
			);
			$js_path = $js_files[0];
		}

		$js_rel = 'assets/' . basename( $js_path );
		$css_rel  = '';
		$css_path = '';
		$css_files = glob( $assets_dir . 'index-*.css' );
		if ( is_array( $css_files ) && ! empty( $css_files ) ) {
			$css_path = $css_files[0];
			if ( count( $css_files ) > 1 ) {
				usort(
					$css_files,
					static function ( $a, $b ) {
						return filemtime( $b ) <=> filemtime( $a );
					}
				);
				$css_path = $css_files[0];
			}
			$css_rel = 'assets/' . basename( $css_path );
		}

		return array(
			'js'       => $js_rel,
			'css'      => $css_rel,
			'js_path'  => $js_path,
			'css_path' => $css_path,
		);
	}

	/**
	 * Resolve entry paths: build-entry.json → Vite manifest → glob hashed files.
	 *
	 * @param string $build_dir Absolute path to dashboard-build (trailing slash).
	 * @return array{js: string, css: string, js_path: string, css_path: string, manifest: array<string,mixed>|null, entry: array<string,mixed>|null}|null
	 */
	private static function resolve_entry_assets( $build_dir ) {
		$basic = self::load_build_entry_json( $build_dir );
		if ( null !== $basic ) {
			return array_merge(
				$basic,
				array(
					'manifest' => self::load_vite_manifest( $build_dir ),
					'entry'    => null,
				)
			);
		}

		$from_manifest = self::resolve_vite_entry_assets( $build_dir );
		if ( null !== $from_manifest ) {
			return $from_manifest;
		}

		$discovered = self::discover_hashed_entry_assets( $build_dir );
		if ( null === $discovered ) {
			return null;
		}

		return array_merge(
			$discovered,
			array(
				'manifest' => self::load_vite_manifest( $build_dir ),
				'entry'    => null,
			)
		);
	}

	private static function load_vite_manifest( $build_dir ) {
		$manifest_paths = array(
			$build_dir . 'manifest.json',
			$build_dir . '.vite/manifest.json',
		);

		foreach ( $manifest_paths as $path ) {
			if ( ! is_readable( $path ) ) {
				continue;
			}
			$raw = file_get_contents( $path );
			if ( false === $raw ) {
				continue;
			}
			$decoded = json_decode( $raw, true );
			if ( is_array( $decoded ) ) {
				return $decoded;
			}
		}

		return null;
	}

	/**
	 * Resolve hashed entry JS/CSS from the Vite build manifest.
	 *
	 * @param string $build_dir Absolute path to dashboard-build (trailing slash).
	 * @return array{js: string, css: string, js_path: string, css_path: string, manifest: array<string,mixed>, entry: array<string,mixed>}|null
	 */
	private static function resolve_vite_entry_assets( $build_dir ) {
		$manifest = self::load_vite_manifest( $build_dir );

		if ( null === $manifest ) {
			return null;
		}

		$entry = null;
		foreach ( array( 'index.html', 'src/main.tsx' ) as $key ) {
			if ( isset( $manifest[ $key ] ) && is_array( $manifest[ $key ] ) ) {
				$entry = $manifest[ $key ];
				break;
			}
		}

		if ( null === $entry && ! empty( $manifest ) ) {
			foreach ( $manifest as $item ) {
				if ( is_array( $item ) && ! empty( $item['isEntry'] ) ) {
					$entry = $item;
					break;
				}
			}
		}

		if ( null === $entry || empty( $entry['file'] ) ) {
			return null;
		}

		$js_rel  = ltrim( (string) $entry['file'], '/' );
		$js_path = $build_dir . $js_rel;
		if ( ! is_readable( $js_path ) ) {
			return null;
		}

		$css_rel  = '';
		$css_path = '';
		if ( ! empty( $entry['css'] ) && is_array( $entry['css'] ) ) {
			$css_rel = ltrim( (string) $entry['css'][0], '/' );
			$css_path = $build_dir . $css_rel;
			if ( ! is_readable( $css_path ) ) {
				$css_rel  = '';
				$css_path = '';
			}
		}

		return array(
			'js'       => $js_rel,
			'css'      => $css_rel,
			'js_path'  => $js_path,
			'css_path' => $css_path,
			'manifest' => $manifest,
			'entry'    => $entry,
		);
	}

	/**
	 * @param string              $build_dir Build directory (trailing slash).
	 * @param array<string,mixed> $resolved  Result from resolve_entry_assets().
	 * @return string|null Relative path under dashboard-build.
	 */
	private static function resolve_shared_chunk_rel( $build_dir, $resolved ) {
		$manifest = isset( $resolved['manifest'] ) && is_array( $resolved['manifest'] ) ? $resolved['manifest'] : null;
		$entry    = isset( $resolved['entry'] ) && is_array( $resolved['entry'] ) ? $resolved['entry'] : null;
		if ( null !== $manifest && null !== $entry ) {
			$rel = self::resolve_vite_shared_chunk_rel( $build_dir, $manifest, $entry );
			if ( null !== $rel ) {
				return $rel;
			}
		}

		$info_path = $build_dir . 'build-entry.json';
		if ( is_readable( $info_path ) ) {
			$data = json_decode( (string) file_get_contents( $info_path ), true );
			if ( is_array( $data ) && ! empty( $data['shared'] ) ) {
				$rel = ltrim( (string) $data['shared'], '/' );
				if ( is_readable( $build_dir . $rel ) ) {
					return $rel;
				}
			}
		}

		$matches = glob( $build_dir . 'assets/dashboard-shell-*.js' );
		if ( ! is_array( $matches ) || empty( $matches[0] ) ) {
			$matches = glob( $build_dir . 'assets/dashboard-shared-*.js' );
		}
		if ( is_array( $matches ) && ! empty( $matches ) ) {
			if ( count( $matches ) > 1 ) {
				usort(
					$matches,
					static function ( $a, $b ) {
						return filemtime( $b ) <=> filemtime( $a );
					}
				);
			}
			return 'assets/' . basename( $matches[0] );
		}

		return null;
	}

	/**
	 * @param string                   $build_dir Absolute build directory (trailing slash).
	 * @param array<string,mixed>      $manifest  Vite manifest.
	 * @param array<string,mixed>      $entry     Manifest entry chunk.
	 * @return string|null Relative JS path (e.g. assets/dashboard-shared-*.js).
	 */
	private static function resolve_vite_shared_chunk_rel( $build_dir, $manifest, $entry ) {
		if ( empty( $entry['imports'] ) || ! is_array( $entry['imports'] ) ) {
			return null;
		}

		foreach ( $entry['imports'] as $import_key ) {
			if (
				! is_string( $import_key )
				|| (
					false === strpos( $import_key, 'dashboard-shell' )
					&& false === strpos( $import_key, 'dashboard-shared' )
				)
			) {
				continue;
			}
			if ( empty( $manifest[ $import_key ] ) || ! is_array( $manifest[ $import_key ] ) ) {
				continue;
			}
			$chunk = $manifest[ $import_key ];
			if ( empty( $chunk['file'] ) ) {
				continue;
			}
			$rel = ltrim( (string) $chunk['file'], '/' );
			if ( is_readable( $build_dir . $rel ) ) {
				return $rel;
			}
		}

		return null;
	}

	/**
	 * @param int $user_id WordPress user ID.
	 * @return array<string,mixed>|null
	 */
	private static function get_cached_bootstrap( $user_id ) {
		if ( $user_id <= 0 ) {
			return null;
		}
		$cached = get_transient( 'webino_dashboard_boot_' . $user_id );
		return is_array( $cached ) ? $cached : null;
	}

	/**
	 * @param int                  $user_id WordPress user ID.
	 * @param array<string,mixed>  $data    Bootstrap payload.
	 * @return void
	 */
	private static function set_cached_bootstrap( $user_id, $data ) {
		if ( $user_id <= 0 || ! is_array( $data ) ) {
			return;
		}
		set_transient( 'webino_dashboard_boot_' . $user_id, $data, 90 );
	}

	/**
	 * Store bootstrap payload for embed in wp_head (short TTL).
	 *
	 * @param int                  $user_id User ID.
	 * @param array<string,mixed>  $data    Bootstrap payload.
	 * @return void
	 */
	public static function cache_bootstrap_payload( $user_id, $data ) {
		self::set_cached_bootstrap( $user_id, $data );
	}

	/**
	 * Vite outputs native ES modules (`import` / `import()`). Without `type="module"`,
	 * browsers parse the file as a classic script and throw — React never mounts (#root stays empty).
	 *
	 * @param string $tag    Full script element HTML.
	 * @param string $handle Registered script handle.
	 * @param string $src    Script URL (unused).
	 * @return string
	 */
	public function force_app_script_module( $tag, $handle, $src ) {
		if ( 'webino-dashboard-app' !== $handle ) {
			return $tag;
		}
		if ( preg_match( '/\btype\s*=\s*([\'"])module\1/i', $tag ) ) {
			return $tag;
		}
		// WordPress may emit type="text/javascript"; replace so `import` remains valid.
		$tag = preg_replace( '/\s+type\s*=\s*([\'"])text\/javascript\1/i', ' type=$1module$1', $tag, 1 );
		if ( preg_match( '/\btype\s*=\s*([\'"])module\1/i', $tag ) ) {
			return $tag;
		}
		return str_replace( '<script ', '<script type="module" ', $tag, 1 );
	}

	/**
	 * @return void
	 */
	public function enqueue() {
		$rewrite = webino_dashboard()->rewrite;
		if ( ! $rewrite->is_dashboard_request() ) {
			return;
		}

		$build_dir = WEBINO_DASHBOARD_DIR . 'assets/dashboard-build/';
		$build_url = WEBINO_DASHBOARD_URL . 'assets/dashboard-build/';

		$resolved = self::$resolved_snapshot ?? self::resolve_entry_assets( $build_dir );
		if ( null === $resolved ) {
			self::$build_missing = true;
			if ( ! self::$entry_tags_printed ) {
				add_action(
					'wp_head',
					static function () {
						self::render_version_marker( null, null );
					},
					1
				);
			}
			add_action(
				'wp_footer',
				static function () {
					echo '<script>console.warn("[Webino Dashboard] Build missing. Run: cd client && npm install && npm run build");</script>';
				},
				9999
			);
			return;
		}

		$entry_js  = $resolved['js_path'];
		$entry_css = $resolved['css_path'];

		$asset_version = is_readable( $entry_js ) ? (int) filemtime( $entry_js ) : 0;
		if ( is_readable( $entry_css ) ) {
			$asset_version = max( $asset_version, (int) filemtime( $entry_css ) );
		}

		wp_register_script( 'webino-dashboard-app', false, array(), WEBINO_DASHBOARD_VERSION, true );
		wp_enqueue_script( 'webino-dashboard-app' );

		$base   = Webino_Dashboard_Rewrite::url();
		$uid    = get_current_user_id();
		$locale = $uid ? (string) get_user_meta( $uid, 'webino_dashboard_locale', true ) : '';
		if ( '' === $locale ) {
			$locale = determine_locale();
		}

		$config = self::build_runtime_config( $uid, $locale, $base, $build_url, (string) max( 1, $asset_version ) );

		wp_localize_script( 'webino-dashboard-app', 'webinoDashboard', $config );

		// Also stash for head print (module script runs before footer localize).
		self::$runtime_config_snapshot = $config;
	}

	/**
	 * Build window.webinoDashboard payload (shared by localize + head inline).
	 *
	 * @param int    $uid           User ID.
	 * @param string $locale        Locale.
	 * @param string $base          Dashboard base URL.
	 * @param string $build_url     Asset base URL.
	 * @param string $asset_version Asset version string.
	 * @return array<string,mixed>
	 */
	public static function build_runtime_config( $uid, $locale, $base, $build_url, $asset_version ) {
		// Always embed bootstrap for logged-in users. Cold REST via WCDN often returns
		// 503/Unauthorized HTML → SPA stuck on LicenseGate skeleton forever.
		$bootstrap = null;
		if ( $uid > 0 && is_user_logged_in() ) {
			$bootstrap = self::get_or_build_bootstrap( $uid );
		}

		$page = null;
		if ( $uid > 0 && is_user_logged_in() && class_exists( 'Webino_Dashboard_SSR', false ) ) {
			$page = Webino_Dashboard_SSR::build_page_payload();
		}

		return array(
			'version'      => WEBINO_DASHBOARD_VERSION,
			'assetVersion' => $asset_version,
			'baseUrl'      => $base,
			'assetBase'    => $build_url,
			'homeUrl'      => home_url( '/' ),
			'restUrl'      => esc_url_raw( rest_url( 'webino-dashboard/v1/' ) ),
			'ajaxUrl'      => esc_url_raw( admin_url( 'admin-ajax.php' ) ),
			'nonce'        => wp_create_nonce( 'wp_rest' ),
			'loginNonce'   => wp_create_nonce( Webino_Dashboard_Rest_Base::login_nonce_action() ),
			'locale'       => $locale,
			'isLogged'     => is_user_logged_in(),
			'userId'       => $uid,
			'siteName'     => get_bloginfo( 'name' ),
			'siteIconUrl'  => Webino_Dashboard_REST::site_icon_url(),
			'license'      => Webino_Dashboard_License::instance()->get_bootstrap_payload(),
			'bootstrap'    => $bootstrap,
			'page'         => $page,
			'otpAuth'      => class_exists( 'Webino_Dashboard_Auth_Otp', false )
				? Webino_Dashboard_Auth_Otp::public_flags()
				: array(
					'login_enabled'    => false,
					'register_enabled' => false,
				),
			'marketplaceSettingsSections' => apply_filters( 'webino_dashboard_marketplace_settings_sections', array() ),
			'allowedRemoteHosts' => class_exists( 'Webino_Dashboard_Remote_Url', false ) ? Webino_Dashboard_Remote_Url::allowed_hosts() : array(),
			'flags'        => array(
				'woocommerce'            => class_exists( 'WooCommerce', false ),
				'wfcp'                   => class_exists( 'Webino_Dashboard_Module_Registry', false )
					? Webino_Dashboard_Module_Registry::wfcp_ready()
					: class_exists( 'WFCP_Helper', false ),
				'baleBot'                => Webino_Dashboard_REST::bot_ui_ready( 'bale' ),
				'telegramBot'            => Webino_Dashboard_REST::bot_ui_ready( 'telegram' ),
				'elementor'              => defined( 'ELEMENTOR_VERSION' ),
				'disableServiceWorker'   => true,
			),
		);
	}

	/**
	 * True when cached bootstrap still points at the legacy sibling Modules path,
	 * or clients are empty while readable module bundles exist on disk.
	 *
	 * @param array<string,mixed> $cached Bootstrap payload.
	 * @return bool
	 */
	private static function bootstrap_has_stale_module_entries( $cached ) {
		if ( ! empty( $cached['embedMinimal'] ) ) {
			return false;
		}

		$clients = isset( $cached['activeModuleClients'] ) && is_array( $cached['activeModuleClients'] )
			? $cached['activeModuleClients']
			: array();
		foreach ( $clients as $client ) {
			if ( ! is_array( $client ) ) {
				continue;
			}
			$entry = (string) ( $client['entry'] ?? '' );
			// Legacy path: wp-content/plugins/Modules/... (sibling of WebinaDashboard).
			if ( $entry && false !== strpos( $entry, '/plugins/Modules/' ) ) {
				return true;
			}
			// Pre-cache-bust entries (unhashed module.js was cached for a year by hosts).
			if ( $entry && false !== strpos( $entry, '/Modules/' ) && false === strpos( $entry, 'ver=' ) ) {
				return true;
			}
			$routes = isset( $client['routes'] ) && is_array( $client['routes'] ) ? $client['routes'] : array();
			foreach ( $routes as $route ) {
				$path = is_array( $route ) ? (string) ( $route['path'] ?? '' ) : '';
				if ( $path && false !== strpos( $path, '-module/' ) ) {
					return true;
				}
			}
		}
		if ( ! array_key_exists( 'activeModuleClients', $cached ) ) {
			return true;
		}
		if ( empty( $clients ) && class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& Webino_Dashboard_Module_Registry::disk_has_readable_module_clients() ) {
			return true;
		}
		return false;
	}

	/**
	 * Cached bootstrap or freshly built payload for SPA embed.
	 *
	 * @param int $user_id User ID.
	 * @return array<string,mixed>|null
	 */
	public static function get_or_build_bootstrap( $user_id ) {
		$cached = self::get_cached_bootstrap( $user_id );
		if ( is_array( $cached ) && ! empty( $cached['embedMinimal'] ) ) {
			delete_transient( 'webino_dashboard_boot_' . (int) $user_id );
			$cached = null;
		}
		$stale = is_array( $cached ) && self::bootstrap_has_stale_module_entries( $cached );
		if ( is_array( $cached ) && ! empty( $cached['modules'] ) && ! $stale ) {
			return $cached;
		}

		if ( $stale ) {
			delete_transient( 'webino_dashboard_boot_' . (int) $user_id );
			$cached = null;
		}

		if ( ! class_exists( 'Webino_Dashboard_REST', false ) ) {
			return is_array( $cached ) ? $cached : null;
		}

		try {
			$data = Webino_Dashboard_REST::bootstrap_embed_minimal();
		} catch ( Throwable $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[Webino Dashboard] bootstrap embed failed: ' . $e->getMessage() );
			return is_array( $cached ) ? $cached : null;
		}

		if ( is_array( $data ) && ! empty( $data['modules'] ) ) {
			// Minimal embed is first-paint only — full bootstrap from ajax REST caches clients.
			if ( empty( $data['embedMinimal'] ) ) {
				self::set_cached_bootstrap( $user_id, $data );
			}
			return $data;
		}

		return is_array( $cached ) ? $cached : null;
	}

	/**
	 * Print runtime config in document head before the ES module entry.
	 *
	 * @return void
	 */
	public static function print_runtime_config_script() {
		$config = self::$runtime_config_snapshot;
		if ( ! is_array( $config ) ) {
			$uid    = get_current_user_id();
			$locale = $uid ? (string) get_user_meta( $uid, 'webino_dashboard_locale', true ) : '';
			if ( '' === $locale ) {
				$locale = determine_locale();
			}
			$build_url = WEBINO_DASHBOARD_URL . 'assets/dashboard-build/';
			$ver       = self::get_deploy_asset_version();
			$config    = self::build_runtime_config(
				$uid,
				$locale,
				Webino_Dashboard_Rewrite::url(),
				$build_url,
				(string) max( 1, (int) $ver )
			);
			self::$runtime_config_snapshot = $config;
		}

		echo '<script id="webino-dashboard-config">window.webinoDashboard=' . wp_json_encode( $config ) . ';</script>' . "\n";
	}

	/**
	 * Reduce theme CSS/JS noise on the isolated dashboard route.
	 *
	 * @return void
	 */
	public function dequeue_theme_on_dashboard() {
		if ( ! webino_dashboard()->rewrite->is_dashboard_request() ) {
			return;
		}

		$keep = array( 'webino-dashboard-app' );

		global $wp_styles;
		if ( $wp_styles instanceof WP_Styles ) {
			$handles = array_unique( array_merge( $wp_styles->queue, array_keys( $wp_styles->registered ) ) );
			foreach ( $handles as $handle ) {
				if ( $this->should_keep_dashboard_asset_handle( $handle, $keep ) ) {
					continue;
				}
				wp_dequeue_style( $handle );
				wp_deregister_style( $handle );
			}
		}

		global $wp_scripts;
		if ( $wp_scripts instanceof WP_Scripts ) {
			$handles = array_unique( array_merge( $wp_scripts->queue, array_keys( $wp_scripts->registered ) ) );
			foreach ( $handles as $handle ) {
				if ( $this->should_keep_dashboard_asset_handle( $handle, $keep ) ) {
					continue;
				}
				wp_dequeue_script( $handle );
				wp_deregister_script( $handle );
			}
		}
	}

	/**
	 * @param string        $handle Asset handle.
	 * @param array<string> $keep   Handles to preserve.
	 * @return bool
	 */
	private function should_keep_dashboard_asset_handle( $handle, array $keep ) {
		if ( in_array( $handle, $keep, true ) ) {
			return true;
		}
		if ( 0 === strpos( $handle, 'webino-dashboard' ) ) {
			return true;
		}
		return false;
	}

}
