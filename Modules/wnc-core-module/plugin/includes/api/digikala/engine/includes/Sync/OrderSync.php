<?php
namespace WncDigikala\Sync;

use WncDigikala\Client;
use WncDigikala\Endpoints;
use WncDigikala\Storage;

defined('ABSPATH') || exit;

final class OrderSync {
    public static function pull(array $payload = [], int $job_id = 0): bool {
        if (!function_exists('wc_create_order')) {
            return false;
        }
        $page = 1;
        $max = (int) ($payload['max_pages'] ?? 5);
        $created = 0;
        global $wpdb;
        $map = Storage::table('order_map');
        while ($page <= $max) {
            $res = Client::request('GET', Endpoints::ORDERS, null, ['page' => $page, 'size' => 50]);
            if (is_wp_error($res)) {
                Storage::log('error', 'orders', 'pull failed', ['error' => $res->get_error_message(), 'job_id' => $job_id]);
                return $created > 0;
            }
            $items = (array) ($res['data']['items'] ?? $res['data'] ?? []);
            if (!$items) break;
            foreach ($items as $item) {
                if (!is_array($item)) continue;
                $dk_id = (string) ($item['id'] ?? $item['order_id'] ?? '');
                if ($dk_id === '') continue;
                $exists = (int) $wpdb->get_var($wpdb->prepare("SELECT wc_order_id FROM {$map} WHERE dk_order_id=%s LIMIT 1", $dk_id));
                if ($exists > 0) continue;
                $order = wc_create_order();
                if (is_wp_error($order)) continue;
                $order->set_created_via('digikala');
                $order->update_meta_data('_wnc_platform', 'digikala');
                $order->update_meta_data('_digikala_order_id', $dk_id);
                $order->add_order_note('Imported from Digikala #' . $dk_id);
                // Line items when variant known.
                $lines = (array) ($item['order_items'] ?? $item['items'] ?? $item['variants'] ?? []);
                foreach ($lines as $line) {
                    if (!is_array($line)) continue;
                    $vid = (string) ($line['variant_id'] ?? $line['product_variant_id'] ?? '');
                    $qty = max(1, (int) ($line['quantity'] ?? $line['count'] ?? 1));
                    $price = (float) ($line['selling_price'] ?? $line['price'] ?? 0);
                    if ($price > 1000) {
                        $price = $price / 10; // rial→toman heuristic
                    }
                    $wc_pid = 0;
                    if ($vid !== '') {
                        $wc_pid = (int) $wpdb->get_var($wpdb->prepare(
                            "SELECT wc_product_id FROM " . Storage::table('product_map') . " WHERE dk_variant_id=%s LIMIT 1",
                            $vid
                        ));
                    }
                    if ($wc_pid > 0) {
                        $p = wc_get_product($wc_pid);
                        if ($p) {
                            $order->add_product($p, $qty, ['subtotal' => $price * $qty, 'total' => $price * $qty]);
                        }
                    }
                }
                $order->calculate_totals(false);
                $order->update_status('processing', 'Digikala import', true);
                $wpdb->replace($map, [
                    'wc_order_id' => $order->get_id(),
                    'dk_order_id' => $dk_id,
                    'last_sync_at' => gmdate('Y-m-d H:i:s'),
                ]);
                $created++;
            }
            $page++;
        }
        Storage::log('info', 'orders', 'pull done', ['created' => $created, 'job_id' => $job_id]);
        return true;
    }

    public static function push_status(array $payload = [], int $job_id = 0): bool {
        $wc_id = (int) ($payload['order_id'] ?? 0);
        $status = sanitize_text_field((string) ($payload['status'] ?? ''));
        if ($wc_id <= 0) return false;
        global $wpdb;
        $dk_id = (string) $wpdb->get_var($wpdb->prepare(
            "SELECT dk_order_id FROM " . Storage::table('order_map') . " WHERE wc_order_id=%d LIMIT 1",
            $wc_id
        ));
        if ($dk_id === '') {
            $order = wc_get_order($wc_id);
            $dk_id = $order ? (string) $order->get_meta('_digikala_order_id') : '';
        }
        if ($dk_id === '') return false;
        $res = Client::request('POST', Endpoints::ORDERS_STATUS, [
            'order_id' => $dk_id,
            'status' => $status,
        ]);
        if (is_wp_error($res)) {
            Storage::log('error', 'orders', 'status push failed', ['error' => $res->get_error_message(), 'job_id' => $job_id]);
            return false;
        }
        return true;
    }
}
