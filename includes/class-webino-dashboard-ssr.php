<?php
/**
 * Server-side first paint + route page payloads for the dashboard SPA.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds embedded page data and HTML chrome for sub-1s first paint.
 */
final class Webino_Dashboard_SSR {

	/** @var array<string,mixed>|null */
	private static $page_cache = null;

	/**
	 * Dashboard path relative to /dashboard (no leading slash), e.g. "" or "settings/site/general".
	 *
	 * @return string
	 */
	public static function current_path() {
		$raw = (string) get_query_var( 'wd_path' );
		$raw = trim( $raw, '/' );
		return $raw;
	}

	/**
	 * Route-scoped payload embedded as window.webinoDashboard.page.
	 *
	 * @return array<string,mixed>
	 */
	public static function build_page_payload() {
		if ( null !== self::$page_cache ) {
			return self::$page_cache;
		}

		$path = self::current_path();
		$out  = array(
			'path'      => $path,
			'route'     => self::route_id( $path ),
			'generated' => time(),
		);

		if ( ! is_user_logged_in() ) {
			self::$page_cache = $out;
			return $out;
		}

		$route = $out['route'];

		// Home overview is heavy (sales/traffic/SMS); never build it during HTML render —
		// a timeout/fatal here becomes WCDN 500 on /dashboard/. Client loads via REST after hydrate.
		if ( 'home' === $route ) {
			self::$page_cache = $out;
			return $out;
		}

		if ( 'settings-site-general' === $route && class_exists( 'Webino_Dashboard_REST_Site_Settings', false ) ) {
			$resp = Webino_Dashboard_REST_Site_Settings::general_get();
			if ( $resp instanceof WP_REST_Response ) {
				$data = $resp->get_data();
				if ( is_array( $data ) ) {
					$out['siteGeneral'] = $data;
				}
			}
			self::$page_cache = $out;
			return $out;
		}

		if ( 'settings-site-sms' === $route && class_exists( 'Webino_Dashboard_REST_Site_Settings', false ) ) {
			$resp = Webino_Dashboard_REST_Site_Settings::site_sms_get();
			if ( $resp instanceof WP_REST_Response ) {
				$data = $resp->get_data();
				if ( is_array( $data ) ) {
					$out['siteSms'] = $data;
				}
			}
			self::$page_cache = $out;
			return $out;
		}

		if ( 'settings-shop-invoices' === $route && class_exists( 'Webino_Dashboard_REST_Site_Settings', false ) ) {
			$resp = Webino_Dashboard_REST_Site_Settings::invoices_get();
			if ( $resp instanceof WP_REST_Response ) {
				$data = $resp->get_data();
				if ( is_array( $data ) ) {
					$out['shopInvoices'] = $data;
				}
			}
			self::$page_cache = $out;
			return $out;
		}

		if ( 'settings-shop-sms' === $route && class_exists( 'Webino_Dashboard_REST_Site_Settings', false ) ) {
			$resp = Webino_Dashboard_REST_Site_Settings::sms_get();
			if ( $resp instanceof WP_REST_Response ) {
				$data = $resp->get_data();
				if ( is_array( $data ) ) {
					$out['shopSms'] = $data;
				}
			}
			self::$page_cache = $out;
			return $out;
		}

		if ( 0 === strpos( $route, 'settings-shop-wc-' ) && class_exists( 'Webino_Dashboard_REST_WC_Settings', false ) ) {
			$page = substr( $route, strlen( 'settings-shop-wc-' ) );
			$req  = new WP_REST_Request( 'GET', '/webino-dashboard/v1/shop/wc-settings/' . $page );
			$req->set_param( 'page', $page );
			$req->set_param( 'section', '' );
			$resp = Webino_Dashboard_REST_WC_Settings::page_get( $req );
			if ( $resp instanceof WP_REST_Response ) {
				$data = $resp->get_data();
				if ( is_array( $data ) ) {
					$out['wcSettings'] = $data;
				}
			}
			self::$page_cache = $out;
			return $out;
		}

		if ( 'settings-shop-payments' === $route && class_exists( 'Webino_Dashboard_REST_WC_Settings', false ) ) {
			$resp = Webino_Dashboard_REST_WC_Settings::payment_gateways_get();
			if ( $resp instanceof WP_REST_Response ) {
				$data = $resp->get_data();
				if ( is_array( $data ) ) {
					$out['paymentGateways'] = $data;
				}
			}
			self::$page_cache = $out;
			return $out;
		}

		if ( 'settings-shop-shipping' === $route && class_exists( 'Webino_Dashboard_REST_WC_Settings', false ) ) {
			$resp = Webino_Dashboard_REST_WC_Settings::shipping_zones_get();
			if ( $resp instanceof WP_REST_Response ) {
				$data = $resp->get_data();
				if ( is_array( $data ) ) {
					$out['shippingZones'] = $data;
				}
			}
			self::$page_cache = $out;
			return $out;
		}

		if ( 'settings-shop-emails' === $route && class_exists( 'Webino_Dashboard_REST_WC_Settings', false ) ) {
			$resp = Webino_Dashboard_REST_WC_Settings::emails_get();
			if ( $resp instanceof WP_REST_Response ) {
				$data = $resp->get_data();
				if ( is_array( $data ) ) {
					$out['wcEmails'] = $data;
				}
			}
			self::$page_cache = $out;
			return $out;
		}

		self::$page_cache = $out;
		return $out;
	}

