<?php
/**
 * Helper functions
 *
 * @package    WFCP
 * @subpackage WFCP/includes/utilities
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Helper functions class
 */
class WFCP_Helper {

	/**
	 * Get plugin settings
	 *
	 * @param string $section Optional. Settings section.
	 * @param string $key     Optional. Settings key.
	 * @return mixed
	 */
	public static function get_settings( $section = null, $key = null ) {
		$settings = get_option( 'wfcp_settings', array() );
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		if ( null === $section ) {
			return $settings;
		}

		if ( ! isset( $settings[ $section ] ) || ! is_array( $settings[ $section ] ) ) {
			if ( null === $key ) {
				return array();
			}
			return null;
		}

		if ( null === $key ) {
			return $settings[ $section ];
		}

		if ( ! isset( $settings[ $section ][ $key ] ) ) {
			return null;
		}

		return $settings[ $section ][ $key ];
	}

	/**
	 * Normalize checkbox/toggle values (jQuery sends "false" as string).
	 *
	 * @param mixed $value Raw value.
	 * @return bool
	 */
	public static function to_bool( $value ) {
		return in_array( $value, array( true, 1, '1', 'true', 'on', 'yes' ), true );
	}

	/**
	 * Update plugin settings (merge with existing section — never wipe unposted keys).
	 *
	 * @param string $section Settings section.
	 * @param array  $data    Settings data (partial OK).
	 * @return bool
	 */
	public static function update_settings( $section, $data ) {
		$settings = self::get_settings();

		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		if ( ! is_array( $data ) ) {
			$data = array();
		}

		$existing = isset( $settings[ $section ] ) && is_array( $settings[ $section ] )
			? $settings[ $section ]
			: array();

		$settings[ $section ] = array_merge( $existing, $data );

		$updated = update_option( 'wfcp_settings', $settings );

		if ( $updated ) {
			return true;
		}

		// WordPress returns false from update_option() when the new value is identical
		// to the stored value (no DB write). Treat persisted match as success.
		$stored = get_option( 'wfcp_settings', array() );
		if ( ! is_array( $stored ) || ! isset( $stored[ $section ] ) ) {
			return false;
		}

		return maybe_serialize( $stored[ $section ] ) === maybe_serialize( $settings[ $section ] );
	}

	/**
	 * Sanitize price value
	 *
	 * @param mixed $price Price value.
	 * @return float
	 */
	public static function sanitize_price( $price ) {
		if ( is_array( $price ) ) {
			return 0.0;
		}
		$price = sanitize_text_field( (string) $price );
		$price = str_replace( array( ',', ' ' ), '', $price );
		return floatval( $price );
	}

	/**
	 * Format price for display
	 *
	 * @param float  $price    Price value.
	 * @param string $currency Optional. Currency code.
	 * @return string
	 */
	public static function format_price( $price, $currency = null ) {
		if ( null === $currency ) {
			$currency = self::get_wc_currency_code();
		}

		$formatted = number_format( (float) $price, 0, '.', ',' );

		if ( in_array( strtoupper( (string) $currency ), array( 'IRT', 'TOMAN', 'IRHT' ), true ) ) {
			return self::wrap_price_with_toman_glyph( $formatted );
		}

		$symbol = self::get_currency_symbol( $currency );
		return $formatted . ' ' . $symbol;
	}

	/**
	 * Get effective currency code: prefer WooCommerce, fallback to plugin setting.
	 *
	 * @return string
	 */
	private static function get_wc_currency_code() {
		if ( function_exists( 'get_woocommerce_currency' ) ) {
			$wc_currency = get_woocommerce_currency();
			if ( ! empty( $wc_currency ) ) {
				return $wc_currency;
			}
		}
		return self::get_settings( 'general', 'currency' );
	}

