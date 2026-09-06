<?php
/**
 * Blocklist and allowlist management.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * IP/CIDR/UA block and allow lists.
 */
final class Webino_Shield_Blocklist {

	/**
	 * @return void
	 */
	public static function init() {
		// No hooks — called from WAF / login / rate limiter.
	}

	/**
	 * @param string $ip IP address.
	 * @return bool
	 */
	public static function is_blocked( $ip ) {
		if ( self::is_allowed( $ip ) ) {
			return false;
		}

		// Fast negative for large intel ipsets (bloom never false-negatives on miss certainty).
		$bloom = class_exists( 'Webino_Shield_Bloom', false ) ? Webino_Shield_Bloom::maybe_contains( $ip ) : null;
		if ( true === $bloom && self::intel_ip_hit( $ip ) ) {
			return true;
		}

		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'blocks' );
		$hash  = hash( 'sha256', $ip );
		$now   = current_time( 'mysql', true );

		$row = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT id FROM {$table} WHERE type = 'ip' AND value_hash = %s AND (expires_at IS NULL OR expires_at > %s) LIMIT 1",
				$hash,
				$now
			)
		);
		if ( $row ) {
			return true;
		}

		// CIDR blocks: load active cidr rows and match with Engine::ip_match.
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$cidrs = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT value_text FROM {$table} WHERE type = 'cidr' AND (expires_at IS NULL OR expires_at > %s)",
				$now
			)
		);
		foreach ( (array) $cidrs as $cidr ) {
			if ( Webino_Shield_Engine::ip_match( $ip, (string) $cidr ) ) {
				return true;
			}
		}

		$ua = isset( $_SERVER['HTTP_USER_AGENT'] ) ? (string) wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) : '';
		if ( '' !== $ua ) {
			$ua_hash = hash( 'sha256', $ua );
			$row     = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT id FROM {$table} WHERE type = 'ua' AND value_hash = %s AND (expires_at IS NULL OR expires_at > %s) LIMIT 1",
					$ua_hash,
					$now
				)
			);
			if ( $row ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * @param string $ip IP.
	 * @return bool
	 */
	private static function intel_ip_hit( $ip ) {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'intel_ip' );
		$hash  = hash( 'sha256', $ip );
		$id    = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE value_hash = %s LIMIT 1", $hash ) );
		return ! empty( $id );
	}

	/**
	 * @param string $ip IP.
	 * @return bool
	 */
	public static function is_allowed( $ip ) {
		$s = Webino_Dashboard_Security_Settings::get();
		foreach ( (array) ( $s['access']['allow_ips'] ?? array() ) as $allowed ) {
			if ( Webino_Shield_Engine::ip_match( $ip, (string) $allowed ) ) {
				return true;
			}
		}
		foreach ( (array) ( $s['access']['allow_cidrs'] ?? array() ) as $allowed ) {
			if ( Webino_Shield_Engine::ip_match( $ip, (string) $allowed ) ) {
				return true;
			}
		}

		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'allow' );
		$hash  = hash( 'sha256', $ip );
		$now   = current_time( 'mysql', true );
		$row   = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT id FROM {$table} WHERE type = 'ip' AND value_hash = %s AND (expires_at IS NULL OR expires_at > %s) LIMIT 1",
				$hash,
				$now
			)
		);
		if ( $row ) {
			return true;
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$cidrs = $wpdb->get_col( "SELECT value_text FROM {$table} WHERE type IN ('cidr','ip')" );
		foreach ( (array) $cidrs as $cidr ) {
			if ( false !== strpos( (string) $cidr, '/' ) && Webino_Shield_Engine::ip_match( $ip, (string) $cidr ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param array<string,mixed> $request Request context.
	 * @return array<string,mixed>|null
	 */
	public static function match_request( $request ) {
		$ip = (string) ( $request['ip'] ?? '' );
		if ( self::is_blocked( $ip ) ) {
			return array( 'action' => 'block', 'rule_id' => 'blocklist', 'reason' => 'Blocked IP/UA' );
		}
		if ( self::is_allowed( $ip ) ) {
			return array( 'action' => 'allow' );
		}
		return null;
	}

	/**
	 * @param string $ip       IP.
	 * @param string $reason   Reason.
	 * @param int    $minutes  Duration.
	 * @return int|false
	 */
	public static function auto_block( $ip, $reason, $minutes = 30 ) {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['access']['auto_block_enabled'] ) ) {
			return false;
		}
		if ( ! empty( $s['access']['never_block_private_ip'] ) && self::is_private_ip( $ip ) ) {
			return false;
		}

		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'blocks' );
		$hash  = hash( 'sha256', $ip );
		$expires = gmdate( 'Y-m-d H:i:s', time() + ( $minutes * MINUTE_IN_SECONDS ) );

		$wpdb->insert(
			$table,
			array(
				'type'        => 'ip',
				'value_hash'  => $hash,
				'value_text'  => $ip,
				'reason'      => sanitize_text_field( $reason ),
				'source'      => 'auto',
				'created_at'  => current_time( 'mysql', true ),
				'expires_at'  => $expires,
			),
			array( '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
		);

		Webino_Shield_Audit::write( 'auto_block', 'ip', $ip, array( 'reason' => $reason, 'minutes' => $minutes ) );
		Webino_Shield_Notify::dispatch( 'block_auto', array( 'ip' => $ip, 'reason' => $reason ) );
		Webino_Shield_Rules::compile_runtime();

		return (int) $wpdb->insert_id;
	}

	/**
	 * @param string $type   ip|cidr|ua.
	 * @param string $value  Value.
	 * @param string $reason Reason.
	 * @param int    $minutes Expiry 0 = permanent.
	 * @return int|false
	 */
	public static function add_block( $type, $value, $reason = '', $minutes = 0 ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table   = Webino_Dashboard_Security_Db::table( 'blocks' );
		$expires = $minutes > 0 ? gmdate( 'Y-m-d H:i:s', time() + ( $minutes * MINUTE_IN_SECONDS ) ) : null;

		$wpdb->insert(
			$table,
			array(
				'type'       => sanitize_key( $type ),
				'value_hash' => hash( 'sha256', $value ),
				'value_text' => sanitize_text_field( $value ),
				'reason'     => sanitize_text_field( $reason ),
				'source'     => 'manual',
				'created_at' => current_time( 'mysql', true ),
				'expires_at' => $expires,
			),
			array( '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
		);

		Webino_Shield_Rules::compile_runtime();
		Webino_Shield_Audit::write( 'block_add', $type, $value, array( 'reason' => $reason ) );
		return (int) $wpdb->insert_id;
	}

	/**
	 * @param int $id Block ID.
	 * @return bool
	 */
	public static function delete_block( $id ) {
		global $wpdb;
		$deleted = (bool) $wpdb->delete( Webino_Dashboard_Security_Db::table( 'blocks' ), array( 'id' => (int) $id ), array( '%d' ) );
		if ( $deleted ) {
			Webino_Shield_Rules::compile_runtime();
		}
		return $deleted;
	}

	/**
	 * @param string $type  Type.
	 * @param string $value Value.
	 * @param string $note  Note.
	 * @return int|false
	 */
	public static function add_allow( $type, $value, $note = '' ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'allow' ),
			array(
				'type'       => sanitize_key( $type ),
				'value_hash' => hash( 'sha256', $value ),
				'value_text' => sanitize_text_field( $value ),
				'note'       => sanitize_text_field( $note ),
				'created_at' => current_time( 'mysql', true ),
			),
			array( '%s', '%s', '%s', '%s', '%s' )
		);
		Webino_Shield_Rules::compile_runtime();
		return (int) $wpdb->insert_id;
	}

	/**
	 * @param int $id Allow ID.
	 * @return bool
	 */
	public static function delete_allow( $id ) {
		global $wpdb;
		$deleted = (bool) $wpdb->delete( Webino_Dashboard_Security_Db::table( 'allow' ), array( 'id' => (int) $id ), array( '%d' ) );
		if ( $deleted ) {
			Webino_Shield_Rules::compile_runtime();
		}
		return $deleted;
	}

	/**
	 * @param string $ip IP.
	 * @return bool
	 */
	private static function is_private_ip( $ip ) {
		return ! filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE );
	}

	/**
	 * @param array<string,mixed> $args Query args.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_blocks( $args = array() ) {
		global $wpdb;
		$limit = min( 100, max( 1, (int) ( $args['limit'] ?? 50 ) ) );
		$table = Webino_Dashboard_Security_Db::table( 'blocks' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT {$limit}", ARRAY_A ) ?: array();
	}

	/**
	 * @param array<string,mixed> $args Query args.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_allows( $args = array() ) {
		global $wpdb;
		$limit = min( 100, max( 1, (int) ( $args['limit'] ?? 50 ) ) );
		$table = Webino_Dashboard_Security_Db::table( 'allow' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT {$limit}", ARRAY_A ) ?: array();
	}
}