	/**
	 * Map path to a stable route id.
	 *
	 * @param string $path Relative dashboard path.
	 * @return string
	 */
	public static function route_id( $path ) {
		$path = trim( (string) $path, '/' );
		if ( '' === $path || 'home' === $path ) {
			return 'home';
		}
		if ( 'settings' === $path || 'settings/' === $path ) {
			return 'settings-hub';
		}
		if ( preg_match( '#^settings/site/([a-z0-9-]+)$#', $path, $m ) ) {
			return 'settings-site-' . $m[1];
		}
		if ( preg_match( '#^settings/shop/(general|products|tax|advanced)$#', $path, $m ) ) {
			$map = array(
				'general'  => 'general',
				'products' => 'products',
				'tax'      => 'tax',
				'advanced' => 'advanced',
			);
			return 'settings-shop-wc-' . $map[ $m[1] ];
		}
		if ( preg_match( '#^settings/shop/(payments|shipping|emails|invoices|sms|pricing)$#', $path, $m ) ) {
			return 'settings-shop-' . $m[1];
		}
		if ( preg_match( '#^settings/shop/#', $path ) ) {
			return 'settings-shop';
		}
		if ( preg_match( '#^settings/#', $path ) ) {
			return 'settings';
		}
		return 'app';
	}

	/**
	 * Invalidate user-scoped dashboard overview + bootstrap caches.
	 *
	 * @param int|null $user_id User ID or null for current + all known.
	 * @return void
	 */
	public static function invalidate_user_caches( $user_id = null ) {
		$ids = array();
		if ( null !== $user_id && (int) $user_id > 0 ) {
			$ids[] = (int) $user_id;
		} else {
			$cur = get_current_user_id();
			if ( $cur > 0 ) {
				$ids[] = $cur;
			}
		}
		foreach ( array_unique( $ids ) as $uid ) {
			delete_transient( 'webino_dashboard_boot_' . $uid );
			$locale = (string) get_user_meta( $uid, 'webino_dashboard_locale', true );
			$locales = array( 'fa_IR', 'en_US', 'fa', 'en', determine_locale() );
			if ( $locale ) {
				$locales[] = $locale;
			}
			foreach ( array_unique( array_filter( $locales ) ) as $loc ) {
				$hash = md5( (string) $loc );
				delete_transient( 'webino_dashboard_overview_' . $uid . '_' . $hash );
				delete_transient( 'webino_dashboard_overview_v2_' . $uid . '_' . $hash );
				delete_transient( 'webino_dashboard_overview_v3_' . $uid . '_' . $hash );
				delete_transient( 'webino_dashboard_sales_' . $uid . '_' . $hash );
				delete_transient( 'webino_dashboard_sales_v2_' . $uid . '_' . $hash );
			}
			delete_transient( 'webino_dashboard_traffic_' . $uid );
			delete_transient( 'webino_dashboard_traffic_v2_' . $uid );
		}
	}

