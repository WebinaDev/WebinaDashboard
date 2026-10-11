<?php
/**
 * Marketplace REST proxy + local install lifecycle.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers webino-dashboard/v1/marketplace/* routes.
 */
final class Webino_Dashboard_REST_Marketplace {

	const NS = 'webino-dashboard/v1';

	/** Marketplace catalog transient TTL (seconds). */
	const CATALOG_CACHE_TTL = HOUR_IN_SECONDS;

	/** Fast CRM reads for catalog. */
	const CRM_FAST_OPTS = array(
		'timeout'  => 3,
		'wall_cap' => 6,
	);

	/** @var string|null Pending binary body for module icon REST response. */
	private static $pending_icon_body = null;

	/** @var string|null Pending Content-Type for module icon REST response. */
	private static $pending_icon_type = null;

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'webino_dashboard_module_uninstalled', array( __CLASS__, 'revoke_crm_entitlement' ), 10, 1 );
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_filter( 'rest_pre_serve_request', array( __CLASS__, 'maybe_serve_module_icon_binary' ), 10, 4 );
	}

	/**
	 * Notify CRM when a marketplace module is removed locally.
	 *
	 * @param string $slug Module slug.
	 * @return void
	 */
	public static function revoke_crm_entitlement( $slug ) {
		$slug = sanitize_key( (string) $slug );
		if ( '' === $slug || ! class_exists( 'Webino_Dashboard_License', false ) ) {
			return;
		}
		// Best-effort: ERP Edge may not expose revoke; local uninstall already cleared the module.
		Webino_Dashboard_License::instance()->crm_post(
			'wp-json/webinocrm/v1/marketplace/entitlements/revoke',
			array( 'module_slug' => $slug ),
			'sync'
		);
	}

	/**
	 * Fetch ERP marketplace catalog (single endpoint) and normalize to Dashboard shape.
	 *
	 * @param bool $include_core Include core product rows.
	 * @return array{ ok: bool, categories?: list<array<string,mixed>>, modules?: list<array<string,mixed>>, owned?: list<int|string>, error?: string }
	 */
	public static function fetch_erp_catalog( $include_core = false ) {
		if ( ! class_exists( 'Webino_Dashboard_License', false ) ) {
			return array( 'ok' => false, 'error' => 'license_missing' );
		}
		$license = Webino_Dashboard_License::instance();
		// Prefer POST so HMAC (domain|product|ts) is attached when a shared secret exists.
		$res = $license->crm_post(
			'wp-json/webinocrm/v1/marketplace/catalog',
			array(
				'include_core' => $include_core ? 1 : 0,
			),
			'sync'
		);
		if ( empty( $res['ok'] ) ) {
			return array(
				'ok'    => false,
				'error' => isset( $res['error'] ) ? (string) $res['error'] : 'catalog_failed',
			);
		}
		$raw = is_array( $res['data'] ?? null ) ? $res['data'] : array();
		if ( isset( $raw['data'] ) && is_array( $raw['data'] ) ) {
			$raw = $raw['data'];
		}
		$modules_in = isset( $raw['modules'] ) && is_array( $raw['modules'] ) ? $raw['modules'] : array();
		$cats_in    = isset( $raw['categories'] ) && is_array( $raw['categories'] ) ? $raw['categories'] : array();
		$owned      = isset( $raw['owned_module_ids'] ) && is_array( $raw['owned_module_ids'] )
			? $raw['owned_module_ids']
			: ( isset( $raw['owned'] ) && is_array( $raw['owned'] ) ? $raw['owned'] : array() );
		$owned_ids  = array_map( 'strval', $owned );

		$modules = array();
		foreach ( $modules_in as $m ) {
			if ( ! is_array( $m ) ) {
				continue;
			}
			$id   = isset( $m['id'] ) ? (string) $m['id'] : '';
			$slug = sanitize_key( (string) ( $m['slug'] ?? '' ) );
			if ( '' === $slug ) {
				continue;
			}
			$modules[] = array(
				'id'               => $id,
				'slug'             => $slug,
				'name'             => (string) ( $m['name'] ?? $slug ),
				'description'      => (string) ( $m['description'] ?? '' ),
				'price'            => (float) ( $m['price'] ?? 0 ),
				'currency'         => (string) ( $m['currency'] ?? 'IRT' ),
				'is_free'          => ! empty( $m['is_free'] ) || (float) ( $m['price'] ?? 0 ) <= 0,
				'version'          => (string) ( $m['version'] ?? '' ),
				'category_id'      => $m['category_id'] ?? null,
				'category'         => (string) ( $m['category'] ?? '' ),
				'distribution'     => (string) ( $m['distribution'] ?? 'git' ),
				'requires_license' => array_key_exists( 'requires_license', $m ) ? (bool) $m['requires_license'] : true,
				'git_repo'         => (string) ( $m['git_repo'] ?? '' ),
				'entitled'         => ( '' !== $id && in_array( $id, $owned_ids, true ) ) || ! empty( $m['entitled'] ),
				'icon_url'         => (string) ( $m['icon_url'] ?? '' ),
			);
		}

		$categories = array();
		foreach ( $cats_in as $c ) {
			if ( ! is_array( $c ) ) {
				continue;
			}
			$categories[] = array(
				'id'   => $c['id'] ?? null,
				'name' => (string) ( $c['name'] ?? '' ),
				'slug' => sanitize_key( (string) ( $c['slug'] ?? '' ) ),
			);
		}

		return array(
			'ok'         => true,
			'categories' => $categories,
			'modules'    => $modules,
			'owned'      => $owned,
		);
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/marketplace/catalog',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'catalog' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/installed',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'installed' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/install/(?P<slug>[a-z0-9-]+)',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'install' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/install-status/(?P<job_id>[a-zA-Z0-9]+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'install_status' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/install-job/(?P<job_id>[a-zA-Z0-9]+)/run',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'install_job_run' ),
				'permission_callback' => array( __CLASS__, 'perm_install_job_run' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/uninstall/(?P<slug>[a-z0-9-]+)',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'uninstall' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/toggle/(?P<slug>[a-z0-9-]+)',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'toggle' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/purchase-url/(?P<slug>[a-z0-9-]+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'purchase_url' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/purchase-verify',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'purchase_verify' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/module/(?P<slug>[a-z0-9-]+)/icon',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'module_icon' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/module/(?P<slug>[a-z0-9-]+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'module_detail' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);

		register_rest_route(
			self::NS,
			'/marketplace/settings-sections',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'settings_sections' ),
				'permission_callback' => array( __CLASS__, 'perm_manage' ),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function perm_manage() {
		return Webino_Dashboard_Rest_Base::can( 'manage_options' );
	}

	/**
	 * @return string
	 */
	public static function catalog_cache_key() {
		$domain = Webino_Dashboard_License::instance()->get_current_domain();
		return 'webino_marketplace_catalog_v2_' . md5( $domain );
	}

	/**
	 * @param array<int,array<string,mixed>> $modules Modules from CRM.
	 * @return array<int,array<string,mixed>>
	 */
	private static function filter_installable_catalog_modules( array $modules ) {
		if ( class_exists( 'WebinoCRM_Marketplace_Manager' ) ) {
			return WebinoCRM_Marketplace_Manager::filter_installable_catalog_modules( $modules );
		}
		return array_values(
			array_filter(
				$modules,
				static function ( $mod ) {
					if ( ! is_array( $mod ) ) {
						return false;
					}
					if ( ! empty( $mod['is_core'] ) ) {
						return false;
					}
					if ( 'active' !== (string) ( $mod['status'] ?? 'active' ) ) {
						return false;
					}
					return ! empty( $mod['package_available'] );
				}
			)
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $modules Modules from CRM.
	 * @return array<int,array<string,mixed>>
	 */
	private static function merge_local_module_flags( array $modules ) {
		$local = self::local_by_slug();
		foreach ( $modules as &$mod ) {
			$slug                  = (string) ( $mod['slug'] ?? '' );
			$mod['installed']      = ! empty( $local[ $slug ]['installed'] );
			$mod['active']         = ! empty( $local[ $slug ]['active'] );
			$mod['installed_version'] = (string) ( $local[ $slug ]['version'] ?? '' );
			$latest                = (string) ( $mod['latest_version'] ?? $mod['version'] ?? '' );
			$mod['latest_version'] = $latest;
			if ( isset( $mod['version'] ) && '' !== $latest ) {
				$mod['version'] = $latest;
			}
			$mod['update_available'] = $mod['installed']
				&& '' !== $latest
				&& '' !== $mod['installed_version']
				&& version_compare( $latest, $mod['installed_version'], '>' );
			if ( isset( $mod['icon_url'] ) ) {
				$mod['icon_url'] = self::resolve_module_icon_url( $slug, (string) $mod['icon_url'] );
			}
		}
		unset( $mod );
		return $modules;
	}

	/**
	 * @param array<string,mixed> $mod Single module from CRM.
	 * @return array<string,mixed>
	 */
	private static function merge_local_module_flag( array $mod ) {
		$merged = self::merge_local_module_flags( array( $mod ) );
		return $merged[0] ?? $mod;
	}

	/**
	 * Rewrite CRM-hosted module icons to same-origin proxy URLs.
	 *
	 * @param string $slug Module slug.
	 * @param string $url  Icon URL from CRM catalog.
	 * @return string|null
	 */
	private static function resolve_module_icon_url( $slug, $url ) {
		$url  = trim( (string) $url );
		$slug = sanitize_key( (string) $slug );
		if ( '' === $url || '' === $slug ) {
			return null;
		}
		if ( ! Webino_Dashboard_REST::is_blocked_external_asset_url( $url ) ) {
			return $url;
		}
		return add_query_arg(
			array( 'v' => substr( md5( $url ), 0, 12 ) ),
			rest_url( self::NS . '/marketplace/module/' . rawurlencode( $slug ) . '/icon' )
		);
	}

	/**
	 * @param string $slug Module slug.
	 * @return string
	 */
	private static function fetch_crm_module_raw_icon_url( $slug ) {
		$slug = sanitize_key( (string) $slug );
		if ( '' === $slug ) {
			return '';
		}
		$meta = self::fetch_module_meta( $slug );
		return trim( (string) ( $meta['icon_url'] ?? '' ) );
	}

	/**
	 * @param int $status HTTP status when serving placeholder bytes.
	 * @return WP_REST_Response
	 */
	private static function module_icon_placeholder_response( $status = 404 ) {
		$path = WEBINO_DASHBOARD_DIR . 'assets/dashboard-build/avatar-placeholder.svg';
		if ( is_readable( $path ) ) {
			self::$pending_icon_body  = (string) file_get_contents( $path );
			self::$pending_icon_type  = 'image/svg+xml';
		} elseif ( class_exists( 'Webino_Dashboard_REST', false ) ) {
			$url    = Webino_Dashboard_REST::dashboard_avatar_placeholder_url();
			$fetched = wp_remote_get( $url, array( 'timeout' => 5, 'sslverify' => true ) );
			if ( ! is_wp_error( $fetched ) && 200 === (int) wp_remote_retrieve_response_code( $fetched ) ) {
				self::$pending_icon_body = (string) wp_remote_retrieve_body( $fetched );
				self::$pending_icon_type = 'image/svg+xml';
			} else {
				self::$pending_icon_body = '';
				self::$pending_icon_type = 'image/svg+xml';
			}
		} else {
			self::$pending_icon_body = '';
			self::$pending_icon_type = 'image/svg+xml';
		}
		$response = new WP_REST_Response( null, (int) $status );
		if ( '' !== self::$pending_icon_body ) {
			$response->set_status( 200 );
		}
		$response->header( 'Content-Type', 'image/svg+xml' );
		$response->header( 'Cache-Control', 'public, max-age=3600' );
		return $response;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function module_icon( WP_REST_Request $request ) {
		$slug    = sanitize_key( (string) $request['slug'] );
		$crm_url = self::fetch_crm_module_raw_icon_url( $slug );
		if ( '' === $crm_url ) {
			return self::module_icon_placeholder_response( 404 );
		}

		if ( ! class_exists( 'Webino_Dashboard_Remote_Url', false ) || ! Webino_Dashboard_Remote_Url::is_allowed_download_url( $crm_url ) ) {
			return self::module_icon_placeholder_response( 404 );
		}

		$fetched = wp_remote_get(
			$crm_url,
			array(
				'timeout'     => 10,
				'sslverify'   => true,
				'redirection' => 3,
			)
		);
		if ( is_wp_error( $fetched ) ) {
			return self::module_icon_placeholder_response( 502 );
		}

		$code = (int) wp_remote_retrieve_response_code( $fetched );
		$body = (string) wp_remote_retrieve_body( $fetched );
		$type = wp_remote_retrieve_header( $fetched, 'content-type' );
		if ( $code < 200 || $code >= 300 || '' === $body ) {
			return self::module_icon_placeholder_response( 404 );
		}
		if ( ! is_string( $type ) || 0 !== strpos( strtolower( $type ), 'image/' ) ) {
			return self::module_icon_placeholder_response( 404 );
		}

		self::$pending_icon_body = $body;
		self::$pending_icon_type = strtok( $type, ';' );
		$response                = new WP_REST_Response( null, 200 );
		$response->header( 'Content-Type', self::$pending_icon_type );
		$response->header( 'Cache-Control', 'public, max-age=86400' );
		return $response;
	}

	/**
	 * Serve proxied module icon bytes instead of JSON-encoding the REST response.
	 *
	 * @param bool             $served  Whether request was served.
	 * @param WP_HTTP_Response $result  Response object.
	 * @param WP_REST_Request  $request Request.
	 * @param WP_REST_Server   $server  Server.
	 * @return bool
	 */
	public static function maybe_serve_module_icon_binary( $served, $result, $request, $server ) {
		unset( $server );
		if ( null === self::$pending_icon_body ) {
			return $served;
		}
		if ( ! $request instanceof WP_REST_Request ) {
			self::clear_pending_icon_response();
			return $served;
		}
		$route = (string) $request->get_route();
		if ( ! preg_match( '#^/' . preg_quote( self::NS, '#' ) . '/marketplace/module/[^/]+/icon$#', $route ) ) {
			self::clear_pending_icon_response();
			return $served;
		}

		$status = $result instanceof WP_HTTP_Response ? (int) $result->get_status() : 200;
		status_header( $status );
		if ( $result instanceof WP_HTTP_Response ) {
			foreach ( $result->get_headers() as $key => $values ) {
				foreach ( (array) $values as $value ) {
					header( sprintf( '%s: %s', $key, $value ), false );
				}
			}
		} elseif ( self::$pending_icon_type ) {
			header( 'Content-Type: ' . self::$pending_icon_type );
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo self::$pending_icon_body;
		self::clear_pending_icon_response();
		return true;
	}

	/**
	 * @return void
	 */
	private static function clear_pending_icon_response() {
		self::$pending_icon_body = null;
		self::$pending_icon_type = null;
	}

	/**
	 * @param array<string,mixed> $cat_data Categories payload.
	 * @param array<string,mixed> $mod_data Modules payload.
	 * @return array<string,mixed>
	 */
	private static function build_catalog_payload( array $cat_data, array $mod_data ) {
		$modules = isset( $mod_data['modules'] ) && is_array( $mod_data['modules'] ) ? $mod_data['modules'] : array();
		$modules = self::filter_installable_catalog_modules( $modules );
		return array(
			'categories'  => isset( $cat_data['categories'] ) ? $cat_data['categories'] : array(),
			'modules'     => self::merge_local_module_flags( $modules ),
			'unavailable' => false,
			'stale'       => false,
		);
	}

	/**
	 * @param array<string,mixed> $debug Debug snapshot.
	 * @return array<string,mixed>
	 */
	private static function attach_catalog_debug( array $payload, array $debug ) {
		if ( current_user_can( 'manage_options' ) ) {
			$payload['debug'] = $debug;
		}
		return $payload;
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function catalog() {
		$started = microtime( true );
		$license = Webino_Dashboard_License::instance();
		$key     = self::catalog_cache_key();
		$cached  = get_transient( $key );
		$domain  = $license->get_current_domain();

		$erp   = self::fetch_erp_catalog( false );
		$debug = array(
			'erp_catalog_ok' => ! empty( $erp['ok'] ),
			'elapsed_ms'     => (int) round( ( microtime( true ) - $started ) * 1000 ),
			'domain'         => $domain,
			'source'         => 'erp',
		);

		if ( ! empty( $erp['ok'] ) ) {
			$payload = self::build_catalog_payload(
				array( 'categories' => $erp['categories'] ?? array() ),
				array( 'modules' => $erp['modules'] ?? array() )
			);
			unset( $payload['debug'] );
			set_transient( $key, $payload, self::CATALOG_CACHE_TTL );
			return new WP_REST_Response( self::attach_catalog_debug( $payload, $debug ), 200 );
		}

		if ( is_array( $cached ) ) {
			$cached['stale']       = true;
			$cached['unavailable'] = false;
			$cached['modules']     = self::merge_local_module_flags(
				isset( $cached['modules'] ) && is_array( $cached['modules'] ) ? $cached['modules'] : array()
			);
			unset( $cached['debug'] );
			return new WP_REST_Response( self::attach_catalog_debug( $cached, $debug ), 200 );
		}

		return new WP_REST_Response(
			self::attach_catalog_debug(
				array(
					'categories'  => array(),
					'modules'     => array(),
					'unavailable' => true,
					'stale'       => false,
				),
				$debug
			),
			200
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function module_detail( $request ) {
		$slug = sanitize_key( (string) $request['slug'] );
		$erp  = self::fetch_erp_catalog( true );
		$mod  = null;
		if ( ! empty( $erp['ok'] ) && is_array( $erp['modules'] ?? null ) ) {
			foreach ( $erp['modules'] as $row ) {
				if ( (string) ( $row['slug'] ?? '' ) === $slug ) {
					$mod = $row;
					break;
				}
			}
		}
		if ( ! is_array( $mod ) ) {
			$mod = self::fetch_module_meta( $slug );
		}
		if ( ! is_array( $mod ) || empty( $mod['slug'] ) ) {
			return new WP_REST_Response(
				array(
					'ok'      => false,
					'message' => __( 'Module not found.', 'webino-dashboard' ),
				),
				404
			);
		}
		$module = self::merge_local_module_flag( $mod );
		return new WP_REST_Response(
			array(
				'ok'     => true,
				'module' => $module,
			),
			200
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function installed() {
		$erp     = self::fetch_erp_catalog( false );
		$local   = self::local_by_slug();
		$by_slug = array();
		if ( ! empty( $erp['ok'] ) && is_array( $erp['modules'] ?? null ) ) {
			$catalog = array(
				'ok'   => true,
				'data' => array( 'modules' => $erp['modules'] ),
			);
		} else {
			$catalog = array( 'ok' => false, 'data' => array() );
		}
		$ents = array(
			'ok'   => ! empty( $erp['ok'] ),
			'data' => array(
				'entitlements' => array_values(
					array_filter(
						isset( $erp['modules'] ) && is_array( $erp['modules'] ) ? $erp['modules'] : array(),
						static function ( $m ) {
							return is_array( $m ) && ! empty( $m['entitled'] );
						}
					)
				),
			),
		);
		if ( ! empty( $catalog['ok'] ) && is_array( $catalog['data']['modules'] ?? null ) ) {
			foreach ( $catalog['data']['modules'] as $mod ) {
				$by_slug[ (string) $mod['slug'] ] = $mod;
			}
		}
		$items = array();
		foreach ( $local as $slug => $row ) {
			if ( empty( $row['installed'] ) ) {
				continue;
			}
			$meta = $by_slug[ $slug ] ?? array();
			$local_name = (string) ( $row['name'] ?? $row['settings_title'] ?? '' );
			$items[] = array_merge(
				$meta,
				$row,
				array(
					'slug'      => $slug,
					'name'      => (string) ( $meta['name'] ?? ( $local_name !== '' ? $local_name : $slug ) ),
					'active'    => ! empty( $row['active'] ),
					'installed' => true,
				)
			);
		}
		$items = self::merge_local_module_flags( $items );
		return new WP_REST_Response(
			array(
				'modules'      => $items,
				'entitlements' => ! empty( $ents['ok'] ) && is_array( $ents['data']['entitlements'] ?? null ) ? $ents['data']['entitlements'] : array(),
			),
			200
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function install( WP_REST_Request $request ) {
		$slug    = sanitize_key( (string) $request['slug'] );
		$body    = $request->get_json_params();
		$version = is_array( $body ) ? sanitize_text_field( (string) ( $body['version'] ?? '' ) ) : '';
		if ( Webino_Dashboard_Marketplace_Install_Job::has_active_job_for_slug( $slug ) ) {
			return new WP_Error(
				'install_in_progress',
				__( 'Another install for this module is already running.', 'webino-dashboard' ),
				array( 'status' => 409 )
			);
		}
		$version_err = Webino_Dashboard_Marketplace_Install_Job::validate_requested_version( $slug, $version );
		if ( is_wp_error( $version_err ) ) {
			return $version_err;
		}
		$result  = Webino_Dashboard_Marketplace_Install_Job::start( $slug, $version );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( $result, 202 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function install_status( WP_REST_Request $request ) {
		$job_id = sanitize_key( (string) $request['job_id'] );
		$status = Webino_Dashboard_Marketplace_Install_Job::public_status( $job_id );
		if ( empty( $status ) ) {
			return new WP_Error( 'not_found', __( 'Install job not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( $status, 200 );
	}

	/**
	 * Internal loopback runner for async install jobs.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function install_job_run( WP_REST_Request $request ) {
		$job_id = sanitize_key( (string) $request['job_id'] );
		Webino_Dashboard_Marketplace_Install_Job::run( $job_id );
		$status = Webino_Dashboard_Marketplace_Install_Job::public_status( $job_id );
		return new WP_REST_Response( $status ? $status : array( 'ok' => false ), 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return bool
	 */
	public static function perm_install_job_run( WP_REST_Request $request ) {
		$job_id = sanitize_key( (string) $request['job_id'] );
		$token  = (string) $request->get_header( 'X-Webino-Internal' );
		if ( '' === $token ) {
			return false;
		}
		return Webino_Dashboard_Marketplace_Install_Job::verify_internal_token( $job_id, $token );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function uninstall( WP_REST_Request $request ) {
		$slug = sanitize_key( (string) $request['slug'] );
		$dependents = Webino_Dashboard_Module_Registry::find_dependent_slugs( $slug );
		if ( ! empty( $dependents ) ) {
			return new WP_Error(
				'dependencies_present',
				sprintf(
					/* translators: %s: comma-separated module slugs */
					__( 'Remove dependent modules first: %s', 'webino-dashboard' ),
					implode( ', ', $dependents )
				),
				array(
					'status'     => 400,
					'dependents' => $dependents,
				)
			);
		}
		Webino_Dashboard_Module_Registry::mark_uninstalled( $slug );
		Webino_Dashboard_Module_Registry::remove_module_dir( $slug );
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function toggle( WP_REST_Request $request ) {
		$slug = sanitize_key( (string) $request['slug'] );
		if ( ! Webino_Dashboard_Module_Registry::is_installed( $slug ) ) {
			return new WP_Error( 'not_installed', __( 'Module is not installed.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body   = $request->get_json_params();
		$active = null;
		if ( is_array( $body ) && array_key_exists( 'active', $body ) ) {
			$active = (bool) $body['active'];
		} else {
			$active = ! Webino_Dashboard_Module_Registry::is_active( $slug );
		}
		if ( $active ) {
			$valid = Webino_Dashboard_Module_Registry::validate_installed_package( $slug );
			if ( is_wp_error( $valid ) ) {
				Webino_Dashboard_Module_Registry::set_active( $slug, false );
				return $valid;
			}
			$manifest = Webino_Dashboard_Module_Registry::get_manifest( $slug );
			$deps     = Webino_Dashboard_Module_Registry::validate_module_dependencies( $slug, $manifest );
			if ( is_wp_error( $deps ) ) {
				Webino_Dashboard_Module_Registry::set_active( $slug, false );
				return $deps;
			}
			if ( ! is_array( $manifest ) || ! Webino_Dashboard_Module_Registry::module_package_is_complete( $slug, $manifest ) ) {
				Webino_Dashboard_Module_Registry::set_active( $slug, false );
				return new WP_Error(
					'incomplete_package',
					__( 'Module package is incomplete. Reinstall from the marketplace.', 'webino-dashboard' ),
					array( 'status' => 400 )
				);
			}
		}
		Webino_Dashboard_Module_Registry::set_active( $slug, $active );
		return new WP_REST_Response( array( 'ok' => true, 'active' => $active ), 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function purchase_url( WP_REST_Request $request ) {
		$slug     = sanitize_key( (string) $request['slug'] );
		$license  = Webino_Dashboard_License::instance();
		$callback = Webino_Dashboard_Rewrite::url( 'marketplace/payment-callback' );
		$callback = add_query_arg(
			array(
				'module_slug' => rawurlencode( $slug ),
			),
			$callback
		);
		$res = $license->crm_post(
			'wp-json/webinocrm/v1/marketplace/purchase',
			array(
				'module_slug'  => $slug,
				'callback_url' => $callback,
				'pay'          => true,
			)
		);
		if ( empty( $res['ok'] ) ) {
			$msg = is_array( $res['data'] ?? null ) && ! empty( $res['data']['message'] ) ? (string) $res['data']['message'] : ( $res['error'] ?? __( 'Purchase init failed.', 'webino-dashboard' ) );
			return new WP_Error( 'purchase', $msg, array( 'status' => 502 ) );
		}
		$raw  = is_array( $res['data'] ) ? $res['data'] : array();
		$data = isset( $raw['data'] ) && is_array( $raw['data'] ) ? $raw['data'] : $raw;
		$payment = isset( $data['payment'] ) && is_array( $data['payment'] ) ? $data['payment'] : array();
		// SPA expects purchase/init-shaped fields.
		$out = array_merge(
			$data,
			array(
				'ok'           => true,
				'redirect_url' => (string) ( $payment['redirect_url'] ?? $data['redirect_url'] ?? '' ),
				'payment_url'  => (string) ( $payment['redirect_url'] ?? $data['payment_url'] ?? '' ),
				'is_free'      => empty( $payment ) && ! empty( $data['license'] ),
			)
		);
		return new WP_REST_Response( $out, 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function purchase_verify( WP_REST_Request $request ) {
		$body    = $request->get_json_params();
		$body    = is_array( $body ) ? $body : array();
		$license = Webino_Dashboard_License::instance();
		$res     = $license->crm_post(
			'wp-json/webinocrm/v1/marketplace/payment-callback',
			$body
		);
		if ( empty( $res['ok'] ) ) {
			$msg = is_array( $res['data'] ?? null ) && ! empty( $res['data']['message'] ) ? (string) $res['data']['message'] : ( $res['error'] ?? __( 'Verification failed.', 'webino-dashboard' ) );
			return new WP_Error( 'verify', $msg, array( 'status' => 502 ) );
		}
		$raw = is_array( $res['data'] ) ? $res['data'] : array();
		return new WP_REST_Response( isset( $raw['data'] ) && is_array( $raw['data'] ) ? $raw['data'] : $raw, 200 );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_sections() {
		$sections = apply_filters( 'webino_dashboard_marketplace_settings_sections', array() );
		return new WP_REST_Response( array( 'sections' => $sections ), 200 );
	}

	/**
	 * @return array<string,array<string,mixed>>
	 */
	private static function local_by_slug() {
		$map = array();
		foreach ( Webino_Dashboard_Module_Registry::get_local_state_list() as $row ) {
			$map[ (string) $row['slug'] ] = $row;
		}
		return $map;
	}

	/**
	 * @param string $slug Module slug.
	 * @return array<string,mixed>
	 */
	public static function fetch_module_meta_from_cache( $slug ) {
		$slug  = sanitize_key( (string) $slug );
		$cached = get_transient( self::catalog_cache_key() );
		if ( is_array( $cached ) && is_array( $cached['modules'] ?? null ) ) {
			foreach ( $cached['modules'] as $mod ) {
				if ( (string) ( $mod['slug'] ?? '' ) === $slug ) {
					return $mod;
				}
			}
		}
		return self::fetch_module_meta( $slug );
	}

	/**
	 * @param string $slug Module slug.
	 * @return array<string,mixed>
	 */
	private static function fetch_module_meta( $slug ) {
		$slug = sanitize_key( (string) $slug );
		$erp  = self::fetch_erp_catalog( true );
		if ( empty( $erp['ok'] ) || ! is_array( $erp['modules'] ?? null ) ) {
			return array();
		}
		foreach ( $erp['modules'] as $mod ) {
			if ( (string) ( $mod['slug'] ?? '' ) === $slug ) {
				return $mod;
			}
		}
		return array();
	}

	/**
	 * @param string $zip Zip path.
	 * @param string $dest Destination directory.
	 * @return true|WP_Error
	 */
	public static function unzip_package_to( $zip, $dest ) {
		if ( ! class_exists( 'ZipArchive' ) ) {
			return new WP_Error( 'zip', __( 'ZipArchive is not available.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$archive = new ZipArchive();
		if ( true !== $archive->open( $zip ) ) {
			return new WP_Error( 'zip', __( 'Could not open package ZIP.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		if ( $archive->numFiles < 1 ) {
			$archive->close();
			return new WP_Error( 'zip', __( 'Package ZIP is empty.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$has_manifest  = false;
		$has_bootstrap = false;
		for ( $i = 0; $i < $archive->numFiles; $i++ ) {
			$name = (string) $archive->getNameIndex( $i );
			if ( '' === $name ) {
				continue;
			}
			if ( preg_match( '#(^|/)(manifest\.json)$#', $name ) ) {
				$has_manifest = true;
			}
			if ( preg_match( '#(^|/)(bootstrap\.php)$#', $name ) ) {
				$has_bootstrap = true;
			}
			if ( $has_manifest && $has_bootstrap ) {
				break;
			}
		}
		if ( ! $has_manifest || ! $has_bootstrap ) {
			$archive->close();
			return new WP_Error( 'zip', __( 'Package ZIP must include manifest.json and bootstrap.php.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		if ( ! class_exists( 'Webino_Dashboard_Zip', false ) ) {
			$archive->close();
			return new WP_Error( 'zip', __( 'ZIP helper is not available.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$result = Webino_Dashboard_Zip::safe_extract( $archive, $dest );
		$archive->close();
		return $result;
	}

	/**
	 * If ZIP contains single top-level folder, hoist contents up.
	 *
	 * @param string $dir Module directory.
	 * @return void
	 */
	public static function flatten_single_root_folder( $dir ) {
		$entries = array_diff( scandir( $dir ) ?: array(), array( '.', '..' ) );
		if ( 1 !== count( $entries ) ) {
			return;
		}
		$only = $dir . reset( $entries );
		if ( ! is_dir( $only ) ) {
			return;
		}
		foreach ( array_diff( scandir( $only ) ?: array(), array( '.', '..' ) ) as $item ) {
			rename( $only . '/' . $item, $dir . '/' . $item );
		}
		rmdir( $only );
	}

	/**
	 * @param string $dir Directory.
	 * @return void
	 */
	public static function rrmdir( $dir ) {
		if ( ! is_dir( $dir ) ) {
			return;
		}
		$items = array_diff( scandir( $dir ) ?: array(), array( '.', '..' ) );
		foreach ( $items as $item ) {
			$path = $dir . '/' . $item;
			if ( is_dir( $path ) ) {
				self::rrmdir( $path );
			} else {
				wp_delete_file( $path );
			}
		}
		rmdir( $dir );
	}
}
