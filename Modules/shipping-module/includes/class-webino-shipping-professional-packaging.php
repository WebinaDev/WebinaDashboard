<?php
/**
 * Optional fixed professional packaging fee (cart / checkout add-on).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Storefront UI + WooCommerce fee for professional packaging.
 */
class Webino_Shipping_Professional_Packaging {

	const SESSION_KEY = 'webino_professional_packaging';
	const ORDER_META  = '_webino_professional_packaging';
	const FEE_ID      = 'webino_professional_packaging';

	/** @var bool */
	private static $rendered = false;

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'woocommerce_cart_calculate_fees', array( __CLASS__, 'add_cart_fee' ), 25 );
		add_action( 'woocommerce_review_order_after_shipping', array( __CLASS__, 'render_checkout' ), 15 );
		add_action( 'woocommerce_review_order_before_order_total', array( __CLASS__, 'render_checkout_fallback' ), 5 );
		add_action( 'woocommerce_cart_totals_after_shipping', array( __CLASS__, 'render_cart' ), 15 );
		add_action( 'woocommerce_cart_totals_before_order_total', array( __CLASS__, 'render_cart_fallback' ), 5 );
		add_action( 'woocommerce_checkout_update_order_review', array( __CLASS__, 'capture_checkout_choice' ), 10 );
		add_action( 'woocommerce_checkout_update_order_review', array( __CLASS__, 'reset_render_flag' ), 1 );
		add_action( 'wp_ajax_webino_professional_packaging_toggle', array( __CLASS__, 'ajax_toggle' ) );
		add_action( 'wp_ajax_nopriv_webino_professional_packaging_toggle', array( __CLASS__, 'ajax_toggle' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ), 35 );
		add_action( 'woocommerce_checkout_create_order', array( __CLASS__, 'attach_to_order' ), 25, 2 );
		add_action( 'woocommerce_admin_order_data_after_shipping_address', array( __CLASS__, 'admin_order_note' ), 15 );
	}

	/**
	 * Allow re-render after checkout AJAX fragments refresh.
	 *
	 * @return void
	 */
	public static function reset_render_flag() {
		self::$rendered = false;
	}

	/**
	 * Whether the add-on should be offered (enabled + positive amount).
	 *
	 * @return bool
	 */
	public static function is_available() {
		$s = Webino_Shipping_Packaging_Settings::get();
		return ! empty( $s['professional_fee_enabled'] ) && (float) $s['professional_fee_amount'] > 0;
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function settings() {
		return Webino_Shipping_Packaging_Settings::get();
	}

	/**
	 * @return bool
	 */
	public static function is_selected() {
		if ( ! self::is_available() ) {
			return false;
		}
		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return false;
		}
		$raw = WC()->session->get( self::SESSION_KEY );
		if ( null === $raw || '' === $raw ) {
			$s = self::settings();
			return ! empty( $s['professional_fee_default_selected'] );
		}
		return 'yes' === $raw || true === $raw || 1 === $raw || '1' === $raw;
	}

	/**
	 * @param bool $selected Selected.
	 * @return void
	 */
	public static function set_selected( $selected ) {
		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return;
		}
		WC()->session->set( self::SESSION_KEY, $selected ? 'yes' : 'no' );
	}

	/**
	 * @param WC_Cart $cart Cart.
	 * @return void
	 */
	public static function add_cart_fee( $cart ) {
		if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
			return;
		}
		if ( ! self::is_available() || ! self::is_selected() ) {
			return;
		}
		if ( ! is_a( $cart, 'WC_Cart' ) ) {
			return;
		}
		$s      = self::settings();
		$label  = (string) $s['professional_fee_label'];
		$amount = (float) $s['professional_fee_amount'];
		if ( '' === $label || $amount <= 0 ) {
			return;
		}
		$cart->add_fee( $label, $amount, false );
	}

	/**
	 * Persist checkbox from checkout update_order_review POST body.
	 *
	 * @param string $post_data Serialized checkout form.
	 * @return void
	 */
	public static function capture_checkout_choice( $post_data ) {
		if ( ! self::is_available() ) {
			return;
		}
		$data = array();
		if ( is_string( $post_data ) && '' !== $post_data ) {
			parse_str( $post_data, $data );
		}
		$selected = isset( $data['webino_professional_packaging'] )
			&& in_array( (string) $data['webino_professional_packaging'], array( '1', 'yes', 'on' ), true );
		self::set_selected( $selected );
	}

	/**
	 * AJAX toggle from cart / checkout checkbox.
	 *
	 * @return void
	 */
	public static function ajax_toggle() {
		check_ajax_referer( 'webino_professional_packaging', 'nonce' );
		if ( ! self::is_available() ) {
			wp_send_json_error( array( 'message' => 'disabled' ), 400 );
		}
		$selected = isset( $_POST['selected'] ) && in_array( (string) wp_unslash( $_POST['selected'] ), array( '1', 'yes', 'true' ), true );
		self::set_selected( $selected );
		if ( function_exists( 'WC' ) && WC()->cart ) {
			WC()->cart->calculate_totals();
		}
		wp_send_json_success(
			array(
				'selected' => $selected,
				'amount'   => (float) self::settings()['professional_fee_amount'],
			)
		);
	}

	/**
	 * @param WC_Order             $order Order.
	 * @param array<string, mixed> $data  Checkout data.
	 * @return void
	 */
	public static function attach_to_order( $order, $data = array() ) {
		unset( $data );
		if ( ! is_a( $order, 'WC_Order' ) || ! self::is_available() ) {
			return;
		}
		$selected = self::is_selected();
		$order->update_meta_data( self::ORDER_META, $selected ? 'yes' : 'no' );
		if ( $selected ) {
			$s = self::settings();
			$order->update_meta_data( self::ORDER_META . '_label', (string) $s['professional_fee_label'] );
			$order->update_meta_data( self::ORDER_META . '_amount', (float) $s['professional_fee_amount'] );
		}
	}

	/**
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function admin_order_note( $order ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}
		$flag = (string) $order->get_meta( self::ORDER_META );
		if ( 'yes' !== $flag ) {
			return;
		}
		$label  = (string) $order->get_meta( self::ORDER_META . '_label' );
		$amount = (float) $order->get_meta( self::ORDER_META . '_amount' );
		if ( '' === $label ) {
			$label = __( 'بسته‌بندی حرفه‌ای', 'webino-dashboard' );
		}
		echo '<p class="form-field form-field-wide webino-professional-packaging-admin"><strong>'
			. esc_html( $label ) . '</strong>';
		if ( $amount > 0 && function_exists( 'wc_price' ) ) {
			echo ' — ' . wp_kses_post( wc_price( $amount ) );
		}
		echo '</p>';
	}

	/**
	 * @return void
	 */
	public static function render_checkout() {
		self::render_ui( 'checkout' );
	}

	/**
	 * @return void
	 */
	public static function render_checkout_fallback() {
		if ( self::$rendered ) {
			return;
		}
		self::render_ui( 'checkout' );
	}

	/**
	 * @return void
	 */
	public static function render_cart() {
		self::render_ui( 'cart' );
	}

	/**
	 * @return void
	 */
	public static function render_cart_fallback() {
		if ( self::$rendered ) {
			return;
		}
		self::render_ui( 'cart' );
	}

	/**
	 * @param string $context cart|checkout.
	 * @return void
	 */
	private static function render_ui( $context ) {
		if ( self::$rendered || ! self::is_available() ) {
			return;
		}
		self::$rendered = true;
		$s        = self::settings();
		$label    = (string) $s['professional_fee_label'];
		$desc     = (string) $s['professional_fee_description'];
		$amount   = (float) $s['professional_fee_amount'];
		$selected = self::is_selected();
		$price    = function_exists( 'wc_price' ) ? wc_price( $amount ) : (string) $amount;
		$id       = 'webino_professional_packaging_' . sanitize_key( $context );

		echo '<tr class="webino-professional-packaging"><th colspan="2">';
		echo '<div class="webino-prof-pack" data-context="' . esc_attr( $context ) . '">';
		echo '<label class="webino-prof-pack__card" for="' . esc_attr( $id ) . '">';
		echo '<span class="webino-prof-pack__icon" aria-hidden="true">';
		echo '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">';
		echo '<rect x="6" y="14" width="36" height="26" rx="4" stroke="currentColor" stroke-width="2.2"/>';
		echo '<path d="M6 20h36" stroke="currentColor" stroke-width="2.2"/>';
		echo '<path d="M18 14l6-7 6 7" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>';
		echo '<path d="M24 28v6M21 31h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>';
		echo '</svg></span>';
		echo '<span class="webino-prof-pack__body">';
		echo '<span class="webino-prof-pack__title-row">';
		echo '<span class="webino-prof-pack__title">' . esc_html( $label ) . '</span>';
		echo '<span class="webino-prof-pack__badge">' . esc_html__( 'اختیاری', 'webino-dashboard' ) . '</span>';
		echo '</span>';
		if ( '' !== $desc ) {
			echo '<span class="webino-prof-pack__desc">' . esc_html( $desc ) . '</span>';
		}
		echo '<span class="webino-prof-pack__price">' . wp_kses_post( $price ) . '</span>';
		echo '</span>';
		echo '<span class="webino-prof-pack__control">';
		echo '<input type="checkbox" class="webino-prof-pack__input" name="webino_professional_packaging" id="'
			. esc_attr( $id ) . '" value="1"' . checked( $selected, true, false ) . ' />';
		echo '<span class="webino-prof-pack__switch" aria-hidden="true"></span>';
		echo '</span>';
		echo '</label>';
		echo '</div>';
		echo '</th></tr>';
	}

	/**
	 * @return void
	 */
	public static function enqueue_assets() {
		if ( ! self::is_available() ) {
			return;
		}
		if ( ! function_exists( 'is_cart' ) || ! function_exists( 'is_checkout' ) ) {
			return;
		}
		if ( ! is_cart() && ! is_checkout() ) {
			return;
		}

		$dir = dirname( __DIR__ ) . '/public/';
		$css = $dir . 'professional-packaging.css';
		$js  = $dir . 'professional-packaging.js';
		$base = defined( 'WEBINO_DASHBOARD_FILE' )
			? plugins_url( 'Modules/shipping-module/public/', WEBINO_DASHBOARD_FILE )
			: plugins_url( 'public/', dirname( __DIR__ ) . '/bootstrap.php' );

		if ( is_readable( $css ) ) {
			wp_enqueue_style(
				'webino-professional-packaging',
				$base . 'professional-packaging.css',
				array(),
				(string) filemtime( $css )
			);
		} else {
			wp_register_style( 'webino-professional-packaging', false, array(), '1.0' );
			wp_enqueue_style( 'webino-professional-packaging' );
			wp_add_inline_style( 'webino-professional-packaging', self::fallback_css() );
		}

		$deps = array( 'jquery' );
		if ( is_readable( $js ) ) {
			wp_enqueue_script(
				'webino-professional-packaging',
				$base . 'professional-packaging.js',
				$deps,
				(string) filemtime( $js ),
				true
			);
		} else {
			wp_register_script( 'webino-professional-packaging', false, $deps, '1.0', true );
			wp_enqueue_script( 'webino-professional-packaging' );
			wp_add_inline_script( 'webino-professional-packaging', self::fallback_js() );
		}

		wp_localize_script(
			'webino-professional-packaging',
			'webinoProfessionalPackaging',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'webino_professional_packaging' ),
				'action'  => 'webino_professional_packaging_toggle',
			)
		);
	}

	/**
	 * Inline CSS fallback when public file is missing.
	 *
	 * @return string
	 */
	private static function fallback_css() {
		return '.webino-prof-pack{margin:0}.webino-prof-pack__card{display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid rgba(15,23,42,.12);border-radius:14px;background:linear-gradient(135deg,#f8fafc 0%,#eef6ff 55%,#f5f3ff 100%);cursor:pointer;transition:box-shadow .2s,border-color .2s}.webino-prof-pack__card:hover{border-color:#3b82f6;box-shadow:0 8px 24px rgba(59,130,246,.12)}.webino-prof-pack__icon{color:#2563eb;flex:0 0 auto}.webino-prof-pack__body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px}.webino-prof-pack__title-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.webino-prof-pack__title{font-weight:700;font-size:15px;color:#0f172a}.webino-prof-pack__badge{font-size:11px;padding:2px 8px;border-radius:999px;background:#dbeafe;color:#1d4ed8}.webino-prof-pack__desc{font-size:12.5px;line-height:1.5;color:#64748b}.webino-prof-pack__price{font-weight:700;font-size:14px;color:#1d4ed8}.webino-prof-pack__control{position:relative;flex:0 0 auto}.webino-prof-pack__input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer;z-index:2}.webino-prof-pack__switch{display:inline-block;width:46px;height:26px;border-radius:999px;background:#cbd5e1;position:relative;transition:background .2s}.webino-prof-pack__switch:after{content:"";position:absolute;top:3px;inset-inline-start:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .2s}.webino-prof-pack__input:checked+.webino-prof-pack__switch{background:#2563eb}.webino-prof-pack__input:checked+.webino-prof-pack__switch:after{transform:translateX(20px)}[dir=rtl] .webino-prof-pack__input:checked+.webino-prof-pack__switch:after{transform:translateX(-20px)}.webino-professional-packaging th{padding-top:12px!important;padding-bottom:12px!important}';
	}

	/**
	 * Inline JS fallback when public file is missing.
	 *
	 * @return string
	 */
	private static function fallback_js() {
		return <<<'JS'
(function($){
  if(!$||!window.webinoProfessionalPackaging)return;
  var cfg=window.webinoProfessionalPackaging;
  function sync(checked){
    $.post(cfg.ajaxUrl,{action:cfg.action,nonce:cfg.nonce,selected:checked?'1':'0'}).always(function(){
      if($('form.checkout').length){$(document.body).trigger('update_checkout');}
      else if($('form.woocommerce-cart-form').length){$(document.body).trigger('wc_update_cart');}
    });
  }
  $(document).on('change','.webino-prof-pack__input',function(){
    sync(!!this.checked);
  });
})(window.jQuery);
JS;
	}
}