	/**
	 * Render first-paint chrome HTML inside #root (replaced by React after boot).
	 *
	 * @param array<string,mixed>|null $bootstrap Bootstrap snapshot.
	 * @param array<string,mixed>|null $page      Page payload.
	 * @return void
	 */
	public static function render_first_paint( $bootstrap = null, $page = null ) {
		$site_name = get_bloginfo( 'name' );
		$user      = wp_get_current_user();
		$user_name = $user instanceof WP_User && $user->ID ? ( $user->display_name ?: $user->user_login ) : '';
		$route     = is_array( $page ) && isset( $page['route'] ) ? (string) $page['route'] : self::route_id( self::current_path() );
		$is_dark   = is_array( $bootstrap ) && isset( $bootstrap['uiTheme'] ) && 'dark' === $bootstrap['uiTheme'];
		$title     = self::first_paint_title( $route );
		$bg        = $is_dark ? '#141414' : '#fafafa';
		$fg        = $is_dark ? '#f5f5f5' : '#171717';
		$muted     = $is_dark ? '#a3a3a3' : '#737373';
		$card      = $is_dark ? '#262626' : '#ffffff';
		$border    = $is_dark ? 'rgba(255,255,255,0.1)' : '#e5e5e5';
		$primary   = $is_dark ? '#e5e5e5' : '#171717';
		$sidebar_w = '16rem';

		echo '<div data-wd-ssr="chrome" style="box-sizing:border-box;display:flex;min-height:100vh;background:' . esc_attr( $bg ) . ';color:' . esc_attr( $fg ) . ';font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">';

		// Sidebar chrome (desktop hint; mobile uses stacked header).
		echo '<aside aria-hidden="true" style="display:none;width:' . esc_attr( $sidebar_w ) . ';flex-shrink:0;border-inline-end:1px solid ' . esc_attr( $border ) . ';background:' . esc_attr( $is_dark ? '#1a1a1a' : '#f5f5f5' ) . ';padding:1rem;" class="wd-ssr-sidebar">';
		echo '<div style="font-weight:600;font-size:0.95rem;margin-bottom:1.25rem;">' . esc_html( $site_name ) . '</div>';
		echo '<div style="height:0.5rem;width:70%;border-radius:999px;background:' . esc_attr( $border ) . ';margin-bottom:0.5rem;"></div>';
		echo '<div style="height:0.5rem;width:55%;border-radius:999px;background:' . esc_attr( $border ) . ';margin-bottom:0.5rem;"></div>';
		echo '<div style="height:0.5rem;width:62%;border-radius:999px;background:' . esc_attr( $border ) . ';"></div>';
		echo '</aside>';

		echo '<div style="flex:1;min-width:0;display:flex;flex-direction:column;">';
		echo '<header style="height:3.5rem;display:flex;align-items:center;gap:0.75rem;padding:0 1rem;border-bottom:1px solid ' . esc_attr( $border ) . ';">';
		echo '<div style="width:2rem;height:2rem;border-radius:0.5rem;background:' . esc_attr( $border ) . ';"></div>';
		echo '<div style="font-size:0.875rem;font-weight:500;">' . esc_html( $title ) . '</div>';
		if ( $user_name ) {
			echo '<div style="margin-inline-start:auto;font-size:0.75rem;color:' . esc_attr( $muted ) . ';">' . esc_html( $user_name ) . '</div>';
		}
		echo '</header>';

		echo '<main style="padding:1rem;flex:1;">';
		echo '<div style="margin-bottom:1rem;">';
		echo '<h1 style="margin:0;font-size:1.25rem;font-weight:600;letter-spacing:-0.02em;">' . esc_html( $title ) . '</h1>';
		echo '<p style="margin:0.35rem 0 0;font-size:0.8125rem;color:' . esc_attr( $muted ) . ';">' . esc_html( $site_name ) . '</p>';
		echo '</div>';

		self::render_route_cards( $route, $page, $card, $border, $muted, $primary, $fg );

		echo '</main>';
		echo '</div>';
		echo '</div>';

		// Show sidebar from md+.
		echo '<style>.wd-ssr-sidebar{display:none!important;}@media(min-width:768px){.wd-ssr-sidebar{display:block!important;}}</style>';
	}

	/**
	 * @param string $route Route id.
	 * @return string
	 */
	private static function first_paint_title( $route ) {
		if ( 'home' === $route ) {
			return __( 'Overview', 'webino-dashboard' );
		}
		if ( 'settings-hub' === $route ) {
			return __( 'Settings', 'webino-dashboard' );
		}
		if ( 0 === strpos( $route, 'settings-site' ) ) {
			return __( 'Site settings', 'webino-dashboard' );
		}
		if ( 0 === strpos( $route, 'settings-shop' ) ) {
			return __( 'Shop settings', 'webino-dashboard' );
		}
		return __( 'Dashboard', 'webino-dashboard' );
	}

