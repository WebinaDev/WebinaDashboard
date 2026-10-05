<?php
/**
 * POS payment-link SMS shortcodes and snapshot fields.
 *
 * Defines the variables used by the `pos-payment-link` shop SMS pattern:
 * customer name (اسم), phone (شماره), payment link (لینک), and pattern code.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and fills POS payment SMS template variables.
 */
final class Webino_Dashboard_Sms_Pos_Payment {

	const EVENT_KEY = 'pos-payment-link';

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'webino_dashboard_sms_shortcodes', array( __CLASS__, 'filter_shortcodes' ), 20 );
		add_filter( 'webino_dashboard_sms_event_catalog', array( __CLASS__, 'filter_event_catalog' ), 20 );
		add_filter( 'webino_dashboard_sms_order_snapshot', array( __CLASS__, 'filter_order_snapshot' ), 20, 2 );
	}

	/**
	 * Shortcodes available in SMS patterns UI / CRM template editor.
	 *
	 * Canonical keys match other order templates; aliases map Persian labels
	 * (اسم / شماره / لینک) to the same snapshot values.
	 *
	 * @return array<int,array{key:string,label:string,scope:string}>
	 */
	public static function shortcodes() {
		return array(
			array(
				'key'   => 'customer_name',
				'label' => __( 'Customer name (اسم)', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'name',
				'label' => __( 'Customer name (اسم)', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'customer_phone',
				'label' => __( 'Customer phone (شماره)', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'mobile',
				'label' => __( 'Customer mobile (شماره)', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'phone',
				'label' => __( 'Customer phone (شماره)', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'payment_url',
				'label' => __( 'Payment link (لینک)', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'payment_link',
				'label' => __( 'Payment link (لینک)', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'link',
				'label' => __( 'Payment link (لینک)', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'pattern_code',
				'label' => __( 'Pattern code', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'pattern',
				'label' => __( 'Pattern code', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'order_number',
				'label' => __( 'Order number', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'order_id',
				'label' => __( 'Order ID', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'total',
				'label' => __( 'Order total', 'webino-dashboard' ),
				'scope' => 'order',
			),
			array(
				'key'   => 'site_name',
				'label' => __( 'Site name', 'webino-dashboard' ),
				'scope' => 'all',
			),
		);
	}

	/**
	 * @return array{key:string,label:string,kind:string}
	 */
	public static function event_catalog_item() {
		return array(
			'key'   => self::EVENT_KEY,
			'label' => __( 'POS payment link', 'webino-dashboard' ),
			'kind'  => 'extra',
		);
	}

	/**
	 * Merge POS shortcodes into an existing shortcode list (dedupe by key).
	 *
	 * @param array<int,mixed> $shortcodes Existing shortcodes.
	 * @return array<int,array{key:string,label:string,scope:string}>
	 */
	public static function merge_shortcodes( $shortcodes ) {
		$out  = array();
		$seen = array();
		foreach ( array_merge( is_array( $shortcodes ) ? $shortcodes : array(), self::shortcodes() ) as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$key = sanitize_key( (string) ( $row['key'] ?? '' ) );
			if ( '' === $key || isset( $seen[ $key ] ) ) {
				continue;
			}
			$seen[ $key ] = true;
			$out[]        = array(
				'key'   => $key,
				'label' => isset( $row['label'] ) ? wp_strip_all_tags( (string) $row['label'] ) : $key,
				'scope' => isset( $row['scope'] ) ? sanitize_key( (string) $row['scope'] ) : 'order',
			);
		}
		return $out;
	}

	/**
	 * Ensure pos-payment-link is in the shop SMS event catalog.
	 *
	 * @param array<int,mixed> $catalog Catalog rows.
	 * @return array<int,array{key:string,label:string,kind?:string}>
	 */
	public static function merge_event_catalog( $catalog ) {
		$out  = array();
		$seen = array();
		foreach ( is_array( $catalog ) ? $catalog : array() as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$key = sanitize_key( (string) ( $row['key'] ?? '' ) );
			if ( '' === $key || isset( $seen[ $key ] ) ) {
				continue;
			}
			$seen[ $key ] = true;
			$out[]        = $row;
		}
		if ( ! isset( $seen[ self::EVENT_KEY ] ) ) {
			$out[] = self::event_catalog_item();
		}
		return $out;
	}

	/**
	 * @param array<int,mixed> $shortcodes Shortcodes.
	 * @return array<int,array{key:string,label:string,scope:string}>
	 */
	public static function filter_shortcodes( $shortcodes ) {
		return self::merge_shortcodes( $shortcodes );
	}

	/**
	 * @param array<int,mixed> $catalog Catalog.
	 * @return array<int,array{key:string,label:string,kind?:string}>
	 */
	public static function filter_event_catalog( $catalog ) {
		return self::merge_event_catalog( $catalog );
	}

	/**
	 * @param array<string,mixed> $snapshot Snapshot.
	 * @param WC_Order|mixed      $order    Order.
	 * @return array<string,mixed>
	 */
	public static function filter_order_snapshot( $snapshot, $order ) {
		if ( ! $order instanceof WC_Order ) {
			return is_array( $snapshot ) ? $snapshot : array();
		}
		return self::enrich_snapshot( $order, is_array( $snapshot ) ? $snapshot : array() );
	}

	/**
	 * Fill name / phone / payment link / pattern code for POS pay SMS.
	 *
	 * @param WC_Order            $order    Order.
	 * @param array<string,mixed> $snapshot Existing snapshot.
	 * @return array<string,mixed>
	 */
	public static function enrich_snapshot( $order, array $snapshot = array() ) {
		$name = trim( (string) $order->get_billing_first_name() . ' ' . (string) $order->get_billing_last_name() );
		if ( '' === $name && method_exists( $order, 'get_formatted_billing_full_name' ) ) {
			$name = trim( (string) $order->get_formatted_billing_full_name() );
		}
		$phone = preg_replace( '/\D+/', '', (string) $order->get_billing_phone() );
		if ( '' === (string) $phone ) {
			$phone = (string) $order->get_billing_phone();
		}
		$url = '';
		if ( class_exists( 'Webino_Dashboard_Pay_Order', false ) ) {
			$url = (string) Webino_Dashboard_Pay_Order::public_url( $order );
		}
		if ( '' === $url ) {
			$url = (string) $order->get_checkout_payment_url( true );
		}
		$pattern_code = self::bound_pattern_code( 'order_customer' );

		$vars = array(
			'id'             => (int) $order->get_id(),
			'order_id'       => (string) $order->get_id(),
			'number'         => (string) $order->get_order_number(),
			'order_number'   => (string) $order->get_order_number(),
			'customer_name'  => $name,
			'name'           => $name,
			'customer_phone' => (string) $phone,
			'mobile'         => (string) $phone,
			'phone'          => (string) $phone,
			'customer_email' => (string) $order->get_billing_email(),
			'total'          => wp_strip_all_tags( (string) $order->get_formatted_order_total() ),
			'price'          => wp_strip_all_tags( (string) $order->get_formatted_order_total() ),
			'payment_url'    => $url,
			'payment_link'   => $url,
			'link'           => $url,
			'pattern_code'   => $pattern_code,
			'pattern'        => $pattern_code,
			'site_name'      => (string) get_bloginfo( 'name' ),
			'site_url'       => (string) home_url( '/' ),
		);

		return array_merge( $snapshot, $vars );
	}

	/**
	 * Bound IPPanel pattern code for this event (customer scope by default).
	 *
	 * @param string $scope order_customer|order_admin.
	 * @return string
	 */
	public static function bound_pattern_code( $scope = 'order_customer' ) {
		$scope = sanitize_key( (string) $scope );
		if ( class_exists( 'Webino_Dashboard_Orders', false ) && method_exists( 'Webino_Dashboard_Orders', 'fetch_sms_pattern_registry_rows' ) ) {
			// Prefer public cache path via shop settings transient.
		}
		$domain = '';
		if ( class_exists( 'Webino_Dashboard_License', false ) ) {
			$domain = (string) Webino_Dashboard_License::instance()->get_current_domain();
		}
		$cached = get_transient( 'webino_sms_shop_settings_' . md5( $domain ) );
		$rows   = ( is_array( $cached ) && isset( $cached['registry'] ) && is_array( $cached['registry'] ) )
			? $cached['registry']
			: array();
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			if ( $scope !== sanitize_key( (string) ( $row['scope'] ?? '' ) ) ) {
				continue;
			}
			if ( self::EVENT_KEY !== sanitize_key( (string) ( $row['event_key'] ?? '' ) ) ) {
				continue;
			}
			$code = trim( (string) ( $row['ippanel_code'] ?? '' ) );
			if ( '' !== $code ) {
				return $code;
			}
		}
		return '';
	}

	/**
	 * Build snapshot + notify via sms-panel when available.
	 *
	 * @param WC_Order $order Order.
	 * @return bool
	 */
	public static function notify( $order ) {
		if ( ! $order instanceof WC_Order ) {
			return false;
		}
		$snapshot = array();
		if ( class_exists( 'Webino_Dashboard_Sms_Order_Hooks', false ) ) {
			$snapshot = Webino_Dashboard_Sms_Order_Hooks::build_snapshot( $order );
			if ( ! is_array( $snapshot ) ) {
				$snapshot = array();
			}
		}
		$snapshot = self::enrich_snapshot( $order, $snapshot );
		/**
		 * Allow sms-panel / other modules to adjust POS payment snapshot.
		 *
		 * @param array<string,mixed> $snapshot Snapshot.
		 * @param WC_Order            $order    Order.
		 */
		$snapshot = apply_filters( 'webino_dashboard_sms_order_snapshot', $snapshot, $order );
		if ( ! is_array( $snapshot ) ) {
			$snapshot = self::enrich_snapshot( $order, array() );
		}

		if ( class_exists( 'Webino_Dashboard_Sms_Order_Hooks', false ) ) {
			Webino_Dashboard_Sms_Order_Hooks::notify_snapshot( self::EVENT_KEY, $snapshot );
			return true;
		}

		$phone = preg_replace( '/\D+/', '', (string) ( $snapshot['customer_phone'] ?? $snapshot['phone'] ?? '' ) );
		$url   = (string) ( $snapshot['payment_url'] ?? $snapshot['link'] ?? '' );
		$name  = (string) ( $snapshot['customer_name'] ?? $snapshot['name'] ?? '' );
		if ( '' === $phone || '' === $url ) {
			return false;
		}
		$message = sprintf(
			/* translators: 1: customer name, 2: order number, 3: payment URL */
			__( '%1$s عزیز، لینک پرداخت سفارش #%2$s: %3$s', 'webino-dashboard' ),
			$name !== '' ? $name : __( 'مشتری', 'webino-dashboard' ),
			(string) $order->get_order_number(),
			$url
		);
		do_action(
			'webino_sms_send',
			$phone,
			$message,
			array(
				'order_id'   => $order->get_id(),
				'event'      => self::EVENT_KEY,
				'snapshot'   => $snapshot,
				'pattern'    => (string) ( $snapshot['pattern_code'] ?? '' ),
			)
		);
		return true;
	}
}
