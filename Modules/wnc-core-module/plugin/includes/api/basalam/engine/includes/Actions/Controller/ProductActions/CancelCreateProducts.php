<?php

namespace WncBasalam\Actions\Controller\ProductActions;

use WncBasalam\JobManager;
use WncBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class CancelCreateProducts extends ActionController
{
    public function __invoke()
    {
        $jobManager = wncBasalamContainer()->get(JobManager::class);

        $jobTypes = [
            'sync_basalam_create_single_product',
            'sync_basalam_create_all_products',
        ];

        $deletedCount = 0;
        foreach ($jobTypes as $jobType) {
            $result = $jobManager->deleteJob([
                'job_type' => $jobType,
                'status'   => 'pending',
            ]);
            if ($result) {
                $deletedCount += $result;
            }

            $result = $jobManager->deleteJob([
                'job_type' => $jobType,
                'status'   => 'processing',
            ]);
            if ($result) {
                $deletedCount += $result;
            }
        }
        delete_option('wnc_basalam_last_creatable_product_id');
    }
}
