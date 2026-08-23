<?php

namespace WncBasalam\Endpoints;

use WncBasalam\Admin\Settings\SettingsConfig;
use WncBasalam\Logger\Logger;
use WncBasalam\Services\Orders\OrderManager;
use WncBasalam\Services\WebhookService;

defined('ABSPATH') || exit;

class OrderEndpoint
{
    public static function registerRoutes(): void
    {
        register_rest_route(
            'wnc-basalam',
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
        $webhook_token = wncBasalamSettings()->getSettings(SettingsConfig::WEBHOOK_HEADER_TOKEN);

        $headers = $request->get_headers();

        if (!isset($headers['token'][0])) {
            $webhookService = new WebhookService();
            $webhookService->setupWebhook();

            Logger::error("سفارش جدیدی در باسلام ثبت شد، اما توکن ارسال نشد");

            return new \WP_Error(
                'wnc_basalam_missing_webhook_token',
                'توکن وب‌هوک ارسال نشده است.',
                ['status' => 403]
            );
        }

        $receive_token = sanitize_text_field($headers['token'][0]);

        if ($receive_token === $webhook_token) {
            return true;
        }

        $webhookService = new WebhookService();
        $webhookService->setupWebhook();

        Logger::error("سفارش جدیدی در باسلام ایجاد شد اما توکن ارسالی معتبر نیست.");

        return new \WP_Error(
            'wnc_basalam_invalid_webhook_token',
            'توکن وب‌هوک معتبر نیست.',
            ['status' => 403]
        );
    }
}