<?php
/**
 * The public-facing functionality of the plugin.
 *
 * @package    WFCP
 * @subpackage WFCP/public
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The public-facing functionality of the plugin.
 */
class WFCP_Public {

	/**
	 * Whether the pricing box HTML was already printed on this request.
	 *
	 * @var bool
	 */
	private static $pricing_box_rendered = false;

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 */
	public function enqueue_styles() {
		// Toman glyph styles site-wide (wc_price + plugin prices).
		wp_register_style( 'wfcp-toman', false, array(), WFCP_VERSION );
		wp_enqueue_style( 'wfcp-toman' );
		wp_add_inline_style(
			'wfcp-toman',
			WFCP_Helper::get_toman_glyph_css()
		);

		if ( ! is_product() && ! is_cart() && ! is_checkout() ) {
			return;
		}

		wp_enqueue_style(
			'wfcp-public-style',
			WFCP_PLUGIN_URL . 'public/css/wfcp-public-style.css',
			array(),
			WFCP_VERSION,
			'all'
		);

		$style = WFCP_Helper::get_settings( 'style' );
		if ( ! is_array( $style ) ) {
			$style = array();
		}

		// Overlap keys from site brand style when available.
		if ( class_exists( 'Webino_Dashboard_Brand_Style', false ) ) {
			$brand = Webino_Dashboard_Brand_Style::palette();
			if ( is_array( $brand ) ) {
				if ( ! empty( $brand['primary'] ) ) {
					$style['button_background'] = $brand['primary'];
					$style['price_color']       = $brand['primary'];
				}
				if ( ! empty( $brand['surface'] ) ) {
					$style['box_background'] = $brand['surface'];
				}
				if ( ! empty( $brand['bg'] ) ) {
					$style['button_text_color'] = $brand['bg'];
				}
				if ( ! empty( $brand['muted'] ) ) {
					$style['box_border_color'] = $brand['muted'];
				}
			}
		}

		$pick = function( $key, $fallback ) use ( $style ) {
			return ( isset( $style[ $key ] ) && $style[ $key ] ) ? $style[ $key ] : $fallback;
		};

		$box_bg     = $pick( 'box_background', '#ffffff' );
		$box_border = $pick( 'box_border_color', '#e0e0e0' );
		$btn_bg     = $pick( 'button_background', '#2271b1' );
		$btn_text   = $pick( 'button_text_color', '#ffffff' );
		$price_color = $pick( 'price_color', '#2271b1' );
		$radius     = isset( $style['border_radius'] ) ? absint( $style['border_radius'] ) : 8;
		$radius     = $radius <= 50 ? $radius : 8;

		$alert_bg     = $pick( 'alert_bg', '#ffffff' );
		$alert_text   = $pick( 'alert_text_color', '#9A3412' );
		$alert_border = $pick( 'alert_border_color', '#FDBA74' );
		$alert_accent = $pick( 'alert_accent', '#EA580C' );

		$badge_cash_bg   = $pick( 'badge_cash_bg', '#ECFDF5' );
		$badge_cash_text = $pick( 'badge_cash_text', '#047857' );
		$badge_credit_bg = $pick( 'badge_credit_bg', '#EFF6FF' );
		$badge_credit_text = $pick( 'badge_credit_text', '#1D4ED8' );
		$badge_inst_bg   = $pick( 'badge_installment_bg', '#FFFBEB' );
		$badge_inst_text = $pick( 'badge_installment_text', '#B45309' );
		$tl_dot          = $pick( 'timeline_dot', '#c45c26' );
		$tl_line         = $pick( 'timeline_line', '#d6b089' );
		$tl_today        = $pick( 'timeline_today_text', '#111827' );
		$tl_future       = $pick( 'timeline_future_text', '#6b7280' );

		$css = sprintf(
			':root{--wfcp-box-bg:%1$s;--wfcp-box-border:%2$s;--wfcp-box-radius:%3$dpx;--wfcp-btn-bg:%4$s;--wfcp-btn-text:%5$s;--wfcp-price-color:%6$s;--wfcp-alert-bg:%7$s;--wfcp-alert-text:%8$s;--wfcp-alert-border:%9$s;--wfcp-alert-accent:%10$s;--wfcp-badge-cash-bg:%11$s;--wfcp-badge-cash-text:%12$s;--wfcp-badge-credit-bg:%13$s;--wfcp-badge-credit-text:%14$s;--wfcp-badge-installment-bg:%15$s;--wfcp-badge-installment-text:%16$s;--wfcp-timeline-dot-color:%17$s;--wfcp-timeline-line-color:%18$s;--wfcp-timeline-today:%19$s;--wfcp-timeline-future:%20$s;}' .
			'.wfcp-pricing-box{--wfcp-box-bg:%1$s;--wfcp-box-border:%2$s;--wfcp-box-radius:%3$dpx;--wfcp-btn-bg:%4$s;--wfcp-btn-text:%5$s;--wfcp-price-color:%6$s;--wfcp-timeline-dot-color:%17$s;--wfcp-timeline-line-color:%18$s;--wfcp-timeline-today:%19$s;--wfcp-timeline-future:%20$s;}',
			esc_attr( $box_bg ),
			esc_attr( $box_border ),
			$radius,
			esc_attr( $btn_bg ),
			esc_attr( $btn_text ),
			esc_attr( $price_color ),
			esc_attr( $alert_bg ),
			esc_attr( $alert_text ),
			esc_attr( $alert_border ),
			esc_attr( $alert_accent ),
			esc_attr( $badge_cash_bg ),
			esc_attr( $badge_cash_text ),
			esc_attr( $badge_credit_bg ),
			esc_attr( $badge_credit_text ),
			esc_attr( $badge_inst_bg ),
			esc_attr( $badge_inst_text ),
			esc_attr( $tl_dot ),
			esc_attr( $tl_line ),
			esc_attr( $tl_today ),
			esc_attr( $tl_future )
		);
		wp_add_inline_style( 'wfcp-public-style', $css );
	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 */
	public function enqueue_scripts() {
		if ( ! is_product() && ! is_cart() && ! is_checkout() ) {
			return;
		}

		$deps = array( 'jquery' );

		if ( is_product() ) {
			// Themes/optimizers sometimes deregister underscore — restore from core.
			if ( ! wp_script_is( 'underscore', 'registered' ) ) {
				wp_register_script( 'underscore', includes_url( 'js/underscore.min.js' ), array(), false, true );
			}
			if ( ! wp_script_is( 'wp-util', 'registered' ) ) {
				wp_register_script( 'wp-util', includes_url( 'js/wp-util.min.js' ), array( 'underscore', 'jquery' ), false, true );
			}
			wp_enqueue_script( 'underscore' );
			wp_enqueue_script( 'wp-util' );
			wp_enqueue_script( 'wc-add-to-cart-variation' );
			$deps[] = 'underscore';
			$deps[] = 'wp-util';
			$deps[] = 'wc-add-to-cart-variation';
		}

		wp_enqueue_script(
			'wfcp-public',
			WFCP_PLUGIN_URL . 'public/js/wfcp-public.js',
			$deps,
			WFCP_VERSION,
			true
		);

		// Early inline guard: rebuild wp.template if wp-util ran before underscore.
		wp_add_inline_script(
			'wfcp-public',
			'window.wp=window.wp||{};if(typeof window.wp.template!=="function"&&typeof window._!=="undefined"&&typeof window._.template==="function"){window.wp.template=window._.memoize(function(id){var compiled,options={evaluate:/<#([\\s\\S]+?)#>/g,interpolate:/\\{\\{\\{([\\s\\S]+?)\\}\\}\\}/g,escape:/\\{\\{([^\\}]+?)\\}\\}(?!\\})/g,variable:"data"};return function(data){var el=document.querySelector("script#tmpl-"+id);if(!el){throw new Error("Template not found: #tmpl-"+id);}compiled=compiled||window._.template(jQuery(el).html(),options);return compiled(data);};});}',
			'before'
		);

		wp_localize_script(
			'wfcp-public',
			'wfcpPublic',
			array(
				'ajaxUrl'              => admin_url( 'admin-ajax.php' ),
				'nonce'                => wp_create_nonce( 'wfcp_public_nonce' ),
				'defaultPurchaseType'  => class_exists( 'WFCP_Cart_Manager' ) ? WFCP_Cart_Manager::get_default_purchase_type() : 'cash',
				'cartPurchaseType'     => self::get_cart_purchase_type_for_localize(),
				'cartInstallmentMonths'=> class_exists( 'WFCP_Cart_Manager' ) ? (int) WFCP_Cart_Manager::cart_dominant_installment_months() : 0,
				'lockPurchaseType'     => ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::is_partner_shopping() ) ? 'wholesale' : '',
			)
		);
	}

