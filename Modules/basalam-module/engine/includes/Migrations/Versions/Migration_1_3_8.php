<?php

namespace WebinoBasalam\Migrations\Versions;

use WebinoBasalam\Activator;
use WebinoBasalam\Migrations\MigrationInterface;
use WebinoBasalam\Migrations\MigratorService;

defined('ABSPATH') || exit;
class Migration_1_3_8 implements MigrationInterface
{
    public function up()
    {
        $service = new MigratorService();

        Activator::activate();

        $service->addCreatedAtColumnToUploadedPhoto();
    }
}