	/**
	 * Get currency symbol
	 *
	 * @param string $currency Currency code.
	 * @return string
	 */
	public static function get_currency_symbol( $currency = null ) {
		if ( null === $currency ) {
			$currency = self::get_wc_currency_code();
		}

		$symbols = array(
			'IRR' => 'ریال',
			'IRT' => 'تومان',
			'TOMAN' => 'تومان',
			'USD' => '$',
			'EUR' => '€',
			'GBP' => '£',
		);

		return isset( $symbols[ $currency ] ) ? $symbols[ $currency ] : $currency;
	}

	/**
	 * Toman currency glyph markup (CSS mask SVG). No ishop classes — theme injects "IRT" text into those.
	 *
	 * @param string $class Optional extra class.
	 * @return string HTML markup.
	 */
	public static function get_toman_svg( $class = '' ) {
		$classes = 'wfcp-toman-glyph';
		if ( $class ) {
			$classes .= ' ' . esc_attr( $class );
		}

		return '<span class="' . esc_attr( $classes ) . '" translate="no" aria-hidden="true"></span>';
	}

	/**
	 * Wrap amount + toman glyph like dashboard MoneyDisplay (number then icon; RTL places icon left).
	 *
	 * @param string $amount_html Already-formatted amount HTML/text.
	 * @return string
	 */
	public static function wrap_price_with_toman_glyph( $amount_html ) {
		$amount = wp_strip_all_tags( (string) $amount_html );
		$amount = trim( preg_replace( '/\s*(تومان|toman|irt)\s*/iu', '', $amount ) );
		if ( '' === $amount ) {
			$amount = (string) $amount_html;
		}

		return '<span class="wfcp-price-inline">'
			. '<span class="wfcp-price-amount">' . esc_html( $amount ) . '</span>'
			. self::get_toman_svg()
			. '<span class="screen-reader-text">' . esc_html__( 'تومان', 'webina-woo-core' ) . '</span>'
			. '</span>';
	}

