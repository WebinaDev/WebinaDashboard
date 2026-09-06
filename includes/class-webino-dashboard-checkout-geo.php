<?php
/**
 * Checkout GEO notice: multi-source geo check + VPN warning popup.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Site-level settings + always-on checker for checkout / pay-order (cache-safe via JS).
 */
final class Webino_Dashboard_Checkout_Geo {

	const OPTION        = 'webino_dashboard_checkout_geo_notice';
	const TRANSIENT_TTL = 600;
	const HTTP_TIMEOUT  = 2;

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'wp_footer', array( __CLASS__, 'maybe_print_checkout_modal' ), 50 );
	}

	/**
	 * @return array{
	 *   enabled: bool,
	 *   services: array<string, bool>,
	 *   colors: array<string, string>
	 * }
	 */
	public static function defaults() {
		return array(
			'enabled'  => true,
			'services' => array(
				'cloudflare'  => true,
				'woocommerce' => true,
				'analytics'   => true,
				'ip_api'      => true,
				'ipwho'       => true,
				'geojs'       => true,
				'country_is'  => true,
			),
			'colors'   => array(
				'overlay'     => '#0f172a',
				'dialog'      => '#ffffff',
				'title'       => '#0f172a',
				'text'        => '#334155',
				'button'      => '#0f172a',
				'button_text' => '#ffffff',
			),
		);
	}

	/**
	 * @return array{
	 *   enabled: bool,
	 *   services: array<string, bool>,
	 *   colors: array<string, string>
	 * }
	 */
	public static function get_settings() {
		$raw = get_option( self::OPTION, null );
		return self::sanitize_settings( $raw );
	}

	/**
	 * Normalize legacy '1'/'0' and partial arrays.
	 *
	 * @param mixed $raw Raw option.
	 * @return array{
	 *   enabled: bool,
	 *   services: array<string, bool>,
	 *   colors: array<string, string>
	 * }
	 */
	public static function sanitize_settings( $raw ) {
		$defaults = self::defaults();

		if ( null === $raw ) {
			return $defaults;
		}

		// Legacy scalar toggle.
		if ( ! is_array( $raw ) ) {
			$defaults['enabled'] = ! empty( $raw ) && '0' !== (string) $raw && 'false' !== (string) $raw;
			return $defaults;
		}

		$out = $defaults;
		if ( array_key_exists( 'enabled', $raw ) ) {
			$out['enabled'] = ! empty( $raw['enabled'] ) && '0' !== (string) $raw['enabled'] && 'false' !== (string) $raw['enabled'];
		}

		if ( isset( $raw['services'] ) && is_array( $raw['services'] ) ) {
			foreach ( array_keys( $defaults['services'] ) as $key ) {
				if ( array_key_exists( $key, $raw['services'] ) ) {
					$out['services'][ $key ] = ! empty( $raw['services'][ $key ] )
						&& '0' !== (string) $raw['services'][ $key ]
						&& 'false' !== (string) $raw['services'][ $key ];
				}
			}
		}

		if ( isset( $raw['colors'] ) && is_array( $raw['colors'] ) ) {
			foreach ( array_keys( $defaults['colors'] ) as $key ) {
				if ( ! isset( $raw['colors'][ $key ] ) ) {
					continue;
				}
				$hex = self::sanitize_hex_color( (string) $raw['colors'][ $key ] );
				if ( '' !== $hex ) {
					$out['colors'][ $key ] = $hex;
				}
			}
		}

		return $out;
	}

	/**
	 * @param mixed $settings Settings.
	 * @return array{
	 *   enabled: bool,
	 *   services: array<string, bool>,
	 *   colors: array<string, string>
	 * }
	 */
	public static function set_settings( $settings ) {
		$clean = self::sanitize_settings( $settings );
		update_option( self::OPTION, $clean, false );
		return $clean;
	}

	/**
	 * @param string $hex Hex color.
	 * @param float  $alpha Alpha 0–1.
	 * @return string
	 */
	private static function hex_to_rgba( $hex, $alpha = 0.55 ) {
		$hex = ltrim( (string) $hex, '#' );
		if ( 3 === strlen( $hex ) ) {
			$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
		}
		if ( 6 !== strlen( $hex ) || ! ctype_xdigit( $hex ) ) {
			return 'rgba(15,23,42,' . (float) $alpha . ')';
		}
		$r = hexdec( substr( $hex, 0, 2 ) );
		$g = hexdec( substr( $hex, 2, 2 ) );
		$b = hexdec( substr( $hex, 4, 2 ) );
		$a = max( 0, min( 1, (float) $alpha ) );
		return 'rgba(' . $r . ',' . $g . ',' . $b . ',' . $a . ')';
	}

	/**
	 * @param string $hex Color.
	 * @return string
	 */
	private static function sanitize_hex_color( $hex ) {
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

	/**
	 * Enabled by default when option is missing.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		return ! empty( self::get_settings()['enabled'] );
	}

	/**
	 * @param bool $enabled Enabled.
	 * @return void
	 */
	public static function set_enabled( $enabled ) {
		$s             = self::get_settings();
		$s['enabled']  = (bool) $enabled;
		self::set_settings( $s );
	}

	/**
	 * @param string $key Service key.
	 * @return bool
	 */
	public static function is_service_enabled( $key ) {
		$s = self::get_settings();
		return ! empty( $s['services'][ (string) $key ] );
	}

	/**
	 * @return bool
	 */
	public static function has_any_service_enabled() {
		$s = self::get_settings();
		foreach ( $s['services'] as $on ) {
			if ( ! empty( $on ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Whether current request is a payment-related storefront page.
	 *
	 * @return bool
	 */
	public static function is_payment_page() {
		if ( is_admin() ) {
			return false;
		}

		if ( function_exists( 'is_checkout' ) && is_checkout() ) {
			return true;
		}
		if ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'order-pay' ) ) {
			return true;
		}

		$uri  = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
		$path = strtolower( (string) wp_parse_url( $uri, PHP_URL_PATH ) );
		if ( '' !== $path ) {
			if ( false !== strpos( $path, '/checkout' ) || false !== strpos( $path, '/pay-order' ) ) {
				return true;
			}
			if ( false !== strpos( $path, 'تسویه' ) || false !== strpos( rawurldecode( $path ), 'تسویه' ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Best-effort ISO country from multiple sources (any non-empty wins in order).
	 * Empty string = unknown.
	 *
	 * @return string
	 */
	public static function visitor_country() {
		$votes = self::collect_country_votes();
		foreach ( $votes as $code ) {
			if ( '' !== $code ) {
				return $code;
			}
		}
		return '';
	}

	/**
	 * True when at least one known source says country is not IR.
	 *
	 * @return bool
	 */
	public static function should_show_notice() {
		if ( ! self::is_enabled() || ! self::has_any_service_enabled() ) {
			return false;
		}
		foreach ( self::collect_country_votes() as $code ) {
			if ( '' !== $code && 'IR' !== $code ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @return list<string> Country codes.
	 */
	private static function collect_country_votes() {
		$out = array();

		if ( self::is_service_enabled( 'cloudflare' ) ) {
			$cf = self::normalize_country( isset( $_SERVER['HTTP_CF_IPCOUNTRY'] ) ? (string) wp_unslash( $_SERVER['HTTP_CF_IPCOUNTRY'] ) : '' );
			if ( '' !== $cf ) {
				$out[] = $cf;
			}
		}

		$ip = self::client_ip();
		if ( '' === $ip || self::is_private_ip( $ip ) ) {
			return $out;
		}

		$svc_mask = self::services_cache_mask();
		$cache_key = 'wd_geo_cc_' . md5( $ip . '|' . $svc_mask );
		$cached    = get_transient( $cache_key );
		if ( is_array( $cached ) ) {
			foreach ( $cached as $c ) {
				$n = self::normalize_country( (string) $c );
				if ( '' !== $n ) {
					$out[] = $n;
				}
			}
			return array_values( array_unique( $out ) );
		}

		$fresh = array();

		if ( self::is_service_enabled( 'woocommerce' ) && class_exists( 'WC_Geolocation', false ) ) {
			$data = WC_Geolocation::geolocate_ip( $ip, true, false );
			if ( is_array( $data ) && ! empty( $data['country'] ) ) {
				$n = self::normalize_country( (string) $data['country'] );
				if ( '' !== $n ) {
					$fresh[] = $n;
				}
			}
		}

		if ( self::is_service_enabled( 'analytics' ) && class_exists( 'Webino_Dashboard_Analytics_Geo', false ) ) {
			$geo = Webino_Dashboard_Analytics_Geo::lookup( $ip );
			if ( is_array( $geo ) && ! empty( $geo['country'] ) ) {
				$n = self::normalize_country( (string) $geo['country'] );
				if ( '' !== $n ) {
					$fresh[] = $n;
				}
			}
		}

		$remote = self::lookup_remote_apis( $ip );
		foreach ( $remote as $n ) {
			if ( '' !== $n ) {
				$fresh[] = $n;
			}
		}

		$fresh = array_values( array_unique( $fresh ) );
		set_transient( $cache_key, $fresh, self::TRANSIENT_TTL );

		foreach ( $fresh as $n ) {
			$out[] = $n;
		}
		return array_values( array_unique( $out ) );
	}

	/**
	 * @return string
	 */
	private static function services_cache_mask() {
		$s = self::get_settings()['services'];
		$bits = array();
		foreach ( array( 'woocommerce', 'analytics', 'ip_api', 'ipwho', 'geojs' ) as $k ) {
			$bits[] = ! empty( $s[ $k ] ) ? '1' : '0';
		}
		return implode( '', $bits );
	}

	/**
	 * Remote lookups for enabled server-side APIs.
	 *
	 * @param string $ip IP.
	 * @return list<string>
	 */
	private static function lookup_remote_apis( $ip ) {
		$ip  = (string) $ip;
		$out = array();
		$urls = array();
		if ( self::is_service_enabled( 'ip_api' ) ) {
			$urls[] = 'https://ip-api.com/json/' . rawurlencode( $ip ) . '?fields=status,countryCode';
		}
		if ( self::is_service_enabled( 'ipwho' ) ) {
			$urls[] = 'https://ipwho.is/' . rawurlencode( $ip ) . '?fields=country_code,success';
		}
		if ( self::is_service_enabled( 'geojs' ) ) {
			$urls[] = 'https://get.geojs.io/v1/ip/country/' . rawurlencode( $ip ) . '.json';
		}

		foreach ( $urls as $url ) {
			$code = self::fetch_country_from_url( $url );
			if ( '' !== $code ) {
				$out[] = $code;
				break;
			}
		}
		return $out;
	}

	/**
	 * @param string $url Absolute URL.
	 * @return string
	 */
	private static function fetch_country_from_url( $url ) {
		$res = wp_remote_get(
			$url,
			array(
				'timeout'     => self::HTTP_TIMEOUT,
				'redirection' => 2,
				'headers'     => array(
					'Accept'     => 'application/json',
					'User-Agent' => 'WebinoDashboard/' . ( defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '1.0' ),
				),
			)
		);
		if ( is_wp_error( $res ) ) {
			return '';
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		if ( $code < 200 || $code >= 300 ) {
			return '';
		}
		$body = wp_remote_retrieve_body( $res );
		if ( ! is_string( $body ) || '' === $body ) {
			return '';
		}
		$data = json_decode( $body, true );
		if ( ! is_array( $data ) ) {
			return self::normalize_country( trim( $body, "\" \n\r\t" ) );
		}

		if ( isset( $data['status'] ) && 'success' === $data['status'] && ! empty( $data['countryCode'] ) ) {
			return self::normalize_country( (string) $data['countryCode'] );
		}
		if ( isset( $data['success'] ) && true === $data['success'] && ! empty( $data['country_code'] ) ) {
			return self::normalize_country( (string) $data['country_code'] );
		}
		if ( ! empty( $data['country'] ) ) {
			return self::normalize_country( (string) $data['country'] );
		}
		if ( ! empty( $data['country_code'] ) ) {
			return self::normalize_country( (string) $data['country_code'] );
		}
		if ( ! empty( $data['countryCode'] ) ) {
			return self::normalize_country( (string) $data['countryCode'] );
		}
		return '';
	}

	/**
	 * @param string $code Raw country.
	 * @return string
	 */
	private static function normalize_country( $code ) {
		$code = strtoupper( sanitize_text_field( (string) $code ) );
		if ( ! preg_match( '/^[A-Z]{2}$/', $code ) ) {
			return '';
		}
		if ( in_array( $code, array( 'XX', 'T1', 'A1', 'A2', 'O1' ), true ) ) {
			return '';
		}
		return $code;
	}

	/**
	 * @return string
	 */
	private static function client_ip() {
		if ( class_exists( 'WC_Geolocation', false ) ) {
			$ip = WC_Geolocation::get_ip_address();
			if ( is_string( $ip ) && '' !== $ip ) {
				return $ip;
			}
		}
		foreach ( array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR' ) as $key ) {
			if ( empty( $_SERVER[ $key ] ) ) {
				continue;
			}
			$raw = sanitize_text_field( wp_unslash( (string) $_SERVER[ $key ] ) );
			if ( 'HTTP_X_FORWARDED_FOR' === $key && false !== strpos( $raw, ',' ) ) {
				$parts = explode( ',', $raw );
				$raw   = trim( (string) $parts[0] );
			}
			if ( filter_var( $raw, FILTER_VALIDATE_IP ) ) {
				return $raw;
			}
		}
		return '';
	}

	/**
	 * @param string $ip IP.
	 * @return bool
	 */
	private static function is_private_ip( $ip ) {
		return ! (bool) filter_var(
			$ip,
			FILTER_VALIDATE_IP,
			FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
		);
	}

	/**
	 * @return string
	 */
	private static function font_face_css() {
		$use_yekan = true;
		if ( class_exists( 'Webino_Dashboard_Brand_Style', false ) ) {
			$fonts = Webino_Dashboard_Brand_Style::get()['fonts'];
			$body  = isset( $fonts['body'] ) ? (string) $fonts['body'] : 'yekanbakh';
			$use_yekan = ( 'system' !== $body );
		}
		if ( ! $use_yekan ) {
			return '';
		}
		$base = defined( 'WEBINO_DASHBOARD_URL' )
			? WEBINO_DASHBOARD_URL . 'assets/fonts/yekan-bakh/woff2/'
			: '';
		if ( '' === $base ) {
			return '';
		}
		return "
		@font-face{font-family:'Yekan Bakh';font-style:normal;font-weight:400;src:url('{$base}YekanBakh-Regular.woff2') format('woff2');font-display:swap}
		@font-face{font-family:'Yekan Bakh';font-style:normal;font-weight:500;src:url('{$base}YekanBakh-SemiBold.woff2') format('woff2');font-display:swap}
		@font-face{font-family:'Yekan Bakh';font-style:normal;font-weight:700;src:url('{$base}YekanBakh-Bold.woff2') format('woff2');font-display:swap}
		";
	}

	/**
	 * @return string
	 */
	private static function modal_font_family() {
		if ( class_exists( 'Webino_Dashboard_Brand_Style', false ) ) {
			$fonts = Webino_Dashboard_Brand_Style::get()['fonts'];
			$body  = isset( $fonts['body'] ) ? (string) $fonts['body'] : 'yekanbakh';
			return Webino_Dashboard_Brand_Style::font_family_css( $body );
		}
		return "'Yekan Bakh',Tahoma,sans-serif";
	}

	/**
	 * Always print checker on payment pages when feature enabled.
	 *
	 * @return void
	 */
	public static function maybe_print_checkout_modal() {
		if ( ! self::is_enabled() || ! self::has_any_service_enabled() ) {
			return;
		}
		if ( ! self::is_payment_page() ) {
			return;
		}
		self::print_modal_markup( self::should_show_notice() );
	}

	/**
	 * Shared modal + client-side multi-GEOIP (also used by pay-order template).
	 *
	 * @param bool $show_now Show immediately from PHP vote.
	 * @return void
	 */
	public static function print_modal_markup( $show_now = false ) {
		if ( ! self::is_enabled() || ! self::has_any_service_enabled() ) {
			return;
		}

		$settings = self::get_settings();
		$colors   = $settings['colors'];
		$services = $settings['services'];

		$locale = function_exists( 'determine_locale' ) ? determine_locale() : get_locale();
		$is_fa  = is_string( $locale ) && ( 0 === strpos( strtolower( $locale ), 'fa' ) );
		$title  = $is_fa ? 'نکتهٔ پرداخت' : __( 'Payment tip', 'webino-dashboard' );
		$body   = $is_fa
			? 'اگر فیلترشکن روشن است، لطفاً خاموشش کنید تا اختلالی در روند پرداخت پیش نیاید.'
			: __( 'If you have a VPN enabled, please turn it off so your payment is not interrupted.', 'webino-dashboard' );
		$ok     = $is_fa ? 'متوجه شدم' : __( 'Got it', 'webino-dashboard' );
		$dir    = $is_fa || ( function_exists( 'is_rtl' ) && is_rtl() ) ? 'rtl' : 'ltr';
		$show   = $show_now ? '1' : '0';

		$overlay_hex = esc_attr( $colors['overlay'] );
		$dialog_hex  = esc_attr( $colors['dialog'] );
		$title_hex   = esc_attr( $colors['title'] );
		$text_hex    = esc_attr( $colors['text'] );
		$btn_hex     = esc_attr( $colors['button'] );
		$btn_t_hex   = esc_attr( $colors['button_text'] );
		$overlay_bg  = esc_attr( self::hex_to_rgba( $colors['overlay'], 0.55 ) );

		$js_services = wp_json_encode(
			array(
				'geojs'      => ! empty( $services['geojs'] ),
				'country_is' => ! empty( $services['country_is'] ),
				'ipwho'      => ! empty( $services['ipwho'] ),
			)
		);
		if ( ! is_string( $js_services ) ) {
			$js_services = '{"geojs":true,"country_is":true,"ipwho":true}';
		}
		$modal_font = esc_attr( self::modal_font_family() );
		?>
		<style id="wd-geo-notice-css">
			<?php echo self::font_face_css(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			.wd-geo-notice-overlay{
				--wd-geo-overlay:<?php echo $overlay_hex; ?>;
				--wd-geo-dialog:<?php echo $dialog_hex; ?>;
				--wd-geo-title:<?php echo $title_hex; ?>;
				--wd-geo-text:<?php echo $text_hex; ?>;
				--wd-geo-button:<?php echo $btn_hex; ?>;
				--wd-geo-button-text:<?php echo $btn_t_hex; ?>;
				position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:1rem;
				background:<?php echo $overlay_bg; ?>;
				backdrop-filter:blur(4px)
			}
			.wd-geo-notice-overlay.is-open{display:flex}
			.wd-geo-notice-dialog{
				max-width:26rem;width:100%;
				background:var(--wd-geo-dialog);color:var(--wd-geo-title);
				border-radius:14px;padding:1.25rem 1.35rem;
				box-shadow:0 18px 48px rgba(0,0,0,.22);
				font-family:<?php echo $modal_font; ?>
			}
			.wd-geo-notice-dialog h2{margin:0 0 .65rem;font-size:1.1rem;line-height:1.35;font-weight:700;color:var(--wd-geo-title)}
			.wd-geo-notice-dialog p{margin:0 0 1.1rem;font-size:.95rem;line-height:1.55;color:var(--wd-geo-text);font-weight:400}
			.wd-geo-notice-dialog button{
				appearance:none;border:0;border-radius:10px;
				background:var(--wd-geo-button);color:var(--wd-geo-button-text);
				padding:.7rem 1.1rem;font-size:.95rem;cursor:pointer;width:100%;
				font-family:inherit;font-weight:500
			}
			.wd-geo-notice-dialog button:hover{filter:brightness(1.08)}
			[dir=rtl] .wd-geo-notice-dialog{text-align:right}
		</style>
		<div class="wd-geo-notice-overlay<?php echo $show_now ? ' is-open' : ''; ?>" id="wd-geo-notice" role="dialog" aria-modal="true" aria-labelledby="wd-geo-notice-title" aria-hidden="<?php echo $show_now ? 'false' : 'true'; ?>" dir="<?php echo esc_attr( $dir ); ?>" data-wd-show-now="<?php echo esc_attr( $show ); ?>">
			<div class="wd-geo-notice-dialog">
				<h2 id="wd-geo-notice-title"><?php echo esc_html( $title ); ?></h2>
				<p><?php echo esc_html( $body ); ?></p>
				<button type="button" id="wd-geo-notice-ok"><?php echo esc_html( $ok ); ?></button>
			</div>
		</div>
		<script>
		(function () {
			var overlay = document.getElementById('wd-geo-notice');
			if (!overlay || overlay.getAttribute('data-wd-bound') === '1') return;
			overlay.setAttribute('data-wd-bound', '1');

			var services = <?php echo $js_services; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>;
			var shown = false;
			function openModal() {
				if (shown) return;
				shown = true;
				overlay.classList.add('is-open');
				overlay.setAttribute('aria-hidden', 'false');
			}
			function close() {
				overlay.classList.remove('is-open');
				overlay.setAttribute('aria-hidden', 'true');
			}
			var btn = document.getElementById('wd-geo-notice-ok');
			if (btn) btn.addEventListener('click', close);
			overlay.addEventListener('click', function (e) {
				if (e.target === overlay) close();
			});
			document.addEventListener('keydown', function (e) {
				if (e.key === 'Escape') close();
			});

			if (overlay.getAttribute('data-wd-show-now') === '1') {
				openModal();
			}

			function normalize(code) {
				if (!code || typeof code !== 'string') return '';
				code = code.trim().toUpperCase();
				if (!/^[A-Z]{2}$/.test(code)) return '';
				if (code === 'XX' || code === 'T1' || code === 'A1' || code === 'A2' || code === 'O1') return '';
				return code;
			}
			function consider(code) {
				code = normalize(code);
				if (code && code !== 'IR') openModal();
			}

			function getJson(url, pick) {
				var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
				var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 2200);
				return fetch(url, {
					method: 'GET',
					credentials: 'omit',
					cache: 'no-store',
					signal: ctrl ? ctrl.signal : undefined,
					headers: { 'Accept': 'application/json' }
				}).then(function (r) {
					clearTimeout(timer);
					if (!r.ok) throw new Error('bad status');
					return r.json();
				}).then(function (data) {
					consider(pick(data));
				}).catch(function () {
					clearTimeout(timer);
				});
			}

			if (services.geojs) {
				getJson('https://get.geojs.io/v1/ip/country.json', function (d) {
					return d && (d.country || d.country_code || d.code);
				});
			}
			if (services.country_is) {
				getJson('https://api.country.is/', function (d) {
					return d && d.country;
				});
			}
			if (services.ipwho) {
				getJson('https://ipwho.is/?fields=country_code,success', function (d) {
					return d && d.success && d.country_code;
				});
			}
		})();
		</script>
		<?php
	}
}
