<?php
/**
 * Site-level brand style: accent, palette, logo/favicon, fonts.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared brand style for dashboard + AI + WFCP.
 */
final class Webino_Dashboard_Brand_Style {

	const OPTION = 'webino_dashboard_brand_style';

	/**
	 * @return list<string>
	 */
	public static function allowed_accents() {
		return array( 'colorful', 'default', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet', 'cafe', 'cosmetics', 'mobile', 'electronics' );
	}

	/**
	 * @return list<string>
	 */
	public static function allowed_fonts() {
		return array( 'yekanbakh', 'system' );
	}

	/**
	 * @return array{
	 *   accent: string,
	 *   colors: array<string, string>,
	 *   logo_id: int,
	 *   favicon_id: int,
	 *   fonts: array{body: string, heading: string, ui: string}
	 * }
	 */
	public static function defaults() {
		return array(
			'accent'     => 'colorful',
			'colors'     => array(
				'primary'   => '#0f172a',
				'secondary' => '#334155',
				'accent'    => '#e11d48',
				'bg'        => '#ffffff',
				'surface'   => '#f8fafc',
				'text'      => '#0f172a',
				'muted'     => '#64748b',
			),
			'logo_id'    => 0,
			'favicon_id' => 0,
			'fonts'      => array(
				'body'    => 'yekanbakh',
				'heading' => 'yekanbakh',
				'ui'      => 'yekanbakh',
			),
		);
	}

	/**
	 * @return array{
	 *   accent: string,
	 *   colors: array<string, string>,
	 *   logo_id: int,
	 *   favicon_id: int,
	 *   fonts: array{body: string, heading: string, ui: string}
	 * }
	 */
	public static function get() {
		$raw = get_option( self::OPTION, null );
		return self::sanitize( $raw );
	}

	/**
	 * @param mixed $raw Raw.
	 * @return array{
	 *   accent: string,
	 *   colors: array<string, string>,
	 *   logo_id: int,
	 *   favicon_id: int,
	 *   fonts: array{body: string, heading: string, ui: string}
	 * }
	 */
	public static function sanitize( $raw ) {
		$defaults = self::defaults();
		if ( ! is_array( $raw ) ) {
			return $defaults;
		}

		$out = $defaults;

		$accent = isset( $raw['accent'] ) ? sanitize_key( (string) $raw['accent'] ) : '';
		if ( 'amber' === $accent ) {
			$accent = 'orange';
		}
		if ( in_array( $accent, self::allowed_accents(), true ) ) {
			$out['accent'] = $accent;
		}

		if ( isset( $raw['colors'] ) && is_array( $raw['colors'] ) ) {
			foreach ( array_keys( $defaults['colors'] ) as $key ) {
				if ( ! isset( $raw['colors'][ $key ] ) ) {
					continue;
				}
				$hex = self::sanitize_hex( (string) $raw['colors'][ $key ] );
				if ( '' !== $hex ) {
					$out['colors'][ $key ] = $hex;
				}
			}
		}

		$out['logo_id']    = isset( $raw['logo_id'] ) ? max( 0, (int) $raw['logo_id'] ) : 0;
		$out['favicon_id'] = isset( $raw['favicon_id'] ) ? max( 0, (int) $raw['favicon_id'] ) : 0;

		if ( isset( $raw['fonts'] ) && is_array( $raw['fonts'] ) ) {
			foreach ( array( 'body', 'heading', 'ui' ) as $slot ) {
				if ( ! isset( $raw['fonts'][ $slot ] ) ) {
					continue;
				}
				$f = sanitize_key( (string) $raw['fonts'][ $slot ] );
				if ( in_array( $f, self::allowed_fonts(), true ) ) {
					$out['fonts'][ $slot ] = $f;
				}
			}
		}

		return $out;
	}

	/**
	 * @param mixed $raw Raw settings.
	 * @return array{
	 *   accent: string,
	 *   colors: array<string, string>,
	 *   logo_id: int,
	 *   favicon_id: int,
	 *   fonts: array{body: string, heading: string, ui: string}
	 * }
	 */
	public static function set( $raw ) {
		$clean = self::sanitize( $raw );
		update_option( self::OPTION, $clean, false );

		// Keep WP site icon in sync for PWA / get_site_icon_url().
		$fav = (int) $clean['favicon_id'];
		if ( $fav > 0 && wp_attachment_is_image( $fav ) ) {
			update_option( 'site_icon', $fav );
		} elseif ( 0 === $fav ) {
			// Do not clear WP site_icon automatically — leave existing WP Customizer icon.
		}

		return $clean;
	}

	/**
	 * Brand color palette (AI-compatible slots).
	 *
	 * @return array<string, string>
	 */
	public static function palette() {
		return self::get()['colors'];
	}

	/**
	 * Locked dashboard accent for all users.
	 *
	 * @return string
	 */
	public static function accent() {
		return self::get()['accent'];
	}

	/**
	 * @param int $attachment_id Attachment ID.
	 * @return string
	 */
	public static function attachment_url( $attachment_id ) {
		$id = (int) $attachment_id;
		if ( $id <= 0 ) {
			return '';
		}
		$url = wp_get_attachment_image_url( $id, 'full' );
		return is_string( $url ) ? $url : '';
	}

	/**
	 * @return string
	 */
	public static function logo_url() {
		return self::attachment_url( self::get()['logo_id'] );
	}

	/**
	 * @return string
	 */
	public static function favicon_url() {
		$s = self::get();
		if ( ! empty( $s['favicon_id'] ) ) {
			$url = self::attachment_url( (int) $s['favicon_id'] );
			if ( '' !== $url ) {
				return $url;
			}
		}
		$site = get_site_icon_url( 192 );
		return is_string( $site ) ? $site : '';
	}

	/**
	 * CSS font-family value for a font key.
	 *
	 * @param string $key yekanbakh|system.
	 * @return string
	 */
	public static function font_family_css( $key ) {
		$key = sanitize_key( (string) $key );
		if ( 'system' === $key ) {
			return "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
		}
		return "'Yekan Bakh',Tahoma,sans-serif";
	}

	/**
	 * Inline CSS variables for html element (FOUC-safe).
	 *
	 * @return string
	 */
	public static function inline_font_css() {
		$fonts = self::get()['fonts'];
		$body  = self::font_family_css( $fonts['body'] );
		$head  = self::font_family_css( $fonts['heading'] );
		$ui    = self::font_family_css( $fonts['ui'] );
		return '--wd-font-body:' . $body . ';--wd-font-heading:' . $head . ';--wd-font-ui:' . $ui . ';';
	}

	/**
	 * Bootstrap / REST client payload.
	 *
	 * @return array<string, mixed>
	 */
	public static function client_payload() {
		$s = self::get();
		return array(
			'accent'     => $s['accent'],
			'colors'     => $s['colors'],
			'logo_id'    => (int) $s['logo_id'],
			'favicon_id' => (int) $s['favicon_id'],
			'fonts'      => $s['fonts'],
			'logoUrl'    => self::logo_url(),
			'faviconUrl' => self::favicon_url(),
		);
	}

	/**
	 * REST GET/POST response (includes resolved URLs for pickers).
	 *
	 * @return array<string, mixed>
	 */
	public static function settings_response() {
		$s = self::get();
		return array(
			'accent'      => $s['accent'],
			'colors'      => $s['colors'],
			'logo_id'     => (int) $s['logo_id'],
			'favicon_id'  => (int) $s['favicon_id'],
			'fonts'       => $s['fonts'],
			'logo_url'    => self::logo_url(),
			'favicon_url' => self::favicon_url(),
		);
	}

	/**
	 * Aggregated appearance payload for settings/style UI.
	 *
	 * @return array<string, mixed>
	 */
	public static function settings_response_full() {
		$out = self::settings_response();

		$out['geo_notice'] = null;
		if ( class_exists( 'Webino_Dashboard_Checkout_Geo', false ) ) {
			$geo = Webino_Dashboard_Checkout_Geo::get_settings();
			$out['geo_notice'] = array(
				'colors' => isset( $geo['colors'] ) && is_array( $geo['colors'] ) ? $geo['colors'] : array(),
			);
		}

		$out['wfcp']     = null;
		$out['wfcp_available'] = false;
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) && Webino_Dashboard_Module_Registry::wfcp_ready() && class_exists( 'WFCP_Helper', false ) ) {
			$out['wfcp_available'] = true;
			$style = WFCP_Helper::get_settings( 'style' );
			if ( ! is_array( $style ) ) {
				$style = array();
			}
			$out['wfcp'] = self::wfcp_appearance_slice( $style );
		}

