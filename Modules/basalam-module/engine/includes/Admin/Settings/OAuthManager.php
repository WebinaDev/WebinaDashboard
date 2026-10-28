<?php

namespace WebinoBasalam\Admin\Settings;

use WebinoBasalam\Config\Endpoints;

defined('ABSPATH') || exit;

/**
 * Basalam OAuth via WebinoERP Edge proxy — no Hamsalam dependency.
 */
class OAuthManager
{
    /** Prefix for the per-user transient holding a pending OAuth authorization. */
    const OAUTH_STATE_TRANSIENT = 'webino_basalam_oauth_state_';

    /** Lifetime of a pending OAuth authorization — the SSO round-trip window. */
    const OAUTH_STATE_TTL = 600;

    /** Max age for ERP handoff signature timestamp (seconds). */
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
     * ERP Edge host (webina.dev by default).
     *
     * @return string
     */
    public static function crmBaseUrl()
    {
        $host = Endpoints::vendorBaseUrl();
        return untrailingslashit( apply_filters( 'webino_basalam_crm_oauth_base', $host ) );
    }

    /**
     * Static OAuth metadata (Webina-owned client; secret stays on ERP).
     *
     * @return array{client_id:string,redirect_uri:string}
     */
    public function getOauthData()
    {
        return array(
            'client_id'    => (string) apply_filters( 'webino_basalam_oauth_default_client_id', Endpoints::WEBINO_OAUTH_CLIENT_ID ),
            'redirect_uri' => (string) apply_filters( 'webino_basalam_oauth_default_redirect_uri', Endpoints::oauthRedirectUri() ),
        );
    }

    /**
     * Accept both the raw ERP Edge body and the generic `{success, data}` API envelope.
     *
     * @param mixed $decoded
     * @return array<string,mixed>
     */
    private static function unwrapErpPayload( $decoded )
    {
        if ( ! is_array( $decoded ) ) {
            return array();
        }
        if ( isset( $decoded['data'] ) && is_array( $decoded['data'] ) && ! isset( $decoded['url'] ) && ! isset( $decoded['access_token'] ) ) {
            $inner = $decoded['data'];
            if ( ! isset( $inner['message'] ) && isset( $decoded['message'] ) && is_string( $decoded['message'] ) ) {
                $inner['message'] = $decoded['message'];
            }
            return $inner;
        }
        return $decoded;
    }