	/**
	 * @param string               $route   Route id.
	 * @param array<string,mixed>|null $page Page payload.
	 * @param string               $card    Card bg.
	 * @param string               $border  Border color.
	 * @param string               $muted   Muted text.
	 * @param string               $primary Primary.
	 * @param string               $fg      Foreground.
	 * @return void
	 */
	private static function render_route_cards( $route, $page, $card, $border, $muted, $primary, $fg ) {
		$card_style = 'background:' . esc_attr( $card ) . ';border:1px solid ' . esc_attr( $border ) . ';border-radius:1rem;padding:1.25rem;box-shadow:0 1px 2px rgb(0 0 0 / 0.04);';

		if ( 'home' === $route && is_array( $page ) && isset( $page['overview'] ) && is_array( $page['overview'] ) ) {
			$ov     = $page['overview'];
			$sales  = isset( $ov['sales']['summary']['revenue'] ) ? $ov['sales']['summary']['revenue'] : null;
			$orders = isset( $ov['sales']['summary']['order_count'] ) ? $ov['sales']['summary']['order_count'] : null;
			echo '<div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));margin-bottom:1rem;">';
			self::stat_card( $card_style, __( 'Revenue', 'webino-dashboard' ), null !== $sales ? (string) $sales : '—', $muted, $fg );
			self::stat_card( $card_style, __( 'Orders', 'webino-dashboard' ), null !== $orders ? (string) (int) $orders : '—', $muted, $fg );
			echo '</div>';
			echo '<div style="' . $card_style . 'min-height:8rem;"></div>';
			return;
		}

		if ( 'settings-hub' === $route ) {
			echo '<div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));max-width:48rem;margin:0 auto;">';
			echo '<div style="' . $card_style . '"><div style="font-weight:600;margin-bottom:0.35rem;">' . esc_html__( 'Site', 'webino-dashboard' ) . '</div><div style="font-size:0.8125rem;color:' . esc_attr( $muted ) . ';">' . esc_html__( 'General, license, modules…', 'webino-dashboard' ) . '</div></div>';
			echo '<div style="' . $card_style . '"><div style="font-weight:600;margin-bottom:0.35rem;">' . esc_html__( 'Shop', 'webino-dashboard' ) . '</div><div style="font-size:0.8125rem;color:' . esc_attr( $muted ) . ';">' . esc_html__( 'Payments, shipping, emails…', 'webino-dashboard' ) . '</div></div>';
			echo '</div>';
			return;
		}

		if ( 0 === strpos( $route, 'settings-' ) ) {
			echo '<div style="display:flex;flex-direction:column;gap:1rem;">';
			echo '<div style="' . $card_style . '"><div style="height:0.75rem;width:40%;border-radius:999px;background:' . esc_attr( $border ) . ';margin-bottom:1rem;"></div>';
			echo '<div style="height:2.25rem;width:100%;max-width:28rem;border-radius:0.5rem;background:' . esc_attr( $border ) . ';margin-bottom:0.75rem;"></div>';
			echo '<div style="height:2.25rem;width:100%;max-width:28rem;border-radius:0.5rem;background:' . esc_attr( $border ) . ';margin-bottom:0.75rem;"></div>';
			echo '<div style="height:2rem;width:6rem;border-radius:0.5rem;background:' . esc_attr( $primary ) . ';opacity:0.85;"></div>';
			echo '</div></div>';
			return;
		}

		echo '<div style="' . $card_style . 'min-height:12rem;display:flex;align-items:center;justify-content:center;color:' . esc_attr( $muted ) . ';font-size:0.875rem;">' . esc_html__( 'Loading…', 'webino-dashboard' ) . '</div>';
	}

	/**
	 * @param string $card_style Inline card style.
	 * @param string $label Label.
	 * @param string $value Value.
	 * @param string $muted Muted color.
	 * @param string $fg Foreground.
	 * @return void
	 */
	private static function stat_card( $card_style, $label, $value, $muted, $fg ) {
		echo '<div style="' . $card_style . '">';
		echo '<div style="font-size:0.75rem;color:' . esc_attr( $muted ) . ';margin-bottom:0.35rem;">' . esc_html( $label ) . '</div>';
		echo '<div style="font-size:1.35rem;font-weight:600;color:' . esc_attr( $fg ) . ';">' . esc_html( $value ) . '</div>';
		echo '</div>';
	}
}