	/**
	 * Cart purchase type for JS localize (empty string when cart has no type).
	 *
	 * @return string
	 */
	private static function get_cart_purchase_type_for_localize() {
		if ( class_exists( 'WFCP_Cart_Manager' ) ) {
			$type = WFCP_Cart_Manager::cart_dominant_purchase_type();
			return $type ? $type : '';
		}
		return '';
	}

	/**
	 * Inject WFCP formatted prices into WC variation JSON.
	 * Do not alter attribute slug encoding — keep WC/YITH native matching.
	 *
	 * @param array                $data      Variation data.
	 * @param WC_Product           $product   Parent product.
	 * @param WC_Product_Variation $variation Variation product.
	 * @return array
	 */
	public function available_variation_prices( $data, $product, $variation ) {
		if ( ! WFCP_Helper::is_enabled() || ! $variation ) {
			return $data;
		}

		$variation_id = $variation->get_id();
		$parent_id    = $product ? $product->get_id() : $variation->get_parent_id();

		$base = WFCP_Helper::get_product_purchase_price( $variation_id );
		if ( ! $base || $base <= 0 ) {
			$base = WFCP_Helper::get_product_purchase_price( $parent_id );
		}
		if ( ! $base || $base <= 0 ) {
			return $data;
		}

		$calc_id = $parent_id ? $parent_id : $variation_id;
		$retail  = WFCP_Calculator::calculate_price( $base, 'retail', $calc_id );

		$data['wfcp_formatted_retail'] = WFCP_Helper::format_price_with_irt_symbol( $retail );

		if ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::current_sees_wholesale() ) {
			$wholesale = WFCP_Calculator::calculate_price( $base, 'wholesale', $calc_id );
			$data['wfcp_formatted_wholesale'] = $wholesale > 0 ? WFCP_Helper::format_price_with_irt_symbol( $wholesale ) : '';
		}

