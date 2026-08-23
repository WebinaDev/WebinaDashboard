<?php
namespace WncDigikala;

defined('ABSPATH') || exit;

final class Storage {
    const DB_VERSION_OPT = 'wnc_dk_db_version';
    const DB_VERSION = '2.0.0';

    public static function table(string $suffix): string {
        global $wpdb;
        return $wpdb->prefix . 'wnc_dk_' . $suffix;
    }

    public static function ensure_schema(): void {
        if ((string) get_option(self::DB_VERSION_OPT, '') === self::DB_VERSION) {
            return;
        }
        global $wpdb;
        $charset = $wpdb->get_charset_collate();
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $jobs = self::table('jobs');
        $logs = self::table('logs');
        $conn = self::table('connections');
        $prod = self::table('product_map');
        $order = self::table('order_map');
        dbDelta("CREATE TABLE {$conn} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            client_code varchar(191) NOT NULL DEFAULT '',
            access_token longtext NULL,
            refresh_token longtext NULL,
            access_expires_at datetime NULL,
            refresh_expires_at datetime NULL,
            scopes longtext NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY (id)
        ) {$charset};");
        dbDelta("CREATE TABLE {$prod} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            wc_product_id bigint(20) unsigned NOT NULL,
            wc_variation_id bigint(20) unsigned NULL,
            dk_product_id varchar(100) NOT NULL DEFAULT '',
            dk_variant_id varchar(100) NOT NULL DEFAULT '',
            last_sync_at datetime NULL,
            PRIMARY KEY (id),
            UNIQUE KEY wc_variant (wc_product_id,wc_variation_id),
            KEY dk_product (dk_product_id,dk_variant_id)
        ) {$charset};");
        dbDelta("CREATE TABLE {$order} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            wc_order_id bigint(20) unsigned NOT NULL,
            dk_order_id varchar(100) NOT NULL DEFAULT '',
            last_sync_at datetime NULL,
            PRIMARY KEY (id),
            UNIQUE KEY wc_order (wc_order_id),
            KEY dk_order (dk_order_id)
        ) {$charset};");
        dbDelta("CREATE TABLE {$jobs} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            job_type varchar(100) NOT NULL,
            status varchar(32) NOT NULL DEFAULT 'pending',
            payload longtext NULL,
            attempts int NOT NULL DEFAULT 0,
            error_message text NULL,
            scheduled_at datetime NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY status_type (status, job_type)
        ) {$charset};");
        dbDelta("CREATE TABLE {$logs} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            level varchar(16) NOT NULL DEFAULT 'info',
            channel varchar(64) NOT NULL DEFAULT 'digikala',
            message text NOT NULL,
            context longtext NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY created (created_at)
        ) {$charset};");
        update_option(self::DB_VERSION_OPT, self::DB_VERSION);
        if (get_option(Settings::OPTION, null) === null) {
            update_option(Settings::OPTION, Settings::defaults(), false);
        }
    }

    public static function persist_connection_tokens(array $data, array $settings): void {
        global $wpdb;
        $table = self::table('connections');
        $now = gmdate('Y-m-d H:i:s');
        $access_exp = !empty($data['access_token_expires_at'])
            ? gmdate('Y-m-d H:i:s', Auth::parse_expiry($data['access_token_expires_at']))
            : gmdate('Y-m-d H:i:s', time() + HOUR_IN_SECONDS);
        $refresh_exp = !empty($data['refresh_token_expires_at'])
            ? gmdate('Y-m-d H:i:s', Auth::parse_expiry($data['refresh_token_expires_at']))
            : gmdate('Y-m-d H:i:s', time() + (6 * MONTH_IN_SECONDS));
        $wpdb->insert($table, [
            'client_code' => (string) ($settings['client_code'] ?? ''),
            'access_token' => (string) ($data['access_token'] ?? ''),
            'refresh_token' => (string) ($data['refresh_token'] ?? ''),
            'access_expires_at' => $access_exp,
            'refresh_expires_at' => $refresh_exp,
            'scopes' => wp_json_encode($data['scopes'] ?? []),
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public static function log(string $level, string $channel, string $message, array $context = []): void {
        global $wpdb;
        $wpdb->insert(self::table('logs'), [
            'level' => $level,
            'channel' => $channel,
            'message' => $message,
            'context' => wp_json_encode($context),
            'created_at' => gmdate('Y-m-d H:i:s'),
        ]);
    }
}
