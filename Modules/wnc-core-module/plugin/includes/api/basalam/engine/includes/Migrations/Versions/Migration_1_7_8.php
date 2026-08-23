<?php

namespace WncBasalam\Migrations\Versions;

use WncBasalam\Migrations\MigrationInterface;

defined('ABSPATH') || exit;

class Migration_1_7_8 implements MigrationInterface
{
    public function up()
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'wnc_basalam_job_manager';

        $this->addNewColumns($wpdb, $tableName);
        $this->removeProductOperationTypeSetting();
    }

    private function addNewColumns($wpdb, $tableName)
    {
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Migration schema change on own plugin table; identifier from $wpdb->prefix, not user input.
        $wpdb->query("ALTER TABLE {$tableName} ADD COLUMN attempts TINYINT UNSIGNED NOT NULL DEFAULT 0");
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Migration schema change on own plugin table; identifier from $wpdb->prefix, not user input.
        $wpdb->query("ALTER TABLE {$tableName} ADD COLUMN max_attempts TINYINT UNSIGNED NOT NULL DEFAULT 3");
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Migration schema change on own plugin table; identifier from $wpdb->prefix, not user input.
        $wpdb->query("ALTER TABLE {$tableName} ADD COLUMN failed_at INT NULL");
    }

    private function removeProductOperationTypeSetting()
    {
        $settings = (array) get_option('wnc_basalam_settings', []);

        if (is_array($settings) && isset($settings['product_operation_type'])) {
            unset($settings['product_operation_type']);
            update_option('wnc_basalam_settings', $settings);
        }
    }
}
