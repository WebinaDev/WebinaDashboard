<?php
/**
 * Security reports and scoring.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Executive, firewall, vuln, malware reports.
 */
final class Webino_Shield_Reports {

	/**
	 * @return int Score 0-100.
	 */
	public static function security_score() {
		$score = 100;
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();

		$findings = Webino_Dashboard_Security_Db::table( 'findings' );
		$crit = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$findings} WHERE status = 'open' AND severity = 'critical'" );
		$high = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$findings} WHERE status = 'open' AND severity = 'high'" );
		$score -= min( 40, $crit * 10 + $high * 3 );

		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['waf']['enabled'] ) || 'off' === ( $s['waf']['mode'] ?? '' ) ) {
			$score -= 15;
		}
		if ( 'learning' === ( $s['waf']['mode'] ?? '' ) ) {
			$score -= 5;
		}
		if ( empty( $s['login']['2fa_required_roles'] ) ) {
			$score -= 10;
		}
		if ( empty( $s['headers']['enabled'] ) ) {
			$score -= 5;
		}

		$feeds = Webino_Shield_Feeds::status();
		$stale = 0;
		foreach ( $feeds as $f ) {
			if ( ! empty( $f['last_error'] ) ) {
				$stale++;
			}
		}
		$score -= min( 10, $stale * 2 );

		return max( 0, min( 100, $score ) );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function overview_kpis() {
		global $wpdb;
		$events = Webino_Dashboard_Security_Db::table( 'events' );
		$since  = gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS );
		$blocks = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$events} WHERE action = 'block' AND created_at >= %s", $since ) );

		$findings = Webino_Dashboard_Security_Db::table( 'findings' );
		$open     = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$findings} WHERE status = 'open'" );

		$scans     = Webino_Dashboard_Security_Db::table( 'scans' );
		$last_scan = $wpdb->get_row( "SELECT * FROM {$scans} ORDER BY id DESC LIMIT 1", ARRAY_A );

		// Incident count.
		$incidents_table  = Webino_Dashboard_Security_Db::table( 'incidents' );
		$open_incidents   = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$incidents_table} WHERE status = 'open'" );

		return array(
			'score'               => self::security_score(),
			'blocks_24h'          => $blocks,
			'open_findings'       => $open,
			'open_incidents'      => $open_incidents,
			'suggested_actions'   => self::suggested_actions(),
			'last_scan'           => $last_scan,
			'waf_mode'            => Webino_Dashboard_Security_Settings::get()['waf']['mode'] ?? 'learning',
			'layers'              => Webino_Dashboard_Security_Install::layer_status(),
		);
	}

	/**
	 * @param string $type Report type.
	 * @return array<string,mixed>
	 */
	public static function generate( $type ) {
		$type = sanitize_key( $type );
		$payload = array();
		switch ( $type ) {
			case 'executive':
				$payload = self::report_executive();
				break;
			case 'firewall':
				$payload = self::report_firewall();
				break;
			case 'vulnerabilities':
				$payload = self::report_vulnerabilities();
				break;
			case 'malware':
				$payload = self::report_malware();
				break;
			case 'hardening':
				$payload = self::report_hardening();
				break;
			case 'compliance_hint':
				$payload = self::report_compliance_hint();
				break;
			case 'incident':
				$payload = self::report_incident();
				break;
			case 'feed_health':
				$payload = self::report_feed_health();
				break;
			default:
				$payload = self::overview_kpis();
		}

		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$wpdb->insert(
			Webino_Dashboard_Security_Db::table( 'reports' ),
			array(
				'report_type' => $type,
				'title'       => ucfirst( str_replace( '_', ' ', $type ) ),
				'payload'     => wp_json_encode( $payload ),
				'score'       => self::security_score(),
				'created_at'  => current_time( 'mysql', true ),
			)
		);

		return array(
			'id'      => (int) $wpdb->insert_id,
			'type'    => $type,
			'score'   => self::security_score(),
			'payload' => $payload,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function report_executive() {
		$score = self::security_score();
		return array(
			'score'      => $score,
			'summary'    => $score >= 80 ? 'Good' : ( $score >= 60 ? 'Needs attention' : 'Critical' ),
			'actions'    => self::suggested_actions(),
			'kpis'       => self::overview_kpis(),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function report_firewall() {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'events' );
		$since = gmdate( 'Y-m-d H:i:s', time() - ( 7 * DAY_IN_SECONDS ) );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$by_action = $wpdb->get_results( $wpdb->prepare( "SELECT action, COUNT(*) AS cnt FROM {$table} WHERE created_at >= %s GROUP BY action", $since ), ARRAY_A );
		$hits = Webino_Dashboard_Security_Db::table( 'rule_hits' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$top_rules = $wpdb->get_results( "SELECT rule_id, SUM(hits) AS hits FROM {$hits} GROUP BY rule_id ORDER BY hits DESC LIMIT 10", ARRAY_A );
		return array( 'by_action' => $by_action, 'top_rules' => $top_rules );
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function report_vulnerabilities() {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'findings' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( "SELECT * FROM {$table} WHERE category = 'vuln' AND status = 'open' ORDER BY severity DESC LIMIT 100", ARRAY_A );
		return array( 'findings' => $rows ?: array() );
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function report_malware() {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'findings' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( "SELECT * FROM {$table} WHERE category IN ('malware','secret') AND status = 'open'", ARRAY_A );
		return array( 'findings' => $rows ?: array() );
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function report_hardening() {
		$s = Webino_Dashboard_Security_Settings::get();
		$checks = array(
			array( 'id' => 'file_edit', 'ok' => defined( 'DISALLOW_FILE_EDIT' ) && DISALLOW_FILE_EDIT ),
			array( 'id' => 'xmlrpc', 'ok' => ! empty( $s['login']['disable_xmlrpc'] ) ),
			array( 'id' => 'rest_users', 'ok' => ! empty( $s['login']['disable_rest_users'] ) ),
			array( 'id' => 'headers', 'ok' => ! empty( $s['headers']['enabled'] ) ),
			array( 'id' => '2fa_admin', 'ok' => in_array( 'administrator', (array) ( $s['login']['2fa_required_roles'] ?? array() ), true ) ),
		);
		return array( 'checklist' => $checks );
	}

	// -------------------------------------------------------------------------
	// New report types: compliance_hint, incident, feed_health
	// -------------------------------------------------------------------------

	/**
	 * Compliance-hint report: maps current settings to common compliance frameworks
	 * (OWASP Top-10, PCI-DSS minimal, GDPR technical measures).
	 *
	 * @return array<string,mixed>
	 */
	private static function report_compliance_hint() {
		$s      = Webino_Dashboard_Security_Settings::get();
		$score  = self::security_score();
		$hints  = array();

		// OWASP A07 – Authentication failures.
		if ( empty( $s['login']['2fa_required_roles'] ) ) {
			$hints[] = array(
				'framework' => 'OWASP A07',
				'control'   => '2FA for admin roles',
				'status'    => 'missing',
				'action'    => 'Enable 2FA for administrator in Login settings.',
			);
		}

		// OWASP A05 – Security misconfiguration.
		if ( empty( $s['headers']['enabled'] ) ) {
			$hints[] = array(
				'framework' => 'OWASP A05',
				'control'   => 'Security headers',
				'status'    => 'missing',
				'action'    => 'Enable security headers in Headers settings.',
			);
		}
		if ( ! defined( 'DISALLOW_FILE_EDIT' ) || ! DISALLOW_FILE_EDIT ) {
			$hints[] = array(
				'framework' => 'OWASP A05',
				'control'   => 'DISALLOW_FILE_EDIT',
				'status'    => 'missing',
				'action'    => 'Add DISALLOW_FILE_EDIT = true to wp-config.php.',
			);
		}

		// PCI-DSS 6.4 – WAF.
		if ( empty( $s['waf']['enabled'] ) || 'off' === ( $s['waf']['mode'] ?? '' ) ) {
			$hints[] = array(
				'framework' => 'PCI-DSS 6.4',
				'control'   => 'WAF active',
				'status'    => 'missing',
				'action'    => 'Switch WAF to enforce mode.',
			);
		}

		// GDPR Art. 32 – Integrity measures.
		if ( empty( $s['privacy']['anonymize_ip'] ) ) {
			$hints[] = array(
				'framework' => 'GDPR Art.32',
				'control'   => 'IP anonymisation',
				'status'    => 'missing',
				'action'    => 'Enable IP anonymisation in Privacy settings.',
			);
		}

		return array(
			'score'  => $score,
			'hints'  => $hints,
			'passed' => count( $hints ) === 0,
		);
	}

	/**
	 * Incident report: list open incidents with their event timelines.
	 *
	 * @return array<string,mixed>
	 */
	private static function report_incident() {
		global $wpdb;
		Webino_Dashboard_Security_Db::ensure_tables();
		$table = Webino_Dashboard_Security_Db::table( 'incidents' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( "SELECT * FROM {$table} WHERE status = 'open' ORDER BY id DESC LIMIT 50", ARRAY_A );

		$incidents = array();
		foreach ( $rows ?: array() as $row ) {
			$row['timeline']  = json_decode( (string) ( $row['timeline'] ?? '[]' ), true );
			$row['event_ids'] = json_decode( (string) ( $row['event_ids'] ?? '[]' ), true );
			$incidents[]      = $row;
		}

		return array(
			'open_count' => count( $incidents ),
			'incidents'  => $incidents,
		);
	}

	/**
	 * Feed-health report: status of all feeds, stale count, last sync times.
	 *
	 * @return array<string,mixed>
	 */
	private static function report_feed_health() {
		$feeds = class_exists( 'Webino_Shield_Feeds', false ) ? Webino_Shield_Feeds::status() : array();

		$stale    = 0;
		$healthy  = 0;
		$s        = Webino_Dashboard_Security_Settings::get();
		$warn_hrs = (int) ( $s['feeds']['stale_warn_hours'] ?? 72 );

		foreach ( $feeds as $f ) {
			if ( ! empty( $f['last_error'] ) ) {
				$stale++;
			} else {
				$last_ok = $f['last_ok'] ?? null;
				if ( $last_ok ) {
					$age_hrs = ( time() - strtotime( $last_ok ) ) / HOUR_IN_SECONDS;
					if ( $age_hrs > $warn_hrs ) {
						$stale++;
					} else {
						$healthy++;
					}
				}
			}
		}

		return array(
			'total'           => count( $feeds ),
			'healthy'         => $healthy,
			'stale'           => $stale,
			'stale_threshold' => $warn_hrs,
			'feeds'           => $feeds,
		);
	}

	/**
	 * @return array<int,string>
	 */
	private static function suggested_actions() {
		$actions = array();
		$score = self::security_score();
		if ( $score < 80 ) {
			$actions[] = 'Run a standard site scan';
		}
		if ( 'learning' === ( Webino_Dashboard_Security_Settings::get()['waf']['mode'] ?? '' ) ) {
			$actions[] = 'Review WAF learning hits and switch to enforce';
		}
		global $wpdb;
		$crit = (int) $wpdb->get_var( "SELECT COUNT(*) FROM " . Webino_Dashboard_Security_Db::table( 'findings' ) . " WHERE status='open' AND severity='critical'" );
		if ( $crit > 0 ) {
			$actions[] = 'Heal critical findings';
		}
		return $actions;
	}

	/**
	 * @param array<string,mixed> $args Args.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_reports( $args = array() ) {
		global $wpdb;
		$limit = min( 50, max( 1, (int) ( $args['limit'] ?? 20 ) ) );
		$table = Webino_Dashboard_Security_Db::table( 'reports' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results( "SELECT id, report_type, title, score, created_at FROM {$table} ORDER BY id DESC LIMIT {$limit}", ARRAY_A ) ?: array();
	}

	/**
	 * @param int $id Report ID.
	 * @return array<string,mixed>|null
	 */
	public static function get_report( $id ) {
		global $wpdb;
		$row = $wpdb->get_row(
			$wpdb->prepare( 'SELECT * FROM ' . Webino_Dashboard_Security_Db::table( 'reports' ) . ' WHERE id = %d', (int) $id ),
			ARRAY_A
		);
		if ( $row && ! empty( $row['payload'] ) ) {
			$row['payload'] = json_decode( (string) $row['payload'], true );
		}
		return $row ?: null;
	}
}
