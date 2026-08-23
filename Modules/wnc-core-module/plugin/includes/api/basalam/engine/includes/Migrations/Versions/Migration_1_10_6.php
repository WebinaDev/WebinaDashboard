<?php

namespace WncBasalam\Migrations\Versions;

use WncBasalam\Migrations\MigrationInterface;
use WncBasalam\Migrations\MigratorService;

defined('ABSPATH') || exit;

class Migration_1_10_6 implements MigrationInterface
{
    public function up()
    {
        $service = new MigratorService();
        $service->repairDuplicateProductConnections();
    }
}
