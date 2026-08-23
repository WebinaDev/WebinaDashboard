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
	 * Strip WC price HTML and decode entities so SPA never shows literal &nbsp;.
	 *
	 * @param string $html Price HTML or plain text.
	 * @return string
	 */
	public static function sanitize_price_text( $html ) {
		$text = wp_strip_all_tags( (string) $html );
		$text = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$text = str_replace( array( "\xC2\xA0", '&nbsp;' ), ' ', $text );
		return trim( preg_replace( '/\s+/u', ' ', $text ) ?? $text );
	}

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
		// admin-ajax fallback when CDN/WAF blocks /wp-json/ for bot SPA pages.
		add_action( 'wp_ajax_webino_dashboard_bots_rest', array( __CLASS__, 'ajax_bots_rest' ) );
	}

	/**
	 * Whether a REST path under webino-dashboard/v1 is allowed via admin-ajax proxy.
	 * Blocks public webhook endpoints.
	 *
	 * @param string $path Path without leading slash, e.g. bots/bale/settings.
	 * @return bool
	 */
	private static function is_ajax_proxy_path_allowed( $path ) {
		$path = ltrim( (string) $path, '/' );
		$path = strtok( $path, '?' );
		if ( ! is_string( $path ) || $path === '' ) {
			return false;
		}
		// Never proxy inbound webhook or health probes (public / unauthenticated).
		if ( preg_match( '#^bots/(bale|telegram)/(webhook|health)(/|$)#', $path ) ) {
			return false;
		}
		if ( preg_match( '#^bots/(bale|telegram)/#', $path ) ) {
			return true;
		}
		if ( 0 === strpos( $path, 'bots/parity/' ) ) {
			return true;
		}
		return false;
	}

	/**
	 * admin-ajax proxy for bots/* REST (WAF-safe). Always HTTP 200.
	 *
	 * @return void
	 */
	public static function ajax_bots_rest() {
		if ( ! check_ajax_referer( 'wp_rest', 'nonce', false ) ) {
			wp_send_json_error(
				array(
					'message' => 'Invalid nonce',
					'code'    => 'invalid_nonce',
				)
			);
		}
		if ( ! is_user_logged_in() ) {
			wp_send_json_error(
				array(
					'message' => 'Forbidden',
					'code'    => 'forbidden',
				)
			);
		}

		$rest_path = isset( $_POST['rest_path'] ) // phpcs:ignore WordPress.Security.NonceVerification.Missing -- checked above.
			? sanitize_text_field( wp_unslash( (string) $_POST['rest_path'] ) )
			: '';
		$rest_path = ltrim( $rest_path, '/' );

		if ( ! self::is_ajax_proxy_path_allowed( $rest_path ) ) {
			wp_send_json_error(
				array(
					'message' => 'Path not allowed',
					'code'    => 'path_not_allowed',
				)
			);
		}

		$method = isset( $_POST['rest_method'] ) // phpcs:ignore WordPress.Security.NonceVerification.Missing
			? strtoupper( sanitize_text_field( wp_unslash( (string) $_POST['rest_method'] ) ) )
			: 'GET';
		if ( ! in_array( $method, array( 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ), true ) ) {
			$method = 'GET';
		}

		$query = array();
		if ( isset( $_POST['rest_query'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$raw_q = wp_unslash( (string) $_POST['rest_query'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
			parse_str( ltrim( $raw_q, '?' ), $parsed );
			if ( is_array( $parsed ) ) {
				$query = $parsed;
			}
		}

		$route = '/' . self::NS . '/' . $rest_path;
		$req   = new WP_REST_Request( $method, $route );
		foreach ( $query as $key => $value ) {
			$req->set_param( (string) $key, $value );
		}

		if ( in_array( $method, array( 'POST', 'PUT', 'PATCH', 'DELETE' ), true ) && isset( $_POST['payload'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$raw = wp_unslash( (string) $_POST['payload'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.NonceVerification.Missing
			if ( $raw !== '' ) {
				$req->set_body( $raw );
				$req->set_header( 'Content-Type', 'application/json' );
				$decoded = json_decode( $raw, true );
				if ( is_array( $decoded ) ) {
					$req->set_body_params( $decoded );
				}
			}
		}

		$response = rest_do_request( $req );
		if ( $response->is_error() ) {
			$err = $response->as_error();
			wp_send_json_error(
				array(
					'message' => $err->get_error_message(),
					'code'    => $err->get_error_code(),
				)
			);
		}

		$data = $response->get_data();
		wp_send_json_success( $data );
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
				'/bots/' . $pre . '/loyalty',
				array(
					array(
						'methods'             => 'GET',
						'callback'            => function () use ( $mod ) {
							unset( $mod );
							if ( ! class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
								return new WP_Error( 'loyalty', __( 'Loyalty unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
							}
							return new WP_REST_Response(
								array(
									'settings'      => Webino_Dashboard_Bots_Loyalty::settings(),
									'top_customers' => Webino_Dashboard_Bots_Loyalty::top_customers( 20 ),
								)
							);
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
					array(
						'methods'             => array( 'POST', 'PUT', 'PATCH' ),
						'callback'            => function ( WP_REST_Request $req ) use ( $mod ) {
							unset( $mod );
							if ( ! class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
								return new WP_Error( 'loyalty', __( 'Loyalty unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
							}
							$params = $req->get_json_params();
							$saved  = Webino_Dashboard_Bots_Loyalty::save_settings( is_array( $params ) ? $params : array() );
							return new WP_REST_Response( array( 'settings' => $saved ) );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/coupons',
				array(
					array(
						'methods'             => 'GET',
						'callback'            => function () use ( $mod ) {
							return self::bot_coupons_list( $mod );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
					array(
						'methods'             => 'POST',
						'callback'            => function ( WP_REST_Request $req ) use ( $mod ) {
							return self::bot_coupons_create( $req, $mod );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/users/(?P<id>\d+)/block',
				array(
					'methods'             => 'POST',
					'callback'            => function ( WP_REST_Request $req ) use ( $mod ) {
						return self::user_block( $req, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/connection-status',
				array(
					'methods'             => 'GET',
					'callback'            => function () use ( $which, $mod ) {
						return self::connection_status( $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

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
				'/bots/' . $pre . '/shop-notify',
				array(
					array(
						'methods'             => 'GET',
						'callback'            => function () use ( $which, $mod ) {
							return self::shop_notify_get( $which, $mod );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
					array(
						'methods'             => array( 'POST', 'PUT', 'PATCH' ),
						'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
							return self::shop_notify_post( $req, $which, $mod );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/orders/test-notify',
				array(
					'methods'             => 'POST',
					'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
						return self::orders_test_notify( $req, $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/newsletter/subscribers',
				array(
					array(
						'methods'             => 'GET',
						'callback'            => function () use ( $which, $mod ) {
							return self::newsletter_subscribers_get( $which, $mod );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
					array(
						'methods'             => 'POST',
						'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
							return self::newsletter_subscribers_post( $req, $which, $mod );
						},
						'permission_callback' => function () use ( $mod ) {
							return self::perm_manage( $mod );
						},
					),
				)
			);

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/newsletter/send',
				array(
					'methods'             => 'POST',
					'callback'            => function ( WP_REST_Request $req ) use ( $which, $mod ) {
						return self::newsletter_send( $req, $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
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

			register_rest_route(
				self::NS,
				'/bots/' . $pre . '/stats/advanced',
				array(
					'methods'             => 'GET',
					'callback'            => function () use ( $which, $mod ) {
						return self::stats_advanced( $which, $mod );
					},
					'permission_callback' => function () use ( $mod ) {
						return self::perm_manage( $mod );
					},
				)
			);
		}

		self::register_parity_routes();
	}

	/**
	 * Shared parity endpoints (admin-ops, c2c, faq, tickets, club, …).
	 *
	 * @return void
	 */
	private static function register_parity_routes() {
		static $registered = false;
		if ( $registered ) {
			return;
		}
		$registered = true;

		$perm = array( __CLASS__, 'perm_any_bot' );

		$shared = array(
			'admin-ops'          => array(
				'get'  => static function () {
					if ( ! class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false ) ) {
						return new WP_Error( 'admin_ops', __( 'Admin ops unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					return new WP_REST_Response( array( 'settings' => Webino_Dashboard_Bots_Admin_Ops::settings() ) );
				},
				'post' => static function ( WP_REST_Request $req ) {
					if ( ! class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false ) ) {
						return new WP_Error( 'admin_ops', __( 'Admin ops unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					$params = $req->get_json_params();
					$saved  = Webino_Dashboard_Bots_Admin_Ops::save_settings( is_array( $params ) ? $params : array() );
					return new WP_REST_Response( array( 'settings' => $saved ) );
				},
			),
			'c2c'                => array(
				'get'  => static function () {
					if ( ! class_exists( 'Webino_Dashboard_Bots_C2C_Gateway', false ) ) {
						return new WP_Error( 'c2c', __( 'C2C unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					return new WP_REST_Response( array( 'settings' => Webino_Dashboard_Bots_C2C_Gateway::settings() ) );
				},
				'post' => static function ( WP_REST_Request $req ) {
					if ( ! class_exists( 'Webino_Dashboard_Bots_C2C_Gateway', false ) ) {
						return new WP_Error( 'c2c', __( 'C2C unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					$params = $req->get_json_params();
					$saved  = Webino_Dashboard_Bots_C2C_Gateway::save_settings( is_array( $params ) ? $params : array() );
					return new WP_REST_Response( array( 'settings' => $saved ) );
				},
			),
			'faq'                => array(
				'get'  => static function () {
					if ( ! class_exists( 'Webino_Dashboard_Bots_FAQ', false ) ) {
						return new WP_Error( 'faq', __( 'FAQ unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					return new WP_REST_Response( array( 'settings' => Webino_Dashboard_Bots_FAQ::settings() ) );
				},
				'post' => static function ( WP_REST_Request $req ) {
					if ( ! class_exists( 'Webino_Dashboard_Bots_FAQ', false ) ) {
						return new WP_Error( 'faq', __( 'FAQ unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					$params = $req->get_json_params();
					$saved  = Webino_Dashboard_Bots_FAQ::save_settings( is_array( $params ) ? $params : array() );
					return new WP_REST_Response( array( 'settings' => $saved ) );
				},
			),
			'club'               => array(
				'get'  => static function () {
					if ( ! class_exists( 'Webino_Dashboard_Bots_Club', false ) ) {
						return new WP_Error( 'club', __( 'Club unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					return new WP_REST_Response( array( 'settings' => Webino_Dashboard_Bots_Club::settings() ) );
				},
				'post' => static function ( WP_REST_Request $req ) {
					if ( ! class_exists( 'Webino_Dashboard_Bots_Club', false ) ) {
						return new WP_Error( 'club', __( 'Club unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					$params = $req->get_json_params();
					$saved  = Webino_Dashboard_Bots_Club::save_settings( is_array( $params ) ? $params : array() );
					return new WP_REST_Response( array( 'settings' => $saved ) );
				},
			),
			'channel-publisher'  => array(
				'get'  => static function () {
					if ( ! class_exists( 'Webino_Dashboard_Bots_Channel_Publisher', false ) ) {
						return new WP_Error( 'channel', __( 'Channel publisher unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					return new WP_REST_Response( array( 'settings' => Webino_Dashboard_Bots_Channel_Publisher::settings() ) );
				},
				'post' => static function ( WP_REST_Request $req ) {
					if ( ! class_exists( 'Webino_Dashboard_Bots_Channel_Publisher', false ) ) {
						return new WP_Error( 'channel', __( 'Channel publisher unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					$params = $req->get_json_params();
					$saved  = Webino_Dashboard_Bots_Channel_Publisher::save_settings( is_array( $params ) ? $params : array() );
					return new WP_REST_Response( array( 'settings' => $saved ) );
				},
			),
			'site-widgets'       => array(
				'get'  => static function () {
					if ( ! class_exists( 'Webino_Dashboard_Bots_Site_Widgets', false ) ) {
						return new WP_Error( 'widgets', __( 'Site widgets unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					return new WP_REST_Response( array( 'settings' => Webino_Dashboard_Bots_Site_Widgets::settings() ) );
				},
				'post' => static function ( WP_REST_Request $req ) {
					if ( ! class_exists( 'Webino_Dashboard_Bots_Site_Widgets', false ) ) {
						return new WP_Error( 'widgets', __( 'Site widgets unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
					}
					$params = $req->get_json_params();
					$saved  = Webino_Dashboard_Bots_Site_Widgets::save_settings( is_array( $params ) ? $params : array() );
					return new WP_REST_Response( array( 'settings' => $saved ) );
				},
			),
		);

		foreach ( $shared as $slug => $handlers ) {
			register_rest_route(
				self::NS,
				'/bots/parity/' . $slug,
				array(
					array(
						'methods'             => 'GET',
						'callback'            => $handlers['get'],
						'permission_callback' => $perm,
					),
					array(
						'methods'             => array( 'POST', 'PUT', 'PATCH' ),
						'callback'            => $handlers['post'],
						'permission_callback' => $perm,
					),
				)
			);
		}

		register_rest_route(
			self::NS,
			'/bots/parity/tickets',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'parity_tickets_get' ),
					'permission_callback' => $perm,
				),
				array(
					'methods'             => array( 'POST', 'PUT', 'PATCH' ),
					'callback'            => array( __CLASS__, 'parity_tickets_post' ),
					'permission_callback' => $perm,
				),
			)
		);

		register_rest_route(
			self::NS,
			'/bots/parity/templates',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'parity_templates_get' ),
					'permission_callback' => $perm,
				),
				array(
					'methods'             => array( 'POST', 'PUT', 'PATCH' ),
					'callback'            => array( __CLASS__, 'parity_templates_post' ),
					'permission_callback' => $perm,
				),
			)
		);

		register_rest_route(
			self::NS,
			'/bots/parity/modules',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'parity_modules_get' ),
					'permission_callback' => $perm,
				),
				array(
					'methods'             => array( 'POST', 'PUT', 'PATCH' ),
					'callback'            => array( __CLASS__, 'parity_modules_post' ),
					'permission_callback' => $perm,
				),
			)
		);
	}

	/**
	 * Permission: manage WooCommerce and at least one bot module enabled.
	 *
	 * @return bool|WP_Error
	 */
	public static function perm_any_bot() {
		if ( ! Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' ) ) {
			return false;
		}
		$bale = class_exists( 'Webino_Dashboard_Modules', false ) && Webino_Dashboard_Modules::is_module_enabled( 'bale-bot-module' );
		$tg   = class_exists( 'Webino_Dashboard_Modules', false ) && Webino_Dashboard_Modules::is_module_enabled( 'telegram-bot-module' );
		if ( ! $bale && ! $tg ) {
			return new WP_Error(
				'webino_module_disabled',
				__( 'This dashboard module is disabled.', 'webino-dashboard' ),
				array( 'status' => 403 )
			);
		}
		return true;
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function parity_tickets_get() {
		if ( ! class_exists( 'Webino_Dashboard_Bots_Tickets', false ) ) {
			return new WP_Error( 'tickets', __( 'Tickets unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		return new WP_REST_Response( array( 'items' => Webino_Dashboard_Bots_Tickets::all() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function parity_tickets_post( WP_REST_Request $req ) {
		if ( ! class_exists( 'Webino_Dashboard_Bots_Tickets', false ) ) {
			return new WP_Error( 'tickets', __( 'Tickets unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$action    = isset( $params['action'] ) ? sanitize_key( (string) $params['action'] ) : '';
		$ticket_id = isset( $params['ticket_id'] ) ? sanitize_text_field( (string) $params['ticket_id'] ) : '';
		if ( $ticket_id === '' ) {
			return new WP_Error( 'ticket_id', __( 'ticket_id required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( 'close' === $action ) {
			$ok = Webino_Dashboard_Bots_Tickets::close( $ticket_id );
			return new WP_REST_Response( array( 'ok' => (bool) $ok, 'ticket' => Webino_Dashboard_Bots_Tickets::get( $ticket_id ) ) );
		}
		if ( 'reply' === $action ) {
			$text = isset( $params['text'] ) ? (string) $params['text'] : '';
			if ( trim( $text ) === '' ) {
				return new WP_Error( 'text', __( 'Reply text required.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			$ok = Webino_Dashboard_Bots_Tickets::append( $ticket_id, 'admin', $text );
			return new WP_REST_Response( array( 'ok' => (bool) $ok, 'ticket' => Webino_Dashboard_Bots_Tickets::get( $ticket_id ) ) );
		}
		return new WP_Error( 'action', __( 'Use action=close or action=reply.', 'webino-dashboard' ), array( 'status' => 400 ) );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function parity_templates_get() {
		if ( ! class_exists( 'Webino_Dashboard_Bots_Templates', false ) ) {
			return new WP_Error( 'templates', __( 'Templates unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		return new WP_REST_Response( array( 'settings' => Webino_Dashboard_Bots_Templates::settings() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function parity_templates_post( WP_REST_Request $req ) {
		if ( ! class_exists( 'Webino_Dashboard_Bots_Templates', false ) ) {
			return new WP_Error( 'templates', __( 'Templates unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		if ( ! empty( $params['preview'] ) ) {
			$tpl  = isset( $params['template'] ) ? (string) $params['template'] : ( isset( $params['key'] ) ? (string) $params['key'] : '' );
			$vars = isset( $params['vars'] ) && is_array( $params['vars'] ) ? $params['vars'] : array();
			$safe = array();
			foreach ( $vars as $k => $v ) {
				if ( is_scalar( $v ) ) {
					$safe[ sanitize_key( (string) $k ) ] = (string) $v;
				}
			}
			return new WP_REST_Response(
				array(
					'preview' => Webino_Dashboard_Bots_Templates::preview( $tpl, $safe ),
				)
			);
		}
		$saved = Webino_Dashboard_Bots_Templates::save_settings( $params );
		return new WP_REST_Response( array( 'settings' => $saved ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function parity_modules_get() {
		$raw = get_option( 'webino_dashboard_bots_modules', array() );
		return new WP_REST_Response( array( 'modules' => is_array( $raw ) ? $raw : array() ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function parity_modules_post( WP_REST_Request $req ) {
		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$cur = get_option( 'webino_dashboard_bots_modules', array() );
		if ( ! is_array( $cur ) ) {
			$cur = array();
		}
		$src = isset( $params['modules'] ) && is_array( $params['modules'] ) ? $params['modules'] : $params;
		foreach ( $src as $key => $val ) {
			$k = sanitize_key( (string) $key );
			if ( $k === '' ) {
				continue;
			}
			$cur[ $k ] = ! empty( $val ) && '0' !== (string) $val ? '1' : '0';
		}
		update_option( 'webino_dashboard_bots_modules', $cur, false );
		return new WP_REST_Response( array( 'modules' => $cur ) );
	}

	/**
	 * Advanced stats: sales by payment method, abandon recovery, coupon counts.
	 *
	 * @param string $which bale|telegram.
	 * @param string $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function stats_advanced( $which, $mod ) {
		unset( $mod );
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = self::require_bot_ctx( $which );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}

		$by_method = array(
			'wallet'  => array( 'count' => 0, 'total' => 0.0 ),
			'c2c'     => array( 'count' => 0, 'total' => 0.0 ),
			'gateway' => array( 'count' => 0, 'total' => 0.0 ),
			'other'   => array( 'count' => 0, 'total' => 0.0 ),
		);

		if ( function_exists( 'wc_get_orders' ) ) {
			$provider_mq = array(
				'key'   => '_woobale_provider',
				'value' => $which,
			);
			if ( 'bale' === $which ) {
				$provider_mq = array(
					'relation' => 'OR',
					array(
						'key'   => '_woobale_provider',
						'value' => 'bale',
					),
					array(
						'key'     => '_woobale_provider',
						'compare' => 'NOT EXISTS',
					),
				);
			}
			$orders = wc_get_orders(
				array(
					'limit'        => 500,
					'status'       => array( 'wc-processing', 'wc-completed', 'processing', 'completed' ),
					'return'       => 'objects',
					'meta_query'   => array(
						'relation' => 'AND',
						array(
							'key'   => '_woobale_source',
							'value' => '1',
						),
						$provider_mq,
					),
					'date_created' => ( time() - 90 * DAY_IN_SECONDS ) . '...' . time(),
				)
			);
			if ( is_array( $orders ) ) {
				foreach ( $orders as $order ) {
					if ( ! $order instanceof WC_Order ) {
						continue;
					}
					$pm     = (string) $order->get_meta( '_woobale_payment_method' );
					$method = (string) $order->get_payment_method();
					$bucket = 'other';
					if ( 'wallet' === $pm || 'bale_wallet' === $method ) {
						$bucket = 'wallet';
					} elseif ( 'c2c' === $pm || false !== strpos( $method, 'c2c' ) ) {
						$bucket = 'c2c';
					} elseif ( $method !== '' || 'gateway' === $pm ) {
						$bucket = 'gateway';
					}
					++$by_method[ $bucket ]['count'];
					$by_method[ $bucket ]['total'] += (float) $order->get_total();
				}
			}
		}

		$coupon_q = new WP_Query(
			array(
				'post_type'      => 'shop_coupon',
				'post_status'    => 'publish',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_key'       => '_webino_bot_coupon',
				'meta_value'     => '1',
			)
		);
		$coupon_count = (int) $coupon_q->found_posts;

		$abandon_sent = (int) get_option( 'webino_dashboard_bots_abandon_sent_' . $which, 0 );
		$abandon_recovered = (int) get_option( 'webino_dashboard_bots_abandon_recovered_' . $which, 0 );

		return new WP_REST_Response(
			array(
				'sales_by_payment' => $by_method,
				'bot_coupons'      => $coupon_count,
				'abandon'          => array(
					'sent'      => $abandon_sent,
					'recovered' => $abandon_recovered,
				),
				'window_days'      => 90,
			)
		);
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
	/**
	 * @param string $which bale|telegram.
	 * @param string $mod   Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function connection_status( $which, $mod ) {
		unset( $mod );
		$client = self::client( $which );
		if ( null === $client ) {
			return new WP_REST_Response(
				array(
					'ok'    => false,
					'error' => __( 'Bot token is not set.', 'webino-dashboard' ),
				)
			);
		}
		$me = $client->get_me();
		$wh = $client->get_webhook_info();
		$ok = is_array( $me ) && ! empty( $me['ok'] );
		$username = ( $ok && isset( $me['result']['username'] ) ) ? (string) $me['result']['username'] : '';
		$err      = '';
		if ( ! $ok ) {
			$err_cls = 'telegram' === $which ? \Webino_Dashboard_Bots_Telegram\Bale\Client::class : \Webino_Dashboard_Bots_Bale\Bale\Client::class;
			$err     = $err_cls::summarize_error( is_array( $me ) ? $me : $wh );
		}
		return new WP_REST_Response(
			array(
				'ok'      => (bool) $ok,
				'bot'     => array( 'username' => $username ),
				'webhook' => array(
					'url' => is_array( $wh ) && isset( $wh['result']['url'] ) ? (string) $wh['result']['url'] : '',
				),
				'error'   => $err,
			)
		);
	}

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
				'total_text'  => self::sanitize_price_text( $order->get_formatted_order_total() ),
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
							? self::sanitize_price_text( wc_price( (float) ( $sales_cmp['current']['total'] ?? 0 ) ) )
							: '',
					),
					'previous' => array(
						'count'      => (int) ( $sales_cmp['previous']['count'] ?? 0 ),
						'total'      => (float) ( $sales_cmp['previous']['total'] ?? 0 ),
						'total_text' => function_exists( 'wc_price' )
							? self::sanitize_price_text( wc_price( (float) ( $sales_cmp['previous']['total'] ?? 0 ) ) )
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
		$start_args = array();
		$segment    = isset( $params['segment'] ) ? sanitize_key( (string) $params['segment'] ) : '';
		if ( $segment !== '' && class_exists( 'Webino_Dashboard_Bots_Segments', false ) ) {
			$seg_args = array(
				'provider' => $which,
			);
			if ( isset( $params['product_id'] ) ) {
				$seg_args['product_id'] = (int) $params['product_id'];
			}
			if ( isset( $params['days'] ) ) {
				$seg_args['days'] = (int) $params['days'];
			}
			$start_args['user_ids'] = Webino_Dashboard_Bots_Segments::resolve_user_ids( $segment, $seg_args );
		} elseif ( isset( $params['user_ids'] ) && is_array( $params['user_ids'] ) ) {
			$start_args['user_ids'] = array_map( 'absint', $params['user_ids'] );
		}
		$res    = $broadcast_class::start( $payload, $start_args );
		$status = ! empty( $res['ok'] ) ? 200 : 400;
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
	 * @return WP_REST_Response|WP_Error
	 */
	private static function shop_notify_get( $which, $mod ) {
		unset( $mod );
		if ( ! class_exists( 'Webino_Dashboard_Bots_Order_Notify', false ) ) {
			return new WP_Error( 'unavailable', __( 'Shop bot notify unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		return new WP_REST_Response(
			array(
				'provider'      => $which,
				'shop_notify'   => Webino_Dashboard_Bots_Order_Notify::get_shop_notify( $which ),
				'event_catalog' => Webino_Dashboard_Bots_Order_Notify::event_catalog(),
				'shortcodes'    => Webino_Dashboard_Bots_Order_Notify::shortcodes(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @param string          $which bale|telegram.
	 * @param string          $mod Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function shop_notify_post( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		if ( ! class_exists( 'Webino_Dashboard_Bots_Order_Notify', false ) ) {
			return new WP_Error( 'unavailable', __( 'Shop bot notify unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$sn = isset( $params['shop_notify'] ) && is_array( $params['shop_notify'] ) ? $params['shop_notify'] : $params;
		$saved = Webino_Dashboard_Bots_Order_Notify::save_shop_notify( $which, $sn );
		return new WP_REST_Response(
			array(
				'provider'      => $which,
				'shop_notify'   => $saved,
				'event_catalog' => Webino_Dashboard_Bots_Order_Notify::event_catalog(),
				'shortcodes'    => Webino_Dashboard_Bots_Order_Notify::shortcodes(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @param string          $which bale|telegram.
	 * @param string          $mod Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function orders_test_notify( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		if ( ! class_exists( 'Webino_Dashboard_Bots_Order_Notify', false ) ) {
			return new WP_Error( 'unavailable', __( 'Shop bot notify unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$params    = $req->get_json_params();
		$params    = is_array( $params ) ? $params : array();
		$event_key = sanitize_key( (string) ( $params['event_key'] ?? 'processing' ) );
		$order_id  = absint( $params['order_id'] ?? 0 );
		$role      = sanitize_key( (string) ( $params['role'] ?? 'admin' ) );

		if ( $order_id > 0 && function_exists( 'wc_get_order' ) ) {
			$order = wc_get_order( $order_id );
			if ( ! $order ) {
				return new WP_Error( 'not_found', __( 'Order not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
			}
			$snapshot = Webino_Dashboard_Bots_Order_Notify::build_order_snapshot( $order );
		} else {
			$snapshot = array(
				'id'               => 0,
				'number'           => 'TEST',
				'customer_name'    => 'Test Customer',
				'customer_phone'   => '',
				'mobile'           => '',
				'customer_email'   => '',
				'customer_user_id' => 0,
				'total'            => '0',
				'price'            => '0',
				'status'           => 'processing',
				'status_label'     => 'Processing',
				'site_name'        => get_bloginfo( 'name' ),
				'site_url'         => home_url(),
			);
		}

		$sn = Webino_Dashboard_Bots_Order_Notify::get_shop_notify( $which );
		$scope = 'admin' === $role ? 'order_admin' : 'order_customer';
		$body  = isset( $sn['templates'][ $scope ][ $event_key ] ) ? trim( (string) $sn['templates'][ $scope ][ $event_key ] ) : '';
		if ( '' === $body ) {
			$body = sprintf(
				/* translators: %s: event key */
				__( 'Test bot notify — event %s — order {order_number} ({status_label})', 'webino-dashboard' ),
				$event_key
			);
		}
		$text = Webino_Dashboard_Bots_Order_Notify::render_template( $body, array_merge( $snapshot, array( 'order_id' => (string) ( $snapshot['id'] ?? '' ), 'order_number' => (string) ( $snapshot['number'] ?? '' ) ) ) );

		$sent = 0;
		if ( 'admin' === $role ) {
			foreach ( $sn['admin_chat_ids'] as $chat ) {
				Webino_Dashboard_Bots_Loader::register_autoloaders();
				if ( 'telegram' === $which ) {
					$res = \Webino_Dashboard_Bots_Telegram\Messaging\OutboundMessenger::send_text_to_chat( (string) $chat, $text );
				} else {
					$res = \Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger::send_text_to_chat( (string) $chat, $text );
				}
				if ( ! empty( $res['ok'] ) ) {
					++$sent;
				}
			}
		} else {
			$chat = '';
			if ( ! empty( $params['chat_id'] ) ) {
				$chat = sanitize_text_field( (string) $params['chat_id'] );
			} elseif ( ! empty( $snapshot['customer_user_id'] ) ) {
				$meta = 'telegram' === $which ? 'webino_dashboard_telegram_chat_id' : 'woobale_chat_id';
				$chat = (string) get_user_meta( (int) $snapshot['customer_user_id'], $meta, true );
			}
			if ( '' === $chat ) {
				return new WP_Error( 'no_chat', __( 'No customer chat id for test.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			Webino_Dashboard_Bots_Loader::register_autoloaders();
			if ( 'telegram' === $which ) {
				$res = \Webino_Dashboard_Bots_Telegram\Messaging\OutboundMessenger::send_text_to_chat( $chat, $text );
			} else {
				$res = \Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger::send_text_to_chat( $chat, $text );
			}
			if ( ! empty( $res['ok'] ) ) {
				++$sent;
			}
		}

		return new WP_REST_Response(
			array(
				'ok'   => $sent > 0,
				'sent' => $sent,
			)
		);
	}

	/**
	 * @param string $which bale|telegram.
	 * @param string $mod Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function newsletter_subscribers_get( $which, $mod ) {
		unset( $mod );
		if ( ! class_exists( 'Webino_Dashboard_Bots_Order_Notify', false ) ) {
			return new WP_Error( 'unavailable', __( 'Shop bot notify unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		return new WP_REST_Response(
			array(
				'subscribers' => Webino_Dashboard_Bots_Order_Notify::list_subscribers( $which, false ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @param string          $which bale|telegram.
	 * @param string          $mod Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function newsletter_subscribers_post( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		if ( ! class_exists( 'Webino_Dashboard_Bots_Order_Notify', false ) ) {
			return new WP_Error( 'unavailable', __( 'Shop bot notify unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$params  = $req->get_json_params();
		$params  = is_array( $params ) ? $params : array();
		$user_id = absint( $params['user_id'] ?? 0 );
		$opt_in  = ! isset( $params['opt_in'] ) || ! empty( $params['opt_in'] );
		if ( $user_id < 1 ) {
			return new WP_Error( 'invalid', __( 'Invalid user.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		Webino_Dashboard_Bots_Order_Notify::set_subscriber_opt_in( $which, $user_id, $opt_in );
		return new WP_REST_Response(
			array(
				'ok'          => true,
				'subscribers' => Webino_Dashboard_Bots_Order_Notify::list_subscribers( $which, false ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @param string          $which bale|telegram.
	 * @param string          $mod Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function newsletter_send( WP_REST_Request $req, $which, $mod ) {
		unset( $mod );
		if ( ! class_exists( 'Webino_Dashboard_Bots_Order_Notify', false ) ) {
			return new WP_Error( 'unavailable', __( 'Shop bot notify unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$params  = $req->get_json_params();
		$message = is_array( $params ) && isset( $params['message'] ) ? (string) $params['message'] : '';
		$res     = Webino_Dashboard_Bots_Order_Notify::send_newsletter( $which, $message );
		return new WP_REST_Response( $res );
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
		if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			$out['loyalty'] = Webino_Dashboard_Bots_Loyalty::settings();
		}
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
		$had_new_bot_token = isset( $params['bot_token'] ) && is_string( $params['bot_token'] ) && false === strpos( $params['bot_token'], '…' ) && '' !== trim( $params['bot_token'] );
		foreach ( array( 'bot_token', 'provider_token', 'bot_token_sandbox', 'webhook_secret' ) as $secret_key ) {
			if ( isset( $params[ $secret_key ] ) && is_string( $params[ $secret_key ] ) && false !== strpos( $params[ $secret_key ], '…' ) ) {
				unset( $params[ $secret_key ] );
			}
		}

		if ( isset( $params['loyalty'] ) && is_array( $params['loyalty'] ) && class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			Webino_Dashboard_Bots_Loyalty::save_settings( $params['loyalty'] );
			unset( $params['loyalty'] );
		}

		if ( 'telegram' === $which ) {
			$merged = \Webino_Dashboard_Bots_Telegram\Admin\SettingsPage::instance()->sanitize_settings( $params );
			\Webino_Dashboard_Bots_Telegram\Core\Plugin::update_settings( $merged );
		} else {
			$merged = \Webino_Dashboard_Bots_Bale\Admin\SettingsPage::instance()->sanitize_settings( $params );
			\Webino_Dashboard_Bots_Bale\Core\Plugin::update_settings( $merged );
		}

		// After a real bot token change, re-register webhook so Bale points at our REST URL.
		if ( $had_new_bot_token && '1' === (string) get_option( 'webino_dashboard_' . $which . '_webhook_configured', '' ) ) {
			$client = self::client( $which );
			if ( null !== $client ) {
				$pre    = 'bale' === $which ? 'bale' : 'telegram';
				$url    = esc_url_raw( rest_url( self::NS . '/bots/' . $pre . '/webhook' ) );
				$s      = self::get_settings_array( $which );
				$secret = isset( $s['webhook_secret'] ) ? trim( (string) $s['webhook_secret'] ) : '';
				$res    = $client->set_webhook( $url, $secret !== '' ? $secret : null );
				if ( is_array( $res ) && ! empty( $res['ok'] ) ) {
					update_option( 'webino_dashboard_' . $which . '_webhook_configured', '1', false );
				}
			}
		}

		$out = self::mask_secrets( self::get_settings_array( $which ) );
		if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			$out['loyalty'] = Webino_Dashboard_Bots_Loyalty::settings();
		}
		return new WP_REST_Response( $out );
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

	/**
	 * @param string $mod Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function bot_coupons_list( $mod ) {
		unset( $mod );
		if ( ! class_exists( 'WC_Coupon', false ) ) {
			return new WP_Error( 'wc', __( 'WooCommerce coupons unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$q = new WP_Query(
			array(
				'post_type'      => 'shop_coupon',
				'post_status'    => 'publish',
				'posts_per_page' => 50,
				'meta_key'       => '_webino_bot_coupon',
				'meta_value'     => '1',
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);
		$items = array();
		foreach ( $q->posts as $post ) {
			$c = new WC_Coupon( $post->ID );
			$items[] = array(
				'id'     => $post->ID,
				'code'   => $c->get_code(),
				'amount' => (float) $c->get_amount(),
				'type'   => $c->get_discount_type(),
			);
		}
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @param string          $mod Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function bot_coupons_create( WP_REST_Request $req, $mod ) {
		unset( $mod );
		if ( ! class_exists( 'WC_Coupon', false ) ) {
			return new WP_Error( 'wc', __( 'WooCommerce coupons unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$code   = isset( $params['code'] ) ? wc_format_coupon_code( (string) $params['code'] ) : '';
		$amount = isset( $params['amount'] ) ? (float) $params['amount'] : 0;
		$type   = isset( $params['type'] ) ? sanitize_key( (string) $params['type'] ) : 'percent';
		if ( $code === '' ) {
			$code = 'BOT' . strtoupper( wp_generate_password( 6, false, false ) );
		}
		if ( $amount <= 0 ) {
			return new WP_Error( 'amount', __( 'Enter a valid coupon amount.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( ! in_array( $type, array( 'percent', 'fixed_cart', 'fixed_product' ), true ) ) {
			$type = 'percent';
		}
		$c = new WC_Coupon();
		$c->set_code( $code );
		$c->set_discount_type( $type );
		$c->set_amount( $amount );
		$c->update_meta_data( '_webino_bot_coupon', '1' );
		$id = $c->save();
		if ( ! $id ) {
			return new WP_Error( 'create', __( 'Could not create coupon.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		return new WP_REST_Response(
			array(
				'ok'   => true,
				'id'   => $id,
				'code' => $c->get_code(),
			),
			201
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @param string          $mod Module id.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function user_block( WP_REST_Request $req, $mod ) {
		unset( $mod );
		if ( ! class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			return new WP_Error( 'loyalty', __( 'Loyalty unavailable.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$uid = (int) $req['id'];
		if ( $uid < 1 || ! get_userdata( $uid ) ) {
			return new WP_Error( 'user', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$params  = $req->get_json_params();
		$blocked = is_array( $params ) ? ! empty( $params['blocked'] ) : true;
		Webino_Dashboard_Bots_Loyalty::set_blocked( $uid, (bool) $blocked );
		return new WP_REST_Response(
			array(
				'ok'      => true,
				'user_id' => $uid,
				'blocked' => Webino_Dashboard_Bots_Loyalty::is_blocked( $uid ),
			)
		);
	}
}
