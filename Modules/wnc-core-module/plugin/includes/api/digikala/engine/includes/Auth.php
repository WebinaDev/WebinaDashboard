<?php
namespace WncDigikala;

defined('ABSPATH') || exit;

/**
 * Digikala RSA-4096 auth + token issue/refresh.
 */
final class Auth {
    const TOKEN_OPTION = 'wnc_digikala_tokens';

    public static function tokens(): array {
        $t = get_option(self::TOKEN_OPTION, []);
        return is_array($t) ? $t : [];
    }

    public static function parse_expiry($value): int {
        if (is_numeric($value)) {
            $n = (int) $value;
            if ($n > 20000000000) {
                $n = (int) floor($n / 1000);
            }
            return $n > 0 ? $n : 0;
        }
        if (is_array($value)) {
            $date = (string) ($value['date'] ?? $value['datetime'] ?? '');
            $tz = (string) ($value['timezone'] ?? 'Asia/Tehran');
            if ($date === '') {
                return 0;
            }
            try {
                $dt = new \DateTimeImmutable($date, new \DateTimeZone($tz ?: 'Asia/Tehran'));
                return $dt->getTimestamp();
            } catch (\Exception $e) {
                $ts = strtotime($date);
                return $ts ? (int) $ts : 0;
            }
        }
        if (is_string($value) && trim($value) !== '') {
            try {
                $dt = new \DateTimeImmutable(trim($value), new \DateTimeZone('Asia/Tehran'));
                return $dt->getTimestamp();
            } catch (\Exception $e) {
                $ts = strtotime($value);
                return $ts ? (int) $ts : 0;
            }
        }
        return 0;
    }

    public static function persist_tokens(array $data): void {
        $current = self::tokens();
        $now = time();
        $expires = 0;
        if (isset($data['expires_in'])) {
            $expires = $now + (int) $data['expires_in'];
        } elseif (!empty($data['access_token_expires_at'])) {
            $expires = self::parse_expiry($data['access_token_expires_at']);
        } elseif (!empty($data['access_expires_at'])) {
            $expires = self::parse_expiry($data['access_expires_at']);
        }
        if ($expires <= $now) {
            $expires = $now + HOUR_IN_SECONDS;
        }
        $refresh_expires = 0;
        if (isset($data['refresh_expires_in'])) {
            $refresh_expires = $now + (int) $data['refresh_expires_in'];
        } elseif (!empty($data['refresh_token_expires_at'])) {
            $refresh_expires = self::parse_expiry($data['refresh_token_expires_at']);
        } elseif (!empty($data['refresh_expires_at'])) {
            $refresh_expires = self::parse_expiry($data['refresh_expires_at']);
        } elseif (!empty($current['refresh_expires_at']) && (int) $current['refresh_expires_at'] > $now) {
            $refresh_expires = (int) $current['refresh_expires_at'];
        }
        if ($refresh_expires <= $now) {
            $refresh_expires = $now + (6 * MONTH_IN_SECONDS);
        }
        $access = (string) ($data['access_token'] ?? $current['access_token'] ?? '');
        $refresh = (string) ($data['refresh_token'] ?? $current['refresh_token'] ?? '');
        update_option(self::TOKEN_OPTION, [
            'access_token' => $access,
            'refresh_token' => $refresh,
            'access_expires_at' => $expires,
            'refresh_expires_at' => $refresh_expires,
            'scopes' => $data['scopes'] ?? ($current['scopes'] ?? null),
        ], false);
    }

    public static function normalize_private_key(string $raw): string {
        $key = str_replace(["\r\n", "\r"], "\n", $raw);
        $key = trim(str_replace("\0", '', $key));
        if ($key === '') {
            return '';
        }
        if (strpos($key, 'BEGIN') !== false && strpos($key, 'PRIVATE KEY') !== false) {
            return $key;
        }
        $body = preg_replace('/\s+/', '', $key);
        $body = chunk_split($body, 64, "\n");
        return "-----BEGIN PRIVATE KEY-----\n" . trim($body) . "\n-----END PRIVATE KEY-----";
    }

    public static function normalize_public_key(string $raw): string {
        $key = str_replace(["\r\n", "\r"], "\n", $raw);
        $key = trim(str_replace("\0", '', $key));
        if ($key === '') {
            return '';
        }
        if (strpos($key, 'BEGIN') !== false && strpos($key, 'PUBLIC KEY') !== false) {
            return $key;
        }
        $body = preg_replace('/\s+/', '', $key);
        $body = chunk_split($body, 64, "\n");
        return "-----BEGIN PUBLIC KEY-----\n" . trim($body) . "\n-----END PUBLIC KEY-----";
    }

