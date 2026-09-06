<?php
/**
 * Progressive Web App: settings, manifest, service worker, splash under /dashboard/.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Serves installable PWA assets with the correct scope (/dashboard/).
 */
final class Webino_Dashboard_PWA {

	const OPTION       = 'webino_dashboard_pwa';
	const MANIFEST_PATH = 'manifest.webmanifest';
	const SW_PATH       = 'sw.js';
	const SPLASH_PATH   = 'pwa-splash.png';

	/**
	 * Default site-level PWA settings (enabled by default).
	 *
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'enabled'             => true,
			'name'                => '',
			'short_name'          => '',
			'description'         => '',
			'theme_color'         => '#0f172a',
			'background_color'    => '#ffffff',
			'display'             => 'standalone',
			'orientation'         => 'any',
			'icon_source'         => 'site',
			'icon_id'             => 0,
			'show_install_banner' => true,
			'splash_enabled'      => true,
		);
	}

	/**
	 * Merged stored settings with defaults.
	 *
	 * @return array<string,mixed>
	 */
	public static function get_settings() {
		$stored = get_option( self::OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return self::sanitize_settings( array_merge( self::defaults(), $stored ) );
	}

	/**
	 * @param array<string,mixed> $input Raw settings.
	 * @return array<string,mixed>
	 */
	public static function sanitize_settings( $input ) {
		$defaults = self::defaults();
		if ( ! is_array( $input ) ) {
			return $defaults;
		}

		$display_ok = array( 'standalone', 'fullscreen', 'minimal-ui' );
		$orient_ok  = array( 'any', 'portrait', 'landscape' );
		$icon_ok    = array( 'site', 'custom' );

		$display = sanitize_key( (string) ( $input['display'] ?? $defaults['display'] ) );
		if ( ! in_array( $display, $display_ok, true ) ) {
			$display = $defaults['display'];
		}
		$orientation = sanitize_key( (string) ( $input['orientation'] ?? $defaults['orientation'] ) );
		if ( ! in_array( $orientation, $orient_ok, true ) ) {
			$orientation = $defaults['orientation'];
		}
		$icon_source = sanitize_key( (string) ( $input['icon_source'] ?? $defaults['icon_source'] ) );
		if ( ! in_array( $icon_source, $icon_ok, true ) ) {
			$icon_source = $defaults['icon_source'];
		}

		$icon_id = absint( $input['icon_id'] ?? 0 );
		if ( 'custom' === $icon_source && $icon_id > 0 && ! wp_attachment_is_image( $icon_id ) ) {
			$icon_id     = 0;
			$icon_source = 'site';
		}

		return array(
			'enabled'             => ! empty( $input['enabled'] ),
			'name'                => sanitize_text_field( (string) ( $input['name'] ?? '' ) ),
			'short_name'          => sanitize_text_field( (string) ( $input['short_name'] ?? '' ) ),
			'description'         => sanitize_text_field( (string) ( $input['description'] ?? '' ) ),
			'theme_color'         => self::sanitize_hex_color_value( (string) ( $input['theme_color'] ?? $defaults['theme_color'] ), $defaults['theme_color'] ),
			'background_color'    => self::sanitize_hex_color_value( (string) ( $input['background_color'] ?? $defaults['background_color'] ), $defaults['background_color'] ),
			'display'             => $display,
			'orientation'         => $orientation,
			'icon_source'         => $icon_source,
			'icon_id'             => $icon_id,
			'show_install_banner' => ! array_key_exists( 'show_install_banner', $input ) ? true : ! empty( $input['show_install_banner'] ),
			'splash_enabled'      => ! array_key_exists( 'splash_enabled', $input ) ? true : ! empty( $input['splash_enabled'] ),
		);
	}

	/**
	 * @param string $color   Candidate hex.
	 * @param string $fallback Fallback hex.
	 * @return string
	 */
	private static function sanitize_hex_color_value( $color, $fallback ) {
		$color = trim( $color );
		if ( function_exists( 'sanitize_hex_color' ) ) {
			$clean = sanitize_hex_color( $color );
			if ( is_string( $clean ) && '' !== $clean ) {
				return $clean;
			}
		}
		if ( preg_match( '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $color ) ) {
			return $color;
		}
		return $fallback;
	}

	/**
	 * @return bool
	 */
	public static function is_enabled() {
		$s = self::get_settings();
		return ! empty( $s['enabled'] );
	}

	/**
	 * Theme color for status bar / splash.
	 *
	 * @return string
	 */
	public static function theme_color() {
		$s = self::get_settings();
		return (string) $s['theme_color'];
	}

	/**
	 * Background color for splash.
	 *
	 * @return string
	 */
	public static function background_color() {
		$s = self::get_settings();
		return (string) $s['background_color'];
	}

	/**
	 * Full app name: custom or "Dashboard (Site Name)" / «داشبورد (نام سایت)».
	 *
	 * @return string
	 */
	public static function app_name() {
		$s = self::get_settings();
		if ( '' !== trim( (string) $s['name'] ) ) {
			return (string) $s['name'];
		}
		$site = get_bloginfo( 'name' );
		$locale = function_exists( 'determine_locale' ) ? determine_locale() : get_locale();
		$is_fa  = is_string( $locale ) && ( 0 === strpos( strtolower( $locale ), 'fa' ) );
		if ( '' !== $site ) {
			if ( $is_fa ) {
				return 'داشبورد (' . $site . ')';
			}
			/* translators: %s: site title */
			return sprintf( __( 'Dashboard (%s)', 'webino-dashboard' ), $site );
		}
		return $is_fa ? 'داشبورد' : __( 'Dashboard', 'webino-dashboard' );
	}

	/**
	 * Short name for home screen.
	 *
	 * @return string
	 */
	public static function short_name() {
		$s = self::get_settings();
		if ( '' !== trim( (string) $s['short_name'] ) ) {
			$short = (string) $s['short_name'];
		} else {
			$locale = function_exists( 'determine_locale' ) ? determine_locale() : get_locale();
			$is_fa  = is_string( $locale ) && ( 0 === strpos( strtolower( $locale ), 'fa' ) );
			$short  = $is_fa ? 'داشبورد' : __( 'Dashboard', 'webino-dashboard' );
		}
		if ( function_exists( 'mb_strlen' ) && mb_strlen( $short ) > 12 ) {
			return mb_substr( $short, 0, 12 );
		}
		if ( strlen( $short ) > 12 ) {
			return substr( $short, 0, 12 );
		}
		return $short;
	}

	/**
	 * @return string
	 */
	public static function app_description() {
		$s = self::get_settings();
		if ( '' !== trim( (string) $s['description'] ) ) {
			return (string) $s['description'];
		}
		$tag = get_bloginfo( 'description', 'display' );
		return is_string( $tag ) && '' !== $tag ? $tag : __( 'Store dashboard', 'webino-dashboard' );
	}

	/**
	 * Payload for settings UI (includes resolved preview fields).
	 *
	 * @return array<string,mixed>
	 */
	public static function settings_response() {
		$s = self::get_settings();
		return array_merge(
			$s,
			array(
				'resolved_name'       => self::app_name(),
				'resolved_short_name' => self::short_name(),
				'resolved_description'=> self::app_description(),
				'icon_url'            => self::icon_url( 192, 'any' ),
				'site_icon_url'       => get_site_icon_url( 192 ) ?: '',
				'custom_icon_url'     => ( ! empty( $s['icon_id'] ) ) ? (string) ( wp_get_attachment_image_url( (int) $s['icon_id'], 'full' ) ?: '' ) : '',
				'manifest_url'        => self::asset_url( self::MANIFEST_PATH ),
				'splash_url'          => self::asset_url( self::SPLASH_PATH ),
			)
		);
	}

	/**
	 * Whether the current dashboard path is a PWA static asset (no trailing slash).
	 *
	 * @param string|null $path Optional wd_path; defaults to query var.
	 * @return bool
	 */
	public static function is_pwa_asset_path( $path = null ) {
		if ( null === $path ) {
			$path = trim( (string) get_query_var( 'wd_path' ), '/' );
		} else {
			$path = trim( (string) $path, '/' );
		}
		return self::MANIFEST_PATH === $path
			|| self::SW_PATH === $path
			|| self::SPLASH_PATH === $path
			|| 0 === strpos( $path, 'pwa-splash' );
	}

	/**
	 * Absolute URL for PWA icon.
	 *
	 * @param int    $size Preferred size (192, 512, 180).
	 * @param string $purpose 'any' | 'maskable' | 'apple'.
	 * @return string
	 */
	public static function icon_url( $size, $purpose = 'any' ) {
		$size = (int) $size;
		$s    = self::get_settings();

		if ( 'custom' === $s['icon_source'] && ! empty( $s['icon_id'] ) ) {
			$url = wp_get_attachment_image_url( (int) $s['icon_id'], array( $size, $size ) );
			if ( ! $url ) {
				$url = wp_get_attachment_image_url( (int) $s['icon_id'], 'full' );
			}
			if ( is_string( $url ) && '' !== $url ) {
				return $url;
			}
		}

		if ( 'apple' === $purpose ) {
			$site = get_site_icon_url( 180 );
			if ( $site ) {
				return $site;
			}
			return plugins_url( 'assets/pwa/apple-touch-icon.png', WEBINO_DASHBOARD_FILE );
		}

		$site = get_site_icon_url( $size );
		if ( $site && 'maskable' !== $purpose ) {
			return $site;
		}
		// Prefer site icon even for maskable when available.
		if ( $site ) {
			return $site;
		}

		$file = 'maskable' === $purpose
			? sprintf( 'assets/pwa/icon-%d-maskable.png', $size )
			: sprintf( 'assets/pwa/icon-%d.png', $size );

		$path = WEBINO_DASHBOARD_DIR . $file;
		if ( is_readable( $path ) ) {
			return plugins_url( $file, WEBINO_DASHBOARD_FILE );
		}

		$fallback = WEBINO_DASHBOARD_DIR . sprintf( 'assets/pwa/icon-%d.png', $size );
		if ( is_readable( $fallback ) ) {
			return plugins_url( sprintf( 'assets/pwa/icon-%d.png', $size ), WEBINO_DASHBOARD_FILE );
		}

		return plugins_url( 'assets/dashboard-build/favicon.svg', WEBINO_DASHBOARD_FILE );
	}

	/**
	 * Web App Manifest payload.
	 *
	 * @return array<string,mixed>
	 */
	public static function manifest_body() {
		$s     = self::get_settings();
		$start = Webino_Dashboard_Rewrite::url();
		$locale = function_exists( 'determine_locale' ) ? determine_locale() : get_locale();
		$locale = is_string( $locale ) && '' !== $locale ? str_replace( '_', '-', $locale ) : 'en';
		$is_rtl = ( 0 === strpos( strtolower( $locale ), 'fa' ) ) || ( function_exists( 'is_rtl' ) && is_rtl() );

		$icons = array(
			array(
				'src'     => self::icon_url( 192, 'any' ),
				'sizes'   => '192x192',
				'type'    => 'image/png',
				'purpose' => 'any',
			),
			array(
				'src'     => self::icon_url( 512, 'any' ),
				'sizes'   => '512x512',
				'type'    => 'image/png',
				'purpose' => 'any',
			),
			array(
				'src'     => self::icon_url( 192, 'maskable' ),
				'sizes'   => '192x192',
				'type'    => 'image/png',
				'purpose' => 'maskable',
			),
			array(
				'src'     => self::icon_url( 512, 'maskable' ),
				'sizes'   => '512x512',
				'type'    => 'image/png',
				'purpose' => 'maskable',
			),
		);

		$body = array(
			'id'               => $start,
			'name'             => self::app_name(),
			'short_name'       => self::short_name(),
			'description'      => self::app_description(),
			'start_url'        => $start,
			'scope'            => $start,
			'display'          => (string) $s['display'],
			'display_override' => array( (string) $s['display'], 'browser' ),
			'background_color' => self::background_color(),
			'theme_color'      => self::theme_color(),
			'lang'             => $locale,
			'dir'              => $is_rtl ? 'rtl' : 'ltr',
			'icons'            => $icons,
		);

		if ( 'any' !== $s['orientation'] ) {
			$body['orientation'] = (string) $s['orientation'];
		}

		return $body;
	}

	/**
	 * Absolute dashboard-relative URL for PWA assets.
	 *
	 * @param string $asset Filename under /dashboard/.
	 * @return string
	 */
	public static function asset_url( $asset ) {
		$asset = ltrim( (string) $asset, '/' );
		return untrailingslashit( home_url( '/dashboard/' . $asset ) );
	}

	/**
	 * Pathname of the dashboard scope (for Service-Worker-Allowed header).
	 *
	 * @return string
	 */
	public static function scope_path() {
		$path = wp_parse_url( Webino_Dashboard_Rewrite::url(), PHP_URL_PATH );
		if ( ! is_string( $path ) || '' === $path ) {
			return '/dashboard/';
		}
		return trailingslashit( $path );
	}

	/**
	 * Common apple splash sizes (portrait).
	 *
	 * @return array<int,array{w:int,h:int}>
	 */
	public static function splash_sizes() {
		return array(
			array( 'w' => 1290, 'h' => 2796 ), // iPhone 15 Pro Max
			array( 'w' => 1179, 'h' => 2556 ), // iPhone 15 Pro
			array( 'w' => 1170, 'h' => 2532 ), // iPhone 14 / 13
			array( 'w' => 1125, 'h' => 2436 ), // iPhone X
			array( 'w' => 1242, 'h' => 2688 ), // iPhone XS Max
			array( 'w' => 828, 'h' => 1792 ),  // iPhone XR
			array( 'w' => 750, 'h' => 1334 ),  // iPhone 8
			array( 'w' => 2048, 'h' => 2732 ), // iPad Pro 12.9
			array( 'w' => 1668, 'h' => 2388 ), // iPad Pro 11
		);
	}

	/**
	 * Print apple-touch-startup-image link tags when splash enabled.
	 *
	 * @return void
	 */
	public static function print_splash_meta() {
		$s = self::get_settings();
		if ( empty( $s['enabled'] ) || empty( $s['splash_enabled'] ) ) {
			return;
		}
		$base = self::asset_url( self::SPLASH_PATH );
		foreach ( array_slice( self::splash_sizes(), 0, 5 ) as $size ) {
			$href = add_query_arg(
				array(
					'w' => (int) $size['w'],
					'h' => (int) $size['h'],
				),
				$base
			);
			echo '<link rel="apple-touch-startup-image" href="' . esc_url( $href ) . '" />' . "\n";
		}
	}

	/**
	 * Client bootstrap snippet for splash overlay / install banner.
	 *
	 * @return array<string,mixed>
	 */
	public static function client_bootstrap() {
		$s = self::get_settings();
		return array(
			'enabled'           => ! empty( $s['enabled'] ),
			'showInstallBanner' => ! empty( $s['enabled'] ) && ! empty( $s['show_install_banner'] ),
			'splashEnabled'     => ! empty( $s['enabled'] ) && ! empty( $s['splash_enabled'] ),
			'name'              => self::app_name(),
			'shortName'         => self::short_name(),
			'themeColor'        => self::theme_color(),
			'backgroundColor'   => self::background_color(),
			'iconUrl'           => self::icon_url( 192, 'any' ),
		);
	}

	/**
	 * Serve manifest, SW, or splash and exit when matched.
	 *
	 * @return void
	 */
	public static function maybe_serve() {
		if ( ! webino_dashboard()->rewrite->is_dashboard_request() ) {
			return;
		}
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return;
		}
		if ( wp_doing_ajax() || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
			return;
		}

		$path = trim( (string) get_query_var( 'wd_path' ), '/' );
		if ( self::MANIFEST_PATH === $path ) {
			self::serve_manifest();
		}
		if ( self::SW_PATH === $path ) {
			self::serve_service_worker();
		}
		if ( self::SPLASH_PATH === $path || 0 === strpos( $path, 'pwa-splash' ) ) {
			self::serve_splash();
		}
	}

	/**
	 * @return void
	 */
	private static function serve_manifest() {
		if ( ! self::is_enabled() ) {
			status_header( 404 );
			nocache_headers();
			exit;
		}
		$body = wp_json_encode( self::manifest_body(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		if ( ! is_string( $body ) ) {
			status_header( 500 );
			nocache_headers();
			exit;
		}

		status_header( 200 );
		header( 'Content-Type: application/manifest+json; charset=' . get_option( 'blog_charset' ), true );
		header( 'Cache-Control: no-cache, must-revalidate, max-age=0', true );
		header( 'X-Content-Type-Options: nosniff', true );
		echo $body; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON body.
		exit;
	}

	/**
	 * @return void
	 */
	private static function serve_service_worker() {
		if ( ! self::is_enabled() ) {
			status_header( 404 );
			nocache_headers();
			exit;
		}
		$candidates = array(
			WEBINO_DASHBOARD_DIR . 'assets/dashboard-build/dashboard-sw.js',
			WEBINO_DASHBOARD_DIR . 'client/public/dashboard-sw.js',
		);
		$file = null;
		foreach ( $candidates as $candidate ) {
			if ( is_readable( $candidate ) ) {
				$file = $candidate;
				break;
			}
		}
		if ( null === $file ) {
			status_header( 404 );
			nocache_headers();
			exit;
		}

		$raw = file_get_contents( $file );
		if ( ! is_string( $raw ) ) {
			status_header( 500 );
			nocache_headers();
			exit;
		}

		status_header( 200 );
		header( 'Content-Type: application/javascript; charset=UTF-8', true );
		header( 'Cache-Control: no-cache, must-revalidate, max-age=0', true );
		header( 'Service-Worker-Allowed: ' . self::scope_path(), true );
		header( 'X-Content-Type-Options: nosniff', true );
		echo $raw; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JS source.
		exit;
	}

	/**
	 * Dynamic splash PNG: background_color + centered icon.
	 *
	 * @return void
	 */
	private static function serve_splash() {
		if ( ! self::is_enabled() ) {
			status_header( 404 );
			nocache_headers();
			exit;
		}
		$s = self::get_settings();
		if ( empty( $s['splash_enabled'] ) ) {
			status_header( 404 );
			nocache_headers();
			exit;
		}

		$w = isset( $_GET['w'] ) ? absint( wp_unslash( $_GET['w'] ) ) : 1170; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$h = isset( $_GET['h'] ) ? absint( wp_unslash( $_GET['h'] ) ) : 2532; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$w = max( 320, min( 2048, $w ) );
		$h = max( 480, min( 2732, $h ) );

		if ( ! function_exists( 'imagecreatetruecolor' ) ) {
			status_header( 501 );
			nocache_headers();
			exit;
		}

		$bg_hex = ltrim( self::background_color(), '#' );
		if ( 3 === strlen( $bg_hex ) ) {
			$bg_hex = $bg_hex[0] . $bg_hex[0] . $bg_hex[1] . $bg_hex[1] . $bg_hex[2] . $bg_hex[2];
		}
		$br = hexdec( substr( $bg_hex, 0, 2 ) );
		$bg = hexdec( substr( $bg_hex, 2, 2 ) );
		$bb = hexdec( substr( $bg_hex, 4, 2 ) );

		$img = imagecreatetruecolor( $w, $h );
		if ( false === $img ) {
			status_header( 500 );
			nocache_headers();
			exit;
		}
		$fill = imagecolorallocate( $img, $br, $bg, $bb );
		imagefilledrectangle( $img, 0, 0, $w, $h, $fill );

		$icon_url = self::icon_url( 512, 'any' );
		$icon_bin = self::fetch_image_bytes( $icon_url );
		if ( is_string( $icon_bin ) && '' !== $icon_bin ) {
			$icon = @imagecreatefromstring( $icon_bin ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			if ( false !== $icon ) {
				$iw = imagesx( $icon );
				$ih = imagesy( $icon );
				$target = (int) min( $w, $h ) * 0.28;
				$target = max( 96, min( 320, $target ) );
				$scale  = min( $target / max( 1, $iw ), $target / max( 1, $ih ) );
				$nw     = max( 1, (int) round( $iw * $scale ) );
				$nh     = max( 1, (int) round( $ih * $scale ) );
				$dx     = (int) ( ( $w - $nw ) / 2 );
				$dy     = (int) ( ( $h - $nh ) / 2 );
				imagealphablending( $img, true );
				imagesavealpha( $img, true );
				imagecopyresampled( $img, $icon, $dx, $dy, 0, 0, $nw, $nh, $iw, $ih );
				imagedestroy( $icon );
			}
		}

		status_header( 200 );
		header( 'Content-Type: image/png', true );
		header( 'Cache-Control: public, max-age=3600', true );
		header( 'X-Content-Type-Options: nosniff', true );
		imagepng( $img );
		imagedestroy( $img );
		exit;
	}

	/**
	 * Load image bytes from URL or local path.
	 *
	 * @param string $url Absolute URL.
	 * @return string|null
	 */
	private static function fetch_image_bytes( $url ) {
		$url = (string) $url;
		if ( '' === $url ) {
			return null;
		}

		$uploads = wp_upload_dir();
		if ( ! empty( $uploads['baseurl'] ) && ! empty( $uploads['basedir'] ) && 0 === strpos( $url, $uploads['baseurl'] ) ) {
			$rel  = substr( $url, strlen( $uploads['baseurl'] ) );
			$path = $uploads['basedir'] . $rel;
			if ( is_readable( $path ) ) {
				$raw = file_get_contents( $path );
				return is_string( $raw ) ? $raw : null;
			}
		}

		$plugin_url = plugins_url( '', WEBINO_DASHBOARD_FILE );
		if ( 0 === strpos( $url, $plugin_url ) ) {
			$rel  = substr( $url, strlen( $plugin_url ) );
			$path = WEBINO_DASHBOARD_DIR . ltrim( $rel, '/' );
			if ( is_readable( $path ) ) {
				$raw = file_get_contents( $path );
				return is_string( $raw ) ? $raw : null;
			}
		}

		$response = wp_remote_get(
			$url,
			array(
				'timeout' => 8,
			)
		);
		if ( is_wp_error( $response ) ) {
			return null;
		}
		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );
		if ( 200 !== (int) $code || ! is_string( $body ) || '' === $body ) {
			return null;
		}
		return $body;
	}
}
