<?php
/**
 * Card-to-card settings (shared option with legacy bot C2C).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option webino_dashboard_bots_c2c.
 */
final class Webino_C2C_Config {

	const OPTION     = 'webino_dashboard_bots_c2c';
	const GATEWAY_ID = 'webino_bots_c2c';

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'enabled'      => '0',
			'title'        => __( 'کارت به کارت', 'webino-dashboard' ),
			'instructions' => __( 'مبلغ را به یکی از کارت‌های زیر واریز و رسید را آپلود کنید.', 'webino-dashboard' ),
			'cards'        => array(),
			'iban'         => '',
			'deadline_h'   => 2,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		$raw = get_option( self::OPTION, array() );
		$out = is_array( $raw ) ? array_merge( self::defaults(), $raw ) : self::defaults();
		$wc  = get_option( 'woocommerce_' . self::GATEWAY_ID . '_settings', array() );
		if ( is_array( $wc ) && isset( $wc['enabled'] ) ) {
			$out['enabled'] = 'yes' === (string) $wc['enabled'] ? '1' : '0';
		}
		return $out;
	}

	/**
	 * Settings shaped for the dashboard REST/UI.
	 *
	 * @return array<string,mixed>
	 */
	public static function for_rest() {
		$s     = self::get();
		$cards = array();
		foreach ( (array) $s['cards'] as $card ) {
			if ( is_string( $card ) && trim( $card ) !== '' ) {
				$cards[] = array(
					'number' => $card,
					'name'   => '',
					'bank'   => '',
				);
			} elseif ( is_array( $card ) && '' !== trim( (string) ( $card['number'] ?? '' ) ) ) {
				$cards[] = array(
					'number' => (string) $card['number'],
					'name'   => (string) ( $card['name'] ?? '' ),
					'bank'   => (string) ( $card['bank'] ?? '' ),
				);
			}
		}
		return array(
			'enabled'      => '0' !== (string) $s['enabled'] && ! empty( $s['enabled'] ),
			'title'        => (string) $s['title'],
			'instructions' => (string) $s['instructions'],
			'iban'         => (string) $s['iban'],
			'deadline_h'   => (int) $s['deadline_h'],
			'cards'        => $cards,
		);
	}

	/**
	 * @param array<string,mixed> $input Raw.
	 * @return array<string,mixed>
	 */
	public static function save( $input ) {
		$cur = self::get();
		if ( ! is_array( $input ) ) {
			return self::for_rest();
		}
		if ( array_key_exists( 'enabled', $input ) ) {
			$cur['enabled'] = self::enabled_flag( $input['enabled'] );
		}
		foreach ( array( 'title', 'instructions', 'iban' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = sanitize_textarea_field( (string) $input[ $f ] );
			}
		}
		if ( isset( $input['deadline_h'] ) ) {
			$cur['deadline_h'] = max( 1, min( 72, (int) $input['deadline_h'] ) );
		}
		if ( isset( $input['cards'] ) && is_array( $input['cards'] ) ) {
			$cards = array();
			foreach ( $input['cards'] as $card ) {
				if ( is_string( $card ) && trim( $card ) !== '' ) {
					$cards[] = array(
						'number' => sanitize_text_field( $card ),
						'name'   => '',
						'bank'   => '',
					);
				} elseif ( is_array( $card ) && ! empty( $card['number'] ) ) {
					$cards[] = array(
						'number' => sanitize_text_field( (string) $card['number'] ),
						'name'   => isset( $card['name'] ) ? sanitize_text_field( (string) $card['name'] ) : '',
						'bank'   => isset( $card['bank'] ) ? sanitize_text_field( (string) $card['bank'] ) : '',
					);
				}
			}
			$cur['cards'] = $cards;
		}
		update_option( self::OPTION, $cur, false );
		$wc_key = 'woocommerce_' . self::GATEWAY_ID . '_settings';
		$wc     = get_option( $wc_key, array() );
		if ( ! is_array( $wc ) ) {
			$wc = array();
		}
		$wc['enabled']     = '1' === (string) $cur['enabled'] ? 'yes' : 'no';
		$wc['title']       = (string) $cur['title'];
		$wc['description'] = (string) $cur['instructions'];
		update_option( $wc_key, $wc, false );
		return self::for_rest();
	}

	/**
	 * Normalize enabled flag from REST JSON.
	 *
	 * @param mixed $value Raw.
	 * @return string '1' or '0'.
	 */
	public static function enabled_flag( $value ) {
		if ( is_bool( $value ) ) {
			return $value ? '1' : '0';
		}
		$v = strtolower( trim( (string) $value ) );
		return in_array( $v, array( '1', 'yes', 'true', 'on' ), true ) ? '1' : '0';
	}
}
