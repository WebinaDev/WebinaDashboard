<?php
/**
 * Site widgets: OTP login shortcode, channel popup, floating chat button, file bot links.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Front-end shortcodes and assets for bot acquisition.
 */
final class Webino_Dashboard_Bots_Site_Widgets {

	const OPTION = 'webino_dashboard_bots_site_widgets';

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		add_shortcode( 'webino_bot_login', array( __CLASS__, 'shortcode_login' ) );
		add_shortcode( 'webino_bot_support_button', array( __CLASS__, 'shortcode_support' ) );
		add_action( 'wp_footer', array( __CLASS__, 'render_floating_and_popup' ) );
		add_action( 'wp_ajax_nopriv_webino_bot_otp_request', array( __CLASS__, 'ajax_otp_request' ) );
		add_action( 'wp_ajax_webino_bot_otp_request', array( __CLASS__, 'ajax_otp_request' ) );
		add_action( 'wp_ajax_nopriv_webino_bot_otp_verify', array( __CLASS__, 'ajax_otp_verify' ) );
		add_action( 'wp_ajax_webino_bot_otp_verify', array( __CLASS__, 'ajax_otp_verify' ) );
		add_action( 'template_redirect', array( __CLASS__, 'maybe_deliver_file' ) );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function settings() {
		$defaults = array(
			'otp_enabled'       => '0',
			'popup_enabled'     => '0',
			'popup_text'        => __( 'در کانال بله عضو شوید و تخفیف بگیرید', 'webino-dashboard' ),
			'popup_url'         => '',
			'float_enabled'     => '0',
			'float_bale'        => '',
			'float_telegram'    => '',
			'float_phone'       => '',
			'filebot_enabled'   => '0',
		);
		$raw = get_option( self::OPTION, array() );
		return is_array( $raw ) ? array_merge( $defaults, $raw ) : $defaults;
	}

