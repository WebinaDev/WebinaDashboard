<?php

namespace WebinoBasalam\Jobs;

use WebinoBasalam\JobManager;
use WebinoBasalam\Jobs\Exceptions\JobException;
use WebinoBasalam\Services\Api\CircuitBreakerOpenException;

defined('ABSPATH') || exit;

class JobExecutor
{
    private $jobManager;
    private $lockManager;
    private $jobRegistry;

    public function __construct(JobManager $jobManager, LockManager $lockManager, JobRegistry $jobRegistry)
    {
        $this->jobManager = $jobManager;
        $this->lockManager = $lockManager;
        $this->jobRegistry = $jobRegistry;
    }

    public function execute(string $jobType, object $job): bool
    {
        $jobExecutor = $this->jobRegistry->get($jobType);

        if (!$jobExecutor) return false;

        $payload = json_decode($job->payload, true);

        if (!is_array($payload)) {
            $payload = $this->normalizeLegacyPayload($jobType, $payload);
        }

        try {
            $result = $jobExecutor->execute($payload);

            if ($result instanceof JobResult) return $this->handleJobResult($job, $result);
            $this->jobManager->completeJob((int) $job->id, null);
            return true;
        } catch (CircuitBreakerOpenException $e) {
            // Circuit is open — reschedule without counting as a failure.
            return $this->jobManager->retryJob($job->id, $e->getMessage());
        } catch (JobException $e) {
            return $this->handleJobException($job, $e);
        } catch (\Exception $e) {
            $this->jobManager->failJob($job->id, $e->getMessage());
            return false;
        }
    }

    private function handleJobResult(object $job, JobResult $result): bool
    {
        if ($result->isSuccessful()) {
            $summary = '';
            $data = $result->getData();
            if (is_array($data) && array() !== $data) {
                $encoded = wp_json_encode($data, JSON_UNESCAPED_UNICODE);
                $summary = is_string($encoded) ? $encoded : '';
            }
            $this->jobManager->completeJob((int) $job->id, $summary !== '' ? $summary : null);
            if (method_exists($this->jobManager, 'pruneCompletedJobs')) {
                $this->jobManager->pruneCompletedJobs(7 * DAY_IN_SECONDS);
            }
            return true;
        }

        if ($result->shouldRetry()) {
            $retried = $this->jobManager->retryJob($job->id, $result->getErrorMessage());

            return $retried;
        }

        $this->jobManager->failJob($job->id, $result->getErrorMessage());
        return false;
    }

    private function handleJobException(object $job, JobException $exception): bool
    {
        if ($exception->shouldRetry()) {
            $retried = $this->jobManager->retryJob($job->id, $exception->getMessage());

            return $retried;
        }

        $this->jobManager->failJob($job->id, $exception->getMessage());
        return false;
    }

    private function normalizeLegacyPayload(string $jobType, $legacyPayload): array
    {
        switch ($jobType) {
            case 'sync_basalam_update_single_product':
            case 'sync_basalam_create_single_product':
                return ['product_id' => $legacyPayload];

            case 'sync_basalam_bulk_update_products':
            case 'sync_basalam_update_all_products':
                return ['last_updatable_product_id' => $legacyPayload];

            case 'sync_basalam_create_all_products':
                return ['include_out_of_stock' => false, 'posts_per_page' => 100];

            default:
                return [];
        }
    }

    public function getSortedJobTypes(): array
    {
        return $this->jobRegistry->getSortedByPriority();
    }

    public function canRun(string $jobType): bool
    {
        $jobExecutor = $this->jobRegistry->get($jobType);

        if (!$jobExecutor) return false;

        return $jobExecutor->canRun();
    }

    public function acquireLock(string $jobType, int $timeout = 0): bool
    {
        return $this->lockManager->acquire($jobType, $timeout);
    }

    public function releaseLock(string $jobType): bool
    {
        return $this->lockManager->release($jobType);
    }

    public function acquireGlobalJobsLock(int $timeout = 0): bool
    {
        return $this->lockManager->acquireGlobalJobsLock($timeout);
    }

    public function releaseGlobalJobsLock(): bool
    {
        return $this->lockManager->releaseGlobalJobsLock();
    }
}
