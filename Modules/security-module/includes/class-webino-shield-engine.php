<?php
/**
 * L0 lite WAF engine (no full WP dependency).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) && ! defined( 'WEBINO_SHIELD_LITE' ) ) {
	// Allow bootstrap-lite to define WEBINO_SHIELD_LITE.
}

/**
 * Minimal WAF engine for prepend / runtime JSON.
 */
final class Webino_Shield_Engine {

	/**
	 * @param array<string,mixed> $runtime Runtime config.
	 * @param array<string,mixed> $request Request data.
	 * @return array<string,mixed>
	 */
	public static function evaluate_lite( $runtime, $request ) {
		$ip = (string) ( $request['ip'] ?? '' );
		$ua = (string) ( $request['ua'] ?? '' );

		if ( self::match_list( $runtime['allow_ips'] ?? array(), $ip ) ) {
			return array( 'action' => 'allow' );
		}

		foreach ( (array) ( $runtime['block_ips'] ?? array() ) as $blocked ) {
			if ( self::ip_match( $ip, (string) $blocked ) ) {
				return array( 'action' => 'block', 'rule_id' => 'block_ip', 'reason' => 'IP blocked' );
			}
		}

		foreach ( (array) ( $runtime['block_ua'] ?? array() ) as $pattern ) {
			if ( '' !== $pattern && false !== stripos( $ua, (string) $pattern ) ) {
				return array( 'action' => 'block', 'rule_id' => 'block_ua', 'reason' => 'UA blocked' );
			}
		}

		foreach ( (array) ( $runtime['rules'] ?? array() ) as $rule ) {
			if ( empty( $rule['enabled'] ) ) {
				continue;
			}
			if ( self::rule_matches( $rule, $request ) ) {
				$action = ! empty( $rule['learning'] ) ? 'log' : ( $rule['action'] ?? 'block' );
				return array(
					'action'  => $action,
					'rule_id' => $rule['id'] ?? 'custom',
					'reason'  => $rule['name'] ?? '',
					'score'   => (int) ( $rule['score'] ?? 5 ),
				);
			}
		}

		return array( 'action' => 'allow' );
	}

	/**
	 * @param array<string,mixed> $rule    Rule.
	 * @param array<string,mixed> $request Request.
	 * @return bool
	 */
	public static function rule_matches( $rule, $request ) {
		$conds = isset( $rule['conditions'] ) && is_array( $rule['conditions'] ) ? $rule['conditions'] : array();
		foreach ( $conds as $cond ) {
			$field = (string) ( $cond['field'] ?? '' );
			$op    = (string) ( $cond['op'] ?? 'contains' );
			$val   = (string) ( $cond['value'] ?? '' );
			$hay   = '';
			switch ( $field ) {
				case 'path':
					$hay = (string) ( $request['path'] ?? '' );
					break;
				case 'query':
					$hay = (string) ( $request['query'] ?? '' );
					break;
				case 'body':
					$hay = (string) ( $request['body'] ?? '' );
					break;
				case 'payload':
					$hay = (string) ( $request['payload'] ?? ( ( $request['query'] ?? '' ) . ' ' . ( $request['body'] ?? '' ) ) );
					break;
				case 'ua':
					$hay = (string) ( $request['ua'] ?? '' );
					break;
				case 'method':
					$hay = (string) ( $request['method'] ?? '' );
					break;
				default:
					$hay = (string) ( $request[ $field ] ?? '' );
			}
			if ( ! self::match_op( $hay, $op, $val ) ) {
				return false;
			}
		}
		return ! empty( $conds );
	}

	/**
	 * @param string $hay Haystack.
	 * @param string $op  Operator.
	 * @param string $val Value.
	 * @return bool
	 */
	private static function match_op( $hay, $op, $val ) {
		switch ( $op ) {
			case 'equals':
				return $hay === $val;
			case 'regex':
				return 1 === @preg_match( $val, $hay );
			case 'exists':
				return '' !== $hay;
			case 'not_contains':
				return false === stripos( $hay, $val );
			case 'contains':
			default:
				return false !== stripos( $hay, $val );
		}
	}

	/**
	 * @param array<int,string> $list List.
	 * @param string            $ip   IP.
	 * @return bool
	 */
	private static function match_list( $list, $ip ) {
		foreach ( $list as $item ) {
			if ( self::ip_match( $ip, (string) $item ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param string $ip   IP.
	 * @param string $rule IP or CIDR.
	 * @return bool
	 */
	public static function ip_match( $ip, $rule ) {
		if ( $ip === $rule ) {
			return true;
		}
		if ( false === strpos( $rule, '/' ) ) {
			return false;
		}
		list( $subnet, $mask ) = explode( '/', $rule, 2 );
		$mask = (int) $mask;
		$is_v6 = ( false !== strpos( $ip, ':' ) || false !== strpos( $subnet, ':' ) );
		if ( $is_v6 ) {
			return self::ipv6_cidr_match( $ip, $subnet, $mask );
		}
		$ip_long     = ip2long( $ip );
		$subnet_long = ip2long( $subnet );
		if ( false === $ip_long || false === $subnet_long || $mask < 0 || $mask > 32 ) {
			return false;
		}
		$mask_long = -1 << ( 32 - $mask );
		return ( $ip_long & $mask_long ) === ( $subnet_long & $mask_long );
	}

	/**
	 * IPv6 CIDR match via binary prefix compare.
	 *
	 * @param string $ip     Client IPv6.
	 * @param string $subnet Network address.
	 * @param int    $mask   Prefix length 0–128.
	 * @return bool
	 */
	private static function ipv6_cidr_match( $ip, $subnet, $mask ) {
		if ( $mask < 0 || $mask > 128 ) {
			return false;
		}
		$ip_bin     = @inet_pton( $ip );
		$subnet_bin = @inet_pton( $subnet );
		if ( false === $ip_bin || false === $subnet_bin || 16 !== strlen( $ip_bin ) || 16 !== strlen( $subnet_bin ) ) {
			return false;
		}
		$full_bytes = (int) floor( $mask / 8 );
		$rem_bits   = $mask % 8;
		if ( $full_bytes > 0 && substr( $ip_bin, 0, $full_bytes ) !== substr( $subnet_bin, 0, $full_bytes ) ) {
			return false;
		}
		if ( 0 === $rem_bits ) {
			return true;
		}
		$mask_byte = ( 0xFF << ( 8 - $rem_bits ) ) & 0xFF;
		return ( ord( $ip_bin[ $full_bytes ] ) & $mask_byte ) === ( ord( $subnet_bin[ $full_bytes ] ) & $mask_byte );
	}
}
