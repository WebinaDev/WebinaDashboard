<?php

namespace WebinoBasalam\Actions\Controller\ProductActions;

use WebinoBasalam\Queue\QueueManager;
use WebinoBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class CancelDebug extends ActionController
{
    public function __invoke()
    {
        QueueManager::cancelAllTasksGroup('sync_basalam_plugin_debug');
    }
}
