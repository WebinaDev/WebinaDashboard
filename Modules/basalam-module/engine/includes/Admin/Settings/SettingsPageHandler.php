<?php

namespace WebinoBasalam\Admin\Settings;

use WebinoBasalam\Queue\Tasks\Debug;
use WebinoBasalam\Actions\Controller\ProductActions\CancelDebug;
use WebinoBasalam\Services\WebhookService;
use WebinoBasalam\Services\VendorInfoService;

defined('ABSPATH') || exit;

class SettingsPageHandler
{
    private const VALIDATION_ERROR_TRANSIENT_PREFIX = 'webino_basalam_settings_validation_error_';

    public static function saveSettings()
    {
        $data = isset($_POST['webino_basalam_sync_settings']) ? array_map('sanitize_text_field', wp_unslash($_POST['webino_basalam_sync_settings'])) : [];

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
        $return = '';
        if ( class_exists( '\Webino_Dashboard_Rewrite', false ) ) {
            $return = \Webino_Dashboard_Rewrite::url( 'settings/shop/basalam' );
        }
        OAuthManager::issueOauthState( $return );
        $oauth = new OAuthManager();
        $started = $oauth->startViaCrm( $return );
        if ( empty( $started['url'] ) ) {
            wp_die(
                esc_html( isset( $started['error'] ) ? (string) $started['error'] : __( 'شروع OAuth ناموفق بود.', 'webino-dashboard' ) ),
                esc_html__( 'باسلام', 'webino-dashboard' ),
                array( 'response' => 502 )
            );
        }
        wp_redirect( $started['url'] ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- Intentional external SSO redirect.
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

        $dashboardReturn = OAuthManager::consumeOauthReturnUrl();
        if ( $dashboardReturn ) {
            wp_safe_redirect( $dashboardReturn );
            exit();
        }

        $onboardingCompleted = get_option('webino_basalam_onboarding_completed');

        if (!$onboardingCompleted) {
            wp_safe_redirect(admin_url('admin.php?page=webino_basalam-onboarding&step=3'));
        } else {
            wp_safe_redirect(admin_url('admin.php?page=webino_basalam'));
        }
        exit();
    }
}
