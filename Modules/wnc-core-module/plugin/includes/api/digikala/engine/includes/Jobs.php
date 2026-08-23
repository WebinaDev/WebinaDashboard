<?php
namespace WncDigikala;

defined('ABSPATH') || exit;

final class Jobs {
    public static function enqueue(string $type, array $payload = [], int $delay = 0): int {
        global $wpdb;
        $now = time();
        $wpdb->insert(Storage::table('jobs'), [
            'job_type' => $type,
            'status' => 'pending',
            'payload' => wp_json_encode($payload),
            'attempts' => 0,
            'scheduled_at' => gmdate('Y-m-d H:i:s', $now + $delay),
            'created_at' => gmdate('Y-m-d H:i:s', $now),
            'updated_at' => gmdate('Y-m-d H:i:s', $now),
        ]);
        return (int) $wpdb->insert_id;
    }

    public static function process_due(int $limit = 5): void {
        if (!Runtime::owns_runtime()) {
            return;
        }
        global $wpdb;
        $table = Storage::table('jobs');
        $now = gmdate('Y-m-d H:i:s');
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table} WHERE status='pending' AND (scheduled_at IS NULL OR scheduled_at <= %s) ORDER BY id ASC LIMIT %d",
            $now,
            $limit
        ), ARRAY_A);
        if (!$rows) {
            return;
        }
        foreach ($rows as $row) {
            $id = (int) $row['id'];
            $wpdb->update($table, ['status' => 'processing', 'updated_at' => $now], ['id' => $id]);
            $payload = json_decode((string) $row['payload'], true);
            if (!is_array($payload)) {
                $payload = [];
            }
            try {
                $ok = self::dispatch((string) $row['job_type'], $payload, $id);
                $wpdb->update($table, [
                    'status' => $ok ? 'completed' : 'failed',
                    'updated_at' => gmdate('Y-m-d H:i:s'),
                    'error_message' => $ok ? null : 'job returned false',
                ], ['id' => $id]);
            } catch (\Throwable $e) {
                $wpdb->update($table, [
                    'status' => 'failed',
                    'attempts' => ((int) $row['attempts']) + 1,
                    'error_message' => $e->getMessage(),
                    'updated_at' => gmdate('Y-m-d H:i:s'),
                ], ['id' => $id]);
            }
        }
    }

    private static function dispatch(string $type, array $payload, int $job_id): bool {
        switch ($type) {
            case 'product_import':
                return Sync\ProductSync::import($payload, $job_id);
            case 'product_export':
                return Sync\ProductSync::export($payload, $job_id);
            case 'inventory_sync':
                return Sync\InventorySync::sync($payload, $job_id);
            case 'orders_pull':
                return Sync\OrderSync::pull($payload, $job_id);
            case 'order_push_status':
                return Sync\OrderSync::push_status($payload, $job_id);
            default:
                Storage::log('warning', 'jobs', 'Unknown job type', ['type' => $type]);
                return false;
        }
    }
}
