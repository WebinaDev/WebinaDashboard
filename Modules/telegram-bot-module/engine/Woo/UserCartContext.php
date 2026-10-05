<?php

namespace Webino_Dashboard_Bots_Telegram\Woo;

use Webino_Dashboard_Bots_Telegram\Util\CouponErrorMessage;

/**
 * Run WooCommerce cart operations in context of a specific customer user.
 */
class UserCartContext {
	private static function normalize_country_code( string $country ): string {
		$value = trim( (string) $country );
		if ( $value === '' ) {
			$base = function_exists( 'WC' ) && \WC()->countries ? (string) \WC()->countries->get_base_country() : '';
			$value = $base !== '' ? $base : 'IR';
		}
		$upper = strtoupper( $value );
		if ( preg_match( '/^[A-Z]{2}$/', $upper ) ) {
			return $upper;
		}
		if ( function_exists( 'WC' ) && \WC()->countries && is_array( \WC()->countries->countries ) ) {
			foreach ( \WC()->countries->countries as $code => $label ) {
				if ( strcasecmp( (string) $label, $value ) === 0 ) {
					return (string) $code;
				}
			}
		}
		if ( mb_strpos( $value, 'ایران' ) !== false || mb_stripos( $value, 'iran' ) !== false ) {
			return 'IR';
		}
		return 'IR';
	}

