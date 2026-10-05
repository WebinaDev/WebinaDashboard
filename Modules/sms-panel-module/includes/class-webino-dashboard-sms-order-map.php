<?php
/**
 * WooCommerce order status → SMS event_key mapping.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps WC statuses and custom hooks to CRM event keys.
 */
final class Webino_Dashboard_Sms_Order_Map {

	/**
	 * Display order for the SMS pattern matrix (priority first).
	 *
	 * @return array<int,string>
	 */
	public static function preferred_event_order() {
		return array(
			'pending_on_create',
			'pending_on_status',
			'on-hold',
			'processing',
			'packaged',
			'sent-to-warehouse',
			'courier',
			'post',
			'tipax',
			'chapar',
			'other',
			'completed',
			'cancelled',
			'failed',
			'refunded',
			'checkout-draft',
			'cart-abandoned',
			'order-abandoned',
			'user-welcome',
			'stock-low',
			'stock-out',
			'pos-payment-link',
			'return-requested',
			'return-approved',
			'return-rejected',
			'return-parcel-received',
			'return-refund',
			'return-exchange',
		);
	}

	/**
	 * Well-known aliases (WC slug → event_key) for backwards compatibility.
	 *
	 * @return array<string,string>
	 */
	public static function status_to_event() {
		return array(
			'pending'           => 'pending_on_status',
			'processing'        => 'processing',
			'on-hold'           => 'on-hold',
			'completed'         => 'completed',
			'cancelled'         => 'cancelled',
			'refunded'          => 'refunded',
			'failed'            => 'failed',
			'draft'             => 'checkout-draft',
			'checkout-draft'    => 'checkout-draft',
		);
	}

	/**
	 * Custom statuses used by Webina shops (slug may vary; filterable).
	 *
	 * @return array<string,string>
	 */
	public static function custom_status_to_event() {
		$canonical = array(
			'sent-to-warehouse' => array(
				'sent-to-warehouse',
				'sent_to_warehouse',
				'sent-warehouse',
				'sent_warehouse',
				'warehouse',
				'to-warehouse',
				'to_warehouse',
				'pws-sent-to-warehouse',
				'pws-sent_to_warehouse',
				'pws-warehouse',
			),
			'packaged'          => array(
				'packaged',
				'packed',
				'packing',
				'package',
				'packaging',
				'pws-packaged',
				'pws-packed',
			),
			'courier'           => array(
				'courier',
				'peyk',
				'pik',
				'delivery-courier',
				'courier-delivery',
				'courier_delivery',
				'pws-courier',
				'pws-peyk',
				'pws-pik',
			),
			'post'              => array(
				'post',
				'postal',
				'post-office',
				'post_office',
				'postage',
				'pws-post',
				'pws-postal',
			),
			'tipax'             => array(
				'tipax',
				'tipax-delivery',
				'tipax_delivery',
				'pws-tipax',
			),
			'chapar'            => array(
				'chapar',
				'chapar-delivery',
				'chapar_delivery',
				'pws-chapar',
				'webino-chapar',
			),
			'other'             => array(
				'other',
				'tracking-other',
				'tracking_other',
			),
		);
		$map = array();
		foreach ( $canonical as $event => $aliases ) {
			foreach ( $aliases as $alias ) {
				$map[ $alias ]           = $event;
				$map[ 'wc-' . $alias ]   = $event;
			}
		}
		return apply_filters( 'webino_dashboard_sms_custom_status_map', $map );
	}

	/**
	 * Persian labels for known order statuses (SMS + catalog fallback).
	 *
	 * @return array<string,string>
	 */
	public static function status_labels_fa() {
		return array(
			'pending'              => 'در انتظار پرداخت',
			'pending_on_status'    => 'در انتظار پرداخت',
			'pending_on_create'    => 'در انتظار پرداخت',
			'on-hold'              => 'در انتظار بررسی',
			'processing'           => 'در حال انجام',
			'packaged'             => 'بسته‌بندی شده',
			'sent-to-warehouse'    => 'ارسال شده به انبار',
			'courier'              => 'تحویل پیک',
			'post'                 => 'تحویل پست',
			'tipax'                => 'تحویل تیپاکس',
			'chapar'               => 'تحویل چاپار',
			'other'                => 'سایر (رهگیری)',
			'completed'            => 'تکمیل شده',
			'cancelled'            => 'لغو شده',
			'failed'               => 'ناموفق',
			'refunded'             => 'مسترد شده',
			'checkout-draft'       => 'پیش‌نویس',
			'draft'                => 'پیش‌نویس',
			'pos-payment-link'     => 'لینک پرداخت صندوق',
			'return-requested'     => 'درخواست مرجوعی',
			'return-approved'      => 'تأیید مرجوعی',
			'return-rejected'      => 'رد مرجوعی',
			'return-parcel-received' => 'دریافت مرسوله مرجوعی',
			'return-refund'        => 'استرداد مرجوعی',
			'return-exchange'      => 'تعویض کالا',
		);
	}

