<?php
/**
 * One-time cleanup after removal of the legacy WncBasalam engine (0.9.65).
 *
 * The Dashboard basalam-module (WebinoBasalam) is now the only Basalam engine.
 * This routine:
 *  - unschedules WP-Cron hooks the legacy engine's background queues registered;
 *  - copies connection credentials (tokens, vendor, webhook) from the legacy
 *    option `wnc_basalam_settings` into `webino_basalam_sync_settings` ONLY when
 *    the new engine has no token yet (never overwrites a live connection);
 *  - leaves every legacy option and `wnc_basalam_*` table in place (user data).
 *
 * Product/order meta (`sync_basalam_*`) is shared by both engines, so no meta
 * migration is required.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Legacy Basalam cleanup.
 */
class WNC_Basalam_Legacy_Cleanup {

	const DONE_OPTION = 'wnc_basalam_legacy_cleanup_version';
	const VERSION     = '0.9.65';

	/**
	 * Legacy AsyncBackgroundProcess subclasses → their $action.
	 * Identifier = action . '_' . substr( md5( class ), 0, 8 ).
	 *
	 * @var array<string,string>
	 */
	const LEGACY_QUEUES = array(
		'WncBasalam\\Queue\\Tasks\\CreateProduct' => 'CreateSingleProduct',
		'WncBasalam\\Queue\\Tasks\\UpdateProduct' => 'sync_basalam_update_single_product',
	);

	/**
	 * Keys copied from legacy settings when the new engine is not connected.
	 *
	 * @var string[]
	 */
	const CONNECTION_KEYS = array(
		'token',
		'refresh_token',
		'hamsalam_token',
		'hamsalam_business_id',
		'is_vendor',
		'expire_token_time',
		'vendor_id',
		'webhook_id',
		'webhook_header_token',
	);

	/**
	 * Run once per VERSION.
	 *
	 * @return void
	 */
	public static function maybe_run() {
		if ( self::VERSION === (string) get_option( self::DONE_OPTION, '' ) ) {
			return;
		}
		try {
			self::unschedule_legacy_cron();
			self::migrate_connection();
		} catch ( \Throwable $e ) {
			// Never break site load because of a cleanup step; retry next request.
			if ( function_exists( 'error_log' ) ) {
				error_log( '[WNC] Basalam legacy cleanup failed: ' . $e->getMessage() );
			}
			return;
		}
		update_option( self::DONE_OPTION, self::VERSION, false );
	}

	/**
	 * Legacy cron hook names.
	 *
	 * @return string[]
	 */
	public static function legacy_hooks() {
		$hooks = array();
		foreach ( self::LEGACY_QUEUES as $class => $action ) {
			$id      = $action . '_' . substr( md5( $class ), 0, 8 );
			$hooks[] = $id . '_cron';
			$hooks[] = $id . '_immediate';
		}
		return $hooks;
	}

	/**
	 * Remove all scheduled events of legacy hooks.
	 *
	 * @return void
	 */
	public static function unschedule_legacy_cron() {
		foreach ( self::legacy_hooks() as $hook ) {
			if ( function_exists( 'wp_unschedule_hook' ) ) {
				wp_unschedule_hook( $hook );
			} else {
				wp_clear_scheduled_hook( $hook );
			}
		}
	}

	/**
	 * Copy connection keys from legacy settings when the new engine has no token.
	 *
	 * @return void
	 */
	public static function migrate_connection() {
		$legacy = get_option( 'wnc_basalam_settings', null );
		if ( ! is_array( $legacy ) || empty( $legacy['token'] ) ) {
			return;
		}
		$current = get_option( 'webino_basalam_sync_settings', null );
		if ( is_array( $current ) && ! empty( $current['token'] ) ) {
			return; // New engine already connected — never overwrite.
		}
		$current = is_array( $current ) ? $current : array();
		foreach ( self::CONNECTION_KEYS as $key ) {
			if ( array_key_exists( $key, $legacy ) && null !== $legacy[ $key ] && '' !== $legacy[ $key ] ) {
				$current[ $key ] = $legacy[ $key ];
			}
		}
		update_option( 'webino_basalam_sync_settings', $current );
	}
}
