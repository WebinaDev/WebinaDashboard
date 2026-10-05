<?php
namespace WebinoDigikala\Sync;

use WebinoDigikala\Client;
use WebinoDigikala\Endpoints;
use WebinoDigikala\Storage;

defined('ABSPATH') || exit;

final class OrderSync {
    /** @var bool */
    private static $importing = false;

    public static function is_importing(): bool {
        return self::$importing;
    }

    public static function pull(array $payload = [], int $job_id = 0): bool {
        if (!function_exists('wc_create_order')) {
            return false;
        }
        self::$importing = true;
        $max = max(1, (int) ($payload['max_pages'] ?? 8));
        $created = 0;
        $updated = 0;
        try {
            $groups = [];
            self::collect_active_items($groups, $max);
            self::collect_history_items($groups, $max);
            self::collect_sbs_items($groups, $max);
            foreach ($groups as $dk_order_id => $bundle) {
                $result = self::upsert_wc_order((string) $dk_order_id, $bundle);
                if ($result === 'created') {
                    $created++;
                } elseif ($result === 'updated') {
                    $updated++;
                }
            }
        } finally {
            self::$importing = false;
        }
        Storage::log('info', 'orders', 'pull done', [
            'created' => $created,
            'updated' => $updated,
            'job_id' => $job_id,
        ]);
        return true;
    }

    /**
     * @param array<string,array{items:array,fulfillment:string,native_status:string,shipment_id:string,sbs:array}> $groups
     */
    private static function collect_active_items(array &$groups, int $max): void {
        $page = 1;
        while ($page <= $max) {
            $res = Client::request('GET', Endpoints::ORDERS, null, ['page' => $page, 'size' => 50]);
            if (is_wp_error($res)) {
                Storage::log('error', 'orders', 'active pull failed', ['error' => $res->get_error_message()]);
                return;
            }
            $items = (array) ($res['data']['items'] ?? []);
            if (!$items) {
                break;
            }
            foreach ($items as $item) {
                if (!is_array($item)) {
                    continue;
                }
                $dk_id = self::item_order_id($item);
                if ($dk_id === '') {
                    continue;
                }
                if (!isset($groups[$dk_id])) {
                    $groups[$dk_id] = self::empty_bundle('digikala', 'active');
                }
                $groups[$dk_id]['items'][] = $item;
                if (!empty($item['warehouse_status_at'])) {
                    $groups[$dk_id]['native_status'] = 'warehouse';
                }
            }
            $page++;
        }
    }

    /**
     * @param array<string,mixed> $groups
     */
    private static function collect_history_items(array &$groups, int $max): void {
        foreach (['processed', 'returned', 'canceled'] as $type) {
            $page = 1;
            while ($page <= $max) {
                $res = Client::request('GET', Endpoints::ORDERS_HISTORY, null, [
                    'page' => $page,
                    'size' => 50,
                    'order_type' => $type,
                ]);
                if (is_wp_error($res)) {
                    break;
                }
                $items = (array) ($res['data']['items'] ?? []);
                if (!$items) {
                    break;
                }
                foreach ($items as $item) {
                    if (!is_array($item)) {
                        continue;
                    }
                    $dk_id = self::item_order_id($item);
                    if ($dk_id === '') {
                        continue;
                    }
                    if (!isset($groups[$dk_id])) {
                        $groups[$dk_id] = self::empty_bundle('digikala', $type);
                    }
                    $groups[$dk_id]['items'][] = $item;
                    $groups[$dk_id]['native_status'] = $type;
                }
                $page++;
            }
        }
    }

