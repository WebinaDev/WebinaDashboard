<?php
/**
 * Boot WncDigikala engine inside WebinaConnector.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Digikala engine bootstrap.
 */
class WNC_Digikala_Bootstrap {

	/**
	 * @var bool
	 */
	private static $booted = false;

	/**
	 * Init.
	 */
	public static function init() {
		if ( self::$booted ) {
			return;
		}
		self::$booted = true;

		$engine = WNC_PLUGIN_DIR . 'includes/api/digikala/engine/';
		if ( ! file_exists( $engine . 'autoload.php' ) ) {
			return;
		}

		require_once WNC_PLUGIN_DIR . 'includes/api/digikala/class-wnc-digikala-runtime.php';
		require_once $engine . 'autoload.php';

		\WncDigikala\Storage::ensure_schema();
		self::migrate_credentials_from_wnc_settings();

		\WncDigikala\Admin\Menus::register();

		add_action(
			'init',
			static function () {
				if ( class_exists( 'WNC_Digikala_Runtime', false ) && WNC_Digikala_Runtime::owns_runtime() ) {
					\WncDigikala\Jobs::process_due( 3 );
				} elseif ( ! class_exists( 'WNC_Digikala_Runtime', false ) && \WncDigikala\Runtime::owns_runtime() ) {
					\WncDigikala\Jobs::process_due( 3 );
				}
			},
			20
		);

		// Keep legacy AJAX wired to engine.
		add_action( 'wp_ajax_wnc_generate_digikala_keys', array( __CLASS__, 'ajax_generate_keys' ), 1 );
		add_action( 'wp_ajax_wnc_issue_digikala_token', array( __CLASS__, 'ajax_issue_token' ), 1 );
	}

	/**
	 * Copy RSA keys from classic WNC settings into engine option once.
	 */
	private static function migrate_credentials_from_wnc_settings() {
		$engine = \WncDigikala\Settings::all();
		if ( ! empty( $engine['private_key'] ) || ! empty( $engine['public_key'] ) ) {
			return;
		}
		if ( ! class_exists( 'WNC_Settings', false ) ) {
			return;
		}
		$p = WNC_Settings::get_platform( 'digikala' );
		$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
		if ( empty( $c['private_key'] ) && empty( $c['public_key'] ) ) {
			return;
		}
		\WncDigikala\Settings::update(
			array(
				'base_url'                   => $c['base_url'] ?? 'https://seller.digikala.com',
				'client_code'                => $c['client_code'] ?? '',
				'private_key'                => $c['private_key'] ?? '',
				'public_key'                 => $c['public_key'] ?? '',
				'encrypted_code'             => $c['encrypted_code'] ?? '',
				'credit_increase_percentage' => $c['credit_increase_percentage'] ?? 0,
			)
		);
	}

	/**
	 * AJAX: generate keys via engine (runs early before legacy handler if hooked first).
	 */
	public static function ajax_generate_keys() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		check_ajax_referer( 'wnc_admin_nonce', 'nonce' );
		$res = \WncDigikala\Auth::generate_rsa_keypair();
		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}
		// Mirror public/private into classic WNC settings for old UI fields.
		self::mirror_keys_to_wnc_settings();
		wp_send_json_success(
			array(
				'public_key' => $res['public_key'],
			)
		);
	}

	/**
	 * AJAX: issue token via engine.
	 */
	public static function ajax_issue_token() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		check_ajax_referer( 'wnc_admin_nonce', 'nonce' );
		self::migrate_credentials_from_wnc_settings();
		// Pull latest encrypted_code from WNC settings if present.
		if ( class_exists( 'WNC_Settings', false ) ) {
			$p = WNC_Settings::get_platform( 'digikala' );
			$c = isset( $p['credentials'] ) && is_array( $p['credentials'] ) ? $p['credentials'] : array();
			if ( ! empty( $c['encrypted_code'] ) ) {
				\WncDigikala\Settings::update( array( 'encrypted_code' => $c['encrypted_code'] ) );
			}
			if ( ! empty( $c['private_key'] ) ) {
				\WncDigikala\Settings::update( array( 'private_key' => $c['private_key'] ) );
			}
		}
		$res = \WncDigikala\Auth::issue_from_encrypted_code();
		if ( is_wp_error( $res ) ) {
			wp_send_json_error( array( 'message' => $res->get_error_message() ) );
		}
		wp_send_json_success( array( 'message' => 'ok' ) );
	}

	/**
	 * Mirror engine keys into wnc_settings for classic settings form.
	 */
	private static function mirror_keys_to_wnc_settings() {
		if ( ! class_exists( 'WNC_Settings', false ) ) {
			return;
		}
		$all = WNC_Settings::all();
		if ( empty( $all['digikala'] ) || ! is_array( $all['digikala'] ) ) {
			$all['digikala'] = array( 'credentials' => array() );
		}
		if ( empty( $all['digikala']['credentials'] ) || ! is_array( $all['digikala']['credentials'] ) ) {
			$all['digikala']['credentials'] = array();
		}
		$s = \WncDigikala\Settings::all();
		$all['digikala']['credentials']['public_key']  = $s['public_key'] ?? '';
		$all['digikala']['credentials']['private_key'] = $s['private_key'] ?? '';
		update_option( 'wnc_settings', $all, false );
	}
}
