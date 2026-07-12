<?php
/**
 * REST for embedded Bale / Telegram bot management (dashboard SPA).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers webino-dashboard/v1/bots/{bale|telegram}/* management routes.
 */
final class Webino_Dashboard_REST_Bots {

	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		if ( ! class_exists( 'WooCommerce', false ) ) {
			return;
		}

		foreach ( array( 'bale', 'telegram' ) as $which ) {
			$ctx = Webino_Dashboard_Bots_REST_Context::resolve( $which );
			if ( null === $ctx ) {
				continue;
			}
			$mod = $ctx['module_id'];
			$pre = $ctx['pre'];

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/dashboard-stats',
				array(
					'methods'             => 'GET',
					'callback'            => function () use ( $which, $mod ) {
						return self::dashboard_stats( $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/users',
				array(
					'methods'             => 'GET',
					'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
						return self::users_list( $req, $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/users/import',
				array(
					'methods'             => 'POST',
					'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
						return self::users_import( $req, $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/broadcast',
				array(
					'methods'             => 'GET',
					'callback'            => function () use ( $which, $mod ) {
						return self::broadcast_get( $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/broadcast/start',
				array(
					'methods'             => 'POST',
					'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
						return self::broadcast_start( $req, $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/broadcast/cancel',
				array(
					'methods'             => 'POST',
					'callback'            => function () use ( $which, $mod ) {
						return self::broadcast_cancel( $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/logs',
				array(
					'methods'             => 'GET',
					'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
						return self::logs_get( $req, $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/campaigns',
				array(
					array(
						'methods'             => 'GET',
						'callback'            => function () use ( $which, $mod ) {
							return self::campaigns_get( $which, $mod );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
					array(
						'methods'             => 'POST',
						'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
							return self::campaigns_post( $req, $which, $mod );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/settings',
				array(
					array(
						'methods'             => 'GET',
						'callback'            => function () use ( $which, $mod ) {
							return self::settings_get( $which, $mod );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
					array(
						'methods'             => array( 'POST', 'PUT', 'PATCH' ),
						'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
							return self::settings_post( $req, $which, $mod );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/webhook-urls',
				array(
					'methods'             => 'GET',
					'callback'            => function () use ( $pre ) {
						return new WP_REST_Response(
							array(
								'rest_webhook' => esc_url_raw( rest_url( self::NS . '/bots/' . $pre . '/webhook' ) ),
								'health_url'   => esc_url_raw( rest_url( self::NS . '/bots/' . $pre . '/health' ) ),
							)
						);
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/set-webhook',
				array(
					'methods'             => 'POST',
					'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
						return self::set_webhook( $req, $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/delete-webhook',
				array(
					'methods'             => 'POST',
					'callback'            => function () use ( $which, $mod ) {
						return self::delete_webhook( $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);
		}
	}

	/**
	 * @param string $module_id Module id (bale-bot|telegram-bot).
	 * @return bool|WP_Error
	 */
	private static function perm_manage( $module_id ) {
		if ( ! Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' ) ) {
			return false;
		}
		if ( ! Webino_Dashboard_Modules::is_module_enabled( $module_id ) ) {
			return new WP_Error(
				'webino_module_disabled',
				__( 'This dashboard module is disabled.', 'webino-dashboard' ),
				array( 'status' => 403 )
			);
		}
		return true;
	}

	/**
	 * Resolve bot REST context or return 503 when module unavailable.
	 *
	 * @param string $which bale|telegram.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function require_bot_ctx( $which ) {
		$ctx = Webino_Dashboard_Bots_REST_Context::resolve( $which );
		if ( ! is_array( $ctx ) ) {
			return new WP_Error( 'bots_unavailable', __( 'Bot module is not available.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		return $ctx;
	}

	/**
	 * @param string $which bale|telegram.
	 * @param string $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function dashboard_stats( $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = self::require_bot_ctx( $which );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$stats_class = $ctx['stats_class'];
		if ( ! is_string( $stats_class ) || ! class_exists( $stats_class ) ) {
			return new WP_Error( 'bots_unavailable', __( 'Bot engine is not loaded.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		/** @var class-string $stats_class */
		$users_n   = (int) $stats_class::count_linked_users();
		$orders_n  = (int) $stats_class::count_bale_orders_all();
		$orders_7d = (int) $stats_class::count_bale_orders_since( 7 );
		$sessions  = (int) $stats_class::count_sessions_active_hours( 24 );
		$sales_cmp = $stats_class::bale_sales_compare_periods( 30 );
		$recent_o  = $stats_class::recent_bale_orders( 8 );
		$recent_u  = $stats_class::recent_bale_users( 8 );

		$meta = $ctx['chat_meta_key'];

		$orders_out = array();
		foreach ( $recent_o as $order ) {
			if ( ! $order instanceof \WC_Order ) {
				continue;
			}
			$orders_out[] = array(
				'id'          => $order->get_id(),
				'number'      => $order->get_order_number(),
				'total_text'  => wp_strip_all_tags( $order->get_formatted_order_total() ),
				'status'      => $order->get_status(),
				'status_name' => wc_get_order_status_name( $order->get_status() ),
				'date'        => $order->get_date_created() ? $order->get_date_created()->date_i18n( get_option( 'date_format' ) ) : '',
				'edit_url'    => $order->get_edit_order_url(),
			);
		}

		$users_out = array();
		foreach ( $recent_u as $u ) {
			if ( ! $u instanceof \WP_User ) {
				continue;
			}
			$users_out[] = array(
				'id'           => $u->ID,
				'display_name' => $u->display_name,
				'email'        => $u->user_email,
				'phone'        => (string) get_user_meta( $u->ID, 'billing_phone', true ),
				'chat_id'      => (string) get_user_meta( $u->ID, $meta, true ),
				'edit_url'     => get_edit_user_link( $u->ID ),
			);
		}

		return new WP_REST_Response(
			array(
				'users_linked'  => $users_n,
				'orders_all'    => $orders_n,
				'orders_7d'     => $orders_7d,
				'sessions_24h'  => $sessions,
				'sales_compare' => array(
					'days'     => (int) ( $sales_cmp['days'] ?? 30 ),
					'current'  => array(
						'count'      => (int) ( $sales_cmp['current']['count'] ?? 0 ),
						'total'      => (float) ( $sales_cmp['current']['total'] ?? 0 ),
						'total_text' => function_exists( 'wc_price' )
							? wp_strip_all_tags( wc_price( (float) ( $sales_cmp['current']['total'] ?? 0 ) ) )
							: '',
					),
					'previous' => array(
						'count'      => (int) ( $sales_cmp['previous']['count'] ?? 0 ),
						'total'      => (float) ( $sales_cmp['previous']['total'] ?? 0 ),
						'total_text' => function_exists( 'wc_price' )
							? wp_strip_all_tags( wc_price( (float) ( $sales_cmp['previous']['total'] ?? 0 ) ) )
							: '',
					),
				),
				'recent_orders' => $orders_out,
				'recent_users'  => $users_out,
			)
		);
	}

	/**
	 * @param WP_REST_Request $req   Request.
	 * @param string          $which bale|telegram.
	 * @param string          $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function users_list( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = self::require_bot_ctx( $which );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$meta = $ctx['chat_meta_key'];

		$page   = max( 1, (int) $req->get_param( 'page' ) );
		$search = sanitize_text_field( (string) $req->get_param( 'search' ) );

		$base_meta = array(
			'relation' => 'AND',
			array(
				'key'     => $meta,
				'compare' => 'EXISTS',
			),
			array(
				'key'     => $meta,
				'value'   => '',
				'compare' => '!=',
			),
		);

		$args = array(
			'meta_query' => $base_meta,
			'number'     => 30,
			'paged'      => $page,
			'orderby'    => 'registered',
			'order'      => 'DESC',
			'fields'     => 'all',
		);
		if ( $search !== '' ) {
			$args['search']         = '*' . $search . '*';
			$args['search_columns'] = array( 'user_login', 'user_email', 'display_name' );
		}

		$users = get_users( $args );
		$out   = array();
		foreach ( $users as $u ) {
			if ( ! $u instanceof \WP_User ) {
				continue;
			}
			$out[] = array(
				'id'           => $u->ID,
				'display_name' => $u->display_name,
				'email'        => $u->user_email,
				'phone'        => (string) get_user_meta( $u->ID, 'billing_phone', true ),
				'chat_id'      => (string) get_user_meta( $u->ID, $meta, true ),
			);
		}

		$count_args = array(
			'meta_query'  => $base_meta,
			'count_total' => true,
			'fields'      => 'ids',
			'number'      => 1,
		);
		if ( $search !== '' ) {
			$count_args['search']         = '*' . $search . '*';
			$count_args['search_columns'] = array( 'user_login', 'user_email', 'display_name' );
		}
		$count_query = new \WP_User_Query( $count_args );
		$total_users = (int) $count_query->get_total();

		return new WP_REST_Response(
			array(
				'users'       => $out,
				'page'        => $page,
				'per_page'    => 30,
				'total_users' => $total_users,
			)
		);
	}

	/**
	 * @param WP_REST_Request $req   Request.
	 * @param string          $which bale|telegram.
	 * @param string          $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function users_import( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = self::require_bot_ctx( $which );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$plugin_class = $ctx['plugin_class'];
		/** @var class-string $plugin_class */
		if ( ! $plugin_class::has_feature( 'campaigns' ) ) {
			return new WP_Error( 'campaigns_disabled', __( 'This feature is only available on the advanced plan.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		$files = $req->get_file_params();
		$tmp = isset( $files['contacts_csv']['tmp_name'] ) ? (string) $files['contacts_csv']['tmp_name'] : '';
		if ( $tmp === '' || ! is_readable( $tmp ) ) {
			return new WP_Error( 'no_file', __( 'CSV file was not uploaded.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$file = $tmp;
		$fh   = fopen( $file, 'r' );
		if ( ! $fh ) {
			return new WP_Error( 'read_fail', __( 'Could not read the uploaded file.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$stats = array(
			'total'     => 0,
			'matched'   => 0,
			'invalid'   => 0,
			'duplicate' => 0,
			'not_found' => 0,
		);
		$user_ids = array();

		if ( 'telegram' === $which ) {
			$norm = \Webino_Dashboard_Bots_Telegram\Util\PhoneNormalizer::class;
			$res  = \Webino_Dashboard_Bots_Telegram\Util\UserResolver::class;
		} else {
			$norm = \Webino_Dashboard_Bots_Bale\Util\PhoneNormalizer::class;
			$res  = \Webino_Dashboard_Bots_Bale\Util\UserResolver::class;
		}

		while ( ( $row = fgetcsv( $fh ) ) !== false ) {
			if ( empty( $row ) || ! isset( $row[0] ) ) {
				continue;
			}
			$raw = trim( (string) $row[0] );
			if ( $raw === '' ) {
				continue;
			}
			++$stats['total'];
			$phone = $norm::normalize( $raw );
			if ( strlen( $phone ) < 10 ) {
				++$stats['invalid'];
				continue;
			}
			$user = $res::find_user_by_phone( $phone );
			if ( ! $user ) {
				++$stats['not_found'];
				continue;
			}
			$uid = (int) $user->ID;
			if ( in_array( $uid, $user_ids, true ) ) {
				++$stats['duplicate'];
				continue;
			}
			$user_ids[] = $uid;
			++$stats['matched'];
		}
		fclose( $fh );

		Webino_Dashboard_Bots_REST_Context::merge_imported_user_ids( $which, $user_ids );

		return new WP_REST_Response( array_merge( array( 'ok' => true ), $stats ) );
	}

	/**
	 * @param string $which bale|telegram.
	 * @param string $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function broadcast_get( $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = self::require_bot_ctx( $which );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$broadcast_class  = $ctx['broadcast_class'];
		$plugin_class     = $ctx['plugin_class'];
		/** @var class-string $broadcast_class */
		/** @var class-string $plugin_class */
		$job = $broadcast_class::get_job();
		return new WP_REST_Response(
			array(
				'job'                => $job,
				'advanced_media'     => (bool) $plugin_class::has_feature( 'advanced_media' ),
				'campaigns_feature'  => (bool) $plugin_class::has_feature( 'campaigns' ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $req   Request.
	 * @param string          $which bale|telegram.
	 * @param string          $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function broadcast_start( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = self::require_bot_ctx( $which );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$broadcast_class = $ctx['broadcast_class'];
		$plugin_class    = $ctx['plugin_class'];
		/** @var class-string $broadcast_class */
		/** @var class-string $plugin_class */

		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$text  = isset( $params['text'] ) ? (string) $params['text'] : ( isset( $params['broadcast_text'] ) ? (string) $params['broadcast_text'] : '' );
		$type  = isset( $params['type'] ) ? sanitize_key( (string) $params['type'] ) : ( isset( $params['broadcast_type'] ) ? sanitize_key( (string) $params['broadcast_type'] ) : 'text' );
		$media = isset( $params['media'] ) ? sanitize_text_field( (string) $params['media'] ) : ( isset( $params['broadcast_media'] ) ? sanitize_text_field( (string) $params['broadcast_media'] ) : '' );

		if ( $type !== 'text' && ! $plugin_class::has_feature( 'advanced_media' ) ) {
			return new WP_REST_Response(
				array(
					'ok'    => false,
					'error' => __( 'Media broadcast is only available on the advanced plan.', 'webino-dashboard' ),
				),
				400
			);
		}

		$payload = array(
			'type'    => $type,
			'text'    => $text,
			'caption' => $text,
			'media'   => $media,
		);
		$res     = $broadcast_class::start( $payload );
		$status  = ! empty( $res['ok'] ) ? 200 : 400;
		return new WP_REST_Response( $res, $status );
	}

	/**
	 * @param string $which bale|telegram.
	 * @param string $mod   Module id.
	 * @return WP_REST_Response
	 */
	private static function broadcast_cancel( $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = self::require_bot_ctx( $which );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$broadcast_class = $ctx['broadcast_class'];
		/** @var class-string $broadcast_class */
		$broadcast_class::cancel();
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $req   Request.
	 * @param string          $which bale|telegram.
	 * @param string          $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function logs_get( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = self::require_bot_ctx( $which );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$activity_class = $ctx['activity_class'];
		/** @var class-string $activity_class */
		$from = $req->get_param( 'from' );
		$to   = $req->get_param( 'to' );
		$ch   = $req->get_param( 'channel' );
		$from_ts = ( $from !== null && $from !== '' ) ? absint( $from ) : null;
		$to_ts   = ( $to !== null && $to !== '' ) ? absint( $to ) : null;
		$channel = ( $ch !== null && $ch !== '' ) ? sanitize_key( (string) $ch ) : null;
		if ( $channel === '' ) {
			$channel = null;
		}

		$entries = $activity_class::get_entries( $from_ts, $to_ts, $channel );
		return new WP_REST_Response( array( 'entries' => $entries ) );
	}

	/**
	 * @param string $which bale|telegram.
	 * @param string $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function campaigns_get( $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = self::require_bot_ctx( $which );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$plugin_class   = $ctx['plugin_class'];
		$campaign_class = $ctx['campaign_class'];
		/** @var class-string $plugin_class */
		/** @var class-string $campaign_class */
		$enabled = (bool) $plugin_class::has_feature( 'campaigns' );
		$items   = array_reverse( $campaign_class::all() );
		return new WP_REST_Response(
			array(
				'enabled' => $enabled,
				'items'   => $items,
			)
		);
	}

	/**
	 * @param WP_REST_Request $req   Request.
	 * @param string          $which bale|telegram.
	 * @param string          $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function campaigns_post( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = self::require_bot_ctx( $which );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$plugin_class   = $ctx['plugin_class'];
		$campaign_class = $ctx['campaign_class'];
		/** @var class-string $plugin_class */
		/** @var class-string $campaign_class */

		if ( ! $plugin_class::has_feature( 'campaigns' ) ) {
			return new WP_Error( 'campaigns_disabled', __( 'This feature is only available on the advanced plan.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}

		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		$name = isset( $params['name'] ) ? sanitize_text_field( (string) $params['name'] ) : '';
		if ( $name === '' ) {
			return new WP_Error( 'invalid_name', __( 'Campaign name is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$type = isset( $params['type'] ) ? sanitize_key( (string) $params['type'] ) : 'text';
		$text = isset( $params['text'] ) ? wp_kses_post( (string) $params['text'] ) : '';
		$media = isset( $params['media'] ) ? sanitize_text_field( (string) $params['media'] ) : '';
		if ( $type !== 'text' && ! $plugin_class::has_feature( 'advanced_media' ) ) {
			return new WP_Error( 'media_plan', __( 'Media broadcast is only available on the advanced plan.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$audience = isset( $params['audience'] ) ? sanitize_key( (string) $params['audience'] ) : 'all';
		$scheduled_at = 0;
		if ( isset( $params['scheduled_at'] ) && is_numeric( $params['scheduled_at'] ) ) {
			$scheduled_at = absint( $params['scheduled_at'] );
		}
		if ( $scheduled_at <= 0 ) {
			$schedule = isset( $params['schedule'] ) ? (string) $params['schedule'] : '';
			$parsed     = $schedule !== '' ? strtotime( $schedule ) : false;
			$scheduled_at = $parsed ? (int) $parsed : time() + 60;
		}

		$payload = array(
			'type'    => $type,
			'text'    => $text,
			'caption' => $text,
			'media'   => $media,
		);

		$user_ids = 'imported' === $audience
			? Webino_Dashboard_Bots_REST_Context::get_imported_user_ids( $which )
			: array();

		$campaign_id = $campaign_class::create( $name, $scheduled_at, $payload, $user_ids );
		$hook        = $campaign_class::HOOK_LAUNCH;
		if ( ! wp_next_scheduled( $hook, array( $campaign_id ) ) ) {
			wp_schedule_single_event( $scheduled_at, $hook, array( $campaign_id ) );
		}

		return new WP_REST_Response(
			array(
				'ok'          => true,
				'campaign_id' => $campaign_id,
			)
		);
	}

	/**
	 * @param string $which bale|telegram.
	 * @param string $mod   Module id.
	 * @return WP_REST_Response
	 */
	private static function settings_get( $which, $mod ) {
		unset( $mod );
		$raw = self::get_settings_array( $which );
		$out = self::mask_secrets( $raw );
		return new WP_REST_Response( $out );
	}

	/**
	 * @param WP_REST_Request $req   Request.
	 * @param string          $which bale|telegram.
	 * @param string          $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function settings_post( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		foreach ( array( 'bot_token', 'provider_token', 'bot_token_sandbox' ) as $secret_key ) {
			if ( isset( $params[ $secret_key ] ) && is_string( $params[ $secret_key ] ) && false !== strpos( $params[ $secret_key ], '…' ) ) {
				unset( $params[ $secret_key ] );
			}
		}

		if ( 'telegram' === $which ) {
			$merged = \Webino_Dashboard_Bots_Telegram\Admin\SettingsPage::instance()->sanitize_settings( $params );
			\Webino_Dashboard_Bots_Telegram\Core\Plugin::update_settings( $merged );
		} else {
			$merged = \Webino_Dashboard_Bots_Bale\Admin\SettingsPage::instance()->sanitize_settings( $params );
			\Webino_Dashboard_Bots_Bale\Core\Plugin::update_settings( $merged );
		}

		return new WP_REST_Response( self::mask_secrets( self::get_settings_array( $which ) ) );
	}

	/**
	 * @param WP_REST_Request $req   Request (optional body url override).
	 * @param string          $which bale|telegram.
	 * @param string          $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function set_webhook( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		$client = self::client( $which );
		if ( null === $client ) {
			return new WP_Error( 'no_token', __( 'Bot token is not set.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$params = $req->get_json_params();
		$url    = is_array( $params ) && ! empty( $params['url'] ) ? esc_url_raw( (string) $params['url'] ) : '';
		if ( '' === $url ) {
			$pre = 'bale' === $which ? 'bale' : 'telegram';
			$url = esc_url_raw( rest_url( self::NS . '/bots/' . $pre . '/webhook' ) );
		}
		$s      = self::get_settings_array( $which );
		$secret = isset( $s['webhook_secret'] ) ? trim( (string) $s['webhook_secret'] ) : '';
		$res    = $client->set_webhook( $url, $secret !== '' ? $secret : null );
		if ( ! is_array( $res ) || empty( $res['ok'] ) ) {
			$err_cls = 'telegram' === $which ? \Webino_Dashboard_Bots_Telegram\Bale\Client::class : \Webino_Dashboard_Bots_Bale\Bale\Client::class;
			return new WP_Error(
				'webhook_set_failed',
				$err_cls::summarize_error( $res ),
				array( 'status' => 400 )
			);
		}
		update_option( 'webino_dashboard_' . $which . '_webhook_configured', '1', false );
		return new WP_REST_Response( array( 'ok' => true, 'result' => $res ) );
	}

	/**
	 * @param string $which bale|telegram.
	 * @param string $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function delete_webhook( $which, $mod ) {
		unset( $mod );
		$client = self::client( $which );
		if ( null === $client ) {
			return new WP_Error( 'no_token', __( 'Bot token is not set.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$res = $client->delete_webhook();
		if ( ! is_array( $res ) || empty( $res['ok'] ) ) {
			$err_cls = 'telegram' === $which ? \Webino_Dashboard_Bots_Telegram\Bale\Client::class : \Webino_Dashboard_Bots_Bale\Bale\Client::class;
			return new WP_Error(
				'webhook_delete_failed',
				$err_cls::summarize_error( $res ),
				array( 'status' => 400 )
			);
		}
		delete_option( 'webino_dashboard_' . $which . '_webhook_configured' );
		return new WP_REST_Response( array( 'ok' => true, 'result' => $res ) );
	}

	/**
	 * @param string $which bale|telegram.
	 * @return \Webino_Dashboard_Bots_Bale\Bale\Client|\Webino_Dashboard_Bots_Telegram\Bale\Client|null
	 */
	private static function client( $which ) {
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		if ( 'telegram' === $which ) {
			$t = \Webino_Dashboard_Bots_Telegram\Core\Plugin::get_bot_token();
			if ( '' === trim( $t ) ) {
				return null;
			}
			return new \Webino_Dashboard_Bots_Telegram\Bale\Client( $t );
		}
		$t = \Webino_Dashboard_Bots_Bale\Core\Plugin::get_bot_token();
		if ( '' === trim( $t ) ) {
			return null;
		}
		return new \Webino_Dashboard_Bots_Bale\Bale\Client( $t );
	}

	/**
	 * @param string $which bale|telegram.
	 * @return array<string,mixed>
	 */
	private static function get_settings_array( $which ) {
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		if ( 'telegram' === $which ) {
			return \Webino_Dashboard_Bots_Telegram\Core\Plugin::get_settings();
		}
		return \Webino_Dashboard_Bots_Bale\Core\Plugin::get_settings();
	}

	/**
	 * @param array<string,mixed> $s Settings.
	 * @return array<string,mixed>
	 */
	private static function mask_secrets( array $s ) {
		foreach ( array( 'bot_token', 'provider_token', 'bot_token_sandbox' ) as $k ) {
			if ( ! empty( $s[ $k ] ) && is_string( $s[ $k ] ) && strlen( $s[ $k ] ) > 6 ) {
				$s[ $k ] = substr( $s[ $k ], 0, 3 ) . '…' . substr( $s[ $k ], -3 );
			}
		}
		return $s;
	}
}
