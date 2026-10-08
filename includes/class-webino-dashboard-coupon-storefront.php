<?php
/**
 * Storefront coupon rules: single active coupon, cart chooser, next-coupon progress,
 * safe auto-apply, discount caps and offer-condition enforcement.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cart-side coupon behaviour on top of WooCommerce coupons.
 */
final class Webino_Dashboard_Coupon_Storefront {

	const OPTION           = 'webino_coupon_storefront';
	const DATA_VERSION_OPT = 'webino_coupon_data_version';
	const DATA_VERSION     = 1;

	const SESSION_AUTO   = 'webino_coupon_auto';
	const SESSION_OPTOUT = 'webino_coupon_optout';
	const SESSION_FLASH  = 'webino_coupon_flash';
	const SESSION_SHIP   = 'webino_coupon_ship_base';

	const AJAX_STATE  = 'webino_coupons_state';
	const AJAX_SELECT = 'webino_coupon_select';
	const NONCE       = 'webino_coupon_select';

	/**
	 * Depth of coupon add/remove operations started by this class.
	 *
	 * @var int
	 */
	private static $internal = 0;

	/**
	 * Code of a coupon WooCommerce is applying right now (set before it removes the previous individual-use
	 * coupon, which recalculates totals). While set, auto-apply stays out and the removal is not an opt-out.
	 *
	 * @var string
	 */
	private static $applying = '';

	/**
	 * Guard for woocommerce_after_calculate_totals re-entrancy.
	 *
	 * @var bool
	 */
	private static $in_after_totals = false;

	/**
	 * Cart contents changed during this request (add / remove / qty).
	 *
	 * @var bool
	 */
	private static $cart_changed = false;

	/**
	 * Applied coupons were re-validated during this request.
	 *
	 * @var bool
	 */
	private static $revalidated = false;

	/**
	 * When true, minimum-spend / minimum-items checks are skipped (used to find "next" coupons).
	 *
	 * @var bool
	 */
	private static $bypass_thresholds = false;

	/**
	 * Running discount-cap allocation per coupon code for the current WC_Discounts pass.
	 *
	 * @var array<string, array{remaining: float, left: int}>
	 */
	private static $cap_state = array();

	/**
	 * Per-request cache of order counts.
	 *
	 * @var array<string, int>
	 */
	private static $order_count_cache = array();

	/**
	 * Per-request cache of customer-visible coupons.
	 *
	 * @var array<int, WC_Coupon>|null
	 */
	private static $candidates = null;

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;

		// Single active coupon (classic cart, mini-cart, Store API / blocks, bots).
		add_filter( 'woocommerce_apply_with_individual_use_coupon', array( __CLASS__, 'filter_apply_with_individual_use' ), 20, 4 );
		add_filter( 'woocommerce_apply_individual_use_coupon', array( __CLASS__, 'mark_applying' ), 1, 2 );
		add_action( 'woocommerce_applied_coupon', array( __CLASS__, 'on_applied_coupon' ), 5 );
		add_action( 'woocommerce_removed_coupon', array( __CLASS__, 'on_removed_coupon' ), 5 );
		add_action( 'woocommerce_before_calculate_totals', array( __CLASS__, 'enforce_single_coupon' ), 1 );
		add_filter( 'woocommerce_coupon_message', array( __CLASS__, 'filter_coupon_message' ), 20, 3 );

		// Cart change tracking → graceful re-validation of applied coupons.
		foreach ( array( 'woocommerce_add_to_cart', 'woocommerce_cart_item_removed', 'woocommerce_after_cart_item_quantity_update', 'woocommerce_cart_item_restored', 'woocommerce_cart_item_set_quantity' ) as $hook ) {
			add_action( $hook, array( __CLASS__, 'mark_cart_changed' ), 10, 0 );
		}
		add_action( 'woocommerce_cart_emptied', array( __CLASS__, 'on_cart_emptied' ), 10, 0 );
		add_action( 'woocommerce_after_calculate_totals', array( __CLASS__, 'after_calculate_totals' ), 30 );

		// Offer conditions (min items / Nth order) are enforced server-side, not only in auto-apply.
		add_filter( 'woocommerce_coupon_is_valid', array( __CLASS__, 'validate_offer_conditions' ), 15, 3 );
		add_action( 'woocommerce_after_checkout_validation', array( __CLASS__, 'validate_checkout_conditions' ), 15, 2 );
		add_filter( 'woocommerce_coupon_validate_minimum_amount', array( __CLASS__, 'filter_minimum_amount_check' ), 99, 3 );

		// Max-discount cap for percentage coupons.
		add_filter( 'woocommerce_coupon_get_items_to_apply', array( __CLASS__, 'prepare_discount_cap' ), 20, 3 );
		add_filter( 'woocommerce_coupon_get_discount_amount', array( __CLASS__, 'apply_discount_cap' ), 20, 5 );

		// Storefront UI.
		// Full-width slider above the cart table / checkout form (after WooCommerce notices).
		add_action( 'woocommerce_before_cart', array( __CLASS__, 'render_cart_chooser' ), 20 );
		add_action( 'woocommerce_before_checkout_form', array( __CLASS__, 'render_cart_chooser' ), 12 );
		add_filter( 'woocommerce_update_order_review_fragments', array( __CLASS__, 'order_review_fragments' ) );
		add_action( 'wc_ajax_' . self::AJAX_STATE, array( __CLASS__, 'ajax_state' ) );
		add_action( 'wc_ajax_' . self::AJAX_SELECT, array( __CLASS__, 'ajax_select' ) );

		add_action( 'init', array( __CLASS__, 'maybe_upgrade_data' ), 30 );