    /**
     * @param array<string,mixed> $groups
     */
    private static function collect_sbs_items(array &$groups, int $max): void {
        $page = 1;
        while ($page <= $max) {
            $res = Client::request('GET', Endpoints::SBS_ORDERS, null, ['page' => $page, 'size' => 50]);
            if (is_wp_error($res)) {
                return;
            }
            $items = (array) ($res['data']['items'] ?? $res['data'] ?? []);
            if (!$items || !is_array($items)) {
                break;
            }
            $count = 0;
            foreach ($items as $ship) {
                if (!is_array($ship)) {
                    continue;
                }
                $count++;
                $shipment_id = (string) ($ship['id'] ?? $ship['order_shipment_id'] ?? $ship['shipment_id'] ?? '');
                $status = sanitize_key((string) ($ship['status'] ?? $ship['shipment_status'] ?? 'processing'));
                $lines = (array) ($ship['order_items'] ?? $ship['items'] ?? $ship['variants'] ?? []);
                $dk_id = (string) ($ship['order_id'] ?? '');
                if ($dk_id === '' && $lines) {
                    $first = reset($lines);
                    if (is_array($first)) {
                        $dk_id = self::item_order_id($first);
                    }
                }
                if ($dk_id === '') {
                    $dk_id = $shipment_id !== '' ? 'sbs-' . $shipment_id : '';
                }
                if ($dk_id === '') {
                    continue;
                }
                if (!isset($groups[$dk_id])) {
                    $groups[$dk_id] = self::empty_bundle('seller', $status ?: 'processing');
                }
                $groups[$dk_id]['fulfillment'] = 'seller';
                $groups[$dk_id]['shipment_id'] = $shipment_id;
                $groups[$dk_id]['native_status'] = $status ?: $groups[$dk_id]['native_status'];
                $groups[$dk_id]['sbs'] = $ship;
                foreach ($lines as $line) {
                    if (is_array($line)) {
                        $groups[$dk_id]['items'][] = $line;
                    }
                }
                if (!$lines) {
                    $groups[$dk_id]['items'][] = $ship;
                }
            }
            if ($count < 1) {
                break;
            }
            $page++;
        }
    }

    /**
     * @return array{items:array,fulfillment:string,native_status:string,shipment_id:string,sbs:array}
     */
    private static function empty_bundle(string $fulfillment, string $status): array {
        return [
            'items' => [],
            'fulfillment' => $fulfillment,
            'native_status' => $status,
            'shipment_id' => '',
            'sbs' => [],
        ];
    }

    private static function item_order_id(array $item): string {
        foreach (['order_id', 'id', 'orderItemId', 'order_item_id'] as $key) {
            if (!empty($item[$key])) {
                // Prefer real order_id when both exist.
                if ($key === 'order_id') {
                    return (string) $item[$key];
                }
            }
        }
        if (!empty($item['order_id'])) {
            return (string) $item['order_id'];
        }
        return (string) ($item['id'] ?? '');
    }

    /**
     * @param array{items:array,fulfillment:string,native_status:string,shipment_id:string,sbs:array} $bundle
     */
    private static function upsert_wc_order(string $dk_id, array $bundle): string {
        global $wpdb;
        $map = Storage::table('order_map');
        $wc_id = (int) $wpdb->get_var($wpdb->prepare("SELECT wc_order_id FROM {$map} WHERE dk_order_id=%s LIMIT 1", $dk_id));
        $created = false;
        if ($wc_id > 0) {
            $order = wc_get_order($wc_id);
        } else {
            $order = wc_create_order();
            $created = true;
        }
        if (!$order || is_wp_error($order)) {
            return '';
        }

        $native = sanitize_key((string) ($bundle['native_status'] ?? 'active'));
        $fulfillment = sanitize_key((string) ($bundle['fulfillment'] ?? 'digikala'));
        $shipment_id = (string) ($bundle['shipment_id'] ?? '');
        $woo_status = self::woo_status_from_native($native);

        $order->set_created_via('digikala');
        $order->update_meta_data('_wnc_platform', 'digikala');
        $order->update_meta_data('_digikala_order_id', $dk_id);
        $order->update_meta_data('_wnc_remote_order_id', $dk_id);
        $order->update_meta_data('_wnc_remote_status', $native);
        $order->update_meta_data('_digikala_native_status', $native);
        $order->update_meta_data('_digikala_fulfillment', $fulfillment);
        if ($shipment_id !== '') {
            $order->update_meta_data('_digikala_shipment_id', $shipment_id);
        }
        $order->update_meta_data('_digikala_order_items', wp_json_encode($bundle['items']));
        if (!empty($bundle['sbs'])) {
            $order->update_meta_data('_digikala_sbs', wp_json_encode($bundle['sbs']));
        }

        $existing_count = count($order->get_items());
        if ($existing_count === 0) {
            self::add_line_items($order, $bundle['items']);
        }

        $order->calculate_totals(false);
        $current = $order->get_status();
        if ($current !== $woo_status) {
            $order->set_status($woo_status, 'Digikala sync: ' . $native, true);
        }
        $order->save();

        if (class_exists('WNC_Order_Sync') && method_exists('WNC_Order_Sync', 'ensure_platform_taxonomy')) {
            WNC_Order_Sync::ensure_platform_taxonomy();
            $term = term_exists('digikala', 'wnc_order_platform');
            if (!$term) {
                $term = wp_insert_term('Digikala', 'wnc_order_platform', ['slug' => 'digikala']);
            }
            if (!is_wp_error($term)) {
                $tid = is_array($term) ? (int) ($term['term_id'] ?? 0) : (int) $term;
                if ($tid > 0) {
                    wp_set_object_terms($order->get_id(), [$tid], 'wnc_order_platform', false);
                }
            }
        }

        $wpdb->replace($map, [
            'wc_order_id' => $order->get_id(),
            'dk_order_id' => $dk_id,
            'last_sync_at' => gmdate('Y-m-d H:i:s'),
        ]);

        return $created ? 'created' : 'updated';
    }

