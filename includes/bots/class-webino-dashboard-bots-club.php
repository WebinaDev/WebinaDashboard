<?php
/**
 * Channel-club: join coupon, daily coupon, join-based referral ladders.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * BaleClub-style growth loop shared by both messengers.
 */
final class Webino_Dashboard_Bots_Club {

	const OPTION = 'webino_dashboard_bots_club';

	/**
	 * @return void
	 */
	public static function init() {
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function settings() {
		$defaults = array(
			'enabled'              => '0',
			'join_coupon_enabled'  => '1',
			'join_coupon_type'     => 'percent',
			'join_coupon_amount'   => 10,
			'join_coupon_prefix'   => 'JOIN',
			'join_min_spend'       => 0,
			'daily_coupon_enabled' => '0',
			'daily_coupon_amount'  => 5,
			'daily_cooldown_h'     => 24,
			'daily_min_member_d'   => 0,
			'referral_ladders'     => array(
				array( 'joins' => 5, 'type' => 'percent', 'amount' => 5 ),
				array( 'joins' => 10, 'type' => 'percent', 'amount' => 10 ),
			),
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
		foreach ( array( 'enabled', 'join_coupon_enabled', 'daily_coupon_enabled' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = ! empty( $input[ $f ] ) && '0' !== (string) $input[ $f ] ? '1' : '0';
			}
		}
		foreach ( array( 'join_coupon_amount', 'join_min_spend', 'daily_coupon_amount', 'daily_cooldown_h', 'daily_min_member_d' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = max( 0, (float) $input[ $f ] );
			}
		}
		if ( isset( $input['join_coupon_type'] ) ) {
			$cur['join_coupon_type'] = in_array( (string) $input['join_coupon_type'], array( 'percent', 'fixed_cart' ), true ) ? (string) $input['join_coupon_type'] : 'percent';
		}
		if ( isset( $input['join_coupon_prefix'] ) ) {
			$cur['join_coupon_prefix'] = sanitize_text_field( (string) $input['join_coupon_prefix'] );
		}
		if ( isset( $input['referral_ladders'] ) && is_array( $input['referral_ladders'] ) ) {
			$ladders = array();
			foreach ( $input['referral_ladders'] as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$ladders[] = array(
					'joins'  => max( 1, (int) ( $row['joins'] ?? 1 ) ),
					'type'   => in_array( (string) ( $row['type'] ?? '' ), array( 'percent', 'fixed_cart' ), true ) ? (string) $row['type'] : 'percent',
					'amount' => max( 0, (float) ( $row['amount'] ?? 0 ) ),
				);
			}
			$cur['referral_ladders'] = $ladders;
		}
		update_option( self::OPTION, $cur, false );
		return $cur;
	}

	/**
	 * Issue join coupon after force-join verified.
	 *
	 * @param int $user_id User.
	 * @return string Coupon code or empty.
	 */
	public static function maybe_issue_join_coupon( $user_id ) {
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] || empty( $s['join_coupon_enabled'] ) || '0' === (string) $s['join_coupon_enabled'] ) {
			return '';
		}
		$user_id = (int) $user_id;
		if ( $user_id < 1 || get_user_meta( $user_id, '_webino_club_join_coupon', true ) ) {
			return '';
		}
		$code = self::create_coupon( (string) $s['join_coupon_prefix'] . $user_id, (string) $s['join_coupon_type'], (float) $s['join_coupon_amount'], (float) $s['join_min_spend'] );
		if ( $code !== '' ) {
			update_user_meta( $user_id, '_webino_club_join_coupon', $code );
			update_user_meta( $user_id, '_webino_club_joined_at', time() );
		}
		return $code;
	}

