<?php
/**
 * Torob port — adapted from official plugin 2.3.0.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Table access layer for the pending product page webhook queue.
 */
class WNC_Torob_Webhook_Queue_Repo
{
    const TABLE_SUFFIX = 'wnc_torob_pending_product_webhooks';
    const LEGACY_TABLE_SUFFIX = 'wnc_wnc_torob_pending_product_webhooks';

    /**
     * Get the full queue table name including the WordPress prefix.
     */
    public static function get_table_name(): string
    {
        global $wpdb;

        return $wpdb->prefix . self::TABLE_SUFFIX;
    }

    /**
     * Create or update the queue table schema via dbDelta.
     */
    public static function create_or_update_table_schema(): void
    {
        global $wpdb;

        $table_name = self::get_table_name();
        $legacy     = $wpdb->prefix . self::LEGACY_TABLE_SUFFIX;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $legacy_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $legacy ) ) === $legacy;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $new_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) === $table_name;
        if ( $legacy_exists && ! $new_exists ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query( "RENAME TABLE {$legacy} TO {$table_name}" );
        }

        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            product_id bigint unsigned NOT NULL,
            date_modified datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            page_url text NOT NULL,
            PRIMARY KEY  (product_id),
            INDEX date_modified (date_modified)
        ) {$charset_collate};";

        if (!function_exists('dbDelta')) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        \dbDelta($sql);
    }

    /**
     * Drop the queue table if it exists.
     */
    public static function drop_table(): void
    {
        global $wpdb;

        $table_name = self::get_table_name();

        // @mago-expect lint:no-db-schema-change
        $wpdb->query("DROP TABLE IF EXISTS {$table_name}");
    }

    /**
     * Insert or update a queued product with its webhook payload snapshot.
     */
    public static function upsert_queued_product(int $product_id, string $date_modified, string $page_url): bool
    {
        global $wpdb;

        $table_name = self::get_table_name();
        $result = $wpdb->query($wpdb->prepare(
            "INSERT INTO {$table_name} (product_id, date_modified, page_url)
            VALUES (%d, %s, %s)
            ON DUPLICATE KEY UPDATE
                date_modified = VALUES(date_modified),
                page_url = VALUES(page_url)",
            $product_id,
            $date_modified,
            $page_url
        ));

        return $result !== false;
    }

    /**
     * Fetch the next ready-to-send queue batch.
     *
     * @return array<int, object>
     */
    public static function get_ready_batch(string $current_time_gmt, int $debounce_seconds, int $limit): array
    {
        global $wpdb;

        $table_name = self::get_table_name();
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT product_id, page_url, date_modified FROM {$table_name}
\t\t\t\tWHERE date_modified <= DATE_SUB(%s, INTERVAL %d SECOND)
\t\t\t\tORDER BY date_modified ASC, product_id ASC
\t\t\t\tLIMIT %d",
            $current_time_gmt,
            $debounce_seconds,
            $limit
        ));

        return is_array($rows) ? $rows : [];
    }

    /**
     * Delete queue rows that still match the processed row timestamp.
     *
     * @param array<int, object> $rows
     */
    public static function delete_processed_rows(array $rows): void
    {
        global $wpdb;

        if (empty($rows)) {
            return;
        }

        $table_name = self::get_table_name();
        $where_parts = [];
        $values = [];

        foreach ($rows as $row) {
            $where_parts[] = '(product_id = %d AND date_modified = %s)';
            $values[] = (int) $row->product_id;
            $values[] = (string) $row->date_modified;
        }

        $wpdb->query($wpdb->prepare("DELETE FROM {$table_name} WHERE " . implode(' OR ', $where_parts), ...$values));
    }

    /**
     * Remove every queued row.
     */
    public static function clear(): void
    {
        global $wpdb;

        $table_name = self::get_table_name();
        if (!self::table_exists($table_name)) {
            return;
        }

        $wpdb->query("TRUNCATE TABLE {$table_name}");
    }

    /**
     * Count all queued rows.
     */
    public static function count_pending(): int
    {
        global $wpdb;

        $table_name = self::get_table_name();

        return (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");
    }

    /**
     * Fetch a paginated preview of queued rows joined with post titles.
     *
     * @return array<int, object>
     */
    public static function get_paginated_webhook_items(int $limit, int $offset): array
    {
        global $wpdb;

        $table_name = self::get_table_name();
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT queue.product_id, queue.page_url, queue.date_modified, posts.post_title, posts.post_status
                FROM {$table_name} AS queue
                LEFT JOIN {$wpdb->posts} AS posts ON posts.ID = queue.product_id
                ORDER BY queue.date_modified ASC
                LIMIT %d OFFSET %d",
            $limit,
            $offset
        ));

        return is_array($rows) ? $rows : [];
    }

    /**
     * Check whether the queue table exists.
     */
    public static function table_exists(?string $table_name = null): bool
    {
        global $wpdb;

        if ($table_name === null) {
            $table_name = self::get_table_name();
        }

        return $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table_name)) === $table_name;
    }
}
