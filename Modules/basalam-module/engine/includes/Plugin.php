<?php

namespace WebinoBasalam;

use WebinoBasalam\Migrations\MigrationManager;
use WebinoBasalam\Registrar\AdminRegistrar;
use WebinoBasalam\Registrar\ListenerRegistrar;
use WebinoBasalam\Registrar\OrderRegistrar;
use WebinoBasalam\Registrar\ProductRegistrar;
use WebinoBasalam\Registrar\QueueRegistrar;
use WebinoBasalam\Services\Api\CircuitBreaker;
use WebinoBasalam\Services\FetchVersionDetail;

defined('ABSPATH') || exit;

class Plugin
{
    public const VERSION = '1.10.8';

    public function __construct()
    {
        $this->onboarding();
        $this->handleVersionUpdate();
        $this->registrars();
        // Admin notices / announcements removed — use Webina Dashboard Basalam UI.
    }

    private function onboarding()
    {
        if (get_transient('webino_basalam_just_activated')) {
            delete_transient('webino_basalam_just_activated');
            if (!webinoBasalamSettings()->hasToken()) {
                wp_safe_redirect(admin_url('admin.php?page=webino_basalam-onboarding'));
                exit();
            }
        }
    }

    private function handleVersionUpdate()
    {
        $currentVersion = \get_option('webino_basalam_engine_version') ?: '0.0.0';
        if (version_compare($currentVersion, self::VERSION, '<')) {

            $fetchVersionDetail = new FetchVersionDetail(self::VERSION);
            $fetchVersionDetail->checkForceUpdate();

            $manager = new MigrationManager();
            $manager->runMigrations($currentVersion, self::VERSION);
        }
    }

    private function notices()
    {
        // Intentionally empty: no WP admin notices (Like/Access/HttpBlock/CircuitBreaker).
    }

    private function registrars()
    {
        $registrars = [
            AdminRegistrar::class,
            ProductRegistrar::class,
            OrderRegistrar::class,
            ListenerRegistrar::class,
            QueueRegistrar::class,
        ];

        foreach ($registrars as $registrarClass) {
            $registrar = webinoBasalamContainer()->get($registrarClass);
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
