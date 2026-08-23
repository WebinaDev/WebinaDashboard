<?php

namespace WncBasalam;

use WncBasalam\Migrations\MigrationManager;
use WncBasalam\Registrar\AdminRegistrar;
use WncBasalam\Registrar\ListenerRegistrar;
use WncBasalam\Registrar\OrderRegistrar;
use WncBasalam\Registrar\ProductRegistrar;
use WncBasalam\Registrar\QueueRegistrar;
use WncBasalam\Services\Api\CircuitBreaker;
use WncBasalam\Services\FetchVersionDetail;

defined('ABSPATH') || exit;

class Plugin
{
    public const VERSION = '1.10.8';

    public function __construct()
    {
        $this->onboarding();
        $this->handleVersionUpdate();
        $this->registrars();
        $this->notices();
    }

    private function onboarding()
    {
        if (get_transient('wnc_basalam_just_activated')) {
            delete_transient('wnc_basalam_just_activated');
            if (!wncBasalamSettings()->hasToken()) {
                wp_safe_redirect(admin_url('admin.php?page=wnc_basalam-onboarding'));
                exit();
            }
        }
    }

    private function handleVersionUpdate()
    {
        $currentVersion = \get_option('wnc_basalam_engine_version') ?: '0.0.0';
        if (version_compare($currentVersion, self::VERSION, '<')) {

            $fetchVersionDetail = new FetchVersionDetail(self::VERSION);
            $fetchVersionDetail->checkForceUpdate();

            $manager = new MigrationManager();
            $manager->runMigrations($currentVersion, self::VERSION);
        }
    }

    private function notices()
    {
        if (!get_option('wnc_basalam_review_never_remind')) {
            add_action('admin_notices', function () {
                $template = wncBasalamPlugin()->templatePath("notifications/LikeAlert.php");
                require_once $template;
            });
        }

        if (!wncBasalamSettings()->hasToken()) {
            add_action('admin_notices', function () {
                $template = wncBasalamPlugin()->templatePath("notifications/AccessAlert.php");
                require_once($template);
            });
        }
        add_action('admin_notices', function () {
            $template = wncBasalamPlugin()->templatePath("notifications/HttpBlock.php");
            require_once($template);
        });
        add_action('admin_notices', function () {
            $circuitBreaker = new CircuitBreaker();

            if ($circuitBreaker->getState() === CircuitBreaker::STATE_CLOSED) return;

            $template = wncBasalamPlugin()->templatePath("notifications/CircuitBreakerAlert.php");
            require $template;
        });
    }

    private function registrars()
    {
        $registrars = [
            AdminRegistrar::class,
            ProductRegistrar::class,
            QueueRegistrar::class,
        ];

        $owns = ! class_exists( '\\WNC_Basalam_Runtime', false ) || \WNC_Basalam_Runtime::owns_runtime();
        if ( $owns ) {
            $registrars[] = OrderRegistrar::class;
            $registrars[] = ListenerRegistrar::class;
        }

        foreach ($registrars as $registrarClass) {
            $registrar = wncBasalamContainer()->get($registrarClass);
            $registrar->register();
        }
    }

    public function pluginPath()
    {
        // engine/includes/Plugin.php -> engine/
        return untrailingslashit(dirname(__DIR__));
    }

    public function templatePath($path = null)
    {
        $path = $path ? "/" . $path : null;
        return $this->pluginPath() . "/templates" . $path;
    }

    public function assetsUrl($path = null)
    {
        $engine_url = plugin_dir_url(dirname(__DIR__) . '/autoload.php');
        return $engine_url . "assets/" . $path;
    }

    public function getVersion()
    {
        return self::VERSION;
    }
}
