<?php
/**
 * Customer/staff support tickets.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Two-way tickets stored in custom tables.
 */
class Webino_Dashboard_Support_Tickets {

	const STATUSES = array( 'open', 'answered', 'pending', 'closed' );

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * @return string
	 */
	public static function tickets_table() {
		global $wpdb;
		return $wpdb->prefix . 'webino_support_tickets';
	}

	/**
	 * @return string
	 */
	public static function replies_table() {
		global $wpdb;
		return $wpdb->prefix . 'webino_support_replies';
	}

	/**
	 * @return void
	 */
	public static function ensure_tables() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset_collate = $wpdb->get_charset_collate();
		$tickets         = self::tickets_table();
		$replies         = self::replies_table();

		$sql_tickets = "CREATE TABLE {$tickets} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			subject varchar(190) NOT NULL,
			status varchar(20) NOT NULL DEFAULT 'open',
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY status (status)
		) {$charset_collate};";

		$sql_replies = "CREATE TABLE {$replies} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			ticket_id bigint(20) unsigned NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			is_staff tinyint(1) NOT NULL DEFAULT 0,
			body longtext NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY ticket_id (ticket_id)
		) {$charset_collate};";

		dbDelta( $sql_tickets );
		dbDelta( $sql_replies );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		$ns     = 'webino-dashboard/v1';
		$portal = static function () {
			return Webino_Dashboard_Rest_Base::has_account_portal();
		};
		$staff  = static function () {
			return Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' );
		};

		register_rest_route(
			$ns,
			'/account/tickets',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'account_list' ),
					'permission_callback' => $portal,
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'account_create' ),
					'permission_callback' => $portal,
				),
			)
		);

		register_rest_route(
			$ns,
			'/account/tickets/(?P<id>\d+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'account_get' ),
				'permission_callback' => $portal,
			)
		);

		register_rest_route(
			$ns,
			'/account/tickets/(?P<id>\d+)/replies',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'account_reply' ),
				'permission_callback' => $portal,
			)
		);

		register_rest_route(
			$ns,
			'/shop/tickets',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'staff_list' ),
				'permission_callback' => $staff,
			)
		);

		register_rest_route(
			$ns,
			'/shop/tickets/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'staff_get' ),
					'permission_callback' => $staff,
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'staff_patch' ),
					'permission_callback' => $staff,
				),
			)
		);

		register_rest_route(
			$ns,
			'/shop/tickets/(?P<id>\d+)/replies',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'staff_reply' ),
				'permission_callback' => $staff,
			)
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @return int
	 */
	public static function open_count_for_user( $user_id ) {
		global $wpdb;
		self::ensure_tables();
		$user_id = (int) $user_id;
		if ( $user_id < 1 ) {
			return 0;
		}
		$table = self::tickets_table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE user_id = %d AND status != %s",
				$user_id,
				'closed'
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function account_list( WP_REST_Request $request ) {
		return new WP_REST_Response( self::list_tickets( get_current_user_id(), $request, false ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function account_create( WP_REST_Request $request ) {
		$body    = $request->get_json_params();
		$body    = is_array( $body ) ? $body : array();
		$subject = sanitize_text_field( (string) ( $body['subject'] ?? '' ) );
		$content = sanitize_textarea_field( (string) ( $body['body'] ?? '' ) );
		if ( '' === $subject || '' === $content ) {
			return new WP_Error( 'ticket_required', __( 'Subject and message are required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$ticket = self::insert_ticket( get_current_user_id(), $subject, $content, false );
		if ( is_wp_error( $ticket ) ) {
			return $ticket;
		}
		return new WP_REST_Response( $ticket, 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function account_get( WP_REST_Request $request ) {
		$ticket = self::get_ticket( (int) $request['id'] );
		if ( ! $ticket || (int) $ticket['user_id'] !== get_current_user_id() ) {
			return new WP_Error( 'not_found', __( 'Not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$ticket['replies'] = self::list_replies( (int) $ticket['id'] );
		return new WP_REST_Response( $ticket );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function account_reply( WP_REST_Request $request ) {
		$ticket = self::get_ticket( (int) $request['id'] );
		if ( ! $ticket || (int) $ticket['user_id'] !== get_current_user_id() ) {
			return new WP_Error( 'not_found', __( 'Not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( 'closed' === $ticket['status'] ) {
			return new WP_Error( 'ticket_closed', __( 'This ticket is closed.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$body = $request->get_json_params();
		$body = is_array( $body ) ? $body : array();
		$text = sanitize_textarea_field( (string) ( $body['body'] ?? '' ) );
		if ( '' === $text ) {
			return new WP_Error( 'ticket_required', __( 'Message is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		self::insert_reply( (int) $ticket['id'], get_current_user_id(), $text, false );
		self::set_status( (int) $ticket['id'], 'pending' );
		return self::account_get( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function staff_list( WP_REST_Request $request ) {
		return new WP_REST_Response( self::list_tickets( 0, $request, true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function staff_get( WP_REST_Request $request ) {
		$ticket = self::get_ticket( (int) $request['id'] );
		if ( ! $ticket ) {
			return new WP_Error( 'not_found', __( 'Not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$ticket['replies'] = self::list_replies( (int) $ticket['id'] );
		return new WP_REST_Response( $ticket );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function staff_patch( WP_REST_Request $request ) {
		$ticket = self::get_ticket( (int) $request['id'] );
		if ( ! $ticket ) {
			return new WP_Error( 'not_found', __( 'Not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body   = $request->get_json_params();
		$body   = is_array( $body ) ? $body : array();
		$status = sanitize_key( (string) ( $body['status'] ?? '' ) );
		if ( ! in_array( $status, self::STATUSES, true ) ) {
			return new WP_Error( 'invalid_status', __( 'Invalid status.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		self::set_status( (int) $ticket['id'], $status );
		return self::staff_get( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function staff_reply( WP_REST_Request $request ) {
		$ticket = self::get_ticket( (int) $request['id'] );
		if ( ! $ticket ) {
			return new WP_Error( 'not_found', __( 'Not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body = $request->get_json_params();
		$body = is_array( $body ) ? $body : array();
		$text = sanitize_textarea_field( (string) ( $body['body'] ?? '' ) );
		if ( '' === $text ) {
			return new WP_Error( 'ticket_required', __( 'Message is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		self::insert_reply( (int) $ticket['id'], get_current_user_id(), $text, true );
		self::set_status( (int) $ticket['id'], 'answered' );
		if ( class_exists( 'Webino_Dashboard_Notifications', false ) ) {
			$link = '/account/tickets/' . (int) $ticket['id'];
			Webino_Dashboard_Notifications::create(
				(int) $ticket['user_id'],
				'ticket',
				__( 'Support replied to your ticket', 'webino-dashboard' ),
				$ticket['subject'],
				$link
			);
		}
		return self::staff_get( $request );
	}

	/**
	 * @param int             $user_id User ID or 0 for all.
	 * @param WP_REST_Request $request Request.
	 * @param bool            $staff   Include user display fields.
	 * @return array<string, mixed>
	 */
	private static function list_tickets( $user_id, WP_REST_Request $request, $staff ) {
		global $wpdb;
		self::ensure_tables();
		$page     = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$per_page = min( 50, max( 1, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$offset   = ( $page - 1 ) * $per_page;
		$status   = sanitize_key( (string) $request->get_param( 'status' ) );
		$search   = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$table    = self::tickets_table();

		$where  = array( '1=1' );
		$params = array();
		if ( $user_id > 0 ) {
			$where[]  = 't.user_id = %d';
			$params[] = (int) $user_id;
		}
		if ( '' !== $status && 'all' !== $status && in_array( $status, self::STATUSES, true ) ) {
			$where[]  = 't.status = %s';
			$params[] = $status;
		}
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$where[]  = 't.subject LIKE %s';
			$params[] = $like;
		}
		$where_sql = implode( ' AND ', $where );

		$count_sql = "SELECT COUNT(*) FROM {$table} t WHERE {$where_sql}";
		$list_sql  = "SELECT t.* FROM {$table} t WHERE {$where_sql} ORDER BY t.updated_at DESC, t.id DESC LIMIT %d OFFSET %d";

		if ( $params ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			$total = (int) $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) );
			$list_params = array_merge( $params, array( $per_page, $offset ) );
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			$rows = $wpdb->get_results( $wpdb->prepare( $list_sql, $list_params ), ARRAY_A );
		} else {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			$total = (int) $wpdb->get_var( $count_sql );
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			$rows = $wpdb->get_results( $wpdb->prepare( $list_sql, $per_page, $offset ), ARRAY_A );
		}

		$items = array();
		foreach ( (array) $rows as $row ) {
			$items[] = self::map_ticket( $row, $staff );
		}
		return array(
			'items' => $items,
			'total' => $total,
			'page'  => $page,
		);
	}

	/**
	 * @param int    $user_id User ID.
	 * @param string $subject Subject.
	 * @param string $body    First message.
	 * @param bool   $staff   Whether opener is staff.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function insert_ticket( $user_id, $subject, $body, $staff ) {
		global $wpdb;
		self::ensure_tables();
		$now = current_time( 'mysql' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$ok = $wpdb->insert(
			self::tickets_table(),
			array(
				'user_id'    => (int) $user_id,
				'subject'    => $subject,
				'status'     => 'open',
				'created_at' => $now,
				'updated_at' => $now,
			),
			array( '%d', '%s', '%s', '%s', '%s' )
		);
		if ( ! $ok ) {
			return new WP_Error( 'db_error', __( 'Could not create ticket.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$id = (int) $wpdb->insert_id;
		self::insert_reply( $id, (int) $user_id, $body, $staff );
		$ticket            = self::get_ticket( $id );
		$ticket['replies'] = self::list_replies( $id );
		return $ticket;
	}

	/**
	 * @param int    $ticket_id Ticket ID.
	 * @param int    $user_id   Author.
	 * @param string $body      Message.
	 * @param bool   $is_staff  Staff flag.
	 * @return int
	 */
	private static function insert_reply( $ticket_id, $user_id, $body, $is_staff ) {
		global $wpdb;
		self::ensure_tables();
		$now = current_time( 'mysql' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->insert(
			self::replies_table(),
			array(
				'ticket_id'  => (int) $ticket_id,
				'user_id'    => (int) $user_id,
				'is_staff'   => $is_staff ? 1 : 0,
				'body'       => $body,
				'created_at' => $now,
			),
			array( '%d', '%d', '%d', '%s', '%s' )
		);
		self::touch( $ticket_id, $now );
		return (int) $wpdb->insert_id;
	}

	/**
	 * @param int    $ticket_id Ticket ID.
	 * @param string $status    Status.
	 * @return void
	 */
	private static function set_status( $ticket_id, $status ) {
		global $wpdb;
		self::ensure_tables();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			self::tickets_table(),
			array(
				'status'     => $status,
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => (int) $ticket_id ),
			array( '%s', '%s' ),
			array( '%d' )
		);
	}

	/**
	 * @param int    $ticket_id Ticket ID.
	 * @param string $now       Datetime.
	 * @return void
	 */
	private static function touch( $ticket_id, $now ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			self::tickets_table(),
			array( 'updated_at' => $now ),
			array( 'id' => (int) $ticket_id ),
			array( '%s' ),
			array( '%d' )
		);
	}

	/**
	 * @param int $id Ticket ID.
	 * @return array<string, mixed>|null
	 */
	private static function get_ticket( $id ) {
		global $wpdb;
		self::ensure_tables();
		$table = self::tickets_table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", (int) $id ),
			ARRAY_A
		);
		if ( ! is_array( $row ) ) {
			return null;
		}
		return self::map_ticket( $row, true );
	}

	/**
	 * @param int $ticket_id Ticket ID.
	 * @return list<array<string, mixed>>
	 */
	private static function list_replies( $ticket_id ) {
		global $wpdb;
		self::ensure_tables();
		$table = self::replies_table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE ticket_id = %d ORDER BY id ASC",
				(int) $ticket_id
			),
			ARRAY_A
		);
		$out = array();
		foreach ( (array) $rows as $row ) {
			$user = get_userdata( (int) $row['user_id'] );
			$out[] = array(
				'id'         => (int) $row['id'],
				'ticket_id'  => (int) $row['ticket_id'],
				'user_id'    => (int) $row['user_id'],
				'author'     => $user ? $user->display_name : '',
				'is_staff'   => (int) $row['is_staff'] === 1,
				'body'       => (string) $row['body'],
				'created_at' => (string) $row['created_at'],
			);
		}
		return $out;
	}

	/**
	 * @param array<string, mixed> $row   Raw row.
	 * @param bool                 $staff Include user fields.
	 * @return array<string, mixed>
	 */
	private static function map_ticket( $row, $staff ) {
		$uid  = (int) $row['user_id'];
		$user = $staff ? get_userdata( $uid ) : null;
		$out  = array(
			'id'         => (int) $row['id'],
			'user_id'    => $uid,
			'subject'    => (string) $row['subject'],
			'status'     => (string) $row['status'],
			'created_at' => (string) $row['created_at'],
			'updated_at' => (string) $row['updated_at'],
		);
		if ( $staff ) {
			$out['user_name']  = $user ? $user->display_name : '';
			$out['user_email'] = $user ? $user->user_email : '';
		}
		return $out;
	}
}
