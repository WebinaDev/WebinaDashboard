<?php
/**
 * Heal / restore / rollback engine.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Snapshot-based healing actions.
 */
final class Webino_Shield_Heal {

	const TOKEN_OPTION = 'webino_shield_heal_tokens';

	/**
	 * @param array<string,mixed> $actions Actions to preview.
	 * @return array<string,mixed>
	 */
	public static function preview( $actions ) {
		$out = array();
		foreach ( (array) $actions as $action ) {
			$out[] = array(
				'action'   => $action['type'] ?? '',
				'target'   => $action['target'] ?? '',
				'preview'  => self::describe_action( $action ),
				'snapshot' => ! empty( Webino_Dashboard_Security_Settings::get()['heal']['snapshot_always'] ),
			);
		}
		return array( 'actions' => $out, 'token' => self::issue_token() );
	}

	/**
	 * @param array<string,mixed> $payload Apply payload.
	 * @return array<string,mixed>
	 */
	public static function apply( $payload ) {
		if ( ! self::verify_token( (string) ( $payload['confirmation_token'] ?? '' ) ) ) {
			return array( 'error' => 'invalid_token', 'status' => 422 );
		}

		$actions = isset( $payload['actions'] ) ? (array) $payload['actions'] : array();
		$results = array();
		$s       = Webino_Dashboard_Security_Settings::get();

		foreach ( $actions as $action ) {
			$type = sanitize_key( (string) ( $action['type'] ?? '' ) );
			switch ( $type ) {
				case 'restore_core_file':
					$results[] = self::restore_core_file( (string) ( $action['path'] ?? '' ) );
					break;
				case 'restore_plugin_file':
					$results[] = self::restore_plugin_file(
						(string) ( $action['slug'] ?? '' ),
						(string) ( $action['path'] ?? '' ),
						(string) ( $action['version'] ?? '' )
					);
					break;
				case 'delete_file':
					$results[] = self::delete_file( (string) ( $action['path'] ?? '' ) );
					break;
				case 'quarantine_file':
					$results[] = self::quarantine_file( (string) ( $action['path'] ?? '' ) );
					break;
				case 'chmod_harden':
					$results[] = self::chmod_harden( (string) ( $action['path'] ?? '' ), (int) ( $action['mode'] ?? 0644 ) );
					break;
				case 'clean_db_field':
					$results[] = self::clean_db_field( $action );
					break;
				case 'disable_plugin':
					$results[] = self::disable_plugin( (string) ( $action['slug'] ?? '' ) );
					break;
			case 'disable_user':
				$results[] = self::disable_user( (int) ( $action['user_id'] ?? 0 ) );
				break;
			case 'kill_rogue_cron':
				$results[] = self::kill_rogue_cron( (string) ( $action['hook'] ?? '' ) );
				break;
			case 'restore_theme_file':
				$results[] = self::restore_theme_file(
					(string) ( $action['stylesheet'] ?? '' ),
					(string) ( $action['path'] ?? '' ),
					(string) ( $action['version'] ?? '' )
				);
				break;
			case 'invalidate_sessions':
				$results[] = self::invalidate_sessions( (int) ( $action['user_id'] ?? 0 ) );
				break;
			case 'rotate_salts':
				$results[] = self::rotate_salts();
				break;
			case 'regenerate_index_guards':
				$results[] = self::regenerate_index_guards();
				break;
			case 'enable_virtual_patch':
				$results[] = self::enable_virtual_patch();
				break;
			case 'apply_hardening_profile':
				$results[] = self::apply_hardening_profile( (string) ( $action['profile'] ?? 'baseline' ) );
				break;
			default:
					$results[] = array( 'error' => 'unknown_action', 'type' => $type );
			}
		}

		Webino_Shield_Audit::write( 'heal_apply', 'batch', (string) count( $actions ), array( 'results' => $results ) );
		Webino_Shield_Notify::dispatch( 'heal', array( 'count' => count( $actions ) ) );
		self::consume_token( (string) ( $payload['confirmation_token'] ?? '' ) );

		return array( 'results' => $results );
	}

