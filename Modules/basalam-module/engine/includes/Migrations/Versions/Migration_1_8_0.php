<?php

namespace WebinoBasalam\Migrations\Versions;

use WebinoBasalam\Migrations\MigrationInterface;
use WebinoBasalam\Migrations\MigratorService;

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
