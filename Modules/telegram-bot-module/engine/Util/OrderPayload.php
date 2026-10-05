<?php

namespace Webino_Dashboard_Bots_Telegram\Util;

/**
 * Signed payload for Bale invoice / payment verification.
 */
class OrderPayload {

	public static function sign( int $order_id ): string {
		$sig = hash_hmac( 'sha256', (string) $order_id, wp_salt( 'woobale_invoice' ) );
		return $order_id . ':' . substr( $sig, 0, 16 );
	}

	public static function verify( string $payload ): ?int {
		if ( ! preg_match( '/^(\d+):([a-f0-9]{16})$/', $payload, $m ) ) {
			return null;
		}
		$id  = (int) $m[1];
		$sig = $m[2];
		$exp = substr( hash_hmac( 'sha256', (string) $id, wp_salt( 'woobale_invoice' ) ), 0, 16 );
		if ( ! hash_equals( $exp, $sig ) ) {
			return null;
		}
		return $id;
	}
}
