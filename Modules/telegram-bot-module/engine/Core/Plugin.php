<?php

namespace Webino_Dashboard_Bots_Telegram\Core;

use Webino_Dashboard_Bots_Telegram\Admin\AdminAssets;
use Webino_Dashboard_Bots_Telegram\Admin\AjaxHandlers;
use Webino_Dashboard_Bots_Telegram\Admin\BroadcastPage;
use Webino_Dashboard_Bots_Telegram\Admin\BroadcastQueue;
use Webino_Dashboard_Bots_Telegram\Admin\BotUsersPage;
use Webino_Dashboard_Bots_Telegram\Admin\CampaignPage;
use Webino_Dashboard_Bots_Telegram\Admin\Menu;
use Webino_Dashboard_Bots_Telegram\Admin\OrderBalePanel;
use Webino_Dashboard_Bots_Telegram\Admin\SettingsPage;
use Webino_Dashboard_Bots_Telegram\Admin\UserProfileBale;
use Webino_Dashboard_Bots_Telegram\Api\HealthController;
use Webino_Dashboard_Bots_Telegram\Api\WebhookController;
use Webino_Dashboard_Bots_Telegram\Messaging\MessageRetryQueue;
use Webino_Dashboard_Bots_Telegram\Woo\AbandonedCartService;
use Webino_Dashboard_Bots_Telegram\Woo\BackInStockNotifier;
use Webino_Dashboard_Bots_Telegram\Woo\BaleDisconnect;
use Webino_Dashboard_Bots_Telegram\Woo\OrderStatusNotifier;
use Webino_Dashboard_Bots_Telegram\Woo\ProductChannelSync;

/**
 * Main plugin bootstrap.
 */
class Plugin {

	/**
	 * @var self|null
	 */
	private static $instance = null;

