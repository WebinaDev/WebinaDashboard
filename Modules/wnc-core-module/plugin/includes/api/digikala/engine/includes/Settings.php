<?php
namespace WncDigikala;

defined('ABSPATH') || exit;

final class Settings {
    const OPTION = 'wnc_digikala_engine_settings';

    public static function defaults(): array {
        return [
            'base_url' => 'https://seller.digikala.com',
            'client_code' => '',
            'private_key' => '',
            'public_key' => '',
            'encrypted_code' => '',
            'credit_increase_percentage' => 0,
            'auto_sync' => false,
            'webhook_secret' => '',
        ];
    }

    public static function all(): array {
        $raw = get_option(self::OPTION, []);
        if (!is_array($raw)) {
            $raw = [];
        }
        return wp_parse_args($raw, self::defaults());
    }

    public static function get(string $key, $default = null) {
        $all = self::all();
        return $all[$key] ?? $default;
    }

    public static function update(array $patch): array {
        $current = self::all();
        foreach (['private_key', 'public_key', 'encrypted_code', 'webhook_secret'] as $secret) {
            if (array_key_exists($secret, $patch) && ($patch[$secret] === '' || $patch[$secret] === null || $patch[$secret] === '***')) {
                unset($patch[$secret]);
            }
        }
        if (isset($patch['private_key'])) {
            $patch['private_key'] = Auth::normalize_private_key((string) $patch['private_key']);
        }
        if (isset($patch['public_key'])) {
            $patch['public_key'] = Auth::normalize_public_key((string) $patch['public_key']);
        }
        if (isset($patch['encrypted_code'])) {
            $patch['encrypted_code'] = preg_replace('/\s+/', '', (string) $patch['encrypted_code']);
        }
        $merged = array_merge($current, $patch);
        update_option(self::OPTION, $merged, false);
        return $merged;
    }

    public static function redact(array $s): array {
        $out = $s;
        $out['has_private_key'] = !empty($s['private_key']);
        $out['has_public_key'] = !empty($s['public_key']);
        $out['private_key'] = '';
        if (!empty($s['encrypted_code'])) {
            $out['encrypted_code'] = '***';
        }
        return $out;
    }
}