	/**
	 * Shared CSS for toman glyph (frontend + admin).
	 * Uses CSS mask so the glyph inherits the surrounding text color (currentColor).
	 *
	 * @return string
	 */
	public static function get_toman_glyph_css() {
		// Black-filled SVG for mask (alpha shape); color comes from background-color: currentColor.
		$irt_mask = "url(\"data:image/svg+xml;utf8,%3Csvg%20width%3D%2213%22%20height%3D%2212%22%20viewBox%3D%220%200%2013%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M2.32002%206.11782C2.63548%205.96391%202.87208%205.81%203.10867%205.57913C3.2664%205.34826%203.42413%205.11739%203.58186%204.88652C3.66073%204.57869%203.73959%204.27087%203.73959%203.96304H11.2318C11.705%203.96304%2012.0993%203.80913%2012.4147%203.57826C12.6513%203.27043%2012.8091%202.88565%2012.8091%202.34696V0.5H11.7838V2.27C11.7838%202.65478%2011.5472%202.88565%2011.1529%202.88565H3.73959V2.50087C3.73959%202.11609%203.66073%201.88522%203.58186%201.57739C3.58186%201.34652%203.42413%201.11565%203.2664%200.961739C3.10867%200.807826%202.95094%200.730869%202.79321%200.653913C2.55662%200.576956%202.32002%200.5%202.16229%200.5C1.84683%200.5%201.61024%200.576956%201.37364%200.653913C1.21591%200.807826%200.979316%200.884782%200.900451%201.11565C0.742721%201.26956%200.584991%201.42348%200.584991%201.65435C0.506126%201.88522%200.427261%202.11609%200.427261%202.34696C0.427261%202.57782%200.427261%202.80869%200.506126%203.03956C0.584991%203.27043%200.663856%203.42435%200.742721%203.57826C0.900451%203.65521%201.05818%203.80913%201.29478%203.88608C1.53137%203.96304%201.76797%203.96304%202.16229%203.96304H2.79321C2.79321%204.11695%202.71435%204.27087%202.71435%204.42478C2.63548%204.57869%202.47775%204.7326%202.39889%204.88652C2.32002%204.96347%202.16229%205.04043%201.9257%205.11739C1.76797%205.19434%201.53137%205.2713%201.29478%205.2713H0.269531V6.34869H1.29478C1.6891%206.27173%202.00456%206.19478%202.32002%206.11782ZM2.16229%202.88565C1.84683%202.88565%201.6891%202.88565%201.53137%202.73174C1.45251%202.65478%201.37364%202.50087%201.37364%202.27C1.37364%202.03913%201.45251%201.80826%201.53137%201.7313C1.6891%201.65435%201.84683%201.57739%202.08343%201.57739C2.32002%201.57739%202.47775%201.65435%202.63548%201.80826C2.79321%201.96217%202.79321%202.19304%202.79321%202.50087V2.96261H2.16229V2.88565Z%22%20fill%3D%22%23000%22/%3E%3Cpath%20d%3D%22M10.4422%200.5H7.44531V1.42348H10.4422V0.5Z%22%20fill%3D%22%23000%22/%3E%3Cpath%20d%3D%22M12.7298%208.50383C12.6509%208.27296%2012.5721%208.11905%2012.4143%207.96514C12.2566%207.81122%2012.0989%207.65731%2011.8623%207.58035C11.7046%207.5034%2011.468%207.42644%2011.2314%207.42644C10.9948%207.42644%2010.7582%207.5034%2010.5216%207.58035C10.285%207.65731%2010.1273%207.81122%209.96953%207.96514C9.8118%208.11905%209.73293%208.27296%209.65407%208.50383C9.5752%208.7347%209.5752%208.96557%209.5752%209.19644V9.42731C9.5752%209.65818%209.49634%209.73513%209.41747%209.88905C9.25974%209.966%209.10201%2010.043%208.86542%2010.043H8.54996C8.39223%2010.043%208.2345%209.966%208.15563%209.88905C8.07677%209.73513%207.9979%209.58122%207.9979%209.42731V5.7334H6.97266V9.58122C6.97266%209.88905%206.97266%2010.1199%207.05152%2010.2738C7.13039%2010.4277%207.20925%2010.5817%207.36698%2010.7356C7.52471%2010.8125%207.60358%2010.9664%207.84017%2010.9664C7.9979%2011.0434%208.15563%2011.0434%208.39223%2011.0434H8.94428C9.10201%2011.0434%209.33861%2010.9664%209.49634%2010.8895C9.65407%2010.8125%209.89066%2010.6586%209.96953%2010.4277C10.1273%2010.6586%2010.285%2010.8125%2010.5216%2010.8895C10.7582%2010.9664%2010.9948%2011.0434%2011.3102%2011.0434C11.7834%2011.0434%2012.2566%2010.8895%2012.4932%2010.5817C12.8087%2010.2738%2012.9664%209.81209%2012.9664%209.2734C12.8875%208.96557%2012.8087%208.7347%2012.7298%208.50383ZM11.2314%209.966C10.9948%209.966%2010.837%209.88905%2010.7582%209.81209C10.5216%209.65818%2010.5216%209.50427%2010.5216%209.2734C10.5216%209.04253%2010.6004%208.88861%2010.6793%208.7347C10.7582%208.58079%2010.9948%208.50383%2011.2314%208.50383C11.468%208.50383%2011.7046%208.58079%2011.7834%208.7347C11.8623%208.88861%2011.9412%209.04253%2011.9412%209.2734C11.8623%209.73513%2011.6257%209.966%2011.2314%209.966Z%22%20fill%3D%22%23000%22/%3E%3Cpath%20d%3D%22M4.92256%208.50364C4.92256%208.73451%204.92256%208.88842%204.8437%209.11929C4.76484%209.2732%204.68597%209.42712%204.60711%209.58103C4.44938%209.73494%204.29165%209.8119%204.13392%209.88886C3.97619%209.96581%203.73959%2010.0428%203.42413%2010.0428H2.71435C2.47775%2010.0428%202.24116%2010.0428%202.00456%209.96581C1.84683%209.8119%201.6891%209.73494%201.61024%209.58103C1.53137%209.42712%201.37364%209.2732%201.37364%209.11929C1.29478%208.96538%201.29478%208.73451%201.29478%208.50364V7.65712H0.269531V8.5806C0.269531%209.35016%200.506126%209.96581%200.900451%2010.4276C1.29478%2010.8893%201.84683%2011.1202%202.63548%2011.1202H3.42413C3.81846%2011.1202%204.13392%2011.0432%204.44938%2010.8893C4.76484%2010.7354%205.00143%2010.5815%205.23803%2010.3506C5.47462%2010.1197%205.63235%209.8119%205.71122%209.50407C5.79008%209.19625%205.86894%208.88842%205.86894%208.50364V5.73321L4.8437%205.65625L4.92256%208.50364Z%22%20fill%3D%22%23000%22/%3E%3Cpath%20d%3D%22M3.73962%207.42578H2.55664V8.50317H3.73962V7.42578Z%22%20fill%3D%22%23000%22/%3E%3C/svg%3E\")";

		return '.wfcp-price-inline{display:inline-flex;align-items:baseline;gap:.25em;unicode-bidi:isolate;}'
			. '.wfcp-price-inline .wfcp-price-amount{unicode-bidi:isolate;}'
			. '.wfcp-toman-glyph{position:relative;display:inline-block;width:0.9em;height:0.9em;min-width:12px;min-height:12px;text-indent:9999px;overflow:hidden;vertical-align:-0.12em;flex-shrink:0;'
			. 'background-color:currentColor;background-image:none!important;'
			. '-webkit-mask-image:' . $irt_mask . ';-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;-webkit-mask-size:contain;'
			. 'mask-image:' . $irt_mask . ';mask-repeat:no-repeat;mask-position:center;mask-size:contain}';
	}

