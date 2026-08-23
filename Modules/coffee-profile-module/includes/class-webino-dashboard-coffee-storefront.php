<?php
/**
 * Storefront coffee profile renderer.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WooCommerce product-page output.
 */
class Webino_Dashboard_Coffee_Storefront {

	/**
	 * Prevent duplicate output when several theme hooks fire.
	 *
	 * @var bool
	 */
	private static $rendered = false;

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'wp', array( __CLASS__, 'register_hooks' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	/**
	 * @return bool
	 */
	public static function is_ishop_theme() {
		if ( function_exists( 'ishop_theme_util' ) ) {
			return true;
		}
		$stylesheet = function_exists( 'get_stylesheet' ) ? (string) get_stylesheet() : '';
		$template   = function_exists( 'get_template' ) ? (string) get_template() : '';
		return in_array( 'ishop-theme', array( $stylesheet, $template ), true );
	}

	/**
	 * @return void
	 */
	public static function register_hooks() {
		if ( is_admin() ) {
			return;
		}
		$settings  = Webino_Dashboard_Coffee_Profile::get_settings();
		$placement = (string) ( $settings['placement'] ?? 'summary' );
		if ( 'none' === $placement ) {
			return;
		}

		if ( 'summary' === $placement ) {
			if ( self::is_ishop_theme() ) {
				add_action( 'woocommerce_single_product_summary', array( __CLASS__, 'remove_ishop_meta' ), 19 );
				add_action( 'woocommerce_single_product_summary', array( __CLASS__, 'render_current' ), 20 );
				add_filter( 'woocommerce_short_description', array( __CLASS__, 'hide_short_description' ), 5 );
			} else {
				add_action( 'woocommerce_single_product_summary', array( __CLASS__, 'render_current' ), 25 );
			}
			return;
		}

		if ( 'before_cart' === $placement ) {
			add_action( 'woocommerce_before_add_to_cart_form', array( __CLASS__, 'render_current' ), 5 );
			return;
		}

		if ( 'after_cart' === $placement ) {
			add_action( 'woocommerce_after_add_to_cart_form', array( __CLASS__, 'render_current' ), 5 );
			return;
		}

		$priority = 'after_tabs' === $placement ? 12 : 4;
		add_action( 'woocommerce_after_single_product_summary', array( __CLASS__, 'render_current' ), $priority );
	}

	/**
	 * ishop re-adds product meta at summary priority 20 inside the template,
	 * after `wp`. Remove it from within the same action so the profile can replace it.
	 *
	 * @return void
	 */
	public static function remove_ishop_meta() {
		if ( ! is_product() ) {
			return;
		}
		if ( ! self::product_has_output( (int) get_the_ID() ) ) {
			return;
		}
		remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_meta', 20 );
	}

	/**
	 * Drop the excerpt teaser when coffee profile replaces the ishop details block.
	 *
	 * @param string $html Excerpt HTML.
	 * @return string
	 */
	public static function hide_short_description( $html ) {
		if ( ! is_product() ) {
			return $html;
		}
		if ( ! self::product_has_output( (int) get_the_ID() ) ) {
			return $html;
		}
		return '';
	}

	/**
	 * @param int $product_id Product ID.
	 * @return bool
	 */
	public static function product_has_output( $product_id ) {
		$product_id = (int) $product_id;
		if ( $product_id <= 0 ) {
			return false;
		}
		$profile  = Webino_Dashboard_Coffee_Profile::get_profile( $product_id );
		$settings = Webino_Dashboard_Coffee_Profile::get_settings();
		$origins  = Webino_Dashboard_Coffee_Origins::items_for_product( $product_id );
		$blocks   = self::visible_blocks( $profile, $settings, $origins );
		return in_array( true, $blocks, true );
	}

	/**
	 * @return void
	 */
	public static function enqueue() {
		if ( is_admin() ) {
			return;
		}
		$need = is_product() || ( is_singular() && has_shortcode( (string) get_post_field( 'post_content', get_the_ID() ), 'webino_coffee_profile' ) );
		if ( ! $need ) {
			return;
		}
		$css = dirname( __DIR__ ) . '/public/coffee-profile.css';
		if ( ! is_readable( $css ) ) {
			return;
		}
		$ver = (string) filemtime( $css );
		$url = defined( 'WEBINO_DASHBOARD_FILE' )
			? plugins_url( 'Modules/coffee-profile-module/public/coffee-profile.css', WEBINO_DASHBOARD_FILE )
			: plugins_url( 'public/coffee-profile.css', dirname( __DIR__ ) . '/bootstrap.php' );
		wp_enqueue_style( 'webino-coffee-profile', $url, array(), $ver );
	}

	/**
	 * @param array<string,mixed>|string $atts Shortcode atts.
	 * @return string
	 */
	public static function shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'id' => 0,
			),
			is_array( $atts ) ? $atts : array()
		);
		$id = (int) $atts['id'];
		if ( $id <= 0 ) {
			$id = (int) get_the_ID();
		}
		return self::render_html( $id );
	}

	/**
	 * @return void
	 */
	public static function render_current() {
		if ( self::$rendered ) {
			return;
		}
		$html = self::render_html( (int) get_the_ID() );
		if ( '' === $html ) {
			return;
		}
		self::$rendered = true;
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * @param int $product_id Product ID.
	 * @return string
	 */
	public static function render_html( $product_id ) {
		$product_id = (int) $product_id;
		if ( $product_id <= 0 ) {
			return '';
		}
		$profile  = Webino_Dashboard_Coffee_Profile::get_profile( $product_id );
		$settings = Webino_Dashboard_Coffee_Profile::get_settings();
		$origins  = Webino_Dashboard_Coffee_Origins::items_for_product( $product_id );
		$blocks   = self::visible_blocks( $profile, $settings, $origins );
		if ( ! in_array( true, $blocks, true ) ) {
			return '';
		}

		ob_start();
		$css_vars = self::css_variables( $settings );
		$partial  = dirname( __DIR__ ) . '/public/partials/profile.php';
		if ( is_readable( $partial ) ) {
			include $partial;
		}
		return (string) ob_get_clean();
	}

	/**
	 * @param array<string,mixed>              $profile  Profile.
	 * @param array<string,mixed>              $settings Settings.
	 * @param array<int,array<string,mixed>>   $origins  Origins.
	 * @return array<string,bool>
	 */
	public static function visible_blocks( $profile, $settings, $origins ) {
		$out = array(
			'blend'      => false,
			'acidity'    => false,
			'caffeine'   => false,
			'bitterness' => false,
			'sweetness'  => false,
			'body'       => false,
			'origin'     => false,
		);
		$blend_on     = ( (int) ( $profile['blend_robusta'] ?? 0 ) + (int) ( $profile['blend_arabica'] ?? 0 ) ) > 0;
		$out['blend'] = $blend_on && self::flag_on( $profile, 'blend' );

		$sum = 0;
		foreach ( (array) ( $profile['acidity'] ?? array() ) as $v ) {
			$sum += (int) $v;
		}
		$out['acidity']  = $sum > 0 && ! empty( $settings['acidity_levels'] ) && self::flag_on( $profile, 'acidity' );
		$out['caffeine'] = (int) ( $profile['caffeine_mg'] ?? 0 ) > 0 && self::flag_on( $profile, 'caffeine' );
		$min             = (int) ( $settings['scale_min'] ?? 0 );
		foreach ( array( 'bitterness', 'sweetness', 'body' ) as $key ) {
			$out[ $key ] = (int) ( $profile[ $key ] ?? 0 ) > $min && self::flag_on( $profile, $key );
		}
		$out['origin'] = is_array( $origins ) && count( $origins ) > 0 && self::flag_on( $profile, 'origin' );
		return $out;
	}

	/**
	 * @param array<string,mixed> $profile Profile.
	 * @param string              $key     Block key.
	 * @return bool
	 */
	private static function flag_on( $profile, $key ) {
		if ( empty( $profile['visible_saved'] ) ) {
			return true;
		}
		$vis = isset( $profile['visible'] ) && is_array( $profile['visible'] ) ? $profile['visible'] : array();
		if ( self::all_flags_off( $vis ) ) {
			return true;
		}
		if ( ! array_key_exists( $key, $vis ) ) {
			return true;
		}
		return ! empty( $vis[ $key ] );
	}

	/**
	 * Accidental all-off from editor defaults must not hide a filled profile.
	 * Placement `none` is the storefront kill switch.
	 *
	 * @param array<string,mixed> $vis Visibility map.
	 * @return bool
	 */
	private static function all_flags_off( $vis ) {
		if ( ! is_array( $vis ) || array() === $vis ) {
			return true;
		}
		foreach ( $vis as $value ) {
			if ( ! empty( $value ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * @param array<string,mixed> $settings Settings.
	 * @return string
	 */
	public static function css_variables( $settings ) {
		$c = isset( $settings['colors'] ) && is_array( $settings['colors'] ) ? $settings['colors'] : array();
		$map = array(
			'--wcp-bg'           => (string) ( $c['card_bg'] ?? '#f7f3ee' ),
			'--wcp-text'         => (string) ( $c['card_text'] ?? '#3d2b1f' ),
			'--wcp-border'       => (string) ( $c['card_border'] ?? '#e2d5c5' ),
			'--wcp-track'        => (string) ( $c['track'] ?? '#e8ddd0' ),
			'--wcp-blend'        => (string) ( $c['blend_fill'] ?? '#6b4f3a' ),
			'--wcp-acidity-line' => (string) ( $c['acidity_line'] ?? '#8b6914' ),
			'--wcp-acidity-dot'  => (string) ( $c['acidity_dot'] ?? '#c45c26' ),
			'--wcp-caffeine'     => (string) ( $c['caffeine_fill'] ?? '#4a3728' ),
			'--wcp-bitterness'   => (string) ( $c['bitterness_fill'] ?? '#5c4033' ),
			'--wcp-sweetness'    => (string) ( $c['sweetness_fill'] ?? '#c17f3a' ),
			'--wcp-body'         => (string) ( $c['body_fill'] ?? '#7a5c45' ),
			'--wcp-label'        => (string) ( $c['label'] ?? '#6b5b4f' ),
			'--wcp-value'        => (string) ( $c['value'] ?? '#3d2b1f' ),
			'--wcp-font-title'   => (int) $settings['font_title'] . 'px',
			'--wcp-font-label'   => (int) $settings['font_label'] . 'px',
			'--wcp-font-value'   => (int) $settings['font_value'] . 'px',
			'--wcp-radius'       => (int) $settings['radius'] . 'px',
			'--wcp-gap'          => (int) $settings['gap'] . 'px',
			'--wcp-bar-h'        => (int) $settings['bar_height'] . 'px',
			'--wcp-stroke'       => (int) $settings['stroke_width'] . 'px',
		);
		$parts = array();
		foreach ( $map as $key => $val ) {
			$parts[] = $key . ':' . $val;
		}
		return implode( ';', $parts );
	}

	/**
	 * @param int $value Current.
	 * @param int $min   Min.
	 * @param int $max   Max.
	 * @return float
	 */
	public static function pct( $value, $min, $max ) {
		$span = (int) $max - (int) $min;
		if ( $span <= 0 ) {
			return 0;
		}
		$pct = ( ( (int) $value - (int) $min ) / $span ) * 100;
		return max( 0, min( 100, $pct ) );
	}
}