		// Cached empty-cart tier must follow coupon edits.
		add_action( 'save_post_shop_coupon', array( __CLASS__, 'bump_revision' ), 20, 1 );
		add_action( 'trashed_post', array( __CLASS__, 'bump_revision' ), 20, 1 );
		add_action( 'untrashed_post', array( __CLASS__, 'bump_revision' ), 20, 1 );
		add_action( 'deleted_post', array( __CLASS__, 'bump_revision' ), 20, 1 );
		add_action( 'added_post_meta', array( __CLASS__, 'bump_revision_meta' ), 20, 3 );
		add_action( 'updated_post_meta', array( __CLASS__, 'bump_revision_meta' ), 20, 3 );
		add_action( 'deleted_post_meta', array( __CLASS__, 'bump_revision_meta' ), 20, 3 );
	}

	/* ---------------------------------------------------------------------
	 * Settings
	 * ------------------------------------------------------------------- */

	/**
	 * @return array<string, bool>
	 */
	public static function defaults() {
		return array(
			'single_coupon'   => true,
			'cart_chooser'    => true,
			'progress_widget' => true,
			'auto_apply'      => true,
		);
	}

	/**
	 * @return array<string, bool>
	 */
	public static function settings() {
		$raw = get_option( self::OPTION, array() );
		$out = self::defaults();
		if ( is_array( $raw ) ) {
			foreach ( $out as $key => $default ) {
				if ( array_key_exists( $key, $raw ) ) {
					$out[ $key ] = (bool) $raw[ $key ];
				}
			}
		}
		return $out;
	}

	/**
	 * @param string $key Setting key.
	 * @return bool
	 */
	public static function enabled( $key ) {
		$s = self::settings();
		return ! empty( $s[ $key ] );
	}

	/**
	 * @param array<string, mixed> $input Partial settings.
	 * @return array<string, bool>
	 */
	public static function save_settings( $input ) {
		$current = self::settings();
		if ( is_array( $input ) ) {
			foreach ( array_keys( $current ) as $key ) {
				if ( array_key_exists( $key, $input ) && null !== $input[ $key ] ) {
					$current[ $key ] = filter_var( $input[ $key ], FILTER_VALIDATE_BOOLEAN );
				}
			}
		}
		update_option( self::OPTION, $current, true );
		return $current;
	}

	/**
	 * REST: GET settings.
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_get_settings() {
		return new WP_REST_Response( self::settings() );
	}

	/**
	 * REST: POST settings.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function rest_save_settings( $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = $request->get_params();
		}
		return new WP_REST_Response( self::save_settings( is_array( $body ) ? $body : array() ) );
	}

	/* ---------------------------------------------------------------------
	 * Helpers
	 * ------------------------------------------------------------------- */

	/**
	 * Convert Persian/Arabic digits and separators to a plain decimal string ('' when empty / invalid).
	 *
	 * @param mixed $value Raw value.
	 * @return string
	 */
	public static function normalize_decimal( $value ) {
		if ( null === $value || is_bool( $value ) || is_array( $value ) || is_object( $value ) ) {
			return '';
		}
		if ( is_int( $value ) || is_float( $value ) ) {
			if ( ! is_finite( (float) $value ) ) {
				return '';
			}
			$value = (string) $value;
		}
		$s = trim( (string) $value );
		if ( '' === $s ) {
			return '';
		}
		$s = strtr(
			$s,
			array(
				'۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
				'۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
				'٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
				'٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
				'٫' => '.', '٬' => '', '،' => '', ' ' => '', "\xC2\xA0" => '', "\xE2\x80\x8C" => '', '_' => '',
			)
		);
		$decimal_sep = function_exists( 'wc_get_price_decimal_separator' ) ? (string) wc_get_price_decimal_separator() : '.';
		if ( ',' === $decimal_sep ) {
			$s = str_replace( '.', '', $s );
			$s = str_replace( ',', '.', $s );
		} else {
			$s = str_replace( ',', '', $s );
		}
		$s = preg_replace( '/[^0-9.\-]/', '', $s );
		if ( '' === $s || ! is_numeric( $s ) ) {
			return '';
		}
		$f = (float) $s;
		if ( ! is_finite( $f ) ) {
			return '';
		}
		return function_exists( 'wc_format_decimal' ) ? (string) wc_format_decimal( $s ) : $s;
	}

	/**
	 * @return bool
	 */
	private static function is_rest_request() {
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return true;
		}
		if ( function_exists( 'WC' ) && WC() && method_exists( WC(), 'is_rest_api_request' ) ) {
			return (bool) WC()->is_rest_api_request();
		}
		return false;
	}

	/**
	 * @return bool
	 */
	private static function is_own_ajax() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$action = isset( $_GET['wc-ajax'] ) ? sanitize_key( wp_unslash( $_GET['wc-ajax'] ) ) : '';
		return in_array( $action, array( self::AJAX_STATE, self::AJAX_SELECT ), true );
	}

	/**
	 * Show a customer-facing message. REST / our own endpoints queue it for the storefront widget.
	 *
	 * @param string $message Plain text.
	 * @param string $type    notice|success|error.
	 * @return void
	 */
	private static function notify( $message, $type = 'notice' ) {
		$message = (string) $message;
		if ( '' === $message ) {
			return;
		}
		if ( self::is_rest_request() || self::is_own_ajax() || ! function_exists( 'wc_add_notice' ) || ( function_exists( 'wp_doing_cron' ) && wp_doing_cron() ) ) {
			if ( function_exists( 'WC' ) && WC()->session ) {
				$flash   = WC()->session->get( self::SESSION_FLASH );
				$flash   = is_array( $flash ) ? $flash : array();
				$flash[] = array(
					'type' => $type,
					'text' => $message,
				);
				WC()->session->set( self::SESSION_FLASH, array_slice( $flash, -5 ) );
			}
			return;
		}
		if ( ! wc_has_notice( $message, $type ) ) {
			wc_add_notice( self::text_html( $message ), $type );
		}
	}

	/**
	 * @return array<int, array{type:string,text:string}>
	 */
	private static function pull_flash() {
		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return array();
		}
		$flash = WC()->session->get( self::SESSION_FLASH );
		if ( $flash ) {
			WC()->session->set( self::SESSION_FLASH, null );
		}
		return is_array( $flash ) ? array_values( $flash ) : array();
	}

	/**
	 * Snapshot the WooCommerce notice queue (so endpoint-local notices can be dropped without losing others).
	 *
	 * @return array
	 */
	private static function notices_snapshot() {
		return function_exists( 'wc_get_notices' ) ? (array) wc_get_notices() : array();
	}

	/**
	 * Restore a notice snapshot; returns error texts that were added since.
	 *
	 * @param array $snapshot Snapshot from notices_snapshot().
	 * @return array<int, string>
	 */
	private static function notices_restore( $snapshot ) {
		$errors = array();
		if ( ! function_exists( 'wc_get_notices' ) ) {
			return $errors;
		}
		$now    = (array) wc_get_notices( 'error' );
		$before = isset( $snapshot['error'] ) ? (array) $snapshot['error'] : array();
		foreach ( array_slice( $now, count( $before ) ) as $n ) {
			$text = wp_strip_all_tags( is_array( $n ) ? (string) ( $n['notice'] ?? '' ) : (string) $n );
			if ( '' !== $text ) {
				$errors[] = html_entity_decode( $text, ENT_QUOTES, 'UTF-8' );
			}
		}
		if ( function_exists( 'wc_set_notices' ) ) {
			wc_set_notices( $snapshot );
		}
		return $errors;
	}

	/**
	 * Plain-text price in store currency (respects decimals / separators / symbol position).
	 *
	 * @param float $amount Amount.
	 * @return string
	 */
	public static function price_text( $amount ) {
		$amount = (float) $amount;
		if ( ! function_exists( 'wc_price' ) ) {
			return self::digits( (string) $amount );
		}
		// Use the store's own formatter (other plugins may convert Rial/Toman or swap the symbol for a glyph),
		// then make sure the number and the currency name are separated by a non-breaking space.
		$html = (string) wc_price( $amount, self::price_args() );
		$html = preg_replace( '#<span[^>]*class="[^"]*screen-reader-text[^"]*"[^>]*>(.*?)</span>#u', ' $1 ', $html );
		$text = html_entity_decode( wp_strip_all_tags( (string) $html ), ENT_QUOTES, 'UTF-8' );
		$text = str_replace( array( "\u{00A0}", "\u{202F}", "\u{200F}", "\u{200E}" ), ' ', $text );
		$text = trim( (string) preg_replace( '/[ \t\r\n]+/', ' ', $text ) );
		$d    = '0-9\x{06F0}-\x{06F9}\x{0660}-\x{0669}';
		$text = (string) preg_replace( '/([' . $d . '])(?=[^ ' . $d . ',.\x{066B}\x{066C}\-+])/u', '$1 ', $text );
		$text = (string) preg_replace( '/([^ ' . $d . ',.\x{066B}\x{066C}\-+])(?=[' . $d . '])/u', '$1 ', $text );
		$text = trim( (string) preg_replace( '/ +/', ' ', $text ) );
		return str_replace( ' ', "\u{00A0}", self::digits( $text ) );
	}

	/**
	 * Store-formatted price HTML (wc_price) with digits matching the storefront language.
	 *
	 * @param float $amount Amount.
	 * @return string
	 */
	public static function price_html( $amount ) {
		if ( ! function_exists( 'wc_price' ) || self::use_toman_glyph() ) {
			return '<span class="webino-cc-price">' . self::text_html( self::price_text( $amount ) ) . '</span>';
		}
		return '<span class="webino-cc-price">' . self::digits_html( (string) wc_price( (float) $amount, self::price_args() ) ) . '</span>';
	}

	/**
	 * Toman stores show the site's Toman icon (same glyph as the wfcp price module) instead of the word.
	 *
	 * @return bool
	 */
	public static function use_toman_glyph() {
		static $cached = null;
		if ( null === $cached ) {
			$code   = function_exists( 'get_woocommerce_currency' ) ? strtoupper( (string) get_woocommerce_currency() ) : '';
			$cached = (bool) apply_filters( 'webino_coupon_storefront_toman_glyph', in_array( $code, array( 'IRT', 'TOMAN', 'IRHT' ), true ) );
		}
		return $cached;
	}

	/**
	 * Escape a customer-facing text and turn every "<number> تومان" into number + Toman icon
	 * (inline-flex in the text direction → RTL shows the number first, the icon after it; screen readers hear "تومان").
	 *
	 * @param string $text Plain text.
	 * @return string Safe HTML.
	 */
	public static function text_html( $text ) {
		$html = esc_html( (string) $text );
		if ( ! self::use_toman_glyph() ) {
			return $html;
		}
		$label = esc_html( _x( 'Toman', 'currency name for screen readers', 'webino-dashboard' ) );
		$d     = '0-9\x{06F0}-\x{06F9}\x{0660}-\x{0669}';
		$out   = preg_replace(
			'/([' . $d . '](?:[' . $d . ',.\x{066B}\x{066C}]*[' . $d . '])?)(?:\x{00A0}|&nbsp;|\s)*(?:تومان|Toman|IRT)/u',
			'<span class="webino-money"><span class="webino-money__n">$1</span><span class="webino-toman" aria-hidden="true"></span><span class="webino-sr">' . $label . '</span></span>',
			$html
		);
		return is_string( $out ) ? $out : $html;
	}

	/**
	 * wc_price() args for our own amounts. Persian reads "۵۰۰,۰۰۰ تومان" (number, then currency): a store set to
	 * "currency left" would otherwise put تومان before the number in every RTL sentence. Separators and decimals
	 * stay the store's, so amounts match the rest of the shop.
	 *
	 * @return array<string, string>
	 */
	public static function price_args() {
		$args = array();
		if ( self::use_persian_digits() ) {
			/* %1$s = currency symbol, %2$s = amount */
			$args['price_format'] = '%2$s&nbsp;%1$s';
		}
		return (array) apply_filters( 'webino_coupon_storefront_price_args', $args );
	}

	/**
	 * Show Persian digits on Persian storefronts (filterable).
	 *
	 * @return bool
	 */
	public static function use_persian_digits() {
		static $cached = null;
		if ( null === $cached ) {
			$locale = function_exists( 'determine_locale' ) ? determine_locale() : get_locale();
			$cached = (bool) apply_filters( 'webino_coupon_storefront_persian_digits', 0 === strpos( (string) $locale, 'fa' ) );
		}
		return $cached;
	}

	/**
	 * @param string $text Text.
	 * @return string
	 */
	public static function digits( $text ) {
		$text = (string) $text;
		if ( ! self::use_persian_digits() ) {
			return $text;
		}
		return strtr(
			$text,
			array(
				'0' => '۰', '1' => '۱', '2' => '۲', '3' => '۳', '4' => '۴', '5' => '۵', '6' => '۶', '7' => '۷', '8' => '۸', '9' => '۹',
				'٠' => '۰', '١' => '۱', '٢' => '۲', '٣' => '۳', '٤' => '۴', '٥' => '۵', '٦' => '۶', '٧' => '۷', '٨' => '۸', '٩' => '۹',
				'%' => '٪',
			)
		);
	}

	/**
	 * Convert digits in HTML text nodes only (attributes untouched).
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	public static function digits_html( $html ) {
		$html = (string) $html;
		if ( ! self::use_persian_digits() ) {
			return $html;
		}
		$out = preg_replace_callback(
			'/>([^<]+)</u',
			static function ( $m ) {
				// Decode entities first (wc_price encodes the currency symbol as &#x...; — its hex digits must not change).
				$text = html_entity_decode( $m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8' );
				return '>' . htmlspecialchars( self::digits( $text ), ENT_NOQUOTES, 'UTF-8' ) . '<';
			},
			'>' . $html . '<'
		);
		return is_string( $out ) ? substr( $out, 1, -1 ) : $html;
	}

	/**
	 * @param string $code Coupon code.
	 * @return string
	 */
	private static function fmt_code( $code ) {
		return function_exists( 'wc_format_coupon_code' ) ? wc_format_coupon_code( (string) $code ) : strtolower( trim( (string) $code ) );
	}

	/**
	 * @param WC_Coupon $coupon Coupon.
	 * @return float
	 */
	public static function get_max_discount( $coupon ) {
		if ( ! ( $coupon instanceof WC_Coupon ) || ! $coupon->get_id() ) {
			return 0.0;
		}
		$raw = get_post_meta( $coupon->get_id(), '_webino_offer_max_discount', true );
		$n   = self::normalize_decimal( $raw );
		return '' === $n ? 0.0 : max( 0.0, (float) $n );
	}

	/**
	 * @param WC_Cart|null $cart Cart.
	 * @return float Subtotal as WooCommerce compares it to coupon min/max spend.
	 */
	public static function cart_amount( $cart = null ) {
		$cart = $cart ? $cart : ( function_exists( 'WC' ) ? WC()->cart : null );
		if ( ! $cart ) {
			return 0.0;
		}
		return max( 0.0, (float) $cart->get_displayed_subtotal() );
	}

	/* ---------------------------------------------------------------------
	 * Single active coupon
	 * ------------------------------------------------------------------- */

	/**
	 * Remember which coupon WooCommerce is applying before it removes the previous individual-use one.
	 *
	 * @param array          $keep   Coupons to keep.
	 * @param WC_Coupon|null $coupon Coupon being applied.
	 * @return array
	 */
	public static function mark_applying( $keep, $coupon = null ) {
		if ( $coupon instanceof WC_Coupon && self::$internal < 1 ) {
			self::$applying = self::fmt_code( $coupon->get_code() );
		}
		return $keep;
	}

	/**
	 * Allow a new coupon to be applied even when the current one is "individual use"; the old one is then replaced.
	 *
	 * @param bool           $allow    Allow.
	 * @param WC_Coupon|null $new      Coupon being applied.
	 * @param WC_Coupon|null $existing Individual-use coupon already in the cart.
	 * @param array          $applied  Applied codes.
	 * @return bool
	 */
	public static function filter_apply_with_individual_use( $allow, $new = null, $existing = null, $applied = array() ) {
		unset( $new, $existing, $applied );
		return self::enabled( 'single_coupon' ) ? true : $allow;
	}

	/**
	 * Replace previously applied coupons when a customer applies a new one.
	 *
	 * @param string $code Applied code.
	 * @return void
	 */
	public static function on_applied_coupon( $code ) {
		self::$applying = '';
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return;
		}
		$code = self::fmt_code( $code );
		if ( self::$internal > 0 ) {
			return;
		}
		if ( WC()->session ) {
			// A coupon chosen by the customer always wins over auto-apply.
			WC()->session->set( self::SESSION_AUTO, null );
			WC()->session->set( self::SESSION_OPTOUT, null );
		}
		if ( ! self::enabled( 'single_coupon' ) ) {
			return;
		}
		$replaced = array();
		foreach ( WC()->cart->get_applied_coupons() as $other ) {
			if ( self::fmt_code( $other ) === $code ) {
				continue;
			}
			self::internal_remove( $other );
			$replaced[] = $other;
		}
		if ( $replaced ) {
			self::notify(
				sprintf(
					/* translators: 1: new coupon code, 2: removed coupon code(s) */
					__( 'Only one coupon can be used per order. "%1$s" replaced "%2$s".', 'webino-dashboard' ),
					$code,
					implode( '، ', $replaced )
				),
				'notice'
			);
		}
	}

	/**
	 * Remember that the customer removed a coupon so auto-apply does not fight them.
	 *
	 * @param string $code Removed code.
	 * @return void
	 */
	public static function on_removed_coupon( $code ) {
		if ( self::$internal > 0 || '' !== self::$applying || ! function_exists( 'WC' ) || ! WC()->session || ! WC()->cart ) {
			return;
		}
		$code   = self::fmt_code( $code );
		$coupon = new WC_Coupon( $code );
		// WooCommerce removing an invalid coupon (cart dropped below minimum, expired…) is not a customer choice.
		if ( ! $coupon->get_id() || ! self::coupon_valid_for_cart( $coupon, WC()->cart ) ) {
			return;
		}
		WC()->session->set(
			self::SESSION_OPTOUT,
			array(
				'code'   => $code,
				'saving' => self::estimate_saving( $coupon, WC()->cart ),
			)
		);
		if ( self::fmt_code( (string) WC()->session->get( self::SESSION_AUTO ) ) === $code ) {
			WC()->session->set( self::SESSION_AUTO, null );
		}
	}

	/**
	 * Safety net: never calculate totals with more than one coupon in single-coupon mode.
	 *
	 * @param WC_Cart $cart Cart.
	 * @return void
	 */
	public static function enforce_single_coupon( $cart ) {
		if ( ! ( $cart instanceof WC_Cart ) || ! self::enabled( 'single_coupon' ) ) {
			return;
		}
		$applied = array_values( $cart->get_applied_coupons() );
		if ( count( $applied ) < 2 ) {
			return;
		}
		$keep = end( $applied );
		foreach ( $applied as $code ) {
			if ( $code !== $keep ) {
				self::internal_remove( $code, $cart );
			}
		}
	}

	/**
	 * Silence WooCommerce's own "applied/removed" notices for operations this class performs.
	 *
	 * @param string    $msg      Message.
	 * @param int       $msg_code Code.
	 * @param WC_Coupon $coupon   Coupon.
	 * @return string
	 */
	public static function filter_coupon_message( $msg, $msg_code = 0, $coupon = null ) {
		unset( $msg_code, $coupon );
		return self::$internal > 0 ? '' : $msg;
	}

	/**
	 * @param string       $code Code.
	 * @param WC_Cart|null $cart Cart.
	 * @return void
	 */
	private static function internal_remove( $code, $cart = null ) {
		$cart = $cart ? $cart : WC()->cart;
		++self::$internal;
		try {
			$cart->remove_coupon( $code );
		} finally {
			--self::$internal;
		}
	}

	/**
	 * @param string       $code Code.
	 * @param WC_Cart|null $cart Cart.
	 * @return bool
	 */
	private static function internal_apply( $code, $cart = null ) {
		$cart = $cart ? $cart : WC()->cart;
		++self::$internal;
		try {
			if ( self::enabled( 'single_coupon' ) ) {
				foreach ( $cart->get_applied_coupons() as $other ) {
					if ( self::fmt_code( $other ) !== self::fmt_code( $code ) ) {
						$cart->remove_coupon( $other );
					}
				}
			}
			$ok = (bool) $cart->apply_coupon( $code );
		} finally {
			--self::$internal;
		}
		return $ok;
	}

	/* ---------------------------------------------------------------------
	 * Cart changes, re-validation, auto-apply
	 * ------------------------------------------------------------------- */

	/**
	 * @return void
	 */
	public static function mark_cart_changed() {
		self::$cart_changed = true;
	}

	/**
	 * @return void
	 */
	public static function on_cart_emptied() {
		self::$cart_changed = true;
		if ( function_exists( 'WC' ) && WC()->session ) {
			WC()->session->set( self::SESSION_AUTO, null );
			WC()->session->set( self::SESSION_OPTOUT, null );
		}
	}

	/**
	 * Re-validate applied coupons after cart changes and run auto-apply.
	 *
	 * @param WC_Cart $cart Cart.
	 * @return void
	 */
	public static function after_calculate_totals( $cart = null ) {
		if ( self::$in_after_totals || self::$internal > 0 ) {
			return;
		}
		if ( ! ( $cart instanceof WC_Cart ) ) {
			$cart = function_exists( 'WC' ) ? WC()->cart : null;
		}
		if ( ! $cart || ( is_admin() && ! wp_doing_ajax() ) ) {
			return;
		}
		self::$in_after_totals = true;
		try {
			$changed = false;

			// Remember the shipping cost while no shipping coupon is active (stable ranking of shipping offers).
			if ( WC()->session && ! self::cart_has_shipping_coupon( $cart ) && (float) $cart->get_shipping_total() > 0 ) {
				WC()->session->set( self::SESSION_SHIP, (float) $cart->get_shipping_total() + ( $cart->display_prices_including_tax() ? (float) $cart->get_shipping_tax() : 0.0 ) );
			}

			if ( self::$cart_changed || ! self::$revalidated ) {
				self::$cart_changed = false;
				self::$revalidated  = true;
				foreach ( $cart->get_applied_coupons() as $code ) {
					$coupon = new WC_Coupon( $code );
					$error  = '';
					if ( $coupon->get_id() && self::coupon_valid_for_cart( $coupon, $cart, $error ) ) {
						continue;
					}
					self::internal_remove( $code, $cart );
					$changed = true;
					if ( WC()->session && self::fmt_code( (string) WC()->session->get( self::SESSION_AUTO ) ) === self::fmt_code( $code ) ) {
						WC()->session->set( self::SESSION_AUTO, null );
					}
					if ( $cart->is_empty() ) {
						continue;
					}
					self::notify(
						'' !== $error
							? sprintf(
								/* translators: 1: coupon code, 2: reason */
								__( 'Coupon "%1$s" was removed from your cart: %2$s', 'webino-dashboard' ),
								$code,
								$error
							)
							: sprintf(
								/* translators: %s: coupon code */
								__( 'Coupon "%s" no longer applies to your cart and was removed.', 'webino-dashboard' ),
								$code
							),
						'notice'
					);
				}
			}

			if ( self::enabled( 'auto_apply' ) && ! $cart->is_empty() && self::maybe_auto_apply( $cart ) ) {
				$changed = true;
			}

			if ( $changed ) {
				$cart->calculate_totals();
			}
		} finally {
			self::$in_after_totals = false;
		}
	}

	/**
	 * @param WC_Cart $cart Cart.
	 * @return bool
	 */
	private static function cart_has_shipping_coupon( $cart ) {
		foreach ( $cart->get_applied_coupons() as $code ) {
			$c = new WC_Coupon( $code );
			if ( ! $c->get_id() ) {
				continue;
			}
			if ( $c->get_free_shipping() ) {
				return true;
			}
			$pct = get_post_meta( $c->get_id(), '_webino_offer_shipping_percent', true );
			if ( '' !== (string) $pct && (float) $pct > 0 ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Apply / upgrade the best auto-apply coupon without overriding a customer's choice.
	 *
	 * @param WC_Cart $cart Cart.
	 * @return bool True when coupons changed.
	 */
	public static function maybe_auto_apply( $cart ) {
		if ( '' !== self::$applying || ! function_exists( 'wc_coupons_enabled' ) || ! wc_coupons_enabled() ) {
			return false;
		}
		$session = WC()->session;
		$applied = array_values( array_map( array( __CLASS__, 'fmt_code' ), $cart->get_applied_coupons() ) );
		$auto    = $session ? self::fmt_code( (string) $session->get( self::SESSION_AUTO ) ) : '';

		if ( $applied ) {
			// Only upgrade a coupon that auto-apply itself added; never replace a customer's code.
			if ( 1 !== count( $applied ) || '' === $auto || $applied[0] !== $auto ) {
				return false;
			}
		}

		$optout_saving = -1.0;
		$optout_code   = '';
		if ( $session ) {
			$optout = $session->get( self::SESSION_OPTOUT );
			if ( is_array( $optout ) ) {
				$optout_saving = (float) ( $optout['saving'] ?? 0 );
				$optout_code   = (string) ( $optout['code'] ?? '' );
			}
		}

		$best      = null;
		$best_save = 0.0;
		foreach ( self::candidate_coupons() as $coupon ) {
			if ( ! self::is_auto_apply( $coupon ) ) {
				continue;
			}
			$code = self::fmt_code( $coupon->get_code() );
			if ( $code === $optout_code ) {
				continue;
			}
			if ( ! self::coupon_valid_for_cart( $coupon, $cart ) ) {
				continue;
			}
			$save = self::estimate_saving( $coupon, $cart );
			if ( $save <= 0 && ! $coupon->get_free_shipping() ) {
				continue;
			}
			if ( $optout_saving >= 0 && $save <= $optout_saving ) {
				continue;
			}
			if ( null === $best || $save > $best_save ) {
				$best      = $coupon;
				$best_save = $save;
			}
		}
		if ( ! $best ) {
			return false;
		}
		$best_code = self::fmt_code( $best->get_code() );
		if ( $applied ) {
			if ( $applied[0] === $best_code ) {
				return false;
			}
			$current = new WC_Coupon( $applied[0] );
			if ( $current->get_id() && $best_save <= self::estimate_saving( $current, $cart ) + 0.000001 ) {
				return false;
			}
		}

		$previous = $applied ? $applied[0] : '';
		if ( ! self::internal_apply( $best_code, $cart ) ) {
			return false;
		}
		if ( $session ) {
			$session->set( self::SESSION_AUTO, $best_code );
			$session->set( self::SESSION_OPTOUT, null );
		}
		$label = self::describe( $best );
		self::notify(
			'' !== $previous
				? sprintf(
					/* translators: %s: coupon title */
					__( 'Better coupon unlocked: "%s" is now applied to your cart.', 'webino-dashboard' ),
					$label['title']
				)
				: sprintf(
					/* translators: %s: coupon title */
					__( 'Coupon "%s" was applied to your cart automatically.', 'webino-dashboard' ),
					$label['title']
				),
			'success'
		);
		return true;
	}

	/* ---------------------------------------------------------------------
	 * Validation
	 * ------------------------------------------------------------------- */

	/**
	 * Full WooCommerce validation (min/max spend, expiry, usage limits, products, emails, Webina restrictions).
	 *
	 * @param WC_Coupon $coupon Coupon.
	 * @param WC_Cart   $cart   Cart.
	 * @param string    $error  Receives the error message.
	 * @return bool
	 */
	public static function coupon_valid_for_cart( $coupon, $cart, &$error = '' ) {
		$error = '';
		if ( ! ( $coupon instanceof WC_Coupon ) || ! $coupon->get_id() || ! class_exists( 'WC_Discounts' ) ) {
			return false;
		}
		if ( 'publish' !== get_post_status( $coupon->get_id() ) ) {
			$error = __( 'This coupon is not active.', 'webino-dashboard' );
			return false;
		}
		$discounts = new WC_Discounts( $cart );
		$result    = $discounts->is_coupon_valid( $coupon );
		if ( is_wp_error( $result ) ) {
			$error = trim( html_entity_decode( wp_strip_all_tags( $result->get_error_message() ), ENT_QUOTES, 'UTF-8' ) );
			return false;
		}
		return (bool) $result;
	}

	/**
	 * Skip WooCommerce's minimum-spend failure while searching for "next" coupons.
	 *
	 * @param bool      $is_below Coupon minimum > subtotal.
	 * @param WC_Coupon $coupon   Coupon.
	 * @param float     $subtotal Subtotal.
	 * @return bool
	 */
	public static function filter_minimum_amount_check( $is_below, $coupon = null, $subtotal = 0 ) {
		unset( $coupon, $subtotal );
		return self::$bypass_thresholds ? false : $is_below;
	}

	/**
	 * Enforce builder offer conditions (min items, Nth order) for every way a coupon can be applied.
	 *
	 * @param bool              $valid     Valid.
	 * @param WC_Coupon         $coupon    Coupon.
	 * @param WC_Discounts|null $discounts Discounts.
	 * @return bool
	 * @throws Exception When a condition is not met.
	 */
	public static function validate_offer_conditions( $valid, $coupon, $discounts = null ) {
		if ( ! $valid || ! ( $coupon instanceof WC_Coupon ) || ! $coupon->get_id() ) {
			return $valid;
		}
		$object = ( $discounts instanceof WC_Discounts ) ? $discounts->get_object() : null;
		if ( $object && ! ( $object instanceof WC_Cart ) ) {
			return $valid; // Admin order edits / order-pay: do not block.
		}
		$cid = $coupon->get_id();
		if ( ! get_post_meta( $cid, '_webino_offer_builder', true ) ) {
			return $valid;
		}
		$ctype = (string) get_post_meta( $cid, '_webino_offer_condition_type', true );
		$cval  = self::normalize_decimal( get_post_meta( $cid, '_webino_offer_condition_value', true ) );

		if ( 'min_items' === $ctype && ! self::$bypass_thresholds ) {
			$need = max( 1, (int) ceil( (float) $cval ) );
			$cart = $object instanceof WC_Cart ? $object : ( function_exists( 'WC' ) ? WC()->cart : null );
			$have = $cart ? (int) $cart->get_cart_contents_count() : 0;
			if ( $have < $need ) {
				throw new Exception(
					sprintf(
						/* translators: %s: number of items */
						esc_html__( 'This coupon needs at least %s items in the cart.', 'webino-dashboard' ),
						esc_html( number_format_i18n( $need ) )
					)
				);
			}
		}
		if ( 'order_nth' === $ctype ) {
			$nth  = max( 1, (int) $cval );
			$next = self::next_order_index( get_current_user_id(), '' );
			if ( $next !== $nth ) {
				throw new Exception( esc_html( self::order_nth_error( $nth ) ) );
			}
		}
		return $valid;
	}

	/**
	 * @param int $nth Order number.
	 * @return string
	 */
	private static function order_nth_error( $nth ) {
		if ( 1 === (int) $nth ) {
			return __( 'This coupon is only valid on your first order.', 'webino-dashboard' );
		}
		return sprintf(
			/* translators: %s: order number */
			__( 'This coupon is only valid on your order number %s.', 'webino-dashboard' ),
			number_format_i18n( (int) $nth )
		);
	}

	/**
	 * Guests: re-check Nth-order offers against the billing e-mail at checkout.
	 *
	 * @param array    $data   Posted data.
	 * @param WP_Error $errors Errors.
	 * @return void
	 */
	public static function validate_checkout_conditions( $data, $errors ) {
		if ( ! function_exists( 'WC' ) || ! WC()->cart || ! ( $errors instanceof WP_Error ) ) {
			return;
		}
		$email = is_array( $data ) && ! empty( $data['billing_email'] ) ? sanitize_email( (string) $data['billing_email'] ) : '';
		foreach ( WC()->cart->get_applied_coupons() as $code ) {
			$coupon = new WC_Coupon( $code );
			$cid    = $coupon->get_id();
			if ( ! $cid || ! get_post_meta( $cid, '_webino_offer_builder', true ) ) {
				continue;
			}
			if ( 'order_nth' !== (string) get_post_meta( $cid, '_webino_offer_condition_type', true ) ) {
				continue;
			}
			$nth  = max( 1, (int) get_post_meta( $cid, '_webino_offer_condition_value', true ) );
			$next = self::next_order_index( get_current_user_id(), $email );
			if ( $next !== $nth ) {
				$errors->add( 'webino_coupon_nth_' . $cid, self::order_nth_error( $nth ) );
			}
		}
	}

	/**
	 * Next order number for a customer (1-based), counting only real (paid / on-hold) orders.
	 *
	 * @param int    $user_id User id (0 = guest).
	 * @param string $email   Billing e-mail (guests).
	 * @return int
	 */
	public static function next_order_index( $user_id = 0, $email = '' ) {
		$user_id = (int) $user_id;
		$email   = (string) $email;
		if ( $user_id < 1 && '' === $email ) {
			return 1;
		}
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return 1;
		}
		$key = $user_id . '|' . strtolower( $email );
		if ( isset( self::$order_count_cache[ $key ] ) ) {
			return self::$order_count_cache[ $key ] + 1;
		}
		$statuses = function_exists( 'wc_get_is_paid_statuses' ) ? (array) wc_get_is_paid_statuses() : array( 'processing', 'completed' );
		$statuses = array_values( array_unique( array_merge( $statuses, array( 'on-hold' ) ) ) );
		$args     = array(
			'status' => $statuses,
			'limit'  => 200,
			'return' => 'ids',
			'type'   => 'shop_order',
		);
		if ( $user_id > 0 ) {
			$args['customer_id'] = $user_id;
		} else {
			$args['billing_email'] = $email;
		}
		$ids   = wc_get_orders( $args );
		$count = is_array( $ids ) ? count( $ids ) : 0;
		self::$order_count_cache[ $key ] = $count;
		return $count + 1;
	}

	/* ---------------------------------------------------------------------
	 * Max discount (percentage coupons)
	 * ------------------------------------------------------------------- */

	/**
	 * @param array        $items     Items to apply.
	 * @param WC_Coupon    $coupon    Coupon.
	 * @param WC_Discounts $discounts Discounts.
	 * @return array
	 */
	public static function prepare_discount_cap( $items, $coupon = null, $discounts = null ) {
		if ( ! ( $coupon instanceof WC_Coupon ) ) {
			return $items;
		}
		$code = $coupon->get_code();
		unset( self::$cap_state[ $code ] );
		if ( ! ( $discounts instanceof WC_Discounts ) || ! ( $discounts->get_object() instanceof WC_Cart ) ) {
			return $items;
		}
		if ( 'percent' !== $coupon->get_discount_type() || ! is_array( $items ) || array() === $items ) {
			return $items;
		}
		$cap = self::get_max_discount( $coupon );
		if ( $cap <= 0 ) {
			return $items;
		}
		self::$cap_state[ $code ] = array(
			'remaining' => $cap,
			'left'      => count( $items ),
		);
		return $items;
	}

	/**
	 * @param float     $discount           Discount for the line.
	 * @param float     $discounting_amount Line amount.
	 * @param mixed     $cart_item          Cart item.
	 * @param bool      $single             Single.
	 * @param WC_Coupon $coupon             Coupon.
	 * @return float
	 */
	public static function apply_discount_cap( $discount, $discounting_amount = 0, $cart_item = null, $single = false, $coupon = null ) {
		unset( $discounting_amount, $cart_item, $single );
		if ( ! ( $coupon instanceof WC_Coupon ) ) {
			return $discount;
		}
		$code = $coupon->get_code();
		if ( empty( self::$cap_state[ $code ] ) ) {
			return $discount;
		}
		$d = max( 0.0, (float) $discount );
		if ( $d > self::$cap_state[ $code ]['remaining'] ) {
			$d = self::$cap_state[ $code ]['remaining'];
		}
		self::$cap_state[ $code ]['remaining'] = max( 0.0, self::$cap_state[ $code ]['remaining'] - $d );
		--self::$cap_state[ $code ]['left'];
		if ( self::$cap_state[ $code ]['left'] <= 0 ) {
			unset( self::$cap_state[ $code ] );
		}
		return $d;
	}

	/* ---------------------------------------------------------------------
	 * Coupon discovery / description / ranking
	 * ------------------------------------------------------------------- */

	/**
	 * Published coupons the store chose to show to customers (offer builder or "show in cart").
	 *
	 * @return array<int, WC_Coupon>
	 */
	public static function candidate_coupons() {
		if ( null !== self::$candidates ) {
			return self::$candidates;
		}
		$cache = array();
		if ( ! class_exists( 'WC_Coupon' ) ) {
			return $cache;
		}
		$q = new WP_Query(
			array(
				'post_type'              => 'shop_coupon',
				'post_status'            => 'publish',
				'posts_per_page'         => 200,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_term_cache' => false,
				'has_password'           => false,
				'orderby'                => 'ID',
				'order'                  => 'ASC',
				'meta_query'             => array(
					'relation' => 'OR',
					array(
						'key'   => '_webino_offer_visible',
						'value' => '1',
					),
					array(
						'key'   => '_webino_offer_public',
						'value' => '1',
					),
				),
			)
		);
		/**
		 * Filter the coupon IDs the cart chooser, next-coupon widget and auto-apply may use.
		 *
		 * @param int[] $ids Published coupon IDs flagged as visible / public.
		 */
		$ids = (array) apply_filters( 'webino_coupon_storefront_candidate_ids', array_map( 'intval', (array) $q->posts ) );
		foreach ( $ids as $id ) {
			$c = new WC_Coupon( (int) $id );
			if ( $c->get_id() && '' !== (string) $c->get_code() ) {
				$cache[] = $c;
			}
		}
		self::$candidates = $cache;
		return $cache;
	}

	/**
	 * Reset the per-request candidate cache (tests / after edits).
	 *
	 * @return void
	 */
	public static function flush_request_cache() {
		self::$candidates        = null;
		self::$order_count_cache = array();
		self::$cap_state         = array();
	}

	/**
	 * @param WC_Coupon $coupon Coupon.
	 * @return bool
	 */
	private static function is_auto_apply( $coupon ) {
		return (bool) get_post_meta( $coupon->get_id(), '_webino_offer_auto_apply', true );
	}

	/**
	 * Customer-facing title / benefit / condition texts.
	 *
	 * @param WC_Coupon $coupon Coupon.
	 * @return array{title:string,benefit:string,detail:string,condition:string}
	 */
	public static function describe( $coupon ) {
		$id      = $coupon->get_id();
		$type    = $coupon->get_discount_type();
		$amount  = (float) self::normalize_decimal( $coupon->get_amount() );
		$cap     = self::get_max_discount( $coupon );
		$shippct = get_post_meta( $id, '_webino_offer_shipping_percent', true );
		$shippct = '' !== (string) $shippct ? (float) $shippct : 0.0;

		$parts   = array();
		$details = array();
		if ( $amount > 0 ) {
			if ( 'percent' === $type ) {
				$pct     = wc_format_localized_decimal( wc_format_decimal( min( 100, $amount ), 2, true ) );
				$parts[] = sprintf(
					/* translators: %s: percent */
					__( '%s%% off', 'webino-dashboard' ),
					$pct
				);
				if ( $cap > 0 ) {
					$details[] = sprintf(
						/* translators: %s: max discount amount */
						__( 'Up to %s', 'webino-dashboard' ),
						self::price_text( $cap )
					);
				}
			} elseif ( 'fixed_product' === $type ) {
				$parts[] = sprintf(
					/* translators: %s: amount */
					__( '%s off each eligible item', 'webino-dashboard' ),
					self::price_text( $amount )
				);
			} else {
				$parts[] = sprintf(
					/* translators: %s: amount */
					__( '%s off', 'webino-dashboard' ),
					self::price_text( $amount )
				);
			}
		}
		if ( $coupon->get_free_shipping() ) {
			$parts[] = __( 'Free shipping', 'webino-dashboard' );
		} elseif ( $shippct > 0 ) {
			$parts[] = $shippct >= 100
				? __( 'Free shipping', 'webino-dashboard' )
				: sprintf(
					/* translators: %s: percent */
					__( '%s%% off shipping', 'webino-dashboard' ),
					wc_format_localized_decimal( wc_format_decimal( $shippct, 2, true ) )
				);
		}
		$headline = $parts ? implode( ' + ', $parts ) : __( 'Discount', 'webino-dashboard' );

		$condition = '';
		$min       = (float) self::normalize_decimal( $coupon->get_minimum_amount() );
		$ctype     = (string) get_post_meta( $id, '_webino_offer_condition_type', true );
		$cval      = self::normalize_decimal( get_post_meta( $id, '_webino_offer_condition_value', true ) );
		if ( 'min_items' === $ctype && '' !== $cval ) {
			$condition = sprintf(
				/* translators: %s: number of items */
				__( 'With %s items in your cart', 'webino-dashboard' ),
				number_format_i18n( max( 1, (int) ceil( (float) $cval ) ) )
			);
		} elseif ( 'order_nth' === $ctype && '' !== $cval ) {
			$condition = self::order_nth_label( max( 1, (int) $cval ) );
		} elseif ( $min > 0 ) {
			$condition = sprintf(
				/* translators: %s: minimum spend */
				__( 'On orders of %s or more', 'webino-dashboard' ),
				self::price_text( $min )
			);
		}
		if ( '' !== $condition ) {
			$details[] = $condition;
		}

		$headline = self::digits( wp_strip_all_tags( $headline ) );
		$details  = array_map(
			static function ( $d ) {
				return self::digits( wp_strip_all_tags( (string) $d ) );
			},
			$details
		);
		$benefit = $headline;
		if ( 'percent' === $type && $cap > 0 && isset( $details[0] ) ) {
			$benefit = $headline . ' (' . $details[0] . ')';
		}

		// One generated headline for every coupon (the builder description only repeated the benefit in other words).
		return array(
			'title'     => $headline,
			'benefit'   => $benefit,
			'detail'    => implode( ' · ', $details ),
			'condition' => self::digits( wp_strip_all_tags( $condition ) ),
		);
	}

	/**
	 * @param int $nth Order number.
	 * @return string
	 */
	private static function order_nth_label( $nth ) {
		if ( 1 === (int) $nth ) {
			return __( 'On your first order', 'webino-dashboard' );
		}
		return sprintf(
			/* translators: %s: order number */
			__( 'On your order number %s', 'webino-dashboard' ),
			number_format_i18n( (int) $nth )
		);
	}

	/**
	 * Shipping cost used to value shipping coupons (last known cost without a shipping coupon).
	 *
	 * @param WC_Cart $cart Cart.
	 * @return float
	 */
	private static function shipping_estimate( $cart ) {
		$base = 0.0;
		if ( function_exists( 'WC' ) && WC()->session ) {
			$base = (float) WC()->session->get( self::SESSION_SHIP );
		}
		if ( $base <= 0 && ! self::cart_has_shipping_coupon( $cart ) ) {
			$base = (float) $cart->get_shipping_total() + ( $cart->display_prices_including_tax() ? (float) $cart->get_shipping_tax() : 0.0 );
		}
		return $cart->needs_shipping() ? max( 0.0, $base ) : 0.0;
	}

	/**
	 * Real discount this coupon would give the current cart (dry run through WC_Discounts) + shipping benefit.
	 *
	 * @param WC_Coupon $coupon Coupon.
	 * @param WC_Cart   $cart   Cart.
	 * @return float
	 */
	public static function estimate_saving( $coupon, $cart ) {
		if ( ! ( $coupon instanceof WC_Coupon ) || ! $coupon->get_id() || ! $cart || ! class_exists( 'WC_Discounts' ) ) {
			return 0.0;
		}
		$saving = 0.0;
		try {
			$discounts = new WC_Discounts( $cart );
			$discounts->apply_coupon( $coupon, false );
			$by_coupon = $discounts->get_discounts_by_coupon( false );
			$code      = $coupon->get_code();
			if ( isset( $by_coupon[ $code ] ) ) {
				$saving = (float) $by_coupon[ $code ];
			}
		} catch ( Throwable $e ) {
			$saving = 0.0;
		}
		$ship = self::shipping_estimate( $cart );
		if ( $ship > 0 ) {
			if ( $coupon->get_free_shipping() ) {
				$saving += $ship;
			} else {
				$pct = get_post_meta( $coupon->get_id(), '_webino_offer_shipping_percent', true );
				if ( '' !== (string) $pct && (float) $pct > 0 ) {
					$saving += $ship * min( 100, (float) $pct ) / 100;
				}
			}
		}
		return max( 0.0, $saving );
	}

	/**
	 * Approximate value of a coupon once the cart reaches $amount (for "next coupon" ranking).
	 *
	 * @param WC_Coupon $coupon Coupon.
	 * @param float     $amount Cart amount.
	 * @param WC_Cart   $cart   Cart.
	 * @return float
	 */
	private static function estimate_saving_at( $coupon, $amount, $cart ) {
		$type = $coupon->get_discount_type();
		$amt  = (float) self::normalize_decimal( $coupon->get_amount() );
		$save = 0.0;
		if ( 'percent' === $type ) {
			$save = $amount * min( 100, max( 0, $amt ) ) / 100;
			$cap  = self::get_max_discount( $coupon );
			if ( $cap > 0 ) {
				$save = min( $save, $cap );
			}
		} elseif ( 'fixed_cart' === $type ) {
			$save = min( max( 0, $amt ), $amount );
		} else {
			$save = max( 0, $amt );
		}
		$ship = self::shipping_estimate( $cart );
		if ( $coupon->get_free_shipping() ) {
			$save += $ship;
		} else {
			$pct = get_post_meta( $coupon->get_id(), '_webino_offer_shipping_percent', true );
			if ( '' !== (string) $pct && (float) $pct > 0 ) {
				$save += $ship * min( 100, (float) $pct ) / 100;
			}
		}
		return $save;
	}

	/* ---------------------------------------------------------------------
	 * Storefront state
	 * ------------------------------------------------------------------- */

	/**
	 * Eligible coupons, applied coupon and the next unlockable coupon for the current cart.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_state() {
		$settings = self::settings();
		$state    = array(
			'enabled'   => true,
			'settings'  => $settings,
			'empty'     => true,
			'amount'    => 0,
			'items'     => 0,
			'applied'   => array(),
			'eligible'  => array(),
			'next'      => null,
			'messages'  => self::pull_flash(),
			'nonce'     => wp_create_nonce( self::NONCE ),
			'currency'  => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '',
		);
		if ( ! function_exists( 'WC' ) || ! WC()->cart || ! function_exists( 'wc_coupons_enabled' ) || ! wc_coupons_enabled() ) {
			$state['enabled'] = false;
			return $state;
		}
		$cart = WC()->cart;
		if ( $cart->is_empty() ) {
			// Empty cart: still show the first reachable coupon (0% progress) so shoppers see what to aim for.
			$state['next'] = self::first_tier();
			return $state;
		}

		$amount  = self::cart_amount( $cart );
		$items   = (int) $cart->get_cart_contents_count();
		$applied = array_values( array_map( array( __CLASS__, 'fmt_code' ), $cart->get_applied_coupons() ) );

		$state['empty']       = false;
		$state['amount']      = $amount;
		$state['amount_text'] = self::price_text( $amount );
		$state['amount_html'] = self::price_html( $amount );
		$state['items']       = $items;
		$state['applied']     = array_values( $applied );

		$eligible     = array();
		$upcoming     = array();
		$best_current = 0.0;

		foreach ( self::candidate_coupons() as $coupon ) {
			$code  = self::fmt_code( $coupon->get_code() );
			$label = self::describe( $coupon );
			$row   = array(
				'id'        => $coupon->get_id(),
				'code'      => $coupon->get_code(),
				'title'     => $label['title'],
				'benefit'   => $label['benefit'],
				'detail'    => $label['detail'],
				'condition' => $label['condition'],
				'applied'   => in_array( $code, $applied, true ),
			);
			if ( self::coupon_valid_for_cart( $coupon, $cart ) ) {
				$saving             = self::estimate_saving( $coupon, $cart );
				$row['saving']      = $saving;
				$row['saving_text'] = $saving > 0 ? self::price_text( $saving ) : '';
				$row['saving_html'] = $saving > 0 ? self::price_html( $saving ) : '';
				$eligible[]         = $row;
				$best_current       = max( $best_current, $saving );
				continue;
			}
			$next = self::threshold_for( $coupon, $cart, $amount, $items );
			if ( $next ) {
				$upcoming[] = array_merge( $row, $next );
			}
		}

		// Coupons applied by code (not listed publicly) still count as the current benefit.
		foreach ( $applied as $code ) {
			$c = new WC_Coupon( $code );
			if ( $c->get_id() ) {
				$best_current = max( $best_current, self::estimate_saving( $c, $cart ) );
			}
		}

		usort(
			$eligible,
			static function ( $a, $b ) {
				if ( $a['applied'] !== $b['applied'] ) {
					return $a['applied'] ? -1 : 1;
				}
				return $b['saving'] <=> $a['saving'];
			}
		);
		$state['eligible'] = $eligible;
		$state['next']     = self::pick_next( $upcoming, $best_current, $cart );
		return $state;
	}

	/**
	 * When a coupon is only blocked by a minimum spend / item count, describe the remaining gap.
	 *
	 * @param WC_Coupon $coupon Coupon.
	 * @param WC_Cart   $cart   Cart.
	 * @param float     $amount Current amount.
	 * @param int       $items  Current item count.
	 * @return array<string, mixed>|null
	 */
	private static function threshold_for( $coupon, $cart, $amount, $items ) {
		$min   = (float) self::normalize_decimal( $coupon->get_minimum_amount() );
		$max   = (float) self::normalize_decimal( $coupon->get_maximum_amount() );
		$ctype = (string) get_post_meta( $coupon->get_id(), '_webino_offer_condition_type', true );
		$is_offer = (bool) get_post_meta( $coupon->get_id(), '_webino_offer_builder', true );
		$need_items = 0;
		if ( $is_offer && 'min_items' === $ctype ) {
			$need_items = max( 1, (int) ceil( (float) self::normalize_decimal( get_post_meta( $coupon->get_id(), '_webino_offer_condition_value', true ) ) ) );
		}
		$below_amount = $min > 0 && $amount < $min;
		$below_items  = $need_items > 0 && $items < $need_items;
		if ( ! $below_amount && ! $below_items ) {
			return null;
		}
		if ( $below_amount && $max > 0 && $max < $min ) {
			return null; // Misconfigured range — can never be unlocked.
		}
		self::$bypass_thresholds = true;
		try {
			$ok = self::coupon_valid_for_cart( $coupon, $cart );
		} finally {
			self::$bypass_thresholds = false;
		}
		if ( ! $ok ) {
			return null;
		}
		if ( $below_amount ) {
			$remaining = max( 0.0, $min - $amount );
			return array(
				'kind'           => 'amount',
				'target'         => $min,
				'current'        => $amount,
				'remaining'      => $remaining,
				'ratio'          => $min > 0 ? round( min( 1, max( 0, $amount / $min ) ), 4 ) : 1,
				'target_text'    => self::price_text( $min ),
				'current_text'   => self::price_text( $amount ),
				'remaining_text' => self::price_text( $remaining ),
				'target_html'    => self::price_html( $min ),
				'current_html'   => self::price_html( $amount ),
				'remaining_html' => self::price_html( $remaining ),
				'potential'      => self::estimate_saving_at( $coupon, $min, $cart ),
			);
		}
		$remaining = max( 0, $need_items - $items );
		return array(
			'kind'           => 'items',
			'target'         => $need_items,
			'current'        => $items,
			'remaining'      => $remaining,
			'ratio'          => round( min( 1, max( 0, $items / $need_items ) ), 4 ),
			'target_text'    => self::digits( number_format_i18n( $need_items ) ),
			'current_text'   => self::digits( number_format_i18n( $items ) ),
			'remaining_text' => self::digits( number_format_i18n( $remaining ) ),
			'potential'      => self::estimate_saving_at( $coupon, $amount, $cart ),
		);
	}

	/**
	 * Nearest threshold above the cart that would beat what the customer already gets.
	 *
	 * @param array<int, array<string, mixed>> $upcoming     Candidates.
	 * @param float                            $best_current Best current saving.
	 * @param WC_Cart                          $cart         Cart.
	 * @return array<string, mixed>|null
	 */
	private static function pick_next( array $upcoming, $best_current, $cart ) {
		unset( $cart );
		$pick = null;
		foreach ( array( 'amount', 'items' ) as $kind ) {
			foreach ( $upcoming as $row ) {
				if ( $row['kind'] !== $kind ) {
					continue;
				}
				if ( $best_current > 0 && (float) $row['potential'] <= $best_current ) {
					continue;
				}
				if ( null === $pick
					|| (float) $row['remaining'] < (float) $pick['remaining']
					|| ( (float) $row['remaining'] === (float) $pick['remaining'] && (float) $row['potential'] > (float) $pick['potential'] ) ) {
					$pick = $row;
				}
			}
			if ( $pick ) {
				break;
			}
		}
		if ( ! $pick ) {
			return null;
		}
		$pick = self::with_next_texts( $pick );
		unset( $pick['code'] );
		return $pick;
	}

	/**
	 * Add the customer-facing call-to-action texts to a "next coupon" row.
	 *
	 * @param array<string, mixed> $pick Row.
	 * @return array<string, mixed>
	 */
	private static function with_next_texts( array $pick ) {
		$fresh = isset( $pick['current'] ) && 0.0 === (float) $pick['current'];
		if ( 'amount' === $pick['kind'] ) {
			$pick['cta'] = $fresh
				? sprintf(
					/* translators: %s: minimum order amount */
					__( 'Unlocks on orders of %s', 'webino-dashboard' ),
					$pick['target_text']
				)
				: sprintf(
					/* translators: %s: remaining amount */
					__( 'Spend %s more to unlock it', 'webino-dashboard' ),
					$pick['remaining_text']
				);
			$pick['message'] = sprintf(
				/* translators: 1: coupon title, 2: remaining amount */
				__( 'Your next coupon: %1$s — spend %2$s more', 'webino-dashboard' ),
				$pick['title'],
				$pick['remaining_text']
			);
		} else {
			$pick['cta'] = sprintf(
				/* translators: %s: remaining item count */
				__( 'Add %s more items to unlock it', 'webino-dashboard' ),
				$pick['remaining_text']
			);
			$pick['message'] = sprintf(
				/* translators: 1: coupon title, 2: remaining item count */
				__( 'Your next coupon: %1$s — add %2$s more items', 'webino-dashboard' ),
				$pick['title'],
				$pick['remaining_text']
			);
		}
		$pick['cta']     = self::digits( $pick['cta'] );
		$pick['message'] = self::digits( $pick['message'] );
		return $pick;
	}

	/**
	 * Lowest public coupon tier for an empty cart (same for every visitor → cache-friendly).
	 * Skips coupons that depend on who the customer is (email/products/Nth order) or can no longer be used.
	 *
	 * @return array<string, mixed>|null
	 */
	public static function first_tier() {
		if ( ! self::enabled( 'progress_widget' ) || ! class_exists( 'WC_Coupon' ) ) {
			return null;
		}
		$key    = 'webino_cprog_first_' . md5( implode( '|', array( get_locale(), function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '', (string) get_option( 'woocommerce_currency_pos' ), (string) get_option( self::OPTION . '_rev', '0' ), defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '' ) ) );
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			return isset( $cached['tier'] ) ? $cached['tier'] : null;
		}
		$best = null;
		$now  = time();
		foreach ( self::candidate_coupons() as $coupon ) {
			$id    = $coupon->get_id();
			$ctype = (string) get_post_meta( $id, '_webino_offer_condition_type', true );
			$cval  = self::normalize_decimal( get_post_meta( $id, '_webino_offer_condition_value', true ) );
			if ( 'order_nth' === $ctype && (int) $cval > 1 ) {
				continue;
			}
			if ( $coupon->get_email_restrictions() || $coupon->get_product_ids() || $coupon->get_product_categories() ) {
				continue;
			}
			$exp = $coupon->get_date_expires();
			if ( $exp && $exp->getTimestamp() < $now ) {
				continue;
			}
			if ( $coupon->get_usage_limit() > 0 && $coupon->get_usage_count() >= $coupon->get_usage_limit() ) {
				continue;
			}
			$min = (float) self::normalize_decimal( $coupon->get_minimum_amount() );
			$max = (float) self::normalize_decimal( $coupon->get_maximum_amount() );
			if ( $min <= 0 || ( $max > 0 && $max < $min ) ) {
				continue; // No threshold (applies right away) or misconfigured.
			}
			if ( null !== $best && $min >= (float) $best['target'] ) {
				continue;
			}
			$label = self::describe( $coupon );
			$type  = $coupon->get_discount_type();
			$amt   = (float) self::normalize_decimal( $coupon->get_amount() );
			$pot   = 'percent' === $type ? $min * min( 100, max( 0, $amt ) ) / 100 : max( 0, $amt );
			$cap   = self::get_max_discount( $coupon );
			if ( 'percent' === $type && $cap > 0 ) {
				$pot = min( $pot, $cap );
			}
			$best = array(
				'id'             => $id,
				'title'          => $label['title'],
				'benefit'        => $label['benefit'],
				'detail'         => $label['detail'],
				'condition'      => $label['condition'],
				'applied'        => false,
				'kind'           => 'amount',
				'target'         => $min,
				'current'        => 0,
				'remaining'      => $min,
				'ratio'          => 0,
				'target_text'    => self::price_text( $min ),
				'current_text'   => self::price_text( 0 ),
				'remaining_text' => self::price_text( $min ),
				'target_html'    => self::price_html( $min ),
				'current_html'   => self::price_html( 0 ),
				'remaining_html' => self::price_html( $min ),
				'potential'      => $pot,
				'first'          => true,
			);
		}
		if ( $best ) {
			$best = self::with_next_texts( $best );
		}
		set_transient( $key, array( 'tier' => $best ), 10 * MINUTE_IN_SECONDS );
		return $best;
	}

	/**
	 * Coupon data changed → drop cached storefront tiers.
	 *
	 * @param int $post_id Post ID.
	 * @return void
	 */
	public static function bump_revision( $post_id = 0 ) {
		if ( $post_id && 'shop_coupon' !== get_post_type( (int) $post_id ) ) {
			return;
		}
		update_option( self::OPTION . '_rev', (string) ( (int) get_option( self::OPTION . '_rev', 0 ) + 1 ), true );
		self::flush_request_cache();
	}

	/**
	 * @param int    $meta_id  Meta ID.
	 * @param int    $post_id  Post ID.
	 * @param string $meta_key Meta key.
	 * @return void
	 */
	public static function bump_revision_meta( $meta_id, $post_id = 0, $meta_key = '' ) {
		unset( $meta_id );
		if ( is_string( $meta_key ) && ( 0 === strpos( $meta_key, '_webino_offer' ) || in_array( $meta_key, array( 'minimum_amount', 'maximum_amount', 'coupon_amount', 'discount_type', 'free_shipping', 'date_expires', 'usage_limit' ), true ) ) ) {
			self::bump_revision( (int) $post_id );
		}
	}

	/* ---------------------------------------------------------------------
	 * AJAX endpoints
	 * ------------------------------------------------------------------- */

	/**
	 * @return void
	 */
	private static function send_no_cache_headers() {
		if ( ! headers_sent() ) {
			nocache_headers();
			header( 'Cache-Control: no-store, no-cache, must-revalidate, max-age=0' );
			header( 'X-LiteSpeed-Cache-Control: no-cache' );
		}
	}

	/**
	 * GET ?wc-ajax=webino_coupons_state
	 *
	 * @return void
	 */
	public static function ajax_state() {
		self::send_no_cache_headers();
		if ( function_exists( 'WC' ) && WC()->cart ) {
			WC()->cart->calculate_totals();
		}
		$state = self::get_state();
		if ( class_exists( 'Webino_Dashboard_Offer_Engine', false ) ) {
			$state['offers'] = Webino_Dashboard_Offer_Engine::eligible_payload();
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only flag.
		if ( ! empty( $_REQUEST['chooser'] ) ) {
			$state['chooser_html'] = self::chooser_html( $state );
		}
		wp_send_json_success( $state );
	}

	/**
	 * POST ?wc-ajax=webino_coupon_select  (coupon_id | remove=1)
	 *
	 * @return void
	 */
	public static function ajax_select() {
		self::send_no_cache_headers();
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, self::NONCE ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'Your session has expired. Please refresh the page and try again.', 'webino-dashboard' ),
					'nonce'   => wp_create_nonce( self::NONCE ),
				),
				403
			);
		}
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			wp_send_json_error( array( 'message' => __( 'Cart is not available.', 'webino-dashboard' ) ), 400 );
		}
		$cart      = WC()->cart;
		$remove    = ! empty( $_POST['remove'] );
		$coupon_id = isset( $_POST['coupon_id'] ) ? absint( wp_unslash( $_POST['coupon_id'] ) ) : 0;
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$snapshot = self::notices_snapshot();
		if ( $remove ) {
			foreach ( $cart->get_applied_coupons() as $code ) {
				$cart->remove_coupon( $code ); // Customer choice → auto-apply opt-out via on_removed_coupon().
			}
			$cart->calculate_totals();
			self::notices_restore( $snapshot );
			$state = self::get_state();
			$state['message'] = __( 'Coupon removed.', 'webino-dashboard' );
			self::send_select_state( $state );
		}

		$allowed = null;
		foreach ( self::candidate_coupons() as $c ) {
			if ( (int) $c->get_id() === $coupon_id ) {
				$allowed = $c;
				break;
			}
		}
		if ( ! $allowed ) {
			wp_send_json_error( array( 'message' => __( 'This coupon is not available.', 'webino-dashboard' ) ), 404 );
		}
		$code = self::fmt_code( $allowed->get_code() );
		if ( in_array( $code, array_map( array( __CLASS__, 'fmt_code' ), $cart->get_applied_coupons() ), true ) ) {
			$state            = self::get_state();
			$state['message'] = __( 'This coupon is already applied.', 'webino-dashboard' );
			self::send_select_state( $state );
		}

		$error = '';
		if ( ! self::coupon_valid_for_cart( $allowed, $cart, $error ) ) {
			self::notices_restore( $snapshot );
			wp_send_json_error( array( 'message' => '' !== $error ? $error : __( 'This coupon cannot be used with your cart.', 'webino-dashboard' ) ), 400 );
		}
		$previous = $cart->get_applied_coupons();
		// Regular (non-internal) apply: on_applied_coupon() replaces the old coupon and clears auto/opt-out flags.
		$ok     = $cart->apply_coupon( $code );
		$errors = self::notices_restore( $snapshot );
		self::pull_flash();
		if ( ! $ok ) {
			$msg = $errors ? (string) $errors[0] : '';
			wp_send_json_error( array( 'message' => '' !== $msg ? $msg : __( 'This coupon cannot be used with your cart.', 'webino-dashboard' ) ), 400 );
		}
		$cart->calculate_totals();
		$state = self::get_state();
		$label = self::describe( $allowed );
		$state['message'] = array() !== array_diff( array_map( array( __CLASS__, 'fmt_code' ), $previous ), array( $code ) )
			? sprintf(
				/* translators: %s: coupon title */
				__( '"%s" replaced your previous coupon.', 'webino-dashboard' ),
				$label['title']
			)
			: sprintf(
				/* translators: %s: coupon title */
				__( '"%s" was applied.', 'webino-dashboard' ),
				$label['title']
			);
		self::send_select_state( $state );
	}

	/* ---------------------------------------------------------------------
	 * Classic cart / checkout chooser (server-rendered, refreshed by WooCommerce fragments)
	 * ------------------------------------------------------------------- */

	/**
	 * @param array<string, mixed> $state State.
	 * @return void
	 */
	private static function send_select_state( array $state ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified in ajax_select().
		if ( ! empty( $_POST['chooser'] ) ) {
			$state['chooser_html'] = self::chooser_html( $state );
		}
		wp_send_json_success( $state );
	}

	/**
	 * Coupon chooser markup (classic cart / checkout are server-rendered; block cart / checkout reuse it via AJAX).
	 *
	 * @param array<string, mixed>|null $state Precomputed state (AJAX) or null to compute it here.
	 * @return string
	 */
	public static function chooser_html( $state = null ) {
		$placeholder = '<div class="webino-coupon-chooser webino-cc" hidden></div>';
		if ( ! self::enabled( 'cart_chooser' ) || ! function_exists( 'WC' ) || ! WC()->cart || ! wc_coupons_enabled() ) {
			return $placeholder;
		}
		if ( ! is_array( $state ) ) {
			$state = self::get_state();
			// Messages are shown by WooCommerce notices on classic pages; keep them for the widget toast only.
			if ( ! empty( $state['messages'] ) && WC()->session ) {
				WC()->session->set( self::SESSION_FLASH, $state['messages'] );
			}
		}
		if ( empty( $state['eligible'] ) ) {
			return $placeholder;
		}
		$rows       = $state['eligible'];
		$has_applied = false;
		$applied_saving = 0.0;
		$best_id    = 0;
		$best_saving = 0.0;
		foreach ( $rows as $row ) {
			$saving = isset( $row['saving'] ) ? (float) $row['saving'] : 0.0;
			if ( ! empty( $row['applied'] ) ) {
				$has_applied    = true;
				$applied_saving = $saving;
			}
			if ( $saving > $best_saving ) {
				$best_saving = $saving;
				$best_id     = (int) $row['id'];
			}
		}
		// Recommend only when it beats what is applied now (and there is a real choice).
		if ( count( $rows ) < 2 || $best_saving <= $applied_saving ) {
			$best_id = 0;
		}
		$count = self::digits( number_format_i18n( count( $rows ) ) );
		$uid   = 'webino-cc-' . wp_rand( 1000, 999999 );
		ob_start();
		?>
		<section class="webino-coupon-chooser webino-cc" data-nonce="<?php echo esc_attr( wp_create_nonce( self::NONCE ) ); ?>" dir="<?php echo is_rtl() ? 'rtl' : 'ltr'; ?>" aria-labelledby="<?php echo esc_attr( $uid ); ?>">
			<header class="webino-cc__head">
				<span class="webino-cc__head-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a2 2 0 0 0 2-2V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1a2 2 0 0 0 0 4v1a2 2 0 0 0 0 4v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1a2 2 0 0 0-2-2"/><path d="M9.5 14.5l5-5"/><circle cx="9.75" cy="9.75" r=".9" fill="currentColor"/><circle cx="14.25" cy="14.25" r=".9" fill="currentColor"/></svg></span>
				<span class="webino-cc__head-text">
					<span class="webino-cc__title" id="<?php echo esc_attr( $uid ); ?>"><?php echo esc_html__( 'Coupons you can use', 'webino-dashboard' ); ?> <span class="webino-cc__count"><?php echo esc_html( $count ); ?></span></span>
					<span class="webino-cc__hint"><?php echo esc_html__( 'One coupon per order — pick the one you like.', 'webino-dashboard' ); ?></span>
				</span>
				<span class="webino-cc__nav" hidden>
					<button type="button" class="webino-cc__arrow webino-cc__arrow--prev" data-webino-cc-dir="-1" aria-controls="<?php echo esc_attr( $uid ); ?>-track" aria-label="<?php echo esc_attr__( 'Previous coupons', 'webino-dashboard' ); ?>"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 6l-6 6 6 6"/></svg></button>
					<button type="button" class="webino-cc__arrow webino-cc__arrow--next" data-webino-cc-dir="1" aria-controls="<?php echo esc_attr( $uid ); ?>-track" aria-label="<?php echo esc_attr__( 'Next coupons', 'webino-dashboard' ); ?>"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 6l6 6-6 6"/></svg></button>
				</span>
			</header>
			<div class="webino-cc__viewport" id="<?php echo esc_attr( $uid ); ?>-track" tabindex="0" role="region" aria-roledescription="<?php echo esc_attr__( 'carousel', 'webino-dashboard' ); ?>" aria-labelledby="<?php echo esc_attr( $uid ); ?>">
			<ul class="webino-cc__list" role="list">
				<?php
				foreach ( $rows as $row ) :
					$is_applied = ! empty( $row['applied'] );
					$is_best    = (int) $row['id'] === $best_id;
					$classes    = 'webino-cc__card' . ( $is_applied ? ' is-applied' : '' ) . ( $is_best ? ' is-best' : '' );
					$title_id   = $uid . '-' . (int) $row['id'];
					?>
					<li class="<?php echo esc_attr( $classes ); ?>" aria-labelledby="<?php echo esc_attr( $title_id ); ?>">
						<div class="webino-cc__main">
							<?php if ( $is_applied || $is_best ) : ?>
								<span class="webino-cc__badges">
									<?php if ( $is_applied ) : ?>
										<span class="webino-cc__badge webino-cc__badge--applied"><span aria-hidden="true">✓</span> <?php echo esc_html__( 'Applied', 'webino-dashboard' ); ?></span>
									<?php endif; ?>
									<?php if ( $is_best ) : ?>
										<span class="webino-cc__badge webino-cc__badge--best"><?php echo esc_html__( 'Best saving', 'webino-dashboard' ); ?></span>
									<?php endif; ?>
								</span>
							<?php endif; ?>
							<span class="webino-cc__benefit" id="<?php echo esc_attr( $title_id ); ?>"><?php echo self::text_html( $row['title'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in text_html(). ?></span>
							<?php if ( ! empty( $row['detail'] ) ) : ?>
								<span class="webino-cc__detail"><?php echo self::text_html( $row['detail'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in text_html(). ?></span>
							<?php endif; ?>
						</div>
						<div class="webino-cc__side">
							<?php if ( ! empty( $row['saving_html'] ) ) : ?>
								<span class="webino-cc__save">
									<span class="webino-cc__save-label"><?php echo esc_html__( 'You save', 'webino-dashboard' ); ?></span>
									<span class="webino-cc__save-amount"><?php echo $row['saving_html']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by price_html(). ?></span>
								</span>
							<?php endif; ?>
							<?php if ( $is_applied ) : ?>
								<button type="button" class="webino-cc__btn webino-cc__btn--remove" data-webino-coupon-remove="1" data-webino-coupon-code="<?php echo esc_attr( $row['code'] ); ?>" aria-label="<?php echo esc_attr( sprintf( /* translators: %s: coupon title */ __( 'Remove coupon: %s', 'webino-dashboard' ), $row['title'] ) ); ?>">
									<span class="webino-cc__spinner" aria-hidden="true"></span><span class="webino-cc__btn-label"><?php echo esc_html__( 'Remove', 'webino-dashboard' ); ?></span>
								</button>
							<?php else : ?>
								<button type="button" class="webino-cc__btn webino-cc__btn--apply" data-webino-coupon-id="<?php echo esc_attr( (string) $row['id'] ); ?>" data-webino-coupon-code="<?php echo esc_attr( $row['code'] ); ?>" aria-label="<?php echo esc_attr( sprintf( /* translators: %s: coupon title */ __( 'Apply coupon: %s', 'webino-dashboard' ), $row['title'] ) ); ?>">
									<span class="webino-cc__spinner" aria-hidden="true"></span><span class="webino-cc__btn-label"><?php echo esc_html( $has_applied ? __( 'Use this instead', 'webino-dashboard' ) : __( 'Apply', 'webino-dashboard' ) ); ?></span>
								</button>
							<?php endif; ?>
						</div>
					</li>
				<?php endforeach; ?>
			</ul>
			</div>
			<p class="webino-cc__msg webino-coupon-chooser__msg" role="status" aria-live="polite"></p>
		</section>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @return void
	 */
	public static function render_cart_chooser() {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in chooser_html().
		echo self::chooser_html();
	}

	/**
	 * @param array<string, string> $fragments Fragments.
	 * @return array<string, string>
	 */
	public static function order_review_fragments( $fragments ) {
		if ( ! is_array( $fragments ) ) {
			$fragments = array();
		}
		$fragments['.webino-coupon-chooser'] = self::chooser_html();
		return $fragments;
	}

	/* ---------------------------------------------------------------------
	 * One-time data repair
	 * ------------------------------------------------------------------- */

	/**
	 * Older offer templates stored "max discount" as WooCommerce *maximum spend*, which made percentage
	 * offers stop working on large carts. Clear that wrong max-spend (the cap is now enforced as a real cap).
	 *
	 * @return void
	 */
	public static function maybe_upgrade_data() {
		if ( (int) get_option( self::DATA_VERSION_OPT, 0 ) >= self::DATA_VERSION ) {
			return;
		}
		if ( ! class_exists( 'WC_Coupon' ) ) {
			return;
		}
		$q = new WP_Query(
			array(
				'post_type'      => 'shop_coupon',
				'post_status'    => 'any',
				'posts_per_page' => 500,
				'fields'         => 'ids',
				'no_found_rows'  => true,
				'meta_query'     => array(
					array(
						'key'     => '_webino_offer_max_discount',
						'value'   => '',
						'compare' => '!=',
					),
				),
			)
		);
		foreach ( (array) $q->posts as $id ) {
			$cap = self::normalize_decimal( get_post_meta( (int) $id, '_webino_offer_max_discount', true ) );
			if ( '' === $cap || (float) $cap <= 0 ) {
				continue;
			}
			$c   = new WC_Coupon( (int) $id );
			$max = self::normalize_decimal( $c->get_maximum_amount() );
			if ( '' !== $max && abs( (float) $max - (float) $cap ) < 0.0001 ) {
				$c->set_maximum_amount( '' );
				$c->save();
			}
		}
		update_option( self::DATA_VERSION_OPT, self::DATA_VERSION, true );
	}
}
