<?php
/**
 * WAF rules engine and runtime compiler.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Custom rules, WP/Woo ruleset, learning mode.
 */
final class Webino_Shield_Rules {

	/** @var int */
	private static $errors = 0;

	/**
	 * @return void
	 */
	public static function init() {
		// Called from Security::bootstrap on init@10 — compile immediately.
		self::compile_runtime();
	}

	/**
	 * @param array<string,mixed> $request Request.
	 * @return array<string,mixed>
	 */
	public static function evaluate( $request ) {
		$block = Webino_Shield_Blocklist::match_request( $request );
		if ( null !== $block ) {
			return $block;
		}

		// Country / TOR blocks from settings (default empty — never auto-block IR).
		$geo = self::evaluate_geo_access( $request );
		if ( null !== $geo ) {
			return $geo;
		}

		$score   = 0;
		$matched = null;
		$rules   = array_merge( self::native_rules(), self::db_rules(), self::virtual_patch_rules() );

		$s = Webino_Dashboard_Security_Settings::get();
		$mode = $s['waf']['mode'] ?? 'learning';
		$threshold_in = (int) ( $s['rules']['crs_anomaly_in'] ?? 5 );

		foreach ( $rules as $rule ) {
			if ( empty( $rule['enabled'] ) ) {
				continue;
			}
			if ( Webino_Shield_Engine::rule_matches( $rule, $request ) ) {
				$score += (int) ( $rule['score'] ?? 5 );
				$matched = $rule;
				self::record_hit( (string) ( $rule['id'] ?? 'unknown' ) );
			}
		}

		if ( $score >= $threshold_in && $matched ) {
			$action = $matched['action'] ?? 'block';
			if ( 'learning' === $mode || ! empty( $matched['learning'] ) ) {
				$action = 'log';
			}
			return array(
				'action'     => $action,
				'rule_id'    => $matched['id'] ?? 'anomaly',
				'reason'     => $matched['name'] ?? 'Rule match',
				'score'      => $score,
				'auto_block' => 'block' === $action || 'virtual_patch_block' === $action,
			);
		}

		return array( 'action' => 'allow' );
	}

	/**
	 * Delegate geo-level access control to Webino_Shield_Geo::evaluate_block().
	 * Handles country, ASN, and TOR blocking from both geo.* and access.* settings.
	 *
	 * @param array<string,mixed> $request Request.
	 * @return array<string,mixed>|null
	 */
	private static function evaluate_geo_access( $request ) {
		if ( class_exists( 'Webino_Shield_Geo', false ) ) {
			return Webino_Shield_Geo::evaluate_block( $request );
		}

		// Fallback when Geo class is unavailable: minimal country/TOR check.
		$s       = Webino_Dashboard_Security_Settings::get();
		$country = strtoupper( (string) ( $request['country'] ?? '' ) );
		if ( '' === $country ) {
			return null;
		}
		$blocked = array_unique(
			array_merge(
				array_map( 'strtoupper', (array) ( $s['geo']['block_countries'] ?? array() ) ),
				array_map( 'strtoupper', (array) ( $s['access']['block_countries'] ?? array() ) )
			)
		);
		if ( in_array( $country, $blocked, true ) ) {
			return array(
				'action'     => 'block',
				'rule_id'    => 'geo_country',
				'reason'     => 'Country blocked',
				'auto_block' => false,
			);
		}
		if ( ( ! empty( $s['geo']['block_tor'] ) || ! empty( $s['access']['block_tor'] ) ) && 'T1' === $country ) {
			return array(
				'action'     => 'block',
				'rule_id'    => 'geo_tor',
				'reason'     => 'TOR exit blocked',
				'auto_block' => false,
			);
		}
		return null;
	}

