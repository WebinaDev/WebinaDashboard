<?php

namespace WebinoBasalam\Endpoints;

use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Logger\Logger;
use WebinoBasalam\Services\Orders\OrderManager;
use WebinoBasalam\Services\WebhookService;

defined('ABSPATH') || exit;

class OrderEndpoint
{
    public static function registerRoutes(): void
    {
        register_rest_route(
            'webino-basalam',
            '/v1/order-manager',
            [
                'methods'             => 'POST',
                'callback'            => [OrderManager::class, 'orderManger'],
                'permission_callback' => [__CLASS__, 'checkPermissions'],
            ]
        );
    }

    public static function checkPermissions($request)
    {
        $webhook_token = webinoBasalamSettings()->getSettings(SettingsConfig::WEBHOOK_HEADER_TOKEN);

        $headers = $request->get_headers();

        if (!isset($headers['token'][0])) {
            self::maybeResetupWebhook();

            Logger::error("سفارش جدیدی در باسلام ثبت شد، اما توکن ارسال نشد");

            return new \WP_Error(
                'webino_basalam_missing_webhook_token',
                'توکن وب‌هوک ارسال نشده است.',
                ['status' => 403]
            );
        }

        $receive_token = sanitize_text_field($headers['token'][0]);

        if (is_string($webhook_token) && '' !== $webhook_token && hash_equals($webhook_token, $receive_token)) {
            return true;
        }

        self::maybeResetupWebhook();

        Logger::error("سفارش جدیدی در باسلام ایجاد شد اما توکن ارسالی معتبر نیست.");

        return new \WP_Error(
            'webino_basalam_invalid_webhook_token',
            'توکن وب‌هوک معتبر نیست.',
            ['status' => 403]
        );
    }

    /**
     * Unauthenticated callers must not be able to trigger outbound Basalam API calls on every hit.
     */
    private static function maybeResetupWebhook(): void
    {
        $key = 'webino_basalam_webhook_resetup';
        if (get_transient($key)) return;
        set_transient($key, 1, 15 * MINUTE_IN_SECONDS);
        (new WebhookService())->setupWebhook();
    }
}
