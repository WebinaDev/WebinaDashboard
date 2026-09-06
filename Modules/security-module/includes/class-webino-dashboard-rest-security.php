<?php
/**
 * REST API for Webino Shield security module.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Security REST routes under webino-dashboard/v1/security/*.
 */
final class Webino_Dashboard_REST_Security {

	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		$view   = array( 'permission_callback' => array( __CLASS__, 'perm_view' ) );
		$manage = array( 'permission_callback' => array( __CLASS__, 'perm_manage' ) );
		$heal   = array( 'permission_callback' => array( __CLASS__, 'perm_heal' ) );

		register_rest_route( self::NS, '/security/overview', array_merge( $view, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'overview' ),
		) ) );

		register_rest_route( self::NS, '/security/settings', array(
			array_merge( $manage, array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'get_settings' ) ) ),
			array_merge( $manage, array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'save_settings' ) ) ),
		) );

		register_rest_route( self::NS, '/security/settings/profile', array_merge( $manage, array(
			'methods'  => 'POST',
			'callback' => array( __CLASS__, 'apply_profile' ),
		) ) );

		register_rest_route( self::NS, '/security/settings/schema', array_merge( $manage, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'settings_schema' ),
		) ) );

		register_rest_route( self::NS, '/security/diagnostics', array_merge( $manage, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'diagnostics' ),
		) ) );

		register_rest_route( self::NS, '/security/firewall/live', array_merge( $manage, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'firewall_live' ),
		) ) );

		register_rest_route( self::NS, '/security/firewall/status', array_merge( $manage, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'firewall_status' ),
		) ) );

		register_rest_route( self::NS, '/security/firewall/blocks', array(
			array_merge( $manage, array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'list_blocks' ) ) ),
			array_merge( $manage, array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'add_block' ) ) ),
			array_merge( $manage, array( 'methods' => 'DELETE', 'callback' => array( __CLASS__, 'delete_block' ) ) ),
		) );

		register_rest_route( self::NS, '/security/firewall/allows', array(
			array_merge( $manage, array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'list_allows' ) ) ),
			array_merge( $manage, array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'add_allow' ) ) ),
			array_merge( $manage, array( 'methods' => 'DELETE', 'callback' => array( __CLASS__, 'delete_allow' ) ) ),
		) );

		register_rest_route( self::NS, '/security/firewall/rules', array(
			array_merge( $manage, array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'list_rules' ) ) ),
			array_merge( $manage, array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'save_rule' ) ) ),
			array_merge( $manage, array( 'methods' => 'PATCH', 'callback' => array( __CLASS__, 'save_rule' ) ) ),
			array_merge( $manage, array( 'methods' => 'DELETE', 'callback' => array( __CLASS__, 'delete_rule' ) ) ),
		) );

		register_rest_route( self::NS, '/security/firewall/rules/test', array_merge( $manage, array(
			'methods'  => 'POST',
			'callback' => array( __CLASS__, 'test_rule' ),
		) ) );

		register_rest_route( self::NS, '/security/firewall/learning/promote', array_merge( $manage, array(
			'methods'  => 'POST',
			'callback' => array( __CLASS__, 'promote_learning' ),
		) ) );

		register_rest_route( self::NS, '/security/scan', array(
			array_merge( $manage, array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'list_scans' ) ) ),
			array_merge( $manage, array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'start_scan' ) ) ),
		) );

		register_rest_route( self::NS, '/security/scan/(?P<id>\d+)', array_merge( $manage, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'get_scan' ),
		) ) );

		register_rest_route( self::NS, '/security/scan/(?P<id>\d+)/cancel', array_merge( $manage, array(
			'methods'  => 'POST',
			'callback' => array( __CLASS__, 'cancel_scan' ),
		) ) );

		register_rest_route( self::NS, '/security/findings', array_merge( $view, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'list_findings' ),
		) ) );

		register_rest_route( self::NS, '/security/findings/(?P<id>\d+)', array_merge( $manage, array(
			'methods'  => 'POST',
			'callback' => array( __CLASS__, 'update_finding' ),
		) ) );

		register_rest_route( self::NS, '/security/heal/preview', array_merge( $heal, array(
			'methods'  => 'POST',
			'callback' => array( __CLASS__, 'heal_preview' ),
		) ) );

		register_rest_route( self::NS, '/security/heal/apply', array_merge( $heal, array(
			'methods'  => 'POST',
			'callback' => array( __CLASS__, 'heal_apply' ),
		) ) );

		register_rest_route( self::NS, '/security/heal/rollback', array_merge( $heal, array(
			'methods'  => 'POST',
			'callback' => array( __CLASS__, 'heal_rollback' ),
		) ) );

		register_rest_route( self::NS, '/security/quarantine', array_merge( $heal, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'list_quarantine' ),
		) ) );

		register_rest_route( self::NS, '/security/quarantine/(?P<id>\d+)/restore', array_merge( $heal, array(
			'methods'  => 'POST',
			'callback' => array( __CLASS__, 'restore_quarantine' ),
		) ) );

		register_rest_route( self::NS, '/security/snapshots', array_merge( $heal, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'list_snapshots' ),
		) ) );

		register_rest_route( self::NS, '/security/feeds', array_merge( $manage, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'list_feeds' ),
		) ) );

		register_rest_route( self::NS, '/security/feeds/sync', array_merge( $manage, array(
			'methods'  => 'POST',
			'callback' => array( __CLASS__, 'sync_feeds' ),
		) ) );

		register_rest_route( self::NS, '/security/tools/(?P<tool>[a-z0-9\-]+)', array(
			array_merge( $manage, array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'tool_get' ) ) ),
			array_merge( $manage, array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'tool_post' ) ) ),
		) );

		register_rest_route( self::NS, '/security/reports', array(
			array_merge( $view, array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'list_reports' ) ) ),
			array_merge( $manage, array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'generate_report' ) ) ),
		) );

		register_rest_route( self::NS, '/security/reports/(?P<id>\d+)', array_merge( $view, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'get_report' ),
		) ) );

		register_rest_route( self::NS, '/security/audit', array_merge( $manage, array(
			'methods'  => 'GET',
			'callback' => array( __CLASS__, 'list_audit' ),
		) ) );

		register_rest_route( self::NS, '/security/incidents', array(
			array_merge( $view, array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'list_incidents' ) ) ),
			array_merge( $manage, array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'create_incident' ) ) ),
		) );

		register_rest_route( self::NS, '/security/2fa', array(
			array_merge( $manage, array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'twofa_status' ) ) ),
			array_merge( $manage, array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'twofa_action' ) ) ),
		) );

		register_rest_route( self::NS, '/security/unlock', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'unlock' ),
			'permission_callback' => '__return_true',
		) );
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function perm_view() {
		return self::check_cap( Webino_Dashboard_Security::CAP_VIEW );
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function perm_manage() {
		return self::check_cap( Webino_Dashboard_Security::CAP_MANAGE );
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function perm_heal() {
		return self::check_cap( Webino_Dashboard_Security::CAP_HEAL );
	}

	/**
	 * @param string $cap Capability.
	 * @return bool|WP_Error
	 */
	private static function check_cap( $cap ) {
		if ( ! Webino_Dashboard_Security::is_module_active() ) {
			return new WP_Error( 'module_inactive', 'Security module inactive', array( 'status' => 403 ) );
		}
		if ( ! current_user_can( $cap ) ) {
			return new WP_Error( 'forbidden', 'Insufficient capability', array( 'status' => 403 ) );
		}
		return true;
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function overview() {
		return rest_ensure_response( Webino_Shield_Reports::overview_kpis() );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function get_settings() {
		return rest_ensure_response( Webino_Dashboard_Security_Settings::mask_secrets( Webino_Dashboard_Security_Settings::get() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function save_settings( $req ) {
		$data = $req->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $req->get_params();
		}
		$out = Webino_Dashboard_Security_Settings::update( $data );
		Webino_Shield_Audit::write( 'settings_update', 'settings', 'security', array_keys( $data ) );
		return rest_ensure_response( $out );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function apply_profile( $req ) {
		$name = sanitize_key( (string) $req->get_param( 'profile' ) );
		$out  = Webino_Dashboard_Security_Settings::apply_profile( $name );
		Webino_Shield_Audit::write( 'profile_apply', 'settings', $name, array() );
		return rest_ensure_response( $out );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_schema() {
		return rest_ensure_response( Webino_Dashboard_Security_Settings::schema() );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function diagnostics() {
		return rest_ensure_response( array(
			'layers'    => Webino_Dashboard_Security_Install::layer_status(),
			'php'       => PHP_VERSION,
			'wp'        => get_bloginfo( 'version' ),
			'module'    => Webino_Dashboard_Security::SLUG,
			'wizard'    => ! Webino_Dashboard_Security_Install::is_wizard_completed(),
			'conflicts' => Webino_Shield_Tools::tool_compat( 'GET', array() ),
		) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function firewall_live( $req ) {
		global $wpdb;
		$since = gmdate( 'Y-m-d H:i:s', time() - (int) ( $req->get_param( 'seconds' ) ?: 300 ) );
		$table = Webino_Dashboard_Security_Db::table( 'events' );
		$rows  = $wpdb->get_results( $wpdb->prepare( "SELECT id, created_at, action, method, path, rule_id, country FROM {$table} WHERE created_at >= %s ORDER BY id DESC LIMIT 100", $since ), ARRAY_A );
		return rest_ensure_response( array( 'events' => self::mask_events( $rows ?: array() ) ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function firewall_status() {
		$s = Webino_Dashboard_Security_Settings::get();
		return rest_ensure_response( array(
			'layers'   => Webino_Dashboard_Security_Install::layer_status(),
			'mode'     => $s['waf']['mode'] ?? 'learning',
			'enabled'  => ! empty( $s['waf']['enabled'] ),
			'disabled' => Webino_Shield_Waf::is_disabled(),
		) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_blocks() {
		return rest_ensure_response( array( 'items' => Webino_Shield_Blocklist::list_blocks() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function add_block( $req ) {
		$type = sanitize_key( (string) $req->get_param( 'type' ) );
		$val  = sanitize_text_field( (string) $req->get_param( 'value' ) );
		if ( ! $val ) {
			return new WP_Error( 'validation', 'value required', array( 'status' => 422 ) );
		}
		$id = Webino_Shield_Blocklist::add_block( $type ?: 'ip', $val, (string) $req->get_param( 'reason' ), (int) $req->get_param( 'minutes' ) );
		return rest_ensure_response( array( 'id' => $id ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function delete_block( $req ) {
		Webino_Shield_Blocklist::delete_block( (int) $req->get_param( 'id' ) );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_allows() {
		return rest_ensure_response( array( 'items' => Webino_Shield_Blocklist::list_allows() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function add_allow( $req ) {
		$val = sanitize_text_field( (string) $req->get_param( 'value' ) );
		if ( ! $val ) {
			return new WP_Error( 'validation', 'value required', array( 'status' => 422 ) );
		}
		$id = Webino_Shield_Blocklist::add_allow( sanitize_key( (string) $req->get_param( 'type' ) ) ?: 'ip', $val, (string) $req->get_param( 'note' ) );
		return rest_ensure_response( array( 'id' => $id ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function delete_allow( $req ) {
		Webino_Shield_Blocklist::delete_allow( (int) $req->get_param( 'id' ) );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_rules() {
		global $wpdb;
		$table = Webino_Dashboard_Security_Db::table( 'rules' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY priority ASC", ARRAY_A );
		return rest_ensure_response( array( 'items' => $rows ?: array() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function save_rule( $req ) {
		$data = $req->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $req->get_params();
		}
		$id = Webino_Shield_Rules::save_rule( $data );
		return rest_ensure_response( array( 'id' => $id ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function delete_rule( $req ) {
		Webino_Shield_Rules::delete_rule( (int) $req->get_param( 'id' ) );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function test_rule( $req ) {
		$data = $req->get_json_params();
		$rule = is_array( $data ) && isset( $data['rule'] ) ? $data['rule'] : array();
		$request = is_array( $data ) && isset( $data['request'] ) ? $data['request'] : Webino_Shield_Waf::normalize_request();
		return rest_ensure_response( Webino_Shield_Rules::test_rule( $request, $rule ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function promote_learning( $req ) {
		$ok = Webino_Shield_Rules::promote_learning( (string) $req->get_param( 'rule_id' ) );
		return rest_ensure_response( array( 'ok' => $ok ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_scans() {
		return rest_ensure_response( array( 'items' => Webino_Shield_Scanner::list_scans() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function start_scan( $req ) {
		$id = Webino_Shield_Scanner::start( (string) $req->get_param( 'profile' ) );
		wp_schedule_single_event( time() + 5, Webino_Shield_Scanner::CRON_HOOK, array( $id ) );
		return rest_ensure_response( array( 'id' => $id ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_scan( $req ) {
		$scan = Webino_Shield_Scanner::get( (int) $req['id'] );
		if ( ! $scan ) {
			return new WP_Error( 'not_found', 'Scan not found', array( 'status' => 404 ) );
		}
		return rest_ensure_response( $scan );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function cancel_scan( $req ) {
		Webino_Shield_Scanner::cancel( (int) $req['id'] );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function list_findings( $req ) {
		global $wpdb;
		$table   = Webino_Dashboard_Security_Db::table( 'findings' );
		$where   = array( '1=1' );
		$args    = array();
		$scan_id = (int) $req->get_param( 'scan_id' );
		if ( $scan_id > 0 ) {
			$where[] = 'scan_id = %d';
			$args[]  = $scan_id;
		}
		if ( $req->get_param( 'status' ) ) {
			$where[] = 'status = %s';
			$args[]  = sanitize_key( (string) $req->get_param( 'status' ) );
		}
		if ( $req->get_param( 'severity' ) ) {
			$where[] = 'severity = %s';
			$args[]  = sanitize_key( (string) $req->get_param( 'severity' ) );
		}
		$limit = $scan_id > 0 ? 500 : 100;
		$sql   = "SELECT * FROM {$table} WHERE " . implode( ' AND ', $where ) . " ORDER BY id DESC LIMIT {$limit}";
		$rows  = $args ? $wpdb->get_results( $wpdb->prepare( $sql, $args ), ARRAY_A ) : $wpdb->get_results( $sql, ARRAY_A );
		return rest_ensure_response( array( 'items' => $rows ?: array() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_finding( $req ) {
		$status = sanitize_key( (string) $req->get_param( 'status' ) );
		if ( ! in_array( $status, array( 'acknowledged', 'ignored', 'false_positive', 'fixed', 'healed' ), true ) ) {
			return new WP_Error( 'validation', 'Invalid status', array( 'status' => 422 ) );
		}
		global $wpdb;
		$wpdb->update(
			Webino_Dashboard_Security_Db::table( 'findings' ),
			array( 'status' => $status, 'updated_at' => current_time( 'mysql', true ) ),
			array( 'id' => (int) $req['id'] ),
			array( '%s', '%s' ),
			array( '%d' )
		);
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function heal_preview( $req ) {
		$data = $req->get_json_params();
		$actions = is_array( $data ) && isset( $data['actions'] ) ? $data['actions'] : $data;
		return rest_ensure_response( Webino_Shield_Heal::preview( (array) $actions ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function heal_apply( $req ) {
		$data = $req->get_json_params();
		return rest_ensure_response( Webino_Shield_Heal::apply( is_array( $data ) ? $data : array() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function heal_rollback( $req ) {
		$data = $req->get_json_params();
		$id   = (int) ( is_array( $data ) ? ( $data['snapshot_id'] ?? 0 ) : 0 );
		return rest_ensure_response( Webino_Shield_Heal::rollback( $id ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_quarantine() {
		return rest_ensure_response( array( 'items' => Webino_Shield_Heal::list_quarantine() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function restore_quarantine( $req ) {
		return rest_ensure_response( Webino_Shield_Heal::restore_quarantine( (int) $req['id'] ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_snapshots() {
		return rest_ensure_response( array( 'items' => Webino_Shield_Heal::list_snapshots() ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_feeds() {
		return rest_ensure_response( array( 'feeds' => Webino_Shield_Feeds::status() ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function sync_feeds() {
		return rest_ensure_response( Webino_Shield_Feeds::sync_all() );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function tool_get( $req ) {
		$result = Webino_Shield_Tools::handle( (string) $req['tool'], 'GET', $req->get_params() );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return rest_ensure_response( $result );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function tool_post( $req ) {
		$data = $req->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $req->get_params();
		}
		$result = Webino_Shield_Tools::handle( (string) $req['tool'], 'POST', $data );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return rest_ensure_response( $result );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_reports() {
		return rest_ensure_response( array( 'items' => Webino_Shield_Reports::list_reports() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function generate_report( $req ) {
		$type = sanitize_key( (string) $req->get_param( 'type' ) ) ?: 'executive';
		return rest_ensure_response( Webino_Shield_Reports::generate( $type ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_report( $req ) {
		$row = Webino_Shield_Reports::get_report( (int) $req['id'] );
		if ( ! $row ) {
		 return new WP_Error( 'not_found', 'Report not found', array( 'status' => 404 ) );
		}
		return rest_ensure_response( $row );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_audit() {
		return rest_ensure_response( array( 'items' => Webino_Shield_Audit::query() ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function list_incidents() {
		return rest_ensure_response( array( 'items' => Webino_Shield_Forensics::list_incidents() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function create_incident( $req ) {
		$data = $req->get_json_params();
		return rest_ensure_response( Webino_Shield_Forensics::create_incident( is_array( $data ) ? $data : array() ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function twofa_status() {
		$user_id = get_current_user_id();
		$summary = Webino_Shield_2FA::status_summary();
		$summary['current_user'] = array(
			'id'      => $user_id,
			'enabled' => Webino_Shield_2FA::is_enabled( $user_id ),
		);
		return rest_ensure_response( $summary );
	}

	/**
	 * TOTP setup / enable / disable for the current user (no WebAuthn stub).
	 *
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function twofa_action( $req ) {
		$data   = $req->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $req->get_params();
		}
		$action = sanitize_key( (string) ( $data['action'] ?? 'setup' ) );
		$user_id = get_current_user_id();
		if ( $user_id <= 0 ) {
			return new WP_Error( 'forbidden', 'Not authenticated', array( 'status' => 401 ) );
		}

		switch ( $action ) {
			case 'setup':
				return rest_ensure_response( Webino_Shield_2FA::setup( $user_id ) );
			case 'enable':
				$code = sanitize_text_field( (string) ( $data['code'] ?? '' ) );
				if ( '' === $code || ! Webino_Shield_2FA::verify_code( $user_id, $code ) ) {
					return new WP_Error( 'invalid_code', 'Invalid TOTP code', array( 'status' => 422 ) );
				}
				Webino_Shield_2FA::enable( $user_id );
				Webino_Shield_Audit::write( '2fa_enable', 'user', (string) $user_id, array() );
				return rest_ensure_response( array( 'ok' => true, 'enabled' => true ) );
			case 'disable':
				Webino_Shield_2FA::disable( $user_id );
				Webino_Shield_Audit::write( '2fa_disable', 'user', (string) $user_id, array() );
				return rest_ensure_response( array( 'ok' => true, 'enabled' => false ) );
			default:
				return new WP_Error( 'unknown_action', 'Unknown 2FA action', array( 'status' => 400 ) );
		}
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function unlock( $req ) {
		$token = sanitize_text_field( (string) $req->get_param( 'token' ) );
		if ( ! Webino_Dashboard_Security_Install::validate_unlock_token( $token ) ) {
			return new WP_Error( 'invalid_token', 'Invalid or expired unlock token', array( 'status' => 423 ) );
		}
		Webino_Dashboard_Security_Install::consume_unlock();
		return rest_ensure_response( array( 'ok' => true, 'message' => 'WAF bypass enabled via disable file' ) );
	}

	/**
	 * @param array<int,array<string,mixed>> $rows Events.
	 * @return array<int,array<string,mixed>>
	 */
	private static function mask_events( $rows ) {
		if ( current_user_can( Webino_Dashboard_Security::CAP_HEAL ) ) {
			return $rows;
		}
		$s = Webino_Dashboard_Security_Settings::get();
		if ( empty( $s['privacy']['anonymize_ip'] ) ) {
			return $rows;
		}
		foreach ( $rows as &$row ) {
			unset( $row['ip'] );
		}
		return $rows;
	}
}
