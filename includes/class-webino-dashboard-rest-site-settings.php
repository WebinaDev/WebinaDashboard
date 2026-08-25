<?php
/**
 * Site-wide settings REST (WordPress options).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers site/settings/* routes.
 */
final class Webino_Dashboard_REST_Site_Settings {

	const NS = 'webino-dashboard/v1';

	/** Shop SMS settings transient TTL (seconds). */
	const SMS_SHOP_CACHE_TTL = 300;

	/** Fast CRM reads for settings panels. */
	const CRM_FAST_OPTS = array(
		'timeout'  => 3,
		'wall_cap' => 5,
	);

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
		register_rest_route(
			self::NS,
			'/site/settings/general',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'general_get' ),
					'permission_callback' => array( __CLASS__, 'can_manage' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'general_post' ),
					'permission_callback' => array( __CLASS__, 'can_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/settings/invoices',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'invoices_get' ),
					'permission_callback' => array( __CLASS__, 'can_view_invoices' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'invoices_post' ),
					'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/site/settings/sms',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'site_sms_get' ),
					'permission_callback' => array( __CLASS__, 'can_manage' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'site_sms_post' ),
					'permission_callback' => array( __CLASS__, 'can_manage' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/settings/sms',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'sms_get' ),
					'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'sms_post' ),
					'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
				),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function can_manage() {
		return Webino_Dashboard_Rest_Base::can( 'manage_options' );
	}

	/**
	 * @return bool
	 */
	public static function can_manage_shop() {
		return Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' ) || Webino_Dashboard_Rest_Base::can( 'manage_options' );
	}

	/**
	 * Print buttons need enable flags; POST stays shop-manager-only.
	 *
	 * @return bool
	 */
	public static function can_view_invoices() {
		return self::can_manage_shop()
			|| Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' )
			|| Webino_Dashboard_Rest_Base::can( 'edit_products' );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function general_get() {
		return new WP_REST_Response(
			array(
				'blogname'        => get_option( 'blogname', '' ),
				'blogdescription' => get_option( 'blogdescription', '' ),
				'admin_email'     => get_option( 'admin_email', '' ),
				'timezone_string' => get_option( 'timezone_string', '' ),
				'WPLANG'          => get_option( 'WPLANG', '' ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function general_post( $request ) {
		$name  = sanitize_text_field( (string) $request->get_param( 'blogname' ) );
		$desc  = sanitize_text_field( (string) $request->get_param( 'blogdescription' ) );
		$email = sanitize_email( (string) $request->get_param( 'admin_email' ) );
		$tz    = sanitize_text_field( (string) $request->get_param( 'timezone_string' ) );
		$lang  = sanitize_text_field( (string) $request->get_param( 'WPLANG' ) );

		if ( $name ) {
			update_option( 'blogname', $name );
		}
		if ( null !== $request->get_param( 'blogdescription' ) ) {
			update_option( 'blogdescription', $desc );
		}
		if ( $email && is_email( $email ) ) {
			update_option( 'admin_email', $email );
		}
		if ( $tz ) {
			update_option( 'timezone_string', $tz );
		}
		if ( null !== $request->get_param( 'WPLANG' ) ) {
			update_option( 'WPLANG', $lang );
		}

		if ( class_exists( 'Webino_Dashboard_SSR', false ) ) {
			Webino_Dashboard_SSR::invalidate_user_caches();
		}

		return self::general_get();
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function invoices_get() {
		return new WP_REST_Response( Webino_Dashboard_Order_Document_Settings::get() );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function invoices_post( $request ) {
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $request->get_params();
		}
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'invalid_body', __( 'Invalid request body.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		Webino_Dashboard_Order_Document_Settings::save( $data );
		return self::invoices_get();
	}

	/**
	 * @return string
	 */
	private static function sms_shop_cache_key() {
		$domain = Webino_Dashboard_License::instance()->get_current_domain();
		return 'webino_sms_shop_settings_' . md5( $domain );
	}

	/**
	 * Drop cached shop SMS payload after save/bind/sync.
	 *
	 * @return void
	 */
	public static function invalidate_sms_shop_cache() {
		delete_transient( self::sms_shop_cache_key() );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function sms_get() {
		$key    = self::sms_shop_cache_key();
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			// Always refresh local event catalog labels from WooCommerce.
			$catalog = class_exists( 'Webino_Dashboard_Sms_Order_Map', false )
				? Webino_Dashboard_Sms_Order_Map::event_catalog()
				: array();
			if ( $catalog ) {
				$cached['event_catalog'] = $catalog;
				$cached['event_keys']    = array_column( $catalog, 'key' );
			}
			if ( isset( $cached['settings'] ) && is_array( $cached['settings'] ) && class_exists( 'Webino_Dashboard_Sms_Recovery', false ) ) {
				$cached['settings'] = Webino_Dashboard_Sms_Recovery::merge_into_shop_settings( $cached['settings'] );
			}
			if ( class_exists( 'Webino_Dashboard_Sms_Recovery', false ) ) {
				$cached['shortcodes'] = Webino_Dashboard_Sms_Recovery::merge_shortcodes( $cached['shortcodes'] ?? array() );
			}
			return new WP_REST_Response( $cached, 200 );
		}

		$local_catalog = class_exists( 'Webino_Dashboard_Sms_Order_Map', false )
			? Webino_Dashboard_Sms_Order_Map::event_catalog()
			: array();

		$license = Webino_Dashboard_License::instance();
		if ( $license->is_license_active( false ) ) {
			$res = $license->crm_get(
				'wp-json/webinocrm/v1/modirpayamak/settings/shop',
				array(),
				self::CRM_FAST_OPTS
			);
			if ( ! empty( $res['ok'] ) && is_array( $res['data'] ) ) {
				$payload        = $res['data'];
				$templates_res  = $license->crm_get( 'wp-json/webinocrm/v1/modirpayamak/templates', array(), self::CRM_FAST_OPTS );
				$shortcodes_res = $license->crm_get( 'wp-json/webinocrm/v1/modirpayamak/templates/shortcodes', array(), self::CRM_FAST_OPTS );
				$registry_res   = $license->crm_get( 'wp-json/webinocrm/v1/modirpayamak/patterns/registry', array(), self::CRM_FAST_OPTS );
				$crm_keys       = is_array( $payload['event_keys'] ?? null ) ? $payload['event_keys'] : array();
				$event_keys     = array_values(
					array_unique(
						array_merge(
							$crm_keys,
							array_column( $local_catalog, 'key' )
						)
					)
				);
				$response       = array(
					'provider'      => 'modirpayamak',
					'unavailable'   => false,
					'settings'      => $payload['settings'] ?? array(),
					'event_keys'    => array_column( $local_catalog, 'key' ) ?: $event_keys,
					'event_catalog' => $local_catalog ?: ( $payload['event_catalog'] ?? array() ),
					'templates'     => is_array( $templates_res['data'] ?? null ) ? ( $templates_res['data']['templates'] ?? array() ) : array(),
					'shortcodes'    => is_array( $shortcodes_res['data'] ?? null ) ? ( $shortcodes_res['data']['shortcodes'] ?? array() ) : array(),
					'registry'      => is_array( $registry_res['data'] ?? null ) ? ( $registry_res['data']['registry'] ?? array() ) : array(),
				);
				if ( class_exists( 'Webino_Dashboard_Sms_Recovery', false ) ) {
					if ( is_array( $response['settings'] ) ) {
						$response['settings'] = Webino_Dashboard_Sms_Recovery::merge_into_shop_settings( $response['settings'] );
					}
					$response['shortcodes'] = Webino_Dashboard_Sms_Recovery::merge_shortcodes( $response['shortcodes'] ?? array() );
				}
				set_transient( $key, $response, self::SMS_SHOP_CACHE_TTL );
				return new WP_REST_Response( $response, 200 );
			}
		}

		$fallback = array(
			'provider'      => 'modirpayamak',
			'unavailable'   => true,
			'settings'      => Webino_Dashboard_Module_Registry::sms_ready()
				? Webino_Dashboard_Sms_Settings::get()
				: array(),
			'event_keys'    => array_column( $local_catalog, 'key' ),
			'event_catalog' => $local_catalog,
			'templates'     => array(),
			'shortcodes'    => class_exists( 'Webino_Dashboard_Sms_Recovery', false )
				? Webino_Dashboard_Sms_Recovery::merge_shortcodes( array() )
				: array(),
			'registry'      => array(),
		);
		return new WP_REST_Response( $fallback, 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function sms_post( $request ) {
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $request->get_params();
		}
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'invalid_body', __( 'Invalid request body.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$license = Webino_Dashboard_License::instance();
		if ( $license->is_license_active( false ) ) {
			if ( isset( $data['settings'] ) && is_array( $data['settings'] ) ) {
				$settings = $data['settings'];
				if ( class_exists( 'Webino_Dashboard_Sms_Recovery', false ) ) {
					$settings = Webino_Dashboard_Sms_Recovery::merge_into_shop_settings( $settings );
				}
				if ( empty( $settings['event_catalog'] ) && class_exists( 'Webino_Dashboard_Sms_Order_Map', false ) ) {
					$settings['event_catalog'] = Webino_Dashboard_Sms_Order_Map::event_catalog();
				}
				$license->crm_post( 'wp-json/webinocrm/v1/modirpayamak/settings/shop', array( 'settings' => $settings ) );
			}
			if ( isset( $data['templates'] ) && is_array( $data['templates'] ) ) {
				$license->crm_post( 'wp-json/webinocrm/v1/modirpayamak/templates', array( 'templates' => $data['templates'] ) );
			}
			delete_transient( self::sms_shop_cache_key() );
			return self::sms_get();
		}
		if ( ! Webino_Dashboard_Module_Registry::sms_ready() ) {
			return new WP_Error(
				'webino_module_disabled',
				__( 'SMS panel module is not available.', 'webino-dashboard' ),
				array( 'status' => 403 )
			);
		}
		Webino_Dashboard_Sms_Settings::save( $data );
		return self::sms_get();
	}

	/**
	 * Default site SMS settings when CRM is unreachable.
	 *
	 * @return array<string,mixed>
	 */
	private static function site_sms_default_settings() {
		return array(
			'enabled'                => false,
			'sender_line_service'    => '',
			'sender_line_dedicated'  => '',
			'otp_login_enabled'      => false,
			'otp_register_enabled'   => false,
			'otp_expiry_minutes'     => 5,
			'otp_max_attempts'       => 3,
			'otp_length'             => 5,
			'otp_login_template'     => '',
			'otp_register_template'  => '',
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function site_sms_get() {
		$license = Webino_Dashboard_License::instance();
		if ( ! $license->is_license_active( false ) ) {
			return new WP_Error( 'license_inactive', __( 'License is not active.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		$res = $license->crm_get(
			'wp-json/webinocrm/v1/modirpayamak/settings/site',
			array(),
			self::CRM_FAST_OPTS
		);
		if ( empty( $res['ok'] ) ) {
			return new WP_REST_Response(
				array(
					'ok'          => true,
					'unavailable' => true,
					'settings'    => self::site_sms_default_settings(),
				),
				200
			);
		}
		$data = is_array( $res['data'] ) ? $res['data'] : array();
		if ( ! isset( $data['settings'] ) || ! is_array( $data['settings'] ) ) {
			$data['settings'] = self::site_sms_default_settings();
		}
		$data['unavailable'] = false;
		$data['ok']          = true;
		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function site_sms_post( $request ) {
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $request->get_params();
		}
		$license = Webino_Dashboard_License::instance();
		if ( ! $license->is_license_active() ) {
			return new WP_Error( 'license_inactive', __( 'License is not active.', 'webino-dashboard' ), array( 'status' => 403 ) );
		}
		$res = $license->crm_post(
			'wp-json/webinocrm/v1/modirpayamak/settings/site',
			array( 'settings' => is_array( $data['settings'] ?? null ) ? $data['settings'] : $data )
		);
		if ( empty( $res['ok'] ) ) {
			return new WP_Error( 'crm_error', $res['error'] ?? __( 'CRM request failed.', 'webino-dashboard' ), array( 'status' => 502 ) );
		}
		return new WP_REST_Response( is_array( $res['data'] ) ? $res['data'] : array( 'ok' => true ) );
	}
}
