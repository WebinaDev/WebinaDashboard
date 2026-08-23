<?php
namespace WncDigikala\Sync;

use WncDigikala\Client;
use WncDigikala\Endpoints;
use WncDigikala\Storage;

defined('ABSPATH') || exit;

final class InventorySync {
    public static function sync(array $payload = [], int $job_id = 0): bool {
        $pid = (int) ($payload['product_id'] ?? 0);
        $ids = $pid > 0 ? [$pid] : [];
        if (!$ids) {
            return ProductSync::export($payload, $job_id);
        }
        return ProductSync::export(['product_ids' => $ids], $job_id);
    }

    public static function push_stock(int $variant_id, int $qty) {
        return Client::request('POST', Endpoints::BATCH_STOCK, [
            'deadline' => 300,
            'items' => [['variant_id' => $variant_id, 'payload' => ['seller_stock' => max(0, $qty)]]],
        ]);
    }
}
