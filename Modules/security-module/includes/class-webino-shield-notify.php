<?php
/**
 * Security notifications — email, site, SMS, Telegram, Bale, daily digest.
 *
 * @package WebinaDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Multi-channel security notifications with per-module activation checks.
 */
final class Webino_Shield_Notify {

	const DIGEST_HOOK = 'webino_shield_daily_digest';

	/** @var array<string,int> In-process throttle cache (request-scoped). */
	private static $throttle = array();

	/**
	 * @return void
	 */
	public static function init() {
		add_action( self::DIGEST_HOOK, array( __CLASS__, 'send_digest' ) );
		add_action( 'init', array( __CLASS__, 'schedule_digest' ), 25 );
	}

	/**
	 * Schedule the daily digest cron if it is not already registered.
	 *
	 * @return void
	 */
	public static function schedule_digest() {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['notify']['digest'] ) || 'off' === $s['notify']['digest'] ) {
			// Digest disabled — remove any existing schedule.
			$ts = wp_next_scheduled( self::DIGEST_HOOK );
			if ( $ts ) {
				wp_unschedule_event( $ts, self::DIGEST_HOOK );
			}
			return;
		}

		if ( ! wp_next_scheduled( self::DIGEST_HOOK ) ) {
			// Schedule daily at roughly the current time + 24 h.
			wp_schedule_event( time() + DAY_IN_SECONDS, 'daily', self::DIGEST_HOOK );
		}
	}

	// -------------------------------------------------------------------------
	// Public dispatch API
	// -------------------------------------------------------------------------

	/**
	 * Dispatch a security notification to all configured channels.
	 *
	 * @param string               $event Event key.
	 * @param array<string,mixed>  $data  Payload.
	 * @return void
	 */
	public static function dispatch( $event, $data = array() ) {
		$s      = Webino_Dashboard_Security_Settings::get();
		$events = isset( $s['notify']['events'] ) && is_array( $s['notify']['events'] ) ? $s['notify']['events'] : array();
		if ( empty( $events[ $event ] ) ) {
			return;
		}

		if ( self::is_throttled( $event ) ) {
			return;
		}

		$summary = self::format_summary( $event, $data );

		// --- Email ---
		if ( ! empty( $s['notify']['email'] ) ) {
			wp_mail(
				get_option( 'admin_email' ),
				sprintf( '[%s] Webino Shield: %s', wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ), $event ),
				$summary
			);
		}

		// --- In-dashboard site notification ---
		if ( ! empty( $s['notify']['site'] ) && class_exists( 'Webino_Dashboard_Notify', false ) ) {
			Webino_Dashboard_Notify::dispatch(
				'security_' . $event,
				array(
					'summary'  => $summary,
					'severity' => self::event_severity( $event ),
					'url'      => admin_url( 'admin.php?page=webino-dashboard#/security' ),
				)
			);
		}

		// --- SMS (only when SMS module is active) ---
		if ( ! empty( $s['notify']['sms'] ) && self::is_sms_active() ) {
			/**
			 * Fires when Webino Shield wants to dispatch an SMS notification.
			 * The SMS module (or any other handler) should hook here to send.
			 *
			 * @param string $message  Short notification text.
			 * @param string $event    Event key.
			 * @param array  $data     Event payload.
			 */
			do_action( 'webino_shield_notify_sms', $summary, $event, $data );
		}

		// --- Telegram (only when Telegram bot module is active) ---
		if ( ! empty( $s['notify']['telegram'] ) && self::is_telegram_active() ) {
			/**
			 * Fires when Webino Shield wants to send a Telegram notification.
			 *
			 * @param string $message  Notification text (Markdown safe).
			 * @param string $event    Event key.
			 * @param array  $data     Event payload.
			 */
			do_action( 'webino_shield_notify_telegram', $summary, $event, $data );
		}

		// --- Bale (only when Bale bot module is active) ---
		if ( ! empty( $s['notify']['bale'] ) && self::is_bale_active() ) {
			/**
			 * Fires when Webino Shield wants to send a Bale notification.
			 *
			 * @param string $message  Notification text.
			 * @param string $event    Event key.
			 * @param array  $data     Event payload.
			 */
			do_action( 'webino_shield_notify_bale', $summary, $event, $data );
		}
	}

	// -------------------------------------------------------------------------
	// Daily digest
	// -------------------------------------------------------------------------

	/**
	 * Build and send the daily summary digest.
	 * Summarises blocks, malware findings, and open critical issues.
	 *
	 * @return void
	 */
	public static function send_digest() {
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['notify']['email'] ) && ! self::is_sms_active() && ! self::is_telegram_active() && ! self::is_bale_active() ) {
			return;
		}

		$digest = self::build_digest_payload();
		$body   = self::format_digest( $digest );
		$site   = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );

		if ( ! empty( $s['notify']['email'] ) ) {
			wp_mail(
				get_option( 'admin_email' ),
				sprintf( '[%s] Webino Shield Daily Digest', $site ),
				$body
			);
		}

		if ( ! empty( $s['notify']['sms'] ) && self::is_sms_active() ) {
			/** @see dispatch() for hook docs */
			do_action( 'webino_shield_notify_sms', $body, 'digest', $digest );
		}
		if ( ! empty( $s['notify']['telegram'] ) && self::is_telegram_active() ) {
			do_action( 'webino_shield_notify_telegram', $body, 'digest', $digest );
		}
		if ( ! empty( $s['notify']['bale'] ) && self::is_bale_active() ) {
			do_action( 'webino_shield_notify_bale', $body, 'digest', $digest );
		}
	}

	/**
	 * Gather stats for the daily digest.
	 *
	 * @return array<string,mixed>
	 */
	private static function build_digest_payload() {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();

		$events   = Webino_Dashboard_Security_Db::table( 'events' );
		$findings = Webino_Dashboard_Security_Db::table( 'findings' );
		$since    = gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS );

		$blocks_24h  = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$events} WHERE action = 'block' AND created_at >= %s", $since ) );
		$malware_open = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$findings} WHERE status = 'open' AND category = 'malware'" );
		$critical_open = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$findings} WHERE status = 'open' AND severity = 'critical'" );
		$high_open     = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$findings} WHERE status = 'open' AND severity = 'high'" );

		$score = class_exists( 'Webino_Shield_Reports', false ) ? Webino_Shield_Reports::security_score() : 0;

		return array(
			'blocks_24h'    => $blocks_24h,
			'malware_open'  => $malware_open,
			'critical_open' => $critical_open,
			'high_open'     => $high_open,
			'score'         => $score,
		);
	}

	/**
	 * Format the digest payload as a readable text body.
	 *
	 * @param array<string,mixed> $digest Digest data.
	 * @return string
	 */
	private static function format_digest( $digest ) {
		$site = get_bloginfo( 'name' );
		$lines = array(
			sprintf( 'Site: %s', $site ),
			sprintf( 'Security Score: %d/100', $digest['score'] ),
			'',
			'Last 24 hours:',
			sprintf( '  Blocks:           %d', $digest['blocks_24h'] ),
			sprintf( '  Open Malware:     %d', $digest['malware_open'] ),
			sprintf( '  Critical Findings: %d', $digest['critical_open'] ),
			sprintf( '  High Findings:     %d', $digest['high_open'] ),
			'',
			admin_url( 'admin.php?page=webino-dashboard#/security' ),
		);
		return implode( "\n", $lines );
	}

	// -------------------------------------------------------------------------
	// Module availability checks
	// -------------------------------------------------------------------------

	/**
	 * Check whether the SMS module is active.
	 *
	 * @return bool
	 */
	private static function is_sms_active() {
		if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false ) ) {
			return false;
		}
		// Support both naming conventions used across the codebase.
		return Webino_Dashboard_Module_Registry::is_active( 'sms-module' )
			|| ( method_exists( 'Webino_Dashboard_Module_Registry', 'sms_ready' ) && Webino_Dashboard_Module_Registry::sms_ready() );
	}

	/**
	 * Check whether the Telegram bot module is active.
	 *
	 * @return bool
	 */
	private static function is_telegram_active() {
		return class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& Webino_Dashboard_Module_Registry::is_active( 'telegram-bot-module' );
	}

	/**
	 * Check whether the Bale bot module is active.
	 *
	 * @return bool
	 */
	private static function is_bale_active() {
		return class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& Webino_Dashboard_Module_Registry::is_active( 'bale-bot-module' );
	}

	// -------------------------------------------------------------------------
	// Internal helpers
	// -------------------------------------------------------------------------

	/**
	 * @param string               $event Event.
	 * @param array<string,mixed>  $data  Data.
	 * @return string
	 */
	private static function format_summary( $event, $data ) {
		$site = get_bloginfo( 'name' );
		switch ( $event ) {
			case 'block_auto':
				return sprintf( "Site: %s\nAuto-blocked IP: %s\nReason: %s", $site, $data['ip'] ?? '', $data['reason'] ?? '' );
			case 'malware':
				return sprintf( "Site: %s\nMalware detected: %s", $site, $data['path'] ?? '' );
			case 'admin_login':
				return sprintf( "Site: %s\nAdmin login: %s from %s", $site, $data['user'] ?? '', $data['ip'] ?? '' );
			case 'feed_fail':
				return sprintf( "Site: %s\nFeed sync failed: %s\n%s", $site, $data['feed'] ?? '', $data['error'] ?? '' );
			default:
				return sprintf( "Site: %s\nEvent: %s\n%s", $site, $event, wp_json_encode( $data ) );
		}
	}

	/**
	 * @param string $event Event.
	 * @return string
	 */
	private static function event_severity( $event ) {
		$map = array(
			'malware'     => 'critical',
			'kev'         => 'high',
			'block_auto'  => 'medium',
			'admin_login' => 'info',
			'canary'      => 'high',
			'feed_fail'   => 'medium',
		);
		return $map[ $event ] ?? 'info';
	}

	/**
	 * Request-scoped + transient throttle to prevent notification floods.
	 *
	 * @param string $event Event.
	 * @return bool
	 */
	private static function is_throttled( $event ) {
		$s   = Webino_Dashboard_Security_Settings::get();
		$min = (int) ( $s['notify']['throttle_min'] ?? 15 );
		$key = 'shield_notify_' . $event;
		if ( isset( self::$throttle[ $key ] ) && ( time() - self::$throttle[ $key ] ) < ( $min * MINUTE_IN_SECONDS ) ) {
			return true;
		}
		$transient = get_transient( $key );
		if ( $transient ) {
			return true;
		}
		set_transient( $key, 1, $min * MINUTE_IN_SECONDS );
		self::$throttle[ $key ] = time();
		return false;
	}
}