	/**
	 * WooCommerce currency symbol filter: plain text only (never SVG — breaks gateways / update_order_review).
	 *
	 * @param string $symbol   Default symbol.
	 * @param string $currency Currency code.
	 * @return string
	 */
	public static function filter_currency_symbol( $symbol, $currency = '' ) {
		$code = strtoupper( (string) $currency );
		if ( in_array( $code, array( 'IRT', 'TOMAN', 'IRHT' ), true ) ) {
			return 'تومان';
		}
		return $symbol;
	}

	/**
	 * Whether current request should rewrite wc_price HTML to toman glyph (storefront only).
	 *
	 * @return bool
	 */
	public static function should_rewrite_storefront_price_html() {
		if ( is_admin() && ! wp_doing_ajax() ) {
			return false;
		}

		// Emails / REST / cron: keep plain "تومان" text.
		if ( defined( 'DOING_CRON' ) && DOING_CRON ) {
			return false;
		}
		if ( function_exists( 'wp_is_serving_rest_request' ) && wp_is_serving_rest_request() ) {
			return false;
		}
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return false;
		}
		if ( did_action( 'woocommerce_email_header' ) || did_action( 'woocommerce_email_before_order_table' ) ) {
			return false;
		}

		$code = strtoupper( (string) self::get_wc_currency_code() );
		return in_array( $code, array( 'IRT', 'TOMAN', 'IRHT' ), true );
	}

	/**
	 * Rewrite wc_price() HTML to dashboard-style number + toman glyph (storefront).
	 *
	 * @param string $html   Price HTML.
	 * @param float  $price  Raw price.
	 * @param array  $args   wc_price args.
	 * @return string
	 */
	public static function filter_wc_price_html( $html, $price = 0, $args = array() ) {
		if ( ! self::should_rewrite_storefront_price_html() ) {
			return $html;
		}

		if ( false !== strpos( (string) $html, 'wfcp-price-inline' ) || false !== strpos( (string) $html, 'wfcp-toman-glyph' ) ) {
			return $html;
		}

		$amount = '';
		if ( preg_match( '/woocommerce-Price-amount[^>]*>.*?<bdi[^>]*>(.*?)<\\/bdi>/is', (string) $html, $m ) ) {
			$amount = $m[1];
		} elseif ( preg_match( '/woocommerce-Price-amount[^>]*>(.*?)<\\/span>/is', (string) $html, $m ) ) {
			$amount = $m[1];
		} else {
			$amount = (string) $html;
		}

		$amount = wp_strip_all_tags( $amount );
		$amount = html_entity_decode( $amount, ENT_QUOTES, 'UTF-8' );
		$amount = trim( preg_replace( '/\\s*(تومان|toman|irt|ریال)\\s*/iu', '', $amount ) );

		if ( '' === $amount && is_numeric( $price ) ) {
			$amount = number_format( (float) $price, 0, '.', ',' );
		}

		if ( '' === $amount ) {
			return $html;
		}

		$inner = self::wrap_price_with_toman_glyph( $amount );

		// Preserve outer wc price span when present (theme CSS hooks).
		if ( preg_match( '/^(<span[^>]*class="[^"]*woocommerce-Price-amount[^"]*"[^>]*>).*?(<\\/span>)$/is', (string) $html, $wrap ) ) {
			return $wrap[1] . $inner . $wrap[2];
		}

		return '<span class="woocommerce-Price-amount amount">' . $inner . '</span>';
	}

	/**
	 * Format price with currency symbol HTML for display (follows WooCommerce currency).
	 *
	 * @param float $price Price value.
	 * @return string HTML: formatted number + symbol (glyph for Toman when WC currency is IRT/TOMAN).
	 */
	public static function format_price_with_irt_symbol( $price ) {
		$formatted = number_format( (float) $price, 0, '.', ',' );
		$code      = strtoupper( (string) self::get_wc_currency_code() );

		if ( in_array( $code, array( 'IRT', 'TOMAN', 'IRHT' ), true ) ) {
			return self::wrap_price_with_toman_glyph( $formatted );
		}

		if ( function_exists( 'get_woocommerce_currency_symbol' ) ) {
			$symbol = get_woocommerce_currency_symbol( $code );
		} else {
			$symbol = self::get_currency_symbol( $code );
		}

		return $formatted . ' ' . $symbol;
	}

	/**
	 * Round price
	 *
	 * @param float $price Price to round.
	 * @param int   $to    Round to this value.
	 * @return float
	 */
	public static function round_price( $price, $to = 1000 ) {
		$to = floatval( $to );
		if ( $to <= 0 ) {
			return floatval( $price );
		}
		return round( floatval( $price ) / $to ) * $to;
	}

	/**
	 * Check if plugin is enabled
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		$v = self::get_settings( 'general', 'enabled' );
		if ( null === $v ) {
			return true;
		}
		return self::to_bool( $v );
	}

	/**
	 * Get product purchase price
	 *
	 * @param int $product_id Product ID.
	 * @return float|null
	 */
	public static function get_product_purchase_price( $product_id ) {
		$price = get_post_meta( $product_id, '_wfcp_purchase_price', true );
		return $price ? floatval( $price ) : null;
	}

	/**
	 * Check if product price is locked
	 *
	 * @param int $product_id Product ID.
	 * @return bool
	 */
	public static function is_product_price_locked( $product_id ) {
		return (bool) get_post_meta( $product_id, '_wfcp_lock_price', true );
	}

	/**
	 * Get full total price for installment (monthly * months) after all calcs.
	 * Used for cart/checkout line totals.
	 *
	 * @param float $base_price Base purchase price.
	 * @param int   $months     Number of months.
	 * @param int   $product_id Optional.
	 * @return float
	 */
	public static function get_full_installment_total( $base_price, $months, $product_id = null ) {
		$months = max( 1, intval( $months ) );
		$monthly = WFCP_Calculator::calculate_price( $base_price, 'installment', $product_id, array( 'months' => $months ) );
		return floatval( $monthly ) * $months;
	}

	/**
	 * Reschedule or clear the exchange rate auto-update cron.
	 * Safe to call from AJAX (does not fire init hook).
	 */
	public static function reschedule_exchange_cron() {
		$general = self::get_settings( 'general' );
		if ( ! is_array( $general ) ) {
			$general = array();
		}

		if ( ! WFCP_Helper::to_bool( isset( $general['api_enabled'] ) ? $general['api_enabled'] : false )
			|| ! WFCP_Helper::to_bool( isset( $general['auto_update_enabled'] ) ? $general['auto_update_enabled'] : false ) ) {
			wp_clear_scheduled_hook( 'wfcp_auto_update_exchange_rate' );
			return;
		}

		$hour = isset( $general['auto_update_hour'] ) ? intval( $general['auto_update_hour'] ) : 0;
		wp_clear_scheduled_hook( 'wfcp_auto_update_exchange_rate' );

		$current_time = current_time( 'timestamp' );
		$today        = strtotime( date( 'Y-m-d', $current_time ) );
		$scheduled_time = $today + ( $hour * HOUR_IN_SECONDS );
		if ( $scheduled_time <= $current_time ) {
			$scheduled_time += DAY_IN_SECONDS;
		}
		wp_schedule_event( $scheduled_time, 'daily', 'wfcp_auto_update_exchange_rate' );
	}

	/**
	 * Allowed storefront slots for the product pricing box.
	 *
	 * @return array<int,string>
	 */
	public static function allowed_product_box_placements() {
		return array( 'summary', 'before_cart', 'after_cart', 'before_tabs', 'after_tabs', 'none' );
	}

	/**
	 * Selected pricing-box placement (default: before add-to-cart form).
	 *
	 * @return string
	 */
	public static function product_box_placement() {
		$placement = sanitize_key( (string) self::get_settings( 'style', 'placement' ) );
		if ( ! in_array( $placement, self::allowed_product_box_placements(), true ) ) {
			return 'before_cart';
		}
		return $placement;
	}

	/**
	 * Whether a product (simple or variable with priced variations) uses WFCP pricing.
	 *
	 * @param WC_Product|null $product Product object.
	 * @return bool
	 */
	public static function product_has_wfcp_pricing( $product ) {
		if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
			return false;
		}

		if ( $product->is_type( 'variable' ) ) {
			foreach ( $product->get_children() as $child_id ) {
				if ( null !== self::get_product_purchase_price( (int) $child_id ) ) {
					return true;
				}
			}
			return false;
		}

		return null !== self::get_product_purchase_price( $product->get_id() );
	}

	/**
	 * Resolve product ID used for WFCP price calculation (variation when applicable).
	 *
	 * @param int $product_id   Parent or simple product ID.
	 * @param int $variation_id Variation ID when set.
	 * @return int
	 */
	public static function resolve_pricing_product_id( $product_id, $variation_id = 0 ) {
		return $variation_id > 0 ? (int) $variation_id : (int) $product_id;
	}

	/**
	 * Build computed tier prices for a simple product or variation.
	 *
	 * @param int $product_id Product or variation ID.
	 * @return array<string,mixed>|null
	 */
	public static function build_pricing_tiers( $product_id ) {
		$product_id     = (int) $product_id;
		$purchase_price = self::get_product_purchase_price( $product_id );
		if ( null === $purchase_price ) {
			return null;
		}

		$credit_enabled      = self::to_bool( self::get_settings( 'credit', 'enabled' ) );
		$wholesale_enabled   = self::to_bool( self::get_settings( 'wholesale', 'enabled' ) );
		$installment_enabled = self::to_bool( self::get_settings( 'installment', 'enabled' ) );
		$hide_retail         = false;
		$show_wholesale      = $wholesale_enabled && class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::current_sees_wholesale();

		$retail    = WFCP_Calculator::calculate_price( $purchase_price, 'retail', $product_id );
		$credit    = $credit_enabled ? WFCP_Calculator::calculate_price( $purchase_price, 'credit', $product_id ) : 0.0;
		$wholesale = $wholesale_enabled ? WFCP_Calculator::calculate_price( $purchase_price, 'wholesale', $product_id ) : 0.0;

		$installment_plans = array();
		if ( $installment_enabled ) {
			$plans_config = self::get_settings( 'installment', 'plans' );
			if ( is_array( $plans_config ) ) {
				foreach ( $plans_config as $plan ) {
					$months = isset( $plan['months'] ) ? (int) $plan['months'] : 0;
					if ( $months <= 0 ) {
						continue;
					}
					$monthly_price = WFCP_Calculator::calculate_price(
						$purchase_price,
						'installment',
						$product_id,
						array( 'months' => $months )
					);
					$installment_plans[] = array(
						'months'            => $months,
						'monthly_price'     => $monthly_price,
						'monthly_formatted' => self::format_price_with_irt_symbol( $monthly_price ),
						'total_price'       => self::get_full_installment_total( $purchase_price, $months, $product_id ),
					);
				}
			}
		}

		$platforms = array( 'digikala', 'basalam', 'technolife', 'snappshop', 'tapsishop', 'zarehbin', 'emalls', 'snapppay-search', 'torob' );
		$marketplace = array();
		foreach ( $platforms as $slug ) {
			$marketplace[ $slug ] = WFCP_Calculator::calculate_price( $purchase_price, $slug, $product_id );
		}

		return array(
			'retail'              => $retail,
			'retail_formatted'    => self::format_price_with_irt_symbol( $retail ),
			'credit'              => $credit,
			'credit_formatted'    => self::format_price_with_irt_symbol( $credit ),
			'wholesale'           => $wholesale,
			'wholesale_formatted' => self::format_price_with_irt_symbol( $wholesale ),
			'installment_plans'   => $installment_plans,
			'marketplace'         => $marketplace,
			'show_credit'         => $credit_enabled && $credit > 0 && ! $hide_retail,
			'show_wholesale'      => $show_wholesale && $wholesale > 0,
			'show_installment'    => $installment_enabled && ! empty( $installment_plans ) && ! $hide_retail,
		);
	}

	/**
	 * Pricing payload keyed by variation ID for variable products.
	 *
	 * @param WC_Product $product Variable product.
	 * @return array<string,array<string,mixed>>
	 */
	public static function build_variation_pricing_payload( $product ) {
		if ( ! $product || ! is_a( $product, 'WC_Product' ) || ! $product->is_type( 'variable' ) ) {
			return array();
		}

		$payload = array();
		foreach ( $product->get_children() as $variation_id ) {
			$tiers = self::build_pricing_tiers( (int) $variation_id );
			if ( null !== $tiers ) {
				$payload[ (string) (int) $variation_id ] = $tiers;
			}
		}

		return $payload;
	}

	/**
	 * Resolve the product ID used for WFCP price lookup from a cart line.
	 *
	 * @param array $cart_item Cart line item.
	 * @return int
	 */
	public static function resolve_cart_pricing_product_id( $cart_item ) {
		if ( ! empty( $cart_item['variation_id'] ) ) {
			return (int) $cart_item['variation_id'];
		}

		return isset( $cart_item['product_id'] ) ? (int) $cart_item['product_id'] : 0;
	}

	/**
	 * Human-readable label for a purchase type.
	 *
	 * @param string     $purchase_type Purchase type slug.
	 * @param array|null $cart_item Optional cart item for installment months.
	 * @return string
	 */
	public static function get_purchase_type_label( $purchase_type, $cart_item = null ) {
		$credit_texts      = self::get_settings( 'credit', 'texts' );
		$installment_texts = self::get_settings( 'installment', 'texts' );

		$labels = array(
			'cash'        => __( 'نقدی', 'webina-woo-core' ),
			'retail'      => __( 'نقدی', 'webina-woo-core' ),
			'credit'      => ( is_array( $credit_texts ) && ! empty( $credit_texts['title'] ) ) ? $credit_texts['title'] : __( 'اعتباری', 'webina-woo-core' ),
			'installment' => ( is_array( $installment_texts ) && ! empty( $installment_texts['title'] ) ) ? $installment_texts['title'] : __( 'اقساطی', 'webina-woo-core' ),
			'wholesale'   => __( 'عمده', 'webina-woo-core' ),
		);

		$label = isset( $labels[ $purchase_type ] ) ? $labels[ $purchase_type ] : (string) $purchase_type;

		if ( 'installment' === $purchase_type && is_array( $cart_item ) && ! empty( $cart_item['wfcp_installment_months'] ) ) {
			$label .= ' (' . sprintf( __( '%d ماهه', 'webina-woo-core' ), (int) $cart_item['wfcp_installment_months'] ) . ')';
		}

		return (string) $label;
	}

	/**
	 * Sync WooCommerce regular/active price from purchase price when not locked.
	 *
	 * @param int   $product_id Product ID.
	 * @param float $purchase_price Purchase price.
	 * @return void
	 */
	public static function sync_retail_price_from_purchase( $product_id, $purchase_price ) {
		if ( self::is_product_price_locked( $product_id ) || ! class_exists( 'WFCP_Calculator', false ) ) {
			return;
		}

		$retail = WFCP_Calculator::calculate_price( (float) $purchase_price, 'retail', $product_id );
		if ( function_exists( 'wc_get_product' ) ) {
			$product = wc_get_product( $product_id );
			if ( $product ) {
				$product->update_meta_data( '_wfcp_purchase_price', (float) $purchase_price );
				$product->set_regular_price( (string) $retail );
				$product->set_price( (string) $retail );
				$product->save();
				return;
			}
		}

		update_post_meta( $product_id, '_regular_price', $retail );
		update_post_meta( $product_id, '_price', $retail );
	}

	/**
	 * PDP installment layout: classic (default) or timeline.
	 *
	 * @return string
	 */
	public static function installment_pdp_theme() {
		$theme = sanitize_key( (string) self::get_settings( 'installment', 'pdp_theme' ) );
		return 'timeline' === $theme ? 'timeline' : 'classic';
	}

	/**
	 * Hide gateway titles on PDP badges (name on hover).
	 *
	 * @return bool
	 */
	public static function installment_gateway_logos_only() {
		$raw = self::get_settings( 'installment', 'gateway_logos_only' );
		if ( null === $raw ) {
			return true;
		}
		return self::to_bool( $raw );
	}

	/**
	 * Due-date labels for an installment plan (today + N-1 months).
	 *
	 * @param int $months Plan length.
	 * @return array<int,string>
	 */
	public static function installment_due_labels( $months ) {
		$months = max( 1, (int) $months );
		$labels = array();
		$tz     = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );
		$now    = new DateTime( 'now', $tz );
		for ( $i = 0; $i < $months; $i++ ) {
			if ( 0 === $i ) {
				$labels[] = __( 'امروز', 'webina-woo-core' );
				continue;
			}
			$dt = clone $now;
			$dt->modify( '+' . $i . ' months' );
			if ( class_exists( 'Webino_Dashboard_Locale', false ) ) {
				$labels[] = Webino_Dashboard_Locale::format_jalali_day_month(
					(int) $dt->format( 'Y' ),
					(int) $dt->format( 'n' ),
					(int) $dt->format( 'j' )
				);
			} else {
				$labels[] = $dt->format( 'j M' );
			}
		}
		return $labels;
	}

}