    private static function add_line_items(\WC_Order $order, array $items): void {
        global $wpdb;
        foreach ($items as $line) {
            if (!is_array($line)) {
                continue;
            }
            $vid = (string) ($line['product_variant_id'] ?? $line['variant_id'] ?? $line['id'] ?? '');
            $qty = max(1, (int) ($line['quantity'] ?? $line['count'] ?? 1));
            $price = (float) ($line['selling_price'] ?? $line['price'] ?? $line['total_price'] ?? 0);
            if (class_exists('WNC_Pricing') && $price > 0) {
                $price = (float) \WNC_Pricing::from_remote_unit($price, 'digikala');
            } elseif ($price > 1000) {
                $price = $price / 10;
            }
            $wc_pid = 0;
            $wc_vid = 0;
            if ($vid !== '') {
                $row = $wpdb->get_row($wpdb->prepare(
                    'SELECT wc_product_id, wc_variation_id FROM ' . Storage::table('product_map') . ' WHERE dk_variant_id=%s LIMIT 1',
                    $vid
                ), ARRAY_A);
                if ($row) {
                    $wc_pid = (int) ($row['wc_product_id'] ?? 0);
                    $wc_vid = (int) ($row['wc_variation_id'] ?? 0);
                }
                if ($wc_pid <= 0 && class_exists('WNC_Mapper')) {
                    $map = \WNC_Mapper::find_by_remote('digikala', '', $vid);
                    if (is_array($map)) {
                        $wc_pid = (int) ($map['wc_product_id'] ?? 0);
                        $wc_vid = (int) ($map['wc_variation_id'] ?? 0);
                    }
                }
            }
            $product = $wc_vid > 0 ? wc_get_product($wc_vid) : ($wc_pid > 0 ? wc_get_product($wc_pid) : null);
            if ($product) {
                $order->add_product($product, $qty, [
                    'subtotal' => $price * $qty,
                    'total' => $price * $qty,
                ]);
            } else {
                $title = (string) ($line['product_variant_title'] ?? $line['title'] ?? ('DK variant ' . $vid));
                $item = new \WC_Order_Item_Product();
                $item->set_name($title);
                $item->set_quantity($qty);
                $item->set_subtotal($price * $qty);
                $item->set_total($price * $qty);
                if ($vid !== '') {
                    $item->add_meta_data('_digikala_variant_id', $vid, true);
                }
                $order->add_item($item);
            }
        }
    }

    public static function woo_status_from_native(string $native): string {
        $n = strtolower($native);
        if (strpos($n, 'cancel') !== false) {
            return 'cancelled';
        }
        if (strpos($n, 'return') !== false) {
            return 'refunded';
        }
        if (in_array($n, ['processed', 'completed', 'delivered', 'full_delivered_to_customer', 'full_delivered'], true)) {
            return 'completed';
        }
        return 'processing';
    }

