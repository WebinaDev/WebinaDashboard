<?php

namespace WncBasalam\Actions\Controller\ProductActions;

use WncBasalam\Queue\QueueManager;
use WncBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class CancelDebug extends ActionController
{
    public function __invoke()
    {
        QueueManager::cancelAllTasksGroup('sync_basalam_plugin_debug');
    }
}
