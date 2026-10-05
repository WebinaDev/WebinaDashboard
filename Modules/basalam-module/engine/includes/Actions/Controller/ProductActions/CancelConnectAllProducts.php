<?php

namespace WebinoBasalam\Actions\Controller\ProductActions;

use WebinoBasalam\Actions\Controller\ActionController;
use WebinoBasalam\JobManager;

defined('ABSPATH') || exit;

class CancelConnectAllProducts extends ActionController
{
    public function __invoke()
    {
        $jobManager = webinoBasalamContainer()->get(JobManager::class);

        $jobManager->deleteJob(['job_type' => 'webino_basalam_connect_single_product']);
        $jobManager->deleteJob(['job_type' => 'sync_basalam_auto_connect_products']);
    }
}
