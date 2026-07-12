<?php
/**
 * Aggregated dashboard home overview payload.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds GET dashboard/overview response.
 */
class Webino_Dashboard_Home_Overview {

	const SMS_LOW_BALANCE = 10000;

	/** Overview REST cache lifetime (seconds). */
	const CACHE_TTL = 90;

	/** SMS panel transient cache (seconds). */
	const SMS_PANEL_CACHE_TTL = 300;

	/**
	 * @return WP_REST_Response
	 */
	public static function rest_get() {
		$user_id = get_current_user_id();
		$locale  = self::dashboard_locale();
		$key     = 'webino_dashboard_overview_' . (int) $user_id . '_' . md5( $locale );

		if ( $user_id > 0 ) {
			$cached = get_transient( $key );
			if ( is_array( $cached ) ) {
				return new WP_REST_Response( $cached );
			}
		}

		$payload = self::build_payload( $locale );
		if ( $user_id > 0 ) {
			set_transient( $key, $payload, self::CACHE_TTL );
		}

		return new WP_REST_Response( $payload );
	}

	/**
	 * @param string $locale Dashboard locale.
	 * @return array<string,mixed>
	 */
	private static function build_payload( $locale ) {
		$sections = array();
		$payload  = array(
			'generated_at' => time(),
			'locale'       => $locale,
		);

		if ( self::can_products() ) {
			$payload['products'] = self::products_section();
			$sections[]          = 'products';
		}

		$panels = self::panels_section();
		if ( ! empty( $panels ) ) {
			$payload['panels'] = $panels;
			$sections[]        = 'panels';
		}

		if ( self::can_sales() ) {
			$payload['sales'] = self::sales_section_cached( $locale );
			$sections[]       = 'sales';
		}

		if ( self::can_traffic() ) {
			$payload['traffic'] = self::traffic_section_cached();
			$sections[]         = 'traffic';
		}

		$tasks = self::tasks_section();
		if ( ! empty( $tasks ) ) {
			$payload['tasks'] = $tasks;
			$sections[]     = 'tasks';
		}

		if ( Webino_Dashboard_Rest_Base::can( 'moderate_comments' ) ) {
			$comments = self::comments_section();
			if ( ! empty( $comments ) ) {
				$payload['comments'] = $comments;
				$sections[]          = 'comments';
			}
		}

		$sms_for_alerts = isset( $panels['sms'] ) ? $panels['sms'] : null;
		$alerts         = self::alerts_section( $sms_for_alerts );
		if ( ! empty( $alerts ) ) {
			$payload['alerts'] = $alerts;
			$sections[]        = 'alerts';
		}

		$payload['sections'] = $sections;

		return $payload;
	}

	/**
	 * @return string
	 */
	private static function dashboard_locale() {
		return Webino_Dashboard_I18n::get_user_locale();
	}

	/**
	 * @return bool
	 */
	private static function can_products() {
		return Webino_Dashboard_Orders::wc_active() && Webino_Dashboard_Rest_Base::can( 'edit_products' );
	}

	/**
	 * @return bool
	 */
	private static function can_sales() {
		return Webino_Dashboard_Orders::wc_active()
			&& ( Webino_Dashboard_Rest_Base::can( 'view_woocommerce_reports' ) || Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' ) );
	}

	/**
	 * @return bool
	 */
	private static function can_traffic() {
		return Webino_Dashboard_Module_Registry::analytics_ready()
			&& Webino_Dashboard_Rest_Base::can_view_analytics();
	}

	/**
	 * @return bool
	 */
	private static function can_sms() {
		return Webino_Dashboard_Modules::is_module_enabled( 'sms-panel-module' )
			&& Webino_Dashboard_Rest_Base::can( 'manage_options' );
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function products_section() {
		$counts    = wp_count_posts( 'product' );
		$by_status = array();
		$total     = 0;
		if ( $counts ) {
			foreach ( (array) $counts as $status => $num ) {
				if ( 'auto-draft' === $status ) {
					continue;
				}
				$n                   = (int) $num;
				$by_status[ $status ] = $n;
				$total              += $n;
			}
		}

		$by_stock = array(
			'instock'     => 0,
			'outofstock'  => 0,
			'onbackorder' => 0,
		);
		global $wpdb;
		$lookup = $wpdb->prefix . 'wc_product_meta_lookup';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $lookup ) ) === $lookup ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$rows = $wpdb->get_results(
				"SELECT stock_status, COUNT(*) AS cnt FROM {$lookup} GROUP BY stock_status",
				ARRAY_A
			);
			if ( is_array( $rows ) ) {
				foreach ( $rows as $row ) {
					$st = isset( $row['stock_status'] ) ? (string) $row['stock_status'] : '';
					if ( isset( $by_stock[ $st ] ) ) {
						$by_stock[ $st ] = (int) ( $row['cnt'] ?? 0 );
					}
				}
			}
		}

