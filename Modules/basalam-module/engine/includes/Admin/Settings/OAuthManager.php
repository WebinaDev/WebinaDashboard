<?php

namespace WebinoBasalam\Admin\Settings;

use WebinoBasalam\Config\Endpoints;

defined('ABSPATH') || exit;

/**
 * Basalam OAuth via WebinaCRM proxy (webina.dev) — no Hamsalam dependency.
 */
class OAuthManager
{
    /** Prefix for the per-user transient holding a pending OAuth authorization. */
    const OAUTH_STATE_TRANSIENT = 'webino_basalam_oauth_state_';

    /** Lifetime of a pending OAuth authorization — the SSO round-trip window. */
    const OAUTH_STATE_TTL = 600;

    /** Max age for CRM handoff signature timestamp (seconds). */
    const HANDOFF_MAX_AGE = 180;

    /**
     * Remember that the current admin has just started an OAuth authorization.
     *
     * @param string $return_url Optional dashboard return URL.
     * @return string
     */
    public static function issueOauthState( $return_url = '' )
    {
        $state = wp_generate_password(64, false);
        set_transient(self::OAUTH_STATE_TRANSIENT . get_current_user_id(), $state, self::OAUTH_STATE_TTL);
        $return_url = esc_url_raw( (string) $return_url );
        if ( '' !== $return_url ) {
            set_transient( self::OAUTH_STATE_TRANSIENT . 'return_' . get_current_user_id(), $return_url, self::OAUTH_STATE_TTL );
        } else {
            delete_transient( self::OAUTH_STATE_TRANSIENT . 'return_' . get_current_user_id() );
        }

        return $state;
    }

    /**
     * @return string
     */
    public static function consumeOauthReturnUrl()
    {
        $key = self::OAUTH_STATE_TRANSIENT . 'return_' . get_current_user_id();
        $url = get_transient( $key );
        delete_transient( $key );
        return is_string( $url ) ? $url : '';
    }

    /**
     * @return bool
     */
    private static function verifyOauthState()
    {
        $key      = self::OAUTH_STATE_TRANSIENT . get_current_user_id();
        $expected = get_transient($key);
        delete_transient($key);
        return ! empty($expected);
    }

    /**
     * CRM proxy host (webina.dev by default).
     *
     * @return string
     */
    public static function crmBaseUrl()
    {
        $host = defined( 'WEBINO_DASHBOARD_VENDOR_URL' )
            ? (string) WEBINO_DASHBOARD_VENDOR_URL
            : 'https://webina.dev';
        return untrailingslashit( apply_filters( 'webino_basalam_crm_oauth_base', $host ) );
    }

    /**
     * Static OAuth metadata (Webina-owned client; secret stays on CRM).
     *
     * @return array{client_id:string,redirect_uri:string}
     */
    public function getOauthData()
    {
        return array(
            'client_id'    => (string) apply_filters( 'webino_basalam_oauth_default_client_id', Endpoints::WEBINO_OAUTH_CLIENT_ID ),
            'redirect_uri' => (string) apply_filters( 'webino_basalam_oauth_default_redirect_uri', Endpoints::WEBINO_OAUTH_REDIRECT_URI ),
        );
    }

    /**
     * Start OAuth via WebinaCRM and return SSO URL.
     *
     * @param string $return_url Dashboard return after connect.
     * @return array{url:string,redirect_uri:string,client_id:string,state?:string}|array{error:string}
     */
    public function startViaCrm( $return_url = '' )
    {
        $oauthData = $this->getOauthData();
        $endpoint  = self::crmBaseUrl() . '/wp-json/webinocrm/v1/basalam/oauth/start';

        $response = wp_remote_post(
            $endpoint,
            array(
                'timeout' => 30,
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'Accept'       => 'application/json',
                ),
                'body'    => wp_json_encode(
                    array(
                        'site_url'   => get_site_url(),
                        'return_url' => (string) $return_url,
                    )
                ),
            )
        );

        if ( is_wp_error( $response ) ) {
            return array( 'error' => $response->get_error_message() );
        }

        $code = (int) wp_remote_retrieve_response_code( $response );
        $data = json_decode( (string) wp_remote_retrieve_body( $response ), true );
        if ( ! is_array( $data ) ) {
            $data = array();
        }

