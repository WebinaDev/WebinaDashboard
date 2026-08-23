<?php

namespace WncBasalam\Actions\Controller\ProductActions;

use WncBasalam\Actions\Controller\ActionController;
use WncBasalam\JobManager;

defined('ABSPATH') || exit;

class CancelConnectAllProducts extends ActionController
{
    public function __invoke()
    {
        $jobManager = wncBasalamContainer()->get(JobManager::class);

        $jobManager->deleteJob(['job_type' => 'wnc_basalam_connect_single_product']);
        $jobManager->deleteJob(['job_type' => 'sync_basalam_auto_connect_products']);
    }
}
