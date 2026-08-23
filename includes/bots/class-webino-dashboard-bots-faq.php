<?php
/**
 * Keyword FAQ auto-replies for shop bots.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Exact / contains / prefix keyword rules.
 */
final class Webino_Dashboard_Bots_FAQ {

	const OPTION = 'webino_dashboard_bots_faq';

	/**
	 * @return void
	 */
	public static function init() {
	}

	/**
	 * @return array{enabled:string,fallback:string,rules:list<array<string,mixed>>}
	 */
	public static function settings() {
		$defaults = array(
			'enabled'  => '1',
			'fallback' => '',
			'rules'    => array(),
		);
		$raw = get_option( self::OPTION, array() );
		return is_array( $raw ) ? array_merge( $defaults, $raw ) : $defaults;
	}

	/**
	 * @param array<string,mixed> $input Input.
	 * @return array<string,mixed>
	 */
	public static function save_settings( $input ) {
		$cur = self::settings();
		if ( ! is_array( $input ) ) {
			return $cur;
		}
		if ( isset( $input['enabled'] ) ) {
			$cur['enabled'] = ! empty( $input['enabled'] ) && '0' !== (string) $input['enabled'] ? '1' : '0';
		}
		if ( isset( $input['fallback'] ) ) {
			$cur['fallback'] = sanitize_textarea_field( (string) $input['fallback'] );
		}
		if ( isset( $input['rules'] ) && is_array( $input['rules'] ) ) {
			$rules = array();
			foreach ( $input['rules'] as $rule ) {
				if ( ! is_array( $rule ) || empty( $rule['keyword'] ) ) {
					continue;
				}
				$rules[] = array(
					'keyword'  => sanitize_text_field( (string) $rule['keyword'] ),
					'match'    => in_array( (string) ( $rule['match'] ?? '' ), array( 'exact', 'contains', 'prefix' ), true ) ? (string) $rule['match'] : 'contains',
					'reply'    => sanitize_textarea_field( (string) ( $rule['reply'] ?? '' ) ),
					'priority' => isset( $rule['priority'] ) ? (int) $rule['priority'] : 10,
				);
			}
			usort(
				$rules,
				static function ( $a, $b ) {
					return (int) $a['priority'] <=> (int) $b['priority'];
				}
			);
			$cur['rules'] = $rules;
		}
		update_option( self::OPTION, $cur, false );
		return $cur;
	}

	/**
	 * @param string $text User text.
	 * @return string|null
	 */
	public static function match( $text ) {
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] ) {
			return null;
		}
		$text = trim( (string) $text );
		if ( $text === '' || strpos( $text, '/' ) === 0 ) {
			return null;
		}
		$lower = mb_strtolower( $text );
		foreach ( (array) $s['rules'] as $rule ) {
			$kw = mb_strtolower( (string) $rule['keyword'] );
			if ( $kw === '' ) {
				continue;
			}
			$ok = false;
			if ( 'exact' === $rule['match'] ) {
				$ok = $lower === $kw;
			} elseif ( 'prefix' === $rule['match'] ) {
				$ok = strpos( $lower, $kw ) === 0;
			} else {
				$ok = false !== mb_strpos( $lower, $kw );
			}
			if ( $ok && (string) $rule['reply'] !== '' ) {
				return (string) $rule['reply'];
			}
		}
		$fb = trim( (string) $s['fallback'] );
		return $fb !== '' ? $fb : null;
	}
}
