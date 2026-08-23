<?php

namespace WncBasalam\Migrations\Versions;

use WncBasalam\Activator;
use WncBasalam\Migrations\MigrationInterface;
use WncBasalam\Migrations\MigratorService;

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