	/**
	 * Match Persian WooCommerce Shipping `state_city` province term when only a WC state code is known.
	 */
	private static function resolve_state_term_id_from_wc_state_code( string $state_code ): int {
		$state_code = trim( $state_code );
		if ( $state_code === '' || ! taxonomy_exists( 'state_city' ) ) {
			return 0;
		}
		$country = function_exists( 'wc_get_base_location' ) ? (string) wc_get_base_location()['country'] : 'IR';
		$states  = function_exists( 'WC' ) && \WC()->countries ? \WC()->countries->get_states( $country ) : array();
		$label   = is_array( $states ) && isset( $states[ $state_code ] ) ? (string) $states[ $state_code ] : '';
		$terms   = get_terms(
			array(
				'taxonomy'   => 'state_city',
				'hide_empty' => false,
				'parent'     => 0,
			)
		);
		if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
			return 0;
		}
		foreach ( $terms as $term ) {
			if ( ! $term instanceof \WP_Term ) {
				continue;
			}
			$meta_code = (string) get_term_meta( $term->term_id, 'state_code', true );
			if ( $meta_code !== '' && strcasecmp( $meta_code, $state_code ) === 0 ) {
				return (int) $term->term_id;
			}
			$meta_name = (string) get_term_meta( $term->term_id, 'state_name', true );
			if ( $label !== '' && $meta_name !== '' && strcasecmp( $meta_name, $label ) === 0 ) {
				return (int) $term->term_id;
			}
			if ( $label !== '' && strcasecmp( (string) $term->name, $label ) === 0 ) {
				return (int) $term->term_id;
			}
			if ( strcasecmp( (string) $term->name, $state_code ) === 0 ) {
				return (int) $term->term_id;
			}
		}
		return 0;
	}

	/**
	 * Find a `state_city` city term under a province parent when only the city label is known.
	 * Matches full term name or the part after " - " (e.g. "خوزستان - دزفول" vs "دزفول").
	 */
	private static function resolve_city_term_id_from_state_parent( int $state_term_id, string $city_label ): int {
		$city_label = trim( $city_label );
		if ( $state_term_id < 1 || $city_label === '' || ! taxonomy_exists( 'state_city' ) ) {
			return 0;
		}
		$terms = get_terms(
			array(
				'taxonomy'   => 'state_city',
				'hide_empty' => false,
				'parent'     => $state_term_id,
			)
		);
		if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
			return 0;
		}
		foreach ( $terms as $term ) {
			if ( ! $term instanceof \WP_Term ) {
				continue;
			}
			$name = (string) $term->name;
			if ( strcasecmp( $name, $city_label ) === 0 ) {
				return (int) $term->term_id;
			}
			$dash = mb_strpos( $name, ' - ' );
			if ( $dash !== false ) {
				$suffix = trim( mb_substr( $name, $dash + 3 ) );
				if ( $suffix !== '' && strcasecmp( $suffix, $city_label ) === 0 ) {
					return (int) $term->term_id;
				}
			}
		}
		return 0;
	}

	/**
	 * Mirror customer location and address lines into WC session payload for shipping plugins
	 * that read directly from WC()->session->get('customer').
	 */
	private static function sync_customer_payload_to_session( \WC_Customer $customer, string $country ): void {
		if ( ! function_exists( 'WC' ) || ! \WC()->session ) {
			return;
		}
		$customer_data = \WC()->session->get( 'customer', array() );
		if ( ! is_array( $customer_data ) ) {
			$customer_data = array();
		}
		$country                            = self::normalize_country_code( $country );
		$customer_data['billing_country']   = $country;
		$customer_data['shipping_country']  = $country;
		$customer_data['billing_state']     = (string) $customer->get_billing_state();
		$customer_data['shipping_state']    = (string) $customer->get_shipping_state();
		$customer_data['billing_city']      = (string) $customer->get_billing_city();
		$customer_data['shipping_city']     = (string) $customer->get_shipping_city();
		$customer_data['billing_postcode']  = (string) $customer->get_billing_postcode();
		$customer_data['shipping_postcode'] = (string) $customer->get_shipping_postcode();
		$customer_data['billing_address_1']  = (string) $customer->get_billing_address_1();
		$customer_data['billing_address_2']  = (string) $customer->get_billing_address_2();
		$customer_data['shipping_address_1'] = (string) $customer->get_shipping_address_1();
		$customer_data['shipping_address_2'] = (string) $customer->get_shipping_address_2();
		$customer_data['billing_first_name']  = (string) $customer->get_billing_first_name();
		$customer_data['billing_last_name']   = (string) $customer->get_billing_last_name();
		$customer_data['shipping_first_name'] = (string) $customer->get_shipping_first_name();
		$customer_data['shipping_last_name']  = (string) $customer->get_shipping_last_name();
		$customer_data['billing_phone']       = (string) $customer->get_billing_phone();
		$customer_data['calculated_shipping'] = false;
		\WC()->session->set( 'customer', $customer_data );
	}

	/**
	 * @param array<int, mixed> $packages
	 * @return list<array{id:string,label:string,cost:float,cost_html:string,package:int}>
	 */
	private static function flatten_shipping_rates_from_packages( array $packages ): array {
		$out = array();
		foreach ( $packages as $i => $package ) {
			if ( empty( $package['rates'] ) || ! is_array( $package['rates'] ) ) {
				continue;
			}
			foreach ( $package['rates'] as $rate ) {
				if ( ! $rate instanceof \WC_Shipping_Rate ) {
					continue;
				}
				$cost = (float) $rate->get_cost();
				$out[] = array(
					'id'        => $rate->get_id(),
					'label'     => $rate->get_label(),
					'cost'      => $cost,
					'cost_html' => wc_price( $cost ),
					'package'   => (int) $i,
				);
			}
		}
		return $out;
	}

	/**
	 * Persian shipping plugins often read $_POST during AJAX checkout update; bots have none.
	 *
	 * @return array{post: array<string, mixed|null>, request: array<string, mixed|null>}
	 */
	private static function backup_checkout_superglobals( array $keys ): array {
		$out = array( 'post' => array(), 'request' => array() );
		foreach ( $keys as $k ) {
			$out['post'][ $k ]    = isset( $_POST[ $k ] ) ? $_POST[ $k ] : null;
			$out['request'][ $k ] = isset( $_REQUEST[ $k ] ) ? $_REQUEST[ $k ] : null;
		}
		return $out;
	}

	/**
	 * @param array{post: array<string, mixed|null>, request: array<string, mixed|null>} $backup
	 */
	private static function restore_checkout_superglobals( array $backup ): void {
		foreach ( $backup['post'] as $k => $v ) {
			if ( $v === null ) {
				unset( $_POST[ $k ] );
			} else {
				$_POST[ $k ] = $v;
			}
		}
		foreach ( $backup['request'] as $k => $v ) {
			if ( $v === null ) {
				unset( $_REQUEST[ $k ] );
			} else {
				$_REQUEST[ $k ] = $v;
			}
		}
	}

	/**
	 * Mimic checkout AJAX `update_order_review` post_data for extensions that parse it.
	 */
	private static function build_checkout_post_data_query( \WC_Customer $customer, string $country ): string {
		$data = array(
			'billing_country'    => $country,
			'billing_state'      => (string) $customer->get_billing_state(),
			'billing_city'       => (string) $customer->get_billing_city(),
			'billing_postcode'   => (string) $customer->get_billing_postcode(),
			'billing_address_1'  => (string) $customer->get_billing_address_1(),
			'billing_address_2'  => (string) $customer->get_billing_address_2(),
			'shipping_country'   => $country,
			'shipping_state'     => (string) $customer->get_shipping_state(),
			'shipping_city'      => (string) $customer->get_shipping_city(),
			'shipping_postcode'  => (string) $customer->get_shipping_postcode(),
			'shipping_address_1' => (string) $customer->get_shipping_address_1(),
			'shipping_address_2' => (string) $customer->get_shipping_address_2(),
		);
		if ( \WC()->session ) {
			$data['pws_state'] = (string) \WC()->session->get( 'pws_state', '' );
			$data['pws_city']  = (string) \WC()->session->get( 'pws_city', '' );
		}
		return http_build_query( $data );
	}

	private static function money_text( float $amount ): string {
		return number_format( (float) $amount, 0, '.', ',' ) . ' ' . __( 'تومان', 'webino-dashboard' );
	}
	/**
	 * Ensure WC session/customer/cart are initialized in non-frontend contexts (webhook/admin).
	 */
	private function ensure_cart_runtime(): bool {
		if ( ! function_exists( 'WC' ) ) {
			return false;
		}
		$wc = \WC();
		if ( ! $wc ) {
			return false;
		}

		// In webhook requests, WooCommerce may not bootstrap cart/session automatically.
		if ( method_exists( $wc, 'initialize_session' ) && ( ! isset( $wc->session ) || ! $wc->session ) ) {
			$wc->initialize_session();
		}
		if ( method_exists( $wc, 'initialize_cart' ) && ( ! isset( $wc->cart ) || ! $wc->cart ) ) {
			$wc->initialize_cart();
		}
		if ( function_exists( 'wc_load_cart' ) ) {
			wc_load_cart();
		}
		if ( isset( $wc->cart ) && $wc->cart ) {
			$wc->cart->get_cart();
			return true;
		}
		return false;
	}

	/**
	 * @template T
	 * @param callable(): T $callback
	 * @return T
	 */
	public function run_as_user( int $user_id, callable $callback ) {
		if ( ! defined( 'WEBINO_BOT_CHANNEL' ) ) {
			define( 'WEBINO_BOT_CHANNEL', 'telegram' );
		}
		$previous = get_current_user_id();
		wp_set_current_user( $user_id );

		$has_cart = $this->ensure_cart_runtime();
		if ( ! $has_cart ) {
			wp_set_current_user( $previous );
			if ( function_exists( 'wc_get_logger' ) ) {
				wc_get_logger()->error( '[cart_runtime_unavailable] unable to initialize WC cart runtime', array( 'source' => 'webino_dashboard_telegram' ) );
			}
			return null;
		}

		try {
			return $callback();
		} finally {
			// Do not call ensure_cart_runtime() here: re-loading WC for the previous user in the same
			// request replaces WC()->session and drops keys (e.g. pws_city) set while impersonating.
			wp_set_current_user( $previous );
		}
	}

	/**
	 * Single purchase-type cart rule for bot shop.
	 *
	 * @return string Empty if ok, otherwise human message.
	 */
	public function get_purchase_type_conflict( int $user_id, string $new_type ): string {
		$new_type = class_exists( 'Webino_Dashboard_Bots_WFCP', false )
			? Webino_Dashboard_Bots_WFCP::cart_type( $new_type )
			: sanitize_key( $new_type );
		$existing = $this->run_as_user(
			$user_id,
			static function () {
				$cart = \WC()->cart;
				if ( ! $cart || $cart->is_empty() ) {
					return '';
				}
				foreach ( $cart->get_cart() as $item ) {
					if ( ! empty( $item['wfcp_purchase_type'] ) ) {
						return (string) $item['wfcp_purchase_type'];
					}
				}
				return 'cash';
			}
		);
		if ( ! is_string( $existing ) || $existing === '' ) {
			return '';
		}
		$existing = class_exists( 'Webino_Dashboard_Bots_WFCP', false )
			? Webino_Dashboard_Bots_WFCP::cart_type( $existing )
			: sanitize_key( $existing );
		if ( $existing === $new_type ) {
			return '';
		}
		return __( 'سبد خرید فقط یک نوع خرید می‌پذیرد. ابتدا سبد را خالی کنید یا همان نوع خرید قبلی را انتخاب کنید.', 'webino-dashboard' );
	}

	public function add_to_cart( int $user_id, int $product_id, int $quantity = 1, array $cart_item_data = array() ): bool {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return false;
		}
		$product = wc_get_product( $product_id );
		if ( ! $product || ! $product->is_purchasable() ) {
			return false;
		}
		if ( $product->is_type( 'variable' ) ) {
			return false;
		}

		$ok = (bool) $this->run_as_user(
			$user_id,
			function () use ( $product_id, $quantity, $cart_item_data ) {
				$key = \WC()->cart->add_to_cart( $product_id, $quantity, 0, array(), $cart_item_data );
				if ( false !== $key && is_callable( array( \WC()->cart, 'calculate_totals' ) ) ) {
					\WC()->cart->calculate_totals();
				}
				return false !== $key;
			}
		);
		if ( $ok ) {
			$this->bump_abandon_cart_meta( $user_id );
		}
		return $ok;
	}

	public function has_product_in_cart( int $user_id, int $product_id ): bool {
		return (bool) $this->run_as_user(
			$user_id,
			static function () use ( $product_id ) {
				foreach ( \WC()->cart->get_cart() as $item ) {
					$pid = isset( $item['product_id'] ) ? (int) $item['product_id'] : 0;
					$vid = isset( $item['variation_id'] ) ? (int) $item['variation_id'] : 0;
					if ( $pid === $product_id && $vid < 1 ) {
						return true;
					}
				}
				return false;
			}
		);
	}

	/**
	 * @return true|\WP_Error
	 */
	public function apply_coupon( int $user_id, string $code ) {
		if ( ! defined( 'WEBINO_BOT_CHANNEL' ) ) {
			define( 'WEBINO_BOT_CHANNEL', 'telegram' );
		}
		$result = $this->run_as_user(
			$user_id,
			function () use ( $code ) {
				wc_clear_notices();
				$c = wc_format_coupon_code( $code );
				if ( $c === '' ) {
					return new \WP_Error( 'coupon', __( 'کد تخفیف را وارد کنید.', 'webino-dashboard' ) );
				}
				if ( ! \WC()->cart->apply_coupon( $c ) ) {
					$notices  = wc_get_notices( 'error' );
					$messages = array();
					foreach ( $notices as $n ) {
						$raw = isset( $n['notice'] ) ? (string) $n['notice'] : '';
						if ( $raw === '' ) {
							continue;
						}
						$messages[] = CouponErrorMessage::localize( $raw );
					}
					wc_clear_notices();
					$messages = array_values( array_unique( $messages ) );
					$msg      = ! empty( $messages )
						? implode( "\n", $messages )
						: __( 'این کد تخفیف قابل اعمال نیست.', 'webino-dashboard' );
					return new \WP_Error( 'coupon', $msg );
				}
				wc_clear_notices();
				\WC()->cart->calculate_totals();
				return true;
			}
		);
		if ( $result === true ) {
			$this->bump_abandon_cart_meta( $user_id );
		}
		return $result;
	}

	/**
	 * @return array<string, array<string, mixed>>
	 */
	public function get_cart_contents( int $user_id ): array {
		return $this->run_as_user(
			$user_id,
			static function () {
				return \WC()->cart->get_cart();
			}
		);
	}

	public function set_quantity( int $user_id, string $cart_item_key, int $qty ): bool {
		$ok = $this->run_as_user(
			$user_id,
			function () use ( $cart_item_key, $qty ) {
				if ( $qty < 1 ) {
					return \WC()->cart->remove_cart_item( $cart_item_key );
				}
				return \WC()->cart->set_quantity( $cart_item_key, $qty, true );
			}
		);
		if ( $ok ) {
			$this->bump_abandon_cart_meta( $user_id );
		}
		return $ok;
	}

	public function remove_line( int $user_id, string $cart_item_key ): bool {
		$ok = $this->run_as_user(
			$user_id,
			function () use ( $cart_item_key ) {
				$result = \WC()->cart->remove_cart_item( $cart_item_key );
				\WC()->cart->calculate_totals();
				return $result;
			}
		);
		if ( $ok ) {
			$this->bump_abandon_cart_meta( $user_id );
		}
		return $ok;
	}

	public function get_totals_formatted( int $user_id ): string {
		return $this->run_as_user(
			$user_id,
			static function () {
				\WC()->cart->calculate_totals();
				$parts = array();
				foreach ( \WC()->cart->get_applied_coupons() as $code ) {
					$parts[] = sprintf(
						/* translators: %s: coupon code */
						__( 'کد تخفیف: %s', 'webino-dashboard' ),
						$code
					);
				}
				$items_total = 0.0;
				foreach ( \WC()->cart->get_cart() as $item ) {
					$items_total += isset( $item['line_total'] ) ? (float) $item['line_total'] : 0.0;
				}
				$parts[] = __( 'جمع:', 'webino-dashboard' ) . ' ' . self::money_text( $items_total );
				return implode( "\n", $parts );
			}
		);
	}

	/**
	 * Cart + totals after calculate_totals() for bot message formatting (single WC context).
	 * `total_excluding_shipping` is what the customer pays for goods/coupons before choosing delivery.
	 *
	 * `subtotal` = sum of line subtotals before coupon discount (matches WC «جمع قبل از تخفیف»).
	 * `items_total` = `get_cart_contents_total()` = sum of line totals after discount (کالا پس از تخفیف).
	 *
	 * @return array{cart: array<string, mixed>, coupons: list<string>, subtotal: float, items_total: float, discount: float, shipping: float, shipping_tax: float, total: float, total_excluding_shipping: float}|null
	 */
	public function get_cart_snapshot_for_bot( int $user_id ): ?array {
		return $this->run_as_user(
			$user_id,
			static function () {
				$cart = \WC()->cart;
				$cart->calculate_totals();
				$ship    = (float) $cart->get_shipping_total();
				$ship_tx = (float) $cart->get_shipping_tax();
				$grand   = (float) $cart->get_total( 'edit' );
				return array(
					'cart'                     => $cart->get_cart(),
					'coupons'                  => array_values( $cart->get_applied_coupons() ),
					'subtotal'                 => (float) $cart->get_subtotal(),
					'items_total'              => (float) $cart->get_cart_contents_total(),
					'discount'                 => (float) $cart->get_discount_total(),
					'shipping'                 => $ship,
					'shipping_tax'             => $ship_tx,
					'total'                    => $grand,
					'total_excluding_shipping' => max( 0.0, $grand - $ship - $ship_tx ),
				);
			}
		);
	}

	/** Used with add_filter while calculating shipping in bot (non-storefront) requests. */
	public static function filter_shipping_context_true(): bool {
		return true;
	}

	public function empty_cart( int $user_id ): void {
		$this->run_as_user(
			$user_id,
			static function () {
				\WC()->cart->empty_cart();
			}
		);
	}

	/**
	 * Resolved billing/shipping fields from bot checkout draft (co_* keys).
	 *
	 * @param array<string, mixed> $data
	 * @return array{
	 *   country: string,
	 *   fn: string,
	 *   ln: string,
	 *   billing_state: string,
	 *   billing_city: string,
	 *   billing_address_1: string,
	 *   billing_address_2: string,
	 *   postcode: string,
	 *   phone: string,
	 *   state_term_id: int,
	 *   city_term_id: int
	 * }
	 */
	private static function build_resolved_checkout_address( int $user_id, array $data ): array {
		$co_country = isset( $data['co_country'] ) ? trim( (string) $data['co_country'] ) : '';
		$base_country = '';
		if ( function_exists( 'WC' ) && \WC()->countries ) {
			$base_country = (string) \WC()->countries->get_base_country();
		}
		if ( $base_country === '' && function_exists( 'wc_get_base_location' ) ) {
			$base_country = (string) wc_get_base_location()['country'];
		}
		if ( $base_country === '' ) {
			$base_country = 'IR';
		}
		$country = self::normalize_country_code( $co_country !== '' ? $co_country : $base_country );
		$fn      = isset( $data['co_first'] ) ? trim( (string) $data['co_first'] ) : '';
		$ln      = isset( $data['co_last'] ) ? trim( (string) $data['co_last'] ) : '';
		if ( $fn === '' && $ln === '' ) {
			$name  = isset( $data['co_name'] ) ? trim( (string) $data['co_name'] ) : '';
			$parts = preg_split( '/\s+/u', $name, 2, PREG_SPLIT_NO_EMPTY );
			$fn    = $parts[0] ?? '';
			$ln    = $parts[1] ?? '';
		}

		// Persian WooCommerce Shipping reads package destination state/city as state_city *term IDs*
		// (see PWS_Shipping_Method::is_available + PWS::get_state / get_city). WC defaults use state
		// *codes* and city *names*, which makes PWS methods unavailable — only core flat_rate remains.
		$state_term_id = isset( $data['co_state_term'] ) ? (int) $data['co_state_term'] : 0;
		$city_term_id  = isset( $data['co_city_term'] ) ? (int) $data['co_city_term'] : 0;
		$state_code    = isset( $data['co_state'] ) ? trim( (string) $data['co_state'] ) : '';
		$city_label    = isset( $data['co_city'] ) ? trim( (string) $data['co_city'] ) : '';
		if ( $state_term_id < 1 && $state_code !== '' ) {
			$resolved_term = self::resolve_state_term_id_from_wc_state_code( $state_code );
			if ( $resolved_term > 0 ) {
				$state_term_id = $resolved_term;
			}
		}
		if ( $city_term_id < 1 && $state_term_id > 0 && $city_label !== '' ) {
			$resolved_city = self::resolve_city_term_id_from_state_parent( $state_term_id, $city_label );
			if ( $resolved_city > 0 ) {
				$city_term_id = $resolved_city;
			}
		}
		$billing_state = $state_term_id > 0 ? (string) $state_term_id : ( $state_code !== '' ? sanitize_text_field( $state_code ) : '' );
		$billing_city  = $city_term_id > 0 ? (string) $city_term_id : ( $city_label !== '' ? sanitize_text_field( $city_label ) : '' );

		$addr1 = isset( $data['co_addr'] ) ? sanitize_textarea_field( (string) $data['co_addr'] ) : '';
		$addr2 = isset( $data['co_addr2'] ) ? sanitize_textarea_field( (string) $data['co_addr2'] ) : '';
		$post  = isset( $data['co_post'] ) ? sanitize_text_field( (string) $data['co_post'] ) : '';
		if ( $post === '0' ) {
			$post = '';
		}
		$phone = isset( $data['co_phone'] ) ? sanitize_text_field( (string) $data['co_phone'] ) : '';
		if ( $phone === '' ) {
			$phone = (string) get_user_meta( $user_id, 'billing_phone', true );
		}

		return array(
			'country'           => $country,
			'fn'                => $fn,
			'ln'                => $ln,
			'billing_state'     => $billing_state,
			'billing_city'      => $billing_city,
			'billing_address_1' => $addr1,
			'billing_address_2' => $addr2,
			'postcode'          => $post,
			'phone'             => $phone,
			'state_term_id'     => $state_term_id,
			'city_term_id'      => $city_term_id,
		);
	}

	/**
	 * Persist address to user meta without requiring WC cart/session (webhook-safe).
	 *
	 * @param array<string, string|int> $r Output of build_resolved_checkout_address()
	 */
	private static function persist_resolved_checkout_address_meta( int $user_id, array $r ): void {
		$country         = (string) $r['country'];
		$fn                = (string) $r['fn'];
		$ln                = (string) $r['ln'];
		$billing_state     = (string) $r['billing_state'];
		$billing_city      = (string) $r['billing_city'];
		$billing_address_1 = (string) $r['billing_address_1'];
		$billing_address_2 = (string) $r['billing_address_2'];
		$post              = (string) $r['postcode'];
		$phone             = (string) $r['phone'];
		$state_term_id     = (int) $r['state_term_id'];
		$city_term_id      = (int) $r['city_term_id'];

		update_user_meta( $user_id, 'billing_first_name', $fn );
		update_user_meta( $user_id, 'billing_last_name', $ln );
		update_user_meta( $user_id, 'billing_state', $billing_state );
		update_user_meta( $user_id, 'billing_city', $billing_city );
		update_user_meta( $user_id, 'billing_address_1', $billing_address_1 );
		update_user_meta( $user_id, 'billing_address_2', $billing_address_2 );
		update_user_meta( $user_id, 'billing_postcode', $post );
		update_user_meta( $user_id, 'billing_country', $country );
		update_user_meta( $user_id, 'shipping_first_name', $fn );
		update_user_meta( $user_id, 'shipping_last_name', $ln );
		update_user_meta( $user_id, 'shipping_state', $billing_state );
		update_user_meta( $user_id, 'shipping_city', $billing_city );
		update_user_meta( $user_id, 'shipping_address_1', $billing_address_1 );
		update_user_meta( $user_id, 'shipping_address_2', $billing_address_2 );
		update_user_meta( $user_id, 'shipping_postcode', $post );
		update_user_meta( $user_id, 'shipping_country', $country );
		update_user_meta( $user_id, 'billing_phone', $phone );
		update_user_meta( $user_id, 'woobale_state_term_id', $state_term_id );
		update_user_meta( $user_id, 'woobale_city_term_id', $city_term_id );
		update_user_meta( $user_id, 'billing_city_id', $city_term_id );
		update_user_meta( $user_id, 'shipping_city_id', $city_term_id );
		update_user_meta( $user_id, 'billing_state_id', $state_term_id );
		update_user_meta( $user_id, 'shipping_state_id', $state_term_id );
	}

	/**
	 * Prefer session customer when it matches this user; otherwise load by user id (works when cart is not bootstrapped).
	 */
	private static function get_customer_for_address_apply( int $user_id ): \WC_Customer {
		if ( function_exists( 'WC' ) && \WC()->customer instanceof \WC_Customer ) {
			$wc_c = \WC()->customer;
			if ( $user_id > 0 && (int) $wc_c->get_id() === $user_id ) {
				return $wc_c;
			}
		}
		return new \WC_Customer( $user_id );
	}

	/**
	 * Push resolved address into WC_Customer + session + cart totals (expects run_as_user when session/cart exist).
	 *
	 * @param array<string, string|int> $r Output of build_resolved_checkout_address()
	 */
	private static function apply_resolved_checkout_to_wc_session_cart( int $user_id, array $r ): void {
		$country           = (string) $r['country'];
		$fn                = (string) $r['fn'];
		$ln                = (string) $r['ln'];
		$billing_state     = (string) $r['billing_state'];
		$billing_city      = (string) $r['billing_city'];
		$billing_address_1 = (string) $r['billing_address_1'];
		$billing_address_2 = (string) $r['billing_address_2'];
		$post              = (string) $r['postcode'];
		$phone             = (string) $r['phone'];
		$state_term_id     = (int) $r['state_term_id'];
		$city_term_id      = (int) $r['city_term_id'];

		$c = self::get_customer_for_address_apply( $user_id );
		$c->set_billing_country( $country );
		$c->set_shipping_country( $country );
		$c->set_billing_first_name( $fn );
		$c->set_billing_last_name( $ln );
		$c->set_billing_state( $billing_state );
		$c->set_billing_city( $billing_city );
		$c->set_billing_address_1( $billing_address_1 );
		$c->set_billing_address_2( $billing_address_2 );
		$c->set_billing_postcode( $post );
		if ( $phone !== '' ) {
			$c->set_billing_phone( $phone );
		}
		$c->set_shipping_first_name( $fn );
		$c->set_shipping_last_name( $ln );
		$c->set_shipping_state( $billing_state );
		$c->set_shipping_city( $billing_city );
		$c->set_shipping_address_1( $billing_address_1 );
		$c->set_shipping_address_2( $billing_address_2 );
		$c->set_shipping_postcode( $post );
		if ( is_callable( array( $c, 'set_shipping_location' ) ) ) {
			$c->set_shipping_location( $country, $billing_state, $post, $billing_city );
		}
		if ( is_callable( array( $c, 'set_billing_location' ) ) ) {
			$c->set_billing_location( $country, $billing_state, $post, $billing_city );
		}
		$c->save();

		if ( \WC()->session ) {
			\WC()->session->set( 'woobale_state_term_id', $state_term_id );
			\WC()->session->set( 'woobale_city_term_id', $city_term_id );
			\WC()->session->set( 'billing_state', $c->get_billing_state() );
			\WC()->session->set( 'billing_city', $c->get_billing_city() );
			\WC()->session->set( 'shipping_state', $c->get_shipping_state() );
			\WC()->session->set( 'shipping_city', $c->get_shipping_city() );
			\WC()->session->set( 'calc_shipping_state', $c->get_shipping_state() );
			\WC()->session->set( 'calc_shipping_city', $c->get_shipping_city() );
			\WC()->session->set( 'pws_state', $state_term_id > 0 ? (string) $state_term_id : $c->get_shipping_state() );
			\WC()->session->set( 'pws_city', $city_term_id > 0 ? (string) $city_term_id : $c->get_shipping_city() );
			\WC()->session->set( 'pws_customer_state', $state_term_id > 0 ? (string) $state_term_id : $c->get_shipping_state() );
			\WC()->session->set( 'pws_customer_city', $city_term_id > 0 ? (string) $city_term_id : $c->get_shipping_city() );
			\WC()->session->set( 'billing_state_id', $state_term_id );
			\WC()->session->set( 'shipping_state_id', $state_term_id );
			\WC()->session->set( 'billing_city_id', $city_term_id );
			\WC()->session->set( 'shipping_city_id', $city_term_id );
			\WC()->session->set( 'reload_checkout', true );
		}
		self::sync_customer_payload_to_session( $c, (string) $country );

		if ( \WC()->cart && method_exists( \WC()->cart, 'calculate_totals' ) ) {
			\WC()->cart->calculate_totals();
		}
	}

	/**
	 * Apply billing/shipping from bot checkout draft (must run inside run_as_user / cart context).
	 *
	 * @param array<string, mixed> $data
	 */
	private static function apply_checkout_address_in_cart_context( int $user_id, array $data ): void {
		$r = self::build_resolved_checkout_address( $user_id, $data );
		self::persist_resolved_checkout_address_meta( $user_id, $r );
		self::apply_resolved_checkout_to_wc_session_cart( $user_id, $r );
	}

	/**
	 * @return list<array{id:string,label:string,cost:float,cost_html:string,package:int}>
	 */
	private static function compute_flat_shipping_rates_in_cart_context( int $user_id ): array {
		if ( ! \WC()->customer ) {
			return array();
		}

		$customer = \WC()->customer;
		$country  = self::normalize_country_code( (string) $customer->get_shipping_country() );
		$customer->set_shipping_country( $country );
		$customer->set_billing_country( self::normalize_country_code( (string) $customer->get_billing_country() ) );

		$state_term_id = (int) get_user_meta( $user_id, 'woobale_state_term_id', true );
		$city_term_id  = (int) get_user_meta( $user_id, 'woobale_city_term_id', true );
		if ( $state_term_id < 1 ) {
			$ship_state = (string) $customer->get_shipping_state();
			if ( $ship_state !== '' ) {
				$resolved_st = self::resolve_state_term_id_from_wc_state_code( $ship_state );
				if ( $resolved_st > 0 ) {
					$state_term_id = $resolved_st;
					update_user_meta( $user_id, 'woobale_state_term_id', $state_term_id );
				}
			}
		}
		if ( $city_term_id < 1 && $state_term_id > 0 ) {
			$resolved_city = self::resolve_city_term_id_from_state_parent( $state_term_id, (string) $customer->get_shipping_city() );
			if ( $resolved_city > 0 ) {
				$city_term_id = $resolved_city;
				update_user_meta( $user_id, 'woobale_city_term_id', $city_term_id );
			}
		}

		if ( \WC()->session ) {
			$sess = \WC()->session;
			$sess->set( 'shipping_country', $country );
			$sess->set( 'billing_country', $country );
			$sess->set( 'chosen_shipping_methods', array() );

			$sess->set( 'woobale_state_term_id', $state_term_id );
			$sess->set( 'woobale_city_term_id', $city_term_id );
			$sess->set( 'billing_state', (string) $customer->get_billing_state() );
			$sess->set( 'billing_city', (string) $customer->get_billing_city() );
			$sess->set( 'shipping_state', (string) $customer->get_shipping_state() );
			$sess->set( 'shipping_city', (string) $customer->get_shipping_city() );
			$sess->set( 'calc_shipping_state', (string) $customer->get_shipping_state() );
			$sess->set( 'calc_shipping_city', (string) $customer->get_shipping_city() );
			$sess->set( 'pws_state', $state_term_id > 0 ? (string) $state_term_id : (string) $customer->get_shipping_state() );
			$sess->set( 'pws_city', $city_term_id > 0 ? (string) $city_term_id : (string) $customer->get_shipping_city() );
			$sess->set( 'pws_customer_state', $state_term_id > 0 ? (string) $state_term_id : (string) $customer->get_shipping_state() );
			$sess->set( 'pws_customer_city', $city_term_id > 0 ? (string) $city_term_id : (string) $customer->get_shipping_city() );
			$sess->set( 'billing_state_id', $state_term_id );
			$sess->set( 'shipping_state_id', $state_term_id );
			$sess->set( 'billing_city_id', $city_term_id );
			$sess->set( 'shipping_city_id', $city_term_id );

			$session_data = $sess->get_session_data();
			if ( is_array( $session_data ) ) {
				foreach ( array_keys( $session_data ) as $key ) {
					if ( strpos( (string) $key, 'shipping_for_package_' ) === 0 ) {
						$sess->__unset( $key );
					}
				}
			}
		}

		self::sync_customer_payload_to_session( $customer, $country );
		$customer->save();

		$raw_packages = array();
		add_filter( 'woocommerce_is_checkout', array( self::class, 'filter_shipping_context_true' ), 999 );
		add_filter( 'woocommerce_is_cart', array( self::class, 'filter_shipping_context_true' ), 999 );
		add_filter( 'wp_doing_ajax', '__return_true', 999 );

		$sg_keys    = array( 'pws_state', 'pws_city', 'billing_state', 'billing_city', 'shipping_state', 'shipping_city' );
		$sg_backup  = self::backup_checkout_superglobals( $sg_keys );
		if ( \WC()->session ) {
			$_POST['pws_state']     = (string) \WC()->session->get( 'pws_state', '' );
			$_POST['pws_city']      = (string) \WC()->session->get( 'pws_city', '' );
			$_REQUEST['pws_state']  = $_POST['pws_state'];
			$_REQUEST['pws_city']   = $_POST['pws_city'];
		}
		$_POST['billing_state']      = (string) $customer->get_billing_state();
		$_POST['billing_city']       = (string) $customer->get_billing_city();
		$_POST['shipping_state']     = (string) $customer->get_shipping_state();
		$_POST['shipping_city']      = (string) $customer->get_shipping_city();
		$_REQUEST['billing_state']  = $_POST['billing_state'];
		$_REQUEST['billing_city']   = $_POST['billing_city'];
		$_REQUEST['shipping_state'] = $_POST['shipping_state'];
		$_REQUEST['shipping_city']  = $_POST['shipping_city'];

		try {
			if ( \WC()->shipping() ) {
				\WC()->shipping()->reset_shipping();
			}
			do_action( 'woocommerce_checkout_update_order_review', self::build_checkout_post_data_query( $customer, $country ) );
			do_action( 'woobale_before_shipping_calc', $user_id );
			\WC()->cart->calculate_shipping();
			\WC()->cart->calculate_totals();

			$rated_packages = \WC()->shipping() ? \WC()->shipping()->get_packages() : array();
			if ( ! is_array( $rated_packages ) ) {
				$rated_packages = array();
			}
			$out = self::flatten_shipping_rates_from_packages( $rated_packages );
			if ( ! empty( $out ) ) {
				return $out;
			}

			$raw_packages = \WC()->cart->get_shipping_packages();
			if ( ! empty( $raw_packages ) && is_array( $raw_packages ) ) {
				foreach ( $raw_packages as $idx => $pkg ) {
					if ( ! is_array( $pkg ) ) {
						continue;
					}
					if ( ! isset( $pkg['destination'] ) || ! is_array( $pkg['destination'] ) ) {
						$pkg['destination'] = array();
					}
					$pkg['destination']['country']  = $country;
					$pkg['destination']['state']    = (string) $customer->get_shipping_state();
					$pkg['destination']['city']     = (string) $customer->get_shipping_city();
					$pkg['destination']['postcode'] = (string) $customer->get_shipping_postcode();
					$raw_packages[ $idx ] = $pkg;
				}
				if ( \WC()->shipping() ) {
					\WC()->shipping()->reset_shipping();
					\WC()->shipping()->calculate_shipping( $raw_packages );
					$forced_packages = \WC()->shipping()->get_packages();
					if ( ! is_array( $forced_packages ) ) {
						$forced_packages = array();
					}
					$out = self::flatten_shipping_rates_from_packages( $forced_packages );
					if ( ! empty( $out ) ) {
						return $out;
					}
				}
			}
		} finally {
			self::restore_checkout_superglobals( $sg_backup );
			remove_filter( 'wp_doing_ajax', '__return_true', 999 );
			remove_filter( 'woocommerce_is_checkout', array( self::class, 'filter_shipping_context_true' ), 999 );
			remove_filter( 'woocommerce_is_cart', array( self::class, 'filter_shipping_context_true' ), 999 );
		}

		return array();
	}

	/**
	 * Apply billing/shipping from bot checkout draft (keys co_* from session temp_data).
	 *
	 * @param array<string, mixed> $data
	 */
	public function apply_checkout_address_to_customer( int $user_id, array $data ): void {
		$r = self::build_resolved_checkout_address( $user_id, $data );
		self::persist_resolved_checkout_address_meta( $user_id, $r );
		$this->run_as_user(
			$user_id,
			function () use ( $user_id, $r ) {
				self::apply_resolved_checkout_to_wc_session_cart( $user_id, $r );
			}
		);
	}

	/**
	 * One request: apply address, then read shipping rates without leaving cart/session context.
	 * Fixes WC session keys (pws_*) being cleared when run_as_user re-inits for the previous user.
	 *
	 * @param array<string, mixed> $data
	 * @return array{needs_shipping:bool,multi_package?:bool,rates?:list<array{id:string,label:string,cost:float,cost_html:string,package:int}>}|null
	 */
	public function checkout_collect_shipping_rates_after_address( int $user_id, array $data ): ?array {
		$result = $this->run_as_user(
			$user_id,
			function () use ( $user_id, $data ) {
				self::apply_checkout_address_in_cart_context( $user_id, $data );
				if ( ! \WC()->cart || ! \WC()->cart->needs_shipping() ) {
					return array( 'needs_shipping' => false );
				}
				$pkg_count = count( \WC()->cart->get_shipping_packages() );
				if ( $pkg_count > 1 ) {
					return array(
						'needs_shipping' => true,
						'multi_package'  => true,
						'rates'          => array(),
					);
				}
				return array(
					'needs_shipping' => true,
					'multi_package'  => false,
					'rates'          => self::compute_flat_shipping_rates_in_cart_context( $user_id ),
				);
			}
		);
		return is_array( $result ) ? $result : null;
	}

	/**
	 * Flatten WC shipping rates for inline keyboards (callback index = array key).
	 *
	 * @return list<array{id:string,label:string,cost:float,cost_html:string,package:int}>
	 */
	public function get_flat_shipping_rates( int $user_id ): array {
		$rates = $this->run_as_user(
			$user_id,
			function () use ( $user_id ) {
				return self::compute_flat_shipping_rates_in_cart_context( $user_id );
			}
		);
		return is_array( $rates ) ? $rates : array();
	}

	/**
	 * @param string $pick_label Rate label shown in the bot (used if WC cannot match rate id later).
	 * @param float|null $pick_cost Rate cost from the same calculation as the buttons (fallback total).
	 */
	public function set_chosen_shipping( int $user_id, int $package_index, string $rate_id, string $pick_label = '', ?float $pick_cost = null ): void {
		$this->run_as_user(
			$user_id,
			function () use ( $user_id, $package_index, $rate_id, $pick_label, $pick_cost ) {
				$chosen = \WC()->session->get( 'chosen_shipping_methods', array() );
				if ( ! is_array( $chosen ) ) {
					$chosen = array();
				}
				$chosen[ $package_index ] = $rate_id;
				\WC()->session->set( 'chosen_shipping_methods', $chosen );
				update_user_meta( $user_id, '_woobale_chosen_shipping_methods', wp_json_encode( $chosen ) );
				if ( $rate_id !== '' && ( $pick_label !== '' || $pick_cost !== null ) ) {
					update_user_meta(
						$user_id,
						'_woobale_shipping_pick_snapshot',
						wp_json_encode(
							array(
								'package' => $package_index,
								'rate_id' => $rate_id,
								'label'   => $pick_label,
								'cost'    => $pick_cost !== null ? $pick_cost : 0.0,
							)
						)
					);
				}
				if ( \WC()->session && method_exists( \WC()->session, 'save_data' ) ) {
					\WC()->session->save_data();
				}
				\WC()->cart->calculate_totals();
			}
		);
	}

	/**
	 * @return bool
	 */
	public function add_to_cart_variation( int $user_id, int $variation_id, int $quantity = 1, array $cart_item_data = array() ): bool {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return false;
		}
		$variation = wc_get_product( $variation_id );
		if ( ! $variation || ! $variation->is_type( 'variation' ) || ! $variation->is_purchasable() ) {
			return false;
		}
		$parent_id = (int) $variation->get_parent_id();
		$var_attrs = function_exists( 'wc_get_product_variation_attributes' )
			? wc_get_product_variation_attributes( $variation )
			: array();
		if ( ! is_array( $var_attrs ) ) {
			$var_attrs = array();
		}
		if ( empty( $var_attrs ) && is_callable( array( $variation, 'get_variation_attributes' ) ) ) {
			$var_attrs = $variation->get_variation_attributes();
			if ( ! is_array( $var_attrs ) ) {
				$var_attrs = array();
			}
		}
		$ok = (bool) $this->run_as_user(
			$user_id,
			function () use ( $parent_id, $variation_id, $quantity, $var_attrs, $cart_item_data ) {
				$key = \WC()->cart->add_to_cart( $parent_id, $quantity, $variation_id, $var_attrs, $cart_item_data );
				if ( false !== $key && is_callable( array( \WC()->cart, 'calculate_totals' ) ) ) {
					\WC()->cart->calculate_totals();
				}
				return false !== $key;
			}
		);
		if ( $ok ) {
			$this->bump_abandon_cart_meta( $user_id );
		}
		return $ok;
	}

	private function bump_abandon_cart_meta( int $user_id ): void {
		AbandonedCartService::touch_user_cart( $user_id );
		AbandonedCartService::clear_abandon_flags_if_empty_cart( $user_id );
	}

	public function has_variation_in_cart( int $user_id, int $variation_id ): bool {
		return (bool) $this->run_as_user(
			$user_id,
			static function () use ( $variation_id ) {
				foreach ( \WC()->cart->get_cart() as $item ) {
					$vid = isset( $item['variation_id'] ) ? (int) $item['variation_id'] : 0;
					if ( $vid === $variation_id ) {
						return true;
					}
				}
				return false;
			}
		);
	}

	/**
	 * @param array<string, string> $address
	 */
	public function apply_address_book_entry( int $user_id, array $address ): void {
		$data = array(
			'co_first'      => isset( $address['first_name'] ) ? (string) $address['first_name'] : '',
			'co_last'       => isset( $address['last_name'] ) ? (string) $address['last_name'] : '',
			'co_country'    => isset( $address['country'] ) ? (string) $address['country'] : '',
			'co_state'      => isset( $address['state'] ) ? (string) $address['state'] : '',
			'co_city'       => isset( $address['city'] ) ? (string) $address['city'] : '',
			'co_addr'       => isset( $address['address_1'] ) ? (string) $address['address_1'] : '',
			'co_addr2'      => isset( $address['address_2'] ) ? (string) $address['address_2'] : '',
			'co_post'       => isset( $address['postcode'] ) ? (string) $address['postcode'] : '',
			'co_phone'      => isset( $address['phone'] ) ? (string) $address['phone'] : '',
			'co_state_term' => isset( $address['state_term'] ) ? (int) $address['state_term'] : 0,
			'co_city_term'  => isset( $address['city_term'] ) ? (int) $address['city_term'] : 0,
		);
		$this->apply_checkout_address_to_customer( $user_id, $data );
	}
}
