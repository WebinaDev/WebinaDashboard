<?php

namespace WebinoBasalam\Infrastructure\Container;

use WebinoBasalam\Admin\Product\ProductOperations;
use WebinoBasalam\Admin\Settings\SettingsContainer;
use WebinoBasalam\JobManager;
use WebinoBasalam\Jobs\DiscountTaskScheduler;
use WebinoBasalam\Jobs\JobExecutor;
use WebinoBasalam\Jobs\JobRegistry;
use WebinoBasalam\Jobs\LockManager;
use WebinoBasalam\Jobs\Types\AutoConnectProductsJob;
use WebinoBasalam\Jobs\Types\BulkUpdateProductsJob;
use WebinoBasalam\Jobs\Types\CreateAllProductsJob;
use WebinoBasalam\Jobs\Types\CreateSingleProductJob;
use WebinoBasalam\Jobs\Types\FetchOrdersJob;
use WebinoBasalam\Jobs\Types\UpdateAllProductsJob;
use WebinoBasalam\Jobs\Types\UpdateSingleProductJob;
use WebinoBasalam\JobsRunner;
use WebinoBasalam\Services\CheckHttpBlockService;
use WebinoBasalam\Plugin;
use WebinoBasalam\Services\ApiServiceManager;
use WebinoBasalam\Services\Products\AutoConnectProducts;
use WebinoBasalam\Services\Products\Discount\DiscountTaskProcessor;
use WebinoBasalam\Services\Orders\FetchOrdersService;
use WebinoBasalam\Services\Orders\SyncOrderService;
use WebinoBasalam\Services\SystemResourceMonitor;

defined('ABSPATH') || exit;

class AppServiceProvider implements ServiceProviderInterface
{
    public function register(ContainerInterface $container): void
    {
        $container->singleton(SettingsContainer::class, function () {
            return new SettingsContainer();
        });

        $container->singleton(Plugin::class, function () {
            return new Plugin();
        });

        $container->singleton(JobManager::class, function () {
            return new JobManager();
        });

        $container->singleton(ApiServiceManager::class, function () {
            return $this->newInstance(ApiServiceManager::class);
        });

        $container->singleton(ProductOperations::class, function () {
            return $this->newInstance(ProductOperations::class);
        });

        $container->singleton(LockManager::class, function () {
            return new LockManager();
        });

        $container->singleton(SystemResourceMonitor::class, function () {
            return new SystemResourceMonitor();
        });

        $container->singleton(UpdateSingleProductJob::class, function (ContainerInterface $container) {
            return new UpdateSingleProductJob(
                $container->get(JobManager::class),
                $container->get(ProductOperations::class)
            );
        });

        $container->singleton(CreateSingleProductJob::class, function (ContainerInterface $container) {
            return new CreateSingleProductJob(
                $container->get(JobManager::class),
                $container->get(ProductOperations::class)
            );
        });

        $container->singleton(BulkUpdateProductsJob::class, function (ContainerInterface $container) {
            return new BulkUpdateProductsJob(
                $container->get(JobManager::class),
                $container->get(ApiServiceManager::class),
                $container->get(\WebinoBasalam\Admin\Product\ProductDataFactory::class),
                $container->get(SettingsContainer::class)
            );
        });

        $container->singleton(CreateAllProductsJob::class, function (ContainerInterface $container) {
            return new CreateAllProductsJob($container->get(JobManager::class));
        });

        $container->singleton(UpdateAllProductsJob::class, function (ContainerInterface $container) {
            return new UpdateAllProductsJob($container->get(JobManager::class));
        });

        $container->singleton(AutoConnectProducts::class, function () {
            return new AutoConnectProducts();
        });

        $container->singleton(AutoConnectProductsJob::class, function (ContainerInterface $container) {
            return new AutoConnectProductsJob(
                $container->get(JobManager::class),
                $container->get(AutoConnectProducts::class)
            );
        });

        $container->singleton(FetchOrdersService::class, function () {
            return new FetchOrdersService();
        });

        $container->singleton(SyncOrderService::class, function () {
            return new SyncOrderService();
        });

        $container->singleton(FetchOrdersJob::class, function (ContainerInterface $container) {
            return new FetchOrdersJob(
                $container->get(JobManager::class),
                $container->get(FetchOrdersService::class),
                $container->get(SyncOrderService::class)
            );
        });

        $container->singleton(JobRegistry::class, function (ContainerInterface $container) {
            return new JobRegistry([
                $container->get(BulkUpdateProductsJob::class),
                $container->get(UpdateAllProductsJob::class),
                $container->get(UpdateSingleProductJob::class),
                $container->get(CreateSingleProductJob::class),
                $container->get(CreateAllProductsJob::class),
                $container->get(AutoConnectProductsJob::class),
                $container->get(FetchOrdersJob::class),
            ]);
        });

        $container->singleton(JobExecutor::class, function (ContainerInterface $container) {
            return new JobExecutor(
                $container->get(JobManager::class),
                $container->get(LockManager::class),
                $container->get(JobRegistry::class)
            );
        });

        $container->singleton(DiscountTaskProcessor::class, function () {
            return new DiscountTaskProcessor();
        });

        $container->singleton(DiscountTaskScheduler::class, function (ContainerInterface $container) {
            return new DiscountTaskScheduler(
                $container->get(DiscountTaskProcessor::class)
            );
        });

        $container->singleton(JobsRunner::class, function (ContainerInterface $container) {
            return new JobsRunner(
                $container->get(JobManager::class),
                $container->get(JobExecutor::class),
                $container->get(DiscountTaskScheduler::class),
                $container->get(CheckHttpBlockService::class)
            );
        });
    }

    private function newInstance(string $class)
    {
        return new $class();
    }
}
