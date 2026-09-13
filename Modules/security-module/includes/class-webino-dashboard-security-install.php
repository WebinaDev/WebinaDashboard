<?php
/**
 * Security module installation helpers.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * MU-plugin, unlock, disable file, wizard.
 */
final class Webino_Dashboard_Security_Install {

	const OPTION_WIZARD = 'webino_shield_wizard_completed';
	const OPTION_UNLOCK = 'webino_shield_unlock_token';

	/**
	 * @return void
	 */
	public static function maybe_install() {
		if ( class_exists( 'Webino_Dashboard_Security', false )
			&& ! Webino_Dashboard_Security::is_runtime_protection_enabled() ) {
			self::neutralize_early_layers();
			return;
		}
		self::ensure_mu_plugin();
		self::ensure_layer0_prepend();
		self::ensure_layer1_dropin();
		self::ensure_runtime_dir();
		if ( ! get_option( self::OPTION_WIZARD, false ) ) {
			// Wizard pending — REST/UI will complete it.
		}
	}

	/**
	 * Write panic disable file (stops L0 / advanced-cache / MU lite immediately).
	 *
	 * @param string $reason Note written into the file.
	 * @return void
	 */
	public static function write_disable_file( $reason = 'manual' ) {
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		@file_put_contents(
			self::disable_file_path(),
			gmdate( 'c' ) . ' ' . sanitize_text_field( (string) $reason ) . "\n"
		);
	}

	/**
	 * Replace MU stub with a no-op and strip L1 chain so early layers cannot block.
	 *
	 * @return void
	 */
	public static function neutralize_early_layers() {
		self::write_disable_file( 'runtime protection disabled' );

		$mu_dir = defined( 'WPMU_PLUGIN_DIR' ) ? WPMU_PLUGIN_DIR : WP_CONTENT_DIR . '/mu-plugins';
		$target = trailingslashit( $mu_dir ) . '000-webino-shield.php';
		if ( is_dir( $mu_dir ) || wp_mkdir_p( $mu_dir ) ) {
			$noop = <<<'PHP'
<?php
/**
 * Webino Shield MU-plugin loader (neutralized — runtime protection off).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Kill-switch / disabled: do not load lite WAF or evaluate requests.
if ( defined( 'WEBINO_SHIELD_DISABLE' ) && WEBINO_SHIELD_DISABLE ) {
	return;
}
if ( defined( 'WEBINO_DASHBOARD_SECURITY_DISABLE' ) && WEBINO_DASHBOARD_SECURITY_DISABLE ) {
	return;
}
if ( defined( 'WP_CONTENT_DIR' ) && is_readable( trailingslashit( WP_CONTENT_DIR ) . 'webino-shield.disable' ) ) {
	return;
}
PHP;
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			@file_put_contents( $target, $noop );
		}

		// Soft-disable runtime JSON so any leftover prepend path fails open.
		if ( class_exists( 'Webino_Dashboard_Security', false ) ) {
			$path = Webino_Dashboard_Security::runtime_waf_path();
			$safe = wp_json_encode(
				array(
					'version'   => time(),
					'enabled'   => false,
					'mode'      => 'off',
					'block_ips' => array(),
					'allow_ips' => array(),
					'block_ua'  => array(),
					'rules'     => array(),
				)
			);
			if ( is_string( $safe ) ) {
				// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
				@file_put_contents( $path, $safe );
			}
		}
	}

	/**
	 * Optional L0: copy lite engine to wp-content/webino-shield-waf.php for auto_prepend_file.
	 *
	 * @return void
	 */
	public static function ensure_layer0_prepend() {
		$settings = Webino_Dashboard_Security_Settings::get();
		$target   = trailingslashit( WP_CONTENT_DIR ) . 'webino-shield-waf.php';
		if ( empty( $settings['waf']['layer0_prepend'] ) ) {
			return;
		}
		$src = Webino_Dashboard_Security::module_dir() . 'engine/bootstrap-lite.php';
		if ( ! is_readable( $src ) ) {
			return;
		}
		$contents = "<?php\n/** Webino Shield L0 prepend entry — do not edit. */\nrequire_once " . var_export( $src, true ) . ";\n";
		if ( ! file_exists( $target ) || md5_file( $target ) !== md5( $contents ) ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $target, $contents );
		}
	}

	/**
	 * Optional L1: chain into advanced-cache.php without replacing existing cache plugins.
	 *
	 * @return void
	 */
	public static function ensure_layer1_dropin() {
		$settings = Webino_Dashboard_Security_Settings::get();
		if ( empty( $settings['waf']['layer1_dropin'] ) ) {
			return;
		}

		$path = trailingslashit( WP_CONTENT_DIR ) . 'advanced-cache.php';
		$marker = 'WEBINO_SHIELD_L1';
		$src    = Webino_Dashboard_Security::module_dir() . 'engine/bootstrap-lite.php';
		$snippet = "\n/* {$marker} */\nif ( ! defined( '{$marker}' ) ) {\n\tdefine( '{$marker}', true );\n\t\$__ws = " . var_export( $src, true ) . ";\n\tif ( is_readable( \$__ws ) ) { require_once \$__ws; }\n}\n";

		if ( ! file_exists( $path ) ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $path, "<?php\n" . $snippet );
			return;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$existing = (string) file_get_contents( $path );
		if ( false !== strpos( $existing, $marker ) ) {
			return;
		}
		// Chain only — never replace third-party advanced-cache.
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $path, rtrim( $existing ) . "\n" . $snippet );
	}

