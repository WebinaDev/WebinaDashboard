<?php
/**
 * Multi-class rate limiter.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Rate limiting for login, REST, etc.
 */
final class Webino_Shield_Rate_Limiter {

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'enforce' ), 2 );
	}

	/**
	 * @return void
	 */
	public static function enforce() {
		$class = self::detect_class();
		if ( '' === $class ) {
			return;
		}
		$result = self::hit( $class );
		if ( ! empty( $result['blocked'] ) ) {
			status_header( 429 );
			exit;
		}
	}

	/**
	 * @return string
	 */
	private static function detect_class() {
		$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
		if ( false !== strpos( $uri, 'wp-login.php' ) ) {
			return 'login';
		}
		if ( false !== strpos( $uri, 'xmlrpc.php' ) ) {
			return 'xmlrpc';
		}
		if ( false !== strpos( $uri, '/wp-json/' ) ) {
			return is_user_logged_in() ? 'rest_auth' : 'rest_public';
		}
		if ( false !== strpos( $uri, 'wp-comments-post.php' ) ) {
			return 'comment';
		}
		if ( false !== strpos( $uri, 'admin-ajax.php' ) ) {
			return 'admin_ajax';
		}
		if ( false !== strpos( $uri, 'async-upload.php' ) ) {
			return 'upload';
		}
		if ( false !== strpos( $uri, 'checkout' ) || false !== strpos( $uri, 'wc-ajax' ) ) {
			return 'checkout';
		}
		if ( isset( $_GET['s'] ) ) {
			return 'search';
		}
		if ( false !== strpos( $uri, '/wp-json/webino-dashboard/v1/security' ) ) {
			return 'shield_public';
		}
		return '';
	}

	/**
	 * @param string $class Rate class.
	 * @return array<string,mixed>
	 */
	public static function hit( $class ) {
		$s    = Webino_Dashboard_Security_Settings::get();
		$cfg  = isset( $s['rate'][ $class ] ) ? $s['rate'][ $class ] : null;
		if ( ! is_array( $cfg ) ) {
			return array( 'blocked' => false );
		}

		$ip     = Webino_Dashboard_Security::get_client_ip();
		$key    = 'shield_rate_' . $class . '_' . Webino_Dashboard_Security::ip_hash( $ip );
		$limit  = (int) ( $cfg['limit'] ?? 60 );
		$window = (int) ( $cfg['window_sec'] ?? 60 );

		$settings = Webino_Dashboard_Security_Settings::get();
		if ( ! empty( $settings['perf']['use_object_cache'] ) && wp_using_ext_object_cache() ) {
			$count = (int) wp_cache_get( $key, 'webino_shield' );
			$count++;
			wp_cache_set( $key, $count, 'webino_shield', $window );
		} else {
			global $wpdb;
			Webino_Dashboard_Security_Db::ensure_tables();
			$table = Webino_Dashboard_Security_Db::table( 'rate' );
			$now   = time();
			$row   = $wpdb->get_row( $wpdb->prepare( "SELECT hits, window_start FROM {$table} WHERE bucket_key = %s", $key ), ARRAY_A );
			if ( $row && ( $now - (int) $row['window_start'] ) < $window ) {
				$count = (int) $row['hits'] + 1;
				$wpdb->update( $table, array( 'hits' => $count ), array( 'bucket_key' => $key ), array( '%d' ), array( '%s' ) );
			} else {
				$count = 1;
				$wpdb->replace(
					$table,
					array( 'bucket_key' => $key, 'hits' => 1, 'window_start' => $now ),
					array( '%s', '%d', '%d' )
				);
			}
		}

		if ( $count > $limit ) {
			if ( 'block' === ( $cfg['action'] ?? 'block' ) ) {
				Webino_Shield_Blocklist::auto_block( $ip, 'rate_' . $class, (int) ( $cfg['block_min'] ?? 10 ) );
				return array( 'blocked' => true, 'action' => 'block' );
			}
			return array( 'blocked' => false, 'action' => 'challenge' );
		}

		return array( 'blocked' => false, 'hits' => $count );
	}
}
