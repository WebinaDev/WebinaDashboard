<?php

namespace WebinoBasalam\Migrations\Versions;

use WebinoBasalam\Activator;
use WebinoBasalam\Migrations\MigrationInterface;

defined('ABSPATH') || exit;
class Migration_1_4_0 implements MigrationInterface
{
    public function up()
    {
        Activator::activate();
    }
}
