<?php

namespace WebinoBasalam\Migrations\Versions;

use WebinoBasalam\Migrations\MigrationInterface;
use WebinoBasalam\Migrations\MigratorService;

defined('ABSPATH') || exit;

class Migration_1_10_8 implements MigrationInterface
{
    public function up()
    {
        $service = new MigratorService();
        $service->backfillVariantSyncFields();
    }
}