	/**
	 * @return void
	 */
	public static function ensure_mu_plugin() {
		$settings = Webino_Dashboard_Security_Settings::get();
		if ( empty( $settings['waf']['layer2_mu'] ) ) {
			return;
		}

		$mu_dir = defined( 'WPMU_PLUGIN_DIR' ) ? WPMU_PLUGIN_DIR : WP_CONTENT_DIR . '/mu-plugins';
		if ( ! is_dir( $mu_dir ) ) {
			wp_mkdir_p( $mu_dir );
		}

		$target = trailingslashit( $mu_dir ) . '000-webino-shield.php';
		$stub   = self::mu_plugin_contents();
		if ( ! file_exists( $target ) || md5_file( $target ) !== md5( $stub ) ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $target, $stub );
		}
	}

	/**
	 * @return string
	 */
	private static function mu_plugin_contents() {
		$module = str_replace( '\\', '/', Webino_Dashboard_Security::module_dir() );
		return <<<PHP
<?php
/**
 * Webino Shield MU-plugin loader.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( defined( 'WEBINO_SHIELD_DISABLE' ) && WEBINO_SHIELD_DISABLE ) {
	return;
}
if ( defined( 'WEBINO_DASHBOARD_SECURITY_DISABLE' ) && WEBINO_DASHBOARD_SECURITY_DISABLE ) {
	return;
}
if ( defined( 'WP_CONTENT_DIR' ) && is_readable( trailingslashit( WP_CONTENT_DIR ) . 'webino-shield.disable' ) ) {
	return;
}

\$engine = '{$module}/engine/bootstrap-lite.php';
if ( is_readable( \$engine ) ) {
	require_once \$engine;
}

// Defer full WAF to after the dashboard module bootstraps (init@10).
add_action(
	'init',
	static function () {
		if ( ! class_exists( 'Webino_Shield_Waf', false ) ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_Security', false )
			&& ! Webino_Dashboard_Security::is_runtime_protection_enabled() ) {
			return;
		}
		if ( Webino_Shield_Waf::is_disabled() ) {
			return;
		}
		Webino_Shield_Waf::evaluate_request();
	},
	20
);
PHP;
	}

	/**
	 * @return void
	 */
	public static function ensure_runtime_dir() {
		Webino_Dashboard_Security::uploads_dir();
		if ( class_exists( 'Webino_Shield_Rules', false ) ) {
			Webino_Shield_Rules::compile_runtime();
		}
	}

	/**
	 * @return string
	 */
	public static function disable_file_path() {
		return trailingslashit( WP_CONTENT_DIR ) . 'webino-shield.disable';
	}

	/**
	 * @return bool
	 */
	public static function is_disabled_file_present() {
		return is_readable( self::disable_file_path() );
	}

	/**
	 * @return string
	 */
	public static function unlock_file_path() {
		return trailingslashit( WP_CONTENT_DIR ) . 'webino-shield-unlock.php';
	}

	/**
	 * Generate panic unlock token.
	 *
	 * @return string
	 */
	public static function generate_unlock_token() {
		$token = bin2hex( random_bytes( 32 ) );
		update_option(
			self::OPTION_UNLOCK,
			array(
				'token'      => $token,
				'expires_at' => time() + ( 2 * HOUR_IN_SECONDS ),
			),
			false
		);
		return $token;
	}

	/**
	 * @param string $token Token from URL.
	 * @return bool
	 */
	public static function validate_unlock_token( $token ) {
		$stored = get_option( self::OPTION_UNLOCK, array() );
		if ( ! is_array( $stored ) || empty( $stored['token'] ) ) {
			return false;
		}
		if ( ! empty( $stored['expires_at'] ) && time() > (int) $stored['expires_at'] ) {
			return false;
		}
		return hash_equals( (string) $stored['token'], (string) $token );
	}

	/**
	 * @return void
	 */
	public static function consume_unlock() {
		delete_option( self::OPTION_UNLOCK );
		self::write_disable_file( 'panic unlock' );
		if ( class_exists( 'Webino_Dashboard_Security', false ) ) {
			update_option( Webino_Dashboard_Security::OPTION_FORCE_DISABLE, 1, false );
			$stored = get_option( Webino_Dashboard_Security::OPTION, array() );
			if ( ! is_array( $stored ) ) {
				$stored = array();
			}
			if ( ! isset( $stored['general'] ) || ! is_array( $stored['general'] ) ) {
				$stored['general'] = array();
			}
			if ( ! isset( $stored['waf'] ) || ! is_array( $stored['waf'] ) ) {
				$stored['waf'] = array();
			}
			$stored['general']['enabled'] = false;
			$stored['waf']['enabled']     = false;
			$stored['waf']['mode']        = 'off';
			update_option( Webino_Dashboard_Security::OPTION, $stored, false );
		}
		self::neutralize_early_layers();
		Webino_Shield_Audit::write( 'panic_unlock', 'system', '0', array( 'ip' => Webino_Dashboard_Security::get_client_ip() ) );
	}

	/**
	 * @return bool
	 */
	public static function is_wizard_completed() {
		if ( (bool) get_option( self::OPTION_WIZARD, false ) ) {
			return true;
		}
		$settings = Webino_Dashboard_Security_Settings::get();
		return ! empty( $settings['general']['wizard_completed'] );
	}

	/**
	 * @return void
	 */
	public static function mark_wizard_completed() {
		update_option( self::OPTION_WIZARD, true, false );
		$settings = Webino_Dashboard_Security_Settings::get();
		$settings['general']['wizard_completed'] = true;
		update_option( Webino_Dashboard_Security::OPTION, $settings, false );
	}

	/**
	 * Layer diagnostics for REST.
	 *
	 * @return array<string,mixed>
	 */
	public static function layer_status() {
		$mu = trailingslashit( defined( 'WPMU_PLUGIN_DIR' ) ? WPMU_PLUGIN_DIR : WP_CONTENT_DIR . '/mu-plugins' ) . '000-webino-shield.php';
		return array(
			'layer0_prepend'  => is_readable( trailingslashit( WP_CONTENT_DIR ) . 'webino-shield-waf.php' ),
			'layer1_dropin'   => is_readable( trailingslashit( WP_CONTENT_DIR ) . 'advanced-cache.php' ),
			'layer2_mu'       => is_readable( $mu ),
			'layer3_hooks'    => Webino_Dashboard_Security::is_module_active()
				&& Webino_Dashboard_Security::is_runtime_protection_enabled(),
			'disable_file'    => self::is_disabled_file_present(),
			'kill_switch'     => Webino_Dashboard_Security::is_kill_switch_active(),
			'runtime_enabled' => Webino_Dashboard_Security::is_runtime_protection_enabled(),
			'runtime_waf'     => is_readable( Webino_Dashboard_Security::runtime_waf_path() ),
			'fail_open'       => ! empty( Webino_Dashboard_Security_Settings::get()['waf']['fail_open'] ),
		);
	}
}