    public static function push_status(array $payload = [], int $job_id = 0): bool {
        $wc_id = (int) ($payload['order_id'] ?? 0);
        if ($wc_id <= 0) {
            return false;
        }
        $order = wc_get_order($wc_id);
        if (!$order) {
            return false;
        }
        $action = sanitize_key((string) ($payload['action'] ?? $payload['status'] ?? ''));
        $fulfillment = (string) $order->get_meta('_digikala_fulfillment');
        $shipment_id = (string) $order->get_meta('_digikala_shipment_id');

        if (in_array($action, ['cancelled', 'canceled', 'cancel'], true)) {
            return self::cancel_items($order, $payload, $job_id);
        }

        if ($fulfillment === 'seller' || $shipment_id !== '') {
            $next = self::sbs_status_from_woo($action);
            if ($next === '') {
                Storage::log('error', 'orders', 'Invalid SBS status', ['status' => $action, 'job_id' => $job_id]);
                return false;
            }
            $body = [
                'order_shipment_id' => (int) $shipment_id,
                'new_status' => $next,
            ];
            if (!empty($payload['verification_code'])) {
                $body['verification_code'] = (int) $payload['verification_code'];
            }
            $res = Client::request('PUT', Endpoints::SBS_UPDATE_STATUS, $body);
            if (is_wp_error($res)) {
                Storage::log('error', 'orders', 'SBS status push failed', ['error' => $res->get_error_message(), 'job_id' => $job_id]);
                return false;
            }
            $order->update_meta_data('_digikala_native_status', $next);
            $order->update_meta_data('_wnc_remote_status', $next);
            $order->save();
            return true;
        }

        // Digikala-fulfilled: seller cannot push arbitrary Woo statuses.
        Storage::log('info', 'orders', 'DK-fulfilled status push skipped (use cancel-item).', [
            'order_id' => $wc_id,
            'status' => $action,
            'job_id' => $job_id,
        ]);
        return $action === 'processing' || $action === 'completed';
    }

    private static function sbs_status_from_woo(string $action): string {
        $map = [
            'processing' => 'processing',
            'processed' => 'processed',
            'completed' => 'full_delivered_to_customer',
            'full_delivered_to_customer' => 'full_delivered_to_customer',
            'full_delivered' => 'full_delivered_to_customer',
        ];
        return $map[sanitize_key($action)] ?? '';
    }

    public static function cancel_items(\WC_Order $order, array $payload, int $job_id = 0): bool {
        $reason = (int) ($payload['cancellation_reason_id'] ?? $payload['reason_id'] ?? -1);
        $count = (int) ($payload['count'] ?? 0);
        $fulfillment = (string) $order->get_meta('_digikala_fulfillment');
        $shipment_id = (string) $order->get_meta('_digikala_shipment_id');
        $raw = json_decode((string) $order->get_meta('_digikala_order_items'), true);
        $items = is_array($raw) ? $raw : [];

        if ($fulfillment === 'seller' && $shipment_id !== '') {
            $item_id = (int) ($payload['item_id'] ?? 0);
            if ($item_id <= 0 && $items) {
                $first = reset($items);
                $item_id = (int) (is_array($first) ? ($first['id'] ?? $first['order_item_id'] ?? 0) : 0);
            }
            $res = Client::request('POST', Endpoints::SBS_CANCEL_ITEM, [
                'order_shipment_id' => (int) $shipment_id,
                'item_id' => $item_id,
                'reason_id' => $reason > 0 ? $reason : 1,
                'count' => max(1, $count),
            ]);
            if (is_wp_error($res)) {
                Storage::log('error', 'orders', 'SBS cancel failed', ['error' => $res->get_error_message(), 'job_id' => $job_id]);
                return false;
            }
            return true;
        }

        $ok = true;
        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }
            $item_id = (int) ($item['id'] ?? $item['order_item_id'] ?? 0);
            if ($item_id <= 0) {
                continue;
            }
            $body = ['cancellation_reason_id' => $reason];
            if ($count > 0) {
                $body['count'] = $count;
            }
            $path = str_replace('{order_item_id}', (string) $item_id, Endpoints::ORDER_ITEM);
            $res = Client::request('DELETE', $path, $body);
            if (is_wp_error($res)) {
                Storage::log('error', 'orders', 'cancel item failed', ['error' => $res->get_error_message(), 'item' => $item_id]);
                $ok = false;
            }
        }
        return $ok;
    }
}
