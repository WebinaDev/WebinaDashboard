<?php

namespace WncBasalam\Admin\Settings;

use WncBasalam\Queue\Tasks\Debug;
use WncBasalam\Actions\Controller\ProductActions\CancelDebug;
use WncBasalam\Services\WebhookService;
use WncBasalam\Services\VendorInfoService;

defined('ABSPATH') || exit;

class SettingsPageHandler
{
    private const VALIDATION_ERROR_TRANSIENT_PREFIX = 'wnc_basalam_settings_validation_error_';

    public static function saveSettings()
    {
        $data = isset($_POST['wnc_basalam_settings']) ? array_map('sanitize_text_field', wp_unslash($_POST['wnc_basalam_settings'])) : [];

        if ($data) {
            if (!SettingsManager::isProductUpdateSelectionValid($data)) {
                self::pushValidationError(SettingsConfig::CUSTOM_PRODUCT_UPDATE_REQUIRED_MESSAGE);
                return false;
            }

            SettingsManager::updateSettings($data);

            if (!empty($data[SettingsConfig::DEVELOPER_MODE]) && $data[SettingsConfig::DEVELOPER_MODE] === 'true') {
                $debugTask = new Debug();
                $debugTask->schedule();
            } else {
                (new CancelDebug())();
            }
        }

        if (isset($_POST['get_token']) && $_POST['get_token'] == 1) {
            self::redirectToOAuth();
        }

        return true;
    }

    public static function pullValidationError(): string
    {
        $userId = get_current_user_id();
        if ($userId <= 0) return '';

        $key = self::VALIDATION_ERROR_TRANSIENT_PREFIX . $userId;
        $message = get_transient($key);
        delete_transient($key);

        return is_string($message) ? $message : '';
    }

    private static function pushValidationError(string $message): void
    {
        $userId = get_current_user_id();
        if ($userId <= 0) return;

        set_transient(
            self::VALIDATION_ERROR_TRANSIENT_PREFIX . $userId,
            wp_strip_all_tags($message),
            2 * MINUTE_IN_SECONDS
        );
    }

    private static function redirectToOAuth()
    {
        $OAuthManger = new OAuthManager();
        $oauthUrls = $OAuthManger->getOAuthUrls();

        // Mark this authorization as started by the current (authenticated) admin
        // so the OAuth callback can reject forged requests. This runs only after
        // the nonce-protected settings POST, so it cannot be triggered cross-site.
        OAuthManager::issueOauthState();

        wp_redirect($oauthUrls['url_req_token']); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- Intentional external/user-provided redirect.
        exit();
    }

    public static function handleOauthCallback()
    {
        $oauthSaved = OAuthManager::saveOauthData();

        if ($oauthSaved) {
            $webhookService = new WebhookService();
            $webhookService->setupWebhook();
            $vendorInfoService = new VendorInfoService();
            $vendorInfoService->FetchVendorInfo();
        }

        $onboardingCompleted = get_option('wnc_basalam_onboarding_completed');

        if (!$onboardingCompleted) {
            wp_safe_redirect(admin_url('admin.php?page=wnc_basalam-onboarding&step=3'));
        } else {
            wp_safe_redirect(admin_url('admin.php?page=wnc_basalam'));
        }
        exit();
    }
}