	/**
	 * @param array<string,mixed> $input Input.
	 * @return array<string,mixed>
	 */
	public static function save_settings( $input ) {
		$cur = self::settings();
		if ( ! is_array( $input ) ) {
			return $cur;
		}
		foreach ( array( 'otp_enabled', 'popup_enabled', 'float_enabled', 'filebot_enabled' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = ! empty( $input[ $f ] ) && '0' !== (string) $input[ $f ] ? '1' : '0';
			}
		}
		foreach ( array( 'popup_text', 'popup_url', 'float_bale', 'float_telegram', 'float_phone' ) as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$cur[ $f ] = 'popup_text' === $f ? sanitize_textarea_field( (string) $input[ $f ] ) : esc_url_raw( (string) $input[ $f ] );
				if ( in_array( $f, array( 'float_phone' ), true ) ) {
					$cur[ $f ] = sanitize_text_field( (string) $input[ $f ] );
				}
			}
		}
		update_option( self::OPTION, $cur, false );
		return $cur;
	}

	/**
	 * @return string
	 */
	public static function shortcode_login() {
		$s = self::settings();
		if ( empty( $s['otp_enabled'] ) || '0' === (string) $s['otp_enabled'] ) {
			return '';
		}
		ob_start();
		?>
		<div class="webino-bot-otp" data-ajax="<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>">
			<input type="tel" class="webino-bot-otp-phone" placeholder="<?php esc_attr_e( 'موبایل', 'webino-dashboard' ); ?>" />
			<button type="button" class="webino-bot-otp-send"><?php esc_html_e( 'دریافت کد', 'webino-dashboard' ); ?></button>
			<input type="text" class="webino-bot-otp-code" placeholder="<?php esc_attr_e( 'کد', 'webino-dashboard' ); ?>" />
			<button type="button" class="webino-bot-otp-verify"><?php esc_html_e( 'ورود', 'webino-dashboard' ); ?></button>
			<p class="webino-bot-otp-msg"></p>
		</div>
		<script>
		(function(){
			var root=document.currentScript.previousElementSibling; if(!root||!root.classList.contains('webino-bot-otp')) return;
			var ajax=root.getAttribute('data-ajax');
			function post(action, data, cb){
				var fd=new FormData(); fd.append('action', action);
				Object.keys(data).forEach(function(k){ fd.append(k, data[k]); });
				fetch(ajax,{method:'POST',body:fd,credentials:'same-origin'}).then(function(r){return r.json()}).then(cb);
			}
			root.querySelector('.webino-bot-otp-send').onclick=function(){
				post('webino_bot_otp_request',{phone:root.querySelector('.webino-bot-otp-phone').value},function(j){
					root.querySelector('.webino-bot-otp-msg').textContent=j.message||'';
				});
			};
			root.querySelector('.webino-bot-otp-verify').onclick=function(){
				post('webino_bot_otp_verify',{phone:root.querySelector('.webino-bot-otp-phone').value,code:root.querySelector('.webino-bot-otp-code').value},function(j){
					root.querySelector('.webino-bot-otp-msg').textContent=j.message||'';
					if(j.ok) location.reload();
				});
			};
		})();
		</script>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @return string
	 */
	public static function shortcode_support() {
		$s = self::settings();
		$links = array();
		if ( ! empty( $s['float_bale'] ) ) {
			$links[] = '<a href="' . esc_url( (string) $s['float_bale'] ) . '" target="_blank" rel="noopener">' . esc_html__( 'بله', 'webino-dashboard' ) . '</a>';
		}
		if ( ! empty( $s['float_telegram'] ) ) {
			$links[] = '<a href="' . esc_url( (string) $s['float_telegram'] ) . '" target="_blank" rel="noopener">' . esc_html__( 'تلگرام', 'webino-dashboard' ) . '</a>';
		}
		if ( ! empty( $s['float_phone'] ) ) {
			$links[] = '<a href="tel:' . esc_attr( (string) $s['float_phone'] ) . '">' . esc_html( (string) $s['float_phone'] ) . '</a>';
		}
		return $links ? '<div class="webino-bot-support">' . implode( ' | ', $links ) . '</div>' : '';
	}

	/**
	 * @return void
	 */
	public static function render_floating_and_popup() {
		$s = self::settings();
		if ( ! empty( $s['float_enabled'] ) && '0' !== (string) $s['float_enabled'] ) {
			echo '<div style="position:fixed;bottom:16px;inset-inline-end:16px;z-index:9999;display:flex;flex-direction:column;gap:8px">';
			echo self::shortcode_support(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo '</div>';
		}
		if ( ! empty( $s['popup_enabled'] ) && '0' !== (string) $s['popup_enabled'] && ! empty( $s['popup_url'] ) ) {
			?>
			<div id="webino-bot-join-popup" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10000;align-items:center;justify-content:center">
				<div style="background:#fff;padding:24px;max-width:360px;border-radius:8px;text-align:center">
					<p><?php echo esc_html( (string) $s['popup_text'] ); ?></p>
					<p><a href="<?php echo esc_url( (string) $s['popup_url'] ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'عضویت', 'webino-dashboard' ); ?></a></p>
					<button type="button" onclick="this.closest('#webino-bot-join-popup').style.display='none'"><?php esc_html_e( 'بستن', 'webino-dashboard' ); ?></button>
				</div>
			</div>
			<script>
			(function(){
				if(localStorage.getItem('webino_bot_popup_seen')) return;
				var el=document.getElementById('webino-bot-join-popup');
				if(!el) return;
				setTimeout(function(){ el.style.display='flex'; localStorage.setItem('webino_bot_popup_seen','1'); }, 2500);
			})();
			</script>
			<?php
		}
	}

	/**
	 * @return void
	 */
	public static function ajax_otp_request() {
		$phone = isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '';
		$phone = preg_replace( '/\D+/', '', $phone );
		if ( strlen( $phone ) < 10 ) {
			wp_send_json( array( 'ok' => false, 'message' => __( 'شماره نامعتبر', 'webino-dashboard' ) ) );
		}
		$code = (string) wp_rand( 100000, 999999 );
		set_transient( 'webino_bot_otp_' . $phone, $code, 10 * MINUTE_IN_SECONDS );
		/**
		 * Deliver OTP (SMS/Safir). Return true if sent.
		 *
		 * @param bool   $sent Sent.
		 * @param string $phone Phone.
		 * @param string $code Code.
		 */
		$sent = (bool) apply_filters( 'webino_dashboard_bots_otp_deliver', false, $phone, $code );
		do_action( 'webino_sms_send', $phone, sprintf( __( 'کد ورود: %s', 'webino-dashboard' ), $code ), null );
		wp_send_json(
			array(
				'ok'      => true,
				'message' => $sent ? __( 'کد ارسال شد', 'webino-dashboard' ) : __( 'کد تولید شد (ارسال از طریق هوک SMS)', 'webino-dashboard' ),
			)
		);
	}

	/**
	 * @return void
	 */
	public static function ajax_otp_verify() {
		$phone = isset( $_POST['phone'] ) ? preg_replace( '/\D+/', '', sanitize_text_field( wp_unslash( $_POST['phone'] ) ) ) : '';
		$code  = isset( $_POST['code'] ) ? sanitize_text_field( wp_unslash( $_POST['code'] ) ) : '';
		$saved = (string) get_transient( 'webino_bot_otp_' . $phone );
		if ( $saved === '' || ! hash_equals( $saved, $code ) ) {
			wp_send_json( array( 'ok' => false, 'message' => __( 'کد نادرست', 'webino-dashboard' ) ) );
		}
		delete_transient( 'webino_bot_otp_' . $phone );
		$user = get_user_by( 'login', $phone );
		if ( ! $user ) {
			$uid = wp_create_user( $phone, wp_generate_password( 16 ), $phone . '@bot.local' );
			if ( is_wp_error( $uid ) ) {
				wp_send_json( array( 'ok' => false, 'message' => $uid->get_error_message() ) );
			}
			$user = get_user_by( 'id', $uid );
			update_user_meta( $uid, 'billing_phone', $phone );
		}
		wp_set_current_user( $user->ID );
		wp_set_auth_cookie( $user->ID, true );

		$payload = self::create_account_link_token( $user->ID );
		$s       = self::settings();
		$out     = array(
			'ok'                => true,
			'message'           => __( 'ورود موفق', 'webino-dashboard' ),
			'bot_start_payload' => $payload,
		);
		$deep    = self::build_bot_deep_links( $payload, $s );
		if ( ! empty( $deep['bale'] ) ) {
			$out['bale_deep_link'] = $deep['bale'];
		}
		if ( ! empty( $deep['telegram'] ) ) {
			$out['telegram_deep_link'] = $deep['telegram'];
		}
		wp_send_json( $out );
	}

	/**
	 * Create a short-lived account-link start payload for bots.
	 *
	 * @param int $user_id User ID.
	 * @param int $ttl     Seconds.
	 * @return string
	 */
	public static function create_account_link_token( $user_id, $ttl = 600 ) {
		$token = 'BLP-' . wp_generate_password( 16, false, false );
		set_transient( 'webino_bot_link_' . $token, (int) $user_id, max( 60, (int) $ttl ) );
		return $token;
	}

	/**
	 * Consume a one-time account-link token. Returns WP user ID or 0.
	 *
	 * @param string $token Token.
	 * @return int
	 */
	public static function consume_account_link_token( $token ) {
		$token = (string) $token;
		if ( $token === '' ) {
			return 0;
		}
		$uid = (int) get_transient( 'webino_bot_link_' . $token );
		if ( $uid > 0 ) {
			delete_transient( 'webino_bot_link_' . $token );
		}
		return $uid;
	}

	/**
	 * Build optional deep-link URLs for Bale / Telegram with start payload.
	 *
	 * @param string               $payload Start payload.
	 * @param array<string,mixed>  $s       Site widget settings.
	 * @return array{bale?:string,telegram?:string}
	 */
	private static function build_bot_deep_links( $payload, array $s ) {
		$out     = array();
		$payload = rawurlencode( (string) $payload );

		$bale_base = isset( $s['float_bale'] ) ? trim( (string) $s['float_bale'] ) : '';
		if ( $bale_base !== '' ) {
			$user = self::extract_messenger_username( $bale_base, 'ble.ir' );
			if ( $user !== '' ) {
				$out['bale'] = 'https://ble.ir/' . $user . '?start=' . $payload;
			} else {
				$sep         = false === strpos( $bale_base, '?' ) ? '?' : '&';
				$out['bale'] = $bale_base . $sep . 'start=' . $payload;
			}
		}

		$tg_base = isset( $s['float_telegram'] ) ? trim( (string) $s['float_telegram'] ) : '';
		if ( $tg_base !== '' ) {
			$user = self::extract_messenger_username( $tg_base, 't.me' );
			if ( $user === '' ) {
				$user = self::extract_messenger_username( $tg_base, 'telegram.me' );
			}
			if ( $user !== '' ) {
				$out['telegram'] = 'https://t.me/' . $user . '?start=' . $payload;
			}
		}

		return $out;
	}

	/**
	 * @param string $url  URL.
	 * @param string $host Host fragment (ble.ir|t.me).
	 * @return string Username without @.
	 */
	private static function extract_messenger_username( $url, $host ) {
		$path = wp_parse_url( $url, PHP_URL_PATH );
		$h    = wp_parse_url( $url, PHP_URL_HOST );
		if ( ! is_string( $h ) || false === stripos( $h, $host ) ) {
			return '';
		}
		if ( ! is_string( $path ) || $path === '' || $path === '/' ) {
			return '';
		}
		$seg = ltrim( $path, '/' );
		$seg = explode( '/', $seg )[0];
		$seg = ltrim( $seg, '@' );
		return preg_match( '/^[A-Za-z0-9_]+$/', $seg ) ? $seg : '';
	}

	/**
	 * One-time file delivery via ?webino_bot_file=TOKEN.
	 *
	 * @return void
	 */
	public static function maybe_deliver_file() {
		$s = self::settings();
		if ( empty( $s['filebot_enabled'] ) || '0' === (string) $s['filebot_enabled'] ) {
			return;
		}
		$token = isset( $_GET['webino_bot_file'] ) ? sanitize_text_field( wp_unslash( $_GET['webino_bot_file'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( $token === '' ) {
			return;
		}
		$data = get_transient( 'webino_bot_file_' . $token );
		delete_transient( 'webino_bot_file_' . $token ); // self-destruct
		if ( ! is_array( $data ) || empty( $data['url'] ) ) {
			wp_die( esc_html__( 'لینک منقضی شده است.', 'webino-dashboard' ), '', array( 'response' => 410 ) );
		}
		if ( ! empty( $data['ttl'] ) && time() > (int) $data['ttl'] ) {
			wp_die( esc_html__( 'لینک منقضی شده است.', 'webino-dashboard' ), '', array( 'response' => 410 ) );
		}
		wp_redirect( esc_url_raw( (string) $data['url'] ) );
		exit;
	}

	/**
	 * Create a self-destruct file delivery token for bot.
	 *
	 * @param string $file_url URL.
	 * @param int    $ttl Seconds.
	 * @return string Token URL.
	 */
	public static function create_file_token( $file_url, $ttl = 60 ) {
		$token = wp_generate_password( 20, false, false );
		set_transient(
			'webino_bot_file_' . $token,
			array(
				'url' => esc_url_raw( $file_url ),
				'ttl' => time() + max( 10, (int) $ttl ),
			),
			max( 10, (int) $ttl )
		);
		return add_query_arg( array( 'webino_bot_file' => $token ), home_url( '/' ) );
	}
}