    /**
     * Start OAuth via WebinoERP and return SSO URL.
     *
     * @param string $return_url Dashboard return after connect.
     * @return array{url:string,redirect_uri:string,client_id:string,state?:string}|array{error:string}
     */
    public function startViaCrm( $return_url = '' )
    {
        $oauthData = $this->getOauthData();
        $endpoint  = Endpoints::oauthStartUrl();
        $filtered  = apply_filters( 'webino_basalam_crm_oauth_base', self::crmBaseUrl() );
        if ( is_string( $filtered ) && '' !== $filtered && untrailingslashit( $filtered ) !== Endpoints::vendorBaseUrl() ) {
            $endpoint = untrailingslashit( $filtered ) . '/api/webinocrm/v1/basalam/oauth/start';
        }

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
        $data = self::unwrapErpPayload( json_decode( (string) wp_remote_retrieve_body( $response ), true ) );

        if ( $code < 200 || $code >= 300 || empty( $data['url'] ) ) {
            $message = isset( $data['message'] ) ? (string) $data['message'] : __( 'ERP OAuth start failed.', 'webino-dashboard' );
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
     * Refresh access token through WebinoERP (client_secret never leaves ERP).
     *
     * @return true|\WP_Error
     */
    public static function refreshAccessToken()
    {
        if ( get_option( self::NEEDS_RECONNECT_OPTION ) ) {
            return new \WP_Error( 'basalam_needs_reconnect', __( 'اتصال باسلام منقضی شده؛ لطفاً دوباره متصل شوید.', 'webino-dashboard' ) );
        }
        $refresh = (string) webinoBasalamSettings()->getSettings( SettingsConfig::REFRESH_TOKEN );
        if ( '' === $refresh ) {
            return new \WP_Error( 'basalam_no_refresh', __( 'Refresh token missing.', 'webino-dashboard' ) );
        }

        $endpoint = Endpoints::oauthRefreshUrl();
        $filtered = apply_filters( 'webino_basalam_crm_oauth_base', self::crmBaseUrl() );
        if ( is_string( $filtered ) && '' !== $filtered && untrailingslashit( $filtered ) !== Endpoints::vendorBaseUrl() ) {
            $endpoint = untrailingslashit( $filtered ) . '/api/webinocrm/v1/basalam/oauth/refresh';
        }
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
        $data = self::unwrapErpPayload( json_decode( (string) wp_remote_retrieve_body( $response ), true ) );
        if ( ! is_array( $data ) || $code < 200 || $code >= 300 || empty( $data['access_token'] ) ) {
            $message = is_array( $data ) && isset( $data['message'] ) ? (string) $data['message'] : __( 'Token refresh failed.', 'webino-dashboard' );
            if ( 400 === $code ) {
                // Contract: 400 = refresh token invalid/expired (or Basalam unreachable after ERP retries).
                // Clear the access token and stop auto-refreshing until the merchant reconnects.
                SettingsManager::updateSettings( array( SettingsConfig::TOKEN => null, SettingsConfig::EXPIRE_TOKEN_TIME => null ) );
                update_option( self::NEEDS_RECONNECT_OPTION, array( 'at' => time(), 'message' => $message ), false );
                if ( function_exists( 'webinoBasalamSettings' ) ) {
                    webinoBasalamSettings()->forget();
                }
            }
            return new \WP_Error( 'basalam_refresh_failed', $message, array( 'status' => $code ) );
        }

        SettingsManager::updateSettings(
            array(
                SettingsConfig::TOKEN             => sanitize_text_field( (string) $data['access_token'] ),
                // Always persist the returned refresh token (ERP echoes or rotates it).
                SettingsConfig::REFRESH_TOKEN     => sanitize_text_field( (string) ( ! empty( $data['refresh_token'] ) ? $data['refresh_token'] : $refresh ) ),
                SettingsConfig::EXPIRE_TOKEN_TIME => self::absoluteExpiry(
                    isset( $data['expires_at'] ) ? absint( $data['expires_at'] ) : 0,
                    isset( $data['expires_in'] ) ? absint( $data['expires_in'] ) : null
                ),
            )
        );
        delete_option( self::NEEDS_RECONNECT_OPTION );
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

        // v2 handoff (contract §1): authenticated with the Site-Auth secret. Required once enrolled.
        $v2 = self::verifyHandoffV2(wp_unslash($_GET), $accessToken, $refreshToken, $vendorId); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if (true !== $v2) {
            wp_die(
                esc_html($v2),
                esc_html__( 'خطای امنیتی', 'webino-dashboard' ),
                array( 'response' => 403 )
            );
        }
        $expiresAtParam = isset( $_GET['expires_at'] ) ? absint( $_GET['expires_at'] ) : 0;

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
            SettingsConfig::EXPIRE_TOKEN_TIME => self::absoluteExpiry($expiresAtParam, $expiresIn),
            // Clear legacy Hamsalam fields.
            SettingsConfig::HAMSALAM_TOKEN       => null,
            SettingsConfig::HAMSALAM_BUSINESS_ID => null,
        );

        $data = array_merge( $data, $extraData );
        SettingsManager::updateSettings( $data );
        delete_option( self::NEEDS_RECONNECT_OPTION );

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

    /** Option set when refresh returned 400; cleared on successful (re)connect. */
    const NEEDS_RECONNECT_OPTION = 'webino_basalam_needs_reconnect';

    /** Refresh this many seconds before expiry (contract: now >= expires_at - 300). */
    const REFRESH_SKEW = 300;

    /**
     * Absolute unix expiry from expires_at (preferred) or expires_in.
     *
     * @param int      $expiresAt Absolute unix time or 0.
     * @param int|null $expiresIn Seconds.
     * @return int|null
     */
    public static function absoluteExpiry( $expiresAt, $expiresIn )
    {
        $expiresAt = (int) $expiresAt;
        if ( $expiresAt > 1000000000 ) {
            return $expiresAt;
        }
        if ( null !== $expiresIn && (int) $expiresIn > 0 ) {
            return time() + (int) $expiresIn;
        }
        return null;
    }

    /**
     * Cron hook: refresh when within REFRESH_SKEW of expiry. Never loops after a 400.
     */
    public static function maybeProactiveRefresh()
    {
        if ( ! function_exists( 'webinoBasalamSettings' ) || get_option( self::NEEDS_RECONNECT_OPTION ) ) {
            return;
        }
        $settings = webinoBasalamSettings();
        if ( '' === (string) $settings->getSettings( SettingsConfig::REFRESH_TOKEN ) ) {
            return;
        }
        $exp = (int) $settings->getSettings( SettingsConfig::EXPIRE_TOKEN_TIME );
        // Legacy rows stored expires_in (small number) — treat as unknown.
        if ( $exp < 1000000000 || time() < $exp - self::REFRESH_SKEW ) {
            return;
        }
        if ( get_transient( 'webino_basalam_proactive_refresh_lock' ) ) {
            return;
        }
        set_transient( 'webino_basalam_proactive_refresh_lock', 1, 120 );
        $res = self::refreshAccessToken();
        if ( is_wp_error( $res ) && class_exists( '\\WebinoBasalam\\Logger\\Logger' ) ) {
            \WebinoBasalam\Logger\Logger::error( 'تمدید خودکار توکن باسلام ناموفق بود: ' . $res->get_error_message() );
        }
    }

    /**
     * Verify the v2 handoff signature (contract §1 Handoff).
     *
     * @return true|string True or error message.
     */
    /**
     * Strict mode: reject unsigned handoffs even before Site-Auth enrollment. Default off.
     * Enable via constant WEBINO_BASALAM_REQUIRE_SIGNED, option webino_basalam_require_signed,
     * or filter webino_basalam_require_signed_handoff.
     */
    public static function requireSignedHandoff()
    {
        $on = ( defined( 'WEBINO_BASALAM_REQUIRE_SIGNED' ) && WEBINO_BASALAM_REQUIRE_SIGNED )
            || (bool) get_option( 'webino_basalam_require_signed', false );
        return (bool) apply_filters( 'webino_basalam_require_signed_handoff', $on );
    }

    public static function verifyHandoffV2( $query, $accessToken, $refreshToken, $vendorId )
    {
        $query = is_array( $query ) ? $query : array();
        $secret   = class_exists( 'Webino_Dashboard_Site_Auth', false ) ? \Webino_Dashboard_Site_Auth::secret() : (string) get_option( 'webino_dashboard_site_auth_secret', '' );
        $enrolled = '' !== $secret;
        $sig2 = isset( $query['webino_sig2'] ) ? sanitize_text_field( (string) $query['webino_sig2'] ) : '';
        if ( '' === $sig2 ) {
            // Contract: reject when enrolled and sig2 missing. Unenrolled sites cannot verify v2 (grace mode).
            return ( $enrolled || self::requireSignedHandoff() ) ? __( 'امضای بازگشت (v2) ارسال نشده است.', 'webino-dashboard' ) : true;
        }
        if ( ! $enrolled ) {
            return __( 'کلید امنیتی سایت ثبت نشده؛ امکان بررسی امضا نیست.', 'webino-dashboard' );
        }
        $ts    = isset( $query['webino_ts'] ) ? absint( $query['webino_ts'] ) : 0;
        $nonce = isset( $query['webino_nonce'] ) ? sanitize_text_field( (string) $query['webino_nonce'] ) : '';
        $rawIn = isset( $query['expires_in'] ) ? sanitize_text_field( (string) $query['expires_in'] ) : '';
        if ( $ts < 1 || abs( time() - $ts ) > 300 ) {
            return __( 'امضای بازگشت منقضی شده است.', 'webino-dashboard' );
        }
        if ( ! preg_match( '/^[A-Za-z0-9_-]{16,128}$/', $nonce ) ) {
            return __( 'nonce بازگشت نامعتبر است.', 'webino-dashboard' );
        }
        $nonceKey = 'webino_bslm_hn_' . md5( $nonce );
        if ( get_transient( $nonceKey ) ) {
            return __( 'این لینک بازگشت قبلاً استفاده شده است.', 'webino-dashboard' );
        }
        $domain = class_exists( 'Webino_Dashboard_Site_Auth', false ) ? \Webino_Dashboard_Site_Auth::site_domain() : '';
        $canon  = "v2\nbasalam-handoff\n" . $domain . "\n" . (string) $vendorId . "\n" . $ts . "\n" . $nonce . "\n" . $rawIn . "\n"
            . hash( 'sha256', (string) $accessToken . '|' . (string) $refreshToken );
        if ( ! hash_equals( hash_hmac( 'sha256', $canon, $secret ), strtolower( $sig2 ) ) ) {
            return __( 'امضای بازگشت نامعتبر است.', 'webino-dashboard' );
        }
        set_transient( $nonceKey, 1, 600 );
        return true;
    }
}