	/**
	 * @return self
	 */
	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function init(): void {
		BroadcastQueue::init();
		MessageRetryQueue::init();
		CampaignPage::init();
		$embedded = defined( 'WEBINO_DASHBOARD_BOTS_EMBEDDED' ) && WEBINO_DASHBOARD_BOTS_EMBEDDED;
		if ( ! $embedded && is_admin() ) {
			AdminAssets::init();
			Menu::init();
			SettingsPage::instance()->init();
			BroadcastPage::init();
			AjaxHandlers::init();
			OrderBalePanel::init();
			UserProfileBale::init();
			BotUsersPage::init();
			add_action(
				'admin_notices',
				static function () {
					if ( ! current_user_can( 'manage_options' ) ) {
						return;
					}
					if ( class_exists( '\WooCommerce' ) ) {
						return;
					}
					echo '<div class="notice notice-warning"><p>' . esc_html__( 'WooBale نیاز به فعال بودن ووکامرس دارد.', 'webino-dashboard' ) . '</p></div>';
				}
			);
		}

		WebhookController::instance()->init();
		HealthController::instance()->init();

		if ( class_exists( '\WooCommerce' ) ) {
			AbandonedCartService::init();
			BackInStockNotifier::init();
			BaleDisconnect::init();
			ProductChannelSync::instance()->init();
			OrderStatusNotifier::instance()->init();
		}
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function get_settings(): array {
		$defaults = self::settings_defaults();
		$stored   = get_option( 'webino_dashboard_telegram_bot_settings', array() );
		$out      = array_merge( $defaults, is_array( $stored ) ? $stored : array() );

		if ( ! isset( $out['order_status_templates'] ) || ! is_array( $out['order_status_templates'] ) ) {
			$out['order_status_templates'] = array();
		}
		if ( ! isset( $out['notify_status'] ) || ! is_array( $out['notify_status'] ) ) {
			$out['notify_status'] = array();
		}

		if ( function_exists( 'wc_get_order_statuses' ) ) {
			foreach ( wc_get_order_statuses() as $wc_key => $label ) {
				$st = str_replace( 'wc-', '', $wc_key );
				if ( ! isset( $out['order_status_templates'][ $st ] ) ) {
					$out['order_status_templates'][ $st ] = isset( $defaults['order_status_templates'][ $st ] )
						? $defaults['order_status_templates'][ $st ]
						: '';
				}
				if ( ! isset( $out['notify_status'][ $st ] ) ) {
					$out['notify_status'][ $st ] = isset( $defaults['notify_status'][ $st ] )
						? $defaults['notify_status'][ $st ]
						: '0';
				}
			}
		}

		if ( class_exists( 'Webino_Dashboard_Bots_Order_Notify', false ) ) {
			$out['shop_notify'] = Webino_Dashboard_Bots_Order_Notify::normalize_shop_notify( $out );
		}

		return $out;
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function settings_defaults(): array {
		$templates = array(
			'pending'    => __( 'سفارش {order_number} ثبت شد. وضعیت: {order_status}. مبلغ: {order_total}', 'webino-dashboard' ),
			'processing' => __( 'پرداخت/سفارش {order_number} در حال پردازش است. مبلغ: {order_total}', 'webino-dashboard' ),
			'on-hold'    => __( 'سفارش {order_number} در انتظار بررسی است.', 'webino-dashboard' ),
			'completed'  => __( 'سفارش {order_number} تکمیل شد. با تشکر از خرید شما.', 'webino-dashboard' ),
			'cancelled'  => __( 'سفارش {order_number} لغو شد.', 'webino-dashboard' ),
			'refunded'   => __( 'برای سفارش {order_number} بازپرداخت ثبت شد.', 'webino-dashboard' ),
			'failed'     => __( 'سفارش {order_number} ناموفق بود.', 'webino-dashboard' ),
		);

		$notify = array(
			'pending'    => '0',
			'processing' => '1',
			'on-hold'    => '0',
			'completed'  => '1',
			'cancelled'  => '0',
			'refunded'   => '0',
			'failed'     => '0',
		);

		return array(
			'plan_tier'                     => 'basic',
			'bot_token'                     => '',
			'channel_id'                    => '',
			'provider_token'                => '',
			'welcome_text'                  => __( 'به فروشگاه خوش آمدید.', 'webino-dashboard' ),
			'error_text'                    => __( 'خطایی رخ داد. لطفاً دوباره تلاش کنید.', 'webino-dashboard' ),
			'contact_button_text'           => __( 'ارسال شماره تماس', 'webino-dashboard' ),
			'store_button_text'             => __( '🛍 فروشگاه', 'webino-dashboard' ),
			'support_contact_text'          => '',
			'auth_success_text'             => __( 'ورود/ثبت‌نام با موفقیت انجام شد.', 'webino-dashboard' ),
			'products_per_page'             => 5,
			'store_currency_unit'           => '',
			'invoice_amount_rial_multiplier' => 1,
			'webhook_secret'                => '',
			/** When '0', accept webhooks without X-Telegram-Bot-Api-Secret-Token (less secure). */
			'webhook_require_secret'        => '1',
			/** Outbound Telegram API proxy: none | http | socks4 | socks5. */
			'proxy_type'                    => 'none',
			'proxy_host'                    => '',
			'proxy_port'                    => '',
			'proxy_username'                => '',
			'proxy_password'                => '',
			'manual_payment_link_template'  => __( 'لینک پرداخت سفارش {order_number}: {payment_url}', 'webino-dashboard' ),
			'channel_contact_id'            => '@parisma_admin',
			'channel_bale_link'             => 'http://ble.ir/parisma_gallery',
			'force_join_enabled'            => '0',
			'force_join_channel_id'         => '',
			'force_join_channel_link'       => '',
			'force_join_message'            => __( "لطفاً برای استفاده از امکانات ربات ابتدا در کانال ما عضو شوید.\n\nبعد از عضویت روی دکمه «بررسی عضویت» بزنید.", 'webino-dashboard' ),
			'force_join_check_button_text'  => __( 'بررسی عضویت', 'webino-dashboard' ),
			'post_tracking_url_template'    => 'https://tracking.post.ir/?id={code}',
			'hide_out_of_stock_products'    => '0',
			'menu_show_store'               => '1',
			'menu_show_search'              => '1',
			'menu_show_wishlist'            => '1',
			'menu_show_cart'                => '1',
			'menu_show_checkout'            => '1',
			'menu_show_orders'              => '1',
			'menu_show_addresses'           => '1',
			'menu_show_support'             => '1',
			'menu_show_sale'                => '1',
			'order_status_templates'        => $templates,
			'notify_status'                 => $notify,
			'abandon_cart_enabled'          => '0',
			'abandon_cart_delay_hours'      => 24,
			'abandon_cart_delay_hours_2'    => 48,
			'abandon_cart_delay_hours_3'    => 72,
			'abandon_cart_message'          => __( 'سبد خرید شما هنوز منتظر است. برای ادامهٔ تسویه روی دکمه زیر بزنید.', 'webino-dashboard' ),
			'abandon_cart_message_2'        => __( 'هنوز سبدتان را رها کرده‌اید! با یک کد تخفیف برگردید.', 'webino-dashboard' ),
			'abandon_cart_message_3'        => __( 'آخرین فرصت: سبد خریدتان در انتظار است.', 'webino-dashboard' ),
			'abandon_cart_coupon_2'         => 0,
			'abandon_cart_coupon_3'         => 0,
			'sandbox_mode'                  => '0',
			'bot_token_sandbox'             => '',
			'support_notify_chat_id'        => '',
			'bot_admin_chat_ids'            => '',
			'order_question_button_enabled' => '1',
			'order_question_button_text'    => __( 'سوال دربارهٔ این سفارش', 'webino-dashboard' ),
			'channel_rule_category_ids'     => '',
			'channel_rule_tag_ids'            => '',
			'channel_rule_sale_only'          => '0',
			'channel_rule_min_price'          => '',
			'channel_rule_hour_start'         => '',
			'channel_rule_hour_end'           => '',
		);
	}

	/**
	 * @param array<string, mixed> $settings
	 */
	public static function update_settings( array $settings ): void {
		update_option( 'webino_dashboard_telegram_bot_settings', $settings );
	}

	public static function get_bot_token(): string {
		$s = self::get_settings();
		$use_sandbox = ! empty( $s['sandbox_mode'] ) && (string) $s['sandbox_mode'] !== '0';
		if ( defined( 'WOOBALE_USE_SANDBOX_TOKEN' ) && WOOBALE_USE_SANDBOX_TOKEN ) {
			$use_sandbox = true;
		}
		if ( $use_sandbox ) {
			$t = isset( $s['bot_token_sandbox'] ) ? trim( (string) $s['bot_token_sandbox'] ) : '';
			if ( $t !== '' ) {
				return $t;
			}
		}
		return isset( $s['bot_token'] ) ? (string) $s['bot_token'] : '';
	}

	public static function get_plan_tier(): string {
		$s    = self::get_settings();
		$tier = isset( $s['plan_tier'] ) ? sanitize_key( (string) $s['plan_tier'] ) : 'basic';
		return in_array( $tier, array( 'basic', 'advanced' ), true ) ? $tier : 'basic';
	}

	public static function has_feature( string $feature ): bool {
		$tier = self::get_plan_tier();
		if ( $tier === 'advanced' ) {
			return true;
		}
		$basic_features = array(
			'text_broadcast',
		);
		return in_array( $feature, $basic_features, true );
	}

	public static function get_channel_id(): string {
		$s = self::get_settings();
		return isset( $s['channel_id'] ) ? (string) $s['channel_id'] : '';
	}

	public static function get_provider_token(): string {
		$s = self::get_settings();
		return isset( $s['provider_token'] ) ? (string) $s['provider_token'] : '';
	}

	/**
	 * If non-empty, webhook requests must send matching X-Telegram-Bot-Api-Secret-Token header.
	 */
	public static function get_webhook_secret(): string {
		$s = self::get_settings();
		return isset( $s['webhook_secret'] ) ? (string) $s['webhook_secret'] : '';
	}

	/**
	 * Auto-generate webhook secret and internal health token when missing (no user input).
	 */
	public static function bootstrap_secrets(): void {
		if ( ! function_exists( 'get_option' ) ) {
			return;
		}
		$s = self::get_settings();
		if ( (string) ( $s['webhook_secret'] ?? '' ) === '' ) {
			$stored = get_option( 'webino_dashboard_telegram_bot_settings', array() );
			if ( ! is_array( $stored ) ) {
				$stored = array();
			}
			$stored['webhook_secret'] = self::generate_secret_token( 48 );
			update_option( 'webino_dashboard_telegram_bot_settings', array_merge( self::settings_defaults(), $stored ) );
		}
		if ( (string) get_option( 'webino_dashboard_telegram_internal_health_token', '' ) === '' ) {
			update_option( 'webino_dashboard_telegram_internal_health_token', self::generate_secret_token( 32 ), false );
		}
	}

	/**
	 * Token for GET /woobale/v1/health (query arg `token`).
	 */
	public static function get_health_check_token(): string {
		self::bootstrap_secrets();
		return (string) get_option( 'webino_dashboard_telegram_internal_health_token', '' );
	}

	/**
	 * Cryptographically strong token; max 256 chars for Telegram webhook secret.
	 *
	 * @param int $byte_len Number of random bytes (hex length = 2 * byte_len).
	 */
	public static function generate_secret_token( int $byte_len = 32 ): string {
		$byte_len = max( 8, min( 64, $byte_len ) );
		try {
			$raw = random_bytes( $byte_len );
		} catch ( \Throwable $e ) {
			return substr( (string) wp_generate_password( 64, true, true ), 0, 64 );
		}
		$hex = bin2hex( $raw );
		return strlen( $hex ) <= 256 ? $hex : substr( $hex, 0, 256 );
	}

	public static function get_invoice_amount_rial_multiplier(): float {
		$s    = self::get_settings();
		$unit = isset( $s['store_currency_unit'] ) ? (string) $s['store_currency_unit'] : '';

		if ( $unit === 'toman' ) {
			return 10.0;
		}
		if ( $unit === 'rial' ) {
			return 1.0;
		}

		if ( isset( $s['invoice_amount_rial_multiplier'] ) && (float) $s['invoice_amount_rial_multiplier'] > 0 ) {
			return (float) $s['invoice_amount_rial_multiplier'];
		}

		return self::detect_currency_is_toman() ? 10.0 : 1.0;
	}

	public static function detect_currency_is_toman(): bool {
		if ( ! function_exists( 'get_woocommerce_currency' ) ) {
			return false;
		}
		$c = (string) get_woocommerce_currency();
		if ( in_array( strtoupper( $c ), array( 'IRT', 'TOMAN' ), true ) ) {
			return true;
		}
		return $c === 'تومان';
	}
}
