<?php
/**
 * WooCommerce settings REST bridge.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers shop/wc-settings/* and related routes.
 */
final class Webino_Dashboard_REST_WC_Settings {

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
		register_rest_route(
			self::NS,
			'/shop/wc-settings/(?P<page>[a-z0-9_-]+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'page_get' ),
					'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
					'args'                => array(
						'section' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_key',
							'default'           => '',
						),
					),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'page_post' ),
					'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
					'args'                => array(
						'section' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_key',
							'default'           => '',
						),
					),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/shipping/zones',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'shipping_zones_get' ),
					'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'shipping_zones_post' ),
					'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/shipping/zones/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'shipping_zone_patch' ),
					'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'shipping_zone_delete' ),
					'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/payment-gateways',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'payment_gateways_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/payment-gateways/(?P<id>[a-z0-9_-]+)',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'payment_gateway_post' ),
				'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/email-settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'emails_get' ),
				'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/email-settings/(?P<email_id>[a-z0-9_-]+)',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'email_post' ),
				'permission_callback' => array( __CLASS__, 'can_manage_shop' ),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function can_manage_shop() {
		return Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' );
	}

	/**
	 * @return bool
	 */
	private static function bootstrap_wc_admin() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return false;
		}
		if ( ! class_exists( 'WC_Admin_Settings', false ) ) {
			include_once WC_ABSPATH . 'includes/admin/class-wc-admin-settings.php';
		}
		if ( ! class_exists( 'WC_Admin_Settings', false ) ) {
			return false;
		}
		if ( ! function_exists( 'wc_admin_settings' ) ) {
			/**
			 * Ensure settings pages are registered.
			 *
			 * @return void
			 */
			function wc_admin_settings() { // phpcs:ignore WordPress.NamingConventions
				return WC_Admin_Settings::get_settings_pages();
			}
		}
		return true;
	}

	/**
	 * @param string $page_id Page id.
	 * @return WC_Settings_Page|null
	 */
	private static function get_settings_page( $page_id ) {
		if ( ! self::bootstrap_wc_admin() ) {
			return null;
		}
		foreach ( WC_Admin_Settings::get_settings_pages() as $page ) {
			if ( $page->get_id() === $page_id ) {
				return $page;
			}
		}
		return null;
	}

	/**
	 * @param array<int,array<string,mixed>> $fields Raw fields.
	 * @return array<int,array<string,mixed>>
	 */
	private static function filter_schema_fields( array $fields ) {
		$skip_types = array( 'title', 'sectionend', 'info', 'custom', 'slot', 'webhook' );
		$out        = array();
		foreach ( $fields as $field ) {
			if ( ! is_array( $field ) ) {
				continue;
			}
			$type = isset( $field['type'] ) ? (string) $field['type'] : 'text';
			if ( in_array( $type, $skip_types, true ) ) {
				if ( 'title' === $type ) {
					$out[] = array(
						'type'  => 'title',
						'title' => isset( $field['title'] ) ? wp_strip_all_tags( (string) $field['title'] ) : '',
						'desc'  => isset( $field['desc'] ) ? wp_strip_all_tags( (string) $field['desc'] ) : '',
					);
				}
				continue;
			}
			if ( empty( $field['id'] ) ) {
				continue;
			}
			$clean = array(
				'id'      => (string) $field['id'],
				'type'    => $type,
				'title'   => isset( $field['title'] ) ? wp_strip_all_tags( (string) $field['title'] ) : '',
				'desc'    => isset( $field['desc'] ) ? wp_strip_all_tags( (string) $field['desc'] ) : '',
				'default' => $field['default'] ?? '',
			);
			if ( isset( $field['options'] ) && is_array( $field['options'] ) ) {
				$opts = array();
				foreach ( $field['options'] as $k => $v ) {
					$opts[ (string) $k ] = wp_strip_all_tags( (string) $v );
				}
				$clean['options'] = $opts;
			}
			if ( isset( $field['css'] ) ) {
				$clean['css'] = (string) $field['css'];
			}
			$out[] = apply_filters( 'webino_dashboard_wc_settings_field', $clean, $field );
		}
		return apply_filters( 'webino_dashboard_wc_settings_schema', $out, $fields );
	}

	/**
	 * @param array<int,array<string,mixed>> $fields Fields.
	 * @return array<string,mixed>
	 */
	private static function read_field_values( array $fields ) {
		$values = array();
		foreach ( $fields as $field ) {
			if ( ! is_array( $field ) || empty( $field['id'] ) ) {
				continue;
			}
			$type = isset( $field['type'] ) ? (string) $field['type'] : '';
			if ( in_array( $type, array( 'title', 'sectionend', 'info' ), true ) ) {
				continue;
			}
			$id = (string) $field['id'];
			if ( 'checkbox' === $type ) {
				$values[ $id ] = 'yes' === get_option( $id, isset( $field['default'] ) ? $field['default'] : 'no' );
			} elseif ( 'multiselect' === $type || 'multi_select_countries' === $type ) {
				$raw           = get_option( $id, isset( $field['default'] ) ? $field['default'] : array() );
				$values[ $id ] = is_array( $raw ) ? $raw : (array) maybe_unserialize( $raw );
			} else {
				$values[ $id ] = get_option( $id, $field['default'] ?? '' );
			}
		}
		return $values;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function page_get( $request ) {
		$page_id = sanitize_key( (string) $request->get_param( 'page' ) );
		$section = sanitize_key( (string) $request->get_param( 'section' ) );
		$page    = self::get_settings_page( $page_id );
		if ( ! $page ) {
			return new WP_Error( 'wc_page_not_found', __( 'Settings page not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		if ( method_exists( $page, 'get_sections' ) ) {
			$sections = $page->get_sections();
		} else {
			$sections = array();
		}

		if ( method_exists( $page, 'get_settings' ) ) {
			$raw = $page->get_settings( $section );
		} else {
			$raw = array();
		}

		$schema = self::filter_schema_fields( is_array( $raw ) ? $raw : array() );

		return new WP_REST_Response(
			array(
				'page'     => $page_id,
				'section'  => $section,
				'sections' => is_array( $sections ) ? $sections : array(),
				'fields'   => $schema,
				'values'   => self::read_field_values( is_array( $raw ) ? $raw : array() ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function page_post( $request ) {
		$page_id = sanitize_key( (string) $request->get_param( 'page' ) );
		$section = sanitize_key( (string) $request->get_param( 'section' ) );
		$page    = self::get_settings_page( $page_id );
		if ( ! $page ) {
			return new WP_Error( 'wc_page_not_found', __( 'Settings page not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $request->get_params();
		}
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'invalid_body', __( 'Invalid request body.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		if ( method_exists( $page, 'get_settings' ) ) {
			$settings = $page->get_settings( $section );
		} else {
			$settings = array();
		}

		$post_data = array();
		foreach ( $settings as $field ) {
			if ( ! is_array( $field ) || empty( $field['id'] ) ) {
				continue;
			}
			$id = (string) $field['id'];
			if ( ! array_key_exists( $id, $data ) ) {
				continue;
			}
			$type  = isset( $field['type'] ) ? (string) $field['type'] : 'text';
			$value = $data[ $id ];
			if ( 'checkbox' === $type ) {
				$post_data[ $id ] = ! empty( $value ) ? 'yes' : 'no';
			} elseif ( is_array( $value ) ) {
				$post_data[ $id ] = array_map( 'sanitize_text_field', $value );
			} else {
				$post_data[ $id ] = is_string( $value ) ? wp_unslash( $value ) : $value;
			}
		}

		if ( class_exists( 'WC_Admin_Settings', false ) && method_exists( 'WC_Admin_Settings', 'save_fields' ) ) {
			WC_Admin_Settings::save_fields( $settings, $post_data );
		}

		do_action( 'woocommerce_update_options_' . $page_id );

		return self::page_get( $request );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shipping_zones_get() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_Error( 'woocommerce_missing', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		if ( ! class_exists( 'WC_Shipping_Zones', false ) ) {
			include_once WC_ABSPATH . 'includes/class-wc-shipping-zones.php';
		}

		$zones_data = array();
		$zones      = WC_Shipping_Zones::get_zones();
		foreach ( $zones as $z ) {
			$zones_data[] = array(
				'id'          => (int) $z['zone_id'],
				'name'        => (string) $z['zone_name'],
				'order'       => (int) $z['zone_order'],
				'locations'   => $z['zone_locations'],
				'methods'     => $z['shipping_methods'],
				'method_count'=> count( $z['shipping_methods'] ),
			);
		}

		$rest = WC_Shipping_Zones::get_zone( 0 );
		if ( $rest ) {
			$zones_data[] = array(
				'id'           => 0,
				'name'         => $rest->get_zone_name(),
				'order'        => 0,
				'locations'    => $rest->get_zone_locations(),
				'methods'      => $rest->get_shipping_methods(),
				'method_count' => count( $rest->get_shipping_methods() ),
			);
		}

		$global = null;
		$ship_page = self::get_settings_page( 'shipping' );
		if ( $ship_page && method_exists( $ship_page, 'get_settings' ) ) {
			$raw    = $ship_page->get_settings( '' );
			$global = array(
				'fields' => self::filter_schema_fields( is_array( $raw ) ? $raw : array() ),
				'values' => self::read_field_values( is_array( $raw ) ? $raw : array() ),
			);
		}

		return new WP_REST_Response(
			array(
				'zones'  => $zones_data,
				'global' => $global,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shipping_zones_post( $request ) {
		if ( ! class_exists( 'WC_Shipping_Zone', false ) ) {
			include_once WC_ABSPATH . 'includes/class-wc-shipping-zone.php';
		}
		$name = sanitize_text_field( (string) $request->get_param( 'name' ) );
		if ( '' === $name ) {
			return new WP_Error( 'invalid_name', __( 'Zone name is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$zone = new WC_Shipping_Zone();
		$zone->set_zone_name( $name );
		$zone->save();
		return self::shipping_zones_get();
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shipping_zone_patch( $request ) {
		$id = (int) $request->get_param( 'id' );
		if ( $id <= 0 ) {
			return new WP_Error( 'invalid_zone', __( 'Cannot edit this zone.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( ! class_exists( 'WC_Shipping_Zone', false ) ) {
			include_once WC_ABSPATH . 'includes/class-wc-shipping-zone.php';
		}
		$zone = WC_Shipping_Zones::get_zone( $id );
		if ( ! $zone ) {
			return new WP_Error( 'zone_not_found', __( 'Zone not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$name = $request->get_param( 'name' );
		if ( null !== $name ) {
			$zone->set_zone_name( sanitize_text_field( (string) $name ) );
		}
		$zone->save();
		return self::shipping_zones_get();
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function shipping_zone_delete( $request ) {
		$id = (int) $request->get_param( 'id' );
		if ( $id <= 0 ) {
			return new WP_Error( 'invalid_zone', __( 'Cannot delete this zone.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( ! class_exists( 'WC_Shipping_Zones', false ) ) {
			include_once WC_ABSPATH . 'includes/class-wc-shipping-zones.php';
		}
		$zone = WC_Shipping_Zones::get_zone( $id );
		if ( ! $zone ) {
			return new WP_Error( 'zone_not_found', __( 'Zone not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$zone->delete();
		return self::shipping_zones_get();
	}

	/**
	 * @param string $key   Field key.
	 * @param array  $field Gateway field schema.
	 * @return bool
	 */
	private static function is_sensitive_gateway_field( $key, $field ) {
		$type = isset( $field['type'] ) ? strtolower( (string) $field['type'] ) : '';
		if ( in_array( $type, array( 'password', 'secret' ), true ) ) {
			return true;
		}
		$key_l = strtolower( (string) $key );
		return (bool) preg_match( '/(secret|password|token|api_key|apikey|private)/', $key_l );
	}

	/**
	 * @param mixed $value Raw option value.
	 * @return array{value: string, has_value: bool}
	 */
	private static function mask_gateway_setting_value( $value ) {
		$str = is_scalar( $value ) ? (string) $value : '';
		return array(
			'value'     => '' !== $str ? '********' : '',
			'has_value' => '' !== $str,
		);
	}

	public static function payment_gateways_get() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_Error( 'woocommerce_missing', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$gateways = WC()->payment_gateways()->payment_gateways();
		$out      = array();
		foreach ( $gateways as $id => $gateway ) {
			if ( ! is_object( $gateway ) ) {
				continue;
			}
			$form_fields = method_exists( $gateway, 'get_form_fields' ) ? $gateway->get_form_fields() : array();
			$schema      = array();
			foreach ( $form_fields as $key => $field ) {
				if ( ! is_array( $field ) ) {
					continue;
				}
				$schema[] = array(
					'id'      => (string) $key,
					'type'    => isset( $field['type'] ) ? (string) $field['type'] : 'text',
					'title'   => isset( $field['title'] ) ? wp_strip_all_tags( (string) $field['title'] ) : '',
					'desc'    => isset( $field['description'] ) ? wp_strip_all_tags( (string) $field['description'] ) : '',
					'default' => $field['default'] ?? '',
					'options' => isset( $field['options'] ) && is_array( $field['options'] ) ? $field['options'] : null,
				);
			}
			$settings = array();
			foreach ( $form_fields as $key => $field ) {
				$raw = $gateway->get_option( $key, $field['default'] ?? '' );
				if ( self::is_sensitive_gateway_field( $key, is_array( $field ) ? $field : array() ) ) {
					$settings[ $key ] = self::mask_gateway_setting_value( $raw );
				} else {
					$settings[ $key ] = $raw;
				}
			}
			$out[] = array(
				'id'          => (string) $id,
				'title'       => $gateway->get_method_title(),
				'description' => $gateway->get_method_description(),
				'enabled'     => 'yes' === $gateway->enabled,
				'fields'      => $schema,
				'settings'    => $settings,
			);
		}
		return new WP_REST_Response( array( 'gateways' => $out ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function payment_gateway_post( $request ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_Error( 'woocommerce_missing', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		$id       = sanitize_key( (string) $request->get_param( 'id' ) );
		$gateways = WC()->payment_gateways()->payment_gateways();
		if ( empty( $gateways[ $id ] ) ) {
			return new WP_Error( 'gateway_not_found', __( 'Gateway not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$gateway = $gateways[ $id ];
		$data    = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $request->get_params();
		}
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'invalid_body', __( 'Invalid request body.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( array_key_exists( 'enabled', $data ) ) {
			$gateway->update_option( 'enabled', ! empty( $data['enabled'] ) ? 'yes' : 'no' );
		}
		if ( ! empty( $data['settings'] ) && is_array( $data['settings'] ) ) {
			foreach ( $data['settings'] as $key => $value ) {
				$key = sanitize_key( (string) $key );
				if ( '' === $key ) {
					continue;
				}
				if ( is_array( $value ) && isset( $value['value'] ) && '********' === (string) $value['value'] ) {
					continue;
				}
				if ( is_string( $value ) && '********' === $value ) {
					continue;
				}
				$gateway->update_option( $key, is_string( $value ) ? wp_unslash( $value ) : $value );
			}
		}
		return self::payment_gateways_get();
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function emails_get() {
		if ( ! self::bootstrap_wc_admin() ) {
			return new WP_Error( 'woocommerce_missing', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 503 ) );
		}
		if ( ! class_exists( 'WC_Emails', false ) ) {
			include_once WC_ABSPATH . 'includes/class-wc-emails.php';
		}
		$mailer = WC()->mailer();
		$emails = $mailer->get_emails();
		$out    = array();
		foreach ( $emails as $email ) {
			if ( ! is_object( $email ) ) {
				continue;
			}
			$form_fields = method_exists( $email, 'get_form_fields' ) ? $email->get_form_fields() : array();
			$schema      = array();
			foreach ( $form_fields as $key => $field ) {
				if ( ! is_array( $field ) ) {
					continue;
				}
				$schema[] = array(
					'id'      => (string) $key,
					'type'    => isset( $field['type'] ) ? (string) $field['type'] : 'text',
					'title'   => isset( $field['title'] ) ? wp_strip_all_tags( (string) $field['title'] ) : '',
					'desc'    => isset( $field['description'] ) ? wp_strip_all_tags( (string) $field['description'] ) : '',
					'default' => $field['default'] ?? '',
				);
			}
			$settings = array();
			foreach ( $form_fields as $key => $field ) {
				$settings[ $key ] = $email->get_option( $key, $field['default'] ?? '' );
			}
			$out[] = array(
				'id'          => $email->id,
				'title'       => $email->get_title(),
				'description' => $email->get_description(),
				'enabled'     => $email->is_enabled(),
				'fields'      => $schema,
				'settings'    => $settings,
			);
		}

		$page    = self::get_settings_page( 'email' );
		$global  = null;
		if ( $page && method_exists( $page, 'get_settings' ) ) {
			$raw    = $page->get_settings( '' );
			$global = array(
				'fields' => self::filter_schema_fields( is_array( $raw ) ? $raw : array() ),
				'values' => self::read_field_values( is_array( $raw ) ? $raw : array() ),
			);
		}

		return new WP_REST_Response(
			array(
				'emails' => $out,
				'global' => $global,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function email_post( $request ) {
		if ( ! class_exists( 'WC_Emails', false ) ) {
			include_once WC_ABSPATH . 'includes/class-wc-emails.php';
		}
		$email_id = sanitize_key( (string) $request->get_param( 'email_id' ) );
		$mailer   = WC()->mailer();
		$emails   = $mailer->get_emails();
		$email    = null;
		foreach ( $emails as $e ) {
			if ( $e->id === $email_id ) {
				$email = $e;
				break;
			}
		}
		if ( ! $email ) {
			return new WP_Error( 'email_not_found', __( 'Email not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$data = $request->get_json_params();
		if ( ! is_array( $data ) ) {
			$data = $request->get_params();
		}
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'invalid_body', __( 'Invalid request body.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( array_key_exists( 'enabled', $data ) ) {
			$email->update_option( 'enabled', ! empty( $data['enabled'] ) ? 'yes' : 'no' );
		}
		if ( ! empty( $data['settings'] ) && is_array( $data['settings'] ) ) {
			foreach ( $data['settings'] as $key => $value ) {
				$key = sanitize_key( (string) $key );
				if ( '' === $key ) {
					continue;
				}
				$email->update_option( $key, is_string( $value ) ? wp_unslash( $value ) : $value );
			}
		}
		return self::emails_get();
	}
}