    /** @return array{public_key:string}|\WP_Error */
    public static function generate_rsa_keypair() {
        if (!function_exists('openssl_pkey_new')) {
            return new \WP_Error(
                'dk_auth',
                __('OpenSSL is not available.', 'webinaconnector'),
                ['status' => 503]
            );
        }
        if (function_exists('set_time_limit')) {
            @set_time_limit(120);
        }
        $res = openssl_pkey_new([
            'private_key_bits' => 4096,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);
        if ($res === false) {
            $detail = function_exists('openssl_error_string') ? (string) openssl_error_string() : '';
            return new \WP_Error(
                'dk_auth',
                __('RSA-4096 key generation failed.', 'webinaconnector') . ($detail ? ' (' . $detail . ')' : ''),
                ['status' => 500]
            );
        }
        $private = '';
        if (!openssl_pkey_export($res, $private) || $private === '') {
            $detail = function_exists('openssl_error_string') ? (string) openssl_error_string() : '';
            return new \WP_Error(
                'dk_auth',
                __('Private key export failed.', 'webinaconnector') . ($detail ? ' (' . $detail . ')' : ''),
                ['status' => 500]
            );
        }
        $details = openssl_pkey_get_details($res);
        $public = is_array($details) ? (string) ($details['key'] ?? '') : '';
        if ($public === '') {
            return new \WP_Error(
                'dk_auth',
                __('Public key export failed.', 'webinaconnector'),
                ['status' => 500]
            );
        }
        Settings::update([
            'private_key' => $private,
            'public_key' => $public,
        ]);
        // Never return private key to callers that expose JSON.
        return ['public_key' => $public];
    }

    private static function decode_ciphertext(string $encoded) {
        $encoded = preg_replace('/\s+/', '', trim($encoded));
        if ($encoded === '') {
            return false;
        }
        $bin = base64_decode($encoded, true);
        if ($bin !== false && $bin !== '') {
            return $bin;
        }
        $safe = strtr($encoded, '-_', '+/');
        $pad = strlen($safe) % 4;
        if ($pad) {
            $safe .= str_repeat('=', 4 - $pad);
        }
        $bin = base64_decode($safe, true);
        if ($bin !== false && $bin !== '') {
            return $bin;
        }
        $bin = base64_decode($encoded, false);
        return ($bin !== false && $bin !== '') ? $bin : false;
    }

    /** @return string|\WP_Error */
    public static function decrypt_authorization_code(string $encrypted_code, string $private_key) {
        $encrypted_code = trim($encrypted_code);
        $private_key = self::normalize_private_key($private_key);
        if ($encrypted_code === '') {
            return new \WP_Error('dk_auth', __('Encrypted Digikala code is required.', 'webinaconnector'));
        }
        if ($private_key === '') {
            return new \WP_Error('dk_auth', __('RSA private key is required.', 'webinaconnector'));
        }
        if (!function_exists('openssl_private_decrypt')) {
            return new \WP_Error('dk_auth', __('OpenSSL is not available.', 'webinaconnector'));
        }
        $bin = self::decode_ciphertext($encrypted_code);
        if ($bin === false) {
            return new \WP_Error('dk_auth', __('Encrypted code is not valid Base64.', 'webinaconnector'));
        }
        $key = openssl_pkey_get_private($private_key);
        if ($key === false) {
            $alt = preg_replace('/BEGIN PRIVATE KEY/', 'BEGIN RSA PRIVATE KEY', $private_key);
            $alt = preg_replace('/END PRIVATE KEY/', 'END RSA PRIVATE KEY', $alt);
            $key = openssl_pkey_get_private($alt);
        }
        if ($key === false) {
            return new \WP_Error('dk_auth', __('Invalid RSA private key PEM.', 'webinaconnector'));
        }
        $plain = '';
        $ok = false;
        $paddings = [OPENSSL_PKCS1_PADDING];
        if (defined('OPENSSL_PKCS1_OAEP_PADDING')) {
            $paddings[] = OPENSSL_PKCS1_OAEP_PADDING;
        }
        foreach ($paddings as $padding) {
            $try = '';
            if (openssl_private_decrypt($bin, $try, $key, $padding) && (string) $try !== '') {
                $plain = $try;
                $ok = true;
                break;
            }
        }
        if (!$ok && function_exists('openssl_pkey_decrypt') && defined('OPENSSL_PKCS1_OAEP_PADDING')) {
            foreach (['sha256', 'sha1'] as $digest) {
                $try = '';
                if (@openssl_pkey_decrypt($bin, $try, $key, OPENSSL_PKCS1_OAEP_PADDING, $digest) && (string) $try !== '') {
                    $plain = $try;
                    $ok = true;
                    break;
                }
            }
        }
        if (!$ok || (string) $plain === '') {
            return new \WP_Error('dk_auth', __('RSA decrypt failed. Private key must match the public key registered with Digikala.', 'webinaconnector'));
        }
        return trim((string) $plain);
    }

    public static function clear_encrypted_code(): void {
        Settings::update(['encrypted_code' => '']);
        // Force clear even if update skips empty — write directly.
        $all = Settings::all();
        $all['encrypted_code'] = '';
        update_option(Settings::OPTION, $all, false);
    }

    /** @return true|\WP_Error */
    public static function issue_from_encrypted_code(?string $encrypted_code = null) {
        $s = Settings::all();
        $code_in = $encrypted_code !== null && $encrypted_code !== '' ? $encrypted_code : (string) ($s['encrypted_code'] ?? '');
        if ($encrypted_code !== null && $encrypted_code !== '') {
            Settings::update(['encrypted_code' => $code_in]);
            $s = Settings::all();
        }
        $plain = self::decrypt_authorization_code($code_in, (string) ($s['private_key'] ?? ''));
        if (is_wp_error($plain)) {
            return $plain;
        }
        $url = trailingslashit((string) $s['base_url']) . Endpoints::AUTH_TOKEN;
        $res = Client::http_json('POST', $url, ['authorization_code' => $plain], false);
        if (is_wp_error($res)) {
            return $res;
        }
        $data = isset($res['data']) && is_array($res['data']) ? $res['data'] : $res;
        if (empty($data['access_token'])) {
            return new \WP_Error('dk_auth', __('Digikala token was not returned.', 'webinaconnector'));
        }
        self::persist_tokens($data);
        self::clear_encrypted_code();
        // Also persist into SQL connections table when Storage exists.
        if (class_exists(__NAMESPACE__ . '\\Storage')) {
            Storage::persist_connection_tokens($data, $s);
        }
        return true;
    }

    /** @return true|\WP_Error */
    public static function refresh() {
        $s = Settings::all();
        $t = self::tokens();
        $now = time();
        if (empty($t['refresh_token'])) {
            return new \WP_Error('dk_auth', __('Digikala refresh token missing. Re-issue via encrypted code.', 'webinaconnector'));
        }
        if (!empty($t['refresh_expires_at']) && (int) $t['refresh_expires_at'] <= $now) {
            return new \WP_Error('dk_auth', __('Digikala refresh token expired.', 'webinaconnector'));
        }
        if (empty($t['access_token'])) {
            return new \WP_Error('dk_auth', __('Digikala access token missing for refresh.', 'webinaconnector'));
        }
        $url = trailingslashit((string) $s['base_url']) . Endpoints::AUTH_REFRESH;
        $res = Client::http_json('POST', $url, [
            'access_token' => $t['access_token'],
            'refresh_token' => $t['refresh_token'],
        ], false);
        if (is_wp_error($res)) {
            return $res;
        }
        $data = isset($res['data']) && is_array($res['data']) ? $res['data'] : $res;
        if (empty($data['access_token'])) {
            return new \WP_Error('dk_auth', __('Digikala refresh failed.', 'webinaconnector'));
        }
        self::persist_tokens($data);
        if (class_exists(__NAMESPACE__ . '\\Storage')) {
            Storage::persist_connection_tokens($data, $s);
        }
        return true;
    }

    /** @return string|\WP_Error */
    public static function access_token() {
        $t = self::tokens();
        $now = time();
        if (!empty($t['access_token']) && !empty($t['access_expires_at']) && (int) $t['access_expires_at'] > $now + 60) {
            return (string) $t['access_token'];
        }
        if (!empty($t['access_token']) && empty($t['access_expires_at']) && empty($t['refresh_token'])) {
            return (string) $t['access_token'];
        }
        $ref = self::refresh();
        if (is_wp_error($ref)) {
            return $ref;
        }
        $t = self::tokens();
        if (empty($t['access_token'])) {
            return new \WP_Error('dk_auth', __('Digikala access token missing.', 'webinaconnector'));
        }
        return (string) $t['access_token'];
    }

    public static function is_connected(): bool {
        $t = self::tokens();
        return !empty($t['access_token']) || !empty($t['refresh_token']);
    }
}