		return array(
			'total'     => $total,
			'by_status' => $by_status,
			'by_stock'  => $by_stock,
		);
	}

	/**
	 * @param WC_Product $product Product.
	 * @return string
	 */
	private static function product_image_url( $product ) {
		if ( ! $product instanceof WC_Product ) {
			return '';
		}
		$thumb_id = $product->get_image_id();
		return $thumb_id ? (string) wp_get_attachment_image_url( (int) $thumb_id, 'thumbnail' ) : '';
	}

	/**
	 * @param WC_Product $product Product.
	 * @return array<string,mixed>
	 */
	private static function product_row( $product ) {
		return array(
			'id'        => $product->get_id(),
			'name'      => $product->get_name(),
			'status'    => $product->get_status(),
			'price'     => $product->get_price(),
			'date'      => $product->get_date_created() ? $product->get_date_created()->date( 'c' ) : '',
			'image_url' => self::product_image_url( $product ),
		);
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,mixed>
	 */
	private static function order_row( $order ) {
		$name = trim( $order->get_formatted_billing_full_name() );
		if ( '' === $name ) {
			$name = $order->get_billing_company();
		}
		if ( '' === $name ) {
			$name = $order->get_billing_email();
		}
		return array(
			'id'            => $order->get_id(),
			'number'        => $order->get_order_number(),
			'status'        => $order->get_status(),
			'status_label'  => wc_get_order_status_name( $order->get_status() ),
			'total'         => $order->get_total(),
			'date'          => $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : '',
			'customer_name' => $name,
			'item_count'    => $order->get_item_count(),
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $rows Product rows with product_id.
	 * @return array<int,array<string,mixed>>
	 */
	private static function enrich_product_report_rows( $rows ) {
		$out = array();
		foreach ( (array) $rows as $row ) {
			$pid = isset( $row['product_id'] ) ? (int) $row['product_id'] : 0;
			$p   = $pid ? wc_get_product( $pid ) : null;
			$out[] = array_merge(
				$row,
				array(
					'image_url' => $p ? self::product_image_url( $p ) : '',
				)
			);
		}
		return $out;
	}

	/**
	 * @param string $locale User locale.
	 * @return array<string,mixed>
	 */
	private static function sales_section_cached( $locale ) {
		$user_id = get_current_user_id();
		$key     = 'webino_dashboard_sales_' . (int) $user_id . '_' . md5( $locale );
		if ( $user_id > 0 ) {
			$cached = get_transient( $key );
			if ( is_array( $cached ) ) {
				return $cached;
			}
		}
		$data = self::sales_section( $locale );
		if ( $user_id > 0 ) {
			set_transient( $key, $data, self::CACHE_TTL );
		}
		return $data;
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function traffic_section_cached() {
		$user_id = get_current_user_id();
		$key     = 'webino_dashboard_traffic_' . (int) $user_id;
		if ( $user_id > 0 ) {
			$cached = get_transient( $key );
			if ( is_array( $cached ) ) {
				return $cached;
			}
		}
		if ( ! class_exists( 'Webino_Dashboard_Analytics_Query', false ) ) {
			return array();
		}
		$data = Webino_Dashboard_Analytics_Query::traffic_periods();
		if ( $user_id > 0 ) {
			set_transient( $key, $data, self::CACHE_TTL );
		}
		return $data;
	}

	/**
	 * @param string $locale User locale.
	 * @return array<string,mixed>
	 */
	private static function sales_section( $locale ) {
		$to_ts    = time();
		$from_ts  = Webino_Dashboard_Locale::calendar_month_start_ts( $locale );
		$statuses = Webino_Dashboard_Order_Reports::default_statuses();
		$current  = Webino_Dashboard_Order_Reports::build_report( $from_ts, $to_ts, 'day', $statuses );
		list( $cmp_from, $cmp_to ) = Webino_Dashboard_Order_Reports::compare_range( $from_ts, $to_ts );
		$prev = Webino_Dashboard_Order_Reports::build_report( $cmp_from, $cmp_to, 'day', $statuses );

		$recent_orders = array();
		if ( Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' ) ) {
			$month_orders = wc_get_orders(
				array(
					'limit'        => 20,
					'orderby'      => 'date',
					'order'        => 'DESC',
					'date_created' => wp_date( 'Y-m-d H:i:s', $from_ts ) . '...' . wp_date( 'Y-m-d H:i:s', $to_ts ),
				)
			);
			foreach ( $month_orders as $o ) {
				if ( ! $o instanceof WC_Order ) {
					continue;
				}
				$recent_orders[] = self::order_row( $o );
			}
		}

		$recent_products = array();
		if ( Webino_Dashboard_Rest_Base::can( 'edit_products' ) ) {
			$ids = wc_get_products(
				array(
					'limit'   => 5,
					'orderby' => 'date',
					'order'   => 'DESC',
					'return'  => 'ids',
					'status'  => array( 'publish', 'draft', 'pending', 'private' ),
				)
			);
			foreach ( (array) $ids as $pid ) {
				$p = wc_get_product( (int) $pid );
				if ( ! $p ) {
					continue;
				}
				$recent_products[] = self::product_row( $p );
			}
		}

		$top_by_views = array();
		$q            = new WP_Query(
			array(
				'post_type'      => 'product',
				'posts_per_page' => 5,
				'post_status'    => array( 'publish' ),
				'meta_key'       => 'post_views_count',
				'orderby'        => 'meta_value_num',
				'order'          => 'DESC',
				'fields'         => 'ids',
			)
		);
		foreach ( (array) $q->posts as $pid ) {
			$p = wc_get_product( (int) $pid );
			if ( ! $p ) {
				continue;
			}
			$top_by_views[] = array(
				'product_id' => (int) $pid,
				'name'       => $p->get_name(),
				'views'      => (int) get_post_meta( (int) $pid, 'post_views_count', true ),
				'image_url'  => self::product_image_url( $p ),
			);
		}
		wp_reset_postdata();

		return array(
			'currency'              => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '',
			'from'                  => $from_ts,
			'to'                    => $to_ts,
			'month_label'           => Webino_Dashboard_Locale::calendar_month_label( $locale ),
			'summary'               => $current['summary'],
			'compare_summary'       => $prev['summary'],
			'series'                => $current['series'],
			'compare_series'        => $prev['series'],
			'recent_orders'         => $recent_orders,
			'recent_products'       => $recent_products,
			'top_products'          => self::enrich_product_report_rows( array_slice( (array) ( $current['top_products'] ?? array() ), 0, 5 ) ),
			'top_products_by_views' => $top_by_views,
			'top_categories'        => array_slice( (array) ( $current['top_categories'] ?? array() ), 0, 5 ),
			'top_customers'         => array_slice( (array) ( $current['top_customers'] ?? array() ), 0, 5 ),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function panels_section() {
		$panels = array();

		if ( self::can_sms() ) {
			$panels['sms'] = self::sms_panel_for_overview();
		}

		$license = Webino_Dashboard_License::instance();
		$panels['license'] = array(
			'active' => $license->is_license_active( false ) || $license->is_demo_mode(),
			'demo'   => $license->is_demo_mode(),
			'status' => (string) get_option( 'webino_dashboard_license_status', '' ),
		);

		$panels['woocommerce'] = array(
			'active' => Webino_Dashboard_Orders::wc_active(),
		);

		$panels['analytics'] = array(
			'active' => Webino_Dashboard_Module_Registry::analytics_ready(),
			'online' => self::can_traffic() && class_exists( 'Webino_Dashboard_Analytics_Query', false )
				? Webino_Dashboard_Analytics_Query::online_count()
				: 0,
		);

		$bots = array();
		foreach ( array( 'bale' => 'bale-bot-module', 'telegram' => 'telegram-bot-module' ) as $which => $mod ) {
			if ( ! Webino_Dashboard_Modules::is_module_enabled( $mod ) ) {
				continue;
			}
			$bot = self::bot_panel_row( $which );
			if ( ! empty( $bot ) ) {
				$bots[] = $bot;
			}
		}
		if ( ! empty( $bots ) ) {
			$panels['bots'] = $bots;
		}

		return $panels;
	}

	/**
	 * SMS panel for overview — uses transient only; never blocks on CRM during build_payload.
	 *
	 * @return array<string,mixed>
	 */
	private static function sms_panel_for_overview() {
		$user_id = get_current_user_id();
		if ( $user_id > 0 ) {
			$cached = get_transient( self::sms_panel_cache_key( $user_id ) );
			if ( is_array( $cached ) ) {
				return $cached;
			}
		}
		return self::sms_panel_placeholder();
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function sms_panel_placeholder() {
		return array(
			'provider'       => 'modirpayamak',
			'balance'        => null,
			'unavailable'    => true,
			'low_balance'    => false,
			'status'         => '',
			'default_from'   => '',
			'price_per_unit' => 0.0,
		);
	}

	/**
	 * @param int $user_id User ID.
	 * @return string
	 */
	private static function sms_panel_cache_key( $user_id ) {
		return 'webino_dashboard_sms_panel_' . (int) $user_id;
	}

	/**
	 * Lazy REST: fetch SMS balance from CRM and refresh transient.
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_sms_panel() {
		if ( ! self::can_sms() ) {
			return new WP_REST_Response( self::sms_panel_placeholder(), 200 );
		}
		$data = self::sms_panel_data();
		$panel = null !== $data ? array_merge( $data, array( 'unavailable' => false ) ) : self::sms_panel_placeholder();
		$user_id = get_current_user_id();
		if ( $user_id > 0 ) {
			set_transient( self::sms_panel_cache_key( $user_id ), $panel, self::SMS_PANEL_CACHE_TTL );
		}
		return new WP_REST_Response( $panel, 200 );
	}

	/**
	 * @return array<string,mixed>|null
	 */
	private static function sms_panel_data() {
		if ( ! Webino_Dashboard_Module_Registry::sms_ready() ) {
			return null;
		}
		$settings = Webino_Dashboard_Sms_Settings::get();
		if ( 'modirpayamak' !== ( $settings['provider'] ?? '' ) ) {
			return null;
		}
		$license = Webino_Dashboard_License::instance();
		$res     = $license->crm_get( 'wp-json/webinocrm/v1/modirpayamak/account' );
		if ( empty( $res['ok'] ) || ! is_array( $res['data'] ?? null ) ) {
			return null;
		}
		$data    = $res['data'];
		$account = isset( $data['account'] ) && is_array( $data['account'] ) ? $data['account'] : $data;
		$balance = isset( $account['balance'] ) ? (float) $account['balance'] : 0.0;
		return array(
			'provider'        => 'modirpayamak',
			'balance'         => $balance,
			'low_balance'     => $balance < self::SMS_LOW_BALANCE,
			'status'          => isset( $account['status'] ) ? (string) $account['status'] : '',
			'default_from'    => isset( $account['default_from'] ) ? (string) $account['default_from'] : '',
			'price_per_unit'  => isset( $account['price_per_unit'] ) ? (float) $account['price_per_unit'] : 0.0,
		);
	}

	/**
	 * @param string $which bale|telegram.
	 * @return array<string,mixed>
	 */
	private static function bot_panel_row( $which ) {
		if ( ! Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' ) ) {
			return array();
		}
		if ( ! Webino_Dashboard_Module_Registry::bots_loader_ready() ) {
			return array();
		}
		Webino_Dashboard_Bots_Loader::register_autoloaders();
		$ctx = Webino_Dashboard_Bots_REST_Context::resolve( $which );
		if ( ! $ctx || ! is_array( $ctx ) ) {
			return array();
		}
		$stats_class   = $ctx['stats_class'];
		$plugin_class  = $ctx['plugin_class'];
		$activity_class = $ctx['activity_class'];
		$sessions      = 0;
		$users_linked  = 0;
		if ( class_exists( $stats_class ) ) {
			/** @var class-string $stats_class */
			$sessions     = (int) $stats_class::count_sessions_active_hours( 24 );
			$users_linked = (int) $stats_class::count_linked_users();
		}
		$webhook_ok = false;
		$token_set  = false;
		if ( class_exists( $plugin_class ) && method_exists( $plugin_class, 'get_settings' ) ) {
			/** @var class-string $plugin_class */
			$s = $plugin_class::get_settings();
			$token      = isset( $s['bot_token'] ) ? trim( (string) $s['bot_token'] ) : '';
			$token_set  = '' !== $token;
			$webhook_ok = '1' === (string) get_option( 'webino_dashboard_' . $which . '_webhook_configured', '' );
		}
		$last_error = '';
		if ( class_exists( $activity_class ) ) {
			/** @var class-string $activity_class */
			$entries = $activity_class::get_entries( time() - 7 * DAY_IN_SECONDS, null, null );
			if ( is_array( $entries ) ) {
				foreach ( array_reverse( $entries ) as $entry ) {
					$level = isset( $entry['level'] ) ? (string) $entry['level'] : 'info';
					if ( in_array( $level, array( 'error', 'warning' ), true ) ) {
						$last_error = isset( $entry['msg'] ) ? (string) $entry['msg'] : '';
						break;
					}
				}
			}
		}
		return array(
			'provider'            => $which,
			'sessions_24h'        => $sessions,
			'users_linked'        => $users_linked,
			'webhook_configured'  => $webhook_ok,
			'token_configured'    => $token_set,
			'last_error'          => $last_error,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function tasks_section() {
		$tasks = array(
			'comments_hold' => array(
				'count' => 0,
				'href'  => '/users/comments',
			),
		);

		if ( Webino_Dashboard_Rest_Base::can( 'moderate_comments' ) ) {
			$counts = Webino_Dashboard_Rest_Crud::comment_counts();
			$tasks['comments_hold']['count'] = (int) ( $counts['hold'] ?? 0 );
		}

		if ( self::can_sales() && Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' ) ) {
			$tasks['orders_processing'] = self::task_orders_block( 'processing' );
			$tasks['orders_on_hold']    = self::task_orders_block( 'on-hold' );
		}

		if ( self::can_products() ) {
			$prod_section = self::products_section();
			$tasks['products_outofstock'] = array(
				'count' => (int) ( $prod_section['by_stock']['outofstock'] ?? 0 ),
				'href'  => '/shop/products',
			);
		}

		return $tasks;
	}

	/**
	 * @param string $status Order status.
	 * @return array{count:int,preview:array<int,array<string,mixed>>}
	 */
	private static function task_orders_block( $status ) {
		$orders = wc_get_orders(
			array(
				'status'  => $status,
				'limit'   => 5,
				'orderby' => 'date',
				'order'   => 'DESC',
			)
		);
		$preview = array();
		foreach ( $orders as $o ) {
			if ( ! $o instanceof WC_Order ) {
				continue;
			}
			$preview[] = self::order_row( $o );
		}
		$count = 0;
		if ( function_exists( 'wc_orders_count' ) ) {
			$count = (int) wc_orders_count( $status );
		} else {
			$result = wc_get_orders(
				array(
					'status'   => $status,
					'limit'    => 1,
					'paginate' => true,
				)
			);
			if ( is_object( $result ) && isset( $result->total ) ) {
				$count = (int) $result->total;
			}
		}
		return array(
			'count'   => $count,
			'preview' => $preview,
			'href'    => '/orders/list?status=' . rawurlencode( $status ),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function comments_section() {
		$list = get_comments(
			array(
				'status' => 'hold',
				'number' => 10,
				'orderby' => 'comment_date_gmt',
				'order'   => 'DESC',
			)
		);
		$items = array();
		foreach ( $list as $c ) {
			$row = Webino_Dashboard_Rest_Crud::serialize_comment( $c );
			if ( $row ) {
				$items[] = $row;
			}
		}
		return array(
			'items'  => $items,
			'counts' => Webino_Dashboard_Rest_Crud::comment_counts(),
		);
	}

	/**
	 * @param array<string,mixed>|null $sms SMS panel data.
	 * @return array<int,array<string,mixed>>
	 */
	private static function alerts_section( $sms ) {
		$alerts = array();

		$license = Webino_Dashboard_License::instance();
		if ( ! $license->is_license_active( false ) && ! $license->is_demo_mode() ) {
			$alerts[] = array(
				'level'   => 'error',
				'source'  => 'license',
				'message' => __( 'Dashboard license is inactive or expired.', 'webino-dashboard' ),
				'at'      => gmdate( 'c' ),
			);
		}

		if ( is_array( $sms ) && ! empty( $sms['low_balance'] ) ) {
			$alerts[] = array(
				'level'   => 'warning',
				'source'  => 'sms-panel-module',
				'message' => __( 'SMS wallet balance is low.', 'webino-dashboard' ),
				'at'      => gmdate( 'c' ),
			);
		}

		$bot_pairs = array(
			array( 'which' => 'bale', 'mod' => 'bale-bot-module', 'source' => 'bale-bot-module' ),
			array( 'which' => 'telegram', 'mod' => 'telegram-bot-module', 'source' => 'telegram-bot-module' ),
		);
		foreach ( $bot_pairs as $pair ) {
			if ( ! Webino_Dashboard_Modules::is_module_enabled( $pair['mod'] ) ) {
				continue;
			}
			if ( ! Webino_Dashboard_Rest_Base::can( 'manage_woocommerce' ) ) {
				continue;
			}
			if ( ! Webino_Dashboard_Module_Registry::bots_loader_ready() ) {
				continue;
			}
			Webino_Dashboard_Bots_Loader::register_autoloaders();
			$ctx = Webino_Dashboard_Bots_REST_Context::resolve( $pair['which'] );
			if ( ! is_array( $ctx ) || empty( $ctx['activity_class'] ) ) {
				continue;
			}
			$activity_class = $ctx['activity_class'];
			if ( ! class_exists( $activity_class ) ) {
				continue;
			}
			/** @var class-string $activity_class */
			$from_ts = time() - 7 * DAY_IN_SECONDS;
			$entries = $activity_class::get_entries( $from_ts, null, null );
			if ( ! is_array( $entries ) ) {
				continue;
			}
			foreach ( array_reverse( $entries ) as $entry ) {
				$level = isset( $entry['level'] ) ? (string) $entry['level'] : 'info';
				if ( ! in_array( $level, array( 'error', 'warning' ), true ) ) {
					continue;
				}
				$alerts[] = array(
					'level'   => $level,
					'source'  => $pair['source'],
					'message' => isset( $entry['msg'] ) ? (string) $entry['msg'] : '',
					'at'      => isset( $entry['ts'] ) ? gmdate( 'c', (int) $entry['ts'] ) : gmdate( 'c' ),
				);
				if ( count( $alerts ) >= 15 ) {
					break 2;
				}
			}
		}

		return $alerts;
	}
}
