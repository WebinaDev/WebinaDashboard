<?php

namespace WebinoBasalam\Admin;

use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Admin\Settings\SettingsManager;
use WebinoBasalam\Admin\Settings\SettingsPageHandler;

defined('ABSPATH') || exit;

class Settings
{
    public static function getDefaultSettings()
    {
        return SettingsConfig::getDefaultSettings();
    }

    public static function sanitizeSettings($input)
    {
        return SettingsManager::sanitizeSettings($input);
    }

    public static function getSettings($setting = null)
    {
        return SettingsManager::getSettings($setting);
    }

    public static function updateSettings($data)
    {
        return SettingsManager::updateSettings($data);
    }

    public static function saveSettings()
    {
        return SettingsPageHandler::saveSettings();
    }

    public static function saveOauthData()
    {
        return SettingsPageHandler::handleOauthCallback();
    }

    public static function generateToken($length = 50)
    {
        return substr(bin2hex(random_bytes($length)), 0, $length);
    }

    public static function getEffectiveTasksPerMinute()
    {
        return SettingsManager::getEffectiveTasksPerMinute();
    }
}