	/**
	 * @param int $snapshot_id Snapshot ID.
	 * @return array<string,mixed>
	 */
	public static function rollback( $snapshot_id ) {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'snapshots' );
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", (int) $snapshot_id ), ARRAY_A );
		if ( ! $row ) {
			return array( 'error' => 'not_found' );
		}

		$data = json_decode( (string) ( $row['payload'] ?? '' ), true );
		if ( ! is_array( $data ) ) {
			return array( 'error' => 'invalid_snapshot' );
		}

		if ( isset( $data['file_path'], $data['content'] ) && is_writable( dirname( $data['file_path'] ) ) ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $data['file_path'], $data['content'] );
		}

		if ( isset( $data['option_name'], $data['option_value'] ) ) {
			update_option( $data['option_name'], $data['option_value'], false );
		}

		$wpdb->update(
			$table,
			array( 'rolled_back_at' => current_time( 'mysql', true ) ),
			array( 'id' => (int) $snapshot_id ),
			array( '%s' ),
			array( '%d' )
		);

		Webino_Shield_Audit::write( 'heal_rollback', 'snapshot', (string) $snapshot_id, array() );
		return array( 'ok' => true, 'snapshot_id' => (int) $snapshot_id );
	}

	/**
	 * @param string $rel_path Relative to ABSPATH.
	 * @return string|null
	 */
	public static function get_official_core_md5( $rel_path ) {
		$rel_path = ltrim( str_replace( array( '..', '\\' ), '', $rel_path ), '/' );
		$version  = get_bloginfo( 'version' );
		$cached   = get_transient( 'webino_shield_wp_checksums' );
		if ( ! is_array( $cached ) || empty( $cached['checksums'] ) ) {
			Webino_Shield_Feeds::sync_wp_core_checksums();
			$cached = get_transient( 'webino_shield_wp_checksums' );
		}
		if ( ! is_array( $cached ) || empty( $cached['checksums'][ $rel_path ] ) ) {
			$url  = "https://api.wordpress.org/core/checksums/1.0/?version={$version}&locale=" . get_locale();
			$resp = wp_remote_get( $url, array( 'timeout' => 30 ) );
			if ( is_wp_error( $resp ) ) {
				return null;
			}
			$body = json_decode( wp_remote_retrieve_body( $resp ), true );
			if ( empty( $body['checksums'][ $rel_path ] ) ) {
				return null;
			}
			return (string) $body['checksums'][ $rel_path ];
		}
		return (string) $cached['checksums'][ $rel_path ];
	}

	/**
	 * @param string $rel_path Relative to ABSPATH.
	 * @return array<string,mixed>
	 */
	public static function restore_core_file( $rel_path ) {
		$rel_path = ltrim( str_replace( array( '..', '\\' ), '', $rel_path ), '/' );
		$local    = ABSPATH . $rel_path;
		if ( ! file_exists( $local ) ) {
			return array( 'error' => 'file_missing' );
		}

		self::snapshot_file( $local, 'restore_core_file' );
		$version = get_bloginfo( 'version' );
		$url     = "https://api.wordpress.org/core/checksums/1.0/?version={$version}&locale=" . get_locale();
		$resp    = wp_remote_get( $url, array( 'timeout' => 30 ) );
		if ( is_wp_error( $resp ) ) {
			return array( 'error' => $resp->get_error_message() );
		}
		$body = json_decode( wp_remote_retrieve_body( $resp ), true );
		if ( empty( $body['checksums'][ $rel_path ] ) ) {
			return array( 'error' => 'not_core_file' );
		}

		$dl = wp_remote_get( "https://raw.githubusercontent.com/WordPress/WordPress/{$version}/{$rel_path}", array( 'timeout' => 30 ) );
		if ( is_wp_error( $dl ) ) {
			return array( 'error' => $dl->get_error_message() );
		}
		$content = wp_remote_retrieve_body( $dl );
		if ( hash( 'md5', $content ) !== $body['checksums'][ $rel_path ] ) {
			return array( 'error' => 'checksum_mismatch' );
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $local, $content );
		return array( 'ok' => true, 'path' => $rel_path );
	}

	/**
	 * @param string $slug    Plugin slug.
	 * @param string $rel_path Relative path inside plugin.
	 * @param string $version Plugin version.
	 * @return array<string,mixed>
	 */
	public static function restore_plugin_file( $slug, $rel_path, $version = '' ) {
		$slug     = sanitize_key( $slug );
		$rel_path = ltrim( str_replace( array( '..', '\\' ), '', $rel_path ), '/' );
		if ( ! $slug || ! $rel_path ) {
			return array( 'error' => 'invalid' );
		}

		$local = WP_PLUGIN_DIR . '/' . $slug . '/' . $rel_path;
		if ( ! file_exists( $local ) ) {
			return array( 'error' => 'file_missing' );
		}

		if ( '' === $version && function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
			foreach ( get_plugins() as $plugin_file => $data ) {
				$base = dirname( $plugin_file );
				if ( '.' === $base ) {
					$base = basename( $plugin_file, '.php' );
				}
				if ( $base === $slug ) {
					$version = (string) ( $data['Version'] ?? '' );
					break;
				}
			}
		}

		$version = preg_replace( '/[^0-9a-zA-Z\.\-_]/', '', (string) $version );
		if ( ! $version ) {
			return array( 'error' => 'version_missing' );
		}

		self::snapshot_file( $local, 'restore_plugin_file' );

		$url  = "https://downloads.wordpress.org/plugin-checksums/{$slug}/{$version}.json";
		$resp = wp_remote_get( $url, array( 'timeout' => 30 ) );
		if ( is_wp_error( $resp ) ) {
			return array( 'error' => $resp->get_error_message() );
		}
		$body = json_decode( wp_remote_retrieve_body( $resp ), true );
		$expected = null;
		if ( is_array( $body ) && isset( $body[ $rel_path ] ) ) {
			$item = $body[ $rel_path ];
			$expected = is_array( $item ) ? (string) ( $item['md5'] ?? '' ) : (string) $item;
		}

		$dl = wp_remote_get(
			"https://plugins.svn.wordpress.org/{$slug}/tags/{$version}/{$rel_path}",
			array( 'timeout' => 30 )
		);
		if ( is_wp_error( $dl ) ) {
			return array( 'error' => $dl->get_error_message() );
		}
		$content = wp_remote_retrieve_body( $dl );
		if ( $expected && hash( 'md5', $content ) !== $expected ) {
			return array( 'error' => 'checksum_mismatch' );
		}

		wp_mkdir_p( dirname( $local ) );
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $local, $content );
		return array( 'ok' => true, 'path' => 'wp-content/plugins/' . $slug . '/' . $rel_path );
	}

	/**
	 * @param string $path Absolute or relative path.
	 * @return array<string,mixed>
	 */
	public static function delete_file( $path ) {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( 0 !== strpos( $path, ABSPATH ) ) {
			$path = ABSPATH . ltrim( str_replace( array( '..', '\\' ), '', $path ), '/' );
		}
		$path = wp_normalize_path( $path );

		if ( self::is_forbidden_path( $path ) || ! is_readable( $path ) ) {
			return array( 'error' => 'forbidden' );
		}

		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$quarantined = (int) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT id FROM ' . Webino_Dashboard_Security_Db::table( 'quarantine' ) . ' WHERE original_path = %s AND restored_at IS NULL LIMIT 1',
				$path
			)
		);

		if ( ! $quarantined && empty( $s['heal']['allow_delete'] ) ) {
			return array( 'error' => 'not_quarantined' );
		}

		self::snapshot_file( $path, 'delete_file' );
		wp_delete_file( $path );
		return array( 'ok' => true, 'path' => str_replace( ABSPATH, '', $path ) );
	}

	/**
	 * @param string $path Absolute path.
	 * @return array<string,mixed>
	 */
	public static function quarantine_file( $path ) {
		$path = wp_normalize_path( $path );
		if ( ! is_readable( $path ) || self::is_forbidden_path( $path ) ) {
			return array( 'error' => 'forbidden' );
		}

		self::snapshot_file( $path, 'quarantine_file' );
		$dir   = trailingslashit( Webino_Dashboard_Security::uploads_dir() ) . 'quarantine';
		wp_mkdir_p( $dir );
		$name  = basename( $path ) . '.' . time() . '.quarantine';
		$dest  = $dir . '/' . $name;
		// phpcs:ignore WordPress.WP.AlternativeFunctions.rename_rename
		if ( ! @rename( $path, $dest ) ) {
			return array( 'error' => 'move_failed' );
		}

		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'quarantine' ),
			array(
				'original_path' => $path,
				'stored_path'   => $dest,
				'file_hash'     => hash_file( 'sha256', $dest ) ?: '',
				'reason'        => 'heal',
				'created_at'    => current_time( 'mysql', true ),
			)
		);

		return array( 'ok' => true, 'quarantine' => $dest );
	}

	/**
	 * @param string $path Path.
	 * @param int    $mode Mode.
	 * @return array<string,mixed>
	 */
	public static function chmod_harden( $path, $mode = 0644 ) {
		if ( ! file_exists( $path ) ) {
			return array( 'error' => 'missing' );
		}
		self::snapshot_file_meta( $path, 'chmod_harden' );
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_chmod
		@chmod( $path, $mode );
		return array( 'ok' => true, 'mode' => $mode );
	}

	/**
	 * @param array<string,mixed> $action Action.
	 * @return array<string,mixed>
	 */
	public static function clean_db_field( $action ) {
		$name = sanitize_key( (string) ( $action['option_name'] ?? '' ) );
		if ( ! $name ) {
			return array( 'error' => 'invalid' );
		}
		$old = get_option( $name );
		self::snapshot_option( $name, $old, 'clean_db_field' );
		update_option( $name, '', false );
		return array( 'ok' => true, 'option' => $name );
	}

	/**
	 * @param string $slug Plugin slug.
	 * @return array<string,mixed>
	 */
	public static function disable_plugin( $slug ) {
		if ( ! function_exists( 'deactivate_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		$plugin = $slug;
		if ( false === strpos( $plugin, '/' ) ) {
			$plugin = $slug . '/' . $slug . '.php';
		}
		deactivate_plugins( $plugin );
		return array( 'ok' => true, 'plugin' => $plugin );
	}

	/**
	 * @param int $user_id User ID.
	 * @return array<string,mixed>
	 */
	public static function disable_user( $user_id ) {
		if ( $user_id <= 0 || get_current_user_id() === $user_id ) {
			return array( 'error' => 'forbidden_user' );
		}
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return array( 'error' => 'not_found' );
		}
		self::snapshot_user_roles( $user_id, $user->roles );
		$user->set_role( '' );
		return array( 'ok' => true, 'user_id' => $user_id );
	}

	/**
	 * @param string $hook Cron hook.
	 * @return array<string,mixed>
	 */
	public static function kill_rogue_cron( $hook ) {
		$cron = get_option( 'cron', array() );
		if ( ! is_array( $cron ) ) {
			return array( 'error' => 'no_cron' );
		}
		self::snapshot_option( 'cron', $cron, 'kill_rogue_cron' );
		foreach ( $cron as $timestamp => $hooks ) {
			if ( isset( $hooks[ $hook ] ) ) {
				unset( $cron[ $timestamp ][ $hook ] );
			}
		}
		update_option( 'cron', $cron, false );
		return array( 'ok' => true, 'hook' => $hook );
	}

	/**
	 * @param string $profile Profile id.
	 * @return array<string,mixed>
	 */
	public static function apply_hardening_profile( $profile ) {
		$results = array();
		switch ( $profile ) {
			case 'baseline':
				if ( ! defined( 'DISALLOW_FILE_EDIT' ) || ! DISALLOW_FILE_EDIT ) {
					$results[] = array(
						'hint'    => 'Add define( \'DISALLOW_FILE_EDIT\', true ); to wp-config.php',
						'finding' => 'DISALLOW_FILE_EDIT not enabled',
					);
				}
				self::remove_readme();
				$results[] = array( 'ok' => 'readme_removed' );
				$results[] = self::ensure_uploads_index_guard();
				break;
			case 'store':
				Webino_Dashboard_Security_Settings::apply_profile( 'store' );
				$results[] = array( 'ok' => 'store_profile' );
				break;
			case 'paranoid':
				// Run baseline tasks first (remove readme, upload index guard, DISALLOW_FILE_EDIT hint).
				$bl = self::apply_hardening_profile( 'baseline' );
				foreach ( (array) ( $bl['results'] ?? array() ) as $r ) {
					$results[] = $r;
				}
				// Apply paranoid profile settings (includes 2FA, CSP, idle timeout, datacenter block).
				Webino_Dashboard_Security_Settings::apply_profile( 'paranoid' );
				$results[] = array( 'ok' => 'paranoid_profile' );
				// Explicitly enforce xmlrpc off in settings.
				Webino_Dashboard_Security_Settings::update( array(
					'login' => array( 'disable_xmlrpc' => true ),
				) );
				$results[] = array( 'ok' => 'xmlrpc_disabled_setting' );
				// Regenerate index guards across all key directories.
				$results[] = self::regenerate_index_guards();
				break;
			default:
				$results[] = array( 'error' => 'unknown_profile' );
		}
		return array( 'results' => $results );
	}

	/**
	 * Restore a theme file from wordpress.org SVN / checksums.
	 *
	 * @param string $stylesheet Theme slug (stylesheet directory).
	 * @param string $rel_path   Relative path inside theme.
	 * @param string $version    Theme version.
	 * @return array<string,mixed>
	 */
	public static function restore_theme_file( $stylesheet, $rel_path, $version = '' ) {
		$stylesheet = sanitize_key( $stylesheet );
		$rel_path   = ltrim( str_replace( array( '..', '\\' ), '', $rel_path ), '/' );
		if ( ! $stylesheet || ! $rel_path ) {
			return array( 'error' => 'invalid' );
		}

		$local = get_theme_root() . '/' . $stylesheet . '/' . $rel_path;
		if ( ! file_exists( $local ) ) {
			return array( 'error' => 'file_missing' );
		}

		if ( '' === $version ) {
			$theme = wp_get_theme( $stylesheet );
			if ( $theme->exists() ) {
				$version = (string) $theme->get( 'Version' );
			}
		}

		$version = preg_replace( '/[^0-9a-zA-Z\.\-_]/', '', (string) $version );
		if ( ! $version ) {
			return array( 'error' => 'version_missing' );
		}

		self::snapshot_file( $local, 'restore_theme_file' );

		// Try to fetch expected checksum from downloads.wordpress.org.
		$expected = null;
		$cs_url   = "https://downloads.wordpress.org/theme-checksums/{$stylesheet}/{$version}.json";
		$cs_resp  = wp_remote_get( $cs_url, array( 'timeout' => 20 ) );
		if ( ! is_wp_error( $cs_resp ) && 200 === (int) wp_remote_retrieve_response_code( $cs_resp ) ) {
			$cs_body = json_decode( wp_remote_retrieve_body( $cs_resp ), true );
			if ( is_array( $cs_body ) && isset( $cs_body[ $rel_path ] ) ) {
				$item     = $cs_body[ $rel_path ];
				$expected = is_array( $item ) ? (string) ( $item['md5'] ?? '' ) : (string) $item;
			}
		}

		$svn_url = "https://themes.svn.wordpress.org/{$stylesheet}/tags/{$version}/{$rel_path}";
		$dl      = wp_remote_get( $svn_url, array( 'timeout' => 30 ) );
		if ( is_wp_error( $dl ) ) {
			return array( 'error' => $dl->get_error_message() );
		}
		if ( 200 !== (int) wp_remote_retrieve_response_code( $dl ) ) {
			return array( 'error' => 'svn_not_found' );
		}
		$content = wp_remote_retrieve_body( $dl );
		if ( $expected && hash( 'md5', $content ) !== $expected ) {
			return array( 'error' => 'checksum_mismatch' );
		}

		wp_mkdir_p( dirname( $local ) );
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $local, $content );
		return array( 'ok' => true, 'path' => 'wp-content/themes/' . $stylesheet . '/' . $rel_path );
	}

	/**
	 * Invalidate all active sessions for a given user.
	 * Sessions may be invalidated for the current user (unlike disable_user).
	 *
	 * @param int $user_id User ID.
	 * @return array<string,mixed>
	 */
	private static function invalidate_sessions( $user_id ) {
		if ( $user_id <= 0 ) {
			return array( 'error' => 'invalid_user' );
		}
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return array( 'error' => 'not_found' );
		}

		if ( class_exists( 'Webino_Shield_2FA', false ) ) {
			Webino_Shield_2FA::invalidate_sessions( $user_id );
		} else {
			$sessions = WP_Session_Tokens::get_instance( $user_id );
			$sessions->destroy_all();
		}

		Webino_Shield_Audit::write( 'invalidate_sessions', 'user', (string) $user_id, array() );
		return array( 'ok' => true, 'user_id' => $user_id );
	}

	/**
	 * Rotate WordPress auth salts.
	 *
	 * Preferred path: snapshot wp-config.php and write new salts directly if the file is writable.
	 * Fallback: store generated salts in option webino_shield_pending_salts and warn that
	 * wp-config.php must be updated manually — to avoid silently breaking the site.
	 *
	 * @return array<string,mixed>
	 */
	private static function rotate_salts() {
		$salt_keys = array(
			'AUTH_KEY', 'SECURE_AUTH_KEY', 'LOGGED_IN_KEY', 'NONCE_KEY',
			'AUTH_SALT', 'SECURE_AUTH_SALT', 'LOGGED_IN_SALT', 'NONCE_SALT',
		);

		$new_salts = array();
		foreach ( $salt_keys as $key ) {
			$new_salts[ $key ] = wp_generate_password( 64, true, true );
		}

		$wp_config = ABSPATH . 'wp-config.php';

		if ( is_writable( $wp_config ) ) {
			// Snapshot before any modification.
			self::snapshot_file( $wp_config, 'rotate_salts' );

			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$content = file_get_contents( $wp_config );
			if ( false !== $content ) {
				$updated = false;
				foreach ( $new_salts as $key => $value ) {
					$escaped = str_replace( array( '\\', "'" ), array( '\\\\', "\\'" ), $value );
					$pattern = "/define\s*\(\s*(['\"])" . preg_quote( $key, '/' ) . "\\1\s*,\s*['\"][^'\"]*['\"]\s*\)/";
					if ( preg_match( $pattern, $content ) ) {
						$content = preg_replace(
							$pattern,
							"define( '{$key}', '{$escaped}' )",
							$content
						);
						$updated = true;
					}
				}
				if ( $updated ) {
					// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
					file_put_contents( $wp_config, $content );
					return array( 'ok' => true, 'method' => 'wp-config' );
				}
			}
		}

		// Fallback: store pending salts and return a warning.
		update_option( 'webino_shield_pending_salts', $new_salts, false );
		return array(
			'ok'      => true,
			'warning' => 'wp-config.php is not writable or salts define() lines were not found. ' .
				'New salts have been saved to option webino_shield_pending_salts. ' .
				'You MUST manually replace the AUTH_KEY / SALT defines in wp-config.php ' .
				'with these values to complete the rotation.',
			'method'  => 'option',
		);
	}

	/**
	 * Ensure index.php silence guards exist in uploads, wp-content, plugins, and themes dirs.
	 *
	 * @return array<string,mixed>
	 */
	private static function regenerate_index_guards() {
		$dirs    = array(
			WP_CONTENT_DIR,
			WP_PLUGIN_DIR,
			get_theme_root(),
		);
		$uploads = wp_get_upload_dir();
		if ( ! empty( $uploads['basedir'] ) ) {
			$dirs[] = $uploads['basedir'];
		}

		$silence = "<?php\n// Silence is golden.\n";
		$guarded = array();

		foreach ( $dirs as $dir ) {
			if ( ! is_dir( $dir ) ) {
				continue;
			}
			$index = trailingslashit( $dir ) . 'index.php';
			if ( ! file_exists( $index ) ) {
				wp_mkdir_p( dirname( $index ) );
				// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
				file_put_contents( $index, $silence );
			} elseif ( filesize( $index ) < 5 ) {
				// File exists but is empty — overwrite.
				// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
				file_put_contents( $index, $silence );
			}
			self::chmod_harden( $index, 0644 );
			$guarded[] = str_replace( ABSPATH, '', $dir );
		}

		return array( 'ok' => true, 'guarded_dirs' => $guarded );
	}

	/**
	 * Enable virtual patching: toggle the setting and trigger patch regeneration if available.
	 *
	 * @return array<string,mixed>
	 */
	private static function enable_virtual_patch() {
		Webino_Dashboard_Security_Settings::update( array(
			'rules' => array( 'virtual_patch' => true ),
		) );

		if ( class_exists( 'Webino_Shield_Feeds', false )
			&& method_exists( 'Webino_Shield_Feeds', 'generate_virtual_patches' ) ) {
			Webino_Shield_Feeds::generate_virtual_patches();
		}

		return array( 'ok' => true, 'virtual_patch' => true );
	}

	/**
	 * @return void
	 */
	private static function remove_readme() {
		foreach ( array( 'readme.html', 'license.txt' ) as $f ) {
			$p = ABSPATH . $f;
			if ( is_readable( $p ) ) {
				self::snapshot_file( $p, 'remove_readme' );
				wp_delete_file( $p );
			}
		}
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function ensure_uploads_index_guard() {
		$uploads = wp_get_upload_dir();
		$base    = ! empty( $uploads['basedir'] ) ? $uploads['basedir'] : WP_CONTENT_DIR . '/uploads';
		$index   = trailingslashit( $base ) . 'index.php';
		if ( ! file_exists( $index ) ) {
			wp_mkdir_p( dirname( $index ) );
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $index, "<?php\n// Silence is golden.\n" );
		}
		return self::chmod_harden( $index, 0644 );
	}

	/**
	 * @param string $path   Path.
	 * @param string $action Action.
	 * @return int|false
	 */
	private static function snapshot_file( $path, $action ) {
		if ( ! is_readable( $path ) ) {
			return false;
		}
		$content = file_get_contents( $path );
		return self::insert_snapshot( $action, $path, array(
			'file_path' => $path,
			'content'   => $content,
			'mode'      => fileperms( $path ),
		) );
	}

	/**
	 * @param string $path   Path.
	 * @param string $action Action.
	 * @return int|false
	 */
	private static function snapshot_file_meta( $path, $action ) {
		return self::insert_snapshot( $action, $path, array(
			'file_path' => $path,
			'mode'      => fileperms( $path ),
		) );
	}

	/**
	 * @param string $name   Option name.
	 * @param mixed  $value  Value.
	 * @param string $action Action.
	 * @return int|false
	 */
	private static function snapshot_option( $name, $value, $action ) {
		return self::insert_snapshot( $action, 'option:' . $name, array(
			'option_name'  => $name,
			'option_value' => $value,
		) );
	}

	/**
	 * @param int                  $user_id User.
	 * @param array<int,string>    $roles   Roles.
	 * @return int|false
	 */
	private static function snapshot_user_roles( $user_id, $roles ) {
		return self::insert_snapshot( 'disable_user', 'user:' . $user_id, array(
			'user_id' => $user_id,
			'roles'   => $roles,
		) );
	}

	/**
	 * @param string               $action Action.
	 * @param string               $target Target.
	 * @param array<string,mixed>  $payload Payload.
	 * @return int|false
	 */
	private static function insert_snapshot( $action, $target, $payload ) {
		global $wpdb;
		$s = Webino_Dashboard_Security_Settings::get();
		$days = (int) ( $s['privacy']['retention_snapshots_days'] ?? 14 );
		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'snapshots' ),
			array(
				'action'     => sanitize_key( $action ),
				'target'     => sanitize_text_field( $target ),
				'payload'    => wp_json_encode( $payload ),
				'created_at' => current_time( 'mysql', true ),
				'expires_at' => gmdate( 'Y-m-d H:i:s', time() + ( $days * DAY_IN_SECONDS ) ),
			)
		);
		return (int) $wpdb->insert_id;
	}

	/**
	 * @param string $path Path.
	 * @return bool
	 */
	private static function is_forbidden_path( $path ) {
		$path = wp_normalize_path( $path );
		$forbidden = array(
			wp_normalize_path( ABSPATH . 'wp-config.php' ),
			wp_normalize_path( ABSPATH . 'wp-settings.php' ),
		);
		return in_array( $path, $forbidden, true );
	}

	/**
	 * @param array<string,mixed> $action Action.
	 * @return string
	 */
	private static function describe_action( $action ) {
		return sprintf( '%s on %s', $action['type'] ?? '', $action['target'] ?? '' );
	}

	/**
	 * @return string
	 */
	public static function issue_token() {
		$token = bin2hex( random_bytes( 16 ) );
		$tokens = get_option( self::TOKEN_OPTION, array() );
		if ( ! is_array( $tokens ) ) {
			$tokens = array();
		}
		$tokens[ $token ] = time() + 300;
		update_option( self::TOKEN_OPTION, $tokens, false );
		return $token;
	}

	/**
	 * @param string $token Token.
	 * @return bool
	 */
	public static function verify_token( $token ) {
		$tokens = get_option( self::TOKEN_OPTION, array() );
		if ( ! is_array( $tokens ) || empty( $tokens[ $token ] ) ) {
			return false;
		}
		return time() <= (int) $tokens[ $token ];
	}

	/**
	 * @param string $token Token.
	 * @return void
	 */
	private static function consume_token( $token ) {
		$tokens = get_option( self::TOKEN_OPTION, array() );
		if ( is_array( $tokens ) ) {
			unset( $tokens[ $token ] );
			update_option( self::TOKEN_OPTION, $tokens, false );
		}
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_quarantine( $args = array() ) {
		global $wpdb;
		$limit = min( 100, max( 1, (int) ( $args['limit'] ?? 50 ) ) );
		$table = Webino_Dashboard_Security_Db::table( 'quarantine' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results( "SELECT * FROM {$table} WHERE restored_at IS NULL ORDER BY id DESC LIMIT {$limit}", ARRAY_A ) ?: array();
	}

	/**
	 * @param int $id Quarantine ID.
	 * @return array<string,mixed>
	 */
	public static function restore_quarantine( $id ) {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'quarantine' );
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", (int) $id ), ARRAY_A );
		if ( ! $row ) {
			return array( 'error' => 'not_found' );
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.rename_rename
		@rename( $row['stored_path'], $row['original_path'] );
		$wpdb->update( $table, array( 'restored_at' => current_time( 'mysql', true ) ), array( 'id' => (int) $id ) );
		return array( 'ok' => true );
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_snapshots( $args = array() ) {
		global $wpdb;
		$limit = min( 100, max( 1, (int) ( $args['limit'] ?? 50 ) ) );
		$table = Webino_Dashboard_Security_Db::table( 'snapshots' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results( "SELECT id, action, target, created_at, expires_at, rolled_back_at FROM {$table} ORDER BY id DESC LIMIT {$limit}", ARRAY_A ) ?: array();
	}
}
