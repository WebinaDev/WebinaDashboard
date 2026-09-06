<?php
/**
 * WP-CLI commands for Webino Shield.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * wp webino shield * commands.
 */
final class Webino_Shield_Cli {

	/**
	 * @return void
	 */
	public static function init() {
		if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
			return;
		}
		WP_CLI::add_command( 'webino shield', __CLASS__ );
	}

	/**
	 * Show Shield status.
	 *
	 * ## EXAMPLES
	 *
	 *     wp webino shield status
	 *
	 * @param array<int,string>   $args       Args.
	 * @param array<string,mixed> $assoc_args Assoc.
	 * @return void
	 */
	public function status( $args, $assoc_args ) {
		unset( $args, $assoc_args );
		WP_CLI::log( wp_json_encode( Webino_Shield_Reports::overview_kpis(), JSON_PRETTY_PRINT ) );
	}

	/**
	 * Panic unlock WAF.
	 *
	 * @param array<int,string>   $args       Args.
	 * @param array<string,mixed> $assoc_args Assoc.
	 * @return void
	 */
	public function unlock( $args, $assoc_args ) {
		unset( $args, $assoc_args );
		Webino_Dashboard_Security_Install::consume_unlock();
		WP_CLI::success( 'WAF disabled via panic unlock file.' );
	}

	/**
	 * Set WAF mode.
	 *
	 * @param array<int,string>   $args       Args.
	 * @param array<string,mixed> $assoc_args Assoc.
	 * @return void
	 */
	public function waf( $args, $assoc_args ) {
		unset( $assoc_args );
		$sub  = $args[0] ?? '';
		$mode = $args[1] ?? '';
		if ( 'mode' !== $sub || ! in_array( $mode, array( 'enforce', 'learning', 'off' ), true ) ) {
			WP_CLI::error( 'Usage: wp webino shield waf mode enforce|learning|off' );
		}
		$s = Webino_Dashboard_Security_Settings::get();
		$s['waf']['mode'] = $mode;
		if ( 'off' === $mode ) {
			$s['waf']['enabled'] = false;
		}
		Webino_Dashboard_Security_Settings::update( $s );
		WP_CLI::success( "WAF mode set to {$mode}" );
	}

	/**
	 * Block an IP.
	 *
	 * @param array<int,string>   $args       Args.
	 * @param array<string,mixed> $assoc_args Assoc.
	 * @return void
	 */
	public function block( $args, $assoc_args ) {
		$type = $args[0] ?? '';
		$val  = $args[1] ?? '';
		if ( 'ip' !== $type || ! $val ) {
			WP_CLI::error( 'Usage: wp webino shield block ip 1.2.3.4' );
		}
		$min = (int) ( $assoc_args['minutes'] ?? 30 );
		Webino_Shield_Blocklist::add_block( 'ip', $val, 'cli', $min );
		WP_CLI::success( "Blocked {$val}" );
	}

	/**
	 * Allow an IP.
	 *
	 * @param array<int,string>   $args       Args.
	 * @param array<string,mixed> $assoc_args Assoc.
	 * @return void
	 */
	public function allow( $args, $assoc_args ) {
		unset( $assoc_args );
		$type = $args[0] ?? '';
		$val  = $args[1] ?? '';
		if ( 'ip' !== $type || ! $val ) {
			WP_CLI::error( 'Usage: wp webino shield allow ip 1.2.3.4' );
		}
		Webino_Shield_Blocklist::add_allow( 'ip', $val, 'cli' );
		WP_CLI::success( "Allowed {$val}" );
	}

	/**
	 * Run a scan.
	 *
	 * @param array<int,string>   $args       Args.
	 * @param array<string,mixed> $assoc_args Assoc.
	 * @return void
	 */
	public function scan( $args, $assoc_args ) {
		unset( $args );
		$profile = (string) ( $assoc_args['profile'] ?? 'quick' );
		$id = Webino_Shield_Scanner::start( $profile );
		Webino_Shield_Scanner::process_queue( $id );
		WP_CLI::success( "Scan {$id} completed." );
	}

	/**
	 * Heal subcommands.
	 *
	 * @param array<int,string>   $args       Args.
	 * @param array<string,mixed> $assoc_args Assoc.
	 * @return void
	 */
	public function heal( $args, $assoc_args ) {
		$sub = $args[0] ?? '';
		if ( 'apply' === $sub ) {
			if ( empty( $assoc_args['yes'] ) ) {
				WP_CLI::error( 'Destructive action requires --yes' );
			}
			$finding = (int) ( $assoc_args['finding'] ?? 0 );
			global $wpdb;
			$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Webino_Dashboard_Security_Db::table( 'findings' ) . ' WHERE id = %d', $finding ), ARRAY_A );
			if ( ! $row ) {
				WP_CLI::error( 'Finding not found' );
			}
			$preview = Webino_Shield_Heal::preview( array( array(
				'type'   => 'integrity' === $row['category'] ? 'restore_core_file' : 'quarantine_file',
				'target' => $row['path_or_object'],
				'path'   => $row['path_or_object'],
			) ) );
			$result = Webino_Shield_Heal::apply( array(
				'confirmation_token' => $preview['token'],
				'actions'            => array( array(
					'type'   => 'integrity' === $row['category'] ? 'restore_core_file' : 'quarantine_file',
					'path'   => $row['path_or_object'],
				) ),
			) );
			WP_CLI::log( wp_json_encode( $result ) );
			return;
		}
		if ( 'rollback' === $sub ) {
			if ( empty( $assoc_args['yes'] ) ) {
				WP_CLI::error( 'Requires --yes' );
			}
			$snap = (int) ( $assoc_args['snapshot'] ?? 0 );
			WP_CLI::log( wp_json_encode( Webino_Shield_Heal::rollback( $snap ) ) );
			return;
		}
		WP_CLI::error( 'Usage: wp webino shield heal apply|rollback' );
	}

	/**
	 * Sync feeds.
	 *
	 * @param array<int,string>   $args       Args.
	 * @param array<string,mixed> $assoc_args Assoc.
	 * @return void
	 */
	public function feeds( $args, $assoc_args ) {
		unset( $assoc_args );
		if ( ( $args[0] ?? '' ) !== 'sync' ) {
			WP_CLI::error( 'Usage: wp webino shield feeds sync' );
		}
		WP_CLI::log( wp_json_encode( Webino_Shield_Feeds::sync_all(), JSON_PRETTY_PRINT ) );
	}

	/**
	 * Export settings.
	 *
	 * @param array<int,string>   $args       Args.
	 * @param array<string,mixed> $assoc_args Assoc.
	 * @return void
	 */
	public function export( $args, $assoc_args ) {
		unset( $args );
		$file = (string) ( $assoc_args['file'] ?? 'shield.json' );
		$data = Webino_Dashboard_Security_Settings::mask_secrets( Webino_Dashboard_Security_Settings::get() );
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $file, wp_json_encode( $data, JSON_PRETTY_PRINT ) );
		WP_CLI::success( "Exported to {$file}" );
	}

	/**
	 * Import settings.
	 *
	 * @param array<int,string>   $args       Args.
	 * @param array<string,mixed> $assoc_args Assoc.
	 * @return void
	 */
	public function import( $args, $assoc_args ) {
		unset( $args );
		$file = (string) ( $assoc_args['file'] ?? '' );
		if ( ! is_readable( $file ) ) {
			WP_CLI::error( 'File not readable' );
		}
		$data = json_decode( file_get_contents( $file ), true );
		if ( ! is_array( $data ) ) {
			WP_CLI::error( 'Invalid JSON' );
		}
		Webino_Dashboard_Security_Settings::update( $data );
		WP_CLI::success( 'Settings imported.' );
	}
}