		$out['pwa'] = null;
		if ( class_exists( 'Webino_Dashboard_PWA', false ) ) {
			$pwa = Webino_Dashboard_PWA::get_settings();
			$out['pwa'] = array(
				'theme_color'      => (string) ( $pwa['theme_color'] ?? '#0f172a' ),
				'background_color' => (string) ( $pwa['background_color'] ?? '#ffffff' ),
			);
		}

		$out['order_documents'] = null;
		if ( class_exists( 'Webino_Dashboard_Order_Document_Settings', false ) ) {
			$docs = Webino_Dashboard_Order_Document_Settings::get();
			$out['order_documents'] = array(
				'accent_color'     => (string) ( $docs['accent_color'] ?? '#e775ae' ),
				'logo_url'         => (string) ( $docs['logo_url'] ?? '' ),
				'invoice_logo_id'  => (int) ( $docs['invoice_logo_id'] ?? 0 ),
				'invoice_logo_url' => (string) ( $docs['invoice_logo_url'] ?? '' ),
				'receipt_logo_id'  => (int) ( $docs['receipt_logo_id'] ?? 0 ),
				'receipt_logo_url' => (string) ( $docs['receipt_logo_url'] ?? '' ),
				'label_logo_id'    => (int) ( $docs['label_logo_id'] ?? 0 ),
				'label_logo_url'   => (string) ( $docs['label_logo_url'] ?? '' ),
			);
		}

