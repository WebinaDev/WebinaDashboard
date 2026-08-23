<?php

namespace WncBasalam\Migrations\Versions;

use WncBasalam\Migrations\MigrationInterface;
use WncBasalam\Migrations\MigratorService;

defined('ABSPATH') || exit;

class Migration_1_8_0 implements MigrationInterface
{
    public function up()
    {
        $service = new MigratorService();
        $service->addRetryAfterColumnToJobManager();
        $service->migrateProductMetaKeysToVendorId();
    }
}
