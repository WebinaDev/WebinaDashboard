<?php
namespace WebinoDigikala\Sync;

use WebinoDigikala\Client;
use WebinoDigikala\Endpoints;
use WebinoDigikala\Settings;
use WebinoDigikala\Storage;

defined('ABSPATH') || exit;

final class ProductSync {
    public static function search(array $args = []): array {
        $query = [
            'page' => (int) ($args['page'] ?? 1),
            'size' => (int) ($args['per_page'] ?? $args['size'] ?? 50),
        ];
        if (!empty($args['keyword'])) {
            $query['search[search]'] = sanitize_text_field((string) $args['keyword']);
        }
        $res = Client::request('GET', Endpoints::VARIANTS, null, $query);
        if (is_wp_error($res)) {
            return [];
        }
        $items = (array) ($res['data']['items'] ?? $res['data'] ?? []);
        $out = [];
        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $out[] = [
                'id' => (string) ($item['product_id'] ?? $item['product']['id'] ?? ''),
                'variant_id' => (string) ($item['id'] ?? $item['product_variant_id'] ?? ''),
                'title' => (string) ($item['product_title'] ?? $item['title'] ?? ''),
                'price' => (int) ($item['selling_price'] ?? $item['price'] ?? 0),
                'stock' => (int) ($item['seller_stock'] ?? $item['selling_stock'] ?? 0),
                'raw' => $item,
            ];
        }
        return $out;
    }

    public static function import(array $payload = [], int $job_id = 0): bool {
        $keyword = sanitize_text_field((string) ($payload['keyword'] ?? ' '));
        $res = Client::request('GET', Endpoints::PRODUCT_SEARCH, null, ['search[keyword]' => $keyword]);
        if (is_wp_error($res)) {
            Storage::log('error', 'product', 'import failed', ['error' => $res->get_error_message(), 'job_id' => $job_id]);
            return false;
        }
        if (!class_exists('WC_Product_Simple')) {
            return false;
        }
        $items = (array) ($res['data']['items'] ?? []);
        $created = 0;
        global $wpdb;
        $map = Storage::table('product_map');
        foreach (array_slice($items, 0, 50) as $item) {
            if (!is_array($item)) continue;
            $title = sanitize_text_field((string) ($item['title'] ?? ''));
            if ($title === '') continue;
            $product = new \WC_Product_Simple();
            $product->set_name($title);
            $product->set_status('draft');
            $product->set_regular_price((string) max(0, (int) ($item['market_price'] ?? 0)));
            $product->set_sku('dk-' . sanitize_title((string) ($item['id'] ?? uniqid('x', true))));
            $pid = $product->save();
            if ($pid <= 0) continue;
            $wpdb->replace($map, [
                'wc_product_id' => $pid,
                'wc_variation_id' => 0,
                'dk_product_id' => (string) ($item['id'] ?? ''),
                'dk_variant_id' => '',
                'last_sync_at' => gmdate('Y-m-d H:i:s'),
            ]);
            $created++;
        }
        Storage::log('info', 'product', 'import done', ['created' => $created, 'job_id' => $job_id]);
        return true;
    }

    public static function export(array $payload = [], int $job_id = 0): bool {
        $ids = !empty($payload['product_ids']) && is_array($payload['product_ids'])
            ? array_map('intval', $payload['product_ids'])
            : [];
        if (!$ids && function_exists('wc_get_products')) {
            $ids = wc_get_products(['status' => ['publish'], 'limit' => 50, 'return' => 'ids']);
        }
        global $wpdb;
        $map = Storage::table('product_map');
        $credit = (int) Settings::get('credit_increase_percentage', 0);
        $ok = 0;
        foreach ($ids as $pid) {
            $product = wc_get_product($pid);
            if (!$product) {
                continue;
            }
            $pairs = [[(int) $pid, 0]];
            if ($product->is_type('variable')) {
                foreach ($product->get_children() as $vid) {
                    $pairs[] = [(int) $pid, (int) $vid];
                }
            }
            foreach ($pairs as $pair) {
                if (class_exists('\\Digikala_Product_Map')) {
                    $r = \Digikala_Product_Map::sync_price_stock($pair[0], $pair[1]);
                    if (!is_wp_error($r)) {
                        $ok++;
                    }
                    continue;
                }
                $row = $wpdb->get_row($wpdb->prepare(
                    "SELECT * FROM {$map} WHERE wc_product_id=%d AND wc_variation_id=%d LIMIT 1",
                    $pair[0],
                    $pair[1]
                ), ARRAY_A);
                if (!$row || empty($row['dk_variant_id'])) {
                    continue;
                }
                $target = $pair[1] > 0 ? $pair[1] : $pair[0];
                $p = wc_get_product($target);
                if (!$p) {
                    continue;
                }
                $price_val = 0.0;
                if (class_exists('WNC_Pricing')) {
                    $price_val = (float) \WNC_Pricing::get_price($target, 'digikala');
                    $price = (int) \WNC_Pricing::to_remote_unit($price_val, 'digikala');
                } else {
                    $price = (int) round((float) $p->get_regular_price() * 10);
                }
                $variant_id = (int) $row['dk_variant_id'];
                $res = Client::request('PATCH', Endpoints::SELLING_PRICE, [
                    'variant_id' => $variant_id,
                    'selling_price' => $price,
                    'credit_increase_percentage' => max(0, $credit),
                ]);
                if (is_wp_error($res)) {
                    Client::request('POST', Endpoints::BATCH_VARIANT_UPDATE, [
                        'deadline' => 300,
                        'items' => [['variant_id' => $variant_id, 'payload' => ['selling_price' => $price]]],
                    ]);
                }
                $qty = max(0, (int) $p->get_stock_quantity());
                Client::request('POST', Endpoints::BATCH_STOCK, [
                    'deadline' => 300,
                    'items' => [['variant_id' => $variant_id, 'payload' => ['seller_stock' => $qty]]],
                ]);
                $ok++;
            }
        }
        Storage::log('info', 'product', 'export done', ['synced' => $ok, 'job_id' => $job_id]);
        return true;
    }
}
