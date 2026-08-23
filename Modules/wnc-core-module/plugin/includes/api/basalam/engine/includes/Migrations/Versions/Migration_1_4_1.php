<?php

namespace WncBasalam\Migrations\Versions;

use WncBasalam\Activator;
use WncBasalam\Migrations\MigrationInterface;

defined('ABSPATH') || exit;
class Migration_1_4_1 implements MigrationInterface
{
    public function up()
    {
        Activator::activate();
    }
}