	/**
	 * Map a WooCommerce / custom status label to a canonical event key.
	 *
	 * @param string $label Status label.
	 * @return string Empty when no match.
	 */
	public static function event_key_from_label( $label ) {
		$normalized = self::normalize_fa_label( $label );
		if ( '' === $normalized ) {
			return '';
		}
		$aliases = array(
			'ارسال شده به انبار' => 'sent-to-warehouse',
			'ارسال به انبار'     => 'sent-to-warehouse',
			'بسته بندی شده'      => 'packaged',
			'بسته‌بندی شده'      => 'packaged',
			'بسته‌بندی‌شده'      => 'packaged',
			'بسته بندی'          => 'packaged',
			'بسته‌بندی'          => 'packaged',
			'تحویل پیک'          => 'courier',
			'پیک'                => 'courier',
			'تحویل پست'          => 'post',
			'پست'                => 'post',
			'تحویل تیپاکس'       => 'tipax',
			'تیپاکس'             => 'tipax',
			'تحویل چاپار'        => 'chapar',
			'چاپار'              => 'chapar',
			'سایر'               => 'other',
			'sent to warehouse'  => 'sent-to-warehouse',
			'packaged'           => 'packaged',
			'courier delivery'   => 'courier',
			'courier'            => 'courier',
			'post delivery'      => 'post',
			'post'               => 'post',
			'tipax delivery'     => 'tipax',
			'tipax'              => 'tipax',
			'chapar delivery'    => 'chapar',
			'chapar'             => 'chapar',
			'other'              => 'other',
		);
		foreach ( $aliases as $alias => $event ) {
			if ( self::normalize_fa_label( $alias ) === $normalized ) {
				return $event;
			}
		}
		return '';
	}