	/**
	 * Virtual-patch rules generated from KEV intel for installed plugins.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function virtual_patch_rules() {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['rules']['virtual_patch'] ) ) {
			return array();
		}
		$stored = get_option( 'webino_shield_virtual_patch_rules', array() );
		return is_array( $stored ) ? $stored : array();
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function native_rules() {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['rules']['wp_ruleset'] ) ) {
			return array();
		}

		$paranoia = (int) ( $s['rules']['crs_paranoia'] ?? 1 );
		$crs_on   = ! empty( $s['rules']['crs_enabled'] );

		$rules = array(
			array(
				'id'      => 'wp_path_traversal',
				'name'    => 'Path traversal probe',
				'enabled' => true,
				'score'   => 8,
				'action'  => 'block',
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'contains', 'value' => '../' ),
				),
			),
			array(
				'id'      => 'wp_config_probe',
				'name'    => 'wp-config probe',
				'enabled' => true,
				'score'   => 10,
				'action'  => 'block',
				'conditions' => array(
					array( 'field' => 'path', 'op' => 'contains', 'value' => 'wp-config' ),
				),
			),
			array(
				'id'      => 'wp_install_probe',
				'name'    => 'install.php probe',
				'enabled' => true,
				'score'   => 7,
				'action'  => 'block',
				'conditions' => array(
					array( 'field' => 'path', 'op' => 'contains', 'value' => 'install.php' ),
				),
			),
			array(
				'id'      => 'wp_xmlrpc_multicall',
				'name'    => 'XML-RPC multicall',
				'enabled' => true,
				'score'   => 6,
				'action'  => 'block',
				'conditions' => array(
					array( 'field' => 'path', 'op' => 'contains', 'value' => 'xmlrpc.php' ),
					array( 'field' => 'payload', 'op' => 'contains', 'value' => 'system.multicall' ),
				),
			),
		);

		if ( $crs_on ) {
			$rules[] = array(
				'id'      => 'crs_sqli_union',
				'name'    => 'SQLi UNION probe',
				'enabled' => true,
				'score'   => 8,
				'action'  => 'block',
				'paranoia'=> 1,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'regex', 'value' => '/union\s+select/i' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_xss_script',
				'name'    => 'XSS script probe',
				'enabled' => true,
				'score'   => 7,
				'action'  => 'block',
				'paranoia'=> 1,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'regex', 'value' => '/(<script|javascript:)/i' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_sqli_comment',
				'name'    => 'SQLi comment probe',
				'enabled' => $paranoia >= 2,
				'score'   => 6,
				'action'  => 'block',
				'paranoia'=> 2,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'regex', 'value' => '/(--|#|\/\*)\s*$/m' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_rce_eval',
				'name'    => 'RCE eval probe',
				'enabled' => $paranoia >= 2,
				'score'   => 9,
				'action'  => 'block',
				'paranoia'=> 2,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'regex', 'value' => '/\b(eval|assert|system|passthru|shell_exec)\s*\(/i' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_lfi_proc',
				'name'    => 'LFI /proc probe',
				'enabled' => $paranoia >= 3,
				'score'   => 8,
				'action'  => 'block',
				'paranoia'=> 3,
				'learning'=> $paranoia < 3,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'contains', 'value' => '/proc/self' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_paranoid_base64',
				'name'    => 'Suspicious long base64',
				'enabled' => $paranoia >= 3,
				'score'   => 5,
				'action'  => 'block',
				'paranoia'=> 3,
				'learning'=> true,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'regex', 'value' => '/[A-Za-z0-9+\/=]{200,}/' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_path_traversal',
				'name'    => 'Path traversal',
				'enabled' => true,
				'score'   => 8,
				'action'  => 'block',
				'paranoia'=> 1,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'regex', 'value' => '/(\.\.\/|\.\.%2f|%2e%2e\/)/i' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_xxe_hint',
				'name'    => 'XXE entity hint',
				'enabled' => $paranoia >= 2,
				'score'   => 8,
				'action'  => 'block',
				'paranoia'=> 2,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'regex', 'value' => '/<!ENTITY|SYSTEM\s+[\'\"]file:/i' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_ssrf_hint',
				'name'    => 'SSRF localhost/metadata',
				'enabled' => $paranoia >= 2,
				'score'   => 7,
				'action'  => 'block',
				'paranoia'=> 2,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'regex', 'value' => '/(169\.254\.169\.254|metadata\.google|localhost|127\.0\.0\.1).{0,40}(http|curl|file_get)/i' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_header_injection',
				'name'    => 'Header/CRLF injection',
				'enabled' => $paranoia >= 2,
				'score'   => 7,
				'action'  => 'block',
				'paranoia'=> 2,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'regex', 'value' => '/%0d%0a|\\r\\n.*(Set-Cookie|Location:)/i' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_open_redirect',
				'name'    => 'Open redirect probe',
				'enabled' => $paranoia >= 2,
				'score'   => 5,
				'action'  => 'challenge',
				'paranoia'=> 2,
				'conditions' => array(
					array( 'field' => 'query', 'op' => 'regex', 'value' => '/(?:redirect|url|next|return|dest)=https?:\\/\\/(?!localhost)/i' ),
				),
			);
			$rules[] = array(
				'id'      => 'crs_upload_polyglot',
				'name'    => 'Upload double extension',
				'enabled' => true,
				'score'   => 8,
				'action'  => 'block',
				'paranoia'=> 1,
				'conditions' => array(
					array( 'field' => 'payload', 'op' => 'regex', 'value' => '/filename=["\'][^"\']+\\.(php|phtml|phar)\\.(jpg|png|gif)/i' ),
				),
			);
			$rules[] = array(
				'id'      => 'woo_webhook_spoof',
				'name'    => 'WooCommerce webhook without signature hint',
				'enabled' => true,
				'score'   => 6,
				'action'  => 'log',
				'paranoia'=> 1,
				'conditions' => array(
					array( 'field' => 'path', 'op' => 'contains', 'value' => '/wc-api/' ),
					array( 'field' => 'payload', 'op' => 'contains', 'value' => 'webhook_id' ),
				),
			);
		}

		return $rules;
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function db_rules() {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'rules' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( "SELECT * FROM {$table} WHERE enabled = 1 ORDER BY priority ASC", ARRAY_A );
		$out  = array();
		foreach ( $rows ?: array() as $row ) {
			$conds = json_decode( (string) ( $row['conditions'] ?? '[]' ), true );
			$out[] = array(
				'id'         => $row['rule_id'],
				'name'       => $row['name'],
				'enabled'    => (bool) $row['enabled'],
				'action'     => $row['action'],
				'learning'   => (bool) $row['learning'],
				'score'      => 5,
				'conditions' => is_array( $conds ) ? $conds : array(),
			);
		}
		return $out;
	}

	/**
	 * @return void
	 */
	public static function compile_runtime() {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();

		$blocks = Webino_Shield_Blocklist::list_blocks( array( 'limit' => 500 ) );
		$allows = Webino_Shield_Blocklist::list_allows( array( 'limit' => 500 ) );

		$block_ips = array();
		$block_ua  = array();
		foreach ( $blocks as $b ) {
			if ( 'ip' === $b['type'] || 'cidr' === $b['type'] ) {
				$block_ips[] = $b['value_text'];
			} elseif ( 'ua' === $b['type'] ) {
				$block_ua[] = $b['value_text'];
			}
		}

		$allow_ips = array();
		foreach ( $allows as $a ) {
			if ( 'ip' === $a['type'] || 'cidr' === $a['type'] ) {
				$allow_ips[] = $a['value_text'];
			}
		}

		$s = Webino_Dashboard_Security_Settings::get();
		$allow_ips = array_merge( $allow_ips, (array) ( $s['access']['allow_ips'] ?? array() ) );

		$runtime = array(
			'version'    => time(),
			'block_ips'  => array_values( array_unique( $block_ips ) ),
			'allow_ips'  => array_values( array_unique( $allow_ips ) ),
			'block_ua'   => array_values( array_unique( array_merge( $block_ua, (array) ( $s['access']['block_ua'] ?? array() ) ) ) ),
			'rules'      => array_merge( self::native_rules(), self::db_rules() ),
			'mode'       => $s['waf']['mode'] ?? 'learning',
		);

		$path = Webino_Dashboard_Security::runtime_waf_path();
		$tmp  = $path . '.tmp';
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $tmp, wp_json_encode( $runtime ) );
		// phpcs:ignore WordPress.WP.AlternativeFunctions.rename_rename
		@rename( $tmp, $path );
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_chmod
		@chmod( $path, 0600 );
	}

	/**
	 * @param string $rule_id Rule ID.
	 * @return void
	 */
	private static function record_hit( $rule_id ) {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'rule_hits' );
		$day   = gmdate( 'Y-m-d' );
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$table} (rule_id, day, hits) VALUES (%s, %s, 1)
				ON DUPLICATE KEY UPDATE hits = hits + 1",
				$rule_id,
				$day
			)
		);
	}

	/**
	 * @param array<string,mixed> $data Rule data.
	 * @return int|false
	 */
	public static function save_rule( $data ) {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'rules' );
		$id    = (int) ( $data['id'] ?? 0 );
		$row   = array(
			'rule_id'     => sanitize_key( (string) ( $data['rule_id'] ?? wp_generate_password( 8, false, false ) ) ),
			'name'        => sanitize_text_field( (string) ( $data['name'] ?? 'Custom rule' ) ),
			'enabled'     => ! empty( $data['enabled'] ) ? 1 : 0,
			'priority'    => (int) ( $data['priority'] ?? 100 ),
			'conditions'  => wp_json_encode( $data['conditions'] ?? array() ),
			'action'      => sanitize_key( (string) ( $data['action'] ?? 'block' ) ),
			'learning'    => ! empty( $data['learning'] ) ? 1 : 0,
			'updated_at'  => current_time( 'mysql', true ),
		);

		if ( $id > 0 ) {
			$wpdb->update( $table, $row, array( 'id' => $id ), null, array( '%d' ) );
			self::compile_runtime();
			return $id;
		}

		$row['created_at'] = current_time( 'mysql', true );
		$wpdb->insert( $table, $row );
		self::compile_runtime();
		return (int) $wpdb->insert_id;
	}

	/**
	 * @param int $id Rule ID.
	 * @return bool
	 */
	public static function delete_rule( $id ) {
		global $wpdb;
		$ok = (bool) $wpdb->delete( Webino_Dashboard_Security_Db::table( 'rules' ), array( 'id' => (int) $id ), array( '%d' ) );
		if ( $ok ) {
			self::compile_runtime();
		}
		return $ok;
	}

	/**
	 * @param array<string,mixed> $request Sample request.
	 * @param array<string,mixed> $rule    Rule to test.
	 * @return array<string,mixed>
	 */
	public static function test_rule( $request, $rule ) {
		$match = Webino_Shield_Engine::rule_matches( $rule, $request );
		return array( 'matches' => $match, 'request' => $request );
	}

	/**
	 * Promote learning hits to enforce rule.
	 *
	 * @param string $rule_id Rule ID.
	 * @return bool
	 */
	public static function promote_learning( $rule_id ) {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'rules' );
		$updated = $wpdb->update(
			$table,
			array( 'learning' => 0, 'updated_at' => current_time( 'mysql', true ) ),
			array( 'rule_id' => sanitize_key( $rule_id ) ),
			array( '%d', '%s' ),
			array( '%s' )
		);
		if ( $updated ) {
			self::compile_runtime();
		}
		return (bool) $updated;
	}
}
