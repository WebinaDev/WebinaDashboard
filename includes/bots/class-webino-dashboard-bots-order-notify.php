<?php
/**
 * Shop order / stock / newsletter notifications for Telegram and Bale (SMS parity).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dispatches templated bot messages on the same WooCommerce events as shop SMS.
 */
final class Webino_Dashboard_Bots_Order_Notify {

	const META_TG_CHAT   = 'webino_dashboard_telegram_chat_id';
	const META_BALE_CHAT = 'woobale_chat_id';
	const META_TG_OPT    = 'webino_dashboard_telegram_newsletter_opt_in';
	const META_BALE_OPT  = 'webino_dashboard_bale_newsletter_opt_in';

	/** @var array<string,bool> Structured sends in this request (provider|event|order). */
	private static $sent_flags = array();

	/**
	 * @return void
	 */
	public static function init() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}
		add_action( 'woocommerce_checkout_order_processed', array( __CLASS__, 'on_checkout_processed' ), 25, 1 );
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'on_status_changed' ), 25, 4 );
		add_action( 'webino_dashboard_order_post_barcode_saved', array( __CLASS__, 'on_post_barcode' ), 15, 2 );
		add_action( 'woocommerce_low_stock', array( __CLASS__, 'on_wc_low_stock' ), 15, 1 );
		add_action( 'woocommerce_no_stock', array( __CLASS__, 'on_wc_no_stock' ), 15, 1 );
		add_action( 'webino_dashboard_product_stock_low', array( __CLASS__, 'on_stock_low' ), 15, 2 );
		add_action( 'webino_dashboard_product_stock_out', array( __CLASS__, 'on_stock_out' ), 15, 2 );
	}

	/**
	 * Whether structured shop notify already handled a WC status transition for a provider.
	 *
	 * @param string $provider telegram|bale.
	 * @param int    $order_id Order id.
	 * @param string $status   WC status slug.
	 * @return bool
	 */
	public static function handled_status( $provider, $order_id, $status ) {
		$event = self::event_for_status( $status );
		if ( '' === $event ) {
			return false;
		}
		$key = sanitize_key( $provider ) . '|' . $event . '|' . (int) $order_id;
		if ( ! empty( self::$sent_flags[ $key ] ) ) {
			return true;
		}
		$sn = self::get_shop_notify( $provider );
		if ( empty( $sn['enabled'] ) || '0' === (string) $sn['enabled'] ) {
			return false;
		}
		$ev = isset( $sn['events'][ $event ] ) && is_array( $sn['events'][ $event ] ) ? $sn['events'][ $event ] : array();
		$customer_on = ! empty( $ev['customer'] );
		$admin_on    = ! empty( $ev['admin'] );
		if ( ! $customer_on && ! $admin_on ) {
			return false;
		}
		$cust_body = self::template_body( $sn, 'order_customer', $event );
		$adm_body  = self::template_body( $sn, 'order_admin', $event );
		return ( $customer_on && '' !== $cust_body ) || ( $admin_on && '' !== $adm_body );
	}

	/**
	 * @param string $provider telegram|bale.
	 * @return array<string,mixed>
	 */
	public static function get_shop_notify( $provider ) {
		$raw = self::raw_settings( $provider );
		return self::normalize_shop_notify( is_array( $raw ) ? $raw : array() );
	}

	/**
	 * Defaults + migrate legacy notify_status / order_status_templates.
	 *
	 * @param array<string,mixed> $settings Full provider settings.
	 * @return array<string,mixed>
	 */
	public static function normalize_shop_notify( array $settings ) {
		$defaults = self::default_shop_notify();
		$sn       = isset( $settings['shop_notify'] ) && is_array( $settings['shop_notify'] ) ? $settings['shop_notify'] : array();
		$out      = array_merge( $defaults, $sn );

		if ( ! isset( $out['events'] ) || ! is_array( $out['events'] ) ) {
			$out['events'] = array();
		}
		if ( ! isset( $out['templates'] ) || ! is_array( $out['templates'] ) ) {
			$out['templates'] = array(
				'order_customer' => array(),
				'order_admin'    => array(),
			);
		}
		if ( ! isset( $out['templates']['order_customer'] ) || ! is_array( $out['templates']['order_customer'] ) ) {
			$out['templates']['order_customer'] = array();
		}
		if ( ! isset( $out['templates']['order_admin'] ) || ! is_array( $out['templates']['order_admin'] ) ) {
			$out['templates']['order_admin'] = array();
		}
		if ( ! isset( $out['admin_chat_ids'] ) || ! is_array( $out['admin_chat_ids'] ) ) {
			$out['admin_chat_ids'] = array();
		}
		if ( ! isset( $out['newsletter'] ) || ! is_array( $out['newsletter'] ) ) {
			$out['newsletter'] = $defaults['newsletter'];
		} else {
			$out['newsletter'] = array_merge( $defaults['newsletter'], $out['newsletter'] );
		}

		$migrated = ! empty( $out['migrated_from_legacy'] );
		if ( ! $migrated ) {
			$legacy_notify = isset( $settings['notify_status'] ) && is_array( $settings['notify_status'] ) ? $settings['notify_status'] : array();
			$legacy_tpl    = isset( $settings['order_status_templates'] ) && is_array( $settings['order_status_templates'] ) ? $settings['order_status_templates'] : array();
			foreach ( $legacy_notify as $st => $on ) {
				$st = sanitize_key( str_replace( 'wc-', '', (string) $st ) );
				if ( '' === $st ) {
					continue;
				}
				$event = self::event_for_status( $st );
				if ( '' === $event ) {
					$event = $st;
				}
				if ( ! isset( $out['events'][ $event ] ) ) {
					$out['events'][ $event ] = array(
						'customer' => ! empty( $on ) && '0' !== (string) $on,
						'admin'    => false,
					);
				} elseif ( ! empty( $on ) && '0' !== (string) $on ) {
					$out['events'][ $event ]['customer'] = true;
				}
			}
			foreach ( $legacy_tpl as $st => $body ) {
				$st = sanitize_key( str_replace( 'wc-', '', (string) $st ) );
				if ( '' === $st || '' === trim( (string) $body ) ) {
					continue;
				}
				$event = self::event_for_status( $st );
				if ( '' === $event ) {
					$event = $st;
				}
				if ( empty( $out['templates']['order_customer'][ $event ] ) ) {
					$out['templates']['order_customer'][ $event ] = (string) $body;
				}
			}
			// Seed admin chats from legacy bot_admin_chat_ids / support_notify_chat_id.
			if ( empty( $out['admin_chat_ids'] ) ) {
				$ids = array();
				if ( ! empty( $settings['bot_admin_chat_ids'] ) ) {
					$parts = preg_split( '/[\s,;]+/', (string) $settings['bot_admin_chat_ids'] );
					if ( is_array( $parts ) ) {
						foreach ( $parts as $p ) {
							$p = trim( (string) $p );
							if ( '' !== $p ) {
								$ids[] = $p;
							}
						}
					}
				}
				if ( ! empty( $settings['support_notify_chat_id'] ) ) {
					$ids[] = trim( (string) $settings['support_notify_chat_id'] );
				}
				$out['admin_chat_ids'] = array_values( array_unique( array_slice( $ids, 0, 5 ) ) );
			}
			$out['migrated_from_legacy'] = true;
		}

		$out['enabled'] = ! empty( $out['enabled'] ) && '0' !== (string) $out['enabled'];
		$out['admin_chat_ids'] = array_values(
			array_slice(
				array_filter(
					array_map(
						static function ( $id ) {
							return sanitize_text_field( (string) $id );
						},
						$out['admin_chat_ids']
					)
				),
				0,
				5
			)
		);

		self::seed_default_templates( $out );

		return $out;
	}

	/**
	 * Fill empty bot templates with per-event Persian defaults for UI and delivery.
	 *
	 * @param array<string,mixed> $out Shop notify settings.
	 * @return void
	 */
	private static function seed_default_templates( array &$out ) {
		if ( ! class_exists( 'Webino_Dashboard_Notify_Copy', false ) ) {
			return;
		}
		$keys = class_exists( 'Webino_Dashboard_Sms_Order_Map', false )
			? Webino_Dashboard_Sms_Order_Map::all_event_keys()
			: array_keys( $out['events'] ?? array() );
		if ( ! $keys ) {
			$keys = array( 'pending_on_create', 'processing', 'completed' );
		}
		foreach ( $keys as $key ) {
			$key = Webino_Dashboard_Notify_Copy::canonical_event_key( (string) $key );
			if ( '' === $key ) {
				continue;
			}
			foreach ( array( 'order_customer', 'order_admin' ) as $scope ) {
				$current = trim( (string) ( $out['templates'][ $scope ][ $key ] ?? '' ) );
				if ( '' === $current ) {
					$out['templates'][ $scope ][ $key ] = Webino_Dashboard_Notify_Copy::bot_template( $scope, $key );
				}
			}
		}
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function default_shop_notify() {
		return array(
			'enabled'              => false,
			'admin_chat_ids'       => array(),
			'events'               => array(),
			'templates'            => array(
				'order_customer' => array(),
				'order_admin'    => array(),
			),
			'newsletter'           => array(
				'enabled'          => false,
				'message_template' => '',
				'notify_admin'     => false,
			),
			'migrated_from_legacy' => false,
		);
	}

	/**
	 * Sanitize shop_notify blob for settings save.
	 *
	 * @param mixed $input Raw shop_notify.
	 * @return array<string,mixed>
	 */
	public static function sanitize_shop_notify( $input ) {
		$base = self::default_shop_notify();
		if ( ! is_array( $input ) ) {
			return $base;
		}
		$out              = $base;
		$out['enabled']   = ! empty( $input['enabled'] ) && '0' !== (string) $input['enabled'];
		$out['migrated_from_legacy'] = true;
		$ids              = isset( $input['admin_chat_ids'] ) && is_array( $input['admin_chat_ids'] ) ? $input['admin_chat_ids'] : array();
		$clean_ids        = array();
		foreach ( $ids as $id ) {
			$id = sanitize_text_field( (string) $id );
			if ( '' !== $id ) {
				$clean_ids[] = $id;
			}
			if ( count( $clean_ids ) >= 5 ) {
				break;
			}
		}
		$out['admin_chat_ids'] = $clean_ids;

		$out['events'] = array();
		if ( isset( $input['events'] ) && is_array( $input['events'] ) ) {
			foreach ( $input['events'] as $ek => $roles ) {
				$ek = sanitize_key( (string) $ek );
				if ( '' === $ek || ! is_array( $roles ) ) {
					continue;
				}
				$out['events'][ $ek ] = array(
					'customer' => ! empty( $roles['customer'] ) && '0' !== (string) $roles['customer'],
					'admin'    => ! empty( $roles['admin'] ) && '0' !== (string) $roles['admin'],
				);
			}
		}

		$out['templates'] = array(
			'order_customer' => array(),
			'order_admin'    => array(),
		);
		foreach ( array( 'order_customer', 'order_admin' ) as $scope ) {
			$src = isset( $input['templates'][ $scope ] ) && is_array( $input['templates'][ $scope ] ) ? $input['templates'][ $scope ] : array();
			foreach ( $src as $ek => $body ) {
				$ek = sanitize_key( (string) $ek );
				if ( '' === $ek ) {
					continue;
				}
				$out['templates'][ $scope ][ $ek ] = sanitize_textarea_field( (string) $body );
			}
		}

		$nl = isset( $input['newsletter'] ) && is_array( $input['newsletter'] ) ? $input['newsletter'] : array();
		$out['newsletter'] = array(
			'enabled'          => ! empty( $nl['enabled'] ) && '0' !== (string) $nl['enabled'],
			'message_template' => isset( $nl['message_template'] ) ? sanitize_textarea_field( (string) $nl['message_template'] ) : '',
			'notify_admin'     => ! empty( $nl['notify_admin'] ) && '0' !== (string) $nl['notify_admin'],
		);

		return $out;
	}

	/**
	 * Shortcodes for UI (SMS-compatible keys).
	 *
	 * @return array<int,array{key:string,label:string,scope:string}>
	 */
	public static function shortcodes() {
		return array(
			array( 'key' => 'order_id', 'label' => __( 'Order ID', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'order_number', 'label' => __( 'Order number', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'customer_name', 'label' => __( 'Customer name', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'customer_phone', 'label' => __( 'Customer phone', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'mobile', 'label' => __( 'Customer mobile', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'customer_email', 'label' => __( 'Customer email', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'total', 'label' => __( 'Order total', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'price', 'label' => __( 'Order price', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'status', 'label' => __( 'Order status', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'status_label', 'label' => __( 'Status label', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'tracking', 'label' => __( 'Tracking code', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'barcode', 'label' => __( 'Post barcode', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'items', 'label' => __( 'Order items', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'payment_method', 'label' => __( 'Payment method', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'payment_url', 'label' => __( 'Payment URL', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'shipping_method', 'label' => __( 'Shipping method', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'order_date', 'label' => __( 'Order date', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'site_name', 'label' => __( 'Site name', 'webino-dashboard' ), 'scope' => 'all' ),
			array( 'key' => 'site_url', 'label' => __( 'Site URL', 'webino-dashboard' ), 'scope' => 'all' ),
			array( 'key' => 'product_name', 'label' => __( 'Product name', 'webino-dashboard' ), 'scope' => 'stock' ),
			array( 'key' => 'product_url', 'label' => __( 'Product URL', 'webino-dashboard' ), 'scope' => 'stock' ),
			array( 'key' => 'qty', 'label' => __( 'Stock quantity', 'webino-dashboard' ), 'scope' => 'stock' ),
			array( 'key' => 'stock_quantity', 'label' => __( 'Stock quantity', 'webino-dashboard' ), 'scope' => 'stock' ),
			array( 'key' => 'low_stock_amount', 'label' => __( 'Low stock threshold', 'webino-dashboard' ), 'scope' => 'stock' ),
			array( 'key' => 'return_item', 'label' => __( 'Return item name', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'return_qty', 'label' => __( 'Return quantity', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'return_reason', 'label' => __( 'Return reason', 'webino-dashboard' ), 'scope' => 'order' ),
			array( 'key' => 'return_status', 'label' => __( 'Return status', 'webino-dashboard' ), 'scope' => 'order' ),
		);
	}

	/**
	 * @return array<int,array{key:string,label:string,kind:string}>
	 */
	public static function event_catalog() {
		if ( class_exists( 'Webino_Dashboard_Sms_Order_Map', false ) ) {
			return Webino_Dashboard_Sms_Order_Map::event_catalog();
		}
		$catalog = array(
			array( 'key' => 'pending_on_create', 'label' => __( 'Pending payment (order created)', 'webino-dashboard' ), 'kind' => 'extra' ),
			array( 'key' => 'stock-low', 'label' => __( 'Low stock', 'webino-dashboard' ), 'kind' => 'extra' ),
			array( 'key' => 'stock-out', 'label' => __( 'Out of stock', 'webino-dashboard' ), 'kind' => 'extra' ),
		);
		if ( function_exists( 'wc_get_order_statuses' ) ) {
			foreach ( wc_get_order_statuses() as $wc_key => $label ) {
				$slug = str_replace( 'wc-', '', sanitize_key( (string) $wc_key ) );
				if ( '' === $slug ) {
					continue;
				}
				$catalog[] = array(
					'key'   => $slug,
					'label' => wp_strip_all_tags( (string) $label ),
					'kind'  => 'status',
				);
			}
		}
		return $catalog;
	}

	/**
	 * @param int $order_id Order id.
	 * @return void
	 */
	public static function on_checkout_processed( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		if ( 'pending' === $order->get_status() ) {
			self::notify( 'pending_on_create', self::build_order_snapshot( $order ) );
		}
	}

	/**
	 * @param int      $order_id Order id.
	 * @param string   $from From.
	 * @param string   $to To.
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function on_status_changed( $order_id, $from, $to, $order ) {
		unset( $from );
		if ( ! $order instanceof WC_Order ) {
			$order = wc_get_order( $order_id );
		}
		if ( ! $order ) {
			return;
		}
		$event = self::event_for_status( $to );
		if ( '' === $event ) {
			return;
		}
		self::notify( $event, self::build_order_snapshot( $order ) );
	}

	/**
	 * @param int    $order_id Order id.
	 * @param string $barcode Barcode.
	 * @return void
	 */
	public static function on_post_barcode( $order_id, $barcode ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		$snapshot            = self::build_order_snapshot( $order );
		$snapshot['barcode'] = (string) $barcode;
		self::notify( 'post', $snapshot );
	}

	/**
	 * @param WC_Product $product Product.
	 * @return void
	 */
	public static function on_wc_low_stock( $product ) {
		$resolved = self::resolve_wc_product( $product );
		if ( $resolved ) {
			self::notify( 'stock-low', self::build_stock_snapshot( $resolved['id'], $resolved['qty'] ) );
		}
	}

	/**
	 * @param WC_Product $product Product.
	 * @return void
	 */
	public static function on_wc_no_stock( $product ) {
		$resolved = self::resolve_wc_product( $product );
		if ( $resolved ) {
			self::notify( 'stock-out', self::build_stock_snapshot( $resolved['id'], $resolved['qty'] ) );
		}
	}

	/**
	 * @param int       $product_id Product id.
	 * @param int|float $qty Qty.
	 * @return void
	 */
	public static function on_stock_low( $product_id, $qty ) {
		self::notify( 'stock-low', self::build_stock_snapshot( (int) $product_id, $qty ) );
	}

	/**
	 * @param int       $product_id Product id.
	 * @param int|float $qty Qty.
	 * @return void
	 */
	public static function on_stock_out( $product_id, $qty ) {
		self::notify( 'stock-out', self::build_stock_snapshot( (int) $product_id, $qty ) );
	}

	/**
	 * @param string              $event_key Event.
	 * @param array<string,mixed> $snapshot Snapshot.
	 * @param bool                $sync Sync (return result).
	 * @param string|null         $provider_only Limit to one provider.
	 * @return array{ok:bool,results?:array<string,mixed>,error?:string}
	 */
	public static function notify( $event_key, array $snapshot, $sync = false, $provider_only = null ) {
		$event_key = sanitize_key( (string) $event_key );
		$providers = null !== $provider_only ? array( sanitize_key( $provider_only ) ) : array( 'telegram', 'bale' );
		$results   = array();
		$any_ok    = false;

		foreach ( $providers as $provider ) {
			if ( ! in_array( $provider, array( 'telegram', 'bale' ), true ) ) {
				continue;
			}
			if ( ! self::provider_active( $provider ) ) {
				$results[ $provider ] = array( 'ok' => false, 'error' => 'inactive' );
				continue;
			}
			$res = self::notify_provider( $provider, $event_key, $snapshot, $sync );
			$results[ $provider ] = $res;
			if ( ! empty( $res['ok'] ) ) {
				$any_ok = true;
			}
		}

		return array(
			'ok'      => $any_ok,
			'results' => $results,
		);
	}

	/**
	 * Send newsletter campaign to opted-in bot users (+ optional admins).
	 *
	 * @param string $provider telegram|bale.
	 * @param string $message  Optional override; empty uses settings template.
	 * @return array{ok:bool,sent:int,error?:string}
	 */
	public static function send_newsletter( $provider, $message = '' ) {
		$provider = sanitize_key( $provider );
		$sn       = self::get_shop_notify( $provider );
		if ( empty( $sn['newsletter']['enabled'] ) ) {
			return array( 'ok' => false, 'sent' => 0, 'error' => 'newsletter_disabled' );
		}
		$text = trim( (string) $message );
		if ( '' === $text ) {
			$text = trim( (string) ( $sn['newsletter']['message_template'] ?? '' ) );
		}
		if ( '' === $text ) {
			return array( 'ok' => false, 'sent' => 0, 'error' => 'empty_message' );
		}
		$vars = array(
			'site_name' => get_bloginfo( 'name' ),
			'site_url'  => home_url(),
		);
		$text = self::render_template( $text, $vars );
		$sent = 0;

		$users = self::list_subscribers( $provider, true );
		foreach ( $users as $row ) {
			$chat = (string) ( $row['chat_id'] ?? '' );
			if ( '' === $chat ) {
				continue;
			}
			if ( self::send_chat( $provider, $chat, $text ) ) {
				++$sent;
			}
		}

		if ( ! empty( $sn['newsletter']['notify_admin'] ) ) {
			foreach ( $sn['admin_chat_ids'] as $chat ) {
				if ( self::send_chat( $provider, (string) $chat, $text ) ) {
					++$sent;
				}
			}
		}

		return array( 'ok' => $sent > 0, 'sent' => $sent );
	}

	/**
	 * @param string $provider telegram|bale.
	 * @param bool   $opted_in_only Only newsletter opted-in.
	 * @return array<int,array{user_id:int,chat_id:string,display_name:string,opt_in:bool}>
	 */
	public static function list_subscribers( $provider, $opted_in_only = false ) {
		$provider = sanitize_key( $provider );
		$meta_key = 'telegram' === $provider ? self::META_TG_CHAT : self::META_BALE_CHAT;
		$opt_key  = 'telegram' === $provider ? self::META_TG_OPT : self::META_BALE_OPT;

		$q = new WP_User_Query(
			array(
				'number'     => 500,
				'meta_key'   => $meta_key,
				'meta_compare' => 'EXISTS',
				'fields'     => array( 'ID', 'display_name' ),
			)
		);
		$out = array();
		foreach ( $q->get_results() as $user ) {
			$uid  = (int) $user->ID;
			$chat = (string) get_user_meta( $uid, $meta_key, true );
			if ( '' === $chat ) {
				continue;
			}
			$raw_opt = get_user_meta( $uid, $opt_key, true );
			$opt_in  = ( '' === $raw_opt || '0' !== (string) $raw_opt );
			if ( $opted_in_only && ! $opt_in ) {
				continue;
			}
			$out[] = array(
				'user_id'      => $uid,
				'chat_id'      => $chat,
				'display_name' => (string) $user->display_name,
				'opt_in'       => $opt_in,
			);
		}
		return $out;
	}

	/**
	 * @param string $provider telegram|bale.
	 * @param int    $user_id User id.
	 * @param bool   $opt_in Opt in.
	 * @return bool
	 */
	public static function set_subscriber_opt_in( $provider, $user_id, $opt_in ) {
		$opt_key = 'telegram' === $provider ? self::META_TG_OPT : self::META_BALE_OPT;
		return (bool) update_user_meta( (int) $user_id, $opt_key, $opt_in ? '1' : '0' );
	}

	/**
	 * @param string $provider Provider.
	 * @param string $event_key Event.
	 * @param array<string,mixed> $snapshot Snapshot.
	 * @param bool   $sync Sync.
	 * @return array{ok:bool,error?:string,customer?:bool,admin?:bool,skipped?:bool}
	 */
	private static function notify_provider( $provider, $event_key, array $snapshot, $sync ) {
		$sn = self::get_shop_notify( $provider );
		if ( empty( $sn['enabled'] ) ) {
			return array( 'ok' => false, 'error' => 'disabled', 'skipped' => true );
		}

		$order_id   = (int) ( $snapshot['id'] ?? 0 );
		$product_id = (int) ( $snapshot['product_id'] ?? 0 );
		if ( $product_id > 0 && in_array( $event_key, array( 'stock-low', 'stock-out' ), true ) ) {
			$dedupe = 'webino_bot_' . $provider . '_' . $event_key . '_p' . $product_id . '_q' . (string) ( $snapshot['stock_quantity'] ?? '' );
		} else {
			$dedupe = 'webino_bot_' . $provider . '_' . $event_key . '_' . $order_id . '_' . ( $snapshot['status'] ?? '' ) . '_' . ( $snapshot['barcode'] ?? '' );
		}
		if ( ! $sync && get_transient( $dedupe ) ) {
			return array( 'ok' => true, 'skipped' => true, 'error' => 'dedupe' );
		}

		$ev = isset( $sn['events'][ $event_key ] ) && is_array( $sn['events'][ $event_key ] ) ? $sn['events'][ $event_key ] : array();
		$send_customer = ! empty( $ev['customer'] );
		$send_admin    = ! empty( $ev['admin'] );
		if ( ! $send_customer && ! $send_admin ) {
			return array( 'ok' => false, 'skipped' => true, 'error' => 'event_off' );
		}

		$vars = self::vars_from_snapshot( $snapshot );
		$cust_ok = false;
		$adm_ok  = false;

		if ( $send_customer ) {
			$body = self::template_body( $sn, 'order_customer', $event_key );
			if ( '' !== $body ) {
				$text = self::render_template( $body, $vars );
				$chat = self::customer_chat_id( $provider, $snapshot );
				if ( '' !== $chat && self::send_chat( $provider, $chat, $text ) ) {
					$cust_ok = true;
				}
			}
		}

		if ( $send_admin ) {
			$body = self::template_body( $sn, 'order_admin', $event_key );
			if ( '' !== $body ) {
				$text = self::render_template( $body, $vars );
				foreach ( $sn['admin_chat_ids'] as $chat ) {
					if ( self::send_chat( $provider, (string) $chat, $text ) ) {
						$adm_ok = true;
					}
				}
			}
		}

		$ok = $cust_ok || $adm_ok;
		if ( $ok ) {
			if ( ! $sync ) {
				set_transient( $dedupe, 1, 60 );
			}
			self::$sent_flags[ $provider . '|' . $event_key . '|' . $order_id ] = true;
		}

		return array(
			'ok'       => $ok,
			'customer' => $cust_ok,
			'admin'    => $adm_ok,
			'error'    => $ok ? '' : 'send_failed',
		);
	}

	/**
	 * @param array<string,mixed> $sn Shop notify.
	 * @param string              $scope order_customer|order_admin.
	 * @param string              $event_key Event.
	 * @return string
	 */
	private static function template_body( array $sn, $scope, $event_key ) {
		$event_key = class_exists( 'Webino_Dashboard_Notify_Copy', false )
			? Webino_Dashboard_Notify_Copy::canonical_event_key( $event_key )
			: sanitize_key( (string) $event_key );
		$tpl       = trim( (string) ( $sn['templates'][ $scope ][ $event_key ] ?? '' ) );
		if ( '' !== $tpl ) {
			return $tpl;
		}
		if ( class_exists( 'Webino_Dashboard_Notify_Copy', false ) ) {
			return Webino_Dashboard_Notify_Copy::bot_template( $scope, $event_key );
		}
		return '';
	}

	/**
	 * @param string              $tpl Template.
	 * @param array<string,mixed> $vars Vars.
	 * @return string
	 */
	public static function render_template( $tpl, array $vars ) {
		$replace = array();
		foreach ( $vars as $k => $v ) {
			$replace[ '{' . $k . '}' ] = (string) $v;
		}
		return strtr( (string) $tpl, $replace );
	}

	/**
	 * @param array<string,mixed> $snapshot Snapshot.
	 * @return array<string,string>
	 */
	private static function vars_from_snapshot( array $snapshot ) {
		$vars = array();
		foreach ( $snapshot as $k => $v ) {
			if ( is_scalar( $v ) || null === $v ) {
				$vars[ (string) $k ] = (string) $v;
			}
		}
		if ( isset( $vars['id'] ) && ! isset( $vars['order_id'] ) ) {
			$vars['order_id'] = $vars['id'];
		}
		if ( isset( $vars['number'] ) && ! isset( $vars['order_number'] ) ) {
			$vars['order_number'] = $vars['number'];
		}
		if ( ! isset( $vars['site_name'] ) ) {
			$vars['site_name'] = get_bloginfo( 'name' );
		}
		if ( ! isset( $vars['site_url'] ) ) {
			$vars['site_url'] = home_url();
		}
		return $vars;
	}

	/**
	 * @param string              $provider Provider.
	 * @param array<string,mixed> $snapshot Snapshot.
	 * @return string
	 */
	private static function customer_chat_id( $provider, array $snapshot ) {
		$user_id = 0;
		if ( ! empty( $snapshot['customer_user_id'] ) ) {
			$user_id = (int) $snapshot['customer_user_id'];
		} elseif ( ! empty( $snapshot['id'] ) && function_exists( 'wc_get_order' ) ) {
			$order = wc_get_order( (int) $snapshot['id'] );
			if ( $order ) {
				$user_id = (int) $order->get_user_id();
			}
		}
		if ( $user_id < 1 ) {
			return '';
		}
		$meta = 'telegram' === $provider ? self::META_TG_CHAT : self::META_BALE_CHAT;
		return (string) get_user_meta( $user_id, $meta, true );
	}

	/**
	 * @param string $provider Provider.
	 * @param string $chat_id Chat.
	 * @param string $text Text.
	 * @return bool
	 */
	private static function send_chat( $provider, $chat_id, $text ) {
		$chat_id = trim( (string) $chat_id );
		$text    = (string) $text;
		if ( '' === $chat_id || '' === trim( wp_strip_all_tags( $text ) ) ) {
			return false;
		}
		if ( ! class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			return false;
		}
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		if ( 'telegram' === $provider && class_exists( '\Webino_Dashboard_Bots_Telegram\Messaging\OutboundMessenger', false ) ) {
			$res = \Webino_Dashboard_Bots_Telegram\Messaging\OutboundMessenger::send_text_to_chat( $chat_id, $text );
			return ! empty( $res['ok'] );
		}
		if ( 'bale' === $provider && class_exists( '\Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger', false ) ) {
			$res = \Webino_Dashboard_Bots_Bale\Messaging\OutboundMessenger::send_text_to_chat( $chat_id, $text );
			return ! empty( $res['ok'] );
		}
		return false;
	}

	/**
	 * @param string $provider Provider.
	 * @return bool
	 */
	private static function provider_active( $provider ) {
		if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false ) ) {
			return false;
		}
		$mod = 'telegram' === $provider ? 'telegram-bot-module' : 'bale-bot-module';
		return Webino_Dashboard_Module_Registry::is_active( $mod );
	}

	/**
	 * @param string $provider Provider.
	 * @return array<string,mixed>
	 */
	private static function raw_settings( $provider ) {
		if ( ! class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			return array();
		}
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		if ( 'telegram' === $provider && class_exists( '\Webino_Dashboard_Bots_Telegram\Core\Plugin', false ) ) {
			return \Webino_Dashboard_Bots_Telegram\Core\Plugin::get_settings();
		}
		if ( 'bale' === $provider && class_exists( '\Webino_Dashboard_Bots_Bale\Core\Plugin', false ) ) {
			return \Webino_Dashboard_Bots_Bale\Core\Plugin::get_settings();
		}
		return array();
	}

	/**
	 * Persist shop_notify into provider settings (and mark migrated).
	 *
	 * @param string              $provider Provider.
	 * @param array<string,mixed> $shop_notify Sanitized shop_notify.
	 * @return array<string,mixed>
	 */
	public static function save_shop_notify( $provider, array $shop_notify ) {
		$provider = sanitize_key( $provider );
		if ( ! class_exists( 'Webino_Dashboard_Bots_Loader', false ) ) {
			return $shop_notify;
		}
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$shop_notify = self::sanitize_shop_notify( $shop_notify );
		if ( 'telegram' === $provider && class_exists( '\Webino_Dashboard_Bots_Telegram\Core\Plugin', false ) ) {
			$s                 = \Webino_Dashboard_Bots_Telegram\Core\Plugin::get_settings();
			$s['shop_notify']  = $shop_notify;
			\Webino_Dashboard_Bots_Telegram\Core\Plugin::update_settings( $s );
			return $shop_notify;
		}
		if ( 'bale' === $provider && class_exists( '\Webino_Dashboard_Bots_Bale\Core\Plugin', false ) ) {
			$s                = \Webino_Dashboard_Bots_Bale\Core\Plugin::get_settings();
			$s['shop_notify'] = $shop_notify;
			\Webino_Dashboard_Bots_Bale\Core\Plugin::update_settings( $s );
			return $shop_notify;
		}
		return $shop_notify;
	}

	/**
	 * @param string $status Status.
	 * @return string
	 */
	private static function event_for_status( $status ) {
		if ( class_exists( 'Webino_Dashboard_Sms_Order_Map', false ) ) {
			return Webino_Dashboard_Sms_Order_Map::event_for_status( $status );
		}
		$status = sanitize_key( (string) $status );
		if ( str_starts_with( $status, 'wc-' ) ) {
			$status = substr( $status, 3 );
		}
		$map = array(
			'pending'        => 'pending_on_status',
			'processing'     => 'processing',
			'on-hold'        => 'on-hold',
			'completed'      => 'completed',
			'cancelled'      => 'cancelled',
			'refunded'       => 'refunded',
			'failed'         => 'failed',
			'draft'          => 'checkout-draft',
			'checkout-draft' => 'checkout-draft',
		);
		return $map[ $status ] ?? $status;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,mixed>
	 */
	public static function build_order_snapshot( $order ) {
		if ( class_exists( 'Webino_Dashboard_Sms_Order_Hooks', false ) ) {
			$snap = Webino_Dashboard_Sms_Order_Hooks::build_snapshot( $order );
			$snap['customer_user_id'] = (int) $order->get_user_id();
			return $snap;
		}
		$status   = $order->get_status();
		$statuses = function_exists( 'wc_get_order_statuses' ) ? wc_get_order_statuses() : array();
		$label    = $statuses[ 'wc-' . $status ] ?? $status;
		return array(
			'id'                => $order->get_id(),
			'number'            => $order->get_order_number(),
			'customer_name'     => trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ),
			'customer_phone'    => (string) $order->get_billing_phone(),
			'mobile'            => (string) $order->get_billing_phone(),
			'customer_email'    => (string) $order->get_billing_email(),
			'customer_user_id'  => (int) $order->get_user_id(),
			'total'             => $order->get_formatted_order_total(),
			'price'             => $order->get_formatted_order_total(),
			'status'            => $status,
			'status_label'      => wp_strip_all_tags( (string) $label ),
			'site_name'         => get_bloginfo( 'name' ),
			'site_url'          => home_url(),
		);
	}

	/**
	 * @param int            $product_id Product id.
	 * @param int|float|null $qty Qty.
	 * @return array<string,mixed>
	 */
	public static function build_stock_snapshot( $product_id, $qty = null ) {
		if ( class_exists( 'Webino_Dashboard_Sms_Order_Hooks', false ) ) {
			return Webino_Dashboard_Sms_Order_Hooks::build_stock_snapshot( $product_id, $qty );
		}
		$product = function_exists( 'wc_get_product' ) ? wc_get_product( (int) $product_id ) : false;
		$name    = $product instanceof WC_Product ? $product->get_name() : (string) $product_id;
		$url     = $product instanceof WC_Product ? (string) get_permalink( (int) $product_id ) : '';
		$stock   = null !== $qty ? (string) $qty : '';
		return array(
			'id'             => 0,
			'product_id'     => (int) $product_id,
			'product_name'   => $name,
			'product_url'    => $url,
			'stock_quantity' => $stock,
			'qty'            => $stock,
			'site_name'      => get_bloginfo( 'name' ),
			'site_url'       => home_url(),
		);
	}

	/**
	 * @param WC_Product|int $product Product.
	 * @return array{id:int,qty:float|null}|null
	 */
	private static function resolve_wc_product( $product ) {
		if ( is_numeric( $product ) ) {
			$product = wc_get_product( (int) $product );
		}
		if ( ! $product instanceof WC_Product ) {
			return null;
		}
		$id = (int) $product->get_id();
		if ( $product->is_type( 'variation' ) ) {
			$parent = (int) $product->get_parent_id();
			if ( $parent > 0 ) {
				$id = $parent;
			}
		}
		$qty = $product->managing_stock() ? (float) $product->get_stock_quantity() : null;
		return array(
			'id'  => $id,
			'qty' => $qty,
		);
	}
}