	/**
	 * Collapse ZWNJ/spaces and Arabic variants for label matching.
	 *
	 * @param string $label Raw label.
	 * @return string
	 */
	public static function normalize_fa_label( $label ) {
		$s = wp_strip_all_tags( (string) $label );
		$s = html_entity_decode( $s, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$s = str_replace( array( "\xE2\x80\x8C", "\xC2\xA0", 'ي', 'ك' ), array( ' ', ' ', 'ی', 'ک' ), $s );
		$s = preg_replace( '/\s+/u', ' ', $s );
		return trim( strtolower( (string) $s ) );
	}

	/**
	 * Whether a string contains Persian/Arabic letters.
	 *
	 * @param string $text Text.
	 * @return bool
	 */
	public static function contains_persian( $text ) {
		return (bool) preg_match( '/\p{Arabic}/u', (string) $text );
	}

	/**
	 * Persian (or already-localized) label for an order status slug.
	 *
	 * @param string $slug WC status slug (no wc- prefix).
	 * @param string $wc_label Optional WC label.
	 * @return string
	 */
	public static function persian_status_label( $slug, $wc_label = '' ) {
		$slug     = sanitize_key( (string) $slug );
		if ( str_starts_with( $slug, 'wc-' ) ) {
			$slug = substr( $slug, 3 );
		}
		$wc_label = wp_strip_all_tags( (string) $wc_label );
		if ( '' !== $wc_label && self::contains_persian( $wc_label ) ) {
			return $wc_label;
		}
		$map = self::status_labels_fa();
		if ( isset( $map[ $slug ] ) ) {
			return $map[ $slug ];
		}
		$canonical = self::event_for_status( $slug, $wc_label );
		if ( isset( $map[ $canonical ] ) ) {
			return $map[ $canonical ];
		}
		if ( '' !== $wc_label ) {
			return $wc_label;
		}
		return $slug;
	}

	/**
	 * Extra (non-status) SMS events with labels.
	 *
	 * @return array<string,array{key:string,label:string,kind:string}>
	 */
	public static function extra_events_by_key() {
		$rows = array(
			'pending_on_create' => array(
				'key'   => 'pending_on_create',
				'label' => __( 'Pending payment (order created)', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'cart-abandoned'    => array(
				'key'   => 'cart-abandoned',
				'label' => __( 'Abandoned cart', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'order-abandoned'   => array(
				'key'   => 'order-abandoned',
				'label' => __( 'Abandoned unpaid order', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'user-welcome'      => array(
				'key'   => 'user-welcome',
				'label' => __( 'Welcome after registration', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'stock-low'         => array(
				'key'   => 'stock-low',
				'label' => __( 'Low stock', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'stock-out'         => array(
				'key'   => 'stock-out',
				'label' => __( 'Out of stock', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'return-requested'  => array(
				'key'   => 'return-requested',
				'label' => __( 'Return requested', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'return-approved'   => array(
				'key'   => 'return-approved',
				'label' => __( 'Return approved', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'return-rejected'   => array(
				'key'   => 'return-rejected',
				'label' => __( 'Return rejected', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'return-parcel-received' => array(
				'key'   => 'return-parcel-received',
				'label' => __( 'Return parcel received', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'return-refund'     => array(
				'key'   => 'return-refund',
				'label' => __( 'Return refunded', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
			'return-exchange'   => array(
				'key'   => 'return-exchange',
				'label' => __( 'Return exchanged', 'webino-dashboard' ),
				'kind'  => 'extra',
			),
		);
		return $rows;
	}

	/**
	 * Extra (non-status) SMS events.
	 *
	 * @return array<int,array{key:string,label:string,kind:string}>
	 */
	public static function extra_events() {
		return array_values( self::extra_events_by_key() );
	}

	/**
	 * Map legacy event keys (e.g. post-barcode) to current keys.
	 *
	 * @param string $event_key Event key.
	 * @return string
	 */
	public static function normalize_event_key( $event_key ) {
		$key = sanitize_key( (string) $event_key );
		if ( '' === $key ) {
			return '';
		}
		if ( 'post-barcode' === $key ) {
			return 'post';
		}
		$mapped = self::event_for_status( $key );
		if ( '' !== $mapped && $mapped !== $key ) {
			return $mapped;
		}
		if ( str_starts_with( $key, 'pws-' ) ) {
			$stripped = self::event_for_status( substr( $key, 4 ) );
			if ( '' !== $stripped && $stripped !== substr( $key, 4 ) ) {
				return $stripped;
			}
		}
		return $key;
	}

	/**
	 * @param string $status Order status slug (with or without wc- prefix).
	 * @param string $label Optional WC label used to alias duplicate custom statuses.
	 * @return string Event key (never null for a non-empty status).
	 */
	public static function event_for_status( $status, $label = '' ) {
		$status = sanitize_key( (string) $status );
		if ( '' === $status ) {
			return '';
		}
		if ( str_starts_with( $status, 'wc-' ) ) {
			$status = substr( $status, 3 );
		}
		$all = array_merge( self::status_to_event(), self::custom_status_to_event() );
		if ( isset( $all[ $status ] ) ) {
			return $all[ $status ];
		}
		if ( isset( $all[ 'wc-' . $status ] ) ) {
			return $all[ 'wc-' . $status ];
		}
		$hyphen = str_replace( '_', '-', $status );
		if ( $hyphen !== $status && isset( $all[ $hyphen ] ) ) {
			return $all[ $hyphen ];
		}
		if ( '' === $label && function_exists( 'wc_get_order_statuses' ) ) {
			$statuses = wc_get_order_statuses();
			$label    = (string) ( $statuses[ 'wc-' . $status ] ?? $statuses[ $status ] ?? '' );
		}
		$from_label = self::event_key_from_label( $label );
		if ( '' !== $from_label ) {
			return $from_label;
		}
		return $status;
	}

	/**
	 * Default label for a known preferred key when WC has no label yet.
	 *
	 * @param string $key Event key.
	 * @return string
	 */
	private static function default_label_for_key( $key ) {
		$extras = self::extra_events_by_key();
		if ( isset( $extras[ $key ] ) ) {
			return (string) $extras[ $key ]['label'];
		}
		$fa = self::status_labels_fa();
		if ( isset( $fa[ $key ] ) ) {
			return $fa[ $key ];
		}
		$labels = array(
			'pending_on_status' => __( 'Pending payment (status change)', 'webino-dashboard' ),
			'checkout-draft'    => __( 'Draft', 'webino-dashboard' ),
		);
		return $labels[ $key ] ?? $key;
	}

	/**
	 * Full event catalog for UI + CRM sync: preferred order, then other WC statuses.
	 *
	 * @return array<int,array{key:string,label:string,kind:string}>
	 */
	public static function event_catalog() {
		$by_key = array();

		foreach ( self::extra_events_by_key() as $key => $row ) {
			$by_key[ $key ] = array(
				'key'   => $key,
				'label' => (string) $row['label'],
				'kind'  => 'extra',
			);
		}

		$wc_statuses = function_exists( 'wc_get_order_statuses' ) ? wc_get_order_statuses() : array();
		foreach ( $wc_statuses as $wc_key => $label ) {
			$slug = str_replace( 'wc-', '', sanitize_key( (string) $wc_key ) );
			if ( '' === $slug ) {
				continue;
			}
			$event_key = self::event_for_status( $slug, (string) $label );
			if ( '' === $event_key ) {
				continue;
			}
			$kind = isset( self::extra_events_by_key()[ $event_key ] ) ? 'extra' : 'status';
			if ( ! isset( $by_key[ $event_key ] ) ) {
				$by_key[ $event_key ] = array(
					'key'   => $event_key,
					'label' => self::persian_status_label( $event_key, (string) $label ),
					'kind'  => $kind,
				);
			} elseif ( 'status' === $kind && 'extra' !== ( $by_key[ $event_key ]['kind'] ?? '' ) ) {
				$by_key[ $event_key ]['label'] = self::persian_status_label( $event_key, (string) $label );
			}
		}

		foreach ( array_unique( array_values( self::custom_status_to_event() ) ) as $key ) {
			$key = sanitize_key( $key );
			if ( '' === $key || isset( $by_key[ $key ] ) ) {
				continue;
			}
			$by_key[ $key ] = array(
				'key'   => $key,
				'label' => self::default_label_for_key( $key ),
				'kind'  => 'status',
			);
		}

		foreach ( self::preferred_event_order() as $key ) {
			if ( isset( $by_key[ $key ] ) ) {
				continue;
			}
			$kind               = isset( self::extra_events_by_key()[ $key ] ) ? 'extra' : 'status';
			$by_key[ $key ] = array(
				'key'   => $key,
				'label' => self::default_label_for_key( $key ),
				'kind'  => $kind,
			);
		}

		$merged = array();
		foreach ( $by_key as $key => $row ) {
			$canonical = self::normalize_event_key( $key );
			if ( '' === $canonical ) {
				continue;
			}
			$row['key'] = $canonical;
			if ( ! isset( $merged[ $canonical ] ) ) {
				$merged[ $canonical ] = $row;
				continue;
			}
			if ( 'status' === ( $row['kind'] ?? '' ) && 'extra' !== ( $merged[ $canonical ]['kind'] ?? '' ) ) {
				$merged[ $canonical ]['label'] = (string) ( $row['label'] ?? $merged[ $canonical ]['label'] );
			}
		}
		$by_key = $merged;

		$catalog = array();
		$seen    = array();
		foreach ( self::preferred_event_order() as $key ) {
			if ( ! isset( $by_key[ $key ] ) || isset( $seen[ $key ] ) ) {
				continue;
			}
			$seen[ $key ] = true;
			$catalog[]    = $by_key[ $key ];
		}
		foreach ( $by_key as $key => $row ) {
			if ( isset( $seen[ $key ] ) ) {
				continue;
			}
			$canonical = self::normalize_event_key( $key );
			if ( '' !== $canonical && isset( $seen[ $canonical ] ) ) {
				continue;
			}
			$alias = self::event_key_from_label( (string) ( $row['label'] ?? '' ) );
			if ( '' !== $alias && isset( $seen[ $alias ] ) ) {
				continue;
			}
			$seen[ $key ] = true;
			if ( '' !== $canonical ) {
				$seen[ $canonical ] = true;
			}
			$catalog[]    = $row;
		}

		return apply_filters( 'webino_dashboard_sms_event_catalog', $catalog );
	}

	/**
	 * @return array<int,string> All known event keys (catalog + legacy defaults).
	 */
	public static function all_event_keys() {
		$keys = array();
		foreach ( self::event_catalog() as $row ) {
			$keys[] = $row['key'];
		}
		return array_values( array_unique( $keys ) );
	}
}