	/**
	 * @param int $user_id User.
	 * @return string
	 */
	public static function maybe_daily_coupon( $user_id ) {
		$s = self::settings();
		if ( empty( $s['enabled'] ) || empty( $s['daily_coupon_enabled'] ) || '0' === (string) $s['daily_coupon_enabled'] ) {
			return '';
		}
		$user_id = (int) $user_id;
		$joined  = (int) get_user_meta( $user_id, '_webino_club_joined_at', true );
		$min_d   = (int) $s['daily_min_member_d'];
		if ( $min_d > 0 && ( time() - $joined ) < $min_d * DAY_IN_SECONDS ) {
			return '';
		}
		$last = (int) get_user_meta( $user_id, '_webino_club_daily_at', true );
		$cd   = max( 1, (int) $s['daily_cooldown_h'] ) * HOUR_IN_SECONDS;
		if ( $last > 0 && ( time() - $last ) < $cd ) {
			return '';
		}
		$code = self::create_coupon( 'DAY' . $user_id . wp_generate_password( 3, false, false ), 'percent', (float) $s['daily_coupon_amount'], 0 );
		if ( $code !== '' ) {
			update_user_meta( $user_id, '_webino_club_daily_at', time() );
			update_user_meta( $user_id, '_webino_club_daily_coupon', $code );
		}
		return $code;
	}

	/**
	 * Record a successful join referral.
	 *
	 * @param int $referrer Referrer user id.
	 * @param int $newbie New user id.
	 * @return void
	 */
	public static function record_join_referral( $referrer, $newbie ) {
		$s = self::settings();
		if ( empty( $s['enabled'] ) || '0' === (string) $s['enabled'] ) {
			return;
		}
		$referrer = (int) $referrer;
		$newbie   = (int) $newbie;
		if ( $referrer < 1 || $newbie < 1 || $referrer === $newbie ) {
			return;
		}
		if ( get_user_meta( $newbie, '_webino_club_referred_join', true ) ) {
			return;
		}
		// Anti-fraud: same IP soft check.
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : '';
		if ( $ip !== '' ) {
			$rip = (string) get_user_meta( $referrer, '_webino_club_last_ref_ip', true );
			if ( $rip === $ip ) {
				return;
			}
			update_user_meta( $referrer, '_webino_club_last_ref_ip', $ip );
		}
		update_user_meta( $newbie, '_webino_club_referred_join', $referrer );
		$count = (int) get_user_meta( $referrer, '_webino_club_join_count', true );
		++$count;
		update_user_meta( $referrer, '_webino_club_join_count', $count );
		$claimed = get_user_meta( $referrer, '_webino_club_claimed_ladders', true );
		$claimed = is_array( $claimed ) ? $claimed : array();
		foreach ( (array) $s['referral_ladders'] as $ladder ) {
			$need = (int) $ladder['joins'];
			$key  = 'j' . $need;
			if ( $count >= $need && empty( $claimed[ $key ] ) && (float) $ladder['amount'] > 0 ) {
				$code = self::create_coupon( 'REF' . $referrer . $need, (string) $ladder['type'], (float) $ladder['amount'], 0 );
				if ( $code !== '' ) {
					$claimed[ $key ] = $code;
				}
			}
		}
		update_user_meta( $referrer, '_webino_club_claimed_ladders', $claimed );
	}

	/**
	 * @param string $code Code base.
	 * @param string $type Type.
	 * @param float  $amount Amount.
	 * @param float  $min Min spend.
	 * @return string
	 */
	private static function create_coupon( $code, $type, $amount, $min ) {
		if ( ! class_exists( 'WC_Coupon', false ) || $amount <= 0 ) {
			return '';
		}
		$code = sanitize_text_field( $code );
		$c    = new WC_Coupon();
		$c->set_code( $code );
		$c->set_discount_type( 'fixed_cart' === $type ? 'fixed_cart' : 'percent' );
		$c->set_amount( $amount );
		$c->set_usage_limit( 1 );
		$c->set_individual_use( true );
		if ( $min > 0 ) {
			$c->set_minimum_amount( $min );
		}
		$c->update_meta_data( '_webino_bot_coupon', '1' );
		$c->update_meta_data( '_webino_club_coupon', '1' );
		$id = $c->save();
		return $id ? $c->get_code() : '';
	}
}
