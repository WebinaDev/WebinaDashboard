<?php
/**
 * Unified notification dispatcher (site + email) and settings store.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Site/email notification settings and event dispatch.
 * SMS / Bale / Telegram keep their existing senders; hub UI embeds those panels.
 */
final class Webino_Dashboard_Notify {

	const OPTION = 'webino_dashboard_notify';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'on_order_status_changed' ), 22, 4 );
		add_action( 'woocommerce_checkout_order_processed', array( __CLASS__, 'on_checkout_processed' ), 22, 1 );
		add_action( 'comment_post', array( __CLASS__, 'on_comment_post' ), 20, 3 );
		add_action( 'woocommerce_low_stock', array( __CLASS__, 'on_wc_low_stock' ), 20, 1 );
		add_action( 'woocommerce_no_stock', array( __CLASS__, 'on_wc_no_stock' ), 20, 1 );
		add_action( 'webino_dashboard_product_stock_low', array( __CLASS__, 'on_stock_low' ), 20, 2 );
		add_action( 'webino_dashboard_product_stock_out', array( __CLASS__, 'on_stock_out' ), 20, 2 );
		add_action( 'user_register', array( __CLASS__, 'on_user_register' ), 20, 1 );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		$otp = class_exists( 'Webino_Dashboard_Auth_Otp', false )
			? Webino_Dashboard_Auth_Otp::defaults()
			: array();
		return array(
			'site'  => array(
				'enabled' => true,
				'events'  => array(),
			),
			'email' => array(
				'enabled' => false,
				'smtp'    => array(
					'enabled'    => false,
					'host'       => '',
					'port'       => 587,
					'encryption' => 'tls',
					'username'   => '',
					'password'   => '',
					'from_name'  => '',
					'from_email' => '',
				),
				'events'  => array(),
			),
			'otp'   => $otp,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_settings() {
		$raw = get_option( self::OPTION, array() );
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		$defaults = self::defaults();
		$out      = array_replace_recursive( $defaults, $raw );
		if ( ! isset( $out['site']['events'] ) || ! is_array( $out['site']['events'] ) ) {
			$out['site']['events'] = array();
		}
		if ( ! isset( $out['email']['events'] ) || ! is_array( $out['email']['events'] ) ) {
			$out['email']['events'] = array();
		}
		if ( ! isset( $out['email']['smtp'] ) || ! is_array( $out['email']['smtp'] ) ) {
			$out['email']['smtp'] = $defaults['email']['smtp'];
		} else {
			$out['email']['smtp'] = array_merge( $defaults['email']['smtp'], $out['email']['smtp'] );
		}
		if ( class_exists( 'Webino_Dashboard_Auth_Otp', false ) ) {
			$otp_raw  = isset( $raw['otp'] ) && is_array( $raw['otp'] ) ? $raw['otp'] : array();
			$out['otp'] = Webino_Dashboard_Auth_Otp::normalize( $otp_raw );
		} elseif ( ! isset( $out['otp'] ) || ! is_array( $out['otp'] ) ) {
			$out['otp'] = array();
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $settings Settings blob.
	 * @return array<string,mixed>
	 */
	public static function save_settings( array $settings ) {
		$current = self::get_settings();
		$next    = array_replace_recursive( $current, $settings );

		if ( isset( $settings['site'] ) && is_array( $settings['site'] ) ) {
			$next['site']['enabled'] = ! empty( $settings['site']['enabled'] );
			if ( isset( $settings['site']['events'] ) && is_array( $settings['site']['events'] ) ) {
				$next['site']['events'] = self::sanitize_channel_events( $settings['site']['events'], 'site' );
			}
		}
		if ( isset( $settings['email'] ) && is_array( $settings['email'] ) ) {
			$next['email']['enabled'] = ! empty( $settings['email']['enabled'] );
			if ( isset( $settings['email']['events'] ) && is_array( $settings['email']['events'] ) ) {
				$next['email']['events'] = self::sanitize_channel_events( $settings['email']['events'], 'email' );
			}
			if ( isset( $settings['email']['smtp'] ) && is_array( $settings['email']['smtp'] ) ) {
				$smtp = $settings['email']['smtp'];
				$enc  = sanitize_key( (string) ( $smtp['encryption'] ?? 'tls' ) );
				if ( ! in_array( $enc, array( 'none', 'ssl', 'tls' ), true ) ) {
					$enc = 'tls';
				}
				$pass = isset( $smtp['password'] ) ? (string) $smtp['password'] : '';
				// Keep existing password when blank (UI does not re-echo secrets).
				if ( '' === $pass && ! empty( $current['email']['smtp']['password'] ) ) {
					$pass = (string) $current['email']['smtp']['password'];
				}
				$next['email']['smtp'] = array(
					'enabled'    => ! empty( $smtp['enabled'] ),
					'host'       => sanitize_text_field( (string) ( $smtp['host'] ?? '' ) ),
					'port'       => max( 1, min( 65535, (int) ( $smtp['port'] ?? 587 ) ) ),
					'encryption' => $enc,
					'username'   => sanitize_text_field( (string) ( $smtp['username'] ?? '' ) ),
					'password'   => $pass,
					'from_name'  => sanitize_text_field( (string) ( $smtp['from_name'] ?? '' ) ),
					'from_email' => sanitize_email( (string) ( $smtp['from_email'] ?? '' ) ),
				);
			}
		}
		if ( isset( $settings['otp'] ) && is_array( $settings['otp'] ) && class_exists( 'Webino_Dashboard_Auth_Otp', false ) ) {
			$next['otp'] = Webino_Dashboard_Auth_Otp::sanitize_settings( $settings['otp'] );
		}

		update_option( self::OPTION, $next, false );
		return self::get_settings_for_api();
	}

	/**
	 * Settings with password masked for REST.
	 *
	 * @return array<string,mixed>
	 */
	public static function get_settings_for_api() {
		$s = self::get_settings();
		$has_pass = ! empty( $s['email']['smtp']['password'] );
		$s['email']['smtp']['password']     = '';
		$s['email']['smtp']['has_password'] = $has_pass;
		$s['event_catalog']                 = self::event_catalog();
		$s['variables']                     = self::variable_help();
		$s                                  = self::merge_default_event_templates( $s );
		return $s;
	}

	/**
	 * Fill empty site/email template fields with per-event defaults for the settings UI.
	 *
	 * @param array<string,mixed> $settings Settings.
	 * @return array<string,mixed>
	 */
	private static function merge_default_event_templates( array $settings ) {
		if ( ! class_exists( 'Webino_Dashboard_Notify_Copy', false ) ) {
			return $settings;
		}
		$catalog = self::event_catalog();
		if ( ! isset( $settings['site']['events'] ) || ! is_array( $settings['site']['events'] ) ) {
			$settings['site']['events'] = array();
		}
		if ( ! isset( $settings['email']['events'] ) || ! is_array( $settings['email']['events'] ) ) {
			$settings['email']['events'] = array();
		}
		foreach ( $catalog as $item ) {
			$key = sanitize_key( (string) ( $item['key'] ?? '' ) );
			if ( '' === $key ) {
				continue;
			}
			$site_defaults  = Webino_Dashboard_Notify_Copy::site_defaults( $key );
			$email_defaults = Webino_Dashboard_Notify_Copy::email_defaults( $key );
			if ( ! isset( $settings['site']['events'][ $key ] ) || ! is_array( $settings['site']['events'][ $key ] ) ) {
				$settings['site']['events'][ $key ] = array();
			}
			if ( ! isset( $settings['email']['events'][ $key ] ) || ! is_array( $settings['email']['events'][ $key ] ) ) {
				$settings['email']['events'][ $key ] = array();
			}
			foreach ( array( 'title_customer', 'body_customer', 'title_admin', 'body_admin' ) as $field ) {
				if ( '' === trim( (string) ( $settings['site']['events'][ $key ][ $field ] ?? '' ) ) ) {
					$settings['site']['events'][ $key ][ $field ] = $site_defaults[ $field ];
				}
			}
			foreach ( array( 'subject_customer', 'body_customer', 'subject_admin', 'body_admin' ) as $field ) {
				if ( '' === trim( (string) ( $settings['email']['events'][ $key ][ $field ] ?? '' ) ) ) {
					$settings['email']['events'][ $key ][ $field ] = $email_defaults[ $field ];
				}
			}
		}
		return $settings;
	}

	/**
	 * @param array<string,mixed> $events Raw events.
	 * @param string              $channel site|email.
	 * @return array<string,array<string,mixed>>
	 */
	private static function sanitize_channel_events( array $events, $channel ) {
		$out = array();
		foreach ( $events as $key => $row ) {
			$key = sanitize_key( (string) $key );
			if ( '' === $key || ! is_array( $row ) ) {
				continue;
			}
			$item = array(
				'customer' => ! empty( $row['customer'] ),
				'admin'    => ! empty( $row['admin'] ),
			);
			if ( 'site' === $channel ) {
				$item['title_customer'] = sanitize_text_field( (string) ( $row['title_customer'] ?? '' ) );
				$item['body_customer']  = sanitize_textarea_field( (string) ( $row['body_customer'] ?? '' ) );
				$item['title_admin']    = sanitize_text_field( (string) ( $row['title_admin'] ?? '' ) );
				$item['body_admin']     = sanitize_textarea_field( (string) ( $row['body_admin'] ?? '' ) );
			} else {
				$item['subject_customer'] = sanitize_text_field( (string) ( $row['subject_customer'] ?? '' ) );
				$item['body_customer']    = wp_kses_post( (string) ( $row['body_customer'] ?? '' ) );
				$item['subject_admin']    = sanitize_text_field( (string) ( $row['subject_admin'] ?? '' ) );
				$item['body_admin']       = wp_kses_post( (string) ( $row['body_admin'] ?? '' ) );
			}
			$out[ $key ] = $item;
		}
		return $out;
	}

	/**
	 * @return list<array{key:string,label:string,group:string}>
	 */
	public static function event_catalog() {
		$by_key = array();
		if ( function_exists( 'wc_get_order_statuses' ) ) {
			foreach ( wc_get_order_statuses() as $slug => $label ) {
				$raw = sanitize_key( str_replace( 'wc-', '', (string) $slug ) );
				if ( '' === $raw ) {
					continue;
				}
				$key = class_exists( 'Webino_Dashboard_Notify_Copy', false )
					? Webino_Dashboard_Notify_Copy::canonical_event_key( $raw )
					: $raw;
				if ( '' === $key || isset( $by_key[ $key ] ) ) {
					continue;
				}
				$by_key[ $key ] = array(
					'key'   => $key,
					'label' => (string) $label,
					'group' => 'order',
				);
			}
		}
		$extra = array(
			'pending_on_create' => array( __( 'Order created (pending)', 'webino-dashboard' ), 'order' ),
			'pending_on_status' => array( __( 'Pending payment (status change)', 'webino-dashboard' ), 'order' ),
			'user-welcome'      => array( __( 'New user welcome', 'webino-dashboard' ), 'user' ),
			'stock-low'         => array( __( 'Low stock', 'webino-dashboard' ), 'stock' ),
			'stock-out'         => array( __( 'Out of stock', 'webino-dashboard' ), 'stock' ),
			'comment-pending'   => array( __( 'Comment awaiting approval', 'webino-dashboard' ), 'moderation' ),
			'cart-abandoned'    => array( __( 'Abandoned cart', 'webino-dashboard' ), 'order' ),
			'order-abandoned'   => array( __( 'Abandoned unpaid order', 'webino-dashboard' ), 'order' ),
			'return-requested'  => array( __( 'Return requested', 'webino-dashboard' ), 'order' ),
			'return-approved'   => array( __( 'Return approved', 'webino-dashboard' ), 'order' ),
			'return-rejected'   => array( __( 'Return rejected', 'webino-dashboard' ), 'order' ),
			'return-parcel-received' => array( __( 'Return parcel received', 'webino-dashboard' ), 'order' ),
			'return-refund'     => array( __( 'Return refunded', 'webino-dashboard' ), 'order' ),
			'return-exchange'   => array( __( 'Return exchanged', 'webino-dashboard' ), 'order' ),
		);
		foreach ( $extra as $key => $meta ) {
			$canonical = class_exists( 'Webino_Dashboard_Notify_Copy', false )
				? Webino_Dashboard_Notify_Copy::canonical_event_key( $key )
				: $key;
			if ( isset( $by_key[ $canonical ] ) ) {
				continue;
			}
			$by_key[ $canonical ] = array(
				'key'   => $canonical,
				'label' => $meta[0],
				'group' => $meta[1],
			);
		}
		if ( class_exists( 'Webino_Dashboard_Sms_Order_Map', false ) ) {
			$fa = Webino_Dashboard_Sms_Order_Map::status_labels_fa();
			foreach ( $by_key as &$it ) {
				if ( isset( $fa[ $it['key'] ] ) ) {
					$it['label'] = $fa[ $it['key'] ];
				}
			}
			unset( $it );
		}
		return array_values( $by_key );
	}

	/**
	 * @return list<array{token:string,label:string}>
	 */
	public static function variable_help() {
		return array(
			array( 'token' => '{order_number}', 'label' => __( 'Order number', 'webino-dashboard' ) ),
			array( 'token' => '{order_id}', 'label' => __( 'Order ID', 'webino-dashboard' ) ),
			array( 'token' => '{order_status}', 'label' => __( 'Order status', 'webino-dashboard' ) ),
			array( 'token' => '{customer_name}', 'label' => __( 'Customer name', 'webino-dashboard' ) ),
			array( 'token' => '{order_total}', 'label' => __( 'Order total', 'webino-dashboard' ) ),
			array( 'token' => '{tracking_code}', 'label' => __( 'Tracking code', 'webino-dashboard' ) ),
			array( 'token' => '{site_name}', 'label' => __( 'Site name', 'webino-dashboard' ) ),
			array( 'token' => '{link}', 'label' => __( 'Related link', 'webino-dashboard' ) ),
			array( 'token' => '{product_name}', 'label' => __( 'Product name', 'webino-dashboard' ) ),
			array( 'token' => '{comment_excerpt}', 'label' => __( 'Comment excerpt', 'webino-dashboard' ) ),
			array( 'token' => '{return_item}', 'label' => __( 'Return item name', 'webino-dashboard' ) ),
			array( 'token' => '{return_qty}', 'label' => __( 'Return quantity', 'webino-dashboard' ) ),
			array( 'token' => '{return_reason}', 'label' => __( 'Return reason', 'webino-dashboard' ) ),
			array( 'token' => '{return_status}', 'label' => __( 'Return status', 'webino-dashboard' ) ),
		);
	}

	/**
	 * @param string               $event Event key.
	 * @param array<string,string> $vars  Replacements.
	 * @param string               $link  Optional link for site notifications.
	 * @param int                  $customer_user_id Customer WP user (0 = none).
	 * @param string               $customer_email Customer email for mail.
	 * @return void
	 */
	public static function dispatch( $event, array $vars, $link = '', $customer_user_id = 0, $customer_email = '' ) {
		$event = sanitize_key( (string) $event );
		if ( '' === $event ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_Notify_Copy', false ) ) {
			$event = Webino_Dashboard_Notify_Copy::canonical_event_key( $event );
		}
		$vars = self::normalize_vars( $vars );
		self::dispatch_site( $event, $vars, $link, (int) $customer_user_id );
		self::dispatch_email( $event, $vars, (int) $customer_user_id, (string) $customer_email );
	}

	/**
	 * @param array<string,string> $vars Vars.
	 * @return array<string,string>
	 */
	private static function normalize_vars( array $vars ) {
		$base = array(
			'order_number'    => '',
			'order_id'        => '',
			'order_status'    => '',
			'customer_name'   => '',
			'order_total'     => '',
			'tracking_code'   => '',
			'site_name'       => wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ),
			'link'            => '',
			'product_name'    => '',
			'comment_excerpt' => '',
			'return_item'     => '',
			'return_qty'      => '',
			'return_reason'   => '',
			'return_status'   => '',
		);
		foreach ( $vars as $k => $v ) {
			$base[ sanitize_key( (string) $k ) ] = (string) $v;
		}
		return $base;
	}

	/**
	 * @param string               $template Template with {tokens}.
	 * @param array<string,string> $vars     Vars.
	 * @return string
	 */
	public static function render( $template, array $vars ) {
		$template = (string) $template;
		foreach ( $vars as $k => $v ) {
			$template = str_replace( '{' . $k . '}', (string) $v, $template );
		}
		return $template;
	}

	/**
	 * @param string               $event Event.
	 * @param array<string,string> $vars  Vars.
	 * @param string               $link  Link.
	 * @param int                  $customer_user_id Customer.
	 * @return void
	 */
	private static function dispatch_site( $event, array $vars, $link, $customer_user_id ) {
		if ( ! class_exists( 'Webino_Dashboard_Notifications', false ) ) {
			return;
		}
		$s = self::get_settings();
		if ( empty( $s['site']['enabled'] ) ) {
			return;
		}
		$ev = isset( $s['site']['events'][ $event ] ) && is_array( $s['site']['events'][ $event ] )
			? $s['site']['events'][ $event ]
			: array();

		$defaults = self::default_site_templates( $event, $vars );
		$customer_on = array_key_exists( 'customer', $ev ) ? ! empty( $ev['customer'] ) : self::default_customer_on( $event );
		$admin_on    = array_key_exists( 'admin', $ev ) ? ! empty( $ev['admin'] ) : self::default_admin_on( $event );

		if ( $customer_on && $customer_user_id > 0 ) {
			$title = self::render( (string) ( $ev['title_customer'] ?? $defaults['title_customer'] ), $vars );
			$body  = self::render( (string) ( $ev['body_customer'] ?? $defaults['body_customer'] ), $vars );
			$href  = $link ? $link : (string) ( $vars['link'] ?? '' );
			Webino_Dashboard_Notifications::create( $customer_user_id, $event, $title, $body, $href );
		}

		if ( $admin_on ) {
			$title = self::render( (string) ( $ev['title_admin'] ?? $defaults['title_admin'] ), $vars );
			$body  = self::render( (string) ( $ev['body_admin'] ?? $defaults['body_admin'] ), $vars );
			$href  = $link ? $link : (string) ( $vars['link'] ?? '' );
			$cap   = self::admin_cap_for_event( $event );
			foreach ( self::users_with_cap( $cap ) as $uid ) {
				if ( $uid === $customer_user_id ) {
					continue;
				}
				Webino_Dashboard_Notifications::create( $uid, $event, $title, $body, $href );
			}
		}
	}

	/**
	 * @param string $event Event key.
	 * @return bool
	 */
	private static function default_customer_on( $event ) {
		if ( in_array( $event, array( 'comment-pending', 'stock-low', 'stock-out' ), true ) ) {
			return false;
		}
		return true;
	}

	/**
	 * @param string $event Event key.
	 * @return bool
	 */
	private static function default_admin_on( $event ) {
		return in_array( $event, array( 'comment-pending', 'stock-low', 'stock-out' ), true );
	}

	/**
	 * @param string               $event Event.
	 * @param array<string,string> $vars  Vars.
	 * @return array<string,string>
	 */
	private static function default_site_templates( $event, array $vars ) {
		unset( $vars );
		if ( class_exists( 'Webino_Dashboard_Notify_Copy', false ) ) {
			return Webino_Dashboard_Notify_Copy::site_defaults( $event );
		}
		return array(
			'title_customer' => 'سفارش شماره {order_number}',
			'body_customer'  => 'سفارش شماره {order_number} — وضعیت: {order_status}',
			'title_admin'    => 'سفارش شماره {order_number}',
			'body_admin'     => 'سفارش شماره {order_number} از {customer_name} — وضعیت: {order_status}',
		);
	}

	/**
	 * @param string               $event Event.
	 * @param array<string,string> $vars  Vars.
	 * @param int                  $customer_user_id Customer.
	 * @param string               $customer_email Email.
	 * @return void
	 */
	private static function dispatch_email( $event, array $vars, $customer_user_id, $customer_email ) {
		$s = self::get_settings();
		if ( empty( $s['email']['enabled'] ) ) {
			return;
		}
		$ev = isset( $s['email']['events'][ $event ] ) && is_array( $s['email']['events'][ $event ] )
			? $s['email']['events'][ $event ]
			: array();
		if ( empty( $ev['customer'] ) && empty( $ev['admin'] ) ) {
			return;
		}

		$defaults = self::default_email_templates( $event, $vars );

		if ( ! empty( $ev['customer'] ) ) {
			$to = $customer_email;
			if ( '' === $to && $customer_user_id > 0 ) {
				$u = get_userdata( $customer_user_id );
				$to = $u ? (string) $u->user_email : '';
			}
			if ( $to ) {
				$subject = self::render( (string) ( $ev['subject_customer'] ?: $defaults['subject_customer'] ), $vars );
				$body    = self::render( (string) ( $ev['body_customer'] ?: $defaults['body_customer'] ), $vars );
				self::send_mail( $to, $subject, $body );
			}
		}

		if ( ! empty( $ev['admin'] ) ) {
			$subject = self::render( (string) ( $ev['subject_admin'] ?: $defaults['subject_admin'] ), $vars );
			$body    = self::render( (string) ( $ev['body_admin'] ?: $defaults['body_admin'] ), $vars );
			foreach ( self::admin_emails( self::admin_cap_for_event( $event ) ) as $to ) {
				self::send_mail( $to, $subject, $body );
			}
		}
	}

	/**
	 * @param string               $event Event.
	 * @param array<string,string> $vars  Vars.
	 * @return array<string,string>
	 */
	private static function default_email_templates( $event, array $vars ) {
		unset( $vars );
		if ( class_exists( 'Webino_Dashboard_Notify_Copy', false ) ) {
			return Webino_Dashboard_Notify_Copy::email_defaults( $event );
		}
		return array(
			'subject_customer' => 'به‌روزرسانی سفارش شماره {order_number} — {site_name}',
			'body_customer'    => '<p>سفارش شماره {order_number} — وضعیت: {order_status}</p>',
			'subject_admin'    => '[{site_name}] اعلان فروشگاه',
			'body_admin'       => '<p>سفارش شماره {order_number} از {customer_name}</p>',
		);
	}

	/**
	 * @param string $to      Email.
	 * @param string $subject Subject.
	 * @param string $body    HTML body.
	 * @return bool
	 */
	public static function send_mail( $to, $subject, $body ) {
		$to = sanitize_email( (string) $to );
		if ( '' === $to ) {
			return false;
		}
		$headers = array( 'Content-Type: text/html; charset=UTF-8' );
		return (bool) wp_mail( $to, $subject, $body, $headers );
	}

	/**
	 * @param string $cap Capability.
	 * @return list<int>
	 */
	public static function users_with_cap( $cap ) {
		$cap = sanitize_key( (string) $cap );
		if ( '' === $cap ) {
			$cap = 'manage_woocommerce';
		}
		$users = get_users(
			array(
				'capability' => $cap,
				'fields'     => 'ID',
				'number'     => 50,
			)
		);
		return array_values( array_filter( array_map( 'intval', (array) $users ) ) );
	}

	/**
	 * @param string $cap Capability.
	 * @return list<string>
	 */
	private static function admin_emails( $cap ) {
		$emails = array();
		foreach ( self::users_with_cap( $cap ) as $uid ) {
			$u = get_userdata( $uid );
			if ( $u && is_email( $u->user_email ) ) {
				$emails[] = $u->user_email;
			}
		}
		$admin = get_option( 'admin_email' );
		if ( is_email( (string) $admin ) ) {
			$emails[] = (string) $admin;
		}
		return array_values( array_unique( $emails ) );
	}

	/**
	 * @param string $event Event.
	 * @return string
	 */
	private static function admin_cap_for_event( $event ) {
		if ( 'comment-pending' === $event ) {
			return 'moderate_comments';
		}
		return 'manage_woocommerce';
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,string>
	 */
	public static function vars_from_order( $order ) {
		if ( ! $order instanceof WC_Order ) {
			return self::normalize_vars( array() );
		}
		$tracking = '';
		foreach ( array( '_webino_post_barcode', '_tracking_code', 'tracking_code' ) as $meta ) {
			$v = $order->get_meta( $meta, true );
			if ( is_string( $v ) && '' !== trim( $v ) ) {
				$tracking = trim( $v );
				break;
			}
		}
		$status = $order->get_status();
		$label  = function_exists( 'wc_get_order_status_name' ) ? wc_get_order_status_name( $status ) : $status;
		$link   = class_exists( 'Webino_Dashboard_Rewrite', false )
			? Webino_Dashboard_Rewrite::url( 'account/orders/' . (int) $order->get_id() )
			: $order->get_view_order_url();
		return self::normalize_vars(
			array(
				'order_number'  => (string) $order->get_order_number(),
				'order_id'      => (string) $order->get_id(),
				'order_status'  => (string) $label,
				'customer_name' => trim( $order->get_formatted_billing_full_name() ),
				'order_total'   => wp_strip_all_tags( $order->get_formatted_order_total() ),
				'tracking_code' => $tracking,
				'link'          => $link,
			)
		);
	}

	/**
	 * @param int      $order_id Order ID.
	 * @param string   $from From.
	 * @param string   $to To.
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function on_order_status_changed( $order_id, $from, $to, $order ) {
		unset( $from );
		if ( ! $order instanceof WC_Order ) {
			$order = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : null;
		}
		if ( ! $order ) {
			return;
		}
		$event = sanitize_key( str_replace( 'wc-', '', (string) $to ) );
		if ( class_exists( 'Webino_Dashboard_Sms_Order_Map', false ) ) {
			$mapped = Webino_Dashboard_Sms_Order_Map::event_for_status( $to );
			if ( is_string( $mapped ) && '' !== $mapped ) {
				$event = $mapped;
			}
		}
		$vars = self::vars_from_order( $order );
		self::dispatch(
			$event,
			$vars,
			(string) $vars['link'],
			(int) $order->get_customer_id(),
			(string) $order->get_billing_email()
		);
	}

	/**
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public static function on_checkout_processed( $order_id ) {
		$order = function_exists( 'wc_get_order' ) ? wc_get_order( $order_id ) : null;
		if ( ! $order ) {
			return;
		}
		$vars = self::vars_from_order( $order );
		self::dispatch(
			'pending_on_create',
			$vars,
			(string) $vars['link'],
			(int) $order->get_customer_id(),
			(string) $order->get_billing_email()
		);
	}

	/**
	 * @param int        $comment_id Comment ID.
	 * @param int|string $approved   Approved status.
	 * @param array      $commentdata Data.
	 * @return void
	 */
	public static function on_comment_post( $comment_id, $approved, $commentdata = array() ) {
		unset( $commentdata );
		if ( '0' !== (string) $approved && 0 !== $approved ) {
			return;
		}
		$c = get_comment( $comment_id );
		if ( ! $c ) {
			return;
		}
		$post = get_post( (int) $c->comment_post_ID );
		$name = $post ? (string) $post->post_title : '';
		$link = class_exists( 'Webino_Dashboard_Rewrite', false )
			? Webino_Dashboard_Rewrite::url( 'users/comments' )
			: admin_url( 'edit-comments.php' );
		self::dispatch(
			'comment-pending',
			array(
				'product_name'    => $name,
				'comment_excerpt' => wp_trim_words( wp_strip_all_tags( (string) $c->comment_content ), 24 ),
				'customer_name'   => (string) $c->comment_author,
				'link'            => $link,
			),
			$link,
			0,
			''
		);
	}

	/**
	 * @param WC_Product $product Product.
	 * @return void
	 */
	public static function on_wc_low_stock( $product ) {
		self::stock_event( 'stock-low', $product );
	}

	/**
	 * @param WC_Product $product Product.
	 * @return void
	 */
	public static function on_wc_no_stock( $product ) {
		self::stock_event( 'stock-out', $product );
	}

	/**
	 * @param int   $product_id Product ID.
	 * @param mixed $product Product or qty.
	 * @return void
	 */
	public static function on_stock_low( $product_id, $product = null ) {
		unset( $product );
		$p = function_exists( 'wc_get_product' ) ? wc_get_product( $product_id ) : null;
		self::stock_event( 'stock-low', $p );
	}

	/**
	 * @param int   $product_id Product ID.
	 * @param mixed $product Product.
	 * @return void
	 */
	public static function on_stock_out( $product_id, $product = null ) {
		unset( $product );
		$p = function_exists( 'wc_get_product' ) ? wc_get_product( $product_id ) : null;
		self::stock_event( 'stock-out', $p );
	}

	/**
	 * @param string          $event Event.
	 * @param WC_Product|null $product Product.
	 * @return void
	 */
	private static function stock_event( $event, $product ) {
		$name = '';
		$id   = 0;
		if ( is_object( $product ) && method_exists( $product, 'get_name' ) ) {
			$name = (string) $product->get_name();
			$id   = (int) $product->get_id();
		}
		$link = $id && class_exists( 'Webino_Dashboard_Rewrite', false )
			? Webino_Dashboard_Rewrite::url( 'shop/products/' . $id )
			: '';
		self::dispatch(
			$event,
			array(
				'product_name' => $name,
				'link'         => $link,
			),
			$link,
			0,
			''
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @return void
	 */
	public static function on_user_register( $user_id ) {
		$user_id = (int) $user_id;
		$u       = get_userdata( $user_id );
		if ( ! $u ) {
			return;
		}
		$link = class_exists( 'Webino_Dashboard_Rewrite', false )
			? Webino_Dashboard_Rewrite::url( 'account' )
			: home_url( '/' );
		self::dispatch(
			'user-welcome',
			array(
				'customer_name' => $u->display_name ? (string) $u->display_name : (string) $u->user_login,
				'link'          => $link,
			),
			$link,
			$user_id,
			(string) $u->user_email
		);
	}
}