		$out['coffee_profile'] = null;
		$out['coffee_available'] = false;
		if (
			class_exists( 'Webino_Dashboard_Coffee_Profile', false )
			&& class_exists( 'Webino_Dashboard_Module_Registry', false )
			&& Webino_Dashboard_Module_Registry::is_active( 'coffee-profile-module' )
		) {
			$out['coffee_available'] = true;
			$c = Webino_Dashboard_Coffee_Profile::get_settings();
			$out['coffee_profile'] = array(
				'colors'       => isset( $c['colors'] ) && is_array( $c['colors'] ) ? $c['colors'] : array(),
				'font_title'   => (int) ( $c['font_title'] ?? 16 ),
				'font_label'   => (int) ( $c['font_label'] ?? 12 ),
				'font_value'   => (int) ( $c['font_value'] ?? 13 ),
				'radius'       => (int) ( $c['radius'] ?? 16 ),
				'gap'          => (int) ( $c['gap'] ?? 20 ),
				'bar_height'   => (int) ( $c['bar_height'] ?? 10 ),
				'stroke_width' => (int) ( $c['stroke_width'] ?? 2 ),
			);
		}

		return $out;
	}

	/**
	 * Persist aggregated appearance from settings/style POST.
	 *
	 * @param array<string, mixed> $params Raw POST body.
	 * @return array<string, mixed>
	 */
	public static function save_aggregate( $params ) {
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		// Brand core (ignore nested blocks when merging into brand option).
		$brand_keys = array( 'accent', 'colors', 'logo_id', 'favicon_id', 'fonts' );
		$brand_in   = array();
		foreach ( $brand_keys as $k ) {
			if ( array_key_exists( $k, $params ) ) {
				$brand_in[ $k ] = $params[ $k ];
			}
		}
		if ( $brand_in ) {
			$merged = array_replace_recursive( self::get(), $brand_in );
			self::set( $merged );
		}

		if ( isset( $params['geo_notice'] ) && is_array( $params['geo_notice'] ) && class_exists( 'Webino_Dashboard_Checkout_Geo', false ) ) {
			$cur = Webino_Dashboard_Checkout_Geo::get_settings();
			if ( isset( $params['geo_notice']['colors'] ) && is_array( $params['geo_notice']['colors'] ) ) {
				$cur['colors'] = $params['geo_notice']['colors'];
				Webino_Dashboard_Checkout_Geo::set_settings( $cur );
			}
		}

		if ( isset( $params['wfcp'] ) && is_array( $params['wfcp'] ) && class_exists( 'WFCP_Helper', false ) ) {
			$slice = self::wfcp_appearance_slice( $params['wfcp'] );
			WFCP_Helper::update_settings( 'style', $slice );
		}

		if ( isset( $params['pwa'] ) && is_array( $params['pwa'] ) && class_exists( 'Webino_Dashboard_PWA', false ) ) {
			$pwa = Webino_Dashboard_PWA::get_settings();
			if ( isset( $params['pwa']['theme_color'] ) ) {
				$pwa['theme_color'] = (string) $params['pwa']['theme_color'];
			}
			if ( isset( $params['pwa']['background_color'] ) ) {
				$pwa['background_color'] = (string) $params['pwa']['background_color'];
			}
			$clean = Webino_Dashboard_PWA::sanitize_settings( $pwa );
			update_option( Webino_Dashboard_PWA::OPTION, $clean, false );
		}

		if ( isset( $params['order_documents'] ) && is_array( $params['order_documents'] ) && class_exists( 'Webino_Dashboard_Order_Document_Settings', false ) ) {
			$docs  = Webino_Dashboard_Order_Document_Settings::get();
			$allow = array(
				'accent_color',
				'logo_url',
				'invoice_logo_id',
				'invoice_logo_url',
				'receipt_logo_id',
				'receipt_logo_url',
				'label_logo_id',
				'label_logo_url',
			);
			foreach ( $allow as $k ) {
				if ( array_key_exists( $k, $params['order_documents'] ) ) {
					$docs[ $k ] = $params['order_documents'][ $k ];
				}
			}
			Webino_Dashboard_Order_Document_Settings::save( $docs );
		}

		if ( isset( $params['coffee_profile'] ) && is_array( $params['coffee_profile'] ) && class_exists( 'Webino_Dashboard_Coffee_Profile', false ) ) {
			$c     = Webino_Dashboard_Coffee_Profile::get_settings();
			$cp    = $params['coffee_profile'];
			$allow = array( 'colors', 'font_title', 'font_label', 'font_value', 'radius', 'gap', 'bar_height', 'stroke_width' );
			foreach ( $allow as $k ) {
				if ( array_key_exists( $k, $cp ) ) {
					$c[ $k ] = $cp[ $k ];
				}
			}
			Webino_Dashboard_Coffee_Profile::save_settings( $c );
		}

		return self::settings_response_full();
	}

	/**
	 * @param array<string, mixed> $style Raw WFCP style.
	 * @return array<string, mixed>
	 */
	private static function wfcp_appearance_slice( $style ) {
		$keys = array(
			'box_background',
			'box_border_color',
			'button_background',
			'button_text_color',
			'price_color',
			'alert_bg',
			'alert_text_color',
			'alert_border_color',
			'alert_accent',
			'badge_cash_bg',
			'badge_cash_text',
			'badge_credit_bg',
			'badge_credit_text',
			'badge_installment_bg',
			'badge_installment_text',
			'timeline_dot',
			'timeline_line',
			'timeline_today_text',
			'timeline_future_text',
			'border_radius',
		);
		$out = array();
		foreach ( $keys as $k ) {
			if ( array_key_exists( $k, $style ) ) {
				$out[ $k ] = $style[ $k ];
			}
		}
		return $out;
	}

	/**
	 * @param string $hex Color.
	 * @return string
	 */
	private static function sanitize_hex( $hex ) {
		$hex = trim( (string) $hex );
		if ( function_exists( 'sanitize_hex_color' ) ) {
			$s = sanitize_hex_color( $hex );
			return is_string( $s ) ? $s : '';
		}
		if ( preg_match( '/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/', $hex ) ) {
			return strtolower( $hex );
		}
		return '';
	}
}
