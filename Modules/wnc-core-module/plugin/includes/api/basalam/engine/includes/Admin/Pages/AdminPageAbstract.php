<?php

namespace WncBasalam\Admin\Pages;

use WncBasalam\Admin\Settings\SettingsConfig;

defined('ABSPATH') || exit;

abstract class AdminPageAbstract
{
    public $checkToken;

    public function render()
    {
        if ($this->checkToken == true && !$this->checkBasalamAccess()) {
            require_once(wncBasalamPlugin()->templatePath() . "/admin/main/NotConnected.php");
            return;
        }

        $instance = new static();
        $instance->renderContent();
    }

    public function checkBasalamAccess()
    {
        $token = wncBasalamSettings()->getSettings(SettingsConfig::TOKEN);
        $refreshToken = wncBasalamSettings()->getSettings(SettingsConfig::REFRESH_TOKEN);
        if ($token && $refreshToken) return true;
        else return false;
    }

    abstract protected function renderContent();
}
