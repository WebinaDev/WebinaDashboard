<?php
/**
 * Internationalization.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads plugin textdomain and bridges SPA ui_locale to PHP gettext.
 */
class Webino_Dashboard_I18n {

	/**
	 * @var bool
	 */
	private static $locale_switched = false;

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'rest_pre_dispatch', array( __CLASS__, 'rest_pre_dispatch' ), 10, 3 );
	}

	/**
	 * @return void
	 */
	public static function load_textdomain() {
		load_plugin_textdomain(
			'webino-dashboard',
			false,
			dirname( WEBINO_DASHBOARD_BASENAME ) . '/languages'
		);
	}

	/**
	 * @param string $locale Raw locale.
	 * @return string
	 */
	public static function normalize_locale( $locale ) {
		$locale = (string) $locale;
		if ( '' === $locale ) {
			return function_exists( 'determine_locale' ) ? determine_locale() : get_locale();
		}
		if ( 'fa' === $locale || 0 === strpos( $locale, 'fa' ) ) {
			return 'fa_IR';
		}
		if ( 'en' === $locale || 0 === strpos( $locale, 'en' ) ) {
			return 'en_US';
		}
		return $locale;
	}

	/**
	 * Dashboard UI locale for the current or given user.
	 *
	 * @param int|null $user_id WordPress user ID.
	 * @return string
	 */
	public static function get_user_locale( $user_id = null ) {
		if ( null === $user_id ) {
			$user_id = get_current_user_id();
		}
		$locale = $user_id > 0 ? (string) get_user_meta( (int) $user_id, 'webino_dashboard_locale', true ) : '';
		if ( '' === $locale ) {
			$locale = function_exists( 'determine_locale' ) ? determine_locale() : get_locale();
		}
		return self::normalize_locale( $locale );
	}

	/**
	 * @param callable $fn      Callback.
	 * @param int|null $user_id User ID.
	 * @return mixed
	 */
	public static function with_user_locale( callable $fn, $user_id = null ) {
		self::begin_request_locale( $user_id );
		try {
			return $fn();
		} finally {
			self::end_request_locale();
		}
	}

	/**
	 * @param int|null $user_id User ID.
	 * @return void
	 */
	public static function begin_request_locale( $user_id = null ) {
		if ( self::$locale_switched ) {
			return;
		}
		$locale = self::get_user_locale( $user_id );
		if ( function_exists( 'switch_to_locale' ) ) {
			switch_to_locale( $locale );
		}
		self::load_textdomain();
		Webino_Dashboard_Locale::set_request_locale( $locale );
		self::$locale_switched = true;
	}

	/**
	 * @return void
	 */
	public static function end_request_locale() {
		if ( ! self::$locale_switched ) {
			return;
		}
		Webino_Dashboard_Locale::clear_request_locale();
		if ( function_exists( 'restore_previous_locale' ) ) {
			restore_previous_locale();
		}
		self::$locale_switched = false;
	}

	/**
	 * @param mixed           $result  Response to replace.
	 * @param WP_REST_Server  $server  Server.
	 * @param WP_REST_Request $request Request.
	 * @return mixed
	 */
	public static function rest_pre_dispatch( $result, $server, $request ) {
		unset( $server );
		$route = (string) $request->get_route();
		if ( 0 !== strpos( $route, '/webino-dashboard/v1' ) ) {
			return $result;
		}
		if ( ! is_user_logged_in() ) {
			return $result;
		}
		self::begin_request_locale();
		add_filter( 'rest_post_dispatch', array( __CLASS__, 'rest_post_dispatch_restore_locale' ), 999, 3 );
		return $result;
	}

	/**
	 * @param WP_REST_Response|WP_HTTP_Response|WP_Error|mixed $response Response.
	 * @param WP_REST_Server                                 $server   Server.
	 * @param WP_REST_Request                                $request  Request.
	 * @return mixed
	 */
	public static function rest_post_dispatch_restore_locale( $response, $server, $request ) {
		unset( $server, $request );
		self::end_request_locale();
		remove_filter( 'rest_post_dispatch', array( __CLASS__, 'rest_post_dispatch_restore_locale' ), 999 );
		return $response;
	}
}
