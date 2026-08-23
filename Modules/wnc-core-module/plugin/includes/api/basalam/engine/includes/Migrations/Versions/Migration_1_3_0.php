<?php

namespace WncBasalam\Migrations\Versions;

use WncBasalam\Activator;
use WncBasalam\Migrations\MigrationInterface;
use WncBasalam\Migrations\MigratorService;

defined('ABSPATH') || exit;
class Migration_1_3_0 implements MigrationInterface
{
    public function up()
    {
        $service = new MigratorService();

        Activator::activate();

        $service->migratePayments();

        $service->migrateOptions();

        $service->migrateUploadedPhotos();

        $service->migratePostMeta();

        $service->migrateOptionsRows();

        $service->migrateSettings();

        $service->migrateActions();

        $service->renameOldTables();
    }
}