		if ( WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) ) && ! ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::hide_retail_ui() ) ) {
			$credit = WFCP_Calculator::calculate_price( $base, 'credit', $calc_id );
			$data['wfcp_formatted_credit'] = $credit > 0 ? WFCP_Helper::format_price_with_irt_symbol( $credit ) : '';
		}

		$install_plans = array();
		if ( WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) ) ) {
			$plans_cfg = WFCP_Helper::get_settings( 'installment', 'plans' ) ?: array();
			foreach ( $plans_cfg as $plan ) {
				$m = intval( $plan['months'] ?? 0 );
				if ( $m > 0 ) {
					$mon = WFCP_Calculator::calculate_price( $base, 'installment', $calc_id, array( 'months' => $m ) );
					$install_plans[] = array(
						'months'    => $m,
						'monthly'   => $mon,
						'formatted' => WFCP_Helper::format_price_with_irt_symbol( $mon ),
					);
				}
			}
		}
		$data['wfcp_installment_plans'] = $install_plans;

		return $data;
	}

	/**
	 * Default WooCommerce add-to-cart is no longer hidden.
	 * It will add products as "cash" (نقدی).
	 * The WFCP pricing box (above) provides the multi-method options.
	 * For variable products the standard variation selects + default button (cash) are visible.
	 */
	public function maybe_hide_default_add_to_cart() {
		// Intentionally left empty to restore official template section.
		// If you want to hide ONLY the default button (not the whole form), use CSS:
		// .wfcp-pricing-box ~ form.cart button.single_add_to_cart_button { display: none; }
	}

	/**
	 * Whether the pricing box was already rendered on this request.
	 *
	 * @return bool
	 */
	public static function is_pricing_box_rendered() {
		return self::$pricing_box_rendered;
	}

	/**
	 * Attach only the selected product-page hook for the pricing box.
	 *
	 * @return void
	 */
	public function register_pricing_box_hooks() {
		if ( is_admin() ) {
			return;
		}
		if ( ! function_exists( 'is_product' ) || ! is_product() ) {
			return;
		}
		if ( ! class_exists( 'WFCP_Helper', false ) || ! WFCP_Helper::is_enabled() ) {
			return;
		}

		$placement = WFCP_Helper::product_box_placement();
		if ( 'none' === $placement ) {
			return;
		}

		if ( 'summary' === $placement ) {
			add_action( 'woocommerce_single_product_summary', array( $this, 'display_pricing_box' ), 25 );
			return;
		}

		if ( 'before_cart' === $placement ) {
			add_action( 'woocommerce_before_add_to_cart_form', array( $this, 'display_pricing_box' ), 5 );
			add_action( 'woocommerce_after_add_to_cart_form', array( $this, 'display_pricing_box_fallback' ), 5 );
			return;
		}

		if ( 'after_cart' === $placement ) {
			add_action( 'woocommerce_after_add_to_cart_form', array( $this, 'display_pricing_box' ), 5 );
			return;
		}

		$priority = 'after_tabs' === $placement ? 12 : 4;
		add_action( 'woocommerce_after_single_product_summary', array( $this, 'display_pricing_box' ), $priority );
	}

	/**
	 * Shared render for storefront pricing box (once per request).
	 *
	 * @return void
	 */
	private function render_pricing_box_once() {
		global $product;

		if ( self::$pricing_box_rendered ) {
			return;
		}

		if ( ! class_exists( 'WFCP_Helper', false ) || ! WFCP_Helper::is_enabled() ) {
			return;
		}

		$resolved = ( $product && is_a( $product, 'WC_Product' ) ) ? $product : null;
		if ( ! $resolved ) {
			$id = function_exists( 'get_the_ID' ) ? (int) get_the_ID() : 0;
			if ( $id > 0 && function_exists( 'wc_get_product' ) ) {
				$maybe = wc_get_product( $id );
				if ( $maybe && is_a( $maybe, 'WC_Product' ) ) {
					$resolved = $maybe;
				}
			}
		}

		if ( ! $resolved ) {
			return;
		}

		$product = $resolved;

		$is_variable = $resolved->is_type( 'variable' );
		if ( ! $is_variable && ! WFCP_Helper::product_has_wfcp_pricing( $resolved ) ) {
			return;
		}

		ob_start();
		include WFCP_PLUGIN_DIR . 'public/partials/wfcp-product-display.php';
		$html = (string) ob_get_clean();
		if ( '' === trim( $html ) ) {
			return;
		}

		self::$pricing_box_rendered = true;
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Display pricing box on single product page
	 */
	public function display_pricing_box() {
		$this->render_pricing_box_once();
	}

	/**
	 * Pricing box after variations form (variable products).
	 */
	public function display_pricing_box_variable() {
		$this->render_pricing_box_once();
	}

	/**
	 * Generic late fallback if primary hooks did not fire.
	 */
	public function display_pricing_box_fallback() {
		$this->render_pricing_box_once();
	}

	/**
	 * ishop: render before add-to-cart form (preferred slot).
	 */
	public function display_pricing_box_ishop_before() {
		$this->render_pricing_box_once();
	}

	/**
	 * ishop: render after add-to-cart form when before-hook missed.
	 */
	public function display_pricing_box_ishop_after() {
		$this->render_pricing_box_once();
	}

	/**
	 * ishop: summary fallback if form hooks never ran.
	 */
	public function display_pricing_box_ishop_fallback() {
		$this->render_pricing_box_once();
	}

	/**
	 * Output global purchase type switcher on cart page (نقدی / اقساطی / اعتباری).
	 */
	public function add_cart_type_switcher() {
		if ( ! is_cart() || ! WC()->cart || WC()->cart->is_empty() ) {
			return;
		}
		$current = 'cash';
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( isset( $item['wfcp_purchase_type'] ) ) {
				$current = $item['wfcp_purchase_type'];
				break;
			}
		}
		if ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::is_partner_shopping() ) {
			$current = 'wholesale';
			?>
			<div class="wfcp-cart-type-switcher">
				<span class="wfcp-switch-label"><?php esc_html_e( 'روش پرداخت سبد همکار:', 'webina-woo-core' ); ?></span>
				<strong><?php esc_html_e( 'عمده', 'webina-woo-core' ); ?></strong>
			</div>
			<?php
			return;
		}
		if ( 'retail' === $current ) {
			$current = 'cash';
		}
		$credit_enabled      = WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) );
		$installment_enabled = WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) );
		?>
		<div class="wfcp-cart-type-switcher">
			<span class="wfcp-switch-label"><?php esc_html_e( 'تغییر روش پرداخت برای کل سبد خرید:', 'webina-woo-core' ); ?></span>
			<select id="wfcp-cart-type-select" class="wfcp-cart-type-select">
				<option value="cash" <?php selected( $current, 'cash' ); ?>><?php esc_html_e( 'نقدی', 'webina-woo-core' ); ?></option>
				<?php if ( $installment_enabled ) : ?>
					<option value="installment" <?php selected( $current, 'installment' ); ?>><?php esc_html_e( 'اقساطی', 'webina-woo-core' ); ?></option>
				<?php endif; ?>
				<?php if ( $credit_enabled ) : ?>
					<option value="credit" <?php selected( $current, 'credit' ); ?>><?php esc_html_e( 'اعتباری', 'webina-woo-core' ); ?></option>
				<?php endif; ?>
			</select>
			<button type="button" class="wfcp-btn wfcp-btn-apply-type" data-nonce="<?php echo esc_attr( wp_create_nonce( 'wfcp_public_nonce' ) ); ?>">
				<?php esc_html_e( 'اعمال تغییر', 'webina-woo-core' ); ?>
			</button>
			<span class="wfcp-switch-note"><?php esc_html_e( '(قیمت‌ها و درگاه‌ها به‌روز می‌شوند)', 'webina-woo-core' ); ?></span>
		</div>
		<?php
	}

	/**
	 * Resolve current cart purchase type slug.
	 *
	 * @return string cash|credit|installment
	 */
	public static function get_cart_purchase_type() {
		$type = 'cash';
		if ( function_exists( 'WC' ) && WC()->cart ) {
			foreach ( WC()->cart->get_cart() as $item ) {
				if ( ! empty( $item['wfcp_purchase_type'] ) ) {
					$type = sanitize_text_field( $item['wfcp_purchase_type'] );
					break;
				}
			}
		}
		if ( 'retail' === $type ) {
			$type = 'cash';
		}
		if ( 'wholesale' === $type ) {
			return 'wholesale';
		}
		if ( ! in_array( $type, array( 'cash', 'credit', 'installment' ), true ) ) {
			$type = 'cash';
		}
		return $type;
	}

	/**
	 * Human label for purchase type.
	 *
	 * @param string $type Purchase type slug.
	 * @return string
	 */
	public static function get_purchase_type_label( $type ) {
		$labels = array(
			'cash'        => __( 'نقدی', 'webina-woo-core' ),
			'credit'      => __( 'اعتباری', 'webina-woo-core' ),
			'installment' => __( 'اقساطی', 'webina-woo-core' ),
			'wholesale'   => __( 'عمده', 'webina-woo-core' ),
		);
		return isset( $labels[ $type ] ) ? $labels[ $type ] : $type;
	}

	/**
	 * Render guide alert for product / cart / checkout.
	 *
	 * @param string $context One of product|cart|checkout.
	 */
	public function render_guide_alert( $context = 'product' ) {
		if ( ! WFCP_Helper::is_enabled() ) {
			return;
		}

		$context = sanitize_key( $context );
		if ( ! in_array( $context, array( 'product', 'cart', 'checkout' ), true ) ) {
			return;
		}

		$notifications = WFCP_Helper::get_settings( 'notifications' );
		if ( ! is_array( $notifications ) ) {
			$notifications = array();
		}

		$enabled_key = 'alert_' . $context . '_enabled';
		$text_key    = 'alert_' . $context . '_text';

		$enabled = array_key_exists( $enabled_key, $notifications )
			? WFCP_Helper::to_bool( $notifications[ $enabled_key ] )
			: true;

		if ( ! $enabled ) {
			return;
		}

		$defaults = array(
			'product'  => 'در صورت نیاز می‌توانید روش پرداخت اقساطی یا اعتباری را از باکس قیمت انتخاب کنید، سپس محصول را به سبد اضافه کنید.',
			'cart'     => 'می‌توانید روش پرداخت همه محصولات سبد را از بخش زیر به نقدی، اقساطی یا اعتباری تغییر دهید.',
			'checkout' => 'روش پرداخت فعلی سبد: {type}. برای تغییر به اقساطی یا اعتباری به سبد خرید برگردید و روش را عوض کنید.',
		);

		$text = isset( $notifications[ $text_key ] ) ? (string) $notifications[ $text_key ] : $defaults[ $context ];
		$text = trim( $text );
		if ( '' === $text ) {
			return;
		}

		$type_slug  = self::get_cart_purchase_type();
		$type_label = self::get_purchase_type_label( $type_slug );
		$text       = str_replace( '{type}', $type_label, $text );

		$show_cart_link = ( 'checkout' === $context );
		$cart_url       = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' );

		$icons = array(
			'product'  => '💡',
			'cart'     => '🛒',
			'checkout' => 'ℹ️',
		);
		$icon = isset( $icons[ $context ] ) ? $icons[ $context ] : '💡';
		?>
		<div class="wfcp-guide-alert wfcp-guide-alert--<?php echo esc_attr( $context ); ?>" role="status">
			<span class="wfcp-guide-alert__icon" aria-hidden="true"><?php echo esc_html( $icon ); ?></span>
			<div class="wfcp-guide-alert__body">
				<p class="wfcp-guide-alert__text"><?php echo esc_html( $text ); ?></p>
			</div>
			<?php if ( $show_cart_link ) : ?>
				<a class="wfcp-guide-alert__link" href="<?php echo esc_url( $cart_url ); ?>">
					<?php esc_html_e( 'بازگشت به سبد خرید', 'webina-woo-core' ); ?>
				</a>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Guide alert wrappers for WooCommerce hooks.
	 */
	public function render_product_guide_alert() {
		$this->render_guide_alert( 'product' );
	}

	public function render_cart_guide_alert() {
		$this->render_guide_alert( 'cart' );
	}

	public function render_checkout_guide_alert() {
		$this->render_guide_alert( 'checkout' );
	}

	/**
	 * AJAX: add product to cart exactly once (never use WC Form_Handler / WC_AJAX add_to_cart).
	 */
	public function ajax_add_to_cart() {
		check_ajax_referer( 'wfcp_public_nonce', 'nonce' );

		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			wp_send_json(
				array(
					'error'   => true,
					'message' => __( 'سبد خرید در دسترس نیست', 'webina-woo-core' ),
				)
			);
		}

		$product_id   = isset( $_POST['product_id'] ) ? absint( wp_unslash( $_POST['product_id'] ) ) : 0;
		$variation_id = isset( $_POST['variation_id'] ) ? absint( wp_unslash( $_POST['variation_id'] ) ) : 0;
		$quantity     = isset( $_POST['quantity'] ) ? wc_stock_amount( wp_unslash( $_POST['quantity'] ) ) : 1;
		if ( $quantity < 1 ) {
			$quantity = 1;
		}

		$purchase_type = isset( $_POST['purchase_type'] ) ? sanitize_text_field( wp_unslash( $_POST['purchase_type'] ) ) : 'cash';
		if ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::is_partner_shopping() ) {
			$purchase_type = 'wholesale';
		} elseif ( ! in_array( $purchase_type, array( 'cash', 'credit', 'installment', 'retail', 'wholesale' ), true ) ) {
			$purchase_type = 'cash';
		}
		if ( 'wholesale' === $purchase_type && class_exists( 'WFCP_Wholesale_Partner', false ) && ! WFCP_Wholesale_Partner::threshold_enabled() && ! WFCP_Wholesale_Partner::is_partner_shopping() ) {
			$purchase_type = 'cash';
		}

		// Ensure cart-item hooks see purchase type (they read $_REQUEST).
		$_REQUEST['purchase_type'] = $purchase_type;
		$_POST['purchase_type']    = $purchase_type;
		if ( 'installment' === $purchase_type && isset( $_POST['installment_months'] ) ) {
			$_REQUEST['installment_months'] = absint( $_POST['installment_months'] );
			$_POST['installment_months']    = absint( $_POST['installment_months'] );
		}

		$variation_attrs = array();
		foreach ( $_POST as $key => $value ) {
			if ( 0 === strpos( $key, 'attribute_' ) ) {
				$variation_attrs[ sanitize_title( $key ) ] = wc_clean( wp_unslash( $value ) );
			}
		}

		// Resolve parent / variation.
		if ( $variation_id > 0 ) {
			$variation = wc_get_product( $variation_id );
			if ( ! $variation || ! $variation->is_type( 'variation' ) ) {
				wp_send_json(
					array(
						'error'   => true,
						'message' => __( 'تنوع نامعتبر است', 'webina-woo-core' ),
					)
				);
			}
			$parent_id = (int) $variation->get_parent_id();
			if ( $product_id > 0 && $product_id !== $parent_id && $product_id !== $variation_id ) {
				wp_send_json(
					array(
						'error'   => true,
						'message' => __( 'تنوع متعلق به این محصول نیست', 'webina-woo-core' ),
					)
				);
			}
			$product_id = $parent_id;
			if ( empty( $variation_attrs ) ) {
				$variation_attrs = $variation->get_variation_attributes();
			}
		} else {
			$product = wc_get_product( $product_id );
			if ( ! $product ) {
				wp_send_json(
					array(
						'error'   => true,
						'message' => __( 'محصول نامعتبر است', 'webina-woo-core' ),
					)
				);
			}
			if ( $product->is_type( 'variation' ) ) {
				$variation_id    = $product_id;
				$product_id      = (int) $product->get_parent_id();
				$variation_attrs = $product->get_variation_attributes();
			} elseif ( $product->is_type( 'variable' ) ) {
				wp_send_json(
					array(
						'error'   => true,
						'message' => __( 'لطفاً رنگ یا سایز را انتخاب کنید', 'webina-woo-core' ),
					)
				);
			}
		}

		$passed = apply_filters( 'woocommerce_add_to_cart_validation', true, $product_id, $quantity, $variation_id, $variation_attrs );
		if ( ! $passed ) {
			$notices = wc_get_notices( 'error' );
			$message = ! empty( $notices ) ? wp_strip_all_tags( $notices[0]['notice'] ) : __( 'امکان افزودن به سبد خرید نیست', 'webina-woo-core' );
			wc_clear_notices();
			wp_send_json(
				array(
					'error'   => true,
					'message' => $message,
				)
			);
		}

		$cart_item_key = WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation_attrs );
		if ( ! $cart_item_key ) {
			$notices = wc_get_notices( 'error' );
			$message = ! empty( $notices ) ? wp_strip_all_tags( $notices[0]['notice'] ) : __( 'خطا در افزودن به سبد خرید', 'webina-woo-core' );
			wc_clear_notices();
			wp_send_json(
				array(
					'error'      => true,
					'message'    => $message,
					'product_url'=> get_permalink( $product_id ),
				)
			);
		}

		// Same response shape as WC_AJAX::get_refreshed_fragments().
		if ( class_exists( 'WC_AJAX' ) && is_callable( array( 'WC_AJAX', 'get_refreshed_fragments' ) ) ) {
			WC_AJAX::get_refreshed_fragments();
		}

		wp_send_json(
			array(
				'fragments' => apply_filters( 'woocommerce_add_to_cart_fragments', array() ),
				'cart_hash' => WC()->cart->get_cart_hash(),
			)
		);
	}

	/**
	 * AJAX: return calculated prices for a selected variation.
	 */
	public function ajax_get_variation_prices() {
		check_ajax_referer( 'wfcp_public_nonce', 'nonce' );

		$product_id   = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : 0;
		$variation_id = isset( $_POST['variation_id'] ) ? intval( $_POST['variation_id'] ) : 0;
		if ( ! $product_id || ! $variation_id ) {
			wp_send_json_error( array( 'message' => 'شناسه محصول نامعتبر' ) );
		}

		$variation = wc_get_product( $variation_id );
		if ( ! $variation || ! $variation->is_type( 'variation' ) || (int) $variation->get_parent_id() !== $product_id ) {
			wp_send_json_error( array( 'message' => 'تنوع متعلق به این محصول نیست' ) );
		}

		if ( WFCP_Helper::is_product_price_locked( $product_id ) || WFCP_Helper::is_product_price_locked( $variation_id ) ) {
			wp_send_json_error( array( 'message' => 'قیمت قفل است' ) );
		}

		$base = WFCP_Helper::get_product_purchase_price( $variation_id );
		if ( ! $base || $base <= 0 ) {
			$base = WFCP_Helper::get_product_purchase_price( $product_id );
		}
		if ( ! $base || $base <= 0 ) {
			wp_send_json_error( array( 'message' => 'قیمت خرید تنظیم نشده' ) );
		}

		$retail = WFCP_Calculator::calculate_price( $base, 'retail', $product_id );
		$credit = 0;
		if ( WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) ) ) {
			$credit = WFCP_Calculator::calculate_price( $base, 'credit', $product_id );
		}

		$install_plans = array();
		if ( WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) ) ) {
			$plans_cfg = WFCP_Helper::get_settings( 'installment', 'plans' ) ?: array();
			foreach ( $plans_cfg as $plan ) {
				$m = intval( $plan['months'] ?? 0 );
				if ( $m > 0 ) {
					$mon = WFCP_Calculator::calculate_price( $base, 'installment', $product_id, array( 'months' => $m ) );
					$install_plans[] = array(
						'months'    => $m,
						'monthly'   => $mon,
						'formatted' => WFCP_Helper::format_price_with_irt_symbol( $mon ),
					);
				}
			}
		}

		$wholesale = 0;
		if ( class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::current_sees_wholesale() ) {
			$wholesale = WFCP_Calculator::calculate_price( $base, 'wholesale', $product_id );
		}

		wp_send_json_success( array(
			'retail'               => $retail,
			'credit'               => $credit,
			'wholesale'            => $wholesale,
			'installment_plans'    => $install_plans,
			'formatted_retail'     => WFCP_Helper::format_price_with_irt_symbol( $retail ),
			'formatted_credit'     => $credit > 0 ? WFCP_Helper::format_price_with_irt_symbol( $credit ) : '',
			'formatted_wholesale'  => $wholesale > 0 ? WFCP_Helper::format_price_with_irt_symbol( $wholesale ) : '',
		) );
	}
}

