<?php

namespace Webino_Dashboard_Bots_Telegram\Admin;

use Webino_Dashboard_Bots_Telegram\Bale\Client;
use Webino_Dashboard_Bots_Telegram\Api\WebhookController;
use Webino_Dashboard_Bots_Telegram\Core\Plugin;

/**
 * Tabbed WooBale settings.
 */
class SettingsPage {

	private static $instance = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function init(): void {
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_post_woobale_set_webhook', array( $this, 'handle_set_webhook' ) );
		add_action( 'admin_post_woobale_delete_webhook', array( $this, 'handle_delete_webhook' ) );
		add_action( 'admin_notices', array( $this, 'admin_notices' ) );
	}

	public function register_settings(): void {
		register_setting(
			'woobale',
			'woobale_settings',
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize_settings' ),
			)
		);
	}

	public function admin_notices(): void {
		if ( ! isset( $_GET['page'] ) || $_GET['page'] !== 'woobale-settings' ) {
			return;
		}
		if ( empty( $_GET['woobale'] ) ) {
			return;
		}
		$k = sanitize_key( wp_unslash( $_GET['woobale'] ) );
		if ( $k === 'wbdb_tg_webhook_ok' ) {
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'اتصال به بله با موفقیت انجام شد و وب‌هوک فعال است.', 'webino-dashboard' ) . '</p></div>';
		} elseif ( $k === 'wbdb_tg_webhook_fail' ) {
			$err = get_transient( 'woobale_last_api_error' );
			delete_transient( 'woobale_last_api_error' );
			echo '<div class="notice notice-error is-dismissible"><p>' . esc_html__( 'اتصال به بله ناموفق بود. Bot Token، دسترس‌پذیری HTTPS و تنظیمات سرور را بررسی کنید.', 'webino-dashboard' );
			if ( $err ) {
				echo ' <code>' . esc_html( $err ) . '</code>';
			}
			echo '</p></div>';
		} elseif ( $k === 'wbdb_tg_webhook_deleted' ) {
			echo '<div class="notice notice-info is-dismissible"><p>' . esc_html__( 'اتصال بله غیرفعال شد (وب‌هوک حذف شد).', 'webino-dashboard' ) . '</p></div>';
		} elseif ( $k === 'wbdb_tg_webhook_delete_fail' ) {
			$err = get_transient( 'woobale_last_api_error' );
			delete_transient( 'woobale_last_api_error' );
			echo '<div class="notice notice-error is-dismissible"><p>' . esc_html__( 'لغو اتصال ناموفق بود.', 'webino-dashboard' );
			if ( $err ) {
				echo ' <code>' . esc_html( $err ) . '</code>';
			}
			echo '</p></div>';
		}
	}

	/**
	 * @param array<string, mixed> $input
	 * @return array<string, mixed>
	 */
	public function sanitize_settings( $input ): array {
		$old = Plugin::get_settings();
		$out = $old;

		if ( ! is_array( $input ) ) {
			return $out;
		}

		$fields = array(
			'plan_tier',
			'bot_token',
			'channel_id',
			'provider_token',
			'welcome_text',
			'error_text',
			'contact_button_text',
			'store_button_text',
			'auth_success_text',
			'manual_payment_link_template',
			'post_tracking_url_template',
			'support_contact_text',
			'channel_contact_id',
			'channel_bale_link',
			'force_join_message',
			'force_join_channel_id',
			'force_join_channel_link',
			'force_join_check_button_text',
		);
		foreach ( $fields as $f ) {
			if ( isset( $input[ $f ] ) ) {
				$out[ $f ] = $f === 'manual_payment_link_template' || in_array( $f, array( 'welcome_text', 'error_text', 'support_contact_text', 'force_join_message' ), true )
					? sanitize_textarea_field( (string) $input[ $f ] )
					: sanitize_text_field( (string) $input[ $f ] );
			}
		}
		if ( isset( $input['products_per_page'] ) ) {
			$out['products_per_page'] = max( 1, min( 20, absint( $input['products_per_page'] ) ) );
		}
		if ( isset( $input['plan_tier'] ) ) {
			$tier             = sanitize_key( (string) $input['plan_tier'] );
			$out['plan_tier'] = in_array( $tier, array( 'basic', 'advanced' ), true ) ? $tier : 'basic';
		}

		if ( isset( $input['store_currency_unit'] ) ) {
			$unit = sanitize_text_field( (string) $input['store_currency_unit'] );
			$out['store_currency_unit'] = in_array( $unit, array( 'toman', 'rial' ), true ) ? $unit : '';
		}

		if ( isset( $input['invoice_amount_rial_multiplier'] ) ) {
			$m = (float) $input['invoice_amount_rial_multiplier'];
			$out['invoice_amount_rial_multiplier'] = $m > 0 ? min( 1000.0, $m ) : 1.0;
		}

		$out['hide_out_of_stock_products'] = ! empty( $input['hide_out_of_stock_products'] ) ? '1' : '0';
		$out['force_join_enabled']         = ! empty( $input['force_join_enabled'] ) ? '1' : '0';

		if ( isset( $input['webhook_require_secret'] ) ) {
			$out['webhook_require_secret'] = ! empty( $input['webhook_require_secret'] ) ? '1' : '0';
		}

		if ( isset( $input['order_status_templates'] ) && is_array( $input['order_status_templates'] ) ) {
			$out['order_status_templates'] = array();
			foreach ( $input['order_status_templates'] as $st => $tpl ) {
				$key = sanitize_key( str_replace( 'wc-', '', (string) $st ) );
				$out['order_status_templates'][ $key ] = sanitize_textarea_field( (string) $tpl );
			}
		}

		if ( isset( $input['notify_status'] ) && is_array( $input['notify_status'] ) ) {
			$out['notify_status'] = array();
			foreach ( $input['notify_status'] as $st => $on ) {
				$key                      = sanitize_key( str_replace( 'wc-', '', (string) $st ) );
				$out['notify_status'][ $key ] = ! empty( $on ) ? '1' : '0';
			}
		}

		if ( isset( $input['abandon_cart_enabled'] ) ) {
			$out['abandon_cart_enabled'] = ! empty( $input['abandon_cart_enabled'] ) ? '1' : '0';
		}
		if ( isset( $input['abandon_cart_delay_hours'] ) ) {
			$out['abandon_cart_delay_hours'] = max( 1, min( 720, absint( $input['abandon_cart_delay_hours'] ) ) );
		}
		if ( isset( $input['abandon_cart_delay_hours_2'] ) ) {
			$out['abandon_cart_delay_hours_2'] = max( 1, min( 720, absint( $input['abandon_cart_delay_hours_2'] ) ) );
		}
		if ( isset( $input['abandon_cart_delay_hours_3'] ) ) {
			$out['abandon_cart_delay_hours_3'] = max( 1, min( 720, absint( $input['abandon_cart_delay_hours_3'] ) ) );
		}
		if ( isset( $input['abandon_cart_message'] ) ) {
			$out['abandon_cart_message'] = sanitize_textarea_field( (string) $input['abandon_cart_message'] );
		}
		if ( isset( $input['abandon_cart_message_2'] ) ) {
			$out['abandon_cart_message_2'] = sanitize_textarea_field( (string) $input['abandon_cart_message_2'] );
		}
		if ( isset( $input['abandon_cart_message_3'] ) ) {
			$out['abandon_cart_message_3'] = sanitize_textarea_field( (string) $input['abandon_cart_message_3'] );
		}
		if ( isset( $input['abandon_cart_coupon_2'] ) ) {
			$out['abandon_cart_coupon_2'] = max( 0, (float) $input['abandon_cart_coupon_2'] );
		}
		if ( isset( $input['abandon_cart_coupon_3'] ) ) {
			$out['abandon_cart_coupon_3'] = max( 0, (float) $input['abandon_cart_coupon_3'] );
		}
		foreach ( array( 'store', 'search', 'wishlist', 'cart', 'checkout', 'orders', 'addresses', 'support', 'sale' ) as $menu_key ) {
			$mk = 'menu_show_' . $menu_key;
			if ( isset( $input[ $mk ] ) ) {
				$out[ $mk ] = ! empty( $input[ $mk ] ) && '0' !== (string) $input[ $mk ] ? '1' : '0';
			}
		}
		if ( isset( $input['sale_auto_notify'] ) ) {
			$out['sale_auto_notify'] = ! empty( $input['sale_auto_notify'] ) && '0' !== (string) $input['sale_auto_notify'] ? '1' : '0';
		}
		if ( isset( $input['sandbox_mode'] ) ) {
			$out['sandbox_mode'] = ! empty( $input['sandbox_mode'] ) ? '1' : '0';
		}
		if ( isset( $input['bot_token_sandbox'] ) ) {
			$out['bot_token_sandbox'] = sanitize_text_field( (string) $input['bot_token_sandbox'] );
		}
		if ( isset( $input['support_notify_chat_id'] ) ) {
			$out['support_notify_chat_id'] = sanitize_text_field( (string) $input['support_notify_chat_id'] );
		}
		if ( isset( $input['bot_admin_chat_ids'] ) ) {
			$out['bot_admin_chat_ids'] = sanitize_textarea_field( (string) $input['bot_admin_chat_ids'] );
		}
		if ( isset( $input['order_question_button_enabled'] ) ) {
			$out['order_question_button_enabled'] = ! empty( $input['order_question_button_enabled'] ) ? '1' : '0';
		}
		if ( isset( $input['order_question_button_text'] ) ) {
			$out['order_question_button_text'] = sanitize_text_field( (string) $input['order_question_button_text'] );
		}
		if ( isset( $input['channel_rule_category_ids'] ) ) {
			$out['channel_rule_category_ids'] = sanitize_text_field( (string) $input['channel_rule_category_ids'] );
		}
		if ( isset( $input['channel_rule_tag_ids'] ) ) {
			$out['channel_rule_tag_ids'] = sanitize_text_field( (string) $input['channel_rule_tag_ids'] );
		}
		if ( isset( $input['channel_rule_sale_only'] ) ) {
			$out['channel_rule_sale_only'] = ! empty( $input['channel_rule_sale_only'] ) ? '1' : '0';
		}
		if ( isset( $input['channel_rule_min_price'] ) ) {
			$out['channel_rule_min_price'] = sanitize_text_field( (string) $input['channel_rule_min_price'] );
		}
		if ( array_key_exists( 'channel_rule_hour_start', $input ) ) {
			if ( $input['channel_rule_hour_start'] !== '' && $input['channel_rule_hour_start'] !== null ) {
				$out['channel_rule_hour_start'] = (string) max( 0, min( 23, absint( $input['channel_rule_hour_start'] ) ) );
			} else {
				$out['channel_rule_hour_start'] = '';
			}
		}
		if ( array_key_exists( 'channel_rule_hour_end', $input ) ) {
			if ( $input['channel_rule_hour_end'] !== '' && $input['channel_rule_hour_end'] !== null ) {
				$out['channel_rule_hour_end'] = (string) max( 0, min( 23, absint( $input['channel_rule_hour_end'] ) ) );
			} else {
				$out['channel_rule_hour_end'] = '';
			}
		}

		if ( isset( $input['proxy_type'] ) ) {
			$ptype             = sanitize_key( (string) $input['proxy_type'] );
			$out['proxy_type'] = in_array( $ptype, array( 'none', 'http', 'socks4', 'socks5' ), true ) ? $ptype : 'none';
		}
		if ( isset( $input['proxy_host'] ) ) {
			$out['proxy_host'] = sanitize_text_field( (string) $input['proxy_host'] );
		}
		if ( array_key_exists( 'proxy_port', $input ) ) {
			if ( $input['proxy_port'] === '' || $input['proxy_port'] === null ) {
				$out['proxy_port'] = '';
			} else {
				$p                 = absint( $input['proxy_port'] );
				$out['proxy_port'] = ( $p >= 1 && $p <= 65535 ) ? (string) $p : '';
			}
		}
		if ( isset( $input['proxy_username'] ) ) {
			$out['proxy_username'] = sanitize_text_field( (string) $input['proxy_username'] );
		}
		if ( isset( $input['proxy_password'] ) ) {
			$out['proxy_password'] = trim( str_replace( "\0", '', (string) $input['proxy_password'] ) );
		}

		if ( isset( $input['shop_notify'] ) && class_exists( 'Webino_Dashboard_Bots_Order_Notify', false ) ) {
			$out['shop_notify'] = Webino_Dashboard_Bots_Order_Notify::sanitize_shop_notify( $input['shop_notify'] );
		}

		return $out;
	}

	public function render_tabbed_page(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'شما اجازه دسترسی ندارید.', 'webino-dashboard' ) );
		}

		$tab     = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'general';
		$allowed = array( 'general', 'messages', 'notifications', 'automation' );
		if ( ! in_array( $tab, $allowed, true ) ) {
			$tab = 'general';
		}

		$s       = Plugin::get_settings();
		$webhook = esc_url( WebhookController::webhook_url() );
		$can_api = current_user_can( 'manage_options' );
		$webhook_info = null;
		if ( $can_api ) {
			$webhook_info = ( new Client() )->get_webhook_info();
		}

		$base = admin_url( 'admin.php?page=woobale-settings' );
		?>
		<div class="wrap woobale-admin-wrap">
			<h1><?php esc_html_e( 'بازوی بله — تنظیمات', 'webino-dashboard' ); ?></h1>

			<h2 class="nav-tab-wrapper woobale-nav-tab-wrapper">
				<a href="<?php echo esc_url( $base . '&tab=general' ); ?>" class="nav-tab <?php echo $tab === 'general' ? 'nav-tab-active' : ''; ?>"><?php esc_html_e( 'اتصال و عمومی', 'webino-dashboard' ); ?></a>
				<a href="<?php echo esc_url( $base . '&tab=messages' ); ?>" class="nav-tab <?php echo $tab === 'messages' ? 'nav-tab-active' : ''; ?>"><?php esc_html_e( 'پیام‌های بازو', 'webino-dashboard' ); ?></a>
				<a href="<?php echo esc_url( $base . '&tab=notifications' ); ?>" class="nav-tab <?php echo $tab === 'notifications' ? 'nav-tab-active' : ''; ?>"><?php esc_html_e( 'اعلان وضعیت سفارش', 'webino-dashboard' ); ?></a>
				<a href="<?php echo esc_url( $base . '&tab=automation' ); ?>" class="nav-tab <?php echo $tab === 'automation' ? 'nav-tab-active' : ''; ?>"><?php esc_html_e( 'اتوماسیون و کانال', 'webino-dashboard' ); ?></a>
			</h2>

				<?php if ( $tab === 'general' ) : ?>
					<form method="post" action="options.php">
						<?php settings_fields( 'woobale' ); ?>
						<table class="form-table" role="presentation">
							<tr>
								<th scope="row"><label for="woobale_plan_tier"><?php esc_html_e( 'طرح سرویس', 'webino-dashboard' ); ?></label></th>
								<td>
									<select name="woobale_settings[plan_tier]" id="woobale_plan_tier">
										<option value="basic" <?php selected( isset( $s['plan_tier'] ) ? $s['plan_tier'] : 'basic', 'basic' ); ?>><?php esc_html_e( 'پایه', 'webino-dashboard' ); ?></option>
										<option value="advanced" <?php selected( isset( $s['plan_tier'] ) ? $s['plan_tier'] : '', 'advanced' ); ?>><?php esc_html_e( 'پیشرفته', 'webino-dashboard' ); ?></option>
									</select>
									<p class="description"><?php esc_html_e( 'در طرح پیشرفته امکان کمپین، رسانه و مخاطب CSV فعال می‌شود.', 'webino-dashboard' ); ?></p>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_bot_token"><?php esc_html_e( 'Bot Token', 'webino-dashboard' ); ?></label></th>
								<td>
									<?php if ( $can_api ) : ?>
										<input name="woobale_settings[bot_token]" id="woobale_bot_token" type="password" class="regular-text" value="<?php echo esc_attr( $s['bot_token'] ); ?>" autocomplete="off" />
										<p class="description"><?php esc_html_e( 'توکن ربات بله که از BotFather می‌گیرید. این مقدار برای همه عملیات بازو (اتصال وب‌هوک، ارسال پیام، انتشار محصول و پرداخت در بله) الزامی است.', 'webino-dashboard' ); ?></p>
									<?php else : ?>
										<em><?php esc_html_e( 'فقط مدیرکل می‌تواند توکن را ویرایش کند.', 'webino-dashboard' ); ?></em>
									<?php endif; ?>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_channel_id"><?php esc_html_e( 'Channel ID', 'webino-dashboard' ); ?></label></th>
								<td>
									<?php if ( $can_api ) : ?>
										<input name="woobale_settings[channel_id]" id="woobale_channel_id" type="text" class="regular-text" value="<?php echo esc_attr( $s['channel_id'] ); ?>" />
										<p class="description"><?php esc_html_e( 'شناسه مقصد انتشار خودکار محصولات است. می‌تواند @username یا شناسه عددی باشد. برای کانال خصوصی معمولاً باید ID عددی وارد شود و ربات ادمین کانال باشد.', 'webino-dashboard' ); ?></p>
									<?php else : ?>
										<code><?php echo esc_html( $s['channel_id'] ); ?></code>
									<?php endif; ?>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_provider_token"><?php esc_html_e( 'Payment Provider Token', 'webino-dashboard' ); ?></label></th>
								<td>
									<?php if ( $can_api ) : ?>
										<input name="woobale_settings[provider_token]" id="woobale_provider_token" type="password" class="regular-text" value="<?php echo esc_attr( $s['provider_token'] ); ?>" autocomplete="off" />
										<p class="description"><?php esc_html_e( 'از پنل پرداخت‌دهنده بله دریافت می‌شود و فقط برای «پرداخت در بله» (sendInvoice) استفاده می‌شود. در صورت خالی بودن، «پرداخت در سایت» همچنان فعال است.', 'webino-dashboard' ); ?></p>
									<?php else : ?>
										<em>—</em>
									<?php endif; ?>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_per_page"><?php esc_html_e( 'تعداد محصول در هر صفحه (فروشگاه بازو)', 'webino-dashboard' ); ?></label></th>
								<td>
									<input name="woobale_settings[products_per_page]" id="woobale_per_page" type="number" min="1" max="20" value="<?php echo esc_attr( (string) $s['products_per_page'] ); ?>" />
									<p class="description"><?php esc_html_e( 'تعداد آیتم‌های قابل نمایش در هر صفحه فروشگاه بازو (بازه مجاز: 1 تا 20).', 'webino-dashboard' ); ?></p>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_currency_unit"><?php esc_html_e( 'واحد پول فروشگاه', 'webino-dashboard' ); ?></label></th>
								<td>
									<?php
									$cur_unit = isset( $s['store_currency_unit'] ) ? (string) $s['store_currency_unit'] : '';
									if ( $cur_unit === '' ) {
										$cur_unit = \Webino_Dashboard_Bots_Telegram\Core\Plugin::detect_currency_is_toman() ? 'toman' : 'rial';
									}
									?>
									<select name="woobale_settings[store_currency_unit]" id="woobale_currency_unit">
										<option value="toman" <?php selected( $cur_unit, 'toman' ); ?>><?php esc_html_e( 'تومان (تبدیل خودکار به ریال برای فاکتور بله)', 'webino-dashboard' ); ?></option>
										<option value="rial" <?php selected( $cur_unit, 'rial' ); ?>><?php esc_html_e( 'ریال (بدون تبدیل)', 'webino-dashboard' ); ?></option>
									</select>
									<p class="description"><?php esc_html_e( 'اگر قیمت‌های فروشگاه به تومان هستند «تومان» را انتخاب کنید تا مبلغ فاکتور بله به ریال تبدیل شود. اگر قیمت‌ها از ابتدا به ریال هستند «ریال» را انتخاب کنید.', 'webino-dashboard' ); ?></p>
								</td>
							</tr>
							<tr>
								<th scope="row"><?php esc_html_e( 'مخفی کردن محصولات ناموجود در ربات', 'webino-dashboard' ); ?></th>
								<td>
									<label>
										<input type="hidden" name="woobale_settings[hide_out_of_stock_products]" value="0" />
										<input name="woobale_settings[hide_out_of_stock_products]" type="checkbox" value="1" <?php checked( ! empty( $s['hide_out_of_stock_products'] ) && $s['hide_out_of_stock_products'] !== '0' ); ?> />
										<?php esc_html_e( 'محصولات ناموجود در فروشگاه ربات نمایش داده نشوند.', 'webino-dashboard' ); ?>
									</label>
								</td>
							</tr>
							<tr>
								<th scope="row"><?php esc_html_e( 'جوین اجباری کانال', 'webino-dashboard' ); ?></th>
								<td>
									<label>
										<input type="hidden" name="woobale_settings[force_join_enabled]" value="0" />
										<input name="woobale_settings[force_join_enabled]" type="checkbox" value="1" <?php checked( ! empty( $s['force_join_enabled'] ) && $s['force_join_enabled'] !== '0' ); ?> />
										<?php esc_html_e( 'کاربر قبل از استفاده از قابلیت‌های ربات باید عضو کانال باشد.', 'webino-dashboard' ); ?>
									</label>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_force_join_channel_id"><?php esc_html_e( 'شناسه کانال جوین اجباری', 'webino-dashboard' ); ?></label></th>
								<td>
									<input name="woobale_settings[force_join_channel_id]" id="woobale_force_join_channel_id" type="text" class="regular-text" value="<?php echo esc_attr( isset( $s['force_join_channel_id'] ) ? (string) $s['force_join_channel_id'] : '' ); ?>" placeholder="@channelusername" />
									<p class="description"><?php esc_html_e( 'برای بررسی عضویت استفاده می‌شود (مثلاً @username یا ID عددی). ربات باید به اطلاعات اعضای کانال دسترسی داشته باشد.', 'webino-dashboard' ); ?></p>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_force_join_channel_link"><?php esc_html_e( 'لینک کانال جوین اجباری', 'webino-dashboard' ); ?></label></th>
								<td>
									<input name="woobale_settings[force_join_channel_link]" id="woobale_force_join_channel_link" type="url" class="large-text" value="<?php echo esc_attr( isset( $s['force_join_channel_link'] ) ? (string) $s['force_join_channel_link'] : '' ); ?>" placeholder="https://ble.ir/yourchannel" />
									<p class="description"><?php esc_html_e( 'لینکی که در پیام عضویت اجباری به کاربر نمایش داده می‌شود.', 'webino-dashboard' ); ?></p>
								</td>
							</tr>
							<tr>
								<th scope="row"><?php esc_html_e( 'امنیت وب‌هوک', 'webino-dashboard' ); ?></th>
								<td>
									<label>
										<input type="hidden" name="woobale_settings[webhook_require_secret]" value="0" />
										<input name="woobale_settings[webhook_require_secret]" id="wbdb_tg_webhook_require_secret" type="checkbox" value="1" <?php checked( ! isset( $s['webhook_require_secret'] ) || (string) $s['webhook_require_secret'] !== '0' ); ?> />
										<?php esc_html_e( 'الزام تطابق هدر X-Telegram-Bot-Api-Secret-Token با رمز ذخیره‌شده در سایت', 'webino-dashboard' ); ?>
									</label>
									<p class="description"><?php esc_html_e( 'اگر در لاگ خطای webhook_secret_mismatch با incoming_empty می‌بینید و بله/سرور هدر را ارسال نمی‌کند، می‌توانید این گزینه را خاموش کنید (آدرس وب‌هوک شما عمومی می‌شود؛ در صورت امکان محدودیت IP یا مسیر اختصاصی در وب‌سرور بگذارید).', 'webino-dashboard' ); ?></p>
								</td>
							</tr>
						</table>
						<?php submit_button(); ?>
					</form>

					<hr />
					<h2><?php esc_html_e( 'Webhook', 'webino-dashboard' ); ?></h2>
					<p><code><?php echo esc_html( $webhook ); ?></code></p>
					<p class="description"><?php esc_html_e( 'ابتدا تنظیمات را ذخیره کنید، سپس برای اتصال ربات دکمه «اتصال به بله» را بزنید. برای توقف دریافت پیام‌ها از بله، «لغو اتصال» را بزنید.', 'webino-dashboard' ); ?></p>
					<p class="description"><?php esc_html_e( 'رمز احراز هدر وب‌هوک به‌صورت خودکار در سایت تولید و هنگام اتصال در API بله ثبت می‌شود؛ نیازی به وارد کردن دستی نیست.', 'webino-dashboard' ); ?></p>
					<p class="description"><?php esc_html_e( 'در افزونه محدودیت نرخ نرم (حدود ۹۰ درخواست در دقیقه به ازای هر IP) برای وب‌هوک اعمال می‌شود. برای بار زیاد، در Nginx یا CDN نیز محدودیت بگذارید.', 'webino-dashboard' ); ?></p>
					<?php if ( $can_api ) : ?>
						<?php
						Plugin::bootstrap_secrets();
						$health_link = add_query_arg(
							'token',
							rawurlencode( Plugin::get_health_check_token() ),
							rest_url( 'woobale/v1/health' )
						);
						?>
						<p class="description">
							<strong><?php esc_html_e( 'آدرس سلامت (مانیتورینگ GET):', 'webino-dashboard' ); ?></strong><br />
							<code style="word-break: break-all;"><?php echo esc_html( $health_link ); ?></code>
						</p>
						<details style="margin: 12px 0;">
							<summary><?php esc_html_e( 'نمونه محدودسازی نرخ در Nginx (اختیاری)', 'webino-dashboard' ); ?></summary>
							<pre style="overflow: auto; max-width: 100%; padding: 8px; background: #f6f7f7; unicode-bidi: plaintext; direction: ltr; text-align: left;">limit_req_zone $binary_remote_addr zone=woobale_wh:10m rate=30r/m;
