<?php
/**
 * Lightweight bloom filter for large IP sets (phase 9 perf).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Probabilistic membership for ipsets when object cache is unavailable.
 */
final class Webino_Shield_Bloom {

	const OPTION = 'webino_shield_bloom_ip';

	/**
	 * @param array<int,string> $ips IPs.
	 * @param int               $bits Bit array size.
	 * @return void
	 */
	public static function rebuild( array $ips, $bits = 65536 ) {
		$bits = max( 1024, (int) $bits );
		$arr  = array_fill( 0, (int) ceil( $bits / 8 ), 0 );
		foreach ( $ips as $ip ) {
			self::set_bits( $arr, (string) $ip, $bits );
		}
		update_option(
			self::OPTION,
			array(
				'bits' => $bits,
				'data' => $arr,
				'n'    => count( $ips ),
			),
			false
		);
		if ( function_exists( 'wp_cache_set' ) ) {
			wp_cache_set( 'webino_shield_bloom', array( 'bits' => $bits, 'data' => $arr ), 'webino_shield', HOUR_IN_SECONDS );
		}
	}

	/**
	 * @param string $ip IP.
	 * @return bool|null True/false membership, null if bloom disabled/empty.
	 */
	public static function maybe_contains( $ip ) {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['perf']['use_bloom'] ) ) {
			return null;
		}
		$bloom = null;
		if ( function_exists( 'wp_cache_get' ) ) {
			$bloom = wp_cache_get( 'webino_shield_bloom', 'webino_shield' );
		}
		if ( ! is_array( $bloom ) ) {
			$bloom = get_option( self::OPTION, null );
		}
		if ( ! is_array( $bloom ) || empty( $bloom['data'] ) ) {
			return null;
		}
		return self::test_bits( $bloom['data'], (string) $ip, (int) $bloom['bits'] );
	}

	/**
	 * @param array<int,int> $arr  Bytes.
	 * @param string         $ip   IP.
	 * @param int            $bits Bits.
	 * @return void
	 */
	private static function set_bits( array &$arr, $ip, $bits ) {
		foreach ( self::hashes( $ip, $bits ) as $bit ) {
			$byte = (int) floor( $bit / 8 );
			$arr[ $byte ] = $arr[ $byte ] | ( 1 << ( $bit % 8 ) );
		}
	}

	/**
	 * @param array<int,int> $arr  Bytes.
	 * @param string         $ip   IP.
	 * @param int            $bits Bits.
	 * @return bool
	 */
	private static function test_bits( array $arr, $ip, $bits ) {
		foreach ( self::hashes( $ip, $bits ) as $bit ) {
			$byte = (int) floor( $bit / 8 );
			if ( 0 === ( ( $arr[ $byte ] ?? 0 ) & ( 1 << ( $bit % 8 ) ) ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * @param string $ip   IP.
	 * @param int    $bits Bits.
	 * @return array<int,int>
	 */
	private static function hashes( $ip, $bits ) {
		$h1 = crc32( 'a' . $ip );
		$h2 = crc32( 'b' . $ip );
		$out = array();
		for ( $i = 0; $i < 4; $i++ ) {
			$out[] = abs( $h1 + $i * $h2 ) % $bits;
		}
		return $out;
	}
}
