<?php
/**
 * WooCommerce order helpers for dashboard REST.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Order serialization and utilities.
 */
class Webino_Dashboard_Orders {

	/**
	 * @return bool
	 */
	public static function wc_active() {
		return function_exists( 'wc_get_order' );
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function get_tracking_code( $o ) {
		if ( class_exists( '\Webino_Dashboard_Bots_Telegram\Messaging\TemplateRenderer' ) ) {
			$code = \Webino_Dashboard_Bots_Telegram\Messaging\TemplateRenderer::get_tracking_code( $o );
			if ( '' !== $code ) {
				return (string) $code;
			}
		}
		$v = apply_filters( 'wbdb_tg_tracking_value', '', $o );
		if ( '' !== $v ) {
			return (string) $v;
		}
		foreach ( array( 'woobale_tracking_code', '_tracking_code', 'tracking_code', '_tracking_number', '_post_barcode', 'post_barcode' ) as $meta_key ) {
			$m = (string) $o->get_meta( $meta_key );
			if ( '' !== $m ) {
				return $m;
			}
		}
		return '';
	}

	/**
	 * Detect shipping carrier from order status, method title, or provider meta.
	 *
	 * @param WC_Order $o Order.
	 * @return string courier|post|tipax|other
	 */
	public static function get_shipping_kind( $o ) {
		if ( class_exists( 'Webino_Dashboard_Sms_Order_Map', false ) ) {
			$from_status = Webino_Dashboard_Sms_Order_Map::event_for_status( $o->get_status() );
			if ( in_array( $from_status, array( 'courier', 'post', 'tipax' ), true ) ) {
				return $from_status;
			}
		}
		$parts   = array();
		$parts[] = strtolower( self::get_shipping_method_title( $o ) );
		$parts[] = strtolower(
			self::get_meta_first(
				$o,
				array( '_tracking_provider', 'tracking_provider' )
			)
		);
		foreach ( $o->get_shipping_methods() as $method ) {
			$parts[] = strtolower( (string) $method->get_method_id() );
			$parts[] = strtolower( (string) $method->get_name() );
		}
		$haystack = implode( ' ', $parts );
		if ( preg_match( '/tipax|تیپاکس/u', $haystack ) ) {
			return 'tipax';
		}
		if ( preg_match( '/courier|peyk|pik|پیک/u', $haystack ) ) {
			return 'courier';
		}
		if ( preg_match( '/post|postal|پست/u', $haystack ) ) {
			return 'post';
		}
		return 'other';
	}

	/**
	 * URL template for a shipping kind (shop SMS settings override defaults).
	 *
	 * @param string $kind courier|post|tipax|other.
	 * @return string
	 */
	public static function get_tracking_url_template( $kind ) {
		$defaults = array(
			'post'    => 'https://tracking.post.ir/?id={code}',
			'tipax'   => 'https://tipaxco.com/tracking?code={code}',
			'courier' => '',
			'other'   => '',
		);
		$kind = sanitize_key( (string) $kind );
		if ( ! isset( $defaults[ $kind ] ) ) {
			$kind = 'other';
		}
		$template = $defaults[ $kind ];
		if ( class_exists( 'WebinoCRM_Sms_Settings_Service', false ) && class_exists( 'WebinoCRM_Sms_Constants', false ) ) {
			$domain = '';
			if ( class_exists( 'Webino_Dashboard_License', false ) ) {
				$domain = (string) Webino_Dashboard_License::instance()->get_current_domain();
			}
			if ( '' === $domain ) {
				$domain = (string) wp_parse_url( home_url(), PHP_URL_HOST );
			}
			$shop = WebinoCRM_Sms_Settings_Service::get( $domain, WebinoCRM_Sms_Constants::SCOPE_SHOP );
			if ( is_array( $shop ) && ! empty( $shop['tracking_urls'] ) && is_array( $shop['tracking_urls'] ) ) {
				$custom = isset( $shop['tracking_urls'][ $kind ] ) ? trim( (string) $shop['tracking_urls'][ $kind ] ) : '';
				if ( '' !== $custom ) {
					$template = $custom;
				}
			}
		}
		/**
		 * Filter tracking URL template for SMS / notifications.
		 *
		 * @param string   $template Template with {code} placeholder.
		 * @param string   $kind     Shipping kind.
		 */
		return (string) apply_filters( 'webino_dashboard_tracking_url_template', $template, $kind );
	}

	/**
	 * Build tracking URL from code and shipping kind.
	 *
	 * @param WC_Order $o    Order.
	 * @param string   $code Tracking code.
	 * @return string
	 */
	public static function resolve_tracking_url( $o, $code = '' ) {
		$code = '' !== $code ? (string) $code : self::get_tracking_code( $o );
		if ( '' === $code ) {
			return '';
		}
		$kind     = self::get_shipping_kind( $o );
		$template = self::get_tracking_url_template( $kind );
		if ( '' === $template ) {
			if ( in_array( $kind, array( 'courier', 'other' ), true ) ) {
				return (string) $o->get_view_order_url();
			}
			$template = self::get_tracking_url_template( 'post' );
		}
		if ( '' === $template ) {
			return '';
		}
		if ( false === strpos( $template, '{code}' ) && false === strpos( $template, '{code_raw}' ) ) {
			$template = 'https://tracking.post.ir/?id={code}';
		}
		$url = str_replace( '{code_raw}', $code, $template );
		$url = str_replace( '{code}', rawurlencode( $code ), $url );
		$url = (string) apply_filters( 'webino_dashboard_tracking_url', $url, $o, $code );
		return (string) apply_filters( 'wbdb_tg_tracking_url', $url, $o, $code );
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function get_tracking_url( $o ) {
		return self::resolve_tracking_url( $o );
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function get_order_source( $o ) {
		if ( class_exists( 'Webino_Dashboard_Marketplace' ) ) {
			$label = Webino_Dashboard_Marketplace::order_label( $o );
			if ( '' !== $label ) {
				return $label;
			}
		}
		$platform = (string) $o->get_meta( '_wnc_platform' );
		if ( '' !== $platform ) {
			$labels = class_exists( 'Webino_Dashboard_Marketplace' )
				? Webino_Dashboard_Marketplace::labels()
				: array();
			return $labels[ $platform ] ?? ucfirst( $platform );
		}
		$source_type = (string) $o->get_meta( '_wc_order_attribution_source_type' );
		$utm_source  = (string) $o->get_meta( '_wc_order_attribution_utm_source' );
		if ( '' !== $source_type && '' !== $utm_source ) {
			return ucfirst( $source_type ) . ': ' . $utm_source;
		}
		if ( '' !== $utm_source ) {
			return $utm_source;
		}
		if ( '' !== $source_type ) {
			return ucfirst( $source_type );
		}
		$created_via = $o->get_created_via();
		return $created_via ? ucfirst( $created_via ) : '';
	}

	/**
	 * @param WC_Order $o Order.
	 * @return array<string, mixed>
	 */
	public static function get_attribution( $o ) {
		$source_type = (string) $o->get_meta( '_wc_order_attribution_source_type' );
		return array(
			'source'         => self::get_order_source( $o ),
			'source_type'    => $source_type,
			'created_via'    => (string) $o->get_created_via(),
			'device_type'    => (string) $o->get_meta( '_wc_order_attribution_device_type' ),
			'session_count'  => (int) $o->get_meta( '_wc_order_attribution_session_count' ),
			'utm_source'     => (string) $o->get_meta( '_wc_order_attribution_utm_source' ),
			'utm_medium'     => (string) $o->get_meta( '_wc_order_attribution_utm_medium' ),
			'utm_campaign'   => (string) $o->get_meta( '_wc_order_attribution_utm_campaign' ),
		);
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function format_ship_to_line( $o ) {
		$ship = self::format_address_parts( $o, 'shipping' );
		$parts = array_filter(
			array(
				$ship['name'],
				$ship['state_label'],
				$ship['city'],
				$ship['address'],
				$ship['postcode'],
			)
		);
		return implode( ', ', $parts );
	}

	/**
	 * Resolve WooCommerce state code to label (IR / PWS aware).
	 *
	 * @param string $country Country code.
	 * @param string $state State code or term id.
	 * @return string
	 */
	public static function get_state_label( $country, $state ) {
		$state   = trim( (string) $state );
		$country = trim( (string) $country );
		if ( '' === $state ) {
			return '';
		}
		if ( '' === $country ) {
			$base    = function_exists( 'wc_get_base_location' ) ? wc_get_base_location() : array();
			$country = is_array( $base ) && ! empty( $base['country'] ) ? (string) $base['country'] : 'IR';
		}

		// Numeric PWS state_city term id.
		if ( ctype_digit( $state ) && taxonomy_exists( 'state_city' ) ) {
			$term = get_term( (int) $state, 'state_city' );
			if ( $term instanceof WP_Term && ! is_wp_error( $term ) ) {
				return (string) $term->name;
			}
		}

		if ( function_exists( 'WC' ) && WC()->countries ) {
			$states = WC()->countries->get_states( $country );
			if ( is_array( $states ) && isset( $states[ $state ] ) ) {
				return (string) $states[ $state ];
			}
		}

		// Map WC code → state_city parent via term meta state_code / name.
		if ( taxonomy_exists( 'state_city' ) ) {
			$terms = get_terms(
				array(
					'taxonomy'   => 'state_city',
					'hide_empty' => false,
					'parent'     => 0,
				)
			);
			if ( is_array( $terms ) ) {
				$wc_label = '';
				if ( function_exists( 'WC' ) && WC()->countries ) {
					$all = WC()->countries->get_states( $country );
					if ( is_array( $all ) && isset( $all[ $state ] ) ) {
						$wc_label = (string) $all[ $state ];
					}
				}
				foreach ( $terms as $term ) {
					if ( ! ( $term instanceof WP_Term ) ) {
						continue;
					}
					$meta_code = (string) get_term_meta( $term->term_id, 'state_code', true );
					if ( $meta_code && strcasecmp( $meta_code, $state ) === 0 ) {
						return (string) $term->name;
					}
					if ( strcasecmp( (string) $term->name, $state ) === 0 ) {
						return (string) $term->name;
					}
					if ( $wc_label && strcasecmp( (string) $term->name, $wc_label ) === 0 ) {
						return (string) $term->name;
					}
				}
			}
		}

		return $state;
	}

	/**
	 * Structured address: state, city, street, postcode (Iran-friendly order).
	 *
	 * @param WC_Order $o Order.
	 * @param string   $type billing|shipping.
	 * @return array<string, string>
	 */
	public static function format_address_parts( $o, $type = 'billing' ) {
		$type = 'shipping' === $type ? 'shipping' : 'billing';
		if ( 'billing' === $type ) {
			$country    = $o->get_billing_country();
			$state      = $o->get_billing_state();
			$first_name = $o->get_billing_first_name();
			$last_name  = $o->get_billing_last_name();
			$company    = $o->get_billing_company();
			$email      = $o->get_billing_email();
			$phone      = $o->get_billing_phone();
			$address_1  = $o->get_billing_address_1();
			$address_2  = $o->get_billing_address_2();
			$city       = $o->get_billing_city();
			$postcode   = $o->get_billing_postcode();
		} else {
			$country    = $o->get_shipping_country();
			$state      = $o->get_shipping_state();
			$first_name = $o->get_shipping_first_name();
			$last_name  = $o->get_shipping_last_name();
			$company    = $o->get_shipping_company();
			$email      = '';
			$phone      = $o->get_billing_phone();
			$address_1  = $o->get_shipping_address_1();
			$address_2  = $o->get_shipping_address_2();
			$city       = $o->get_shipping_city();
			$postcode   = $o->get_shipping_postcode();
		}

		$name    = trim( $first_name . ' ' . $last_name );
		$sep     = Webino_Dashboard_Locale::list_separator();
		$address = trim( implode( $sep, array_filter( array( $address_1, $address_2 ) ) ) );
		$state_label = self::get_state_label( $country, $state );

		return array(
			'name'         => $name,
			'company'      => (string) $company,
			'email'        => (string) $email,
			'phone'        => (string) $phone,
			'state'        => (string) $state,
			'state_label'  => $state_label,
			'city'         => (string) $city,
			'address'      => $address,
			'postcode'     => (string) $postcode,
			'country'      => (string) $country,
		);
	}

	/**
	 * @param array<string, string> $parts Address parts.
	 * @return array<string, string>
	 */
	public static function address_parts_for_rest( $parts ) {
		return array(
			'first_name'  => '',
			'last_name'   => '',
			'name'        => $parts['name'] ?? '',
			'company'     => $parts['company'] ?? '',
			'email'       => $parts['email'] ?? '',
			'phone'       => $parts['phone'] ?? '',
			'address_1'   => $parts['address'] ?? '',
			'address_2'   => '',
			'city'        => $parts['city'] ?? '',
			'state'       => $parts['state'] ?? '',
			'state_label' => $parts['state_label'] ?? '',
			'postcode'    => $parts['postcode'] ?? '',
			'country'     => $parts['country'] ?? '',
		);
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function ship_to_maps_url( $o ) {
		$line = self::format_ship_to_line( $o );
		if ( '' === $line ) {
			return '';
		}
		return 'https://maps.google.com/maps?&q=' . rawurlencode( $line ) . '&z=16';
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function get_shipping_method_title( $o ) {
		$methods = array();
		foreach ( $o->get_shipping_methods() as $method ) {
			$methods[] = $method->get_name();
		}
		return implode( ', ', $methods );
	}

	/**
	 * @param WC_Order $o Order.
	 * @return string
	 */
	public static function get_meta_first( $o, $keys ) {
		foreach ( $keys as $key ) {
			$val = $o->get_meta( $key );
			if ( '' !== $val && null !== $val ) {
				return (string) $val;
			}
		}
		return '';
	}

	/**
	 * @param int $customer_id Customer user ID.
	 * @return array<string, float|int>
	 */
	public static function get_customer_history( $customer_id ) {
		$customer_id = (int) $customer_id;
		if ( $customer_id <= 0 || ! function_exists( 'wc_get_orders' ) ) {
			return array(
				'order_count'       => 0,
				'total_spent'       => 0.0,
				'avg_order_value'   => 0.0,
			);
		}
		$paid_statuses = function_exists( 'wc_get_is_paid_statuses' )
			? wc_get_is_paid_statuses()
			: array( 'completed', 'processing' );
		$order_limit = 500;
		$orders      = wc_get_orders(
			array(
				'customer_id' => $customer_id,
				'limit'       => $order_limit,
				'return'      => 'objects',
				'status'      => $paid_statuses,
			)
		);
		$total       = 0.0;
		foreach ( $orders as $order ) {
			if ( $order ) {
				$total += (float) $order->get_total();
			}
		}
		$count = count( $orders );
		return array(
			'order_count'     => $count,
			'total_spent'     => $total,
			'avg_order_value' => $count > 0 ? $total / $count : 0.0,
			'truncated'       => $count >= $order_limit,
		);
	}

	/**
	 * @param int $customer_id Optional customer scope.
	 * @return array<int, array{slug: string, label: string, count: int}>
	 */
	public static function get_status_counts( $customer_id = 0 ) {
		$counts      = array();
		$customer_id = (int) $customer_id;
		if ( ! self::wc_active() ) {
			return $counts;
		}
		$statuses = wc_get_order_statuses();
		$total    = 0;
		if ( $customer_id > 0 ) {
			$tally = array();
			$ids   = wc_get_orders(
				array(
					'customer_id' => $customer_id,
					'limit'       => -1,
					'return'      => 'ids',
					'type'        => 'shop_order',
				)
			);
			if ( ! is_array( $ids ) ) {
				$ids = array();
			}
			foreach ( $ids as $oid ) {
				$o = wc_get_order( $oid );
				if ( ! $o ) {
					continue;
				}
				$slug = $o->get_status();
				if ( ! isset( $tally[ $slug ] ) ) {
					$tally[ $slug ] = 0;
				}
				$tally[ $slug ]++;
			}
			foreach ( array_keys( $statuses ) as $status ) {
				$slug     = str_replace( 'wc-', '', $status );
				$count    = isset( $tally[ $slug ] ) ? (int) $tally[ $slug ] : 0;
				$counts[] = array(
					'slug'  => $slug,
					'label' => $statuses[ $status ],
					'count' => $count,
				);
				$total += $count;
			}
		} else {
			foreach ( array_keys( $statuses ) as $status ) {
				$slug  = str_replace( 'wc-', '', $status );
				$count = function_exists( 'wc_orders_count' ) ? (int) wc_orders_count( $slug ) : 0;
				$counts[] = array(
					'slug'  => $slug,
					'label' => $statuses[ $status ],
					'count' => $count,
				);
				$total += $count;
			}
		}
		array_unshift(
			$counts,
			array(
				'slug'  => 'all',
				'label' => __( 'All', 'webino-dashboard' ),
				'count' => $total,
			)
		);
		return $counts;
	}

	/**
	 * Portal tab slug => WooCommerce statuses.
	 *
	 * @return array<string, list<string>>
	 */
	public static function get_portal_group_map() {
		return array(
			'active'    => array( 'pending', 'on-hold', 'processing' ),
			'completed' => array( 'completed' ),
			'refunded'  => array( 'refunded' ),
			'cancelled' => array( 'cancelled', 'failed' ),
		);
	}

	/**
	 * Portal order tabs: active, completed, refunded, cancelled.
	 *
	 * @param int $customer_id Customer user ID.
	 * @return array<int, array{slug: string, label: string, count: int, statuses: list<string>}>
	 */
	public static function get_portal_status_groups( $customer_id ) {
		$customer_id = (int) $customer_id;
		$map         = self::get_portal_group_map();
		$groups_def  = array(
			'active'    => array(
				'label'    => __( 'Active', 'webino-dashboard' ),
				'statuses' => $map['active'],
			),
			'completed' => array(
				'label'    => __( 'Delivered', 'webino-dashboard' ),
				'statuses' => $map['completed'],
			),
			'refunded'  => array(
				'label'    => __( 'Returned', 'webino-dashboard' ),
				'statuses' => $map['refunded'],
			),
			'cancelled' => array(
				'label'    => __( 'Cancelled', 'webino-dashboard' ),
				'statuses' => $map['cancelled'],
			),
		);
		$tally = array();
		if ( $customer_id > 0 && self::wc_active() ) {
			$ids = wc_get_orders(
				array(
					'customer_id' => $customer_id,
					'limit'       => -1,
					'return'      => 'ids',
					'type'        => 'shop_order',
				)
			);
			foreach ( (array) $ids as $oid ) {
				$o = wc_get_order( $oid );
				if ( ! $o ) {
					continue;
				}
				$st = $o->get_status();
				if ( ! isset( $tally[ $st ] ) ) {
					$tally[ $st ] = 0;
				}
				$tally[ $st ]++;
			}
		}
		$out = array();
		foreach ( $groups_def as $slug => $def ) {
			$count = 0;
			foreach ( $def['statuses'] as $st ) {
				$count += isset( $tally[ $st ] ) ? (int) $tally[ $st ] : 0;
			}
			$out[] = array(
				'slug'     => $slug,
				'label'    => $def['label'],
				'count'    => $count,
				'statuses' => $def['statuses'],
			);
		}
		return $out;
	}

	/**
	 * Tab counts for the customer portal order list.
	 *
	 * @param int $customer_id Customer user ID.
	 * @return array<int, array{slug: string, label: string, count: int}>
	 */
	public static function get_portal_status_counts( $customer_id ) {
		$groups = self::get_portal_status_groups( $customer_id );
		$total  = 0;
		$out    = array();
		foreach ( $groups as $g ) {
			$total += (int) $g['count'];
			$out[]  = array(
				'slug'  => $g['slug'],
				'label' => $g['label'],
				'count' => (int) $g['count'],
			);
		}
		array_unshift(
			$out,
			array(
				'slug'  => 'all',
				'label' => __( 'All', 'webino-dashboard' ),
				'count' => $total,
			)
		);
		return $out;
	}

	/**
	 * @param WC_Order $o Order.
	 * @return array<string, mixed>
	 */
	public static function map_list_item( $o ) {
		$dc       = $o->get_date_created();
		$ship     = self::format_address_parts( $o, 'shipping' );
		$state_raw = (string) ( $ship['state'] ?? '' );
		$state_lbl = (string) ( $ship['state_label'] ?? '' );
		return array(
			'id'                   => $o->get_id(),
			'number'               => $o->get_order_number(),
			'status'               => $o->get_status(),
			'status_label'         => wc_get_order_status_name( $o->get_status() ),
			'total'                => $o->get_total(),
			'currency'             => $o->get_currency(),
			'date'                 => $dc ? $dc->format( 'c' ) : null,
			'customer_name'        => trim( $o->get_formatted_billing_full_name() ) ?: trim( $o->get_formatted_shipping_full_name() ),
			'billing_email'        => $o->get_billing_email(),
			'billing_phone'        => $o->get_billing_phone(),
			'ship_to'              => self::format_ship_to_line( $o ),
			'ship_to_maps_url'     => self::ship_to_maps_url( $o ),
			'shipping_method'      => self::get_shipping_method_title( $o ),
			'source'               => self::get_order_source( $o ),
			'source_type'          => (string) $o->get_meta( '_wc_order_attribution_source_type' ),
			'utm_source'           => (string) $o->get_meta( '_wc_order_attribution_utm_source' ),
			'utm_medium'           => (string) $o->get_meta( '_wc_order_attribution_utm_medium' ),
			'utm_campaign'         => (string) $o->get_meta( '_wc_order_attribution_utm_campaign' ),
			'created_via'          => (string) $o->get_created_via(),
			'marketplace'          => class_exists( 'Webino_Dashboard_Marketplace' ) ? Webino_Dashboard_Marketplace::order_slug( $o ) : (string) $o->get_meta( '_wnc_platform' ),
			'remote_order_id'      => class_exists( 'Webino_Dashboard_Marketplace' ) ? Webino_Dashboard_Marketplace::remote_order_id( $o ) : (string) $o->get_meta( '_wnc_remote_order_id' ),
			'remote_status'        => (string) ( $o->get_meta( '_digikala_native_status' ) ?: $o->get_meta( '_wnc_remote_status' ) ),
			'digikala_fulfillment' => (string) $o->get_meta( '_digikala_fulfillment' ),
			'digikala_shipment_id' => (string) $o->get_meta( '_digikala_shipment_id' ),
			'payment_method'       => $o->get_payment_method(),
			'payment_method_title' => $o->get_payment_method_title(),
			'state'                => $state_raw,
			'state_label'          => $state_lbl && $state_lbl !== $state_raw ? $state_lbl : ( $state_lbl ?: '' ),
			'customer_id'          => (int) $o->get_customer_id(),
			'is_pos'               => '1' === (string) $o->get_meta( '_webino_pos_order' ) || 'webino_pos' === (string) $o->get_created_via(),
			'sales_channel'        => (string) $o->get_meta( '_webino_sales_channel' ),
			'created_by'           => (int) $o->get_meta( '_webino_created_by' ),
			'payment_tender'       => (string) $o->get_meta( '_webino_payment_tender' ),
		);
	}

	/**
	 * @param WC_Order $o Order.
	 * @return array<string, mixed>
	 */
	public static function map_detail( $o ) {
		$items_out = array();
		foreach ( array_values( $o->get_items() ) as $item ) {
			if ( ! is_a( $item, 'WC_Order_Item_Product' ) ) {
				continue;
			}
			$product = $item->get_product();
			$sku     = $product && is_callable( array( $product, 'get_sku' ) ) ? (string) $product->get_sku() : '';
			$pid     = (int) $item->get_product_id();
			$vid     = (int) $item->get_variation_id();
			$image  = '';
			$img_id = 0;
			if ( $product && is_callable( array( $product, 'get_image_id' ) ) ) {
				$img_id = (int) $product->get_image_id();
			}
			if ( $img_id <= 0 && $pid > 0 ) {
				$parent = ( $vid > 0 || ! $product ) ? wc_get_product( $pid ) : $product;
				if ( $parent && is_callable( array( $parent, 'get_image_id' ) ) ) {
					$img_id = (int) $parent->get_image_id();
					if ( $img_id <= 0 && is_callable( array( $parent, 'get_gallery_image_ids' ) ) ) {
						$gallery = $parent->get_gallery_image_ids();
						if ( is_array( $gallery ) && ! empty( $gallery[0] ) ) {
							$img_id = (int) $gallery[0];
						}
					}
				}
			}
			if ( $img_id <= 0 && $product && is_callable( array( $product, 'get_gallery_image_ids' ) ) ) {
				$gallery = $product->get_gallery_image_ids();
				if ( is_array( $gallery ) && ! empty( $gallery[0] ) ) {
					$img_id = (int) $gallery[0];
				}
			}
			if ( $img_id > 0 ) {
				$size = 'woocommerce_thumbnail';
				$src  = wp_get_attachment_image_url( $img_id, $size );
				if ( ! $src ) {
					$src = wp_get_attachment_image_url( $img_id, 'thumbnail' );
				}
				$image = $src ? esc_url_raw( (string) $src ) : '';
			}
			$attributes = array();
			$staff_view = current_user_can( 'edit_shop_orders' );
			if ( is_callable( array( $item, 'get_formatted_meta_data' ) ) ) {
				foreach ( $item->get_formatted_meta_data( '_' ) as $meta ) {
					$raw_key = isset( $meta->key ) ? (string) $meta->key : '';
					if ( '' !== $raw_key && ( '_' === $raw_key[0] || 'reduced_stock' === $raw_key ) ) {
						continue;
					}
					$formatted = self::format_order_item_meta_attribute( $raw_key, (string) $meta->value, $o, $staff_view );
					if ( null === $formatted ) {
						continue;
					}
					$attributes[] = array(
						'key'   => $formatted['key'],
						'value' => $formatted['value'],
					);
				}
			}
			$items_out[] = array(
				'item_id'      => (int) $item->get_id(),
				'name'         => $item->get_name(),
				'quantity'     => $item->get_quantity(),
				'returnable_qty' => class_exists( 'Webino_Dashboard_Order_Returns', false )
					? Webino_Dashboard_Order_Returns::returnable_qty( $o, (int) $item->get_id() )
					: (float) $item->get_quantity(),
				'subtotal'     => $item->get_subtotal(),
				'total'        => $item->get_total(),
				'sku'          => $sku,
				'product_id'   => $pid,
				'variation_id' => $vid,
				'image'        => $image,
				'attributes'   => $attributes,
				'edit_url'     => $pid > 0 ? '/shop/products/' . ( $vid > 0 ? $pid : $pid ) : '',
			);
		}

		$shipping_items = array();
		foreach ( $o->get_shipping_methods() as $method ) {
			$shipping_items[] = array(
				'id'        => $method->get_method_id(),
				'instance'  => $method->get_instance_id(),
				'name'      => $method->get_name(),
				'total'     => $method->get_total(),
			);
		}

		$notes_out = array();
		if ( function_exists( 'wc_get_order_notes' ) ) {
			$all_notes = wc_get_order_notes(
				array(
					'order_id' => $o->get_id(),
					'orderby'  => 'date_created',
					'order'    => 'DESC',
				)
			);
			foreach ( $all_notes as $note ) {
				$content = (string) $note->content;
				if ( class_exists( 'Webino_Dashboard_Order_Notes', false ) ) {
					$content = Webino_Dashboard_Order_Notes::format( $content );
				}
				$notes_out[] = array(
					'id'            => (int) $note->id,
					'content'       => $content,
					'date'          => $note->date_created ? $note->date_created->format( 'c' ) : null,
					'customer_note' => (bool) $note->customer_note,
					'added_by'      => $note->added_by,
				);
			}
		}

		$dc = $o->get_date_created();
		$dm = $o->get_date_modified();
		$customer_id = (int) $o->get_customer_id();

		$digipay = array(
			'transaction_id' => self::get_meta_first( $o, array( '_digipay_transaction_id', 'digipay_transaction_id', '_transaction_id' ) ),
			'type'           => self::get_meta_first( $o, array( '_digipay_type', 'digipay_type' ) ),
			'tracking_code'  => self::get_meta_first( $o, array( '_digipay_tracking_code', 'digipay_tracking_code' ) ),
			'provider_id'    => self::get_meta_first( $o, array( '_digipay_provider_id', 'digipay_provider_id' ) ),
			'gateway'        => self::get_meta_first( $o, array( '_digipay_payment_gateway', 'digipay_payment_gateway' ) ),
			'delivered'      => self::get_meta_first( $o, array( '_digipay_delivered', 'digipay_delivered' ) ),
		);

		$billing_parts  = self::format_address_parts( $o, 'billing' );
		$shipping_parts = self::format_address_parts( $o, 'shipping' );
		$sms_log        = self::get_sms_log( $o, true );

		return array(
			'id'                       => $o->get_id(),
			'number'                   => $o->get_order_number(),
			'status'                   => $o->get_status(),
			'status_label'             => wc_get_order_status_name( $o->get_status() ),
			'total'                    => $o->get_total(),
			'subtotal'                 => $o->get_subtotal(),
			'total_discount'           => $o->get_discount_total(),
			'shipping_total'           => $o->get_shipping_total(),
			'currency'                 => $o->get_currency(),
			'payment_method'           => $o->get_payment_method(),
			'payment_method_title'     => $o->get_payment_method_title(),
			'customer_note'            => $o->get_customer_note(),
			'customer_id'              => $customer_id,
			'is_guest'                 => $customer_id <= 0,
			'customer_ip'              => (string) $o->get_customer_ip_address(),
			'is_editable'              => $o->is_editable(),
			'billing'                  => array_merge(
				array(
					'first_name' => $o->get_billing_first_name(),
					'last_name'  => $o->get_billing_last_name(),
					'company'    => $o->get_billing_company(),
					'email'      => $o->get_billing_email(),
					'phone'      => $o->get_billing_phone(),
					'address_1'  => $o->get_billing_address_1(),
					'address_2'  => $o->get_billing_address_2(),
					'city'       => $o->get_billing_city(),
					'state'      => $o->get_billing_state(),
					'postcode'   => $o->get_billing_postcode(),
					'country'    => $o->get_billing_country(),
				),
				array(
					'state_label' => $billing_parts['state_label'],
					'name'        => $billing_parts['name'],
				)
			),
			'shipping'                 => array_merge(
				array(
					'first_name' => $o->get_shipping_first_name(),
					'last_name'  => $o->get_shipping_last_name(),
					'company'    => $o->get_shipping_company(),
					'address_1'  => $o->get_shipping_address_1(),
					'address_2'  => $o->get_shipping_address_2(),
					'city'       => $o->get_shipping_city(),
					'state'      => $o->get_shipping_state(),
					'postcode'   => $o->get_shipping_postcode(),
					'country'    => $o->get_shipping_country(),
					'phone'      => $o->get_billing_phone(),
				),
				array(
					'state_label' => $shipping_parts['state_label'],
					'name'        => $shipping_parts['name'],
				)
			),
			'billing_formatted'        => self::address_parts_for_rest( $billing_parts ),
			'shipping_formatted'       => self::address_parts_for_rest( $shipping_parts ),
			'shipping_method'          => self::get_shipping_method_title( $o ),
			'shipping_items'           => $shipping_items,
			'shipping_method_options'  => self::get_shipping_method_options(),
			'tracking_code'            => self::get_tracking_code( $o ),
			'tracking_url'             => self::get_tracking_url( $o ),
			'tracking_provider'        => self::get_meta_first( $o, array( '_tracking_provider', 'tracking_provider' ) ) ?: '',
			'post_barcode'             => self::get_meta_first( $o, array( '_post_barcode', 'post_barcode' ) ),
			'delivery_date'            => self::get_meta_first( $o, array( '_delivery_date', 'delivery_date', '_pws_delivery_date' ) ),
			'delivery_time'            => self::get_meta_first( $o, array( '_delivery_time', 'delivery_time', '_pws_delivery_time' ) ),
			'national_id'              => self::get_meta_first( $o, array( '_billing_national_id', '_national_code', 'billing_national_id', 'national_id' ) ),
			'checkout_phone'           => self::get_meta_first( $o, array( '_billing_phone_extra', 'checkout_phone', '_checkout_phone' ) ),
			'payment_gateway_meta'     => $digipay,
			'attribution'              => self::get_attribution( $o ),
			'marketplace'              => class_exists( 'Webino_Dashboard_Marketplace' ) ? Webino_Dashboard_Marketplace::order_slug( $o ) : (string) $o->get_meta( '_wnc_platform' ),
			'remote_order_id'          => class_exists( 'Webino_Dashboard_Marketplace' ) ? Webino_Dashboard_Marketplace::remote_order_id( $o ) : (string) $o->get_meta( '_wnc_remote_order_id' ),
			'remote_status'            => (string) ( $o->get_meta( '_digikala_native_status' ) ?: $o->get_meta( '_wnc_remote_status' ) ),
			'digikala_fulfillment'     => (string) $o->get_meta( '_digikala_fulfillment' ),
			'digikala_shipment_id'     => (string) $o->get_meta( '_digikala_shipment_id' ),
			'digikala_native_status'   => (string) $o->get_meta( '_digikala_native_status' ),
			'digikala_order_items'     => ( static function ( $raw ) {
				$decoded = json_decode( (string) $raw, true );
				return is_array( $decoded ) ? $decoded : array();
			} )( $o->get_meta( '_digikala_order_items' ) ),
			'notes'                    => $notes_out,
			'customer_history'         => self::get_customer_history( $customer_id ),
			'sms_log'                  => $sms_log,
			'returns'                  => class_exists( 'Webino_Dashboard_Order_Returns', false )
				? Webino_Dashboard_Order_Returns::list_for_order( (int) $o->get_id() )
				: array(),
			'return_eligible'          => class_exists( 'Webino_Dashboard_Order_Returns', false )
				? Webino_Dashboard_Order_Returns::order_eligible( $o )
				: false,
			'return_address'           => class_exists( 'Webino_Dashboard_Order_Returns', false )
				? Webino_Dashboard_Order_Returns::return_address_text()
				: '',
			'date_created'             => $dc ? $dc->format( 'c' ) : null,
			'date_modified'            => $dm ? $dm->format( 'c' ) : null,
			'items'                    => $items_out,
			'is_pos'                   => '1' === (string) $o->get_meta( '_webino_pos_order' ) || 'webino_pos' === (string) $o->get_created_via(),
			'sales_channel'            => (string) $o->get_meta( '_webino_sales_channel' ),
			'created_by'               => (int) $o->get_meta( '_webino_created_by' ),
			'payment_tender'           => (string) $o->get_meta( '_webino_payment_tender' ),
			'amount_paid'              => (float) $o->get_meta( '_webino_amount_paid' ),
			'purchase_type'            => (string) $o->get_meta( '_wfcp_purchase_type' ),
			'warehouse_id'             => (int) $o->get_meta( '_webino_warehouse_id' ),
			'buyer_tax'                => ( static function ( $raw ) {
				$decoded = json_decode( (string) $raw, true );
				return is_array( $decoded ) ? $decoded : array();
			} )( $o->get_meta( '_webino_buyer_tax' ) ),
		);
	}

	/**
	 *
	 * @param WP_REST_Request $request Request.
	 * @return array<string, mixed>
	 */
	public static function query_args_from_request( $request ) {
		$page     = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$search   = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$raw_status = (string) $request->get_param( 'status' );
		$status     = sanitize_key( $raw_status );
		$group      = sanitize_key( (string) $request->get_param( 'group' ) );
		$orderby  = sanitize_key( (string) $request->get_param( 'orderby' ) ) ?: 'date';
		$order    = strtoupper( sanitize_key( (string) $request->get_param( 'order' ) ) ) === 'ASC' ? 'ASC' : 'DESC';
		$after    = sanitize_text_field( (string) $request->get_param( 'after' ) );
		$before   = sanitize_text_field( (string) $request->get_param( 'before' ) );

		$wc_orderby = 'date';
		$meta_key   = '';
		if ( 'id' === $orderby ) {
			$wc_orderby = 'ID';
		} elseif ( 'total' === $orderby ) {
			$wc_orderby = 'total';
		} elseif ( 'payment' === $orderby ) {
			$wc_orderby = 'meta_value';
			$meta_key   = '_payment_method';
		} elseif ( 'utm_source' === $orderby ) {
			$wc_orderby = 'meta_value';
			$meta_key   = '_wc_order_attribution_utm_source';
		} elseif ( 'status' === $orderby ) {
			$wc_orderby = 'status';
		}

		$args = array(
			'limit'    => $per_page,
			'page'     => $page,
			'orderby'  => $wc_orderby,
			'order'    => $order,
			'return'   => 'objects',
			'paginate' => true,
			'type'     => 'shop_order',
		);
		if ( $meta_key ) {
			$args['meta_key'] = $meta_key;
		}

		$group_map = self::get_portal_group_map();
		if ( isset( $group_map[ $group ] ) ) {
			$args['status'] = $group_map[ $group ];
		} elseif ( false !== strpos( $raw_status, ',' ) ) {
			$args['status'] = array_values( array_filter( array_map( 'sanitize_key', explode( ',', $raw_status ) ) ) );
		} elseif ( '' !== $status && 'all' !== $status ) {
			$args['status'] = $status;
		}

		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		if ( '' !== $after || '' !== $before ) {
			$args['date_created'] = self::build_date_query( $after, $before );
		}

		$meta_query = array();

		$marketplace = sanitize_key( (string) $request->get_param( 'marketplace' ) );
		if ( '' !== $marketplace ) {
			if ( 'basalam' === $marketplace ) {
				$meta_query[] = array(
					'relation' => 'OR',
					array(
						'key'   => '_wnc_platform',
						'value' => 'basalam',
					),
					array(
						'key'   => '_is_sync_basalam_order',
						'value' => '1',
					),
				);
			} elseif ( 'digikala' === $marketplace ) {
				$meta_query[] = array(
					'relation' => 'OR',
					array(
						'key'   => '_wnc_platform',
						'value' => 'digikala',
					),
					array(
						'key'     => '_digikala_order_id',
						'compare' => 'EXISTS',
					),
				);
			} else {
				$meta_query[] = array(
					'key'   => '_wnc_platform',
					'value' => $marketplace,
				);
			}
		}

		$payment = sanitize_text_field( (string) $request->get_param( 'payment_method' ) );
		if ( '' !== $payment ) {
			$args['payment_method'] = $payment;
		}

		$utm_source = sanitize_text_field( (string) $request->get_param( 'utm_source' ) );
		if ( '' !== $utm_source ) {
			$meta_query[] = array(
				'key'   => '_wc_order_attribution_utm_source',
				'value' => $utm_source,
			);
		}
		$utm_medium = sanitize_text_field( (string) $request->get_param( 'utm_medium' ) );
		if ( '' !== $utm_medium ) {
			$meta_query[] = array(
				'key'   => '_wc_order_attribution_utm_medium',
				'value' => $utm_medium,
			);
		}
		$utm_campaign = sanitize_text_field( (string) $request->get_param( 'utm_campaign' ) );
		if ( '' !== $utm_campaign ) {
			$meta_query[] = array(
				'key'   => '_wc_order_attribution_utm_campaign',
				'value' => $utm_campaign,
			);
		}

		$created_via = sanitize_text_field( (string) $request->get_param( 'created_via' ) );
		if ( '' !== $created_via ) {
			$args['created_via'] = $created_via;
		}

		$customer = sanitize_text_field( (string) $request->get_param( 'customer' ) );
		if ( '' !== $customer ) {
			if ( ctype_digit( $customer ) ) {
				$args['customer_id'] = (int) $customer;
			} elseif ( is_email( $customer ) ) {
				$args['billing_email'] = $customer;
			} else {
				$args['s'] = ( isset( $args['s'] ) ? $args['s'] . ' ' : '' ) . $customer;
			}
		}

		$customer_role = sanitize_key( (string) $request->get_param( 'customer_role' ) );
		if ( 'webino_partner' === $customer_role ) {
			$partner_ids = get_users(
				array(
					'role'   => 'webino_partner',
					'fields' => 'ID',
					'number' => 5000,
				)
			);
			$partner_ids = array_map( 'intval', (array) $partner_ids );
			if ( empty( $partner_ids ) ) {
				$args['customer_id'] = 0;
			} else {
				$args['customer'] = $partner_ids;
			}
		}

		$state = sanitize_text_field( (string) $request->get_param( 'state' ) );
		if ( '' !== $state ) {
			$meta_query[] = array(
				'relation' => 'OR',
				array(
					'key'   => '_shipping_state',
					'value' => $state,
				),
				array(
					'key'   => '_billing_state',
					'value' => $state,
				),
			);
		}

		$min_total = $request->get_param( 'min_total' );
		$max_total = $request->get_param( 'max_total' );
		if ( null !== $min_total && '' !== (string) $min_total ) {
			$args['total'] = (float) $min_total . '...';
		}
		if ( null !== $max_total && '' !== (string) $max_total ) {
			$max = (float) $max_total;
			if ( isset( $args['total'] ) && is_string( $args['total'] ) && false !== strpos( $args['total'], '...' ) ) {
				$args['total'] = (float) $min_total . '...' . $max;
			} else {
				$args['total'] = '...' . $max;
			}
		}

		$shipping_method = sanitize_text_field( (string) $request->get_param( 'shipping_method' ) );
		if ( '' !== $shipping_method ) {
			// Filtered after fetch when possible; also try method title meta.
			$args['_webino_shipping_method'] = $shipping_method;
		}

		$sales_channel = sanitize_key( (string) $request->get_param( 'sales_channel' ) );
		if ( '' !== $sales_channel ) {
			$meta_query[] = array(
				'key'   => '_webino_sales_channel',
				'value' => $sales_channel,
			);
		}

		$created_by = (int) $request->get_param( 'created_by' );
		if ( $created_by > 0 ) {
			$meta_query[] = array(
				'key'   => '_webino_created_by',
				'value' => (string) $created_by,
			);
		}

		$pos_only = $request->get_param( 'pos' );
		if ( '1' === (string) $pos_only || 'true' === (string) $pos_only ) {
			$meta_query[] = array(
				'key'   => '_webino_pos_order',
				'value' => '1',
			);
		}

		if ( $meta_query ) {
			if ( count( $meta_query ) > 1 ) {
				$meta_query['relation'] = 'AND';
			}
			$args['meta_query'] = $meta_query;
		}

		return $args;
	}

	/**
	 * List-page KPI stats for current date window (defaults last 30 days).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return array<string,mixed>
	 */
	public static function get_list_stats( $request ) {
		$after  = sanitize_text_field( (string) $request->get_param( 'after' ) );
		$before = sanitize_text_field( (string) $request->get_param( 'before' ) );
		if ( '' === $after && '' === $before ) {
			$after  = gmdate( 'Y-m-d', strtotime( '-29 days' ) );
			$before = gmdate( 'Y-m-d' );
		}
		$date = self::build_date_query( $after, $before );
		$base = array(
			'limit'        => -1,
			'return'       => 'ids',
			'type'         => 'shop_order',
			'date_created' => $date,
		);
		if ( class_exists( 'Webino_Dashboard_Rest_Base', false ) && Webino_Dashboard_Rest_Base::is_partner_portal_only() ) {
			$base['customer_id'] = get_current_user_id();
		}
		$status = sanitize_key( (string) $request->get_param( 'status' ) );
		$paid   = class_exists( 'Webino_Dashboard_Order_Reports' )
			? Webino_Dashboard_Order_Reports::default_statuses()
			: array( 'completed', 'processing' );
		if ( '' !== $status && 'all' !== $status ) {
			$base['status'] = $status;
		} else {
			// Revenue KPIs exclude unpaid (pending payment / on-hold).
			$base['status'] = $paid;
		}

		$ids = wc_get_orders( $base );
		if ( ! is_array( $ids ) ) {
			$ids = array();
		}
		$count      = count( $ids );
		$revenue    = 0.0;
		$processing = 0;
		$completed  = 0;
		$pending    = 0;
		$on_hold    = 0;
		// Cap detailed walk for performance.
		$walk = array_slice( $ids, 0, 2000 );
		foreach ( $walk as $oid ) {
			$o = wc_get_order( $oid );
			if ( ! $o ) {
				continue;
			}
			$revenue += (float) $o->get_total();
			$st       = $o->get_status();
			if ( 'processing' === $st ) {
				++$processing;
			} elseif ( 'completed' === $st ) {
				++$completed;
			} elseif ( 'pending' === $st ) {
				++$pending;
			} elseif ( 'on-hold' === $st ) {
				++$on_hold;
			}
		}
		if ( $count > count( $walk ) && class_exists( 'Webino_Dashboard_Order_Aggregates' ) ) {
			$agg = Webino_Dashboard_Order_Aggregates::sum_orders_in_range(
				array(
					'status'       => ! empty( $base['status'] ) ? $base['status'] : $paid,
					'date_created' => $date,
				),
				false,
				true
			);
			if ( is_array( $agg ) ) {
				$revenue = (float) ( $agg['revenue'] ?? $revenue );
				$count   = (int) ( $agg['order_count'] ?? $count );
			}
		}

		return array(
			'order_count'  => $count,
			'revenue'      => $revenue,
			'avg_order_value' => $count > 0 ? $revenue / $count : 0.0,
			'processing'   => $processing,
			'completed'    => $completed,
			'pending'      => $pending,
			'on_hold'      => $on_hold,
			'currency'     => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '',
		);
	}

	/**
	 * Filter dropdown options for orders list.
	 *
	 * @return array<string,mixed>
	 */
	public static function get_filter_options() {
		$payments = array();
		if ( function_exists( 'WC' ) && WC()->payment_gateways() ) {
			foreach ( WC()->payment_gateways()->payment_gateways() as $gw ) {
				$payments[] = array(
					'id'    => $gw->id,
					'title' => $gw->get_title() ?: $gw->id,
				);
			}
		}
		$states = array();
		$country = 'IR';
		if ( function_exists( 'wc_get_base_location' ) ) {
			$base = wc_get_base_location();
			if ( ! empty( $base['country'] ) ) {
				$country = (string) $base['country'];
			}
		}
		if ( function_exists( 'WC' ) && WC()->countries ) {
			$wc_states = WC()->countries->get_states( $country );
			if ( is_array( $wc_states ) ) {
				foreach ( $wc_states as $code => $label ) {
					$states[] = array(
						'code'  => (string) $code,
						'label' => (string) $label,
					);
				}
			}
		}
		if ( taxonomy_exists( 'state_city' ) ) {
			$terms = get_terms(
				array(
					'taxonomy'   => 'state_city',
					'hide_empty' => false,
					'parent'     => 0,
				)
			);
			if ( is_array( $terms ) ) {
				$seen = array();
				foreach ( $states as $s ) {
					$seen[ strtolower( $s['code'] ) ] = true;
				}
				foreach ( $terms as $term ) {
					if ( ! ( $term instanceof WP_Term ) ) {
						continue;
					}
					$code = (string) get_term_meta( $term->term_id, 'state_code', true );
					if ( '' === $code ) {
						$code = (string) $term->term_id;
					}
					$key = strtolower( $code );
					if ( isset( $seen[ $key ] ) ) {
						continue;
					}
					$seen[ $key ] = true;
					$states[]     = array(
						'code'  => $code,
						'label' => (string) $term->name,
					);
				}
			}
		}

		$marketplaces = array(
			array( 'id' => 'digikala', 'title' => 'Digikala' ),
			array( 'id' => 'basalam', 'title' => 'Basalam' ),
			array( 'id' => 'technolife', 'title' => 'Technolife' ),
			array( 'id' => 'tapsishop', 'title' => 'TapsiShop' ),
			array( 'id' => 'snappshop', 'title' => 'SnappShop' ),
			array( 'id' => 'torob', 'title' => 'Torob' ),
			array( 'id' => 'emalls', 'title' => 'Emalls' ),
			array( 'id' => 'snapppay-search', 'title' => 'SnappPay Search' ),
			array( 'id' => 'zarehbin', 'title' => 'Zarehbin' ),
		);

		return array(
			'payments'      => $payments,
			'states'        => $states,
			'shipping'      => self::get_shipping_method_options(),
			'marketplaces'  => $marketplaces,
		);
	}

	/**
	 * Enabled WooCommerce shipping methods for tracking provider select.
	 *
	 * @return array<int,array{id:string,title:string}>
	 */
	public static function get_shipping_method_options() {
		$out = array();
		if ( ! function_exists( 'WC' ) || ! WC()->shipping() ) {
			return $out;
		}
		$methods = WC()->shipping()->get_shipping_methods();
		foreach ( $methods as $id => $method ) {
			if ( ! is_object( $method ) ) {
				continue;
			}
			$enabled = true;
			if ( is_callable( array( $method, 'is_enabled' ) ) ) {
				$enabled = (bool) $method->is_enabled();
			} elseif ( isset( $method->enabled ) ) {
				$enabled = 'yes' === $method->enabled;
			}
			if ( ! $enabled ) {
				continue;
			}
			$title = is_callable( array( $method, 'get_method_title' ) )
				? (string) $method->get_method_title()
				: (string) $id;
			$out[] = array(
				'id'    => (string) $id,
				'title' => $title ?: (string) $id,
			);
		}
		$out[] = array(
			'id'    => 'other',
			'title' => __( 'Other', 'webino-dashboard' ),
		);
		return $out;
	}

	/**
	 * @param WC_Order $o Order.
	 * @param bool     $sync When true, refresh from CRM when cache is empty or stale.
	 * @return array<int,array<string,mixed>>
	 */
	public static function get_sms_log( $o, $sync = false ) {
		$raw = $o->get_meta( '_webino_sms_log' );
		if ( is_string( $raw ) && '' !== $raw ) {
			$decoded = json_decode( $raw, true );
			$raw     = is_array( $decoded ) ? $decoded : array();
		}
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		$log = array_values( $raw );
		if ( ! $sync ) {
			return $log;
		}
		return self::sync_sms_log_from_crm( $o, $log );
	}

	/**
	 * Pull order SMS rows from CRM and merge into local order meta cache.
	 *
	 * @param WC_Order                         $o     Order.
	 * @param array<int,array<string,mixed>> $local Local log.
	 * @return array<int,array<string,mixed>>
	 */
	private static function sync_sms_log_from_crm( $o, array $local ) {
		if ( ! class_exists( 'Webino_Dashboard_License', false ) ) {
			return $local;
		}
		$order_id  = (int) $o->get_id();
		$cache_key = 'webino_order_sms_sync_' . $order_id;
		$synced_at = (string) $o->get_meta( '_webino_sms_log_synced_at' );
		$stale     = '' === $synced_at || ( time() - (int) strtotime( $synced_at ) ) > 120;
		$empty     = empty( $local );
		if ( ! $empty && ! $stale && get_transient( $cache_key ) ) {
			return $local;
		}

		$license = Webino_Dashboard_License::instance();
		if ( ! $license->is_license_active( false ) ) {
			return $local;
		}

		$res = $license->crm_get(
			'wp-json/webinocrm/v1/modirpayamak/orders/messages',
			array( 'order_id' => $order_id ),
			array( 'timeout' => 8 )
		);
		if ( empty( $res['ok'] ) ) {
			set_transient( $cache_key, 1, 60 );
			return $local;
		}

		$data  = is_array( $res['data'] ?? null ) ? $res['data'] : array();
		$items = is_array( $data['items'] ?? null ) ? $data['items'] : array();
		if ( empty( $items ) && $empty ) {
			set_transient( $cache_key, 1, 60 );
			return $local;
		}

		$merged = self::merge_sms_log_entries( $local, $items );
		$o->update_meta_data( '_webino_sms_log', $merged );
		$o->update_meta_data( '_webino_sms_log_synced_at', gmdate( 'c' ) );
		if ( is_callable( array( $o, 'save_meta_data' ) ) ) {
			$o->save_meta_data();
		} else {
			$o->save();
		}
		set_transient( $cache_key, 1, 60 );
		return $merged;
	}

	/**
	 * @param array<int,array<string,mixed>> $local Local entries.
	 * @param array<int,array<string,mixed>> $crm   CRM entries.
	 * @return array<int,array<string,mixed>>
	 */
	private static function merge_sms_log_entries( array $local, array $crm ) {
		$out = array();
		foreach ( $crm as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$event = (string) ( $row['event_key'] ?? $row['event'] ?? '' );
			$out[] = array(
				'id'        => (int) ( $row['id'] ?? 0 ),
				'time'      => (string) ( $row['time'] ?? $row['created_at'] ?? gmdate( 'c' ) ),
				'status'    => sanitize_key( (string) ( $row['status'] ?? 'sent' ) ),
				'event'     => $event,
				'phone'     => (string) ( $row['phone'] ?? '' ),
				'role'      => (string) ( $row['recipient_role'] ?? '' ),
				'outbox_id' => (string) ( $row['outbox_id'] ?? '' ),
				'source'    => 'crm',
			);
		}

		foreach ( $local as $entry ) {
			if ( ! is_array( $entry ) ) {
				continue;
			}
			if ( self::sms_log_entry_has_crm_match( $entry, $out ) ) {
				continue;
			}
			$out[] = $entry;
		}

		usort(
			$out,
			static function ( $a, $b ) {
				return strcmp( (string) ( $a['time'] ?? '' ), (string) ( $b['time'] ?? '' ) );
			}
		);
		if ( count( $out ) > 50 ) {
			$out = array_slice( $out, -50 );
		}
		return array_values( $out );
	}

	/**
	 * @param array<string,mixed>            $entry Local entry.
	 * @param array<int,array<string,mixed>> $crm   CRM-mapped rows.
	 * @return bool
	 */
	private static function sms_log_entry_has_crm_match( array $entry, array $crm ) {
		$entry_id = (int) ( $entry['id'] ?? 0 );
		if ( $entry_id > 0 ) {
			foreach ( $crm as $crm_row ) {
				if ( $entry_id === (int) ( $crm_row['id'] ?? 0 ) ) {
					return true;
				}
			}
		}
		$event = (string) ( $entry['event'] ?? '' );
		$phone = (string) ( $entry['phone'] ?? '' );
		$time  = (string) ( $entry['time'] ?? '' );
		if ( '' === $event ) {
			return false;
		}
		foreach ( $crm as $crm_row ) {
			if ( $event !== (string) ( $crm_row['event'] ?? '' ) ) {
				continue;
			}
			if ( '' !== $phone && $phone !== (string) ( $crm_row['phone'] ?? '' ) ) {
				continue;
			}
			if ( '' !== $time && abs( strtotime( $time ) - strtotime( (string) ( $crm_row['time'] ?? '' ) ) ) > 600 ) {
				continue;
			}
			return true;
		}
		return false;
	}

	/**
	 * Format WFCP / line-item meta for dashboard order detail API.
	 *
	 * @param string   $key        Meta key.
	 * @param string   $value      Raw value.
	 * @param WC_Order $order      Order.
	 * @param bool     $staff_view Staff can see gateway id resolved to title.
	 * @return array{key:string,value:string}|null
	 */
	private static function format_order_item_meta_attribute( $key, $value, $order, $staff_view ) {
		$slug = ltrim( (string) $key, '_' );
		if ( '' === $slug || 'reduced_stock' === $slug ) {
			return null;
		}
		if ( 'wfcp_gateway' === $slug ) {
			if ( ! $staff_view ) {
				return null;
			}
			$gid    = sanitize_key( (string) $value );
			$title  = '';
			if ( function_exists( 'WC' ) && WC()->payment_gateways() ) {
				$gateways = WC()->payment_gateways()->payment_gateways();
				if ( isset( $gateways[ $gid ] ) ) {
					$title = (string) $gateways[ $gid ]->get_title();
				}
			}
			if ( '' === $title ) {
				return null;
			}
			return array(
				'key'   => 'wfcp_gateway',
				'value' => $title,
			);
		}
		if ( 'wfcp_installment_months' === $slug ) {
			$months = (int) $value;
			if ( $months <= 0 ) {
				return null;
			}
			return array(
				'key'   => 'wfcp_installment_months',
				'value' => sprintf(
					/* translators: %d: installment month count */
					_n( '%d month', '%d months', $months, 'webino-dashboard' ),
					$months
				),
			);
		}
		if ( 'wfcp_installment_total' === $slug ) {
			$amount = (float) $value;
			if ( $amount <= 0 ) {
				return null;
			}
			return array(
				'key'   => 'wfcp_installment_total',
				'value' => wp_strip_all_tags( wc_price( $amount, array( 'currency' => $order->get_currency() ) ) ),
			);
		}
		if ( 'wfcp_purchase_type' === $slug ) {
			$labels = array(
				'cash'        => __( 'نقدی', 'webino-dashboard' ),
				'credit'      => __( 'اعتباری', 'webino-dashboard' ),
				'installment' => __( 'اقساطی', 'webino-dashboard' ),
				'wholesale'   => __( 'عمده', 'webino-dashboard' ),
			);
			$type = sanitize_key( (string) $value );
			return array(
				'key'   => 'wfcp_purchase_type',
				'value' => $labels[ $type ] ?? (string) $value,
			);
		}
		return array(
			'key'   => $slug,
			'value' => wp_strip_all_tags( (string) $value ),
		);
	}

	/**
	 * @param WC_Order $o Order.
	 * @return array<int,array<string,mixed>>
	 */
	public static function get_sms_log_local( $o ) {
		return self::get_sms_log( $o, false );
	}

	/**
	 * Append an SMS log entry on the order.
	 *
	 * @param WC_Order|int $order Order.
	 * @param array<string,mixed> $entry Entry.
	 * @return void
	 */
	public static function append_sms_log( $order, $entry ) {
		$o = is_a( $order, 'WC_Order' ) ? $order : wc_get_order( $order );
		if ( ! $o ) {
			return;
		}
		$log   = self::get_sms_log( $o, false );
		$log[] = array_merge(
			array(
				'time'   => gmdate( 'c' ),
				'status' => 'sent',
				'event'  => '',
				'phone'  => '',
			),
			$entry
		);
		if ( count( $log ) > 50 ) {
			$log = array_slice( $log, -50 );
		}
		$o->update_meta_data( '_webino_sms_log', $log );
		$o->save();
	}

	/**
	 * Post-filter shipping method when WC query cannot.
	 *
	 * @param WC_Order[] $orders Orders.
	 * @param string     $method Method id or title fragment.
	 * @return WC_Order[]
	 */
	public static function filter_orders_by_shipping_method( $orders, $method ) {
		$method = trim( (string) $method );
		if ( '' === $method || ! is_array( $orders ) ) {
			return $orders;
		}
		$out = array();
		foreach ( $orders as $o ) {
			if ( ! is_a( $o, 'WC_Order' ) ) {
				continue;
			}
			$title = strtolower( self::get_shipping_method_title( $o ) );
			$match = false;
			foreach ( $o->get_shipping_methods() as $sm ) {
				if ( strtolower( (string) $sm->get_method_id() ) === strtolower( $method )
					|| false !== strpos( strtolower( (string) $sm->get_name() ), strtolower( $method ) ) ) {
					$match = true;
					break;
				}
			}
			if ( ! $match && false !== strpos( $title, strtolower( $method ) ) ) {
				$match = true;
			}
			if ( $match ) {
				$out[] = $o;
			}
		}
		return $out;
	}

	/**
	 * @param string $after After ISO date.
	 * @param string $before Before ISO date.
	 * @return string
	 */
	private static function build_date_query( $after, $before ) {
		$after_ts  = $after ? strtotime( $after ) : false;
		$before_ts = $before ? strtotime( $before ) : false;
		if ( $after_ts && $before_ts ) {
			return gmdate( 'Y-m-d', $after_ts ) . '...' . gmdate( 'Y-m-d', $before_ts );
		}
		if ( $after_ts ) {
			return gmdate( 'Y-m-d', $after_ts ) . '...';
		}
		if ( $before_ts ) {
			return '...' . gmdate( 'Y-m-d', $before_ts );
		}
		return '';
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_action( $request ) {
		if ( ! self::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$action = sanitize_key( (string) $request->get_param( 'action' ) );
		$ids    = $request->get_param( 'ids' );
		if ( ! is_array( $ids ) || array() === $ids ) {
			return new WP_Error( 'invalid', __( 'No orders selected.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$ids = array_map( 'intval', $ids );
		$results = array( 'ok' => 0, 'failed' => 0 );

		foreach ( $ids as $id ) {
			$o = wc_get_order( $id );
			if ( ! $o ) {
				++$results['failed'];
				continue;
			}
			$ok = false;
			switch ( $action ) {
				case 'change_status':
					$st = sanitize_key( (string) $request->get_param( 'status' ) );
					if ( $st ) {
						$result = $o->update_status( $st );
						if ( is_wp_error( $result ) ) {
							++$results['failed'];
							continue 2;
						}
						$ok = true;
					}
					break;
				case 'trash':
					$ok = wp_trash_post( $id ) !== false;
					break;
				case 'untrash':
					$ok = wp_untrash_post( $id ) !== false;
					break;
				case 'delete':
					$ok = wp_delete_post( $id, true ) !== false;
					break;
				case 'send_email':
					$email_type = sanitize_key( (string) $request->get_param( 'email_type' ) );
					$ok         = self::send_order_email( $o, $email_type );
					break;
				default:
					break;
			}
			if ( $ok ) {
				++$results['ok'];
			} else {
				++$results['failed'];
			}
		}
		return new WP_REST_Response( $results );
	}

	/**
	 * @param WC_Order $o Order.
	 * @param string   $email_type Email type slug.
	 * @return bool
	 */
	private static function send_order_email( $o, $email_type ) {
		if ( ! function_exists( 'WC' ) || ! WC()->mailer() ) {
			return false;
		}
		$map = array(
			'customer_invoice'           => 'WC_Email_Customer_Invoice',
			'customer_completed_order'     => 'WC_Email_Customer_Completed_Order',
			'customer_processing_order'    => 'WC_Email_Customer_Processing_Order',
			'customer_on_hold_order'       => 'WC_Email_Customer_On_Hold_Order',
			'customer_refunded_order'      => 'WC_Email_Customer_Refunded_Order',
			'customer_note'              => 'WC_Email_Customer_Note',
		);
		if ( ! isset( $map[ $email_type ] ) || ! class_exists( $map[ $email_type ] ) ) {
			return false;
		}
		$mailer = WC()->mailer();
		$emails = $mailer->get_emails();
		foreach ( $emails as $email ) {
			if ( $email instanceof $map[ $email_type ] ) {
				$email->trigger( $o->get_id(), $o );
				return true;
			}
		}
		$instance = new $map[ $email_type ]();
		if ( method_exists( $instance, 'trigger' ) ) {
			$instance->trigger( $o->get_id(), $o );
			return true;
		}
		return false;
	}
}