location = /wp-json/woobale/v1/webhook {
  limit_req zone=woobale_wh burst=20 nodelay;
  try_files $uri /index.php?$args;
}
# برای مسیر admin-post.php?action=woobale_webhook در صورت نیاز location یا map جدا تعریف کنید.</pre>
						</details>
					<?php endif; ?>
					<?php if ( is_array( $webhook_info ) && isset( $webhook_info['ok'] ) && ! empty( $webhook_info['ok'] ) && ! empty( $webhook_info['result'] ) && is_array( $webhook_info['result'] ) ) : ?>
						<?php $r = $webhook_info['result']; ?>
						<p class="description">
							<strong><?php esc_html_e( 'وضعیت اتصال:', 'webino-dashboard' ); ?></strong>
							<?php
							$has_url = ! empty( $r['url'] );
							echo $has_url ? esc_html__( 'متصل', 'webino-dashboard' ) : esc_html__( 'غیرفعال', 'webino-dashboard' );
							if ( ! empty( $r['pending_update_count'] ) ) {
								echo ' — ' . esc_html__( 'آپدیت‌های در صف:', 'webino-dashboard' ) . ' ' . esc_html( (string) $r['pending_update_count'] );
							}
							if ( ! empty( $r['last_error_message'] ) ) {
								echo ' — ' . esc_html__( 'آخرین خطا:', 'webino-dashboard' ) . ' ' . esc_html( (string) $r['last_error_message'] );
							}
							?>
						</p>
					<?php endif; ?>
					<?php if ( $can_api ) : ?>
						<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline;">
							<?php wp_nonce_field( 'woobale_webhook' ); ?>
							<input type="hidden" name="action" value="woobale_set_webhook" />
							<?php submit_button( __( 'اتصال به بله', 'webino-dashboard' ), 'secondary', 'submit', false ); ?>
						</form>
						<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline;margin-left:8px;">
							<?php wp_nonce_field( 'woobale_webhook' ); ?>
							<input type="hidden" name="action" value="woobale_delete_webhook" />
							<?php submit_button( __( 'لغو اتصال', 'webino-dashboard' ), 'delete', 'submit', false ); ?>
						</form>
					<?php endif; ?>

				<?php elseif ( $tab === 'messages' ) : ?>
					<form method="post" action="options.php">
						<?php settings_fields( 'woobale' ); ?>
					<table class="form-table" role="presentation">
						<tr>
							<th scope="row"><label for="woobale_welcome"><?php esc_html_e( 'پیام خوش‌آمد', 'webino-dashboard' ); ?></label></th>
							<td><textarea name="woobale_settings[welcome_text]" id="woobale_welcome" class="large-text" rows="3"><?php echo esc_textarea( $s['welcome_text'] ); ?></textarea></td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_error"><?php esc_html_e( 'پیام خطای عمومی', 'webino-dashboard' ); ?></label></th>
							<td><textarea name="woobale_settings[error_text]" id="woobale_error" class="large-text" rows="2"><?php echo esc_textarea( $s['error_text'] ); ?></textarea></td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_contact_btn"><?php esc_html_e( 'متن دکمه تماس', 'webino-dashboard' ); ?></label></th>
							<td><input name="woobale_settings[contact_button_text]" id="woobale_contact_btn" type="text" class="regular-text" value="<?php echo esc_attr( $s['contact_button_text'] ); ?>" /></td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_store_btn"><?php esc_html_e( 'متن دکمه فروشگاه', 'webino-dashboard' ); ?></label></th>
							<td><input name="woobale_settings[store_button_text]" id="woobale_store_btn" type="text" class="regular-text" value="<?php echo esc_attr( $s['store_button_text'] ); ?>" /></td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_auth_ok"><?php esc_html_e( 'پیام پس از ورود', 'webino-dashboard' ); ?></label></th>
							<td><input name="woobale_settings[auth_success_text]" id="woobale_auth_ok" type="text" class="large-text" value="<?php echo esc_attr( $s['auth_success_text'] ); ?>" /></td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_manual_payment"><?php esc_html_e( 'قالب لینک پرداخت (دستی)', 'webino-dashboard' ); ?></label></th>
							<td>
								<textarea name="woobale_settings[manual_payment_link_template]" id="woobale_manual_payment" class="large-text" rows="2"><?php echo esc_textarea( isset( $s['manual_payment_link_template'] ) ? $s['manual_payment_link_template'] : '' ); ?></textarea>
								<p class="description"><?php esc_html_e( 'متغیرها: {order_number} {payment_url} {order_total} …', 'webino-dashboard' ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_post_tracking_url"><?php esc_html_e( 'قالب لینک رهگیری پست', 'webino-dashboard' ); ?></label></th>
							<td>
								<input name="woobale_settings[post_tracking_url_template]" id="woobale_post_tracking_url" type="text" class="large-text" value="<?php echo esc_attr( isset( $s['post_tracking_url_template'] ) ? (string) $s['post_tracking_url_template'] : '' ); ?>" placeholder="https://tracking.post.ir/?id={code}" />
								<p class="description"><?php esc_html_e( 'برای ربات: {code} (کد URL-encoded) یا {code_raw}. خالی = پیش‌فرض پست ایران.', 'webino-dashboard' ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_support_contact"><?php esc_html_e( 'متن پشتیبانی (بازو)', 'webino-dashboard' ); ?></label></th>
							<td>
								<textarea name="woobale_settings[support_contact_text]" id="woobale_support_contact" class="large-text" rows="6"><?php echo esc_textarea( isset( $s['support_contact_text'] ) ? (string) $s['support_contact_text'] : '' ); ?></textarea>
								<p class="description"><?php esc_html_e( 'با زدن دکمه «پشتیبانی» در چت بازو برای کاربر ارسال می‌شود (راه‌های تماس، شبکه‌های اجتماعی و غیره). اگر خالی باشد، در صورت پر بودن «آیدی ارتباطی کانال» و «لینک کانال بله» همان‌ها نمایش داده می‌شود.', 'webino-dashboard' ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_channel_contact_id"><?php esc_html_e( 'آیدی ارتباطی کانال', 'webino-dashboard' ); ?></label></th>
							<td>
								<input name="woobale_settings[channel_contact_id]" id="woobale_channel_contact_id" type="text" class="regular-text" value="<?php echo esc_attr( isset( $s['channel_contact_id'] ) ? (string) $s['channel_contact_id'] : '' ); ?>" />
								<p class="description"><?php esc_html_e( 'در کپشن ارسال محصول به کانال برای ثبت سفارش نمایش داده می‌شود.', 'webino-dashboard' ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_channel_bale_link"><?php esc_html_e( 'لینک کانال بله', 'webino-dashboard' ); ?></label></th>
							<td>
								<input name="woobale_settings[channel_bale_link]" id="woobale_channel_bale_link" type="url" class="large-text" value="<?php echo esc_attr( isset( $s['channel_bale_link'] ) ? (string) $s['channel_bale_link'] : '' ); ?>" />
								<p class="description"><?php esc_html_e( 'در انتهای کپشن ارسال کانال نمایش داده می‌شود.', 'webino-dashboard' ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_force_join_message"><?php esc_html_e( 'متن پیام جوین اجباری', 'webino-dashboard' ); ?></label></th>
							<td>
								<textarea name="woobale_settings[force_join_message]" id="woobale_force_join_message" class="large-text" rows="5"><?php echo esc_textarea( isset( $s['force_join_message'] ) ? (string) $s['force_join_message'] : '' ); ?></textarea>
								<p class="description"><?php esc_html_e( 'متغیرهای قابل استفاده: {channel_id} و {channel_link}', 'webino-dashboard' ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row"><label for="woobale_force_join_check_btn"><?php esc_html_e( 'متن دکمه بررسی عضویت', 'webino-dashboard' ); ?></label></th>
							<td>
								<input name="woobale_settings[force_join_check_button_text]" id="woobale_force_join_check_btn" type="text" class="regular-text" value="<?php echo esc_attr( isset( $s['force_join_check_button_text'] ) ? (string) $s['force_join_check_button_text'] : '' ); ?>" />
							</td>
						</tr>
					</table>
						<?php submit_button(); ?>
					</form>

				<?php elseif ( $tab === 'automation' ) : ?>
					<form method="post" action="options.php">
						<?php settings_fields( 'woobale' ); ?>
						<h2><?php esc_html_e( 'سبد رها شده', 'webino-dashboard' ); ?></h2>
						<table class="form-table" role="presentation">
							<tr>
								<th scope="row"><?php esc_html_e( 'یادآوری سبد', 'webino-dashboard' ); ?></th>
								<td>
									<label>
										<input type="hidden" name="woobale_settings[abandon_cart_enabled]" value="0" />
										<input name="woobale_settings[abandon_cart_enabled]" type="checkbox" value="1" <?php checked( ! empty( $s['abandon_cart_enabled'] ) && (string) $s['abandon_cart_enabled'] !== '0' ); ?> />
										<?php esc_html_e( 'ارسال خودکار در بله اگر سبد پر ماند و تسویه انجام نشد', 'webino-dashboard' ); ?>
									</label>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_abandon_delay"><?php esc_html_e( 'تأخیر (ساعت)', 'webino-dashboard' ); ?></label></th>
								<td>
									<input name="woobale_settings[abandon_cart_delay_hours]" id="woobale_abandon_delay" type="number" min="1" max="720" value="<?php echo esc_attr( isset( $s['abandon_cart_delay_hours'] ) ? (string) (int) $s['abandon_cart_delay_hours'] : '24' ); ?>" />
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_abandon_msg"><?php esc_html_e( 'متن یادآوری', 'webino-dashboard' ); ?></label></th>
								<td><textarea name="woobale_settings[abandon_cart_message]" id="woobale_abandon_msg" class="large-text" rows="3"><?php echo esc_textarea( isset( $s['abandon_cart_message'] ) ? (string) $s['abandon_cart_message'] : '' ); ?></textarea></td>
							</tr>
						</table>
						<h2><?php esc_html_e( 'حالت آزمایشی (sandbox)', 'webino-dashboard' ); ?></h2>
						<table class="form-table" role="presentation">
							<tr>
								<th scope="row"><?php esc_html_e( 'استفاده از توکن جدا', 'webino-dashboard' ); ?></th>
								<td>
									<label>
										<input type="hidden" name="woobale_settings[sandbox_mode]" value="0" />
										<input name="woobale_settings[sandbox_mode]" type="checkbox" value="1" <?php checked( ! empty( $s['sandbox_mode'] ) && (string) $s['sandbox_mode'] !== '0' ); ?> />
										<?php esc_html_e( 'برای استیجینگ/تست — تمام درخواست‌های API با توکن زیر (در صورت پر بودن)', 'webino-dashboard' ); ?>
									</label>
									<p class="description"><?php esc_html_e( 'می‌توانید ثابت WOOBALE_USE_SANDBOX_TOKEN را در wp-config نیز true کنید.', 'webino-dashboard' ); ?></p>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_bot_token_sandbox"><?php esc_html_e( 'Bot Token (sandbox)', 'webino-dashboard' ); ?></label></th>
								<td>
									<?php if ( $can_api ) : ?>
										<input name="woobale_settings[bot_token_sandbox]" id="woobale_bot_token_sandbox" type="password" class="regular-text" value="<?php echo esc_attr( isset( $s['bot_token_sandbox'] ) ? (string) $s['bot_token_sandbox'] : '' ); ?>" autocomplete="off" />
									<?php else : ?>
										<em><?php esc_html_e( 'فقط مدیرکل می‌تواند ویرایش کند.', 'webino-dashboard' ); ?></em>
									<?php endif; ?>
								</td>
							</tr>
						</table>
						<h2><?php esc_html_e( 'پشتیبانی از سفارش (دکمهٔ بله)', 'webino-dashboard' ); ?></h2>
						<table class="form-table" role="presentation">
							<tr>
								<th scope="row"><label for="woobale_support_notify_chat"><?php esc_html_e( 'chat_id ادمین / پشتیبانی', 'webino-dashboard' ); ?></label></th>
								<td>
									<input name="woobale_settings[support_notify_chat_id]" id="woobale_support_notify_chat" type="text" class="regular-text" value="<?php echo esc_attr( isset( $s['support_notify_chat_id'] ) ? (string) $s['support_notify_chat_id'] : '' ); ?>" />
									<p class="description"><?php esc_html_e( 'پیام «سوال دربارهٔ سفارش» به این چت در بله ارسال می‌شود.', 'webino-dashboard' ); ?></p>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_bot_admin_chat_ids"><?php esc_html_e( 'chat_id ادمین ربات (پنل /admin)', 'webino-dashboard' ); ?></label></th>
								<td>
									<textarea name="woobale_settings[bot_admin_chat_ids]" id="woobale_bot_admin_chat_ids" class="large-text" rows="2" placeholder="123456789"><?php echo esc_textarea( isset( $s['bot_admin_chat_ids'] ) ? (string) $s['bot_admin_chat_ids'] : '' ); ?></textarea>
									<p class="description"><?php esc_html_e( 'یک یا چند شناسهٔ چت بله (با ویرگول یا خط جدید). فقط این چت‌ها به منوی مدیریت از طریق /admin دسترسی دارند.', 'webino-dashboard' ); ?></p>
								</td>
							</tr>
							<tr>
								<th scope="row"><?php esc_html_e( 'دکمه زیر اعلان وضعیت', 'webino-dashboard' ); ?></th>
								<td>
									<label>
										<input type="hidden" name="woobale_settings[order_question_button_enabled]" value="0" />
										<input name="woobale_settings[order_question_button_enabled]" type="checkbox" value="1" <?php checked( ! empty( $s['order_question_button_enabled'] ) && (string) $s['order_question_button_enabled'] !== '0' ); ?> />
										<?php esc_html_e( 'نمایش دکمهٔ «سوال دربارهٔ این سفارش»', 'webino-dashboard' ); ?>
									</label>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_order_q_btn"><?php esc_html_e( 'متن دکمه', 'webino-dashboard' ); ?></label></th>
								<td><input name="woobale_settings[order_question_button_text]" id="woobale_order_q_btn" type="text" class="regular-text" value="<?php echo esc_attr( isset( $s['order_question_button_text'] ) ? (string) $s['order_question_button_text'] : '' ); ?>" /></td>
							</tr>
						</table>
						<h2><?php esc_html_e( 'قوانین انتشار در کانال', 'webino-dashboard' ); ?></h2>
						<p class="description"><?php esc_html_e( 'خالی = بدون محدودیت اضافی. محصولاتی که شرط را نگذرانند همگام نمی‌شوند.', 'webino-dashboard' ); ?></p>
						<table class="form-table" role="presentation">
							<tr>
								<th scope="row"><label for="woobale_ch_cat"><?php esc_html_e( 'شناسهٔ دسته‌ها', 'webino-dashboard' ); ?></label></th>
								<td>
									<input name="woobale_settings[channel_rule_category_ids]" id="woobale_ch_cat" type="text" class="large-text" value="<?php echo esc_attr( isset( $s['channel_rule_category_ids'] ) ? (string) $s['channel_rule_category_ids'] : '' ); ?>" placeholder="12, 34" />
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_ch_tag"><?php esc_html_e( 'شناسهٔ برچسب‌ها', 'webino-dashboard' ); ?></label></th>
								<td>
									<input name="woobale_settings[channel_rule_tag_ids]" id="woobale_ch_tag" type="text" class="large-text" value="<?php echo esc_attr( isset( $s['channel_rule_tag_ids'] ) ? (string) $s['channel_rule_tag_ids'] : '' ); ?>" />
								</td>
							</tr>
							<tr>
								<th scope="row"><?php esc_html_e( 'فقط حراج', 'webino-dashboard' ); ?></th>
								<td>
									<label>
										<input type="hidden" name="woobale_settings[channel_rule_sale_only]" value="0" />
										<input name="woobale_settings[channel_rule_sale_only]" type="checkbox" value="1" <?php checked( ! empty( $s['channel_rule_sale_only'] ) && (string) $s['channel_rule_sale_only'] !== '0' ); ?> />
										<?php esc_html_e( 'فقط محصول تخفیف‌دار به کانال برود', 'webino-dashboard' ); ?>
									</label>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="woobale_ch_min"><?php esc_html_e( 'حداقل قیمت', 'webino-dashboard' ); ?></label></th>
								<td>
									<input name="woobale_settings[channel_rule_min_price]" id="woobale_ch_min" type="number" step="0.01" min="0" value="<?php echo esc_attr( isset( $s['channel_rule_min_price'] ) ? (string) $s['channel_rule_min_price'] : '' ); ?>" />
								</td>
							</tr>
							<tr>
								<th scope="row"><?php esc_html_e( 'پنجرهٔ زمانی همگام‌سازی (ساعت سرور)', 'webino-dashboard' ); ?></th>
								<td>
									<input name="woobale_settings[channel_rule_hour_start]" type="number" min="0" max="23" placeholder="0-23" value="<?php echo esc_attr( isset( $s['channel_rule_hour_start'] ) && $s['channel_rule_hour_start'] !== '' ? (string) (int) $s['channel_rule_hour_start'] : '' ); ?>" />
									—
									<input name="woobale_settings[channel_rule_hour_end]" type="number" min="0" max="23" placeholder="0-23" value="<?php echo esc_attr( isset( $s['channel_rule_hour_end'] ) && $s['channel_rule_hour_end'] !== '' ? (string) (int) $s['channel_rule_hour_end'] : '' ); ?>" />
									<p class="description"><?php esc_html_e( 'خالی = همیشه. اگر پر باشد، ذخیرهٔ محصول خارج از این بازه همگام نمی‌شود.', 'webino-dashboard' ); ?></p>
								</td>
							</tr>
						</table>
						<?php submit_button(); ?>
					</form>

				<?php elseif ( $tab === 'notifications' ) : ?>
					<form method="post" action="options.php">
						<?php settings_fields( 'woobale' ); ?>
					<p class="description"><?php esc_html_e( 'با تغییر وضعیت سفارش در ووکامرس، در صورت فعال بودن، قالب زیر به مشتری در بله ارسال می‌شود.', 'webino-dashboard' ); ?></p>
					<p class="description"><code>{order_number}</code> <code>{order_id}</code> <code>{customer_name}</code> <code>{billing_phone}</code> <code>{order_status}</code> <code>{order_total}</code> <code>{payment_url}</code> <code>{tracking_code}</code> <code>{site_name}</code></p>
					<table class="form-table widefat">
						<?php
						$templates = isset( $s['order_status_templates'] ) && is_array( $s['order_status_templates'] ) ? $s['order_status_templates'] : array();
						$notify    = isset( $s['notify_status'] ) && is_array( $s['notify_status'] ) ? $s['notify_status'] : array();
						$statuses  = function_exists( 'wc_get_order_statuses' ) ? wc_get_order_statuses() : array();
						foreach ( $statuses as $wc_key => $label ) :
							$st = str_replace( 'wc-', '', $wc_key );
							$tpl_val = isset( $templates[ $st ] ) ? $templates[ $st ] : '';
							$on      = ! empty( $notify[ $st ] );
							?>
							<tr>
								<th scope="row" style="width:220px;">
									<label>
										<input type="hidden" name="woobale_settings[notify_status][<?php echo esc_attr( $st ); ?>]" value="0" />
										<input type="checkbox" name="woobale_settings[notify_status][<?php echo esc_attr( $st ); ?>]" value="1" <?php checked( $on ); ?> />
										<?php echo esc_html( $label ); ?>
										<code><?php echo esc_html( $st ); ?></code>
									</label>
								</th>
								<td>
									<textarea name="woobale_settings[order_status_templates][<?php echo esc_attr( $st ); ?>]" class="large-text" rows="3"><?php echo esc_textarea( $tpl_val ); ?></textarea>
								</td>
							</tr>
						<?php endforeach; ?>
					</table>
						<?php submit_button(); ?>
					</form>
				<?php endif; ?>
		</div>
		<?php
	}

	public function handle_set_webhook(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Forbidden', 'webino-dashboard' ) );
		}
		check_admin_referer( 'woobale_webhook' );
		Plugin::bootstrap_secrets();
		$url    = WebhookController::webhook_url();
		$client = new Client();
		$secret = Plugin::get_webhook_secret();
		$res    = $client->set_webhook( $url, $secret !== '' ? $secret : null );
		$notice = $res && isset( $res['ok'] ) && $res['ok'] ? 'wbdb_tg_webhook_ok' : 'wbdb_tg_webhook_fail';
		if ( $notice === 'wbdb_tg_webhook_fail' ) {
			set_transient( 'woobale_last_api_error', Client::summarize_error( $res ), 60 );
		}
		wp_safe_redirect( add_query_arg( 'woobale', $notice, admin_url( 'admin.php?page=woobale-settings' ) ) );
		exit;
	}

	public function handle_delete_webhook(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Forbidden', 'webino-dashboard' ) );
		}
		check_admin_referer( 'woobale_webhook' );
		$client = new Client();
		$res = $client->delete_webhook();
		if ( $res && isset( $res['ok'] ) && $res['ok'] ) {
			wp_safe_redirect( add_query_arg( 'woobale', 'wbdb_tg_webhook_deleted', admin_url( 'admin.php?page=woobale-settings' ) ) );
			exit;
		}
		set_transient( 'woobale_last_api_error', Client::summarize_error( $res ), 60 );
		wp_safe_redirect( add_query_arg( 'woobale', 'wbdb_tg_webhook_delete_fail', admin_url( 'admin.php?page=woobale-settings' ) ) );
		exit;
	}
}