        if ( $code < 200 || $code >= 300 || empty( $data['url'] ) ) {
            $message = isset( $data['message'] ) ? (string) $data['message'] : __( 'WebinaCRM OAuth start failed.', 'webino-dashboard' );
            return array( 'error' => $message );
        }

        return array(
            'url'          => (string) $data['url'],
            'redirect_uri' => (string) ( $data['redirect_uri'] ?? $oauthData['redirect_uri'] ),
            'client_id'    => (string) ( $data['client_id'] ?? $oauthData['client_id'] ),
            'state'        => (string) ( $data['state'] ?? '' ),
        );
    }

    /**
     * Refresh access token through WebinaCRM (client_secret never leaves CRM).
     *
     * @return true|\WP_Error
     */
    public static function refreshAccessToken()
    {
        $refresh = (string) webinoBasalamSettings()->getSettings( SettingsConfig::REFRESH_TOKEN );
        if ( '' === $refresh ) {
            return new \WP_Error( 'basalam_no_refresh', __( 'Refresh token missing.', 'webino-dashboard' ) );
        }

        $endpoint = self::crmBaseUrl() . '/wp-json/webinocrm/v1/basalam/oauth/refresh';
        $response = wp_remote_post(
            $endpoint,
            array(
                'timeout' => 30,
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'Accept'       => 'application/json',
                ),
                'body'    => wp_json_encode(
                    array(
                        'refresh_token' => $refresh,
                        'site_url'      => get_site_url(),
                        'vendor_id'     => absint( webinoBasalamSettings()->getSettings( SettingsConfig::VENDOR_ID ) ),
                    )
                ),
            )
        );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $code = (int) wp_remote_retrieve_response_code( $response );
        $data = json_decode( (string) wp_remote_retrieve_body( $response ), true );
        if ( ! is_array( $data ) || $code < 200 || $code >= 300 || empty( $data['access_token'] ) ) {
            $message = isset( $data['message'] ) ? (string) $data['message'] : __( 'Token refresh failed.', 'webino-dashboard' );
            return new \WP_Error( 'basalam_refresh_failed', $message );
        }

        SettingsManager::updateSettings(
            array(
                SettingsConfig::TOKEN             => sanitize_text_field( (string) $data['access_token'] ),
                SettingsConfig::REFRESH_TOKEN     => sanitize_text_field( (string) ( $data['refresh_token'] ?? $refresh ) ),
                SettingsConfig::EXPIRE_TOKEN_TIME => isset( $data['expires_in'] ) ? absint( $data['expires_in'] ) : null,
            )
        );
        if ( function_exists( 'webinoBasalamSettings' ) ) {
            webinoBasalamSettings()->forget();
        }

        return true;
    }

    /**
     * Save tokens from CRM handoff GET callback.
     *
     * @return bool
     */
    public static function saveOauthData()
    {
        if ( ! current_user_can( 'manage_woocommerce' ) || ! self::verifyOauthState() ) {
            wp_die(
                esc_html__( 'درخواست نامعتبر است.', 'webino-dashboard' ),
                esc_html__( 'خطای امنیتی', 'webino-dashboard' ),
                array( 'response' => 403 )
            );
        }

        $isVendor     = isset( $_GET['is_vendor'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['is_vendor'] ) ) : 'true';
        $vendorId     = isset( $_GET['vendor_id'] ) ? (string) absint( $_GET['vendor_id'] ) : null;
        $accessToken  = isset( $_GET['access_token'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['access_token'] ) ) : null;
        $refreshToken = isset( $_GET['refresh_token'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['refresh_token'] ) ) : null;
        $expiresIn    = isset( $_GET['expires_in'] ) ? absint( $_GET['expires_in'] ) : null;

        // Optional CRM handoff signature (webino_sig / webino_ts / webino_hk).
        if ( isset( $_GET['webino_sig'], $_GET['webino_ts'], $_GET['webino_hk'] ) ) {
            $ts = absint( $_GET['webino_ts'] );
            $hk = sanitize_text_field( wp_unslash( (string) $_GET['webino_hk'] ) );
            $sig = sanitize_text_field( wp_unslash( (string) $_GET['webino_sig'] ) );
            if ( $ts < 1 || ( time() - $ts ) > self::HANDOFF_MAX_AGE || '' === $hk || '' === $sig ) {
                wp_die(
                    esc_html__( 'امضای بازگشت منقضی یا نامعتبر است.', 'webino-dashboard' ),
                    esc_html__( 'خطای امنیتی', 'webino-dashboard' ),
                    array( 'response' => 403 )
                );
            }
            $payload = (string) $accessToken . '|' . (string) $refreshToken . '|' . (string) $ts . '|' . (string) $vendorId . '|' . untrailingslashit( get_site_url() );
            $expect  = hash_hmac( 'sha256', $payload, $hk );
            if ( ! hash_equals( $expect, $sig ) ) {
                wp_die(
                    esc_html__( 'امضای بازگشت نامعتبر است.', 'webino-dashboard' ),
                    esc_html__( 'خطای امنیتی', 'webino-dashboard' ),
                    array( 'response' => 403 )
                );
            }
        }

        // Persist return_url from CRM handoff if local transient was lost.
        if ( isset( $_GET['return_url'] ) && is_string( $_GET['return_url'] ) ) {
            $ru = esc_url_raw( wp_unslash( $_GET['return_url'] ) );
            if ( '' !== $ru ) {
                set_transient( self::OAUTH_STATE_TRANSIENT . 'return_' . get_current_user_id(), $ru, self::OAUTH_STATE_TTL );
            }
        }

        $extraData = apply_filters( 'webino_basalam_oauth_save_extra_data', array() );

        if ( 'false' === $isVendor ) {
            $data = array( SettingsConfig::IS_VENDOR => false );
            $data = apply_filters( 'webino_basalam_oauth_non_vendor_data', $data, $vendorId, $accessToken, $refreshToken, $extraData );
            SettingsManager::updateSettings( $data );
            return true;
        }

        if ( absint( $vendorId ) < 1 ) {
            return false;
        }

        $data = array(
            SettingsConfig::VENDOR_ID         => $vendorId,
            SettingsConfig::IS_VENDOR         => $isVendor,
            SettingsConfig::TOKEN             => $accessToken,
            SettingsConfig::REFRESH_TOKEN     => $refreshToken,
            SettingsConfig::EXPIRE_TOKEN_TIME => $expiresIn,
            // Clear legacy Hamsalam fields.
            SettingsConfig::HAMSALAM_TOKEN       => null,
            SettingsConfig::HAMSALAM_BUSINESS_ID => null,
        );

        $data = array_merge( $data, $extraData );
        SettingsManager::updateSettings( $data );

        return true;
    }

    /**
     * Manually save access/refresh tokens (admin test / recovery).
     *
     * @param string     $access_token  Access token.
     * @param string     $refresh_token Refresh token.
     * @param int|string $vendor_id     Optional vendor id.
     * @param int|null   $expires_in    Optional expiry.
     * @return bool
     */
    public static function saveManualTokens( $access_token, $refresh_token = '', $vendor_id = null, $expires_in = null )
    {
        $access_token = sanitize_text_field( (string) $access_token );
        if ( '' === $access_token ) {
            return false;
        }

        SettingsManager::updateSettings(
            array(
                SettingsConfig::TOKEN             => $access_token,
                SettingsConfig::REFRESH_TOKEN     => $refresh_token !== '' ? sanitize_text_field( (string) $refresh_token ) : null,
                SettingsConfig::VENDOR_ID         => null !== $vendor_id && '' !== (string) $vendor_id ? (string) absint( $vendor_id ) : null,
                SettingsConfig::IS_VENDOR         => true,
                SettingsConfig::EXPIRE_TOKEN_TIME => null !== $expires_in ? absint( $expires_in ) : null,
                SettingsConfig::HAMSALAM_TOKEN       => null,
                SettingsConfig::HAMSALAM_BUSINESS_ID => null,
            )
        );
        if ( function_exists( 'webinoBasalamSettings' ) ) {
            webinoBasalamSettings()->forget();
        }
        return true;
    }

    /**
     * @return array{redirect_uri:string,url_req_token:string}
     */
    public function getOAuthUrls()
    {
        $oauthData = $this->getOauthData();
        $started   = $this->startViaCrm( '' );

        if ( isset( $started['error'] ) ) {
            // Fallback: build SSO URL pointing at Webina redirect (CRM must still exchange code).
            return array(
                'redirect_uri'  => $oauthData['redirect_uri'],
                'url_req_token' => '',
                'error'         => $started['error'],
            );
        }

        return array(
            'redirect_uri'  => $started['redirect_uri'],
            'url_req_token' => $started['url'],
            'client_id'     => $started['client_id'],
        );
    }
}
