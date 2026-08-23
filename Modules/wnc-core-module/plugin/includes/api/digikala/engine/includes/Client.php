<?php
namespace WncDigikala;

defined('ABSPATH') || exit;

final class Client {
    private static $rate_limited_until = 0;

    /** @return array|\WP_Error */
    public static function http_json(string $method, string $url, $body = null, bool $auth = true, bool $retried = false) {
        if (self::$rate_limited_until > time()) {
            return new \WP_Error('dk_rate', __('Digikala rate limited.', 'webinaconnector'));
        }
        $headers = ['Content-Type' => 'application/json', 'Accept' => 'application/json'];
        if ($auth) {
            $token = Auth::access_token();
            if (is_wp_error($token)) {
                return $token;
            }
            $headers['Authorization'] = 'Bearer ' . $token;
        }
        $args = [
            'method' => strtoupper($method),
            'timeout' => 45,
            'headers' => $headers,
        ];
        if ($body !== null) {
            $args['body'] = is_string($body) ? $body : wp_json_encode($body);
        }
        $res = wp_remote_request($url, $args);
        if (is_wp_error($res)) {
            return $res;
        }
        $code = (int) wp_remote_retrieve_response_code($res);
        $raw = wp_remote_retrieve_body($res);
        $json = json_decode($raw, true);
        if ($code === 429) {
            self::$rate_limited_until = time() + 60;
            return new \WP_Error('dk_rate', __('Digikala rate limited.', 'webinaconnector'), ['status' => 429]);
        }
        if ($code === 401 && $auth && !$retried) {
            $ref = Auth::refresh();
            if (!is_wp_error($ref)) {
                return self::http_json($method, $url, $body, true, true);
            }
            return is_wp_error($ref) ? $ref : new \WP_Error('dk_auth', __('Unauthorized.', 'webinaconnector'), ['status' => 401]);
        }
        if ($code < 200 || $code >= 300) {
            $msg = is_array($json) ? (string) ($json['message'] ?? $json['error'] ?? $raw) : $raw;
            return new \WP_Error('dk_api', $msg ?: ('HTTP ' . $code), ['status' => $code, 'body' => $json]);
        }
        return is_array($json) ? $json : ['raw' => $raw];
    }

    /** @return array|\WP_Error */
    public static function request(string $method, string $path, $body = null, ?array $query = null) {
        $s = Settings::all();
        $url = trailingslashit((string) $s['base_url']) . ltrim($path, '/');
        if ($query) {
            $url = add_query_arg($query, $url);
        }
        return self::http_json($method, $url, $body, true);
    }
}
